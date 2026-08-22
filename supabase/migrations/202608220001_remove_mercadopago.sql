alter table public.orders
  drop column if exists payment_status,
  drop column if exists mercado_pago_preference_id,
  drop column if exists mercado_pago_payment_id,
  drop column if exists paid_at;

drop index if exists public.orders_payment_status_idx;
