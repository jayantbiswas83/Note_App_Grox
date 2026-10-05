import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, Star, Archive, Trash2, FileText, Hash, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  noteTitle,
  notePreview,
  sortedNotes,
  useNotesStore,
  type Note,
} from "@/lib/notes/store";

type SearchScope = "all" | "favorites" | "archived" | "trash";

const SCOPES: { id: SearchScope; label: string; icon: typeof FileText }[] = [
  { id: "all", label: "All", icon: FileText },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const notes = useNotesStore((state) => state.notes);
  const selectNote = useNotesStore((state) => state.selectNote);
  const setPreviewMode = useNotesStore((state) => state.setPreviewMode);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool: Note[];

    if (scope === "trash") {
      pool = sortedNotes(notes).filter((n) => n.trashed);
    } else if (scope === "favorites") {
      pool = sortedNotes(notes).filter((n) => n.favorite && !n.trashed);
    } else if (scope === "archived") {
      pool = sortedNotes(notes).filter((n) => n.archived && !n.trashed);
    } else {
      pool = sortedNotes(notes).filter((n) => !n.trashed && !n.archived);
    }

    if (!q) return pool;

    return pool.filter((note) => {
      const title = noteTitle(note.body).toLowerCase();
      const body = note.body.toLowerCase();
      const tags = note.tags.join(" ").toLowerCase();
      return title.includes(q) || body.includes(q) || tags.includes(q);
    });
  }, [notes, query, scope]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, scope]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setScope("all");
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const note = results[selectedIndex];
    if (note) {
      resultRefs.current[note.id]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, results]);

  function openNote(id: string) {
    selectNote(id);
    setPreviewMode(false);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          openNote(results[selectedIndex].id);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  }

  const hasNotes = notes.length > 0;
  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(32rem,calc(100vw-2rem))] flex flex-col overflow-hidden rounded-lg border border-border/80 bg-card p-0 shadow-[0_20px_50px_rgba(24,21,30,0.15)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        )}
        showClose={false}
      >
        <DialogTitle className="sr-only">Search notes</DialogTitle>
        <DialogDescription className="sr-only">
          Search across note titles, content, and tags
        </DialogDescription>

        {/* Search input */}
        <div className="flex h-14 shrink-0 items-center border-b border-border/50 px-3">
          <div className="flex w-full items-center gap-2 px-1">
            <Search className="size-4 shrink-0 text-accent" />
            <Input
              ref={inputRef}
              placeholder="Search notes, content, tags…"
              value={query}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full flex-1 border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scope filters */}
        <div className="flex shrink-0 items-center gap-0.5 border-b border-border/40 px-2 py-1.5">
          {SCOPES.map((s) => {
            const Icon = s.icon;
            const active = scope === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                  active
                    ? "bg-accent-subtle text-accent border border-accent/20"
                    : "text-muted-foreground hover:bg-card-subtle hover:text-foreground border border-transparent",
                )}
              >
                <Icon className="size-3" />
                {s.label}
              </button>
            );
          })}
          {hasResults && (
            <span className="ml-auto pr-1 text-[0.6875rem] tabular-nums text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {!hasNotes ? (
            <EmptyState
              icon={<FileText className="size-5 text-muted-foreground" />}
              heading="No notes yet"
              sub="Create your first note to start searching."
            />
          ) : !hasResults && hasQuery ? (
            <EmptyState
              icon={<Search className="size-5 text-muted-foreground" />}
              heading="No matches found"
              sub={`Nothing matches "${query.trim()}" in ${scope === "all" ? "your notes" : scope}.`}
            />
          ) : !hasResults ? (
            <EmptyState
              icon={
                scope === "favorites" ? (
                  <Star className="size-5 text-amber-500/80" />
                ) : scope === "archived" ? (
                  <Archive className="size-5 text-muted-foreground" />
                ) : scope === "trash" ? (
                  <Trash2 className="size-5 text-muted-foreground" />
                ) : (
                  <FileText className="size-5 text-muted-foreground" />
                )
              }
              heading={
                scope === "favorites"
                  ? "No favorite notes"
                  : scope === "archived"
                    ? "No archived notes"
                    : scope === "trash"
                      ? "Trash is empty"
                      : "Nothing to search"
              }
              sub={
                scope === "favorites"
                  ? "Star a note to see it here."
                  : scope === "archived"
                    ? "Archived notes will appear here."
                    : scope === "trash"
                      ? "Deleted notes stay here until restored."
                      : "Start typing to search your notes."
              }
            />
          ) : (
            <ul className="divide-y divide-border/40">
              {results.map((note, index) => (
                <li key={note.id}>
                  <button
                    ref={(el) => {
                      resultRefs.current[note.id] = el;
                    }}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => openNote(note.id)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none",
                      index === selectedIndex
                        ? "bg-accent-subtle border-l-2 border-accent pl-[calc(0.75rem-2px)]"
                        : "bg-card hover:bg-card-subtle border-l-2 border-l-transparent",
                    )}
                  >
                    <SearchResultRow note={note} query={query.trim()} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-3 py-2">
          <p className="text-[0.6875rem] text-muted-foreground/50 text-center leading-relaxed">
            Navigate: <kbd className="app-kbd">↑ ↓</kbd>{" "}
            <kbd className="app-kbd">Enter</kbd> · Close:{" "}
            <kbd className="app-kbd">Esc</kbd>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchResultRow({ note, query }: { note: Note; query: string }) {
  const title = noteTitle(note.body);
  const preview = notePreview(note.body);
  const stamp = formatDistanceToNow(note.updatedAt, { addSuffix: true });
  const q = query.toLowerCase();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {note.favorite && (
          <Star className="size-3 shrink-0 fill-amber-400 text-amber-500" />
        )}
        <span
          className={cn(
            "truncate font-serif text-sm font-medium tracking-tight text-foreground",
          )}
        >
          {query ? highlight(title, q) : title}
        </span>
      </div>

      {preview !== "Empty note" && (
        <p className="line-clamp-1 text-xs text-muted-foreground/90 leading-relaxed font-sans">
          {query ? highlight(preview, q) : preview}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        {note.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-sm bg-accent-subtle/90 px-1.5 py-0.5 text-[0.625rem] font-medium text-accent border border-accent/15"
              >
                <Hash className="size-2 text-accent/80" />
                {query ? highlight(tag, q) : tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[0.625rem] text-muted-foreground font-medium">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span />
        )}
        <time
          dateTime={new Date(note.updatedAt).toISOString()}
          className="shrink-0 text-[0.6875rem] tabular-nums text-muted-foreground"
        >
          {stamp}
        </time>
      </div>
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text;

  const parts: React.ReactNode[] = [];
  let last = 0;
  let pos = idx;

  while (pos !== -1) {
    if (pos > last) parts.push(text.slice(last, pos));
    parts.push(
      <mark
        key={pos}
        className="rounded-sm bg-accent/20 px-0.5 text-foreground font-medium"
      >
        {text.slice(pos, pos + query.length)}
      </mark>,
    );
    last = pos + query.length;
    pos = lower.indexOf(query, last);
  }
  if (last < text.length) parts.push(text.slice(last));

  return parts;
}

function EmptyState({
  icon,
  heading,
  sub,
}: {
  icon: React.ReactNode;
  heading: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center select-none">
      <div className="flex size-11 items-center justify-center rounded-xl bg-card border border-border/80 shadow-soft">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-medium text-foreground">
          {heading}
        </p>
        <p className="text-xs text-muted-foreground max-w-[16rem] leading-relaxed">
          {sub}
        </p>
      </div>
    </div>
  );
}
