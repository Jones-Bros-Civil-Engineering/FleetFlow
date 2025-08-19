-- Sample seed data for FleetFlow
insert into equipment_groups (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Excavators');

insert into operators (id, name, home_lat, home_lon) values
  ('00000000-0000-0000-0000-000000000101', 'Alice', 51.5, -0.1);

insert into hire_requests (
  id, contract_id, group_id, start_date, end_date, quantity, operated, site_lat, site_lon
) values (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000010001',
  '00000000-0000-0000-0000-000000000001',
  '2025-01-01',
  '2025-01-07',
  1,
  true,
  51.5,
  -0.1
);

insert into allocations (
  id, asset_code, group_id, start_date, end_date, contract_status, contract_code, request_id
) values (
  '00000000-0000-0000-0000-000000002001',
  'ASSET-1',
  '00000000-0000-0000-0000-000000000001',
  '2025-01-01',
  '2025-01-07',
  'confirmed',
  'CON-1',
  '00000000-0000-0000-0000-000000001001'
);

insert into operator_tickets (operator_id, ticket_code) values
  ('00000000-0000-0000-0000-000000000101', 'TICKET-1');

insert into group_required_tickets (group_id, ticket_code) values
  ('00000000-0000-0000-0000-000000000001', 'TICKET-1');

