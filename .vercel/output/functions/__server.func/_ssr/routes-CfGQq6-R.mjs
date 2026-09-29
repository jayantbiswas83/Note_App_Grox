import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { O as require_jsx_runtime, T as Slot, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Plus, c as Keyboard, i as Search, l as FileText, o as PenLine, r as Trash2, s as Menu, t as X, u as Eye } from "../_libs/lucide-react.mjs";
import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2$1 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { t as rehypeSanitize } from "../_libs/rehype-sanitize.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CfGQq6-R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function isMacUserAgent(ua) {
	return /Mac|iPhone|iPad|iPod/.test(ua);
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,opacity,transform] duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-foreground hover:bg-accent/90",
			secondary: "bg-muted text-foreground hover:bg-border",
			ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-border bg-transparent text-foreground hover:bg-muted"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-9 rounded-sm px-3",
			icon: "size-10",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
var SEED_WELCOME = `# Welcome to Folio

A quiet place to write.

Your notes live in this browser — nothing is sent anywhere. The first line of a note becomes its title. Press **⌘E** (or Ctrl+E) to preview markdown as you go.

## A few things to try

- Create a note with **⌘N**
- Search instantly with **⌘K** or \`/\`
- Move through the list with **↑** and **↓**
- Toggle preview, then come back to the words

> Writing works best when the page gets out of the way.
`;
var SEED_MARKDOWN = `# Markdown

Folio speaks common markdown, including tables and task lists.

## Emphasis

*Italic*, **bold**, and \`inline code\`.

## Lists

1. Capture a thought
2. Shape it
3. Come back later

- [x] Write the first line
- [ ] Let the rest follow

## Aside

> Notes can be short. That is allowed.

## Cheatsheet

| Syntax | Result |
| --- | --- |
| \`# Heading\` | Title |
| \`**bold**\` | Strong |
| \`- item\` | Bullet |
| \`[link](url)\` | Link |

\`\`\`ts
const note = {
  title: "Hello",
  persistent: true,
};
\`\`\`
`;
var SEED_SHORTCUTS = `# Shortcuts

Keep your hands on the keyboard.

| Shortcut | Action |
| --- | --- |
| ⌘N / Ctrl+N | New note |
| ⌘K / Ctrl+K | Focus search |
| / | Focus search |
| ⌘E / Ctrl+E | Toggle preview |
| ⌘⇧⌫ / Ctrl+Shift+Backspace | Delete note |
| ↑ ↓ | Move between notes |
| Esc | Clear search, close panels |
| ? | This list |

On a phone, open the sidebar from the menu and swipe through your notes as usual.
`;
function noteTitle(body) {
	const cleaned = (body.split(/\r?\n/).find((entry) => entry.trim().length > 0) ?? "").replace(/^#{1,6}\s+/, "").replace(/^[-*+]\s+/, "").replace(/^[0-9]+\.\s+/, "").replace(/[*_`]/g, "").trim();
	return cleaned.length > 0 ? cleaned : "Untitled";
}
function notePreview(body) {
	const rest = body.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0).slice(1).join(" ").replace(/^#{1,6}\s+/, "").replace(/[*_`>#\[\]]/g, "").trim();
	if (!rest) return "Empty note";
	return rest.length > 84 ? `${rest.slice(0, 84).trimEnd()}…` : rest;
}
function wordCount(body) {
	const trimmed = body.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}
function createSeedNotes(now) {
	return [
		{
			id: "seed-welcome",
			body: SEED_WELCOME,
			createdAt: now - 936e5,
			updatedAt: now - 72e4
		},
		{
			id: "seed-markdown",
			body: SEED_MARKDOWN,
			createdAt: now - 108e6,
			updatedAt: now - 3e6
		},
		{
			id: "seed-shortcuts",
			body: SEED_SHORTCUTS,
			createdAt: now - 1728e5,
			updatedAt: now - 48e5
		}
	];
}
function sortedNotes(notes) {
	return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}
function filterNotes(notes, query) {
	const sorted = sortedNotes(notes);
	const q = query.trim().toLowerCase();
	if (!q) return sorted;
	return sorted.filter((note) => {
		return noteTitle(note.body).toLowerCase().includes(q) || note.body.toLowerCase().includes(q);
	});
}
var useNotesStore = create()(persist((set, get) => ({
	notes: [],
	selectedId: null,
	search: "",
	previewMode: false,
	hasHydrated: false,
	createNote: () => {
		const now = Date.now();
		const note = {
			id: crypto.randomUUID(),
			body: "",
			createdAt: now,
			updatedAt: now
		};
		set((state) => ({
			notes: [note, ...state.notes],
			selectedId: note.id,
			search: "",
			previewMode: false
		}));
		return note.id;
	},
	deleteNote: (id) => {
		set((state) => {
			const ordered = sortedNotes(state.notes);
			const notes = state.notes.filter((note) => note.id !== id);
			let selectedId = state.selectedId;
			if (state.selectedId === id) {
				const index = ordered.findIndex((note) => note.id === id);
				const next = ordered[index + 1] ?? ordered[index - 1];
				selectedId = next && next.id !== id ? next.id : notes[0]?.id ?? null;
			}
			return {
				notes,
				selectedId
			};
		});
	},
	updateNote: (id, body) => {
		const now = Date.now();
		set((state) => ({ notes: state.notes.map((note) => {
			if (note.id !== id) return note;
			if (note.body === body) return note;
			return {
				...note,
				body,
				updatedAt: now
			};
		}) }));
	},
	selectNote: (id) => {
		if (get().selectedId === id) return;
		set({ selectedId: id });
	},
	setSearch: (search) => set({ search }),
	togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),
	setPreviewMode: (previewMode) => set({ previewMode }),
	loadSeed: () => {
		if (get().notes.length > 0) return;
		const notes = createSeedNotes(Date.now());
		set({
			notes,
			selectedId: notes[0]?.id ?? null
		});
	}
}), {
	name: "folio-notes-v1",
	skipHydration: true,
	storage: createJSONStorage(() => localStorage),
	partialize: (state) => ({
		notes: state.notes,
		selectedId: state.selectedId,
		previewMode: state.previewMode
	})
}));
function NoteSidebar({ searchRef, editorRef, onNavigate, modifier }) {
	const notes = useNotesStore((state) => state.notes);
	const selectedId = useNotesStore((state) => state.selectedId);
	const search = useNotesStore((state) => state.search);
	const setSearch = useNotesStore((state) => state.setSearch);
	const selectNote = useNotesStore((state) => state.selectNote);
	const createNote = useNotesStore((state) => state.createNote);
	const hasHydrated = useNotesStore((state) => state.hasHydrated);
	const visible = filterNotes(notes, search);
	function handleCreate() {
		createNote();
		onNavigate?.();
		requestAnimationFrame(() => editorRef.current?.focus());
	}
	function handleSelect(id) {
		selectNote(id);
		onNavigate?.();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-sidebar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 px-4 pt-5 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl leading-none font-medium tracking-tight italic",
						children: "Folio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs tracking-[0.16em] text-muted-foreground uppercase",
						children: "Notes"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "icon-sm",
					variant: "default",
					"aria-label": "New note",
					onClick: handleCreate,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "relative block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Search notes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							ref: searchRef,
							type: "search",
							value: search,
							autoComplete: "off",
							autoCorrect: "off",
							spellCheck: false,
							placeholder: "Search",
							"aria-keyshortcuts": "/ Meta+K",
							onChange: (event) => setSearch(event.target.value),
							className: "h-10 border-transparent bg-card/80 pr-12 pl-9"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "app-kbd pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 max-md:hidden",
							children: modifier === "⌘" ? "⌘K" : "Ctrl K"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-0.5 px-2 pb-4",
					children: !hasHydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSkeleton, {}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyList, {
						hasNotes: notes.length > 0,
						query: search
					}) : visible.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteRow, {
						note,
						selected: note.id === selectedId,
						onSelect: handleSelect
					}, note.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-3 text-xs text-muted-foreground",
				children: hasHydrated ? search.trim() ? `${visible.length} match${visible.length === 1 ? "" : "es"}` : `${notes.length} note${notes.length === 1 ? "" : "s"}` : "Opening notes"
			})
		]
	});
}
function NoteRow({ note, selected, onSelect }) {
	const title = noteTitle(note.body);
	const preview = notePreview(note.body);
	const stamp = formatDistanceToNow(note.updatedAt, { addSuffix: true });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onSelect(note.id),
		"aria-current": selected ? "true" : void 0,
		className: cn("w-full rounded-md border-l-2 px-3 py-3 text-left transition-colors duration-150 min-h-11", selected ? "border-accent bg-card text-foreground" : "border-transparent text-foreground hover:bg-card/70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "truncate font-serif text-base font-medium tracking-tight",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted-foreground",
				children: preview
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
				dateTime: new Date(note.updatedAt).toISOString(),
				className: "shrink-0 text-xs text-muted-foreground tabular-nums",
				children: stamp
			})]
		})]
	});
}
function EmptyList({ hasNotes, query }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-2 px-4 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-6 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-base",
				children: hasNotes ? "No matching notes" : "No notes yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: hasNotes ? `Nothing matches “${query.trim()}”.` : "Start a note and it will appear here."
			})
		]
	});
}
function SidebarSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1 px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-3 py-3 text-sm text-muted-foreground",
			children: "Opening notes…"
		}), Array.from({ length: 3 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md px-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-2/3 rounded-sm bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-3 w-full rounded-sm bg-muted/70" })]
		}, index))]
	});
}
function TooltipProvider({ delayDuration = 400, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		...props
	});
}
function Tooltip({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root3, { ...props });
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function TooltipContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
		sideOffset,
		className: cn("z-50 overflow-hidden rounded-sm bg-accent px-2.5 py-1.5 text-xs text-accent-foreground shadow-soft", "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", className),
		...props
	}) });
}
function MarkdownPreview({ markdown, className }) {
	if (!markdown.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-serif text-lg text-muted-foreground italic",
		children: "Nothing to preview yet. Write a few lines, then toggle preview."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("md-preview", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
			remarkPlugins: [remarkGfm],
			rehypePlugins: [rehypeSanitize],
			components: { a: ({ href, children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				target: "_blank",
				rel: "noreferrer noopener",
				children
			}) },
			children: markdown
		})
	});
}
function EditorPane({ editorRef, onRequestDelete, onOpenSidebar, modifier }) {
	const notes = useNotesStore((state) => state.notes);
	const selectedId = useNotesStore((state) => state.selectedId);
	const previewMode = useNotesStore((state) => state.previewMode);
	const togglePreview = useNotesStore((state) => state.togglePreview);
	const hasHydrated = useNotesStore((state) => state.hasHydrated);
	const note = notes.find((entry) => entry.id === selectedId) ?? null;
	if (!hasHydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "flex h-14 shrink-0 items-center gap-2 border-b border-border px-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-lg font-medium italic",
				children: "Folio"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-2xl flex-1 px-6 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Opening notes…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-8 w-1/2 rounded-md bg-muted" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-4 w-full rounded-sm bg-muted/80" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-4 w-5/6 rounded-sm bg-muted/70" })
			]
		})]
	});
	if (!note) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-14 shrink-0 items-center gap-2 border-b border-border px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon-sm",
				variant: "ghost",
				className: "md:hidden",
				"aria-label": "Open notes",
				onClick: onOpenSidebar,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-lg font-medium italic",
				children: "Folio"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-2xl",
				children: "Nothing selected"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: "Choose a note from the list, or create one to start writing."
			})]
		})]
	});
	const words = wordCount(note.body);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-border px-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon-sm",
						variant: "ghost",
						className: "shrink-0 md:hidden",
						"aria-label": "Open notes",
						onClick: onOpenSidebar,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "min-w-0 flex-1 overflow-hidden text-lg font-medium tracking-tight text-ellipsis whitespace-nowrap font-serif",
						children: noteTitle(note.body)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "icon-sm",
							variant: previewMode ? "secondary" : "ghost",
							"aria-pressed": previewMode,
							"aria-label": previewMode ? "Edit markdown" : "Preview markdown",
							onClick: () => togglePreview(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative flex size-4 items-center justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: cn("absolute transition-[opacity,transform,filter] duration-200", previewMode ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: cn("transition-[opacity,transform,filter] duration-200", previewMode ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none") })]
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [
						previewMode ? "Edit" : "Preview",
						" · ",
						modifier,
						modifier === "⌘" ? "E" : "+E"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "icon-sm",
							variant: "ghost",
							"aria-label": "Delete note",
							onClick: onRequestDelete,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Delete note" })] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: previewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-2xl px-5 py-8 sm:px-8 sm:py-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, { markdown: note.body })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteEditor, {
					note,
					editorRef
				}, note.id)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex h-10 shrink-0 items-center justify-between gap-3 border-t border-border px-4 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("time", {
					dateTime: new Date(note.updatedAt).toISOString(),
					title: `Created ${format(note.createdAt, "MMM d, yyyy · h:mm a")}`,
					className: "truncate tabular-nums",
					children: ["Edited ", formatDistanceToNow(note.updatedAt, { addSuffix: true })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "shrink-0 tabular-nums",
					children: [
						words,
						" ",
						words === 1 ? "word" : "words"
					]
				})]
			})
		]
	});
}
function NoteEditor({ note, editorRef }) {
	const updateNote = useNotesStore((state) => state.updateNote);
	const [draft, setDraft] = (0, import_react.useState)(note.body);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mx-auto flex h-full w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Note content"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			ref: editorRef,
			value: draft,
			spellCheck: true,
			"aria-label": "Note markdown",
			placeholder: "Start writing — the first line becomes the title",
			className: "note-editor h-full min-h-64 w-full resize-none bg-transparent font-serif text-lg leading-relaxed text-foreground outline-none",
			onChange: (event) => {
				const next = event.target.value;
				setDraft(next);
				updateNote(note.id, next);
			}
		})]
	});
}
function AlertDialog({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, { ...props });
}
function AlertDialogPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { ...props });
}
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
		className: cn("fixed inset-0 z-50 bg-foreground/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 shadow-soft", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 text-left", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("font-serif text-xl font-medium tracking-tight", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants({ variant: "destructive" }), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "outline" }), className),
		...props
	});
}
function Dialog({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, { ...props });
}
function DialogPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal$1, { ...props });
}
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-foreground/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, showClose = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 shadow-soft", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, showClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		}) : null]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 text-left", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-serif text-xl font-medium tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var STORAGE_KEY = "folio-notes-v1";
function readPersistedNotes() {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.state || !Array.isArray(parsed.state.notes)) return null;
		return parsed.state;
	} catch {
		return null;
	}
}
function finishHydration() {
	if (useNotesStore.getState().hasHydrated) return;
	const persisted = readPersistedNotes();
	if (persisted?.notes && persisted.notes.length > 0) {
		const selectedId = persisted.selectedId && persisted.notes.some((note) => note.id === persisted.selectedId) ? persisted.selectedId : persisted.notes[0]?.id ?? null;
		useNotesStore.setState({
			notes: persisted.notes,
			selectedId,
			previewMode: Boolean(persisted.previewMode)
		});
	} else useNotesStore.getState().loadSeed();
	useNotesStore.setState({ hasHydrated: true });
}
function useNotesHydration() {
	const hasHydrated = useNotesStore((state) => state.hasHydrated);
	(0, import_react.useEffect)(() => {
		finishHydration();
	}, []);
	return hasHydrated;
}
function isMobileViewport() {
	return window.matchMedia("(max-width: 767px)").matches;
}
function NotesApp() {
	useNotesHydration();
	const desktopSearchRef = (0, import_react.useRef)(null);
	const mobileSearchRef = (0, import_react.useRef)(null);
	const editorRef = (0, import_react.useRef)(null);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const [helpOpen, setHelpOpen] = (0, import_react.useState)(false);
	const [modifier, setModifier] = (0, import_react.useState)("Ctrl");
	const notes = useNotesStore((state) => state.notes);
	const selectedId = useNotesStore((state) => state.selectedId);
	const createNote = useNotesStore((state) => state.createNote);
	const deleteNote = useNotesStore((state) => state.deleteNote);
	const selectNote = useNotesStore((state) => state.selectNote);
	const setSearch = useNotesStore((state) => state.setSearch);
	const togglePreview = useNotesStore((state) => state.togglePreview);
	(0, import_react.useEffect)(() => {
		setModifier(isMacUserAgent(navigator.userAgent) ? "⌘" : "Ctrl");
	}, []);
	(0, import_react.useEffect)(() => {
		function isTypingTarget(target) {
			if (!(target instanceof HTMLElement)) return false;
			const tag = target.tagName;
			return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
		}
		function focusSearch() {
			if (isMobileViewport()) {
				setMobileOpen(true);
				return;
			}
			desktopSearchRef.current?.focus();
		}
		function onKeyDown(event) {
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
			if (meta && event.shiftKey && (event.key === "Backspace" || event.key === "Delete")) {
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
				const index = Math.max(0, visible.findIndex((note) => note.id === currentId));
				const next = visible[event.key === "ArrowDown" ? Math.min(visible.length - 1, index + 1) : Math.max(0, index - 1)];
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
		togglePreview
	]);
	const selected = notes.find((note) => note.id === selectedId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-dvh overflow-hidden bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-72 shrink-0 border-r border-border md:flex md:flex-col xl:w-80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteSidebar, {
						searchRef: desktopSearchRef,
						editorRef,
						modifier
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: mobileOpen,
					onOpenChange: setMobileOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						showClose: false,
						className: "data-[state=open]:slide-in-from-left top-0 left-0 flex h-dvh w-80 max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-y-0 border-l-0 p-0 sm:max-w-none",
						onOpenAutoFocus: (event) => {
							event.preventDefault();
							mobileSearchRef.current?.focus();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "sr-only",
								children: "Notes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "sr-only",
								children: "Search and open your notes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteSidebar, {
								searchRef: mobileSearchRef,
								editorRef,
								modifier,
								onNavigate: () => setMobileOpen(false)
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "relative flex min-w-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorPane, {
						editorRef,
						modifier,
						onOpenSidebar: () => setMobileOpen(true),
						onRequestDelete: () => {
							if (selectedId) setDeleteOpen(true);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Keyboard shortcuts",
						className: "absolute right-3 bottom-12 hidden text-muted-foreground md:inline-flex",
						onClick: () => setHelpOpen(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {})
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: deleteOpen,
			onOpenChange: setDeleteOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this note?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: selected ? `“${noteTitle(selected.body)}” will be removed from this device. This cannot be undone.` : "This note will be removed from this device." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: () => {
					if (selectedId) deleteNote(selectedId);
				},
				children: "Delete"
			})] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: helpOpen,
			onOpenChange: setHelpOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Keyboard shortcuts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Use these from anywhere, including the editor." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutList, { modifier })] })
		})
	] });
}
function ShortcutList({ modifier }) {
	const combo = (key) => modifier === "⌘" ? `${modifier}${key}` : `Ctrl+${key}`;
	const rows = [
		[combo("N"), "New note"],
		[combo("K"), "Search"],
		["/", "Search (when not typing)"],
		[combo("E"), "Toggle preview"],
		[combo("⇧⌫"), "Delete note"],
		["↑ ↓", "Move between notes"],
		["Esc", "Clear search or close"],
		["?", "Open this panel"]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-border",
		children: rows.map(([keys, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between gap-4 py-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex gap-1",
				children: keys.split(" ").map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
					className: "app-kbd",
					children: part
				}, part))
			})]
		}, label))
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesApp, {});
}
//#endregion
export { Home as component };
