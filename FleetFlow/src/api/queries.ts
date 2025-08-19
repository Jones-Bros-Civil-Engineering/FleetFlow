import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  ExampleSchema,
  CalendarEventSchema,
  EquipmentGroupSchema,
  AllocationSchema,
  RequestSchema,
  WeeklyGroupUtilizationSchema,
  WeekStartSchema,
  AssetScoreSchema,
  OperatorMatchSchema,
  OperatorAssignmentSchema,
  type Example,
  type CalendarEvent,
  type EquipmentGroup,
  type Allocation,
  type Request,
  type WeeklyGroupUtilization,
  type WeekStart,
  type AssetScore,
  type OperatorMatch,
  type OperatorAssignment,
} from '../types'

export const fetchExample = async (): Promise<Example[]> => {
  const { data, error } = await supabase.from('examples').select('*')
  if (error) {
    throw new Error(error.message)
  }
  return ExampleSchema.array().parse(data ?? [])
}

export const useExampleQuery = () =>
  useQuery<Example[], Error>({
    queryKey: ['examples'],
    queryFn: fetchExample,
  })

export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase.from('calendar_events').select('*')
  if (error) {
    throw new Error(error.message)
  }
  return CalendarEventSchema.array().parse(data ?? [])
}

export const useEventsQuery = () =>
  useQuery<CalendarEvent[], Error>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

export const fetchEquipmentGroups = async (): Promise<EquipmentGroup[]> => {
  const { data, error } = await supabase
    .from('vw_equipment_groups')
    .select('*')
  if (error) {
    throw new Error(error.message)
  }
  return EquipmentGroupSchema.array().parse(data ?? [])
}

export const useEquipmentGroupsQuery = () =>
  useQuery<EquipmentGroup[], Error>({
    queryKey: ['equipment-groups'],
    queryFn: fetchEquipmentGroups,
  })

export const fetchAllocations = async (): Promise<Allocation[]> => {
  const { data, error } = await supabase.from('vw_allocations').select('*')
  if (error) {
    throw new Error(error.message)
  }
  return AllocationSchema.array().parse(data ?? [])
}

export const useAllocationsQuery = () =>
  useQuery<Allocation[], Error>({
    queryKey: ['allocations'],
    queryFn: fetchAllocations,
  })

export const fetchRequests = async (): Promise<Request[]> => {
  const { data, error } = await supabase
    .from('vw_hire_requests')
    .select('*')
  if (error) {
    throw new Error(error.message)
  }
  return RequestSchema.array().parse(data ?? [])
}

export const useRequestsQuery = () =>
  useQuery<Request[], Error>({
    queryKey: ['requests'],
    queryFn: fetchRequests,
  })

export const scoreAssets = async (requestId: string): Promise<AssetScore[]> => {
  const { data, error } = await supabase.rpc('rpc_score_assets', {
    request_id: requestId,
  })
  if (error) {
    throw new Error(error.message)
  }
  return AssetScoreSchema.array().parse(data ?? [])
}

export const fetchWeeklyGroupUtilization = async (): Promise<WeeklyGroupUtilization[]> => {
  const { data, error } = await supabase
    .from('vw_weekly_group_utilization')
    .select('*')
  if (error) {
    throw new Error(error.message)
  }
  return WeeklyGroupUtilizationSchema.array().parse(data ?? [])
}

export const useWeeklyGroupUtilizationQuery = () =>
  useQuery<WeeklyGroupUtilization[], Error>({
    queryKey: ['weekly-group-utilization'],
    queryFn: fetchWeeklyGroupUtilization,
  })

export const fetchWeekStarts = async (
  startDate: Date,
  endDate: Date,
): Promise<WeekStart[]> => {
  const { data, error } = await supabase.rpc('rpc_week_starts', {
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
  })
  if (error) {
    throw new Error(error.message)
  }
  return WeekStartSchema.array().parse(data ?? [])
}

export const useWeekStartsQuery = (
  startDate: Date,
  endDate: Date,
) =>
  useQuery<WeekStart[], Error>({
    queryKey: ['week-starts', startDate, endDate],
    queryFn: () => fetchWeekStarts(startDate, endDate),
  })

export const rankOperators = async (
  startDate: Date,
  endDate: Date,
  siteLat: number,
  siteLon: number,
): Promise<OperatorMatch[]> => {
  const { data, error } = await supabase.rpc('rpc_rank_operators', {
    req_start: startDate.toISOString().slice(0, 10),
    req_end: endDate.toISOString().slice(0, 10),
    site_lat: siteLat,
    site_lon: siteLon,
  })
  if (error) {
    throw new Error(error.message)
  }
  return OperatorMatchSchema.array().parse(data ?? [])
}

export const offHireAllocation = async (
  allocationId: string,
): Promise<void> => {
  const { error } = await supabase.rpc('rpc_off_hire_allocation', {
    allocation_id: allocationId,
  })
  if (error) {
    throw new Error(error.message)
  }
}

export const reassignAllocation = async (
  allocationId: string,
): Promise<CalendarEvent> => {
  const { data, error } = await supabase.rpc('rpc_reassign_allocation', {
    allocation_id: allocationId,
  })
  if (error) {
    throw new Error(error.message)
  }
  return CalendarEventSchema.parse(data)
}

export const fetchOperatorAssignments = async (): Promise<OperatorAssignment[]> => {
  const { data, error } = await supabase
    .from('vw_operator_assignments')
    .select('*')
  if (error) {
    throw new Error(error.message)
  }
  return OperatorAssignmentSchema.array().parse(data ?? [])
}

export const useOperatorAssignmentsQuery = () =>
  useQuery<OperatorAssignment[], Error>({
    queryKey: ['operator-assignments'],
    queryFn: fetchOperatorAssignments,
  })
