# QA Report — sec-deps-20261110

**Plan:** `doc/ai_doc/records/issue-sec-deps-20261110-plan.md`
**Date:** 2026-11-10 (QA, Iteration 1)
**Scope:** Independent re-verification of dependency security updates in `src/` (vite bump + overrides) and `electron-wrapper/` (electron 39→42 + overrides). No src code changes reviewed.
**Environment:** Windows 11 / PowerShell, pnpm 10.33.0, Node v25.9.0.

## Audit gate (Q3)

| Project | critical | high | moderate | low | info | Exit | Verdict |
|---|---|---|---|---|---|---|---|
| `src/` | 0 | 0 | 0 | 0 | 0 | 0 (`--audit-level=low` → "No known vulnerabilities found") | **PASS** |
| `electron-wrapper/` | 0 | 2 | 0 | 0 | 0 | 1 (expected) | **PASS** (exception only) |

`electron-wrapper/` remaining highs — both `extract-zip <=2.0.1`, `patched: <0.0.0` (no upstream fix), path `@electron-forge/cli > @electron-forge/core > @electron/packager > extract-zip`:
- GHSA-jmr9-qjv8-65gv (unvalidated symlink path traversal)
- GHSA-7pqw-9j4j-h8q3 (arbitrary file writes via symlink archive entries)

Both are the documented accepted risk from `sec-deps-20260929` (dev-time packaging tool only). Not a regression, not a new finding. **No moderate/low anywhere** in either project.

## Lockfile sanity (Q4/Q5)

`src/pnpm-lock.yaml` — overrides header: `js-yaml 4.3.2`, `brace-expansion@1 ^1.1.21`, `brace-expansion@5 ^5.0.12`, `source-map-js >=1.2.2`, `minimatch@10 ^11.0.1`.

| Track | Resolved | Patched floor | Verdict |
|---|---|---|---|
| vite | 6.4.6 | >=6.4.4 | PASS |
| source-map-js (via postcss 8.5.26) | 1.2.2 | >=1.2.2 | PASS |
| brace-expansion 1.x (eslint → minimatch 3.1.5) | 1.1.21 | >=1.1.21 | PASS |
| brace-expansion 5.x (typescript-eslint → minimatch 11.0.5) | 5.0.12 | >=5.0.12 | PASS |
| minimatch (typescript-estree edge) | 11.0.5 | >=11.0.1 | PASS |

`electron-wrapper/pnpm-lock.yaml` — overrides header: `tmp ^0.2.4`, `tar >=7.5.11`, `lodash >=4.18.1`, `@tootallnate/once >=3.0.1`, `@xmldom/xmldom 0.9.12`, `fast-uri >=3.1.9`, `ip-address >=10.7.4`, `brace-expansion@1 ^1.1.21`, `brace-expansion@2 ^2.1.7`, `minimatch@9 ^11.0.1`.

| Track | Resolved | Patched floor | Verdict |
|---|---|---|---|
| electron | 42.11.18 | >=42.11.16 | PASS |
| fast-uri (via ajv 8.20.0) | 4.2.3 | >=3.1.9 | PASS (see risk R1) |
| ip-address (via socks chain) | 10.7.6 | >=10.7.4 | PASS |
| brace-expansion 1.1.21 (minimatch 3.1.5: @electron/asar, dir-compare, glob@7) | 1.1.21 | >=1.1.21 | PASS |
| brace-expansion 2.1.7 (minimatch 5.1.9: glob@8) | 2.1.7 | >=2.1.7 | PASS |
| brace-expansion 5.0.12 (minimatch 11.0.5: @electron/universal) | 5.0.12 | >=5.0.12 | PASS |

**Multi-major integrity (Q5):** PASS — three distinct patched brace-expansion tracks (1.1.21 / 2.1.7 / 5.0.12) and three minimatch tracks (3.1.5 / 5.1.9 / 11.0.5) coexist; no blanket single-version override. `@electron/asar` chain deliberately untouched at minimatch 3.1.5. `src/` keeps eslint on minimatch 3.1.5.

**Stale vulnerable versions:** regex scan for `vite@6.4.[0-3]`, `fast-uri@3.1.6`, `ip-address@10.7.[0-3]`, `electron@39.`, `brace-expansion@1.1.1x/1.1.20`, `brace-expansion@2.0.` → **0 hits** in both lockfiles.

**Consumer compatibility probe (deviation check):** `require('fast-uri')` (4.2.3) exposes `parse/resolve/serialize/normalize/equal`; `ajv@8.20.0` compile+validate round-trip OK. `typescript-eslint` config API loads OK against minimatch 11.0.5.

## Functional gates (Q1/Q2) — executed independently

`src/`:
- `pnpm install --frozen-lockfile` → exit 0, `Lockfile is up to date`, `Already up to date`, 443ms. (Pre-existing warning: ignored build script `esbuild@0.28.2`.)
- `npx tsc --noEmit` → exit 0, no output.
- `pnpm lint` → exit 0, no findings.
- `pnpm build` → exit 0; `vite v6.4.6`, `✓ 34 modules transformed`, `✓ built in 5.16s`, `../_site/index.html 2.96 kB`, `assets/index-Dh36wwVV.js 1,518.97 kB`, `[vite-plugin-static-copy] Copied 4 items`. Warnings only (chunk >500 kB, runtime font refs) — pre-existing baseline.

`electron-wrapper/` (stale `out/` removed first for a genuine regeneration test):
- `pnpm install` → exit 0, `Lockfile is up to date`, `Packages: +24 -18`.
- `pnpm install --frozen-lockfile` → exit 0 (lockfile consistent).
- `pnpm run package` → **exit 0** (run #1, 6.9s): system check, `Found pnpm@10.33.0`, packaging hooks, `✔ Copying files / Preparing native dependencies / Finalizing package`, `✔ Packaging for x64 on win32`.
- `pnpm run package` re-run after frozen install → **exit 0**, identical `app.asar` size (1,925,374 bytes) → reproducible.
- Artifacts: `out/la-checkers-2d-win32-x64/resources/app.asar` regenerated (new mtime/size vs pre-QA 1,925,059), `out/.../version` = `42.11.18`, full DLL/pak payload present.

## Runtime smoke (Q6)

- `electron-wrapper/node_modules/electron/dist/version` → `42.11.18`; `require('electron/package.json').version` → `42.11.18` (postinstall binary actually downloaded, not just lockfile).
- `npx electron-forge --help` loads CLI/forge config successfully (all commands listed); forge config also proven by two successful package runs (fuses + auto-unpack-natives plugins executed).
- Packaged binary smoke: `out/la-checkers-2d-win32-x64/la-checkers-2d.exe` launched, alive after 10 s, killed cleanly (`RUNNING pid=…`). No crash-on-start (window not visually inspected — headless constraint).

## Regression watch

- `_site/index.html` references `assets/index-Dh36wwVV.js` + `assets/index-C0syrtNE.css`, both present (mtime 12:29:54). JS bundle hash unchanged vs prior cycle — expected, since no app source changed; reference/output pair is consistent.
- `_site/*` and `out/` are gitignored; no build artifacts leak into the diff.

## Git hygiene

`git status --short`:
- Modified (expected): `src/package.json`, `src/pnpm-lock.yaml`, `electron-wrapper/package.json`, `electron-wrapper/pnpm-lock.yaml`, `doc/ai_doc/workflow_current.md`.
- Untracked (expected): `doc/ai_doc/records/issue-sec-deps-20261110-plan.md`, `doc/ai_doc/records/qa-report-sec-deps-20261110.md`.
- Untracked **pre-existing noise** (not from this issue — file mtimes 2024): `doc/todo.txt` (2024-07-02), `doc/tools.txt` (2024-09-28), `issues/luk_0001.png` (2024-07-02). Flagged for awareness only; left untouched.
- `git diff --stat`: 5 files, 162 insertions / 82 deletions — no app source changes. PASS.

## Gaps / Risks

- **R1 (residual, non-blocking):** `fast-uri` override key is `>=3.1.9` and resolves **4.2.3**, a cross-major jump forced onto `ajv@8.20.0` (declares `^3.0.1`). Plan §Step 6 intended min `3.1.9`; issue text anticipated 4.2.3. Runtime API + ajv validated by QA, so no functional break observed. If Reviewer prefers the narrowest fix, pin `"fast-uri": "3.1.9"` (no audit change either way). Not filed as a ticket: it is inside this issue's scope and currently green.
- **R2:** `extract-zip` 2 high remain — accepted risk per `sec-deps-20260929`; dev-time only, no upstream patch. Carry forward in resolution doc.
- **R3:** Runtime smoke is process-liveness only (no GPU/window/input automation on Windows CI). Forge `package` + electron binary version + successful bootstrap is the accepted proxy per plan Q6.
- Cosmetic (Reviewer scope, not blocking): `src/package.json` has two mis-indented devDependency keys and no trailing newline — pre-existing/untouched semantics.

## Verdict

- [x] Audit `src/` = 0 findings — PASS
- [x] Audit `electron-wrapper/` = 2 extract-zip highs only (accepted exception), 0 moderate/low — PASS
- [x] Lockfile versions + no stale vulnerable pins — PASS
- [x] Multi-major integrity (no collapsed majors) — PASS
- [x] `src/`: install/tsc/build/lint — PASS
- [x] `electron-wrapper/`: install + package (×2, artifacts regenerate) — PASS
- [x] Runtime smoke + git hygiene — PASS

**Overall: PASS** — ready for Review. No blocker; no src defects found; no scope expansion.
