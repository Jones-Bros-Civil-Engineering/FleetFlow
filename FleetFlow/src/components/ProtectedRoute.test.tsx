/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import { AuthContext } from './auth-context'
import type { User } from '@supabase/supabase-js'

describe('ProtectedRoute', () => {
  it('redirects to login when user is not authenticated', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path='/login' element={<div>Login Page</div>} />
            <Route
              path='/protected'
              element={
                <ProtectedRoute roles={['plant_coordinator']}>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText('Login Page')).toBeTruthy()
  })

  it('renders children when role matches', () => {
    render(
      <AuthContext.Provider
        value={{ user: { user_metadata: { role: 'plant_coordinator' } } as unknown as User }}
      >
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path='/protected'
              element={
                <ProtectedRoute roles={['plant_coordinator']}>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText('Secret')).toBeTruthy()
  })

  it('redirects to home when role does not match', () => {
    render(
      <AuthContext.Provider
        value={{ user: { user_metadata: { role: 'driver' } } as unknown as User }}
      >
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path='/' element={<div>Home</div>} />
            <Route
              path='/protected'
              element={
                <ProtectedRoute roles={['plant_coordinator']}>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText('Home')).toBeTruthy()
  })
})

