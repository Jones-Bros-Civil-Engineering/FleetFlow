import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import WeekCalendar from './WeekCalendar'

describe('WeekCalendar', () => {
  it('renders seven day buttons', () => {
    const html = renderToString(
      <WeekCalendar selectedDate={new Date('2024-02-14')} />
    )
    const matches = html.match(/<button class="day-label/g) ?? []
    expect(matches.length).toBe(7)
  })
})
