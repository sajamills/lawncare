export default function Step5({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Your plan is being built...
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>Step 5 — Plan generation</p>
    </div>
  );
}
