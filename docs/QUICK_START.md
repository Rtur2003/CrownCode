# Quick Start Guide - CrownCode Development

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Python 3.11+
- Node.js 20.18.1+
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/Rtur2003/CrownCode.git
cd CrownCode

# 2. Install dependencies
make install

# 3. Setup pre-commit hooks
make pre-commit

# 4. You're ready to contribute!
```

## 📋 Development Workflow

### 1. Start Work on a Topic

```bash
# Create a topic-based branch
git checkout -b <category>/<topic-description>

# Examples:
git checkout -b feature/add-spotify-integration
git checkout -b security/validate-user-input
git checkout -b refactor/extract-audio-helpers
```

**Categories:** `feature`, `bugfix`, `security`, `refactor`, `docs`, `test`, `perf`, `tooling`, `workflow`, `rules`

### 2. Make Changes (Atomically!)

```bash
# Make ONE logical change
# Example: Add input validation function

# Stage and commit (just this one change)
git add backend/app/services/validation.py
git commit -m "security: add video ID format validation"

# Make NEXT logical change
# Example: Use validation in route handler

# Stage and commit (just this one change)
git add backend/app/routes/youtube.py
git commit -m "security: apply video ID validation to route"
```

**Remember:** CHANGE → COMMIT → CHANGE → COMMIT

### 3. Follow Commit Format

```
<type>: <short description>

<optional detailed explanation>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `security:` - Security improvement
- `perf:` - Performance improvement
- `docs:` - Documentation
- `test:` - Tests
- `build:` - Build/dependencies
- `ci:` - CI/CD changes
- `style:` - Code formatting
- `chore:` - Maintenance

### 4. Push and Create PR

```bash
# Push your branch
git push origin <your-branch-name>

# Create PR on GitHub
# Use the PR template provided
```

## 🎯 Quick Reference

### Valid Branch Names

✅ Good:
```
feature/add-spotify-integration
security/validate-user-input
refactor/extract-audio-utils
bugfix/handle-null-video-id
docs/update-api-documentation
```

❌ Bad:
```
my-feature                    # Missing category
feature/Add-Spotify          # Not kebab-case
updates                      # No category
fix_bug                      # Wrong separator
```

### Valid Commit Messages

✅ Good:
```
feat: add Gaussian variance to confidence calculation

Replace linear random variance with Gaussian distribution
to produce more realistic confidence scores.
```

```
security: add input validation for video IDs

Validate video ID format before processing to prevent
injection attacks. Uses regex pattern matching.
```

```
refactor: extract audio processing helpers

Move audio processing functions to separate module
for better reusability and testing.
```

❌ Bad:
```
misc: various improvements
update files
cleanup
fix stuff
WIP
Added some features
```

## 🛠️ Common Commands

### Code Quality

```bash
# Format code
make format              # Format all code
make format-backend      # Format Python only
make format-frontend     # Format TypeScript only

# Lint code
make lint                # Lint all code
make lint-backend        # Lint Python only
make lint-frontend       # Lint TypeScript only

# Run tests
make test                # Run all tests
make test-backend        # Run Python tests
make test-frontend       # Run TypeScript tests

# Security checks
make security            # Run security scans

# Full validation
make validate            # Format, lint, test, security
```

### Development

```bash
# Start dev servers
make dev-backend         # Start Python backend
make dev-frontend        # Start Next.js frontend

# Build
make build-backend       # Build backend
make build-frontend      # Build frontend

# Clean
make clean               # Remove build artifacts
```

### Pre-commit Hooks

```bash
# Setup pre-commit
make pre-commit

# Run manually
pre-commit run --all-files

# Update hooks
pre-commit autoupdate
```

## 📝 Issue Classification

When reporting issues, classify them as:

| Classification | When to Use |
|----------------|-------------|
| **Architecture violation** | Code violates architectural principles |
| **Responsibility leakage** | Concerns are mixed across boundaries |
| **Maintainability risk** | Code is hard to understand or change |
| **Scalability risk** | Won't scale with growth |
| **Safety/robustness gap** | Missing error handling or validation |
| **Developer experience deficiency** | Poor tooling or workflow |
| **Tooling/standards omission** | Missing industry-standard components |

## 🐍 Python-First Approach

### When to Use Python

✅ Use Python for:
- Backend logic
- API services
- Data processing
- ML/AI components
- Automation scripts
- Validation layers

### When You Can Use Other Languages

You may use another language if:
1. Python is technically insufficient (proven)
2. Performance constraints exist (benchmarked)
3. System bindings are unavoidable
4. Frontend UI requirements (TypeScript/React)

**Document justification in PR description!**

## 🔍 PR Checklist

Before submitting:

- [ ] Branch name follows convention
- [ ] All commits are atomic
- [ ] Commit messages follow format
- [ ] No "misc", "cleanup", or vague messages
- [ ] Tests pass locally
- [ ] Code is formatted and linted
- [ ] PR description is complete
- [ ] Issue classification documented
- [ ] Python-first approach followed
- [ ] Safety assurances provided

## ⚠️ Common Mistakes to Avoid

### ❌ Don't:
- Commit directly to `main` or `geliştirme`
- Mix multiple concerns in one commit
- Use vague commit messages
- Skip the PR template
- Batch many changes into one commit
- Use non-Python for backend without justification

### ✅ Do:
- Create topic-based branches
- Make atomic commits
- Write clear commit messages
- Follow the PR template
- One change per commit
- Use Python first for backend

## 🆘 Troubleshooting

### Branch Name Rejected

```bash
# Check branch name
python scripts/validate_branch_name.py $(git branch --show-current)

# Rename branch if needed
git branch -m <category>/<new-name>
```

### Commit Message Rejected

```bash
# Check last commit message
git log -1 --pretty=%B

# Amend if needed
git commit --amend
```

### Pre-commit Hook Fails

```bash
# See what failed
pre-commit run --all-files

# Fix issues and try again
make format
git add .
git commit
```

## 📚 Resources

- [Engineering Standards](../.github/ENGINEERING_STANDARDS.md) - **READ THIS FIRST**
- [Development Guidelines](./DEVELOPMENT_GUIDELINES.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Code of Conduct](./community/CODE_OF_CONDUCT.md)

## 💡 Tips

1. **Start small** - Make small, focused changes
2. **Commit often** - One change, one commit
3. **Read standards** - Understand the rules before starting
4. **Ask questions** - Use GitHub Discussions if unsure
5. **Review examples** - Look at existing PRs as examples

## 🎓 Learning Path

### Day 1: Setup
- [ ] Read Engineering Standards
- [ ] Setup development environment
- [ ] Install pre-commit hooks
- [ ] Run validation commands

### Day 2: Practice
- [ ] Create a practice branch
- [ ] Make atomic commits
- [ ] Run linting and tests
- [ ] Practice formatting commits

### Day 3: Contribute
- [ ] Pick an issue to work on
- [ ] Create proper branch
- [ ] Make atomic commits
- [ ] Submit quality PR

## 🎯 Success Metrics

You're doing it right if:
- ✅ Each commit can be reviewed independently
- ✅ Commit messages explain "why", not just "what"
- ✅ Changes are focused and purposeful
- ✅ Tests pass and code is clean
- ✅ PRs are easy to review

## 🤝 Getting Help

- **Questions:** GitHub Discussions
- **Bug Reports:** GitHub Issues
- **Security:** security@hasanarthuraltuntas.xyz
- **General:** contact@hasanarthuraltuntas.xyz

---

**Welcome to CrownCode! We're excited to have you contribute. 🎉**

Remember: Quality over speed. Respect over convenience.
