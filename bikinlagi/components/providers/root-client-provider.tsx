"use client";

import SupabaseProvider from "@/components/providers/supabase-provider";
import { Toaster } from "@/components/ui/toaster";

export default function RootClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      {children}
      <Toaster />
    </SupabaseProvider>
  );
} 