// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Request } from '../../types'

const request: Request = {
  id: 'req1',
  contract_id: 'c1',
  group_id: 'g1',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-02'),
  quantity: 1,
  operated: true,
  site_lat: 10,
  site_lon: 20,
}

const rankOperatorsMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue([
    { operator_id: 'op1', operator_name: 'Op One', distance_km: 5 },
  ]),
)

vi.mock('../../api/queries', () => ({
  useRequestsQuery: () => ({ data: [request], isLoading: false, error: null }),
  useOperatorAssignmentsQuery: () => ({ data: [] }),
  rankOperators: rankOperatorsMock,
}))

const insertMock = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))
const fromMock = vi.hoisted(() => vi.fn(() => ({ insert: insertMock })))
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}))

const validateOperatorAssignmentMock = vi.hoisted(() => vi.fn())
vi.mock('../../utils/validation', () => ({
  validateOperatorAssignment: validateOperatorAssignmentMock,
}))

import WorkforceCoordinatorPage from '../WorkforceCoordinatorPage'
import { rankOperators } from '../../api/queries'

afterEach(() => cleanup())

const renderPage = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <WorkforceCoordinatorPage />
    </QueryClientProvider>,
  )
}

describe('WorkforceCoordinatorPage', () => {
  beforeEach(() => {
    rankOperatorsMock.mockClear()
    insertMock.mockClear()
    fromMock.mockClear()
    validateOperatorAssignmentMock.mockReset()
  })

  it('ranks operators and displays matches', async () => {
    renderPage()
    fireEvent.click(screen.getByText('Rank Operators'))
    await screen.findByText(/Op One/)
    expect(rankOperators).toHaveBeenCalledWith(
      request.start_date,
      request.end_date,
      request.site_lat,
      request.site_lon,
    )
  })

  it('assigns operator via insert', async () => {
    renderPage()
    fireEvent.click(screen.getByText('Rank Operators'))
    await screen.findByText(/Op One/)
    fireEvent.click(screen.getByText('Assign'))
    await screen.findByText('Operator assigned!')
    expect(fromMock).toHaveBeenCalledWith('operator_assignments')
    expect(insertMock).toHaveBeenCalledWith({
      request_id: 'req1',
      operator_id: 'op1',
      start_date: request.start_date.toISOString().slice(0, 10),
      end_date: request.end_date.toISOString().slice(0, 10),
    })
  })

  it('shows validation error when operator missing tickets', async () => {
    validateOperatorAssignmentMock.mockRejectedValue(
      new Error('MISSING_REQUIRED_TICKETS'),
    )
    renderPage()
    fireEvent.click(screen.getByText('Rank Operators'))
    await screen.findByText(/Op One/)
    fireEvent.click(screen.getByText('Assign'))
    await screen.findByRole('alert')
    expect(screen.getByRole('alert').textContent).toMatch(
      /missing required tickets/i,
    )
  })

  it('shows conflict error when operator already assigned', async () => {
    insertMock.mockResolvedValueOnce({ error: { message: 'ASSIGNMENT_OVERLAP' } })
    renderPage()
    fireEvent.click(screen.getByText('Rank Operators'))
    await screen.findByText(/Op One/)
    fireEvent.click(screen.getByText('Assign'))
    await screen.findByRole('alert')
    expect(screen.getByRole('alert').textContent).toMatch(/already assigned/i)
  })
})

