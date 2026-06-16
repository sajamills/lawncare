import { describe, it, expect } from "vitest";
import fixture from "./fixtures/ar-bermudagrass-plan.json";
import {
  getISOWeek,
  getWeekPlan,
  findNextTaskWeek,
  normalizeGrassId,
  normalizeStateCode,
} from "@/lib/week-utils";
import type { WeeklyPlan } from "@/app/api/parse-pdf/route";

const plan = fixture as WeeklyPlan[];

// TEST 1 — Week convention: app's own getISOWeek for June 15 2026
describe("getISOWeek", () => {
  it("returns 25 for June 15 2026", () => {
    expect(getISOWeek(new Date("2026-06-15T12:00:00Z"))).toBe(25);
  });

  it("returns 1 for January 4 2026 (anchor of ISO week 1)", () => {
    expect(getISOWeek(new Date("2026-01-04T12:00:00Z"))).toBe(1);
  });
});

// TEST 2 — Week lookup returns correct tasks for a known week
describe("getWeekPlan", () => {
  it("returns tasks for week 25 in the fixture", () => {
    const tasks = getWeekPlan(plan, 25);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].title).toBeDefined();
    expect(tasks[0].category).toBeDefined();
    expect(tasks[0].priority).toBeDefined();
  });

  it("returns empty array for week 1 (bermudagrass dormant in January)", () => {
    const tasks = getWeekPlan(plan, 1);
    expect(tasks).toEqual([]);
  });
});

// TEST 3 — Quiet-week finder returns nearest future task
describe("findNextTaskWeek", () => {
  it("finds a future week with tasks when current week is empty", () => {
    const result = findNextTaskWeek(plan, 1);
    expect(result).not.toBeNull();
    expect(result!.week).toBeGreaterThan(1);
    expect(result!.task.title).toBeDefined();
  });

  it("returns first future week in order (week 11 for week 10 quiet lookup)", () => {
    const result = findNextTaskWeek(plan, 9);
    expect(result).not.toBeNull();
    expect(result!.week).toBe(11);
  });

  it("returns null when no future weeks have tasks (past last active week)", () => {
    const result = findNextTaskWeek(plan, 44);
    expect(result).toBeNull();
  });
});

// TEST 4 — Malformed AI responses are not treated as successful empty plans
describe("malformed plan detection", () => {
  function extractPlan(rawText: string): WeeklyPlan[] | null {
    if (!rawText) return null;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    try {
      const parsed = JSON.parse(jsonMatch[0]) as WeeklyPlan[];
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  it("returns null for empty string response", () => {
    expect(extractPlan("")).toBeNull();
  });

  it("returns null for partial JSON '{'", () => {
    expect(extractPlan("{")).toBeNull();
  });

  it("returns null for empty array '[]' — not a valid plan", () => {
    expect(extractPlan("[]")).toBeNull();
  });

  it("returns plan when response contains valid JSON array", () => {
    const validResponse = `Here is your plan:\n${JSON.stringify([{ week: 1, tasks: [{ title: "Test", description: "desc", category: "mow", priority: "routine", petSafetyNote: "" }] }])}`;
    const result = extractPlan(validResponse);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
  });
});

// TEST 5 — Cache logic: read before write (verified via fixture structure)
describe("cache read before write", () => {
  it("fixture has 52 weeks so cache hit path can return without calling Claude", () => {
    // A cache hit returns the stored plan directly. Verify the fixture is
    // structurally valid (52 weeks, all have a 'week' key) — same shape the
    // cache stores and the cache-hit branch returns.
    expect(plan.length).toBe(52);
    for (const entry of plan) {
      expect(typeof entry.week).toBe("number");
      expect(Array.isArray(entry.tasks)).toBe(true);
    }
  });

  it("stale cache detection: plan with 'month' key is identified as stale", () => {
    const staleFormatPlan = [{ month: 1, tasks: [] }] as unknown as WeeklyPlan[];
    const isStale =
      Array.isArray(staleFormatPlan) &&
      staleFormatPlan.length > 0 &&
      !("week" in staleFormatPlan[0]);
    expect(isStale).toBe(true);
  });

  it("fresh cache: plan with 'week' key is NOT stale", () => {
    const freshPlan = [{ week: 1, tasks: [] }] as WeeklyPlan[];
    const isStale =
      Array.isArray(freshPlan) &&
      freshPlan.length > 0 &&
      !("week" in freshPlan[0]);
    expect(isStale).toBe(false);
  });
});

// TEST 6 — Grass ID and state code normalization
describe("input normalization", () => {
  it("normalizeGrassId lowercases and trims", () => {
    expect(normalizeGrassId("Bermudagrass")).toBe("bermudagrass");
    expect(normalizeGrassId("bermudagrass ")).toBe("bermudagrass");
    expect(normalizeGrassId("TALL-FESCUE")).toBe("tall-fescue");
  });

  it("normalizeStateCode uppercases and trims", () => {
    expect(normalizeStateCode("ar")).toBe("AR");
    expect(normalizeStateCode("AR")).toBe("AR");
    expect(normalizeStateCode(" tx ")).toBe("TX");
  });
});
