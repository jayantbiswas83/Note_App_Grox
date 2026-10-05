import type { RefObject } from "react";
import {
  Plus,
  Search,
  FileText,
  Star,
  Tag,
  Archive,
  Trash2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Hash,
  X,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FolioBrand } from "@/components/notes/folio-brand";
import { FolioCrystalArtwork } from "@/components/notes/folio-crystal-artwork";
import {
  collectTags,
  filterNotes,
  filterTrashedNotes,
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
    { id: "archived", label: "Archived", icon: Archive },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "trash", label: "Trash", icon: Trash2 },
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

  const tagCounts = collectTags(
    notes.filter((note) => !note.archived && !note.trashed),
  );
  const sortedTagNames = [...tagCounts.keys()].sort((a, b) =>
    a.localeCompare(b),
  );

  let visible: Note[] = [];
  if (activeView === "favorites") {
    visible = filterNotes(
      sortedNotes(notes).filter((n) => n.favorite && !n.archived && !n.trashed),
      search,
    );
  } else if (activeView === "archived") {
    visible = filterNotes(
      sortedNotes(notes).filter((n) => n.archived && !n.trashed),
      search,
      true,
    );
  } else if (activeView === "tags" && activeTag) {
    visible = filterNotes(
      sortedNotes(notes).filter(
        (n) => n.tags.includes(activeTag) && !n.trashed,
      ),
      search,
    );
  } else if (activeView === "trash") {
    visible = filterTrashedNotes(notes, search);
  } else {
    visible = filterNotes(notes, search);
  }

  const favoriteCount = notes.filter(
    (n) => n.favorite && !n.archived && !n.trashed,
  ).length;
  const archivedCount = notes.filter((n) => n.archived && !n.trashed).length;
  const trashCount = notes.filter((n) => n.trashed).length;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-sidebar border-r border-border/70 select-none transition-[width] duration-300 ease-smooth",
        collapsed ? "w-16" : "w-full",
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-4 pb-3">
        <FolioBrand collapsed={collapsed} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "size-8 rounded-md text-muted-foreground hover:bg-card/70 hover:text-foreground",
                collapsed && "mx-auto mt-2",
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={collapsed ? "right" : "bottom"}>
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Primary Action Button (New Note) in Collapsed Mode */}
      {collapsed && (
        <div className="flex justify-center px-2 py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="default"
                aria-label="New note"
                onClick={handleCreate}
                className="size-10 rounded-lg shadow-sm shadow-accent/25"
              >
                <Plus className="size-4.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              New note · {modifier}N
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Navigation tabs */}
      <nav className="px-2.5 pb-2">
        <ul className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            const count =
              item.id === "notes"
                ? notes.filter((n) => !n.archived && !n.trashed).length
                : item.id === "favorites"
                  ? favoriteCount
                  : item.id === "archived"
                    ? archivedCount
                    : item.id === "tags"
                      ? sortedTagNames.length
                      : item.id === "trash"
                        ? trashCount
                        : undefined;

            if (collapsed) {
              return (
                <li key={item.id} className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg text-sm transition-all duration-150",
                          active
                            ? "bg-card text-accent shadow-soft border border-border/80"
                            : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="sr-only">{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                      {count !== undefined && count > 0 ? ` (${count})` : ""}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    active
                      ? "bg-card text-foreground font-medium shadow-soft border border-border/70"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
                  )}
                >
                  {/* Subtle active crystalline indicator */}
                  {active && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full bg-accent" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active ? "text-accent ml-1" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tabular-nums transition-colors",
                        active
                          ? "bg-accent-subtle text-accent border border-accent/20"
                          : "text-muted-foreground bg-muted/60",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tag list when in Tags view */}
      {activeView === "tags" && !collapsed && !activeTag && (
        <div className={cn(
          "px-3 pt-1 border-t border-border/40",
          activeTag ? "pb-1" : "pb-2",
        )}>
          <p className="px-1 pb-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Labels
          </p>
          {sortedTagNames.length === 0 ? (
            <p className="px-1 py-3 text-xs text-muted-foreground">
              No tags yet. Add tags from any note's footer.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
              {sortedTagNames.map((tag) => {
                const active = activeTag === tag;
                return (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => setActiveTag(active ? null : tag)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors duration-150",
                        active
                          ? "bg-card text-accent font-medium shadow-soft border border-border/60"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                      )}
                    >
                      <Hash className="size-3 text-accent/70 shrink-0" />
                      <span className="flex-1 text-left truncate">{tag}</span>
                      <span className="text-[0.625rem] tabular-nums text-muted-foreground">
                        {tagCounts.get(tag)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )
      }

      {/* Search + New Note in Expanded Mode */}
      {
        activeView !== "settings" && !collapsed && (
          <div className="px-3 pb-2.5 pt-1 flex flex-col gap-2">
            {/* Refined Search Box */}
            <label className="relative block">
              <span className="sr-only">Search notes</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="search"
                value={search}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Search notes…"
                aria-keyshortcuts="/ Meta+K"
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 rounded-lg border-border/70 bg-card/75 pr-14 pl-8.5 text-xs focus:bg-card"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="app-kbd pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 max-md:hidden text-[0.65rem]">
                  {modifier === "⌘" ? "⌘K" : "Ctrl K"}
                </kbd>
              )}
            </label>

            {/* Primary Create Action */}
            <Button
              type="button"
              variant="default"
              className="h-9.5 w-full justify-between gap-2 rounded-lg font-medium text-xs tracking-tight"
              onClick={handleCreate}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="size-4" />
                Compose Note
              </span>
              <kbd className="inline-flex items-center text-[0.65rem] opacity-80 font-mono tracking-wide">
                {modifier === "⌘" ? "⌘N" : "Ctrl+N"}
              </kbd>
            </Button>
          </div>
        )
      }

      {
        activeView === "settings" && !collapsed ? (
          <SettingsPanel />
        ) : (
          <>
            {/* Note List Header */}
            {!collapsed && (
              <div className="flex items-center justify-between px-3.5 pt-2 pb-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase border-t border-border/40">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate">
                      {activeView === "favorites"
                        ? "Favorites"
                        : activeView === "archived"
                          ? "Archived"
                          : activeView === "trash"
                            ? "Trash"
                            : activeView === "tags" && activeTag
                              ? `Tag: #${activeTag}`
                              : activeView === "tags"
                                ? "Tags"
                                : "Ledger"}
                    </span>
                  </div>
                  {activeView === "tags" && activeTag && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveTag(null)}
                        className="shrink-0 rounded p-0.5 text-accent hover:bg-accent-subtle hover:text-accent"
                        aria-label="Clear selected tag"
                      >
                        <X className="size-3" />
                      </button>
                      <span
                        className="shrink-0 text-sm leading-none animate-[floatHint_1.4s_ease-in-out_infinite]"
                        aria-hidden="true"
                      >
                        👈🏻
                      </span>
                      <span className="text-[0.58rem] font-medium text-muted-foreground">
                        Back to labels
                      </span>
                    </div>
                  )}
                </div>

                <span className="tabular-nums">
                  {hasHydrated
                    ? activeView === "tags" && !activeTag
                      ? `${sortedTagNames.length}`
                      : search.trim()
                        ? `${visible.length} found`
                        : `${visible.length}`
                    : ""}
                </span>
              </div>
            )}

            {/* Note list scroll viewport */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              <div className="flex flex-col gap-1">
                {!hasHydrated ? (
                  <SidebarSkeleton />
                ) : activeView === "tags" && !activeTag ? (
                  <TagCollection
                    tags={sortedTagNames}
                    tagCounts={tagCounts}
                    activeTag={activeTag}
                    onSelectTag={(tag) => setActiveTag(tag)}
                  />
                ) : visible.length === 0 ? (
                  <EmptyList
                    hasNotes={notes.length > 0}
                    query={search}
                    view={activeView}
                    onCreate={handleCreate}
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
          </>
        )
      }
    </div >
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
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onSelect(note.id)}
            aria-label={title}
            aria-current={selected ? "true" : undefined}
            className={cn(
              "mx-auto flex size-10 items-center justify-center rounded-lg text-sm transition-all duration-150",
              selected
                ? "bg-card text-accent shadow-card border border-accent/30"
                : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
            )}
          >
            {note.favorite ? (
              <Star className="size-4 text-amber-500 fill-amber-400" />
            ) : (
              <FileText className="size-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="font-serif font-medium">{title}</div>
          <div className="text-[10px] text-muted-foreground">{stamp}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg border transition-all duration-150",
        selected
          ? "border-border/80 border-l-[3px] border-l-accent bg-card text-foreground shadow-card"
          : "border-transparent border-l-[3px] border-l-transparent text-foreground hover:bg-card/65 hover:border-border/40",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(note.id)}
        aria-current={selected ? "true" : undefined}
        className="w-full px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-1.5 pr-6">
          {note.favorite && (
            <Star className="size-3.5 shrink-0 text-amber-500 fill-amber-400" />
          )}
          <span
            className={cn(
              "truncate font-serif text-[0.9375rem] font-medium tracking-tight",
              selected ? "text-foreground font-semibold" : "text-foreground/90",
            )}
          >
            {title}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/90 leading-relaxed font-sans">
          {preview}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2 text-[0.6875rem] text-muted-foreground">
          <time
            dateTime={new Date(note.updatedAt).toISOString()}
            className="tabular-nums font-sans"
          >
            {stamp}
          </time>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-sm bg-accent-subtle/90 px-1.5 py-0.2 text-[0.625rem] font-medium text-accent border border-accent/15"
                >
                  <Hash className="size-2 text-accent/80" />
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[0.625rem] text-muted-foreground font-medium">
                  +{note.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </button>

      {/* Favorite quick toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(note.id);
        }}
        aria-label={note.favorite ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "absolute top-2 right-2 flex size-6.5 items-center justify-center rounded-md opacity-0 transition-opacity duration-150 hover:bg-muted/70 group-hover:opacity-100",
          note.favorite && "opacity-100",
        )}
      >
        {note.favorite ? (
          <Star className="size-3.5 text-amber-500 fill-amber-400" />
        ) : (
          <Star className="size-3.5 text-muted-foreground/60 hover:text-foreground" />
        )}
      </button>
    </div>
  );
}

function TagCollection({
  tags,
  tagCounts,
  activeTag,
  onSelectTag,
}: {
  tags: string[];
  tagCounts: Map<string, number>;
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 px-1 py-2">
      <div className="px-2 pb-2">
        <p className="font-serif text-base font-medium text-foreground">
          Your tags
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Organize your notes by label.
        </p>
      </div>

      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelectTag(tag)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150",
            activeTag === tag
              ? "border-accent/30 bg-accent-subtle text-accent shadow-soft"
              : "border-border/60 bg-card/60 text-foreground hover:border-border hover:bg-card hover:shadow-soft",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent">
            <Hash className="size-4" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {tag}
            </span>
            <span className="mt-0.5 block text-[0.6875rem] text-muted-foreground">
              {tagCounts.get(tag) ?? 0}{" "}
              {(tagCounts.get(tag) ?? 0) === 1 ? "note" : "notes"}
            </span>
          </span>

          <span className="tabular-nums text-xs font-semibold text-muted-foreground">
            {tagCounts.get(tag) ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

function EmptyList({
  hasNotes,
  query,
  view,
  onCreate,
}: {
  hasNotes: boolean;
  query: string;
  view: SidebarView;
  onCreate: () => void;
}) {
  const isSearch = query.trim().length > 0;
  const isFavorites = view === "favorites";
  const isTrash = view === "trash";

  const heading = isTrash
    ? isSearch
      ? "No matches found"
      : "Trash is empty"
    : isFavorites
      ? hasNotes
        ? "No favorite notes"
        : "No favorites yet"
      : isSearch
        ? "No matches found"
        : "No notes yet";

  const sub = isTrash
    ? isSearch
      ? `Nothing in Trash matches “${query.trim()}”.`
      : "Deleted notes stay here until you restore or remove them."
    : isFavorites
      ? "Star any note to keep it close at hand."
      : isSearch
        ? `Nothing found matching “${query.trim()}”.`
        : "Begin your first thought or observation.";

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center select-none">
      {!hasNotes && !isSearch && !isFavorites && !isTrash ? (
        <FolioCrystalArtwork size="sm" />
      ) : (
        <div className="flex size-11 items-center justify-center rounded-xl bg-card border border-border/80 shadow-soft text-accent">
          {isTrash ? (
            <Trash2 className="size-5 text-muted-foreground" />
          ) : isFavorites ? (
            <Star className="size-5 text-amber-500/80" />
          ) : isSearch ? (
            <Search className="size-5 text-muted-foreground" />
          ) : (
            <Sparkles className="size-5 text-accent" />
          )}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-medium text-foreground">{heading}</p>
        <p className="text-xs text-muted-foreground max-w-[13rem] leading-relaxed">{sub}</p>
      </div>

      {!isSearch && !isFavorites && !isTrash && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-1 h-8 text-xs"
          onClick={onCreate}
        >
          <Plus className="size-3.5" />
          Create Note
        </Button>
      )}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 px-1 py-2">
      <p className="px-2 text-xs text-muted-foreground font-serif italic">Loading notes…</p>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-lg border border-border/40 bg-card/60 p-3">
          <div className="h-4 w-2/3 rounded-sm bg-muted animate-pulse" />
          <div className="mt-2 h-3 w-full rounded-sm bg-muted/70 animate-pulse" />
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
    <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-6 pt-1">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-4 text-accent" />
        <h2 className="font-serif text-lg font-medium">Folio Ledger</h2>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Offline-first crystal intelligence. Your data never leaves this browser.
      </p>

      <dl className="mt-4 flex flex-col gap-2">
        <StatRow label="Stored Notes" value={notes.length} />
        <StatRow label="Starred" value={favoriteCount} />
        <StatRow label="Labels" value={tagCount} />
      </dl>

      <div className="mt-5 rounded-lg border border-border/60 bg-card p-3 shadow-soft">
        <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
          Privacy Philosophy
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Folio writes directly to your browser's persistent storage. There are no
          remote servers tracking your prose.
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-border/60 bg-card/60 p-3">
        <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
          Storage Health
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Encrypted locally under the key <code className="text-accent font-mono text-[10px]">folio-notes-v1</code>.
        </p>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2 shadow-soft">
      <dt className="text-xs text-muted-foreground font-medium">{label}</dt>
      <dd className="font-serif text-base font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
