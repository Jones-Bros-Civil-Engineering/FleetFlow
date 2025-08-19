-- Core tables

create table equipment_groups (
  id serial primary key,
  name text not null unique
);

create table group_substitutions (
  group_id int references equipment_groups(id) on delete cascade,
  substitute_group_id int references equipment_groups(id) on delete cascade,
  primary key (group_id, substitute_group_id)
);

create table tickets (
  code text primary key,
  description text
);

create table operators (
  id serial primary key,
  name text not null
);

create table operator_unavailability (
  id serial primary key,
  operator_id int not null references operators(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  check (start_date <= end_date)
);

create table operator_tickets (
  operator_id int not null references operators(id) on delete cascade,
  ticket_code text not null references tickets(code) on delete cascade,
  primary key (operator_id, ticket_code)
);

create table group_required_tickets (
  group_id int not null references equipment_groups(id) on delete cascade,
  ticket_code text not null references tickets(code) on delete cascade,
  primary key (group_id, ticket_code)
);

create table contracts (
  id serial primary key,
  code text not null unique,
  status text not null
);

create table hire_requests (
  id serial primary key,
  contract_id int references contracts(id) on delete cascade,
  group_id int not null references equipment_groups(id),
  start_date date not null,
  end_date date not null,
  quantity int not null,
  operated boolean not null default false,
  site_lat double precision,
  site_lon double precision,
  check (start_date <= end_date)
);

create table assets (
  id serial primary key,
  code text not null unique,
  group_id int not null references equipment_groups(id)
);

create table allocations (
  id serial primary key,
  asset_id int not null references assets(id),
  group_id int not null references equipment_groups(id),
  contract_id int references contracts(id) on delete cascade,
  request_id int references hire_requests(id) on delete set null,
  start_date date not null,
  end_date date not null,
  check (start_date <= end_date)
);

create table operator_assignments (
  id serial primary key,
  operator_id int not null references operators(id),
  contract_id int references contracts(id) on delete cascade,
  request_id int references hire_requests(id) on delete set null,
  start_date date not null,
  end_date date not null,
  check (start_date <= end_date)
);

-- Views

create or replace view calendar_events as
select
  'allocation-' || a.id::text as id,
  a.start_date as date,
  'Allocation ' || asset.code as title,
  null::text as site,
  c.status as contract_status,
  false as operated,
  asset.code as asset_code,
  null::text as operator_name
from allocations a
join assets asset on asset.id = a.asset_id
left join contracts c on c.id = a.contract_id
union all
select
  'request-' || r.id::text as id,
  r.start_date as date,
  'Request ' || eg.name as title,
  null::text as site,
  c.status as contract_status,
  r.operated,
  null::text as asset_code,
  null::text as operator_name
from hire_requests r
join equipment_groups eg on eg.id = r.group_id
left join contracts c on c.id = r.contract_id;

create or replace view vw_allocations as
select
  a.id::text as id,
  a.contract_id::text as contract_id,
  asset.code as asset_code,
  a.group_id::text as group_id,
  a.start_date,
  a.end_date,
  'internal'::text as source,
  c.status as contract_status,
  c.code as contract_code,
  a.request_id::text as request_id
from allocations a
join assets asset on asset.id = a.asset_id
left join contracts c on c.id = a.contract_id;

create or replace view vw_operator_assignments as
select
  oa.id::text as id,
  oa.contract_id::text as contract_id,
  oa.request_id::text as request_id,
  oa.operator_id::text as operator_id,
  oa.start_date,
  oa.end_date
from operator_assignments oa;

create or replace view vw_weekly_group_utilization as
select
  gs.week_start::date as week_start,
  a.group_id,
  count(*) as on_hire_count
from allocations a
join generate_series(
  date_trunc('week', a.start_date),
  date_trunc('week', a.end_date),
  interval '1 week'
) as gs(week_start) on true
group by gs.week_start, a.group_id;

