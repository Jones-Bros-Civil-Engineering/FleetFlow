-- Sample data for development

insert into equipment_groups (name) values
  ('18T Excavator'),
  ('21T Excavator');

insert into tickets (code, description) values
  ('TICKET_A', 'Basic operator ticket');

insert into group_substitutions (group_id, substitute_group_id) values
  (1, 2);

insert into operators (name) values
  ('Alice'),
  ('Bob');

insert into operator_tickets (operator_id, ticket_code) values
  (1, 'TICKET_A');

insert into group_required_tickets (group_id, ticket_code) values
  (1, 'TICKET_A');

insert into contracts (code, status) values
  ('C-001', 'confirmed');

insert into assets (code, group_id) values
  ('EX001', 1);

insert into hire_requests (contract_id, group_id, start_date, end_date, quantity, operated, site_lat, site_lon) values
  (1, 1, '2024-04-01', '2024-04-07', 1, true, 0, 0);

insert into allocations (asset_id, group_id, contract_id, request_id, start_date, end_date) values
  (1, 1, 1, 1, '2024-04-01', '2024-04-07');

insert into contract_memberships (profile_id, contract_id) values
  ('00000000-0000-0000-0000-000000000001', 1);

insert into external_hires (contract_id, request_id) values
  (1, 1);

