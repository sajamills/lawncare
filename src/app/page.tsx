import Link from "next/link";

const HERO_IMAGE =
  "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1800";

const OUTCOMES = [
  "What to do this week",
  "What is coming next",
  "How much to apply",
  "Which source informed it",
];

const PLAN_STATS = [
  { value: "211", label: "seeded state and grass plans" },
  { value: "52", label: "weeks in each care calendar" },
  { value: "$0", label: "live AI cost for normal use" },
];

const SAMPLE_TASKS = [
  {
    label: "Due this week",
    tone: "urgent",
    title: "Apply spring pre-emergent",
    body:
      "Use a labeled product before summer annual weeds germinate. Water it in according to the label.",
    note: "Pet note: keep pets off treated turf until dry or until the label says it is safe.",
  },
  {
    label: "Routine",
    tone: "routine",
    title: "Mow at active-growth height",
    body:
      "Mow often enough that you remove no more than one-third of the grass blade at a time.",
    note: "Quantity: based on lawn size when product rates apply.",
  },
  {
    label: "Upcoming",
    tone: "upcoming",
    title: "Check irrigation depth",
    body:
      "Measure sprinkler output and adjust watering so the root zone is soaked, then allowed to dry.",
    note: "Timing is estimated from your state, grass type, and season.",
  },
];

const SOURCE_EXAMPLES = [
  "University of Arkansas",
  "University of Georgia Turf",
  "NC State Extension",
  "University of Florida IFAS",
  "Penn State Extension",
  "Texas A&M AgriLife",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us where the lawn is",
    description:
      "ZIP code gives the app your state and climate timing without asking for a street address.",
  },
  {
    step: "02",
    title: "Pick or identify your grass",
    description:
      "Choose from common turf types or use the short visual quiz when you are not sure.",
  },
  {
    step: "03",
    title: "Get a cached weekly plan",
    description:
      "The dashboard reads a prebuilt plan, so normal visitors are not waiting on paid live AI.",
  },
];

function CtaButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const isPrimary = variant === "primary";
  return (
    <Link
      href="/onboarding/1"
      className="inline-flex min-h-12 items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: isPrimary ? "#f5c542" : "rgba(255,255,255,0.08)",
        color: isPrimary ? "#16210f" : "#f8faf5",
        border: isPrimary ? "1px solid #f5c542" : "1px solid rgba(255,255,255,0.32)",
        outlineColor: "#f5c542",
      }}
    >
      Build my free lawn plan
    </Link>
  );
}

function TaskTone({ tone }: { tone: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    urgent: { bg: "#fde7e7", color: "#9f1d1d", border: "#ef4444" },
    routine: { bg: "#fff3c4", color: "#765200", border: "#eab308" },
    upcoming: { bg: "#dbeafe", color: "#1e3a8a", border: "#3b82f6" },
  };
  const style = styles[tone] ?? styles.upcoming;
  return (
    <span
      className="w-fit rounded-sm border px-2 py-1 text-xs font-bold uppercase"
      style={{ backgroundColor: style.bg, color: style.color, borderColor: style.border }}
    >
      {tone === "urgent" ? "Due this week" : tone === "routine" ? "Routine" : "Upcoming"}
    </span>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "#f6f2e8", color: "#172312" }}>
      <section
        className="relative flex min-h-[calc(100svh-8rem)] flex-col justify-end overflow-hidden px-5 pb-12 pt-10 sm:px-8 lg:min-h-[700px] lg:px-12"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(7,17,8,0.88) 0%, rgba(7,17,8,0.70) 42%, rgba(7,17,8,0.20) 100%), url(${HERO_IMAGE})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:items-end">
          <div className="flex max-w-3xl flex-col gap-6">
            <p className="w-fit rounded-sm px-3 py-1 text-sm font-bold uppercase tracking-wide" style={{ backgroundColor: "#f5c542", color: "#16210f" }}>
              Free extension-backed lawn calendar
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl" style={{ color: "#f8faf5" }}>
              Know what your lawn needs this week, not someday.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: "#d8ead0" }}>
              Answer a few plain-English questions and get a weekly plan for your grass, your state, your pets, and your lawn size.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaButton />
              <Link
                href="#sample-plan"
                className="inline-flex min-h-12 items-center justify-center rounded-md border px-6 py-3 text-base font-semibold"
                style={{ borderColor: "rgba(255,255,255,0.38)", color: "#f8faf5", backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                See a sample task
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {OUTCOMES.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#f8faf5" }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f5c542" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className="hidden rounded-md border p-4 shadow-2xl lg:block"
            style={{ backgroundColor: "rgba(248,250,245,0.94)", borderColor: "rgba(255,255,255,0.45)" }}
            aria-label="Sample LawnGuide dashboard preview"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase" style={{ color: "#5c6b55" }}>
                  Right now
                </p>
                <p className="text-xl font-bold" style={{ color: "#172312" }}>
                  Bermudagrass in Arkansas
                </p>
              </div>
              <span className="rounded-sm px-2 py-1 text-xs font-bold" style={{ backgroundColor: "#dcebd6", color: "#1f5c25" }}>
                Week 12
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {SAMPLE_TASKS.slice(0, 2).map((task) => (
                <article key={task.title} className="rounded-md border p-4" style={{ backgroundColor: "#ffffff", borderColor: "#d6d0bf" }}>
                  <TaskTone tone={task.tone} />
                  <h2 className="mt-3 text-lg font-bold" style={{ color: "#172312" }}>
                    {task.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "#4a5545" }}>
                    {task.body}
                  </p>
                  <p className="mt-3 rounded-sm px-3 py-2 text-sm" style={{ backgroundColor: "#f8f3de", color: "#564300" }}>
                    {task.note}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12" style={{ backgroundColor: "#172312", color: "#f8faf5" }}>
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {PLAN_STATS.map((stat) => (
            <div key={stat.label} className="border-l-4 py-2 pl-4" style={{ borderColor: "#f5c542" }}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm" style={{ color: "#cdddc6" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="sample-plan" className="px-5 py-16 sm:px-8 lg:px-12" style={{ backgroundColor: "#f6f2e8" }}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#7b4e12" }}>
              What the dashboard shows
            </p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              A useful next action, even when nothing urgent is due.
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#4d5948" }}>
              The plan is not a blank calendar. It separates urgent seasonal work from routine care and upcoming tasks, then keeps the next step visible.
            </p>
            <CtaButton />
          </div>
          <div className="grid gap-3">
            {SAMPLE_TASKS.map((task) => (
              <article key={task.title} className="rounded-md border p-4" style={{ backgroundColor: "#ffffff", borderColor: "#d8d1bf" }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <TaskTone tone={task.tone} />
                    <h3 className="mt-3 text-xl font-bold">{task.title}</h3>
                  </div>
                  <span
                    className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold"
                    style={{ borderColor: "#bdc7b5", color: "#284223", backgroundColor: "#f8faf5" }}
                  >
                    Mark done
                  </span>
                </div>
                <p className="mt-3 leading-relaxed" style={{ color: "#4d5948" }}>
                  {task.body}
                </p>
                <p className="mt-3 rounded-sm px-3 py-2 text-sm" style={{ backgroundColor: "#edf5e9", color: "#284223" }}>
                  {task.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#7b4e12" }}>
              Built for trust
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              University extension guidance, cached for a fast free demo.
            </h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "#4d5948" }}>
              Common state and grass combinations are prebuilt from extension calendars and regional turf guidance, so normal dashboard use does not need a live model call.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SOURCE_EXAMPLES.map((source) => (
              <div key={source} className="rounded-md border p-4" style={{ borderColor: "#d8d1bf", backgroundColor: "#faf8f1" }}>
                <p className="text-sm font-bold" style={{ color: "#172312" }}>
                  {source}
                </p>
                <p className="mt-1 text-sm" style={{ color: "#5d6758" }}>
                  Used as a source for regional timing and lawn-care practices.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12" style={{ backgroundColor: "#172312", color: "#f8faf5" }}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#f5c542" }}>
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Three steps from Facebook click to lawn plan.
            </h2>
          </div>
          <ol className="grid gap-4">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="grid gap-3 rounded-md border p-5 sm:grid-cols-[4rem_1fr]" style={{ borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-2xl font-bold" style={{ color: "#f5c542" }}>
                  {item.step}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-1" style={{ color: "#cdddc6" }}>
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:px-8 lg:px-12" style={{ backgroundColor: "#f6f2e8" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Build a plan that actually has something to do next.
          </h2>
          <p className="text-lg" style={{ color: "#4d5948" }}>
            Free to use, no credit card, and designed to work without a paid live AI call for common lawn profiles.
          </p>
          <CtaButton />
        </div>
      </section>

      <footer className="px-5 py-8 sm:px-8 lg:px-12" style={{ backgroundColor: "#111a0d", color: "#d8ead0" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">LawnGuide - free lawn planning based on extension guidance.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/faq" className="text-sm font-semibold underline">
              FAQ
            </Link>
            <Link href="/onboarding/1" className="text-sm font-semibold underline">
              Build a plan
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
