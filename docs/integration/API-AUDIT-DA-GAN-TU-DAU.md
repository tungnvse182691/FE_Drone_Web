# Rà soát toàn bộ API web đã gắn (kể cả phần có từ trước khi nhận yêu cầu)

Ngày: 2026-11-16. BE kiểm: bản mới nhất `RoadGuardSystem-develop (1)` (commit 05197e2) chạy Docker, dữ liệu demo mới + dữ liệu của `tools/seed-test-data.mjs`; đã kiểm lại toàn bộ sau khi BE cập nhật (161 vị trí gọi, Swagger runtime 278 thao tác): kết quả không đổi, 28 route vẫn Bearer-only, khớp 147/147 với Swagger, và `GET /survey-tasks/{id}/datasets` mới được FE dùng (200 cookie). Phiên Web: cookie + CSRF của PM (`pm-a`) và Giám sát (`supervisor`).

## 1. Phạm vi và giới hạn
- Thư mục FE **không phải git repo** nên không tách được "gắn từ đầu" theo commit. Cách làm: rà **toàn bộ** lời gọi API trong `src/` (160 vị trí gọi, quét tĩnh `apiClient.get|post|put|patch|delete`), đánh dấu phần nằm trong file **chưa bị sửa trong ngày 2026-11-16** (cột "Có từ trước") và đối chiếu bảng baseline của nhóm (`WEB-PM-SUP-API-STATUS-20261115.md`).
- Kiểm 3 lớp: (1) hợp đồng: có trong Swagger runtime của BE mới không; (2) chạy thật: cookie PM và Giám sát có vào được route không (GET dùng `projectId` thật; POST/PUT/PATCH/DELETE dùng ID ngẫu nhiên + body rỗng, nên **không tạo/đổi dữ liệu**, chỉ phân biệt 401 với các mã nghiệp vụ); (3) tĩnh: file gọi có gửi `Idempotency-Key`/`If-Match` theo yêu cầu swagger không.
- Không kiểm được: đúng/sai từng trường DTO ở mọi route (chỉ kiểm qua smoke giao diện và các luồng đã chạy thật trước đó), và các lời gọi dựng đường dẫn bằng biến (đã mở rộng tay các trường hợp động: giao/hủy nhiệm vụ đo, `survey-plans|tasks/{id}`, `defects|defect-statistics`).

## 2. Kết quả tóm tắt
| Kiểm tra | Kết quả |
|---|---|
| Lời gọi FE có trong Swagger runtime BE mới | **Tất cả** (trừ các đường dẫn dựng bằng biến, đã mở rộng tay và đều có). 6 route FE đang dùng **không có trong `docs/contracts/openapi.json` của FE** (bản đó cũ hơn runtime: 266 so với 277 thao tác): `GET /catalog/defect-types`, `GET /projects/{id}/road-geometry-submission`, `POST …/road-geometry-drafts/{id}/submit` và `/reject`, `GET …/segment-sets/{id}/pavement-layouts`, `PATCH /users/{id}/phone-number`. Ngược lại `deploy/fe-handoff/openapi.json` của BE mới thiếu 16 route so với runtime, trong đó có route FE dùng: `POST /projects/{id}/members`, `GET …/members/eligible`, `GET|PATCH /me/phone-number`, `GET /cases/{id}/reports` (+ evidence content). Cả hai file hợp đồng cần được cập nhật theo runtime. |
| Thao tác kiểm chạy thật (cookie) | 151; vào được: 123; 401: 28; lỗi 5xx: 0 |
| 401 vì BE chưa mở cookie (đang dùng Bearer tạm) | 21 |
| 401 vì Bearer-only theo thiết kế cũ của nhóm (`uploads`, `files`, `warranties`) | 7 (cần `VITE_DEV_FILE_BEARER=true`, xem `DEV-FILE-BEARER-20261116.md`) |
| 401 không giải thích được | **0** |
| Header bắt buộc (`Idempotency-Key`, `If-Match`) | Không file gọi nào thiếu (kiểm mức file) |
| Khác biệt theo vai trò (đúng thiết kế) | `GET /projects/{id}/defects`, `members/eligible`, `exports`, `labels`, `catalog/defect-types`: PM 200, Giám sát 403; `GET /users`: Giám sát 200, PM 403 |

## 2b. Xác minh lại các route bị 401 trên BE mới (source mới vẫn 401?)
- **Image BE đang chạy được build từ đúng source mới**: không có file .cs nào mới hơn thời điểm build (16:24:50).
- **Đối chiếu với chính Swagger runtime của BE** (BE tự gắn security `WebSession` cho route nào dùng được cookie, xem `AuthorizeOperationFilter`): so 151 thao tác FE gọi với swagger, **khớp 147/147** (4 route còn lại là route ẩn danh không có security: `auth/web/csrf`, `password-recovery-requests`, `invitations/accept`, `public/publications`). Cả 28 route bị 401 đều chỉ khai báo `Bearer`, **không có `WebSession`**. Nghĩa là 401 là đúng với hợp đồng của BE mới, không phải lỗi FE hay cookie: bản cập nhật BE mới mới mở Web cookie cho 7 route khảo sát (`SurveyV2Controller`), các controller assessments, processing, ai-mock-runs, retention, uploads/files, warranties chưa có `[WebCookieEligible]` (riêng `UploadsController` chỉ gắn cho `offline/uploads`).
- **Các route này chạy đúng khi gọi bằng Bearer** (kiểm trên BE mới, dữ liệu thật): GET `ai-mock-runs/{id}`, `…/result`, `ai-candidates/{id}`, `baseline-selections` (có `?segmentSetId`), `processing-jobs/{id}`, `retention/evaluations/{id}`, `retention/files/{id}`, `files/{id}`, `files/{id}/content` đều 200; `baseline-selections/{id}`, `validation-runs/{id}`, `assessments/{id}`, `retention/holds/{id}`, `uploads/{id}` với ID không tồn tại trả 404 đúng mã. Qua giao diện (Bearer tạm): tạo đánh giá 201, khóa baseline 201 (xem lại lần khóa đọc đúng), tạo job 202, chạy AI mock 202. Qua API Bearer: tạo đánh giá lưu trữ 202, tạo phong tỏa 201, đọc 200, gỡ 200; xác nhận căn cứ lưu trữ 409 (kiểm kê tệp chưa đầy đủ, đúng quy tắc); `validation-runs` body rỗng 400.
- **Kết luận:** logic và dữ liệu của 28 route này đúng trên BE mới; cái còn thiếu chỉ là cấu hình truyền tải (Web cookie) ở phía BE. Việc cần BE làm đã nằm ở mục C của `BE-REQUEST-WEBCOOKIE-ROUTES.md`. Đối với 7 route `uploads`/`files`/`warranties`, hiện chưa có trong danh sách đề nghị BE: cần bổ sung nếu muốn dùng không cần Bearer.

## 3. Phần "đã gắn" nhưng không đọc dữ liệu thật từ BE — ĐÃ XỬ LÝ (yêu cầu bỏ mock trong FE)
Cập nhật sau khi chủ dự án yêu cầu: dữ liệu phải load từ API của BE, không có dữ liệu mẫu trong FE; API không có thì hiện rỗng/lỗi rõ ràng.
| Màn | Trước | Sau |
|---|---|---|
| `/sup/dashboard` | 0 lời gọi API, toàn bộ mock | Lấy từ `GET /projects` (dự án đang bảo hành, thời điểm cập nhật), `reports/summary` (hiệu suất xử lý theo `repairItemsByStatus`), `reports/timeline` (hoạt động gần đây). Thẻ sắp hết hạn, đoạn chưa baseline, bản đồ/bảng rủi ro, PCI, SLA, lọc Kỳ/Khu vực: hiện rỗng "Máy chủ chưa cung cấp dữ liệu này". Nút "Tải xuống hồ sơ" không còn giả lập "đã tạo file", báo chưa nối và hướng dẫn dùng Phân tích rủi ro |
| `/sup/proposals/:id` (phê duyệt đề xuất) | fallback `mockRepairBatches`, ảnh unsplash giả, tên người giả | Gói/hạng mục đọc từ BE; trường BE không có hiện "—"; duyệt hạng mục (Giám sát) gọi `POST …/approve` thật (đã chạy thật qua giao diện: 201, trang chuyển "Đã duyệt 100%"); các thao tác chưa có API (yêu cầu bổ sung, từ chối, gán đội…) báo "chưa có API" và không đổi trạng thái |
| Cấu hình hệ thống | mô hình AI viết cứng, danh mục lỗi mock, thao tác lưu giả, xuất nhãn giả | Danh mục lỗi từ `GET /catalog/defect-types` (PM đọc được; Giám sát nhận 403 nên hiện thông báo); thêm/sửa/bật-tắt/xuất nhãn bị khóa kèm lý do; tab mô hình AI rỗng "Máy chủ chưa có API danh mục mô hình AI" |
| Nhật ký hoạt động (`/pm|sup/audit-trail`) | Ghi nhận trước đó là mock | **Đính chính:** `auditService` vốn đã đọc thật `GET /projects/{id}/reports/timeline`; lỗi nằm ở bộ lọc thời gian dùng đồng hồ cố định 10/10/2026 nên hiện 0 sự kiện. Đã sửa: hiện 15 (PM) / 18 (Giám sát) sự kiện thật; banner ghi BE chưa có API nhật ký chung; nút xuất bị khóa; ô "Hợp lệ" giả đổi thành "Chưa có nguồn kiểm tra" |
| Xung đột ngoại tuyến (`/pm|sup/conflicts`) | đọc `/__dev/conflicts` (SQL qua Vite), nuốt lỗi | Không còn gọi mạng hay `/__dev/*`; hiện "Máy chủ chưa có API xung đột ngoại tuyến cho Web" (BE không có route này, thuộc luồng mobile), thẻ thống kê "—", nút phân giải bị khóa |
| `surveyService.ts` (legacy) | Bảng `PROJECT_ROAD_MAP`/`getProjectRoadConfig`, `/__dev/*`, hằng datasetId/taskId, localStorage giả | **Đã xóa** (2122 → 911 dòng). Danh sách khảo sát/phát hiện AI đọc từ `survey-plans`, `survey-tasks`, `ai-mock-runs`, `ai-candidates`, `defects`, `baseline-selections`; thao tác BE chưa hỗ trợ ném lỗi "chưa được tích hợp" |
| `utils/projectGeodesy.ts` (tọa độ/tim tuyến cứng) | Tọa độ khiếm khuyết suy từ lý trình × hằng số | **Đã xóa**; dùng `defectGeoService.ts` đọc `geometry-package` (`wgs84Geometry`), ghim theo `segmentId` (tâm phân đoạn). Không có dữ liệu: "Máy chủ chưa cung cấp tọa độ" |
| Ảnh unsplash, nút điền tài khoản `/__dev/test-account`, `AUTO_TEST_CASE_IDS`, `chainage_km: 0.351`, pilotNote/localStorage baseline, `setTimeout` giả ở validation/acceptance/project, kho in-memory | Có | **Đã gỡ**; lý trình thiếu hiện "Chưa có lý trình từ server"; hàm chưa có API ném lỗi "Chưa nối máy chủ"; `EvidenceCloseoutDetail` bỏ mã vụ việc/gói cứng và nút xuất giả |
| Còn sót (chưa xử lý) | | `alignmentService.ts` lưu trạng thái tim tuyến ở localStorage `roadguard_alignment_state_*` (cũng đọc ở `projectService.ts:56`); `vite.config.ts` `/__dev/*` + mật khẩu SA (mục 4) |

Các file `mockData.ts` cũ đã bị xóa khỏi repo.

## 4. Rủi ro an ninh cần xử lý
- `vite.config.ts` chứa **mật khẩu SA của SQL Server viết cứng ở 11 chỗ** (`docker exec … sqlcmd -U sa -P "…"`) kèm các middleware `/__dev/*` ghi/đọc thẳng CSDL. Nếu file đã vào Git thì mật khẩu đã lộ: nên đổi mật khẩu SA của môi trường đó, xóa các middleware dev này hoặc đọc mật khẩu từ biến môi trường. FE không tự sửa vì thuộc phần dev server, cần chủ dự án quyết định.
- Tên container cứng trong `vite.config.ts` (`roadguard-case409-clean-20261106-api-1`, `roadguard-fe-starter01-sql-1`) làm ô "điền sẵn tài khoản" ở màn đăng nhập và các `/__dev/*` không chạy trên stack hiện tại.

## 5. Kết luận
- Mọi API FE gọi đều tồn tại trên BE mới; không có lời gọi nào sai method/đường dẫn, không có lỗi 5xx khi vào bằng cookie.
- Chỉ các route đã liệt kê ở mục 2 bị 401 bằng cookie (BE chưa mở hoặc Bearer-only); không phát hiện route "đã gắn từ trước" nào hỏng ngoài nhóm đó.
- Các màn trông như đã gắn nhưng dùng dữ liệu mock (mục 3) đã được xử lý: nối API thật nếu BE có, hiện rỗng/lỗi rõ ràng nếu BE chưa có.

## 6. Phụ lục: từng thao tác đã kiểm
Cột PM / Giám sát là mã HTTP khi gọi bằng cookie (GET dùng projectId thật, còn lại dùng ID ngẫu nhiên nên 404/400/403/409 là bình thường: route vào được). "Có từ trước" = lời gọi chỉ nằm trong file chưa sửa trong ngày.

| Method | Route | PM | Giám sát | Có từ trước | Kết luận | File gọi |
|---|---|---|---|---|---|---|
| POST | `/auth/change-password` | 400 | 400 | — | OK | api/auth.ts |
| POST | `/auth/password-recovery-requests` | 400 | 400 | — | OK | api/auth.ts |
| GET | `/auth/web/csrf` | 200 | 200 | — | OK | api/auth.ts |
| GET | `/auth/web/session` | 200 | 200 | — | OK | api/auth.ts |
| GET | `/cases` | 403 | 200 | có | OK | api/services/fieldEvidenceReuseCommands.ts, api/services/triageService.ts |
| GET | `/cases/{caseId}` | 404 | 404 | có | OK | api/services/triageService.ts |
| POST | `/cases/{caseId}/conclusions` | 400 | 400 | có | OK | api/services/caseEvidenceRequestService.ts, api/services/caseNoDefectService.ts |
| GET | `/cases/{caseId}/reports` | 404 | 404 | có | OK | api/services/caseReportService.ts |
| POST | `/cases/{caseId}/triage` | 400 | 400 | có | OK | api/services/caseScopeService.ts, api/services/triageService.ts |
| GET | `/datasets/{datasetId}/coverage` | 404 | 404 | — | OK | api/services/surveyDatasetService.ts |
| GET | `/datasets/{id}` | 404 | 404 | — | OK | api/services/surveyDatasetService.ts, api/services/surveyService.ts |
| POST | `/datasets/{id}/assessments` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts, api/services/surveyService.ts |
| GET | `/datasets/{id}/assessments/{assessmentId}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts |
| GET | `/files/{fileId}` | 401 | 401 | có | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/coverageDocumentService.ts, api/services/surveyService.ts |
| GET | `/files/{fileId}/content` | 401 | 401 | — | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/surveyService.ts, api/services/trainingLabelService.ts |
| POST | `/invitations` | 400 | 400 | — | OK | api/services/personnelService.ts |
| POST | `/invitations/accept` | 400 | 400 | có | OK | api/services/invitationAcceptService.ts |
| POST | `/labels/{labelId}/review` | 400 | 403 | — | OK | api/services/trainingLabelService.ts |
| PATCH | `/me/phone-number` | 400 | 400 | có | OK | api/services/profileService.ts |
| GET | `/notifications` | 200 | 200 | có | OK | api/services/notificationService.ts |
| GET | `/notifications/{notificationId}` | 404 | 404 | có | OK | api/services/notificationService.ts |
| POST | `/notifications/{notificationId}/read` | 404 | 404 | có | OK | api/services/notificationService.ts |
| GET | `/notifications/{notificationId}/scope` | 404 | 404 | có | OK | api/services/notificationService.ts |
| POST | `/processing-jobs` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts |
| GET | `/processing-jobs/{jobId}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts |
| POST | `/processing-jobs/{jobId}/retry` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts |
| GET | `/profile` | 200 | 200 | có | OK | api/services/profileService.ts |
| PUT | `/profile` | 400 | 400 | có | OK | api/services/profileService.ts |
| GET | `/projects` | 200 | 200 | — | OK | api/services/acceptanceService.ts, api/services/dutyService.ts |
| POST | `/projects` | 400 | 400 | có | OK | api/services/projectService.ts |
| PUT | `/projects/{projectId}` | 400 | 400 | có | OK | api/services/projectUpdateService.ts |
| GET | `/projects/{projectId}/ai-candidates/{detectionId}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts, api/services/surveyService.ts |
| GET | `/projects/{projectId}/ai-mock-runs` | 200 | 200 | — | OK | api/services/surveyDatasetService.ts, api/services/validationService.ts |
| POST | `/projects/{projectId}/ai-mock-runs` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts, api/services/surveyService.ts |
| GET | `/projects/{projectId}/ai-mock-runs/{runId}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/aiRunDetailService.ts |
| GET | `/projects/{projectId}/ai-mock-runs/{runId}/result` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/candidate3ValidationService.ts, api/services/surveyDatasetService.ts |
| GET | `/projects/{projectId}/baseline-selections` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts |
| POST | `/projects/{projectId}/baseline-selections` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts, api/services/surveyService.ts |
| GET | `/projects/{projectId}/baseline-selections/{id}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/surveyDatasetService.ts |
| POST | `/projects/{projectId}/candidate-decisions` | 400 | 403 | có | OK | api/services/reportKeepNewCommands.ts, api/services/surveyService.ts |
| GET | `/projects/{projectId}/candidate-decisions/{decisionId}` | 404 | 403 | có | OK | api/services/reportKeepNewCommands.ts, api/services/surveyService.ts |
| GET | `/projects/{projectId}/candidates` | 400 | 403 | có | OK | api/services/reportKeepNewCommands.ts, api/services/surveyService.ts |
| GET | `/projects/{projectId}/clocks` | 200 | 200 | — | OK | api/services/dashboardService.ts, api/services/dutyService.ts |
| POST | `/projects/{projectId}/clocks/{clockId}/appointments` | 400 | 400 | — | OK | api/services/dutyService.ts |
| POST | `/projects/{projectId}/clocks/{clockId}/extensions` | 400 | 400 | — | OK | api/services/dashboardService.ts |
| GET | `/projects/{projectId}/crs-profiles` | 200 | 200 | có | OK | api/services/alignmentService.ts |
| POST | `/projects/{projectId}/crs-profiles` | 400 | 400 | có | OK | api/services/alignmentService.ts |
| GET | `/projects/{projectId}/crs-profiles/{profileId}` | 404 | 404 | có | OK | api/services/alignmentService.ts |
| GET | `/projects/{projectId}/defect-statistics` | 200 | 200 | — | OK | api/services/defectStatisticsService.ts |
| POST | `/projects/{projectId}/defect-statistics` | 400 | 400 | — | OK | api/services/defectStatisticsService.ts |
| GET | `/projects/{projectId}/defects` | 200 | 403 | — | OK | api/services/fieldCreateCommands.ts, api/services/repairService.ts |
| GET | `/projects/{projectId}/defects/{defectId}` | 404 | 403 | — | OK | api/services/fastTrackFormSources.ts, api/services/fieldCreateCommands.ts |
| POST | `/projects/{projectId}/defects/{defectId}/assessments` | 400 | 403 | có | OK | api/services/surveyService.ts |
| POST | `/projects/{projectId}/defects/{defectId}/publications` | 404 | 403 | — | OK | api/services/publicPublicationService.ts |
| POST | `/projects/{projectId}/defects/{defectId}/verification-decisions` | 400 | 403 | có | OK | api/services/surveyService.ts |
| GET | `/projects/{projectId}/exports` | 200 | 403 | có | OK | api/services/projectExportService.ts |
| POST | `/projects/{projectId}/exports` | 400 | 400 | có | OK | api/services/projectExportService.ts |
| GET | `/projects/{projectId}/exports/{exportId}` | 404 | 403 | có | OK | api/services/projectExportService.ts |
| GET | `/projects/{projectId}/exports/{exportId}/content` | 404 | 403 | có | OK | api/services/projectExportService.ts |
| GET | `/projects/{projectId}/exports/{exportId}/manifest` | 404 | 403 | có | OK | api/services/projectExportService.ts |
| POST | `/projects/{projectId}/field-inspection-tasks` | 400 | 400 | có | OK | api/services/fieldCreateCommands.ts, api/services/fieldTaskService.ts |
| GET | `/projects/{projectId}/field-inspection-tasks` | 200 | 200 | có | OK | api/services/fieldTaskService.ts |
| GET | `/projects/{projectId}/field-inspection-tasks/{taskId}` | 404 | 404 | — | OK | api/services/acceptanceService.ts, api/services/fastTrackFormSources.ts |
| POST | `/projects/{projectId}/field-inspection-tasks/{taskId}/assign` | 400 | 400 | — | OK | ờng dẫn động) |
| POST | `/projects/{projectId}/field-inspection-tasks/{taskId}/cancel` | 400 | 400 | — | OK | ờng dẫn động) |
| POST | `/projects/{projectId}/field-inspection-tasks/{taskId}/evidence-reuse` | 400 | 400 | có | OK | api/services/fieldEvidenceReuseCommands.ts |
| GET | `/projects/{projectId}/field-inspection-tasks/{taskId}/evidence/{fileId}` | 404 | 404 | có | OK | api/services/fieldEvidenceReuseCommands.ts |
| GET | `/projects/{projectId}/field-inspection-tasks/{taskId}/history` | 404 | 404 | — | OK | api/services/fieldTaskReadService.ts |
| POST | `/projects/{projectId}/field-inspection-tasks/{taskId}/location-impact-decisions` | 400 | 400 | — | OK | api/services/fieldTaskActions.ts |
| POST | `/projects/{projectId}/field-inspection-tasks/{taskId}/reassign` | 400 | 400 | — | OK | ờng dẫn động) |
| POST | `/projects/{projectId}/field-inspection-tasks/{taskId}/reviews` | 400 | 400 | có | OK | api/services/fieldReviewCommands.ts |
| GET | `/projects/{projectId}/field-inspection-tasks/{taskId}/submissions/{submissionId}` | 404 | 404 | — | OK | api/services/fieldTaskReadService.ts |
| GET | `/projects/{projectId}/geometry-location-impacts` | 200 | 200 | có | OK | api/services/geometryImpactService.ts |
| GET | `/projects/{projectId}/geometry-location-impacts/{impactId}` | 404 | 404 | có | OK | api/services/geometryImpactService.ts |
| POST | `/projects/{projectId}/geometry-map-publications` | 400 | 400 | có | OK | api/services/mapPublicationService.ts |
| GET | `/projects/{projectId}/geometry-map-publications/{publicationId}` | 404 | 404 | có | OK | api/services/fastTrackFormSources.ts, api/services/geometryImpactService.ts |
| GET | `/projects/{projectId}/geometry-map-publications/{publicationId}/layers/{layer}` | 428 | 428 | có | OK | api/services/geometryImpactService.ts, api/services/mapPublicationService.ts |
| GET | `/projects/{projectId}/geometry-package` | 400 | 400 | có | OK | api/services/alignmentService.ts, api/services/surveyPlanningService.ts |
| GET | `/projects/{projectId}/labels` | 200 | 403 | — | OK | api/services/trainingLabelService.ts |
| POST | `/projects/{projectId}/labels` | 400 | 403 | — | OK | api/services/trainingLabelService.ts |
| GET | `/projects/{projectId}/labels/{labelId}` | 404 | 403 | — | OK | api/services/trainingLabelService.ts |
| POST | `/projects/{projectId}/labels/{labelId}/revisions` | 400 | 403 | — | OK | api/services/trainingLabelService.ts |
| GET | `/projects/{projectId}/lifecycle` | 200 | 200 | — | OK | api/services/lifecycleRenewService.ts, api/services/projectService.ts |
| POST | `/projects/{projectId}/lifecycle/{command}` | 400 | 400 | có | OK | api/services/projectService.ts |
| POST | `/projects/{projectId}/lifecycle/renewed-handling-scope` | 400 | 400 | — | OK | api/services/lifecycleRenewService.ts |
| GET | `/projects/{projectId}/members` | 200 | 200 | có | OK | api/services/personnelDetailRead.ts, api/services/projectService.ts |
| POST | `/projects/{projectId}/members` | 400 | 403 | — | OK | api/services/personnelService.ts |
| GET | `/projects/{projectId}/members/eligible` | 200 | 403 | — | OK | api/services/personnelService.ts |
| GET | `/projects/{projectId}/pavement-layouts/{layoutId}` | 404 | 404 | có | OK | api/services/fastTrackFormSources.ts, api/services/pavementService.ts |
| POST | `/projects/{projectId}/pavement-layouts/as-built` | 400 | 400 | có | OK | api/services/pavementService.ts |
| GET | `/projects/{projectId}/primary-project-manager` | 200 | 200 | — | OK | api/services/personnelDetailRead.ts, api/services/personnelService.ts |
| PUT | `/projects/{projectId}/primary-project-manager` | 400 | 400 | — | OK | api/services/personnelService.ts |
| GET | `/projects/{projectId}/processing-jobs` | 200 | 200 | — | OK | api/services/surveyDatasetService.ts |
| POST | `/projects/{projectId}/publications/{publicId}/withdraw` | 404 | 403 | — | OK | api/services/publicPublicationService.ts |
| GET | `/projects/{projectId}/receiving-requests` | 200 | 200 | — | OK | api/services/dutyService.ts |
| GET | `/projects/{projectId}/receiving-requests/{requestId}` | 404 | 404 | — | OK | api/services/dutyService.ts |
| POST | `/projects/{projectId}/receiving-requests/{requestId}/ack` | 403 | 403 | — | OK | api/services/dutyService.ts |
| POST | `/projects/{projectId}/receiving-requests/{requestId}/appointment` | 400 | 400 | — | OK | api/services/dutyService.ts |
| GET | `/projects/{projectId}/repair-packages` | 200 | 200 | — | OK | api/services/acceptanceService.ts, api/services/projectService.ts |
| POST | `/projects/{projectId}/repair-packages` | 400 | 400 | — | OK | api/services/repairService.ts, api/services/repairWorkflowService.ts |
| GET | `/projects/{projectId}/repair-packages/{packageId}/items` | 404 | 404 | — | OK | api/services/acceptanceService.ts, api/services/repairService.ts |
| POST | `/projects/{projectId}/repair-packages/{packageId}/items` | 400 | 400 | — | OK | api/services/repairService.ts, api/services/repairWorkflowService.ts |
| GET | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}` | 404 | 404 | — | OK | api/services/acceptanceService.ts, api/services/repairSafetyService.ts |
| POST | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/approve` | 400 | 400 | — | OK | api/services/repairService.ts |
| POST | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/assign` | 400 | 400 | — | OK | api/services/repairService.ts |
| GET | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/eligibility` | 404 | 404 | có | OK | api/fastTrack.ts, api/services/repairWorkflowService.ts |
| POST | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/final-confirmation` | 400 | 400 | — | OK | api/services/acceptanceService.ts, api/services/repairService.ts |
| GET | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/history` | 404 | 404 | — | OK | api/services/acceptanceService.ts, api/services/repairWorkflowService.ts |
| POST | `/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews` | 400 | 400 | — | OK | api/services/acceptanceService.ts |
| GET | `/projects/{projectId}/reports/items` | 400 | 400 | có | OK | api/services/projectReportingService.ts |
| GET | `/projects/{projectId}/reports/summary` | 200 | 200 | có | OK | api/services/projectReportingService.ts |
| GET | `/projects/{projectId}/reports/timeline` | 400 | 400 | có | OK | api/services/projectReportingService.ts |
| GET | `/projects/{projectId}/retention/evaluations` | 200 | 200 | — | OK | api/services/retentionService.ts |
| POST | `/projects/{projectId}/retention/evaluations` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/retentionService.ts |
| GET | `/projects/{projectId}/retention/evaluations/{id}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/candidate3RetentionService.ts, api/services/retentionService.ts |
| GET | `/projects/{projectId}/retention/files/{fileId}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/retentionService.ts |
| PUT | `/projects/{projectId}/retention/files/{fileId}/basis` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/retentionService.ts |
| GET | `/projects/{projectId}/road-coverage` | 200 | 200 | — | OK | api/services/coverageDocumentService.ts, api/services/projectWarrantyService.ts |
| GET | `/projects/{projectId}/road-geometry-drafts/{draftId}/readiness` | 404 | 404 | có | OK | api/services/alignmentService.ts |
| GET | `/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/geometry` | 404 | 404 | có | OK | api/services/alignmentService.ts, api/services/fastTrackFormSources.ts |
| GET | `/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets` | 404 | 404 | — | OK | api/services/repairService.ts, api/services/triageGeometryService.ts |
| GET | `/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets/{setId}` | 404 | 404 | có | OK | api/services/pavementService.ts, api/services/projectReportingService.ts |
| GET | `/projects/{projectId}/route-systems` | 200 | 200 | có | OK | api/services/alignmentService.ts |
| POST | `/projects/{projectId}/route-systems` | 400 | 400 | có | OK | api/services/routeSystemCommands.ts |
| POST | `/projects/{projectId}/route-versions/{routeVersionId}/segment-sets/{segmentSetId}/pavement-plans` | 400 | 400 | có | OK | api/services/pavementService.ts |
| POST | `/projects/{projectId}/survey-plans` | 400 | 400 | có | OK | api/services/surveyCreateCommands.ts |
| POST | `/projects/{projectId}/survey-tasks` | 400 | 400 | có | OK | api/services/surveyCreateCommands.ts |
| POST | `/projects/{projectId}/validation-runs` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/validationService.ts |
| POST | `/projects/{projectId}/warranties` | 401 | 401 | có | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/projectWarrantyService.ts |
| GET | `/projects/{projectId}/weekly-digests/{digestId}` | 404 | 404 | — | OK | api/services/dutyService.ts |
| GET | `/projects/{projectId}/work-package` | 200 | 200 | — | OK | api/services/alignmentService.ts, api/services/projectServerFacts.ts |
| GET | `/public/publications/{publicId}` | 404 | 404 | — | OK | api/services/publicPublicationService.ts |
| POST | `/retention/holds` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/retentionService.ts |
| GET | `/retention/holds/{id}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/retentionService.ts |
| POST | `/retention/holds/{id}/release` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/retentionService.ts |
| GET | `/survey-plans/{id}` | 404 | 404 | — | OK | ờng dẫn động) |
| POST | `/survey-plans/{planId}/postpone` | 400 | 400 | — | OK | api/services/surveyActions.ts |
| GET | `/survey-tasks/{id}/work-package` | 404 | 404 | — | OK | api/services/surveyDatasetService.ts |
| GET | `/survey-tasks/{taskId}` | 404 | 404 | — | OK | ờng dẫn động) |
| POST | `/survey-tasks/{taskId}/cancel` | 400 | 400 | — | OK | api/services/surveyActions.ts |
| POST | `/survey-tasks/{taskId}/reassign` | 400 | 400 | — | OK | api/services/surveyActions.ts |
| POST | `/survey-tasks/{taskId}/supplements` | 400 | 400 | — | OK | api/services/surveyActions.ts, api/services/surveyService.ts |
| POST | `/uploads` | 401 | 401 | có | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/coverageDocumentService.ts |
| GET | `/uploads/{uploadId}` | 401 | 401 | có | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/coverageDocumentService.ts |
| POST | `/uploads/{uploadId}/complete` | 401 | 401 | có | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/coverageDocumentService.ts |
| POST | `/uploads/{uploadId}/part-urls` | 401 | 401 | có | 401 – Bearer-only theo thiết kế cũ (DevFileBearer) | api/services/coverageDocumentService.ts |
| GET | `/users` | 403 | 200 | — | OK | api/services/personnelService.ts |
| GET | `/users/{userId}` | 403 | 404 | — | OK | api/services/personnelService.ts |
| PATCH | `/users/{userId}` | 400 | 400 | — | OK | api/services/personnelService.ts |
| POST | `/users/{userId}/password-reset` | 400 | 400 | — | OK | api/services/personnelService.ts |
| GET | `/validation-runs/{runId}` | 401 | 401 | — | 401 – BE chưa mở cookie (đang dùng Bearer tạm) | api/services/validationService.ts |
