// Each cuisine's colour and its hand-drawn icon (same line style as the mascot).
// Unknown cuisines fall back to the mascot, so new content never breaks the UI.
import type { CSSProperties, ReactNode } from 'react';
import { Mascot } from './Mascot';

interface CuisineTheme {
  color: string; // confetti colour: rings, dots, progress
  tint: string; // soft background
  art: ReactNode; // 64x64 drawing
}

const THEMES: Record<string, CuisineTheme> = {
  // Mt Fuji
  japan: {
    color: 'var(--pink)',
    tint: '#ffe3ef',
    art: (
      <>
        <path d="M4 50h56" />
        <path d="M8 50 26 20q6-6 12 0l18 30z" fill="#ffb8d6" />
        <path d="M21 28l5-8q6-6 12 0l5 8-5 4-5-4-6 4z" fill="#fff" />
        <circle cx="50" cy="14" r="6" fill="var(--tomato)" stroke="none" />
      </>
    ),
  },
  // Lotus
  india: {
    color: 'var(--gold)',
    tint: '#fff0cc',
    art: (
      <>
        <path d="M8 52q24 6 48 0" />
        <path d="M32 12c8 10 8 24 0 34-8-10-8-24 0-34z" fill="#ffb8d6" />
        <path d="M32 46c-10 0-20-7-22-18 10 0 18 6 22 18zM32 46c10 0 20-7 22-18-10 0-18 6-22 18z" fill="var(--pink)" />
        <path d="M32 46c-8 2-18 0-24-6M32 46c8 2 18 0 24-6" />
      </>
    ),
  },
  // Nopal cactus with tuna fruit
  mexico: {
    color: 'var(--green)',
    tint: '#d7f2e3',
    art: (
      <>
        <path d="M14 52h36" />
        <ellipse cx="32" cy="38" rx="10" ry="13" fill="#7fd4a8" />
        <ellipse cx="20" cy="22" rx="7" ry="9" transform="rotate(-25 20 22)" fill="#7fd4a8" />
        <ellipse cx="44" cy="20" rx="7" ry="9" transform="rotate(20 44 20)" fill="#7fd4a8" />
        <circle cx="18" cy="11" r="3.5" fill="var(--pink)" />
        <circle cx="47" cy="9" r="3.5" fill="var(--pink)" />
        <path d="M28 32h.1M36 40h.1M29 44h.1M19 20h.1M44 18h.1" strokeWidth="4" />
      </>
    ),
  },
  // Tagine
  morocco: {
    color: 'var(--tomato)',
    tint: '#ffe0d8',
    art: (
      <>
        <path d="M8 46q24 10 48 0l-4-5H12z" fill="var(--gold)" />
        <path d="M15 41c6-8 11-18 14-28h6c3 10 8 20 14 28z" fill="#f7876f" />
        <circle cx="32" cy="10" r="3.5" fill="var(--gold)" />
        <path d="M20 33h24M24 25h16" />
      </>
    ),
  },
  // Elephant
  thailand: {
    color: 'var(--blue)',
    tint: '#ddf0fb',
    art: (
      <>
        <path d="M6 52h52" />
        <path d="M12 44V34c0-10 9-15 18-14 8-5 20-2 22 8 2 5 1 9-2 12 3 4 4 8 1 11" fill="#a9d8f2" />
        <path d="M38 24c-6 1-8 8-4 12 3 3 8 2 9-1" fill="#7cc2ea" />
        <path d="M16 44v8M24 44v8M36 44v8M44 44v8" />
        <circle cx="46" cy="29" r="1.6" fill="var(--ink)" stroke="none" />
      </>
    ),
  },
};

const FALLBACK: Omit<CuisineTheme, 'art'> = { color: 'var(--tomato)', tint: 'var(--sun-soft)' };

export function cuisineTheme(cuisineId: string): Omit<CuisineTheme, 'art'> {
  const t = THEMES[cuisineId];
  return t ? { color: t.color, tint: t.tint } : FALLBACK;
}

/** CSS variables for a cuisine: --cu (colour) and --cu-tint */
export function cuisineVars(cuisineId: string): CSSProperties {
  const t = cuisineTheme(cuisineId);
  return { '--cu': t.color, '--cu-tint': t.tint } as CSSProperties;
}

export function CuisineArt({ cuisineId, size = 48, className }: { cuisineId: string; size?: number; className?: string }) {
  const theme = THEMES[cuisineId];
  if (!theme) return <Mascot size={size} className={className} />;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="var(--ink)"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {theme.art}
    </svg>
  );
}
