"use client";

import { Bell, Plus } from "lucide-react";

export function RightSidebar() {
  // Placeholder: later will fetch reminders & events
  return (
    <aside className="hidden xl:flex flex-col w-80 border-l bg-gray-50 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Pengingat</h2>
        <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* List placeholder */}
      <div className="flex-1 px-6 py-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Bell className="w-4 h-4 text-gray-400" />
          Belum ada pengingat
        </div>
      </div>

      {/* Calendar placeholder */}
      <div className="border-t px-6 py-4 text-sm text-gray-500">
        (Kalender akan ditambahkan)
      </div>
    </aside>
  );
} 