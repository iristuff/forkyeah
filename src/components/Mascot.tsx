// The Fork Yeah mascot: a three-tine fork cheering "hooray".
// `party` adds the confetti burst used for celebrations and the app icon.
import { useId } from 'react';

const FORK_BODY =
  'M214 196 L226 196 A12 12 0 0 0 250 196 L262 196 A12 12 0 0 0 286 196 L298 196 L298 208 C298 240 268 258 263 292 L268 432 A12 12 0 0 1 244 432 L249 292 C244 258 214 240 214 208 Z';
const TINES_X = [214, 250, 286];

const CONFETTI: { x: number; y: number; kind: 'pill' | 'dot' | 'wave' | 'tri'; r: number; color: string }[] = [
  { x: 96, y: 190, kind: 'pill', r: 20, color: 'var(--tomato)' },
  { x: 420, y: 200, kind: 'dot', r: -25, color: 'var(--blue)' },
  { x: 130, y: 300, kind: 'wave', r: 30, color: 'var(--green)' },
  { x: 392, y: 312, kind: 'tri', r: 10, color: 'var(--pink)' },
  { x: 186, y: 70, kind: 'dot', r: 40, color: 'var(--tomato)' },
  { x: 330, y: 62, kind: 'wave', r: -15, color: 'var(--blue)' },
  { x: 80, y: 250, kind: 'tri', r: -30, color: 'var(--green)' },
  { x: 440, y: 140, kind: 'pill', r: 15, color: 'var(--pink)' },
  { x: 356, y: 380, kind: 'pill', r: -40, color: 'var(--tomato)' },
  { x: 150, y: 390, kind: 'dot', r: 35, color: 'var(--blue)' },
  { x: 240, y: 48, kind: 'tri', r: 0, color: 'var(--green)' },
  { x: 300, y: 460, kind: 'wave', r: 20, color: 'var(--pink)' },
];

interface Props {
  size?: number;
  party?: boolean;
  /** Draw sparks at the hands (the favicon pose) */
  sparks?: boolean;
  className?: string;
  title?: string;
  /** The launch splash's mascot lands here (see splash.ts) */
  splashTarget?: boolean;
}

export function Mascot({ size = 48, party = false, sparks = !party, className, title, splashTarget }: Props) {
  const id = useId();
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="40 40 432 432"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? id : undefined}
      data-splash-target={splashTarget || undefined}
    >
      {title && <title id={id}>{title}</title>}
      {party &&
        CONFETTI.map((c, i) => {
          const t = `rotate(${c.r} ${c.x} ${c.y})`;
          if (c.kind === 'pill') return <rect key={i} x={c.x - 12} y={c.y - 5} width="24" height="10" rx="5" fill={c.color} transform={t} />;
          if (c.kind === 'dot') return <circle key={i} cx={c.x} cy={c.y} r="8" fill={c.color} />;
          if (c.kind === 'wave')
            return <path key={i} d={`M${c.x - 14} ${c.y} q7 -10 14 0 t14 0`} fill="none" stroke={c.color} strokeWidth="6" strokeLinecap="round" transform={t} />;
          return <path key={i} d={`M${c.x} ${c.y - 10} L${c.x + 9} ${c.y + 7} L${c.x - 9} ${c.y + 7} Z`} fill={c.color} transform={t} />;
        })}

      {/* Arms up */}
      <g stroke="var(--tomato)" strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M214 238 Q168 214 150 124" />
        <path d="M298 238 Q344 214 362 124" />
      </g>
      <circle cx="150" cy="114" r="11" fill="var(--tomato)" />
      <circle cx="362" cy="114" r="11" fill="var(--tomato)" />

      {/* Fork: outline drawn as a fat stroke, then filled white on top */}
      <g fill="var(--tomato)" stroke="var(--tomato)" strokeWidth="18" strokeLinejoin="round">
        {TINES_X.map(x => (
          <rect key={x} x={x} y="96" width="12" height="110" rx="6" />
        ))}
        <path d={FORK_BODY} />
      </g>
      <g fill="#fff">
        {TINES_X.map(x => (
          <rect key={x} x={x} y="96" width="12" height="110" rx="6" />
        ))}
        <path d={FORK_BODY} />
      </g>

      {/* Face: happy eyes, open grin, blush */}
      <g transform="translate(256 224)" strokeLinecap="round">
        <path d="M-19 1 q6 -9 12 0 M7 1 q6 -9 12 0" fill="none" stroke="var(--ink)" strokeWidth="4" />
        <path d="M-9 8 H9 Q9 21 0 21 Q-9 21 -9 8 Z" fill="var(--ink)" />
        <path d="M-5 17 Q0 13 5 17 Q3 21 0 21 Q-3 21 -5 17Z" fill="#ff7e8c" />
        <ellipse cx="-27" cy="10" rx="7" ry="4" fill="#ffa3a3" />
        <ellipse cx="27" cy="10" rx="7" ry="4" fill="#ffa3a3" />
      </g>

      {sparks && (
        <g stroke="var(--tomato)" strokeWidth="7" strokeLinecap="round">
          <path d="M126 96 L112 82 M146 80 L144 62 M118 120 L100 120 M386 96 L400 82 M366 80 L368 62 M394 120 L412 120" />
        </g>
      )}
    </svg>
  );
}
