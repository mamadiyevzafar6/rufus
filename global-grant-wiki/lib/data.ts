/**
 * Слой данных (Data Access Layer).
 *
 * Ключевое архитектурное решение для масштабируемости:
 * компоненты и стор знают ТОЛЬКО эти функции. Реализация сейчас — mock +
 * localStorage (persist CRUD-изменений админки между перезагрузками).
 *
 * Подключение Supabase = заменить тело функций на запросы supabase-js
 * (см. lib/supabase.ts и supabase/migrations/0001_init.sql), контракт не меняется.
 * Внешние парсеры (Playwright/Python) пишут напрямую в таблицу `opportunities` —
 * UI подхватит данные без единой правки.
 */

import { MOCK_OPPORTUNITIES } from '@/lib/mock-data';
import type {
  DashboardStats,
  Opportunity,
  OpportunityInsert,
  OpportunityStatus,
  OpportunityType,
  OpportunityUpdate,
} from '@/types';

const STORAGE_KEY = 'ggw.opportunities.v1';
/** Имитация сетевой задержки для демонстрации Skeleton Loaders */
const FAKE_LATENCY_MS = 700;

/* ===================== Storage adapter (mock persistence) ===================== */

function readStore(): Opportunity[] {
  if (typeof window === 'undefined') return MOCK_OPPORTUNITIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_OPPORTUNITIES));
      return MOCK_OPPORTUNITIES;
    }
    return JSON.parse(raw) as Opportunity[];
  } catch {
    return MOCK_OPPORTUNITIES;
  }
}

function writeStore(items: Opportunity[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const delay = (ms = FAKE_LATENCY_MS) => new Promise<void>((r) => setTimeout(r, ms));

function uuid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ===================== Public API (CRUD) ===================== */

/** Чтение всех возможностей (админка: все статусы; лента фильтрует Active сама) */
export async function getOpportunities(): Promise<Opportunity[]> {
  await delay();
  return readStore();
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  await delay(200);
  return readStore().find((o) => o.id === id) ?? null;
}

export async function createOpportunity(input: OpportunityInsert): Promise<Opportunity> {
  await delay(300);
  const now = new Date().toISOString();
  const item: Opportunity = { ...input, id: uuid(), created_at: now, updated_at: now };
  writeStore([item, ...readStore()]);
  return item;
}

export async function updateOpportunity(
  id: string,
  patch: OpportunityUpdate,
): Promise<Opportunity | null> {
  await delay(300);
  const items = readStore();
  const idx = items.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, updated_at: new Date().toISOString() };
  writeStore(items);
  return items[idx];
}

/** Быстрый транзишен статуса из таблицы админки: Active ⇄ Draft → Archived */
export async function setOpportunityStatus(
  id: string,
  status: OpportunityStatus,
): Promise<Opportunity | null> {
  return updateOpportunity(id, { status });
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  await delay(300);
  const items = readStore();
  const next = items.filter((o) => o.id !== id);
  writeStore(next);
  return next.length < items.length;
}

/* ===================== Analytics (Admin Dashboard) ===================== */

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(400);
  const items = readStore();
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const byType = Object.fromEntries(
    (['Grant', 'Internship', 'Fellowship', 'Hackathon', 'Bootcamp', 'Research'] as OpportunityType[]).map(
      (t) => [t, items.filter((o) => o.type === t && o.status === 'Active').length],
    ),
  ) as Record<OpportunityType, number>;

  return {
    total: items.length,
    active: items.filter((o) => o.status === 'Active').length,
    drafts: items.filter((o) => o.status === 'Draft').length,
    archived: items.filter((o) => o.status === 'Archived').length,
    expiringThisWeek: items.filter(
      (o) => o.status === 'Active' && new Date(o.deadline) >= now && new Date(o.deadline) <= weekAhead,
    ).length,
    byType,
  };
}

/** Сброс моков (кнопка «Reset demo data» в админке) */
export function resetMockData(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
}
