import { useState } from 'react'
import WeekCalendar from '../components/WeekCalendar'
import { useEventsQuery } from '../api/queries'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { data: events, isLoading, error } = useEventsQuery()

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
      <WeekCalendar
        selectedDate={selectedDate}
        events={events ?? []}
        onSelectDate={setSelectedDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
    </div>
  )
}
