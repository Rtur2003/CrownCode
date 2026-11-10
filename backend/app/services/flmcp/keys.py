"""License key format shared by the client and the license service.

FLMCP-XXXXX-XXXXX-XXXXX-XXXXX: 19 random Crockford base32 characters (95 bits) plus one check
character. Any single mistyped character is caught on the user's machine before a request is made.
"""

from __future__ import annotations

import hashlib
import secrets

ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
PREFIX = "FLMCP"
_FIX = str.maketrans({"O": "0", "I": "1", "L": "1"})


def _check(body: str) -> str:
    """Odd position weights make every single wrong character change the sum."""
    return ALPHABET[sum((2 * i + 1) * ALPHABET.index(ch) for i, ch in enumerate(body)) % 32]


def _format(chars: str) -> str:
    return "-".join([PREFIX, *(chars[i : i + 5] for i in range(0, 20, 5))])


def new_key() -> str:
    body = "".join(secrets.choice(ALPHABET) for _ in range(19))
    return _format(body + _check(body))


def normalize(text: str) -> str | None:
    """Canonical 20-character form of a typed key, or None when it cannot be a key."""
    s = "".join(ch for ch in text.upper() if ch.isalnum())
    if len(s) == len(PREFIX) + 20 and s.startswith(PREFIX):
        s = s[len(PREFIX) :]
    s = s.translate(_FIX)
    if len(s) != 20 or any(ch not in ALPHABET for ch in s):
        return None
    return s if _check(s[:19]) == s[19] else None


def hash_key(text: str) -> str | None:
    s = normalize(text)
    return hashlib.sha256(s.encode()).hexdigest() if s else None


def display(text: str) -> str | None:
    s = normalize(text)
    return _format(s) if s else None

