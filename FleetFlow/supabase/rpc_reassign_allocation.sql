-- Function: rpc_reassign_allocation
-- Description: Moves an allocation forward by one day.
-- Parameters:
--   allocation_id uuid - allocation to move
-- Returns: allocations row after update
create or replace function rpc_reassign_allocation(
  allocation_id uuid
)
returns setof allocations
language plpgsql
as $$
begin
  return query
    update allocations
       set start_date = start_date + interval '1 day',
           end_date   = end_date + interval '1 day'
     where id = allocation_id
    returning *;
exception
  when exclusion_violation then
    raise exception 'ALLOCATION_OVERLAP';
end;
$$;
