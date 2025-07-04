import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VpsTable } from './components/vps-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function getVps() {
  const supabase = await createClient()
  
  const { data: vps, error } = await supabase
    .from('vps')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching VPS:', error)
    return []
  }

  return vps || []
}

export default async function VpsPage() {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const vps = await getVps()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">VPS</h1>
          <p className="text-gray-600">Kelola semua server VPS perusahaan</p>
        </div>
        {canManage && (
          <Link href="/dashboard/vps/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah VPS
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar VPS</CardTitle>
          <CardDescription>
            Total {vps.length} VPS terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VpsTable vps={vps} userRole={user.role} />
        </CardContent>
      </Card>
    </div>
  )
} 