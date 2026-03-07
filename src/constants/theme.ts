// ─────────────────────────────────────────────────────────────
// theme.ts  —  Saffron Design Tokens
// Directly ported from the HTML prototype's CSS variables
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Brand palette
  spice:     '#E8532A',
  turmeric:  '#F5A623',
  saffron:   '#FFD166',
  basil:     '#2D9E6B',

  // Backgrounds
  background: '#0A0A12',
  midnight:   '#0E0E16',
  surface:    '#171723',
  surface2:   '#1F1F2E',
  surface3:   '#272738',

  // Border
  border:     'rgba(255,255,255,0.07)',

  // Text
  text:       '#F5F0E8',
  textDim:    'rgba(245,240,232,0.5)',
  textMuted:  'rgba(245,240,232,0.28)',

  // Accents
  gold:    '#FFD166',
  teal:    '#4ECDC4',
  pink:    '#FF6B9D',
  purple:  '#A855F7',

  // Semantic helpers
  white:       '#FFFFFF',
  transparent: 'transparent',
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xxs:   10,
  xs:    11,
  sm:    12,
  md:    14,
  base:  16,
  lg:    18,
  xl:    20,
  xxl:   24,
  title: 28,
  hero:  32,
};

export const FontWeight = {
  regular: '400' as const,
  semiBold: '600' as const,
  bold:    '700' as const,
  extraBold:'800' as const,
  black:   '900' as const,
};

export const BorderRadius = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   18,
  xxl:  20,
  full: 999,
};

// Pill badge variants — mirrors .pill-spice, .pill-gold, etc.
export const PillVariants = {
  spice: {
    background: 'rgba(232,83,42,0.18)',
    color:      Colors.spice,
    border:     'rgba(232,83,42,0.3)',
  },
  gold: {
    background: 'rgba(255,209,102,0.15)',
    color:      Colors.gold,
    border:     'rgba(255,209,102,0.25)',
  },
  basil: {
    background: 'rgba(45,158,107,0.15)',
    color:      Colors.basil,
    border:     'rgba(45,158,107,0.3)',
  },
  teal: {
    background: 'rgba(78,205,196,0.15)',
    color:      Colors.teal,
    border:     'rgba(78,205,196,0.3)',
  },
} as const;

// Quest icon background variants
export const QuestVariants = {
  orange: { background: 'rgba(232,83,42,0.15)',  fill: Colors.spice },
  gold:   { background: 'rgba(255,209,102,0.12)', fill: Colors.gold  },
  green:  { background: 'rgba(45,158,107,0.15)',  fill: Colors.basil },
  teal:   { background: 'rgba(78,205,196,0.15)',  fill: Colors.teal  },
} as const;
