import { requireAuth, canManageStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { StaffTable } from './components/staff-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Pagination } from '@/components/dashboard/pagination'

export const dynamic = 'force-dynamic'

// This function tells Next.js that this page has no dynamic params
export async function generateStaticParams() {
  return [];
}

const ITEMS_PER_PAGE = 10;

async function getStaff(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: staff, error, count } = await supabase
    .from('staff')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching staff:', error)
    return { staff: [], totalCount: 0 }
  }

  return { staff: staff || [], totalCount: count || 0 }
}

interface StaffPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const user = await requireAuth()
  
  if (!canManageStaff(user.role)) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const rawPage = params.page
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const page = Number(pageParam ?? '1')
  const { staff, totalCount } = await getStaff(page)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
            Total {totalCount} pengguna terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffTable staff={staff} currentUserId={user.id} />
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