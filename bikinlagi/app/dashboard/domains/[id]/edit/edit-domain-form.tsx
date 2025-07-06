"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, 'Nama domain harus diisi'),
  renewal_cost: z.string().min(1, 'Biaya perpanjangan harus diisi'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditDomainForm({ domain }: { domain: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: domain.name,
      renewal_cost: domain.renewal_cost ? String(domain.renewal_cost) : '',
      note: domain.note || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // 1. Fetch WHOIS data
      const whoisRes = await fetch(`/api/whois?domain=${data.name}`);
      const whoisJson = await whoisRes.json();
      if (!whoisJson.success || !whoisJson.data) {
        toast({
          title: 'Error',
          description: 'Gagal mengambil data WHOIS',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      const whois = whoisJson.data;
      // 2. Map WHOIS fields
      const registrar = whois['Registrar Name'] || null;
      const expiryDate = whois['Expiration Date'] ? whois['Expiration Date'].slice(0, 10) : null;
      const nameserver_1 = whois['Nameserver 1'] || null;
      const nameserver_2 = whois['Nameserver 2'] || null;
      // 3. Update domain in Supabase
      const { error } = await supabase.from('domains').update({
        domain_id: whois['Domain ID'] || null,
        name: data.name,
        registrar,
        created_on: whois['Created On'] ? new Date(whois['Created On']).toISOString() : null,
        last_update_on: whois['Last Update On'] ? new Date(whois['Last Update On']).toISOString() : null,
        expiry_date: expiryDate,
        status: whois['Status'] || null,
        nameserver_1,
        nameserver_2,
        nameserver_3: whois['Nameserver 3'] || null,
        nameserver_4: whois['Nameserver 4'] || null,
        dnssec: whois['DNSSEC'] || null,
        renewal_cost: data.renewal_cost ? parseFloat(data.renewal_cost) : null,
        note: data.note || null,
      }).eq('id', domain.id);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      toast({
        title: 'Berhasil',
        description: 'Domain berhasil diperbarui',
      });
      router.push('/dashboard/domains');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memperbarui domain',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Domain</Label>
        <Input
          id="name"
          placeholder="contoh.com"
          {...register('name')}
          disabled={loading}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="renewal_cost">Biaya Perpanjangan (Rp)</Label>
        <Input
          id="renewal_cost"
          type="number"
          placeholder="500000"
          {...register('renewal_cost')}
          disabled={loading}
        />
        {errors.renewal_cost && (
          <p className="text-sm text-red-600 mt-1">{errors.renewal_cost.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="note">Catatan</Label>
        <Input
          id="note"
          placeholder="Catatan opsional"
          {...register('note')}
          disabled={loading}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/domains')}
          disabled={loading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
} 