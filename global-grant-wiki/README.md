# Global Grant Wiki 🌍

Агрегатор грантов, стажировок, феллоушипов, хакатонов, research-программ и буткемпов для молодёжи и студентов.

**Стек:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui + Radix UI · Framer Motion · Zustand · Supabase (PostgreSQL).

## Запуск

```bash
cp .env.example .env.local   # опционально: без env приложение работает на моках
npm install
npm run dev                  # http://localhost:3000
```

## Архитектура данных (mock → Supabase без правок UI)

```
UI-компоненты ──► lib/data.ts (контракт CRUD) ──► mock+localStorage (сейчас)
                                        └──────► lib/supabase.ts (прод) ◄── Playwright-парсеры пишут в opportunities
```

- Схема БД и RLS-политики: `supabase/migrations/0001_init.sql` (pg_trgm-индексы для мгновенного поиска).
- Типы домена: `types/index.ts`; типы БД: `types/database.ts`.

## Roadmap (фазы генерации)

| Фаза | Содержание | Статус |
|------|-----------|--------|
| **1** | Setup, конфиги, типы, mock data, SQL-миграция, корневой layout | ✅ |
| **2** | UI-компоненты: EventCard, SearchBar, FilterSidebar, Navbar, Skeletons | ⏳ |
| **3** | Главная страница: Hero, живой поиск (debounce 300ms), Zustand-фильтры, Framer Motion | ⏳ |
| **4** | Admin Panel: auth, CMS-таблица, WYSIWYG-форма, статус-транзишены, дашборд | ⏳ |
