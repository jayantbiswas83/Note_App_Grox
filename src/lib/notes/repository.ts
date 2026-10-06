import { randomUUID } from "node:crypto";

import { getSql } from "@/lib/db";
import type { Note } from "./store";

export class NotesUnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "NotesUnauthorizedError";
  }
}

export class NotesNotFoundError extends Error {
  readonly status = 404;

  constructor(noteId: string) {
    super(`Note not found: ${noteId}`);
    this.name = "NotesNotFoundError";
  }
}

export class NotesValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "NotesValidationError";
  }
}

type DbNoteRow = {
  id: string;
  user_id: string;
  body: string;
  favorite: boolean;
  archived: boolean;
  trashed: boolean;
  tags: string[];
  created_at: string | Date | null;
  updated_at: string | Date | null;
};

export type NoteCreateInput = Pick<Note, "body"> &
  Partial<Pick<Note, "id" | "favorite" | "archived" | "trashed" | "tags" | "createdAt" | "updatedAt">>;

export type NoteUpdateInput = Partial<Omit<Note, "id" | "createdAt" | "updatedAt">> & {
  body?: string;
  favorite?: boolean;
  archived?: boolean;
  trashed?: boolean;
  tags?: string[];
};

function assertUserId(userId: string | null | undefined): string {
  const value = userId?.trim();
  if (!value) {
    throw new NotesUnauthorizedError();
  }
  return value;
}

function assertNoteId(noteId: string | null | undefined): string {
  const value = noteId?.trim();
  if (!value) {
    throw new NotesValidationError("Invalid note ID");
  }
  return value;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function toMillis(value: string | Date | null | undefined): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Date.now();
  }
  return Date.now();
}

function rowToNote(row: DbNoteRow): Note {
  return {
    id: row.id,
    body: row.body,
    favorite: Boolean(row.favorite),
    archived: Boolean(row.archived),
    trashed: Boolean(row.trashed),
    tags: normalizeTags(row.tags),
    createdAt: toMillis(row.created_at),
    updatedAt: toMillis(row.updated_at),
  };
}

function sanitizeCreateInput(note: NoteCreateInput): {
  id: string;
  body: string;
  favorite: boolean;
  archived: boolean;
  trashed: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
} {
  const body = typeof note.body === "string" ? note.body : "";
  if (!body) {
    throw new NotesValidationError("Note body is required");
  }

  const timestamp = Date.now();
  return {
    id: note.id?.trim() || randomUUID(),
    body,
    favorite: Boolean(note.favorite),
    archived: Boolean(note.archived),
    trashed: Boolean(note.trashed),
    tags: normalizeTags(note.tags),
    createdAt: typeof note.createdAt === "number" ? note.createdAt : timestamp,
    updatedAt: typeof note.updatedAt === "number" ? note.updatedAt : timestamp,
  };
}

export async function listNotes(userId: string): Promise<Note[]> {
  const scopedUserId = assertUserId(userId);

  try {
    const sql = await getSql();
    const rows = await sql.query<DbNoteRow>(
      `
        select id, user_id, body, favorite, archived, trashed, tags, created_at, updated_at
        from public.notes
        where user_id = $1
        order by updated_at desc, created_at desc
      `,
      [scopedUserId],
    );
    return rows.map(rowToNote);
  } catch (error) {
    throw new Error(
      `Failed to list notes for user ${scopedUserId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getNote(userId: string, noteId: string): Promise<Note | null> {
  const scopedUserId = assertUserId(userId);
  const scopedNoteId = assertNoteId(noteId);

  try {
    const sql = await getSql();
    const rows = await sql.query<DbNoteRow>(
      `
        select id, user_id, body, favorite, archived, trashed, tags, created_at, updated_at
        from public.notes
        where user_id = $1 and id = $2
      `,
      [scopedUserId, scopedNoteId],
    );
    return rows[0] ? rowToNote(rows[0]) : null;
  } catch (error) {
    throw new Error(
      `Failed to fetch note ${scopedNoteId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function createNote(userId: string, note: NoteCreateInput): Promise<Note> {
  const scopedUserId = assertUserId(userId);
  const next = sanitizeCreateInput(note);

  try {
    const sql = await getSql();
    const rows = await sql.query<DbNoteRow>(
      `
        insert into public.notes (id, user_id, body, favorite, archived, trashed, tags, created_at, updated_at)
        values ($1, $2, $3, $4, $5, $6, $7, now(), now())
        returning id, user_id, body, favorite, archived, trashed, tags, created_at, updated_at
      `,
      [
        next.id,
        scopedUserId,
        next.body,
        next.favorite,
        next.archived,
        next.trashed,
        next.tags,
      ],
    );

    if (!rows[0]) {
      throw new Error("Note creation returned no row");
    }

    return rowToNote(rows[0]);
  } catch (error) {
    throw new Error(
      `Failed to create note for user ${scopedUserId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  changes: NoteUpdateInput,
): Promise<Note> {
  const scopedUserId = assertUserId(userId);
  const scopedNoteId = assertNoteId(noteId);

  const existing = await getNote(scopedUserId, scopedNoteId);
  if (!existing) {
    throw new NotesNotFoundError(scopedNoteId);
  }

  const merged: Note = {
    ...existing,
    ...changes,
    body: typeof changes.body === "string" ? changes.body : existing.body,
    favorite:
      typeof changes.favorite === "boolean" ? changes.favorite : existing.favorite,
    archived:
      typeof changes.archived === "boolean" ? changes.archived : existing.archived,
    trashed:
      typeof changes.trashed === "boolean" ? changes.trashed : existing.trashed,
    tags: Array.isArray(changes.tags) ? changes.tags : existing.tags,
    updatedAt: Date.now(),
  };

  try {
    const sql = await getSql();
    const rows = await sql.query<DbNoteRow>(
      `
        update public.notes
        set body = $3,
            favorite = $4,
            archived = $5,
            trashed = $6,
            tags = $7,
            updated_at = now()
        where user_id = $1 and id = $2
        returning id, user_id, body, favorite, archived, trashed, tags, created_at, updated_at
      `,
      [scopedUserId, scopedNoteId, merged.body, merged.favorite, merged.archived, merged.trashed, merged.tags],
    );

    if (!rows[0]) {
      throw new NotesNotFoundError(scopedNoteId);
    }

    return rowToNote(rows[0]);
  } catch (error) {
    if (error instanceof NotesNotFoundError) {
      throw error;
    }
    throw new Error(
      `Failed to update note ${scopedNoteId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<boolean> {
  const scopedUserId = assertUserId(userId);
  const scopedNoteId = assertNoteId(noteId);

  try {
    const sql = await getSql();
    const rows = await sql.query<{ id: string }>(
      `
        delete from public.notes
        where user_id = $1 and id = $2
        returning id
      `,
      [scopedUserId, scopedNoteId],
    );
    return rows.length > 0;
  } catch (error) {
    throw new Error(
      `Failed to delete note ${scopedNoteId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
