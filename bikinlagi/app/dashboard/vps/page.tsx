import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { VpsTable } from './components/vps-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Pagination } from '@/components/dashboard/pagination'

const ITEMS_PER_PAGE = 10;

async function getVps(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: vps, error, count } = await supabase
    .from('vps')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching VPS:', error)
    return { vps: [], totalCount: 0 }
  }

  return { vps: vps || [], totalCount: count || 0 }
}

export default async function VpsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const page = Number(searchParams?.page || 1);
  const { vps, totalCount } = await getVps(page)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
            Total {totalCount} VPS terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VpsTable vps={vps} userRole={user.role} />
        </CardContent>
        {totalPages > 1 && (
          <CardFooter>
            <Pagination currentPage={page} totalPages={totalPages} />
          </CardFooter>
        )}
      </Card>
    </div>
  )
} 