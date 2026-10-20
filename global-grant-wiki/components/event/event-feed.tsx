'use client';

/**
 * EventFeed — сетка карточек с Framer Motion layout-анимацией и AnimatePresence
 * (карточки плавно перестраиваются при фильтрации, fade-out при удалении).
 * Empty state — стилизованная заглушка со сбросом фильтров.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui';
import { useFilterStore } from '@/lib/store';
import type { Opportunity } from '@/types';
import { EventCard } from './event-card';
import { EventCardSkeleton } from './event-card-skeleton';

export function EventFeed({
  items,
  loading,
  skeletonCount = 6,
  onOpenDetails,
}: {
  items: Opportunity[];
  loading?: boolean;
  skeletonCount?: number;
  onOpenDetails?: (o: Opportunity) => void;
}) {
  const resetFilters = useFilterStore((s) => s.resetFilters);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Загрузка программ">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass flex flex-col items-center justify-center gap-3 rounded-xl py-16 text-center"
      >
        <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden />
        <p className="font-display text-lg font-semibold">Ничего не найдено</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Попробуйте изменить запрос или сбросить фильтры — возможно, подходящая программа появится завтра.
        </p>
        <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
          Сбросить фильтры
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {items.map((o, i) => (
          <EventCard key={o.id} opportunity={o} index={i} onOpenDetails={onOpenDetails} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
