/**
 * Pure text-manipulation helpers for the Folio markdown editor.
 * Every function takes the current textarea value + selection and returns
 * the new value + selection so the caller can apply them imperatively.
 */

export type Selection = { start: number; end: number };
export type Edit = { value: string; selection: Selection };

/* ---------- Line helpers ---------- */

function lineBounds(text: string, pos: number): { start: number; end: number } {
  const before = text.slice(0, pos);
  const after = text.slice(pos);
  const start = before.lastIndexOf("\n") + 1;
  const end = pos + after.indexOf("\n");
  return { start, end: end === pos - 1 ? text.length : end };
}

/* ---------- Wrap / toggle inline ---------- */

export function toggleInline(
  value: string,
  sel: Selection,
  marker: string,
): Edit {
  const selected = value.slice(sel.start, sel.end);
  const before = value.slice(0, sel.start);
  const after = value.slice(sel.end);

  if (
    selected.length > 0 &&
    before.endsWith(marker) &&
    after.startsWith(marker)
  ) {
    const newValue =
      before.slice(0, before.length - marker.length) +
      selected +
      after.slice(marker.length);
    return {
      value: newValue,
      selection: {
        start: sel.start - marker.length,
        end: sel.end - marker.length,
      },
    };
  }

  if (selected.length === 0) {
    const placeholder = "text";
    const newValue =
      before + marker + placeholder + marker + after;
    const cursorStart = sel.start + marker.length;
    return {
      value: newValue,
      selection: { start: cursorStart, end: cursorStart + placeholder.length },
    };
  }

  const newValue = before + marker + selected + marker + after;
  return {
    value: newValue,
    selection: {
      start: sel.start + marker.length,
      end: sel.end + marker.length,
    },
  };
}

/* ---------- Link ---------- */

export function insertLink(value: string, sel: Selection): Edit {
  const selected = value.slice(sel.start, sel.end);
  const before = value.slice(0, sel.start);
  const after = value.slice(sel.end);

  if (selected.length > 0) {
    const newValue = `${before}[${selected}](url)${after}`;
    const urlStart = sel.end + 3;
    return {
      value: newValue,
      selection: { start: urlStart, end: urlStart + 3 },
    };
  }

  const textPlaceholder = "text";
  const newValue = `${before}[${textPlaceholder}](url)${after}`;
  const textStart = sel.start + 1;
  return {
    value: newValue,
    selection: { start: textStart, end: textStart + textPlaceholder.length },
  };
}

/* ---------- Line prefix (headings, blockquote, checklist) ---------- */

export function applyLinePrefix(
  value: string,
  sel: Selection,
  prefix: string,
  togglePattern: RegExp,
): Edit {
  const { start } = lineBounds(value, sel.start);
  const lineEnd = value.indexOf("\n", start);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const currentLine = value.slice(start, end);

  const hasPrefix = togglePattern.test(currentLine);

  let newLine: string;
  if (hasPrefix) {
    newLine = currentLine.replace(togglePattern, "");
  } else {
    newLine = prefix + currentLine;
  }

  const newValue = value.slice(0, start) + newLine + value.slice(end);
  const newSelEnd = start + newLine.length;
  return { value: newValue, selection: { start, end: newSelEnd } };
}

/* ---------- List prefix (multi-line) ---------- */

export function applyListPrefix(
  value: string,
  sel: Selection,
  prefix: string,
  togglePattern: RegExp,
  ordered: boolean,
): Edit {
  const startLine = lineBounds(value, sel.start);
  const endLine = lineBounds(value, sel.end);

  const blockStart = startLine.start;
  const blockEndIdx = value.indexOf("\n", endLine.start);
  const blockEnd = blockEndIdx === -1 ? value.length : blockEndIdx;

  const block = value.slice(blockStart, blockEnd);
  const lines = block.split("\n");

  const anyMatched = lines.some((l) => togglePattern.test(l));

  let counter = 1;
  const newLines = lines.map((line) => {
    if (anyMatched) {
      return line.replace(togglePattern, "");
    }
    if (ordered) {
      return `${counter++}. ${line}`;
    }
    return `${prefix} ${line}`;
  });

  const newBlock = newLines.join("\n");
  const newValue = value.slice(0, blockStart) + newBlock + value.slice(blockEnd);
  return { value: newValue, selection: { start: blockStart, end: blockStart + newBlock.length } };
}

/* ---------- Code block ---------- */

export function insertCodeBlock(value: string, sel: Selection): Edit {
  const selected = value.slice(sel.start, sel.end);
  const before = value.slice(0, sel.start);
  const after = value.slice(sel.end);

  const needsNewlineBefore = before.length > 0 && !before.endsWith("\n");
  const needsNewlineAfter = after.length > 0 && !after.startsWith("\n");

  const fence = "```";
  const insertion =
    (needsNewlineBefore ? "\n" : "") +
    fence +
    "\n" +
    (selected || "") +
    "\n" +
    fence +
    (needsNewlineAfter ? "\n" : "");

  const newValue = before + insertion + after;

  if (selected.length > 0) {
    const codeStart = sel.start + (needsNewlineBefore ? 1 : 0) + fence.length + 1;
    return {
      value: newValue,
      selection: { start: codeStart, end: codeStart + selected.length },
    };
  }

  const cursorPos = sel.start + (needsNewlineBefore ? 1 : 0) + fence.length + 1;
  return { value: newValue, selection: { start: cursorPos, end: cursorPos } };
}

/* ---------- Horizontal rule ---------- */

export function insertDivider(value: string, sel: Selection): Edit {
  const before = value.slice(0, sel.start);
  const after = value.slice(sel.end);

  const needsNewlineBefore = before.length > 0 && !before.endsWith("\n");
  const needsNewlineAfter = after.length > 0 && !after.startsWith("\n");

  const insertion =
    (needsNewlineBefore ? "\n" : "") +
    "---" +
    (needsNewlineAfter ? "\n" : "");

  const newValue = before + insertion + after;
  const cursorPos = sel.start + insertion.length;
  return { value: newValue, selection: { start: cursorPos, end: cursorPos } };
}
