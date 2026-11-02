"""API Errors matching RFC 9457 application/problem+json."""

from __future__ import annotations


class ApiError(Exception):
    """A failure the API reports as application/problem+json (RFC 9457)."""

    def __init__(self, status: int, code: str, detail: str, **extra: object) -> None:
        super().__init__(detail)
        self.status = status
        self.code = code
        self.detail = detail
        self.extra = extra
