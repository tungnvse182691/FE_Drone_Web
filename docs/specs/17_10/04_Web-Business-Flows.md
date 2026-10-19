# Web business flows

**Phase 3A · cross-screen handoff · source baseline `c2b5945d57800fb0e557151bdbf83b60639adcb8`.**


**Contract rule.** Every API reference below links to the single primary entry in the [full API catalog](../04_API-Contracts/02_Full-API-Catalog.md). The catalog is authoritative for exact method, route, parameters, DTO/schema, headers, K/version, response and source locator. This chapter defines proposed Web presentation and orchestration; it does not create a route or grant a role.

For every screen, FE must bind fields from the response DTO and request fields from the request DTO exactly as catalogued. “DTO fields” means the named schema properties in the catalog; no unlisted field, enum, status or local authority is assumed. `CURRENT_IMPLEMENTED_BE` means source-backed route/guard; `PROPOSED_WEB_UI` means UI composition; `NOT_VERIFIED_WEB_E2E` means no Web client runtime was supplied.


## 1. Browser sign-in and project entry

CSRF → Web login → session → projects/membership → selected project. A failed login is a form error; 401 after session expiry triggers one renewal; 403 remains an authorization result. Do not persist bearer tokens in the browser for this Web flow.

## 2. Reporter case triage → PM decision

Reporter Mobile creates a report and private evidence through [API-216](../04_API-Contracts/02_Full-API-Catalog.md#api-216) and evidence APIs. Web reads [API-018](../04_API-Contracts/02_Full-API-Catalog.md#api-018)/[API-019](../04_API-Contracts/02_Full-API-Catalog.md#api-019). Supervisor triages with [API-024](../04_API-Contracts/02_Full-API-Catalog.md#api-024); only then does PM assess candidates using [API-061](../04_API-Contracts/02_Full-API-Catalog.md#api-061) and command [API-059](../04_API-Contracts/02_Full-API-Catalog.md#api-059). PM choice is KEEP_NEW/LINK_EXISTING/REJECT as server DTO/status; do not invent a client state.

## 3. PM → FIELD/Crew handoff

PM creates/assigns the FIELD task through the field-task APIs. Crew receives the assigned task in Mobile, records physical measurement/evidence, and submits. PM reads history/submission/review responses. AI bbox, confidence or road segment geometry is never converted by Web into a physical dimension.

## 4. PM → NORMAL repair → Supervisor final

PM creates package/item, proposes and assigns; Crew starts/finishes execution and evidence; PM reviews/corrects; Supervisor approves/final-confirms using the package item endpoints. At every transition Web refreshes the authoritative item/history DTO. A 409/412/428 means stale/missing concurrency or lifecycle precondition; preserve unsent form state and reload before offering retry.

## 5. Fast Track

PM checks policy/road coverage/eligibility, requests/updates policy as authorized and performs PM final confirmation. Supervisor is informational under current source; P2-06 records the missing adopted notification producer. Web must not show a Supervisor approval button for Fast Track unless owner/source changes.

## 6. Publication and reporting

Case conclusion, report links/splits and publication are separate commands. Recipient selection is server-validated. Reports, exports, retention and notifications are read/command surfaces with private evidence boundaries. Unknown command outcome is reconciled by GET/history using the same K; never blindly submit a second command.

## Flow status

All sequences are `CURRENT_IMPLEMENTED_BE` route/source handoff plus `PROPOSED_WEB_UI` navigation. Browser E2E, deployed storage, SMTP, GIS renderer and external AI/provider acceptance are `NOT_VERIFIED_WEB_E2E`.
