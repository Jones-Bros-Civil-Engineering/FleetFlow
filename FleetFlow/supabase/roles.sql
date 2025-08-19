-- Roles stored in profiles and surfaced via JWT + RPC

-- Add role column if it doesn't exist
alter table profiles
  add column if not exists role text
    check (role in ('contract_manager','plant_coordinator','workforce_coordinator'))
    default 'contract_manager';

-- Expose role in JWT so policies can rely on auth.jwt()->>'role'
create or replace function auth.jwt_custom_claims()
returns jsonb
language sql
stable
as $$
  select json_build_object(
    'role', (select role from public.profiles where id = auth.uid())
  );
$$;

-- RPC for clients to fetch their server-defined role
create or replace function rpc_get_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid();
$$;
