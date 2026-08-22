"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Copy, Check, ChevronDown, ChevronUp, Info, X } from "lucide-react";

interface TestCard {
  title: string;
  number: string;
  cvv: string;
  expiry: string;
  otp: string;
  result: "Success" | "Decline (Insufficient Funds)" | "Decline (Auth Failed)" | "Decline (Issuer Down)";
  badgeColor: "green" | "red" | "mustard" | "maroon";
}

const TEST_CARDS: TestCard[] = [
  {
    title: "Test Card (Success)",
    number: "4012 0010 3714 9642",
    cvv: "123",
    expiry: "12/30",
    otp: "123456",
    result: "Success",
    badgeColor: "green",
  },
  {
    title: "Test Decline (Insufficient Funds)",
    number: "4012 0010 3714 9659",
    cvv: "123",
    expiry: "12/30",
    otp: "Any",
    result: "Decline (Insufficient Funds)",
    badgeColor: "red",
  },
  {
    title: "Test Decline (Auth Failed)",
    number: "4012 0010 3714 9667",
    cvv: "123",
    expiry: "12/30",
    otp: "Any",
    result: "Decline (Auth Failed)",
    badgeColor: "mustard",
  },
  {
    title: "Test Decline (Issuer Technical Down)",
    number: "4012 0010 3714 9675",
    cvv: "123",
    expiry: "12/30",
    otp: "Any",
    result: "Decline (Issuer Down)",
    badgeColor: "maroon",
  },
];

export function TestCardsDrawer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Hidden by default; visible only if ?demo=1 or via Ctrl+Shift+D / Alt+D
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1" || params.get("demo") === "true") {
      setIsVisible(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") || (e.altKey && e.key.toLowerCase() === "d")) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ""));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-3">
      <div className="bg-[#FFF9F2] rounded-3xl border-4 border-[#4C0016] shadow-[0_8px_0_#4C0016] overflow-hidden transition-all duration-300">
        {/* Toggle Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F91814] text-[#F5E3CD] border-b-2 border-[#4C0016]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FFD750]" />
              <span className="font-mouse-memoirs text-lg tracking-wider uppercase">
                Razorpay Test Cards (Demo Active)
              </span>
            </div>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 p-1 hover:bg-[#4C0016] rounded-full text-[#F5E3CD]/80 hover:text-white transition-colors cursor-pointer"
            title="Hide (Press Ctrl+Shift+D to toggle)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drawer content */}
        {isOpen && (
          <div className="p-4 max-h-[360px] overflow-y-auto space-y-2.5 bg-[#F5E3CD]">
            <div className="text-[11px] font-medium text-[#4C0016] flex items-start gap-1.5 p-2 bg-[#FFF9F2] rounded-xl border border-[#4C0016]/20">
              <Info className="w-3.5 h-3.5 text-[#F91814] shrink-0 mt-0.5" />
              <span>
                Click to copy card number. Enter into Razorpay Checkout.js widget during live demonstration.
              </span>
            </div>

            {TEST_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#FFF9F2] p-2.5 rounded-2xl border-2 border-[#4C0016] shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mouse-memoirs text-base font-bold text-[#4C0016]">
                    {card.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#4C0016] ${
                      card.badgeColor === "green"
                        ? "bg-[#60A905] text-white"
                        : card.badgeColor === "red"
                        ? "bg-[#F91814] text-white"
                        : card.badgeColor === "mustard"
                        ? "bg-[#FFD750] text-[#4C0016]"
                        : "bg-[#4C0016] text-[#F5E3CD]"
                    }`}
                  >
                    {card.result}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#4C0016]/15">
                  <span className="font-mono text-xs font-bold text-[#4C0016] tracking-wider">
                    {card.number}
                  </span>
                  <button
                    onClick={() => handleCopy(card.number)}
                    className="flex items-center gap-1 font-mouse-memoirs text-xs text-[#4C0016] bg-[#FFD750] hover:bg-[#F91814] hover:text-[#F5E3CD] px-2 py-0.5 rounded-lg border border-[#4C0016] transition-colors cursor-pointer"
                  >
                    {copiedNumber === card.number ? (
                      <>
                        <Check className="w-3 h-3 text-[#60A905]" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 text-[9px] text-[#4C0016]/70 mt-1 font-mono">
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
