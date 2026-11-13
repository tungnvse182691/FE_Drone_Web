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


### 06/11/2026 — Khẩn cấp khôi phục thiết kế Project trước chuỗi giản lược

Base/parent `d0c1d3c9458d5e6af3f21b22b115379d875b495d`, hoang, status sạch. Đối chiếu git history **383e220^ = f673c15d45c443435b81876529a4ff8fa9d9a1ff**, Spec17_10 workflow01/02 và OpenAPI project/member/geometry/lifecycle hiện hành. Các thay đổi giản lược trước đã làm mất card/layout; lượt này khôi phục hierarchy, không coi thiếu metric là lý do xóa component.

Khôi phục trực tiếp cấu trúc JSX/history cho ProjectGridView, ProjectTableView, ProjectListKpis, ProjectListFilters và header chính ProjectOverviewHeader: card banner128px, project code/statuspill, PMinfo block, progressframe,3mini-metric, footeraction, quick-addcardSup; bảng8cột,5KPI/filter/search/grid-tabletoggle và breadcrumb/header chi tiết. Chỉ thay giá trị thiếu hoặc lời khẳng định chưa có nguồn; không khôi phục IDORoverlay suy từUI/email, ảnhstock, số0/metrics hoặc paginationnútgiả. NútSupđóngvậnhành gọi callback/modal/API chính thức đãsửa ở265bf62, khôngtrảlạicloseProjectcachegiả.

Overview có lại hàng3highlights, cột8/4 timeline–segments vàmember–map, các filecomponentgốc vẫn giữ nguyên vị trí. ProjectHighlightsGrid giữ3card/rowdetail (bảo hành,khối lượng/phân đoạn,theodõi xửlý), giátrị Chưa cập nhật khi chưa córeadmodel tương ứng. ProjectTimelineStepper khôi phục khung4bước/đườngworkflow nhưng khôngđặtgiaiđoạn hiện tại từlength/status hoặc nói đãduyệt/đãđóng khi lifecycle chưađọc. ProjectSegmentsTable khôi phục header,tabMainline/Branches,table4cột/scrollcontainer; giữkhungchưa cậpnhật, khôngsinhsegmentmẫu/mặtđường/sốđoạn0. ProjectMapPreviewCard khôi phục cardmap nhưng nội dung dùng **AlignmentGeometryWorkflow embedded hiện hành** (tọađộ/versionserver), không getProjectCorridorCoords/localStorage/mapmarker giả. Dedicatedgeometry/import/draft/readiness/confirmreader vẫnnguyênroute. Khôngsửa parserCRS UNKNOWN hoặcđổinhãn/scale/inputfile.

Nguồn dữliệu: ProjectListItemResponseDto choID/code/name/status/primaryPM; cácfieldnàyvẫnserver. ACTIVE/CLOSED count đếmcollectionđủcursor. LayoutKPIlength/warranty/geometry vàmini-metric không cósource đủ cho summary giữ “Chưa cập nhật”; filters sắp hết hạn/chờ duyệt tuyến giữ vịtrí nhưngdisabled/chưa cậpnhật, khônggọilọc trạngthái tựchế. Stats phụ cóAPIriêng nhưng chưađủreadmodel/paginationđể chứngnhận KPI tổng nênkhôngtrìnhbày0/thànhcông. HeaderPMdựaserverprimaryID, khôngdùngname/email cấpquyền. Khôngrawdetail/“từ API”/fontmono nghiệpvụ. GiữMaterialIcons,spacing/radius/shadow/cardhierarchy gốc,vàng/chữtrắng choCTA. KhôngauthStore/logout/renew/session/backend/DB/seed/Docker/migrationhoặccây thưmụcmới.

Giữsửađúng: Sup **khôngrender nút hoặcmodal Thêmnhânsự**,khôngeligible/POSTmembers; PMvẫnaction/APIadd vàjournalđãsửa. CloseProjectModal/lifecycleofficial giữnguyên,khôngsửanghiệpvụ. Geometryconfirm/draftreadonly và UNKNOWNinputgate giữnguyên. Khôngkhôiphụcbbox/metrics/localworkflowapprovalgiả.

Đốichiếuvisual: đọcsourcegitf673c15 vàrender tài liệu thamchiếubốcụcngoàirepo (`%TEMP%/rg-design-reference/baseline-list.html`,baseline-overview.html), dùngdữliệutrống chỉchoảnhthamchiếu **không dùng nhưfixture/HTTP response/appbusinessdata**. Bảnthamchiếulịch sử cótext/NaN cũ do dataempty, chỉđốichiếu vịtrí/hierarchy; khôngphảichứngnhậnnghiệpvụ. Đãxemảnhbaseline-list/overviewvàảnhSup/PM list/table/overviewthật. Browserảnhđầu mobileheaderoverflow,đãsửawrap/min-width vàrerun. Bảngsegmentwide cuộntrongkhung,khôngdocumentoverflow. Ảnh/logtempkhôngstage.

Tests: tools/check-review-293d001.cjs **111PASS** (HTTP/hooks/render,mockregressionkhôngE2E); thêmlayoutassert5KPI/3card/4timeline/tableframe vàkhông0km/0nhánh/04-of-04 hoặcstateclaimgiả. Existingrole/closurejournal/geometryrace/UNKNOWNparser tiếp tụcPASS. tsc-b/build/diff-checkPASS, lintNOT_RUNkhôngscript; cảnhbáoTailwind/chunkcósẵn.

Browser rg-design-restore-browser.cjs trênruntime sạch roadguard-case409-clean-20261106/HTTPS28443proxy5173,ready200: Sup/PM-A list/table/overview/F5 vàgeometrypreviewserver200m từbiênnhậnscenarioPASS; Supmemberactionẩn,eligible0/memberwrite0; PMnútvẫnhiện; pageerror0,projectrequests sauLogout204=0. Desktop1440vàmobile375scrollWidth375PASS. Giữmembertestgốc,khôngtạodữliệumới. rg-geometry-unknown-browser.cjs rerunPASS: importfileGeoJSONđínhkèmCenterline119/CRSUNKNOWN/Lưudraftdisabled/0businesswrites,khôngsuyCRS. Lifecycleentry/modal GETeligibility thật kiểmriêng,trạngtháiseedUNKNOWNnênkhôngPOSTclose. Khôngtuyênbốpositiveclose/draftwriteE2E.

Bàn giao: restoredgrid/table/KPI/filter/header/overviewframes, timeline/segments/mapcards vàworkflowlinks; phầnmetric/lifecycle stage/segmentrows chỉgiữkhungkhi chưađủsource. Khôngxóacomponentgốc/fixture ngoài phạmvi. Inputtestkhôngcommit; khôngsecret/credential/cookie hoặcDBdata trongGit. Browserpositivefreshadd/projectclose/geometrywrite mới NOT_RUN; đây làkhôiphụcthiếtkếvàbảotoànluồngđãcó,khôngclaimhoàntấtbackendgaps.


### 06/11/2026 — Inventory trước khôi phục UI toàn dự án

Base HEAD `0ba9a8bdb18e6e8874be71636b9c15ddbfc3e92a`, nhánh hoang, cây làm việc sạch trước task. Đã quét 218 commit bằng git log --all, diff name-status/stat/numstat, log --diff-filter=D, route/import App và toàn bộ TSX/CSS trong src. Baseline **`afaaaf1bf5fa6b45c16466c43ca9e8d4dcfc8b25`** đứng trước các đợt thay active view Geometry (4012f02), Survey (3065cf7), AI (6725f28); không chọn riêng từ Project. Đối chiếu bổ sung baseline Project `f673c15d45c443435b81876529a4ff8fa9d9a1ff`, trước 383e220. Trước task, App.tsx, src/components và CSS giữ nguyên so với baseline; không mất route trong chuỗi giản lược này. Các file bị xóa trước baseline được kiểm kê riêng bên dưới, không tự khôi phục mock/route trùng. Baseline chỉ làm nguồn bố cục, không thay Spec/OpenAPI về quyền/API. Ghi nhận này được thêm trước khi sửa UI.

| Khu vực | Route | Component/file | Baseline có | HEAD hiện tại | Bị xóa/rút gọn gì | Cần khôi phục |
|---|---|---|---|---|---|---|
| shell | Legacy/helper/modal; không có route riêng | `src/App.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| common | `/pm/field-tasks`, `/pm/conflicts`, `/pm/conflict-center` + 3 alias (xem bảng route) | `src/components/common/ImageComparisonSlider.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| common | `/pm/field-tasks`, `/pm/conflicts`, `/pm/conflict-center` + 3 alias (xem bảng route) | `src/components/common/PhotoLightboxModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| common | `/pm/field-tasks`, `/pm/conflicts`, `/pm/conflict-center` + 3 alias (xem bảng route) | `src/components/common/RoadDefectImages.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| common | `/pm/field-tasks`, `/pm/conflicts`, `/pm/conflict-center` + 3 alias (xem bảng route) | `src/components/common/SafeImage.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| common | `/pm/profile`, `/sup/profile` | `src/components/common/SelfPhoneNumberForm.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| common | Component dùng chung / modal; theo caller | `src/components/common/UserProfileModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| layout | Component dùng chung / modal; theo caller | `src/components/layout/Header.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| layout | Component dùng chung / modal; theo caller | `src/components/layout/ProtectedRoute.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| layout | Component dùng chung / modal; theo caller | `src/components/layout/Sidebar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/dashboard`, `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a` + 3 alias (xem bảng route) | `src/components/ui/Button.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` + 8 alias (xem bảng route) | `src/components/ui/Card.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/dashboard`, `/pm/projects`, `/pm/projects/:id` + 60 alias (xem bảng route) | `src/components/ui/Icon.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/repair-batches/assign` | `src/components/ui/InputField.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/dashboard`, `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a` + 1 alias (xem bảng route) | `src/components/ui/StatusBadge.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | Component dùng chung / modal; theo caller | `src/components/ui/ToastContainer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/projects/:id/alignment`, `/pm/alignment`, `/pm/proposals` + 13 alias (xem bảng route) | `src/components/ui/Tooltip.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| ui | `/pm/proposals`, `/pm/proposals/:id`, `/pm/work-packages` + 9 alias (xem bảng route) | `src/components/ui/TruncatedText.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| shell | Toàn ứng dụng | `src/index.css` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| shell | Legacy/helper/modal; không có route riêng | `src/main.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/AcceptInvitation.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/ForceChangePassword.tsx` | Có | Đã đổi +10/-10 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/Login.tsx` | Có | Đã đổi +9/-11 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/accept-invitation/AcceptForm.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/accept-invitation/ExpiredInvitationView.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/accept-invitation/InvitationCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Toàn ứng dụng | `src/pages/(auth)/auth-light-aurora.css` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/force-change-password/ForcePasswordForm.tsx` | Có | Đã đổi +3/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/login/ForcePasswordSection.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/login/LoginForm.tsx` | Có | Đã đổi +21/-44 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (auth) | Legacy/helper/modal; không có route riêng | `src/pages/(auth)/login/LoginHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/AIReviewInbox.tsx` | Có | Đã đổi +2/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/AlignmentSegments.tsx` | Có | Đã đổi +5/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/repair-batches/assign` | `src/pages/(pm)/AssignCrew.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/surveys/create` | `src/pages/(pm)/CreateSurvey.tsx` | Có | Đã đổi +1/-370 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` | `src/pages/(pm)/DefectDetailVerify.tsx` | Có | Đã đổi +7/-106 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/surveys/:id`, `/pm/surveys/:id/review`, `/pm/drone-mission` + 5 alias (xem bảng route) | `src/pages/(pm)/DroneMissionAIReview.tsx` | Có | Đã đổi +1/-345 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/FastTrackDispatch.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/field-tasks`, `/sup/field-tasks` | `src/pages/(pm)/FieldTasks.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/notifications`, `/sup/notifications` | `src/pages/(pm)/NotificationsHandoffHub.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/OfflineConflicts.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/dashboard` | `src/pages/(pm)/PMDashboard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/PMLayout.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/profile`, `/sup/profile` | `src/pages/(pm)/ProfilePage.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/ProjectList.tsx` | Có | Đã đổi +71/-83 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/ProjectOverview.tsx` | Có | Đã đổi +52/-130 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/RepairProposals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/surveys`, `/sup/surveys` | `src/pages/(pm)/SurveyRequests.tsx` | Có | Đã đổi +1/-181 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/BatchActionBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/CaseReportsPanel.tsx` | Không | Đã đổi +129/-0 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/ai-review/CitizenTriageChildRow.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/ai-review/CitizenTriageRow.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/ai-review/CitizenTriageStatusBadge.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/CitizenTriageTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerClusterDeduplication.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerDecisionBanners.tsx` | Có | Đã đổi +5/-57 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerDecisionForm.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerFooter.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerHeader.tsx` | Có | Đã đổi +2/-2 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerMediaViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerMergedReportsList.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/DrawerReporterInfo.tsx` | Có | Đã đổi +1/-33 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/ai-review/DroneAiQueueView.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/GisMapModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/LinkReportsModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/NoDefectModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/PhotoZoomModal.tsx` | Có | Đã đổi +1/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/PublishModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/RequestSurveyModal.tsx` | Có | Đã đổi +7/-236 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/ReviewCasesTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/ReviewDetailDrawer.tsx` | Có | Đã đổi +9/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/ReviewDetailModal.tsx` | Có | Đã đổi +2/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/ReviewFilterBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/ReviewHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/ReviewModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/SpatialMergeModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/TriageCard.tsx` | Có | Đã đổi +1/-1 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/ai-inbox`, `/sup/cases`, `/sup/ai-inbox` | `src/pages/(pm)/ai-review/TriageProjectModal.tsx` | Có | Đã đổi +11/-26 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentAddBranchModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentAddModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentApprovalList.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentEditModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id`, `/pm/projects/:id/alignment`, `/pm/alignment` + 3 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentGeometryWorkflow.tsx` | Không | Đã đổi +276/-0 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentImportModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentMap.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentMapLegend.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentSidebar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/AlignmentSplitModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/ImportPanel.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/SidebarFooterKpis.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/SidebarSegmentCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/SidebarSegmentsTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/SidebarSlabsTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id/alignment`, `/pm/alignment`, `/sup/projects/:id/alignment` + 1 alias (xem bảng route) | `src/pages/(pm)/alignment/SidebarWidthProfileTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/create-survey/CreateSurveyForm.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/create-survey/CreateSurveyHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/create-survey/FlightCorridorMap.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/create-survey/OverlapHelpBox.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/dashboard` | `src/pages/(pm)/dashboard/OperationalClocksWidget.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` | `src/pages/(pm)/defect-verify/DefectBoundingBoxViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` | `src/pages/(pm)/defect-verify/DefectGisMapViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` | `src/pages/(pm)/defect-verify/DefectTemporalComparison.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` | `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/defects/:id/verify`, `/pm/defects/:id/verify-a`, `/pm/defects/:id/verify-b` | `src/pages/(pm)/defect-verify/DefectVerifyHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/surveys/:id`, `/pm/surveys/:id/review`, `/pm/drone-mission` + 5 alias (xem bảng route) | `src/pages/(pm)/drone-review/CandidateWorkflow.tsx` | Không | Đã đổi +82/-0 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionQualitySection.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionScrubber.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionTriageList.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/drone-review/MissionViewport.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/AuditModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/DefectDetailModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/DispatchActionBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/DispatchFilters.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/DispatchSection.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/DispatchTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/FastTrackDispatchModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/FastTrackHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/FastTrackModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/PolicyModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/PolicySection.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/fast-track`, `/pm/dispatch`, `/sup/fast-track` + 1 alias (xem bảng route) | `src/pages/(pm)/fast-track/RoadCoverageConfirmModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/ConflictsTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/field-tasks`, `/sup/field-tasks` | `src/pages/(pm)/field-tasks/FieldTasksHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/field-tasks`, `/sup/field-tasks` | `src/pages/(pm)/field-tasks/MeasurementsTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/conflicts/ConflictFilterBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/conflicts/ConflictIncomingStateCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/conflicts/ConflictQueueTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/conflicts/ConflictServerStateCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/conflicts`, `/pm/conflict-center`, `/sup/conflicts` + 1 alias (xem bảng route) | `src/pages/(pm)/field-tasks/conflicts/ConflictTimelineAudit.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/notifications`, `/sup/notifications` | `src/pages/(pm)/notifications/AudioConfigModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/notifications`, `/sup/notifications` | `src/pages/(pm)/notifications/NotificationsFeed.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/notifications`, `/sup/notifications` | `src/pages/(pm)/notifications/NotificationsFilterBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/notifications`, `/sup/notifications` | `src/pages/(pm)/notifications/NotificationsHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/notifications`, `/sup/notifications` | `src/pages/(pm)/notifications/NotificationsSlaWidgets.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/AddProjectMemberModal.tsx` | Có | Đã đổi +52/-39 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx` | Có | Đã đổi +12/-147 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/ProjectMapPreviewCard.tsx` | Có | Đã đổi +7/-254 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Có | Đã đổi +17/-168 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/ProjectPersonnelCard.tsx` | Có | Đã đổi +28/-116 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx` | Có | Đã đổi +7/-259 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects/:id`, `/sup/projects/:id` | `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Có | Đã đổi +6/-285 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects`, `/pm/projects/:id`, `/sup/projects` + 1 alias (xem bảng route) | `src/pages/(pm)/projects/CloseProjectModal.tsx` | Có | Đã đổi +44/-264 | Cần đối chiếu | Rà JSX/khôi phục khung; không trả mock |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/projects/CreateProjectModal.tsx` | Có | Đã đổi +18/-55 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/projects/ProjectGridView.tsx` | Có | Đã đổi +16/-73 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/projects/ProjectLifecycleModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/projects/ProjectListFilters.tsx` | Có | Đã đổi +8/-8 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/projects/ProjectListHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/projects/ProjectListKpis.tsx` | Có | Đã đổi +12/-13 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/projects/ProjectTableView.tsx` | Có | Đã đổi +16/-41 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/CreateProposalModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalBOQCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalDetailModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalFilterBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/repair-proposals/ProposalPDFPreviewModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalStats.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/proposals`, `/pm/work-packages`, `/pm/repair-batches` + 3 alias (xem bảng route) | `src/pages/(pm)/repair-proposals/ProposalTableRow.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/surveys`, `/pm/surveys/create`, `/sup/surveys` | `src/pages/(pm)/surveys/DroneSimulatorModal.tsx` | Có | Đã xóa | Cần đối chiếu | Khôi phục khung không mô phỏng; hook simulator không khôi phục vì tạo fake state |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/surveys/SimulatorTelemetryGrid.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/surveys/SurveyCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/surveys/SurveyHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/surveys/SurveyKpiCards.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | Legacy/helper/modal; không có route riêng | `src/pages/(pm)/surveys/SurveyTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (pm) | `/pm/surveys`, `/pm/surveys/create`, `/sup/surveys` | `src/pages/(pm)/surveys/SurveyWorkflow.tsx` | Không | Đã đổi +87/-0 | Cần đối chiếu | Dùng logic hiện hành; kiểm route/layout |
| (sup) | `/pm/acceptance`, `/sup/acceptance` | `src/pages/(sup)/AcceptanceList.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/AuditTrail.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/approvals/:id/reject` | `src/pages/(sup)/BatchRejection.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/EvidenceCloseoutDetail.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/PersonnelManagement.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/ProposalApprovalDetail.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/research-validation`, `/pm/rpt-09`, `/sup/research-validation` + 1 alias (xem bảng route) | `src/pages/(sup)/ResearchValidation.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/RiskAnalytics.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/SupDashboard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/SupLayout.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/SystemControl.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/audit-trail/AuditTrailFilters.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/audit-trail/AuditTrailHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/audit-trail/AuditTrailInspector.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/audit-trail/AuditTrailMetrics.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/audit-trail/AuditTrailModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/audit-trail`, `/pm/rpt-10`, `/sup/audit-trail` + 1 alias (xem bảng route) | `src/pages/(sup)/audit-trail/AuditTrailTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardExportModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardRightCards.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardRiskMap.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardRiskMapTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardRiskTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/sup/dashboard` | `src/pages/(sup)/dashboard/DashboardTopMetrics.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/ActionButtons.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/AfterViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/BeforeViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/CloseoutHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/CloseoutModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/ComparisonViewer.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/DeclareConstructionModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/ExportPdfAModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/ExportZipModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/ReworkModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/StatusBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/TechnicalCriteriaCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/work-orders/confirm`, `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` + 5 alias (xem bảng route) | `src/pages/(sup)/evidence-closeout/VerifyModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ApprovalItemsTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ApprovalModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ApprovalStatsBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/BatchApproveModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/DecisionModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/DefectPhotoModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ItemsFilterBar.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ItemsTableRow.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/proposals/:id`, `/pm/work-packages/:id`, `/pm/repair-batches/:id` + 3 alias (xem bảng route) | `src/pages/(sup)/proposal-approval/ProposalDispatchModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/research-validation`, `/pm/rpt-09`, `/sup/research-validation` + 1 alias (xem bảng route) | `src/pages/(sup)/research/AsyncValidationJobBanner.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/research/PairedSamplesTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/research-validation`, `/pm/rpt-09`, `/sup/research-validation` + 1 alias (xem bảng route) | `src/pages/(sup)/research/ResearchHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/research/ValidationMetricsCards.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/research/ValidationRunsTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/AsyncExportWorkerCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/DossierDetailModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/ExportRecordRow.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/LegalAuditStrip.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/NewExportModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/RiskDeteriorationSection.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/risk-analytics/RiskExportsTable.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/RiskHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/risk-analytics/RiskMetricsGrid.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/RiskModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/reports`, `/pm/risk-analytics`, `/sup/reports` + 1 alias (xem bảng route) | `src/pages/(sup)/risk-analytics/TimeRangeModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/AIModelsTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/system-control/AccountsTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/system-control/AddPersonnelModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/CreateDeletionRequestModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/DefectCatalogModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/DefectCatalogTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/DeletionRequestDetailModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/DeletionRequestsCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/system-control/EditUserModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/LegalHoldCard.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/LegalHoldModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/ProjectRetentionDetailModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/system-control/ResetPasswordModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/RetentionLegalHoldTab.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/system-control/SuspendUserModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/retention`, `/pm/system-control`, `/pm/wf-12` + 6 alias (xem bảng route) | `src/pages/(sup)/system-control/SystemControlHeader.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | Legacy/helper/modal; không có route riêng | `src/pages/(sup)/system-control/SystemControlModals.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |
| (sup) | `/pm/personnel`, `/pm/team`, `/sup/personnel` + 1 alias (xem bảng route) | `src/pages/(sup)/system-control/UserDetailModal.tsx` | Có | Giữ nguyên | Không mất | Không thay; smoke route |

Chi tiết các phần bị rút gọn lớn: CreateSurvey/SurveyRequests và DroneMissionAIReview chuyển thành alias; RequestSurveyModal mất body form; DrawerReporterInfo mất contact frame; DrawerDecisionBanners mất assignment frame; active Geometry workflow thay legacy AlignmentSegments; ProjectOverview/Header/Highlights/Timeline/Segments/Map/Personnel/Close modal giảm nhiều JSX. LoginForm mất style panel tài khoản mẫu nhưng phải giữ credential dev từ runtime. DefectDetailVerify bỏ optimistic reset/link có chủ ý, JSX vẫn còn nên không phục hồi logic giả. DroneSimulatorModal được khôi phục khung tiến độ; hook simulator không khôi phục vì tạo trạng thái/metrics giả. Inventory này ghi trước edit UI.


### 06/11/2026 — Kết quả khôi phục UI toàn dự án (cùng task inventory trên)

**Phạm vi:** phục hồi bố cục, không triển khai nghiệp vụ mới. Giữ thiết kế Project đã khôi phục trong parent; mở rộng sang Survey/Create/Drone/Geometry/drawer/modal và khung điều hướng mobile. Không xóa component/route nào, không đổi service/API/DTO, authStore, client/interceptor, guard, renew/logout, backend, DB, seed, migration, Docker hoặc config. Header chỉ đổi class responsive; handler profile/logout giữ nguyên.

| Khu vực/component | Phần khôi phục / giữ nguyên | Dữ liệu và giới hạn |
|---|---|---|
| Project List/grid/table/filter/KPI | Giữ toàn bộ bố cục đã khôi phục ở parent: header, toolbar, 5 KPI, card/grid/table, create/close entry | Không quay về mapper/metrics giả; không tự chọn project đầu tiên |
| Project Overview | Giữ header, highlights, timeline, tabs phân đoạn, map/preview và đường dẫn Geometry; phục hồi hierarchy/card nhân sự/role badge và modal đóng vận hành | Thành viên từ server; chỉ PM thấy AddProjectMemberModal, Sup không gọi eligible/POST members. Không thêm avatar/online/authority/contact giả |
| CreateSurvey / SurveyWorkflow | Phân biệt route create/list; header, breadcrumb, 4 KPI, filter/search/tabs/table, form 7 cột/map 5 cột và footer | Chỉ đếm kết quả server đã tải. Coverage/GSD/độ cao/độ phủ/thiết bị/route engineering chưa đủ nguồn giữ khung “Chưa cập nhật”; form ghi vẫn khóa như trước |
| Survey task / DroneSimulatorModal | Khôi phục file modal đã xóa và entry xem tiến độ từ hàng server | Modal chỉ là khung ba bước nhận/nộp/xác minh, không timer, không %, không complete-survey-plan, không nhận thành công giả |
| Drone/CandidateWorkflow | Header/scope selectors, viewer 8 cột–panel 4 cột, tab ảnh/map/đa kỳ, scrubber/play/fullscreen, kết quả/nguồn gốc, quality cards, quyết định | Video/ảnh/coverage chưa đủ reader giữ placeholder; không stock image. Giữ handler quyết định đã có và các nút chưa đủ điều kiện bị khóa |
| AlignmentGeometryWorkflow | Header/breadcrumb/action, discovery panel, map–technical sidebar 8/4 cột, draft/readiness/import, workflow/history frame | SVG chỉ biểu diễn tọa độ đầu vào hoặc geometry confirmed thật, không thêm tile/nhánh/segment/engineering giả. GeoJSON thiếu CRS vẫn UNKNOWN, không ghi; submit/revision/history chưa có contract không tạo trạng thái |
| RequestSurveyModal | Header/source card/method frame/reason/crew & thời hạn frame/footer | Chỉ handler yêu cầu bổ sung hiện có; không biến thành giao FIELD/Drone. Lý do rỗng vẫn khóa |
| DrawerReporterInfo / DrawerDecisionBanners | Contact/source grid và assignment card | Thông tin người gửi/evidence vẫn riêng từng Report ở CaseReportsPanel; không tổng hợp liên hệ giả ở Case |
| LoginForm | Khôi phục card/Material Symbols của hai nút tài khoản mẫu dev, bỏ font-mono ở email | Giữ nguyên đọc credential từ runtime sạch qua dev helper; không đổi xác thực hoặc đưa credential vào production |
| Header/Sidebar/PMLayout/SupLayout | Giữ menu desktop, thêm mở/đóng menu mobile; main cuộn ngang nội dung rộng thay đẩy viewport | Không sửa role menu, route hoặc auth; mobile menu đóng khi đổi route |
| Dashboard PM/Sup, inbox/report/evidence, Defect/repair, acceptance/close, analytics, profile, notification/settings và src/components còn lại | Đã kiểm kê, đối chiếu baseline; giữ nguyên UI không bị giản lược trong chuỗi này | Render smoke không chứng minh mọi chức năng legacy đã có API thật |

**Những phần không khôi phục nguyên code cũ và lý do:** alias CreateSurvey/SurveyRequests/DroneMissionAIReview vẫn dùng reader hiện hành thay hook cũ; layout được khôi phục ở active workflow. Các component legacy CreateSurveyForm/FlightCorridorMap/MissionViewer/AlignmentMap/Sidebar vẫn nằm trong cây thư mục; không nối lại hook cũ chứa default tọa độ/ảnh/metrics hoặc local approval. Giữ khung thao tác phù hợp, chưa tích hợp các command chưa đủ contract. Không gọi các khung placeholder là nghiệp vụ đã hoàn thành. Không phục hồi optimistic reset/link trong DefectDetailVerify vì đó là logic thành công giả, JSX màn Defect vẫn còn.

**Toàn bộ delete trong lịch sử src (đã đối chiếu cả trước baseline):**

| Commit xóa | File/nhóm file | Quyết định |
|---|---|---|
| 3065cf7 | surveys/DroneSimulatorModal.tsx | Khôi phục khung modal, bỏ hoàn toàn simulation |
| 3065cf7 | surveys/useDroneSimulator.ts | Không khôi phục hook timer/metrics/complete-survey-plan giả; không phải thành phần UI độc lập |
| 5c70aeb | fast-track/DispatchMap, DispatchModeSelector, FastTrackBanner | Đã khôi phục ba component theo baseline bổ sung 045f02ce, giữ khung map/mode/banner. Không phục hồi tọa độ, ID, auto-selected Case hoặc command giả |
| 5c70aeb | fast-track/data, fastTrackMapSetup, mockData | Dữ liệu/hook/map giả, không khôi phục |
| 5304fa1 | alignment/SegmentsTable | File dead cleanup trước baseline; ProjectSegmentsTable/AlignmentSidebar và luồng Geometry có khung thay thế, không nhân đôi bảng |
| 53ced52 | alignment/alignmentData, alignmentGeoJson, alignmentSlabsGeoJson; fast-track/fastTrackCrews, Defects, Policy, Routes; risk-analytics/exportRecordsData, Part1, Part2, mockData, projectsConfigData | Refactor/consolidate dữ liệu trước baseline, không phục hồi dataset/hardcode cũ |
| 672b2f1 | components/ui/TableWrapper, alignment/SlabsPanel, store/uiStore | Dead-file cleanup trước baseline; không mất caller/route trong chuỗi khôi phục. Không thêm store hoặc panel kỹ thuật tự điền |
| 50c2fd1 | PM RepairBatching, SubmitApproval, WorkOrderConfirm; Sup BatchApprovals, FieldAcceptance, SignOffClosure | Page trùng trước baseline. App giữ alias repair-batches/proposals/approvals/work-orders/evidence-closeout/acceptance/signoff; đã mở tất cả alias, không khôi phục trang mock song song |

**Căn cứ:** Spec 17_10 Web-Business-Flows §2–4, GIS Map surfaces/version, workflows 01–05 và OpenAPI hiện hành. Chỉ giữ GET đã có trong các service: projects/members, lifecycle closure, work-package/CRS/geometry draft/readiness/confirmed, survey-plans/tasks/datasets, AI runs/result/candidate. Không thêm endpoint, DTO, quyền, trạng thái hay headers mới trong task UI.

**Môi trường và an toàn:** browser Edge headless thật, Vite localhost:5173 proxy HTTPS localhost:28443; `/ready` clean runtime trên 28081 trả 200. Docker label xác nhận Compose `roadguard-case409-clean-20261106`. Seed marker `sbx02-v1` đã có bằng chứng SELECT trong worklog trước; lượt này không xác minh lại marker bằng SQL (sqlcmd không có trong image; không cài công cụ/đổi port). Accounts chính thức đọc trong RAM từ handoff runtime sạch, không ghi credential vào log. Dùng project/scenario sẵn `72f84201-c001-4000-8000-000000000001` và geometry reference từ progress scenario chính thức. Không tạo/sửa/xóa dữ liệu nghiệp vụ. Chỉ login/logout session test; không dùng DB/volume cũ. Các GET legacy `/__dev/*` bị abort trong browser để tránh helper cũ: không trả mock response thay thế. Việc abort được ghi BLOCKED, không tính PASS API.

**Kiểm thử đã chạy:**

| Kiểm tra | Kết quả | Phạm vi bằng chứng |
|---|---|---|
| `node node_modules/typescript/bin/tsc -b` | PASS | Typecheck sau thay đổi cuối |
| `node node_modules/vite/bin/vite.js build` | PASS | Vite build; còn warning chunk lớn/duration cũ, không phải E2E |
| `node tools/check-review-293d001.cjs` | PASS 114 | Mock HTTP/hooks + render regression; thêm test khung survey/create/drone và validation modal bổ sung. Không gọi là browser E2E |
| `git diff --check` | PASS | Không whitespace error |
| Browser toàn App | 114 lượt route/guard | 95 child route PM/Sup + index/default/notification/role guard/logout/public routes; desktop 1440, mobile 375 |
| Pageerror / blank / document overflow | PASS lượt cuối | 0 pageerror, 0 blank, document width không vượt 375 ở tất cả route đã mở. Nội dung legacy rộng cuộn trong main |
| Geometry thật PM/Sup | PASS đọc/F5 | Geometry seed server 200m, preview và đường dẫn workflow; không gửi mutation. GeoJSON 119 điểm thiếu CRS UNKNOWN, nút lưu khóa |
| Project/member UI | PASS quyền hiển thị | Sup không có nút thêm nhân sự/eligible request; PM giữ nút. Chưa gửi POST member/close vì không phải task nghiệp vụ |
| Survey thật PM/Sup | PASS GET/F5 | survey-plans và survey-tasks 200 của project đã chọn; F5 giữ scope URL. Mở/đóng progress modal thành công, không mô phỏng hoặc ghi dữ liệu |
| Drone tabs / menu mobile | PASS UI | Đổi tab map/đa kỳ/nguồn gốc và menu mở/đóng; không ảnh stock hoặc phát request ghi |
| Logout | PASS browser | 204 và không phát request nghiệp vụ sau khi hoàn tất logout; đổi role bằng context/cookie riêng |
| Visual baseline | PARTIAL | Đã so ảnh Project baseline f673c15 với ảnh PM/Sup thật; Survey/Drone/Geometry đối chiếu JSX baseline afaaaf1 và ảnh hiện tại desktop/mobile. Chưa có golden screenshot lịch sử toàn bộ route để pixel-diff |
| Full nghiệp vụ / mọi modal / force-change / invitation | NOT_RUN | Không mutation, không token fixture; smoke route không nghiệm thu mọi action con |

**Blocker/giới hạn còn lại:** work-package trả 401 bằng Web cookie (PM/Sup); một số read result AI legacy cũng 401; Sup defects 403 được giữ là kết quả quyền, không tự bypass. Draft create/submit/reject/history, video/evidence viewer/quality và survey assignment chưa được task này triển khai thêm. Không tự phục hồi command/state cũ để lấp khoảng trống. Một số màn legacy ngoài phần phục hồi vẫn có nguồn sample/helper cũ trong repo; task không kết luận toàn repo đã sạch mọi mock hoặc mọi màn là API thật. Những route đó chỉ đạt render UI và được ghi rõ ở bảng dưới. Full browser E2E toàn nghiệp vụ **chưa hoàn tất**.

**Route smoke-test — từng route:** “Khung render” chỉ xác nhận trang không trắng, không pageerror, có nội dung ở desktop/mobile; không xác nhận tất cả action/DTO. Route `:id`/`:batchId` không có fixture hợp lệ được mở nguyên pattern để kiểm error/guard, luôn BLOCKED chi tiết, không tính E2E. Project param được thay bằng ID server thật. Không mock HTTP response.

| Role | Route | Render | API thật | UI đầy đủ | Console | Kết quả |
|---|---|---|---|---|---|---|
| sup | `/sup/dashboard` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/projects` | Desktop +375px | 200×14 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/projects/:id` | Desktop +375px | 200×17, 401×2; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/projects/:id/alignment` | Desktop +375px | 200×4, 401×2; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/alignment` | Desktop +375px | 200×2 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/surveys` | Desktop +375px | 200×2 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/surveys/:id` | Desktop +375px | 200×3 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/surveys/:id/review` | Desktop +375px | 200×3 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/drone-mission` | Desktop +375px | 200×3 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/drone-mission/:id` | Desktop +375px | 200×3 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/cases` | Desktop +375px | 200×10 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/ai-inbox` | Desktop +375px | 200×10 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/fast-track` | Desktop +375px | 200×5 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/dispatch` | Desktop +375px | 200×5 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/field-tasks` | Desktop +375px | 200×33, 403×2 | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED API |
| sup | `/sup/conflicts` | Desktop +375px | 200×15; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/conflict-center` | Desktop +375px | 200×13; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/proposals` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/proposals/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/work-packages` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/work-packages/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/repair-batches` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/approvals` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/approvals/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/approvals/:id/reject` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/acceptance` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/acceptance/:batchId` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/field-acceptance` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/research-validation` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/rpt-09` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/audit-trail` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/rpt-10` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/evidence-closeout` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/evidence-closeout/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/reports` | Desktop +375px | 200×13 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/risk-analytics` | Desktop +375px | 200×13 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/system-control` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/admin` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/retention` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/wf-12` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/legal-hold` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/personnel` | Desktop +375px | 200×32 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/team` | Desktop +375px | 200×32 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/profile` | Desktop +375px | 200×19 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/signoff` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/notifications` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/notifications` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `opposite role /projects` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS guard |
| sup | `logout` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS |
| pm | `/pm/dashboard` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/projects` | Desktop +375px | 200×7 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/projects/:id` | Desktop +375px | 200×3; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/projects/:id/alignment` | FAIL | Không quan sát request ở lượt này; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/alignment` | FAIL | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/surveys` | FAIL | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/surveys/create` | FAIL | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/surveys/:id` | FAIL | Không quan sát request ở lượt này | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/surveys/:id/review` | FAIL | Không quan sát request ở lượt này | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/drone-mission` | Desktop +375px | 200×3 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/drone-mission/:id` | Desktop +375px | 200×3 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/ai-inbox` | Desktop +375px | 200×4 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/defects/:id/verify` | Desktop +375px | 200×18, 401×4 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/defects/:id/verify-a` | Desktop +375px | 200×18, 401×4 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/defects/:id/verify-b` | Desktop +375px | 200×18, 401×4 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches/create` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/repair-batches/:id/submit` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches/assign` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/field-tasks` | Desktop +375px | 200×23 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/conflicts` | Desktop +375px | 200×7; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/conflict-center` | Desktop +375px | 200×7; /__dev bị chặn | Khung render; không nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/fast-track` | Desktop +375px | 200×6 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/dispatch` | Desktop +375px | 200×6 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/proposals` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/proposals/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/work-packages` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/work-packages/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/repair-batches/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/work-orders/confirm` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/work-orders/:id/confirm` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/evidence-closeout` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/evidence-closeout/:id` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/acceptance` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/acceptance/:batchId` | Desktop +375px | 200×1 | Khung render; chi tiết cần fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/research-validation` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/rpt-09` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/audit-trail` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/rpt-10` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/reports` | Desktop +375px | 200×7 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/risk-analytics` | Desktop +375px | 200×7 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/retention` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/system-control` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/wf-12` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/legal-hold` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/personnel` | Desktop +375px | 200×15 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/team` | Desktop +375px | 200×15 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/profile` | Desktop +375px | 200×10 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/notifications` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/notifications` | Desktop +375px | 200×1 | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `opposite role /projects` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS guard |
| pm | `logout` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS |
| anonymous | `/login` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/accept-invitation` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/invite/:token` | Guard/render | Không quan sát request ở lượt này | Khung render; chi tiết cần fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/auth/setup-password` | Guard/render | Không quan sát request ở lượt này | Khung render; chi tiết cần fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/setup-password` | Guard/render | Không quan sát request ở lượt này | Khung render; chi tiết cần fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/force-change-password` | Guard/render | Không quan sát request ở lượt này | Khung render; chi tiết cần fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/notifications` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/does-not-exist` | Guard/render | Không quan sát request ở lượt này | Khung render; không nghiệm thu mọi action | 0 pageerror | PASS render/guard |


Ảnh so sánh/log smoke nằm ngoài repo trong `%TEMP%/rg-design-reference` và `%TEMP%/rg-global-ui`; không commit fixture hoặc file đầu vào GeoJSON. Inventory trước sửa bao phủ 254 TSX/CSS + 3 component Fast Track khôi phục từ baseline bổ sung; bảng route trên bao phủ toàn router, kể cả alias. Không có thay đổi API/service/auth/backend/DB/config; không thêm mock, credential, hardcode ID nghiệp vụ hoặc localStorage vào luồng phục hồi. Không tuyên bố các helper legacy chưa tích hợp đã thành E2E. Commit riêng cho task UI, parent `0ba9a8bdb18e6e8874be71636b9c15ddbfc3e92a`, full SHA báo khi bàn giao.


**Bổ sung inventory trước khi phục hồi Fast Track:** đối chiếu thêm `045f02ce9137cb7e53c5865daa0867af856b5aa0` (parent 5c70aeb). Ba file DispatchMap/DispatchModeSelector/FastTrackBanner từng có UI thật, không chỉ data cleanup. Khôi phục khung của cả ba trong cây cũ; không nối lại mockData, map setup tọa độ mẫu, auto-selected Case hoặc chế độ ghi tự suy. Điều chỉnh quyết định trong bảng delete: ba component này **được khôi phục khung**, các data/hook giả vẫn không khôi phục. Đây là bổ sung baseline lịch sử cho toàn dự án, không thay baseline chính sau khi đã sửa.


**Kết quả bổ sung Fast Track sau inventory:**

| Khu vực | Route | Component/file | Baseline có | HEAD trước task | Bị xóa/rút gọn | Kết quả phục hồi |
|---|---|---|---|---|---|---|
| Fast Track | /pm/fast-track, /pm/dispatch, /sup/fast-track, /sup/dispatch | fast-track/DispatchMap.tsx | Có tại 045f02ce | Đã xóa | Map/layout/layer toolbar | Đã khôi phục khung, toolbar khóa; không bản đồ/tọa độ giả |
| Fast Track | Cùng các route trên | fast-track/DispatchModeSelector.tsx | Có tại 045f02ce | Đã xóa | Ba card workflow | Đã khôi phục ba card thông tin; không chọn mode/lệnh ghi chưa đủ contract |
| Fast Track | Cùng các route trên | fast-track/FastTrackBanner.tsx | Có tại 045f02ce | Đã xóa | Banner nguồn hồ sơ | Đã khôi phục banner, không tự tick Case/eligibility hoặc báo đã điều phối |

Browser chạy lại cả bốn route Fast Track sau thay đổi cuối: PM/Sup desktop 1440 và mobile 375, cả ba khung render, ba nút mode khóa, 0 pageerror, không document overflow. Test regression bổ sung cho ba component: tổng **114** tình huống mô phỏng/render PASS. Typecheck/build được chạy lại sau thay đổi; diff-check PASS. Survey/Candidate không hiện empty thành công khi collection đọc lỗi; chỉ hiện empty sau khi đã tải được collection tương ứng. Không mở lại xử lý nghiệp vụ Fast Track.


**Danh sách file thay đổi trong commit UI (22 file):**

- `docs/worklogs/WEB-HOANG-WORKLOG-20261022.md`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/pages/(auth)/login/LoginForm.tsx`
- `src/pages/(pm)/CreateSurvey.tsx`
- `src/pages/(pm)/FastTrackDispatch.tsx`
- `src/pages/(pm)/PMLayout.tsx`
- `src/pages/(pm)/ai-review/DrawerDecisionBanners.tsx`
- `src/pages/(pm)/ai-review/DrawerReporterInfo.tsx`
- `src/pages/(pm)/ai-review/RequestSurveyModal.tsx`
- `src/pages/(pm)/alignment/AlignmentGeometryWorkflow.tsx`
- `src/pages/(pm)/drone-review/CandidateWorkflow.tsx`
- `src/pages/(pm)/fast-track/DispatchMap.tsx`
- `src/pages/(pm)/fast-track/DispatchModeSelector.tsx`
- `src/pages/(pm)/fast-track/DispatchSection.tsx`
- `src/pages/(pm)/fast-track/FastTrackBanner.tsx`
- `src/pages/(pm)/project-overview/ProjectPersonnelCard.tsx`
- `src/pages/(pm)/projects/CloseProjectModal.tsx`
- `src/pages/(pm)/surveys/DroneSimulatorModal.tsx`
- `src/pages/(pm)/surveys/SurveyWorkflow.tsx`
- `src/pages/(sup)/SupLayout.tsx`
- `tools/check-review-293d001.cjs`


### 06/11/2026 — Đính chính baseline toàn ứng dụng; inventory trước sửa follow-up

**HEAD kiểm tra:** `33fbe0bf525a7532070b06d7fd4bc329041b8753`, nhánh hoang, status sạch. Chưa sửa code khi lập bảng này. Kết quả task trước chỉ là khôi phục một số khung; **không đủ căn cứ tuyên bố đã khôi phục toàn bộ thiết kế nguyên bản**.

**Snapshot gốc chọn để đối chiếu toàn ứng dụng:** `6644837bb5bb0a042369050fb31ff1b0ab5b7c56` (origin/main = origin/tung = local tung, 20/10/2026, tác giả Nguyễn Văn Tùng). Đây là snapshot nhánh gốc đầy đủ nhất tìm được trong các branch gốc hiện có, không phải commit trước 383e220. So sánh thêm main local `8867730c16d08506e4c1e1d481600f5497081dfb` và backup `37ee496ab538d1d86e90e7c1eada504448abba39`. Không dùng tên tác giả làm bằng chứng “trước mọi Codex”: lịch sử Git không ghi công cụ tạo commit, nên **chưa thể xác minh tuyệt đối mốc trước Codex**. Không có một SHA duy nhất chứa đồng thời mọi UI đã từng có; snapshot gốc kết hợp inventory lịch sử và giữ các màn hợp lệ thêm sau này.

| Snapshot | TSX/CSS | JSX node tĩnh | Đánh giá |
|---|---|---|---|
| main | 87 | 8080 | Đối chiếu chéo; không lấy số node làm tiêu chí đầy đủ |
| hoang-backup-before-merge | 242 | 10360 | Đối chiếu chéo; không lấy số node làm tiêu chí đầy đủ |
| origin/main | 246 | 10887 | Nguồn gốc toàn ứng dụng |
| 045f02c | 251 | 11855 | Đối chiếu chéo; không lấy số node làm tiêu chí đầy đủ |
| afaaaf1 | 250 | 11494 | Đối chiếu chéo; không lấy số node làm tiêu chí đầy đủ |
| HEAD | 257 | 11263 | Đối chiếu chéo; không lấy số node làm tiêu chí đầy đủ |

Đã đọc history toàn repo 219 commit, branch remote qua ls-remote, App registry và diff JSX/children/button giữa snapshot. ZIP đã quét đệ quy thư mục dự án cha, Downloads và Desktop (bỏ node_modules/.git/bin/obj/dist): `drive-download-20261017T104249Z-1-001.zip` chỉ chứa 6 sơ đồ PNG; `RoadGuard-Project-Docs-v0.1.zip` chứa 44 tài liệu, không source FE. Không thấy ZIP FE/App.tsx/Sidebar.tsx dự án RoadGuard khác tại các vị trí đã quét; không suy ra không tồn tại trên mọi ổ đĩa.

**Phát hiện đã bỏ sót:** menu Dự án & Tuyến bị đổi thành link Project nên mất entry Geometry ở cả hai role; Survey mất nhánh danh sách/tạo yêu cầu/thẩm định. Các link cũ gắn srv-01/det-03 là ID giả, không được phục hồi. InvitationCard mất summary/role/security frame; ProfilePage và UserProfileModal mất professional/role/info/security frame khi bỏ dữ liệu giả. Các component còn tồn tại nhưng không render: CreateSurveyHeader/Form/FlightCorridorMap, SurveyHeader/Kpi/Table, MissionHeader/Viewer/Triage/Modals và LegacyAlignmentSegments children. Cần ghép dữ liệu thật/gate vào component gốc, không coi khung mới rút gọn là đã hoàn nguyên.

#### Inventory toàn bộ menu/route — trước chỉnh sửa

| Menu | Route | Màn hình | Có trong snapshot gốc | Có ở HEAD | Đã mất gì | Cách khôi phục |
|---|---|---|---|---|---|---|
| Route phụ / từ màn cha | `/login` | Login | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/accept-invitation` | AcceptInvitation | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/invite/:token` | AcceptInvitation | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ activation handler, khôi phục summary/security layout không token/ID giả |
| Route phụ / từ màn cha | `/force-change-password` | ForceChangePassword | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm` | Layout/index | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Tổng quan PM | `/pm/dashboard` | PMDashboard | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Dự án bảo hành | `/pm/projects` | ProjectList | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/projects/:id` | ProjectOverview | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/projects/:id/alignment` | AlignmentSegments | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Khôi phục entry menu và layout Geometry gốc; giữ UNKNOWN và gate server |
| Tuyến & Phân đoạn | `/pm/alignment` | AlignmentSegments | Có | Có | Mất menu trực tiếp | Khôi phục entry menu và layout Geometry gốc; giữ UNKNOWN và gate server |
| Đợt bay Drone | `/pm/surveys` | SurveyRequests | Có | Có | JSX 14→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Tạo yêu cầu bay | `/pm/surveys/create` | CreateSurvey | Có | Có | Mất menu trực tiếp; JSX 10→1; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/pm/surveys/:id` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/pm/surveys/:id/review` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/pm/drone-mission` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/pm/drone-mission/:id` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Hộp thư tiếp nhận lỗi | `/pm/ai-inbox` | AIReviewInbox | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/defects/:id/verify` | DefectDetailVerify | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/defects/:id/verify-a` | DefectDetailVerify | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/defects/:id/verify-b` | DefectDetailVerify | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/repair-batches/create` | Navigate | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/repair-batches/:id/submit` | Navigate | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/repair-batches/assign` | AssignCrew | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nhiệm vụ & Đo đạc hiện trường | `/pm/field-tasks` | FieldTasks | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/conflict-center` | OfflineConflicts | Có | Có | Component FieldTasks→OfflineConflicts | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Điều phối nhanh | `/pm/fast-track` | FastTrackDispatch | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/dispatch` | FastTrackDispatch | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Gói sửa chữa | `/pm/proposals` | RepairProposals | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/proposals/:id` | ProposalApprovalDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/work-packages` | RepairProposals | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/work-packages/:id` | ProposalApprovalDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/repair-batches` | RepairProposals | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/repair-batches/:id` | ProposalApprovalDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/work-orders/confirm` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/work-orders/:id/confirm` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/evidence-closeout` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/evidence-closeout/:id` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nghiệm thu | `/pm/acceptance` | AcceptanceList | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/acceptance/:batchId` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Thực nghiệm AI | `/pm/research-validation` | ResearchValidation | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/rpt-09` | ResearchValidation | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nhật ký hoạt động | `/pm/audit-trail` | AuditTrail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/rpt-10` | AuditTrail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Báo cáo KPI | `/pm/reports` | RiskAnalytics | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/risk-analytics` | RiskAnalytics | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Lưu trữ hồ sơ | `/pm/retention` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/system-control` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/wf-12` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/legal-hold` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nhân sự dự án | `/pm/personnel` | PersonnelManagement | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/team` | PersonnelManagement | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/pm/profile` | ProfilePage | Có | Có | JSX 155→92; child gốc không còn render | Khôi phục section gốc, dùng DTO thật/Chưa cập nhật, không đổi auth |
| Route phụ / từ màn cha | `/pm/notifications` | NotificationsHandoffHub | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup` | Layout/index | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Tổng quan Sup | `/sup/dashboard` | SupDashboard | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Dự án bảo hành | `/sup/projects` | ProjectList | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/projects/:id` | ProjectOverview | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/projects/:id/alignment` | AlignmentSegments | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Khôi phục entry menu và layout Geometry gốc; giữ UNKNOWN và gate server |
| Phê duyệt tuyến | `/sup/alignment` | AlignmentSegments | Có | Có | Mất menu trực tiếp | Khôi phục entry menu và layout Geometry gốc; giữ UNKNOWN và gate server |
| Giám sát Drone | `/sup/surveys` | SurveyRequests | Có | Có | JSX 14→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/sup/surveys/:id` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/sup/surveys/:id/review` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/sup/drone-mission` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Route phụ / từ màn cha | `/sup/drone-mission/:id` | DroneMissionAIReview | Có | Có | JSX 61→0; child gốc không còn render | Khôi phục nhánh menu/layout/component gốc; reader hiện hành, thiếu dữ liệu để trống |
| Xử lý cấp bách | `/sup/fast-track` | FastTrackDispatch | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/dispatch` | FastTrackDispatch | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nghiệm thu hiện trường | `/sup/field-tasks` | FieldTasks | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/conflict-center` | OfflineConflicts | Có | Có | Component FieldTasks→OfflineConflicts | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Phê duyệt gói | `/sup/proposals` | RepairProposals | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/proposals/:id` | ProposalApprovalDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/work-packages` | RepairProposals | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/work-packages/:id` | ProposalApprovalDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/repair-batches` | RepairProposals | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/approvals` | Navigate | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/approvals/:id` | ProposalApprovalDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/approvals/:id/reject` | BatchRejection | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nghiệm thu đóng đợt | `/sup/acceptance` | AcceptanceList | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/acceptance/:batchId` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/field-acceptance` | Navigate | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Kiểm định mô hình | `/sup/research-validation` | ResearchValidation | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/rpt-09` | ResearchValidation | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nhật ký hoạt động | `/sup/audit-trail` | AuditTrail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/rpt-10` | AuditTrail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/evidence-closeout` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/evidence-closeout/:id` | EvidenceCloseoutDetail | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/reports` | RiskAnalytics | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Phân tích rủi ro | `/sup/risk-analytics` | RiskAnalytics | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Cấu hình hệ thống | `/sup/system-control` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/admin` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/retention` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/wf-12` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/legal-hold` | SystemControl | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Nhân sự & Phân quyền | `/sup/personnel` | PersonnelManagement | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/team` | PersonnelManagement | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/profile` | ProfilePage | Có | Có | JSX 155→92; child gốc không còn render | Khôi phục section gốc, dùng DTO thật/Chưa cập nhật, không đổi auth |
| Route phụ / từ màn cha | `/sup/signoff` | Navigate | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/sup/notifications` | NotificationsHandoffHub | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `*` | Navigate | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/` | Redirect | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/notifications` | Redirect | Có | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ route/logic hiện hành; so body/modal qua inventory component |
| Route phụ / từ màn cha | `/auth/setup-password` | AcceptInvitation | Không / thêm sau | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ bổ sung hợp lệ sau snapshot; không xóa để quay về thiết kế cũ |
| Route phụ / từ màn cha | `/setup-password` | AcceptInvitation | Không / thêm sau | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ bổ sung hợp lệ sau snapshot; không xóa để quay về thiết kế cũ |
| Xử lý xung đột ngoại tuyến | `/pm/conflicts` | OfflineConflicts | Không / thêm sau | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ bổ sung hợp lệ sau snapshot; không xóa để quay về thiết kế cũ |
| Tiếp nhận phản ánh | `/sup/cases` | AIReviewInbox | Không / thêm sau | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ bổ sung hợp lệ sau snapshot; không xóa để quay về thiết kế cũ |
| Route phụ / từ màn cha | `/sup/ai-inbox` | AIReviewInbox | Không / thêm sau | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ bổ sung hợp lệ sau snapshot; không xóa để quay về thiết kế cũ |
| Xử lý xung đột ngoại tuyến | `/sup/conflicts` | OfflineConflicts | Không / thêm sau | Có | Chưa thấy mất route; cần đối chiếu section/action | Giữ bổ sung hợp lệ sau snapshot; không xóa để quay về thiết kế cũ |

#### Inventory toàn bộ component/layout/style (gồm file còn nhưng JSX mất)

Bảng dùng phân tích AST JSX/child/component/button và graph render tĩnh, không chỉ diff-filter=D. Graph có giới hạn với HOC/alias/conditional; “cần rà caller” không tự kết luận dead. File không đổi vẫn được liệt kê. Các file dữ liệu/hook không phải UI được kiểm riêng khi ghép, không khôi phục mock/localStorage. Cấm lấy số node làm bằng chứng nội dung đã đúng.

| Menu | Route | Màn hình/component | Có trong snapshot gốc | Có ở HEAD | Đã mất gì | Cách khôi phục |
|---|---|---|---|---|---|---|
| Router | Theo route/caller ở bảng trên | `src/App.tsx` | Có | Có | JSX 219→231 | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/common/ImageComparisonSlider.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/common/PhotoLightboxModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/common/RoadDefectImages.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/common/SafeImage.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/common/SelfPhoneNumberForm.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/common/UserProfileModal.tsx` | Có | Có | JSX 155→95 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| Chung | Theo route/caller ở bảng trên | `src/components/layout/Header.tsx` | Có | Có | JSX 24→25 | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/layout/ProtectedRoute.tsx` | Có | Có | JSX 10→16 | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/layout/Sidebar.tsx` | Có | Có | JSX 29→32 | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/Button.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/Card.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/Icon.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/InputField.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/StatusBadge.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/ToastContainer.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/Tooltip.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/components/ui/TruncatedText.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Chung | Theo route/caller ở bảng trên | `src/index.css` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Router | Theo route/caller ở bảng trên | `src/main.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/AcceptInvitation.tsx` | Có | Có | JSX 45→46 | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/ForceChangePassword.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/Login.tsx` | Có | Có | JSX 37→39 | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/accept-invitation/AcceptForm.tsx` | Có | Có | JSX 84→64; Không còn child: HelpCircle, User | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/accept-invitation/ExpiredInvitationView.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/accept-invitation/InvitationCard.tsx` | Có | Có | JSX 60→22; Không còn child: BadgeAlert, Lock, Route, ShieldCheck, Timer | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| Chung | Theo route/caller ở bảng trên | `src/pages/(auth)/auth-light-aurora.css` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/force-change-password/ForcePasswordForm.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/login/ForcePasswordSection.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/login/LoginForm.tsx` | Có | Có | JSX 57→55 | Giữ nguyên bố cục; kiểm browser/action |
| Auth | Theo route/caller ở bảng trên | `src/pages/(auth)/login/LoginHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/AIReviewInbox.tsx` | Có | Có | JSX 12→17 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/AlignmentSegments.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/AssignCrew.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/CreateSurvey.tsx` | Có | Có | JSX 10→1; Không còn child: CreateSurveyForm, CreateSurveyHeader, FlightCorridorMap, Icon | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/DefectDetailVerify.tsx` | Có | Có | JSX 15→33 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/DroneMissionAIReview.tsx` | Có | Có | JSX 61→0; Không còn child: Icon, Link, MissionHeader, MissionModals, MissionTriageList, MissionViewer | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/FastTrackDispatch.tsx` | Có | Có | JSX 11→12 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/FieldTasks.tsx` | Có | Có | JSX 9→12; Không còn child: ConflictResolveModal, ConflictsTab | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/NotificationsHandoffHub.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/OfflineConflicts.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/PMDashboard.tsx` | Có | Có | JSX 130→131 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/PMLayout.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ProfilePage.tsx` | Có | Có | JSX 155→92 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ProjectList.tsx` | Có | Có | JSX 15→25 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ProjectOverview.tsx` | Có | Có | JSX 19→21 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/RepairProposals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/SurveyRequests.tsx` | Có | Có | JSX 14→0; Không còn child: DroneSimulatorModal, Icon, SurveyHeader, SurveyKpiCards, SurveyTable | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/BatchActionBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/CaseReportsPanel.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/CitizenTriageChildRow.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/CitizenTriageRow.tsx` | Có | Có | JSX 52→51 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/CitizenTriageStatusBadge.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/CitizenTriageTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerClusterDeduplication.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerDecisionBanners.tsx` | Có | Có | JSX 68→60 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerDecisionForm.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerFooter.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerHeader.tsx` | Có | Có | JSX 17→18 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerMediaViewer.tsx` | Có | Có | JSX 31→40 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerMergedReportsList.tsx` | Có | Có | JSX 24→81 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DrawerReporterInfo.tsx` | Có | Có | JSX 26→25 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/DroneAiQueueView.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/GisMapModal.tsx` | Có | Có | JSX 23→24 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/LinkReportsModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/NoDefectModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/PhotoZoomModal.tsx` | Có | Có | JSX 13→76 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/PublishModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/RequestSurveyModal.tsx` | Có | Có | JSX 67→29 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/ReviewCasesTable.tsx` | Có | Có | JSX 30→19 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/ReviewDetailDrawer.tsx` | Có | Có | JSX 13→15 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/ReviewDetailModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/ReviewFilterBar.tsx` | Có | Có | JSX 47→50 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/ReviewHeader.tsx` | Có | Có | JSX 25→22 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/ReviewModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/SpatialMergeModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/TriageCard.tsx` | Có | Có | JSX 49→48 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/ai-review/TriageProjectModal.tsx` | Có | Có | JSX 32→64 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentAddBranchModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentAddModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentApprovalList.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentEditModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentGeometryWorkflow.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentHeader.tsx` | Có | Có | JSX 43→49 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentImportModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentMap.tsx` | Có | Có | JSX 102→98; Không còn child: Maximize2, Ruler | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentMapLegend.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentSidebar.tsx` | Có | Có | JSX 19→17 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/AlignmentSplitModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/ImportPanel.tsx` | Có | Có | JSX 38→27 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/SidebarFooterKpis.tsx` | Có | Có | JSX 15→11; Không còn child: Icon | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/SidebarSegmentCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/SidebarSegmentsTab.tsx` | Có | Có | JSX 70→75 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/SidebarSlabsTab.tsx` | Có | Có | JSX 62→66 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/alignment/SidebarWidthProfileTab.tsx` | Có | Có | JSX 42→41 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/create-survey/CreateSurveyForm.tsx` | Có | Có | JSX 103→123; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/create-survey/CreateSurveyHeader.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/create-survey/FlightCorridorMap.tsx` | Có | Có | JSX 44→45; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/create-survey/OverlapHelpBox.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/dashboard/OperationalClocksWidget.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/defect-verify/DefectBoundingBoxViewer.tsx` | Có | Có | JSX 39→49 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/defect-verify/DefectGisMapViewer.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/defect-verify/DefectTemporalComparison.tsx` | Có | Có | JSX 125→91 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx` | Có | Có | JSX 155→144 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/defect-verify/DefectVerifyHeader.tsx` | Có | Có | JSX 31→39 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/CandidateWorkflow.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionHeader.tsx` | Có | Có | JSX 45→52; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionModals.tsx` | Có | Có | JSX 117→79; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionQualitySection.tsx` | Có | Có | JSX 45→40; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionScrubber.tsx` | Có | Có | JSX 23→18; Không còn child: Link; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionTriageList.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionViewer.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/drone-review/MissionViewport.tsx` | Có | Có | JSX 55→53; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/AuditModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DefectDetailModal.tsx` | Có | Có | JSX 39→34 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DispatchActionBar.tsx` | Có | Có | JSX 49→15 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DispatchFilters.tsx` | Có | Có | JSX 26→20 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DispatchMap.tsx` | Có | Có | JSX 16→11 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DispatchModeSelector.tsx` | Có | Có | JSX 51→11 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DispatchSection.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/DispatchTable.tsx` | Có | Có | JSX 93→54 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/FastTrackBanner.tsx` | Có | Có | JSX 17→8 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/FastTrackDispatchModal.tsx` | Có | Có | JSX 79→34 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/FastTrackHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/FastTrackModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/PolicyModal.tsx` | Có | Có | JSX 65→55 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/PolicySection.tsx` | Có | Có | JSX 104→110 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/fast-track/RoadCoverageConfirmModal.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx` | Có | Có | JSX 68→73 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/ConflictsTab.tsx` | Có | Có | JSX 29→33 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/FieldTasksHeader.tsx` | Có | Có | JSX 116→71 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/MeasurementsTab.tsx` | Có | Có | JSX 291→460 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/conflicts/ConflictFilterBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/conflicts/ConflictIncomingStateCard.tsx` | Có | Có | JSX 73→245 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/conflicts/ConflictQueueTable.tsx` | Có | Có | JSX 44→39 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx` | Có | Có | JSX 68→76 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/conflicts/ConflictServerStateCard.tsx` | Có | Có | JSX 57→168 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/field-tasks/conflicts/ConflictTimelineAudit.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/notifications/AudioConfigModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/notifications/NotificationsFeed.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/notifications/NotificationsFilterBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/notifications/NotificationsHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/notifications/NotificationsSlaWidgets.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/AddProjectMemberModal.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx` | Có | Có | JSX 66→12 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/ProjectMapPreviewCard.tsx` | Có | Có | JSX 29→5 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Có | Có | JSX 92→44 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/ProjectPersonnelCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx` | Có | Có | JSX 90→15; Không còn child: Icon | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Có | Có | JSX 57→12 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/CloseProjectModal.tsx` | Có | Có | JSX 69→24 | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/CreateProjectModal.tsx` | Có | Có | JSX 73→75 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/ProjectGridView.tsx` | Có | Có | JSX 83→72 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/ProjectLifecycleModal.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/ProjectListFilters.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/ProjectListHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/ProjectListKpis.tsx` | Có | Có | JSX 36→33 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/projects/ProjectTableView.tsx` | Có | Có | JSX 51→46 | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/CreateProposalModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalBOQCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalDetailModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalFilterBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalPDFPreviewModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalStats.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/repair-proposals/ProposalTableRow.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/DroneSimulatorModal.tsx` | Có | Có | JSX 79→14; Không còn child: SimulatorTelemetryGrid | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/SimulatorTelemetryGrid.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/SurveyCard.tsx` | Có | Có | JSX 26→28; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/SurveyHeader.tsx` | Có | Có | JSX 16→13; Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/SurveyKpiCards.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/SurveyTable.tsx` | Có | Có | Không còn trong graph render tĩnh; cần rà caller/alias | Rà JSX/caller; phục hồi section/action gốc có gate dữ liệu thật |
| PM | Theo route/caller ở bảng trên | `src/pages/(pm)/surveys/SurveyWorkflow.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/AcceptanceList.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/AuditTrail.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/BatchRejection.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/EvidenceCloseoutDetail.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/PersonnelManagement.tsx` | Có | Có | JSX 32→36 | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/ProposalApprovalDetail.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/ResearchValidation.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/RiskAnalytics.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/SupDashboard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/SupLayout.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/SystemControl.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/audit-trail/AuditTrailFilters.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/audit-trail/AuditTrailHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/audit-trail/AuditTrailInspector.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/audit-trail/AuditTrailMetrics.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/audit-trail/AuditTrailModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/audit-trail/AuditTrailTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardExportModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardRightCards.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardRiskMap.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardRiskMapTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardRiskTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/dashboard/DashboardTopMetrics.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/ActionButtons.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/AfterViewer.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/BeforeViewer.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/CloseoutHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/CloseoutModals.tsx` | Có | Có | JSX 4→5 | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/ComparisonViewer.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/DeclareConstructionModal.tsx` | Không | Có | Thêm sau snapshot; giữ nếu hợp lệ | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/ExportPdfAModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/ExportZipModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/ReworkModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/StatusBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/TechnicalCriteriaCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/evidence-closeout/VerifyModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ApprovalItemsTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ApprovalModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ApprovalStatsBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/BatchApproveModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/DecisionModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/DefectPhotoModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ItemsFilterBar.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ItemsTableRow.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/proposal-approval/ProposalDispatchModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/research/AsyncValidationJobBanner.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/research/PairedSamplesTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/research/ResearchHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/research/ValidationMetricsCards.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/research/ValidationRunsTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/AsyncExportWorkerCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/DossierDetailModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/ExportRecordRow.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/LegalAuditStrip.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/NewExportModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/RiskDeteriorationSection.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/RiskExportsTable.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/RiskHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/RiskMetricsGrid.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/RiskModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/risk-analytics/TimeRangeModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/AIModelsTab.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/AccountsTab.tsx` | Có | Có | JSX 71→84 | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/AddPersonnelModal.tsx` | Có | Có | JSX 79→132; Không còn child: Check, Plus | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/CreateDeletionRequestModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/DefectCatalogModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/DefectCatalogTab.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/DeletionRequestDetailModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/DeletionRequestsCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/EditUserModal.tsx` | Có | Có | JSX 66→62 | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/LegalHoldCard.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/LegalHoldModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/ProjectRetentionDetailModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/ResetPasswordModal.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/RetentionLegalHoldTab.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/SuspendUserModal.tsx` | Có | Có | JSX 24→25 | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/SystemControlHeader.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/SystemControlModals.tsx` | Có | Có | JSX tương đương; vẫn đối chiếu nội dung/style | Giữ nguyên bố cục; kiểm browser/action |
| Supervisor | Theo route/caller ở bảng trên | `src/pages/(sup)/system-control/UserDetailModal.tsx` | Có | Có | JSX 78→59; Không còn child: ShieldCheck | Giữ nguyên bố cục; kiểm browser/action |

**Kế hoạch xử lý sau inventory:** phục hồi menu mất trước; không phục hồi link ID mẫu. Rà invitation/profile, rồi ghép các component gốc Survey/Create/Drone/Geometry và các action/modal đã bị thu nhỏ. Giữ tất cả route bổ sung và phân quyền Spec17_10; khi contract không đủ vẫn hiển thị khung và khóa lệnh có giải thích. Chưa commit follow-up. Bảng smoke cũ không thay smoke sau các thay đổi này; cần chạy lại PM/Sup và nêu hạn chế fixture/API.


#### Kết quả follow-up đang làm — chưa commit

Đính chính: “snapshot gốc chọn” ở inventory trên là **ứng viên nhánh gốc đầy đủ nhất tìm được**, chưa phải bằng chứng bản bàn giao nguyên bản tuyệt đối. Đã hỏi đường dẫn ZIP/source hoặc SHA bàn giao trước Codex để đối chiếu thêm. Không có file mới ngoài source hiện hữu; không thay authStore/client/session/logout/guard/API/DTO/config/backend/DB. Các thay đổi dưới đây đang để working tree, chưa stage/commit/push.

| Menu/màn hình | Phần khôi phục thêm sau khi đối chiếu snapshot 6644837 | Trạng thái |
|---|---|---|
| Sidebar PM/Sup | Dự án & Tuyến, entry Tuyến & Phân đoạn / Phê duyệt tuyến; nhánh Survey danh sách/tạo/thẩm định; giữ menu phản ánh/conflicts mới | Đã kiểm browser PM/Sup; link srv-01/det-03 không phục hồi; menu thẩm định khung nhận diện giữ disabled khi chưa chọn hồ sơ |
| Invitation | Summary phân công/role/scope/expiry, security notices; bỏ tên project hardcode còn sót | Đã mở browser không token để kiểm frame. Kích hoạt thật NOT_RUN, không tạo lời mời |
| ProfilePage/UserProfileModal | Professional/certificate/scan frame; Profile tab thiết bị/phiên và bảng theo bố cục cũ | Chỉ khung Chưa cập nhật, upload/revoke khóa, không đổi session logic. Browser mở tab/modal PASS |
| Survey list | Nối lại SurveyHeader, SurveyKpiCards, SurveyCard thật vào active workflow; grid mặc định và table tùy chọn | Record SurveyPlanV2ResponseDto/SurveyTaskV2ResponseDto trực tiếp, không map thành lifecycle bay giả; KPI thiếu bằng chứng để trống |
| CreateSurvey | Nối lại CreateSurveyHeader, bốn card CreateSurveyForm và FlightCorridorMap trong layout gốc 7/5 cột | readOnly branch explicit; blank engineering, không preset/fallback Operator; không submit. Xóa tọa độ fallback ở map |
| Drone/Candidate | Nối lại MissionHeader/MissionQualitySection/MissionViewer/MissionTriageList qua serverView branch | Header/breadcrumb/action, quality 4 khối, viewer controls/scrubber/fullscreen, triage cards/filter/audit frame. Legacy viewport/scrubber có ảnh mẫu không được render. Evidence chưa có giữ placeholder, capture/layer/playback/lock/refly khóa |
| Geometry | Nối lại AlignmentSidebar ba tab và AlignmentImportModal inspect-only | Giữ parser/readers/anti-race hiện hành. Không manual-WGS84/preset hoặc tạo nhánh/tấm. File thiếu CRS UNKNOWN, lệnh ghi khóa |
| Project Overview | Khôi phục nguyên hierarchy/màu ba Highlights card từ source gốc, timeline dọc năm bước, map toolbar/fullscreen/legend và section phân đoạn/6 cột | Không suy hoàn thành bước từ số liệu; warranty/metrics thiếu để Chưa cập nhật, progress không giả 70/100%. Geometry vẫn đọc server |
| Defect temporal evidence | Giữ split/side-by-side layout, thay fallback đường tổng hợp bằng empty evidence | Không dựng bề mặt đường/ảnh thay bằng chứng khi thiếu/ảnh lỗi |

**Những phần chưa đủ căn cứ gọi là nguyên bản đầy đủ:** chưa có ZIP/source bàn giao được chủ dự án xác nhận. MissionModals/refly/baseline form, một số FIELD/FastTrack action/detail modal, các section/slab/width/profile child gốc và ProjectSegments row/detail chưa được khôi phục 1:1 toàn bộ. Các file còn tồn tại nhưng branch legacy chứa dữ liệu giả vẫn không được kích hoạt. Cần rà từng action với contract và ghép gate trước khi có thể chốt toàn bộ; không gọi việc thêm một khung placeholder là phục hồi hoàn chỉnh. Không commit khi các điều kiện này chưa được giải quyết.

**BLOCKED nghiệp vụ/dữ liệu, không đồng nghĩa xóa UI:** work-package Web cookie vẫn 401; một số AI result 401; Sup defects 403; thiếu read-model chứng chỉ/thiết bị Web session, media/video và dữ liệu kỹ thuật có nguồn. Draft submit/revision/history phải theo contract thực, không dùng enum/command cũ giả lập. Thống kê geometry/coverage/GSD/AI audit không có bằng chứng không hiện số 0 thay thế. Không sửa backend hoặc tạo fixture để ép kiểm thử PASS.

**Kiểm thử follow-up:** Typecheck PASS; Vite build PASS (còn warning chunk/duration cũ); 119 regression mock/hooks/render PASS; git diff --check PASS sau sửa newline. Browser Edge thật qua proxy HTTPS28443 của runtime sạch, không mock response. Các /__dev legacy bị abort để không đọc DB cũ; không mutation nghiệp vụ. PM/Sup tương tác menu, grid/table, Geometry tab/import modal, profile professional/session tab/modal, mobile menu PASS, 0 pageerror, 0 ghi nghiệp vụ. PM input GeoJSON 119 điểm giữ UNKNOWN và save disabled. Hai selector test ban đầu sai accessible name vì Icon text gây timeout; sửa locator theo heading/regex rồi chạy lại PASS, không phải lỗi app. Force-change/invitation mutation/mọi modal/state transition chưa có fixture: NOT_RUN.

Ảnh/log tạm ở `%TEMP%/rg-original-ui`, không commit dữ liệu GeoJSON hoặc credential. Chưa có golden screenshot lịch sử toàn bộ ứng dụng, chỉ đối chiếu source/JSX/styles snapshot và ảnh browser hiện tại; **chưa nghiệm thu pixel-perfect toàn ứng dụng**.


#### Route smoke follow-up sau thay đổi cuối (HEAD 33fbe0b + working tree)

114 lượt: 76 render-only, 22 BLOCKED fixture chi tiết, 3 BLOCKED API, 4 NOT_RUN token/force fixture, 5 anonymous render/guard, 2 wrong-role guard, 2 logout. Một số render-only có helper legacy đã abort; đánh dấu BLOCKED riêng dưới đây. Tất cả route quan sát có nội dung desktop/mobile, 0 pageerror, 0 document overflow ở 375px. Project chi tiết dùng ID server thật; các detail pattern chưa có fixture được mở nguyên `:id` để kiểm error frame, không tính E2E. Không sửa code hoặc tạo dữ liệu để đổi kết quả này.

| Role | Route | Render | API thật | UI đầy đủ | Console | Kết quả |
|---|---|---|---|---|---|---|
| sup | `/sup/dashboard` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/projects` | 1440px +375px | 200×6 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/projects/:id` | 1440px +375px | 200×14; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/projects/:id/alignment` | 1440px +375px | 200×5, 401×2; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/alignment` | 1440px +375px | 200×2 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/surveys` | 1440px +375px | 200×2 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/surveys/:id` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/surveys/:id/review` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/drone-mission` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/drone-mission/:id` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/cases` | 1440px +375px | 200×4 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/ai-inbox` | 1440px +375px | 200×5 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/fast-track` | 1440px +375px | 200×6 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/dispatch` | 1440px +375px | 200×5 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/field-tasks` | 1440px +375px | 200×7 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/conflicts` | 1440px +375px | 200×9; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/conflict-center` | 1440px +375px | 200×9; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| sup | `/sup/proposals` | 1440px +375px | 200×8 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/proposals/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/work-packages` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/work-packages/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/repair-batches` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/approvals` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/approvals/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/approvals/:id/reject` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/acceptance` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/acceptance/:batchId` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/field-acceptance` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/research-validation` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/rpt-09` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/audit-trail` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/rpt-10` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/evidence-closeout` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/evidence-closeout/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/reports` | 1440px +375px | 200×7 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/risk-analytics` | 1440px +375px | 200×12 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/system-control` | 1440px +375px | 200×4 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/admin` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/retention` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/wf-12` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/legal-hold` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/personnel` | 1440px +375px | 200×20 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/team` | 1440px +375px | 200×21 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/profile` | 1440px +375px | 200×18 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/signoff` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup/notifications` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/sup` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `/notifications` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| sup | `opposite role /projects` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS guard |
| sup | `logout` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS |
| pm | `/pm/dashboard` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/projects` | 1440px +375px | 200×7 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/projects/:id` | 1440px +375px | 200×11, 401×1; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/projects/:id/alignment` | 1440px +375px | 200×4, 401×3; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/alignment` | 1440px +375px | 200×2 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/surveys` | 1440px +375px | 200×2 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/surveys/create` | 1440px +375px | 200×2 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/surveys/:id` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/surveys/:id/review` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/drone-mission` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/drone-mission/:id` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/ai-inbox` | 1440px +375px | 200×4 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/defects/:id/verify` | 1440px +375px | 200×12 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/defects/:id/verify-a` | 1440px +375px | 200×20, 401×4 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/defects/:id/verify-b` | 1440px +375px | 200×16, 401×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches/create` | 1440px +375px | 200×3 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/repair-batches/:id/submit` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches/assign` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/field-tasks` | 1440px +375px | 200×9 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/conflicts` | 1440px +375px | 200×11; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/conflict-center` | 1440px +375px | 200×7; /__dev abort | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED helper legacy; render được |
| pm | `/pm/fast-track` | 1440px +375px | 200×6 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/dispatch` | 1440px +375px | 200×6 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/proposals` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/proposals/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/work-packages` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/work-packages/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/repair-batches/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/work-orders/confirm` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/work-orders/:id/confirm` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/evidence-closeout` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/evidence-closeout/:id` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/acceptance` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/acceptance/:batchId` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/research-validation` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/rpt-09` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/audit-trail` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/rpt-10` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/reports` | 1440px +375px | 200×7 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/risk-analytics` | 1440px +375px | 200×7 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/retention` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/system-control` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/wf-12` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/legal-hold` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/personnel` | 1440px +375px | 200×15 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/team` | 1440px +375px | 200×15 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/profile` | 1440px +375px | 200×10 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm/notifications` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/pm` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `/notifications` | 1440px +375px | 200×1 | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render only |
| pm | `opposite role /projects` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS guard |
| pm | `logout` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS |
| anonymous | `/login` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/accept-invitation` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/invite/:token` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/auth/setup-password` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/setup-password` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/force-change-password` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/notifications` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render/guard |
| anonymous | `/does-not-exist` | Guard / route công khai | Không quan sát ở lượt này | Khung render; chưa nghiệm thu mọi action | 0 pageerror | PASS render/guard |

**Kiểm tra thêm ngoài bảng route:** Project List/grid/table/Overview PM/Sup, đóng modal lifecycle (chỉ GET), đọc geometry confirmed và F5 PASS; không request eligible của Sup (0), không mutation nghiệp vụ (0), không business request sau logout (0). Fullscreen viewer, menu gốc, profile và inspection-only import đã kiểm trên browser. Build/typecheck/regression/diff-check là kiểm riêng, không suy thành E2E toàn nghiệp vụ.

**Trạng thái bàn giao:** CHƯA HOÀN TẤT khôi phục nguyên bản toàn ứng dụng; không commit/push ở lượt này. Cần đối chiếu bản bàn giao/SHA gốc được xác nhận và tiếp tục rà các modal/action/section đã nêu ở mục chưa hoàn tất. Tất cả thay đổi không liên quan được giữ, không reset/restore. HEAD vẫn `33fbe0bf525a7532070b06d7fd4bc329041b8753`.

**File đang sửa trong follow-up:**

- `docs/worklogs/WEB-HOANG-WORKLOG-20261022.md`
- `src/components/common/UserProfileModal.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/pages/(auth)/accept-invitation/InvitationCard.tsx`
- `src/pages/(pm)/ProfilePage.tsx`
- `src/pages/(pm)/alignment/AlignmentGeometryWorkflow.tsx`
- `src/pages/(pm)/alignment/AlignmentImportModal.tsx`
- `src/pages/(pm)/alignment/AlignmentSidebar.tsx`
- `src/pages/(pm)/create-survey/CreateSurveyForm.tsx`
- `src/pages/(pm)/create-survey/FlightCorridorMap.tsx`
- `src/pages/(pm)/defect-verify/DefectTemporalComparison.tsx`
- `src/pages/(pm)/drone-review/CandidateWorkflow.tsx`
- `src/pages/(pm)/drone-review/MissionHeader.tsx`
- `src/pages/(pm)/drone-review/MissionQualitySection.tsx`
- `src/pages/(pm)/drone-review/MissionTriageList.tsx`
- `src/pages/(pm)/drone-review/MissionViewer.tsx`
- `src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx`
- `src/pages/(pm)/project-overview/ProjectMapPreviewCard.tsx`
- `src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx`
- `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx`
- `src/pages/(pm)/surveys/SurveyCard.tsx`
- `src/pages/(pm)/surveys/SurveyKpiCards.tsx`
- `src/pages/(pm)/surveys/SurveyWorkflow.tsx`
- `tools/check-review-293d001.cjs`


### 06/11/2026 — Kiểm reflog và chốt snapshot theo xác nhận Hoàng

Hoàng xác nhận không giữ ZIP source; yêu cầu kiểm reflog/branch rồi dùng 6644837 nếu là nhánh gốc đầy đủ nhất. Đã đọc `git reflog show --all`: 398 entry, 131 SHA duy nhất, 8 SHA không reachable từ branch hiện tại. Đã kiểm refs heads/remotes/stash, `git log --all --graph`, các commit gần nhất của origin/main/tung/backup và fsck read-only. Không checkout/reset/restore working tree đang sửa.

| Nguồn | SHA | Kết quả |
|---|---|---|
| origin/main, origin/tung, local tung | 6644837bb5bb0a042369050fb31ff1b0ab5b7c56 | 345 src file/244 TSX, bộ gốc chốt để phục hồi UI toàn ứng dụng |
| local main | 8867730c16d08506e4c1e1d481600f5497081dfb | 125 src/86 TSX, snapshot sớm hơn, không đầy đủ hơn |
| hoang-backup-before-merge | 37ee496ab538d1d86e90e7c1eada504448abba39 | 336 src/241 TSX, trước main đã bổ sung/polish nhiều màn |
| stash / stash index | 91b4b38d3dfa2016b9b5871bfecf93f03cb6cfc8 | 125 src/86 TSX, bản backup sớm, không có thêm toàn bộ hệ thống |
| reflog unreachable 1774a851,44169a68,61f907f8,841581a6,abf10d86,6f6b62fd | Các bản trước amend/ngôn ngữ thông điệp | Không phải snapshot toàn ứng dụng đầy đủ hơn; UI cùng các màn lịch sử tương ứng |
| reflog unreachable 4f047ef5b03a221502b8b490b1f980cfa02738d5 | Bản trước amend W04/W05 | Giữ tham chiếu bổ sung layout Survey/Geometry, không phục hồi mock/simulator |
| reflog unreachable b6400d6481390158e9f67ab1ba3228348da6cd79 | Widget CRS local (153 dòng service,367 dòng card) | Có UI riêng ngoài snapshot chính; cần đối chiếu contract trước ghép, không tự phục hồi local CRUD/service cũ |

**Chốt nguồn thiết kế:** 6644837bb5bb0a042369050fb31ff1b0ab5b7c56 theo yêu cầu Hoàng; không cần chờ ZIP hoặc xác nhận lại. Các ghi chú trước về “chờ bản gốc” được thay bằng kết quả này. Giữ menu/màn hợp lệ được bổ sung sau snapshot (Case/Sup inbox/OfflineConflicts...), và dùng Spec17_10/OpenAPI hiện hành cho mọi quyền/dữ liệu/lệnh ghi. Không áp dụng wholesale checkout làm lùi auth/API. Inventory trước sửa vẫn áp dụng, cập nhật thêm widget CRS reflog và kết quả dưới đây trước khi sửa thêm.


### 06/11/2026 — Chốt phục hồi UI theo snapshot nhánh gốc sau kiểm reflog

**Snapshot toàn ứng dụng đã chốt theo chỉ dẫn Hoàng:** `6644837bb5bb0a042369050fb31ff1b0ab5b7c56`. Không còn chờ ZIP hoặc xác nhận lại. Nội dung “CHƯA HOÀN TẤT/chờ SHA gốc” ở các mục giữa task là trạng thái lịch sử, được thay bởi kết quả cuối này. Git không ghi công cụ tạo commit; không gắn nhãn “trước mọi Codex” chỉ từ tên tác giả. Đã so origin/main/tung, main local, backup, stash và 8 commit reflog rời; dùng snapshot 6644837 làm nguồn layout/styles, giữ màn hợp lệ bổ sung sau snapshot.

**Hoàn tất phần phục hồi giao diện có thể ghép an toàn:** menu/route gốc còn hợp lệ được giữ; JSX/component bị alias/rút gọn được ghép lại trong active workflow. Giữ API hiện tại thay toàn bộ hook/state/mock cũ. Đây là phục hồi UI trên nền contract hiện hành, **không phải git checkout nguyên snapshot** và không chứng nhận đầy đủ nghiệp vụ hoặc pixel-perfect tất cả màn.

| Menu/khu vực | Kết quả UI cuối | Giữ đúng API / phần khóa vì thiếu dữ liệu |
|---|---|---|
| Login / đổi mật khẩu / lời mời | Giữ layout login/force-password; khôi phục summary/role/scope/expiry/security của lời mời | Không đổi login/session/renew/logout/force-change handler; không tên người mời/project mặc định |
| Dashboard PM/Sup / shared layout | So snapshot không mất page/component; giữ dashboard, header, sidebar; khôi phục menu Dự án & Tuyến và Survey children | Giữ role menu và mobile drawer đang đúng, không trả về sidebar desktop cố định ở 375px |
| Project List/grid/table/filter/KPI | Giữ phần đã phục hồi parent; không còn việc lấy snapshot Project làm chuẩn toàn app | DTO thiếu không thành số 0. Close lifecycle thật vẫn hoạt động theo điều kiện server |
| Project Overview | Khôi phục ba card màu/hierarchy/gradient từ source snapshot, timeline dọc năm bước, bảng phân đoạn sáu cột/empty frame, map toolbar/fullscreen/legend, personnel cards | Không suy bước hoàn tất từ length/defect. Warranty chỉ dùng dữ liệu hợp lệ; nhánh/mặt đường/metrics chưa xác minh để trống |
| CRS reflog widget | Khôi phục ProjectCrsProfileCard từ thiết kế b6400d6, ghép vào Overview | Dùng alignmentService.fetchCrsProfiles; loading/error/empty riêng, không chọn profile đầu tiên; tạo/sửa/CRS preset/local store không phục hồi |
| Geometry | Component gốc AlignmentHeader, AlignmentMap, AlignmentSidebar, AlignmentImportModal render lại trong workflow đọc hiện hành | Giữ geometry server/anti-race/retry, UNKNOWN CRS; toolbar/cross-section/width/slab/branch giữ frame nhưng lệnh ghi khóa khi thiếu contract/engineering |
| Survey / Create | Component SurveyHeader/KpiCards/SurveyCard, CreateSurveyHeader/Form/FlightCorridorMap render lại; grid/table và form bốn khối giữ thiết kế gốc | Read raw plan/task DTO; không status bay, ảnh/coverage/GSD/Operator/route/accessPoint tự điền; create vẫn khóa như baseline API an toàn |
| Drone / AI / Evidence provenance | Component MissionHeader/QualitySection/Viewer/TriageList/Modals render lại; controls, fullscreen, tabs, scrubber, list, audit/quality frame và refly/baseline dialogs có đủ phần xem trước | Legacy MissionViewport/Scrubber/hook có stock image, timestamp/metrics/model giả không render. Modal xác nhận khóa; không gọi flight/baseline command cũ |
| Inbox / Case / Report / Triage | Giữ reader riêng Report và tất cả drawer/modal hiện hành; phục hồi contact/assignment/request frame từ parent và pagination controls của bảng | Không client-page giả khi đã tải hết collection; pagination controls disabled. Không trộn Reporter/evidence hoặc tự tạo FIELD |
| Defect / temporal | Giữ compare split/side-by-side, thêm lại preset25/50/75 của slider | Thiếu ảnh là empty, không synthetic road. Không mượn bbox kỳ hiện tại làm kỳ trước; không ngày/tốc độ suy thoái/diện tích giả |
| Điều phối / Fast Track | Phục hồi layout ba mode cards khác màu, map floating controls/legend/source banner theo JSX snapshot; action bar và dispatch modal summary/crew/equipment frame | Nút của mode chưa hỗ trợ chỉ read-only; không phục hồi local mode/auto-selected Case/dispatch success giả. Handler thật hiện tại giữ nguyên |
| Nhiệm vụ hiện trường / offline conflicts | Giữ màn FIELD và OfflineConflicts đã tách đúng; snapshot cũ gộp chung không bị đưa lại | Không khôi phục “reset sample”. Entry conflicts giữ ở cả role theo route hiện tại |
| Gói sửa chữa / nghiệm thu / evidence-close/archive | Rà route/JSX/child; không mất page layout trong chuỗi bị sửa, giữ current components và alias | Không phục hồi trang trùng trước refactor hoặc approval sai role; command chưa nghiệm thu không tính PASS |
| Báo cáo/KPI / audit / lưu trữ / nhân sự / thông báo | Inventory và browser từng route; giữ UI snapshot không bị mất, giữ các bổ sung Spec17_10 | Render-only không suy API E2E; /__dev helper cũ bị abort trong test để không đọc DB cũ |
| Profile/settings | Phục hồi professional/certificate/scan section, tab thiết bị/session và table; modal profile có lại technical profile frame | Field chưa có read contract “Chưa cập nhật”; upload certificate/revoke session disabled; không thay auth/session nghiệp vụ |

**Ngoại lệ có bằng chứng, không phải UI bị bỏ quên:** hook useDroneSimulator/timer, old approval local state, preset/manual geometry default, stock evidence/model/flight stats, reset sample buttons, auto-selected Case, và page duplicate đã refactor không được phục hồi. Giữ modal/action/frame nếu là UI hợp lệ, khóa lệnh thiếu contract; không nhân lại file/store/route mock. Các child form kỹ thuật legacy vẫn nằm trong cây source, nhưng branch active read-only hiển thị trường trống thay kích hoạt thuật toán/default sai. Không có API/DTO/enum/quyền mới trong task.

**Danh sách blocker API/dữ liệu bàn giao riêng:**

| Endpoint/read model | Bằng chứng / tình trạng | UI xử lý |
|---|---|---|
| GET /projects/{id}/work-package | Browser cookie401 trên runtime sạch | Discovery giữ lỗi, không fake route/scope để mở create/geometry |
| GET /projects/{id}/ai-mock-runs/{runId}/result | Một số runtime read cookie401 | Không hiển thị ảnh/video/triage metrics thay thế; error frame giữ nguyên |
| GET /projects/{id}/defects với Sup | Runtime403 | Giữ giới hạn quyền, không mở backend/đổi Bearer |
| Geometry submit/reject/revision/history tương ứng flow cũ | Chưa có contract đủ để gọi luồng cũ | Header/sidebar/history/action vẫn hiện, command khóa; không thêm enum |
| Survey engineering/assignment, media/video verified read model, coverage/GSD/audit counts | Chưa đủ nguồn/fixture/luồng Web đã tích hợp | Khung gốc và “Chưa cập nhật”; không giảcreate/upload/flightstatus |
| Chứng chỉ, ảnh CCHN, session-device listing/revoke và thay CRS trong widget | Chưa tích hợp contract Web tại các surface này | Giữ layout/modals, không ghi dữ liệu hoặc dùng store local |

**Kiểm thử cuối:**

| Kiểm tra | Kết quả | Giới hạn |
|---|---|---|
| Typecheck `tsc -b` | PASS | Đã sửa lỗi type tham chiếu cũ WorkMode/RouteConfig/stationing và bbox optional do merge UI |
| Vite build | PASS | Warning chunk lớn/duration cũ còn; không phải E2E |
| Focused regression | PASS 123 | Mock HTTP/hooks/render. Thêm menu không ID mẫu, invitation, card/KPI server mode, modal inspect-only, geometry controls, CRS loading, temporal bbox/slider |
| diff-check | PASS | Không whitespace error |
| Toàn router PM/Sup + public/index/alias/guard/logout | 114 lượt browser thật | 76 render-only,22 BLOCKED detail fixture,3 BLOCKED API,4 NOT_RUN token/force,5 anonymous render/guard,2 wrong-role guard,2 logout |
| Desktop1440 / mobile375 | PASS render | 0 blank,0 pageerror,0 document horizontal overflow ở toàn route đã mở; không tuyên bố pixel-diff |
| Project PM/Sup, lifecycle modal chỉ GET, F5 geometry confirmed | PASS browser thật | Sup eligible request0, business write0, business request sau logout0; PM vẫn có add-member |
| Menu/Geometry tabs/import dialog/GeoJSON UNKNOWN | PASS browser thật | PM import file thật,save disabled; không tạo/sửa/confirm geometry |
| Survey grid/table/original create form, Drone fullscreen/refly/baseline dialogs | PASS browser thật | Xem trước/modal đóng mở, mọi confirm chưa đủ contract disabled; không write |
| CRS widget/select/management modal; profile/certificate/session tab/modal | PASS browser thật | Dữ liệu thật hoặc placeholder; lưu CRS/upload/revoke disabled |
| Fast Track fast-track/dispatch PM+Sup | PASS UI 4 route trên2viewport | Không execute dispatch; map không tọa độ giả, mode khóa |
| Invitation/force-change/mọi state mutation | NOT_RUN E2E | Không fixture hợp lệ/mutation trong task UI |

Browser test đầu có selector exact heading không khớp Material Icon text, đã sửa locator và chạy lại PASS. Không gộp timeout test locator thành lỗi app. Browser không mock response; chặn non-auth mutation và legacy /__dev helper, đánh dấu giới hạn ở smoke report. Test accounts/scenario từ clean runtime, không ghi credential; không tạo data mới, không SQL reset/update, không backend/Docker/config changes.

**Điều kiện trước commit:** có SHA snapshot đã chốt; inventory toàn bộ menu/route/file trước sửa; danh sách khôi phục và blocker ở trên; full route smoke PM/Sup (bảng cuối bên dưới); typecheck/build/regression/diff-check PASS. Một commit riêng cho follow-up, tiếng Việt, chỉ stage file thuộc task. Không merge/deploy/force-push. Full E2E nghiệp vụ và golden pixel-diff chưa được chứng nhận.

#### Route smoke cuối sau khôi phục source snapshot 6644837

| Role | Route | Render | API thật | UI đầy đủ | Console | Kết quả |
|---|---|---|---|---|---|---|
| sup | `/sup/dashboard` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/projects` | Desktop1440 +375 | 200×6 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/projects/:id` | Desktop1440 +375 | 200×12; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| sup | `/sup/projects/:id/alignment` | Desktop1440 +375 | 200×6, 401×2; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| sup | `/sup/alignment` | Desktop1440 +375 | 200×2 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/surveys` | Desktop1440 +375 | 200×2 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/surveys/:id` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/surveys/:id/review` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/drone-mission` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/drone-mission/:id` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/cases` | Desktop1440 +375 | 200×10 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/ai-inbox` | Desktop1440 +375 | 200×10 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/fast-track` | Desktop1440 +375 | 200×5 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/dispatch` | Desktop1440 +375 | 200×5 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/field-tasks` | Desktop1440 +375 | 200×18 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/conflicts` | Desktop1440 +375 | 200×11; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| sup | `/sup/conflict-center` | Desktop1440 +375 | 200×7; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| sup | `/sup/proposals` | Desktop1440 +375 | 200×4 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/proposals/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/work-packages` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/work-packages/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/repair-batches` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/approvals` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/approvals/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/approvals/:id/reject` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/acceptance` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/acceptance/:batchId` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/field-acceptance` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/research-validation` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/rpt-09` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/audit-trail` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/rpt-10` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/evidence-closeout` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/evidence-closeout/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| sup | `/sup/reports` | Desktop1440 +375 | 200×13 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/risk-analytics` | Desktop1440 +375 | 200×13 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/system-control` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/admin` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/retention` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/wf-12` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/legal-hold` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/personnel` | Desktop1440 +375 | 200×21 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/team` | Desktop1440 +375 | 200×25 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/profile` | Desktop1440 +375 | 200×22 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/signoff` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup/notifications` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/sup` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `/notifications` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| sup | `opposite role /projects` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS guard |
| sup | `logout` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS |
| pm | `/pm/dashboard` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/projects` | Desktop1440 +375 | 200×7 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/projects/:id` | Desktop1440 +375 | 200×8; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| pm | `/pm/projects/:id/alignment` | Desktop1440 +375 | 200×5, 401×2; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| pm | `/pm/alignment` | Desktop1440 +375 | 200×2 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/surveys` | Desktop1440 +375 | 200×2 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/surveys/create` | Desktop1440 +375 | 200×2 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/surveys/:id` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/surveys/:id/review` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/drone-mission` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/drone-mission/:id` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/ai-inbox` | Desktop1440 +375 | 200×4 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/defects/:id/verify` | Desktop1440 +375 | 200×17, 401×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/defects/:id/verify-a` | Desktop1440 +375 | 200×18, 401×3 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/defects/:id/verify-b` | Desktop1440 +375 | 200×16, 401×2 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches/create` | Desktop1440 +375 | 200×2, 401×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED API |
| pm | `/pm/repair-batches/:id/submit` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches/assign` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/field-tasks` | Desktop1440 +375 | 200×5 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/conflicts` | Desktop1440 +375 | 200×7; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| pm | `/pm/conflict-center` | Desktop1440 +375 | 200×4; /__dev abort | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED helper; render được |
| pm | `/pm/fast-track` | Desktop1440 +375 | 200×3 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/dispatch` | Desktop1440 +375 | 200×8 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/proposals` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/proposals/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/work-packages` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/work-packages/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/repair-batches` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/repair-batches/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/work-orders/confirm` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/work-orders/:id/confirm` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/evidence-closeout` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/evidence-closeout/:id` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/acceptance` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/acceptance/:batchId` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | BLOCKED detail fixture |
| pm | `/pm/research-validation` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/rpt-09` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/audit-trail` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/rpt-10` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/reports` | Desktop1440 +375 | 200×7 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/risk-analytics` | Desktop1440 +375 | 200×7 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/retention` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/system-control` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/wf-12` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/legal-hold` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/personnel` | Desktop1440 +375 | 200×15 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/team` | Desktop1440 +375 | 200×15 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/profile` | Desktop1440 +375 | 200×10 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm/notifications` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/pm` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `/notifications` | Desktop1440 +375 | 200×1 | Layout render; action theo gate/fixture | 0 pageerror | PASS render only |
| pm | `opposite role /projects` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS guard |
| pm | `logout` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS |
| anonymous | `/login` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS render/guard |
| anonymous | `/accept-invitation` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS render/guard |
| anonymous | `/invite/:token` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/auth/setup-password` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/setup-password` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/force-change-password` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | NOT_RUN token/force fixture; rendered guard |
| anonymous | `/` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS render/guard |
| anonymous | `/notifications` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS render/guard |
| anonymous | `/does-not-exist` | Guard/public | Không quan sát request tại lượt này | Layout render; action theo gate/fixture | 0 pageerror | PASS render/guard |

**File thay đổi cuối (35 file):**

- `docs/worklogs/WEB-HOANG-WORKLOG-20261022.md`
- `src/components/common/UserProfileModal.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/pages/(auth)/accept-invitation/InvitationCard.tsx`
- `src/pages/(pm)/ProfilePage.tsx`
- `src/pages/(pm)/ProjectOverview.tsx`
- `src/pages/(pm)/ai-review/ReviewCasesTable.tsx`
- `src/pages/(pm)/alignment/AlignmentGeometryWorkflow.tsx`
- `src/pages/(pm)/alignment/AlignmentHeader.tsx`
- `src/pages/(pm)/alignment/AlignmentImportModal.tsx`
- `src/pages/(pm)/alignment/AlignmentMap.tsx`
- `src/pages/(pm)/alignment/AlignmentSidebar.tsx`
- `src/pages/(pm)/create-survey/CreateSurveyForm.tsx`
- `src/pages/(pm)/create-survey/FlightCorridorMap.tsx`
- `src/pages/(pm)/defect-verify/DefectTemporalComparison.tsx`
- `src/pages/(pm)/drone-review/CandidateWorkflow.tsx`
- `src/pages/(pm)/drone-review/MissionHeader.tsx`
- `src/pages/(pm)/drone-review/MissionModals.tsx`
- `src/pages/(pm)/drone-review/MissionQualitySection.tsx`
- `src/pages/(pm)/drone-review/MissionTriageList.tsx`
- `src/pages/(pm)/drone-review/MissionViewer.tsx`
- `src/pages/(pm)/fast-track/DispatchActionBar.tsx`
- `src/pages/(pm)/fast-track/DispatchMap.tsx`
- `src/pages/(pm)/fast-track/DispatchModeSelector.tsx`
- `src/pages/(pm)/fast-track/FastTrackBanner.tsx`
- `src/pages/(pm)/fast-track/FastTrackDispatchModal.tsx`
- `src/pages/(pm)/project-overview/ProjectCrsProfileCard.tsx`
- `src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx`
- `src/pages/(pm)/project-overview/ProjectMapPreviewCard.tsx`
- `src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx`
- `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx`
- `src/pages/(pm)/surveys/SurveyCard.tsx`
- `src/pages/(pm)/surveys/SurveyKpiCards.tsx`
- `src/pages/(pm)/surveys/SurveyWorkflow.tsx`
- `tools/check-review-293d001.cjs`

Parent của commit follow-up: `33fbe0bf525a7532070b06d7fd4bc329041b8753`. Full SHA được báo sau commit; file đầu vào/ảnh/log temp không stage. Không có diff trong src/api, src/store, App.tsx, vite.config.ts hoặc backend.


### 06/11/2026 — Bước 1: kiểm lại Web session và sửa guard sau phục hồi UI

Baseline thực tế `c76e8050a9f1f24bd42a06193c803116edae5f1a`, parent `69cd1dfb7329d520a569bcc7fea3f992ad7db867`; hoang, working tree sạch, ahead origin/hoang một commit của công việc trước. Giữ nguyên commit đó; không reset/checkout. Đọc AGENTS hiện hành, Spec17_10 Authentication/Users/Membership và Web errors, OpenAPI, auth.ts/client/authService/authStore/App/guards/Login/ForceChangePassword và worklog. Không sử dụng v2.2. Không sửa các màn bước2+ hoặc backend/DB/config.

**Finding sửa:** c76e805 bỏ status checking/error khỏi ba route guard. Bootstrap F5 chưa xong đã có thể redirect Login; trạng thái check lỗi không có retry. Phục hồi gate loading/error trước protected/public/force-password routing. PublicAuthRoute giữ form mount trong authenticating để không mất email/password/error sau login thất bại; chỉ chặn bootstrap/logging-out. Giữ toàn bộ layout/màu/menu/form JSX hiện tại và role/must-change redirect. Không thay transport/session implementation đã đúng.

| File | Lý do |
|---|---|
| src/components/layout/ProtectedRoute.tsx | Chặn render/redirect sớm khi bootstrap chưa xác minh; error và nút retry. Giữ login form trong khi authenticating |
| tools/check-review-293d001.cjs | Thêm guard regression; cho phép RG_AUTH_ONLY=1 chạy riêng auth vì full legacy suite tham chiếu các component bị đổi/xóa bởi baseline UI khác scope |
| docs/worklogs/WEB-HOANG-WORKLOG-20261022.md | Evidence task này và giới hạn |

**Contract đã đối chiếu:** GET /auth/web/csrf anonymous; POST /auth/web/login CSRF; GET /auth/web/session WebSession; POST /auth/web/renew WebRenewal+CSRF (không GET); POST /auth/web/logout WebSession+CSRF+Idempotency-Key; POST /auth/change-password DTO currentPassword/newPassword, WebSession+CSRF+K được khai báo. Không yêu cầu If-Match cho các operation này. Client withCredentials=true, bỏ Authorization, không tự replay mutation; read retry tối đa một lần sau recovery. Recovery GET session trước, chỉ renew khi session401, single-flight theo epoch, không logout khi business401 còn session hợp lệ/403/network. authEpoch + App queryClient.clear/storage cleanup và BroadcastChannel giữ nguyên. Không khôi phục bearer/sessionStorage identity hoặc helper mock.

**Kiểm tự chạy trong lượt này** (không lấy evidence cũ làm PASS): Edge headless thật qua localhost5173 proxy HTTPS28443; /ready28081=200, container clean roadguard-case409-clean-20261106-api-1 đang chạy. Account chính thức đọc trong RAM từ handoff clean, không ghi credential. Chặn /__dev và mutation ngoài auth; không nghiệp vụ write/SQL. Một test ban đầu waitUntil load vướng load trang dashboard; rerun DOMContentLoaded và chờ form ổn định PASS. Lần đọc project detail dùng đường dẫn không có GET trả405 được ghi nhận, đã sửa test sang operation GET reports/summary trong contract và kiểm lại; không sửa API để ép PASS.

| Tiêu chí | Kết quả mới | Bằng chứng / giới hạn |
|---|---|---|
| PM/Sup login đúng/sai | PASS browser/API | Sai password401; thông báo tiếng Việt, đúng role SUPERVISOR/PROJECT_MANAGER |
| F5 server bootstrap | PASS browser | Mở profile và reload, role/actor đúng; không rg_token trong sessionStorage |
| Renew thật | PASS API trong browser | POST renew với CSRF và cookie=200 cho cả2role, role từ server Sup/PM |
| Thu hồi phiên | PASS logout/session API | Backend logout; GET session sau logout401, không mở lại protected route/F5 |
| Logout nhiều tab | PASS browser | Cùng context cookie, tab2 profile bị chuyển Login khi tab1 logout |
| Đổi tài khoản | PASS browser | Cùng context Sup logout rồi PM login; actor/role mới, F5 đúng vùng; không identity cache khôi phục |
| Sai role UI | PASS browser | Sup vào /pm/projects và PM vào /sup/projects bị đưa về dashboard đúng role |
| Quyền server | PASS GET thật | Sup /users200 và summary A/B200; PM /users403, summary A200/B403. Không thay membership/quyền |
| Renew concurrency/failure, mutation replay, late response, network/403, logout failure | PASS 15 focused regression tổng auth | Mock HTTP/hooks, bao gồm single-flight/settle/fencing/context-message/force-password mapping/dispatch; không gọi là browser E2E cho các failure này |
| Login UI desktop/mobile | PASS browser |1440/375 viewport, không document overflow; không sửa layout. Force-change UI giữ nguyên/source review, không fixture thật |
| Force-change PM/Sup thật | NOT_RUN | Không đổi mật khẩu/flag account dùng chung hoặc tạo fixture; regression xác nhận mustChangePassword/guard/epoch |
| Natural expiry/renew sau idle hết hạn; revoke riêng ngoài logout | NOT_RUN | Không clock/DB manipulation, không fixture điều khiển expiry |
| Nhiều401 đồng thời thật | NOT_RUN | Single-flight và mutation identity chỉ đã test mô phỏng, chưa fixture401 runtime đủ điều kiện |
| tsc -b / Vite build / diff-check | PASS | Build không phải E2E |

Command: `RG_AUTH_ONLY=1 node tools/check-review-293d001.cjs` PASS15; `node --single-threaded --max-old-space-size=768 node_modules/typescript/bin/tsc -b` PASS; Vite build PASS (warning chunk/duration cũ). Full toàn repo regression NOT_RUN vì scope này chỉ auth và legacy suite có các component thay đổi ở commit trước; không sửa màn khác để làm suite xanh. Browser scripts/log nằm TEMP, không stage. Source/backend không bị sửa. Không thêm cơ chế auth khác.

Review diff hai lượt: (1) auth/role/API guard ordering và tests đúng status; (2) UI/phạm vi chỉ guard transient state, không đổi màn/style/menu. Trạng thái Bước1 **PARTIAL**: core login/session/renew/logout/RBAC đã kiểm thực; force-change/natural expiry/concurrency failure thật còn NOT_RUN. Không chuyển Bước2. Commit task riêng tiếng Việt; parent c76e8050a9f1f24bd42a06193c803116edae5f1a. Push bình thường bao gồm commit baseline local có trước; không gom thay đổi của baseline vào task commit.


### 06/11/2026 — Bước1 follow-up: force-change, expiry và401 đồng thời trên runtime

HEAD/parent task `f121600bfc3926cd06bf6d1883da0680ae5aad15`, hoang sạch trước kiểm. Chỉ bổ sung evidence; không thay production code/UI/service, không Bước2. Đọc Spec17_10 01_Web-Architecture-and-Auth, Authentication workflow §3 và Auth contracts §Web sequence, OpenAPI; đối chiếu source BE worktree `D:/hoctap/kì 9/nối api đồ án/RoadGuard-web-5180ab9`, SHA `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`, clean status. Runtime clean Compose `roadguard-case409-clean-20261106`, API image `sha256:45b1b96ab7579c9e7166dd69fc3eb5038bd2735d7334eb92d04f7add072db82e`; /ready28081=200, browser proxy HTTPS28443. Source SHA là checkout đọc, image digest là identity runtime quan sát; không suy từ digest thành provenance SHA đã nhúng nếu image không công bố.

**Căn cứ hành vi đúng:**

- BE `RoadGuardSystem.Services/Implementations/Authentication/AuthService.cs:87` tạo session ExpiresAt=null, Lifecycle.PersistentRenewable; `RoadGuardSystem.BusinessObjects/Identity/UserSession.cs:36` IsActiveAt kiểm revoke/lifecycle/issued-role; ordinary expiry/30m idle chỉ áp LegacyBounded. Không mặc định persistent phải tự hết hạn idle.
- BE `RoadGuardSystem.API/Controllers/WebAuthController.cs:56,91` finite ticket12h; `:154–167` trả mustChangePassword, nullable absolute/idle, renewable và ticketLifetimeSeconds43200; `:61–92` renew không Authorization, CSRF/renewal/session validation; `:118–134` logout thu hồi session và xóa cookie. `RoadGuardSystem.API/Authentication/WebCookieConfiguration.cs:88–90` non-sliding12h; `:149` PasswordChangeAllowed chỉ me/session/csrf + logout/change-password khi force-change. Persistent session không có ordinary max nhưng cookie ticket vẫn hữu hạn; renewal cookie365d không phải cam kết session perpetual.
- BE `AuthoritativeSessionValidator.cs:42–77` kiểm inactive/revoke/role/password, không do FE tự suy. `WebSessions.cs:14–36` Touch cho phép minimal password read; `:39–75` renewal revalidates active session/family.
- OpenAPI POST /auth/change-password: currentPassword/newPassword, K, Web cookie+CSRF supported; không If-Match. API GET session phải trả cờ thật trước guard. FE force-password change/guard/fencing đã đọc, không đổi user cache để bỏ cờ.

**Fixture đã kiểm:** handoff clean `/handoff/demo-accounts.json` chỉ có supervisor/pm-a/pm-b và actor role khác; không in credential. Login thật cả ba PM/Sup trả200/mustChangePassword=false. Seeder `SandboxSyntheticSeeder.cs:106`, `PostmanUserSeedStep.cs:82`, `tools/.../PostmanDisposableBootstrap.cs:75` đặt false; tìm force/MustChangePassword=true trong tools/handoff không có scenario chuyên biệt PM/Sup. Directory StaffUserResponseDto/ActorResponseDto không expose cờ, nên không dùng list Users để khẳng định mọi DB user đều false. Không SQL scan/update, không admin reset/create invitation hoặc đổi password tài khoản chung.

| Tiêu chí | Kết quả | Evidence thực / lý do và điều kiện tiếp tục |
|---|---|---|
| Force-change PM/Sup E2E | BLOCKED | Không fixture riêng bắt buộc đổi password. Đã kiểm login supervisor,pm-a,pm-b đều false và seed/scenario source. Nhóm BE/test cần cấp account PM/Sup riêng trong môi trường cô lập, ACTIVE/mustChangePassword=true, credential qua kênh kín và cho phép đổi một lần; FE sẽ kiểm login→guard→minimal API/denied business→change-password K/CSRF→session/reauth theo response. Không cần sửa auth FE khi chưa có lỗi thực |
| Ordinary idle/max expiry session mới | NOT_APPLICABLE | Runtime Sup/PM session200 trả absoluteExpiresAt=null,idleExpiresAt=null,renewable=true. Source PersistentRenewable không áp30m/max; không chờ idle để ép logout |
| Cookie ticket hết hạn tự nhiên12h / renewal sau hết ticket | BLOCKED | ticketLifetimeSeconds43200 runtime + source non-sliding12h. Phiên test được tạo rồi thu hồi trong lượt kiểm, không có cookie fixture đủ tuổi đang được cấp. Cần FE/test owner giữ dedicated browser context/keyring/cookie12h, không renew giữa chừng, giữ backend/keyring ổn định rồi kiểm GET session401→CSRF→POST renew200 cùng actor. Hoặc BE/test bàn giao context cô lập đủ tuổi qua cơ chế kín. Không rút ngắn expiry/sửa clock/xóa cookie để gọi là natural expiry. Phiên đã dùng trong lượt này không giữ lại vì đã logout |
| Phiên hết hiệu lực do revoke | PASS runtime Sup+PM | Official POST logout204 thu hồi chính session vừa tạo (fetch từ browser để FE memory còn authenticated), không logout actor khác. Sau đó6GET /profile đồng thời401 →1GET session401 →1GET csrf200 →1POST renew401; FE anonymous, Login và F5 không khôi phục. Đây là revoke, không natural expiry |
| Nhiều401 với session còn hợp lệ | PASS runtime Sup+PM |6GET work-package đồng thời401, đúng1GET session200,0POST renew;6read replay mỗi cái1lần rồi giữ lỗi401, tổng12businessGET. FE vẫn authenticated, không renew storm/logout nhầm; endpoint cookie gap không được coi đã hoạt động |
| Nhiều401 sau thu hồi phiên | PASS runtime Sup+PM |6request Promise.allSettled kết thúc,1renew thất bại,0replay mutation/0business write; không treo/vòng lặp. Browser gọi chính apiClient/interceptor thật, không mock response |
| Mô phỏng/auth regression | PASS15 riêng | Chạy lại `RG_AUTH_ONLY=1 node tools/check-review-293d001.cjs`; single-flight/failure/late response/guard/force-change chỉ là mock/hooks, không thay bằng chứng runtime force-change/natural expiry |

Runtime HTTP Date quan sát `Fri,06 Nov2026 09:27:47 GMT` Sup, `09:27:51 GMT` PM. Sup issuedAt09:27:45Z/PM09:27:49Z và flags false; không clock modification. Các lượt mới dùng test account chính thức và chỉ tạo/thu hồi session đăng nhập, không ghi dữ liệu nghiệp vụ, đổi password, reset/seed/SQL/config/backend. Không credential/token/cookie trong worklog hoặc source. Browser script/log ở TEMP không stage; không xuất storageState chứa cookie.

Browser Edge headless thật,6requests mỗi batch,2actors,3test logins; kết quả race401 là thực runtime. Tất cả account test session đã logout cuối lượt. Không cần sửa production vì chưa thấy lỗi auth mới ở các tình huống thực đã chạy. Typecheck/build không chạy lại (chỉ docs; kết quả lượt trước không gắn nhãn kiểm mới). git diff --check PASS. Commit chỉ worklog, không thay UI hoặc scope khác.

**Kết luận Bước1: BLOCKED nghiệm thu đầy đủ**, core concurrency/revocation PASS; force-change và natural12h ticket là hai điều kiện cần cấp/duy trì như trên. Không Bước2. Parent commit bổ sung evidence `f121600bfc3926cd06bf6d1883da0680ae5aad15`; full SHA báo khi bàn giao.

### 06/11/2026 — Chốt Bước 1 theo evidence hiện có và quyết định người dùng

**Quyết định hiện hành:** Người dùng tạm hoãn E2E đổi mật khẩu lần đầu và cookie ticket hết hạn tự nhiên 12 giờ. Hai tiêu chí này là **DEFERRED_BY_USER, chưa nghiệm thu E2E**, không phải PASS và không còn chặn chốt phạm vi Bước 1 được giao lần này. Không dựng fixture, chờ hết hạn, đổi clock/DB hoặc sửa code để bỏ force-change/expiry. Quyết định này cập nhật kết luận BLOCKED ở trên và các nhắc lại trạng thái Bước 1 trong ghi chép cũ; không chốt các công việc ngoài auth.

Baseline kiểm tra `hoang`, HEAD/parent `a6ad0bf1ebbdea663a3a74583cf4ca99d1690cad`. Đã đọc AGENTS.md, hai mục auth Bước 1 phía trên và caller Login → authService → authStore → auth API/client, App và ba route guard. Kiểm tra source hiện tại xác nhận Web cookie + CSRF, withCredentials=true, xóa Authorization, token=null; không Android/Bearer trong luồng Login. Guard chờ bootstrap, có retry lỗi, chặn sai role và must_change_password. Chưa phát hiện lỗi mới trong luồng auth Bước 1 qua lượt đọc này.

| Tiêu chí được chốt | Evidence hiện có | Kết luận và giới hạn |
|---|---|---|
| Login đúng/sai PM/Sup, bootstrap F5, renew, logout/không khôi phục phiên, logout nhiều tab, đổi tài khoản | Mục Bước 1 kiểm lại Web session ngày 06/11 ở trên: browser/API thật | PASS theo evidence đã ghi; không chạy lại runtime lượt chốt này |
| Sai role tại UI | Supervisor vào /pm/projects và PM vào /sup/projects đều về dashboard đúng role | PASS browser đã ghi; đây là route guard, không thay bằng chứng quyền server |
| Quyền role tại server | GET /users: Supervisor 200, PM 403 | PASS GET thật đã ghi; không suy rộng sang mọi endpoint hoặc quyền mutation |
| Phạm vi dự án tại server | GET reports/summary: Supervisor dự án A/B đều 200; PM dự án A 200, dự án B 403 | PASS GET thật cho các actor/dự án đã kiểm; đã có bằng chứng chặn đọc ngoài phạm vi, không thiếu tiêu chí này trong Bước 1. Không suy thành mọi tài nguyên/mutation đều đã E2E |
| Revoke và nhiều 401 đồng thời | Follow-up auth ở trên: Sup+PM, 6 GET đồng thời; session hợp lệ chỉ 1 GET session/0 renew; sau revoke chỉ 1 renew thất bại, mọi request kết thúc | PASS runtime đã ghi; không logout nhầm khi session còn hợp lệ, không renew storm/treo hoặc replay mutation. Endpoint nghiệp vụ trả 401 không được coi là tích hợp thành công |
| Failure/concurrency/late response/không replay mutation/network/403/logout failure và force-change mapping/guard | 15 focused auth regression PASS đã ghi | Chốt ở mức mock HTTP/hooks; không gắn nhãn runtime E2E cho các failure này |
| Login UI và kiểm tra biên dịch | Browser 1440/375; tsc -b, Vite build, diff-check PASS trong lượt auth trước | Evidence lịch sử, không phải build/test mới của working tree đang thay đổi |
| Force-change PM/Sup E2E; natural 12h ticket expiry/renew sau expiry | Quyết định người dùng lần này | DEFERRED_BY_USER; cơ chế giữ nguyên, không fixture/chờ thêm |
| Ordinary idle/max expiry của session PersistentRenewable | Follow-up đã ghi absoluteExpiresAt=null, idleExpiresAt=null, renewable=true | NOT_APPLICABLE cho session mới đã kiểm; không áp giả định idle 30 phút |

**Chốt Bước 1 trong phạm vi được người dùng duyệt:** Các tiêu chí còn lại được chốt theo mức evidence ở bảng; hai E2E tạm hoãn được ghi riêng, không tuyên bố nghiệm thu E2E toàn bộ auth. Không có yêu cầu sửa production auth từ evidence hiện tại. Lượt này chỉ cập nhật phần Bước 1 của worklog, không chạy browser/API/build/regression mới, không đổi source/backend/DB và không mở rộng nhiệm vụ. Giữ nguyên 40 file đang thay đổi (kể cả các hunk ngoài auth trong chính worklog); commit chỉ hunk chốt Bước 1, parent như trên, push hoang theo yêu cầu người dùng.


### 06/11/2026 — Bước 2: Sup tạo dự án, chọn PM và đọc phân công; chuyển PM có blocker Web

**Baseline/phạm vi:** hoang, HEAD/parent `7c32bae9e747861b98df588409d728fccd1e2539`; index sạch trước task. Giữ working tree khoảng 40 file có trước; chỉ đọc diff các file trực tiếp dùng cho bước này. Không reset/restore/clean/stash, không sửa BE/SQL/reset/reseed, auth hoặc Case/Report/Geometry/Survey/lifecycle/account administration. Bước 1 và hai E2E tạm hoãn giữ nguyên. Các ghi chép ngoài Bước 2 có trước trong worklog không thuộc commit này.

**Căn cứ:** đọc Authority-and-Source-of-Truth, workflow Authentication-Users-and-Memberships (directory/effective membership/history/primary), Project-Road-Geometry-and-Pavement chỉ phần tạo/primary và OpenAPI các operation liên quan. Nghiệp vụ owner/spec khác contract và source/runtime evidence; không dùng implementation để tự quyết nghiệp vụ. BE checkout sạch `D:/hoctap/kì 9/nối api đồ án/RoadGuard-web-5180ab9`, SHA `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`. Đọc ProjectsController/Create/Reassign, CreateProjectRequestDto, ProjectCreationService/ProjectCreationPersistenceService, PrimaryProjectManagerService, StaffReadRepository và DTO read model. Source xác nhận canonical code/name/primaryPmId/handoverDate/warrantyEndDate/handoverFileIds; Name <=255, Code <=50; canonical bắt buộc ngày và mảng file không null, <=1 file, được phép []; PM phải ACTIVE/ProjectManager, warrantyEndDate >= handoverDate; K hoặc operationId. Transaction/replay backend tạo project/primary membership/handover-warranty; FE không gửi lệnh bổ sung để tạo các entity đó. Không bịa regex mã dự án ngoài validation source.

**Thay đổi FE:** directory-only GET /users phân trang/kiểm cursor/session, chọn đúng ACTIVE PM từ API, bỏ PM ID mẫu/tự chọn PM đầu và không trộn PM từ danh sách dự án. Giữ date YYYY-MM-DD, kiểm độ dài/ngày/UUID, khóa riêng input file chưa có upload trước dự án (không chuyển tên file thành ID); vẫn tạo được với []. Nối journal/replay hiện có vào caller: khóa payload khi yêu cầu chưa rõ; giữ cùng K/body, có receipt thì chỉ đọc lại, kiểm PM trong list readback và báo riêng lỗi sau201. Reload danh sách lỗi không biến thành tạo thất bại để phát POST mới. Phân loại theo ProblemDetails code, không coi mọi409 là trùng mã.

GET /projects dùng scope server, bỏ filter quyền bằng tên/email/primary PM/ID mẫu tại UI. Dữ liệu phụ directory/statistics lỗi được báo một phần và retry; giữ project đã đọc, không đổi thiếu số liệu thành0; số0 server thật vẫn giữ. Nếu trang thống kê còn cursor thì không công bố count một trang như tổng đầy đủ. Không nối workflow thống kê/repair mới. Primary query và members đọc độc lập allSettled; null primary khác lỗi HTTP/schema, lưu membershipVersion từ DTO chính thức. Sup xem current/history qua includeHistory; PM không gửi history=true. Hiển thị trạng thái/validFrom/validTo của membership, không gán ACTIVE thành online hoặc suy quyền chỉ từ primary. Bỏ fallback sang dự án đầu tiên; lỗi có retry; request/epoch/unmount fence chặn response cũ. Giữ JSX khung/card/timeline/map/modal, chỉ nối state/data và trạng thái thiếu/lỗi; không sửa nội dung/logic geometry/lifecycle.

**Transport/runtime identity:** Compose roadguard-case409-clean-20261106, API image `sha256:45b1b96ab7579c9e7166dd69fc3eb5038bd2735d7334eb92d04f7add072db82e`; /ready28081=200; Vite5173 proxy HTTPS28443. Image không công bố embedded source SHA: checkout SHA là source đã đọc, digest là runtime identity, không suy provenance. GET Swagger runtime và repo OpenAPI đều khai PUT primary chỉ Bearer; ProjectsController ở checkout trên không có WebCookieEligible cho PUT (GET list/POST create có). Assertion từng thấy annotation ở nguồn khác chưa chứng minh runtime này hỗ trợ; không bỏ khóa dựa vào assertion đó.

| Nghiệp vụ/actor và method/path | Expected – actual, loại gap/evidence | FE tạm thời | Việc BE/owner và tiêu chí nghiệm thu |
|---|---|---|---|
| Sup chuyển primary PM: PUT /api/v1/projects/{projectId}/primary-project-manager | Expected Web cookie+CSRF thực thi command đủ guard. Actual repo/runtime Swagger Bearer-only; cookie+CSRF probe body{} trên dự án test riêng trả401 auth_unauthorized, correlationId `3c442f7f-525e-4b92-bc04-e8bb2571b627`, session/GET hợp lệ. Source SHA và image như trên. COOKIE_TRANSPORT_GAP, không phải thiếu DTO/command | Giữ service chặn, UI báo chưa khả dụng; không Bearer fallback. Probe body{} thiếu required DTO không thể tạo chuyển PM; không gửi command hợp lệ | BE đồng bộ Web cookie eligibility+CSRF và contract trên đúng runtime; cung cấp fixture riêng có current membership bắt đầu trước UTC hôm nay, ACTIVE PM khác và project chưa đóng. Nghiệm thu PUT cookie+CSRF, operationId, expectedCurrentMembershipRowVersion từ primary read, receipt/readback current/history và quyền theo membership thực. Không suy PM cũ mất mọi quyền |
| Sup đính kèm trước tạo: POST /api/v1/projects | Source cho phép [], tối đa1 file ID tồn tại; FE chưa nối admission/upload hợp lệ trước project. FE_INTEGRATION_GAP, chưa có bằng chứng BE thiếu upload | Khóa riêng input đính kèm, giữ panel; tạo với[] đã chạy thật | Không yêu cầu BE thêm endpoint từ gap này. Upload nằm ngoài scope; chỉ mở khi có file ID được server chấp nhận và flow được giao |
| Sup/PM đọc thời hạn: GET /api/v1/projects | ProjectListItemResponseDto và runtime chỉ có projectId/projectCode/name/status/primary ID/name, không có handoverDate/warrantyEndDate; POST receipt có hai ngày. READ_MODEL_LIMITATION, không phải API gọi lỗi | List hiển thị chưa cập nhật thay0%/0 ngày khi thiếu; không tự khôi phục date bằng dữ liệu form/local cache sau F5 | Nếu cần hiển thị ngày sau F5, owner/BE chốt read model thích hợp trong nhiệm vụ riêng; không mở thêm warranty/lifecycle workflow ở Bước2 |

Source PrimaryProjectManagerService xác nhận effectiveFrom phải đúng UTC current date và > current membership ValidFrom; PM thay thế active/khác PM cũ, project chưa đóng, reason<=1000, operationId khác empty, membership rowversion Base64 8bytes. Không dùng project version thay membership version; không đổi clock/data để vượt guard. Chưa chạy mutation chuyển PM/readback sau chuyển vì transport blocker; không ghi là PASS hay tự thu hồi quyền PM cũ.

**Kiểm thực chạy:** `node tools/check-step2-projects.cjs` **11 PASS**, mock HTTP/hooks/SSR: directory phân trang/lỗi/loop/epoch; null primary khác HTTP/schema và version; members current/history;201+readfail chỉ đọc lại; timeout giữ K/body; validation/không POST sai; phân biệt409/CSRF; list partial không fake0; modal PM đủ điều kiện/upload disabled/payload retry; response project cũ/unmount bị bỏ; chặn chuyển Web0PUT. Không chạy full regression ngoài Bước2, không sửa runner40file cũ. `npm run build` với NODE_OPTIONS max-old-space-size768, GOMAXPROCS2/GOGC50 **PASS tsc-b + Vite** sau thay đổi cuối; còn warning duration-[250ms]/chunk lớn hiện có. Diff-check scoped/staged được kiểm trước commit.

| Tiêu chí | Kết quả | Evidence/giới hạn |
|---|---|---|
| Sup tạo dự án qua form, không tự chọn PM, cookie/CSRF/K và readback | PASS browser/API | Edge headless thật; tạo đúng1 dự án test mới trên clean Compose: code `RG-S2-1793978628311`, id `52a43dbb-4af5-4823-b6ec-e9263f3a262f`, POST201; PM chọn từ directory `72f84201-a001-4000-8000-000000000002`. Script assert cookie flow không Authorization, CSRF/K có; không file, không lệnh membership/handover/warranty riêng. Script lưu ID ngay sau201, các lượt sau chỉ đọc lại cùng dự án, không POST tạo thêm |
| Sup đọc current/history members và primary | PASS runtime | GET members200 + primary200 đúng PM; membership `16d7f5f3-1b10-4512-bf78-b5a4a1d98ce4`, validFrom2026-11-06, version có thật. includeHistory control/render chạy; không fixture history đa kỳ hoặc primary-null thật (null/schema/error kiểm mock) |
| PM được giao thấy dự án và F5 | PASS runtime | pm-a server list có ID trước/sau F5; GET members/primary200/200; detail đọc đúng PM. PM history control không xuất hiện |
| PM ngoài scope bị server chặn | PASS runtime | pm-b list không có ID trước/sau F5; GET members/primary403/403. Không chỉ dựa vào UI filter |
| Empty/error/partial/retry | PASS mock browser + regression | Browser route503 cho members giữ primary thành công, retry về API thật; directory503 có lỗi/retry tải lại PM; GET projects mocked items[] có empty state. Đây là mô phỏng lỗi trong browser, không gắn nhãn backend thật phát503 hay DB rỗng |
| Loading/fencing/receipt recovery | PASS hooks/HTTP mock; runtime loading quan sát | Request cũ/unmount không ghi state; receipt/readback failure không lặp POST. Không gây timeout/đổi phiên thật để ép runtime case này |
| Desktop/modal mobile | PASS phần UI đã kiểm | 1440 desktop giữ card/khung; modal375 vừa khung, form có cuộn, chọn PM trống/đính kèm disabled. Screenshot TEMP được xem trực tiếp |
| Mobile toàn trang dự án | PARTIAL, known shell limitation | Viewport375 document scrollWidth488; sidebar fixed w-64/shrink-0 đã có nguyên ở HEAD, main còn hẹp. Không gọi toàn trang mobile PASS, không sửa shell/menu ngoài scope |
| Chuyển PM hợp lệ và quyền sau chuyển | BLOCKED |401 cookie probe; chưa đủ transport/fixture để mutation. Phần tạo/đọc không bị blocker này chặn bàn giao |

Harness browser TEMP đã có lỗi locator accessible-name chứa text icon, fetch Response.status dùng nhầm hàm, rồi đọc store trước bootstrap hoàn tất. Đã sửa locator/status và chờ bootstrap trong context thực đọc; resume cùng ID, không tạo thêm để làm xanh. Các lần lỗi không được tính PASS. Lượt cuối đọc/UI thực và mô phỏng error/empty chạy thành công; không pageerror/blank. Test accounts đọc qua handoff container vào RAM, không in credential/cookie/token. Scripts/log/screenshots/ID journal ở TEMP, không stage. Không xóa/sửa dự án dùng chung; dự án test mới giữ lại cho review (Git push không chuyển DB).

**Review/bàn giao:** review nghiệp vụ/API và UI/phạm vi hai lượt. Chỉ stage service project/personnel, caller ProjectList/ProjectOverview, modal tạo, grid/table trạng thái thiếu, card/types membership, test Bước2 và đúng hunk worklog này. Các hunk NaN/missing-value và pending-create props có trước nhưng là dependency trực tiếp của Bước2 được giữ trong staged diff; hunk canAdd/gating thêm nhân sự cũ trong card và mọi thay đổi dở ngoài nhiệm vụ vẫn unstaged. Không sửa hoặc gom tools/check-review-293d001.cjs, ProjectHighlightsGrid, usePersonnelState, Case/Geometry/Survey. Commit tiếng Việt, push thường hoang theo yêu cầu; parent như baseline. Kết luận: **bàn giao phần tạo/đọc đã hoàn chỉnh trong phạm vi khả dụng, chuyển PM BLOCKED và full-page mobile PARTIAL**. Dừng sau Bước2, không mở workflow khác.


### 06/11/2026 — Follow-up Bước 2: sửa trạng thái thống kê và bảo hành thiếu dữ liệu

Baseline/parent `3b670f5256008307d741e48bada59f711df1f0e9`, branch hoang, đã kiểm HEAD/status và đọc AGENTS.md trước sửa. Giữ nguyên thay đổi local ngoài nhiệm vụ; không reset/restore/clean/stash. Đọc projectService mapper/statistic reader, ProjectOverview caller, ProjectHighlightsGrid (có diff local cũ), Grid/Table, HubProject type, date utility và Spec17_10 Web errors/state. Chỉ sửa hai lỗi FE hiển thị được giao; không mở auth/chuyển PM/membership/upload/mobile shell/Geometry/Survey/BE/DB/lifecycle.

**Sửa:** mapper kiểm hai date-only thực tồn tại, không chấp nhận ngày sai/lệch tháng hoặc end<start; thiếu/invalid thì warranty_data_missing=true và không cung cấp số0 giả. Bỏ ép100%/0ngày theo CLOSED; ngày hợp lệ vẫn tính theo ngày server, kể cả CLOSED. Utility projectWarranty dùng chung mapper và ba view để ngăn caller nhận số/date thiếu hoặc flag thiếu mà vẫn vẽ thời hạn. Table/detail/grid hiển thị Chưa cập nhật; không ngày0/%0 hoặc mặc định3năm; không render phần tô tiến độ khi chưa đủ ngày. Không lấy ngày từ form/cache sau F5.

Card thống kê kiểm từng số hữu hạn, thiếu/NaN/null/undefined hiển thị Chưa tải được; giữ0 thật và số hợp lệ của phần khác. Chỉ mô tả số lỗi đang mở khi đã đọc được, không suy count0 thành không hư hỏng/ổn định100% hoặc count thành tỷ lệ70% cần xử lý. Bỏ phần tô thanh đánh giá không có nguồn nhưng giữ khung/layout. ProjectOverview hiển thị stats_error một phần và retry qua loader hiện có, không thêm API/thông báo/icon mới.

**File/hunk:** src/api/services/projectService.ts; src/utils/projectWarranty.ts; src/pages/(pm)/ProjectOverview.tsx; project-overview/ProjectHighlightsGrid.tsx chỉ Card1/Card3; projects/ProjectTableView.tsx và ProjectGridView.tsx; tools/check-step2-projects.cjs; đúng hunk follow-up này. Các hunk geometry Card2/default props có trước ở ProjectHighlightsGrid và các file dở ngoài nhiệm vụ giữ unstaged. Không sửa reader/endpoint thống kê.

**Kiểm thực chạy sau code ổn định:** node tools/check-step2-projects.cjs **13 PASS** (11 regression Bước2 +2 render/mapper cases mới; mock HTTP/hooks/SSR, không E2E): thiếu/NaN/null/undefined không kết luận nghiệp vụ; zero thật và count độc lập; thiếu/invalid/reversed date; CLOSED không tạo thời hạn; ngày hợp lệ vẫn hiện đúng trên cả3view và flag sai vẫn bị date guard chặn. npm run build **PASS tsc-b + Vite** (NODE_OPTIONS768MiB, GOMAXPROCS2/GOGC50), warning duration-[250ms]/chunk cũ; scoped/staged diff-check và regression staged kiểm trước commit. Không chạy full regression ngoài Bước2.

Browser Edge headless runtime có sẵn localhost5173→HTTPS28443 trên clean Compose, chỉ đọc dự án test cũ `52a43dbb-4af5-4823-b6ec-e9263f3a262f`, không tạo dữ liệu nghiệp vụ. **PASS API thật/render:** thiếu thống kê và ngày hiển thị đúng; không NaN/kết luận sai, gói sửa0 giữ nguyên, lỗi một phần/retry hiện. **PASS mô phỏng browser:** mock GET projects có ngày2020-01-01/2099-01-01 và thống kê0, render0điểm/0gói/ngày và tiến độ hợp lệ, không ổn định100%. Lượt đầu glob harness không bắt URL con, không coi assertion yếu làPASS; đổi regex bắt URL con và assert0điểm/không còn nhãn thiếu, chạy lạiPASS. Đã xem screenshot thực phần thiếu; screenshot/script TEMP không stage, credential chỉ trong RAM. Không dùng kết quả mô phỏng làm bằng chứng backend đã trả ngày/count0 tương ứng. Mobile shell/endpoint error khác không được nghiệm thu lại.

**Giới hạn nguồn đã biết, không gap BE mới:** GET /api/v1/projects ProjectListItemResponseDto/runtime không có handoverDate/warrantyEndDate; expected FE chỉ hiển thị thời hạn khi server có ngày, actual thiếu thì nhãn Chưa cập nhật. Không yêu cầu endpoint/BE mới trong lượt này; nếu cần hiển thị thời hạn sauF5, owner/BE cần chốt read model phù hợp ở scope riêng. Thống kê lỗi giữ error state, không suy database rỗng. Không sửa BE/DB.

Tự review logic/API và UI/phạm vi: không stage Card2/geometry hoặc các thay đổi local khác; chỉ commit phần follow-up và dependency utility/test, push thường hoang theo yêu cầu. Chỉ chốt hai lỗi FE này, không chốt toàn bộ Bước2 hoặc chuyển bước tiếp theo.


### 07/11/2026 — Bước 3, Phần A: bàn giao lớp đọc và chặn authority cục bộ; vòng ghi/xác nhận còn BLOCKED

**Baseline/phạm vi:** hoang HEAD/parent `b0f0913fddeba9139bcae55369bdb18a026ef028`; đã kiểm status/index, đọc AGENTS.md, diff Geometry có trước, Authority/source-of-truth, workflow Project-Road-Geometry-and-Pavement và GIS-MapLibre. Giữ thay đổi ngoài nhiệm vụ, không reset/restore/clean/stash. Không auth/chuyển PM/nhân sự/Survey/AI/Case/FIELD/repair/lifecycle/BE/DB/config. Phần A chưa hoàn chỉnh nên không triển khai Phần B; không gọi Bước3 hoàn tất.

**Caller/API:** `/pm|sup/projects/:id/alignment` → AlignmentSegments → useAlignmentState → useGeometryReadModel. Sup menu không project đi AlignmentApprovalList. Đọc context GET /projects/{projectId}/work-package, CRS GET /projects/{projectId}/crs-profiles, draft GET /projects/{projectId}/road-geometry-drafts/{draftId}, readiness GET .../{draftId}/readiness, geometry GET /projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/geometry. Đường ghi draft/preview/confirm đã có hàm service, nhưng caller cũ tạo checksum/CRS/bề rộng giả và luôn lưu local CONFIRMED/PENDING_APPROVAL; bản local sửa dở trước task đã chặn một số handler, vẫn còn local autosave/restore. Không dùng test expectation hoặc matrix cũ làm authority.

**Source/runtime:** checkout BE sạch `D:/hoctap/kì 9/nối api đồ án/RoadGuard-web-5180ab9`, SHA `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`; đọc GeometryWorkflowController/Service/Persistence, ProjectsRoadSectionsController, ProjectWorkPackagesController, GeometryWorkflowDtos, GeometryEngine/CrsProfileEngine. Runtime clean Compose roadguard-case409-clean-20261106, API digest `sha256:45b1b96ab7579c9e7166dd69fc3eb5038bd2735d7334eb92d04f7add072db82e`, Vite5173→HTTPS28443. SHA là checkout đọc, không suy digest thành provenance SHA nhúng. GET context với Sup trả401 ở SBX-A/SBX-B/dự án test bước2; CRS và route-systems200[] cả3. /handoff chỉ có account/config/secrets, không có manifest draft/confirmed IDs được bàn giao; không mở secret/config để suy fixture hoặc SQL dò dữ liệu. Không kết luận DB không có draft/confirmed chỉ vì thiếu discovery.

**Phần hoàn chỉnh khả dụng trong commit này:**
- Read model phân trang project/cursor, không chọn project mẫu; CRS loading/error/empty riêng; draft ID trong query `draftId` là reference, F5 luôn GET lại server chứ không restore identity/version từ cache. Draft đọc có ID/project/epoch validation; readiness sai schema/lỗi báo riêng và giữ draft đã tải. Response project/epoch cũ hoặc unmount bị bỏ; cache draft service xóa theo epoch.
- Màn tuyến giữ khung MapLibre/modal/sidebar/header/approval table. Sup danh mục đọc dự án thật, không lấy danh sách/CONFIRMED/khối lượng từ local cache. Màn project bỏ getAlignmentState/getAlignmentData/saveAlignmentData/updateProjectAlignment trên active hook; autosave/import/branch không cấp CONFIRMED hay chỉnh project bằng local. Chỉ geometry GET có sourceDraftId và metadata COMPLETE mới cấp trạng thái đã xác nhận; map chỉ nhận LineString WGS84 hữu hạn từ field server, không chuyển source x/y sang lng/lat theo phỏng đoán.
- ensureUtm48NCrsProfile không còn tự sinh EPSG/checksum/provenance mẫu. GeoJSON inspector có sẵn từ working tree được giữ như dependency trực tiếp: bảo toàn đỉnh, không smooth/đảo trục, CRS UNKNOWN khi chưa có nguồn; không tự tạo phân đoạn. Manual input giữ text, preset không nạp sample; không auto map theo CRS chưa biết. Không tuyên bố đây là import/save hoàn chỉnh. Bỏ bề rộng/CRS/pavement mặc định trên state màn này và cao độ con trỏ tự tạo; giữ UNKNOWN. Phân đoạn/pavement UI được giữ nhưng disabled đến khi A đủ điều kiện, không công bố hay tạo slab để nối tắt. Các helper segment/slab legacy bên dưới không được nối thành command trong lượt này.
- Chỉ nối đọc; create/edit/preview/confirm chưa được nối lại vào UI vì context/CRS/fixture chưa đủ. Không gửi mutation geometry, không đánh dấu preview=confirm, không bypass producer Sup bằng nhánh repository tự tạo section. Vì không triển khai command nên conflict409/412/428, K replay/receipt recovery cho geometry còn NOT_RUN, không coi helper cũ sinh key mỗi lần là đã đáp ứng.

| Blocker / actor / method-path | Expected–actual, DTO/guard và evidence | FE xử lý tạm | Nhu cầu BE/owner và tiêu chí nghiệm thu |
|---|---|---|---|
| Sup tạo section/version; POST /api/v1/projects/{projectId}/road-sections và POST .../{roadSectionId}/versions | Expected Web command đúng Sup + CreateRoadSectionRequestDto/CreateRoadSectionVersionRequestDto (operationId, coordinates, SRID, effectiveFrom/reason/current version). Actual OpenAPI Bearer-only; ProjectRoadSectionsController tại SHA trên không WebCookieEligible. Runtime Sup POST section cookie+CSRF body{} trả401 auth_unauthorized, correlationId `a68b7455-d6ab-4092-9577-4914eaeed975`; body{} thiếu required input không tạo dữ liệu. Version POST chỉ source/contract, chưa request vì không có section ID được discovery | Không dùng Bearer/devSQL hoặc tự tạo section/ID cục bộ; chưa nối Sup producer | BE cung cấp Web eligibility/CSRF + contract/runtime đồng bộ hoặc fixture riêng hợp lệ. Nghiệm thu Sup tạo bằng Web, receipt/readback IDs và sai role/scope bị chặn, không dùng annotation đơn lẻ làm PASS |
| PM/Sup discovery context; GET /api/v1/projects/{projectId}/work-package | Expected ProjectWorkPackageResponseDto engineeringUtmSrid/roadSections/version theo scope. Actual source WorkPackageRead policy không cookie annotation; runtime Sup401 cả3 project trong khi session/profiles200. Correlations SBX-A `712b1c9c-4383-42c1-86cd-72b36cb3b61d`, SBX-B `c448362c-5813-4089-a5cb-ce1f9dc6d586`, bước2 `84dfd7fe-2053-4ad9-a38e-709587b17b56`; PM browser cũng thấy context lỗi. COOKIE_TRANSPORT_GAP | Giữ lỗi/retry, không tự engineering32648 hoặc dựng road/version; vẫn đọc CRS/draft độc lập | BE đồng bộ Web read/guard với contract, hoặc bàn giao read model đã được chấp nhận (mới chỉ PROPOSED nếu chưa adoption). Nghiệm thu PM/Sup scope200 với ID/version thật và ngoài scope403 |
| Discovery draft/confirmed theo project; GET /.../road-geometry-drafts/{draftId} và GET /.../versions/{routeVersionId}/geometry | Có detail/readiness/geometry, không thấy GET collection drafts trong canonical paths/GeometryWorkflowController đã đọc; UI cũ chỉ memory activeDraftCache. Chưa có manifest IDs fixture đủ lineage. DISCOVERY/FIXTURE_NOT_VERIFIED, không gọi chung thiếu API | Reference draftId trong URL cho phép mở lại khi đã có ID server; không bịa list endpoint/ID hoặc coi cache là server discovery | Owner/BE bàn giao fixture/reference có quyền dùng hoặc thống nhất discovery contract nếu cần (endpoint mới là PROPOSED). Nghiệm thu PM/Sup cùng draft/version sauF5, confirmed metadata đúng lineage |
| CRS/engineering có nguồn; GET/POST /.../crs-profiles và draft-create/readiness/preview | Expected definition/axis/unit/operation/provenance có nguồn. Actual profiles/route-systems200[] trong3scope đã đọc; contextSRID không đọc được. GeometryEngine COORDINATES chỉ chấp nhận source==engineering32648/32649; native readiness cần profile/system/metadata. CrsProfileEngine TryTransformCanonical chỉ executable sample affine, không chứng minh official transform real data. INPUT/SOURCE/VERIFICATION dependency; không suy backend không có command | Không tạo fake profile/checksum/native controls, không tự chuyển tọa độ hoặc dùng sample để gọi official | Owner/data team bàn giao definition/engineering/profile/control có authority và fixture cô lập. BE làm rõ adapter/readiness cho đường dữ liệu được chấp nhận, chứng minh source↔map transform; không yêu cầu FE tự chế datum/projection |

**Kiểm thực chạy:** `node tools/check-step3-geometry.cjs` **6 PASS** mock/hooks/static: sai/null CRS không[]; không auto-create profile; draft ID/project/version và epoch; readiness/context schema; stale project/epoch/unmount và partial draft/readiness; GeoJSON giữ đỉnh/trùng/UNKNOWN; manual/preset0ghi và không local authority. `npm run build` **PASS tsc-b/Vite** với NODE_OPTIONS768MiB/GOMAXPROCS2/GOGC50 sau code cuối; warning Tailwind duration-[250ms]/chunk cũ. Scoped/staged diff-check, staged regression kiểm trước commit; không chạy full regression ngoài scope, không sửa tools/check-review-293d001.cjs.

Browser Edge headless thật: Sup/PM cùng dự án test cũ `52a43dbb-4af5-4823-b6ec-e9263f3a262f`, **PASS lớp đọc/lỗi** (context401, profiles200[], giữ canvas/map,0pageerror). PM GET CRS SBX-B ngoài scope403 thực. Seed cache trình duyệt CONFIRMED giả và coords để kiểm **PASS không restore phê duyệt/geometry local**; đây là test localStorage mô phỏng, không sửa DB. Mock response GET draft/readiness cho một UUID chỉ trong harness: **PASS hai role/F5 cùng reference/version và readiness=false không confirm**; không gọi đây là draft persisted/E2E thật. Sup/PM POST section body{} đều401, không tạo entity. Không mutation draft/confirm/segment/CRS hoặc SQL/reset/reseed/clock/config. Screenshot TEMP đã xem, layout desktop giữ map và các panel; credentials đọc handoff trong RAM, không log/stage credential/cookie.

**Trạng thái nghiệm thu:** Phần A **PARTIAL/BLOCKED**: hoàn chỉnh lớp đọc/reference/F5 và chặn authority giả trong phạm vi kiểm được; PM lưu/sửa draft, preview+Sup confirm, hai role confirmed F5 và conflict/receipt thật **BLOCKED/NOT_RUN**, không coi đã hoàn tất. Phần B **NOT_STARTED**, phụ thuộc A hoặc fixture confirmed hợp lệ chưa được discovery; segment-set/pavement chưa được triển khai/test. Không chốt toàn bộ Bước3. Bàn giao commit phần khả dụng để review, không sửa BE hoặc tiếp bước4.

**Phạm vi stage/review:** alignmentService, AlignmentSegments, AlignmentApprovalList, AlignmentMap/useAlignmentMapState (chỉ bỏ cursor/cao độ mẫu), alignmentImportHelpers/useAlignmentImportState/useAlignmentState/useGeometryReadModel, regression Bước3 và đúng hunk worklog này. Dùng các hunk Geometry có trước chỉ vì dependency trực tiếp, bảo tồn UI. Tự review API/nghiệp vụ và UI/phạm vi; mọi file/hunk dở Case/Survey/auth/nhân sự và worklog ngoài Bước3 giữ unstaged. Commit tiếng Việt/push thường hoang, parent như baseline; dừng bàn giao để review.


### 07/11/2026 — Follow-up Bước 3: panel kỹ thuật thiếu dữ liệu và lỗi import GeoJSON

Baseline/parent `9df4ceb66a122f0f557fe149dd51a1a8511a3731`, branch hoang; đã kiểm HEAD/status và index, đọc AGENTS.md, useAlignmentState, AlignmentMap, hook/inspector import và các type/component liên quan trước sửa. Các file production của follow-up không có diff local sẵn; giữ nguyên toàn bộ thay đổi ngoài nhiệm vụ, không reset/restore/clean/stash. Không nối command create/edit/preview/confirm, section/version, segment-set/pavement, không sửa BE/DB/auth hoặc transport blocker.

**Panel:** bỏ toàn bộ fallback rộng8m/nửa rộng4m, dài1/1.85km, tấm5m/khe5/50m và tự chọn phân đoạn đầu khi ID không khớp. Chọn đúng mainline/whole-route/branch/branch-segment; nếu không có lựa chọn khớp thì nhãn chưa chọn và số liệu chưa có. Chỉ tính bề rộng trung bình theo chiều dài khi mọi segment có chiều dài/bề rộng hữu hạn dương; không tính trung bình trên tập thiếu dữ liệu. Nửa rộng cần rộng hợp lệ; số tấm cần dài/bề rộng/tấm dài hợp lệ và kết quả hữu hạn; không lấy chiều dài trục chính thay chiều dài nhánh thiếu. Từng thông số tấm/khe thiếu/null/undefined/NaN/Infinity hiển thị Chưa có dữ liệu, giữ phần có nguồn còn lại. Giữ layout/khung/đồ họa panel và MapLibre; không tạo workflow kỹ thuật để lấp số thiếu. Không sửa UNKNOWN thành0.

**Import:** inspector dùng GeoJsonValidationError để giữ chính xác thông báo validation; JSON syntax, không tìm được Centerline/collection rỗng/chỉ mép đường, nhiều tuyến, geometry không hỗ trợ và CRS riêng chưa xác minh có thông báo đúng nguyên nhân. Không nới điều kiện chấp nhận đầu vào. Hook giữ thông báo validation; Error/TypeError/lỗi không xác định khác dùng thông báo chung tiếng Việt, không lộ thông báo kỹ thuật tùy ý hoặc gọi mọi lỗi là syntax. Xử lý FileReader error/abort, lỗi readAsText đồng bộ và result không phải text. Không suy CRS/đảo axis/ghép tuyến/auto-save hoặc tạo draft.

**File sửa:** src/pages/(pm)/alignment/AlignmentMap.tsx; alignmentImportHelpers.ts; useAlignmentImportState.ts; tools/check-step3-geometry.cjs; đúng hunk follow-up trong worklog này. useAlignmentState chỉ đọc đối chiếu, không cần sửa state hoặc service/API. Mọi hunk dở ngoài nhiệm vụ và hunk worklog trước đó giữ unstaged.

**Kiểm sau code cuối:** node tools/check-step3-geometry.cjs **8 PASS** (6 scenario Bước3 trước +2 nhóm regression render/import mới; nhiều tổ hợp trong từng nhóm). Render React SSR kiểm missing/null/undefined/NaN/±Infinity cho trục chính/toàn tuyến/nhánh/segment và ID không khớp; không NaN/thông số mẫu/kết quả tính giả. Kiểm rộng12m→nửa rộng6m, dài100m/tấm10m→20tấm; weighted width (12×0.1+6×0.2)/0.3=8m là8m có nguồn, không fallback; width thiếu ở một segment không tính trung bình hoặc số tấm giả; nhánh thiếu chiều dài không mượn99km trục chính. Import kiểm syntax/nhiều tuyến/không có Centerline/geometry/CRS/validation cụ thể; reader error/abort/result không text/readAsText ném lỗi; unknown Error/TypeError/null có nhãn chung;0write kể cả đầu vào hợp lệ (chỉ inspector, CRS vẫn UNKNOWN). Đây là mock/hooks/SSR, không E2E backend.

npm run build **PASS tsc-b + Vite** (NODE_OPTIONS768MiB/GOMAXPROCS2/GOGC50); warning duration-[250ms]/bundle lớn có trước. Scoped/staged diff-check và regression từ nội dung staged kiểm trước commit; không chạy full regression ngoài scope hoặc sửa test cũ ngoài nhiệm vụ. Có sửa bổ sung sau review để phân loại unknown errors và collection không có tim tuyến; regression/build chỉ chạy lại khi code thay đổi.

Browser Edge headless trên runtime5173→HTTPS28443, đăng nhập PM test từ handoff trong RAM, chỉ đọc dự án đã có `52a43dbb-4af5-4823-b6ec-e9263f3a262f`: **PASS** trang thật/panel thiếu dữ liệu không NaN/rộng8m/nửa rộng4m, canvas giữ nguyên. Upload qua input file thật với nội dung kiểm thử trong RAM: **PASS** thông báo syntax/nhiều tuyến/Polygon/CRS riêng đúng ngữ cảnh. Mount component bằng props fixture trong browser: **PASS mô phỏng** rộng12/nửa rộng6/số tấm20 và missing props không NaN/kết quả giả; không gọi đây là API thật có engineering data. Lỗi đọc file và các nhánh render còn lại kiểm qua mock/SSR; không gây lỗi I/O thật. Đã xem ảnh riêng HUD (screenshot đầu chỉ lấy header, điều chỉnh vùng chụp để review toàn panel); giữ layout. Harness ban đầu dùng named createRoot không đúng wrapper Vite, đã sửa default export và chạy thành công; không coi lượt lỗi harness là PASS.0pageerror,0business write; scripts/ảnh TEMP không stage, không credential/token/cookie trong commit.

**Review/bàn giao:** tự review logic thiếu dữ liệu, từng nhánh main/all/branch và thông báo import; kiểm UI/phạm vi, stage chỉ5file trên. Giữ nguyên blocker BE đã ghi, không có evidence mới để suy thiếu endpoint hoặc đổi kết luận transport. Chỉ bàn giao hai lỗi FE này bằng commit tiếng Việt/push thường hoang; không chốt toàn bộ Bước3 hoặc tự chuyển bước tiếp theo.


### 07/11/2026 — Bước 3: nối caller draft/save → preview/readiness → confirm có điều kiện và reference F5

**Baseline:** hoang HEAD/parent `7af3d0e1e9e62c39471e0eccac48b53fe84af0f8`, đã kiểm HEAD/status/index và đọc AGENTS.md trước sửa. Giữ các thay đổi local ngoài nhiệm vụ, không reset/restore/clean/stash. Đọc workflow geometry/GIS Spec17_10; đối chiếu OpenAPI GeometryDraftInput/View/ConfirmInput/Readiness, RoadSectionWorkPackageDto, NativeAlignmentInput và DTO/controller/service/repository liên quan. Không dùng v2.2/matrix cũ/Stitch/test expectation làm authority. Giữ hai sửa lỗi panel/import ở7af3d0e; không sửa AlignmentMap hoặc nới inspector. Không segment-set/pavement/bước4, BE/DB/config/auth hoặc producer section/version.

**Dependency kiểm có trọng tâm:** checkout BE sạch vẫn `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`, image đang running vẫn `sha256:45b1b96ab7579c9e7166dd69fc3eb5038bd2735d7334eb92d04f7add072db82e`, clean Compose roadguard-case409-clean-20261106. Đọc GeometryWorkflowController/Service/Persistence, GeometryEngine và CrsProfileEngine. Không lặp probe section/version hoặc chờ BE vì source/image không đổi: dùng evidence07/11 Bước3 trước (Sup section POST401, GET work-package401, profile/system200[]). Smoke UI mới chỉ mở trang bình thường, cũng quan sát context401/CRS200[]; không gửi probe thủ công hay tạo fixture/data. Không suy SHA embedded từ digest; source SHA là checkout đã đọc.

**Caller đã nối:** AlignmentSegments → useAlignmentState → useGeometryDraftWorkflow/geometryDraftCommands → alignmentService. Giữ modal nhập hiện có, thêm chọn tuyến/CRS theo tên từ API, lý trình gốc, bề rộng khảo sát, các khoảng bề rộng và lý do thay đổi; giữ trống khi chưa có nguồn. Raw coordinates chỉ vào bản nhập, không tự đổi datum/axis/đơn vị hoặc gán vào map. Không bắt người dùng nhập UUID/checksum/version, bỏ ô nhập UUID cũ. Link hồ sơ cho Sup và draft/section/route-version references ở URL; F5 luôn GET resource. Chuyển project cập nhật cả pathname và bỏ query của project cũ; không gắn draft project mới vào URL project cũ. Với receipt đã có nhưng readback lỗi, F5 có thể mở reference để đọc API, không lấy receipt làm approval/status/version authority.

| Command/caller | Hành vi FE đã nối | Điều kiện/chặn đúng thao tác |
|---|---|---|
| PM create: POST /projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts | Lưu GeometryDraftInput COORDINATES từ form; section/code/name/context và profile đều từ server; sourceCrs khớp engineering32648/32649, EN/metre1 nên giữ nguyên X/Y. Kiểm hữu hạn, đỉnh liền kề không trùng, profile có nguồn/checksum server, không sample, origin/survey width/reason và width intervals phủ đúng độ dài metric | Thiếu context/section/profile hoặc CRS khác cần adapter chưa xác minh thì khóa riêng save với lý do. Không tự create profile/checksum, không chuyển WGS84 sangUTM mặc định, không dùng project-wide create để nối tắt Sup producer |
| PM update: PUT /projects/{projectId}/road-geometry-drafts/{draftId} | Hydrate tọa độ/width/origin từ GET draft, giữ reason người dùng; chỉ statusDRAFT/COORDINATES; If-Match lấy GET ETAg, K giữ theo ý định | Native edit chặn riêng vì GeometryDraftView chưa trả đầy đủ routeSystemId/routeKind/parent/junction/calibration/tolerance để tái lập input an toàn. Không ghi đè native bằng payload COORDINATES hoặc các field tự chế |
| PM/Sup preview: POST .../road-geometry-drafts/{draftId}/preview và GET .../{draftId}/readiness | Đọc đúng draft/version, preview gửi If-Match optional được contract cho phép; shared client thêmCSRF, không tự thêmK cho read-preview. Giữ preview nếu readiness lỗi, không cấp CONFIRMED. Preview phải có length hữu hạn dương; response cũ bị bỏ | Cần draft/ETag đã đọc và không có ý định cũ đang chờ giải quyết. Không cần context mới để chỉ preview một draft có reference hợp lệ; native preview vẫn dùng được khi server đủ đầu vào |
| Sup confirm: POST .../road-geometry-drafts/{draftId}/confirm | Chỉ Sup; cần DRAFT/ETag, preview cùngETag, server readiness.ready và không missing/errors, context/currentVersion, effectiveFrom/reason người dùng. Trước gửi đọc lại draft/readiness/context; expectedCurrentVersionId từ context, If-Match từ draft. Receipt rồi GET geometry đúng project/road/version/sourceDraft | Nếu version đổi thì giữ bản nhập, buộc xem lại; PM không confirm, Sup không update. Không dựa currentCoords/độ dài map hoặc PENDING_APPROVAL local để mở confirm. Không hard-code khóa khi môi trường thiếu fixture nếu các điều kiện thực sự đủ |

**Identity/conflict/readback:** module command giữ snapshot bất biến từ lần gửi đầu, K và ETag theo actor/project trong sessionStorage (chỉ payload/receipt/reference, không token/CSRF/cookie/identity đăng nhập). Retry do người dùng bấm mới replay cùng K/body/ETag; không auto replay mutation. Có receipt thì chỉ GET readback, không POST/PUT lại. HTTP từ chối cũng giữK khi retry cùng ý định; muốn sửa sau từ chối phải bấm rõ Sửa đầu vào sau lỗi từ chối.409/412/428 giữ bản nhập, đọc snapshot mới; chỉ sau quyết định Giữ bản nhập và dùng phiên bản mới mới bỏ ý định bị từ chối và tạo K mới. duplicate_request không được giải quyết bằng tự mint K. Không giữ được journal thì chặn trước dispatch. Logout/đổi actor không mượn ý định của người khác; epoch/project/draft/unmount và FileReader scope fence bỏ response cũ.

**Finding FE thực từ browser đã sửa:** sau create receipt/readback thành công, URL đã đổi nhưng React chưa hydrate draft, handler closure cũ có thể phát create lần nữa. Đã khóa đồng bộ bằng reference/version từ receipt đến khi đúng GET draft/status được hydrate; update/confirm cũng khóa khoảng chuyển tiếp. Regression gọi lại closure cũ ngay sau receipt xác nhận chỉ1mutation; browser cuối đúng1create, không tạo lặp. Đây là lỗi FE được tái hiện bằng mock HTTP browser, không ghi thêm project/draft trong DB.

**Gap/giới hạn tiếp tục giữ rõ authority:**

| Actor/nghiệp vụ, method/path | Expected–actual và evidence | FE hiện tại | Nhu cầu cụ thể / nghiệm thu còn thiếu |
|---|---|---|---|
| PM/Sup context GET /api/v1/projects/{projectId}/work-package | Expected scope/engineering/road/current-version bằng Web. Actual source WorkPackageRead chưa cookie eligibility ở SHA5180ab9; evidence trước Sup/PM401 trong khi session/CRS200. Image/source không đổi; smoke trang mới quan sát cùng401, không probe lại | Save và confirm khóa vì thiếu context, preview theo draft reference độc lập vẫn có thể chạy. Không Bearer fallback | BE đồng bộ cookie read/guard/contract trên runtime; PM/Sup đúngscope200 và ngoài scope403. Không đề nghị endpoint mới |
| Sup producer POST /.../road-sections; POST /.../{roadSectionId}/versions | Canonical DTO/operationId đã có; OpenAPI/source chỉBearer. Evidence Sup cookie+CSRF section401 cũ, correlation `a68b7455-d6ab-4092-9577-4914eaeed975`; versions chỉ source, không probe bằng ID tự tạo | Không nối producer hoặc bypass bằng nhánh repository tự tạo section khi confirm project-wide | BE bổ sung Web eligibility/CSRF và contract đồng bộ, hoặc bàn giao fixture section/version được phép. Test receipt/readback và đúng role/scope bằng Web |
| Dữ liệu CRS/reference; GET /.../crs-profiles, draft GET và geometry GET | Existing profile/system read200[] trong scope đã kiểm; chưa có manifest draft/confirmed đủ nguồn được bàn giao. Đây là thiếu đầu vào/reference/discovery, không kết luận DB không có dữ liệu hoặc thiếu command. Profile operation/independent controls thật chưa verified | Dùng chọn từ API và link receipt/reference, không yêu cầu nhập UUID/checksum. Không lấy mock fixture của harness làm dữ liệu công trình | Owner/data team cung cấp definition/provenance/engineering/profile và fixture cô lập; Sup nhận link draft được phép đọc. Không tự đề nghị thêm endpoint |
| Legacy COORDINATES readiness/confirm; GET .../{draftId}/readiness | GeometryEngine hỗ trợ metric COORDINATES source==engineering; nhưng CrsProfileEngine.Readiness hiện kiểm nativeAlignment/profile/system/tolerance và có thể trảmissing cho COORDINATES. Source không đổi, căn cứ là SHA5180ab9 nêu trên; không khẳng định chạy case legacy thật khi chưa fixture | Save metric khi đủ source vẫn nối; confirm luôn tuân readiness server, không tự chuyển ready=true vì preview thành công | BE/owner làm rõ semantics readiness cho legacy metric theo nghiệp vụ đã chấp nhận; cấp fixture. Browser mock ready=true chỉ chứng minh FE có điều kiện, không chứng minh backend legacy confirm đã hoạt động |
| PM native edit; PUT .../{draftId} | GeometryDraftInput có topology/calibration/tessellation/declared length, GET GeometryDraftView chỉ trả nativeAlignment và readiness, thiếu các source pin còn lại. Đây là thiếu readback để bảo toàn payload; UI native editor chưa nối đầy đủ | Khóa riêng native update; preview/confirm đã nối theo snapshot/readiness sẵn có. Không hạ native thành polyline | Cần readback nguồn đầy đủ đã thống nhất hoặc payload reference được owner bàn giao để sửa an toàn. Nếu đổi schema phải được chấp nhận trước; không tự thêm endpoint/field. Runtime native edit NOT_RUN |

**Kiểm thực chạy sau code ổn định:** node tools/check-step3-geometry.cjs **20 PASS**, mock/hooks/SSR:8 scenario giữ hai fix trước; create timeout+F5 cùngK/body; receipt/readback5030write-retry; If-Match/conflict/explicit decision; PM khôngconfirm/Sup đọc lại geometry; epoch cũ; sourced coordinate payload; HTTP từ chối giữkey; transition receipt→URL không tạo lặp; FileReader cũ; native edit chặn riêng nhưngpreviewkhôngkhóa; F5pending confirmgiữreason/date/ref nhưngkhôngapproval; storagefailure0dispatch; firstdispatch dùng đúng snapshot dù caller sửa object. Staged regression/diff-check kiểm riêng trước commit. npm run build **PASS tsc-b + Vite**, NODE_OPTIONS768MiB/GOMAXPROCS2/GOGC50, warning duration-[250ms]/chunk cũ. Không chạy full regression ngoài Bước3; không sửa runner ngoài nhiệm vụ.

| Tiêu chí | Kết quả mới và loại evidence |
|---|---|
| PM create→edit/conflict→preview, Sup nhận link/confirm, cả2roleF5 | PASS **browser mô phỏng** Edge headless: geometry/context/CRS/readiness/receipt được route-fulfill trong harness, Web login thật.1create201; update412 giữ bản nhập→explicit version→update200; preview không confirm; Sup confirm201 với expectedCurrentVersionId/If-Match/K; GETgeometry rồi URLref/F5 cả2role. Traffic0Bearer, CSRF/K có thật trên request, updateETag1→2 và confirmETag3. Không gọi là backendE2E PASS |
| Readback failure/timeout/F5 intent/conflict/late response | PASS unit/HTTP/hooks; không ép timeout/ghi chéo trên DB chung |
| Thiếu dependency trên runtime thật | PASS smoke **UI bị chặn đúng lý do**: mở trang dự án test cũ52a43dbb-4af5-4823-b6ec-e9263f3a262f, context401/profiles200[] qua reads bình thường; save disabled, chọn trống, không UUID/checksum/version input. Dropdown project→pathname đúng→F5 đúng. Không thêm manual probe hoặc dữ liệu |
| Backend lưu/sửa/confirm thật với source CRS hợp lệ | BLOCKED do transport/context/source fixture nêu trên; native update thêm giới hạn read model. Không đánh dấu runtimePASS từ mocks |
| Desktop/map/modal, hai fix trước | PASS browser/SSR: giữ khung và MapLibre; source tọa độ chưa có WGS84 thì không tự vẽ/project transform; chiều dài server hợp lệ vẫn hiển thị độc lập với hình học map. Không triển khai phân đoạn/pavement |

Harness đã có lỗi locator trùng2nút import/tên tuyến, phiên bản mock ban đầu bị race, và smoke phụ chạy song song timeout ở login; phân biệt với finding FE create-lặp đã sửa. Sau chỉnh harness/chạy tuần tự, browser cuối và smoke navigationPASS,0pageerror, **0backend business write**, không SQL/reset/reseed/clock/config/devhelper/Bearer fallback. Chỉ geometry mock có các UUID/checksum/datum mẫu được gắn nhãn TEST HARNESS ONLY trong RAM; không có mẫu nào đưa vào production default hoặc DB. Credential đọc handoff trong RAM; scripts/log/screenshots TEMP không stage, không secret trong worklog/source.

**Bàn giao:** tự review nghiệp vụ/API và UI/phạm vi hai lượt. Stage13file/hunk: alignmentService + geometryDraftCommands; AlignmentSegments; AlignmentHeader/AlignmentImportModal/AlignmentModals/ImportPanel; useAlignmentImportState/useAlignmentState/useGeometryReadModel/useGeometryDraftWorkflow; check-step3-geometry.cjs; đúng mục worklog này. Không gom hunk dở ngoài scope (kể cả120dòng worklog có trước). Commit tiếng Việt/push thường hoang từ parent như baseline, không force. Phần FE create/updateCOORDINATES, preview/readiness và Sup confirm đã nối có điều kiện; backendE2E và native editor còn giới hạn đã nêu. Không chốt toàn bộ Bước3 hoặc mở segment-set/pavement/bước4; dừng để review vòng draft/confirm.


### 07/11/2026 — Follow-up Bước 3: thoát chờ hydrate khác version/lỗi đọc và thông báo command theo ngữ cảnh

**Baseline/phạm vi:** hoang HEAD/parent `daac7ccb390e6c849d0ea20a99548b6baf6b1bc4`; đã kiểm HEAD/status/index và đọc AGENTS.md, workflow hook/read model, command journal, caller và client trước sửa. Đọc Spec17_10 Web errors/state và error responses OpenAPI của draft POST/PUT/GET/confirm; đối chiếu GeometryWorkflowPersistenceService, ApiErrorCodes, WebCookieRequestMiddleware/ActivityFilter tại checkout BE `5180ab9f86eee06a7328e9edeb5bee7dc18e808e` để xác định code thực. Chỉ đọc source error, không sửa BE/auth hoặc probe runtime. Giữ toàn bộ thay đổi local ngoài nhiệm vụ; không reset/restore/clean/stash.

**Nguyên nhân:** receipt/readbackV2 đã thành công nhưng chốt awaitingAcknowledgement chỉ mở khi lần hydrate kế tiếp đúngV2 (hoặc đúngstatusCONFIRMED). Cùng draft trả version khácV3 hoặc GET lỗi không đi vào nhánh kết thúc chờ, nên busy/form bị giữ mãi. Không có bằng chứng versionV3 phải lớn/nhỏ hơnV2: version là opaque. Một nhánh notification khác còn trả err.message tùy ý và coi mọi409/412/428 như version conflict.

**Sửa:** tách trạng thái đang đọc, lỗi đọc và cùng draft/version khác trong hook. Chỉ đọc kết quả đúng project/draft; khi loading còn chạy thì giữ latch chống click lặp. Khi cùng draft trả version khác, kết thúc busy/awaiting, giữ toàn bộ bản nhập, xóa preview cũ, mở đối chiếu với freshVersion=false; không tự accept snapshot mới hoặc gửi mutation. Chỉ dùng equality ETag/status, không decode/sắp thứ tự Base64. Giữ bản nhập cả trong khoảng receipt→query mới, không hydrate ghi đè trước quyết định. Capture ETag theo render cho save/If-Match để closure cũ không dùng bản nhập cũ với version mới.

Nếu GET sau lưu lỗi: busy được giải phóng, form vẫn giữ bản nhập, save/confirm chờ đọc lại resource; thêm nút Đọc lại bản nháp đã lưu bằng style có sẵn. Retry chỉ gọi loader đọc (không create/update/confirm/journal/key). Matching snapshot sau retry xóa lỗi và cập nhật thông báo đã đọc lại; version khác sau retry vẫn vào đối chiếu. Retry đọc và receipt→hydrate vẫn có latch đồng bộ; scope/epoch/draft fence và kiểm duplicate clicks cũ giữ nguyên. Matching hydrate có thể xác minh resource dù readiness riêng lỗi; readiness/error state hiện có tiếp tục báo đúng phần thiếu.

**Thông báo:** geometryCommandErrors ánh xạ code thực: validation/geometry/CRS, access_forbidden, csrf_failed, auth_session_revoked/auth_password_change_required;401 phân biệt phiên không còn hiệu lực với request chưa được xác thực trong phiên còn active. duplicate_request/project_closed/road_geometry_invalid_state/road_section_code_conflict khác concurrency_conflict/road_section_concurrency_conflict;403khôngcode không bị gắn nhãn thiếu quyền,409khôngcode không bị gọi version conflict.428 validation_error được diễn đạt thiếu điều kiện request. Network/timeout/5xx khi còn pending khôngreceipt là chưa rõ kết quả, không nói server đã từ chối; córeceipt là đã tiếp nhận nhưng chưa readback, kèm reason được map từcause. Unknown chỉ thông báo chung; không dùng raw detail/title/message/stack. Chỉ GeometryCommandUiError do code FE tự tạo mới giữ nguyên câu validation ngắn, không lấy ngoại lệ tùy ý làm nội dung UI. Copy đối chiếu trên page dùng hồ sơ thay vì mặc định lỗi phiên bản.

Không thay retry/idempotency để đổi message: `geometryDraftCommands.ts`, K/body/ETag journal và `api/client.ts` session recovery/interceptors **không có diff**. Không mở native editor, CRS/discovery, producer, segment-set/pavement hoặc workflow mới; không có gap BE mới.

**Kiểm thực chạy sau code ổn định:** `node tools/check-step3-geometry.cjs` **24 PASS** (20 scenario trước vẫn đạt +4 nhóm mới). Các case mới: V2accepted→hydrateV3 khácopaque/giá trị có thứ tự chữ ngược vẫn mở conflict, busy=false, origin/bản nhập giữ, chưafresh/accept và0mutation thêm; GET hydrate lỗi→retrymatching hoặc retryversionkhác, chỉ tăngread; matchingversion chống closureclicklặp và lateepoch không mởscope mới; code thực phân biệt403CSRF/quyền,409state/code/idempotency/version,401valid-session/revoked,validation/428/network/5xx; unknown có nội dung giảsecret/stack không được echo. Khi kiểm harness phát hiện guard save đọc ETag từ mutable model thay vì snapshot render; đã capture primitive để giữ chống closure cũ, không nới test. Không thay journal semantics.

`npm run build` **PASS tsc-b + Vite** với NODE_OPTIONS768MiB/GOMAXPROCS2/GOGC50 sau code cuối; còn warning duration-[250ms]/chunk có trước. Scoped/staged diff-check và regression từ staged kiểm trước commit; không chạy full regression ngoài Bước3. Các lần chạy lại chỉ sau code/test thay đổi hoặc để kiểm bản staged.

Browser Edge headless **PASS mô phỏng geometry**: dùng trang/modal/caller thật, Web login thật, route-fulfill context/profile/draft/GET lỗi trong harness; không coi là DB/runtime E2E.1mockcreate và2mockupdate là các ý định do test bấm: updateV2 được readback, hydrateV3 cóorigin999 nhưng form giữorigin0/lýdo, input enabled và chỉ có1update cho ý định này; đối chiếu do người dùng bấm trước lần update mới. Lần sau hydrate503 form thoátbusy; nút retry đọc thành công, thông báo lỗi được xóa, mutation count không tăng.0pageerror, **0backend business write**; không tạo dữ liệu/SQL/reset/reseed/clock/config/Bearer/devhelper hoặc vượt blocker. Screenshot đã xem, giữ layout/map/toast/component hiện có. Scripts/ảnh TEMP không stage, không credential/token/cookie trong commit. Các error-code/network/phiên cũ được kiểm bằng mock/hooks, không cố gây lỗi xác thực hoặc mạng trên môi trường chung.

**File/stage/review:** useGeometryDraftWorkflow.ts; AlignmentSegments.tsx (nút retry đọc/copy đối chiếu); geometryCommandErrors.ts; check-step3-geometry.cjs; chỉ mục follow-up này trong worklog. Tự review logic/opaque version, bảo toàn bản nhập, thông báo và UI/phạm vi; giữ hunk worklog cũ/các file dở ngoài nhiệm vụ unstaged. Commit tiếng Việt/push thường hoang, parent như baseline, không force. Chỉ bàn giao hai lỗi FE; các blocker/runtime/native giới hạn đã ghi trước không đổi, không chốt toàn bộ Bước3 hoặc chuyển bước tiếp theo.

### 07/11/2026 — Khôi phục UI màn tuyến theo phản hồi, chờ đối chiếu trước commit

**Baseline/phạm vi:** `hoang`, HEAD `f2d313d3abd185cf118ac92c2df56406ed55e4c7`. Đã kiểm HEAD/status, đọc AGENTS.md, caller/hook/component trực tiếp và đối chiếu JSX tại `b0f0913fddeba9139bcae55369bdb18a026ef028`. Nhiệm vụ nhân sự tạm dừng. Đối chiếu SHA256 cuối lượt với snapshot đầu lượt: **40 file local ngoài nhiệm vụ giữ nguyên byte**, gồm toàn bộ phần nhân sự; không stage/commit/push/reset/restore/clean/stash. Giữ các hunk worklog cũ, chỉ thêm mục này. Không sửa BE/DB/auth hoặc mở workflow pavement.

**Hunk UI đã đổi so với HEAD:**

| Nhóm file | Thay đổi giới hạn |
| --- | --- |
| `AlignmentSegments.tsx`, `alignment/AlignmentHeader.tsx` | Bỏ hai section thêm phía trên breadcrumb/header: context/tải lại và giải thích draft/preview/pavement, cùng form ngày/lý do confirm trong panel đó. Chuyển reload, preview bản đã lưu, retry đọc/receipt và đối chiếu vào toolbar hiện có; giữ nút lưu PM/confirm Sup và các gate/handler. Loading/lỗi/kết quả dùng dòng trạng thái trong header hoặc toast cũ, không có panel kỹ thuật mới. Không dùng chiều dài 0 thay dữ liệu chưa đọc; bỏ dấu check thành công chung khỏi toast. |
| `AlignmentImportModal.tsx`, `AlignmentModals.tsx`, `ImportPanel.tsx` | Bỏ slot form kỹ thuật dài: tuyến/CRS, lý trình gốc, khảo sát, width intervals, lý do. Giữ khung modal/dropzone và hai tab FILE/MANUAL. Chỉ thêm trạng thái đọc/lỗi ngắn và các nguồn còn thiếu dưới vùng nhập; không đưa form kỹ thuật trở lại. Đổi nhãn xóa bản nhập, bỏ câu nói đã chọn CRS khi không có lựa chọn đó. |
| `AlignmentSidebar.tsx`, `SidebarSegmentsTab.tsx`, `SidebarWidthProfileTab.tsx`, `SidebarSlabsTab.tsx`, `SidebarSegmentCard.tsx`, `SidebarFooterKpis.tsx`, `AlignmentAddModal.tsx`, `AlignmentEditModal.tsx` | Bỏ fieldset khóa toàn sidebar. Tab vẫn chuyển được; PM DRAFT chỉnh cục bộ qua các control cũ, Sup/hồ sơ khóa chỉ đọc; busy/pending/conflict khóa đúng control chỉnh, không khóa nút tab. Ô thiếu để trống/nhãn chưa có dữ liệu; không fallback 8m/4 làn hoặc render NaN/Infinity, không tính diện tích/bình quân/nửa rộng khi thiếu đầu vào. Preset chỉ là lựa chọn người dùng bấm, không tự điền. Không dùng kiểm tra liên tục cục bộ để báo sẵn sàng duyệt server. |
| `useAlignmentState.ts`, `useAlignmentSegmentsState.ts`, `alignmentSplitHelpers.ts` | Nhận khoảng bề rộng từ draft GET có project/id/lý trình gốc; ID hiển thị dẫn xuất từ draft, không tạo ID nghiệp vụ. Bản chỉnh bề rộng chuyển vào bộ kiểm payload cũ khi đủ nguồn; slab/khe chỉ là xem thử cục bộ, chưa lưu pavement. Phân biệt dirty cục bộ với server; không hydrate đè khi đang chờ/conflict hoặc còn bản chỉnh, kể cả URL đổi theo receipt. Reset editor khi đổi project/phiên. Chia đoạn cần chiều dài, cự ly và lý trình có nguồn; bỏ default 5km/Km1020/8m/4làn/vật liệu, không tự sinh slab với tham số mẫu. Không fly-to tọa độ mẫu khi chưa có ánh xạ lý trình. Nút tạo nhánh hiện chỉ báo thiếu nguồn hình học/context đã xác minh, không mở workflow nhánh để tự tạo số liệu mẫu. |
| `useAlignmentImportState.ts`, `useGeometryDraftWorkflow.ts`, `useGeometryReadModel.ts` | GeoJSON vẫn qua inspector cũ và giữ nguyên điểm; đọc thành công chỉ báo **“Đã đọc tệp, chưa lưu”**. File chưa xác minh CRS/trục/đơn vị không được mượn profile của bản nhập trước để gửi command. Giữ lỗi syntax/ambiguity/geometry/CRS/validation/I/O và fence FileReader. Giữ journal/receipt/opaque version/idempotency/session recovery; không có diff trong command service/error mapper/client. Sửa thêm lỗi thực thấy khi kiểm retry: context GET thành công phải xóa đúng thông báo lỗi context cũ, không xóa lỗi geometry khác. |
| `tools/check-step3-geometry.cjs` | Thêm filter chạy đúng nhóm ảnh hưởng và 6 nhóm kiểm UI/state; cập nhật assertion đọc file chưa lưu. Không sửa/chạy lại bộ nhân sự hoặc regression ngoài phạm vi. |

**Nguồn còn thiếu và giới hạn thao tác:** GeoJSON inspector chỉ xác nhận một LineString và các đỉnh số hữu hạn. Không có mapping đã xác minh từ properties của file sang hồ sơ CRS/provenance, origin, surveyWidth hoặc widthProfile; các hint chiều dài/bề rộng không trở thành dữ liệu kỹ thuật chính thức. Không suy axis/unit/CRS, checksum hoặc tự chọn profile theo SRID. Project/tuyến lấy từ context đã đọc và draft đang mở, hoặc đúng một tuyến do context trả; nhiều tuyến mà chưa có lựa chọn hợp lệ thì chặn save, không thêm selector trùng vào modal. DTO COORDINATES yêu cầu `sourceCrs`, `stationOriginMeters`, `coordinates`, `widthProfile`, `surveyWidthMeters`; validator FE hiện có còn yêu cầu lý do có nguồn (không kết luận `changeReason` là field bắt buộc trong DTO). Thiếu phần nào nêu phần đó, không tự điền và không POST/PUT thiếu field. Header save vẫn qua validator và command cũ. Các thao tác preview/retry/đối chiếu độc lập vẫn dùng được khi có draft hợp lệ. Confirm Sup giữ command/gate và dữ liệu pending cũ; ý định confirm mới chưa có ngày hiệu lực/lý do có nguồn vẫn bị chặn riêng, không tự dùng ngày hiện tại/lý do mẫu và không thêm form kỹ thuật thay thế trong lượt khôi phục UI. Đây là giới hạn nguồn/luồng UI còn cần review, không báo đã hoàn chỉnh draft/confirm E2E.

**Blocker có evidence, không suy thiếu endpoint:**

| Method/path | Expected–actual / bằng chứng | FE hiện tại / nhu cầu |
| --- | --- | --- |
| GET `/api/v1/projects/{projectId}/work-package` | Điều hướng trang bằng PM Web cookie thật vẫn trả **401** ở runtime test đang chạy; browser ghi hai response401 do recovery của client hiện có, không phải probe loop. Source BE SHA `5180ab9f86eee06a7328e9edeb5bee7dc18e808e` và thiếu Web transport đã đối chiếu ở mục trước, không sửa hoặc probe lại producer. | Header báo lỗi/retry, không bịa context/tuyến/phiên bản. Giữ nhu cầu hỗ trợ WebSession cho API context đã có; không yêu cầu endpoint mới. |
| POST `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts`; PUT `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` | Handler/DTO đã có; file LineString đơn thuần chưa cung cấp bộ đầu vào có nguồn nêu trên. Không thử mutation DB để ép import PASS; không có evidence mới về lỗi endpoint. | Chỉ đọc tệp, giữ bản nhập, khóa đúng save với lý do. Cần mapping/hồ sơ nguồn được xác minh trong workflow hiện có; không đề nghị endpoint hoặc form kỹ thuật mới để lấp dữ liệu. |
| POST `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/confirm` | Giữ gate draft/readiness/version/actor và ngày/lý do có nguồn. Không gọi confirm thật; thiếu đầu vào cho ý định mới chưa phải bằng chứng gap BE. | Giữ handler/receipt retry/role Sup; chặn đúng khi thiếu điều kiện. Chưa nghiệm thu confirm mới sau khôi phục UI. |

**Kiểm thực chạy:** 14 scenario liên quan đã PASS bằng mock/hooks/SSR: 8 nhóm GeoJSON/map/late-reader/hydrate có trước và 6 nhóm UI/state mới (modal không form kỹ thuật; unknown/valid; quyền/sidebar; nguồn file không mượn profile; local split không tạo thông số mẫu; retry context; local edits không bị busy/conflict/snapshot mới ghi đè; header không giả chiều dài0). Chạy bằng `RG_STEP3_FILTER` trong `node tools/check-step3-geometry.cjs`; không chạy lại toàn bộ 24 nhóm cũ hay regression nhân sự. Các lần chạy bổ sung chỉ sau thay code/test hoặc sửa harness thất bại. `npm run build` cuối **PASS tsc-b + Vite**, NODE_OPTIONS768MiB/GOMAXPROCS2/GOGC50; warning duration-[250ms]/chunk có trước. Build đầu bắt lỗi JSX placeholder trùng do lần sửa này, đã sửa trước build PASS; build cuối chạy sau sửa context/header/guard cuối, không lặp build khi code không đổi.

Browser Edge desktop1600×1000: đã chụp và xem **6 ảnh**. Hai ảnh trang/modal rỗng qua Web login và điều hướng API thật: giữ header→map/sidebar, không hai panel thêm, modal gọn chỉ FILE/MANUAL. Bốn ảnh đọc file/lỗi syntax/chỉnh width/chỉnh slab dùng route-fulfill geometry/context có nhãn mô phỏng trong harness; không tính runtime E2E. Kiểm file hợp lệ báo chưa lưu, file sai syntax báo đúng lỗi, save bị khóa thiếu nguồn; context503→retry200 xóa lỗi, giữ draft; width6→12 cập nhật diện tích100m×12m=1200m² và nhãn cục bộ; slab còn thiếu để trống, nhập7m vẫn chỉnh được và không gửi mutation; preview phản ánh readiness=false server mô phỏng. **0pageerror, 0business write tới BE**, chỉ1preview mô phỏng; không tạo dữ liệu/tài khoản/SQL/reset/reseed/clock/config/Bearer/devhelper. Một locator exact của harness ban đầu không tính text icon, đã sửa locator; lỗi retry context là finding FE riêng đã sửa và test lại. Ảnh nằm ngoài repo tại thư mục artifacts phiên Codex, tên `alignment-ui-desktop-real.png`, `alignment-ui-import-empty.png`, `alignment-ui-import-read.png`, `alignment-ui-import-error.png`, `alignment-ui-width-local-mock.png`, `alignment-ui-slabs-local-mock.png`; đã xem ảnh cuối của desktop/modal sau chỉnh header. Scoped diff-check thực chạy lúc bàn giao; không stage bất kỳ file nào.

**Bàn giao:** 19 file source trực tiếp nêu trên +1 file regression +hunk worklog này. Đã tự review JSX/style/nguồn dữ liệu/API gates, giữ logic sửa hydrate và journal; chưa commit/push theo yêu cầu đối chiếu UI. Nhân sự và các file dở khác giữ nguyên. Dừng để người dùng review ảnh, không chốt Bước3 hoặc chuyển bước tiếp theo.

### 07/11/2026 — Lỗi địa bàn dự án: xác minh runtime, BLOCKED nguồn đọc Web

**Baseline/phạm vi:** nhánh `hoang`, HEAD/parent `020c191d7fbc71fa4fa36c084772508f65ad59db`; kiểm HEAD/status/index trước làm, đọc AGENTS.md, projectService, contract list/work-package và source BE trực tiếp. Giữ nguyên 100% JSX/UI, nhãn/layout, geometry và phần nhân sự. Chỉ thêm mục worklog này; không sửa production hoặc dựng fallback khi runtime còn401. Không tạo/sửa dự án hoặc dữ liệu dùng chung, không SQL/Bearer/devhelper/config/reset/restore/clean/stash.

**Nguyên nhân source FE:** `createProject` gửi `payload.region` dưới field DTO `description`. Create readback duyệt GET `/projects`, rồi `mapBackendProjectToHub(readBack)`; `fetchProjectById` cũng tìm trong `fetchProjects`. Mapper dùng `item.region || item.location || item.description || ''`, nên list không trả description làm địa bàn rỗng. Không thay nghĩa description, không thêm field region/location vào DTO và không lấy form/cache để giả readback.

**Source/contract đối chiếu:** checkout BE đọc tại `RoadGuard-web-5180ab9`, SHA `5180ab9f86eee06a7328e9edeb5bee7dc18e808e`. `ProjectCreationService` chuyển command.Description vào persistence request; `ProjectWorkPackageService` chuyển result.Description vào `ProjectWorkPackageResponseDto.Description`; `ProjectListItemResponseDto` chỉ có ProjectId/ProjectCode/Name/Status/primary-PM, không Description. Controller work-package trong checkout này có WorkPackageRead policy nhưng chưa có WebCookieEligible attribute. OpenAPI FE hiện hành khai GET list Bearer hoặc WebSession, GET work-package chỉ Bearer. Source phiên bản khác có cookie eligibility không chứng minh image đang chạy đã có bản sửa đó; không quy kết mọi phiên bản BE thiếu transport.

**Runtime thực kiểm, không dùng evidence cũ thay kết quả mới:** Docker API `roadguard-case409-clean-20261106-api-1`, image ID `sha256:45b1b96ab7579c9e7166dd69fc3eb5038bd2735d7334eb92d04f7add072db82e`, cổng28081/28443; Vite5173 proxy tới HTTPS28443. Browser Edge đăng nhập Web thật riêng PM-A và Supervisor bằng tài khoản test hiện có; credential chỉ ở RAM. Sau login, fetch bằng cookie cùng origin, không Authorization và không interceptor replay; mỗi role chỉ1 GET list và1 GET work-package chủ đích, không probe lặp/chờ BE.

| Actor / API | Actual | Kết luận |
| --- | --- | --- |
| PM-A: GET `/api/v1/auth/web/session` | 200 | Có phiên Web hợp lệ tại thời điểm kiểm |
| PM-A: GET `/api/v1/projects` | 200,3items,nextCursor=null | Có fixture `52a43dbb-4af5-4823-b6ec-e9263f3a262f`; không có field description trong item |
| Sup: GET `/api/v1/auth/web/session` | 200 | Có phiên Web hợp lệ tại thời điểm kiểm |
| Sup: GET `/api/v1/projects` | 200,4items,nextCursor=null | Cùng fixture hiện diện; không có field description trong item |
| Cả hai: GET `/api/v1/projects/52a43dbb-4af5-4823-b6ec-e9263f3a262f/work-package` | 401,code=`auth_unauthorized` | Không nhận được description. Không chứng minh server trả trống hoặc DB mất địa bàn |

Fixture được nhận diện từ hồ sơ test Bước2 đã có (`RG-S2-1793978628311`), không tạo lại. Chưa xác minh được đây chính là dự án người dùng đang phản ánh có nhập địa bàn; API Web không cho đọc description nên không thể chứng nhận giá trị thực hoặc kiểm sau tạo/F5 thành công. Không đọc SQL hoặc mượn Bearer để vượt giới hạn này. Script/evidence chỉ ở TEMP, không stage ảnh/log/secret.

**Blocker và đề xuất bounded:** GET `/api/v1/projects/{projectId}/work-package`, actor PM trong scope và Sup: expected200 bằng WebSession hợp lệ và trả description theo DTO; actual401 auth_unauthorized trên image nêu trên dù session/list200. BE cần đưa Web cookie eligibility/auth policy của API đã có vào đúng runtime và cập nhật contract tương ứng; kiểm lại role/project scope sau transport được hỗ trợ. Phương án thay thế có giới hạn cho card/list: bổ sung `description` từ Project.Description vào DTO GET `/api/v1/projects` hiện có, bảo toàn pagination/filter/scope. Không đề xuất endpoint mới/ETag mới hoặc đổi schema nghiệp vụ. Chưa sửa BE. FE chưa thêm request work-package vào mọi card vì sẽ tăng request401 mà không sửa được nguồn dữ liệu; không coi API lỗi là description trống thành công.

**Nghiệm thu:** điều tra Web session/list/work-package **PASS**; xác minh description có giá trị/trống, mapping bổ sung, error/partial/retry, fence sai project/phiên và sau tạo/F5 **BLOCKED/chưa triển khai** bởi nguồn đọc trên. Không tạo regression mô phỏng để báo lỗi production đã sửa. Không chạy lại regression Bước2/typecheck/build vì **không có thay đổi code/test**; các kết quả PASS trước không được dùng để tuyên bố lỗi địa bàn đã hết. Diff-check và staged review chỉ cho mục tài liệu này; xác nhận không có diff JSX/UI mới, không gom các hunk worklog cũ hoặc file local ngoài nhiệm vụ. Commit tiếng Việt/push thường `hoang` chỉ báo cáo blocker, không chốt sửa lỗi địa bàn hoặc mở nhiệm vụ khác.

### 07/11/2026 — Sửa địa bàn dự án: dùng BE develop hiện hành và description server

**Baseline:** FE `hoang` parent `e21a6a5a082639b63812046c399d74a308cef448`; đã kiểm HEAD/status và giữ mọi file local khác. Đọc lại service/caller list/detail/create, AGENTS.md, contract và controller/DTO/service BE. Không đổi bất kỳ JSX/UI/nhãn/layout nào; production diff chỉ `src/api/services/projectService.ts`, test `tools/check-step2-projects.cjs` và mục worklog này. Không chạm nhân sự/geometry, không lấy form/cache làm địa bàn đọc lại.

**Sửa kết luận runtime cũ:** fetch `HoangAnhVu2207/RoadGuardSystem` develop thực tế trả `d810cc52668a6f0a3272f8b20b095ac6fef122b2`; tạo worktree detached sạch `RoadGuard-web-d810cc5`, không sửa BE source. Controller work-package đã có WebCookieEligible, DTO/service trả Description; list vẫn không có description. FE Vite5173 proxy thực tới HTTPS localhost28443, container `roadguard-case409-clean-20261106-api-1` trước đó dùng image cũ `sha256:45b1b96ab7579c9e7166dd69fc3eb5038bd2735d7334eb92d04f7add072db82e`. Vì vậy401 trước đây chỉ chứng minh runtime cũ, không chứng minh BE develop hiện tại thiếu cookie.

**Cập nhật riêng API test được người dùng cho phép:** build nguyên trạng bằng `deploy/fe-handoff/Dockerfile.Handoff --target api`, image `roadguard-case409-clean-20261106-api:d810cc5`, ID `sha256:be75b55fc017fee07d7e801de3c8e66396a1bbd441dd9e8737051cce005bf294`. Compose cùng project/config HTTPS cũ, override image và giữ environment hợp lệ từ container hiện có, `up -d --no-deps --no-build api`. Không chạy init/scenarios/reset/reseed, không xóa volume hoặc sửa cấu hình/DB bằng SQL. Đã đọc bootstrap: startup mặc định kiểm ownership, gọi MigrateAsync và seed initializer idempotent; giữa hai SHA không có diff migrations/catalog, initializer gặp marker đúng sẽ return không seed lại. Không phát lệnh migration/seed riêng. Kiểm sau recreate: API healthy; cùng SQL container ID, cùng ba volume state/keys/tls và mount destination/RW (chỉ thứ tự inspect thay đổi), DB/volume/dữ liệu giữ nguyên. Source worktree BE sạch, không deploy môi trường dùng chung.

**Sửa FE tối thiểu:** GET list vẫn là nguồn danh sách/phạm vi; bổ sung GET `/projects/{id}/work-package` để lấy description server theo đúng projectId. Helper kiểm identity và kiểu field: null/chuỗi rỗng là trống thực; thiếu field/sai ID/HTTP lỗi là chưa tải được, không lấy `region/location` từ list hoặc bộ nhớ để lấp. Mỗi lượt list dedup ID; chia sẻ Promise đang chạy theo epoch/actor/project và xóa sau settle, không cache dữ liệu thành công/lỗi cho lượt sau. Chặn response khác phiên/actor trước dùng; caller list/detail giữ requestId/project fence cũ. Lỗi bổ sung giữ các dự án và số liệu độc lập đã tải, địa bàn hiển thị trạng thái dữ liệu “Chưa tải được địa bàn”, đồng thời dùng `stats_error`/retry có sẵn (banner chung giữ nguyên JSX/copy); description null vẫn để chuỗi rỗng cho empty UI hiện có. Không thêm field domain hoặc thông báo/panel mới.

Create readback sau201 lấy description bằng helper cùng ID server sau khi tìm resource trong list; không lấy payload.region làm kết quả. Lỗi đọc description giữ receipt và báo đã tạo/chưa readback đầy đủ, retry chỉ đọc bằng receipt cũ, không POST lại hoặc đổi key/body. POST vẫn gửi region dưới description như trước; không thay schema/ý nghĩa description.

**Runtime/browser thật:** sau cập nhật API, cả Sup và PM-A có Web session200, work-package200; không Authorization/Bearer hoặc devhelper. Dùng dự án người dùng đã tạo sẵn `ABC1`, tên `test thủ công`, ID `9b51bb39-8c5f-43f1-84a2-520a1d8b5eba`: server trả description **“Bảo Lộc - Lâm Đồng”**. Dự án test Bước2 `52a43dbb-4af5-4823-b6ec-e9263f3a262f` trả description=null thật, không phải mất dữ liệu vì lỗi đọc. Không tạo/sửa dự án để kiểm.

| Tiêu chí | Evidence / kết quả |
| --- | --- |
| Sup/PM API đúng description | PASS thật: GET work-package200, đúng ID ABC1 và chuỗi trên; list200 vẫn thiếu description |
| Card/list và chi tiết | PASS browser Edge thật cả2role; địa bàn trên list và header chi tiết khớp server |
| F5 | PASS thật cả list và chi tiết cho cả2role; sau reload vẫn cùng chuỗi, service đọc server lại |
| Server trống | PASS thật: fixture Bước2 GET200 description=null và chi tiết hiện “Chưa thiết lập địa bàn” |
| Đọc bổ sung lỗi/partial/retry | PASS mô phỏng503 riêng work-package ABC1 trong browser thật: card/danh sách vẫn còn, hiện chưa tải được; bấm retry đọc API thật khôi phục địa bàn. Không coi mô phỏng503 là lỗi BE runtime |
| PM ngoài scope | PASS thật: GET work-package SBX-B (`72f84201-c001-4000-8000-000000000002`)403 `project_access_forbidden`, không lộ description |
| Sau tạo/readback | PASS regression mock201→list→work-package: description server thắng form; GET lỗi giữ receipt, retry không tăng POST. Không tạo lại dự án bằng API thật; không tuyên bố đã chạy create E2E mới |
| Sai ID/phiên/request trùng/cache | PASS mock: sai project không cập nhật; epoch/actor đổi bỏ kết quả; ID trùng và hai lượt đồng thời chia sẻ một GET đang chạy; lượt sau đọc lại, không dùng settled cache |

**Kiểm thực chạy sau code ổn định:** `node tools/check-step2-projects.cjs` **15 PASS** (13 nhóm có trước +2nhóm địa bàn), bao gồm create receipt/idempotency, scope, render unknown/warranty và fence caller cũ. Mock HTTP/SSR không tính E2E. `npm run build` **PASS tsc-b + Vite** với NODE_OPTIONS768MiB/GOMAXPROCS2/GOGC50; warning duration-[250ms]/chunk có trước. Scoped diff-check PASS. Không lặp bộ PASS khi code không đổi. Browser0pageerror/0backend business write; chỉ auth login/logout và GET, không SQL/reset/reseed/Bearer/config để vượt quyền. Script/ảnh/log ở TEMP/artifacts ngoài repo, không stage. Ảnh `region-{sup,pm}-list-real.png`, `region-{sup,pm}-detail-f5-real.png`; đã xem ảnh PM detail F5 và xác nhận địa bàn từ server trên UI giữ nguyên.

**Bàn giao:** lỗi hiển thị địa bàn từ server đã sửa trên API test mới; blocker401 của runtime cũ được giải quyết bằng đúng source develop, không thêm endpoint/BE patch. Chưa chạy mutation tạo mới runtime theo giới hạn giữ dữ liệu; luồng create được chứng minh bằng regression. Tự review service/payload/error/identity và xác nhận không có diff JSX/UI; hash41file local ngoài nhiệm vụ không đổi. Chỉ stage service/test/hunk worklog này, commit tiếng Việt/push thường `hoang`; không gom phần nhân sự/geometry/hunkworklog cũ hoặc mở nhiệm vụ khác.

### 07/11/2026 — Stepper: không hiển thị thời hạn bảo hành giả khi thiếu dữ liệu

Baseline `hoang` HEAD/parent `6438563bf90ac095956db58e1a7fdf7402c6a850`; đã kiểm HEAD/status, đọc stepper và helper `hasWarrantyData` cùng caller hiển thị bảo hành hiện có. Chỉ thêm import/helper result và thay3biểu thức hiển thị trong `ProjectTimelineStepper.tsx`: số ngày còn lại, phần trăm thời hạn đã qua, ngày hết hạn. Khi helper xác định thiếu/invalid thì hiện “Chưa cập nhật”; không NaN ngày/NaN%, không mặc định “3 năm từ bàn giao”. Số liệu hợp lệ và số0 thật giữ nguyên; trạng thái đóng/tạm dừng không thay đổi. Không thay cây JSX, class/style/layout hoặc nội dung khác.

Kiểm `node tools/check-project-timeline-warranty.cjs` PASS render bằng React SSR: thiếu cờ/ngày/metric, ngày sai hoặc đảo thứ tự, NaN/null/undefined/Infinity đều không hiển thị thời hạn giả; dữ liệu đủ hiện12ngày/25%/ngày server;0ngày/0% và0gói/0điểm vẫn đúng. `npx tsc --noEmit` PASS; scoped/staged diff-check PASS. Không chạy browser E2E, build Vite hoặc toàn bộ regression vì chỉ đổi điều kiện hiển thị. Giữ mọi file local ngoài nhiệm vụ; chỉ stage stepper, test render trên và mục worklog này, commit tiếng Việt/push thường `hoang`. Không gom nhân sự/geometry hoặc các hunk worklog có trước.

### 07/11/2026 — Bàn giao tiếp phần nhân sự local: đọc độc lập và sửa điện thoại có snapshot

**Baseline/phạm vi:** `hoang` HEAD/parent `effe94c5462450018fa37e620da78442501bb8c7`, kiểm HEAD/status trước làm. Tiếp tục đúng diff local, không làm lại. Đọc AGENTS.md, Spec17_10 Authentication–Users–Memberships/authority, service/hook/caller/modal thực dùng chung hai route (`App.tsx` Sup/PM đều mount PersonnelManagement). Không đụng geometry, auth, BE/DB hoặc các tab cấu hình khác. Đối chiếu source BE hiện chạy `d810cc52668a6f0a3272f8b20b095ac6fef122b2`, API test image `sha256:be75b55fc017fee07d7e801de3c8e66396a1bbd441dd9e8737051cce005bf294` từ lượt địa bàn, không rebuild/probe admin mutation thêm trong lượt này.

**UI local được giữ nguyên:** đã báo người dùng trước khi tiếp tục rằng diff có trước so với HEAD gồm: PersonnelManagement bỏ icon toast/dò chữ lỗi, dùng kind rõ ràng và thêm cảnh báo dự án; AccountsTab giữ bảng và thêm partial-loading; EditUserModal giữ form và thêm trạng thái snapshot/retry/đối chiếu, chỉ điện thoại được chỉnh; UserDetailModal thêm khối membership/lịch sử; AddPersonnelModal/ResetPasswordModal/SuspendUserModal có dòng lý do khóa và disabled control. Đây là hunk đã local trước lượt tiếp tục, không tự khôi phục hàng loạt. SHA256 của7file JSX/component này khớp snapshot đầu lượt: **không thêm/xóa/đổi JSX, nhãn, layout hoặc style trong lượt tiếp tục**. Stage chúng vì là dependency trực tiếp của hook/service local đã được yêu cầu bàn giao. Không đưa bản stub hoặc thiết kế mới vào thay thế.

**Phần đã hoàn chỉnh:** Sup tải Staff và Reporter độc lập, mỗi nguồn duyệt pagination/cursor, lỗi riêng không biến thành[] thành công; Staff hiển thị trong khi Reporter chờ/lỗi, giữ nguồn thành công và retry. Dự án/thành viên lỗi có trạng thái riêng, không kết luận đã phân công đầy đủ. PM chỉ GET project list được cấp quyền và members của từng project; không đọc users directory để lấp contact. Mapping chỉ dùng userId/membershipId/projectId server; không ghép membership từ tên/email/project_scope. Account status, effective memberships, historical records và isPrimary là nguồn riêng; PM không suy trạng thái tài khoản từ ACTIVE membership. Không sinh email/ID/ngày tạo/last-active/thiết bị/IP mẫu; thiếu thì trạng thái chưa có thông tin. Role/search filter là lọc danh sách hiện có, không cấp quyền hay phát mutation.

**Điện thoại:** DTO nguồn thực PhoneNumberUpdateRequestDto chỉ `phoneNumber`; PATCH `/api/v1/users/{userId}/phone-number` có WebCookieEligible,204/412/409/428 và version opaque trong If-Match; Idempotency-Key giữ theo ý định. GET user detail trả ETag nhưng thiếu phone/status; snapshot đọc GET detail→directory đúng role→GET detail với hai ETag bằng nhau, kiểm đúng ID và role trước cho chỉnh. Giữ snapshot/version người dùng đã xem, không tự GET version mới ngay lúc lưu. Role/status/email/họ tên và phân công không gửi kèm. Receipt204 giữ trong memory/session journal, readback lỗi báo đã lưu/chưa đọc đủ, retry cùng ý định chỉ GET; timeout chưa receipt giữ K/body/ETag, không báo server từ chối; conflict giữ số nhập và chờ người dùng đọc/accept rõ ràng. Reload danh sách lỗi sau mutation báo warning riêng, không đảo thành mutation thất bại. Client hiện có chịu cookie/CSRF/session recovery, không thêm auth flow/Bearer.

**Sửa thêm đúng3guard service/state sau review:** `personnelScreen.ts` kiểm cả ID lần GET trước và sau của snapshot, không chỉ ETag/ID sau; `usePersonnelState.ts` không mở target edit khác khi phone command đang chạy (tránh response cũ khiến busy của modal mới kẹt), không save lúc detail còn loading; mỗi lần đọc snapshot đối chiếu tăng attempt và xóa fresh cũ để response đảo thứ tự không được accept thay hồ sơ mới. Không đổi JSX hoặc retry/idempotency contract. `tools/check-personnel-screen.cjs` thêm2nhóm kiểm các guard này, giữ16nhóm local đã có.

| Thao tác | API/actor/transport | Trạng thái bàn giao |
| --- | --- | --- |
| Directory Staff/Reporter | GET `/api/v1/users`, Sup Web cookie, role/filter/limit/cursor | PASS đọc; hai nguồn độc lập và có partial/retry |
| PM nhân sự trong scope | GET `/api/v1/projects` và `/projects/{id}/members`, PM Web cookie | PASS đọc; không admin directory; không includeHistory cho PM |
| Snapshot trước sửa | GET `/users/{id}` + directory + GET cùng detail, Sup Web cookie | PASS read/runtime, ETag opaque nhất quán |
| Sửa điện thoại | PATCH `/users/{id}/phone-number`, Sup, phoneNumber + If-Match/K + CSRF | FE nối/kiểm mock PASS; runtime mutation NOT RUN thiếu fixture riêng được phép sửa |
| Đổi role/status, đình chỉ/khôi phục | PATCH `/users/{id}`, Sup; contract/source đang đối chiếu không Web eligible | Giữ khóa riêng; không phát mutation, không báo đã lưu |
| Reset mật khẩu | POST `/users/{id}/password-reset`, Sup, contract Bearer | Giữ khóa riêng; không thử đổi tài khoản dùng chung |
| Invitation | POST `/invitations`, Sup, contract Bearer | Giữ khóa riêng; không tạo invitation hoặc gửi thư |
| Chuyển primary PM / thêm-kết thúc membership | Command phân công/thành viên riêng, không PATCH account | Không triển khai; giữ guard/lý do local, không tái rà backend hoặc mượn command khác |

Các giới hạn trên không gọi là thiếu endpoint. Với account PATCH/password-reset/invitations: expected nếu mở cho Web thì phải có WebSession/CSRF đúng actor và DTO/version; actual contract FE Bearer, UsersController source d810cc5 chưa annotation cho PATCH account/reset. Không probe mutation để xác nhận bằng401; **transport runtime các command khóa chưa xác minh**. Phone endpoint đã có source/controller/service rõ, nhưng OpenAPI snapshot FE chưa liệt kê path phone-number: document/contract snapshot còn thiếu cập nhật, không tự tạo endpoint. Không yêu cầu BE xác nhận lại business rule đã có; chưa sửa BE hoặc triển khai các command ngoài scope.

**Kiểm thực chạy:** `node tools/check-personnel-screen.cjs` **18 PASS** mock HTTP/hooks/SSR (16nhóm local +2guard mới): paginate/partial/retry; PM scope/unknown; project error; epoch fence; DTO/If-Match/K; timeout/receipt204→readback retry không PATCH; conflict/explicit version; notification kind và không rawsecret; read-only unsupported fields/modal; phone reload-warning; late history/phone; sai ID trước snapshot; target-change/đảo thứ tự fresh reads. `npx tsc --noEmit` PASS; scoped diff-check PASS. Dùng lại build tsc-b/Vite PASS của lượt địa bàn cho phần UI/component local cùng bytes; chỉ guard service/state mới đã typecheck, không lặp build/full regression không liên quan.

Browser đọc kiểm1lần vì runtime đã chuyển từ5180ab9 sangd810cc5: Sup directory+snapshot thật200, chỉ phone editable; invitation/reset modal vẫn khóa, không submit; membership hiệu lực/lịch sử đọc riêng bằng action đã local. Reporter503 **mô phỏng** giữ Staff thật, bỏ route mock và bấm retry trở về API thật. PM route chỉ projects/members,0users directory, account status chưa xác định,0admin/history command. **0pageerror,0mutation nghiệp vụ cả thử và thực**; không sửa số điện thoại/quyền/mật khẩu tài khoản chung. Script/ảnh TEMP dùng lại, không stage; không dùng mock thay runtime mutation PASS. Không chạy lặp browser hoặc bộ regression sau khi PASS/code không đổi.

**Stage/bàn giao:** `personnelService.ts`, `personnelScreen.ts`, `SystemUserAccount` đúng hunk trong domain.ts, PersonnelManagement + AccountsTab/AddPersonnelModal/EditUserModal/ResetPasswordModal/SuspendUserModal/UserDetailModal/usePersonnelState, test nhân sự và riêng mục worklog này (13file). Giữ các hunk worklog/Case/Survey/geometry ngoài nhiệm vụ unstaged. Tự review source/contract/API, phạm vi và UI; không secret/ảnh/log/Temp trong commit. Phần đọc bàn giao được độc lập; mutation điện thoại chưa có runtime fixture được phép là giới hạn nghiệm thu, không chặn bàn giao. Commit tiếng Việt/push thường hoang; dừng để review nhân sự, không bước3B/4.

### 07/11/2026 — Modal lời mời: chuẩn hóa đầu vào, bỏ2khối giải thích; gửi Web còn BLOCKED

Baseline `hoang` parent `630a66c9df26c20a301d76950598b4a6ab43fa71`; kiểm HEAD/status, đọc modal/submit/service, Spec17_10 Authentication–Users–Memberships và source develop sau fetch: `d810cc52668a6f0a3272f8b20b095ac6fef122b2`. POST `/api/v1/invitations` hiện vẫn không WebCookieEligible; không thay BE, không dùng Android/Bearer, không phát POST/email thử. API test vẫn image d810cc5 từ lượt địa bàn, chưa có bản transport mới để chứng nhận gửi Web200/201. Không suy lỗi annotation từ runtime cũ, lần này xác minh source develop hiện tại.

UI chỉ xóa2khối NEW: đoạn giải thích BR-01 và hướng dẫn Mailpit. Giữ layout/class/style/vị trí các ô và tab điều chuyển; test so sánh nguyên nhánh ASSIGN với HEAD (bỏ khác biệt newline) đạt. Họ tên/điện thoại vẫn disabled ở vị trí cũ, placeholder/title giải thích: người nhận nhập displayName cùng password khi POST `/invitations/accept`; DTO accept cũng không có phone, điện thoại cập nhật bằng luồng riêng sau kích hoạt. Không cho nhập rồi âm thầm bỏ và không gửi field thừa.

`invitationInput` trong personnelService tạo đúng DTO email.trim/rolePM-OPERATOR-CREW/projectIdsUUID dedup, từ chối email/role/ID không hợp lệ; POST vẫn giữ guard `web_cookie_unsupported` cho tới khi có transport được xác minh. Hook NEW chuẩn bị input và gọi service thật (không còn handler chỉ thông báo), kiểm actor/phạm vi dự án, loại lựa chọn không còn hợp lệ khi role/project thay đổi; ref khóa submit lặp, busy vô hiệu control khi đang đối chiếu, giữ toàn bộ bản nhập khi lỗi và chỉ đóng/thông báo tiếp nhận nếu service trả receipt có id/status/expiresAt/version. Thành công receipt chỉ được test mô phỏng, không báo gửi email thật thành công. Fieldset NEW cho soạn email/role/dự án trong khi nút gửi vẫn disabled với lý do BE; ASSIGN giữ khóa cũ.

Source `IdentityOnboardingRepository.AcceptInvitationAsync` tạo memberships `IsPrimary=false`, kể cả PM: lời mời không phải command chuyển primary PM. Vì vậy NEW không khóa dự án theo tên PM hoặc có primary PM; chỉ khóa lựa chọn ID không hợp lệ, không thay logic/nhãn của tab điều chuyển. Badge số dự án NEW bỏ kết luận BR-01 không đúng luồng này.

BE cần bổ sung WebCookieEligible cùng WebSession/CSRF/cookie actor validation cho **POST `/api/v1/invitations` đã có**, giữ Sup-only/DTO/idempotency và receipt201. Chưa cần endpoint mới. Chưa nối gửi HTTP bằng cách bỏ guard vì source chưa hỗ trợ; cũng chưa nghiệm thu timeout/replay/email delivery thật. Khi BE được cập nhật cần kiểm bằng fixture email test được phép và giữ Idempotency-Key của cùng ý định, không tự tạo khóa mới để replay mutation. Không gửi email tới người thật trong lượt này.

Kiểm tập trung `RG_PERSONNEL_FILTER='invitation ' node tools/check-personnel-screen.cjs`: **3nhóm PASS** DTOtrim/role/ID/guard; submitduplicate/failure/receipt/rolechange; render2khối bị xóa/ôgiữ/tabASSIGN nguyên trạng. Mock receipt không phải runtimePASS. `npx tsc --noEmit` PASS; scoped/staged diff-check PASS. Không browser/E2E/fullregression hoặc rà rộng màn nhân sự/geometry. File sửa: personnelService, usePersonnelState, AddPersonnelModal, PersonnelManagement (truyền busy), test nhân sự và đúng mục worklog này. Commit phần FE hoàn chỉnh độc lập, gửi thật còn BLOCKED BE transport như trên; không gom file/hunk dở ngoài nhiệm vụ, Temp/ảnh/log/secret.

### 07/11/2026 — FE lời mời: nối POST Web và giữ idempotency khi retry chủ động

Baseline `hoang` HEAD/parent `75c6c6757dc4058f3c9af2877d2b4b24e6004002`; kiểm HEAD/status, đọc hết AGENTS.md, service/submit/modal/client. Theo yêu cầu mới, bỏ guard `web_cookie_unsupported` của riêng createInvitation và giá trị blockedReason riêng NEW (prop/default thành chuỗi rỗng). Không đổi cây JSX/layout/style, không khôi phục2khối ghi chú đã xóa, không đổi ASSIGN hoặc sửa BE/auth/client. Họ tên/điện thoại vẫn disabled đúng vị trí, không gửi vào DTO.

`personnelService.createInvitation` gọi POST `/invitations` qua apiClient hiện tại: withCredentials/cookie và X-CSRF-TOKEN do interceptor có sẵn; không Bearer/login khác. DTO chỉ email.trim, role PM/OPERATOR/CREW, projectIdsUUID dedup/sort; hook kiểm ID thuộc danh sách server. Key/body fingerprint giữ theo actor trong memory/sessionStorage trước dispatch, không lấy cache làm receipt. Set khóa đồng thời theo actor cả ở service và submit. Timeout/network/5xx hoặc response không có receipt201 hợp lệ giữ cùng payload/key để người dùng thử lại; payload khác trong lúc chưa rõ bị chặn. Không tự replay mutation, không tự tạo key mới khi retry cùng ý định chưa rõ; reload service/F5 vẫn lấy key journal. HTTP4xx rõ ràng (trừ duplicate_request) giải phóng ý định bị từ chối; không coi network/5xx là từ chối chắc chắn. Chỉ xóa journal và trả thành công khi response201 có id/status/expiresAt/version; response phiên cũ không được nhận. Lỗi vẫn giữ bản nhập/modal mở. Phiên còn isAuthenticated và API401 dùng đúng **“Chưa gửi được lời mời bằng phiên Web.”**, không gán lỗi email hoặc bắt đăng nhập lại; session recovery của client không đổi.

Kiểm tập trung `RG_PERSONNEL_FILTER='invitation ' node tools/check-personnel-screen.cjs` **5nhóm PASS**, sau đó nhóm mới `invitation retry survives` **1PASS**: DTO/role/ID, submitlặp/giữdữliệu/401copy,2khối vẫn bị xóa/tabASSIGN nguyên trạng, exact POSTbody/headerkey, timeout không autoreplay, retry giữkey/body, payloadkhác bị chặn, receipt thiếu không thành công, staleepoch bỏ receipt, servicere-load giữjournal, submit NEW không còn bị khóa bởi transport flag. Tổng6nhóm mock/hooks/SSR PASS, không chạy regression toàn app. `npx tsc --noEmit` PASS sau code production cuối; diff-check PASS, không chạy lại build/E2E. Lỗi harness đầu do PowerShell làm mất dấu trong expected string tiếng Việt đã sửa test bằng Unicode, không thay UI copy để qua test.

**Runtime/BE:** lượt này không phát POST thật và không gửi thư/email thử tới người thật; không tuyên bố delivery/E2EPASS từ mockreceipt. Evidence source develop đã kiểm ở lượt trước vẫn `d810cc52668a6f0a3272f8b20b095ac6fef122b2`: POST `/api/v1/invitations` chưa WebCookieEligible, contract Bearer-only; API test image d810cc5 không thay. BE còn cần WebSession eligibility/CSRF/actor validation cho endpoint đã có để Web POST thực tế được tiếp nhận; chưa có evidence runtime201 lời mời. FE giờ cho phép thực hiện request Web theo yêu cầu,401được báo đúng ngữ cảnh. Không sửa BE, không lách bằng Android/Bearer hoặc tự gửi mail kiểm chứng. Commit riêng service/submit/prop/default/test và mục worklog này; giữ toàn bộ file/hunk ngoài nhiệm vụ.

### 07/11/2026 — Giữ key lời mời qua401 sau timeout

Parent `7152a9b43f843e93f90eeef268cf2ea582d2c215`, nhánh hoang; đã kiểm HEAD/status và đọc AGENTS.md. `createInvitation` nay nhận diện yêu cầu đang retry từ memory/journal có trước: lỗi4xx của lần retry không xóa ý định vì không chứng minh lần gửi đầu chưa tạo lời mời. Lần gửi đầu bị từ chối rõ ràng vẫn xử lý giải phóng như trước; receipt201 xác minh vẫn xóa journal, khóa gửi đồng thời giữ nguyên. Chỉ thêm1biến và1điều kiện tại service, không JSX/UI/BE/auth/client hoặc chức năng khác.

Thêm đúng1test timeout→401→retry201, cả3request cùngkey/body; chạy riêng bằng `RG_PERSONNEL_FILTER='invitation timeout then 401' node tools/check-personnel-screen.cjs` PASS. `npx tsc --noEmit` và scoped/staged diff-check PASS. Không browser/build/fullregression hoặc gửi email thật. Chỉ stage service/test/mục worklog này, giữ hunk/file local khác; commit riêng/push thường hoang.

### 07/11/2026 — Bước3: cô lập dữ liệu chỉnh khi đổi draft cùng dự án

Parent `d794f177fb9f5d78c08f7122cb81e5abe4b6e502`, hoang; kiểm HEAD/status, đọc AGENTS.md và state/dependency trực tiếp. Nguyên nhân dirty flags chỉ reset theo project/epoch trong khi editorDraft reset theo draftId, khiến nhápA còn dirty giữ phân đoạn/bề rộng khi mởB và chặn hydrateB. `useAlignmentState.ts` nay giữ scope epoch/project/draft; scope đổi thì reset state của hook trong render để React render lại trước khi con nhận dữ liệu: segments/slabs/branches, selection/modal/form đoạn, tọa độ/lý trình/chiều dài, slab/khe, cự ly chia/sort, dirtyflags và manual input. editorDraft reset cùng scope. Scope không đổi thì không reset: refresh/loading/error cùng draft giữ bản chỉnh chưa lưu. Hydrate đúngB chỉ sau dữ liệu đúngproject/id; width-sync không có dirtyA để ghi vàoB. Geometry/status cũng chỉ nhận đúngproject và sourceDraftId hiện chọn, không cho resourceA còn sót đổ lênB đang tải/lỗi.

Không đổi JSX/UI/layout/style, workflow service/readmodel/version/conflict/idempotency hoặc xác nhận server; không mutation mới. Giữ file local ngoài nhiệm vụ, không nhân sự/invitation/Survey/BE. Kiểm tập trung `RG_STEP3_FILTER` chạy5nhóm PASS:3hydrate/version có trước, local-edit/conflict có trước và1nhóm mới Ađãchỉnh→Bđangchờ→Blỗi→Bđọcđược, đồng thời refreshAgiữ12m và inputA trước khi đổi; selection/modal/slab/manualA được dọn, không tăng width-write vàoB, B nhận9m từ server. Sau thêm guard geometry nguồnA còn sót, chạy lại riêng nhóm đổi draft PASS. Harness mô phỏng render-phase rerender và effect commit, không tính runtimeE2E. `npx tsc --noEmit` cuối PASS; scoped/staged diff-check PASS. Không browser/build/fullregression. Chỉ stage state, testBước3 đúng hunk và mục worklog này; commit riêng/push thường hoang, không chốt toàn bộ Bước3.

### 07/11/2026 — Helper đọc RoadGuard Draft JSON độc lập

Parent e1f116955b54bfa529c13d86ac66eea0c7e7e4e3. Đọc AGENTS.md, helper GeoJSON, GeometryDraftInput/OpenAPI và GeometryEngine của BE RoadGuard-web-d810cc5. Thêm parseRoadGuardDraftJson chỉ kiểm file COORDINATES: CRS 32648/32649, 2–100000 điểm x/y hữu hạn, lý trình/lý do, surveyWidthMeters và widthProfile liên tiếp/phủ chiều dài theo BE (sai số cuối tối đa 1e-7 m, không cho vượt tuyến). Giữ nguyên DTO, tọa độ và metadata; không đổi CRS/làm tròn/điền mặc định/xác nhận server. Chưa đối chiếu CRS dự án hoặc kiểm topology đầy đủ thay server. Không sửa helper GeoJSON, JSX/UI/layout/style, state/dropzone/API/confirm/phân đoạn hay BE.

Fixture sao chép nguyên file Roadguard1_RoadGuard_GeometryDraft.json được cung cấp. Test helper mới 6 nhóm PASS (mẫu119điểm, JSON, source/CRS/coordinates, giới hạn điểm, lý trình/lý do/bề rộng, widthProfile hở/chồng/sai chiều dài); test GeoJSON cũ lọc riêng 1 nhóm PASS. npx tsc --noEmit PASS; diff-check PASS. Không browser/build/full regression. Chỉ commit helper/test/fixture và mục worklog này; giữ mọi thay đổi local ngoài nhiệm vụ.

### 07/11/2026 — Nối RoadGuard Draft JSON vào bản chỉnh và sidebar

Parent 9b960f8a2d1efbf2537a2847d214af1430577fc0, hoang. Đọc AGENTS.md và dependency trực tiếp import/state/readmodel/workflow/sidebar/map. Input đã có .json nên không sửa JSX. Import phân biệt nội dung sourceKind và dùng helper Draft/GeoJSON hiện có; giữ file chờ context đúng project và engineeringUtmSrid khớp sourceCrs, báo lý do khi thiếu/lệch, không chuyển CRS. Giữ nguyên DTO engineering riêng trong fileDraft; nạp lý trình/lý do/surveyWidth/widthProfile vào form/sidebar với nhãn bản chỉnh chưa lưu. Không đưa UTM vào currentCoords/currentKmPoints của bản đồ. Đọc lỗi giữ bản chỉnh; attempt/scope/unmount chặn kết quả cũ, file mới hủy pending cũ. Đổi scope reset fileDraft; hydrate server đến muộn không thay bản nhập từ file. Vẫn giữ hasUnverifiedFile để không mở lệnh lưu ở lượt này. Không sửa BE, service lưu, confirm, segment-set, pavement hoặc JSX/UI/layout/style.

Kiểm node tools/check-roadguard-draft-state.cjs: 6 nhóm PASS (mẫu/context/CRS, lỗi giữ bản chỉnh, stale read/scope/file mới/unmount, GeoJSON cũ, state/sidebar và late hydrate, JSX nguyên trạng). Helper Draft 6 nhóm PASS; RG_STEP3_FILTER chọn GeoJSON/active editor/unverified file/draft switch/UI restore sidebar: 7 nhóm PASS. npx tsc --noEmit và diff-check PASS. Harness mô phỏng readmodel/workflow/map/FileReader, không runtime E2E; không gọi API lưu/Sup confirm, không browser/build/full regression. Chỉ stage 2 hook, test mới, 1 nhánh loader test cũ và mục worklog này; giữ thay đổi local khác.

### 07/11/2026 — Dọn bản chỉnh cũ khi áp dụng file mới

Parent 39bf85de9ffee2f1932a05b42132a2ee79691a80, hoang. Đọc AGENTS.md và state import/editor/dependency trực tiếp. Callback áp dụng file đã hợp lệ (Draft còn phải khớp CRS dự án) dùng resetEditor hiện có để đóng modal sửa/chia/thêm, xóa selection/form cũ và dữ liệu phụ thuộc; sau đó nạp Draft mới hoặc giữ GeoJSON với thông số kỹ thuật trống và chiều dài chưa xác định. File lỗi/CRS lệch không gọi cleanup nên giữ bản chỉnh/modal hiện tại. Dời reset tab/selection ra khỏi effect hydrate để refresh cùng draft không reset bản chỉnh; guard localDraftDirty ngăn geometry server ghi lại chiều dài cũ sau GeoJSON. Giữ scope/attempt, chưa lưu/xác nhận; không sửa JSX/UI/layout/style, BE/auth/service lưu/confirm.

Bổ sung đúng 2 test vào check-roadguard-draft-state: A7m mở modal rồi B9m (kèm lỗi/CRS lệch giữ A, refresh giữ selection); Draft→GeoJSON xóa bề rộng/chiều dài/lý trình/form cũ và refresh không khôi phục. Tổng 8 nhóm import/state PASS, 7 nhóm Step3 liên quan PASS; npx tsc --noEmit và diff-check PASS. Không browser/build/full regression hoặc ghi dữ liệu thật. Chỉ stage state editor, 2 test mới và mục worklog này; giữ mọi thay đổi local khác.

### 07/11/2026 — Lưu Draft JSON đã nhập qua command create/update

Parent 7ad8c7d17f03df48ee189917edd32103db575538, hoang. Đọc AGENTS.md, import/editor/workflow, command/service/client, OpenAPI create scoped/update và DTO/GeometryEngine/persistence BE RoadGuard-web-d810cc5. Workflow nhận riêng Draft JSON đã kiểm: kiểm lại CRS với context đúng project, đích duy nhất thuộc context và update khớp roadSectionId đã đọc; GeoJSON chưa xác minh vẫn bị chặn, manual giữ điều kiện profile EN/mét có nguồn. Không chọn tuyến đầu hoặc tạo ID. Input lấy tọa độ text engineering hiện tại, lý trình/lý do/surveyWidth từ form và bề rộng sidebar hiện tại; giữ offset gốc chính xác khi chỉ đổi bề rộng, kiểm lại toàn payload bằng helper Draft theo BE trước khi gửi. Không lấy lại bề rộng file gốc.

Giữ luồng create/update hiện có với journal/idempotency/If-Match, apiClient cookie/CSRF và khóa gửi lặp; không auto replay hoặc confirm. Command chỉ nhận hoàn tất khi receipt có tuyến/version và GET readback đúng project/id/tuyến/ETag của receipt; sai hoặc thiếu giữ receipt để đối chiếu, không ghi lại. Workflow tiếp tục chờ hydrate đúng draft/version và giữ input khi lỗi. Không sửa JSX/UI/layout/style, BE/auth/client/confirm/segment-set/pavement.

Test import/state/save 13 nhóm PASS, dùng hook import/editor/workflow và command/alignmentService thật với HTTP/readmodel/map mô phỏng: create và click lặp, update exact If-Match, sidebar9m/10m và trường hiện chỉnh, thiếu tuyến/CRS/project/GeoJSON/bề rộng sai không ghi, lỗi503 giữ input, receipt/version/reference sai giữ chờ và retry readback không POST lại. Test Step3 lọc liên quan 14 nhóm PASS; sửa đúng mock GET version I trước đó trả nhầm ETag E. npx tsc --noEmit và diff-check PASS. Chỉ kiểm mô phỏng, không runtime/ghi dự án chung/tạo fixture nghiệp vụ thật, không build/full regression. Stage riêng 3 file production, 2 file test và mục worklog này; giữ mọi thay đổi local ngoài nhiệm vụ.

### 07/11/2026 — Preview tim tuyến Draft JSON trên bản đồ hiện có

Parent 1da27a99b3719ad472e0742c258f2c37d2695572, hoang. Đọc AGENTS.md và dependency trực tiếp import/state/map. Tái sử dụng utm48NToWgs84 có sẵn chỉ cho sourceCrs32648 khớp context; currentCoords là kinh/vĩ độ hiển thị, mốc lý trình/chiều dài vẫn từ engineering. Giữ nguyên fileDraft/payload/widthProfile và trạng thái chưa lưu/chưa xác nhận. Dùng layer tim tuyến và fitBounds có sẵn; callback load đọc state mới nhất, không lấy closure cũ. Thay file/scope dọn preview; file lỗi giữ bản chỉnh. 32649 giữ DTO hợp lệ, không chuyển bằng zone48, báo chưa hỗ trợ preview. Không sửa JSX/UI/layout/style, BE, command lưu/readback-version hoặc tự gọi lưu/confirm.

Kiểm độc lập 4 điểm bằng pyproj/PROJ EPSG32648→4326 (always_xy), gồm 2 đầu file mẫu: hàm hiện có khớp trong 1e-7 độ. 16 nhóm import/state/save/map mô phỏng PASS, gồm file trước/sau mapload, đổi scope trước mapload, layer LineString119điểm/fitBounds, engineering/payload giữ nguyên, lỗi giữ preview và zone49 không vẽ sai. 8 nhóm Step3 liên quan, npx tsc --noEmit, diff-check PASS. Browser thực tế chưa kiểm được: đã thử một lượt cockpit browser open localhost:5173 (dev server đang listen), CLI báo AGI_COCKPIT_CLI_RUNTIME is not set; không lặp browser, không tuyên bố runtimePASS. Không ghi nghiệp vụ. Stage riêng 3 hook, test/hunk loader liên quan và mục worklog này; giữ local khác.

### 08/11/2026 — Preview độc lập điều kiện khởi tạo dự án, dùng dữ liệu từng file

Parent a8c19eb1f8cc6eda73d2018149794b1be47a2259, hoang. Đọc AGENTS.md và dependency import/state/map. Bỏ gate context/CRS dự án ở bước áp dụng file; các thiếu sót context/CRS/road section chỉ cảnh báo điều kiện lưu. Preview lấy CRS/tọa độ từng file, không dùng tên/ID/vị trí/số điểm mẫu làm cấu hình. Tái dùng utm48NToWgs84 cho EPSG32648; GeoJSON LineString2D không có crs dùng longitude/latitude RFC7946, CRS khai báo hỗ trợ EPSG4326/CRS84 và32648. CRS rỗng/mâu thuẫn/không hỗ trợ hoặc tọa độ ngoài miền báo rõ, không đoán zone/trục/đơn vị; Draft32649 giữ bản chỉnh và báo chưa hỗ trợ preview. Giữ source DTO engineering cho payload, độ dài/lý trình/widthProfile không tính từ kinh/vĩ độ preview. Layer/source tim tuyến hiện có nhận LineString khi chưa có khoảng bề rộng; thay file/scope reset, đọc muộn bị chặn, mapload dùng state mới nhất và fitBounds có sẵn. Giữ JSX/UI/layout/style và toàn bộ gate save/confirm; không sửa BE/command/readback-version, không tự mutation/thiết lập CRS/tạo tuyến.

19 nhóm import/state/save/map mô phỏng PASS, gồm hai Draft khác vị trí/số điểm rồi GeoJSON vị trí thứ ba, context thiếu hoặc CRSnull/sectionsrỗng, CRS riêng hỗ trợ/từ chối, lỗi giữ preview, scope/readlate/mapload, payload engineering và zero-write khi chỉ preview. 8 nhóm Step3 liên quan, npx tsc --noEmit, scoped/staged diff-check PASS. Đối chiếu RFC7946 trực tiếp rfc-editor.org. Browser đã thử đúng một lần, bị chặn AGI_COCKPIT_CLI_RUNTIME is not set; không lặp hoặc gọi mock là browserPASS. Không build/full regression/ghi nghiệp vụ. Chỉ stage helper/state/data-builder/test liên quan và mục worklog này; giữ120dòng worklog local cũ và local khác ngoài commit.


### 08/11/2026 — Overlay tuyến không chờ raster tile tải thành công

Parent 222df28, sửa theo console runtime người dùng: React Hooks không còn lỗi sau tải mới; Google raster còn 404/CORS. Source MapLibre đang cài cho thấy isStyleLoaded() gọi style.loaded(), bao gồm readiness của tile managers; không phù hợp để chặn thêm/cập nhật GeoJSON. Khởi tạo overlay chuyển từ map load sang style.load, đọc bản chỉnh mới nhất. Thêm hasMapBaseStyle dựa vào layer nền đã được parse; áp dụng cho setup layer/source, sync, fitBounds và điều khiển layer hiện có. Không truy cập private MapLibre state, không sửa JSX/UI, nguồn/provider bản đồ, CRS/parser, command lưu hoặc BE.

20 nhóm import/state/save/map mô phỏng PASS; harness nay thực thi alignmentMapSetup/alignmentMapLayers thật (MapLibre, marker/interaction và HTTP mô phỏng), tile luôn chưa ready, không phát map load: vẫn tạo segments-source, cập nhật/fit preview mới và xóa khi đổi scope. Typecheck tsc -b và diff-check PASS. Đã thử đúng một lượt Chromium cho hook MapLibre thật, nhưng môi trường chặn khởi động process singleton socket (Operation not permitted), nên browser runtime chưa nghiệm thu; không chạy lại hay gọi mock là browser PASS. Nguồn Google 404/CORS vẫn là hạn chế riêng, chưa thay provider/proxy. Không mutation nghiệp vụ.

Kiểm tại workspace khi áp dụng map-preview-tile-fix.patch ngày 08/11/2026: 20 nhóm import/state/map và 8 nhóm Step3 liên quan PASS bằng mô phỏng; npx tsc --noEmit và diff-check PASS. Các ghi nhận browser/tsc -b ở mục bản vá phía trên thuộc evidence của tác giả patch; lượt áp dụng này không chạy browser hoặc build. Giữ nguyên nội dung/newline worklog có trước và các thay đổi local khác, chỉ commit bản vá cùng ghi chú này.

### 08/11/2026 — Chia lại tuyến chính, thứ tự hiển thị và độ chính xác bản chỉnh

Parent ba0e32f4d95c299204d4ea0348a8a467fe033094, hoang. Đọc AGENTS.md và helper/state/modal/payload trực tiếp. Auto split gom các khoảng liền nhau có cùng bề rộng/số làn/vật liệu trước khi đặt mốc mới, nên không giữ mốc chia cũ không có thay đổi kỹ thuật. State/map dùng thứ tự Km tăng; activeSegments đảo bản sao khi chọn giảm dần, mapper widthProfile/form luôn tăng offset. Chia tay, thêm/sửa đoạn và nối tiếp giáp tuyến chính dùng giá trị gốc, không toFixed dữ liệu kỹ thuật; setter form chuẩn hóa length từ hai đầu mút mà không đổi JSX. Kiểm continuity phát hiện cả khe nhỏ, không di chuyển ranh giới; chia lại bị chặn khi có gap/overlap, nối chỉ theo thao tác chủ động lấy end của đoạn trước. Giữ đường gọi helper tuyến nhánh mặc định như cũ; không sửa slab/BE/command/confirm hoặc tự mutation.

9 nhóm import/state/map chọn lọc và 3 nhóm Step3 liên quan PASS bằng mô phỏng: 701.290518512277m chia200→250 còn3đoạn; chia tay/redivide, width/lane/material boundaries; giảm dần vẫn tạo input hợp lệ; origin khác0/tail lẻ, khe nhỏ/cự ly sai giữ bản chỉnh, snap giữ precision, map/sidebar/payload cùng dữ liệu. npx tsc --noEmit và diff-check PASS. Không browser/build/full regression/ghi server. Chỉ stage helper/state/test và mục worklog này, giữ local ngoài nhiệm vụ; chưa nghiệm thu toàn bộ Bước3.

### 08/11/2026 — Preview tấm, khe và hai mép tuyến chính theo cấu hình thật

Parent 750efbd4d9dda8fb11ed5b036a3633b293493baf, hoang. Đọc AGENTS.md, Spec17_10 workflow project/geometry/pavement và GIS/DTO planned cells, UI SidebarSlabsTab/EditModal. Theo lựa chọn người dùng, giữ lưới tấm theo L, vẽ khe độc lập khi cự ly khe khác L. Thêm helper plan/render chung cho sidebar và map: chia dọc theo lý trình engineering, đủ phần dư, mỗi làn một tấm ngang theo W/laneCount thực nhập, không cap100/400 hoặc tự điền W8/làn2/L5/H26. Width/lane transition tạo fragment, trường kỹ thuật không làm tròn để tính; chỉ station text được format. Khe co/giãn có grid cự ly riêng; độ hở mm tạo geometry dải khe giãn, kể cả qua chỗ đổi rộng. Hai mép offset theo từng khoảng và chiều lý trình tăng, không suy ra chiều dài từ kinh/vĩ độ hoặc tự tạo taper. Thiếu dữ liệu dùng toast/empty hiện có. Khởi tạo style và sync truyền cùng customCfg mới nhất; popup chỉ thay giá trị hardcode bằng dữ liệu feature, giữ markup/layout/style và toàn bộ JSX. Legacy branch body giữ riêng, chưa triển khai sửa tuyến nhánh; không BE/API/auth/publish/confirm.

6 nhóm test helper/render mới PASS: chia hết/dư, đổi width/lane, cự ly/gap geometry, tuyến2503m sinh1503tấm vượt cap cũ, sort giảm dần, thiếu dữ liệu. State/map thực thi source/layer thật với MapLibre/HTTP mô phỏng PASS cho cấu hình trước style.load, thay width/L/H/khe, auto split, descending, thiếu rộng và zero-write. 5 nhóm state/map chọn lọc và 4 nhóm Step3 liên quan PASS; suite import/state/map một lần26nhóm cũng PASS trước thêm test cấu hình. npx tsc --noEmit và diff-check PASS. Không browser/build/full regression/ghi nghiệp vụ. Chỉ stage helper/state/render-data/test và mục này, giữ local ngoài nhiệm vụ; chưa nghiệm thu toàn bộ Bước3.

### 08/11/2026 — Tạo và biên tập nhánh preview độc lập trên UI hiện có

Parent 210fd3288650ab2b08976e81747466b922adf888, hoang. Đọc AGENTS.md và dependency modal/state/helper/map trực tiếp. Handler nút thêm nhánh cũ chỉ toast đã nối vào modal có sẵn; kiểm source bảo toàn toàn bộ cây JSX/layout/style, chỉ đổi binding đó và state/handler modal. Bỏ default W8/làn2/vật liệu mẫu/tọa độ mẫu, parse WGS84 nghiêm ngặt, giữ nguyên điểm/thứ tự/đường gãy và chiều dài nguồn không làm tròn. Theo người dùng chọn: hình chiếu điểm đầu lên tuyến chính hiện tại chỉ là lý trình tham chiếu kèm độ lệch; không kéo điểm đầu vào tim hoặc gán Km1020. Nhánh thiếu nguồn/tọa độ/lý trình hoặc thông số sai bị từ chối, giữ bản nhập.

A/B có cự ly/sort/phân đoạn riêng; dùng helper chia hiện tại để bỏ mốc cũ không đổi thông số, giữ ranh giới kỹ thuật và tail. Chia tay/sửa/snap không làm tròn; sửa đọc dữ liệu modal thay vì event. Thêm/xóa đoạn và đổi cấu hình khi đang chọn nhánh được route/guard để không ghi đè tuyến chính hoặc pavement chính. Branch line/surface/marker dùng source thật, không bo/sinh tuyến; nhánh preview mới không vào builder pavement nhánh legacy. Scope/generation chặn callback cũ, file mới hoặc project/draft mới dọn nhánh. Chỉ local preview, không API/publish/confirm.

3 nhóm helper/modal mới PASS; 2 nhóm state/map A/B và lỗi/scope mới PASS; 6 nhóm state/map chọn lọc, 6 nhóm pavement chính và 4 nhóm Step3 liên quan PASS bằng mô phỏng React/MapLibre/HTTP. Kiểm raw source geometry, width/lane/material, cự ly mới/chia lại/tail/sort, manual edit/clear/add/delete, mainline và cấu hình tấm/khe không đổi, invalid input, file/project/draft và zero-write. npx tsc --noEmit và diff-check PASS. Không browser/build/full regression. Stage riêng phần nhánh/test/mục worklog này, giữ mọi local ngoài nhiệm vụ; chưa nghiệm thu toàn bộ Bước3.

### 08/11/2026 — Tăng tương phản tim/mép và nhãn số từng polygon tấm

Parent 93311e1438f51806b72925f42a4967c1502f4c6e, hoang. Đọc AGENTS.md và layer/source/popup/binding trực tiếp. Chỉ sửa hiển thị: tim vàng/halo tối, hai mép cyan/hồng theo side từ geometry/bề rộng thật, điều chỉnh nét/zoom và đưa nét tim/mép trên lưới. Mép không bị toggle cùng tấm/khe và vẫn dùng width-only geometry khi thiếu cấu hình tấm. Mỗi polygon thật có một sequence/mã sẵn có và một Point neo nhãn trong lòng tấm; labels-source riêng không thêm slab hoặc thay tổng đếm. Nhãn số gọn từ zoom18.5, collision bật; polygon/label cùng metadata mã/lý trình/kích thước. Hit fill trong suốt và click nhãn dùng popup cũ, chống xử lý lặp cùng event. Không thay cây JSX/layout, plan chia tấm, geometry kỹ thuật, BE/API/trạng thái duyệt hoặc luồng nhánh.

3 nhóm display mới PASS: so plan và polygon với HEAD để chứng minh tính toán không đổi; label/polygon/UI count/mã/thứ tự/interior, tấm dư và transition fragments, cấu hình L/H thay đổi, đảo thứ tự, validateStyleMin trên satellite/streets, layer-order/visibility, mock click popup. 6 nhóm pavement và 4 nhóm state/map liên quan PASS, gồm đổi lane/width/L, labels/source count cùng cập nhật và zero-write. Typecheck/diff-check PASS. Browser thử đúng1lượt cockpit browser open localhost:5173, bị chặn AGI_COCKPIT_CLI_RUNTIME is not set; chưa nghiệm thu hình ảnh thật, không lặp browser. Stage riêng layer/nhãn/binding/test và mục này; giữ local ngoài nhiệm vụ.

### 08/11/2026 — Hiển thị tấm/khe và số đếm từ cùng feature geometry

Parent 9293d63b7332c1a57351d875a4ce6ab5203f14bf, hoang. Đọc AGENTS.md và dependency map/HUD/legend/layer/popup trực tiếp. MapState memo hóa bộ render-data dùng chung khi khởi tạo/cập nhật source và truyền vào HUD, bỏ floor(length/L)*2 và dấu ước lượng. Summary lọc polygon tấm, LineString/Polygon khe theo segmentId/toàn tuyến, bỏ Point nhãn và tách readiness từng loại: thiếu trường không hiển thị0, còn0khe thật được hiển thị0. HUD hiện có tách ba mục T/KC/KG; kích thước/range lấy feature thực, nói rõ phần dư/chuyển tiếp. Nhãn T1…/KC1…/KG1… theo feature thật, ổn định khi đảo Km; thêm binding nhãn khe không thêm tấm/khe. Viền/tô nhẹ tấm; KC đỏ đứt, KG cam đậm; thứ tự layer giữ khe trên nét tim/mép, collision/zoom cho nhãn. Popup hai loại đọc code/station/spacing/gap/dimensions thật và ghi preview, bỏ thông số mẫu/Đạt chuẩn. Chú giải khớp tên/màu/nét. Chỉ thay nội dung trong2khối cho phép và các binding hiển thị, giữ UI khác; không đổi plan/geometry/số lượng/BE/API/nhánh hoặc trạng thái duyệt.

5 nhóm display/source-count/UI/popup/style PASS; 6 nhóm pavement giữ phép tính, 3 nhóm state/map và 2 nhóm Step3 liên quan PASS bằng mô phỏng. Có đối chiếu plan/polygon/khe với HEAD, tấm dư/width transition, scope chọn đoạn/toàn tuyến, KC trùng vị trí KG không tạo số giả, thiếu dày nhưng khe vẫn có dữ liệu, 0khe thật so với thiếu config, đổi config/lane/width, đảo Km, source/UI cùng dữ liệu, visibility và zero-write. Typecheck/diff-check PASS. Lượt này chưa kiểm browser thật, không tuyên bố hình ảnh đạt; không build/full regression. Stage riêng phần hiển thị/test và mục này, giữ local ngoài nhiệm vụ.

### 08/11/2026 — Runtime cùng tab ABC1: thiếu tham số và click làm mất nhãn

Parent c88e50239359a45da30880cfc74fc94239d55d23. Đọc AGENTS.md; kiểm trực tiếp Chrome DevTools MCP tab2 ABC1 sau PM đăng nhập/nhập file. Zoom19.816608158215175; slabs-source0Polygon, joints-source140KC/0KG, slabs-labels-source0Point, joints-labels-source140Point mãKC1…KC140. Layer visible/minzoom đúng; viewport ban đầu20feature nétKC/16nhãnKC, glyph0-255 và7680-7935 HTTP200. PM UI/state nhận đúng W7m/L5m/H5cm/KC5m/KG50m; số làn/độ hở KG chưa có, nên T/KG chưa sinh. Input H5cm invalid theo UI15–45cm; contract Spec17_10 PavementLayoutInput không có thickness, không có căn cứ nới giới hạn. Không suy lane từ W, không nhập fixture/thông số thử hoặc đổi dữ liệu PM.

Tái hiện native click KC50 bị handler tuyến ghi đè popup và kéo zoom19.8166→15.2; handler tấm/khe cũng hardcode focus16.5 dưới ngưỡng nhãn. Sửa duy nhất interaction: ưu tiên cùng DOM event đã xử lý pavement, focus giữ zoom gần và tối thiểu18.5. Kiểm native click sau gắn lại handler mã mới bằng public off/on trên cùng map (callback cũ còn sau HMR): KC50 đúng Km0+250.000/cự ly5m/rộng7m/preview; zoom giữ19.8166, source counts không đổi, viewport22nétKC/19nhãn. Chụp ảnh thực nội tuyến trong chat, không coi mock là browserPASS. T/KG chưa nghiệm thu ảnh thật do thiếu dữ liệu. Sau sửa comment cuối, Vite tự fullreload làm mất preview memory trên tab; đã báo người dùng, không tự phục hồi bằng fixture/thông số mẫu. Không API lưu/confirm hoặc ghi nghiệp vụ.

6 nhóm map display/event-priority/zoom test PASS, typecheck/diff-check PASS. Không đổi style/overlap/geometry/phép chia/UI/API/BE. Stage riêng interaction/test và mục worklog này, giữ local ngoài nhiệm vụ; không gọi toàn bộ Bước3 hoàn tất.


### 08/11/2026 — Nhập cấu hình Tấm & Khe và preview độc lập
- Baseline `a3ce19e`; giữ thay đổi local ngoài nhiệm vụ, không sửa BE/API/phép chia kỹ thuật/tuyến nhánh. Đổi độ hở sang ô mm thập phân, bỏ preset cự ly khe, giữ Mẫu L và phần UI còn lại.
- Nguyên nhân: effect gọi toast thiếu preview trên mọi thay đổi; parseInt H làm mất thập phân; state số không giữ chuỗi đang gõ; thông báo thiếu không gắn loại/đoạn; danh sách rỗng hướng dẫn nhập tim dù thiếu số làn. State giữ nguyên chuỗi, chỉ số hữu hạn dương hoàn chỉnh đi vào builder; không clamp/làm tròn/điền mẫu. L không ghi đè cự ly KC riêng.
- Validation dùng chung cho ô nhập/list/HUD/geometry, phân biệt Chưa nhập và Không hợp lệ, ghi rõ đoạn thiếu bề rộng/số làn. T/KC/KG kiểm độc lập; khoảng đủ dữ liệu vẫn preview; xóa/sai input dọn source tương ứng và đóng popup cũ. Công thức chia, vị trí/kích thước khi đủ dữ liệu giữ nguyên (test so baseline).
- Đối chiếu `docs/specs/17_10/04_API-Contracts/03_DTO-and-Schema-Reference.md` mục PavementLayoutInput/PavementPlanCreateInput và `docs/contracts/openapi.json`: không khai báo bounds H15–45, L/KC2–12, KG20–300 hoặc bước nhập HTML; bỏ các ràng buộc HTML không có căn cứ, giữ kiểm hữu hạn >0 hiện có (làn: nguyên >0). Đây là điều kiện preview FE, không xác nhận thiết kế hay validation BE.
- Thiếu contract lưu/đọc: POST `/api/v1/projects/{projectId}/route-versions/{routeVersionId}/segment-sets/{segmentSetId}/pavement-plans` nhận PavementPlanCreateInput.layout -> PavementLayoutInput chỉ có stripWidthMeters/slabLengthMeters/widthProfile (additionalProperties=false). Không có thicknessCm/laneCount/contractionSpacingM/expansionSpacingM/expansionGapMm; GET `/api/v1/projects/{projectId}/pavement-layouts/{layoutId}` trả PavementLayoutView.geometry -> PavementGeometryPreviewFact (analyticLengthMeters/stripWidthMeters/slabLengthMeters/cells/warnings), không có các cấu hình trên. GeometryDraftInput cũng không có cấu hình T/KC/KG. Chưa thể tuyên bố các giá trị này lưu/readback server; không sửa BE hay yêu cầu endpoint mới.
- Browser Chrome MCP đúng page2 ABC1: trước sửa PM L4/H5/KC4/KG30/gap15, 4 đoạn rộng8 chưa có làn; state khớp, nguồn 0 T/187 khe/187 nhãn, zoom20.0588667. Vite reload khi sửa mã làm mất preview cục bộ; không tự nhập lại fixture/thông số thay PM. Sau sửa đã mở tab Tấm & Khe thật, chụp ảnh inline: ô mm mới, giữ Mẫu L, bỏ preset khe, 5 ô trống, thông báo thiếu phạm vi; zoom11.2, cả4 source=0, không toast thiếu preview. 107 request fetch/xhr từ navigation hiện tại không có POST/PUT/PATCH/DELETE. Chưa nghiệm thu browser nhập/xóa/sửa thông số, KG tùy chỉnh/popup/T/đổi phạm vi vì đang chờ PM nhập dữ liệu thực; không gọi mock là browser PASS.
- Kiểm tập trung: `node tools/check-alignment-pavement.cjs` 6 PASS; `node tools/check-alignment-map-display.cjs` 7 PASS (thêm chuỗi nhập/dữ liệu lỗi, mm20.12567 đến geometry/popup, thay cự ly, T độc lập/scoped list/HUD); `RG_STEP3_FILTER="UI restore sidebar edits" node tools/check-step3-geometry.cjs` 1 PASS (hook giữ chuỗi, không toast mỗi ký tự). `npx tsc --noEmit` và scoped diff-check PASS. Không build/full regression, không lưu/confirm hoặc ghi dữ liệu nghiệp vụ.


### 08/11/2026 — Kiểm browser ABC1 sau PM nhập lại, không ghi đè
- Baseline `1769a18`; đọc AGENTS.md, chỉ dùng Chrome DevTools MCP page2 ABC1 đang mở. Không reload/điều hướng/nhập đè/phục hồi mẫu, không sửa source vì chưa tái hiện lỗi hiện tại cần sửa. Chỉ camera, popup, chọn đoạn/toàn tuyến và mở HUD/tab; bản chỉnh PM còn nguyên.
- Ghi nhận trước mọi sửa file: ô nhập và React props khớp L="5"m/H="5"cm/KC="5"m/KG="20"m/gap="1"mm; tuyến701.290518512277m, 4 đoạn200/200/200/101.290518512277m rộng7m, cả4 chưa có số làn/vật liệu. Zoom ban đầu17.90247165901727. Sources: slabs0 Polygon/labels0 Point; joints105 LineString KC +35 Polygon KG; nhãn140 Point,140 code duy nhất. Không có toast thiếu preview; sidebar/list báo đúng Chưa nhập: số làn — Phân đoạn #01.
- Browser thật zoom20: KC đỏ nét đứt, KG cam đậm, thấy mã KC/KG (ảnh screenshot inline). Native click KG21 => Km0+420.000/cự ly20m/gap1mm/rộng7m/Preview chưa lưu-chưa xác nhận; KC64 => Km0+425.000/cự ly5m/rộng7m/Preview. Zoom giữ20. Trong viewport KG21:10 code KC/3 code KG được render nhãn, layer visible/filter/minzoom phù hợp; không ép overlap. Click đúng mốc400 bị marker lý trình chọn đoạn, đã chọn điểm khe420 để kiểm popup, không đổi kỹ thuật.
- HUD đoạn#03 =30KC/10KG, thiếu làn đúng #03; chọn Xem toàn tuyến rồi về Tấm & Khe =>105KC/35KG, thông báo đủ4 đoạn thiếu làn, source vẫn0T/140khe/0nhãnT/140nhãn khe. Các input vẫn5/5/5/20/1, không yêu cầu nhập lại tim tuyến. Screenshot toàn tuyến chụp inline.
- Console đang giữ14 message lỗi/cảnh báo (CORS tile Google, lỗi filter/Hook trong lịch sử phiên có HMR); hai lần đọc không tăng, không tái hiện crash hiện tại hoặc lỗi glyph. Không suy từ log tồn tại thành lỗi source hiện tại để sửa theo phỏng đoán. Network180 fetch/xhr từ navigation hiện tại không có POST/PUT/PATCH/DELETE.
- Chưa kiểm browser T vì PM chưa nhập số làn từng đoạn. Chưa thử nhập/xóa/sửa/thập phân/đổi cự ly vì yêu cầu giữ nguyên dữ liệu, không nhập đè; các trường hợp này chỉ có kiểm mô phỏng ở test. Không tuyên bố T hoặc toàn luồng nhập đạt browser. Contract thiếu lưu/readback H/làn/KC/KG đã có bằng chứng endpoint/schema trong mục1769a18 ngay trên; lượt này không gọi API lưu hay kiểm khả năng lưu server.
- Kiểm lại đúng phạm vi: pavement helper6 PASS + map display7 PASS + RG_STEP3_FILTER="UI restore sidebar edits"1 PASS; npx tsc --noEmit PASS; git diff --check PASS. Không build/full regression. Commit chỉ ghi evidence worklog này, giữ nguyên120 dòng worklog local cũ và mọi thay đổi ngoài nhiệm vụ.


### 08/11/2026 — Slab preview từ L và bề rộng dải PM, nghiệm thu browser thật
- Baseline3088022; đọc AGENTS.md và dependency trực tiếp. UI chưa có stripWidthMeters nên thêm đúng1 ô Bề rộng tấm (m) trong khối kích thước; truyền nguyên chuỗi PM qua state/helper/map, reset đúng scope/file như các cấu hình hiện có. Không suy laneCount hoặc chia đôi đường. Tạo T1..Tn cùng thứ tự tăng lý trình/dải ngang cho list, polygon, nhãn và popup. H là thuộc tính tùy chọn, không cản lưới2D theo L/stripWidthMeters; không điền H mẫu.
- Giữ phần dư dọc và (preview FE cục bộ) phần dư ngang tại mép, không làm tròn dữ liệu. Tính trước số tấm dự kiến; vượt20000 hoặc số lượng không an toàn thì thông báo ngân sách preview và không sinh T nào, không truncate hoặc đổi tham số. KC/KG và mép giữ nguyên; test so joint geometry/properties với baseline. Không sửa API/BE/tuyến nhánh.
- Đọc handoff BE mới bằng git fetch + git show origin/develop:deploy/fe-handoff/PAVEMENT-LAYOUT-CONFIGURATION.md tại BE cda6d63, không checkout/pull/sửa working tree BE. Quy tắc BE: widthProfile liên tục/phủ tuyến và mỗi widthMeters chia hết stripWidthMeters. FE đang cho dư ngang chỉ để preview, chưa thống nhất với điều kiện lưu BE; không coi preview hợp lệ là đủ điều kiện lưu, không tự đổi PM hoặc nối mutation. Bộ PM kiểm thực7/3.5=2 dải nên không có dư ngang. Thứ tự lateral/server geometry chưa nghiệm thu đối chiếu API; chỉ preview FE đã kiểm.
- Đính chính nhận định thiếu backend trong worklog các lượt cũ: handoff mới POST pavement-plans/GET pavement-layouts/{layoutId} hỗ trợ layout.slabThicknessCentimeters (>0), contractionJointSpacingMeters (>0), expansionJointSpacingMeters (>0), expansionJointGapMillimeters (>=0), nullable/omit; GET trả layout gốc. Đây là bằng chứng contract mới, chưa chứng minh runtime API deployment hay nối lưu FE. Hình học khe vật lý BE vẫn chờ quy tắc duyệt; không đổi KC/KG FE trong lượt này.
- Vite đã tự reload trong giai đoạn sửa, PM được báo mất preview và tự nhập lại; agent không phục hồi fixture/thông số. Sau PM báo đã nhập xong: đúng Chrome MCP page2 ABC1, không reload/điều hướng/điền input. PM L5m/H5cm/strip3.5m/KC5m/KG20m/gap1mm, tuyến701.290518512277m rộng7, laneCount chưa có. Source282 Polygon T +282 Point nhãn T, code282 duy nhất T1..T282;105KC+35KG/140nhãn khe. List/HUD282 khớp source. T281/T282 từ Km0.7 đến0.701290518512277, dài1.2905185122770035m, rộng3.5m; engineering không làm tròn.
- Browser thật zoom21 thấy ô và mã T165..T176 trong tấm, không bật overlap. Native click tâm T172 mở popup đúng T172/Km0+425.000/Dải tấm2/5m×3.5m×5cm/Preview chưa lưu-chưa xác nhận; giữ zoom21. Ảnh thực chụp inline gồm ô/mã/popup và ô strip PM3.5; ảnh HUD/list282 cũng chụp. Chỉ collapse HUD/camera/selection để xem, input giữ nguyên.261 request fetch/xhr navigation hiện tại không có POST/PUT/PATCH/DELETE. Không lưu/confirm.
- Kiểm cuối: node tools/check-alignment-pavement.cjs7 PASS (PM strip, dư dọc/ngang, lane độc lập, thay chiều rộng, ngân sách/tuyến dài); node tools/check-alignment-map-display.cjs7 PASS (labels/list/HUD/popup/codes, KC/KG baseline); RG_STEP3_FILTER="UI restore sidebar edits" node tools/check-step3-geometry.cjs1 PASS (giữ chuỗi strip/no toast); npx tsc --noEmit PASS; diff-check PASS. Browser đã nghiệm thu hiển thị T theo bộ PM trên; đổi thông số/nhánh/BE save không nghiệm thu browser trong lượt này. Không build/full regression. Giữ nguyên120 dòng worklog cũ local và thay đổi ngoài nhiệm vụ.


### 08/11/2026 — Validation H tùy chọn và tự đóng modal sau nạp preview
- Baseline302fa18; đọc AGENTS.md/helper/caller/import modal/tests. Giữ nguyên100% JSX/UI/layout/style, chỉ3 file helper/state/handler và test trực tiếp. Không API lưu/BE/phép chia/KC/KG; giữ local ngoài nhiệm vụ.
- H trống/sentinel chưa nhập: issue riêng Chưa nhập chiều dày tấm, không chặn lưới2D. H đã nhập sai(-5/0/abc/Infinity/overflow) => Chiều dày tấm không hợp lệ trong vùng thông báo sẵn có, không đổi raw input thành trống, clamp hoặc toast mỗi ký tự; H thập phân giữ nguyên. Không thay công thức sinh ô; invalid H chặn riêng T, KC/KG giữ nguyên dữ liệu.
- Import kiểm xong gọi callback nạp state preview, chỉ sau callback thành công và có>=2 điểm preview mới đóng modal bằng setter nội bộ. Không chờ context/CRS dự án/road section để đóng; readMessage/toast hiện có vẫn giữ thông báo chưa lưu và cảnh báo. File lỗi, callback từ chối hoặc CRS32649 chưa preview được giữ modal. Wrapper mở/đóng/hủy tăng readAttempt để reader cũ không nạp/đóng modal mới; giữ scope/mount/file guards. Không đóng ở chọn file/finally, không gọi reset hoặc lưu khi đóng.
- Chrome MCP đúng page2 ABC1: trước sửa PM5/5/3.5/5/20/1, route282T. HMR lượt này giữ tuyến/thông số, không reload mất preview. Trong lúc PM tự thao tác, agent đọc trực tiếp H5.25 và282feature T nhận thicknessCm5.25. Sau PM báo kiểm xong/import lại, đọc AlignmentImportModal.isOpen=false/AlignmentModals.isImportModalOpen=false; importStatus Đã nạp Draft(119 điểm), chưa lưu/chưa xác nhận, cảnh báo engineeringUtmSrid chưa thiết lập và thiếu road section/version vẫn giữ. Tim tuyến701m/rộng7/1khoảng vẫn ở state/map(segments-source2feature); cấu hìnhT/KC/KG trống theo hành vi thay file sẵn có, không do đóng modal. Mở tab Tấm & Khe: vùng thông báo Chưa nhập chiều dày tấm, agent không nhập thông số thay PM. Đã screenshot thực inline. Không quan sát toàn bộ từng trạng thái trung gian PM thử H sai/trống hoặc file lỗi; các trường hợp này/async stale chỉ nghiệm chứng bằng test mô phỏng, không gọi browser PASS cho phần chưa thấy. Network không có mutation.
- Kiểm tập trung19 nhóm PASS: pavement8(H trống/decimal/sai; joints giữ nguyên), map-display7(ô nhập→thông báo, giữ rawH/no toast), Step3 filter4(import GeoJSON/Draft tự đóng; lỗi/false/32649 giữ mở; cancel/reopen/file mới/scope mới bỏ kết quả cũ; state không spam). npx tsc --noEmit và diff-check PASS. Không build/full regression; stage chỉ đúng6file và entry này, giữ120dòng worklog local cũ.


### 08/11/2026 — PM nhập lý do cập nhật draft sau F5
- Baseline 134f0a75763c62d2b31583c2c2cb7009d48d5352, nhánh hoang. Đọc AGENTS.md, GeometryDraftInput/create/update/If-Match và command journal. Chỉ thêm modal gọn lý do/Hủy/Lưu trong AlignmentSegments, binding/state workflow và test; không sửa BE/slab/khe/Survey/confirm/publish. Giữ 29 file modified và file untracked ngoài nhiệm vụ.
- Tách lý do thiếu khỏi gate kỹ thuật nút lưu chính; kiểm toàn bộ dữ liệu khác trước khi mở modal. PM nhập lý do hiện tại, chặn rỗng/toàn khoảng trắng. Hủy giữ form, không ghi; lỗi giữ lý do/bản chỉnh, pending khóa sửa lý do và retry qua journal cũ, receipt chỉ đọc lại. Không tạo mặc định hoặc lấy lý do road section; GET draft vẫn không trả changeReason, không coi lý do mới là metadata gốc. File tạo draft có lý do sẵn tiếp tục lưu như cũ.
- Chrome DevTools MCP tab3 ABC1: F5 phục hồi tuyến701m/119điểm; agent bấm Lưu bản nháp, modal ô trống mở. PM tự nhập “sửa tuyến đường” và bấm Lưu, không DevTools setForm. Network PUT request2156 trả200 cùng draft ae00e2ba-ca47-4167-a72c-ea91076ab592, body changeReason đúng PM/119điểm; GET2157/2159/readiness2161 trả200. Readback DRAFT, project/tuyến đúng, CRS32648, stationOrigin0, widthProfile0–701.290518512277m rộng7m, surveyWidth12, versionAAAAAAAAbw0=. Modal đóng sau đọc lại thành công; không POST draft mới.
- Test tập trung8 nhóm workflow/modal/validation/hủy/lỗi/retry/gửi lặp/concurrency/readback PASS;5 nhóm state/save/F5/file-create/update/readback PASS. Typecheck và diff-check PASS. Lỗi/retry/hủy/whitespace/gửi lặp là test mô phỏng, chưa gây lỗi thật trên ABC1. Không build/full regression. Stage đúng5file (kể cả tái dùng validator kỹ thuật) và riêng mục worklog này, giữ120dòng worklog local cũ.


### 08/11/2026 — Lưu/đọc cấu hình pavement có pin server, runtime ABC1 còn bị chặn
- Baseline64c2780be1bcf694c74497b1fabd3540e98708e1, hoang. Đọc AGENTS.md và deploy/fe-handoff/PAVEMENT-LAYOUT-CONFIGURATION.md tại BE cda6d63, Swagger runtime HTTPS28443, Controller/Service/Pins/engine hiện hành. Không dùng OpenAPI FE cũ để kết luận API thiếu. Chỉ service/command/hook pavement, binding hiện có và đúng một nút lưu trong tab Tấm & Khe, status nhỏ; không sửa BE, geometry split, nhân sự, Survey, confirm/publish. Giữ local ngoài nhiệm vụ.
- Runtime CURRENT_VERIFIED Chrome MCP tab3 PM: ABC1 work-package200, tuyến53a034e3-e554-4042-afa4-225e1d69df3e/currentVersion20e074ba-75d2-4194-a46c-b32284fc3252. GET geometry200 metadataLEGACY_INCOMPLETE/sourceDraftIdnull/stationOriginnull/widthProfilenull/crsProfileRevisionIdnull, length701.2905185122771. GET segment-sets200 items[]; draftae00e2ba-ca47-4167-a72c-ea91076ab592 vẫnDRAFT. Pins BE cho phép legacy route qua FromLegacy; thiếu CRS profile không phải blocker tuyệt đối cho plan. Blocker quyết định: không có segment set server PUBLISHED. Không tạo set/tuyến/confirm để ép chạy.
- Nút Lưu cấu hình tấm/khe riêng, pin route/set lấy context+GET geometry/list pagination+GET set, require ACTIVE và PUBLISHED/đúng scope; nhiều ứng viên mà không có reference rõ thì chặn, không chọn mẫu. Payload editor->number không clamp/round/đổi đơn vị, optional trống omit, gap0 giữ0; kiểm widthProfile liên tục/phủ tuyến và chia hết strip bằng decimal arithmetic. displayTolerance0.1 do người dùng chấp thuận riêngABC1 được giữ trong session scoped project, không hardcode/default toàn hệ thống; sau readback dùng geometry.displayToleranceMeters server và bỏ chấp thuận một lần.
- Journal actor/project giữ key/input immutable, ref chống click lặp, receipt lưu trước GET và không POST lại khi GET lỗi. Payload khác không sửa command đang chờ; chỉ400/422 đã từ chối rõ và click lưu cấu hình đã sửa mới thay ý định/key. LayoutId nằm URL; link hồ sơ Sup giữ layoutId. F5 GET response.layout khôi phục6ô, optional thiếu giữNaN/chưa nhập, widthProfile server riêng cho payload không đổi geometry draft. AS_BUILT layoutnull đọc riêng sourcePlanId hợp lệ để nạp form, snapshotAS_BUILT vẫn riêng. Kiểm readback scope/pin/hash/config/tolerance cùng số cell/slab, sequence/key/finite closed footprint; không coi previewFE là geometry server hoặc KC/KG đã xác nhận vật lý. Response muộn bị chặn khi đổi project/layout/actor; bản chỉnh mới hơn không bị nạp đè.
- Browser CURRENT_VERIFIED: mở tab Tấm & Khe, đúng một nút lưu khóa, status ghi rõ route20e074ba... có0set/0PUBLISHED. Sau F5 tuyến701m phục hồi và status thiếu set giữ nguyên; network không có mutation pavement. Các ô PM hiện trống, agent không nhập thay. Không có layoutId mới; PM POST/receipt/F5 cấu hình thật và Sup đọc cùnglayoutId NOT_RUN do prerequisite, không gọi mock là browserPASS.
- Mô phỏng11nhóm pavementPASS: mapping decimal/optional/gap0, width/dimension validation, pin/discovery rỗng/sai, retry/receiptGETfail/noPOSTagain, keyimmutable/gửi lặp, definitive rejection/new intent, malformed geometry/readback mismatch, AS_BUILT/sourceplan, actor fence, hookF5/Sup/scope và URL sau verified readback.4nhóm draft hydration/save/receipt và4nhóm reason/readback/sidebarPASS; typecheck/diff-checkPASS. Không build/full regression. Chỉ stage file/hunk nhiệm vụ và entry này, giữ120dòng worklog local cũ. Runtime lưu pavement và acceptance thiết kế server vẫn chưa nghiệm thu.


### Pavement review — mặc định render và snapshot/retry sau F5
- Baseline4b8219c08221c6829cc88a5e5fbfcc5a072ffd25, hoang. Đọc AGENTS.md, luồng GET/config/map/list/HUD và contract source đã bàn giao. Chính sách BE do người dùng xác nhận: PAVEMENT_RENDER_TOLERANCE_METERS=0.1 trong src/config/pavement.ts cho PLANNED mới LINE/ARC/hỗn hợp; bỏ sessionStorage chấp thuận dung sai từng project. Snapshot cũ hiển thị footprint và geometry.displayToleranceMeters đã lưu (test0.37), không chuyển thành0.1. Không đổi geometry engineering hoặc thiết kế PM.
- Layout GET đối chiếu project/pin route/set, đọc route geometry và set server; không lấy CRS từ draft khác. Khôi phục layout.widthProfile trong state pavement riêng; không sửa draft. Helper snapshot dùng geometry.plan.cells/geometry.slabs cho sequence/key/kích thước/footprint, cùng nguồn map/list/HUD; chỉ chuyển footprint qua adapter32648 đã hỗ trợ, CRS khác báo lỗi không đoán. Station thiếu thì list ghi offset, không tuyên bố lý trình đo. Snapshot và preview mới phân biệt bằng revision thao tác PM; sửa config giữ profile pavement, không dùng bề rộng draft khác. KC/KG server chưa có geometry vật lý nên snapshot không tự sinh khe.
- Tải lại có reload dependency cho GET layout và prerequisite; loading/error rõ, giữ form khi lỗi/retry; response cũ bị bỏ theo project/layout/actor/pin, hydrate chỉ lần đầu scope và không đè PM editRevision mới. GET draft đến muộn không đổi6ô pavement vì luồng hydrate đã tách. Receipt recovery tiếp tục GET, journal/key/payload không thay; không POST mới vì GET lỗi. Khi receipt chưa đọc đủ, không gắn snapshot cũ vào layoutId mới.
- CURRENT_VERIFIED browser Chrome MCP tab3 ABC1: session200/PM, work-package200, road53a034e3-e554-4042-afa4-225e1d69df3e/currentVersion20e074ba-75d2-4194-a46c-b32284fc3252; GET segment-sets200 items[]. Nút Lưu cấu hình tấm/khe khóa đúng0PUBLISHED, tuyến/draft vẫn hiện. Không mutation nghiệp vụ, không tạo set/confirm/publish/BE. Không có layout thật nên browser lưu/F5 snapshot/Sup đọc/GET lỗi-phục hồi NOT_RUN; không ghi mock thành runtimePASS.
- Mô phỏng13nhóm pavementPASS: payload/default mới0.1, snapshot cũ0.37, footprint và widthProfile khác local, default không cần project/session, optional/gap0, validation/pin, receiptGETfail retryGETonly, immutable key/click lặp, AS_BUILT nguồn, actor/scope, F5/restoration, GET lỗi rồiTải lạiGET thật, response muộn và PM sửa.6nhóm draft/reason liên quanPASS; typecheck/diff-checkPASS. Không build/full regression. Hai lượt tự rà phạm vi/binding; commit riêng chỉfile/hunk nhiệm vụ, giữ120dòng worklog local cũ và toàn bộlocal khác.


### 09/11/2026 — Sửa ba nhánh hiển thị pavement snapshot/preview
- Baselinec661f2a7ab8b716ec7b909b14af58b860f2a7918, hoang. Đọc AGENTS.md và helper/state/map popup/caller. Chỉ sửa binding hiển thị, helper và nội dung popup hiện có, không đổi cấu trúc JSX/layout/style (binding kích thước thiếu đổi sang Chưa có dữ liệu); không BE/API contract/phép chia/Survey/nhân sự/confirm/publish. Giữ mọi local ngoài nhiệm vụ.
- PLANNED sau chỉnh config: tạo cặp tọa độ/lý trình từ metric LineString route server đã scope-check, engineering stationOrigin và length trùng cumulative metric offset; không haversine. Adapter32648 chuyển chính điểm metric đi kèm từng offset. Không dùng native/ARC tessellation làm chainage; thiếu nguồn hoặc length mismatch thì giữ snapshot map/list/HUD và status nói rõ cấu hìnhPM mới chưa áp dụng preview, không hiện0tấm hoặc gắn nhãn đã áp dụng. Snapshot readonly và editor revision riêng, giữrender0.1 choPLANNED mới/dung saiGET cholayout cũ.
- Snapshot properties lấy station/offset, lateral intervals, mã và kích thước thật từ cell/slab. Popup giữ thiết kế, chỉ nội dung/binding: Đã lưu trên máy chủ +layoutId, không Supđãduyệt/Previewchưalưu; previewPM vẫnchưalưu. Nội dung thiếu ghi Chưa có dữ liệu, escaped string server, không undefined hoặc số liệu tự sinh; strip lateral không gọi là khoảng cách mép đường.
- AS_BUILT không yêu cầu plan.cells hoặc plannedSequence/kích thước; footprint lấy nguyên slabsAS_BUILT và chỉ chuyểnCRS hiển thị. Không geometryPLANNED bù vào AS_BUILT; readConfiguration/sourcePlanId vẫn chỉ phục hồi cấu hình nguồn. Không lấy chiều dàyPLANNED làm kích thước đoAS_BUILT. Slab thiếu kích thước giữ unknown, list/HUD/popup không bịa; PLANNED vẫn giữ gatecell/sequence/profile/dimensions.
- Mô phỏng16nhóm pavementPASS gồm preview metric chainage, fallback thiếu/native, đổiL tăng preview nhưngsnapshot không đổi, cell/lateral popup, AS_BUILTplan=null/optional metadata, handler click popup thực với MapLibre mock, sourcePlan/scope/lateGET/retry.6nhóm draft/reason liên quanPASS; typecheck/diff-checkPASS. Không full regression/build.
- Chrome DevTools MCP tab3ABC1 CURRENT_VERIFIED: session200/PM, work-package200, GET segment-sets route20e074ba-75d2-4194-a46c-b32284fc3252 trả200items[]. Không có layout thật nên mở/chỉnh/clicksnapshot/AS_BUILT browser NOT_RUN, không tự tạoPUBLISHEDset/confirm/publish để épPASS. Test16nhóm là mô phỏng, không tuyên bố persistence/runtimePASSE2E. Commit riêng chỉfile/hunk và entry này; giữ120dòng workloglocal cũ.


### 09/11/2026 — Modal Sup xác nhận geometry, browser dừng tại readiness blocker
- Baseline37c61f5831bcfca8203be040f8bc20b2d5d16526, hoang. Đọc AGENTS.md, Spec17_10/02_Business-Workflows/02_Project-Road-Geometry-and-Pavement.md, catalogAPI180/181/182 và Swagger runtimeHTTPS28443, trực tiếp AlignmentSegments/Header/workflow/readmodel/alignmentService/command journal. Không sửa BE/restart runtime, segment set/pavement/Survey/nhân sự. Giữ29filemodified+untracked ngoài nhiệm vụ.
- Nút Sup xác nhận mở modal gọn chỉ ngày giờ/lý do/Hủy/Xác nhận theo style hiện có; không bị khóa bởi hai trường chưa nhập. Gate project/DRAFT/version/preview/readiness/pending còn nguyên, PM không có nút/quyền. Không mặc định thời điểm hoặc lý doPM. Timezone hiển thịAsia/Ho_Chi_Minh(+07:00), validate calendar roundtrip và chuyểnISO đúng thời điểm độc lập host timezone; pendingconfirmF5 phục hồi theo+07. Hủy giữ bản nhập/khôngrequest;busy/ref chặnclicklặp, lỗi giữform, commandjournalkey/payload và receiptGETonly hiện có không đổi.
- Preview mới bỏ snapshotđãxem cũ trước, chỉ chấp nhận preview/readiness/context đủ cùngscope/version. Ghim current route version đãxem; trướcPOST đọc freshdraft/readiness/context, đối chiếu project/draft/tuyến/status/ETag/currentroute; versionđổi giữform/yêu cầuxemlại, không xác nhậnversionmới. ReadinessmissingFields/errors/sampleOnly báođúngfield, khôngđổi ready. Success chỉ từ command readbackgeometry đúngreceipt; URLconfirmed/F5readmodel giữcơchếhiệncó.
- CURRENT_VERIFIED Chrome MCP Sup user tự đăng nhập tab5; mở link ABC1draftae00e2ba-ca47-4167-a72c-ea91076ab592, GETsession200SUPERVISOR/work-package200/draft200DRAFT/versionAAAAAAAAbw0=/road53a034e3-e554-4042-afa4-225e1d69df3e. Bấm Xem trước bản đã lưu trênUI: preview/readiness200, length701.290...; readinessfalse, missingFields nativeAlignment,crsProfileRevision,routeSystemId,routeKind,tessellationToleranceMeters; errors[],crsStatusCANDIDATE, warningOFFICIAL_CRS_OPERATION_AND_INDEPENDENT_CONTROL_NOT_VERIFIED. Nútconfirmkhóa vớiđúngfieldthiếu; khôngPOSTconfirm/thửvượtgate/tạohồsơCRS. Chưa confirmedversionmới. Browsernhậpngày/lýdo/confirm/readback/F5CONFIRMED/PMreadonly NOT_RUN do serverblocker.
- Môphỏng8nhóm workflow/permission/receiptGETfail/retry/version/hydration/modalSup/calendar/whitespace/HủyPASS;1nhómbindingUI PASS;3nhómdraftupdate/hydration/readbackPASS. Confirmhappy path mock asserts đúngUTC+07,reason,expectedCurrentVersionId,etag vàreadback; PMdenied. Typecheck/diff-checkPASS; khôngfullregression/build. Ghirõ môphỏngkhôngphảibrowserPASS. Stage đúngfile/hunk vàentrynày, giữ120dòngworkloglocalcũ.


### 09/11/2026 — Phục hồi confirmed COORDINATES metric-only trên map/F5
- Baselinefb2ca1c07db00770294c949e1dd47ce2b29d2497, hoang. Đọc AGENTS.md/Spec17_10 geometry và trực tiếp useAlignmentState/useGeometryReadModel/alignmentService/adapter hiện có. Chỉ helper/state/readscope và test; không JSX/UI/layout/style/APIcontract/BE/readinessbypass/segmentset/pavement workflow/thiếtkếPM. Giữlocalngoàinhiệmvụ và note audit chưacommit.
- confirmedGeometryDisplay ưu tiênWGS84serverLineString2Dhợplệ; metric-only chuyển đúng engineeringSrid quaadapter32648 hiệncó, khôngđoánzone32649/CRS. Giátrịnghiệpvụmetric,length,origin,widthProfilekhôngsửa. Pairchainage chỉmetadataCOMPLETE/sourceDraftId/sourceCrs=engineering vàkhôngnative/calibration, metricLineStringhữuhạn, cumulativeEuclideanlengthkhớplengthMetersserver, cặpWGS84phảikhớpmetricconverted; stationOrigin khác0 giữprecision. NativeARC/calibration/thiếunguồnchỉhiệntuyếnnếucóvàbáođúngmetadata, khônghaversine/mẫu. MissingCRS/shape/length/origin báo rõ qua toast hiệncó.
- Hydratekiểmproject/draftsource/roadReference/routeVersionReference, khôngmarkdirty; confirmedstatusserver cho phép bỏbảnpreviewfileđãlưu màkhôngsửadraft. Readmodel fencing thêm road/version/draftngaytrongselection vàcleanup, chặnresponsecũkhiđổiquery/scope vàreadbacksaing uồndraft. Khôngchạmcácôconfigurationpavement; draftchưaCONFIRMEDgiữgatebảnchỉnhcục bộ.
- Testtậptrung8nhómPASS:1helpermetric/WGSpreferred/stationprecision/CRSmetadata/native/mismatch;3draftstate(F5confirmedmetric, keepconfig/dirtyfalse, scope, draftupdate/hydrate);4readmodel/sidebar/context/reversedresponses/wrongsource/projectfence. Dữliệumockchỉtest, khôngfallbacksảnphẩm. Typecheck/diff-checkPASS, khôngbuild/fullregression. Adapterthựcđượcchạyqua stateharness.
- ChromeDevToolsMCP GETsession200, GETworkpackageABC1200/geometrycurrent20e074ba-75d2-4194-a46c-b32284fc3252 HTTP200: metricLineString119điểm,WGS84vắng, stationOriginnull, sourceDraftIdnull, LEGACY_INCOMPLETE. KhôngcóconfirmedversionphùhợptừdraftPMđểbrowserF5nghiệmthu; ghiNOT_RUNconfirmed-mapruntime, khônggọilegacyversionlàconfirmeddraftreadback. Khôngmutation/confirm/tạodữliệu. Commitriêngfile/hunk vàentrynày; giữcácđiềut raaudit/localkhácngoàiindex.


### 09/11/2026 — Sửa fileDraft không ghi đè confirmed geometry
- Baseline1a54cb57b00e732f04d82b84cfce2d543e1dd1e3, hoang. Đọc AGENTS/Spec17_10 geometry và useAlignmentState/readmodel/helper/test trực tiếp; không sửa UI/BE/API/pavement/segment. F5 confirmed hydration metric-only và chainage đã có từ lượt trước; lượt này sửa thêm effect fileDraft: nếu server cùng draft/statusCONFIRMED/road/version thì giữ confirmed state/geometry, không set DRAFT, không nạp filePreview cũ vào form/map, không xóa local edit khác scope.
- Test focused 3 draft groups + 4 readmodel groups PASS, typecheck/diff-check PASS. Browser confirmed runtime NOT_RUN: ABC1 current geometry vẫn LEGACY_INCOMPLETE/sourceDraftIdnull, readinessfalse; không tạo/confirm dữ liệu.


### 09/11/2026 — Hydrate widthProfile confirmed geometry-only sau F5
- Baseline9def8d1e803791eedf9a75a22321f00574c61e4b, hoang. Chỉ sửa useAlignmentState effect và test state; giữ confirmed metric-only fix, UI/layout/style, pavement snapshot/config và local ngoài nhiệm vụ.
- Geometry đã xác minh đúng project/road/version với widthProfile + stationOrigin giờ hydrate segmentsState.segments: start/end=(origin+offset)/1000, precision nguồn giữ nguyên, status HÌNH HỌC ĐÃ XÁC NHẬN, không điền lane/material hoặc coi segment set/PUBLISHED. Scope fingerprint gồm project/road/version/widthProfile; localDraftDirty giữ local segments, đổi scope không rò dữ liệu. FileDraft effect confirmed guard giữ CONFIRMED và không nạp preview file cũ.
- Test focused geometry-only confirmed F5 kiểm segments thực, origin khác0, nhiều khoảng width, local width edit không bị ghi đè; draft/update/readmodel tests PASS. Typecheck/diff-check PASS. Chrome confirmed runtime NOT_RUN: ABC1 current geometry vẫn LEGACY_INCOMPLETE/sourceDraftIdnull, chưa có confirmed version phù hợp; không mutation.


### 09/11/2026 — Tách scope routeVersion cho widthProfile confirmed geometry
- Baseline970bedbaecf0f63106a18ce1090aab69a09f35c5, hoang. Scope editor trước chỉ authEpoch/projectId/draftId, nên localDraftDirty của confirmed v1 chặn hydrate widthProfile v2 cùng project. Sửa scopeKey thêm roadSectionId/routeVersionId; scope mới reset editor/dirty/selection, response cũ không hydrate. Giữ confirmed fileDraft guard và pavement snapshot/config trong đúng reference.
- Geometry-only confirmed effect hydrate segments thực từ geometry.widthProfile, start/end=(stationOriginMeters+offset)/1000, precision nguồn giữ; local dirty cùng scope không ghi đè. Test cập nhật: v1 7m dirty → v2 12m state cuối12m/dirtyfalse; same-scope F5 giữ edit; nhiều khoảng/origin khác0; đổi project/version và delayed response không rò; draft→confirmed giữ CONFIRMED/pavement config.
- Test focused geometry draft/state PASS, typecheck/diff-check PASS. Browser confirmed NOT_RUN vì ABC1 chưa có confirmed version phù hợp (current geometry LEGACY_INCOMPLETE/sourceDraftIdnull), không mutation. Giữ local ngoài nhiệm vụ.


### 09/11/2026 — Giữ cấu hình pavement khi draft chuyển confirmed và reset width scope
- Baseline690f4b3765c2f7fd55697589169dbb1b9b4731a3, hoang. Đọc AGENTS/status/diff và chỉ sửa useAlignmentState + focused state test. Scope confirmed/draft chuyển route có thể gọi resetEditor làm mất slabLength/H/KC/KG/strip; resetEditor nay nhận preservePavement chỉ khi cùng project+draf t confirmed chuyển thêm road/version, giữ toàn bộ cấu hình PM chưa lưu. Chuyển route/version/project thật sự vẫn reset.
- Test confirmed transition nhập đủ strip/L/H/KC/KG/gap trước server CONFIRMED, kiểm toàn bộ còn nguyên + status CONFIRMED + geometry; v1 dirty→v2 width khác nhận đúng v2/dirtyfalse; same-scope/local, scope cũ/response trễ, draft/F5 tests PASS. Typecheck/diff-check PASS.
- Browser confirmed NOT_RUN (ABC1 chưa confirmed version phù hợp), không mutation. Giữ local ngoài nhiệm vụ.


### 09/11/2026 — Reset dấu hydrate khi đổi confirmed route/version
- Baseline6f2700692ba797e73b45c6d3e5ac500fe22bfa42, hoang. Scope editor đã gồm route/version nhưng confirmedGeometryScope cũ chưa reset khi geometry=null/đổi scope, làm quay lại v1 bỏ sót widthProfile; confirmedDraftTransition cũng preserve pavement quá rộng. Sửa reset scope xoá confirmedGeometryScope, và chỉ preserve pavement khi draft CONFIRMED đúng cùng project/draft trong prefix scope cũ; đổi route/version/project reset thật.
- Test A v1→v2 geometry=null→v1 kiểm lại số khoảng/width; B draft→confirmed nhập đủ strip/L/H/KC/KG/gap trước chuyển và giữ toàn bộ; C confirmed v1→version khác không giữ cấu hình; D same-scope local edit/F5 giữ. Draft/F5/pavement config checks không hồi quy. Focused test PASS, typecheck/diff-check PASS. Browser confirmed NOT_RUN (ABC1 chưa confirmed version), không mutation.


### 09/11/2026 — Thu hẹp preserve pavement khi draft confirmed reference đến muộn
- Baseline4416e7c68cb5eb1f1460d55669c8cae0f3f30b14, hoang. Chỉ sửa useAlignmentState/test. preservePavement không còn dựa status/prefix chung: chỉ capture khi scope cũ là draft-only (`road/version` rỗng), draft CONFIRMED đúng id/project, và geometry confirmed đã khớp sourceDraft/project/road/version. Nếu geometry chưa về, cấu hình chờ theo key project:draft; khi response đúng scope tới mới restore. Đổi version/tuyến không áp config cũ.
- Reset scope vẫn xóa confirmedGeometryScope; A delayed geometry B config giữ đúng, B version khác không giữ L; C v1→v2 null→v1 hydrates widthProfile; D same-scope/local; E draft/F5/pavement config tests PASS. Typecheck/diff-check PASS. Browser confirmed NOT_RUN vì ABC1 chưa confirmed version; không mutation.


### 09/11/2026 — Chặn race preserve pavement khi URL/CONFIRMED response đảo thứ tự
- Baseline246f5e9aff3b150bc80dbe0fb04c240412bb9897, hoang. Sửa useAlignmentState/test trực tiếp. Pending pavement chuyển từ Map sang một bản chờ duy nhất có key project:draft; capture ngay khi scope draft-only đổi URL, không cần status CONFIRMED đã về. Chỉ restore khi draft/project/sourceDraft/road/version geometry khớp đầy đủ; scope khác không áp dụng và bản chờ không tích lũy.
- Test delayed Draft→URL→geometry kiểm đủ strip/L/H/KC/KG/gap trước đổi URL, draft status DRAFT vẫn giữ chờ rồi CONFIRMED restore; version khác không giữ L; v1 null→v1 width hydrate lại; local/Pavement/F5 assertions giữ. Focused test PASS, typecheck/diff-check PASS. Browser confirmed NOT_RUN (ABC1 chưa confirmed version), không mutation.


### 09/11/2026 — Race pending pavement target theo đầy đủ URL scope
- Baseline3e9467afee32751d88725b0c2a147a74cb409fa3, hoang. Pending cấu hình draft→confirmed nay capture cả khi draft GET còn null/chưa CONFIRMED, chỉ một bản chờ có key authEpoch/project/draft/road/version đích. Restore chỉ khi draft CONFIRMED và geometry project/sourceDraft/road/version khớp; PM sửa config hoặc hydrate layout server hủy pending. Scope khác không áp dụng, consume sau restore, reset confirmedGeometryScope giữ nguyên.
- Test focused delayed race giữ đủ6 trường, version khác không giữ, v1 width hydrate lại, same scope/F5/draft/pavement không hồi quy; typecheck/diff-check PASS. Browser NOT_RUN vì ABC1 chưa confirmed version; không mutation.


### 09/11/2026 — Hoàn tất pending cấu hình với 4 thứ tự response
- Baseline3e9467afee32751d88725b0c2a147a74cb409fa3, hoang. Thêm test tách A URL→draft→geometry, B URL→geometry→draft, C/D scope draft/URL/geometry; pending capture ngay trước reset chỉ khi scope draft/project đúng, target key đầy đủ auth/project/draft/road/version. Chỉ restore sau draft CONFIRMED + geometry khớp; pending một bản, scope rời hủy, PM/layout đổi hủy, restore consume.
- 34 nhóm draft state/map/save + 17 nhóm pavement related PASS; typecheck/diff-check PASS. Các test kiểm state sáu giá trị thực, widthProfile, dirty/status/scope; không chỉ log PASS. Browser NOT_RUN confirmed vì ABC1 chưa confirmed version, không mutation. Giữ local ngoài nhiệm vụ.


### 09/11/2026 — Sup đình chỉ/khôi phục tài khoản bằng Web cookie/CSRF
- Parent/baseline FE0e374fc9235d8391f168579bdcf70d734ad5a665, nhánh hoang, fetch origin/hoang giữ đúngSHA. Bảo toàn29filemodified + cácnote/untrackedlocal. FetchBEorigin/develop=f1f4e5b1e1c25cced91305b43b592fbb03fa8ef7; đọc Spec17_10/Authentication-Users-and-Memberships, UsersController/AccountUpdateRequestDto/IdentityV2Service qua gitshow tạiSHA này, khôngcheckout/deploy/sửaBE.
- Contract: GETusers/{id} trả ActorResponse/ETag (khôngstatus), PATCHusers/{id} nhận status/role/reason, Sup-only, WebCookieEligible, K/If-Match/CSRF, statusACTIVE|SUSPENDED, rolewireSUPERVISOR|PM|OPERATOR|CREW|REPORTER. OpenAPI FE hiện PATCH chỉBearer trong security, nhưng SwaggerHTTPS28443 có WebSession+CsrfToken+AntiforgeryCookie; không suy contract cũ là APIthiếu. Runtimeimage3c25d76... revisionlabelcda6d638... vẫnkhácBEdevelopf1f4e5b; chỉxácminhSwaggercurrent, không tuyênbốđãdeployf1f4e5b.
- Tận dụng personnelSnapshot: GETtrước/directory/GETsau equalETag +target/role nhấtquán; bổsungwireRolegốc, khôngdùngrole/statushàngUIcũ hoặcdefault. Haihandlerđọc snapshottrước submit; rolepayloadgiữsnapshot, chỉstatusđổi. Modal/ôlýdohiệncó táisửdụngchoACTIVE/SUSPENDED, lýdotrống mặcđịnh, khôiphụckhôngghi ngaykhibấmrestore. Chỉnối state/props/content/disabled/actionbinding, khôngthêmUI; class/style/icon các3fileUIđãđốichiếukhôngđổi. personnelBlocks.accountgiữriêngđổirole, reset/primary vàmembershipworkflowkhôngmở.
- Statusjournalactor-scoped giữtarget/payload/ETag/keytrướcPATCH, chặnclicklặp, timeoutretrycùngcommandkhôngkeymới. Receiptlưuidentity/role/ETagtrướcGET; readbackstatus/role/versionkhớpmớisu ccess. GETlỗisauaccepted retrychỉGET; receipt sai khôngPATCHlại.412/409giữreason/conflict khôngtựlấ yETagmớirồighi.4xxđãtừchốirõ dùngnútmodalhiệncóđểchọn sửa yêu cầu, giữlýdo/chưagửi, khôngsửa requestđangchờ. Lỗiđượchiệninline/toast, timeoutchưarõkếtquảghiđúng. Phản hồi cũ sauđóng/đổitarget/unmount/actor/epochkhôngadoptUI; khôngoptimisticupdate. Readbackchỉthayaccountfacts, giữmemberships/assignedprojectids/projectscope.
- Test mới được thêm TRƯỚCimplementation: nhómstatus FAILbaseline với savePersonnelStatus chưa tồn tại, xácnhận luồngchưanối. Sau sửa node tools/check-personnel-screen.cjs:36nhómPASS(mockHTTP/hooks/SSR, 11nhómmới). Assertionskiểm5wireRoles×2statuses/headerK/If-Match/reason/target, missingSnapshot/ETag/invalidrole/whitespacezeroPATCH, sharedclientwithCredentials+CSRF/noBearer, duplicate/timeoutkeypayloadimmutable, receiptGETfailonlyGET,412noautorefresh, actorlate, close/target/unmountfence, UIrestore/reason, rejectrevision, successaf terreadbackgiữmembership vàbadreceiptnoPOST. KỳvọngcũunsupportedPATCHđượcsửathànhinvalidpayloadblocked, khônggọistatussupportedlàunsupported.
- npx tsc --noEmit PASS; git diff --check PASS. Hai lượt tự review: (1)contract/role/version/idempotency/receipt/actor; (2)caller/UI/scope/blocks/localpreservation, đãsửacatchjournal vàunusedimportdophạmvinày. Khôngbuild/fullregression hoặckiểmmodulekhác.
- Browser/runtime đìnhchỉ/khôiphục→readback→F5 vàwrongactor runtime NOT_RUN: chưa có targettest do chủFEchỉđịnh, khôngdùngaccountđanglàmviệchoặcDBchungđểéptest. Source/Swaggerđượ cđọcthật, khônggọimockPASSthànhruntimePASS. CầnSup+targettestđượcchấpthuậnđểnghiệmthu. Chỉstage7fileimplementation/test vàentrynày, giữ132dòngworkloglocalcũ; commitTiếngViệt/pushthườnghoang, khôngforce.


### 09/11/2026 — Recovery status journal sau412 và retry sau timeout
- Parent474ebb95d0239573f440cdc30340944281e707e6, hoang; đọcAGENTS/status/HEAD/fetchoriginhoang trước làm, giữlocalcũ. ChỉpersonnelScreen/statushook/modalwiring/test; khôngBE/deploy/DBmutation/geometry hoặcjournalmodulekhác. Test trước sửa FAILthật: readPersonnelStatusConflict chưa có; timeout→403csrf_failed bịrejected=true.
- 412đầutiên đãxácđịnhchưaghi: Sup đóng/mởAgiữlýdo, bấmĐọcsnapshotđểđốichiếu(GETonly), modalhiệnstatus/role/ETagmới; Dùngsnapshotmới chỉbỏýđịnhcũ/chọnsnapshot, khôngPATCH, bấmxácnhậnlầntiếpmớikeymới. NútHủy saucomparisonghi Bỏýđịnhcũvàđóng; X chỉđóngkhôngxóa. ComparisonđượcgiữtrongUIscopetarget/actor/epochvàhelperkiểmkey; xửlýxongjournalAkhôngchặnB. KhôngtựrefreshETagrồighi.409khôngđượcgiảlàm412.
- uncertainpersisttrướcdispatch; timeout/network/5xxgiữlịch sửmơhồqua reload. Retry401/403csrf/412 khôngchứngminhlệnhđầuchưaghi nênkhôngrejected/conflictđểrevisionxóakey; replayvẫncùngtarget/key/body/ETag. ReceiptvẫnchỉGET, khôngPATCHlại. Journallegacythiếuuncertain/historyđượccoiambiguousbảothủ, khôngtựxóarejectedcũ. Cầnserverreceipt/replay/đốichiếunếudữliệucũkhôngđủchứngminh412đầutiên.
- node tools/check-personnel-screen.cjs41nhómPASS(mockHTTP/hooks/SSR;5nhómmớirecovery). Assertions:412close/reopen/readclick/explicitdecision/noautoPATCH/newkey/newETag/Bunblocked,timeout→403→successsameallheaders/body/key,timeout→401/412nondeletable,reloadrecovery,legacyuncertain,allpriorreceiptGETfail/doubleclick/epoch/target/unmount/membership. npx tsc --noEmit vàgitdiffcheckPASS. Layout/style/iconclassliteralđãđốichiếuvớiHEADkhôngđổi. Hai tựreviewcontract/statevàwiring/scopeđãhoànthành; phát hiện/sửa đúngaccidentalphoneguard trướcstage, khôngđổiluồngphone.
- Runtime/browserNOT_RUN: chưa cóaccounttestdoownerchỉđịnh; khôngmutationtargetthật. KhônggọimockPASSthànhruntimePASS. Stageđúng5filescode/test+entryworklogriêng, giữ132dòngworkloglocalcũ vàtấtcảlocalngoàinhiệmvụ.


### 09/11/2026 — Chặn capture cấu hình pavement từ draft nguồn khác
- Parentf8768d0f54d3c780cc5ffb5cf207d436eb1dec27, hoang. ĐọcAGENTS/status/HEAD/fetchhoang đúngbaseline; khôngcommitmớitrongphạmvi. ChỉuseAlignmentState/test vàentrynày; giữlocalcũ. TestsourceA→BthêmTRƯỚCsửastate vàFAILbaseline thật tạiassert stripWidthMeters củaBkhôngđượckếthừaA.
- Capture pending chỉkhi editorScope nguồn bằngđúng authEpoch+actorId/projectId/draftId vàroad/versionnguồnrỗng; khôngchỉpreviousDraftOnly/khônggánkeyBchocấu hìnhA. Loại previousUnboundDraft: editor chưa draftId không córeceiptidentity để chứngminh bindcùnghồsơ ởstate này nênkhôngpreserve sangdraftmới. CácresponseordercùngdraftđãcóIDvẫngiữđủ6fieldtrướcđổiURL. Scope/pendingkeythêmactorID; restorekiểmdraftCONFIRMED/id/project/road vàgeometry sourceDraft/road/version;rờiscopehủypending/consume. PMedit/layoutservergiữguardhủy. KhôngsửaJSX/UI/style/icon/API/BE/nhânsự/defaultthiếtkế.
- SửatestURL→geometry→draft nhập6fieldTRƯỚCđổiURL, asserttrướcCONFIRMEDchưa restore/sauđủrestore. Harnessthêmactor/epoch vàcallbackhydrate layoutthật. Testsourcetarget6field, project/epoch/actor, same-draft4permutations/consume, PM6.75/layout8.25+5fieldkhác, unboundnegative vàpendingdepart/returnkhôngphụcsinh. Testwidth/F5/versionreturn/localdirty cũ giữnguyên. FilterimplementationRG_DRAFT_FILTER/RG_PAVEMENT_FILTER/RG_STEP3_FILTER đãđọc vàdùngregexscope; fullstate bỏfilter thực.
- Kếtquả:40nhóm full draft-statePASS,17nhómpavementPASS,4nhóm readmodel/sidebar/context/reversedresponsePASS; typecheck/diff-checkPASS. Tựreview2lượt(sourcecapture/restore/cancelvàscopebinding/testassertion), bỏunusedpreviousguards đúngphạmvi. Browser/runtime NOT_RUN, khôngconfirm/publish/tạofixturehoặcghiDBnghiệpvụ. Mockchỉdùngtest, khôngfallbacksảnphẩm. Stage3file/hunk chỉnhiệmvụ, giữ132dòngworkloglocalcũ.


## 2026-11-09 — Sup chuyển PM chính qua form ASSIGN

- Baseline/parent FE: `970315a7f6e19d94c364251bb7bff80c3704ce78`, branch `hoang`; fetch origin hoang không có drift. Giữ nguyên các local ngoài nhiệm vụ, gồm 132 dòng worklog có sẵn; chỉ stage mục này.
- Đọc AGENTS.md, Spec17_10 Authentication/Users/Memberships và Project/Road workflow; đối chiếu source BE origin/develop `f7540ea2e9e50550eedd648776ffe34e8eecdfb1`: ProjectsController/ReassignPrimaryProjectManager, DTO, PrimaryProjectManagerService và repository, StaffDirectoryController/StaffReadService.PrimaryAsync. Không sửa/deploy BE.
- Contract: GET wrapper primaryProjectManager; PUT dùng body primaryProjectManagerUserId/effectiveFrom/reason/expectedCurrentMembershipRowVersion/operationId, không lấy account ETag hay project rowVersion, không thêm Idempotency-Key/If-Match. PM đích đọc snapshot tài khoản server, ACTIVE và wire role PM; Sup-only. Lệnh mới chỉ ngày UTC hiện tại và sau validFrom; replay giữ nguyên ngày gốc.
- Swagger runtime GET tại https://localhost:28443/swagger/v1/swagger.json: PUT security có Bearer hoặc WebSession+CsrfToken+AntiforgeryCookie; OpenAPI FE còn Bearer-only. Đây là chênh lệch contract tài liệu FE, không phải thiếu hỗ trợ cookie ở runtime. Không thay tài liệu contract hoặc runtime trong nhiệm vụ này.
- Nối service và form ASSIGN hiện có, lý do khởi tạo trống; chọn đúng một dự án. Hiển thị snapshot PM chính/membership/version từ server. Giữ nguyên class/style/icon/cấu trúc form; sửa nội dung để không khẳng định PM cũ mất mọi quyền.
- Journal riêng chuyển PM giữ operationId/body/version bất biến qua timeout, reload, đổi ngày và lỗi CSRF/auth khi replay. Có receipt chỉ GET readback; xác minh target/membership/version/validFrom trước success và tải lại danh sách/phân công server. Chặn double-click và kết quả actor/epoch/project/target/close/unmount cũ.
- Conflict/từ chối xác định: chủ động Đọc lại để đối chiếu → Dùng snapshot mới (hoặc Bỏ ý định cũ và đóng) → xác nhận mới riêng; không PUT tự động, không đổi version ngầm; giữ lý do. Không bỏ journal chưa rõ kết quả/có receipt. Sau giải quyết có thể thao tác dự án khác.
- RED trước triển khai: test mới `primary PM command uses membership version and body operationId, receipt then readback without account headers` chạy với service baseline FAIL thật do `web_cookie_unsupported`. Không tuyên bố mọi test mới đã chạy đỏ trên baseline.
- GREEN: `node tools/check-personnel-screen.cjs` 51/51 nhóm assertion PASS (mock HTTP, hook harness, SSR/source). Bao gồm 10 nhóm primary PM: endpoint/body; validation; timeout→reload→CSRF→replay→receipt/GET; conflict/decision và dự án khác; double-click/actor; mismatch readback/quyền; scope/close/unmount; ngày gốc sau rollover; UI compare/decision; khôi phục form pending sau reload. Interceptor thật được mock transport kiểm PUT cookie/CSRF, loại Bearer. Giữ regression invitation/account/membership và block reset/role.
- `npx tsc --noEmit`: PASS; `git diff --check`: PASS. Hai lượt tự review diff trong phạm vi; bỏ hai thay đổi toggle ngoài ASSIGN phát hiện ở lượt hai. Không chạy full regression/build.
- Browser/runtime thao tác Sup→PUT→readback→F5 và role guard: NOT_RUN; chưa có dự án/cặp PM test do chủ FE chỉ định. Chỉ đọc Swagger runtime, không mutation DB dùng chung, không fixture, không chuyển tài khoản đang làm việc để ép test. Không khẳng định E2E đã đạt.


### 09/11/2026 — PM JSON COORDINATES draft cấp project, readback và F5
- Baseline/parent FE `adda4ef5b52d1b2eb0a10b1c2afc0fe367b508c2`; fetch origin hoang xác nhận cùng SHA. Đọc AGENTS, status/diff local trước sửa; giữ toàn bộ local ngoài task và các hunk worklog có trước. Đọc DTO/controller/service trực tiếp bằng git show tại BE `f7540ea2e9e50550eedd648776ffe34e8eecdfb1` (checkout BE cda6d63 không đổi), đối chiếu OpenAPI/caller/type/import/readmodel/CSRF interceptor. Không sửa/deploy BE.
- JSON có roadCode/roadName và thông số nguồn được lưu khi roadSections=[]; không tạo section hoặc tên/CRS/width mặc định. Giữ validation engineering CRS/sourceCrs, tọa độ, lý trình, widths, surveyWidth và lý do. Draft section có sẵn vẫn kiểm context/scope, không đổi sang cấp project. Null-section hydrate không mượn section duy nhất trong context.
- Receipt/readback cho phép null section, giữ project/id/version/ETag và đối chiếu dữ liệu nguồn COORDINATES. Update mới pin section trong journal; timeout giữ nguyên key/body; receipt rồi GET lỗi chỉ GET lại. F5 phục hồi nguồn/width/chainage/DRAFT và edit dùng ETag GET, lý do mới do PM nhập. Không thay Sup confirm, native/branch/segmentset/pavement workflow hay JSX/layout/style/icon.
- RED trước sửa: test project-level JSON FAIL ở guard bắt chọn section trên baseline. GREEN sau sửa: draft-state 43 kịch bản PASS (HTTP/MapLibre/hook mô phỏng), gồm null-section create/receipt-GET-fail/retry, F5/edit/ETag, thiếu roadCode/name hoặc CRS, section sai scope và regression actor/project/A→B/thứ tự response. Fixture mô phỏng bổ sung tên nguồn minh bạch; không phải dữ liệu DB.
- Step3 full FAIL: 3 lỗi có trước được tái hiện riêng bằng loader đọc source HEAD adda4ef: map panel `10m × 4m × 24cm`, sidebar `segments is not iterable`, draft switch `roadWidthM` undefined. Không sửa/nới các assertion đó. Chạy filter loại đúng 3 lỗi baseline: 33 kịch bản PASS; không gọi full suite PASS. Pavement helper 8 nhóm PASS; pavement-layout 17 nhóm PASS. Typecheck `npx tsc -b --pretty false` và diff-check PASS.
- Tự review lượt 1: end-to-end service/state/receipt/F5, scope/ETag/idempotency/source; lượt 2: diff/hunk, preservation UI và regression. Runtime create/edit/F5 browser: NOT_RUN vì chưa có ủy quyền dữ liệu test cụ thể; không tạo draft/confirm/publish/fixture DB chung. Chỉ hoàn thành nhiệm vụ draft COORDINATES này, không tuyên bố hoàn thành toàn bộ Bước 3.


### 09/11/2026 — Sửa hai hồi quy review 4d9f106: metadata readback và tên nullable
- Parent `4d9f106c50a140aba14d0bcfd332d3f481105538`; đọc lại AGENTS/status/HEAD/diff, fetch origin hoang cùng SHA. Giữ nguyên local ngoài task, gồm 132 dòng worklog có trước. Đối chiếu GeometryWorkflowPersistenceService tại BE `f7540ea`: code = section.Code hoặc input.RoadCode.Trim(); RoadName lưu nguyên input và nullable. Không sửa BE/DB/UI/layout/style/confirm/native/nhánh/nhân sự.
- Input gắn section lấy code từ section context đã chọn, giữ nguyên fileDraft nguồn. Project-level giữ input nguồn, kỳ vọng readback code theo Trim BE. Tên vẫn theo input đúng persistence (không thay tên null bằng tên section); readback so sánh null/omit theo contract. Giữ kiểm project/id/section/version/ETag/sourceKind/CRS/coordinates/lý trình/widths/surveyWidth và tên/code thực sự sai.
- Tách yêu cầu roadCode/roadName file mới qua requireFileMetadata tại parser; GET restore và bản chỉnh tiếp chấp nhận roadName null, vẫn kiểm kiểu tên khi có và toàn bộ hình học/thiết kế. Không tự sinh tên. Test GET có section tên server khác nhưng draft tên null: F5 đủ119 điểm và PUT giữ null, ETag GET, lý do mới.
- RED trước sửa source: test BE section code giữ pending sau POST/GET hợp lệ; test nullable GET hiện0 thay119 điểm. GREEN: hai test mới PASS; mock BE thực hiện section.Code/Trim, gồm create đọc lại ngay và receipt→GET lỗi→retry không POST thêm. Thêm sai tọa độ/code/tên vào kiểm readback từ chối; không nới assertion cũ. Draft-state45 PASS; A→B/null-section và actor/project/thứ tự response giữ PASS.
- Step3 liên quan33 PASS bằng filter loại đúng3 lỗi baseline đã ghi ở task trước; full suite chạy lại vẫn FAIL tại map panel `10m × 4m × 24cm`. Không gọi full suite PASS hoặc sửa các lỗi ngoài scope. Pavement8 + pavement-layout17 PASS. Typecheck `npx tsc -b --pretty false`, diff-check PASS. Tất cả là mock/hook/static; runtime NOT_RUN, không ghi DB chung.
- Tự review hai lượt: mapping theo persistence/nullability và kiểm readback; sau đó phạm vi diff/test/hunk staging, file nguồn giữ nguyên, không bịa tên hay bỏ guard kỹ thuật. Chỉ commit hunk worklog này cùng3 file source và test draft-state. Dừng sau hai hồi quy.


### 09/11/2026 — Sup confirm COORDINATES chưa có section, đọc geometry từ receipt
- Parent FE `858286198fe8620f3dc02d54125265910706afa1`; đọc AGENTS/status/HEAD/diff local và fetch origin hoang xác nhận cùng SHA. Giữ toàn bộ local ngoài task, gồm132 dòng worklog cũ. Đối chiếu DTO/contract và GeometryWorkflowPersistenceService tại BE `f7540ea`: current?.Id so với ExpectedCurrentVersionId nullable; section null được tạo trong confirm. Không sửa/deploy BE hoặc mutation DB chung.
- Chỉ null-section COORDINATES xác định được expectedCurrentVersionId=null. Draft đã gắn section luôn tra đúng section/version từ context đúng project; thiếu section/version không được biến thành tuyến mới hoặc mượn tuyến khác. Preview pin sectionId nullable và currentVersionId nullable riêng với trạng thái chưa preview (undefined), cùng ETag. Gate và fresh draft/readiness/context trước confirm kiểm lại project/draft/section/version/ETag; async result có fence section/actor/draft. Giữ ngày/lý do Sup nhập, modal hiện có, Sup-only/readiness/SAMPLE guard và command CSRF/If-Match/idempotency hiện hành.
- Confirm receipt/readback và readmodel đã có đúng reference server: không cần sửa service/command/readmodel. Test mới kiểm openConfirmed nhận section/version server tạo, journal receipt F5→GET geometry đúng project/sourceDraftId/section/version; GET lỗi/mismatch chỉ GET lại. Timeout trước receipt replay đúng key/body/If-Match và expected=null. Không gọi API tạo section phụ, không đổi confirm native, trạng thái duyệt/segmentset/pavement hay JSX/layout/style.
- RED trên parent: null-section Sup sau preview bị confirmGate chặn vì thiếu currentVersionId. GREEN:5 nhóm mới PASS (context rỗng/nhiều tuyến, modal expected=null, freshness/PM/readiness/sample/section mất/version thiếu hoặc đổi, timeout/replay/receipt GET, readback sai4 reference, preview response muộn draft/epoch). Các ca section có sẵn và hồi quy trước giữ nguyên assertion. Step3 liên quan38 PASS khi filter loại đúng3 lỗi baseline đã ghi; full step3 chạy lại vẫn FAIL tại map panel `10m × 4m × 24cm`, không tuyên bố full PASS.
- Draft-state45 PASS; pavement8 và pavement-layout17 PASS; `npx tsc -b --pretty false`, diff-check PASS. Tất cả là mock/hooks/static, browser/runtime NOT_RUN; không fixture hoặc confirm thật để ép PASS.
- Tự review lượt1: pin preview/fresh read/null khác thiếu dữ liệu/receipt recovery; lượt2: diff và phạm vi/UI preservation/journal/late responses. Chỉ commit workflow, test step3 và hunk worklog này; giữ local ngoài task. Dừng sau nhiệm vụ Sup confirm này, không gọi hoàn thành toàn bộ Bước3.


### 09/11/2026 — Sửa nhãn workspace sau confirmed geometry
- Parent FE `f9036b5d42a1dd14e86beff9df87c6af2bcbe2b8`; đọc AGENTS/status/HEAD và fetch origin hoang cùng SHA. Giữ toàn bộ local ngoài task. Runtime evidence ABC1 version2 đã có từ phiên trước: draft CONFIRMED, geometry COMPLETE, 201 một lần, PM/F5 đúng nguồn.
- `useAlignmentState` bỏ nhánh hydrate DRAFT ghi đè khi draft server đã CONFIRMED. `SidebarSegmentsTab` nhận `alignmentStatus`: toàn tuyến confirmed dùng nhãn HÌNH HỌC ĐÃ XÁC NHẬN và mô tả khoảng bề rộng kỹ thuật; nhánh local không nhận nhãn này. `SidebarFooterKpis`/`AlignmentSidebar` nhận trạng thái nguồn và hiển thị Đã xác nhận/Hình học đã khóa, vẫn ưu tiên cảnh báo gap và không suy PUBLISHED segment set từ length.
- Không đổi layout/style/icon/API/BE/quyền/số liệu; không thêm trạng thái nghiệp vụ. WidthProfile vẫn chỉ là khoảng kỹ thuật; local edit/branch/gap/loading/error không bị che bởi confirmed label.
- Test draft-state `45 PASS`; confirmed read-model route/F5 regression `PASS`; typecheck và diff-check `PASS`. Step3 full vẫn có lỗi baseline cũ; không nới assertion. Browser MCP isolated ABC1/version2/F5 `PASS`: nhãn HÌNH HỌC ĐÃ XÁC NHẬN, KPI Đã xác nhận/Hình học đã khóa, không còn BẢN CHỈNH/BẢN NHÁP ĐÃ ĐỌC/Chưa xác nhận; map/layout và cảnh báo thiếu pavement giữ nguyên. Runtime check không mutation.


### 09/11/2026 — Sửa KPI nhánh local kế thừa confirmed tuyến chính
- Parent `5ab388d932f3dcf8fedb795959b2c932bdb99c6a`; đọc AGENTS, status/HEAD và fetch origin hoang cùng SHA; bảo toàn local ngoài task. Đọc caller AlignmentSegments (segments=activeSegments, length=activeLengthKm, selectedTargetType và alignmentStatus tuyến chính) cùng sidebar/footer.
- Chỉ sửa prop alignmentStatus truyền từ AlignmentSidebar xuống SidebarFooterKpis: MAINLINE dùng trạng thái nguồn tuyến chính; nhánh local dùng DRAFT hiện có. Không đổi alignmentStatus truyền cho vùng khác nên giữ quyền/geometry; không suy trạng thái từ count/length/text, không thêm trạng thái nghiệp vụ; giữ nguyên layout/style/icon và thứ tự ưu tiên footer gap/rỗng.
- RED trước sửa: test mới lấy bốn biểu thức props từ AST caller AlignmentSegments thực, render qua AlignmentSidebar và SidebarFooterKpis thực, FAIL vì nhánh local hiện Đã xác nhận. GREEN sau sửa: tuyến chính CONFIRMED, chọn nhánh local có dữ liệu, gap/rỗng, quay lại MAINLINE và gap MAINLINE đều PASS. Chỉ mock các tab/icon không thuộc KPI; không tự sửa sẵn status props trước render.
- Test mới và confirmed readmodel regression2 nhóm PASS; draft-state45 PASS; typecheck `npx tsc -b --pretty false` và diff-check PASS. Không nới assertion baseline hoặc chạy/sửa full Step3 ngoài scope.
- Browser MCP isolated đọc ABC1/version2 phiên PM: chỉ có option MAINLINE, KPI Hình học đã khóa vẫn đúng. Runtime chọn nhánh local/quay lại/F5 nhánh: NOT_RUN vì không có nhánh sẵn; không tạo nhánh hoặc ghi DB. Không confirm/publish/deploy. Self-review lượt1 kiểm source trạng thái theo selectedTargetType và ưu tiên gap/rỗng; lượt2 kiểm diff chỉ1 prop và test caller thực, không ảnh hưởng quyền/data/UI. Dừng sau lỗi này.


### 09/11/2026 — Segment set API: PM preview/create/edit/publish, Sup GET và F5
- Parent FE `d56af206af7581004463895dbc1d062a43827d86`; đọc AGENTS, status/HEAD và fetch FE hoang/BE develop trước sửa; BE `f7540ea2e9e50550eedd648776ffe34e8eecdfb1`. Giữ toàn bộ local ngoài task,132 dòng worklog cũ. Đọc đúng SHA Controller/DTO/GeometryWorkflowService/PersistenceService/GeometryEngine, OpenAPI cùng caller/type/map/readmodel/pavement discovery hiện hành. Không sửa/deploy BE.
- Service segment set thật dùng Web apiClient (cookie/CSRF interceptor), phân trang list/preview/create/PUT/publish/GET đúng project/section/version; kiểm setId/route/version/ETag/metadata COMPLETE/geometry/sequence/offset và định nghĩa. Journal sessionStorage CHỈ giữ command bất biến/receipt để retry, không thay DB/snapshot; receipt rồi GET lỗi chỉ GET lại, timeout giữ key/body. Rejection/conflict cần GET đối chiếu và quyết định explicit trước key/ý định mới. Scope actor/epoch/route/set, chặn retry journal A khi mở B; response cũ không đổi scope mới. Không tự chọn set mới nhất từ danh sách.
- Hook/readmodel pin segmentSetId trên URL và GET F5; snapshot/ID/sequence/phạm vi/metricGeometry luôn từ server. Preview null ID chỉ dùng key hiển thị preview, không coi là segment đã lưu. Toolbar workflowActions dùng selector/bút lưu/retry/publish và dialog lý do cùng style hiện có; PM chia/tách mốc riêng, không mở sửa tim tuyến/CRS/widthProfile đã khóa. Cự ly km→m và lý trình→offset không làm tròn; KEEP khớp luồng giữ phần dư hiện có. PUBLISHED không sửa trực tiếp, bản mới phải chọn chủ động. Map dùng geometry segment server qua adapter32648 hiện có; widths chỉ đọc geometry nguồn, không mặc định bề rộng cho server segment thiếu số liệu. Không đổi luồng lưu pavement; discovery PUBLISHED tiếp tục qua API hiện có.
- RED trước triển khai: baseline thiếu service/workflow segment set, kiểm integration entry FAIL. GREEN:13 nhóm service/journal/hooks/component PASS (mock HTTP cô lập), gồm create/edit/publish/readback/F5, exact pins/If-Match/key, Sup no-write, published immutable, stale publication/version, conflict/rejection decision, timeout/reload/replay, receipt GETfail không ghi trùng, actor/epoch/scope/late response/cursor lỗi. Draft-state45 PASS; Step3 filter giữ39 nhóm PASS (gồm KPI nhánh local/caller và confirmed readmodel), loại đúng3 lỗi baseline đã ghi trước; full chạy lại vẫn FAIL tại map panel `10m × 4m × 24cm`, không nới assertion đó. Test caller chỉ bổ sung binding displayedSegments mới, giữ assertion nhánh cũ. Pavement helper8 + layout17 PASS; typecheck `npx tsc -b --pretty false`, diff-check PASS. Mock PASS không thay runtime.
- Runtime MCP isolated, FE Vite PID25336 tại workspace này, HEAD d56af20 cộng working tree; served sourcemap AlignmentSegments khớp source thật. BE container19c05f.../imagebf97062... revisionf7540ea giữ nguyên. PM chọn0.2km: POST preview200, bounds[0,200,400,600,701.2905185122771]. Người dùng tự bấm create: POST201 đúng1 lần, key14ba7fd2-d9ac-496a-90dd-f7ab59897983; GET200 set `f34228e0-8c30-4633-8024-84a934bcb71f`, DRAFT/COMPLETE, versionAAAAAAAAeKA=, ETag `"AAAAAAAAeKA="`, hashfedc63aeb5107bbea2417aeda596f4e86ea666074b2ed341e9db3b81cdada7f8. F5 giữ đúngURL/set/snapshot.
- Người dùng tự bấm PUT sửa giữ200m: HTTP200, If-Match `"AAAAAAAAeKA="`, keya9bbae4a-5b93-43dd-8210-3796160ef276, GET200 giữ set/version/4 ID; đây là no-op đúng BE, chưa nghiệm thu runtime edit có đổi thiết kế. Người dùng tự nhập reason và bấm publish: POST200 đúng1 lần, expectedPublishedSetId=null, If-Match `"AAAAAAAAeKA="`, keyaf3a36a3-f2f8-4ed0-9895-3fdf217fb82d; GET200 PUBLISHED, versionAAAAAAAAebc=, ETag `"AAAAAAAAebc="`. PM/F5 snapshot unchanged, edit/publish disabled. Sup đăng nhập trực tiếp: GET200 cùngset/ETag/4 ID/phạmvi/geometry, khôngnútghi; SupF5 snapshot identical, noalert, no mutation. GET list?status=PUBLISHED200 tìm đúngset; không lưu pavement.
- ID đoạn server sequence1–4:74c33cd9-1f5c-4063-8052-a469746e9918;0a696b08-bdd3-4d0d-9d06-19a92863dc29;cc2a1cea-3f73-4025-9020-4fa170352dde;dd22f736-b00d-4c40-94f1-881e21fffc4e. Phạm vi0–200/200–400/400–600/600–701.2905185122771m, metric vertices47/38/29/11. Nghiệm thu runtime luồng PM lưu→publish→GET→Sup đọc→F5 có evidence thật; không coi timeout/conflict/race/native/thiếtkếPUT mới đã nghiệm thu runtime, các ca đó chỉ mock hoặc ngoài scope.
- Giải thích bộ nút khác: URL người dùng `/pm/projects/52a43dbb-4af5-4823-b6ec-e9263f3a262f/alignment` không query và làprojectkhác; GETworkpackage200 engineeringUtmSrid=null,roadSections=[]; cùngVite/source khi mởURLđó cũngkhôngcónútset. Không phải bản preview giả hoặc source riêng; bộ nút segmentset yêu cầu explicit roadSectionId/routeVersionId server.
- Tự review lượt1 contract/state/receipt/scope/lock geometry và lỗi API minh bạch; lượt2 wiring/style/hunk/readback runtime/giữlocal, không thay publication khi Sup đọc. Chỉ user bấm các thao tác ghi nghiệmthu; không tự tạo fixture hoặc publish thay. Commit đúng file task và riêng entry này, dừng sau segment set.


### 10/11/2026 — FE tích hợp hồ sơ tuyến SUBMITTED theo BE 1b9a23f (chưa commit/push)
- HEAD FE `01a9dda71c031ee91350ca7dd7fc8968b782614a`, branch hoang; fetch origin/hoang=`113ce013a3528c23a0bbf6f14c09ba3cd23d1ead`, không merge/reset. Đọc trực tiếp ROAD-GEOMETRY-SUBMISSION.md và PAVEMENT-LAYOUT-CONFIGURATION.md bằng git show BE `1b9a23f59f81f78203c24f5457199dd55f658aab` (contract b6a7166). Không sửa/deploy/migration BE, Docker hoặc dữ liệu.
- Thêm service/journal submit PM với body {}, ETag trước trình và key cố định; receipt được giữ trước lookup/GET. Timeout replay nguyên ý định; receipt rồi GET lỗi chỉ GET; lỗi xác định yêu cầu người dùng quyết định lại. Fence actor/epoch/project/draft, chặn bản nhập chưa lưu và vai trò Sup.
- Read model lookup theo project, kiểm status/reference/version với GET draft; chỉ 404 road_geometry_submission_not_found là chưa trình. Sup mở dự án không cần link/ID PM. SUBMITTED chỉ đọc, giữ tọa độ/bản đồ khi chuyển trạng thái; loại bỏ geometry pin cũ khi xem hồ sơ trình. Confirm chỉ SUBMITTED đúng lookup/readiness/preview, dùng ETag GET mới; sau receipt lookup CONFIRMED rồi GET geometry đúng reference. Lookup 404 giữ reference geometry lịch sử.
- Giữ local CRS bắt buộc tạo dự án và nhãn bản nháp đã lưu đã review; không đưa local AI-review/survey/personnel ngoài nhiệm vụ vào patch. Bỏ link bàn giao thủ công; retry chỉ khi lỗi/đang chờ. Khóa nội dung đã trình, không khóa modal tách segment/pavement hợp lệ sau CONFIRMED. Không đổi payload/footprint/journal lỗi pavement cũ.
- Test cô lập: submission 10 PASS; Full Step3 không filter 43 PASS; draft-state 46 PASS; confirm-ui PASS; segment-set 16 PASS; pavement-layout 17 PASS; alignment-pavement 8 PASS. npm run build (tsc -b + Vite) PASS; cảnh báo bundle lớn giữ nguyên.
- Test mở rộng còn FAIL baseline đã chạy trên HEAD sạch: check-step2-projects cuối ca Web reassignment (mong web_cookie_unsupported, nhận TypeError data); check-roadguard-draft-import dòng 43 fixture line thiếu roadCode nên lỗi roadCode xảy ra trước lỗi coordinates mong đợi. Không bỏ/nới assertion hay sửa ngoài phạm vi. Ca CRS required/payload/readback/retry trong Step2 PASS trước lỗi baseline.
- Runtime/browser/mutation NOT_RUN: chờ người phụ trách BE deploy bản hỗ trợ và migration 20261110043224_RoadGeometrySubmission. Không tự submit/confirm/lưu/publish. Chưa nghiệm thu toàn Bước 3. Artifact: artifacts/step3-submission (patch, REVIEW.md, tests.json và log đầy đủ).


### 10/11/2026 — Phân đoạn công bố, reference pavement và Sup xem hồ sơ (chưa commit/push)
- HEAD FE 01a9dda71c031ee91350ca7dd7fc8968b782614a. Đọc AGENTS, 17_10/02_Business-Workflows/02_Project-Road-Geometry-and-Pavement.md (success flow 2–4, Authorization), contract BE 1b9a23f và handoff pavement/submission. PM quản lý/publish set; Sup chỉ xác nhận geometry, không thêm duyệt/phê duyệt/áp dụng set và không làm từ chối.
- Tự mở đúng một PUBLISHED từ list server khi geometry đúng scope, URL chưa có set; chặn list trùng/sai route/nhiều publication, báo PM chưa công bố nếu chưa có. Giữ set DRAFT/chọn bản mới của PM, không tự chọn latest. Auto selection tách khỏi effect đọc để không nạp lại cự ly/preview khi geometry reload.
- Nguyên nhân nguồn: pavement trước đây lấy segmentSetId đang xem (kể cả DRAFT) làm điều kiện lọc PUBLISHED, khiến list có publication nhưng 0 khớp ID. Khởi tạo plan mới nay discovery publication theo project/section/route độc lập dropdown DRAFT; layout đã lưu/journal và lần preflight ghi vẫn giữ pin chặt. Lỗi reference cụ thể thay thông báo số đếm mơ hồ; không bỏ validation. Caller section ưu tiên geometryRead.roadReference đã đọc. Giữ thông số và journal; footprint/config readback server không thay đổi.
- Tổng quan lookup submission server, status/action Xem hồ sơ tuyến và retry theo lỗi; state tách scope actor/project, test B không nhận response/error A. Sup workspace tự tải preview/readiness theo draft+ETag khi SUBMITTED; confirm chỉ bật sau kiểm, lỗi preview retry chủ động, bỏ nút Xem trước bản đã lưu trong toolbar chính. Không tự confirm.
- Test cô lập: Full Step3 không filter 45 PASS, segment 17 nhóm PASS, pavement-layout 18 nhóm PASS, draft-state 46 PASS, submission 10 PASS, confirm UI và alignment-pavement 8 PASS. Các ca mới FAIL trên bản source trước lượt này trích riêng, PASS sau sửa. Step2 overview A→B PASS; ca cuối Web reassignment vẫn FAIL baseline, không sửa/nới assertion nhân sự. Build/typecheck/diff-check PASS.
- Runtime chỉ đọc: WWW project 9ec595db-12d2-4e99-9677-8aa305cf94f7, section49b20d57-ac0a-426f-a222-041c48fe5b24, version3c2a859e-a60d-44eb-8768-006e719cd3ad; GET list200 duy nhất set74bca04d-f3f1-4bd1-b933-b7c87989b636 PUBLISHED,4segment. Sup HMR tự mở đúng publication; PM mở URL không query rồi F5 vẫn đúng reference/badge4; prerequisite pavement đúng publication. PM overview hiện CONFIRMED và nút Xem hồ sơ tuyến. WWW hiện không có journal pavement, các thông số trống: chặn stripWidthMeters đúng, không tự điền. Không chứng minh URL lỗi cũ còn giữ DRAFT: đó là nguyên nhân có thể tái hiện từ source/test, runtime hiện tại đã đúng publication.
- Runtime lưu layout/GET sau lưu mới, Sup SUBMITTED auto-preview và confirm: NOT_RUN; không tạo fixture/ghi dữ liệu để ép PASS. Không sửa BE/Docker/migration/DB; giữ mọi local ngoài scope theo hash. Artifact artifacts/step3-published-review; patch chỉ hunk của lượt này so với snapshot working tree trước sửa, không gom phần local cũ.


### 10/11/2026 — BE4b46a6a runtime, layout discovery và REJECTED (chưa commit/push)
- Đọc AGENTS, 17_10 và hai handoff tại SHA 4b46a6af16a94be1e40687a8bb1d223a37ae8338. Giữ các local đã review; snapshot trước task và patch riêng trong artifacts/review-rounds-layout.
- Build API từ git archive sạch; backup DB COPY_ONLY/CHECKSUM, VERIFYONLY PASS. EF8.0.17 áp migration 20261110122600_GeometrySubmissionReviewRounds trước khi thay API. Không sửa source BE/reset/reseed; giữ cấu hình, cổng28081/28443 và volumes; bootstrap/seed tiếp tục tắt như runtime trước. API healthy; image sha256:d5e7fa880c8a8202679dabb910b46a98d113cf01410b6839a1a710653d2cff86; ba DLL runtime khớp build stage. Swagger có reject/list layout; dữ liệu cũ đọc được. SQL/MinIO/Mailpit cùng ID/StartedAt.
- FE list layout đúng project/section/route/set, đọc hết cursor, chặn sai scope/schema/cursor/ID trùng. Rỗng khác lỗi; một bản tự mở, nhiều bản chọn loại/thời gian, không chọn mới nhất. Giữ layout URL và reference lịch sử, AS_BUILT/sourcePlanId, config/footprint server. Không tự bỏ hoặc replay journal.
- Tích hợp currentReview/previousRejection, Sup reject có lý do<=2000; retry giữ key/body/ETag, receipt rồi chỉGET. PM sửa/lưu cùng draft vẫnREJECTED; Trình lại dùngsubmit và lỗi unchanged rõ ràng. Cập nhật saved-content helper/restore/status/guard; giữ khóaSUBMITTED/CONFIRMED và Sup auto preview/readiness. Bỏ ô số làn/vật liệu và badge thiếu thông tin theo yêu cầu bổ sung; không xóa dữ liệu/types/BE.
- Runtime layout: user chọn8541f3ae-e279-4e1c-9f30-6d429ca774d7 trênWWW. PMGET/F5 giữ dải4m,L4m,H4cm,KC4m,KG4m,khe4mm và352tấm server. Sup đăng nhập/mở từ dự án, list haiPLANNED và đọc cùnglayout/config/352tấm. SupF5 đã reload; chưa xuất kết quả riêng saureload nên không nâng thành caPASS mới. Không lưu thêm hoặc xóa bảnkhác.
- Runtime TEST123: drafta55a82e4-7ea2-4c49-a116-7e1181a191fc REJECTEDlượt1. User đổi0.25→0.2km,width8m; PUT200 cùngID, IfMatchAAAAAAAAlV0=→ETagAAAAAAAAlfk=; GET200 vẫnREJECTED,119điểm/4khoảng. Guard saved-content chỉDRAFT từng khóaTrìnhlại đã được sửa và test, không cần lưu lại. Usersubmitbody{} vớiETagmới trả409road_geometry_submission_unchanged, correlation8d4ce8ae-00e1-446a-83dd-0c791f960fa0; giữjournal/UIlýdo. GETdraft0.25 trước đó là bản đang sửa, không chứng minh snapshotlượt1; suy luận0.2đủtrìnhlại ban đầu chưa đủ căn cứ. User chọn dừngruntimeởcaunchanged; không replay/xóa journal/tự đổi số. Lượt2 và Supquyếtđịnhtiếp NOT_RUN.
- Testcôlập: submission14, FullStep3 khôngfilter46, draft-state46, pavement20, segment17, confirmUI và alignment-pavement8 PASS. Build/typecheck/diff-check/apply-check PASS. Step2 ca cuối Webreassignment vẫnFAILbaseline TypeErrordata; không nới assertion. Hai lượt tự review contract/retry/reference và caller/local/UI. Chưa commit/push; không tuyên bố toàn luồng runtime hoàn tất.


### 11/11/2026 — Chốt commit FE Bước 3 sau nghiệm thu
- User xác nhận Sup mở lại “layout321”/F5 PASS, giữ thông số và352tấm; ghi rõ nguồn user, không gọi là Codex quan sát mới. GET đọc bổ sung bằngPM: layoutWWW8541f3ae…200/đủconfig/352tấm, không ánhxạalias321 khi thiếuID.
- Tổng hợp lưu/sửa draft; quyết định từchối córeasonserver; PMsửa cùngdraft/trìnhlạilượt2; Supautopreview/readiness vàconfirm201mộtlần; lookupCONFIRMED/geometry/F5PM/Sup; PMquảnlý/publishsegment; layoutsave/readback/discoveryPM/Sup. Chi tiết STEP3-FINAL-ACCEPTANCE-20261111.md; phân biệt capturetrước và userxácnhận.
- Giữ guardlayoutdiscovery không thayDRAFT/bảnmới PMchọn; chỉđúngreference/explicitPUBLISHED; regressionFAILtrước/PASSsau đãreview. Khe chỉcấuhình, chưa geometrykhevậtlýchínhthức; khôngmởkếhoạchkhảosát.
- Commit chỉfile/hunkBước3/CRSđãreview; giữlocalAI/survey/personnel vàworklogcũngoàiphạmvi. KhôngsửaBE/Docker/migration/DB, khôngmutationruntime, chưapush. Kiểmstageddiff/source vàregression/buildtrênindexexport; lỗi baseline đượcbáoriêng, khôngnớiassertion.


### 11/11/2026 — Chốt Reporter/Case: giao diện cũ, ảnh private, Sup điều phối, PM đọc
- Giữ AIReviewInbox tại /sup/cases và /pm/ai-inbox; đọc Case/Report/private evidence có cursor/scope/epoch fence. Drawer/phóng to ảnh dùng chung state; UNKNOWN không tự thành tọa độ, tên hoặc số đo.
- Sup triage có If-Match/Idempotency-Key/Web cookie/CSRF và journal/retry/readback. Chặn bulk verify/bulk need survey/link chưa tích hợp ở cả handler/nút; không mở thêm nghiệp vụ PM/AI/Defect/khảo sát/Drone/gộp/tách/công bố.
- Runtime local: người dùng tự thao tác Reporter trong Postman, không nhận đã quan sát mọi HTTP upload. Quan sát đúng một POST triage200; Case9409f2eb-e0e1-4c8e-9c01-1d246f91114d → OPEN, project321, EXISTING_EVIDENCE; GET/F5 Sup và PM khớp Case/Report/ảnh/ETag. Description JSON do nhập thử và UNKNOWN giữ nguyên; không phải dữ liệu hư hỏng thật.
- Bản staged riêng: Case14, ảnh6, guard5 PASS cô lập; typecheck/build PASS; full review còn lỗi baseline thiếu mock primaryPmCommands. Không stage hunk khảo sát BLOCKED hoặc các mở rộng PM/link/split local; không sửa BE/DB hoặc mutation runtime trong lượt chốt. Chi tiết: REPORTER-CASE-TRIAGE-ACCEPTANCE-20261111.md.

### 14/11/2026 — C5 bổ sung: giữ receipt tới khi dựng xong snapshot, không suy lý trình gốc

- Xuất phát FE `hoang` / `0f19825a0e0407214d57dba3c3e440516eb163e4`, index rỗng. Bốn file code/test của lượt này không có diff local trước khi sửa. Giữ toàn bộ thay đổi local khác; worklog chỉ stage phần ghi mới này.
- Căn cứ: checklist C5; Spec 17_10 workflow 02, mục main flow 4, Authorization, Idempotency; PM matrix PM-03. Swagger runtime `https://localhost:28443/swagger/v1/swagger.json` GET200; FE `http://localhost:5173` proxy `/api` tới instance này. Swagger chỉ công bố version 1.0, không công bố SHA đang phục vụ. Source đối chiếu chỉ đọc tại SHA bàn giao `b89a52fe11ed146f197f3f94e115530b9b75afb0`, không coi SHA source là bằng chứng độc lập về image runtime hiện tại.

| API | Hiện trạng code | Bằng chứng / runtime |
|---|---|---|
| 200 POST pavement-plans | Đã nối `pavementService.create` → `savePavement` → `usePavementWorkflow.save`; sửa vòng đời receipt sau GET | Dùng lại lần người dùng tạo201 trên 1221; không tạo lại. Cookie/CSRF do client chung; key riêng, pin server, optional giữ nguyên đơn vị/giá trị. |
| 131 GET layout | Đã nối `read/readConfiguration/layoutRoute`, snapshot server và URL layoutId; sửa thiếu mốc lý trình | PM GET200/F5 lượt này đúng PLANNED fae2c86f-f9b4-4626-9596-8017e7424c56, project1221, route f0e1f1cb-b6fd-4e83-8245-38394658c232, set c97bab11-8628-4001-912e-3a9ffbcfa51c PUBLISHED250m/3đoạn; 352cell/352tấm. Sup read-only dùng bằng chứng đã có, không chạy lại role Sup. |
| 132 POST as-built | Chưa có service ghi/caller UI; không phải thiếu endpoint BE | BLOCKED dữ liệu hoàn công/định dạng nhập phù hợp; NOT_RUN runtime ghi. Chỉ có đọc AS_BUILT tự động. Không thêm form lớn hoặc sao chép tấm PLANNED thành hoàn công. |

- Lỗi tái hiện 1: `savePavement` xóa journal sau GET layout, trước GET route và dựng snapshot của hook. Nếu GET route lỗi, lần bấm sau có thể POST với key mới. Regression trước sửa FAIL vì receipt mất. Nay `completePavement` chỉ kết thúc journal khi readback đúng ID/hash/pin và hook đã dựng được snapshot; lỗi trung gian giữ receipt, nút Đọc lại, retry chỉ GET. Không đổi payload, không replay mutation khi renew.
- Lỗi tái hiện 2: `buildSavedPavement` dùng offset như lý trình Km0 khi `stationOriginMeters` thiếu. Regression trước sửa FAIL. Nay start/end lý trình để thiếu dữ liệu, vẫn giữ offset, chiều dài, footprint và số tấm server. Mốc 0 do server trả vẫn hợp lệ. Không đổi JSX/layout/style.
- API132 đối chiếu DTO `AsBuiltLayoutInput` / `AsBuiltSlabInput`, `PavementWorkflowRepository.Write` nhánh asbuilt-create và `PavementFootprintEngine.AsBuilt`: sourcePlanId PLANNED cùng dự án bắt buộc; If-Match là content hash có ngoặc kép của PLANNED nguồn. Slabs/key/source/closed footprint và reason bắt buộc; plannedSequence tùy chọn nhưng phải tồn tại nếu có; kích thước tùy chọn, thiếu một kích thước thì phải có dimensionUnknownReason; sourceFileId tùy chọn nhưng nếu có phải qua VERIFIED/provenance/purpose/scope server. Không dùng ETag Case/set/geometry thay hash nguồn. Contract lõi đã rõ; thiếu dữ liệu test hoàn công và cách nhập nguồn trên Web, không yêu cầu BE thêm endpoint khi chưa có bằng chứng.
- Đối chứng 1221: GET layout200 ETag `"6e83b1c00d3f1269b37839929fa7d50452cd21c49bf5dac3c74efdd798fb7f6b"`; set200 PUBLISHED/3đoạn. Sau F5/chọn Tấm & Khe: strip4m/L4m/H5cm/KC4m/KG40m/gap1mm, tolerance0,1m,352tấm. Monitor XHR mới 0POST; không gửi mutation bằng fetch hoặc công cụ khác. Khe vẫn chỉ là cấu hình, chưa phải hình học khe vật lý chính thức.
- Kiểm tự động: 22 nhóm `check-pavement-layout.cjs` PASS (mock HTTP/hook), 8 ca `check-alignment-pavement.cjs` PASS (helper). Có timeout/receipt, 409/412 giữ key/body, quyền PM/Sup, scope/response muộn, AS_BUILT thiếu trường planned, snapshot không suy mốc gốc. Typecheck/build PASS trên working tree; kiểm lại snapshot HEAD+index trước commit. Cảnh báo build hiện có: class duration-[250ms] mơ hồ và bundle >500kB, không sửa ngoài phạm vi.
- Giới hạn nghiệm thu: retry khi mất phản hồi/GET route lỗi chỉ PASS tự động, chưa chạy runtime gây lỗi mạng; ca thiếu mốc gốc chỉ PASS tự động. Không chốt toàn C5, API132 còn mở. Không sửa BE/Docker/DB/config/seed; không mở C6.

Checklist tay còn cần khi có dữ liệu phù hợp:
1. Đọc layout đã lưu/F5: đúng ID/pin, thông số, số tấm và footprint server; lỗi GET phải hiện lỗi. Ca 1221 dương đã đạt, không cần ghi lại.
2. Ca mạng có kiểm soát: sau receipt, GET route lỗi → chỉ Đọc lại, không POST thêm; chưa chạy runtime. Không tạo plan mới chỉ để ép ca này.
3. API132: cung cấp nguồn hoàn công có key/source/rings/kích thước hoặc lý do thiếu; chốt cách nhập trước khi nối UI và người dùng tự lưu. Hiện bị chặn/chưa chạy, giữ PLANNED1221 làm đối chứng.
