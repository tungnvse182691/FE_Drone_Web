# Web errors and state handling

**Phase 3A · browser behavior around current contracts `c2b5945d57800fb0e557151bdbf83b60639adcb8`.**


**Contract rule.** Every API reference below links to the single primary entry in the [full API catalog](../04_API-Contracts/02_Full-API-Catalog.md). The catalog is authoritative for exact method, route, parameters, DTO/schema, headers, K/version, response and source locator. This chapter defines proposed Web presentation and orchestration; it does not create a route or grant a role.

For every screen, FE must bind fields from the response DTO and request fields from the request DTO exactly as catalogued. “DTO fields” means the named schema properties in the catalog; no unlisted field, enum, status or local authority is assumed. `CURRENT_IMPLEMENTED_BE` means source-backed route/guard; `PROPOSED_WEB_UI` means UI composition; `NOT_VERIFIED_WEB_E2E` means no Web client runtime was supplied.


| Response | Web behavior | Retry/reconciliation |
|---|---|---|
| 400/422 | Bind ProblemDetails field errors to DTO fields; preserve input. | Correct client input; do not re-submit unchanged invalid payload. |
| 401 | Session expired or missing. | One renew/session check, then return to login; avoid renew loops. |
| 403 | Server authorization/resource denial. | Hide/disable follow-up only after displaying denial context; never infer permission from UI. |
| 404 | Missing or no longer visible resource. | Clear stale cache and show resource-not-found; do not fabricate empty object. |
| 409 | State/K/idempotency/conflict outcome. | GET resource/history; same K only for deliberate replay. |
| 412 | Version/precondition mismatch. | Refetch version, show diff, require user confirmation. |
| 428 | Required precondition/header missing. | Read catalog-required K/version/CSRF and retry once after fixing transport. |
| 429 | Rate limit/backoff. | Honor server guidance if supplied; bounded backoff with visible retry state. |
| 5xx/network timeout | Unknown command outcome. | Do not duplicate; reconcile by GET/history and preserve draft. |

## UI state contract

Every screen has loading, empty, ready, partial (one panel failed), submitting, success and error states. Commands disable duplicate clicks while in flight, but this is not idempotency. Use correlation/problem details for support. A POST that may have committed is reconciled by GET/history using the original K. Cache invalidation follows a successful response, never an optimistic state transition.

## Field and authority validation

FE may validate required format, length and obvious numeric ranges for usability. Backend remains authoritative for cross-field validation, membership, lifecycle, ownership, K, version, evidence privacy and current roles. Do not convert a server enum/status to a new local enum that can be submitted back.

Known source gaps remain: P1-02 callback fencing, P1-03 candidate matching, P1-04 Reporter evidence temporal recheck, P1-05 external integrations, P2-06 FT informational notification and P2-07 localized pre-Defect producer.
