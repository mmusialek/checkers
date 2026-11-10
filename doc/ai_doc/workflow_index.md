# Workflow Index — Global Registry (append-only)

> Append-only ledger grouped by issue. Never overwrite/delete. Orchestrator owns this file.

---

## sec-deps-20260929 — Fix GitHub-reported vulnerable transitive deps (extract-zip, @xmldom/xmldom, fast-uri, js-yaml)
- **Date:** 2026-09-29 | **Iteration:** 1 | **Status:** Complete (3/4 fixed, 1 accepted risk)
- **Description:** GitHub bot reported vulnerabilities in `pnpm-lock.yaml`: `extract-zip <=2.0.1` (no patch, accepted risk), `@xmldom/xmldom 0.9.0-0.9.11 -> 0.9.12`, `fast-uri 3.1.3-<3.1.6 -> 3.1.6`, `js-yaml >=4.0.0 <4.3.2 -> 4.3.2`. Fixed via `pnpm.overrides` + lockfile regen (4 files, 25 insertions, 13 deletions).
- **Records:**
  - Plan: `doc/ai_doc/records/issue-sec-deps-20260929-plan.md`
  - QA: `doc/ai_doc/records/qa-report-sec-deps-20260929.md`
  - Resolution: `doc/ai_doc/records/issue-sec-deps-20260929-resolution.md`
  - Handoff: `doc/ai_doc/handoff/to_marketing/issue-sec-deps-20260929-resolution.md`
- **Source:** User raw prompt (Mode A Single-Department, dev only; no PRD; no backlog ticket — Step 0 triage found no `doc/backlog/open/` folder/files)

## sec-deps-20261110 — Dependency audit update: all >= medium severity in src/ and electron-wrapper/
- **Date:** 2026-11-10 | **Iteration:** 1 | **Status:** Complete (user confirmed Yes)
- **Description:** `pnpm audit` (both projects use pnpm, not npm). `src`: 13 vulns → 0 (vite ^6.4.3→^6.4.4 → resolves 6.4.6; overrides `brace-expansion@1 ^1.1.21`, `brace-expansion@5 ^5.0.12`, `source-map-js >=1.2.2`, `minimatch@10 ^11.0.1`). `electron-wrapper`: 33 vulns → 2 accepted (`electron ^39.8.5→^42.11.16` major bump → resolves 42.11.18; overrides `fast-uri ^3.1.9` (narrowed from >=3.1.9 by Reviewer, replaces 3.1.6 pin), `ip-address >=10.7.4`, `brace-expansion@1 ^1.1.21`, `brace-expansion@2 ^2.1.7`, `minimatch@9 ^11.0.1`). Per-major override selectors preserved multi-major tracks (brace-expansion 1.1.21/2.1.7/5.0.12; minimatch 3.1.5/5.1.9/11.0.5, @electron/asar chain untouched). Gates green: src tsc/build/lint exit 0; ew `pnpm run package` exit 0 ×2 + 10 s binary smoke, app.asar regenerated. Remaining: `extract-zip` ×2 high (no upstream patch; accepted risk carried from sec-deps-20260929; dev-time packaging only).
- **Records:**
  - Plan: `doc/ai_doc/records/issue-sec-deps-20261110-plan.md`
  - QA: `doc/ai_doc/records/qa-report-sec-deps-20261110.md` (PASS)
  - Resolution: `doc/ai_doc/records/issue-sec-deps-20261110-resolution.md`
  - Handoff: `doc/ai_doc/handoff/to_marketing/issue-sec-deps-20261110-resolution.md`
- **Source:** User raw prompt (Mode A Single-Department, dev only; no PRD; no backlog ticket — Step 0 triage found 0 open `dev-*` files, no duplicates)
