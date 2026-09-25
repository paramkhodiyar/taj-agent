# 04 — API & Security

> **Read this document before adding or changing any endpoint.** Every endpoint you add must fit the shape below or have a deliberate reason not to — don't grow the API ad hoc. Re-read `03-DATA-AND-AGENT.md §Confidence / Verification State` before writing anything that touches a fetch or price endpoint.

---

## 1. Public API Structure

```text
GET    /api/hotels
GET    /api/hotels/:slug

POST   /api/searches
GET    /api/searches/:id
GET    /api/searches/:id/results
GET    /api/searches/:id/history
POST   /api/searches/:id/fetch

GET    /api/fetch-runs/:id

GET    /api/hotels/:id/rooms
GET    /api/hotels/:id/price-history

POST   /api/tracked-searches
GET    /api/tracked-searches
DELETE /api/tracked-searches/:id
```

Keep this surface small and boring. Almost everything the frontend needs is a read from PostgreSQL (`02-SYSTEM-ARCHITECTURE.md §Query Strategy`) — only `/searches/:id/fetch` triggers the agent.

---

## 2. Agent Internal API

Keep agent operations as discrete, testable functions — not one giant handler:

```text
resolve_property()
fetch_booking_inventory()
extract_rooms()
extract_rates()
normalize_inventory()
validate_inventory()
persist_snapshot()
```

Each maps directly to a subsystem in `03-DATA-AND-AGENT.md §3`.

---

## 3. Security

Because this is a family application handling scraping credentials and third-party booking access, treat it with real production discipline:

- Secrets stay server-side, always.
- Never expose scraping credentials or API keys to the browser.
- Validate all user inputs (dates, occupancy, IDs) at the API boundary, not just in the UI.
- Rate-limit fetch-triggering endpoints specifically — `POST /searches/:id/fetch` is the one endpoint that can trigger expensive, source-sensitive work.
- Prevent arbitrary URL fetching (no user-suppliable URLs reaching the agent).
- Restrict `/admin` and `/api/admin/*` to authenticated operators only; it must not be reachable by ordinary family users even if they discover the route.
- Log all agent actions (tie into `AgentEvent` / `AgentError` from `03-DATA-AND-AGENT.md §15`).
- Avoid storing unnecessary personal information — this product only needs enough identity to know who's asking, not a marketing profile.

---

## 4. Agentic AI Features (Phase 2 — do not build until Phase 0–1 core is reliable)

Once the core price infrastructure works (per `BUILD-PHASES.md`), introduce natural-language interaction on top of it.

### Intent router
See `02-SYSTEM-ARCHITECTURE.md §4` — price/availability questions go to SQL, fresh-price requests go to the agent, general hotel-information questions go to RAG. The LLM routes and explains; it never computes a price.

### Example: "Which Taj is cheapest for my dates?"
```text
Parse dates → parse occupancy → query eligible hotels → query latest snapshots
  → filter unavailable → group by hotel → find cheapest eligible room/rate
  → check freshness → return result
```
No LLM arithmetic anywhere in this path.

### Example: "Fetch the latest prices."
```text
Create FetchRun → resolve hotel list → queue fetch tasks → booking extraction
  → normalization → validation → persist snapshots → recalculate analytics → update UI
```

### Example: "Why did Taj Goa become more expensive?"
```text
SQL price history + rate-plan changes + availability changes + RAG hotel/rate context → explanation
```
The explanation must explicitly separate **observed facts** from **interpretation** — e.g. "The room type shown changed from BAR to a Breakfast rate plan between these two observations, which accounts for part of the difference" rather than a confident single-cause narrative the data doesn't actually support.
