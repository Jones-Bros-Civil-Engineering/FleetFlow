-- Returns operators ranked by eligibility and proximity for a request
create or replace function rpc_rank_operators(request_id uuid)
returns table (
  operator_id uuid,
  operator_name text,
  eligible boolean,
  distance_km numeric
)
language sql stable as $$
  with req as (
    select hr.group_id, c.site_lat, c.site_lon
    from hire_requests hr
    join contracts c on c.id = hr.contract_id
    where hr.id = request_id
  ), required_tickets as (
    select grt.ticket_id from group_required_tickets grt join req on req.group_id = grt.group_id
  ), operator_base as (
    select o.id, o.full_name, o.home_lat, o.home_lon
    from operators o
  ), ticket_check as (
    select ob.id,
      bool_and(ot.ticket_id is not null) as eligible
    from operator_base ob
    cross join required_tickets rt
    left join operator_tickets ot on ot.operator_id = ob.id and ot.ticket_id = rt.ticket_id
    group by ob.id
  ), dist as (
    select ob.id,
      round(st_distanceSphere(
        st_makepoint(ob.home_lon, ob.home_lat),
        st_makepoint(req.site_lon, req.site_lat)
      ) / 1000, 1) as distance_km
    from operator_base ob, req
  )
  select ob.id as operator_id,
    ob.full_name as operator_name,
    tc.eligible,
    d.distance_km
  from operator_base ob
  join ticket_check tc on tc.id = ob.id
  join dist d on d.id = ob.id
  order by tc.eligible desc, d.distance_km asc;
$$;
