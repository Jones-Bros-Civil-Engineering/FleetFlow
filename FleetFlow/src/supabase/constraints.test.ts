import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sql = readFileSync(resolve(__dirname, '../../supabase/constraints.sql'), 'utf8')

describe('Constraints', () => {
  it('prevents overlapping allocations', () => {
    expect(sql).toContain('constraint allocations_no_overlap')
    expect(sql).toContain("daterange(start_date, end_date, '[]')")
  })

  it('prevents overlapping operator assignments', () => {
    expect(sql).toContain('constraint operator_assignments_no_overlap')
    expect(sql).toContain('operator_id with =')
    expect(sql).toContain("constraint operator_assignments_date_order")
  })
})
