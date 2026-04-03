# Analysis Report - Phase I Post-H Verification (2026-03-07)

## Scope
- Verification target: root commit `ebd89d8` + hf backend repo latest (`be8f2ab`).
- Role: analyst-only validation (no product feature implementation in this pass).
- Focus: claimed Phase H completion vs real quality-gate status.

## Validation Matrix (Analyst Run)
- `cmd /c npm --prefix platform run lint` -> **FAIL**
- `cmd /c npm --prefix platform run type-check` -> **PASS**
- `cmd /c npm --prefix platform test -- --runInBand` -> **FAIL**
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> **FAIL**
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> **FAIL**
- `python -m pytest backend/tests -q` -> **PASS** (`20 passed`)
- `python -m pytest hf-crowncode-backend/tests -q` -> **PASS** (`22 passed`, coverage ~47%)

## P0 Findings (Blocking)

1. Lint/build regression in telemetry handlers.
- Evidence: `platform/pages/api/vitals.ts:13`, `platform/pages/api/errors.ts:12`.
- Root cause: single-line `if` statements violate enforced `curly` rule.
- Impact: both server/static build fail because Next build runs lint.

2. Telemetry API tests break on undefined request metadata.
- Evidence: `platform/pages/api/vitals.ts:36`, `platform/pages/api/errors.ts:30` read `req.headers[...]` directly.
- Evidence: test mocks do not define `headers`/`socket` (`platform/__tests__/api/telemetry.test.ts:5`-`platform/__tests__/api/telemetry.test.ts:8`).
- Impact: runtime safety is weaker in non-standard request contexts; test suite fails.

3. Accessibility test regression caused by module reset strategy.
- Evidence: `platform/__tests__/a11y/accessibility.test.tsx:103`-`platform/__tests__/a11y/accessibility.test.tsx:106` uses `jest.resetModules()`.
- Evidence: `platform/__tests__/a11y/accessibility.test.tsx:116` uses `jest.doMock` + dynamic import flow.
- Impact: duplicate React/module instance scenario -> invalid hook call (`useContext`/`useState`), suite fails.

## P1 Findings (High)

1. New Commend error taxonomy keys are not localized in locale payload.
- Evidence (hook expects keys): `platform/hooks/useCommend.ts:58`-`platform/hooks/useCommend.ts:63`.
- Evidence (locales missing keys): `platform/locales/en.json:866`-`platform/locales/en.json:874`, `platform/locales/tr.json:866`-`platform/locales/tr.json:874`.
- Impact: fallback English/default text leaks into TR flow for new backend error codes.

2. Telemetry hardening is partial.
- Evidence: in-memory IP map with unbounded key growth (`platform/pages/api/vitals.ts:8`, `platform/pages/api/errors.ts:7`).
- Evidence: sampling value is parsed but not clamped/validated (`platform/pages/api/vitals.ts:4`).
- Impact: long-lived process memory growth with high-cardinality IP churn; misconfigured sample rate can behave unexpectedly.

## P2 Findings (Medium)

1. Feature gate naming conflates two concerns.
- Evidence: both endpoints are disabled by `FEATURE_WEB_VITALS` (`platform/pages/api/vitals.ts:20`, `platform/pages/api/errors.ts:19`).
- Impact: disabling web-vitals also disables client-error ingestion; operational observability coupling is too tight.

## Git Ignore Audit (Requested)
- Current `.gitignore` already covers major generated artifacts (`.next`, `out`, coverage, pytest, logs, temp, netlify, vercel).
- No newly generated tracked junk file detected in this pass (`git status --short` clean after commits).
- No immediate mandatory ignore addition found in root repo.

## Claude Action Pack (Implementation Order)

1. P0 - Restore green gates first.
- Fix `curly` violations in `platform/pages/api/vitals.ts` and `platform/pages/api/errors.ts`.
- Make client IP resolution null-safe (`req.headers?`, `req.socket?`) with deterministic fallback.
- Refactor failing a11y test mock strategy to avoid `jest.resetModules()` duplicate-react trap.

2. P1 - Contract and localization completion.
- Add missing `crownCommend.errors.*` keys for:
  - `rateLimitExceeded`
  - `unauthorized`
  - `postingDisabled`
  - `videoDetailsFailed`
  - `generationFailed`
  - `postingFailed`
- Keep TR/EN parity and pass `i18n:check`.

3. P1/P2 - Telemetry hardening refinement.
- Clamp `VITALS_SAMPLE_RATE` into `[0,1]`; fallback to `1` when invalid.
- Add bounded eviction strategy for in-memory IP hit maps.
- Split feature gates (`FEATURE_WEB_VITALS` and `FEATURE_CLIENT_ERRORS`) or document explicit intentional coupling.

## Re-Validation Required After Claude
- `cmd /c npm --prefix platform run lint`
- `cmd /c npm --prefix platform run type-check`
- `cmd /c npm --prefix platform test -- --runInBand`
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`
- `python -m pytest backend/tests -q`
- `python -m pytest hf-crowncode-backend/tests -q`
