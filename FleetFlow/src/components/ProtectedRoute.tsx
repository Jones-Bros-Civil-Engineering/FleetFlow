import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth-context'

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: string[]
}) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (role === null) {
    return <Navigate to='/unauthorized' replace />
  }

  if (role === 'admin') {
    return <>{children}</>
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to='/unauthorized' replace />
  }

  return <>{children}</>
}

