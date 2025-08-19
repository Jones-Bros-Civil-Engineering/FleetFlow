import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: roleData } = await supabase.rpc('get_role')
        setRole(roleData)
      } else {
        setRole(null)
      }
    }
    fetchUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      await fetchUser()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, role }}>{children}</AuthContext.Provider>
}

