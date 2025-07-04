import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'

export type UserRole = 'super_admin' | 'admin_web' | 'finance'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: staffData } = await supabase
    .from('staff')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (!staffData) return null
  
  return {
    id: staffData.id,
    email: staffData.email,
    name: staffData.name,
    role: staffData.role as UserRole
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export function canManageStaff(role: UserRole): boolean {
  return role === 'super_admin'
}

export function canManageAssets(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin_web'
}

export function canUpdateWhois(role: UserRole): boolean {
  return role === 'finance' || canManageAssets(role)
} 