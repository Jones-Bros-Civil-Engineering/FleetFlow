import { describe, expect, it } from 'vitest'
import { getWeekDays } from './weeks'

describe('getWeekDays', () => {
  it('returns 7 days starting on Sunday', () => {
    const days = getWeekDays(new Date('2024-02-14'))
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(0)
  })
})
