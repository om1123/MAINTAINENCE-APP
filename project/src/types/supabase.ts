export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      machines: {
        Row: {
          id: string
          name: string
          location: string
          manufacturer: string
          specifications: Json | null
          maintenance_schedule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          manufacturer: string
          specifications?: Json | null
          maintenance_schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          manufacturer?: string
          specifications?: Json | null
          maintenance_schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          machine_id: string
          problem_description: string
          priority: 'high' | 'medium' | 'low'
          assigned_technician: string
          problem_start_date: string
          expected_completion_date: string
          status: 'pending' | 'completed'
          actual_completion_date: string | null
          resolution_details: string | null
          parts_replaced: string[] | null
          additional_notes: string | null
          technician_signature: string | null
          maintenance_cost: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          problem_description: string
          priority: 'high' | 'medium' | 'low'
          assigned_technician: string
          problem_start_date: string
          expected_completion_date: string
          status?: 'pending' | 'completed'
          actual_completion_date?: string | null
          resolution_details?: string | null
          parts_replaced?: string[] | null
          additional_notes?: string | null
          technician_signature?: string | null
          maintenance_cost?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          machine_id?: string
          problem_description?: string
          priority?: 'high' | 'medium' | 'low'
          assigned_technician?: string
          problem_start_date?: string
          expected_completion_date?: string
          status?: 'pending' | 'completed'
          actual_completion_date?: string | null
          resolution_details?: string | null
          parts_replaced?: string[] | null
          additional_notes?: string | null
          technician_signature?: string | null
          maintenance_cost?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: 'new' | 'pending' | 'completed'
          message: string
          work_order_id: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          type: 'new' | 'pending' | 'completed'
          message: string
          work_order_id: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          type?: 'new' | 'pending' | 'completed'
          message?: string
          work_order_id?: string
          created_at?: string
          read?: boolean
        }
      }
    }
  }
}