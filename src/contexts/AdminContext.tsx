
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface AdminContextType {
  isAdmin: boolean
  loading: boolean
  assignAdminRole: (email: string) => Promise<{ error: any }>
  getUserRoles: () => Promise<{ data: any[], error: any }>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
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
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user])

  const assignAdminRole = async (email: string) => {
    try {
      const { error } = await supabase.rpc('assign_admin_role', { _email: email })
      return { error }
    } catch (error: any) {
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
    } catch (error: any) {
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
