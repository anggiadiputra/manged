import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Server, HardDrive, Layout, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { SummaryCard } from '@/components/dashboard/summary-card'
import { DomainStatusBlock } from '@/components/dashboard/domain-status-block'

interface ExpiringAsset {
  asset_type: string
  id: string
  asset_name: string
  expiry_date: string
  days_until_expiry: number
}

interface RecentActivity {
  id: string
  action: string
  entity_type: string
  created_at: string
  staff?: {
    name: string
  }
}

async function getDashboardStats(client: any) {
  const { data: totalDomains, error: domainError } = await client.rpc('total_domains_active')
  
  if (domainError) {
    console.error('Error fetching total domains:', domainError)
  }

  const { count: totalHosting } = await client
    .from('hosting')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  const { count: totalVps } = await client
    .from('vps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  const { count: totalWebsites } = await client
    .from('websites')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return {
    total_domains: Number(totalDomains) || 0,
    total_hosting: totalHosting || 0,
    total_vps: totalVps || 0,
    total_websites: totalWebsites || 0,
  }
}

async function getExpiringAssets(client: any) {
  const { data } = await client
    .from('expiring_assets')
    .select('*')
    .order('days_until_expiry', { ascending: true })
    .limit(10)
  return data || []
}

async function getRecentActivities(client: any) {
  const { data } = await client
    .from('activity_logs')
    .select('*, staff(name)')
    .order('created_at', { ascending: false })
    .limit(10)
  return data || []
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const stats = await getDashboardStats(supabase)
  const expiringAssets = await getExpiringAssets(supabase)
  const recentActivities = await getRecentActivities(supabase)

  // Fetch domain status counts (active, grace, expired)
  const { data: domainCounts } = await supabase.rpc('domain_status_counts')

  const statusCounts = domainCounts as { active: number; grace: number; expired: number } | null

  const statCards = [
    {
      title: 'Total Domain',
      value: stats?.total_domains || 0,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Hosting',
      value: stats?.total_hosting || 0,
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total VPS',
      value: stats?.total_vps || 0,
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Website',
      value: stats?.total_websites || 0,
      icon: Layout,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Selamat datang, {user.name}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <SummaryCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      {/* Domain Status Section */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Status</CardTitle>
          <CardDescription>Ringkasan status domain</CardDescription>
        </CardHeader>
        <CardContent>
          {statusCounts ? (
            <DomainStatusBlock category="Semua Domain" counts={statusCounts} />
          ) : (
            <p className="text-sm text-gray-500">Data tidak tersedia</p>
          )}
        </CardContent>
      </Card>

      {/* Expiring Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Aset yang Akan Kedaluwarsa
          </CardTitle>
          <CardDescription>
            Aset yang akan kedaluwarsa dalam 30 hari ke depan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiringAssets && expiringAssets.length > 0 ? (
            <div className="space-y-2">
              {expiringAssets.map((asset: ExpiringAsset) => (
                <div 
                  key={`${asset.asset_type}-${asset.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{asset.asset_name}</p>
                    <p className="text-sm text-gray-600">
                      {asset.asset_type === 'domain' && 'Domain'}
                      {asset.asset_type === 'hosting' && 'Hosting'}
                      {asset.asset_type === 'vps' && 'VPS'}
                      {asset.asset_type === 'website' && 'Website'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={asset.days_until_expiry <= 7 ? 'destructive' : 'default'}
                    >
                      {asset.days_until_expiry} hari lagi
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(asset.expiry_date), 'dd MMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Tidak ada aset yang akan kedaluwarsa dalam 30 hari ke depan
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            10 aktivitas terakhir dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-2">
              {recentActivities.map((activity: RecentActivity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.staff?.name}</span>
                      {' '}
                      {activity.action}
                      {' '}
                      <span className="font-medium">{activity.entity_type}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Belum ada aktivitas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 