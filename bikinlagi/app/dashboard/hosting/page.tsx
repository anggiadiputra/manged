import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { HostingTable } from './components/hosting-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Pagination } from '@/components/dashboard/pagination'

const ITEMS_PER_PAGE = 10;

async function getHosting(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: hosting, error, count } = await supabase
    .from('hosting')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching hosting:', error)
    return { hosting: [], totalCount: 0 }
  }

  return { hosting: hosting || [], totalCount: count || 0 }
}

export default async function HostingPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const page = Number(searchParams?.page || 1);
  const { hosting, totalCount } = await getHosting(page)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
            Total {totalCount} akun hosting terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostingTable hosting={hosting} userRole={user.role} />
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