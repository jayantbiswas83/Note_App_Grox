import { useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";
import { NoteSidebar } from "@/components/notes/sidebar";
import { EditorPane } from "@/components/notes/editor-pane";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNotesHydration } from "@/lib/notes/hydrate";
import { filterNotes, noteTitle, useNotesStore } from "@/lib/notes/store";
import { isMacUserAgent } from "@/lib/utils";

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

export function NotesApp() {
  useNotesHydration();
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [modifier, setModifier] = useState("Ctrl");

  const notes = useNotesStore((state) => state.notes);
  const selectedId = useNotesStore((state) => state.selectedId);
  const createNote = useNotesStore((state) => state.createNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const selectNote = useNotesStore((state) => state.selectNote);
  const setSearch = useNotesStore((state) => state.setSearch);
  const togglePreview = useNotesStore((state) => state.togglePreview);

  useEffect(() => {
    setModifier(isMacUserAgent(navigator.userAgent) ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    }

    function focusSearch() {
      if (isMobileViewport()) {
        setMobileOpen(true);
        return;
      }
      desktopSearchRef.current?.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      const typing = isTypingTarget(event.target);
      const state = useNotesStore.getState();
      const visible = filterNotes(state.notes, state.search);
      const currentId = state.selectedId;

      if (meta && event.key.toLowerCase() === "n") {
        event.preventDefault();
        createNote();
        setMobileOpen(false);
        requestAnimationFrame(() => editorRef.current?.focus());
        return;
      }

      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (meta && event.key.toLowerCase() === "e") {
        event.preventDefault();
        togglePreview();
        return;
      }

      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        return;
      }

      if (
        meta &&
        event.shiftKey &&
        (event.key === "Backspace" || event.key === "Delete")
      ) {
        event.preventDefault();
        if (currentId) setDeleteOpen(true);
        return;
      }

      if (!typing && event.key === "/") {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (!typing && event.key === "?" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (event.key === "Escape") {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (deleteOpen) return;
        if (state.search) {
          event.preventDefault();
          setSearch("");
          return;
        }
        if (mobileOpen) {
          setMobileOpen(false);
          return;
        }
        if (event.target instanceof HTMLElement) event.target.blur();
        return;
      }

      if (!typing && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        if (visible.length === 0) return;
        event.preventDefault();
        const index = Math.max(
          0,
          visible.findIndex((note) => note.id === currentId),
        );
        const nextIndex =
          event.key === "ArrowDown"
            ? Math.min(visible.length - 1, index + 1)
            : Math.max(0, index - 1);
        const next = visible[nextIndex];
        if (next) selectNote(next.id);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    createNote,
    deleteOpen,
    helpOpen,
    mobileOpen,
    selectNote,
    setSearch,
    togglePreview,
  ]);

  const selected = notes.find((note) => note.id === selectedId) ?? null;

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <aside className="hidden w-72 shrink-0 border-r border-border md:flex md:flex-col xl:w-80">
          <NoteSidebar
            searchRef={desktopSearchRef}
            editorRef={editorRef}
            modifier={modifier}
          />
        </aside>

        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent
            showClose={false}
            className="data-[state=open]:slide-in-from-left top-0 left-0 flex h-dvh w-80 max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-y-0 border-l-0 p-0 sm:max-w-none"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              mobileSearchRef.current?.focus();
            }}
          >
            <DialogTitle className="sr-only">Notes</DialogTitle>
            <DialogDescription className="sr-only">
              Search and open your notes
            </DialogDescription>
            <NoteSidebar
              searchRef={mobileSearchRef}
              editorRef={editorRef}
              modifier={modifier}
              onNavigate={() => setMobileOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <main className="relative flex min-w-0 flex-1 flex-col">
          <EditorPane
            editorRef={editorRef}
            modifier={modifier}
            onOpenSidebar={() => setMobileOpen(true)}
            onRequestDelete={() => {
              if (selectedId) setDeleteOpen(true);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Keyboard shortcuts"
            className="absolute right-3 bottom-12 hidden text-muted-foreground md:inline-flex"
            onClick={() => setHelpOpen(true)}
          >
            <Keyboard />
          </Button>
        </main>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected
                ? `“${noteTitle(selected.body)}” will be removed from this device. This cannot be undone.`
                : "This note will be removed from this device."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedId) deleteNote(selectedId);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Use these from anywhere, including the editor.
            </DialogDescription>
          </DialogHeader>
          <ShortcutList modifier={modifier} />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function ShortcutList({ modifier }: { modifier: string }) {
  const combo = (key: string) =>
    modifier === "⌘" ? `${modifier}${key}` : `Ctrl+${key}`;

  const rows = [
    [combo("N"), "New note"],
    [combo("K"), "Search"],
    ["/", "Search (when not typing)"],
    [combo("E"), "Toggle preview"],
    [combo("⇧⌫"), "Delete note"],
    ["↑ ↓", "Move between notes"],
    ["Esc", "Clear search or close"],
    ["?", "Open this panel"],
  ];

  return (
    <ul className="divide-y divide-border">
      {rows.map(([keys, label]) => (
        <li
          key={label}
          className="flex items-center justify-between gap-4 py-2.5"
        >
          <span className="text-sm">{label}</span>
          <span className="flex gap-1">
            {keys.split(" ").map((part) => (
              <kbd key={part} className="app-kbd">
                {part}
              </kbd>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}
