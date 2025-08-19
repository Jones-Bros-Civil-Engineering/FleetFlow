import { useState } from 'react'
import { getWeekDays } from '../lib/weeks'
import type {
  CalendarEvent,
  EquipmentGroup,
  WeeklyGroupUtilization,
} from '../types'
import EventDetailsDrawer from './EventDetailsDrawer'
import './week-calendar.css'

export interface WeekCalendarProps {
  selectedDate: Date
  events?: CalendarEvent[]
  utilization?: WeeklyGroupUtilization[]
  groups?: EquipmentGroup[]
  onSelectDate?: (date: Date) => void
  onPrevWeek?: () => void
  onNextWeek?: () => void
  onOffHire?: (event: CalendarEvent) => void
  onReassign?: (event: CalendarEvent) => void
}

export default function WeekCalendar({
  selectedDate,
  events,
  utilization,
  groups,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onOffHire,
  onReassign,
}: WeekCalendarProps) {
  const days = getWeekDays(selectedDate)
  const weekStart = days[0]
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  )

  return (
    <div>
      <div className='week-calendar'>
        <button
          className='nav-button'
          onClick={() => onPrevWeek?.()}
          aria-label='previous week'
        >
          ‹
        </button>
        <div className='day-labels'>
          {days.map((day) => {
            const isSelected = day.toDateString() === selectedDate.toDateString()
            const label = day.toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
            })
            const dayEvents =
              events?.filter((e) => {
                const date = e.date instanceof Date ? e.date : new Date(e.date)
                return date.toDateString() === day.toDateString()
              }) ?? []
            return (
              <div key={day.toISOString()} className='day-column'>
                <button
                  className={`day-label${isSelected ? ' selected' : ''}`}
                  onClick={() => onSelectDate?.(day)}
                >
                  {label}
                </button>
                {dayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    className='event'
                    onClick={() => setSelectedEvent(ev)}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
        <button
          className='nav-button'
          onClick={() => onNextWeek?.()}
          aria-label='next week'
        >
          ›
        </button>
      </div>
      {groups && groups.length > 0 && (
        <table className='utilization-table'>
          <thead>
            <tr>
              <th>Group</th>
              <th>On hire</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const util = utilization?.find(
                (u) =>
                  u.group_id === g.id &&
                  new Date(u.week_start).toDateString() ===
                    weekStart.toDateString()
              )
              return (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{util?.on_hire_count ?? 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <EventDetailsDrawer
        event={selectedEvent}
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        onOffHire={onOffHire}
        onReassign={onReassign}
      />
    </div>
  )
}
