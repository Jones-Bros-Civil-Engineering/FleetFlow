import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

const rpcMock = vi.hoisted(() => vi.fn())
const fromMock = vi.hoisted(() => vi.fn())
vi.mock('../lib/supabase', () => ({
  supabase: { rpc: rpcMock, from: fromMock },
}))

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  useExampleQuery,
  fetchExample,
  scoreAssets,
  rankOperators,
  offHireAllocation,
  reassignAllocation,
  fetchEvents,
  useEventsQuery,
  fetchEquipmentGroups,
  useEquipmentGroupsQuery,
  fetchOperatorAssignments,
  useOperatorAssignmentsQuery,
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

describe('useEventsQuery', () => {
  beforeEach(() => (useQuery as Mock).mockReset())

  it('calls useQuery with events key and fetcher', () => {
    const fakeResult = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fakeResult)

    const result = useEventsQuery()

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['events'],
      queryFn: fetchEvents,
    })
    expect(result).toBe(fakeResult)
  })
})

describe('fetchEvents', () => {
  beforeEach(() => fromMock.mockReset())

  it('returns parsed events', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ id: '1', date: '2024-01-01', title: 'Ev' }],
      error: null,
    })
    fromMock.mockReturnValue({ select })
    const result = await fetchEvents()
    expect(fromMock).toHaveBeenCalledWith('calendar_events')
    expect(result).toEqual([
      { id: '1', date: new Date('2024-01-01'), title: 'Ev' },
    ])
  })

  it('throws on fetch error', async () => {
    const select = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'fail' },
    })
    fromMock.mockReturnValue({ select })
    await expect(fetchEvents()).rejects.toThrow('fail')
  })
})

describe('useEquipmentGroupsQuery', () => {
  beforeEach(() => (useQuery as Mock).mockReset())

  it('calls useQuery with equipment-groups key and fetcher', () => {
    const fakeResult = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fakeResult)

    const result = useEquipmentGroupsQuery()

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['equipment-groups'],
      queryFn: fetchEquipmentGroups,
    })
    expect(result).toBe(fakeResult)
  })
})

describe('fetchEquipmentGroups', () => {
  beforeEach(() => fromMock.mockReset())

  it('throws on fetch error', async () => {
    const select = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'oops' },
    })
    fromMock.mockReturnValue({ select })
    await expect(fetchEquipmentGroups()).rejects.toThrow('oops')
    expect(fromMock).toHaveBeenCalledWith('equipment_groups')
  })
})

describe('useOperatorAssignmentsQuery', () => {
  beforeEach(() => (useQuery as Mock).mockReset())

  it('calls useQuery with operator assignments key and fetcher', () => {
    const fakeResult = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fakeResult)

    const result = useOperatorAssignmentsQuery()

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['operator-assignments'],
      queryFn: fetchOperatorAssignments,
    })
    expect(result).toBe(fakeResult)
  })
})

describe('fetchOperatorAssignments', () => {
  beforeEach(() => fromMock.mockReset())

  it('returns parsed assignments', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          request_id: 'r1',
          operator_id: 'o1',
          start_date: '2024-01-01',
          end_date: '2024-01-02',
        },
      ],
      error: null,
    })
    fromMock.mockReturnValue({ select })
    const result = await fetchOperatorAssignments()
    expect(fromMock).toHaveBeenCalledWith('operator_assignments')
    expect(result).toEqual([
      {
        id: '1',
        request_id: 'r1',
        operator_id: 'o1',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-02'),
      },
    ])
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

