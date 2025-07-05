'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export const createClient = () => createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getUser = async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
  
  return user;
};

export const getUserRole = async () => {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error fetching user:', userError?.message);
    return null;
  }
  
  // Try find staff by primary key id
  let { data: staff, error } = await supabase
    .from('staff')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !staff) {
    // Fallback by email (legacy data)
    const { data: staffByEmail, error: staffByEmailErr } = await supabase
      .from('staff')
      .select('role')
      .eq('email', user.email!)
      .single();

    if (staffByEmailErr || !staffByEmail) {
      console.error('Error fetching staff role:', error?.message || staffByEmailErr?.message);
      return null;
    }

    staff = staffByEmail;
  }

  return staff.role;
};

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}; 