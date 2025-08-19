-- Function: rpc_off_hire_allocation
-- Description: Marks an allocation as off hire by setting the end date to today.
-- Parameters:
--   allocation_id uuid - allocation to off hire
-- Returns: void
create or replace function rpc_off_hire_allocation(
  allocation_id uuid
)
returns void
language plpgsql
as $$
begin
  update allocations
     set end_date = greatest(start_date, current_date)
   where id = allocation_id;

  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
