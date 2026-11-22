
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

interface AdminContextType {
  isAdmin: boolean
  loading: boolean
  assignAdminRole: (email: string) => Promise<{ error: unknown }>
  getUserRoles: () => Promise<{ data: Tables<'user_roles'>[], error: unknown }>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null)
  const loading = !!user && checkedUserId !== user.id

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false)
        setCheckedUserId(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle()

        if (error) {
          console.error('Error checking admin role:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(!!data)
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
        setIsAdmin(false)
      } finally {
        setCheckedUserId(user.id)
      }
    }

    checkAdminRole()
  }, [user])

  const assignAdminRole = async (email: string) => {
    try {
      const { error } = await supabase.rpc('assign_admin_role', { _email: email })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const getUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  }

  return (
    <AdminContext.Provider value={{
      isAdmin,
      loading,
      assignAdminRole,
      getUserRoles,
    }}>
      {children}
    </AdminContext.Provider>
  )
}
