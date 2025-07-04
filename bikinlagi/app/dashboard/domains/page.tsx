import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DomainsTable } from './components/domains-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function getDomains() {
  const supabase = await createClient()
  
  const { data: domains, error } = await supabase
    .from('domains')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching domains:', error)
    return []
  }

  return domains || []
}

export default async function DomainsPage() {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const domains = await getDomains()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Domain</h1>
          <p className="text-gray-600">Kelola semua domain perusahaan</p>
        </div>
        {canManage && (
          <Link href="/dashboard/domains/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Domain
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Domain</CardTitle>
          <CardDescription>
            Total {domains.length} domain terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainsTable domains={domains} userRole={user.role} />
        </CardContent>
      </Card>
    </div>
  )
} 