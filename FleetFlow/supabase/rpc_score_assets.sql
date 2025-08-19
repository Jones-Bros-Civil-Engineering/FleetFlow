-- Function: rpc_score_assets
-- Description: Scores internal assets for a request (distance, availability, etc.).
-- Parameters:
--   request_id uuid - hire request to score assets for
-- Returns: table(asset_code text, score double precision)
create or replace function rpc_score_assets(
  request_id uuid
)
returns table(asset_code text, score double precision)
language plpgsql
as $$
declare
  req hire_requests%rowtype;
begin
  select * into req from hire_requests where id = request_id;
  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  if req.start_date > req.end_date then
    raise exception 'INVALID_DATE_RANGE';
  end if;

  return query
    select a.code as asset_code,
           case
             when a.group_id = req.group_id then 1.0
             else 0.5
           end as score
      from assets a
      left join allocations al
        on al.asset_id = a.id
       and al.start_date <= req.end_date
       and al.end_date >= req.start_date
     where al.asset_id is null
       and (
         a.group_id = req.group_id
         or a.group_id in (
           select substitute_group_id
             from group_substitutions
            where group_id = req.group_id
         )
       )
     order by score desc, a.code;
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
