'use client'

import { useFormStatus } from 'react-dom'
import { saveDomain, type WhoisData } from '@/app/dashboard/domains/actions'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
      {pending ? 'Saving...' : 'Save Domain'}
    </button>
  )
}

function InfoRow({ label, value }: { label: string, value?: string | null }) {
  if (!value) return null
  return (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  )
}


export function ConfirmDomainForm({ whoisData }: { whoisData: WhoisData }) {

  return (
    <form action={saveDomain} className="space-y-8">
      {/* Bagian Menampilkan Data WHOIS */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Domain Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">WHOIS data fetched successfully. Please review and add optional details.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <InfoRow label="Domain Name" value={whoisData['Domain Name']} />
            <InfoRow label="Registrar" value={whoisData['Registrar Name']} />
            <InfoRow label="Registration Date" value={whoisData['Created On']} />
            <InfoRow label="Expiration Date" value={whoisData['Expiration Date']} />
            <InfoRow label="Nameservers" value={`${whoisData['Nameserver 1']}, ${whoisData['Nameserver 2']}`} />
          </dl>
        </div>
      </div>
      
      {/* Input data tersembunyi untuk dikirim ke action */}
      <input type="hidden" name="name" value={whoisData['Domain Name']} />
      <input type="hidden" name="registrar" value={whoisData['Registrar Name']} />
      <input type="hidden" name="registration_date" value={whoisData['Created On']} />
      <input type="hidden" name="expiration_date" value={whoisData['Expiration Date']} />

      {/* Bagian Input Opsional */}
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Optional Information</h3>
         <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Renewal Cost (USD)</label>
              <input type="number" step="0.01" name="cost" id="cost" placeholder="10.99" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea id="notes" name="notes" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Any important notes..."></textarea>
            </div>

            <div className="sm:col-span-6">
              <div className="relative flex items-start">
                <div className="flex h-5 items-center">
                  <input id="auto_renew" name="auto_renew" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="auto_renew" className="font-medium text-gray-700">Auto Renew</label>
                </div>
              </div>
            </div>
         </div>
      </div>


      <div className="flex justify-end gap-4">
        <Link href="/dashboard/domains/new">
          <button type="button" className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            Back
          </button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
} 