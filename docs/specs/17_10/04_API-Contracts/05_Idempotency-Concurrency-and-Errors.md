# Idempotency, concurrency, replay và errors

**Phase 2C · 15/10/2026 · implementation source pinned `36c3a1d273f17dd29b816136ae0182a821fd79e4` · independent JEV pending.**

[API entrance](README.md) · [Review/evidence](PHASE2C_REVIEW_REPORT.md) · [10 workflows](../02_Business-Workflows/README.md) · [Backend/Data](../03_Backend-and-Data/PHASE2B_REVIEW_REPORT.md).

`CURRENT_VERIFIED` = source/static contract discovery, không HTTP/E2E/deployment PASS. `CURRENT_IMPLEMENTED` trong phần AI là phân nhóm contract BE đã có, không nhãn real provider acceptance. `TARGET_CONFIRMED` client/business theo [owner decisions](../../product/confirmed-decisions.md), [latest HUY](../../../planning/development/HUY-FINAL-INTEGRATION.md) và owner Phase2C authorization; precedence theo [governance](../00_Governance/01_Authority-and-Source-of-Truth.md). `PROPOSED`, `NOT_VERIFIED`, `HISTORICAL` giữ phạm vi. Product HoangHaiWarrantySystem; technical RoadGuardSystem/routes giữ nguyên.

## K, body operation identity and version are separate

Durable IdempotencyRecord scope ActorUserId/ProjectId/Operation/IdempotencyKey + request fingerprint. Same key/different normalized content conflicts, same request can replay stored outcome; key identity is not user permission or If-Match. IdempotencyOperationService optional receiptAccessGuard means current-rights replay must be checked at actual caller, not assumed globally. Some identity/admin/project DTOs use body OperationId/expected versions independent of K header.

No time-based universal key expiration/TTL contract is established here. Do not discard durable operation identity on app restart or assume storage URL/OTP/session TTL is receipt TTL. Scoped module/action normalization/length/hash/version governs. Source transaction strategy and competing unique handling mitigate ambiguous commit, not external exactly-once. Read-only GET can declare K/V via helper yet ignore enforcement.

| Group | Runtime/source key/version rules and errors | Evidence |
|---|---|---|
| Auth refresh/logout | AuthController TryOperationKey; refresh visible ASCII ≤150 after trim, transport/current token/session + durable rotation; logout own validator/replay. Web logout key≤200; bad headers may400 rather than global428 | AuthController/AuthService/WebAuthController |
| Reporter/Case/candidate/Defect/labels | Huy01CommandExecution normalizes K (trim ASCII spaces, bounded printable range); version/head/body source pins vary. Current actor/source receipt guard in each service; Case stale can412, changed key409 | Huy01CommandExecution and per-operation service/repository |
| Geometry/pavement | Geometry key≤200; edits/confirm/publish expected version; pavement key≤150 visible ASCII/content hashes, different module tokens; reads can declare optional headers | GeometryWorkflowService/PavementWorkflowService |
| FIELD/repair | Typed action source/OriginalId/first-start/binding/evidence; repair keys≤150 visible ASCII and quoted version with module-specific shape. NORMAL/FT role and current head checks continue on replay | FieldInspectionWorkflowService/RepairProducerService/RepairExecutionService |
| Repair policies/lifecycle/safety | Policy writes K≤150; noncreate write V quoted8-byte Base64 except revoke h4-policy-v1- hash token. GET policy helpers don't require K/V. Lifecycle quoted8byte Base64; safety admission similarly bounded | RepairPolicyService/RepairLifecycleService/RepairSafetyService |
| Project lifecycle LD06 | K≤150 visible ASCII, quoted64lowercase-hex expected version; command enum route mapping and authority, unknown404; not generic rowversion | ProjectLifecycleService.LD06 |
| Offline | Writes K≤150 visible ASCII, missing428 idempotency_key_required; current public key/signature/manifest/source/origin + receipt/envelope hash. Header V declared often optional; not all action paths enforce it | OfflineWorkflowService/Repository.Sync/Transfer |
| Retention/export | Current source/inventory/basis/hold snapshot tokens; retention expected basis head can none, stale inventory409 versus expected-head412. Lease/retry artifact separate from request key | RetentionRepository/ExportService/ExportRepository |
| Duties/clocks | Business ACK K/request version/current recipient/source lock; first ACK server fact immutable. Clock kind authority/version/extension rules distinct; inbox read not ACK | BusinessDutyRepository/ClockDutyRepository |
| AI callback | K present; fingerprint detectionsJSON+checksum; belongs-to-job pin check not latest-active attempt/full identity fence (P1-02). Can't use this to promise replay security parity | ProcessingV2PersistenceService.ReceiveResultAsync |

409 means an action-specific conflict, key reuse, invalid lifecycle or source incompatibility; 412 means precondition/stale version where mapped; 428 means missing required header/precondition where source maps it. Many older actions map malformed/missing version to400 or service enum differently. Exact declared codes and source seams in primary catalog, no common handler policy invented. Generic500/internal_error cannot be retried as a successful business outcome.

Unknown outcome: keep exact key/body/source version/origin; inspect resource/receipt supported read; intentional same-content replay under current rights; stale conflict requires authoritative refetch/owner resolution, not changing key to overwrite. Offline per-item COMMITTED/REPLAYED is durable effect evidence, PENDING_DEPENDENCY/CONFLICT/STALE_SNAPSHOT is not local cleanup permission. Presigned URL expiry needs new URL under current valid upload, not new Report ID.

## Per-operation declared K/V and error status crosswalk

This index records OpenAPI declarations/required flags and advertised409/412/428; it doesn't override actual source group rules or guarantee test coverage. Read full catalog for all codes/body versions/source evidence. `—` means no declared header, not no body identity or current-source guard.

| API | K required / declaration facets | V required / declaration facets | Advertised409/412/428 |
|---|---|---|---|
| [API-001](02_Full-API-Catalog.md#api-001) | — | — | 409 |
| [API-002](02_Full-API-Catalog.md#api-002) | — | — | 409 |
| [API-003](02_Full-API-Catalog.md#api-003) | required=false; — | — | — |
| [API-004](02_Full-API-Catalog.md#api-004) | required=true; minLength=1 | — | 409 |
| [API-005](02_Full-API-Catalog.md#api-005) | — | — | 409 |
| [API-006](02_Full-API-Catalog.md#api-006) | — | — | 409 |
| [API-007](02_Full-API-Catalog.md#api-007) | required=true; minLength=1 | — | 409 |
| [API-008](02_Full-API-Catalog.md#api-008) | — | — | 409 |
| [API-009](02_Full-API-Catalog.md#api-009) | required=false; — | — | 409 |
| [API-010](02_Full-API-Catalog.md#api-010) | required=true; minLength=1 | — | 409 |
| [API-011](02_Full-API-Catalog.md#api-011) | required=true; minLength=1 | — | 409 |
| [API-012](02_Full-API-Catalog.md#api-012) | required=true; minLength=1 | — | 409 |
| [API-013](02_Full-API-Catalog.md#api-013) | — | — | — |
| [API-014](02_Full-API-Catalog.md#api-014) | — | — | — |
| [API-015](02_Full-API-Catalog.md#api-015) | required=true; minLength=1 | — | 409 |
| [API-016](02_Full-API-Catalog.md#api-016) | — | — | — |
| [API-017](02_Full-API-Catalog.md#api-017) | — | — | — |
| [API-018](02_Full-API-Catalog.md#api-018) | — | — | 409 |
| [API-019](02_Full-API-Catalog.md#api-019) | — | — | 409, 412 |
| [API-020](02_Full-API-Catalog.md#api-020) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-021](02_Full-API-Catalog.md#api-021) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-022](02_Full-API-Catalog.md#api-022) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-023](02_Full-API-Catalog.md#api-023) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-024](02_Full-API-Catalog.md#api-024) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-025](02_Full-API-Catalog.md#api-025) | — | — | — |
| [API-026](02_Full-API-Catalog.md#api-026) | — | — | — |
| [API-027](02_Full-API-Catalog.md#api-027) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-028](02_Full-API-Catalog.md#api-028) | — | — | — |
| [API-029](02_Full-API-Catalog.md#api-029) | — | — | — |
| [API-030](02_Full-API-Catalog.md#api-030) | — | — | — |
| [API-031](02_Full-API-Catalog.md#api-031) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-032](02_Full-API-Catalog.md#api-032) | required=true; — | — | 409 |
| [API-033](02_Full-API-Catalog.md#api-033) | required=true; — | — | 409 |
| [API-034](02_Full-API-Catalog.md#api-034) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-035](02_Full-API-Catalog.md#api-035) | — | — | — |
| [API-036](02_Full-API-Catalog.md#api-036) | required=true; minLength=1 | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]+={0,2}\"$" | 409, 412, 428 |
| [API-037](02_Full-API-Catalog.md#api-037) | — | — | — |
| [API-038](02_Full-API-Catalog.md#api-038) | — | — | — |
| [API-039](02_Full-API-Catalog.md#api-039) | — | — | — |
| [API-040](02_Full-API-Catalog.md#api-040) | — | — | — |
| [API-041](02_Full-API-Catalog.md#api-041) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-042](02_Full-API-Catalog.md#api-042) | — | — | — |
| [API-043](02_Full-API-Catalog.md#api-043) | required=true; minLength=1 | — | 409, 428 |
| [API-044](02_Full-API-Catalog.md#api-044) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-045](02_Full-API-Catalog.md#api-045) | — | — | 409 |
| [API-046](02_Full-API-Catalog.md#api-046) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-047](02_Full-API-Catalog.md#api-047) | — | — | — |
| [API-048](02_Full-API-Catalog.md#api-048) | — | — | 409 |
| [API-049](02_Full-API-Catalog.md#api-049) | — | — | — |
| [API-050](02_Full-API-Catalog.md#api-050) | required=false; — | — | 409 |
| [API-051](02_Full-API-Catalog.md#api-051) | — | — | 409 |
| [API-052](02_Full-API-Catalog.md#api-052) | — | — | 409 |
| [API-053](02_Full-API-Catalog.md#api-053) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-054](02_Full-API-Catalog.md#api-054) | — | — | — |
| [API-055](02_Full-API-Catalog.md#api-055) | — | — | 409 |
| [API-056](02_Full-API-Catalog.md#api-056) | — | — | — |
| [API-057](02_Full-API-Catalog.md#api-057) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-058](02_Full-API-Catalog.md#api-058) | — | — | — |
| [API-059](02_Full-API-Catalog.md#api-059) | required=true; minLength=1 | — | 409, 412, 428 |
| [API-060](02_Full-API-Catalog.md#api-060) | — | — | — |
| [API-061](02_Full-API-Catalog.md#api-061) | — | — | 409, 412 |
| [API-062](02_Full-API-Catalog.md#api-062) | — | — | 409 |
| [API-063](02_Full-API-Catalog.md#api-063) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409 |
| [API-064](02_Full-API-Catalog.md#api-064) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409 |
| [API-065](02_Full-API-Catalog.md#api-065) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-066](02_Full-API-Catalog.md#api-066) | required=true; minLength=1; maxLength=200 | required=false; pattern="^\".+\"$" | 409, 412, 428 |
| [API-067](02_Full-API-Catalog.md#api-067) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-068](02_Full-API-Catalog.md#api-068) | — | — | — |
| [API-069](02_Full-API-Catalog.md#api-069) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[0-9a-f]{64}\"$" | 409, 428 |
| [API-070](02_Full-API-Catalog.md#api-070) | — | — | — |
| [API-071](02_Full-API-Catalog.md#api-071) | — | — | — |
| [API-072](02_Full-API-Catalog.md#api-072) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-073](02_Full-API-Catalog.md#api-073) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-074](02_Full-API-Catalog.md#api-074) | required=true; minLength=1 | — | 409, 428 |
| [API-075](02_Full-API-Catalog.md#api-075) | — | — | — |
| [API-076](02_Full-API-Catalog.md#api-076) | — | — | 409 |
| [API-077](02_Full-API-Catalog.md#api-077) | — | — | — |
| [API-078](02_Full-API-Catalog.md#api-078) | required=false; — | required=false; — | — |
| [API-079](02_Full-API-Catalog.md#api-079) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | — | 409, 428 |
| [API-080](02_Full-API-Catalog.md#api-080) | required=false; — | required=false; — | — |
| [API-081](02_Full-API-Catalog.md#api-081) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-082](02_Full-API-Catalog.md#api-082) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-083](02_Full-API-Catalog.md#api-083) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-084](02_Full-API-Catalog.md#api-084) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-085](02_Full-API-Catalog.md#api-085) | required=false; — | required=false; — | 409 |
| [API-086](02_Full-API-Catalog.md#api-086) | — | — | 409 |
| [API-087](02_Full-API-Catalog.md#api-087) | required=false; — | required=false; — | 409 |
| [API-088](02_Full-API-Catalog.md#api-088) | required=false; — | required=false; — | — |
| [API-089](02_Full-API-Catalog.md#api-089) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-090](02_Full-API-Catalog.md#api-090) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-091](02_Full-API-Catalog.md#api-091) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-092](02_Full-API-Catalog.md#api-092) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-093](02_Full-API-Catalog.md#api-093) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-094](02_Full-API-Catalog.md#api-094) | required=false; — | required=false; — | — |
| [API-095](02_Full-API-Catalog.md#api-095) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1 | 409, 428 |
| [API-096](02_Full-API-Catalog.md#api-096) | required=false; — | required=false; — | — |
| [API-097](02_Full-API-Catalog.md#api-097) | required=false; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 412 |
| [API-098](02_Full-API-Catalog.md#api-098) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 409, 412, 428 |
| [API-099](02_Full-API-Catalog.md#api-099) | required=false; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 412 |
| [API-100](02_Full-API-Catalog.md#api-100) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 409, 412, 428 |
| [API-101](02_Full-API-Catalog.md#api-101) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 409, 412, 428 |
| [API-102](02_Full-API-Catalog.md#api-102) | required=false; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 412 |
| [API-103](02_Full-API-Catalog.md#api-103) | required=false; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 409, 412, 428 |
| [API-104](02_Full-API-Catalog.md#api-104) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-105](02_Full-API-Catalog.md#api-105) | — | — | — |
| [API-106](02_Full-API-Catalog.md#api-106) | required=true; minLength=1 | — | 409, 412, 428 |
| [API-107](02_Full-API-Catalog.md#api-107) | — | — | — |
| [API-108](02_Full-API-Catalog.md#api-108) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-109](02_Full-API-Catalog.md#api-109) | — | — | — |
| [API-110](02_Full-API-Catalog.md#api-110) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[0-9a-f]{64}\"$" | 409, 412, 428 |
| [API-111](02_Full-API-Catalog.md#api-111) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[0-9a-f]{64}\"$" | 409, 428 |
| [API-112](02_Full-API-Catalog.md#api-112) | — | — | — |
| [API-113](02_Full-API-Catalog.md#api-113) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-114](02_Full-API-Catalog.md#api-114) | — | required=false; — | — |
| [API-115](02_Full-API-Catalog.md#api-115) | — | required=false; — | 409 |
| [API-116](02_Full-API-Catalog.md#api-116) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-117](02_Full-API-Catalog.md#api-117) | — | required=false; — | — |
| [API-118](02_Full-API-Catalog.md#api-118) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-119](02_Full-API-Catalog.md#api-119) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-120](02_Full-API-Catalog.md#api-120) | — | required=false; — | — |
| [API-121](02_Full-API-Catalog.md#api-121) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-122](02_Full-API-Catalog.md#api-122) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-123](02_Full-API-Catalog.md#api-123) | — | required=false; — | 409 |
| [API-124](02_Full-API-Catalog.md#api-124) | — | required=false; — | — |
| [API-125](02_Full-API-Catalog.md#api-125) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-126](02_Full-API-Catalog.md#api-126) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-127](02_Full-API-Catalog.md#api-127) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-128](02_Full-API-Catalog.md#api-128) | — | required=false; — | — |
| [API-129](02_Full-API-Catalog.md#api-129) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-130](02_Full-API-Catalog.md#api-130) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; — | 409, 428 |
| [API-131](02_Full-API-Catalog.md#api-131) | required=false; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 412 |
| [API-132](02_Full-API-Catalog.md#api-132) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 409, 412, 428 |
| [API-133](02_Full-API-Catalog.md#api-133) | — | — | — |
| [API-134](02_Full-API-Catalog.md#api-134) | — | — | 409 |
| [API-135](02_Full-API-Catalog.md#api-135) | — | — | — |
| [API-136](02_Full-API-Catalog.md#api-136) | — | — | — |
| [API-137](02_Full-API-Catalog.md#api-137) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409 |
| [API-138](02_Full-API-Catalog.md#api-138) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409 |
| [API-139](02_Full-API-Catalog.md#api-139) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-140](02_Full-API-Catalog.md#api-140) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-141](02_Full-API-Catalog.md#api-141) | — | — | — |
| [API-142](02_Full-API-Catalog.md#api-142) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-143](02_Full-API-Catalog.md#api-143) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-144](02_Full-API-Catalog.md#api-144) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-145](02_Full-API-Catalog.md#api-145) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-146](02_Full-API-Catalog.md#api-146) | — | — | 409 |
| [API-147](02_Full-API-Catalog.md#api-147) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-148](02_Full-API-Catalog.md#api-148) | — | — | — |
| [API-149](02_Full-API-Catalog.md#api-149) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-150](02_Full-API-Catalog.md#api-150) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-151](02_Full-API-Catalog.md#api-151) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-152](02_Full-API-Catalog.md#api-152) | required=false; — | required=false; — | — |
| [API-153](02_Full-API-Catalog.md#api-153) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-154](02_Full-API-Catalog.md#api-154) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-155](02_Full-API-Catalog.md#api-155) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-156](02_Full-API-Catalog.md#api-156) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-157](02_Full-API-Catalog.md#api-157) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-158](02_Full-API-Catalog.md#api-158) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-159](02_Full-API-Catalog.md#api-159) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-160](02_Full-API-Catalog.md#api-160) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-161](02_Full-API-Catalog.md#api-161) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-162](02_Full-API-Catalog.md#api-162) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | — | 409, 428 |
| [API-163](02_Full-API-Catalog.md#api-163) | required=false; — | required=false; — | — |
| [API-164](02_Full-API-Catalog.md#api-164) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-165](02_Full-API-Catalog.md#api-165) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]{11}=\"$" | 409, 428 |
| [API-166](02_Full-API-Catalog.md#api-166) | required=false; — | required=false; — | — |
| [API-167](02_Full-API-Catalog.md#api-167) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"h4-policy-v1-[0-9a-f]{64}\"$" | 409, 428 |
| [API-168](02_Full-API-Catalog.md#api-168) | — | — | — |
| [API-169](02_Full-API-Catalog.md#api-169) | — | — | — |
| [API-170](02_Full-API-Catalog.md#api-170) | — | — | — |
| [API-171](02_Full-API-Catalog.md#api-171) | required=true; minLength=1; maxLength=128 | — | 409, 428 |
| [API-172](02_Full-API-Catalog.md#api-172) | — | — | — |
| [API-173](02_Full-API-Catalog.md#api-173) | — | — | — |
| [API-174](02_Full-API-Catalog.md#api-174) | required=true; minLength=1; maxLength=128 | required=true; minLength=1; pattern="^\"[^\"\r\n]+\"$" | 409, 412, 428 |
| [API-175](02_Full-API-Catalog.md#api-175) | — | — | — |
| [API-176](02_Full-API-Catalog.md#api-176) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=true; minLength=1; pattern="^\"[0-9a-f]{64}\"$" | 409, 428 |
| [API-177](02_Full-API-Catalog.md#api-177) | required=true; minLength=1; maxLength=200 | required=false; pattern="^\".+\"$" | 409, 412, 428 |
| [API-178](02_Full-API-Catalog.md#api-178) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-179](02_Full-API-Catalog.md#api-179) | required=true; minLength=1; maxLength=200 | required=true; minLength=1; pattern="^\".+\"$" | 409, 412, 428 |
| [API-180](02_Full-API-Catalog.md#api-180) | required=true; minLength=1; maxLength=200 | required=true; minLength=1; pattern="^\".+\"$" | 409, 412, 428 |
| [API-181](02_Full-API-Catalog.md#api-181) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-182](02_Full-API-Catalog.md#api-182) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-183](02_Full-API-Catalog.md#api-183) | — | — | 409 |
| [API-184](02_Full-API-Catalog.md#api-184) | required=true; minLength=1; maxLength=200 | required=false; pattern="^\".+\"$" | 409, 412, 428 |
| [API-185](02_Full-API-Catalog.md#api-185) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-186](02_Full-API-Catalog.md#api-186) | required=true; minLength=1; maxLength=200 | required=true; minLength=1; pattern="^\".+\"$" | 409, 412, 428 |
| [API-187](02_Full-API-Catalog.md#api-187) | required=true; minLength=1; maxLength=200 | required=true; minLength=1; pattern="^\".+\"$" | 409, 412, 428 |
| [API-188](02_Full-API-Catalog.md#api-188) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-189](02_Full-API-Catalog.md#api-189) | — | — | 409 |
| [API-190](02_Full-API-Catalog.md#api-190) | — | — | 409 |
| [API-191](02_Full-API-Catalog.md#api-191) | — | — | 409 |
| [API-192](02_Full-API-Catalog.md#api-192) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-193](02_Full-API-Catalog.md#api-193) | required=true; minLength=1; maxLength=200 | required=false; pattern="^\".+\"$" | 409, 412, 428 |
| [API-194](02_Full-API-Catalog.md#api-194) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-195](02_Full-API-Catalog.md#api-195) | required=true; minLength=1; maxLength=200 | required=true; minLength=1; pattern="^\".+\"$" | 409, 412, 428 |
| [API-196](02_Full-API-Catalog.md#api-196) | required=true; minLength=1; maxLength=200 | required=true; minLength=1; pattern="^\".+\"$" | 409, 412, 428 |
| [API-197](02_Full-API-Catalog.md#api-197) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-198](02_Full-API-Catalog.md#api-198) | required=false; — | required=false; pattern="^\".+\"$" | 412 |
| [API-199](02_Full-API-Catalog.md#api-199) | required=true; minLength=1; maxLength=200 | required=false; pattern="^\".+\"$" | 409, 412, 428 |
| [API-200](02_Full-API-Catalog.md#api-200) | required=true; minLength=1; maxLength=150; pattern="^[!-~]{1,150}$" | required=false; maxLength=66; pattern="^\"[0-9a-fA-F]{64}\"$" | 409, 412, 428 |
| [API-201](02_Full-API-Catalog.md#api-201) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-202](02_Full-API-Catalog.md#api-202) | — | — | 409 |
| [API-203](02_Full-API-Catalog.md#api-203) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-204](02_Full-API-Catalog.md#api-204) | required=true; minLength=1; maxLength=200 | — | 409, 428 |
| [API-205](02_Full-API-Catalog.md#api-205) | — | — | 409 |
| [API-206](02_Full-API-Catalog.md#api-206) | — | — | — |
| [API-207](02_Full-API-Catalog.md#api-207) | — | — | — |
| [API-208](02_Full-API-Catalog.md#api-208) | — | — | — |
| [API-209](02_Full-API-Catalog.md#api-209) | — | — | 409 |
| [API-210](02_Full-API-Catalog.md#api-210) | — | — | 409 |
| [API-211](02_Full-API-Catalog.md#api-211) | required=true; minLength=1 | — | 409, 428 |
| [API-212](02_Full-API-Catalog.md#api-212) | — | — | — |
| [API-213](02_Full-API-Catalog.md#api-213) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-214](02_Full-API-Catalog.md#api-214) | required=true; minLength=1 | — | 409, 428 |
| [API-215](02_Full-API-Catalog.md#api-215) | — | — | — |
| [API-216](02_Full-API-Catalog.md#api-216) | required=true; minLength=1 | — | 409, 412, 428 |
| [API-217](02_Full-API-Catalog.md#api-217) | — | — | — |
| [API-218](02_Full-API-Catalog.md#api-218) | — | — | 409, 412 |
| [API-219](02_Full-API-Catalog.md#api-219) | required=true; minLength=1 | required=true; minLength=1 | 409, 412, 428 |
| [API-220](02_Full-API-Catalog.md#api-220) | required=true; minLength=1; maxLength=128 | — | 409, 428 |
| [API-221](02_Full-API-Catalog.md#api-221) | — | — | — |
| [API-222](02_Full-API-Catalog.md#api-222) | required=true; minLength=1; maxLength=128 | required=true; minLength=1; pattern="^\"[^\"\r\n]+\"$" | 409, 412, 428 |
| [API-223](02_Full-API-Catalog.md#api-223) | — | — | — |
| [API-224](02_Full-API-Catalog.md#api-224) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-225](02_Full-API-Catalog.md#api-225) | — | — | — |
| [API-226](02_Full-API-Catalog.md#api-226) | — | — | — |
| [API-227](02_Full-API-Catalog.md#api-227) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-228](02_Full-API-Catalog.md#api-228) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-229](02_Full-API-Catalog.md#api-229) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-230](02_Full-API-Catalog.md#api-230) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-231](02_Full-API-Catalog.md#api-231) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-232](02_Full-API-Catalog.md#api-232) | required=true; minLength=1; maxLength=200 | required=true; minLength=1 | 409, 412, 428 |
| [API-233](02_Full-API-Catalog.md#api-233) | required=true; — | — | 409, 428 |
| [API-234](02_Full-API-Catalog.md#api-234) | — | — | — |
| [API-235](02_Full-API-Catalog.md#api-235) | required=true; — | required=true; — | 409, 412, 428 |
| [API-236](02_Full-API-Catalog.md#api-236) | required=true; — | — | 409, 428 |
| [API-237](02_Full-API-Catalog.md#api-237) | — | — | — |
| [API-238](02_Full-API-Catalog.md#api-238) | — | — | 409 |
| [API-239](02_Full-API-Catalog.md#api-239) | required=true; minLength=1 | required=true; minLength=1; pattern="^\"[A-Za-z0-9+/]+={0,2}\"$" | 409, 412, 428 |
| [API-240](02_Full-API-Catalog.md#api-240) | required=true; minLength=1 | — | 409 |
| [API-241](02_Full-API-Catalog.md#api-241) | — | — | — |

Source: [IdempotencyOperationService](../../../RoadGuardSystem.Repositories/Idempotency/IdempotencyOperationService.cs#L8), [Huy01CommandExecution](../../../RoadGuardSystem.Services/Interfaces/Reports/Huy01CommandExecution.cs#L5), [RepairPolicyService](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairPolicyService.cs#L8), [ProjectLifecycleService](../../../RoadGuardSystem.Services/Implementations/Projects/ProjectLifecycleService.LD06.cs#L8), [OfflineWorkflowService](../../../RoadGuardSystem.Services/Implementations/Offline/OfflineWorkflowService.cs#L8). Class/method validation source is linked per operation; test source NOT_RUN, P1/P2/test debt stays open.
