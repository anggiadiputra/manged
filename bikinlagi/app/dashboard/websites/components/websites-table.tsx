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
  ExternalLink
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

interface Website {
  id: string
  domain: string
  cms: string | null
  ip_address: string | null
  hosting_id: string | null
  vps_id: string | null
  admin_username: string | null
  admin_password: string | null
  expiry_date: string | null
  renewal_cost: number | null
  status: string
  created_at: string
  updated_at: string
  hosting?: {
    provider: string
    package: string
  } | null
  vps?: {
    provider: string
    ip_address: string
  } | null
}

interface WebsitesTableProps {
  websites: Website[]
  userRole: UserRole
}

export function WebsitesTable({ websites, userRole }: WebsitesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canManage = canManageAssets(userRole)

  const filteredWebsites = websites.filter(website =>
    website.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.cms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.hosting?.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.vps?.provider?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus website',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Berhasil',
        description: 'Website berhasil dihapus',
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

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari domain, CMS, atau hosting..."
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
              <TableHead>Domain</TableHead>
              <TableHead>CMS</TableHead>
              <TableHead>Hosting/VPS</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Tanggal Kedaluwarsa</TableHead>
              <TableHead>Biaya Perpanjangan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWebsites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Tidak ada website ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredWebsites.map((website) => {
                const daysUntilExpiry = getDaysUntilExpiry(website.expiry_date)
                return (
                  <TableRow key={website.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {website.domain}
                        <a 
                          href={`https://${website.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>{website.cms || '-'}</TableCell>
                    <TableCell>
                      {website.hosting ? (
                        <div>
                          <p className="font-medium">{website.hosting.provider}</p>
                          <p className="text-xs text-gray-600">{website.hosting.package}</p>
                        </div>
                      ) : website.vps ? (
                        <div>
                          <p className="font-medium">{website.vps.provider}</p>
                          <p className="text-xs text-gray-600">VPS</p>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {website.ip_address ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {website.ip_address}
                        </code>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {website.expiry_date ? (
                        <div>
                          <p>{format(new Date(website.expiry_date), 'dd MMM yyyy', { locale: id })}</p>
                          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                            <p className="text-xs text-red-600">
                              {daysUntilExpiry} hari lagi
                            </p>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {website.renewal_cost ? 
                        `Rp ${website.renewal_cost.toLocaleString('id-ID')}` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(website.status) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                        {website.status === 'active' && 'Aktif'}
                        {website.status === 'expired' && 'Kedaluwarsa'}
                        {website.status === 'pending' && 'Pending'}
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
                                <Link href={`/dashboard/websites/${website.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(website.id)}
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
              Tindakan ini tidak dapat dibatalkan. Website akan dihapus permanen dari sistem.
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