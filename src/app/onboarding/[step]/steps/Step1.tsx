"use client";

import { useState } from "react";

interface ZoneResult {
  zip: string;
  state: string;
  stateName: string;
  zone: string;
}

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

export default function Step1({ onNext }: { onNext: () => void }) {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zone, setZone] = useState<ZoneResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length !== 5) return;

    setLoading(true);
    setError("");
    setZone(null);

    try {
      const res = await fetch(`/api/zone?zip=${zip}`);
      const data = await res.json();

      if (!res.ok) {
        setError(
          "We couldn't find a zone for that ZIP. Please check and try again."
        );
      } else {
        setZone(data as ZoneResult);
      }
    } catch {
      setError(
        "We couldn't find a zone for that ZIP. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!zone) return;
    setOnboardingState({
      zip: zone.zip,
      state: zone.state,
      stateName: zone.stateName,
      usda_zone: zone.zone,
    });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Where is your lawn?
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Enter your ZIP code to find your growing zone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{5}"
          maxLength={5}
          value={zip}
          onChange={(e) => {
            setZip(e.target.value.replace(/\D/g, "").slice(0, 5));
            setZone(null);
            setError("");
          }}
          placeholder="e.g. 27513"
          className="w-full px-4 py-3 rounded-lg text-lg outline-none border"
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            borderColor: error ? "var(--color-urgent)" : "var(--color-border)",
          }}
        />

        <button
          type="submit"
          disabled={zip.length !== 5 || loading}
          className="w-full py-3 rounded-lg font-semibold text-sm disabled:opacity-40"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          {loading ? "Looking up zone..." : "Find my zone"}
        </button>
      </form>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-urgent)" }}>
          {error}
        </p>
      )}

      {zone && (
        <div className="flex flex-col gap-4">
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Zone {zone.zone} — {zone.stateName}
          </p>
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
      )}
    </div>
  );
}
