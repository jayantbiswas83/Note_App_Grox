import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Note = {
  id: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

type NotesState = {
  notes: Note[];
  selectedId: string | null;
  search: string;
  previewMode: boolean;
  hasHydrated: boolean;
  createNote: () => string;
  deleteNote: (id: string) => void;
  updateNote: (id: string, body: string) => void;
  selectNote: (id: string) => void;
  setSearch: (search: string) => void;
  togglePreview: () => void;
  setPreviewMode: (previewMode: boolean) => void;
  loadSeed: () => void;
};

const SEED_WELCOME = `# Welcome to Folio

A quiet place to write.

Your notes live in this browser — nothing is sent anywhere. The first line of a note becomes its title. Press **⌘E** (or Ctrl+E) to preview markdown as you go.

## A few things to try

- Create a note with **⌘N**
- Search instantly with **⌘K** or \`/\`
- Move through the list with **↑** and **↓**
- Toggle preview, then come back to the words

> Writing works best when the page gets out of the way.
`;

const SEED_MARKDOWN = `# Markdown

Folio speaks common markdown, including tables and task lists.

## Emphasis

*Italic*, **bold**, and \`inline code\`.

## Lists

1. Capture a thought
2. Shape it
3. Come back later

- [x] Write the first line
- [ ] Let the rest follow

## Aside

> Notes can be short. That is allowed.

## Cheatsheet

| Syntax | Result |
| --- | --- |
| \`# Heading\` | Title |
| \`**bold**\` | Strong |
| \`- item\` | Bullet |
| \`[link](url)\` | Link |

\`\`\`ts
const note = {
  title: "Hello",
  persistent: true,
};
\`\`\`
`;

const SEED_SHORTCUTS = `# Shortcuts

Keep your hands on the keyboard.

| Shortcut | Action |
| --- | --- |
| ⌘N / Ctrl+N | New note |
| ⌘K / Ctrl+K | Focus search |
| / | Focus search |
| ⌘E / Ctrl+E | Toggle preview |
| ⌘⇧⌫ / Ctrl+Shift+Backspace | Delete note |
| ↑ ↓ | Move between notes |
| Esc | Clear search, close panels |
| ? | This list |

On a phone, open the sidebar from the menu and swipe through your notes as usual.
`;

export function noteTitle(body: string): string {
  const line = body.split(/\r?\n/).find((entry) => entry.trim().length > 0) ?? "";
  const cleaned = line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^[0-9]+\.\s+/, "")
    .replace(/[*_`]/g, "")
    .trim();
  return cleaned.length > 0 ? cleaned : "Untitled";
}

export function notePreview(body: string): string {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const rest = lines
    .slice(1)
    .join(" ")
    .replace(/^#{1,6}\s+/, "")
    .replace(/[*_`>#\[\]]/g, "")
    .trim();
  if (!rest) return "Empty note";
  return rest.length > 84 ? `${rest.slice(0, 84).trimEnd()}…` : rest;
}

export function wordCount(body: string): number {
  const trimmed = body.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function createSeedNotes(now: number): Note[] {
  return [
    {
      id: "seed-welcome",
      body: SEED_WELCOME,
      createdAt: now - 1000 * 60 * 60 * 26,
      updatedAt: now - 1000 * 60 * 12,
    },
    {
      id: "seed-markdown",
      body: SEED_MARKDOWN,
      createdAt: now - 1000 * 60 * 60 * 30,
      updatedAt: now - 1000 * 60 * 50,
    },
    {
      id: "seed-shortcuts",
      body: SEED_SHORTCUTS,
      createdAt: now - 1000 * 60 * 60 * 48,
      updatedAt: now - 1000 * 60 * 80,
    },
  ];
}

export function sortedNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function filterNotes(notes: Note[], query: string): Note[] {
  const sorted = sortedNotes(notes);
  const q = query.trim().toLowerCase();
  if (!q) return sorted;
  return sorted.filter((note) => {
    return (
      noteTitle(note.body).toLowerCase().includes(q) ||
      note.body.toLowerCase().includes(q)
    );
  });
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedId: null,
      search: "",
      previewMode: false,
      hasHydrated: false,
      createNote: () => {
        const now = Date.now();
        const note: Note = {
          id: crypto.randomUUID(),
          body: "",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          notes: [note, ...state.notes],
          selectedId: note.id,
          search: "",
          previewMode: false,
        }));
        return note.id;
      },
      deleteNote: (id) => {
        set((state) => {
          const ordered = sortedNotes(state.notes);
          const notes = state.notes.filter((note) => note.id !== id);
          let selectedId = state.selectedId;
          if (state.selectedId === id) {
            const index = ordered.findIndex((note) => note.id === id);
            const next = ordered[index + 1] ?? ordered[index - 1];
            selectedId = next && next.id !== id ? next.id : (notes[0]?.id ?? null);
          }
          return { notes, selectedId };
        });
      },
      updateNote: (id, body) => {
        const now = Date.now();
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id !== id) return note;
            if (note.body === body) return note;
            return { ...note, body, updatedAt: now };
          }),
        }));
      },
      selectNote: (id) => {
        if (get().selectedId === id) return;
        set({ selectedId: id });
      },
      setSearch: (search) => set({ search }),
      togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),
      setPreviewMode: (previewMode) => set({ previewMode }),
      loadSeed: () => {
        if (get().notes.length > 0) return;
        const notes = createSeedNotes(Date.now());
        set({ notes, selectedId: notes[0]?.id ?? null });
      },
    }),
    {
      name: "folio-notes-v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notes: state.notes,
        selectedId: state.selectedId,
        previewMode: state.previewMode,
      }),
    },
  ),
);
