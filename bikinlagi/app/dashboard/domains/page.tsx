import { requireAuth, canManageAssets } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { DomainsTable } from './components/domains-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Pagination } from '@/components/dashboard/pagination'

export const dynamic = 'force-dynamic'

// This function tells Next.js that this page has no dynamic params
export async function generateStaticParams() {
  return [];
}

const ITEMS_PER_PAGE = 10;

async function getDomains(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: domains, error, count } = await supabase
    .from('domains')
    .select('*, staff:created_by(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching domains:', error)
    return { domains: [], totalCount: 0 }
  }

  // Map staff.name to created_by_name for each domain
  const mappedDomains = (domains || []).map((d) => ({
    ...d,
    created_by_name: d.staff?.name || '-',
  }))

  return { domains: mappedDomains, totalCount: count || 0 }
}

interface DomainsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
  const user = await requireAuth()
  const canManage = canManageAssets(user.role)

  const params = await searchParams;
  const rawPage = params.page
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const page = Number(pageParam ?? '1');
  const { domains, totalCount } = await getDomains(page)
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
            Total {totalCount} domain terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainsTable domains={domains} userRole={user.role} />
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