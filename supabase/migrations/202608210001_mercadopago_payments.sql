alter table public.orders
  add column if not exists payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'expired')),
  add column if not exists mercado_pago_preference_id text,
  add column if not exists mercado_pago_payment_id text,
  add column if not exists paid_at timestamptz;

create index if not exists orders_payment_status_idx on public.orders(payment_status, created_at desc);

