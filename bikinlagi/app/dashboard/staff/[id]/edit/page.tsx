"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffForm } from "../../components/staff-form";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function EditStaffPage() {
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const staffId = params?.id as string;

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("staff").select("*").eq("id", staffId).single();
      if (data) {
        setDefaultValues({
          name: data.name,
          email: data.email,
          role: data.role,
        });
      }
    }
    if (staffId) fetchData();
  }, [staffId]);

  async function handleSubmit(form: any) {
    setLoading(true);
    try {
      const { error } = await supabase.from("staff").update({
        name: form.name,
        role: form.role,
      }).eq("id", staffId);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Staff berhasil diperbarui" });
      router.push("/dashboard/staff");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal update staff", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/dashboard/staff");
  }

  if (!defaultValues) return <div className="max-w-xl mx-auto py-12 text-center text-gray-500">Memuat data staff...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Staff</h1>
        <p className="text-gray-600">Perbarui data staff</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Staff</CardTitle>
          <CardDescription>Edit detail staff</CardDescription>
        </CardHeader>
        <CardContent>
          <StaffForm defaultValues={defaultValues} loading={loading} onSubmit={handleSubmit} onCancel={handleCancel} isEdit />
        </CardContent>
      </Card>
    </div>
  );
} 