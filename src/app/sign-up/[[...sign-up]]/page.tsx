import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
      <p
        className="text-2xl font-bold mb-8"
        style={{ color: "var(--color-primary)" }}
      >
        LawnGuide
      </p>
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
