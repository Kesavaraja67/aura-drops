// Computes the final order total server-side, applying a small platform fee.
// This is realistic: a real merchant site computing totals server-side before checkout.

export async function POST(req: Request) {
  const { subtotal_paise } = await req.json(); // integer paise
  const FEE_RATE = 0.02; // 2% platform fee

  // ⚠ SEEDED DEFECT (deliberate, for the Telex code-healing demo):
  // Integer division truncates instead of rounding, so the fee — and therefore
  // the total — is occasionally off by a paisa or more, especially on small carts.
  const fee_paise = Math.trunc(subtotal_paise * FEE_RATE); // BUG: should round, not truncate
  const total_paise = subtotal_paise + fee_paise;

  return Response.json({ subtotal_paise, fee_paise, total_paise });
}
