'use client';

/**
 * /components-showcase — внутренняя страница-стенд Phase 2.
 * Позволяет визуально проверить каждый UI-компонент изолированно,
 * пока главная страница собирается в Phase 3. Не индексируется (noindex).
 */

import { useMemo, useState } from 'react';
import { TooltipProvider } from '@/components/ui';
import { EventCard } from '@/components/event/event-card';
import { EventCardSkeleton, FilterSidebarSkeleton } from '@/components/event/event-card-skeleton';
import { EventDetailsDialog } from '@/components/event/event-details-dialog';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterSheet, FilterSidebar } from '@/components/filters/filter-sidebar';
import { SortSelect } from '@/components/filters/sort-select';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { uniqueLocations } from '@/lib/deadline';
import { MOCK_OPPORTUNITIES } from '@/lib/mock-data';
import type { Opportunity } from '@/types';

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ComponentsShowcasePage() {
  const [selected, setSelected] = useState<Opportunity | null>(null);

  /* Счётчики опций для фильтров — как это будет делать хук useOpportunities в Phase 3 */
  const counts = useMemo(() => {
    const active = MOCK_OPPORTUNITIES.filter((o) => o.status === 'Active');
    const typeCounts: Record<string, number> = {};
    const fundingCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    for (const o of active) {
      typeCounts[o.type] = (typeCounts[o.type] ?? 0) + 1;
      fundingCounts[o.funding_type] = (fundingCounts[o.funding_type] ?? 0) + 1;
      locationCounts[o.location] = (locationCounts[o.location] ?? 0) + 1;
    }
    return { typeCounts, fundingCounts, locationCounts };
  }, []);

  const filterProps = {
    locations: uniqueLocations(MOCK_OPPORTUNITIES.filter((o) => o.status === 'Active')),
    locationCounts: counts.locationCounts,
    typeCounts: counts.typeCounts,
    fundingCounts: counts.fundingCounts,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-5xl space-y-14">
        <header>
          <h1 className="text-gradient font-display text-3xl font-bold">Phase 2 · Component Showcase</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Стенд переиспользуемых компонентов. Данные — моки из lib/mock-data.ts.
          </p>
        </header>

        <Section title="SearchBar" note="Debounce 300ms (Zustand), ⌘K — фокус, Esc — сброс, живые подсказки с подсветкой и навигацией стрелками.">
          <SearchBar suggestions={MOCK_OPPORTUNITIES.filter((o) => o.status === 'Active')} onSelectSuggestion={(o) => setSelected(o)} />
        </Section>

        <Section title="Sort select">
          <SortSelect />
        </Section>

        <Section title="EventCard + Skeletons" note="Hover: подъём + glow. Клик по карточке — glass-модалка деталей. Клик по #тегу — поиск по тегу.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MOCK_OPPORTUNITIES.slice(0, 3).map((o, i) => (
              <EventCard key={o.id} opportunity={o} index={i} onOpenDetails={setSelected} />
            ))}
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        </Section>

        <Section title="FilterSidebar (desktop sticky) + Skeleton">
          <div className="grid grid-cols-[1fr_16rem] items-start gap-6">
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Здесь лента (Phase 3). Справа — sticky glass-сайдбар.
            </div>
            <FilterSidebar {...filterProps} />
          </div>
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Скелетон сайдбара</summary>
            <div className="glass mt-2 w-64 rounded-xl p-4">
              <FilterSidebarSkeleton />
            </div>
          </details>
        </Section>

        <Section title="FilterSheet (mobile)">
          <FilterSheet {...filterProps} />
          <p className="text-xs text-muted-foreground">На десктопе тоже открывается — для проверки bottom-sheet-разметки.</p>
        </Section>

        <Section title="Theme toggle">
          <ThemeToggle />
        </Section>
      </div>

      {/* Модалка деталей (Rich Text описание) */}
      <EventDetailsDialog opportunity={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </TooltipProvider>
  );
}
