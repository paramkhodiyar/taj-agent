# 07 — Security & Code-Quality Red Flags

> **Read this document before writing your first line of API, agent, or database code — and re-open it at the end of every phase in `BUILD-PHASES.md`, not just once at the start of the project.**
> This is the checklist that decides whether this project reads as senior-engineered or as vibe-coded. Every phase gate in `BUILD-PHASES.md` now includes an implicit "does this introduce anything on this list?" check.

This is not the full checklist you gave me — it's that checklist re-prioritized for *this* project. A generic todo app doesn't need SSRF hardening or agent loop bounds; a browser-automation price agent that touches real booking flows and real money absolutely does. Treat the tiers below as an actual severity ordering, not a flat list.

---

## Tier 0 — Never ship these, no exceptions

These directly break the core promise of `03-DATA-AND-AGENT.md` or create an open door into the system. If any of these are true, the project is not done, regardless of how the UI looks.

**Price integrity**
- [ ] No LLM-generated or LLM-estimated price ever reaches `PriceSnapshot`.
- [ ] Historical snapshots are append-only — no `UPDATE` ever touches a `PriceSnapshot` row's price fields.
- [ ] A failed fetch never overwrites, deletes, or blanks out previously valid data.
- [ ] Missing price is stored as `null`/`unavailable`, never as `0`, never as a guessed fallback.
- [ ] Parser failure is never recorded as "sold out," and "no result" is never recorded as "₹0."
- [ ] Money fields are stored as integers (smallest currency unit, e.g. paise) or `Decimal` — **never `Float`.**

**Authentication & authorization**
- [ ] Every sensitive endpoint (`/api/searches/*/fetch`, anything under `/api/admin/*`, anything that writes) requires authentication.
- [ ] Authorization is enforced server-side for every action — `if (user.role === "ADMIN") showAdminPanel()` on the frontend is not authorization; the same check must exist on the API route.
- [ ] Every resource lookup checks ownership (`find search where id = X AND userId = current user`), not just existence — closes the classic IDOR hole (`GET /api/searches/123` → `124` → `125` must not leak other users' data).
- [ ] No mass assignment: writable fields are explicitly whitelisted; `User.update(req.body)` (or any Prisma equivalent that spreads a raw request body into an update) is banned.
- [ ] API responses return only the fields the frontend needs — never `passwordHash`, internal notes, or API keys in a payload just because the object happened to have them.

**Secrets**
- [ ] No secrets in source code, Git history, or any `NEXT_PUBLIC_*` variable.
- [ ] `.env` is gitignored; production secrets live in a secrets manager, not pasted into a dashboard by hand.
- [ ] Secrets are never returned by an API response and never written to logs.

**Agent surface (the highest-risk part of this specific project)**
- [ ] The Booking Fetcher only ever navigates to an explicit allowlist of Taj-related domains/endpoints — never `page.goto(userProvidedUrl)` or any URL built from user or scraped input.
- [ ] Scraped page content is always treated as **untrusted data**, never as instructions — if any LLM step reads scraped text, it must be structurally isolated from tool-calling/decision-making prompts (prompt-injection defense; see Tier 1 for the supporting controls).
- [ ] `POST /searches/:id/fetch` (or any endpoint that triggers a Playwright session) is authenticated, rate-limited, and quota-limited per user — an unauthenticated or unlimited version of this endpoint is a free denial-of-service and cost-abuse vector (`for (;;) fetch("/api/fetch")` should be *impossible*, not just unlikely).

---

## Tier 1 — Must be handled before calling any phase "done"

**Agent hardening**
- [ ] Maximum tool calls, maximum runtime, and maximum retries are enforced on every agent run — no unbounded agent↔tool loop.
- [ ] Concurrency limits on Playwright sessions (batches, not unlimited parallel browsers — ties to `02-SYSTEM-ARCHITECTURE.md §6`).
- [ ] Timeouts on every external request and every browser-automation step; no infinite retries, and errors that shouldn't be retried (e.g. malformed input) aren't retried.
- [ ] Job deduplication — the same fetch request submitted twice doesn't spawn two redundant jobs.
- [ ] Agent database credentials are least-privilege (insert `PriceSnapshot`/`FetchRun`, read `Hotel` — not admin access to the whole schema). No generic "run arbitrary SQL" tool exposed to any agent.
- [ ] SSRF controls beyond the domain allowlist: block private IP ranges, localhost/loopback, link-local addresses, and cloud metadata endpoints if the agent ever resolves or follows a redirect.

**Input validation**
- [ ] Every API input (`hotelId`, `searchId`, dates, guest count, pagination, sort, filters) is schema-validated (Zod or equivalent) — type, range, and enum checks, not just "is it present."
- [ ] Maximum request size and pagination limits enforced.
- [ ] Unexpected fields on write endpoints are rejected rather than silently ignored (supports the mass-assignment defense above).

**Web-layer basics**
- [ ] CORS has an explicit origin allowlist — no `origin: "*"` on any authenticated route.
- [ ] If cookie-based sessions are used: HttpOnly + Secure + appropriate SameSite, CSRF protection, and session expiration/rotation/logout invalidation. Remember CORS and CSRF are different problems — solving one doesn't solve the other.
- [ ] Baseline security headers set deliberately (CSP, X-Content-Type-Options, Referrer-Policy, HSTS) rather than left at framework defaults.
- [ ] `dangerouslySetInnerHTML` is avoided; if scraped hotel content is ever rendered as HTML, it is sanitized first — scraped content is untrusted the same way user input is.
- [ ] Database: foreign keys, unique constraints, indexes on hot query paths, transactions for multi-step writes, and a real migration history — no `prisma db push` as the production deployment method.

---

## Tier 2 — Architecture & code-quality discipline

These won't cause a breach, but they're what make Tier 0/1 rules hard to actually enforce once the codebase grows, and they're the fastest visual "this was vibe-coded" tell for a reviewer.

- [ ] No 1,000+ line `page.tsx` or `agent.ts` — split by responsibility, matching the module boundaries already specified in `03-DATA-AND-AGENT.md §2–3` (Property Resolver, Booking Fetcher, each extractor, Normalization, Validation, Snapshot Writer are separate files/modules, not one function).
- [ ] Business logic lives in services/domain modules, not inside React components or JSX.
- [ ] No `utils.ts` dumping ground — group by domain (`pricing/`, `agent/`, `hotels/`) as already laid out in `01-PRODUCT-AND-UI.md §6.5`.
- [ ] No boolean-explosion state (`isLoading, isFetching, isRefreshing, isRetrying...`) where a single status enum (`FRESH | FETCHING | STALE | FAILED`, matching `03-DATA-AND-AGENT.md §10/§18`) would do.
- [ ] No duplicated business logic between frontend, backend, and agent — especially price-formatting and freshness-threshold logic, which must have one implementation each.
- [ ] Explicit TypeScript interfaces for every cross-boundary shape (`PriceSnapshot`, `FetchRun`, API request/response bodies) — minimal `any`.
- [ ] Empty `catch {}` blocks, `catch { return null }`, and `catch { return [] }` are banned wherever the caller needs to distinguish "no data" from "the fetch failed" (this is the same distinction `03-DATA-AND-AGENT.md §13` requires at the agent level — don't lose it in application code).
- [ ] Real logging (structured, with the `FetchRun`/extractor-version context from `03-DATA-AND-AGENT.md §8`), not `console.log` as the entire logging system.
- [ ] No dependency added "to fix a problem" without a one-line justification in the PR — avoid the 3,000-dependency vibe-code smell.

---

## Tier 3 — Frontend honesty & avoiding the "AI-generated luxury site" cliché

- [ ] No fake loading timers (`setTimeout(() => setDone(true), 3000)`) — loading states reflect real request state.
- [ ] No "AI is thinking…" theater for what is actually a deterministic SQL query (`03-DATA-AND-AGENT.md §55` example — no LLM arithmetic in that path, so don't fake AI framing around it either).
- [ ] Real empty, partial, stale, and error states everywhere data is shown — not just a happy path (matches `01-PRODUCT-AND-UI.md §7–8`).
- [ ] Avoid the generated-luxury-site cliché explicitly called out here: gold gradient + black background + huge serif heading + glass card + blur + floating particles + an "AI POWERED" badge. `01-PRODUCT-AND-UI.md §6` (no gradients, no shadows, restrained palette) already rules most of this out — treat any glassmorphism or particle effect that creeps in during implementation as a regression against that doc, not a stylistic choice.
- [ ] No fake security theater: no disabled right-click, no F12/DevTools blocking, no "hide the admin button" instead of actually authorizing the admin route. These don't stop anyone and are themselves a red flag to any reviewer — the correct posture is "assume the user can read all frontend code, JS, network requests, and local storage," and never let anything sensitive reach the browser in the first place.

---

## Tier 4 — Deployment & Git hygiene

- [ ] Separate dev/staging/prod environments and credentials — a broken dev extractor run must never be able to touch production historical data (`06-DEPLOYMENT-AND-OPERATIONS.md §4`).
- [ ] Real migrations, not ad hoc schema pushes to production.
- [ ] Backups exist **and have been restore-tested** at least once — an untested backup is not a backup.
- [ ] Health checks and alerting for the API, the worker, and the job queue (`06-DEPLOYMENT-AND-OPERATIONS.md §5`).
- [ ] Meaningful commit messages and no committed secrets or generated build artifacts — avoid `final-final-fixed` / `fix stuff` as a commit history.
- [ ] Linting and tests actually run in CI, not just available to run locally.

---

## Senior-dev smell test, adapted for this project

If a reviewer opened this repo and saw any of the following together, they'd know immediately it wasn't built carefully — treat this as a pre-flight list before any release:

```
agent.ts / page.tsx several thousand lines long
any / console.log scattered everywhere
.env committed
prisma db push used as the deploy step
POST /api/searches/:id/fetch reachable without auth
CORS origin: "*" on an authenticated route
LLM output written directly into a PriceSnapshot
price stored as Float
no foreign keys / no unique constraints
no migrations, no tests, no rate limiting, no timeouts
agent has no tool-call/runtime cap
disable-right-click or DevTools-blocking script
fake "AI is thinking..." loader over a plain SQL query
```

---

## How this ties back into the build

- **`BUILD-PHASES.md`**: this document is part of the required reading for Phase 0 and the closing checkpoint, and every phase gate now implicitly includes "introduces nothing from Tier 0/1 of `07-REDFLAGS.md`."
- **`MASTER-BUILD-PROMPT.md`**: the agent driving the build is instructed to check its own output against this list at the end of every phase and report any Tier 0/1 item it's unsure about, rather than silently assuming it's fine.