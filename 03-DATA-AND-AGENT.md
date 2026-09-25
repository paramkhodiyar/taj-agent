# 03 — Data Model & Agent System

> **This is the most important document in the project. Read it fully before writing any agent, schema, or persistence code — and re-read it before every phase that touches the database or the agent.**
> The single rule that overrides all convenience: **never fabricate a price, and never overwrite a historical observation.**

---

## 1. Agent-First Architecture

The agent is a first-class part of the product, not an afterthought bolted onto a chatbot.

```text
Resolve Taj property → Open permitted official booking flow → Submit dates/occupancy
   → Extract rooms → Extract rate plans → Extract pricing → Extract taxes/fees
   → Extract cancellation conditions → Extract meal-plan info → Extract availability
   → Normalize → Validate → Detect anomalies → Persist immutable snapshot → Return structured result
```

Never collapse this into one giant function. Use clearly separated modules/services (§4).

### Agent responsibilities checklist
Receive request → identify property → open official booking flow → enter dates/occupancy → retrieve rooms/rate plans/pricing/taxes/total/meal plan/cancellation/availability → capture source info → normalize → validate → detect anomalies → persist immutable snapshot → return structured result → **report failures instead of fabricating missing information.**

---

## 2. Agent Architecture

```text
User Request → Search Request Validator → Agent Orchestrator
                                              ├── Property Resolver
                                              ├── Booking Fetcher
                                              ├── Page/API Extractor
                                              ├── Room Extractor
                                              ├── Rate Extractor
                                              ├── Price Extractor
                                              ├── Policy Extractor
                                              └── Availability Extractor
                                                        |
                                              Normalization Layer
                                                        |
                                              Validation Engine
                     ├── Schema Validation  ├── Price Consistency  ├── Currency Validation
                     ├── Occupancy Validation ├── Date Validation  ├── Duplicate Detection
                     └── Anomaly Detection
                                                        |
                                              Snapshot Writer → PostgreSQL
```

---

## 3. Agent Subsystems

### 3.1 Property Resolver
Maintains the canonical Taj property catalog. `{ "hotelName": "Taj Mahal Palace" }` → `{ "hotelId": "taj-mumbai-mahal-palace", "canonicalName": "Taj Mahal Palace", "city": "Mumbai", "source": "official" }`. Prevents inconsistent naming across fetches.

### 3.2 Booking Fetcher
Navigation, search-form interaction, date/occupancy entry, result loading, pagination handling, network/API observation where technically appropriate, page-state detection, timeout handling. **Does not analyze** — only obtains the raw booking result. Prefer a stable structured request/API where the official booking system exposes one; use browser automation only where necessary and permitted.

### 3.3 Extractors (Room / Rate / Price / Policy / Availability)
Each extractor has one job and one output schema. Keep them independently testable (see `05-TESTING-AND-RELIABILITY.md §Golden Data Tests`).

---

## 4. Raw Data Must Be Preserved

Never discard the raw extraction.

```text
FetchRun
  ├── raw response / structured payload
  ├── normalized records
  ├── validation result
  └── errors
```

This is what lets you debug when Taj changes its UI, a parser breaks, a price looks anomalous, a room disappears, or a user questions historical data. Raw payload storage must still respect applicable terms, privacy, and retention constraints.

---

## 5. Normalization

Map source-specific labels ("Deluxe King Room") into canonical records ("Deluxe Room") **while retaining the original source label**:

```json
{ "canonicalRoomName": "Deluxe Room", "sourceRoomName": "Deluxe King Room" }
```

Never discard the source label — it's the only way to debug a bad mapping later.

---

## 6. Price Data Model

```text
PriceSnapshot
--------------------------
id, hotelId, roomId, ratePlanId, searchId
checkIn, checkOut, adults, children, rooms
currency
basePrice, taxAmount, feeAmount, totalPrice, pricePerNight
mealPlan, cancellationPolicy
availabilityStatus
source, sourceUrl
fetchedAt, fetchRunId
rawRecordHash
```

Every observation must be independently interpretable without joining back to "current state" anywhere.

---

## 7. Immutable Price History

**Never update an old price.** `10:00 → ₹25,000` and `14:00 → ₹24,500` are two rows, not one row overwritten. A fresh fetch that returns ₹22,000 after a previous ₹25,000 produces **Snapshot A = ₹25,000, Snapshot B = ₹22,000** — never `price = ₹22,000`. This is the entire foundation of price history; there is no acceptable shortcut here, even under storage-cost or "just an MVP" pressure.

From this you can calculate: lowest/highest observed, average, median, percentile, current, change from previous observation, change from historical average/high/low.

---

## 8. FetchRun

```text
FetchRun
--------------------------
id, requestedAt, startedAt, completedAt, status
requestedHotels, successfulHotels, failedHotels
searchParameters, agentVersion, extractorVersion
```

Auditability chain: `PriceSnapshot → FetchRun → source → timestamp → extraction version`. A user should always be able to answer "where did this price come from?"

---

## 9. Validation Engine

Deterministic wherever possible:

- **Dates:** `checkOut > checkIn`.
- **Occupancy:** result matches requested occupancy.
- **Currency:** INR is genuinely INR, not misread from formatted text.
- **Price consistency:** `base + taxes + fees ≈ total` when all components are available.
- **Duplicates:** prevent the same observation being inserted twice from repeated DOM elements or retries.
- **Anomalies:** `Previous = ₹25,000, Current = ₹2,500` gets flagged for verification, never silently treated as a real 90% drop.

---

## 10. Confidence / Verification State

Machine-readable, not an opaque AI confidence score:

```text
VERIFIED · PARTIALLY_VERIFIED · ANOMALOUS · FAILED · UNAVAILABLE
```

Surface concrete reasons in the UI: "Verified — total price matched extracted nightly rate and taxes" or "Needs verification — total price was not available in the booking result."

---

## 11. Scheduled Collection & Tracked Searches

```text
Every day at 09:00 → Tracked Searches → Taj Agent → Fetch → Validate → PriceSnapshot
```

Tracked searches (e.g. "Taj Goa, 15–17 Nov, 2 adults") accumulate into the historical dataset that makes the price-history chart meaningful over time.

---

## 12. "Fetch Now" Flow

```text
UI: Last verified 25 Sep 2026, 21:42  [ Fetch latest prices ]
  → POST /searches/{id}/refresh
  → Create FetchRun → Queue job → Agent executes → Validate → Persist → Return run status
```

Frontend shows live per-hotel progress ("17/31 hotels checked") and a completion summary ("31/31 properties verified") — this is the UI backing for `01-PRODUCT-AND-UI.md §5.7`.

---

## 13. Agent Error Handling

Must gracefully handle: website changes, CAPTCHA, rate limits, timeouts, missing rooms, sold-out hotels, partial responses, network failures, unexpected layouts, price/currency parsing failures, booking-flow changes.

**On failure: do not overwrite previous data.** The previous verified observation remains historically valid; current state is simply "fetch failed," shown honestly in the UI (`01-PRODUCT-AND-UI.md §7`).

---

## 14. Historical Analytics

Per room/rate combination: min, max, mean, median, standard deviation, percentile, latest, previous, absolute change, percentage change. The UI must visibly distinguish **observed historical values** from **calculated statistics** from the **current fetched value** — never blend them into one undifferentiated number.

### Historical integrity rule
Do not compare incompatible observations (e.g. 15 Nov Deluxe+breakfast ₹25,000 vs. 20 Nov Deluxe-room-only ₹18,000) and call it a trend. A historical series must have stable comparison dimensions; if the rate plan changes, start a new series or visibly mark the change.

---

## 15. Database Schema — Core Entities

```text
Hotel ── HotelAsset
      └─ Room ── PriceSnapshot
RatePlan ── PriceSnapshot
Search ── PriceSnapshot
FetchRun ── PriceSnapshot
FetchRunHotel
AvailabilitySnapshot
SourceDocument, RagChunk
TrackedSearch
AgentEvent, AgentError
```

---

## 16. Hotel Asset Pipeline

```text
HotelAsset
----------------
id, hotelId, type, url, source, sourceUrl, altText, width, height, licenseStatus, fetchedAt
```

Types: hero, gallery, room, logo, thumbnail. The frontend consumes assets through this controlled catalog — **never scrape images live every time a hotel page is opened.**

---

## 17. Data Source Strategy

Primary price source: the official Taj booking infrastructure, subject to its technical accessibility and applicable terms. Supplementary sources may be used for non-price metadata only. Every record stores `source = "taj_official"` explicitly — **never silently mix sources.**

---

## 18. Data Freshness Model

```text
0–15 min   FRESH
15 min–2h  RECENT
2–24h      STALE
>24h       OLD
```

Thresholds should be configurable. Always show the actual timestamp, never hide it behind the label alone.
