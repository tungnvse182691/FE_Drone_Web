# Fast Track policy, eligibility, authorization và confirmation

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

Cho phép xử lý Fast Track trong phạm vi policy/coverage được duyệt với authority khác NORMAL. PM Web thực hiện quyền FT được source cấp; Crew Mobile Expo thi công; Supervisor Web xác nhận road coverage và phải được thông tin về FT final theo yêu cầu; policy draft/publish/revoke hiện do PM theo RepairPolicyService. Supervisor information không biến thành NORMAL approval/final gate.

Phải có applicable policy revision, authorized road coverage/current Defect/source/binding, eligible actor và original-window admission. Không có một threshold confidence/kích thước phổ quát do tài liệu tự đặt. TEST_ONLY/sample coverage không chứng minh real eligible road.

## State transitions và main success flow

1. PM tạo/sửa/publish/revoke repair policy, giữ revisions và current source theo `RepairPolicyService/Repository`; scope/quyền chính xác phải đọc controller-service-repo, không client tự publish rule.
2. Eligibility read đánh giá facts, missingReasons, coverage/policy/version; thiếu facts fail closed. Đây là preflight view, không phải irrevocable permission cho lần write sau.
3. FT proposal tạo item `ReadyToAssign` (NORMAL là `AwaitingApproval`); PM assignment phát execution authorization theo published policy/coverage/source. Dùng common repair APIs của [NORMAL/common operations](07_NORMAL-Repair-and-Acceptance.md#api-methodpath-dto-và-controller-evidence), giữ mode FT và source pins. Repo rechecks policy/current rights ở admission/actual execution; không đổi mode bằng local UI.
4. Crew assessment→actual start→finish→submit theo shared execution provenance; PM review `ACCEPT/SUPPLEMENT` current attempt. First-start/history/measurements không bị bỏ vì FT.
5. FT final confirmation là PM theo `ConfirmFinalAsync`, khác NORMAL Supervisor. Source resolves current obligation/review head và immutable confirmation/audit. Supervisor informational notification là yêu cầu còn gap, không coi audit đơn lẻ là đã notification.

## Failure và alternative flows

Policy revoked, missing source/coverage, geometry/binding stale, wrong role hoặc outside applicable original window làm admission fail. K replay không giữ grant đã hết hiệu lực. FT không eligible không tự chuyển thành approved NORMAL; phải theo NORMAL approval flow.

ND01 giữ **original window 24 giờ**, không backdate/reset origin; signed offline time không đủ chứng minh historic UTC. Server-current conservative FT admission vẫn áp dụng; việc nhận additional data sau expiry thuộc deferred decision theo spec, không được tài liệu tự mở ngoại lệ.

## Authorization và source/evidence lifecycle

Policy/coverage administration, FT authorization, Crew execution, PM final và Supervisor information tách riêng. PM quyền FT không phải universal Supervisor authority; NORMAL approve/final giữ nguyên. Duty recipients nguồn hiện hành, không broadcast tất cả Supervisor như biện pháp chữa gap.

Persist policy revision/coverage/source snapshot/authorization/original start/attempt/review/confirmation; revoked policy vẫn giữ historical evidence. Report/export/read kiểm current rights/source, không lấy cached eligibility làm authority.

## Idempotency, concurrency và offline

Shared repair K/versions/current head vẫn áp; policy draft/version publication/revocation K riêng theo appendix. Offline supported operations dùng device/public key/snapshot/registry admission; P256 signature không nâng time claim thành original-window certainty. Conflict/revoke cần server result; không FE auto-overwrite.

## JEV và test evidence

**Judgment: PARTIAL.** Source FT authority/policy/readiness hiện hữu; **P2-06** `RepairWorkflowRepository.ConfirmFinalAsync` lưu confirmation/audit nhưng không gọi notification producer cho FT Supervisor informational event. Recommendation: bounded source/recipient producer + integration verification riêng, giữ PM final authority. P1-05 real-road applicability và native acceptance `NOT_VERIFIED`. FT clock creation không chứng minh mọi breach/recipient path. Tests Phase 2A `NOT_RUN`.

## API method/path, DTO và controller evidence

9 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-146 | `GET /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/eligibility` | [Get](../../../RoadGuardSystem.API/Controllers/RepairEligibilityController.cs#L14) | — | — → [RepairEligibilityReadView](../../../RoadGuardSystem.DTOs/Repairs/RepairEligibilityReadDtos.cs#L4) |
| API-162 | `POST /api/v1/projects/{projectId}/repair-policies/drafts` | [Create](../../../RoadGuardSystem.API/Controllers/RepairPoliciesController.cs#L17) | K | [RepairPolicyDefinitionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L6) → [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11) |
| API-163 | `GET /api/v1/projects/{projectId}/repair-policies/drafts/{draftId}` | [Draft](../../../RoadGuardSystem.API/Controllers/RepairPoliciesController.cs#L20) | K/V | — → [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11) |
| API-164 | `PUT /api/v1/projects/{projectId}/repair-policies/drafts/{draftId}` | [Update](../../../RoadGuardSystem.API/Controllers/RepairPoliciesController.cs#L23) | K/V | [RepairPolicyDefinitionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L6) → [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11) |
| API-165 | `POST /api/v1/projects/{projectId}/repair-policies/drafts/{draftId}/publish` | [Publish](../../../RoadGuardSystem.API/Controllers/RepairPoliciesController.cs#L26) | K/V | [RepairPolicyReasonInput](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L9) → [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11) |
| API-166 | `GET /api/v1/projects/{projectId}/repair-policies/revisions/{revisionId}` | [Revision](../../../RoadGuardSystem.API/Controllers/RepairPoliciesController.cs#L29) | K/V | — → [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11) |
| API-167 | `POST /api/v1/projects/{projectId}/repair-policies/revisions/{revisionId}/revoke` | [Revoke](../../../RoadGuardSystem.API/Controllers/RepairPoliciesController.cs#L32) | K/V | [RepairPolicyReasonInput](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L9) → [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11) |
| API-175 | `GET /api/v1/projects/{projectId}/road-coverage` | [Read](../../../RoadGuardSystem.API/Controllers/RoadCoverageController.cs#L17) | — | — → [RoadCoverageReadFact](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L20) |
| API-176 | `POST /api/v1/projects/{projectId}/road-coverage` | [Confirm](../../../RoadGuardSystem.API/Controllers/RoadCoverageController.cs#L23) | K/V | [RoadCoverageInputDto](../../../RoadGuardSystem.DTOs/Repairs/RoadCoverageDtos.cs#L6) → [RoadCoverageReadFact](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L20) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [RepairPolicyService](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairPolicyService.cs#L8): source declaration.
- [RepairPolicyRepository](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairPolicyRepository.cs#L14): source declaration.
- [RepairPolicyDefinition](../../../RoadGuardSystem.Repositories/Interfaces/Repairs/IRepairPolicyRepository.cs#L6): source declaration.
- [RepairPolicyDraft](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyDraft.cs#L9): source declaration.
- [RepairPolicyRevision](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs#L25): source declaration.
- [RepairPolicyRevocation](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs#L18): source declaration.
- [RepairEligibilityRepository](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairEligibilityRepository.cs#L12): source declaration.
- [RoadCoverageRepository](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RoadCoverageRepository.cs#L15): source declaration.
- [RepairWorkflowRepository](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Execution.cs#L13): source declaration.
- [RepairExecutionService](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairExecutionService.cs#L8): source declaration.
- [RepairWorkflowRepository.ConfirmFinalAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L33): producing/guard method locator.
- [RepairWorkflowRepository.ReviewAttemptAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairWorkflowRepository.Producing.cs#L90): producing/guard method locator.
- [RepairEligibilityRepository.ReadAsync](../../../RoadGuardSystem.Repositories/Implementations/Repairs/RepairEligibilityRepository.cs#L15): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| RepairPoliciesController | [RepairPolicyService.cs:10](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairPolicyService.cs#L10)<br>[RepairPolicyService.cs:53](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairPolicyService.cs#L53)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| RepairEligibilityController | [RepairEligibilityService.cs:8](../../../RoadGuardSystem.Services/Implementations/Repairs/RepairEligibilityService.cs#L8)<br>[Anh02ReceiptAuthority.cs:9](../../../RoadGuardSystem.Repositories/Idempotency/Anh02ReceiptAuthority.cs#L9)<br>[AnhHuyFactsRepository.cs:12](../../../RoadGuardSystem.Repositories/Implementations/Integration/AnhHuyFactsRepository.cs#L12) |
| RoadCoverageController | [RoadCoverageService.cs:10](../../../RoadGuardSystem.Services/Implementations/Repairs/RoadCoverageService.cs#L10)<br>[RoadCoverageService.cs:15](../../../RoadGuardSystem.Services/Implementations/Repairs/RoadCoverageService.cs#L15)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [H4RepairPolicySqlTests.cs:19](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairPolicySqlTests.cs#L19): test source, `NOT_RUN`.
- [H4RepairCoreMigrationTests.cs:100](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairCoreMigrationTests.cs#L100): test source, `NOT_RUN`.
- [H4RepairExecutionSqlTests.cs:105](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairExecutionSqlTests.cs#L105): test source, `NOT_RUN`.
- [H4RepairLifecycleSqlTests.cs:111](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairLifecycleSqlTests.cs#L111): test source, `NOT_RUN`.
- [H4RepairPersistenceTests.cs:10](../../../tests/RoadGuardSystem.UnitTests/Repairs/H4RepairPersistenceTests.cs#L10): test source, `NOT_RUN`.
- [H4RepairProducerMigrationTests.cs:25](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairProducerMigrationTests.cs#L25): test source, `NOT_RUN`.
- [H4RepairProducingAdmissionSqlTests.cs:200](../../../tests/RoadGuardSystem.IntegrationTests/Repairs/H4RepairProducingAdmissionSqlTests.cs#L200): test source, `NOT_RUN`.
- [H5FtPolicySnapshotSqlTests.cs:32](../../../tests/RoadGuardSystem.IntegrationTests/Offline/H5FtPolicySnapshotSqlTests.cs#L32): test source, `NOT_RUN`.
