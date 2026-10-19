# AI/Reporter candidates, PM assessment và Defect authority

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

Giữ quyền quyết định Defect ở PM Web. AI provider và Reporter Mobile đưa nguồn cần assessment; Supervisor có quyền đọc/giám sát theo scope, không biến detection thành Defect tự động. Crew Mobile đo thực địa ở FIELD; model confidence/bbox/type là detection facts, không phải physical measurement.

Source candidate phải resolve đúng project/Case/dataset/geometry/current head và version. Decision cần reason; KEEP_NEW cần classification/catalog active, LINK_EXISTING cần target Defect/current version, REJECT không gắn target/classification trái shape service. Không coi candidate matching gợi ý là quyết định accepted.

## State transitions và main success flow

1. Backend tiếp nhận Reporter source hoặc AI detection với provenance. Candidate read/matching cung cấp scope, neighbor/history suggestions; PM đọc cùng current version.
2. PM gửi `KEEP_NEW`, `LINK_EXISTING` hoặc `REJECT`. Service normalize/check shape; repository lock current source/head/project rights và concurrency trước durable write.
3. KEEP_NEW tạo `Defect.CreateFromReport` hoặc `Defect.CreateFromAi` theo nguồn; Reporter branch không đòi SourceAi/Survey giả. LINK_EXISTING nối source vào Defect hiện hữu của cùng project với target version hợp lệ. REJECT lưu rejection/history, không tạo Defect.
4. Decision, source link, head và audit được ghi cùng seam; candidate head đổi chứ không sửa observation/model output gốc. Defect trở thành đầu vào cho FIELD/repair/project lifecycle theo đúng scope.
5. Correction/supersession chỉ theo source gate: current rejection có thể được thay bằng acceptance hợp lệ; đã accepted/used không được client tự detach/reclassify bằng một request trùng. Training labels là workflow source-backed riêng, không cấp quyền quyết định Defect cho AI.

## Failure và alternative flows

Wrong project/source kind, changed Case assignment/source version, stale candidate head hoặc stale linked Defect trả conflict/forbidden theo API. Source catalog inactive và decision shape sai bị chặn. `SaveAcceptedAsync` từ chối head đã accepted để tránh duplicate effect; retry K cùng payload không sinh Defect mới.

Không tìm được match không chứng minh đây là hư hỏng mới. Matching hiện `metricGpsAvailable=false` và distance nullable ở phần đánh giá metric; không claim đã có GPS tolerance đầy đủ, image similarity hoặc coverage perfect. Đây là P1-03, khác chức năng decision persistence đã có.

## Authorization và source/evidence lifecycle

PM scope được kiểm tại orchestration và locked source/Case/target seam. ID từ DTO không tự là authority. Decision phải trỏ version/geometry source cụ thể; classification/reason/actor/audit giữ để truy xuất sau geometry hoặc membership thay đổi. Original private Reporter ảnh chỉ được dùng qua bounded source authorization; Defect acceptance không tự publication cho Reporter khác.

AI bbox/confidence/model version/timestamp và raw result là provenance. Không ghi length/width/depth từ AI thành ground truth. Training/validation compatibility endpoints có tồn tại không tự kích hoạt AI physical measurement roadmap; scope cấm SfM/orthomosaic/DSM/3D vẫn giữ.

## Idempotency, concurrency và offline

Decision K + source/head/target versions tách duplicate request với competing decision. Receipt replay cần current rights/source checks, không được dùng như authority grant lâu dài. PM offline commands nếu đi qua registry phải dùng workflow 09 và admission supported; không suy mọi candidate endpoint có thể gọi offline vì PM có device.

## JEV và test evidence

**Judgment: PARTIAL.** PM authority, independent Reporter producer và accepted-source persistence có source evidence; matching P1-03 vẫn partial, real AI/external P1-01/P1-05 chưa verified. Recommendation: bổ sung matching facts/producer acceptance trong package được duyệt, không auto KEEP_NEW theo model confidence. Test source appendix là locators; Phase 2A runtime tests `NOT_RUN`.

## API method/path, DTO và controller evidence

12 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-034 | `POST /api/v1/labels/{labelId}/review` | [Review](../../../RoadGuardSystem.API/Controllers/TrainingLabelsController.cs#L51) | K/V | [ReviewTrainingLabelDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L25) → [TrainingLabelViewDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L28) |
| API-059 | `POST /api/v1/projects/{projectId}/candidate-decisions` | [Decide](../../../RoadGuardSystem.API/Controllers/CandidatesController.cs#L36) | K | [CandidateDecisionRequestDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L8) → [CandidateDecisionResponseDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L14) |
| API-060 | `GET /api/v1/projects/{projectId}/candidate-decisions/{decisionId}` | [Read](../../../RoadGuardSystem.API/Controllers/CandidatesController.cs#L46) | — | — → [CandidateDecisionResponseDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L14) |
| API-061 | `GET /api/v1/projects/{projectId}/candidates` | [Match](../../../RoadGuardSystem.API/Controllers/CandidatesController.cs#L22) | — | — → [CandidateMatchPageDto](../../../RoadGuardSystem.DTOs/Defects/CandidateMatchDtos.cs#L9) |
| API-070 | `GET /api/v1/projects/{projectId}/defects` | [List](../../../RoadGuardSystem.API/Controllers/DefectsController.cs#L17) | — | — → [DefectPageDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L33) |
| API-071 | `GET /api/v1/projects/{projectId}/defects/{defectId}` | [Read](../../../RoadGuardSystem.API/Controllers/DefectsController.cs#L28) | — | — → [DefectViewDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L22) |
| API-072 | `POST /api/v1/projects/{projectId}/defects/{defectId}/assessments` | [Assess](../../../RoadGuardSystem.API/Controllers/DefectsController.cs#L35) | K/V | [DefectAssessmentRequestDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L5) → [DefectViewDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L22) |
| API-073 | `POST /api/v1/projects/{projectId}/defects/{defectId}/verification-decisions` | [Verify](../../../RoadGuardSystem.API/Controllers/DefectsController.cs#L46) | K/V | [DefectVerificationRequestDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L9) → [DefectViewDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L22) |
| API-105 | `GET /api/v1/projects/{projectId}/labels` | [List](../../../RoadGuardSystem.API/Controllers/TrainingLabelsController.cs#L32) | — | — → [TrainingLabelPageDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L43) |
| API-106 | `POST /api/v1/projects/{projectId}/labels` | [Create](../../../RoadGuardSystem.API/Controllers/TrainingLabelsController.cs#L17) | K | [CreateTrainingLabelDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L17) → [TrainingLabelViewDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L28) |
| API-107 | `GET /api/v1/projects/{projectId}/labels/{labelId}` | [Read](../../../RoadGuardSystem.API/Controllers/TrainingLabelsController.cs#L25) | — | — → [TrainingLabelViewDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L28) |
| API-108 | `POST /api/v1/projects/{projectId}/labels/{labelId}/revisions` | [Revise](../../../RoadGuardSystem.API/Controllers/TrainingLabelsController.cs#L41) | K/V | [ReviseTrainingLabelDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L21) → [TrainingLabelViewDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L28) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [CandidateDecisionService](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateDecisionService.cs#L16): source declaration.
- [CandidateDecisionRepository](../../../RoadGuardSystem.Repositories/Implementations/Defects/CandidateDecisionRepository.cs#L16): source declaration.
- [CandidateMatchingService](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateMatchingService.cs#L14): source declaration.
- [CandidateSourceIdentity](../../../RoadGuardSystem.BusinessObjects/Candidates/CandidateSourceIdentity.cs#L3): source declaration.
- [CandidateDecision](../../../RoadGuardSystem.BusinessObjects/Candidates/CandidateDecision.cs#L3): source declaration.
- [Defect](../../../RoadGuardSystem.BusinessObjects/Defects/Defect.cs#L8): source declaration.
- [AIDetection](../../../RoadGuardSystem.BusinessObjects/Processing/AIDetection.cs#L6): source declaration.
- [TrainingLabelService](../../../RoadGuardSystem.Services/Implementations/Labels/TrainingLabelService.cs#L18): source declaration.
- [TrainingLabelRepository](../../../RoadGuardSystem.Repositories/Implementations/Labels/TrainingLabelRepository.cs#L13): source declaration.
- [CandidateDecisionService.DecideAsync](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateDecisionService.cs#L30): producing/guard method locator.
- [CandidateDecisionRepository.SaveAcceptedAsync](../../../RoadGuardSystem.Repositories/Implementations/Defects/CandidateDecisionRepository.cs#L134): producing/guard method locator.
- [CandidateMatchingService.MatchAsync](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateMatchingService.cs#L22): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| CandidatesController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[CandidateDecisionService.cs:127](../../../RoadGuardSystem.Services/Implementations/Defects/CandidateDecisionService.cs#L127)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| DefectsController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[DefectWorkflowService.cs:100](../../../RoadGuardSystem.Services/Implementations/Defects/DefectWorkflowService.cs#L100)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| TrainingLabelsController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[AnhHuyProducerService.cs:27](../../../RoadGuardSystem.Services/Implementations/Integration/AnhHuyProducerService.cs#L27)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [Huy01CandidateMatcherTests.cs:24](../../../tests/RoadGuardSystem.UnitTests/Candidates/Huy01CandidateMatcherTests.cs#L24): test source, `NOT_RUN`.
- [Huy01CaseDefectConsumerCompatibilityTests.cs:20](../../../tests/RoadGuardSystem.UnitTests/Reporting/Huy01CaseDefectConsumerCompatibilityTests.cs#L20): test source, `NOT_RUN`.
- [Huy01TrainingLabelLifecycleTests.cs:16](../../../tests/RoadGuardSystem.UnitTests/Labels/Huy01TrainingLabelLifecycleTests.cs#L16): test source, `NOT_RUN`.
- [LD08DefectStatisticsSqlTests.cs:130](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/LD08DefectStatisticsSqlTests.cs#L130): test source, `NOT_RUN`.
- [P232DetectionDefectSchemaTests.cs:153](../../../tests/RoadGuardSystem.IntegrationTests/Defects/P232DetectionDefectSchemaTests.cs#L153): test source, `NOT_RUN`.
