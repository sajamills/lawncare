# PRD: PDF Resource List, Year Activity Check-in & Landing Page Redesign

## Introduction

Three related improvements that shift the app away from a required Anthropic API key toward a curated resource model, gather useful historical context from users during onboarding, and replace the bare placeholder landing page with a proper SaaS marketing one-pager.

**Current state:**
- Landing page (`src/app/page.tsx`) is a blank placeholder with just "LawnGuide"
- Onboarding Step 5 calls Claude API (`/api/parse-pdf`) to parse university extension PDFs into a care plan — this requires an Anthropic API key and fails in dev/preview environments
- No step asks what lawn care tasks the user has already completed this year
- Onboarding is 5 steps: ZIP → Yard Details → Grass Quiz → Grass Type → Plan Build

**Target state:**
- Landing page is a marketing one-pager with Hero + Features + How It Works + CTA
- Onboarding is 7 steps: ZIP → Yard Details → Grass Quiz → Grass Type → What You've Done This Year → PDF Resources → Done
- The AI parse step is removed; instead users are shown a curated list of relevant PDFs/links from their state's cooperative extension service
- AI parsing happens later (post sign-up, on-demand) — not during onboarding

---

## Goals

- Remove the Anthropic API dependency from onboarding so the app works without an API key configured
- Surface relevant university extension PDF resources to users based on their state and grass type
- Capture what lawn care activities the user has already done in the current calendar year
- Make the landing page feel like a real product and drive users into onboarding

---

## User Stories

### US-021: Replace AI parse step with PDF resource list

**Description:** As a user, I want to see the official lawn care guides for my grass type and state so I can reference them directly, without needing the app to process them with AI.

**Acceptance Criteria:**
- [ ] Current Step 5 (`Step5.tsx`) is renamed/replaced — it no longer calls `/api/parse-pdf`
- [ ] A new step (Step 6) displays a list of 1–3 relevant PDF/resource links for the user's state and grass type
- [ ] Links are sourced from existing `extensionSources` and `knownPdfUrls` in `src/data/extension-sources.ts`
- [ ] If a `knownPdfUrls` entry exists for `STATE_grassType`, it is shown as the primary resource
- [ ] If no known PDF exists, show the state extension's search URL as a fallback link
- [ ] Each link shows the university name (from `extensionSources`) and a label like "Lawn Care Guide (PDF)" or "Search Extension Library"
- [ ] Links open in a new tab (`target="_blank" rel="noopener noreferrer"`)
- [ ] A "Continue →" button advances to the next step (does not require a link to be clicked)
- [ ] The step heading is "Your lawn care resources"
- [ ] The `/api/parse-pdf` route is NOT called during onboarding (the route file can stay but is not invoked)
- [ ] Onboarding state still saves profile via `saveProfile` (move this logic to this step or keep it in the new final step)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-022: Add "What have you done this year?" onboarding step

**Description:** As a user, I want to tell the app which lawn care tasks I've already completed this year so my plan can account for what's left to do.

**Acceptance Criteria:**
- [ ] A new step (Step 5) is inserted after the grass type selection step (current Step 4) and before the PDF resources step
- [ ] The step heading is "What have you done so far this year?"
- [ ] Subheading: "Check off anything you've already done in {current year}"
- [ ] Displays a fixed checklist of 10 common tasks (see list below)
- [ ] Each task is a toggleable checkbox button — tapping toggles selected state
- [ ] Multiple tasks can be selected simultaneously
- [ ] A "None yet — it's early in the season" option at the bottom deselects all others when selected, and is deselected when any other task is selected
- [ ] Selected tasks are saved to `onboarding_state` as `completed_tasks: string[]` (array of task IDs)
- [ ] Step can be skipped / continued with zero selections (the button is always enabled)
- [ ] Button label: "Continue →"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

**Task list (id: label):**
- `fertilize`: Applied fertilizer
- `pre-emergent`: Applied pre-emergent weed control
- `post-emergent`: Applied post-emergent (weed killer)
- `aerate`: Aerated the lawn
- `overseed`: Overseeded
- `dethatch`: Dethatched
- `lime`: Applied lime or soil amendment
- `pesticide`: Applied pesticide / grub control
- `mow-started`: Started regular mowing
- `irrigation`: Set up / ran irrigation system

### US-023: Wire new steps into onboarding router

**Description:** As a developer, I need the onboarding router to include the two new steps so the flow goes 1→2→3→4→5→6→7.

**Acceptance Criteria:**
- [ ] `src/app/onboarding/[step]/page.tsx` `STEP_COMPONENTS` array is updated to 7 steps
- [ ] Step order: Step1 (ZIP), Step2 (Yard details), Step3 (Quiz), Step4 (Grass type), Step5 (What you've done), Step6 (PDF resources), Step7 (Done/confirmation)
- [ ] Step 7 is a simple "You're all set!" confirmation screen with a "Go to my dashboard →" button that navigates to `/dashboard`
- [ ] Back button works correctly for all 7 steps
- [ ] Route guard in `page.tsx` is updated to accept steps 1–7 (`stepNum > 7` triggers notFound)
- [ ] `saveProfile` is called in Step 7 (or Step 6), not in the old Step 5 location
- [ ] `completed_tasks` from onboarding state is passed to `saveProfile` (add the field; it can be a no-op if the DB schema doesn't have it yet — just don't error)
- [ ] Typecheck passes

### US-024: SaaS marketing landing page

**Description:** As a potential user landing on the site, I want to see a compelling one-page overview of LawnGuide so I understand the value and am motivated to start my free plan.

**Acceptance Criteria:**
- [ ] `src/app/page.tsx` is replaced with a full marketing landing page
- [ ] Page has four sections: Hero, Features (3 features), How It Works (3 steps), CTA banner
- [ ] Hero section includes:
  - [ ] Product name "LawnGuide" as the logo/wordmark
  - [ ] Headline: "The lawn plan built for your yard, your grass, and your zone."
  - [ ] Subheadline: "Answer a few questions and get a science-backed care calendar — free, no account required."
  - [ ] Primary CTA button: "Get my free lawn plan →" linking to `/onboarding/1`
  - [ ] A muted secondary note below the button: "Takes 2 minutes. No credit card."
- [ ] Features section (heading: "Why LawnGuide?") with 3 feature cards:
  - [ ] "Zone-aware" — "Plans calibrated to your USDA growing zone and local university extension research."
  - [ ] "Grass-specific" — "From Bermuda to Tall Fescue, care schedules matched to your exact grass type."
  - [ ] "Pet-friendly flags" — "Every recommendation notes whether it's safe for dogs and cats on the lawn."
- [ ] How It Works section (heading: "How it works") with 3 numbered steps:
  1. "Enter your ZIP code" — "We detect your USDA zone and your state's extension resources."
  2. "Tell us about your lawn" — "Grass type, sun exposure, lawn size, and what you've done this year."
  3. "Get your plan" — "A month-by-month care calendar with official university guide links."
- [ ] Bottom CTA banner with: "Ready to get started?" heading and "Get my free lawn plan →" button linking to `/onboarding/1`
- [ ] Page uses existing CSS variables (`--color-primary`, `--color-surface`, `--color-text-primary`, `--color-text-muted`, `--color-background`) for theming consistency
- [ ] Page is responsive — readable on mobile (single column) and desktop (multi-column features grid)
- [ ] No external images required — use emoji or simple text-based icons for feature cards
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-025: Database schema migration script

**Description:** As a developer, I want a single SQL migration script and clear setup instructions so I can connect either Vercel Postgres or Supabase in under 5 minutes.

**Acceptance Criteria:**
- [ ] A migration file exists at `scripts/migrate.sql` containing `CREATE TABLE IF NOT EXISTS` statements for all required tables
- [ ] `user_profiles` table includes: `id`, `clerk_user_id`, `session_id` (unique), `zip_code`, `state`, `usda_zone`, `grass_type`, `square_footage`, `has_pets`, `sun_exposure`, `completed_tasks` (text array), `updated_at`, `created_at`
- [ ] `cached_plans` table includes: `id`, `state`, `grass_type`, `pdf_url`, `parsed_plan` (jsonb), `created_at`, with unique constraint on `(state, grass_type)`
- [ ] A `scripts/migrate.ts` Node script is added that reads `migrate.sql` and runs it against the configured DB (using `@vercel/postgres`)
- [ ] `package.json` has a `"db:migrate"` script: `npx tsx scripts/migrate.ts`
- [ ] A `.env.local.example` file (or update to existing) documents the required env vars: `POSTGRES_URL` with a comment pointing to Vercel Marketplace (Neon) or Supabase connection string format
- [ ] The `src/actions/profile.ts` `ProfileData` interface is updated to include `completed_tasks?: string[]`
- [ ] The `saveProfile` INSERT/UPDATE query is updated to include `completed_tasks` column (uses `$10` param; pass `data.completed_tasks ?? []`)
- [ ] Typecheck passes

**Setup instructions (to add as comments in `.env.local.example`):**
```
# Option A — Vercel Postgres (Neon via Vercel Marketplace):
#   vercel env pull .env.local
#   (Vercel auto-populates POSTGRES_URL after you add Neon from Marketplace)
#
# Option B — Supabase:
#   Copy "Transaction mode" connection string from Supabase > Settings > Database
#   POSTGRES_URL=postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## Functional Requirements

- FR-1: Onboarding must not call `/api/parse-pdf` or instantiate an Anthropic client during onboarding
- FR-2: Extension PDF/resource links must derive from existing `extensionSources` and `knownPdfUrls` data — no new hardcoded data
- FR-3: "What you've done" checklist must use task IDs (not labels) for storage so labels can change without breaking saved data
- FR-4: The "None yet" option must behave as a mutually exclusive toggle vs. all other options
- FR-5: The landing page CTA must link to `/onboarding/1` (not to a sign-up page)
- FR-6: All new steps must follow the existing `{ onNext }: { onNext: () => void }` prop pattern used by Steps 1–4
- FR-7: Onboarding session state (`sessionStorage` key `onboarding_state`) must include `completed_tasks: string[]` by end of Step 5
- FR-8: The router in `page.tsx` must be updated so stepNum > 7 triggers notFound (not > 5)
- FR-9: `scripts/migrate.sql` must use `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so it is safe to re-run on an already-provisioned DB
- FR-10: The `@vercel/postgres` package works with any `POSTGRES_URL` — no code changes needed to support Supabase; only the connection string differs

---

## Non-Goals

- No AI-powered plan generation during onboarding (deferred to post sign-up, on-demand)
- No database schema changes for `completed_tasks` (store in onboarding state; pass to saveProfile but handle gracefully if column missing)
- No testimonials, social proof, or pricing section on the landing page
- No animations or scroll effects on the landing page
- No embedded PDF viewer (links open in new tab only)
- No search or filtering of PDF resources
- No email capture or newsletter sign-up
- No Supabase-specific client library — `@vercel/postgres` works with Supabase's `POSTGRES_URL` as-is

---

## Design Considerations

- Match the existing dark green theme (`--color-primary: #4a7c59` or similar) across all new UI
- Feature cards on the landing page can use a simple grid: 1-col on mobile, 3-col on `md:` breakpoint
- Emoji icons for feature cards: 🌿 (zone-aware), 🌱 (grass-specific), 🐾 (pet-friendly)
- Checklist items in Step 5 should look like the sun-exposure buttons in Step 2: full-width, bordered, toggle-selected state
- The PDF resource list in Step 6 should be simple link cards with university name + resource label — no fancy UI needed

---

## Technical Considerations

- The existing `onboarding/[step]/page.tsx` uses an array index (`STEP_COMPONENTS[stepNum - 1]`) — just add new step components to the array and update the max check
- `saveProfile` in `src/actions/profile.ts` likely needs `completed_tasks` added to its input type — add it as optional (`completed_tasks?: string[]`) and ignore it server-side if the DB column doesn't exist yet
- The `knownPdfUrls` in `extension-sources.ts` uses keys like `NC_bermuda-grass` — the step needs to construct the key as `${state.toUpperCase()}_${grassType}` to look up the right URL
- The landing page is a Server Component (no `"use client"` needed since there's no interactivity)

---

## Success Metrics

- Onboarding completes without requiring any environment variables (no `ANTHROPIC_API_KEY` needed)
- Users can reach the dashboard without the app making any external AI API calls
- Landing page CTA is visible above the fold on a 375px mobile viewport

---

## Open Questions

- Should `completed_tasks` be persisted to the DB eventually? (Assumed yes, but deferred to a future story)
- Should the PDF resource step also show the full `extensionSources` list as a fallback if the state has no `knownPdfUrls` entry? (Current plan: yes, show the search URL from `extensionSources`)
