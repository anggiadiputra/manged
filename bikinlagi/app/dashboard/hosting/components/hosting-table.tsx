'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Search
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { canManageAssets, UserRole } from '@/lib/auth-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AddonDomainsDialog } from '@/components/dashboard/addon-domains-dialog'

interface Hosting {
  id: string
  provider: string
  package: string
  primary_domain: string | null
  expiry_date: string | null
  renewal_cost: number | null
  status: string
  created_at: string
  updated_at: string
}

interface HostingTableProps {
  hosting: Hosting[]
  userRole: UserRole
}

export function HostingTable({ hosting, userRole }: HostingTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addonHostingId, setAddonHostingId] = useState<string | null>(null)
  const [addonDomains, setAddonDomains] = useState<any[]>([])
  const [addonLoading, setAddonLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canManage = canManageAssets(userRole)

  const filteredHosting = hosting.filter(item =>
    item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.primary_domain?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('hosting')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus hosting',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Berhasil',
        description: 'Hosting berhasil dihapus',
      })
      router.refresh()
      setDeleteId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'expired':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    return days
  }

  async function handleShowAddon(hostingId:string){
    setAddonHostingId(hostingId);
    setAddonLoading(true);
    const { data, error } = await supabase
      .from('domain_hosting')
      .select('domain_id, domains(name)')
      .eq('hosting_id', hostingId);
    if(!error && data){
      const names = data.map((d:any)=>({id:d.domain_id, name:d.domains?.name})).filter((d:any)=>d.name);
      // fetch cms for each name
      const cmsPromises = names.map(async (n:any)=>{
        const { data: w } = await supabase.from('websites').select('cms').eq('domain', n.name).single();
        return { ...n, cms: w?.cms || '-' };
      });
      const arr = await Promise.all(cmsPromises);
      setAddonDomains(arr);
    } else {
      setAddonDomains([]);
    }
    setAddonLoading(false);
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari provider, paket, atau domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Domain Utama</TableHead>
              <TableHead>Tanggal Kedaluwarsa</TableHead>
              <TableHead>Biaya Perpanjangan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Addon</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHosting.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Tidak ada hosting ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredHosting.map((item) => {
                const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.provider}</TableCell>
                    <TableCell>{item.package}</TableCell>
                    <TableCell>{item.primary_domain || '-'}</TableCell>
                    <TableCell>
                      {item.expiry_date ? (
                        <div>
                          <p>{format(new Date(item.expiry_date), 'dd MMM yyyy', { locale: id })}</p>
                          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                            <p className="text-xs text-red-600">
                              {daysUntilExpiry} hari lagi
                            </p>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.renewal_cost ? 
                        `Rp ${item.renewal_cost.toLocaleString('id-ID')}` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(item.status) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                        {item.status === 'active' && 'Aktif'}
                        {item.status === 'expired' && 'Kedaluwarsa'}
                        {item.status === 'pending' && 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={()=>handleShowAddon(item.id)}>
                        Lihat
                      </Button>
                    </TableCell>
                    <TableCell>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/hosting/${item.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteId!)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddonDomainsDialog
        open={!!addonHostingId}
        onOpenChange={(o)=>{if(!o){setAddonHostingId(null); setAddonDomains([])}}}
        loading={addonLoading}
        domains={addonDomains}
        onDelete={async (domainRelId:string)=>{
          // domainRelId is domain_id
          await supabase.from('domain_hosting').delete().eq('hosting_id', addonHostingId!).eq('domain_id', domainRelId);
          setAddonDomains(prev=>prev.filter(d=>d.id!==domainRelId));
        }}
      />
    </>
  )
} 