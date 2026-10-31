// Verifies the production build in dist/ before it is allowed to deploy.
// Run after `npm run build`:  npm run verify
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const JS_GZIP_BUDGET_KB = 200;

// Patterns that must never end up in client code
const SECRET_PATTERNS = [
  { name: 'Google/Gemini API key', re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'Anthropic API key', re: /sk-ant-[0-9A-Za-z_-]{20,}/ },
  { name: 'OpenAI API key', re: /sk-(proj-)?[0-9A-Za-z]{32,}/ },
  { name: 'Supabase secret key', re: /sb_secret_[0-9A-Za-z_-]{10,}/ },
  { name: 'Supabase service_role JWT', re: /"role"\s*:\s*"service_role"/ },
  { name: 'Private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const failures = [];
const fail = msg => failures.push(msg);
const pass = msg => console.log(`  ✓ ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(1);
}
const files = walk(DIST);

// ── Manifest ──────────────────────────────────────────────────
console.log('Manifest');
const manifestPath = join(DIST, 'manifest.webmanifest');
if (!existsSync(manifestPath)) {
  fail('manifest.webmanifest missing');
} else {
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const key of ['name', 'short_name', 'start_url', 'theme_color', 'background_color']) {
    if (m[key]) pass(`${key}: ${m[key]}`);
    else fail(`manifest.${key} missing`);
  }
  if (m.display === 'standalone') pass('display: standalone');
  else fail(`manifest.display is "${m.display}", expected "standalone"`);

  const icons = m.icons ?? [];
  const has = (size, purpose) => icons.some(i => i.sizes === size && (i.purpose ?? 'any').includes(purpose));
  if (has('192x192', 'any')) pass('192px icon'); else fail('manifest needs a 192x192 icon');
  if (has('512x512', 'any')) pass('512px icon'); else fail('manifest needs a 512x512 icon');
  if (has('512x512', 'maskable')) pass('maskable icon'); else fail('manifest needs a 512x512 maskable icon');
  for (const icon of icons) {
    if (!existsSync(join(DIST, icon.src))) fail(`icon file missing: ${icon.src}`);
  }
}

// ── index.html ────────────────────────────────────────────────
console.log('index.html');
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const htmlChecks = [
  ['manifest link', /<link[^>]+rel="manifest"/],
  ['apple-touch-icon', /rel="apple-touch-icon"/],
  ['viewport-fit=cover (safe areas)', /viewport-fit=cover/],
  ['theme-color', /name="theme-color"/],
  ['service worker registration', /registerSW\.js/],
];
for (const [label, re] of htmlChecks) {
  if (re.test(html)) pass(label);
  else fail(`index.html missing ${label}`);
}

// ── Service worker ────────────────────────────────────────────
console.log('Service worker');
const swPath = join(DIST, 'sw.js');
if (!existsSync(swPath)) {
  fail('sw.js missing');
} else {
  const sw = readFileSync(swPath, 'utf8');
  if (sw.includes('index.html')) pass('precaches index.html (offline launch)');
  else fail('sw.js does not precache index.html');
}

// ── Secrets ───────────────────────────────────────────────────
console.log('Secrets');
let leaks = 0;
for (const file of files.filter(f => /\.(js|html|css|json|webmanifest|map)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(text)) {
      leaks++;
      fail(`${name} found in ${relative(DIST, file)}`);
    }
  }
}
if (leaks === 0) pass('no secrets in client bundle');

// ── Bundle size ───────────────────────────────────────────────
console.log('Bundle size');
const jsFiles = files.filter(f => f.startsWith(join(DIST, 'assets')) && f.endsWith('.js'));
const gzKB = jsFiles.reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0) / 1024;
if (gzKB <= JS_GZIP_BUDGET_KB) pass(`app JS ${gzKB.toFixed(1)} KB gzip (budget ${JS_GZIP_BUDGET_KB} KB)`);
else fail(`app JS is ${gzKB.toFixed(1)} KB gzip, over the ${JS_GZIP_BUDGET_KB} KB budget`);

// ── Result ────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ Build verification failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\n✓ Build verified');
