# PRD: Dashboard Fixes, Navigation & Core UX

## Introduction

Ten stories covering three areas: (1) critical bugs making the dashboard show zero tasks and the calendar broken, (2) navigation so users can actually move between pages, and (3) core product improvements — loading states, task check-off, cross-session plan persistence, and a next-week preview card.

## Goals

- Fix the empty dashboard caused by stale 12-month cached plans in the DB
- Fix the broken calendar page (still uses old MonthlyPlan format)
- Add working navigation so users are never stranded on a page
- Make the dashboard load correctly across sessions (not just while sessionStorage exists)
- Give users interactive feedback: task completion, loading progress, and a look-ahead card

## User Stories

---

### US-032: Fix stale plan cache detection in API
**Description:** As a developer, I need the `/api/parse-pdf` route to detect and discard cached plans from the old 12-month format so the dashboard always gets a valid 52-week plan.

**Acceptance Criteria:**
- [ ] After fetching `parsed_plan` from the DB cache, check if `parsed_plan[0]?.week !== undefined` — if `week` is missing the plan is old format
- [ ] If plan is old format, delete that row from `cached_plans` (or skip it) and proceed to regenerate via Claude
- [ ] Newly generated plan (52-week) is saved back to DB cache via existing upsert
- [ ] If DB is unavailable, fall through to generation as before (no change to existing error handling)
- [ ] Typecheck passes

---

### US-033: Rewrite calendar page for 52-week data
**Description:** As a user, I want my full annual calendar to show the correct weekly plan data so I can see all 52 weeks of tasks.

**Acceptance Criteria:**
- [ ] Import `WeeklyPlan` and `WeeklyTask` types from `@/app/api/parse-pdf/route` (already exported)
- [ ] Replace `MonthlyPlan` interface and all `month`-keyed logic with `WeeklyPlan` and `week`-keyed logic
- [ ] Group the 52 weeks into 12 months for the calendar view: week 1–4 = Jan, 5–8 = Feb, etc. (use `Math.ceil(week / 4.33)` clamped to 1–12)
- [ ] Calendar tab: 12 month columns each showing colored category dots for that month's tasks; clicking a month expands its week-by-week task list below it
- [ ] List tab: 12 month sections, each containing all tasks for that month's weeks (collapsed into one flat list per month)
- [ ] Current month highlighted in `var(--color-primary)` as before
- [ ] Category legend at the bottom unchanged
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-034: Navigation bar — header links and mobile bottom tabs
**Description:** As a user, I want to navigate between Dashboard, Calendar, and Profile without knowing the URLs, so I never get stranded on a page.

**Acceptance Criteria:**
- [ ] Update `src/app/layout.tsx` header to include nav links: Dashboard (`/dashboard`), Calendar (`/dashboard/calendar`), Profile (`/profile`)
- [ ] On desktop (md: breakpoint and up): links appear inline in the header next to the LawnGuide wordmark
- [ ] On mobile: add a fixed bottom tab bar with three icon+label tabs: 🏠 Home (`/dashboard`), 📅 Calendar (`/dashboard/calendar`), 👤 Profile (`/profile`)
- [ ] The active route tab/link is highlighted using `var(--color-primary)` color; inactive tabs use `var(--color-text-muted)`
- [ ] Active state uses Next.js `usePathname()` to determine current route
- [ ] Bottom tab bar has a top border `#2d4a2d` and `var(--color-surface)` background
- [ ] Mobile bottom bar adds `pb-16` padding to the `<main>` element so content isn't hidden behind it
- [ ] Layout file must use `"use client"` to support `usePathname()`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-035: Make "view your full annual calendar" a clickable link
**Description:** As a user on the dashboard who has no tasks this week, I want to click "view your full annual calendar" to go to the calendar page, not read dead text.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, wrap the phrase "view your full annual calendar" inside a Next.js `<Link href="/dashboard/calendar">` with an underline style
- [ ] The link color matches `var(--color-primary)` to make it visually identifiable as a link
- [ ] The rest of the empty-state paragraph text remains unchanged
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-036: Dashboard cold-load — hydrate from DB when sessionStorage is empty
**Description:** As a returning user who opened a fresh tab, I want the dashboard to load my plan automatically even though sessionStorage is empty, so I don't have to redo onboarding.

**Acceptance Criteria:**
- [ ] On dashboard mount, after reading `onboarding_state` from sessionStorage, check if `state.state` or `state.grass_type` is missing
- [ ] If missing, call `getProfile(sessionId)` from `@/actions/profile` using the `lawn_session_id` from localStorage
- [ ] If the DB profile has `state` and `grass_type`, use those values to call the plan API and render the dashboard normally
- [ ] If DB profile also has no `state`/`grass_type`, show the onboarding CTA card (see US-037)
- [ ] If `lawn_session_id` is missing from localStorage, skip the DB fetch and go straight to US-037 CTA
- [ ] No visible change to users who already have sessionStorage populated
- [ ] Typecheck passes

---

### US-037: Onboarding gate — CTA card when no profile exists
**Description:** As a brand-new user who landed on the dashboard without completing onboarding, I want to see a clear prompt to set up my profile so I understand why the dashboard is empty.

**Acceptance Criteria:**
- [ ] If after US-036's DB check there is still no `state` or `grass_type`, replace the task area with a single card containing: heading "Set up your lawn profile", subtext "Answer a few quick questions to get your personalized 52-week care plan.", and a button "Get started →" linking to `/onboarding/1`
- [ ] Card uses the existing surface/border style (`var(--color-surface)`, border `#2d4a2d`)
- [ ] Button uses `var(--color-primary)` background
- [ ] The "Right Now" heading and subtitle are still shown above the card
- [ ] No infinite loading spinner if profile is missing
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-038: Plan generation progress animation
**Description:** As a user waiting for my plan to generate, I want to see animated status messages instead of a plain spinner so I understand what's happening and don't think the app is broken.

**Acceptance Criteria:**
- [ ] While the `/api/parse-pdf` fetch is in-flight, show a loading card (instead of or below the spinner) that cycles through 4 messages every 3 seconds:
  1. "Identifying your grass type and climate zone…"
  2. "Consulting university extension research…"
  3. "Building your 52-week care calendar…"
  4. "Almost there — personalizing your plan…"
- [ ] Messages cycle using `setInterval` cleared on unmount
- [ ] Keep the existing green spinner above the message text
- [ ] If the fetch completes before cycling through all messages, immediately show tasks (don't wait for interval)
- [ ] Only show this loading state when the API fetch is actually in progress (not on subsequent cached loads)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-039: Task completion check-off on dashboard
**Description:** As a user, I want to check off tasks I've completed this week so I can track my progress and feel accomplished.

**Acceptance Criteria:**
- [ ] Each task card in the dashboard gets a circular checkbox button on the right side of the task header row (replacing or alongside the priority badge)
- [ ] Tapping the button toggles the task's completed state
- [ ] Completed task: checkbox shows a green checkmark (✓), task title gets `line-through` text decoration, card opacity reduces to 60%
- [ ] Completed tasks move to the bottom of the list (below incomplete tasks)
- [ ] Completed state is stored in sessionStorage under the key `completed_tasks_week_{weekNum}` as an array of task titles
- [ ] On mount, restore completed state from sessionStorage for the current week number
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-040: "Up Next" — next-week preview card on dashboard
**Description:** As a user, I want to see a quick preview of next week's upcoming tasks so I can buy supplies or plan ahead.

**Acceptance Criteria:**
- [ ] Below the current week's task list, render a "Up Next" section with a heading "Next Week" and the week date range (e.g., "Jun 22–28")
- [ ] Show up to 3 tasks from `week + 1` entry in the plan (if plan has it)
- [ ] Each preview item shows only: category icon + task title (no description, no priority badge, no pet note)
- [ ] Items are displayed as a compact horizontal-scroll chip list or a simple bulleted list
- [ ] If next week has 0 tasks, do not render the section at all
- [ ] If the plan hasn't loaded yet, do not render the section
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-041: Profile page — sync sessionStorage after save
**Description:** As a user who edits my profile (e.g., changes grass type), I want the dashboard to reflect those changes immediately without requiring me to redo onboarding.

**Acceptance Criteria:**
- [ ] In `src/app/profile/page.tsx`, after a successful `saveProfile()` call, also update `onboarding_state` in sessionStorage with the new values: `state`, `grass_type`, `square_footage`, `has_pets`, `sun_exposure`
- [ ] Also delete the stale `cached_plans` DB entry for the old `(state, grass_type)` pair — call a new `DELETE FROM cached_plans WHERE state = $1 AND grass_type = $2` query if the grass_type or zip changed (the `warn` flag is already tracked in state)
- [ ] Add a "Go to dashboard →" link below the Save button that appears after a successful save so users can navigate back
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- FR-1: The `/api/parse-pdf` route must detect stale 12-month cached plans (missing `week` field) and regenerate rather than returning them
- FR-2: The calendar page must render 52-week `WeeklyPlan[]` data grouped by month
- FR-3: All pages must have accessible navigation (header on desktop, bottom tabs on mobile) with active state highlighting
- FR-4: The dashboard must fall back to DB profile when sessionStorage is empty, using `lawn_session_id` from localStorage
- FR-5: A CTA card replaces the empty state when no profile is found in session or DB
- FR-6: Loading state must show cycling text messages during plan generation
- FR-7: Task completion state is persisted in sessionStorage per week number
- FR-8: A next-week preview shows up to 3 task titles after the current task list
- FR-9: Profile saves must sync updated values back to sessionStorage and invalidate the stale cached plan

## Non-Goals

- No server-side rendering of the dashboard (remains a client component)
- No push notifications for upcoming tasks
- No multi-user or team features
- No weather API integration
- No drag-to-reorder tasks
- No Clerk auth integration in this scope (still demo mode)

## Design Considerations

- Bottom tab bar: height ~56px, sticky to bottom, `var(--color-surface)` background, `border-t #2d4a2d`
- Tab icons can be emoji or simple SVG — keep consistent with existing emoji usage in the app
- "Up Next" section should be visually lower-weight than the primary task list (smaller text, muted colors)
- Loading messages should feel reassuring, not technical — no API jargon
- Task checkboxes: 24px circular button, `border #2d4a2d` unchecked, `var(--color-primary)` filled when checked

## Technical Considerations

### Week-to-month grouping for calendar
```ts
function weekToMonth(week: number): number {
  return Math.min(Math.ceil(week / (52 / 12)), 12);
}
```
This maps weeks 1–52 evenly into months 1–12.

### DB cache invalidation in profile save
Profile page already tracks `warn` state (true when grass_type or zip changed). When `warn` is true and save succeeds, issue:
```sql
DELETE FROM cached_plans WHERE state = $1 AND grass_type = $2
```
using the **original** state and grass_type (before the edit). Import `db` from `@/lib/db`.

### sessionStorage key for completed tasks
```
completed_tasks_week_24   // array of task title strings for ISO week 24
```
Use `getISOWeek(new Date())` (same utility from dashboard page) to get the key suffix.

### Layout "use client" impact
Adding `usePathname()` to `layout.tsx` requires `"use client"`. This is fine — the layout is already a thin wrapper with no server-only data needs. Metadata export must move to a separate `src/app/metadata.ts` file if TypeScript complains about mixing server/client exports.

## Success Metrics

- Dashboard shows tasks for Bermudagrass in NC week 24 (should have mowing, watering at minimum)
- Navigating from dashboard → calendar → profile → back works without using the browser back button
- Fresh tab load of `/dashboard` for a returning user shows their plan within 3 seconds (cached) or shows progress animation while generating
- Completed tasks persist when navigating away and returning in the same session

## Open Questions

- Should completed tasks reset at midnight each Sunday (ISO week boundary), or only on next page load when the week number changes?
- Should the bottom tab bar appear on the landing page (`/`) and onboarding pages, or only inside `/dashboard` and `/profile`? (Recommend: hide on `/` and `/onboarding/*`, show only when user has a profile.)
- For US-041 cache invalidation, should we delete the old cached plan immediately on profile save, or only mark it stale so it regenerates lazily on next dashboard visit?
