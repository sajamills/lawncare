import Link from "next/link";

const FEATURES = [
  {
    icon: "🌿",
    chip: "Zone-aware",
    title: "Calibrated to your growing zone and local university research",
    description:
      "Plans calibrated to your USDA growing zone and based on university extension guidance for your region.",
  },
  {
    icon: "🌱",
    chip: "Grass-specific",
    title: "Matched to your exact grass type and blade width",
    description:
      "From Bermuda to Tall Fescue, care schedules matched to your exact grass type.",
  },
  {
    icon: "🐾",
    chip: "Pet-safe",
    title: "Flags every product recommendation near your pets",
    description:
      "Every recommendation notes whether it's safe for dogs and cats on the lawn.",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Enter your ZIP code",
    description:
      "We detect your USDA zone and your state's extension resources.",
  },
  {
    step: 2,
    title: "Tell us about your lawn",
    description:
      "Grass type, sun exposure, lawn size, and what you've done this year.",
  },
  {
    step: 3,
    title: "Get your plan",
    description:
      "A month-by-month care calendar with official university guide links.",
  },
];

const MOCK_TASKS = [
  {
    priority: "urgent" as const,
    borderColor: "var(--color-urgent)",
    icon: "🐛",
    title: "Apply pre-emergent herbicide",
    description:
      "Apply before soil hits 55°F. Prevents crabgrass germination for the season.",
  },
  {
    priority: "routine" as const,
    borderColor: "var(--color-routine)",
    icon: "🌿",
    title: "Mow at 3.5 inches",
    description:
      "Raise mowing height during heat season. Never remove more than 1/3 of the blade.",
  },
];

function CtaButton() {
  return (
    <Link
      href="/onboarding/1"
      className="inline-block px-8 py-4 rounded-lg font-semibold text-base transition-opacity hover:opacity-90"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-background)",
      }}
    >
      Build my free lawn plan →
    </Link>
  );
}

export default function Home() {
  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 gap-6">
        <p
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-primary)" }}
        >
          LawnGuide
        </p>
        <h1
          className="text-4xl font-bold leading-tight max-w-xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          A lawn-care plan for your grass and your location
        </h1>
        <p
          className="text-lg max-w-md"
          style={{ color: "var(--color-text-muted)" }}
        >
          Answer a few questions and see what to do this week, what is coming
          next, and the university guidance behind every recommendation.
        </p>
        <div className="flex flex-col items-center gap-2">
          <CtaButton />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Takes 2 minutes. No credit card.
          </p>
        </div>
      </section>

      {/* Features */}
      <section
        className="px-6 py-16"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Why LawnGuide?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.chip}
                className="flex flex-col rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                }}
              >
                {/* Accent bar */}
                <div
                  style={{
                    height: 4,
                    backgroundColor: "var(--color-primary)",
                  }}
                />
                <div className="flex flex-col gap-3 p-6">
                  <span className="text-3xl">{f.icon}</span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full self-start"
                    style={{
                      backgroundColor: "var(--color-surface-alt)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {f.chip}
                  </span>
                  <p
                    className="font-semibold text-base leading-snug"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {f.title}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="px-6 py-16" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Your personalized weekly plan
          </h2>
          <div className="flex flex-col gap-3">
            {MOCK_TASKS.map((task) => (
              <div
                key={task.title}
                className="rounded-lg p-4 border flex flex-col gap-2"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  borderLeftColor: task.borderColor,
                  borderLeftWidth: "4px",
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{task.icon}</span>
                  <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {task.title}
                  </p>
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {task.description}
                </p>
              </div>
            ))}
          </div>
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            Your plan includes 52 weeks of tasks tailored to your grass type and climate.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            How it works
          </h2>
          <ol className="flex flex-col gap-6">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="flex gap-4 items-start">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  }}
                >
                  {item.step}
                </span>
                <div className="flex flex-col gap-1">
                  <p
                    className="font-semibold text-base"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="px-6 py-16 flex flex-col items-center gap-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <h2
          className="text-2xl font-bold text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your plan is free and ready in 2 minutes.
        </h2>
        <CtaButton />
      </section>
    </main>
  );
}
