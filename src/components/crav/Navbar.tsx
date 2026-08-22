"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, AlertCircle, ExternalLink, Menu, X, ShieldCheck } from "lucide-react";
import { API_BASE_URL, TELEX_DASHBOARD_URL, checkBackendHealth } from "@/lib/api";

export function Navbar() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function verify() {
      const res = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus(res.online ? "online" : "offline");
      }
    }
    verify();
    const interval = setInterval(verify, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-2.5 flex items-center justify-between pointer-events-auto bg-[#F5E3CD]/95 backdrop-blur-md border-b-2 border-[#4C0016]/10">
      {/* Brand Logo */}
      <Link
        href="/"
        className="font-modak text-2xl sm:text-4xl text-[#F91814] text-stroke-maroon tracking-tight hover:scale-105 transition-transform duration-300 select-none"
      >
        AURA
      </Link>

      {/* Center navigation links */}
      <div className="hidden md:flex items-center gap-2.5">
        <a
          href="#catalog"
          className="font-mouse-memoirs text-base uppercase tracking-wider text-[#F5E3CD] bg-[#F91814] border-2 border-[#4C0016] px-4 py-1 rounded-full hover:bg-[#4C0016] transition-colors duration-300 shadow-xs"
        >
          Featured Drops
        </a>
        <a
          href="#specs"
          className="font-mouse-memoirs text-base uppercase tracking-wider text-[#4C0016] bg-transparent border-2 border-[#4C0016]/30 px-4 py-1 rounded-full hover:border-[#4C0016] hover:bg-white/40 transition-all duration-300"
        >
          Layer Specs
        </a>
        <a
          href="#demo-controls"
          className="font-mouse-memoirs text-base uppercase tracking-wider text-[#4C0016] bg-[#FFD750] border-2 border-[#4C0016] px-4 py-1 rounded-full hover:scale-105 transition-transform duration-300 shadow-xs"
        >
          Demo Controls (Path B)
        </a>
      </div>

      {/* Right status & external link */}
      <div className="flex items-center gap-2.5">
        {/* Backend connectivity indicator */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${
            backendStatus === "online"
              ? "bg-[#60A905]/15 text-[#60A905] border-[#60A905]"
              : backendStatus === "offline"
              ? "bg-[#F91814]/15 text-[#F91814] border-[#F91814]"
              : "bg-slate-200 text-slate-700 border-slate-400"
          }`}
          title={`Telex Backend: ${API_BASE_URL}`}
        >
          {backendStatus === "online" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#60A905] animate-pulse" />
              <span className="font-mono uppercase text-[10px]">Telex API: Online</span>
            </>
          ) : backendStatus === "offline" ? (
            <>
              <AlertCircle className="w-3 h-3 text-[#F91814]" />
              <span className="font-mono uppercase text-[10px]">API Offline ({API_BASE_URL})</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 animate-spin" />
              <span className="font-mono uppercase text-[10px]">Connecting...</span>
            </>
          )}
        </div>

        {/* Dashboard Linkout */}
        <a
          href={TELEX_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mouse-memoirs text-base uppercase tracking-wider text-[#F5E3CD] bg-[#4C0016] border-2 border-[#4C0016] px-3.5 py-1 rounded-full hover:bg-[#F91814] transition-colors duration-300 flex items-center gap-1.5 shadow-xs"
        >
          <span>Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-full border-2 border-[#4C0016] bg-white text-[#4C0016]"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#F91814] border-b-4 border-[#4C0016] p-5 flex flex-col gap-3 z-50 md:hidden animate-in slide-in-from-top-4">
          <a
            href="#catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="font-modak text-xl text-[#F5E3CD] hover:text-[#FFD750] transition-colors uppercase"
          >
            Featured Drops
          </a>
          <a
            href="#specs"
            onClick={() => setMobileMenuOpen(false)}
            className="font-modak text-xl text-[#F5E3CD] hover:text-[#FFD750] transition-colors uppercase"
          >
            Layer Specs
          </a>
          <a
            href="#demo-controls"
            onClick={() => setMobileMenuOpen(false)}
            className="font-modak text-xl text-[#FFD750] hover:text-white transition-colors uppercase"
          >
            Demo Controls (Path B)
          </a>
          <a
            href={TELEX_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mouse-memoirs text-lg text-[#F5E3CD] bg-[#4C0016] px-4 py-1.5 rounded-full text-center uppercase"
          >
            Open Telex Recovery Dashboard ↗
          </a>
        </div>
      )}
    </nav>
  );
}
