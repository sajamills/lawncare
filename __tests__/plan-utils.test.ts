import { describe, it, expect } from "vitest";
import fixture from "./fixtures/ar-bermudagrass-plan.json";
import {
  getISOWeek,
  clampWeek,
  getWeekPlan,
  findNextTaskWeek,
  normalizeGrassId,
  normalizeStateCode,
  validateWeeklyPlan,
  extractPlanFromText,
} from "@/lib/week-utils";
import type { WeeklyPlan } from "@/lib/week-utils";

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

// Year-boundary: week 52 and 53 policy
describe("clampWeek (week 53 policy)", () => {
  it("leaves week 52 unchanged", () => {
    expect(clampWeek(52)).toBe(52);
  });

  it("maps week 53 to week 52", () => {
    expect(clampWeek(53)).toBe(52);
  });

  it("leaves week 1 unchanged", () => {
    expect(clampWeek(1)).toBe(1);
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

  it("returns same result for week 52 and week 53 (clamping)", () => {
    const week52 = getWeekPlan(plan, 52);
    const week53 = getWeekPlan(plan, 53);
    expect(week52).toEqual(week53);
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

  it("returns first future week in order (week 11 for week 9 quiet lookup)", () => {
    const result = findNextTaskWeek(plan, 9);
    expect(result).not.toBeNull();
    expect(result!.week).toBe(11);
  });

  it("returns null when no future weeks have tasks (past last active week)", () => {
    const result = findNextTaskWeek(plan, 44);
    expect(result).toBeNull();
  });

  it("returns null when called with week 52 and no later tasks exist", () => {
    const result = findNextTaskWeek(plan, 52);
    expect(result).toBeNull();
  });

  it("returns null when called with week 53 (clamped boundary — nothing past 52)", () => {
    // afterWeek=53 means we look for weeks >53 which do not exist
    const result = findNextTaskWeek(plan, 53);
    expect(result).toBeNull();
  });
});

// validateWeeklyPlan
describe("validateWeeklyPlan", () => {
  it("passes a valid 52-week fixture", () => {
    expect(validateWeeklyPlan(plan)).toBeNull();
  });

  it("rejects null", () => {
    expect(validateWeeklyPlan(null)).not.toBeNull();
  });

  it("rejects empty array", () => {
    expect(validateWeeklyPlan([])).not.toBeNull();
  });

  it("rejects plan with all-empty task arrays (no real tasks across the year)", () => {
    const emptyPlan = Array.from({ length: 52 }, (_, i) => ({ week: i + 1, tasks: [] }));
    expect(validateWeeklyPlan(emptyPlan)).not.toBeNull();
  });

  it("rejects plan with invalid category", () => {
    const bad = [{ week: 1, tasks: [{ title: "X", description: "X", category: "unknown", priority: "routine", petSafetyNote: "" }] }];
    expect(validateWeeklyPlan(bad)).not.toBeNull();
  });

  it("rejects plan with invalid priority", () => {
    const bad = [{ week: 1, tasks: [{ title: "X", description: "X", category: "mow", priority: "high", petSafetyNote: "" }] }];
    expect(validateWeeklyPlan(bad)).not.toBeNull();
  });

  it("rejects plan with duplicate week numbers", () => {
    const bad = [
      { week: 1, tasks: [{ title: "X", description: "X", category: "mow", priority: "routine", petSafetyNote: "" }] },
      { week: 1, tasks: [] },
    ];
    expect(validateWeeklyPlan(bad)).not.toBeNull();
  });

  it("rejects plan with week > 53", () => {
    const bad = [{ week: 54, tasks: [{ title: "X", description: "X", category: "mow", priority: "routine", petSafetyNote: "" }] }];
    expect(validateWeeklyPlan(bad)).not.toBeNull();
  });
});

// extractPlanFromText
describe("extractPlanFromText", () => {
  it("returns null for empty string", () => {
    expect(extractPlanFromText("")).toBeNull();
  });

  it("returns null for partial JSON '{'", () => {
    expect(extractPlanFromText("{")).toBeNull();
  });

  it("returns null for empty array '[]'", () => {
    expect(extractPlanFromText("[]")).toBeNull();
  });

  it("returns null for array with tasks but all empty (no real tasks)", () => {
    const text = JSON.stringify(Array.from({ length: 52 }, (_, i) => ({ week: i + 1, tasks: [] })));
    expect(extractPlanFromText(text)).toBeNull();
  });

  it("extracts plan from Claude-style response with surrounding text", () => {
    const validEntry = {
      week: 1,
      tasks: [{ title: "Mow", description: "Mow the lawn", category: "mow", priority: "routine", petSafetyNote: "" }],
    };
    const text = `Here is your plan:\n${JSON.stringify([validEntry])}\nEnd of plan.`;
    const result = extractPlanFromText(text);
    expect(result).not.toBeNull();
    expect(result![0].week).toBe(1);
    expect(result![0].tasks[0].title).toBe("Mow");
  });
});

// TEST 6 — Input normalization
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
    expect(normalizeStateCode(" AR ")).toBe("AR");
  });
});
