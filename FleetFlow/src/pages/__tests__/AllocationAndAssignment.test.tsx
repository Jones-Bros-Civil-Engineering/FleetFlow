// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Request } from '../../types'

// Shared request templates
const plantRequest: Request = {
  id: 'req-plant',
  contract_id: 'c1',
  group_id: 'g1',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-02'),
  quantity: 1,
  operated: false,
  site_lat: 0,
  site_lon: 0,
}

const workforceRequest: Request = {
  id: 'req-work',
  contract_id: 'c2',
  group_id: 'g1',
  start_date: new Date('2024-02-01'),
  end_date: new Date('2024-02-02'),
  quantity: 1,
  operated: true,
  site_lat: 10,
  site_lon: 20,
}

// Mutable reference used by mocked hooks
let requestsData: Request[] = [plantRequest]

const scoreAssetsMock = vi.hoisted(() => vi.fn())
const rankOperatorsMock = vi.hoisted(() => vi.fn())
const createExternalHireMock = vi.hoisted(() => vi.fn())

  vi.mock('../../api/queries', () => ({
    useRequestsQuery: () => ({ data: requestsData, isLoading: false, error: null }),
    useAllocationsQuery: () => ({ data: [] }),
    useOperatorAssignmentsQuery: () => ({ data: [] }),
    scoreAssets: scoreAssetsMock,
    rankOperators: rankOperatorsMock,
    createExternalHire: createExternalHireMock,
  }))

const rpcMock = vi.hoisted(() => vi.fn())
const insertMock = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))
const fromMock = vi.hoisted(() => vi.fn(() => ({ insert: insertMock })))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: rpcMock,
    from: fromMock,
  },
}))

const validateExternalHireMock = vi.hoisted(() => vi.fn().mockResolvedValue([]))
const validateOperatorAssignmentMock = vi.hoisted(() => vi.fn())

vi.mock('../../utils/validation', () => ({
  validateExternalHire: validateExternalHireMock,
  validateOperatorAssignment: validateOperatorAssignmentMock,
}))

import PlantCoordinatorPage from '../PlantCoordinatorPage'
import WorkforceCoordinatorPage from '../WorkforceCoordinatorPage'
import { supabase } from '../../lib/supabase'
import { rankOperators } from '../../api/queries'

afterEach(() => cleanup())

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('Plant allocation workflow', () => {
    beforeEach(() => {
      rpcMock.mockReset()
      insertMock.mockClear()
      fromMock.mockClear()
      validateExternalHireMock.mockReset()
      createExternalHireMock.mockReset()
      requestsData = [plantRequest]
    })

  it('allocates asset internally', async () => {
    rpcMock.mockResolvedValueOnce({ error: null })
    renderWithClient(<PlantCoordinatorPage />)
    fireEvent.click(screen.getByText('Allocate Assets'))
    await screen.findByText('1 asset(s) allocated internally.')
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_allocate_best_asset', {
      request_id: plantRequest.id,
    })
  })

    it('falls back to external hire when no asset is available', async () => {
      rpcMock.mockResolvedValueOnce({ error: { message: 'NO_INTERNAL_ASSET_AVAILABLE' } })
      validateExternalHireMock.mockResolvedValueOnce([])
      renderWithClient(<PlantCoordinatorPage />)
      fireEvent.click(screen.getByText('Allocate Assets'))
      await screen.findByText('1 external hire(s) created.')
      expect(createExternalHireMock).toHaveBeenCalledWith(plantRequest.id)
    })
})

describe('Workforce assignment workflow', () => {
  beforeEach(() => {
    requestsData = [workforceRequest]
    rankOperatorsMock.mockReset()
    insertMock.mockClear()
    fromMock.mockClear()
    validateOperatorAssignmentMock.mockReset()
  })

  it('ranks operators for a request', async () => {
    rankOperatorsMock.mockResolvedValueOnce([
      { operator_id: 'op1', operator_name: 'Op One', distance_km: 5 },
    ])
    renderWithClient(<WorkforceCoordinatorPage />)
    fireEvent.click(screen.getByText('Rank Operators'))
    await screen.findByText(/Op One/)
    expect(rankOperators).toHaveBeenCalledWith(
      workforceRequest.start_date,
      workforceRequest.end_date,
      workforceRequest.site_lat,
      workforceRequest.site_lon,
    )
  })

  it('assigns a ranked operator', async () => {
    rankOperatorsMock.mockResolvedValueOnce([
      { operator_id: 'op1', operator_name: 'Op One', distance_km: 5 },
    ])
    renderWithClient(<WorkforceCoordinatorPage />)
    fireEvent.click(screen.getByText('Rank Operators'))
    await screen.findByText(/Op One/)
    fireEvent.click(screen.getByText('Assign'))
    await screen.findByText('Operator assigned!')
    expect(fromMock).toHaveBeenCalledWith('operator_assignments')
    expect(insertMock).toHaveBeenCalledWith({
      request_id: workforceRequest.id,
      operator_id: 'op1',
      start_date: workforceRequest.start_date.toISOString().slice(0, 10),
      end_date: workforceRequest.end_date.toISOString().slice(0, 10),
    })
  })
})
