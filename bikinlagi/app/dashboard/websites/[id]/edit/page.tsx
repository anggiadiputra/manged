import { createClient } from '@/lib/supabase/server'
import { WebsiteForm } from '../../components/website-form'
import { requireAuth, canManageAssets } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface EditWebsitePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWebsitePage({ params }: EditWebsitePageProps) {
  const user = await requireAuth()
  
  if (!canManageAssets(user.role)) {
    redirect('/dashboard/websites')
  }
  
  const { id } = await params
  const supabase = await createClient()
  
  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching website:', error)
    return <div>Error loading website</div>
  }
  
  if (!website) {
    return <div>Website not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Edit Website</h1>
      <WebsiteForm initialData={website} />
    </div>
  )
} 