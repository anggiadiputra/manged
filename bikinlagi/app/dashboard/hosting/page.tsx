import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HostingTable } from './components/hosting-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function getHosting() {
  const supabase = await createClient()
  
  const { data: hosting, error } = await supabase
    .from('hosting')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching hosting:', error)
    return []
  }

  return hosting || []
}

export default async function HostingPage() {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const hosting = await getHosting()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hosting</h1>
          <p className="text-gray-600">Kelola semua akun hosting perusahaan</p>
        </div>
        {canManage && (
          <Link href="/dashboard/hosting/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Hosting
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Hosting</CardTitle>
          <CardDescription>
            Total {hosting.length} akun hosting terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostingTable hosting={hosting} userRole={user.role} />
        </CardContent>
      </Card>
    </div>
  )
} 