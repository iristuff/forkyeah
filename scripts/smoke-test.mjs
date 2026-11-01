// Smoke-tests a live deployment.  Usage: node scripts/smoke-test.mjs <url>
// Set VERCEL_AUTOMATION_BYPASS_SECRET to get past Vercel Deployment Protection on previews.
const base = process.argv[2]?.replace(/\/$/, '');
if (!base) {
  console.error('Usage: node scripts/smoke-test.mjs <deployment-url>');
  process.exit(1);
}

const headers = {};
if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
}

const checks = [
  { path: '/', type: 'text/html', body: /<div id="root">/ },
  // SPA rewrite: deep links must serve the app, not a 404
  { path: '/passport', type: 'text/html', body: /<div id="root">/ },
  { path: '/manifest.webmanifest', type: 'manifest', body: /"name":\s*"Fork Yeah"/ },
  { path: '/sw.js', type: 'javascript' },
  { path: '/icons/icon-512.png', type: 'image/png' },
  { path: '/icons/apple-touch-icon.png', type: 'image/png' },
  // API functions must load: a POST with no Origin gets our own 403 JSON (no AI call, no rate-limit hit)
  { path: '/api/chef', method: 'POST', status: 403, type: 'application/json', body: /"forbidden"/ },
];

async function get(url, method = 'GET', attempt = 1) {
  try {
    return await fetch(url, { method, headers, redirect: 'follow' });
  } catch (err) {
    // fresh deployments can take a moment to propagate
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 2000 * attempt));
      return get(url, method, attempt + 1);
    }
    throw err;
  }
}

let failed = 0;
for (const c of checks) {
  const res = await get(base + c.path, c.method);
  const type = res.headers.get('content-type') ?? '';
  const problems = [];
  if (res.status !== (c.status ?? 200)) problems.push(`status ${res.status}`);
  if (!type.includes(c.type)) problems.push(`content-type "${type}"`);
  if (c.body && !c.body.test(await res.text())) problems.push('unexpected body');

  if (problems.length) {
    failed++;
    console.error(`  ✗ ${c.path} — ${problems.join(', ')}`);
  } else {
    console.log(`  ✓ ${c.path}`);
  }
}

if (failed) {
  console.error(`\n✗ Smoke test failed for ${base} (${failed}/${checks.length})`);
  process.exit(1);
}
console.log(`\n✓ ${base} is healthy`);
