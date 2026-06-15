import Link from "next/link";

const FEATURES = [
  {
    icon: "🌿",
    title: "Zone-aware",
    description:
      "Plans calibrated to your USDA growing zone and local university extension research.",
  },
  {
    icon: "🌱",
    title: "Grass-specific",
    description:
      "From Bermuda to Tall Fescue, care schedules matched to your exact grass type.",
  },
  {
    icon: "🐾",
    title: "Pet-friendly flags",
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
      Get my free lawn plan →
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
          The lawn plan built for your yard, your grass, and your zone.
        </h1>
        <p
          className="text-lg max-w-md"
          style={{ color: "var(--color-text-muted)" }}
        >
          Answer a few questions and get a science-backed care calendar — free,
          no account required.
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
                key={f.title}
                className="flex flex-col gap-3 p-6 rounded-xl border"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "#2d4a2d",
                }}
              >
                <span className="text-3xl">{f.icon}</span>
                <p
                  className="font-semibold text-base"
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
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
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
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <h2
          className="text-2xl font-bold text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          Ready to get started?
        </h2>
        <CtaButton />
      </section>
    </main>
  );
}
