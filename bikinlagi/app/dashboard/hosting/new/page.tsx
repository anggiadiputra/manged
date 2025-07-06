"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HostingForm } from '../components/hosting-form';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function NewHostingPage() {
  const [domains, setDomains] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchDomains() {
      const { data: domainList } = await supabase.from('domains').select('id, name').order('name');
      const { data: assignedHosting } = await supabase.from('domain_hosting').select('domain_id');
      const { data: assignedVps } = await supabase.from('domain_vps').select('domain_id');
      const used = new Set([...(assignedHosting||[]).map((r:any)=>r.domain_id), ...(assignedVps||[]).map((r:any)=>r.domain_id)]);
      const available = (domainList || []).filter(d => !used.has(d.id));
      setDomains(available);
    }
    fetchDomains();
  }, []);

  async function handleSubmit(form: any) {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      // 1. Insert hosting
      const { data: hostingData, error: hostingError } = await supabase.from('hosting').insert({
        provider: form.provider,
        package: form.package,
        primary_domain: form.primary_domain,
        expiry_date: form.expiry_date,
        renewal_cost: form.renewal_cost ? parseFloat(form.renewal_cost) : null,
        status: 'active',
        created_by: userData.user?.id,
      }).select('id').single();
      if (hostingError) throw hostingError;
      // 2. Insert domain_hosting relasi
      const hostingId = hostingData.id;
      const relasi = form.associatedDomains.map((domainId: string) => ({ domain_id: domainId, hosting_id: hostingId }));
      if (relasi.length > 0) {
        const { error: relasiError } = await supabase.from('domain_hosting').insert(relasi);
        if (relasiError) throw relasiError;
      }
      toast({ title: 'Berhasil', description: 'Hosting berhasil ditambahkan' });
      router.push('/dashboard/hosting');
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Gagal menambah hosting', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard/hosting');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Hosting Baru</h1>
        <p className="text-gray-600">Tambahkan hosting baru ke sistem</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Hosting</CardTitle>
          <CardDescription>
            Masukkan detail hosting. Domain terkait dapat dipilih lebih dari satu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostingForm domains={domains} loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
} 