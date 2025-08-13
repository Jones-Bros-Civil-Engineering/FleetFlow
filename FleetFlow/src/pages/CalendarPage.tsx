import { useState } from 'react'
import WeekCalendar from '../components/WeekCalendar'
import {
  useEventsQuery,
  useEquipmentGroupsQuery,
  useAllocationsQuery,
  useRequestsQuery,
  useWeeklyGroupUtilizationQuery,
} from '../api/queries'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { data: events, isLoading, error } = useEventsQuery()
  const { data: groups } = useEquipmentGroupsQuery()
  const { data: allocations } = useAllocationsQuery()
  const { data: requests } = useRequestsQuery()
  const { data: utilization } = useWeeklyGroupUtilizationQuery()

  if (isLoading) {
    return <div>Loading events...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const handlePrevWeek = () =>
    setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))
  const handleNextWeek = () =>
    setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))

  return (
    <div>
      <h1>Calendar</h1>
      <section>
        <h2>Equipment Groups</h2>
        <ul>
          {groups?.map((g) => (
            <li key={g.id}>{g.name}</li>
          ))}
        </ul>
        <div>Requests: {requests?.length ?? 0}</div>
        <div>Allocations: {allocations?.length ?? 0}</div>
      </section>
      <WeekCalendar
        selectedDate={selectedDate}
        events={events ?? []}
        utilization={utilization ?? []}
        groups={groups ?? []}
        onSelectDate={setSelectedDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
    </div>
  )
}
