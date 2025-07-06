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
  Search,
  Eye,
  EyeOff,
  Copy,
  Check
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getExpiryStatus } from '@/lib/utils'

interface Vps {
  id: string
  provider: string
  ip_address: string
  location: string | null
  root_user: string | null
  root_password: string | null
  expiry_date: string | null
  renewal_cost: number | null
  status: string
  created_at: string
  updated_at: string
}

interface VpsTableProps {
  vps: Vps[]
  userRole: UserRole
}

export function VpsTable({ vps, userRole }: VpsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [credVps, setCredVps] = useState<{ip:string,user:string,pass:string}|null>(null)
  const [credLoading, setCredLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canManage = canManageAssets(userRole)

  const filteredVps = vps.filter(vpsItem =>
    vpsItem.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vpsItem.ip_address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from('vps')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus VPS',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Berhasil',
        description: 'VPS berhasil dihapus',
      })
      router.refresh()
    }

    setDeleteId(null)
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

  function handleCopy(text:string, field:string){
    navigator.clipboard.writeText(text).then(()=>{
      setCopiedField(field);
      setTimeout(()=>setCopiedField(null),1500);
    });
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari provider atau IP..."
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
              <TableHead>IP Address</TableHead>
              <TableHead>Tanggal Kedaluwarsa</TableHead>
              <TableHead>Biaya Perpanjangan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada VPS ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredVps.map((vpsItem) => {
                const expiryStatus = getExpiryStatus(vpsItem.expiry_date)
                
                return (
                  <TableRow key={vpsItem.id}>
                    <TableCell className="font-medium">{vpsItem.provider}</TableCell>
                    <TableCell>
                      <button type="button" className="underline text-blue-600 hover:text-blue-800" onClick={async()=>{
                        setCredLoading(true);
                        const { data } = await supabase.rpc('get_vps_credentials', { p_vps_id: vpsItem.id });
                        if(data && data.length>0){
                          const row = data[0];
                          setCredVps({ ip: row.ip as string, user: row.root_user as string, pass: row.root_password as string });
                        } else {
                          setCredVps({ ip: vpsItem.ip_address, user: '-', pass: '-' });
                        }
                        setCredLoading(false);
                      }}>
                        {vpsItem.ip_address}
                      </button>
                    </TableCell>
                    <TableCell>
                      {vpsItem.expiry_date ? (
                        <div>
                          <p>{format(new Date(vpsItem.expiry_date), 'dd MMM yyyy', { locale: id })}</p>
                          {expiryStatus.label && (
                            <p className={`text-xs ${expiryStatus.className}`}>
                              {expiryStatus.label}
                            </p>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {vpsItem.renewal_cost ? 
                        `Rp ${vpsItem.renewal_cost.toLocaleString('id-ID')}` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {(() => {
                        let badgeClass = '';
                        let statusLabel = 'Active';

                        if (vpsItem.status === 'expired' || expiryStatus.label === 'Expired') {
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
                          {canManage && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/vps/${vpsItem.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(vpsItem.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        {filteredVps.length === 0 ? (
          <p className="text-center py-8 text-gray-500 col-span-full">
            Tidak ada VPS ditemukan
          </p>
        ) : (
          filteredVps.map((vpsItem) => {
            const expiryStatus = getExpiryStatus(vpsItem.expiry_date);
            let badgeClass = '';
            let statusLabel = 'Active';

            if (vpsItem.status === 'expired' || expiryStatus.label === 'Expired') {
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
              <Card key={vpsItem.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vpsItem.provider}</CardTitle>
                      <button type="button" className="text-sm text-blue-600 hover:underline" onClick={async()=>{
                        setCredLoading(true);
                        const { data } = await supabase.rpc('get_vps_credentials', { p_vps_id: vpsItem.id });
                        if(data && data.length>0){
                          const row = data[0];
                          setCredVps({ ip: row.ip as string, user: row.root_user as string, pass: row.root_password as string });
                        } else {
                          setCredVps({ ip: vpsItem.ip_address, user: '-', pass: '-' });
                        }
                        setCredLoading(false);
                      }}>
                        {vpsItem.ip_address}
                      </button>
                    </div>
                    <Badge variant="outline" className={badgeClass}>
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                   <div>
                    <p className="text-sm font-medium">Tanggal Kedaluwarsa</p>
                    <div className="text-sm text-gray-600">
                      {vpsItem.expiry_date ? (
                        <>
                          <span>{format(new Date(vpsItem.expiry_date), 'dd MMM yyyy', { locale: id })}</span>
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
                      {vpsItem.renewal_cost ? `Rp ${vpsItem.renewal_cost.toLocaleString('id-ID')}` : '-'}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                   {canManage && (
                    <>
                      <Link href={`/dashboard/vps/${vpsItem.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                       <Button size="sm" variant="destructive" onClick={() => setDeleteId(vpsItem.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
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
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. VPS akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credential modal */}
      <AlertDialog open={!!credVps} onOpenChange={()=>setCredVps(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kredensial VPS</AlertDialogTitle>
          </AlertDialogHeader>
          {credLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : credVps && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <div><strong>IP:</strong> {credVps.ip}</div>
              <div className="flex items-center gap-2"><strong>User:</strong> {credVps.user || '-'}
                {credVps.user && credVps.user!== '-' && (
                  <button onClick={()=>handleCopy(credVps.user,'user')} className="text-muted-foreground hover:text-primary">
                    {copiedField==='user'? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                  </button>)}</div>
              <div className="flex items-center gap-2"><strong>Password:</strong> {credVps.pass ? '••••••••' : '-'}
                {credVps.pass && (
                  <button onClick={()=>handleCopy(credVps.pass,'pass')} className="text-muted-foreground hover:text-primary">
                    {copiedField==='pass'? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                  </button>)}</div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={()=>setCredVps(null)}>Tutup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 