// Renders the launch still frame (the splash block in index.html) to the iPhone
// startup images in public/splash, and lists them in index.html. iOS shows these
// while the installed app opens, so they must match the HTML splash exactly.
// Re-run after changing the splash:  node scripts/make-splash-images.mjs
// Needs Google Chrome (headless). Not part of the build.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = 'public/splash';

// Portrait screens in CSS pixels, and their pixel ratio
const DEVICES = [
  [440, 956, 3], // 16 Pro Max, 17 Pro Max
  [420, 912, 3], // Air
  [402, 874, 3], // 16 Pro, 17, 17 Pro
  [430, 932, 3], // 14 Pro Max, 15 Plus / Pro Max, 16 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16, 16e
  [428, 926, 3], // 12 / 13 Pro Max, 14 Plus
  [390, 844, 3], // 12, 13, 14, 12 / 13 Pro
  [375, 812, 3], // X, XS, 11 Pro, 12 / 13 mini
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [375, 667, 2], // SE (2nd, 3rd), 8
];

const html = readFileSync('index.html', 'utf8');
const splash = html.match(/<!-- splash:start[\s\S]*?<!-- splash:end -->/)?.[0];
if (!splash) throw new Error('index.html has no splash:start / splash:end block');

const tmp = mkdtempSync(join(tmpdir(), 'forkyeah-splash-'));
const page = join(tmp, 'splash.html');
mkdirSync(OUT, { recursive: true });

const links = [];
for (const [w, h, dpr] of DEVICES) {
  const name = `apple-splash-${w * dpr}x${h * dpr}.png`;
  // Headless windows can't be narrower than 500px, so render at full pixel size and zoom the page up
  writeFileSync(page, `<!doctype html><html style="zoom:${dpr}"><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>${splash}</body></html>`);
  execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${w * dpr},${h * dpr}`,
    `--screenshot=${join(process.cwd(), OUT, name)}`,
    `file://${page}`,
  ], { stdio: 'ignore' });
  links.push(
    `    <link rel="apple-touch-startup-image" href="/splash/${name}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" />`,
  );
  console.log(`  ✓ ${name}`);
}
rmSync(tmp, { recursive: true });

const block = `<!-- startup-images:start -->\n${links.join('\n')}\n    <!-- startup-images:end -->`;
writeFileSync('index.html', html.replace(/<!-- startup-images:start -->[\s\S]*?<!-- startup-images:end -->/, block));
console.log(`Wrote ${DEVICES.length} startup images and updated index.html`);
