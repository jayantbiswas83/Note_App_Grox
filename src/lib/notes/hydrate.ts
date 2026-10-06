import { useEffect } from "react";
import { useNotesStore, type Note } from "./store";
import { loadServerNotes, serverPersistenceActive } from "./server-sync";

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
    trashed: note.trashed ?? false,
    tags: note.tags ?? [],
    createdAt: note.createdAt ?? Date.now(),
    updatedAt: note.updatedAt ?? Date.now(),
  };
}

/**
 * Load notes from the authenticated server API. On success, replaces the
 * store notes with the server response. On failure or empty result, falls
 * back to localStorage (or seed) so the app is never stuck blank.
 */
async function loadFromServer(): Promise<void> {
  const serverNotes = await loadServerNotes();
  if (serverNotes.length > 0) {
    useNotesStore.setState({
      notes: serverNotes,
      selectedId: serverNotes[0]?.id ?? null,
    });
  } else {
    // Server returned nothing (new account or fetch failed) — fall back to
    // localStorage so a returning dev user keeps their notes, then seed if
    // still empty.
    hydrateFromLocalStorage();
  }
}

function hydrateFromLocalStorage(): void {
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
          persisted.activeView === "trash" ||
          persisted.activeView === "settings"
          ? persisted.activeView
          : "notes",
      activeTag: persisted.activeTag ?? null,
    });
  } else {
    useNotesStore.getState().loadSeed();
  }
}

async function finishHydration() {
  if (useNotesStore.getState().hasHydrated) return;

  if (serverPersistenceActive) {
    // Authenticated mode: load from server first. UI prefs (sidebar,
    // preview mode) still come from localStorage for continuity.
    const persisted = readPersistedNotes();
    useNotesStore.setState({
      previewMode: Boolean(persisted?.previewMode),
      sidebarCollapsed: Boolean(persisted?.sidebarCollapsed),
      activeView:
        persisted?.activeView === "favorites" ||
          persisted?.activeView === "archived" ||
          persisted?.activeView === "tags" ||
          persisted?.activeView === "trash" ||
          persisted?.activeView === "settings"
          ? persisted.activeView
          : "notes",
      activeTag: persisted?.activeTag ?? null,
    });
    await loadFromServer();
  } else {
    // Local dev fallback: localStorage → seed, no server calls.
    hydrateFromLocalStorage();
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
