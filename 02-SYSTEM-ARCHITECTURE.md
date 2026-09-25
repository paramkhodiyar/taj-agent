# 02 — System Architecture

> **Read this document fully before making any architectural or stack decision.**
> Cross-check any change here against `01-PRODUCT-AND-UI.md` (does it still serve the experience?) and `03-DATA-AND-AGENT.md` (does it still protect historical integrity?) before committing to it.

---

## 1. Core Philosophy

```text
             AGENT                DATABASE                ANALYTICS / UI
        "What is true now?"  →  "What happened?"   →   made understandable
               |                      |                        |
        Verified observation   Historical truth              USER
```

The AI sits on top of this foundation to make information easier to query and explain. The engineering objective is **not** an impressive chatbot — it is a trustworthy hotel-price data pipeline with excellent provenance, historical integrity, and freshness handling, wrapped in an elegant interface.

---

## 2. High-Level Architecture

```text
                         USER
                          |
                 +------------------+
                 |    Next.js UI    |
                 +---------+--------+
                           |
                 +---------v--------+
                 |   API / Backend  |
                 +---------+--------+
                           |
          +----------------+----------------+
          |                                 |
   Historical Queries                 Fresh Fetch
          |                                 |
   +-------------+                  +---------------+
   | PostgreSQL  |                  | Agent Worker  |
   +------+------+                  +-------+-------+
          |                                 |
          |                        +--------+--------+
          |                        |                 |
          |                 Taj Booking Flow    Validation
          |                        |                 |
          |                        +--------+--------+
          |                                 |
          |                         Normalization
          |                                 |
          |                          Price Snapshot
          |                                 |
          +----------------<----------------+
                           |
                  Analytics / Intelligence
                           |
                       Dashboard
```

### Final architecture (with the AI layer added in later phases)

```text
                         TAJ PRICE INTELLIGENCE
              +-------------------+-------------------+
              |                                       |
       CONSUMER EXPERIENCE                    DATA / AGENT SYSTEM
      +-------+-------+-------+               +-------+-------+-------+
   Search  Compare  History                 Fetch   Validate       Store
              |                                       |
        Next.js UI                              PostgreSQL
              +-------------------+-------------------+
                                  |
                           AI / INTELLIGENCE
                    +-------------+-------------+
                    v             v             v
                  SQL           RAG          Agent
               analytics     information    orchestration
```

---

## 3. Technology Stack

**Frontend:** Next.js, TypeScript, Tailwind CSS, Framer Motion, accessible semantic HTML, CSS Grid + Flexbox, custom SVG for charts.

**Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon acceptable for managed hosting).

**Agent / data acquisition:** Python or Node.js workers, Playwright for browser automation where permitted, a deterministic agent-orchestration layer (e.g. LangGraph or an equivalent state machine — not a free-roaming autonomous agent), structured extraction schemas, a validation pipeline, retry logic, a job queue.

**Background jobs:** Redis + BullMQ recommended; a PostgreSQL-backed job table with a scheduled worker is an acceptable, simpler MVP substitute.

**Analytics:** SQL for all authoritative calculations (min/max/mean/median/percentile/change). Python only where genuinely more advanced statistics are needed — never as the source of truth for a number the UI also computes another way.

**AI/LLM:** used for agent planning, tool selection, natural-language explanation, unstructured retrieval, and summarizing verified database results. **Never** the authority for a numeric price — see `03-DATA-AND-AGENT.md §Confidence / Verification State`.

---

## 4. RAG Architecture (structured data vs. retrieval)

RAG is **not** the price-history system.

- **Structured (PostgreSQL):** prices, rooms, rate plans, dates, availability, historical snapshots, fetch metadata.
- **RAG:** hotel descriptions, amenities, policies, room descriptions, general hotel information, source documentation.

```text
"What does the Taj Club Room include?"  →  RAG retrieval → verified source content → LLM explanation
"What is the cheapest Taj for 15 Nov?"  →  SQL / structured querying (no RAG, no LLM arithmetic)
```

### Intent router (Phase-2 feature, see `04-API-AND-SECURITY.md`)

```text
User Query → Intent Router
    ├── Price / Availability      → PostgreSQL
    ├── Fresh price request       → Taj Agent
    └── Hotel information         → RAG
```

Avoids unnecessary LLM calls and keeps the price path deterministic.

---

## 5. Query Strategy (DB-first, agent-on-demand)

1. Query existing DB observations for the requested search.
2. Determine freshness (`03-DATA-AND-AGENT.md §Data Freshness Model`).
3. If sufficiently fresh → return the DB result.
4. If stale **and** the user explicitly requests fresh data → run the agent.
5. After a successful fetch → persist new snapshots, recalculate analytics, return the updated result.

This avoids running the agent on every page load and keeps agent capacity spent where it matters.

---

## 6. Performance & Caching

- Never fetch all Taj properties serially — use controlled concurrency (e.g. batches of 5 workers), sized to respect the source's own rate limits and applicable terms.
- Cache hotel metadata, images, static hotel information, and historical query results.
- **Do not** cache fresh prices beyond the freshness policy — a cached "fresh" price that has quietly gone stale is worse than an honest "stale" label.

---

## 7. Versioning

Every extraction pipeline is versioned:

```text
agentVersion = 1.2.0
extractorVersion = taj-booking-v4
schemaVersion = 1
```

When historical data looks strange, this tells you exactly which extractor produced it — essential once the Taj booking UI changes and you need to know which snapshots to distrust.

---

## 8. Build Order (why the phases are ordered the way they are)

```text
Reliable data → Correct historical database → Good UI → Agent automation → AI interaction
```

Do **not** begin with a chatbot UI, a large vector database, a multi-agent swarm, autonomous browsing across many sources, predictive forecasting, fake "AI confidence" scores, or dashboard sprawl. See `BUILD-PHASES.md` for the concrete phase sequence, and `05-TESTING-AND-RELIABILITY.md` / `06-DEPLOYMENT-AND-OPERATIONS.md` for what has to be true before each phase ships.
