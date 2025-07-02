'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { fetchDomainWhois, getDomainDetails, updateDomainWhois } from '../actions'

// Definisikan tipe untuk objek domain berdasarkan schema.sql
type Domain = {
  id: string
  name: string
  renewal_price: number
  note: string | null
  registrar: string | null
  registration_date: string | null
  expiration_date: string | null
  nameservers: string[] | null
  domain_id_external: string | null
  last_update_date: string | null
  domain_status: string
  dnssec_status: string
  hosting_info: string
  whois_data?: any
  created_at: string
  updated_at: string
}

type WhoisData = {
  'Domain ID'?: string
  'Domain Name'?: string
  'Created On'?: string
  'Last Update On'?: string
  'Expiration Date'?: string
  'Status'?: string
  'Nameserver 1'?: string
  'Nameserver 2'?: string
  'Nameserver 3'?: string
  'Nameserver 4'?: string
  'Registrar Name'?: string
  'DNSSEC'?: string
  [key: string]: any
}

export function DomainsTable({ domains }: { domains: Domain[] }) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null)
  const [domainDetails, setDomainDetails] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDomainClick = async (domain: Domain) => {
    setSelectedDomain(domain.name)
    setLoading(true)
    setError(null)
    setWhoisData(null)
    setDomainDetails(domain)

    try {
      // Jika data WHOIS tersedia di database, gunakan itu
      if (domain.whois_data) {
        setWhoisData(domain.whois_data)
        setLoading(false)
        return
      }

      // Jika tidak ada data WHOIS, ambil dari API
      const result = await fetchDomainWhois(domain.name)
      
      if (result.success) {
        setWhoisData(result.data)
      } else {
        setError(result.error || 'Failed to fetch WHOIS data')
      }
    } catch (err) {
      setError('An error occurred while fetching domain data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshWhois = async (domain: Domain) => {
    const result = await updateDomainWhois(domain.name)
    if (result.success) {
      // Refresh data WHOIS di modal jika sedang terbuka
      if (selectedDomain === domain.name) {
        setWhoisData(result.data)
      }
      // Refresh halaman untuk memperbarui tabel
      window.location.reload()
    } else {
      alert('Failed to update WHOIS data: ' + result.error + '. Please check server console for details.')
    }
  }

  const closeModal = () => {
    setSelectedDomain(null)
    setWhoisData(null)
    setDomainDetails(null)
    setError(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrar</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domains.length > 0 ? (
              domains.map((domain) => (
                <tr key={domain.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDomainClick(domain)}
                      className="text-indigo-600 hover:text-indigo-900 hover:underline cursor-pointer"
                    >
                      {domain.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.registrar || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {domain.expiration_date ? format(new Date(domain.expiration_date), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(domain.domain_status)}`}>
                      {domain.domain_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {domain.renewal_price ? `$${domain.renewal_price}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button
                      onClick={() => handleRefreshWhois(domain)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Refresh WHOIS data"
                    >
                      <svg className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No domains found. <a href="/dashboard/domains/new" className="text-indigo-600 hover:underline">Add the first one!</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedDomain && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Domain Information
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Loading domain data...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {whoisData && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {/* Domain ID */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Domain ID:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Domain ID'] || 'N/A'}</div>
                    </div>

                    {/* Domain Name */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Domain Name:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Domain Name'] || 'N/A'}</div>
                    </div>

                    {/* Created On */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Created On:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Created On'] ? whoisData['Created On'].split(' ')[0] : 'N/A'}</div>
                    </div>

                    {/* Last Update On */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Last Update On:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Last Update On'] ? whoisData['Last Update On'].split(' ')[0] : 'N/A'}</div>
                    </div>

                    {/* Expiration Date */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Expiration Date:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Expiration Date'] ? whoisData['Expiration Date'].split(' ')[0] : 'N/A'}</div>
                    </div>

                    {/* Status */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Status:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Status'] || 'N/A'}</div>
                    </div>

                    {/* Nameservers */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Nameserver 1:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Nameserver 1'] || 'N/A'}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Nameserver 2:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Nameserver 2'] || 'N/A'}</div>
                    </div>

                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Nameserver 3:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Nameserver 3'] || 'N/A'}</div>
                    </div>

                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Nameserver 4:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Nameserver 4'] || 'N/A'}</div>
                    </div>

                    {/* Registrar Name */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Registrar Name:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['Registrar Name'] || 'N/A'}</div>
                    </div>

                    {/* DNSSEC */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">DNSSEC:</div>
                      <div className="flex-1 text-sm text-gray-900">{whoisData['DNSSEC'] || 'N/A'}</div>
                    </div>

                    {/* Hosting/VPS Info */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Hosting/VPS Info:</div>
                      <div className="flex-1 text-sm text-blue-600 underline">Hosting: Warnahost (Medium Cloud)</div>
                    </div>

                    {/* Nameservers summary */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Nameservers:</div>
                      <div className="flex-1 text-sm text-gray-900">
                        {[whoisData['Nameserver 1'], whoisData['Nameserver 2'], whoisData['Nameserver 3'], whoisData['Nameserver 4']]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </div>
                    </div>

                    {/* Note from database */}
                    <div className="flex">
                      <div className="w-32 text-sm font-medium text-gray-700">Note:</div>
                      <div className="flex-1 text-sm text-gray-900">{domainDetails?.note || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 