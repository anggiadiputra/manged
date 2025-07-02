import { AddDomainForm } from '@/app/dashboard/domains/components/add-domain-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewDomainPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
    
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Add New Domain</h1>
        </div>
      </header>
      <main className="py-6">
        <AddDomainForm />
      </main>
    </div>
  )
} 