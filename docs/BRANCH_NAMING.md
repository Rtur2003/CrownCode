# Branch Naming Convention - Quick Reference

## Format

```
<category>/<topic-description>
```

## Categories

| Category | Purpose | Example |
|----------|---------|---------|
| `feature/` | New features or capabilities | `feature/add-spotify-integration` |
| `bugfix/` | Bug fixes | `bugfix/handle-null-video-id` |
| `security/` | Security improvements | `security/validate-user-input` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/extract-audio-helpers` |
| `perf/` | Performance optimizations | `perf/cache-audio-fingerprints` |
| `docs/` | Documentation updates | `docs/update-api-reference` |
| `test/` | Test additions or improvements | `test/add-validation-tests` |
| `tooling/` | Development tools and automation | `tooling/setup-pre-commit` |
| `workflow/` | Development workflow improvements | `workflow/atomic-commit-guide` |
| `rules/` | Project rules and conventions | `rules/python-first-enforcement` |

## Rules

### ✅ DO:
- Use lowercase letters
- Use hyphens to separate words (kebab-case)
- Keep descriptions clear and concise (3-50 characters)
- Focus on ONE topic per branch
- Be descriptive about what the branch does

### ❌ DON'T:
- Use underscores: `feature/my_feature` ❌
- Use spaces: `feature/my feature` ❌
- Use uppercase: `Feature/MyFeature` ❌
- Mix categories: `feature-bugfix/something` ❌
- Be vague: `updates` or `changes` ❌
- Start/end with hyphen: `feature/-something-` ❌
- Use consecutive hyphens: `feature/some--thing` ❌

## Examples

### ✅ Good Examples

```bash
# Feature additions
feature/add-spotify-support
feature/batch-audio-processing
feature/export-analysis-results

# Bug fixes
bugfix/fix-audio-parser-crash
bugfix/handle-null-video-id
bugfix/correct-confidence-calculation

# Security improvements
security/validate-user-input
security/sanitize-file-paths
security/add-rate-limiting

# Refactoring
refactor/extract-validation-helpers
refactor/split-analysis-service
refactor/improve-error-handling

# Performance
perf/optimize-model-loading
perf/cache-audio-fingerprints
perf/reduce-memory-usage

# Documentation
docs/update-api-documentation
docs/add-setup-guide
docs/improve-readme

# Testing
test/add-validation-tests
test/integration-test-youtube
test/e2e-audio-upload

# Tooling
tooling/setup-pre-commit-hooks
tooling/add-code-formatters
tooling/configure-ci-pipeline

# Workflow
workflow/atomic-commit-guidelines
workflow/pr-template-improvement
workflow/branch-protection-rules

# Rules
rules/python-first-enforcement
rules/commit-message-format
rules/code-review-process
```

### ❌ Bad Examples

```bash
# Too vague
updates                           # Missing category
my-branch                         # What does it do?
fix                              # Fix what?

# Wrong format
Feature/AddSpotify               # Not kebab-case
feature/add_spotify              # Underscores not allowed
my_feature                       # Missing category
feature-add-spotify              # Wrong separator

# Multiple concerns
feature-and-bugfix/mixed         # One branch = one concern
refactor-perf/optimize          # Pick one category

# Too short
feature/add                      # Too vague (min 3 chars)
fix/bug                          # Not descriptive

# Too long
feature/add-comprehensive-spotify-music-streaming-integration-with-full-playlist-support
# Keep it concise (max 50 chars)
```

## Validation

Test your branch name:

```bash
# Validate current branch
python scripts/validate_branch_name.py $(git branch --show-current)

# Validate specific name
python scripts/validate_branch_name.py feature/my-new-feature
```

## Protected Branches

These branches have special status and don't follow the convention:
- `geliştirme` - Development branch

**Direct commits to protected branches are FORBIDDEN.**

## Creating a Branch

```bash
# Create and switch to new branch
git checkout -b <category>/<topic-description>

# Examples
git checkout -b feature/add-spotify-integration
git checkout -b security/validate-input
git checkout -b refactor/extract-helpers
```

## Renaming a Branch

If your branch name doesn't follow conventions:

```bash
# Rename current branch
git branch -m <category>/<new-name>

# Example
git branch -m feature/add-spotify-support

# Push renamed branch
git push origin -u feature/add-spotify-support

# Delete old branch from remote (if already pushed)
git push origin --delete old-branch-name
```

## FAQ

### Q: What if my work spans multiple categories?

**A:** Split it into multiple branches. Each branch should have ONE clear purpose.

Example:
- `feature/add-spotify-api` - Add Spotify API integration
- `security/validate-spotify-tokens` - Add token validation
- `test/spotify-integration-tests` - Add tests for Spotify integration

### Q: Can I use numbers in branch names?

**A:** Yes! Numbers are allowed.

```bash
feature/support-mp3-v2           # ✅ OK
bugfix/fix-issue-123             # ✅ OK
perf/reduce-latency-50ms         # ✅ OK
```

### Q: What if my description needs to be long?

**A:** Keep it under 50 characters. If you need more detail, put it in commit messages and PR description.

```bash
# Instead of this:
feature/add-comprehensive-spotify-integration-with-playlist-support

# Do this:
feature/add-spotify-integration

# And explain the details in your PR description
```

### Q: Can I work directly on `main` or `geliştirme`?

**A:** NO! This violates engineering standards. Always work in topic branches.

### Q: What about hotfixes for production?

**A:** Use `bugfix/` category with clear description:

```bash
bugfix/critical-auth-bypass      # For security hotfixes
bugfix/fix-payment-processing    # For critical bugs
```

## Resources

- [Engineering Standards](../.github/ENGINEERING_STANDARDS.md)
- [Development Guidelines](./DEVELOPMENT_GUIDELINES.md)
- [Quick Start Guide](./QUICK_START.md)

## Enforcement

Branch naming is enforced by:
1. Pre-commit hooks (validates on commit)
2. CI/CD pipeline (validates on PR)
3. Code review (manual check)

---

**Remember:** Good branch names make it easy to understand what the work is about at a glance.
