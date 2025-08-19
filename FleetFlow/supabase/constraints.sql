-- Constraints for preventing overlaps

-- allocations_no_overlap: prevent double-booking an asset
create extension if not exists btree_gist;

alter table allocations
  add constraint allocations_no_overlap
  exclude using gist (
    asset_id with =,
    daterange(start_date, end_date, '[]') with &&
  );

-- operator_assignments_no_overlap: prevent double-booking an operator
alter table operator_assignments
  add constraint operator_assignments_no_overlap
  exclude using gist (
    operator_id with =,
    daterange(start_date, end_date, '[]') with &&
  );

alter table operator_assignments
  add constraint operator_assignments_date_order
  check (start_date <= end_date);
