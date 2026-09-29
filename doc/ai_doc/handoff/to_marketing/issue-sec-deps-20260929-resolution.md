# Resolution — sec-deps-20260929: Fix vulnerable transitive deps

**Issue:** GitHub bot reported vulnerabilities in `pnpm-lock.yaml`: `extract-zip <=2.0.1`, `@xmldom/xmldom 0.9.0-0.9.11 -> 0.9.12`, `fast-uri 3.1.3-<3.1.6 -> 3.1.6`, `js-yaml >=4.0.0 <4.3.2 -> 4.3.2`
**Iteration:** 1
**Date:** 2026-09-29
**Mode:** A Single-Department (dev only, no PRD)
**Status:** Complete — 3/4 fixed, 1 accepted risk

## What changed
- `src/package.json`: added `pnpm.overrides: { "js-yaml": "4.3.2" }`
- `src/pnpm-lock.yaml`: `js-yaml@4.3.1 -> 4.3.2` (via `@eslint/eslintrc`), `overrides: js-yaml: 4.3.2` header
- `electron-wrapper/package.json`: extended `pnpm.overrides` with `"@xmldom/xmldom": "0.9.12"`, `"fast-uri": "3.1.6"` (preserved `tmp`, `tar`, `lodash`, `@tootallnate/once`)
- `electron-wrapper/pnpm-lock.yaml`: `@xmldom/xmldom@0.9.11 -> 0.9.12` (via `plist@3.1.1`), `fast-uri@3.1.5 -> 3.1.6` (via `ajv@8.20.0`), overrides header updated; `extract-zip@2.0.1` unchanged (no fix exists)
- All transitive, no direct dep bumps. `git diff --stat: 4 files, 25 insertions, 13 deletions`.

## Verification
- `src`: `pnpm install` clean, `npx tsc --noEmit` exit 0, `pnpm build` (`tsc && vite build`) `✓ built in 7.91s`, `pnpm lint` exit 0
- `electron-wrapper`: `pnpm install` clean (`Lockfile up to date`, `Packages: +27 -18`), exit 0
- Grep: `js-yaml@4.3.2` present, `4.3.1` count 0; `@xmldom@0.9.12` + `fast-uri@3.1.6` present, old counts 0
- Full QA: `doc/ai_doc/records/qa-report-sec-deps-20260929.md`
- Review: APPROVED, no polish needed (<20 lines/file)

## Known remaining risk
- `extract-zip@2.0.1` (via `@electron/packager@18.4.4`, `electron@39.8.10`): `npm view` latest = `2.0.1`; GHSA CVE-2026-19693 / CVE-2026-56876 `Patched: None`; upstream unresponsive; RedHat: no patch. Mitigation: dev-time only (electron packaging), never extracts untrusted archives in app runtime. No fake-upgrade applied. Re-evaluate if upstream publishes fix or migration to `adm-zip`/`yauzl` is scoped.

## Records
- Plan: `doc/ai_doc/records/issue-sec-deps-20260929-plan.md`
- QA: `doc/ai_doc/records/qa-report-sec-deps-20260929.md`
- Resolution (this file): `doc/ai_doc/records/issue-sec-deps-20260929-resolution.md`
- Handoff copy: `doc/ai_doc/handoff/to_marketing/issue-sec-deps-20260929-resolution.md`

## Backlog
- Step 0 triage: `doc/backlog/open/` missing / no files — no dedup/promote needed.
- No new `dev-*` ticket filed (extract-zip migration would be new scope; mention here for future if desired).

## Hygiene
- Fixed structures only, update-in-place, no `_v2/_final` duplicates, no new folders under `doc/ai_doc/`.
- `git status --short` pre-commit: `M` x4 (above) + `?? doc/` + `?? issues/` (pre-existing untracked).
