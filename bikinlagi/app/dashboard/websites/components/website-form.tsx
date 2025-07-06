'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClient } from '@/lib/auth-client'

// Define a subset of the websites row we actually need in this form
interface WebsiteRow {
  id: string
  domain: string
  cms: string | null
  ip_address: string | null
  hosting_id: string | null
  vps_id: string | null
  admin_username?: string
  admin_password?: string
}

const websiteSchema = z.object({
  domain: z.string().min(1, 'Domain harus dipilih'),
  cms: z.string().optional(),
  providerType: z.enum(['shared', 'vps'], {
    required_error: 'Tipe provider harus dipilih',
  }),
  providerId: z.string().min(1, 'Provider harus dipilih'),
  ip_address: z.string().optional(),
  admin_username: z.string().optional(),
  admin_password: z.string().optional(),
})

type WebsiteFormValues = z.infer<typeof websiteSchema>

interface WebsiteFormProps {
  initialData?: WebsiteRow
  onCancel?: () => void
}

export function WebsiteForm({ initialData, onCancel }: WebsiteFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [domainOptions, setDomainOptions] = useState<{ id: string; name: string }[]>([])
  const [providerOptions, setProviderOptions] = useState<{ id: string; label: string }[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [providerAuto, setProviderAuto] = useState(false)
  const [autoProviderLabel, setAutoProviderLabel] = useState('')

  // --------------------------------------
  // Fetch list of domains (active only)
  // --------------------------------------
  useEffect(() => {
    async function fetchDomains() {
      const { data, error } = await supabase
        .from('domains')
        .select('id, name, expiry_date')
        .order('name', { ascending: true })

      if (!error && data) {
        // Tampilkan hanya domain yang belum expired atau belum punya tanggal kedaluwarsa
        const today = new Date()
        const valid = data.filter((d: any) => !d.expiry_date || new Date(d.expiry_date) > today)
        setDomainOptions(valid)
      }
    }
    fetchDomains()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --------------------------------------
  // Fetch providers (hosting / vps) whenever providerType changes
  // --------------------------------------
  async function loadProviders(type: 'shared' | 'vps') {
    setLoadingProviders(true)
    if (type === 'shared') {
      const { data } = await supabase
        .from('hosting')
        .select('id, provider, primary_domain')
        .order('provider', { ascending: true })
      const opts = (data || []).map((h) => ({
        id: h.id as string,
        label: `${h.provider} – ${h.primary_domain || '-'}`,
      }))
      setProviderOptions(opts)
    } else {
      const { data } = await supabase
        .from('vps')
        .select('id, provider, ip_address')
        .order('provider', { ascending: true })
      const opts = (data || []).map((v) => ({ id: v.id as string, label: `${v.provider} – ${v.ip_address}` }))
      setProviderOptions(opts)
    }
    setLoadingProviders(false)
  }

  // ----------------------------------------------------
  // Set default values depending on edit / new mode
  // ----------------------------------------------------
  const defaultProviderType = initialData
    ? initialData.hosting_id
      ? 'shared'
      : 'vps'
    : 'shared'
  const defaultProviderId = initialData ? initialData.hosting_id || initialData.vps_id || '' : ''

  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      domain: initialData?.domain || '',
      cms: initialData?.cms || '',
      providerType: defaultProviderType as 'shared' | 'vps',
      providerId: defaultProviderId,
      ip_address: initialData?.ip_address || '',
      admin_username: (initialData as any)?.admin_username || '',
      admin_password: (initialData as any)?.admin_password || '',
    },
  })

  // Load providers when providerType default differs from first render (edit mode)
  useEffect(() => {
    loadProviders(defaultProviderType as 'shared' | 'vps')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ----------------------------------------------------
  // Auto detect hosting / VPS when domain changes
  // ----------------------------------------------------
  const selectedDomain = form.watch('domain')
  useEffect(() => {
    if (!selectedDomain) return

    ;(async () => {
      let detected: { type: 'shared' | 'vps'; id: string; label: string } | null = null

      // 1. Cek tabel websites
      const { data: w } = await supabase
        .from('websites')
        .select('hosting_id, vps_id')
        .eq('domain', selectedDomain)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (w) {
        if (w.hosting_id) {
          const { data: h } = await supabase
            .from('hosting')
            .select('id, provider, primary_domain')
            .eq('id', w.hosting_id as string)
            .maybeSingle()
          if (h) {
            detected = {
              type: 'shared',
              id: h.id as string,
              label: `${h.provider} – ${h.primary_domain || '-'}`,
            }
          }
        } else if (w.vps_id) {
          const { data: v } = await supabase
            .from('vps')
            .select('id, provider, ip_address')
            .eq('id', w.vps_id as string)
            .maybeSingle()
          if (v) {
            detected = {
              type: 'vps',
              id: v.id as string,
              label: `${v.provider} – ${v.ip_address}`,
            }
          }
        }
      }

      // 2. Cek hosting.primary_domain
      if (!detected) {
        const { data: h } = await supabase
          .from('hosting')
          .select('id, provider, primary_domain')
          .eq('primary_domain', selectedDomain)
          .limit(1)
          .maybeSingle()
        if (h) {
          detected = {
            type: 'shared',
            id: h.id as string,
            label: `${h.provider} – ${h.primary_domain || '-'}`,
          }
        }
      }

      // 3. Cek domain_hosting
      if (!detected) {
        const domRow = domainOptions.find((d) => d.name === selectedDomain)
        if (domRow) {
          const { data: dh } = await supabase
            .from('domain_hosting')
            .select('hosting_id')
            .eq('domain_id', domRow.id)
            .limit(1)
            .maybeSingle()
          if (dh?.hosting_id) {
            const { data: h2 } = await supabase
              .from('hosting')
              .select('id, provider, primary_domain')
              .eq('id', dh.hosting_id as string)
              .maybeSingle()
            if (h2) {
              detected = {
                type: 'shared',
                id: h2.id as string,
                label: `${h2.provider} – ${h2.primary_domain || '-'}`,
              }
            }
          }
        }
      }

      // Prefill jika ditemukan
      if (detected) {
        await loadProviders(detected.type)
        form.setValue('providerType', detected.type)
        form.setValue('providerId', detected.id)
        setAutoProviderLabel(detected.label)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomain, domainOptions])

  async function onSubmit(values: WebsiteFormValues) {
    const insertData: any = {
      domain: values.domain,
      cms: values.cms || null,
      ip_address: values.ip_address || null,
      admin_username: values.admin_username || null,
      admin_password: values.admin_password || null,
      status: 'active', // default status even though not displayed
    }
    const pId = values.providerId && values.providerId.trim() !== '' ? values.providerId : null

    if (values.providerType === 'shared') {
      insertData.hosting_id = pId
      insertData.vps_id = null
    } else if (values.providerType === 'vps') {
      insertData.vps_id = pId
      insertData.hosting_id = null
    } else {
      insertData.hosting_id = null
      insertData.vps_id = null
    }

    // get current user id
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User tidak terautentikasi')

    if (initialData) {
      const { error } = await supabase
        .from('websites')
        .update(insertData)
        .eq('id', initialData.id)
        .eq('created_by', user.id) // pastikan pemilik sama (sesuai kebijakan RLS)
      if (error) throw error
    } else {
      insertData.created_by = user.id
      const { error } = await supabase.from('websites').insert([insertData])
      if (error) throw error
    }

    router.refresh()
    router.push('/dashboard/websites')
  }

  // Use provided onCancel handler or default to navigating back to the websites dashboard
  const handleCancel = onCancel ?? (() => router.push('/dashboard/websites'))

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Domain */}
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih domain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {domainOptions.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CMS */}
        <FormField
          control={form.control}
          name="cms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CMS (jika ada)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="WordPress, Drupal, dst." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Provider type */}
        <FormField
          control={form.control}
          name="providerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Provider</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val)
                  loadProviders(val as 'shared' | 'vps')
                  // reset providerId whenever type changes
                  form.setValue('providerId', '')
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="shared">Shared Hosting</SelectItem>
                  <SelectItem value="vps">VPS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Provider list */}
        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.watch('providerType') === 'vps' ? 'Pilih VPS' : 'Pilih Hosting'}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loadingProviders || providerOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProviders ? 'Memuat...' : 'Pilih provider'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providerOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IP Address hanya untuk VPS */}
        {form.watch('providerType') === 'vps' && (
          <FormField
            control={form.control}
            name="ip_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP Address (opsional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123.123.123.123" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Admin Username */}
        <FormField
          control={form.control}
          name="admin_username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="admin" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admin Password */}
        <FormField
          control={form.control}
          name="admin_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="••••••" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">
            {initialData ? 'Perbarui Website' : 'Tambah Website'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Batal
          </Button>
        </div>

        {providerAuto && (
          <p className="text-sm text-muted-foreground italic">
            Provider terdeteksi otomatis: {autoProviderLabel}
          </p>
        )}
      </form>
    </Form>
  )
} 