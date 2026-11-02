"""Database persistence layer for FL-MCP with Hugging Face Persistent Volume and PostgreSQL support.

Ensures ACID compliance and persistence:
- If DATABASE_URL is set (e.g. Supabase, Neon, Render, Railway), connects via PostgreSQL.
- If running on a Hugging Face Space with Persistent Storage mounted at /data, defaults to /data/flmcp.db.
- Otherwise falls back to FLMCP_DB or local file with directory auto-creation.
"""

from __future__ import annotations

import contextlib
import os
import re
import sqlite3
import time
from collections.abc import Callable, Iterator
from pathlib import Path
from typing import Any

SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  key_hash TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','revoked')),
  period_end INTEGER,
  seats_allowed INTEGER NOT NULL DEFAULT 2,
  provider TEXT NOT NULL DEFAULT '',
  provider_ref TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS licenses_ref ON licenses(provider, provider_ref)
  WHERE provider_ref != '';

CREATE TABLE IF NOT EXISTS devices (
  pk INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id TEXT NOT NULL REFERENCES licenses(id),
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  UNIQUE (license_id, device_id)
);

CREATE TABLE IF NOT EXISTS lots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  remaining INTEGER NOT NULL CHECK (remaining >= 0 AND remaining <= amount),
  expires_at INTEGER,
  source TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS lots_account ON lots(account_id, expires_at);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  idem TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('held','settled','expired')),
  ops TEXT NOT NULL,
  cost INTEGER NOT NULL,
  alloc TEXT NOT NULL,
  done TEXT,
  charged INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  settled_at INTEGER,
  UNIQUE (account_id, idem)
);

CREATE INDEX IF NOT EXISTS reservations_open ON reservations(state, expires_at);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  ts INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('grant','hold','release','expire')),
  amount INTEGER NOT NULL,
  ref TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS entries_account ON entries(account_id, id);

CREATE TABLE IF NOT EXISTS webhook_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  PRIMARY KEY (provider, event_id)
);

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  sent_at INTEGER
);
"""

PG_SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  key_hash TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','revoked')),
  period_end BIGINT,
  seats_allowed INTEGER NOT NULL DEFAULT 2,
  provider TEXT NOT NULL DEFAULT '',
  provider_ref TEXT NOT NULL DEFAULT '',
  created_at BIGINT NOT NULL,
  revoked_at BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS licenses_ref ON licenses(provider, provider_ref)
  WHERE provider_ref != '';

CREATE TABLE IF NOT EXISTS devices (
  pk SERIAL PRIMARY KEY,
  license_id TEXT NOT NULL REFERENCES licenses(id),
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at BIGINT NOT NULL,
  last_seen BIGINT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  UNIQUE (license_id, device_id)
);

CREATE TABLE IF NOT EXISTS lots (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  remaining INTEGER NOT NULL CHECK (remaining >= 0 AND remaining <= amount),
  expires_at BIGINT,
  source TEXT UNIQUE,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS lots_account ON lots(account_id, expires_at);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  idem TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('held','settled','expired')),
  ops TEXT NOT NULL,
  cost INTEGER NOT NULL,
  alloc TEXT NOT NULL,
  done TEXT,
  charged INTEGER,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  settled_at BIGINT,
  UNIQUE (account_id, idem)
);

CREATE INDEX IF NOT EXISTS reservations_open ON reservations(state, expires_at);

CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  ts BIGINT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('grant','hold','release','expire')),
  amount INTEGER NOT NULL,
  ref TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS entries_account ON entries(account_id, id);

CREATE TABLE IF NOT EXISTS webhook_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  received_at BIGINT NOT NULL,
  PRIMARY KEY (provider, event_id)
);

CREATE TABLE IF NOT EXISTS outbox (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  sent_at BIGINT
);
"""


def default_db_path() -> str:
    """Detect persistent volume or custom configuration."""
    if os.environ.get("FLMCP_DB"):
        return os.environ["FLMCP_DB"]
    if os.path.isdir("/data") and os.access("/data", os.W_OK):
        # Hugging Face Spaces persistent volume attached at /data
        return "/data/flmcp.db"
    # Local fallback
    data_dir = Path("data")
    data_dir.mkdir(parents=True, exist_ok=True)
    return str(data_dir / "flmcp.db")


class PgCursorWrapper:
    """Wraps Postgres cursor to give dict-like and index-based row access and lastrowid."""

    def __init__(self, raw_cursor: Any) -> None:
        self._cur = raw_cursor

    def execute(self, sql: str, params: tuple | list = ()) -> PgCursorWrapper:
        # Convert SQLite ? parameters to Postgres %s
        pg_sql = sql.replace("?", "%s")
        # Handle 'INSERT OR IGNORE' for Postgres 'ON CONFLICT DO NOTHING'
        if "INSERT OR IGNORE INTO lots" in pg_sql:
            pg_sql = pg_sql.replace("INSERT OR IGNORE INTO lots", "INSERT INTO lots")
            pg_sql += " ON CONFLICT (source) DO NOTHING"
            if "RETURNING id" not in pg_sql:
                pg_sql += " RETURNING id"
        elif "INSERT OR IGNORE INTO webhook_events" in pg_sql:
            pg_sql = pg_sql.replace("INSERT OR IGNORE INTO webhook_events", "INSERT INTO webhook_events")
            pg_sql += " ON CONFLICT (provider, event_id) DO NOTHING"

        self._cur.execute(pg_sql, params)
        return self

    def fetchone(self) -> dict[str, Any] | None:
        row = self._cur.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self) -> list[dict[str, Any]]:
        rows = self._cur.fetchall()
        return [dict(r) for r in rows]

    @property
    def rowcount(self) -> int:
        return self._cur.rowcount

    @property
    def lastrowid(self) -> int | None:
        try:
            return self._cur.fetchone().get("id")
        except Exception:
            return None


class PgConnectionWrapper:
    """Wraps Postgres connection to present the same interface as sqlite3.Connection."""

    def __init__(self, conn: Any) -> None:
        self.conn = conn

    def execute(self, sql: str, params: tuple | list = ()) -> PgCursorWrapper:
        cur = self.conn.cursor()
        wrapper = PgCursorWrapper(cur)
        wrapper.execute(sql, params)
        return wrapper

    def executescript(self, sql: str) -> None:
        with self.conn.cursor() as cur:
            cur.execute(sql)


class DB:
    """Database interface supporting both SQLite (with HF persistent storage) and PostgreSQL."""

    def __init__(
        self,
        db_target: str | None = None,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.clock = clock
        self.database_url = os.environ.get("DATABASE_URL")
        self.is_postgres = bool(self.database_url and (
            self.database_url.startswith("postgres://") or self.database_url.startswith("postgresql://")
        ))

        if self.is_postgres:
            try:
                import psycopg2
                import psycopg2.extras
                self._pg_module = psycopg2
            except ImportError:
                try:
                    import psycopg
                    self._pg_module = psycopg
                except ImportError:
                    raise RuntimeError("PostgreSQL driver (psycopg2 or psycopg) not found. Install psycopg2-binary.")
            self._init_postgres()
        else:
            self.path = db_target or default_db_path()
            Path(self.path).parent.mkdir(parents=True, exist_ok=True)
            self._init_sqlite()

    def _init_sqlite(self) -> None:
        conn = sqlite3.connect(self.path, timeout=15)
        try:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.executescript(SQLITE_SCHEMA)
        finally:
            conn.close()

    def _init_postgres(self) -> None:
        import psycopg2.extras
        conn = self._pg_module.connect(self.database_url)
        try:
            with conn.cursor() as cur:
                cur.execute(PG_SCHEMA)
            conn.commit()
        finally:
            conn.close()

    def now(self) -> int:
        return int(self.clock())

    @contextlib.contextmanager
    def tx(self) -> Iterator[Any]:
        if self.is_postgres:
            import psycopg2.extras
            conn = self._pg_module.connect(self.database_url, cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                wrapper = PgConnectionWrapper(conn)
                yield wrapper
                conn.commit()
            except BaseException:
                conn.rollback()
                raise
            finally:
                conn.close()
        else:
            conn = sqlite3.connect(self.path, timeout=15, isolation_level=None)
            try:
                conn.row_factory = sqlite3.Row
                conn.execute("PRAGMA foreign_keys=ON")
                conn.execute("BEGIN IMMEDIATE")
                try:
                    yield conn
                except BaseException:
                    conn.execute("ROLLBACK")
                    raise
                conn.execute("COMMIT")
            finally:
                conn.close()
