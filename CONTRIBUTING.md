# Contributing to CrownCode

Thank you for your interest in contributing to CrownCode! This document provides guidelines and standards for contributing to this project.

## Quick Start

1. Read [Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md)
2. Choose or create an issue to work on
3. Create a topic-based branch
4. Make atomic commits
5. Submit a pull request

## Before You Start

### Required Reading
- [Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md) - MANDATORY
- [Architecture Documentation](./docs/technical/MODULAR_ARCHITECTURE.md)
- [README](./README.md)

### Communication
- Create an issue before starting major work
- Comment on existing issues to claim them
- Ask questions in discussions
- Be respectful and professional

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b <category>/<topic-description>
```

Examples:
- `feature/spotify-integration`
- `security/rate-limiting`
- `refactor/api-client`
- `docs/api-documentation`

### 2. Make Changes

Follow these principles:
- **Python-first**: Use Python for backend logic
- **Atomic commits**: One change per commit
- **Test changes**: Ensure your code works
- **Document code**: Add comments where needed

### 3. Commit Your Work

```bash
git add <files>
git commit -m "<type>: <description>"
```

Commit message format:
```
<type>: <short description>

<optional detailed explanation>
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `security:` Security improvement
- `docs:` Documentation
- `test:` Tests
- `build:` Build system
- `ci:` CI/CD configuration

### 4. Push and Create PR

```bash
git push origin <branch-name>
```

Then create a Pull Request with:
- Clear title
- Detailed description
- List of changes
- Testing notes
- Screenshots (if UI changes)

## Code Standards

### Python (Backend)

```python
# Use type hints
def process_audio(file_path: Path) -> AnalysisResult:
    """
    Process audio file for AI detection.
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Analysis result with confidence score
    """
    pass

# Validate inputs
if not validate_audio_path(file_path):
    raise ValueError("Invalid audio file path")

# Use descriptive names
is_ai_generated = confidence > threshold
```

Standards:
- Use `black` for formatting
- Use `ruff` for linting
- Type hints required
- Docstrings for public functions
- Input validation for all external inputs

### TypeScript (Frontend)

```typescript
// Use TypeScript types
interface AnalysisResult {
  isAIGenerated: boolean
  confidence: number
  modelVersion: string
}

// Async/await for promises
const result = await analyzeAudio(file)

// Descriptive variable names
const isProcessing = state === 'analyzing'
```

Standards:
- Follow existing code style
- Use TypeScript strict mode
- Add JSDoc comments for complex logic
- Handle errors gracefully

### General

- **Clarity over cleverness**
- **No magic numbers** - use constants
- **DRY principle** - don't repeat yourself
- **SOLID principles** - especially Single Responsibility
- **Defensive programming** - validate all inputs

## Testing

### Python Tests

```python
def test_validate_video_id():
    # Valid ID
    assert validate_video_id("dQw4w9WgXcQ") == True
    
    # Invalid - too short
    assert validate_video_id("short") == False
    
    # Invalid - wrong chars
    assert validate_video_id("invalid@char") == False
```

Run tests:
```bash
cd backend
pytest
```

### TypeScript Tests

```typescript
describe('buildSeed', () => {
  it('should return consistent value for same input', async () => {
    const seed1 = await buildSeed('test123')
    const seed2 = await buildSeed('test123')
    expect(seed1).toBe(seed2)
  })
})
```

Run tests:
```bash
cd platform
npm test
```

## Security

### Input Validation

Always validate external inputs:

```python
# Bad
def process_url(url: str):
    parsed = urlparse(url)
    return fetch(parsed)

# Good
def process_url(url: str):
    if not validate_url(url):
        raise ValueError("Invalid URL")
    parsed = urlparse(url)
    return fetch(parsed)
```

### File Operations

Sanitize filenames:

```python
# Bad
file_path = user_input + ".txt"

# Good
safe_name = sanitize_filename(user_input)
file_path = safe_dir / f"{safe_name}.txt"
```

### Common Vulnerabilities

Avoid:
- ❌ SQL injection (use parameterized queries)
- ❌ Path traversal (validate and sanitize paths)
- ❌ XSS (sanitize user input)
- ❌ Command injection (avoid shell=True)
- ❌ Arbitrary code execution

## Documentation

### Code Comments

```python
# Good: Explain WHY, not WHAT
# Use SHA-256 instead of FNV-1a to avoid predictable patterns
seed = hashlib.sha256(video_id.encode()).digest()

# Bad: Obvious statement
# Calculate hash
seed = hashlib.sha256(video_id.encode()).digest()
```

### Docstrings

```python
def analyze_audio(file_path: Path, threshold: float = 0.5) -> dict:
    """
    Analyze audio file for AI-generated content detection.
    
    Uses preview model when main model is unavailable.
    
    Args:
        file_path: Path to audio file (must exist and be valid)
        threshold: Confidence threshold for AI detection (0.0-1.0)
        
    Returns:
        Dictionary containing:
        - is_ai_generated: bool
        - confidence: float (0.0-1.0)
        - indicators: list of detection signals
        
    Raises:
        ValueError: If file_path doesn't exist or threshold invalid
        OSError: If file cannot be read
    """
    pass
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying API
- Adding dependencies

## Pull Request Checklist

Before submitting:

- [ ] Read development guidelines
- [ ] Branch name follows convention
- [ ] Commits are atomic
- [ ] Commit messages follow format
- [ ] Code follows style guide
- [ ] Added/updated tests
- [ ] All tests pass locally
- [ ] Updated documentation
- [ ] No direct commits to main
- [ ] Python-first approach (if backend)
- [ ] Security considerations addressed

## Review Process

### For Contributors

1. Submit PR with clear description
2. Respond to feedback promptly
3. Make changes in new commits (don't squash during review)
4. Mark conversations as resolved
5. Request re-review when ready

### For Reviewers

1. Review commits individually
2. Check for mixed concerns
3. Verify test coverage
4. Test changes locally (if possible)
5. Provide constructive feedback
6. Approve only when all concerns addressed

## Getting Help

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: contact@hasanarthuraltuntas.xyz

## Code of Conduct

### Our Standards

- **Be respectful**: Treat everyone with respect
- **Be constructive**: Provide helpful feedback
- **Be patient**: Remember everyone is learning
- **Be inclusive**: Welcome diverse perspectives

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in commit co-authors

## Thank You

Your contributions make CrownCode better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Open an issue or start a discussion.

**Found a security issue?** Email security@hasanarthuraltuntas.xyz
