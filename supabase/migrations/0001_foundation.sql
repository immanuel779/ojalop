-- 0001_foundation.sql
-- Profiles, roles, categories, stores, helper functions.
-- Idempotent where practical.

create extension if not exists pgcrypto;

-- ============ ENUMS ============
do $$ begin
  create type public.app_role as enum
    ('buyer','seller','support','moderator','finance_admin','super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_status as enum ('active','suspended','deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.store_verification_status as enum
    ('not_started','in_progress','submitted','verified','rejected','suspended');
exception when duplicate_object then null; end $$;

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  account_status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ USER ROLES ============
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (user_id, role)
);
create index if not exists user_roles_user_id_idx on public.user_roles(user_id);

-- ============ CATEGORIES ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  type text not null check (type in ('product','service','both')),
  is_active boolean not null default true,
  is_age_restricted boolean not null default false,
  requires_extra_review boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists categories_active_idx on public.categories(is_active);

-- ============ STORES ============
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  whatsapp text,
  email text,
  location_city text,
  location_state text,
  location_country text not null default 'NG',
  verification_status public.store_verification_status not null default 'not_started',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);
create index if not exists stores_owner_idx on public.stores(owner_id);
create index if not exists stores_active_idx on public.stores(is_active);

-- ============ HELPERS ============
create or replace function public.has_role(required_role public.app_role)
returns boolean language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable
as $$
  select public.has_role('super_admin') or public.has_role('moderator');
$$;

create or replace function public.is_super_admin()
returns boolean language sql security definer set search_path = public stable
as $$
  select public.has_role('super_admin');
$$;

-- ============ TRIGGERS ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists stores_updated_at on public.stores;
create trigger stores_updated_at before update on public.stores
for each row execute function public.set_updated_at();

-- Auto-create profile + buyer role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'buyer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;

-- profiles
drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_read_admin on public.profiles;
create policy profiles_read_admin on public.profiles
  for select using (public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and account_status = (
    select account_status from public.profiles where id = auth.uid()
  ));

-- user_roles: read own; only super_admin can write
drop policy if exists user_roles_read_own on public.user_roles;
create policy user_roles_read_own on public.user_roles
  for select using (auth.uid() = user_id);

drop policy if exists user_roles_super_admin_all on public.user_roles;
create policy user_roles_super_admin_all on public.user_roles
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- categories: public read active; admin full
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (is_active = true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
  for all using (public.is_admin())
  with check (public.is_admin());

-- stores: public read active; owner read/write own; admin read all
drop policy if exists stores_public_read on public.stores;
create policy stores_public_read on public.stores
  for select using (is_active = true);

drop policy if exists stores_owner_read on public.stores;
create policy stores_owner_read on public.stores
  for select using (auth.uid() = owner_id);

drop policy if exists stores_owner_insert on public.stores;
create policy stores_owner_insert on public.stores
  for insert with check (auth.uid() = owner_id);

drop policy if exists stores_owner_update on public.stores;
create policy stores_owner_update on public.stores
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists stores_admin_read on public.stores;
create policy stores_admin_read on public.stores
  for select using (public.is_admin());

drop policy if exists stores_admin_update on public.stores;
create policy stores_admin_update on public.stores
  for update using (public.is_admin());

-- ============ SEED (MVP) ============
insert into public.categories (name, slug, type, sort_order) values
  ('Electronics', 'electronics', 'product', 10),
  ('Fashion', 'fashion', 'product', 20),
  ('Beauty & Wellness', 'beauty-wellness', 'both', 30),
  ('Home & Furniture', 'home-furniture', 'product', 40),
  ('Vehicles', 'vehicles', 'product', 50),
  ('Professional Services', 'professional-services', 'service', 60)
on conflict (slug) do nothing;