"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { grassTypes } from "@/data/grass-types";
import { getPreemergentWindow } from "@/data/preemergent-windows";
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

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  urgent: { bg: "rgba(239,68,68,0.13)", text: "var(--color-urgent)" },
  routine: { bg: "rgba(234,179,8,0.13)", text: "var(--color-routine)" },
  optional: { bg: "rgba(107,114,128,0.13)", text: "var(--color-optional)" },
};

const LOADING_MESSAGES = [
  "Identifying your grass type and climate zone…",
  "Consulting university extension research…",
  "Building your 52-week care calendar…",
  "Almost there — personalizing your plan…",
];

// ── ISO week utilities ──────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getWeekDateRange(week: number, year: number): string {
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

// ── Pre-emergent banner ─────────────────────────────────────────────────────

function parseMD(mmdd: string, year: number): Date {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, d));
}

function daysUntil(target: Date, from: Date): number {
  return Math.ceil((target.getTime() - from.getTime()) / 86400000);
}

function formatMD(mmdd: string): string {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(Date.UTC(2000, m - 1, d)).toLocaleDateString("default", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

interface PreemergentAlert {
  season: "spring" | "fall";
  weeksAway: number | null;
  startLabel: string;
  endLabel: string;
}

function getPreemergentAlert(state: string, today: Date): PreemergentAlert | null {
  const win = getPreemergentWindow(state);
  if (!win) return null;
  const year = today.getUTCFullYear();
  for (const season of ["spring", "fall"] as const) {
    const w = win[season];
    const start = parseMD(w.startDate, year);
    const end = parseMD(w.endDate, year);
    if (today >= start && today <= end) {
      return { season, weeksAway: null, startLabel: formatMD(w.startDate), endLabel: formatMD(w.endDate) };
    }
    const daysToStart = daysUntil(start, today);
    if (daysToStart > 0 && daysToStart <= 21) {
      return { season, weeksAway: Math.ceil(daysToStart / 7), startLabel: formatMD(w.startDate), endLabel: formatMD(w.endDate) };
    }
  }
  return null;
}

// ── Session helpers ─────────────────────────────────────────────────────────

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

const BANNER_DISMISSED_KEY = "preemergent_banner_dismissed";

// ── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [nextWeekTasks, setNextWeekTasks] = useState<WeeklyTask[]>([]);
  const [nextWeekRange, setNextWeekRange] = useState("");
  const [hasPets, setHasPets] = useState(false);
  const [sqFt, setSqFt] = useState<number | null>(null);
  const [grassName, setGrassName] = useState("");
  const [weekRange, setWeekRange] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [alert, setAlert] = useState<PreemergentAlert | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showOnboardingGate, setShowOnboardingGate] = useState(false);
  const [completedTitles, setCompletedTitles] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadData() {
      let stateCode: string | undefined;
      let grassType: string | undefined;
      let pets = false;
      let sqFtVal: number | null = null;

      // 1. Try sessionStorage first
      const session = getOnboardingState();
      stateCode = session.state as string | undefined;
      grassType = session.grass_type as string | undefined;
      pets = (session.has_pets as boolean) ?? false;
      sqFtVal = (session.square_footage as number) ?? null;

      // 2. Cold-load from DB if sessionStorage is empty
      if (!stateCode || !grassType) {
        const sessionId = typeof window !== "undefined" ? localStorage.getItem("lawn_session_id") : null;
        if (sessionId) {
          try {
            const { getProfile } = await import("@/actions/profile");
            const profile = await getProfile(sessionId);
            if (profile?.state && profile?.grass_type) {
              stateCode = profile.state;
              grassType = profile.grass_type;
              pets = profile.has_pets ?? false;
              sqFtVal = profile.square_footage ?? null;
            }
          } catch {
            // DB unavailable
          }
        }
      }

      // 3. Still nothing — show onboarding gate
      if (!stateCode || !grassType) {
        setShowOnboardingGate(true);
        setLoading(false);
        return;
      }

      setHasPets(pets);
      setSqFt(sqFtVal);

      if (grassType) {
        const grass = grassTypes.find((g) => g.id === grassType);
        setGrassName(grass?.name ?? grassType);
      }

      const now = new Date();
      const week = getISOWeek(now);
      setCurrentWeek(week);
      setWeekRange(getWeekDateRange(week, now.getFullYear()));
      setNextWeekRange(getWeekDateRange(week + 1, now.getFullYear()));

      // Restore completed tasks for this week
      try {
        const saved = JSON.parse(sessionStorage.getItem(`completed_tasks_week_${week}`) ?? "[]") as string[];
        setCompletedTitles(new Set(saved));
      } catch { /* ignore */ }

      // Pre-emergent banner
      const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY) === "true";
      setBannerDismissed(dismissed);
      if (!dismissed) setAlert(getPreemergentAlert(stateCode, now));

      // Fetch the plan
      setGeneratingPlan(true);
      intervalRef.current = setInterval(() => {
        setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 3000);

      try {
        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: stateCode, grassType }),
        });
        if (res.ok) {
          const { plan } = await res.json() as { plan: WeeklyPlan[] };
          const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, routine: 1, optional: 2 };

          const weekPlan = plan?.find((w) => w.week === week);
          if (weekPlan) {
            setTasks([...weekPlan.tasks].sort(
              (a, b) => PRIORITY_ORDER[a.priority as TaskPriority] - PRIORITY_ORDER[b.priority as TaskPriority]
            ));
          }

          const nextWeekPlan = plan?.find((w) => w.week === week + 1);
          if (nextWeekPlan && nextWeekPlan.tasks.length > 0) {
            setNextWeekTasks(nextWeekPlan.tasks.slice(0, 3));
          }
        }
      } catch {
        // Best-effort
      } finally {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGeneratingPlan(false);
      }

      setLoading(false);
    }

    loadData();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const dismissBanner = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setBannerDismissed(true);
  };

  const toggleTask = (title: string) => {
    setCompletedTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      sessionStorage.setItem(`completed_tasks_week_${currentWeek}`, JSON.stringify([...next]));
      return next;
    });
  };

  // Sort completed tasks to bottom
  const sortedTasks = [
    ...tasks.filter((t) => !completedTitles.has(t.title)),
    ...tasks.filter((t) => completedTitles.has(t.title)),
  ];

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
      {/* Pre-emergent banner */}
      {alert && !bannerDismissed && (
        <div
          className="flex items-start gap-3 rounded-lg px-4 py-3 border"
          style={{ backgroundColor: "var(--color-warning-bg)", borderColor: "var(--color-warning-border)" }}
        >
          <span className="text-lg shrink-0">{alert.season === "spring" ? "🌱" : "🍂"}</span>
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="font-semibold text-sm" style={{ color: "var(--color-warning-text)" }}>
              {alert.weeksAway === null
                ? "Pre-Emergent Window: Active Now"
                : `Pre-Emergent Window: ${alert.weeksAway} week${alert.weeksAway === 1 ? "" : "s"} away`}
            </p>
            <p className="text-xs leading-snug" style={{ color: "var(--color-warning-text-muted)" }}>
              Apply when soil temp reaches {alert.season === "spring" ? "50°F (spring)" : "70°F (fall)"}. Typical window: {alert.startLabel} – {alert.endLabel}
            </p>
          </div>
          <button type="button" onClick={dismissBanner} className="text-sm shrink-0 mt-0.5" style={{ color: "var(--color-warning-text)" }} aria-label="Dismiss banner">×</button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Right Now
        </h1>
        {grassName && (
          <p style={{ color: "var(--color-text-muted)" }}>
            Your lawn: {grassName}{weekRange && ` • ${weekRange}`}
          </p>
        )}
      </div>

      {/* Onboarding gate */}
      {showOnboardingGate && (
        <div className="rounded-lg p-6 border flex flex-col gap-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <div>
            <p className="font-bold text-lg mb-1" style={{ color: "var(--color-text-primary)" }}>Set up your lawn profile</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Answer a few quick questions to get your personalized 52-week care plan.</p>
          </div>
          <Link href="/onboarding/1" className="inline-block text-center py-3 px-6 rounded-lg font-semibold text-sm w-full" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}>
            Get started →
          </Link>
        </div>
      )}

      {/* Loading progress messages */}
      {generatingPlan && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
          <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
        </div>
      )}

      {/* Task list */}
      {!showOnboardingGate && !generatingPlan && (
        <>
          {sortedTasks.length === 0 ? (
            <div className="rounded-lg p-6 text-center border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <p style={{ color: "var(--color-text-muted)" }}>
                Nothing urgent this week — check back soon or{" "}
                <Link href="/dashboard/calendar" className="underline" style={{ color: "var(--color-primary)" }}>
                  view your full annual calendar
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedTasks.map((task, i) => {
                const done = completedTitles.has(task.title);
                return (
                  <div
                    key={i}
                    className="rounded-lg p-4 border flex flex-col gap-2"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderLeftColor: task.priority === "urgent"
                        ? "var(--color-urgent)"
                        : task.priority === "routine"
                        ? "var(--color-routine)"
                        : "var(--color-border)",
                      borderLeftWidth: task.priority === "optional" ? "1px" : "4px",
                      opacity: done ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span>{CATEGORY_ICONS[task.category as TaskCategory] ?? "📋"}</span>
                        <p className="font-semibold truncate" style={{ color: "var(--color-text-primary)", textDecoration: done ? "line-through" : "none" }}>
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.title)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            padding: "6px",
                            margin: "-6px",
                            borderColor: done ? "var(--color-primary)" : "var(--color-border)",
                            backgroundColor: done ? "var(--color-primary)" : "transparent",
                            color: done ? "var(--color-background)" : "transparent",
                          }}
                          aria-label={done ? "Mark incomplete" : "Mark complete"}
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {scaleQuantity(task.description, sqFt)}
                    </p>
                    {hasPets && task.petSafetyNote && (
                      <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-md" style={{ backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning-text)" }}>
                        <span>⚠️</span>
                        <span>{task.petSafetyNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Up Next */}
          {nextWeekTasks.length > 0 && (
            <div className="rounded-lg p-4 border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <div className="flex items-baseline gap-1 mb-3">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Up Next</p>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>· {nextWeekRange}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {nextWeekTasks.map((task, i) => (
                  <p key={i} className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {CATEGORY_ICONS[task.category as TaskCategory] ?? "📋"} {task.title}
                  </p>
                ))}
                {/* "N more" shown by parent since we already sliced to 3 in state */}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
