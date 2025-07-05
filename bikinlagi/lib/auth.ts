import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { UserRole } from './auth-utils'

export type { UserRole } from './auth-utils'
export { canManageStaff, canManageAssets, canUpdateWhois } from './auth-utils'

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
  
  let staff = staffData

  if (!staff) {
    // Fallback: find by email in case staff record has not been synced with auth.uid yet
    const { data: staffByEmail } = await supabase
      .from('staff')
      .select('*')
      .eq('email', user.email)
      .single()

    if (staffByEmail) {
      staff = staffByEmail
    } else {
      return null
    }
  }
  
  return {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role as UserRole,
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

 