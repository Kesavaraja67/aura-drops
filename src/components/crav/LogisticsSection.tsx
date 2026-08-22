"use client";

import React from "react";
import Image from "next/image";
import { Plane, PackageCheck } from "lucide-react";

export function LogisticsSection() {
  const destinations = [
    { city: "TOKYO", country: "JAPAN", time: "2-3 Days", tag: "AIR PRIORITY", image: "/images/hero_headphones.png" },
    { city: "LONDON", country: "UK", time: "2-4 Days", tag: "EXPRESS CARGO", image: "/images/product_sneaker.png" },
    { city: "NEW YORK", country: "USA", time: "2-4 Days", tag: "DIRECT HUB", image: "/images/product_backpack.png" },
    { city: "MUMBAI", country: "INDIA", time: "Next Day", tag: "DOMESTIC DISPATCH", image: "/images/deskclock.jpg" },
  ];

  return (
    <section className="relative w-full bg-[#FFD750] text-[#4C0016] py-14 sm:py-16 overflow-hidden border-t-4 border-[#4C0016]">
      {/* Flight Path SVG Line */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 100 C 300 50, 600 450, 900 150 C 1100 -50, 1300 400, 1400 300"
            stroke="#4C0016"
            strokeWidth="5"
            strokeDasharray="14 14"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#F91814] text-[#F5E3CD] font-mouse-memoirs text-base border-2 border-[#4C0016] rotate-[-2deg] mb-1.5 shadow-xs">
              <Plane className="w-3.5 h-3.5" />
              <span>GLOBAL FULFILLMENT NETWORK</span>
            </div>
            <h2 className="font-modak text-3xl sm:text-5xl text-[#F91814] text-stroke-maroon uppercase leading-none tracking-tight">
              DROPS THAT TRAVEL WORLDWIDE
            </h2>
          </div>
          <p className="font-mouse-memoirs text-lg sm:text-xl text-[#4C0016] max-w-md leading-tight">
            Sealed in moisture-barrier anti-static packaging. Every drop leaves our fulfillment center within 12 hours.
          </p>
        </div>

        {/* Destinations Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className="bg-[#FFF9F2] rounded-3xl border-4 border-[#4C0016] overflow-hidden shadow-[0_6px_0_#4C0016] hover:shadow-[0_10px_0_#4C0016] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Top city header */}
              <div className="p-3 bg-[#F5E3CD] border-b-4 border-[#4C0016] flex items-center justify-between">
                <span className="font-modak text-xl text-[#F91814] text-stroke-maroon-sm">
                  {dest.city} //
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4C0016] text-[#F5E3CD]">
                  {dest.time}
                </span>
              </div>

              {/* Product preview thumbnail */}
              <div className="relative w-full aspect-video bg-white/70 p-3 flex items-center justify-center border-b-2 border-[#4C0016]/10">
                <Image
                  src={dest.image}
                  alt={dest.city}
                  fill
                  sizes="200px"
                  className="object-contain p-2"
                />
              </div>

              {/* Card footer */}
              <div className="p-3 flex items-center justify-between font-mouse-memoirs text-base text-[#4C0016]">
                <span>{dest.tag}</span>
                <span className="font-bold text-[#60A905] flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5" />
                  Insured
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
