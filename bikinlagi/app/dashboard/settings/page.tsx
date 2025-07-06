import { requireAuth, canManageStaff } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackupButton } from './components/backup-button'

export default async function SettingsPage() {
  const user = await requireAuth()

  // Hanya super_admin yang bisa mengakses halaman ini
  if (user.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan sistem.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Database</CardTitle>
          <CardDescription>
            Buat cadangan database PostgreSQL. Proses ini mungkin memakan waktu beberapa saat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackupButton />
        </CardContent>
      </Card>
    </div>
  )
} 