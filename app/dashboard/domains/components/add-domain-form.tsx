'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createDomain, type State } from '@/app/dashboard/domains/actions'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save Domain'}
    </button>
  )
}

export function AddDomainForm() {
  const initialState: State = { message: null, errors: {} }
  const [state, dispatch] = useFormState(createDomain, initialState)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Domain</h2>
        
        <form action={dispatch} className="space-y-6">
          {/* Domain Name Input */}
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
              Domain Name
            </label>
            <input
              type="text"
              name="domain"
              id="domain"
              placeholder="example.com"
              required
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {state.errors?.domain && (
              <p className="mt-2 text-sm text-red-600">{state.errors.domain.join(', ')}</p>
            )}
          </div>

          {/* Renewal Cost Input */}
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Biaya Perpanjangan (USD)
            </label>
            <input
              type="number"
              step="0.01"
              name="cost"
              id="cost"
              placeholder="10.99"
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">Optional: Enter the renewal cost for this domain</p>
          </div>

          {/* Notes Input */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Catatan
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              placeholder="Any important notes about this domain..."
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">Optional: Add any notes or comments</p>
          </div>

          {/* Error/Success Message */}
          {state.message && (
            <div className={`rounded-md p-4 ${state.message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
              <p className="text-sm">{state.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/domains">
              <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium">
                Cancel
              </button>
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
} 