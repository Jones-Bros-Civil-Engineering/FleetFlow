import { useState } from 'react'
import { FixedSizeList, type ListChildComponentProps } from 'react-window'
import { getWeekDays } from '../lib/weeks'
import type {
  CalendarEvent,
  EquipmentGroup,
  WeeklyGroupUtilization,
} from '../types'
import EventDetailsDrawer from './EventDetailsDrawer'
import './week-calendar.css'

const ROW_HEIGHT = 35

interface UtilRowData {
  groups: EquipmentGroup[]
  utilization?: WeeklyGroupUtilization[]
  weekStart: Date
}

function UtilizationRow({
  index,
  style,
  data,
}: ListChildComponentProps<UtilRowData>) {
  const group = data.groups[index]
  const util = data.utilization?.find(
    (u) =>
      u.group_id === group.id &&
      new Date(u.week_start).toDateString() === data.weekStart.toDateString(),
  )
  return (
    <div style={{ ...style, display: 'flex' }} className='utilization-row'>
      <div style={{ flex: 1 }}>{group.name}</div>
      <div style={{ width: '5rem', textAlign: 'center' }}>
        {util?.on_hire_count ?? 0}
      </div>
    </div>
  )
}

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
                    {ev.asset_code && ` - ${ev.asset_code}`}
                    {ev.operator_name && ` - ${ev.operator_name}`}
                    {ev.contract_status && ` (${ev.contract_status})`}
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
        <div className='utilization-table'>
          <div className='utilization-row header'>
            <div style={{ flex: 1 }}>Group</div>
            <div style={{ width: '5rem', textAlign: 'center' }}>On hire</div>
          </div>
          <FixedSizeList
            className='utilization-list'
            height={Math.min(groups.length, 10) * ROW_HEIGHT}
            itemCount={groups.length}
            itemSize={ROW_HEIGHT}
            width='100%'
            itemData={{ groups, utilization, weekStart }}
          >
            {UtilizationRow}
          </FixedSizeList>
        </div>
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
