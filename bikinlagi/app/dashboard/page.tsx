import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Server, HardDrive, Layout, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

async function getDashboardStats() {
  const supabase = await createClient()
  
  const { data: stats } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single()

  const { data: expiringAssets } = await supabase
    .from('expiring_assets')
    .select('*')
    .order('days_until_expiry', { ascending: true })
    .limit(10)

  const { data: recentActivities } = await supabase
    .from('activity_logs')
    .select('*, staff(name)')
    .order('created_at', { ascending: false })
    .limit(10)

  return { stats, expiringAssets, recentActivities }
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const { stats, expiringAssets, recentActivities } = await getDashboardStats()

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
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
              {expiringAssets.map((asset: any) => (
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
              {recentActivities.map((activity: any) => (
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