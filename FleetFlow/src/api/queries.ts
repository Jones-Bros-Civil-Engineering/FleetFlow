import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CalendarEvent, Example } from '../types'

export const fetchExample = async (): Promise<Example[]> => {
  const { data, error } = await supabase.from('examples').select('*')
  if (error) {
    throw new Error(error.message)
  }
  if (!data) {
    throw new Error('No data returned')
  }
  return data as Example[]
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
  return (data ?? []).map((e) => ({ ...e, date: new Date(e.date) })) as CalendarEvent[]
}

export const useEventsQuery = () =>
  useQuery<CalendarEvent[], Error>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })
