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
  operated: false,
  site_lat: 0,
  site_lon: 0,
}

const scoreAssetsMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue([{ asset_code: 'A1', score: 1 }]),
)

vi.mock('../../api/queries', () => ({
  useRequestsQuery: () => ({ data: [request], isLoading: false, error: null }),
  useAllocationsQuery: () => ({ data: [] }),
  scoreAssets: scoreAssetsMock,
  createExternalHire: vi.fn().mockResolvedValue(undefined),
}))

const rpcMock = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))
vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: rpcMock,
    from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) })),
  },
}))

const validateExternalHireMock = vi.hoisted(() => vi.fn().mockResolvedValue([]))
vi.mock('../../utils/validation', () => ({
  validateExternalHire: validateExternalHireMock,
}))

import PlantCoordinatorPage from '../PlantCoordinatorPage'
import { supabase } from '../../lib/supabase'
import { scoreAssets } from '../../api/queries'

afterEach(() => cleanup())

const renderPage = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <PlantCoordinatorPage />
    </QueryClientProvider>,
  )
}

describe('PlantCoordinatorPage', () => {
  beforeEach(() => {
    scoreAssetsMock.mockClear()
    rpcMock.mockClear()
    validateExternalHireMock.mockClear()
  })

  it('scores assets and displays results', async () => {
    renderPage()
    fireEvent.click(screen.getByText('Score Assets'))
    await screen.findByText('A1')
    expect(scoreAssets).toHaveBeenCalledWith('req1')
  })

  it('allocates assets via RPC', async () => {
    renderPage()
    fireEvent.click(screen.getByText('Allocate Assets'))
    await screen.findByText('1 asset(s) allocated internally.')
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_allocate_best_asset', {
      request_id: 'req1',
    })
  })

  it('offers substitution and retries allocation', async () => {
    rpcMock
      .mockResolvedValueOnce({ error: { message: 'NO_INTERNAL_ASSET_AVAILABLE' } })
      .mockResolvedValueOnce({ error: null })
    validateExternalHireMock.mockResolvedValueOnce([
      { group_id: 'g1', substitute_group_id: 'g2' },
    ])
    const promptSpy = vi
      .spyOn(window, 'prompt')
      .mockReturnValueOnce('g2')
    renderPage()
    fireEvent.click(screen.getByText('Allocate Assets'))
    await screen.findByText('1 asset(s) allocated internally.')
    expect(promptSpy).toHaveBeenCalled()
    expect(supabase.rpc).toHaveBeenNthCalledWith(1, 'rpc_allocate_best_asset', {
      request_id: 'req1',
    })
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, 'rpc_allocate_best_asset', {
      request_id: 'req1',
      group_id: 'g2',
    })
    promptSpy.mockRestore()
  })

  it('shows friendly error on overlap', async () => {
    rpcMock.mockResolvedValueOnce({ error: { message: 'ALLOCATION_OVERLAP' } })
    renderPage()
    fireEvent.click(screen.getByText('Allocate Assets'))
    await screen.findByText(/overlaps with existing allocation/)
  })
})

