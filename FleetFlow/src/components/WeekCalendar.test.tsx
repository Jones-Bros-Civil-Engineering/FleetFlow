// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import WeekCalendar from './WeekCalendar'
import type {
  CalendarEvent,
  EquipmentGroup,
  WeeklyGroupUtilization,
} from '../types'

afterEach(() => cleanup())

describe('WeekCalendar', () => {
  it('renders seven day buttons', () => {
    render(<WeekCalendar selectedDate={new Date('2024-02-14')} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(7)
  })

  it('triggers date selection when day clicked', () => {
    const onSelectDate = vi.fn()
    render(
      <WeekCalendar selectedDate={new Date('2024-02-14')} onSelectDate={onSelectDate} />,
    )
    fireEvent.click(screen.getByText('14 Wed'))
    expect(onSelectDate).toHaveBeenCalled()
  })

  it('opens event details when event clicked', async () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Test',
        date: new Date('2024-02-14'),
        asset_code: 'A1',
        contract_status: 'Active',
      },
    ]
    render(
      <WeekCalendar selectedDate={new Date('2024-02-14')} events={events} />,
    )
    fireEvent.click(screen.getByText(/Test/))
    expect(await screen.findByText('Off-hire')).toBeTruthy()
  })

  it('virtualizes equipment group rows', () => {
    const groups: EquipmentGroup[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      name: `Group ${i}`,
    }))
    const utilization: WeeklyGroupUtilization[] = groups.map((g) => ({
      group_id: g.id,
      week_start: new Date('2024-02-12'),
      contract_id: 'c1',
      on_hire_count: Number(g.id),
    }))
    render(
      <WeekCalendar
        selectedDate={new Date('2024-02-14')}
        groups={groups}
        utilization={utilization}
      />,
    )
    expect(screen.getByText('Group 0')).toBeTruthy()
    expect(screen.queryByText('Group 19')).toBeNull()
    // verify not all rows are rendered at once
    const rowCount = document.querySelectorAll('.utilization-row').length
    expect(rowCount).toBeLessThan(groups.length + 1)
  })
})

