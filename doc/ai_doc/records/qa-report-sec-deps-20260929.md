# QA Report — sec-deps-20260929

**Plan:** `doc/ai_doc/records/issue-sec-deps-20260929-plan.md`
**Date:** 2026-09-29 (QA, Iteration 1)
**Scope:** Verify minimal safe upgrades for js-yaml, @xmldom/xmldom, fast-uri; confirm extract-zip unpatchable; no breaking changes.

## Commands & Outputs

### Q1 — src/: install + typecheck + build + lint
- `pnpm install --lockfile-only` (src): Done in 54.6s, pnpm v10.33.0 — lock regenerated.
- `pnpm install` (src): `Lockfile is up to date`, `Packages: +2 -1`, Done in 3.9s — clean.
- `npx tsc --noEmit` (src): exit 0, no output — PASS.
- `pnpm build` (src: `tsc && vite build`): `✓ 34 modules transformed`, `✓ built in 7.91s`, `../_site/index.html 2.96 kB`, `assets/index-Dh36wwVV.js 1518.97 kB`, `[vite-plugin-static-copy] Copied 4 items` — PASS (warnings only: chunk >500kB, fonts referenced at runtime — pre-existing).
- `pnpm lint` (src: `eslint eslint.config.js`): exit 0, no findings — PASS.

### Q2 — electron-wrapper/: install clean
- `pnpm install --lockfile-only` (electron-wrapper): Done in 46.5s, `WARN 9 deprecated subdependencies` (pre-existing: @npmcli/move-file, glob, rimraf, etc.) — no new errors.
- `pnpm install` (electron-wrapper): `Lockfile is up to date`, `Packages: +27 -18`, Done in 8.5s, exit 0 — PASS.

### Q3 — Lockfile grep (fixed versions present, old gone)
- `src/pnpm-lock.yaml`:
  - `js-yaml@4.3.2:` at lines 883, 1803 — PRESENT
  - `js-yaml@4.3.1` count = 0 — GONE
  - `overrides: js-yaml: 4.3.2` at line 7-8 — PRESENT
- `electron-wrapper/pnpm-lock.yaml`:
  - `'@xmldom/xmldom@0.9.12':` at 400,2606 — PRESENT
  - `fast-uri@3.1.6:` at 824,3060 — PRESENT
  - `extract-zip@2.0.1:` at 812,3040 — UNCHANGED (expected, no patch available)
  - `@xmldom/xmldom@0.9.11` / `fast-uri@3.1.5` count = 0 — GONE
  - `overrides:` includes `tmp, tar, lodash, @tootallnate/once` (preserved) + `@xmldom/xmldom: 0.9.12, fast-uri: 3.1.6` — PRESENT

### Q4 — Diff hygiene
- `git diff --stat`: `4 files changed, 25 insertions(+), 13 deletions(-)`:
  - `electron-wrapper/package.json | 4 +++-`
  - `electron-wrapper/pnpm-lock.yaml | 18 ++++++++--`
  - `src/package.json | 5 +++++`
  - `src/pnpm-lock.yaml | 11 ++++++---`
- `git status --short`: `M` x4 above + `?? doc/` + `?? issues/` (both untracked pre-existing; `doc/` includes new `ai_doc/` state files). No other modified files.

## Verdict
- [x] Q1 PASS
- [x] Q2 PASS
- [x] Q3 PASS (3/4 vulns fixed; extract-zip documented as unfixable)
- [x] Q4 PASS
- **Overall:** PASS — ready for Review. No blocker. No scope expansion.

## Notes for Reviewer
- Overrides are minimal (`4.3.2`, `0.9.12`, `3.1.6` exact pins, matching advisories `~>0.9.12`, `~>3.1.6`, `~>4.3.2`).
- `extract-zip@2.0.1` latest = 2.0.1 per `npm view`; GHSA `Patched: None`; RedHat confirms no patch; usage is dev-time only (`@electron/packager`, `electron`) — accepted risk.
- No `knowledge/` lookup needed (security fix, no branding).
