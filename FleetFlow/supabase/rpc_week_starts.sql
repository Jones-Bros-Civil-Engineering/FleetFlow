-- Function: rpc_week_starts
-- Description: Returns canonical week start dates (Mondays) between two dates.
-- Parameters:
--   start_date date - first date in range
--   end_date date - last date in range
-- Returns: table(week_start date)
create or replace function rpc_week_starts(
  start_date date,
  end_date date
)
returns table (
  week_start date
)
language sql
as $$
  select generate_series(
    date_trunc('week', start_date),
    date_trunc('week', end_date),
    interval '1 week'
  )::date as week_start;
$$;
