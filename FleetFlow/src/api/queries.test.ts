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
  fetchRequests,
  useRequestsQuery,
  fetchOperatorAssignments,
  useOperatorAssignmentsQuery,
  fetchExternalHires,
  useExternalHiresQuery,
  createExternalHire,
  updateExternalHire,
  cancelExternalHire,
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

  it('returns parsed groups', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ id: '1', name: 'Grp' }],
      error: null,
    })
    fromMock.mockReturnValue({ select })
    const result = await fetchEquipmentGroups()
    expect(fromMock).toHaveBeenCalledWith('vw_equipment_groups')
    expect(result).toEqual([{ id: '1', name: 'Grp' }])
  })

  it('throws on fetch error', async () => {
    const select = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'oops' },
    })
    fromMock.mockReturnValue({ select })
    await expect(fetchEquipmentGroups()).rejects.toThrow('oops')
    expect(fromMock).toHaveBeenCalledWith('vw_equipment_groups')
  })
})

describe('useRequestsQuery', () => {
  beforeEach(() => (useQuery as Mock).mockReset())

  it('calls useQuery with requests key and fetcher', () => {
    const fakeResult = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fakeResult)

    const result = useRequestsQuery()

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['requests'],
      queryFn: fetchRequests,
    })
    expect(result).toBe(fakeResult)
  })
})

describe('fetchRequests', () => {
  beforeEach(() => fromMock.mockReset())

  it('returns parsed requests', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          contract_id: '1',
          group_id: '2',
          start_date: '2024-01-01',
          end_date: '2024-01-02',
          quantity: 1,
          operated: false,
          site_lat: 0,
          site_lon: 0,
        },
      ],
      error: null,
    })
    fromMock.mockReturnValue({ select })
    const result = await fetchRequests()
    expect(fromMock).toHaveBeenCalledWith('vw_hire_requests')
    expect(result).toEqual([
      {
        id: '1',
        contract_id: '1',
        group_id: '2',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-02'),
        quantity: 1,
        operated: false,
        site_lat: 0,
        site_lon: 0,
      },
    ])
  })

  it('throws on fetch error', async () => {
    const select = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'bad' },
    })
    fromMock.mockReturnValue({ select })
    await expect(fetchRequests()).rejects.toThrow('bad')
    expect(fromMock).toHaveBeenCalledWith('vw_hire_requests')
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
    expect(fromMock).toHaveBeenCalledWith('vw_operator_assignments')
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

describe('useExternalHiresQuery', () => {
  beforeEach(() => (useQuery as Mock).mockReset())

  it('calls useQuery with external hires key and fetcher', () => {
    const fakeResult = { data: [] }
    ;(useQuery as Mock).mockReturnValue(fakeResult)

    const result = useExternalHiresQuery()

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['external-hires'],
      queryFn: fetchExternalHires,
    })
    expect(result).toBe(fakeResult)
  })
})

describe('fetchExternalHires', () => {
  beforeEach(() => fromMock.mockReset())

  it('returns parsed hires', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ id: 1, contract_id: 1, request_id: 1 }],
      error: null,
    })
    fromMock.mockReturnValue({ select })
    const result = await fetchExternalHires()
    expect(fromMock).toHaveBeenCalledWith('vw_external_hires')
    expect(result).toEqual([{ id: '1', contract_id: '1', request_id: '1' }])
  })
})

describe('createExternalHire', () => {
  beforeEach(() => fromMock.mockReset())

  it('inserts hire', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    fromMock.mockReturnValue({ insert })
    await createExternalHire('1')
    expect(fromMock).toHaveBeenCalledWith('external_hires')
    expect(insert).toHaveBeenCalledWith({ request_id: '1' })
  })
})

describe('updateExternalHire', () => {
  beforeEach(() => fromMock.mockReset())

  it('updates hire', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn(() => ({ eq }))
    fromMock.mockReturnValue({ update })
    await updateExternalHire('1', { request_id: '2' })
    expect(fromMock).toHaveBeenCalledWith('external_hires')
    expect(update).toHaveBeenCalledWith({ request_id: '2' })
    expect(eq).toHaveBeenCalledWith('id', '1')
  })
})

describe('cancelExternalHire', () => {
  beforeEach(() => fromMock.mockReset())

  it('deletes hire', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn(() => ({ eq }))
    fromMock.mockReturnValue({ delete: del })
    await cancelExternalHire('1')
    expect(fromMock).toHaveBeenCalledWith('external_hires')
    expect(del).toHaveBeenCalled()
    expect(eq).toHaveBeenCalledWith('id', '1')
  })
})

