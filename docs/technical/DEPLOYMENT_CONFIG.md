# Deployment & Hosting Configuration

## Architecture Overview

```text
┌─────────────────────┐     ┌────────────────────────────┐
│  Netlify (Frontend)  │────▸│  Hugging Face Spaces (HF)  │
│  Next.js 14 Server   │     │  FastAPI Backend            │
│  platform/           │     │  hf-crowncode-backend/      │
└─────────────────────┘     └────────────────────────────┘
```

- **Frontend**: Netlify — Next.js server-mode runtime via `@netlify/plugin-nextjs`
- **Backend (advanced)**: Hugging Face Spaces — Docker SDK, FastAPI
- **Backend (core)**: `backend/` — same API surface, runs locally or on any Python host

---

## Netlify Deploy (Frontend)

### Deploy Model

**Server-mode** is the primary and only Netlify deploy model.
Static export (`DEPLOYMENT_TARGET=static`) is used only for local CI validation;
it is NOT deployed to Netlify.

### netlify.toml (Actual — Root-Context Mode)

```toml
[build]
  command = "npm ci && npm run build --workspace platform"
  publish = "platform/.next"

[build.environment]
  NODE_VERSION = "20.18.1"
  NODE_OPTIONS = "--max-old-space-size=4096"
```

Key points:

- **No `base` field** — build runs from repo root, NOT from `platform/`.
- `--workspace platform` — npm workspace command targets the `platform` package.
- `publish = "platform/.next"` — path is relative to repo root (since there is no `base`).
- `npm ci` — deterministic install from root lockfile, no corepack drift.
- `NODE_VERSION = "20.18.1"` — pinned to match local dev.
- `@netlify/plugin-nextjs` handles SSR, API routes, and ISR automatically.

### Netlify UI Override Cleanup (CRITICAL)

> **`netlify.toml` is the single authoritative source for build configuration.**
> All UI overrides in Netlify Dashboard must be cleared.

Go to **Netlify Dashboard > Site Settings > Build & Deploy > Build settings** and ensure:

| Field | UI Value | Reason |
| --- | --- | --- |
| **Base directory** | _(empty / not set)_ | Root-context; `netlify.toml` has no `base` |
| **Build command** | _(empty / not set)_ | Defined in `netlify.toml` |
| **Publish directory** | _(empty / not set)_ | Defined in `netlify.toml` |
| **Functions directory** | _(empty / not set)_ | Managed by `@netlify/plugin-nextjs` |

If ANY of these fields are set in the UI, they **override** `netlify.toml` values silently.
This was the root cause of the `Cannot find module 'next/dist/server/lib/start-server.js'` incident —
the UI `base = "platform"` caused Netlify to resolve `publish` as `platform/.next` relative to `platform/`,
resulting in dependency context mismatch at runtime.

### Branch / Context Rules

| Branch | Netlify Context | Target |
| --- | --- | --- |
| `master` | `production` | Live site |
| `geliştirme` | `branch-deploy` | Preview URL |
| PR branches | `deploy-preview` | PR preview |

**Important**: Only `master` triggers production deploy.
`geliştirme` should NEVER deploy to production context.

### Environment Variables (Netlify UI)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | HF backend URL (e.g. `https://user-crowncode-backend.hf.space`) |
| `NODE_VERSION` | `20.18.1` |

---

## Hugging Face Spaces Deploy (Backend)

See [hf-crowncode-backend/README.md](../../hf-crowncode-backend/README.md) for full details.

### Quick Summary

- SDK: Docker
- Hardware: CPU Basic (Free)
- Deploy: push files to HF Space repo or use `git push`

### Required Env Vars (HF Secrets)

| Variable | Description |
| --- | --- |
| `COMMEND_GEMINI_API_KEY` | Gemini API key for Crown Commend |
| `COMMEND_API_KEY` | API key for commend endpoint auth (optional) |
| `COMMEND_ENABLE_POSTING` | `true`/`false` — enable YouTube posting |

---

## Lockfile Strategy

This monorepo uses a **single root-level `package-lock.json`** as the sole lockfile.

- `npm ci` runs from repo root and installs all workspaces.
- There is NO separate `platform/package-lock.json`. If one exists, **delete it** — it causes dependency resolution conflicts during Netlify builds.
- The root lockfile is the single source of truth for all dependency versions.
- `npm run build --workspace platform` builds only the `platform` package using root-installed `node_modules`.

**Why this matters for deploy:**
When Netlify runs `npm ci` from root context, it hoists all dependencies (including `next`) to `repo_root/node_modules/`. If a stale `platform/package-lock.json` exists, `npm ci` may install a parallel `platform/node_modules/` with mismatched versions, causing runtime module-resolution failures like `Cannot find module 'next/dist/server/lib/start-server.js'`.

---

## CI/CD Pipeline

The GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs:

1. **quality-check**: ESLint + TypeScript type-check
2. **build**: Server-mode Next.js build
3. **build-static**: Static export build (validation only)
4. **backend-tests**: Core backend pytest
5. **security**: npm audit + Trivy scan
6. **deploy**: Netlify deploy (master only, requires all gates)

### Local Validation (Pre-push)

Run these commands before pushing. Builds must NOT run in parallel.

```bash
# 1. Lint
npx --prefix platform next lint

# 2. Type check
npm --prefix platform run type-check

# 3. Tests
npx --prefix platform jest --runInBand

# 4. Server build
npm --prefix platform run build

# 5. Static build (validation only)
set DEPLOYMENT_TARGET=static && npm --prefix platform run build

# 6. Backend tests
python -m pytest backend/tests -q
```

---

## Post-Deploy Checklist

After a Netlify deploy, verify:

### Build Phase

- [ ] Build log shows `✓ Compiled successfully` (no `publish directory not found`)
- [ ] Dynamic routes appear as `ƒ` (server-mode indicator)
- [ ] `@netlify/plugin-nextjs` step completes without error
- [ ] No `base` override warning in build log

### Runtime Smoke (within 5 minutes of deploy)

- [ ] `curl https://<site>/api/health` — returns `{"status":"healthy",...}` with HTTP 200
- [ ] `curl https://<site>/api/version` — returns `{"version":"...","features":{...}}` with HTTP 200
- [ ] Site loads at production URL, no blank page
- [ ] No console errors on key pages (home, ai-music-detection, crown-fortune)

### Function Logs (Netlify Dashboard > Functions)

- [ ] No `Cannot find module` errors in function logs
- [ ] No `start-server.js` resolve failures
- [ ] SSR functions (`___netlify-server-handler`) show healthy invocations

---

## Troubleshooting

### "publish directory not found: .../out"

**Cause**: `publish` is set to `out` but build runs in server mode (produces `.next`).
**Fix**: Set `publish = ".next"` in `netlify.toml`.

### Engine warning noise (npm version mismatch)

**Cause**: `package.json` engines field requires npm>=10.9.2 but Netlify ships older npm.
**Fix**: `NODE_VERSION` is pinned in `netlify.toml`. The warnings are cosmetic and do not block deploy.

### geliştirme branch deploying to production

**Cause**: Netlify branch-context misconfiguration.
**Fix**: Ensure production deploy is gated to `master` branch only in Netlify Site Settings > Build & Deploy > Continuous Deployment.
