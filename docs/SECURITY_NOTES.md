# Security Notes - Key Rotation Required

> **Date**: 2026-03-03
> **Priority**: HIGH

## Exposed Credentials (Require Immediate Rotation)

The following credentials were found in `.env.example` files committed to git history.
Even though they have been replaced with placeholders, the old values remain in git history.

### 1. Spotify API
- **File**: `platform/.env.example`, `hf-crowncode-backend/.env.example`
- **Exposed**: `SPOTIFY_CLIENT_SECRET`
- **Action**: Rotate at https://developer.spotify.com/dashboard

### 2. YouTube OAuth Credentials
- **File**: `hf-crowncode-backend/.env.example`
- **Exposed**: `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET`
- **Action**: Rotate at https://console.cloud.google.com/apis/credentials

### 3. Google Gemini API Key
- **File**: `hf-crowncode-backend/.env.example`
- **Exposed**: `COMMEND_GEMINI_API_KEY`
- **Action**: Rotate at https://ai.google.dev/

### 4. YouTube OAuth Tokens (Refresh + Access)
- **File**: `hf-crowncode-backend/.env.example` (in `COMMEND_TOKEN_JSON`)
- **Exposed**: Full OAuth token JSON with refresh token
- **Action**: Revoke and regenerate using `generate_youtube_token.py`

## Recommended Steps

1. **Rotate all keys listed above immediately**
2. After rotation, update your `.env` / HuggingFace Spaces secrets
3. Consider using `git filter-branch` or `BFG Repo-Cleaner` to purge old secrets from git history
4. Enable GitHub secret scanning alerts if not already active

## Prevention

- Never put real values in `.env.example` files
- Use `your-xxx-here` placeholder format
- Add pre-commit hooks to scan for secrets (e.g., `gitleaks`, `detect-secrets`)
