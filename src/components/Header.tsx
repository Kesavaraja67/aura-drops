"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, ExternalLink, ShieldCheck, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL, TELEX_DASHBOARD_URL, checkBackendHealth } from "@/lib/api";

export function Header() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let mounted = true;

    async function verifyHealth() {
      const result = await checkBackendHealth();
      if (mounted) {
        setBackendStatus(result.online ? "online" : "offline");
      }
    }

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top micro-banner */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-medium text-slate-300 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Telex Engine B Live Demo Storefront — Razorpay Test Mode Environment</span>
        <span className="hidden sm:inline text-slate-500">|</span>
        <span className="hidden sm:inline text-slate-400">All transactions are simulated in sandbox</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">APEX GOODS CO.</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Demo Merchant
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Direct-to-Consumer Lifestyle Goods &middot; Powered by Telex Recovery
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Backend connectivity status pill */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                backendStatus === "online"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : backendStatus === "offline"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
              title={`Telex Backend: ${API_BASE_URL}`}
            >
              {backendStatus === "online" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Telex API: Connected</span>
                </>
              ) : backendStatus === "offline" ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Telex API: Offline ({API_BASE_URL})</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Checking API...</span>
                </>
              )}
            </div>

            {/* Link out to Telex Dashboard */}
            <a
              href={TELEX_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors shadow-sm"
              title="Open main Telex dashboard in a new tab"
            >
              <span>Telex Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
