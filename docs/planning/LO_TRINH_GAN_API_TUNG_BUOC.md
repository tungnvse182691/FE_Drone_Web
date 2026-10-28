# LỘ TRÌNH GẮN API BACKEND TOÀN DIỆN (ROADGUARD WEB)
### ĐỐI CHIẾU 100% TẤT CẢ CÁC MÀN HÌNH WEB VÀ 260 ENDPOINTS CANONICAL

> **Căn cứ chuẩn:** Backend Candidate3 (`http://localhost:18081`), OpenAPI canonical [`docs/contracts/openapi.json`](../contracts/openapi.json), Screen-API Matrix [`docs/specs/17_10/`](../specs/17_10/) và kỷ luật [`AGENTS.md`](../../AGENTS.md).  
> **Cam kết:** **Bao phủ 100% toàn bộ route/màn hình FE hiện có trong repo**, chia thành **10 Giai đoạn mạch lạc** để gắn và kiểm thử độc lập, tránh quá tải và hạn chế lỗi chéo.

---

## 🗺️ BẢNG ĐỐI CHIẾU 100% ROUTE WEB FE HIỆN TẠI VÀO 10 GIAI ĐOẠN

| STT | Route URL trên Web FE | File Component chính | Vai trò | Giai đoạn gắn API | Mã Spec 17_10 |
|:---:|---|---|:---:|:---:|:---:|
| **1** | `/login` | `src/pages/(auth)/Login.tsx` | Chung | **Giai đoạn 1** | `PM-01`, `SUP-01` |
| **2** | `/force-change-password` | `src/pages/(auth)/ForceChangePassword.tsx` | Chung | **Giai đoạn 1** | `PM-01` |
| **3** | `/pm/profile`, `/sup/profile` | `src/pages/(pm)/ProfilePage.tsx` | Chung | **Giai đoạn 1** | `PM-01` |
| **4** | `/pm/dashboard`, `/sup/dashboard` | `PMDashboard.tsx`, `SupDashboard.tsx` | PM / SUP | **Giai đoạn 2** | `PM-01`, `SUP-01` |
| **5** | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/ProjectList.tsx` | PM / SUP | **Giai đoạn 2** | `PM-01`, `PM-02` |
| **6** | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/ProjectOverview.tsx` | PM / SUP | **Giai đoạn 2** | `PM-02` |
| **7** | `/pm/projects/:id/alignment`, `/sup/alignment` | `src/pages/(pm)/AlignmentSegments.tsx` | PM / SUP | **Giai đoạn 3** | `PM-03`, `SUP-03` |
| **8** | `/pm/ai-inbox` (Tab Dân), `/sup/cases` | `src/pages/(pm)/AIReviewInbox.tsx` | PM / SUP | **Giai đoạn 4** | `SUP-02`, `PM-11` |
| **9** | `/pm/surveys`, `/sup/surveys` | `src/pages/(pm)/SurveyRequests.tsx` | PM / SUP | **Giai đoạn 5** | `PM-06` |
| **10** | `/pm/surveys/create` | `src/pages/(pm)/CreateSurvey.tsx` | PM | **Giai đoạn 5** | `PM-06` |
| **11** | `/pm/drone-mission`, `/pm/surveys/:id` | `DroneMissionAIReview.tsx` | PM / SUP | **Giai đoạn 5** | `PM-07` |
| **12** | `/pm/ai-inbox` (Tab AI) | `src/pages/(pm)/AIReviewInbox.tsx` | PM | **Giai đoạn 6** | `PM-04` |
| **13** | `/pm/defects/:id/verify-a`, `.../verify-b` | `DefectDetailVerify.tsx` | PM | **Giai đoạn 6** | `PM-05` |
| **14** | `/pm/field-tasks`, `/sup/field-tasks` | `src/pages/(pm)/FieldTasks.tsx` | PM / SUP | **Giai đoạn 7** | `PM-08` |
| **15** | `/pm/conflict-center` | `FieldTasks.tsx` (Tab Conflict) | PM | **Giai đoạn 7** | `PM-13` |
| **16** | `/pm/fast-track`, `/sup/fast-track` | `FastTrackDispatch.tsx` | PM / SUP | **Giai đoạn 8** | `PM-10`, `SUP-05`, `SUP-08` |
| **17** | `/pm/proposals`, `/sup/proposals` | `RepairProposals.tsx` | PM / SUP | **Giai đoạn 9** | `PM-09`, `SUP-06` |
| **18** | `/pm/repair-batches/assign` | `AssignCrew.tsx` | PM | **Giai đoạn 9** | `PM-09` |
| **19** | `/sup/approvals/:id`, `/pm/proposals/:id` | `ProposalApprovalDetail.tsx` | PM / SUP | **Giai đoạn 9** | `SUP-06`, `PM-09` |
| **20** | `/sup/approvals/:id/reject` | `BatchRejection.tsx` | SUP | **Giai đoạn 9** | `SUP-06` |
| **21** | `/sup/acceptance`, `/pm/acceptance` | `AcceptanceList.tsx` | PM / SUP | **Giai đoạn 10** | `SUP-07`, `PM-09` |
| **22** | `/sup/acceptance/:batchId`, `evidence-closeout`| `EvidenceCloseoutDetail.tsx` | PM / SUP | **Giai đoạn 10** | `SUP-07` |
| **23** | `/sup/personnel`, `/pm/personnel` | `PersonnelManagement.tsx` | SUP / PM | **Giai đoạn 10** | `SUP-04` |
| **24** | `/accept-invitation`, `/invite/:token` | `AcceptInvitation.tsx` | Chung | **Giai đoạn 10** | `SUP-04` |
| **25** | `/pm/notifications` | `NotificationsHandoffHub.tsx` | PM | **Giai đoạn 10** | `PM-12` |
| **26** | `/sup/risk-analytics`, `/pm/risk-analytics` | `RiskAnalytics.tsx` | SUP / PM | **Giai đoạn 10** | `SUP-09`, `PM-12` |
| **27** | `/sup/research-validation` | `ResearchValidation.tsx` | SUP / PM | **Giai đoạn 10** | `SUP-09` |
| **28** | `/sup/audit-trail` | `AuditTrail.tsx` | SUP / PM | **Giai đoạn 10** | `SUP-10` |
| **29** | `/sup/system-control`, `/pm/system-control` | `SystemControl.tsx` | SUP / PM | **Giai đoạn 10** | `SUP-09`, `PM-12` |

---

## 🎯 CƠ CHẾ KỸ THUẬT: BẬT API ĐỘC LẬP TỪNG BƯỚC (GRANULAR TOGGLE)

1. **Môi trường kết nối:**
   - Backend Docker chạy tại: `http://localhost:18081`.
   - Vite Web Dev Server chạy tại: `http://localhost:5173` (Reverse proxy `/api` sang `http://localhost:18081`).
   - Cấu hình file `.env`:
     ```env
     VITE_API_URL=/api/v1
     VITE_USE_MOCK=false
     ```
2. **Cơ chế An toàn (Graceful Fallback):**
   - Các service chưa gắn API thật sẽ giữ nguyên dữ liệu Mock dự phòng.
   - Khi gắn đến Giai đoạn nào, ta sẽ kích hoạt gọi API thật qua `apiClient` của file service tương ứng.
3. **Cách nhận biết đã ăn API thật hay chưa:**
   - **Network Tab (F12):** Thấy request `http://localhost:5173/api/v1/...` trả về status `200` / `201` từ Backend.
   - **Header:** Luôn có `Cookie: WebSession=...` và mutation tự đính `X-CSRF-TOKEN: ...`.
   - **Tính bền vững:** F5 (reload) trình duyệt dữ liệu không bị mất vì đã lưu vào PostgreSQL Docker.

---

# 📋 NỘI DUNG CHI TIẾT 10 GIAI ĐOẠN

---

### GIAI ĐOẠN 1: XÁC THỰC, PHIÊN LÀM VIỆC & HỒ SƠ CÁ NHÂN (W01)
> **Mục tiêu:** Đăng nhập lấy cookie WebSession, CSRF token, kiểm tra phiên làm việc, đổi mật khẩu lần đầu bắt buộc và quản lý thông tin tài khoản.

* **Màn hình liên quan:**
  - Đăng nhập: `/login` — `Login.tsx`
  - Đổi mật khẩu bắt buộc: `/force-change-password` — `ForceChangePassword.tsx`
  - Hồ sơ cá nhân: `/pm/profile`, `/sup/profile` — `ProfilePage.tsx`
* **File Service phụ trách:**
  - `src/api/auth.ts`
  - `src/api/services/authService.ts`
  - `src/api/services/profileService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/auth/web/csrf` (`API-013`): Lấy CSRF token cho phiên trình duyệt.
  2. `POST /api/v1/auth/web/login` (`API-014`): Đăng nhập, nhận session cookie và cờ `mustChangePassword`.
  3. `GET /api/v1/auth/web/session` (`API-017`): Kiểm tra quyền hạn và thông tin người dùng hiện tại.
  4. `POST /api/v1/auth/web/renew` (`API-016`): Tự động gia hạn session khi token hết hạn.
  5. `POST /api/v1/auth/web/logout` (`API-015`): Đăng xuất và hủy session.
  6. `POST /api/v1/users/{userId}/change-password` (`API-030`): Đổi mật khẩu lần đầu / đổi định kỳ.
* **Bảng tài khoản Seed Docker Candidate3 chuẩn (`/handoff/demo-accounts.json`):**
  | Vai trò | Email đăng nhập | Mật khẩu (Seed ngẫu nhiên từ container) | Ghi chú |
  |---|---|---|---|
  | **Supervisor** | `supervisor@sandbox.example.test` | `Rg1!1YpbfL2fpPP1JWp3t1HdkXpTPZVdUJ2OrWllT8iNLvBPaZq3MMU5g3XT7VFUCwDv` | Giám sát / Toàn quyền hệ thống |
  | **PM-A** | `pm-a@sandbox.example.test` | `Rg1!6NDP3wctfXKjXNzvYjSeg-grQxza2t_BGNxmH_DDlyfjEr7oZFEMtLmnssW7Meed` | Chỉ huy trưởng tuyến chính |
  | **PM-B** | `pm-b@sandbox.example.test` | `Rg1!GYnOn7fnImb4JxVGhXAhFxei1DlgtrQhnktcXHgQnKMA7nSofAOjG1SGptEbmGJt` | Chỉ huy trưởng tuyến phụ |
  | **Reporter-A** | `reporter-a@sandbox.example.test` | `Rg1!5KAtAG4kEwzYTBlhcd6Set9gn1LCUkUj-P_qwI9WY0CzmUpE4VrzlcMyt5lNoM19` | Người dân gửi phản ánh |
  | **Operator-A** | `operator-a@sandbox.example.test` | `Rg1!7eaw7ZYqCHU1VHdfULd12FHUUyYZg9XGxCM_AU6PobP9D1isVaqrdxwUUeJYDHAt` | Phi công bay Drone |
  | **Crew-A** | `crew-a@sandbox.example.test` | `Rg1!hkvs6oWkHUSFfnrz7mc0rp6su2pDc-ISSk_0cXuaq2nAz_Q8NKyu78az1bY7MlVA` | Đội trưởng thi công |

* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Mở `/login`, đăng nhập bằng tài khoản PM / Supervisor trong seed data backend.
  - [ ] F12 Network có các request: `csrf` (200), `login` (200), `session` (200).
  - [ ] Nếu user có cờ `mustChangePassword === true`, hệ thống tự chuyển hướng sang `/force-change-password`.

---


### GIAI ĐOẠN 2: DANH MỤC DỰ ÁN, CHI TIẾT & VÒNG ĐỜI BẢO HÀNH (W01 & W02)
> **Mục tiêu:** Tải danh mục dự án theo phân quyền, nạp chi tiết dự án, thành viên tham gia và các mốc thời gian bảo hành.

* **Màn hình liên quan:**
  - Danh sách dự án: `/pm/projects`, `/sup/projects` — `ProjectList.tsx`
  - Tổng quan & Vòng đời: `/pm/projects/:id`, `/sup/projects/:id` — `ProjectOverview.tsx`
  - Dashboard tổng quan: `/pm/dashboard`, `/sup/dashboard` — `PMDashboard.tsx`, `SupDashboard.tsx`
* **File Service phụ trách:**
  - `src/api/services/projectService.ts`
  - `src/api/services/dashboardService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects` (`API-049`): Lấy danh sách các dự án đang bảo hành theo phân quyền.
  2. `GET /api/v1/projects/{projectId}` (`API-049` detail): Lấy thông tin chi tiết một dự án.
  3. `GET /api/v1/projects/{projectId}/members` (`API-112`): Danh sách nhân sự tham gia dự án.
  4. `GET /api/v1/projects/{projectId}/lifecycle` (`API-109`): Mốc thời gian, ngày bàn giao, ngày hết hạn bảo hành.
  5. `POST /api/v1/projects/{projectId}/lifecycle/{command}` (`API-110`): Cập nhật vòng đời dự án (PM/SUP).
  6. `POST /api/v1/projects` (`API-050`): Tạo mới dự án (Chỉ Supervisor có quyền - FR-04, BR-01).
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Dashboard và trang danh sách dự án hiển thị danh sách từ PostgreSQL Docker thay vì mảng mock.
  - [ ] Thử đổi project context, dữ liệu chi tiết project tải tương ứng `API-049` / `API-109`.

---

### GIAI ĐOẠN 3: BẢN ĐỒ TIM TUYẾN GIS & HỆ TỌA ĐỘ UTM (W02)
> **Mục tiêu:** Nạp gói dữ liệu hình học GeoJSON/KML lên bản đồ MapLibre, PM lập bản thảo tim tuyến mới và Supervisor thẩm định khóa tim tuyến.

* **Màn hình liên quan:**
  - Không gian tim tuyến GIS: `/pm/projects/:id/alignment` & `/sup/alignment` — `AlignmentSegments.tsx`
* **File Service phụ trách:**
  - `src/api/services/alignmentService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects/{projectId}/crs-profiles` (`API-065`): Hệ tọa độ tham chiếu UTM Zone 32648 (EPSG:32648).
  2. `GET /api/v1/projects/{projectId}/geometry-package` (`API-104`): Tải gói KML/GeoJSON tim tuyến và phân đoạn đường.
  3. `POST /api/v1/projects/{projectId}/road-geometry-drafts` (`API-177`): PM tạo bản nháp tim tuyến mới.
  4. `PUT /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` (`API-179`): PM cập nhật tọa độ tim tuyến.
  5. `POST /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/preview` (`API-181`): Xem trước tim tuyến trước khi trình.
  6. `POST /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/confirm` (`API-180`): **Supervisor phê duyệt khóa tim tuyến chính thức**.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [x] Bản đồ MapLibre load tuyến đường vẽ trên bản đồ từ response của `geometry-package`.
  - [x] Supervisor bấm duyệt tim tuyến (`API-180`), trạng thái KML chuyển thành `Đã phê duyệt` và dự án chuyển sang `ACTIVE`.

---

### GIAI ĐOẠN 4: TIẾP NHẬN PHẢN ÁNH & ĐIỀU PHỐI CA (W03 & W04)
> **Mục tiêu:** Xử lý phản ánh hư hỏng từ ứng dụng di động của người dân: Giám sát điều phối (`Triage API-024`), Chỉ huy trưởng kết luận và xuất bản.

* **Màn hình liên quan:**
  - Hộp thư phản ánh người dân: `/pm/ai-inbox` (Tab Dân) & `/sup/cases` — `AIReviewInbox.tsx`, `CitizenTriageRow.tsx`
* **File Service phụ trách:**
  - `src/api/services/triageService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/cases` (`API-018`): Danh sách ca phản ánh kèm bộ lọc trạng thái (`UNASSIGNED`, `ASSIGNED_TO_PROJECT`).
  2. `GET /api/v1/cases/{caseId}` (`API-019`): Chi tiết ca phản ánh, ảnh chụp và tọa độ GPS.
  3. `POST /api/v1/cases/{caseId}/triage` (`API-024`): **Duy nhất Supervisor** điều phối ca vào dự án và chọn phương thức xác minh (`FIELD`/`DRONE`).
  4. `POST /api/v1/cases/{caseId}/conclusion` (`API-020`): PM nhập kết luận đánh giá hư hỏng.
  5. `POST /api/v1/cases/{caseId}/publish` (`API-023`): Xuất bản thông báo xử lý phản ánh cho người dân.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Đăng nhập Supervisor: Thấy các ca chưa gán (`UNASSIGNED`), bấm nút **Điều phối dự án** (`API-024`) gán thành công.
  - [ ] Đăng nhập PM: Ca xuất hiện trong inbox của PM, nút Triage bị ẩn; PM nhập kết luận thẩm định thành công.

---

### GIAI ĐOẠN 5: KHẢO SÁT DRONE & TIẾN TRÌNH AI PIPELINE (W05)
> **Mục tiêu:** Tạo kế hoạch bay Drone trắc địa, theo dõi tiến trình nhận diện Road-YOLOv9 và khóa mốc chuẩn bảo hành.

* **Màn hình liên quan:**
  - Danh sách kế hoạch bay: `/pm/surveys`, `/sup/surveys` — `SurveyRequests.tsx`
  - Tạo yêu cầu bay mới: `/pm/surveys/create` — `CreateSurvey.tsx`
  - Theo dõi tiến trình AI YOLOv9: `/pm/drone-mission`, `/pm/surveys/:id` — `DroneMissionAIReview.tsx`
* **File Service phụ trách:**
  - `src/api/services/surveyService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects/{projectId}/survey-plans` (`API-223`): Danh sách kế hoạch bay khảo sát.
  2. `POST /api/v1/projects/{projectId}/survey-plans` (`API-201`): PM tạo kế hoạch bay kèm tham số trắc địa GSD, độ cao bay.
  3. `POST /api/v1/projects/{projectId}/survey-plans/{planId}/dispatch` (`API-228`): Giao kế hoạch bay cho Operator.
  4. `GET /api/v1/ai-processing-runs/{runId}` (`API-045`): Thăm dò trạng thái tiến trình xử lý Road-YOLOv9.
  5. `POST /api/v1/ai-processing-runs` (`API-044`): Kích hoạt lệnh chạy nhận diện AI trên tập ảnh/video.
  6. `POST /api/v1/projects/{projectId}/baseline-lock` (`API-057`): Khóa mốc chuẩn bảo hành công trình.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Tạo kế hoạch bay từ Web FE xuất hiện trong cơ sở dữ liệu `survey-plans`.
  - [ ] Tiến trình AI HUD hiển thị % xử lý đồng bộ từ backend run ID.

---

### GIAI ĐOẠN 6: THẨM ĐỊNH KHIẾM KHUYẾT AI, BOUNDING BOX & ĐA KỲ (W04 & W05)
> **Mục tiêu:** PM thẩm định các candidate do AI phát hiện (bộ 3 nút `KEEP_NEW`, `LINK_EXISTING`, `REJECT`), so sánh ảnh đa kỳ (Temporal epoch) và chốt phân loại TCVN.

* **Màn hình liên quan:**
  - Hộp thư lỗi AI: `/pm/ai-inbox` (Tab AI) — `AIReviewInbox.tsx`
  - Thẩm định chi tiết BBox: `/pm/defects/:id/verify-a` — `DefectDetailVerify.tsx`
  - So sánh ảnh đa kỳ: `/pm/defects/:id/verify-b` — `DefectDetailVerify.tsx`
* **File Service phụ trách:**
  - `src/api/services/surveyService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects/{projectId}/ai-candidates` (`API-060`, `API-061`): Danh sách khiếm khuyết candidate từ AI.
  2. `POST /api/v1/projects/{projectId}/ai-candidates/{cId}/assess` (`API-059`): PM thẩm định:
     - `KEEP_NEW`: Xác nhận khiếm khuyết mới, sinh Defect ID chính thức trên server.
     - `LINK_EXISTING`: Gom vào khiếm khuyết cũ để theo dõi lún nứt đa kỳ.
     - `REJECT`: Bác bỏ lỗi AI phát hiện sai.
  3. `GET /api/v1/projects/{projectId}/defects/{defectId}` (`API-070`): Chi tiết khiếm khuyết, ảnh đa kỳ và kích thước bounding box.
  4. `PUT /api/v1/projects/{projectId}/defects/{defectId}` (`API-072`): Cập nhật thông tin phân loại khiếm khuyết.
  5. `POST /api/v1/projects/{projectId}/defects/{defectId}/verify` (`API-073`): Chốt xác minh khiếm khuyết đạt chuẩn.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Bấm `KEEP_NEW` trên UI, backend trả về mã Defect chính thức (`DEF-2026-XXXX`).
  - [ ] Màn hình Verify hiển thị BBox và ảnh đa kỳ so sánh side-by-side đúng với metadata ảnh từ BE.

---

### GIAI ĐOẠN 7: NHIỆM VỤ ĐO ĐẠC HIỆN TRƯỜNG & HÒA GIẢI XUNG ĐỘT (W06 & W09)
> **Mục tiêu:** Quản lý nhiệm vụ giao cho Tổ đo đạc hiện trường (Crew), nhập kích thước hình học thực tế, duyệt tái sử dụng ảnh người dân (`API-084`) và giải quyết xung đột ngoại tuyến.

* **Màn hình liên quan:**
  - Nhiệm vụ hiện trường: `/pm/field-tasks`, `/sup/field-tasks` — `FieldTasks.tsx`
  - Hòa giải xung đột ngoại tuyến: `/pm/conflict-center` — `FieldTasks.tsx` (Tab Conflict Center)
* **File Service phụ trách:**
  - `src/api/services/fieldTaskService.ts`
  - `src/api/services/conflictService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects/{projectId}/field-inspection-tasks` (`API-078`): Danh sách nhiệm vụ đo đạc hiện trường.
  2. `POST /api/v1/projects/{projectId}/field-inspection-tasks` (`API-079`): PM tạo nhiệm vụ đo đạc bổ sung.
  3. `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/assign` (`API-082`): Phân công Crew đi đo đạc.
  4. `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence-reuse` (`API-084`): PM duyệt dùng ảnh phản ánh của dân làm ảnh trước thi công.
  5. `GET /api/v1/sync/conflicts` (`API-126`): Danh sách các xung đột dữ liệu ngoại tuyến (Offline sync).
  6. `POST /api/v1/sync/conflicts/{conflictId}/resolve` (`API-127`): Hòa giải xung đột phiên bản.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Bấm duyệt "Tái sử dụng ảnh" gửi payload `API-084` thành công, bảng hiện badge `Reused Evidence`.
  - [ ] Thử tạo xung đột version, Conflict Center hiển thị thông tin 2 bản ghi và cho phép giải quyết.

---

### GIAI ĐOẠN 8: CƠ CHẾ XỬ LÝ KHẨN CẤP FAST TRACK (W08)
> **Mục tiêu:** PM thiết lập ngưỡng kỹ thuật khẩn cấp, xuất bản chính sách; Supervisor phê duyệt phân đoạn tuyến được áp dụng (`API-176`), PM điều phối và tự nghiệm thu chốt gói.

* **Màn hình liên quan:**
  - Điều phối Fast Track: `/pm/fast-track`, `/sup/fast-track` — `FastTrackDispatch.tsx`
* **File Service phụ trách:**
  - `src/api/services/fastTrackService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects/{projectId}/fast-track/policy` (`API-163`): Lấy chính sách Fast Track hiện hành.
  2. `POST /api/v1/projects/{projectId}/fast-track/policy/draft` (`API-162`): PM lập dự thảo ngưỡng kích thước khẩn cấp.
  3. `POST /api/v1/projects/{projectId}/fast-track/policy/publish` (`API-165`): PM xuất bản chính sách Fast Track.
  4. `POST /api/v1/projects/{projectId}/road-coverage` (`API-176`): **Supervisor phê duyệt danh mục phân đoạn tuyến** áp dụng Fast Track.
  5. `GET /api/v1/projects/{projectId}/fast-track/violations` (`API-146`): Danh sách vi phạm ngưỡng kỹ thuật.
  6. `POST /api/v1/projects/{projectId}/fast-track/{batchId}/final-confirm` (`API-147` FT mode): PM tự nghiệm thu chốt gói Fast Track.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Khi đăng nhập vai trò Supervisor: Nút **Phê duyệt độ phủ tuyến (API-176)** sáng màu vàng đồng và bấm duyệt thành công.
  - [ ] Khi đăng nhập PM: Nút duyệt bị ẩn, PM tạo và xuất bản chính sách mới bình thường.

---

### GIAI ĐOẠN 9: GOM ĐỢT SỬA CHỮA, THẨM DUYỆT & GIAO VIỆC (W07)
> **Mục tiêu:** PM gom khiếm khuyết thành gói sửa chữa kỹ thuật (Zero Money), trình duyệt; Supervisor duyệt (`API-142`) hoặc từ chối (`API-144`) từng hạng mục; PM phân công đội thi công (`API-143`).

* **Màn hình liên quan:**
  - Lập phương án & Gom đợt: `/pm/proposals`, `/sup/proposals` — `RepairProposals.tsx`
  - Phân công đội thi công: `/pm/repair-batches/assign` — `AssignCrew.tsx`
  - Thẩm duyệt hồ sơ đợt sửa: `/sup/approvals/:id`, `/pm/proposals/:id` — `ProposalApprovalDetail.tsx`
  - Yêu cầu sửa đổi / Từ chối: `/sup/approvals/:id/reject` — `BatchRejection.tsx`
* **File Service phụ trách:**
  - `src/api/services/repairService.ts`
* **Danh sách API kết nối:**
  1. `GET /api/v1/projects/{projectId}/repair-packages` (`API-141`): Danh sách các đợt sửa chữa.
  2. `POST /api/v1/projects/{projectId}/repair-packages` (`API-139`): PM tạo đợt sửa chữa mới.
  3. `POST /api/v1/projects/{projectId}/repair-packages/{batchId}/submit` (`API-140`): PM trình duyệt hồ sơ đợt sửa chữa lên Giám sát.
  4. `POST /api/v1/projects/{projectId}/repair-packages/{batchId}/approve` (`API-142`): **Duy nhất Supervisor phê duyệt**.
  5. `POST /api/v1/projects/{projectId}/repair-packages/{batchId}/reject` (`API-144`): **Supervisor từ chối kèm lý do chỉnh sửa**.
  6. `POST /api/v1/projects/{projectId}/repair-packages/{batchId}/assign-crew` (`API-143`): PM phân công đội thi công sau khi đã duyệt.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] PM tạo đợt sửa, chuyển trạng thái sang `PENDING_APPROVAL`.
  - [ ] Supervisor duyệt gói (`API-142`) -> đợt chuyển sang `APPROVED`, toàn bộ item bị khóa cứng Read-only (Invariants BR-21).
  - [ ] Thử từ chối gói (`API-144`), đợt chuyển sang `REVISION_REQUIRED` và hiển thị lý do phản hồi cho PM.

---

### GIAI ĐOẠN 10: NGHIỆM THU HIỆN TRƯỜNG, KÝ SỐ ĐÓNG ĐỢT & KIỂM SOÁT HỆ THỐNG (W09 & W10)
> **Mục tiêu:** Nghiệm thu chất lượng ngoài hiện trường (`PASSED`/`SUPPLEMENT`), Ký số đóng đợt (`API-147`), Quản lý nhân sự/thư mời, Báo cáo rủi ro SLA, Legal Hold, Kiểm tra băm toàn vẹn SHA-256 HMAC và Trung tâm thông báo Handoff.

* **Màn hình liên quan:**
  - Danh sách nghiệm thu: `/sup/acceptance`, `/pm/acceptance` — `AcceptanceList.tsx`
  - Nghiệm thu chi tiết & Ký đóng đợt: `/sup/acceptance/:batchId`, `evidence-closeout` — `EvidenceCloseoutDetail.tsx`
  - Quản lý nhân sự & Thư mời: `/sup/personnel`, `/accept-invitation` — `PersonnelManagement.tsx`, `AcceptInvitation.tsx`
  - Trung tâm thông báo: `/pm/notifications` — `NotificationsHandoffHub.tsx`
  - Báo cáo phân tích rủi ro & Legal Hold: `/sup/risk-analytics` — `RiskAnalytics.tsx`
  - Nghiên cứu & Đánh giá mô hình AI: `/sup/research-validation` — `ResearchValidation.tsx`
  - Nhật ký hệ thống: `/sup/audit-trail` — `AuditTrail.tsx`
  - Kiểm soát hệ thống & Lưu trữ: `/sup/system-control` — `SystemControl.tsx`
* **File Service phụ trách:**
  - `src/api/services/acceptanceService.ts`
  - `src/api/services/reportService.ts`
  - `src/api/services/auditService.ts`
  - `src/api/services/retentionService.ts`
  - `src/api/services/validationService.ts`
* **Danh sách API kết nối:**
  1. `POST .../repair-attempts/{attemptId}/review` (`API-158`): Supervisor chấm nghiệm thu (`PASSED` hoặc `SUPPLEMENT`).
  2. `POST /api/v1/projects/{projectId}/repair-packages/{batchId}/sign-off` (`API-147`): **Ký số đóng đợt** (chỉ mở khi 100% item PASSED).
  3. `GET /api/v1/users` (`API-029`) & `POST /api/v1/staff-invitations` (`API-032`): Supervisor mời nhân sự mới.
  4. `GET /api/v1/notifications` (`API-039`) & `POST /api/v1/notifications/{id}/read` (`API-041`): Thông báo hệ thống.
  5. `POST /api/v1/legal-holds` (`API-220`) & `DELETE /api/v1/legal-holds/{id}` (`API-222`): Phong tỏa pháp lý hồ sơ.
  6. `GET /api/v1/audit-logs` (`API-036`) & `POST /api/v1/audit-logs/verify-integrity` (`API-038`): Kiểm tra chuỗi băm tamper-proof.
  7. `GET /api/v1/reports/exports` (`API-168`) & `POST /api/v1/reports/exports` (`API-171`): Xuất báo cáo PDF/Excel.
* **Dấu hiệu kiểm chứng đạt (Verification):**
  - [ ] Khi còn item chưa PASSED, nút Ký số đóng đợt bị vô hiệu hóa (Disabled). Khi 100% đạt, nút sáng vàng đồng cho phép bấm ký.
  - [ ] Form gửi lời mời nhân sự mới (`API-032`) gửi request thành công, người được mời mở link `/accept-invitation` kích hoạt được tài khoản.
  - [ ] Bấm "Kiểm tra toàn vẹn" tại trang Audit Trail, backend trả về kết quả xác minh băm chuỗi SHA-256 HMAC hợp lệ.

---

## 🚀 THỨ TỰ BẮT ĐẦU NGAY BÂY GIỜ

Khi Hoàng sẵn sàng bật Docker:
1. **Bước đầu tiên:** Bắt đầu **GIAI ĐOẠN 1 (Xác thực, Phiên làm việc & Hồ sơ cá nhân)**.
2. Nối API `login`, `csrf`, `session`, `change-password` thật với Backend.
3. Hoàng vào `/login` kiểm tra Network F12 thấy `200 OK` và vào được trang chủ là hoàn thành Phase 1!
