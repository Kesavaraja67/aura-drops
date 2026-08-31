"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ShieldCheck, Zap } from "lucide-react";
import { Product, CheckoutResult } from "@/types/store";
import {
  createPaymentOrder,
  verifyPaymentSignature,
  fetchOrderSummary,
  reportOrderTotalMismatch,
  CONFIGURED_RAZORPAY_KEY,
} from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { BlobButton } from "./BlobButton";

interface ProductCardProps {
  product: Product;
  onCheckoutComplete: (result: CheckoutResult) => void;
  onError: (msg: string) => void;
}

export function ProductCard({ product, onCheckoutComplete, onError }: ProductCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{ feePaise: number; totalPaise: number } | null>(null);

  // Call the storefront's server-side /api/order-summary route on mount
  useEffect(() => {
    let mounted = true;
    async function loadSummary() {
      try {
        const summary = await fetchOrderSummary(product.pricePaise);
        if (mounted) {
          setOrderSummary({
            feePaise: summary.fee_paise,
            totalPaise: summary.total_paise,
          });
        }
      } catch {
        // Handled silently by api helper fallback
      }
    }
    loadSummary();
    return () => {
      mounted = false;
    };
  }, [product.pricePaise]);

  const chargePaise = orderSummary ? orderSummary.totalPaise : product.pricePaise;

  const handleBuyNow = async () => {
    try {
      setIsProcessing(true);

      // Step 1: Ensure we have latest order summary from server route
      const summary = await fetchOrderSummary(product.pricePaise);
      const finalAmountPaise = summary.total_paise; // ← may be Math.trunc'd (buggy)

      // ── Mismatch Detection Bridge ─────────────────────────────────────────────
      // Compute what the CORRECT total should be using Math.round (the right way),
      // then compare against what the /api/order-summary route actually returned.
      // The route has a deliberate Math.trunc defect so for non-whole-number fees
      // (e.g. 12345 × 0.02 = 246.9) the totals will differ by 1 paise.
      const FEE_RATE = 0.02;
      const expectedFeePaise = Math.round(product.pricePaise * FEE_RATE);
      const expectedTotalPaise = product.pricePaise + expectedFeePaise;
      const actualTotalPaise = summary.total_paise;

      // Step 2: Call Telex backend to create Razorpay Order & PaymentAttempt
      // We use the ACTUAL (possibly buggy) total so the PaymentAttempt.amount on
      // the backend matches actualTotalPaise — required by /report-mismatch validation.
      const orderData = await createPaymentOrder(actualTotalPaise);

      // ── Report mismatch to Telex if detected ──────────────────────────────────
      // Fires asynchronously so it never blocks the user's checkout flow.
      if (expectedTotalPaise !== actualTotalPaise && orderData.payment_attempt_id) {
        console.warn(
          `[Aura] Fee rounding mismatch detected! expected=${expectedTotalPaise} actual=${actualTotalPaise} — reporting to Telex`
        );
        reportOrderTotalMismatch({
          payment_attempt_id: orderData.payment_attempt_id,
          expected_total_paise: expectedTotalPaise,
          actual_total_paise: actualTotalPaise,
        });
        // ^ Fire-and-forget: Telex handles code_defect → AI patch pipeline
      }

      // Determine public Razorpay key ID
      const keyId = orderData.key_id || CONFIGURED_RAZORPAY_KEY;

      if (!keyId) {
        throw new Error(
          "Razorpay Public Key ID is missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in environment."
        );
      }

      // Step 3: Open Razorpay Checkout.js client-side modal (Path A)
      await openRazorpayCheckout({
        keyId,
        orderId: orderData.order_id,
        amountPaise: finalAmountPaise,
        productName: product.name,
        customerName: "Alex Rivera",
        customerEmail: "alex.rivera@vortex-drops.com",
        customerPhone: "+919876543210",
        onSuccess: async (resp) => {
          try {
            // Step 4: P0 Fix - Server-Side Signature Verification
            const verifyResult = await verifyPaymentSignature({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              payment_attempt_id: orderData.payment_attempt_id,
            });

            setIsProcessing(false);

            if (verifyResult.valid) {
              onCheckoutComplete({
                status: "success",
                productName: product.name,
                amount: Math.round(finalAmountPaise / 100),
                orderId: orderData.order_id,
                paymentAttemptId: orderData.payment_attempt_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                timestamp: new Date().toISOString(),
                isSimulated: false,
              });
            } else {
              onCheckoutComplete({
                status: "failed",
                productName: product.name,
                amount: Math.round(finalAmountPaise / 100),
                orderId: orderData.order_id,
                paymentAttemptId: orderData.payment_attempt_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                timestamp: new Date().toISOString(),
                isSimulated: false,
                errorMessage:
                  verifyResult.message || "Payment signature could not be verified by Telex backend.",
              });
            }
          } catch (verr: any) {
            setIsProcessing(false);
            onCheckoutComplete({
              status: "failed",
              productName: product.name,
              amount: Math.round(finalAmountPaise / 100),
              orderId: orderData.order_id,
              paymentAttemptId: orderData.payment_attempt_id,
              timestamp: new Date().toISOString(),
              isSimulated: false,
              errorMessage:
                verr.message || "Payment signature verification failed. Please contact support.",
            });
          }
        },
        onDismiss: () => {
          setIsProcessing(false);
          onCheckoutComplete({
            status: "dismissed",
            productName: product.name,
            amount: Math.round(finalAmountPaise / 100),
            orderId: orderData.order_id,
            paymentAttemptId: orderData.payment_attempt_id,
            timestamp: new Date().toISOString(),
            isSimulated: false,
            errorMessage:
              "Checkout widget closed. If a test decline card was used, Razorpay has dispatched a webhook to Telex Engine B.",
          });
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      onError(err.message || "Failed to initialize checkout.");
    }
  };

  const getBadgeStyle = () => {
    switch (product.badgeColor) {
      case "mustard":
        return "bg-[#FFD750] text-[#4C0016]";
      case "maroon":
        return "bg-[#4C0016] text-[#F5E3CD]";
      case "green":
        return "bg-[#60A905] text-white";
      case "red":
      default:
        return "bg-[#F91814] text-[#F5E3CD]";
    }
  };

  return (
    <div className="flex flex-col bg-[#FFF9F2] rounded-3xl border-4 border-[#4C0016] overflow-hidden shadow-[0_8px_16px_rgba(76,0,22,0.1)] hover:shadow-[0_16px_28px_rgba(76,0,22,0.18)] transition-all duration-300 transform hover:-translate-y-1">
      {/* Top Image Container with transparent background */}
      <div className="relative w-full aspect-square bg-[#F5E3CD]/40 p-4 flex items-center justify-center border-b-4 border-[#4C0016] overflow-hidden group">
        <div className="relative w-full h-full sticker-item">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Sticker Badge */}
        {product.badge && (
          <div
            className={`absolute top-3 left-3 font-modak text-xs sm:text-sm px-3 py-0.5 rounded-full border-2 border-[#4C0016] rotate-[-6deg] shadow-md ${getBadgeStyle()}`}
          >
            {product.badge}
          </div>
        )}

        {/* Rating pill */}
        <div className="absolute bottom-3 right-3 bg-white/95 border-2 border-[#4C0016] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs font-mouse-memoirs text-xs text-[#4C0016]">
          <Star className="w-3 h-3 fill-[#FFD750] text-[#4C0016]" />
          <span>{product.rating}</span>
          <span className="text-[#4C0016]/60">({product.reviewsCount})</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-modak text-xl sm:text-2xl text-[#F91814] text-stroke-maroon-sm leading-tight">
            {product.name}
          </h3>
          <p className="font-mouse-memoirs text-sm text-[#4C0016]/80 mt-0.5 leading-snug">
            {product.tagline}
          </p>

          {/* Features list */}
          <div className="mt-3 pt-2.5 border-t-2 border-[#4C0016]/10 space-y-1">
            {product.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-[#4C0016]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F91814] shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t-2 border-[#4C0016]/10 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-modak text-2xl sm:text-3xl text-[#4C0016] tracking-tight">
                ₹{Math.round(chargePaise / 100).toLocaleString("en-IN")}
              </span>
              <span className="font-mouse-memoirs text-xs text-[#4C0016]/60 ml-1">
                {orderSummary ? `(₹${product.price} + 2% fee)` : "(TAXES INCL)"}
              </span>
            </div>
            <span className="font-mouse-memoirs text-xs uppercase px-2 py-0.5 rounded-full bg-[#60A905]/15 text-[#60A905] border border-[#60A905] font-bold">
              In Stock
            </span>
          </div>

          {/* Blob Checkout Button */}
          <BlobButton
            onClick={handleBuyNow}
            isLoading={isProcessing}
            variant="red"
            size="md"
            className="w-full"
          >
            <span>BUY NOW (PATH A)</span>
          </BlobButton>

          {/* Footnote */}
          <div className="flex items-center justify-between text-[10px] font-mono font-medium text-[#4C0016]/60 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#60A905]" />
              Verified Signature
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#F4A804]" />
              Webhook Pipeline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
