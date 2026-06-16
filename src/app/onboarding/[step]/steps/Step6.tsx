"use client";

import { useEffect, useState } from "react";
import { extensionSources, knownPdfUrls } from "@/data/extension-sources";

interface Resource {
  universityName: string;
  url: string;
  label: string;
  isPdf: boolean;
}

function getOnboardingState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("onboarding_state") ?? "{}");
  } catch {
    return {};
  }
}

export default function Step6({ onNext }: { onNext: () => void }) {
  const [resource, setResource] = useState<Resource | null>(null);

  useEffect(() => {
    const state = getOnboardingState();
    const stateCode = (state.state as string | undefined)?.toUpperCase() ?? "";
    const grassType = (state.grass_type as string | undefined) ?? "";

    const source = extensionSources[stateCode];
    if (!source) return;

    const key = `${stateCode}_${grassType}`;
    const knownUrl = knownPdfUrls[key];

    if (knownUrl) {
      setResource({
        universityName: source.universityName,
        url: knownUrl,
        label: "Lawn Care Guide",
        isPdf: knownUrl.endsWith(".pdf"),
      });
    } else {
      const query = encodeURIComponent(`${grassType} lawn care maintenance`);
      setResource({
        universityName: source.universityName,
        url: `${source.searchUrl}${query}`,
        label: "Search Extension Library",
        isPdf: false,
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your lawn care resources
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Official guides from your state&apos;s university extension service.
        </p>
      </div>

      {resource ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 px-4 py-4 rounded-lg border transition-all hover:border-current"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            textDecoration: "none",
          }}
        >
          <span className="text-2xl mt-0.5">{resource.isPdf ? "📄" : "🔍"}</span>
          <div className="flex flex-col gap-0.5">
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              {resource.universityName}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {resource.label} ↗
            </p>
          </div>
        </a>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          No resources found for your state.
        </p>
      )}

      <button
        onClick={onNext}
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
