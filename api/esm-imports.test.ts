// Vercel runs api/ as native Node ES modules, which need explicit ".js" extensions
// on relative imports. Vite/Vitest don't, so without this test a missing extension
// passes CI and then crashes in production with ERR_MODULE_NOT_FOUND.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const IMPORT_RE = /^\s*(?:import|export)\s+(?!type\b)[^'"]*?from\s+['"](\.{1,2}\/[^'"]+)['"]/gm;

function entryFiles(): string[] {
  return readdirSync('api').filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts')).map(f => join('api', f));
}

// Follow runtime imports from every function into api/_lib and src/
function walk(file: string, seen = new Set<string>(), bad: string[] = []): string[] {
  if (seen.has(file)) return bad;
  seen.add(file);
  for (const [, spec] of readFileSync(file, 'utf8').matchAll(IMPORT_RE)) {
    if (!spec.endsWith('.js')) {
      bad.push(`${file}: '${spec}'`);
      continue;
    }
    const target = resolve(dirname(file), spec.replace(/\.js$/, '.ts'));
    if (!existsSync(target)) bad.push(`${file}: '${spec}' (no such file)`);
    else walk(target, seen, bad);
  }
  return bad;
}

describe('api ESM imports', () => {
  it('every relative runtime import reachable from api/ uses an explicit .js extension', () => {
    const bad = entryFiles().flatMap(f => walk(f));
    expect(bad).toEqual([]);
  });
});
