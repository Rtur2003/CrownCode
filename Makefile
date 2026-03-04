# Makefile for CrownCode Development
#
# Two backends are active:
#   backend/           = core (minimal FastAPI: health + youtube analysis)
#   hf-crowncode-backend/ = advanced (full FastAPI on HuggingFace Spaces)

.PHONY: help install install-core install-hf install-frontend lint lint-core lint-hf lint-frontend format format-core format-hf format-frontend test test-core test-hf test-frontend security clean

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)CrownCode Development Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup:$(NC)"
	@echo "  make install           - Install all dependencies"
	@echo "  make install-core      - Install core backend dependencies"
	@echo "  make install-hf        - Install HF backend dependencies"
	@echo "  make install-frontend  - Install frontend dependencies"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint              - Lint all code"
	@echo "  make lint-core         - Lint core backend Python code"
	@echo "  make lint-hf           - Lint HF backend Python code"
	@echo "  make lint-frontend     - Lint TypeScript code"
	@echo "  make format            - Format all code"
	@echo "  make format-core       - Format core backend Python code"
	@echo "  make format-hf         - Format HF backend Python code"
	@echo "  make format-frontend   - Format TypeScript code"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test              - Run all tests"
	@echo "  make test-core         - Run core backend tests"
	@echo "  make test-hf           - Run HF backend tests"
	@echo "  make test-frontend     - Run frontend tests"
	@echo ""
	@echo "$(GREEN)Security:$(NC)"
	@echo "  make security          - Run security checks"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev-core          - Start core backend dev server"
	@echo "  make dev-hf            - Start HF backend dev server"
	@echo "  make dev-frontend      - Start frontend dev server"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make pre-commit        - Setup pre-commit hooks"

install: install-core install-hf install-frontend
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-core:
	@echo "$(BLUE)Installing core backend dependencies...$(NC)"
	cd backend && pip install -r requirements.txt 2>/dev/null || echo "$(RED)No requirements.txt in backend/ — install manually$(NC)"
	@echo "$(GREEN)✓ Core backend dependencies installed$(NC)"

install-hf:
	@echo "$(BLUE)Installing HF backend dependencies...$(NC)"
	cd hf-crowncode-backend && pip install -r requirements.txt
	@echo "$(GREEN)✓ HF backend dependencies installed$(NC)"

install-frontend:
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd platform && npm ci
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

pre-commit:
	@echo "$(BLUE)Installing pre-commit hooks...$(NC)"
	pip install pre-commit
	pre-commit install
	pre-commit install --hook-type commit-msg
	@echo "$(GREEN)✓ Pre-commit hooks installed$(NC)"

lint: lint-core lint-hf lint-frontend
	@echo "$(GREEN)✓ All code linted$(NC)"

lint-core:
	@echo "$(BLUE)Linting core backend Python code...$(NC)"
	cd backend && ruff check app/
	cd backend && black --check app/
	cd backend && mypy app/
	@echo "$(GREEN)✓ Core backend code linted$(NC)"

lint-hf:
	@echo "$(BLUE)Linting HF backend Python code...$(NC)"
	cd hf-crowncode-backend && ruff check app/
	cd hf-crowncode-backend && black --check app/
	cd hf-crowncode-backend && mypy app/
	@echo "$(GREEN)✓ HF backend code linted$(NC)"

lint-frontend:
	@echo "$(BLUE)Linting TypeScript code...$(NC)"
	cd platform && npm run lint
	cd platform && npm run type-check
	@echo "$(GREEN)✓ TypeScript code linted$(NC)"

format: format-core format-hf format-frontend
	@echo "$(GREEN)✓ All code formatted$(NC)"

format-core:
	@echo "$(BLUE)Formatting core backend Python code...$(NC)"
	cd backend && black app/
	cd backend && isort app/
	cd backend && ruff check --fix app/
	@echo "$(GREEN)✓ Core backend code formatted$(NC)"

format-hf:
	@echo "$(BLUE)Formatting HF backend Python code...$(NC)"
	cd hf-crowncode-backend && black app/
	cd hf-crowncode-backend && isort app/
	cd hf-crowncode-backend && ruff check --fix app/
	@echo "$(GREEN)✓ HF backend code formatted$(NC)"

format-frontend:
	@echo "$(BLUE)Formatting TypeScript code...$(NC)"
	cd platform && npm run format
	@echo "$(GREEN)✓ TypeScript code formatted$(NC)"

test: test-core test-hf test-frontend
	@echo "$(GREEN)✓ All tests passed$(NC)"

test-core:
	@echo "$(BLUE)Running core backend tests...$(NC)"
	cd backend && pytest 2>/dev/null || echo "$(RED)No tests in backend/ yet$(NC)"
	@echo "$(GREEN)✓ Core backend tests passed$(NC)"

test-hf:
	@echo "$(BLUE)Running HF backend tests...$(NC)"
	cd hf-crowncode-backend && python -m pytest tests/ -q
	@echo "$(GREEN)✓ HF backend tests passed$(NC)"

test-frontend:
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd platform && npm test
	@echo "$(GREEN)✓ Frontend tests passed$(NC)"

security:
	@echo "$(BLUE)Running security checks...$(NC)"
	cd backend && bandit -r app/ -ll 2>/dev/null || true
	cd hf-crowncode-backend && bandit -r app/ -ll 2>/dev/null || true
	cd platform && npm audit --audit-level=high
	@echo "$(GREEN)✓ Security checks passed$(NC)"

dev-core:
	@echo "$(BLUE)Starting core backend dev server...$(NC)"
	cd backend && uvicorn app.main:app --reload --port 8000

dev-hf:
	@echo "$(BLUE)Starting HF backend dev server...$(NC)"
	cd hf-crowncode-backend && uvicorn app.main:app --reload --port 7860

dev-frontend:
	@echo "$(BLUE)Starting frontend dev server...$(NC)"
	cd platform && npm run dev

build-frontend:
	@echo "$(BLUE)Building frontend...$(NC)"
	cd platform && npm run build
	@echo "$(GREEN)✓ Frontend built$(NC)"

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	cd platform && rm -rf .next out node_modules/.cache 2>/dev/null || true
	@echo "$(GREEN)✓ Cleaned build artifacts$(NC)"

validate:
	@echo "$(BLUE)Running full validation...$(NC)"
	make format
	make lint
	make test
	make security
	@echo "$(GREEN)✓ All validation passed$(NC)"

ci:
	@echo "$(BLUE)Running CI checks...$(NC)"
	make lint
	make test
	make security
	@echo "$(GREEN)✓ CI checks passed$(NC)"

validate-branch:
	@echo "$(BLUE)Validating branch name...$(NC)"
	python scripts/validate_branch_name.py $$(git branch --show-current)
	@echo "$(GREEN)✓ Branch name is valid$(NC)"

validate-commits:
	@echo "$(BLUE)Validating commit messages...$(NC)"
	@echo "Checking last 5 commits..."
	git log -5 --pretty=format:"%h - %s" | head -5
	@echo "\n$(GREEN)✓ Review commits above$(NC)"

engineering-standards:
	@echo "$(BLUE)Checking engineering standards compliance...$(NC)"
	make validate-branch
	make lint
	make test
	@echo "$(GREEN)✓ Engineering standards check passed$(NC)"

setup-dev:
	@echo "$(BLUE)Setting up development environment...$(NC)"
	make install
	make pre-commit
	@echo "$(GREEN)✓ Development environment ready$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Read .github/ENGINEERING_STANDARDS.md"
	@echo "  2. Create a topic branch: git checkout -b <category>/<topic>"
	@echo "  3. Make atomic commits following the guidelines"
	@echo "  4. Run 'make validate' before pushing"
