create extension if not exists "pgcrypto";

create type public.order_status as enum ('pending', 'preparing', 'ready', 'delivered', 'cancelled');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  price integer not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  completed_orders_count integer not null default 0 check (completed_orders_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address text not null,
  address_details text,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_details text,
  status public.order_status not null default 'pending',
  subtotal integer not null check (subtotal >= 0),
  discount_percentage integer not null default 0 check (discount_percentage in (0, 10)),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  total integer not null check (total >= 0),
  loyalty_discount_applied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_price integer not null check (product_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.loyalty_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index products_available_idx on public.products(is_available, is_featured);
create index addresses_user_idx on public.addresses(user_id, last_used_at desc);
create index orders_user_idx on public.orders(user_id, created_at desc);
create index orders_status_idx on public.orders(status, created_at desc);
create index orders_delivered_idx on public.orders(delivered_at desc) where status = 'delivered';
create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);
create index loyalty_user_idx on public.loyalty_redemptions(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger addresses_updated_at before update on public.addresses
for each row execute function public.set_updated_at();

create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.prevent_more_than_three_addresses()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.addresses where user_id = new.user_id) >= 3 then
    raise exception 'address_limit_reached';
  end if;
  return new;
end;
$$;

create trigger addresses_limit before insert on public.addresses
for each row execute function public.prevent_more_than_three_addresses();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on u.email = a.email
    where u.id = check_user_id
  );
$$;

create or replace function public.sync_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  update public.admins set user_id = new.id where email = new.email and user_id is null;
  return new;
end;
$$;

create trigger auth_sync_profile after insert or update on auth.users
for each row execute function public.sync_profile();

create or replace function public.update_completed_orders_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    new.delivered_at = coalesce(new.delivered_at, now());
    update public.profiles
    set completed_orders_count = completed_orders_count + 1
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger orders_mark_delivered before update on public.orders
for each row execute function public.update_completed_orders_count();

create or replace function public.create_order_secure(
  payload_items jsonb,
  payload_address_id uuid default null,
  payload_address jsonb default null
)
returns table(order_id uuid, subtotal integer, discount_amount integer, total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  selected_address public.addresses%rowtype;
  new_address_id uuid;
  delivered_count integer;
  consumed_rewards integer;
  reward_available boolean;
  new_order_id uuid;
  item record;
  product_row public.products%rowtype;
  line_total integer;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select email into current_email from auth.users where id = current_user_id;

  if jsonb_typeof(payload_items) <> 'array' or jsonb_array_length(payload_items) = 0 then
    raise exception 'empty_order';
  end if;

  if payload_address_id is not null then
    select * into selected_address from public.addresses
    where id = payload_address_id and user_id = current_user_id;

    if selected_address.id is null then
      raise exception 'address_not_found';
    end if;
  else
    insert into public.addresses (
      user_id, label, recipient_name, phone, address, address_details, last_used_at
    )
    values (
      current_user_id,
      coalesce(payload_address->>'label', 'Casa'),
      payload_address->>'recipientName',
      payload_address->>'phone',
      payload_address->>'address',
      nullif(payload_address->>'addressDetails', ''),
      now()
    )
    returning id into new_address_id;

    select * into selected_address from public.addresses where id = new_address_id;
  end if;

  select count(*) into delivered_count
  from public.orders
  where user_id = current_user_id and status = 'delivered';

  select count(*) into consumed_rewards
  from public.loyalty_redemptions
  where user_id = current_user_id;

  reward_available := floor(delivered_count / 3) > consumed_rewards;
  subtotal := 0;

  insert into public.orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    delivery_details,
    subtotal,
    discount_percentage,
    discount_amount,
    total,
    loyalty_discount_applied
  )
  values (
    current_user_id,
    selected_address.recipient_name,
    coalesce(current_email, ''),
    selected_address.phone,
    selected_address.address,
    selected_address.address_details,
    0,
    case when reward_available then 10 else 0 end,
    0,
    0,
    reward_available
  )
  returning id into new_order_id;

  for item in select * from jsonb_to_recordset(payload_items) as x("productId" uuid, quantity integer)
  loop
    if item.quantity is null or item.quantity <= 0 or item.quantity > 20 then
      raise exception 'invalid_quantity';
    end if;

    select * into product_row
    from public.products
    where id = item."productId" and is_available = true and archived_at is null;

    if product_row.id is null then
      raise exception 'product_not_available';
    end if;

    line_total := product_row.price * item.quantity;
    subtotal := subtotal + line_total;

    insert into public.order_items (
      order_id, product_id, product_name, product_price, quantity, line_total
    )
    values (
      new_order_id, product_row.id, product_row.name, product_row.price, item.quantity, line_total
    );
  end loop;

  discount_amount := case when reward_available then round(subtotal * 0.10)::integer else 0 end;
  total := subtotal - discount_amount;

  update public.orders
  set subtotal = create_order_secure.subtotal,
      discount_amount = create_order_secure.discount_amount,
      total = create_order_secure.total
  where id = new_order_id;

  if reward_available then
    insert into public.loyalty_redemptions (user_id, order_id)
    values (current_user_id, new_order_id);
  end if;

  update public.addresses
  set last_used_at = now()
  where id = selected_address.id;

  order_id := new_order_id;
  return next;
end;
$$;

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admins enable row level security;
alter table public.loyalty_redemptions enable row level security;

create policy "Public can read available products" on public.products
for select using (archived_at is null);

create policy "Admins manage products" on public.products
for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own profile" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "Users update own profile" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Users read own addresses" on public.addresses
for select using (user_id = auth.uid() or public.is_admin());

create policy "Users insert own addresses" on public.addresses
for insert with check (user_id = auth.uid());

create policy "Users update own addresses" on public.addresses
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users delete own addresses" on public.addresses
for delete using (user_id = auth.uid());

create policy "Users read own orders and admins read all" on public.orders
for select using (user_id = auth.uid() or public.is_admin());

create policy "Admins update order status" on public.orders
for update using (public.is_admin()) with check (public.is_admin());

create policy "Users read own order items and admins read all" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and (o.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Admins read admins" on public.admins
for select using (public.is_admin());

create policy "Users read own redemptions" on public.loyalty_redemptions
for select using (user_id = auth.uid() or public.is_admin());

insert into public.admins (email)
values ('johanleon991@gmail.com')
on conflict (email) do nothing;

alter publication supabase_realtime add table public.orders;
