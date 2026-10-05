import { useEffect, useRef, useState } from "react";
import { Command } from "lucide-react";
import {
  Dialog,
  DialogContent,
 } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CommandType =
  | "new-note"
  | "search-notes"
  | "toggle-preview"
  | "toggle-favorite"
  | "archive"
  | "move-to-trash"
  | "open-trash"
  | "open-favorites"
  | "open-archived"
  | "open-tags"
  | "open-settings";

export interface Command {
  id: CommandType;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

const COMMANDS: Command[] = [
  { id: "new-note", label: "New Note" },
  { id: "search-notes", label: "Search Notes" },
  { id: "toggle-preview", label: "Toggle Preview" },
  { id: "toggle-favorite", label: "Toggle Favorite" },
  { id: "archive", label: "Archive/Unarchive" },
  { id: "move-to-trash", label: "Move to Trash" },
  { id: "open-trash", label: "Open Trash" },
  { id: "open-favorites", label: "Open Favorites" },
  { id: "open-archived", label: "Open Archived" },
  { id: "open-tags", label: "Open Tags" },
  { id: "open-settings", label: "Open Settings" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommandSelect?: (command: CommandType) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onCommandSelect,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.filter((command) =>
    command.label.toLowerCase().includes(search.toLowerCase())
  );

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);
  useEffect(() => {
  const selectedCommand = filteredCommands[selectedIndex];

  if (selectedCommand) {
    commandRefs.current[selectedCommand.id]?.scrollIntoView({
      block: "nearest",
    });
  }
}, [selectedIndex, search]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          const command = filteredCommands[selectedIndex];
          onCommandSelect?.(command.id);
          onOpenChange(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  const handleCommandClick = (command: Command) => {
    onCommandSelect?.(command.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(28rem,calc(100vw-2rem))] flex flex-col overflow-hidden rounded-lg border border-border/80 bg-card p-0 shadow-[0_20px_50px_rgba(24,21,30,0.15)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        )}
        showClose={false}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-border/50 px-3">
          <div className="flex w-full items-center gap-2 px-1">
            <Command className="size-4 text-accent shrink-0" />
            <Input
              ref={inputRef}
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full flex-1 border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
              No commands found
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {filteredCommands.map((command, index) => (
                <li key={command.id}>
                  <button
                  ref={(element) => {
                  commandRefs.current[command.id] = element;
                    }}
                    type="button"
                    onClick={() => handleCommandClick(command)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                      index === selectedIndex
                        ? "bg-accent-subtle text-foreground border-l-2 border-accent pl-[calc(0.75rem-2px)]"
                        : "bg-card text-foreground hover:bg-card-subtle text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="font-medium text-foreground">
                      {command.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border/50 px-3 py-2">
          <p className="text-[0.6875rem] text-muted-foreground/50 text-center leading-relaxed">
            Navigation: <kbd className="app-kbd">↑ ↓</kbd>{" "}
            <kbd className="app-kbd">Enter</kbd> · Close:{" "}
            <kbd className="app-kbd">Esc</kbd>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
