import type { RefObject } from "react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, Menu, PenLine, Trash2, Star, Hash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownPreview } from "@/components/notes/markdown-preview";
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
  const note = notes.find((entry) => entry.id === selectedId) ?? null;

  if (!hasHydrated) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
          <p className="font-serif text-lg font-medium italic">Folio</p>
        </header>
        <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
          <p className="text-sm text-muted-foreground">Opening notes…</p>
          <div className="mt-6 h-8 w-1/2 rounded-md bg-muted" />
          <div className="mt-6 h-4 w-full rounded-sm bg-muted/80" />
          <div className="mt-3 h-4 w-5/6 rounded-sm bg-muted/70" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="md:hidden"
            aria-label="Open notes"
            onClick={onOpenSidebar}
          >
            <Menu />
          </Button>
          <p className="font-serif text-lg font-medium italic">Folio</p>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-serif text-2xl">Nothing selected</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Choose a note from the list, or create one to start writing.
          </p>
        </div>
      </div>
    );
  }

  const words = wordCount(note.body);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-border px-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="shrink-0 md:hidden"
            aria-label="Open notes"
            onClick={onOpenSidebar}
          >
            <Menu />
          </Button>
          <h1 className="min-w-0 flex-1 overflow-hidden text-lg font-medium tracking-tight text-ellipsis whitespace-nowrap font-serif">
            {noteTitle(note.body)}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant={note.favorite ? "secondary" : "ghost"}
                aria-pressed={note.favorite}
                aria-label={note.favorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite(note.id)}
              >
                <Star className={cn("size-4", note.favorite && "fill-accent text-accent")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Favorite</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant={previewMode ? "secondary" : "ghost"}
                aria-pressed={previewMode}
                aria-label={previewMode ? "Edit markdown" : "Preview markdown"}
                onClick={() => togglePreview()}
              >
                <span className="relative flex size-4 items-center justify-center">
                  <Eye
                    className={cn(
                      "absolute transition-[opacity,transform,filter] duration-200",
                      previewMode
                        ? "scale-100 opacity-100 blur-none"
                        : "scale-[0.25] opacity-0 blur-[4px]",
                    )}
                  />
                  <PenLine
                    className={cn(
                      "transition-[opacity,transform,filter] duration-200",
                      previewMode
                        ? "scale-[0.25] opacity-0 blur-[4px]"
                        : "scale-100 opacity-100 blur-none",
                    )}
                  />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {previewMode ? "Edit" : "Preview"} · {modifier}
              {modifier === "⌘" ? "E" : "+E"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Delete note"
                onClick={onRequestDelete}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete note</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {previewMode ? (
          <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
            <MarkdownPreview markdown={note.body} />
          </div>
        ) : (
          <NoteEditor key={note.id} note={note} editorRef={editorRef} />
        )}
      </div>

      <TagBar note={note} onSetTags={setNoteTags} />

      <footer className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-border px-4 text-xs text-muted-foreground">
        <time
          dateTime={new Date(note.updatedAt).toISOString()}
          title={`Created ${format(note.createdAt, "MMM d, yyyy · h:mm a")}`}
          className="truncate tabular-nums"
        >
          Edited {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
        </time>
        <span className="shrink-0 tabular-nums">
          {words} {words === 1 ? "word" : "words"}
        </span>
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
    <label className="mx-auto flex h-full w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-8">
      <span className="sr-only">Note content</span>
      <textarea
        ref={editorRef}
        value={draft}
        spellCheck
        aria-label="Note markdown"
        placeholder="Start writing — the first line becomes the title"
        className="note-editor h-full min-h-64 w-full resize-none bg-transparent font-serif text-lg leading-relaxed text-foreground outline-none"
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          updateNote(note.id, next);
        }}
      />
    </label>
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
    <div className="flex h-9 shrink-0 items-center gap-2 border-t border-border px-4 text-xs">
      <Hash className="size-3.5 shrink-0 text-muted-foreground" />
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-muted px-2 py-1 text-muted-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
              className="text-muted-foreground/70 transition-colors hover:text-foreground"
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
        placeholder="Add tag…"
        className="w-24 shrink-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
