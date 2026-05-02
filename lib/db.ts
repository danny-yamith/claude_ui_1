import path from "path";
import { Database, type SQLQueryBindings } from "bun:sqlite";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "app.db");

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(dbPath);
    db.exec("PRAGMA foreign_keys = ON");
    db.exec("PRAGMA journal_mode = WAL");
  }
  return db;
}

export async function query<T>(sql: string, params?: SQLQueryBindings[]): Promise<T[]> {
  const stmt = getDb().prepare(sql);
  return stmt.all(...(params || [])) as T[];
}

export async function get<T>(sql: string, params?: SQLQueryBindings[]): Promise<T | undefined> {
  const stmt = getDb().prepare(sql);
  return stmt.get(...(params || [])) as T | undefined;
}

export async function run(sql: string, params?: SQLQueryBindings[]): Promise<{ changes: number }> {
  const stmt = getDb().prepare(sql);
  const result = stmt.run(...(params || []));
  return { changes: result.changes };
}

export async function initDb() {
  const db = getDb();

  // better-auth tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      accessTokenExpiresAt TEXT,
      refreshTokenExpiresAt TEXT,
      scope TEXT,
      idToken TEXT,
      password TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      contentJson TEXT NOT NULL,
      isPublic INTEGER NOT NULL DEFAULT 0,
      publicSlug TEXT UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );
  `);

  // indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes(userId);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_publicSlug ON notes(publicSlug);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_isPublic ON notes(isPublic);`);
}
