import { describe, expect, it } from 'vitest'
import { getWeekDays } from './weeks'

describe('getWeekDays', () => {
  it('returns 7 days starting on Monday', () => {
    const days = getWeekDays(new Date('2024-02-14'))
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1)
  })

  it('handles fiscal week boundary around April 1', () => {
    const endOfFiscal = getWeekDays(new Date('2024-03-31'))
    expect(endOfFiscal[0].toISOString().slice(0, 10)).toBe('2024-03-25')

    const startOfFiscal = getWeekDays(new Date('2024-04-01'))
    expect(startOfFiscal[0].toISOString().slice(0, 10)).toBe('2024-04-01')
  })
})
