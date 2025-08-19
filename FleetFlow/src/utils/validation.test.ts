import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  }
})

import { validateExternalHire, validateOperatorAssignment } from './validation'
import { supabase } from '../lib/supabase'

  describe('validateExternalHire', () => {
  beforeEach(() => {
    ;(supabase.from as Mock).mockReset()
  })

  it('returns available substitutions', async () => {
    const eq = vi.fn().mockResolvedValue({
      data: [{ group_id: '1', substitute_group_id: '2' }],
      error: null,
    })
    const select = vi.fn(() => ({ eq }))
    ;(supabase.from as Mock).mockReturnValue({ select })
    await expect(validateExternalHire('1')).resolves.toEqual([
      { group_id: '1', substitute_group_id: '2' },
    ])
  })

    it('returns empty array when no substitution', async () => {
      const eq = vi.fn().mockResolvedValue({ data: [], error: null })
      const select = vi.fn(() => ({ eq }))
      ;(supabase.from as Mock).mockReturnValue({ select })
      await expect(validateExternalHire('1')).resolves.toEqual([])
    })

    it('throws when query fails', async () => {
      const eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } })
      const select = vi.fn(() => ({ eq }))
      ;(supabase.from as Mock).mockReturnValue({ select })
      await expect(validateExternalHire('1')).rejects.toThrow('boom')
    })
  })

  describe('validateOperatorAssignment', () => {
  beforeEach(() => {
    ;(supabase.from as Mock).mockReset()
  })

  it('throws when operator missing required tickets', async () => {
    const from = supabase.from as Mock
    from.mockImplementation((table: string) => {
      if (table === 'group_required_tickets') {
        const eq = vi.fn().mockResolvedValue({
          data: [{ group_id: '1', ticket_code: 'A' }],
          error: null,
        })
        return { select: () => ({ eq }) }
      }
      if (table === 'operator_tickets') {
        const eq = vi.fn().mockResolvedValue({
          data: [{ operator_id: 'op', ticket_code: 'B' }],
          error: null,
        })
        return { select: () => ({ eq }) }
      }
      return { select: () => ({ eq: vi.fn() }) }
    })

    await expect(validateOperatorAssignment('1', 'op')).rejects.toThrow(
      'MISSING_REQUIRED_TICKETS',
    )
  })

    it('passes when operator has required tickets', async () => {
      const from = supabase.from as Mock
      from.mockImplementation((table: string) => {
      if (table === 'group_required_tickets') {
        const eq = vi.fn().mockResolvedValue({
          data: [
            { group_id: '1', ticket_code: 'A' },
            { group_id: '1', ticket_code: 'B' },
          ],
          error: null,
        })
        return { select: () => ({ eq }) }
      }
      if (table === 'operator_tickets') {
        const eq = vi.fn().mockResolvedValue({
          data: [
            { operator_id: 'op', ticket_code: 'A' },
            { operator_id: 'op', ticket_code: 'B' },
          ],
          error: null,
        })
        return { select: () => ({ eq }) }
      }
      return { select: () => ({ eq: vi.fn() }) }
    })

      await expect(validateOperatorAssignment('1', 'op')).resolves.toBeUndefined()
    })

    it('returns early when group has no required tickets', async () => {
      const from = supabase.from as Mock
      from.mockImplementation((table: string) => {
        if (table === 'group_required_tickets') {
          const eq = vi.fn().mockResolvedValue({ data: [], error: null })
          return { select: () => ({ eq }) }
        }
        if (table === 'operator_tickets') {
          const eq = vi.fn().mockResolvedValue({ data: [], error: null })
          return { select: () => ({ eq }) }
        }
        return { select: () => ({ eq: vi.fn() }) }
      })

      await expect(validateOperatorAssignment('1', 'op')).resolves.toBeUndefined()
      expect(from).toHaveBeenCalledTimes(1)
    })

    it('throws when operator ticket query fails', async () => {
      const from = supabase.from as Mock
      from.mockImplementation((table: string) => {
        if (table === 'group_required_tickets') {
          const eq = vi.fn().mockResolvedValue({
            data: [{ group_id: '1', ticket_code: 'A' }],
            error: null,
          })
          return { select: () => ({ eq }) }
        }
        if (table === 'operator_tickets') {
          const eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'oops' } })
          return { select: () => ({ eq }) }
        }
        return { select: () => ({ eq: vi.fn() }) }
      })

      await expect(validateOperatorAssignment('1', 'op')).rejects.toThrow('oops')
    })
  })
