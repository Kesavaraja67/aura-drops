import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("Order Summary API Route", () => {
  it("should calculate exact platform fee for whole amounts", async () => {
    const req = new Request("http://localhost:3000/api/order-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotal_paise: 200000 }), // ₹2,000.00
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.subtotal_paise).toBe(200000);
    expect(data.fee_paise).toBe(4000); // 2% of 200000
    expect(data.total_paise).toBe(204000);
  });

  it("should properly round platform fee for fractional paise amounts", async () => {
    // 12345 paise (₹123.45) * 0.02 = 246.9 paise
    // Correct business logic requires rounding to 247 paise.
    // The seeded bug in route.ts uses Math.trunc (returning 246), causing this test to fail.
    const req = new Request("http://localhost:3000/api/order-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotal_paise: 12345 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.subtotal_paise).toBe(12345);
    expect(data.fee_paise).toBe(247); // Math.round(12345 * 0.02) = 247
    expect(data.total_paise).toBe(12592); // 12345 + 247
  });

  it("should properly round platform fee for odd product prices", async () => {
    // 9999 paise * 0.02 = 199.98 paise -> should round to 200 paise
    const req = new Request("http://localhost:3000/api/order-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotal_paise: 9999 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.fee_paise).toBe(200);
    expect(data.total_paise).toBe(10199);
  });
});
