# Phase 2A — Canonical business workflows review report

**Owner: Phase 1 PASS / Phase 2A AUTHORIZED. Independent JEV review: PENDING.** Date 14/10/2026. [Canonical entrance](../README.md) · [Workflow index](README.md) · [Unchanged Phase 0 JEV register](../../audit/HHWS-DOCS-REBUILD-01/03_BUSINESS_AND_PLATFORM_CONFLICTS.md).

## Delivery scope and pinned evidence

Repository `HoangAnhVu2207/RoadGuardSystem`, branch `huy-review`. Approved base/source pin **`d91c2e82f1c6feb3a7dcffc4573902314927ae94`**; initial fetch showed local/origin ahead/behind 0/0. Phase 0 implementation inventory pin `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; hashes are rechecked rather than assuming old prose remains current. Phase 0 report commit `ccf0e70128b857d796a057b0aa30dc6bde4d20c9`. Source locators below and in each workflow refer to the approved Phase 2A base, not to an unspecified latest branch.

Only twelve new Markdown files in this folder (ten workflows, index, this report) and necessary canonical README/governance03–05 changes belong to the delivery. Root Codex is the single writer. Seven pre-existing untracked inputs (five loose HHWS audit files, Reporter audit and Expo handoff) are preserved/excluded. Backend Official, old product/planning docs and existing canonical authority/matrix/checker are retained. No backend source, schema, migration, OpenAPI, test, lock, UI or provider implementation changes.

The delivery commit SHA cannot be embedded into its own committed content without changing that SHA. Resolve the exact delivery with `git log -1 --format=%H -- docs/HoangHaiWarrantySystem-Official/02_Business-Workflows/PHASE2A_REVIEW_REPORT.md`; final chat delivery supplies the pushed SHA and remote equality. Diff review: `git show --stat <delivery-sha>` and `git diff d91c2e82f1c6feb3a7dcffc4573902314927ae94 <delivery-sha> -- docs/HoangHaiWarrantySystem-Official`. No source fix or independent review is implied by a documentation commit.

## Workflows written and source coverage

| Workflow | Controllers / operations in primary appendix | Key source producer and business distinction |
|---|---|---|
| [01 Authentication/users/memberships](01_Authentication-Users-and-Memberships.md) | 9 / 29 | AuthService login/refresh; onboarding OTP; StaffReadRepository current access; session ≠ membership |
| [02 Project/roads/geometry/slabs](02_Project-Road-Geometry-and-Pavement.md) | 7 / 44 | ProjectCreationService; GeometryWorkflowPersistenceService draft/confirm/publish; PavementWorkflow; GIS ≠ image mask |
| [03 Reporter/private evidence/Case](03_Reporter-Evidence-and-IncidentCase.md) | 3 / 19 | ReporterReportService/Repository creates unassigned Case without Survey; Supervisor triage; publication ≠ conclusion |
| [04 Candidate assessment/Defect](04_Candidate-Decisions-and-Defect.md) | 3 / 12 | CandidateDecisionRepository.SaveAcceptedAsync; PM decisions and source head; matching ≠ acceptance |
| [05 Survey/dataset/processing](05_Drone-Survey-Dataset-and-Processing.md) | 6 / 40 | SurveyV2PersistenceService dataset/assignment; ProcessingV2 callback and ANH02 synthetic boundary |
| [06 FIELD/measurement](06_FIELD-Inspection-and-Measurements.md) | 2 / 20 | FIELD guard/create/reuse/formal submit; assessment ≠ formal intake; measurement ≠ repair |
| [07 NORMAL repair](07_NORMAL-Repair-and-Acceptance.md) | 5 / 22 | Producing/Execution repositories: proposal→approval→assignment→physical execution→review→Supervisor final |
| [08 Fast Track](08_FastTrack-Policy-and-Confirmation.md) | 3 / 9 | PM policy, Supervisor road coverage, current eligibility, original window, PM final; shared execution links 07 |
| [09 Offline](09_Offline-Snapshots-Sync-and-Handover.md) | 1 / 18 | Client public-key enrollment; canonical signature/current rights/per-item transaction; scoped handover |
| [10 Notifications/reporting/retention/export](10_Notifications-Publication-Reporting-and-Retention.md) | 8 / 28 | BusinessDuty ACK ≠ inbox read; Export temporal guard; retention review eligibility ≠ deletion |

Subtotals are checked against exact API ID rows, with no duplicated operation across primary appendices. Full scope **47 controllers / 241 operations / 223 paths**; 236 action declarations plus 5 Geometry aliases. GET `/health` is an operational endpoint outside this controller count, not an omitted business workflow. [Full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) retains per-operation status/error/security/request/response/version details; [source map](../../RoadGuard-Backend-Official/10_Traceability/api-source-map.json) retains exact source lines and static seam/test candidates. Every primary API method/path/action/request-success DTO reference is source-derived; no provider endpoint or sample payload invented.

Each workflow covers purpose, actors/platform, preconditions, domain transitions versus API wire, success/alternative flows, authorization, evidence lifecycle, idempotency/concurrency/offline, source references and current limitations/test NOT_RUN. The controller grouping is a navigation/traceability partition, not a claim that every method/condition has runtime coverage. Cross-workflow APIs remain in one primary appendix with links for common repair/upload/publication consumers.

## Authority and semantic review

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY R/H/ND01 and later activation guidance](../../../planning/development/HUY-FINAL-INTEGRATION.md), Phase 2A authorization. HUY later records supersede older embedded checkpoint wording; old test claims remain at their historical revision. `CURRENT_VERIFIED` here means observed implementation/source plus fresh static checks, not executed business acceptance. `NOT_VERIFIED` marks unavailable runtime/consumer evidence; `PROPOSED` marks consumer architecture awaiting design/adoption, `HISTORICAL` prior tests/checkpoints. [Governance precedence and labels](../00_Governance/01_Authority-and-Source-of-Truth.md) still apply.

Preserved decisions: product HoangHaiWarrantySystem, technical RoadGuardSystem and `/auth/android/*` unchanged; Supervisor/PM Web, Reporter/Operator/Crew Expo Mobile; Reporter no Drone prerequisite; Supervisor triage unassigned Case; AI candidates only, PM Defect authority, Crew physical measurement; NORMAL and FT approval/final roles separate; GIS section/segment ≠ pixel segmentation. No SfM, orthomosaic, DSM/3D or AI physical measurement scope restored. Existing compatibility validation/derived-measurement endpoints are recorded without adopting them as new product behavior.

## Open JEV findings — not closed by documentation

All evidence locators in this table are at `d91c2e82f1c6feb3a7dcffc4573902314927ae94`. Priority/IDs are preserved from Phase 0; this is not a new exhaustive severity count.

| ID / Judgment | Evidence: path, symbol/line, route boundary | Variance: expected → observed; impact | Recommendation / owner |
|---|---|---|---|
| P1-01 / PARTIAL | [ProcessingV2PersistenceService.CreateAsync/outbox L67](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L67); [Anh02AiService L24](../../../RoadGuardSystem.Services/Implementations/Processing/Anh02/Anh02AiService.cs#L24); processing API appendix 05 | Real video/FastAPI adopted transport/model expected; dispatch record/synthetic analysis do not establish real provider acceptance | AI+BE adopt/verify actual protocol/model/artifact access separately; no invented provider endpoint |
| P1-02 / PARTIAL | [ReceiveResultAsync L117–148](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L117); POST `/api/v1/internal/processing-jobs/{jobId}/results` | Attempt belongs-to-job and manifest/model/mode checks exist; latest/active fence and full receipt identity binding incomplete. Runtime exploit NOT_VERIFIED | BE+AI bounded callback design/negative verification; no source edit here |
| P1-03 / PARTIAL | [CandidateMatchingService.MatchAsync L88–90](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateMatchingService.cs#L88); candidate API appendix 04 | Expected sourced location/accuracy/history/image fallback; metric distance null/availability false while scope/neighbors/history exist | BE+owner source facts; bounded matching work; no inferred threshold or automatic KEEP_NEW |
| P1-04 / PARTIAL | [ReporterEvidenceService.DownloadPublicationAsync/DownloadAsync L160–187](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L160); Reporter evidence downloads appendix 03 | Reporter checks current rights before storage await but lacks the subsequent temporal recheck present in export; potential race, no reproduced leak claimed | BE delayed-open private/publication tests then bounded guard/dispose follow-up |
| P1-05 / NOT_VERIFIED | [Phase 0 external gates](../../audit/HHWS-DOCS-REBUILD-01/05_OPEN_DECISIONS_AND_GAPS.md); [Android transport test source L20](../../../tests/RoadGuardSystem.ApiTests/Authentication/Huy01AndroidTransportTests.cs#L20); workflows 01–10 | Backend sources/test fixtures do not prove actual Expo/Web/provider/native keys/local encryption/video/model/SMTP/MinIO/GIS/SLO/restore | External teams+BE/ops supply consumer/deployment evidence; no claim missing functionality from missing docs alone |
| P2-06 / PARTIAL | [RepairWorkflowRepository.ConfirmFinalAsync L33–88](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L33); [H6RepairNotificationSourceAdapter L252–260](../../../RoadGuardSystem.Repositories/Implementations/Messaging/H6RepairNotificationSourceAdapter.cs#L252); final confirmation in common repair API 07 | Supervisor FT final information expected; decision/audit exists but informational producer absent. PM final authority remains valid | Huy BE source-recipient/outbox/dedup/rollback package; do not add Supervisor approval |
| P2-07 / PARTIAL | [CaseWorkflowRepository.ApplyAsync L150–152](../../../RoadGuardSystem.Repositories/Implementations/Cases/CaseWorkflowRepository.cs#L150); POST `/api/v1/cases/{caseId}/conclusions`; HUY R10 | Localized pre-Defect FIELD/DRONE final conclusion `source_not_ready`; ExistingEvidence and Reporter→Defect→FIELD are distinct existing branches | BE+owner assign producer scope; no fake Survey/Defect FK or blanket missing Reporter lifecycle assertion |

Remaining Phase 0 P2-01..P2-05 (stale client/name/entrance wording, V2 unadopted lock mismatch, failed Swagger source-excerpt assertion and old link debt) remain in [status registry](../00_Governance/03_Implementation-and-Verification-Status.md). Canonical navigation improves exact topics; no mass deprecation, lock refresh, test edit, old-link repair or automatic GAP closure occurs. Phase 0 checkpoint 0 confirmed P0 / 5 P1 / 7 P2 remains historical in scope.

## Documentation gaps and dependent decisions

**Judgment: PARTIAL.** Evidence: each workflow's source/DTO/guard appendix and the JEV table above. Variance: business narratives now have consistent platform/authority/lifecycle references, but there is no new runtime acceptance or provider/native architecture adoption. Recommendation: independent JEV reviews this docs diff; bounded implementation/design follow-ups remain separate.

- Source pin/registry establishes backend behavior; actual consumer repositories/devices/provider and source data acceptance are NOT_VERIFIED. Owner/teams must approve remaining real-provider protocol/context/capabilities/model evidence and authoritative CRS/coverage where needed. No generic “confirm all decisions again” gate added.
- SQLCipher/equivalent database encryption, files/cache/queue encryption and secure private/data keys remain FE responsibilities, native architecture PROPOSED/NOT_VERIFIED. Backend signed/encrypted handover does not prove encrypted local SQLite. Recovery/escrow/backup/key-loss policy cannot be invented from public-key registration.
- Additional FT offline data after original-window expiry remains deferred per ND01; no backdating, resetting original clock or signature-based historic UTC assumption.
- Source-level API/DTO references are complete navigation for this phase; exact JSON examples, UI/screen behavior, provider cookbook and backend/data rewrite remain future scope. Compatibility endpoints do not override excluded product capabilities.

## Verification and tests

Phase 2A executes read-only documentation/static checks, not backend acceptance. Results below come from the executed documentation/static commands; final staged whitespace/scope check occurs before commit. No tests/source/OpenAPI are rewritten to obtain PASS.

| Check / command | Current Phase 2A result |
|---|---|
| `python docs/HoangHaiWarrantySystem-Official/tools/check_links.py` | PASS: 19 Markdown pages / 1301 local links / 0 errors. Local existence/Markdown anchors only; external URLs and deployed behavior not checked |
| Temporary helper `hhws_phase2a_verify.py` outside repo: API IDs/method/path/DTO/source-line coverage, source hashes, seven pre-existing hashes, allowed changed paths and checker controls | PASS: 10 workflows, 47 controllers / 241 unique operation IDs / 223 paths; 1001 line references within source bounds, 445 indexed type-declaration references; 8 checker controls; 0 unpublished targets; 1334 source hashes and 7 pre-existing files unchanged |
| `git diff --check`, final staged `git diff --cached --check` and allowlist inspection | PASS: unstaged and staged whitespace checks exit 0; exact staged allowlist 16 Markdown files (12 new + 4 canonical updates), 1361 insertions / 30 deletions; no out-of-scope tracked change |
| Backend build/unit/HTTP/SQL tests | **NOT_RUN**: docs-only/source hashes unchanged; no production/source change to exercise |
| Web/Expo/native crypto/keys/files/queue/FastAPI/provider/MinIO/SMTP/GIS/deployment/SLO/restore acceptance | **NOT_RUN / NOT_VERIFIED**; no real external test execution |

Phase 0 actual focused API/OpenAPI tests remain **HISTORICAL 16 PASS / 1 FAIL / 0 SKIP**; SWG-014 stored BusinessDuty source excerpt assertion failed. V2 `check_contracts.py` and `validate_package.py` exited 1 at CONTRACT_LOCK_MISMATCH, later assertions not reached. Docker absence was a Phase 0 environment observation, not asserted as a current Phase 2A environment check. Earlier HUY/Reporter positive results are source-referenced historical evidence, not rerun PASS here. Test-file lists under workflows are static candidates, not per-scenario executed coverage.

## Two self-review passes and independent review

Pass 1 — business/authority/source: compare current producing seams, owner decisions, state enums versus wire, PM/Supervisor/Crew scope and source/evidence lifecycle. Corrected policy ownership to PM and road coverage confirmation to Supervisor; separated NORMAL/FT, assessment/formal intake/actual start/finish, Case conclusion/publication and signed batch ACK/business received ACK. Kept all seven mandated findings and old test/contract debt.

Pass 2 — delivery/navigation/traceability: inspect every workflow's primary API rows, DTO/entity/service/repository/test references and line bounds; necessary canonical links; old-file/source preservation; local link/anchor negative controls and final diff/scope. Static verification results are recorded above; final staged inspection completes the delivery gate. This is Codex **self-review**, not independent JEV or owner acceptance.

Independent JEV review **PENDING** after push. No external review outcome fabricated. **STOP after Phase 2A delivery; Phase 2B NOT_STARTED.**
