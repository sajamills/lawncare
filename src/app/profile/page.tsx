"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { grassTypes } from "@/data/grass-types";
import { saveProfile, deleteCachedPlan } from "@/actions/profile";

type SunExposure = "full-sun" | "partial-shade" | "full-shade";

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lawn_session_id");
}

function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [warn, setWarn] = useState(false);
  const [touchedZip, setTouchedZip] = useState(false);
  const [touchedGrass, setTouchedGrass] = useState(false);

  const [zipCode, setZipCode] = useState("");
  const [state, setState] = useState("");
  const [usdaZone, setUsdaZone] = useState("");
  const [grassType, setGrassType] = useState("");
  const [originalGrassType, setOriginalGrassType] = useState("");
  const [originalZip, setOriginalZip] = useState("");
  const [originalState, setOriginalState] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sqFt, setSqFt] = useState<string>("");
  const [hasPets, setHasPets] = useState(false);
  const [sunExposure, setSunExposure] = useState<SunExposure>("full-sun");

  const canSave = isValidZip(zipCode) && grassType !== "";

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) {
      setLoading(false);
      return;
    }

    import("@/actions/profile").then(({ getProfile }) => {
      getProfile(sessionId).then((profile) => {
        if (profile) {
          setZipCode(profile.zip_code);
          setState(profile.state);
          setUsdaZone(profile.usda_zone);
          setGrassType(profile.grass_type);
          setOriginalGrassType(profile.grass_type);
          setOriginalZip(profile.zip_code);
          setOriginalState(profile.state);
          setSqFt(profile.square_footage?.toString() ?? "");
          setHasPets(profile.has_pets);
          setSunExposure((profile.sun_exposure as SunExposure) ?? "full-sun");
        }
        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    setWarn(grassType !== originalGrassType || zipCode !== originalZip);
  }, [grassType, zipCode, originalGrassType, originalZip]);

  const handleSave = async () => {
    const sessionId = getSessionId();
    if (!sessionId || !canSave) return;

    setSaving(true);
    try {
      const result = await saveProfile({
        session_id: sessionId,
        zip_code: zipCode,
        state,
        usda_zone: usdaZone,
        grass_type: grassType,
        square_footage: sqFt ? parseInt(sqFt, 10) : null,
        has_pets: hasPets,
        sun_exposure: sunExposure,
      });

      if (result.success) {
        // Invalidate stale cached plan if grass type or location changed
        if (warn) {
          await deleteCachedPlan(originalState || state, originalGrassType || grassType);
        }

        // Sync updated values to sessionStorage so dashboard picks them up
        try {
          const current = JSON.parse(sessionStorage.getItem("onboarding_state") ?? "{}") as Record<string, unknown>;
          sessionStorage.setItem("onboarding_state", JSON.stringify({
            ...current,
            state,
            grass_type: grassType,
            square_footage: sqFt ? parseInt(sqFt, 10) : null,
            has_pets: hasPets,
            sun_exposure: sunExposure,
          }));
        } catch { /* ignore */ }

        setOriginalGrassType(grassType);
        setOriginalZip(zipCode);
        setOriginalState(state);
        setSaveSuccess(true);
        setToast("Profile updated");
        setTimeout(() => setToast(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

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

  const SUN_OPTIONS: { value: SunExposure; label: string; desc: string }[] = [
    { value: "full-sun", label: "Full Sun", desc: "6+ hours direct sun" },
    { value: "partial-shade", label: "Partial Shade", desc: "3–6 hours" },
    { value: "full-shade", label: "Full Shade", desc: "Under 3 hours" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto w-full">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Edit Your Profile
      </h1>

      {warn && (
        <div
          className="rounded-lg px-4 py-3 text-sm border"
          style={{
            backgroundColor: "var(--color-warning-bg)",
            borderColor: "var(--color-warning-border)",
            color: "var(--color-warning-text)",
          }}
        >
          ⚠️ Changing your grass type or ZIP code will regenerate your plan.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* ZIP */}
        <div className="flex flex-col gap-1">
          <label
            className="text-base font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            ZIP Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={zipCode}
            onChange={(e) =>
              setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            onBlur={() => setTouchedZip(true)}
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              borderColor: touchedZip && !isValidZip(zipCode) ? "var(--color-urgent)" : "var(--color-border)",
            }}
          />
          {touchedZip && !isValidZip(zipCode) && (
            <p className="text-xs mt-1" style={{ color: "var(--color-urgent)" }}>
              Enter a valid 5-digit ZIP code
            </p>
          )}
        </div>

        {/* Grass type */}
        <div className="flex flex-col gap-1">
          <label
            className="text-base font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Grass Type
          </label>
          <select
            value={grassType}
            onChange={(e) => { setGrassType(e.target.value); setTouchedGrass(true); }}
            onBlur={() => setTouchedGrass(true)}
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              borderColor: touchedGrass && grassType === "" ? "var(--color-urgent)" : "var(--color-border)",
            }}
          >
            <option value="">Select grass type</option>
            {grassTypes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {touchedGrass && grassType === "" && (
            <p className="text-xs mt-1" style={{ color: "var(--color-urgent)" }}>
              Select a grass type
            </p>
          )}
        </div>

        {/* Square footage */}
        <div className="flex flex-col gap-1">
          <label
            className="text-base font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Lawn Size (sq ft)
          </label>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Used to calculate product quantities. Optional.
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 5,000"
            value={sqFt}
            onChange={(e) => setSqFt(e.target.value.replace(/\D/g, ""))}
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              borderColor: sqFt !== "" && parseInt(sqFt, 10) < 100 ? "var(--color-urgent)" : "var(--color-border)",
            }}
          />
          {sqFt !== "" && parseInt(sqFt, 10) < 100 && (
            <p className="text-xs mt-1" style={{ color: "var(--color-urgent)" }}>
              Enter a lawn size of at least 100 sq ft
            </p>
          )}
        </div>

        {/* Pets */}
        <div className="flex flex-col gap-1">
          <p
            className="text-base font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Pets on the lawn?
          </p>
          <div className="flex gap-3">
            {(["Yes", "No"] as const).map((opt) => {
              const val = opt === "Yes";
              const selected = hasPets === val;
              return (
                <button
                  key={opt}
                  onClick={() => setHasPets(val)}
                  className="flex-1 py-2 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: selected
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                    color: selected
                      ? "var(--color-background)"
                      : "var(--color-text-primary)",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sun */}
        <div className="flex flex-col gap-1">
          <p
            className="text-base font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Sun Exposure
          </p>
          <div className="flex gap-2">
            {SUN_OPTIONS.map((opt) => {
              const selected = sunExposure === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSunExposure(opt.value)}
                  className="flex-1 py-3 rounded-lg flex flex-col items-center gap-0.5"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: selected
                      ? "var(--color-primary)"
                      : "var(--color-text-primary)",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                  }}
                >
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span
                    className="text-xs mt-0.5"
                    style={{
                      color: selected ? "var(--color-background)" : "var(--color-text-muted)",
                    }}
                  >
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !canSave}
        className="w-full py-3 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
        }}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>

      {saveSuccess && (
        <Link
          href="/dashboard"
          className="w-full py-3 rounded-lg font-semibold text-sm border text-center block"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
            backgroundColor: "transparent",
          }}
        >
          Go to dashboard →
        </Link>
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
