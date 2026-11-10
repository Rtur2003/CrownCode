# FL-MCP Integration & Architecture Reference

> Authoritative handover guide for **FL-MCP (FL Studio 2025 AI Copilot)** on the CrownCode platform.
> Future agents modifying licensing, credits, authentication, or dashboard UI must keep `backend/`, `hf-crowncode-backend/`, and `platform/` in sync as documented below.

---

## 1. System Overview

FL-MCP is a monetized desktop MCP server (`Rtur2003/FL-MCP`) that bridges Claude Desktop, Claude Code, Cursor, and VS Code to FL Studio 2025 via loopMIDI (`API 40, script v5`). CrownCode serves as its central licensing vault, credit ledger, and showcase platform:

1. **Public Showcase (`/fl-mcp`)**: `platform/pages/fl-mcp/index.tsx`
   - Interactive 12-genre production explorer, plugin parameter solver preview (dB/Hz/Q), ITU-R BS.1770-4 LUFS metering showcase, pricing tiers, and FAQ.
2. **Gated Customer Vault (`/dashboard/fl-mcp`)**: `platform/pages/dashboard/fl-mcp/index.tsx`
   - Indexed as `noindex` (`NOINDEX_ROUTES` in `platform/config/site.ts`).
   - Authenticates users via **Supabase Google OAuth** (`platform/config/supabase.ts`).
   - Displays masked license keys (`FLMCP-•••••-•••••-•••••-•••••`), live credit balances, active machine seats, 1-click key rotation, seat revocation, and ready-to-paste client configs.
3. **Commerce & Licensing Backend (`/api/v1/flmcp/*`)**:
   - Implemented identically in both:
     - `hf-crowncode-backend/app/routes/flmcp.py` & `hf-crowncode-backend/app/services/flmcp/` (deployed to Hugging Face Spaces)
     - `backend/app/routes/flmcp.py` & `backend/app/services/flmcp/` (tracked in the main repo and tested in GitHub Actions CI)

---

## 2. Database Persistence & Security (`db.py`)

> **CRITICAL**: Hugging Face Spaces have ephemeral local storage. In production, set `DATABASE_URL` to the Supabase PostgreSQL connection string (`postgresql://...`). When `DATABASE_URL` is unset (local dev/tests), `db.py` falls back to SQLite (`FLMCP_DB_PATH` or `/data/flmcp.db`).

### Tables

- `accounts`: `id`, `email`, `auth_user_id` (Supabase `sub`), `plan` (`free`, `trial`, `pro`, `studio`), `status`, `period_end`, `created_at`
- `licenses`: `id`, `account_id`, `key_hash` (SHA-256 only; plaintext keys are never stored), `key_Hint`, `seats_allowed`, `revoked`, `created_at`
- `devices`: `id`, `license_id`, `fingerprint_hash`, `name`, `token_hash` (SHA-256 of `flmcp_dt_...`), `created_at`, `last_seen`, `revoked`
- `credit_lots`: `id`, `account_id`, `source`, `initial`, `remaining`, `expires_at` (`NULL` for non-expiring top-up packs), `created_at`
- `reservations`: `id`, `account_id`, `device_id`, `idem_key`, `ops_json`, `held`, `status` (`held`, `settled`), `settled_amount`, `created_at`, `expires_at`
- `reservation_slices`: `reservation_id`, `lot_id`, `taken` (exact FIFO slice per credit lot for atomic rollback)
- `ledger_entries`: `id`, `account_id`, `delta`, `kind` (`grant`, `settle`), `ref`, `note`, `created_at`
- `webhook_events`: `provider`, `event_id`, `received_at` (idempotency table)

### Row Level Security (RLS)

On PostgreSQL initialization (`init_db()`), `ENABLE ROW LEVEL SECURITY` is automatically applied to all 8 tables with zero public policies. This blocks any direct browser queries via Supabase PostgREST using the publishable key while allowing the backend's direct Postgres connection full access.

---

## 3. Authentication & Abuse Protection

### Two Distinct Auth Channels

1. **Web Dashboard (`/api/v1/flmcp/me*`) — Supabase JWT (`auth.py`)**:
   - Browser signs in via Google OAuth (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
   - Frontend sends `Authorization: Bearer <supabase_access_token>`.
   - `app/services/flmcp/auth.py` verifies the JWT signature against `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` (`ES256` / `RS256`), validates `aud="authenticated"`, and requires a verified email.
2. **Desktop MCP Server (`/api/v1/flmcp/activate`, `/account`, `/credits/*`) — Device Token (`accounts.py`)**:
   - Desktop client activates once with `{ "key": "FLMCP-...", "device_id": "...", "device_name": "..." }` and receives `flmcp_dt_<token>`.
   - Subsequent requests use `Authorization: Bearer flmcp_dt_<token>`.

### Rate Limits & Anti-Abuse (`ratelimit.py`, `accounts.py`, `ledger.py`)

- **One Trial Per Identity**: Checked against both `auth_user_id` and normalized `email`, plus historical `trial:` credit lots.
- **Disposable Email Blocklist**: Rejects known throwaway email providers (`mailinator.com`, `yopmail.com`, `10minutemail.com`, etc.).
- **Sliding-Window Rate Limits** (returns `429 Too Many Requests` with `Retry-After` header):
  - `/me/trial`: 3 attempts / hour per IP and per user
  - `/me/key/rotate`: 5 attempts / hour per user
  - `/activate`: 10 attempts / 5 minutes per IP
  - `/credits/reserve`: 120 requests / minute per device token
  - `/webhooks/{provider}`: 120 requests / minute per IP
- **Hold Cap**: Maximum `MAX_OPEN_HOLDS = 20` concurrent unsettled reservations per account (`ledger.py`).

---

## 4. API Endpoints Reference

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/flmcp/plans` | Public | Plan catalog, credit allocations, and operation costs |
| `GET` | `/api/v1/flmcp/me` | Supabase Bearer JWT | Load account profile, balance, trial status, and active seats |
| `POST` | `/api/v1/flmcp/me/trial` | Supabase Bearer JWT | Provision 1-time 30-day trial license + 15 credits |
| `POST` | `/api/v1/flmcp/me/key/rotate` | Supabase Bearer JWT | Revoke current key and issue a fresh `FLMCP-...` key |
| `POST` | `/api/v1/flmcp/me/devices/revoke` | Supabase Bearer JWT | Revoke a device seat by `device_id` |
| `POST` | `/api/v1/flmcp/activate` | License Key in body | Bind a machine seat (returns `409 seat_limit` if full unless `replace` is passed) |
| `GET` | `/api/v1/flmcp/account` | Device Bearer Token | Live balance, plan, seats, and operation costs for desktop client |
| `POST` | `/api/v1/flmcp/devices/self/revoke` | Device Bearer Token | Release the calling machine's own seat |
| `POST` | `/api/v1/flmcp/credits/reserve` | Device Bearer Token | Atomically hold credits from earliest-expiring lot (`402` if insufficient) |
| `POST` | `/api/v1/flmcp/credits/{rid}/settle` | Device Bearer Token | Deduct succeeded `ops` and refund failed/unlisted `ops` |
| `POST` | `/api/v1/flmcp/webhooks/{provider}` | HMAC-SHA256 Signature | Process `lemonsqueezy`, `stripe`, or `generic` billing events idempotently |

---

## 5. Verification Commands

Whenever changing FL-MCP code, run all of the following before committing:

```bash
# 1. Backend tests (both directories must stay identical and pass)
python -m pytest hf-crowncode-backend/tests/test_flmcp.py -q
python -m pytest backend/tests -q

# 2. Frontend checks
npm --prefix platform run type-check
npm --prefix platform run lint
npm --prefix platform run i18n:check
npm --prefix platform test
```
