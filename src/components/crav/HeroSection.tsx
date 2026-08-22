"use client";

import React from "react";
import Image from "next/image";
import { BlobButton } from "./BlobButton";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  onExploreClick?: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section className="relative w-full flex flex-col justify-between items-center pt-16 sm:pt-20 pb-6 overflow-hidden bg-[#F5E3CD]">
      {/* Top Tagline Badges */}
      <div className="w-fit h-fit relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#FFD750] border-2 border-[#4C0016] text-[#4C0016] font-mouse-memoirs text-base sm:text-lg tracking-wider mb-1 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#F91814]" />
          <span>AUTONOMOUS RECOVERY ENGINE B &middot; RAZORPAY SANDBOX</span>
        </div>

        {/* Massive Backdrop Title: THE DROP */}
        <div className="relative select-none text-center">
          <h1 className="text-[20vw] sm:text-[17vw] leading-[0.78] text-center font-modak text-[#F91814] text-stroke-maroon-thick tracking-tight">
            THE DROP
          </h1>

          {/* Floating Sticker 1 - Top Left */}
          <div className="absolute top-[2%] -left-[2%] sm:left-[3%] rotate-12 z-20 pointer-events-none sticker-item">
            <span className="font-modak text-xl sm:text-3xl text-[#F4A804] text-stroke-maroon block leading-none drop-shadow-md">
              LIMITED<br />EDITION
            </span>
          </div>

          {/* Floating Sticker 2 - Bottom Right */}
          <div className="absolute bottom-[6%] -right-[2%] sm:right-[3%] -rotate-12 z-20 pointer-events-none sticker-item">
            <span className="font-modak text-xl sm:text-3xl text-[#F4A804] text-stroke-maroon block leading-none drop-shadow-md">
              PRO<br />ACOUSTICS
            </span>
          </div>
        </div>
      </div>

      {/* Floating Center Hero Product Showcase (BIG TRANSPARENT CUTOUT) */}
      <div className="relative z-20 -my-8 sm:-my-16 lg:-my-20 flex items-center justify-center w-[85vw] max-w-[540px] lg:max-w-[620px] aspect-square pointer-events-none">
        {/* Big Floating PNG Cutout with Animation - 100% Transparent */}
        <div className="relative w-full h-full animate-float sticker-item drop-shadow-[0_20px_30px_rgba(76,0,22,0.25)]">
          <Image
            src="/images/hero_headphones_cutout.png"
            alt="Vortex Studio Pro ANC Headphones"
            fill
            unoptimized
            sizes="(max-width: 768px) 90vw, 620px"
            className="object-contain"
            priority
          />
        </div>

        {/* Floating Price Pill */}
        <div className="absolute bottom-6 left-2 sm:left-6 bg-[#4C0016] text-[#F5E3CD] border-3 border-[#FFD750] px-4 py-1.5 rounded-2xl rotate-[-6deg] shadow-2xl z-30 font-mouse-memoirs text-xl tracking-wider pointer-events-auto">
          ₹2,499 &middot; BATCH 01
        </div>

        {/* Floating Feature Pill */}
        <div className="absolute top-10 right-2 sm:right-6 bg-[#F91814] text-[#F5E3CD] border-3 border-[#4C0016] px-4 py-1.5 rounded-2xl rotate-[8deg] shadow-2xl z-30 font-mouse-memoirs text-xl tracking-wider pointer-events-auto">
          40MM BERYLLIUM
        </div>
      </div>

      {/* Giant Bottom VORTEX Text */}
      <div className="relative z-10 select-none text-center -mt-6 sm:-mt-12">
        <p className="text-[18vw] sm:text-[14vw] font-modak uppercase leading-none text-[#FFD750] text-stroke-maroon-thick drop-shadow-md">
          VORTEX
        </p>
      </div>

      {/* Two-Column Teasers & CTA Button */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 mt-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
        <div className="max-w-xs text-center md:text-left">
          <p className="font-mouse-memoirs text-lg sm:text-xl text-[#4C0016] leading-tight">
            Precision tuned 40mm Beryllium drivers, ultra-low latency wireless, and 40-hour acoustic playback.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <a href="#catalog">
            <BlobButton variant="red" size="md" onClick={onExploreClick}>
              <span>EXPLORE DROPS</span>
            </BlobButton>
          </a>
          <span className="text-[10px] font-mono font-bold text-[#4C0016]/70 uppercase tracking-widest mt-1">
            100% Genuine &middot; Free 2-Day Shipping
          </span>
        </div>

        <div className="max-w-xs text-center md:text-right">
          <p className="font-mouse-memoirs text-lg sm:text-xl text-[#4C0016] leading-tight">
            Engineered for collectors & creators. Complete with genuine Razorpay Sandbox & Telex Engine B recovery.
          </p>
        </div>
      </div>
    </section>
  );
}
