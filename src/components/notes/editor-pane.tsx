import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, Menu, PenLine, Trash2, Star, Hash, X, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { FormattingToolbar, type FormatAction } from "@/components/notes/formatting-toolbar";
import { SlashCommandMenu, measureSlashAnchor } from "@/components/notes/slash-command-menu";
import { FolioCrystalArtwork } from "@/components/notes/folio-crystal-artwork";
import { FolioBrand } from "@/components/notes/folio-brand";
import {
  noteTitle,
  useNotesStore,
  wordCount,
  type Note,
} from "@/lib/notes/store";
import {
  type Edit,
  type Selection,
  applyLinePrefix,
  applyListPrefix,
  insertCodeBlock,
  insertDivider,
  insertLink,
  toggleInline,
} from "@/lib/notes/markdown-edit";
import { detectSlashQuery, filterSlashCommands, applySlashCommand } from "@/lib/notes/slash-commands";
import { cn } from "@/lib/utils";

type SlashSession = {
  slashIndex: number;
  query: string;
  activeIndex: number;
};

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
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const setNoteTags = useNotesStore((state) => state.setNoteTags);
  const createNote = useNotesStore((state) => state.createNote);
  useEffect(() => {
    if (saveStatus !== "saving") return;

    const timer = window.setTimeout(() => {
      setSaveStatus("saved");
    }, 500);

    return () => window.clearTimeout(timer);
  }, [saveStatus]);
  const note = notes.find((entry) => entry.id === selectedId) ?? null;
  const runFormattingRef = useRef<((action: FormatAction) => void) | null>(null);

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

          <h1 className="min-w-0 flex-1 overflow-hidden font-serif text-xl font-semibold tracking-tight text-foreground truncate">
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

      {/* Formatting Toolbar — only in edit mode, visually secondary */}
      {!previewMode && (
        <div className="flex shrink-0 items-center justify-center border-b border-border/40 bg-background/60 px-3 py-1.5 sm:px-6">
          <FormattingToolbar
            onAction={(action) => runFormattingRef.current?.(action)}
          />
        </div>
      )}

      {/* Editor Body or Markdown Preview */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {previewMode ? (
          <div className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-12 sm:py-12 animate-in fade-in-50 duration-200">
            <MarkdownPreview markdown={note.body} />
          </div>
        ) : (
          <NoteEditor
            key={note.id}
            note={note}
            editorRef={editorRef}
            onReadyFormatting={(fn) => {
              runFormattingRef.current = fn;
            }}
            onSaveStatusChange={setSaveStatus}
          />
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
            <span className="text-muted-foreground/60 ml-3">
              {saveStatus === "saving" ? "Saving…" : "Saved"}
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function NoteEditor({
  note,
  editorRef,
  onReadyFormatting,
  onSaveStatusChange,
}: {
  note: Note;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onReadyFormatting: (fn: (action: FormatAction) => void) => void;
  onSaveStatusChange: (status: "saved" | "saving") => void;
}) {
  const updateNote = useNotesStore((state) => state.updateNote);
  const [draft, setDraft] = useState(note.body);
  const [slash, setSlash] = useState<SlashSession | null>(null);
  const [slashAnchor, setSlashAnchor] = useState<{ top: number; left: number } | null>(null);

  function syncSlash(value: string, start: number, end: number) {
    if (start !== end) {
      setSlash(null);
      return;
    }
    const detected = detectSlashQuery(value, start);
    setSlash((prev) => {
      if (!detected) return null;
      if (prev && prev.slashIndex === detected.slashIndex && prev.query === detected.query) {
        return prev;
      }
      return { ...detected, activeIndex: 0 };
    });
  }

  function applyEdit(edit: Edit) {
    const ta = editorRef.current;
    if (!ta) return;
    setDraft(edit.value);
    updateNote(note.id, edit.value);
    syncSlash(edit.value, edit.selection.start, edit.selection.end);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(edit.selection.start, edit.selection.end);
    });
  }

  function runFormatting(action: FormatAction) {
    const ta = editorRef.current;
    if (!ta) return;
    const value = draft;
    const sel: Selection = {
      start: ta.selectionStart ?? 0,
      end: ta.selectionEnd ?? 0,
    };

    switch (action) {
      case "bold":
        return applyEdit(toggleInline(value, sel, "**"));
      case "italic":
        return applyEdit(toggleInline(value, sel, "_"));
      case "strikethrough":
        return applyEdit(toggleInline(value, sel, "~~"));
      case "code":
        return applyEdit(toggleInline(value, sel, "`"));
      case "link":
        return applyEdit(insertLink(value, sel));
      case "h1":
        return applyEdit(applyLinePrefix(value, sel, "# ", /^#\s+/));
      case "h2":
        return applyEdit(applyLinePrefix(value, sel, "## ", /^##\s+/));
      case "h3":
        return applyEdit(applyLinePrefix(value, sel, "### ", /^###\s+/));
      case "bullet":
        return applyEdit(applyListPrefix(value, sel, "-", /^[-*+]\s+/, false));
      case "numbered":
        return applyEdit(applyListPrefix(value, sel, "1.", /^\d+\.\s+/, true));
      case "checklist":
        return applyEdit(applyLinePrefix(value, sel, "- [ ] ", /^-\s*\[[ xX]\]\s+/));
      case "quote":
        return applyEdit(applyLinePrefix(value, sel, "> ", /^>\s+/));
      case "codeblock":
        return applyEdit(insertCodeBlock(value, sel));
      case "divider":
        return applyEdit(insertDivider(value, sel));
    }
  }

  onReadyFormatting(runFormatting);

  const slashMatches = slash ? filterSlashCommands(slash.query) : [];
  const slashActiveIndex =
    slashMatches.length === 0 ? 0 : Math.min(slash?.activeIndex ?? 0, slashMatches.length - 1);

  useLayoutEffect(() => {
    if (!slash) {
      setSlashAnchor(null);
      return;
    }
    const textarea = editorRef.current;
    if (!textarea) return;

    const update = () => setSlashAnchor(measureSlashAnchor(textarea, slash.slashIndex));
    update();
    textarea.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      textarea.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [slash, draft, editorRef]);

  function commitSlashCommand() {
    if (!slash) return;
    const ta = editorRef.current;
    if (!ta) return;
    const matches = filterSlashCommands(slash.query);
    const idx = Math.min(slash.activeIndex, Math.max(0, matches.length - 1));
    const command = matches[idx];
    if (!command) {
      setSlash(null);
      return;
    }
    const caret = ta.selectionStart;
    const edit = applySlashCommand(draft, caret, slash.slashIndex, command.id);
    setSlash(null);
    applyEdit(edit);
  }

  function moveSlashHighlight(direction: 1 | -1) {
    setSlash((prev) => {
      if (!prev) return prev;
      const count = filterSlashCommands(prev.query).length;
      if (count === 0) return prev;
      const current = Math.min(prev.activeIndex, count - 1);
      const next = Math.min(count - 1, Math.max(0, current + direction));
      if (next === prev.activeIndex) return prev;
      return { ...prev, activeIndex: next };
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 py-8 sm:px-12 sm:py-10">
      <span className="sr-only">Note content</span>
      <textarea
        ref={editorRef}
        value={draft}
        spellCheck
        aria-label="Note markdown"
        aria-expanded={slash ? true : undefined}
        aria-controls={slash ? "folio-slash-listbox" : undefined}
        aria-autocomplete={slash ? "list" : undefined}
        aria-activedescendant={
          slash && slashMatches[slashActiveIndex]
            ? `folio-slash-${slashMatches[slashActiveIndex].id}`
            : undefined
        }
        placeholder="Begin writing — the first line becomes the title…"
        className="note-editor h-full min-h-72 w-full flex-1 resize-none bg-transparent font-serif text-lg sm:text-[1.1875rem] leading-[1.8] text-foreground outline-none selection:bg-accent/20"
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          onSaveStatusChange("saving");
          updateNote(note.id, next);
          syncSlash(next, event.target.selectionStart, event.target.selectionEnd);
        }}
        onSelect={(event) => {
          const target = event.currentTarget;
          syncSlash(target.value, target.selectionStart, target.selectionEnd);
        }}
        onKeyUp={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Escape") return;
          syncSlash(event.currentTarget.value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
        }}
        onBlur={() => setSlash(null)}
        onKeyDown={(event) => {
          // ── Editor keyboard shortcuts ─────────────────────────────────────
          // Scoped to this textarea — no global listener required.
          const mod = event.ctrlKey || event.metaKey;
          if (mod) {
            const shift = event.shiftKey;
            const code = event.code;
            let action: FormatAction | null = null;
            if (!shift && event.key === "b") action = "bold";
            else if (!shift && event.key === "i") action = "italic";
            else if (!shift && code === "Backquote") action = "code";
            else if (shift && (event.key === "X" || event.key === "x")) action = "strikethrough";
            else if (shift && code === "Digit1") action = "h1";
            else if (shift && code === "Digit2") action = "h2";
            else if (shift && code === "Digit3") action = "h3";
            else if (shift && code === "Digit7") action = "numbered";
            else if (shift && code === "Digit8") action = "bullet";
            else if (shift && code === "Digit9") action = "checklist";
            if (action) {
              event.preventDefault();
              runFormatting(action);
              return;
            }
          }
          // ── Slash-command menu navigation ─────────────────────────────────
          if (!slash) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            moveSlashHighlight(1);
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();
            moveSlashHighlight(-1);
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            commitSlashCommand();
            return;
          }
          if (event.key === "Tab") {
            event.preventDefault();
            event.stopPropagation();
            commitSlashCommand();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setSlash(null);
          }
        }}
      />
      {slash && slashAnchor ? (
        <SlashCommandMenu
          commands={slashMatches}
          activeIndex={slashActiveIndex}
          query={slash.query}
          top={slashAnchor.top}
          left={slashAnchor.left}
          onHover={(index) => setSlash((prev) => (prev ? { ...prev, activeIndex: index } : prev))}
          onSelect={commitSlashCommand}
        />
      ) : null}
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
