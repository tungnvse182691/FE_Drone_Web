# Notifications, publications, reporting, retention và evidence export

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

Đưa đúng thông tin tới đúng recipient, ghi business receipt/duties, cung cấp reporting/export truy nguyên và retention review có basis/hold. Supervisor/PM Web, Crew/Operator/Reporter Mobile chỉ đọc nguồn thuộc scope của mình; publication Reporter đi qua recipient whitelist tại workflow 03, không internal inbox toàn project.

Nguồn notification phải resolve current task/assignment/actor/role/event source. Export/reporting cần current authorized project/source; retention cần warranty/obligation basis, holds và evaluation inventory. Có outbox/worker không chứng minh SMTP/device delivery/deployment.

## State transitions và main success flow

1. Business producer ghi source/event/outbox và current source adapter resolve recipient. H6 worker dispatch/receipt/read có bounds và protected-source read checks. Inbox delivery/read đánh dấu transport/read state, không business received ACK.
2. `BusinessDutyRepository` nhận ACK đúng request/version/current recipient; first ACK server time tạo business received fact/clock transition theo source. Claimed device time giữ claim riêng. Substitution chọn người đã eligible, không tự cấp membership hoặc reset original clock.
3. Clock/duty reads/escalation/extension theo command authority, deadline source và current recipient. Formal intake/actual finish/ACK/confirmed review là producer events khác nhau; không đo deadline từ client screen open.
4. Reporting capture/summary/items/timeline và Defect statistics chiếu source history/current scope. Reporting snapshot/version không phải sửa Defect hoặc công khai private evidence.
5. Export request→worker lease/manifest snapshot/artifact→content read theo nguồn. `ContentAsync` yêu cầu SUCCEEDED artifact/chưa hết hạn, current PM/Supervisor scope, immutable source/file authority, compare metadata SHA/size/MIME; **recheck rights/source/files/expiry sau storage await**, dispose nếu deny. Khác P1-04 Reporter download đang thiếu cùng temporal guard.
6. Retention basis/holds/review/evaluation queue→completion lấy source snapshots và evaluator. Eligibility dùng obligation/warranty maximum +5 năm trong code; thiếu basis giữ WAITING_RETENTION_BASIS, hold fail closed. ELIGIBLE_FOR_REVIEW là đủ điều kiện review, **không tự cho delete/purge**. Không đặt chính sách dữ liệu mới bằng tài liệu.

## Failure và alternative flows

Unknown notification source/history/current recipient không được broadcast rộng để delivery thành công. Revoked rights hoặc reassignment chặn protected read/ACK/replay theo guard. Duplicate ACK không tạo clock gốc mới; read notification không ack supplement duty.

Export expired, source changed/wrong scope, checksum/size mismatch, worker failure/retry hoặc revoked access có lỗi hiện hữu; không trả artifact stale vì request trước đã được approve. Retention unknown warranty basis, active obligation/hold hoặc inventory mismatch giữ gate; queue receipt chưa chứng minh physical file cleanup. Project closure không đồng nghĩa retention expiry.

## Authorization và evidence lifecycle

Notification delivery/read/received ACK, public publication, report projection, export artifact và retention decision là facts riêng. Reporter publication recipients và selected evidence source do Case prerequisites quyết định. Original private ảnh không public vì export/report đã tồn tại. Evidence/version/history/holds/delivery attempts/duty ACK phải còn traceable theo current source.

Retention admin/evaluation/hold authority theo `RetentionRepository` current actor/project guard; PM không có global Supervisor quyền. Artifact access kiểm tại lúc tải, không chỉ lúc enqueue. Không dùng Web/Expo stored link như bearer grant vĩnh viễn.

## Idempotency, concurrency và offline

ACK K + request/current version + recipient lock, source event receipts và outbox idempotency giữ duplicate effect. Reporting/export capture/lease/basis version theo endpoint; đọc bảng API để phân biệt K/header/bounded query thay một policy chung. Signed offline batch receipt không tương đương business ACK; phải qua supported producer/source admission.

## JEV và test evidence

**Judgment: PARTIAL.** Producer/consumer guards/export temporal check/retention evaluator có source. P2-06 FT-final Supervisor informational producer còn mở tại workflow 08; P1-05 SMTP/MinIO/native inbox/worker topology/SLO/restore/retention execution `NOT_VERIFIED`. Recommendation: verify current producer→recipient→delivery/ACK→clock riêng, giữ holds/data-policy owner gate. Test locators không phải PASS; Phase 2A runtime tests `NOT_RUN`.

## API method/path, DTO và controller evidence

28 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-039 | `GET /api/v1/notifications` | [List](../../../RoadGuardSystem.API/Controllers/NotificationsController.cs#L52) | — | — → [NotificationPageDto](../../../RoadGuardSystem.DTOs/Messaging/NotificationPageDto.cs#L3) |
| API-040 | `GET /api/v1/notifications/{notificationId}` | [Get](../../../RoadGuardSystem.API/Controllers/NotificationsController.cs#L26) | — | — → [NotificationDto](../../../RoadGuardSystem.DTOs/Messaging/NotificationDto.cs#L3) |
| API-041 | `POST /api/v1/notifications/{notificationId}/read` | [MarkRead](../../../RoadGuardSystem.API/Controllers/NotificationsController.cs#L75) | K/V | — → [NotificationDto](../../../RoadGuardSystem.DTOs/Messaging/NotificationDto.cs#L3) |
| API-042 | `GET /api/v1/notifications/{notificationId}/scope` | [Scope](../../../RoadGuardSystem.API/Controllers/H6NotificationOperationsController.cs#L28) | — | — → [H6NotificationScopeDto](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L16) |
| API-062 | `GET /api/v1/projects/{projectId}/clocks` | [Clocks](../../../RoadGuardSystem.API/Controllers/H6NotificationOperationsController.cs#L36) | — | — → [H6ClockPage](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L47) |
| API-063 | `POST /api/v1/projects/{projectId}/clocks/{clockId}/appointments` | [Appoint](../../../RoadGuardSystem.API/Controllers/ClockDutyController.cs#L22) | K/V | [BusinessDutyAppointmentInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L4) → — |
| API-064 | `POST /api/v1/projects/{projectId}/clocks/{clockId}/extensions` | [Extend](../../../RoadGuardSystem.API/Controllers/ClockDutyController.cs#L19) | K/V | [ClockExtensionInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L5) → — |
| API-068 | `GET /api/v1/projects/{projectId}/defect-statistics` | [Read](../../../RoadGuardSystem.API/Controllers/DefectStatisticsController.cs#L17) | — | — → [DefectStatisticsRead](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L26) |
| API-069 | `POST /api/v1/projects/{projectId}/defect-statistics` | [Confirm](../../../RoadGuardSystem.API/Controllers/DefectStatisticsController.cs#L23) | K/V | [DefectStatisticsInputDto](../../../RoadGuardSystem.DTOs/Reporting/DefectStatisticsInputDto.cs#L7) → [DefectStatisticsRead](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L26) |
| API-074 | `POST /api/v1/projects/{projectId}/exports` | [Create](../../../RoadGuardSystem.API/Controllers/ExportsController.cs#L18) | K | [CreateExportRequestDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L6) → [ExportJobViewDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L16) |
| API-075 | `GET /api/v1/projects/{projectId}/exports/{exportId}` | [Get](../../../RoadGuardSystem.API/Controllers/ExportsController.cs#L28) | — | — → [ExportJobViewDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L16) |
| API-076 | `GET /api/v1/projects/{projectId}/exports/{exportId}/content` | [Content](../../../RoadGuardSystem.API/Controllers/ExportsController.cs#L42) | — | — → — |
| API-077 | `GET /api/v1/projects/{projectId}/exports/{exportId}/manifest` | [Manifest](../../../RoadGuardSystem.API/Controllers/ExportsController.cs#L35) | — | — → [ExportManifestV1Dto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L53) |
| API-135 | `GET /api/v1/projects/{projectId}/receiving-requests` | [List](../../../RoadGuardSystem.API/Controllers/BusinessDutyController.cs#L19) | — | — → [BusinessDutyView](../../../RoadGuardSystem.Repositories/Interfaces/Messaging/IBusinessDutyRepository.cs#L8) |
| API-136 | `GET /api/v1/projects/{projectId}/receiving-requests/{requestId}` | [Read](../../../RoadGuardSystem.API/Controllers/BusinessDutyController.cs#L26) | — | — → [BusinessDutyView](../../../RoadGuardSystem.Repositories/Interfaces/Messaging/IBusinessDutyRepository.cs#L8) |
| API-137 | `POST /api/v1/projects/{projectId}/receiving-requests/{requestId}/ack` | [Ack](../../../RoadGuardSystem.API/Controllers/BusinessDutyController.cs#L32) | K/V | [BusinessRequestAckInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L3) → [BusinessDutyView](../../../RoadGuardSystem.Repositories/Interfaces/Messaging/IBusinessDutyRepository.cs#L8) |
| API-138 | `POST /api/v1/projects/{projectId}/receiving-requests/{requestId}/appointment` | [Appoint](../../../RoadGuardSystem.API/Controllers/BusinessDutyController.cs#L35) | K/V | [BusinessDutyAppointmentInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L4) → [BusinessDutyView](../../../RoadGuardSystem.Repositories/Interfaces/Messaging/IBusinessDutyRepository.cs#L8) |
| API-168 | `GET /api/v1/projects/{projectId}/reports/items` | [Items](../../../RoadGuardSystem.API/Controllers/ReportingController.cs#L29) | — | — → [ReportingItemsPageDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L103) |
| API-169 | `GET /api/v1/projects/{projectId}/reports/summary` | [Summary](../../../RoadGuardSystem.API/Controllers/ReportingController.cs#L19) | — | — → [ProjectSummaryV1](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L53) |
| API-170 | `GET /api/v1/projects/{projectId}/reports/timeline` | [Timeline](../../../RoadGuardSystem.API/Controllers/ReportingController.cs#L37) | — | — → [ReportingTimelinePageDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L105) |
| API-171 | `POST /api/v1/projects/{projectId}/retention/evaluations` | [Evaluate](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L29) | K | [CreateRetentionEvaluationRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L34) → [RetentionEvaluationView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L106) |
| API-172 | `GET /api/v1/projects/{projectId}/retention/evaluations/{id}` | [Evaluation](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L35) | — | — → [RetentionEvaluationView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L106) |
| API-173 | `GET /api/v1/projects/{projectId}/retention/files/{fileId}` | [File](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L19) | — | — → [RetentionFileView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L82) |
| API-174 | `PUT /api/v1/projects/{projectId}/retention/files/{fileId}/basis` | [Basis](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L24) | K/V | [ConfirmRetentionBasisRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L4) → [RetentionBasisView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L94) |
| API-206 | `GET /api/v1/projects/{projectId}/weekly-digests/{digestId}` | [WeeklyDigest](../../../RoadGuardSystem.API/Controllers/H6NotificationOperationsController.cs#L20) | — | — → [WeeklyDigestView](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L9) |
| API-220 | `POST /api/v1/retention/holds` | [CreateHold](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L40) | K | [CreateRetentionHoldRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L14) → [RetentionHoldView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L62) |
| API-221 | `GET /api/v1/retention/holds/{id}` | [Hold](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L46) | — | — → [RetentionHoldView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L62) |
| API-222 | `POST /api/v1/retention/holds/{id}/release` | [Release](../../../RoadGuardSystem.API/Controllers/RetentionController.cs#L51) | K/V | [ReleaseRetentionHoldRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L24) → [RetentionHoldView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L62) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [NotificationService](../../../RoadGuardSystem.Services/Implementations/Messaging/NotificationService.cs#L10): source declaration.
- [H6ProtectedNotificationRepository](../../../RoadGuardSystem.Repositories/Implementations/Messaging/H6ProtectedNotificationRepository.Backfill.cs#L8): source declaration.
- [H6NotificationWorker](../../../RoadGuardSystem.API/Workers/H6NotificationWorker.cs#L7): source declaration.
- [BusinessDutyRepository](../../../RoadGuardSystem.Repositories/Implementations/Messaging/BusinessDutyRepository.cs#L16): source declaration.
- [ReportingService](../../../RoadGuardSystem.Services/Implementations/Reporting/ReportingService.cs#L10): source declaration.
- [ExportService](../../../RoadGuardSystem.Services/Implementations/Exports/ExportService.cs#L16): source declaration.
- [ExportRepository](../../../RoadGuardSystem.Repositories/Implementations/Exports/ExportRepository.SourceAuthority.cs#L7): source declaration.
- [RetentionService](../../../RoadGuardSystem.Services/Implementations/Retention/RetentionService.cs#L6): source declaration.
- [RetentionRepository](../../../RoadGuardSystem.Repositories/Implementations/Retention/RetentionRepository.cs#L12): source declaration.
- [RetentionEligibilityEvaluator](../../../RoadGuardSystem.BusinessObjects/Retention/RetentionEligibilityEvaluator.cs#L9): source declaration.
- [DeadlineClock](../../../RoadGuardSystem.BusinessObjects/Clocks/DeadlineClock.cs#L12): source declaration.
- [CasePublication](../../../RoadGuardSystem.BusinessObjects/Cases/CasePublication.cs#L3): source declaration.
- [BusinessDutyRepository.ExecuteAsync](../../../RoadGuardSystem.Repositories/Implementations/Messaging/BusinessDutyRepository.cs#L110): producing/guard method locator.
- [ExportService.ContentAsync](../../../RoadGuardSystem.Services/Implementations/Exports/ExportService.cs#L136): producing/guard method locator.
- [RetentionRepository.AdmitEvaluationAsync](../../../RoadGuardSystem.Repositories/Implementations/Retention/RetentionRepository.cs#L154): producing/guard method locator.
- [RetentionRepository.ProcessOneAsync](../../../RoadGuardSystem.Repositories/Implementations/Retention/RetentionRepository.cs#L204): producing/guard method locator.
- [ReportingService.CaptureAsync](../../../RoadGuardSystem.Services/Implementations/Reporting/ReportingService.cs#L15): producing/guard method locator.
- [NotificationService.MarkReadAsync](../../../RoadGuardSystem.Services/Implementations/Messaging/NotificationService.cs#L75): producing/guard method locator.
- [NotificationService.MarkReadAsync](../../../RoadGuardSystem.Services/Implementations/Messaging/NotificationService.cs#L80): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| NotificationsController | [NotificationService.cs:124](../../../RoadGuardSystem.Services/Implementations/Messaging/NotificationService.cs#L124)<br>[NotificationService.cs:133](../../../RoadGuardSystem.Services/Implementations/Messaging/NotificationService.cs#L133)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| H6NotificationOperationsController | [H6NotificationReadService.cs:16](../../../RoadGuardSystem.Services/Implementations/Messaging/H6NotificationReadService.cs#L16)<br>[H6NotificationReadService.cs:25](../../../RoadGuardSystem.Services/Implementations/Messaging/H6NotificationReadService.cs#L25)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[Anh02ReceiptAuthority.cs:9](../../../RoadGuardSystem.Repositories/Idempotency/Anh02ReceiptAuthority.cs#L9) |
| BusinessDutyController | [BusinessDutyService.cs:10](../../../RoadGuardSystem.Services/Implementations/Messaging/BusinessDutyService.cs#L10)<br>[BusinessDutyService.cs:12](../../../RoadGuardSystem.Services/Implementations/Messaging/BusinessDutyService.cs#L12)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ClockDutyController | [ClockDutyService.cs:8](../../../RoadGuardSystem.Services/Implementations/Messaging/ClockDutyService.cs#L8)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ReportingController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[CaseDefectCaptureConsumer.cs:10](../../../RoadGuardSystem.Services/Implementations/Reporting/CaseDefectCaptureConsumer.cs#L10)<br>[IdentityRepository.Reads.cs:51](../../../RoadGuardSystem.Repositories/Implementations/Identity/IdentityRepository.Reads.cs#L51)<br>[IdentityRepository.Reads.cs:9](../../../RoadGuardSystem.Repositories/Implementations/Identity/IdentityRepository.Reads.cs#L9) |
| DefectStatisticsController | [DefectStatisticsService.cs:11](../../../RoadGuardSystem.Services/Implementations/Reporting/DefectStatisticsService.cs#L11)<br>[DefectStatisticsService.cs:9](../../../RoadGuardSystem.Services/Implementations/Reporting/DefectStatisticsService.cs#L9)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ExportsController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[ExportRenderer.cs:214](../../../RoadGuardSystem.Services/Implementations/Exports/ExportRenderer.cs#L214)<br>[Anh02ReceiptAuthority.cs:9](../../../RoadGuardSystem.Repositories/Idempotency/Anh02ReceiptAuthority.cs#L9)<br>[IdempotencyOperationService.cs:107](../../../RoadGuardSystem.Repositories/Idempotency/IdempotencyOperationService.cs#L107) |
| RetentionController | [RetentionService.cs:10](../../../RoadGuardSystem.Services/Implementations/Retention/RetentionService.cs#L10)<br>[RetentionService.cs:11](../../../RoadGuardSystem.Services/Implementations/Retention/RetentionService.cs#L11)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [Anh02RetentionHttpTests.cs:19](../../../tests/RoadGuardSystem.ApiTests/Retention/Anh02RetentionHttpTests.cs#L19): test source, `NOT_RUN`.
- [Anh02RetentionPersistenceTests.cs:187](../../../tests/RoadGuardSystem.IntegrationTests/Retention/Anh02RetentionPersistenceTests.cs#L187): test source, `NOT_RUN`.
- [H0RetentionMigrationTests.cs:22](../../../tests/RoadGuardSystem.IntegrationTests/Migrations/Retention/H0RetentionMigrationTests.cs#L22): test source, `NOT_RUN`.
- [H6NotificationOperationsHttpTests.cs:20](../../../tests/RoadGuardSystem.ApiTests/Notifications/H6NotificationOperationsHttpTests.cs#L20): test source, `NOT_RUN`.
- [H6NotificationOperationsSqlTests.cs:15](../../../tests/RoadGuardSystem.IntegrationTests/Notifications/H6NotificationOperationsSqlTests.cs#L15): test source, `NOT_RUN`.
- [H6NotificationPersistenceGuardSqlTests.cs:17](../../../tests/RoadGuardSystem.IntegrationTests/Notifications/H6NotificationPersistenceGuardSqlTests.cs#L17): test source, `NOT_RUN`.
- [H7ExportStorageAuthorityTests.cs:24](../../../tests/RoadGuardSystem.UnitTests/Reporting/H7ExportStorageAuthorityTests.cs#L24): test source, `NOT_RUN`.
- [Huy02InspectionRetentionTests.cs:139](../../../tests/RoadGuardSystem.ApiTests/Inspections/Huy02InspectionRetentionTests.cs#L139): test source, `NOT_RUN`.

## Phase 5 current-source clarification

At `d1e529a5d1b6a95fa18d9448f7d75468463390df`, export access (API-074–077) requires current effective project membership even for Supervisor. `ExportService.AuthorizeAsync` L33–42 calls `HasCurrentProjectMembershipAsync`; `ExportRepository.AdmitAsync` enforces membership role/status/dates during capture/replay. Global reporting authority does not grant private export access. This restriction was introduced after the Phase 2 source pin (commits `e59027b`, `c093ba6`); earlier source evidence is historical for this guard. No runtime check is rerun by this documentation correction.
