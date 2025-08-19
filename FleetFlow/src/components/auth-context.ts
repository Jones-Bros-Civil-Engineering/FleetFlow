import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthContextValue {
  user: User | null
  role: string | null
}

export const AuthContext = createContext<AuthContextValue>({ user: null, role: null })

export function useAuth() {
  return useContext(AuthContext)
}

