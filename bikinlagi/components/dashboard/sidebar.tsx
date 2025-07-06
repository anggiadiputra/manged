'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Globe, 
  Server, 
  HardDrive, 
  Layout, 
  Users, 
  LogOut,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Domain', href: '/dashboard/domains', icon: Globe },
    { name: 'Hosting', href: '/dashboard/hosting', icon: Server },
    { name: 'VPS', href: '/dashboard/vps', icon: HardDrive },
    { name: 'Website', href: '/dashboard/websites', icon: Layout },
  ]

  if (userRole === 'super_admin') {
    navigation.push({ name: 'Staff', href: '/dashboard/staff', icon: Users })
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal logout',
        variant: 'destructive',
      })
    } else {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-gray-900 text-gray-200 border-r border-gray-800">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Asset Manager</h2>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <Button 
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <nav className="flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full text-xs transition-colors",
                  pathname === item.href ? "text-blue-500" : "text-gray-400 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            )
          })}
           <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-full text-xs text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 mb-1" />
              <span>Logout</span>
            </button>
        </nav>
      </div>
    </>
  )
} 