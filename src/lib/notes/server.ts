import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/auth/middleware";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  type NoteCreateInput,
  type NoteUpdateInput,
  updateNote,
} from "./repository";

export const listCurrentUserNotes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listNotes(context.userId));

export const getCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const payload = data as unknown;
    const noteId = typeof payload === "string" ? payload : (payload as { noteId?: string } | null | undefined)?.noteId;
    if (!noteId) {
      throw new Error("Invalid note ID");
    }
    return getNote(context.userId, noteId);
  });

export const createCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const payload = (data ?? {}) as Partial<{ note: NoteCreateInput }> | NoteCreateInput;
    const note = "note" in payload && payload.note ? payload.note : (payload as NoteCreateInput);
    return createNote(context.userId, note);
  });

export const updateCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const payload = (data ?? {}) as {
      noteId?: string;
      changes?: NoteUpdateInput;
    };
    if (!payload.noteId) {
      throw new Error("Invalid note ID");
    }
    return updateNote(context.userId, payload.noteId, payload.changes ?? {});
  });

export const deleteCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const payload = data as unknown;
    const noteId = typeof payload === "string" ? payload : (payload as { noteId?: string } | null | undefined)?.noteId;
    if (!noteId) {
      throw new Error("Invalid note ID");
    }
    return deleteNote(context.userId, noteId);
  });
