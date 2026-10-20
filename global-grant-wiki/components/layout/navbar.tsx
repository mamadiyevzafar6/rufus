'use client';

/**
 * Navbar — glassmorphism-навигация, sticky, с тенью при скролле.
 * Лого + ссылки (Возможности / О проекте / Админка) + ThemeToggle + CTA.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

const NAV_LINKS = [
  { href: '/', label: 'Возможности' },
  { href: '/#how', label: 'Как это работает' },
  { href: '/admin', label: 'Админка', icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  /* Тень появляется после 8px скролла — лёгкий сигнал «стек зафиксирован» */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'glass-nav fixed inset-x-0 top-0 z-40 transition-shadow',
        scrolled && 'shadow-lg shadow-black/10',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Логотип */}
        <Link href="/" className="group flex items-center gap-2" aria-label="Global Grant Wiki — на главную">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Globe2 className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            Global Grant <span className="text-primary">Wiki</span>
          </span>
        </Link>

        {/* Навигация */}
        <nav aria-label="Основная навигация" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-md bg-accent"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="default" className="hidden gap-1.5 sm:inline-flex">
            <Link href="/#feed">
              <Sparkles className="h-3.5 w-3.5" />
              Найти программу
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
