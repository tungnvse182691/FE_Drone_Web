# Worklog: HOÀN THIỆN ĐỒNG BỘ TIM TUYẾN CHÍNH & TUYẾN PHỤ (WF-02), MÀN HÌNH PHÊ DUYỆT TUYẾN SUPERVISOR VÀ BÓC TÁCH KHỐI LƯỢNG TRONG QUẢN LÝ DỰ ÁN

- **Thời gian thực hiện:** 12/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.4 (Khởi tạo dự án DA01), 8.1.5 (Thiết lập hình học tim tuyến WF-02, FR-06, FR-07, BR-35).
  - 10 Điều bất biến (`AGENTS.md`): Điều 1 (Zero Money / Quản lý khối lượng kỹ thuật thuần túy), Điều 2 (Chỉ Supervisor mới có quyền thẩm duyệt & khóa tim tuyến `CONFIRMED`), Điều 3 (Đóng băng hồ sơ sau khi duyệt), Điều 10 (Design System: Màu vàng đồng `#C9A227` cho CTA chính).
  - Phong cách thiết kế: **Minimalism**, thuần Việt 100%, bộ icon **Material Symbols** đồng bộ, Mock API reactive qua CustomEvent `roadguard_state_change`.

---

## I. BỐI CẢNH VÀ VẤN ĐỀ CẦN GIẢI QUYẾT

Trước khi thực hiện các thay đổi này, hệ thống gặp một số bất cập trong luồng làm việc giữa Project Manager (PM) và Supervisor (Giám sát):
1. **Chưa tính quãng đường tuyến phụ (Branches):** Khi PM nạp tim tuyến và tạo các nhánh rẽ kết nối (nút giao, đường gom), hệ thống chỉ tính chiều dài của trục chính LineString (`mainline`), chưa cộng dồn chiều dài các tuyến nhánh phụ vào tổng chiều dài công trình.
2. **Menu "Phê duyệt tuyến" của Supervisor bị trỏ thẳng vào 1 dự án:** Khi Supervisor click menu `/sup/alignment`, hệ thống tự động fallback chọn dự án đầu tiên và mở thẳng bản đồ GIS, không cho phép Supervisor xem danh sách các dự án đang chờ duyệt tim tuyến.
3. **Dữ liệu tim tuyến chưa đồng bộ sang Supervisor:** Khi PM nhập tim tuyến và chia phân đoạn ở dự án mới, Supervisor vào xem thì số liệu không cập nhật hoặc bị trễ do chưa lưu tức thì và chưa phát sự kiện reactive.
4. **Màn hình Quản lý dự án chưa thống kê và chưa phân định tuyến chính / tuyến phụ:** Tại trang Tổng quan dự án (`/sup/projects/:id`), các thẻ KPI, Header và Bảng phân đoạn chỉ hiển thị số liệu gộp hoặc `0 km` nếu là dự án mới, không bóc tách rõ khối lượng trục chính là bao nhiêu và các tuyến nhánh phụ là bao nhiêu.

---

## II. CHI TIẾT CÁC CẢI TIẾN VÀ FILE ĐÃ THỰC HIỆN

### 1. Đồng bộ và tính toán tổng quãng đường (Trục chính + Tuyến phụ)
- **Cơ chế tính toán:**
  - $L_{\text{chính}}$ (`mainlineLengthKm`): Tính toán theo tọa độ LineString WGS84 EPSG:4326 qua công thức Haversine trắc địa.
  - $L_{\text{phụ}}$ (`branchesTotalLengthKm`): Tính tổng chiều dài toàn bộ các tuyến nhánh rẽ trong mảng `branches`.
  - $L_{\text{tổng}}$ (`totalProjectLengthKm`) $= L_{\text{chính}} + L_{\text{phụ}}$.
- **Lưu trữ tức thì:** Khi PM nạp GeoJSON, nhập tọa độ manual, tạo nhánh mới (`handleAddBranch`), xóa nhánh (`handleDeleteBranch`), hoặc chia đoạn tự động:
  - Tự động gọi `alignmentService.saveAlignmentData()` và `projectService.updateProjectAlignment()`.
  - Phát sự kiện `roadguard_state_change` để mọi vai trò và component trên web cập nhật đồng thời.

### 2. Màn hình Danh mục thẩm duyệt tim tuyến cho Supervisor (`/sup/alignment`)
- **Tạo mới component:** [`src/pages/(pm)/alignment/AlignmentApprovalList.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/alignment/AlignmentApprovalList.tsx)
  - Khi Supervisor vào `/sup/alignment` (không kèm `id` trên URL), màn hình hiển thị bảng danh sách các dự án cần thẩm duyệt tim tuyến thay vì nhảy thẳng vào bản đồ.
  - Bảng thống kê: Mã & Tên công trình, Kỹ sư PM phụ trách, Khối lượng tim tuyến (tổng chiều dài, trục chính, số nhánh phụ), số lượng phân đoạn lý trình, trạng thái hồ sơ (`DRAFT` / `PENDING_APPROVAL` / `CONFIRMED`).
  - Nút bấm **"Thẩm duyệt tim tuyến"** điều hướng trực tiếp vào bản đồ GIS của đúng dự án được chọn (`/sup/projects/:id/alignment`).

### 3. Phân định rõ ràng Tuyến chính & Tuyến phụ trong Quản lý dự án (`ProjectOverview`)
- **Header dự án ([`ProjectOverviewHeader.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx)):**
  - Hiển thị badge kỹ thuật: `Trục chính: X km • Y tuyến phụ (Z km)`.
  - Bổ sung Workflow Banner khi PM đã nạp tim tuyến và trình duyệt: thông báo hồ sơ đang ở trạng thái `CHỜ DUYỆT (PENDING APPROVAL)` kèm nút chuyển nhanh vào phê duyệt.
- **Thẻ Khối lượng tuyến ([`ProjectHighlightsGrid.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx)):**
  - Card 2 hiển thị tổng $L$, đồng thời có khối con bóc tách 2 dòng cố định:
    - 🟡 **Trục chính (Mainline):** Chiều dài trục chính và dải lý trình.
    - 🟠 **Tuyến phụ (Branches):** Tổng chiều dài các nhánh và số lượng nhánh rẽ.
- **Bảng Hình học tuyến ([`ProjectSegmentsTable.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx)):**
  - Thiết kế hệ thống **2 Tab độc lập** chuẩn Minimalism:
    - **Tab 1: Tuyến chính (Mainline):** Danh sách các phân đoạn của trục chính.
    - **Tab 2: Tuyến phụ (Branches):** Danh sách toàn bộ các tuyến nhánh phụ kèm Mã & Tên nhánh, Điểm tách nhánh từ trục chính (Lý trình Km tách & Phía Trái/Phải), Chiều dài nhánh, Quy mô mặt cắt (bề rộng, số làn, vật liệu), số phân đoạn nội bộ và nút xem trên bản đồ GIS.
- **Bản đồ GIS thu nhỏ ([`ProjectMapPreviewCard.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/project-overview/ProjectMapPreviewCard.tsx)):**
  - Bỏ giới hạn mã dự án cứng `prj-ql1a-02`. Tự động nạp và vẽ hành lang tim tuyến thực tế mà PM đã nạp cho mọi dự án trên nền vệ tinh MapLibre.

### 4. Nâng cấp Service & Phản ứng dữ liệu
- **[`src/api/services/projectService.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/projectService.ts):**
  - Thêm hàm `enrichProjectWithAlignment()` tự động tính toán tổng chiều dài và cập nhật trạng thái tim tuyến (`kml_status`, `stationing_text`) cho toàn bộ API `fetchProjects`, `getProjects`, `fetchProjectById`, `getProjectById`.
- **[`src/api/services/alignmentService.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/alignmentService.ts):**
  - Nhận thêm tham số `totalLengthKm` khi `submitAlignment` và `confirmAlignment` để đồng bộ sang `projectService`.
- **[`src/pages/(pm)/ProjectOverview.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/ProjectOverview.tsx):**
  - Đăng ký listener `roadguard_state_change` để tự động render lại toàn bộ trang khi có bất kỳ thay đổi nào từ PM hoặc Supervisor.
  - Chuẩn hóa ánh xạ các trường `stationing` và `length_km` cho bảng phân đoạn.

---

## III. DANH SÁCH TẬP TIN THAY ĐỔI

| STT | Đường dẫn tập tin | Loại thay đổi | Mô tả |
|:---:|---|:---:|---|
| 1 | `src/api/services/projectService.ts` | Sửa đổi | Thêm `enrichProjectWithAlignment`, tính tổng chiều dài từ alignment |
| 2 | `src/api/services/alignmentService.ts` | Sửa đổi | Cập nhật `submitAlignment` và `confirmAlignment` nhận `totalLengthKm` |
| 3 | `src/pages/(pm)/alignment/AlignmentApprovalList.tsx` | **Tạo mới** | Màn hình danh mục dự án thẩm duyệt tim tuyến cho Supervisor (`/sup/alignment`) |
| 4 | `src/pages/(pm)/AlignmentSegments.tsx` | Sửa đổi | Render `AlignmentApprovalList` khi Supervisor vào `/sup/alignment` |
| 5 | `src/pages/(pm)/alignment/useAlignmentState.ts` | Sửa đổi | Tính toán `branchesTotalLengthKm`, `totalProjectLengthKm`, tự động lưu dữ liệu |
| 6 | `src/pages/(pm)/alignment/useAlignmentImportState.ts` | Sửa đổi | Bổ sung callback `onAutoSave` khi import file hoặc tọa độ |
| 7 | `src/pages/(pm)/alignment/AlignmentHeader.tsx` | Sửa đổi | Hiển thị tổng $L$, chuyển 100% sang Google Material Symbols |
| 8 | `src/pages/(pm)/ProjectOverview.tsx` | Sửa đổi | Đăng ký `roadguard_state_change`, tính toán bóc tách tuyến chính / tuyến phụ |
| 9 | `src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx` | Sửa đổi | Bóc tách chi tiết Trục chính & Tuyến phụ trong Card 2 |
| 10 | `src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx` | Sửa đổi | Thêm hệ thống Tab chuyển đổi: Tuyến chính vs Tuyến phụ |
| 11 | `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Sửa đổi | Thêm badge tóm tắt tuyến chính / tuyến phụ và banner workflow |
| 12 | `src/pages/(pm)/project-overview/ProjectMapPreviewCard.tsx` | Sửa đổi | Hỗ trợ hiển thị bản đồ preview động cho mọi dự án có tim tuyến |

---

## IV. KẾT QUẢ KIỂM THỬ

- [x] PM nạp tim tuyến chính và tạo tuyến nhánh phụ $\rightarrow$ Quãng đường được cộng dồn chính xác.
- [x] Supervisor vào menu "Phê duyệt tuyến" $\rightarrow$ Hiển thị danh sách thẩm duyệt, không bị trỏ thẳng vào 1 tuyến.
- [x] Supervisor click "Thẩm duyệt tim tuyến" trên 1 dự án $\rightarrow$ Mở đúng bản đồ GIS của dự án đó với đầy đủ tọa độ, nhánh rẽ và phân đoạn do PM nạp.
- [x] Màn hình Quản lý dự án của Supervisor (`ProjectOverview`) $\rightarrow$ Thống kê đúng số km, phân định rõ ràng giữa Trục chính và Tuyến phụ.
- [x] 100% icon sử dụng Google Material Symbols, tuân thủ phong cách Minimalism.
- [x] Đã commit và push an toàn lên nhánh `hoang` (Commit hash: `c0b3dab`).
