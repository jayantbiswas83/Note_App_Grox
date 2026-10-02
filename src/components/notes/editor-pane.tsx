import type { RefObject } from "react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, Menu, PenLine, Trash2, Star, Hash, X, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { FolioCrystalArtwork } from "@/components/notes/folio-crystal-artwork";
import { FolioBrand } from "@/components/notes/folio-brand";
import {
  noteTitle,
  useNotesStore,
  wordCount,
  type Note,
} from "@/lib/notes/store";
import { cn } from "@/lib/utils";

type EditorPaneProps = {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onRequestDelete: () => void;
  onOpenSidebar: () => void;
  modifier: string;
};

export function EditorPane({
  editorRef,
  onRequestDelete,
  onOpenSidebar,
  modifier,
}: EditorPaneProps) {
  const notes = useNotesStore((state) => state.notes);
  const selectedId = useNotesStore((state) => state.selectedId);
  const previewMode = useNotesStore((state) => state.previewMode);
  const togglePreview = useNotesStore((state) => state.togglePreview);
  const hasHydrated = useNotesStore((state) => state.hasHydrated);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const setNoteTags = useNotesStore((state) => state.setNoteTags);
  const createNote = useNotesStore((state) => state.createNote);

  const note = notes.find((entry) => entry.id === selectedId) ?? null;

  if (!hasHydrated) {
    return (
      <div className="flex h-full flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-4">
          <FolioBrand collapsed={true} />
          <span className="font-serif text-lg font-medium">Folio</span>
        </header>
        <div className="mx-auto w-full max-w-3xl flex-1 px-8 py-12">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="mt-8 h-10 w-2/3 rounded-lg bg-muted animate-pulse" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-muted/80 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted/70 animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-full flex-col bg-background select-none">
        {/* Mobile Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4 md:hidden">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Open sidebar"
            onClick={onOpenSidebar}
          >
            <Menu className="size-5" />
          </Button>
          <FolioBrand />
          <div className="w-8" />
        </header>

        {/* Empty State: Crystalline Architectural Hero Visual */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <FolioCrystalArtwork size="hero" />

          <div className="max-w-md space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle/80 px-3 py-1 text-xs font-semibold tracking-wider text-accent border border-accent/20 uppercase">
              <Sparkles className="size-3" />
              Crystal Intelligence
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
              A Quiet Sanctuary for Thought
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your words live locally in this browser — offline-first, distraction-free, and unencumbered.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="button"
              variant="default"
              size="default"
              className="h-10 px-5 gap-2 font-medium shadow-sm shadow-accent/25"
              onClick={() => {
                createNote();
                requestAnimationFrame(() => editorRef.current?.focus());
              }}
            >
              <Plus className="size-4" />
              Compose New Note
            </Button>
          </div>

          {/* Cheatsheet Keycap Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <kbd className="app-kbd">{modifier === "⌘" ? "⌘N" : "Ctrl+N"}</kbd> New
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="app-kbd">{modifier === "⌘" ? "⌘K" : "Ctrl+K"}</kbd> Search
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="app-kbd">{modifier === "⌘" ? "⌘E" : "Ctrl+E"}</kbd> Preview
            </span>
          </div>
        </div>
      </div>
    );
  }

  const words = wordCount(note.body);
  const readTimeMin = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Editor Header Toolbar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-3.5 sm:px-6 bg-background/80 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="shrink-0 md:hidden"
            aria-label="Open sidebar"
            onClick={onOpenSidebar}
          >
            <Menu className="size-4.5" />
          </Button>

          <h1 className="min-w-0 flex-1 overflow-hidden font-serif text-lg font-medium tracking-tight text-foreground truncate">
            {noteTitle(note.body)}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Favorite Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant={note.favorite ? "secondary" : "ghost"}
                aria-pressed={note.favorite}
                aria-label={note.favorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite(note.id)}
                className="size-8.5 rounded-lg"
              >
                <Star
                  className={cn(
                    "size-4 transition-colors",
                    note.favorite ? "fill-amber-400 text-amber-500" : "text-muted-foreground",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {note.favorite ? "Remove favorite" : "Star note"}
            </TooltipContent>
          </Tooltip>

          {/* Preview / Edit Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={previewMode ? "secondary" : "ghost"}
                aria-pressed={previewMode}
                aria-label={previewMode ? "Edit markdown" : "Preview markdown"}
                onClick={() => togglePreview()}
                className={cn(
                  "h-8.5 gap-1.5 px-3 rounded-lg text-xs font-medium transition-all",
                  previewMode
                    ? "bg-accent-subtle text-accent border border-accent/25 shadow-soft"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                {previewMode ? (
                  <>
                    <PenLine className="size-3.5 text-accent" />
                    <span>Editing</span>
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5 text-muted-foreground" />
                    <span>Preview</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {previewMode ? "Return to editor" : "Render markdown"} · {modifier}
              {modifier === "⌘" ? "E" : "+E"}
            </TooltipContent>
          </Tooltip>

          {/* Delete Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Delete note"
                onClick={onRequestDelete}
                className="size-8.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete note · {modifier}
              {modifier === "⌘" ? "⇧⌫" : "+Shift+Del"}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Editor Body or Markdown Preview */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {previewMode ? (
          <div className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-12 sm:py-12 animate-in fade-in-50 duration-200">
            <MarkdownPreview markdown={note.body} />
          </div>
        ) : (
          <NoteEditor key={note.id} note={note} editorRef={editorRef} />
        )}
      </div>

      {/* Bottom Label Tag Bar */}
      <TagBar note={note} onSetTags={setNoteTags} />

      {/* Bottom Editorial Footer */}
      <footer className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-border/70 px-4 sm:px-6 text-xs text-muted-foreground bg-card/40">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent/80" title="Active local session" />
          <time
            dateTime={new Date(note.updatedAt).toISOString()}
            title={`Created ${format(note.createdAt, "MMMM d, yyyy 'at' h:mm a")}`}
            className="truncate tabular-nums font-sans"
          >
            Edited {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
          </time>
        </div>

        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
            <CheckCircle2 className="size-3 text-accent" />
            Local-only
          </span>
          <span className="text-[11px] font-medium text-foreground/80">
            {words} {words === 1 ? "word" : "words"}
            <span className="text-muted-foreground/60 ml-1">· ~{readTimeMin} min read</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function NoteEditor({
  note,
  editorRef,
}: {
  note: Note;
  editorRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const updateNote = useNotesStore((state) => state.updateNote);
  const [draft, setDraft] = useState(note.body);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 py-8 sm:px-12 sm:py-10">
      <span className="sr-only">Note content</span>
      <textarea
        ref={editorRef}
        value={draft}
        spellCheck
        aria-label="Note markdown"
        placeholder="Begin writing — the first line becomes the title…"
        className="note-editor h-full min-h-72 w-full flex-1 resize-none bg-transparent font-serif text-lg sm:text-[1.1875rem] leading-[1.8] text-foreground outline-none selection:bg-accent/20"
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          updateNote(note.id, next);
        }}
      />
    </div>
  );
}

function TagBar({
  note,
  onSetTags,
}: {
  note: Note;
  onSetTags: (id: string, tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const tag = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || note.tags.includes(tag)) {
      setInput("");
      return;
    }
    onSetTags(note.id, [...note.tags, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onSetTags(
      note.id,
      note.tags.filter((t) => t !== tag),
    );
  }

  return (
    <div className="flex h-9.5 shrink-0 items-center gap-2 border-t border-border/70 px-4 sm:px-6 text-xs bg-sidebar/50">
      <Hash className="size-3.5 shrink-0 text-accent/80" />
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto py-1">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent-subtle/90 px-2 py-0.5 text-xs text-accent border border-accent/20 font-medium"
          >
            #{tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
              className="text-accent/60 transition-colors hover:text-accent"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder="Add label…"
        className="w-24 shrink-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}
