import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientNav from "./ClientNav";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "LawnGuide",
  description: "Your personalized lawn care planner",
  manifest: "/manifest.json",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
          <ClientNav>{children}</ClientNav>
        </body>
      </html>
    </ClerkProvider>
  );
}
