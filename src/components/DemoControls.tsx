"use client";

import React, { useState } from "react";
import { Wrench, Clock, Database, AlertTriangle, ArrowRight, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Product, CheckoutResult, FailureType } from "@/types/store";
import { createPaymentOrder, simulateInfrastructureFailure } from "@/lib/api";

interface DemoControlsProps {
  products: Product[];
  onSimulationComplete: (result: CheckoutResult) => void;
  onError: (msg: string) => void;
}

export function DemoControls({ products, onSimulationComplete, onError }: DemoControlsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [activeSimulation, setActiveSimulation] = useState<FailureType | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSimulate = async (failureType: FailureType) => {
    try {
      setActiveSimulation(failureType);

      // Step 1: Create order on backend (same endpoint as Path A)
      const orderData = await createPaymentOrder(selectedProduct.pricePaise);

      // Step 2: Directly call /api/payments/pay/{payment_attempt_id} with force_failure (Path B ONLY)
      const simResult = await simulateInfrastructureFailure(orderData.payment_attempt_id, failureType);

      setActiveSimulation(null);

      onSimulationComplete({
        status: "failed",
        productName: selectedProduct.name,
        amount: selectedProduct.price,
        orderId: orderData.order_id,
        paymentAttemptId: orderData.payment_attempt_id,
        timestamp: new Date().toISOString(),
        isSimulated: true,
        simulationType: failureType,
        errorMessage: simResult.message || `Simulated ${failureType} error recorded on backend.`,
      });
    } catch (err: any) {
      setActiveSimulation(null);
      onError(err.message || `Failed to trigger ${failureType} simulation.`);
    }
  };

  return (
    <section className="mt-16 bg-gradient-to-b from-amber-50/50 to-orange-50/30 rounded-3xl border-2 border-amber-200/80 p-6 sm:p-8 shadow-sm">
      {/* Header with collapsible toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Demo Controls: Simulate Infrastructure Failures
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                Path B &middot; Backend-Direct
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Simulates server-side network timeouts and database outages that Razorpay client cannot trigger.
              Bypasses the Checkout.js widget and directly exercises <strong>Telex Engine B’s fault diagnosis & self-healing pipeline</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
        >
          <span>{isOpen ? "Collapse Panel" : "Expand Controls"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded controls */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-amber-200/60">
          {/* Target product selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 bg-white/80 p-3.5 rounded-xl border border-amber-200/60">
            <label htmlFor="product-select" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Product for Simulation:
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full sm:w-auto flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price.toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          {/* Action cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simulation 1: Gateway Timeout */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Simulate Gateway Timeout</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    force_failure: &quot;timeout&quot;
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Injects a mock gateway unresponsive exception (HTTP 504 / socket timeout). Telex Engine B classifies this
                  as an external network fault and triggers automated retry or fallback recovery.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Calls POST /api/payments/pay</span>
                <button
                  onClick={() => handleSimulate("timeout")}
                  disabled={activeSimulation !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {activeSimulation === "timeout" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Injecting Timeout...</span>
                    </>
                  ) : (
                    <>
                      <span>Trigger Timeout Failure</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulation 2: DB Unavailable */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Simulate Database Unavailable</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    force_failure: &quot;db_unavailable&quot;
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Injects a mock PostgreSQL connection pool exhaustion / database unreachable exception. Telex Engine B classifies
                  this as internal infrastructure downtime and dispatches a high-priority recovery incident.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Calls POST /api/payments/pay</span>
                <button
                  onClick={() => handleSimulate("db_unavailable")}
                  disabled={activeSimulation !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {activeSimulation === "db_unavailable" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Injecting DB Error...</span>
                    </>
                  ) : (
                    <>
                      <span>Trigger DB Outage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
