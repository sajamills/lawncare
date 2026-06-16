# Deferred UI Stories

These stories were removed from the active `prd.json` execution queue. They are not complete. Each has a specific unresolved blocker that must be addressed before implementation.

---

## US-016 — Create /about page and add footer to landing page

**Status:** Deferred — placeholder contact info  
**Blocker:** The acceptance criteria contain `[contact email placeholder]`. Fabricated contact information must not ship. The footer links (FAQ / About / Privacy) may be added once a real contact address is provided and the About page content is confirmed accurate.

**Original description:** As a Facebook visitor, I want to find out who built LawnGuide and why, so I can decide whether to trust it with my lawn.

**Acceptance criteria (original — do not implement as-is):**
- Create `src/app/about/page.tsx` as a server component
- Heading: "About LawnGuide" with three sections: (1) What is LawnGuide?, (2) How recommendations are generated, (3) Contact — "Questions or feedback? Email us at [contact email placeholder]."
- Max-width container: `max-w-2xl mx-auto px-6 py-12`
- Add footer to `src/app/page.tsx` with links to /faq, /about, /privacy
- Typecheck passes; verify in browser

**To unblock:** Provide a real contact address and confirm the company/creator information to display.

---

## US-017 — Create /privacy page explaining data storage

**Status:** Deferred — inaccurate storage model  
**Blocker:** The drafted privacy language states data is "stored in your browser's local and session storage" and "there is no account to delete." This conflicts with the Clerk authentication integration (US-055–056) and the server-side `users` table (US-057) which stores `clerk_user_id`, `email`, and `subscription_status`. The actual storage model is server-side. This page must accurately describe Clerk auth, what is stored on the server, and the user's deletion rights.

**Original description:** As a user, I want to understand what data LawnGuide stores and where so I can make an informed decision.

**Acceptance criteria (original — do not implement as-is):**
- Create `src/app/privacy/page.tsx` as a server component
- Sections: What we collect, Where it's stored, Plan generation, Analytics, Deleting your data
- Current drafted language incorrectly describes local-only storage

**To unblock:** Confirm the production data model — what is stored where (Clerk, Neon DB, sessionStorage, localStorage), for how long, and what the deletion path is for authenticated and anonymous users. Rewrite acceptance criteria to match reality.

---

## US-021 — Add "See a sample plan" link on landing page

**Status:** Deferred — hardcoded treatment recommendations + unverified citation  
**Blocker:** Two issues:
1. The acceptance criteria call for hardcoded task cards (pre-emergent herbicide, mow at 1.5 inches, aerate) that are lawn treatment recommendations. These are not derived from verified plan data and could give incorrect guidance to users.
2. `"Source: University of Georgia Extension, Bermudagrass Lawn Care Calendar"` is an unverified citation — the actual URL and publication title have not been confirmed to exist and link correctly.

**Original description:** As a first-time visitor, I want to see what a real plan looks like before entering my information.

**Acceptance criteria (original — do not implement as-is):**
- Create `src/app/sample/page.tsx` with 3 hardcoded task cards
- Include source attribution to UGA Extension
- Add "See a sample plan first" link below hero CTA

**To unblock:** After US-002 (plan diagnosis) confirms what a real generated plan looks like, either: (a) use a real plan excerpt cached from a known-good generation run, or (b) use clearly mock data with no source attribution and a prominent "This is a fictional example" label. The UGA citation must be verified as a real, accessible URL before use.

---

## US-025 (original) — Add hero mini-cards showing mock task recommendations

**Status:** Deferred — hardcoded treatment recommendations in hero  
**Blocker:** The original story called for adding `MOCK_TASKS` (pre-emergent herbicide, mow at 3.5 inches) as mini-cards in the hero section. These are hardcoded treatment recommendations. The product preview section below the hero already shows the same mock tasks, so adding them again in the hero duplicates unverified advice content.

**Note:** The safe portion of this story (reducing hero `pt-20` to `pt-12`) has been retained as the active US-025 in `prd.json`.

**To unblock:** After US-002 resolves what real plan output looks like, decide whether the hero should show a real plan excerpt, a clearly-labeled mockup, or no task preview at all. Update the acceptance criteria accordingly.
