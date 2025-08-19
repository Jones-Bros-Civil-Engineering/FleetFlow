-- Function: rpc_off_hire_allocation
-- Description: Marks an allocation as off hire by setting the end date to today.
-- Parameters:
--   allocation_id uuid - allocation to off hire
-- Returns: void
create or replace function rpc_off_hire_allocation(
  allocation_id uuid
)
returns void
language sql
as $$
  update allocations
     set end_date = current_date
   where id = allocation_id;
$$;
