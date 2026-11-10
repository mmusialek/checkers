# Plan — sec-deps-20261110: Dependency audit — fix all vulns >= medium

**Source:** User raw prompt (standalone execution mode; no PRD; no backlog ticket; Step 0 triage found no `doc/backlog/open/` items)
**Created:** 2026-11-10 (Architect, Iteration 1)
**Status:** Planned — ready for Developer
**Targets:** `src/package.json`, `src/pnpm-lock.yaml`, `electron-wrapper/package.json`, `electron-wrapper/pnpm-lock.yaml` (both projects use **pnpm**, not npm)

## 1. Understanding

**Core problem:** `pnpm audit` reports 46 vulnerabilities across the two pnpm projects (19 in `src/`, 33 in `electron-wrapper/`; counts overlap loosely across summaries). All `high`/`moderate` findings must be fixed; `low` items ride along only where the same update fixes them (they do here — no dedicated low-only overrides).

**Impact:** Dev-time tooling exposure (`src/` — vite/eslint toolchain) and the Electron runtime + forge packaging chain (`electron-wrapper/`). No runtime app code changes; fixes are dependency-version only.

**Acceptance criteria:**
- `pnpm audit` in `src/` reports **0 high, 0 moderate** (lows allowed only if unfixable by the same change set — currently all lows do close).
- `pnpm audit` in `electron-wrapper/` reports **0 high, 0 moderate** (same low rule).
- No blanket cross-major override that would force one major of a multi-major package (e.g. brace-expansion, minimatch) onto all consumers.
- `src/`: `tsc --noEmit`, `pnpm build`, `pnpm lint` pass (baseline parity, per sec-deps-20260929).
- `electron-wrapper/`: `pnpm install` clean **and** `pnpm run package` (electron-forge package) succeeds despite the electron 39→42 major bump.
- `git status --short` clean except intended dependency files + `doc/` records.

**Historical context (5 lines max):**
- sec-deps-20260929 (2026-09-29): same pattern — `pnpm.overrides` for transitive fixes (`js-yaml@4.3.2` in src; `@xmldom/xmldom@0.9.12`, `fast-uri@3.1.6` in electron-wrapper), lockfile regen, all builds green, `extract-zip@2.0.1` documented accepted risk (still unpatched).
- This issue extends that `fast-uri` override forward; existing override blocks are preserved and merged into.

## 2. Technical Analysis

### Audit findings table (`pnpm audit` facts, pre-verified)

| # | Project | Package | Installed/vulnerable range | Fix | Sev | Path / notes |
|---|---------|---------|---------------------------|-----|-----|--------------|
| V1 | src | vite (direct devDep) | ^6.4.3 | **>=6.4.4** (bump to `^6.4.4`) | high/mod/low | GHSA-587h-7wmj-h5pm (high), GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-rq7h-c2jc-7f22 (mod), GHSA-9jrq-w75r-8gcw (low) |
| V2 | src | brace-expansion (via `eslint`>`minimatch`, 1.x) | <1.1.21 | `>=1.1.21` (stay 1.x) | high (GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p) + mod (GHSA-q2hr-2g5m-vwhr) | multi-major pkg → range selector required |
| V3 | src | brace-expansion (via `typescript-eslint`>`@typescript-eslint/typescript-estree`>`minimatch`, 4-5.x) | >=4.0.0 <5.0.12 | `>=5.0.12` (stay 5.x) | mod | same multi-major constraint |
| V4 | src | source-map-js (via `vite`>`postcss`) | <1.2.2 | `>=1.2.2` | high (GHSA-68fv-2mgg-jv7q) | **likely resolves transitively via V1 (vite 6.4.4)** — verify; add override only if not |
| V5 | src | minimatch (via `typescript-eslint`) | >=7.0.0 <11.0.1 | `>=11.0.1` | mod (GHSA-g3hv-75wg-m249) | multi-major pkg — scoped fix only (see F-step fallbacks) |
| V6 | electron-wrapper | electron (direct dep) | ^39.8.5 | **>=42.11.16** (bump to `^42.11.16`) | high (GHSA-jr5w-w6x2-84p9) + 4 mod + 3 low | MAJOR runtime bump; one bump closes ALL its advisories — **no per-advisory overrides** |
| V7 | electron-wrapper | fast-uri (transitive; existing override pin `3.1.6`) | >=3.0.0 <3.1.9 | **override to `>=3.1.9`/`3.1.9`** | 3 mod + 2 low | bump existing `pnpm.overrides["fast-uri"]` |
| V8 | electron-wrapper | ip-address (via `@electron-forge/cli`>`…`>`socks-proxy-agent`>`socks`) | <=10.7.3 | `>=10.7.4` | 5 mod | transitive → new override |
| V9 | electron-wrapper | brace-expansion (via `@electron-forge/cli`>`core`>`packager`>`@electron/asar`>`minimatch` **1.x**; via `…`>`@electron/universal`>`minimatch` **2.x**) | 1.x <1.1.21; 2.x <2.1.7 | 1.x `>=1.1.21`; 2.x `>=2.1.7` | mod | same multi-major pair as V2/V3 — one selector pair covers both projects |
| V10 | electron-wrapper | minimatch (via `@electron/universal`) | >=7.0.0 <11.0.1 | `>=11.0.1` | mod | scoped fix, see V5 |

### Affected files (workspace-relative)
- `src/package.json` — direct dep bump (vite) + `pnpm.overrides` additions
- `src/pnpm-lock.yaml` — regen
- `electron-wrapper/package.json` — direct dep bump (electron) + `pnpm.overrides` additions
- `electron-wrapper/pnpm-lock.yaml` — regen

### Dependencies / constraints
- `brace-expansion` and `minimatch` are multi-major packages consumed by pinned-major parents (`minimatch` 1.x inside `@electron/asar`, 2.x inside `@electron/universal`, etc.). A single blanket override is **not acceptable**.
- pnpm override range selectors (`"brace-expansion@1": "…"`) must be validated on the installed pnpm version before committing to general use; fallbacks defined below.
- Existing overrides must be preserved: src `js-yaml@4.3.2`; electron-wrapper `tmp`, `tar`, `lodash`, `@tootallnate/once`, `@xmldom/xmldom@0.9.12` (+ fast-uri which we bump).
- `electron-wrapper/node_modules/` and `out/` exist — stale artifacts from electron 39 can confuse packaging checks; clean if needed.
- `extract-zip@2.0.1` accepted risk from 20260929 remains (no patch upstream, not part of this audit's new findings) — leave untouched.

### Risks
- **R1 (highest):** electron 39→42 major. Possible breaking changes in main.js (`electron-squirrel-startup`, fuses plugin, forge makers). Mitigated by the `pnpm run package` gate + manual smoke (`pnpm start` optional).
- **R2:** minimatch `>=11.0.1` is ESM-era; consumers here are ESM tooling (typescript-eslint, @electron/universal), but verify child consumers accept it.
- **R3:** range-selector override syntax may differ by pnpm version → explicit verification step + fallback path (D-step).
- **R4:** over-overriding a direct dep's parent (e.g. bumping eslint to escape brace-expansion) risks cascading config changes — prefer narrowest fix.

## 3. Implementation Plan (Developer)

- [x] **Step 1 (src — direct bump):** `src/package.json`: `devDependencies.vite`: `^6.4.3` → `^6.4.4`. (<5 lines)
- [x] **Step 2 (src — overrides):** In `src/package.json` `pnpm.overrides` (merge, keep `js-yaml`): add `"brace-expansion@1": ">=1.1.21"`, `"brace-expansion@2": ">=5.0.12"`. Verify `pnpm install` accepts the selector syntax (`pnpm --version` first; if selectors unsupported → fallback below). (<10 lines)
      - *Fallback 2a:* if selector fails: bump `eslint` and/or `typescript-eslint` to latest minors that pull fixed `minimatch`/`brace-expansion` children; re-run audit.
      - *Fallback 2b:* scoped minimatch override rather than blanket, e.g. `"minimatch@2.x": …` — never a bare `"minimatch"` wildcard across majors.
- [x] **Step 3 (src — verify V4/V5):** Run `pnpm audit` in `src/`. If `source-map-js` (V4) still flagged → add `"source-map-js": ">=1.2.2"` to overrides; if `minimatch` (V5) still flagged → scoped `"minimatch@>=7 <10"` → `">=11.0.1"`-style selector (confirm patched minimatch 11 accepted by `typescript-eslint`; else bump `typescript-eslint` per fallback 2a). Only add what audit still reports.
- [x] **Step 4 (src — regen + tick):** `pnpm install` in `src/` (regen `src/pnpm-lock.yaml`). Then `pnpm build` (includes `tsc --noEmit`) + `pnpm lint`. Tick this plan's checkboxes in place.
- [x] **Step 5 (electron-wrapper — direct bump):** `electron-wrapper/package.json`: `devDependencies.electron`: `^39.8.5` → `^42.11.16`. (One bump closes all electron advisories — **no per-advisory overrides for electron**.) (<2 lines)
- [x] **Step 6 (electron-wrapper — overrides):** In `pnpm.overrides` (merge, keep `tmp`/`tar`/`lodash`/`@tootallnate/once`/`@xmldom/xmldom=0.9.12`): change `"fast-uri": "3.1.6"` → `"3.1.9"` (min `>=3.1.9`); add `"ip-address": ">=10.7.4"`; add `"brace-expansion@1": ">=1.1.21"`, `"brace-expansion@2": ">=2.1.7"`. (2.x selector differs from src's 5.x — keep them project-local.) (<10 lines)
- [x] **Step 7 (electron-wrapper — verify V10):** Run `pnpm audit` in `electron-wrapper/`. If `minimatch` (V10, via `@electron/universal`) still flagged → scoped selector `"minimatch@7…10"`-style → `">=11.0.1"` (verify `@electron/universal` accepts minimatch 11); else bump `@electron-forge/cli` minor as fallback. Only add what audit still reports.
- [x] **Step 8 (electron-wrapper — regen + tick):** `pnpm install` in `electron-wrapper/` (expect electron 42.x download; clean stale `node_modules`/`out/` if packaging artifacts confuse the run). Then **`pnpm run package`** must succeed. Tick this plan's checkboxes in place.
- [x] **Step 9:** `git diff --stat` / `git status --short` — only `src/package.json`, `src/pnpm-lock.yaml`, `electron-wrapper/package.json`, `electron-wrapper/pnpm-lock.yaml` (+ this plan/workflow files) may change.

## 4. Testing Strategy (QA)

- **Q1 (src):** `pnpm install` clean → `npx tsc --noEmit` exit 0 → `pnpm build` (`tsc && vite build`) → `pnpm lint` exit 0. (Baseline parity vs. sec-deps-20260929: build `✓ built`, lint exit 0.)
- **Q2 (electron-wrapper):** `pnpm install` clean (no peer errors beyond baseline) → **`pnpm run package`** succeeds → (optional smoke) `pnpm run start` launches packaged runtime.
- **Q3 (audit gates):** `pnpm audit` in `src/`: 0 high / 0 moderate. `pnpm audit` in `electron-wrapper/`: 0 high / 0 moderate. Any remaining `low` must be explained as unfixable-by-this-changeset (record in report).
- **Q4 (lockfile greps):** lockfiles contain `vite: 6.4.4` (or `@6.4.4`), `fast-uri` `3.1.9`, `ip-address` `>=10.7.4`-resolved (10.7.4 or newer), `brace-expansion` 1.x `>=1.1.21` **and** 5.x/`<6` `>=5.0.12` **and** 2.x `>=2.1.7` per consumer path, `electron` `42.11.16`+; no vulnerable-range leftovers (`Select-String` for old versions, expected count 0: `vite@6.4.3` bare, `fast-uri@3.1.6`, `ip-address@10.7.3` and older, `brace-expansion@` `1.1.11`/`2.0.x` legacy pins, `electron@39.8.`).
- **Q5 (multi-major integrity):** confirm override selectors did NOT collapse brace-expansion/minimatch majors — e.g. `@electron/asar` still resolves minimatch→brace-expansion 1.x (patched), while `typescript-eslint` chain uses 5.x (patched). Grep lockfile for multiple major tracks.
- **Q6 (regression UX edge cases from issue context):** (a) electron postinstall actually downloaded 42.x (check `node_modules/electron/dist/version`), (b) forge makers (squirrel/deb/zip) config in `forge.config` untouched and packaging detects electron 42, (c) no leftover stale outputs in `out/` attributable to the packaging run breaking the check, (d) overrides header in both lockfiles lists all forced versions.
- **Q7:** Write `doc/ai_doc/records/qa-report-sec-deps-20261110.md` with commands + outputs; blockers reported, no scope widening.

## 5. Review / Finalize notes

- Reviewer: changes are config-only; if any override forces a cross-major jump that breaks a build, report blocker — do not widen to app-code refactors.
- Finalize: generate `issue-sec-deps-20261110-resolution.md` (+ handoff copy), mark Step 5 complete; update `workflow_index.md` (append entry — Orchestrator-owned ledger).

## 6. Testing Acceptance

- [ ] `pnpm audit` `src/` → 0 high, 0 moderate (lows explained if any remain)
- [ ] `pnpm audit` `electron-wrapper/` → 0 high, 0 moderate (lows explained if any remain)
- [ ] `src/`: `tsc --noEmit` 0, `pnpm build` ok, `pnpm lint` 0
- [ ] `electron-wrapper/`: `pnpm install` clean, `pnpm run package` ok
- [ ] Multi-major packages keep per-major patched tracks (no collapsed majors)
- [ ] `git status --short` clean except intended dependency files + `doc/` records
- [ ] `extract-zip@2.0.1` accepted-risk note carried forward untouched (not part of this audit)

## 7. Out of Scope (Developer must NOT touch)

- App source under `src/**/*.ts` and `electron-wrapper/main.js` (no code changes unless a build breaks, and then only as a reported blocker).
- QA-owned files (`qa-report-*`) and Finalize-owned files (`*-resolution.md`, handoff copies, `workflow_index.md`).
- Tests owned by QA. No new npm-installed tooling; no lockfile hand-editing; no per-advisory electron workarounds.
- `extract-zip` migration / churn (remains documented accepted risk; if migration is desired, that is new scope).

## 8. Backlog

- None filed — discovery surfaced no out-of-scope work (no prioritized per-advisory source-map-js/minimatch overrides: handled in-line as conditional Steps 3/7; no research or docs gaps).

## Links

- Previous cycle: `doc/ai_doc/records/issue-sec-deps-20260929-plan.md` (established override pattern), `issue-sec-deps-20260929-resolution.md` (extract-zip accepted-risk precedent)
- Pipeline state: `doc/ai_doc/workflow_current.md` (currently here)
- Advisory IDs in findings table above; versions verified via `pnpm audit` facts supplied with the issue (2026-11-10)
