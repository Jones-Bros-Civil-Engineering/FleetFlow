-- Function: rpc_allocate_best_asset
-- Description: Tries to allocate the best eligible internal asset for a request; raises if none.
-- Parameters:
--   request_id uuid - hire request to allocate for
-- Returns: uuid of the allocated asset
create or replace function rpc_allocate_best_asset(
  request_id uuid
)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare
  req hire_requests%rowtype;
  cand record;
begin
  select * into req from hire_requests where id = request_id;
  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  if req.start_date > req.end_date then
    raise exception 'INVALID_DATE_RANGE';
  end if;

  for cand in
    select a.id, a.code, s.score
      from rpc_score_assets(request_id) s
      join assets a on a.code = s.asset_code
     order by s.score desc nulls last
  loop
    begin
      insert into allocations(asset_id, group_id, start_date, end_date, request_id)
      values (cand.id, req.group_id, req.start_date, req.end_date, request_id);
      return cand.id;
    exception
      when exclusion_violation then
        -- try next candidate
    end;
  end loop;

  raise exception 'NO_INTERNAL_ASSET_AVAILABLE';
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
