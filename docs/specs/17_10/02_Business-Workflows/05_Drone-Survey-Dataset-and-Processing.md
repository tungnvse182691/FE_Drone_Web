# Drone survey, dataset verification và processing jobs

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

PM Web định nghĩa nhiệm vụ và phạm vi survey; Operator Mobile Expo thực hiện bay/thu video và telemetry; backend kiểm dataset/pins trước processing. AI chỉ sinh candidates để PM xử lý tại workflow 04. Reporter report không bị buộc đi qua survey này.

Project effective membership, confirmed geometry/published segment set/BAND_V1 scope, active assigned Operator/drone device và verified upload là prerequisites theo command. Survey planning, task assignment, dataset submission và PM evidence assessment là các nguồn riêng, không gộp thành một cờ “survey complete”.

## State transitions và main success flow

1. PM tạo plan/task với scoped band/segment references; persistence tạo SurveyRequest `NewAssigned` cùng assignment/scope, và mark plan khi có liên kết hợp lệ. Operator accept từ `NewAssigned/Reassigned → Accepted`; task domain còn InProgress, Submitted, SupplementRequired, Completed, Rejected, Cancelled, Postponed theo command guards. Danh sách enum không cho phép mọi chuyển trạng thái.
2. Operator thu video/SRT/GPS, upload đúng project/task/purpose, complete rồi chờ server verification. File sync `ServerConfirmed` khác bytes đã ở máy và upload session `Verifying`. Dataset version/checksum và video-telemetry binding phải được pin.
3. Dataset write yêu cầu current active assignment và task accepted/in-progress/supplement-required, active drone, scope subset và verified SURVEY_VIDEO/TELEMETRY. Source có tổng file giới hạn 32 GB; không tự thêm provider size limit. Optional video/SRT/time-offset binding không được suy thành telemetry đầy đủ: missing telemetry `MISSING` không phải coverage PASS.
4. PM assessment `pm-evidence-review.v1` giữ PASS/FAIL/UNKNOWN với scope/head selection. Nó là source evidence review, không phải model physical measurement acceptance.
5. PM tạo processing job với dataset/block/model/manifest pin. `Queued`, `Running`, `RetryableFailure`, `DataFailure`, `Completed`, `Cancelled` là domain states; `Retry` chỉ từ RetryableFailure→Queued. Dispatch outbox/attempt tồn tại không chứng minh đã gửi tới provider thật.
6. Internal callback tiếp nhận JobAttemptId, ManifestHash, ModelVersionId, Mode, RawResultFileId, ChecksumSha256 và Detections đúng DTO. Service kiểm detectionId, FrameFileId, timestamp≥0, type, confidence 0..1 và bbox bốn thành phần normalized phù hợp. Persistence kiểm attempt thuộc job, manifest/model/mode, verified scoped raw file; ghi AIDetections rồi complete job. PM quyết định Defect sau đó.

## Failure và alternative flows

Assignment mất hiệu lực, dataset file chưa verified/wrong scope, version stale hoặc content khác replay phải chặn. Operator rejection/reassignment/supplement giữ assignment/history, không reuse upload từ task khác để vượt guard. Data/contract failure khác retryable infrastructure failure; không retry mọi lỗi như nhau.

**P1-02**: compatibility callback kiểm attempt thuộc job nhưng chưa fence latest attempt như business mong đợi; receipt hash chỉ dựa detections JSON + checksum, chưa đủ toàn callback identity. Có attempt/receipt không chứng minh full fencing. Race/exploit thực `NOT_VERIFIED`. ANH02 synthetic leased worker/pinned run source là boundary riêng, không tự sửa compatibility callback.

## Authorization và source/evidence lifecycle

Human processing/task actions theo PM/operator/current scope; internal result route dùng AI service authentication, không cấp bearer PM của người dùng cho provider. API appendix giữ exact method/path; manifest/blob access chưa được biến thành cookbook provider implementation ở Phase 2A.

Video, SRT/GPS, frame, raw result, job/attempt/model version và dataset/geometry pins giữ provenance cho candidates. Road GIS segment/section là phân đoạn công việc; image road segmentation có thể là xử lý ảnh ở vị trí kiến trúc được duyệt, không phải GIS coverage. Không dùng detection bbox tính kích thước vật lý; không đưa SfM/orthomosaic/DSM/3D trở lại. Legacy validation DTO/derived-measurement route tồn tại chỉ ghi nhận compatibility source, không mở lại product scope bị loại.

## Idempotency, concurrency và offline

Task/dataset/upload/job writes dùng K và version theo endpoint; upload complete receipt khác verified file admission. Worker lease/attempt retry phải được đọc đúng implementation branch. Offline Operator queue/native upload recovery `NOT_VERIFIED`; PM/Crew signed registry không tự cấp Operator enrollment quyền. Source pin không được client đổi khi retry.

## JEV và test evidence

**Judgment: PARTIAL.** Dataset/job/callback/synthetic candidate producer có source evidence. P1-01 real FastAPI/provider chưa verified, P1-02 fence partial, P1-05 real video/MinIO/GPS/model/Expo acceptance vẫn mở. Recommendation: bounded BE+AI contract/fencing verification riêng; không bịa provider route/payload hay gọi MOCK là E2E. Test references là source, runtime Phase 2A `NOT_RUN`.

## API method/path, DTO và controller evidence

40 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-025 | `GET /api/v1/datasets/{datasetId}/coverage` | [GetDatasetCoverage](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L147) | — | — → [DatasetCoverageResponseDto](../../../RoadGuardSystem.DTOs/Surveys/DatasetCoverageResponseDto.cs#L3) |
| API-026 | `GET /api/v1/datasets/{id}` | [ReadDataset](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L97) | — | — → [DatasetDetailView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L16) |
| API-027 | `POST /api/v1/datasets/{id}/assessments` | [Create](../../../RoadGuardSystem.API/Controllers/SurveyAssessmentsController.cs#L16) | K/V | [CreateAssessmentDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L6) → [AssessmentView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L7) |
| API-028 | `GET /api/v1/datasets/{id}/assessments/{assessmentId}` | [Read](../../../RoadGuardSystem.API/Controllers/SurveyAssessmentsController.cs#L26) | — | — → [AssessmentView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L7) |
| API-029 | `GET /api/v1/files/{fileId}` | [GetFileMetadata](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L102) | — | — → [FileMetadataResponseDto](../../../RoadGuardSystem.DTOs/Files/FileMetadataResponseDto.cs#L3) |
| API-030 | `GET /api/v1/files/{fileId}/content` | [Download](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L118) | — | — → — |
| API-031 | `POST /api/v1/internal/processing-jobs/{jobId}/results` | [ReceiveAiResult](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs#L52) | K | [ReceiveAiResultRequestDto](../../../RoadGuardSystem.DTOs/Processing/ReceiveAiResultRequestDto.cs#L5) → [ProcessingJobResponseDto](../../../RoadGuardSystem.DTOs/Processing/ProcessingJobResponseDto.cs#L3) |
| API-038 | `GET /api/v1/me/survey-tasks` | [ListMyTasks](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L110) | — | — → [SurveyTaskPageV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskPageV2ResponseDto.cs#L3) |
| API-043 | `POST /api/v1/offline/uploads` | [CreateOffline](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L58) | K | [OfflineUploadCreateRequestDto](../../../RoadGuardSystem.DTOs/Files/OfflineUploadCreateRequestDto.cs#L4) → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-044 | `POST /api/v1/processing-jobs` | [CreateProcessingJob](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs#L26) | K | [CreateProcessingJobRequestDto](../../../RoadGuardSystem.DTOs/Processing/CreateProcessingJobRequestDto.cs#L6) → [ProcessingJobResponseDto](../../../RoadGuardSystem.DTOs/Processing/ProcessingJobResponseDto.cs#L3) |
| API-045 | `GET /api/v1/processing-jobs/{jobId}` | [GetProcessingJob](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs#L35) | — | — → [ProcessingJobResponseDto](../../../RoadGuardSystem.DTOs/Processing/ProcessingJobResponseDto.cs#L3) |
| API-046 | `POST /api/v1/processing-jobs/{jobId}/retry` | [RetryProcessingJob](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs#L43) | K/V | [RetryProcessingJobRequestDto](../../../RoadGuardSystem.DTOs/Processing/RetryProcessingJobRequestDto.cs#L5) → [ProcessingJobResponseDto](../../../RoadGuardSystem.DTOs/Processing/ProcessingJobResponseDto.cs#L3) |
| API-052 | `GET /api/v1/projects/{projectId}/ai-candidates/{detectionId}` | [Candidate](../../../RoadGuardSystem.API/Controllers/AiMockRunsController.cs#L46) | — | — → [AiCandidateFactsV1](../../../RoadGuardSystem.Services/Interfaces/Integration/Anh02Contracts.cs#L58) |
| API-053 | `POST /api/v1/projects/{projectId}/ai-mock-runs` | [Create](../../../RoadGuardSystem.API/Controllers/AiMockRunsController.cs#L18) | K | [CreateAiMockRunRequest](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L15) → [AiMockRunView](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L27) |
| API-054 | `GET /api/v1/projects/{projectId}/ai-mock-runs/{runId}` | [Get](../../../RoadGuardSystem.API/Controllers/AiMockRunsController.cs#L32) | — | — → [AiMockRunView](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L27) |
| API-055 | `GET /api/v1/projects/{projectId}/ai-mock-runs/{runId}/result` | [Result](../../../RoadGuardSystem.API/Controllers/AiMockRunsController.cs#L39) | — | — → [AiResultV1](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L46) |
| API-056 | `GET /api/v1/projects/{projectId}/baseline-selections` | [Current](../../../RoadGuardSystem.API/Controllers/SurveyAssessmentsController.cs#L43) | — | — → [SelectedBaselineItem](../../../RoadGuardSystem.Repositories/Interfaces/Surveys/AssessmentContracts.cs#L10) |
| API-057 | `POST /api/v1/projects/{projectId}/baseline-selections` | [Select](../../../RoadGuardSystem.API/Controllers/SurveyAssessmentsController.cs#L34) | K | [CreateBaselineDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L11) → [BaselineView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L14) |
| API-058 | `GET /api/v1/projects/{projectId}/baseline-selections/{id}` | [History](../../../RoadGuardSystem.API/Controllers/SurveyAssessmentsController.cs#L45) | — | — → [BaselineView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L14) |
| API-189 | `POST /api/v1/projects/{projectId}/road-sections/{roadSectionId}/survey-plans` | [CreatePlan](../../../RoadGuardSystem.API/Controllers/SurveyPlanningController.cs#L26) | — | [CreateSurveyPlanRequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyPlanRequestDto.cs#L6) → [CreateSurveyPlanResponseDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyPlanResponseDto.cs#L5) |
| API-190 | `POST /api/v1/projects/{projectId}/road-sections/{roadSectionId}/survey-requests` | [CreateRequest](../../../RoadGuardSystem.API/Controllers/SurveyPlanningController.cs#L73) | — | [CreateSurveyRequestRequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyRequestRequestDto.cs#L6) → [CreateSurveyRequestResponseDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyRequestResponseDto.cs#L5) |
| API-201 | `POST /api/v1/projects/{projectId}/survey-plans` | [CreatePlan](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L23) | K | [CreateSurveyPlanV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyPlanV2RequestDto.cs#L5) → [SurveyPlanV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyPlanV2ResponseDto.cs#L3) |
| API-202 | `POST /api/v1/projects/{projectId}/survey-plans/{surveyPlanId}/postpone` | [PostponePlan](../../../RoadGuardSystem.API/Controllers/SurveyPlanningController.cs#L120) | — | [PostponeSurveyPlanRequestDto](../../../RoadGuardSystem.DTOs/Surveys/PostponeSurveyPlanRequestDto.cs#L5) → [PostponeSurveyPlanResponseDto](../../../RoadGuardSystem.DTOs/Surveys/PostponeSurveyPlanResponseDto.cs#L5) |
| API-203 | `POST /api/v1/projects/{projectId}/survey-tasks` | [CreateTask](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L61) | K | [CreateSurveyTaskV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyTaskV2RequestDto.cs#L5) → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-204 | `POST /api/v1/projects/{projectId}/validation-runs` | [CreateValidationRun](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs#L60) | K | [CreateValidationRunRequestDto](../../../RoadGuardSystem.DTOs/Processing/CreateValidationRunRequestDto.cs#L5) → [ProcessingJobResponseDto](../../../RoadGuardSystem.DTOs/Processing/ProcessingJobResponseDto.cs#L3) |
| API-223 | `GET /api/v1/survey-plans/{id}` | [ReadPlan](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L95) | — | — → [SurveyPlanV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyPlanV2ResponseDto.cs#L3) |
| API-224 | `POST /api/v1/survey-plans/{planId}/postpone` | [Postpone](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L41) | K/V | [PostponeSurveyPlanV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/PostponeSurveyPlanV2RequestDto.cs#L5) → [SurveyPlanV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyPlanV2ResponseDto.cs#L3) |
| API-225 | `GET /api/v1/survey-tasks/{id}/work-package` | [ReadWorkPackage](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L99) | — | — → [SurveyTaskWorkPackage](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L19) |
| API-226 | `GET /api/v1/survey-tasks/{taskId}` | [GetTask](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L80) | — | — → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-227 | `POST /api/v1/survey-tasks/{taskId}/accept` | [AcceptTask](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L162) | K/V | — → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-228 | `POST /api/v1/survey-tasks/{taskId}/cancel` | [CancelTask](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L180) | K/V | [SurveyTaskReasonV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskReasonV2RequestDto.cs#L5) → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-229 | `POST /api/v1/survey-tasks/{taskId}/datasets` | [SubmitDataset](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L121) | K/V | [SubmitDatasetRequestDto](../../../RoadGuardSystem.DTOs/Surveys/SubmitDatasetRequestDto.cs#L5) → [DatasetResponseDto](../../../RoadGuardSystem.DTOs/Surveys/DatasetResponseDto.cs#L3) |
| API-230 | `POST /api/v1/survey-tasks/{taskId}/decline` | [DeclineTask](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L171) | K/V | [SurveyTaskReasonV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskReasonV2RequestDto.cs#L5) → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-231 | `POST /api/v1/survey-tasks/{taskId}/reassign` | [ReassignTask](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L189) | K/V | [ReassignSurveyTaskV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/ReassignSurveyTaskV2RequestDto.cs#L5) → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-232 | `POST /api/v1/survey-tasks/{taskId}/supplements` | [RequestSupplement](../../../RoadGuardSystem.API/Controllers/SurveyV2Controller.cs#L198) | K/V | [SupplementSurveyTaskV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/SupplementSurveyTaskV2RequestDto.cs#L5) → [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3) |
| API-233 | `POST /api/v1/uploads` | [Create](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L26) | K | [UploadCreateRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadCreateRequestDto.cs#L5) → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-234 | `GET /api/v1/uploads/{uploadId}` | [GetSession](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L49) | — | — → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-235 | `POST /api/v1/uploads/{uploadId}/complete` | [Complete](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L84) | K/V | [UploadCompleteRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadCompleteRequestDto.cs#L5) → [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3) |
| API-236 | `POST /api/v1/uploads/{uploadId}/part-urls` | [GetPartUrls](../../../RoadGuardSystem.API/Controllers/UploadsController.cs#L70) | K | [UploadPartUrlsRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlsRequestDto.cs#L5) → [UploadPartUrlsResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlsResponseDto.cs#L3) |
| API-241 | `GET /api/v1/validation-runs/{runId}` | [GetValidationResult](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs#L77) | — | — → [ValidationResultDto](../../../RoadGuardSystem.DTOs/Processing/ValidationResultDto.cs#L3) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [SurveyV2Service](../../../RoadGuardSystem.Services/Implementations/Surveys/SurveyV2Service.cs#L11): source declaration.
- [SurveyV2PersistenceService](../../../RoadGuardSystem.Repositories/Implementations/Surveys/SurveyV2PersistenceService.Dataset.cs#L12): source declaration.
- [SurveyRequest](../../../RoadGuardSystem.BusinessObjects/Surveys/SurveyRequest.cs#L6): source declaration.
- [SurveyDataVersion](../../../RoadGuardSystem.BusinessObjects/Surveys/SurveyDataVersion.cs#L6): source declaration.
- [UploadService](../../../RoadGuardSystem.Services/Implementations/Files/UploadService.cs#L15): source declaration.
- [UploadSession](../../../RoadGuardSystem.BusinessObjects/Files/UploadSession.cs#L5): source declaration.
- [ProcessingV2Service](../../../RoadGuardSystem.Services/Implementations/Processing/ProcessingV2Service.cs#L12): source declaration.
- [ProcessingV2PersistenceService](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L17): source declaration.
- [ProcessingJob](../../../RoadGuardSystem.BusinessObjects/Processing/ProcessingJob.cs#L6): source declaration.
- [ProcessingAttempt](../../../RoadGuardSystem.BusinessObjects/Processing/ProcessingAttempt.cs#L5): source declaration.
- [AIDetection](../../../RoadGuardSystem.BusinessObjects/Processing/AIDetection.cs#L6): source declaration.
- [ReceiveAiResultRequestDto](../../../RoadGuardSystem.DTOs/Processing/ReceiveAiResultRequestDto.cs#L5): source declaration.
- [Anh02AiRepository](../../../RoadGuardSystem.Repositories/Implementations/Processing/Anh02AiRepository.cs#L18): source declaration.
- [SurveyAssessmentService](../../../RoadGuardSystem.Services/Implementations/Surveys/SurveyAssessmentService.cs#L10): source declaration.
- [SurveyV2Service.CreateTaskAsync](../../../RoadGuardSystem.Services/Implementations/Surveys/SurveyV2Service.cs#L48): producing/guard method locator.
- [SurveyV2PersistenceService.CreateTaskAsync](../../../RoadGuardSystem.Repositories/Implementations/Surveys/SurveyV2PersistenceService.cs#L110): producing/guard method locator.
- [ProcessingV2Service.ReceiveResultAsync](../../../RoadGuardSystem.Services/Implementations/Processing/ProcessingV2Service.cs#L53): producing/guard method locator.
- [ProcessingV2PersistenceService.ReceiveResultAsync](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L117): producing/guard method locator.
- [ProcessingJob.Retry](../../../RoadGuardSystem.BusinessObjects/Processing/ProcessingJob.cs#L89): producing/guard method locator.
- [ProcessingJob.Complete](../../../RoadGuardSystem.BusinessObjects/Processing/ProcessingJob.cs#L103): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| SurveyPlanningController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[SurveyPlanningService.cs:133](../../../RoadGuardSystem.Services/Implementations/Surveys/SurveyPlanningService.cs#L133)<br>[IdempotencyOperationService.cs:107](../../../RoadGuardSystem.Repositories/Idempotency/IdempotencyOperationService.cs#L107)<br>[IdempotencyOperationService.cs:165](../../../RoadGuardSystem.Repositories/Idempotency/IdempotencyOperationService.cs#L165) |
| SurveyV2Controller | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[SurveyV2Service.cs:102](../../../RoadGuardSystem.Services/Implementations/Surveys/SurveyV2Service.cs#L102)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| SurveyAssessmentsController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[SurveyAssessmentService.cs:12](../../../RoadGuardSystem.Services/Implementations/Surveys/SurveyAssessmentService.cs#L12)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| UploadsController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[UploadService.cs:106](../../../RoadGuardSystem.Services/Implementations/Files/UploadService.cs#L106)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ProcessingV2Controller | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[ProcessingV2Service.cs:24](../../../RoadGuardSystem.Services/Implementations/Processing/ProcessingV2Service.cs#L24)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| AiMockRunsController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[AnhHuyProducerService.cs:27](../../../RoadGuardSystem.Services/Implementations/Integration/AnhHuyProducerService.cs#L27)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [Anh01SurveyCorrectionTests.cs:17](../../../tests/RoadGuardSystem.ApiTests/Surveys/Anh01SurveyCorrectionTests.cs#L17): test source, `NOT_RUN`.
- [Anh01SurveyFlowTests.cs:24](../../../tests/RoadGuardSystem.ApiTests/Surveys/Anh01SurveyFlowTests.cs#L24): test source, `NOT_RUN`.
- [Anh01UploadAdmissionTests.cs:17](../../../tests/RoadGuardSystem.UnitTests/Files/Anh01UploadAdmissionTests.cs#L17): test source, `NOT_RUN`.
- [Anh01UploadContractTests.cs:17](../../../tests/RoadGuardSystem.ApiTests/Files/Anh01UploadContractTests.cs#L17): test source, `NOT_RUN`.
- [Anh02AiHttpTests.cs:33](../../../tests/RoadGuardSystem.ApiTests/Processing/Anh02AiHttpTests.cs#L33): test source, `NOT_RUN`.
- [Anh02RetentionPersistenceTests.cs:187](../../../tests/RoadGuardSystem.IntegrationTests/Retention/Anh02RetentionPersistenceTests.cs#L187): test source, `NOT_RUN`.
- [MultipartRecoveryAdapterTests.cs:15](../../../tests/RoadGuardSystem.IntegrationTests/Files/MultipartRecoveryAdapterTests.cs#L15): test source, `NOT_RUN`.
- [MultipartRecoveryMigrationTests.cs:20](../../../tests/RoadGuardSystem.IntegrationTests/Migrations/Files/MultipartRecoveryMigrationTests.cs#L20): test source, `NOT_RUN`.
