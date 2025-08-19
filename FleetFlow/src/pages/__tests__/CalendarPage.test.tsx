// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CalendarPage from '../CalendarPage'
import type { CalendarEvent } from '../../types'

const offHireMock = vi.hoisted(() => vi.fn())
const reassignMock = vi.hoisted(() => vi.fn())

let events: CalendarEvent[] = [
  { id: '1', title: 'Event1', date: new Date() },
]

vi.mock('../../api/queries', () => ({
  useEventsQuery: () => ({ data: events, isLoading: false, error: null }),
  useEquipmentGroupsQuery: () => ({ data: [] }),
  useAllocationsQuery: () => ({ data: [] }),
  useRequestsQuery: () => ({ data: [] }),
  useWeeklyGroupUtilizationQuery: () => ({ data: [] }),
  offHireAllocation: offHireMock,
  reassignAllocation: reassignMock,
}))

const renderPage = () => {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <CalendarPage />
    </QueryClientProvider>,
  )
}

describe('CalendarPage event actions', () => {
  beforeEach(() => {
    events = [{ id: '1', title: 'Event1', date: new Date() }]
    offHireMock.mockReset()
    reassignMock.mockReset()
  })
  afterEach(() => cleanup())

  it('off-hire removes event', async () => {
    offHireMock.mockResolvedValueOnce(undefined)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Event1' }))
    fireEvent.click(screen.getAllByText('Off-hire').at(-1)!)
    await waitFor(() => expect(offHireMock).toHaveBeenCalledWith('1'))
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Event1' }),
      ).toBeNull(),
    )
  })

  it('reassign updates event title', async () => {
    reassignMock.mockResolvedValueOnce({
      id: '1',
      title: 'Updated',
      date: new Date(),
    })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Event1' }))
    fireEvent.click(screen.getAllByText('Reassign').at(-1)!)
    await waitFor(() => expect(reassignMock).toHaveBeenCalledWith('1'))
    await waitFor(() => expect(screen.getByText('Updated')).toBeTruthy())
  })
})
