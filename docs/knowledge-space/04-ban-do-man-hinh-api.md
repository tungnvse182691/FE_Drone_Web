# 04 — Bản đồ màn hình ↔ route ↔ code ↔ API

Cột "API chính" là **những API mà màn đó thực sự dùng (đối chiếu với mã nguồn và `docs/contracts/openapi.json`)**; không liệt hết. Cột "Kiểm" cho biết đã chạy bằng giao diện thật chưa. Bảng đầy đủ do máy sinh ra nằm ở [_api-by-service.generated.md](_api-by-service.generated.md).
Tất cả file nằm dưới `src/pages/`. Thư mục con cùng tên màn (ví dụ `(pm)/fast-track/`, `(sup)/system-control/`) chứa các thành phần con.

## 1. Chung (không phân vai)
| Route | File | Mục đích | API chính | Kiểm |
|---|---|---|---|---|
| `/login` | `(auth)/Login` | Đăng nhập Web (cookie + CSRF) | `GET /auth/web/csrf`, `POST /auth/web/login`, `GET /auth/web/session` | ✔ |
| `/auth/setup-password`, `/accept-invitation`, `/invite/:token` | `(auth)/AcceptInvitation` | Nhận lời mời, đặt mật khẩu | `POST /invitations/preview`, `POST /invitations/accept` | ✔ |
| `/force-change-password` | `(auth)/ForceChangePassword` | Đổi mật khẩu bắt buộc | đổi mật khẩu | — |

## 2. Project Manager (`/pm/*`, layout `(pm)/PMLayout`)
| Route | File | Mục đích | API chính | Kiểm |
|---|---|---|---|---|
| `dashboard` | `(pm)/PMDashboard` | Tổng quan PM: bay, ứng viên, gói sửa | tổng hợp từ nhiều GET | ✔ mở |
| `projects`, `projects/:id` | `(pm)/ProjectList`, `ProjectOverview` | Danh sách / hồ sơ dự án, **thẻ Hoàn thành thi công** (`project-overview/ProjectConstructionCard`) | `GET /projects`, `GET /projects/{p}/lifecycle`, `POST /projects/{p}/lifecycle/construction-declarations` | ✔ |
| `projects/:id/alignment`, `alignment` | `(pm)/AlignmentSegments` | Hình học tuyến, phân đoạn, bố trí tấm | `…/geometry-package`, `…/road-sections/{rs}/versions/{v}/geometry`, `…/crs-profiles` | ✔ mở |
| `surveys`, `surveys/create`, `surveys/:id` | `(pm)/SurveyRequests`, `CreateSurvey`, `DroneMissionAIReview` | Kế hoạch bay / nhiệm vụ / **panel bộ dữ liệu + Chạy AI** (`surveys/SurveyDatasetPanel`) | `GET/POST /projects/{p}/survey-plans`, `…/survey-tasks`, `POST …/ai-mock-runs`, `GET …/processing-jobs` | ✔ |
| `ai-inbox` | `(pm)/AIReviewInbox` | Hộp thẩm định ứng viên | `GET …/ai-mock-runs/{run}/result`, `POST …/candidate-decisions` | ✔ |
| `defects/:id/verify` | `(pm)/DefectDetailVerify` | Quyết định ứng viên, gom khiếm khuyết | `POST/GET …/candidate-decisions`, `GET …/ai-candidates/{id}` (Bearer-only) | ✔ |
| `field-tasks` | `(pm)/FieldTasks` | FIELD: tạo, theo dõi, duyệt đo | `…/field-inspection-tasks`, `POST …/{id}/reviews` | ✔ mở |
| `proposals`, `proposals/:id`, `work-packages`, `repair-batches` | `(pm)/RepairProposals`; chi tiết dùng `(sup)/ProposalApprovalDetail` | Gói/hạng mục sửa chữa, nguồn khiếm khuyết, lập kế hoạch, chuyển nghĩa vụ (`repair-proposals/*`), xuất hồ sơ gói | `…/repair-packages`, `…/items`, `…/planning`, `…/source-defect`, `POST /projects/{p}/exports` | ✔ |
| `repair-batches/assign` | `(pm)/AssignCrew` | **Giao việc Normal** cho Crew | `POST …/items/{i}/assign` | ✔ |
| `fast-track`, `dispatch` | `(pm)/FastTrackDispatch` (+ `fast-track/*`) | Chính sách Fast Track + điều phối | `…/repair-policies/*`, `…/road-coverage`, `POST …/items/{i}/assign {policyRevisionId}` | ✔ (bước giao bị BE chặn) |
| `acceptance`, `acceptance/:batchId`, `evidence-closeout` | `(sup)/AcceptanceList`, `EvidenceCloseoutDetail` | Gói nghiệm thu, duyệt ảnh 3 pha | `…/items/{i}/attempts/reviews`, `…/final-confirmation`, DOSSIER theo hạng mục | — (cần Crew nộp) |
| `offline` (`conflicts` chuyển hướng) | `(pm)/OfflineCoordination` | Thiết bị, lô offline, xung đột | `…/offline/*` (GET), thu hồi | ✔ mở / — dữ liệu |
| `research-validation` | `(sup)/research/ResearchWorkspace` | Đọc nguồn AI REAL và khung hình. PM quản lý nhãn và yêu cầu xuất nhãn trong dự án được giao | Dataset, `ai-videos`, `ai-jobs/{job}/detections`, `ai-candidates/{id}`, `labels`, `exports` loại TRAINING | Đã kiểm đọc nguồn REAL, nhãn và lượt xuất trên local |
| `reports` | `(sup)/risk-analytics/ReportingMenu` | Tổng quan, đối chiếu chỉ số, lịch sử, bình đồ và hồ sơ DOSSIER. Xác nhận nguồn thống kê cần dữ liệu hợp lệ | `GET …/reports/{summary,items,timeline}`, `…/defect-statistics`, `…/exports` | Đã kiểm đọc, bộ lọc, phân trang và danh sách xuất trên local |
| `audit-trail`, `risk-analytics` | `(sup)/AuditTrail`, `RiskAnalytics` | Nhật ký và thống kê | `GET /projects/{p}/reports/*`, nhật ký | ✔ mở |
| `retention`, `system-control`, `legal-hold` | `(sup)/SystemControl` | Lưu trữ + phong tỏa (PM xem) | `retention/*` | ✔ mở |
| `personnel`, `team` | `(sup)/PersonnelManagement` | Nhân sự | `GET /users`, `…/member-contacts` | ✔ mở |
| `profile` | `(pm)/ProfilePage` | Hồ sơ cá nhân, đơn vị công tác | `GET /profile`, `PUT /profile` | ✔ |
| `notifications` | `(pm)/NotificationsHandoffHub` | Hộp thông báo | `GET /notifications`, `POST …/read-batch` | ✔ mở / — dữ liệu |

## 3. Supervisor (`/sup/*`, layout `(sup)/SupLayout`)
| Route | File | Mục đích | API chính | Kiểm |
|---|---|---|---|---|
| `dashboard` | `(sup)/SupDashboard` | Tổng quan toàn cục | nhiều GET | ✔ mở |
| `projects`, `projects/:id` | `(pm)/ProjectList`, `ProjectOverview` (dùng chung) | Tạo dự án (có **biên bản bàn giao**), xác nhận thi công, **vị trí dự án** (`project-overview/ProjectLocalityCard`) | `POST /projects/handover-upload-intents`…`POST /projects`, `POST …/lifecycle/construction-confirmations`, `PUT …/locality` | ✔ |
| `cases`, `ai-inbox` | `(pm)/AIReviewInbox` | Hàng đợi Case/ứng viên (phân loại) | `POST /cases/{id}/triage` | ✔ mở / — dữ liệu |
| `surveys`, `drone-mission` | `(pm)/SurveyRequests`, `DroneMissionAIReview` | Giám sát chiến dịch bay | `GET …/survey-tasks` | ✔ mở |
| `fast-track`, `dispatch` | `(pm)/FastTrackDispatch` | Xác nhận độ phủ; xem Fast Track | `POST …/road-coverage` | ✔ |
| `field-tasks` | `(pm)/FieldTasks` | Xem FIELD | GET | ✔ mở |
| `proposals`, `proposals/:id`, `approvals/:id` | `(pm)/RepairProposals`, `(sup)/ProposalApprovalDetail` | **Duyệt hạng mục Normal**, chuyển/tiếp nhận nghĩa vụ | `POST …/items/{i}/approve`, `POST …/lifecycle/obligation-transfers`, `…/obligation-transfer-acceptances` | ✔ |
| `acceptance`, `evidence-closeout` | `(sup)/AcceptanceList`, `EvidenceCloseoutDetail` | **Xác nhận cuối** Normal, đóng khiếm khuyết | `POST …/final-confirmation`, `…/lifecycle/defect-closures` | — (cần Crew nộp) |
| `offline` | `(pm)/OfflineCoordination` | Cấp/thu hồi bàn giao | `…/offline/*` | — dữ liệu |
| `system-control`, `admin`, `retention`, `legal-hold` | `(sup)/SystemControl` (+ `system-control/*`) | **Lưu trữ, đánh giá, căn cứ, phong tỏa**, danh mục loại khiếm khuyết (`DefectTypeAdminPanel`), sửa đơn vị người dùng (`UserOrganizationEditor`) | `…/retention/*`, `POST /retention/holds`, `PUT /users/{id}/organization`, `…/catalog/defect-types/admin` | ✔ |
| `personnel`, `team` | `(sup)/PersonnelManagement` | **Mời nhân sự**, vai trò, đổi mật khẩu | `POST /invitations`, `GET /users` | ✔ |
| `research-validation` | `(sup)/research/ResearchWorkspace` | Đọc nguồn AI REAL và khung hình theo phạm vi được cấp | Dataset, `ai-videos`, `ai-jobs/{job}/detections`, `ai-candidates/{id}` | Đã kiểm đọc trên local |
| `risk-analytics` | `(sup)/risk-analytics/ReportingMenu` | Đọc báo cáo và thống kê. DOSSIER chịu quyền riêng của dự án và nguồn | `GET …/reports/{summary,items,timeline}`, `GET …/defect-statistics`, `…/exports` | Đã kiểm đọc, phân trang và phản hồi 403 khi thiếu quyền xuất trên local |
| `audit-trail`, `reports` | `(sup)/AuditTrail`, `RiskAnalytics` | Nhật ký và thống kê | GET | ✔ mở |
| `profile`, `notifications` | `(pm)/ProfilePage`, `NotificationsHandoffHub` | Hồ sơ / thông báo | như PM | ✔ mở |

## 4. Phân quyền theo màn (Report 3 §3.1.3, rút gọn)
- **Chỉ Giám sát:** Dashboard Giám sát, Quản trị dự án, Duyệt/Xác nhận hình học, Hộp phân loại Case, Duyệt đề xuất NORMAL, Bác/Chỉ thị, Nghiệm thu & ký, Retention, Nhân sự/RBAC.
- **Chỉ PM:** Dashboard PM, Hình học tuyến, Kế hoạch bay, Hộp thẩm định ứng viên, Nối báo cáo, Công bố Case, Tạo gói, Giao Crew, FIELD, Fast Track, review.
- **Mobile:** mọi màn của Reporter, Drone Operator, Repair Crew — **không test**.
- Quyền thực tế luôn do **BE** quyết; nếu UI và BE lệch nhau, **BE đúng**.

## 5. Vị trí code hay phải mở
| Cần | Ở đâu |
|---|---|
| Gắn token/CSRF, danh sách route "ẩn danh" | `src/api/client.ts` |
| Xác thực + phiên (Zustand) | `src/store/authStore.ts` |
| Các service gọi API | `src/api/services/*.ts` |
| Bộ thành phần giao diện chung (PanelShell, Field, Feedback, PanelButton…) | `src/components/ui/PanelKit.tsx`, lớp `rg-*` trong `src/index.css` |
| Chống bấm trùng | hook `useSubmitGuard` |
| Route | `src/App.tsx` |
| Proxy dev → BE | `vite.config.ts` (`/api` → `https://localhost:18443`) |
