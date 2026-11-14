-- 0002_listings.sql
-- Products, services, images, versions, moderation reviews.

-- ============ ENUMS ============
do $$ begin
  create type public.listing_status as enum
    ('draft','pending_review','changes_requested','approved','rejected','suspended','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pricing_model as enum ('fixed','starting_from','hourly','negotiable');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.moderation_decision as enum ('approve','reject','request_changes','suspend','restore');
exception when duplicate_object then null; end $$;

-- ============ PRODUCTS ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  slug text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'NGN',
  stock int not null default 0 check (stock >= 0),
  condition text,
  location_city text,
  location_state text,
  delivery_details text,
  status public.listing_status not null default 'draft',
  -- pointer to the currently approved version; null while never approved
  approved_version_id uuid,
  -- public visibility requires status='approved' AND is_active
  is_active boolean not null default true,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);
create index if not exists products_store_idx on public.products(store_id);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_public_idx on public.products(status, is_active) where status = 'approved' and is_active = true;

-- ============ SERVICES ============
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  slug text not null,
  description text not null,
  pricing_model public.pricing_model not null default 'fixed',
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'NGN',
  service_area text,
  availability text,
  requirements text,
  location_city text,
  location_state text,
  status public.listing_status not null default 'draft',
  approved_version_id uuid,
  is_active boolean not null default true,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);
create index if not exists services_store_idx on public.services(store_id);
create index if not exists services_category_idx on public.services(category_id);
create index if not exists services_status_idx on public.services(status);
create index if not exists services_public_idx on public.services(status, is_active) where status = 'approved' and is_active = true;

-- ============ PRODUCT IMAGES ============
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- ============ SERVICE IMAGES ============
create table if not exists public.service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists service_images_service_idx on public.service_images(service_id);

-- ============ LISTING VERSIONS ============
-- One row per submitted snapshot. The full content is stored as jsonb so we
-- can compare versions and preserve the last approved one even after edits.
create table if not exists public.listing_versions (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('product','service')),
  listing_id uuid not null,
  version_number int not null,
  snapshot jsonb not null,
  submitted_by uuid not null references auth.users(id) on delete restrict,
  submitted_at timestamptz not null default now(),
  unique (listing_type, listing_id, version_number)
);
create index if not exists listing_versions_listing_idx on public.listing_versions(listing_type, listing_id);

-- ============ MODERATION REVIEWS ============
create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('product','service')),
  listing_id uuid not null,
  version_id uuid references public.listing_versions(id) on delete set null,
  decision public.moderation_decision not null,
  reason text,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (decision in ('approve','restore') or reason is not null)
);
create index if not exists listing_reviews_listing_idx on public.listing_reviews(listing_type, listing_id);
create index if not exists listing_reviews_reviewer_idx on public.listing_reviews(reviewer_id);

-- ============ TRIGGERS ============
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services
for each row execute function public.set_updated_at();

-- ============ RLS ============
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.product_images enable row level security;
alter table public.service_images enable row level security;
alter table public.listing_versions enable row level security;
alter table public.listing_reviews enable row level security;

-- Helper: current user owns this store?
create or replace function public.owns_store(target_store_id uuid)
returns boolean language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.stores
    where id = target_store_id and owner_id = auth.uid()
  );
$$;

-- ---------- PRODUCTS ----------
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (status = 'approved' and is_active = true);

drop policy if exists products_owner_read on public.products;
create policy products_owner_read on public.products
  for select using (public.owns_store(store_id));

drop policy if exists products_owner_insert on public.products;
create policy products_owner_insert on public.products
  for insert with check (public.owns_store(store_id) and status = 'draft');

drop policy if exists products_owner_update on public.products;
create policy products_owner_update on public.products
  for update using (public.owns_store(store_id))
  with check (
    public.owns_store(store_id)
    -- seller cannot self-approve or set moderator fields
    and status in ('draft','pending_review','changes_requested','archived')
  );

drop policy if exists products_admin_read on public.products;
create policy products_admin_read on public.products
  for select using (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products
  for update using (public.is_admin())
  with check (public.is_admin());

-- ---------- SERVICES ----------
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
  for select using (status = 'approved' and is_active = true);

drop policy if exists services_owner_read on public.services;
create policy services_owner_read on public.services
  for select using (public.owns_store(store_id));

drop policy if exists services_owner_insert on public.services;
create policy services_owner_insert on public.services
  for insert with check (public.owns_store(store_id) and status = 'draft');

drop policy if exists services_owner_update on public.services;
create policy services_owner_update on public.services
  for update using (public.owns_store(store_id))
  with check (
    public.owns_store(store_id)
    and status in ('draft','pending_review','changes_requested','archived')
  );

drop policy if exists services_admin_read on public.services;
create policy services_admin_read on public.services
  for select using (public.is_admin());

drop policy if exists services_admin_update on public.services;
create policy services_admin_update on public.services
  for update using (public.is_admin())
  with check (public.is_admin());

-- ---------- PRODUCT IMAGES ----------
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select using (
    exists (select 1 from public.products p
            where p.id = product_id and p.status = 'approved' and p.is_active = true)
  );

drop policy if exists product_images_owner_all on public.product_images;
create policy product_images_owner_all on public.product_images
  for all using (
    exists (select 1 from public.products p
            where p.id = product_id and public.owns_store(p.store_id))
  )
  with check (
    exists (select 1 from public.products p
            where p.id = product_id and public.owns_store(p.store_id))
  );

drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all on public.product_images
  for all using (public.is_admin())
  with check (public.is_admin());

-- ---------- SERVICE IMAGES ----------
drop policy if exists service_images_public_read on public.service_images;
create policy service_images_public_read on public.service_images
  for select using (
    exists (select 1 from public.services s
            where s.id = service_id and s.status = 'approved' and s.is_active = true)
  );

drop policy if exists service_images_owner_all on public.service_images;
create policy service_images_owner_all on public.service_images
  for all using (
    exists (select 1 from public.services s
            where s.id = service_id and public.owns_store(s.store_id))
  )
  with check (
    exists (select 1 from public.services s
            where s.id = service_id and public.owns_store(s.store_id))
  );

drop policy if exists service_images_admin_all on public.service_images;
create policy service_images_admin_all on public.service_images
  for all using (public.is_admin())
  with check (public.is_admin());

-- ---------- LISTING VERSIONS ----------
-- Submitter can read own; admins can read all; insert only by owner of listing
drop policy if exists listing_versions_read_submitter on public.listing_versions;
create policy listing_versions_read_submitter on public.listing_versions
  for select using (submitted_by = auth.uid());

drop policy if exists listing_versions_read_admin on public.listing_versions;
create policy listing_versions_read_admin on public.listing_versions
  for select using (public.is_admin());

drop policy if exists listing_versions_insert_owner on public.listing_versions;
create policy listing_versions_insert_owner on public.listing_versions
  for insert with check (
    submitted_by = auth.uid()
    and (
      (listing_type = 'product' and exists (
        select 1 from public.products p
        where p.id = listing_id and public.owns_store(p.store_id)))
      or
      (listing_type = 'service' and exists (
        select 1 from public.services s
        where s.id = listing_id and public.owns_store(s.store_id)))
    )
  );

-- ---------- LISTING REVIEWS ----------
drop policy if exists listing_reviews_read_submitter on public.listing_reviews;
create policy listing_reviews_read_submitter on public.listing_reviews
  for select using (
    (listing_type = 'product' and exists (
      select 1 from public.products p
      where p.id = listing_id and public.owns_store(p.store_id)))
    or
    (listing_type = 'service' and exists (
      select 1 from public.services s
      where s.id = listing_id and public.owns_store(s.store_id)))
  );

drop policy if exists listing_reviews_admin_read on public.listing_reviews;
create policy listing_reviews_admin_read on public.listing_reviews
  for select using (public.is_admin());

drop policy if exists listing_reviews_admin_insert on public.listing_reviews;
create policy listing_reviews_admin_insert on public.listing_reviews
  for insert with check (public.is_admin());