'use client';

/**
 * Логотип организатора: картинка с graceful fallback на инициалы
 * (моковые logo_url могут быть битыми / offline-демо без CDN).
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

function initials(name: string): string {
  return name
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function LogoAvatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const box = {
    sm: 'h-8 w-8 rounded-lg text-[10px]',
    md: 'h-11 w-11 rounded-xl text-xs',
    lg: 'h-14 w-14 rounded-2xl text-sm',
  }[size];

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={name}
        className={cn(
          'flex shrink-0 select-none items-center justify-center bg-gradient-to-br from-indigo-500/30 to-violet-500/30 font-display font-bold text-primary ring-1 ring-inset ring-border',
          box,
          className,
        )}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} — логотип`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        'shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-inset ring-border',
        box,
        className,
      )}
    />
  );
}
