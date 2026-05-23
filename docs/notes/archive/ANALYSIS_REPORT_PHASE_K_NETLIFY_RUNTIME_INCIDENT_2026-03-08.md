# Analysis Report - Phase K Netlify Runtime Incident (2026-03-08)

## Incident
- Production function crash:
  - `Cannot find module 'next/dist/server/lib/start-server.js'`
  - require stack: `/var/task/.netlify/dist/run/next.cjs`
  - Netlify internal id: `01KK5CSJYREQXZZTKWQS9W2G3Z`

## Verified Facts (Analyst)
- `netlify.toml` is currently monorepo-subdir based:
  - `base = "platform"`
  - `command = "npm ci && npm run build"`
  - `publish = ".next"`
- Workspace topology exists at repo root:
  - root `package.json` includes `"workspaces": ["platform"]`.
  - root lockfile + app lockfile both exist (`package-lock.json`, `platform/package-lock.json`).
- Local dependency resolution check:
  - `cmd /c npm --prefix platform ls next` -> app-local tree appears empty in current workspace state.
  - `node_modules/next/dist/server/lib/start-server.js` exists at root install context.
- Build itself can pass while runtime still fails:
  - `cmd /c npm run build --workspace platform` -> PASS (Next 14.2.32).

## Root Cause Assessment
P0 probable root cause:
- Deploy packaging context drift in Netlify monorepo setup.
- Build/install context and runtime function bundle context are not aligned, so Next server runtime files are missing from deployed lambda package even when build succeeds.

Contributing risks:
- UI-level custom overrides (`base/build/publish/functions`) can silently override repo config and split behavior across environments.
- Dual lockfile/workspace topology increases nondeterminism in CI/build runners.

## Claude Action Pack (Deploy Hotfix First)
1. Normalize Netlify config ownership.
- Make `netlify.toml` the single source of truth.
- Remove conflicting Netlify UI overrides for `base`, `build command`, `publish`, `functions`.

2. Normalize monorepo build context to repo root.
- Remove `base = "platform"` from `netlify.toml`.
- Use root workspace build command:
  - `npm ci`
  - `npm run build --workspace platform`
- Set publish path for root-context:
  - `publish = "platform/.next"`

3. Lockfile strategy cleanup.
- Choose one deterministic lock strategy for deploy:
  - workspace-root lock as authoritative.
  - document policy in deployment docs.

4. Add deploy smoke gate.
- After deploy, verify:
  - `GET /api/health`
  - `GET /api/version`
  - `POST /api/fortune-counter` (or feature-flag aware call path)
- Confirm function logs have no `start-server.js` resolution error.

## Required Verification (Analyst Will Run)
- `cmd /c npm run build --workspace platform`
- `cmd /c npm --prefix platform run lint`
- `cmd /c npm --prefix platform run type-check`
- `cmd /c npm --prefix platform test -- --runInBand`
- Netlify redeploy with cache clear, then runtime smoke endpoints.

## Validation Log (Analyst)
- `cmd /c npm --prefix platform run lint` -> PASS
- `cmd /c npm --prefix platform run type-check` -> PASS
- `cmd /c npm --prefix platform test -- --runInBand` -> PASS (`4 suite / 32 test`, known `act(...)` warnings)
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> PASS
- `cmd /c npm run build --workspace platform` -> PASS
- `cmd /c npm --prefix platform ls next` -> `(empty)` in app-local context (workspace hoist pattern observed)

## Ready Message for Claude
```md
P0 deploy incident var: Netlify runtime `Cannot find module 'next/dist/server/lib/start-server.js'` (id: 01KK5CSJYREQXZZTKWQS9W2G3Z).

Sadece deploy/config katmanina odaklan:
1) `netlify.toml` monorepo root-context modeline cek:
   - `base` kaldir
   - build command: `npm ci && npm run build --workspace platform`
   - publish: `platform/.next`
2) Netlify UI override'larini temizleyecek sekilde docs'a net not ekle (base/build/publish/functions).
3) Lockfile stratejisini deployment docs'ta tek-kaynak olarak yaz.
4) Kisa deploy smoke checklist ekle: `/api/health`, `/api/version`, function logs.

Kod disi yere dokunma. Dosya bazli kisa rapor ver.
```
