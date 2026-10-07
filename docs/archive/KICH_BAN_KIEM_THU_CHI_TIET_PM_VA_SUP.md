# KỊCH BẢN KIỂM THỬ TỪNG BƯỚC CHO ROLE PM VÀ SUPERVISOR (END-TO-END WALKTHROUGH)
> **Dự án:** RoadGuard — Hệ thống Quản lý Bảo hành & Sửa chữa Hạ tầng Giao thông (Nhà thầu Hoàng Hải)  
> **Căn cứ chuẩn:** `docs/specs/29_9` (`operation_catalog.md`, `01_FRD_SRS.md`, `02_Business_Rules.md`)  
> **Quy tắc bất biến:** Quản lý khối lượng kỹ thuật thuần túy ($m^2, m, cm$, TCVN 8819:2011), Zero Money (không có bảng giá/BOQ tài chính).

---

## 🧭 TỔNG QUAN LUỒNG TÁC NGHIỆP LIÊN VAI TRÒ
```mermaid
sequenceDiagram
    autonumber
    actor PM as Project Manager (Chỉ huy trưởng)
    actor SUP as Supervisor (Giám sát / Chủ đầu tư)

    Note over SUP: BƯỚC 1: SUP khởi tạo dự án & mời nhân sự
    SUP->>PM: Mời PM vào dự án, bổ nhiệm Drone Operator & Đội thi công

    Note over PM: BƯỚC 2: PM thiết lập hạ tầng tuyến đường
    PM->>SUP: Nạp tim đường (GeoJSON/GPX) & Phân chia phân đoạn -> Trình duyệt tuyến
    SUP-->>PM: Thẩm định MapLibre -> Xác nhận tuyến (Khóa bất biến RoadSectionVersion)

    Note over PM: BƯỚC 3: PM tạo & quản lý khảo sát Drone
    PM->>PM: Tạo Survey Request -> Drone bay xong -> AI xử lý trả về kết quả

    Note over PM: BƯỚC 4: PM thẩm định lỗi AI & Phân luồng (Triage)
    PM->>PM: Duyệt Bounding Box, so sánh ảnh đa kỳ, gán Phương án kỹ thuật (TCVN)
    PM->>PM: Phân luồng: Fast Track (sửa ngay) HOẶC Approval Track (cần duyệt)

    Note over PM, SUP: BƯỚC 5: Xử lý nhánh duyệt & thi công
    PM->>SUP: Gom đợt sửa Approval Track -> Trình duyệt hồ sơ kỹ thuật
    SUP-->>PM: Thẩm duyệt từng hạng mục (WF-07: APPROVE / Yêu cầu sửa đổi / Từ chối)
    PM->>PM: Giao việc đội thi công (Repair Crew) ngoài hiện trường

    Note over PM, SUP: BƯỚC 6: Nghiệm thu & Đóng đợt
    PM->>SUP: Đóng Fast Track trực tiếp; Nộp ảnh Before/After nhánh Approval Track
    SUP-->>PM: Thẩm định bằng chứng đối chứng -> Bấm Nghiệm thu đạt (PASSED)
    SUP->>SUP: Đóng tổng thể vụ việc (Mixed Case) & Ký số đóng đợt sửa chữa
```

---

# PHẦN 1: KỊCH BẢN KIỂM THỬ CHI TIẾT DÀNH CHO ROLE PM (PROJECT MANAGER)

Đăng nhập tài khoản PM: `pm@hoanghai.vn` / `RoadGuard@2026`  
(URL: `/login` $\rightarrow$ Redirect về `/pm/dashboard`)

---

### BƯỚC PM-01: Kiểm tra Dashboard Chỉ huy & Lối tắt
- **Đường dẫn URL:** `/pm/dashboard`
- **Mục tiêu:** Nắm bắt tổng thể khối lượng hư hỏng cần xử lý, khảo sát đang chạy và các việc khẩn.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem các thẻ KPI: Tổng số lỗi mới từ AI (`NEW`), số lỗi cần thẩm định, số đợt sửa đang trình duyệt.
  2. [ ] Bấm các nút lối tắt nhanh: "Tạo khảo sát bay", "Hộp thư AI", "Gom đợt sửa chữa".
  3. [ ] Kiểm tra danh sách "Việc cần xử lý ngay" (Pending Actions): hiển thị các công việc gán cho PM.
- **Tiêu chuẩn đạt (Expected):** Không có trường tiền tệ; số liệu nhảy mượt; click lối tắt chuyển đúng trang.

---

### BƯỚC PM-02: Thiết lập Tuyến đường, Tuyến nhánh & Phân đoạn (DA02, DA14, DA15, DA17)
- **Đường dẫn URL:** `/pm/projects/:id/alignment` (hoặc `/pm/alignment`)
- **Mục tiêu:** Nhập chuỗi tọa độ tim tuyến chính, khai báo mạng lưới tuyến nhánh nút giao / đường gom và phân chia phân đoạn kỹ thuật.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] **Tim tuyến chính:** Tải lên tệp mẫu GeoJSON/GPX hoặc dùng công cụ vẽ/tạo nhanh trên bản đồ MapLibre. Cấu hình Lý trình gốc (`Km0+000`) và bề rộng mặt đường (ví dụ: 12.0m).
  2. [ ] **Tạo Tuyến nhánh (DA17):** Bấm `+ Thêm Tuyến Nhánh / Đường Gom`. Nhập Tên nhánh (ví dụ: *Nhánh rẽ Đèo Hải Vân*), Lý trình rẽ từ trục chính (`BranchStationKm`: ví dụ `Km 1024+500`), Hướng rẽ, Chiều dài nhánh ($1.85 km$), Bề rộng mặt đường nhánh. Kiểm tra hiển thị nét vẽ phân biệt trên bản đồ MapLibre.
  3. [ ] **Phân chia Phân đoạn theo đối tượng:**
     - Chọn `[ Trục chính ]` $\rightarrow$ Nhập độ dài mục tiêu (100m, 500m, 1000m) $\rightarrow$ Bấm **"Xem trước (Preview)"** và **"Công bố tập đoạn (Publish)"**.
     - Chọn `[ Tuyến nhánh #01 ]` $\rightarrow$ Chia đoạn riêng cho tuyến nhánh (mỗi đoạn 500m).
  4. [ ] Bấm nút **"Trình Giám sát xác nhận tuyến"** (Gửi trọn gói cả Trục chính và Tuyến nhánh sang Supervisor).
- **Tiêu chuẩn đạt (Expected):** Bản đồ vẽ rõ tim trục chính (nét liền) và tuyến nhánh (nét đứt kèm nhãn nút rẽ); phân đoạn phủ kín 100% không bị hở; gửi trình duyệt thành công.

---

### BƯỚC PM-03: Lập Yêu cầu Bay Khảo sát Drone (KB01, KB02)
- **Đường dẫn URL:** `/pm/surveys/create`
- **Mục tiêu:** Tạo phiếu giao nhiệm vụ bay quét cho Drone Operator, xác định rõ phạm vi Trục chính hoặc Tuyến nhánh.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Chọn Dự án và chọn đối tượng tuyến bay:
     - Thử chọn `[Trục chính] QL1A` $\rightarrow$ kiểm tra lý trình tự động gán từ `Km 1020+000` đến `Km 1025+000`.
     - Thử chọn `[Tuyến nhánh] Nhánh rẽ Đèo Hải Vân` $\rightarrow$ kiểm tra bản đồ tự zoom đến nhánh rẽ, lý trình tự chuyển thành `Km 0+000` đến `Km 1+850` và vẽ dải hành lang bay riêng cho nhánh.
  2. [ ] Nhập thông số bay: độ cao an toàn (65m), độ phân giải GSD ($\le 1.5$ cm/px), độ phủ chồng ảnh (80%).
  3. [ ] Chọn Drone Operator được chỉ định bay từ danh sách nhân sự dự án.
  4. [ ] Bấm **"Tạo yêu cầu bay khảo sát"**.
- **Tiêu chuẩn đạt (Expected):** Chuyển hướng về `/pm/surveys`, nhiệm vụ mới hiển thị rõ tên tuyến/nhánh được chỉ định bay.

---

### BƯỚC PM-04: Quản lý Danh sách & Tiến độ Khảo sát (KB03, KB04)
- **Đường dẫn URL:** `/pm/surveys`
- **Mục tiêu:** Theo dõi tiến độ bay, trạng thái nạp dữ liệu ảnh (Orthophoto) và tiến trình AI Detect.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem danh sách các đợt bay: Bộ lọc theo trạng thái (`SCHEDULED`, `PROCESSING`, `COMPLETED`).
  2. [ ] Mở chi tiết một đợt khảo sát: Xem thông số bay, ngày bay, tệp bản đồ trực ảnh nạp lên.
  3. [ ] Kiểm tra trạng thái AI: Đã hoàn tất phân tích phát hiện hư hỏng mặt đường $\rightarrow$ Có nút bấm chuyển sang **"Xem lỗi phát hiện"**.
- **Tiêu chuẩn đạt (Expected):** Hiển thị rõ tiến trình từ bay $\rightarrow$ tải ảnh $\rightarrow$ AI hoàn tất.

---

### BƯỚC PM-05: Tiếp nhận Hộp thư Lỗi AI & Phản ánh Người dân (TD01, TD02, PA03)
- **Đường dẫn URL:** `/pm/ai-inbox`
- **Mục tiêu:** Tiếp nhận và sàng lọc danh sách khiếm khuyết thô do AI phát hiện và phản ánh công dân gửi về.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem danh sách bảng lỗi: Kiểm tra cột vị trí xem có hiển thị rõ ràng nhãn phân loại tuyến:
     - Hư hỏng trên trục chính: `[Trục chính] Km 1025+400 • Làn cơ giới`.
     - Hư hỏng trên đường nhánh: `[Nhánh Hải Vân] Km 0+350 • Làn rẽ phải`.
  2. [ ] Thử lọc theo phạm vi tuyến (Bộ lọc Tuyến chính / Tuyến nhánh) để kiểm tra danh sách lọc tương ứng.
  3. [ ] Tích chọn nhiều lỗi $\rightarrow$ Thao tác hàng loạt (Bulk Action): "Xác nhận hàng loạt" hoặc "Đánh dấu kiểm tra lại".
  4. [ ] Bấm vào một lỗi cụ thể để vào màn hình thẩm định chuyên sâu.
- **Tiêu chuẩn đạt (Expected):** Phân biệt chính xác hư hỏng nằm ở trục chính hay tuyến nhánh; tọa độ ghim trên bản đồ chuẩn xác.

---

### BƯỚC PM-06: Thẩm định Chi tiết Lỗi AI & Bounding Box (TD03)
- **Đường dẫn URL:** `/pm/defects/:id/verify-a`
- **Mục tiêu:** Xác minh hình ảnh, chỉnh sửa khung nhận diện bounding box, loại trừ nhận diện sai (False Positive).
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem ảnh cận cảnh Drone với khung Bounding Box của AI.
  2. [ ] Kéo chỉnh kích thước hộp bounding box hoặc vẽ lại nếu AI phát hiện lệch.
  3. [ ] Đổi loại khiếm khuyết (ví dụ từ Nứt đơn sang Nứt chân vịt/lưới) nếu AI nhận diện nhầm.
  4. [ ] Bấm **"Xác nhận lỗi (Confirm Defect)"** hoặc **"Bác bỏ lỗi AI (Reject False Positive)"**.
- **Tiêu chuẩn đạt (Expected):** Thao tác kéo thả mượt mà; bấm xác nhận chuyển trạng thái sang `CONFIRMED`.

---

### BƯỚC PM-07: So sánh Ảnh Đa kỳ Temporal Epoch (TD04)
- **Đường dẫn URL:** `/pm/defects/:id/verify-b`
- **Mục tiêu:** Đánh giá tốc độ phát triển suy thoái của vết nứt/ổ gà theo thời gian.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem thanh trượt so sánh 2 ảnh: Ảnh kỳ bay trước (T-1) và Ảnh kỳ bay mới nhất (T).
  2. [ ] Kéo thanh trượt Split-screen (Side-by-side) để đối chiếu tốc độ mở rộng của vết nứt.
  3. [ ] Ghi chú đánh giá tốc độ hư hỏng (Tăng nhanh / Ổn định) làm căn cứ chọn phương án kỹ thuật.
- **Tiêu chuẩn đạt (Expected):** Hiển thị rõ ngày chụp 2 kỳ; thanh trượt so sánh hoạt động trực quan.

---

### BƯỚC PM-08: Gán Phương án Kỹ thuật & Phân luồng Triage (TD05, SC01, SC02)
- **Đường dẫn URL:** `/pm/defects/:id` (hoặc modal trong màn hình thẩm định)
- **Mục tiêu:** Chọn biện pháp sửa chữa theo TCVN 8819 và phân luồng Fast Track / Approval Track.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Chọn biện pháp sửa chữa kỹ thuật:
     - Trám nứt bằng bitum polyme nóng (TCVN 8819) $\rightarrow$ nhập chiều dài ($m$).
     - Cào bóc & thảm lại BTN C12.5 $\rightarrow$ nhập diện tích cào bóc ($m^2$) và chiều sâu ($cm$).
  2. [ ] Lựa chọn phân luồng xử lý (`TriageDecision`):
     - **Fast Track (Sửa chữa nhanh/khẩn cấp):** Dành cho lỗi nhẹ, PM tự quyết, tự giao việc và tự đóng hồ sơ.
     - **Approval Track (Nhánh cần duyệt):** Hư hỏng kết cấu nặng, bắt buộc lập hồ sơ trình Supervisor duyệt.
  3. [ ] Bấm **"Lưu phương án kỹ thuật & Phân luồng"**.
- **Tiêu chuẩn đạt (Expected):** Không có ô nhập giá tiền/đơn giá; phân luồng lưu đúng vào hồ sơ.

---

### BƯỚC PM-09: Quản lý & Thi công Nhánh Sửa chữa Nhanh Fast Track (SC03, HT01)
- **Đường dẫn URL:** `/pm/fast-track` (hoặc tab Fast Track)
- **Mục tiêu:** PM tự chỉ đạo xử lý và nghiệm thu đóng các lỗi thông thường mà không cần chờ Chủ đầu tư.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem danh sách các hạng mục Fast Track đang chờ thi công.
  2. [ ] Chọn hạng mục $\rightarrow$ Phân công Đội thi công nội bộ.
  3. [ ] Khi đội thi công nộp ảnh hoàn thành $\rightarrow$ PM xem ảnh Before/After và bấm **"Đóng hoàn thành Fast Track"**.
- **Tiêu chuẩn đạt (Expected):** Hạng mục chuyển sang trạng thái `CLOSED`; ghi nhận nhật ký đóng bởi PM.

---

### BƯỚC PM-10: Gom Đợt Sửa chữa & Lập Hồ sơ Trình duyệt (SC04, SC05)
- **Đường dẫn URL:** `/pm/proposals` (hoặc `/pm/repair-batches/create`)
- **Mục tiêu:** Gom các lỗi thuộc nhánh Approval Track thành một đợt sửa chữa lớn để trình Giám sát (cho phép gom theo Trục chính hoặc Tuyến nhánh).
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Bấm nút **"Tạo Đợt sửa chữa mới"**.
  2. [ ] Đặt tên đợt: ví dụ *"Đợt sửa chữa mặt đường Km1+200 - Km3+500 Quý 4"* hoặc *"Đợt sửa chữa cấp bách Tuyến nhánh Hải Vân"*.
  3. [ ] Chọn các khiếm khuyết thuộc nhánh Approval Track vào danh sách gom đợt: kiểm tra cột `Tuyến / Nhánh` để lọc đúng vị trí cần gom.
  4. [ ] Xem tổng hợp khối lượng kỹ thuật: Tách biệt tổng diện tích cào bóc Trục chính ($\sum m^2$) và Tuyến nhánh ($\sum m^2$).
  5. [ ] Bấm nút CTA chính: **"Trình duyệt Đợt sửa chữa"** (Gửi yêu cầu sang Supervisor).
- **Tiêu chuẩn đạt (Expected):** Đợt sửa chuyển sang trạng thái `PENDING_APPROVAL`; xuất hiện trong danh sách chờ duyệt; hoàn toàn không có bảng BOQ giá tiền.

---

### BƯỚC PM-11: Phân công Đội Thi công Ngoài Hiện trường (SC08)
- **Đường dẫn URL:** `/pm/repair-batches/assign` (hoặc nút Giao việc tại chi tiết đợt đã duyệt)
- **Mục tiêu:** Sau khi đợt sửa được Supervisor phê duyệt (`APPROVED`), PM giao việc cho đội thi công.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Mở đợt sửa chữa có trạng thái `APPROVED`.
  2. [ ] Chọn Đội thi công (Repair Crew) từ danh sách đội thuộc dự án.
  3. [ ] Đặt hạn hoàn thành (Deadline) và tải lên biện pháp tổ chức thi công/chỉ dẫn kỹ thuật.
  4. [ ] Bấm **"Giao việc cho Đội thi công"**.
- **Tiêu chuẩn đạt (Expected):** Trạng thái đợt sửa chuyển sang `ASSIGNED` $\rightarrow$ Đội thi công nhận nhiệm vụ trên Mobile.

---

### BƯỚC PM-12: Theo dõi Nhiệm vụ Đo đạc Bổ sung (KT01, KT02)
- **Đường dẫn URL:** `/pm/field-tasks`
- **Mục tiêu:** Quản lý các phiếu yêu cầu đo đạc thước/laser bổ sung ngoài hiện trường khi ảnh Drone chưa đủ rõ.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem danh sách nhiệm vụ hiện trường (Field Tasks).
  2. [ ] Bấm "Tạo nhiệm vụ đo đạc bổ sung": Chỉ định vị trí lỗi, loại thiết bị đo (thước đo lún, máy laser).
  3. [ ] Xem kết quả số liệu nộp về từ kỹ thuật viên hiện trường và cập nhật ngược lại vào hồ sơ lỗi.
- **Tiêu chuẩn đạt (Expected):** Quản lý trạng thái phiếu đo đạc mượt mà (`OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`).

---

### BƯỚC PM-13: Hoàn tất & Trình Nghiệm thu Hạng mục (HT08)
- **Đường dẫn URL:** `/pm/evidence-closeout` (hoặc màn hình Xác nhận hoàn thành công việc)
- **Mục tiêu:** Nộp bằng chứng ảnh đối chứng (Before/After) lên Giám sát để đề nghị nghiệm thu.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Mở hạng mục thi công đã hoàn tất.
  2. [ ] Kiểm tra cặp ảnh: Ảnh hư hỏng ban đầu (Before) và Ảnh sau khi thảm nhựa hoàn thiện (After) có tọa độ GPS/EXIF.
  3. [ ] Đính kèm biên bản lấy mẫu/thí nghiệm độ chặt lu lèn (nếu có).
  4. [ ] Bấm **"Trình Giám sát nghiệm thu (Submit for Inspection)"**.
- **Tiêu chuẩn đạt (Expected):** Chuyển trạng thái sang `PENDING_INSPECTION`, chờ Supervisor nghiệm thu.

---

# PHẦN 2: KỊCH BẢN KIỂM THỬ CHI TIẾT DÀNH CHO ROLE SUPERVISOR (GIÁM SÁT / CHỦ ĐẦU TƯ)

Đăng nhập tài khoản Supervisor: `sup@hoanghai.vn` / `RoadGuard@2026`  
(URL: `/login` $\rightarrow$ Redirect về `/sup/dashboard`)

---

### BƯỚC SUP-01: Khởi tạo Dự án & Phân bổ Nhân sự (DA01, DA03)
- **Đường dẫn URL:** `/sup/projects` $\rightarrow$ Bấm "Thêm mới dự án"
- **Mục tiêu:** Tạo mới hợp đồng bảo hành dự án và bổ nhiệm các nhân sự chủ chốt.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Nhập thông tin dự án: Tên dự án (ví dụ: *Cao tốc Bắc - Nam đoạn QL45 - Nghi Sơn*), Mã hợp đồng, Thời hạn bảo hành (Bắt đầu/Kết thúc).
  2. [ ] Bổ nhiệm nhân sự: Chọn PM phụ trách dự án, bổ nhiệm Drone Operator và Đội thi công.
  3. [ ] Bấm **"Lưu & Khởi tạo dự án"**.
- **Tiêu chuẩn đạt (Expected):** Dự án mới hiển thị trong danh sách ở trạng thái `ACTIVE`; PM được phân quyền thấy dự án trong danh sách của mình.

---

### BƯỚC SUP-02: Thẩm định & Xác nhận Tuyến đường & Tuyến nhánh (DA13)
- **Đường dẫn URL:** `/sup/projects/:id/alignment` (hoặc `/sup/alignment`)
- **Mục tiêu:** Giám sát kiểm tra tim tuyến chính và toàn bộ tuyến nhánh do PM nạp lên trước khi khóa phiên bản vận hành.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem tim tuyến chính và các tuyến nhánh trên bản đồ MapLibre tương tác (kiểm tra điểm rẽ `BranchStationKm`, góc giao cắt).
  2. [ ] Kiểm tra danh sách các phân đoạn (SegmentSet) của cả trục chính và tuyến nhánh do PM chia.
  3. [ ] Bấm nút **"Xác nhận phiên bản tuyến (Confirm Route Version)"**.
- **Tiêu chuẩn đạt (Expected):** Toàn bộ phiên bản tuyến và các nhánh được khóa bất biến `RoadSectionVersion` (Read-only); PM bắt đầu được phép lập khảo sát bay cho từng nhánh.

---

### BƯỚC SUP-03: Thẩm duyệt Đợt Sửa chữa (Quy trình 4 Nhánh WF-07) (SC06)
- **Đường dẫn URL:** `/sup/proposals` $\rightarrow$ Bấm mở đợt sửa đang ở trạng thái `PENDING_APPROVAL` (hoặc `/sup/approvals/:id`)
- **Mục tiêu:** Thẩm duyệt từng hạng mục kỹ thuật trong đợt sửa do PM trình.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Xem danh sách các hư hỏng trong đợt: Vị trí Km, loại hư hỏng, diện tích cào bóc $m^2$, phương án TCVN.
  2. [ ] **Thực hiện 4 nhánh thẩm duyệt quyết định độc lập trên từng hạng mục:**
     - **Nhánh 1: APPROVE (Phê duyệt):** Bấm duyệt nếu phương án kỹ thuật đạt chuẩn.
     - **Nhánh 2: REQUEST_EVIDENCE (Yêu cầu bổ sung bằng chứng):** Yêu cầu PM chụp thêm ảnh laser/thước đo. Bắt buộc nhập lý do giải trình.
     - **Nhánh 3: REQUEST_RECONSIDER (Yêu cầu xem xét lại):** Đề nghị giảm bớt hoặc tăng diện tích cào bóc. Bắt buộc nhập lý do.
     - **Nhánh 4: REJECT (Từ chối):** Bác bỏ hạng mục không thuộc trách nhiệm bảo hành. Bắt buộc nhập lý do.
  3. [ ] Bấm nút tổng thể: **"Ban hành Quyết định Thẩm duyệt (Issue Decision)"**.
- **Tiêu chuẩn đạt (Expected):**
  - Nếu tất cả được duyệt $\rightarrow$ Đợt chuyển sang `APPROVED`, toàn bộ hồ sơ kỹ thuật bị khóa Read-only (Invariant #3).
  - Nếu có yêu cầu sửa đổi $\rightarrow$ Đợt chuyển sang `REVISION_REQUIRED`, trả về cho PM sửa lại.

---

### BƯỚC SUP-04: Thẩm định Bằng chứng & Nghiệm thu Chất lượng Hiện trường (HT10)
- **Đường dẫn URL:** `/sup/acceptance` (hoặc `/sup/acceptance/:batchId`)
- **Mục tiêu:** Đối chứng ảnh thi công hoàn thành và ra quyết định nghiệm thu chất lượng.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Mở hạng mục đang ở trạng thái `PENDING_INSPECTION`.
  2. [ ] Kiểm tra cặp ảnh đối chứng Before/After: xem độ phẳng mặt đường sau khi thảm nhựa, kiểm tra tọa độ GPS và tem thời gian.
  3. [ ] Ra quyết định nghiệm thu:
     - Bấm **"Chấp thuận Nghiệm thu (Accept / Pass)"** $\rightarrow$ Hạng mục đạt yêu cầu chất lượng.
     - HOẶC Bấm **"Yêu cầu sửa lại (Rework Required)"** $\rightarrow$ Nhập lý do (ví dụ: mặt đường bị gồ ghề, lu lèn chưa đủ độ chặt) để trả về cho PM làm lại.
- **Tiêu chuẩn đạt (Expected):** Hạng mục chuyển sang trạng thái `PASSED` (hoặc `REWORK`); ghi nhận log nghiệm thu của Supervisor.

---

### BƯỚC SUP-05: Đóng Tổng thể Vụ việc Hỗn hợp (Mixed Case Closeout) (HT12)
- **Đường dẫn URL:** Chi tiết vụ việc (Case Detail)
- **Mục tiêu:** Đóng vụ việc hư hỏng khi tất cả các nhánh con (Fast Track + Approval Track) đã hoàn thành 100%.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] Mở vụ việc hỗn hợp (gồm 1 lỗi Fast Track do PM tự xử lý và 1 lỗi Approval Track do Supervisor nghiệm thu).
  2. [ ] Kiểm tra điều kiện tiên quyết: Nếu còn 1 hạng mục chưa đạt $\rightarrow$ Nút đóng bị khóa mờ (Disabled).
  3. [ ] Khi cả 2 hạng mục đều đã hoàn tất $\rightarrow$ Bấm nút **"Đóng Tổng thể Vụ việc (Close Case)"**.
- **Tiêu chuẩn đạt (Expected):** Vụ việc chuyển sang `CLOSED`; ngăn chặn đóng sai sót khi chưa nghiệm thu hết.

---

### BƯỚC SUP-06: Báo cáo Phân tích Rủi ro & Ký số Đóng Đợt Sửa chữa (BC01, BC07, SC10)
- **Đường dẫn URL:** `/sup/risk-analytics` (hoặc `/sup/signoff`)
- **Mục tiêu:** Theo dõi chỉ số suy thoái đường bộ và ký biên bản đóng đợt sửa chữa khi 100% hạng mục đạt nghiệm thu.
- **Thao tác kiểm tra trên màn hình:**
  1. [ ] **Phân tích Rủi ro:** Xem biểu đồ suy thoái mặt đường MET-01, MET-04; bản đồ nhiệt mật độ hư hỏng theo lý trình.
  2. [ ] **Ký số đóng đợt (Sign-off):**
     - Mở đợt sửa chữa đã nghiệm thu 100% (`PASSED`).
     - Xem biên bản tổng hợp kỹ thuật.
     - Nhập mã PIN / Xác nhận chữ ký số $\rightarrow$ Bấm **"Ký số & Đóng đợt sửa chữa (Sign-off Batch Closeout)"**.
  3. [ ] **Xuất Hồ sơ:** Bấm "Tải Hồ sơ Hoàn công (PDF)" và gói ZIP kèm mã Checksum SHA-256 xác thực.
- **Tiêu chuẩn đạt (Expected):** Đợt sửa chuyển sang trạng thái cuối cùng `COMPLETED`; tệp tải về có đầy đủ thông tin kỹ thuật và chữ ký điện tử.

---

# BẢNG TỔNG HỢP KIỂM TRA ĐẠT / KHÔNG ĐẠT (CHECKLIST TỔNG)

| Mã bước | Tên bước kiểm tra | Role | Trạng thái hiển thị | Thao tác tương tác | Không dính giá tiền | Ghi chú / Lỗi cần chỉnh |
|:---:|---|:---:|:---:|:---:|:---:|---|
| **PM-01** | Dashboard & Lối tắt | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-02** | Tuyến chính, Tuyến nhánh & Phân đoạn | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-03** | Tạo yêu cầu bay (Chọn trục/nhánh) | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-04** | Theo dõi tiến độ khảo sát | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-05** | Hộp thư AI & Phản ánh (Lọc trục/nhánh) | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-06** | Thẩm định Bounding Box | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-07** | So sánh ảnh đa kỳ | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-08** | Gán TCVN & Phân luồng | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-09** | Xử lý Fast Track | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-10** | Gom đợt (Theo trục/nhánh) & Trình duyệt | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-11** | Giao việc đội thi công | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-12** | Nhiệm vụ đo đạc bổ sung | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **PM-13** | Trình hồ sơ nghiệm thu | PM | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **SUP-01** | Khởi tạo dự án & Mời người | SUP | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **SUP-02** | Thẩm định tuyến chính & tuyến nhánh | SUP | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **SUP-03** | Thẩm duyệt 4 nhánh WF-07 | SUP | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **SUP-04** | Nghiệm thu Before/After | SUP | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **SUP-05** | Đóng Mixed Case | SUP | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
| **SUP-06** | Rủi ro & Ký số đóng đợt | SUP | [ ] Đạt / [ ] Chưa | [ ] Đạt / [ ] Chưa | [ ] Đạt | |
