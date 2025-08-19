import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: roleRes } = await supabase.rpc('rpc_get_role')
        setRole(roleRes ?? null)
      } else {
        setRole(null)
      }
      setLoading(false)
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

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

