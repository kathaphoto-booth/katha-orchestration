# Spec: Obsidian CLI Integration Suite

This spec defines the architecture, features, and testing boundaries for automating Obsidian via the local `obsidian` command line utility, supporting human workflows, agent search, and visual graph analysis.

## 1. System Goals
We want to integrate the `obsidian` CLI into our workspace to achieve:
1. **Focus State Automation:** Obsidian automatically refreshes its index and opens newly compiled LLM Wiki files when a manual compile finishes.
2. **AI-Native Context Retrieval:** Agents can search the Obsidian index natively via a structured CLI wrapper rather than reading files or using slow greps.
3. **Graph Diagnostics:** Automated screenshot capture of the Obsidian Graph View and execution of Dataview metrics directly from the shell.

---

## 2. Component Design & Phases

### Phase 1: Human Workflow Automation (Hooks & Flags)
- **Compiler Trigger:** Modify `knowledge/.memory/scripts/compiler.js`. After writing a node, it checks if `obsidian` is available on the system. If yes, it runs:
  ```bash
  obsidian reload
  obsidian open path="wiki/entities/<slug>.md"
  ```
- **CLI Flag Control:** Add a `--silent` flag to `compiler.js` (e.g. `node compiler.js 20 --silent`). When present, it skips all `obsidian` CLI triggers to avoid focus-stealing during batch runs.
- **TDD Verification:** 
  - Write a unit test mock for `spawnSync(obsidian)` inside `compiler.test.js`.
  - Assert that compile triggers the correct commands when `--silent` is absent and skips them when `--silent` is present.

---

### Phase 2: Agent Brain (AI Search Integration)
- **Search Wrapper:** Create a new script `bin/obsidian-search.js` (and expose via `bin/obsearch` shim). It executes `obsidian search` and converts the JSON output into a clean, LLM-readable Markdown table listing matching files, paths, and match counts.
- **Verification:** 
  - Write a test script `tests/obsidian-search.test.js` that tests search formatting against a mock Obsidian JSON output.
  - Verification succeeds if the output matches our exact markdown schema.

---

### Phase 3: Graph and Advanced Scripting (Visual Diagnostics)
- **Visual Capture:** Create a script `bin/obsidian-screenshot.js`. It runs:
  ```bash
  obsidian dev:screenshot path="/Users/jedg./.gemini/antigravity/brain/cb156ddc-e795-45c6-a639-c5eccacef167/obsidian_graph.png"
  ```
- **Dataview Query Runner:** Create a script `bin/obsidian-dataview.js`. It executes `obsidian eval` passing a JS query that pulls open tasks or metadata summaries from the Dataview plugin:
  ```javascript
  app.plugins.plugins.dataview.api.pages("#llm_wiki_entity").map(p => ({file: p.file.name, summary: p.summary}))
  ```
- **Verification:**
  - Verify that `obsidian_graph.png` is generated and readable in the artifacts directory.
  - Verify that the Dataview runner successfully outputs JSON data to stdout.

---

## 3. Tool Tier & Execution Guidelines (GLM-5)
- **Implementation Engine:** We will utilize the OpenAI-partner model GLM-5 (via the `./bin/glm5` wrapper) to generate the implementation code and tests.
- **TDD Discipline:** We will write all test files first, confirm they fail (RED), run GLM-5 to write the minimal passing code, and confirm they pass (GREEN).
- **QA Gate:** Every phase will pass the full `vibecode-production-qa-validator` sequence:
  1. `npx tsc --noEmit`
  2. `npm run test`
  3. `npm run lint`
  4. `npm run build`
