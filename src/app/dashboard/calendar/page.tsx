"use client";

import { useEffect, useState } from "react";

type TaskCategory = "mow" | "fertilize" | "water" | "aerate" | "seed" | "pest-weed" | "other";
type TaskPriority = "urgent" | "routine" | "optional";

interface Task {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  petSafetyNote: string;
}

interface MonthlyPlan {
  month: number;
  tasks: Task[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  mow: "#4caf50",
  fertilize: "#eab308",
  water: "#3b82f6",
  aerate: "#f97316",
  seed: "#84cc16",
  "pest-weed": "#ef4444",
  other: "#6b7280",
};

const CATEGORY_ICONS: Record<TaskCategory, string> = {
  mow: "🌿",
  fertilize: "🌱",
  water: "💧",
  aerate: "🔧",
  seed: "🌾",
  "pest-weed": "🐛",
  other: "📋",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "#ef4444",
  routine: "#eab308",
  optional: "#6b7280",
};

function getOnboardingState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("onboarding_state") ?? "{}");
  } catch {
    return {};
  }
}

type ViewMode = "calendar" | "list";

export default function CalendarPage() {
  const [plan, setPlan] = useState<MonthlyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    async function loadPlan() {
      const state = getOnboardingState();
      if (!state.state || !state.grass_type) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfUrl: "",
            state: state.state,
            grassType: state.grass_type,
          }),
        });
        if (res.ok) {
          const { plan: data } = await res.json() as { plan: MonthlyPlan[] };
          if (data) setPlan(data);
        }
      } catch {
        // Best-effort
      }

      setLoading(false);
    }

    loadPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 py-16">
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  function MonthTaskList({ monthPlan }: { monthPlan: MonthlyPlan }) {
    if (monthPlan.tasks.length === 0) {
      return (
        <p
          className="text-sm py-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          No tasks this month.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-2 mt-2">
        {monthPlan.tasks.map((task, i) => (
          <div
            key={i}
            className="rounded-lg p-3 border flex flex-col gap-1"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "#2d4a2d",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{CATEGORY_ICONS[task.category]}</span>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {task.title}
                </p>
              </div>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${PRIORITY_COLORS[task.priority]}22`,
                  color: PRIORITY_COLORS[task.priority],
                }}
              >
                {task.priority}
              </span>
            </div>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {task.description}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your Year at a Glance
        </h1>
        <div
          className="flex rounded-lg overflow-hidden border text-sm"
          style={{ borderColor: "#2d4a2d" }}
        >
          {(["calendar", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="px-3 py-1.5 capitalize"
              style={{
                backgroundColor:
                  viewMode === mode
                    ? "var(--color-primary)"
                    : "var(--color-surface)",
                color:
                  viewMode === mode
                    ? "var(--color-background)"
                    : "var(--color-text-muted)",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {MONTH_NAMES.map((name, idx) => {
              const monthNum = idx + 1;
              const monthPlan = plan.find((m) => m.month === monthNum);
              const isCurrentMonth = monthNum === currentMonth;
              const isExpanded = expandedMonth === monthNum;
              const categories = [
                ...new Set(monthPlan?.tasks.map((t) => t.category) ?? []),
              ] as TaskCategory[];

              return (
                <div
                  key={name}
                  className="flex flex-col gap-2 w-28 shrink-0"
                >
                  <button
                    onClick={() =>
                      setExpandedMonth(isExpanded ? null : monthNum)
                    }
                    className="rounded-lg p-3 border text-left"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: isCurrentMonth
                        ? "var(--color-primary)"
                        : "#2d4a2d",
                      borderWidth: isCurrentMonth ? "2px" : "1px",
                    }}
                  >
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{
                        color: isCurrentMonth
                          ? "var(--color-primary)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {categories.length === 0 ? (
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          —
                        </span>
                      ) : (
                        categories.map((cat) => (
                          <span
                            key={cat}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                            title={cat}
                          />
                        ))
                      )}
                    </div>
                  </button>

                  {isExpanded && monthPlan && (
                    <div
                      className="rounded-lg p-3 border"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "#2d4a2d",
                      }}
                    >
                      <MonthTaskList monthPlan={monthPlan} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {MONTH_NAMES.map((name, idx) => {
            const monthNum = idx + 1;
            const monthPlan = plan.find((m) => m.month === monthNum) ?? {
              month: monthNum,
              tasks: [],
            };
            const isCurrentMonth = monthNum === currentMonth;

            return (
              <div key={name}>
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{
                    color: isCurrentMonth
                      ? "var(--color-primary)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {name}
                  {isCurrentMonth && (
                    <span
                      className="ml-2 text-xs font-normal"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      (current month)
                    </span>
                  )}
                </h2>
                <MonthTaskList monthPlan={monthPlan} />
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {(Object.entries(CATEGORY_COLORS) as [TaskCategory, string][]).map(
          ([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span style={{ color: "var(--color-text-muted)" }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
