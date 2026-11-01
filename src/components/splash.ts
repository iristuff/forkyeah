// The launch "hooray". index.html paints the still frame (yellow, mascot with arms
// down, wordmark) before any JS runs; once the first screen has rendered, this
// cheers, pops confetti, and flies the mascot into the screen's own mascot
// (marked `data-splash-target`). Without a target the splash simply fades.

const CONFETTI = ['var(--tomato)', 'var(--blue)', 'var(--green)', 'var(--pink)', 'var(--gold)'];
const ARMS_DOWN = 128; // degrees, matching the still frame in index.html
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'; // --ease-out in tokens.css (animate() can't read var())
const STILL_MS = 150; // shortest time the still frame stays up, so it never just flickers

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const springy = (t: number) => 1 - Math.exp(-7 * t) * Math.cos(11 * t);

export async function playSplash(): Promise<void> {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.style.animation = 'none'; // JS is running: cancel the no-JS failsafe
  try {
    await hooray(splash);
  } finally {
    // Whatever happens, never leave the splash covering the app
    splash.remove();
  }
}

async function hooray(splash: HTMLElement) {
  const target = await firstScreen();
  await wait(Math.max(0, STILL_MS - performance.now()));

  if (!splash.animate) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await splash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out' }).finished;
    return;
  }

  const holder = splash.querySelector<HTMLElement>('.splash-mascot')!;
  const mascot = holder.querySelector('svg')!;
  const word = splash.querySelector<SVGElement>('.splash-word')!;

  // 1. Hooray: a squash-and-hop while both arms spring up, confetti from the middle
  mascot.animate(
    [
      { transform: 'none' },
      { transform: 'translateY(6px) scale(1.06, 0.92)', offset: 0.2 },
      { transform: 'translateY(-16px) scale(0.97, 1.04)', offset: 0.55 },
      { transform: 'none' },
    ],
    { duration: 440, easing: 'ease-out' },
  );
  raiseArms(mascot, 400);
  await wait(100);
  confetti(splash, mascot.getBoundingClientRect());
  await wait(300);

  // 2. Hand-off: the yellow fades off the screen beneath while the mascot flies home
  splash.style.pointerEvents = 'none';
  word.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(8px) scale(0.96)' }], {
    duration: 240,
    easing: 'ease-in',
    fill: 'forwards',
  });
  // --sun, as a literal to match the still frame painted before tokens.css loads
  splash.animate([{ backgroundColor: '#ffe27a' }, { backgroundColor: 'rgb(255 226 122 / 0)' }], {
    duration: 460,
    delay: 80,
    fill: 'forwards',
  });
  revealScreen();

  if (target) {
    target.style.visibility = 'hidden';
    try {
      const from = holder.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      await holder.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${to.width / from.width})` }], {
        duration: 600,
        easing: 'cubic-bezier(0.45, 0, 0.2, 1)',
        fill: 'forwards',
      }).finished;
    } finally {
      target.style.visibility = '';
    }
  } else {
    await holder.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(0.9)' }], { duration: 400, easing: EASE_OUT, fill: 'forwards' })
      .finished;
  }
}

// Waits (briefly) for React's first screen, and returns its mascot if it has one
async function firstScreen(): Promise<HTMLElement | null> {
  const root = document.getElementById('root');
  for (let i = 0; i < 30 && !root?.childElementCount; i++) await new Promise(requestAnimationFrame);
  await Promise.race([document.fonts?.ready, wait(300)]);
  return document.querySelector<HTMLElement>('[data-splash-target]');
}

function raiseArms(mascot: SVGSVGElement, ms: number) {
  const left = mascot.querySelector('.arm-l')!;
  const right = mascot.querySelector('.arm-r')!;
  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const a = ARMS_DOWN * (1 - springy(t));
    left.setAttribute('transform', `rotate(${a} 214 238)`);
    right.setAttribute('transform', `rotate(${-a} 298 238)`);
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function confetti(splash: HTMLElement, around: DOMRect) {
  const cx = around.left + around.width / 2;
  const cy = around.top + around.height / 2;
  for (let i = 0; i < 18; i++) {
    const piece = document.createElement('i');
    const kind = i % 3;
    Object.assign(piece.style, {
      position: 'fixed',
      left: `${cx}px`,
      top: `${cy}px`,
      width: kind === 0 ? '14px' : '10px',
      height: kind === 0 ? '6px' : '10px',
      borderRadius: kind === 1 ? '50%' : '3px',
      background: CONFETTI[i % CONFETTI.length],
    });
    splash.appendChild(piece);
    const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 170 * (0.6 + Math.random() * 0.5);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    const spin = (Math.random() - 0.5) * 540;
    piece.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 1 },
        { transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(${x * 1.1}px - 50%), calc(${y + 70}px - 50%)) rotate(${spin}deg) scale(0.9)`, opacity: 0 },
      ],
      { duration: 700, easing: EASE_OUT, fill: 'forwards' },
    );
  }
}

// The first screen's sections rise in one after another behind the fading yellow
function revealScreen() {
  const page = document.querySelector('#root main > *');
  const items = [...(page?.children ?? []), ...document.querySelectorAll('#root nav')];
  items.slice(0, 10).forEach((el, i) =>
    el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
      duration: 440,
      delay: i * 40,
      easing: EASE_OUT,
      fill: 'backwards',
    }),
  );
}
