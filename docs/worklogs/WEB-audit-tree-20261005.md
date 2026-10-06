# Worklog: AUDIT TOÀN DIỆN CÂY MÃ NGUỒN (SRC/ & DOCS/) TRÊN NHÁNH tung

- **Ngày thực hiện:** 06/10/2026  
- **Nhánh:** `tung`  
- **Loại tác vụ:** READ-ONLY AUDIT (Không sửa code, không git commit)  
- **Tiêu chuẩn kiến trúc đối chiếu:** 
  - Senior React Frontend Engineer (Vite + React 19 + TypeScript + Tailwind + Zustand + TanStack Query).
  - Container (state/params/effects/handlers/API) $\rightarrow$ `ui/` + `hooks/` + `types.ts` colocated.
  - Logic nghiệp vụ cấm nằm trong component UI.
  - Component > 300 dòng bắt buộc chẻ nhỏ.
  - Hook chứa behavior.
  - Type entity dùng chung chỉ định nghĩa tại `src/types/domain.ts` SSOT.
  - Phân cấp thư mục: Thư mục > 15 files bắt buộc tách cấp 2 (`docs/FOLDER_RULES.md`).

---

## 1. CÂY THƯ MỤC & PHÂN TẦNG

### 1.1. Thư mục tên gây nhầm lẫn
1. **`src/pages/(pm)/projects` vs `src/pages/(pm)/project-overview`**:
   - `projects` chứa component cho `ProjectList.tsx` (danh sách dự án).
   - `project-overview` chứa component cho `ProjectOverview.tsx` (chi tiết 1 dự án).
   - Hai folder đặt tên ngang hàng trong `(pm)` dễ gây nhầm lẫn khi tìm kiếm code màn hình chi tiết dự án.
2. **`src/pages/(pm)/surveys` vs `src/pages/(pm)/create-survey` vs `src/pages/(pm)/drone-review`**:
   - Cả 3 thư mục đều phục vụ cùng một luồng nghiệp vụ khảo sát drone:
     - `surveys`: Danh sách yêu cầu bay (`SurveyRequests.tsx`).
     - `create-survey`: Tạo yêu cầu bay (`CreateSurvey.tsx`).
     - `drone-review`: Thẩm định dữ liệu bay AI (`DroneMissionAIReview.tsx`).
   - Route URL tương ứng: `/pm/surveys`, `/pm/surveys/create`, `/pm/surveys/:id`. Việc xé làm 3 folder ngang hàng phân tán các hook và types dùng chung của drone survey.
3. **`src/pages/(sup)/proposal-approval` vs `src/pages/(pm)/repair-proposals`**:
   - Trong `App.tsx`:
     - Route `/pm/proposals` trỏ về `RepairProposals.tsx` (dùng `src/pages/(pm)/repair-proposals/`).
     - Route `/pm/proposals/:id` và `/sup/proposals/:id` cùng trỏ về `ProposalApprovalDetail.tsx` (dùng `src/pages/(sup)/proposal-approval/`).
   - Hai vai trò PM và Supervisor cùng xem chung màn chi tiết thẩm định nhưng subcomponents lại đặt riêng biệt bên thư mục của `(sup)`.
4. **`src/pages/(sup)/evidence-closeout`**:
   - Thư mục đặt bên `(sup)` nhưng phục vụ đến 5 route URL cho cả PM và SUP: `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout`, `/sup/acceptance`, `/sup/acceptance/:batchId`, `/sup/evidence-closeout`.

### 1.2. Thư mục vượt ngưỡng > 15 files cần tách cấp 2
*Lệnh thực thi:* `Get-ChildItem -Path "src" -Directory -Recurse | ... FileCount`

| Thư mục | Số lượng files | Đánh giá | Đề xuất tách cấp 2 |
|---|:---:|---|---|
| `src/pages/(pm)/ai-review` | **36 files** | Quá tải, vi phạm Rule 3 | Tách thành: `drawer/` (7 files), `modals/` (10 files), `triage/` (5 files), `hooks/` (6 files), `ui/` (8 files) |
| `src/pages/(pm)/alignment` | **30 files** | Quá tải, vi phạm Rule 3 | Tách thành: `map/` (7 files), `sidebar/` (8 files), `modals/` (5 files), `hooks/` (4 files), `helpers/` (3 files) |
| `src/pages/(pm)/fast-track` | **21 files** | Quá tải, vi phạm Rule 3 | Tách thành: `modals/` (5 files), `dispatch/` (6 files), `policy/` (3 files), `hooks/` (3 files) |
| `src/pages/(sup)/system-control` | **16 files** | Vượt ngưỡng 15 files | Tách thành: `modals/` (6 files), `tabs/` (4 files), `hooks/` (3 files) |
| `src/pages/(pm)` | **15 files** | Ngưỡng tối đa | Đang giữ 15 container page files |

### 1.3. File đặt sai tầng
1. **`src/components/common/RoadDefectImages.tsx` (481 dòng)**:
   - Chứa mã SVG vẽ vector kỹ thuật 10 loại hư hỏng mặt đường. Đặt ở `src/components/common/` nhưng quá đồ sộ và thực chất chỉ được gọi bởi duy nhất 1 consumer: `src/components/common/SafeImage.tsx`. Nên đưa vào `src/assets/svg/road-defects/` hoặc tách riêng thành module assets.
2. **`src/pages/(pm)/alignment/SegmentsTable.tsx` (137 dòng)**:
   - Đặt trong `src/pages/(pm)/alignment/` nhưng không hề được import hay hiển thị ở bất kỳ đâu trong toàn bộ dự án.

---

## 2. FILE CHẾT (DEAD CODE AUDIT)

*Lệnh thực thi:* Quét toàn bộ 180+ file `.ts`, `.tsx` trong `src/` tìm import và usage thực tế.

| Đường dẫn file | Số dòng | Số lượng importer | Tình trạng |
|---|:---:|:---:|---|
| `src/pages/(pm)/alignment/SegmentsTable.tsx` | 137 | **0** | **DEAD CODE**. Không có bất kỳ component, hook hay test nào import. Là tệp thừa còn sót lại từ đợt refactor tách Sidebar tabs. |
| `src/design-tokens.ts` | 27 | **0** | Không có import code nào trong `src/`. Đang đóng vai trò file tài liệu re-export token từ `tailwind.config.js`. |

---

## 3. TRÙNG TÊN & QUY ƯỚC COLOCATION

### 3.1. `types.ts` (17 files) & `mockData.ts` (12 files)
- **`types.ts` ×17**: Hoàn toàn **ĐÚNG QUY ƯỚC** theo Điều 1 & Điều 4 của `docs/FOLDER_RULES.md` (Feature Colocation). Mỗi feature sở hữu 1 file `types.ts` để chứa props component, filter states, modal options cục bộ.
- **`mockData.ts` ×12**: Có sự **BẤT NHẤT** về quy ước:
  - Một số feature chỉ dùng `data.ts` (`alignment`, `risk-analytics`).
  - Một số feature có cả `data.ts` và `mockData.ts` chỉ để re-export (`fast-track`, `repair-proposals`).
  - Các feature còn lại dùng `mockData.ts` (`create-survey`, `drone-review`, `notifications`, `project-overview`, `projects`, `audit-trail`, `dashboard`, `evidence-closeout`, `proposal-approval`).
  - Cần chuẩn hóa: Dữ liệu tĩnh/options đưa về `data.ts`; dữ liệu giả lập API đưa về `src/api/mock/data.ts` hoặc `mockData.ts`.

### 3.2. Vấn đề 2 file `DispatchModal.tsx`
Phát hiện 2 file hoàn toàn trùng tên nhưng phục vụ 2 nghiệp vụ độc lập:
1. `src/pages/(pm)/fast-track/DispatchModal.tsx`: Điều phối khẩn cấp đội thi công cơ động ngoài hiện trường của PM.
2. `src/pages/(sup)/proposal-approval/DispatchModal.tsx`: Phân công / chuyển tiếp hồ sơ đợt sửa chữa của Supervisor.
- **Hệ quả:** Gây nhầm lẫn nghiêm trọng khi tìm kiếm file (Ctrl+P), auto-import của IDE, và đọc code.
- **Type trùng lặp duy nhất:** Cả 2 file này cùng export interface **`DispatchModalProps`**, đây là type duy nhất bị trùng tên 2 nơi trong toàn bộ repo!
- **Khuyến nghị:** Đổi tên thành:
  - `src/pages/(pm)/fast-track/FastTrackDispatchModal.tsx` (type: `FastTrackDispatchModalProps`)
  - `src/pages/(sup)/proposal-approval/ProposalDispatchModal.tsx` (type: `ProposalDispatchModalProps`)

---

## 4. TÍNH NHẤT QUÁN NAMING (MODAL/MODALS, TAB/TABS, DATA)

1. **`Modal` vs `Modals`**:
   - Component modal đơn lẻ: 100% tuân thủ số ít `XxxModal.tsx` (ví dụ: `GisMapModal.tsx`, `AuditModal.tsx`, `DecisionModal.tsx`).
   - Container component bọc gom toàn bộ modals của 1 feature: Sử dụng số nhiều `XxxModals.tsx` (10 files: `ReviewModals.tsx`, `AlignmentModals.tsx`, `MissionModals.tsx`, `FastTrackModals.tsx`, `ProposalModals.tsx`, `AuditTrailModals.tsx`, `CloseoutModals.tsx`, `ApprovalModals.tsx`, `RiskModals.tsx`, `SystemControlModals.tsx`).
   - *Ghi chú:* Đây là design pattern hợp lý giúp giảm phân mảnh render trong Container chính, nhưng cần cập nhật làm rõ trong `FOLDER_RULES.md`.
2. **`Tab` vs `Tabs`**:
   - 100% thống nhất dùng số ít: `SidebarSegmentsTab.tsx`, `SidebarSlabsTab.tsx`, `ConflictsTab.tsx`, `MeasurementsTab.tsx`, `AccountsTab.tsx`, `AIModelsTab.tsx`, `DefectCatalogTab.tsx`, `RetentionLegalHoldTab.tsx`.
3. **Types định nghĩa 2 nơi**:
   - Sau đợt dedup types, toàn bộ domain entity đã tập trung 100% tại `src/types/domain.ts`.
   - Chỉ còn **1 cặp duy nhất**: `DispatchModalProps` tại 2 file `DispatchModal.tsx` nêu trên.

---

## 5. FILE > 300 DÒNG, TAILWIND MA & TOKEN DRIFT

### 5.1. File > 300 dòng (Loại trừ `domain.ts` và `src/data/mockData.ts`)
*Lệnh thực thi:* Đo số dòng tự động toàn bộ file trong `src/`:

| Đường dẫn file | Số dòng | Nội dung & Đánh giá |
|---|:---:|---|
| `src/pages/(pm)/alignment/data.ts` | **647** | File gộp data và các hàm toán học GeoJSON ribbon/slabs (không phải component UI). |
| `src/components/common/RoadDefectImages.tsx` | **481** | Component chứa SVG paths vector lớn. Cần tách theo từng loại ảnh. |
| `src/api/services/repairService.ts` | **355** | Service API nghiệp vụ sửa chữa. |

*Kết luận:* Toàn bộ các component UI trong `src/pages/**` hiện tại đều **$\le 300$ dòng**, tuân thủ nghiêm ngặt giới hạn dòng.

### 5.2. Lớp Tailwind "ma" (Phantom classes)
*Lệnh thực thi:* Regex scan toàn bộ `.tsx` đối chiếu với `tailwind.config.js`:
1. **`font-sansation` (91 lần xuất hiện)**:
   - Trong `tailwind.config.js`: Cấu hình font headline là `fontFamily: { headline: ['Sansation', 'Roboto', 'sans-serif'] }`.
   - Lớp Tailwind hợp lệ được sinh ra là `font-headline`. Lớp `font-sansation` **hoàn toàn không tồn tại** trong Tailwind, dẫn đến 91 vị trí bị mất font hoặc fallback về default!
2. **`backdrop-blur-xs` (49 lần xuất hiện)**:
   - Trong Tailwind CSS v3, giá trị nhỏ nhất của backdrop blur là `backdrop-blur-sm`.
   - Trong `tailwind.config.js`, không có mở rộng `backdropBlur: { xs: '2px' }`. Do đó `backdrop-blur-xs` là **lớp ma**, hoàn toàn không sinh CSS hiệu ứng làm mờ nền cho các Modal!

### 5.3. Token Drift (Mã màu HEX cứng)
- Phát hiện **630 trường hợp** sử dụng mã màu HEX tùy biến trực tiếp trong class (như `bg-[#C9A227]`, `text-[#2D3748]`, `text-[#C9A227]`, `border-[#E2E5E9]`, `bg-[#8C6D1F]`) thay vì dùng các class token chuẩn đã khai báo trong `tailwind.config.js` (`bg-brand-gold`, `text-brand-navy`, `border-brand-border`, v.v.).

---

## 6. SOÁT XÉT DOCS/ VÀ SPECS/ 29_9

### 6.1. Bảng mapping 18 màn hình trong `AGENTS.md` Phần C bị sai sự thật
So sánh đối chiếu giữa `AGENTS.md` (Phần C), `docs/stitch-designs/`, và `src/App.tsx`:
- Trong `docs/stitch-designs/` và `App.tsx` có 18 màn hình thực tế:
  1. `01_WF01_Auth_Login_ForcePassword` $\rightarrow$ `/login`, `/force-change-password`
  2. `02_AcceptInvitation_Onboarding` $\rightarrow$ `/accept-invitation`
  3. `03_Projects_Hub_CreateProject` $\rightarrow$ `/pm/projects`, `/sup/projects`
  4. `04_ProjectOverview_Handoff_Timeline` $\rightarrow$ `/pm/projects/:id`
  5. `05_WF02_Alignment_Segments_Slabs` $\rightarrow$ `/pm/projects/:id/alignment`
  6. `06_WF09_DroneMission_AIReview_Canvas` $\rightarrow$ `/pm/surveys/:id`
  7. `07_WF04_Triage_Deduplication_Inbox` $\rightarrow$ `/pm/ai-inbox`
  8. `08_WF05_FastTrackPolicy_FieldDispatch` $\rightarrow$ `/pm/fast-track`
  9. `09_Proposals_WorkPackages_List` $\rightarrow$ `/pm/proposals`
  10. `10_WF07_ProposalApproval_Detail_WorkOrder` $\rightarrow$ `/sup/approvals/:id`
  11. `11_WF08_EvidenceCloseout_BeforeAfter_Publish` $\rightarrow$ `/sup/acceptance/:batchId`
  12. `12_WF10_Executive_Dashboard_Overview` $\rightarrow$ `/sup/dashboard`
  13. `13_WF10_Metrics13KPI_ReportExport_Async` $\rightarrow$ `/sup/risk-analytics`
  14. `14_Notifications_Handoff_SLAAudio` $\rightarrow$ `/pm/notifications`
  15. `15_ConflictCenter_OfflineSync_Resolution` $\rightarrow$ `/pm/field-tasks`
  16. `16_RPT09_ResearchValidation_ConfusionMatrix` $\rightarrow$ `/sup/research-validation`
  17. `17_RPT10_AuditTrail_Immutable_DiffDrawer` $\rightarrow$ `/sup/audit-trail`
  18. `18_WF12_Admin_SystemControl_LegalHold` $\rightarrow$ `/sup/system-control`
- **SAI SỰ THẬT:** Bảng mapping trong `AGENTS.md` hiện tại ghi màn 02 là PMDashboard, màn 03 là SupDashboard, màn 08 & 09 là 2 màn verify A/B... hoàn toàn không khớp với 18 thư mục Stitch thật!

### 6.2. Thiếu sót trong `docs/specs/29_9/`
Thư mục `D:\Do_AN_Drone\29_9\` của nhóm trưởng có 70+ files tài liệu, trong khi `docs/specs/29_9/` mới chỉ copy 6 files. Các tài liệu Frontend then chốt **còn thiếu**:
1. `09_Frontend\contracts\api.types.ts` (27.5 KB): Hợp đồng TypeScript models chuẩn từ backend/nhóm trưởng.
2. `09_Frontend\01_FE_Scope_Implementation_Guide.md` (6.0 KB): Hướng dẫn phạm vi triển khai FE.
3. `09_Frontend\02_Authentication_Flow.md` (10.7 KB): Luồng xác thực chi tiết.
4. `09_Frontend\09_Offline_App_Sync_Spec.md` (26.4 KB): Đặc tả đồng bộ ngoại tuyến & xử lý xung đột.
5. `05_Technical\openapi.yaml` (319 KB): Bản đặc tả OpenAPI 3.1 schema hoàn chỉnh.
6. `03_Data\01_Data_Dictionary.md` (157 KB): Từ điển toàn bộ trường dữ liệu của hệ thống.

---

## 7. BẢNG TỔNG HỢP FINDINGS & PHÂN LOẠI MỨC ĐỘ

| STT | File / Khu vực | Vấn đề phát hiện | Evidence | Mức độ |
|:---:|---|---|---|:---:|
| 1 | `AGENTS.md` (Phần C) | Bảng mapping 18 màn hình lệch hoàn toàn so với 18 thư mục Stitch và routes trong `App.tsx` | Đối chiếu `AGENTS.md:46-65` với `docs/stitch-designs/` và `App.tsx:64-158` | **BLOCKER** |
| 2 | `src/pages/(pm)/fast-track/DispatchModal.tsx`<br>`src/pages/(sup)/proposal-approval/DispatchModal.tsx` | Trùng tên file `DispatchModal.tsx` và trùng interface `DispatchModalProps` giữa 2 vai trò PM và SUP | `DispatchModal.tsx:5` (pm) vs `DispatchModal.tsx:10` (sup) | **MAJOR** |
| 3 | Toàn bộ 91 vị trí trong `src/` | Sử dụng class Tailwind ma `font-sansation` không tồn tại trong `tailwind.config.js` | Grep `font-sansation` ra 91 hits trong 15+ files | **MAJOR** |
| 4 | Toàn bộ 49 vị trí Modal trong `src/` | Sử dụng class Tailwind ma `backdrop-blur-xs` không được cấu hình trong `tailwind.config.js` | Grep `backdrop-blur-xs` ra 49 hits trong 30+ modal files | **MAJOR** |
| 5 | `src/pages/(pm)/ai-review/` (36 files)<br>`src/pages/(pm)/alignment/` (30 files)<br>`src/pages/(pm)/fast-track/` (21 files)<br>`src/pages/(sup)/system-control/` (16 files) | Thư mục quá tải vượt ngưỡng 15 files, chưa phân cấp con theo Rule 3 | Lệnh đếm file: `ai-review` (36), `alignment` (30), `fast-track` (21), `system-control` (16) | **MAJOR** |
| 6 | `docs/specs/29_9/` | Thiếu hợp đồng TypeScript chuẩn `api.types.ts`, `openapi.yaml`, và đặc tả `09_Offline_App_Sync_Spec.md` | Đối chiếu danh mục `D:\Do_AN_Drone\29_9\` với `docs/specs/29_9/` | **MAJOR** |
| 7 | `src/components/common/RoadDefectImages.tsx` | File component quá dài (481 dòng) chứa mã SVG đồ họa lớn, đặt sai tầng common | Đo dòng: 481 dòng; chỉ duy nhất `SafeImage.tsx` sử dụng | **MINOR** |
| 8 | `src/pages/(pm)/alignment/data.ts` | File dữ liệu & thuật toán GeoJSON dài 647 dòng | Đo dòng: 647 dòng | **MINOR** |
| 9 | `src/pages/(pm)/alignment/SegmentsTable.tsx` | File chết hoàn toàn, 0 importer trong toàn bộ dự án (137 dòng) | Grep `SegmentsTable` trên toàn bộ repo: 0 references | **MINOR** |
| 10 | 630 vị trí trong `src/` | Token drift: Dùng mã HEX tùy biến `#C9A227`, `#2D3748` thay vì class token chuẩn `brand-gold`, `brand-navy` | Grep `bg-[#C9A227]`, `text-[#2D3748]` ra 630 hits | **MINOR** |

---

## 8. TOP 5 VIỆC ƯU TIÊN HÀNG ĐẦU (ACTION PLAN)

1. **[BLOCKER] Cập nhật Bảng Mapping 18 Màn hình trong `AGENTS.md` (Phần C):**
   - Đồng bộ chuẩn xác 1-1 với 18 thư mục trong `docs/stitch-designs/` và routes thực tế trong `src/App.tsx`.
2. **[MAJOR] Đổi tên phân biệt 2 file `DispatchModal.tsx` & type `DispatchModalProps`:**
   - Đổi `src/pages/(pm)/fast-track/DispatchModal.tsx` $\rightarrow$ `FastTrackDispatchModal.tsx` (`FastTrackDispatchModalProps`).
   - Đổi `src/pages/(sup)/proposal-approval/DispatchModal.tsx` $\rightarrow$ `ProposalDispatchModal.tsx` (`ProposalDispatchModalProps`).
3. **[MAJOR] Khắc phục 140 vị trí class Tailwind ma bằng cấu hình `tailwind.config.js`:**
   - Thêm alias font: `fontFamily: { ... headline: ['Sansation', 'Roboto', 'sans-serif'], sansation: ['Sansation', 'Roboto', 'sans-serif'] }`.
   - Thêm mở rộng: `backdropBlur: { xs: '2px' }`.
4. **[MAJOR] Phân cấp thư mục cấp 2 cho 4 feature vượt ngưỡng 15 files:**
   - `ai-review` (36 files) $\rightarrow$ `drawer/`, `modals/`, `triage/`, `hooks/`.
   - `alignment` (30 files) $\rightarrow$ `map/`, `sidebar/`, `modals/`, `hooks/`, `helpers/`.
   - `fast-track` (21 files) $\rightarrow$ `modals/`, `dispatch/`, `policy/`, `hooks/`.
   - `system-control` (16 files) $\rightarrow$ `modals/`, `tabs/`, `hooks/`.
5. **[MINOR] Xóa file chết `SegmentsTable.tsx` & Dọn dẹp tệp SVG lớn:**
   - Xóa `src/pages/(pm)/alignment/SegmentsTable.tsx` (137 dòng chết).
   - Tách hoặc di dời `RoadDefectImages.tsx` (481 dòng) sang thư mục assets vector chuyên dụng.
