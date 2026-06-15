"use client";

import { usePathname } from "next/navigation";

const TOTAL_STEPS = 5;

function getStep(pathname: string): number {
  const match = pathname.match(/\/onboarding\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = getStep(pathname);

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        {currentStep > 0 && (
          <div className="flex gap-2 mb-8">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const step = i + 1;
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              return (
                <div
                  key={step}
                  className="flex-1 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-primary)"
                      : isCompleted
                      ? "#2d5a2d"
                      : "#1a2e1a",
                  }}
                />
              );
            })}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
