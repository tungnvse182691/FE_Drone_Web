# Worklog: CHUẨN HÓA NGHIỆP VỤ NGHIỆM THU HIỆN TRƯỜNG & TINH GỌN GIAO DIỆN (EVIDENCE CLOSEOUT)

- **Thời gian thực hiện:** 10/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:** Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`), các Use Cases `HT09, HT10, HT11, HT12`, Business Rules `BR-25, BR-26, BR-27`, Tiêu chuẩn kỹ thuật TCVN 8819:2011 & TCVN 10380:2014, và Hướng dẫn thiết kế Minimalism `skills/roadguard-web/DESIGN.md`.

---

## I. MỤC TIÊU CÔNG VIỆC

1. **Chuẩn hóa Mock API chi tiết cho các gói đề xuất thực tế:** Cung cấp dữ liệu chi tiết cho 4 gói thầu thực tế trên hàng đợi nghiệm thu (`PKG-2026-08`, `PKG-2026-07`, `PKG-2026-11`, `PKG-2026-12`) để có thể kiểm thử toàn diện từng loại tiến độ (Chờ duyệt, Đã hoàn thành 100%, Bị trả về sửa lại Lần 2, và Mới tiếp nhận).
2. **Loại bỏ chi tiết "rác" & Chuyển đổi 100% Tiếng Việt:** 
   - Xóa bỏ triệt để các nhãn tiếng Anh `BEFORE / AFTER` trên giao diện đối chứng ảnh, thay thế bằng thuật ngữ xây dựng thuần Việt (`Ảnh trước khi sửa`, `Ảnh sau khi sửa`).
   - Xóa bỏ các thành phần rác trang trí không có trong đặc tả (nút Metadata SHA-256, badge mã băm trên thanh trạng thái, các overlay camera trang trí).
   - Xóa bỏ hoàn toàn tính năng "Công bố Citizen App" và modal bản tin người dân khỏi giao diện nghiệm thu kỹ thuật nội bộ.
3. **Loại bỏ tính năng tự chế "Ký số điện tử PKI":** Rà soát Spec 29_9 xác nhận hệ thống không có "Chữ ký số điện tử / Khóa điện tử", chuẩn hóa thành hành vi nghiệp vụ chuẩn: "Chấp thuận nghiệm thu" và "Kiểm tra tính toàn vẹn dữ liệu ảnh gốc" (theo NFR-05 và BC09).
4. **Chuẩn hóa thẩm quyền phân vai (PM vs Supervisor):** Đảm bảo cả PM và Supervisor đều có quyền "Yêu cầu sửa lại" theo Use Case HT10 khi phát hiện thi công sai quy chuẩn, PM tự đóng Fast Track (BR-25), và chỉ Supervisor mới có quyền đóng tổng thể đợt thi công (BR-26).

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA & NỘI DUNG THỰC HIỆN

### 1. `src/api/services/acceptanceService.ts` & `src/pages/(sup)/evidence-closeout/mockData.ts`
- **Khởi tạo dữ liệu chi tiết cho 4 gói thầu:**
  - `PKG-2026-08` (#CASE-2026-0842 - QL1A): 4 hạng mục (2 đạt, 1 chờ duyệt Approval Track, 1 chờ đóng Fast Track).
  - `PKG-2026-07` (#CASE-2026-0789 - QL1A): 10 hạng mục hoàn tất 10/10 đạt chuẩn TCVN 8819:2011.
  - `PKG-2026-11` (#CASE-2026-1102 - Cao tốc Mai Sơn): 3 hạng mục (2 hạng mục ở trạng thái `REWORK_REQUIRED` Lần 2 do lún đầu mố vượt 4.5mm và K98 không đạt, 1 hạng mục đạt).
  - `PKG-2026-12` (#CASE-2026-1215 - Đường ven biển Dung Quất): 3 hạng mục ở trạng thái `PENDING_INSPECTION` (Chờ Giám sát kiểm tra trám khe Mastic).
- **Cơ chế In-Memory Mock API chuẩn (Zero localStorage):**
  - Bổ sung hàm tự động tính toán tổng hợp `syncPackageStats(packageId)` để khi PM hoặc Supervisor thực hiện hành động trên từng hạng mục con (Duyệt, Yêu cầu sửa lại, Đóng Fast Track), tiến độ và trạng thái của toàn bộ gói thầu được đồng bộ tự động.
  - `getCloseoutItems(packageId)`: Trả về danh sách hạng mục đúng theo mã gói được chọn từ URL (`/pm/acceptance/:batchId` hoặc `/sup/acceptance/:batchId`).

### 2. `src/pages/(sup)/evidence-closeout/ComparisonViewer.tsx`, `BeforeViewer.tsx`, `AfterViewer.tsx`
- **Chuyển đổi 100% tiếng Việt:**
  - Đổi tiêu đề: `Đối chứng hình ảnh hiện trường (BEFORE vs AFTER)` $\rightarrow$ `Hình ảnh đối chứng trước và sau thi công`.
  - Cột trước: `ẢNH TRƯỚC SỬA (BEFORE)` $\rightarrow$ `Ảnh trước khi sửa`.
  - Cột sau: `ẢNH SAU SỬA (AFTER)` $\rightarrow$ `Ảnh sau khi sửa`.
  - Chế độ vuốt trượt (Slider): Nhãn đỏ `Trước khi sửa`, nhãn xanh `Sau khi hoàn thành`.
- **Dọn dẹp chi tiết thừa:**
  - Xóa bỏ nút và chế độ xem rườm rà `Metadata SHA-256`. Chỉ giữ 2 chế độ so sánh thiết thực nhất: `Song song` và `Vuốt trượt`.
  - Gỡ bỏ overlay che khuất ảnh (các dòng text giả lập cảm biến: tiêu cự 26mm, 18 vệ tinh lock...).
  - Thay thế các ô mã hash vụn vặt bằng layout 3 thông số ngắn gọn, chuẩn hiện trường: Nguồn ảnh • Thời gian hoàn thành • Tọa độ GPS • Kích thước ban đầu / Thiết bị thi công.
  - Gỡ bỏ hoàn toàn checkbox và handler công bố ảnh lên Citizen App.

### 3. `src/pages/(sup)/evidence-closeout/TechnicalCriteriaCard.tsx`
- **Loại bỏ chữ ký số điện tử tự chế:**
  - Xóa bỏ hoàn toàn box footer `"Kỹ sư Giám sát trưởng ... Khóa điện tử sẵn sàng"`.
  - Chuẩn hóa Metric 2: Đổi từ `"Tính toàn vẹn số - PASS (Chữ ký số hợp lệ)"` $\rightarrow$ `"2. TÍNH TOÀN VẸN DỮ LIỆU - ĐẠT (Ảnh gốc hợp lệ)"` (Khớp đúng NFR-05 và BC09: đối chiếu mã hash và tọa độ EXIF chống làm giả ảnh).
- **Bổ sung Banner Cảnh báo Sửa lại (Rework Alert):**
  - Khi xem các hạng mục bị trả về (như trong `PKG-2026-11`), hiển thị ngay lý do kỹ thuật bị từ chối và danh sách chỉ đạo khắc phục bắt buộc (Cào bóc lại 5cm, lu lèn móng CPĐD đạt K98).

### 4. `src/pages/(sup)/evidence-closeout/CloseoutHeader.tsx` & `ActionButtons.tsx`
- **Hợp nhất Panel thông tin:** Gộp phần Vụ việc phức hợp vào Header chính, loại bỏ phần text cứng và ánh xạ động theo mã gói, tên dự án, đoạn tuyến và đơn vị thi công.
- **Thanh chuyển nhanh Hạng mục (Item Tab Strip):** Chuyển đổi giữa các `#ITEM-01`, `#ITEM-02` bằng các chip tối giản với icon Material trực quan (<span className="material-symbols-outlined text-[14px]">check_circle</span>, <span className="material-symbols-outlined text-[14px]">schedule</span>, <span className="material-symbols-outlined text-[14px]">replay</span>).
- **Chuẩn hóa nhãn nút bấm:**
  - Đổi `"Chấp thuận nghiệm thu (Ký số)"` $\rightarrow$ `"Chấp thuận nghiệm thu"`.
  - Đổi `"Đã ký số nghiệm thu"` $\rightarrow$ `"Đã nghiệm thu đạt"`.
  - Đổi `"Ký số đóng đợt thi công"` $\rightarrow$ `"Đóng đợt thi công"`.
- **Cập nhật thẩm quyền PM & Supervisor:** Cả PM và Giám sát đều có quyền bấm `"Yêu cầu sửa lại"` theo Use Case HT10 khi phát hiện thi công lỗi.

### 5. `src/pages/(sup)/evidence-closeout/CloseoutModals.tsx` & `StatusBar.tsx`
- Gỡ bỏ hoàn toàn Citizen App Publish Modal khỏi `CloseoutModals.tsx`, chỉ giữ lại 3 modal kỹ thuật bắt buộc: `ReworkModal`, `VerifyModal` (Đóng đợt thi công), và `ExportPdfAModal`/`ExportZipModal`.
- Gỡ bỏ badge `SHA-256: C3D788A4` hiển thị lộ liễu trên thanh trạng thái `StatusBar.tsx`.

---

## III. KẾT QUẢ KIỂM THỬ KỸ THUẬT

- **TypeScript compiler check (`npx tsc -b`):** 0 errors (Exit Code 0).
- **Production build check (`npx vite build`):** Thành công trong 5.99s, bundle sạch, 0 lỗi cú pháp.
- **Tuân thủ quy tắc kiến trúc:**
  - Phong cách: Minimalism thực dụng theo đúng `DESIGN.md`.
  - Biểu tượng: 100% Google Material Symbols.
  - Dữ liệu: 100% Async Mock API Service (Zero localStorage).
  - Cây thư mục: Bảo toàn 100% cấu trúc hiện tại.
