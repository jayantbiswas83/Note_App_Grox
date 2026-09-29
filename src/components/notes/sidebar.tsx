import type { RefObject } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  filterNotes,
  notePreview,
  noteTitle,
  useNotesStore,
  type Note,
} from "@/lib/notes/store";
import { cn } from "@/lib/utils";

type NoteSidebarProps = {
  searchRef: RefObject<HTMLInputElement | null>;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onNavigate?: () => void;
  modifier: string;
};

export function NoteSidebar({
  searchRef,
  editorRef,
  onNavigate,
  modifier,
}: NoteSidebarProps) {
  const notes = useNotesStore((state) => state.notes);
  const selectedId = useNotesStore((state) => state.selectedId);
  const search = useNotesStore((state) => state.search);
  const setSearch = useNotesStore((state) => state.setSearch);
  const selectNote = useNotesStore((state) => state.selectNote);
  const createNote = useNotesStore((state) => state.createNote);
  const hasHydrated = useNotesStore((state) => state.hasHydrated);

  const visible = filterNotes(notes, search);

  function handleCreate() {
    createNote();
    onNavigate?.();
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function handleSelect(id: string) {
    selectNote(id);
    onNavigate?.();
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div className="flex items-start justify-between gap-3 px-4 pt-5 pb-4">
        <div className="min-w-0">
          <p className="font-serif text-2xl leading-none font-medium tracking-tight italic">
            Folio
          </p>
          <p className="mt-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Notes
          </p>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="default"
          aria-label="New note"
          onClick={handleCreate}
        >
          <Plus />
        </Button>
      </div>

      <div className="px-3 pb-3">
        <label className="relative block">
          <span className="sr-only">Search notes</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="search"
            value={search}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search"
            aria-keyshortcuts="/ Meta+K"
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 border-transparent bg-card/80 pr-12 pl-9"
          />
          <kbd className="app-kbd pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 max-md:hidden">
            {modifier === "⌘" ? "⌘K" : "Ctrl K"}
          </kbd>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5 px-2 pb-4">
          {!hasHydrated ? (
            <SidebarSkeleton />
          ) : visible.length === 0 ? (
            <EmptyList hasNotes={notes.length > 0} query={search} />
          ) : (
            visible.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                selected={note.id === selectedId}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>

      <p className="px-4 py-3 text-xs text-muted-foreground">
        {hasHydrated
          ? search.trim()
            ? `${visible.length} match${visible.length === 1 ? "" : "es"}`
            : `${notes.length} note${notes.length === 1 ? "" : "s"}`
          : "Opening notes"}
      </p>
    </div>
  );
}

function NoteRow({
  note,
  selected,
  onSelect,
}: {
  note: Note;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const title = noteTitle(note.body);
  const preview = notePreview(note.body);
  const stamp = formatDistanceToNow(note.updatedAt, { addSuffix: true });

  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "w-full rounded-md border-l-2 px-3 py-3 text-left transition-colors duration-150 min-h-11",
        selected
          ? "border-accent bg-card text-foreground"
          : "border-transparent text-foreground hover:bg-card/70",
      )}
    >
      <div className="truncate font-serif text-base font-medium tracking-tight">
        {title}
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="truncate text-xs text-muted-foreground">{preview}</p>
        <time
          dateTime={new Date(note.updatedAt).toISOString()}
          className="shrink-0 text-xs text-muted-foreground tabular-nums"
        >
          {stamp}
        </time>
      </div>
    </button>
  );
}

function EmptyList({ hasNotes, query }: { hasNotes: boolean; query: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <FileText className="size-6 text-muted-foreground" />
      <p className="font-serif text-base">
        {hasNotes ? "No matching notes" : "No notes yet"}
      </p>
      <p className="text-sm text-muted-foreground">
        {hasNotes
          ? `Nothing matches “${query.trim()}”.`
          : "Start a note and it will appear here."}
      </p>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-1">
      <p className="px-3 py-3 text-sm text-muted-foreground">Opening notes…</p>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-md px-3 py-3">
          <div className="h-4 w-2/3 rounded-sm bg-muted" />
          <div className="mt-2 h-3 w-full rounded-sm bg-muted/70" />
        </div>
      ))}
    </div>
  );
}
