import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  ExampleSchema,
  CalendarEventSchema,
  EquipmentGroupSchema,
  AllocationSchema,
  RequestSchema,
  WeeklyGroupUtilizationSchema,
  type Example,
  type CalendarEvent,
  type EquipmentGroup,
  type Allocation,
  type Request,
  type WeeklyGroupUtilization,
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
  const { data, error } = await supabase.from('equipment_groups').select('*')
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
  const { data, error } = await supabase.from('allocations').select('*')
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
  const { data, error } = await supabase.from('hire_requests').select('*')
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
