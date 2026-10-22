# DANH SÁCH CHỨC NĂNG CHƯA LÀM HOẶC ĐANG BỊ SAI SO VỚI NGHIỆP VỤ MỚI (SPECS 17_10)

> **Người thực hiện:** Hoàng (Solo Frontend Web)  
> **Căn cứ nghiệp vụ:** Bộ đặc tả chuẩn 17_10 (`docs/specs/17_10`) và tài liệu `v2.2`.  
> **Quy ước:** Tài liệu này **CHỈ LIỆT KÊ** các hạng mục **CHƯA LÀM** hoặc **ĐANG BỊ SAI** so với nghiệp vụ mới, phân tách độc lập theo từng Menu của từng Role.

---

# PHẦN 1: ROLE PROJECT MANAGER (PM - CHỈ HUY TRƯỞNG)

---

### MENU 1: TỔNG QUAN (`/pm/dashboard`)
* **Màn hình Spec:** `PM-13`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Ẩn các widget phê duyệt hồ sơ:** Màn hình dashboard của PM tuyệt đối không hiển thị các widget phê duyệt gói sửa chữa hay thẩm định cấp phép (đặc quyền của Supervisor).
  2. `[CHƯA LÀM]` **Đồng hồ thời hạn xử lý (Clocks & Business Duties - `API-062`):** Bổ sung widget cảnh báo các đợt bay drone hoặc nhiệm vụ đo đạc hiện trường sắp hết hạn SLA.

---

### MENU 2: DỰ ÁN BẢO HÀNH (`/pm/projects`)
* **Route:** `/pm/projects`, `/pm/projects/:id`, `/pm/projects/:id/alignment`
* **Màn hình Spec:** `PM-01`, `PM-02`, `PM-03`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Ẩn nút "Tạo dự án mới" trên `/pm/projects`:** Khởi tạo dự án (`API-050`) và sửa thông tin gốc dự án (`API-051`) là thẩm quyền của Supervisor (`SUP-04`). PM chỉ xem danh sách các dự án mình là thành viên (`API-049`).
  2. `[ĐANG BỊ SAI]` **Phân quyền nút trên bản đồ tuyến MapLibre (`/pm/projects/:id/alignment`):**
     * **Ẩn nút "Xác nhận chính thức bản vẽ tuyến (Confirm)" (`API-180`, `API-187`)**: Nút này chỉ mở cho Supervisor.
     * Giữ lại cho PM các nút: "Lưu bản nháp" (`API-177`), "Xem trước" (`API-181`), và "Xuất bản tập phân đoạn kỹ thuật" (`API-196`).
  3. `[ĐANG BỊ SAI]` **Khóa quyền Đóng dự án tại `/pm/projects/:id` (`API-110` `operational-closures` / DA12):** Tuyệt đối không hiển thị nút "Đóng dự án bảo hành" cho PM. PM chỉ xem Stepper 4 giai đoạn vòng đời ở chế độ Read-only.
  4. `[CHƯA LÀM]` **Hồ sơ Hệ quy chiếu tọa độ CRS (`API-065`, `API-066`):** Chưa có giao diện để PM khai báo và cập nhật hồ sơ CRS địa phương (ví dụ VN-2000 kinh tuyến trục hoặc WGS84 UTM Zone 48N).

---

### MENU 3: KHẢO SÁT & AI

#### 3.1. Mục con: Đợt bay Drone (`/pm/surveys`)
* **Route:**
  - Danh sách đợt bay: `/pm/surveys`
  - Tạo yêu cầu bay: `/pm/surveys/create`
  - Khung hình đợt bay & Thẩm định AI: `/pm/surveys/:id/review`, `/pm/defects/:id/verify-a`
* **Màn hình Spec:** `PM-04`, `PM-05`, `PM-06`, `PM-07`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Form Tạo yêu cầu bay (`CreateSurveyForm.tsx`):** Vẫn còn tùy chọn upload ảnh trực giao Orthomosaic GeoTIFF và mô hình 3D đám mây điểm. **Cần xóa hoàn toàn**, chỉ giữ 2 trường upload: Video hành trình MP4 ($\le 8\text{GB}$) và File viễn thám telemetry SRT/GPS ($\le 10\text{MB}$) (`API-057`, `API-059`).
  2. `[ĐANG BỊ SAI]` **Không tự ý hiển thị kích thước vật lý tự tính từ AI:** Tại màn hình thẩm định candidate, cấm quy đổi pixel bounding box ra $m^2$ diện tích, $m$ chiều dài hay $cm$ độ sâu. Bắt buộc hiển thị nhãn `Chờ đo đạc hiện trường (FIELD)`. Kích thước chỉ được ghi nhận khi đội hiện trường đo thực tế (`API-096`).
  3. `[CHƯA LÀM]` **Chuẩn hóa bộ nút hành động thẩm định Candidate (`DefectVerifyForm.tsx`):**
     * Nút 1: `KEEP_NEW` (Xác nhận tạo Defect mới).
     * Nút 2: `LINK_EXISTING` (Liên kết tái phát - `API-110` `recurrences`).
     * Nút 3: `REJECT` (Từ chối nhận diện sai kèm lý do).
     * Tuyệt đối không để AI tự tạo Defect chính thức khi PM chưa bấm quyết định.

#### 3.2. Mục con: Hộp thư tiếp nhận lỗi (`/pm/ai-inbox`)
* **Route:** `/pm/ai-inbox`
* **Màn hình Spec:** `PM-11`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Ẩn nút "Gán dự án (Triage)" khi hồ sơ ở trạng thái `Unassigned`:** Quyền Triage phân loại và gán phản ánh vào dự án (`API-024`) là đặc quyền của Supervisor. PM không có nút này.
  2. `[CHƯA LÀM]` **Bổ sung các tác vụ của PM đối với phản ánh đã gán vào dự án (`Open`):**
     * Nút **Kết luận vụ việc** (`API-020` `CaseConclusionDto`): Xác định có hư hỏng cần bảo hành hay ngoài phạm vi/không có hư hỏng.
     * Nút **Gộp phản ánh trùng lặp** (`API-022` `CaseLinkDto`): Gộp các phản ánh lân cận về cùng một vụ việc.
     * Nút **Tách phản ánh** (`API-023` `CaseSplitDto`): Tách các phản ánh bị gộp nhầm.
     * Nút **Phát hành công khai** (`API-021` `CasePublicationDto`): Gửi cập nhật tiến độ công khai cho người dân theo dõi qua ứng dụng di động.

#### 3.3. Mục con: Điều phối nhanh (Fast Track - `/pm/fast-track`)
* **Route:** `/pm/fast-track`
* **Màn hình Spec:** `PM-10`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Kiểm tra tính hợp lệ Fast Track theo Server (`API-146`):** Đang dùng logic hardcode ở client ($S \le 1.0m^2$, sâu $\ge 5cm$). Cần sửa thành đọc danh sách lý do không đủ điều kiện (`missingReasons`) do API trả về.
  2. `[CHƯA LÀM]` **Quyền Nghiệm thu chốt hoàn thành Fast Track (`API-147`):** PM là người bấm nút **"Xác nhận hoàn thành Fast Track (Final Confirmation)"**. Không chuyển nút này cho Supervisor.
  3. `[CHƯA LÀM]` **Quản lý chính sách Fast Track (`API-162`..`API-167`):** Bổ sung giao diện xem dự thảo, xuất bản revision và thu hồi chính sách xử lý cấp bách.

---

### MENU 4: SỬA CHỮA & HIỆN TRƯỜNG

#### 4.1. Mục con: Gói sửa chữa (`/pm/proposals`)
* **Route:** `/pm/proposals`, `/pm/repair-batches/assign`
* **Màn hình Spec:** `PM-09`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Ẩn hoàn toàn nút "Phê duyệt gói" khỏi PM:** PM chỉ lập phương án và bấm **"Trình duyệt hồ sơ"** (`API-139`, `API-140`). Quyền Phê duyệt gói (`API-142`) chỉ thuộc Supervisor.
  2. `[CHƯA LÀM]` **Phân công đội thi công (`API-143`):** Sau khi Supervisor duyệt gói (`ReadyToAssign`), mở giao diện để PM chọn và giao việc cho Đội thi công (Repair Crew).
  3. `[CHƯA LÀM]` **Biện pháp an toàn tạm thời (`API-151`, `API-152`):** Giao diện thiết lập rào chắn, biển cảnh báo tạm ngoài hiện trường trước khi thi công chính thức.

#### 4.2. Mục con: Nghiệm thu (`/pm/acceptance`)
* **Route:** `/pm/acceptance`, `/pm/evidence-closeout`
* **Màn hình Spec:** `PM-09`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Khai báo hoàn thành thi công (`API-110` `construction-declarations`):** Sau khi Crew nộp ảnh hoàn công, PM thực hiện thao tác khai báo hoàn thành kèm `evidenceFileIds` để chuyển gói sang chờ Supervisor nghiệm thu.
  2. `[ĐANG BỊ SAI]` **Wire input của lệnh Review Attempt (`API-158`):** CẤM gửi chuỗi `REWORK`. Giá trị gửi lên Server chỉ được là **`ACCEPT`** (Chấp thuận) hoặc **`SUPPLEMENT`** (Yêu cầu làm lại/bổ sung).
  3. `[ĐANG BỊ SAI]` **Ẩn nút "Ký số nghiệm thu đóng đợt (Final Confirmation)" đối với gói thường (NORMAL):** PM chỉ đánh giá `ACCEPT`, bước ký số đóng đợt (`API-147`) là của Supervisor.

#### 4.3. Mục con: Nhiệm vụ & Đo đạc hiện trường (`/pm/field-tasks`)
* **Route:** `/pm/field-tasks`
* **Màn hình Spec:** `PM-08`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Tái sử dụng bằng chứng phản ánh (`API-084` Evidence Reuse):** Cho phép PM chọn tái sử dụng ảnh người dân nộp để làm bằng chứng Trước thi công (Before evidence), không bắt buộc Crew chụp lại nếu ảnh đã rõ.
  2. `[CHƯA LÀM]` **Đánh giá kết quả đo đạc từ Crew (`API-092`, `API-096`):** Giao diện cho PM xem các kích thước vật lý thật ($m, m^2, cm$) do Crew đo tại hiện trường nộp về và bấm chấp thuận kết quả đo.

---

### MENU 5: BÁO CÁO & HỒ SƠ

#### 5.1. Mục con: Thực nghiệm AI (`/pm/research-validation`)
* **Route:** `/pm/research-validation`
* **Màn hình Spec:** `PM-05`, `PM-07`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Quản lý Nhãn dữ liệu huấn luyện (Training Labels - `API-105`, `API-106`, `API-108`):** Bổ sung giao diện xem danh sách nhãn, gắn nhãn mới từ candidate và sửa đổi nhãn phục vụ đào tạo mô hình AI.

#### 5.2. Mục con: Lưu trữ hồ sơ & Nhật ký hoạt động (`/pm/retention`, `/pm/audit-trail`)
* **Route:** `/pm/retention`, `/pm/audit-trail`
* **Màn hình Spec:** `PM-12`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Ẩn nút "Tạo lệnh phong tỏa pháp lý (Legal Hold)":** PM chỉ được xem thời hạn lưu trữ hồ sơ. Quyền phong tỏa pháp lý (`API-220`) thuộc duy nhất về Supervisor.

---

### THANH TIÊU ĐỀ (HEADER): CHUÔNG THÔNG BÁO & ĐỒNG HỒ NHIỆM VỤ
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Đồng hồ nhiệm vụ (Clocks & Business Duties - `API-062`):** Hiển thị đếm ngược thời gian xử lý hồ sơ/đợt bay còn lại, kèm nút xin gia hạn (`API-064`) hoặc chỉ định người làm thay (`API-063`).

---
---

# PHẦN 2: ROLE SUPERVISOR (SUP - GIÁM SÁT / CHỦ ĐẦU TƯ)

---

### MENU 1: TỔNG QUAN (`/sup/dashboard`)
* **Màn hình Spec:** `SUP-01`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Bảng điều khiển rủi ro và phê duyệt hồ sơ:** Hiển thị danh sách các gói sửa chữa đang chờ Supervisor duyệt (`Pending Approval`), tỷ lệ quá hạn xử lý và chỉ số KPI rủi ro suy thoái tuyến đường.

---

### MENU 2: DỰ ÁN BẢO HÀNH (`/sup/projects`)
* **Route:** `/sup/projects`, `/sup/projects/:id`, `/sup/projects/:id/alignment`
* **Màn hình Spec:** `SUP-04`, `SUP-05`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Mở nút "Tạo dự án mới" (`API-050`) và "Chỉnh sửa dự án" (`API-051`):** Mở đầy đủ quyền quản trị thông tin gốc dự án cho Supervisor trên `/sup/projects`.
  2. `[CHƯA LÀM]` **Mở nút "Xác nhận chính thức bản vẽ tuyến (Confirm)" (`/sup/projects/:id/alignment`):**
     * Xác nhận dự thảo hình học tuyến: `API-180` (`POST .../road-geometry-drafts/{draftId}/confirm`).
     * Xác nhận dự thảo phân đoạn tuyến: `API-187` (`POST .../geometry-drafts/{draftId}/confirm`).
  3. `[ĐANG BỊ SAI]` **Ẩn các công cụ vẽ/chỉnh sửa tuyến nháp:** Supervisor không vẽ nháp tuyến đường (PM là người vẽ), Supervisor chỉ kiểm tra tính sẵn sàng (`API-182`) và bấm duyệt.
  4. `[CHƯA LÀM]` **Nút "Đóng dự án bảo hành" (`API-110` `operational-closures` / DA12):** Hiển thị nút đóng dự án cho Supervisor tại `/sup/projects/:id` khi thỏa mãn điều kiện: `open_defects === 0` và hồ sơ đã lưu trữ số đủ 5 năm (`BR-45`, `QT13`).

---

### MENU 3: KHẢO SÁT & TIẾP NHẬN

#### 3.1. Mục con: Tiếp nhận phản ánh (`/sup/cases`)
* **Route:** `/sup/cases`
* **Màn hình Spec:** `SUP-02`, `SUP-03`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Giao diện tiếp nhận hồ sơ Unassigned cho Supervisor:** Hiển thị danh sách các phản ánh người dân gửi về chưa được gán dự án (`API-018`).
  2. `[CHƯA LÀM]` **Nút bấm Triage gán dự án (`API-024`):** Cho phép Supervisor gán phản ánh vào một Dự án cụ thể và chọn Phương thức xác minh ban đầu (`Field` / `Drone` / `ExistingEvidence`).
  3. `[ĐANG BỊ SAI]` **Supervisor ở chế độ Read-only với kết luận phản ánh (`SUP-03`):** Cấm hiển thị các nút Kết luận vụ việc, Gộp hoặc Tách phản ánh cho Supervisor (các nút này do PM thực hiện).

#### 3.2. Mục con: Giám sát Drone (`/sup/surveys`)
* **Route:** `/sup/surveys`
* **Màn hình Spec:** `SUP-06`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[ĐANG BỊ SAI]` **Đảm bảo chế độ Giám sát thuần túy (Read-only):** Cấm hiển thị các nút thẩm định AI, tạo task đo đạc hay ra quyết định Defect từ màn hình này (toàn bộ thẩm định AI do PM phụ trách).

#### 3.3. Mục con: Xử lý cấp bách (Fast Track - `/sup/fast-track`)
* **Route:** `/sup/fast-track`
* **Màn hình Spec:** `SUP-08`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Xác nhận độ phủ tuyến đường áp dụng Fast Track (`API-176`):** Mở giao diện cho Supervisor xác nhận danh mục các đoạn tuyến đủ điều kiện cho phép thi công sửa chữa cấp bách (`POST /api/v1/projects/{projectId}/road-coverage`).
  2. `[ĐANG BỊ SAI]` **Xóa hoàn toàn nút Phê duyệt gói hoặc Nghiệm thu từng gói Fast Track:** PM là người nghiệm thu chốt gói Fast Track (`API-147`). Supervisor chỉ nhận thông tin thông báo tiến độ, không duyệt từng gói nhỏ.

---

### MENU 4: THẨM DUYỆT & NGHIỆM THU

#### 4.1. Mục con: Phê duyệt gói (`/sup/proposals`)
* **Route:** `/sup/proposals`, `/sup/approvals/:id`
* **Màn hình Spec:** `SUP-07`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Mở bộ nút Thẩm duyệt hồ sơ sửa chữa thường:**
     * Nút **"Phê duyệt hồ sơ"** (`API-142`): Chuyển trạng thái gói sang `ReadyToAssign`.
     * Nút **"Yêu cầu sửa đổi / Từ chối"** (`BatchRejection.tsx`): Nhập lý do kỹ thuật trả về cho PM lập lại.
  2. `[ĐANG BỊ SAI]` **Loại bỏ hoàn toàn trường giá tiền, đơn giá, BOQ:** Hồ sơ trình duyệt bắt buộc là khối lượng kỹ thuật thuần túy ($m^2$ cào bóc, chiều sâu, định mức vật tư theo TCVN 8819:2011).

#### 4.2. Mục con: Nghiệm thu đóng đợt (`/sup/acceptance`)
* **Route:** `/sup/acceptance`, `/sup/acceptance/:batchId`
* **Màn hình Spec:** `SUP-07`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Mở nút "Ký số nghiệm thu đóng đợt (Final Confirmation)" (`API-147`):** Dành riêng cho Supervisor ký số nghiệm thu hoàn thành chính thức gói sửa chữa thường (NORMAL) sau khi đối chiếu ảnh Trước/Sau và biên bản hoàn công của PM.

#### 4.3. Mục con: Nghiệm thu hiện trường (`/sup/field-tasks`)
* **Route:** `/sup/field-tasks`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Chế độ kiểm tra chéo biên bản hiện trường:** Màn hình Read-only cho Supervisor theo dõi kết quả đo đạc thực tế của các nhiệm vụ trắc địa ngoài hiện trường.

---

### MENU 5: BÁO CÁO & QUẢN TRỊ

#### 5.1. Mục con: Nhân sự & Phân quyền (`/sup/personnel`)
* **Route:** `/sup/personnel`
* **Màn hình Spec:** `SUP-04`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Quản trị người dùng hệ thống:** Xem danh sách tài khoản (`API-237`), Gửi thư mời tài khoản mới (`API-032`), Khóa/Mở tài khoản (`API-239`), Kích hoạt đặt lại mật khẩu (`API-240`).

#### 5.2. Mục con: Cấu hình hệ thống (`/sup/system-control`)
* **Route:** `/sup/system-control`
* **Màn hình Spec:** `SUP-10`
* **Các điểm chưa làm hoặc đang bị sai:**
  1. `[CHƯA LÀM]` **Quản lý Phong tỏa pháp lý (Legal Hold):** Mở nút **"Tạo lệnh phong tỏa hồ sơ" (`API-220`)** và **"Gỡ bỏ phong tỏa" (`API-222`)** dành riêng cho vai trò Supervisor.
  2. `[CHƯA LÀM]` **Quy định thời hạn lưu trữ hồ sơ số:** Hiển thị thời gian lưu trữ tối thiểu (Thời hạn bảo hành + 5 năm). Trạng thái `ELIGIBLE_FOR_REVIEW` là thời điểm rà soát đánh giá, không phải nút xóa dữ liệu tự động.
