-- Function: rpc_rank_operators
-- Description: Returns available operators ranked by name, excluding those
--               with existing assignments or unavailability overlapping the
--               requested dates.
-- Parameters:
--   req_start date - start date of the request
--   req_end   date - end date of the request
-- Returns: table(operator_id uuid, operator_name text)
create or replace function rpc_rank_operators(
  req_start date,
  req_end date
)
returns table (
  operator_id uuid,
  operator_name text
)
language sql
stable
as $$
  select o.id as operator_id,
         o.name as operator_name
  from operators o
  left join operator_assignments oa
    on oa.operator_id = o.id
   and oa.start_date <= req_end
   and oa.end_date >= req_start
  left join operator_unavailability ou
    on ou.operator_id = o.id
   and ou.start_date <= req_end
   and ou.end_date >= req_start
  where oa.operator_id is null
    and ou.operator_id is null
  order by o.name;
$$;
