import { NextResponse } from "next/server";
import { getMercadoPagoPayment, isValidMercadoPagoSignature, syncMercadoPagoPayment } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const payload = await request.json().catch(() => ({})) as { type?: string; data?: { id?: string | number } };
  const paymentId = String(payload.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (!paymentId) return NextResponse.json({ ok: true });
  if (!isValidMercadoPagoSignature(request.headers.get("x-signature"), request.headers.get("x-request-id"), paymentId)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payment = await getMercadoPagoPayment(paymentId);
  if (!payment.external_reference) return NextResponse.json({ ok: true });
  await syncMercadoPagoPayment(payment.external_reference, paymentId);
  return NextResponse.json({ ok: true });
}
