-- Row level security policies for coordinator tables

-- external_hires: only plant coordinators may modify
alter table external_hires enable row level security;
revoke select on external_hires from public;

create policy external_hires_select_plant on external_hires
for select
to authenticated
using (auth.jwt() ->> 'role' = 'plant_coordinator');

create policy external_hires_insert_plant on external_hires
for insert
to authenticated
with check (auth.jwt() ->> 'role' = 'plant_coordinator');

create policy external_hires_update_plant on external_hires
for update
to authenticated
using (auth.jwt() ->> 'role' = 'plant_coordinator')
with check (auth.jwt() ->> 'role' = 'plant_coordinator');

create policy external_hires_delete_plant on external_hires
for delete
to authenticated
using (auth.jwt() ->> 'role' = 'plant_coordinator');

-- allocations: only plant coordinators may modify
alter table allocations enable row level security;
revoke select on allocations from public;

create policy allocations_select_plant on allocations
for select
to authenticated
using (auth.jwt() ->> 'role' = 'plant_coordinator');

create policy allocations_insert_plant on allocations
for insert
to authenticated
with check (auth.jwt() ->> 'role' = 'plant_coordinator');

create policy allocations_update_plant on allocations
for update
to authenticated
using (auth.jwt() ->> 'role' = 'plant_coordinator')
with check (auth.jwt() ->> 'role' = 'plant_coordinator');

create policy allocations_delete_plant on allocations
for delete
to authenticated
using (auth.jwt() ->> 'role' = 'plant_coordinator');

-- operator_assignments: only workforce coordinators may modify
alter table operator_assignments enable row level security;
revoke select on operator_assignments from public;

create policy operator_assignments_select_workforce on operator_assignments
for select
to authenticated
using (auth.jwt() ->> 'role' = 'workforce_coordinator');

create policy operator_assignments_insert_workforce on operator_assignments
for insert
to authenticated
with check (
  auth.jwt() ->> 'role' = 'workforce_coordinator'
);

create policy operator_assignments_update_workforce on operator_assignments
for update
to authenticated
using (auth.jwt() ->> 'role' = 'workforce_coordinator')
with check (
  auth.jwt() ->> 'role' = 'workforce_coordinator'
);

create policy operator_assignments_delete_workforce on operator_assignments
for delete
to authenticated
using (auth.jwt() ->> 'role' = 'workforce_coordinator');

-- hire_requests: coordinators may read
alter table hire_requests enable row level security;
revoke select on hire_requests from public;

create policy hire_requests_select_coordinators on hire_requests
for select
to authenticated
using (
  auth.jwt() ->> 'role' in (
    'plant_coordinator',
    'workforce_coordinator'
  )
);

-- calendar_events: coordinators may read
alter table calendar_events enable row level security;
revoke select on calendar_events from public;

create policy calendar_events_select_coordinators on calendar_events
for select
to authenticated
using (
  auth.jwt() ->> 'role' in (
    'plant_coordinator',
    'workforce_coordinator'
  )
);

-- equipment_groups: coordinators may read
alter table equipment_groups enable row level security;
revoke select on equipment_groups from public;

create policy equipment_groups_select_coordinators on equipment_groups
for select
to authenticated
using (
  auth.jwt() ->> 'role' in (
    'plant_coordinator',
    'workforce_coordinator'
  )
);

-- RLS-protected read-only views
create or replace view vw_external_hires as
select * from external_hires;
grant select on vw_external_hires to authenticated;

create or replace view vw_allocations as
select * from allocations;
grant select on vw_allocations to authenticated;

create or replace view vw_operator_assignments as
select * from operator_assignments;
grant select on vw_operator_assignments to authenticated;
