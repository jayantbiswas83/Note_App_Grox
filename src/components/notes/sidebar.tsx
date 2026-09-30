import type { RefObject } from "react";
import {
  Plus,
  Search,
  FileText,
  Star,
  Tag,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Hash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  collectTags,
  filterNotes,
  notePreview,
  noteTitle,
  sortedNotes,
  useNotesStore,
  type Note,
  type SidebarView,
} from "@/lib/notes/store";
import { cn } from "@/lib/utils";

type NoteSidebarProps = {
  searchRef: RefObject<HTMLInputElement | null>;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onNavigate?: () => void;
  modifier: string;
};

const NAV_ITEMS: {
  id: SidebarView;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "settings", label: "Settings", icon: Settings },
];

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
  const collapsed = useNotesStore((state) => state.sidebarCollapsed);
  const setCollapsed = useNotesStore((state) => state.setSidebarCollapsed);
  const activeView = useNotesStore((state) => state.activeView);
  const setActiveView = useNotesStore((state) => state.setActiveView);
  const activeTag = useNotesStore((state) => state.activeTag);
  const setActiveTag = useNotesStore((state) => state.setActiveTag);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);

  function handleCreate() {
    createNote();
    onNavigate?.();
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function handleSelect(id: string) {
    selectNote(id);
    onNavigate?.();
  }

  function handleNavClick(view: SidebarView) {
    setActiveView(view);
    if (view !== "tags") setActiveTag(null);
  }

  const tagCounts = collectTags(notes);
  const sortedTagNames = [...tagCounts.keys()].sort((a, b) =>
    a.localeCompare(b),
  );

  let visible: Note[] = [];
  if (activeView === "favorites") {
    visible = filterNotes(
      sortedNotes(notes).filter((n) => n.favorite),
      search,
    );
  } else if (activeView === "tags" && activeTag) {
    visible = filterNotes(
      sortedNotes(notes).filter((n) => n.tags.includes(activeTag)),
      search,
    );
  } else {
    visible = filterNotes(notes, search);
  }

  const favoriteCount = notes.filter((n) => n.favorite).length;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-sidebar transition-[width] duration-300 ease-smooth",
        collapsed ? "w-16" : "w-full",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-3 pt-4 pb-3">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-serif text-2xl leading-none font-medium tracking-tight italic">
              Folio
            </p>
            <p className="mt-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
              Notes
            </p>
          </div>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn("shrink-0 text-muted-foreground", collapsed && "mx-auto")}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-2 pb-2">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            const count =
              item.id === "notes"
                ? notes.length
                : item.id === "favorites"
                  ? favoriteCount
                  : item.id === "tags"
                    ? sortedTagNames.length
                    : undefined;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={active ? "true" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                      {count !== undefined && count > 0 && (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tag list when in Tags view */}
      {activeView === "tags" && !collapsed && (
        <div className="px-3 pb-2">
          {sortedTagNames.length === 0 ? (
            <p className="px-1 py-3 text-sm text-muted-foreground">
              No tags yet. Add tags to a note from its toolbar.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {sortedTagNames.map((tag) => {
                const active = activeTag === tag;
                return (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => setActiveTag(active ? null : tag)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                        active
                          ? "bg-card text-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                      )}
                    >
                      <Hash className="size-3.5 shrink-0" />
                      <span className="flex-1 text-left">{tag}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {tagCounts.get(tag)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Search + New note (hidden in Settings and collapsed) */}
      {activeView !== "settings" && !collapsed && (
        <>
          <div className="px-3 pb-3 pt-1">
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

          <div className="px-3 pb-2">
            <Button
              type="button"
              variant="default"
              className="h-10 w-full justify-start gap-2"
              onClick={handleCreate}
            >
              <Plus className="size-4" />
              New note
            </Button>
          </div>
        </>
      )}

      {activeView === "settings" && !collapsed ? (
        <SettingsPanel />
      ) : (
        <>
          {/* Note list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-0.5 px-2 pb-4">
              {!hasHydrated ? (
                <SidebarSkeleton />
              ) : activeView === "tags" && !activeTag ? (
                <TagHint />
              ) : visible.length === 0 ? (
                <EmptyList
                  hasNotes={notes.length > 0}
                  query={search}
                  view={activeView}
                />
              ) : (
                visible.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    selected={note.id === selectedId}
                    onSelect={handleSelect}
                    onToggleFavorite={toggleFavorite}
                    collapsed={collapsed}
                  />
                ))
              )}
            </div>
          </div>

          {!collapsed && (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              {hasHydrated
                ? search.trim()
                  ? `${visible.length} match${visible.length === 1 ? "" : "es"}`
                  : `${visible.length} note${visible.length === 1 ? "" : "s"}`
                : "Opening notes"}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function NoteRow({
  note,
  selected,
  onSelect,
  onToggleFavorite,
  collapsed,
}: {
  note: Note;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  collapsed: boolean;
}) {
  const title = noteTitle(note.body);
  const preview = notePreview(note.body);
  const stamp = formatDistanceToNow(note.updatedAt, { addSuffix: true });

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onSelect(note.id)}
        aria-label={title}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex size-10 items-center justify-center rounded-md text-sm transition-colors duration-150",
          selected
            ? "bg-card text-foreground shadow-soft"
            : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
        )}
      >
        {note.favorite ? (
          <Star className="size-4 text-accent fill-accent" />
        ) : (
          <FileText className="size-4" />
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group relative rounded-md border-l-2 transition-colors duration-150",
        selected
          ? "border-accent bg-card text-foreground"
          : "border-transparent text-foreground hover:bg-card/70",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(note.id)}
        aria-current={selected ? "true" : undefined}
        className="w-full px-3 py-3 text-left min-h-11"
      >
        <div className="flex items-center gap-1.5">
          {note.favorite && (
            <Star className="size-3.5 shrink-0 text-accent fill-accent" />
          )}
          <div className="truncate font-serif text-base font-medium tracking-tight">
            {title}
          </div>
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
        {note.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-sm bg-muted px-1.5 py-0.5 text-[0.625rem] text-muted-foreground"
              >
                <Hash className="size-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(note.id);
        }}
        aria-label={note.favorite ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "absolute top-2.5 right-2 size-7 rounded-md opacity-0 transition-opacity duration-150 hover:bg-muted group-hover:opacity-100",
          note.favorite && "opacity-100",
        )}
      >
        {note.favorite ? (
          <Star className="size-3.5 text-accent fill-accent" />
        ) : (
          <Star className="size-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function TagHint() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Tag className="size-6 text-muted-foreground" />
      <p className="font-serif text-base">Select a tag</p>
      <p className="text-sm text-muted-foreground">
        Choose a tag above to see notes with that tag.
      </p>
    </div>
  );
}

function EmptyList({
  hasNotes,
  query,
  view,
}: {
  hasNotes: boolean;
  query: string;
  view: SidebarView;
}) {
  const heading =
    view === "favorites"
      ? hasNotes
        ? "No favorite notes"
        : "No favorites yet"
      : hasNotes
        ? "No matching notes"
        : "No notes yet";
  const sub =
    view === "favorites"
      ? "Star a note to pin it here."
      : hasNotes
        ? `Nothing matches "${query.trim()}".`
        : "Start a note and it will appear here.";
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <FileText className="size-6 text-muted-foreground" />
      <p className="font-serif text-base">{heading}</p>
      <p className="text-sm text-muted-foreground">{sub}</p>
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

function SettingsPanel() {
  const notes = useNotesStore((state) => state.notes);
  const favoriteCount = notes.filter((n) => n.favorite).length;
  const tagCount = collectTags(notes).size;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
      <h2 className="mt-2 font-serif text-lg font-medium">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your notes are stored locally in this browser.
      </p>

      <dl className="mt-5 flex flex-col gap-3">
        <StatRow label="Total notes" value={notes.length} />
        <StatRow label="Favorites" value={favoriteCount} />
        <StatRow label="Tags" value={tagCount} />
      </dl>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="text-sm font-medium">About</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Folio is a quiet, local-first notes app. Write in markdown, star
          your favorites, and organize with tags. Nothing leaves your device.
        </p>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="text-sm font-medium">Storage</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Notes persist in this browser's local storage. Clearing your
          browser data will remove them.
        </p>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-card/60 px-3 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-serif text-lg font-medium tabular-nums">{value}</dd>
    </div>
  );
}
