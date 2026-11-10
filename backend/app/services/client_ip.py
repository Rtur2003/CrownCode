"""The visitor's address behind the Hugging Face proxy."""

from __future__ import annotations

from fastapi import Request


def client_ip(request: Request) -> str:
    """The address rate limits are counted against.

    uvicorn sees the proxy, so request.client alone would put every visitor in
    one bucket; the proxy lists the original client first in X-Forwarded-For.
    """
    forwarded = request.headers.get("x-forwarded-for", "")
    first = forwarded.split(",")[0].strip()
    if first:
        return first
    return request.client.host if request.client else "unknown"
