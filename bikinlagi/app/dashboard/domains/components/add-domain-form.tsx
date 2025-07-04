'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Search } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

const formSchema = z.object({
  name: z.string().min(1, 'Nama domain harus diisi'),
  registrar: z.string().optional(),
  expiry_date: z.string().optional(),
  renewal_cost: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending']),
})

type FormData = z.infer<typeof formSchema>

export function AddDomainForm() {
  const [loading, setLoading] = useState(false)
  const [checkingWhois, setCheckingWhois] = useState(false)
  const [whoisData, setWhoisData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'active',
    },
  })

  const domainName = watch('name')

  const checkWhois = async () => {
    if (!domainName) {
      toast({
        title: 'Error',
        description: 'Masukkan nama domain terlebih dahulu',
        variant: 'destructive',
      })
      return
    }

    setCheckingWhois(true)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_WHOIS_API_URL}?domain=${domainName}`
      )
      
      if (response.data) {
        setWhoisData(response.data)
        
        // Auto-fill form with WHOIS data
        if (response.data.registrar) {
          setValue('registrar', response.data.registrar)
        }
        
        if (response.data.expiry_date) {
          const expiryDate = new Date(response.data.expiry_date)
          setValue('expiry_date', format(expiryDate, 'yyyy-MM-dd'))
        }
        
        toast({
          title: 'Berhasil',
          description: 'Data WHOIS berhasil diambil',
        })
      }
    } catch (error) {
      console.error('WHOIS error:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengambil data WHOIS',
        variant: 'destructive',
      })
    } finally {
      setCheckingWhois(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const { error } = await supabase.from('domains').insert({
        name: data.name,
        registrar: data.registrar || null,
        whois_data: whoisData,
        expiry_date: data.expiry_date || null,
        renewal_cost: data.renewal_cost ? parseFloat(data.renewal_cost) : null,
        status: data.status,
        created_by: userData.user?.id,
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      // Log activity
      await supabase.rpc('log_activity', {
        p_action: 'create',
        p_entity_type: 'domain',
        p_details: { domain_name: data.name }
      })

      toast({
        title: 'Berhasil',
        description: 'Domain berhasil ditambahkan',
      })

      router.push('/dashboard/domains')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menambahkan domain',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Domain</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="name"
            placeholder="contoh.com"
            {...register('name')}
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={checkWhois}
            disabled={loading || checkingWhois}
          >
            {checkingWhois ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="registrar">Registrar</Label>
        <Input
          id="registrar"
          placeholder="Nama registrar"
          {...register('registrar')}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="expiry_date">Tanggal Kedaluwarsa</Label>
        <Input
          id="expiry_date"
          type="date"
          {...register('expiry_date')}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="renewal_cost">Biaya Perpanjangan (Rp)</Label>
        <Input
          id="renewal_cost"
          type="number"
          placeholder="500000"
          {...register('renewal_cost')}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={watch('status')}
          onValueChange={(value) => setValue('status', value as any)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="expired">Kedaluwarsa</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {whoisData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Data WHOIS</h4>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(whoisData, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Domain'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/domains')}
          disabled={loading}
        >
          Batal
        </Button>
      </div>
    </form>
  )
} 