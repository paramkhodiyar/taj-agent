# Taj Price Intelligence — Build Phases

## How to use this file

This is the execution plan. The six documents in `docs/` are the source of truth; this file only sequences them into buildable phases. Each phase below opens with a **📖 Required reading** block and closes with a **✅ Phase gate** — do not skip either, even if you (or the coding agent driving this build) already read the docs earlier in the session. Context gets lossy over a long build; the repetition is deliberate.

**Standing rule, repeated at every phase, not just this once:**

> Never fabricate a price. Never overwrite a historical observation. If the agent can't get a value, the value is `null`/`unavailable`, not an estimate. When in doubt, re-open `docs/03-DATA-AND-AGENT.md` before writing the code, not after.

---

## Phase 0 — Foundations & Doc Alignment

📖 **Required reading:** `docs/02-SYSTEM-ARCHITECTURE.md` (all), `docs/03-DATA-AND-AGENT.md` §1–2 (agent pipeline shape), `docs/06-DEPLOYMENT-AND-OPERATIONS.md` §1 (deployment shape).

**Do:**
- Set up the repo skeleton (Next.js app, Express/TS backend or Next API routes, Prisma).
- Stand up PostgreSQL (local + a managed target per `06-DEPLOYMENT-AND-OPERATIONS.md`).
- Set up environment/secrets scaffolding per `04-API-AND-SECURITY.md §3`.
- No feature code yet — this phase produces a runnable empty skeleton.

✅ **Phase gate:** repo boots, DB connects, no schema yet. Before Phase 1, re-open `docs/03-DATA-AND-AGENT.md §6, §8, §15` (the schema sections) — do not draft the schema from memory.

---

## Phase 1 — Data Foundation

📖 **Required reading (again):** `docs/03-DATA-AND-AGENT.md` §6 (PriceSnapshot), §7 (Immutable Price History), §8 (FetchRun), §15 (schema/entities), §16 (HotelAsset).

**Do:**
- Implement the Prisma schema: `Hotel, HotelAsset, Room, RatePlan, Search, SearchHotel, FetchRun, FetchRunHotel, PriceSnapshot, AvailabilitySnapshot, TrackedSearch, AgentEvent, AgentError` (SourceDocument/RagChunk can wait for Phase 8).
- Seed the canonical Taj property catalog (Property Resolver's data source, `03-DATA-AND-AGENT.md §3.1`).
- Write DB-level or ORM-level guarantees against overwriting a `PriceSnapshot` row (append-only by construction, not just by convention).

✅ **Phase gate:** a manual insert of two snapshots for the same hotel/room/rate at different timestamps produces two rows, never one. If this isn't true, do not proceed — go back to §7 of doc 03.

---

## Phase 2 — Agent Core v1

📖 **Required reading:** `docs/03-DATA-AND-AGENT.md` §1–5, §9–10, §13 (full agent pipeline, extractors, validation, error handling). `docs/04-API-AND-SECURITY.md` §2 (Agent Internal API function boundaries).

**Do:**
- Implement `resolve_property()`, `fetch_booking_inventory()`, `extract_rooms()/extract_rates()`, `normalize_inventory()`, `validate_inventory()`, `persist_snapshot()` as separate, independently testable functions — not one handler.
- It is acceptable for the first Booking Fetcher implementation to be manual/semi-automated (even a documented manual-entry fallback) as long as the pipeline shape, validation, and immutable persistence around it are real from day one.
- Implement the validation engine rules from §9 and the `VERIFIED/PARTIALLY_VERIFIED/ANOMALOUS/FAILED/UNAVAILABLE` states from §10.

✅ **Phase gate:** a simulated fetch failure leaves prior snapshots untouched and produces a `FAILED` state, not a gap or an overwrite. Re-read `docs/05-TESTING-AND-RELIABILITY.md §1–4` before writing the first tests for this phase.

---

## Phase 3 — API Layer

📖 **Required reading:** `docs/04-API-AND-SECURITY.md` (all).

**Do:**
- Implement the public API surface exactly as listed in §1 of doc 04 — resist adding endpoints not covered there without first deciding deliberately, not accidentally, to extend the doc.
- Implement rate limiting on `/searches/:id/fetch`, input validation on all routes, and admin-route restriction.

✅ **Phase gate:** every endpoint has input validation and the fetch-triggering endpoint is rate-limited. Before Phase 4, re-open `docs/01-PRODUCT-AND-UI.md §1–5` — you're about to build the UI these endpoints serve.

---

## Phase 4 — Consumer UI v1: Search & Results

📖 **Required reading:** `docs/01-PRODUCT-AND-UI.md` §1–5.2, §6 (design system). `docs/02-SYSTEM-ARCHITECTURE.md §5` (query strategy — DB-first).

**Do:**
- Landing/search page, Results page with the featured "Cheapest Available" card and the full results grid.
- Apply the design system (palette, no gradients/shadows, typography, spacing scale) from the start — retrofitting it later is more expensive than building it in.
- Wire results to the DB-first query strategy; do not trigger the agent on a normal search.

✅ **Phase gate:** a cold search with no cached data shows an honest empty/loading state (`01-PRODUCT-AND-UI.md §8.1`), not a blank screen or a fabricated placeholder price.

---

## Phase 5 — Hotel Detail, Room/Rate Matrix, Price History

📖 **Required reading:** `docs/01-PRODUCT-AND-UI.md §5.3–5.4`. `docs/03-DATA-AND-AGENT.md §14` (Historical Analytics + integrity rule).

**Do:**
- Hotel detail page, expandable room/rate matrix, the price history chart with exact-snapshot hover tooltips (never approximate a tooltip value).
- Implement 30D low/high/median as real SQL aggregates, visibly distinguished in the UI from observed values and current value.

✅ **Phase gate:** hovering any chart point shows the exact stored `PriceSnapshot` fields, and a comparison across a rate-plan change is visibly flagged, not silently plotted as one continuous trend. Re-read `docs/03-DATA-AND-AGENT.md §12` before Phase 6 — Fetch Now must never destroy what this phase just built.

---

## Phase 6 — Fetch Now UX & Agent Activity

📖 **Required reading:** `docs/03-DATA-AND-AGENT.md §12` (Fetch Now flow). `docs/01-PRODUCT-AND-UI.md §5.7, §7` (Agent Activity page, UX Trust Model).

**Do:**
- Wire the Fetch Now button to `POST /searches/:id/fetch`, with live per-hotel progress in the UI.
- Build `/fetch-runs` as a genuine trust/transparency page, not a dev-only log dump.
- Implement all freshness states (`03-DATA-AND-AGENT.md §18`) with the exact-timestamp copy from `01-PRODUCT-AND-UI.md §7`.

✅ **Phase gate:** triggering Fetch Now, then killing the agent mid-run, leaves the UI in an honest "failed / previous data retained" state — never a stuck spinner, never silently-updated numbers.

---

## Phase 7 — Reliability Hardening

📖 **Required reading:** `docs/05-TESTING-AND-RELIABILITY.md` (all).

**Do:**
- Build the golden-data fixture suite (§3), the malformed-price-format tests (§1), and the regression harness (§2).
- Implement anomaly-swing detection and duplicate-detection tests explicitly, not just informally observed behavior.
- Add the "never say live unless it's live" copy check as a lint/CI step if practical.

✅ **Phase gate:** CI fails if a new extractor version breaks a golden fixture. Re-open `docs/03-DATA-AND-AGENT.md §11` and `docs/06-DEPLOYMENT-AND-OPERATIONS.md §2` before Phase 8 — you're about to automate scheduling.

---

## Phase 8 — Compare, Tracked Searches, Scheduling

📖 **Required reading:** `docs/01-PRODUCT-AND-UI.md §5.5–5.6`, `docs/03-DATA-AND-AGENT.md §11`, `docs/06-DEPLOYMENT-AND-OPERATIONS.md §2–3`.

**Do:**
- Comparison page (like-for-like enforced), `/history` saved searches, `/tracked` tracked searches.
- Scheduled collection (cron → tracked searches → agent), and the notification digest (meaningful-change-only, per `06-DEPLOYMENT-AND-OPERATIONS.md §3`).

✅ **Phase gate:** a tracked search accumulates real historical snapshots over several scheduled runs without any manual intervention, and the family receives at most one digest per meaningful change.

---

## Phase 9 — Deployment & Observability

📖 **Required reading:** `docs/06-DEPLOYMENT-AND-OPERATIONS.md` (all, again — the operational sections matter more once real scheduling is live than they did in Phase 0).

**Do:**
- Deploy agent workers separately from the web app.
- Stand up monitoring/alerting per §5, and the runbooks in §7 as living documents (update them the first time you actually use one).

✅ **Phase gate:** an operator can answer "is the system healthy right now?" from `/admin/data-health` and `/fetch-runs` alone, without reading raw logs.

---

## Phase 10 — Agentic AI (Phase-2 features)

📖 **Required reading:** `docs/02-SYSTEM-ARCHITECTURE.md §4` (RAG vs. structured), `docs/04-API-AND-SECURITY.md §4` (agentic examples).

**Do:**
- Intent router, RAG for hotel/amenity information only, natural-language search and "why did this change" explanations.
- Every explanation must separate observed fact from interpretation, per `04-API-AND-SECURITY.md §4`.

✅ **Phase gate:** asking "which Taj is cheapest for my dates" produces an answer with zero LLM arithmetic in the critical path — confirm by tracing the actual query, not by trusting the answer looked right.

---

## Phase 11 — Customer-Experience Polish

📖 **Required reading:** `docs/01-PRODUCT-AND-UI.md §8` (Customer-Experience Enhancements) and §9 (Experience Definition of Done) — read these last, once the core is real, so the polish sits on top of accurate data rather than papering over gaps.

**Do:**
- Work through the CX enhancement list in doc 01 §8 one at a time: transparency page, Indian locale formatting, holiday-aware date picker, resume-where-you-left-off, shareable comparison links, price-position language, meal/cancellation filters, notification calm-down, graceful-degradation copy.
- Run the full Experience Definition of Done checklist (doc 01 §9) end-to-end as a real family member would, not as a developer who knows where everything is.

✅ **Phase gate:** every item in `01-PRODUCT-AND-UI.md §9` passes for someone who has never seen the app before.

---

## Closing checkpoint

Before calling any release "done," re-open **all six documents once more**, in order, and confirm nothing in the shipped code contradicts them. This full re-read is not optional ceremony — it is the last, cheapest place to catch a quiet violation of the one rule the whole project exists to protect: **the database is the source of truth, the agent verifies, the LLM never invents a price.**
