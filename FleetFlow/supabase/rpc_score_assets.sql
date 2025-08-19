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
begin
  return query
    select a.code, 1.0 as score
      from assets a
      -- TODO: join availability, distance, maintenance, etc.
     order by 1;
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
