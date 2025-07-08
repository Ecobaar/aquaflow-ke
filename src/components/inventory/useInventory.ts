
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../../contexts/AuthContext'
import { InventoryItem, DailyInventorySummary } from './types'

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [dailySummary, setDailySummary] = useState<DailyInventorySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchItems()
      fetchDailySummary()
    }
  }, [user])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      setMessage({ type: 'error', text: 'Failed to fetch inventory items' })
    }
  }

  const fetchDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_inventory_summary')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDailySummary(data)
    } catch (error: any) {
      console.error('Error fetching daily summary:', error)
    }
  }

  const addOrUpdateItem = async (itemData: any, editingItem: InventoryItem | null) => {
    setLoading(true)
    setMessage(null)

    try {
      const data = {
        user_id: user?.id!,
        ...itemData,
        date: new Date().toISOString().split('T')[0]
      }

      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update(data)
          .eq('id', editingItem.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'Item updated successfully!' })
      } else {
        const { error } = await supabase
          .from('inventory')
          .insert(data)

        if (error) throw error
        setMessage({ type: 'success', text: 'Item added successfully!' })
      }

      fetchItems()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Item deleted successfully!' })
      fetchItems()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const saveDailySummary = async (summaryData: any) => {
    setLoading(true)
    setMessage(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const data = {
        user_id: user?.id!,
        date: today,
        ...summaryData,
        updated_at: new Date().toISOString()
      }

      if (dailySummary) {
        const { error } = await supabase
          .from('daily_inventory_summary')
          .update(data)
          .eq('user_id', user?.id)
          .eq('date', today)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('daily_inventory_summary')
          .insert(data)

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Daily summary saved successfully!' })
      fetchDailySummary()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return {
    items,
    dailySummary,
    loading,
    message,
    setMessage,
    setLoading,
    addOrUpdateItem,
    deleteItem,
    saveDailySummary,
  }
}
