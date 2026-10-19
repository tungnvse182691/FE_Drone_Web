# API conventions và integration rules

**Phase 2C · 15/10/2026 · implementation source pinned `36c3a1d273f17dd29b816136ae0182a821fd79e4` · independent JEV pending.**

[API entrance](README.md) · [Review/evidence](PHASE2C_REVIEW_REPORT.md) · [10 workflows](../02_Business-Workflows/README.md) · [Backend/Data](../03_Backend-and-Data/PHASE2B_REVIEW_REPORT.md).

`CURRENT_VERIFIED` = source/static contract discovery, không HTTP/E2E/deployment PASS. `CURRENT_IMPLEMENTED` trong phần AI là phân nhóm contract BE đã có, không nhãn real provider acceptance. `TARGET_CONFIRMED` client/business theo [owner decisions](../../product/confirmed-decisions.md), [latest HUY](../../../planning/development/HUY-FINAL-INTEGRATION.md) và owner Phase2C authorization; precedence theo [governance](../00_Governance/01_Authority-and-Source-of-Truth.md). `PROPOSED`, `NOT_VERIFIED`, `HISTORICAL` giữ phạm vi. Product HoangHaiWarrantySystem; technical RoadGuardSystem/routes giữ nguyên.

## Base URL, version and transport

Use configured backend origin supplied by deployment owner + exact catalog route `/api/v1/...`. No production hostname is invented. Version is route-based Asp.Versioning, not a new v2 namespace inferred from controller name. `/health` is unversioned liveness, separate from 241 business operations. API aliases are separate method/path operations with shared action; geometry's five aliases explain236actions→241operations. Keep `/auth/android/*`; Mobile product React Native Expo is not limited by that technical route name.

HTTPS/cookies/cross-origin/reverse-proxy/DataProtection deployment is NOT_VERIFIED. Web primary Supervisor/PM, Mobile primary Reporter/Operator/Crew, service caller internal AI. Scheme chooses authenticated transport, not business role: route metadata/legacy eligibility, role/current membership/assignment/ownership/version remain independent. Read chapters04/09 for role/consumer differences.

## Headers, parameters, body and responses

Path GUID/enum/route syntax, query defaults/bounds and body shape come from per-operation tables/current DTO/schema. JSON request content types advertised by source may include application/json, text/json, application/*+json; don't assume a form or raw video POST when upload contract returns multipart URLs. Binary content routes and no-content204 differ from JSON. Schema `$ref` is a reference, not a literal payload field. Source DTO JsonUnmappedMemberHandling.Disallow is additional strictness; don't add arbitrary envelope fields.

`Authorization: Bearer <access-token>` for human bearer; AI callback named scheme/audience separate. Web cookies/anti-forgery are chapter04. `X-Correlation-ID` UUID is emitted by middleware and appears in ProblemDetails; correlation is tracing, not operation key or actor. `Idempotency-Key` K and `If-Match` V only where action accepts/enforces; header declaration can be optional on read helpers. Preserve strong ETag quotes; module versions include Base64 rowversion or content/version tokens, not one interchangeable format. Required/body OperationId may exist without K header.

Response success statuses, headers/content schema and error codes are per-operation. Success replay can return different status from create; no common 201 promise. Complete202 is verification intent, not file VERIFIED. HTTP200 signed batch doesn't mean every item committed. Some inline/framework/anonymous response shapes have incomplete OpenAPI schema; source projection is authority and caveat is explicit, not fake fixture.

## Pagination and filtering

Cursor/limit/skip/take/search filters differ by endpoint. Catalog parameter default/min/max is the declaration; source can check cursor length/signature/current actor/project/source/version. Staff includeHistory only Supervisor; list defaults/role filter not role grants. FIELD/repair/survey/notification lists aren't one general all-project endpoint. Opaque cursor must not be synthesized from row ID or reused for another actor/project when source binds it. No “all APIs use page/pageSize” convention invented.

## Timestamps, coordinates and evidence

Use actual DateTimeOffset/date-time and DateOnly/date facets; don't convert device claim to verified server time. Preserve offsets and source time certainty/monotonic boot fields where present. Server received/first ACK/original start/actual finish are different facts. No signed historic UTC proof.

Lat/lon/geometry/WKT/SRID/band/segment/section are endpoint-specific. UNKNOWN location can omit coordinates; numeric0 valid. No universal coordinate order/transformation/accuracy or pixel↔meters conversion assumed from JSON numeric array. GIS segment/section differs from image road segmentation; AI bbox normalized0..1 is not Crew physical dimension. Source versions/model/frame/timestamp/checksum/provenance must travel intact.

## Errors, retries and evidence levels

ProblemDetails commonly application/problem+json with status/code/correlationId/instance and validation errors; controller-specific shape and mappings remain in catalog/OpenAPI/source. Generic500 removes internal detail/stack. Don't assume every400/404/409 has same code, or all unexpected exceptions are schema-defined business errors. 409/412/428 meanings are action-specific in chapter05.

On unknown network outcome reuse exact same operation identity/key/payload/version, read durable receipt/resource if supported, and revalidate current rights. Don't increment original ID to “retry”, overwrite competing version, discard unacked local evidence, or treat external retry as exactly-once. Presigned URL expiry/OTP rate limit/access refresh follow their own source gates.

Fresh disconnected discovery is documentation/static verification, no actual HTTP/SQL/device/provider acceptance. Test locators are source candidates; backend tests NOT_RUN Phase2C. [Open GAPs](../00_Governance/03_Implementation-and-Verification-Status.md) remain unchanged; artifact text differences/anonymous schemas are explicitly reported. No accepted payload examples generated.

Source: [Program](../../../RoadGuardSystem.API/Program.cs), [platform composition](../../../RoadGuardSystem.API/Extensions/ServiceCollectionExtensions.cs), [source OpenAPI](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml), [DTO source index](../../RoadGuard-Backend-Official/10_Traceability/source-inventory.json). All at source pin above.
