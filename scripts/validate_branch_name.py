#!/usr/bin/env python3
"""
Branch name validation script.

Ensures branch names follow the required convention:
<category>/<topic-description>

Categories: rules, workflow, tooling, security, refactor, feature, bugfix, docs, perf, test

@Rtur2003
"""

import re
import sys
from typing import Tuple

# Valid branch categories
VALID_CATEGORIES = {
    'rules',
    'workflow',
    'tooling',
    'security',
    'refactor',
    'feature',
    'bugfix',
    'docs',
    'perf',
    'test',
}

# Protected branches (always allowed)
PROTECTED_BRANCHES = {'main', 'master', 'geliştirme', 'arayüz', 'develop'}

# Branch name pattern: <category>/<kebab-case-description>
BRANCH_PATTERN = re.compile(r'^([a-z]+)/([a-z0-9-]+)$')


def validate_branch_name(branch_name: str) -> Tuple[bool, str]:
    """
    Validate branch name follows convention.
    
    Args:
        branch_name: Name of the branch to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    branch_name = branch_name.strip()
    
    if branch_name in PROTECTED_BRANCHES:
        return True, ""
    
    if branch_name.startswith('copilot/'):
        return True, ""
    
    match = BRANCH_PATTERN.match(branch_name)
    if not match:
        return False, (
            f"Branch name '{branch_name}' doesn't match required format.\n"
            f"Expected: <category>/<topic-description>\n"
            f"Example: feature/add-spotify-integration"
        )
    
    category = match.group(1)
    description = match.group(2)
    
    if category not in VALID_CATEGORIES:
        return False, (
            f"Invalid category '{category}'.\n"
            f"Valid categories: {', '.join(sorted(VALID_CATEGORIES))}"
        )
    
    if len(description) < 3:
        return False, "Description too short (minimum 3 characters)"
    
    if len(description) > 50:
        return False, "Description too long (maximum 50 characters)"
    
    if description.startswith('-') or description.endswith('-'):
        return False, "Description cannot start or end with hyphen"
    
    if '--' in description:
        return False, "Description cannot contain consecutive hyphens"
    
    return True, ""


def main() -> int:
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: validate_branch_name.py <branch-name>")
        return 1
    
    branch_name = sys.argv[1]
    is_valid, error_msg = validate_branch_name(branch_name)
    
    if not is_valid:
        print(f"❌ Invalid branch name!\n")
        print(error_msg)
        print("\nValid examples:")
        print("  - feature/add-spotify-integration")
        print("  - security/validate-user-input")
        print("  - refactor/extract-audio-utils")
        print("  - bugfix/handle-null-video-id")
        print("\nSee .github/ENGINEERING_STANDARDS.md for details.")
        return 1
    
    print(f"✅ Branch name '{branch_name}' is valid")
    return 0


if __name__ == '__main__':
    sys.exit(main())
