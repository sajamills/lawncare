# PRD: Lawn Care Planner App

## Introduction

A utility-first lawn care web app that cuts through the noise of generic blog content. Users enter their zip code, identify their grass type through a guided quiz with photos, and receive a personalized care plan sourced from their nearest university extension service PDF — organized by current tasks and an annual calendar. The app is a mobile-first PWA with a dark/green theme and optional accounts to save profiles across devices.

---

## Goals

- Replace generic lawn care blog content with hyper-local, science-backed care plans
- Identify a user's grass type through a quiz + photo confirmation flow
- Automatically find and parse the relevant university extension PDF for the user's state/zone
- Present a two-part output: "Do This Now" tasks + a full annual care calendar
- Support optional accounts so users can save their yard profile and return later
- Ship as a mobile-first PWA installable on iOS and Android

---

## User Stories

### US-001: Zip code to growing zone lookup
**Description:** As a new user, I want to enter my zip code so the app knows my USDA growing zone and state.

**Acceptance Criteria:**
- [ ] Zip code input is the first screen of onboarding
- [ ] App resolves zip to USDA hardiness zone (e.g. 7a) using a zone lookup API or dataset
- [ ] App stores the resolved state and zone for downstream use
- [ ] Invalid or unrecognized zip shows a clear error message
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-002: Yard profile inputs
**Description:** As a user, I want to enter my yard size, pet/animal presence, and sun exposure so the plan accounts for my specific conditions.

**Acceptance Criteria:**
- [ ] Input for approximate square footage (numeric, with a "I don't know" option that defaults to "medium yard")
- [ ] Checkbox/toggle for pets or livestock on property
- [ ] Sun exposure selector: Full Sun / Partial Shade / Full Shade
- [ ] All inputs save to user session/profile
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: Grass type identification quiz
**Description:** As a user, I want to answer a short quiz about my grass so the app can suggest what type I have.

**Acceptance Criteria:**
- [ ] 4–6 question quiz covering: blade width (fine/medium/coarse), texture (soft/rough/stiff), color (bright green/dark green/blue-green), growth pattern (clumping/spreading), and active season (summer/winter/year-round)
- [ ] One question per screen, progress indicator shown
- [ ] Answers are scored to produce a ranked list of 2–3 likely grass types
- [ ] Quiz can be skipped with "I already know my grass type"
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: Grass type photo confirmation
**Description:** As a user, I want to see photos of suggested grass types so I can confirm which one matches my yard.

**Acceptance Criteria:**
- [ ] After quiz, show top 2–3 grass type candidates with a photo and key traits for each
- [ ] User taps to confirm their grass type
- [ ] If none match, user can browse a full list of grass types with photos
- [ ] Selected grass type is saved to profile
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-005: Automated university extension PDF sourcing
**Description:** As a user, I want the app to silently find and use the best local extension guide so I don't have to search for it myself.

**Acceptance Criteria:**
- [ ] On completion of onboarding, app triggers a backend job to locate the relevant state extension service PDF based on state + grass type
- [ ] PDF is fetched, parsed, and stored; raw PDF is never shown to user
- [ ] If no PDF is found for the exact grass type, app falls back to the state's general lawn care guide
- [ ] Parsed data is keyed by month and task type (fertilize, mow, water, aerate, overseed, etc.)
- [ ] Typecheck/lint passes

### US-006: "Do This Now" current tasks view
**Description:** As a user, I want to see what I should do on my lawn right now based on today's date and my zone.

**Acceptance Criteria:**
- [ ] Landing page after onboarding shows a "Right Now" task list for the current week
- [ ] Tasks are sourced from the parsed extension PDF, filtered to current month + zone
- [ ] Each task has a title, brief explanation (1–2 sentences), and a priority tag (urgent / routine / optional)
- [ ] Pet-safe flag shown on any task involving chemicals if pets are indicated
- [ ] Yard size adjusts fertilizer/product quantities shown in task details
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-007: Annual care calendar
**Description:** As a user, I want to see a full year calendar of lawn care tasks so I can plan ahead.

**Acceptance Criteria:**
- [ ] Calendar view shows all 12 months with tasks per month
- [ ] Current month is highlighted
- [ ] Tasks are color-coded by category (mow, fertilize, water, aerate, seed, pest/weed, other)
- [ ] Tapping a month expands to show task details
- [ ] Calendar scrolls horizontally on mobile
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-008: Optional user account (email/password)
**Description:** As a returning user, I want to create an account so my lawn profile is saved across devices.

**Acceptance Criteria:**
- [ ] Account creation is prompted at the end of onboarding but can be skipped
- [ ] Email + password sign-up with email verification
- [ ] Sign-in from any device restores full profile (zone, grass type, yard size, pets, etc.)
- [ ] Skipping account saves profile to localStorage with a prompt to "save your profile" on return visits
- [ ] Account page allows editing all profile fields
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-009: PWA install + offline support
**Description:** As a mobile user, I want to install the app to my home screen so I can access my plan without opening a browser.

**Acceptance Criteria:**
- [ ] App meets PWA criteria: manifest.json, service worker, HTTPS
- [ ] Install prompt shown on first visit (iOS: share → add to home screen instruction; Android: native prompt)
- [ ] Previously loaded plan is accessible offline (cached via service worker)
- [ ] App icon and splash screen use dark/green brand colors
- [ ] Typecheck/lint passes

### US-010: Dark/green theme
**Description:** As a user, I want a visually distinct dark theme with green accents that feels purposeful for a lawn care tool.

**Acceptance Criteria:**
- [ ] Global dark background (#0f1a0f or similar deep dark green-black)
- [ ] Primary accent color: medium green (#4caf50 or similar)
- [ ] Secondary accent: lighter lime green for highlights
- [ ] All text passes WCAG AA contrast ratio (4.5:1 minimum)
- [ ] No light mode — dark is the only theme
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- **FR-1:** Zip code field on first load resolves to USDA hardiness zone + US state
- **FR-2:** Onboarding collects: zip, square footage, pets present (yes/no), sun exposure
- **FR-3:** Grass identification quiz (4–6 questions) produces ranked grass type candidates
- **FR-4:** Grass type confirmation shows photos and key traits for top candidates
- **FR-5:** On onboarding completion, backend locates and parses the state university extension PDF for the user's grass type and zone
- **FR-6:** PDF parse extracts monthly tasks keyed by: month, task type, notes
- **FR-7:** "Do This Now" view shows current-week tasks with priority tags and pet-safe indicators
- **FR-8:** Fertilizer/product quantities in task details scale to the user's entered square footage
- **FR-9:** Annual calendar shows all 12 months with color-coded, categorized tasks
- **FR-10:** Optional email/password account saves and restores full profile across devices
- **FR-11:** Unauthenticated sessions persist profile in localStorage
- **FR-12:** App ships as a PWA with service worker and installable manifest
- **FR-13:** Dark/green-only visual theme applied globally

---

## Non-Goals

- No user-uploaded photos of grass for AI identification (quiz + photo library only)
- No e-commerce or product purchase links in v1
- No push notification reminders in v1 (open question for v2)
- No HOA or municipality-specific watering restrictions
- No integration with smart irrigation systems or weather APIs in v1
- No multi-yard / multiple profiles per account in v1
- No social features, sharing, or community content

---

## Design Considerations

- **Mobile-first:** All layouts designed for 375px viewport first, then scaled up
- **Onboarding flow:** Step-by-step wizard, one action per screen, no overwhelming forms
- **Color palette:**
  - Background: `#0d1a0d` (deep dark green-black)
  - Surface/card: `#1a2e1a`
  - Primary accent: `#4caf50` (green)
  - Secondary accent: `#a5d6a7` (light green)
  - Text primary: `#e8f5e9`
  - Text muted: `#81c784`
- **Typography:** Clean sans-serif (Inter or Geist), generous line height for readability outdoors in sunlight
- **Icons:** Lawn/nature icon set (leaf, water drop, sun, calendar, scissors)

---

## Technical Considerations

- **Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS
- **PDF parsing:** Use an LLM (Claude API via Vercel AI Gateway) to extract structured monthly task data from extension PDFs
- **ZIP → zone lookup:** USDA zone dataset (static JSON or free API) — no external dependency for core flow
- **University PDF discovery:** Automate via a curated map of state → extension service URL pattern, then fetch and parse on demand; cache parsed results by state + grass type
- **Auth:** Clerk (Vercel Marketplace) for optional email/password accounts
- **Database:** Postgres via Vercel Marketplace for user profiles and cached PDF parse results
- **PWA:** next-pwa or custom service worker with Workbox
- **Hosting:** Vercel (Fluid Compute for PDF parsing serverless functions)

---

## Success Metrics

- User completes full onboarding (zip → grass type confirmed) in under 3 minutes
- "Do This Now" tasks appear within 10 seconds of onboarding completion
- PDF source is found and parsed for 45+ US states at launch
- App scores 90+ on Lighthouse PWA and Performance audits
- Zero "I don't know what to do next" moments in onboarding (every screen has a clear primary action)

---

## Open Questions

1. Should the app show which university extension PDF it sourced from (with a link), for transparency/trust? -- yes
2. For the "I don't know my square footage" fallback, what default quantities should be used in task details? -- rough estimates that compare like tennis court size etc
3. Should the annual calendar allow users to mark tasks as complete and track history? -- yes
4. Should push notifications be scoped into v1 after all, since PWA supports them natively? --yes
5. What is the fallback if a state's extension service doesn't have a PDF for a specific grass type — show generic USDA guidance? -- look for one for the region
