-- DAAM — схема БД. Запустите целиком в Supabase → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id text primary key,
  name_ru text not null,
  name_ky text,
  sort int not null default 0
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  category_id text references public.categories(id) on delete set null,
  name_ru text not null,
  name_ky text,
  description_ru text,
  description_ky text,
  composition_ru text,
  composition_ky text,
  price int not null check (price >= 0),
  old_price int,
  unit text,
  image_url text,
  kcal numeric, protein numeric, fat numeric, carbs numeric,
  shelf_life text,
  is_own boolean not null default false,
  labels text[] not null default '{}',
  in_stock boolean not null default true,
  is_active boolean not null default true,
  popularity int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

create table if not exists public.zones (
  id text primary key,
  name_ru text not null,
  name_ky text,
  fee int not null,
  free_from int not null,
  min_order int not null default 0,
  eta text,
  sort int not null default 0
);

create table if not exists public.stores (
  id text primary key,
  name_ru text,
  name_ky text,
  address_ru text not null,
  address_ky text,
  lat double precision not null,
  lon double precision not null,
  hours text
);

create table if not exists public.promotions (
  id text primary key,
  title_ru text not null,
  title_ky text,
  text_ru text,
  text_ky text,
  image_url text,
  link text,
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  phone text,
  name text,
  points int not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  user_id uuid references auth.users on delete set null,
  status text not null default 'new' check (status in ('new','confirmed','cooking','delivering','delivered','cancelled')),
  payment_method text not null check (payment_method in ('card','qr')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  customer_name text not null,
  phone text not null,
  zone_id text references public.zones(id),
  address text not null,
  apartment text,
  lat double precision,
  lon double precision,
  comment text,
  subtotal int not null,
  delivery_fee int not null,
  total int not null,
  points_earned int not null default 0,
  points_awarded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders on delete cascade,
  product_id text references public.products(id) on delete set null,
  name text not null,
  price int not null,
  qty int not null check (qty between 1 and 99)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- Функции
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Начисление баллов за доставленный заказ (вызывается из админки)
create or replace function public.award_order_points(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o record;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select * into o from public.orders where id = p_order for update;
  if o is null or o.points_awarded or o.user_id is null then return; end if;
  update public.profiles set points = points + o.points_earned where id = o.user_id;
  update public.orders set points_awarded = true where id = p_order;
end $$;

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.zones enable row level security;
alter table public.stores enable row level security;
alter table public.promotions enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "read categories" on public.categories for select using (true);
create policy "admin categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "read zones" on public.zones for select using (true);
create policy "admin zones" on public.zones for all using (public.is_admin()) with check (public.is_admin());
create policy "read stores" on public.stores for select using (true);
create policy "admin stores" on public.stores for all using (public.is_admin()) with check (public.is_admin());
create policy "read promotions" on public.promotions for select using (active or public.is_admin());
create policy "admin promotions" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "read products" on public.products for select using (is_active or public.is_admin());
create policy "admin products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admin profiles" on public.profiles for update using (public.is_admin());

-- Заказы создаёт только сервер (service role), пользователь видит свои
create policy "own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "admin orders" on public.orders for update using (public.is_admin());
create policy "own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

-- Хранилище фото товаров
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
create policy "public product images" on storage.objects for select using (bucket_id = 'products');
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id = 'products' and public.is_admin());
create policy "admin update images" on storage.objects for update to authenticated using (bucket_id = 'products' and public.is_admin());
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id = 'products' and public.is_admin());
