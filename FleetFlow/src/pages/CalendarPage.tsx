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
  const [siteFilter, setSiteFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [operatedFilter, setOperatedFilter] = useState('all')
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

  const sites = Array.from(
    new Set(events?.map((e) => e.site).filter((s): s is string => Boolean(s)))
  )
  const statuses = Array.from(
    new Set(
      events
        ?.map((e) => e.contract_status)
        .filter((s): s is string => Boolean(s)),
    ),
  )

  const filteredEvents =
    events?.filter((ev) => {
      if (siteFilter !== 'all' && ev.site !== siteFilter) return false
      if (statusFilter !== 'all' && ev.contract_status !== statusFilter)
        return false
      if (operatedFilter === 'operated' && !ev.operated) return false
      if (operatedFilter === 'non-operated' && ev.operated) return false
      return true
    }) ?? []

  return (
    <div>
      <h1>Calendar</h1>
      <section>
        <h2>Filters</h2>
        <label>
          Site:
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
          >
            <option value='all'>All</option>
            {sites.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value='all'>All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Operated:
          <select
            value={operatedFilter}
            onChange={(e) => setOperatedFilter(e.target.value)}
          >
            <option value='all'>All</option>
            <option value='operated'>Operated</option>
            <option value='non-operated'>Non-operated</option>
          </select>
        </label>
      </section>
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
        events={filteredEvents}
        utilization={utilization ?? []}
        groups={groups ?? []}
        onSelectDate={setSelectedDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
    </div>
  )
}
