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
import { Input } from '@/components/ui/input'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  AlertDialog as CredentialDialog,
  AlertDialogContent as CredentialDialogContent,
  AlertDialogHeader as CredentialDialogHeader,
  AlertDialogTitle as CredentialDialogTitle,
  AlertDialogFooter as CredentialDialogFooter,
  AlertDialogAction as CredentialDialogAction,
} from '@/components/ui/alert-dialog'

interface Website {
  id: string
  domain: string
  cms: string | null
  ip_address: string | null
  hosting_id: string | null
  vps_id: string | null
  renewal_cost: number | null
  created_at: string
  updated_at: string
  admin_username?: string | null
  admin_password?: string | null
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
  const [cred, setCred] = useState<{ username: string; password: string } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canManage = canManageAssets(userRole)

  const filteredWebsites = websites.filter(
    (website) =>
      website.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.cms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.hosting?.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.vps?.provider?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase.from('websites').delete().eq('id', deleteId)

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      toast({ title: 'Disalin', description: `${field === 'user' ? 'Username' : 'Password'} tersalin` })
      setTimeout(() => setCopiedField(null), 1500)
    })
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
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWebsites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Tidak ada website ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredWebsites.map((website) => (
                <TableRow key={website.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span
                        className="cursor-pointer underline text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setCopiedField(null)
                          setCred({
                            username: website.admin_username || '-',
                            password: website.admin_password || '-',
                          })
                        }}
                      >
                        {website.domain}
                      </span>
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
                    ) : (
                      '-')
                    }
                  </TableCell>
                  <TableCell>
                    {website.ip_address ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {website.ip_address}
                      </code>
                    ) : (
                      '-')
                    }
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
              ))
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
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CredentialDialog open={cred!==null} onOpenChange={()=>setCred(null)}>
        <CredentialDialogContent>
          <CredentialDialogHeader>
            <CredentialDialogTitle>Kredensial Website</CredentialDialogTitle>
          </CredentialDialogHeader>
          {cred ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><strong>User:</strong> {cred.username || '-'}
                {cred.username && cred.username!=='-' && (
                  <button onClick={()=>handleCopy(cred.username,'user')} className="text-muted-foreground hover:text-primary">
                    {copiedField==='user'? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                  </button>)}</div>
              <div className="flex items-center gap-2"><strong>Password:</strong> {cred.password ? '••••••••' : '-'}
                {cred.password && cred.password!=='-' && (
                  <button onClick={()=>handleCopy(cred.password,'pass')} className="text-muted-foreground hover:text-primary">
                    {copiedField==='pass'? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                  </button>)}</div>
            </div>
          ): <p className="text-sm text-muted-foreground">Tidak ada credential</p> }
          <CredentialDialogFooter>
            <CredentialDialogAction onClick={()=>setCred(null)}>Tutup</CredentialDialogAction>
          </CredentialDialogFooter>
        </CredentialDialogContent>
      </CredentialDialog>
    </>
  )
} 