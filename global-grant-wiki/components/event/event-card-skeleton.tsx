'use client';

/**
 * Скелетон карточки — точно повторяет геометрию EventCard,
 * чтобы лента не «прыгала» при замене на реальные данные (CLS ≈ 0).
 */

import { Skeleton } from '@/components/ui';

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5" aria-hidden>
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="ml-auto h-3 w-28" />
      </div>

      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  );
}

/** Скелетоны hero-счётчика и панели фильтров */
export function CounterSkeleton() {
  return <Skeleton className="h-12 w-24" />;
}

export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((g) => (
        <div key={g} className="space-y-3">
          <Skeleton className="h-4 w-24" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
