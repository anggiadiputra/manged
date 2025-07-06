"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["super_admin", "admin_web", "finance"], {
    errorMap: () => ({ message: "Role harus dipilih" }),
  }),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

type FormData = z.infer<typeof formSchema>;

export function StaffForm({
  defaultValues,
  loading,
  onSubmit,
  onCancel,
  isEdit = false,
}: {
  defaultValues?: Partial<FormData>;
  loading?: boolean;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama</Label>
        <Input id="name" {...register("name") } disabled={loading} />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email") } disabled={loading || isEdit} />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label>Role</Label>
        <Select
          onValueChange={(val) => setValue("role", val as any, { shouldValidate: true })}
          defaultValue={watch("role")}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin_web">Admin Web</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
      </div>
      {!isEdit && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password") } disabled={loading} />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>
      )}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
          ) : (
            "Simpan"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
} 