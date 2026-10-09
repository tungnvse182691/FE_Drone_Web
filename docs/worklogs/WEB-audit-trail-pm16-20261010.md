# Worklog: CHUẨN HÓA MÀN HÌNH NHẬT KÝ HOẠT ĐỘNG & TRUY VẾT HỆ THỐNG (BƯỚC PM-16 / RPT-10) — MINIMALISM, VIỆT HÓA TOÀN DIỆN & TỐI ƯU KHÔNG GIAN BẢNG DỮ LIỆU

- **Thời gian thực hiện:** 10/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.10 `RPT-10 — Báo cáo Nhật ký Kiểm toán Bất biến (Durable Audit Trail)`, Quy tắc lưu trữ pháp lý `BR-45` (Lưu trữ hết hạn bảo hành + 5 năm).
  - 10 Điều bất biến (AGENTS.md): Điều 1 (Khối lượng kỹ thuật thi công - Zero Money, không tính toán giá tiền hay bảng giá), Điều 6 (Token Authentication), Điều 10 (Design System vàng đồng `#C9A227` cho CTA/KPI).
  - Phong cách thiết kế: **Minimalism**, thuần Việt 100%, bộ icon **Material Symbols** đồng bộ, **In-Memory Mock API** (`auditService.ts`, Zero `localStorage`, Zero file mock tĩnh).

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

1. **Chuẩn hóa Bước PM-16 trong Danh mục chức năng:**
   - Hoàn thiện giao diện tra cứu dòng sự kiện bất biến tại tuyến đường `/pm/audit-trail` (và `/sup/audit-trail`).
   - Cung cấp công cụ truy vết dòng hoạt động kỹ thuật, chuyển trạng thái hồ sơ đợt sửa chữa, phân công thi công và nghiệm thu hiện trường.

2. **Xử lý các phản hồi & yêu cầu cải tiến giao diện từ Hoàng:**
   - **Xóa bỏ hoàn toàn thuật ngữ "Kiểm toán":** Vì RoadGuard là hệ thống quản lý kỹ thuật công trình hạ tầng (Zero Money, không quản lý chi phí tài chính hay kế toán), toàn bộ thuật ngữ được chuẩn hóa sang *"Nhật ký hoạt động & Truy vết hệ thống"*.
   - **Mở khóa Dropdown chọn dự án cho PM:** Chỉ huy trưởng có thể phụ trách đồng thời nhiều gói thầu/dự án, gỡ bỏ thuộc tính `disabled` và cho phép PM chọn: *Tất cả dự án phụ trách*, *QL1A - Giai đoạn 2*, hoặc *Cao tốc Bắc - Nam XL-03*.
   - **Tối ưu không gian hiển thị (Tránh chiếm diện tích màn hình):**
     - Thay vì chia màn hình 2 cột cố định khiến bảng bị bóp hẹp, Bảng nhật ký sự kiện được mở rộng chiếm **100% chiều rộng** (`w-full`) màn hình.
     - Khối Chi Tiết Sự Kiện được chuyển sang dạng **Ngăn kéo trượt (Slide-over Drawer)** từ mép phải màn hình, chỉ xuất hiện khi người dùng bấm nút *"Chi tiết"* hoặc click trực tiếp vào dòng sự kiện. Có thể đóng nhanh bằng nút `X`, click ra ngoài nền mờ, hoặc bấm phím `ESC`.
   - **Khắc phục lỗi vỡ ảnh minh chứng hiện trường:**
     - Tích hợp bộ xử lý `onError` dự phòng sang ảnh vector SVG kỹ thuật trắc địa công trình (`FALLBACK_INSPECTION_IMG`), bảo đảm 100% không bao giờ xuất hiện icon ảnh lỗi của trình duyệt.
     - Bổ sung ảnh minh chứng thực tế kèm tọa độ GPS và thời điểm ghi nhận cho hàng loạt sự kiện trong `auditService.ts`.
   - **Chuẩn hóa khối "Đối chiếu dữ liệu (Trước / Sau)":**
     - Loại bỏ hoàn toàn khối mã JSON thô (`<pre>{JSON.stringify(...)}</pre>`) chứa các mã tiếng Anh như `status: "PENDING_APPROVAL"`, `total_defects: 6` và dấu ngoặc nhọn `{}`.
     - Thay bằng bảng đối chiếu thông số kỹ thuật thuần Việt rõ ràng, thanh lịch theo đúng phong cách Minimalism.
   - **Dọn dẹp chi tiết rác & Việt hóa 100%:**
     - Loại bỏ toàn bộ các mã kỹ thuật rác: `(Timeline - FR-34)`, `BR-45`, `US-29`, `IncidentCaseHistory`, dòng hiển thị giờ UTC trùng lặp.
     - Thay thế toàn bộ icon Lucide sang Google Material Symbols.

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA & TẠO MỚI

### 1. `src/api/services/auditService.ts` (Tạo mới)
- Xây dựng tầng service In-Memory Mock API chuẩn cho phân hệ Nhật ký hoạt động:
  - Cung cấp danh mục dự án: `AUDIT_PROJECT_OPTIONS` (`all`, `proj-01` QL1A, `proj-02` Cao tốc Bắc - Nam).
  - Danh sách 13 bản ghi sự kiện phong phú phân bổ theo 4 mốc thời gian thực tế so với mốc hệ thống `10/10/2026`:
    - **24 giờ qua:** Nghiệm thu hoàn công WO-2026-088, Phân công đội thi công WO-2026-089.
    - **7 ngày qua:** Phê duyệt đợt sửa PKG-2026-08, Trình duyệt hồ sơ đợt sửa, Đóng hồ sơ xử lý nhanh ổ gà FT-021.
    - **30 ngày qua:** Yêu cầu sửa lại đợt sửa PKG-CTBN-03, Phân công đội thi công WO-2026-074, Nghiệm thu hoàn công Cao tốc Bắc - Nam, Khóa lưu trữ hồ sơ phục vụ thanh tra.
    - **Toàn bộ thời gian:** Phê duyệt đợt sửa PKG-2026-05, Trình duyệt đợt sửa, Nghiệm thu thước thẳng 3m, Công bố phân đoạn tim tuyến tự động.
  - Mỗi sự kiện đều có thông tin đối chiếu kỹ thuật trước/sau (`before_state`, `after_state`) chuẩn tiếng Việt và ảnh hiện trường hợp lệ.
  - Phương thức `getAuditEvents(params)`: Hỗ trợ lọc theo dự án, khoảng thời gian (`24h`, `7d`, `30d`, `all`), vai trò tác nhân, loại hành động, loại thực thể và từ khóa tìm kiếm.
  - Phương thức `getAuditStats(projectId)` và `exportAuditTrail(format, projectId)`: Tính toán số liệu động và xuất tệp nhật ký PDF/CSV.

### 2. `src/api/services/index.ts`
- Xuất khẩu `auditService`, `AUDIT_PROJECT_OPTIONS` và các kiểu dữ liệu liên quan vào index API chung của hệ thống.

### 3. `src/pages/(sup)/audit-trail/AuditTrailHeader.tsx`
- Đổi tiêu đề: *"Nhật Ký Hoạt Động & Truy Vết Hệ Thống"*.
- Gỡ bỏ `disabled={isPM}` trên dropdown dự án, cho phép cả PM và Giám sát lựa chọn tất cả các dự án phụ trách.
- Đồng bộ toàn bộ icon sang Google Material Symbols (`folder_open`, `refresh`, `download`, `verified_user`, `lock`, `schedule`).

### 4. `src/pages/(sup)/audit-trail/AuditTrailMetrics.tsx`
- Việt hóa 100% 4 thẻ thống kê: *Tổng sự kiện ghi nhận*, *Chuyển đổi trạng thái*, *Quyết định thẩm duyệt*, *Thời hạn lưu trữ hồ sơ*.
- Xóa bỏ các mã spec kỹ thuật như `US-29-AC-01`, `BR-45`, `IncidentCaseHistory`.

### 5. `src/pages/(sup)/audit-trail/AuditTrailFilters.tsx`
- Bộ lọc vai trò tác nhân: *Tất cả vai trò*, *Chỉ huy trưởng (PM)*, *Kỹ sư Giám sát*, *Hệ thống tự động*.
- Bộ lọc hành động nghiệp vụ: *Nghiệm thu hoàn công*, *Phê duyệt đợt sửa*, *Trình duyệt hồ sơ*, *Phân công đội thi công*, *Yêu cầu sửa lại*, *Đóng xử lý nhanh*, *Khóa lưu trữ*.
- Bộ chọn khoảng thời gian 4 tab rõ ràng: `24 giờ qua`, `7 ngày qua`, `30 ngày qua`, `Toàn bộ thời gian`.

### 6. `src/pages/(sup)/audit-trail/AuditTrailTable.tsx`
- Mở rộng bảng chiếm **100% chiều rộng** (`w-full`), loại bỏ cấu trúc bóp hẹp 8 cột cũ.
- Bỏ nhãn `(Timeline - FR-34)` và dòng giờ UTC phụ, chỉ hiển thị giờ Việt Nam chuẩn.
- Bổ sung nút bấm **"Chi tiết"** (icon `visibility`) tại cột cuối cùng của từng dòng và kích hoạt mở Drawer khi bấm vào dòng sự kiện.
- Chuyển đổi trạng thái hiển thị thuần Việt: *Chờ duyệt $\rightarrow$ Đã duyệt*, *Chưa phân công $\rightarrow$ Đã phân công*, *Chờ nghiệm thu $\rightarrow$ Nghiệm thu đạt*.

### 7. `src/pages/(sup)/audit-trail/AuditTrailInspector.tsx`
- Tích hợp ảnh vector SVG dự phòng (`FALLBACK_INSPECTION_IMG`) chống vỡ ảnh 100% khi mất mạng hoặc URL ngoài bị chặn.
- Xóa bỏ thẻ `<pre>{JSON.stringify(...)}</pre>` thô sơ.
- Xây dựng cơ chế bóc tách thông minh `parseStateRecords` chuyển các trường dữ liệu trước/sau thành các hàng nhãn - giá trị tiếng Việt rõ ràng:
  - *Trạng thái hồ sơ*, *Tổng số hư hỏng (6 vị trí)*, *Phương án kỹ thuật*, *Hạng mục thi công*, *Đội thi công*, *Hạn hoàn thành*, *Người phê duyệt*, *Thời điểm khóa pháp lý*.
- Thêm nút đóng `X` và hỗ trợ callback `onClose` linh hoạt.

### 8. `src/pages/(sup)/audit-trail/AuditTrailModals.tsx`
- Tích hợp cơ chế fallback chống vỡ ảnh cho Lightbox xem ảnh hiện trường phóng to.
- Chuẩn hóa Modal xuất báo cáo nhật ký định dạng PDF/CSV.

### 9. `src/pages/(sup)/AuditTrail.tsx`
- Tích hợp bất đồng bộ với `auditService.getAuditEvents`.
- Quản lý trạng thái mở Drawer `isInspectorOpen`: bảng dữ liệu hiển thị full-width, Drawer chỉ trượt ra khi người dùng bấm xem chi tiết.
- Bổ sung Event Listener phím `ESC` để đóng Drawer nhanh chóng.
- Xóa bỏ hạn chế gán cứng `proj-01` đối với PM, tự động đồng bộ `selectedEventId` khi người dùng chuyển đổi dự án hoặc bộ lọc.

---

## III. KẾT QUẢ KIỂM THỬ & CHẤT LƯỢNG MÃ NGUỒN

- **TypeScript Compilation:** Chạy lệnh `npx tsc -b` thành công với **Exit Code 0** (0 lỗi cú pháp hay kiểu dữ liệu).
- **Trải nghiệm giao diện (UX):**
  - Màn hình rộng rãi, không bị gò bó diện tích.
  - Ngăn kéo trượt hiển thị chi tiết mượt mà, đầy đủ thông tin kỹ thuật, không có lỗi vỡ ảnh.
  - Thông số đối chiếu trước/sau trình bày trang nhã, không còn mã code hay dấu ngoặc JSON của lập trình viên.
- **Tuân thủ quy tắc:** Đảm bảo 100% nguyên tắc Zero Money (không kiểm toán giá tiền), Minimalism và Design Tokens của Hoàng Hải.
