-- Kathryn's Kreativity — database schema
-- Run this in the Supabase SQL Editor (new project, separate from the tutoring project)

create extension if not exists "pgcrypto";

-- ============ PRODUCTS ============
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('painting', 'jewelry', 'resin')),
  price numeric(10,2) not null check (price >= 0),
  description text default '',
  images text[] default '{}',
  stock_quantity integer not null default 1 check (stock_quantity >= 0),
  is_active boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- ============ ORDERS ============
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_email text not null,
  shipping_address text not null,
  items jsonb not null,               -- [{ product_id, name, price, qty }]
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text not null,       -- 'venmo' | 'cashapp' | 'zelle' | 'paypal'
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'shipped', 'completed', 'cancelled')),
  notes text default '',
  created_at timestamptz not null default now()
);

-- Auto-generate a human-readable order number like KK-1001
create sequence if not exists order_number_seq start 1001;

create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'KK-' || nextval('order_number_seq');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on orders;
create trigger trg_set_order_number
  before insert on orders
  for each row execute function set_order_number();

-- ============ ROW LEVEL SECURITY ============
alter table products enable row level security;
alter table orders enable row level security;

-- Anyone can view active products (public storefront)
drop policy if exists "public read active products" on products;
create policy "public read active products"
  on products for select
  using (is_active = true);

-- Only logged-in admin (you) can manage products
drop policy if exists "admin manage products" on products;
create policy "admin manage products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anyone can place an order (insert), but only admin can read/update orders
drop policy if exists "public insert orders" on orders;
create policy "public insert orders"
  on orders for insert
  with check (true);

drop policy if exists "admin read orders" on orders;
create policy "admin read orders"
  on orders for select
  using (auth.role() = 'authenticated');

drop policy if exists "admin update orders" on orders;
create policy "admin update orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- ============ PLACE ORDER (atomic: checks stock, decrements it, creates the order) ============
-- Runs as the table owner (security definer), so it can safely decrement stock
-- and insert the order in one transaction even though the storefront visitor
-- is only an anonymous user. This prevents two shoppers from both buying the
-- last of a one-of-a-kind piece.
create or replace function place_order(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_items jsonb,           -- [{ "product_id": "...", "qty": 1 }, ...]
  p_payment_method text
) returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product products%rowtype;
  v_order orders%rowtype;
  v_subtotal numeric := 0;
  v_qty int;
  v_built_items jsonb := '[]'::jsonb;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'qty')::int;
    select * into v_product from products
      where id = (v_item->>'product_id')::uuid
      for update;

    if not found then
      raise exception 'One of the items in your cart is no longer available';
    end if;
    if v_product.stock_quantity < v_qty then
      raise exception '% just sold out — please remove it from your cart', v_product.name;
    end if;

    update products set stock_quantity = stock_quantity - v_qty where id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_built_items := v_built_items || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'qty', v_qty
    );
  end loop;

  insert into orders (customer_name, customer_email, shipping_address, items, subtotal, total, payment_method)
  values (p_customer_name, p_customer_email, p_shipping_address, v_built_items, v_subtotal, v_subtotal, p_payment_method)
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function place_order(text, text, text, jsonb, text) to anon, authenticated;
