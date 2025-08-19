import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const constraintsSql = readFileSync(
  resolve(__dirname, '../../supabase/constraints.sql'),
  'utf8'
)
const schemaSql = readFileSync(
  resolve(__dirname, '../../supabase/schema.sql'),
  'utf8'
)

describe('Constraints', () => {
  it('prevents overlapping allocations', () => {
    expect(constraintsSql).toContain('constraint allocations_no_overlap')
    expect(constraintsSql).toContain("daterange(start_date, end_date, '[]')")
  })

  it('prevents overlapping operator assignments', () => {
    expect(constraintsSql).toContain('constraint operator_assignments_no_overlap')
    expect(constraintsSql).toContain('operator_id with =')
  })

  it('enforces start_date before end_date', () => {
    expect(schemaSql).toMatch(
      /create table operator_unavailability[\s\S]*?check \(start_date <= end_date\)/
    )
    expect(schemaSql).toMatch(
      /create table hire_requests[\s\S]*?check \(start_date <= end_date\)/
    )
    expect(schemaSql).toMatch(
      /create table allocations[\s\S]*?check \(start_date <= end_date\)/
    )
    expect(schemaSql).toMatch(
      /create table operator_assignments[\s\S]*?check \(start_date <= end_date\)/
    )
  })
})
