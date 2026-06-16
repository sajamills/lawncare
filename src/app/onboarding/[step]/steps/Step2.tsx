"use client";

import { useState } from "react";

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

type SunExposure = "full-sun" | "partial-shade" | "full-shade";

const SUN_OPTIONS: { value: SunExposure; label: string; desc: string }[] = [
  { value: "full-sun", label: "Full Sun", desc: "6+ hours of direct sun" },
  { value: "partial-shade", label: "Partial Shade", desc: "3–6 hours of sun" },
  { value: "full-shade", label: "Full Shade", desc: "Less than 3 hours" },
];

export default function Step2({ onNext }: { onNext: () => void }) {
  const [sqFt, setSqFt] = useState<string>("");
  const [notSure, setNotSure] = useState(false);
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [sunExposure, setSunExposure] = useState<SunExposure | null>(null);

  const canContinue = hasPets !== null && sunExposure !== null;

  const handleContinue = () => {
    setOnboardingState({
      square_footage: notSure ? null : sqFt ? parseInt(sqFt, 10) : null,
      has_pets: hasPets,
      sun_exposure: sunExposure,
    });
    onNext();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Tell us about your yard
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          This helps us tailor quantities and advice to your lawn.
        </p>
      </div>

      {/* Square footage */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          Approximate lawn size (sq ft)
        </label>
        <input
          type="number"
          min="0"
          value={notSure ? "" : sqFt}
          disabled={notSure}
          onChange={(e) => setSqFt(e.target.value)}
          placeholder="e.g. 3200"
          className="w-full px-4 py-3 rounded-lg text-lg outline-none border disabled:opacity-40"
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            borderColor: "var(--color-border)",
          }}
        />
        <button
          type="button"
          onClick={() => {
            setNotSure(!notSure);
            if (!notSure) setSqFt("");
          }}
          className="text-sm text-left underline w-fit"
          style={{ color: "var(--color-text-muted)" }}
        >
          {notSure
            ? "Enter size instead"
            : "Not sure — use a standard yard size"}
        </button>
        {notSure && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            We&apos;ll use a standard yard size.
          </p>
        )}
      </div>

      {/* Pets */}
      <div className="flex flex-col gap-2">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          Do you have pets or animals that use the lawn?
        </p>
        <div className="flex gap-3">
          {(["Yes", "No"] as const).map((opt) => {
            const val = opt === "Yes";
            const selected = hasPets === val;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setHasPets(val)}
                className="flex-1 py-3 rounded-lg font-medium text-sm border transition-all"
                style={{
                  backgroundColor: selected
                    ? "var(--color-primary)"
                    : "var(--color-surface)",
                  color: selected
                    ? "var(--color-background)"
                    : "var(--color-text-primary)",
                  borderColor: selected
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sun exposure */}
      <div className="flex flex-col gap-2">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          How much sun does your lawn get?
        </p>
        <div className="flex flex-col gap-2">
          {SUN_OPTIONS.map((opt) => {
            const selected = sunExposure === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSunExposure(opt.value)}
                className="w-full px-4 py-3 rounded-lg text-left border transition-all"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                  borderWidth: selected ? "2px" : "1px",
                }}
              >
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {opt.label}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full py-3 rounded-lg font-semibold text-sm disabled:opacity-40"
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
