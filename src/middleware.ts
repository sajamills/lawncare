import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/faq",
  "/manifest.json",
  "/api/find-pdf(.*)",
  "/api/parse-pdf(.*)",
  "/api/zone(.*)",
  "/onboarding(.*)",
]);

// Test-only bypass for Playwright E2E runs against protected routes (e.g. /dashboard/*).
// Only takes effect outside production and requires an explicit opt-in env var set by
// playwright.config.ts's webServer — never enabled in normal dev or prod usage.
const bypassAuthForE2E =
  process.env.NODE_ENV !== "production" && process.env.PLAYWRIGHT_TEST_BYPASS_AUTH === "1";

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !bypassAuthForE2E) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
