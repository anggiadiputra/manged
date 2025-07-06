import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpiryStatus(expiryDate: string | Date | null): { label: string | null; className: string } {
  if (!expiryDate) {
    return { label: null, className: '' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  
  const diffTime = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return { label: "Expired", className: "text-red-600 font-bold" };
  }
  if (daysLeft <= 7) {
    return { label: `${daysLeft} hari lagi`, className: "text-orange-500 font-semibold" };
  }
  if (daysLeft <= 30) {
    return { label: `${daysLeft} hari lagi`, className: "text-yellow-600" };
  }

  return { label: null, className: '' };
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
} 