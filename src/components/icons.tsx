export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Roof */}
      <polyline points="2,9 10,2 18,9" />
      {/* Walls */}
      <rect x="4" y="9" width="12" height="9" rx="1" />
      {/* Door */}
      <rect x="7.5" y="13" width="5" height="5" rx="0.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer box */}
      <rect x="2" y="4" width="16" height="14" rx="2" />
      {/* Top bar */}
      <line x1="2" y1="8" x2="18" y2="8" />
      {/* Tick marks */}
      <line x1="7" y1="2" x2="7" y2="6" />
      <line x1="13" y1="2" x2="13" y2="6" />
    </svg>
  );
}

export function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head */}
      <circle cx="10" cy="7" r="3.5" />
      {/* Shoulders arc */}
      <path d="M2,18 C2,13 18,13 18,18" />
    </svg>
  );
}
