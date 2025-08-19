-- Core tables for FleetFlow
create extension if not exists "pgcrypto";

-- Equipment groups
create table if not exists equipment_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- Hire requests for equipment
create table if not exists hire_requests (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null,
  group_id uuid not null references equipment_groups(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  quantity integer not null,
  operated boolean not null default false,
  site_lat double precision not null,
  site_lon double precision not null,
  check (start_date <= end_date)
);

-- Operators
create table if not exists operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  home_lat double precision,
  home_lon double precision
);

-- Operator assignments to requests
create table if not exists operator_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references hire_requests(id) on delete cascade,
  operator_id uuid not null references operators(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  check (start_date <= end_date)
);

-- Operator unavailability periods
create table if not exists operator_unavailability (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references operators(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  check (start_date <= end_date)
);

-- Tickets held by operators
create table if not exists operator_tickets (
  operator_id uuid not null references operators(id) on delete cascade,
  ticket_code text not null,
  primary key (operator_id, ticket_code)
);

-- Tickets required for equipment groups
create table if not exists group_required_tickets (
  group_id uuid not null references equipment_groups(id) on delete cascade,
  ticket_code text not null,
  primary key (group_id, ticket_code)
);

-- Allowed substitutions between equipment groups
create table if not exists group_substitutions (
  group_id uuid not null references equipment_groups(id) on delete cascade,
  substitute_group_id uuid not null references equipment_groups(id) on delete cascade,
  primary key (group_id, substitute_group_id)
);

-- Asset allocations to requests
create table if not exists allocations (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null,
  group_id uuid not null references equipment_groups(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  source text,
  contract_status text,
  contract_code text,
  request_id uuid references hire_requests(id) on delete set null,
  check (start_date <= end_date)
);

-- View: calendar events from allocations and requests
create or replace view calendar_events as
select a.id,
       a.start_date as date,
       a.asset_code as title,
       null::text as site,
       a.contract_status,
       null::boolean as operated,
       a.asset_code,
       null::text as operator_name
  from allocations a
union all
select hr.id,
       hr.start_date as date,
       concat('Request ', hr.id::text) as title,
       null::text as site,
       null::text as contract_status,
       hr.operated,
       null::text as asset_code,
       null::text as operator_name
  from hire_requests hr;

-- View: weekly group utilisation counts
create or replace view vw_weekly_group_utilization as
with expanded as (
  select
    generate_series(
      date_trunc('week', a.start_date),
      date_trunc('week', a.end_date),
      interval '1 week'
    )::date as week_start,
    a.group_id
  from allocations a
)
select week_start, group_id, count(*) as on_hire_count
from expanded
group by week_start, group_id;

