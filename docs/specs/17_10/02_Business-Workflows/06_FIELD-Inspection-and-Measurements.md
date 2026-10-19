# FIELD inspection, Crew physical measurement và provenance

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

PM Web giao xác minh thực địa cho Crew Mobile Expo và review đo đạc. FIELD tạo evidence/measurement trước hay sau repair theo task purpose; FIELD không đồng nghĩa đã thực hiện sửa chữa. Supervisor Web đọc/giám sát theo scope. AI confidence/bbox không thay Crew đo.

Task create cần Defect Open/cùng project, current Defect/route version, published geometry pins và eligible Crew membership. Source REPORTER cần active accepted report link KEEP_NEW và không gắn Survey giả; AI/SURVEY cần exact source chain. P2-07 pre-Defect Case producer không được suy là task creation này đã nhận Case chưa có Defect.

## State transitions và main success flow

1. PM tạo/assign/reassign/cancel đúng command, lưu assignment và task pins. Domain task có NewAssigned, Accepted, Rejected, InProgress, SupplementRequired, Submitted, Completed, Cancelled; authority/guard quyết định cạnh nào hợp lệ.
2. Crew current assignee accept/start hoặc assessment theo API. Assessment/draft không tự là formal submission và không khởi tạo mọi PM review clock.
3. Crew ghi đo length/width/depth hoặc incomplete/unknown reasons, location proof và before/field evidence đúng purpose. UNKNOWN không phải 0. Origin/first-start/parent lineage không được reset khi supplement hoặc chuyển máy.
4. Upload đúng purpose/scope đến verified; formal submit persist immutable FieldInspectionSubmission, GroundTruthMeasurement, evidence links/hash, operation origin/location proof và lineage. PM review clock gắn formal first intake theo source, không theo lúc client mở màn hình.
5. PM review/correct/supplement theo current head/task/source. PM có thể quyết định reuse Reporter original/supplement evidence qua `ReuseAsync` với verified pin/checksum; reuse source vẫn được revalidate trước dùng, không biến reused ảnh thành Crew capture mới.

## Failure và alternative flows

Wrong assignment, inactive Crew/current role, revoked project membership, missing geometry/Defect source, unverified/wrong checksum file hoặc stale head gây reject/conflict. Direct caller phải khớp original actor; imported command cần valid admission/current assignment/task snapshot. Không gửi DTO tự đặt offlineAdmission để bypass.

Incomplete measurement vẫn giữ lý do và uncertainty theo typed command; không fabricate dimensions hay location accuracy để đạt readiness. Source/report evidence đã unlink hoặc đổi checksum không tiếp tục reuse từ cache. Supplement giữ first-start và chain; reassignment không xóa lịch sử người đo trước.

## Authorization và evidence lifecycle

PM tạo/assign/review/reuse/impact; Crew chỉ current assigned task operations; reads PM/Supervisor/Crew có resource-specific guards. Crew không có projectwide geometry/pavement quyền chỉ vì cần map. Ground truth phải truy được original actor, task, submission, source files/pins và server admission. Device signature chứng minh possession/binding, không chứng minh sensor accuracy hoặc thời điểm lịch sử tuyệt đối.

Measurement là physical observation của Crew. PM review không chuyển AI observation thành GroundTruthMeasurement. Evidence reuse decision là attribution riêng; publication/export vẫn cần recipient/source guards tiếp theo.

## Idempotency, concurrency và offline

K, task/source versions, original/first-start IDs và append-only submission lineage bảo vệ competing intake/replay. Offline FIELD chỉ command registry supported + enrolled Crew/source snapshot + signature/current rights; per-item result ở workflow 09. Conflict không được FE tự resolve bằng last-write-wins hoặc thay original actor. NEEDS_SUPPLEMENT không reset clock gốc.

## JEV và test evidence

**Judgment: PARTIAL.** Reporter→accepted Defect→FIELD producer và typed formal intake có source; P2-07 localized pre-Defect producer và P1-05 native/device/real measurement acceptance còn mở. Recommendation: giữ task purpose/source provenance; nghiệm thu đo đạc/Expo offline riêng, không claim E2E từ test presence. Runtime Phase 2A `NOT_RUN`.

## API method/path, DTO và controller evidence

20 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-037 | `GET /api/v1/me/inspection-tasks` | [List](../../../RoadGuardSystem.API/Controllers/InspectionTasksController.cs#L26) | — | — → [InspectionTaskPageResponseDto](../../../RoadGuardSystem.DTOs/Inspections/InspectionTaskPageResponseDto.cs#L3) |
| API-078 | `GET /api/v1/projects/{projectId}/field-inspection-tasks` | [List](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L22) | K/V | — → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-079 | `POST /api/v1/projects/{projectId}/field-inspection-tasks` | [Create](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L20) | K | [FieldTaskCreateInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L5) → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-080 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}` | [Get](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L24) | K/V | — → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-081 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/accept` | [Accept](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L32) | K/V | [FieldTaskActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L18) → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-082 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/assign` | [Assign](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L36) | K/V | [FieldTaskActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L18) → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-083 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/cancel` | [Cancel](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L40) | K/V | [FieldTaskActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L18) → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-084 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence-reuse` | [Reuse](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L52) | K/V | [FieldEvidenceReuseInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L114) → — |
| API-085 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence/{fileId}` | [Evidence](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L54) | K/V | — → [FieldTaskEvidenceFile](../../../RoadGuardSystem.Repositories/Interfaces/Inspections/IFieldInspectionWorkflowRepository.cs#L21) |
| API-086 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence/{fileId}/content` | [DownloadEvidence](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L56) | — | — → — |
| API-087 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/geometry` | [Geometry](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L30) | K/V | — → [SlabGeometrySnapshotFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L145) |
| API-088 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/history` | [History](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L26) | K/V | — → — |
| API-089 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/location-impact-decisions` | [Impact](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L50) | K/V | [FieldLocationImpactActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L38) → — |
| API-090 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reassign` | [Reassign](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L38) | K/V | [FieldTaskActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L18) → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-091 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reject` | [Reject](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L34) | K/V | [FieldTaskActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L18) → [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43) |
| API-092 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reviews` | [Review](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L48) | K/V | [FieldReviewInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L104) → [FieldReviewViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L22) |
| API-093 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/start` | [Start](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L42) | K/V | [FieldStartInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L48) → — |
| API-094 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/start-origin` | [Origin](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L28) | K/V | — → — |
| API-095 | `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/submissions` | [Submit](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L44) | K/V | [FieldSubmissionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L92) → [FieldSubmissionViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L31) |
| API-096 | `GET /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/submissions/{submissionId}` | [Submission](../../../RoadGuardSystem.API/Controllers/FieldInspectionWorkflowController.cs#L46) | K/V | — → [FieldSubmissionViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L31) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [FieldInspectionWorkflowService](../../../RoadGuardSystem.Services/Implementations/Inspections/FieldInspectionWorkflowService.cs#L10): source declaration.
- [FieldInspectionWorkflowRepository](../../../RoadGuardSystem.Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.Business.cs#L17): source declaration.
- [FieldInspectionTask](../../../RoadGuardSystem.BusinessObjects/Inspections/FieldInspectionTask.cs#L6): source declaration.
- [FieldInspectionAssignment](../../../RoadGuardSystem.BusinessObjects/Inspections/FieldInspectionAssignment.cs#L5): source declaration.
- [FieldInspectionSubmission](../../../RoadGuardSystem.BusinessObjects/Inspections/FieldInspectionSubmission.cs#L3): source declaration.
- [FieldInspectionEvidenceReuseDecision](../../../RoadGuardSystem.BusinessObjects/Inspections/FieldInspectionEvidenceReuseDecision.cs#L3): source declaration.
- [GroundTruthMeasurement](../../../RoadGuardSystem.BusinessObjects/Inspections/GroundTruthMeasurement.cs#L6): source declaration.
- [FieldInspectionLocationProof](../../../RoadGuardSystem.BusinessObjects/Inspections/FieldInspectionLocationProof.cs#L3): source declaration.
- [FieldInspectionWorkflowRepository.GuardAsync](../../../RoadGuardSystem.Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.cs#L131): producing/guard method locator.
- [FieldInspectionWorkflowRepository.CreateTaskAsync](../../../RoadGuardSystem.Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.Business.cs#L102): producing/guard method locator.
- [FieldInspectionWorkflowRepository.ReuseAsync](../../../RoadGuardSystem.Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.Evidence.cs#L15): producing/guard method locator.
- [FieldInspectionWorkflowRepository.SubmitAsync](../../../RoadGuardSystem.Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.Intake.cs#L43): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| FieldInspectionWorkflowController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[FieldInspectionWorkflowService.cs:12](../../../RoadGuardSystem.Services/Implementations/Inspections/FieldInspectionWorkflowService.cs#L12)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| InspectionTasksController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[InspectionTaskQueryService.cs:100](../../../RoadGuardSystem.Services/Implementations/Inspections/InspectionTaskQueryService.cs#L100)<br>[InspectionTaskReadRepository.cs:14](../../../RoadGuardSystem.Repositories/Implementations/Inspections/InspectionTaskReadRepository.cs#L14)<br>[ProjectMembershipReadModel.cs:28](../../../RoadGuardSystem.Repositories/Implementations/Projects/ProjectMembershipReadModel.cs#L28) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [H3FieldInspectionServiceTests.cs:49](../../../tests/RoadGuardSystem.UnitTests/Inspections/H3FieldInspectionServiceTests.cs#L49): test source, `NOT_RUN`.
- [H3FieldInspectionWorkflowSqlTests.cs:151](../../../tests/RoadGuardSystem.IntegrationTests/Inspections/H3FieldInspectionWorkflowSqlTests.cs#L151): test source, `NOT_RUN`.
- [H3FieldMigrationTests.cs:16](../../../tests/RoadGuardSystem.IntegrationTests/Migrations/Inspections/H3FieldMigrationTests.cs#L16): test source, `NOT_RUN`.
