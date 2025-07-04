import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WebsitesTable } from './components/websites-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function getWebsites() {
  const supabase = await createClient()
  
  const { data: websites, error } = await supabase
    .from('websites')
    .select('*, hosting(*), vps(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching websites:', error)
    return []
  }

  return websites || []
}

export default async function WebsitesPage() {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const websites = await getWebsites()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Website</h1>
          <p className="text-gray-600">Kelola semua website perusahaan</p>
        </div>
        {canManage && (
          <Link href="/dashboard/websites/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Website
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Website</CardTitle>
          <CardDescription>
            Total {websites.length} website terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebsitesTable websites={websites} userRole={user.role} />
        </CardContent>
      </Card>
    </div>
  )
}