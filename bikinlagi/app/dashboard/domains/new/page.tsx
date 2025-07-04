import { requireAuth, canManageAssets } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddDomainForm } from '../components/add-domain-form'

export default async function NewDomainPage() {
  const user = await requireAuth()
  
  if (!canManageAssets(user.role)) {
    redirect('/dashboard/domains')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Domain Baru</h1>
        <p className="text-gray-600">Tambahkan domain baru ke sistem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Domain</CardTitle>
          <CardDescription>
            Masukkan nama domain untuk mendapatkan informasi WHOIS otomatis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddDomainForm />
        </CardContent>
      </Card>
    </div>
  )
} 