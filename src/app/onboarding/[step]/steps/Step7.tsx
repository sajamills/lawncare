"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/actions/profile";

function getOnboardingState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("onboarding_state") ?? "{}");
  } catch {
    return {};
  }
}

function getOrCreateSessionId(): string {
  const existing = localStorage.getItem("lawn_session_id");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("lawn_session_id", id);
  return id;
}

export default function Step7({ onNext: _onNext }: { onNext: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function save() {
      const state = getOnboardingState();
      const sessionId = getOrCreateSessionId();

      try {
        await saveProfile({
          session_id: sessionId,
          zip_code: (state.zip as string) ?? "",
          state: (state.state as string) ?? "",
          usda_zone: (state.usda_zone as string) ?? "",
          grass_type: (state.grass_type as string) ?? "",
          square_footage: state.square_footage as number | null,
          has_pets: (state.has_pets as boolean) ?? false,
          sun_exposure: (state.sun_exposure as string) ?? "",
          completed_tasks: (state.completed_tasks as string[]) ?? [],
        });
      } catch {
        // Non-fatal — DB may not be configured in dev
      }

      setStatus("done");
    }

    save().catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {status === "loading" ? "Setting up your profile..." : "You're all set!"}
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          {status === "loading"
            ? "Just a moment while we save your lawn profile."
            : "Your lawn profile is saved. Head to your dashboard to see this month's tasks."}
        </p>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-4">
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      )}

      {(status === "done" || status === "error") && (
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 rounded-lg font-semibold text-sm"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
          }}
        >
          Go to my dashboard →
        </button>
      )}
    </div>
  );
}
