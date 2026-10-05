import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNotesStore } from "@/lib/notes/store";
import {
  TEMPLATES,
  BLANK_TEMPLATE,
  TEMPLATE_CATEGORIES,
  type NoteTemplate,
  type TemplateCategory,
} from "@/lib/notes/templates";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePicker({ open, onOpenChange }: TemplatePickerProps) {
  const createNoteFromTemplate = useNotesStore(
    (state) => state.createNoteFromTemplate,
  );
  const createNote = useNotesStore((state) => state.createNote);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "All"
  >("All");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      const matchesCategory =
        activeCategory === "All" || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveCategory("All");
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const template = filtered[selectedIndex];
    if (template) {
      itemRefs.current[template.id]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, filtered]);

  function createFromTemplate(template: NoteTemplate) {
    if (template.id === "blank") {
      createNote();
    } else {
      createNoteFromTemplate(template.body);
    }
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[selectedIndex]) {
          createFromTemplate(filtered[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  }

  const tabs: (TemplateCategory | "All")[] = ["All", ...TEMPLATE_CATEGORIES];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(34rem,calc(100vw-2rem))] flex flex-col overflow-hidden rounded-lg border border-border/80 bg-card p-0 shadow-[0_20px_50px_rgba(24,21,30,0.15)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        )}
        showClose={false}
      >
        <DialogTitle className="sr-only">New note from template</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a template or start with a blank note
        </DialogDescription>

        {/* Header */}
        <div className="flex h-14 shrink-0 items-center border-b border-border/50 px-3">
          <div className="flex w-full items-center gap-2 px-1">
            <FileText className="size-4 shrink-0 text-accent" />
            <Input
              ref={inputRef}
              placeholder="Search templates…"
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

        {/* Category tabs */}
        <div className="flex shrink-0 items-center gap-0.5 border-b border-border/40 px-2 py-1.5">
          {tabs.map((tab) => {
            const active = activeCategory === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveCategory(tab)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 border",
                  active
                    ? "bg-accent-subtle text-accent border-accent/20"
                    : "text-muted-foreground hover:bg-card-subtle hover:text-foreground border-transparent",
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Template list */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center select-none">
              <div className="flex size-11 items-center justify-center rounded-xl bg-card border border-border/80 shadow-soft">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-serif text-base font-medium text-foreground">
                  No templates found
                </p>
                <p className="text-xs text-muted-foreground max-w-[16rem] leading-relaxed">
                  Nothing matches "{query.trim()}". Try a different search.
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {filtered.map((template, index) => {
                const Icon = template.icon;
                const isSelected = index === selectedIndex;
                const isBlank = template.id === "blank";
                return (
                  <li key={template.id}>
                    <button
                      ref={(el) => {
                        itemRefs.current[template.id] = el;
                      }}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => createFromTemplate(template)}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 focus-visible:outline-none",
                        isSelected
                          ? "border-accent/30 bg-accent-subtle shadow-soft"
                          : "border-transparent bg-card hover:bg-card-subtle hover:border-border/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isBlank
                            ? "bg-muted/60 border-border/60 text-muted-foreground"
                            : isSelected
                              ? "bg-accent/15 border-accent/25 text-accent"
                              : "bg-accent-subtle/70 border-accent/15 text-accent",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-serif text-sm font-medium tracking-tight text-foreground">
                            {template.name}
                          </span>
                          {isBlank && (
                            <span className="rounded-sm bg-muted/80 px-1.5 py-0.5 text-[0.625rem] font-semibold text-muted-foreground uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground/90 leading-relaxed">
                          {template.description}
                        </span>
                        <span className="mt-1.5 block text-[0.625rem] font-medium text-muted-foreground/70 uppercase tracking-wider">
                          {template.category}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
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

export { BLANK_TEMPLATE };
