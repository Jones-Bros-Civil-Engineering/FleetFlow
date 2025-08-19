-- Function: rpc_rank_operators
-- Description: Returns available operators scored by distance and additional
--               tie-breakers like future assignment load, last assignment
--               recency, and proximity to home depot. The weights for each
--               factor can be tuned server-side without changing clients.
-- Parameters:
--   req_start date - start date of the request
--   site_lat double precision - latitude of the request site
--   site_lon double precision - longitude of the request site
-- Returns: table(operator_id uuid, operator_name text, distance_km double precision)
create or replace function rpc_rank_operators(
  req_start date,
  req_end date,
  site_lat double precision,
  site_lon double precision,
  w_distance double precision default 1,
  w_future_assign double precision default 0,
  w_recency double precision default 0,
  w_home_match double precision default 0
)
returns table (
  operator_id uuid,
  operator_name text,
  distance_km double precision
)
language plpgsql
stable
as $$
begin
  if req_start > req_end then
    raise exception 'INVALID_DATE_RANGE';
  end if;

  return query
    select o.id as operator_id,
           o.name as operator_name,
           dist.distance_km
    from operators o
    left join operator_assignments oa
      on oa.operator_id = o.id
     and oa.start_date <= req_end
     and oa.end_date >= req_start
    left join operator_unavailability ou
      on ou.operator_id = o.id
     and ou.start_date <= req_end
     and ou.end_date >= req_start
    -- precompute distance when home coords exist
    left join lateral (
      select (st_distanceSphere(
                 st_makepoint(site_lon, site_lat),
                 st_makepoint(o.home_lon, o.home_lat)
               ) / 1000) as distance_km
    ) dist on (o.home_lat is not null and o.home_lon is not null)
    -- future assignments after request end
    left join lateral (
      select count(*) as future_count
      from operator_assignments oa2
      where oa2.operator_id = o.id
        and oa2.start_date > req_end
    ) fa on true
    -- last assignment before request start
    left join lateral (
      select max(end_date) as last_end
      from operator_assignments oa3
      where oa3.operator_id = o.id
        and oa3.end_date < req_start
    ) la on true
    where oa.operator_id is null
      and ou.operator_id is null
    order by
      (coalesce(dist.distance_km, 1e6) * w_distance) +
      (coalesce(fa.future_count, 0) * w_future_assign) +
      (coalesce(date_part('day', current_date - la.last_end), 1e6) * w_recency) -
      (case
         when dist.distance_km is not null and dist.distance_km <= 50 then 1
         else 0
       end * w_home_match),
      o.name;
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
