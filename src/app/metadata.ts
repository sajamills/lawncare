import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://lawncare-azure.vercel.app";

const title = "LawnGuide — Free Personalized Lawn Care Plan";
const description =
  "Answer a few questions and get a step-by-step lawn care plan based on your grass type, location, and university extension guidance.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LawnGuide lawn care plan preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};
