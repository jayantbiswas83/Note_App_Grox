import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  type LucideIcon,
} from "lucide-react";
import type { SlashCommand, SlashCommandId } from "@/lib/notes/slash-commands";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 256;
const MENU_MAX_HEIGHT = 320;
const VIEWPORT_GAP = 8;

const COMMAND_ICONS: Record<SlashCommandId, LucideIcon> = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  bullet: List,
  number: ListOrdered,
  todo: ListChecks,
  quote: Quote,
  code: Code2,
  divider: Minus,
};

type SlashCommandMenuProps = {
  commands: SlashCommand[];
  activeIndex: number;
  query: string;
  top: number;
  left: number;
  onHover: (index: number) => void;
  onSelect: () => void;
};

const MIRROR_PROPS = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
] as const;

export function measureSlashAnchor(
  textarea: HTMLTextAreaElement,
  slashIndex: number,
): { top: number; left: number } | null {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  mirror.setAttribute("aria-hidden", "true");
  const mirrorStyle = mirror.style;
  mirrorStyle.position = "absolute";
  mirrorStyle.visibility = "hidden";
  mirrorStyle.whiteSpace = "pre-wrap";
  mirrorStyle.wordWrap = "break-word";
  mirrorStyle.overflow = "hidden";
  mirrorStyle.top = "0";
  mirrorStyle.left = "-9999px";

  for (const prop of MIRROR_PROPS) {
    mirrorStyle[prop] = style[prop];
  }

  const scrollbar = textarea.offsetWidth - textarea.clientWidth;
  if (scrollbar > 0) {
    const width = parseFloat(style.width);
    if (Number.isFinite(width)) mirrorStyle.width = `${width - scrollbar}px`;
  }

  mirror.textContent = textarea.value.slice(0, slashIndex);
  const marker = document.createElement("span");
  marker.textContent = textarea.value.slice(slashIndex) || ".";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const fontSize = parseFloat(style.fontSize) || 16;
  const parsedLine = parseFloat(style.lineHeight);
  const lineHeight = Number.isFinite(parsedLine) ? parsedLine : fontSize * 1.8;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;
  const relativeTop = marker.offsetTop + borderTop - textarea.scrollTop;
  const relativeLeft = marker.offsetLeft + borderLeft - textarea.scrollLeft;
  document.body.removeChild(mirror);

  const rect = textarea.getBoundingClientRect();
  const caretTop = rect.top + relativeTop;
  const caretBottom = caretTop + lineHeight;
  if (caretBottom < rect.top || caretTop > rect.bottom) return null;

  let left = rect.left + relativeLeft;
  let top = caretBottom + 6;
  const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_GAP;
  left = Math.min(Math.max(VIEWPORT_GAP, left), Math.max(VIEWPORT_GAP, maxLeft));

  if (top + MENU_MAX_HEIGHT > window.innerHeight - VIEWPORT_GAP) {
    const above = caretTop - MENU_MAX_HEIGHT - 6;
    top = above >= VIEWPORT_GAP ? above : Math.max(VIEWPORT_GAP, window.innerHeight - MENU_MAX_HEIGHT - VIEWPORT_GAP);
  }

  return { top, left };
}

export function SlashCommandMenu({
  commands,
  activeIndex,
  query,
  top,
  left,
  onHover,
  onSelect,
}: SlashCommandMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!item) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      list.scrollTop -= listRect.top - itemRect.top;
    } else if (itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.bottom - listRect.bottom;
    }
  }, [activeIndex, commands]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      id="folio-slash-listbox"
      role="listbox"
      aria-label="Slash commands"
      style={{ top, left, width: MENU_WIDTH }}
      className="fixed z-40 overflow-hidden rounded-lg border border-border/80 bg-card p-1 shadow-crystal"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="flex items-baseline justify-between border-b border-border/70 px-2 py-1">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Commands
        </span>
        <span className="font-mono text-xs text-accent">/{query}</span>
      </div>
      <div ref={listRef} className="max-h-72 overflow-y-auto">
        {commands.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">No matching commands</p>
        ) : (
          commands.map((command, index) => {
            const Icon = COMMAND_ICONS[command.id];
            const active = index === activeIndex;
            return (
              <button
                key={command.id}
                id={`folio-slash-${command.id}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={active}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-100",
                  active ? "bg-accent-subtle text-accent" : "text-foreground",
                )}
                onMouseEnter={() => onHover(index)}
                onClick={() => onSelect()}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    active ? "text-accent" : "text-muted-foreground",
                  )}
                />
                <span className="shrink-0 font-mono text-xs font-medium">{command.label}</span>
                <span
                  className={cn(
                    "ml-auto truncate text-xs",
                    active ? "text-accent/80" : "text-muted-foreground",
                  )}
                >
                  {command.hint}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}
