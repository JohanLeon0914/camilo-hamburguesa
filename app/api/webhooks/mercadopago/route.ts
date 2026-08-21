import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMercadoPagoPayment, isValidMercadoPagoSignature } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const payload = await request.json().catch(() => ({})) as { type?: string; data?: { id?: string } };
  const paymentId = payload.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
  if (!paymentId) return NextResponse.json({ ok: true });
  if (!isValidMercadoPagoSignature(request.headers.get("x-signature"), request.headers.get("x-request-id"), paymentId)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payment = await getMercadoPagoPayment(paymentId);
  if (!payment.external_reference) return NextResponse.json({ ok: true });
  const db = createAdminClient();
  const { data: order } = await db.from("orders").select("id,total").eq("id", payment.external_reference).single();
  if (!order) return NextResponse.json({ ok: true });

  const isPaid = payment.status === "approved" && payment.currency_id === "COP" && payment.transaction_amount === order.total;
  await db.from("orders").update({
    payment_status: isPaid ? "paid" : payment.status === "rejected" ? "failed" : "pending",
    mercado_pago_payment_id: String(payment.id ?? paymentId),
    paid_at: isPaid ? new Date().toISOString() : null
  }).eq("id", order.id);
  return NextResponse.json({ ok: true });
}

