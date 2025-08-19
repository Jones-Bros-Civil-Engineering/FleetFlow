import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sql = readFileSync(resolve(__dirname, '../../supabase/roles.sql'), 'utf8')

describe('roles', () => {
  it('includes admin in profiles role check', () => {
    expect(sql).toContain("'admin','contract_manager','plant_coordinator','workforce_coordinator'")
  })
})
