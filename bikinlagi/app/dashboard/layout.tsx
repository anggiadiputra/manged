import { requireAuth } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { RightSidebar } from '@/components/dashboard/right-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar userRole={user.role} />

      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          {children}
        </div>
      </main>

      <RightSidebar />
    </div>
  )
} 