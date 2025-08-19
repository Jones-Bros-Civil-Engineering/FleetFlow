import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthContextValue {
  user: User | null
  role: string | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

