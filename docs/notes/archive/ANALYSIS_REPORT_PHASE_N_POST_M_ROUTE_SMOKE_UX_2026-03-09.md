# Analysis Report - Phase N Post-M Route Smoke and UX Regression (2026-03-09)

## Scope
- Verification target: Phase M implementation commits (`cd72c37` -> `3b8c1bb`).
- Role: analyst-only verification (no product implementation in this phase).
- Focus:
  - route-level smoke after new page rollout
  - lint/type/build integrity
  - UX discoverability of new routes
  - growth readiness for next iteration

## Validation Matrix (Analyst Run)
- `cmd /c npm --prefix platform run lint` -> **FAIL**
- `cmd /c npm --prefix platform run type-check` -> **FAIL**
- `cmd /c npm --prefix platform test -- --runInBand` -> **PASS** (`4 suites / 32 tests`, known `act(...)` warnings)
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> **FAIL**
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> **FAIL**
- `cmd /c npm --prefix platform run i18n:check` -> **PASS**
- `python -m pytest backend/tests -q` -> **PASS** (`20 passed`)
- `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> **PASS** (all tests green, coverage report produced)

## P0 Findings (Blocking)

1. New page rollout broke lint/build gate.
- Evidence: `platform/pages/creator-studio/index.tsx:60` uses raw `<a href="/">` and violates `@next/next/no-html-link-for-pages`.
- Impact: both server and static build fail because Next build runs lint first.

2. TypeScript alias contract broken for new catalog integration.
- Evidence: imports in `platform/components/Home/ProjectsSection.tsx:27`, `platform/hooks/useSearch.ts:10`, `platform/pages/search.tsx:9` use `@/config/product-catalog`.
- Evidence: `platform/tsconfig.json:22`-`platform/tsconfig.json:30` has no `@/config/*` path mapping.
- Impact: `Cannot find module '@/config/product-catalog'` blocks type-check.

3. Locale schema and page usage drift (creator-studio + analysis-history).
- Evidence: `platform/pages/creator-studio/index.tsx:13`-`platform/pages/creator-studio/index.tsx:15` expects `desc` and `features.layers`, but locale defines `description` and `features.multitrack` (`platform/locales/en.json:1012`-`platform/locales/en.json:1014`, `platform/locales/tr.json:1012`-`platform/locales/tr.json:1014`).
- Evidence: `platform/pages/creator-studio/index.tsx:58` and `platform/pages/creator-studio/index.tsx:61` read `comingSoonNote` and `backHome`, but locale has `comingSoon` and `comingSoonDesc` only (`platform/locales/en.json:1009`-`platform/locales/en.json:1010`).
- Evidence: `platform/pages/analysis-history/index.tsx:48` and `platform/pages/analysis-history/index.tsx:72` read `clearBtn` and `empty`, but locale has `delete`, `noHistory`, `noHistoryDesc` (`platform/locales/en.json:1026`-`platform/locales/en.json:1030`).
- Impact: type-check red + fallback leakage risk.

4. Crown Dreams button contract broken by unsupported prop.
- Evidence: `platform/pages/crown-dreams/index.tsx:144` and `platform/pages/crown-dreams/index.tsx:147` pass `title="Demo mode"` into `CyberButton`.
- Evidence: `platform/components/CrownDreams/CyberButton.tsx:7` has no `title` prop.
- Impact: type-check blocks release.

## P1 Findings (High)

1. New pages are not discoverable from platform IA.
- Evidence: route usage scan shows `/creator-studio`, `/analysis-history`, `/system-status` only in their own page files.
- Evidence: search static items are limited to home/projects/url-analysis/data-augmentation (`platform/hooks/useSearch.ts:42`, `platform/hooks/useSearch.ts:48`, `platform/hooks/useSearch.ts:54`, `platform/hooks/useSearch.ts:61`).
- Evidence: `/search` content set still only catalog + home card (`platform/pages/search.tsx:29`-`platform/pages/search.tsx:46`).
- Impact: features exist but are effectively hidden unless user knows direct URL.

2. Smoke test suite does not cover newly added routes.
- Evidence: `platform/__tests__/pages/smoke.test.tsx:78`, `platform/__tests__/pages/smoke.test.tsx:92`, `platform/__tests__/pages/smoke.test.tsx:106` only validate Home, Crown Commend, Search.
- Impact: phase-level regressions on new pages escaped despite green Jest suite.

3. Commit quality protocol drift.
- Evidence: recent commit history includes multiple non-descriptive messages (`db1c215`, `183391f`, `ff5acde`, `4e719e1`, `c62e63f`, `cb49ca7`, `e709951`, `d5bfeaf` all `"a"`).
- Impact: auditability and rollback clarity degraded.

## P2 Findings (Optimization / Growth)

1. Catalog model does not yet include product maturity/discoverability metadata.
- Current `ProductEntry` has id/route/icon/category only (`platform/config/product-catalog.ts`).
- Recommendation: add fields like `availability: 'active' | 'beta' | 'coming_soon'`, `showInNav`, `showInSearch`, `showOnHome`.

2. System Status page is useful but still MVP-level for operations.
- Current page checks endpoints and latency once + manual refresh (`platform/pages/system-status/index.tsx`).
- Recommendation: add auto-refresh interval toggle, last-success timestamp, error reason badge, and uptime trend sparkline.

3. i18n type safety is runtime-oriented, not compile-time.
- Recommendation: introduce typed locale contract generation (`as const` locale schema -> inferred types) so key drift (`desc` vs `description`) fails at development time before commits.

## Git Ignore Audit (This Phase)
- `git status --short` shows only expected tracked docs/locales changes.
- No new generated artifact tracked in this pass.
- No mandatory `.gitignore` addition detected for this phase.

## Claude Action Pack (Implementation Order)

1. P0 - Restore green quality gates.
- Add `@/config/*` path alias in `platform/tsconfig.json`.
- Fix `creator-studio` key mapping to locale schema:
  - `desc` -> `description`
  - `layers` -> `multitrack`
  - use existing keys (`comingSoon`, `comingSoonDesc`) and add/consume a single canonical back link key.
- Replace raw `<a>` with `<Link>` in `platform/pages/creator-studio/index.tsx`.
- Fix `analysis-history` key usage (`clearBtn`/`empty` -> canonical locale keys or add keys with parity).
- Resolve `CyberButton` prop mismatch:
  - either add optional `title?: string` to `CyberButtonProps`
  - or remove `title` usage and use `aria-label` + visible demo hint.

2. P1 - Discoverability and route smoke.
- Add the 3 new routes to at least one user path:
  - global search source (`useSearch`)
  - `/search` content list
  - optional footer/nav beta group.
- Expand `platform/__tests__/pages/smoke.test.tsx` with:
  - `/creator-studio`
  - `/analysis-history`
  - `/system-status`

3. P1 - Process hygiene.
- Replace generic commit messages with conventional messages for remaining pending changes.
- Ensure analyst gate rerun happens after final code commit before marking plan items `[x]`.

## Re-Validation Required After Claude
- `cmd /c npm --prefix platform run lint`
- `cmd /c npm --prefix platform run type-check`
- `cmd /c npm --prefix platform test -- --runInBand`
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`
- `cmd /c npm --prefix platform run i18n:check`
- `python -m pytest backend/tests -q`
- `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1`

## Ready Message for Claude
```md
Faz N uygulama turu basliyor. Referans rapor:
- `docs/notes/ANALYSIS_REPORT_PHASE_N_POST_M_ROUTE_SMOKE_UX_2026-03-09.md`

Once P0 gate-fix yap:
1) `platform/tsconfig.json` icine `@/config/*` path alias ekle.
2) `platform/pages/creator-studio/index.tsx`:
   - `desc` -> `description`
   - `layers` -> `multitrack`
   - locale key uyusmazliklarini duzelt
   - `<a href="/">` yerine `next/link` kullan
3) `platform/pages/analysis-history/index.tsx` locale key uyumsuzluklarini duzelt (`clearBtn`, `empty`).
4) `platform/pages/crown-dreams/index.tsx` ile `CyberButton` prop sozlesmesini uyumlu hale getir (`title` mismatch).

Sonra P1:
5) Yeni sayfalari kesfedilebilir yap (`useSearch`, `/search`, gerekirse nav/footer beta alanı).
6) `platform/__tests__/pages/smoke.test.tsx` icine 3 yeni route smoke test ekle.

Zorunlu dogrulama:
- `cmd /c npm --prefix platform run lint`
- `cmd /c npm --prefix platform run type-check`
- `cmd /c npm --prefix platform test -- --runInBand`
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`
- `cmd /c npm --prefix platform run i18n:check`
- `python -m pytest backend/tests -q`
- `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1`

Teslimde dosya bazli ozet + komut sonucunu kisa log olarak yaz.
```
