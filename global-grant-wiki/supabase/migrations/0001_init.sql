-- =====================================================================
-- Global Grant Wiki — начальная схема PostgreSQL (Supabase)
-- 0001_init.sql
-- =====================================================================

create extension if not exists pg_trgm;      -- «живой» поиск по title/organization
create extension if not exists "uuid-ossp";  -- не обязателен, gen_random_uuid() есть в core

-- ===================== Enums =====================

create type opportunity_type as enum
  ('Grant', 'Internship', 'Fellowship', 'Hackathon', 'Bootcamp', 'Research');

create type funding_type as enum
  ('Fully Funded', 'Partially Funded', 'Unpaid', 'Paid');

create type opportunity_status as enum
  ('Active', 'Draft', 'Archived');

-- ===================== Core table =====================

create table if not exists public.opportunities (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 3 and 200),
  type             opportunity_type   not null,
  organization     text               not null,
  logo_url         text               not null default '',
  location         text               not null,               -- "Remote" или "Country, City"
  funding_type     funding_type       not null,
  deadline         timestamptz        not null,               -- точная дата для обратного отсчёта
  tags             text[]             not null default '{}',  -- IT, Economics, Ecology, High School…
  description      text               not null default '',    -- Rich Text (HTML из WYSIWYG)
  application_link text               not null,
  status           opportunity_status not null default 'Draft',
  created_at       timestamptz        not null default now(),
  updated_at       timestamptz        not null default now()
);

-- ===================== Indexes (мгновенный поиск) =====================

-- Trigram-индексы для ILIKE '%query%' без SeqScan
create index opportunities_title_trgm_idx  on public.opportunities using gin (title gin_trgm_ops);
create index opportunities_org_trgm_idx    on public.opportunities using gin (organization gin_trgm_ops);
-- Лента: Active + сортировка по дедлайну за один Index Scan
create index opportunities_active_deadline_idx
  on public.opportunities (status, deadline)
  where status = 'Active';
-- Полнотекстовый поиск по описанию
create index opportunities_description_fts_idx
  on public.opportunities using gin (to_tsvector('simple', description));
-- GIN на теги: фильтрация tags @> ARRAY['IT']
create index opportunities_tags_idx on public.opportunities using gin (tags);

-- ===================== auto-update updated_at =====================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

-- ===================== Row Level Security =====================

alter table public.opportunities enable row level security;

-- Анонимные пользователи видят только Active — лента безопасна даже без бэкенда
create policy "public_can_read_active"
  on public.opportunities for select
  to anon, authenticated
  using (status = 'Active');

-- Полный доступ (все статусы, CRUD) — только для service_role (админ API, парсеры).
-- В прод-версии здесь появится политика через auth.jwt() ->> 'role' = 'admin'.
create policy "service_role_full_access"
  on public.opportunities for all
  to service_role
  using (true) with check (true);

-- ===================== Storage =====================
-- Bucket `logos` для загрузки логотипов из админки создаётся так:
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true);
