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
  EyeOff
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
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canManage = canManageAssets(userRole)

  const filteredVps = vps.filter(vpsItem =>
    vpsItem.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vpsItem.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vpsItem.location?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const togglePasswordVisibility = (vpsId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [vpsId]: !prev[vpsId]
    }))
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

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari provider, IP, atau lokasi..."
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
              <TableHead>IP Address</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Kredensial</TableHead>
              <TableHead>Tanggal Kedaluwarsa</TableHead>
              <TableHead>Biaya Perpanjangan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Tidak ada VPS ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredVps.map((vpsItem) => {
                const daysUntilExpiry = getDaysUntilExpiry(vpsItem.expiry_date)
                const isPasswordVisible = showPasswords[vpsItem.id]
                
                return (
                  <TableRow key={vpsItem.id}>
                    <TableCell className="font-medium">{vpsItem.provider}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {vpsItem.ip_address}
                      </code>
                    </TableCell>
                    <TableCell>{vpsItem.location || '-'}</TableCell>
                    <TableCell>
                      {vpsItem.root_user && vpsItem.root_password ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">User:</span> {vpsItem.root_user}
                          </div>
                          <div className="text-sm flex items-center gap-2">
                            <span className="text-gray-600">Pass:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {isPasswordVisible ? vpsItem.root_password : '••••••••'}
                            </code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => togglePasswordVisibility(vpsItem.id)}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {vpsItem.expiry_date ? (
                        <div>
                          <p>{format(new Date(vpsItem.expiry_date), 'dd MMM yyyy', { locale: id })}</p>
                          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                            <p className="text-xs text-red-600">
                              {daysUntilExpiry} hari lagi
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
                      <Badge variant={getStatusColor(vpsItem.status) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                        {vpsItem.status === 'active' && 'Aktif'}
                        {vpsItem.status === 'expired' && 'Kedaluwarsa'}
                        {vpsItem.status === 'pending' && 'Pending'}
                      </Badge>
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
    </>
  )
} 