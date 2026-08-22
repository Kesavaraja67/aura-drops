"use client";

import React from "react";
import { Volume2, Cpu, Layers, ShieldCheck } from "lucide-react";

export function DetailExplodedSection() {
  const layers = [
    {
      num: "01",
      title: "BERYLLIUM 40MM CORE",
      desc: "Ultra-rigid vapor-deposited diaphragm delivers sub-bass extension down to 10Hz with near-zero acoustic distortion.",
      icon: Volume2,
      color: "bg-[#F91814]",
      textColor: "text-[#F5E3CD]",
    },
    {
      num: "02",
      title: "ANODIZED ALUMINUM SHELL",
      desc: "CNC-machined monolithic housing blocks external resonant interference and provides structural lifetime durability.",
      icon: Cpu,
      color: "bg-[#FFD750]",
      textColor: "text-[#4C0016]",
    },
    {
      num: "03",
      title: "COOLING GEL MEMORY FOAM",
      desc: "Ergonomic lambskin cushions with heat-dissipating gel chambers engineered for all-day listening sessions.",
      icon: Layers,
      color: "bg-[#4C0016]",
      textColor: "text-[#F5E3CD]",
    },
    {
      num: "04",
      title: "LOSSLESS WIRELESS CORE",
      desc: "Dual Bluetooth 5.4 + 24-bit/96kHz high-resolution USB-C DAC with zero perceivable latency.",
      icon: ShieldCheck,
      color: "bg-[#60A905]",
      textColor: "text-white",
    },
  ];

  return (
    <section id="specs" className="relative w-full bg-[#F91814] text-[#F5E3CD] py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="font-modak text-xl sm:text-2xl text-[#FFD750] text-stroke-maroon uppercase tracking-wide inline-block rotate-[-3deg] mb-1 drop-shadow-xs">
            PURE PRECISION
          </span>
          <h2 className="font-modak text-3xl sm:text-5xl lg:text-6xl text-[#F5E3CD] text-stroke-maroon-thick uppercase leading-[0.85] tracking-tight">
            EVERY LAYER PACKED WITH CRAFT
          </h2>
          <p className="font-mouse-memoirs text-lg sm:text-xl text-[#F5E3CD]/90 mt-2 leading-tight">
            From acoustic chamber dampening to magnetic quick-swap cables — every component is engineered to perfection.
          </p>
        </div>

        {/* 4-Layer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {layers.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFF9F2] text-[#4C0016] rounded-3xl border-4 border-[#4C0016] p-5 shadow-[0_6px_0_#4C0016] hover:shadow-[0_10px_0_#4C0016] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-modak text-base px-3 py-0.5 rounded-full border-2 border-[#4C0016] ${layer.color} ${layer.textColor}`}
                    >
                      LAYER {layer.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F5E3CD] border-2 border-[#4C0016] flex items-center justify-center text-[#4C0016]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-modak text-xl text-[#F91814] text-stroke-maroon-sm leading-tight mb-1.5">
                    {layer.title}
                  </h3>
                  <p className="font-mouse-memoirs text-sm text-[#4C0016]/85 leading-snug">
                    {layer.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-[#4C0016]/10 flex items-center justify-between text-[11px] font-mono font-bold text-[#4C0016]/60">
                  <span>VORTEX 2026</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
