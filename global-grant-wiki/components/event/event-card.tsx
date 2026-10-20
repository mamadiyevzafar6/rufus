'use client';

/**
 * EventCard — карточка возможности в ленте.
 *
 * UX-спецификация из ТЗ:
 *  • glassmorphism-поверхность + .card-glow (hover: подъём на 4px + violet glow);
 *  • логотип, бейджи типа/финансирования, цветово-кодированные tags;
 *  • статус дедлайна с срочностью («Осталось 3 дня» — красный);
 *  • кнопка-ссылка «Подать заявку» (внешняя, rel=noopener);
 *  • клик по карточке открывает DetailsDialog (стоп-пропагация у внутренней ссылки).
 * Анимация появления — Framer Motion layout + whileInView (Phase 3 использует <AnimatePresence>).
 */

import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';
import { stripHtml } from '@/lib/deadline';
import type { Opportunity } from '@/types';
import { FundingBadge, TagChip, TypeBadge } from './badges';
import { DeadlineBadge } from './deadline-badge';
import { LogoAvatar } from './logo-avatar';

export interface EventCardProps {
  opportunity: Opportunity;
  /** открыть модалку деталей (передаётся из EventFeed) */
  onOpenDetails?: (o: Opportunity) => void;
  /** индекс для стаггер-анимации появления */
  index?: number;
}

const MAX_TAGS = 4;

export function EventCard({ opportunity: o, onOpenDetails, index = 0 }: EventCardProps) {
  const preview = stripHtml(o.description).slice(0, 140);
  const visibleTags = o.tags.slice(0, MAX_TAGS);
  const hiddenCount = o.tags.length - visibleTags.length;

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="card-glow group relative flex cursor-pointer flex-col rounded-xl border border-border bg-card/80 p-5 backdrop-blur-sm"
      onClick={() => onOpenDetails?.(o)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails?.(o);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${o.title} — подробнее`}
    >
      {/* Шапка: логотип + название/организатор + тип */}
      <header className="flex items-start gap-3">
        <LogoAvatar src={o.logo_url} name={o.organization} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
            {o.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{o.organization}</p>
        </div>
        <TypeBadge type={o.type} className="shrink-0" />
      </header>

      {/* Мета: локация + финансирование + дедлайн */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {o.location}
        </span>
        <FundingBadge funding={o.funding_type} />
        <DeadlineBadge deadline={o.deadline} withDate className="sm:ml-auto" />
      </div>

      {/* Превью описания */}
      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
        {preview}…
      </p>

      {/* Теги */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {visibleTags.map((t) => (
          <TagChip key={t} tag={t} />
        ))}
        {hiddenCount > 0 && (
          <span className="text-[11px] text-muted-foreground">+{hiddenCount}</span>
        )}
      </div>

      {/* Footer: CTA. stopPropagation — клик не должен открывать модалку */}
      <footer className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(o.created_at))}{' '}
          · добавлено
        </span>
        <Button
          size="sm"
          variant="default"
          asChild
          onClick={(e) => e.stopPropagation()}
          className="gap-1 transition-transform group-hover:translate-x-0.5"
        >
          <a
            href={o.application_link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={`Подать заявку: ${o.title}`}
          >
            Подать заявку
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </footer>
    </motion.article>
  );
}
