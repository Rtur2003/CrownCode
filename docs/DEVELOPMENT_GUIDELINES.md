# Development Guidelines for CrownCode

## Branching Strategy (MANDATORY)

### Core Principle
**Split work by TOPIC, not by file.**

Each topic requires:
- One dedicated branch
- Multiple atomic commits  
- Exactly one Pull Request

**Direct commits to main are FORBIDDEN.**

### Branch Naming Convention

```
<category>/<topic-description>
```

Examples:
- `rules/python-priority` - Python-first implementation rules
- `workflow/atomic-commits` - Commit discipline workflow
- `tooling/dev-experience` - Developer experience improvements
- `security/input-validation` - Security validation layer
- `refactor/preview-model` - Preview model enhancement

### Categories

- **rules/** - Project rules and conventions
- **workflow/** - Development workflow improvements
- **tooling/** - Development tools and automation
- **security/** - Security enhancements
- **refactor/** - Code refactoring
- **feature/** - New features
- **bugfix/** - Bug fixes
- **docs/** - Documentation updates

### Branch Rules

One branch = one concern  
One concern = one PR

Do NOT combine:
- ❌ Multiple unrelated features
- ❌ Refactoring + new features
- ❌ Bug fixes + enhancements
- ❌ Multiple domains/modules

DO keep focused:
- ✅ Single responsibility
- ✅ Clear scope
- ✅ Related changes only
- ✅ Logical grouping

## Commit Discipline (CRITICAL)

### Atomic Commits

Each commit MUST represent:
- One change
- One responsibility
- One logical unit

### Allowed in Single Commit

- ✅ One function change
- ✅ One guard addition
- ✅ One validation
- ✅ One refactor step
- ✅ One bug fix

### Forbidden in Single Commit

- ❌ Multiple functions
- ❌ Refactor + behavior change
- ❌ Cleanup + feature
- ❌ "misc", "minor fixes", "cleanup" messages
- ❌ Batch changes
- ❌ Squashed logic

### Commit Workflow

```
CHANGE → COMMIT → CHANGE → COMMIT
```

**No batching. No squashing. No postponing commits.**

### Commit Message Format (REQUIRED)

```
<type>: <short description>

<optional detailed explanation>
<optional technical details>
<optional breaking changes>
```

#### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no behavior change)
- `security:` - Security improvement
- `perf:` - Performance improvement
- `docs:` - Documentation only
- `test:` - Adding or updating tests
- `build:` - Build system or dependencies
- `ci:` - CI/CD configuration
- `style:` - Code style (formatting, naming)
- `chore:` - Maintenance tasks

#### Examples

Good:
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

Bad:
```
misc: various improvements
```

```
update files
```

```
cleanup
```

## Python-First Priority

### Default Language: Python

Python is the primary language for:
- Logic implementation
- Tooling and automation
- Glue code
- Validation layers
- Backend services

### When to Use Another Language

You may ONLY use another language if:
1. Python is technically insufficient
2. Performance constraints are proven
3. System-level bindings are unavoidable
4. Frontend UI requirements (TypeScript/React)

### Justification Required

If choosing non-Python for backend logic, you MUST document:
- Why Python cannot solve the problem
- What specific limitation prevents Python usage
- Performance benchmarks if applicable
- Technical constraints that block Python

## Design Principles

### Code Quality
- Prefer clarity over cleverness
- Optimize for reviewers, not authors
- Optimize for future maintainers
- Assume 6-12 months forward maintenance

### Allowed and Expected
- Rename files, folders, symbols
- Reorganize structure
- Add missing layers:
  - Configuration separation
  - Validation
  - Logging
  - Error handling
  - Tooling and standards

### Constraint
Core functional purpose must NOT change without explicit requirement.

## Pull Request Requirements

Each PR MUST include:

1. **Clear scope definition**
   - What is being changed
   - Why it's being changed

2. **Rationale**
   - Why the change is necessary
   - What was missing or flawed

3. **Non-changes**
   - What is intentionally NOT changed
   - What is out of scope

4. **Safety assurance**
   - How isolation is maintained
   - How backward compatibility is preserved
   - Testing strategy

5. **Review guidance**
   - Key files to review
   - Areas needing careful attention
   - Known tradeoffs

## Issue Classification (REQUIRED)

Every detected issue MUST be classified as one of:

- **Architecture violation** - Breaks architectural principles
- **Responsibility leakage** - Concerns mixing across boundaries
- **Maintainability risk** - Hard to understand or change
- **Scalability risk** - Won't scale with growth
- **Safety/robustness gap** - Missing error handling or validation
- **Developer experience deficiency** - Poor tooling or workflow
- **Tooling/standards omission** - Missing industry-standard components

Unclassified issues must NOT be fixed.

## Code Review Process

### Before Review
1. ✅ All commits are atomic
2. ✅ Commit messages follow format
3. ✅ Branch naming is correct
4. ✅ PR description is complete
5. ✅ Tests pass locally
6. ✅ No direct commits to main

### During Review
- Review each commit independently
- Verify commit messages make sense
- Check for mixed concerns
- Validate Python-first approach
- Confirm issue classification

### After Review
- Address feedback commit-by-commit
- No squash until approval
- Rebase if requested
- Merge only when approved

## NO TESTING ASSUMPTION RULE

You will NEVER:
- ❌ Run the code in production
- ❌ Execute tests in production
- ❌ Assume runtime behavior

All changes must be:
- ✅ Reasoned about logically
- ✅ Defensive in nature
- ✅ Statistically low-risk
- ✅ Independently reviewable

If safety cannot be reasoned about, the change must be split further.

## Analysis-First Mandate

Before editing ANY file, you MUST:

1. Read every file in scope fully
2. Understand responsibility boundaries
3. Identify data flow and coupling
4. Infer original author intent
5. Detect missing industry-standard components

**No edits before comprehension.**  
**No assumptions without evidence.**

## Golden Rule

Act as if:
- The upstream author will read every line
- Your name is on the PR
- Quality matters more than speed

If finished correctly, the maintainer should think:

> "This person didn't just use my project — they respected it."

## Attribution

You may add subtle attribution (e.g. @Rtur2003) ONLY in:
- Tooling
- Helpers
- Non-business logic
- Debug or guard comments

Never:
- ❌ Intrusive
- ❌ Branding
- ❌ Ego-driven
