export default function Step2({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Tell us about your yard
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>Step 2 — Yard profile</p>
    </div>
  );
}
