import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Example } from '../types'

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
