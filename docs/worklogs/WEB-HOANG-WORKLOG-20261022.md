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
   - Màn hình Điều phối nhanh (`/pm/fast-track` - `PM-10`): Phân quyền chuẩn xác cho PM lập dự thảo và xuất bản chính sách (`API-162..167`), hiển thị danh sách lý do cụ thể khi không đủ điều kiện xử lý nhanh (`API-146`), điều hướng và đồng bộ dữ liệu mượt mà sang màn hình Gói sửa chữa (`/pm/proposals` - `PM-09`).
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

