"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VpsForm } from "../../components/vps-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function EditVpsPage() {
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [domains, setDomains] = useState<{id:string,name:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const supabase = createClient();
  const vpsId = params?.id as string;

  useEffect(() => {
    async function fetchData() {
      // vps data
      const { data: vpsRow } = await supabase.from("vps").select("*").eq("id", vpsId).single();
      // current related domains
      const { data: rel } = await supabase.from('domain_vps').select('domain_id').eq('vps_id', vpsId);
      const currentDomainIds = (rel||[]).map((r:any)=>r.domain_id);
      // all domains
      const { data: allDomains } = await supabase.from('domains').select('id,name');
      // domains assigned elsewhere
      const { data: hostingAssign } = await supabase.from('domain_hosting').select('domain_id, hosting_id');
      const { data: vpsAssign } = await supabase.from('domain_vps').select('domain_id, vps_id');
      const available = (allDomains||[]).filter(d=>{
        const inHosting = hostingAssign?.some((h:any)=>h.domain_id===d.id);
        const inOtherVps = vpsAssign?.some((v:any)=>v.domain_id===d.id && v.vps_id!==vpsId);
        return !inHosting && !inOtherVps;
      });
      // include current domains even if not available now
      const domainSet = new Map<string, {id:string,name:string}>();
      for(const d of available){domainSet.set(d.id,d);} 
      for(const id of currentDomainIds){
        const found = (allDomains||[]).find(d=>d.id===id);
        if(found) domainSet.set(found.id,found);
      }
      setDomains(Array.from(domainSet.values()));

      if (vpsRow) {
        setDefaultValues({
          provider: vpsRow.provider || "",
          ip_address: vpsRow.ip_address || "",
          root_user: vpsRow.root_user || "",
          root_password: vpsRow.root_password || "",
          expiry_date: vpsRow.expiry_date ? vpsRow.expiry_date.slice(0, 10) : "",
          renewal_cost: vpsRow.renewal_cost ? String(vpsRow.renewal_cost) : "",
          associatedDomains: currentDomainIds,
        });
      }
    }
    if (vpsId) fetchData();
  }, [vpsId]);

  async function handleSubmit(form: any) {
    setLoading(true);
    try {
      const { error } = await supabase.from("vps").update({
        provider: form.provider,
        ip_address: form.ip_address,
        root_user: form.root_user,
        root_password: form.root_password,
        expiry_date: form.expiry_date,
        renewal_cost: form.renewal_cost ? parseFloat(form.renewal_cost) : null,
      }).eq("id", vpsId);
      if (error) throw error;
      toast({ title: "Berhasil", description: "VPS berhasil diperbarui" });
      router.push("/dashboard/vps");
      router.refresh();
      // update domain relations
      await supabase.from('domain_vps').delete().eq('vps_id', vpsId);
      const relasi = form.associatedDomains.map((domainId:string)=>({domain_id:domainId, vps_id:vpsId}));
      if(relasi.length>0){
        const { error: relErr } = await supabase.from('domain_vps').insert(relasi);
        if(relErr) throw relErr;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal update VPS", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/dashboard/vps");
  }

  if (!defaultValues) return <div className="max-w-2xl mx-auto py-12 text-center text-gray-500">Memuat data VPS...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit VPS</h1>
        <p className="text-gray-600">Perbarui data VPS</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi VPS</CardTitle>
          <CardDescription>Edit detail VPS</CardDescription>
        </CardHeader>
        <CardContent>
          <VpsForm defaultValues={defaultValues} loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} domains={domains} />
        </CardContent>
      </Card>
    </div>
  );
} 