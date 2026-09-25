# 01 — Product & UI

> **Read this document fully before touching any frontend code.**
> If you are picking this project back up after a break, or moving between phases, re-read this file — do not rely on memory of it from earlier in the build.

---

## 1. Product Definition

**Taj Price Intelligence** is a private, family-oriented web application for discovering, comparing, monitoring, and understanding Taj hotel prices in India for specific travel dates.

Two layers, equally important:

1. **A premium, hospitality-grade user experience** for searching, comparing, and understanding Taj pricing.
2. **A trustworthy price-intelligence pipeline** (covered in `03-DATA-AND-AGENT.md`) that the UI is a window into.

The UI must never present an inferred or hallucinated price as a verified one. Every number on screen must be traceable to a stored observation.

> **The database is the source of truth. The agent acquires and validates. The UI explains. The LLM never invents a price.**

---

## 2. Core User Story

> "For my dates, which Taj hotel is cheapest — and can I trust that number?"

Given check-in, check-out, adults, and rooms, the app must surface:

- Cheapest currently eligible Taj (hotel, city, image, room, rate plan, price/night, total, taxes/fees, meal plan, cancellation policy, availability, **last verified timestamp**)
- A path to drill into: other rooms, other rate plans, price history chart, historical low/high/median, current position in that range, exact past observations with timestamps, data source, and freshness state.

This should feel like a **quiet, premium intelligence product** — not a hotel-booking clone, not a chatbot with a hotel skin.

---

## 3. Product Principles

### 3.1 Accuracy first
Every displayed price carries: dates, occupancy, room, rate plan, currency, base price, taxes/fees (if available), total (if available), availability state, source, fetch timestamp, run ID. Historical observations are never overwritten (see `03-DATA-AND-AGENT.md §Immutable Price History`).

### 3.2 Freshness must be visible
Never let a user assume a stored price is live. States: **Fresh / Recent / Stale / Fetching / Failed / Partially verified.** Always show the timestamp, in plain language ("Verified 2 minutes ago", "Latest observation 18 hours ago") — never hide it behind a generic "Updated".

### 3.3 Compare like with like
A Deluxe + breakfast + flexible-cancellation rate is a different product from a non-refundable room-only rate at the same hotel. Comparisons (results grid, comparison page, history chart) must preserve hotel, room, occupancy, rate plan, meal plan, cancellation policy, dates, and currency — and say so explicitly when two things being shown side by side differ on any of these.

### 3.4 The agent does not invent
Missing value → `null` / "not verified" / "unavailable" in the UI. Never a silently estimated number. If something on screen is an estimate, it is visibly labeled as one.

### 3.5 Never claim "live" unless it is
Use **"Current verified price"** or **"Last verified 4 minutes ago."** Reserve "live" for the exact moment a fresh fetch is streaming in. This single wording rule is one of the biggest trust levers in the product — do not relax it under UI-copy pressure.

---

## 4. Information Architecture

```text
/
├── /search                  Search Taj Hotels
├── /results                 Search Results
├── /hotel/[hotelSlug]
│   ├── Overview
│   ├── Rooms
│   ├── Price History
│   └── Hotel Information
├── /compare                 Hotel Comparison
├── /history                 Saved Searches / Price History
├── /tracked                 Tracked Searches
├── /fetch-runs              Agent Fetch Activity (trust/transparency)
└── /admin                   Hotels · Data Health · Fetch Runs · Agent Errors · Settings
                              (hidden from ordinary family users in a private deployment)
```

---

## 5. Page Specifications

### 5.1 Landing / Search
Primary message: **"Discover the right Taj for your dates."** Search card: check-in, check-out, guests, rooms → **Find Taj Hotels**. Secondary, quiet, below the fold: number of Taj properties monitored, last global refresh, one line on what "price intelligence" means. Visual hierarchy must put the search first — no marketing carousel competing with it.

### 5.2 Results
Header: dates, occupancy, count of properties considered. Then a **large featured "Cheapest Available"** card (image, name, location, room, rate plan, price/night, total, verification time), followed by a grid of all eligible hotels — each card: image, hotel, location, "From ₹XX,XXX", cheapest room + rate condition, a small price-history indicator (sparkline or "↓ near 30D low"), "View details." No visual clutter; not everything needs to be a card with a border.

**Layout:** CSS Grid for page structure (filters rail + content), Flexbox for card internals, one consistent spacing scale, generous whitespace.

### 5.3 Hotel Detail
Order: Hero → current cheapest room → room/rate matrix → price history → historical stats → availability → hotel information → last verification → Fetch latest. Hero: large image, name, city/state, "From ₹XX,XXX / night", "Last verified 4 minutes ago."

**Room/Rate Matrix** (expandable rows):

| Room | Rate | Meal | Cancellation | Nightly | Total |
|---|---|---|---|---:|---:|
| Deluxe | BAR | Room only | Flexible | ₹25,000 | ₹50,000 |
| Deluxe | Breakfast | Breakfast | Flexible | ₹28,000 | ₹56,000 |
| Club | BAR | Room only | Flexible | ₹35,000 | ₹70,000 |

### 5.4 Price History
Headline stats: Current, 30D Low, 30D High, 30D Median. Chart: X = timestamp, Y = price, current point highlighted, high/low markers, hover tooltip, optional range selection, room/rate filter, stay-date filter.

**Hover tooltip must render the exact stored snapshot** — timestamp to the second, price/night, total, room, rate plan, occupancy, dates, meal plan, cancellation policy, verification state, source. Never approximate a tooltip value when an exact one exists.

Visual language for high/low/median/current: subtle horizontal rules + typography, not decoration. No gradients, no shadows (see §7).

### 5.5 Comparison
Side-by-side table (hotel columns): from/night, room, breakfast, cancellation, 30D low, 30D high, last verified. Must preserve like-for-like conditions and flag when it can't.

### 5.6 History / Saved Searches
Each saved search: name, dates, occupancy, current cheapest, historical low, last checked. Actions: open, refresh, delete, view history.

### 5.7 Agent Activity (`/fetch-runs`)
This page exists **for trust, not for developers.** Latest run: started/completed time, properties count, successful/partial/failed counts. Expandable per-hotel log: e.g. "Taj Goa — FETCHED — 31 rooms/rates — Validation passed — Saved 31 snapshots" or "Taj Jaipur — FAILED — Booking flow timeout — Previous data retained." Making the agent observable turns it from "magic" into something a skeptical family member can verify for themselves.

---

## 6. Design System

### 6.1 Direction
Inspired by Taj's warmth, restraint, and heritage — not a generic SaaS dashboard.

**Palette:** deep burgundy/wine, warm ivory, cream, rich brown, muted gold/brass accents, charcoal, warm gray. **Avoid:** blue-white SaaS styling, neon, excessive red, cold grays.

**No gradients.** Richness comes from typography, photography, spacing, borders, color hierarchy, animation, composition.

**No shadows** (`box-shadow`, `drop-shadow`). Depth comes from borders, background contrast, deliberate overlap, typography, spacing, image composition.

**Typography:** use the official Taj-approved typeface where licensing/technical availability permits (`@font-face`) — never silently substitute a look-alike and imply it's the real one. System: Display / Heading / Subheading / Body / Label / Caption / Data. Price numbers get a distinct, highly legible numeric style (tabular figures, consistent digit width) so prices are scannable in a grid.

### 6.2 Animation
Should feel like hospitality: calm, precise, unhurried. Avoid bouncy/spring SaaS effects, rapid movement, gimmicks.
- Page entrance: opacity 0→1, translateY(8px)→0.
- Hotel imagery: very subtle scale, 1.00 → 1.015.
- Results: small staggered reveal.
- Price updates: animate the numeric value on a fresh fetch completing (a gentle count/roll, not a flash).
- Chart: progressive line draw on first appearance.
- Hotel transitions: shared-layout transitions where appropriate.
All animation must respect `prefers-reduced-motion`.

### 6.3 Layout
12-column grid desktop / 8-column tablet / 4-column mobile. Grid for macro layout, flex for micro layout. No arbitrary per-component margins. Spacing scale: 4·8·12·16·24·32·48·64·96·128 — large spacing for editorial sections, small spacing for dense metadata.

### 6.4 Responsive
Desktop: editorial multi-column, large hero imagery, full comparison tables. Tablet: two-column results, collapsible filters. Mobile: single column, sticky search controls, horizontal room/rate scroll where needed, bottom-sheet detail panels, touch-friendly chart interaction. The mobile experience is designed on its own terms, not shrunk from desktop.

### 6.5 Component structure

```text
app/
├── page.tsx  ├── search/  ├── results/  ├── hotel/[slug]/
├── compare/  ├── history/ ├── tracked/  └── fetch-runs/

components/
├── search/   SearchForm, DatePicker, GuestSelector
├── hotels/   HotelCard, HotelHero, HotelGallery, HotelMeta
├── pricing/  PriceDisplay, PriceHistoryChart, PriceStats, RoomRateTable, PriceTooltip
├── agent/    FetchButton, FetchProgress, FetchStatus, AgentRunDetails
└── layout/   Header, Footer, PageContainer
```

### 6.6 Accessibility
Keyboard navigation, visible focus states, semantic headings, accessible chart descriptions (a text summary alongside every chart), color contrast (verify the burgundy/gold palette against WCAG AA, not just against feel), screen-reader labels, `prefers-reduced-motion` support, accessible date pickers, accessible data tables (real `<table>` markup for the room/rate matrix, not divs).

---

## 7. UX Trust Model

Every price card carries its provenance inline, not hidden in a tooltip:

```text
₹24,600 / night
Verified 4 min ago · Official Taj booking data
```

Stale: `Last verified 19 hours ago  [ Fetch latest ]`
Failed: `Latest refresh failed — showing last verified observation`

Silence is the enemy of trust here — always say what state the data is in.

---

## 8. Customer-Experience Enhancements (beyond the base plan)

These raise the product from "accurate" to "delightful" without breaking the restraint of §6, and without adding features the base architecture doesn't already support.

1. **Honest empty & loading states.** No generic spinners. While fetching: "Checking 31 Taj properties across India…" with a live per-hotel checklist (this reuses the Fetch Now progress UI from `03-DATA-AND-AGENT.md §17`, just surfaced earlier on `/results` for a first-time search). If a search predates any cached data, say so plainly rather than showing a blank grid.
2. **"How we get this data" transparency page**, one tap away from any freshness badge — a short, plain-language explanation of the acquisition → validation → storage pipeline, linking to `/fetch-runs`. Builds trust exactly where skepticism naturally arises.
3. **Indian numbering + locale conventions.** Lakh/crore formatting (₹1,25,000, not ₹125,000), IST timestamps everywhere, and date formats matching Indian convention (DD Mon). Small detail, immediate signal that this was built for the actual user, not ported from a US template.
4. **Weekend / long-weekend awareness in the date picker.** Gently highlight Indian public holidays and long weekends in the calendar so a family planning a trip can see cheaper weekday alternatives next to their target dates — sourced from a static holiday list, not invented pricing.
5. **"Resume where you left off."** A saved search remembers scroll position and last-expanded room row when reopened from `/history` — small continuity touch, no new backend concept beyond what `TrackedSearch` already stores.
6. **Shareable, read-only comparison links** for `/compare`, so one family member can send a link to another without needing an account — renders the same like-for-like comparison table server-side from the stored snapshot IDs, so the shared view is exactly reproducible and never re-fetches on open.
7. **Price-position language, not just numbers.** Next to the current price, a short calculated sentence: "This is 6% below the 30-day median" — explicitly labeled as a *calculated statistic* (per `03-DATA-AND-AGENT.md §Historical Analytics`), never conflated with an observed value.
8. **Meal-plan and cancellation as first-class filters**, not buried in the matrix — many families care more about "flexible cancellation" than about ₹500/night, and the base plan's room/rate matrix under-serves that unless it's also a results-page filter.
9. **Calm notification center** (email/WhatsApp — see `06-DEPLOYMENT-AND-OPERATIONS.md`) for tracked searches: one digest per meaningful change, never a notification per fetch run. "Taj Goa dropped ₹3,200 for your dates" is useful; "we checked and nothing changed" is noise.
10. **Graceful degradation copy.** Every failure state (§7) gets human copy, not an error code — e.g. "We couldn't reach Taj's booking system for this property just now. Your last verified price from 19 hours ago is still shown below."

---

## 9. Experience Definition of Done

A family member can, without help:

1. Open the site and search dates/guests.
2. See the cheapest eligible Taj immediately, with a trustworthy timestamp.
3. Understand meal and cancellation terms without opening a modal.
4. Expand a hotel to see other rooms/rates.
5. Open price history, hover an observation, and see exact stored details.
6. See 30D high/low/median and today's position within that range.
7. Tap "Fetch latest prices" and watch real per-hotel progress.
8. Come back later and find the full historical record intact.
9. Know, at every point, whether what they're looking at is fresh, stale, or failed.
