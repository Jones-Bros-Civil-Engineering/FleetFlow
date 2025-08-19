import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sql = readFileSync(resolve(__dirname, '../../supabase/policies.sql'), 'utf8')

describe('RLS policies', () => {
  it('restricts external_hires to plant coordinators', () => {
    expect(sql).toContain("alter table external_hires enable row level security")
    expect(sql).toContain(
      "auth.jwt() ->> 'role' in ('plant_coordinator', 'admin')",
    )
  })

  it('restricts allocations to plant coordinators', () => {
    expect(sql).toContain("alter table allocations enable row level security")
    expect(sql).toContain(
      "auth.jwt() ->> 'role' in ('plant_coordinator', 'admin')",
    )
  })

  it('restricts operator_assignments to workforce coordinators', () => {
    expect(sql).toContain("alter table operator_assignments enable row level security")
    expect(sql).toContain(
      "auth.jwt() ->> 'role' in ('workforce_coordinator', 'admin')",
    )
  })
})
