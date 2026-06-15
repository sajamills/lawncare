"use client";

import { useEffect, useState } from "react";
import { grassTypes } from "@/data/grass-types";
import type { WeeklyPlan, WeeklyTask } from "@/app/api/parse-pdf/route";

type TaskCategory = "mow" | "fertilize" | "water" | "aerate" | "seed" | "pest-weed" | "other";
type TaskPriority = "urgent" | "routine" | "optional";

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

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getWeekDateRange(week: number, year: number): string {
  // Find Monday of the given ISO week
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

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lawn_session_id");
}

function getOnboardingState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("onboarding_state") ?? "{}");
  } catch {
    return {};
  }
}

function scaleQuantity(description: string, sqFt: number | null): string {
  if (!sqFt) return description;
  return description.replace(
    /(\d+(?:\.\d+)?)\s*lbs?\s+(?:of\s+)?(\w+)\s+per\s+1[,.]?000\s+sq\s*ft/gi,
    (_, amount, product) => {
      const total = ((parseFloat(amount) * sqFt) / 1000).toFixed(1);
      return `${amount} lbs ${product} per 1,000 sq ft × your ${sqFt.toLocaleString()} sq ft = ${total} lbs total`;
    }
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [hasPets, setHasPets] = useState(false);
  const [sqFt, setSqFt] = useState<number | null>(null);
  const [grassName, setGrassName] = useState("");
  const [weekRange, setWeekRange] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const state = getOnboardingState();
      void getSessionId();

      setHasPets((state.has_pets as boolean) ?? false);
      setSqFt((state.square_footage as number) ?? null);

      const grassId = state.grass_type as string | undefined;
      if (grassId) {
        const grass = grassTypes.find((g) => g.id === grassId);
        setGrassName(grass?.name ?? grassId);
      }

      const now = new Date();
      const currentWeek = getISOWeek(now);
      setWeekRange(getWeekDateRange(currentWeek, now.getFullYear()));

      if (state.state && state.grass_type) {
        try {
          const res = await fetch("/api/parse-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              state: state.state,
              grassType: state.grass_type,
            }),
          });
          if (res.ok) {
            const { plan } = await res.json() as { plan: WeeklyPlan[] };
            const weekPlan = plan?.find((w) => w.week === currentWeek);
            if (weekPlan) {
              const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, routine: 1, optional: 2 };
              const sorted = [...weekPlan.tasks].sort(
                (a, b) => PRIORITY_ORDER[a.priority as TaskPriority] - PRIORITY_ORDER[b.priority as TaskPriority]
              );
              setTasks(sorted);
            }
          }
        } catch {
          // Best-effort
        }
      }

      setLoading(false);
    }

    loadData();
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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Right Now
        </h1>
        {grassName && (
          <p style={{ color: "var(--color-text-muted)" }}>
            Your lawn: {grassName}
            {weekRange && ` • ${weekRange}`}
          </p>
        )}
      </div>

      {tasks.length === 0 ? (
        <div
          className="rounded-lg p-6 text-center border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "#2d4a2d",
          }}
        >
          <p style={{ color: "var(--color-text-muted)" }}>
            Nothing urgent this week — check back soon or view your full annual
            calendar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task, i) => (
            <div
              key={i}
              className="rounded-lg p-4 border flex flex-col gap-2"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "#2d4a2d",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[task.category as TaskCategory]}</span>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {task.title}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[task.priority as TaskPriority]}22`,
                    color: PRIORITY_COLORS[task.priority as TaskPriority],
                  }}
                >
                  {task.priority}
                </span>
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {scaleQuantity(task.description, sqFt)}
              </p>
              {hasPets && task.petSafetyNote && (
                <div
                  className="flex items-start gap-2 text-xs px-3 py-2 rounded-md"
                  style={{ backgroundColor: "#3d3000", color: "#eab308" }}
                >
                  <span>⚠️</span>
                  <span>{task.petSafetyNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
