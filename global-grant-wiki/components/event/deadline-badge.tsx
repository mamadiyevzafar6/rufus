'use client';

/**
 * Индикатор дедлайна: иконка часов + «Осталось 3 дня» с цветовой срочностью.
 * expired/critical → красный, warning → янтарный, normal → приглушённый.
 */

import { CalendarDays, Clock } from 'lucide-react';
import { DEADLINE_TEXT_STYLES, formatDateRu, getDeadlineInfo } from '@/lib/deadline';
import { cn } from '@/lib/utils';

export function DeadlineBadge({
  deadline,
  withDate = false,
  className,
}: {
  deadline: string;
  /** показывать и точную дату («12 ноября 2026») рядом с обратным отсчётом */
  withDate?: boolean;
  className?: string;
}) {
  const info = getDeadlineInfo(deadline);

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs tabular-nums', DEADLINE_TEXT_STYLES[info.urgency], className)}>
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{info.label}</span>
      {withDate && (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span aria-hidden>·</span>
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          {formatDateRu(deadline)}
        </span>
      )}
    </span>
  );
}
