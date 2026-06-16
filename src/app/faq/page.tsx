const FAQS = [
  {
    question: "What if I don't know my grass type?",
    answer:
      "No problem — during onboarding you can answer a few quick questions about your lawn (sun exposure, region, mowing habits) and we'll match you to the most likely grass types from a visual guide.",
  },
  {
    question: "What if I don't know my lawn size?",
    answer:
      "Lawn size is optional. It's only used to scale product quantities in your plan, so you can skip it and adjust amounts yourself, or add it later from your profile.",
  },
  {
    question: "What is a USDA growing zone?",
    answer:
      "USDA growing zones divide the country into regions based on average minimum winter temperatures. We use your zone, derived from your ZIP code, to time treatments correctly for your climate.",
  },
  {
    question: "What is pre-emergent herbicide?",
    answer:
      "Pre-emergent herbicide is applied before weed seeds germinate, typically in early spring, to prevent weeds like crabgrass from taking root. Timing depends on your soil temperature and zone.",
  },
  {
    question: "Is the plan free?",
    answer:
      "Yes. Building your personalized lawn care plan is completely free — no credit card required.",
  },
  {
    question: "How is my plan saved?",
    answer:
      "Your plan is saved on this device using browser storage. It will persist as long as you use the same browser and don't clear your data. We recommend bookmarking your dashboard or printing your plan.",
  },
  {
    question: "Is this safe around pets and children?",
    answer:
      "Every product recommendation in your plan notes whether it's safe for pets and children once dry, along with any wait times before the lawn can be used again. Always check the product label for the most current safety guidance.",
  },
  {
    question: "Where does the advice come from?",
    answer:
      "Our recommendations are based on guidance from university extension programs and agricultural research for your specific USDA zone and grass type.",
  },
];

export default function FaqPage() {
  return (
    <main
      className="max-w-2xl mx-auto px-6 py-12"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <h1
        className="text-3xl font-bold mb-8"
        style={{ color: "var(--color-text-primary)" }}
      >
        Frequently Asked Questions
      </h1>
      <div>
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="border-b py-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <summary
              className="cursor-pointer font-semibold text-base"
              style={{ color: "var(--color-text-primary)" }}
            >
              {faq.question}
            </summary>
            <p
              className="text-sm mt-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </main>
  );
}
