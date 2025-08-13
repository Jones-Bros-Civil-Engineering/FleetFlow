import { getWeekDays } from '../lib/weeks'
import type { CalendarEvent } from '../types'
import './week-calendar.css'

export interface WeekCalendarProps {
  selectedDate: Date
  events?: CalendarEvent[]
  onSelectDate?: (date: Date) => void
  onPrevWeek?: () => void
  onNextWeek?: () => void
}

export default function WeekCalendar({
  selectedDate,
  events,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: WeekCalendarProps) {
  const days = getWeekDays(selectedDate)

  return (
    <div className='week-calendar'>
      <button className='nav-button' onClick={() => onPrevWeek?.()} aria-label='previous week'>
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
                <div key={ev.id} className='event'>
                  {ev.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <button className='nav-button' onClick={() => onNextWeek?.()} aria-label='next week'>
        ›
      </button>
    </div>
  )
}
