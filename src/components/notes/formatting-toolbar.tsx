import {
  Bold,
  Italic,
  Strikethrough,
  Code2,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type FormatAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "code"
  | "link"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "numbered"
  | "checklist"
  | "quote"
  | "codeblock"
  | "divider";

type ToolbarButton = {
  action: FormatAction;
  icon: LucideIcon;
  label: string;
};

const INLINE_BUTTONS: ToolbarButton[] = [
  { action: "bold", icon: Bold, label: "Bold" },
  { action: "italic", icon: Italic, label: "Italic" },
  { action: "strikethrough", icon: Strikethrough, label: "Strikethrough" },
  { action: "code", icon: Code2, label: "Inline code" },
  { action: "link", icon: LinkIcon, label: "Link" },
];

const BLOCK_BUTTONS: ToolbarButton[] = [
  { action: "h1", icon: Heading1, label: "Heading 1" },
  { action: "h2", icon: Heading2, label: "Heading 2" },
  { action: "h3", icon: Heading3, label: "Heading 3" },
  { action: "bullet", icon: List, label: "Bullet list" },
  { action: "numbered", icon: ListOrdered, label: "Numbered list" },
  { action: "checklist", icon: ListChecks, label: "Checklist" },
  { action: "quote", icon: Quote, label: "Blockquote" },
  { action: "codeblock", icon: Code2, label: "Code block" },
  { action: "divider", icon: Minus, label: "Horizontal rule" },
];

type FormattingToolbarProps = {
  onAction: (action: FormatAction) => void;
};

function ToolbarBtn({
  btn,
  onAction,
}: {
  btn: ToolbarButton;
  onAction: (action: FormatAction) => void;
}) {
  const Icon = btn.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onAction(btn.action);
          }}
          aria-label={btn.label}
          className="fmt-btn flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-100 hover:bg-card hover:text-foreground hover:shadow-soft"
        >
          <Icon className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {btn.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function FormattingToolbar({ onAction }: FormattingToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-border/50 bg-sidebar/70 px-1 py-0.5 backdrop-blur-sm shadow-soft",
      )}
      role="toolbar"
      aria-label="Text formatting"
    >
      {INLINE_BUTTONS.map((btn) => (
        <ToolbarBtn key={btn.action} btn={btn} onAction={onAction} />
      ))}
      <span className="mx-0.5 h-4 w-px shrink-0 bg-border/70" />
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {BLOCK_BUTTONS.map((btn) => (
          <ToolbarBtn key={btn.action} btn={btn} onAction={onAction} />
        ))}
      </div>
    </div>
  );
}
