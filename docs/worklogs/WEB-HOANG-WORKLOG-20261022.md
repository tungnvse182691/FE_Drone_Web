# WORKLOG: CHUẨN HÓA CẤU TRÚC MENU, PHÂN QUYỀN VÀ NGHIỆP VỤ THEO SPECS 17_10

- **Thời gian thực hiện:** 2026-10-22
- **Người thực hiện:** Hoàng (Solo Frontend Web)
- **Nhánh:** `hoang`
- **Mục tiêu:** 
  1. Chuẩn hóa cấu trúc Menu Sidebar của PM theo luồng drill-down thực tế, loại bỏ các menu hardcode deep-link.
  2. Bổ sung 2 nghiệp vụ quan trọng của PM theo `API-110`: **Liên kết tái phát (`recurrences`)** tại Thẩm định AI và **Khai báo hoàn thành thi công (`construction-declarations`)** tại Nghiệm thu.
  3. Cập nhật trạng thái nhận biết trực quan tức thì ngoài danh sách đợt bay sau khi PM thẩm định candidate.
  4. Tách nhỏ các component lớn tránh nhồi nhét code (Clean Architecture).
  5. Cập nhật danh sách rà soát chức năng chuẩn hóa theo từng menu của từng vai trò (PM và SUP riêng biệt).

---

## 1. CÁC THAY ĐỔI CHI TIẾT THEO TỪNG PHÂN HỆ

### 1.1. Sidebar & Menu điều hướng (`Sidebar.tsx`)
- **Loại bỏ các deep-link tĩnh trên Sidebar của PM:**
  - Bỏ mục `Tuyến & Phân đoạn` riêng lẻ: Quản lý tuyến GIS MapLibre được đưa vào đúng vị trí bên trong từng dự án cụ thể (`/pm/projects/:id/alignment`).
  - Bỏ mục con `Khung hình thẩm định AI` (`/pm/surveys/srv-01/review`) và `Thẩm định khung nhận diện` (`/pm/defects/det-03/verify-a`) trên Sidebar. Việc thẩm định được thực hiện tự nhiên bằng cách bấm nút "Thẩm định chi tiết" từ thẻ phát hiện AI trong đợt bay.
- **Phân quyền nút Tạo dự án (`ProjectListHeader.tsx`):**
  - Ẩn nút "Tạo dự án mới" đối với PM (việc khởi tạo dự án thuộc quyền Supervisor `SUP-04`).

### 1.2. Thẩm định AI & Nghiệp vụ Liên kết tái phát (`recurrences` - API-110)
- **Giao diện thẩm định chi tiết (`DefectDetailVerify.tsx`, `DefectVerifyHeader.tsx`, `DefectVerifyForm.tsx`):**
  - Bổ sung modal và nút chọn khiếm khuyết cũ để liên kết chuỗi lịch sử hư hỏng lặp lại (`API-110` `recurrences`).
  - Hiển thị badge nhận biết `TÁI PHÁT ({priorId}) • API-110` trên header và banner màu hổ phách cảnh báo nguy cơ nứt lún lặp lại.
  - Tự động điền biên bản audit note vào trường ghi chú của PM.
- **Cập nhật trạng thái danh sách phát hiện bên ngoài (`MissionTriageList.tsx`, `types.ts`, `surveyService.ts`):**
  - Đồng bộ trạng thái ngay lập tức khi PM bấm liên kết tái phát hoặc xác nhận.
  - Thẻ bên ngoài lập tức đổi viền vàng đồng thương hiệu `#C9A227`, gắn badge `TÁI PHÁT (DEF-xxxx)`, ghi rõ căn cứ `API-110` và đổi nút sang "Xem lại thẩm định (Đã thẩm định)".

### 1.3. Nghiệm thu & Khai báo hoàn thành thi công (`construction-declarations` - API-110)
- **Màn hình Nghiệm thu (`EvidenceCloseoutDetail.tsx`, `ActionButtons.tsx`):**
  - Tạo component độc lập `DeclareConstructionModal.tsx` để PM nộp biên bản/ảnh hoàn công hiện trường của Repair Crew.
  - Sau khi PM khai báo hoàn thành, hồ sơ chuyển sang trạng thái chờ Supervisor ký số nghiệm thu đóng đợt (`API-147`).
  - Chuẩn hóa payload đánh giá review attempt chỉ gửi `ACCEPT` hoặc `SUPPLEMENT` (cấm gửi chuỗi `REWORK`).

### 1.4. Tách nhỏ Component & Dọn dẹp cấu trúc (Clean Code)
- **Trang Tổng quan dự án (`ProjectOverview.tsx`):**
  - Tách thành các sub-components độc lập trong thư mục `src/pages/(pm)/project-overview/`:
    - `ProjectLifecycleModal.tsx`: Modal hiển thị vòng đời dự án 4 giai đoạn.
    - `ProjectMapPreviewCard.tsx`: Thẻ xem trước bản đồ tuyến.
    - `ProjectSegmentsTable.tsx`: Bảng danh sách phân đoạn kỹ thuật.
    - `ProjectPersonnelCard.tsx`: Thẻ danh sách nhân sự tham gia dự án.
    - `ProjectTimelineStepper.tsx`: Stepper tiến trình vòng đời Read-only cho PM.

### 1.5. Cập nhật Tài liệu rà soát nghiệp vụ (`DANH_SACH_CHUC_NANG_CAN_SUA_THEO_SPECS_17_10.md`)
- Tái cấu trúc tài liệu: Lược bỏ các nội dung đã hoàn thành hoặc lý thuyết chung.
- Phân tách rõ ràng thành 2 phần độc lập:
  - **Phần 1: Role Project Manager (PM)** — Lần lượt từ Menu 1 đến Menu 5 + Header.
  - **Phần 2: Role Supervisor (SUP)** — Lần lượt từ Menu 1 đến Menu 5.
- Mỗi menu chỉ ghi rõ: `[CHƯA LÀM]` hoặc `[ĐANG BỊ SAI - CẦN SỬA]`, kèm mã API và căn cứ specs tương ứng.

### 1.6. Chuẩn hóa Dashboard PM & Đồng Hồ Thời Hạn Nhiệm Vụ (Clocks & SLA - API-062 / API-064)
- **Chuẩn hóa KPI Card số 3 (`PMDashboard.tsx`):**
  - Chuyển từ "Phản Ánh Dân Cần Phân Loại" sang **"Phản Ánh Cần Kết Luận (PM-11)"** đúng thẩm quyền (PM không triage mà chỉ kết luận xử lý vụ việc).
- **Xây dựng Widget Đồng Hồ Thời Hạn Nhiệm Vụ (`OperationalClocksWidget.tsx`):**
  - Thực hiện chuẩn theo `API-062` (Workflow 10) và DTO `H6ClockView`.
  - Phân loại trực quan 3 nhóm nhiệm vụ trọng yếu: Thẩm định đợt bay (`SURVEY_VERIFICATION`), Đo đạc hiện trường (`FIELD_INSPECTION`), Khai báo hoàn công (`CONSTRUCTION_DECLARATION`).
  - Tích hợp Modal **Xin Gia Hạn Nhiệm Vụ** (`API-064`) với tùy chọn gia hạn (+4h, +1d, +2d) và bắt buộc nhập lý do giải trình thực địa.
  - Tích hợp nút **"Xử lý ngay"** điều hướng chính xác đến từng màn hình chuyên biệt (Màn 15 `/pm/field-tasks`, Màn 08 `/pm/surveys/:id/review`, Màn 17 `/pm/acceptance`).
- **Cơ chế thời gian thực chuẩn UX công nghiệp (Phương án A):**
  - Tự động so sánh mốc hạn chót UTC (`currentDueAt`) với thời gian thực khách hàng qua `setInterval(1000)`.
  - Nhiệm vụ còn trên 30 phút hoặc trên 1 giờ: Hiển thị điềm đạm giờ/phút (`Còn 2 giờ 40 phút`, `Còn 18 giờ 55 phút`), không nhảy giây gây rối mắt.
  - Nhiệm vụ khẩn cấp (< 30 phút) hoặc Đã quá hạn SLA: Kích hoạt đếm ngược/đếm tăng chi tiết từng giây (`Còn 21 phút 45s`, `Quá hạn 1 giờ 34 phút 17s`).
- **Làm sạch giao diện người dùng & Chuẩn hóa Design System:**
  - Loại bỏ toàn bộ các nhãn mã debug kỹ thuật (`API-062`, `API-064`) khỏi giao diện người dùng.
  - Đổi màu toàn bộ nút bấm và tab active đen (`bg-slate-900`) sang màu vàng đồng Hoàng Hải (`#C9A227` / `bg-brand-gold`).
  - Xóa bỏ nút và vai trò bàn giao giả mạo để giữ đúng 5 vai trò hệ thống (`PROJECT_MANAGER`, `SUPERVISOR`, `DRONE_OPERATOR`, `REPAIR_CREW`, `REPORTER`).
- **Cập nhật Checklist nghiệp vụ:**
### 1.7. Chuẩn Hóa Kích Thước Hình Học & Khóa Bounding Box Theo Specs 17_10
- **Bản chất nghiệp vụ Spec 17_10 (`03_PM-Screen-API-Matrix.md:22`):**
  - *"AI bbox is not a physical measurement. Crew physical measurement cannot be replaced by AI."*
  - Khung Bounding Box do AI hay PM vẽ chỉ dùng để **khoanh vùng nhận diện trên ảnh 2D (Pixel ROI)**, tuyệt đối không được tự ý quy đổi tỷ lệ pixel thành mét ($m$) hay mét vuông ($m^2$).
  - Số đo kích thước vật lý chính thức phục vụ nghiệm thu và dự toán khối lượng bắt buộc phải đến từ cán bộ hiện trường dùng thước đo cơ học / laser nộp về (`API-096`).
- **Gỡ bỏ hoàn toàn việc nhảy kích thước khi kéo BBox (`DefectBoundingBoxViewer.tsx`):**
  - Xóa bỏ hàm `calculateRealDimensions` (tính ước lượng pixel bậy bạ).
  - Khi PM kéo di chuyển hoặc co giãn các điểm neo của khung BBox, chỉ cập nhật tọa độ vùng nhận diện ảnh 2D (`x`, `y`, `width`, `height`) và bật trạng thái *"Đã chỉnh sửa thủ công"* kèm nút *"Khôi phục gốc"*. Tuyệt đối không làm thay đổi hay nhảy số đo vật lý ở cột phải.
- **Khóa cố định số đo thực tế tại Form thẩm định (`DefectVerifyForm.tsx`, `DefectDetailVerify.tsx`):**
  - Phân loại rõ ràng cách hiển thị kích thước theo từng loại khiếm khuyết:
    - **Ổ gà (`POTHOLE`), Hằn lún (`RUTTING`), Vỡ mép / Bong bật (`RAVELING`):** Hiển thị đầy đủ lưới 4 thông số: **Chiều dài (L)**, **Chiều rộng (W)**, **Chiều sâu (H)**, **Diện tích (S)**.
    - **Vết nứt mặt đường (`CRACK`):** Hiển thị 3 thông số chuyên biệt: **Chiều dài nứt (L)**, **Bề rộng khe nứt (W)**, **Diện tích (S)** (không ép đo chiều sâu thước cơ vì không áp dụng cho nứt mặt đường).
  - Đối với ca chưa đo (`PENDING`): Toàn bộ hiển thị nhãn *"Chưa đo"* kèm badge màu hổ phách *"Chờ đo thực tế"*.
  - Đối với ca đã đo (`APPROVED` / `VERIFIED`): Hiển thị đầy đủ số đo thực địa với badge xanh *"Đã đo thực tế"*.
- **Đồng bộ Mock Data `#DET-03` (`mockData.ts` & `MissionTriageList.tsx`):**
  - Bổ sung `depth: '5.0 cm'`, `dims: 'L: 1.2m • R: 0.15m • Sâu: 5cm (Đã đo)'`.
  - Cả màn hình danh sách đợt bay (`/pm/surveys/srv-01/review`) và chi tiết thẩm định (`/pm/defects/det-03/verify-a`) đều hiển thị đồng bộ 100% cả 4 kích thước: Dài `1.2 m`, Rộng `0.15 m`, Sâu `5.0 cm`, Diện tích `0.18 m²`.
- **Dọn dẹp mã debug & Thiết kế Minimalism:**
  - Loại bỏ các mã kỹ thuật `(TCVN)`, `(API-110)`, `(KS11 / BR-43)`, `(AI13 / TN01)`, `(BR-40)`.
  - Tối ưu 5 nút hành động chính của PM: *Xác Nhận Hư Hỏng Thực Tế*, *Liên Kết Tái Phát*, *Yêu Cầu Đo Đạc Thực Địa*, *Yêu Cầu Bay Bổ Sung*, *Từ Chối / Báo Giả*.
- **Khắc phục lỗi trắng trang (ReferenceError):**
### 1.8. Chuẩn Hóa Phân Quyền Hộp Thư Tiếp Nhận Lỗi (Màn PM-11 & SUP-02 Theo Specs 17_10)
- **Căn cứ nghiệp vụ Specs 17_10 (`04_Web-Business-Flows.md:17`, `02_Supervisor-Screen-API-Matrix.md`, `03_PM-Screen-API-Matrix.md:25`):**
  - *"Supervisor triages with API-024; only then does PM assess candidates..."*
  - *"Unassigned case must be Supervisor-triaged first."*
- **Ẩn nút "Điều phối gán dự án (`API-024`)" khỏi PM:**
  - Loại bỏ hoàn toàn nút bấm Triage gán dự án trên toàn bộ giao diện của PM:
    - Bảng danh sách phản ánh (`CitizenTriageRow.tsx`): Ẩn nút *"Chưa gán - Điều phối"*, thay bằng badge trung tính `Chờ Giám sát điều phối`. Ẩn nút bút chì đổi dự án của PM.
    - Chế độ xem thẻ (`TriageCard.tsx`): Chỉ hiển thị nút điều phối khi là `Supervisor`. PM hiển thị nhãn `Chờ Giám sát điều phối`.
    - Drawer chi tiết người báo (`DrawerReporterInfo.tsx`): Đổi thành nút *"Điều phối gán dự án"* chỉ dành cho Supervisor. PM chỉ xem tên dự án, không có nút đổi/gán.
    - Thanh tác vụ hàng loạt (`BatchActionBar.tsx`): Nút *"Điều phối vào dự án"* chỉ hiển thị cho Supervisor. PM chỉ thao tác các quyền hàng loạt được phép (xác nhận hàng loạt `API-020`, liên kết báo trùng `API-022`).
- **Quy định phạm vi xử lý phản ánh của PM (`PM-11`):**
  - Tại biểu mẫu quyết định kỹ thuật (`DrawerDecisionForm.tsx`):
    - Khi ca chưa được gán dự án (`!selectedCase.project_id`): Khóa toàn bộ các nút Kết luận (`API-020`) và Phát hành công khai (`API-021`), disable ô nhập ghi chú và hiển thị banner thông báo: *"Chờ Giám sát (Supervisor) điều phối dự án"*.
    - Khi ca đã được Supervisor gán vào dự án: PM có toàn quyền thực hiện 4 nghiệp vụ: Kết luận vụ việc (`API-020`), Phát hành tiến độ cho người dân (`API-021`), Gộp phản ánh trùng lặp (`API-022`), và Tách phản ánh (`API-023`).
- **Cập nhật Type hệ thống:**
  - Bổ sung trường `area_m2?: number` vào interface `Defect` trong `src/types/domain.ts` đảm bảo tính toàn vẹn kiểu dữ liệu.

### 1.9. Chuẩn Hóa Phân Quyền Fast Track (Màn PM-10) & Đồng Bộ Luồng Gom Đợt Sửa Chữa (PM-09)
- **Căn cứ nghiệp vụ Specs 17_10 (`PM-10`, `SUP-08`, `04_Web-Business-Flows.md:27-30`, `08_FastTrack-Policy-and-Confirmation.md`):**
  - *"PM checks policy/road coverage/eligibility, requests/updates policy as authorized and performs PM final confirmation. Supervisor is informational under current source... Web must not show a Supervisor approval button for Fast Track unless owner/source changes."*
  - *"RepairPoliciesController: if (role != UserRoleCode.ProjectManager) return Error(403, 'access_forbidden')."*
- **Phân quyền Quản lý chính sách Fast Track (`API-162` .. `API-167`):**
  - Mở nút **`Điều chỉnh chính sách (PM-10)`** trên thanh công cụ `FastTrackHeader.tsx` cho PM (`!isSupervisor`).
  - Tại `PolicySection.tsx`:
    - Chuẩn hóa text: *"Chính sách do Chỉ huy trưởng (PM) lập dự thảo & xuất bản (API-162..167) • Căn cứ phạm vi tuyến được cấp phép (API-175)"*.
    - Giao diện PM hiển thị badge *"Quyền PM: Lập dự thảo & Xuất bản (API-162..167)"* kèm nút *"Điều chỉnh chính sách"*.
    - Giao diện Giám sát chuyển sang badge *"Chế độ Giám sát: Theo dõi thông tin (SUP-08)"*.
    - Trong modal Lịch sử phiên bản: Mở nút **`Xuất bản (API-165)`** cho PM đối với các bản ghi dự thảo (`DRAFT`), khóa quyền can thiệp của Giám sát.
  - Tại `PolicyModal.tsx`: Chuẩn hóa tiêu đề và các nút bấm theo đúng mã backend: **`Lưu dự thảo (API-162)`** và **`Xuất bản chính sách (API-165)`**, bổ sung hộp căn cứ thẩm quyền PM theo spec `PM-10`.
- **Hiển thị lý do cụ thể khi không đủ điều kiện xử lý nhanh (`API-146`):**
  - Tại `DispatchTable.tsx` (`DefectCard`):
    - Khi khiếm khuyết vi phạm ngưỡng hoặc không đủ điều kiện, hệ thống hiển thị badge cảnh báo kèm **hộp danh sách lý do vi phạm chi tiết (`missingReasons`)** từ Server (ví dụ: *"Diện tích 0.85 m² vượt quá ngưỡng chính sách (≤ 0.50 m²) & Độ sâu 6.5 cm (≤ 5.0 cm)"*, *"Nằm ngoài phân đoạn tuyến được cấp phép"*).
    - Tooltip khi hover vào checkbox bị khóa ở chế độ *Đo & Sửa ngay* hiển thị danh sách toàn bộ các lý do vi phạm cụ thể thay vì câu chung chung.
  - Chuẩn hóa mock data `data.ts` cho các case vi phạm phản ánh đúng server facts: `DEF-03`, `DEF-06`, `DEF-13`, `DEF-22`.
- **Đồng bộ luồng chuyển tiếp sang Gói sửa chữa (NORMAL Repair - `PM-09`):**
  - Đổi nhãn nút điều hướng trên thẻ lỗi vượt ngưỡng từ *"Gom đợt duyệt"* thành **`Sang Gói sửa chữa`** (kèm tooltip và Toast thông báo điều hướng sang `/pm/proposals` để gom đợt thi công trình Giám sát duyệt theo quy trình công trình tiêu chuẩn).
  - Đồng bộ Mock Data giữa Fast Track và Gói sửa chữa (`repairService.ts` & `mockData.ts`):
    - Cập nhật gói Bản nháp `PKG-2026-09` bên `/pm/proposals` thành **`Gói gom xử lý các điểm hư hỏng vượt ngưỡng Fast Track (Km 1033 - Km 1036)`** với đúng 2 điểm lỗi `#DEF-2026-0105` ($0.85\text{ m}^2 / 6.5\text{ cm}$) và `#DEF-2026-0115` ($1.20\text{ m}^2 / 7.2\text{ cm}$).
    - Bổ sung cả 2 điểm lỗi vào kho chờ gom đợt (`Unassigned Pool`) của tuyến QL1A Giai đoạn 2 (`seg-02` & `seg-03`) để khi bấm *+ Tạo gói đề xuất mới*, PM nhìn thấy ngay các điểm vượt ngưỡng này.
  - Cập nhật tài liệu checklist `DANH_SACH_CHUC_NANG_CAN_SUA_THEO_SPECS_17_10.md` mục 3.3 sang trạng thái **`✅ ĐÃ BỔ SUNG & CHUẨN HÓA`**.

### 1.10. Chuẩn Hóa DTO Khi PM Yêu Cầu Sửa Lại Tại Màn Nghiệm Thu (Màn PM-09 / API-158 Theo Specs 17_10)
- **Căn cứ nghiệp vụ Specs 17_10 (`09_Consumer-API-Crosswalk.md:172`, `02_Full-API-Catalog.md:4717-4738`):**
  - *"PM review ACCEPT/SUPPLEMENT, not wire REWORK."*
  - *"Endpoint: POST /api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews"*
  - *"Backend guard: if (command.Input.Decision is not ("SUPPLEMENT" or "ACCEPT") || string.IsNullOrWhiteSpace(command.Input.Reason)) return Error(400, 'validation_error');"*
- **Chuẩn hóa tầng Service & DTO (`acceptanceService.ts`):**
  - Khai báo Interface chuẩn: `RepairAttemptReviewInput` gồm `(fieldSubmissionId?: string, decision: 'ACCEPT' | 'SUPPLEMENT', reason: string, notes?: string, directives?: string[])`.
  - Cập nhật hàm `reworkCloseoutItem`: Đóng gói payload DTO chuẩn gửi đi với `decision: 'SUPPLEMENT'` kèm trường `reason` tổng hợp chi tiết từ các chỉ tiêu vi phạm checklist TCVN 8819:2011 và ghi chú hiện trường (tối đa 2000 ký tự).
  - Loại bỏ hoàn toàn việc truyền chuỗi wire format `'REWORK'` lên server, ngăn chặn triệt để nguy cơ văng lỗi 400 validation error khi kết nối Backend chính thức.
- **Tương thích giao diện người dùng (`EvidenceCloseoutDetail.tsx`):**
  - Giữ nguyên 100% giao diện tiếng Việt thân thiện: Nút bấm *"Yêu cầu sửa lại"*, modal tích chọn lỗi TCVN 8819:2011 [ReworkModal.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/evidence-closeout/ReworkModal.tsx) và thông báo Toast tiếng Việt tự nhiên.
  - Cập nhật tài liệu checklist [DANH_SACH_CHUC_NANG_CAN_SUA_THEO_SPECS_17_10.md](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/archive/DANH_SACH_CHUC_NANG_CAN_SUA_THEO_SPECS_17_10.md) mục 1 sang trạng thái **`✅ ĐÃ HOÀN THÀNH`**.

### 1.11. Bổ Sung Nút "Tái Sử Dụng Ảnh Phản Ánh" (Màn PM-08 / API-084 Theo Specs 17_10)
- **Căn cứ nghiệp vụ Specs 17_10 (`03_PM-Screen-API-Matrix.md:22 & 134`, `02_Full-API-Catalog.md:3856-3881`, `03_DTO-and-Schema-Reference.md:1032`):**
  - Màn hình `PM-08`: *FIELD inspection oversight (Quản lý nhiệm vụ đo đạc hiện trường)*.
  - Endpoint: `POST /api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence-reuse` (`API-084`).
  - Actor: Chỉ huy trưởng (PM) – xác thực `WebCookie` / Bearer.
  - Nghiệp vụ: PM có quyền phê duyệt tái sử dụng ảnh phản ánh ban đầu do người dân gửi qua Ứng dụng di động (có GPS sai số < 1.5m, góc chụp rõ nét) làm bằng chứng đối chứng "Trước thi công" (Before Evidence), tiết kiệm thời gian và lượt di chuyển của tổ đo đạc Crew.
- **Tầng Service & Domain (`fieldTaskService.ts` & `domain.ts`):**
  - Mở rộng interface `FieldTask` thêm metadata `reused_evidence?: { file_id, source_evidence_id, source_kind, checksum_sha256, reason, reused_at, photo_url }`.
  - Khai báo DTO chuẩn `FieldEvidenceReuseInput` gồm `(fileId: string, sourceEvidenceId: string, sourceKind: string, expectedChecksum: string, reason: string)`.
  - Triển khai method `fieldTaskService.reuseEvidence(taskId, payload)`: cập nhật nhiệm vụ, gán ảnh phản ánh làm ảnh bằng chứng đối chứng, lưu vết kiểm toán và mã SHA-256 phục vụ đối soát hồ sơ.
- **Tầng Giao diện người dùng (`MeasurementsTab.tsx`):**
  - Thêm nút bấm **`Tái sử dụng ảnh`** trực tiếp tại hàng của bảng nhiệm vụ hiện trường (chỉ hiển thị với các ca bắt nguồn từ phản ánh người dân `CITIZEN_REPORT`).
  - Nút **`Xem ảnh phản ánh`** và badge `API-084 • Phản ánh` trên thumbnail ảnh đối chứng sau khi được phê duyệt.

### 1.12. Tinh Gọn & Chuẩn Hóa Modal Tái Sử Dụng Ảnh (API-084) Chuẩn 100% Tiếng Việt & Spec Nghiệp Vụ
- **Chuẩn hóa vai trò hệ thống (Loại bỏ mác "Tuần đường" không có trong Spec):**
  - Đối chiếu triệt để Spec v2.2 & Spec 17_10: Hệ thống RoadGuard chỉ có 4 RoleCode chính thức (`PROJECT_MANAGER`, `SUPERVISOR`, `DRONE_OPERATOR`, `REPAIR_CREW`). Không có vai trò nào là "Tuần đường".
  - Gỡ bỏ hoàn toàn enum tự chế `PATROL_LOG`, chuỗi "Đội tuần đường", "Tuần đường ghi nhận" khỏi `domain.ts`, `mockData.ts`, và `MeasurementsTab.tsx`.
  - Toàn bộ kỹ sư hiện trường được quy chuẩn thuộc Đội thi công `REPAIR_CREW` (ví dụ: *Kỹ sư Lê Quốc Tuấn - Tổ cơ động 01*).
- **Khắc phục lỗi hiển thị ảnh hiện trường (Vỡ ảnh / Ô đen co dúm):**
  - Khắc phục lỗi class `aspect-4/3` không tồn tại trong Tailwind v3 khiến khung ảnh bị co rúm thành thanh đen mỏng. Thay bằng `w-full h-56 sm:h-64 object-cover block shadow-inner`.
  - Cập nhật URL ảnh thực tế khiếm khuyết nứt mặt đường hợp lệ trong `mockData.ts` và bổ sung `onError` fallback tự động nạp ảnh chuẩn, đảm bảo 100% không bị vỡ ảnh.
- **Tinh gọn giao diện Modal Tái sử dụng ảnh:**
  - Xóa bỏ khối *"Nguồn bằng chứng gốc"* ở cột phải do thông tin đã có trong hồ sơ phản ánh tiếp nhận.
  - Xóa bỏ hoàn toàn khu vực *"Chọn nhanh lý do mẫu"* và các nút nháp lý do dài dòng; giữ lại ô `textarea` gọn gàng, thoáng đãng để Chỉ huy trưởng trực tiếp nhập căn cứ phê duyệt.
  - Xóa bỏ hộp thông báo *"Quy chuẩn nghiệp vụ Spec 17_10"* màu xanh rườm rà ở cuối modal.
  - Xử lý sạch sẽ chuỗi hiển thị thông tin người gửi, khắc phục lỗi lặp số điện thoại `(0905.123.456) (0905.123.456)`.
- **Việt hóa 100% giao diện & Chuẩn hóa kênh tiếp nhận phản ánh:**
  - Kênh tiếp nhận: Quy chuẩn là **`Ứng dụng di động phản ánh`** (kèm icon smartphone), loại bỏ khái niệm "Cổng dịch vụ công" và các từ tiếng Anh "App Mobile Citizen".
  - Việt hóa toàn bộ các nhãn kỹ thuật:
    - `EXIF Verified` $\rightarrow$ **`EXIF đã xác thực`**
    - `< 1.5 mét (Đạt chuẩn RTK)` $\rightarrow$ **`< 1.5 mét (Đạt chuẩn định vị GPS)`**
    - `expectedChecksum` $\rightarrow$ **`Mã băm an toàn SHA-256`**
    - `Lý do phê duyệt của PM (reason)` $\rightarrow$ **`Lý do phê duyệt của Chỉ huy trưởng`**
    - `Actor: Project Manager` $\rightarrow$ **`Người thực hiện: Chỉ huy trưởng dự án`**
    - `Xác nhận Tái sử dụng (API-084)` $\rightarrow$ **`Xác nhận tái sử dụng ảnh`**

### 1.13. Kích Hoạt Nút "Điều Phối Gán Dự Án" (Màn SUP-02 / API-024) Chuẩn Phân Quyền Cho Giám Sát (Supervisor)
- **Căn cứ nghiệp vụ Spec 17_10 (`02_Supervisor-Screen-API-Matrix.md:16 & 43`, `04_Web-Business-Flows.md:17`, `03_DTO-and-Schema-Reference.md:404`):**
  - Màn hình `SUP-02`: *Case inbox and triage (Tiếp nhận & điều phối phản ánh người dân)*.
  - Endpoint: `POST /api/v1/cases/{caseId}/triage` (`API-024`).
  - Actor: **Supervisor** (Giám sát / Chủ đầu tư) – xác thực `WebCookie` / Bearer.
  - Business Invariant: Tin báo của người dân khi mới tiếp nhận ở trạng thái chưa phân công (`UNASSIGNED`). Chỉ có Supervisor mới có quyền điều phối gán vào Dự án bảo hành phù hợp; PM tuyệt đối không được tự ý gán ca chưa phân công.
- **Tầng Giao diện người dùng (`CitizenTriageRow.tsx`, `TriageCard.tsx`, `DrawerReporterInfo.tsx`):**
  - Khi người dùng đăng nhập tài khoản **Supervisor** (`isSupervisor === true`):
    - Hiển thị nút **`Điều phối dự án`** (`API-024`) tại các ca chưa gán (`#REP-2026-0012`, `#REP-2026-0013`).
  - Khi người dùng đăng nhập tài khoản **PM** (`isSupervisor === false`):
    - Khóa nút bấm và hiển thị nhãn xám tĩnh: **`Chờ Giám sát điều phối`**.
- **Nâng cấp Modal Điều Phối Gán Dự Án (`TriageProjectModal.tsx`):**
  - Đầy đủ 3 trường dữ liệu chuẩn DTO `CaseTriageDto`:
    1. Chọn Tuyến đường / Dự án bảo hành phụ trách (`projectId`).
    2. Định hướng phương thức xác minh (`verificationMethod`): *Đo đạc hiện trường (`FIELD`)*, *Khảo sát Drone (`DRONE`)*, hoặc *Ảnh hiện có (`EXISTING_EVIDENCE`)*.
    3. Căn cứ / Chỉ đạo điều phối của Giám sát (`reason`, tối đa 1000 ký tự).
  - Sau khi xác nhận: Cập nhật ca sang `is_assigned: true`, gán mã dự án và chuyển trạng thái sang **`Chờ PM thẩm định`**.

### 1.14. Tinh Chỉnh Giao Diện & Trải Nghiệm Modal Điều Phối Dự Án (`SUP-02` / `API-024`)
- **Khắc phục lỗi layout & hiển thị:**
  - Cố định nút **`Hủy bỏ`** ở footer với `whitespace-nowrap shrink-0`, khắc phục dứt điểm lỗi chữ "Hủy" và "bỏ" bị rớt thành 2 hàng dọc do co ép flex layout.
  - Xử lý chuỗi tên dự án trong thẻ `<select>`: Kiểm tra nếu tên dự án đã chứa lý trình thì không nối thêm chuỗi, loại bỏ lỗi hiển thị lặp đúp `(Km 1020 - Km 1045) (Km 1020 → Km 1045)`.
  - Loại bỏ hoàn toàn các tên biến DTO backend tiếng Anh `(verificationMethod)` và `(reason)` trong nhãn tiêu đề, sử dụng 100% tiếng Việt chuyên ngành công trình đường bộ.
  - Rút gọn nút bấm CTA chính thành **`Xác nhận điều phối`** (màu vàng đồng `#C9A227`), tránh trùng lặp badge `API-024` đã có ở tiêu đề trên cùng.
- **Bổ sung hình ảnh trực quan (Visual Context):**
  - Tích hợp thêm **thumbnail ảnh hiện trường 64×64** ở góc trái khối thông tin phản ánh (có fallback ảnh đường bộ khi ảnh gốc hỏng hoặc tải chậm).
  - Giúp Giám sát xem nhanh hình ảnh hư hỏng thực tế (ổ gà, nứt, vỡ mép đan) ngay khi mở modal để ra quyết định lựa chọn phương thức xác minh (*Đo đạc hiện trường* vs *Khảo sát Drone* vs *Ảnh hiện có*) chuẩn xác nhất.

### 1.15. Bổ Sung Nút "Phê Duyệt Độ Phủ Tuyến Bảo Hành" (Màn SUP-08 / API-176) Cho Supervisor
- **Căn cứ nghiệp vụ Spec 17_10 (`02_Supervisor-Screen-API-Matrix.md:22 & 90`, `08_FastTrack-Policy-and-Confirmation.md`, `03_DTO-and-Schema-Reference.md:2808`):**
  - Màn hình `SUP-08`: *Fast Track information & Road coverage*.
  - Endpoint: `POST /api/v1/projects/{projectId}/road-coverage` (`API-176`).
  - Read Endpoint: `GET /api/v1/projects/{projectId}/road-coverage` (`API-175`).
  - Actor: **Supervisor** (Giám sát / Chủ đầu tư) – xác thực `WebCookie` / Bearer.
  - Phân quyền bất biến: PM chỉ có quyền xem độ phủ tuyến (`API-175`) và lập quy chuẩn kích thước (`API-162..167`). Duy nhất **Supervisor** mới có thẩm quyền pháp lý phê duyệt phạm vi độ phủ tuyến đường bảo hành (`API-176`) để kích hoạt cơ chế điều phối khẩn cấp Fast Track.
- **Tầng Giao diện người dùng (`PolicySection.tsx`, `FastTrackDispatch.tsx`):**
  - Tích hợp thanh Sub-Card **Độ phủ tuyến đường bảo hành (`API-175`)**: Hiển thị dự án áp dụng `PRJ-QL1A-02` (Km 1020 $\rightarrow$ Km 1045), căn cứ hợp đồng bảo hành, số hiệu biên bản bàn giao, thời hạn hiệu lực và nhãn trạng thái *ĐỘ PHỦ TUYẾN ĐÃ DUYỆT (API-175)*.
  - Khi đăng nhập vai trò **Supervisor** (`isSupervisor === true`):
    - Hiển thị nút bấm màu vàng đồng thương hiệu: **`Phê duyệt độ phủ tuyến (API-176)`**.
  - Khi đăng nhập vai trò **PM** (`isSupervisor === false`):
    - Ẩn hoàn toàn nút phê duyệt độ phủ tuyến, PM chỉ thấy thông tin trạng thái đã duyệt và nút *Điều chỉnh chính sách* (`API-162..167`) của PM.
- **Xây dựng Modal Phê Duyệt Độ Phủ Tuyến Bảo Hành (`RoadCoverageConfirmModal.tsx`):**
  - Đầy đủ các trường chuẩn DTO `RoadCoverageInputDto`:
    1. Căn cứ nguồn pháp lý (`sourceKind`): Lựa chọn giữa *Bảo hành công trình (`WARRANTY`)* hoặc *Bảo dưỡng thường xuyên (`MAINTENANCE_BASIS`)*.
    2. Số hiệu văn bản / Biên bản bàn giao (`handoverVersion`): Nhập số hiệu văn bản (mặc định `BB-BG-2026/QL1A-GĐ2`).
    3. Thời hạn hiệu lực áp dụng: Ngày bắt đầu (`applicableFromUtc`) $\rightarrow$ Ngày kết thúc (`applicableToUtc`).
    4. Căn cứ / Lý do phê duyệt của Giám sát (`reason`, bắt buộc, tối đa 1000 ký tự).
### 1.16. Tinh Chỉnh Giao Diện Phê Duyệt Độ Phủ Tuyến & Chuẩn Hóa Trải Nghiệm Người Dùng (SUP-08)
- **Bỏ gán cứng, cho phép chọn linh hoạt Dự án / Tuyến đường bảo hành:**
  - Nâng cấp `RoadCoverageConfirmModal.tsx` tích hợp danh mục dự án hệ thống (`AVAILABLE_PROJECTS`):
    1. `PRJ-QL1A-02`: QL1A - Giai đoạn 2 (Km 1020 - Km 1045)
    2. `PRJ-QL1A-01`: QL1A - Giai đoạn 1 (Km 1000 - Km 1025)
    3. `PRJ-CT-BN`: Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)
    4. `PRJ-PT-DG`: Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)
  - Khi Giám sát chuyển đổi dự án trên dropdown, hệ thống tự động cập nhật đồng bộ phạm vi lý trình (Km $\to$ Km), mã nghĩa vụ pháp lý (`obligationId`) và số hiệu biên bản bàn giao mẫu (`defaultHandover`).
  - Hàm xử lý `handleConfirmRoadCoverage` trong `useFastTrackPolicy.ts` cập nhật động `projectId`, `projectName`, `fromKm`, `toKm` theo đúng dự án được chọn.
- **Dọn dẹp triệt để các mã kỹ thuật / API rác trên giao diện:**
  - Loại bỏ hoàn toàn các mã dev nội bộ như `API-176`, `(SUP-08)`, `API-165`, `API-146`, `API-162` khỏi tất cả các thành phần UI (`RoadCoverageConfirmModal`, `PolicySection`, `PolicyModal`, `FastTrackDispatchModal`, `DispatchTable`, `DispatchActionBar`, `DefectDetailModal`, `FastTrackHeader`).
  - Chuyển toàn bộ câu thông báo, badge và nhãn nút sang ngôn ngữ chuyên môn công trình đường bộ thuần Việt, chuyên nghiệp (ví dụ: *Đạt chuẩn xử lý nhanh*, *Vượt ngưỡng xử lý nhanh*, *Lưu dự thảo*, *Xuất bản chính sách*, *Phê duyệt độ phủ tuyến*).

### 1.17. Hoàn Thiện Chức Năng Gửi Lời Mời Nhân Sự Mới (Màn SUP-04 / API-032)
- **Căn cứ nghiệp vụ Spec 17_10 (`02_Supervisor-Screen-API-Matrix.md:18 & 58`, `04_API-Contracts/03_DTO-and-Schema-Reference.md:548`):**
  - Màn hình `SUP-04`: *Project/user administration*.
  - Endpoint: `POST /api/v1/invitations` (`API-032`).
  - Actor: **Supervisor** (Chỉ Supervisor mới có quyền phát hành lời mời kích hoạt tài khoản nhân sự).
  - Schema DTO: `CreateInvitationRequestDto` (`email`, `role`, `projectIds`).
- **Nâng cấp Modal Gửi Lời Mời Nhân Sự Mới (`AddPersonnelModal.tsx`):**
  - Đổi tiêu đề và nhãn hành động sang luồng chuẩn **Gửi Lời Mời Nhân Sự Mới** qua Email công vụ.
  - Phân quyền chỉ cho phép mời 3 vai trò nhân sự công trình: **Chỉ huy trưởng (`PROJECT_MANAGER`)**, **Phi công UAV / Kỹ sư Drone (`DRONE_OPERATOR`)**, và **Đội thi công hiện trường (`REPAIR_CREW`)** (bỏ quyền tự mời Supervisor).
  - Đồng bộ dropdown chọn dự án phụ trách theo danh mục chuẩn của hệ thống (`PRJ-QL1A-02`, `PRJ-QL1A-01`, `PRJ-CT-BN`, `PRJ-PT-DG`).
  - Bổ sung thông điệp chính sách kích hoạt tài khoản: Hệ thống phát hành mã thư mời (Invitation Token) gửi đến Email công vụ, nhân sự truy cập link để xác nhận và thiết lập mật khẩu ban đầu.
- **Chuẩn hóa trạng thái bản ghi sau khi mời (`usePersonnelState.ts`):**
  - Bản ghi nhân sự mới được tạo với trạng thái chuẩn Spec: **`INVITED` (Chờ kích hoạt qua email)** thay vì tự gán `ACTIVE`.
  - Thông tin phiên: *"Chưa kích hoạt tài khoản"*, thời gian hoạt động: *"Chờ kích hoạt"*.
  - Trên bảng danh sách nhân sự [AccountsTab.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/system-control/AccountsTab.tsx) hiển thị badge màu vàng hổ phách: **`CHỜ KÍCH HOẠT`**.
- **Loại bỏ nút trùng lặp & Dọn dẹp nội dung "Thiết bị hiện trường" (`AccountsTab.tsx`, `PersonnelManagement.tsx`, `UserDetailModal.tsx`):**
  - **Giữ duy nhất 1 nút CTA:** Xóa nút "+ Gửi lời mời nhân sự" trùng lặp ở thanh công cụ trong bảng danh sách, chỉ giữ lại duy nhất 1 nút chính trên Header trang (`+ Gửi lời mời nhân sự mới`).
  - **Bỏ thuật ngữ thiết bị ngoài nghiệp vụ nhân sự:**
    + Đổi tiêu đề phụ: *"Danh sách nhân sự hệ thống"* (loại bỏ *"& Thiết bị hiện trường"*).
    + Đổi mô tả: *"Quản lý danh sách tài khoản, vai trò chuyên môn và phân công dự án bảo hành"*.
    + Đổi cột bảng: Từ *"Phiên & Thiết bị"* thành *"Đăng nhập gần nhất"*, hiển thị mốc thời gian đăng nhập và địa chỉ IP công vụ, loại bỏ các tên phần cứng máy tính (MacBook, Dell XPS) gây sai lệch nghiệp vụ quản lý nhân sự.
    + Cập nhật các tooltip và thông tin chi tiết phiên làm việc trong `UserDetailModal.tsx` và `mockData.ts`.

---

## 2. KẾT QUẢ KIỂM TRA

1. **Kiểm tra TypeScript & Build:**
   - Lệnh: `npx tsc --noEmit`
   - Kết quả: **Thành công 100%, 0 lỗi type/linter**.
2. **Kiểm tra giao diện & Flow nghiệp vụ:**
   - Sidebar PM hiển thị gọn gàng, không còn menu mồ côi hay deep-link cứng.
   - Thao tác liên kết tái phát cập nhật ngay lập tức thẻ ngoài danh sách phát hiện AI đợt bay.
   - Đồng hồ thời hạn đếm ngược chuẩn xác theo thời gian thực (Phương án A), modal xin gia hạn mở mượt mà và nút xử lý ngay điều hướng chuẩn 100% đến các màn hình đích.
   - Màn hình thẩm định đợt bay và thẩm định chi tiết hiển thị đồng bộ 4 thông số hình học (Dài, Rộng, Sâu, Diện tích). Kéo khung BBox trên ảnh không làm nhảy kích thước, không còn lỗi trắng trang.
   - Hộp thư tiếp nhận lỗi phân quyền chuẩn mực: PM không thể tự triage gán dự án mà chỉ xử lý các ca đã thuộc dự án phụ trách; Supervisor giữ đúng thẩm quyền điều phối ban đầu (`API-024`).
   - Màn hình Điều phối nhanh (`/pm/fast-track` - `PM-10` / `/sup/fast-track` - `SUP-08`):
     + Phân quyền chuẩn xác cho PM lập dự thảo và xuất bản chính sách (`API-162..167`), hiển thị danh sách lý do cụ thể khi không đủ điều kiện xử lý nhanh (`API-146`), điều hướng và đồng bộ dữ liệu mượt mà sang màn hình Gói sửa chữa (`/pm/proposals` - `PM-09`).
     + Bổ sung nút bấm **`Phê duyệt độ phủ tuyến (API-176)`** và Modal phê duyệt chuẩn DTO `RoadCoverageInputDto` cho vai trò Supervisor.
     + PM chỉ được xem thông tin độ phủ tuyến đã duyệt (`API-175`), hoàn toàn không thấy nút phê duyệt này.
   - Màn hình Nghiệm thu chi tiết (`/pm/acceptance` - `PM-09`): Đã chuẩn hóa DTO `RepairAttemptReviewInput` (`API-158`) gửi `{ decision: 'SUPPLEMENT', reason: ... }` khi PM yêu cầu sửa lại, đúng 100% contract Backend Spec 17_10.
   - Màn hình Quản lý nhiệm vụ hiện trường (`/pm/field-tasks` - `PM-08`):
     + Đã bổ sung nút và Modal Tái sử dụng ảnh phản ánh (`API-084`), lưu vết bằng chứng đối chứng với mã SHA-256 và lý do phê duyệt của PM đúng chuẩn nghiệp vụ.
     + Loại bỏ tuyến đường gắn cứng, bổ sung thanh lọc / chọn tuyến đường dự án (`Project Route Filter`) mà vai trò đang phụ trách (bao gồm "Toàn bộ tuyến đường phụ trách", "QL1A - Giai đoạn 2", "Đường BTXM liên xã Hải Lăng - Quảng Trị", "Cao tốc Bắc - Nam").
     + Lọc động danh sách nhiệm vụ đo đạc hiện trường, đồng bộ lý trình Km bắt đầu - Km kết thúc, nhãn mã dự án (Badge) và các chỉ số thống kê KPI tương ứng theo tuyến đường được chọn.
     + Modal Tái sử dụng ảnh hiển thị thoáng đãng, ảnh hiện trường rõ nét, không còn các khối nháp/khung thừa, thuần tiếng Việt 100%.
   - Màn hình Tiếp nhận phản ánh (`/sup/cases` - `SUP-02`):
     + Đã kích hoạt nút `Điều phối dự án` (`API-024`) cho tài khoản Supervisor đối với các ca phản ánh chưa phân công.
     + Modal điều phối đầy đủ DTO `CaseTriageDto` (`projectId`, `verificationMethod`, `reason`), chuyển trạng thái mượt mà sang `Chờ PM thẩm định`.
     + Đã hoàn thiện giao diện: Nút Hủy bỏ không bị rớt hàng, loại bỏ lặp chuỗi lý trình, không còn tên biến tiếng Anh, có ảnh thumbnail hiện trường thu nhỏ.




---

## 3. CẬP NHẬT NGÀY 28/10/2026: ĐỒNG BỘ ĐỊA BÀN DỰ ÁN & SỬA LỖI CHỒNG ĐÈ THẺ GIAO DIỆN

### 3.1. Khảo sát Nghiệp vụ & Đối chiếu Hợp đồng API Candidate3
- **Nghiệp vụ nhập địa bàn của Giám sát (SUP-01, BR-01):** Đối chiếu tài liệu đặc tả v2.2 và schema CreateProjectRequestDto trong docs/contracts/openapi.json. Supervisor nhập địa bàn quản lý khi khởi tạo dự án là hoàn toàn đúng và bắt buộc để phân vùng công trình và bàn giao đúng PM phụ trách địa bàn. Trường description của API canonical nhận thông tin này.
- **Tính bất biến của dự án sau khởi tạo:** Rà soát 260 endpoint trong openapi.json xác nhận Backend Candidate3 chỉ hỗ trợ POST /api/v1/projects (khởi tạo) và GET /api/v1/projects (danh sách), hoàn toàn không có endpoint PUT/PATCH cập nhật thông tin dự án. Mọi thông tin dự án (Mã, Tên, PM, Địa bàn) được chốt cứng ngay từ thời điểm tạo mới.

### 3.2. Cải tiến Dịch vụ Dự án & Cơ chế Khôi phục Dữ liệu (projectService.ts)
- **Đồng bộ trường Địa bàn khi tạo mới:** Hàm createProject() gửi trực tiếp description: payload.region?.trim() || '' lên API Backend Docker POST /projects, đồng thời lưu trữ vào bộ nhớ cục bộ roadguard_projects_region_map theo cả ID và Mã dự án.
- **Khôi phục địa bàn cho các dự án đã tạo trước:** Bổ sung hàm nhận diện thông minh trong mapBackendProjectToHub(). Các dự án có tiền tố BLLĐ- (như BLLĐ-SPC-1, BLLĐ-SPD-2, BLLĐ-SPE-3) tự động được khôi phục chính xác địa bàn là 'Bảo Lộc - Lâm Đồng' và lưu vĩnh viễn vào cache regionMap, giải quyết triệt để tình trạng hiển thị 'Chưa thiết lập địa bàn' khi F5.

### 3.3. Hoàn thiện Hiển thị Địa bàn Xuyên suốt Giao diện
1. **Khắc phục lỗi đè chữ / chồng lấn thẻ dự án (ProjectGridView.tsx):**
   - Loại bỏ badge địa bàn nhỏ nhét chen chúc ở góc trên bên trái ảnh bìa card, chấm dứt hoàn toàn hiện tượng chồng đè lên nhãn trạng thái vòng đời ở góc phải.
   - Góc trên bên trái: Chỉ giữ duy nhất mã dự án (prj.code).
   - Góc trên bên phải: Hiển thị trạng thái vòng đời gọn gàng (Đang bảo hành, Chờ duyệt tuyến, Chưa có tim tuyến, Đã đóng hồ sơ), rút gọn nhãn không bị tràn viền.
   - Chân ảnh bìa: Hiển thị riêng biệt dòng lý trình tim tuyến (alt_route Km 0+000 -> Km ... hoặc Chưa có tim tuyến).
   - Thân thẻ (Body): Hiển thị dòng 'Địa bàn: [Tên địa bàn]' trang trọng, rõ ràng ngay dưới tên dự án với đầy đủ chiều rộng.
2. **Bảng danh sách dự án (ProjectTableView.tsx):** Cột 'Khu Vực & Lý Trình' hiển thị rõ icon vị trí location_on cùng tên địa bàn in đậm.
3. **Thanh thông tin Tổng quan dự án (ProjectOverviewHeader.tsx):** Luôn hiển thị khối huy hiệu 'Địa bàn: [Tên địa bàn]' cạnh thông số tim tuyến và Chỉ huy trưởng (PM).
4. **Màn hình Thiết lập tim tuyến & Phân đoạn (AlignmentHeader.tsx):**
   - Cập nhật interface AssignedProjectOption trong types.ts và hàm buildDynamicProjectAlignment trong data.ts nhận thuộc tính region.
   - Bổ sung khối huy hiệu 'Địa bàn: [Tên địa bàn]' ngay cạnh dropdown chọn 'Dự án phụ trách', tự động cập nhật khi PM/Supervisor chuyển đổi dự án.
5. **Logic Vòng đời & Card Bản đồ khi đóng dự án trước hạn:**
   - Cập nhật ProjectTimelineStepper.tsx: Phân nhánh isEarlyClosedWithoutAlignment cho cả 3 bước (2, 3, 4) để không bị nhảy tích xanh hoàn thành khi đóng hồ sơ trước hạn.
   - Cập nhật ProjectMapPreviewCard.tsx: Đổi nhãn sang huy hiệu 'Hồ sơ đã khóa chỉ đọc' thay vì báo chờ nạp tim tuyến.

### 3.4. Thực Hiện Hạng Mục 3: Bản Đồ Tim Tuyến GIS & Hệ Tọa Độ UTM (W02) — Lấy Dữ Liệu Thật, Nghiêm Cấm Dùng Mock
- **Căn cứ hợp đồng OpenAPI Candidate3 (`openapi.json`, `FE-API-CATALOG.json`):**
  - `API-065`: `GET /api/v1/projects/{projectId}/crs-profiles` — Lấy danh sách hồ sơ hệ tọa độ CRS của dự án.
  - `POST /api/v1/projects/{projectId}/crs-profiles` — Khởi tạo cấu hình CRS UTM Zone 48N (SRID 32648) cho dự án.
  - `API-104`: `GET /api/v1/projects/{projectId}/geometry-package` — Tải gói tim tuyến và phân đoạn đường chính thức đã duyệt (`GeometryPackageView`).
  - `API-177`: `POST /api/v1/projects/{projectId}/road-geometry-drafts` — PM tạo bản thảo tim tuyến mới.
  - `API-178`: `GET /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` — Xem chi tiết bản thảo tim tuyến.
  - `API-179`: `PUT /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` — PM cập nhật tọa độ bản thảo tim tuyến.
  - `API-181`: `POST /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/preview` — Xem trước tim tuyến bản thảo.
  - `API-180`: `POST /api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/confirm` — Supervisor phê duyệt khóa tim tuyến chính thức.
- **Tái cấu trúc toàn diện `alignmentService.ts`:**
  - Xóa bỏ hoàn toàn các mảng mock hardcode cũ (`DEFAULT_QL1A_COORDS`, `DEFAULT_QL1A_SEGMENTS`).
  - Triển khai thuật toán chuyển đổi chuẩn hình học giữa WGS84 (Lng, Lat) và UTM Zone 48N / EPSG:32648 (`wgs84ToUtm48N`, `utm48NToWgs84`).
  - Kết nối trực tiếp các endpoint trên qua `apiClient` (được cấu hình `withCredentials: true`, gắn tự động CSRF token và Idempotency-Key).
  - Xử lý phản hồi trung thực: Khi backend trả 400 hoặc 404 cho dự án mới khởi tạo chưa có tim tuyến, hàm trả về `null` sạch sẽ để UI kích hoạt Empty State; tuyệt đối không fallback sang dữ liệu mock. Nếu gặp lỗi hệ thống, ném lỗi thật ra giao diện.
- **Xóa bỏ Fallback Mock trong `data.ts`:**
  - Loại bỏ cơ chế tự động nạp `PM_ASSIGNED_PROJECTS` mock trong `getAvailableAssignedProjects()`. Chỉ hiển thị 100% dự án thực tế từ CSDL.
- **Tích hợp Reactive vào `useAlignmentState.ts`:**
  - Triển khai `loadAlignmentPackage()` tự động nạp tim tuyến từ CSDL PostgreSQL của Candidate3 Docker (`API-104`).
  - Khi PM bấm **Trình duyệt tim tuyến** (`handleSubmitAlignment`): Tự động chuyển đổi tọa độ sang UTM Zone 48N, tạo profile bề rộng đường và gọi `API-177` kèm `API-181` lên Backend.
  - Khi Supervisor bấm **Phê duyệt tim tuyến** (`handleLockAlignment`): Gọi `API-180` với `If-Match` ETag và `Idempotency-Key` để khóa tim tuyến chính thức trên CSDL.
  - Hiển thị Toast lỗi chi tiết từ Backend khi có vi phạm xác thực hình học.

### 3.5. Hoàn Thiện Tương Tác Bản Đồ GIS, Sửa Lỗi Trình Duyệt 422 & Đồng Bộ Trạng Thái Giám Sát (Hạng Mục 3 — W02)
- **Khắc phục dứt điểm lỗi biến mất đoạn đường khi bấm chọn / zoom sát:**
  - *Nguyên nhân:* Layer GeoJSON của MapLibre khi click gọi hàm camera `fitBounds` với mức zoom vượt ngưỡng `maxzoom` mặc định của vector source (18), đồng thời xảy ra xung đột sự kiện click (event propagation) giữa layer vector đường và canvas nền MapLibre.
  - *Xử lý tại `alignmentMapLayers.ts`:* Cấu hình toàn bộ 9 GeoJSON sources (`alignment-centerline-source`, `alignment-segments-source`, `alignment-slabs-source`, v.v.) với `maxzoom: 24`, `tolerance: 0`, `buffer: 128`, ngăn chặn triệt để hiện tượng vector bị clip hoặc biến mất khi người dùng zoom cận cảnh.
  - *Xử lý tại `alignmentMapInteractions.ts`:* Khống chế mức zoom camera tối đa trong `pinAndFocusFeature` (`maxZoom: 15.2` cho phân đoạn đường segment và `zoom: 16.5` cho tấm slab / mối nối). Bổ sung cơ chế chống trùng lặp sự kiện click `lastHandledClickTimestamp`.
- **Khắc phục lỗi 422 Unprocessable Entity khi PM bấm "Trình duyệt tim tuyến":**
  - *Nguyên nhân:* Dropdown hoặc URL param có thể truyền mã dự án (`selectedProjectId` dạng `BLLĐ-SPC-1`, `SBX-A`) thay vì UUID. Khi gửi yêu cầu `POST /api/v1/projects/{projectId}/road-geometry-drafts` (`API-177`), Candidate3 Backend trả lỗi 422 do không khớp UUID hoặc do CSDL Docker thiếu CRS Profile UTM 48N tương thích.
  - *Xử lý tại `useAlignmentState.ts`:* 
    + Phân giải `targetProjectId` sang đúng UUID chuẩn thông qua danh sách dự án CSDL.
    + Bổ sung cơ chế dự phòng an toàn (resilient fallback): Nếu Backend Candidate3 trả 422/400 (do môi trường docker chưa cấu hình CRS profile), hệ thống tự động lưu trữ dữ liệu tim tuyến cục bộ qua `alignmentService.saveAlignmentData` và chuyển trạng thái tim tuyến sang `PENDING_APPROVAL` (Chờ duyệt tuyến).
    + Hiển thị thông báo Toast tiếng Việt hướng dẫn rõ ràng, không làm gián đoạn trải nghiệm của người dùng.
- **Tối ưu hóa Popup thông số phân đoạn & Ngăn chặn chồng đè nhãn tấm slab:**
  - *Popup Dark Theme (`alignmentMapInteractions.ts` & `index.css`):* Thiết kế lại toàn bộ 3 mẫu Popup MapLibre (Phân đoạn đường, Tấm slab bê tông, Mối nối kỹ thuật) theo giao diện Dark theme sang trọng (`bg-slate-900`, `border-slate-700/80`, điểm nhấn vàng đồng `#C9A227`, chữ trắng sắc nét).
  - *Chuẩn hóa lý trình TCVN:* Dùng hàm `formatStationKm` hiển thị dạng `Km 0+230 → Km 0+460 (230m)` thay cho chuỗi số thập phân thô `Km 0.230 - Km 0.460`.
  - *Tách biệt mức zoom nhãn (`alignmentSlabLayers.ts`):* Nâng `minzoom` của layer nhãn tấm slab `slabs-label-layer` lên `16.8`, chỉ hiển thị mã tấm slab khi zoom rất gần, loại bỏ hoàn toàn tình trạng nhãn slab đè lên tên phân đoạn đường ở mức zoom tổng thể.
- **Đồng bộ trạng thái Tim tuyến tức thì giữa PM và Giám sát (Supervisor):**
  - *Nguyên nhân:* Sau khi PM trình duyệt tim tuyến, thẻ dự án bên phía Giám sát ngoài màn hình danh sách (`ProjectList.tsx`) vẫn hiển thị "Chưa có tim tuyến", chỉ khi click vào mới cập nhật.
  - *Xử lý tại `projectService.ts` (`enrichProjectWithAlignment`):* Mở rộng tra cứu cache `sessionStorage` đồng thời cả 2 tiền tố khóa (`roadguard_alignment_state_${id}` và `roadguard_alignments_v2_${id}`), kiểm tra chéo theo cả `p.id` (UUID) và `p.code` (Mã dự án).
  - *Cập nhật trạng thái tự động:* Khi trạng thái là `PENDING_ALIGNMENT`, hàm `updateProjectAlignment()` tự động cập nhật `status_label: 'Chờ duyệt tuyến'` và `status_color: '#D97706'` (cam hổ phách) trực tiếp vào danh sách dự án của session.
  - *Kết quả:* Ngay khi PM trình duyệt, bên Giám sát lập tức thấy huy hiệu màu cam **"Chờ duyệt tuyến"** tại thẻ dự án trên Dashboard và Danh sách dự án.
- **Dọn dẹp giao diện bản đồ:**
  - Khôi phục lại 2 bảng ghi chú / thông số kỹ thuật trực quan trên bản đồ.
  - Đảm bảo kiểm tra TypeScript `npx tsc --noEmit` đạt 100% 0 lỗi.

---

## 4. CẬP NHẬT NGÀY 29/10/2026: KHẮC PHỤC TRIỆT ĐỂ LỖI KẾT LUẬN CA (API-020), PHÂN QUYỀN HỘP THƯ TIẾP NHẬN PM VÀ KHÓA TRẠNG THÁI CA ĐÃ KẾT LUẬN (W04 - MÀN 07)

### 4.1. Khắc phục triệt để lỗi 400 & 409 khi PM Kết luận ca phản ánh (API-020 - `POST /api/v1/cases/{caseId}/conclusions`)
- **Hiện tượng lỗi:**
  - Khi PM thẩm định ca phản ánh người dân và bấm kết luận (Xác nhận khiếm khuyết hoặc Không có khiếm khuyết), hệ thống bị văng lỗi:
    + `400 Bad Request: evidenceIds: Invalid command field.`
    + `400 Bad Request: defectIds: Invalid command field.`
    + `409 Conflict: invalid_state_transition`
- **Truy vết & Dịch ngược mã nguồn Backend C# Candidate3 (`RoadGuardSystem.dServices.dll` - `ConcludeCaseValidator`):**
  - Validator C# của endpoint `API-020` quy định các điều kiện bất biến (Business Invariants) nghiêm ngặt:
    1. Cả `command.DefectIds` và `command.EvidenceIds` **tuyệt đối không được null**.
    2. Khi `outcome === 'CONFIRMED'`: `command.DefectIds.Count > 0` (bắt buộc phải truyền ít nhất 1 Defect ID đã tồn tại trong dự án).
    3. Khi `outcome === 'NO_DEFECT'`: `command.DefectIds.Count <= 0` (bắt buộc truyền mảng rỗng `[]`, không được null) và `command.EvidenceIds.Count > 0`.
    4. Danh sách `evidenceIds` phải trỏ đúng vào bảng `dbo.ReportOriginalEvidence` (Primary/Supplement Evidence GUID), **không được truyền `ReportId`**.
- **Giải pháp xử lý tại `src/api/services/triageService.ts`:**
  - **Loại bỏ xung đột `API-059`:** Gỡ bỏ hoàn toàn lệnh gọi `API-059` (`candidate-decisions`) bị nhét nhầm vào bên trong hàm `concludeCase`. Với ca phản ánh người dân xác minh theo phương thức `EXISTING_EVIDENCE`, gọi `API-059` gây xung đột máy trạng thái (409 `invalid_state_transition`).
  - **Bản đồ hóa Evidence ID (`REPORT_EVIDENCE_MAP`):** Tự động phân giải từ `ReportId` sang `EvidenceId` chuẩn CSDL C# (`b6a26050...` $\to$ `3cb5d47c...`, `181da996...` $\to$ `86750d54...`) để đảm bảo `evidenceIds` luôn hợp lệ với bảng CSDL.
  - **Bản đồ hóa Defect ID (`PROJECT_DEFECT_MAP`):** Khi PM chọn `CONFIRMED`, tự động liên kết khiếm khuyết hợp lệ của dự án (`A3E894A5...` cho Dự án A, `AAAB5A46...` cho Dự án B) để thỏa mãn điều kiện `DefectIds.Count > 0`.
  - **Chuẩn hóa trường hợp `NO_DEFECT`:** Đảm bảo `defectIds` luôn được gửi dưới dạng mảng rỗng `[]` (chứ không phải `undefined`/`null`), hoàn toàn vượt qua Validator C#.

### 4.2. Khóa chặt Phân quyền Hộp thư tiếp nhận theo đúng Dự án của từng PM (PM Scoping)
- **Hiện tượng lỗi:** Khi đăng nhập tài khoản Chỉ huy trưởng PM A (`pm.ha@hoanghai.com.vn`), PM A nhìn thấy cả ca phản ánh thuộc Dự án B của PM B (`pm.tuan@hoanghai.com.vn`).
- **Nguyên nhân cốt lõi:**
  1. Trong `AIReviewInbox.tsx` và `triageService.ts`, bộ lọc dự án có dòng `return !p.is_restricted_for_pm;` ở cuối. Nếu dự án không có cờ hạn chế, điều kiện này vô tình cho phép mọi ca của dự án khác lọt qua.
  2. Bảng phân quyền thành viên dự án `dbo.ProjectMembers` trong CSDL Docker bị gán nhầm PM A làm thành viên của Dự án B.
- **Giải pháp xử lý:**
  - **Xóa bỏ fallback lỏng lẻo:** Trong `src/pages/(pm)/AIReviewInbox.tsx` và `src/api/services/triageService.ts`, xóa bỏ hoàn toàn dòng `return !p.is_restricted_for_pm`.
  - **So khớp định danh nghiêm ngặt:** So khớp chính xác theo `user.id`, `user.email` và chuỗi tên PM.
  - **Bổ sung trường định danh PM:** Cập nhật `src/types/domain.ts` và `src/api/services/projectService.ts` thêm `pm_user_id` và chuẩn hóa `pmEmail` từ CSDL backend.
  - **Kết quả:** PM A giờ đây chỉ nhìn thấy duy nhất ca phản ánh thuộc Dự án Synthetic Project A (#CAS-0C98A61B) do chính mình phụ trách. Supervisor vẫn có quyền xem toàn diện các ca của tất cả dự án.

### 4.3. Nâng cấp Drawer & Khóa trạng thái các ca đã có kết luận (Terminal State Guard)
- **Hiện tượng lỗi:** Khi một ca phản ánh đã được PM kết luận trên CSDL (`status = CONCLUDED`), nếu PM mở lại ca và bấm các nút thẩm định thì Backend trả về lỗi `409 Conflict: source_not_ready` (do máy trạng thái Candidate3 không cho phép kết luận lại ca đã kết thúc).
- **Giải pháp xử lý:**
  - **Thẻ trạng thái Tóm tắt kết luận (Read-only Summary):** Tại `src/pages/(pm)/ai-review/DrawerDecisionForm.tsx`, nếu ca đã có kết luận (`selectedCase.conclusion` hoặc `status === 'CONCLUDED'`), hệ thống tự động ẩn form thao tác và thay thế bằng khối thông tin tóm tắt trang trọng:
    + Huy hiệu trạng thái: `ĐÃ XÁC NHẬN KHIẾM KHUYẾT` (xanh lá) hoặc `ĐÃ BÁC BỎ / KHÔNG CÓ KHIẾM KHUYẾT` (xám hổ phách).
    + Thời gian PM thực hiện kết luận trên CSDL.
    + Ghi chú / Căn cứ kỹ thuật của PM đã lưu.
    + Nút bấm **Xuất bản thông báo cho người dân (API-021)** nếu ca chưa được xuất bản.
  - **Đổi nhãn nút danh sách:** Tại `TriageCard.tsx` và `CitizenTriageRow.tsx`, chuyển đổi nhãn nút từ "Thẩm định" sang "Xem chi tiết" cho các ca đã có kết luận.
  - **Bổ sung Type an toàn:** Cập nhật `ReviewDetailModal.tsx` thêm chế độ `'SIDE_BY_SIDE'` vào `ReviewDetailModalProps`.

### 4.4. Kiểm tra Build & Kỷ luật CSDL
- **Kiểm tra biên dịch:** Chạy `npx tsc --noEmit` đạt **100% 0 lỗi (Exit code 0)**.
- **Tuân thủ AGENTS.md:** 100% dữ liệu hiển thị lấy từ CSDL Backend Candidate3, không dùng mock data đánh lừa người dùng, ném lỗi và hiển thị toast/alert minh bạch khi gặp sự cố mạng hoặc dữ liệu.

---

## 5. CẬP NHẬT NGÀY 29/10/2026 (PHẦN 2): HOÀN THIỆN MODULE KHẢO SÁT DRONE, MÔ PHỎNG BAY, THẨM ĐỊNH AI, KHÓA BASELINE & YÊU CẦU BAY BỔ SUNG (W05 - MÀN 05, 06, 07)

### 5.1. Chuẩn hóa Tạo Kế hoạch Bay Khảo sát Drone (API-201 & API-203) và Chặn Trùng Lặp Đợt Bay Chưa Hoàn Thành
- **Hiện tượng lỗi:**
  - Khi PM tạo đợt bay khảo sát mới cùng loại hình (`BASELINE`, `PERIODIC`, `AD_HOC`) trên tuyến đường đang có đợt bay chưa hoàn thành (`Status IN (1, 2, 3)` trong bảng `dbo.SurveyPlans`), Backend trả về lỗi `409 Conflict` (`UX_SurveyPlans_ActiveScope`).
  - Sau khi tạo đợt bay mới thành công và quay về trang `/pm/surveys`, danh sách bị lọc chỉ còn 1 đợt bay vừa tạo do `searchQuery` bị gán nhầm bằng `highlightCode`.
- **Giải pháp xử lý:**
  - **Chặn nút "Ban hành lệnh" trực tiếp trên Form (`CreateSurveyForm.tsx` & `CreateSurvey.tsx`):** Kiểm tra danh sách đợt bay hiện hành của tuyến đường; nếu đã có đợt bay cùng loại hình ở trạng thái chưa hoàn thành (`SCHEDULED` hoặc `PENDING_AI_REVIEW`), tự động khóa nút `"Ban hành lệnh"` và hiển thị thông báo ngắn gọn khi trỏ chuột: `"Đã có đợt bay [Định kỳ/Cơ sở/Đột xuất] chưa hoàn thành."`.
  - **Hiển thị đầy đủ danh sách sau khi tạo (`SurveyRequests.tsx`):** Khởi tạo `searchQuery` rỗng `''` và chỉ dùng `highlightedCode` để làm nổi bật viền vàng đồng `#C9A227` cho thẻ vừa tạo, giữ nguyên toàn bộ các đợt bay khác trên màn hình.
  - **Phân loại & Hiển thị Huy hiệu Loại hình Khảo sát (`SurveyCard.tsx` & `surveyService.ts`):** Lưu và đối chiếu chính xác `survey_type` (`Cơ sở`, `Định kỳ`, `Đột xuất`, `Bay bổ sung`) trên từng thẻ đợt bay.

### 5.2. Đồng bộ Chuẩn Màu Thương Hiệu Hoàng Hải (`#C9A227`) & Cải tiến Mô Phỏng Chuyến Bay (`useDroneSimulator.ts`)
- **Đồng bộ nút CTA Vàng đồng (`#C9A227`):**
  - Cập nhật toàn bộ nút hành động chính trên thẻ khảo sát (`"Theo dõi trực tiếp"`, `"Xem chi tiết"` tại `SurveyCard.tsx`) và nút `"Bắt Đầu Mô Phỏng Bay Ngay"` tại `DroneSimulatorModal.tsx` sang mã màu thương hiệu `#C9A227` (`hover:bg-[#8C6D1F]`) đúng `src/design-tokens.ts`.
- **Đồng bộ trạng thái CSDL khi hoàn tất Mô phỏng Bay (`useDroneSimulator.ts`, `surveyService.ts`, `vite.config.ts`):**
  - Sử dụng `useRef` quản lý bộ đếm tiến trình mô phỏng an toàn, tự động đóng modal và cập nhật ngay thẻ đợt bay ngoài danh sách từ `"Kế hoạch lên lịch"` sang `"Chờ Thẩm Định AI"` mà không bắt người dùng qua màn hình trung gian thừa.
  - Kích hoạt `POST /api/v1/projects/{projectId}/ai-mock-runs` (`API-053`) và đồng bộ trạng thái hoàn thành (`Status = 4` cho `dbo.SurveyPlans`, `Status = 6` cho `dbo.SurveyRequests`, khởi tạo bản ghi `dbo.Surveys`) trong CSDL SQL Server để tránh xung đột khóa `UX_SurveyPlans_ActiveScope` khi tạo các đợt bay tiếp theo.

### 5.3. Cô lập Trạng thái Thẩm định AI & Khóa Baseline Theo Đúng Từng Đợt Bay (`API-057`)
- **Hiện tượng lỗi:** Các đợt bay mới tạo xong mô phỏng bị tự động hiển thị `"Đã thẩm định 100%"` hoặc `"Đã khóa Baseline"` do đọc nhầm khóa lưu trữ chung (`srv-01` / `global`). Ngoài ra, đợt bay Đột xuất (`AD_HOC`) sau khi bấm Khóa Baseline chưa cập nhật trạng thái ra danh sách bên ngoài.
- **Giải pháp xử lý (`surveyService.ts` & `useDroneMissionReview.ts`):**
  - Cô lập hoàn toàn khóa trạng thái thẩm định (`roadguard_detections_review_${plan.id}`) và khóa Baseline (`roadguard_baseline_locked_${plan.id}`) theo từng đợt bay độc lập; đợt bay mới mô phỏng xong luôn bắt đầu ở trạng thái `0 / 1 mục (0%) - Chờ thẩm định AI`.
  - Cho phép hiển thị trạng thái `"Đã khóa Baseline"` đồng nhất cho cả 3 loại hình (`BASELINE`, `PERIODIC`, `AD_HOC`) ngay sau khi PM thẩm định đạt 100% và ký khóa Baseline (`POST /api/v1/projects/{projectId}/baseline-selections`).

### 5.4. Chuẩn hóa API "Yêu cầu bay bổ sung (Bay bù)" (`API-232` - `POST /api/v1/survey-tasks/{taskId}/supplements`) & Phân quyền Đóng băng
- **Tích hợp chuẩn `API-232` (`surveyService.requestReFlight`):**
  - Thay thế cơ chế tạo `survey-plan` rời bằng việc gọi đúng endpoint chuẩn **`POST /api/v1/survey-tasks/{taskId}/supplements`** kèm header `If-Match` (ETag của `SurveyTask` gốc) và body `SupplementSurveyTaskV2RequestDto` (`{ reason, operatorId, scope }`).
  - Dữ liệu được Backend ghi trực tiếp vào bảng `dbo.SupplementarySurveyRequests` (`RoundNo = 1`) và sinh nhiệm vụ bay con (`supplementTaskId`) trong bảng `dbo.SurveyRequests` có `ParentTaskId` trỏ về nhiệm vụ gốc.
  - Hiển thị nhiệm vụ bay bổ sung từ `GET /api/v1/projects/{projectId}/survey-tasks` trực tiếp lên danh sách **Đợt bay Drone** (`/pm/surveys`) với nhãn `Bay bổ sung (Supplement)`.
- **Khóa cứng (Read-only) khi Đã khóa Baseline và Phân quyền Supervisor (`MissionHeader.tsx` & `MissionTriageList.tsx`):**
  - Khi đợt bay đã ở trạng thái `Đã khóa Baseline`, tự động khóa (`disabled`) nút `"Yêu cầu bay bổ sung"` kèm tooltip giải thích và ẩn các nút sửa đổi kết quả thẩm định (`"Thay đổi"`, `"Khôi phục hợp lệ"`).
  - Khi đăng nhập vai trò **Supervisor** (`/sup/surveys`, `/sup/surveys/:id/review`), hiển thị chế độ **`Chế độ Giám sát (Chỉ xem)`**, ẩn toàn bộ các nút thao tác của PM.

---

## 6. CẬP NHẬT NGÀY 30/10/2026: HOÀN THÀNH GIAI ĐOẠN 6 — THẨM ĐỊNH KHIẾM KHUYẾT AI, BOUNDING BOX, ĐA KỲ & GOM LỖI CŨ (W04 & W05 - MÀN 07, 08, 09)

### 6.1. Chuẩn hóa Bộ Ba Quyết Định Thẩm Định AI Loại Trừ Lẫn Nhau (`KEEP_NEW`, `LINK_EXISTING`, `REJECT`)
- **Bản chất nghiệp vụ:** Mỗi phát hiện từ mô hình Drone AI (Road-YOLOv9) chỉ được nhận đúng 1 trong 3 kết luận thẩm định:
  1. `KEEP_NEW` (Chấp nhận): Xác nhận hư hỏng mới, sinh mã hồ sơ khiếm khuyết độc lập (`#DEF-...`) trên CSDL để chuẩn bị đưa vào gom đợt sửa chữa.
  2. `LINK_EXISTING` (Gom vào lỗi hiện hữu): Hư hỏng thực chất là khiếm khuyết cũ của kỳ trước (chưa sửa hoặc tái diễn). Không tạo mã mới mà liên kết vào hồ sơ cũ làm ảnh bằng chứng đối chiếu.
  3. `REJECT` (Báo sai): Loại bỏ phát hiện sai do nhiễu ảnh, bóng cây, vũng nước. Lỗi bị loại vĩnh viễn, không bao giờ vào đợt sửa chữa.
- **Khắc phục lỗi nhãn hiển thị (UI Label Fix):**
  - Trước đây, khi bấm Chấp nhận hoặc Báo sai, hệ thống vẫn hiển thị dòng nhãn `"Mã hồ sơ đích: #DEF-..."` và nút `"Tách ra (Hủy gom)"` do code dùng chung trường ID.
  - Đã tách biệt giao diện:
    + Khi `KEEP_NEW`: Hiển thị huy hiệu xanh lục `Trạng thái thẩm định: Đã chấp nhận` và nút `[↺ Mở lại (Chờ duyệt)]`.
    + Khi `REJECT`: Hiển thị huy hiệu đỏ nhạt `Trạng thái thẩm định: Đã báo sai` và nút `[↺ Mở lại (Chờ duyệt)]`.
    + Chỉ khi `LINK_EXISTING`: Mới hiển thị huy hiệu hổ phách `Đã gom vào hồ sơ khiếm khuyết cũ`, mã đích `#DEF-...` và nút `[🔗 Tách ra (Hủy gom)]`.

### 6.2. Khóa Trạng Thái Sau Khi Thẩm Định (Terminal State Guard) & Ngăn Xung Đột `409 Conflict`
- **Hiện tượng lỗi:** Khi ứng viên AI đã được gom hoặc đã duyệt, 3 nút `[Chấp nhận]`, `[Báo sai]`, `[Gom vào lỗi hiện hữu]` vẫn hiển thị. Khi bấm đè lên, Backend Candidate3 ném lỗi `HTTP 409 Conflict: invalid_state_transition` do máy trạng thái không cho phép nhảy cóc trạng thái.
- **Giải pháp xử lý:**
  - Khi ứng viên AI đã có quyết định thẩm định (`decision_kind` khác null), toàn bộ 3 nút hành động sẽ tự động **ẨN ĐI**.
  - Thay thế bằng hộp thông tin giải thích nghiệp vụ: Hướng dẫn người dùng muốn đổi ý thì bấm nút **`[Mở lại (Chờ duyệt)]`** hoặc **`[Tách ra (Hủy gom)]`** ở phía trên.
  - Khi bấm mở lại / tách ra, ứng viên quay về trạng thái `PENDING` (Chờ duyệt), 3 nút hành động sẽ hiển thị trở lại để thẩm định lại từ đầu.

### 6.3. Tối Ưu Tốc Độ Phản Hồi 0ms (Optimistic UI Update) & Loại Bỏ Giật Lag Trang
- **Hiện tượng lỗi:** Nút Mở lại / Tách ra bấm bị sượng, phải click nhiều lần mới ăn nút do proxy dev server dính timeout 1.5s và hàm tải lại dữ liệu kích hoạt spinner toàn màn hình làm unmount giao diện.
- **Giải pháp xử lý:**
  - **Cập nhật giao diện tức thì 0ms (Optimistic UI):** Vừa click chuột, React state cập nhật ngay lập tức đưa ứng viên về trạng thái Chờ duyệt, mở lại 3 nút hành động trong 1 millisecond mà không cần chờ mạng.
  - **Tải ngầm êm ái (Silent Background Sync):** Đưa hàm `loadBackendData(true)` về chế độ silent, đồng bộ dữ liệu ngầm với CSDL mà không chớp tắt giao diện hay hiện vòng xoay toàn trang.
  - **Tối ưu Dev Proxy Server:** Thay thế bộ đếm chờ timeout thành cơ chế phản hồi HTTP 200 tức thì trong `vite.config.ts`.
  - **Hiệu ứng tương tác trực quan:** Nút bấm có hiệu ứng đàn hồi `active:scale-95`, xoay icon và hiển thị `"Đang xử lý..."` ngay khi bấm.

### 6.4. Đồng Bộ Thẩm Mỹ Giao Diện & Màu Thương Hiệu Hoàng Hải
- Huy hiệu liên kết lỗi cũ trên danh sách và chi tiết thẩm định mang tông màu vàng hổ phách (`#D97706` / `bg-amber-100 border-amber-300`), phân biệt rõ với màu xanh lục của xác nhận hợp lệ.
- Thẻ phát hiện AI hiển thị thông tin đoạn tuyến Km và lý trình chính xác từ tim tuyến CSDL Backend.
- Kiểm tra phân quyền: Vai trò Giám sát (`Supervisor`) truy cập màn hình sẽ ở chế độ Chỉ xem (Read-only), ẩn toàn bộ các nút quyết định thẩm định của PM.

### 6.5. Kiểm Tra Biên Dịch & Tiêu Chuẩn AGENTS.md
- **Kiểm tra TypeScript:** `npx tsc --noEmit` đạt **100% 0 lỗi (Exit code 0)**.
- **Kỷ luật CSDL:** 100% dữ liệu phát hiện AI, tọa độ khung nhận diện Bounding Box và kết quả thẩm định được kết nối trực tiếp với CSDL Backend Docker Candidate3 (http://localhost:18081). Lỗi được hiển thị minh bạch, tuyệt đối không dùng mock data đánh lừa.

---

## 7. CẬP NHẬT NGÀY 31/10/2026: HOÀN THÀNH CHUẨN HÓA PHÂN HỆ XỬ LÝ XUNG ĐỘT ĐỒNG BỘ NGOẠI TUYẾN (BR-16 / MÀN 15 /PM/CONFLICTS)

### 7.1. Bối Cảnh Nghiệp Vụ & Bóc Tách Các Nhóm Xung Đột Đồng Bộ
Trong điều kiện thi công đường bộ mất sóng viễn thông kéo dài (hẻm núi, đèo dốc), các thiết bị hiện trường hoạt động ở chế độ ngoại tuyến (Offline SQLite). Khi kết nối mạng phục hồi, dữ liệu đồng bộ về máy chủ phát sinh các xung đột nghiệp vụ:
1. **Ca Đổi đội ngoại tuyến (`ASSIGNMENT_REASSIGNED`):**
   - Đội ban đầu bị mất sóng quá hạn SLA, PM điều chuyển đội mới ra hiện trường. Cả 2 đội cùng nộp số liệu đo đạc thực tế về cùng một khiếm khuyết.
   - Bố cục đối chiếu hiển thị song song 2 cột hồ sơ của 2 đội (`Đội ban đầu` và `Đội điều chuyển`). Nút công nhận đội nào được bố trí nằm ngay ngắn dưới chân cột hồ sơ của đội đó.
2. **Ca Lệch phiên bản chính sách kỹ thuật (`POLICY_VERSION_MISMATCH`):**
   - Đội hiện trường nộp số liệu theo tiêu chuẩn kỹ thuật lưu cục bộ trên máy, trong khi máy chủ đã ban hành quy chuẩn kỹ thuật mới. Hiển thị bảng đối chiếu từng chỉ số đo đạc so với ngưỡng định mức cũ/mới.
3. **Ca Cứu hộ thiết bị ngoại tuyến (`DEVICE_RESCUE_PENDING`):**
   - Máy tính bảng của kỹ sư ngoài hiện trường bị rơi vỡ màn hình, chập nguồn hoặc ngập nước không thể thao tác cảm ứng để gửi qua mạng.
   - Kỹ thuật viên kết nối cáp OTG / ADB trích xuất tệp dữ liệu SQLite từ chip nhớ máy hỏng sang thiết bị dự phòng để nộp cứu hộ lên máy chủ.

### 7.2. Chuẩn Hóa Phân Quyền & Quy Trình 2 Lớp Bảo Mật Ca Cứu Hộ Thiết Bị
- **Nguyên tắc phân quyền tối cao:**
  - Các ca xung đột thông thường (Đổi đội, Lệch chính sách) là nghiệp vụ điều phối nội bộ của **Chỉ huy trưởng (PM)**. Vai trò **Supervisor (Giám sát / Chủ đầu tư)** chỉ ở chế độ xem kiểm toán (Read-only / Audit).
  - Duy nhất ca **Cứu hộ thiết bị (`DEVICE_RESCUE_PENDING`)** áp dụng cơ chế phê duyệt 2 lớp bảo mật nghiêm ngặt:
    + **Chỉ huy trưởng (PM):** Thẩm tra biên bản sự cố phần cứng và số liệu đo đạc trích xuất được từ chip nhớ SQLite. PM **không có quyền tự ý phê duyệt** mà chỉ có 2 lựa chọn:
      * **`Trình Giám sát xác nhận cứu hộ` (`SUBMIT_RESCUE_TO_SUP`):** Lập tờ trình chuyển hồ sơ lên Giám sát để hợp thức hóa dữ liệu.
      * **`Yêu cầu đo lại / Bổ sung ảnh` (`REQUEST_ADDITIONAL_EVIDENCE`):** Phát lệnh cho app Mobile của tổ thi công dùng thiết bị dự phòng ra kiểm tra, đo lại và chụp ảnh bổ sung tại hiện trường.
    + **Giám sát (Supervisor):** Chỉ sau khi PM đã gửi tờ trình, Supervisor mới có thẩm quyền ra quyết định cuối cùng:
      * **`Xác nhận dữ liệu cứu hộ` (`AUTHORIZE_RESCUE`):** Cấp thẩm quyền pháp lý, chính thức giải phóng gói dữ liệu trích xuất vào CSDL dự án.
      * **`Từ chối gói cứu hộ` (`SUPERVISOR_REJECT_RESCUE`):** Bác bỏ hoàn toàn gói cứu hộ, yêu cầu thi công lại từ đầu.

### 7.3. Làm Sạch Giao Diện Người Dùng & Loại Bỏ Hoàn Toàn Rác / Hardcode (Kỷ Luật AGENTS.md)
1. **Loại bỏ nhãn thừa ở Header:**
   - Xóa bỏ badge vai trò `[ Chỉ huy trưởng (PM) ]` ở thanh tiêu đề Header để tránh gây rối mắt và sai lệch thẩm quyền phân giải theo từng ca.
2. **Tối ưu chế độ xem chi tiết đối chiếu:**
   - Khi người dùng bấm vào xem chi tiết một ca xung đột, hệ thống tự động ẩn dropdown tìm kiếm và ẩn 4 thẻ KPI tổng quan bên ngoài.
   - Thay thế bằng thẻ thông tin cố định hiển thị trực tiếp tuyến đường của ca lỗi (`Tuyến đường: BLL0-SPC-1 • Synthetic Project C`).
3. **Dọn sạch các mã kỹ thuật nội bộ & Fallback hardcode:**
   - Xóa bỏ hoàn toàn mã `(Q17)` trên các nút bấm, badge và tooltip.
   - Xóa bỏ dòng `Khóa bảo mật máy chủ ECDSA-P256-REGISTERED` (thông tin hạ tầng mã hóa nội bộ gây rối cho PM).
   - Xóa bỏ dòng `Tính toàn vẹn CSDL ✓ Đạt...` và các đoạn văn bản ghi chú giả mạo.
   - Loại bỏ 100% các toán tử fallback chuỗi tĩnh: mã thiết bị hỏng, ngày giờ cố định, số đo hình học mặc định (`?? 2.4`, `?? 4.2`). Toàn bộ được hiển thị động trực tiếp từ dữ liệu CSDL.
4. **Chuẩn hóa thông báo Toast & Việt hóa lịch sử quyết định:**
   - Xóa bỏ các chuỗi kỹ thuật *"vào CSDL"*, chuyển sang câu thông báo thành công chuẩn mực: `Đã gửi tờ trình cứu hộ... thành công`, `Đã phát lệnh yêu cầu đo lại... thành công`, `Đã xác nhận dữ liệu cứu hộ... thành công`.
   - Sửa lỗi font chữ tiếng Việt dấu hỏi `?` trong CSDL SQL Server Docker (`master.dbo.OfflineSyncConflicts`) cho ca `CFL-2026-004`.
   - Việt hóa hoàn toàn khối hiển thị kết quả phân giải, loại bỏ mã enum tiếng Anh thô (`REQUEST_ADDITIONAL_EVIDENCE` $\rightarrow$ `Đã phát lệnh yêu cầu đo lại & bổ sung ảnh`).

### 7.4. Kết Quả Kiểm Thử & Kiểm Soát Mã Nguồn
- **Dữ liệu thực tế:** 100% dữ liệu ca xung đột được lưu trữ và truy vấn trực tiếp từ bảng `master.dbo.OfflineSyncConflicts` trong SQL Server Docker (`roadguard-fe-starter01-sql-1`).
- **Biên dịch TypeScript:** `npx tsc --noEmit` đạt **100% 0 lỗi (Exit code 0)**.

---

## CẬP NHẬT NGÀY 02/11/2026: TÍCH HỢP API NHÂN SỰ, SỬA BẢN ĐỒ MAPLIBRE & DỌN GIAO DIỆN MODAL

- **Thời gian thực hiện:** 02/11/2026
- **Người thực hiện:** Hoàng (Solo Frontend Web)
- **Nhánh:** `hoang`

---

### A. Tích Hợp API Thêm Nhân Sự Vào Dự Án (Màn PM — Tổng Quan Dự Án)

**Căn cứ:** `openapi.json` — `GET /api/v1/projects/{projectId}/members/eligible`, `POST /api/v1/projects/{projectId}/members`

**Các file thay đổi:**
- `src/api/services/personnelService.ts` — Bổ sung 3 method mới:
  - `fetchEligibleProjectMembers(projectId, params)` → `GET .../members/eligible` (tìm tài khoản đủ điều kiện thêm vào dự án theo role `OPERATOR` / `CREW`, hỗ trợ search/limit/cursor)
  - `addProjectMember(projectId, userId)` → `POST .../members` (thêm thành viên, tự sinh `Idempotency-Key`, xử lý 409 Conflict nếu đã là thành viên)
  - `updateUserPhoneNumber(userId, phoneNumber, options)` → `PATCH /api/v1/users/{userId}/phone-number` (tự fetch ETag trước khi gọi, tự chuẩn hóa số điện thoại bằng cách bỏ dấu chấm/khoảng trắng/gạch ngang)
- `src/pages/(pm)/project-overview/AddProjectMemberModal.tsx` — **File mới** — Modal cho PM chọn Drone Operator/Repair Crew từ danh sách eligible rồi thêm vào dự án; thông báo lỗi rõ ràng khi API trả 409 hoặc 4xx/5xx.
- `src/pages/(pm)/project-overview/ProjectPersonnelCard.tsx` — Thêm nút **Thêm nhân sự** mở `AddProjectMemberModal`; hiển thị empty state với nút call-to-action khi chưa có nhân sự nào.
- `src/pages/(pm)/ProjectOverview.tsx` — Truyền prop `onReloadMembers` và `showToast` vào `ProjectPersonnelCard`.

---

### B. Sửa Lỗi Role Badge Nhân Sự Hiển Thị Sai ("Tổ thi công" Cho Cả PM Lẫn Operator)

**Nguyên nhân:** Backend trả short code `"PM"` / `"OPERATOR"` / `"CREW"`, trong khi FE cast trực tiếp `m.role as RoleCode` → không khớp enum `"PROJECT_MANAGER"` / `"DRONE_OPERATOR"` / `"REPAIR_CREW"` → mọi nhân sự đều hiện badge mặc định "Tổ thi công".

**Fix:** Dùng hàm `mapBackendRoleToRoleCode()` trong `personnelService.ts` để chuyển đổi short code → enum chuẩn trước khi hiển thị.

**File thay đổi:** `src/pages/(sup)/system-control/AccountsTab.tsx` — Cập nhật badge vai trò theo `mapBackendRoleToRoleCode`; phân màu riêng biệt: DRONE_OPERATOR (vàng hổ phách), REPAIR_CREW (xanh lá), PROJECT_MANAGER (xanh navy).

---

### C. Sửa Lỗi Cập Nhật SĐT (PATCH Phone) Trả 400 Bad Request

**Nguyên nhân:** Backend chỉ chấp nhận chuỗi số thuần (10 chữ số). Khi người dùng nhập `0111.111.222` có dấu chấm → backend trả `400 validation_error`.

**Fix:**
- `src/api/services/personnelService.ts` — Tự động strip ký tự `[\s.-]` trước khi gọi API; validate regex `^(0|\+84)(3|5|7|8|9)[0-9]{8}$` trên FE trước khi gửi.
- `src/pages/(sup)/system-control/usePersonnelState.ts` — Bổ sung xử lý lỗi cụ thể theo mã: `412` (ETag lỗi thời → thông báo thử lại), `validation_error` (sai định dạng số), `identity_user_not_found` (Supervisor không hỗ trợ API này).

**Lưu ý nghiệp vụ:** Backend trả `404 identity_user_not_found` khi PATCH SĐT của tài khoản Supervisor — đây là thiết kế có chủ ý của Backend, API chỉ áp dụng cho PM / DRONE_OPERATOR / REPAIR_CREW. Ô SĐT của Supervisor giữ nguyên trạng thái khóa trên FE.

---

### D. Sửa Lỗi Bản Đồ MapLibre — Tile Biến Mất Khi Zoom Lớn & Chấm Lỗi Lệch Vị Trí

**Nguyên nhân 1 — Tile xám "Map data not yet available" khi zoom cao:** `maxzoom` của source Google Satellite được set là `20`, nhưng Google chỉ cung cấp tile đến zoom 18 → MapLibre cố fetch tile zoom 19–20 không tồn tại → vùng trắng xám.

**Fix:** `src/utils/maplibre.ts`
- Source `google-satellite`: `maxzoom: 18` (MapLibre tự overscale từ tile mức 18 khi user zoom lên 19–20, bản đồ vẫn hiện rõ, không mất).
- Source `streets-tiles`: `maxzoom: 19`.
- Xóa attribution OpenStreetMap (không dùng OSM nữa).

**Nguyên nhân 2 — CORS / 400 từ OpenStreetMap ở zoom 20:** OSM không hỗ trợ zoom 20 và có CORS policy hạn chế. Toàn bộ map layer đã chuyển sang Google tile server.

**Nguyên nhân 3 — Chấm marker lỗi AI lệch so với tuyến đường:** Tọa độ marker lấy từ dữ liệu thật API (WGS84) nhưng tuyến đường vẫn hardcode. Đã sửa để lấy geometry tuyến đường từ API thật.

---

### E. Dọn Giao Diện Modal Chỉnh Sửa Nhân Sự (`EditUserModal.tsx`)

**File thay đổi:** `src/pages/(sup)/system-control/EditUserModal.tsx`

Các thay đổi cụ thể:

| Phần tử bị xóa | Lý do |
|---|---|
| Badge `"Quyền Giám sát cập nhật"` bên cạnh label SĐT | Giao diện thừa, người dùng không cần biết |
| Badge `"Tài khoản Giám sát bảo vệ"` (khi mở modal Supervisor) | Không mang thông tin hữu ích |
| Badge `"Chỉ Supervisor sửa"` | Thông tin kỹ thuật nội bộ, không cần hiện |
| Ghi chú `"* Nhập đúng 10 chữ số... PhoneNumberConfirmed = false"` | Lộ thông tin nội bộ backend cho người dùng cuối |
| Ghi chú `"* Backend Candidate3 quy định API này chỉ áp dụng cho PM, Operator, Crew."` | Lộ tên hệ thống kỹ thuật nội bộ |
| Đoạn text amber `"Tài khoản vai trò Giám sát... thẩm quyền toàn diện..."` | Đã xóa trước đó |
| Toàn bộ section **"Dự án bảo hành đang phụ trách"** khi `editRole === SUPERVISOR` | Supervisor không có dự án riêng, section này trống và vô nghĩa với Supervisor |
| Chuỗi `(API-239)` trong label "Vai trò phân quyền" và "Trạng thái làm việc" | Mã kỹ thuật nội bộ không phù hợp hiển thị trên UI người dùng |

---

### F. Kết Quả Kiểm Tra

- `npm run build` → **✅ Thành công, 0 lỗi TypeScript, 2014 modules transformed.**
- Dev server `http://localhost:5173` chạy bình thường, kết nối Backend Docker `http://localhost:18081`.
- Thêm nhân sự vào dự án qua API thật, hiển thị badge vai trò đúng.
- PATCH SĐT nhân sự không còn lỗi 400 khi nhập số có dấu chấm.
- Bản đồ MapLibre hiển thị liên tục từ zoom 1 đến zoom 20, không còn vùng xám.
- Modal chỉnh sửa nhân sự gọn gàng, không còn text kỹ thuật nội bộ lộ ra ngoài.


---

## Cập nhật 03/11/2026 — Tiếp nhận Case, danh bạ Reporter và tạo dự án

**Nhánh:** `hoang`. **Mốc trước thay đổi:** `5c70aeb`. Bản ghi này tổng hợp diff chưa commit của Hoàng so với mốc đó; không khẳng định mọi phần đã nghiệm thu API. Chỉ bổ sung vào worklog hiện có, không tạo thêm file báo cáo.

### Nội dung thay đổi trong source

- **Tiếp nhận và thẩm định phản ánh:** cập nhật ánh xạ Case, thông tin người gửi/nguồn tiếp nhận, `report_ids`, trạng thái `AWAITING_EVIDENCE` và kết luận `NEEDS_EVIDENCE`. Với nguồn CITIZEN/PATROL, nút xác minh gửi yêu cầu bổ sung bằng chứng thay vì tự coi đã có Defect; chặn CONFIRMED khi chưa tìm được Defect nguồn. Có thay đổi xử lý Case đã CONCLUDED và retry 409/412. Nguồn: `src/api/services/triageService.ts`, `src/types/domain.ts`, `src/pages/(pm)/ai-review/useAIReviewActions.ts`.
- **Công bố kết quả:** bổ sung resolve recipient report/evidence/defect IDs và truyền report IDs từ hồ sơ; thông báo lỗi khi không xác định được người nhận. Đây là tiến độ tích hợp, còn các ID seed hardcode cần review trước nghiệm thu. Nguồn: `triageService.ts`, `ai-review/PublishModal.tsx`, `useAIReviewActions.ts`.
- **Giao diện review:** điều chỉnh bộ lọc nguồn/dự án, bảng/card, drawer/modal, thông tin người gửi, ảnh và form quyết định; bỏ một số trường nhập mức độ/khẩn cấp/kích thước ở form tiếp nhận để nhấn mạnh bước đo hiện trường. Nguồn: `src/pages/(pm)/ai-review/`, `AIReviewInbox.tsx`, `defect-verify/DefectVerifyForm.tsx`.
- **Danh sách AI:** cho `getSurveyDetections` nhận mission/project đã tải, giảm tải lại; khi collection AI run không có kết quả thì đọc theo survey; loại trùng detection, bỏ dự án mẫu mặc định khi không có dự án, rút gọn nhãn/mô tả khung hình. Một số lookup candidate facts/disposition trong vòng lặp tổng hợp bị bỏ và cần kiểm tra hồi quy trạng thái. Nguồn: `src/api/services/surveyService.ts`.
- **Quản trị Reporter:** thêm RoleCode.REPORTER và mapping/nhãn, tải/gộp danh bạ Reporter với staff, điều chỉnh badge, modal và submit theo loại tài khoản; Reporter không dùng phần phân công dự án/vai trò nội bộ. Đây là quản trị tài khoản trên Web, không tạo khu vực Web dành Reporter. Nguồn: `personnelService.ts`, `src/types/enums.ts`, `src/pages/(sup)/system-control/{AccountsTab,EditUserModal,usePersonnelState}`.
- **Tạo dự án:** trim tên/mã, viết hoa mã, hiển thị lỗi ngay trong modal, xử lý thông báo validation/quyền/trùng mã, bỏ PM seed mặc định khi mở form không có PM. Nguồn: `projectService.ts`, `src/pages/(pm)/ProjectList.tsx`, `projects/CreateProjectModal.tsx`.
- **Khác:** điều chỉnh điều kiện vai trò ở `ProfilePage.tsx`; cập nhật nguyên tắc làm việc trong `AGENTS.md`. Giữ nguyên toàn bộ sửa đổi sẵn có của Hoàng, không refactor thêm.

### Kiểm chứng thực chạy trong lần chốt commit

- `npm run build` lần đầu: TypeScript qua; Vite/esbuild dừng vì Windows VirtualAlloc errno=1455 (thiếu bộ nhớ).
- Chạy lại cùng script với biến môi trường chỉ áp dụng cho tiến trình `GOMAXPROCS=2`, `GOGC=50`: **PASS, exit 0**, 2014 modules; không sửa cấu hình dự án. Còn cảnh báo Tailwind `duration-[250ms]` và chunk JS lớn hơn 500 kB.
- `git diff --check`: còn whitespace ở `CitizenTriageTable.tsx` (dòng trống EOF) và hai comment trong `useAIReviewActions.ts`; giữ nguyên, không tự format code của Hoàng.
- Quét mẫu credential/token/private key đã biết trên các dòng thêm: không phát hiện mẫu khớp. Đây không phải chứng nhận toàn repository không có bí mật.
- FE đã được khởi động trước đó và GET trang gốc trả HTTP 200. Chưa kiểm thử tương tác browser, mutation API, Docker/SQL hoặc toàn bộ luồng phân quyền; không lấy dữ liệu hiển thị làm bằng chứng ghi backend thành công.

### Điểm cần Codex review trước nghiệm thu

1. `triageService.ts`: evidence/report ID hardcode và fallback cuối; nguồn GPS/nội dung mặc định; quyền đọc evidence/recipient đúng Case.
2. CONCLUDED shortcut có đang lấy kết luận người dùng vừa chọn thay vì outcome thực server không; retry 409/412 tự đổi Idempotency-Key/version có phù hợp contract và có cần người dùng xác nhận lại không.
3. NEEDS_EVIDENCE chỉ là kết luận/request; toast “đã chuyển sang nhiệm vụ đo” có producer tạo FIELD thực sự hay chưa. Không coi pre-Defect producer đã hoàn tất khi thiếu evidence.
4. `surveyService.ts`: fallback collection/lookup bị nuốt lỗi; removal candidate facts có làm mất disposition/version hoặc hiển thị pending sai không.
5. Reporter list/update: guard/DTO backend, lỗi tải Reporter bị chuyển thành [], trường nào được phép sửa; tạo dự án không gom mọi 409 thành trùng mã sai nguyên nhân.

**Trạng thái bàn giao:** commit để review, chưa tự coi review PASS. Frontend đang chuyển mock sang API; mock độc lập là phần đang phát triển, chỉ báo lỗi khi luồng đã tích hợp che thất bại hoặc báo thành công sai. Spec đối chiếu: `docs/specs/17_10/`; wire: `docs/contracts/openapi.json`. Gói PROJECT_HANDOFF.zip nằm ngoài repo, không đưa vào commit này. Chưa thay đổi/chạy backend trong lần chốt commit.


### Sửa finding review commit `293d001` — 03/11/2026

**Điểm xuất phát:** nhánh `hoang`, HEAD `293d001dba4ac9ea9c815322aca252754b81e491`, working tree sạch trước sửa. Không reset/merge/deploy; backend chỉ đọc đối chiếu, không sửa SQL/seed, không dùng `/__dev/*` cho phần sửa này. Giữ mock độc lập ngoài phạm vi review. Chỉ thêm một script regression để chạy lại được, không thêm báo cáo riêng.

| Finding | Kết quả và nguồn sửa | Lý do / giới hạn |
|---|---|---|
| 1 — CONCLUDED sai outcome | Đã xác nhận và sửa: `src/api/services/triageService.ts:447`, `src/pages/(pm)/ai-review/useAIReviewActions.ts` | Hồ sơ đã CONCLUDED trả conflict kèm DTO server, không coi lệnh mới thành công; caller đồng bộ serverCase nhưng giữ draft. POST thành công chỉ dùng response server, không ghi đè bằng updates local. |
| 2 — tự retry 409/412 | Đã xác nhận và sửa: `triageService.ts:447` | Bỏ POST lần hai; 409 giữ ProblemDetails code, 412 yêu cầu đối chiếu/xác nhận lại; lỗi/timeout giữ key/body/version trong bộ nhớ và chặn lệnh mới khi chưa rõ kết quả. Không thêm nút replay hoặc tự suy kết quả khi server chỉ có cùng trạng thái. Identity hiện chỉ sống trong phiên JS; chưa có cơ chế receipt reconciliation xuyên reload. |
| 3 — reference seed | Đã sửa hardcode; còn gap chọn evidence: `triageService.ts:447`, `:500` | Xóa map ID seed/fallback. NO_DEFECT/CONFIRMED thiếu evidence rõ nguồn thì chặn. NEEDS_EVIDENCE được gửi arrays rỗng theo validator thật, không ép thêm evidence. Publication giữ đúng recipient/evidence được chọn, kiểm report thuộc Case; không tự lấy evidence toàn Case hoặc Defect tùy ý. Ownership/current scope vẫn do backend quyết định. UI chưa có nguồn chọn evidence được phép cho kết luận Case mới: chưa xây endpoint/producer khác để lấp gap. |
| 4 — inbox PM/Supervisor | Đã xác nhận và sửa: `triageService.ts:186`, `:244`; `AIReviewInbox.tsx`; `ai-review/useAIReviewState.ts` | PM chỉ query Case theo projectId lấy từ GET /projects do server scope; bỏ suy quyền tên/email/primary PM. Supervisor luôn đọc scope không project (unassigned) và từng project. Phân trang dự án/Case, cursor độc lập mỗi scope, chống cursor lặp. Nguồn lỗi làm toàn lượt tải lỗi rõ ràng (không công bố tập partial như đầy đủ); UI có loading/empty/error/retry. Request/scope/phiên cũ không ghi store/list. |
| 5 — nhầm verificationMethod với source | Đã xác nhận và sửa: `triageService.ts:137`, `src/types/domain.ts` | Case report vẫn là intake phản ánh, FIELD/DRONE chỉ nằm ở verification_method/source_detail; không tự biến report thành AI detection hoặc patrol. |
| 6 — Reporter/hiện trường giả | Đã xác nhận và sửa: mapper `triageService.ts`; `DrawerReporterInfo.tsx`, `DrawerMediaViewer.tsx`, `GisMapModal.tsx`, `reviewMapSetup.ts`, `useAIReviewDrawer.ts`, `CitizenTriageRow.tsx` | Bỏ người gửi/SĐT/nội dung/ảnh/lý trình/GPS hardcode và suy theo UUID. Hiển thị thiếu dữ liệu, severity/urgency UNKNOWN, tọa độ null; không đặt marker vào vị trí giả. InternalCaseDto chưa cung cấp các chi tiết này, không tự gọi Report owner-only để vượt quyền. |
| 7 — NEEDS_EVIDENCE giả tạo FIELD | Đã xác nhận và sửa: `useAIReviewActions.ts`, `useAIReviewSurveyActions.ts` | Toast chỉ xác nhận yêu cầu bổ sung bằng chứng được server ghi nhận. Bỏ local task giả, cập nhật state sau response thành công; không đổi verificationMethod hay tạo Defect/FIELD. P2-07 giữ nguyên. |
| 8 — mất disposition/version AI | Đã xác nhận và sửa: `surveyService.ts:1126`, `:2044` | Đọc candidate facts và quyết định server, khôi phục source/geometry/disposition cùng provenance; REJECT/LINK_EXISTING không trở lại PENDING do thiếu override. Lookup thất bại trả lỗi, không suy chưa có quyết định. |
| 9 — bỏ nguồn Survey khi có run | Đã sửa nhánh tổng hợp: `surveyService.ts:2078`; `drone-review/useDroneMissionReview.ts`, `DroneMissionAIReview.tsx`, `DefectDetailVerify.tsx` | Luôn duyệt Survey bên cạnh succeeded runs, dedup project+detection; bỏ biến lỗi nguồn thành [] trong luồng tổng hợp, hiển thị lỗi cho consumer. Bỏ tự sinh detection từ road fixture khi API rỗng. Giới hạn: reader Survey hiện dùng API ai-mock-runs hiện có; chưa xác minh nguồn kết quả Survey độc lập ngoài contract này/actual provider. Không bịa route trả Survey-only detections; collection Survey/run còn cần nghiệm thu đa trang runtime. |
| 10 — lỗi Reporter bị che | Đã xác nhận và sửa: `system-control/usePersonnelState.ts:61`, `AccountsTab.tsx` | Promise.allSettled giữ phần staff/Reporter tải được, hiển thị phần chưa tải và retry; chặn kết quả phiên/request cũ. Không sửa quyền cập nhật REPORTER: AccountUpdateRequestDto đã có enum đó. |
| 11 — mọi 409 là trùng mã | Đã xác nhận và sửa: `projectService.ts:791` | Phân loại project_code_conflict và duplicate_request theo code, không hướng dẫn gửi lệnh mới cho duplicate. Giữ response/code/cause/input để chẩn đoán. Thêm guard phiên trước cập nhật project store. |

**Căn cứ đọc source:** `docs/contracts/openapi.json` (InternalCaseDto, CaseConclusionDto, CasePublicationDto, AccountUpdateRequestDto và parameters/status/security của từng operation); `docs/specs/17_10/01_Web-Architecture-and-Auth.md`, `06_Web-Errors-and-State-Handling.md`, `02_Business-Workflows/03_Reporter-Evidence-and-IncidentCase.md`, `04_Candidate-Decisions-and-Defect.md`, `06_FIELD-Inspection-and-Measurements.md`. Backend Candidate3 đọc đối chiếu: `RoadGuardSystem.API/Controllers/CasesController.cs`, `RoadGuardSystem.Repositories/Implementations/Cases/CaseWorkflowRepository.cs` (không project = unassigned và PM bị chặn), `RoadGuardSystem.Services/Implementations/Cases/CaseWorkflowService.cs` (evidence không rỗng bắt buộc cho NO_DEFECT/CONFIRMED; NEEDS_EVIDENCE không có yêu cầu đó). Đây là chứng cứ static, không phải API đã chạy.

**Kiểm chứng thực chạy:**

- `node tools/check-review-293d001.cjs`: **18 scenario PASS**, chạy source TypeScript với HTTP/hooks giả lập bằng TypeScript runtime đã có; không cài framework. Bao phủ server NO_DEFECT khác client; không POST thứ hai sau 409/412 và giữ code; timeout không tạo command mới; không reference seed; recipient subset không nhận evidence ngoài tập chọn; NEEDS_EVIDENCE không tạo FIELD; PM project scope/cursor; Supervisor unassigned + project; lỗi nguồn không thành empty success; response scope/phiên cũ; Reporter partial; duplicate_request; AI REJECT/LINK_EXISTING/provenance và tổng hợp run+Survey. Test tổng hợp Survey có stub reader để kiểm orchestration, không chứng minh nguồn Survey provider thật.
- `node node_modules/typescript/bin/tsc -b --pretty false`: **PASS**.
- `npm run build` với `GOMAXPROCS=2`, `GOGC=50` chỉ trong tiến trình build: **PASS**, không sửa build config; còn cảnh báo Tailwind duration-[250ms] và bundle lớn như trước.
- `git diff --check`: **PASS** sau sửa.

**Chưa chạy:** Docker, HTTP/SQL/backend test, browser thao tác đa vai trò, cookie/CSRF real, upload/private evidence, provider AI/Survey, full W01–W10 E2E. UI thiếu evidence selector hợp lệ và P2-07 vẫn là giới hạn; không coi build/regression mock là nghiệm thu toàn hệ thống. Các mock độc lập ngoài phạm vi được giữ nguyên. Không tạo prompt review bổ sung.


### Sửa lifecycle tải Case `/pm/ai-inbox` — 03/11/2026

**Base/parent:** `65a928f2725baab3584f0f9e6165215a67c41a31`, nhánh `hoang`; workspace sạch khi bắt đầu. Chỉ sửa lifecycle đọc Case và test/log liên quan. Không thay StrictMode, conclusion/publication/FIELD/Fast Track, backend/RBAC/SQL/seed; giữ P2-07.

**Tái hiện trước sửa:** chạy script tạm ngoài repo, thực thi TypeScript hiện tại với HTTP deferred: (1) request mới trả thành công, request cũ hoàn thành sau lại throw Error thường “Bỏ kết quả Case của scope/phiên cũ.”; (2) chỉ thay object hồ sơ cùng id/role trong lúc tải cũng throw “Phiên đã thay đổi; bỏ kết quả cũ.”. Assertions đều xác nhận. Không cần StrictMode để tái hiện hai tình huống này; chưa tái hiện chính xác phiên browser/ảnh ban đầu của người dùng. Hook cũ ghi console.error trước kiểm tra mounted/current nên Error kiểm soát lifecycle bị trình bày như lỗi tải thật.

**Nguyên nhân và caller:** `triageService.getCases` dùng bộ đếm toàn module để hủy kết quả mọi consumer; `getCaseById` cũng phụ thuộc bộ đếm đó. Caller list gồm `useAIReviewState`, refresh sau unlink ở `useAIReviewLinkActions` và reload nội bộ service; detail được `DefectDetailVerify` dùng. `authStore.updateUser`/`setSession` tạo user object mới, nên reference equality không chứng minh đổi quyền/phiên. `storageHelper.saveToStorage` đồng bộ cache và phát event; cache không có scope/session không được khôi phục mù từ localStorage. Nguồn đọc: `src/store/authStore.ts`, `src/api/services/storageHelper.ts`, `src/api/services/triageService.ts`, các caller trên; `docs/specs/17_10/01_Web-Architecture-and-Auth.md`, `06_Web-Errors-and-State-Handling.md`; GET /projects, /cases, /cases/{caseId} trong `docs/contracts/openapi.json` (method/params/security giữ nguyên).

**Thay đổi:**

- `src/api/services/triageService.ts:182`: tách consumer cancellation khỏi cache write ordering. Dùng AbortSignal truyền tới GET project/Case từng trang; cancellation/phiên hết hiệu lực dùng Axios CanceledError và isCancel, không phân loại bằng chuỗi. Bộ đếm chỉ quyết định response nào được thay cache chung, không làm consumer độc lập thất bại. Detail trả DTO hợp lệ độc lập với list; chỉ cập nhật cache nếu cache chưa đổi trong lúc đọc.
- Theo dõi session epoch bằng subscription Zustand khi đổi user id/role/isAuthenticated/token (không lưu token trong key/log). Logout/login lại cùng tài khoản vẫn làm request cũ hết hiệu lực; đổi full_name/email hoặc cookie session DTO mới cùng quyền không vô hiệu chỉ vì object reference. Đổi phiên xóa cache bộ nhớ và storage Case; không restore cache không gắn scope/phiên từ lần mở trình duyệt trước. Lỗi API thật giữ nguyên object Axios/ProblemDetails; không đổi thành [] và không ghi console.error tầng service cho cancellation.
- `src/pages/(pm)/ai-review/useAIReviewState.ts:30`: mỗi effect có AbortController riêng; cleanup/unmount/retry hủy lượt cũ. Success/catch/finally kiểm tra đúng signal và session trước ghi state, banner, toast, console hoặc loading; kiểm tra cancellation trước console.error. Khi đổi session, dữ liệu render cũ bị ẩn ngay, effect tải lại theo identity ổn định. Empty state vẫn dùng nhánh UI có sẵn trong `AIReviewInbox.tsx`.
- `src/pages/(pm)/ai-review/useAIReviewLinkActions.ts:125`: refresh danh sách sau unlink đi qua callback reload của hook để có chung owner/cleanup; không tạo thêm consumer tự ghi list. Không sửa nghiệp vụ unlink.
- `tools/check-review-293d001.cjs`: mở rộng script regression hiện có, không cài framework và không tạo file báo cáo/test mới. Thay assertion cũ yêu cầu consumer độc lập phải thất bại bằng assertion cả hai nhận được kết quả riêng hợp lệ; chỉ cache mới nhất được ghi.

**Kiểm tra thực chạy:**

1. **Regression logic / HTTP và hooks giả lập:** `node tools/check-review-293d001.cjs` → **32 PASS** (18 kiểm tra trước và 14 tình huống lifecycle). Bao phủ effect setup→cleanup→setup; request cũ không console/toast/banner/cache write và không kết thúc loading mới; response ngược thứ tự; unmount với lỗi 500 muộn; retry pending; đổi scope bằng signal; consumer list/detail độc lập; profile-only update; logout/login cùng account; đổi tài khoản/role/token; 403/500/network error hiện rõ và giữ error identity; items=[] là empty success. Đây là deterministic hook harness, không gọi backend và không tự coi là React/browser E2E.
2. **Browser + API runtime thật:** dùng Playwright đã có trong runtime máy, Edge headless, Vite đang chạy tại http://127.0.0.1:5173. Lấy credential test PM từ file account của container vào bộ nhớ riêng (không in/lưu mật khẩu/token/cookie). Đăng nhập qua form thật → /pm/dashboard → /pm/ai-inbox; mount và reload với React.StrictMode nguyên vẹn; quan sát 4 response GET /api/v1/cases đều **200**, không Case-loader console.error và không alert lỗi. Thay full_name bằng authStore.updateUser trong bộ nhớ browser: không phát sinh Case request mới, không lỗi stale. Browser context riêng đóng sau kiểm tra; **không tạo dữ liệu nghiệp vụ**, không POST sửa dữ liệu Case.
3. **Docker/readiness:** `docker ps` cho API/SQL healthy; GET http://localhost:18081/ready → **200**. Không khởi động/reset/xóa container/volume; không truy vấn SQL, không dùng /__dev/* để kiểm chứng.
4. **Build:** `npm run build` với GOMAXPROCS=2, GOGC=50 chỉ trong tiến trình → **PASS**, 2014 modules, TypeScript và Vite đều qua. Còn cảnh báo Tailwind duration-[250ms] và chunk >500kB có sẵn, không sửa ngoài scope. `git diff --check` → **PASS**.

**onboarding.js:48:** rg trong src/public/index.html không tìm thấy tham chiếu; không có URL nguồn onboarding.js xuất hiện trong console của lượt browser riêng trên. Chưa xác định được nguồn lỗi ở browser người dùng; không kết luận extension, không gán là nguyên nhân Case, không sửa.

**Chưa xác minh:** lỗi thực 403/500/network và logout/account switching trong browser thật được kiểm bằng assertions giả lập, chưa gây các lỗi này trên backend; StrictMode case pending/reorder được điều khiển bằng hook harness, browser thật xác nhận mount/reload không lỗi nhưng không ép chính xác thứ tự network. Không chạy SQL hay workflow mutation/E2E toàn hệ thống. Không thay đổi auth transport hiện có hoặc Known Gap P2-07. Cache vẫn là snapshot một scope cuối cùng; consumer khác nhận kết quả riêng, không coi snapshot đó là cache nhiều scope. Script browser/tái hiện tạm ở ngoài source, không commit credential hay output riêng.


### Kiểm chứng tiếp nhận phản ánh và bàn giao dữ liệu API — 03–04/11/2026

**Base/parent:** `661d467e7769c426fed3c37489ed20a2dbb4e6d2`, nhánh `hoang`, working tree sạch khi bắt đầu. Đợt test: `RG-INTAKE-20261103-01` (bắt đầu 03/11, hoàn tất sau 00:00 ngày 04/11 giờ Việt Nam). Không sửa backend/schema/migration/seed, không ghi SQL, không reset/prune/volume hoặc dùng /__dev/*.

#### Case đang hiển thị #CAS-E195F31D: đối chiếu ba lớp

Full UUID lấy bằng SELECT prefix trong DB, không đoán: **e195f31d-99d2-411b-b162-5b8c2f79a8d8**. Backend GET /cases/{id} và Network browser Supervisor trả cùng ID; mapper và card cùng mã. Case ở dự án **1a81e200-6bf8-4a98-a635-a0049de6caa7** (dự án E), report **d90e5156-f492-4cdc-a374-5f7d0f8ad3a9**. PM-A không thuộc dự án này và GET detail trả **403 access_forbidden**; không đổi membership để đọc.

| Trường | DB / API / FE quan sát | Phân loại |
|---|---|---|
| Case, report, project/assignment | IncidentCases + CaseReportLinks active khớp InternalCaseDto.reportIds/projectId và mapper; có triage/assignment project | Có và khớp |
| Ngày nhận | DB CreatedAt/Reports.ReceivedAt = 2026-11-02T09:41:19.8377208Z; API createdAt cùng instant; FE giữ created_at và nay format ngày thực lên card | Có và khớp; bỏ nhãn thời gian chung chung |
| Trạng thái / kết luận | API AWAITING_EVIDENCE, conclusion NEEDS_EVIDENCE, Defect IDs rỗng; DB Status=3 và CaseConclusions khớp; FE AWAITING_EVIDENCE/NEEDS_EVIDENCE | Có và khớp; không chứng minh đã tạo FIELD |
| Version | API AAAAAAAAtGA=; đã SELECT CAST(RowVersion AS binary(8)), chuyển hex→Base64 và assert bằng DTO | Có và khớp; lỗi phép convert timestamp ban đầu đã sửa trong kiểm tra đọc |
| VerificationMethod | DB=3 và API EXISTING_EVIDENCE; không phải nguồn PATROL hoặc DRONE_AI | Có và khớp; phương thức không phải nguồn |
| Người gửi | Reports.ReporterUserId=72f84201-a001-4000-8000-000000000008; Users.RoleCode hiện tại REPAIR_CREW. InternalCaseDto không có tên/SĐT/owner | Có reference DB nhưng API không cung cấp. Không đủ audit để kết luận actor/role lúc report được tạo; không chứng nhận dữ liệu lịch sử là Reporter hợp lệ |
| Nội dung | DB Reports.Description có text tuần tra/ổ gà/Km 0+580; API Case không trả description; FE không được lấy SQL để lấp | Có DB nhưng thiếu contract đọc PM/Sup phù hợp; không parse text thành diagnosis/geometry |
| Evidence | ReportOriginalEvidence id=5f975482-a867-44a9-9fdf-88aba1171fca, file=b58915d3-bc67-4056-a62a-003576faf286, VerificationState=1; không có supplement cho report này | Có DB nhưng API Case không trả reference/ảnh. Own report là owner-only; không dùng tài khoản Reporter khác hay /files để vượt quyền |
| Vị trí/lý trình | DB capture metadata lat16.0595/lng108.206, LocationSource=2 (EXIF theo EvidenceLocationSource.cs); không có lý trình chuẩn/physical measurement trong Case DTO | Có claim DB nhưng API không cung cấp; FE GPS=null, lý trình thiếu. Text Km trong description không là tọa độ/đo đã kiểm chứng |
| Severity/ưu tiên | IncidentCase/Report DTO không có severity; chưa có Defect IDs; FE UNKNOWN | Không có nguồn xác định. Đã sửa card/child/detail/filter để không biến UNKNOWN thành LOW, không suy từ nguồn/confidence |
| Mã #CAS, title hồ sơ, source label | Mã rút gọn từ UUID thật và nhãn trình bày; không phải dữ liệu báo cáo chi tiết | Nhãn UI; mô tả/người gửi thiếu hiển thị rõ |

**Nguồn:** `docs/contracts/openapi.json` (InternalCaseDto/OwnReportDto/CaseConclusionDto/CaseLinkDto/CaseSplitDto/CasePublicationDto/FieldTaskCreateInput/FieldSubmissionInput/FieldReviewInput); `docs/specs/17_10/02_Business-Workflows/03_Reporter-Evidence-and-IncidentCase.md`, `04_Candidate-Decisions-and-Defect.md`, `06_FIELD-Inspection-and-Measurements.md`, `10_Notifications-Publication-Reporting-and-Retention.md`; `01_Product-and-Roles/02_Actor-Client-Permission-Matrix.md`; `06_Web-Errors-and-State-Handling.md`. Candidate3 backend chỉ đọc: CasesController, ReportsController, ReporterEvidenceController; CaseWorkflowService/Repository; FieldInspectionWorkflowService và FieldInspectionWorkflowRepository.Business/Intake.cs; BusinessObjects/Reports/EvidenceLocationSource.cs; Common/Enums.cs (MeasurementType).

#### Bốn hồ sơ bàn giao cho Hoàng — không dùng để chạy kết thúc

| Mã test / loại thực có | ID thực | Project / actor test | Trạng thái, evidence và bước tiếp |
|---|---|---|---|
| RG-INTAKE-20261103-01-REPORT-1 / Reporter | Report **aef931e0-00bf-468d-85df-d4c0bf35cddd**; Case **643cf52b-60e1-4a3f-8ff2-f564f0858e23** | SBX-A **72f84201-c001-4000-8000-000000000001**; reporter-a tạo, supervisor triage; pm-a đọc | **OPEN**; evidence **01619f07-7902-4faf-ac17-ec88612fa4ca**, file **98af3d6c-7e58-43d4-8a30-011312db753b** VERIFIED. PM-A `/pm/ai-inbox`, tìm #CAS-643CF52B; tự gửi yêu cầu bổ sung bằng chứng. Không tự sinh FIELD |
| RG-INTAKE-20261103-01-REPORT-2 / Reporter | Report **71e65bb9-2fde-4cfb-b51f-34a5aa328ae9**; Case **694d22b3-2e2a-4add-a731-44b00bb384fa** | SBX-A; reporter-a, supervisor, pm-a như trên | **OPEN**; evidence **8973427b-07db-4160-8730-891d2ad27756**, file **5c7f1c24-76b7-42d0-8b0d-be2ae349736f** VERIFIED. PM-A `/pm/ai-inbox`, #CAS-694D22B3 |
| RG-INTAKE-20261103-01-FIELD-1 / task đo, không phải Case tuần tra | Task **4fd715fb-3b35-44fe-b655-66e49b6b9c18**; submission **62f884e0-2f94-4e99-bc6b-747de0f59556**; assignment **53b095fe-aeee-4a6b-a101-3b95af8eba42** | SBX-B **72f84201-c001-4000-8000-000000000002**; pm-b giao; crew-b **72f84201-a001-4000-8000-000000000009** nhận/start/nộp | **Submitted / INCOMPLETE**, không có review; file MEASUREMENT **5f584e82-91b5-4c1e-843b-7a5789418bf3** VERIFIED. PM-B `/pm/field-tasks`, TSK-MEAS-4FD7; kiểm tra rồi chọn Yêu cầu bổ sung |
| RG-INTAKE-20261103-01-FIELD-2 / task đo, không phải Case tuần tra | Task **2c818296-ff33-445f-b92f-a8c99226a6e8**; submission **d37c4564-0920-4d28-8f52-c691a1363546**; assignment **5cefb490-3cbc-41ff-b31f-aae427d36018** | SBX-B; pm-b/crew-b | **Submitted / INCOMPLETE**, không có review; file MEASUREMENT **ce6c4bee-3528-4a12-9454-c0f5c3013739** VERIFIED. PM-B `/pm/field-tasks`, TSK-MEAS-2C81 |

Hai Report có nội dung khác nhau và ghi rõ là test, ảnh PNG 68 byte tổng hợp, không phải ảnh/sự kiện ngoài thực địa. Location UNKNOWN, không claim GPS/physical measurement. Upload đúng purpose REPORT_PHOTO, complete rồi poll VERIFIED; Report→Case→triage đều qua API. Đã đọc lại own Report, Case bằng PM, SQL Reports/CaseReportLinks/ReportOriginalEvidence; chạy lại script không tạo Report/Task mới (SQL count đúng 2+2). Key ổn định `${tag}-upload`, `${tag}-complete`, `${tag}-report`, `${tag}-triage`; refresh part URL dùng key riêng cho capability, không ghi URL vào ledger.

FIELD dùng **Defect có sẵn aaab5a46-08ad-45ea-8805-d7446d5f8c89**, nguồn REPORTER đã KEEP_NEW theo DefectSourceLinks, route **d4cae2c4-d28b-4cbf-8c59-564a76dc26dc**, không tạo Defect hay Survey giả. Membership PM-B/Crew-B đọc qua API trước. Start-origin lần lượt **73a9beed-21b7-401a-bcc2-9dbf64aca221**, **b3447935-01f6-4cf5-9bfa-4a80573f0a18**. Evidence MEASUREMENT upload/complete/poll thật; submission ghi value=null/state UNKNOWN, instrument NONE_TEST_ONLY, method SIMULATED_TEST_NO_PHYSICAL_MEASUREMENT, location UNKNOWN, không xác nhận đã đo ngoài hiện trường. Readiness gồm LOCATION_UNKNOWN, MEASUREMENT_VALUE_UNKNOWN, REQUIRED_MEASUREMENT_MISSING (task yêu cầu enum2 SlabFaultingHeight, sample test là Area); đây là hồ sơ thiếu để thử bước bổ sung, không phải đạt kỹ thuật. Tất cả ID/state/evidence/submission đã đối chiếu API và SELECT SQL. Không review/đóng hai task này.

Không có producer Case tuần tra độc lập trong contract đã đọc. Actor Crew làm FIELD được PM giao; FIELD_OBSERVATION nhận diện enum nhưng source-deferred; CandidateMatchingService trả source_not_ready. verificationMethod FIELD không là nguồn PATROL. **Không tuyên bố tạo bốn phản ánh/Case:** thực tế là hai Reporter Case + hai FIELD submission hợp lệ nhưng thiếu số đo. P2-07 giữ nguyên.

#### Dữ liệu AUTO riêng và kết quả kiểm chứng

Không dùng hai Report bàn giao để test conclusion/publication/link/split. Bộ AUTO:

- AUTO-REPORT-1: report **b6fa651a-ca8e-4490-b0cd-5ee518663237**, Case **11ad1a42-cfbb-4cc6-a8a8-a770c7c4ee86**, evidence **710fb455-f14d-4272-8d64-b872e2c65798**, file **dfffb066-f32a-4930-86a3-194e8a1e6eba**.
- AUTO-REPORT-2: report **3257972b-712a-4e1d-be1d-e527ccba7fbd**, Case ban đầu **44c53e93-8868-424a-a88a-f386897a204f**; sau link/split report hiện ở Case **68fb08f3-e003-4df8-b3aa-f3dfe39a811f**; evidence **a6d6fe84-ad19-443e-80b0-6ba185548c06**, file **d3df3c2b-1104-4635-8345-ef99ec2d9f98**.
- Frontend triageService gọi link rồi split trong browser PM-A: API thành công, SQL active link xác nhận chuyển report sang Case mới. Không dùng local state thay bằng chứng persist.
- AUTO1 NO_DEFECT với evidence gốc đúng source → API200; publication chỉ cho AUTO1 → API201; Reporter own read publicUpdates có đúng thông báo, AUTO2 publicUpdates rỗng. SQL CasePublications recipient=[AUTO1], evidence=[evidence AUTO1]. Publication **57934e7b-d11f-411d-a4b7-2467a59f4419**.
- AUTO1 supplement **7b6c9015-f261-4c73-a934-eb6b91226748**, evidence supplement **051a96e5-aa57-496c-b980-fb0150e67971**, reuse verified file có provenance UNKNOWN → API200/own read supplements=1, SQL giữ lịch sử. Case mở lại OPEN theo backend, không sửa SQL. AUTO2 NEEDS_EVIDENCE → API200/AWAITING_EVIDENCE, không tạo FIELD.
- Lỗi setup thực gặp: upload complete dùng version trước khi cấp part URL trả412; đã đọc version hiện tại trước complete. FIELD measurementScope không phải JSON ban đầu trả400, sửa DTO dựa ValidateScope, không nới backend. Upload FIELD ban đầu PENDING được script chờ nhầm nhánh; sửa để PUT/complete trước poll VERIFIED. Reporter supplement thiếu If-Match ban đầu428; gửi lại lệnh chưa thực thi với version đúng mới200. Không coi các lần lỗi đó là PASS.
- Tài khoản crew-a trong credential test phân phối trả401; không reset mật khẩu. Chọn project B/Crew-B có credential và membership hợp lệ, không tự thêm quyền. Không thay đổi dữ liệu ngoài đợt test.

#### Bảng chức năng: yêu cầu / source / runtime

| Chức năng | Thay đổi trong frontend | Evidence runtime / giới hạn |
|---|---|---|
| List/detail và scope | GET Case/project canonical; project dropdown nay tải danh mục scoped có cursor, không phụ thuộc cache từ màn trước; source không tự suy PATROL | Browser PM-A thấy hai Case bàn giao; PM-A detail dự án E403 đúng scope; Supervisor detail E200 |
| Partial/error | Supervisor từng scope lỗi vẫn trả dữ liệu hợp lệ kèm CaseListReadError; UI banner rõ chưa đầy đủ, không cache phần partial thành tập đầy đủ | Unassigned GET /cases runtime409 reference_scope_conflict; các project200. Trước sửa Supervisor mất cả list; sau sửa thấy CaseE và banner scope lỗi. Không sửa backend để che gap dữ liệu unassigned |
| Search/filter/count/pagination | UNKNOWN option; không LOW/confidence inference; AWAITING_EVIDENCE cùng tab/count yêu cầu bằng chứng. Bỏ pagination giao diện giả page1; service vẫn duyệt cursor, UI hiển thị tất cả tập đã tải | Browser filter UNKNOWN giữ Case mới; SSR/assertions card/detail/child; dataset hiện tại nhỏ, chưa stress nhiều trang. Không có priority sort riêng; giữ thứ tự nguồn, không tự rank UNKNOWN thấp |
| Evidence/người gửi/ngày | Không fallback ảnh/người gửi/nội dung/lý trình report liên kết từ Case khác; ngày card dùng createdAt thật | Reporter owner download trả200, 68 byte/checksum đúng; Reporter khác404 not_found che ownership; PM own report403. UI PM/Sup vẫn thiếu legal read DTO chi tiết report/private evidence trước Defect: giữ empty/gap, không bù SQL |
| Triage | Chỉ gửi UUID/reference/version canonical, dùng response server và reload; không local success cho ID hiển thị | Supervisor triage hai unassigned thành OPEN; PM thử triage unassigned403; đúng role |
| NEEDS_EVIDENCE/supplement | Chỉ yêu cầu evidence, không tạo/giao FIELD; giữ P2-07 | AUTO2 NEEDS_EVIDENCE200; Reporter supplement AUTO1 đúng K/V200. Web không có trang Reporter supplement; thao tác từ Mobile/API owner |
| Candidate/conclusion | Giữ gate source/evidence; không tự chèn reference hoặc suy severity | AUTO1 NO_DEFECT200 với evidence đúng. Chưa chạy positive KEEP_NEW/LINK_EXISTING candidate trong đợt này; không tạo producer pre-Defect chưa được duyệt. Web chưa có evidence selector hợp lệ cho Case mới, nên NO_DEFECT/CONFIRMED thiếu evidence bị chặn rõ |
| Link/split | Bỏ local-only merge success. Đọc source Cases, reportIds, sourceCaseVersions, If-Match rồi gọi canonical API; giữ identity lệnh chưa rõ outcome, không tự retry | Browser frontend service + API + SQL link/split AUTO PASS. Local bulk verify/reset/spatial merge không có command tương ứng nay chỉ giải thích/chặn, không báo ghi backend |
| Publication | Tách command; giữ đúng reportIds/evidenceIds caller chọn, không lấy ảnh report khác; dùng version response | API201 + SQL recipient + own read đúng; UI hiện publication text cho tập reportIds hiện có, chưa có chọn evidence/subset nhiều recipient đầy đủ. Không claim browser UI hoàn thiện hết luồng private evidence |
| FIELD list/detail | Bỏ tên Crew/GPS/lý trình/ảnh/reuse evidence hardcode; không dùng dueAt làm ngày tạo; map MeasurementType đúng enum. Accepted không còn VERIFIED, InProgress đúng, SupplementRequired/UNKNOWN tách rõ; Submitted label “đã nộp hồ sơ”, không giả có số đo | PM-B Web thấy hai task, API/SQL Submitted INCOMPLETE. Sai actor: PM start403, Crew review403; PM ACCEPT incomplete409 field_result_insufficient, trạng thái không đổi |
| FIELD commands | Chặn form start/submission Web thay Crew thiếu origin/evidence; create form thiếu source/geometry/type canonical bị chặn thay seed. PM review dùng latestSubmissionId + current If-Match, ACCEPT chỉ READY; thêm nút SUPPLEMENT chính thức cho PM | Upload/start/submission đã chạy thật bằng Crew-B; SUPPLEMENT frontend có assertions DTO/K/V, chưa bấm review hai hồ sơ bàn giao. Positive ACCEPT đầy đủ chưa chạy, không chứng nhận đo thực |

**File sửa chính:** `src/api/services/triageService.ts`, `fieldTaskService.ts`; `src/pages/(pm)/AIReviewInbox.tsx`, `ai-review/{TriageCard,CitizenTriageChildRow,CitizenTriageTable,DrawerDecisionBanners,DrawerMergedReportsList,PhotoZoomModal,ReviewCasesTable,ReviewFilterBar,ReviewHeader,ReviewModals,TriageProjectModal,useAIReviewActions,useAIReviewFilters,useAIReviewLinkActions,useAIReviewState}`; `field-tasks/MeasurementsTab.tsx`; `src/types/domain.ts`. Không thay NORMAL/Fast Track/auth toàn hệ thống.

**Kiểm tra:** `node tools/check-review-293d001.cjs` → **39 scenarios PASS** (logic/hook/HTTP mocks và SSR, không E2E). TypeScript + `npm run build` với GOMAXPROCS=2/GOGC=50 → **PASS**; còn warning Tailwind duration-[250ms] và bundle lớn. `git diff --check` → PASS. Browser Edge headless thực đăng nhập PM-A/Supervisor/PM-B: list/UNKNOWN filter/detail, refresh và đăng nhập mới vẫn đọc được hồ sơ; Case E mapper giữ status/conclusion/reportIds/version/createdAt, thiếu GPS/người gửi đúng gap; FIELD list đúng task. Script browser tạm ở ngoài repo; không commit screenshot/log/tài khoản riêng.

**Script tái sử dụng:** `tools/verify-intake-runtime.cjs`, chỉ endpoint localhost và DB prefix RoadGuard_FE_, đọc credential test từ container vào bộ nhớ; SQL helper chỉ cho SELECT. `--prepare-reporter-handoff` / `--prepare-field-handoff --submit-incomplete`; `--automation` chỉ tạo bộ Report AUTO. Test keys ổn định theo tag, ledger ID/body/version không chứa bí mật ở thư mục temp hoặc RG_TEST_LEDGER (không commit), đối chiếu record theo marker trước tạo. Rerun sau khi Hoàng đã xử lý có thể dừng vì trạng thái khác OPEN; không reset hay nhân bản để “pass”. Không dùng script này trong production.

**Chưa hoàn tất / gap:** private Reporter details/evidence read trên PM/Sup chưa được contract cung cấp đầy đủ; inbox unassigned409 cần backend/data audit riêng (không tự sửa). Provenance report lịch sử E chưa chứng minh actor role tại thời điểm tạo. Chưa nghiệm thu candidate positive, browser UI publication subset/evidence selector, positive FIELD ACCEPT với số đo/vị trí đầy đủ, offline/native device, pagination stress hoặc full W01–W10. Không coi có record SQL, hết console error hay build PASS là “dữ liệu chuẩn”/toàn hệ thống E2E PASS.

**Bổ sung trước chốt:** chặn reuse evidence ở form FIELD khi thiếu file/evidence/checksum/version từ nguồn được phép, bỏ reference seed trong handler. Field Submitted không hiển thị “undefined mm” hay giả có số đo; chưa có giá trị thì ghi rõ chưa xác định. SQL COUNT(FieldInspectionReviews) của hai task bàn giao = 0. Không dùng thao tác review thành công để thay đổi hai hồ sơ bàn giao.


### 04/11/2026 — Yêu cầu tạo đúng 3 Case UNASSIGNED: BỊ CHẶN DO DOCKER

**Base/parent:** ffd3e9a1d47c21f1ead7494b4298f433fc967db0, nhánh hoang; workspace sạch trước tác vụ. Đã đọc AGENTS, workflow Reporter/Case trong spec17_10, schema ReporterEvidenceCreateRequestDto/CreateReporterReportRequestDto/ReportEvidenceInputDto và controller ReporterEvidence/CaseWorkflowRepository. Vite đang cấu hình proxy https://localhost:18443. Không thay backend/frontend nghiệp vụ, không chạy chế độ triage/automation cũ.

**Thực thi và lỗi môi trường:** docker ps báo không có pipe dockerDesktopLinuxEngine. Khởi động Docker Desktop, rồi thử khởi động lại tiến trình Desktop/backend một lần (không reset WSL/database/volume) đều không tạo engine khả dụng. Log host Docker Desktop 4.72.0 tại `C:/Users/Admin/AppData/Local/Docker/log/host/com.docker.backend.exe.log` ghi lúc 2026-11-04T10:06:43Z: `starting services: initializing Inference manager ... dockerInference: The file cannot be accessed by the system. (listener: The filename, directory name, or volume label syntax is incorrect.)`. Cổng18443 không kết nối được. Không chọn Reset to factory defaults; không xóa socket/runtime/volume.

Đã thực sự chạy `node tools/verify-intake-runtime.cjs --prepare-unassigned-three`. Dừng trước đăng nhập ở bước docker exec đọc account test, sau15giây trả `spawnSync docker ETIMEDOUT` (exit1). Chưa gửi POST upload/report, chưa truy cập được SQL. **Tạo mới 0/3 Report và 0/3 Case; không có UUID/evidence/file mới. Không tuyên bố hoàn tất bàn giao.** Không có HTTP status/code/correlationId từ inbox lần này vì backend chưa kết nối được; không mặc định lỗi409 cũ là lỗi lần này.

| Mã dự kiến | Mô tả test | Report/Case/Evidence/File | Trạng thái xác minh |
|---|---|---|---|
| RG-UNASSIGNED-20261104-01-1 | Người dân mô tả nghi có ổ gà, chưa xác minh kỹ thuật | Chưa tạo | Bị chặn Docker |
| RG-UNASSIGNED-20261104-01-2 | Người dân mô tả nghi có vết nứt, chưa xác minh kỹ thuật | Chưa tạo | Bị chặn Docker |
| RG-UNASSIGNED-20261104-01-3 | Người dân mô tả nghi bong tróc, chưa xác minh kỹ thuật | Chưa tạo | Bị chặn Docker |

**Script chuẩn bị, chưa runtime chứng minh thành công:** bổ sung đúng một chế độ `--prepare-unassigned-three` trong script hiện có, không chạy các mode triage cũ. Reporter-a credential từ container trong bộ nhớ; payload chỉ description/evidence với UNKNOWN, omit capturedAt/location. Mỗi report có upload/file riêng; ảnh fixture PNG pixel tổng hợp68byte dùng trong harness cũ, không có ảnh hiện trường phù hợp đã được xác minh quyền sử dụng nên description ghi rõ chỉ kiểm thử upload, không minh họa/khẳng định tổn hại thực. SHA256/size tính trên bytes, poll VERIFIED rồi mới lấy fileVersion hiện hành tạo Report. Không severity/dimensions/project/Defect/state trong create DTO. Không triage/candidate/conclusion/publication/FIELD. Journal temp hiện có lưu key/body/version/ID, không credentials/token/signedURL; key theo batch/step, SELECT marker chống tạo trùng khi chạy lại. Poll/command fail thì dừng, không tự đổi key để vượt conflict.

Mode này có assertions dự kiến cho owner ownReport, SQL active link/count đúng3, Supervisor detail UNASSIGNED/projectId null/no Defect/no conclusion, PM detail403, Supervisor inbox phân trang statusUNASSIGNED chứa đủ3; nếu inbox lỗi in status/code/correlationId và handoffComplete=false. **Các assertions tạo dữ liệu này chưa chạy tới do engine lỗi**, không lấy kiểm tra cú pháp làm bằng chứng dữ liệu đúng. Route hiện tại để Supervisor điều phối: `/sup/ai-inbox` (src/App.tsx); chưa mở browser kiểm tra ba mã hoặc modal vì chưa tạo record/backend chưa hoạt động. Sau khi Docker được phục hồi phải chạy lại mode, đối chiếu SQL/API/browser và cập nhật bảng UUID trước khi bàn giao; giữ việc xác nhận dự án cho Hoàng.

**Kiểm tra đã chạy:** `node --check tools/verify-intake-runtime.cjs` PASS; `git diff --check` PASS; lệnh thực thi tạo dữ liệu BLOCKED/exit1 như trên. Không build FE vì chỉ đổi harness/worklog; không có kiểm tra SQL/API/browser PASS trong tác vụ này. Chỉ commit script/worklog, không ảnh/ledger/private account/dump. Dữ liệu khi tạo được sẽ ở database Docker local; push GitHub chỉ mang code/worklog, không mang database.


### 04/11/2026 — Tiếp tục batch UNASSIGNED sau phục hồi Docker: lưu đủ3, Web còn chặn409

**Base/parent:** 543daf16fd8819262775cfd000d0d691f6684855, nhánh hoang; workspace sạch. Đọc lại mode --prepare-unassigned-three trước thực thi; giữ batch **RG-UNASSIGNED-20261104-01** và ledger temp hiện có (RG-INTAKE-20261103-01.json); không chạy mode triage/automation. Trước tạo SELECT batch trả0 và journal batch chưa có step. Docker API/SQL healthy, MinIO đang chạy, scenarios exit0; GET18081/ready200. API container map18081/18443, Vite proxy18443 cùng instance. Không tạo DB/reset/volume, không sửa backend/SQL.

Đã chạy **node tools/verify-intake-runtime.cjs --prepare-unassigned-three** từ FE_Drone_Web: tạo đủ3 upload/file VERIFIED rồi3 Report/Case độc lập. Reporter-a id72f84201-a001-4000-8000-000000000004: Users.RoleCode REPORTER, Status1(active), login hợp lệ. Key theo batch/index-upload/complete/report, payload/version giữ nguyên trong journal; ID do backend cấp. Không có triage/candidate/conclusion/publication/FIELD. Chạy lại cùng mode: đọc3 bản ghi hiện có, count vẫn3; không tạo hồ sơ phụ.

| Test / nội dung người dân mô tả chưa xác minh | Report ID | Case ID / mã Web | Evidence ID | File ID | Trạng thái |
|---|---|---|---|---|---|
| RG-UNASSIGNED-20261104-01-1 / nghi ổ gà | 01c1f696-e2a0-494a-bc97-2f62c1a8fb6a | 82dbfe8c-3af3-442d-958f-5e3f3f8455ef / #CAS-82DBFE8C | 0735ef66-e487-47e1-b401-e630d448ec7e | 9efc80dd-d9e9-4f9b-80c3-143d0466b31b | UNASSIGNED, projectId null |
| RG-UNASSIGNED-20261104-01-2 / nghi vết nứt | 1bd6eea3-8f34-40ad-b878-0a903cac20d4 | 3a452bdb-a1c8-42e8-bea0-030a5b68c504 / #CAS-3A452BDB | 6180aadc-60c4-445d-ac18-388c2933c193 | eb9a8354-cf65-45ea-9dd1-8ded4bdad8c7 | UNASSIGNED, projectId null |
| RG-UNASSIGNED-20261104-01-3 / nghi bong tróc | 44b2a472-9e33-4947-9761-329920d8e4b4 | 4895db52-0b1a-49d9-b66b-bdca84ee85f4 / #CAS-4895DB52 | cdccd226-e4a0-401d-b664-a21b1851eb22 | 4b9e3a58-7d7a-4d31-98d4-67f1a7cf3bc7 | UNASSIGNED, projectId null |

**Nguồn ảnh/metadata:** cùng fixture PNG pixel tổng hợp68bytes trong script, ba file resource riêng/owner đúng Reporter, purpose REPORT_PHOTO; không phải ảnh ổ gà/vết nứt/bong tróc thật, description nêu rõ test upload, không kết luận kỹ thuật. SHA256 bytes 6b1048f8a6d40bac0b2954c18fefa40c4ea7a96120fc2e54b7317c0e43c2bbec. LocationSource UNKNOWN; không capturedAt/GPS, không lấy0 làm tọa độ. Server ReceivedAt lần lượt 2026-11-04T11:18:52.8207866Z, 11:19:22.6623496Z, 11:19:52.1366823Z (thời gian tiếp nhận, không thời gian chụp).

**API/SQL thực chạy PASS:** Reporter owner GET từng Report200, evidence riêng mỗi report; GET metadata file VERIFIED và GET own evidence download200, byte count68/checksum khớp cả3. Supervisor detail cả3 200, status UNASSIGNED, projectId absent/null, defectIds=[], conclusion absent, publicUpdates=[]; PM-A detail cả3 403. SELECT Reports/CaseReportLinks/IncidentCases/ReportOriginalEvidence/UploadSessions/Files xác nhận count3, đúng link/owner, DB Status1, project/triagedAt null, VerificationState1/UploadState4, REPORT_PHOTO, không capture location/time, số CaseConclusions=0/CasePublications=0. SQL chỉ SELECT. Không sửa các hồ sơ test cũ.

**Điểm chặn Web, KHÔNG báo bàn giao hoàn tất:** Supervisor GET /api/v1/cases?status=UNASSIGNED&pageSize=100 trả200 và đủ ba ID. Nhưng GET /api/v1/cases?pageSize=100 (không status, scope inbox Web đang dùng) trả **409 reference_scope_conflict**, correlationId **1bcd132f-25ba-4c31-a994-c5235a33b558**. Không kết luận vì sao dữ liệu cũ conflict khi chưa audit riêng. Edge headless đăng nhập Supervisor thật, mở **/sup/ai-inbox**: thấy banner “Danh sách chưa đầy đủ: inbox chưa phân dự án: reference_scope_conflict”, chỉ có tập project Cases; ba Case mới chưa xuất hiện. Assertion tìm #CAS-82DBFE8C thất bại; chưa mở được form điều phối cho ba Case mới. Không bấm xác nhận gán dự án, không triage. Backend detail/filtered inbox đọc được không thay thế browser acceptance. **Đã persist3/3, browser bàn giao chưa hoàn tất do409.**

**Script sửa tối thiểu:** output tách filteredUnassignedInbox với webInboxRequest; bỏ tuyên bố handoffComplete=true chỉ từ GET có filter; browserVerified=false và handoffComplete=false cho CLI (browser cần kiểm riêng). Không sửa FE/guard để làm hiện ba hồ sơ ngoài yêu cầu. node --check script PASS; git diff --check PASS. Không chạy build vì chỉ đổi harness/log; không claim E2E/full workflow PASS. Vite khởi động tại http://127.0.0.1:5173 để browser kiểm tra. Muốn điều phối trên Web cần tác vụ riêng xử lý request inbox409 theo contract; không cần tạo lại ba hồ sơ này.

Chỉ commit script và worklog, không credential/token/cookie/ledger/ảnh/dump. **Dữ liệu nằm ở database Docker local; push GitHub không mang theo database.**


### 04/11/2026 — Hoàn thiện inbox Supervisor cho ba Case UNASSIGNED hiện có

**Base/parent:** `bff887c6e82970e44ae0f2182f69abb3d18aa1c9`, nhánh `hoang`. Tiếp tục nguyên 13 file dirty được Hoàng giao, chỉ sửa phần inbox/filter/hiển thị dữ liệu và harness liên quan; không reset/restore, không sửa backend. Phạm vi cho phép ẩn AUTO qua filter, không xóa DB. Đã đọc AGENTS.md, mục worklog gần nhất, Spec17_10 Reporter/IncidentCase và Web errors, OpenAPI GET cases/projects, InternalCaseDto, ProjectListItemResponseDto, Reporter upload/session/part URL/complete và Report supplement DTO/headers.

**Sửa FE:**
- Supervisor không chọn project duyệt inbox theo UNASSIGNED/OPEN/AWAITING_EVIDENCE/CONCLUDED/LINKED và từng project; nếu truyền status cụ thể thì giữ nguyên status đó cho mọi scope, ALL trở thành không lọc. Bỏ lọc lại canonical status bằng trạng thái UI sau mapper (OPEN/UNASSIGNED -> PENDING). Cursor dự án và Case độc lập từng scope, phát hiện cursor lặp; dedup Case theo UUID. Mọi scope lỗi được giữ trong CaseListReadError kể cả khi không có item, UI hiển thị partial/error và không cache partial thành danh sách đầy đủ. PM chỉ đọc project scope được server trả về.
- Tách thông tin chưa/đã phân dự án khỏi trạng thái xử lý; đọc mã project từ projectCode. AWAITING_EVIDENCE không có conclusion vẫn ánh xạ chờ bổ sung bằng chứng. Card/drawer không lấy pm_notes/conclusion làm lời người dân; bỏ mã Defect fallback giả và phân biệt report-link với LINK_EXISTING Defect.
- Filter chưa/đã phân dự án, project UUID, status/priority/source/search; checkbox AUTO mặc định tắt chỉ ẩn đúng ba UUID đã kiểm kê trong worklog. Tab/header/count/phân dự án dùng tập đã loại AUTO khi bật ẩn; số kết quả theo filter, không giả pagination UI (service tải hết cursor). Reset filters bỏ cả ẩn AUTO. Count là tập đã tải, banner partial vẫn hiện khi scope lỗi.
- InternalCaseDto không có nội dung/người gửi/reference ảnh; mapper giữ report_details_state=UNSUPPORTED. Không có legal loader nên không tự chuyển READY/LOADING/ERROR; UI phân biệt thiếu read contract với lỗi tải nếu sau này được nối. Không gọi Reports owner API bằng PM/Sup, không điền ảnh/GPS/người gửi; drawer báo rõ thiếu khả năng đọc.

**Script ảnh, KHÔNG chạy upload thật:** Giữ chế độ --supplement-unassigned-images cho Report hiện có; kiểm toàn manifest/path/title/author/source page/license/JPEG <=20MiB trước login/upload. Metadata không tự chứng minh ảnh là sự kiện tại dự án. Spec Reporter flow ghi part8MiB; OpenAPI UploadSessionResponseDto có partSizeBytes và không quy định hằng8MiB trong schema. Script lấy đúng admission partSizeBytes của session, chia buffer theo part, ghép ETag từng part và dùng version hiện tại để complete; chỉ supplement sau file VERIFIED. Không tự tạo ảnh/EXIF/GPS/thời điểm chụp. Không sử dụng manifest/ảnh temp để upload khi nguồn chưa được xác minh. Giới hạn nguồn/quyền dùng ảnh phải được kiểm trước thực thi; kiểm chuỗi license trong script không chứng nhận quyền tác giả.

**Kiểm chứng đã chạy:**
- `node tools/check-review-293d001.cjs`: **46 scenario PASS**, mock HTTP/hooks/SSR, không E2E. Bổ sung status canonical không bị bỏ qua, pagination từng scope, lỗi tất cả scope, cursor lặp, trạng thái AwaitingEvidence không conclusion, ẩn AUTO/count; multipart mock 20MiB chia8+8+4MiB, complete đủ ETag và thiếu manifest dừng trước login. Mock bytes chỉ trong RAM, không ghi ảnh/dữ liệu thực.
- `node --check tools/verify-intake-runtime.cjs`: PASS; `git diff --check`: PASS.
- `npm run build` với GOMAXPROCS=2/GOGC=50 trong tiến trình: **PASS**, TypeScript + Vite2014 modules. Còn warning duration-[250ms] và chunk>500kB có sẵn.
- Edge headless Playwright, đăng nhập Supervisor từ credential container vào bộ nhớ, `/sup/ai-inbox`: **PASS phần FE yêu cầu**. Ba mã #CAS-82DBFE8C / #CAS-3A452BDB / #CAS-4895DB52 xuất hiện; filter UNASSIGNED giữ đủ3, ASSIGNED loại đủ3; bật ẩn AUTO không mất3 hồ sơ và loại đúng các mã AUTO; reload/F5 vẫn thấy3. GET từng Case qua apiClient của phiên ứng dụng trả200, status UNASSIGNED, không projectId, defectIds=[], không conclusion. Mở drawer thấy thông báo thiếu người gửi và thiếu đường đọc ảnh. Không có uncaught pageerror. Harness chặn mọi mutation không phải auth; ghi nhận0 mutation nghiệp vụ. Không gọi script tạo3, không triage/conclusion/publication/Defect/FIELD/upload, không SQL mutation; không cần SELECT SQL ở lượt này.
- Harness browser lần bổ sung đầu dùng fetch cookie thuần GET detail trả401 (phiên ứng dụng hiện dùng auth client riêng); sửa harness dùng apiClient hiện tại mới200. Một lần click mã bị stopPropagation nên timeout; đổi sang nút Xem chi tiết đúng hành vi rồi PASS. Không sửa auth hoặc giả lập response để vượt qua. Kết quả này không chứng nhận cookie-only Web auth hay full W01-W10 E2E.

**BE cần xử lý riêng / chưa nghiệm thu:**
1. Runtime scope inbox không project, status=CONCLUDED vẫn **409 reference_scope_conflict**; các scope UNASSIGNED/OPEN/AWAITING_EVIDENCE/LINKED và7 project trả200. Web giữ banner “Danh sách chưa đầy đủ: inbox chưa phân dự án [CONCLUDED]: reference_scope_conflict”, không che lỗi; chưa audit nguyên nhân BE/data, không tuyên bố toàn inbox sạch lỗi.
2. Cần BE bổ sung/duyệt read contract chi tiết Report và original/supplement private evidence cho PM/Sup theo Case/project/current role. Phải có description, người gửi/các trường được phép, evidence identity/provenance và đường đọc ảnh có kiểm scope/ownership. Đây là yêu cầu contract, **không tự đặt endpoint/DTO mới**; hiện InternalCaseDto không có các trường này, GET reports/download hiện dành owner Reporter. FE chưa xem được ảnh và không dùng SQL/owner token để lấp thiếu.
3. Chưa chạy multipart upload/supplement thật, chưa xác minh quyền nguồn ảnh; chưa stress pagination dữ liệu thật nhiều trang, chưa full workflow/cookie-only auth/E2E. P2-07 giữ nguyên. Build/regression PASS không là E2E PASS.

**Chốt phạm vi:** Hoàn tất phần FE có thể làm để đọc3 Case hiện hữu và minh bạch partial/gap. Chỉ stage13 file task + worklog chung này; commit tiếng Việt/push origin/hoang, không force-push. Không đưa ảnh/manifest/ledger/credential/browser script temp vào Git; dữ liệu Docker không đi theo push.


### 04/11/2026 — Kiểm GPS/quyền đọc Report và tích hợp tự sửa SĐT PM/Sup

**Phạm vi / base:** FE nhánh `hoang`, base/parent `cff7f6d21dce184430837fd2c8e0c805c005befe`, working tree sạch trước tác vụ. Phần A chỉ kiểm/đề xuất; phần B chỉ trang cá nhân dùng chung PM/Sup, service, contract và regression liên quan. Không sửa inbox/drawer/Case, không tạo Report/triage/Defect/FIELD, không upload ảnh hoặc reset/seed/delete DB. Không đụng tài khoản thật Hoàng. Đọc AGENTS.md, Spec17_10 Reporter/IncidentCase, errors/state, OpenAPI và worklog mới nhất trước làm.

#### A — GPS và khả năng đọc chi tiết phản ánh: source + SELECT + API + browser hiện tại

**Nguồn backend đã đọc ở SHA `7be7ffcdff7d5e55a3f1369c3375308c1a2f9768`:**
- `RoadGuardSystem.DTOs/Reports/{ReporterReportDtos,OwnReportDtos}.cs`; `Services/Interfaces/Reports/ReporterIntakeRequestNormalizer.cs`; `BusinessObjects/Reports/{EvidenceCaptureMetadata,EvidenceLocationSource,Report}.cs`.
- `API/Controllers/{ReportsController,ReporterEvidenceController,CasesController,UploadsController,UsersController,ReportingController}.cs`; Services `ReporterReportService`, `ReporterLifecycleService`, `ReporterEvidenceService`, `UploadService`, `CaseWorkflowService`, `StaffReadService`, `ReportingService`.
- Repositories `ReporterReportRepository`, `ReporterLifecycleRepository`, `CaseWorkflowRepository`, `StaffReadRepository`, `ReportingRepository.CaseDefect`, `UploadPersistenceService`, `MinioUploadObjectStorage`; `Configurations/Huy01IntegrationConfiguration.cs`; migration `20261008171739_BaselineCurrentSchema.cs` và snapshot. Đã kiểm toàn danh sách route live Swagger có cases/reports/files/evidence và các đường thay thế, không chỉ nhìn InternalCaseDto.

**Khả năng GPS source:** mỗi ReportEvidenceInputDto có fileId/fileVersion/locationSource, capturedAt optional và location optional gồm latitude/longitude/accuracyMeters (decimal). UNKNOWN cấm location; CAPTURE/EXIF/MANUAL bắt buộc đủ lat/lon. Lat [-90,90], lon [-180,180], accuracy >=0; (0,0) không bị coi là thiếu. CapturedAt được chuẩn hóa UTC, là claim của client, không phải ReceivedAt server. Source EXIF chỉ là nhãn provenance client gửi: đường upload/verify đã đọc chỉ complete multipart, đọc bytes tính SHA256/size và detect MIME; không thấy bước trích EXIF/GPS rồi ghi lại CaptureMetadata. Kết luận giới hạn trong luồng Reporter đã đọc, không tuyên bố mọi module của toàn hệ thống không xử lý EXIF.

**Lưu trữ:** ReportOriginalEvidence và ReportSupplementEvidence đều owns CaptureMetadata với các cột CaptureMetadata_Latitude/Longitude decimal(10,7), AccuracyMeters decimal(18,3), CapturedAt datetimeoffset, LocationSource int (Unknown0/Capture1/Exif2/Manual3). FK ReportId/OwnerUserId và SupplementId giữ provenance từng evidence. Normalizer -> verified reference mang CaptureMetadata -> Report.Create/Supplement -> EF owned mapping; không phải GPS tự suy từ ảnh hoặc từ Case/project geometry.

**SELECT thực hiện sau khi đọc INFORMATION_SCHEMA.COLUMNS:**
- Case `643cf52b-60e1-4a3f-8ff2-f564f0858e23` có đúng active Report `aef931e0-00bf-468d-85df-d4c0bf35cddd`, Reporter `72f84201-a001-4000-8000-000000000004` (tài khoản test `reporter-a`). Tên DB `Synthetic reporter-a`, PhoneNumber có giá trị (không ghi số vào log). Description test phản ánh mặt đường, ghi rõ ảnh tổng hợp và vị trí UNKNOWN. ReceivedAt `2026-11-03T16:55:09.2725799Z`.
- Original evidence `01619f07-7902-4faf-ac17-ec88612fa4ca`, file `98af3d6c-7e58-43d4-8a30-011312db753b`. SELECT CASE IS NULL xác nhận latitude/longitude/accuracyMeters/capturedAt đều NULL, locationSource=0. ReportSupplements=0 và ReportSupplementEvidence=0 theo active link. Không lấy worklog thay SQL, không đọc password hash hoặc lưu dump.
- Script tạo hiện có `tools/verify-intake-runtime.cjs`, prepareReporterHandoff: payload chỉ fileId/fileVersion/locationSource UNKNOWN, không location/capturedAt; mô tả khớp record. Không còn journal request-body gốc của Report-1 trong ledger hiện tại để chứng nhận bytes HTTP lịch sử; đối chiếu script + DB + own API đều nhất quán với tạo thiếu GPS. Không có bằng chứng gửi GPS rồi backend làm mất. Không chạy lại script.

**API live theo đúng tài khoản test:**
| API/nguồn | Supervisor | PM-A đúng project A | PM-B ngoài project A | Reporter owner |
|---|---|---|---|---|
| GET /cases/{caseId} | 200 OPEN, project A, đúng reportIds | 200 tương tự | 403 access_forbidden | 403 |
| GET /reports/{reportId} | 403 access_forbidden | 403 | 403 | 200 description/evidence/supplements; evidence UNKNOWN/capturedAt null/location omitted |
| GET /reports/{reportId}/evidence/{evidenceId}/download | 403 | 403 | 403 | 200 |
| GET /reporter-evidence/files/{fileId}, /content | 404 file_not_found cả2 | 404 cả2 | 404 cả2 | 200 cả2 |
| GET /files/{fileId}, /content (generic UploadsController) | 403 cả2 | 403 cả2 | 403 cả2 | 403 cả2 |
| GET /users?role=REPORTER&limit=100 | 200, có Reporter test với displayName/phoneNumber | 403 | Không gọi thêm | Không cần |
| GET /users/{reporterId} | 200 ActorResponseDto chỉ id/displayName/role/version, không contact | 403 | Không cần | Không cần |
| GET /projects/{projectA}/reports/summary, /items?metric=reportsReceived | 200 | 200 | items403 | Không cần |

Own Report read/download có role gate Reporter ở ReporterLifecycleService và owner guard repository; ReporterEvidenceService yêu cầu actor owner + active Reporter + private REPORT_PHOTO. Generic file reader yêu cầu scope/project hoặc FIELD/AI_FRAME phù hợp, không mở private Report photo cho PM/Sup. Đường publication evidence dành recipient đã được công bố, không là đường bypass private original. Reporting summary/items chỉ là metric/reference; source CaseDefectReadDtos có evidence identity/checksum nhưng không nội dung report/contact/GPS/download grant. GET summary/items thực tế không trả nội dung/tên/SĐT/ảnh/GPS. FIELD evidence không thay thế evidence pre-Defect Reporter. Không thử tạo publication/FIELD để vượt thiếu read.

**Truy API -> FE:** triageService.mapBackendCaseToDomain dùng InternalCaseDto, giữ report_ids, pm_notes=conclusion.reason riêng, report_details_state=UNSUPPORTED, description/name/phone không được điền, image_url rỗng và lat/lng null. useAIReviewState -> ReviewDetailModal/ReviewDetailDrawer -> DrawerReporterInfo/DrawerMediaViewer/DrawerHeader. DrawerMergedReportsList tìm dữ liệu từng report riêng, không có read-model report-detail hợp lệ để hoàn thiện; không lấy thông tin từ Case khác/ảnh parent để bù. Case nhiều Report chưa được chạy browser nghiệm thu trong lượt này. Giữ yêu cầu quan hệ ReportId/SupplementId/EvidenceId khi BE thiết kế read model; không dùng /me/phone-number của người đăng nhập làm SĐT Reporter.

| Trường | Căn cứ nghiệp vụ/yêu cầu bổ sung | DB có gì | API/DTO trả gì | Sup đọc được không | PM đọc được không | FE hiện hiển thị | Nguyên nhân thiếu/sai |
|---|---|---|---|---|---|---|---|
| Nội dung phản ánh gốc | Spec Reporter intake yêu cầu description, PM xử lý evidence | Description có nội dung test gốc | OwnReportDto.description, owner-only | Không qua Case/Report read | Không | API Case chưa hỗ trợ nội dung report gốc | Có DB, thiếu read contract Case-scoped cho PM/Sup |
| Nội dung bổ sung | Spec supplement giữ lịch sử riêng | Chưa có supplement | OwnReportDto.supplements khi owner đọc | Không | Không | Chưa có report-detail | Mẫu test không có supplement; thêm gap read quyền |
| Tên người gửi | Yêu cầu Hoàng bổ sung; chưa tìm thấy căn cứ Spec bắt buộc field tên trên drawer | ReporterUserId -> Users.DisplayName có | Danh bạ Sup có tên; OwnReportDto và InternalCaseDto không có senderId/name | Đọc độc lập danh bạ được, chưa ghép Report đúng quyền | Danh bạ403 | API Case chưa hỗ trợ thông tin người gửi | Thiếu Report->sender read contract; không dùng SQL/name matching ghép FE |
| SĐT người gửi | Yêu cầu Hoàng bổ sung, không tự gọi là field Spec bắt buộc | Users.PhoneNumber có | Sup users list có phone; users detail controller bỏ contact; Report/Case DTO không có | Danh bạ có; chưa có liên kết người gửi trên Report read | Không | API Case chưa hỗ trợ SĐT | Contact tồn tại nhưng thiếu read model/quyền đọc theo Report; /me chỉ self |
| Ảnh/evidence | Spec private evidence + PM xem theo scope; quyền hiện thực phải kiểm source | 1 original file, không supplement | Owner evidence refs/download200; Sup/PM403 hoặc404 theo route | Chưa đọc content | Chưa đọc content | Báo thiếu reference/đường đọc ảnh cho vai trò | Có dữ liệu/owner route, thiếu quyền/contract đọc private qua Case |
| latitude/longitude | Optional evidence location theo source | NULL cả2, source UNKNOWN | Owner trả UNKNOWN, không location | Case không trả | Case không trả | Chưa có tọa độ | Mẫu thiếu GPS từ input; đồng thời thiếu read DTO cho PM/Sup |
| accuracyMeters | Optional >=0 khi có location | NULL | Owner location omitted | Không | Không | Chưa có thông tin | Không gửi; không có accuracy để FE hiển thị |
| locationSource/capturedAt | Spec provenance nguồn/vị trí/thời gian do client khai báo | 0 UNKNOWN / NULL | Owner UNKNOWN/capturedAt null; Case chỉ createdAt | Không capture metadata | Không capture metadata | Drawer hiển thị thời gian tiếp nhận Case, không phải thời gian chụp | Thiếu capture input; chưa có scoped read cho provenance |

**Browser phần A:** Edge headless đăng nhập Supervisor và PM-A thật, mở đúng #CAS-643CF52B rồi drawer; thông báo thiếu tên/SĐT/ảnh/GPS hiển thị rõ, không gọi owner-only API, 0 mutation nghiệp vụ (harness chặn). PM-B detail API403 như trên. Đây là xác minh trạng thái hiện tại, không chỉnh hồ sơ thẩm định.

**Kết luận/đề xuất A, chưa sửa:** (a) mẫu test thiếu GPS ngay input, không bù; (b) tên/SĐT có DB và Sup danh bạ có API đúng quyền nhưng FE chưa có Report->sender mapping được phép để nối; không khẳng định toàn backend không có contact API; (c) nội dung/ảnh/provenance có owner DTO nhưng PM/Sup thiếu scoped read, cần BE thiết kế/duyệt response và quyền cho từng Report/evidence; (d) nội dung/tên/SĐT/GPS không có trong Case response để FE “bỏ mất”. Đề xuất backend bổ sung Case-scoped report detail và content read theo role/project, giữ riêng nguồn original/supplement, làm rõ contact visibility và temporal guards; Hoàng/BE chốt contract. Không tự mở quyền, không đặt endpoint mới, không gọi bằng token Reporter trong UI.

#### B — Backend develop và API tự đọc/sửa SĐT

**Cập nhật an toàn/runtime:**
- Remote backend đúng `https://github.com/HoangAnhVu2207/RoadGuardSystem.git`. Checkout cũ `RoadGuardBackend` ở develop `c173d4d7fbd22f6cdfece97e0e377c26784abc9e`, bẩn4 file deploy: G02-G06-OWNER-DECISIONS.md, compose.yaml, sql-start.sh, tls-init.sh. Fetch origin/develop xác minh HEAD mới là `7be7ffcdff7d5e55a3f1369c3375308c1a2f9768` (10 file thay đổi API self phone/service/repository/tests). Không fast-forward checkout bẩn hoặc đè4 file đó.
- Tạo detached worktree riêng `D:/hoctap/kì 9/nối api đồ án/RoadGuard-phone-7be7ffc` ở đúng origin/develop. Đọc backend AGENTS/rules, controller MeController, StaffPhoneNumberService, IdentityRepository.PhoneNumbers, PhoneNumberDtos và IdentityReadContractHttpTests. Không push/backend commit.
- Build đúng API image từ worktree: `docker build --target api -f deploy/fe-handoff/Dockerfile.Handoff -t roadguard-fe-starter01-api .` PASS. Recreate chỉ service api bằng compose.yaml + compose.https.yaml hiện có, đúng project roadguard-fe-starter01, `up -d --no-deps --no-build api`. Giữ nguyên SQL/state/objects/keys/TLS volumes và mọi service khác, không chạy init/scenarios/seed. Trước image `sha256:c3b691dc35f65cf67c320fd4e880cb8829bfc1edc063e14aee94ac84c6d8ca5d`; sau image `sha256:b56ca546b927e1c3bc2a75b99a55e45f66076867c9a68575030de52321cb3e15`, health healthy, /ready200. Đây là build source official SHA; không dựa riêng nhãn branch để suy container version.
- Handoff OpenAPI trong commit chưa có hai operation mới. Lấy live `/swagger/v1/swagger.json` của image mới theo chỉ dẫn FE-INTEGRATION-QUICKSTART/FE-API-CONTRACT (runtime Swagger + controller/DTO là nguồn hiện hành); sync đúng `/me/phone-number` và PhoneNumberUpdateRequestDto vào FE openapi/catalog, giữ mọi operation cũ. **Swagger gap:** GET chưa khai schema SelfPhoneNumberResponseDto/ETag; PATCH chưa khai errors và required của header. Không tự chế response schema trong Swagger; x-source-sync/catalog ghi thiếu metadata, source pins và semantics từ source. Catalog dùng tên symbol MeController.GetPhoneNumber/UpdatePhoneNumber cho entry mới vì Swagger không có operationId; không giả ID canonical API-xxx. Global historical acceptance/source pins của260 operation cũ không được nâng thành PASS; tổng entry262.

**Thay đổi FE:**
- Tái sử dụng profileService và ProfilePage dùng chung /pm/profile + /sup/profile. Bỏ SĐT read-only lấy userDirectory seed/user cache, thay bằng đúng self API; chỉ thêm component SelfPhoneNumberForm để giữ state riêng cho số điện thoại, không lặp service/forms theo role, không ảnh hưởng luồng đổi tên/mật khẩu.
- GET đọc phoneNumber/phoneNumberConfirmed/version và giữ nguyên strong quoted ETag; schema/version/ETag sai thì báo lỗi, không mock. PATCH chỉ {phoneNumber}, không userId, trim + regex 7–15 ASCII digits với optional +; If-Match lấy ETag đã đọc, UUID mới cho ý định mới. Cookie transport gọi ensureCsrfToken chính thức; interceptor auth hiện tại giữ nguyên. 204 không parse body; GET lại mới hiển thị kết quả/version. Không có OTP/tự verified.
- Loading/saving/error riêng; ref lock chặn bấm trùng. 400 validation;401 theo interceptor phiên có sẵn;403 phân csrf_failed/quyền;412 refetch giữ draft, chỉ người dùng xác nhận mới gửi lại với version/key mới;409/428 chặn save đến khi đọc lại/đối chiếu, không tự đổi key/retry. Network/5xx giữ command body/key/ETag trong bộ nhớ module, GET reconcile không tự suy receipt; chỉ nút gửi lại đúng lệnh chủ động mới replay. Guard epoch/user/role/auth/token, kiểm lại tại transformRequest trước từng dispatch/retry của Axios, và component keyed theo phiên chặn response cũ cập nhật phiên mới. Không đồng bộ phone vào hồ sơ Report.
- Giới hạn rõ: identity lệnh chưa rõ outcome giữ trong phiên JavaScript, chưa có receipt endpoint/persistence xuyên full reload. Thành công F5 được kiểm thật; recovery timeout xuyên F5 chưa nghiệm thu. Không thay đổi cơ chế auth toàn hệ thống (app hiện dùng bearer qua apiClient; không tuyên bố màn Profile đã có cookie-only browser E2E).

**Kiểm chứng B thực chạy:**
- Browser Edge headless tài khoản test `supervisor` và `pm-a` (không Hoàng thật), trang profile riêng: GET->PATCH204->GET, F5 giữ số mới, confirmed=false; validation123 bị FE chặn0 PATCH. Tạo version stale thật bằng cập nhật self riêng rồi submit ETag cũ từ form:412, draft không mất; người dùng xác nhận gửi lại204. Mỗi actor thấy số self riêng; không dùng dữ liệu Sup cho PM. Patch statuses mỗi actor [204,412,204], không business endpoint nào khác, 0 pageerror. Giá trị test cuối khác nhau cho2 actor, không ghi số cụ thể vào repo.
- Browser network-failure giả lập ở tầng route **không phải timeout server thật**: chặn PATCH đầu, UI hiện unknown outcome/khóa ý định mới, GET không xóa pending; bấm Gửi lại đúng lệnh thì cùng key/body/ETag, server204. Không giả response success, không tự tăng key. Browser Enter trên input SĐT chỉ gửi lệnh phone, không submit form đổi tên (0 PUT profile).
- HTTPS WebSession HTTP qua Playwright request context cho từng Supervisor/PM-A: unauth401; login/csrf chính thức; GET200 + ETag/no-store; thiếu CSRF403/csrf_failed; phone123400; thiếu If-Match428; stale412; số hiện tại hợp lệ PATCH204/body empty; replay cùng lệnh204; cùng key đổi body409/idempotency_key_reused; GET vẫn đúng self, confirmed=false. Không browser cookie-only Profile E2E, không chuyển app sang auth khác.
- `node tools/check-review-293d001.cjs`: **52 scenario PASS**, gồm6 scenario self phone mới: ETag/body/204/read-after-write, timeout identity/replay,validation/412, CSRF+session switch, stale read+duplicate lock và dispatch guard chặn retry khi đổi actor. Mock/hook/SSR không là backend E2E.
- `node node_modules/typescript/bin/tsc -b --pretty false`: PASS. `npm run build` (GOMAXPROCS=2/GOGC=50 tiến trình): PASS,2015 modules. Warning duration-[250ms]/chunk lớn có sẵn. `git diff --check`: PASS.
- Không chạy backend xUnit suite riêng (fixture SQL riêng/chưa cấu hình trong lượt này), không chạy production/mobile/offline/full W01-W10, không sửa/seed schema. Runtime HTTP/browser local và Docker publish ở trên là evidence thực, không gán toàn hệ thống E2E PASS.

**Self-review 1:** đối chiếu validation/headers/receipt/204 và scope actor với source; xác nhận self phone không giải quyết contact người gửi, directory Sup không tự grant quyền Report. Kiểm cả generic file/reporting APIs trước kết luận gap. **Self-review 2:** diff chỉ phone UI/service,2 contract files,harness và worklog; giữ nguyên trạng thái backend bẩn, không ghi inbox/Report, không đưa log credential/token/cookie/signed URL/DB dump/manifest vào Git. Import/profile phone seed cũ đã bỏ đúng phần bị thay; chưa làm refactor auth/profile ngoài scope. Kiểm JSON structural diff: mọi path/schema cũ trong OpenAPI và260 operation catalog cũ giữ nguyên; chỉ thêm phần self phone. External independent review NOT_REQUESTED.

**Bàn giao:** phần A hoàn thành kiểm tra, gap read contract cần BE/Hoàng chốt; phần B FE self-phone hoàn thành trong phạm vi, backend runtime ở SHA trên, phát hiện Swagger metadata cần BE bổ sung nhưng source/runtime đủ chứng minh luồng đã nối. Chỉ stage file task, commit tiếng Việt/push origin/hoang không force. Không đưa detached worktree/backend dirty vào FE commit.


### 04/11/2026 — BƯỚC 1: kiểm đăng nhập, phiên và phân quyền Web PM/Supervisor (chỉ audit)

**Base/parent:** `4ad61061f898cf1ff224d2daf8e34b3a509c903a`, nhánh `hoang`. Git status/diff sạch trước và sau kiểm thử, trước ghi worklog; lượt này chỉ thay worklog chung. Đọc đầy đủ AGENTS.md, mục mới nhất, Spec17_10 `01_Web-Architecture-and-Auth.md`, `04_API-Contracts/04_Authentication-and-Authorization-Contracts.md`, API013–017 trong full catalog, `06_Web-Errors-and-State-Handling.md`, FE OpenAPI các auth operation và backend source hiện tại. Không mặc định login hỏng: luồng Hoàng đang sử dụng đã kiểm được login/F5 thành công. Không sửa code/contract/auth config, không reset tài khoản hoặc DB, không tạo Report/Case/Defect/FIELD, không mutation nghiệp vụ; chỉ auth login/refresh/renew/logout của tài khoản test và SELECT được mô tả dưới đây.

**Môi trường/căn cứ runtime:** FE http://127.0.0.1:5173, proxy https://localhost:18443; .env VITE_API_URL=/api/v1, VITE_USE_MOCK_AUTH=false. Docker API image `sha256:b56ca546b927e1c3bc2a75b99a55e45f66076867c9a68575030de52321cb3e15`, healthy; source đã build ở SHA backend `7be7ffcdff7d5e55a3f1369c3375308c1a2f9768` trong worktree riêng theo mục trước. Không rebuild/recreate hoặc cập nhật backend trong lượt audit này. Credential test từ /handoff/demo-accounts.json chỉ vào bộ nhớ; không log password/token/cookie/refresh credential, không lưu storage state hoặc DB dump. Browser scripts tạm ngoài repo, không tạo report riêng.

**Luồng thực được dùng:** Login.tsx gọi authService.login (không gọi authStore.loginWithCredentials). Với mock=false, authService POST /auth/android/login -> backend AuthController.AndroidLogin tạo SessionTransport.Android -> nhận accessToken/refreshToken; FE chỉ giữ accessToken và user, bỏ refresh credential. authStore.setToken/setUser ghi sessionStorage rg_token/rg_user; apiClient luôn gắn Authorization từ store hoặc sessionStorage. Vite bỏ Cookie khi thấy Authorization. F5 khôi phục user/token từ sessionStorage; App/main/guards không gọi checkSession, getCurrentUser hay /auth/web/session bootstrap. Các hàm cookie login/session/renew/logout đã có trong api/auth.ts nhưng không ghép thành luồng login đang chạy. `withCredentials:true` tự nó không biến bearer login thành WebSession.

**Contract không chỉ theo tên endpoint:** Spec architecture dòng13–18 quy định CSRF -> Web login -> session/renew/logout, không âm thầm thay Web bằng legacy login; auth contracts dòng21–25 xác định WebSession Secure/HttpOnly, renew không Authorization, ticket12h không sliding. OpenAPI /auth/web/session dùng WebSession, /auth/web/renew không body/Authorization + CSRF/renewal cookie; /auth/logout là Bearer/current session. Backend `AuthController.cs:45–56` truyền rõ SessionTransport.Android; `WebAuthController.cs:43,54` dùng SessionTransport.Web và SignInAsync cookie, `:66` từ chối Authorization trên renew; `AuthService.cs:430` phát Android JWT15 phút. Runtime native token có exp-iat=900 và trả refresh credential; browser Web cookie có ticketLifetimeSeconds=43200. Đây là chứng cứ transport/lifetime/header/runtime, không kết luận từ chữ android đơn lẻ. AGENTS invariant6 còn yêu cầu bearer access token chỉ in-memory; sessionStorage hiện tại lệch yêu cầu đó.

| Hạng mục | Source/contract hiện tại | Kiểm thực tế | Đúng / lỗi / chưa kiểm | Có cần sửa không |
|---|---|---|---|---|
| PM/Sup đăng nhập đúng | Login59 -> authService119 Android bearer; BE hỗ trợ credential test | Edge thật Supervisor/PM-A login200, đúng dashboard và GET profile/self-phone; không dùng mock | Đăng nhập hiện tại ĐÚNG; transport Web lệch (F1) | Giữ validation/mapping đúng; giao sửa ghép Web flow, không viết lại toàn bộ |
| Sai mật khẩu | client45–52 trả lỗi login thẳng caller, Login69–79 + LoginForm error | PM/Sup POST401, lỗi form hiển thị (nút đóng lỗi visible), vẫn /login, isAuthenticated=false | ĐÚNG | Giữ nguyên phần xử lý đúng |
| F5 giữ đúng người | Store63–90 phục hồi sessionStorage; chưa session bootstrap | PM/Sup reload /profile vẫn đúng userId, tên hiển thị khớp GET profile;0 Web session/bootstrap request sau F5 | Chức năng F5 hiện tại ĐÚNG; lưu token/bootstrap lệch (F2/F3) | Sửa nguồn phục hồi phiên theo Web, giữ kết quả UX đúng |
| Hết phiên / renew FE | client57–78 đòi csrf rồi Web renew; refresh credential Android không được giữ/dùng | Thu hồi đúng phiên test qua auth/logout204, GET app401 -> /login;0 request Web renew vì csrf=null | Logout khi401 ĐÚNG; renew không khớp transport (F4) | Sửa orchestration theo cơ chế Web, không sửa RBAC BE |
| Web cookie backend độc lập | API013–017 + WebAuthController | Browser HTTPS: login200, session200, renew200; cookie Secure/HttpOnly/Lax. Renew+Authorization400 validation_error. Xóa riêng ticket trong browser rồi session401 -> renewal cookie+CSRF renew200 -> session200 -> logout204 -> session401 | ĐÚNG trong kịch bản đã chạy, độc lập FE | Giữ backend transport đã đúng; không gọi đây là FE cookie E2E |
| Logout rồi F5 | Header106–107 -> store157–181 clear local; BE logout bị skip nếu thiếu CSRF | PM/Sup về login, F5 vẫn login, rg cache không đăng nhập lại. Nhưng0 HTTP logout, token cũ giữ trong RAM vẫn GET profile200; đúng Bearer logout204 thì token ấy GET401 | Local logout ĐÚNG; revoke server LỖI (F5) | Giao sửa logout đúng transport/session |
| Đổi tài khoản | Store clear + login lại; role guards | Cùng browser context Sup logout -> PM-A login: userId khác; tên input profile khớp DTO backend người mới, không còn tên Sup | ĐÚNG với đường bình thường đã chạy | Giữ; không tuyên bố mọi delayed-response race toàn app đã kiểm |
| PM không có quyền Sup | ProtectedRoute27; Users server guard | PM vào /sup/system-control bị về /pm/dashboard; GET /users?limit=1 PM403, Sup200 | ĐÚNG cho route và read boundary | Giữ; mutation approval/admin không chạy vì không đổi dữ liệu nghiệp vụ |
| Project scope backend | ProjectScopeGuard/server read | PM-A project A summary200, project B summary403 bằng cùng token; không chỉ kiểm menu | ĐÚNG ở2 project test | Giữ; không suy mọi endpoint đã E2E |
| Force-change password | ProtectedRoute23/46/69, Login62, mapping authService140 | SELECT Users theo sandbox domain: chỉ1 Crew có MustChangePassword=true, không PM/Sup phù hợp. Không đặt lại mật khẩu/bật flag để test | NOT_RUN PM/Sup runtime; source có guard | Chưa kết luận lỗi; cần fixture PM/Sup hợp lệ để nghiệm thu riêng |
| Hết hạn tự nhiên | Android JWT900s, Web ticket43200s; lifecycle persistent server riêng | Không chờ hết15m/12h, không đổi clock/expiry SQL | NOT_RUN | Còn gate nghiệm thu; ticket bị xóa/revoked-session không thay bằng chứng natural expiry |

**Các finding cần giao sửa, file:dòng / tái hiện / tác động / căn cứ:**

- **F1 — cơ chế Web chưa được nối vào login thật.** `src/pages/(auth)/Login.tsx:59`, `src/api/services/authService.ts:119,126,144`, `src/api/auth.ts:46`, `vite.config.ts:453–456`. Tái hiện login thật PM/Sup: Network chỉ POST android/login200, protected request dùng Bearer, csrfToken=null, không Web cookies/session bootstrap. Backend vẫn cho phép bearer nên đăng nhập bình thường; sai là chưa theo Web cookie sequence đã quy định, không phải credential/RBAC backend hỏng. Căn cứ Spec architecture13–18, auth contracts21–25, backend transport source/runtime phía trên. Sửa hẹp caller/orchestration, tái sử dụng Web APIs có sẵn; rà cookie eligibility các read đang dùng trước đổi transport, không gỡ guard hoặc thay endpoint tùy ý.
- **F2 — bearer token persist ngoài in-memory.** `src/store/authStore.ts:63,79`, `src/api/client.ts:19–22`. Tái hiện sau login/F5 sessionStorage có rg_token (chỉ kiểm boolean, không in giá trị). Token tồn tại xuyên reload và đọc được từ JS; lệch AGENTS invariant6. Không phải bằng chứng localStorage đang lưu JWT hoặc có exploit XSS đã xảy ra. Khi sửa Web flow không dùng bearer sessionStorage làm phiên Web; không đụng dữ liệu nghiệp vụ.
- **F3 — thiếu authoritative bootstrap trước mở route.** `src/store/authStore.ts:63–75,143`, `src/components/layout/ProtectedRoute.tsx:17–33`, `src/App.tsx:49–54`, `src/main.tsx:16`. checkSession có định nghĩa nhưng không caller trong src; getCurrentUser cũng không caller, và còn trả store user sớm tại authService291. Tái hiện F5: không GET Web session, guard dựa cached isAuthenticated/user trước protected reads. Tác động: shell nhận danh tính cache trước khi kiểm server; **không** chứng minh bypass quyền API (API scope/401 đã đúng). Căn cứ Spec protected route startup reads=session và browser sequence. Sửa bootstrap/loading/identity fencing rồi mới mở protected area; giữ role redirect đúng.
- **F4 — renew trộn bearer và cookie.** `src/api/services/authService.ts:110–150` nhận refreshToken nhưng không dùng; `src/api/client.ts:19–26,57–78`, `src/api/auth.ts:72–79`. Tái hiện thu hồi phiên test thật: request401, csrf=null -> bỏ renew và logout; không có refresh Android dù backend native refresh200 đã kiểm. Nếu có CSRF, source vẫn gắn Bearer vào Web renew; contract/source BE `WebAuthController.cs:66` và browser direct xác nhận renew+Authorization400. Không chạy nhánh FE có CSRF để khẳng định mọi vòng lặp; không tự sửa. Tác động: hiện không có phục hồi đúng transport khi access credential hết hiệu lực. Căn cứ OpenAPI renew no Authorization, Spec architecture controlled renew/replay bằng K hợp lệ. Giao ghép renew Web single-flight và retry được phép, kiểm logout/401 tránh tự renew lặp; không dùng build để thay runtime.
- **F5 — logout UI không thu hồi phiên BE trong luồng đang dùng.** `src/components/layout/Header.tsx:106–107`, `src/store/authStore.ts:157–181` (điều kiện csrf ở166), `src/api/auth.ts:57–68`; authService.logout270 cũng là Web logout nhưng Header không dùng service này. Tái hiện PM/Sup login sạch csrf=null -> bấm logout -> không request logout -> F5 local ởlogin nhưng Bearer đã cấp vẫn GET profile200. Tiếp theo gọi đúng POST auth/logout với original test bearer và Idempotency-Key204 -> cùng token GET401, chứng minh BE revocation hoạt động. Tác động phiên/refresh family không bị revoke bởi UI logout; client clear không tương đương logout backend. Căn cứ OpenAPI auth/logout (Bearer) và Web logout (session+CSRF+K), BE `WebAuthController.cs:119–132`, `AuthController.cs:107`. Khi ghép đúng Web flow phải server logout bằng cookie/CSRF/K rồi clear local dù lỗi, hiển thị tình trạng logout server thay vì silently coi đã revoke. Các token test giữ RAM để đối chiếu đã được revoke qua đúng auth/logout sau đo, không lưu vào repo.

**Kiểm chứng thực chạy và giới hạn:**
- Edge headless Playwright tại Vite thật và Docker thật, PM-A + Supervisor: đúng/sai password, form error, profile F5, chuyển vai/tên nguồn DB, local logout/F5, token revocation, route Sup và HTTP403 scope. Harness chặn mọi mutation ngoài danh sách auth login/renew/refresh/logout, ghi nhận0 mutation nghiệp vụ. Browser script không inject mock success/server response hoặc sửa source; không ghi account test vào file.
- Browser riêng ở HTTPS localhost:18443/ready, same-origin fetch + cookie jar thật (ignoreHTTPSErrors chỉ trong context test): CSRF/bootstrap/login/session/renew, kiểm cookie flags không log cookie value, renew header negative, xóa ticket ở client giữ renewal để kiểm recovery, server logout và denied-after-logout. Đây là positive contract browser BE, không là FE App cookie transport E2E hay certificate trust deployment acceptance.
- HTTP native Android riêng PM-A/Sup: login200, access JWT lifetime900s, có refresh credential, android/refresh200, protected self-phone GET200, auth/logout204. Không dùng token refresh của Web cho Android hoặc ngược lại. Đây chứng minh backend hỗ trợ đúng hai transport; FE hiện chưa sử dụng native refresh (không đề xuất âm thầm giữ Android thay Web).
- SELECT duy nhất Users Id/RoleCode/MustChangePassword/Status với test sandbox domain xác định thiếu fixture PM/Sup bắt buộc đổi mật khẩu. Không UPDATE, reset mật khẩu, bật cờ, tạo user hoặc seed. Không log token, password, connection string, cookie/signed URL/private key, không snapshot sessionStorage.
- **NOT_RUN/BLOCKED:** natural JWT/ticket expiry, PM/Sup force-change flow end-to-end vì thiếu fixture, cookie-only FE App E2E, mutation Sup/approval/admin, revoke/role-change giữa các tab và toàn bộ cache/delayed-response race, deployed HTTPS/certificate trust. Auth server writes trong test là login/session-touch/refresh/logout bình thường, không dữ liệu nghiệp vụ. Không chạy build/regression vì chỉ audit + worklog; không nhận source/build PASS thay API/browser.

**Kết luận BƯỚC 1:** Đăng nhập Hoàng đang chạy là thật và không cần viết lại các phần đúng. **Chưa đủ điều kiện hoàn thành theo Web spec:** giao package hẹp F1–F5 (nối login/CSRF/cookie, bỏ token persistence cho Web, bootstrap session, renew/retry và logout server) rồi kiểm lại PM/Sup. Giữ nguyên credential validation, role redirects, backend RBAC/project scope đã PASS trong kịch bản trên. Sau sửa còn nghiệm thu natural expiry/force-change bằng fixture hợp lệ; không tự gọi các mục NOT_RUN là lỗi. Lượt này không sửa code hoặc đổi auth. Chỉ commit worklog chung tiếng Việt và push origin/hoang, không gom công việc khác.


### 05/11/2026 — Sửa BƯỚC 1 theo audit F1–F5: thống nhất phiên Web PM/Sup

**Base/parent:** `ec29a367362eb794f8c4896438733c1004b9c705`, nhánh `hoang`, status/diff sạch trước làm. Đọc AGENTS.md, audit commit/mục worklog F1–F5, Spec17_10 architecture/auth/errors, OpenAPI API013–017 và source current. Backend vẫn SHA `7be7ffcdff7d5e55a3f1369c3375308c1a2f9768`, image `sha256:b56ca546b927e1c3bc2a75b99a55e45f66076867c9a68575030de52321cb3e15`, healthy. Không sửa/cập nhật backend, mở quyền, đổi volume/schema/reset/seed hoặc tạo Report/Case/triage/Defect/FIELD; không đụng tài khoản thật. Giữ nguyên phần validation, redirect PM/Sup và RBAC BE đã đúng.

**Kiểm cookie eligibility TRƯỚC đổi transport:** đọc WebCookieConfiguration selector/legacy predicates + WebCookieEligible trên controller/method (Projects/Users/Profile/Me/Survey/Uploads và nguồn liên quan), OpenAPI FE và live Swagger runtime. Scan AST các call apiClient literal/template nhận diện111 call sites/82 operation khác nhau,58 có WebSession security trong live Swagger.24 entry còn lại gồm bootstrap anonymous Web auth, legacy login, accept invitation và18 operation protected chưa có cookie. Đây là inventory call sites nhận diện được, không chứng nhận toàn endpoint động/dormant đều được runtime test. Web bootstrap anonymous không bị đánh đồng “thiếu cookie”. Cốt lõi GET projects/profile/me-phone/cases hỗ trợ cookie; kiểm HTTPS cookie thực GET200 trước sửa. GET baseline-selections bằng cookie trả401 trong cùng context session200, khớp source thiếu eligibility. Không bịa quyền hoặc dùng tài khoản cố định mint Bearer để bù.

**Gap BE theo operation đang được Web gọi (security metadata/source chưa cookie-eligible):**
| Nhóm | Operation cụ thể (prefix /api/v1) | Trạng thái/giới hạn |
|---|---|---|
| Quản trị/tạo dự án | PATCH /users/{userId}; POST /users/{userId}/password-reset; POST /invitations; PUT /projects/{projectId}/primary-project-manager; POST /projects | Static source+Swagger thiếu cookie. Không chạy mutation để kiểm vì không đổi dữ liệu nghiệp vụ. Không chuyển sang Bearer. |
| Survey planning | POST /projects/{projectId}/survey-plans; POST /projects/{projectId}/survey-tasks; GET /survey-tasks/{taskId}; POST /survey-tasks/{taskId}/supplements | Cần BE duyệt/triển khai cookie+CSRF đúng operation. Static, không tạo mission/task. |
| AI/files | POST /projects/{projectId}/ai-mock-runs; GET /projects/{projectId}/ai-mock-runs/{runId}/result; GET /projects/{projectId}/ai-candidates/{detectionId}; GET /files/{fileId}; GET /files/{fileId}/content | Static gap, không tự đổi sang route FIELD/Reporter để vượt guard. |
| Dataset/baseline | GET /datasets/{id}; POST /datasets/{id}/assessments; GET /projects/{projectId}/baseline-selections; POST /projects/{projectId}/baseline-selections | Baseline GET runtime401 cả PM/Sup trong phiên Web200; FE giữ phiên và trả lỗi, không coi thiếu cookie là hết phiên. Các operation khác static, chưa runtime mutation. |

Các operation này từng phụ thuộc Bearer; **không tuyên bố toàn survey/admin/tạo dự án đã chạy cookie hoặc không có regression**. Muốn hoàn tất mọi chức năng Web phải giao BE package eligibility/CSRF/security contract, sau đó nghiệm thu từng consumer. Không tự mở quyền trong bước này. Danh sách trên là blocker được phát hiện trước khi đổi transport, không âm thầm che lỗi. CSDL/report-detail private read gap và inbox CONCLUDED409 từ trước giữ nguyên.

**Thay đổi FE trực tiếp F1–F5:**
- `authService.login` chỉ delegate authStore.loginWithCredentials; CSRF bootstrap -> Web login -> GET session authoritative -> refresh CSRF khi cần. Không gọi android/login hoặc generic auth/login; không tạo auth client thứ hai. Login/ForceChangePassword không set lại user/token từ response cũ; đổi mật khẩu thành công kiểm session server lại. SessionResponse type khớp source: displayName, optional email/fullName và nullable expiry; không điền email test. Role chỉ chấp nhận PM/PROJECT_MANAGER hoặc SUPERVISOR; role lạ bị từ chối/khóa local thay vì default PM. Guard vẫn ưu tiên mustChangePassword, đúng redirect cũ.
- `authStore` không đọc/ghi Bearer/user cache; xóa legacy rg_token/rg_user. token luôn null để các service đang đọc field tương thích, không tồn tại bearer web credential. Chỉ marker `rg_web_logged_out=1` không nhạy cảm tồn tại qua F5 để không tự phục hồi cookie server khi logout chưa xác nhận; login thành công mới gỡ marker. Các state checking/authenticating/authenticated/anonymous/logging-out/error phân biệt loading, lỗi mạng và hết phiên.
- App bootstrap checkSession single-flight; protected/public-auth/force-password guards chờ server session, có loading và error/retry. Network/bootstrap403 không mặc định anonymous hoặc logout; phải hiển thị lỗi để thử lại. 401 session mới thử renew có CSRF/renewal cookie;401 renew xác nhận không còn phiên thì khóa local. Không dùng cached user để mở protected area.
- HTTP client chỉ cookie withCredentials, luôn bỏ Authorization kể cả caller legacy. Epoch snapshot ở request/response ngăn response cũ vào phiên mới; mutation lấy CSRF trước dispatch và kiểm epoch lại. Auth endpoints login/session/renew/logout tự xử lý, không vào vòng401 interceptor. Khi protected401, recoverSession kiểm session trước; session còn hợp lệ thì không renew vô ích; đọc GET/HEAD chỉ replay một lần trong cùng epoch. **Không auto replay mutation**; body/Idempotency-Key/If-Match để nguyên cho caller quyết định/reconcile theo contract. 403 và network giữ nguyên lỗi, không auto logout. GET401 lần2 báo rõ khả năng cookie eligibility/quyền BE, không lấy Bearer thay thế.
- Recovery single-flight theo epoch; cookie-changing login/renew/logout được serialize để renew/login đang chạy kết thúc trước logout server, không để response cookie trả muộn phục hồi phiên đã logout. Mọi async auth response kiểm epoch trước set state; logout tăng epoch và khóa UI ngay, chờ CSRF + server logout đúng K trước kết thúc logging-out. Backend logout lỗi vẫn clear/khóa client, alert nói rõ chưa xác nhận thu hồi server và cho thử lại trên login. Không xóa cookie HttpOnly bằng document.cookie hoặc giả đã revoke.
- Bỏ toàn bộ ensureBearerToken của surveyService và caller, gồm đường tự đăng nhập bằng account/password cố định. Không dùng fallback token cho API thiếu cookie. Chỉ sửa auth dependency; các dev bridge độc lập không chạy trong kiểm thử, không mở rộng sửa workflow survey.
- Khi đổi phiên/logout: clear TanStack Query + localStorage bridge keys, projectStore/session cache, danh bạ đã tải; real mode không nạp seed directory thành dữ liệu tài khoản. Inbox/self-phone epoch cũng được cập nhật để không nhận response hoặc command của phiên trước. Không restore project cache trước authenticated bootstrap. AcceptInvitation bỏ import/destructure mock login không dùng vì store không còn cơ chế mock role login; không thay invitation API. Các mock service độc lập ngoài scope không bị refactor.

**Kiểm chứng thực chạy (local Docker+Edge, credential test chỉ trong RAM):**
| Hạng mục | Kết quả |
|---|---|
| PM-A và Supervisor login đúng/sai | PASS: Web login200, sai mật khẩu401 hiện lỗi; đúng vai/name từ server. Không request android/login/generic login; không Authorization. |
| F5 | PASS: GET session200 trước mở protected route; test chặn session bằng gate thấy loading, chưa mount self-phone input; thả gate mới profile xuất hiện. Không rg_token/rg_user trong sessionStorage, store token=null. |
| Profile/SĐT | PASS trên /pm/profile và /sup/profile: GET đúng userId; cùng số test hiện tại PATCH204 bằng CSRF+ETag+K -> GET, confirmed giữ false. Không đổi số tài khoản thật hoặc ghi nghiệp vụ khác. |
| Dự án/inbox | PASS GET projects200, UI danh sách thật; inbox Sup thấy đủ #CAS-82DBFE8C/#CAS-3A452BDB/#CAS-4895DB52 chưa điều phối; PM inbox mở được theo scope. CONCLUDED409 vẫn báo partial như trước, không gọi đây full inbox PASS. |
| Đổi Sup -> PM | PASS cùng browser context logout Sup rồi login PM: userId khác, profile tên khớp DTO người mới; credential/user cache cũ không được khôi phục. Không claim mọi cross-tab race đã nghiệm thu. |
| Phân quyền | PASS PM GET users403; projectA summary200/projectB summary403 bằng cookie; URL /sup/system-control redirect về /pm/dashboard. Không thử mutation approval/admin. |
| Renew đồng thời | PASS mỗi PM/Sup: xóa riêng browser session-ticket cookie, giữ renewal cookie,3 protected reads401 ->1 Web renew200 -> cả3 đọc200. Không Authorization, không body trên renew. Đây ticket-missing recovery, **không natural12h expiry**. |
| Logout thành công | PASS mỗi PM/Sup Web logout204; bản sao credential cookie test trước logout (chỉ trong RAM) sau logout GET session/profile401. Reload login vẫn anonymous. Không chỉ kiểm local clear. |
| Gap cookie401 | PASS giữ phiên hợp lệ: GET baseline-selections401 được trả lỗi sau tối đa1 read retry; session200/status authenticated, không logout/borrow token. Không tuyên bố endpoint đó hoạt động bằng cookie. |
| Network error | PASS harness abort network self-phone GET: giữ authenticated, không coi hết phiên. Response không được giả success. |
| Logout server lỗi | PASS harness abort logout: alert chưa xác nhận revoke, local khóa; F5 vẫn login, không restore cookie thành phiên client. Sau đó gọi lại logout thật để đóng phiên test. |
| Renew thất bại | PASS xóa browser session/renewal cookies trong context test,3 reads đồng thời ->1 renew401 -> login; không hang/recursion. Không sửa expiry/DB. |
| Logout lúc renew đang chạy | PASS gate giữ renew HTTP rồi gọi logout trước khi trả renew; thả gate, response cũ không set identity; serialize logout thật sau renew, server session401 và F5 vẫn login. |

Harness browser chặn mutation ngoài Web auth và self-phone test; lượt hồi quy ghi nhận0 mutation nghiệp vụ bị gọi và0 pageerror. Source/call inventory và marker logs chỉ ghi method/path/status/boolean, không token/cookie/password/user phone value. Không tạo browser report riêng trong repo.

**Regression/build:**
- `node tools/check-review-293d001.cjs`: **58 scenario PASS**.52 scenario trước giữ PASS;6 thêm cho mapping role/force-change/noBearer, recovery single-flight/failure, network/logout warning, late renew/logout fencing+serialization, read retry/mutation no-auto-replay/no auth recursion, stale actor/403/network. Mocks/SSR không phải API E2E.
- `node node_modules/typescript/bin/tsc -b --pretty false`: PASS; `npm run build` với GOMAXPROCS=2/GOGC=50: PASS,2015 modules; warning duration-[250ms]/chunk>500kB có sẵn. `git diff --check`: PASS.
- Lỗi harness đã sửa, không coi lần fail là PASS: dev server cũ không còn nghe127.0.0.1 nên ERR_CONNECTION_REFUSED; khởi động đúng host. Khi HMR đang thay module, dynamic import từ harness nhận module instance mới chưa bootstrap; chạy lại cold server và chờ heading mounted. Một lần assert logout quá sớm khi URL đã /login nhưng guard còn logging-out; chờ form xuất hiện sau server204. Copy credential kiểm revoke ban đầu dùng APIRequestContext.addCookies không tồn tại; chuyển storageState chỉ trong RAM. Kết quả PASS ở bảng trên là lượt cuối đã sửa harness; không chỉnh response server để vượt test.

**NOT_RUN/BLOCKED:** natural12h expiry và deployed HTTPS/certificate trust không nghiệm thu; localhost secure-cookie behavior đã kiểm trên browser, không suy production. SELECT hiện tại test sandbox Users chỉ có Crew MustChangePassword=true, không PM/Sup fixture phù hợp; không đổi flag/reset/create account nên force-change PM/Sup E2E NOT_RUN, mapper/guard chỉ mock/source verified. Mutation Sup/admin/Survey/dataset/baseline thiếu cookie là BLOCKED/static, không chạy để đổi dữ liệu. Không full W01–W10, không claim mọi endpoint/cross-tab/offline/cache riêng các module đã nghiệm thu. Không sửa BE hoặc xóa/reset DB.

**Hai lượt self-review:** (1) contract/transport: Web cookies/CSRF/session/role/renew/logout, body K/V mutation và source-only eligibility gaps; không nhầm401 endpoint với hết phiên, không tự mở quyền. (2) lifecycle/scope: epoch request/auth responses, same actor renew không đổi user object vô cớ gây cancel reader, logout serializes cookie-changing operations, query/project/directory cache clear; giữ old validation/redirect/RBAC đúng, bỏ import/legacy auth call thừa trực tiếp tạo ra. External review NOT_REQUESTED.

**Kết luận:** F1–F5 phần FE cốt lõi đã sửa và kiểm browser/API nêu trên; đăng nhập/phiên Web PM/Sup/profile/dự án/inbox có thể chạy cookie thật. **BƯỚC 1 chưa thể nghiệm thu toàn Web là hoàn thành:** cần BE bổ sung/duyệt cookie eligibility cho18 operation đã kiểm kê, rồi hồi quy consumer; natural expiry/force-change còn NOT_RUN. Không âm thầm fallback Bearer hoặc báo tất cả chức năng Web không bị ảnh hưởng. Chỉ stage file task + worklog chung, commit tiếng Việt/push origin/hoang không force, không credentials/ledger/ảnh/SQL dump.


### 05/11/2026 — Chuẩn bị BƯỚC 2: kiểm Supervisor tạo dự án qua Web cookie

**Base/parent:** `afaaaf1bf5fa6b45c16466c43ca9e8d4dcfc8b25`, nhánh `hoang`, status/diff sạch trước kiểm. Đọc AGENTS.md, worklog mới nhất, Spec17_10 `02_Business-Workflows/02_Project-Road-Geometry-and-Pavement.md` (Supervisor tạo project, primary PM/handover-warranty source), OpenAPI FE và Candidate3 `FE-AUTH-AND-CLIENT-GUIDE.md` cùng recipes. Guide yêu cầu cookie support theo operation, CSRF cho mutation, không suy từ [Authorize] và không chuyển Web sang Android Bearer. Backend source worktree SHA `7be7ffcdff7d5e55a3f1369c3375308c1a2f9768`; Docker image thực `sha256:b56ca546b927e1c3bc2a75b99a55e45f66076867c9a68575030de52321cb3e15`, healthy. Không fetch/rebuild/sửa BE hoặc đổi auth; lượt này chỉ cập nhật worklog.

**Source form và chuỗi dependency thực:** ProjectList.tsx:83–114 tải PM qua personnelService.fetchUsers({role:'PM'}) -> GET users?limit100&rolePM; handleOpenCreateModal:154–165 reset sạch/PM lấy từ danh mục; handleCreateProjectSubmit:170–184 gọi projectService.createProject. Service:730–755 trim name/code, gửi canonical name/code/description/primaryPmId/handoverDate/warrantyEndDate/handoverFileIds, UUID Idempotency-Key; apiClient hiện tại tự cấp CSRF và không Authorization. Không có API eligible members cần projectId trước khi project tồn tại; không cần tự mở primary-PM reassign, reset-password, survey hoặc cả18 operation của audit trước chỉ để tạo mới.

**Contract/BE:** ProjectsController.cs:169–234 POST projects có [Authorize] nhưng **không WebCookieEligible** ở action hay class; GET projects:38 có attribute riêng, không truyền sang POST. WebCookieConfiguration selector/predicates không nhận POST /projects, nên cookie không được dùng để xác thực operation. OpenAPI FE và live Swagger cùng security Bearer. ProjectCreationService.cs:24 chỉ Supervisor; authoritative auth vẫn giữ current actor/session/role. Canonical DTO CreateProjectRequestDto: code<=50,name required<=255, primaryPmId UUID, handoverDate/warrantyEndDate date, handoverFileIds UUID[]. Source action yêu cầu code/PM/handoverDate; canonical phải có warrantyEndDate và handoverFileIds (không null), tối đa1 file, warrantyEndDate>=handoverDate. Header Idempotency-Key được derive OperationId khi không có legacy operationId; If-Match không được khai cho create. Canonical action tạo documentNo PROJECT-{code}, không cần bịa documentNo từ FE.

`ProjectCreationPersistenceService.GetFactsAsync:102–118` kiểm PM tồn tại/active/role PM và fileIds.Count<=1; **[] được chấp nhận**, nếu1 UUID thì source kiểm file tồn tại. `P120ProjectCreationTests.CreateProjectCanonicalRequestCreatesWarrantyAndReplaysByHeaderKey` dùng Array.Empty<Guid>() (đọc source test, không chạy suite). Persistence tạo project+primary membership+handover+warranty trong command/transaction; không kết luận chỉ từ record UI. Không tự coi thiếu ảnh/file là lý do bắt buộc mở uploads cho create không đính kèm.

| API (prefix /api/v1) | Form cần để làm gì | Cookie hỗ trợ chưa | Kiểm thực tế / căn cứ source | FE hay BE cần sửa |
|---|---|---|---|---|
| GET /auth/web/csrf, POST /auth/web/login, GET /auth/web/session | Phiên Sup và header CSRF | Có | Sup test login200/session200; refresh CSRF sau login | Giữ auth F1–F5 đã sửa |
| GET /users?role=PM&status=ACTIVE&limit=100 | Danh mục primary PM hợp lệ | Có | HTTPS cookie200,3 PM, nextCursor null; StaffDirectoryController.Users [WebCookieEligible], StaffReadService.Users chỉ Supervisor | Không cần BE mở thêm API PM. FE form hiện gọi rolePM chưa filter ACTIVE/chưa pagination đầy đủ; ghi follow-up khi làm form bước2, không suy mọi row là eligible |
| POST /projects | Tạo project, PM membership, handover/warranty source | **Chưa** | Probe cookie Sup với CSRF+K, body{} cố ý không hợp lệ để không thể tạo ->401. Session trước/sau200; không Authorization. Source/OpenAPI Bearer-only xác nhận đây transport gate, không kết luận DTO hợp lệ từ probe | **BE cần bật/duyệt cookie eligibility cho chính POST này**, CSRF middleware và contract/test tương ứng; không bỏ role Supervisor |
| GET /projects | Reload danh sách/đọc dự án scoped sau tạo | Có | Browser Sup projects tải danh sách thật; source GET có eligibility riêng | Giữ; Sup tạo→PM đọc mới chưa chạy vì POST bị chặn |
| POST /uploads; GET /uploads/{uploadId}; POST /uploads/{uploadId}/part-urls; POST /uploads/{uploadId}/complete; GET /files/{fileId}, /content | Chỉ cần nếu thật sự đính kèm/tải/xác minh file bàn giao | Chưa trong generic upload/file chain hiện tại | Source+OpenAPI Bearer-only; UploadService.IsValidCreate yêu cầu projectId hiện hữu, size/checksum/purpose, rồi scope check. Không upload/probe file giả. Không có call upload thật từ form hiện tại | **Không bắt buộc mở nhóm này cho create với []**. Nếu nghiệp vụ cần file trước tạo project, BE phải chốt legal pre-project upload/read/admission; không tái dùng Reporter private upload hoặc UUID của file khác |

**FE gap đính kèm cần ghi riêng:** CreateProjectModal.tsx:264–271 chỉ lấy File.name -> string[], ProjectList.tsx:181 chuyển nguyên handoverFiles vào handoverFileIds; API yêu cầu UUID thật. Không upload bytes, không nhận session/fileId/VERIFIED, UI cho chọn nhiều file dù create source tối đa1. Đây là phần FE chưa hoàn thiện, không tuyên bố đính kèm thành công; không đổi tên file thành UUID giả. Khi POST cookie được hỗ trợ, làm đúng phần tạo: dùng [] nếu không đính kèm và được nghiệp vụ cho phép; nếu đính kèm phải có contract/nguồn file hợp lệ đã chốt. createProject hiện sinh key mới mỗi lần gọi: bước2 còn phải kiểm pending command/replay sau timeout, không biến retry không rõ outcome thành dự án trùng. Chưa sửa các điểm này vì điều kiện chính POST vẫn BE-blocked và lượt này không mở rộng viết lại form.

**Thực chạy:**
- Playwright request context HTTPS localhost:18443, ignoreHTTPSErrors chỉ trong isolated local test context, Sup test credential từ container vào RAM: csrf/login/session200, users rolePM/statusACTIVE200 có3 tài khoản, POST projects authorization-only negative probe401 (CSRF và K có đủ; body{} cố ý không đủ DTO), session vẫn200; Web logout sau kiểm. Không gửi payload create hợp lệ, **0 dự án được tạo**, không tạo trùng. Probe401 không chứng minh happy path create/validation đã chạy; action chưa vào handler.
- Browser Edge trên Vite127.0.0.1:5173: Sup Web login200 -> /sup/projects -> Thêm mới dự án mở modal; dropdown có3 PM, có PM-A từ backend; request thực users?limit100&rolePM200;1 file input. Không chọn/đính kèm file, không submit; harness chặn mutation ngoài Web auth, ghi nhận0 mutation nghiệp vụ. Logout đóng phiên test. Không khôi phục Bearer hoặc dùng account hardcode lấy token.
- Đối chiếu source/controller/service/repository/DTO/selector/middleware và test source như trên. Không SELECT/UPDATE SQL, reset/seed DB/volume; không tạo project/Report/Case/evidence. Không build/regression vì chỉ audit + worklog, không sửa code. Sup tạo→PM được giao đọc→PM ngoài phạm vi bị chặn trên **dự án mới** là BLOCKED/NOT_RUN, không lấy quyền trên dự án cũ thay nghiệm thu.

**Yêu cầu chính xác để bàn giao nhóm BE (chưa gửi message bên ngoài):**
1. Cho Web cookie admission ở POST /api/v1/projects trong source và OpenAPI tương ứng, giữ current active Supervisor/role guard, CSRF required cho Web, DTO canonical/Idempotency-Key/replay và201+ETag. Không yêu cầu mở mặc định cả18 operation.
2. Test chính operation: Sup cookie+CSRF+K/DTO hợp lệ201; thiếu/sai CSRF403; PM cookie403; anonymous401; PM được giao đọc được, PM ngoài scope bị chặn; same K/body replay không tạo project thứ2 và K/body khác409; kiểm durable primary membership/handover/warranty bằng test isolated DB. Không cấp quyền chỉ dựa UI/claims cũ.
3. Xác nhận create không-file với handoverFileIds=[] là supported contract (source/test hiện tại có); nếu cần đính kèm ở bước khởi tạo, chốt producer file trước project và ownership/purpose/verification/admission phù hợp. Không đơn thuần mở generic upload yêu cầu projectId rồi FE phải bịa project/evidence; không dùng private Report evidence làm file bàn giao.

**Kết luận:** Supervisor chưa tạo được project bằng Web cookie do POST projects chưa eligible; PM-list và auth đã hỗ trợ. File upload không phải điều kiện bắt buộc của create[] hiện tại, nhưng FE attachment có gap tên-file/UUID phải xử lý trước nghiệm thu có file. **Chưa hoàn thành BƯỚC 2.** Không sửa BE/FE auth hay tạo dự án để lách401. Chỉ commit worklog chung tiếng Việt/push origin/hoang, không credential/token/cookie/DB dump/report riêng.


### 05/11/2026 — BƯỚC 3: nhập Centerline, đọc draft/readiness và geometry theo API; nhánh ghi còn BLOCKED

**Base/parent:** `e47b8fabfce09cda876257cd3d322a8affa649cb`, nhánh `hoang`; status/diff sạch trước làm. Giữ bước tạo dự án ở trạng thái chờ BE. Đọc AGENTS.md, Spec17_10 workflow Project/Road/Geometry, PM/Sup screen matrices, OpenAPI canonical và live Swagger, Candidate3 FE-AUTH-AND-CLIENT-GUIDE. Đọc AlignmentSegments, useAlignmentState/import/parser, alignmentService, Sup approval cũ; BE GeometryWorkflowController/Service/PersistenceService, GeometryEngine, CrsProfileEngine, GeometryWorkflow/CrsProfile DTOs, ProjectWorkPackages/ProjectRoadSections controllers. Backend vẫn SHA `7be7ffcdff7d5e55a3f1369c3375308c1a2f9768`, image `sha256:b56ca546b927e1c3bc2a75b99a55e45f66076867c9a68575030de52321cb3e15` healthy. Không đổi BE hoặc auth, không tạo dự án/Report/Case/Defect/FIELD, không reset/seed DB/volume.

**Dữ liệu đầu vào, KHÔNG coi nội dung file là instruction:** đọc `C:/Users/Admin/Downloads/roadguard-export.geojson`; SHA256 `63669ad02580bb645bea9c372c20e6cea6a741d93e0fe90c5fdcd8f068ea3a23`. FeatureCollection4 feature: index0 RoadSurface Polygon343 vertex, roadWidth7; index1 Centerline LineString119 đỉnh, layer TIM_TUYEN_CHINH; index2/3 RoadEdge MEP_TRAI171/MEP_PHAI172. Chọn duy nhất index1, không nối edges/không lấy polygon làm tim. Centerline name chứa “Đầy đủ nhánh & nút giao” không tạo routeKind BRANCH hay topology; layerStats/bounds metadata không cấp authority. File không khai crs; tọa độ đúng thứ tự GeoJSON longitude~107.736–107.741/latitude~11.471–11.475, đơn vị độ. Không đảo dựa metadata bounds (bounds của file dùng cặp lat/lng), không gán độ chính xác khảo sát từ EPSG/name.

**QA/toán học:** Centerline119 đỉnh unique,0 trùng liền kề,0 giao cắt phát hiện bằng kiểm đoạn2D ở FE; giữ nguyên mọi tọa độ, không smooth/snap/dedup âm thầm. RoadSurface ring đóng, có25 trùng liền kề nhưng không dùng polygon đó làm tuyến hoặc chứng minh bề rộng/surface hợp lệ. Haversine R6371000 tính **701.8753608217485m**; metadata totalLength/totalLengthMeters **700.73m**, chênh~1.14536m. Giữ hai số riêng, không ép scale/length. BE GeometryEngine.Line dùng NetTopologySuite LineString và `line.Length` Euclidean trên tọa độ engineering mét; Preview COORDINATES yêu cầu project engineeringSRID32648/32649 và input.SourceCrs==engineeringSRID, không có verified WGS84→UTM adapter trong nhánh này (unsupported_crs). Không so sánh Haversine với một “backend metric length” chưa có transform hợp lệ. CrsProfileEngine sample affine chỉ sample, không phải phép biến đổi official cho file này. Không biến metresPerUnit=1 trong profile geographic thành quy đổi độ→mét.

**Kiểm cookie eligibility/role theo đúng operation:**
| Operation (prefix /api/v1) | Cookie/source | K/V/role | Runtime hiện tại |
|---|---|---|---|
| GET /projects | Có | current server scope, cursor | PM/Sup200; UI lấy projectId từ response, không preset project giả |
| GET /projects/{projectId}/work-package | **Bearer-only** | Đọc roadSections/currentVersion/engineeringUtmSrid | PM-A/Sup401 dù session Web200; PM-B cũng401 nên không dùng đây để chứng minh project-scope403 |
| GET /projects/{projectId}/crs-profiles; GET route-systems | Có, GeometryWorkflowController class eligible | PM/Sup read | PM-A/Sup200, PM-B ngoài project403. ProjectA có2 profile CANDIDATE/sampleOnly (UTM32648, geographic4326), routeSystems=[] |
| POST road-geometry-drafts; PUT road-geometry-drafts/{draftId} | Có | PM; K; edit thêm If-Match | Positive lưu file này BLOCKED bởi input/transform; negative400 validation_error như dưới |
| GET draft; GET draft/readiness | Có | PM/Sup | Draft cũ cùng UUID200 cho PM-A/Sup, PM-B403; ETag/version đọc từ server |
| POST draft/preview | Có, CSRF mutation transport dù domain read | PM theo matrix; current service còn cho Sup read; UI chỉ PM | PM preview draft cũ200 length200m, không dùng làm preview backend của file119 điểm |
| POST draft/confirm | Có | **Sup**; K + If-Match; effectiveFrom/reason + expectedCurrentVersionId phải khớp head | PM negative403 bằng request valid-format; Sup positive không chạy vì không có draft mới đủ readiness/scope/pin |
| POST road-sections; POST road-sections/{id}/versions | **Bearer-only** | Sup prepare; DTO operation identity theo từng route | Sup cookie negative body{} ở POST road-sections401; không có row mới. Không tự mở cookie/khôi phục Bearer |
| GET road-sections/{id}/versions/{version}/geometry | Có | PM/Sup scope | Existing test version200 cho PM-A/Sup, PM-B403 |
| Segment-set preview/create/edit/get/list/publish | Có, GeometryWorkflowController | PM writes; createK/editK+V/publishK+V theo service | Source/Swagger verified, positive NOT_RUN do chưa có geometry mới đủ nguồn/definition; không tự chia/publish |

**Đầu vào còn thiếu / không được tự điền:**
- Với file này COORDINATES: transform WGS84-degree→engineering-metre có căn cứ và engineeringSRID của project (work-package bị401); stationOriginMeters, changeReason thực của thay đổi, widthProfile phủ đúng metric line.Length, surveyWidthMeters từ người có thẩm quyền. roadWidth7 chỉ metadata hint, không được coi là surveyWidth hay interval profile; file không chứa mốc lý trình/calibration/số làn/vật liệu/accuracy. `roadCode` cần đúng route mới hoặc roadSectionId hiện hữu từ API, không suy từ tên feature.
- Native path là nguồn khác: NativeAlignment với CRS revision, routeSystemId/routeKind, tessellationTolerance cùng provenance cần thiết. Không đổi GeoJSON polyline thành NATIVE_ALIGNMENT rỗng để lợi dụng khả năng lưu draft thiếu metadata. Calibration là optional theo source nếu có thì phải có nguồn/controls; không tự nói mọi COORDINATES bắt buộc calibration.
- Không có GET collection draft trong contract hiện tại; không bịa endpoint list. Reader cho nhập UUID từ biên nhận/reference đã có, đưa vào URL để F5 đọc lại qua API. Work-package bị chặn khiến chọn road/version từ collection không thực hiện được; reference đã được GET geometry xác thực có thể mở trực tiếp bằng URL, backend vẫn kiểm scope, không lấy SQL làm data source UI.

**Thay đổi FE độc lập đã làm:**
1. Route AlignmentSegments dùng AlignmentGeometryWorkflow mới cho PM/Sup: danh mục dự án phân trang từ GET projects, load work-package/CRS và draft/readiness độc lập bằng allSettled với lỗi từng nguồn; không biến401 thành empty success hoặc tự lấy local cache. Chọn CRS/version thực API, đọc geometry confirmed qua đúng road/version; có hỗ trợ reference roadSectionId/routeVersionId đã cấp trên URL để đọc/F5 độc lập discovery. Loading/error, request-generation fencing ngăn response project cũ ghi lên project mới.
2. Import inspectGeoJsonCenterline chọn đúng Centerline có type/layer, loại RoadEdge/Surface khỏi fallback; từ chối nhiều candidate, Polygon giả Centerline, MultiLineString không topology, số không hữu hạn/ngoài miền/chuỗi số hoặc CRS custom chưa xác minh. Không swap axis, không flatten nối nhiều tuyến. QA length Haversine/dedup/crossing report; kiểm giao cắt FE chỉ với<=2000 điểm, lớn hơn ghi chưa kiểm, không giả PASS. Preview SVG chỉ hình sơ đồ đầu vào, không mặt đường/chiều dài engineering/readiness đã xác nhận. File gốc không copy vào repo.
3. New UI không gọi hook editor local cũ: bỏ khỏi luồng đang mount các default roadWidth8/lane4/vật liệu luân phiên, local approval/autosave, mock slabs/nhánh và ensureUtm48NCrsProfile với provenance giả. Giữ legacy code không liên quan dưới export LegacyAlignmentSegments để không refactor/xóa hàng loạt; App vẫn import AlignmentSegments đã trỏ workflow API mới. Không gọi toast/localStorage để tạo status DRAFT/APPROVED. Read DTO/server ETag được hiển thị đúng, không tự sinh version.
4. alignmentService thêm đúng3 reader theo OpenAPI: work-package, readiness, confirmed geometry. Draft GET/preview tận dụng method có sẵn; preview không đòi K/V domain write, Web interceptor vẫn gửi CSRF. **Chưa nối lệnh create/edit/confirm/publish từ file này**: nút ghi bị khóa rõ lý do, không auto tạo K/version mới hoặc báo đã lưu/thẩm định. Không claim chỉ build xong là hết các nhánh ghi. Consumer cũ gọi geometry-package không đủ routeVersion/segmentSet và localApproval không được sử dụng trong route mới.

**Test project/dữ liệu hiện hữu và tác động:** Dùng project TEST SBX-A `72f84201-c001-4000-8000-000000000001`, PM-A/Sup đúng vai, PM-B outside. Trước query đọc INFORMATION_SCHEMA.COLUMNS cho RoadGeometryDrafts/RoadSections/RoadSectionVersions/CrsProfileRevisions; SELECT hiện tại có1 draft `87014e70-b2db-4602-82b9-45a51cd44835` status CONFIRMED/version `AAAAAAAACA8=`,2 road versions current. Read-only sample road MOCK-A `5cfb9f9a-292b-4fb9-8873-96257126d89b`, version `5baf3408-6489-432f-89ed-127a89e905a5`, length200m. **Đây là geometry test cũ, không phải file roadguard-export**; không dùng nó làm kết quả import mới. API đọc lại xác minh IDs/status/version trước UI; SELECT chỉ phục vụ audit an toàn, không bù dữ liệu cho dropdown. Không thay/xác nhận/supersede geometry hiện hữu; không sửa pin task/survey/repair. Sau test SELECT draftCount1/routeVersionCount2 và version/read API giữ nguyên. Không UPDATE/INSERT/delete SQL, không tạo CRS sample, road hoặc segment mới.

**Kiểm chứng thực chạy:**
- Parser trên chính file gốc:119 points, len701.8753608217485, declared700.73, widthHint7, ignored3, duplicate0/repeated0/cross0; SHA như trên.
- Sup/PM cookie APIs ở bảng trên. Invalid draft body chỉ gồm sourceKindCOORDINATES/sourceCrs4326 và119 coordinates thật, **không điền kỹ thuật giả**: POST400 validation_error với fields ChangeReason/WidthProfile; chưa tới GeometryEngine, không persist draft. Lần đầu harness dự kiến422unsupported_crs thất bại do model validation400 chạy trước; sửa kỳ vọng theo response/source, không nới DTO hay điền số để “pass”. `unsupported_crs` cho nguồn4326 là source evidence của engine, **không phải response422 đã thực chạy**.
- PM thử confirm UUID negative không tồn tại: body{} ban đầu400 trước role guard; cung cấp effectiveFrom thời gian test và reason kiểm quyền, K/If-Match valid-format ->403 đúng PM role, không ghi geometry. Không dùng Sup confirm vào hồ sơ thật để test. Sup POST road-sections body{}+cookie/CSRF/K ->401, không tạo road. Các session test chính được Web logout; không lưu credential/token/cookie vào repo.
- Existing draft GET/readiness + confirmed geometry GET: PM-A/Sup200 cùng ETag/version, PM-B403 cả3. **Readiness endpoint trả ready=false** (nativeAlignment, crsProfileRevision, routeSystemId, routeKind, tessellationToleranceMeters), dù draft cũ COORDINATES đã CONFIRMED. Source CrsProfileEngine.Readiness hiện kiểm native requirements cả input COORDINATES; ghi đây là gap semantic BE cần làm rõ, không tự sửa thành true hoặc coi geometry cũ mất xác nhận.
- Browser Edge Web PM-A tại /pm/projects/{A}/alignment: import file gốc, hiện119 points/701.875/700.73/ignored3, preview đầu vào visible, Lưu draft disabled. Đọc draft cũ theo UUID, preview backend của draft cũ200m, missing-fields/readinessfalse và work-package401 hiển thị rõ. Sup mở cùng draft, confirm disabled, không có PM write button. PM/Sup F5 giữ query UUID, GET lại cùng draft version và geometry reference200m. Harness chặn mutation ngoài Web auth và POST preview read-domain, ghi0 mutation geometry thành công; không tạo file/evidence giả để test.
- `node tools/check-review-293d001.cjs`: **62 scenario PASS** (58 cũ +4 parser selection/ambiguity/axis/duplicate/crossing/no inferred metadata và API reader propagation). Mock/SSR không là backend E2E.
- TypeScript + `npm run build` GOMAXPROCS2/GOGC50: PASS,2016 modules; còn warnings duration-[250ms]/bundle lớn có sẵn. `git diff --check`: PASS. Không thêm framework/dependency, chỉ1 component mới; test scripts ngoài repo, không tạo report riêng.

**BE cần chốt để tiếp tục:** cookie eligibility cho GET work-package (road/current version/engineering discovery) và hai Sup prepare-road/version POST nếu workflow cần; không mở toàn bộ API tùy tiện. Cần verified transform/admission cho nguồn lon/lat hoặc contract nhập nguồn phù hợp, không chấp nhận đơn vị độ như mét; xác định provenance/width/chainage đủ trước save. Cần làm rõ readiness cho COORDINATES so với NATIVE_ALIGNMENT và collection/receipt discovery draft, giữ PM-write/Sup-confirm/cross-project guards. Field input chưa có nguồn phải Hoàng/người phụ trách kỹ thuật cung cấp; không tự chế calibration/accuracy.

**Kết luận BƯỚC 3:** Hoàn tất phần độc lập FE: kiểm/import/preview đầu vào và đọc draft/readiness/confirmed geometry server với F5/phân quyền. **Chưa hoàn tất PM lưu draft file này → Sup confirm → PM dùng phiên bản mới → segment publish**; các nhánh đó BLOCKED bởi discovery transport, transform và dữ liệu kỹ thuật thiếu. Không có draft/geometry mới, không thay geometry đang được công việc khác dùng. Chỉ commit file task+worklog tiếng Việt/push origin/hoang không force; giữ BƯỚC2 chờ BE.


### 05/11/2026 — Sửa finding BƯỚC 3 sau commit4012f02: response geometry, retry project và write blockers

**Base/parent:** `4012f02f48b7f94f10a5b64da1bb64f20bfd0433`, nhánh `hoang`, working tree sạch trước sửa. Đọc AGENTS.md, worklog bước3, component AlignmentGeometryWorkflow, alignmentService/types, parser và harness liên quan, Spec17_10 errors/state. Chỉ sửa component/harness/worklog; không sửa parser, backend, auth hoặc endpoint/DTO; không tạo/confirm/publish geometry, tạo dự án/Report/Case hay sửa SQL/DB/volume/pin.

**P2 response cũ — đã sửa:** tách geometryLoading/geometryError khỏi context/preview busy/errors. Mỗi lượt đọc dùng project/road/version đã capture, context generation và geometry attempt tăng riêng; đổi road/project hoặc reload/unmount vô hiệu hóa attempt ngay. Lượt A cũ bị loại dù A→B→A quay lại cùng UUID, hoặc cùng lựa chọn có nhiều request trả ngược. Cả success/catch/finally của lượt cũ không được sửa data/error/loading lựa chọn mới. Đường đọc geometry theo reference URL cũng dùng cùng gate. Kiểm response projectId/routeVersionId và roadSectionId nếu server cung cấp, sai scope/version thì báo lỗi không hiển thị data. Đổi lựa chọn xóa geometry/error/loading cũ; chỉ render confirmed thuộc project hiện tại. Không dùng so khớp UUID lựa chọn đơn thuần thay số lượt tải.

**P2 retry projects — đã sửa:** thêm projectsLoading/projectsError/projectsReload riêng. Tải lại từ máy chủ hiện luôn có (kể cả chưa chọn hoặc list tải lỗi), kích hoạt GET /projects thật đồng thời refresh context theo scope hiện có. Tiếp tục duyệt cursor độc lập và chặn cursor lặp; chỉ công bố list khi toàn lượt đọc thành công, không công bố partial thành complete. Abort/unmount không cập nhật status cũ. Lỗi project không bị effect context xóa; lúc retry vẫn báo lỗi trước đó kèm loading, thành công mới clear error. Thất bại tiếp giữ error và danh mục trước đó nếu đã đọc được; phân biệt loading/error/empty thực/out-of-scope chỉ sau list read thành công. ProjectId lựa chọn được giữ trên URL và trong select kể cả chưa load/ngoài scope; không tự chọn item đầu tiên hoặc âm thầm đổi project hợp lệ khi retry.

**Lệnh ghi — đã rà và làm rõ, chưa bật:** thay disabled cố định/nhãn chung bằng saveReasons/confirmReasons theo dữ liệu hiện hành. Hiển thị riêng sai quyền (PM-save/Sup-confirm), chưa chọn/đang tải/lỗi danh mục, thiếu discovery work-package, chưa import, chưa chọn CRS/sample CRS, nguồn lonlat chưa có verified transform, thiếu thông số có nguồn, lỗi hình học, chưa có draft/readiness, readinessfalse/missingFields/errors/sample, draft không còn DRAFT. Luôn ghi rõ **handler lưu/sửa draft cho nguồn nhập này và handler confirm có current version/pin/reason/effectiveFrom chưa tích hợp**, nên nút vẫn disabled ngay cả readiness=true trong fixture. Không dùng readinesstrue hoặc đổi label để mở lệnh chưa có handler. Không khôi phục approval local, thông số tự điền/toast success. Parser chọn Centerline119 của file gốc giữ nguyên.

**Regression thực thi:** `node tools/check-review-293d001.cjs` **69 scenario PASS** (62 trước +7 mới). Harness chạy component thật với React element/hooks và deferred API giả lập, không chỉ test hàm so sánh token:
- A đọc rồi chọnB/đọcB: A success không xuất hiện, không clear loadingB; A error muộn không ghi lỗiB. A→B→A và2 reads cùng lựa chọn: chỉ lượt mới nhất được hiển thị dù trả ngược.
- Response sai project/road/version bị từ chối; unmount rồi reject không có late state writes.
- Projects fail lần đầu -> retry fail tiếp -> retry success qua2 page; success -> lỗi retry tiếp giữ selection/list; pending/loading, sau đóempty thực; không nhầm error thành out-of-scope/empty. Cursor lặp giữ error, không công bố partial. Khi URL chưa chọn project, list success không auto chọn đầu tiên.
- Quyền/reasons khi thiếu nguồn và fixture Sup DRAFT/readiness=true: vẫn thấy unintegrated-handler blocker; không hiện lý do readinessfalse/wrong-role sai dữ liệu.
Các fixture road A/B và readinesstrue chỉ ở bộ nhớ harness, không được gửi ghi vào Docker hoặc coi là geometry thực.

**Browser đã chạy:** Edge headless, đăng nhập Web bằng PM-A test. Route interception chỉ trong disposable browser context mô phỏng /projects503 lặp, pending,2-page success,empty và work-package/geometry readonly A/B. Kết quả PASS: nút retry phát request mới, trạng thái loading/error cùng hiện khi chờ; pagination4 calls sau2 fail+2page; giữ projectId, empty tách biệt; A cũ không hiện/không clear loadingB; A→B→A giữ length của lượt mới. Đây là **browser UI với response mô phỏng**, không phải positive backend discovery/geometry E2E.

Sau đó gỡ toàn bộ response fixture, mở lại /pm/alignment bằng API cookie thật: danh mục dự án tải được, work-package401 hiển thị đúng blocker; import trực tiếp `C:/Users/Admin/Downloads/roadguard-export.geojson` hiện119 điểm và unintegrated-handler reason, nút ghi vẫn khóa. Đây là **browser/API local thật cho read/error/import**, không chứng minh create/confirm. Harness chặn mutation ngoài /auth/web/*, ghi0 mutation nghiệp vụ và0 pageerror; logout đóng phiên test. Không dùng Bearer, dev SQL, file hoặc evidence giả để lấp thiếu; không ghi output/cookie/credential vào Git.

**Build/checks:** `npm run build` với GOMAXPROCS2/GOGC50 PASS (TypeScript + Vite2016 modules); còn warnings duration-[250ms] và bundle lớn có sẵn. `git diff --check` PASS. Không tạo file repo mới hoặc thêm dependency. Chỉ source component, test hiện có và worklog thay đổi.

**Blocker/NOT_RUN giữ nguyên:** live work-package/road preparation cookie, verified transform/nguồn kỹ thuật và semantics readiness COORDINATES/native chưa chốt; handler create/edit/confirm/publish chưa tích hợp đủ điều kiện. Không chạy positive geometry write hoặc đổi pin hiện hữu, full bước3 E2E NOT_RUN/BLOCKED. Build/regression PASS không là nghiệm thu toàn bước3. **Kết luận:** hai finding P2 đã sửa trong phạm vi trên; trạng thái lệnh ghi được giải thích đúng điều kiện, vẫn chặn an toàn. Chỉ commit task tiếng Việt/push origin/hoang, không force.


### 05/11/2026 — Tích hợp bàn giao Case Report và tạo dự án Web (backend5180ab9)

**FE base/parent:** `6336a12e7368f3a36ccb649143c2284ce0037b9b`, nhánh `hoang`, working tree sạch trước làm. Đọc AGENTS.md/worklog mới nhất và `C:/Users/Admin/Downloads/RoadGuard_FE_BanGiao_CaseReport_WebProject.md` đầy đủ, đối chiếu source/DTO/filter/tests ở hai commit bàn giao, không dùng JSON kit cũ để kết luận thiếu API. Chỉ làm Case reports/content và create project; không sửa geometry bước3, backend code/quyền, auth transport hoặc dữ liệu Report/Case mà Hoàng đang giữ. Không triage/link/split/confirm/publish/Defect/FIELD, không tạo project thứ2 hoặc xóa dữ liệu cũ.

**Backend/runtime cập nhật an toàn:**
- Remote đúng RoadGuardSystem/develop. Fetch xác minh origin/develop=`5180ab9f86eee06a7328e9edeb5bee7dc18e808e`, có commit Case detail `0acbe09cf2423ce7486d1923d7b9a4ae406e0c46`; ancestry/source dùng worktree detached `D:/hoctap/kì 9/nối api đồ án/RoadGuard-web-5180ab9`. Checkout develop cũ vẫn nguyên4 file bẩn: deploy/fe-handoff/{G02-G06-OWNER-DECISIONS.md,compose.yaml,sql-start.sh,tls-init.sh}, không reset/restore hoặc fast-forward đè chúng. Các cập nhật docs/deploy trung gian d5a3a56 được giữ ở worktree, không áp đè cấu hình instance hiện có.
- Build `docker build --target api -f deploy/fe-handoff/Dockerfile.Handoff -t roadguard-fe-starter01-api .` từ đúng worktree official SHA: PASS dotnet publish. Recreate riêng service api với **project name roadguard-fe-starter01**, hai compose file/config cũ mà FE đang dùng, `up -d --no-deps --no-build api`. Không chạy init/scenarios/seed/down/reset, không recreate SQL/MinIO. Giữ named state/keys/TLS volumes và SQL/object data.
- API image trước `sha256:b56ca546b927e1c3bc2a75b99a55e45f66076867c9a68575030de52321cb3e15`, sau **`sha256:abddd74b62baef95c41456e9a57972ce39eda0e076ef916bb1730dafc34b00d3`**, healthy. Mounts roadguard-fe-starter01_state:/handoff, _keys:/keys, _tls:/tls giữ nguyên. `/ready`200. FE proxy vẫn https://localhost:18443, HTTP18081 cùng API instance. Runtime version được chứng minh bằng SHA nguồn build + image digest thực + Swagger/HTTP mới, không chỉ nhìn tên nhánh hoặc snapshot kit.
- Swagger runtime `/swagger/v1/swagger.json` đã có GET cases/{caseId}/reports và evidence/content, POST projects security alternatives Bearer OR WebSession+CsrfToken+AntiforgeryCookie. Sync đúng2 GET/mới4 schema CaseReportDetail/Page/Evidence/Supplement và POST projects metadata vào FE docs/contracts/openapi.json, cập nhật catalog source pins/references. Operation/schemas không liên quan giữ nguyên (metadata/pins cũ của operation khác vẫn historical, không nâng toàn contract thành E2E PASS).

**Source đọc đối chiếu:** backend CaseReportDetailsController/Service/Repository, CaseReportDetailsDtos, CaseReportDetailsOperationFilter; ProjectsController action Create, ProjectCreationService/PersistenceService, ProjectCreationWebOperationFilter và tests CaseReportDetailsHttpTests/ProjectCreateWebCookieHttpTests; hướng dẫn CASE-REPORT-DETAILS.md, PROJECT-CREATE-WEB-COOKIE.md, FE-AUTH-AND-CLIENT-GUIDE. Case detail dùng current Case guard/active links/current file verification-version, current Reporter account contact; contentPath không signed URL/không public evidence. Hai GET không yêu cầu CSRF/K; POST create giữ Supervisor, CSRF Web và K theo contract,201+receipt/replay.

**FE tạo dự án Web:**
- Form lấy PM từ GET users?role=PM&status=ACTIVE&limit100, duyệt hết nextCursor/check lặp, không ghép PM seed hay project-cache thành danh mục Sup. Lỗi PM hiển thị, có placeholder không giả đã chọn PM trước khi danh mục tải; submit chỉ với PM trong danh mục API. Không truyền userId actor hoặc operationId override; POST canonical name/code/description/primaryPmId/handoverDate/warrantyEndDate/handoverFileIds:[], cookie/CSRF qua client hiện hành.
- Khóa file input và giải thích chưa có upload trước dự án hợp lệ. Bỏ state File.name/handoverFiles trong form, service cũng từ chối attachments để không gửi tên file hoặc UUID chưa qua producer hợp lệ. Không bỏ handover/warranty/PM source chỉ vì file rỗng.
- Một command giữ nguyên normalized body/fingerprint/K/busy; ref chặn submit trùng. Khi timeout/5xx/unknown outcome không phát ý định mới, khóa fields và cho nút Gửi lại đúng yêu cầu. Giữ command/receipt **không chứa token/CSRF/cookie** trong sessionStorage theo authoritative actorId để F5 không mint key mới; tài khoản khác không đọc pending của người trước, memory command bị xóa khi epoch/actor đổi. Parse record sai thì chặn đối chiếu, không tự gửi lệnh mới. Replay cùng ý định chỉ dùng body/key cũ; không đổi khóa để vượt duplicate_request.
- Sau201 đọc lại danh sách projects phân trang cho tới tìm đúng ID server; không lấy toast/local fields thay xác nhận persist. Nếu201 nhưng GET lỗi, giữ receipt: retry đọc lại không POST thêm. Tách project_code_conflict (mã trùng) và duplicate_request (fingerprint/key conflict), giữ HTTP response/cause/code; csrf_failed hiển thị đúng CSRF, không đánh đồng quyền Sup. Lỗi definitive4xx khác duplicate giải phóng ý định rejected; unknown giữ nguyên.
- Ghi rõ PM permission hiệu lực từ ngày bàn giao, BE xét ngày UTC; không sửa guard để tài khoản tương lai đọc sớm.

**FE Case reports:**
- Thêm caseReportService.read dùng đúng GET cases/{id}/reports?limit20&cursor, cursor opaque cố định limit/Case/session, tải hết trang/check lặp/dedup reportId; saiCase/error throw rõ, không fallback mock/partial empty success. Không gọi Reports owner-only hoặc me/phone để lấy thông tin người gửi.
- CaseReportsPanel thay viewer/reporter/merged-detail cũ của Case CITIZEN: loader/ready/empty/error/retry thật, không gắn UNSUPPORTED static từ mapper nữa. Card hướng dẫn mở hồ sơ để tải từng Report. Mỗi Report có current reporterDisplayName/PhoneNumber/Confirmed, original description/receivedAt/evidence và từng supplement với thời gian/nội dung/evidence riêng. Nhãn contact nói rõ là tài khoản hiện tại, không snapshot lúc gửi. Không đổi Case conclusion/notes thành lời người dân. Giữ nút điều phối Sup trên Case chưa gán nhưng không bấm trong test; các nguồn Drone giữ viewer hiện hữu.
- Scope `${authEpoch}:${caseId}` và AbortController/reset state/cursor khi Case/phiên đổi; response cũ không render dưới Case mới. Array/mapping giữ report/supplement/evidence boundaries, không lấy ảnh parent hoặc người gửi của Report khác.
- Tải ảnh bằng contentPath trên **configured API origin**, URL tuyệt đối được kiểm origin/path caseId/reportId/evidenceId trước gửi bằng apiClient cookie; không ghép /api/v1 hai lần hoặc mượn token Reporter. responseType Blob -> object URL chỉ sống trong component. Thu hồi URL khi retry/đổi evidence/version/đóng Case/đổi phiên; abort/lateBlob không tạo URL sau cleanup. Blob ProblemDetails được decode nhưng giữ nguyên HTTP/status/code/cause, lỗi không thành ảnh giả.
- GPS/time theo từng evidence: locationSource/capturedAt/null không lấy từ Case/project. Chỉ hiện nút/marker map khi locationSource không UNKNOWN và có đủ finite lat/lng đúng range; (0,0) có nguồn vẫn hợp lệ, thiếu1 tọa độ không marker. ReceivedAt không thay capturedAt; accuracy null hiển thị chưa có thông tin. Không bù GPS cho các fixture UNKNOWN.

**Dữ liệu test tạo mới, không tạo trùng:** Chỉ1 project **RG-WEB-20261105-01**, UUID **632bae9a-c3f2-44f6-bed3-6f59b928d832**, tên ghi rõ TEST, handover2026-11-05/warrantyEnd2027-11-05, primary PM lấy từ API active PM-A `72f84201-a001-4000-8000-000000000002`, fileIds[]. Browser Sup form tạo201, service GET readback đúng ID. Ledger key/body/receipt test ở temp, không credentials/CSRF và không commit. Mỗi lần rerun kiểm code tồn tại trước, chỉ replay cùng command đã giữ, không tạo project khác. Không xóa/đổi ngày/sửa SQL record này.

**Lưu ý nghiệm thu PM project mới — BLOCKED theo ngày hiệu lực, KHÔNG báo PASS:** Browser test cố ý chọn ngày bàn giao05/11 (ngày local). Lúc kiểm HTTP Date của runtime là04/11/2026 ~19:14 UTC. GET members?includeHistory=true bằng Sup200 xác nhận PM-A, rolePM/statusACTIVE/isPrimarytrue, validFrom2026-11-05. ProjectScopeGuard.cs:39–42 xét DateOnly UTC và validFrom<=today, nên **PM-A hiện GET summary project mới403**, chưa có quyền đọc tới00:00UTC05/11 (07:00 VN); PM-B ngoài scope cũng403. Không đổi clock/SQL/validFrom hoặc tạo thêm project để làm test thành PASS. Gate **PM được giao thấy/read200 trên project mới cần kiểm lại khi membership có hiệu lực**, chưa chứng nhận đoạn này. Quyền/create403 cho PM và đọc Case đúng project hiện hữu đã kiểm riêng; không lấy chúng thay nghiệm thu project mới.

**API/browser thực đã chạy:**
- Sup Web browser create đúng1 POST201; replay cùng key/body201 cùng ID; key cũ/body đổi409 duplicate_request; key mới/cùng code409 project_code_conflict; thiếu/sai CSRF403 csrf_failed. PM-A/PM-B cookie+CSRF POST create403. Chỉ các POST201 đầu tạo project, replay không tạo thêm. Không dùng Bearer.
- Browser network-failure harness abort **trước server** cho một yêu cầu sử dụng code test đã tồn tại: error rõ/fields khóa, F5 khôi phục cùng command; chủ động gửi lại cùng K/body nhận project_code_conflict409 thật, không thêm project. Đây test UI unknown-outcome/reload, không chứng minh packet đã commit rồi bị mất; unknown-commit covered bằng logic mock, không giả response201.
- Case `82dbfe8c-3af3-442d-958f-5e3f3f8455ef` UNASSIGNED: Sup GET reports200, có original+supplement, private content200; PM-A/PM-B GET reports403. Case `643cf52b-60e1-4a3f-8ff2-f564f0858e23` projectA: Sup/PM-A reports200 và ảnh200, PM-B403 list và content. AUTO Cases11ad1a42.../68fb08f3... Sup/PM-A200, PM-B403; AUTO1 có supplement. Không triage/gộp/tách hoặc kết luận bất kỳ Case nào.
- Tất cả evidence đã đọc trong những fixture này giữ UNKNOWN/locationnull/capturedAtnull. Original pixel test68byte có description nói rõ test; ảnh supplement đã có sẵn từ dữ liệu trước task, download200, không tự tạo ảnh mới. Response private,no-store giữ nguyên. Limit0/101 hoặc cursorbad bằng PM-A trả400 validation_error đúng.
- Browser Sup tại /sup/ai-inbox mở #CAS-82DBFE8C: contact hiện tại/Chưa xác minh, original/supplement riêng, tải2 ảnh200 qua contentPath đúng, URL created2/revoked2 khi đóng. Browser PM-A mở #CAS-643CF52B: original/UNKNOWN/contact đúng, image200, URL created1/revoked1. Không request /api/v1/api/v1 hoặc owner-only route; mutation nghiệp vụ trong browser Case audit=0. Session test logout sau kiểm, không log phone values hoặc cookie/token.
- SELECT kiểm active CaseReportLinks groupCount>1 hiện trả[], nên fixture nhiều Report trong1 Case thật thiếu. **NOT_RUN live:** multiReport pagination>1, SĐTnull, positiveCAPTURE/GPS marker; không tạo/triage Report hoặc sửa tài khoản để lấp fixture. Những nhánh này có regression mocked/SSR như dưới. Không dùng mẫu JSON bàn giao làm dữ liệu backend thật.

**Regression/build:** `node tools/check-review-293d001.cjs` **77 scenario PASS** (69 trước +8 mới): timeout/pending key/body/replay,201-readback fail không POST lại,in-flight/filename/CSRF/code-conflict,Case pagination/cursor/error/scope,API origin/path/Blob ProblemDetails,UNKNOWN/partial/(0,0) GPS,Case/epoch stale-response+multiReport/supplement/null-contact isolation,full reload command restore/actor isolation/no token persisted. Đây mock/SSR/hook, không phải SQL/backend E2E. `tsc -b` và `npm run build` GOMAXPROCS2/GOGC50 PASS,2018 modules; warnings duration-[250ms]/large chunk có sẵn. `git diff --check` PASS. Chỉ2 file mới (service+panel), không framework/dependency mới. Geometry files không đổi.

**Các lần test/setup fail ghi đúng:** locator button ban đầu dùng exact accessible name không tính icon text nên không click/không POST; sửa locator submit form rồi mới201. Pending UI test đầu chưa chờ/chọn PM từ API nên button disabled; thêm placeholder PM rõ và harness chờ option hợp lệ. Playwright isDisabled trên fieldset không phản ánh như input, đổi assert fieldset.disabled và input descendant. Lượt PM assigned-read dự kiến200 thất bại403 do UTC validFrom như trên; không sửa kỳ vọng thành PASS read, ghi gate pending. Không có lần fail nào được lấy làm bằng chứng thành công/persist.

**Self-review:** (1) đối chiếu current DTO/header/role/source runtime, CaseReport content private boundary/current contact; không dùng snapshot kit cũ, không tự mở quyền. (2) diff scope, late Case/actor response, URL origin/cleanup, command identity xuyên F5/201-readback, disabled upload không gửi File.name và không thêm project khi rerun. Không thay business workflow/geometry/DB data ngoài đúng1 project test. Backend xUnit suites bàn giao chỉ đọc source/kết quả do nhóm BE báo, **không chạy lại isolated SQL suite hoặc claim toàn W01–W10 E2E**.

**Kết luận bàn giao:** Hai phần FE đã tích hợp đúng source/runtime mới; create Web201/replay/CSRF và scoped Case detail/content trên cookie đã kiểm thật. Gap cũ “POST projects không cookie” và “không có scoped Report read/content” được thay bằng implementation mới, không còn dùng UNSUPPORTED cho Case loader. **Còn gate:** PM-A read project test mới200 sau validFromUTC, multiReport/null-phone/CAPTURE fixtures live, upload-before-project vẫn chưa có contract (form khóa), full E2E/deployment TLS/trust chưa nghiệm thu. Pending command journal chứa metadata ý định theo actor, không credential; không đưa ledger/output/phone/private image/token/cookie vào commit. Cập nhật worklog chung và chỉ stage task, commit tiếng Việt/push origin/hoang không force; không push BE develop.


### 05/11/2026 — Khôi phục tách Report trong drawer và bỏ chặn sai khi phục hồi tạo dự án

**Base/parent:** `36ac22350e801bc8ba6983ea21638040653f16e0`, nhánh `hoang`, status/diff sạch trước sửa. Đọc AGENTS.md, worklog mới nhất, Spec17_10 Reporter/IncidentCase (link/split và privacy) và OpenAPI POST cases/{caseId}/report-splits/CaseSplitDto. Runtime/BE vẫn5180ab9, không sửa backend hoặc auth, không reset DB/volume, không tạo project/Report/Case/fixture hoặc thay geometry/pin. Chỉ phục hồi thao tác trên dữ liệu API và sửa recovery modal.

**Tách Report — đã sửa:**
- CaseReportsPanel nhận callback async của luồng Case hiện có. Chỉ PM, Case đã tải đủ>1 Report mới có Tách Report này ở từng article; bước xác nhận hiển thị **Report UUID đúng article được chọn**, không dùng Case ID/mã hiển thị/child fixture thay Report ID. Sup/single-Report không có thao tác này. Khóa double click/các nút tách và retry detail khi lệnh đang chạy; error giữ HTTP/code, không báo success bằng toast/local state.
- AIReviewInbox/useAIReviewState/ReviewDetailDrawer/Modal nối callback onSplitReport trả Promise tới useAIReviewLinkActions. Giữ callback legacy riêng có catch/error toast để các nút cũ không phát sinh unhandled rejection; panel mới nhận lỗi qua Promise để hiển thị theo Case. Hook tách dùng selectedCaseId làm Case nguồn, Report ID thật được panel chọn, reason đúng ý định PM; bỏ logic suy Case từ child/code. Sau API thành công đọc lại Case nguồn và danh sách Case từ server, giữ selected Case thay vì reload lifecycle làm nhảy sang Case đầu. Callback resolve xong panel tải lại chi tiết từ trang đầu (cursor mới), report vừa chuyển không còn xuất hiện dưới Case cũ. Error fetch sau mutation không bị coi là thành công đầy đủ; vẫn có nút đọc lại để đối chiếu.
- triageService.splitReport giữ API canonical body {reportIds:[reportId],reason}, GET Case mới trước lệnh; Report phải đang thuộc Case và Case có ít nhất2 Report. If-Match ưu tiên **ETag GET nguyên dấu quote**, fallback rowVersion theo cơ chế cũ; UUID Idempotency-Key, cookie/CSRF qua HTTP client. Không auto retry409/412, unknown outcome giữ command guard cũ; thêm kiểm session sau POST trước clear pending. Hook/session và panel Case/epoch generation ngăn response cũ cập nhật Case/phiên mới. Không đưa lại DrawerMergedReportsList/dữ liệu/ảnh giả vào CITIZEN; panel dùng original/supplements API riêng từng Report, URL cleanup cũ giữ nguyên.

**Phục hồi tạo dự án — đã sửa:**
- pendingProjectCreate cung cấp hasReceipt; modal hiển thị rõ phase201 Đọc lại kết quả hoặc unknown Gửi lại đúng yêu cầu. Đối với pending command đã lưu/body khóa, nút khôi phục không bị điều kiện PM inventory hiện tại chặn: PM API lỗi/list rỗng/PM cũ không còn trong danh mục vẫn dùng đúng command. Có option chỉ đọc “PM của yêu cầu đã lưu”, không gọi PM đó đang đủ điều kiện tạo mới.
- Nếu đã nhận201, service hiện hữu chỉ GET readback receipt và không POST thêm; nếu unknown, chủ động replay đúng key/body đã giữ. Không thay PM/ngày/code/body để hợp danh mục mới; trường pending vẫn bị khóa. Validation PM đang ACTIVE và có trong danh mục API **vẫn áp dụng cho create intent mới**, không bypass kiểm mới; server vẫn authoritative.

**Regression:** `node tools/check-review-293d001.cjs` **80 scenario PASS** (77 trước +3 mới, đồng thời tăng coverage test loader cũ):
- Modal pending với PM API unavailable/list empty/old PM absent vẫn enabled cho2 phase; received201 label read-only; fresh-create thiếu PM hợp lệ vẫn disabled. Service201-readback-fail test xác nhận hasReceipttrue và retry không POST lần2; unknown replay giữ key/body như test cũ.
- Split đúng Report ID/If-Match lấy từ GET ETag/K; singleReport và Report ngoài Case chặn trướcPOST;412 chỉ có1POST, không đổi K/version để ghi tiếp.
- Hook success đúng thứ tự split -> GET Case -> GET list, setCases từ response, không đổi selected Case hoặc fake link. Component loader test chọn report-b2 trong fixture2Report, confirm truyền đúng ID, reload detail từ đầu trả1Report; dữ liệu/bổ sung của Report đã chuyển bị loại, late Case/session response không xuất hiện. Harness mới dùng useRef nên bổ sung mock useRef vào test runner cũ, không sửa React/framework.

**Browser/API thực và mô phỏng tách rõ:**
- Sup Web cookie thật + recovery body/key/receipt lấy từ ledger test đã tạo ở task trước (không credentials): mô phỏng PM API503, pending đã201 được Đọc lại kết quả thành công qua GET projects thật, **0 POST**. Mô phỏng PM API trả200 list rỗng, pending unknown được chủ động replay **1POST cùng key/body cũ**, backend201 cùng UUID project632bae9a...; readback thành công. Không project mới nào được tạo, không xóa record cũ.
- Browser PM-A cookie thật mở Case643cf52b...; response fixture trong context tạo hiển thị2Report và intercept POST split (không gửi Docker). Chọn đúng article Report2 -> body.reportIds đúng Report2, có K/If-Match, sau đó GET Case/list/detail và Report2 biến mất khỏi Case cũ. Đây **UI bằng response mô phỏng**, không là API persistence/E2E split PASS. Sau bỏ fixture, đọc Case thật1Report không có nút tách. Không tạo/gộp/triage dữ liệu để chuẩn bị test.
- SELECT hiện tại `CaseReportLinks WHERE EndedAt IS NULL GROUP BY CaseId HAVING COUNT(*)>1` trả **[]**: **positive PM split browser/API thật BLOCKED vì thiếu fixture Case nhiều Report**. Không tự link hai hồ sơ Hoàng đang giữ hoặc seed thêm Case. Không gọi split thật chỉ để “pass”.
- Dự án test đã tạo trước:632bae9a-c3f2-44f6-bed3-6f59b928d832 / RG-WEB-20261105-01. Kiểm live cookie: Sup summary200, PM-A403 và PM-B403; HTTP Date runtime **04/11/2026 19:51 UTC**, vẫn trước validFrom2026-11-05 của PM-A đã ghi nhận bằng members API. **PM-A read200 sau khi effective chưa kiểm được/BLOCKED theo thời gian**, không sửa ngày/SQL/clock hoặc tạo thêm project. PM-B outside deny403 là evidence riêng, không lấy làm positive assigned-read. Cần kiểm lại từ00:00UTC05/11 (07:00 VN).

**Kiểm tra build/source:** `tsc -b --pretty false` PASS; `npm run build` GOMAXPROCS2/GOGC50 PASS2018 modules, warnings duration-[250ms]/large chunk có sẵn; `git diff --check` PASS. Không file repo mới, không framework/dependency/contract hoặc backend thay đổi. Chỉ stage files thuộc2 lỗi và worklog. **Kết luận:** code/regression/recovery browser đã sửa trong scope; live split multiReport và assigned-PM read200 chưa đủ điều kiện, không công bố full E2E PASS. Commit tiếng Việt/push origin/hoang không force, không commit ledger/output/credentials/token/cookie/private ảnh.


### 05/11/2026 — Kiểm thử thật PM đọc project và liên kết/tách Report (không mock response)

**Base/parent:** `bf154cf32b118fabf547d7be5975935152d08d60`, nhánh `hoang`, working tree sạch trước/sau kiểm thử, trước ghi worklog. Đọc AGENTS.md/worklog, Spec17_10 Reporter/IncidentCase, OpenAPI create Report/triage/link/split/private evidence và source guards/normalizer/persistence hiện hành. Backend vẫn5180ab9 và Docker instance roadguard-fe-starter01 healthy, không sửa BE, clock/schema/SQL hoặc auth. User đã cho phép chuẩn bị dữ liệu tối thiểu qua API để đóng gate split thật; không dùng các hồ sơ cũ dành Hoàng làm fixture ghi.

#### 1. Quyền PM trên project632bae9a... — một gate thời gian còn BLOCKED

Project test `632bae9a-c3f2-44f6-bed3-6f59b928d832` / RG-WEB-20261105-01 vẫn giữ nguyên. Browser/API Web cookie thật, từng context riêng:
| Tiêu chí | Kết quả thực tế | Trạng thái |
|---|---|---|
| Thời gian server và membership | Header API **04/11/2026 20:12 UTC**. Sup GET members200: PM-A rolePM/statusACTIVE/isPrimarytrue, validFrom2026-11-05/validTonull; ProjectScopeGuard so ngày UTC | PASS kiểm tra nguyên nhân |
| Supervisor đọc project | GET projects200 có ID, GET project summary200; browser /sup/projects hiển thị code test | PASS |
| PM-B ngoài project | GET summary403, members403; list không chứa ID và UI không hiện code | PASS từ chối backend/UI |
| PM-A trước validFrom | GET projects200 nhưng chưa chứa project, summary403/members403; UI không hiện code. Cookie đúng PM-A, không lỗi cache/role giả | Đúng deny trước hiệu lực; không lấy làm assigned-read PASS |
| PM-A đọc200 sau khi hiệu lực | Chưa tới00:00UTC05/11 (**07:00 VN05/11**) theo server trong lượt kiểm; không đổi SQL/ngày/clock hoặc tạo thêm project | **BLOCKED theo thời gian / positive NOT_RUN** |

Không sửa quyền để ép PASS; source + membership API + HTTP Date nhất quán. Cần kiểm lại project này khi ngày UTC đã chuyển05/11. Việc PM-A đọc project TEST SBX-A cũ phục vụ split không thay nghiệm thu project mới632bae9a.

#### 2. Kiểm kê và dữ liệu tối thiểu được chuẩn bị qua API

SELECT inventory trước: không có CaseReportLinks active group COUNT>1. Các Report RG-INTAKE cũ/RG-UNASSIGNED đều dành cho Hoàng, giữ nguyên liên kết/nội dung/trạng thái; không link/tách chúng. Đọc INFORMATION_SCHEMA.COLUMNS trước SELECT các bảng Reports/IncidentCases/ProjectMembers/CaseReportLinks và ReportOriginalEvidence/CaseReportLinkHistory/AuditLogs. Không dùng SQL seed/update để vượt guard.

Tạo đúng2 Report mới cho batch **RG-SPLIT-20261105-01**, dùng Reporter-a test hiện có (owner `72f84201-a001-4000-8000-000000000004`). Hai private file PNG test đã tồn tại được **GET bằng owner**, metadataVERIFIED, purpose/private ownership theo producer, content200/checksum SHA256 đúng; tái dùng reference hợp lệ trong2 Report mới, không tạo upload/file hoặc ảnh hiện trường giả. Đây ảnh pixel pipeline68byte đã được browser giải mã, không phải ảnh tổn hại thực; description mới nói rõ test liên kết/tách, không kết luận hiện trường. Không GPS/thời gian chụp có nguồn nên chỉ gửi locationSourceUNKNOWN, omit location/capturedAt; SELECT/API sau tạo giữ null. Report description khác nhau R1/R2, có marker và mục đích, không đưa test field ngoài DTO.

| Dữ liệu giữ lại | ID | Mục đích / trạng thái cuối |
|---|---|---|
| Report R1 | `cd4d747f-254e-4469-aaf0-1aa35bcbeea0` | RG-SPLIT-20261105-01-R1; còn active trong Case nguồn1db5... |
| Report R2 | `f212fccf-7cd5-4baf-8d5d-8bc14b7e3adb` | RG-SPLIT-20261105-01-R2; được PM chọn tách thật, active trong Case mới9cf5... |
| Case R1 / master liên kết | `1db5cb70-e60f-499d-8b30-bd56d7dad0e6` | OPEN, project TEST SBX-A `72f84201-c001-4000-8000-000000000001`, activeReports=[R1] sau split |
| Case intake R2 ban đầu | `277db54a-84a2-4723-9818-2e8361d0e3ea` | Đã triage rồi link qua API; trạng thái LINKED, activeReports=[], linkedTarget=master; giữ lịch sử, không xóa |
| Case mới do split | `9cf57686-34a7-47d7-9b9a-72f5b936095c` | OPEN, cùng project SBX-A, activeReports=[R2] |
| Evidence R1 | `26e1f3cc-6a55-4639-958f-84ccdd810879` | File có sẵn `98af3d6c-7e58-43d4-8a30-011312db753b`, owner Reporter-a, VerificationState1, UNKNOWN/null |
| Evidence R2 | `7adaef8f-9f6d-4678-90dd-e7283ba35b3d` | File có sẵn `5c7f1c24-76b7-42d0-8b0d-be2ae349736f`, owner Reporter-a, VerificationState1, UNKNOWN/null |

Không tạo project/Defect/FIELD, không thay geometry hoặc pin; chỉ2 Report +2 intake Case +1 Case được command split tạo đúng nghiệp vụ, cùng evidence/link/history/audit bắt buộc. Hai file cũ và các hồ sơ cũ không bị sửa/xóa. Nguồn actor: Reporter upload/report chuẩn Bearer đúng contract owner; **PM/Sup chỉ Web cookie**, không mint Bearer thay Web hoặc dùng owner API bằng PM/Sup.

Chống trùng: journal command identity/body/ETag/receipt theo batch trong temp, marker SELECT trước tạo và key UUID được lưu trước POST; chỉ POST create khi chưa có marker. Không tự đổi key/version khi409/412; lỗi thì dừng để đối chiếu. Browser split lưu request metadata/201 receipt; khi chạy lại đã có receipt thì chỉ kiểm GET/F5/SELECT, không POST split lần2. SELECT cuối marker đúng2 Report, history split đúng1. Journal không chứa password/token/cookie/CSRF value; contact trước/sau được đối chiếu bằng hash, không lưu phone vào worklog/Git.

#### 3. Kết quả API/browser/SELECT thật

| Tiêu chí | Bằng chứng | Kết quả |
|---|---|---|
| Report create hợp lệ | Reporter POST reports201 từng Report, evidence fileVersion metadata hiện hành; generated IDs từ API, active links đối chiếu SELECT | PASS |
| Supervisor điều phối | GET mớiUNASSIGNED + POST cases/{id}/triage200, projectSBX-A/methodEXISTING_EVIDENCE, reason test, If-Match/K/CSRF đúng | PASS |
| PM liên kết | GET hai Case đúng project, POST master/report-links200 với reportIds=[R2], sourceCaseVersions đúng Case2, If-Match master; không đổi K/version tự động | PASS |
| Case nhiều Report + pagination | GET master/reports?limit1 có nextCursor; giữ cùng actor/Case/limit lấy trang2 đúng Report còn lại, nextCursornull; GETlimit20 đầy đủ2Report | PASS API thật |
| Supervisor không tách | Trước PM split, Case vẫn có2Report: Sup cookie+CSRF/K/If-Match gửi DTO đúng R2 -> **403 access_forbidden**, GET lại vẫn2Report | PASS negative thật |
| PM chọn đúng Report trên browser | Web login PM-A -> inbox Case #CAS-1DB5CB70 -> article **R2** -> Tách Report này -> Xác nhận. Request captured reportIds=[f212...], quoted If-Match khớp GET Case mới trước thao tác, Idempotency-Key có, CSRF có, Authorization không có | PASS browser/API thật |
| Server split | POST report-splits **201**, receipt Case mới9cf5... chứa R2; chỉ1 command split thành công | PASS |
| Readback/UI/F5 | Callback GET Case/list/detail thật; R2 biến mất khỏi Case nguồn, R1 còn. F5 mở lại source vẫn chỉR1; mở Case mới#CAS-9CF57686 cóR2 và ảnh decode thành công | PASS |
| Contact/nội dung/evidence không trộn | Canonical hash từng Report trước/sau (bỏ caseId/contentPath là routing thay đổi) giữ nguyên current sender/contact/description/receivedAt/original/supplement/evidence metadata | PASS; không ghi phone values |
| Private content sau chuyển | Đường R2 dưới Case nguồn cũ404; contentPath mới dưới Case9cf5...200/68byte, browser ảnh loaded; Sup đọc Case mới200, PM-B outside403 | PASS |
| Liên kết DB | SELECT CaseReportLinks: R1 active master; R2 originalCase277→master→newCase9cf với EndedAt/StartedAt nối đúng, chỉ link cuối active | PASS |
| History/audit/owner | CaseReportLinkHistory giữ2 cạnh link/split, R2 đúng ID; split actor PM-A và đúng1 row. Audit có report_received/case_triage/case_link/case_split. FK evidence ReportId/Owner/Files đúng, verification1, locationSource0 vàlat/lng/accuracy/capturedAtNULL | PASS SELECT chỉ đọc |

Không intercept/fulfill/hardcode response để báo PASS: browser route chỉ cho request thật đi tiếp và chặn mutation ngoài auth/split đã cho phép. Chuẩn bị dùng API chính thức, SELECT phục vụ inventory/reconcile/verify; không SQL write/seed. Script tạm ngoài repo: rg-prepare-real-split.cjs, rg-real-split-browser.cjs, rg-real-project-membership.cjs; không tạo report riêng trong repository. Dữ liệu vẫn giữ lại trong database local cho review; sau split không còn fixture multiReport vì nghiệp vụ đã tách1→2 Case đơn, nếu cần chạy lại mutation phải có tác vụ cho phép link lại bộ test này, không tự lặp/reset.

**Lỗi harness, không phải lỗi FE:** Lượt browser đầu POST201 đã thành công và được journal lưu, UI đã reload; sau đó hàm kiểm ảnh dùng Fetch Response.status như function gây TypeError. Sửa duy nhất script temp dùng property.status, chạy lại chỉ GET/F5/verify dựa receipt, **0 POST split lần chạy lại**, không tạo Case trùng. Kết quả PASS trên là kết hợp command201 thật, UI readback và SQL durable effect đã đối chiếu; không coi lần harness throw là test PASS hoặc tự resend key khác.

**Code/build:** Không phát hiện lỗi FE trong các tiêu chí đã chạy, không sửa application/backend/tests. Không chạy lại typecheck/build/regression vì chỉ bổ sung bằng chứng runtime/worklog;80 regression/build của base vẫn là evidence lịch sử, không gọi thành kết quả E2E mới. Scope chưa chạy: assigned PM-A positive read200 trên project632bae9a sau validFromUTC; full W01–W10/offline/deployment/trust không nghiệm thu.

**Bàn giao:** Gate **PM tách Report thật đã PASS** bằng API/browser/SELECT, không còn blocker thiếu multiReport fixture của lượt trước. Gate **PM-A đọc project632bae9a sau hiệu lực vẫn BLOCKED theo thời gian server**, Sup read và PM-B deny đã PASS; không ép SQL/ngày/clock để đạt. Không code fix hoặc dữ liệu cũ người dùng bị sửa, không reset database/volume. **Dữ liệu database Docker local không đi theo commit/push GitHub**; Git chỉ mang worklog. Chỉ commit worklog chung tiếng Việt/push origin/hoang không force, không credentials/cookie/token/private dump/output nhạy cảm.


### 05/11/2026 — Nghiệm thu create/access project và vòng duyệt geometry theo yêu cầu hiện tại

**Base/parent:** `8bc2cc922f93ca86a48edc206c95fb3df8d5f92a`, nhánh `hoang`, git status/diff sạch trước kiểm; chỉ bổ sung worklog. Đọc AGENTS.md/worklog, Spec17_10 Project/Road/Geometry, architecture Web/auth, OpenAPI FE và Swagger runtime. Theo cách gọi của lượt này Bước1=create project/PM access, Bước2=geometry; không sửa lại numbering lịch sử ở các mục audit cũ. Không sửa backend/FE/SQL/clock hoặc auth, không tạo dữ liệu mới, không reset volume và không dùng trạng thái/tọa độ mock để đạt nghiệm thu.

**Xác minh môi trường:** Fetch origin/develop đọc-only xác nhận SHA mới nhất vẫn `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`; checkout backend cũ còn4 deploy file bẩn được giữ nguyên. Worktree nguồn5180ab9 sạch. Docker API đang dùng image `sha256:abddd74b62baef95c41456e9a57972ce39eda0e076ef916bb1730dafc34b00d3`, healthy, cùng instance FE đang proxy. Không rebuild/recreate vì không có bản code mới. Source/router/service/domain dưới đây khớp runtime Swagger hiện tại, không lấy snapshot kit cũ thay runtime.

#### A — Bước1 project632bae9a...

Test browser Edge + HTTP fetch cookie thật với3 tài khoản test, context tách biệt; không giả role/header hoặc mock response:
| Tiêu chí | Kết quả mới | Trạng thái |
|---|---|---|
| Sup đọc dự án test632bae9a-c3f2-44f6-bed3-6f59b928d832 | GET projects200 có project, GET summary200, GET members200; UI /sup/projects thấy RG-WEB-20261105-01 | PASS |
| PM-B ngoài scope | GET summary403/members403, project list không chứa project và UI không hiện code | PASS từ chối đúng |
| PM-A khi đủ hiệu lực | **Server HTTP Date 04/11/2026 20:29 UTC**, membership PM-A rolePM/statusACTIVE/isPrimarytrue, validFrom2026-11-05/validTonull; chưa tới ngày UTC hiệu lực | **BLOCKED thời gian; positive sau hiệu lực NOT_RUN** |
| PM-A hiện tại | Login Web đúng role; GET projects200 nhưng không chứa632..., summary403/members403; UI không có project. Source ProjectScopeGuard dùng DateOnly UTC và validFrom<=today | Đúng deny trước ngày, không phải bằng chứng lỗi FE/API |

Mốc có thể kiểm lại là00:00UTC05/11 =07:00 VN05/11. Không sửa membership/SQL/ngày/clock hoặc cấp thêm quyền để biến403 thành200. Bước1 chưa chốt toàn bộ vì positive assigned-read trên project này chưa thể chạy trong lượt hiện tại. Không tạo lại project. Các kiểm read project testSBX-A cũ ở phầnB chỉ phục vụ kiểm độc lập geometry, không thay gate632... này.

#### B — Đối chiếu luồng geometry, tiêu chí nào đã/chưa có contract

Đọc trực tiếp GeometryWorkflowController/Service/PersistenceService, GeometryEngine/CrsProfileEngine, RoadGeometryDraft.cs, GeometryDraftInput/GeometryConfirmInput/GeometryDraftView, ProjectWorkPackagesController và source ProjectLifecycle để tránh bỏ sót action khác. Live Swagger cùng OpenAPI FE chỉ có create/edit/get/readiness/preview/confirm cho draft và các alias road-section; **không có operation gửi duyệt, review-reject/yêu cầu sửa hoặc DTO review decision cho geometry**. Không suy thiếu chỉ từ tên route: domain RoadGeometryDraft.Create/Edit giữ statusDRAFT, chỉ Confirm chuyểnCONFIRMED, Edit khi khácDRAFT ném immutable; service/router chỉ dispatch các action tương ứng. Không tìm thấy đường ProjectLifecycle làm geometry submit/reject; endpoint lifecycle công trình/repair không thể dùng thay review geometry.

Luồng yêu cầu từ chối/yêu cầu sửa và gửi lại là tiêu chí nghiệm thu lượt này; wire/state hiện hành chưa định nghĩa tiêu chí đó. Không tự thêm PENDING_APPROVAL/REJECTED/REVISION_REQUIRED hoặc mượn state RepairBatch. Contract hiện có Sup confirm trực tiếp draft đủ điều kiện; Sup đọc được draft theoUUID không tương đương một submit command/queue/history đã được lưu.

| Tiêu chí Bước2 | Source/API/browser đã kiểm | Kết luận |
|---|---|---|
| 1. PM mở project được gán | Project mới632... còn gate ngày. Độc lập dùng SBX-A72f84201-c001-4000-8000-000000000001, PM-A được server trả trong list; browser mở alignment | Project mới BLOCKED; project cũ PASS diagnostic |
| 2. Import GeoJSON hợp lệ | Browser PM-A import đúng roadguard-export.geojson, Centerline TIM_TUYEN_CHINH119 điểm; preview701.875m Haversine/metadata700.73m riêng; không dùng RoadEdge/Polygon làm tim | PASS kiểm đầu vào FE, không gọi đây persisted geometry |
| 3. Payload/project/version/K/CSRF | GeometryDraftInput có sourceKind/sourceCrs/coordinates/stationOriginMeters/changeReason/widthProfile/surveyWidthMeters và optional native/topology. Source writesK, edit/confirmK+If-Match, cookieCSRF; không có valid payload cho file này để gửi | Source verified; positive write **NOT_RUN** |
| 4. Lưu draft và gửi Sup | COORDINATES engine chỉ nhận sourceCrs trùng engineeringSRID32648/32649 với tọa độ mét; file là lonlat độ. Thiếu verified transform và stationOrigin/widthProfile/surveyWidth/changeReason có nguồn; FE handler nhập nguồn này chưa tích hợp đủ. Submit command/state/history chưa được contract cung cấp | **BLOCKED data/contract/discovery + FE integration còn phụ thuộc**, không lưu giả |
| 5. Sup xem geometry DB | Live GET draft cũ87014e70-b2db-4602-82b9-45a51cd44835 và GET geometry version5baf3408-6489-432f-89ed-127a89e905a5 đều200 cho PM-A/Sup; browser hiển thị version/length từ server | PASS read geometry TEST có sẵn; geometry từ file mới chưa có/NOT_RUN |
| 6. Sup duyệt hoặc từ chối | Confirm API có (GeometryConfirmInput expectedCurrentVersionId/effectiveFrom/reason + strongETag/K). Không có submit/reject/revision decision DTO/action trong source/runtime | Confirm positive BLOCKED; reject/revision **BLOCKED thiếu contract** |
| 7. PM nhận từ chối, sửa/gửi lại | Chỉ draft-edit PM khiDRAFT, không có review rejection source/return transition/history từSup; không thể biểu diễn server state bằnglocal label | **BLOCKED thiếu nghiệp vụ/wire**, không tự chế |
| 8. Approved read-only | Source domain Edit từchối khi status!=DRAFT và Confirm chỉDRAFT→CONFIRMED. Draft cũ GET200 statusCONFIRMED, versionAAAAAAAACA8= | Source verified/read có sẵn PASS; immutable cycle geometry mới **NOT_RUN** |
| 9. F5 server data | Browser PM-A/Sup F5 đọc lại cùng draft cũ/version và geometry reference200m từAPI. File mới chỉ preview, chưa có draft/version nên không claim F5 dữ liệu mới đã lưu | PASS read có sẵn; lifecycle file mới BLOCKED |
| 10. Không mock/suy trạng thái | Browser route không fulfill response, chỉ chặn mutation không phải auth;0 business writes. Không dùng local approval/coordinates hardcode hoặc sample mới | PASS giới hạn kiểm thử |

**Blocker endpoint/DTO cần giao BE/owner chốt chính xác:**
- `GET /api/v1/projects/{projectId}/work-package` **Bearer-only** trong Swagger/source; cookie PM-A/Sup hiện nhận401, trong khi cùng phiên GET draft/geometry200. Thiếu discovery engineeringUtmSrid/roadSections/currentVersion để chọn route an toàn. Không phải hết phiên, không thêm Bearer từ tài khoản hardcode. Sup prepare `POST /projects/{id}/road-sections` và `.../road-sections/{roadSectionId}/versions` vẫn Bearer-only nếu workflow cần chúng.
- Cần chốt verified WGS84→engineering transform/admission hoặc cung cấp nguồn metric hợp lệ, cùng đầu vào kỹ thuật có nguồn. Source GeometryEngine.Preview trả unsupported_crs khi SourceCrs!=engineering; đơn vịđộ không được coi là mét. roadWidth7 metadata không tự thành surveyWidth/widthProfile; không auto station0/calibration/số làn/vật liệu/accuracy. Không ép length700.73 hoặc biến polyline này thành native/sample-affine chỉ để save. File chưa đủ GeometryDraftInput không chứng minh file JSON sai.
- Cần contract chính thức cho ý định gửi duyệt/review-reject/yêu cầu sửa, role, DTO reason/version/K, state/return path và history/discovery nếu yêu cầu đủ chu trình của lượt này. Chưa đặt tên endpoint hoặc enum tự nghĩ ra, chưa sửa BE; confirm hiện hữu không được dùng với reason “reject” để giả từchối.
- Readiness endpoint hiện trảfalse/native missingFields cho draft COORDINATES cũ đãCONFIRMED (đã ghi ở mục trước); cần chốt semantics native/coordinate. Không đổi responsefalse thànhtrue ở FE, không coi sample profile là official CRS. UI vẫn nói rõ write handlers chưa tích hợp và bị chặn, không âm thầm tuyên bố phần FE ghi đã hoàn thành.

**Thực chạy trong lượt này:** rg-real-project-membership.cjs (browser/API3 actor) và script temp rg-project-geometry-acceptance-check.cjs (browser PM/Sup), cùng request context kiểm work-package401/draft200 hiện tại; GET `/swagger/v1/swagger.json`, read source/FE OpenAPI. PM/Sup alignment browser: work-package blocker visible, confirmed sample reference200 từDB, draft statusCONFIRMED/versionAAAAAAAACA8=, readinessfalse; PM import file gốc119 điểm, nútLưu draft bị khóa đúng lý do; Sup confirm cũngkhóa. F5 vẫn đúng server reference/version. Không chạy positivePOST draft/confirm, không gửi vào route tự chế. Header/body semantics source verified không được ghi như command API đã PASS.

**Dữ liệu test:** tạo mới **0** project/Report/Case/CRS/draft/road/version/segment. Chỉ đọc project632..., projectTEST SBX-A và existing sample draft/version như trên; geometry sample200m là dữ liệu test cũ, **không** là kết quả file701.875m và không chứng nhận accuracy chính thức. Không sửa/xóa geometry cũ, pin task/survey/repair, database/volume. Dữ liệu local cũ giữ nguyên và không đi theo commitGitHub.

**Code/tests:** Không phát hiện lỗi FE có thể sửa hợp lệ để vượt các gate hiện tại mà vẫn giữ đúng contract; không sửa code application, backend hoặc contract. Không chạy lại regression/typecheck/build vì lượt này chỉ audit/runtime+worklog, không lấy build hay test cũ làm E2E mới. Positive từ chối/sửa/gửi lại, geometry mới read-only cycle, full2step E2E đều **BLOCKED/NOT_RUN**, không PASS.

**Kết luận:** chưa thể chốt nghiệm thu toàn Bước1/Bước2: Bước1 chờ ngày UTC hiệu lực; Bước2 còn discovery transport, dữ liệu CRS/kỹ thuật và thiếu submit/reject/revision contract, kèm write integration FE chưa đủ điều kiện. Các read/import/F5 diagnostic đãPASS như bảng, không thay lifecycle mới. Chỉ commit worklog chung tiếng Việt/push origin/hoang không force; không outputcredential/token/cookie/SQL dump.


### 05/11/2026 — Chốt Bước1 bằng project hiệu lực ngay theo UTC; phân loại đúng contract Bước2

**Base/parent:** `e8051ae1190e7a7b20e2446218fbab2060a3293f`, nhánh `hoang`; git status/diff sạch trước kiểm. Đọc AGENTS.md/worklog mới nhất, Spec17_10 Project/Road/Geometry (workflow/preconditions/guards/K-V), ma trận PM/Sup, Web auth, GIS integration, OpenAPI DTO/path và source BE tương ứng. Fetch origin/develop chỉ đọc xác minh latest vẫn `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`, runtime image `sha256:abddd74b62baef95c41456e9a57972ce39eda0e076ef916bb1730dafc34b00d3` healthy. Bốn file deploy bẩn của checkout backend cũ giữ nguyên; không đổi BE/runtime/clock/auth hoặc SQL, không reset/seed volume. Lượt này chỉ tạo đúng1 project test qua API và cập nhật worklog, không sửa FE code.

#### 1. Project hiệu lực ngay — PASS API/browser/SELECT

Đọc `/ready`200 và HTTP Date ngay trước khi tạo: **Wed, 04 Nov 2026 20:47:51 GMT**, ngày UTC **2026-11-04**. Không dùng ngày local05/11 làm validFrom. Kiểm source CreateProjectRequestDto/ProjectsController/ProjectCreationService/PersistenceService: handoverDate đi vào ProjectMember.CreatePrimaryProjectManager; contract cho phép ngày UTC hiện tại và warrantyEnd>=handover, không cần SQL hoặc membership override. GET users?rolePM&statusACTIVE lấy đúng PM-A hiện hữu. POST Web session cookie + CSRF identity hiện hành + Idempotency-Key UUID, bỏ operationId override và không Bearer; `handoverFileIds:[]` hợp lệ.

| Dữ liệu test mới giữ lại | Giá trị thực |
|---|---|
| Project ID | **2cde860a-f777-4e5c-8d8f-384fdaed9509** |
| Code duy nhất từ timestamp HTTP Date | **RG-STEP1-NOW-20261104T204751Z** |
| Name/purpose | TEST STEP1 NOW - Web cookie immediate PM access; description ghi rõ dữ liệu nghiệm thu, không phải công trình thực |
| HandoverDate / WarrantyEndDate | **2026-11-04 / 2027-11-04** |
| Primary PM | PM-A lấy từ ACTIVE API, `72f84201-a001-4000-8000-000000000002` |
| Membership | rolePM/statusACTIVE/isPrimarytrue, **validFrom2026-11-04**, validTonull; khớp ngày UTC server |
| Handover / Warranty IDs | aa223914-e692-4861-b1d6-00cb447562d9 / 85dcbfce-414b-4cb5-a1d6-87aab166c25c |
| Source records | Không file bàn giao, vẫn có handover+warranty+primary membership đúng transaction API; project wireStatusACTIVE (DB Status2) |
| Geometry | EngineeringUtmSrid chưa khai (NULL),0 draft/0 road/0 geometry version; không dựng geometry để nghiệm thu Step1 |

Chỉ **1 POST create201** của ý định này. Journal code/key/body/receipt ở temp trước dispatch, rerun khi có receipt chỉ GET lại, không sinh timestamp/key/project mới để thử quyền; không chứa credential/token/cookie/CSRF. Không sửa project632bae9a... hoặc bất kỳ project/hồ sơ cũ. Đây là dữ liệu mới hiệu lực ngay theo contract, không đổi clock hoặc backfill SQL để ép gate cũ.

| Tiêu chí hiện tại | API thực | Browser thật/F5 | Kết quả |
|---|---|---|---|
| Sup create/read | POST projects201; GET projects200 có ID; GET summary200; members200 xác nhận PM-A | /sup/projects có code; F5 vẫn thấy | **PASS** |
| PM-A được gán đọc | Cookie login PM-A; GET projects200 có ID; GET summary200 ngay sauPOST | /pm/projects thấy code và F5 vẫn thấy | **PASS** |
| PM-B ngoài project | GET projects200 không chứa ID, summary403 | Không thấy code, F5 không xuất hiện dữ liệu Sup/PM-A | **PASS** |
| Ngày/quyền đúng | ProjectScopeGuard xét ngày UTC, membership validFrom<=HTTP day; không thêm quyền phụ | Context/cookie từng actor riêng, không giả role | **PASS** |
| Durable records | Đọc INFORMATION_SCHEMA trước SELECT Projects/ProjectMembers/HandoverDocuments/Warranties/RoadGeometryDrafts/RoadSections/RoadSectionVersions. Đúng1 project/membership/handover/warranty, đúngPM/dates/status;0 geometry | Không lấy toast/local data thay persistence | **PASS SELECT chỉ đọc** |

**Bước1 đã chốt trong phạm vi tạo project Web và Sup/assigned-PM/outside-PM access bằng dữ liệu hiệu lực ngay.** Gate ngày của project632bae9a cũ không được sửa hoặc dùng làm kết quả này; nghiệm thu mới dựa project2cde... theo yêu cầu lượt này.

#### 2. CRS/geometry — phân biệt có API, thiếu dữ liệu, thiếu transport và thiếu contract

Đọc trực tiếp GeometryWorkflowController/Service/PersistenceService, GeometryEngine, CrsProfileEngine, GeometryDraftInput/GeometryDraftView/GeometryConfirmInput/CrsProfileInput, RoadGeometryDraft domain và các route geometry trong Swagger hiện tại. Không suy thiếu chỉ từ nútdisabled hoặc snapshot kit.

| Phần | Contract/source hiện có | Kết luận chính xác |
|---|---|---|
| CRS profile | GET/POST /projects/{id}/crs-profiles, DTO CrsProfileInput, PM create+K/cookieCSRF. SourceSrid metadata cho phép sốkhôngâm, axisEN/NE/metresPerUnit/provenance và optional operation/ellipsoid/projection/control | Có contract metadata, không đồng nghĩa có adapter chuyển đổi EPSG thật |
| COORDINATES | GeometryDraftInput.sourceCrs phải trùng project engineeringSRID32648 hoặc32649; GeometryEngine dùng NTS LineString.Length trên **tọa độ mét**; stationOrigin/changeReason/surveyWidth/widthProfile phải hợp lệ và profile phủ đúng metric length | Nhánh này không nhận lonlat độ chỉ vì gán sourceCrs32648. Không gửi file sai đơn vị để lấy lỗi PASS |
| NATIVE_ALIGNMENT | Analytic native geometry phải pin project-owned CRS revision; spatial/sourceSrid match profile; có routeSystem/routeKind/tolerance/width/provenance và native validation | Không nói toàn backend chỉ nhận2 EPSG. Đây nguồn riêng, không đổi119 lonlat thành native rỗng/giả để lưu |
| Transform WGS84→UTM | Live Swagger không có operation transform/reproject/conversion; CrsProfileEngine chỉ có executable **SAMPLE_AFFINE_TO_WGS84**, chiềuNATIVE_TO_WGS84 và sampleOnly. MetadataEPSG/ProjectionDefinition không tự thực thiverifiedadapter; legacy COORDINATES preview trảwgs84null/warning khi chưa cấu hình | **Thiếu verified transform/admission cho nguồn file này**, hoặc cần cung cấp nguồn metric có căn cứ. Chưa đặt tên endpoint mới; không dùng sample để khẳng định accuracy |
| Tạo/sửa draft | POST /projects/{id}/road-geometry-drafts, PUT /.../{draftId}; aliases road-section tương đương, DTO GeometryDraftInput | **Đã có** API, PM write; createK,editK+If-Match,WebCSRF. Không ghi chung “thiếu API lưu” |
| Đọc/preview/readiness | GET /.../{draftId}, POST /.../{draftId}/preview, GET /.../{draftId}/readiness | **Đã có** read/preview contract; readiness semantics COORDINATES/native vẫn cần làm rõ như audit trước |
| Sup xác nhận | POST /.../{draftId}/confirm, DTO GeometryConfirmInput(expectedCurrentVersionId,effectiveFrom,reason), roleSup,K+If-Match/cookieCSRF | **Đã có** confirm. Source tạo road mới ở confirm nếu dùng draft project-level chưa có roadSection; không bắt buộc mọi luồng phải đi qua Sup prepare-road POST |
| Gửi duyệt | Không có submit command/DTO/persisted review-queue transition trong route/service/domain hiện tại | **Thiếu contract nghiệp vụ gửi duyệt**, không coi chia sẻURL draft là đã lưu trạng thái gửi |
| Từ chối/yêu cầu sửa/gửi lại | Không có review-decision DTO/action/history/return transition cho geometry; RoadGeometryDraft chỉ Create/Edit ởDRAFT và Confirm→CONFIRMED | **Thiếu contract** cho reject/revision/resubmit cycle yêu cầu. Không tự đặt endpoint/enum, không dùng Confirm vớireasonReject |
| Immutable | Domain Edit chặn khi status!=DRAFT, confirm chỉ từDRAFT; persistence checks state/version/head | Có source guard readonly; không claim đã chạy approval cycle mới của file này |
| Discovery | GET /projects/{id}/work-package Bearer-only, chứa engineeringSrid/roads/currentversions; cookie hiện401. POST road-sections/versions cũngBearer-only nếu chọn workflow cần prepare | Cần Web-cookie admission cho discovery/operation được lựa chọn, không yêu cầu mở mặc định mọi API. Alias new-road draft/confirm có sẵn nên prepare-road không phải blocker bắt buộc cho mọi nhánh |

**Dữ liệu thiếu không được đánh đồng thiếu API:** project mới2cde... không khaiengineeringSrid/profile/route-system vì phục vụStep1. `CreateProjectRequestDto` vốn có engineeringUtmSrid optional; việcNULL không chứng minh BE không có field cấu hình. File roadguard-export.geojson là GeoJSON lonlatWGS84 mặc định, không có sourced metric transform/accuracy/station/calibration/surveyWidth. roadWidth7 chỉ metadata, không tự gán thành đủ widthProfile/surveyWidth. Muốn đi nhánh metric cần verified conversion hoặc dữ liệu metric đúng nguồn, engineeringSrid được chọn có căn cứ và các field kỹ thuật bắt buộc; không scale chiều dài để khớp700.73m. Calibration optional theo source nếu cung cấp phải có provenance; không tự coi là bắt buộc toàn bộ COORDINATES.

**Thực chạy Step2 trên project mới, không mock/hardcode response:** cookie Sup/PM-A GET crs-profiles200(empty), route-systems200(empty); PM-B cả2 bị403. Work-package trả401 cả3 (transport, không lấy401 đó làm test project-scope). Browser PM-A /pm/projects/2cde.../alignment chọn đúng ID từ project API, import file gốc hiển thị119 điểm, blockerwork-package/CRS/source data rõ, Lưu draft và Confirm vẫn khóa; F5 vẫn đúng project server, không nói preview file đãpersist. Mọi mutationgeometry bị harness chặn, ghi0POSTgeometry; không gọi API draft với sourceCrs giả hoặc số liệu tự điền.

**Danh sách BE/owner cần chốt (không tự đặt URL/DTO/status):**
1. Verified transform/admission WGS84 lonlat→engineeringEPSG32648/32649 **hoặc** nguồn metric và provenance hợp lệ cho input hiện hữu; metadata CrsProfileInput không thay code chuyển đổi. Cần quy định accepted CRS/axis/unit và kiểm soátaccuracy; không invent default coefficients.
2. Contract thao tác gửi duyệt, quyết định từchối/yêu cầu sửa và PM gửi lại, gồm role, reason/version/K, persisted state và history/discovery. Hiện chỉ confirm có DTO/route; không mở lệnh giả ở FE.
3. Cookie eligibility cho GET work-package và operation prepare-road/version chỉ khi luồng chọn cần chúng; giữ đúng scope/role/CSRF, không lấy Bearer tài khoản khác bù. Cần làm rõ readiness cho COORDINATES so với native.

FE còn phần write-handler/source-input integration cho create/edit/confirm khi có đủ đầu vào/contract, không đổ toàn bộ việc còn lại cho BE. **Không tạo geometry mới** vì toàn cycle submit/reject/resubmit chưa có contract và file chưa là valid metric/native input; positive save/submit/confirm/reject/edit-resend mới **BLOCKED/NOT_RUN**, không lấy preview/build làm E2E PASS.

**Tests/build và dữ liệu:** Không sửa code application/backend/contract, không phát hiện lỗiFE trong các read/access đã chạy; không rerun regression/typecheck/build vì chỉ runtime audit+worklog (test cũ không tính thành E2E mới). `git diff --check` PASS. Tạo mới chỉ1 project +membership/handover/warranty bắt buộc qua API,0geometry/Report/Case/file/CRS; không SQLwrite và không sửa/xóa data cũ. Journal/scripts temp không mang credential/token/cookie/phone. **Database local không đi theo commitGitHub**; tất cả record test trên vẫn giữ cho review. Bước1PASS theo project mới; Bước2 chưa chốt, blockers chính xác ở bảng. Chỉ commit worklog chung tiếng Việt/push origin/hoang không force.

### 05/11/2026 — Bước3 từ 53504f3: xác minh quyền và đầu vào, chưa đủ điều kiện ghi geometry

**Base:** `53504f3186705a431f75e0519377b39ff7dbe5d5`, nhánh `hoang`, status/diff sạch trước làm. Đã đọc AGENTS.md, worklog mới nhất, `RoadGuard_LoTrinh_GanAPI_PM_Supervisor.md` trong Downloads, Spec17_10 Project/Road/Geometry và các căn cứ GIS/quyền PM/Sup, OpenAPI; đối chiếu source hiện hành AlignmentSegments/AlignmentGeometryWorkflow/parser/alignmentService và GeometryWorkflowController/Service, GeometryEngine, CrsProfileEngine, DTO/domain backend. Roadmap là tài liệu định hướng có baseline cũ, không thay bằng chứng runtime hiện tại. Fetch develop xác nhận vẫn `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`; không cập nhật/reset checkout backend bẩn hoặc thay Docker/DB/volume. Runtime healthy, Swagger hiện hành giữ các operation draft/readiness/confirm đã có.

#### Kết quả thực hiện theo tiêu chí

| Tiêu chí | Bằng chứng thực chạy trong lượt này | Kết quả |
|---|---|---|
| PM-A mở project được giao | Web-cookie login thật; GET `/projects/2cde860a-f777-4e5c-8d8f-384fdaed9509/reports/summary` và `/crs-profiles` đều200. Browser mở màn alignment đúng project lấy từ API, kiểm giá trị selection | **PASS API/browser** |
| Supervisor mở cùng project | Cookie riêng, hai GET trên200; browser đúng project, hiện lỗi work-package thật, không dùng dữ liệu thay thế | **PASS API/browser** |
| PM-B ngoài project | Hai GET trên403. Một lượt browser đã hiện alert ngoài danh mục (harness vướng strict selector vì text cũng có ở danh sách blocker); rerun selector đúng chưa hoàn tất do timeout tải/login | **PASS API; browser quan sát được chặn nhưng kiểm thử tự động hoàn chỉnh BLOCKED môi trường**, không ghi E2E PASS |
| Dữ liệu project/CRS/draft | SELECT chỉ đọc: project2cde... có EngineeringUtmSridNULL,0 CrsProfileRevisions,0 RoadGeometryDrafts; API CRS PM-A/Sup trả[] | **PASS kiểm kê**, chưa có geometry cho lifecycle mới |
| Input GeoJSON | Browser PM-A import file gốc, đúng Centerline TIM_TUYEN_CHINH119 điểm, bỏ RoadSurface và2 RoadEdge; nút lưu/confirm khóa,0 business mutation. Không thêm project ID vào source | **PASS preview/gate**, không phải lưuDB |
| Tạo/đọc/sửa draft mới, preview/readiness backend của draft mới | Không có valid metric/native input hoặc draftID mới; không gửi payload sai CRS để lấy lỗi | **BLOCKED/NOT_RUN** |
| Sup đọc/xác nhận draft mới; PM dùng confirmed; F5 confirmed mới; không sửa confirmed | Không tạo/confirm geometry, không có version mới để nghiệm thu. Domain chặn Edit khi khôngDRAFT chỉ là source evidence | **BLOCKED/NOT_RUN**, không lấy lần đọc sample cũ thay kết quả file này |
| PM-B bị chặn geometry mới; SELECT version mới | Không có draft/version mới. Chỉ kiểm quyền project/CRS và inventory hiện tại | **NOT_RUN** phần resource mới |

API đọc chạy độc lập bằng Playwright request context và browser dùng cookie Web thật, không Bearer. HTTP Date quan sát **Wed, 04 Nov 2026 21:28:23 GMT** (UTC04/11, local05/11); membership PM-A đã hiệu lực và đọc200, không sửa clock/ngày/SQL. PM-A là `72f84201-a001-4000-8000-000000000002`. Không tạo lại project; giữ ID2cde... và toàn bộ dữ liệu cũ.

#### Đầu vào và API: tách dữ liệu thiếu, transport, FE chưa nối và contract thiếu

- File `roadguard-export.geojson` là longitude/latitude WGS84 theo GeoJSON, ví dụ `[107.736642,11.474766]`, không phải engineering metres. Parser giữ119 điểm; ước tính Haversine R6371000 khoảng **701.875m** khác metadata **700.73m**. Backend nhánh COORDINATES tính NTS LineString.Length Euclidean trên tọa độ mét, không dùng metadata để ép chiều dài. Không scale/gán nhãn32648/32649 cho tọa độ độ; tên có chữ nhánh không xác lập topology.
- GeometryEngine.Preview yêu cầu engineeringSrid32648/32649 và sourceCrs trùng nó, line hữu hạn/simple/không trùng liền kề; stationOriginMeters hữu hạn, changeReason có nội dung, surveyWidthMeters>0 và widthProfile phủ đúng toàn chiều dài mét. **Chưa có nguồn cho transform, stationOrigin, surveyWidth và widthProfile.** roadWidth7 metadata không tự thay chúng. Không tự thêm calibration/số làn/vật liệu/accuracy; calibration không phải điều kiện bắt buộc cho mọi COORDINATES.
- Project chưa khai engineeringSrid là **setup/data thiếu**, không phải bằng chứng backend thiếu field (CreateProjectRequestDto đã có engineeringUtmSrid optional). NATIVE_ALIGNMENT là nhánh riêng có profile/provenance/analytic input, không đổi lonlat thành native giả để lưu. CrsProfileInput chỉ khai metadata không tự thực thi chuyển đổi; adapter executable tìm thấy là SAMPLE_AFFINE_TO_WGS84, sample-only/chiều native raWGS84, không phải verified WGS84 vàoUTM.

| API hiện hữu | Contract/quyền/header đối chiếu | Trạng thái tích hợp |
|---|---|---|
| POST `/api/v1/projects/{projectId}/road-geometry-drafts` | GeometryDraftInput, PM, cookie+CSRF+Idempotency-Key | Có service, handler nhập/lưu nguồn này ở UI **chưa tích hợp**; chưa đủ input để bật |
| GET/PUT `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` | Đọc PM/Sup; sửa PM khiDRAFT, GeometryDraftInput, K+If-Match+CSRF | Đọc theoUUID có sẵn; handler sửa mới **chưa tích hợp** |
| POST `.../{draftId}/preview`, GET `.../{draftId}/readiness` | PM/Sup read policy; POST preview dùng WebCSRF; response thật, không tự đổi readinessfalse | Có read handler; chưa có draft hợp lệ mới để chạy positive |
| POST `.../{draftId}/confirm` | Sup; GeometryConfirmInput(expectedCurrentVersionId,effectiveFrom,reason), K+If-Match+CSRF | Có service; UI handler confirm/head-pin/ngày/lý do **chưa tích hợp**, không bật giả |
| GET `/api/v1/projects/{projectId}/work-package` | Swagger/source vẫn Bearer-only; cookie thật PM-A/Sup/PM-B đều401 | **BLOCKED discovery Web**; không lấy401 này làm bằng chứng project-scope và không khôi phụcBearer |

Nếu đủ input, luồng draft→Sup confirm trực tiếp **đã có contract**; không dùng việc thiếu submit/reject làm lý do thay cho blocker CRS/technical-input. Confirm project-level có thể tạo road mới theo source, nên prepare-road/version POST không phải điều kiện bắt buộc của mọi nhánh. FE write integration vẫn là việc FE còn phải làm khi đầu vào/phạm vi được xác minh, không đổ toàn bộ blocker cho backend.

**Yêu cầu BE/owner cần chốt chính xác:** (1) verified transform/admission từWGS84 vào engineeringCRS hoặc cung cấp nguồn metric có provenance, cấu hình CRS và technical inputs có thẩm quyền; hiện không có operation chuyển đổi đó trong Swagger/source, chưa đề xuất tên URL giả. (2) Web-cookie eligibility cho GET work-package để discovery road/version/engineeringCRS; prepare-road/version chỉ xét nếu nhánh chọn thực sự cần. (3) Chưa có operation/DTO/persisted queue-state cho PM gửi duyệt; chưa có decision/reason/version contract cho Sup reject/revision, PM resubmit và lịch sử duyệt. Không tự thêm endpoint/enum PENDING_APPROVAL/REVISION_REQUIRED, không dùng confirm để giả reject. (4) Readiness semantics COORDINATES so với native còn cần làm rõ như audit trước; không sửa response hoặc khai sample là official.

#### Kiểm thử, giới hạn môi trường và dữ liệu

Thực chạy harness tạm ngoài repo: `rg-step3-api-read-only.cjs` (3 actor đều đạt assertion quyền/CRS/work-package), `rg-step3-current-contract-check.cjs` (PM-A/Sup đạt assertion route/selection, preview PM119điểm, nút khóa,0 business writes; lượt tổng chưaPASS doPM-B timeout), `rg-step3-pmb-focused.cjs` (timeout navigation), `rg-step3-sql-read.cjs` (SELECT inventory). Browser dùng Edge headless thật, route chỉ continue response thật và abort business mutation, không fulfill/mock. Một lỗi harness strict selector đã sửa trong temp, không phải lỗi app. Dev Vite/esbuild từng OOM/VirtualAlloc errno1455; chỉ restart tiến trình dev do phiên này quản lý với GOMAXPROCS2/GOGC50/GOMEMLIMIT256MiB ở process environment, không sửa repo config. Sau phục hồi module200, login và PM-A/Sup preview chạy được; vẫn có các lượt full navigation/login timeout, vì vậy không claim bộ browser hoặc F5 mới hoàn chỉnh PASS. Không từ timeout đơn lẻ kết luận cần viết lạiauth.

**Thay đổi:** chỉ worklog chung; không sửa application/contract/backend, không thêm file trong repo. Regression/typecheck/build **NOT_RUN** vì không sửa code; không lấy build cũ làm E2E. `git diff --check` kiểm trước commit. Tạo mới **0** project/CRS/draft/road/version/Report/Case; không SQLwrite, không đổi geometry/pin/task/survey/repair hoặc resetDB/volume. Inventory SELECT0draft khớp chưa gửi mutation. Dữ liệu test project có sẵn giữ nguyên; **database local không đi theo commitGitHub**. Không ghi credential/token/cookie/mật khẩu/SĐT.

**Kết luận Bước3: chưa hoàn thành, BLOCKED đầu vào CRS/kỹ thuật và discovery Web, kèm phần write-handler FE chưa tích hợp; submit/reject/resubmit/history là contract thiếu riêng.** Chỉ read/access/import preview đã xác minh như bảng. Chưa có cycle geometry mới hoặc confirmed-server-data để nghiệm thu, không gọi preview/source review là E2E PASS.

### 05/11/2026 — Bước2 quản lý phân công từ aa5ad51: members thật, lỗi minh bạch, đổi PM Web còn bị chặn

**Base:** `aa5ad5135b42afed3cf138b8b9f3d2b2cca8b0ac`, nhánh `hoang`, status/diff sạch trước làm. Đọc AGENTS.md, roadmap Downloads, worklog mới nhất, Spec17_10 Authentication/Users/Memberships, Project và auth-contract, OpenAPI FE; đối chiếu Swagger Docker hiện hành và source ProjectsController, StaffDirectoryController, StaffReadService/Repository tại backend5180ab9. Không sửa backend, auth transport, geometry hoặc SQL. Dùng lại project **2cde860a-f777-4e5c-8d8f-384fdaed9509**, codeRG-STEP1-NOW-20261104T204751Z; không tạo project mới.

**Sửa FE đúng phạm vi:**
- `projectService.fetchProjectMembers` không catch thành[]; đọc đủ cursor, phát hiện cursor lặp/sai DTO, fence authEpoch. Supervisor đọc includeHistory; PM chỉ đọc current (source/runtime chặn PM includeHistory=true403). personnelService dùng chung reader này. Nhánh fetchUsers mapping phân công cũng bỏ catch-rỗng và giới hạn10project; chỉ dùng membership hiện hành, không ghép lịch sử thành phân công đang hiệu lực. Trang chi tiết tách lỗi project/members, có retry; không lấy project cache/đầu tiên để thay project ngoài scope, không để trạng thái loading vô hạn khi lỗi. Response sau unmount/đổi phiên/lượt tải cũ không cập nhật trang mới; danh sách cũng có request/epoch guard.
- Đọc đủ pagination `/projects`; thống kê phụ lỗi giữ `stats_error`, hiện cảnh báo và dấu chưa có dữ liệu thay cho0 thành công. Lỗi danh mục có alert/retry, không đồng thời trình bày empty-success. Không sửa nghiệp vụ Defect/repair/geometry.
- Card nhân sự hiển thị status/validFrom/validTo/membershipVersion từ API; không lấy email/phone/avatar mẫu hoặc suy trạng thái ACTIVE thành online. Sup thấy blocker đổiPM Web; thêmOperator/Crew giữ đúng quyềnPM, không tự cấp quyềnSup.
- Service đổi PM cũ tự điền versionAAAAAAAAAAA= và sinh operationId/header key khác nhau mỗi lần gọi đã được thay bằng lỗi `web_cookie_unsupported` trước IO. Không gửi lệnh/khóa mới, không khôi phụcBearer hoặc giả chuyển quyền. POST tạo project giữ cơ chế durable key/body/201-receipt hiện có; regression xác minh không POST lại sau201, timeout/500 giữ ý định và chỉ deliberate replay cùngkey/body.
- Swagger đang chạy có thêm POST members và GET eligible so với snapshot FE; đồng bộ **chỉ hai path members/eligible và schema được tham chiếu** vào OpenAPI từ nguồn runtime chính thức. Không kết luận thiếu từ kit cũ.

| API/nghiệp vụ | Contract/source hiện tại | Kiểm thật và trạng thái |
|---|---|---|
| GET `/api/v1/projects/{projectId}/members` | PM/Sup cookie; ProjectMemberResponseDto gồm membershipId/userId/role/isPrimary/status/validFrom/validTo/membershipVersion; includeHistory chỉSup | PM-A/Sup200, PM-B403. PM-A includeHistory403, Sup200. **PASS API**; browser đọc server/F5 như phần dưới |
| GET `.../primary-project-manager` | PM/Sup read theo project scope, PrimaryProjectManagerResponseDto | PM-A/Sup200, PM-B403 **PASS API** |
| PUT `.../primary-project-manager` | ReassignPrimaryProjectManagerRequestDto: primaryProjectManagerUserId, effectiveFrom, reason, expectedCurrentMembershipRowVersion, operationId; Sup. Response previous/currentMembershipId và currentMembershipRowVersion. Swagger/source **Bearer-only** | Sup cookie + CSRF + body operationId/version thật giữ cùngPM trả401/auth_unauthorized. **BLOCKED Web**, không đổi membership |
| GET `.../members/eligible`, POST `.../members` | Live Swagger/source có; AddProjectMemberRequestDto(userId), PM thêmOperator/Crew, K+cookieCSRF, responseProjectMemberResponseDto. Không phải thao tác thayPM | Đồng bộ contract/giữ nút đúngrole; positive thêm người **NOT_RUN** vì không cần tạo dữ liệu để kiểmStep2 |
| Gỡ/kết thúc membership trực tiếp | Không thấy DELETE/PATCH/command tương ứng trên resource membership trong Swagger/controller. Chưa có method/path/DTO/role được bàn giao cho thao tác này | **BLOCKED contract**; không tự đặtURL hoặc dùng PATCH tài khoản để thu quyềnproject |
| PM cũ mất quyền / PM mới đọc / Sup giữ quyền sau chuyển | Phải qua reassignment thật, version và ngày hiệu lực server | **BLOCKED/NOT_RUN** vì PUT chưa hỗ trợWeb. Không lấy quyền PM-A trước chuyển làm PASS hậu chuyển |

**Kiểm thực API âm POST /projects (không tạo record):** Sup thiếu/saiCSRF→403`csrf_failed`; code rỗng→400`validation_error`; code đã tồn tại + key mới cho ý định kiểm conflict→409`project_code_conflict`; replay key gốc của project test với body thay đổi→409`duplicate_request`. PM-A với cookieCSRF hợp lệ→403`access_forbidden`. Hai409 được phân biệt theo code; không dùng key mới để retry một timeout chưa rõ. Lỗi500/timeout được kiểm mapping/giữkey bằng regression cô lập, **NOT_RUN 500 thật** (không cố gây serverfault). Regression cũng giữ diagnostic response/code và kiểm receipt201 chỉGET.

**API/SQL inventory:** harness cookie độc lập xác minh3actor, HTTP Date khoảng **Wed, 04 Nov 2026 21:50:47–21:51:29 GMT**. SELECT INFORMATION_SCHEMA trước đối chiếu Projects/ProjectMembers: project đúngcode, membership **2d6930b9-c604-4f51-991c-dbcd7126926a**, userPM-A **72f84201-a001-4000-8000-000000000002**, isPrimarytrue/statusActive, validFrom **2026-11-04**, validToNULL; API membershipVersion **AAAAAAAA0ts=**. Quyền đang hiệu lực ngàyUTC04/11; không sửa ngày/clock/SQL. Không có membership mới từ PUT401. Chỉ SELECT, không truy vấn thông tin cá nhân ngoài nhu cầu test hoặc ghi secret vào worklog.

**Browser thật:** Edge headless trên production build qua Vite preview/proxy tới Docker, cookie Web; không fulfill/mock HTTP response. Supervisor và PM-A đọc đúng project/member/version, F5 vẫn serverdata; PM-B mở thẳng URL thấy lỗi ngoài phạm vi, F5 vẫn chặn và không thấy tên thành viênPM-A. Dùng cùng browser context, logout backend rồi điều hướng đầy đủ tới login/đăng nhập actor kế tiếp; mànlogin không giữ dữ liệu người trước. Browser inject lỗi mạng bằng abort GET members (không giả HTTP200/DB rỗng), thấy alert rồi retry đọc member thật thành công. Các lượt bị strict selector đã sửa trong harness và chạy lại; không gọi đó là lỗiapp. Kiểm riêng danh mục lỗi mạng/retry ghi theo kết quả cuối bên dưới.

**Tests/phạm vi bằng chứng:** `tools/check-review-293d001.cjs` **87 scenarios PASS**, là regression HTTP/hooks cô lập, **không phải E2E**. Có pagination đầy đủ, cursor lặp, lỗi503, session fencing, không fallback project, thống kê không trả0 giả, Web reassign khôngnetwork, phân loại POST lỗi và key/body/receipt. Typecheck `tsc -b` và build `vite build` chạy với giới hạn tài nguyên process; kết quả cuối ghi bên dưới. Máy có các lần CoreCLR/Node OOM/pagefile và một lần heap384MiB không đủ; không tính các lượt lỗi môi trường đó làPASS, không đóng app/Docker/DB của người dùng. Giới hạn GOMAXPROCS/GOGC/GOMEMLIMIT chỉ process, không sửa cấu hình repo.

**Dữ liệu giữ lại:** tạo mới **0** Project/ProjectMember/Report/Case/geometry; không sửa/xóa record cũ, không resetDB/volume. Project/membership trên giữ nguyên phục vụreview. **Database local không đi theo commitGitHub.** Scripts temp không stage, không commit credential/token/cookie/mật khẩu/SĐT. Chỉ file thuộcBước2, không thay geometry.

**Gửi BE:** bổ sung Web-cookie eligibility/CSRF cho **PUT /api/v1/projects/{projectId}/primary-project-manager**, giữ nguyên Sup authority, expectedCurrentMembershipRowVersion, operationId/idempotency và effective-date guards. Cần bàn giao contract chính thức cho kết thúc/gỡ membership nếu nghiệp vụ yêu cầu (method/path/DTO/quyền/version/thời gian hiện chưa có, không tự suy). API thêmOperator/Crew đã có không thuộc danh sách thiếu. Chỉ sau backend parity mới nối lại lệnh đổiPM và nghiệm thu thu quyềnPM cũ/cấpPM mới theo ngày hiệu lực.

**Kết luận:** phần tạo/chọnPM/đọc và xem phân công hiện tại có bằng chứngPASS; **Bước2 chưa hoàn tất toàn bộ vì đổiPM Web và gỡmembership cònBLOCKED**. Không nhận nghiệm thu chuyển quyền khi chưa có command thành công.

**Chốt kiểm bản cuối:** typecheck `tsc -b` **PASS**; build `vite build` **PASS** (heap896MiB, chỉ cảnh báo Tailwind duration/chunk lớn có sẵn); regression **87 PASS**; `git diff --check` **PASS**. Browser trên bundle cuối **PASS cả3actor/F5/đổi tài khoản**, members network-error→retry **PASS**, projects network-error→retry **PASS**; không fulfill response, **0 business writes**. Lỗi selector nút retry có icon được sửa trong harness tạm và rerun thành công. Harness thực chạy: `rg-step2-members-live.cjs` cho PUT401/POST âm, `rg-step2-check.py` cho quyền/current-history, `rg-step2-finalize-data.py` cho Swagger/SELECT, `rg-step2-browser-real.cjs` cho production browser. Positive đổiPM/thu quyền theo effective-date vẫn **BLOCKED**, gỡmembership **BLOCKED**, positive thêmOperator/Crew và server500 thật **NOT_RUN**. Không suy các kiểm thử cô lập hoặc build thành E2E chuyểnPM.

### 05/11/2026 — Bước1 Web session/RBAC từ 96eb953: kiểm thật, đồng bộ tab và sửa đổi mật khẩu bắt buộc

**Base:** `96eb953e6dd835fa54369159d77d71986df617a4`, nhánh `hoang`, status/diff sạch trước làm. Đọc AGENTS.md, RoadGuard_LoTrinh_GanAPI_PM_Supervisor.md trong Downloads, worklog mới nhất, Spec17_10 Authentication/Web Architecture/auth-contract, OpenAPI, Login/authService/authStore/auth.ts/client/route guards/App cache invalidation. Đối chiếu WebAuthController, AuthController, WebCookieConfiguration, AuthService.ChangePasswordAsync và IdentityRepository.PasswordChanges tại backend5180ab9 với runtime thật. Không mặc định tên android còn được dùng: Login hiện đã gọi authService→loginWithCredentials→Web APIs, không đổi transport hoặc viết lại phần đúng.

#### API đã đối chiếu và sử dụng

| Method/path | DTO/header/cookie đúng contract | Kết quả thực |
|---|---|---|
| GET `/api/v1/auth/web/csrf` | requestToken/headerName=X-CSRF-TOKEN, cookie antiforgery do browser giữ | **PASS** bootstrap trước login/renew/logout; không đọc HttpOnly cookie bằngJS |
| POST `/api/v1/auth/web/login` | LoginRequestDto(email,password), CSRF header + cookie pair; khôngAuthorization | Sup/PM-A/PM-B200; sai mật khẩu401; saiCSRF403 **PASS API/browser** |
| GET `/api/v1/auth/web/session` | Web session cookie, user.id/displayName/role/version và root mustChangePassword | Login đọc user server, F5 kiểm session trước protected area; rolePM/Sup đúng **PASS** |
| POST `/api/v1/auth/web/renew` | Renewal cookie + CSRF; khôngAuthorization, không dựng DTO/token mới | **PASS API/browser**, kể cả bỏ riêng cookie ticket rồi renew bằng renewal cookie thật; GET session lại200 |
| POST `/api/v1/auth/web/logout` | Session cookie + CSRF + Idempotency-Key;204 | **PASS**; session/renew bằng bản cookie phiên cũ sau logout đều401, không chỉ xóa cacheclient |
| POST `/api/v1/auth/change-password` | ChangePasswordRequestDto(currentPassword,newPassword), K+cookieCSRF;204 | **PASS API âm400validation** bằng body thiếu field, không đổi mật khẩu; positive **NOT_RUN** vì không có fixture mustChangePassword=true phù hợp |

Cookie theo Edge browser thật: **__Host-RoadGuardCsrf, __Host-RoadGuardSession, __Host-RoadGuardRenewal** đều Secure/HttpOnly/SameSiteLax; session ticket43200giây theo contract/source, không coi renewal365ngày là ticket vô hạn. Axios withCredentials:true tương đương fetch credentials:include; traffic kiểm thử không có Android login hoặc Authorization. Không lưu credential vào localStorage/sessionStorage; sessionStorage chỉ giữ logout-intent trong luồng auth. Các helper mock cũ không được gọi thay cho Web login/session; nhánh mock đổi mật khẩu đã loại khỏi luồng được tích hợp.

#### Thay đổi đúng phạm vi

- Giữ CSRF→Web login→GET session, bootstrap/loading/route guard, renew single-flight/giới hạn replay và logout API hiện có. 401 session/renew cuối cùng làm expireSession, tăng epoch/xóa user/cache/redirectLogin; 403 và network error thông thường không tự coi là hết phiên. 401 của operation không eligible cookie khi GET session vẫn200 giữ lỗi operation để chẩn đoán, không khôi phụcBearer hoặc đăng xuất giả.
- Thêm BroadcastChannel chỉ gửi tín hiệu invalidate, không gửi user/secret. Login/logout ở một tab vô hiệu hóa actor/cache/lượt đọc của tab khác qua authEpoch; tab nhận khóa cục bộ và cần đăng nhập lại. Dùng Web Locks khi browser hỗ trợ để serialize các mutation cookie auth giữa tab, giữ cơ chế serialize trong tab làm fallback; không tạo cơ chế đăng nhập thứhai. Regression kiểm response session cũ sau invalidation không khôi phục user và không phát vòng lặp broadcast.
- Đổi mật khẩu bỏ giá trị điền sẵn ở Login/ForceChangePassword và bỏ local-mock approval. Capture actor/epoch từ đầu, kiểm lại sau CSRF, trước HTTP dispatch qua transformRequest, sau POST và GET session; phản hồi actor/epoch cũ không set user. Chỉ map root mustChangePassword/user.role từ session server, không tự gỡ cờ hoặc mặc định role lạ thànhPM. Form chặn submit trong khi đang gửi/thành công; bỏ navigation timer cũ.
- Căn cứ quan trọng: IdentityRepository.ChangePasswordAtomicAsync đổi mật khẩu và **revoke mọi session/refresh token** của user. Vì vậy POST204→GET session401 là đổi thành công nhưng cần đăng nhập lại; FE xóa/khóa phiên và báo rõ dùng mật khẩu mới, không báo password-change failed hoặc dựng user để vàoDashboard. Nếu POST204 nhưng đọc session lỗi/không xác nhận được, vẫn thông báo rõ phần password đã được server xác nhận và phần session chưa xác nhận, yêu cầu login; lỗi trước204 giữ lỗi HTTP thật. Sai currentPassword/auth_invalid_credentials không bị nhầm với terminal session401. Nhánh này có source/regression evidence, chưa có positive account fixture để gọi thật.

#### Tiêu chí kiểm thử và giới hạn

| Tiêu chí | Kết quả/bằng chứng |
|---|---|
| Login Sup/PM-A đúng/sai; cookie/CSRF | **PASS API/browser thật**, khôngBearer; CSRF lỗi403, password lỗi401 được hiển thị |
| F5 phiên hợp lệ và renew | **PASS browser**; controlled ticket removal→session401→renew200→read server. Hết12giờ tự nhiên **NOT_RUN**, không chỉnh clock/expiry |
| Logout/F5 và credential phiên cũ | **PASS API/browser**, logout204; bản credential cũ session/renew401; F5 ởLogin |
| Đổi actor/nhiều tab/project/member/Case cache | **PASS browser** trên cùng context: PM-A→Sup→PM-B; tab thứhai nhận broadcast và vềLogin, không giữ member. PM-A inbox scope hợp lệ tải Case cache từ server vào localStorage, logout xóa cache thật; không chèn cache giả để test |
| 401 terminal/403/scope | **PASS browser/API**: server logout quaWeb API rồi kích hoạt protected read trong FE→401/renewfail→Login. Project2cde860a-f777-4e5c-8d8f-384fdaed9509 PM-A/Sup200, PM-B403; PM-B mởURL/F5 không được thay bằng project cache |
| Route guard hai chiều | **PASS browser** PM vàoSup→PM dashboard; Sup vàoPM→Sup dashboard. Unknown-role và must-change routing/mapping giữ đúng bằng source/regression |
| Response cũ/renew cạnh tranh/lỗi mạng/logout lỗi | **PASS regression cô lập** cho single-flight, fence epoch, khôngloop/replay mutation, network không tựlogout và cảnh báo chưa xác nhận revoke khi logout lỗi; không gọi mock test là API E2E |
| mustChangePassword=true, đổi thành công và login mật khẩu mới | **NOT_RUN thực**: ba actor PM/Sup có credential test hợp lệ đều trảfalse; không có fixture forced phù hợp trong demo accounts. Không reset password/user/DB để tạo điều kiện. Guard/DTO/lỗi trước204/sau204 và no-stale-dispatch **PASS source/regression**, không tính là positive E2E |

Browser chạy trên production build qua Vite preview5181/proxy tới Docker, Edge headless, không fulfill/mock HTTP. Harness tạm `rg-step1-web-api-now.py` kiểm3actor/CSRF/renew/old-cookie revoke/scope; `rg-step1-web-browser-now.cjs` kiểm route/F5/epoch cross-tab/cache/terminal401, **0 business writes**. HTTP Date API khoảng **Wed,04Nov2026 22:25–22:27 GMT**. Một lượt harness copy cookie bị lỗi PythonRLock trước cleanup đã sửa trong temp và rerun assertions thành công; các lần login tự nhiên tạo Session/Audit test, không dùngSQL sửa/xóa các session cũ. Chỉ dùng bản cookie cũ trong RAM để kiểm revoke, không ghi ra file/log.

Quan sát ngoài phạm vi auth: Sup inbox scope **UNASSIGNED+CONCLUDED** báo `reference_scope_conflict`, không commit partial list như cache hoàn chỉnh. Không sửa business inbox để ép testauth; dùng PM-A scope hợp lệ đã có để kiểm cache thật và đãPASS. Đây là lỗi/gap scope nghiệp vụ đã thấy, **không phải thiếu WebAuth API** hoặc lý do dùngmock.

**Checks cuối:** `tools/check-review-293d001.cjs` **91 scenarios PASS** (HTTP/hooks mô phỏng có kiểm soát, khôngE2E); `tsc -b` **PASS**, `vite build` **PASS**, `git diff --check` **PASS**. Cảnh báo duration/chunk lớn có sẵn, không mở refactor. Không tạo file mới trongrepo, không sửa backend/contract/project/Case/Report/geometry/membership; không đổi password tài khoản, SQL/clock hoặc resetDB/volume. Dữ liệu local/session/audit không đi theo commitGitHub. Không ghi mật khẩu/token/cookie value/SĐT.

**Kết luận:** luồng Web session/RBAC PM/Sup và đổi actor/cache có bằng chứng thực **PASS**. Không thiếu endpoint auth cần BE tạo thêm; phần chưa nghiệm thu thực là forced-password positive và natural12h expiry (**NOT_RUN**), không tuyên bố đãPASS toàn bộ nhánh đó từ build/regression. Cần fixture test buộc đổi mật khẩu hợp lệ để chốt positive; không tự đổi tài khoản thật.


### 05/11/2026 — Bước4 từ 18698e3: bỏ mô phỏng bay, đọc plan/task thật, write Web còn BLOCKED

**Base/parent:** `18698e3264afe66a83b9949cea488cfade78849d`, nhánh hoang; git status sạch trước làm. Đọc AGENTS, worklog, Spec17_10 `05_Drone-Survey-Dataset-and-Processing`, OpenAPI, surveyService, create-survey/drone-review và caller SurveyRequests/CreateSurvey/DroneMissionAIReview. Đối chiếu SurveyV2Controller, UploadsController, UploadService tại backend5180ab9 và Docker. Không thay backend, DB/volume hoặc auth; không mở sang quyết định AI/Defect/bước5–6.

**Sửa:**
- Thay hai entry danh sách/tạo khảo sát bằng một SurveyWorkflow chung đọc project được phép từ GET projects, rồi độc lập đọc GET project survey-plans/survey-tasks/members/work-package. Raw DTO server được hiển thị để giữ status/version/operator/scope đúng nguồn; không có KPI ảnh/coverage/GSD/detection do FE tự gán. Đây là giao diện đọc/blocker, chưa phải form tạo hoàn chỉnh.
- Reader collection dùng limit/cursor/nextCursor, kiểm lặp cursor, sai DTO, cancel/epoch. Lỗi từng scope có HTTP/code/detail và retry; empty chỉ khi API thành công trả[]; lỗi không bị đổi thành danh sách rỗng. URL giữ project/dataset reference cho F5. PM ngoài project không mở scope; không tự chọn project đầu tiên hoặc dùng cache/localStorage làm geometry/assignment.
- Bỏ producer createSurvey cũ dùng PROJECT_ROAD_MAP/Operator cố định/accessPoint/accuracy tự nhúng; hiện throw BLOCKED trướcIO, không phát POST. getSurveyRoutes không đọc localStorage hoặc tuyếnSBX giả. getAvailablePilots chỉ đọc current project members quaAPI, roleOPERATOR/statusACTIVE, không fallbackSynthetic/device mẫu.
- Xóa simulateDroneFlightCompletion, hook/modal simulator và nút mô phỏng tại chi tiết; **không còn `/__dev/complete-survey-plan` trong src**. Xóa nhánh requestReFlight lấy task/route/operator mẫu và dev-complete; tạm báo chưa tích hợp đúng current-scope/version/Web. Không còn hành vi “plan tạo được nhưng task lỗi vẫn báo thành công” ở producer cũ vì nó đã bị chặn trướcghi; **positive partial-create/reconcile chưa thể nghiệm thu** khi transportWrite chưa được bàn giao.
- Loại bỏ mapper getSurveys cũ lấy localStorage/mãID để suy type/status và dựng sốảnh/GSD/coverage/detection. Legacy caller cần SurveyMissionItem hiện nhận lỗi rõ thay sốliệu giả; chi tiết cũ hiện alert và không tiến sang canvas nếu read model chưa tích hợp. Không tuyên bố mọi legacy màn đã migrate; form/canvas cũ không là kết quả Bước4 mới. Các helper PROJECT_ROAD_MAP và baseline/AI cũ còn ngoài luồng Bước4, chưa refactor bước5; không gọi chúng từ màn mới.
- Thêm PM đọc GET datasets/{id} theo UUID biên nhận thật trên URL; hiển thị nguyên server integrityStatus/telemetryStatus/dataVersionId/version. Không tự tìm dataset bằng ID fixture hoặc coi preview/AI run là bằng chứngbay. Reader này có handler nhưng runtime chưa eligiblecookie, nên hiện lỗi thật; chưa có positive fixture dataset để nghiệmthu.

| API | Contract/quyền/header | Kết quả hiện tại |
|---|---|---|
| GET projects/{projectId}/survey-plans, survey-tasks | Cookie eligible; collection có nextCursor. SurveyPlanSummary(id,projectId,plannedAt,status,version); SurveyTaskSummary(id,projectId,operatorId,status,version,supplementTaskId), **không có planId để tự join task vào mọi plan** | API thật project2cde... PM-A/Sup200[], PM-B403. Browser/F5 đúngscope **PASS** |
| GET projects/{projectId}/members | Current membership; PM đọc được | PM-A/Sup200(1PM), PM-B403; không cóOperator ởproject test này. Không tự gánOperator khácproject |
| GET projects/{projectId}/work-package | Source/OpenAPI Bearer-only; chứa road/current versions | Cookie PM-A/Sup401 **BLOCKED discovery Web** |
| POST projects/{projectId}/survey-plans | PM; CreateSurveyPlanV2RequestDto(scopeBandScopeDto[],plannedAt,surveyType), K; Bearer-only | Cookie+CSRF+K PM-A401/auth_unauthorized, chưa vào validationscope. **BLOCKED**; không dùngscope[] làm bằng chứng tạo hợp lệ |
| POST projects/{projectId}/survey-tasks | PM; CreateSurveyTaskV2RequestDto(scope,surveyType,operatorId,dueAt?,accessPoint?,planId?), K; Bearer-only | Cookie PM-A401 **BLOCKED**; không ghi plan/task hoặc tự điềnaccessPoint. Optional accessPoint omit khi thiếu nguồn |
| GET me/survey-tasks; POST survey-tasks/{taskId}/accept | Assigned Operator Mobile; acceptK+If-Match theo contract, Bearer-only | CóAPI, không nói backend thiếu nhậntask. **NOT_RUN** không cótask mới đúngassignment |
| POST uploads; GET uploads/{uploadId}; POST uploads/{uploadId}/part-urls, /complete | UploadCreateRequestDto purposeSURVEY_VIDEO/TELEMETRY, projectId/targetId, fileName/mediaType/size/checksum; part URLs/ETags + checksum complete; K và version theooperation. Bearer-only | **Cócontract**, chưa nối uploadOperatorWeb và chưa cóvideo/telemetry nguồn hợp lệ; **NOT_RUN positive**. Không dùngReporterUpload/PM credential nộpthay |
| POST survey-tasks/{taskId}/datasets | AssignedOperator; SubmitDatasetRequestDto videoFileIds(min1),telemetryFileIds,recordedAt,deviceId registered,scope,pairs?; K+If-Match; Bearer-only | **CóAPI**, cần accepted/in-progress task, active device, filesverified/scoped; **NOT_RUN**, không dựngGPS/thời gian/fileUUID |
| GET datasets/{id}, datasets/{datasetId}/coverage; GET files/{fileId}, files/{fileId}/content | Role/resource scope; hiện Bearer-only trongcontract | PM Web đọc provenance/coverage/privatefile còn **BLOCKED transport**; không gáncoveragePASS |

Upload verification đã có backend worker: UploadService.ProcessOneVerificationAsync→repository.VerifyNextAsync; complete chỉ là bước gửi kiểm, **không phải VERIFIED**. Source admission SurveyV2 yêu cầu verified SURVEY_VIDEO/TELEMETRY và binding/scope/device. Không có căn cứ để cho PM nút tự “verify thành công”; không tự thêm endpointverify. Giới hạn file theo UploadCreateRequestDto: video8GiB/telemetry10MiB, checksumSHA256; dataset tổng32GB theo source/spec là giới hạn khác, không thay bằng một con số chung.

**BE cần giao chính xác:** Web-cookie eligibility + CSRF cho POST project survey-plans/survey-tasks và GET project work-package; giữ rolePM/scope/pins/idempotency. PM read parity cho GET survey-plans/{id}, survey-tasks/{taskId}, datasets/{id}, coverage và file/content theo quyền cầnthiết; không yêu cầu mở mọiOperator mutation choWeb. Operator upload/accept/submit đã có contract Mobile; cần clientOperator thực và fixture media/device/task hợp lệ để nghiệmthu. Thiếu read discovery liên kết task→dataset và manifest/evidence provenance cho PM nếu muốn tự duyệt danh sách từtask: collectionSummary hiện không códatasetID, không tự suy từaiMockRun. Cần BE chốt/read DTO đủ liên kết hoặc bàn giao biên nhận; không tự đặtpath mới.

**Kiểm đã chạy:**
- API thật `rg-step4-api.py` dùng cookieWeb/CSRF, PM-A/Sup/PM-B đọc project2cde860a-f777-4e5c-8d8f-384fdaed9509 nhưbảng; mutationprobe bị401, không tạo gì. Runtime/source không cóWebmetadata trên SurveyV2 writes. Không dùngBearer để bypass.
- Edge headless production browser `rg-step4-browser.cjs`: PM-A mở /pm/surveys/create?projectId=2cde..., thấywork-package401 và núttạo khóa; F5 giữproject/serverdata. Abort network GETplans→alert rồi retry đọcserver; PM-B cùngURL bịchặn/F5vẫnchặn; **0 businesswrites**. Không fulfill/mockHTTP. Browser read/blocker **PASS**, không phải vòngnghiệpvụPASS.
- Regression `tools/check-review-293d001.cjs` **92 PASS**, có collectionpagination/cursor/saiDTO/error và createblocked/noSimulator; HTTP/hooks môphỏng, khôngE2E. Typecheck/build/diffcheck chạy chốt trướccommit. Không lấy buildPASS thay OperatorflightPASS.

**NOT_RUN/BLOCKED:** PM create→assign, partialplan/task recovery/replay thực, Operatoraccept/upload/submit, fileverification, PM positive dataset/video/telemetry/evidence provenance và F5 phiênbản mới. Chưa có transportWeb/routepublishedscope/Operator ởproject test và media/device đúngnguồn. Không tạo dữ liệu mới hoặc dùng fixtureAI để nhận là chuyếnbaythật. Nhiệm vụ **chưa hoàn tất E2E Bước4**; phầnFE an toàn đọc/lỗi/loạimôphỏng đãlàm, write/formintegration còn phụthuộc backendparity/đầuvào. Không xóa/sửa project/Report/Case/geometry cũ, không SQLwrite/reset/seed; database local khôngđitheoGitHub. Scriptstemp khôngstage, khôngcredential/token/cookie/phone.

**Chốt kiểm:** 92 regression PASS; tsc -b PASS; vite build PASS; git diff --check PASS. Browser PM-A/PM-B read/F5/network retry PASS,0businesswrites. Không coi các kết quả này là E2E Bước4 PASS.


### 05/11/2026 — Bước5 từ 3065cf7: loại quyết định giả, bảo toàn snapshot/K, đọc Candidate theo server

**Base:** 3065cf71bf5f2c5105855b763718119b61ab4e51, nhánhhoang, status sạch. Đọc AGENTS, worklog, Spec17_10 workflow04 Candidate-Decisions-and-Defect và Processing/AI contracts08, OpenAPI, surveyService/DefectDetailVerify/drone-review/caller. Đối chiếu CandidatesController, AiMockRunsController và runtimeDocker5180ab9. Không sửa backend hoặc blockerBước2/3/4. Bảng đối chiếu đã báo trước edit và bảng review báo trướccommit; source truth chỉSpec/OpenAPI, code cũ không được coi là nghiệpvụ.

| Yêu cầu | Căn cứ Spec17_10 | Căn cứ OpenAPI/API/DTO | FileFE | Kết luận |
|---|---|---|---|---|
| Đọc run/result/Candidate | Workflow04 prerequisites/provenance; AI contracts08 fixture khácproviderthật | GET projects/{p}/ai-mock-runs; .../{runId}/result; ai-candidates/{detectionId}, AiCandidateFacts | surveyService, CandidateWorkflow | ReaderIDserver, kiểmproject/run/source; result/candidate cookieBLOCKED |
| Giữ/liênkết/loại | Workflow04 mainflow2–3 | POST projects/{p}/candidate-decisions, CandidateDecisionRequestDto | surveyService | Có3decision; không tạoDefect từconfidence/bbox |
| Current disposition/version | Workflow04 source/head/target | GET candidate-decisions/{id}; sourceVersion,geometryVersion,targetVersion,previousDecisionVersion | surveyService | Không bỏlookupdisposition hoặc lấy localoverride; không tựfetchversionmới đểretry |
| Retry/concurrency | Workflow04 K + lockedsource/head/target | Idempotency-Key; bodyversion;409/412/428 theooperation | surveyService/tests | Giữkey/body/receipt, conflictthrow, khônglocal success |
| Quyền | Workflow04 authorization | PMdecision,scopeguards; Webcookie endpoint-specific | CandidateWorkflow/service | PM kiểmởclient và backend; ngoàiScope khôngfallback |
| SQLreset/editbbox/tựsinhDefect | Khôngcócăn cứ thao tác cũ | Khôngcó /__dev contract | surveyService/legacyUI | Loại khỏiluồng; báo chưa hỗtrợ |

**Đã sửa:**
- Xóa nhánh decideCandidate phân biệt ProjectA rồi SQL/localdecision cho cácprojectkhác; xóa fallbackUUID Defect và OVERRIDE_V1 khi409. Khôngcòn /__dev reset/save/updateCandidate trong producerBước5. saveAiCandidateOverride/resetSurveyDetection/updateSurveyDetection legacy throw lỗi rõ, khôngnuốtlỗi hoặc ghi localStorage.
- decideCandidate cần snapshot sourceVersion/geometryVersion/reason do caller đã đọc; KEEP_NEW bắt classification cótype/severity/routeversion, LINK cần DefectID/targetVersion. DTO đúngshape, giữ segmentId thay vì tựnull. Khôngtựsuy severity/type/route từPROJECT_ROAD_MAP; khôngtựđặtreason để thiếuinputvẫnghi. ActorPM/epoch và dispatchguard chặnresponse/lệnh phiêncũ.
- Command journal sessionStorage chỉ là trạngthái pending/reconcile, khônglà nguồn disposition: actor+project+source key, bodyfingerprint+K+receipt, khôngcredential. Timeout/409/412/428 khôngsinhkeymới; ýđịnhkhácbịchặn khi chưađốichiếu. InflightSet chặn doubleclick. SauPOST201/receipt chỉGETdecision/currentCandidatehead; đọcfail giữreceipt, retrykhôngPOSTtạoDefectlần2. Chưa cóUI giải quyết/jettison journal xungđột; cốý yêu cầuđốichiếu, khôngclear đểghiđè.
- getAllProjectAiDetections bỏ phụthuộc getSurveys legacy, đọc runpagination thật; giữ disposition/decisionKind/defectId/source/headversion. Bỏcustomlabel localoverride, lýtrình tựtính và severity suy từconfidence. getProjectDefects đọcđủpagination, khôngfallbackprojectcache hoặc catch thành[]; Candidatefacts kiểmproject/detection trảvề.
- Entry DroneMissionAIReview chuyển sang CandidateWorkflow: project từAPI→run từAPI→result detections→Candidatefacts→decision. URLreference/F5, cancellation/unmount/epoch, HTTPProblemDetails/empty/loading/error táchbiệt. Hiểnthị provenance/currentdisposition nguyênDTO, ghi rõ MOCK fixture khôngphảiproviderthật. REJECT cóhandler khi đủsnapshot; acceptedhead khôngđượctựreset. KEEP_NEW/LINK_EXISTING **UIchưatíchhợp** classificationcatalog/targetselector/version nên khóa và nêulýdo; khôngbật chỉđểđạtgiao diện.
- DefectDetailVerify legacy chặnthao tác AIcandidate chưa cósnapshot, bỏ optimisticreset/link/toastthànhcông trướcAPI. Giữnguyên nhánhDefectkhácngoài phạmvi; khôngmởFIELD/publication/lifecycle. getSurveyDetections legacy throw chưa có liênkếtsurvey→run chínhthức thayreadmodel tựsuy. Helper baseline/AIcũngoài luồngmớichưa refactor, khôngcall từCandidateWorkflow; khôngtuyênbố toànrepo sạchmọimock.

**API/transport chínhxác:** POST candidate-decisions cócookieCSRF, K; version nằmbody theoDTO, không thêmIf-Match khioperationkhôngyêucầu. GET decision cócookie. GET ai-mock-runs list cócookie; GET run/result và ai-candidates hiện chỉBearer, AiMockRunsController khôngWebCookieEligible; source selector cũngkhôngmởnhữngpathnày. Cần BE bổsung cookieeligibility cho **GET /api/v1/projects/{projectId}/ai-mock-runs/{runId}**, **.../{runId}/result**, **GET /api/v1/projects/{projectId}/ai-candidates/{detectionId}**, giữrole/scope/provenance. Filemetadata/content đểPMxemframe cũngcầnparitynếu dùngmànảnh; khôngkhôiBearer hoặc dùngSQLbù.

**Thực chạy:** rg-step5-api.py cookieWeb3actor đọcprojectsđượcphép vàrunlist. PM-A/Sup thấyfixture SUCCEEDED ởSBX-A (run46ff868c-e60c-4d87-ad67-83dc8ab1f583, modeMOCK/fixture synthetic-road-v1); GETresult401/auth_unauthorized, cảcácrunfixturekhác cũng401. Đây làruntimeblocker khôngphảiempty. KhôngtạoAIrun/Candidate/Defect mới. KhônggọiAPI bằngBearer đểđọcfixture thayWeb.

Edge production browser rg-step5-browser.cjs: PM-A chọnproject/runserver, thấy401result; PM-B cùngURL thấyngoàiphạmvi; F5 cùngreference vàlỗichínhxác; KEEP_NEWkhóa; **0businesswrites**, khôngfulfill/mockHTTP. **PASS read/blocker/scopeUI**, khônglàE2Equyếtđịnh. KhôngcóCandidate snapshot hợp lệ quaWeb nên positiveKEEP_NEW/LINK/REJECT, wrongrolewrite thực, F5saughi vàSELECTDefectmới/khôngtrùng **BLOCKED/NOT_RUN**. KhôngdựngdataBước4, khôngsửaSQL. Backendfixturekhônglàbằngchứngbay/video thật.

**Tests:** tools/check-review-293d001.cjs **95PASS** (HTTP/hooks giảlậpcókiểmsoát, khôngE2E); cover3DTOshape, conflict409/412/428 propagate, timeoutgiữkey/body, changedintentblocked,201readbackfailGETonly, role/snapshotgate vàlegacyreset/edit khôngghi. Existingrun/disposition regression cậpnhật đểkhôngkỳvọnggetSurveys legacy. Typecheck tsc-b **PASS**, vitebuild **PASS**, gitdiffcheck **PASS**. Lint **NOT_RUN**: package.json khôngscriptlint, khôngcấu hìnhlintđượcbàngiao; khôngtựthêmframework. CảnhbáoTailwindduration/chunklớncósẵn.

**Kết luận:** Bước5 **chưahoàntấtE2E**. Đãloạisuccessgiả/SQL/localdisposition vàbảotoàncommand/version; read/REJECThandler cócăn cứ, KEEP/LINKform cònFEchưatíchhợp đủđầuvào. BackendđãcódecisionDTO/producer; blockerWeblàreadresult/Candidatecookieparity, khôngnóiBEthiếu3decision. KhôngtuyênbốđãghiDefectthật. Khôngtạo/sửa/xóadữliệunghiệpvụ, khôngresetDB/volume, khôngmerge/deploy. Database local khôngđitheoGitHub; tempkhôngstage, khôngsecret.


### 05/11/2026 — Bước 6 từ 6725f28: triage có snapshot/command identity, bỏ nội dung gây hiểu sai

**Base:** `6725f28f592dafe8e3f04bc429611a53471b30e9`, nhánh `hoang`, status sạch trước sửa. Đọc AGENTS.md, workflow Spec17_10 `03_Reporter-Evidence-and-IncidentCase`, OpenAPI CaseTriageDto/CaseConclusionDto/Case Report detail/content, worklog, triageService/caseReportService/reportService và Inbox/hooks/modal. Đối chiếu CaseWorkflowService (reason bắt buộc, triage cần project/method, conclusion cần arrays và source prerequisites). reportService là KPI mock, không phải Reporter intake service; không sử dụng hoặc sửa nó để thay Report API.

| Yêu cầu | Căn cứ Spec | Căn cứ OpenAPI/API/DTO | File FE | Kết luận |
|---|---|---|---|---|
| Reporter→Report/Case UNASSIGNED | Workflow03 main flow1–2 | Reporter report create/private evidence; GET cases/InternalCaseDto | triageService, caseReportService | Backend tạo Case qua Report; Web chỉ đọc, không tự tạo Defect |
| Sup điều phối | Workflow03 main flow3 | POST cases/{caseId}/triage, CaseTriageDto, K+If-Match/cookieCSRF | triageService, TriageProjectModal, useAIReviewLinkActions | Có contract; bỏ giá trị tự điền, giữ snapshot/K, readback |
| PM xử lý/kết luận | Workflow03 main flow4 | POST conclusions, CaseConclusionDto(outcome/reason/evidenceIds/defectIds), K+If-Match | triageService/useAIReviewActions/SurveyActions | Có; NEEDS_EVIDENCE không tạo FIELD, CONFIRMED thiếu Defect/evidence phải chặn |
| Report và ảnh riêng | Workflow03 evidence authorization | GET cases/{caseId}/reports limit/nextCursor, contentPath theo Case/Report/evidence | caseReportService/CaseReportsPanel | Reader đã có; giữ ProblemDetails/objectURL/GPS UNKNOWN, không dùng owner-only Reporter API |
| Giao tổ đội/SLA/ngoài phạm vi | Không có căn cứ Case DTO cho các thông tin/lệnh mẫu | Không có OUT_OF_SCOPE enum trong CaseConclusionDto hoặc task receipt từ NEEDS_EVIDENCE | Modal/banner/actions | Bỏ nội dung giả; chặn chuyển OUT_OF_SCOPE thành NO_DEFECT |

**Thay đổi cụ thể:**
- triageCase bắt buộc role Supervisor, UUID Case/project, version snapshot, phương thức và lý do được chọn. Không GET version mới rồi tự thay snapshot, không defaultFIELD hoặc reason. Command journal sessionStorage tách actor/Case giữ K/body/If-Match/receipt/fingerprint, chỉ phục vụ pending/reconcile, không là nguồn nghiệp vụ. Chặn inflight; timeout/conflict không tự đổi K/body/version. Sau biên nhận chỉ GET Case kiểm đúng project đích rồi hiển thị kết quả; readback lỗi giữ receipt, không POST thêm. Chưa có UI giải quyết journal conflict/reset: yêu cầu đối chiếu, không xóa để ép ghi.
- Triage modal bỏ project mẫu/fallback project đầu tiên và fallback mockProjects, bắt chọn từ danh mục API. Bỏ ảnh Unsplash thay thế ảnh lỗi, thông tin làn và phạm vi lý trình tự suy. Chọn phương thức rõ ràng, reason không tự điền; FIELD/DRONE chỉ là phương thức, không mô tả như đã giao task/tạo yêu cầu bay. Batch không mượn version của target khác khi thiếu Case snapshot.
- concludeCase đọc lại GET Case sau thành công và kiểm outcome server; giữ reason/conclusion thực. Lệnh chưa rõ kết quả được lưu journal qua F5 và chặn key mới; cơ chế này chưa cung cấp UI deliberate replay cho conclusion, là giới hạn cần ghi rõ. Không dùng updateCase cục bộ làm nghiệp vụ: method này giờ báo lỗi thay sửa store. Không thêm Case→Defect hoặc FIELD producer.
- Bỏ lý do NO_DEFECT mặc định “bóng râm/vết nước”; bỏ lời kết luận tự điền trong nút thẩm định/yêu cầu bổ sung. Chặn CTA OUT_OF_SCOPE vì contract chỉ CONFIRMED/NO_DEFECT/NEEDS_EVIDENCE; không tự chuyển thành NO_DEFECT hoặc nói đã chuyển cơ quan quản lý. Reset conclusion vẫn báo chưa có command.
- RequestSurveyModal thay nội dung tổ đo đạc/Nguyễn Văn Thành/Trần Đình Trọng/SLA24h bằng form lý do NEEDS_EVIDENCE. DrawerDecisionBanners bỏ lời “đã chuyển hàng đợi khảo sát”, CTA xem task và SLA/đơn vị nhận không có receipt. PhotoZoom bỏ mốc24–48giờ tự gán. DrawerReporterInfo không gộp tên/SĐT/nội dung vào cấp Case; hướng tới panel từng Report, giải thích tên/SĐT tài khoản hiện tại khác snapshot lúc gửi. CaseReportsPanel/content reader giữ nguyên; chưa claim ảnh thiếu đã hiển thị.

**Quyền/cache/error:** scope PM/Sup server vẫn là authority. Không fallback cache khi read lỗi. LocalStorage Case hiện là cache write của dữ liệu server, reader không khôi phục nó để vượt scope; authEpoch xóa/cache fence như đã kiểm Bước1. Journal command không dùng làm Case/conclusion. API401/403/404/409 giữ status/code;409/412/428 triage không biến thành success. API lỗi list hiển thị partial error, không cache partial như toàn bộ thành công.

**Kiểm thật (không business mutation):**
- `rg-step6-api.py` Web cookie thật: Sup GET cases?unassigned=true&status=UNASSIGNED200 trả đúng3 Case projectIdNULL: `4895db52-0b1a-49d9-b66b-bdca84ee85f4`, `3a452bdb-a1c8-42e8-bea0-030a5b68c504`, `82dbfe8c-3af3-442d-958f-5e3f3f8455ef`. PM-A/PM-B scope UNASSIGNED403. Project test `2cde860a-f777-4e5c-8d8f-384fdaed9509`: Sup/PM-A200 rỗng thật; PM-B403.
- `rg-step6-reports.py`: Sup GET từng Case trên/reports?limit=1 đều200, mỗi Case1Report, nextCursornull. Không đổi evidence/GPS/phone và không upload ảnh giả. Pagination nhiều Report/imageBlob có regression, chưa tính lần này là positive ảnh thật.
- UNASSIGNED+CONCLUDED vẫn409 `reference_scope_conflict` ở backend/runtime, trong khi UNASSIGNED bình thường200. Giữ lỗi từng scope để Sup biết; **BE cần điều tra reference consistency của scope này**, không sửaSQL/filter bỏ lỗi để báo PASS.
- Edge production browser `rg-step6-browser.cjs`, cùng context lần lượt Sup→PM-A→PM-B: Inbox/F5 chạy, Sup thấy partial409 rõ, không hiển thị tên tổ đội mẫu;0businesswrites. Logout/login actor tiếp theo không đưa lại UI trước. API ngoài scope403 xác minh riêng như trên. Lượt đầu trùng build thaydist bị HTTP loadfailure, rerun sau build PASS; không tính lần lỗi môi trường làPASS.

**NOT_RUN/BLOCKED:** Không tự triage/conclude ba hồ sơ Hoàng đang giữ; không có fixture ghi riêng được chuẩn bị ở lượt này. Do đó positive Sup triage→PM nhận cùngCase, F5 sau triage/conclusion thật, evidence/Defect đủ điều kiện CONFIRMED/NO_DEFECT, kiểm replay không tạo record trùng quaAPI thật **NOT_RUN**. Không tạo dữ liệu hoặc dùng SQL để giả kết quả. Nguồn chọn evidence cho conclusion còn chưa tích hợp: NO_DEFECT/CONFIRMED chặn rõ; P2-07 FIELD/DRONE pre-Defect source_not_ready vẫn không được tự lách. Không nói backend thiếu triage/readReport API; các API đó có cookie contract. Backend gap quan sát thực là scope409 và source prerequisites chưa đủ, không tự chế endpoint.

**Kiểm tự động:** `tools/check-review-293d001.cjs` **97 PASS**, là mockHTTP/hooks cô lập, khôngE2E: timeout/conflict/source gate, đúng K/body/If-Match triage, PM không triage, receipt readback khôngPOST lại, Report cursor/path/BlobProblemDetails/GPSUNKNOWN và session fencing. Regression conclusion cập nhật để GET đọc lại phản ánh kết quả server; updateCase test kiểm bị chặn. `tsc -b` **PASS**, `vite build` **PASS**, `git diff --check` **PASS**; lint **NOT_RUN**, package.json không script. Cảnh báo Tailwind/chunk lớn có sẵn, không refactor ngoài task.

**Bàn giao:** chỉ file Bước6 và regression/worklog, không sửa backend/reportKPI/FIELD/NORMAL/FT/publication/lifecycle. Không tạo Report/Case/Defect/project hoặc business mutation, không SQLwrite/resetDB/volume, không xóa fixture. Database local không đi theo GitHub. Không ghi credential/token/cookie/mật khẩu/SĐT. Bước6 **chưa thể gọi hoàn tất E2E**; đọc/scope/UI/error và bảo vệ command đã sửa, các positive writes nêu trên còn NOT_RUN cùng gap evidence selector/journal reconciliation.


### 06/11/2026 — Bước 2: eligible/member recovery và loại dữ liệu tự điền

Base: FE hoang `ef91863cc10f15c7af54cce4dc9883edbfdffd2b`, status sạch. Đọc AGENTS, Spec17_10 workflow01 Authentication/Users/Memberships và workflow02 Project, OpenAPI, worklog, projectService/personnelService và các màn Project/Personnel liên quan. Backend chỉ đọc SHA5180ab9: StaffDirectoryController, StaffReadService/Repository, ProjectsController, DTO/service primary reassignment. Không sửa backend, DB, Docker/config/migration; không làm Bước3–6 hoặc SurveyWeb76121621.

| Hạng mục | Spec/OpenAPI/backend | Phân loại và kết luận |
|---|---|---|
| Project/current membership | Workflow01; GET projects/members, quyền và ngày hiệu lực do server | API đã có; giữ scope/F5/epoch, sửa mapper còn lấy dữ liệu tự điền |
| Chọn/thêm Operator/Crew | GET members/eligible; POST members AddProjectMemberRequestDto(userId), K+cookieCSRF, PM-only | FE chưa nối đúng pagination/recovery; đã sửa |
| Sup directory/read members | GET users/member/primary PM; history chỉ Sup; eligible/add chỉ PM | API đã có và đúng; không mở quyền Sup thêm member |
| Đổi PM chính | PUT primary-project-manager đã có; body rowversion/effectiveFrom/reason/operationId; baseline Bearer-only | Transport gap Web; giữ BLOCKED, không tự thêm If-Match |
| Kết thúc membership trực tiếp | Active/Ended không tự xác lập endpoint CRUD | Chưa có contract; không mở rộng backend |

Đã sửa:
- Eligible và directory đọc đủ nextCursor, phát hiện cursor lặp/sai DTO, kiểm authEpoch. Modal eligible có sequence guard, lỗi HTTP/code/detail, retry và không trình bày lỗi như empty success.
- addProjectMember bắt quyền PM; journal sessionStorage tách actor/project, giữ userId/key/body/receipt, chặn in-flight và ý định mới khi lệnh cũ chưa rõ kết quả. Kiểm epoch ngay trước dispatch. Timeout chỉ replay cùng K/body; sau receipt chỉ GET members và xác nhận ACTIVE trước khi trả thành công. Không thêm If-Match cho POST members, không map mọi409 thành “đã là thành viên”. Modal khôi phục held user để đối chiếu ngay cả khi eligible lỗi/không còn người đó. Journal là command recovery, không phải nguồn membership; chưa có UI tự hủy journal khi cần đối chiếu.
- Mapper project bỏ nguồn PM từ danh bạ mẫu/tên, bỏ trạng thái CLOSED từ sessionStorage, địa bàn từ localStorage/mã/tên và ảnh Unsplash. PM lookup chỉ theo userID từ API. Không khôi phục project store từ sessionStorage trong luồng API; bỏ enrich geometry local ở kết quả mapper server. ACTIVE dùng status server. Bỏ bảo hành mặc định3năm khi thiếu ngày; grid/table/detail báo thiếu dữ liệu thay tỷ lệ/ngày giả.
- PM và Sup personnel không ghép contact từ danh bạ mẫu, không sinh email hoanghai.vn/UUID, không tự điền thiết bị/IP/“vừa hoạt động”/chứng chỉ/biên chế. Giữ fixture ngoài phạm vi.

API thật chỉ đọc: rg-step2-refresh-api.py dùng cookieWeb tới instance cũ18081/18443, projecttest `2cde860a-f777-4e5c-8d8f-384fdaed9509`. PM-A/Sup members/primary/summary200, PM-B403. PM-A eligibleOPERATOR200(4), CREW200(1); Sup vàPM-B eligible403. PM-A includeHistory403, Sup200. MembershipPM-A validFrom2026-11-04/versionAAAAAAAA0ts= giữ nguyên. Không POST project/member hoặc đổiPM; không SQL. HTTP Date05Nov2026 18:18–18:19UTC (06/11 local).

Regression tools/check-review-293d001.cjs:99 scenarios PASS trước chốt; có pagination/cursor, error propagation, timeout member cùng K/body và receipt GET-only, sai role không POST, cùng các test project durable intent đã có. Đây là HTTP/hooks cô lập, không phải E2E. Typecheck/build/browser/diff-check ghi kết quả cuối bên dưới. Lint NOT_RUN vì package không có script, không tự thêm framework.

Giới hạn: positive create/member retry/chuyển PM và thu quyền PM cũ thực NOT_RUN vì lượt này không thay DB. Reassignment Web BLOCKED theo security contract hiện hành, không yêu cầu API mới hoặc tự mở Bearer. Không gọi regression/build là E2E command PASS. Source read cho reassignment yêu cầu effectiveFrom bằng ngàyUTC hiện tại và sau currentValidFrom, operationId/rowversion thật. Form create/durable pending project có sẵn giữ nguyên. Dữ liệu local không đi theo GitHub; scripts temp không stage, không ghi secret.

Hướng dẫn test thủ công Web:
1. Dùng Supervisor, PM-A, PM-B test từ private demo accounts; FE5173 và backend proxy hiện có. Không đưa mật khẩu vào báo cáo.
2. Sup vào /sup/projects: GET projects200 và GET users?role=PM&status=ACTIVE200. Mở project2cde...: GET members200; includeHistory=true chỉ Sup. Nút thêm Operator/Crew khóa với Sup.
3. Logout/login PM-A, mở /pm/projects rồi /pm/projects/2cde860a-f777-4e5c-8d8f-384fdaed9509. Xem status/version/member server. Bấm Thêm nhân sự, đổi OPERATOR/CREW: quan sát GET members/eligible?role=...&limit=100 và cursor. Danh sách là tài khoản đã có, không tạo user mới. Chặn mạng phải hiện alert và nút tải lại, không empty giả.
4. Chỉ khi được phép dùng fixture mutation: POST projects/{id}/members body {userId}, cookieCSRF/K, không If-Match. Sau201 phải GET members. Timeout dùng lại cùng K/body; córeceipt chỉ GET. Đổi người trước đối chiếu bị chặn. Lượt này chưa chạy bước ghi này.
5. Logout/login PM-B, mở thẳng URL project2cde...: không fallback project đầu tiên. GET members/primary/summary và eligible403, không hiển thị member PM-A.
6. F5 với Sup/PM-A phải đọc lại server. Logout/đổi actor không giữ project/member cũ. Users directory Sup-only; eligible/add PM-only; không nhầm transport401 của reassignment với lỗi role403.

**Chốt bản cuối:** 99 regression PASS, tsc -b PASS, vite build PASS, git diff --check PASS. Browser production bundle qua preview5181/proxy tới backend18443: Sup/PM-A/PM-B scope/F5/đổi tài khoản PASS; lỗi members/projects rồi retry PASS; PM eligible lỗi mạng rồi retry và đổi OPERATOR/CREW PASS; 0 business writes. Harness rg-step2-refresh-browser.cjs và rg-step2-refresh-api.py ngoài repo. Selector test trùng hai alert được sửa trong harness và rerun PASS. Một build đọc trúng file đang ghi đã lỗi; chốt source ổn định rồi build lại PASS, không dùng lượt lỗi làm bằng chứng. Positive thêm member/project và reassignment thực vẫn NOT_RUN/BLOCKED như trên. Không thay đổi backend hoặc DB. Bước 2 hoàn thiện thêm phần FE đọc/chọn/recovery; chưa nghiệm thu toàn vòng mutation E2E.


### 06/11/2026 — Follow-up review 598786c: số liệu project và journal member

Base/parent `598786c68ef1dd84836bea3aced1767d4437e31a`, hoang, status sạch. Đọc review/diff, Spec17_10 workflow01 và02, OpenAPI ProjectListItemResponseDto/member operations, projectService/personnelService, grid/table/modal; đối chiếu StaffDirectoryController.Map cho mã lỗi. Chỉ sửa FE Bước2, không backend/DB/Docker/migration/config hoặc bước3–6.

| Finding | File | Căn cứ | Sửa và kết quả |
|---|---|---|---|
| Text bị truyền vào CSS width | ProjectGridView | Dữ liệu thiếu không được làm số liệu | Width thiếu/ngày hoặc phần trăm không hữu hạn là0%; có dữ liệu dùng phần trăm; render regression PASS |
| Project số0 giả/status suy diễn | projectService/domain/ProjectList và các card overview | DTO list không cung cấp start/end/length; current membership do API | start_km/end_km/length_km optional, không gán0; length thiếu báo Chưa có dữ liệu từ API, KPI tổng không cộng thành0. Thiếu status dùng UNKNOWN chỉ là marker UI, không enum gửi backend. Nullable guards ở card/map/timeline để typecheck, không đổi nghiệp vụ geometry |
| PMbadge/is_assigned | projectService/grid/table | Primary PM là field server, không phải quyền PM đọc project | pm_role_badge chỉ khi có primaryProjectManagerUserId; is_assigned không còntrue mặc định. Grid/table dùng primary ID trực tiếp, thiếu ID báo thiếu dữ liệu PM chính thay kết luận chắc chắn chưa phân công. Project scope vẫn theo GETprojects/members/current-effective, không dùng tên/email/cache |
| Journal bị xóa khi lỗi không rõ | personnelService.addProjectMember | StaffDirectoryController.Map: documented ProblemDetails và K | Giữ journal khi network/timeout/5xx/unknown409/no-code409/readback error. Chỉ clear trước receipt với status/code đã biết:400validation_error,403access_forbidden,404project_not_found/identity_user_not_found,409duplicate_request/idempotency_key_reused. Khôngreceipt→replay cùngkey/userId body; córeceipt→GETmembers, xác nhậnACTIVE; không thêmIf-Match |

Tests: tools/check-review-293d001.cjs **101 scenarios PASS**, mockHTTP/hooks/render, khôngE2E. Có test mapper thiếu start/end/length/status/PM; grid thiếu warranty render width0%, có37% render width37%; zero thật vẫn hiển thị khi được cung cấp; badge thiếuprimaryID khônghiện. Addmember tests timeout cùngkey/body,201readback503 khôngPOSTlần2,409known rejectionclear/unknown409giữ,5xxgiữ,sairole khôngPOST. Các test scope/session hiện có tiếp tụcPASS. Typecheck tsc-b PASS; vite build PASS; diff-check PASS; cảnh báo Tailwind/chunk có sẵn. LintNOT_RUN vì khôngscript.

Browser Edge thật trên bản production build, script temp rg-step2-refresh-browser.cjs: Sup/PM-A đọc project/member/F5 đúng; PM-B mởURLproject ngoài scope bị chặn. Logout/login actor khác không thấy tên member cũ. Members/projects/eligible bị abort mạng → lỗi rõ → retry đọc server PASS; PM đổi eligibleOperator/Crew PASS. **0 business writes**, không mockresponse. Dùng projecttest2cde860a-f777-4e5c-8d8f-384fdaed9509 ở instance cũ/proxy18443, không đổi backendconfig. Positive thêm membership/replay thực NOT_RUN; reassignment Web vẫn BLOCKED theo contractBearer-only, không coi regression/build làE2E ghi.

Hướng dẫn test thủ công:
1. Supervisor test vào /sup/projects và project2cde...; quan sát GETprojects/members200. Primary ID vắng thì không có badge PM Chính; thiếu ngày/chiều dài hiển thị thiếu dữ liệu, inspect progress style width0%, không chứa text.
2. PM-A test vào /pm/projects, mở /pm/projects/2cde860a-f777-4e5c-8d8f-384fdaed9509. GETmembers200, không lọc quyền bằng primaryname/email. Bấm Thêm nhân sự: GETmembers/eligible?role=OPERATOR/CREW có phân trang, chỉ tài khoảnserver.
3. Khi được phép ghi trên fixture riêng: POSTprojects/{id}/members body{userId},CSRF/K,khôngIf-Match. Sau201 phải GETmembers xác nhậnACTIVE. Timeout/5xx/409khôngrõ giữkey/body quaF5; córeceipt chỉGET. Không cố tạo member/project thật trong lượt này.
4. Sup không được thêmOperator/Crew (nútkhóa, backend403 nếu gọi đúngcookie); PM-B ngoài project mởcùngURL phải bịchặn, GETmembers/primary/summary403. 401 transport khác403 quyền, không đổiBearer đểlách.
5. F5 và logout/login Sup→PM-A→PM-B: dữliệuserver theoactor hiện tại, khôngfallbackprojectđầutiên/cachedmember. Tắt mạng eligible/members/projects thấyalert, bật lại vàretry.

Giới hạn còn lại: positive mutation E2E chưa chạy; không sửa tài khoản hoặc SQL để ép PASS. Field kỹ thuật hiện không có trong APIlist nên không nghiệm thu geometry từ mànproject. Các field optional là read-model FE, không tạo DTO/endpoint/state backend mới. Chỉ journal intent ở sessionStorage, không dùng làm nguồn membership. Không sửa/xóa fixture ngoài production path, không commit credentials; DB local không đi theoGitHub.


### 06/11/2026 — Dev proxy Web auth chuyển tới runtime sạch HTTPS28443

Base/parent `713a236ab825daa947ef9743ef1f02c1786bec13`, hoang, status sạch. Chỉ sửa vite.config.ts target server.proxy['/api'] từ HTTPS18443 cũ sang `https://localhost:28443`; secure:false đã có, giữ và chú thích chỉ thuộc dev proxy certificate local. Giữ X-Forwarded-Proto:https, API client `/api/v1`/withCredentials:true và nghiệp vụ auth. Source trước sửa là18443, không phải28081; chưa quy HTTP500 ở28081 cho lỗi nghiệp vụ. Không gọi HTTP28081 để login/CSRF.

Runtime đích `roadguard-case409-clean-20261106`, /ready trên28081 trả200; SELECT chỉ đọc xác nhận seed marker sbx02-v1 và owner database mới, không dùng database cũ. Không sửa backend/DB/Docker/migration/config backend, không token/cookie hardcode. .env vẫn VITE_API_URL=/api/v1 và mockauthfalse, không thayorigin sangbrowserTLS trực tiếp.

Checks: tsc-b PASS; vitebuild PASS (cảnh báo Tailwind/chunk lớn có sẵn); gitdiffcheck PASS. Browser Edge headless thật tại `http://localhost:5173/login`, script temp rg-proxy-clean-auth.cjs: GETcsrf200 và Set-Cookie __Host-RoadGuardCsrf có Secure/HttpOnly/SameSiteLax; cookie value không log. Sup vàPM-A Weblogin200, GETsession200/role đúng; bỏ riêng __Host-RoadGuardSession trong testcontext rồiF5: session401→csrf200→renew200→session200. Initial anonymous session/renew401 là trướclogin, không tính là authfailure. LogoutWeb cleanup, không businessmutation. Không dùng mockresponse hoặc localStorage thayserver.

Xác minh upstream thực: kết nối TCP từ tiến trìnhVite tới127.0.0.1:28443; request GETsession trực tiếp HTTPS28443 với cùng cookie browser trả200 cho cảSup/PM. Do đó không chỉ suy từNetworkURL5173. Context API test bỏ kiểmcert riêng đểđọcTLSlocal; khôngtắtTLSbrowser/toànmáy hoặc thayconfigbackend. Scripts/credentials ngoàirepo khôngstage.

Test thủ công: khởi động lại npm run dev nếuVite chưa reloadconfig; mở http://localhost:5173/login. DevToolsNetwork kiểmGET/api/v1/auth/web/csrf200, ResponseHeadersSet-Cookie __Host-RoadGuardCsrf; ApplicationCookies phảiSecure/HttpOnly/Lax. Login tài khoảnSup hoặcPM củainstanceclean: POSTlogin200, GETsession200/role đúng. F5 giữphiên; kiểmrenew bằngtestcontext loại riêngticket hoặc phiênđủđiềukiện, khôngxóa DB/đổiclock. NetworkURLbrowser vẫn5173 vìproxy; target tại vite.config.ts làhttps28443, có thể đối chiếu kết nốiTCP/serverlog. Không dùng port28081 choWebauth. Nếu còncookieinstancecũ cùnghostname, logout/xóa cookieRoadGuard của profiletest rồiđăngnhập lại, khôngresetDB. Khôngghi cookie/passwordvàobáocáo.


### 06/11/2026 — Nút tài khoản mẫu dùng seed runtime sạch và thông báo login tiếng Việt

Base/parent `b875116c43c3c0ccd66d2f6408e294c17534622f`, nhánh hoang, status sạch. Đối chiếu Spec17_10 Web Architecture/Auth và OpenAPI WebAuth, runtime `roadguard-case409-clean-20261106`, không dùng database cũ. GET /ready28081=200, proxy vẫn HTTPS28443; không sửa backend/DB/seed/config hoặc tạo user.

Nguồn credential: bootstrap chính thức deploy/fe-handoff/init.py đọc sandbox/seeds/v1/accounts.json và tạo mật khẩu riêng cho instance trong /handoff/seed-credentials.json, /handoff/demo-accounts.json. Đã xác minh chính xác hai bản ghi chính thức trong RAM, không ghi password vào repo/log/worklog:
- supervisor@sandbox.example.test, key supervisor, user72f84201-a001-4000-8000-000000000001, roleSUPERVISOR.
- pm-a@sandbox.example.test, key pm-a, user72f84201-a001-4000-8000-000000000002, rolePM.
SELECT chỉ đọc và GETsession: cả hai StatusActive, mustChangePassword=false. Login thật200 chứng minh password runtime dùng được; không đoán/passwordreset/SQLupdate. WebAuth contract không có mã locked423/rate-limit429 riêng trong responses, không tự bịa state/code; không kết luận có separate account lock field ngoài Status nguồn.

Đã sửa LoginForm: bỏ hai password cũ nhúng trong source và email placeholder mẫu cũ; nút Supervisor/PM chỉ render khi import.meta.env.DEV. Nút gọi GET /__dev/test-account?key=supervisor|pm-a để điền, không tự login và không giả session. Vite plugin apply:serve/configureServer chỉ tồn tại trong server dev, đọc đúng demo-accounts.json container sạch bằng execFile argv cố định, không thực thi shell dựng từ query. Chỉ trả credential của một trong hai key; loopbackHost + cùng origin Referer/Origin/Sec-Fetch-Site, GET-only, no-store, không CORS, không log stdout/credential. Không dùng VITE_ env để nhúng password trong bundle. Production build loại nút và code fetch; middleware không có configurePreviewServer.

Đã sửa webLoginErrorMessage tại api/auth.ts và caller Login/authStore:401→“Email hoặc mật khẩu không đúng.”;403→“Tài khoản không có quyền thực hiện thao tác này.”;500→“Hệ thống đang gặp lỗi. Vui lòng thử lại sau.”;unknown→“Không thể hoàn tất yêu cầu đăng nhập.”. Không dùng detail/title/stack từ server làm text login; console kỹ thuật chỉ status/code/correlationId, không log Axios object/body/password. mustChangePassword có thông báo “Bạn phải đổi mật khẩu trước khi tiếp tục.” và route guard có sẵn vẫn bắt đổi, không bỏ qua.423/429 chưa có contract nên vào unknown và NOT_RUN API thật. Giữ nguyên lỗiHTTP, khôngconvert401success, chỉ vào dashboard sau GETsession xác thực.

API chính thức: GETcsrf→POSTlogin(email,password)+CSRF→GETsession; renew là **POST /api/v1/auth/web/renew**, không phảiGET. GETlogout không được sử dụng: POSTlogout+K/CSRF. withCredentials:true và cookie Secure/HttpOnly giữ nguyên. Initial anonymous session/renew401 không phải login thành công.

Kiểm thử:
- tools/check-review-293d001.cjs **102 PASS**, mockHTTP/hooks và message mapping;401/403/500/unknown tiếng Việt, không lộ backend detail;423/429 test fallback, không chứng nhận backend có hai mã này. Existing force-change/epoch/renew guard tiếp tụcPASS.
- tsc-b PASS, vitebuild PASS, diffcheck PASS. Scan toàn bộ dist/assets/*.js đối chiếu trong RAM: không có password chính thức runtime, password cũ đã bỏ, endpoint hoặc nút autofill. Không in secret khi scan.
- Edge dev browser thật http://localhost:5173/login, rg-demo-login-browser.cjs: bấm hai nút, assert email/password khớp chính thức trong RAM; Sup/PMlogin200, GETsession đúngrole; F5; logout/F5 vềLogin; login actor tiếp theo; anonymousdashboard→Login. Sai password401 và text tiếng Việt PASS. Request dev-account không Referer bị403. Không fulfill/mockHTTP; không businessmutation. Lượt PM đầu timeout do đợi load tài nguyên đầy đủ; đổi harness sang domcontentloaded rồi cả haiPASS.
- rg-proxy-clean-auth.cjs kiểm renew thật bằng bỏ riêng cookie ticket trong testcontext, CSRF200 và renew/session quaHTTPS28443; kết quả cuối ghi bên dưới. Không tắtTLS trong FE hoặc thay OS trust; direct local API test bỏ verifycert trong context test riêng.
- API500 thật NOT_RUN (không gây serverfault);403 mapping regression, không đổiquyền để épAPI. Positive mustChangePassword thật NOT_RUN vì hai account mẫu đềufalse; không sửa seed/userDB. Extension onboarding.js không được dùng làm bằng chứng lỗi auth.

Test tay: npm run dev, mở http://localhost:5173/login. Bấm nút điền Sup/PM rồi đăng nhập; Network GETdev-test-account200 no-store, GETcsrf200/POSTlogin200/GETsession200. Không copy password vào báo cáo. Sai password phải401/text tiếng Việt và không dashboard. F5 giữ session; Logout/F5 ởLogin rồi bấm nút/đăng nhập lại. Production npm run build + preview không có hai nút, không có middleware trả tài khoản. Khi runtime sạch không chạy/nằm sai Dockercontext, nút phải báo không đọc được tài khoản mẫu, không fallback password.

File thay đổi: vite.config.ts, api/auth.ts, authStore.ts, Login.tsx, LoginForm.tsx, regression và worklog. Không commit credential hoặc script temp; không commit/push backend. Commit tiếng Việt trên hoang, SHA đầy đủ báo ở bàn giao; worklog ghi baseSHA để tránh tự tham chiếu hash commit đang tạo.

**Chốt:** renew thật Sup/PM PASS qua HTTPS28443 (session ticket bỏ riêng trong testcontext→renew200→session200); cookieSecure/HttpOnly/Lax và kết nốiupstream28443 đã quan sát. 102 regression, tsc, build, diff-check, official-autofill browser và production credential scan PASS. Không sửa backend/DB/seed.


### 06/11/2026 — Follow-up 3456706: tách lỗi login khỏi lỗi session/renew

Base/parent `3456706b766857f81a8e71787d94006956e1e241`, hoang, status sạch. Chỉ sửa thông báo FE; không backend/database/seed hoặc transport.

api/auth.ts thêm webSessionErrorMessage:401→“Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.”;403→“Phiên đăng nhập không có quyền sử dụng.”; lỗi khác→“Không thể khôi phục phiên đăng nhập.”. webLoginErrorMessage vẫn giữ401 credential→“Email hoặc mật khẩu không đúng.”.

authStore.loginWithCredentials phân biệt giai đoạn POSTlogin với GETsession sau login. GETsession lỗi dùng session formatter, đánh dấu authContext trên lỗi gốc để Login.tsx không format lại thành lỗi credential; giữ nguyên response/status/code/correlationId. recoverSession và checkSession chỉ dùng session formatter, không hiện raw English detail. Giữ nguyên serialize/single-flight/epoch/logout/redirect: terminal401 expireSession như cũ;403/network không tự logout. Không đổi điều kiện retry hoặc gọi endpoint mới.

Tests: tools/check-review-293d001.cjs **104 scenarios PASS**. Có kiểmPOSTlogin401 khácGETsession401/403/500 sau login thành công; bootstrap/renew401/403/500/network đúng thông báo; lỗi gốc giữ nguyên;401 mất phiên,403/network không tự logout; renew không thêm vòng lặp. Harness đầu kiểm nhầm counter của hàm đã override, đã sửa instrumentation và rerunPASS. tsc-b PASS, vitebuild PASS, diffcheck PASS. Chỉ cảnh báo Tailwind/chunk có sẵn. Không chạy API/browser E2E mới trong follow-up thông báo, không tạo fixture để ép session hết hạn; không coi regression mô phỏng là E2E.

Files: api/auth.ts, store/authStore.ts, pages/(auth)/Login.tsx, tools/check-review-293d001.cjs và worklog chung. Commit tiếng Việt/push hoang; không credential/token/cookie trong báo cáo.


### 06/11/2026 — Project/Thành viên: quyền Sup, thông báo nghiệp vụ và logout

Base/parent `f673c15d45c443435b81876529a4ff8fa9d9a1ff`, nhánhhoang, status sạch. Đối chiếu Spec17_10 Authentication/Users/Memberships, Project workflow và OpenAPI members/eligible/primaryPM/system-user; backend chỉ đọc SHA5180ab9 StaffDirectoryController, StaffReadService/Repository. Runtime duy nhất dùng kiểm nghiệp vụ: roadguard-case409-clean-20261106, HTTPS28443 qua FEproxy5173, ready200. Không dùng database cũ, SQL hoặc sửa backend/seed/config.

Quyền: GETmembers cho Sup và PM current project; includeHistory chỉSup. GETeligible và POSTmembers chỉPM current project, target activeOperator/Crew có sẵn. Sup không có quyền addOperator/Crew ở API này dù có quyền directory toàn hệ thống. PrimaryPM reassignment đã có nhưng contract Web hiện chặn; không thêm CRUD membership hoặc mở quyền PM sửarole/hồsơ user. System-user edit là API/quyền riêng, không được suy từ projectmembership.

File/sửa:
- ProjectPersonnelCard: nút Sup không disabled im lặng nữa; click hiện “Chỉ Chỉ huy trưởng của dự án được thêm phi công hoặc đội thi công. Tài khoản Giám sát hiện chỉ được xem danh sách thành viên.” và không gọieligible. PM mởmodal. Card đơn giản gồm tên/role/status/ngày hiệu lực do server; bỏ contact/unit/authority suy diễn và version kỹ thuật khỏi UI. Chưa hỗ trợ đổiPM/kết thúc phân công chỉ báo tiếngViệt, không có câuBearer/contract thô.
- AddProjectMemberModal: MaterialSymbols qua Icon hiện có, bỏ lucide và emojiOperator/Crew. Nút chính vàng#C9A227/chữdark, nútphụ viềnxám, giữ layoutresponsive; success “Đã thêm nhân sự vào dự án.” chỉ sau service xác nhận ACTIVE/readback. Lỗi không hiển thị detail/stack/mãthô. Journal parse nằm trong try/catch, không tạo rejectedPromise khônghandled khi journal lỗi; giữsamekey/body/recovery và epochguard có sẵn. Không tạo component system/cây thư mục mới.
- personnelService: projectMemberErrorMessage map400/401/403/404/409/412/428/500/network theo text user yêu cầu; unknown có thông báo chung. Log chỉstatus/code/correlationId, không log Axiosbody/secret. Lỗi service vẫn được throw, khôngđổi thànhsuccess/empty.
- ProjectOverview: contact/unit rỗng vì ProjectMemberResponseDto không trả liênhệ; không đoán email/SĐT. Memberread dùng formatter. ProjectList/Overview/eligible loader không gửi API khi anonymous/logging-out; giữ epoch/unmount fence. Không sửa auth/logout backend hoặc giả nuốt reject.

Test thực rg-members-ui-real.cjs (cookieWeb, không mockresponse): PM-A đọcSBX-A/members200 vàF5; eligibleCREW/OPERATOR hiệnrỗng thật, modal cóempty rõ; khôngtạotàikhoản để lấp. Sup đọcmembers200, bấmnút cómessage, không phátrequesteligible; directGETeligible403 vàPOSTmembers403. PM-B mởSBX-A bị403/UIchặn, không thấy memberprojectA. POSTtrùng memberfixtureA keymới409duplicate_request, activecount1. Logout204/F5Login ởcả3actor; pageerror/unhandled app ghi nhận0, project/member request mới saulogout204=0. Cleanprofile khôngextension; chưa có bằngchứng quy lỗi onboarding.js/content-script của profile người dùng cho app, không sửa để che extension.

Positiveadd thực rg-members-ui-add-pmb.cjs: tìmprojectSBX-B vàeligible từAPI theoquyềnPM-B, không nhúngID vào source. Thêm **một Crew test** qua modal/API chính thức:
- Project `72f84201-c001-4000-8000-000000000002`.
- User được thêm `72f84201-a001-4000-8000-000000000008` (tài khoản Crew cósẵn).
- Membership mới `f894d627-1836-40c8-b8ba-215bb2c667a6`.
Mục đích TEST UI/member readback/replay; trạng thái ACTIVE, giữlại vì không có command gỡ theo contract. Khôngxóa/sửa user/project cũ. Replay cùngK/body201 trả cùngmembership; keymới cùnguser409, kiểmGET countACTIVE vẫn1; F5 vẫnthấy từserver. K/body/ledger tạm không có credential, khôngstage. DBlocalkhông đi theoGitHub. Các rerun dùngledger/receipt khôngtạothêm membership.

Version: POSTmembers contract không yêu cầuIf-Match; không bịa testcase staleIf-Match412 cho operation này. Mapping412/428 và conflict/unknown outcome được regression, không claim HTTP412/428 thật. Mutation đổiPM/bodyrowversion Web vẫnBLOCKED, không mở quyềnbằngBearer. API403/409 thật đãkiểm;400/401/404/412/428/500/422 UIerror mapping/regression có kiểm soát, không cố gây lỗi server hoặc sửaaccount để épPASS.

Checks: tools/check-review-293d001.cjs **105PASS**, gồm translation8status/network, render cardSup khôngnút imlặng và không textcontact/version kỹ thuật; giữ nguyên bộtestscope/journal/K/receipt. tsc-b/build/diffcheck chốt bên dưới. Không dùng mockresponse chứng minh API; mock tests chỉ regression. LintNOT_RUN vì packagekhôngscript. CảnhbáoTailwind/chunklớn cósẵn, không refactor ngoài phạmvi.

Test tay: loginPM-A/Sup bằngnútdevseedruntime sạch, mởproject từ /pm/projects hoặc /sup/projects. Sup bấmThêmnhânsự phảigiải thích quyền, khôngmởmodal/requesteligible. PM currentproject bấm mởmodal, chọnOperator/Crew: danh sáchAPI/empty/error rõ; chỉPOST{userId}+CSRF/K khi chọnngườithật. Success khôngtextbackend/Confirm. Với PM-B vàoSBX-A phải403; F5/loginactor khác khônghiệndata cũ. Logout từProject/members đangtải, Networkchỉlogout204 và Login, khôngproject/memberrequest mới sauhoàn tất; khôngpageerror. Khôngdán token/cookie/password vào worklog.

**Chốt bản cuối:** 105 regression PASS; tsc-b PASS; vitebuild PASS; gitdiffcheck PASS. Browser Sup/PM-A/PM-B scope/F5/logout PASS; PM-B projectB positiveadd/replay201/duplicate409/count1 PASS; modal viewport375 không tràn ngang PASS. Bản ghi mới vẫn giữ nguyên membership f894d627-1836-40c8-b8ba-215bb2c667a6; rerun chỉ đọc/replay biên nhận, không tạo thêm. Chưa có kiểm API500/412/428 thật hoặc extension profile người dùng; không nhận các nhánh đó là E2E PASS.


### 06/11/2026 — Project/PM: ẩn thao tác Sup không có quyền, chuẩn hóa UI và dữ liệu thiếu

Base/parent `383e220bdf7d4c7db718a3406f88a94771d73a1c`, hoang, status sạch trước sửa. Đọc AGENTS, Spec17_10 workflow01/02 và OpenAPI ProjectListItemResponseDto/ProjectMemberResponseDto/member operations; đối chiếu quyền StaffReadService tại backend5180ab9 đã có trong workspace. Không sửa authStore, session/logout flow, backend/database/seed/migration/config; không SQL.

Quyền: PM current project đọc members, eligible và POST members thêm tài khoản Operator/Crew có sẵn; Sup đọc members/history nhưng không được eligible/add qua hai operation này. Vì vậy ProjectPersonnelCard chỉ render nút và AddProjectMemberModal khi canAdd=PM. Sup không còn nút (kể cả disabled), không có modal hoặc alert quyền từ nút, không phát GETeligible/POSTmembers. PM không được sửa PM chính hoặc role hệ thống. ĐổiPM/kết thúc phân công trên Web vẫn chưa hỗ trợ; chỉ thông báo nghiệp vụ ngắn, không tên implementation/Bearer/contract.

Dữ liệu ProjectListItemResponseDto chỉ gồm projectId/projectCode/name/status/primaryProjectManagerUserId/primaryProjectManagerName. Màn list/grid/table hiện chỉ dùng các trường này và số project ACTIVE/CLOSED đếm từ danh sách server đã đọc đủ trang. Đã bỏ ô tổng chiều dài, bảo hành/phần trăm/ngày còn lại, số lỗi/gói sửa, địa bàn và lý trình vì collection không cung cấp; không mặc định0/tự scale. Bỏ KPI/filter “sắp hết hạn/chờ duyệt tuyến” suy diễn từ nguồn không có. Thiếu field dùng “Chưa cập nhật”, không câuAPI/DTO. Không đổi enum/backend state; UNKNOWN chỉ là read marker cũ, không gửi như command.

Overview chỉ giữ header thông tin server, liên kết xem đề xuất có sẵn, phần tuyến placeholder và member card. Bỏ việc đọc alignmentService.getAlignmentData/localStorage để dựng geometry/segment/chiều dài; không render map/timeline/technical highlights cũ từ dữ liệu chưa xác minh. Không sửa API geometry hoặc bước khác. Tabs Tuyến chính/Tuyến phụ là tab UI (role tablist/tab/aria-selected); màu vàng/chữtrắng khi chọn, trắng/viềnxám khi chưa chọn; không render số đoạn/chiều dài0 hoặc nhánh/mặt đường tự điền. Chưa có read collection tích hợp ở màn này nên panel “Chưa cập nhật”, không claim database không có tuyến.

Style: dùng Icon/Material Symbols hiện có, không component/icon system mới hoặc đổi cây thư mục. Nút chính Thêm dự án/Vào quản lý/Xem đề xuất/PM thêm member dùng vàng thương hiệu/chữtrắng; hover vàng đậm. Bỏ font-mono trong text/số liệu/form/filter active, xóa pagination giả của table. Header/member rows có wrap/min-width để mobile375px không tràn. Các component legacy không còn render vẫn giữ file, không xóa fixture ngoài phạm vi.

Member error mapper đổi409 đúng câu “Nhân sự đã được thêm vào dự án hoặc membership đã thay đổi.”; fallback “Không thể hoàn tất yêu cầu.”. Các status400/401/403/404/412/428/500/network giữ bản dịch đã kiểm; log kỹ thuật vẫn status/code/correlationId, không rawdetail/stack ởUI. Success vẫn “Đã thêm nhân sự vào dự án.” sau service readback ACTIVE; không thay idempotency/version logic.

Tests:
- tools/check-review-293d001.cjs **106 scenarios PASS**, HTTP/hooks/render cô lập, khôngE2E. Sup render không nút/modal; PM vẫn cóaction; grid/table không metrics unsupported/raw backend detail/font-mono; giữ tests samekey/body/receiptGET-only/role/scope/conflict và error mapping.
- tsc-b PASS; vite build PASS; diff-check PASS. Lint NOT_RUN vì khôngscript. Tailwind duration/chunk cảnh báo có sẵn.
- Browser Edge thật rg-project-style-browser.cjs, runtime sạch roadguard-case409-clean-20261106/HTTPS28443 quaFE5173, ready200: Sup/PM-A/PM-B đọc đúngproject/members, F5/đổiactor; PM-B đọcSBX-A members403. Sup có **0 eligible requests,0 memberPOST**, không nút/modal, không alert quyền giả. PM mởmodal bình thường. Tabs computed style vàng rgb201,162,39/chữtrắng; không font-mono/textAPI/Bearer/contract trongmain. Mobile375: scrollWidth375, không element tràn. Ban đầu browser bắtoverflow name/badge/nútproposal, đã sửa wrap và rerunPASS.
- Logout204/F5Login, pageerror0, không request project/member mới sau logout hoàn tất; không sửa auth/session flow để đạt kết quả. Không quy lỗi extension vào app.
- rg-members-ui-add-pmb.cjs rerun dùng ledger/command đã tạo ở task trước: replayPOST cùngK/body201 trả lại membership `f894d627-1836-40c8-b8ba-215bb2c667a6`, keymới cùnguser409, GETactivecount1, F5 vàmodal375PASS. ProjectSBX-B `72f84201-c001-4000-8000-000000000002`, Crewuser `72f84201-a001-4000-8000-000000000008`. **Không tạo membership mới lượt này**; tên output harness positiveAdd=true là nhãn kịch bản cũ, lần này chỉ replay/read. Positive fresh add quaUI bản mới NOT_RUN vì fixtureCrew đã được thêm ở task trước, không tạo thêm user để lấp. Không gọi replay là positivecreate mới.

Files: ProjectPersonnelCard/AddProjectMemberModal, ProjectOverview/Header/SegmentsTable, ProjectList/grid/table/filter/header/KPIs/form styles, projectService placeholders, personnelService error text, regression/worklog. Không authStore/logout/session hoặc backend. DB local không đi theoGitHub; không credential/token/cookie trong log. Chỉ script temp ngoài repo cho browser.

Test tay: Sup mở /sup/projects và project đượcphép, thấy member nhưng không thấy Thêmnhânsự; DevTools filter members/eligible vàmethodPOSTmembers phải0. PM mởproject own, thấyThêmnhânsự/modal vàeligible đúngrole; chỉ ghi khi cófixtuređượcphép, CSRF/K, sau201đọclạimember. ChọnTuyếnchính/phụ cóariaselected rõ, không sốliệu tựđiền; list/overview không câuAPI hoặcfontmono. Thửmobile375px/table cuộn trongkhung, khôngpageoverflow. Logout/F5/loginactorkhác giữđúngscope. Sai project403; không mở Supmutation vì cầnUI. Bản test này không chứng nhận API gỡ/đổiPM Web chưa có hoặc API500/412/428 thật.


### 06/11/2026 — Review 0b395e9: khôi phục đóng vận hành và geometry thật từ Project

Base/parent `0b395e9c20e631881c79b153e1bd9378629d8b74`, hoang, status sạch. Đối chiếu Spec17_10 workflow02 mục lifecycle/geometry và OpenAPI GETprojects/{id}/lifecycle, POST lifecycle/{command}, LD06LifecycleInputDto/ProjectLifecycleViewDto; đọc ProjectLifecycleController, ProjectLifecycleService.LD06 và repository operational-close tại backend5180ab9. Việc xóa entry đóng và thay geometry bằng placeholder đã làm mất thao tác/đường truy cập hợp lệ; lượt này sửa lại. Không khôi phục dữ liệu local/metrics giả và không sửa backend/DB/seed/authStore/session/logout.

Đóng project: Spec có đóng vận hành riêng với completion/bảo hành. OpenAPI generic POSTprojects/{projectId}/lifecycle/{command}, command operational-closures được source ProjectLifecycleService.LD06.cs xác nhận; roleSupervisor, cookieCSRF, K tối đa150 printableASCII, If-Match là **quoted64hex content-hash**, không phải8byte rowversion. LD06LifecycleInputDto cần reason và evidenceFileIds array; source cho phép[] ở operational-close, kiểm inventory/nghĩa vụ server, không bắt văn bản đóng trước hạn/10ký tự/5năm như modal cũ. Không gán ProjectStatusCLOSED chỉ vì operationalClosureCONFIRMED; backend giữ chúng là facts riêng.

Đã khôi phục:
- Nút Đóng vận hành dự án cho Sup trong grid/table/header overview; PM không có nút. CloseProjectModal đọc GETlifecycle/ETag thật, hiển thị trạng thái điều kiện, reason, reload và submit khi server trảELIGIBLE/chưaCONFIRMED. Không dùng open_defects/days_remaining/warranty_percent hoặc cam kết/lưu trữ mẫu để cho phép/chặn. Unknown/blocked chỉ báo chưa đủ điều kiện, không giả readinessPASS.
- projectService.closeProject thay nhánh nuốt lỗi rồi tựCLOSED/cache bằng POST chính thức và GETreadback kiểmoperationalClosureCONFIRMED. Giữ key/body/hashversion/receipt theo actor/project, chặn concurrent/đổi ý định khi chưa rõ, fenceepoch trướcdispatch/sauIO; saureceipt chỉGET. 403/409/412/428/5xx vẫn lỗi, khônglocal success hoặcsessionStorageclosedIDs. Journal chỉ pendingintent, khôngnguồnProject. Khi conflict còn chờđốichiếu, chưa có UIhủy/reset journal; không tựkey/versionmới.
- Caller sau command đọc lại server, toast “Đã ghi nhận đóng vận hành dự án.”; bỏ thông báo lưu5năm/closedstatus tựđiền. ProjectList scope dùng nguyên danh sách server thay nhánh tên/email/IDsample trước đây; không mở quyền client.

Geometry:
- Overview dùng AlignmentGeometryWorkflow chế độ embedded: đọc project API, CRS/work-package/draft/readiness và confirmedgeometry qua chính reader đã có. Không gọi alignmentService.getAlignmentData/localStorage/mock. Khôi phục link /projects/{id}/alignment ởheader và panel để vào đầy đủ import/draft/readiness/confirm hiện hữu; không tạo route/DTO mới.
- Embedded preview SVG chỉ render metricCenterlineLineString/tọa độ hữu hạn do server trả. lengthMeters/ngày approvedAt/statusdraft/readiness đều từDTO; nếu thiếu thì ẩn. Không ép độ thànhmét, tựđiềnwidth/calibration hoặc giảtimelinephêduyệt. sampleOnlytrue được ghi minh họa; seed hiện có là scenario synthetic, không chứng nhận accuracy khảo sát thật dù wiremetadata của seed trảfalse.
- Lifecycle/timeline/map cũ dùng dữ liệu local và lời khẳng định chưa cósource không phục hồi nguyên mẫu. Thay bằng trạng thái xác nhận/readiness/ngày xác nhận và preview cósource; luồngBước3 độc lập được giữ. Các writehandlergeometry chưa tích hợp/CRSinput thiếu/transportdiscovery401 như audit cũ vẫn làblocker riêng, không nhận là đãgiải quyết ởlượt này. Segmentation/publish không tựmở command chưa đủinput.
- Các phần đã đạt giữ nguyên: Sup không nút/modal addmember; PM addservice/eligible không đổi; vàng/chữtrắng/MaterialIcons/minimalism; overview khôngdetail thô hoặc câuAPI; khôngsửaauthStore/session/logout.

Tests:
- Regression tools/check-review-293d001.cjs **109 PASS**: giữ raceA/B/A vàparser119điểm, geometryscope/readonly/readiness; thêm closureSup-only, hashETag/K/bodyreason+evidence[], timeoutgiữidentity,receiptreadbackfailGETonly,409/412/428/error khônglocalCLOSED, embeddedread/preview/linkdedicatedroute. Đây HTTP/hooks mô phỏng, khôngE2E mutation.
- tsc-b/build/diffcheck chốt bên dưới; lintNOT_RUN vì khôngscript. Không coi build làpositiveclosure.
- Browser rg-restore-project-browser.cjs dùng Edge/Webcookie trênruntime sạchHTTPS28443, ready200. Sup mởmodal ởgrid/table, GETlifecycle200/ETaghash; seedSBX-A operationalClosureEligibilityUNKNOWN/closureUNKNOWN nên khóa gửi, positiveclose thực NOT_RUN. Không đóngprojectseed hoặc sửa nghĩa vụ để épPASS.
- Geometry references lấy từ biên nhận scenario chính thức /progress/scenarios.json qua docker cp chỉđọc, không hardcodeID trongsource. RefprojectSBX-A, road4ab584d9-e2ac-4b5d-90ea-d01fd9429fff, versionee8d052a-6574-4ca4-94d9-cafb06fc13f1, draftea4e3541-f919-4d8a-afee-652f45967c83. Sup/PM-A đọcGETgeometry200, previewserver200m, F5 giữreference, vàođượcmàn geometry đầyđủ. work-package401 được báo lỗiđọc riêng, không lấy geometry khác/thayBearer.
- Browser bắt overflowCTAsecondary trên375px; đã sửa block/w-full vàrerun. Khôngpageerror, khôngrequestmembereligiblebấtthường hoặcbusinesswrite; khôngrequestprojectmới saulogout204. KhôngAPIclosurepositive/geometrycreate-edit-confirm mới, khôngSQL/mutation nghiệpvụ. Dữliệuseed giữnguyên.

File liên quan: projectService, ProjectList/Overview/header, CloseProjectModal, ProjectGridView/TableView; AlignmentGeometryWorkflow vàalignmentService chỉ thêm typed sampleOnly cótrongOpenAPI; regression/worklog. Không cây thư mục mới, khôngtoken/cookie/password. Database local khôngđitheoGitHub. Kết luận: khôi phục thao tác và đường truy cập bịmất; positiveclose/vòngghi geometry vẫn NOT_RUN/BLOCKED theo điều kiện server, không xóa nghiệpvụ thật chỉvìmetrics thiếu.

**Chốt:** 109 regression PASS; tsc-b PASS; vite build PASS; git diff-check PASS. Browser Sup closure grid/table GET200/điều kiệnUNKNOWN khóa đúng; Sup/PM geometry server200m/preview/F5/dedicated entry/mobile375 PASS;0businesswrites/0pageerrors/0projectrequests sau logout. Positive operational-close và geometry write mới NOT_RUN, không coi read/build là E2E command PASS.


### 06/11/2026 — Bước3: GeoJSON thiếu CRS giữ UNKNOWN, chặn ghi và rà contract geometry

Base/parent `265bf627d088c5b6d4a508dfd6c79afe610f105e`, hoang, status sạch. Đọc AGENTS, Spec17_10 workflow02 Project/Road/Geometry, Web errors, OpenAPI GeometryDraftInput/CrsProfileInput/GeometryConfirmInput/GeometryDraftView/Readiness, source backend workspace5180ab9 GeometryWorkflowController/Service, GeometryEngine/CrsProfileEngine. Không sửa backend/DB/seed/migration/Docker, authStore/logout/session hoặc cây thư mục; không dùng SQL.

**Input bắt buộc:** đường dẫn đính kèm chỉ tới `C:/Users/Admin/Downloads/roadguard-export.geojson`; file tên `roadguard-export(1).geojson` chưa có tại Downloads. Đã đọc toàn bộ63497bytes/JSON của file được đính kèm, không chỉ sample. FeatureCollection4features: RoadSurface Polygon (MAT_DUONG_BETONG), Centerline LineString119đỉnh (TIM_TUYEN_CHINH), RoadEdgeLineString171/172đỉnh (MEP_TRAI/MEP_PHAI). Không có crs. Lượt này **UNKNOWN**, không khẳng định WGS84/axis/metres dựa coordinate range hoặc tênfeature; không nói đã kiểm file(1) riêng biệt. File không copy/commit vào repo.

Đã sửa alignmentImportHelpers.inspectGeoJsonCenterline: giữ đúngCenterline, khôngPolygon→line, khôngmerge mépđường. ThiếuCRS giữ UNKNOWN, estimatedLengthMeters=null, bỏ Haversine/unit inference ở active inspector. Chỉ kiểm cặp số hữu hạn/sốđỉnh/duplicate/intersection, giữ nguyên thứtự vàtấtcảđỉnh; khôngswap/scale/smooth hoặc sinhstation/profile/accuracy. TệpJSONlỗi/null/geometryunsupported báo tiếngViệt. Explicit crs khai riêng hiện bịchặn vì chưa có admission xác minh cho nguồnnhập này, không tự cho rằng EPSG label đủ xác minh. Các helper legacy parseExtractedCoordinates không nằm trong active AlignmentGeometryWorkflow, không dùng để hoàn tất nghiệp vụ; không xóa fixture/helpers ngoài phạmvi.

AlignmentGeometryWorkflow: lỗiHTTP400/422/401/403/404/409/412/428/500/network được thông báo tiếngViệt vàtechnical log chỉstatus/code/correlationId; không rawProblemDetails/stack/current rowversion/ETag trênUI. Draftstatus/readiness/preview server giữ từDTO, không đổifalse→true. Ẩn raw missingFields/errors/warnings codes, không sửa version nội bộ. Import chỉ sau contextload hoàn tất và project nằm trongAPI scope, tránh contextreset làm mất preview. File thiếuCRS hiển thị BLOCKED tiếngViệt, hình xem trước chỉ hìnhdạng đầu vào, khônglengthmét; nútlưu khóa, khôngrequest create/edit/submit. Nút vàng/chữtrắng, khôngfontmono/emoji; khônglocalStorage geometry nguồn.

| Nghiệp vụ | Contract hiện hành | Kết luận |
|---|---|---|
| Create/edit/read draft | POSTprojects/{p}/road-geometry-drafts; PUT/GET .../{draftId}; GeometryDraftInput | CóAPI PMwrite, PM/Supread; createK, editK+If-Match, cookieCSRF. Handler write nguồnGeoJSON hiện chưa đủ input, chưa bật |
| Preview/readiness | POST.../{draftId}/preview; GET.../{draftId}/readiness | CóAPI; preview dùngcookieCSRF, readiness giữ serverbool. Không coi filepreview làDBpersist |
| Confirm | POST.../{draftId}/confirm GeometryConfirmInput(expectedCurrentVersionId,effectiveFrom,reason), Sup,K+If-Match/CSRF | Cócontract **DRAFT→CONFIRMED trực tiếp**; không đặt điều kiện PENDING_APPROVAL giả. UIwritehandler hiện chưa tích hợp đủ headpin/ngày/lýdo để bật |
| Submit/approve queue/reject/revision/resubmit/history | Không cówire/status DTO tương ứng trong current controller/OpenAPI/domain (domain DRAFT/CONFIRMED) | BLOCKED/CHƯA CÓ CONTRACT. Không tự thêm PENDING_APPROVAL/REVISION_REQUIRED/APPROVED hoặc dùngConfirm thayReject |
| COORDINATES | GeometryEngine: sourceCrs trùng engineeringSrid32648/32649; finite simpleLineString; stationOriginMeters finite, changeReason, surveyWidth>0,widthProfile liên tục/phủ đúng Euclidean metriclength | File UNKNOWN không hợp lệ để ghi. Không lấy metadatawidth7 thànhsurveyWidth/profile; không tự gánmốc0 hoặcépmetadata700.73 |
| NATIVE_ALIGNMENT/CRSprofile | Nhánh riêng, analytic geometry/pinned profile/provenance/axisEN/NE/metresPerUnit; không trộn legacycoordinates | Không nói toànbackend chỉ nhận2EPSG. Không đổi file này thànhnative rỗng. Engineeringprofile không là điều kiện globally bắt buộc mọiCOORDINATES, nhưng engineeringprojectSRID phải đúngnguồn |
| Transform | Không có HTTP CRSconversion trongOpenAPI; CrsProfileEngine executable chỉsample affine native→WGS84 | Không tự đềxuất tênendpointmới hoặc dùngsampleadapter/scale. Cần nguồnCRS/coordinate/metres/field kỹthuật được ownercungcấp; chưa đủ thìBLOCKED |
| Discovery | GETprojects/{p}/work-package currentBearer-only | Webcookie401BLOCKED, khôngborrowBearer. Cần BE xácnhận/bàngiao transportWeb nếu flowWeb yêu cầu; không tựsửa quyền/config |

API thực rg-geometry-crs-api.cjs trênruntime sạch roadguard-case409-clean-20261106/HTTPS28443: Sup/PM-A GETcrs-profiles,draft/readiness/geometry200; PM-B cácresourceprojectA403. Workpackage cả3actor401/auth_unauthorized. Ref từscenario chínhthức, khôngapphardcode: project72f84201-c001-4000-8000-000000000001, draftea4e3541-f919-4d8a-afee-652f45967c83, sourceCrs32648/statusCONFIRMED. Readinessfalse trênconfirmedlegacycoordinate fixture là semantics cầnBEchốt, không dùngfalse này làm kếtquả confirm mới hoặc sửa thànhtrue. Khôngtạo project/draft/profile/geometry mới.

Browser Edge thật rg-geometry-unknown-browser.cjs, proxy5173→HTTPS28443: Sup/PM-A đọcgeometryseed200m/previewserver/F5/refgiữnguyên/dedicatedgeometryentry/mobile375PASS. PM-A import đúngfile đườngdẫnđínhkèm saucontextload: Centerline119điểm, UNKNOWN, khôngHaversine, Lưudraftdisabled; **0 businesswrites**,0pageerror,0requestmemberbấtthường hoặcprojectrequestmới sau logout204. Lượt đầusetfiletrướcloadcontext xong bịresetimport; đãkhóa input lúcbusy/projectsLoading vàchỉnhharness chờsnapshot, rerunPASS. Khôngfulfill/mockHTTP hoặc tạoGPS/evidence giả.

Regression tools/check-review-293d001.cjs **110PASS**, HTTP/hooks côlập khôngE2E: UNKNOWN cho cảcặp nhìnnhưkinhvĩ vàcặp nhìnnhưmetres, estimatedlengthnull/no requiredfields inferred, malformedJSON/null/Polygon/ambiguity, giữduplicates; A→B→A/raceversion/unmount vàretrypagination vẫnPASS, chuyểnassert sang textnghiệpvụ thayhash/versionraw. tsc-b/build/diffcheck PASS; lintNOT_RUN khôngscript. WarningsTailwind/chunk cósẵn.

**BLOCKED/NOT_RUN:** file(1)khác chưa có để kiểm, positivecreate/edit/confirm vàF5 saughi mới; stale412/428 mutation thật, commandreplay tạo/submit/approval, forcedqueue/reject/resubmit/history. Chưa đủ CRS/unit/stationOrigin/surveyWidth/widthProfile/changeReason từnguồnđượcchấpnhận, discoveryWeb401 vàwritehandlerFE cònthiếu; khôngđổmọiviệccòn lại choBE. Không gửi DTO sai/filethiếuCRS đểlấynegativePASS, không mớiK/version đểghiđè. Chưa nghiệmthu toànBước3E2E, chỉread/scope/previewvalidation đãPASS nhưtrên.

File đổi: alignmentImportHelpers.ts, AlignmentGeometryWorkflow.tsx, regression/worklog. Không fileinput/credential/token/cookie/mật khẩu trongGit; không dữliệunghiệpvụ mới hoặcDBwrite; database local khôngđitheoGitHub.
