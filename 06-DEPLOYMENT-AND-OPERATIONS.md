# 06 — Deployment & Operations

> **Read this document before setting up infrastructure, cron/scheduling, or notification delivery.** Operational shortcuts here are exactly what quietly reintroduces the fabrication/overwrite problems the rest of the docs exist to prevent — treat this as seriously as the schema.

---

## 1. Deployment Shape

- **Frontend/API:** Next.js app, deployable to any standard Node hosting target.
- **Database:** managed PostgreSQL (Neon is an acceptable managed option per `02-SYSTEM-ARCHITECTURE.md`).
- **Agent workers:** run as separate deployable processes from the web app, not inside the request/response cycle of an API route — a booking-flow fetch can take a while and must not block a user-facing request.
- **Job queue:** Redis + BullMQ for the target state; a PostgreSQL-backed job table with a scheduled worker is an acceptable simpler MVP substitute (see `BUILD-PHASES.md` Phase 0–1) — but plan the job-table schema so migrating to BullMQ later doesn't require a data model change.

---

## 2. Scheduled Collection

```text
Cron (e.g. daily 09:00 IST) → Tracked Searches → Agent → Fetch → Validate → PriceSnapshot
```

Keep the scheduler itself dumb — it enqueues `FetchRun`s for every `TrackedSearch`; all the actual logic lives in the agent pipeline already specified in `03-DATA-AND-AGENT.md`. Concurrency across properties should be batched (e.g. 5 workers per batch) and must respect the source's own rate limits and applicable terms — see `02-SYSTEM-ARCHITECTURE.md §6`.

---

## 3. Notifications (supports `01-PRODUCT-AND-UI.md §8.9`)

- Delivery channels: email at minimum; WhatsApp/SMS as a later enhancement.
- Trigger on **meaningful change** (price drop past a threshold, availability change for a tracked search), not on every completed fetch run — a daily "nothing changed" message trains users to ignore notifications entirely.
- Every notification links back to the specific `PriceSnapshot`/`FetchRun` it's reporting on, so the claim in the email is independently checkable in-app.

---

## 4. Environment & Secrets

- All credentials (booking-flow access, DB connection strings, notification provider keys) live in environment variables / a secrets manager, never in source control.
- Separate credentials per environment (dev/staging/prod) so a broken dev extractor run can never touch production historical data.

---

## 5. Monitoring & Alerting

Building on `05-TESTING-AND-RELIABILITY.md §6`:

- Alert an operator (not end users) when: a fetch run's failure rate crosses a threshold, an extractor version starts producing an unusually high anomaly rate, or a scheduled run doesn't complete within its expected window.
- Keep `/fetch-runs` and `/admin/data-health` as the human-readable surface of the same signals — operators should rarely need to go past the dashboard into raw logs.

---

## 6. Release / Versioning Process

Whenever the booking flow changes and a new extractor is written:

1. Update `extractorVersion`.
2. Run the full golden-data + regression suite (`05-TESTING-AND-RELIABILITY.md §2–3`) against it before deploying.
3. Deploy the new extractor; old snapshots keep their original `extractorVersion` stamp forever — never retroactively relabel historical data with the new version.

---

## 7. Runbooks (common operational situations)

- **Extractor breaks after a Taj site change:** check `/fetch-runs` for the failure pattern → compare against the last-known-good extractor version → write/update the golden fixture → ship a new extractor version → verify against the regression suite before re-enabling the schedule.
- **CAPTCHA or rate-limit encountered:** the run should fail cleanly per hotel (per `03-DATA-AND-AGENT.md §13`) without touching historical data; back off and retry on the next scheduled window rather than hammering the source.
- **An anomalous price is reported by a user:** look up the snapshot's `FetchRun` and `rawRecordHash`, inspect the preserved raw payload (`03-DATA-AND-AGENT.md §4`), and confirm whether it's a genuine anomaly (flag/leave as `ANOMALOUS`) or a parser bug (fix extractor, do not edit the historical row).

---

## 8. What Not to Build Initially

Do not begin with: a complex chatbot UI, a large vector database, a multi-agent swarm, autonomous browsing across many external hotel sources, predictive price forecasting, fake "AI confidence" scores, or excessive dashboard widgets. Build order: **reliable data → correct historical database → good UI → agent automation → AI interaction** (`02-SYSTEM-ARCHITECTURE.md §8`).

---

## 9. Future Features (post-core, ordered roughly by leverage)

Price-drop alerts · cheapest-date discovery · flexible-date search ("cheapest Taj in Goa this month") · price calendar · historical seasonal patterns · deeper hotel comparison · room-upgrade analysis · breakfast-vs-room-only comparison · cancellation-flexibility comparison · saved family trips · WhatsApp notifications · monthly price reports.

---

## 10. Definition of Done (system-level)

> Every displayed historical price can be traced to an immutable, timestamped, validated source observation, and every fresh price is produced by the acquisition pipeline rather than invented by the AI — and this remains true after deployment, under real scheduling, real failures, and real traffic, not just in a local demo.
