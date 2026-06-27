import { createRequire } from 'node:module'

/// Thin SQLite read-only wrapper. burnrate runs on Bun (see package.json
/// bin/scripts), so the native `bun:sqlite` driver is used at runtime; when the
/// code happens to run under Node 22.5+ (e.g. some test setups) it falls back to
/// the built-in `node:sqlite`. Neither module is statically imported — the
/// specifier is assembled at runtime so the bundler/transformer (vite, under
/// Node) never tries to resolve a driver that only exists in the other runtime.
/// The exported surface (`SqliteDatabase.query`, `blobToText`,
/// `isSqliteBusyError`) is what the parser and the Cursor/OpenCode/Kilo-Code
/// providers expect. Both databases are only ever read.

type Row = Record<string, unknown>

export type SqliteDatabase = {
  query<T extends Row = Row>(sql: string, params?: unknown[]): T[]
  close(): void
}

const requireDriver = createRequire(import.meta.url)

type OpenFn = (path: string) => SqliteDatabase
let opener: OpenFn | null = null
let loadAttempted = false
let loadError: string | null = null

const textDecoder = new TextDecoder('utf-8', { fatal: false })

/// Safely decode a BLOB column (Uint8Array) to a UTF-8 string. Cursor chat
/// blobs occasionally contain invalid UTF-8 (truncated multi-byte chars). By
/// selecting those columns as `CAST(... AS BLOB)` in SQL we get a Uint8Array
/// here and decode it with a non-fatal decoder, so bad bytes become U+FFFD
/// instead of throwing.
export function blobToText(value: Uint8Array | string | null | undefined): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return textDecoder.decode(value)
}

type BunDb = {
  query(sql: string): { all(...params: unknown[]): Row[] }
  exec(sql: string): void
  close(): void
}
type NodeDb = {
  prepare(sql: string): { all(...params: unknown[]): Row[] }
  exec?(sql: string): void
  close(): void
}

function buildOpener(): OpenFn | null {
  const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined'

  if (isBun) {
    // Assemble the specifier so vite's transformer (Node) never sees a literal
    // 'bun:sqlite' to resolve; this require only runs under the Bun runtime.
    const mod = requireDriver(['bun', 'sqlite'].join(':')) as {
      Database: new (path: string, opts?: { readonly?: boolean }) => BunDb
    }
    return (path: string): SqliteDatabase => {
      const db = new mod.Database(path, { readonly: true })
      try { db.exec('PRAGMA busy_timeout = 1000') } catch { /* best effort */ }
      return {
        query<T extends Row = Row>(sql: string, params: unknown[] = []): T[] {
          return db.query(sql).all(...params) as T[]
        },
        close() { db.close() },
      }
    }
  }

  const mod = requireDriver(['node', 'sqlite'].join(':')) as {
    DatabaseSync: new (path: string, opts?: { readOnly?: boolean }) => NodeDb
  }
  return (path: string): SqliteDatabase => {
    const db = new mod.DatabaseSync(path, { readOnly: true })
    try { db.exec?.('PRAGMA busy_timeout = 1000') } catch { /* best effort */ }
    return {
      query<T extends Row = Row>(sql: string, params: unknown[] = []): T[] {
        return db.prepare(sql).all(...params) as T[]
      },
      close() { db.close() },
    }
  }
}

function loadDriver(): boolean {
  if (loadAttempted) return opener !== null
  loadAttempted = true
  try {
    opener = buildOpener()
    return opener !== null
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    loadError =
      'SQLite-based providers (Cursor, OpenCode) need the Bun runtime (bun:sqlite) ' +
      'or Node 22.5+ (node:sqlite).\n' +
      `(underlying error: ${message})`
    return false
  }
}

export function isSqliteAvailable(): boolean {
  return loadDriver()
}

export function getSqliteLoadError(): string {
  if (loadDriver()) return ''
  return loadError ?? 'SQLite driver not available'
}

export function isSqliteBusyError(err: unknown): boolean {
  const e = err as { code?: unknown; errcode?: unknown; errstr?: unknown; message?: unknown } | null
  const code = typeof e?.code === 'string' ? e.code : ''
  const errcode = typeof e?.errcode === 'number' ? e.errcode : null
  const message = [
    typeof e?.message === 'string' ? e.message : '',
    typeof e?.errstr === 'string' ? e.errstr : '',
  ].join(' ')

  return (
    errcode === 5 ||
    errcode === 6 ||
    code === 'SQLITE_BUSY' ||
    code === 'SQLITE_LOCKED' ||
    /\bSQLITE_(BUSY|LOCKED)\b|database (?:is |table is )?locked/i.test(message)
  )
}

export function openDatabase(path: string): SqliteDatabase {
  if (!loadDriver() || opener === null) {
    throw new Error(getSqliteLoadError())
  }
  return opener(path)
}
