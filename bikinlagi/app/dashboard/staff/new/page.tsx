"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffForm } from "../components/staff-form";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function NewStaffPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(form: any) {
    setLoading(true);
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      const { error } = await supabase.from("staff").insert({
        id: userId,
        email: form.email,
        name: form.name,
        role: form.role,
      });
      if (error) throw error;
      toast({ title: "Berhasil", description: "Staff berhasil ditambahkan" });
      router.push("/dashboard/staff");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal menambah staff", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/dashboard/staff");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Staff Baru</h1>
        <p className="text-gray-600">Tambahkan pengguna baru ke sistem</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Staff</CardTitle>
          <CardDescription>Masukkan detail staff</CardDescription>
        </CardHeader>
        <CardContent>
          <StaffForm loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
} 