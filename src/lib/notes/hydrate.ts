import { useEffect } from "react";
import { useNotesStore, type Note } from "./store";

const STORAGE_KEY = "folio-notes-v1";

type PersistedShape = {
  state?: {
    notes?: Note[];
    selectedId?: string | null;
    previewMode?: boolean;
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

function finishHydration() {
  if (useNotesStore.getState().hasHydrated) return;

  const persisted = readPersistedNotes();
  if (persisted?.notes && persisted.notes.length > 0) {
    const selectedId =
      persisted.selectedId &&
      persisted.notes.some((note) => note.id === persisted.selectedId)
        ? persisted.selectedId
        : (persisted.notes[0]?.id ?? null);
    useNotesStore.setState({
      notes: persisted.notes,
      selectedId,
      previewMode: Boolean(persisted.previewMode),
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
