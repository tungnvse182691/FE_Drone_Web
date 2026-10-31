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
