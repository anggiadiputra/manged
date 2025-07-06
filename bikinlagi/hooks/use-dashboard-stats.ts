"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface DashboardStats {
  total_domains: number;
  total_hosting: number;
  total_vps: number;
  total_websites: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from("dashboard_stats").select("*").single();
      setStats(data as DashboardStats | null);
      setLoading(false);
    }
    fetchStats();
  }, [supabase]);

  return { stats, loading };
} 