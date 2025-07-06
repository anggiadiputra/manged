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

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 lg:ml-0">
          {children}
        </div>
      </main>

      <RightSidebar />
    </div>
  )
} 