-- Ejecutar en Supabase SQL Editor antes de activar las cuentas.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin'))
);

create or replace function public.assign_customer_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_roles(user_id, role) values (new.id, 'customer') on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists after_auth_user_created_role on auth.users;
create trigger after_auth_user_created_role after insert on auth.users
for each row execute function public.assign_customer_role();

create table if not exists public.catalog_products (
  id text primary key,
  data jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
create table if not exists public.visitor_presence (
  visitor_id uuid primary key,
  last_seen_at timestamptz not null default now()
);
create table if not exists public.try_on_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  product_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists try_on_events_product_id_idx on public.try_on_events(product_id);
create index if not exists try_on_events_created_at_idx on public.try_on_events(created_at);

create or replace function public.try_on_summary()
returns table(product_id text, tries bigint)
language sql security definer set search_path = '' as $$
  select e.product_id, count(*) as tries from public.try_on_events e group by e.product_id;
$$;

alter table public.user_roles enable row level security;
alter table public.catalog_products enable row level security;
alter table public.visitor_presence enable row level security;
alter table public.try_on_events enable row level security;
-- No se conceden operaciones a anon/authenticated. El backend usa la service role,
-- que solo existe como variable de entorno privada en Vercel.
revoke all on public.user_roles, public.catalog_products, public.visitor_presence, public.try_on_events from anon, authenticated;
grant all on public.user_roles, public.catalog_products, public.visitor_presence, public.try_on_events to service_role;
grant usage, select on sequence public.try_on_events_id_seq to service_role;
revoke all on function public.try_on_summary() from public, anon, authenticated;
grant execute on function public.try_on_summary() to service_role;

-- Solo después de crear la cuenta administradora, reemplazar el correo y ejecutar:
-- insert into public.user_roles(user_id, role)
-- select id, 'admin' from auth.users where email = 'TU_CORREO_ADMIN'
-- on conflict (user_id) do update set role = 'admin';
