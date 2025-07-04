export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      domains: {
        Row: {
          id: string
          name: string
          registrar: string | null
          whois_data: Json | null
          expiry_date: string | null
          renewal_cost: number | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          registrar?: string | null
          whois_data?: Json | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          registrar?: string | null
          whois_data?: Json | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      hosting: {
        Row: {
          id: string
          provider: string
          package: string
          primary_domain: string | null
          expiry_date: string | null
          renewal_cost: number | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          provider: string
          package: string
          primary_domain?: string | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          provider?: string
          package?: string
          primary_domain?: string | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      vps: {
        Row: {
          id: string
          provider: string
          ip_address: string
          location: string | null
          root_user: string | null
          root_password: string | null
          expiry_date: string | null
          renewal_cost: number | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          provider: string
          ip_address: string
          location?: string | null
          root_user?: string | null
          root_password?: string | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          provider?: string
          ip_address?: string
          location?: string | null
          root_user?: string | null
          root_password?: string | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      websites: {
        Row: {
          id: string
          domain: string
          cms: string | null
          ip_address: string | null
          hosting_id: string | null
          vps_id: string | null
          admin_username: string | null
          admin_password: string | null
          expiry_date: string | null
          renewal_cost: number | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          domain: string
          cms?: string | null
          ip_address?: string | null
          hosting_id?: string | null
          vps_id?: string | null
          admin_username?: string | null
          admin_password?: string | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          domain?: string
          cms?: string | null
          ip_address?: string | null
          hosting_id?: string | null
          vps_id?: string | null
          admin_username?: string | null
          admin_password?: string | null
          expiry_date?: string | null
          renewal_cost?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      staff: {
        Row: {
          id: string
          email: string
          name: string
          role: 'super_admin' | 'admin_web' | 'finance'
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'super_admin' | 'admin_web' | 'finance'
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'super_admin' | 'admin_web' | 'finance'
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
      }
      domain_hosting: {
        Row: {
          domain_id: string
          hosting_id: string
          created_at: string
        }
        Insert: {
          domain_id: string
          hosting_id: string
          created_at?: string
        }
        Update: {
          domain_id?: string
          hosting_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 