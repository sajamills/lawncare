export default function Step3({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Identify your grass
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>Step 3 — Grass quiz</p>
    </div>
  );
}
