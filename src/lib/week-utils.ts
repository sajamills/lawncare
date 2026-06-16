import type { WeeklyPlan, WeeklyTask } from "@/app/api/parse-pdf/route";

export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekDateRange(week: number, year: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1) + (week - 1) * 7);
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
  return plan.find((w) => w.week === week)?.tasks ?? [];
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
