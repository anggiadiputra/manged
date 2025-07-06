import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { WebsitesTable } from './components/websites-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Pagination } from '@/components/dashboard/pagination'

const ITEMS_PER_PAGE = 10;

async function getWebsites(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: websites, error, count } = await supabase
    .from('websites')
    .select('*, hosting(*), vps(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching websites:', error)
    return { websites: [], totalCount: 0 }
  }

  return { websites: websites || [], totalCount: count || 0 }
}

export default async function WebsitesPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)
  const page = Number(searchParams?.page || 1);
  const { websites, totalCount } = await getWebsites(page)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
            Total {totalCount} website terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebsitesTable websites={websites} userRole={user.role} />
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