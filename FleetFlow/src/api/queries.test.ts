import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

const rpcMock = vi.hoisted(() => vi.fn())
vi.mock('../lib/supabase', () => ({
  supabase: { rpc: rpcMock },
}))

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  useExampleQuery,
  fetchExample,
  useEventsQuery,
  fetchEvents,
  useEquipmentGroupsQuery,
  fetchEquipmentGroups,
  useAllocationsQuery,
  fetchAllocations,
  useRequestsQuery,
  fetchRequests,
  useWeeklyGroupUtilizationQuery,
  fetchWeeklyGroupUtilization,
  useWeekStartsQuery,
  fetchWeekStarts,
  useOperatorAssignmentsQuery,
  fetchOperatorAssignments,
  scoreAssets,
  rankOperators,
  offHireAllocation,
  reassignAllocation,
} from './queries'

describe('useExampleQuery', () => {
  it('calls useQuery with examples key and fetcher', () => {
    const fakeResult = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fakeResult)

    const result = useExampleQuery()

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['examples'],
      queryFn: fetchExample,
    })
    expect(result).toBe(fakeResult)
  })
})

describe('other query hooks', () => {
  beforeEach(() => {
    ;(useQuery as Mock).mockReset()
    rpcMock.mockReset()
  })

  it('uses correct key for events', () => {
    const fake = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useEventsQuery()
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['events'],
      queryFn: fetchEvents,
    })
    expect(result).toBe(fake)
  })

  it('uses correct key for equipment groups', () => {
    const fake = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useEquipmentGroupsQuery()
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['equipment-groups'],
      queryFn: fetchEquipmentGroups,
    })
    expect(result).toBe(fake)
  })

  it('uses correct key for allocations', () => {
    const fake = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useAllocationsQuery()
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['allocations'],
      queryFn: fetchAllocations,
    })
    expect(result).toBe(fake)
  })

  it('uses correct key for requests', () => {
    const fake = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useRequestsQuery()
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['requests'],
      queryFn: fetchRequests,
    })
    expect(result).toBe(fake)
  })

  it('uses correct key for utilization', () => {
    const fake = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useWeeklyGroupUtilizationQuery()
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['weekly-group-utilization'],
      queryFn: fetchWeeklyGroupUtilization,
    })
    expect(result).toBe(fake)
  })

  it('passes dates to week starts query', async () => {
    const fake = { data: [] }
    const start = new Date('2024-01-01')
    const end = new Date('2024-01-07')
    rpcMock.mockResolvedValue({ data: [], error: null })
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useWeekStartsQuery(start, end)
    const call = (useQuery as Mock).mock.calls.at(-1)![0]
    expect(call.queryKey).toEqual(['week-starts', start, end])
    await call.queryFn()
    expect(rpcMock).toHaveBeenCalledWith('rpc_week_starts', {
      start_date: '2024-01-01',
      end_date: '2024-01-07',
    })
    expect(result).toBe(fake)
  })

  it('uses correct key for operator assignments', () => {
    const fake = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fake)
    const result = useOperatorAssignmentsQuery()
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['operator-assignments'],
      queryFn: fetchOperatorAssignments,
    })
    expect(result).toBe(fake)
  })
})

describe('scoreAssets', () => {
  beforeEach(() => rpcMock.mockReset())

  it('calls RPC and returns scores', async () => {
    rpcMock.mockResolvedValue({ data: [{ asset_code: 'A1', score: 1 }], error: null })
    const result = await scoreAssets('req1')
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_score_assets', {
      request_id: 'req1',
    })
    expect(result).toEqual([{ asset_code: 'A1', score: 1 }])
  })

  it('throws on RPC error', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'fail' } })
    await expect(scoreAssets('req1')).rejects.toThrow('fail')
  })
})

describe('rankOperators', () => {
  beforeEach(() => rpcMock.mockReset())

  it('calls RPC with date and location params', async () => {
    rpcMock.mockResolvedValue({
      data: [{ operator_id: 'op1', operator_name: 'Op', distance_km: 1 }],
      error: null,
    })
    const start = new Date('2024-01-01')
    const end = new Date('2024-01-02')
    const result = await rankOperators(start, end, 1, 2)
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_rank_operators', {
      req_start: '2024-01-01',
      req_end: '2024-01-02',
      site_lat: 1,
      site_lon: 2,
    })
    expect(result).toEqual([
      { operator_id: 'op1', operator_name: 'Op', distance_km: 1 },
    ])
  })
})

describe('offHireAllocation', () => {
  beforeEach(() => rpcMock.mockReset())

  it('calls RPC to off-hire allocation', async () => {
    rpcMock.mockResolvedValue({ error: null })
    await offHireAllocation('alloc1')
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_off_hire_allocation', {
      allocation_id: 'alloc1',
    })
  })
})

describe('reassignAllocation', () => {
  beforeEach(() => rpcMock.mockReset())

  it('returns parsed event from RPC', async () => {
    rpcMock.mockResolvedValue({
      data: { id: 'e1', title: 'Ev', date: '2024-01-01' },
      error: null,
    })
    const result = await reassignAllocation('alloc1')
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_reassign_allocation', {
      allocation_id: 'alloc1',
    })
    expect(result).toEqual({ id: 'e1', title: 'Ev', date: new Date('2024-01-01') })
  })

  it('throws on overlap error', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'ALLOCATION_OVERLAP' } })
    await expect(reassignAllocation('alloc1')).rejects.toThrow('ALLOCATION_OVERLAP')
  })
})

