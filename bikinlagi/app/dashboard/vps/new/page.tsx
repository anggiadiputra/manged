"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VpsForm } from "../components/vps-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewVpsPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [domains, setDomains] = useState<{id:string,name:string}[]>([]);

  // fetch domains
  useEffect(()=>{
    async function fetchDomains(){
      const { data: list } = await supabase.from('domains').select('id,name');
      const { data: assignedHosting } = await supabase.from('domain_hosting').select('domain_id');
      const { data: assignedVps } = await supabase.from('domain_vps').select('domain_id');
      const used = new Set([...(assignedHosting||[]).map((d:any)=>d.domain_id), ...(assignedVps||[]).map((d:any)=>d.domain_id)]);
      setDomains((list||[]).filter(d=>!used.has(d.id)));
    }
    fetchDomains();
  },[]);

  async function handleSubmit(form: any) {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vpsInsert, error } = await supabase.from("vps").insert({
        provider: form.provider,
        ip_address: form.ip_address,
        root_user: form.root_user,
        root_password: form.root_password,
        expiry_date: form.expiry_date,
        renewal_cost: form.renewal_cost ? parseFloat(form.renewal_cost) : null,
        status: "active",
        created_by: user?.id,
      });
      if (error) throw error;
      const vpsId = (vpsInsert?.[0] as any)?.id as string | undefined;
      if(vpsId){
        const relasi = form.associatedDomains.map((domainId:string)=>({domain_id:domainId, vps_id:vpsId}));
        const { error: relErr } = await supabase.from('domain_vps').insert(relasi);
        if(relErr) throw relErr;
      }
      toast({ title: "Berhasil", description: "VPS berhasil ditambahkan" });
      router.push("/dashboard/vps");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal menambah VPS", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/dashboard/vps");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah VPS Baru</h1>
        <p className="text-gray-600">Tambahkan VPS baru ke sistem</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi VPS</CardTitle>
          <CardDescription>Masukkan detail VPS</CardDescription>
        </CardHeader>
        <CardContent>
          <VpsForm loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} domains={domains} />
        </CardContent>
      </Card>
    </div>
  );
} 