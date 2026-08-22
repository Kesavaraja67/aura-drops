"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";
import { CheckoutResult } from "@/types/store";
import { TELEX_DASHBOARD_URL, fetchPaymentAttemptRecoveryEvents } from "@/lib/api";
import { BlobButton } from "./BlobButton";

interface CheckoutModalProps {
  result: CheckoutResult | null;
  onClose: () => void;
}

type RecoveryStage =
  | "submitted"
  | "verifying_signature"
  | "awaiting_telex"
  | "confirmed"
  | "recovering"
  | "stopped"
  | "escalated";

export function CheckoutModal({ result, onClose }: CheckoutModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [stage, setStage] = useState<RecoveryStage>("submitted");
  const [events, setEvents] = useState<any[]>([]);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!result) return;

    // Initial sequence progression
    setStage("submitted");
    setEvents([]);
    setPollCount(0);

    const timer1 = setTimeout(() => {
      setStage("verifying_signature");
    }, 800);

    const timer2 = setTimeout(() => {
      setStage("awaiting_telex");
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [result]);

  // Periodic polling for Telex recovery events
  useEffect(() => {
    if (!result || !result.paymentAttemptId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const { events: fetchedEvents, latestStatus } = await fetchPaymentAttemptRecoveryEvents(
          result.paymentAttemptId
        );

        if (!isMounted) return;

        if (fetchedEvents.length > 0) {
          setEvents(fetchedEvents);
          const statusLower = (latestStatus || "").toLowerCase();
          if (statusLower.includes("escalat") || statusLower.includes("code_defect") || statusLower.includes("pr_opened")) {
            setStage("escalated");
          } else if (statusLower.includes("recover") || statusLower.includes("retry") || statusLower.includes("healing")) {
            setStage("recovering");
          } else if (statusLower.includes("stop") || statusLower.includes("failed") || statusLower.includes("manual")) {
            setStage("stopped");
          } else if (statusLower.includes("success") || statusLower.includes("captured") || statusLower.includes("confirm")) {
            setStage("confirmed");
          }
        } else {
          setPollCount((prev) => {
            if (prev > 3 && stage === "awaiting_telex") {
              if (result.status === "success") {
                setStage("confirmed");
              } else if (result.isSimulated) {
                setStage("recovering");
              } else {
                setStage("stopped");
              }
            }
            return prev + 1;
          });
        }
      } catch {
        // Polling failure gracefully handled
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [result, stage]);

  if (!result) return null;

  const isSuccess = result.status === "success";
  const isSimulated = result.isSimulated;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dashboardIncidentUrl = `${TELEX_DASHBOARD_URL}?attempt_id=${result.paymentAttemptId}`;

  const getStageBadge = () => {
    switch (stage) {
      case "submitted":
        return { label: "1. PAYMENT SUBMITTED", color: "bg-slate-200 text-slate-800", icon: Clock };
      case "verifying_signature":
        return { label: "2. VERIFYING SIGNATURE", color: "bg-indigo-100 text-indigo-800", icon: Loader2, spin: true };
      case "awaiting_telex":
        return { label: "3. AWAITING TELEX PIPELINE", color: "bg-amber-100 text-amber-800", icon: RefreshCw, spin: true };
      case "confirmed":
        return { label: "✓ CONFIRMED BY TELEX", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 };
      case "recovering":
        return { label: "⟲ TELEX RECOVERING FAULT", color: "bg-orange-100 text-orange-800", icon: RefreshCw, spin: true };
      case "escalated":
        return { label: "→ CODE ESCALATION IN PROGRESS", color: "bg-purple-100 text-purple-800", icon: ArrowRight };
      case "stopped":
      default:
        return { label: "⏹ STOPPED — MANUAL REVIEW", color: "bg-rose-100 text-rose-800", icon: AlertTriangle };
    }
  };

  const stageBadge = getStageBadge();
  const StageIcon = stageBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4C0016]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFF9F2] rounded-3xl border-4 border-[#4C0016] shadow-[0_16px_0_#4C0016] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Banner */}
        <div
          className={`p-5 text-center border-b-4 border-[#4C0016] ${
            isSuccess
              ? "bg-[#60A905] text-white"
              : isSimulated
              ? "bg-[#FFD750] text-[#4C0016]"
              : "bg-[#F91814] text-[#F5E3CD]"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-full bg-white/30 hover:bg-white/50 text-current border border-current transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="font-mouse-memoirs text-lg uppercase tracking-widest block drop-shadow-xs">
            {isSuccess
              ? "RAZORPAY TEST MODE TRANSACTION"
              : isSimulated
              ? `PATH B: SIMULATED ${result.simulationType?.toUpperCase() || "FAULT"}`
              : "PAYMENT DECLINE DETECTED"}
          </span>

          <h3 className="font-modak text-3xl sm:text-4xl uppercase tracking-tight mt-0.5 leading-none">
            {isSuccess
              ? "ORDER PROCESSED"
              : isSimulated
              ? "INFRASTRUCTURE FAULT INJECTED"
              : "PAYMENT DECLINED"}
          </h3>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Asynchronous Recovery Progress Stage Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border-2 border-[#4C0016] shadow-xs">
            <div className="flex items-center gap-2">
              <StageIcon className={`w-4 h-4 text-[#4C0016] ${stageBadge.spin ? "animate-spin" : ""}`} />
              <span className="font-mouse-memoirs text-base font-bold text-[#4C0016]">
                RECOVERY STAGE:
              </span>
            </div>
            <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-[#4C0016]/20 ${stageBadge.color}`}>
              {stageBadge.label}
            </span>
          </div>

          {/* Summary Details Card */}
          <div className="bg-[#F5E3CD] rounded-2xl p-3.5 border-2 border-[#4C0016] space-y-2 text-sm font-medium text-[#4C0016]">
            <div className="flex items-center justify-between">
              <span className="text-[#4C0016]/70">Item</span>
              <span className="font-bold">{result.productName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#4C0016]/70">Charged Amount</span>
              <span className="font-modak text-xl text-[#F91814]">
                ₹{result.amount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t-2 border-[#4C0016]/10">
              <span className="text-[#4C0016]/70">Payment Attempt ID</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <span className="truncate max-w-[160px] sm:max-w-[200px]">
                  {result.paymentAttemptId}
                </span>
                <button
                  onClick={() => handleCopy(result.paymentAttemptId, "attempt")}
                  className="p-1 text-[#4C0016] hover:bg-[#FFD750] rounded transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copiedKey === "attempt" ? (
                    <Check className="w-3.5 h-3.5 text-[#60A905]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#4C0016]/70">Razorpay Order ID</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <span className="truncate max-w-[160px] sm:max-w-[200px]">
                  {result.orderId}
                </span>
                <button
                  onClick={() => handleCopy(result.orderId, "order")}
                  className="p-1 text-[#4C0016] hover:bg-[#FFD750] rounded transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedKey === "order" ? (
                    <Check className="w-3.5 h-3.5 text-[#60A905]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {result.razorpayPaymentId && (
              <div className="flex items-center justify-between">
                <span className="text-[#4C0016]/70">Razorpay Payment ID</span>
                <span className="font-mono text-xs font-bold">{result.razorpayPaymentId}</span>
              </div>
            )}

            {result.errorMessage && (
              <div className="pt-2 border-t-2 border-[#4C0016]/10 text-xs text-rose-700 font-semibold">
                <strong>Status note:</strong> {result.errorMessage}
              </div>
            )}
          </div>

          {/* Live Events Timeline (if received from Telex Backend) */}
          {events.length > 0 && (
            <div className="p-3 rounded-2xl bg-white border-2 border-[#4C0016] space-y-1.5">
              <span className="font-mouse-memoirs text-base font-bold text-[#4C0016] block">
                LIVE TELEX PIPELINE EVENTS ({events.length}):
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[11px] text-[#4C0016]/90">
                {events.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-[#F5E3CD]/60 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F91814]" />
                    <span className="font-bold">{evt.stage || evt.action}:</span>
                    <span className="truncate">{evt.message || evt.detail || "Event logged"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Callout */}
          <div className="p-3 rounded-2xl bg-[#FFD750]/50 border-2 border-[#4C0016] flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F91814] shrink-0 mt-0.5" />
            <div className="font-mouse-memoirs text-base sm:text-lg text-[#4C0016] leading-tight">
              <strong>DEMO TRANSITION:</strong> Switch to the Telex Dashboard to observe Engine B classifying the root cause, executing self-healing, and opening verified GitHub PRs.
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={dashboardIncidentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 text-center"
            >
              <BlobButton variant="red" size="md" className="w-full">
                <span className="flex items-center justify-center gap-1.5">
                  <span>VIEW IN TELEX DASHBOARD</span>
                  <ExternalLink className="w-4 h-4" />
                </span>
              </BlobButton>
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto font-mouse-memoirs text-lg uppercase px-4 py-2 rounded-full border-2 border-[#4C0016] hover:bg-[#F5E3CD] text-[#4C0016] transition-colors cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
