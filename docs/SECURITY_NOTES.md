# Security Notes - CrownCode Secret Management

> **Last updated**: 2026-03-03
> **Owner**: @Rtur2003

---

## 1. Credential Inventory

| Secret                             | Used By                         | Storage                    | Rotation               |
| ---------------------------------- | ------------------------------- | -------------------------- | ---------------------- |
| `SPOTIFY_CLIENT_ID/SECRET`         | AI Music Detection              | `.env.local` / HF Secrets  | On compromise          |
| `YOUTUBE_OAUTH_CLIENT_ID/SECRET`   | Crown Commend (backend)         | `.env.local` / HF Secrets  | On compromise          |
| `COMMEND_TOKEN_JSON`               | Crown Commend (yorum gonderme)  | HF Secrets only            | 6 ay / on compromise   |
| `COMMEND_YOUTUBE_API_KEY`          | Crown Commend (read-only)       | `.env.local` / HF Secrets  | On compromise          |
| `COMMEND_GEMINI_API_KEY`           | Crown Commend (AI ozetleme)     | `.env.local` / HF Secrets  | On compromise          |
| `GITHUB_TOKEN`                     | Profil verisi                   | `.env.local` / Netlify env | On compromise          |
| `NETLIFY_AUTH_TOKEN`               | Deploy                          | CI only                    | Yillik                 |
| `NETLIFY_SITE_ID`                  | Deploy                          | CI only                    | Degismez               |

---

## 2. Exposed Credentials (Require Immediate Rotation)

The following credentials were found in `.env.example` files committed to git history.
Even though they have been replaced with placeholders, the old values remain in git history.

### 2.1 Spotify API

- **File**: `platform/.env.example`, `hf-crowncode-backend/.env.example`
- **Exposed**: `SPOTIFY_CLIENT_SECRET`
- **Action**: Rotate at https://developer.spotify.com/dashboard

### 2.2 YouTube OAuth Credentials

- **File**: `hf-crowncode-backend/.env.example`
- **Exposed**: `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET`
- **Action**: Rotate at https://console.cloud.google.com/apis/credentials

### 2.3 Google Gemini API Key

- **File**: `hf-crowncode-backend/.env.example`
- **Exposed**: `COMMEND_GEMINI_API_KEY`
- **Action**: Rotate at https://ai.google.dev/

### 2.4 YouTube OAuth Tokens (Refresh + Access)

- **File**: `hf-crowncode-backend/.env.example` (in `COMMEND_TOKEN_JSON`)
- **Exposed**: Full OAuth token JSON with refresh token
- **Action**: Revoke and regenerate (see Section 3 below)

### 2.5 Post-Rotation Checklist

1. Rotate all keys listed above immediately.
2. Update `.env.local` (local dev) and HuggingFace Spaces secrets (production).
3. Purge old secrets from git history with BFG Repo-Cleaner:

   ```bash
   # Install BFG: https://rtyley.github.io/bfg-repo-cleaner/
   bfg --replace-text passwords.txt CrownCode.git
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```

4. Enable GitHub secret scanning: Settings > Code security > Secret scanning.

---

## 3. client_secret.json & token.json Procedures

### 3.1 What Are These Files?

| File                 | Purpose                              | Contains                                 |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| `client_secret.json` | Google Cloud OAuth 2.0 client config | Client ID, client secret, redirect URIs  |
| `token.json`         | Generated OAuth refresh/access token | Refresh token, access token, expiry      |

Both files are used by Crown Commend's YouTube comment posting feature.

### 3.2 Initial Setup (First Time)

```text
Step 1: Google Cloud Console
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID (type: Desktop Application)
   - Download the JSON file (named client_secret_XXXXX.json)

Step 2: Generate token.json
   - Copy the downloaded file into hf-crowncode-backend/
   - Rename it to client_secret.json
   - Run:  python generate_youtube_token.py
   - Browser opens -> sign in with the YouTube channel account
   - token.json is created in the same directory

Step 3: Store in Environment
   - Copy the single-line JSON output from the script
   - Set as COMMEND_TOKEN_JSON in HuggingFace Spaces secrets
   - NEVER commit token.json or client_secret.json to git

Step 4: Clean Up Local Files
   - Delete client_secret.json and token.json from the repo folder
   - Verify: git status shows no new untracked secret files
```

### 3.3 Token Refresh (When Token Expires)

The backend auto-refreshes expired tokens using the refresh_token inside `COMMEND_TOKEN_JSON`. If the refresh token itself is revoked or expired:

```text
1. Re-run: python generate_youtube_token.py
   (Requires client_secret.json to be present temporarily)
2. Copy the new COMMEND_TOKEN_JSON value
3. Update HuggingFace Spaces secret: Settings > Variables and Secrets
4. Delete local client_secret.json and token.json
```

### 3.4 Token Revocation (Emergency)

```text
1. Go to https://myaccount.google.com/permissions
2. Find "Crown Commend" (or your OAuth app name)
3. Click "Remove Access"
4. The refresh token is now invalid
5. Regenerate using Section 3.3 steps
```

---

## 4. Repo-External Secret Management

### 4.1 Local Development

```text
Location:  platform/.env.local        (frontend)
           hf-crowncode-backend/.env  (backend)

Rules:
- Copy from .env.example, fill in real values
- .env.local and .env are in .gitignore (never committed)
- Each developer maintains their own local copy
- Do NOT share .env files via Slack/email/chat
```

### 4.2 Production Secrets (HuggingFace Spaces)

```text
Location:  HF Space Settings > Variables and Secrets

Required secrets for Crown Commend:
  COMMEND_YOUTUBE_API_KEY   - YouTube Data API v3 key (read-only ops)
  COMMEND_GEMINI_API_KEY    - Gemini API key (AI comment generation)
  COMMEND_TOKEN_JSON        - Full OAuth token JSON (comment posting)

Required secrets for AI Music Detection:
  SPOTIFY_CLIENT_ID         - Spotify Web API
  SPOTIFY_CLIENT_SECRET     - Spotify Web API

How to update:
  1. Go to https://huggingface.co/spaces/YOUR_SPACE/settings
  2. Scroll to "Variables and secrets"
  3. Add/update the secret value
  4. Restart the Space (secrets are injected at container startup)
```

### 4.3 CI/CD Secrets (GitHub Actions)

```text
Location:  GitHub repo > Settings > Secrets and variables > Actions

Currently used:
  NETLIFY_AUTH_TOKEN   - Netlify deploy token
  NETLIFY_SITE_ID     - Netlify site identifier

How to update:
  1. Go to https://github.com/CrownCode/settings/secrets/actions
  2. Click "Update" next to the secret
  3. Paste new value, save
  4. Re-run the workflow to verify
```

### 4.4 Rotation Schedule

| Secret Type                         | Rotation Frequency | Trigger                               |
| ----------------------------------- | ------------------ | ------------------------------------- |
| API keys (Spotify, YouTube, Gemini) | On compromise      | Secret scanning alert or manual audit |
| OAuth tokens (COMMEND_TOKEN_JSON)   | Every 6 months     | Calendar reminder                     |
| Deploy tokens (Netlify)             | Annually           | Calendar reminder                     |
| GitHub Token                        | On compromise      | Secret scanning alert                 |

### 4.5 Rotation Procedure (Generic)

```text
1. Generate new credential at the provider's console
2. Test new credential locally:
   - Update .env.local / .env
   - Verify the feature works (e.g., comment posting, Spotify search)
3. Update production:
   - HuggingFace Spaces secrets (backend)
   - Netlify env vars (frontend, if applicable)
   - GitHub Actions secrets (CI/CD, if applicable)
4. Revoke the old credential at the provider's console
5. Log the rotation in this file (Section 6)
```

---

## 5. Prevention Controls

### 5.1 .gitignore Coverage

The following patterns in `hf-crowncode-backend/.gitignore` prevent accidental commits:

```gitignore
# Secrets
secrets/
credentials/
*.pem
*.key

# YouTube OAuth (Crown Commend)
client_secret*.json
token.json
generate_youtube_token.py
commend_history.json

# Environment
.env
.env.*
!.env.example
```

### 5.2 Pre-Commit Secret Scanning

Recommended: Add `gitleaks` to the pre-commit pipeline:

```yaml
# .pre-commit-config.yaml
- repo: https://github.com/gitleaks/gitleaks
  rev: v8.18.0
  hooks:
    - id: gitleaks
```

### 5.3 GitHub Secret Scanning

Enable at: Settings > Code security and analysis > Secret scanning

This will automatically detect committed secrets and create alerts.

---

## 6. Rotation Log

| Date       | Secret                                | Action                                                 | By        |
| ---------- | ------------------------------------- | ------------------------------------------------------ | --------- |
| 2026-03-03 | All (Spotify, YouTube, Gemini, OAuth) | Identified as exposed in git history, rotation pending | @Rtur2003 |
