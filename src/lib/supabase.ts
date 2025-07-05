
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sooknqexcpgdphxxruep.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb2tucWV4Y3BnZHBoeHhydWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDM2MzUsImV4cCI6MjA2NzI3OTYzNX0.bVUnCGewvRmdLcLlqt0Cmize6Xp_LqTAMLl5jco5PR8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          created_at?: string
          user_id?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          payment_method: 'cash' | 'till' | 'debt'
          customer_id: string | null
          customer_name: string | null
          paid_status: boolean
          created_at: string
          user_id: string
          description: string | null
        }
        Insert: {
          id?: string
          amount: number
          payment_method: 'cash' | 'till' | 'debt'
          customer_id?: string | null
          customer_name?: string | null
          paid_status?: boolean
          created_at?: string
          user_id: string
          description?: string | null
        }
        Update: {
          id?: string
          amount?: number
          payment_method?: 'cash' | 'till' | 'debt'
          customer_id?: string | null
          customer_name?: string | null
          paid_status?: boolean
          created_at?: string
          user_id?: string
          description?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          created_at?: string
          user_id?: string
        }
      }
    }
  }
}
