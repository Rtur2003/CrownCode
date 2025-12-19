# Engineering Standards - CrownCode

## Overview

This document defines the absolute standards and practices for contributing to CrownCode.
These are non-negotiable requirements that ensure code quality, maintainability, and professional standards.

## Core Principles

### Zero Tolerance Policy

- **Zero tolerance for technical debt**
- **Zero tolerance for mixed concerns**
- **Zero tolerance for ambiguous commits**
- **Zero tolerance for bulk or squashed logic**
- **Zero tolerance for language choice without justification**
- **Zero tolerance for direct commits to main**

## Branching Strategy (MANDATORY)

### Philosophy
Split work by **TOPIC**, not by file.

### Requirements
Each topic requires:
- One dedicated branch
- Multiple atomic commits
- Exactly one Pull Request

### Branch Naming Convention

```
<category>/<topic-description>
```

#### Categories

| Category | Purpose | Example |
|----------|---------|---------|
| `rules/` | Project rules and conventions | `rules/python-priority` |
| `workflow/` | Development workflow improvements | `workflow/atomic-commits` |
| `tooling/` | Development tools and automation | `tooling/pre-commit-setup` |
| `security/` | Security enhancements | `security/input-validation` |
| `refactor/` | Code refactoring | `refactor/extract-helpers` |
| `feature/` | New features | `feature/spotify-integration` |
| `bugfix/` | Bug fixes | `bugfix/audio-parser-crash` |
| `docs/` | Documentation updates | `docs/api-reference` |
| `perf/` | Performance improvements | `perf/optimize-model-loading` |
| `test/` | Test additions or improvements | `test/validation-coverage` |

### Branch Rules

✅ **DO:**
- Single responsibility per branch
- Clear scope definition
- Related changes only
- Logical grouping

❌ **DON'T:**
- Multiple unrelated features
- Refactoring + new features together
- Bug fixes + enhancements together
- Multiple domains/modules

### Protection Rules

- Direct commits to `main` are **FORBIDDEN**
- Direct commits to `geliştirme` are **FORBIDDEN**
- All changes MUST go through Pull Requests
- All PRs MUST be reviewed before merge

## Commit Discipline (CRITICAL)

### Atomic Commits

Each commit MUST represent:
- **One change**
- **One responsibility**
- **One logical unit**

### Allowed in Single Commit

✅ One function change
✅ One guard addition
✅ One validation layer
✅ One refactor step
✅ One bug fix
✅ One configuration change

### Forbidden in Single Commit

❌ Multiple functions
❌ Refactor + behavior change
❌ Cleanup + feature
❌ "misc", "minor fixes", "cleanup" messages
❌ Batch changes
❌ Squashed logic

### Commit Workflow

```
CHANGE → COMMIT → CHANGE → COMMIT
```

**No batching. No squashing. No postponing commits.**

### Commit Message Format

```
<type>: <short description>

<optional detailed explanation>
<optional technical details>
<optional breaking changes>
```

#### Commit Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat:` | New feature | `feat: add Gaussian variance to confidence calc` |
| `fix:` | Bug fix | `fix: handle null video ID in parser` |
| `refactor:` | Code refactoring (no behavior change) | `refactor: extract language decision helper` |
| `security:` | Security improvement | `security: add input validation for video IDs` |
| `perf:` | Performance improvement | `perf: cache audio fingerprint results` |
| `docs:` | Documentation only | `docs: add API endpoint examples` |
| `test:` | Adding or updating tests | `test: add validation edge cases` |
| `build:` | Build system or dependencies | `build: update pytorch to 2.1.0` |
| `ci:` | CI/CD configuration | `ci: add branch name validation` |
| `style:` | Code style (formatting, naming) | `style: apply black formatting` |
| `chore:` | Maintenance tasks | `chore: update pre-commit hooks` |

#### Good Commit Messages

```
refactor: extract language decision into isolated helper

Move language selection logic to dedicated function
for better testability and maintenance.
```

```
security: add input validation for video IDs

Validate video ID format before processing
to prevent injection attacks.
```

```
feat: add Gaussian variance to confidence calculation

Replace linear random variance with Gaussian distribution
to produce more realistic confidence scores.
```

#### Bad Commit Messages

❌ `misc: various improvements`
❌ `update files`
❌ `cleanup`
❌ `fix stuff`
❌ `WIP`

## Python-First Priority (MANDATORY)

### Default Language: Python

Python is the **primary and default** language for:
- Backend logic implementation
- API services
- Data processing
- Tooling and automation
- Validation layers
- Machine learning components

### When to Use Another Language

You may ONLY use another language if:

1. **Python is technically insufficient** (proven limitation)
2. **Performance constraints are proven** (benchmarks required)
3. **System-level bindings are unavoidable** (no Python alternative)
4. **Frontend UI requirements** (TypeScript/React)

### Justification Required

If choosing non-Python for backend logic, document:
- Why Python cannot solve the problem
- What specific limitation prevents Python usage
- Performance benchmarks (if applicable)
- Technical constraints that block Python
- What Python alternatives were considered

### Examples

✅ **Correct:**
- Use Python for audio processing (librosa)
- Use Python for ML inference (PyTorch)
- Use Python for API endpoints (FastAPI)
- Use TypeScript for UI components (Next.js)

❌ **Incorrect:**
- Using Node.js for data processing when Python can do it
- Using Go for API when Python FastAPI is sufficient
- Using shell scripts when Python script would be clearer

## Design Principles

### Code Quality Standards

1. **Prefer clarity over cleverness**
   - Write code that's obvious, not clever
   - Optimize for readers, not writers

2. **Optimize for reviewers, not authors**
   - Make changes easy to review
   - Keep commits atomic and focused

3. **Optimize for future maintainers**
   - Assume someone will maintain this in 6-12 months
   - Add context where non-obvious

4. **Document the 'why', not the 'what'**
   - Code shows what; comments explain why
   - Explain non-obvious decisions

### Allowed and Expected Changes

You are **allowed and expected** to:
- Rename files, folders, symbols (for clarity)
- Reorganize structure (for better architecture)
- Add missing layers:
  - Configuration separation
  - Validation layers
  - Logging infrastructure
  - Error handling
  - Tooling and standards
  - Testing frameworks

### Constraints

- **Core functional purpose must NOT change** without explicit requirement
- Changes must be **backward compatible** unless breaking change is documented
- All changes must be **independently reviewable**

## Issue Classification (REQUIRED)

Every issue MUST be classified as one of:

### Classification Types

| Classification | Description | Example |
|----------------|-------------|---------|
| **Architecture violation** | Breaks architectural principles | Business logic in controller |
| **Responsibility leakage** | Concerns mixing across boundaries | Validation in service layer |
| **Maintainability risk** | Hard to understand or change | 500-line function |
| **Scalability risk** | Won't scale with growth | In-memory cache for user data |
| **Safety/robustness gap** | Missing error handling/validation | No input validation |
| **Developer experience deficiency** | Poor tooling or workflow | Manual deployment steps |
| **Tooling/standards omission** | Missing industry-standard components | No linting setup |

### Classification Requirements

- **Unclassified issues must NOT be fixed**
- Each PR must reference issue classification
- Classification must be documented in PR description

## Pull Request Requirements

Each PR MUST include:

### 1. Clear Scope Definition
- What is being changed
- Why it's being changed
- What files are affected

### 2. Rationale
- Why the change is necessary
- What was missing or flawed
- What problem this solves

### 3. Non-Changes
- What is intentionally NOT changed
- What is out of scope
- Future work considerations

### 4. Safety Assurance
- How isolation is maintained
- How backward compatibility is preserved
- Testing strategy
- Risk assessment

### 5. Review Guidance
- Key files to review
- Areas needing careful attention
- Known tradeoffs
- Performance implications

## Code Review Process

### Before Submitting PR

✅ Checklist:
- [ ] All commits are atomic
- [ ] Commit messages follow format
- [ ] Branch naming is correct
- [ ] PR description is complete
- [ ] Tests pass locally
- [ ] No direct commits to main
- [ ] Python-first approach followed
- [ ] Issue classification documented

### During Review

Reviewers must verify:
- Each commit is independently reviewable
- Commit messages make sense in isolation
- No mixed concerns
- Python-first approach validated
- Issue classification appropriate
- Safety assurances are sound

### After Review

- Address feedback commit-by-commit
- No squash until approval
- Rebase if requested
- Merge only when approved

## NO TESTING ASSUMPTION RULE

### Forbidden Assumptions

You will NEVER:
- ❌ Run code in production without testing
- ❌ Execute untested code paths
- ❌ Assume runtime behavior without verification

### Required Approach

All changes must be:
- ✅ Reasoned about logically
- ✅ Defensive in nature
- ✅ Statistically low-risk
- ✅ Independently reviewable
- ✅ Tested in isolation

If safety cannot be reasoned about, **the change must be split further**.

## Analysis-First Mandate

Before editing ANY file, you MUST:

1. **Read every file in scope fully**
2. **Understand responsibility boundaries**
3. **Identify data flow and coupling**
4. **Infer original author intent**
5. **Detect missing industry-standard components**

**No edits before comprehension.**
**No assumptions without evidence.**

## Golden Rule

Act as if:
- The upstream author will read every line
- Your name is on the PR
- Quality matters more than speed
- This will be maintained for years

### Success Criteria

If finished correctly, the maintainer should think:

> "This person didn't just use my project — they respected it."

## Attribution Guidelines

### Allowed Attribution

You may add subtle attribution (e.g., `@Rtur2003`) ONLY in:
- Tooling files
- Helper utilities
- Non-business logic
- Debug or guard comments

### Format Examples

```python
# Audio processing utility
# @Rtur2003 - Enhanced for batch processing
def process_audio_batch(files: List[Path]) -> List[Result]:
    pass
```

```python
# Sanity check for development
if not config.is_valid():
    logger.warning("Invalid config detected")  # @Rtur2003
    raise ConfigError("Configuration validation failed")
```

### Forbidden Attribution

Never:
- ❌ Intrusive branding
- ❌ Ego-driven comments
- ❌ Promotional content
- ❌ Attribution in business logic
- ❌ Copyright claims on small changes

## Enforcement

### Automated Enforcement

- Pre-commit hooks validate commit messages
- CI/CD checks branch naming
- Linting enforces code style
- Type checking ensures type safety
- Security scanning catches vulnerabilities

### Manual Enforcement

- Code reviews enforce atomic commits
- PRs validated for classification
- Reviewers check Python-first approach
- Maintainers verify safety assurances

### Violation Consequences

- Non-compliant commits will be rejected
- PRs without classification will be closed
- Direct commits to main will be reverted
- Repeated violations may result in access removal

## Quick Reference

### Commit Message Template

```
<type>: <short description (max 50 chars)>

<detailed explanation (wrap at 72 chars)>
- Why this change is needed
- What problem it solves
- Any tradeoffs or considerations

<breaking changes if any>
BREAKING CHANGE: description
```

### Branch Name Template

```
<category>/<short-kebab-case-description>

Examples:
- feature/add-spotify-support
- security/validate-user-input
- refactor/extract-audio-processing
```

### PR Title Template

```
<Category>: <Clear description of change>

Examples:
- Feature: Add Spotify music source integration
- Security: Implement input validation layer
- Refactor: Extract audio processing utilities
```

## Resources

- [Development Guidelines](../docs/DEVELOPMENT_GUIDELINES.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Code of Conduct](../docs/community/CODE_OF_CONDUCT.md)
- [Security Policy](../docs/community/SECURITY.md)

## Questions?

If you have questions about these standards:
1. Check the [Development Guidelines](../docs/DEVELOPMENT_GUIDELINES.md)
2. Review existing PRs as examples
3. Open a discussion in GitHub Discussions
4. Contact: contact@hasanarthuraltuntas.xyz

---

**Remember:** Quality over speed. Respect over convenience.
