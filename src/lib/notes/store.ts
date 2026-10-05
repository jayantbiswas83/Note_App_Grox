import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Note = {
  id: string;
  body: string;
  favorite: boolean;
  archived: boolean;
  trashed: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

export type SidebarView =
  | "notes"
  | "favorites"
  | "archived"
  | "tags"
  | "trash"
  | "settings";

type NotesState = {
  notes: Note[];
  selectedId: string | null;
  search: string;
  previewMode: boolean;
  sidebarCollapsed: boolean;
  activeView: SidebarView;
  activeTag: string | null;
  hasHydrated: boolean;
  createNote: () => string;
  deleteNote: (id: string) => void;
  updateNote: (id: string, body: string) => void;
  selectNote: (id: string) => void;
  setSearch: (search: string) => void;
  togglePreview: () => void;
  setPreviewMode: (previewMode: boolean) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  moveToTrash: (id: string) => void;
  setNoteTags: (id: string, tags: string[]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveView: (view: SidebarView) => void;
  setActiveTag: (tag: string | null) => void;
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

const SEED_IDEAS = `# Ideas

Things to explore when there is time.

- A walking route through the old part of town
- Read *The Peregrine* again
- Try sourdough with a colder proof
- Write a letter to someone I owe one

Tagged with \`personal\` and \`ideas\` so they are easy to find later.
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
    .replace(/[*_`>#[\]]/g, "")
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
      favorite: true,
      archived: false,
      trashed: false,
      tags: [],
      createdAt: now - 1000 * 60 * 60 * 26,
      updatedAt: now - 1000 * 60 * 12,
    },
    {
      id: "seed-markdown",
      body: SEED_MARKDOWN,
      favorite: false,
      archived: false,
      trashed: false,
      tags: ["reference"],
      createdAt: now - 1000 * 60 * 60 * 30,
      updatedAt: now - 1000 * 60 * 50,
    },
    {
      id: "seed-shortcuts",
      body: SEED_SHORTCUTS,
      favorite: false,
      archived: false,
      trashed: false,
      tags: ["reference"],
      createdAt: now - 1000 * 60 * 60 * 48,
      updatedAt: now - 1000 * 60 * 80,
    },
    {
      id: "seed-ideas",
      body: SEED_IDEAS,
      favorite: true,
      archived: false,
      trashed: false,
      tags: ["personal", "ideas"],
      createdAt: now - 1000 * 60 * 60 * 12,
      updatedAt: now - 1000 * 60 * 5,
    },
  ];
}

export function sortedNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function filterNotes(
  notes: Note[],
  query: string,
  includeArchived = false,
): Note[] {
  const sorted = sortedNotes(notes).filter(
    (note) => !note.trashed && (includeArchived || !note.archived),
  );
  const q = query.trim().toLowerCase();
  if (!q) return sorted;
  return sorted.filter((note) => {
    return (
      noteTitle(note.body).toLowerCase().includes(q) ||
      note.body.toLowerCase().includes(q)
    );
  });
}

export function collectTags(notes: Note[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedId: null,
      search: "",
      previewMode: false,
      sidebarCollapsed: false,
      activeView: "notes",
      activeTag: null,
      hasHydrated: false,
      createNote: () => {
        const now = Date.now();
        const note: Note = {
          id: crypto.randomUUID(),
          body: "",
          favorite: false,
          archived: false,
          trashed: false,
          tags: get().activeView === "tags" && get().activeTag ? [get().activeTag as string] : [],
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
      toggleFavorite: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, favorite: !note.favorite, updatedAt: Date.now() } : note,
          ),
        }));
      },
      toggleArchive: (id: string) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, archived: !note.archived, updatedAt: Date.now() }
              : note,
          ),
        }));
      },
      moveToTrash: (id: string) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                ...note,
                trashed: true,
                updatedAt: Date.now(),
              }
              : note,
          ),
        }));
      },
      setNoteTags: (id, tags) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, tags: tags, updatedAt: Date.now() } : note,
          ),
        }));
      },
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveView: (view) => set({ activeView: view, activeTag: view === "tags" ? get().activeTag : null }),
      setActiveTag: (tag) => set({ activeTag: tag }),
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
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
        activeTag: state.activeTag,
      }),
    },
  ),
);
