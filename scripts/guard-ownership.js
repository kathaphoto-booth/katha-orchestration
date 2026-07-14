#!/usr/bin/env node
/**
 * W3 Ownership Guard — prevents re-drift of @katha/core-owned files into app dirs.
 * A stub that re-exports from '@katha/core' is allowed. Anything else is a violation.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../');
const manifestPath = join(ROOT, '.ownership.json');

if (!existsSync(manifestPath)) {
  console.error('guard-ownership: .ownership.json not found at monorepo root');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const { owned_by_core, app_roots } = manifest;

let violations = 0;

for (const appRoot of app_roots) {
  for (const ownedPath of owned_by_core) {
    const fullPath = join(ROOT, appRoot, ownedPath);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf8');
      const isStub = content.includes("from '@katha/core'") || content.includes('from "@katha/core"');
      if (!isStub) {
        console.error(`VIOLATION: ${appRoot}/${ownedPath}`);
        console.error(`  Owned by @katha/core but contains non-stub content.`);
        console.error(`  Fix: replace with a thin wrapper that imports from '@katha/core'`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\nguard-ownership: ${violations} violation(s). Extract to packages/core/ and stub.`);
  process.exit(1);
}
console.log('guard-ownership: clean — all owned files are stubs.');
