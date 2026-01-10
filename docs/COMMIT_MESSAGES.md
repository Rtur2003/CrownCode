# Commit Message Guidelines - Quick Reference

## Format

```
<type>: <short description>

<optional detailed explanation>
<optional technical details>
<optional breaking changes>
```

## Commit Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat:` | New feature | `feat: add Spotify integration` |
| `fix:` | Bug fix | `fix: handle null video ID` |
| `refactor:` | Code refactoring (no behavior change) | `refactor: extract audio helpers` |
| `security:` | Security improvement | `security: validate user input` |
| `perf:` | Performance improvement | `perf: cache audio fingerprints` |
| `docs:` | Documentation only | `docs: update API reference` |
| `test:` | Adding or updating tests | `test: add validation tests` |
| `build:` | Build system or dependencies | `build: update pytorch to 2.1.0` |
| `ci:` | CI/CD configuration | `ci: add branch validation` |
| `style:` | Code style (formatting, naming) | `style: apply black formatting` |
| `chore:` | Maintenance tasks | `chore: update pre-commit hooks` |

## Rules

### ✅ DO:
- Use lowercase for type and description
- Keep first line under 72 characters
- Start description with a verb
- Be specific about what changed
- Explain WHY, not just WHAT (in body)
- Make each commit atomic (one logical change)

### ❌ DON'T:
- Use vague messages: "misc", "cleanup", "update"
- Mix multiple concerns in one commit
- Include "and" in description (suggests multiple changes)
- Use past tense: "added" (use "add")
- End with period
- Include ticket numbers in subject (put in body)

## Structure

```
<type>: <subject (max 72 chars)>
<blank line>
<body (wrap at 72 chars)>
<blank line>
<footer (breaking changes, issue refs)>
```

### Subject Line
- Imperative mood: "add" not "added" or "adds"
- No capitalization of first letter after type
- No period at the end
- Maximum 72 characters

### Body (Optional)
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Can be multiple paragraphs
- Use bullet points if helpful

### Footer (Optional)
- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Closes #123`, `Related to #456`

## Examples

### ✅ Good Commit Messages

```
feat: add Gaussian variance to confidence calculation

Replace linear random variance with Gaussian distribution
to produce more realistic confidence scores. This improves
the preview model's accuracy in mimicking human expert behavior.

The change affects:
- preview_model.py: Updated _add_realistic_variance method
- Uses random.gauss instead of random.uniform
```

```
security: add input validation for video IDs

Validate video ID format before processing to prevent
injection attacks. Uses regex pattern matching to ensure
IDs contain only alphanumeric characters, underscores,
and hyphens.

Related to #45
```

```
refactor: extract audio processing helpers

Move audio processing functions from routes to dedicated
service module. This improves code organization and
makes functions reusable across different endpoints.

Changes:
- Created services/audio_processing.py
- Moved process_audio() and validate_audio()
- Updated routes/youtube.py to use new service
```

```
fix: handle null video ID in parser

Add null check before processing video ID to prevent
AttributeError. Returns early with clear error message
if video_id is None or empty string.

Closes #123
```

```
perf: cache audio fingerprint results

Add Redis caching for audio fingerprints to reduce
duplicate processing. Improves response time by ~60%
for repeated requests.

Cache expires after 1 hour to balance freshness and performance.
```

```
docs: add API endpoint examples to README

Include curl examples for each endpoint with expected
request/response formats. This helps new developers
understand API usage quickly.
```

```
test: add edge cases for validation module

Cover additional scenarios:
- Empty strings
- Special characters
- Very long inputs
- Unicode characters

Increases coverage from 78% to 92%.
```

```
build: update pytorch to 2.1.0

Required for latest transformers compatibility.
Includes CUDA 12.1 support for improved GPU performance.

BREAKING CHANGE: Requires Python 3.11+
Migration: Update Python version in Dockerfile
```

```
ci: add branch name validation workflow

Validates branch names follow <category>/<description>
convention on all PRs. Fails if branch name doesn't
match required pattern.
```

```
style: apply black formatting to services module

No functional changes. Ensures consistent code style
across all backend services.
```

```
chore: update pre-commit hooks to latest versions

- black: 23.11.0 -> 23.12.1
- ruff: 0.1.9 -> 0.1.11
- mypy: 1.7.0 -> 1.8.0
```

### ❌ Bad Commit Messages

```
misc: various improvements
# Too vague - what improved?
```

```
update files
# What files? What changed?
```

```
cleanup
# Clean up what? Why?
```

```
fix stuff
# What stuff? What was broken?
```

```
WIP
# Not descriptive. Don't commit WIP.
```

```
Added Spotify integration and fixed bug in audio parser
# Multiple concerns! Split into two commits.
```

```
refactor: Refactored the entire audio processing module.
# Capitalized description (wrong)
# Period at end (wrong)
# Too vague - what specifically changed?
```

```
Update README.md
# Missing type prefix
```

```
feat: add spotify, update docs, fix tests, and improve performance
# Too many concerns! Should be 4 separate commits.
```

## One Commit = One Change

### Atomic Commits

Each commit should represent ONE logical unit:

```bash
# ✅ Good: Three separate commits
git add backend/app/services/validation.py
git commit -m "security: add video ID format validation"

git add backend/app/routes/youtube.py
git commit -m "security: apply video ID validation to route"

git add backend/app/tests/test_validation.py
git commit -m "test: add video ID validation tests"

# ❌ Bad: One commit with multiple concerns
git add backend/app/services/validation.py \
        backend/app/routes/youtube.py \
        backend/app/tests/test_validation.py
git commit -m "add validation and tests"
```

## Workflow

```
CHANGE → COMMIT → CHANGE → COMMIT
```

**No batching. No squashing. No postponing commits.**

## Amending Commits

If you need to fix the last commit:

```bash
# Fix typo in last commit message
git commit --amend

# Add forgotten file to last commit
git add forgotten_file.py
git commit --amend --no-edit

# Only amend commits that haven't been pushed!
```

## Validation

Commit messages are validated by:

```bash
# Manual check with commitlint
echo "feat: my commit message" | npx commitlint

# Pre-commit hook runs automatically
git commit -m "feat: add new feature"
```

## Interactive Staging

For better atomic commits:

```bash
# Stage parts of files interactively
git add -p file.py

# Choose which hunks to stage
# y - stage this hunk
# n - skip this hunk
# s - split into smaller hunks
```

## Commit Templates

Create a commit template:

```bash
# ~/.gitmessage.txt
<type>: <short description>

# Why is this change necessary?
# 

# How does it address the issue?
#

# What side effects does it have?
#

# Related issues:
# Closes #
# Related to #

# Set as default template
git config --global commit.template ~/.gitmessage.txt
```

## Review Before Committing

```bash
# See what will be committed
git diff --staged

# Review changes with context
git diff --staged -U10

# See file changes
git status
```

## FAQ

### Q: Can I reference issue numbers?

**A:** Yes, but in the body or footer, not the subject:

```
✅ Good:
fix: handle null video ID in parser

Closes #123

❌ Bad:
fix: #123 handle null video ID
```

### Q: What if I made multiple changes before committing?

**A:** Use interactive staging to split into atomic commits:

```bash
# Stage parts of changes interactively
git add -p

# Or use git gui for visual staging
git gui
```

### Q: Can I use emojis?

**A:** Not recommended. Keep it professional and readable in plain text.

### Q: What about merge commits?

**A:** Use default merge commit messages. They're generated automatically.

### Q: How to write breaking changes?

**A:** Use `BREAKING CHANGE:` in footer:

```
feat: redesign API authentication

Change from API keys to JWT tokens for better security
and scalability.

BREAKING CHANGE: API keys no longer supported
Migration: Generate JWT token at /api/auth/token
```

## Enforcement

Commit message format is enforced by:
1. Pre-commit hook (commitlint)
2. CI/CD pipeline validation
3. Code review

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Engineering Standards](../.github/ENGINEERING_STANDARDS.md)
- [Quick Start Guide](./QUICK_START.md)

---

**Remember:** Good commit messages are a love letter to your future self and teammates.
