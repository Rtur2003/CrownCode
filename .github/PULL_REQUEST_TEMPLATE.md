# Pull Request

## Branch Information

**Branch Name:** `<category>/<topic-description>`
**Target Branch:** `main` | `geliştirme`

## Scope Definition

### What is Being Changed
<!-- Provide clear description of what files and components are being modified -->

### Why This Change is Necessary
<!-- Explain the problem this solves or the improvement it provides -->

### Files Affected
<!-- List key files changed in this PR -->
- 
- 
- 

## Issue Classification

<!-- Check ONE that applies to this PR -->
- [ ] **Architecture violation** - Fixes architectural principle violations
- [ ] **Responsibility leakage** - Separates mixed concerns
- [ ] **Maintainability risk** - Improves code clarity or structure
- [ ] **Scalability risk** - Addresses scalability concerns
- [ ] **Safety/robustness gap** - Adds error handling or validation
- [ ] **Developer experience deficiency** - Improves tooling or workflow
- [ ] **Tooling/standards omission** - Adds missing industry-standard components

**Classification Justification:**
<!-- Explain why this classification applies -->

## Rationale

### Problem Statement
<!-- What was missing, flawed, or insufficient? -->

### Solution Approach
<!-- How does this PR solve the problem? -->

### Technical Decisions
<!-- Explain key technical choices made -->

## Non-Changes

### What is Intentionally NOT Changed
<!-- List what is out of scope and why -->

### Future Work
<!-- What should be addressed in future PRs? -->

## Safety Assurance

### Isolation
<!-- How are changes isolated from other components? -->

### Backward Compatibility
<!-- How is backward compatibility maintained? -->

### Testing Strategy
<!-- What testing has been done? -->
- [ ] Unit tests added/updated
- [ ] Integration tests verified
- [ ] Manual testing completed
- [ ] Edge cases covered

### Risk Assessment
<!-- What are the potential risks and how are they mitigated? -->

**Risk Level:** Low | Medium | High
**Mitigation:**

## Python-First Compliance

<!-- If this PR includes backend code -->
- [ ] Python used for all backend logic
- [ ] Non-Python usage justified (if applicable)

**Justification for non-Python code (if any):**
<!-- Explain why Python was insufficient -->

## Commit Quality

### Atomic Commits Checklist
- [ ] Each commit represents one change
- [ ] Commit messages follow format: `<type>: <description>`
- [ ] No mixed concerns in commits
- [ ] Each commit is independently reviewable
- [ ] No "misc", "cleanup", or vague messages

### Commit Summary
<!-- List key commits in this PR -->
1. `<type>: <description>`
2. `<type>: <description>`
3. `<type>: <description>`

## Review Guidance

### Key Files to Review
<!-- Highlight files that need careful attention -->
1. 
2. 
3. 

### Areas Needing Attention
<!-- Point out complex or critical sections -->

### Known Tradeoffs
<!-- Discuss any compromises made -->

### Performance Implications
<!-- Describe any performance impacts -->

## Pre-Submission Checklist

### Code Quality
- [ ] Code follows project style guide
- [ ] Linting passes (`make lint`)
- [ ] Type checking passes (Python: mypy, TypeScript: tsc)
- [ ] Code formatted (Python: black, TypeScript: prettier)
- [ ] No debug print statements
- [ ] No commented-out code

### Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Edge cases tested
- [ ] Error handling tested

### Documentation
- [ ] Code comments added where needed
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] CHANGELOG.md updated

### Security
- [ ] Input validation added
- [ ] No sensitive data in code
- [ ] No security vulnerabilities introduced
- [ ] Dependencies scanned

### Standards Compliance
- [ ] Read [Engineering Standards](./ENGINEERING_STANDARDS.md)
- [ ] Branch naming follows convention
- [ ] Commits are atomic
- [ ] Python-first approach followed
- [ ] Issue classification documented
- [ ] No direct commits to main

## Additional Context

### Related Issues
<!-- Link related issues -->
Closes #
Related to #

### Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

### Performance Benchmarks (if applicable)
<!-- Include before/after metrics for performance changes -->

### Breaking Changes
<!-- List any breaking changes -->
- [ ] No breaking changes
- [ ] Breaking changes documented below

**Breaking Changes:**
<!-- Describe breaking changes and migration path -->

## Reviewer Notes

### Suggested Reviewers
<!-- Tag people with relevant expertise -->
@

### Review Priority
- [ ] Urgent (production issue)
- [ ] High (blocking other work)
- [ ] Normal (standard PR)
- [ ] Low (nice to have)

### Time Estimate
**Estimated review time:** ___ minutes

## Deployment Notes

### Deployment Considerations
<!-- Any special deployment requirements? -->

### Rollback Plan
<!-- How to rollback if issues occur? -->

### Post-Deployment Verification
<!-- How to verify successful deployment? -->

---

## For Reviewers

Please verify:
- [ ] Each commit is atomic and well-described
- [ ] No mixed concerns in commits
- [ ] Branch name follows convention
- [ ] Python-first approach validated (if applicable)
- [ ] Issue classification appropriate
- [ ] Safety assurances sound
- [ ] Tests adequate
- [ ] Documentation complete

## Upstream Readiness

This PR is:
- [ ] Ready for upstream merge
- [ ] Respects original project intent
- [ ] Maintains code quality
- [ ] Leaves project better than found

---

**Thank you for contributing to CrownCode!**

By submitting this PR, I confirm that:
- I have read and followed the [Engineering Standards](./ENGINEERING_STANDARDS.md)
- My changes respect the original project
- Quality matters more than speed
- I'm proud to have my name on this work
