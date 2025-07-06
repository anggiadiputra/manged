import { Badge } from "@/components/ui/badge";

interface StatusCounts {
  active: number;
  grace: number;
  expired: number;
}

interface DomainStatusBlockProps {
  category: string;
  counts: StatusCounts;
}

export function DomainStatusBlock({ category, counts }: DomainStatusBlockProps) {
  return (
    <div className="bg-blue-50/50 rounded-lg p-4">
      <h3 className="font-medium mb-2">{category}</h3>
      <div className="grid grid-cols-3 divide-x divide-blue-100 text-center">
        <div>
          <p className="text-2xl font-bold">{counts.active}</p>
          <p className="text-sm text-gray-600">Aktif</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{counts.grace}</p>
          <p className="text-sm text-gray-600">Masa Tenggang</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{counts.expired}</p>
          <p className="text-sm text-gray-600">Kedaluwarsa</p>
        </div>
      </div>
    </div>
  );
} 