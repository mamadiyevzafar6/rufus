/**
 * Mock Data — 12 реалистичных программ для первоначального рендеринга.
 *
 * Архитектурное решение: UI зависит не от этого файла напрямую, а от слоя данных
 * `lib/data.ts` (getOpportunities()). В Phase 4/прод-деплое тот же контракт
 * выполняет Supabase-запрос; парсеры (Playwright/Airflow) пишут в ту же таблицу
 * `opportunities`, поэтому мок можно удалить без правок компонентов.
 *
 * Дедлайны заданы относительно «сегодня», чтобы демо обратных отсчётов
 * (красный «Осталось 3 дня» / «Просрочено») всегда выглядело живым.
 */

import type { Opportunity } from '@/types';

const NOW = new Date();

/** ISO-дата «сегодня + N дней» (12:00 UTC — время окончания приёма заявок) */
function d(offsetDays: number): string {
  const date = new Date(NOW.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

/** created_at «N дней назад» — для сортировки «Недавно добавленные» */
function ago(offsetDays: number): string {
  return d(-offsetDays);
}

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    title: 'DAAD Study Grants — Master Programs in Germany',
    type: 'Grant',
    organization: 'DAAD',
    logo_url: 'https://www.daad.de/img/favicon.ico',
    location: 'Germany',
    funding_type: 'Fully Funded',
    deadline: d(3), // critical: «Осталось 3 дня» — красный
    tags: ['Economics', 'Engineering', 'Master', 'Europe'],
    description:
      '<p>Полностью финансируемые магистерские гранты DAAD для студентов из Центральной Азии и Ближнего Востока.</p><ul><li>Стипендия <strong>934 €/мес</strong></li><li>Страховка и авиабилет</li></ul>',
    application_link: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    status: 'Active',
    created_at: ago(5),
    updated_at: ago(1),
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    title: 'Google Summer of Code 2027',
    type: 'Internship',
    organization: 'Google',
    logo_url: 'https://www.gstatic.com/g1/favicons_20x20_4.ico',
    location: 'Remote',
    funding_type: 'Paid',
    deadline: d(45),
    tags: ['IT', 'Open Source', 'University'],
    description:
      '<p>Глобальная программа оплачиваемых стажировок по открытому исходному коду. Работа над реальными проектами под менторством core-команд.</p>',
    application_link: 'https://summerofcode.withgoogle.com/',
    status: 'Active',
    created_at: ago(2),
    updated_at: ago(2),
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    title: 'Chevening Scholarships — UK Government Awards',
    type: 'Grant',
    organization: 'UK Government',
    logo_url: 'https://www.chevening.org/favicon.ico',
    location: 'United Kingdom',
    funding_type: 'Fully Funded',
    deadline: d(14), // warning: жёлтый
    tags: ['Master', 'Leadership', 'Policy', 'All Fields'],
    description:
      '<p>Магистерские scholarships для будущих лидеров: полное покрытие tuition, проживание и перелёт.</p>',
    application_link: 'https://www.chevening.org/apply/',
    status: 'Active',
    created_at: ago(10),
    updated_at: ago(3),
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    title: 'ETH Zurich Excellence Fellowship',
    type: 'Fellowship',
    organization: 'ETH Zürich',
    logo_url: 'https://ethz.ch/etc/designs/eth/main/favicon.ico',
    location: 'Switzerland',
    funding_type: 'Fully Funded',
    deadline: d(60),
    tags: ['Research', 'PhD', 'STEM', 'Europe'],
    description:
      '<p>Fellowship для поступления в докторантуру ETH: стипендия ~2 920 CHF/мес + исследовательский бюджет.</p>',
    application_link: 'https://ethz.ch/en/masters/excellence-fellowship.html',
    status: 'Active',
    created_at: ago(7),
    updated_at: ago(4),
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    title: 'NASA Hunch Hackathon',
    type: 'Hackathon',
    organization: 'NASA',
    logo_url: 'https://www.nasa.gov/wp-content/uploads/2023/10/nasa_hurtown_0.png',
    location: 'Remote',
    funding_type: 'Unpaid',
    deadline: d(1), // критический: «Последний день!»
    tags: ['IT', 'Space', 'Data Science', 'High School'],
    description:
      '<p>48-часовой международный хакатон с данными NASA. Команды 2–5 человек, менторы из JPL.</p>',
    application_link: 'https://www.spaceappschallenge.org/nasa-hUNCH/',
    status: 'Active',
    created_at: ago(1),
    updated_at: ago(1),
  },
  {
    id: 'a1b2c3d4-0006-4000-8000-000000000006',
    title: 'YSE Bootcamp: Social Entrepreneurship',
    type: 'Bootcamp',
    organization: 'Youth Social Enterprise',
    logo_url: 'https://youthsparkglobal.com/favicon.ico',
    location: 'Kazakhstan, Almaty',
    funding_type: 'Partially Funded',
    deadline: d(21),
    tags: ['Entrepreneurship', 'Business', 'High School', 'Central Asia'],
    description:
      '<p>Интенсив по социальному предпринимательству: питчи перед инвесторами, нетворк, сертификат.</p>',
    application_link: 'https://youcanmakeit.kz/',
    status: 'Active',
    created_at: ago(15),
    updated_at: ago(6),
  },
  {
    id: 'a1b2c3d4-0007-4000-8000-000000000007',
    title: 'CERN Summer Student Programme',
    type: 'Research',
    organization: 'CERN',
    logo_url: 'https://home.cern/sites/default/simpletest_files/cern_logo.png',
    location: 'Switzerland, Geneva',
    funding_type: 'Fully Funded',
    deadline: d(90),
    tags: ['Physics', 'Research', 'University', 'Europe'],
    description:
      '<p>8-недельная оплачиваемая летняя исследовательская программа в largest физлаборатории мира.</p>',
    application_link: 'https://careers.cern/all/students',
    status: 'Active',
    created_at: ago(20),
    updated_at: ago(8),
  },
  {
    id: 'a1b2c3d4-0008-4000-8000-000000000008',
    title: 'AI for Good Youth Tech Challenge',
    type: 'Hackathon',
    organization: 'ITU',
    logo_url: 'https://cdn.itu.int/favicon.ico',
    location: 'Switzerland, Geneva',
    funding_type: 'Partially Funded',
    deadline: d(30),
    tags: ['IT', 'AI', 'Sustainability', 'High School'],
    description:
      '<p>Командный челлендж для молодёжи 18–25: AI-решения для SDGs. Финал на саммите ITU.</p>',
    application_link: 'https://aiforgood.itu.int/youth-tech-challenge/',
    status: 'Active',
    created_at: ago(3),
    updated_at: ago(3),
  },
  {
    id: 'a1b2c3d4-0009-4000-8000-000000000009',
    title: 'Fulbright Foreign Student Program',
    type: 'Grant',
    organization: 'U.S. Department of State',
    logo_url: 'https://educationusa.state.gov/favicon.ico',
    location: 'United States',
    funding_type: 'Fully Funded',
    deadline: d(-5), // expired — демонстрирует состояние «Просрочено»
    tags: ['Master', 'All Fields', 'USA', 'Leadership'],
    description:
      '<p>Флагманская программа правительства США: магистратура с полным покрытием tuition и stipend.</p>',
    application_link: 'https://foreign.fulbrightonline.org/',
    status: 'Active',
    created_at: ago(40),
    updated_at: ago(12),
  },
  {
    id: 'a1b2c3d4-0010-4000-8000-000000000010',
    title: 'One Young World Summit Fellowship',
    type: 'Fellowship',
    organization: 'One Young World',
    logo_url: 'https://www.oyw.org/favicon.ico',
    location: 'Remote',
    funding_type: 'Partially Funded',
    deadline: d(12),
    tags: ['Leadership', 'Ecology', 'Policy', 'Scholarship'],
    description:
      '<p>Scholarship-феллоушипы на глобальный саммит молодых лидеров: покрытые delegate fees и тревел-гранты.</p>',
    application_link: 'https://www.oyw.org/scholarships/',
    status: 'Active',
    created_at: ago(9),
    updated_at: ago(5),
  },
  {
    id: 'a1b2c3d4-0011-4000-8000-000000000011',
    title: 'OTAU Research Internship — Green Energy Lab',
    type: 'Internship',
    organization: 'OTAU',
    logo_url: 'https://tau.kz/favicon.ico',
    location: 'Kazakhstan, Almaty',
    funding_type: 'Unpaid',
    deadline: d(7),
    tags: ['Ecology', 'Engineering', 'Research', 'Central Asia'],
    description:
      '<p>Летняя исследовательская стажировка в лаборатории зелёной энергии: солнечные панели и smart-grid.</p>',
    application_link: 'https://tau.edu.kz/research',
    status: 'Active',
    created_at: ago(4),
    updated_at: ago(2),
  },
  {
    id: 'a1b2c3d4-0012-4000-8000-000000000012',
    title: 'ML Bootcamp by DeepLearning.AI',
    type: 'Bootcamp',
    organization: 'DeepLearning.AI',
    logo_url: 'https://www.deeplearning.ai/favicon.ico',
    location: 'Remote',
    funding_type: 'Paid',
    deadline: d(120),
    tags: ['IT', 'AI', 'Machine Learning', 'University'],
    description:
      '<p>Интенсивный онлайн-буткемп по ML: 6 недель, пет-проекты, сертификаты, карьерный трек.</p>',
    application_link: 'https://www.deeplearning.ai/short-courses/',
    status: 'Draft', // не виден в ленте — демонстрация CMS-статусов
    created_at: ago(1),
    updated_at: ago(1),
  },
];
