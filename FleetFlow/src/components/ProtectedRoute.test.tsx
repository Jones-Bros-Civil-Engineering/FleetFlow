/** @vitest-environment jsdom */
import { describe, expect, it, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen, cleanup } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import { AuthContext } from './auth-context'
import type { User } from '@supabase/supabase-js'

describe('ProtectedRoute', () => {
    afterEach(() => cleanup())

    it('redirects to login when user is not authenticated', () => {
    render(
      <AuthContext.Provider value={{ user: null, role: null, loading: false }}>
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
        value={{ user: {} as User, role: 'plant_coordinator', loading: false }}
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
        value={{ user: {} as User, role: 'driver', loading: false }}
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

    it('renders loading state when auth is loading', () => {
      render(
        <AuthContext.Provider value={{ user: null, role: null, loading: true }}>
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
        </AuthContext.Provider>,
      )

      expect(screen.getByText('Loading...')).toBeTruthy()
    })

    it('allows access when role is among allowed roles', () => {
      render(
        <AuthContext.Provider
          value={{ user: {} as User, role: 'workforce_coordinator', loading: false }}
        >
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path='/protected'
                element={
                  <ProtectedRoute
                    roles={['plant_coordinator', 'workforce_coordinator']}
                  >
                    <div>Secret</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>,
      )

      expect(screen.getByText('Secret')).toBeTruthy()
    })
  })

