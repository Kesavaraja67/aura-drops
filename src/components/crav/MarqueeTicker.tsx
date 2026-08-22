"use client";

import React from "react";
import { Zap, Sparkles, ShieldCheck, Flame } from "lucide-react";

interface MarqueeTickerProps {
  backgroundColor?: string;
  textColor?: string;
}

export function MarqueeTicker({
  backgroundColor = "bg-[#F91814]",
  textColor = "text-[#F5E3CD]",
}: MarqueeTickerProps) {
  const items = [
    "🔥 VORTEX ARTISAN DROPS",
    "⚡ RAZORPAY TEST MODE ACTIVE",
    "🎧 40MM BERYLLIUM DRIVERS",
    "🛡️ TELEX ENGINE B WATCHING",
    "✨ 100% ORIGINAL CRAFT",
    "🚀 FAST DISPATCH ACROSS INDIA",
    "📦 AUTONOMOUS RECOVERY READY",
  ];

  return (
    <div
      className={`w-full overflow-hidden py-2.5 border-y-4 border-[#4C0016] ${backgroundColor} ${textColor} select-none shadow-md`}
    >
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...items, ...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 mx-4">
            <span className="font-modak text-lg sm:text-xl tracking-wide uppercase">
              {text}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD750] border border-[#4C0016] inline-block shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
