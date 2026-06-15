"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export { metadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "📅" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNav = pathname === "/" || pathname.startsWith("/onboarding");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav
          style={{ backgroundColor: "var(--color-surface)" }}
          className="w-full px-6 py-4 flex items-center justify-between border-b border-[#2d4a2d]"
        >
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--color-primary)" }}
          >
            LawnGuide
          </Link>

          {/* Desktop nav links */}
          {!hideNav && (
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {item.icon} {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <main className={`flex-1 flex flex-col${!hideNav ? " pb-16 md:pb-0" : ""}`}>
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        {!hideNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 flex md:hidden border-t z-50"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "#2d4a2d",
              height: "56px",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                  }}
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className="text-[10px] leading-none">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </body>
    </html>
  );
}
