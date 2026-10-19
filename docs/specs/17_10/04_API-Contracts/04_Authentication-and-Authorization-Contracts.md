# Authentication và authorization contracts

**Phase 2C · 15/10/2026 · implementation source pinned `36c3a1d273f17dd29b816136ae0182a821fd79e4` · independent JEV pending.**

[API entrance](README.md) · [Review/evidence](PHASE2C_REVIEW_REPORT.md) · [10 workflows](../02_Business-Workflows/README.md) · [Backend/Data](../03_Backend-and-Data/PHASE2B_REVIEW_REPORT.md).

`CURRENT_VERIFIED` = source/static contract discovery, không HTTP/E2E/deployment PASS. `CURRENT_IMPLEMENTED` trong phần AI là phân nhóm contract BE đã có, không nhãn real provider acceptance. `TARGET_CONFIRMED` client/business theo [owner decisions](../../product/confirmed-decisions.md), [latest HUY](../../../planning/development/HUY-FINAL-INTEGRATION.md) và owner Phase2C authorization; precedence theo [governance](../00_Governance/01_Authority-and-Source-of-Truth.md). `PROPOSED`, `NOT_VERIFIED`, `HISTORICAL` giữ phạm vi. Product HoangHaiWarrantySystem; technical RoadGuardSystem/routes giữ nguyên.

## Phase 3A-C02 scoped WebAuth errata

The Phase 2C catalog generic `Cookie eligibility metadata=false` wording must not override direct controller evidence for WebAuth. API-013 Csrf, API-014 Login and API-016 Renew are `[AllowAnonymous]` bootstrap endpoints; API-015 Logout and API-017 Session explicitly use `WebCookieConfiguration.Scheme` (`RoadGuardWeb`). This correction is scoped to WebAuth classification only; routes, DTOs, OpenAPI and production code are unchanged. Other endpoints remain Bearer-only unless metadata or the source legacy selector admits the request.

## Current source schemes and authority

Human default RoadGuardUser policy selector chooses bearer when Authorization exists, otherwise eligible cookie RoadGuardWeb with session cookie. Cookie eligibility is metadata plus exact legacy predicates, not all API paths or a product-client permission. AI callback uses AiServiceBearer/AiCallback policy, audience roadguard-be-ai, issuer/lifetime/kid signing key + nonempty subject/exact client_type AI_SERVICE. Human PM token isn't AI identity. No provider token provisioning endpoint invented.

Authenticated actor still needs active account/role/session/issued-role/password-state, effective membership/current assignment/ownership and source/head admission. Supervisor scope doesn't grant all PM/Crew commands. PM-only candidate/Defect/labels source reads/writes stay PM; current processing IsManager permits Supervisor/PM for create/retry (primary workflow PM). InspectionTasks.List is Crew-only; directory account read Supervisor. Generic ProjectScopeGuard doesn't itself define a staff-only allowlist: work-package policy uses matching current membership/role, not blanket public access; Reporter membership/data scenario NOT_VERIFIED and not a target Reporter consumer or PM/Crew grant.

## Web sequence

GET `/api/v1/auth/web/csrf` obtains request token/headerName; POST login validates X-CSRF-TOKEN and credentials, issues Secure/HttpOnly __Host-RoadGuardSession and protected __Host-RoadGuardRenewal. GET session reads authoritative state. POST renew explicitly forbids Authorization and validates CSRF/renewal/current identity. POST logout needs CSRF + K/current claims and revoke/replay guard. Unsafe cookie-authenticated eligible routes require anti-forgery via middleware; mixed authenticated cookie/bearer of different actors rejected.

Ticket finite12h/non-sliding; persistent renewable server session doesn't imply endless ticket. Renewal cookie MaxAge365d isn't business max session expiry or keyring guarantee. JWT keys versus DataProtection keyring distinct; deployment cross-origin/proxy/key continuity NOT_VERIFIED. Forced password change/legacy bounded session exceptions follow source, not client state.

## Reporter Mobile source chain — not executed E2E

| Step | Current primary operations | Source gate |
|---|---|---|
| OTP registration | API-010 register, API-012 verify, API-011 resend | IdentityOnboardingService intent/challenge; source defaults10min/5attempts/resend60s/3per15m configurable; live SMTP NOT_VERIFIED |
| Mobile credential/session | API-002 Android login, API-003 Android refresh; shared API-007 logout | SessionTransport.Android, finite15m access + renewable session/current role/rotation; do not rename route |
| Private photo upload | API-211 create, API-214 part URLs, API-213 complete, API-212 session/API-208 metadata poll | Own private REPORT_PHOTO; MIME/size/checksum; complete≠VERIFIED |
| Report | API-216 create, API-215 list, API-217 detail | Own verified evidence/description/location; unassigned IncidentCase with no Drone Survey |
| Follow-up | API-219 supplement, API-218 report evidence download, API-209 own file download, API-210 published evidence download | Current ownership/active source/explicit publication recipients; no internal Case/PM rights |

This chain is CURRENT_VERIFIED source/controller/service linkage, **NOT_RUN combined HTTP/Expo E2E**. Reporter receives public updates only after authorized PM Case publication API-021; Case conclusion alone isn't publication. Supervisor triage API-024 before PM assigned Case handling. Reporter isn't assigned Crew enrollment/signed sync, FIELD physical measurement, Defect decision or project policy rights.

Mobile generic bearer compatibility `/auth/login`/`refresh` differs from Android transport; use actual supported transport state, not interchange refresh credentials. Staff invitation API-032 issue Supervisor, API-033 accept invitation/token/issued role; staff identities don't come from Reporter register request selecting PM.

## Current role/resource rules and privacy

Catalog actor/scope fields and consumer crosswalk apply per-operation, including method-specific read/write differences. Normal approval/final Supervisor, FT final PM; FT policy PM/road coverage confirmation Supervisor. Crew task-bound geometry/evidence differs from projectwide pavement. Notifications are current recipient/source-filtered; read isn't business received ACK. Offline current source actor versus importer/recipient remains distinct.

P1-04 Reporter download lacks equivalent post-storage-await recheck implemented by export, risk/exploit NOT_VERIFIED. P1-02 attempt binding/fencing partial; P1-03 matching source partial; P1-05 real clients/token storage/local encryption/provider/deployment unverified. No signed person/time attestation, no encrypted local SQLite claim from handover. P2-06/P2-07 remain. Source tests cited in primary catalog NOT_RUN here.

Exact sources: [Web selector](../../../RoadGuardSystem.API/Authentication/WebCookieConfiguration.cs), [Web controller](../../../RoadGuardSystem.API/Controllers/WebAuthController.cs), [CSRF middleware](../../../RoadGuardSystem.API/Middlewares/WebCookieRequestMiddleware.cs), [Auth service](../../../RoadGuardSystem.Services/Implementations/Authentication/AuthService.cs), [session validator](../../../RoadGuardSystem.Services/Implementations/Authentication/AuthoritativeSessionValidator.cs), [AI scheme](../../../RoadGuardSystem.API/Authentication/AiServiceJwtBearerConfiguration.cs), [project policy](../../../RoadGuardSystem.API/Authorization/ProjectAccessAuthorization.cs), [project scope](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs). Source pin above; runtime NOT_RUN.
