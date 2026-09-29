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
