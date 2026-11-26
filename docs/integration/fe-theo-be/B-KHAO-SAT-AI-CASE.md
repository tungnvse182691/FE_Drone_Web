# Nhóm B — Khảo sát / AI / Case / Khiếm khuyết: chỉnh FE theo BE (2026-11-19)

Nguyên tắc: FE tuân theo BE. Căn cứ: `docs/HoangHaiWarrantySystem-Official/05_Web/*Screen-API-Matrix.md` (PM-04/05/06/07/11, SUP-02/03/06), `02_Business-Workflows/03–05`, `04_API-Contracts/02_Full-API-Catalog.md` (API-059 candidate-decisions, API-053/055 ai-mock-runs…), `docs/contracts/openapi.json` (BE mới).

## 1. Đã xóa (FE thừa — không có API BE đứng sau)
| Mục | Vị trí | Lý do |
|---|---|---|
| `simulateDroneFlightCompletion` + nút "Mô phỏng bay xong & Chạy AI" + handler | `surveyService.ts`, `DroneMissionAIReview.tsx` | BE không có thao tác mô phỏng bay; AI chỉ có khi có bản nộp bộ dữ liệu + PM tạo lần chạy (`POST /projects/{p}/ai-mock-runs`, API-053). Màn "Lên lịch bay" chỉ còn giải thích |
| `updateSurveyDetection`, `resetSurveyDetection`, `saveAiCandidateOverride` | `surveyService.ts` | Luôn `throwLegacyBlocked`. BE không có "mở lại quyết định" (chỉ ghi quyết định mới `supersedesDecisionId`) và không có API lưu khung bao (bbox) |
| `requestReFlight`, `lockBaseline(surveyId)`, `resetSurveys`, `getSurveyRoutes`, `createSurvey`, `throwLegacyBlocked` | `surveyService.ts` | Luôn ném lỗi, không còn nơi gọi. Bay bổ sung = `POST /survey-tasks/{id}/supplements` và khóa Baseline = `POST /projects/{p}/baseline-selections` đã làm đúng ở chi tiết nhiệm vụ (`SurveyRecordActions`, `SurveyDatasetPanel`) |
| Modal "Yêu cầu bay bổ sung" + modal "Xác nhận khóa Baseline", nút "Khóa Baseline đoạn đường" | `drone-review/MissionModals.tsx` (xóa file), `MissionHeader.tsx`, `useDroneMissionReview.ts` | Trùng chức năng đã có ở chi tiết nhiệm vụ và gọi hàm bị chặn. Thay bằng liên kết "Chi tiết nhiệm vụ: bản nộp, đánh giá, Baseline, bay bổ sung" |
| `handleResetDetection` / nút "Mở lại / Tách ra" | `useDroneMissionReview.ts`, `MissionTriageList.tsx`, `DefectDetailVerify.tsx` | BE không có API mở lại; nút còn hiển thị thành công giả trước khi gọi |
| Lưu khung bao: `handleSaveBbox`, tự lưu khi Chấp nhận, nút "Lưu khung nhận diện/tọa độ khung bao" | `DefectDetailVerify.tsx` | Không có API BE lưu bbox |
| Giá trị bịa `coveragePercentage = 100`, `hasBlindspot = false` | `useDroneMissionReview.ts`, `DroneMissionAIReview.tsx` | Không đến từ BE |
| `validationService.getSamples/triggerValidationRun/cancelValidationJob/exportValidationCsv` + nút "Xuất tệp đối soát (CSV)", "Chạy kiểm định mới", banner hủy tác vụ | `validationService.ts`, `(sup)/research/ResearchHeader.tsx`, `(sup)/ResearchValidation.tsx` | BE không có API liệt kê mẫu/hủy/xuất CSV; tạo lần kiểm định cần danh sách cặp id (`POST /projects/{p}/validation-runs`) mà web không có nguồn |

## 2. Đã thêm / sửa theo BE
| Việc | Căn cứ BE | Chi tiết |
|---|---|---|
| Duyệt/Từ chối phát hiện AI ở màn thẩm định (`/pm/surveys/:id/review`) ghi thật | API-059 `POST /projects/{p}/candidate-decisions` (PM; Idempotency-Key; body `CandidateDecisionRequestDto`) | `handleApproveDetection` → `KEEP_NEW`, `handleRejectDetection` → `REJECT` qua `surveyService.decideCandidate` (trước đây ném lỗi) |
| `decideCandidate` tự đọc snapshot | API-061 `GET /projects/{p}/candidates?sourceKind&sourceId` | Nếu thiếu `sourceVersion/geometryVersion` thì đọc lại từ BE ngay trước khi ghi (không dùng giá trị cũ) |
| `decideCandidate` tự suy `classification.roadSectionVersionId` cho KEEP_NEW | `GET /projects/{p}/ai-mock-runs/{runId}` (`datasetId`, BE mới) → `GET /datasets/{id}` (`scope[].routeVersionId`, khớp `segmentId`) | Thay cho `GET /ai-candidates/{id}` vốn chỉ nhận Bearer. Lỗi rõ ràng nếu không xác định duy nhất |
| `DefectDetailVerify` truyền `runId`, `segmentId` cho KEEP_NEW/LINK_EXISTING/REJECT | như trên | Trước đây thiếu snapshot nên luôn bị chặn |
| Liên kết sang chi tiết nhiệm vụ từ màn thẩm định | PM-06/PM-07 | `detailHref` = `…/surveys?surveyRecordId={taskId}&surveyRecordKind=TASK` |

## 3. Còn thiếu do BE
- `GET /projects/{p}/ai-candidates/{detectionId}` (API-052) chỉ Bearer: FE không đọc được `disposition`/`decisionId` của từng phát hiện qua cookie → trạng thái duyệt hiển thị "chưa đọc được" (đã có ở `buildDetectionItem`). Cần BE mở cookie hoặc trả quyết định trong `ai-mock-runs/{id}/result`.
- BE không có API lưu bbox/hiệu chỉnh khung AI, không có API "mở lại" quyết định ứng viên.
- `POST /projects/{p}/validation-runs` cần danh sách cặp (groundTruthId, derivedMeasurementId), không có API liệt kê mẫu → màn Thực nghiệm AI (RPT-09) chưa có nguồn dữ liệu (còn nguyên banner giải thích; việc giữ/bỏ nguyên màn thuộc nhóm Giám sát).
- Danh sách `survey-plans/tasks` không trả `surveyType`; list không có tên tuyến/km (chỉ `scopeSummary` đếm phân đoạn).

## 4. Chưa kiểm
- Chưa chạy trình duyệt: KEEP_NEW/REJECT thật trên màn thẩm định, `GET /candidates` + suy `roadSectionVersionId` trên dữ liệu seed.
- `tsc --noEmit` và `vite build` đạt tại thời điểm ghi (các lỗi tsc thoáng qua ở `notifications/`, `ProposalApprovalDetail`, `SystemControlModals` thuộc nhóm khác đã tự hết).
- Chưa rà `AIReviewInbox`/`ai-review/` (triage Case: conclusions, publications, report-links, report-splits đã có trong `triageService.ts` theo API-020..024) so với từng nút; chưa xác minh PM không gọi `GET /cases` (BE chỉ cho Giám sát).
