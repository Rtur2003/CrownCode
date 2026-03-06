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

### netlify.toml (Actual)

```toml
[build]
  base = "platform"
  command = "npm ci && npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20.18.1"
  NODE_OPTIONS = "--max-old-space-size=4096"
```

Key points:

- `publish = ".next"` — server-mode output, NOT `out`.
- `npm ci` — deterministic install, no corepack drift.
- `NODE_VERSION = "20.18.1"` — pinned to match local dev.
- `@netlify/plugin-nextjs` handles SSR, API routes, and ISR automatically.

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

- [ ] Build log shows `✓ Compiled successfully` (no `publish directory not found`)
- [ ] Dynamic routes appear as `ƒ` (server-mode indicator)
- [ ] `@netlify/plugin-nextjs` step completes without error
- [ ] Site loads at production URL
- [ ] API routes (`/api/health`, `/api/version`) respond correctly
- [ ] No console errors on key pages (home, ai-music-detection, crown-fortune)

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
