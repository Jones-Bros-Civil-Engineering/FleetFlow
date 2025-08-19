import { describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))
vi.mock('../lib/supabase', () => ({
  supabase: {},
}))

import { useQuery } from '@tanstack/react-query'
import { useExampleQuery, fetchExample } from './queries'

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
