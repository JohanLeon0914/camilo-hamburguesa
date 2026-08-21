import { createHmac, timingSafeEqual } from "node:crypto";

type MercadoPagoPayment = {
  id?: number;
  status?: string;
  transaction_amount?: number;
  currency_id?: string;
  external_reference?: string;
};

const apiUrl = "https://api.mercadopago.com";

function accessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");
  return token;
}

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Mercado Pago ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function createMercadoPagoPreference(orderId: string, total: number, customerEmail: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const data = await request("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [{ id: orderId, title: "Pedido Camilo Hamburguesas", quantity: 1, currency_id: "COP", unit_price: total }],
      payer: { email: customerEmail },
      external_reference: orderId,
      payment_methods: { default_payment_method_id: "pse" },
      back_urls: {
        success: `${siteUrl}/orders/${orderId}?payment=success`,
        pending: `${siteUrl}/orders/${orderId}?payment=pending`,
        failure: `${siteUrl}/orders/${orderId}?payment=failure`
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`
    })
  }) as { id: string; init_point?: string; sandbox_init_point?: string };
  return { id: data.id, checkoutUrl: data.init_point ?? data.sandbox_init_point };
}

export async function getMercadoPagoPayment(paymentId: string) {
  return request(`/v1/payments/${encodeURIComponent(paymentId)}`) as Promise<MercadoPagoPayment>;
}

export function isValidMercadoPagoSignature(signature: string | null, requestId: string | null, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature || !requestId) return false;
  const timestamp = signature.match(/(?:^|,)ts=([^,]+)/)?.[1];
  const hash = signature.match(/(?:^|,)v1=([^,]+)/)?.[1];
  if (!timestamp || !hash) return false;
  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(hash, "hex");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

