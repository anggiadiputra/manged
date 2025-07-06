"use client";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DomainInfo {
  id: string;
  name: string;
  cms?: string | null;
}

interface AddonDomainsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  domains: DomainInfo[];
  onDelete?: (id: string) => Promise<void>;
}

export function AddonDomainsDialog({ open, onOpenChange, loading, domains, onDelete }: AddonDomainsDialogProps) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(()=>{
    return domains.filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));
  },[domains, search]);

  async function handleCopy(name:string){
    try{
      await navigator.clipboard.writeText(name);
      setCopied(name);
      setTimeout(()=>setCopied(null),1500);
    }catch{}
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Addon Domain ({domains.length})</AlertDialogTitle>
        </AlertDialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat...</p>
        ) : domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada addon domain</p>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Cari domain..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              className="h-8"
            />
            <div className="max-h-72 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted sticky top-0">
                    <th className="px-3 py-2 text-left">Domain</th>
                    <th className="px-3 py-2 text-left">CMS</th>
                    <th className="px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d=> (
                    <tr key={d.name} className="border-t">
                      <td className="px-3 py-1.5 flex items-center gap-2">
                        {d.name}
                        <Button variant="ghost" size="icon" onClick={()=>handleCopy(d.name)}>
                          {copied===d.name ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </td>
                      <td className="px-3 py-1.5">{d.cms || '-'}</td>
                      <td className="px-3 py-1.5 text-center">
                        {onDelete && (
                          <Button variant="ghost" size="icon" onClick={()=>onDelete(d.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z" />
                            </svg>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-muted-foreground">Tidak ditemukan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Tutup</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 