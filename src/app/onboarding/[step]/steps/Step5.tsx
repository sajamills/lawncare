"use client";

import { useState } from "react";

const TASKS = [
  { id: "fertilize", label: "Applied fertilizer or lawn food" },
  { id: "pre-emergent", label: "Used a product to prevent weeds before they sprouted" },
  { id: "post-emergent", label: "Used weed killer on existing weeds" },
  { id: "aerate", label: "Poked holes in the soil (aeration)" },
  { id: "overseed", label: "Spread grass seed to fill in thin areas" },
  { id: "dethatch", label: "Removed the layer of dead grass above the soil (dethatching)" },
  { id: "lime", label: "Adjusted soil pH with lime or a soil amendment" },
  { id: "pesticide", label: "Treated for insects, grubs, or lawn pests" },
  { id: "mow-started", label: "Started mowing regularly this season" },
  { id: "irrigation", label: "Used a sprinkler or irrigation system recently" },
] as const;

const NONE_ID = "none";

function getOnboardingState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("onboarding_state") ?? "{}");
  } catch {
    return {};
  }
}

function setOnboardingState(data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const current = getOnboardingState();
  sessionStorage.setItem(
    "onboarding_state",
    JSON.stringify({ ...current, ...data })
  );
}

export default function Step5New({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (id === NONE_ID) {
        return next.has(NONE_ID) ? new Set() : new Set([NONE_ID]);
      }
      next.delete(NONE_ID);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    const completed_tasks = selected.has(NONE_ID)
      ? []
      : Array.from(selected);
    setOnboardingState({ completed_tasks });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          What have you done so far this year?
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Check off anything you&apos;ve already done in {new Date().getFullYear()}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => toggle(NONE_ID)}
          className="w-full px-4 py-4 rounded-lg text-left border transition-all flex items-center gap-3"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: selected.has(NONE_ID) ? "var(--color-primary)" : "var(--color-border)",
            borderWidth: selected.has(NONE_ID) ? "2px" : "1px",
            color: "var(--color-text-primary)",
          }}
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              None — I&apos;m just getting started
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Skip ahead to get your plan
            </span>
          </div>
          {selected.has(NONE_ID) ? (
            <span
              className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}
            >
              ✓
            </span>
          ) : (
            <span
              className="ml-auto w-5 h-5 rounded-full border shrink-0"
              style={{ borderColor: "var(--color-border)" }}
            />
          )}
        </button>

        {TASKS.map((task) => {
          const isSelected = selected.has(task.id);
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => toggle(task.id)}
              className="w-full px-4 py-3 rounded-lg text-left border transition-all flex items-center gap-3"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: isSelected ? "2px" : "1px",
                color: "var(--color-text-primary)",
              }}
            >
              <span className="text-sm font-medium">{task.label}</span>
              {isSelected ? (
                <span
                  className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}
                >
                  ✓
                </span>
              ) : (
                <span
                  className="ml-auto w-5 h-5 rounded-full border shrink-0"
                  style={{ borderColor: "var(--color-border)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-3 rounded-lg font-semibold text-sm"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
        }}
      >
        Continue →
      </button>
    </div>
  );
}
