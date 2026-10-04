import { useEffect } from "react";
import { useNotesStore, type Note } from "./store";

const STORAGE_KEY = "folio-notes-v1";

type PersistedShape = {
  state?: {
    notes?: Note[];
    selectedId?: string | null;
    previewMode?: boolean;
    sidebarCollapsed?: boolean;
    activeView?: string;
    activeTag?: string | null;
  };
};

function readPersistedNotes(): PersistedShape["state"] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape;
    if (!parsed?.state || !Array.isArray(parsed.state.notes)) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

function migrateNote(note: Partial<Note>): Note {
  return {
    id: note.id ?? crypto.randomUUID(),
    body: note.body ?? "",
    favorite: note.favorite ?? false,
    archived: note.archived ?? false,
    tags: note.tags ?? [],
    createdAt: note.createdAt ?? Date.now(),
    updatedAt: note.updatedAt ?? Date.now(),
  };
}

function finishHydration() {
  if (useNotesStore.getState().hasHydrated) return;

  const persisted = readPersistedNotes();
  if (persisted?.notes && persisted.notes.length > 0) {
    const notes = persisted.notes.map(migrateNote);
    const selectedId =
      persisted.selectedId &&
        notes.some((note) => note.id === persisted.selectedId)
        ? persisted.selectedId
        : (notes[0]?.id ?? null);
    useNotesStore.setState({
      notes,
      selectedId,
      previewMode: Boolean(persisted.previewMode),
      sidebarCollapsed: Boolean(persisted.sidebarCollapsed),
      activeView:
        persisted.activeView === "favorites" ||
          persisted.activeView === "archived" ||
          persisted.activeView === "tags" ||
          persisted.activeView === "settings"
          ? persisted.activeView
          : "notes",
      activeTag: persisted.activeTag ?? null,
    });
  } else {
    useNotesStore.getState().loadSeed();
  }

  useNotesStore.setState({ hasHydrated: true });
}

export function useNotesHydration(): boolean {
  const hasHydrated = useNotesStore((state) => state.hasHydrated);

  useEffect(() => {
    finishHydration();
  }, []);

  return hasHydrated;
}
