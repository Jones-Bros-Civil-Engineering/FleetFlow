import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sql = readFileSync(resolve(__dirname, '../../supabase/policies.sql'), 'utf8')

describe('RLS policies', () => {
  it('restricts external_hires to plant coordinators', () => {
    expect(sql).toContain("alter table external_hires enable row level security")
    expect(sql).toContain(
      "auth.jwt() ->> 'role' in ('plant_coordinator','admin')",
    )
  })

  it('restricts allocations to plant coordinators', () => {
    expect(sql).toContain("alter table allocations enable row level security")
    expect(sql).toContain(
      "auth.jwt() ->> 'role' in ('plant_coordinator','admin')",
    )
  })

  it('restricts operator_assignments to workforce coordinators', () => {
    expect(sql).toContain("alter table operator_assignments enable row level security")
    expect(sql).toContain(
      "auth.jwt() ->> 'role' in ('workforce_coordinator','admin')",
    )
  })

  it('restricts hire_requests to coordinators', () => {
    expect(sql).toContain("alter table hire_requests enable row level security")
    expect(sql).toMatch(
      /auth\.jwt\(\) ->> 'role' in \(\s*'plant_coordinator',\s*'workforce_coordinator',\s*'admin'\s*\)/,
    )
  })

  it('restricts calendar_events to coordinators', () => {
    expect(sql).toContain("alter table calendar_events enable row level security")
    expect(sql).toMatch(
      /auth\.jwt\(\) ->> 'role' in \(\s*'plant_coordinator',\s*'workforce_coordinator',\s*'admin'\s*\)/,
    )
  })

  it('restricts vw_weekly_group_utilization to coordinators', () => {
    expect(sql).toContain(
      'alter view vw_weekly_group_utilization enable row level security',
    )
    expect(sql).toMatch(
      /auth\.jwt\(\) ->> 'role' in \(\s*'plant_coordinator',\s*'workforce_coordinator',\s*'admin'\s*\)/,
    )
  })

  it('restricts equipment_groups to coordinators', () => {
    expect(sql).toContain("alter table equipment_groups enable row level security")
    expect(sql).toMatch(
      /auth\.jwt\(\) ->> 'role' in \(\s*'plant_coordinator',\s*'workforce_coordinator',\s*'admin'\s*\)/,
    )
  })

  it('includes admin role in policies', () => {
    expect(sql).toContain("'admin'")
  })
})
