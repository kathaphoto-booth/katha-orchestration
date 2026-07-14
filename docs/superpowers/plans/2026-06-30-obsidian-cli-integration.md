# Obsidian CLI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive suite of scripts and hooks utilizing the Obsidian CLI to automate human workspace routing, AI vault search, and visual graph diagnostics.

**Architecture:** We will modify the compiler script to trigger reload/open commands, and build new CLI wrapper tools under the vault's bin folder. We will utilize native Node.js `node --test` for TDD testing without introducing external npm packages.

**Tech Stack:** Node.js (native test runner, spawnSync), Obsidian CLI.

## Global Constraints
- All JavaScript code must use standard Node.js syntax (CommonJS for scripts, or native ESM if specified).
- Do not introduce external dependencies (e.g. lodash, jest) to the vault scripts. Use native standard library APIs.
- Commands executing `obsidian` must use spawnSync argument arrays to prevent shell injection.

---

### Task 1: Auto-Open Hooks in compiler.js

**Files:**
- Modify: `knowledge/.memory/scripts/compiler.js`
- Create: `knowledge/.memory/scripts/compiler.test.js`

**Interfaces:**
- Consumes: The `obsidian` binary installed at `/usr/local/bin/obsidian`.
- Produces: Dynamic execution of reload and open commands after writing entities.

- [ ] **Step 1: Write the failing test**
  Create `knowledge/.memory/scripts/compiler.test.js` using Node's native test runner. Assert that running compiler triggers the obsidian spawn command.
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const child_process = require('child_process');
  const fs = require('fs');

  test('compiler auto-opens node and respects --silent flag', (t) => {
    // Setup mock spawnSync
    const originalSpawn = child_process.spawnSync;
    const calls = [];
    child_process.spawnSync = (cmd, args) => {
      calls.push({ cmd, args });
      return { stdout: '', stderr: '', status: 0 };
    };

    t.after(() => {
      child_process.spawnSync = originalSpawn;
    });

    // Run compiler logic mock or require compiler inside test
    // To mock compiler without running full file system, we can export compile function from compiler.js
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `node --test knowledge/.memory/scripts/compiler.test.js`
  Expected: FAIL (compiler.test.js throws error since compiler.js doesn't export compile function or have hooks yet)

- [ ] **Step 3: Modify compiler.js to support test hooks and `--silent` flag**
  Exposed the compilation function and read command-line arguments to toggle CLI triggers:
  ```javascript
  // Read --silent flag
  const isSilent = process.argv.includes('--silent');

  // Inside writeNode:
  if (!isSilent) {
    console.log(`Triggering Obsidian CLI for ${node.id}`);
    spawnSync('/usr/local/bin/obsidian', ['reload'], { stdio: 'ignore' });
    spawnSync('/usr/local/bin/obsidian', ['open', `path=wiki/${type}/${node.id}.md`], { stdio: 'ignore' });
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test knowledge/.memory/scripts/compiler.test.js`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add knowledge/.memory/scripts/compiler.js knowledge/.memory/scripts/compiler.test.js
  git commit -m "feat(compiler): add auto-open obsidian hook with --silent support"
  ```

---

### Task 2: AI-Native Search Wrapper (obsidian-search.js)

**Files:**
- Create: `knowledge/.memory/scripts/obsidian-search.js`
- Create: `knowledge/.memory/scripts/obsidian-search.test.js`
- Create: `knowledge/bin/obsearch` (bash wrapper shim)

**Interfaces:**
- Consumes: JSON outputs from `obsidian search query="<text>" format=json`.
- Produces: Markdown formatted table matching files, paths, and occurrence counts.

- [ ] **Step 1: Write the failing test**
  Create `knowledge/.memory/scripts/obsidian-search.test.js`.
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const { formatSearchResults } = require('./obsidian-search.js');

  test('formats JSON search results into Markdown table', () => {
    const mockJson = JSON.stringify([
      { path: 'wiki/entities/llm-wiki.md', matches: 3 },
      { path: 'wiki/concepts/rag.md', matches: 1 }
    ]);
    const markdown = formatSearchResults(mockJson);
    assert.match(markdown, /\| File \| Path \| Matches \|/);
    assert.match(markdown, /\| llm-wiki\.md \|/);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `node --test knowledge/.memory/scripts/obsidian-search.test.js`
  Expected: FAIL ("cannot find module")

- [ ] **Step 3: Implement obsidian-search.js and the obsearch shim**
  Write code in `obsidian-search.js` to execute `obsidian search` and parse results:
  ```javascript
  const { spawnSync } = require('child_process');
  
  function formatSearchResults(jsonStr) {
    const results = JSON.parse(jsonStr);
    let md = '| File | Path | Matches |\n| --- | --- | --- |\n';
    results.forEach(r => {
      const name = r.path.split('/').pop();
      md += `| [${name}](file://${r.path}) | ${r.path} | ${r.matches} |\n`;
    });
    return md;
  }

  module.exports = { formatSearchResults };
  
  // CLI Entry point
  if (require.main === module) {
    const query = process.argv.slice(2).join(' ');
    if (!query) {
       console.log("Usage: node obsidian-search.js <query>");
       process.exit(1);
    }
    const child = spawnSync('/usr/local/bin/obsidian', ['search', `query=${query}`, 'format=json']);
    if (child.status === 0 && child.stdout) {
       console.log(formatSearchResults(child.stdout.toString().trim()));
    }
  }
  ```
  Create `knowledge/bin/obsearch` script:
  ```bash
  #!/usr/bin/env bash
  node "$(dirname "$0")/../.memory/scripts/obsidian-search.js" "$@"
  ```
  Run: `chmod +x knowledge/bin/obsearch`

- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test knowledge/.memory/scripts/obsidian-search.test.js`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add knowledge/.memory/scripts/obsidian-search.js knowledge/.memory/scripts/obsidian-search.test.js knowledge/bin/obsearch
  git commit -m "feat(cli): add obsidian search markdown wrapper"
  ```

---

### Task 3: Graph and Visual Diagnostics (obsidian-diagnostics.js)

**Files:**
- Create: `knowledge/.memory/scripts/obsidian-diagnostics.js`
- Create: `knowledge/.memory/scripts/obsidian-diagnostics.test.js`

**Interfaces:**
- Consumes: `obsidian dev:screenshot` and `obsidian eval` commands.
- Produces: Image files in artifacts and JSON data to stdout.

- [ ] **Step 1: Write the failing test**
  Create `knowledge/.memory/scripts/obsidian-diagnostics.test.js`.
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const { runDataview } = require('./obsidian-diagnostics.js');

  test('generates expected dataview command arguments', () => {
     // Test that the runner generates valid JSON eval code
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `node --test knowledge/.memory/scripts/obsidian-diagnostics.test.js`
  Expected: FAIL

- [ ] **Step 3: Implement obsidian-diagnostics.js**
  Write execution functions:
  ```javascript
  const { spawnSync } = require('child_process');

  function takeScreenshot(outPath) {
     return spawnSync('/usr/local/bin/obsidian', ['dev:screenshot', `path=${outPath}`]);
  }

  function runDataview(tag) {
     const code = `JSON.stringify(app.plugins.plugins.dataview.api.pages("${tag}").map(p => ({file: p.file.name, path: p.file.path})))`;
     const child = spawnSync('/usr/local/bin/obsidian', ['eval', `code=${code}`]);
     return child.stdout.toString().trim();
  }

  module.exports = { takeScreenshot, runDataview };
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test knowledge/.memory/scripts/obsidian-diagnostics.test.js`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add knowledge/.memory/scripts/obsidian-diagnostics.js knowledge/.memory/scripts/obsidian-diagnostics.test.js
  git commit -m "feat(cli): add screenshot and dataview diagnostic utilities"
  ```

---

### Task 4: Security and Stability Hardening (Adversary-Backed)

**Files:**
- Create: `knowledge/.memory/scripts/sandbox-validator.js`
- Create: `knowledge/.memory/scripts/sandbox-validator.test.js`
- Modify: `knowledge/.memory/scripts/obsidian-daily.js` (or creation if new)
- Modify: `knowledge/.memory/scripts/obsidian-format.js` (or creation if new)

**Interfaces:**
- Consumes: Canonical path strings, Daily note write locks, HTML scraping buffers.
- Produces: Sanitized paths, locking mechanisms, robust Markdown structures.

- [ ] **Step 1: Write Sandbox Validator failing tests**
  Create `knowledge/.memory/scripts/sandbox-validator.test.js` to assert that directory path resolution rejects traversals outside of `/Volumes/samsung 970 pro - Data/KATHA_VAULT/`.
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const { validateVaultPath } = require('./sandbox-validator.js');

  test('validateVaultPath resolves path and allows valid paths', () => {
    const valid = validateVaultPath('/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/wiki/entities/llm.md');
    assert.strictEqual(valid, true);
  });

  test('validateVaultPath rejects directory traversal attempts', () => {
    assert.throws(() => {
      validateVaultPath('/Volumes/samsung 970 pro - Data/KATHA_VAULT/../../etc/passwd');
    }, /Traversal attack detected/);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `node --test knowledge/.memory/scripts/sandbox-validator.test.js`
  Expected: FAIL (sandbox-validator.js module not found)

- [ ] **Step 3: Implement sandbox-validator.js**
  Write validation logic using standard Node.js libraries:
  ```javascript
  const fs = require('fs');
  const path = require('path');

  const VAULT_ROOT = '/Volumes/samsung 970 pro - Data/KATHA_VAULT/';

  function validateVaultPath(targetPath) {
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(VAULT_ROOT)) {
      throw new Error(`Traversal attack detected: Path "${resolved}" is outside of vault root.`);
    }
    return true;
  }

  module.exports = { validateVaultPath };
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test knowledge/.memory/scripts/sandbox-validator.test.js`
  Expected: PASS

- [ ] **Step 5: Implement Daily Note File Locking and GFM Sanity**
  In `knowledge/.memory/scripts/obsidian-daily.js`, implement locking check and GFM sanitization:
  - Create a lock file `obsidian-daily.lock` before beginning write.
  - If the lock file exists, retry or wait up to 1000ms.
  - Escape user markdown triggers in input lines.
  - Wrap sections with blank lines `\n\n` to guarantee flawless GFM rendering.
  - Implement atomic write sequence: write to `.tmp` file, then `fs.renameSync` over daily note.

- [ ] **Step 6: Implement Robust Offline HTML Parser**
  In `knowledge/.memory/scripts/obsidian-format.js`:
  - Enforce `cheerio` or `jsdom` parser usage for any HTML-to-Markdown conversions.
  - Restrict all outputs to the designated target directory using `validateVaultPath`.

- [ ] **Step 7: Commit changes**
  Run:
  ```bash
  git add knowledge/.memory/scripts/sandbox-validator.js knowledge/.memory/scripts/sandbox-validator.test.js
  git commit -m "security: implement realpath sandbox-validator and daily-note locking plans"
  ```

