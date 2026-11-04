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
