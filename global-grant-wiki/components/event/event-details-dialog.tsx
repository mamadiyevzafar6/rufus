'use client';

/**
 * DetailsDialog — glassmorphism-модалка с полной информацией о программе.
 * Description рендерится как Rich Text (HTML из WYSIWYG админки) со стилями .rich-text.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import { formatDateRu, getDeadlineInfo } from '@/lib/deadline';
import type { Opportunity } from '@/types';
import { DEADLINE_TEXT_STYLES } from '@/lib/deadline';
import { FundingBadge, TagChip, TypeBadge } from './badges';
import { LogoAvatar } from './logo-avatar';

export function EventDetailsDialog({
  opportunity: o,
  open,
  onOpenChange,
}: {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const deadlineInfo = useMemo(
    () => (o ? getDeadlineInfo(o.deadline) : null),
    [o],
  );

  if (!o || !deadlineInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <DialogHeader>
            <div className="flex items-start gap-4 pr-8">
              <LogoAvatar src={o.logo_url} name={o.organization} size="lg" />
              <div className="min-w-0">
                <DialogTitle className="font-display text-xl leading-tight">{o.title}</DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" aria-hidden />
                  {o.organization}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Бейджи + локация + дедлайн */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TypeBadge type={o.type} />
            <FundingBadge funding={o.funding_type} />
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground ring-1 ring-inset ring-border">
              <MapPin className="h-3 w-3" aria-hidden />
              {o.location}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${DEADLINE_TEXT_STYLES[deadlineInfo.urgency]}`}>
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {formatDateRu(o.deadline)} · {deadlineInfo.label}
            </span>
          </div>

          {/* Теги */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {o.tags.map((t) => (
              <TagChip key={t} tag={t} />
            ))}
          </div>

          {/* Rich Text описание */}
          <div
            className="rich-text mt-5 text-sm leading-relaxed text-card-foreground/90"
            /* Описание создаётся доверенными администраторами в WYSIWYG-редакторе.
               При переходе на Supabase добавить санитизацию (DOMPurify) на записи. */
            dangerouslySetInnerHTML={{ __html: o.description }}
          />

          {/* CTA */}
          <div className="sticky bottom-0 -mx-6 mt-6 border-t border-border/60 bg-card/70 px-6 py-4 backdrop-blur-lg">
            <Button size="lg" asChild className="w-full gap-2 sm:w-auto">
              <a href={o.application_link} target="_blank" rel="noopener noreferrer nofollow">
                Подать заявку
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground sm:justify-start">
              Заявка подаётся на официальном сайте организатора
              <ArrowRight className="h-3 w-3" aria-hidden />
              {new URL(o.application_link).hostname.replace(/^www\./, '')}
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
