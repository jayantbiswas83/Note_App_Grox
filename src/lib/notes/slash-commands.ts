/**
 * Slash-command catalog and query detection for the Folio textarea.
 * Detection only — applying a command is a later step.
 */

export type SlashCommandId =
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "number"
  | "todo"
  | "quote"
  | "code"
  | "divider";

export type SlashCommand = {
  id: SlashCommandId;
  label: string;
  hint: string;
};

export type SlashQuery = {
  slashIndex: number;
  query: string;
};

export const SLASH_COMMANDS: readonly SlashCommand[] = [
  { id: "h1", label: "/h1", hint: "Heading 1" },
  { id: "h2", label: "/h2", hint: "Heading 2" },
  { id: "h3", label: "/h3", hint: "Heading 3" },
  { id: "bullet", label: "/bullet", hint: "Bullet list" },
  { id: "number", label: "/number", hint: "Numbered list" },
  { id: "todo", label: "/todo", hint: "Checklist" },
  { id: "quote", label: "/quote", hint: "Blockquote" },
  { id: "code", label: "/code", hint: "Code block" },
  { id: "divider", label: "/divider", hint: "Divider" },
];

const TOKEN = /[A-Za-z0-9]/;

/**
 * A slash query is active when the caret sits in a "/" token that starts
 * a line or sits immediately after whitespace. The query is the letters
 * and digits typed after that slash, up to the caret.
 */
export function detectSlashQuery(value: string, caret: number): SlashQuery | null {
  if (caret <= 0 || caret > value.length) return null;

  let index = caret - 1;
  while (index >= 0 && TOKEN.test(value.charAt(index))) {
    index -= 1;
  }

  if (value.charAt(index) !== "/") return null;
  if (index > 0 && !/\s/.test(value.charAt(index - 1))) return null;

  return {
    slashIndex: index,
    query: value.slice(index + 1, caret),
  };
}

export function filterSlashCommands(query: string): SlashCommand[] {
  const needle = query.toLowerCase();
  if (!needle) return [...SLASH_COMMANDS];
  return SLASH_COMMANDS.filter((command) => command.id.startsWith(needle));
}
