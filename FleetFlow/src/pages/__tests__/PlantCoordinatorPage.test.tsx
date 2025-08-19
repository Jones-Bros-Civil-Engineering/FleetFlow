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
}))

const rpcMock = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))
vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: rpcMock,
    from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) })),
  },
}))

vi.mock('../../utils/validation', () => ({
  validateExternalHire: vi.fn(),
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
})

