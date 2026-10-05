import { useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";
import { NoteSidebar } from "@/components/notes/sidebar";
import { EditorPane } from "@/components/notes/editor-pane";
import { CommandPalette, type CommandType } from "@/components/notes/command-palette";
import { SearchDialog } from "@/components/notes/search-dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotesHydration } from "@/lib/notes/hydrate";
import { filterNotes, filterTrashedNotes, noteTitle, useNotesStore } from "@/lib/notes/store";
import { cn, isMacUserAgent } from "@/lib/utils";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [modifier, setModifier] = useState("Ctrl");

  const notes = useNotesStore((state) => state.notes);
  const selectedId = useNotesStore((state) => state.selectedId);
  const commandPaletteOpen = useNotesStore((state) => state.commandPaletteOpen);
  const createNote = useNotesStore((state) => state.createNote);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const toggleArchive = useNotesStore((state) => state.toggleArchive);
  const moveToTrash = useNotesStore((state) => state.moveToTrash);
  const permanentlyDeleteNote = useNotesStore((state) => state.permanentlyDeleteNote);
  const selectNote = useNotesStore((state) => state.selectNote);
  const setSearch = useNotesStore((state) => state.setSearch);
  const togglePreview = useNotesStore((state) => state.togglePreview);
  const setActiveView = useNotesStore((state) => state.setActiveView);
  const setCommandPaletteOpen = useNotesStore((state) => state.setCommandPaletteOpen);

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
      const visible =
        state.activeView === "trash"
          ? filterTrashedNotes(state.notes, state.search)
          : filterNotes(state.notes, state.search);
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
        if (searchOpen) {
          setSearchOpen(false);
        } else {
          setSearchOpen(true);
        }
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
        setSearchOpen(true);
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
    searchOpen,
    selectNote,
    setSearch,
    togglePreview,
  ]);

  const selected = notes.find((note) => note.id === selectedId) ?? null;
  const selectedIsTrashed = selected?.trashed ?? false;

  function handleCommandSelect(command: CommandType) {
    setCommandPaletteOpen(false);

    switch (command) {
      case "new-note": {
        createNote();
        setMobileOpen(false);
        requestAnimationFrame(() => editorRef.current?.focus());
        break;
      }
      case "search-notes": {
        setSearchOpen(true);
        break;
      }
      case "toggle-preview": {
        togglePreview();
        break;
      }
      case "toggle-favorite": {
        if (selectedId) toggleFavorite(selectedId);
        break;
      }
      case "archive": {
        if (selectedId) toggleArchive(selectedId);
        break;
      }
      case "move-to-trash": {
        if (selectedId) setDeleteOpen(true);
        break;
      }
      case "open-trash": {
        setActiveView("trash");
        setMobileOpen(false);
        break;
      }
      case "open-favorites": {
        setActiveView("favorites");
        setMobileOpen(false);
        break;
      }
      case "open-archived": {
        setActiveView("archived");
        setMobileOpen(false);
        break;
      }
      case "open-tags": {
        setActiveView("tags");
        setMobileOpen(false);
        break;
      }
      case "open-settings": {
        setActiveView("settings");
        setMobileOpen(false);
        break;
      }
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <CollapsedSidebarWrapper>
          <NoteSidebar
            searchRef={desktopSearchRef}
            editorRef={editorRef}
            modifier={modifier}
          />
        </CollapsedSidebarWrapper>

        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent
            showClose={false}
            className="data-[state=open]:slide-in-from-left top-0 left-0 flex h-dvh w-[19.5rem] max-w-[85vw] translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-y-0 border-l-0 border-r border-border/80 bg-sidebar p-0 shadow-2xl sm:max-w-none"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              mobileSearchRef.current?.focus();
            }}
          >
            <DialogTitle className="sr-only">Notes Ledger</DialogTitle>
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

        <main className="relative flex min-w-0 flex-1 flex-col bg-background">
          <EditorPane
            editorRef={editorRef}
            modifier={modifier}
            onOpenSidebar={() => setMobileOpen(true)}
            onRequestDelete={() => {
              if (selectedId) setDeleteOpen(true);
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Keyboard shortcuts"
                className="absolute right-4 bottom-13 hidden size-8 rounded-lg bg-card/80 text-muted-foreground hover:text-foreground md:inline-flex shadow-soft"
                onClick={() => setHelpOpen(true)}
              >
                <Keyboard className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Shortcuts · ?
            </TooltipContent>
          </Tooltip>
        </main>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              {selectedIsTrashed ? "Delete this note forever?" : "Move this note to Trash?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              {selectedIsTrashed
                ? selected
                  ? `“${noteTitle(selected.body)}” will be permanently deleted. This cannot be undone.`
                  : "This note will be permanently deleted. This cannot be undone."
                : selected
                  ? `“${noteTitle(selected.body)}” will be moved to Trash. You can restore it later.`
                  : "This note will be moved to Trash."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {selectedIsTrashed ? "Cancel" : "Keep Note"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedId) return;
                if (selectedIsTrashed) permanentlyDeleteNote(selectedId);
                else moveToTrash(selectedId);
              }}
            >
              {selectedIsTrashed ? "Delete Forever" : "Move to Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-accent-subtle text-accent border border-accent/20">
                <Keyboard className="size-4" />
              </span>
              <DialogTitle className="font-serif text-lg font-medium">Keyboard Shortcuts</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Hand-crafted shortcuts for fluid, distraction-free writing.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1">
            <ShortcutList modifier={modifier} />
          </div>
        </DialogContent>
      </Dialog>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCommandSelect={(command) => {
          handleCommandSelect(command);
        }}
      />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  );
}

function ShortcutList({ modifier }: { modifier: string }) {
  const combo = (key: string) =>
    modifier === "⌘" ? `${modifier}${key}` : `Ctrl+${key}`;

  const rows = [
    [combo("N"), "Compose new note"],
    [combo("K"), "Focus search"],
    ["/", "Search (when not editing)"],
    [combo("E"), "Toggle markdown preview"],
    [combo("⇧⌫"), "Delete selected note"],
    ["↑ ↓", "Navigate note ledger"],
    ["Esc", "Clear search or close panels"],
    ["?", "View keyboard shortcuts"],
  ];

  return (
    <ul className="divide-y divide-border/60">
      {rows.map(([keys, label]) => (
        <li
          key={label}
          className="flex items-center justify-between gap-4 py-2 text-xs"
        >
          <span className="text-foreground/90 font-medium">{label}</span>
          <span className="flex gap-1">
            {keys.split(" ").map((part) => (
              <kbd key={part} className="app-kbd text-[0.6875rem]">
                {part}
              </kbd>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CollapsedSidebarWrapper({ children }: { children: React.ReactNode }) {
  const collapsed = useNotesStore((state) => state.sidebarCollapsed);
  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border/70 md:flex md:flex-col transition-[width] duration-300 ease-smooth bg-sidebar",
        collapsed ? "w-16" : "w-72 xl:w-80",
      )}
    >
      {children}
    </aside>
  );
}
