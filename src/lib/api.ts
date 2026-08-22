import { CreateOrderResponse, FailureType, PaySimulationResponse } from "@/types/store";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_TELEX_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export const TELEX_DASHBOARD_URL =
  process.env.NEXT_PUBLIC_TELEX_DASHBOARD_URL || "http://localhost:3000/dashboard/recovery";

export const CONFIGURED_RAZORPAY_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export const FALLBACK_RAZORPAY_KEY = CONFIGURED_RAZORPAY_KEY;

const ALLOW_OFFLINE_DEMO =
  process.env.NEXT_PUBLIC_ALLOW_OFFLINE_DEMO === "true";

export interface OrderSummaryResponse {
  subtotal_paise: number;
  fee_paise: number;
  total_paise: number;
}

/**
 * Calls the storefront's own server-side Route Handler to compute order totals & fees.
 * Contains the seeded rounding defect (Math.trunc vs Math.round).
 */
export async function fetchOrderSummary(subtotalPaise: number): Promise<OrderSummaryResponse> {
  try {
    const res = await fetch("/api/order-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotal_paise: subtotalPaise }),
    });
    if (!res.ok) {
      throw new Error(`Order summary route returned HTTP ${res.status}`);
    }
    return (await res.json()) as OrderSummaryResponse;
  } catch (err: any) {
    console.warn("Local /api/order-summary error, fallback calculation:", err.message);
    const fee_paise = Math.trunc(subtotalPaise * 0.02);
    return {
      subtotal_paise: subtotalPaise,
      fee_paise,
      total_paise: subtotalPaise + fee_paise,
    };
  }
}

/**
 * Creates a Razorpay Order and corresponding PaymentAttempt record on the Telex Backend.
 * Used by BOTH Path A (real Razorpay checkout) and Path B (infrastructure failure simulation).
 */
export async function createPaymentOrder(amountPaise: number): Promise<CreateOrderResponse> {
  const url = `${API_BASE_URL}/api/payments/create-order`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amountPaise }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let detail = `Backend returned HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.detail) detail = parsed.detail;
      } catch {
        if (errText) detail = errText;
      }
      throw new Error(detail);
    }

    const data = (await response.json()) as CreateOrderResponse;
    if (!data.key_id && CONFIGURED_RAZORPAY_KEY) {
      data.key_id = CONFIGURED_RAZORPAY_KEY;
    }
    return data;
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      if (ALLOW_OFFLINE_DEMO) {
        console.warn("NEXT_PUBLIC_ALLOW_OFFLINE_DEMO enabled. Providing preview attempt.");
        return {
          order_id: `order_demo_${Date.now()}`,
          payment_attempt_id: `pa_demo_${Math.random().toString(36).substring(2, 10)}`,
          key_id: CONFIGURED_RAZORPAY_KEY,
        };
      }
      throw new Error(
        `Telex payment service unavailable. Ensure the Telex backend is running at ${API_BASE_URL}.`
      );
    }
    throw error;
  }
}

/**
 * Calls the canonical backend signature verification endpoint to verify real Razorpay checkouts.
 */
export async function verifyPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_attempt_id?: string;
}): Promise<{ valid: boolean; message?: string }> {
  const url = `${API_BASE_URL}/api/payments/verify-signature`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errText = await response.text();
      let detail = `Signature verification rejected with HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.detail) detail = parsed.detail;
      } catch {
        if (errText) detail = errText;
      }
      return { valid: false, message: detail };
    }

    const data = await response.json();
    return { valid: data.valid !== false, message: data.message };
  } catch (err: any) {
    return {
      valid: false,
      message: `Signature verification service unreachable at ${API_BASE_URL}. (${err.message})`,
    };
  }
}

/**
 * Polls the Telex backend for asynchronous payment recovery events / status.
 */
export async function fetchPaymentAttemptRecoveryEvents(
  paymentAttemptId: string
): Promise<{ events: any[]; latestStatus?: string }> {
  const url = `${API_BASE_URL}/api/recovery/events?payment_attempt_id=${encodeURIComponent(
    paymentAttemptId
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return { events: [] };
    }

    const data = await response.json();
    const events = Array.isArray(data) ? data : data.events || [];
    const latestStatus = events.length > 0 ? events[events.length - 1].stage || events[events.length - 1].action : undefined;
    return { events, latestStatus };
  } catch {
    return { events: [] };
  }
}

/**
 * Simulates an infrastructure-level failure (Path B ONLY).
 * Calls POST /api/payments/pay/{payment_attempt_id} with force_failure.
 */
export async function simulateInfrastructureFailure(
  paymentAttemptId: string,
  failureType: FailureType
): Promise<PaySimulationResponse> {
  const url = `${API_BASE_URL}/api/payments/pay/${paymentAttemptId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ force_failure: failureType }),
    });

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    return {
      status: "failed",
      payment_attempt_id: paymentAttemptId,
      failure_mode: failureType,
      message: data.detail || data.message || `Simulated ${failureType} failure recorded on backend`,
    };
  } catch (error: any) {
    return {
      status: "failed",
      payment_attempt_id: paymentAttemptId,
      failure_mode: failureType,
      message: error.message || `Simulated ${failureType} failure triggered`,
    };
  }
}

/**
 * Quick health check to verify Telex backend connectivity
 */
export async function checkBackendHealth(): Promise<{ online: boolean; url: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return { online: res.ok, url: API_BASE_URL };
  } catch (err: any) {
    return { online: false, url: API_BASE_URL, error: err.message };
  }
}
