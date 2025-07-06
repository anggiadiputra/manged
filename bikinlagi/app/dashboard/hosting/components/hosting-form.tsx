"use client";
import { useState } from "react";
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

const formSchema = z.object({
  provider: z.string().min(1, 'Provider harus diisi'),
  package: z.string().min(1, 'Paket harus diisi'),
  expiry_date: z.string().min(1, 'Tanggal kedaluwarsa harus diisi'),
  renewal_cost: z.string().min(1, 'Biaya perpanjangan harus diisi'),
  associatedDomains: z.array(z.string()).min(1, 'Pilih minimal satu domain'),
});

type FormData = z.infer<typeof formSchema>;

type Domain = { id: string; name: string };

export function HostingForm({
  defaultValues,
  loading,
  onSubmit,
  onCancel,
  domains = [],
}: {
  defaultValues?: Partial<FormData>;
  loading?: boolean;
  onSubmit: (data: FormData & { primary_domain: string }) => void;
  onCancel?: () => void;
  domains?: Domain[];
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedDomains = watch('associatedDomains') || [];
  const primaryDomain = selectedDomains[0] ? domains.find(d => d.id === selectedDomains[0])?.name || '' : '';

  const [searchTerm, setSearchTerm] = useState('');
  const filteredDomains = domains.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, primary_domain: primaryDomain }))} className="space-y-4">
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
        <Label>Domain Terkait</Label>
        {domains.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">Tidak ada domain tersedia</p>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                disabled={loading}
              >
                <span className="truncate">
                  {selectedDomains.length === 0 ? (
                    'Pilih Domain'
                  ) : (
                    (() => {
                      const names = selectedDomains
                        .map(id => domains.find(d => d.id === id)?.name)
                        .filter(Boolean) as string[];
                      if (names.length <= 2) return names.join(', ');
                      return `${names[0]}, +${names.length - 1} lainnya`;
                    })()
                  )}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom" className="w-full max-h-72 overflow-y-auto">
              <div className="px-2 py-2 sticky top-0 bg-white z-10">
                <Input
                  placeholder="Cari domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8"
                />
              </div>
              {filteredDomains.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-500">Domain tidak ditemukan</p>
              )}
              {filteredDomains.map(domain => {
                const isSelected = selectedDomains.includes(domain.id);
                const isPrimary = selectedDomains[0] === domain.id;
                return (
                  <DropdownMenuCheckboxItem
                    key={domain.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      let updated: string[];
                      if (checked) {
                        updated = [...selectedDomains, domain.id];
                      } else {
                        updated = selectedDomains.filter(id => id !== domain.id);
                      }
                      // Ensure order: primary domain first, others follow order of selection
                      setValue('associatedDomains', updated, { shouldValidate: true });
                    }}
                  >
                    <span>{domain.name}</span>
                    {isPrimary && <span className="ml-2 text-xs text-blue-600">(utama)</span>}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {errors.associatedDomains && (
          <p className="text-sm text-red-600 mt-1">
            {errors.associatedDomains.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="expiry_date">Tanggal Kedaluwarsa</Label>
        <Input id="expiry_date" type="date" {...register('expiry_date')} disabled={loading} />
        {errors.expiry_date && <p className="text-sm text-red-600 mt-1">{errors.expiry_date.message}</p>}
      </div>
      <div>
        <Label htmlFor="renewal_cost">Biaya Perpanjangan (Rp)</Label>
        <Input id="renewal_cost" type="number" {...register('renewal_cost')} disabled={loading} />
        {errors.renewal_cost && <p className="text-sm text-red-600 mt-1">{errors.renewal_cost.message}</p>}
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>) : 'Simpan'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  );
} 