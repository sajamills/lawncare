"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5];

export default function OnboardingStep() {
  const params = useParams();
  const router = useRouter();
  const stepNum = parseInt(params.step as string, 10);

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
    notFound();
  }

  const StepComponent = STEP_COMPONENTS[stepNum - 1];

  const handleNext = () => {
    if (stepNum < 5) {
      router.push(`/onboarding/${stepNum + 1}`);
    }
  };

  const handleBack = () => {
    if (stepNum > 1) {
      router.push(`/onboarding/${stepNum - 1}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <StepComponent onNext={handleNext} />
      {stepNum > 1 && (
        <button
          onClick={handleBack}
          className="text-sm underline"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← Back
        </button>
      )}
    </div>
  );
}
