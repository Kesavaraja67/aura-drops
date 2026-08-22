"use client";

import React, { useState } from "react";
import { Clock, Database, Zap } from "lucide-react";
import { Product, CheckoutResult, FailureType } from "@/types/store";
import { createPaymentOrder, simulateInfrastructureFailure } from "@/lib/api";
import { BlobButton } from "./BlobButton";

interface DemoChaosControlsProps {
  products: Product[];
  onSimulationComplete: (result: CheckoutResult) => void;
  onError: (msg: string) => void;
}

export function DemoChaosControls({
  products,
  onSimulationComplete,
  onError,
}: DemoChaosControlsProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [activeSimulation, setActiveSimulation] = useState<FailureType | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSimulate = async (failureType: FailureType) => {
    try {
      setActiveSimulation(failureType);

      // Step 1: Create order on backend (same endpoint as Path A)
      const orderData = await createPaymentOrder(selectedProduct.pricePaise);

      // Step 2: Directly call /api/payments/pay/{payment_attempt_id} with force_failure (Path B ONLY)
      const simResult = await simulateInfrastructureFailure(
        orderData.payment_attempt_id,
        failureType
      );

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
        errorMessage:
          simResult.message || `Simulated ${failureType} error recorded on backend.`,
      });
    } catch (err: any) {
      setActiveSimulation(null);
      onError(err.message || `Failed to trigger ${failureType} simulation.`);
    }
  };

  return (
    <section
      id="demo-controls"
      className="relative w-full bg-[#4C0016] text-[#F5E3CD] py-14 sm:py-16 px-4 sm:px-8 border-t-8 border-[#FFD750] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-[#FFD750] text-[#4C0016] font-mouse-memoirs text-base border-2 border-[#F5E3CD] rotate-[-2deg] mb-1.5 shadow-xs">
              <Zap className="w-4 h-4 text-[#F91814]" />
              <span>PATH B &middot; SIMULATED BACKEND FAILURES</span>
            </div>
            <h2 className="font-modak text-3xl sm:text-5xl text-[#FFD750] text-stroke-maroon uppercase leading-none tracking-tight">
              DEMO LAB CONTROLS
            </h2>
            <p className="font-mouse-memoirs text-lg sm:text-xl text-[#F5E3CD]/90 mt-1.5 max-w-2xl leading-tight">
              Razorpay Checkout widget cannot trigger gateway socket timeouts or database outages.
              This demo panel simulates those infrastructure faults to showcase <strong>Telex Engine B’s automated recovery pipeline</strong>.
            </p>
          </div>

          {/* Product selector */}
          <div className="bg-[#FFF9F2] text-[#4C0016] p-3 rounded-2xl border-4 border-[#FFD750] shadow-sm">
            <label
              htmlFor="target-product"
              className="block font-mouse-memoirs text-base uppercase font-bold text-[#4C0016] mb-0.5"
            >
              Select Target Item:
            </label>
            <select
              id="target-product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-[#F5E3CD] border-2 border-[#4C0016] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#4C0016] focus:outline-none cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2 Chaos Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {/* Card 1: Gateway Timeout */}
          <div className="bg-[#FFF9F2] text-[#4C0016] rounded-3xl border-4 border-[#FFD750] p-6 shadow-[0_8px_0_#FFD750] hover:shadow-[0_12px_0_#FFD750] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF9D3F] border-2 border-[#4C0016] flex items-center justify-center text-[#4C0016] shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-modak text-2xl text-[#F91814] text-stroke-maroon-sm leading-none">
                    GATEWAY TIMEOUT
                  </h3>
                  <span className="font-mono text-[11px] font-bold text-[#4C0016]/70">
                    force_failure: &quot;timeout&quot;
                  </span>
                </div>
              </div>

              <p className="font-mouse-memoirs text-base sm:text-lg text-[#4C0016] leading-snug">
                Injects an external gateway HTTP 504 socket hangup. Telex Engine B classifies this as an external upstream
                network fault and schedules intelligent exponential retries.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t-2 border-[#4C0016]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold text-[#4C0016]/60">
                POST /api/payments/pay
              </span>

              <BlobButton
                onClick={() => handleSimulate("timeout")}
                isLoading={activeSimulation === "timeout"}
                disabled={activeSimulation !== null}
                variant="mustard"
                size="md"
                className="w-full sm:w-auto"
              >
                <span>TRIGGER TIMEOUT</span>
              </BlobButton>
            </div>
          </div>

          {/* Card 2: Database Outage */}
          <div className="bg-[#FFF9F2] text-[#4C0016] rounded-3xl border-4 border-[#F91814] p-6 shadow-[0_8px_0_#F91814] hover:shadow-[0_12px_0_#F91814] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F91814] border-2 border-[#4C0016] flex items-center justify-center text-white shadow-xs">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-modak text-2xl text-[#F91814] text-stroke-maroon-sm leading-none">
                    DATABASE OUTAGE
                  </h3>
                  <span className="font-mono text-[11px] font-bold text-[#4C0016]/70">
                    force_failure: &quot;db_unavailable&quot;
                  </span>
                </div>
              </div>

              <p className="font-mouse-memoirs text-base sm:text-lg text-[#4C0016] leading-snug">
                Simulates internal PostgreSQL connection pool exhaustion. Telex Engine B classifies this
                as critical infrastructure downtime and raises an incident on the dashboard.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t-2 border-[#4C0016]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold text-[#4C0016]/60">
                POST /api/payments/pay
              </span>

              <BlobButton
                onClick={() => handleSimulate("db_unavailable")}
                isLoading={activeSimulation === "db_unavailable"}
                disabled={activeSimulation !== null}
                variant="red"
                size="md"
                className="w-full sm:w-auto"
              >
                <span>TRIGGER DB OUTAGE</span>
              </BlobButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
