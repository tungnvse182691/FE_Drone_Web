# Worklog: CHUẨN HÓA MÀN HÌNH THỰC NGHIỆM ĐỐI SOÁT AI & THỰC ĐỊA (RPT-09 / BƯỚC PM-15) - ĐỒNG BỘ 1:1, MINIMALISM & VIỆT HÓA TOÀN DIỆN

- **Thời gian thực hiện:** 10/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.9 `RPT-09 — Nghiên cứu Thực nghiệm và Đánh giá Mô hình`, Quy tắc thẩm định kỹ thuật `BR-44` (Quy định loại trừ mẫu ngoài hành lang quét / lóa sáng / thiếu ảnh đối chứng `DD-C09`), Use Cases `FR-31` (Kích hoạt tác vụ kiểm nghiệm nền HTTP 202).
  - Chuẩn quy tắc sai số hình học `MET-12` (`RS01` đến `RS06`): Đánh giá định lượng sai số hình học ($mm$) gồm $\text{Bias}$, $\text{MAE}$, $\text{RMSE}$, Độ không đảm bảo đo ($\pm U_{95}$).
  - Nguyên tắc thiết kế: **Minimalism**, thuần Việt 100%, bộ icon **Material Symbols** đồng bộ, **In-Memory Mock API** (Zero `localStorage`, Zero file mock tĩnh).

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

1. **Chuẩn hóa Bước kiểm thử PM-15 trong Danh mục chức năng:**
   - Hoàn thiện luồng kiểm thử bước PM-15 tại route `/pm/research-validation` (alias `/sup/research-validation`).
   - Cung cấp giao diện đối soát độc lập dành cho công tác nghiên cứu khoa học, thẩm định sai số giữa số đo mô hình trích xuất từ Drone/LiDAR và số đo cơ học thực tế tại hiện trường (Thước thẳng 3m TCVN 8864, Máy thủy chuẩn Leica, Thước đo sâu điện tử).

2. **Khắc phục triệt để các tồn đọng & lỗi logic phát hiện trong quá trình kiểm thử:**
   - **Khắc phục lỗi đơ tiến trình kiểm nghiệm nền:** Trước đó tác vụ kiểm định nền (`AsyncValidationJob`) bị dừng ở 5%. Đã bổ sung cơ chế interval mô phỏng tiến trình tăng mượt mà $5\% \rightarrow 35\% \rightarrow 70\% \rightarrow 100\%$. Khi đạt 100%, hệ thống tự động cập nhật trạng thái đợt chạy sang `HOÀN TẤT`, đồng bộ dòng lịch sử từ `ĐANG XỬ LÝ (202)` sang `HOÀN TẤT` màu xanh và đóng banner tác vụ.
   - **Xử lý sự vênh số liệu giữa Thẻ thống kê tổng hợp và Bảng đối soát chi tiết:**
     - Trước đó: Thẻ KPI vĩ mô ghi nhận 80 mẫu (4 bị loại), trong khi Bảng đối soát bên dưới chỉ có 5 mẫu (1 bị loại), khiến số liệu bị lệch và gây hiểu lầm.
     - Giải pháp: Đồng bộ 1:1 số liệu. Toàn bộ các thẻ KPI (`Bias`, `MAE`, `RMSE`, tỷ lệ hợp lệ, số mẫu bị loại) được tính toán tự động trực tiếp từ mảng mẫu thực tế của dự án.
   - **Xóa bỏ chi tiết rác / thừa theo phong cách Minimalism:**
     - Xóa bỏ dải thanh hộp xám "Thanh tóm tắt lý do ngoại trừ" ở giữa vì từng dòng mẫu bị loại trong Bảng đối soát đã có sẵn nhãn trạng thái và dòng lý do kỹ thuật màu đỏ rõ ràng.
   - **Đa dự án (Multi-project Scope):**
     - Bổ sung Dropdown chọn dự án: `QL1A (Km 1020 - Km 1045)`, `Cao tốc Bắc Nam XL-03 (Km 14 - Km 22)`, và `Tất cả dự án phụ trách`. Dữ liệu cặp mẫu, mô hình thuật toán và chỉ số tự động cập nhật tương ứng theo từng dự án.
   - **Việt hóa 100%:**
     - Xóa sạch các từ tiếng Anh kỹ thuật rác (`Ground Truth`, `Derived AI`, `Sample ID`, `usedCount`, `HTTP 202 ACCEPTED`, v.v.), chuyển thành các thuật ngữ đường bộ chuẩn mực: `Thực địa (mm)`, `Trích xuất AI (mm)`, `Mã mẫu`, `Hợp lệ`, `Bị loại`, `Ngoại lai`.

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA

### 1. `src/api/services/validationService.ts`
- **Bộ dữ liệu cặp mẫu thực địa đồng bộ (`inMemorySamples`):**
  - **QL1A (Mặt đường BTXM, TCVN 8864):** 8 cặp mẫu chuẩn hóa (5 Đạt, 2 Bị loại do đọng nước sâu / thiếu ảnh thước nêm sát đáy hố `DD-C09`, 1 Ngoại lai do bóng râm tán cây che khuất quang học).
  - **Cao tốc Bắc Nam XL-03 (Mặt đường Asphalt, LiDAR 3D):** 8 cặp mẫu chuẩn hóa (5 Đạt, 2 Bị loại do ngoài hành lang LiDAR 3D / lóa sáng mặt đường ẩm ướt, 1 Ngoại lai do mất tín hiệu RTK cục bộ).
  - **Tất cả dự án:** 16 cặp mẫu tổng hợp.
- **Dữ liệu đợt chạy (`RUNS_BY_PROJECT`):**
  - Đồng bộ số lượng `sample_count: 8`, `used_count: 5`, `excluded_count: 3` khớp chính xác 100% với danh sách mẫu.
  - Các chỉ số Bias, MAE, RMSE phản ánh đúng số liệu đo đạc thực tế của từng dự án.
- **Phương thức API In-Memory:**
  - `getValidationOverview(projectId)`: Trả về đợt chạy, mẫu, danh sách đợt và danh mục dự án.
  - `triggerValidationRun(projectId)`: Khởi tạo tiến trình bất đồng bộ nền (mô phỏng HTTP 202 FR-31).
  - `completeValidationRun(runId)`: Chốt đợt kiểm định và cập nhật trạng thái `COMPLETED`.
  - `exportValidationCsv(projectId)`: Trích xuất tệp CSV dữ liệu đối soát chuẩn hóa `RPT-09-Research-Validation-Paired-Data-v2.2.csv`.

### 2. `src/pages/(sup)/research/ValidationMetricsCards.tsx`
- **Tính toán động từ mảng dữ liệu thật (`samples` prop):**
  - Card 1: Mẫu hợp lệ kiểm định (`{validCount}/{totalCount} cặp mẫu`, tỷ lệ `%`, `Bị loại: {excludedCount} mẫu`).
  - Card 2: Độ lệch trung bình Bias ($\Sigma e / N$).
  - Card 3: Sai số tuyệt đối trung bình MAE ($\Sigma |e| / N$).
  - Card 4: Căn sai số toàn phương RMSE ($\sqrt{\Sigma e^2 / N}$) và Độ không đảm bảo đo.
- **Loại bỏ hộp tóm tắt lý do trùng lặp:** Giúp giao diện từ 4 card KPI đi thẳng xuống Bảng đối soát, không còn khoảng đệm rác gây rối mắt.

### 3. `src/pages/(sup)/research/PairedSamplesTable.tsx`
- Cập nhật bộ đếm trên các nút lọc trạng thái: `Tất cả (8)`, `Hợp lệ (5)`, `Bị loại (2)`, `Ngoại lai (1)`.
- Bảng hiển thị thông tin chi tiết từng mẫu: Mã mẫu, Loại hư hỏng, Lý trình Km, Số đo Thực địa ($mm$), Số đo AI ($mm$), Sai số có dấu ($mm$), Badge trạng thái, Dụng cụ đo & Kỹ sư thực hiện, và Lý do loại trừ nếu có.

### 4. `src/pages/(sup)/research/ResearchHeader.tsx`
- Thêm dropdown chọn dự án kèm Material icon `folder_open`.
- Giữ đúng 1 nút CTA chính màu vàng đồng `#C9A227` duy nhất: **"Chạy kiểm định mới"**.
- Nút phụ viền mảnh: **"Xuất tệp đối soát (CSV)"**.
- Header metadata ribbon thuần Việt, rõ ràng chuẩn nghiệp vụ v2.2.

### 5. `src/pages/(sup)/research/AsyncValidationJobBanner.tsx`
- Cải tiến thông báo tiến trình nền, thanh progress bar mượt mà, thuần Việt 100%.

### 6. `src/pages/(sup)/research/ValidationRunsTable.tsx`
- Bảng lịch sử các đợt kiểm định đồng bộ số liệu `5 / 3 loại` và số lượng `8 cặp đối soát`.
- Badge trạng thái `HOÀN TẤT` (xanh), `ĐANG XỬ LÝ (202)` (vàng).

### 7. `src/pages/(sup)/ResearchValidation.tsx`
- Điều phối state tổng thể, kích hoạt ticker tự động chạy từ 5% đến 100%.
- Tự động gọi `completeValidationRun` và cập nhật dòng lịch sử sang `HOÀN TẤT` khi tác vụ kết thúc.

---

## III. KẾT QUẢ KIỂM THỬ & ĐÁNH GIÁ

- **Biên dịch TypeScript:** `npx tsc -b` vượt qua sạch sẽ (Exit code 0), không còn bất kỳ lỗi type nào.
- **Kiểm thử giao diện:**
  - Chuyển đổi dự án: Dữ liệu mẫu và chỉ số tự động thay đổi chính xác.
  - Chạy kiểm định mới: Tác vụ tăng dần $5\% \rightarrow 35\% \rightarrow 65\% \rightarrow 100\%$ và tự động chuyển sang `HOÀN TẤT`.
  - Xuất CSV: Tải về đúng tệp CSV với đầy đủ cột thông số kỹ thuật `MET-12`.
  - Đồng bộ số liệu: Số mẫu trên thẻ KPI, bộ nút lọc, số dòng trong bảng và lịch sử kiểm định khớp 1:1, không còn lệch số.
