import { describe, expect, it } from 'vitest'
import { getWeekDays } from './weeks'

describe('getWeekDays', () => {
  it('returns 7 days starting on Monday', () => {
    const days = getWeekDays(new Date('2024-02-14'))
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1)
  })

  it('calculates expected week starts for known dates', () => {
    const cases: Array<[string, string]> = [
      ['2024-01-03', '2024-01-01'],
      ['2024-02-29', '2024-02-26'],
      ['2024-06-23', '2024-06-17'],
    ]
    cases.forEach(([input, monday]) => {
      const weekStart = getWeekDays(new Date(input))[0]
      expect(weekStart.toISOString().slice(0, 10)).toBe(monday)
    })
  })

  it('handles fiscal week boundary around April 1', () => {
    const endOfFiscal = getWeekDays(new Date('2024-03-31'))
    expect(endOfFiscal[0].toISOString().slice(0, 10)).toBe('2024-03-25')

    const startOfFiscal = getWeekDays(new Date('2024-04-01'))
    expect(startOfFiscal[0].toISOString().slice(0, 10)).toBe('2024-04-01')
  })
})
