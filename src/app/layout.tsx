import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LawnGuide",
  description: "Your personalized lawn care planner",
};

async function NavAuth() {
  const { userId } = await auth();
  return userId ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button
        className="text-sm px-4 py-2 rounded-md font-medium"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
        }}
      >
        Sign In
      </button>
    </SignInButton>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <nav
            style={{ backgroundColor: "var(--color-surface)" }}
            className="w-full px-6 py-4 flex items-center justify-between border-b border-[#2d4a2d]"
          >
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--color-primary)" }}
            >
              LawnGuide
            </span>
            <NavAuth />
          </nav>
          <main className="flex-1 flex flex-col">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
