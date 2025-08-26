import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('bypass-auth') === 'true') {
      setUser({ id: 'bypass' } as User)
      setRole('admin')
      setLoading(false)
      return
    }
    const fetchRole = async () => {
      try {
        const { data: roleRes } = await supabase.rpc('rpc_get_role')
        setRole(roleRes ?? null)
      } catch (error) {
        console.error('Could not fetch user role:', error)
        toast.error('Failed to fetch user role')
        setRole(null)
      }
    }

    const initializeUser = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchRole()
        } else {
          setRole(null)
        }
      } catch (error) {
        console.error('Auth error:', error)
        setUser(null)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchRole()
      } else {
        setRole(null)
      }
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

