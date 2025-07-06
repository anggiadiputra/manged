"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WebsiteForm } from "../components/website-form";
import { useRouter } from "next/navigation";

export default function NewWebsitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleCancel() {
    router.push("/dashboard/websites");
  }

  // WebsiteForm handles submission internally to Supabase, so just render.
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Website Baru</h1>
        <p className="text-gray-600">Tambahkan website baru ke sistem</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Website</CardTitle>
          <CardDescription>Masukkan detail website</CardDescription>
        </CardHeader>
        <CardContent>
          <WebsiteForm onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
} 