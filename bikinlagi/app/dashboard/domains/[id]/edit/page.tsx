import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import EditDomainForm from './edit-domain-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditDomainPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: domain, error } = await supabase
    .from('domains')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !domain) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Domain</h1>
        <p className="text-gray-600">Perbarui data domain dan WHOIS</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Domain</CardTitle>
          <CardDescription>
            Edit nama domain, biaya perpanjangan, atau catatan. Data teknis akan diperbarui otomatis dari WHOIS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditDomainForm domain={domain} />
        </CardContent>
      </Card>
    </div>
  );
} 