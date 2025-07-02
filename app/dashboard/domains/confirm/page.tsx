import { Suspense } from 'react'
import { ConfirmDomainForm } from '../components/confirm-domain-form'
import { redirect } from 'next/navigation'
import type { WhoisData } from '../actions'

function PageContent({ data }: { data: string }) {
  let whoisData: WhoisData;
  try {
    whoisData = JSON.parse(data);
  } catch (error) {
    // Jika data tidak valid, kembalikan ke halaman awal
    redirect('/dashboard/domains/new?error=Invalid+data+received.');
  }

  return <ConfirmDomainForm whoisData={whoisData} />;
}

export default function ConfirmDomainPage({
  searchParams,
}: {
  searchParams?: {
    data?: string;
  };
}) {
  const { data } = searchParams || {};

  if (!data) {
    redirect('/dashboard/domains/new');
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold text-gray-900">Confirm and Save Domain</h1>
            </div>
        </header>
        <main>
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <PageContent data={data} />
                </Suspense>
            </div>
        </main>
    </div>
  )
} 