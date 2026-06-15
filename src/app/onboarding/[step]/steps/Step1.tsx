export default function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Where is your lawn?
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>Step 1 — ZIP code entry</p>
    </div>
  );
}
