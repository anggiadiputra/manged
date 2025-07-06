// Server component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string; // text color
  bgColor?: string; // background icon wrapper
  delta?: number; // percent change, can be positive/negative
}

export function SummaryCard({ title, value, icon: Icon, color = "text-blue-600", bgColor = "bg-blue-100", delta }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta !== undefined && (
          <p className={cn("text-xs", delta >= 0 ? "text-green-600" : "text-red-600")}>{delta >= 0 ? `▲ ${delta}%` : `▼ ${Math.abs(delta)}%`}</p>
        )}
      </CardContent>
    </Card>
  );
} 