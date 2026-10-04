# ROADGUARD — HƯỚNG DẪN KỊCH BẢN DEMO TOÀN DIỆN (E2E WORKFLOW)
> **Căn cứ nghiệp vụ:** 100% trích xuất từ tài liệu chuẩn `v2.2` (Luồng 1 đến Luồng 8 trong `RoadGuard_Frontend_PM_Supervisor_ChiTietChucNang.md`, Quy tắc `BR-01` đến `BR-48`, kịch bản `UAT-01` đến `UAT-12`).  
> **Hai vai trò phối hợp trên Web Dashboard:**  
> • **Supervisor** (Giám sát / Quản trị viên nhà thầu) — Đăng nhập: `suphoang@gmail.com`  
> • **Project Manager (PM)** (Chỉ huy trưởng công trình) — Đăng nhập: `pmhoang@gmail.com`  
> **Nguyên tắc demo:** Tuần tự theo menu thực tế trên thanh điều hướng Web, mock data đồng bộ xuyên suốt từ đầu đến cuối, không nhảy cóc.

---

## 📌 BỘ DỮ LIỆU MOCKDATA ĐỒNG BỘ XUYÊN SUỐT BUỔI DEMO

Để buổi demo liền mạch và nhất quán tuyệt đối, toàn bộ kịch bản sử dụng một bộ định danh duy nhất:

| Thông tin đối tượng | Giá trị MockData chuẩn thống nhất | Ghi chú nghiệp vụ |
|---|---|---|
| **Dự án bảo hành** | **`QL1A - Giai đoạn 2 (Km 1020 - Km 1045)`** | Mã: **`PRJ-QL1A-02`** |
| **Phạm vi & Chiều dài** | **`Km 1020+000` $\rightarrow$ `Km 1045+000`** (Tổng dài: **`25.0 km`**) | Kết cấu: `ASPHALT` (Bê tông nhựa) |
| **Hệ quy chiếu phẳng (CRS)** | **`UTM Zone 48N (EPSG: 32648)`** | Bắt buộc theo quy tắc BR-35 |
| **Thời hạn bảo hành** | **`01/01/2026` $\rightarrow$ `01/01/2028`** (24 tháng) | Tiền giữ lại: `5.000.000.000 VNĐ` |
| **Giám sát viên (Supervisor)** | **`Kỹ sư Nguyễn Văn An`** (`suphoang@gmail.com`) | Toàn quyền Admin hệ thống (BR-02) |
| **Chỉ huy trưởng (PM chính)** | **`Đỗ Quốc Hoàng (PM)`** (`pmhoang@gmail.com`) | PM phụ trách duy nhất dự án (BR-02) |
| **Phi công Drone (Operator)** | **`Nguyễn Văn Tiến`** (`tien.nguyen@drone.hoanghai.vn`) | Đội bay trắc địa không ảnh 01 |
| **Đội trưởng thi công (Crew)** | **`Lê Văn Hùng`** (`hung.le@crew.hoanghai.vn`) | Tổ thi công thảm nhựa Asphalt 01 |
| **Mô hình AI nhận diện** | **`Road-YOLOv9-Civil-Edge v2.4.1-prod`** | mAP@50: `92.4%` • Trạng thái: `ACTIVE` |
| **Hư hỏng Fast-Track (< 5cm)** | Vết nứt đơn mặt đường tại **`Km 1022+450`** | Giao nhiệm vụ `INSPECT_AND_REPAIR` |
| **Hư hỏng Gói đề xuất (Duyệt)** | Gói **`PKG-2026-01`**: Item A (`Km 1025+250`), Item B (`Km 1028+100`), Item C (`Km 1032+100`) | Nhánh `APPROVAL_TRACK` |
| **Hư hỏng khẩn cấp (Emergency)** | Hố sụt lún nguy hiểm sau mưa bão tại **`Km 1038+500`** | Kích hoạt rào chắn tạm thời 4h |

---

## 🗺️ BẢNG TRA CỨU NHANH TÊN MENU TRÊN GIAO DIỆN WEB

| Vai trò | Tên mục hiển thị trên Menu Sidebar | Đường dẫn URL | Nghiệp vụ chính tương ứng trong v2.2 |
|:---:|---|---|---|
| **SUP** | **Danh mục dự án** | `/sup/projects` | Khởi tạo dự án mới, xem danh mục dự án bảo hành (`DA01`) |
| **SUP** | **Quản trị hệ thống & Legal Hold** | `/sup/system-control` | Cấp tài khoản, phân quyền, kiểm soát AI & phong tỏa pháp lý (`FR-02, FR-36, BR-45`) |
| **SUP** | **Phê duyệt tuyến đường** | `/sup/alignment` | Thẩm duyệt & khóa phiên bản tuyến bất biến (`DA13`) |
| **SUP** | **Phê duyệt gói sửa chữa** | `/sup/proposals` | Thẩm duyệt độc lập từng hạng mục sửa chữa (`SC06, BR-21`) |
| **SUP** | **Nghiệm thu chất lượng & Đóng vụ việc** | `/sup/acceptance` | Nghiệm thu bằng chứng Before/After & đóng tổng thể Mixed Case (`HT10, BR-26`) |
| **SUP** | **Báo cáo rủi ro & Hồ sơ xuất** | `/sup/risk-analytics` | Dashboard KPI rủi ro suy thoái mặt đường (`RPT-06`) |
| **PM** | **Danh mục dự án** | `/pm/projects` | Xem dự án được phân công phụ trách (`DA01, BR-02`) |
| **PM** | **Tuyến đường & Phân đoạn** | `/pm/alignment` | Nhập file GeoJSON/GPX, nắn tim tuyến, phân đoạn 1.000m (`DA02, DA14`) |
| **PM** | **Khảo sát Drone & Không ảnh** | `/pm/surveys` | Lập kế hoạch bay Baseline, giao việc Operator, kiểm tra độ phủ (`DA06, KS01, KS11`) |
| **PM** | **Điều phối & Quản lý hư hỏng** | `/pm/ai-inbox` | Thẩm định Bounding Box, so sánh đa kỳ, gộp báo trùng (`AI05, AI06, PA04`) |
| **PM** | **Chính sách Fast-Track & Giao việc** | `/pm/fast-track` | Cấu hình ngưỡng nứt < 5cm, giao sửa nhanh & đóng lỗi trực tiếp (`SC13, BR-25`) |
| **PM** | **Đồng bộ & Xử lý xung đột** | `/pm/field-tasks` | Quản lý nhiệm vụ đo đạc hiện trường `MEASURE_ONLY` (`SC02, BR-24`) |
| **PM** | **Gói đề xuất sửa chữa** | `/pm/proposals` | Lập gói đề xuất sửa chữa, khóa snapshot trình duyệt (`SC04, SC05`) |
| **PM** | **Rà soát kết quả & Công bố** | `/pm/acceptance` | Rà soát hoàn thành, trình nghiệm thu, công bố kết quả cho người dân (`HT09, PA07`) |
| **PM** | **Lưu trữ bảo hành (WF-12)** | `/pm/retention` | Lập yêu cầu xóa dữ liệu hồ sơ hết hạn bảo hành + 5 năm (`QT11, BR-45`) |
| **CHUNG** | **Báo cáo thực nghiệm (RPT-09)** | `/sup/research-validation` | Đối soát sai số AI với số đo thực tế Ground Truth: Bias, MAE, RMSE (`BR-44`) |
| **CHUNG** | **Nhật ký kiểm toán (RPT-10)** | `/sup/audit-trail` | Tra cứu lịch sử truy vết hệ thống toàn vẹn Read-only (`BR-45`) |

---

# 🚀 KỊCH BẢN DEMO CHI TIẾT 8 GIAI ĐOẠN (26 BƯỚC THỰC HIỆN)

---

## 🟢 GIAI ĐOẠN 1: KHỞI TẠO DỰ ÁN & PHÂN QUYỀN BAN ĐẦU

### Bước 1.1 — Supervisor Đăng nhập & Đổi mật khẩu lần đầu
- **Tài khoản:** `suphoang@gmail.com`
- **Vị trí thao tác:** Màn hình Đăng nhập (`/login`)
- **Thực hiện:**
  1. Nhập email `suphoang@gmail.com` và mật khẩu tạm thời.
  2. Bấm **"Đăng nhập"**.
  3. **Hiển thị cơ chế v2.2 (BR-01):** Hệ thống phát hiện cờ đổi mật khẩu lần đầu, tự động chuyển hướng sang trang **Đổi mật khẩu lần đầu** (`/force-change-password`).
  4. Supervisor nhập mật khẩu mới và bấm **"Cập nhật mật khẩu"** $\rightarrow$ Hệ thống chuyển tiếp vào màn hình **Dashboard Giám sát** (`/sup/dashboard`).

### Bước 1.2 — Supervisor Khởi tạo dự án bảo hành mới
- **Vị trí thao tác:** Menu **`"Danh mục dự án"`** (`/sup/projects`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Danh mục dự án"`**.
  2. Bấm nút màu vàng **`"+ Tạo dự án mới"`** ở góc phải màn hình.
  3. Nhập form thông tin dự án chuẩn:
     - **Tên dự án:** `QL1A - Giai đoạn 2 (Km 1020 - Km 1045)`
     - **Mã dự án:** `PRJ-QL1A-02`
     - **Loại kết cấu mặt đường:** Chọn `Bê tông nhựa (ASPHALT)`
     - **Ngày bắt đầu bảo hành:** `01/01/2026` | **Thời hạn:** `24 tháng` $\rightarrow$ Ngày hết hạn: `01/01/2028`
     - **Giá trị giữ lại bảo hành:** `5.000.000.000` (5 tỷ đồng)
     - **Hệ tọa độ trắc địa phẳng (CRS):** Chọn `UTM Zone 48N (EPSG: 32648)` (BR-35)
  4. Bấm **"Tạo dự án"** $\rightarrow$ Dự án xuất hiện trong danh sách ở trạng thái `ACTIVE`.

### Bước 1.3 — Supervisor Cấp tài khoản & Gán nhân sự vào dự án
- **Vị trí thao tác:** Menu **`"Quản trị hệ thống & Legal Hold"`** (`/sup/system-control`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Quản trị hệ thống & Legal Hold"`**.
  2. Tại Tab **`"Tài khoản & Phân quyền (FR-02)"`**, bấm nút **`"+ Thêm nhân sự vào dự án"`**.
  3. Thực hiện gán 3 nhân sự nòng cốt vào dự án `PRJ-QL1A-02` (`QT01, DA03`):
     - **Chỉ huy trưởng (PM chính):** `Đỗ Quốc Hoàng (PM)` (`pmhoang@gmail.com`) — Vai trò: `PROJECT_MANAGER`. *(Theo BR-02: Mỗi dự án chỉ có 1 PM chính duy nhất)*.
     - **Phi công Drone:** `Nguyễn Văn Tiến` (`tien.nguyen@drone.hoanghai.vn`) — Vai trò: `DRONE_OPERATOR`.
     - **Đội trưởng thi công:** `Lê Văn Hùng` (`hung.le@crew.hoanghai.vn`) — Vai trò: `REPAIR_CREW`.
  4. Mở Tab **`"Mô hình AI & Đánh giá (FR-36)"`**: Xem mô hình `Road-YOLOv9-Civil-Edge v2.4.1-prod` (mAP@50 đạt 92.4%) đang chạy chính thức (`ACTIVE`).
  5. Mở Tab **`"Danh mục khiếm khuyết TCVN (FR-36)"`**: Xem danh mục các loại hư hỏng chuẩn TCVN (Ổ gà, Nứt mai rùa, Hằn lún bánh xe...).

### Bước 1.4 — PM Kích hoạt tài khoản, Đổi mật khẩu & Nhận dự án
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Màn hình Kích hoạt lời mời (`/accept-invitation`) hoặc Đăng nhập (`/login`)
- **Thực hiện:**
  1. Đăng xuất tài khoản Supervisor (hoặc mở cửa sổ ẩn danh mới).
  2. Đăng nhập tài khoản PM: `pmhoang@gmail.com`. Đổi mật khẩu lần đầu.
  3. Đăng nhập thành công, giao diện tự động nhận diện vai trò `PROJECT_MANAGER` (`/pm/dashboard`).
  4. Bấm vào Menu **`"Danh mục dự án"`** (`/pm/projects`) $\rightarrow$ PM thấy dự án `QL1A - Giai đoạn 2 (Km 1020 - Km 1045)` đã được phân công trực tiếp cho mình.

---

## 🟡 GIAI ĐOẠN 2: THIẾT LẬP TUYẾN ĐƯỜNG, HÌNH HỌC & PHÂN ĐOẠN SEGMENT

### Bước 2.1 — PM Nhập file GeoJSON, Bề rộng mặt đường & Trình duyệt tuyến
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Tuyến đường & Phân đoạn"`** (`/pm/alignment`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Tuyến đường & Phân đoạn"`**.
  2. Bấm nút **`"Nhập GeoJSON/KML"`** ở thanh công cụ phía trên để mở hộp thoại.
  3. **Thao tác nạp GeoJSON mới nâng cấp:**
     - **Cách 1:** Nhấp vào vùng kéo thả nét đứt và chọn tệp `.geojson` hoặc `.json` từ máy tính.
     - **Cách 2:** Chọn mẫu có sẵn: *"QL1A Mở rộng (25.0 km • Tuyến chuẩn)"*.
     - Hệ thống tự động trích xuất chuỗi tọa độ LineString WGS84, tính lý trình phẳng và cập nhật toàn bộ tim tuyến lên bản đồ MapLibre.
  4. Quan sát 3 lớp hình học trực quan theo quy chuẩn BR-34:
     - Tim đường màu đỏ nét đứt.
     - Dải thảm mặt đường màu xanh lam (Đoạn 1 rộng 8m, Đoạn 2 rộng 10m).
     - Hành lang an toàn quy hoạch màu vàng nhạt (mở rộng 2m mỗi bên thành 12m-14m).
  5. Bấm nút màu vàng **`"Trình duyệt tim tuyến"`** $\rightarrow$ Hồ sơ hình học chuyển trạng thái sang `PENDING_CONFIRMATION` gửi tới Supervisor.

### Bước 2.2 — Supervisor Thẩm duyệt & Khóa phiên bản tuyến bất biến (DA13)
- **Tài khoản:** `suphoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Phê duyệt tuyến đường"`** (`/sup/alignment`)
- **Thực hiện:**
  1. Chuyển sang tài khoản Supervisor, mở menu **`"Phê duyệt tuyến đường"`**.
  2. Kiểm tra bản đồ MapLibre và thông số kỹ thuật (Hệ quy chiếu EPSG:32648, chiều dài 25.0 km).
  3. Bấm nút **`"Xác nhận khóa tim tuyến"`**.
  4. **Cơ chế v2.2 (BR-35):** Tuyến đường được đóng băng thành `RoadSectionVersion` bất biến (CONFIRMED có mã SHA-256), khóa cứng toàn bộ mốc lý trình từ `Km 1020` đến `Km 1045`.

### Bước 2.3 — PM Phân đoạn tuyến (Segment) & Công bố tập đoạn đường
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Tuyến đường & Phân đoạn"`** (`/pm/alignment`), Tab Phân đoạn
- **Thực hiện:**
  1. Chuyển lại tài khoản PM, mở trang **`"Tuyến đường & Phân đoạn"`**.
  2. Chọn cự ly chia đoạn tự động: `5.0 km` (Hệ thống tự động chia tuyến 25.0 km thành 5 phân đoạn: `SEG-01` đến `SEG-05`).
  3. Bấm **`"Áp dụng chia đoạn"`** $\rightarrow$ Các phân đoạn hiển thị màu sắc so le liên tục trên bản đồ.
  4. Mở Tab phụ **`"Lưới tấm bê tông (Slab)"`** $\rightarrow$ Quan sát 24 tấm slab dự kiến 4m đã được sinh tự động theo quy tắc BR-33.
  5. Bấm nút **`"Công bố tập đoạn đường"`** $\rightarrow$ Bộ `RoadSegmentSet` chính thức có hiệu lực phục vụ bay khảo sát.

---

## 🔵 GIAI ĐOẠN 3: KHẢO SÁT BASELINE, BAY CHỤP DRONE & RÀ SOÁT AI

### Bước 3.1 — PM Lập kế hoạch bay khảo sát gốc (Baseline) & Giao nhiệm vụ
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Khảo sát Drone & Không ảnh"`** (`/pm/surveys`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Khảo sát Drone & Không ảnh"`**.
  2. Bấm nút **`"+ Tạo kế hoạch khảo sát"`** (`/pm/surveys/create`).
  3. Nhập kế hoạch:
     - **Tên kế hoạch:** `Khảo sát Baseline sau bàn giao QL1A`
     - **Loại khảo sát:** Chọn `BASELINE (Khảo sát gốc)`
     - **Dải quan sát quét:** Tích chọn đủ 3 dải: `SURFACE` (Mặt đường), `LEFT_EDGE` (Mép trái), `RIGHT_EDGE` (Mép phải).
     - **Phân công phi công:** Chọn `Nguyễn Văn Tiến` (Đội bay 01).
     - **Tọa độ điểm cất/hạ cánh (Access Point):** `108.1651° E, 16.2052° N`.
  4. Bấm **"Khởi tạo nhiệm vụ bay"**.

### Bước 3.2 — Tiếp nhận dữ liệu bay & Kiểm tra độ phủ bề mặt (Coverage Check)
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Khảo sát Drone & Không ảnh"`** $\rightarrow$ Xem chi tiết chuyến bay
- **Thực hiện:**
  1. Bấm mở chi tiết nhiệm vụ khảo sát vừa hoàn thành.
  2. Drone Operator nộp video MP4 kèm phụ đề SRT (telemetry định vị). Hệ thống xác thực mã băm SHA-256 Checksum hợp lệ (BR-20).
  3. PM kiểm tra bảng đánh giá 3 chiều độc lập theo quy tắc **BR-41**:
     - *Vị trí bay (Position):* Đạt hành lang bay quy định.
     - *Chất lượng hình ảnh (Quality):* Độ phân giải cao, rõ nét.
     - *Độ phủ thực tế (Coverage):* Đạt `SUFFICIENT` trên toàn bộ bề mặt.

### Bước 3.3 — Kích hoạt AI phân tích & Rà soát phát hiện hư hỏng
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Điều phối & Quản lý hư hỏng"`** (`/pm/ai-inbox`)
- **Thực hiện:**
  1. Bấm nút **"Kích hoạt xử lý AI"** $\rightarrow$ Hệ thống sinh Job xử lý và gọi mô hình YOLOv9 phân tích.
  2. Mở menu **`"Điều phối & Quản lý hư hỏng"`** (`/pm/ai-inbox`), mở chi tiết phát hiện:
     - **Xác nhận phát hiện đúng (AI05):** Xem Bounding box tại `Km 1022+450` (vết nứt nhỏ) và `Km 1025+250` (hằn lún bánh xe). Bấm **"Chấp thuận phát hiện"** để chuyển thành `Preliminary Defect` (trạng thái `OPEN`).
     - **So sánh ảnh đa kỳ (Temporal Side-by-side - AI06):** Mở Tab "So sánh đa kỳ", quan sát ảnh kỳ hiện tại đặt cạnh ảnh kỳ trước để đối soát tốc độ phát triển hư hỏng.
     - **Loại bỏ phát hiện sai (False Positive - AI07):** Một vệt bóng cây bị nhận nhầm $\rightarrow$ Bấm **"Loại bỏ phát hiện" (Reject)**, ghi lý do: *"Bóng râm ven đường, không phải hư hỏng kết cấu"*.
     - **Duyệt nhãn huấn luyện AI (QT07, US-10):** Bấm nút duyệt nhãn để trích xuất dữ liệu huấn luyện cho kỹ sư AI.

### Bước 3.4 — PM Khóa mốc chuẩn Baseline cho các dải quan sát
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Chi tiết khảo sát Drone
- **Thực hiện:**
  1. Với các dải quan sát đã rà soát sạch lỗi, PM bấm nút **`"Xác nhận Baseline"`** (`DA10`).
  2. **Quy tắc v2.2 (BR-40):** Dữ liệu Baseline được khóa cố định làm thước đo chuẩn so sánh độ nứt lún trong suốt 2 năm bảo hành.

---

## 🟣 GIAI ĐOẠN 4: TIẾP NHẬN PHẢN ÁNH NGƯỜI DÂN, TRIAGE & PHÂN CẤP LỖI

### Bước 4.1 — Tiếp nhận phản ánh & Liên kết phản ánh trùng (Triage & Deduplication)
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Điều phối & Quản lý hư hỏng"`** (`/pm/ai-inbox`), Tab Phản ánh người dân
- **Thực hiện:**
  1. Mở Tab **"Phản ánh người dân (Triage)"**.
  2. Có 3 phản ánh của người dân cùng gửi về vị trí sụt lở tại `Km 1025+250`.
  3. Tích chọn cả 3 phản ánh gần nhau $\rightarrow$ Bấm nút **`"Liên kết phản ánh trùng"`** (`PA04`).
  4. **Cơ chế v2.2 (BR-30, UAT-05):** Gộp 3 phản ánh vào 1 `IncidentCase` duy nhất, bảo toàn ảnh gốc của từng người dân, tuyệt đối không tạo 3 lệnh sửa chữa trùng lặp.

### Bước 4.2 — Phân cấp mức độ (Severity x Urgency) & Sắp xếp ưu tiên
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Chi tiết Defect
- **Thực hiện:**
  1. Ghi nhận kết luận kiểm chứng: Xác nhận có hư hỏng thực tế (`DEFECT_FOUND`) $\rightarrow$ Defect chuyển trạng thái chính thức `VERIFIED`.
  2. Phân cấp 2 trục theo quy định SC14:
     - **Severity (Nghiêm trọng):** `HIGH` (Hư hỏng nặng).
     - **Urgency (Khẩn cấp):** `URGENT` (Cần xử lý gấp).
  3. Thiết lập thứ tự ưu tiên xử lý trong dự án.

---

## 🟠 GIAI ĐOẠN 5: CHÍNH SÁCH FAST TRACK & PHÂN NHÁNH THI CÔNG

### Bước 5.1 — PM Thiết lập & Kích hoạt chính sách Fast-Track
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Chính sách Fast-Track & Giao việc"`** (`/pm/fast-track`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Chính sách Fast-Track & Giao việc"`**.
  2. Nhập form tạo chính sách:
     - **Tên chính sách:** `Chính sách sửa nhanh hư hỏng nhẹ QL1A (v1.0)`
     - **Ngưỡng cho phép tự sửa:** Vết nứt đơn $< 5\text{ cm}$, ổ gà nông $< 25\text{ mm}$, diện tích $< 0.5\text{ m}^2$.
     - **Yêu cầu bằng chứng:** Bắt buộc chụp ảnh BEFORE và ảnh AFTER sau thi công.
  3. Bấm **"Kích hoạt chính sách"** (`activatePolicyVersion`).

### Bước 5.2 — Phân nhánh xử lý 4 nhóm hư hỏng
- **Tài khoản:** `pmhoang@gmail.com`
- **Thực hiện:**
  1. **Nhánh 1: Sửa nhanh (Fast-Track):** Vết nứt nhẹ tại `Km 1022+450` $\rightarrow$ Bấm nút giao nhiệm vụ `INSPECT_AND_REPAIR` cho Đội trưởng thi công *Lê Văn Hùng* (`UAT-01`).
  2. **Nhánh 2: Đo đạc gom đợt (Measure-Only):** Mở menu **`"Đồng bộ & Xử lý xung đột"`** (`/pm/field-tasks`), gom các lỗi cần đo đạc và giao nhiệm vụ chế độ `MEASURE_ONLY`. Crew ra hiện trường đo đạc nhưng **bị khóa nút sửa**, không được tự ý vá đường (`BR-24, UAT-02`).
  3. **Nhánh 3: Khẩn cấp (Emergency):** Hố sụt nguy hiểm tại `Km 1038+500` $\rightarrow$ PM kích hoạt lệnh `EMERGENCY` (`SC10`), chỉ đạo Crew lập rào chắn và biển cảnh báo phản quang tạm thời trong vòng 4 giờ (`BR-46`).
  4. **Nhánh 4: Phê duyệt phương án (Approval Track):** Hư hỏng vệt hằn lún bánh xe tại `Km 1025+250` và nứt mai rùa tại `Km 1032+100` $\rightarrow$ Đưa vào gói đề xuất trình Supervisor phê duyệt.

---

## 🔴 GIAI ĐOẠN 6: LẬP DỰ TOÁN, TRÌNH DUYỆT & THẨM DUYỆT PHƯƠNG ÁN (APPROVAL TRACK)

### Bước 6.1 — PM Lập gói đề xuất sửa chữa & Khóa phiên bản trình duyệt
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Gói đề xuất sửa chữa"`** (`/pm/proposals`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Gói đề xuất sửa chữa"`**.
  2. Bấm nút **`"+ Tạo gói đề xuất sửa chữa"`**.
  3. Nhập mã gói `PKG-2026-01`, tiêu đề: *Xử lý lún nứt mặt đường đợt 1*.
  4. Thêm 3 hạng mục công việc độc lập (`RepairItem` A, B, C):
     - **Item A (`Km 1025+250`):** Cào bóc 5cm, thảm lại bê tông nhựa chặt C12.5.
     - **Item B (`Km 1028+100`):** Rót nhựa polymer trám khe nứt dọc mép đường.
     - **Item C (`Km 1032+100`):** Đề xuất trám vá chắp vá thông thường.
  5. Bấm nút **`"Khóa phiên bản và Trình duyệt"`** (`POST /api/v1/repair-packages/{id}/submit`). Gói chuyển sang `SUBMITTED`, gửi snapshot bất biến sang Supervisor.

### Bước 6.2 — Supervisor Thẩm duyệt độc lập từng hạng mục (BR-21, UAT-03)
- **Tài khoản:** `suphoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Phê duyệt gói sửa chữa"`** (`/sup/proposals`)
- **Thực hiện:**
  1. Chuyển sang tài khoản Supervisor, mở menu **`"Phê duyệt gói sửa chữa"`**.
  2. Mở chi tiết gói `PKG-2026-01`, xem xét độc lập từng hạng mục theo đúng quy tắc BR-21:
     - **Item A (`Km 1025+250`):** Phương án kỹ thuật đạt chuẩn $\rightarrow$ Bấm nút **`APPROVE`** (Chấp thuận). Item A lập tức đủ điều kiện giao thi công ngay!
     - **Item B (`Km 1028+100`):** Thiếu ảnh cắm thước đo chiều sâu $\rightarrow$ Bấm nút **`REQUEST_EVIDENCE`**, nhập lý do: *"Yêu cầu chụp bổ sung ảnh cắm thước đo sâu khe nứt"*.
     - **Item C (`Km 1032+100`):** Vá chắp vá không đảm bảo móng đường $\rightarrow$ Bấm nút **`REJECT`** (Từ chối), nhập lý do: *"Khu vực móng yếu, yêu cầu đào xử lý lại lớp móng đá dăm"*. Defect C vẫn mở ở trạng thái `VERIFIED` để PM lập phương án khác sau này (`BR-22`).

### Bước 6.3 — PM Phân công thi công ngay cho Item đã được phê duyệt
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Gói đề xuất sửa chữa"`** (`/pm/proposals`)
- **Thực hiện:**
  1. Chuyển lại tài khoản PM, mở gói `PKG-2026-01`.
  2. Thấy Item A đã có trạng thái `APPROVED` $\rightarrow$ Bấm nút **`"Giao thi công"`** (`BR-23`) giao việc ngay cho Đội trưởng thi công *Lê Văn Hùng*. Tiến độ thi công không bị đình trệ bởi Item B hay Item C!

---

## 🟤 GIAI ĐOẠN 7: HIỆN TRƯỜNG THI CÔNG, NGHIỆM THU CHẤT LƯỢNG & ĐÓNG HỒ SƠ

### Bước 7.1 — Hiện trường nộp bằng chứng thi công hoàn thành
- **Diễn biến:** Đội thi công hoàn thành cào bóc và thảm nhựa ngoài hiện trường. Chụp ảnh trước thi công (BEFORE), ảnh sau hoàn thiện (AFTER), biên bản đo đạc kích thước. Dữ liệu được tải lên và xác nhận toàn vẹn (`VERIFIED`).

### Bước 7.2 — PM Rà soát kết quả & Đóng lỗi Fast-Track
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Rà soát kết quả & Công bố"`** (`/pm/acceptance`)
- **Thực hiện:**
  1. Trên menu bên trái, bấm vào mục **`"Rà soát kết quả & Công bố"`**.
  2. **Với lỗi Fast-Track (`Km 1022+450`):** PM đối chiếu ảnh Before/After và số đo đạt policy $\rightarrow$ Bấm nút **`"Đóng lỗi Fast-Track"`** (`reviewResult: "ACCEPTED"`). Lỗi chuyển sang `RESOLVED`. Hệ thống phát thông báo cho Supervisor. **Fast-Track chính thức kết thúc, không cần Supervisor duyệt lại (BR-25)!**
  3. **Với Item A (Approval Track):** PM kiểm tra chất lượng thi công đạt $\rightarrow$ Bấm nút **`"Trình Supervisor nghiệm thu"`** (`SUBMIT_TO_SUPERVISOR`).

### Bước 7.3 — Supervisor Nghiệm thu chất lượng Approval Track (HT10)
- **Tài khoản:** `suphoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Nghiệm thu chất lượng & Đóng vụ việc"`** (`/sup/acceptance`)
- **Thực hiện:**
  1. Chuyển sang tài khoản Supervisor, mở menu **`"Nghiệm thu chất lượng & Đóng vụ việc"`**.
  2. Mở chi tiết nghiệm thu của Item A (`Km 1025+250`).
  3. Kiểm tra chuỗi bằng chứng từ ảnh hiện trạng gốc $\rightarrow$ phương án duyệt $\rightarrow$ ảnh hoàn công AFTER.
  4. Bấm nút màu xanh **`"Chấp thuận nghiệm thu"`** (`POST /api/v1/repair-attempts/{id}/acceptance`). Hạng mục chính thức hoàn thành nghiệm thu.

### Bước 7.4 — Supervisor Đóng tổng thể vụ việc hỗn hợp (Mixed IncidentCase)
- **Tài khoản:** `suphoang@gmail.com`
- **Vị trí thao tác:** Chi tiết vụ việc trên màn hình Nghiệm thu
- **Thực hiện:**
  1. Vụ việc phản ánh tại `Km 1025+250` bao gồm nhiều lỗi thành phần.
  2. Sau khi lỗi Fast-Track đã được PM đóng và Item Approval Track đã được Supervisor nghiệm thu đạt 100%, Supervisor nhấn nút **`"Đóng tổng thể vụ việc"`** (`POST /api/v1/cases/{id}/close`, `BR-26`). Vụ việc chuyển sang trạng thái đóng hoàn tất `CLOSED`.

### Bước 7.5 — PM Công bố kết quả xử lý cho người dân
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Rà soát kết quả & Công bố"`** (`/pm/acceptance`)
- **Thực hiện:**
  1. Chuyển lại tài khoản PM, mở vụ việc đã đóng `CLOSED`.
  2. Chọn ảnh hoàn công AFTER đẹp nhất $\rightarrow$ Nhấn nút **`"Công bố kết quả cho người dân"`** (`POST /api/v1/cases/{id}/publish`, `PA07, BR-48`).
  3. Người dân mở app thấy thông báo vụ việc đã sửa xong (`REPAIRED`) kèm ảnh hoàn thành; các thông tin nội bộ được ẩn bảo mật (`BR-29`).

---

## ⚫ GIAI ĐOẠN 8: BÁO CÁO KPI, AUDIT TRAIL, NGHIÊN CỨU SAI SỐ & LƯU TRỮ PHÁP LÝ (+5 NĂM)

### Bước 8.1 — Xem Báo cáo Dashboard, Nghiên cứu sai số AI (RPT-09) & Audit Trail (RPT-10)
- **Vị trí thao tác:** Các mục Báo cáo trên thanh menu Sidebar
- **Thực hiện:**
  1. **Supervisor xem Báo cáo rủi ro suy thoái:** Bấm menu **`"Báo cáo rủi ro & Hồ sơ xuất"`** (`/sup/risk-analytics`, `RPT-06`) để xem tốc độ suy thoái mặt đường giữa các kỳ khảo sát.
  2. **Xem Báo cáo thực nghiệm khoa học (Research Validation):** Bấm menu **`"Báo cáo thực nghiệm (RPT-09)"`** (`/sup/research-validation` hoặc `/pm/research-validation`). Quan sát bảng so sánh số đo AI với số đo thực tế Ground Truth đo bằng thước thẳng/thước đo sâu, kiểm tra các chỉ số khoa học: **Bias**, **MAE**, **RMSE** theo đúng quy định **BR-44** và kịch bản `UAT-10`.
  3. **Tra cứu Nhật ký kiểm toán toàn vẹn hệ thống (Audit Trail):** Bấm menu **`"Nhật ký kiểm toán (RPT-10)"`** (`/sup/audit-trail`). Xem nhật ký truy vết chỉ đọc (Read-only): Thể hiện rõ thời gian UTC, Người thực hiện, Hành động, Đối tượng và Giá trị cũ/mới theo quy tắc **BR-45**.

### Bước 8.2 — PM Lập yêu cầu xóa dữ liệu hồ sơ đã hết hạn bảo hành (+5 năm)
- **Tài khoản:** `pmhoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Lưu trữ bảo hành (WF-12)"`** (`/pm/retention`)
- **Thực hiện:**
  1. PM mở menu **`"Lưu trữ bảo hành (WF-12)"`**.
  2. Rà soát danh sách các hồ sơ dự án cũ đã kết thúc thời gian bảo hành cộng thêm 5 năm lưu trữ bắt buộc theo quy định **BR-45**.
  3. Bấm nút **`"Lập yêu cầu xóa dữ liệu"`** (`POST /api/v1/retention/deletion-requests`, `QT11`), ghi rõ căn cứ pháp lý hết hạn và gửi lên Supervisor xem xét.

### Bước 8.3 — Supervisor Thiết lập Legal Hold hoặc Phê duyệt xóa dữ liệu
- **Tài khoản:** `suphoang@gmail.com`
- **Vị trí thao tác:** Menu **`"Quản trị hệ thống & Legal Hold"`** (`/sup/system-control`)
- **Thực hiện:**
  1. Supervisor mở menu **`"Quản trị hệ thống & Legal Hold"`**, chuyển sang Tab **`"Lưu trữ & Phong tỏa pháp lý (Legal Hold)"`**.
  2. **Tình huống A (Có thanh tra, tranh chấp - UAT-12):** Dự án bị cơ quan thanh tra Bộ GTVT yêu cầu kiểm tra $\rightarrow$ Supervisor gạt công tắc **`"Thiết lập giữ hồ sơ pháp lý (Legal Hold = true)"`** (`QT14`), nhập số hiệu công văn thanh tra. Hệ thống lập tức khóa cứng quyền xóa của toàn bộ dự án này, chặn đứng mọi hành vi xóa dữ liệu (`BR-45`).
  3. **Tình huống B (Hồ sơ đủ điều kiện và không tranh chấp):** Với các hồ sơ đã đủ thời hạn (hết bảo hành + 5 năm) và không bị Legal Hold $\rightarrow$ Supervisor bấm nút màu đỏ **`"Phê duyệt xóa (Purge)"`** (`QT12, QT13`). Hệ thống tiến hành dọn dẹp dữ liệu an toàn và lưu biên bản vào Audit Trail.

---

# 📊 TỔNG HỢP RÀ SOÁT ĐỐI CHIẾU SOURCE CODE WEB FRONTEND

### 1. Tính năng ĐÃ NÂNG CẤP HOÀN THÀNH:
- **Nhập file GeoJSON trên màn hình "Tuyến đường & Phân đoạn":** Đã bổ sung bộ đọc FileReader, hỗ trợ tệp `.geojson`, `.json`, `.kml`, `.gpx`, tự động phân tích LineString, tính toán tổng chiều dài km, vẽ tim tuyến lên MapLibre và tự động phân đoạn tức thì.
- **Phân quyền chuẩn v2.2 tại màn hình "Quản trị hệ thống & Legal Hold":** Supervisor nhìn thấy đầy đủ 4 tab; PM chỉ thấy tab Lưu trữ và Nhân sự dự án (đã ẩn hoàn toàn tab Mô hình AI và Danh mục lỗi TCVN để đảm bảo chuẩn thẩm quyền).

### 2. Các điểm cần LƯU Ý KHI THAO TÁC DEMO:
- **Tab Điều phối phản ánh:** Khi demo gộp báo trùng (`UAT-05`), mở menu *"Điều phối & Quản lý hư hỏng"* $\rightarrow$ Chọn tab *"Phản ánh người dân (Triage)"* để tích chọn checkbox các phản ánh trùng nhau rồi bấm *"Liên kết phản ánh trùng"*.
- **Tránh nhầm lẫn với các route cũ:** Tuyệt đối không bấm vào các route duyệt đợt cũ như `/sup/approvals` hay `/sup/signoff`. Luôn sử dụng `/sup/proposals/:id` (duyệt độc lập từng item) và `/sup/acceptance/:id` (nghiệm thu chuỗi chứng cứ) đúng theo chuẩn `v2.2`.

---
*Tài liệu được cập nhật ngày 04/10/2026 bởi Đội ngũ Phát triển RoadGuard Web Frontend.*
