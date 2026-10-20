'use client';

/**
 * FilterSidebar — мульти-фильтрация чекбоксами (тип / финансирование / локация)
 * + тумблер «показывать просроченные».
 *
 *  • Desktop: sticky-колонка слева (lg+);
 *  • Mobile: Sheet-выдвижка через Radix Dialog (glass), кнопка-триггер с бейджем N;
 *  • Чекбоксы доступны с клавиатуры (Radix), счётчики опций помогают выбору;
 *  • Состояние живёт в Zustand — сайдбар и лента всегда синхронны.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, RotateCcw } from 'lucide-react';
import { Button, Checkbox, Dialog, DialogContent, DialogTitle, DialogTrigger, Label, Separator, Switch } from '@/components/ui';
import { useFilterStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  FUNDING_TYPES,
  OPPORTUNITY_TYPES,
  TYPE_LABELS_RU,
  type FundingType,
  type OpportunityType,
} from '@/types';

/* ===================== Отдельная группа чекбоксов ===================== */

function CheckRow({
  id,
  label,
  count,
  checked,
  onToggle,
}: {
  id: string;
  label: React.ReactNode;
  count?: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <Label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 font-normal text-sm text-foreground/90 peer-disabled:opacity-50">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onToggle}
          aria-pressed={checked}
        />
        {label}
      </Label>
      {count !== undefined && (
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>;
}

/* ===================== Ядро сайдбара (используется и на десктопе, и в sheet) ===================== */

export function FilterControls({ locations, locationCounts, typeCounts, fundingCounts }: {
  locations: string[];
  locationCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  fundingCounts: Record<string, number>;
}) {
  const types = useFilterStore((s) => s.types);
  const fundingTypes = useFilterStore((s) => s.fundingTypes);
  const selLocations = useFilterStore((s) => s.locations);
  const showExpired = useFilterStore((s) => s.showExpired);
  const toggleType = useFilterStore((s) => s.toggleType);
  const toggleFundingType = useFilterStore((s) => s.toggleFundingType);
  const toggleLocation = useFilterStore((s) => s.toggleLocation);
  const setShowExpired = useFilterStore((s) => s.setShowExpired);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const activeCount = useFilterStore((s) => s.activeFilterCount());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <GroupTitle>Фильтры</GroupTitle>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Сбросить ({activeCount})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Тип */}
      <section aria-labelledby="filter-type">
        <GroupTitle>Формат программы</GroupTitle>
        {OPPORTUNITY_TYPES.map((t: OpportunityType) => (
          <CheckRow
            key={t}
            id={`type-${t}`}
            label={TYPE_LABELS_RU[t]}
            count={typeCounts[t] ?? 0}
            checked={types.includes(t)}
            onToggle={() => toggleType(t)}
          />
        ))}
      </section>

      <Separator />

      {/* Финансирование */}
      <section aria-labelledby="filter-funding">
        <GroupTitle>Финансирование</GroupTitle>
        {FUNDING_TYPES.map((f: FundingType) => (
          <CheckRow
            key={f}
            id={`funding-${f.replace(/\s/g, '-')}`}
            label={f}
            count={fundingCounts[f] ?? 0}
            checked={fundingTypes.includes(f)}
            onToggle={() => toggleFundingType(f)}
          />
        ))}
      </section>

      <Separator />

      {/* Локация */}
      <section aria-labelledby="filter-location">
        <GroupTitle>Локация</GroupTitle>
        <div className="max-h-56 space-y-0 overflow-y-auto pr-1">
          {locations.map((l) => (
            <CheckRow
              key={l}
              id={`loc-${l.replace(/\s/g, '-')}`}
              label={l}
              count={locationCounts[l] ?? 0}
              checked={selLocations.includes(l)}
              onToggle={() => toggleLocation(l)}
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* Просроченные */}
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-expired" className="cursor-pointer text-sm font-normal text-muted-foreground">
          Показывать просроченные
        </Label>
        <Switch id="show-expired" checked={showExpired} onCheckedChange={(v) => setShowExpired(v)} />
      </div>
    </div>
  );
}

/* ===================== Desktop sidebar ===================== */

export function FilterSidebar(props: React.ComponentProps<typeof FilterControls>) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block" aria-label="Фильтры программ">
      <div className="glass sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl p-4">
        <FilterControls {...props} />
      </div>
    </aside>
  );
}

/* ===================== Mobile sheet (через Radix Dialog) ===================== */

export function FilterSheet(props: React.ComponentProps<typeof FilterControls>) {
  const [open, setOpen] = useState(false);
  const activeCount = useFilterStore((s) => s.activeFilterCount());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2 bg-background/50 backdrop-blur-sm">
          <Filter className="h-4 w-4" />
          Фильтры
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn('absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground')}
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-0 right-0 top-auto bottom-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl sm:hidden">
        <DialogTitle className="sr-only">Фильтры</DialogTitle>
        <div className="max-h-[70vh] overflow-y-auto pt-2">
          <FilterControls {...props} />
        </div>
        <Button className="w-full" onClick={() => setOpen(false)}>
          Показать результаты
        </Button>
      </DialogContent>
    </Dialog>
  );
}
