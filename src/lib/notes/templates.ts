import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  BookOpen,
  Briefcase,
  CalendarRange,
  ListChecks,
  Lightbulb,
  FileText,
} from "lucide-react";

export type TemplateCategory = "Productivity" | "Personal" | "Projects";

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  body: string;
  icon: LucideIcon;
}

const BLANK_BODY = "";

const MEETING_BODY = `# Meeting Notes

## Attendees

## Agenda

## Discussion

## Decisions

## Action Items
`;

const JOURNAL_BODY = `# Daily Journal

## Today

## What went well

## What I learned

## What I'm thinking about

## Tomorrow
`;

const BRIEF_BODY = `# Project Brief

## Objective

## Background

## Goals

## Requirements

## Risks

## Next Steps
`;

const WEEKLY_BODY = `# Weekly Review

## Wins

## Challenges

## Lessons Learned

## Priorities

## Next Week
`;

const TODO_BODY = `# To-Do List

- [ ] Task one
- [ ] Task two
- [ ] Task three

## Notes
`;

const BRAINSTORM_BODY = `# Brainstorm

## Problem

## Ideas

## Interesting Possibilities

## Next Experiments
`;

export const BLANK_TEMPLATE: NoteTemplate = {
  id: "blank",
  name: "Blank Note",
  description: "Start from a clean page.",
  category: "Productivity",
  body: BLANK_BODY,
  icon: FileText,
};

export const TEMPLATES: NoteTemplate[] = [
  BLANK_TEMPLATE,
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Capture attendees, agenda, decisions, and action items.",
    category: "Productivity",
    body: MEETING_BODY,
    icon: CalendarDays,
  },
  {
    id: "daily-journal",
    name: "Daily Journal",
    description: "Reflect on your day with guided prompts.",
    category: "Personal",
    body: JOURNAL_BODY,
    icon: BookOpen,
  },
  {
    id: "project-brief",
    name: "Project Brief",
    description: "Define objectives, goals, requirements, and risks.",
    category: "Projects",
    body: BRIEF_BODY,
    icon: Briefcase,
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Review wins, challenges, and priorities for next week.",
    category: "Productivity",
    body: WEEKLY_BODY,
    icon: CalendarRange,
  },
  {
    id: "todo-list",
    name: "To-Do List",
    description: "A simple checklist with a notes section.",
    category: "Productivity",
    body: TODO_BODY,
    icon: ListChecks,
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    description: "Explore problems and generate new ideas.",
    category: "Projects",
    body: BRAINSTORM_BODY,
    icon: Lightbulb,
  },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Productivity",
  "Personal",
  "Projects",
];
