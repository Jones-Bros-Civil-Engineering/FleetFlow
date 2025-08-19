-- Function: rpc_rank_operators
-- Description: Returns available operators ranked by name, excluding those
--               with existing assignments or unavailability overlapping the
--               requested dates.
-- Parameters:
--   req_start date - start date of the request
--   site_lat double precision - latitude of the request site
--   site_lon double precision - longitude of the request site
-- Returns: table(operator_id uuid, operator_name text, distance_km double precision)
create or replace function rpc_rank_operators(
  req_start date,
  req_end date,
  site_lat double precision,
  site_lon double precision
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
           case
             when o.home_lat is not null and o.home_lon is not null then
               (st_distanceSphere(
                  st_makepoint(site_lon, site_lat),
                  st_makepoint(o.home_lon, o.home_lat)
                ) / 1000)
             else null
           end as distance_km
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
    order by distance_km nulls last, o.name;
exception
  when insufficient_privilege then
    raise exception 'UNAUTHORIZED';
end;
$$;
