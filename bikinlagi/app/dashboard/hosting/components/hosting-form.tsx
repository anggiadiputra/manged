"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  provider: z.string().min(1, 'Provider harus diisi'),
  package: z.string().min(1, 'Paket harus diisi'),
  associatedDomains: z.array(z.string()).optional(),
  renewalDate: z.string().min(1, 'Tanggal perpanjangan harus diisi'),
  cost: z.string().min(1, 'Biaya harus diisi'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function HostingForm({
  defaultValues,
  loading,
  onSubmit,
}: {
  defaultValues?: Partial<FormData>;
  loading?: boolean;
  onSubmit: (data: FormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="provider">Provider</Label>
        <Input id="provider" {...register('provider')} disabled={loading} />
        {errors.provider && <p className="text-sm text-red-600 mt-1">{errors.provider.message}</p>}
      </div>
      <div>
        <Label htmlFor="package">Paket</Label>
        <Input id="package" {...register('package')} disabled={loading} />
        {errors.package && <p className="text-sm text-red-600 mt-1">{errors.package.message}</p>}
      </div>
      <div>
        <Label htmlFor="associatedDomains">Domain Terkait</Label>
        <Input id="associatedDomains" placeholder="(multi-select placeholder)" disabled readOnly />
        {/* TODO: Ganti dengan komponen multi-select domain */}
      </div>
      <div>
        <Label htmlFor="renewalDate">Tanggal Perpanjangan</Label>
        <Input id="renewalDate" type="date" {...register('renewalDate')} disabled={loading} />
        {errors.renewalDate && <p className="text-sm text-red-600 mt-1">{errors.renewalDate.message}</p>}
      </div>
      <div>
        <Label htmlFor="cost">Biaya (Rp)</Label>
        <Input id="cost" type="number" {...register('cost')} disabled={loading} />
        {errors.cost && <p className="text-sm text-red-600 mt-1">{errors.cost.message}</p>}
      </div>
      <div>
        <Label htmlFor="note">Catatan</Label>
        <Input id="note" {...register('note')} disabled={loading} />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>) : 'Simpan'}
        </Button>
      </div>
    </form>
  );
} 