"use client";

import React, { useState } from "react";
import { CreditCard, Copy, Check, ChevronDown, ChevronUp, Info, ShieldAlert, Sparkles } from "lucide-react";

interface TestCard {
  title: string;
  number: string;
  cvv: string;
  expiry: string;
  otp: string;
  result: "Success" | "Decline (Insufficient Funds)" | "Decline (Auth Failed)" | "Decline (Issuer Down)";
  color: "emerald" | "amber" | "rose" | "indigo";
}

const TEST_CARDS: TestCard[] = [
  {
    title: "Real Test Card (Success)",
    number: "4012 0010 3714 9642",
    cvv: "123",
    expiry: "12/30",
    otp: "123456",
    result: "Success",
    color: "emerald",
  },
  {
    title: "Test Decline (Insufficient Funds)",
    number: "4012 0010 3714 9659",
    cvv: "123",
    expiry: "12/30",
    otp: "Any",
    result: "Decline (Insufficient Funds)",
    color: "rose",
  },
  {
    title: "Test Decline (Auth Failed)",
    number: "4012 0010 3714 9667",
    cvv: "123",
    expiry: "12/30",
    otp: "Any",
    result: "Decline (Auth Failed)",
    color: "amber",
  },
  {
    title: "Test Decline (Issuer Technical Down)",
    number: "4012 0010 3714 9675",
    cvv: "123",
    expiry: "12/30",
    otp: "Any",
    result: "Decline (Issuer Down)",
    color: "indigo",
  },
];

export function TestCardsHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ""));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm w-full">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden transition-all duration-300">
        {/* Toggle bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">Razorpay Test Cards (Presenter Tool)</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Collapsible content */}
        {isOpen && (
          <div className="p-4 max-h-[380px] overflow-y-auto space-y-3 bg-slate-50">
            <div className="text-[11px] text-slate-600 flex items-start gap-1.5 p-2 bg-slate-100 rounded-lg border border-slate-200">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Click any test card number to copy. Enter into Razorpay Checkout widget during Path A demo.
              </span>
            </div>

            {TEST_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">{card.title}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      card.color === "emerald"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : card.color === "rose"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : card.color === "amber"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    }`}
                  >
                    {card.result}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="font-mono text-xs font-semibold text-slate-900 tracking-wider">
                    {card.number}
                  </span>
                  <button
                    onClick={() => handleCopy(card.number)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedNumber === card.number ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                  <span>EXP: {card.expiry}</span>
                  <span>CVV: {card.cvv}</span>
                  <span>OTP: {card.otp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
