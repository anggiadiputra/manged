"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HostingForm } from '../../components/hosting-form';

export default function EditHostingPage() {
  // TODO: Ganti dengan fetch data hosting by id
  const defaultValues = {
    provider: 'Niagahoster',
    package: 'Personal',
    associatedDomains: ['contoh.com'],
    renewalDate: '2024-12-31',
    cost: '500000',
    note: 'Contoh catatan',
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Hosting</h1>
        <p className="text-gray-600">Perbarui data hosting</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Hosting</CardTitle>
          <CardDescription>
            Edit detail hosting. Domain terkait dapat dipilih setelah fitur multi-select tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostingForm defaultValues={defaultValues} onSubmit={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
} 