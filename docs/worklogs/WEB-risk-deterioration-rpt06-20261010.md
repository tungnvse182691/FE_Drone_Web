# Worklog: CHUẨN HÓA BÁO CÁO RỦI RO SUY THOÁI MẶT ĐƯỜNG (RPT-06), LIÊN KẾT ĐỢT BAY KHẢO SÁT & TINH GỌN THUẬT NGỮ HỆ THỐNG

- **Thời gian thực hiện:** 10/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.6 `RPT-06 — Báo cáo Rủi ro và Diễn biến hư hỏng`, Mục 8.1.10 `RPT-10 — Nhật ký hoạt động`, Quy tắc điều hành `BC04, BC05`, Use Cases khảo sát `FR-14, FR-30, FR-34`.
  - Nguyên tắc bất biến: **Zero Money** (Không quản lý tài chính/tiền bạc, chỉ quản lý thông số kỹ thuật công trình đường bộ).
  - Hướng dẫn thiết kế Minimalism: `skills/roadguard-web/DESIGN.md` (Giao diện tinh gọn, biểu tượng Material Symbols chuẩn hóa, loại bỏ chi tiết rác/dữ liệu giả).

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

1. **Chuẩn hóa nghiệp vụ Báo cáo RPT-06 (Bản đồ nhiệt & Phân tích suy thoái theo lý trình Km):**
   - Đáp ứng yêu cầu bước kiểm thử PM-14 / SUP: *"Xem bản đồ nhiệt (Heatmap) và biểu đồ phân tích nguy cơ suy thoái mặt đường theo lý trình Km (RPT-06): Đánh giá các đoạn đường có chỉ số rủi ro cao để đưa vào kế hoạch bay khảo sát định kỳ tiếp theo"*.
   - Tích hợp MapLibre GL trực quan hóa tuyến đường theo hệ tọa độ WGS84, phân tầng màu sắc theo mức độ nguy cơ kỹ thuật (`CRITICAL` - Đỏ, `WATCH` - Vàng, `MODERATE` - Xanh).

2. **Khép kín luồng tương tác: Từ Cảnh báo Rủi ro RPT-06 $\rightarrow$ Lập Yêu cầu Bay Khảo sát (`FR-14`):**
   - Người dùng khi xem phân đoạn có tốc độ suy thoái nhanh trên bản đồ có thể bấm nút **"Lập đợt bay"**.
   - Hệ thống tự động chuyển hướng sang trang Tạo yêu cầu bay khảo sát (`/pm/surveys/create`), truyền query parameters (`project`, `startKm`, `endKm`) và tự động điền sẵn phạm vi lý trình cần bay khảo sát trọng điểm.

3. **Loại bỏ dữ liệu rác, chi tiết sai lệch không có trong Spec:**
   - **Xóa bỏ triệt để điểm số PCI (58.2/100):** Chỉ số "PCI" và thang điểm `/100` hoàn toàn không có trong tài liệu đặc tả 29_9 (chỉ xuất hiện trong mockup HTML cũ của Stitch). Đã loại bỏ 100% khỏi giao diện và dữ liệu mock.
   - **Xóa bỏ các điểm số có ký tự `đ` (88đ, 66đ, 42đ):** Gây hiểu lầm nghiêm trọng là đơn vị tiền tệ ("đồng") hoặc điểm số tùy tiện. Thay thế bằng các phân cấp mức độ kỹ thuật chuẩn xác theo Spec 29_9: `RẤT CAO` (Critical), `THEO DÕI` (Watch), `TRUNG BÌNH` (Moderate).
   - **Loại bỏ thuật ngữ "Kiểm toán" gây hiểu lầm:** Do RoadGuard là hệ thống quản lý bảo hành đường bộ kỹ thuật thuần túy (Zero Money), chữ "Kiểm toán" (Audit) trong menu khiến giảng viên/khách hàng hiểu lầm là kiểm toán kế toán/tài chính. Đã đổi thành:
     - Nhóm menu: `Báo cáo & Kiểm toán` $\rightarrow$ `Báo cáo & Hồ sơ`.
     - Mục con: `Nhật ký kiểm toán` $\rightarrow$ `Nhật ký hoạt động` (Khớp đúng tên gọi Mục 8.1.10 trong Spec 29_9: `RPT-10 — Nhật ký hoạt động Audit Trail`).

4. **Kiến trúc dữ liệu:**
   - Xây dựng tầng In-Memory Mock API chuẩn (`reportService.ts`) cho toàn bộ module báo cáo, loại bỏ hoàn toàn cơ chế phụ thuộc `localStorage` tĩnh.

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA & TẠO MỚI

### 1. `src/api/services/reportService.ts` (Tạo mới)
- **Nghiệp vụ:** Cung cấp Service bất đồng bộ mô phỏng API backend cho module Báo cáo & Phân tích (`RPT-01`, `RPT-04`, `RPT-06`, `RPT-07` Export Queue).
- **Dữ liệu RPT-06:** Mô phỏng 7 phân đoạn đường trọng điểm trên các dự án (QL1A Đèo Hải Vân, QL1A Nam Cầu Đỏ, Cao tốc Bắc Nam XL-03, XL-04) với đầy đủ tọa độ GIS MapLibre, số lượng hư hỏng, tốc độ suy thoái (%/kỳ), SLA cam kết còn lại và khuyến nghị kỹ thuật.
- **Tính năng chuyển đổi kế hoạch bay:** Cung cấp API `toggleSurveyPlan(segmentId)` để PM/Supervisor đánh dấu đưa phân đoạn vào danh sách lập kế hoạch bay định kỳ.

### 2. `src/pages/(sup)/risk-analytics/RiskDeteriorationSection.tsx` (Tạo mới)
- **Giao diện Bản đồ số & Heatmap GIS:**
  - Tích hợp MapLibre GL hiển thị bản đồ trắc dọc/tuyến đường.
  - Hỗ trợ chuyển đổi linh hoạt 2 lớp nền: Bản đồ vệ tinh (`satellite_alt`) và Bản đồ vector số (`map`).
  - Thẻ thông tin nổi (Floating HUD) tự động cập nhật khi click chọn phân đoạn, hiển thị: Lý trình Km, Diện tích hư hỏng ($m^2$), Tốc độ suy thoái (%/kỳ), Mức độ khẩn cấp, Hạn xử lý SLA, và nút hành động nhanh **"Lập đợt bay"**.
- **Bảng chi tiết phân đoạn:** Liệt kê các đoạn tuyến có nguy cơ cao, hiển thị badge tình trạng rủi ro, tiến trình nứt lún thực tế (ví dụ: *Nứt dọc đơn lẻ phát triển thành nứt mai rùa đan xen lún bánh xe*), và nút bật/tắt đưa vào kế hoạch bay khảo sát.

### 3. `src/pages/(pm)/CreateSurvey.tsx` (Chỉnh sửa)
- **Bắt query parameters từ URL:** Tiếp nhận `project`, `startKm`, `endKm` khi được chuyển hướng từ bản đồ rủi ro RPT-06.
- **Tự động điền dữ liệu khảo sát:** Điền sẵn dự án, tự động chọn cấu hình bay dọc tuyến (Corridor Mapping), điền tọa độ/lý trình Km bắt đầu và Km kết thúc, giúp PM chỉ cần kiểm tra lại thông số pin/drone và gửi lệnh bay ngay lập tức.

### 4. `src/components/layout/Sidebar.tsx` & `RiskHeader.tsx` (Chỉnh sửa)
- Chuẩn hóa lại cấu trúc menu điều hướng:
  - Đổi tiêu đề nhóm: `Báo cáo & Kiểm toán` $\rightarrow$ `Báo cáo & Hồ sơ` (áp dụng cho cả 2 vai trò PM và Supervisor).
  - Đổi mục menu: `Nhật ký kiểm toán` $\rightarrow$ `Nhật ký hoạt động` (đúng chuẩn kỹ thuật của Spec 29_9 `RPT-10`).
  - Cập nhật Breadcrumb tại Header của màn hình báo cáo rủi ro.

### 5. `src/pages/(sup)/risk-analytics/` (Các modal & components con)
- **Chuẩn hóa Material Symbols:** Thay thế các icon Lucide còn sót lại bằng bộ icon Google Material Symbols đồng bộ toàn hệ thống (`download`, `refresh`, `filter_alt`, `schedule`, `verified`, `map`, v.v.).
- **Tối giản hóa giao diện (Minimalism):** Loại bỏ các khung viền rườm rà, tập trung hiển thị trực quan dữ liệu kỹ thuật và tiến độ của tác vụ nén/xuất hồ sơ bất đồng bộ (`POST /api/v1/exports`).

---

## III. KẾT QUẢ KIỂM THỬ & KIỂM TRA CHẤT LƯỢNG

1. **Kiểm tra biên dịch TypeScript:**
   - Chạy lệnh `npx tsc -b` thành công với mã thoát 0 (`exit code 0`), hoàn toàn không có lỗi type hoặc import nào.
2. **Kiểm tra tính toàn vẹn cây thư mục:**
   - Không thay đổi hoặc phá vỡ bất kỳ đường dẫn nào trong cấu trúc router của dự án.
3. **Kiểm tra tính độc lập & In-Memory:**
   - Mock API hoạt động bất đồng bộ, phản hồi nhanh và lưu trạng thái trong RAM theo đúng vòng đời phiên làm việc, không lưu rác vào `localStorage`.

---

## IV. BỔ SUNG: CHUẨN HÓA MÀN HÌNH THỰC NGHIỆM AI (RPT-09 / RESEARCH VALIDATION)

1. **Tạo In-Memory Service chuẩn `validationService.ts`:**
   - Tách rời hoàn toàn khỏi `mock/data` tĩnh và loại bỏ 100% `localStorage`.
   - Cung cấp các API bất đồng bộ: `getValidationOverview()`, `getSamples()`, `triggerValidationRun()`, `cancelValidationJob()`, `exportValidationCsv()`.
   - Bổ sung tập dữ liệu 10 cặp mẫu thực tế đa dạng các loại hư hỏng (Ổ gà, Chênh cốt mép tấm, Lún vệt bánh xe, Võng lún đầu cống, Nứt dọc, Nứt ngang) với trạng thái hợp lệ `INCLUDED`, bị loại `EXCLUDED` và ngoại lai `OUTLIER`.

2. **Dọn dẹp chi tiết thừa & Bám sát DESIGN.md:**
   - Xóa bỏ khối văn bản màu đỏ dài 5 dòng gây rối mắt ở giữa màn hình; thay bằng thanh tóm tắt tiêu chí loại trừ theo `BR-44 & DD-C09` tinh gọn, thanh lịch.
   - Xóa bỏ các watermark hình tròn góc che khuất card metrics.
   - Thay thế toàn bộ hộp thoại `alert(...)` thô sơ của trình duyệt bằng Toast Notification thông báo nổi tại góc dưới màn hình.
   - Tuân thủ quy tắc 1 nút CTA chính: Nút vàng đồng Hoàng Hải `#C9A227` cho hành động "Chạy kiểm định mới", nút phụ màu trắng viền xám cho "Xuất CSV đối soát".

3. **Chuyển đổi 100% Google Material Symbols:**
   - Gỡ bỏ hoàn toàn thư viện `lucide-react` trong toàn bộ các file con của `research/` (`ResearchHeader`, `ValidationMetricsCards`, `ValidationRunsTable`, `AsyncValidationJobBanner`, `PairedSamplesTable`).
   - Sử dụng thống nhất: `science`, `download`, `play_arrow`, `verified`, `check_circle`, `info`, `schedule`, `analytics`, `sync`.

