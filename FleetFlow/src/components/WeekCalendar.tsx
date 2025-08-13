import { getWeekDays } from '../lib/weeks'
import './week-calendar.css'

export interface WeekCalendarProps {
  selectedDate: Date
  onSelectDate?: (date: Date) => void
  onPrevWeek?: () => void
  onNextWeek?: () => void
}

export default function WeekCalendar({
  selectedDate,
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
          return (
            <button
              key={day.toISOString()}
              className={`day-label${isSelected ? ' selected' : ''}`}
              onClick={() => onSelectDate?.(day)}
            >
              {label}
            </button>
          )
        })}
      </div>
      <button className='nav-button' onClick={() => onNextWeek?.()} aria-label='next week'>
        ›
      </button>
    </div>
  )
}
