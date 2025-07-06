'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center space-x-2">
      <Link
        href={createPageURL(1)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          currentPage === 1 && 'pointer-events-none opacity-50'
        )}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Link>
      <Link
        href={createPageURL(currentPage - 1)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          currentPage === 1 && 'pointer-events-none opacity-50'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      
      <span className="text-sm">
        Halaman {currentPage} dari {totalPages}
      </span>

      <Link
        href={createPageURL(currentPage + 1)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          currentPage === totalPages && 'pointer-events-none opacity-50'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
      <Link
        href={createPageURL(totalPages)}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          currentPage === totalPages && 'pointer-events-none opacity-50'
        )}
      >
        <ChevronsRight className="h-4 w-4" />
      </Link>
    </nav>
  );
} 