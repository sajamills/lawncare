export default function Step4({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Does your grass look like this?
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>Step 4 — Grass confirmation</p>
    </div>
  );
}
