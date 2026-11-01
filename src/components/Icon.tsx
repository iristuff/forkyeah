// Line icons drawn for Fork Yeah: 24px grid, rounded 2px strokes,
// matching the mascot's outline. Decorative unless a `label` is given.
const PATHS = {
  home: <path d="M4 11 12 4l8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19.5z" />,
  passport: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <circle cx="12" cy="11" r="3.5" />
      <path d="M9 17h6" />
    </>
  ),
  ranks: <path d="M8 21V11h8v10M3 21v-6h5M16 21v-8h5v8M2 21h20" />,
  chef: (
    <>
      <path d="M7 14.5a4 4 0 0 1-.6-7.9A5.5 5.5 0 0 1 12 3.5a5.5 5.5 0 0 1 5.6 3.1A4 4 0 0 1 17 14.5V20H7z" />
      <path d="M7 17h10" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  flame: (
    <path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.8 3.4-5.6 3.9-9.5 2.5 1.6 3.4 3.6 3.4 5.3 1-.6 1.6-1.6 1.8-2.8 1.8 1.5 3.9 4 3.9 7 0 3.4-2.5 6-6.5 6z" />
  ),
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />,
  camera: (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  send: <path d="M4 12l16-8-6 16-2.5-6.5z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  upload: <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />,
  play: <path d="M8 5l11 7-11 7z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  reset: <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  share: <path d="M12 3v12M7 8l5-5 5 5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />,
  stamp: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4v3h-4z" />,
} as const;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function Icon({ name, size = 22, strokeWidth = 2, label, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {PATHS[name]}
    </svg>
  );
}
