import { authEnabled } from "@/lib/auth/client";
import type { Note } from "./store";
import {
  createCurrentUserNote,
  deleteCurrentUserNote,
  listCurrentUserNotes,
  updateCurrentUserNote,
} from "./server";
import type { NoteCreateInput, NoteUpdateInput } from "./repository";

/**
 * Server persistence bridge for the Zustand notes store.
 *
 * When auth is enabled (`VITE_AUTH_ENABLED !== "false"`), the store delegates
 * CRUD to the authenticated server functions. The client NEVER sends a
 * `user_id` — ownership is resolved server-side via `authMiddleware` →
 * `context.userId` → `repository`.
 *
 * When auth is disabled (local dev / preview fallback), this module is a
 * no-op and the store keeps using localStorage.
 */

/** True when the store should persist notes through the server API. */
export const serverPersistenceActive = authEnabled;

/**
 * Load all notes for the authenticated user from the server.
 * Returns an empty array if the call fails — the store decides whether to
 * fall back to seed/localStorage.
 */
export async function loadServerNotes(): Promise<Note[]> {
  if (!serverPersistenceActive) return [];
  try {
    return await listCurrentUserNotes();
  } catch (error) {
    console.error("[notes] Failed to load server notes:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Create a note on the server. Returns the server-created note (with
 * canonical timestamps) or `null` on failure so the caller can roll back.
 */
export async function createServerNote(note: Note): Promise<Note | null> {
  if (!serverPersistenceActive) return null;
  const input: NoteCreateInput = {
    id: note.id,
    body: note.body,
    favorite: note.favorite,
    archived: note.archived,
    trashed: note.trashed,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
  try {
    return await createCurrentUserNote({ data: { note: input } }) as Note;
  } catch (error) {
    console.error("[notes] Failed to create server note:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Update a note on the server. Returns the updated note or `null` on failure.
 * Only the changed fields are sent — `user_id` is never included.
 */
export async function updateServerNote(
  noteId: string,
  changes: NoteUpdateInput,
): Promise<Note | null> {
  if (!serverPersistenceActive) return null;
  try {
    return await updateCurrentUserNote({ data: { noteId, changes } });
  } catch (error) {
    console.error("[notes] Failed to update server note:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Delete a note permanently on the server. Returns `true` on success.
 */
export async function deleteServerNote(noteId: string): Promise<boolean> {
  if (!serverPersistenceActive) return false;
  try {
    await deleteCurrentUserNote({ data: { noteId } });
    return true;
  } catch (error) {
    console.error("[notes] Failed to delete server note:", error instanceof Error ? error.message : String(error));
    return false;
  }
}
