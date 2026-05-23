# Analysis Report - Phase L Deploy Runtime Pivot (2026-03-08)

## Scope
- Target: Netlify deployment chain for `platform` (Next.js server-mode).
- Focus: persistent runtime crash `Cannot find module 'next/dist/server/lib/start-server.js'`.
- Mode: analyst-only (no product feature edits, deployment-model correction only).

## New Incident Evidence
- Runtime crash is still active after previous root-context rollout:
  - Netlify internal ids: `01KK5EZPH59D7EQD2TH022HKN7`, `01KK5FQTMBWMYGEJEQ6SV7B26E`, `01KK6KK09W56XWB409J50635RV`.
- Build/deploy logs show root-context workspace mode is still used in failing runs:
  - `Current directory: /opt/build/repo`
  - `build.command: npm ci && npm run build --workspace platform`
  - `Detected 0 framework(s)` in init phase (root scan)
  - deploy succeeds, runtime returns 502 and missing `start-server.js`.
- Mixed config attempts produced deterministic config errors:
  - with app-context base + workspace command: `No workspaces found --workspace=platform`
  - publish path drift observed as `platform/platform/.next` when base+publish were inconsistent.

## Root Cause Update (Pivot Decision)
Previous assumption (root-context workspace model) is not stable in this project's Netlify setup.

Observed stable direction:
- Use **app-context** deployment model to eliminate workspace packaging ambiguity.
- Keep build/install and runtime packaging in the same directory (`platform/`).

## Required Claude Action Pack (P0 First)
1. Enforce app-context `netlify.toml`.
- `build.base = "platform"`
- `build.command = "npm ci && npm run build"`
- `build.publish = ".next"`
- context commands (`production`, `deploy-preview`, `branch-deploy`) align to the same non-workspace command.

2. Eliminate UI/Repo drift.
- Netlify UI `Base/Package/Build/Publish/Functions` overrides must be cleared or made exactly equal to repo config.
- No `--workspace platform` command in UI.
- No `platform/.next` publish override when `base=platform` (must be `.next`).

3. Add deploy smoke contract to docs.
- post-deploy checks:
  - `/api/health` -> 200
  - `/api/version` -> 200
  - homepage `/` -> 200 (no 502)
- function log must not contain `start-server.js` missing-module error.

## P1 Fallback (Only If P0 Still Fails)
1. Add Netlify function bundling guardrails:
- `[functions]` `external_node_modules = ["next", "react", "react-dom"]` (temporary, remove after root cause is fixed).

2. Install layout fallback:
- environment `NPM_FLAGS=--install-strategy=nested` to force app-local dependency tree.

## Acceptance Criteria
- Build log:
  - `Current directory: /opt/build/repo/platform`
  - `build.command ... npm ci && npm run build`
  - `Starting to deploy site from '.next'`
- Runtime:
  - no `Cannot find module 'next/dist/server/lib/start-server.js'`
  - Lighthouse no longer reports document request 502 due server handler crash.

## Analyst Notes
- Local validation confirms project build is healthy in app-context command path:
  - `cmd /c npm --prefix platform run build` -> PASS
- Root-context strategy remains documented in prior phase but is now superseded by this incident-driven pivot.
