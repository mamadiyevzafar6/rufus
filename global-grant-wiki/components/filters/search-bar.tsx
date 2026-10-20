'use client';

/**
 * SearchBar — «умная» строка поиска.
 *
 *  • Debounce 300ms живёт в Zustand-store (lib/store.ts) — здесь только inputValue;
 *  • ⌘K / Ctrl+K — фокус, Esc — сброс и blur;
 *  • Живые подсказки top-5 по title/organization (с подсветкой совпадения);
 *  • Состояние загрузки (пока debounce не истёк) — спиннер справа;
 *  • Glassmorphism-стиль, крупная hero-вариация.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { matchesQuery } from '@/lib/deadline';
import { useFilterStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Opportunity } from '@/types';

/* Подсветка совпадений: разбиваем текст по регэкспу запроса (escape спецсимволов) */
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => {
    const q = query.trim();
    if (!q) return [text];
    return text.split(new RegExp(`(${escapeRe(q)})`, 'gi'));
  }, [text, query]);

  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="rounded-sm bg-primary/20 px-0.5 text-primary">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export interface SearchBarProps {
  /** источник для подсказок (отфильтрованная или полная лента) */
  suggestions?: Opportunity[];
  onSelectSuggestion?: (o: Opportunity) => void;
  size?: 'md' | 'lg';
  placeholder?: string;
  className?: string;
  autoFocusHotkey?: boolean;
}

export function SearchBar({
  suggestions = [],
  onSelectSuggestion,
  size = 'lg',
  placeholder = 'Гранты, стажировки, хакатоны… Введите название, организацию или тег',
  className,
  autoFocusHotkey = true,
}: SearchBarProps) {
  const inputValue = useFilterStore((s) => s.inputValue);
  const query = useFilterStore((s) => s.query);
  const setInputValue = useFilterStore((s) => s.setInputValue);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  /* Глобальный хоткей ⌘K / Ctrl+K */
  useEffect(() => {
    if (!autoFocusHotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [autoFocusHotkey]);

  const isPending = inputValue !== query; /* debounce ещё идёт */

  const liveSuggestions = useMemo(() => {
    const q = inputValue.trim();
    if (!q || !suggestions.length) return [];
    return suggestions.filter((o) => matchesQuery(o, q)).slice(0, 5);
  }, [inputValue, suggestions]);

  const commit = useCallback(
    (o: Opportunity) => {
      setInputValue(o.title);
      setFocused(false);
      inputRef.current?.blur();
      onSelectSuggestion?.(o);
    },
    [setInputValue, onSelectSuggestion],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (inputValue) setInputValue('');
      else resetFilters();
      inputRef.current?.blur();
      setFocused(false);
    }
    if (!liveSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, liveSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      commit(liveSuggestions[activeIdx]!);
    }
  };

  const showPanel = focused && liveSuggestions.length > 0;

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'glass flex items-center gap-2 rounded-2xl transition-shadow focus-within:ring-2 focus-within:ring-primary/60',
          size === 'lg' ? 'h-14 px-4' : 'h-10 px-3',
        )}
      >
        <Search className={cn('shrink-0 text-muted-foreground', size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setActiveIdx(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)} /* даём клику по подсказке сработать */
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          placeholder={placeholder}
          className="h-full flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 md:text-base"
        />
        {/* Статус-индикатор: спиннер (debounce) или хоткей */}
        {isPending ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-label="Поиск…" />
        ) : inputValue ? (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              inputRef.current?.focus();
            }}
            aria-label="Очистить поиск"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 select-none items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Панель подсказок */}
      <AnimatePresence>
        {showPanel && (
          <motion.ul
            id="search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="glass absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl p-1"
          >
            {liveSuggestions.map((o, i) => (
              <li key={o.id} role="option" aria-selected={i === activeIdx}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => commit(o)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    i === activeIdx ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      <Highlight text={o.title} query={inputValue} />
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      <Highlight text={o.organization} query={inputValue} /> · {o.location}
                    </span>
                  </span>
                  <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
