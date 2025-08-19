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
  const { user } = useAuth()

  if (!user) {
    return <Navigate to='/login' replace />
  }

  const userRole = (user.user_metadata as { role?: string } | undefined)?.role
  if (roles && (!userRole || !roles.includes(userRole))) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

