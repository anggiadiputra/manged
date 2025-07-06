"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input as TextInput } from "@/components/ui/input";
import { useState } from "react";

const formSchema = z.object({
  provider: z.string().min(1, "Provider harus diisi"),
  ip_address: z.string().min(1, "IP Address harus diisi"),
  root_user: z.string().optional(),
  root_password: z.string().optional(),
  expiry_date: z.string().min(1, "Tanggal kedaluwarsa harus diisi"),
  renewal_cost: z.string().min(1, "Biaya perpanjangan harus diisi"),
  associatedDomains: z.array(z.string()).min(1, "Pilih minimal satu domain"),
});

type FormData = z.infer<typeof formSchema>;

export function VpsForm({
  defaultValues,
  loading,
  onSubmit,
  onCancel,
  domains,
  isEdit,
}: {
  defaultValues?: Partial<FormData>;
  loading?: boolean;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  domains?: { id: string; name: string }[];
  isEdit?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const domainList = domains || [];
  const selectedDomains = watch('associatedDomains') || [];
  const filteredDomains = domainList.filter(d=>d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="provider">Provider</Label>
        <Input id="provider" {...register("provider") } disabled={loading} />
        {errors.provider && (
          <p className="text-sm text-red-600 mt-1">{errors.provider.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="ip_address">IP Address</Label>
        <Input id="ip_address" {...register("ip_address") } disabled={loading} />
        {errors.ip_address && (
          <p className="text-sm text-red-600 mt-1">{errors.ip_address.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="root_user">Root User</Label>
        <Input id="root_user" {...register("root_user") } disabled={loading} />
      </div>
      <div>
        <Label htmlFor="root_password">Root Password</Label>
        <Input id="root_password" type="password" {...register("root_password") } disabled={loading} />
      </div>
      <div>
        <Label htmlFor="expiry_date">Tanggal Kedaluwarsa</Label>
        <Input id="expiry_date" type="date" {...register("expiry_date") } disabled={loading} />
        {errors.expiry_date && (
          <p className="text-sm text-red-600 mt-1">{errors.expiry_date.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="renewal_cost">Biaya Perpanjangan (Rp)</Label>
        <Input id="renewal_cost" type="number" {...register("renewal_cost") } disabled={loading} />
        {errors.renewal_cost && (
          <p className="text-sm text-red-600 mt-1">{errors.renewal_cost.message}</p>
        )}
      </div>
      <div>
        <Label>Domain Terkait</Label>
        {domainList.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">Tidak ada domain tersedia</p>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-between" disabled={loading}>
                <span className="truncate">
                  {selectedDomains.length === 0 ? (
                    'Pilih Domain'
                  ) : (
                    (() => {
                      const names = selectedDomains.map(id=>domainList.find(d=>d.id===id)?.name).filter(Boolean) as string[];
                      if(names.length<=2) return names.join(', ');
                      return `${names[0]}, +${names.length-1} lainnya`;
                    })()
                  )}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom" className="w-full max-h-72 overflow-y-auto">
              <div className="px-2 py-2 sticky top-0 bg-white z-10">
                <TextInput value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Cari domain..." className="h-8" onKeyDown={e=>e.stopPropagation()} />
              </div>
              {filteredDomains.length===0 && <p className="px-3 py-2 text-sm text-gray-500">Domain tidak ditemukan</p>}
              {filteredDomains.map(domain=>{
                const checked = selectedDomains.includes(domain.id);
                return (
                  <DropdownMenuCheckboxItem key={domain.id} checked={checked} onCheckedChange={(val)=>{
                    let updated:string[];
                    if(val){updated=[...selectedDomains,domain.id];}
                    else{updated=selectedDomains.filter(id=>id!==domain.id);} 
                    setValue('associatedDomains',updated,{shouldValidate:true});
                  }}>
                    {domain.name}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {errors.associatedDomains && (<p className="text-sm text-red-600 mt-1">{errors.associatedDomains.message as string}</p>)}
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
          ) : (
            "Simpan"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
} 