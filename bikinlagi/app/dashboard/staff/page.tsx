import { requireAuth, canManageStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StaffTable } from './components/staff-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function getStaff() {
  const supabase = await createClient()
  
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  return staff || []
}

export default async function StaffPage() {
  const user = await requireAuth()
  
  if (!canManageStaff(user.role)) {
    redirect('/dashboard')
  }

  const staff = await getStaff()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-gray-600">Kelola semua pengguna sistem</p>
        </div>
        <Link href="/dashboard/staff/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Staff
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Staff</CardTitle>
          <CardDescription>
            Total {staff.length} pengguna terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffTable staff={staff} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
} 