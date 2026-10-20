'use client';

/**
 * Бейджи карточки — единая система цветовой кодировки (см. types/index.ts).
 * Клик по tag-бейджу добавляет тег в поисковый запрос (UX: «найди похожее»).
 */

import { Badge } from '@/components/ui';
import { useFilterStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  FUNDING_BADGE_STYLES,
  TYPE_BADGE_STYLES,
  TYPE_LABELS_RU,
  type FundingType,
  type OpportunityType,
} from '@/types';

export function TypeBadge({ type, className }: { type: OpportunityType; className?: string }) {
  return (
    <Badge className={cn('backdrop-blur-sm', TYPE_BADGE_STYLES[type], className)}>
      {TYPE_LABELS_RU[type]}
    </Badge>
  );
}

export function FundingBadge({ funding, className }: { funding: FundingType; className?: string }) {
  return <Badge className={cn(FUNDING_BADGE_STYLES[funding], className)}>{funding}</Badge>;
}

const TAG_PALETTE = [
  'bg-indigo-500/10 text-indigo-400 ring-indigo-500/25',
  'bg-teal-500/10 text-teal-400 ring-teal-500/25',
  'bg-fuchsia-500/10 text-fuchsia-400 ring-fuchsia-500/25',
  'bg-lime-500/10 text-lime-500 ring-lime-500/25',
  'bg-rose-500/10 text-rose-400 ring-rose-500/25',
  'bg-amber-500/10 text-amber-400 ring-amber-500/25',
];

/** Стабильный «цвет тега» — один тег всегда одного цвета (по hash строки) */
function tagColor(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_PALETTE[h % TAG_PALETTE.length];
}

export function TagChip({ tag, maxLen = 18 }: { tag: string; maxLen?: number }) {
  const setInputValue = useFilterStore((s) => s.setInputValue);
  const label = tag.length > maxLen ? tag.slice(0, maxLen - 1) + '…' : tag;

  return (
    <button
      type="button"
      aria-label={`Искать по тегу ${tag}`}
      /* останавливаем клик, чтобы не открыть модалку карточки */
      onClick={(e) => {
        e.stopPropagation();
        setInputValue(tag);
      }}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-colors hover:ring-2 focus-visible:outline-none focus-visible:ring-2',
        tagColor(tag),
      )}
    >
      #{label}
    </button>
  );
}
