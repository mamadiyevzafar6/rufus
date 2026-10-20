import type { DeadlineInfo, DeadlineUrgency, Opportunity } from '@/types';

/* ===================== Deadline helpers ===================== */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Целое число дней до дедлайна (отрицательное = просрочено) */
export function daysUntil(deadlineIso: string, now: Date = new Date()): number {
  const deadline = new Date(deadlineIso);
  // Нормализуем к началу дня, чтобы «осталось N дней» не скакало в течение суток
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDeadline = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
  ).getTime();
  return Math.round((startOfDeadline - startOfToday) / MS_PER_DAY);
}

function pluralDays(n: number): string {
  // Простая русская плюрализация: 1 день / 2-4 дня / 5+ дней
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дня`;
  return `${n} дней`;
}

/** Дедлайн-инфо для карточки: срочность + готовая строка «Осталось 3 дня» */
export function getDeadlineInfo(deadlineIso: string, now: Date = new Date()): DeadlineInfo {
  const daysLeft = daysUntil(deadlineIso, now);

  let urgency: DeadlineUrgency;
  if (daysLeft < 0) urgency = 'expired';
  else if (daysLeft <= 7) urgency = 'critical';
  else if (daysLeft <= 21) urgency = 'warning';
  else urgency = 'normal';

  let label: string;
  if (daysLeft < 0) label = 'Просрочено';
  else if (daysLeft === 0) label = 'Дедлайн сегодня';
  else if (daysLeft === 1) label = 'Последний день!';
  else label = `Осталось ${pluralDays(daysLeft)}`;

  return { urgency, daysLeft, label };
}

export const DEADLINE_TEXT_STYLES: Record<DeadlineUrgency, string> = {
  expired: 'text-slate-500 line-through decoration-slate-400/50',
  critical: 'text-red-500 font-semibold animate-pulse-glow',
  warning: 'text-amber-500 font-medium',
  normal: 'text-muted-foreground',
};

/* ===================== Formatting ===================== */

export function formatDateRu(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/* ===================== Search & filtering (client-side, mock layer) ===================== */

/**
 * «Живой» поиск: title + organization + tags + description.
 * Регистронезависимый, поддерживает запрос из нескольких слов (AND).
 * Для Supabase-бэкенда эквивалент — trigram-индекс pg_trgm + ILIKE (см. миграцию).
 */
export function matchesQuery(o: Opportunity, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [o.title, o.organization, o.location, ...o.tags, stripHtml(o.description)]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ');
}

/** Полная цепочка: фильтры → сортировка. Чистая функция — легко тестировать. */
export function applyFilters(
  items: Opportunity[],
  f: Pick<import('@/types').FilterState, 'query' | 'types' | 'fundingTypes' | 'locations' | 'showExpired' | 'sort'>,
  now: Date = new Date(),
): Opportunity[] {
  const filtered = items.filter((o) => {
    if (o.status !== 'Active') return false; // лента показывает только Active
    if (!matchesQuery(o, f.query)) return false;
    if (f.types.length && !f.types.includes(o.type)) return false;
    if (f.fundingTypes.length && !f.fundingTypes.includes(o.funding_type)) return false;
    if (f.locations.length && !f.locations.includes(o.location)) return false;
    if (!f.showExpired && daysUntil(o.deadline, now) < 0) return false;
    return true;
  });

  switch (f.sort) {
    case 'deadline_soon':
      return filtered.sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
    case 'newest':
      return filtered.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    case 'alphabetical':
      return filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }
}

/** Уникальные локации из набора данных — для чекбоксов фильтра */
export function uniqueLocations(items: Opportunity[]): string[] {
  return [...new Set(items.map((o) => o.location))].sort((a, b) => a.localeCompare(b, 'ru'));
}
