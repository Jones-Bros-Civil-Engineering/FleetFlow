-- Function: rpc_validate_operator_assignment
-- Description: Ensures an operator has all tickets required by a group.
-- Parameters:
--   p_group_id int - equipment group to check
--   p_operator_id int - operator to validate
-- Returns: void
create or replace function rpc_validate_operator_assignment(
  p_group_id int,
  p_operator_id int
)
returns void
language plpgsql
as $$
declare
  missing_count integer;
begin
  select count(*) into missing_count
  from group_required_tickets grt
  where grt.group_id = p_group_id
    and not exists (
      select 1
        from operator_tickets ot
       where ot.operator_id = p_operator_id
         and ot.ticket_code = grt.ticket_code
    );

  if missing_count > 0 then
    raise exception 'MISSING_REQUIRED_TICKETS';
  end if;
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
