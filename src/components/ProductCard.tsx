"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, CheckCircle, ShieldCheck, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Product, CheckoutResult } from "@/types/store";
import { createPaymentOrder, FALLBACK_RAZORPAY_KEY, verifyPaymentSignature } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";

interface ProductCardProps {
  product: Product;
  onCheckoutComplete: (result: CheckoutResult) => void;
  onError: (msg: string) => void;
}

export function ProductCard({ product, onCheckoutComplete, onError }: ProductCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async () => {
    try {
      setIsProcessing(true);

      // Step 1: Call Telex backend to create Razorpay Order & PaymentAttempt
      const orderData = await createPaymentOrder(product.pricePaise);

      // Determine public Razorpay key ID (from backend response or env fallback)
      const keyId = orderData.key_id || FALLBACK_RAZORPAY_KEY;

      if (!keyId) {
        throw new Error(
          "Razorpay Key ID was not returned by the backend create-order response or NEXT_PUBLIC_RAZORPAY_KEY_ID."
        );
      }

      // Step 2: Open Razorpay Checkout.js client-side modal (Path A)
      // Note: We deliberately do NOT call /api/payments/pay/{id} here.
      // Payment status updates asynchronously via Razorpay's webhook arriving at the Telex backend.
      await openRazorpayCheckout({
        keyId,
        orderId: orderData.order_id,
        amountPaise: product.pricePaise,
        productName: product.name,
        onSuccess: async (resp) => {
          const verification = await verifyPaymentSignature({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            payment_attempt_id: orderData.payment_attempt_id,
          });

          setIsProcessing(false);

          if (!verification.valid) {
            onCheckoutComplete({
              status: "dismissed",
              productName: product.name,
              amount: product.price,
              orderId: orderData.order_id,
              paymentAttemptId: orderData.payment_attempt_id,
              timestamp: new Date().toISOString(),
              isSimulated: false,
              errorMessage: verification.message || "Payment signature could not be verified.",
            });
            return;
          }

          onCheckoutComplete({
            status: "success",
            productName: product.name,
            amount: product.price,
            orderId: orderData.order_id,
            paymentAttemptId: orderData.payment_attempt_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            timestamp: new Date().toISOString(),
            isSimulated: false,
          });
        },
        onDismiss: () => {
          setIsProcessing(false);
          onCheckoutComplete({
            status: "dismissed",
            productName: product.name,
            amount: product.price,
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

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden group">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority
        />
        {product.badge && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700">{product.rating}</span>
            <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
          </div>

          {/* Title & Tagline */}
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{product.name}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{product.tagline}</p>

          {/* Features */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
            {product.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-extrabold text-slate-900">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-xs text-slate-400 ml-1.5">incl. taxes</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              In Stock
            </span>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={isProcessing}
            className="w-full relative flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                <span>Opening Razorpay...</span>
              </>
            ) : (
              <>
                <span>Buy now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Trust badges */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Razorpay Secured
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              Path A (Real Mode)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
