'use client';

/**
 * SortSelect —Radix Select над SORT_OPTIONS из types (без магических строк).
 */

import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useFilterStore } from '@/lib/store';
import { SORT_LABELS, SORT_OPTIONS, type SortOption } from '@/types';

export function SortSelect({ className }: { className?: string }) {
  const sort = useFilterStore((s) => s.sort);
  const setSort = useFilterStore((s) => s.setSort);

  return (
    <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
      <SelectTrigger aria-label="Сортировка" className={className ?? 'w-[220px] bg-background/50'}>
        <span className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {SORT_LABELS[opt]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
