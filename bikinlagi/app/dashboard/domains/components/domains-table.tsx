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
import { canManageAssets, canUpdateWhois, UserRole } from '@/lib/auth-utils'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface Domain {
  id: string
  domain_id?: string | null
  name: string
  registrar?: string | null
  created_on?: string | null
  last_update_on?: string | null
  expiry_date?: string | null
  status?: string | null
  nameserver_1?: string | null
  nameserver_2?: string | null
  nameserver_3?: string | null
  nameserver_4?: string | null
  dnssec?: string | null
  renewal_cost?: number | null
  note?: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  created_by_name?: string | null
}

interface DomainsTableProps {
  domains: Domain[]
  userRole: UserRole
}

export function DomainsTable({ domains, userRole }: DomainsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [whoisLoading, setWhoisLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canManage = canManageAssets(userRole)
  const canEditWhois = canUpdateWhois(userRole)

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.registrar?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus domain',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Berhasil',
        description: 'Domain berhasil dihapus',
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

  const getStatusBadgeVariant = (status: string, daysUntilExpiry: number | null) => {
    if (status === 'expired' || (daysUntilExpiry !== null && daysUntilExpiry <= 0)) {
      return 'destructive'; // merah
    }
    if (daysUntilExpiry !== null && daysUntilExpiry <= 30) {
      return 'soon'; // kuning (custom, will use className)
    }
    if (status === 'active') {
      return 'default'; // hijau/default
    }
    return 'outline';
  };

  async function handleUpdateWhois(domain: Domain) {
    setWhoisLoading(true)
    try {
      const res = await fetch(`/api/whois?domain=${domain.name}`)
      const whoisJson = await res.json()
      if (!whoisJson.success || !whoisJson.data) throw new Error('Gagal fetch WHOIS')
      const whois = whoisJson.data
      const { error } = await supabase.from('domains').update({
        domain_id: whois['Domain ID'] || null,
        registrar: whois['Registrar Name'] || null,
        created_on: whois['Created On'] ? new Date(whois['Created On']).toISOString() : null,
        last_update_on: whois['Last Update On'] ? new Date(whois['Last Update On']).toISOString() : null,
        expiry_date: whois['Expiration Date'] ? whois['Expiration Date'].slice(0, 10) : null,
        status: whois['Status'] || null,
        nameserver_1: whois['Nameserver 1'] || null,
        nameserver_2: whois['Nameserver 2'] || null,
        nameserver_3: whois['Nameserver 3'] || null,
        nameserver_4: whois['Nameserver 4'] || null,
        dnssec: whois['DNSSEC'] || null,
      }).eq('id', domain.id)
      if (error) throw error
      toast({ title: 'Berhasil', description: 'Data WHOIS berhasil diperbarui' })
      setSelectedDomain(null)
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setWhoisLoading(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari domain atau registrar..."
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
              <TableHead>Registrar</TableHead>
              <TableHead>Tanggal Kedaluwarsa</TableHead>
              <TableHead>Biaya Perpanjangan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDomains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada domain ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredDomains.map((domain) => {
                const daysUntilExpiry = getDaysUntilExpiry(domain.expiry_date)
                return (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() => setSelectedDomain(domain)}
                        >
                          {domain.name}
                        </button>
                        <a 
                          href={`https://${domain.name}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>{domain.registrar || '-'}</TableCell>
                    <TableCell>
                      {domain.expiry_date ? (
                        <div>
                          <p>{format(new Date(domain.expiry_date), 'dd MMM yyyy', { locale: id })}</p>
                          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                            <p className="text-xs text-red-600">
                              {daysUntilExpiry} hari lagi
                            </p>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {domain.renewal_cost ? 
                        `Rp ${domain.renewal_cost.toLocaleString('id-ID')}` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const daysUntilExpiry = getDaysUntilExpiry(domain.expiry_date);
                        const badgeVariant = getStatusBadgeVariant(domain.status, daysUntilExpiry);
                        let badgeClass = '';
                        if (badgeVariant === 'soon') {
                          badgeClass = 'bg-yellow-400 text-black';
                        }
                        if (badgeVariant === 'destructive') {
                          badgeClass = 'bg-red-600 text-white';
                        }
                        return (
                          <Badge variant={badgeVariant === 'soon' ? 'outline' : badgeVariant as any} className={badgeClass}>
                            {badgeVariant === 'destructive' ? 'Expired' : badgeVariant === 'soon' ? 'Soon' : 'Aktif'}
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
                          {(canManage || canEditWhois) && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/domains/${domain.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canManage && (
                            <DropdownMenuItem
                              onClick={() => setDeleteId(domain.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
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
              Tindakan ini tidak dapat dibatalkan. Domain akan dihapus permanen dari sistem.
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

      <Dialog open={!!selectedDomain} onOpenChange={() => setSelectedDomain(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Domain</DialogTitle>
            <DialogDescription>
              {selectedDomain && (
                <div className="space-y-2 text-left">
                  <div><strong>Domain ID:</strong> {selectedDomain.domain_id || '-'}</div>
                  <div><strong>Nama:</strong> {selectedDomain.name}</div>
                  <div><strong>Registrar:</strong> {selectedDomain.registrar || '-'}</div>
                  <div><strong>Dibuat Pada:</strong> {selectedDomain.created_on ? format(new Date(selectedDomain.created_on ?? ''), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}</div>
                  <div><strong>Update Terakhir:</strong> {selectedDomain.last_update_on ? format(new Date(selectedDomain.last_update_on ?? ''), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}</div>
                  <div><strong>Tanggal Kedaluwarsa:</strong> {selectedDomain.expiry_date ? format(new Date(selectedDomain.expiry_date ?? ''), 'dd MMM yyyy', { locale: id }) : '-'}</div>
                  <div><strong>Status:</strong> {selectedDomain.status || '-'}</div>
                  <div><strong>Nameserver 1:</strong> {selectedDomain.nameserver_1 || '-'}</div>
                  <div><strong>Nameserver 2:</strong> {selectedDomain.nameserver_2 || '-'}</div>
                  <div><strong>Nameserver 3:</strong> {selectedDomain.nameserver_3 || '-'}</div>
                  <div><strong>Nameserver 4:</strong> {selectedDomain.nameserver_4 || '-'}</div>
                  <div><strong>DNSSEC:</strong> {selectedDomain.dnssec || '-'}</div>
                  <div><strong>Biaya Perpanjangan:</strong> {selectedDomain.renewal_cost ? `Rp ${selectedDomain.renewal_cost.toLocaleString('id-ID')}` : '-'}</div>
                  <div><strong>Catatan:</strong> {selectedDomain.note || '-'}</div>
                  <div><strong>Diupdate:</strong> {selectedDomain.updated_at ? format(new Date(selectedDomain.updated_at ?? ''), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}</div>
                  <div><strong>Oleh:</strong> {selectedDomain.created_by_name || '-'}</div>
                  {canEditWhois && (
                    <div className="pt-4">
                      <Button
                        onClick={() => handleUpdateWhois(selectedDomain)}
                        disabled={whoisLoading}
                        variant="secondary"
                      >
                        {whoisLoading ? 'Memperbarui...' : 'Update WHOIS'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
} 