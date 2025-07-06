'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function BackupButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || 'Gagal membuat backup')
      }

      const data = await response.json()
      
      // Handle both success and informational messages
      if (data.success === false && data.isVercel) {
        // This is an informational message about Vercel limitations
        toast({
          title: 'Informasi',
          description: data.message,
        })
      } else if (data.success === true) {
        // This is a successful backup
        toast({
          title: 'Berhasil',
          description: `Backup berhasil dibuat di: ${data.filePath}`,
        })
      } else {
        // This is some other message
        toast({
          title: 'Pesan',
          description: data.message || 'Status backup tidak diketahui',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleBackup} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Membuat Backup...
        </>
      ) : (
        'Buat Backup Sekarang'
      )}
    </Button>
  )
} 