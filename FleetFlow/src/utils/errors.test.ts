import { describe, it, expect } from 'vitest'
import { friendlyErrorMessage } from './errors'

describe('friendlyErrorMessage', () => {
  it('maps known error codes to friendly text', () => {
    expect(friendlyErrorMessage('ALLOCATION_OVERLAP')).toBe(
      'Allocation overlaps with existing allocation',
    )
    expect(friendlyErrorMessage('UNAUTHORIZED')).toBe(
      'You are not authorized to perform this action',
    )
  })

  it('returns original code when unknown', () => {
    expect(friendlyErrorMessage('UNKNOWN')).toBe('UNKNOWN')
  })
})
