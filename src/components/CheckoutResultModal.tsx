"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  X,
  ArrowRight,
  Activity,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { CheckoutResult } from "@/types/store";
import { TELEX_DASHBOARD_URL } from "@/lib/api";

interface CheckoutResultModalProps {
  result: CheckoutResult | null;
  onClose: () => void;
}

export function CheckoutResultModal({ result, onClose }: CheckoutResultModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!result) return null;

  const isSuccess = result.status === "success";
  const isSimulated = result.isSimulated;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dashboardIncidentUrl = `${TELEX_DASHBOARD_URL}?attempt_id=${result.paymentAttemptId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header decoration bar */}
        <div
          className={`h-2.5 w-full ${
            isSuccess
              ? "bg-emerald-500"
              : isSimulated
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Status Icon & Heading */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isSuccess
                  ? "bg-emerald-100 text-emerald-600"
                  : isSimulated
                  ? "bg-amber-100 text-amber-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : isSimulated ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <Activity className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isSuccess
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isSimulated
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {isSuccess
                    ? "Payment Captured"
                    : isSimulated
                    ? `Path B: Simulated ${result.simulationType || "Failure"}`
                    : "Payment Failed / Declined"}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                {isSuccess
                  ? "Order Placed Successfully"
                  : isSimulated
                  ? "Infrastructure Error Injected"
                  : "Payment Decline Logged"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isSuccess
                  ? "Your transaction completed via Razorpay Test Mode."
                  : "Telex Engine B payment recovery pipeline is now investigating this attempt."}
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Item</span>
              <span className="font-semibold text-slate-900">{result.productName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">₹{result.amount.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Payment Attempt ID</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium">
                <span className="truncate max-w-[160px] sm:max-w-[200px]">{result.paymentAttemptId}</span>
                <button
                  onClick={() => handleCopy(result.paymentAttemptId, "attempt")}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copiedKey === "attempt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Razorpay Order ID</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium">
                <span className="truncate max-w-[160px] sm:max-w-[200px]">{result.orderId}</span>
                <button
                  onClick={() => handleCopy(result.orderId, "order")}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedKey === "order" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {result.razorpayPaymentId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Razorpay Payment ID</span>
                <span className="font-mono text-slate-800 font-medium">{result.razorpayPaymentId}</span>
              </div>
            )}
          </div>

          {/* Demo Callout explaining next step */}
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-900 leading-relaxed">
              <strong>Demo Transition:</strong> Switch to the Telex Dashboard to observe Engine B classifying the root cause,
              running diagnostic trees, and enqueuing recovery actions.
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={dashboardIncidentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all shadow-sm hover:shadow cursor-pointer group"
            >
              <span>View in Telex Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
