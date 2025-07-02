export default function DashboardStats() {
  // TODO: Fetch real data from Supabase once tables are created
  const stats = [
    { name: 'Total Domains', value: '0', color: 'blue' },
    { name: 'Total Hosting', value: '0', color: 'green' },
    { name: 'Total VPS', value: '0', color: 'purple' },
    { name: 'Expiring Soon', value: '0', color: 'red' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md bg-${stat.color}-100 flex items-center justify-center`}>
                  <div className={`w-4 h-4 bg-${stat.color}-500 rounded-full`}></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 