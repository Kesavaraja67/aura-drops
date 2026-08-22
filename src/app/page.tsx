"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/crav/Navbar";
import { HeroSection } from "@/components/crav/HeroSection";
import { MarqueeTicker } from "@/components/crav/MarqueeTicker";
import { WavyDivider } from "@/components/crav/WavyDivider";
import { ProductCard } from "@/components/crav/ProductCard";
import { DetailExplodedSection } from "@/components/crav/DetailExplodedSection";
import { LogisticsSection } from "@/components/crav/LogisticsSection";
import { DemoChaosControls } from "@/components/crav/DemoChaosControls";
import { TestCardsDrawer } from "@/components/crav/TestCardsDrawer";
import { CheckoutModal } from "@/components/crav/CheckoutModal";
import { PRODUCTS } from "@/data/products";
import { CheckoutResult } from "@/types/store";
import { TELEX_DASHBOARD_URL } from "@/lib/api";
import { AlertCircle, ExternalLink, Flame } from "lucide-react";

export default function StorefrontPage() {
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F5E3CD] flex flex-col font-sans text-[#4C0016] selection:bg-[#F91814] selection:text-white">
      {/* Top Fixed Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {/* Error Notification Toast */}
        {errorMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90vw] p-3.5 bg-[#F91814] text-[#F5E3CD] border-4 border-[#4C0016] rounded-2xl shadow-[0_8px_0_#4C0016] flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[#FFD750] shrink-0 mt-0.5" />
              <div>
                <strong className="font-modak text-base tracking-wide uppercase block">
                  CHECKOUT ALERT
                </strong>
                <span className="font-mouse-memoirs text-sm leading-tight">
                  {errorMessage}
                </span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#FFD750] hover:text-white font-bold text-xs uppercase cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection />

        {/* Marquee Ticker 1 */}
        <MarqueeTicker backgroundColor="bg-[#F91814]" textColor="text-[#F5E3CD]" />

        {/* Catalog Section */}
        <section id="catalog" className="w-full py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          {/* Catalog Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1 px-3.5 py-0.5 rounded-full bg-[#FFD750] border-2 border-[#4C0016] text-[#4C0016] font-mouse-memoirs text-base rotate-[2deg] mb-2 shadow-xs">
              <Flame className="w-4 h-4 text-[#F91814]" />
              <span>LIMITED ARTISAN BATCH</span>
            </div>
            <h2 className="font-modak text-3xl sm:text-5xl lg:text-6xl text-[#F91814] text-stroke-maroon-thick uppercase leading-[0.85] tracking-tight">
              FEATURED DROPS
            </h2>
            <p className="font-mouse-memoirs text-lg sm:text-xl text-[#4C0016] mt-2 leading-tight">
              Click &quot;Buy Now&quot; on any product below to trigger the genuine client-side Razorpay Checkout widget (Path A).
            </p>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCheckoutComplete={(res) => setCheckoutResult(res)}
                onError={(err) => setErrorMessage(err)}
              />
            ))}
          </div>
        </section>

        {/* Jelly Transition to Specs */}
        <WavyDivider fillColor="#F91814" />

        {/* Detailed Exploded View / Specs Section */}
        <DetailExplodedSection />

        {/* Jelly Transition to Logistics */}
        <WavyDivider fillColor="#FFD750" inverted={true} />

        {/* Logistics & Worldwide Fulfillment Section */}
        <LogisticsSection />

        {/* Demo Lab Controls (Path B: Simulated Failures) */}
        <DemoChaosControls
          products={PRODUCTS}
          onSimulationComplete={(res) => setCheckoutResult(res)}
          onError={(err) => setErrorMessage(err)}
        />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#4C0016] text-[#F5E3CD] py-10 px-4 sm:px-8 border-t-8 border-[#FFD750]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-0.5">
            <span className="font-modak text-3xl text-[#FFD750] text-stroke-maroon-sm">
              VORTEX DROPS
            </span>
            <span className="font-mouse-memoirs text-base text-[#F5E3CD]/70">
              &copy; 2026 VORTEX Artisan Drops &middot; Built for Telex Engine B Demonstration
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-mouse-memoirs text-lg">
            <a href="#catalog" className="hover:text-[#FFD750] transition-colors">
              DROPS
            </a>
            <a href="#specs" className="hover:text-[#FFD750] transition-colors">
              LAYER SPECS
            </a>
            <a href="#demo-controls" className="hover:text-[#FFD750] transition-colors">
              DEMO LAB
            </a>
            <a
              href={TELEX_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#FFD750] hover:text-white font-bold"
            >
              <span>TELEX DASHBOARD</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Presenter Tool: Razorpay Test Cards Drawer */}
      <TestCardsDrawer />

      {/* Post-Checkout Result Modal */}
      <CheckoutModal
        result={checkoutResult}
        onClose={() => setCheckoutResult(null)}
      />
    </div>
  );
}
