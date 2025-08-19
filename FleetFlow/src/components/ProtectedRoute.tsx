import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth-context'

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles: string[]
}) {
  const { user, role } = useAuth()

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

