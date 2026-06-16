"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, ProfileIcon } from "@/components/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/dashboard/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

export default function ClientNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/" || pathname.startsWith("/onboarding");

  return (
    <>
      <nav
        style={{ backgroundColor: "var(--color-surface)" }}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)]"
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--color-primary)" }}
        >
          LawnGuide
        </Link>

        {!hideNav && (
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                    fontWeight: isActive ? "600" : "400",
                    borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                    paddingBottom: "2px",
                  }}
                >
                  <item.Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <main className={`flex-1 flex flex-col${!hideNav ? " pb-16 md:pb-0" : ""}`}>
        {children}
      </main>

      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 flex md:hidden border-t z-50"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            height: "56px",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                }}
              >
                {/* Active pill indicator */}
                <span
                  style={{
                    width: 24,
                    height: 3,
                    borderRadius: 99,
                    backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                    marginBottom: 2,
                    display: "block",
                  }}
                />
                <item.Icon className="w-6 h-6" />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
