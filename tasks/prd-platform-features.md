# PRD: Platform Features — Auth, Stripe, Photo Diagnosis, Maps Estimator, Multi-Lawn

## Introduction

Evolve LawnGuide from a sessionStorage-based prototype into a full SaaS platform. This sprint adds:

1. **Auth via Clerk** — real accounts, persistent login, protected routes
2. **Stripe subscriptions** — free tier + Pro ($4.99/mo) unlocking premium features
3. **Photo grass diagnosis** — upload a lawn photo; Claude Vision identifies grass type, health issues, and recommendations
4. **Google Maps yard estimator** — draw a polygon over a satellite view of your property to auto-calculate square footage
5. **Multi-lawn + household accounts** — multiple named lawns per user, shareable household invite links

Stories are ordered by dependency: schema → backend → UI. Each story is sized to complete in one Ralph iteration. After each story, deploy to Vercel and audit in production before continuing.

---

## Goals

- Users can create real accounts (email/password or social via Clerk) and return to their saved data
- A Pro subscription unlocks photo diagnosis and the maps estimator
- Photo upload + Claude Vision diagnosis returns grass type, health score, issues, and recommendations in under 10s
- Google Maps polygon tool lets users estimate yard sq ft without manually measuring
- Users can manage multiple lawns (front yard, back yard, rental) and invite household members
- All profile data persists server-side, surviving browser clears and device switches

---

## User Stories

### US-055: Install Clerk and configure environment variables
**Description:** As a developer, I need Clerk installed and configured so authentication can be added to the app.

**Acceptance Criteria:**
- [ ] Install `@clerk/nextjs` package
- [ ] Add env vars to `.env.local` (use placeholder values): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/1`
- [ ] Add `<ClerkProvider>` wrapping `{children}` in `src/app/layout.tsx` (import from `@clerk/nextjs`)
- [ ] `env.local.example` updated with the new Clerk key names (no values)
- [ ] Typecheck passes
- [ ] Deploy to Vercel and confirm build succeeds (Clerk keys must also be set in Vercel environment variables)

### US-056: Replace middleware passthrough with Clerk auth middleware
**Description:** As a developer, I need the middleware to enforce authentication on protected routes.

**Acceptance Criteria:**
- [ ] Replace `src/middleware.ts` content: import `clerkMiddleware` and `createRouteMatcher` from `@clerk/nextjs/server`
- [ ] Public routes (no auth required): `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/zone(.*)`, `/onboarding(.*)`
- [ ] All other routes (including `/dashboard`, `/profile`, `/diagnose`, `/estimate`) require auth
- [ ] Unauthenticated access to `/dashboard` redirects to `/sign-in`
- [ ] `matcher` config in middleware exports: `['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)','/(api|trpc)(.*)']`
- [ ] Typecheck passes
- [ ] Deploy to Vercel; verify `/dashboard` redirects to `/sign-in` when logged out

### US-057: Add users table linked to Clerk user_id
**Description:** As a developer, I need a users table so we can store subscription status and profile data server-side linked to real accounts.

**Acceptance Criteria:**
- [ ] Run migration: `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, clerk_user_id TEXT UNIQUE NOT NULL, email TEXT, subscription_status TEXT NOT NULL DEFAULT 'free', stripe_customer_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`
- [ ] Create `src/lib/user.ts` with `getOrCreateUser(clerkUserId: string, email: string)` server function — upserts into users table, returns user row
- [ ] Typecheck passes

### US-058: Create sign-in and sign-up pages with Clerk components
**Description:** As a user, I want dedicated sign-in and sign-up pages that match the app's dark theme.

**Acceptance Criteria:**
- [ ] Create `src/app/sign-in/[[...sign-in]]/page.tsx` — renders `<SignIn />` from `@clerk/nextjs` centered on page with dark background (`var(--color-background)`)
- [ ] Create `src/app/sign-up/[[...sign-up]]/page.tsx` — renders `<SignUp />` from `@clerk/nextjs` centered on page
- [ ] Both pages use the same `<main className="flex items-center justify-center min-h-screen">` wrapper
- [ ] Typecheck passes
- [ ] Deploy to Vercel; visit `/sign-in` and confirm Clerk sign-in widget renders
- [ ] Verify in browser using dev-browser skill

### US-059: Add Sign In / Sign Up buttons to landing page header and ClientNav
**Description:** As a visitor, I want to see sign-in and sign-up options in the navigation so I can access my account.

**Acceptance Criteria:**
- [ ] In `src/app/ClientNav.tsx`, import `SignedIn`, `SignedOut`, `UserButton` from `@clerk/nextjs`
- [ ] Desktop nav: when `SignedOut`, show "Sign In" link (`href="/sign-in"`) and "Sign Up" link (`href="/sign-up"`) with primary button styling on Sign Up
- [ ] Desktop nav: when `SignedIn`, show `<UserButton afterSignOutUrl="/" />` on the right side
- [ ] Mobile bottom tab bar: unchanged (still shows Home/Calendar/Profile tabs for signed-in users); signed-out users on `/` see no bottom tab bar
- [ ] Landing page (`/`) nav still hidden (nav is hidden on `/` and `/onboarding/*`)
- [ ] Add Sign In / Sign Up buttons directly to the landing page hero section when `SignedOut` (below the existing "Get my free lawn plan →" CTA)
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-060: Update profile actions to use Clerk user_id instead of session_id
**Description:** As a developer, I need profile save/load to use the real Clerk user ID so data persists across sessions.

**Acceptance Criteria:**
- [ ] In `src/actions/profile.ts`, import `auth` from `@clerk/nextjs/server`
- [ ] Update `getProfile`: call `auth()` to get `userId`; if no `userId`, return null; query by `clerk_user_id = userId` instead of `session_id`
- [ ] Update `saveProfile`: get `userId` from `auth()`; upsert with `clerk_user_id` as the key
- [ ] The `session_id` parameter is removed from both functions' signatures (it was only needed for the old anonymous flow)
- [ ] Update all callers of `getProfile` and `saveProfile` in `src/app/profile/page.tsx` — remove `getSessionId()` calls, no longer pass `session_id`
- [ ] Typecheck passes
- [ ] Deploy to Vercel; sign in, save profile, sign out, sign back in — verify profile data persisted

### US-061: Migrate onboarding final step to save profile for authenticated users
**Description:** As an authenticated user completing onboarding, I want my profile saved to my account automatically.

**Acceptance Criteria:**
- [ ] In `src/app/onboarding/[step]/steps/Step7.tsx` (the done/confirmation step), after plan generation succeeds, call `saveProfile` with the onboarding state data
- [ ] If user is signed in (`useUser().isSignedIn`), call a new server action `saveOnboardingProfile(data)` that saves to DB using Clerk user_id from `auth()`
- [ ] Create `src/actions/onboarding.ts` with `saveOnboardingProfile(data: { zip_code, state, usda_zone, grass_type, square_footage, has_pets, sun_exposure })` — calls `getOrCreateUser` then upserts into profiles table
- [ ] If user is not signed in, still save to sessionStorage as before (no regression)
- [ ] Typecheck passes
- [ ] Deploy and test: complete onboarding while signed in, then check /profile page shows the saved data

### US-062: Add sign-out button and account info to profile page
**Description:** As a signed-in user, I want to see my account email and sign out from the profile page.

**Acceptance Criteria:**
- [ ] In `src/app/profile/page.tsx`, import `useUser`, `useClerk` from `@clerk/nextjs`
- [ ] At the top of the profile page (above "Edit Your Profile" heading), add an account section: show `user.primaryEmailAddress?.emailAddress` in `text-sm` with `var(--color-text-muted)` color
- [ ] Add a "Sign Out" button below the email — on click calls `clerk.signOut()` then `router.push('/')`
- [ ] Account section is only rendered when `isSignedIn` is true
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

---

### US-063: Add subscription_status to users table
**Description:** As a developer, I need to track whether each user is on the free or pro plan in the database.

**Acceptance Criteria:**
- [ ] Run migration: `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free'`
- [ ] Run migration: `ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`
- [ ] Run migration: `ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`
- [ ] Create `src/lib/subscription.ts` with `getUserSubscription(clerkUserId: string): Promise<'free' | 'pro'>` — queries users table, returns subscription_status
- [ ] Typecheck passes

### US-064: Install Stripe SDK and set up environment variables
**Description:** As a developer, I need Stripe configured so payment flows can be built.

**Acceptance Criteria:**
- [ ] Install `stripe` package (server-side SDK)
- [ ] Add env vars to `.env.local`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` (use placeholder values)
- [ ] Update `env.local.example` with the new key names
- [ ] Create `src/lib/stripe.ts` — exports `stripe` singleton: `import Stripe from 'stripe'; export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)`
- [ ] Typecheck passes
- [ ] Deploy to Vercel (with real Stripe keys set in Vercel env vars for staging/test mode)

### US-065: Create Stripe checkout route — upgrade to Pro
**Description:** As a user, I want to click "Upgrade to Pro" and be taken to a Stripe checkout page.

**Acceptance Criteria:**
- [ ] Create `src/app/api/stripe/checkout/route.ts` — POST handler
- [ ] Handler calls `auth()` from Clerk; returns 401 if not authenticated
- [ ] Calls `getOrCreateUser(userId, email)` to get/create the user row
- [ ] Creates or retrieves Stripe customer: if `stripe_customer_id` exists in DB, use it; else call `stripe.customers.create({ email })` and save the ID back to users table
- [ ] Creates Stripe Checkout session: `mode: 'subscription'`, `line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }]`, `success_url: '/dashboard?upgraded=1'`, `cancel_url: '/profile'`
- [ ] Returns `{ url: session.url }` as JSON
- [ ] Typecheck passes
- [ ] Deploy; test by calling the endpoint from `/profile` (manual test with Stripe test mode card 4242 4242 4242 4242)

### US-066: Create Stripe webhook route — sync subscription status
**Description:** As a developer, I need a webhook handler so the DB stays in sync when Stripe subscription events occur.

**Acceptance Criteria:**
- [ ] Create `src/app/api/stripe/webhook/route.ts` — POST handler (must NOT use body-parser; use `request.text()` for raw body)
- [ ] Verify webhook signature using `stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)`
- [ ] Handle `customer.subscription.created` and `customer.subscription.updated`: if `status === 'active'`, set `subscription_status = 'pro'` and `stripe_subscription_id` in users table
- [ ] Handle `customer.subscription.deleted`: set `subscription_status = 'free'` in users table
- [ ] Export `config = { api: { bodyParser: false } }` — NOT needed in App Router (App Router uses Request, not Express)
- [ ] Return `{ received: true }` with status 200 on success; return 400 on signature verification failure
- [ ] Typecheck passes
- [ ] Deploy; configure webhook endpoint in Stripe dashboard pointing to `https://[vercel-url]/api/stripe/webhook`

### US-067: Create Stripe billing portal route
**Description:** As a Pro user, I want to manage my subscription (cancel, update payment method) from the profile page.

**Acceptance Criteria:**
- [ ] Create `src/app/api/stripe/portal/route.ts` — POST handler
- [ ] Get `clerkUserId` from `auth()`; look up `stripe_customer_id` from users table
- [ ] Create Stripe billing portal session: `stripe.billingPortal.sessions.create({ customer: customerId, return_url: '/profile' })`
- [ ] Return `{ url: session.url }` as JSON; client redirects to this URL
- [ ] Typecheck passes
- [ ] Deploy and verify

### US-068: Add "Upgrade to Pro" banner on dashboard for free users
**Description:** As a free user on the dashboard, I want to see a prompt to upgrade so I know Pro features exist.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, add a `subscriptionStatus` state (default `'free'`) fetched via a new server action `getSubscriptionStatus()` that calls `getUserSubscription(clerkUserId)`
- [ ] When `subscriptionStatus === 'free'`, show a banner above the task list: "Unlock Pro: photo diagnosis + yard estimator" with a "Upgrade — $4.99/mo" button
- [ ] Button click: calls `/api/stripe/checkout` via POST, then `window.location.href = data.url` to redirect to Stripe
- [ ] Banner uses `var(--color-surface)` background, `var(--color-primary)` accent border on left (2px), and is dismissible (X button sets a `dismissed` boolean in state)
- [ ] When URL has `?upgraded=1` param, show a success toast "Welcome to Pro! 🎉" and remove the banner
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-069: Add subscription section to profile page
**Description:** As a user, I want to see my current plan and manage my subscription from the profile page.

**Acceptance Criteria:**
- [ ] In `src/app/profile/page.tsx`, add a "Plan" section below the account info
- [ ] Free users: show "Free Plan" label + "Upgrade to Pro — $4.99/mo" button (calls `/api/stripe/checkout`)
- [ ] Pro users: show "Pro Plan ✓" label in `var(--color-primary)` color + "Manage Billing" button (calls `/api/stripe/portal`)
- [ ] Both buttons styled as outline buttons with `var(--color-primary)` border and text
- [ ] Subscription status loaded via `getSubscriptionStatus()` server action
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-070: Add Pro feature gate to API routes
**Description:** As a developer, I need premium API routes to reject requests from free users.

**Acceptance Criteria:**
- [ ] Create `src/lib/requirePro.ts` with `requirePro(clerkUserId: string): Promise<boolean>` — calls `getUserSubscription`, returns true if 'pro'
- [ ] In `/api/diagnose` (to be created in US-073) and `/api/estimate` (to be created in US-082): call `requirePro()` at the top; if false, return `Response.json({ error: 'pro_required', upgradeUrl: '/profile' }, { status: 403 })`
- [ ] Typecheck passes

---

### US-071: Add diagnoses table to database
**Description:** As a developer, I need a table to store grass diagnosis history per user.

**Acceptance Criteria:**
- [ ] Run migration: `CREATE TABLE IF NOT EXISTS diagnoses (id SERIAL PRIMARY KEY, clerk_user_id TEXT NOT NULL, image_url TEXT NOT NULL, grass_type TEXT, health_score INTEGER, issues JSONB, recommendations JSONB, raw_response TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`
- [ ] Create `src/lib/diagnoses.ts` with `saveDiagnosis(data)` and `getDiagnoses(clerkUserId, limit = 5)` functions
- [ ] Typecheck passes

### US-072: Create photo upload endpoint using Vercel Blob
**Description:** As a developer, I need an endpoint that accepts an image file and stores it in Vercel Blob, returning a URL.

**Acceptance Criteria:**
- [ ] Install `@vercel/blob` package
- [ ] Add `BLOB_READ_WRITE_TOKEN` to `env.local.example`
- [ ] Create `src/app/api/diagnose/upload/route.ts` — POST handler
- [ ] Accepts `multipart/form-data` with a `file` field (image/jpeg or image/png)
- [ ] Validates file is an image; rejects other types with 400
- [ ] Calls `put(filename, file, { access: 'public' })` from `@vercel/blob`
- [ ] Returns `{ url: blobUrl }` as JSON
- [ ] Requires Clerk auth (`auth()` check); returns 401 if not authenticated
- [ ] Requires Pro subscription (`requirePro()`); returns 403 if free user
- [ ] Typecheck passes
- [ ] Deploy to Vercel (BLOB_READ_WRITE_TOKEN must be set in Vercel env vars)

### US-073: Create grass diagnosis API route using Claude Vision
**Description:** As a developer, I need an API route that takes an image URL and returns Claude's diagnosis of the grass.

**Acceptance Criteria:**
- [ ] Create `src/app/api/diagnose/route.ts` — POST handler accepting `{ imageUrl: string }`
- [ ] Requires Clerk auth and Pro subscription (use `requirePro()`)
- [ ] Calls Claude claude-sonnet-4-6 with vision: send the imageUrl as an image message block with `media_type: 'image/jpeg'` and `type: 'url'`
- [ ] System prompt: "You are a lawn care expert. Analyze this lawn photo and respond with JSON only: { grassType: string, healthScore: number (0-100), issues: string[], recommendations: string[] }"
- [ ] Parse the JSON response; if parsing fails return `{ error: 'Could not analyze image' }` with 422
- [ ] Save result to diagnoses table via `saveDiagnosis()`
- [ ] Return `{ grassType, healthScore, issues, recommendations }` as JSON
- [ ] Typecheck passes
- [ ] Deploy and verify with a test lawn photo

### US-074: Create /diagnose page with photo upload UI
**Description:** As a Pro user, I want to upload a photo of my lawn and see a diagnosis instantly.

**Acceptance Criteria:**
- [ ] Create `src/app/diagnose/page.tsx` as a `"use client"` component
- [ ] Page shows: heading "Diagnose Your Lawn", subheading "Upload a photo and get instant AI analysis"
- [ ] Upload area: a dashed border box with "Tap to upload or drag & drop" text, accepts image/* files
- [ ] On file select: show image preview (URL.createObjectURL), show "Analyzing..." spinner
- [ ] Upload flow: POST to `/api/diagnose/upload`, get blob URL → POST to `/api/diagnose` with `{ imageUrl }` → receive diagnosis JSON
- [ ] If `/api/diagnose` returns 403 `pro_required`: show "This feature requires a Pro plan" message with "Upgrade to Pro" button linking to `/profile`
- [ ] On success: show diagnosis results (see US-075 for results card)
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-075: Show diagnosis results card on /diagnose page
**Description:** As a user, I want to see clear diagnosis results — grass type, health score, issues, and recommendations.

**Acceptance Criteria:**
- [ ] After diagnosis API returns, render a results card below the upload area
- [ ] Results card sections:
  - Grass type: `<p>Identified: <strong>{grassType}</strong></p>` in `var(--color-primary)`
  - Health score: label "Health Score" + a horizontal bar (full width = 100, filled width = healthScore%, green if ≥70, yellow if 40-69, red if <40)
  - Issues: section heading "Issues Found" + bulleted list of `issues[]` strings; if empty show "No issues detected ✓" in green
  - Recommendations: section heading "Recommendations" + numbered list of `recommendations[]` strings
- [ ] Results card uses `var(--color-surface)` background with `var(--color-border)` border, `rounded-xl p-5`
- [ ] "Diagnose Another" button below card resets state back to upload UI
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-076: Add diagnosis history section to /diagnose page
**Description:** As a user, I want to see my last 5 diagnoses so I can track changes over time.

**Acceptance Criteria:**
- [ ] At the bottom of `/diagnose` page, add a "Recent Diagnoses" section
- [ ] Load via a server action `getRecentDiagnoses()` that calls `getDiagnoses(clerkUserId, 5)` from `src/lib/diagnoses.ts`
- [ ] Each history item shows: thumbnail of image (40x40px, `object-cover rounded`), grass type, health score, date (formatted as "Jun 15")
- [ ] If no diagnoses yet, show "No diagnoses yet — upload your first photo above"
- [ ] History reloads after each new diagnosis (use `router.refresh()` or re-fetch)
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-077: Add "Diagnose Grass" entry point to navigation
**Description:** As a user, I want easy access to the diagnosis tool from the main navigation.

**Acceptance Criteria:**
- [ ] Add a fourth nav item to `NAV_ITEMS` in `src/app/ClientNav.tsx`: label "Diagnose", href "/diagnose", with a camera SVG icon
- [ ] Add `CameraIcon` to `src/components/icons.tsx`: 20x20 viewBox, camera body rectangle + lens circle + flash triangle, stroke="currentColor" fill="none"
- [ ] Mobile bottom tab bar now shows 4 items: Home, Calendar, Diagnose, Profile
- [ ] Desktop nav shows all 4 links
- [ ] Nav item hidden on `/` and `/onboarding/*` as before
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

---

### US-078: Install Google Maps JS API loader and configure env
**Description:** As a developer, I need the Google Maps SDK available so the yard estimator can use satellite imagery and drawing tools.

**Acceptance Criteria:**
- [ ] Install `@googlemaps/js-api-loader` package
- [ ] Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` (placeholder value) and `env.local.example`
- [ ] Create `src/lib/maps.ts` that exports `loadGoogleMaps(): Promise<typeof google>` — uses `Loader` from `@googlemaps/js-api-loader` with `libraries: ['places', 'drawing', 'geometry']`
- [ ] The loader is a singleton (only calls `load()` once; subsequent calls return same promise)
- [ ] Typecheck passes
- [ ] Deploy to Vercel (real API key set in Vercel env vars with Maps JavaScript API, Places API, and Drawing Library enabled)

### US-079: Create /estimate page with address autocomplete
**Description:** As a user, I want to type my address and have the map jump to my property.

**Acceptance Criteria:**
- [ ] Create `src/app/estimate/page.tsx` as a `"use client"` component
- [ ] Page heading: "Estimate Your Yard Size", subheading: "Draw your yard on the map to calculate square footage"
- [ ] Address input at the top: plain `<input type="text" placeholder="Enter your address..." />` styled with design tokens
- [ ] On page load, call `loadGoogleMaps()` then attach a `google.maps.places.Autocomplete` to the input element, restricted to `types: ['address']`
- [ ] On place selection, store `{ lat, lng }` from `place.geometry.location` in state — the map (US-080) will use this
- [ ] Pro gate: if user is not Pro, show "This feature requires Pro" overlay with "Upgrade" button; the map and input still render but are covered by the overlay
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-080: Load Google Maps satellite view on /estimate page
**Description:** As a user, I want to see a satellite view of my property so I can accurately trace my yard.

**Acceptance Criteria:**
- [ ] In `src/app/estimate/page.tsx`, add a map container `<div ref={mapRef} style={{ width: '100%', height: 400 }} />`
- [ ] After address selection (lat/lng set in state), initialize `new google.maps.Map(mapRef.current, { center: { lat, lng }, zoom: 19, mapTypeId: 'satellite', tilt: 0 })`
- [ ] Map renders satellite imagery (not road map) at zoom 19 (rooftop level)
- [ ] Map is responsive: on mobile uses full viewport width, on desktop max-width 800px
- [ ] If address not yet selected, show a placeholder div with "Enter an address above to load the map"
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-081: Add polygon drawing tool to the yard estimator map
**Description:** As a user, I want to draw the outline of my yard on the satellite map to measure it.

**Acceptance Criteria:**
- [ ] After map initializes, create a `google.maps.drawing.DrawingManager` with `drawingMode: 'polygon'`, `drawingControl: false` (use custom button instead)
- [ ] Add a "Draw Yard" button below the map — on click: set `drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)`
- [ ] Polygon options: `fillColor: '#4caf50'`, `fillOpacity: 0.25`, `strokeColor: '#4caf50'`, `strokeWeight: 2`
- [ ] On `polygoncomplete` event: store the polygon in state, set drawing mode back to null, enable "Calculate Area" button
- [ ] Add "Clear" button — removes the polygon from the map, resets state
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-082: Calculate polygon area and show square footage result
**Description:** As a user, I want to see the calculated square footage after drawing my yard polygon.

**Acceptance Criteria:**
- [ ] After `polygoncomplete`, immediately calculate area using `google.maps.geometry.spherical.computeArea(polygon.getPath())`
- [ ] `computeArea` returns square meters — convert to sq ft: `sqMeters * 10.7639`
- [ ] Round to nearest 10 sq ft
- [ ] Display result below the map: `<p>Estimated yard size: <strong>{sqFt.toLocaleString()} sq ft</strong></p>` in `var(--color-text-primary)` text-xl
- [ ] Show "Use this estimate" button (see US-083)
- [ ] If user redraws (clicks "Clear" then draws again), update the displayed result
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-083: "Use this estimate" saves sq ft to profile and redirects
**Description:** As a user, I want to save my estimated yard size to my profile in one click.

**Acceptance Criteria:**
- [ ] "Use this estimate" button calls a server action `saveYardEstimate(sqFt: number)` in `src/actions/profile.ts`
- [ ] `saveYardEstimate`: gets `clerkUserId` from `auth()`, updates `square_footage` in profiles/users table, also sets `sq_ft_source = 'maps_estimate'` (add this column if not present: `ALTER TABLE users ADD COLUMN IF NOT EXISTS sq_ft_source TEXT`)
- [ ] On success, call `router.push('/profile?estimated=1')`
- [ ] On `/profile` page, if URL has `?estimated=1`, show a toast "Yard size saved from map estimate"
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-084: Show "Estimated from map" badge on profile sq ft field
**Description:** As a user, I want to see when my yard size came from the map estimator vs. manual entry.

**Acceptance Criteria:**
- [ ] In `src/app/profile/page.tsx`, add `sqFtSource` state loaded from profile data (the `sq_ft_source` column)
- [ ] Below the "Lawn Size" input, when `sqFtSource === 'maps_estimate'`, show: `<p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>📍 Estimated from Google Maps</p>`
- [ ] If user manually edits the sq ft field and saves, set `sq_ft_source = 'manual'` in the update
- [ ] Add a "Re-estimate" link next to the badge that navigates to `/estimate`
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

---

### US-085: Add lawns table and link profiles to lawn_id
**Description:** As a developer, I need a lawns table so each user can have multiple named properties.

**Acceptance Criteria:**
- [ ] Run migration: `CREATE TABLE IF NOT EXISTS lawns (id SERIAL PRIMARY KEY, clerk_user_id TEXT NOT NULL, name TEXT NOT NULL DEFAULT 'My Lawn', grass_type TEXT, state TEXT, zip_code TEXT, sq_ft INTEGER, sun_exposure TEXT, has_pets BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())`
- [ ] Run migration: `ALTER TABLE weekly_plans ADD COLUMN IF NOT EXISTS lawn_id INTEGER REFERENCES lawns(id)`
- [ ] Create `src/lib/lawns.ts` with `getLawns(clerkUserId)`, `getLawn(id)`, `createLawn(data)`, `updateLawn(id, data)` functions
- [ ] Typecheck passes

### US-086: Add lawn selector dropdown to dashboard header
**Description:** As a user with multiple lawns, I want to switch between them from the dashboard.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, add a `lawns` state array and `selectedLawnId` state loaded via `getLawns(clerkUserId)`
- [ ] In the header area (next to "Week N" heading), show a `<select>` dropdown listing all lawn names; onChange sets `selectedLawnId` and triggers a plan reload for that lawn
- [ ] If user has only one lawn, show the lawn name as static text (no dropdown)
- [ ] If user has no lawns yet, show "Set up your lawn →" link to `/lawns/new`
- [ ] Lawn selector styled with `var(--color-surface)` background, `var(--color-border)` border, `var(--color-text-primary)` text
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-087: Create /lawns/new page — add a named lawn
**Description:** As a user, I want to add multiple lawns (e.g., "Front Yard", "Rental Property") so I can manage them separately.

**Acceptance Criteria:**
- [ ] Create `src/app/lawns/new/page.tsx` as a `"use client"` component
- [ ] Form fields: Lawn Name (text, required, placeholder "e.g. Front Yard"), ZIP Code (same as onboarding Step 1 — lookup USDA zone), Grass Type (same select as profile), Sq Ft (number, optional), Sun Exposure (same button group as profile), Has Pets (same Yes/No buttons)
- [ ] "Save Lawn" button calls `createLawn(data)` server action (in `src/actions/lawns.ts`) then redirects to `/dashboard`
- [ ] Back link: "← Back to Dashboard" at top
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

### US-088: Update plan generation to use selected lawn_id
**Description:** As a developer, I need plan generation to be scoped to a specific lawn so multi-lawn users get separate plans.

**Acceptance Criteria:**
- [ ] In `src/app/api/parse-pdf/route.ts` (or equivalent plan generation route), accept optional `lawnId` in the request body
- [ ] When `lawnId` is provided, store the generated plan with that `lawn_id` in the weekly_plans table
- [ ] When loading plans on the dashboard, filter by `lawn_id = selectedLawnId` (or fall back to `clerk_user_id` if no lawns exist yet)
- [ ] Typecheck passes
- [ ] Deploy and verify plan generation still works correctly

### US-089: Add household_code to users and invite endpoint
**Description:** As a user, I want to generate a household invite link so family members can access the same lawn data.

**Acceptance Criteria:**
- [ ] Run migration: `ALTER TABLE users ADD COLUMN IF NOT EXISTS household_code TEXT UNIQUE`
- [ ] Create `src/app/api/household/invite/route.ts` — POST handler: gets `clerkUserId`, generates a random 8-character alphanumeric code if none exists, saves to `users.household_code`, returns `{ code, inviteUrl: 'https://[app-url]/join/[code]' }`
- [ ] Create `src/app/api/household/join/route.ts` — POST handler: accepts `{ code }`, finds user with that `household_code`, sets the requesting user's `household_code` to the same value (joining their household)
- [ ] Members of the same household can see each other's lawns (update `getLawns` to also return lawns from users with the same `household_code`)
- [ ] Typecheck passes
- [ ] Deploy to Vercel

### US-090: Add household sharing UI to profile page
**Description:** As a user, I want to invite household members from the profile page.

**Acceptance Criteria:**
- [ ] In `src/app/profile/page.tsx`, add a "Household" section below the Plan section
- [ ] "Generate Invite Link" button: calls `/api/household/invite`, shows the returned `inviteUrl` in a copyable text field
- [ ] Copyable field: `<input readOnly value={inviteUrl} />` with a "Copy" button that calls `navigator.clipboard.writeText(inviteUrl)` and shows "Copied!" toast
- [ ] Create `src/app/join/[code]/page.tsx`: server component that calls `/api/household/join` with the code from the URL param, then redirects to `/dashboard` with `?joined=1`
- [ ] On `/dashboard` with `?joined=1`, show toast "You've joined the household — shared lawns are now visible"
- [ ] Typecheck passes
- [ ] Deploy and verify in browser using dev-browser skill

---

## Functional Requirements

- FR-1: Users can create accounts via Clerk (email/password or social OAuth)
- FR-2: Unauthenticated users are redirected to /sign-in when accessing /dashboard, /profile, /diagnose, /estimate
- FR-3: Free users get the full lawn plan feature; Pro users additionally get photo diagnosis and yard estimator
- FR-4: Stripe Checkout handles all payment flows; no card data ever touches the app server
- FR-5: Stripe webhooks keep subscription_status in sync within 30 seconds of a Stripe event
- FR-6: Photo upload accepts JPEG and PNG; rejects other formats with a user-facing error
- FR-7: Claude Vision diagnosis returns structured JSON with grassType, healthScore (0-100), issues[], recommendations[]
- FR-8: Google Maps polygon area is calculated using spherical geometry (accurate for real property sizes)
- FR-9: Users can have 1-N named lawns; each lawn has its own plan history
- FR-10: Household invite codes are 8-character alphanumeric, unique per user, and do not expire
- FR-11: All profile data (grass type, sq ft, sun exposure, pets) persists server-side linked to Clerk user_id

---

## Non-Goals

- No mobile app (PWA only)
- No email notifications or push notifications
- No admin dashboard or user management UI
- No annual billing option (monthly only for now)
- No free trial — free tier is permanent but feature-limited
- No custom domain per household
- No public lawn profiles (the shareable link is invite-only, not SEO-indexed)
- No Stripe metered/usage-based billing
- No referral program

---

## Design Considerations

- All new pages follow the existing dark theme (`var(--color-background)`, `var(--color-surface)`, etc.)
- Clerk sign-in/sign-up widgets should use Clerk's `appearance` prop to match the dark theme: `appearance={{ variables: { colorBackground: '#0d1a0d', colorInputBackground: '#1a2e1a', colorPrimary: '#4caf50', colorText: '#e8f5e9' } }}`
- Pro feature gates use a consistent pattern: a locked overlay with an "Upgrade to Pro" button — reuse across /diagnose and /estimate pages
- The Google Maps satellite view should disable all map controls except zoom (`zoomControl: true`, all others `false`) to keep the UI clean

---

## Technical Considerations

- **Clerk**: App Router integration uses `@clerk/nextjs`. Server actions use `auth()` from `@clerk/nextjs/server`. Client components use `useUser()` and `useClerk()` hooks.
- **Stripe webhooks**: Must receive raw body (not parsed JSON). In Next.js App Router, use `request.text()` to get the raw body before constructing the Stripe event.
- **Vercel Blob**: Requires `BLOB_READ_WRITE_TOKEN` env var. Set via `vercel env pull` or Vercel dashboard. Use `put(pathname, body, { access: 'public' })`.
- **Google Maps**: The API key must have the following APIs enabled in Google Cloud Console: Maps JavaScript API, Places API, Drawing Library, Geometry Library.
- **Claude Vision**: Use `anthropic` SDK. Image sent as `{ type: 'image', source: { type: 'url', url: imageUrl } }` in the messages array.
- **Existing DB**: The app uses `@vercel/postgres` with lazy pool init. All new tables should use `IF NOT EXISTS` in migrations. Run migrations as one-time scripts in the story, not via a migration runner.
- **Deploy after each story**: Run `vercel --yes` after each commit. Check the production URL for regressions.

---

## Success Metrics

- User can sign up, complete onboarding, and return the next day to find their lawn plan still loaded (no sessionStorage dependency)
- Stripe test checkout completes successfully with card 4242 4242 4242 4242
- Photo diagnosis returns results in under 15 seconds for a standard JPEG
- Google Maps polygon accurately estimates a 5,000 sq ft yard within 10%
- A user can create two lawns and switch between them on the dashboard with separate plans

---

## Open Questions

- Should Clerk appearance customization match the dark theme? (Recommended: yes, via the `appearance` prop)
- What happens to existing anonymous users (session_id based) when they sign up? Should we migrate their plan data? (Recommended: yes — on first sign-in, if sessionStorage has onboarding_state, auto-save it to the new account)
- Should the household feature allow a Pro member to share their Pro benefits with household members? (Out of scope for now — each member needs their own subscription)
- What is the Claude Vision model cost per diagnosis? Should there be a usage cap per month for Pro users? (Out of scope for now)
