# PRD: Design Polish Sprint

## Introduction

LawnGuide is functionally complete but visually reads as a prototype. This sprint addresses every layer of the UI — from the design token system up through landing page, onboarding, dashboard, and navigation — to bring the product to a shippable quality bar.

Audit was conducted against the live Vercel deployment (https://lawncare-azure.vercel.app) and all source files.

---

## Goals

- Replace all hardcoded hex values with CSS variables for consistency
- Replace emoji icons with SVG icons in navigation and category chips
- Fix touch target sizes to meet 44px minimum
- Make the landing page visually compelling with a product preview section
- Upgrade the onboarding progress indicator to show step numbers
- Improve task card hierarchy so urgent tasks are visually distinct
- Polish grass picker card proportions and selection state
- Add safe-area inset support for iPhone home bar
- Standardize input focus states and form component styling

---

## User Stories

### US-042: Extend design token system — add surface-alt, border, and warning color variables

**Description:** As a developer, I want all hardcoded hex colors moved into CSS variables so the design system is consistent and maintainable.

**Acceptance Criteria:**
- [ ] In `src/app/globals.css` `@theme` block, add:
  - `--color-surface-alt: #132613;` (replaces `#1a3a1a`)
  - `--color-border: #2d4a2d;` (replaces every `#2d4a2d`)
  - `--color-border-strong: #3a5a3a;` (replaces `#3a5a3a` where it appears)
  - `--color-warning-bg: #3d3000;` (replaces `#3d3000`)
  - `--color-warning-border: #6b4c00;` (replaces `#6b4c00`)
  - `--color-warning-text: #eab308;` (replaces `#eab308`)
  - `--color-warning-text-muted: #d4a017;` (replaces `#d4a017`)
  - `--color-urgent: #ef4444;` (replaces hardcoded red)
  - `--color-routine: #eab308;` (replaces hardcoded yellow)
  - `--color-optional: #6b7280;` (replaces hardcoded gray)
- [ ] Do a global search-and-replace in all `src/` files: swap every `#2d4a2d` → `var(--color-border)`, `#3d3000` → `var(--color-warning-bg)`, `#eab308` → `var(--color-warning-text)`, `#d4a017` → `var(--color-warning-text-muted)`, `#6b4c00` → `var(--color-warning-border)`, `#1a3a1a` → `var(--color-surface-alt)`
- [ ] In dashboard priority badge, replace `${PRIORITY_COLORS[...]}22` hex-opacity hack: use `var(--color-urgent)` etc. with `opacity: 0.15` on a wrapper, or use tailwind `bg-red-500/10`-style classes
- [ ] Typecheck passes

---

### US-043: Replace emoji nav icons with inline SVG icons

**Description:** As a user, I want the navigation to look like a professional app, not a prototype, so I trust the product.

**Acceptance Criteria:**
- [ ] Create `src/components/icons.tsx` exporting three minimal SVG icon components: `HomeIcon`, `CalendarIcon`, `ProfileIcon`
  - Each is a functional component accepting `className?: string` and renders a 20×20 viewBox SVG
  - HomeIcon: simple house outline (roof triangle + walls + door)
  - CalendarIcon: rectangle with top bar, two vertical tick marks inside
  - ProfileIcon: circle head + shoulder arc outline
  - All use `currentColor` so color is controlled by the parent's CSS `color` property
- [ ] In `src/app/ClientNav.tsx`, import the three icon components and replace the emoji strings in `NAV_ITEMS` — update the NAV_ITEMS type so `icon` is a React component, not a string
- [ ] Desktop nav: render `<item.Icon className="w-4 h-4 inline-block" />` before the label
- [ ] Mobile bottom tab bar: render `<item.Icon className="w-6 h-6" />` where the emoji span was
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-044: Mobile bottom nav — safe-area padding and active indicator pill

**Description:** As a mobile user, I want the bottom nav to respect the phone's home bar and have a clear active state indicator so I always know where I am.

**Acceptance Criteria:**
- [ ] In `ClientNav.tsx`, update the mobile `<nav>` bottom bar:
  - Add `padding-bottom: env(safe-area-inset-bottom)` via inline style so nav clears the iPhone home bar
  - The nav's total height stays 56px for the visible touch area; the safe-area padding extends it below
  - Update `<main>` bottom padding to `calc(56px + env(safe-area-inset-bottom))` to match
- [ ] Add a visual active indicator to the mobile tab bar: when `isActive` is true, render a small rounded-full pill (width 24px, height 3px, background `var(--color-primary)`) above the icon inside each tab button
- [ ] Desktop nav: add `border-bottom: 2px solid var(--color-primary)` on the active link (in addition to the color change already there)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-045: Onboarding progress bar — add step number label and step count

**Description:** As a user going through onboarding, I want to see which step I'm on (e.g. "Step 2 of 7") so I know how much is left.

**Acceptance Criteria:**
- [ ] Find the progress bar rendering in `src/app/onboarding/[step]/page.tsx`
- [ ] Above the existing bar segments, add: `<p>Step {step} of 7</p>` styled `text-xs text-center mb-2` with `color: var(--color-text-muted)`
- [ ] The 7 bar segments remain unchanged below the label
- [ ] The step number comes from the URL param already available on that page
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-046: Task card priority — left accent border for urgent tasks

**Description:** As a user, I want urgent tasks to visually pop so I immediately know what needs to happen this week without reading every badge.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, update each task card `<div>`:
  - When `task.priority === "urgent"`: add `border-l-4` (4px left border) in `var(--color-urgent)` (`#ef4444`), and reduce the main border to 1px only on the right/top/bottom sides using `border-l-[4px]` + `border` combo — i.e. use `style={{ ...existing, borderLeftColor: 'var(--color-urgent)', borderLeftWidth: '4px' }}`
  - When `task.priority === "routine"`: left border 4px in `var(--color-routine)` (`#eab308`)
  - When `task.priority === "optional"`: left border remains default (`var(--color-border)`) at 1px
- [ ] The priority badge pill is removed from the card header (it's now redundant with the border color)
- [ ] This makes urgent cards immediately scannable without reading badges
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-047: Task check-off button — larger touch target (44px)

**Description:** As a mobile user, I want the task check button to be easy to tap so I don't miss it on a small screen.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, change the check button from `w-6 h-6` (24px) to `w-8 h-8` (32px) with a transparent hit-area wrapper of `w-11 h-11` (44px) using negative margin to not change layout
  - Approach: wrap the `<button>` in a `<div className="-m-1.5">` to extend the clickable area; button itself goes to `w-8 h-8`
  - OR: add `padding: 10px; margin: -10px` to the button itself so the touch target is 44px but the visual circle is 32px
- [ ] The checkmark renders centered inside the 32px circle
- [ ] Verified tap area is comfortable on mobile
- [ ] Typecheck passes

---

### US-048: Grass picker — square photo cards and stronger selected state

**Description:** As a user identifying my grass, I want the photo cards to show more of the grass texture and have a clear selection ring so I can compare and choose confidently.

**Acceptance Criteria:**
- [ ] In `src/app/onboarding/[step]/steps/Step4.tsx`, change the photo container from `aspect-video` to `aspect-square` so photos are square — this shows more detail in the grass texture
- [ ] Selected card: add a visible ring using `box-shadow: 0 0 0 3px var(--color-primary)` (in addition to border color change) so the selection is unmissable
- [ ] Non-selected card: keep 1px border at `var(--color-border)`; add a subtle hover state: `opacity: 0.9` on hover via Tailwind `hover:opacity-90`
- [ ] Photo credit text: bump from 10px to `text-xs` (12px) and remove the `opacity: 0.6` — it's unreadable at its current size/opacity
- [ ] Add a third trait chip showing the `activeSeason === "warm" ? "🌞 Warm season" : "❄️ Cool season"` (already exists) AND the texture: `grass.texture === "soft" ? "Soft texture" : grass.texture === "stiff" ? "Stiff texture" : "Rough texture"`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-049: Input focus states — visible focus ring on all form inputs

**Description:** As a user filling out forms, I want a visible focus ring on inputs so I know which field is active (also required for keyboard accessibility).

**Acceptance Criteria:**
- [ ] In `src/app/globals.css`, add a global focus-visible rule:
  ```css
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  ```
- [ ] Remove the `outline-none` class from all `<input>` and `<select>` elements in `src/app/onboarding/[step]/steps/Step1.tsx` and `src/app/profile/page.tsx` (since we now handle focus via globals.css instead)
- [ ] Verify the focus ring appears on: ZIP input (onboarding step 1), grass type select (profile), ZIP input (profile), square footage input (profile)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-050: Landing page — add "Your plan looks like this" product preview section

**Description:** As a visitor on the landing page, I want to see what the app actually looks like so I understand what I'm getting before I start onboarding.

**Acceptance Criteria:**
- [ ] Add a new section between the "Why LawnGuide?" section and "How it works" section in `src/app/page.tsx`
- [ ] Section heading: `"Your personalized weekly plan"` (text-2xl font-bold, centered, `var(--color-text-primary)`)
- [ ] Section background: `var(--color-background)` (same as page bg, no alternating strip)
- [ ] Below the heading, render 2 hardcoded mock task cards (not real data) representing what the dashboard looks like:
  - Card 1 (urgent): left border 4px `#ef4444`, title "Apply pre-emergent herbicide", category icon 🐛, description "Apply 0.10 lbs per 1,000 sq ft before soil hits 55°F. Prevents crabgrass germination.", priority "urgent" badge
  - Card 2 (routine): left border 4px `#eab308`, title "Mow at 3.5 inches", category icon 🌿, description "Raise mowing height to reduce stress during heat. Never remove more than 1/3 of the blade.", priority "routine" badge
- [ ] Each mock card uses the same rounded-lg p-4 border styling as the real task cards in `dashboard/page.tsx`
- [ ] Below the cards, add a muted note: `"Your plan includes 52 weeks of tasks tailored to your grass and climate."` (text-sm, centered, `var(--color-text-muted)`)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-051: Landing page — replace emoji feature icons with emoji + label chip style

**Description:** As a visitor, I want the feature cards to feel more intentional and branded so the landing page reads as a polished product.

**Acceptance Criteria:**
- [ ] In `src/app/page.tsx`, update the 3 feature cards:
  - Add a `text-4xl` emoji at top (already present — keep it)
  - Below the emoji, before the title, add a small colored label chip: `<span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>{"Feature"}</span>`
  - The chip text: "Zone-aware", "Grass-specific", "Pet-safe" (replaces current title since it becomes the chip)
  - Title becomes a full sentence: "Calibrated to your growing zone", "Matched to your exact grass", "Flags every chemical near your pets"
  - Description stays as-is
- [ ] Feature cards gain a subtle top gradient bar (4px tall, full card width, `background: var(--color-primary)`, `border-radius: 12px 12px 0 0`) as a color accent at the top of each card
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-052: Dashboard — personalized header ("Week 24 · Bermudagrass · NC")

**Description:** As a user on the dashboard, I want the header to tell me exactly what I'm looking at — my grass, my state, and my week — so the page feels personal, not generic.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, update the header block:
  - Change heading from `"Right Now"` to `"Week {currentWeek}"` (e.g. "Week 24") in `text-2xl font-bold`
  - Add subtitle line: `"{grassName} · {stateCode} · {weekRange}"` (e.g. "Bermudagrass · NC · Jun 9 – Jun 15") in `text-sm` with `var(--color-text-muted)`
  - If `grassName` is empty (onboarding gate state), subtitle is hidden
- [ ] The pre-emergent banner still appears above the header when active
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-053: Dashboard — "Up Next" card visual separation and task count badge

**Description:** As a user, I want the "Up Next" preview to feel clearly distinct from the current week's tasks so I don't confuse them.

**Acceptance Criteria:**
- [ ] In `src/app/dashboard/page.tsx`, update the "Up Next" card:
  - Add a thin top divider line (`<hr style={{ borderColor: 'var(--color-border)' }} />`) before the Up Next card
  - Add `"UPCOMING"` label in `text-[10px] font-semibold uppercase tracking-widest` with `var(--color-text-muted)` above the "Up Next" heading
  - If `nextWeekTasks.length > 3` (currently we slice to 3 in state): add `"+ {remaining} more tasks"` line at the bottom in `text-xs` `var(--color-text-muted)` — note current code always slices to 3, so add a `nextWeekTotalCount` state variable alongside `nextWeekTasks` to track the full count before slicing
- [ ] "Up Next" heading changes to `text-base font-semibold` (slightly larger than current `text-sm`)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-054: Profile page — prevent layout shift on sun button border-width change

**Description:** As a user selecting sun exposure on the profile page, I want the buttons to not jump/shift when I select one, which currently happens because the border width changes from 1px to 2px.

**Acceptance Criteria:**
- [ ] In `src/app/profile/page.tsx`, update the Sun Exposure button group:
  - All buttons always use `borderWidth: "2px"` (never 1px)
  - Inactive state: `borderColor: "var(--color-border)"` (was `#2d4a2d`)
  - Active state: `borderColor: "var(--color-primary)"`
  - Apply the same fix to the Pets Yes/No buttons (also have the 1px → 2px shift bug)
- [ ] No layout shift when clicking between options
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Non-Goals

- No dark/light mode toggle (app is dark-only)
- No animation library (stick to CSS transitions and Tailwind)
- No illustration library or external icon packages (inline SVGs only per US-043)
- No redesign of page structure — these are polish improvements within the existing layouts
- No new pages

## Technical Considerations

- US-042 must be done first — subsequent stories reference the new CSS variables
- US-043 (SVG icons) requires creating `src/components/icons.tsx` — a new file
- `env(safe-area-inset-bottom)` in US-044 requires no special package — it's a native CSS env variable supported in all modern browsers
- For US-047 touch target: use the negative-margin wrapper pattern; do not change the button's visual circle size beyond `w-8 h-8` or it looks too large on desktop

## Success Metrics

- No hardcoded hex colors outside of `globals.css`
- All interactive elements have minimum 44×44px touch targets on mobile
- Navigation looks like a product, not a prototype (SVG icons, active indicator)
- Landing page communicates what the product does without requiring the user to read every word
