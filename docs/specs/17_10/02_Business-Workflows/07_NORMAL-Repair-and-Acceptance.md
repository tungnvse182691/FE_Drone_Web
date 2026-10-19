# NORMAL repair: approval, execution, review và final confirmation

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

PM Web tổ chức sửa Defect, Supervisor Web phê duyệt NORMAL và xác nhận cuối, Crew Mobile Expo thực hiện sửa/đo/evidence. PM review không thay Supervisor final; Crew submit không tự xác nhận hạng mục hoàn thành.

Current Defect/source/obligation, geometry/policy/binding plan và eligible Crew cần đúng admission từng bước. FIELD verification/before data, execution start/finish và typed attempt readiness là facts riêng. Temporary safety có source/obligation type riêng; không tự thay FormalRepair.

## State transitions và main success flow

| NORMAL bước | Actor | Domain effect / boundary |
|---|---|---|
| PM proposal | PM | Repair item `AwaitingApproval`, pin source/proposal |
| Approve | Supervisor | `ReadyToAssign` khi proposal/current authority hợp lệ |
| Assign | PM | `Assigned`; binding plan/current Crew, before FIELD source và clocks theo producing source |
| Start physical execution | Crew | `InProgress`, original first-start/execution origin; assessment trước đó chưa phải start |
| Finish và submit typed attempt | Crew | Finish evidence/clock tách submit; `Submitted` khi attempt/intake prerequisites hợp lệ |
| Review ACCEPT / SUPPLEMENT | PM | ACCEPT→`Reviewed`; SUPPLEMENT ghi rework/request chain, không tự final |
| Final confirmation | Supervisor | `Confirmed`, confirmed presentation/obligation history |

1. PM tạo package/item proposal, Supervisor approve, PM assign; không dùng Fast Track route/policy để bỏ NORMAL approval.
2. Crew assessment/before evidence phải pin task/Defect/geometry/binding; Crew actual start và finish ghi origin, performed time/certainty, measurement, verified files và current rights.
3. Actual finish có thể sinh finished-data-sync clock khi time/source verified; formal submit mới tạo attempt/review intake. Draft/assessment/upload receipt không tự tương đương submit.
4. PM review current attempt: wire input là `ACCEPT` hoặc `SUPPLEMENT`; repository có thể ghi lifecycle `REWORK` cho supplement, **không gửi REWORK như wire input thay SUPPLEMENT**. NORMAL ACCEPT tạo Supervisor final-review duty/source theo producer.
5. Supervisor final kiểm current accepted review/attempt/obligation head và source trước confirmed. Presentation `Unrepaired`, `ReportedAwaitingReview`, `Confirmed` khác task/repair item state enum.

## Failure và alternative flows

Wrong role, assignment/current source stale, incomplete readiness, unverified evidence, uncertain required performed time hoặc current version mismatch chặn chuyển trạng thái. A rejected/supplement review không được FE biến thành confirmed. Rework/supplement giữ original history/first-start; không bắt đầu một clock mới tùy ý.

Repair correction input có `UNREPAIRED`, `REPORTED_AWAITING_REVIEW`, `CONFIRMED`, reason/evidence và exact superseded decision; repo giữ mode-specific authority. `Cancelled`/`CorrectionRequired` tồn tại trong domain nhưng không là shortcut được gán tùy tiện. Defect recurrence/closure dùng lifecycle source, không repair correction để xóa defect history. Safety handling không thay final repair obligation.

## Authorization và evidence lifecycle

Service role allowlist không phải kết luận cuối: current repository actor/project/source guards, NORMAL Supervisor approval/final và PM assignment/review phải còn hợp lệ. Original Crew/execution identity khác actor đang đồng bộ sau handover. Before/after evidence, measurement, binding snapshot, review/confirmation/correction và obligation history được giữ để export/report và source revalidation.

Formal review/confirmation là authority facts; notifications chỉ transport evidence. Không dùng inbox read như business ACK; clock workflow 10 giữ received ACK riêng.

## Idempotency, concurrency và offline

Command K + quoted version/expected head, OriginalId/FieldFirstStartId/Assessment/Device/monotonic boot binding tùy DTO. Current attempt/review/obligation guards trong durable seam ngăn competing confirm hoặc replay đổi source. Signed offline operations không tự cấp permission; uncertainty/admission/current policy áp theo workflow 09. Cleanup queue dựa item ACK, không dựa HTTP 200.

## JEV và test evidence

**Judgment: PARTIAL.** NORMAL role sequence/state producers có source; P1-05 real physical/Expo/storage/deployment còn mở. Recommendation: nghiệm thu actual source/before→start→finish→submit→PM review→Supervisor final, tách mock/SQL/device evidence. Không gộp Fast Track Supervisor notification gap với thiếu NORMAL final authority. Phase 2A runtime tests `NOT_RUN`; appendix liệt kê test locators.

## API method/path, DTO và controller evidence

22 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-139 | `POST /api/v1/projects/{projectId}/repair-packages` | [Create](../../../RoadGuardSystem.API/Controllers/RepairPackagesController.cs#L19) | K/V | [RepairPackageCreateInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L12) → [RepairPackageView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L71) |
| API-140 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items` | [Propose](../../../RoadGuardSystem.API/Controllers/RepairPackagesController.cs#L23) | K/V | [RepairItemProposeInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L14) → [RepairItemView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L69) |
| API-141 | `GET /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}` | [Item](../../../RoadGuardSystem.API/Controllers/RepairsController.cs#L19) | — | — → [RepairItemView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L69) |
| API-142 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/approve` | [Approve](../../../RoadGuardSystem.API/Controllers/RepairPackagesController.cs#L27) | K/V | [RepairDecisionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L16) → [RepairItemView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L69) |
| API-143 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/assign` | [Assign](../../../RoadGuardSystem.API/Controllers/RepairPackagesController.cs#L31) | K/V | [RepairItemAssignInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L18) → [RepairTaskBindingView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L53) |
| API-144 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/cancellations` | [Cancel](../../../RoadGuardSystem.API/Controllers/RepairLifecycleController.cs#L19) | K/V | [RepairCancellationInput](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L8) → [RepairLifecycleView](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L13) |
| API-145 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/corrections` | [Correct](../../../RoadGuardSystem.API/Controllers/RepairsController.cs#L27) | K/V | [RepairCorrectionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L8) → [RepairCorrectionView](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L17) |
| API-147 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/final-confirmation` | [ConfirmFinal](../../../RoadGuardSystem.API/Controllers/RepairPackagesController.cs#L35) | K/V | [RepairDecisionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L16) → [RepairItemView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L69) |
| API-148 | `GET /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/history` | [History](../../../RoadGuardSystem.API/Controllers/RepairsController.cs#L23) | — | — → [RepairHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L3) |
| API-149 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/normal-successors` | [ContinueNormally](../../../RoadGuardSystem.API/Controllers/RepairLifecycleController.cs#L23) | K/V | [RepairNormalContinuationInput](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L10) → [RepairLifecycleView](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L13) |
| API-150 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/review-requests` | [RequestReview](../../../RoadGuardSystem.API/Controllers/RepairsController.cs#L32) | K/V | [RepairReviewRequestInput](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L11) → [RepairReviewRequestView](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L14) |
| API-151 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures` | [Create](../../../RoadGuardSystem.API/Controllers/RepairSafetyController.cs#L18) | K/V | [RepairSafetyCreateInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L44) → [RepairSafetyView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L9) |
| API-152 | `GET /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}` | [Read](../../../RoadGuardSystem.API/Controllers/RepairSafetyController.cs#L24) | K/V | — → [RepairSafetyView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L9) |
| API-153 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}/checks` | [Check](../../../RoadGuardSystem.API/Controllers/RepairSafetyController.cs#L35) | K/V | [RepairSafetyCheckInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L47) → [RepairSafetyView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L9) |
| API-154 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}/installation` | [Install](../../../RoadGuardSystem.API/Controllers/RepairSafetyController.cs#L29) | K/V | [RepairSafetyInstallInput](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L5) → [RepairSafetyView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L9) |
| API-155 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}/warnings/{warningId}/acknowledgement` | [Acknowledge](../../../RoadGuardSystem.API/Controllers/RepairSafetyController.cs#L41) | K/V | [RepairSafetyAcknowledgementInput](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L7) → [RepairSafetyView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L9) |
| API-156 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/assessment` | [Assess](../../../RoadGuardSystem.API/Controllers/RepairExecutionController.cs#L19) | K/V | [RepairMeasurementAssessmentInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L20) → [RepairAssessmentView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L58) |
| API-157 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts` | [SubmitAttempt](../../../RoadGuardSystem.API/Controllers/RepairExecutionController.cs#L31) | K/V | [RepairAttemptSubmitInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L31) → [RepairAttemptIntakeView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L65) |
| API-158 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews` | [ReviewAttempt](../../../RoadGuardSystem.API/Controllers/RepairExecutionController.cs#L41) | K/V | [RepairAttemptReviewInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L35) → [RepairAttemptReviewView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L67) |
| API-159 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/supplements` | [SupplementAttempt](../../../RoadGuardSystem.API/Controllers/RepairExecutionController.cs#L36) | K/V | [RepairAttemptSupplementInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L33) → [RepairAttemptIntakeView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L65) |
| API-160 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/execution-finish` | [Finish](../../../RoadGuardSystem.API/Controllers/RepairExecutionController.cs#L27) | K/V | [RepairExecutionFinishInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L28) → [RepairExecutionFinishView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L62) |
| API-161 | `POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/execution-start` | [Start](../../../RoadGuardSystem.API/Controllers/RepairExecutionController.cs#L23) | K/V | [RepairExecutionStartInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L25) → [RepairExecutionStartView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L60) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [RepairWorkflowService](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairWorkflowService.cs#L8): source declaration.
- [RepairWorkflowRepository](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Execution.cs#L13): source declaration.
- [RepairExecutionService](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairExecutionService.cs#L8): source declaration.
- [RepairItem](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairWork.cs#L229): source declaration.
- [RepairItemState](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairWork.cs#L9): enum `AwaitingApproval, ReadyToAssign, Assigned, InProgress, Submitted, Reviewed, Confirmed, Cancelled, CorrectionRequired`.
- [RepairObligation](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairWork.cs#L68): source declaration.
- [RepairAttempt](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairWork.cs#L143): source declaration.
- [RepairWorkflowRepository.ProposeItemAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L488): producing/guard method locator.
- [RepairWorkflowRepository.ApproveItemAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L517): producing/guard method locator.
- [RepairWorkflowRepository.AssignItemAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L537): producing/guard method locator.
- [RepairWorkflowRepository.ReviewAttemptAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L90): producing/guard method locator.
- [RepairWorkflowRepository.ConfirmFinalAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L33): producing/guard method locator.
- [RepairWorkflowRepository.SubmitAttemptAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L337): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| RepairPackagesController | [RepairContractMapping.cs:101](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairContractMapping.cs#L101)<br>[RepairContractMapping.cs:108](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairContractMapping.cs#L108)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| RepairsController | [RepairContractMapping.cs:101](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairContractMapping.cs#L101)<br>[RepairContractMapping.cs:108](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairContractMapping.cs#L108)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| RepairExecutionController | [RepairContractMapping.cs:101](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairContractMapping.cs#L101)<br>[RepairContractMapping.cs:108](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairContractMapping.cs#L108)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| RepairLifecycleController | [RepairLifecycleService.cs:10](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairLifecycleService.cs#L10)<br>[RepairLifecycleService.cs:19](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairLifecycleService.cs#L19)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| RepairSafetyController | [RepairSafetyService.cs:10](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairSafetyService.cs#L10)<br>[RepairSafetyService.cs:16](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairSafetyService.cs#L16)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [H4RepairContractBoundaryTests.cs:16](../../../tests/RoadGuardSystem.UnitTests/Repairs/H4RepairContractBoundaryTests.cs#L16): test source, `NOT_RUN`.
- [H4RepairCoreMigrationTests.cs:100](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairCoreMigrationTests.cs#L100): test source, `NOT_RUN`.
- [H4RepairExecutionAdmissionTests.cs:46](../../../tests/RoadGuardSystem.UnitTests/Repairs/H4RepairExecutionAdmissionTests.cs#L46): test source, `NOT_RUN`.
- [H4RepairExecutionSqlTests.cs:105](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairExecutionSqlTests.cs#L105): test source, `NOT_RUN`.
- [H4RepairFoundationTests.cs:474](../../../tests/RoadGuardSystem.UnitTests/Repairs/H4RepairFoundationTests.cs#L474): test source, `NOT_RUN`.
- [H4RepairLifecycleAdmissionTests.cs:12](../../../tests/RoadGuardSystem.UnitTests/Repairs/H4RepairLifecycleAdmissionTests.cs#L12): test source, `NOT_RUN`.
- [H4RepairLifecycleDomainTests.cs:12](../../../tests/RoadGuardSystem.UnitTests/Repairs/H4RepairLifecycleDomainTests.cs#L12): test source, `NOT_RUN`.
- [H4RepairLifecycleSqlTests.cs:28](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairLifecycleSqlTests.cs#L28): test source, `NOT_RUN`.
