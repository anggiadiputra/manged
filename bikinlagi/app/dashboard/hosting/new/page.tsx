"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HostingForm } from '../components/hosting-form';

export default function NewHostingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Hosting Baru</h1>
        <p className="text-gray-600">Tambahkan hosting baru ke sistem</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Hosting</CardTitle>
          <CardDescription>
            Masukkan detail hosting. Domain terkait dapat dipilih setelah fitur multi-select tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostingForm onSubmit={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
} 