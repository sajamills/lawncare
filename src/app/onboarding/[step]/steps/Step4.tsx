"use client";

import { useState, useEffect } from "react";
import { grassTypes, GrassType } from "@/data/grass-types";

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

interface GrassScore {
  id: string;
  name: string;
  score: number;
  matchCount: number;
}

function getTopGrasses(): GrassType[] {
  const state = getOnboardingState();
  const scores = state.grass_scores as GrassScore[] | undefined;

  if (scores && scores.length > 0) {
    return scores
      .slice(0, 3)
      .map((s) => grassTypes.find((g) => g.id === s.id))
      .filter((g): g is GrassType => g !== undefined);
  }

  return grassTypes;
}

function TraitChip({ label }: { label: string }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: "#1a3a1a",
        color: "var(--color-text-muted)",
      }}
    >
      {label}
    </span>
  );
}

export default function Step4({ onNext }: { onNext: () => void }) {
  const [topGrasses, setTopGrasses] = useState<GrassType[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setTopGrasses(getTopGrasses());
  }, []);

  const displayList = showAll ? grassTypes : topGrasses;

  const handleConfirm = () => {
    if (!selected) return;
    setOnboardingState({ grass_type: selected });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Does your grass look like this?
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Select the grass type that looks most like yours.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {displayList.map((grass) => {
          const isSelected = selected === grass.id;
          return (
            <button
              key={grass.id}
              type="button"
              onClick={() => setSelected(grass.id)}
              className="w-full rounded-lg border text-left overflow-hidden transition-all"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: isSelected ? "var(--color-primary)" : "#2d4a2d",
                borderWidth: isSelected ? "2px" : "1px",
              }}
            >
              <div className="px-4 py-3 flex flex-col gap-2">
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {grass.name}
                </p>
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {grass.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <TraitChip
                    label={
                      grass.bladeWidth === "fine"
                        ? "Fine blade"
                        : grass.bladeWidth === "medium"
                        ? "Medium blade"
                        : "Wide blade"
                    }
                  />
                  <TraitChip
                    label={
                      grass.growthPattern === "spreading"
                        ? "Spreads"
                        : "Clumping"
                    }
                  />
                  <TraitChip
                    label={
                      grass.activeSeason === "warm"
                        ? "Warm season"
                        : grass.activeSeason === "cool"
                        ? "Cool season"
                        : "Year-round"
                    }
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-sm underline text-center"
          style={{ color: "var(--color-text-muted)" }}
        >
          None of these match — show all grass types
        </button>
      )}

      {selected && (
        <button
          onClick={handleConfirm}
          className="w-full py-3 rounded-lg font-semibold text-sm"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          This is my grass →
        </button>
      )}
    </div>
  );
}
