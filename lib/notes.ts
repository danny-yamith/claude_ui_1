import { query, get, run } from "./db";
import { nanoid } from "nanoid";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

const emptyDoc = { type: "doc", content: [] };

export async function createNote(
  userId: string,
  data?: { title?: string; contentJson?: string }
): Promise<Note> {
  const id = nanoid();
  const title = data?.title || "Untitled note";
  const contentJson = data?.contentJson || JSON.stringify(emptyDoc);

  await run(
    `INSERT INTO notes (id, userId, title, contentJson, isPublic, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
    [id, userId, title, contentJson]
  );

  return getNoteById(userId, id) as Promise<Note>;
}

export async function getNoteById(
  userId: string,
  noteId: string
): Promise<Note | null> {
  const row = await get<any>(
    `SELECT * FROM notes WHERE id = ? AND userId = ?`,
    [noteId, userId]
  );

  if (!row) return null;
  return formatNote(row);
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const rows = await query<any>(
    `SELECT * FROM notes WHERE userId = ? ORDER BY updatedAt DESC`,
    [userId]
  );
  return rows.map(formatNote);
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string }>
): Promise<Note | null> {
  const existing = await getNoteById(userId, noteId);
  if (!existing) return null;

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }

  if (data.contentJson !== undefined) {
    updates.push("contentJson = ?");
    values.push(data.contentJson);
  }

  if (updates.length === 0) return existing;

  updates.push("updatedAt = datetime('now')");
  values.push(noteId, userId);

  await run(
    `UPDATE notes SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
    values
  );

  return getNoteById(userId, noteId);
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  await run(`DELETE FROM notes WHERE id = ? AND userId = ?`, [noteId, userId]);
}

export async function setNotePublic(
  userId: string,
  noteId: string,
  isPublic: boolean
): Promise<Note | null> {
  const existing = await getNoteById(userId, noteId);
  if (!existing) return null;

  if (isPublic && !existing.publicSlug) {
    const slug = nanoid(16);
    await run(
      `UPDATE notes SET isPublic = 1, publicSlug = ? WHERE id = ? AND userId = ?`,
      [slug, noteId, userId]
    );
  } else if (!isPublic) {
    await run(
      `UPDATE notes SET isPublic = 0, publicSlug = NULL WHERE id = ? AND userId = ?`,
      [noteId, userId]
    );
  }

  return getNoteById(userId, noteId);
}

export async function getNoteByPublicSlug(slug: string): Promise<Note | null> {
  const row = await get<any>(
    `SELECT * FROM notes WHERE publicSlug = ? AND isPublic = 1`,
    [slug]
  );

  if (!row) return null;
  return formatNote(row);
}

function formatNote(row: any): Note {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    contentJson: row.contentJson,
    isPublic: Boolean(row.isPublic),
    publicSlug: row.publicSlug || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
