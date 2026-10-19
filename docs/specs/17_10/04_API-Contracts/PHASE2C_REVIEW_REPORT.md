# Phase 2C review — Full Backend API Contracts

**15/10/2026 · Phase 2B owner PASS for documentation scope; Phase 2C authorized. Independent JEV: PENDING.** [API entrance](README.md) · [Canonical entrance](../README.md).

## Baseline, delivery and allowed scope

Repository `HoangAnhVu2207/RoadGuardSystem`, branch `huy-review`, approved implementation/source base **`36c3a1d273f17dd29b816136ae0182a821fd79e4`**. Initial fetch local/origin0/0; Root Codex single writer. New scope eleven API Markdown files plus necessary canonical README/governance03–05 status/navigation/crosswalk. Source/schema/database/migrations/tests/OpenAPI/contract locks and Phase2A/2B/old docs unchanged; seven pre-existing untracked inputs preserved and excluded. No Web/Expo/FastAPI implementation or Phase3.

Exact delivery SHA is supplied after push/remote equality in final chat. To avoid circular commit, resolve this committed report's delivery using `git log -1 --format=%H -- docs/HoangHaiWarrantySystem-Official/04_API-Contracts/PHASE2C_REVIEW_REPORT.md`; inspect `git diff 36c3a1d273f17dd29b816136ae0182a821fd79e4 <delivery-sha> -- docs/HoangHaiWarrantySystem-Official` and `git show --stat <delivery-sha>`.

## Coverage and semantic source review

| Output | Coverage / evidence |
|---|---|
| README + conventions | Authority/current baseline/version/health/auth/content/coordinates/time/retries; no real hostname/example fixtures |
| Full API catalog | **241 unique method/path operations /47 controllers /223 paths**, one primary API ID heading each, grouped by10 workflows. Controller/action/source/SHA, actor/scope/client, headers/query/path/body, success/errors/schemas, K/V/gates/source seam/test locators/status |
| DTO/schema | **357 schemas**, required/nullable/enums/composition/source attrs/record parameters; detailed transitive request inputs, condensed response property index, full unchanged artifact reference. No raw YAML/example clone |
| Auth | Web CSRF/cookie/session/renewal vs Android transport bearer/refresh, Reporter OTP→private VERIFIED→report/supplement/publication, AI named identity; no Reporter PM/Crew grant |
| K/V/errors |241 declared-header/error crosswalk + actual module-specific runtime keys/versions/replay/current-rights/unknown outcome; optional helper headers on GET distinguished |
| Upload | Private/project/offline scopes, part URLs/ETag/checksum/complete≠VERIFIED, current ownership/source temporal guard and actual worker/environment registration |
| Offline | Exact source manifest/envelope/core hash/digest/P256 SPKI/P1363 distinction, literal canonical source excerpt, signed current admission/per-item outcomes/handover; no arbitrary JSON.stringify or person/time proof |
| Processing/AI | Implemented BE DTO/normalizer/pins/service auth/attempt gap; proposed external protocol versus NOT_VERIFIED real YOLO/provider |
| Consumer crosswalk |241 rows reference primary catalog; multiple clients only under current role/source. Work-package helper admission noted without granting Reporter staff authority |

Catalog generation uses source-mapped metadata and exact fresh Swagger shapes, not method names/Swagger summaries alone: separate curated action-role/scope/gates were checked against actual services/repositories/controllers/authoritative session/purpose/source guards. Examples of substantive distinctions: Defect/Candidate/TrainingLabel reads PM-only; InspectionTasks.List Crew-only; invitation issue Supervisor; processing Create/Retry IsManager PM/Supervisor; policy PM vs road-coverage Supervisor; NORMAL final Supervisor vs FT final PM; public publication separate Case conclusion; offline artifact register includes Supervisor but normal enrollment excludes Reporter/Operator. Shared static guard/test references are labeled candidates, not action execution traces.

Source evidence: [API/source map](../../RoadGuard-Backend-Official/10_Traceability/api-source-map.json), [method/guard index](../../RoadGuard-Backend-Official/10_Traceability/api-method-evidence.json), [declarations](../../RoadGuard-Backend-Official/10_Traceability/source-inventory.json), [unchanged OpenAPI](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml), current actual source links per operation. All tied to approved base and1334 unchanged source hashes (inventory original source checkpoint6fdd98d). Presence of a route/schema/guard/test is source implementation evidence, not combined HTTP/E2E acceptance.

## Fresh discovery command, exact result and limitations

Executed outside repository, reviewed helper builds a disconnected host, removes IHostedService, maps controllers and reads API Explorer/Swagger/EF model only; **no Start/Run, SQL query, worker, seed or migration**. Temporary outputs only. Reused existing compiled capture via `--no-build`; source fingerprint/current mapped actions/schema refs checked separately, no fresh backend compilation claimed.

```powershell
dotnet run --project C:/Users/HoangAnhVu/AppData/Local/Temp/HHWS-Phase0-Capture/Capture.csproj --no-build
```

Exit0: productionOperations241, productionPaths223, controllers47, snapshotOperations241, testDescriptionsExcluded0; modelEntities196/modelTables191/modelProperties1945/physicalColumnNames1940/databaseQueriesExecuted0. EF emitted known FieldInspectionPurpose default-without-sentinel warning20601; this warning is not hidden or repaired, no reproduced business failure inferred.

## Static OpenAPI/source-derived snapshot comparison

**Judgment PARTIAL. Evidence:** unchanged static OpenAPI artifact and fresh disconnected source-derived Swagger have identical method/path/security/required/type/schema/request/response/status structure. The disconnected JSON capture has 16 presentation-only description decoding differences (`�` versus source/artifact `–`); this is an encoding observation, not a wire-shape difference or live deployment acceptance.

**Variance:** 16 parameter-description strings differ only in disconnected capture presentation; no contract shape variance. **Recommendation:** retain artifact and handle any encoding repair as a separately authorized artifact task. No new runtime GAP is claimed; existing P1/P2 findings remain open.

| API | Exact method/path | Retained artifact locator | Difference |
|---|---|---|---|
| [API-003](02_Full-API-Catalog.md#api-003) | `POST /api/v1/auth/android/refresh` | parameter description `0` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-009](02_Full-API-Catalog.md#api-009) | `POST /api/v1/auth/refresh` | parameter description `0` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-015](02_Full-API-Catalog.md#api-015) | `POST /api/v1/auth/web/logout` | parameter description `0` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-020](02_Full-API-Catalog.md#api-020) | `POST /api/v1/cases/{caseId}/conclusions` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-021](02_Full-API-Catalog.md#api-021) | `POST /api/v1/cases/{caseId}/publications` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-022](02_Full-API-Catalog.md#api-022) | `POST /api/v1/cases/{caseId}/report-links` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-023](02_Full-API-Catalog.md#api-023) | `POST /api/v1/cases/{caseId}/report-splits` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-024](02_Full-API-Catalog.md#api-024) | `POST /api/v1/cases/{caseId}/triage` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-034](02_Full-API-Catalog.md#api-034) | `POST /api/v1/labels/{labelId}/review` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-059](02_Full-API-Catalog.md#api-059) | `POST /api/v1/projects/{projectId}/candidate-decisions` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-072](02_Full-API-Catalog.md#api-072) | `POST /api/v1/projects/{projectId}/defects/{defectId}/assessments` | parameter description `2` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-073](02_Full-API-Catalog.md#api-073) | `POST /api/v1/projects/{projectId}/defects/{defectId}/verification-decisions` | parameter description `2` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-106](02_Full-API-Catalog.md#api-106) | `POST /api/v1/projects/{projectId}/labels` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-108](02_Full-API-Catalog.md#api-108) | `POST /api/v1/projects/{projectId}/labels/{labelId}/revisions` | parameter description `2` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-216](02_Full-API-Catalog.md#api-216) | `POST /api/v1/reports` | parameter description `0` | presentation encoding differs in disconnected capture; structure unchanged |
| [API-219](02_Full-API-Catalog.md#api-219) | `POST /api/v1/reports/{reportId}/supplements` | parameter description `1` | presentation encoding differs in disconnected capture; structure unchanged |

## Schema/controller and runtime limits

Anonymous/framework/unresolved CLR schemas remain labeled; source DTO/controller projections are linked, no accepted fixture invented. Required/nullable/enum facets are exact declared schema plus CLR/source rules, not a promise schema captures all cross-field/current-state validation. Runtime group caveats (optional headers on GET, body OperationId, dynamic current roles/versions) remain explicit. No undocumented projection automatically promoted to a stable new wire schema. Controller/source versus advertised metadata exceptions must remain reviewable; source line/DTO/method/security comparisons run as static checks, not HTTP equivalence testing.

Upload VERIFIED processor source exists, but Program registers UploadVerificationWorker only Development+nonempty Minio endpoint (L25–29); no separately deployed Production processor path confirmed. Complete202/adapter DI/recovery worker aren't proof of Production verification. **P1-05 deployment gate** retained, not repaired or passed. Combined Reporter OTP→Android transport→upload→verified→report→supplement→publication **source chain confirmed / runtime NOT_RUN**.

## Open JEV gates — retain all original priorities

| Finding / Judgment | Current source evidence / impact / recommendation |
|---|---|
| P1-01 PARTIAL | [Dispatch L67](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L67), [synthetic service](../../../RoadGuardSystem.Services/Implementations/Processing/Anh02/Anh02AiService.cs): adopted real-provider protocol/model/artifact transport unverified; BE+AI review separate, no /predict invented |
| P1-02 PARTIAL | [ReceiveResult L117–148](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L117): belongs-to-job exists, latest/active attempt/full receipt identity binding partial; race/exploit NOT_VERIFIED; bounded BE+AI tests/design |
| P1-03 PARTIAL | [Matcher L88–90](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateMatchingService.cs#L88): null metric distance/availability false while scope/neighbors/history work; sourced facts/threshold decision, no auto Defect |
| P1-04 PARTIAL | [Reporter download L160–187](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L160): lacks export-like post-await temporal recheck; delayed-open reproduction/guard follow-up, no leak claimed |
| P1-05 NOT_VERIFIED | [External gates](../../audit/HHWS-DOCS-REBUILD-01/05_OPEN_DECISIONS_AND_GAPS.md), [Program L25](../../../RoadGuardSystem.API/Program.cs#L25): actual Web/Expo/provider/video/local encryption/keys/SMTP/MinIO/GIS/deployment/SLO/restore unverified; consumer/ops evidence needed |
| P2-06 PARTIAL | [FT final L33–88](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L33): PM confirmation/audit, missing adopted Supervisor informational producer; separate Huy follow-up, no Supervisor approval added |
| P2-07 PARTIAL | [Case L150–152](../../../RoadGuardSystem.Repositories/Implementations/Cases/CaseWorkflowRepository.cs#L150): localized pre-Defect FIELD/DRONE final source_not_ready; ExistingEvidence and Reporter→Defect→FIELD distinct; no fake Survey/Defect |

P2-01..P2-05 source/doc/lock/test/link debt retained in [registry](../00_Governance/03_Implementation-and-Verification-Status.md) and [Phase0 JEV](../../audit/HHWS-DOCS-REBUILD-01/03_BUSINESS_AND_PLATFORM_CONFLICTS.md). Original checkpoint0confirmedP0/5P1/7P2 isn't recalculated or closed by canonical writing; C2C-01 is separately recorded documentation exception. Current source and target product decisions still distinct. ECDSA/crypto/handover/native encryption/time boundaries preserved; no SfM/orthomosaic/DSM/3D/AI measurement scope restored.

## Checks / tests / secret leakage

| Command/check | Actual current-task evidence |
|---|---|
| Isolated discovery command above | PASS metadata discovery exit0, counts above; SQL queries0, no backend suite/build claim |
| `python docs/HoangHaiWarrantySystem-Official/tools/check_links.py` | PASS: 38 Markdown files, 5,658 local links, 0 errors; external/runtime not checked |
| Temporary Phase2C verification | PASS: catalog 241 unique API IDs, crosswalk 241 rows, schema inventory 357, source/API counts and scope checks; source hashes unchanged |
| Secret-leakage/static artifact check | PASS: no PEM/private-key blocks, connection-string/password literals or credential payload examples in new contract docs |
| `git diff --check` / cached check / staged allowlist | PASS after final staging; only Phase2C docs and four canonical navigation/status files |
| Backend unit/API/SQL suites; live Web/Expo/FastAPI/MinIO/SMTP/crypto/restore | **NOT_RUN**; docs-only/current source unchanged, no E2E acceptance claim |

Known failures remain HISTORICAL: Phase0 focused API/OpenAPI16PASS/1FAIL/0SKIP (SWG-014 stored BusinessDuty source excerpt), V2 check_contracts.py/validate_package.py exit1 CONTRACT_LOCK_MISMATCH; later assertions not reached. Command/output evidence in [Phase0 report](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md), latest HUY residual CI/fixture failures remain source-checkpoint scoped/unclosed. No rerun PASS/hosted CI result invented; Phase0 Docker absence not asserted as current environment fact.

## Review and stop

Self-review1: actual current role/gates/transport/DTO source and provenance, no rights inferred from UI; corrected invitation/inspection task roles and explicit work-package scope caveat, processing manager branch and exact direct-sync vs package signatures. Self-review2: complete241 partition/parameters/schema references/status/headers/test-source label and all ten workflow links; standalone guides/canonical navigation/secret avoidance/unchanged sources; rerun affected static checks after in-scope doc fixes. This is Codex self-review, **not independent JEV**.

**STOP after Phase2C push. Independent JEV review PENDING; Phase3 NOT_STARTED.**
