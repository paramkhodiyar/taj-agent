# 05 — Testing & Reliability

> **Read this document before writing or changing any extractor, validator, or price-formatting code.** A change that "passes visually" but breaks a golden fixture is a regression — treat the fixture suite as more authoritative than a manual smoke test.

---

## 1. Data Accuracy Testing

Build automated tests around known booking results, verifying: correct hotel, correct dates, correct occupancy, correct room, correct rate, correct currency, correct total, correct cancellation policy, correct meal plan, correct availability.

Also test malformed/edge-case price formats explicitly so the parser never silently misinterprets them:

```text
₹25,000
25,000
25k
₹25.000
₹25,000 + taxes
```

---

## 2. Regression Testing

Whenever the Taj booking flow changes:

```text
Old extractor → known fixture → expected normalized result
```

Run the full fixture suite **before** deploying a new extractor version, never after.

---

## 3. Golden Data Tests

Maintain a set of manually verified booking observations as fixtures, e.g.:

```text
Fixture: Taj Goa, 2 adults, 15–17 Nov, Deluxe, BAR
Expected: currency = INR, price > 0, room = Deluxe, occupancy = 2
```

This protects the extraction pipeline from silent breakage when Taj changes markup, wording, or layout.

---

## 4. Reliability Rules That Are Also Correctness Rules

These overlap with `03-DATA-AND-AGENT.md` but are restated here because they are the rules a test suite must actually enforce, not just aspire to:

- A failed fetch **never** overwrites or deletes a previous verified snapshot (test: simulate a fetch failure, assert the prior row is untouched and still queryable).
- An anomalous price swing (e.g. >70% drop) is flagged `ANOMALOUS`, not silently persisted as `VERIFIED` (test: inject a fixture with an implausible swing, assert the state).
- Duplicate observations from retries or repeated DOM nodes are deduplicated before persistence (test: feed the same raw payload twice, assert one row).
- `base + taxes + fees ≈ total` is checked whenever all three are present, with a defined tolerance (test both a matching and a mismatched fixture).

---

## 5. The One Rule the UI Must Never Break

> Never advertise **"Live price"** unless the system actually just performed a fresh fetch.

Use "Current verified price" or "Last verified 4 minutes ago" instead. Include this as an explicit UI-copy lint/test if practical (grep for "live" in price-related components as a CI check) — it's cheap to enforce and expensive to get wrong.

---

## 6. Observability as a Reliability Tool

Track, per fetch run and per extractor version: fetch duration, success rate, failure rate, number of rooms found, number of rates found, validation failures, price anomalies. This becomes essential the day the Taj booking site changes and you need to know, at a glance, which extractor version started producing bad data and when.

---

## 7. What "Reliable" Means for This Project

Not "never fails" — the agent *will* hit CAPTCHAs, timeouts, and layout changes. Reliable means:

1. A failure is always visible and honestly labeled, never silent.
2. A failure never corrupts or destroys prior historical truth.
3. Every price on screen can be traced back through `FetchRun → source → timestamp → extractor version` on demand.
4. Regressions in extraction are caught by the golden-data suite before they reach production, not by a family member noticing a wrong price.
