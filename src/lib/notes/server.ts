import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

const noteIdSchema = z.object({ noteId: z.string() });

const createNoteSchema = z.object({
  note: z.object({
    id: z.string().optional(),
    body: z.string(),
    favorite: z.boolean().optional(),
    archived: z.boolean().optional(),
    trashed: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  }),
});

const updateNoteSchema = z.object({
  noteId: z.string(),
  changes: z.object({
    body: z.string().optional(),
    favorite: z.boolean().optional(),
    archived: z.boolean().optional(),
    trashed: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const listCurrentUserNotes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listNotes(context.userId));

export const getCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(noteIdSchema)
  .handler(async ({ data, context }) => getNote(context.userId, data.noteId));

export const createCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createNoteSchema)
  .handler(async ({ data, context }) =>
    createNote(context.userId, data.note as NoteCreateInput),
  );

export const updateCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateNoteSchema)
  .handler(async ({ data, context }) =>
    updateNote(context.userId, data.noteId, data.changes as NoteUpdateInput),
  );

export const deleteCurrentUserNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(noteIdSchema)
  .handler(async ({ data, context }) =>
    deleteNote(context.userId, data.noteId),
  );
