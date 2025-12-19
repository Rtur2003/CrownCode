# Makefile for CrownCode Development

.PHONY: help install install-backend install-frontend lint lint-backend lint-frontend format format-backend format-frontend test test-backend test-frontend security clean

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
	@echo "  make install-backend   - Install backend dependencies"
	@echo "  make install-frontend  - Install frontend dependencies"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint              - Lint all code"
	@echo "  make lint-backend      - Lint Python code"
	@echo "  make lint-frontend     - Lint TypeScript code"
	@echo "  make format            - Format all code"
	@echo "  make format-backend    - Format Python code"
	@echo "  make format-frontend   - Format TypeScript code"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test              - Run all tests"
	@echo "  make test-backend      - Run backend tests"
	@echo "  make test-frontend     - Run frontend tests"
	@echo ""
	@echo "$(GREEN)Security:$(NC)"
	@echo "  make security          - Run security checks"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev-backend       - Start backend dev server"
	@echo "  make dev-frontend      - Start frontend dev server"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make pre-commit        - Setup pre-commit hooks"

install: install-backend install-frontend
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-backend:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && pip install -r requirements.txt
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

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

lint: lint-backend lint-frontend
	@echo "$(GREEN)✓ All code linted$(NC)"

lint-backend:
	@echo "$(BLUE)Linting Python code...$(NC)"
	cd backend && ruff app/
	cd backend && black --check app/
	cd backend && mypy app/
	@echo "$(GREEN)✓ Python code linted$(NC)"

lint-frontend:
	@echo "$(BLUE)Linting TypeScript code...$(NC)"
	cd platform && npm run lint
	cd platform && npm run type-check
	@echo "$(GREEN)✓ TypeScript code linted$(NC)"

format: format-backend format-frontend
	@echo "$(GREEN)✓ All code formatted$(NC)"

format-backend:
	@echo "$(BLUE)Formatting Python code...$(NC)"
	cd backend && black app/
	cd backend && isort app/
	cd backend && ruff --fix app/
	@echo "$(GREEN)✓ Python code formatted$(NC)"

format-frontend:
	@echo "$(BLUE)Formatting TypeScript code...$(NC)"
	cd platform && npm run format
	@echo "$(GREEN)✓ TypeScript code formatted$(NC)"

test: test-backend test-frontend
	@echo "$(GREEN)✓ All tests passed$(NC)"

test-backend:
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && pytest
	@echo "$(GREEN)✓ Backend tests passed$(NC)"

test-frontend:
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd platform && npm test
	@echo "$(GREEN)✓ Frontend tests passed$(NC)"

security:
	@echo "$(BLUE)Running security checks...$(NC)"
	cd backend && bandit -r app/ -ll
	cd platform && npm audit --audit-level=high
	@echo "$(GREEN)✓ Security checks passed$(NC)"

dev-backend:
	@echo "$(BLUE)Starting backend dev server...$(NC)"
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	@echo "$(BLUE)Starting frontend dev server...$(NC)"
	cd platform && npm run dev

build-backend:
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && python -m compileall app/
	@echo "$(GREEN)✓ Backend built$(NC)"

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
