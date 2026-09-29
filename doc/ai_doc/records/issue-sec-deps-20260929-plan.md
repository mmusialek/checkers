# Plan — sec-deps-20260929: Fix vulnerable transitive deps

**Source:** User raw prompt (GitHub bot email: extract-zip <=2.0.1, @xmldom/xmldom 0.9.0-0.9.11 -> 0.9.12, fast-uri 3.1.3-<3.1.6 -> 3.1.6, js-yaml >=4.0.0 <4.3.2 -> 4.3.2)
**Created:** 2026-09-29 (Architect, Iteration 1)
**Status:** Implemented by Developer 2026-09-29 — ready for QA
**Targets:** `src/package.json`, `src/pnpm-lock.yaml`, `electron-wrapper/package.json`, `electron-wrapper/pnpm-lock.yaml`

## 1. Findings (direct vs transitive)

Verified via `Select-String` on both lockfiles + `npm view <pkg> versions`:

- [x] F1 — `src/pnpm-lock.yaml`: `js-yaml@4.3.1` (vulnerable, needs `4.3.2`)
  - Direct? No. `src/package.json` has no `js-yaml`. Transitive via `@eslint/eslintrc@3.3.6 -> js-yaml: 4.3.1`.
  - Fix available: `4.3.2` exists (also `5.x` exists but breaking; stay on `4.3.2` minimal).
  - Strategy: add `pnpm.overrides: { "js-yaml": "4.3.2" }` to `src/package.json`, regen lock.
- [x] F2 — `electron-wrapper/pnpm-lock.yaml`: `@xmldom/xmldom@0.9.11` (needs `~0.9.12`)
  - Direct? No. Transitive via `plist@3.1.1 -> @xmldom/xmldom: 0.9.11` (used by `@electron/packager`, `@electron/windows-sign`, etc.).
  - Fix available: `0.9.12` exists, confirmed patched for CVE-2026-83617/83618/83613/83614/83608 (+ related GHSA).
  - Strategy: add `pnpm.overrides: { "@xmldom/xmldom": "0.9.12" }` (merge with existing overrides), regen lock.
- [x] F3 — `electron-wrapper/pnpm-lock.yaml`: `fast-uri@3.1.5` (needs `~>3.1.6`)
  - Direct? No. Transitive via `ajv@8.20.0 -> fast-uri: 3.1.5`.
  - Fix available: `3.1.6` (also `3.1.7/3.1.8/4.x` exist; use minimal `3.1.6` per advisory `~>3.1.6`).
  - Strategy: add `pnpm.overrides: { "fast-uri": "3.1.6" }`, regen lock.
- [x] F4 — `electron-wrapper/pnpm-lock.yaml` + `src`? `extract-zip@2.0.1` (<=2.0.1 vulnerable)
  - Direct? No. Transitive via `@electron/packager@18.4.4 -> extract-zip: 2.0.1` and `electron@39.8.10 -> extract-zip: 2.0.1`.
  - Fix available: **None**. `npm view extract-zip versions` latest = `2.0.1`. GHSA CVE-2026-19693 / CVE-2026-56876 state `Patched versions: None`, upstream unresponsive 4+ years. RedHat: "No patch available".
  - Strategy: **Do NOT fake-upgrade.** Document as accepted risk + mitigation (dev-time only, no untrusted archives; used by electron packaging). Optionally file follow-up `dev-*` ticket if sandbox/alternative (adm-zip/yauzl) migration desired — out of scope for minimal fix. No lock change expected.

## 2. Implementation steps (Developer)

- [x] D1 — `src/package.json`: add `pnpm.overrides.js-yaml = "4.3.2"` (preserve existing fields, no dep version bumps).
- [x] D2 — `electron-wrapper/package.json`: extend existing `pnpm.overrides` with `"@xmldom/xmldom": "0.9.12"` and `"fast-uri": "3.1.6"` (keep `tmp`, `tar`, `lodash`, `@tootallnate/once`).
- [x] D3 — Regen: `pnpm install --lockfile-only` (or `pnpm install`) in `src/` then `electron-wrapper/`; verify `pnpm-lock.yaml` shows `js-yaml@4.3.2`, `@xmldom/xmldom@0.9.12`, `fast-uri@3.1.6`, `extract-zip@2.0.1` unchanged.
- [x] D4 — Verify no direct breaking changes: `git diff --stat`, `git status --short` shows only intended `package.json` + `pnpm-lock.yaml` (+ state files).
- [x] D5 — Tick checkboxes in this plan file in place (read then edit, no `_v2` duplicates).

## 3. Test plan (QA)

- [x] Q1 — `src/`: `pnpm install` clean, `npx tsc --noEmit` or `pnpm build` (tsc + vite build), `pnpm lint` if available.
- [x] Q2 — `electron-wrapper/`: `pnpm install` clean (check overrides applied, no peer errors beyond baseline).
- [x] Q3 — Grep lockfiles to confirm fixed versions + no regressions: `Select-String` for `js-yaml@4.3.2`, `@xmldom/xmldom@0.9.12`, `fast-uri@3.1.6`.
- [x] Q4 — Generate `doc/ai_doc/records/qa-report-sec-deps-20260929.md` with commands + outputs.
- [x] Q5 — If build fails due to overrides, report blocker, do not widen scope. (No blocker — all PASS)

## 4. Review / Finalize notes

- Reviewer: small patches only (<20 lines/file). If override causes major breakage, report blocker.
- Finalize: generate `issue-sec-deps-20260929-resolution.md` + copy to `doc/ai_doc/handoff/to_marketing/`, mark Step 5 complete.
- Hygiene: fixed structures only (`doc/ai_doc/workflow_current.md`, `workflow_index.md`, `records/`, `handoff/`). No new folders, no `*_v2/*_final` duplicates. Update in place. Delete-don't-deprecate. `git status --short` final check. No `knowledge/` needed for security fix.

## 5. Acceptance

- [x] `src/pnpm-lock.yaml` contains `js-yaml@4.3.2`, no `4.3.1`
- [x] `electron-wrapper/pnpm-lock.yaml` contains `@xmldom/xmldom@0.9.12`, `fast-uri@3.1.6`
- [x] `extract-zip` documented as unpatchable (no fake version)
- [x] Builds/tests pass (or baseline parity)
- [ ] `git status --short` clean except intended files

## Links
- NVD CVE-2026-19693 / CVE-2026-56876 (extract-zip, no patch)
- xmldom GHSA-jxjr-3g7g-3944 / CVE-2026-83617/83618 (fixed 0.9.12)
- npm registry version lists (verified 2026-09-29 via `npm view`)
