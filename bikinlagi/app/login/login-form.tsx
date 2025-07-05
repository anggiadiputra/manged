'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const isLoading = form.formState.isSubmitting

  // Handler logic extracted for reuse (manual submit & auto-login)
  const handleLogin = useCallback(async (data: LoginFormValues) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast({
            title: 'Login Gagal',
            description: 'Email atau password salah',
            variant: 'destructive',
          })
        } else if (error.message === 'Email not confirmed') {
          toast({
            title: 'Email belum terverifikasi',
            description: 'Silakan cek inbox Anda untuk tautan verifikasi.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          })
        }
        return
      }

      if (authData.user) {
        // Verify user exists in staff table. If not found by id, try by email then sync the id.
        let { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (staffError || !staffData) {
          // Try find by email instead (legacy data where id != auth uid)
          const { data: staffByEmail } = await supabase
            .from('staff')
            .select('*')
            .eq('email', authData.user.email)
            .single()

          if (staffByEmail) {
            // Attempt to update the staff record to use auth uid as id
            await supabase
              .from('staff')
              .update({ id: authData.user.id })
              .eq('email', authData.user.email)
            staffData = { ...staffByEmail, id: authData.user.id }
          } else {
            toast({
              title: 'Login Gagal',
              description: 'Akun Anda tidak terdaftar sebagai staf. Silakan hubungi admin.',
              variant: 'destructive',
            })
            // Log the user out to prevent being stuck in a redirect loop
            await supabase.auth.signOut()
            return
          }
        }

        toast({
          title: 'Berhasil',
          description: 'Login berhasil!',
        })
        
        // Get the redirect URL from the query parameters, default to /dashboard
        const redirectTo = searchParams.get('redirect') || '/dashboard'
        router.push(redirectTo)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        variant: 'destructive',
      })
    }
  }, [searchParams, router, toast, supabase])

  const onSubmit = form.handleSubmit(handleLogin)

  // Auto-login when email & password query parameters are supplied
  const attemptedAutoLogin = useRef(false)

  useEffect(() => {
    if (attemptedAutoLogin.current) return

    // Disable query-parameter auto login in production for security
    if (process.env.NODE_ENV === 'production') return

    const email = searchParams.get('email')
    const password = searchParams.get('password')

    if (email && password) {
      attemptedAutoLogin.current = true
      // set form values then trigger submit programmatically
      form.setValue('email', email)
      form.setValue('password', password)
      handleLogin({
        email,
        password,
      })
    }
  }, [searchParams, form, handleLogin])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="nama@perusahaan.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sedang masuk...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
} 