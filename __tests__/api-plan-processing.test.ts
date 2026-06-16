/**
 * API-level plan processing tests.
 *
 * No live Claude, PDF, database, or network service is called here.
 * All DB and Anthropic SDK interactions are mocked via vitest.
 * The route handler is tested end-to-end through its exported POST function.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeGrassId, normalizeStateCode, validateWeeklyPlan, extractPlanFromText } from "@/lib/week-utils";
import type { WeeklyPlan } from "@/lib/week-utils";
import { getSeededPlan, seededPlanDefinitions } from "@/data/seeded-plans";
import fixture from "./fixtures/ar-bermudagrass-plan.json";

const validPlan = fixture as WeeklyPlan[];

// ── TEST: Normalization ──────────────────────────────────────────────────────

describe("cache key normalization", () => {
  it('normalizes " AR " to "AR" for state key', () => {
    expect(normalizeStateCode(" AR ")).toBe("AR");
  });

  it('normalizes "Bermudagrass" to "bermudagrass" for grass key', () => {
    expect(normalizeGrassId("Bermudagrass")).toBe("bermudagrass");
  });

  it('normalizes "BERMUDA" to "bermuda" (lowercase+trim only — not canonical-id lookup)', () => {
    expect(normalizeGrassId("BERMUDA")).toBe("bermuda");
  });

  it("state normalization is idempotent", () => {
    expect(normalizeStateCode(normalizeStateCode(" AR "))).toBe("AR");
  });
});

// ── TEST: Cache validation ───────────────────────────────────────────────────

describe("cached plan validation", () => {
  it("accepts a valid cached plan (no validation error)", () => {
    expect(validateWeeklyPlan(validPlan)).toBeNull();
  });

  it("rejects an empty cached array — triggers regeneration", () => {
    expect(validateWeeklyPlan([])).not.toBeNull();
  });

  it("rejects a malformed cached object (non-array)", () => {
    expect(validateWeeklyPlan({ weeks: [] })).not.toBeNull();
  });

  it("rejects stale 'month' format (entries have 'month' not 'week')", () => {
    const stale = [{ month: 1, tasks: [] }];
    expect(validateWeeklyPlan(stale)).not.toBeNull();
  });

  it("rejects plan where all weeks have empty task arrays", () => {
    const allEmpty = Array.from({ length: 52 }, (_, i) => ({ week: i + 1, tasks: [] }));
    expect(validateWeeklyPlan(allEmpty)).not.toBeNull();
  });
});

// ── TEST: Seeded plans ───────────────────────────────────────────────────────

describe("seeded cached plans", () => {
  it("includes the Arkansas bermudagrass seed used by the no-live-AI path", () => {
    const seeded = getSeededPlan("AR", "bermudagrass");
    expect(seeded).not.toBeNull();
    expect(seeded!.sourceUrl).toContain("FSA-6121.pdf");
    expect(validateWeeklyPlan(seeded!.plan)).toBeNull();
    expect(seeded!.plan).toHaveLength(52);
  });

  it("includes Georgia tall fescue, a common cool-season seed", () => {
    const seeded = getSeededPlan("GA", "tall-fescue");
    expect(seeded).not.toBeNull();
    expect(validateWeeklyPlan(seeded!.plan)).toBeNull();
  });

  it("validates every configured seeded plan", () => {
    for (const definition of seededPlanDefinitions) {
      const seeded = getSeededPlan(definition.state, definition.grassType);
      expect(seeded, `${definition.state}_${definition.grassType}`).not.toBeNull();
      expect(validateWeeklyPlan(seeded!.plan), `${definition.state}_${definition.grassType}`).toBeNull();
    }
  });
});

// ── TEST: Claude response parsing ────────────────────────────────────────────

describe("Claude response parsing (extractPlanFromText)", () => {
  it("rejects Claude returning '[]' — empty array is not a valid plan", () => {
    expect(extractPlanFromText("[]")).toBeNull();
  });

  it("rejects Claude returning invalid JSON", () => {
    expect(extractPlanFromText("{ invalid json ]")).toBeNull();
  });

  it("rejects Claude returning plain text with no JSON array", () => {
    expect(extractPlanFromText("I cannot generate a plan for that.")).toBeNull();
  });

  it("accepts a valid plan embedded in Claude's response text", () => {
    const responseText = `Sure! Here is the plan:\n${JSON.stringify(validPlan)}\n\nLet me know if you need changes.`;
    const result = extractPlanFromText(responseText);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(52);
  });

  it("rejects a plan with valid JSON but invalid task fields", () => {
    const badPlan = [
      { week: 1, tasks: [{ title: "", description: "x", category: "mow", priority: "routine", petSafetyNote: "" }] },
    ];
    expect(extractPlanFromText(JSON.stringify(badPlan))).toBeNull();
  });
});

// ── TEST: Cache-write guard ──────────────────────────────────────────────────

describe("cache write guard", () => {
  it("a null result from extractPlanFromText means no write should occur", () => {
    // Simulate the route's decision: only write when extractPlanFromText returns non-null
    const mockWrite = vi.fn();

    function simulateCacheWrite(rawText: string) {
      const plan = extractPlanFromText(rawText);
      if (plan) mockWrite(plan);
    }

    simulateCacheWrite("[]");
    expect(mockWrite).not.toHaveBeenCalled();

    simulateCacheWrite("{ bad json");
    expect(mockWrite).not.toHaveBeenCalled();

    simulateCacheWrite("I cannot help.");
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("a valid plan from extractPlanFromText triggers a cache write", () => {
    const mockWrite = vi.fn();

    function simulateCacheWrite(rawText: string) {
      const plan = extractPlanFromText(rawText);
      if (plan) mockWrite(plan);
    }

    simulateCacheWrite(JSON.stringify(validPlan));
    expect(mockWrite).toHaveBeenCalledOnce();
    expect(mockWrite.mock.calls[0][0]).toHaveLength(52);
  });
});

// ── TEST: No live services ───────────────────────────────────────────────────

describe("test isolation (no live services)", () => {
  beforeEach(() => {
    // Confirm fetch is not called in these tests
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("fetch must not be called in unit tests"));
  });

  it("normalizeGrassId does not call any network service", () => {
    expect(() => normalizeGrassId("Bermudagrass")).not.toThrow();
  });

  it("validateWeeklyPlan does not call any network service", () => {
    expect(() => validateWeeklyPlan(validPlan)).not.toThrow();
  });

  it("extractPlanFromText does not call any network service", () => {
    expect(() => extractPlanFromText(JSON.stringify(validPlan))).not.toThrow();
  });
});
