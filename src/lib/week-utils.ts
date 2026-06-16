// ── Types (shared between route, dashboard, and tests) ─────────────────────

type TaskCategory = "mow" | "fertilize" | "water" | "aerate" | "seed" | "pest-weed" | "other";
type TaskPriority = "urgent" | "routine" | "optional";

export interface WeeklyTask {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  petSafetyNote: string;
}

export interface WeeklyPlan {
  week: number;
  tasks: WeeklyTask[];
}

// ── Week policy ─────────────────────────────────────────────────────────────
//
// This app supports ISO 8601 weeks 1–52 only.
// ISO week 53 occurs in some years (e.g. 2015, 2020, 2026).
// Policy: clampWeek() maps week 53 → 52 so dashboard/calendar lookups
// remain within the 52-entry plan array. Plans are generated for weeks 1–52;
// week 53 reuses week 52's tasks.
//
// Tests for week 52 and 53 live in __tests__/plan-utils.test.ts.

export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function clampWeek(week: number): number {
  return week > 52 ? 52 : week;
}

export function getWeekDateRange(week: number, year: number): string {
  const clamped = clampWeek(week);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1) + (clamped - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("default", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export function normalizeGrassId(id: string): string {
  return id.toLowerCase().trim();
}

export function normalizeStateCode(code: string): string {
  return code.toUpperCase().trim();
}

export function getWeekPlan(plan: WeeklyPlan[], week: number): WeeklyTask[] {
  const clamped = clampWeek(week);
  return plan.find((w) => w.week === clamped)?.tasks ?? [];
}

export function findNextTaskWeek(
  plan: WeeklyPlan[],
  afterWeek: number
): { week: number; task: WeeklyTask } | null {
  const sorted = [...plan]
    .filter((w) => w.week > afterWeek && w.tasks.length > 0)
    .sort((a, b) => a.week - b.week);
  if (sorted.length === 0) return null;
  return { week: sorted[0].week, task: sorted[0].tasks[0] };
}

// ── Plan validation ─────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set<string>(["mow", "fertilize", "water", "aerate", "seed", "pest-weed", "other"]);
const VALID_PRIORITIES = new Set<string>(["urgent", "routine", "optional"]);

export interface PlanValidationError {
  message: string;
}

export function validateWeeklyPlan(plan: unknown): PlanValidationError | null {
  if (!Array.isArray(plan)) return { message: "Plan is not an array" };
  if (plan.length === 0) return { message: "Plan array is empty" };

  const weeksSeen = new Set<number>();
  let hasAnyTask = false;

  for (let i = 0; i < plan.length; i++) {
    const entry = plan[i] as Record<string, unknown>;
    if (typeof entry !== "object" || entry === null) {
      return { message: `Entry ${i} is not an object` };
    }

    const week = entry.week;
    if (typeof week !== "number" || !Number.isInteger(week) || week < 1 || week > 53) {
      return { message: `Entry ${i} has invalid week: ${JSON.stringify(week)}` };
    }

    if (weeksSeen.has(week)) {
      return { message: `Duplicate week number: ${week}` };
    }
    weeksSeen.add(week);

    const tasks = entry.tasks;
    if (!Array.isArray(tasks)) {
      return { message: `Week ${week} is missing a tasks array` };
    }

    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j] as Record<string, unknown>;
      if (typeof task !== "object" || task === null) {
        return { message: `Week ${week}, task ${j} is not an object` };
      }
      if (typeof task.title !== "string" || task.title.length === 0) {
        return { message: `Week ${week}, task ${j} missing title` };
      }
      if (typeof task.description !== "string") {
        return { message: `Week ${week}, task ${j} missing description` };
      }
      if (!VALID_CATEGORIES.has(task.category as string)) {
        return { message: `Week ${week}, task ${j} has invalid category: ${task.category as string}` };
      }
      if (!VALID_PRIORITIES.has(task.priority as string)) {
        return { message: `Week ${week}, task ${j} has invalid priority: ${task.priority as string}` };
      }
      if (typeof task.petSafetyNote !== "string") {
        return { message: `Week ${week}, task ${j} missing petSafetyNote` };
      }
      hasAnyTask = true;
    }
  }

  if (!hasAnyTask) {
    return { message: "Plan has no tasks across any week" };
  }

  return null;
}

export function extractPlanFromText(rawText: string): WeeklyPlan[] | null {
  if (!rawText) return null;
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    const error = validateWeeklyPlan(parsed);
    if (error) return null;
    return parsed as WeeklyPlan[];
  } catch {
    return null;
  }
}
