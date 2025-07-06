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
import { getExpiryStatus } from '@/lib/utils'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-md border">
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
                const expiryStatus = getExpiryStatus(item.expiry_date)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.provider}</TableCell>
                    <TableCell>{item.package}</TableCell>
                    <TableCell>{item.primary_domain || '-'}</TableCell>
                    <TableCell>
                      {item.expiry_date ? (
                        <div>
                          <p>{format(new Date(item.expiry_date), 'dd MMM yyyy', { locale: id })}</p>
                          {expiryStatus.label && (
                            <p className={`text-xs ${expiryStatus.className}`}>
                              {expiryStatus.label}
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
                      {(() => {
                        let badgeClass = '';
                        let statusLabel = 'Active';

                        if (item.status === 'expired' || expiryStatus.label === 'Expired') {
                          badgeClass = 'bg-red-600 text-white';
                          statusLabel = 'Expired';
                        } else if (expiryStatus.className.includes('orange')) {
                          badgeClass = 'bg-orange-500 text-white';
                          statusLabel = 'Warning';
                        } else if (expiryStatus.className.includes('yellow')) {
                          badgeClass = 'bg-yellow-400 text-black';
                          statusLabel = 'Soon';
                        }

                        return (
                          <Badge variant="outline" className={badgeClass}>
                            {statusLabel}
                          </Badge>
                        );
                      })()}
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

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {filteredHosting.length === 0 ? (
          <p className="text-center py-8 text-gray-500 col-span-full">
            Tidak ada hosting ditemukan
          </p>
        ) : (
          filteredHosting.map((item) => {
            const expiryStatus = getExpiryStatus(item.expiry_date);
            let badgeClass = '';
            let statusLabel = 'Active';

            if (item.status === 'expired' || expiryStatus.label === 'Expired') {
              badgeClass = 'bg-red-600 text-white';
              statusLabel = 'Expired';
            } else if (expiryStatus.className.includes('orange')) {
              badgeClass = 'bg-orange-500 text-white';
              statusLabel = 'Warning';
            } else if (expiryStatus.className.includes('yellow')) {
              badgeClass = 'bg-yellow-400 text-black';
              statusLabel = 'Soon';
            }

            return (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.provider}</CardTitle>
                      <CardDescription>{item.package}</CardDescription>
                    </div>
                    <Badge variant="outline" className={badgeClass}>
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div>
                    <p className="text-sm font-medium">Domain Utama</p>
                    <p className="text-sm text-gray-600">{item.primary_domain || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tanggal Kedaluwarsa</p>
                    <div className="text-sm text-gray-600">
                      {item.expiry_date ? (
                        <>
                          <span>{format(new Date(item.expiry_date), 'dd MMM yyyy', { locale: id })}</span>
                          {expiryStatus.label && (
                            <span className={`ml-2 ${expiryStatus.className}`}>
                              ({expiryStatus.label})
                            </span>
                          )}
                        </>
                      ) : '-'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Biaya Perpanjangan</p>
                    <p className="text-sm text-gray-600">
                      {item.renewal_cost ? `Rp ${item.renewal_cost.toLocaleString('id-ID')}` : '-'}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                   <Button variant="outline" size="sm" onClick={()=>handleShowAddon(item.id)}>
                      Lihat Addon
                   </Button>
                   {canManage && (
                    <div className="flex gap-2">
                      <Link href={`/dashboard/hosting/${item.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                       <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )}
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