# Reporter intake, private evidence, IncidentCase và Supervisor triage

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

Reporter Mobile Expo gửi phản ánh online và ảnh private mà không cần Drone Survey, AI result hoặc membership project. Supervisor Web nhận Case unassigned, triage vào project; PM Web xử lý sau khi có project scope. Report ownership, Case assignment, Defect confirmation và Reporter publication là bốn boundary riêng.

Reporter active/current role; description 1–1000 ký tự và ít nhất một evidence unique theo normalizer. `UNKNOWN` location cho phép thiếu tọa độ; nguồn capture/EXIF/manual cần đủ cặp lat/lon, giá trị 0 hợp lệ. Captured time/location là claim/provenance, không phải thời gian server đã chứng nhận.

## State transitions và main success flow

1. Reporter tạo private upload, nhận part URL, upload, complete và poll session/file tới server `VERIFIED`. Source giới hạn JPEG/PNG, 20 MiB, part 8 MiB, session 24 giờ, URL 15 phút. Complete/202 chỉ nhận yêu cầu verify; chưa đủ điều kiện submit report.
2. `ReporterReportService.CreateAsync` resolve private verified evidence cả preflight lẫn trong receipt/current-rights seam. Persistence tạo Report, `IncidentCase.Unassigned`, link và audit; không tạo Survey giả hoặc Defect tự động.
3. Supervisor triage unassigned Case vào project/chọn verification method/reason; domain `Unassigned → Open`. PM không triage Case chưa thuộc project. Methods domain `Field`, `Drone`, `ExistingEvidence` là lựa chọn nguồn xác minh, không bảo đảm mỗi method đã có producer kết luận.
4. PM xem evidence, điều phối candidate/Defect hoặc request thêm evidence. `NeedsEvidence → AwaitingEvidence`; conclusion confirmed/no-defect có prerequisite source. Supplement của chính Reporter trên active report có thể mở lại `AwaitingEvidence/Concluded → Open`. Giữ conclusion history.
5. PM link/split report giữa Case theo reason/version/history, không copy file ownership sang tất cả Reporter. Publication là command riêng, chọn recipient report IDs, defect IDs/evidence IDs và summary. Reporter thấy own report/supplement/publicUpdates được recipient join, không thấy internal project workflow từ trạng thái UI suy diễn.

## Failure và alternative flows

Upload chưa verified, wrong owner/purpose, scope không private, checksum/version stale hoặc inactive actor bị chặn. Duplicate key khác payload không tạo report thứ hai; replay vẫn kiểm current user/file authority. Report không có location dùng UNKNOWN, không giả (0,0).

Case link/split có thể làm reference/report không còn active; publication phải revalidate recipients và từng evidence. No-defect publication cần concluded no-defect source; confirmed conclusion cần verified Defects/evidence. FIELD/DRONE **pre-Defect** final conclusion hiện có `source_not_ready` gate: đây là P2-07 localized producer limitation, không phủ nhận Reporter→PM Defect→FIELD hoạt động hiện hữu.

## Authorization và evidence lifecycle

Private original/supplement evidence vẫn thuộc Reporter; PM/Supervisor sử dụng thông qua đúng Case/project/current pin scope. Published evidence không đồng nghĩa mọi private ảnh được public. `IncidentCase.Publish` giữ snapshot/recipient prerequisites; `ReporterLifecycleRepository.ProjectAsync` chỉ chiếu routing UNASSIGNED/ASSIGNED cùng public updates đã phát, không biến Case conclusion thành public message.

Kết quả review/AI/internal evidence chỉ được Reporter tải khi publication source cấp phép. Download không dùng storage URL tự chia sẻ làm authority. **P1-04**: `DownloadAsync`/`DownloadPublicationAsync` có initial rights check nhưng thiếu cùng mức post-storage-await revalidation như export; race/exploit thực `NOT_VERIFIED`, không khẳng định đã leak hay đã sửa.

## Idempotency, concurrency và offline

Report/supplement/Case commands có K và expected version đúng endpoint. File version khác upload session version và Case version. Replay không bỏ qua revoked rights. Reporter MVP online không buộc signed Crew batch/enrollment; local draft/cache encryption nếu FE thêm là consumer architecture, chưa có bằng chứng native Expo.

## JEV và test evidence

**Judgment: PARTIAL.** Source intake/triage/publication độc lập Survey được xác minh; P1-04, P2-07 và P1-05 còn mở. Recommendation: sửa backend temporal download guard qua package riêng và verify delayed-open race; thiết kế producer pre-Defect đúng scope nếu owner chọn, không mở quyền PM triage unassigned. Test locators bên dưới không phải test PASS; Phase 2A runtime tests `NOT_RUN`.

## API method/path, DTO và controller evidence

19 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-018 | `GET /api/v1/cases` | [List](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L21) | — | — → [CasePageDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L46) |
| API-019 | `GET /api/v1/cases/{caseId}` | [Read](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L42) | — | — → [InternalCaseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L16) |
| API-020 | `POST /api/v1/cases/{caseId}/conclusions` | [Conclude](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L71) | K/V | [CaseConclusionDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L12) → [InternalCaseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L16) |
| API-021 | `POST /api/v1/cases/{caseId}/publications` | [Publish](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L77) | K/V | [CasePublicationDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L14) → [CasePublicationResponseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L37) |
| API-022 | `POST /api/v1/cases/{caseId}/report-links` | [Link](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L63) | K/V | [CaseLinkDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L8) → [InternalCaseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L16) |
| API-023 | `POST /api/v1/cases/{caseId}/report-splits` | [Split](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L67) | K/V | [CaseSplitDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L10) → [InternalCaseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L16) |
| API-024 | `POST /api/v1/cases/{caseId}/triage` | [Triage](../../../RoadGuardSystem.API/Controllers/CasesController.cs#L51) | K/V | [CaseTriageDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L5) → [InternalCaseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L16) |
| API-208 | `GET /api/v1/reporter-evidence/files/{fileId}` | [GetFileMetadata](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L90) | — | — → [FileMetadataResponseDto](../../../RoadGuardSystem.DTOs/Files/FileMetadataResponseDto.cs#L3) |
| API-209 | `GET /api/v1/reporter-evidence/files/{fileId}/content` | [Download](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L106) | — | — → — |
| API-210 | `GET /api/v1/reporter-evidence/publications/{publicationId}/reports/{reportId}/evidence/{evidenceId}/content` | [DownloadPublication](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L122) | — | — → — |
| API-211 | `POST /api/v1/reporter-evidence/uploads` | [Create](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L26) | K | [ReporterEvidenceCreateRequestDto](../../../RoadGuardSystem.DTOs/Files/ReporterEvidenceCreateRequestDto.cs#L4) → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-212 | `GET /api/v1/reporter-evidence/uploads/{uploadId}` | [GetSession](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L49) | — | — → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-213 | `POST /api/v1/reporter-evidence/uploads/{uploadId}/complete` | [Complete](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L72) | K/V | [UploadCompleteRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadCompleteRequestDto.cs#L5) → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-214 | `POST /api/v1/reporter-evidence/uploads/{uploadId}/part-urls` | [GetPartUrls](../../../RoadGuardSystem.API/Controllers/ReporterEvidenceController.cs#L58) | K | [UploadPartUrlsRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlsRequestDto.cs#L5) → [UploadPartUrlsResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlsResponseDto.cs#L3) |
| API-215 | `GET /api/v1/reports` | [List](../../../RoadGuardSystem.API/Controllers/ReportsController.cs#L22) | — | — → [OwnReportPageDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L42) |
| API-216 | `POST /api/v1/reports` | [Create](../../../RoadGuardSystem.API/Controllers/ReportsController.cs#L91) | K | [CreateReporterReportRequestDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L20) → [ReporterReportResponseDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L23) |
| API-217 | `GET /api/v1/reports/{reportId}` | [Read](../../../RoadGuardSystem.API/Controllers/ReportsController.cs#L32) | — | — → [OwnReportDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L31) |
| API-218 | `GET /api/v1/reports/{reportId}/evidence/{evidenceId}/download` | [Download](../../../RoadGuardSystem.API/Controllers/ReportsController.cs#L56) | — | — → — |
| API-219 | `POST /api/v1/reports/{reportId}/supplements` | [Supplement](../../../RoadGuardSystem.API/Controllers/ReportsController.cs#L42) | K/V | [CreateReporterReportRequestDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L20) → [OwnReportDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L31) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [ReporterReportService](../../../RoadGuardSystem.Services/Implementations/Reports/ReporterReportService.cs#L12): source declaration.
- [ReporterReportRepository](../../../RoadGuardSystem.Repositories/Implementations/Reports/ReporterReportRepository.cs#L13): source declaration.
- [ReporterEvidenceService](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L15): source declaration.
- [ReporterLifecycleRepository](../../../RoadGuardSystem.Repositories/Implementations/Reports/ReporterLifecycleRepository.cs#L19): source declaration.
- [CaseWorkflowService](../../../RoadGuardSystem.Services/Implementations/Cases/CaseWorkflowService.cs#L14): source declaration.
- [CaseWorkflowRepository](../../../RoadGuardSystem.Repositories/Implementations/Cases/CaseWorkflowRepository.cs#L15): source declaration.
- [IncidentCase](../../../RoadGuardSystem.BusinessObjects/Cases/IncidentCase.cs#L3): source declaration.
- [CaseConclusion](../../../RoadGuardSystem.BusinessObjects/Cases/CaseConclusion.cs#L3): source declaration.
- [CasePublication](../../../RoadGuardSystem.BusinessObjects/Cases/CasePublication.cs#L3): source declaration.
- [Report](../../../RoadGuardSystem.BusinessObjects/Reports/Report.cs#L3): source declaration.
- [ReporterReportService.CreateAsync](../../../RoadGuardSystem.Services/Implementations/Reports/ReporterReportService.cs#L15): producing/guard method locator.
- [ReporterReportRepository.EnsureCurrentReceiptAccessAsync](../../../RoadGuardSystem.Repositories/Implementations/Reports/ReporterReportRepository.cs#L44): producing/guard method locator.
- [ReporterEvidenceService.CreateAsync](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L37): producing/guard method locator.
- [ReporterEvidenceService.CompleteAsync](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L125): producing/guard method locator.
- [ReporterEvidenceService.DownloadAsync](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L174): producing/guard method locator.
- [ReporterEvidenceService.DownloadPublicationAsync](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L160): producing/guard method locator.
- [ReporterLifecycleRepository.ProjectAsync](../../../RoadGuardSystem.Repositories/Implementations/Reports/ReporterLifecycleRepository.cs#L97): producing/guard method locator.
- [CaseWorkflowRepository.ApplyAsync](../../../RoadGuardSystem.Repositories/Implementations/Cases/CaseWorkflowRepository.cs#L85): producing/guard method locator.
- [IncidentCase.Triage](../../../RoadGuardSystem.BusinessObjects/Cases/IncidentCase.cs#L43): producing/guard method locator.
- [IncidentCase.Conclude](../../../RoadGuardSystem.BusinessObjects/Cases/IncidentCase.cs#L115): producing/guard method locator.
- [IncidentCase.Publish](../../../RoadGuardSystem.BusinessObjects/Cases/IncidentCase.cs#L148): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| ReportsController | [ReporterEvidenceService.cs:160](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L160)<br>[ReporterEvidenceService.cs:174](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L174)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ReporterEvidenceController | [ReporterEvidenceService.cs:125](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L125)<br>[ReporterEvidenceService.cs:152](../../../RoadGuardSystem.Services/Implementations/Files/ReporterEvidenceService.cs#L152)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| CasesController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[CaseWorkflowService.cs:17](../../../RoadGuardSystem.Services/Implementations/Cases/CaseWorkflowService.cs#L17)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [Huy01ReporterReceiptAccessSqlTests.cs:153](../../../tests/RoadGuardSystem.ApiTests/Reports/Huy01ReporterReceiptAccessSqlTests.cs#L153): test source, `NOT_RUN`.
- [Huy01ReporterReportsApiTests.cs:1091](../../../tests/RoadGuardSystem.ApiTests/Reports/Huy01ReporterReportsApiTests.cs#L1091): test source, `NOT_RUN`.
- [ReporterEvidenceApiTests.cs:107](../../../tests/RoadGuardSystem.ApiTests/Files/ReporterEvidenceApiTests.cs#L107): test source, `NOT_RUN`.
- [ReporterIntakeRequestNormalizerTests.cs:13](../../../tests/RoadGuardSystem.UnitTests/Reports/ReporterIntakeRequestNormalizerTests.cs#L13): test source, `NOT_RUN`.
