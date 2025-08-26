// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import LoginPage from '../LoginPage'

const signInMock = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))
vi.mock('../../lib/supabase', () => ({
  supabase: { auth: { signInWithPassword: signInMock } },
}))

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )
  return { ...actual, useNavigate: () => navigateMock }
})

let mockUser: User | null = null
vi.mock('../../components/auth-context', () => ({
  useAuth: () => ({ user: mockUser, role: null, loading: false }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    cleanup()
    navigateMock.mockClear()
    signInMock.mockClear()
    mockUser = null
    localStorage.clear()
    ;(import.meta as any).env = { ...(import.meta as any).env, DEV: true }
  })
  it('redirects after successful sign-in', async () => {
    const { rerender } = render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password',
      }),
    )

    mockUser = { id: '123' }
    rerender(<LoginPage />)

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true }),
    )
    expect(navigateMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).not.toHaveBeenCalledWith('/login', expect.anything())
  })

  it('bypasses auth and navigates home', () => {
    render(<LoginPage />)
    fireEvent.click(
      screen.getByRole('button', { name: /bypass login \(dev\)/i }),
    )
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
