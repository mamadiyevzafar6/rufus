/**
 * Global Grant Wiki — доменная модель и TypeScript-типы.
 *
 * Все типы зеркалят схему PostgreSQL (Supabase), см. supabase/migrations/0001_init.sql.
 * При переходе с моков на реальную БД контракт не меняется — только источник данных.
 */

/* ===================== Enums ===================== */

/** Тип возможности */
export const OPPORTUNITY_TYPES = [
  'Grant',
  'Internship',
  'Fellowship',
  'Hackathon',
  'Bootcamp',
  'Research',
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

/** Тип финансирования */
export const FUNDING_TYPES = [
  'Fully Funded',
  'Partially Funded',
  'Unpaid',
  'Paid',
] as const;
export type FundingType = (typeof FUNDING_TYPES)[number];

/** Статус публикации (CMS) */
export const STATUSES = ['Active', 'Draft', 'Archived'] as const;
export type OpportunityStatus = (typeof STATUSES)[number];

/** Сортировка ленты */
export const SORT_OPTIONS = ['deadline_soon', 'newest', 'alphabetical'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  deadline_soon: 'Ближайший дедлайн',
  newest: 'Недавно добавленные',
  alphabetical: 'По названию (А→Я)',
};

/* ===================== Core entity ===================== */

/**
 * Opportunity — единая сущность «возможности» (грант / стажировка / феллоушип / …).
 * Имена полей соответствуют колонкам таблицы `opportunities` (snake_case ↔ camelCase
 * конвертируется в lib/supabase.ts на границе слоя данных).
 */
export interface Opportunity {
  /** UUID, генерируется на стороне БД (gen_random_uuid()) */
  id: string;
  /** Название программы */
  title: string;
  /** Grant | Internship | Fellowship | Hackathon | Bootcamp | Research */
  type: OpportunityType;
  /** Организатор (DAAD, Google, OTAU…) */
  organization: string;
  /** Ссылка на логотип (CDN / Supabase Storage `logos` bucket) */
  logo_url: string;
  /** Страна/Город или "Remote" */
  location: string;
  /** Fully Funded | Partially Funded | Unpaid | Paid */
  funding_type: FundingType;
  /** ISO-8601 дата дедлайна подачи (для обратного отсчёта) */
  deadline: string;
  /** Метки предметных областей и аудитории: ["IT", "Economics", "High School"] */
  tags: string[];
  /** Rich Text (HTML-строка из WYSIWYG-редактора админки) */
  description: string;
  /** Внешняя ссылка на подачу заявки */
  application_link: string;
  /** Active | Draft | Archived */
  status: OpportunityStatus;
  /** Служебные поля (server-side) */
  created_at: string;
  updated_at: string;
}

/** Payload для создания (id/created_at/updated_at генерирует БД) */
export type OpportunityInsert = Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>;

/** Payload для частичного обновления (PATCH / статус-транзишены) */
export type OpportunityUpdate = Partial<OpportunityInsert>;

/* ===================== Filters & Search ===================== */

export interface FilterState {
  /** Живой поисковый запрос (title / organization / tags / description) */
  query: string;
  types: OpportunityType[];
  fundingTypes: FundingType[];
  /** Уникальные локации; пустой массив = «все» */
  locations: string[];
  /** Включать ли просроченные дедлайны (по умолчанию — нет) */
  showExpired: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  types: [],
  fundingTypes: [],
  locations: [],
  showExpired: false,
  sort: 'deadline_soon',
};

/* ===================== Derived / UI helpers ===================== */

/** Дедлайн-статус для цветовой индикации в карточке */
export type DeadlineUrgency = 'expired' | 'critical' | 'warning' | 'normal';

export interface DeadlineInfo {
  urgency: DeadlineUrgency;
  daysLeft: number;
  /** Готовая строка для UI: «Осталось 3 дня», «Просрочено», «Сегодня» */
  label: string;
}

/** Цветовые токены для бейджей типов (Tailwind classes) */
export const TYPE_BADGE_STYLES: Record<OpportunityType, string> = {
  Grant: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  Internship: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
  Fellowship: 'bg-violet-500/15 text-violet-400 ring-violet-500/30',
  Hackathon: 'bg-orange-500/15 text-orange-400 ring-orange-500/30',
  Bootcamp: 'bg-pink-500/15 text-pink-400 ring-pink-500/30',
  Research: 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/30',
};

/** Короткие русские подписи типов для UI */
export const TYPE_LABELS_RU: Record<OpportunityType, string> = {
  Grant: 'Грант',
  Internship: 'Стажировка',
  Fellowship: 'Феллоушип',
  Hackathon: 'Хакатон',
  Bootcamp: 'Буткемп',
  Research: 'Ресёрч',
};

export const FUNDING_BADGE_STYLES: Record<FundingType, string> = {
  'Fully Funded': 'bg-green-500/15 text-green-400 ring-green-500/30',
  'Partially Funded': 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  Unpaid: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
  Paid: 'bg-blue-500/15 text-blue-400 ring-blue-500/30',
};

export const STATUS_BADGE_STYLES: Record<OpportunityStatus, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  Draft: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  Archived: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
};

/* ===================== Analytics (Admin Dashboard) ===================== */

export interface DashboardStats {
  total: number;
  active: number;
  drafts: number;
  archived: number;
  /** Активные программы с дедлайном в ближайшие 7 дней */
  expiringThisWeek: number;
  byType: Record<OpportunityType, number>;
}
