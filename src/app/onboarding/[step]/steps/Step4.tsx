"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
      style={{ backgroundColor: "#1a3a1a", color: "var(--color-text-muted)" }}
    >
      {label}
    </span>
  );
}

function GrassCard({
  grass,
  isSelected,
  onSelect,
}: {
  grass: GrassType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-lg border text-left overflow-hidden transition-all flex flex-col"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: isSelected ? "var(--color-primary)" : "#2d4a2d",
        borderWidth: isSelected ? "2px" : "1px",
      }}
    >
      {/* Photo */}
      <div className="relative w-full aspect-video bg-[#1a3a1a]">
        <Image
          src={grass.photoUrl}
          alt={`${grass.name} grass`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
          unoptimized={false}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-2.5">
        <p
          className="font-semibold text-sm leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {grass.name}
        </p>
        <div className="flex flex-wrap gap-1">
          <TraitChip
            label={
              grass.bladeWidth === "fine"
                ? "Fine blade"
                : grass.bladeWidth === "medium"
                ? "Med. blade"
                : "Wide blade"
            }
          />
          <TraitChip
            label={grass.activeSeason === "warm" ? "Warm season" : "Cool season"}
          />
        </div>
        <p
          className="text-[10px] leading-tight mt-0.5"
          style={{ color: "var(--color-text-muted)", opacity: 0.6 }}
        >
          {grass.photoCredit}
        </p>
      </div>
    </button>
  );
}

export default function Step4({ onNext }: { onNext: () => void }) {
  const [topGrasses, setTopGrasses] = useState<GrassType[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setTopGrasses(getTopGrasses());
    const state = getOnboardingState();
    if (state.grass_type) setSelected(state.grass_type as string);
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {displayList.map((grass) => (
          <GrassCard
            key={grass.id}
            grass={grass}
            isSelected={selected === grass.id}
            onSelect={() => setSelected(grass.id)}
          />
        ))}
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
