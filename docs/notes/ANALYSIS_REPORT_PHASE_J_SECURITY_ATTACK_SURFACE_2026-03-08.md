# Analysis Report - Phase J Security and Attack Surface (2026-03-08)

## Scope
- Target: `platform/`, `backend/`, `hf-crowncode-backend/`, deploy/CI configs.
- Focus: abuse resistance, auth boundaries, CORS/policy hardening, dependency risk.
- Mode: analyst-only (no product code changes in this phase).

## Baseline Validation (Analyst)
- `cmd /c "npm --prefix platform run lint && npm --prefix platform run type-check && npm --prefix platform test -- --runInBand"` -> PASS
- `cmd /c npm --prefix platform run build` -> PASS
- `python -m pytest backend/tests -q` -> PASS (`20 passed`)
- `python -m pytest hf-crowncode-backend/tests -q` -> PASS (`22 passed`, coverage ~47%)
- `cmd /c npm --prefix platform audit --audit-level=high` -> FAIL (`11 vulnerabilities`, including `5 high`)

## P0 Findings (Critical)

1. Commend auth is fail-open and rate-limit is tied to auth.
- Evidence: `hf-crowncode-backend/app/routes/commend/router.py:118`, `hf-crowncode-backend/app/routes/commend/router.py:146`, `hf-crowncode-backend/app/routes/commend/router.py:155`.
- Current behavior: if `COMMEND_API_KEY` is unset, requests are allowed and `_check_rate_limit` is never executed.
- Risk: unauthenticated external callers can hit cost-heavy endpoints (`/generate`, `/post`) without protection.

2. HF deployment defaults still encourage wildcard CORS.
- Evidence: `hf-crowncode-backend/Dockerfile:52` (`CROWNCODE_CORS_ORIGINS="*"`).
- Evidence: `hf-crowncode-backend/README.md:138` (default documented as `*`).
- Evidence: wildcard is accepted by runtime CORS loader (`hf-crowncode-backend/app/main.py:27`).
- Risk: any browser origin can script API calls; combined with fail-open auth this increases abuse surface.

3. Security header baseline is incomplete (no CSP/HSTS).
- Evidence: `netlify.toml:33`-`netlify.toml:39` includes only frame/content/referrer/permissions headers.
- Evidence: no `Content-Security-Policy`, no `Strict-Transport-Security` in `netlify.toml` or `platform/public/_headers`.
- Risk: weaker XSS mitigation and transport hardening than current production baseline expectations.

4. High-severity npm advisories are present and not fully gated.
- Evidence: analyst run `npm audit` reports high advisories (Next.js DoS + glob/minimatch chain).
- Evidence: CI audit step is non-blocking (`.github/workflows/ci.yml:147` `continue-on-error: true`).
- Risk: known high vulnerabilities can flow to production without hard stop.

## P1 Findings (High)

1. Client-controlled `x-forwarded-for` is used directly in telemetry limiters.
- Evidence: `platform/pages/api/vitals.ts:61`, `platform/pages/api/errors.ts:48`.
- Risk: attackers can rotate spoofed header values to bypass per-IP limits when proxy trust chain is not enforced.

2. In-memory rate-limit stores remain weak under high-cardinality traffic.
- Evidence: no max/eviction in commend limiter (`hf-crowncode-backend/app/routes/commend/router.py:122`-`hf-crowncode-backend/app/routes/commend/router.py:138`).
- Evidence: fortune counter limiter map also has no global eviction (`platform/pages/api/fortune-counter.ts:34`-`platform/pages/api/fortune-counter.ts:55`).
- Risk: memory growth and uneven protection in multi-instance deployments.

3. Heavy endpoints remain public with no explicit abuse shield.
- Evidence: `/api/analyze` has no auth/rate-limit dependency (`hf-crowncode-backend/app/routes/analyze.py:69`).
- Evidence: `/api/process/audio` has no auth/rate-limit and processes uploaded files (`hf-crowncode-backend/app/routes/data_processing.py:16`).
- Risk: download/transcode/model orchestration paths can be used for DoS/cost amplification.

4. Upload size checks happen after full read in audio processing path.
- Evidence: `content = await file.read()` before size rejection (`hf-crowncode-backend/app/routes/data_processing.py:33`-`hf-crowncode-backend/app/routes/data_processing.py:35`).
- Risk: memory pressure from oversized multipart uploads before application-level rejection.

5. Operational fingerprinting data is exposed in unauth diagnostics.
- Evidence: `platform/pages/api/health.ts:67` (uptime + memory stats), `platform/pages/api/version.ts:58`-`platform/pages/api/version.ts:60` (node/next/environment).
- Risk: reconnaissance value for attackers.

## P2 Findings (Medium)

1. Security test coverage is insufficient for new hardening paths.
- Evidence: telemetry tests only cover 405/400/204 happy/error basics (`platform/__tests__/api/telemetry.test.ts:27`-`platform/__tests__/api/telemetry.test.ts:69`).
- Gap: no assertions for 429 limiter behavior, feature flags, trusted IP extraction, or CORS policies.

2. Commend contract tests do not verify auth/rate-limit matrix.
- Evidence: `hf-crowncode-backend/tests/test_commend.py` has no explicit tests for rate-limit exhaustion or auth-misconfig fallback behavior.

## Recommended Claude Action Pack (Ordered)

1. P0 - Close external abuse paths first.
- Make Commend auth fail-closed in production:
  - require `COMMEND_API_KEY` when `ENV=production` (or explicit `COMMEND_REQUIRE_AUTH=true` default true in prod).
  - decouple rate-limit from auth; always apply rate-limit regardless of auth configuration.
- Remove wildcard CORS defaults from HF Dockerfile/docs; require explicit origin allowlist in production.

2. P0 - Header and dependency hardening.
- Add baseline CSP + HSTS policy in deployment headers.
- Convert CI security audit to branch-aware blocking for high/critical vulnerabilities (or allowlist with expiry and explicit justification).
- Patch Next.js and vulnerable dependency chain to secure versions compatible with current stack.

3. P1 - Telemetry and limiter robustness.
- Introduce trusted-client-IP resolver (prefer platform-specific headers only when trusted proxy context exists).
- Add max-size + eviction for commend limiter map; align all limiters to one utility pattern.
- Protect heavy endpoints (`/api/analyze`, `/api/process/audio`) with rate-limit and optional API key/public token gate.
- Enforce upload size earlier (proxy/body limits + streamed chunk checks where possible).

4. P2 - Testing and observability guarantees.
- Add tests for:
  - telemetry 429 paths,
  - feature gates (`FEATURE_WEB_VITALS`, `FEATURE_CLIENT_ERRORS`),
  - trusted IP parsing,
  - commend auth/rate-limit matrix,
  - CORS non-wildcard enforcement in production mode.

## Suggested Verification After Claude
- `cmd /c npm --prefix platform run lint`
- `cmd /c npm --prefix platform run type-check`
- `cmd /c npm --prefix platform test -- --runInBand`
- `cmd /c npm --prefix platform run build`
- `python -m pytest backend/tests -q`
- `python -m pytest hf-crowncode-backend/tests -q`
- `cmd /c npm --prefix platform audit --audit-level=high`
