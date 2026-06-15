"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/actions/profile";
import { SignUpButton } from "@clerk/nextjs";

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

export default function Step5({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function build() {
      const state = getOnboardingState();
      const sessionId = getOrCreateSessionId();

      // Save profile
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
        });
      } catch {
        // Non-fatal — DB may not be configured in dev
      }

      // Find PDF
      try {
        const pdfRes = await fetch("/api/find-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: state.state,
            grassType: state.grass_type,
          }),
        });

        if (pdfRes.ok) {
          const { pdfUrl } = await pdfRes.json() as { pdfUrl: string };

          // Parse plan
          await fetch("/api/parse-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pdfUrl,
              state: state.state,
              grassType: state.grass_type,
            }),
          });
        }
      } catch {
        // Non-fatal — plan generation is best-effort
      }

      setStatus("done");
    }

    build().catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {status === "loading"
            ? "Your plan is being built..."
            : "Your plan is ready!"}
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          {status === "loading"
            ? "We're finding your local university extension guide and building your personalized plan"
            : "Save your plan across devices by creating a free account."}
        </p>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {status === "done" && (
        <div className="flex flex-col gap-3">
          <SignUpButton mode="modal">
            <button
              className="w-full py-3 rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              Create a free account
            </button>
          </SignUpButton>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-lg font-medium text-sm border"
            style={{
              borderColor: "#2d4a2d",
              color: "var(--color-text-muted)",
            }}
          >
            Continue without account
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {errorMsg || "Something went wrong. Your profile may not be saved."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-lg font-semibold text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            Continue to dashboard anyway
          </button>
        </div>
      )}
    </div>
  );
}
