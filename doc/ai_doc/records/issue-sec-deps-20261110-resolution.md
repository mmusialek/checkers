# Resolution — sec-deps-20261110: Dependency audit — fix all vulns >= medium

**Issue:** Run dependency audit for `src/` and `electron-wrapper/` and update all vulnerabilities >= medium severity (46 findings across both pnpm projects at kickoff: 19 in `src/`, 33 in `electron-wrapper/`, loosely overlapping across severities).
**Iteration:** 1
**Date:** 2026-11-10
**Mode:** A Single-Department (dev only; no PRD; user direct/standalone request)
**Status:** Complete — all >= medium findings fixed; residual `extract-zip` ×2 high is a carried-forward documented accepted risk (unfixable upstream). Commit pending user confirmation (per orchestrator; no git action taken).

## What changed

Dependency-version only; no app source code changes (verified: `git diff` touches no `.ts`/`main.js` file).

### `src/package.json`
- Direct dep: `devDependencies.vite`: `^6.4.3` → `^6.4.4` (closes GHSA-587h-7wmj-h5pm high + 3 moderate + 1 low; resolves 6.4.6).
- `pnpm.overrides` merged (existing `js-yaml: 4.3.2` preserved):
  - `"brace-expansion@1": "^1.1.21"` (new — via `eslint` → `minimatch` 3.x)
  - `"brace-expansion@5": "^5.0.12"` (new — via `typescript-eslint` → `minimatch` 11)
  - `"source-map-js": ">=1.2.2"` (new — via `vite` → `postcss`; GHSA-68fv-2mgg-jv7q)
  - `"minimatch@10": "^11.0.1"` (new — via `typescript-eslint`; GHSA-g3hv-75wg-m249)

### `electron-wrapper/package.json`
- Direct dep: `devDependencies.electron`: `^39.8.5` → `^42.11.16` (MAJOR runtime bump 39→42; one bump closes GHSA-jr5w-w6x2-84p9 high + 4 moderate + 3 low — no per-advisory electron overrides).
- `pnpm.overrides` merged (existing `tmp`, `tar`, `lodash >=4.18.1`, `@tootallnate/once >=3.0.1`, `@xmldom/xmldom 0.9.12` preserved):
  - `"fast-uri": "3.1.6"` → `"^3.1.9"` (bump of existing override; key **narrowed by Reviewer** from QA-proposed `>=3.1.9` to caret so it stays on 3.x instead of forcing cross-major 4.2.3 onto `ajv`'s declared `^3.0.1`; resolves 3.1.9, latest 3.x)
  - `"ip-address": ">=10.7.4"` (new — via `@electron-forge/cli` → `socks` chain; resolves 10.7.6)
  - `"brace-expansion@1": "^1.1.21"`, `"brace-expansion@2": "^2.1.7"` (new — project-local 2.x selector; distinct from src's 5.x)
  - `"minimatch@9": "^11.0.1"` (new — via `@electron/universal`, scoped selector)

### Lockfile resolutions (regenerated `pnpm install`)
| Package | Resolved | Patched floor |
|---|---|---|
| vite (src) | 6.4.6 | >=6.4.4 |
| source-map-js (src) | 1.2.2 | >=1.2.2 |
| brace-expansion 1.x (both) | 1.1.21 | >=1.1.21 |
| brace-expansion 5.x (src) | 5.0.12 | >=5.0.12 |
| brace-expansion 2.x (ew) | 2.1.7 | >=2.1.7 |
| minimatch (src typescript-estree + ew @electron/universal) | 11.0.5 | >=11.0.1 |
| electron (ew) | 42.11.18 | >=42.11.16 |
| fast-uri (ew, via ajv 8.20.0) | **3.1.9** (post-Reviewer) | >=3.1.9 |
| ip-address (ew) | 10.7.6 | >=10.7.4 |

**Multi-major integrity:** three patched brace-expansion tracks (1.1.21 / 2.1.7 / 5.0.12) and minimatch tracks (3.1.5 / 5.1.9 / 11.0.5) coexist; no blanket single-major override. `@electron/asar` chain deliberately untouched at minimatch 3.1.5 (brace-expansion 1.1.21 patched underneath); `src/` eslint stays on minimatch 3.1.5. Stale-pin regex scan (vite 6.4.0–3, fast-uri@3.1.6, ip-address@10.7.0–3, electron@39, legacy brace-expansion pins): 0 hits in both lockfiles.

## Verification

Final scoped check (Finalize) + full gates from QA/Developer/Reviewer:

| Gate | Result |
|---|---|
| Workflow Steps 1–4 marked `[x]` | confirmed |
| `pnpm audit` `src/` | 0 critical / 0 high / 0 mod / 0 low — exit 0 |
| `pnpm audit` `electron-wrapper/` | 2 high `extract-zip` only (accepted risk), 0 mod/low — exit 1 expected & explained |
| `src/`: `npx tsc --noEmit`, `pnpm build`, `pnpm lint` | all exit 0 (vite v6.4.6, `✓ built`) |
| `ew/`: `pnpm install`, `pnpm install --frozen-lockfile`, `pnpm run package` ×2 | all exit 0; `app.asar` 1,925,374 B reproducible, packaged binary alive 10 s |
| Postinstall binary check | `node_modules/electron/dist/version` = `42.11.18` (downloaded, not just lockfile) |
| Lockfile greps (Finalize re-check, no audit re-run needed) | vite 6.4.6, electron 42.11.18, fast-uri 3.1.9, ip-address 10.7.6, all brace-expansion/minimatch tracks present (see above) |
| Electron 42 API surface (`main.js`/`preload.js` events, BrowserWindow, menu, loadFile) | none removed in 42 (Reviewer) |
| ajv + fast-uri probe on 3.1.9 | compile/validate + parse/resolve/serialize/normalize/equal OK (Reviewer) |

Full QA evidence: `doc/ai_doc/records/qa-report-sec-deps-20261110.md` (PASS, 2026-11-10).

## Known remaining risk

- **`extract-zip` ×2 high (GHSA-jmr9-qjv8-65gv, GHSA-7pqw-9j4j-h8q3) — carried forward, accepted.** `extract-zip <=2.0.1`, upstream `Patched: <0.0.0` (no fix exists), latest pkg version = vulnerable version. Documented accepted risk since `sec-deps-20260929` with the same mitigations: it sits behind `@electron-forge/cli > @electron-forge/core > @electron/packager` (dev-time packaging tooling only), the app never extracts untrusted archives at runtime, and no fake-upgrade was applied. Not regressed, not new. Re-evaluate if upstream publishes a fix or an `adm-zip`/`yauzl` migration is explicitly scoped.
- Residual notes (non-blocking, pre-existing, NOT this issue): minimatch `^9.0.3`→11.0.5 under `@electron/universal` is advisory-forced (no patched 9.x/10.x exists; not exercised on win32/x64 packaging); `ip-address >=10.7.4` uses `>=` unbounded-upper per existing project override convention; `preload.js` is 0 bytes and `electron.vite.config.js` unreferenced — untouched.

## Records

- Plan: `doc/ai_doc/records/issue-sec-deps-20261110-plan.md`
- QA report: `doc/ai_doc/records/qa-report-sec-deps-20261110.md`
- Resolution (this file): `doc/ai_doc/records/issue-sec-deps-20261110-resolution.md`
- Handoff copy: `doc/ai_doc/handoff/to_marketing/issue-sec-deps-20261110-resolution.md`
- Precedent: `doc/ai_doc/records/issue-sec-deps-20260929-resolution.md` (override pattern + extract-zip accepted-risk framing carried forward)

## Backlog triage

- `doc/backlog/open/` does not exist (no open items) — nothing to dedup against; matches sec-deps-20260929 outcome.
- No new tickets filed. The only gap (`extract-zip` ×2 high) is a pre-existing accepted risk, not a new finding; a migration to an alternative zip lib would be new scope and is left to user/Orchestrator decision (could become a `dev-*` ticket if requested). Residual minimatch/ip-address/preload notes are documented above, per Reviewer's "non-blocking, no ticket" ruling.
- Step 0 triage at planning found no `doc/backlog/open/` items — consistent.

## Hygiene

- All structures fixed/updated in place; no `resolution-v2` or `_final` duplicates; no new folders under `doc/ai_doc/`.
- `git status --short` pre-commit: `M` `src/package.json`, `src/pnpm-lock.yaml`, `electron-wrapper/package.json`, `electron-wrapper/pnpm-lock.yaml`, `doc/ai_doc/workflow_current.md` + `??` plan/QA/resolution records. Untracked `doc/todo.txt`, `doc/tools.txt`, `issues/` are pre-existing 2024 files — untouched. `_site/` and `out/` regenerated but gitignored; no artifact leaks.
- `workflow_current.md` Step 5 marked complete (not cleared); `workflow_index.md` untouched (Orchestrator-owned, updated after user confirmation + archival). No git operations performed.

## Handoff note for marketing

This release closes all reported dependency vulnerabilities of medium severity or higher across the project's build tooling (`src/`) and its Electron desktop wrapper. The web build toolchain moved to vite 6.4.6, and the desktop wrapper moved from Electron 39 to the current Electron 42 runtime (42.11.18), with all transitive dependencies bumped to their patched versions. No application code, gameplay, or configuration behavior changed — this is a dependency-and-runtime maintenance release. The verification story is concrete: TypeScript compile, lint, production build, and packaging for the win32-x64 desktop binary all passed, the packaged binary was smoke-tested as launching cleanly, and both lockfiles were re-scanned to confirm no stale vulnerable versions remain. One known limitation carried over unchanged from the previous security cycle (September 2026): two dev-time-only packaging-tool advisories (extract-zip) have no upstream fix and are documented as an accepted risk with mitigations — the affected code path is build tooling, not the shipped application. Suitable framing for users: routine security maintenance; developers running the project locally should pull the updated lockfiles and re-run `pnpm install`; end users of the built game need no action. Avoid claims of "CVE-free" or "all vulnerabilities eliminated" — the extract-zip accepted risk must not be glossed over.

---

## Proposed commit message

```
fix(deps): bump vite to >=6.4.4 and electron 39→42; patch transitive vulns via pnpm overrides

src/: vite ^6.4.3 → ^6.4.4 (resolves 6.4.6); override brace-expansion@1 ^1.1.21,
brace-expansion@5 ^5.0.12, source-map-js >=1.2.2, minimatch@10 ^11.0.1.
Closes all 19 src audit findings (0 remain).

electron-wrapper/: electron ^39.8.5 → ^42.11.16 (major bump, resolves 42.11.18);
override fast-uri ^3.1.9 (narrowed to 3.x, replaces 3.1.6 pin), ip-address >=10.7.4,
brace-expansion@1 ^1.1.21, brace-expansion@2 ^2.1.7, minimatch@9 ^11.0.1.
Closes all audit findings except extract-zip ×2 high (no upstream fix; accepted risk
carried forward from sec-deps-20260929, dev-time chain only).

Lockfiles regenerated (pnpm install); multi-major override scope preserved
(brace-expansion 1.1.21/2.1.7/5.0.12 tracks; minimatch 3.1.5/5.1.9/11.0.5 tracks;
@electron/asar minimatch 3.1.5 untouched). Gates: src tsc/build/lint exit 0;
ew pnpm run package exit 0 ×2, packaged binary 42.11.18 smoke-alive 10 s.
Audit: src 0 findings; ew 2 accepted extract-zip highs only.
Records: doc/ai_doc/records/issue-sec-deps-20261110-{plan,resolution}.md,
qa-report-sec-deps-20261110.md. Resolves: sec-deps-20261110.
```
