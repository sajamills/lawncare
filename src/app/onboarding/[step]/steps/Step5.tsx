"use client";

import { useState } from "react";

const TASKS = [
  { id: "fertilize", label: "Applied fertilizer" },
  { id: "pre-emergent", label: "Applied pre-emergent weed control" },
  { id: "post-emergent", label: "Applied post-emergent (weed killer)" },
  { id: "aerate", label: "Aerated the lawn" },
  { id: "overseed", label: "Overseeded" },
  { id: "dethatch", label: "Dethatched" },
  { id: "lime", label: "Applied lime or soil amendment" },
  { id: "pesticide", label: "Applied pesticide / grub control" },
  { id: "mow-started", label: "Started regular mowing" },
  { id: "irrigation", label: "Set up / ran irrigation system" },
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
          className="w-full px-4 py-4 rounded-lg text-left border transition-all flex flex-col"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: selected.has(NONE_ID) ? "var(--color-primary)" : "var(--color-border)",
            borderWidth: selected.has(NONE_ID) ? "2px" : "1px",
            color: "var(--color-text-primary)",
          }}
        >
          <span className="text-sm font-medium">
            None — I&apos;m just getting started
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Skip ahead to get your plan
          </span>
        </button>

        {TASKS.map((task) => {
          const isSelected = selected.has(task.id);
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => toggle(task.id)}
              className="w-full px-4 py-3 rounded-lg text-left border transition-all"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                borderWidth: isSelected ? "2px" : "1px",
                color: "var(--color-text-primary)",
              }}
            >
              <span className="text-sm font-medium">{task.label}</span>
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
