# Operational Runbooks — Taj Price Intelligence

> **Living Runbook Document per docs/06-DEPLOYMENT-AND-OPERATIONS.md §7.**
> When an operational incident occurs, follow these deterministic procedures. Never manually overwrite or delete historical database rows.

---

## Runbook 1: Extractor Breaks After a Taj Site Change

### Symptoms
- `/admin/data-health` reports elevated error rate.
- `/fetch-runs` shows `FAILED` or `PARTIAL` runs with errors such as `LAYOUT_CHANGED`, `Missing room selector`, or price parsing failures.

### Action Plan
1. **Inspect Failed FetchRun:**
   - Open `/fetch-runs` and identify the failed run ID.
   - Inspect the preserved `rawPayload` (`03-DATA-AND-AGENT.md §4`) to see the exact structure returned by Taj.
2. **Reproduce via Golden Suite:**
   - Add a fixture of the new DOM/JSON format into `test/fixtures/golden-bookings.json`.
   - Run `npm test` — confirm the test fails as expected.
3. **Update Extractor & Increment Version:**
   - Modify the relevant extractor in `agent/extractors/` to handle the new markup or attributes.
   - Increment `extractorVersion` in `agent/agentOrchestrator.ts` (e.g. `taj-booking-v2`).
4. **Validate & Deploy:**
   - Run `npm test` — all golden fixtures and regression suites must pass cleanly.
   - Deploy new code.
   - Note: Old historical snapshots retain their original `extractorVersion` forever per `06-DEPLOYMENT-AND-OPERATIONS.md §6`.

---

## Runbook 2: CAPTCHA or Rate-Limit Encountered

### Symptoms
- `FetchRunHotel` records contain error `Rate limit (HTTP 429)` or `Bot verification / CAPTCHA challenge`.

### Action Plan
1. **Confirm Historical Data Safety:**
   - Verify on `/admin/data-health` and `/results` that prior verified snapshots are untouched and still served.
2. **Back Off:**
   - Do NOT hammer the source. Let the scheduled window pass.
   - Check `AGENT_CONCURRENCY` in `.env` — if necessary, decrease concurrency from 5 to 2 or 3.
3. **Audit Proxies & Headers:**
   - Confirm official booking endpoints and user-agent headers are compliant with terms.

---

## Runbook 3: An Anomalous Price Is Reported by a User

### Symptoms
- User questions a price drop or spike (e.g. "Why is Taj Lake Palace ₹2,500?").
- `PriceSnapshot` has `verificationState = "ANOMALOUS"`.

### Action Plan
1. **Audit Provenance Chain:**
   - Query the snapshot ID in the database or inspect on `/hotel/[slug]`.
   - Retrieve `fetchRunId` and `rawRecordHash`.
2. **Examine Raw Observation:**
   - Inspect the preserved `rawPayload` in `FetchRun`.
   - If Taj genuinely published a promotional flash sale:
     - Mark observation confirmed, keep historical record intact.
   - If it was a parser bug (e.g. read ₹2,500 deposit instead of ₹25,000 nightly rate):
     - Fix the extractor in `agent/extractors/priceExtractor.ts`.
     - Do NOT edit the historical row in PostgreSQL (trigger prohibits UPDATE). The row remains an honest artifact of what that extractor version recorded; new runs with the updated extractor will record the correct price.
