"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { quizQuestions } from "@/data/quiz-questions";
import { scoreGrassTypes } from "@/lib/grass-scorer";

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

export default function Step3({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = quizQuestions[currentIndex];
  const total = quizQuestions.length;

  const handleAnswer = (trait: string, traitValue: string) => {
    const newAnswers = { ...answers, [trait]: traitValue };
    setAnswers(newAnswers);

    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz complete
      const scored = scoreGrassTypes(newAnswers);
      setOnboardingState({
        quiz_answers: newAnswers,
        grass_scores: scored.slice(0, 5).map((s) => ({
          id: s.grassType.id,
          name: s.grassType.name,
          score: s.score,
          matchCount: s.matchCount,
        })),
      });
      onNext();
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/4");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Identify your grass
        </h1>
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Question {currentIndex + 1} of {total}
        </span>
      </div>

      <p
        className="text-base font-medium"
        style={{ color: "var(--color-text-primary)" }}
      >
        {question.question}
      </p>

      <div className="flex flex-col gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleAnswer(opt.trait, opt.traitValue)}
            className="w-full px-4 py-4 rounded-lg text-left border transition-all active:scale-95"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSkip}
        className="text-sm underline text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        Skip quiz — I know my grass type
      </button>
    </div>
  );
}
