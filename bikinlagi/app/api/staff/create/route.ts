import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { email, name, role } = await req.json()

  // Validate request body
  if (!email || !name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient()

  // 1. Create Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true, // Recommended to require email confirmation
  })

  if (authError) {
    console.error('Error creating auth user:', authError)
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData || !authData.user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
  
  // 2. Insert into staff table
  const { error: staffError } = await supabase
    .from('staff')
    .insert({ id: authData.user.id, email, name, role })

  if (staffError) {
    console.error('Error inserting into staff table:', staffError)
    // Optional: Delete the auth user if staff insert fails to avoid orphans
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: staffError.message }, { status: 500 })
  }

  return NextResponse.json({ id: authData.user.id })
} 