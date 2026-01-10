# Troubleshooting Guide - CrownCode Development

## Common Issues and Solutions

### Pre-commit Hooks

#### Issue: Pre-commit hook fails with "command not found"

**Solution:**
```bash
# Install pre-commit
pip install pre-commit

# Reinstall hooks
pre-commit uninstall
pre-commit install
```

#### Issue: Branch name validation fails

**Symptom:**
```
Invalid branch name!
```

**Solution:**
```bash
# Check current branch name
git branch --show-current

# Test branch name
python scripts/validate_branch_name.py $(git branch --show-current)

# Rename branch if needed
git branch -m <category>/<proper-name>

# Examples of valid names:
# feature/add-spotify-support
# security/validate-input
# refactor/extract-helpers
```

#### Issue: Commit message rejected

**Symptom:**
```
⧗   input: fix bug
✖   subject may not be empty [subject-empty]
```

**Solution:**
```bash
# Use proper format
git commit -m "fix: resolve audio parser null pointer"

# Valid commit types:
# feat, fix, refactor, security, perf, docs, test, build, ci, style, chore

# Check last commit
git log -1 --pretty=%B

# Amend if needed
git commit --amend
```

### Branch Issues

#### Issue: Can't push to protected branch

**Symptom:**
```
! [remote rejected] main -> main (protected branch hook declined)
```

**Solution:**
```bash
# Never push directly to main/geliştirme
# Create a topic branch instead

git checkout -b feature/my-feature
git push origin feature/my-feature

# Then create a PR on GitHub
```

#### Issue: Wrong branch name format

**Symptom:**
Branch name doesn't follow convention

**Solution:**
```bash
# Check format: <category>/<description>

# Valid categories:
# feature, bugfix, security, refactor, perf, docs, test, tooling, workflow, rules

# Rename branch
git branch -m feature/correct-name

# If already pushed
git push origin -u feature/correct-name
git push origin --delete old-branch-name
```

### Commit Issues

#### Issue: Accidentally mixed multiple changes in one commit

**Solution:**
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stage changes selectively
git add -p

# Commit atomically
git commit -m "feat: add validation"
git add -p
git commit -m "test: add validation tests"
```

#### Issue: Need to fix commit message

**Solution:**
```bash
# If commit not pushed yet
git commit --amend

# If already pushed (avoid if possible)
git commit --amend
git push --force-with-lease

# Better: Add new commit fixing the issue
```

### Build Issues

#### Issue: `make` command not found

**Solution:**
```bash
# On Ubuntu/Debian
sudo apt-get install build-essential

# On macOS
xcode-select --install

# Verify
make --version
```

#### Issue: Python dependencies fail to install

**Solution:**
```bash
# Ensure Python 3.11+
python --version

# Upgrade pip
pip install --upgrade pip

# Install dependencies
cd backend
pip install -r requirements.txt

# If still fails, use virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

#### Issue: Node dependencies fail to install

**Solution:**
```bash
# Ensure Node 20.18.1+
node --version

# Clear cache
npm cache clean --force

# Delete and reinstall
cd platform
rm -rf node_modules package-lock.json
npm install
```

### Validation Issues

#### Issue: `make lint` fails

**Solution:**
```bash
# Backend linting
cd backend
black app/          # Format code
isort app/          # Sort imports
ruff --fix app/     # Fix linting issues

# Frontend linting
cd platform
npm run format      # Format code
npm run lint        # Check for issues
```

#### Issue: Type checking fails

**Solution:**
```bash
# Backend (Python)
cd backend
mypy app/

# Add type hints where missing
# Example: def func(x: int) -> str:

# Frontend (TypeScript)
cd platform
npm run type-check

# Fix TypeScript errors in reported files
```

### Git Issues

#### Issue: Merge conflicts

**Solution:**
```bash
# Update from main
git fetch origin
git merge origin/main

# Resolve conflicts manually in files
# Look for markers: <<<<<<<, =======, >>>>>>>

# After resolving
git add .
git commit -m "chore: resolve merge conflicts"
```

#### Issue: Need to sync with upstream

**Solution:**
```bash
# Add upstream if not already
git remote add upstream https://github.com/Rtur2003/CrownCode.git

# Fetch and merge
git fetch upstream
git merge upstream/main

# Or rebase
git rebase upstream/main

# Push updates
git push origin <your-branch>
```

### CI/CD Issues

#### Issue: CI workflow fails

**Solution:**
```bash
# Check workflow status on GitHub
# Look at failed job logs

# Common issues:
# 1. Linting errors - run `make lint` locally
# 2. Test failures - run `make test` locally
# 3. Build errors - run `make build-backend` or `make build-frontend`

# Fix issues and push again
```

#### Issue: Branch validation fails in CI

**Solution:**
```bash
# Test locally first
python scripts/validate_branch_name.py $(git branch --show-current)

# If invalid, rename branch
git branch -m <category>/<proper-name>
```

### Documentation Issues

#### Issue: Can't find documentation

**Solution:**
All documentation is in the `docs/` directory:

- [Engineering Standards](../.github/ENGINEERING_STANDARDS.md)
- [Quick Start](./QUICK_START.md)
- [Branch Naming](./BRANCH_NAMING.md)
- [Commit Messages](./COMMIT_MESSAGES.md)
- [Development Guidelines](./DEVELOPMENT_GUIDELINES.md)

#### Issue: README outdated

**Solution:**
```bash
# Update README in a docs branch
git checkout -b docs/update-readme

# Make changes
git add README.md
git commit -m "docs: update README with latest info"

# Push and create PR
git push origin docs/update-readme
```

### Setup Issues

#### Issue: `make setup-dev` fails

**Solution:**
```bash
# Run steps individually to identify issue

# 1. Install backend
cd backend
pip install -r requirements.txt

# 2. Install frontend
cd ../platform
npm ci

# 3. Install pre-commit
pip install pre-commit
pre-commit install

# Check what failed and address specifically
```

#### Issue: Pre-commit hooks don't run

**Solution:**
```bash
# Verify installation
pre-commit --version

# Reinstall
pre-commit uninstall
pre-commit install

# Test manually
pre-commit run --all-files

# If still doesn't work, check git hooks
ls -la .git/hooks/
```

## Getting Help

### Search Order

1. **Check this troubleshooting guide**
2. **Review documentation**
   - Engineering Standards
   - Quick Start Guide
   - Development Guidelines
3. **Search existing issues** on GitHub
4. **Check CI logs** for error details
5. **Ask in discussions** on GitHub
6. **Contact maintainers**

### Asking for Help

When asking for help, include:

1. **What you're trying to do**
2. **What you tried**
3. **What error you got** (full error message)
4. **Your environment** (OS, Python version, Node version)
5. **Steps to reproduce**

Example:
```
I'm trying to run `make lint-backend` but getting this error:

Error: command not found: ruff

Environment:
- OS: Ubuntu 22.04
- Python: 3.11.0
- Installed requirements.txt

I tried reinstalling dependencies but same error.
```

### Contact

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and ideas
- **Email:** contact@hasanarthuraltuntas.xyz
- **Security Issues:** security@hasanarthuraltuntas.xyz

## Common Commands Quick Reference

```bash
# Validation
make validate-branch                 # Check branch name
make validate-commits                # Check commit messages
make validate                        # Full validation

# Code Quality
make lint                           # Lint all code
make format                         # Format all code
make test                           # Run all tests

# Development
make dev-backend                    # Start backend
make dev-frontend                   # Start frontend

# Setup
make setup-dev                      # Complete setup
make pre-commit                     # Install hooks

# Git
git status                          # Check status
git log --oneline -5                # Recent commits
git branch --show-current           # Current branch
```

## Prevention Tips

### Before Starting Work

```bash
# 1. Update from main
git fetch origin
git merge origin/main

# 2. Create proper branch
git checkout -b <category>/<topic>

# 3. Run setup if needed
make setup-dev
```

### Before Each Commit

```bash
# 1. Check what changed
git status
git diff

# 2. Stage atomically
git add <specific-files>

# 3. Commit with proper message
git commit -m "<type>: <description>"
```

### Before Pushing

```bash
# 1. Run validation
make validate

# 2. Check commits
git log --oneline -5

# 3. Push
git push origin <branch-name>
```

### Before Creating PR

```bash
# 1. Ensure all commits are atomic
git log --oneline

# 2. Run full validation
make validate

# 3. Update from main
git fetch origin
git merge origin/main

# 4. Create PR using template
```

---

**Still stuck? Don't hesitate to ask for help!**

Open a discussion on GitHub or contact the maintainers.
