"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HostingForm } from '../../components/hosting-form';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EditHostingPage() {
  const [domains, setDomains] = useState<{id: string, name: string}[]>([]);
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const supabase = createClient();
  const hostingId = params?.id as string;

  useEffect(() => {
    async function fetchData() {
      // Fetch all domains and their current assignments
      const { data: domainList } = await supabase.from('domains').select('id, name').order('name');
      const { data: assignmentsHosting } = await supabase.from('domain_hosting').select('domain_id, hosting_id');
      const { data: assignmentsVps } = await supabase.from('domain_vps').select('domain_id');
      const available = (domainList || []).filter(d => {
        const assignH = assignmentsHosting?.find(a => a.domain_id === d.id);
        const assignedInVps = assignmentsVps?.some((v:any)=>v.domain_id===d.id);
        // available if not assigned elsewhere or assigned to this hosting
        return (!assignH || assignH.hosting_id === hostingId) && !assignedInVps;
      });
      setDomains(available);
      // Fetch hosting data
      const { data: hosting } = await supabase.from('hosting').select('*').eq('id', hostingId).single();
      // Fetch associated domains
      const { data: relasi } = await supabase.from('domain_hosting').select('domain_id').eq('hosting_id', hostingId);
      setDefaultValues({
        provider: hosting?.provider || '',
        package: hosting?.package || '',
        expiry_date: hosting?.expiry_date ? hosting.expiry_date.slice(0,10) : '',
        renewal_cost: hosting?.renewal_cost ? String(hosting.renewal_cost) : '',
        associatedDomains: relasi ? relasi.map((r: any) => r.domain_id) : [],
      });
    }
    if (hostingId) fetchData();
  }, [hostingId]);

  async function handleSubmit(form: any) {
    setLoading(true);
    try {
      // 1. Update hosting
      const { error: hostingError } = await supabase.from('hosting').update({
        provider: form.provider,
        package: form.package,
        primary_domain: form.primary_domain,
        expiry_date: form.expiry_date,
        renewal_cost: form.renewal_cost ? parseFloat(form.renewal_cost) : null,
      }).eq('id', hostingId);
      if (hostingError) throw hostingError;
      // 2. Update domain_hosting relasi: hapus semua, insert baru
      await supabase.from('domain_hosting').delete().eq('hosting_id', hostingId);
      const relasi = form.associatedDomains.map((domainId: string) => ({ domain_id: domainId, hosting_id: hostingId }));
      if (relasi.length > 0) {
        const { error: relasiError } = await supabase.from('domain_hosting').insert(relasi);
        if (relasiError) throw relasiError;
      }
      toast({ title: 'Berhasil', description: 'Hosting berhasil diperbarui' });
      router.push('/dashboard/hosting');
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Gagal update hosting', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard/hosting');
  }

  if (!defaultValues) return <div className="max-w-2xl mx-auto py-12 text-center text-gray-500">Memuat data hosting...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Hosting</h1>
        <p className="text-gray-600">Perbarui data hosting</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Hosting</CardTitle>
          <CardDescription>
            Edit detail hosting. Domain terkait dapat dipilih lebih dari satu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostingForm domains={domains} defaultValues={defaultValues} loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
} 