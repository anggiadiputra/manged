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
import { UserRole } from '@/lib/auth-utils'
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

interface Staff {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
  last_login: string | null
}

interface StaffTableProps {
  staff: Staff[]
  currentUserId: string
}

export function StaffTable({ staff, currentUserId }: StaffTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus staff',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Berhasil',
        description: 'Staff berhasil dihapus',
      })
      router.refresh()
    }

    setDeleteId(null)
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'admin_web':
        return 'default'
      case 'finance':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin_web':
        return 'Admin Web'
      case 'finance':
        return 'Finance'
      default:
        return role
    }
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email, atau role..."
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
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Terakhir Login</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada staff ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name}
                    {member.id === currentUserId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Anda
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(member.role) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.last_login ? 
                      format(new Date(member.last_login), 'dd MMM yyyy HH:mm', { locale: id }) : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {format(new Date(member.created_at), 'dd MMM yyyy', { locale: id })}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/staff/${member.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {member.id !== currentUserId && (
                          <DropdownMenuItem
                            onClick={() => setDeleteId(member.id)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {filteredStaff.length === 0 ? (
          <p className="text-center py-8 text-gray-500 col-span-full">
            Tidak ada staff ditemukan
          </p>
        ) : (
          filteredStaff.map((member) => (
            <Card key={member.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                  <Badge variant={getRoleColor(member.role) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                    {getRoleLabel(member.role)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div>
                  <p className="text-sm font-medium">Terakhir Login</p>
                  <p className="text-sm text-gray-600">
                    {member.last_login ? format(new Date(member.last_login), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                  </p>
                </div>
                 <div>
                  <p className="text-sm font-medium">Bergabung</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(member.created_at), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href={`/dashboard/staff/${member.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                {member.id !== currentUserId && (
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Staff akan dihapus permanen dari sistem.
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