# PRD: AI Plan V2 — Weekly Tasks, Grass Photos, Pre-Emergent Timing

## Introduction

Three interconnected enhancements to the AI lawn plan builder:

1. **52-week plan generation** — the AI produces week-by-week tasks (not just monthly), and the dashboard's "Right Now" card uses the current calendar date to show exactly the right tasks for this week.
2. **Real grass photos** — the onboarding grass-type picker gets actual photos so users can visually confirm their grass species before selecting.
3. **Soil-temp pre-emergent timing** — hardcoded average soil-temperature windows per state drive a dashboard banner that alerts users when their spring or fall pre-emergent application window is approaching or active, plus well-timed tasks in the weekly plan.

## Goals

- Replace the 12-month plan with a 52-week plan so tasks are date-precise rather than month-approximate
- Surface the current week's tasks on the dashboard using today's actual date
- Add photos to the onboarding grass picker so users stop guessing at grass IDs
- Alert users 2–3 weeks before and during their pre-emergent window with a persistent banner and a correctly-timed task in the plan

## User Stories

---

### US-026: Soil temperature pre-emergent data by state
**Description:** As a developer, I need a data file mapping each US state to its average spring and fall pre-emergent application windows so the banner and plan can use accurate timing without any external API.

**Acceptance Criteria:**
- [ ] Create `src/data/preemergent-windows.ts`
- [ ] Export a `PREEMERGENT_WINDOWS` map keyed by two-letter state code (e.g. `"NC"`)
- [ ] Each entry has `spring: { startDate: "MM-DD", endDate: "MM-DD" }` and `fall: { startDate: "MM-DD", endDate: "MM-DD" }` representing the typical date range when soil hits the target temp (50°F spring, 70°F fall) for that state
- [ ] Export a `getPreemergentWindow(state: string)` function that returns the entry or `null` for unknown states
- [ ] Cover all 50 US states (use USDA plant hardiness zone data as reference for grouping)
- [ ] Typecheck passes

---

### US-027: Upgrade API to 52-week plan generation
**Description:** As a developer, I need the `/api/parse-pdf` route to return a 52-week plan instead of a 12-month plan so the dashboard can show week-precise tasks.

**Acceptance Criteria:**
- [ ] Update `MonthlyPlan` → `WeeklyPlan` interface: `{ week: number; tasks: WeeklyTask[] }` where `week` is 1–52
- [ ] Update the Claude system prompt to request 52 entries (weeks 1–52) instead of 12 months
- [ ] The prompt must tell Claude to factor in the `state` and `grassType` for seasonally correct timing
- [ ] The response JSON array has exactly 52 entries; weeks with no tasks have `tasks: []`
- [ ] Update the DB cache `INSERT` and `SELECT` to store the new format (add `ON CONFLICT` upsert so old cached 12-month plans are replaced on next fetch)
- [ ] The route still accepts `{ state, grassType }` — `pdfUrl` becomes optional (empty string is valid and skips fetching external content; Claude generates the plan from its own knowledge)
- [ ] Typecheck passes

---

### US-028: Dashboard "This Week" card using current date
**Description:** As a user, I want the dashboard to show me exactly what I should be doing on my lawn this week — not just this month — based on today's date.

**Acceptance Criteria:**
- [ ] Dashboard calls `/api/parse-pdf` and receives the 52-week plan
- [ ] Calculate the current ISO week number from `new Date()` (week 1 = first week of January)
- [ ] Display the matching week's tasks in the "Right Now" section
- [ ] If the week has no tasks, show the existing empty-state message ("Nothing urgent this week…")
- [ ] The subtitle updates to show the week range (e.g., "June 9–15") instead of just the month name
- [ ] Tasks sort urgent → routine → optional as before
- [ ] Pet safety notes still display when `has_pets` is true
- [ ] The `sqFt` quantity-scaling logic is preserved
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-029: Pre-curate grass type photo URLs
**Description:** As a developer, I need the `grassTypes` data to include real, publicly accessible photo URLs so the onboarding picker can display them without an API call at runtime.

**Acceptance Criteria:**
- [ ] Update `src/data/grass-types.ts` — replace the `/images/grass/*.jpg` placeholder `photoUrl` values with real CDN URLs for each of the 10 grass types
- [ ] Use **either** Pexels or Unsplash static CDN URLs — pick whichever has a suitable photo for each type (see Technical Considerations for URL format)
- [ ] Photos must clearly show the grass blade texture/color characteristic of the species (not generic lawn photos)
- [ ] All 10 grass types must have a working URL
- [ ] Add a `photoCredit: string` field to the `GrassType` interface (e.g., `"Photo by Jane Doe on Pexels"`) for attribution
- [ ] Typecheck passes

---

### US-030: Grass photo picker in onboarding
**Description:** As a new user selecting my grass type, I want to see a real photo of each grass variety so I can confidently identify mine before picking.

**Acceptance Criteria:**
- [ ] Find the onboarding grass-type selection step (check `src/app/onboarding/[step]/steps/` — likely Step2 or Step3)
- [ ] Replace the text-only list with a card grid showing: grass photo (top half), name + 2–3 trait badges (bottom half)
- [ ] Cards are 2-column on mobile, 3-column on desktop
- [ ] Selected card gets a green border highlight matching `var(--color-primary)`
- [ ] Photos load with a skeleton placeholder while loading (use `next/image` with `fill` or `width/height`)
- [ ] Photo credit text is visible (small, muted) below each photo or in a footer line
- [ ] Tapping/clicking a card selects that grass type and enables the Continue button
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-031: Pre-emergent timing banner on dashboard
**Description:** As a user, I want to see a prominent alert when my pre-emergent application window is 3 weeks away or currently active so I don't miss the critical timing window.

**Acceptance Criteria:**
- [ ] On the dashboard, after loading the user's state from `sessionStorage`, call `getPreemergentWindow(state)` to get the windows
- [ ] Compute whether today falls within 21 days before, or during, either the spring or fall window
- [ ] If yes, render a banner above the task list with:
  - Icon (🌱 for spring, 🍂 for fall)
  - Headline: "Pre-Emergent Window: X weeks away" or "Pre-Emergent Window: Active Now"
  - Sub-line: "Apply when soil temp reaches 50°F (spring) or 70°F (fall). Typical window for [State]: [start date] – [end date]"
  - A dismiss button that hides the banner for the current session (sessionStorage flag)
- [ ] Banner uses a yellow/amber warning color scheme (`#3d3000` background, `#eab308` text — matching existing pet warning style)
- [ ] If no window is imminent, no banner is shown
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- FR-1: The 52-week plan API must return exactly 52 week entries (weeks 1–52), each with a task array
- FR-2: The dashboard uses ISO week number derived from `new Date()` to select the current week's tasks
- FR-3: The `pdfUrl` parameter in the API is optional — omitting it causes Claude to generate the plan from built-in knowledge
- FR-4: All 10 grass types in `grass-types.ts` must have valid photo CDN URLs and attribution strings
- FR-5: Onboarding grass picker renders a photo card grid, not a text list
- FR-6: Pre-emergent windows are defined for all 50 states in `src/data/preemergent-windows.ts`
- FR-7: Dashboard shows a banner when within 21 days of (or currently inside) a spring or fall pre-emergent window
- FR-8: Banner is dismissable and suppressed for the rest of the session after dismissal
- FR-9: Pet safety notes and square footage quantity scaling are preserved in the new 52-week dashboard view

## Non-Goals

- No live soil temperature API integration (hardcoded averages only)
- No changes to the calendar page (`/dashboard/calendar`) — it may temporarily break with the new 52-week format; that's acceptable for this PRD scope
- No Pexels or Unsplash API key required at runtime (photo URLs pre-curated at build time)
- No user ability to manually set their own soil temperature reading
- No push notifications for pre-emergent windows

## Design Considerations

- Match existing dark green theme (`var(--color-surface)`, `var(--color-primary)`, `var(--color-text-muted)`)
- Banner style: amber/yellow, same as existing pet safety warning (`background: #3d3000`, `color: #eab308`)
- Photo cards: rounded corners, consistent with existing card style (`rounded-lg p-4 border`)
- Week range subtitle (e.g., "June 9–15") computed from the ISO week number and year

## Technical Considerations

### ISO week number utility
```ts
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
```

### Photo URL formats
- **Pexels static CDN:** `https://images.pexels.com/photos/[PHOTO_ID]/pexels-photo-[PHOTO_ID].jpeg?auto=compress&cs=tinysrgb&w=640`
  - Attribution: "Photo by [Photographer] on Pexels" (required by Pexels license)
- **Unsplash static CDN:** `https://images.unsplash.com/photo-[ID]?w=640&q=80`
  - Attribution: "Photo by [Photographer] on Unsplash" (required by Unsplash license)
- Either is acceptable — pick whichever has the better photo for each grass type. Mix and match sources across the 10 grass types as needed.
- Use `next/image` with `unoptimized={false}` — add the CDN hostnames to `next.config.ts` under `images.remotePatterns`

### Pre-emergent window date ranges by climate zone (reference for US-026)
Group states by zone for consistency:
- Deep South (FL, GA, AL, MS, LA): Spring Feb 15 – Mar 15 / Fall Sep 15 – Oct 15
- Mid-South (NC, SC, TN, AR, TX-south): Spring Mar 1 – Apr 1 / Fall Sep 15 – Oct 15
- Transition zone (VA, KY, MO, OK, TX-north): Spring Mar 15 – Apr 15 / Fall Sep 1 – Oct 1
- Mid-Atlantic / Midwest (MD, DE, PA, OH, IN, IL, KS): Spring Apr 1 – May 1 / Fall Aug 15 – Sep 15
- Northeast (NY, NJ, CT, MA, RI, VT, NH, ME): Spring Apr 15 – May 15 / Fall Aug 1 – Sep 1
- Upper Midwest (MI, WI, MN, ND, SD, IA, NE): Spring May 1 – Jun 1 / Fall Aug 1 – Sep 1
- Pacific Coast (CA-south, AZ, NV): Spring Feb 1 – Mar 1 / Fall Oct 1 – Nov 1
- Northwest (OR, WA, CA-north): Spring Mar 15 – Apr 15 / Fall Sep 15 – Oct 15
- Mountain (CO, UT, ID, WY, MT): Spring May 1 – Jun 1 / Fall Aug 1 – Sep 1
- Hawaii / Alaska: Adjust accordingly

### DB cache compatibility
The existing `cached_plans` table stores `parsed_plan` as JSONB. The upsert in the route already uses `ON CONFLICT (state, grass_type) DO UPDATE SET parsed_plan = EXCLUDED.parsed_plan` — no schema migration needed, old 12-month entries will be overwritten on next fetch.

### next.config.ts image domains
After picking photo hosts, add to `next.config.ts`:
```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.pexels.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
}
```

## Success Metrics

- Users can see week-specific tasks on the dashboard without scrolling through a full monthly plan
- Pre-emergent banner appears correctly for a test user in NC in early March
- Grass photo picker loads photos for all 10 species without broken images
- Onboarding completion rate does not decrease (photos help, not hurt, selection confidence)

## Open Questions

- Should the 52-week plan's week numbers align to ISO week (Monday start) or Sunday-start weeks? Recommend ISO week for consistency with the utility function above.
- The `/dashboard/calendar` page currently renders 12-month data — it will break with the new 52-week format. Should we update it in this PRD scope or file a follow-up? Recommend follow-up since the user did not mention it.
- Pexels vs Unsplash: up to the implementer per grass type. Document the chosen source in `photoCredit` field.
