# KẾ HOẠCH CHUẨN HÓA VÀ HOÀN THIỆN WEB DASHBOARD THEO SPECS 17_10

> **Phụ trách:** Hoàng (Solo Frontend Web)  
> **Căn cứ nghiệp vụ chuẩn:** Bộ đặc tả 17_10 (`docs/specs/17_10/`: `02_Supervisor-Screen-API-Matrix.md`, `03_PM-Screen-API-Matrix.md`, `04_Web-Business-Flows.md`, `04_API-Contracts/`) và tài liệu `v2.2`.  
> **Nguyên tắc cốt lõi:**  
> 1. Tuân thủ 100% nghiệp vụ spec chuẩn, **tuyệt đối không tự suy đoán, bịa đặt hay vẽ thêm tính năng**.  
> 2. Đã đối chiếu và kiểm chứng trực tiếp từng màn hình với mã nguồn thực tế tại `src/`.  
> 3. Phân định rành mạch giữa các mục **Đã hoàn thành đúng chuẩn** và các mục **Cần chuẩn hóa / Bổ sung** theo đúng chỉ đạo đã thống nhất.

---

## 📌 TỔNG QUAN TRẠNG THÁI THEO MENU

| Menu | Vai trò PM (`/pm/...`) | Vai trò Supervisor (`/sup/...`) |
|---|---|---|
| **Menu 1: Tổng quan (Dashboard)** | ✅ **Đã hoàn thành chuẩn hóa 100%** | ✅ **Đã có sẵn Dashboard KPI rủi ro & phê duyệt** |
| **Menu 2: Dự án bảo hành** | ✅ **Đã đúng chuẩn RBAC & MapLibre** | ✅ **Đã có đủ quyền Tạo, Sửa, Khóa tim tuyến, Đóng dự án** |
| **Menu 3: Khảo sát & AI** | 🟡 **Cần chuẩn hóa BBox & phân quyền Triage** | 🟡 **Cần mở nút Triage gán dự án (`API-024`)** |
| **Menu 4: Sửa chữa & Hiện trường** | 🟡 **Cần thêm nút Tái sử dụng ảnh (`API-084`)** | 🟡 **Cần chuẩn hóa enum Review Attempt (`API-158`)** |
| **Menu 5: Báo cáo & Quản trị** | ✅ **Đã đúng chuẩn xem lưu trữ & nhật ký** | 🟡 **Cần hoàn thiện module Mời nhân sự (`API-032`)** |

---

# PHẦN 1: ROLE PROJECT MANAGER (PM - CHỈ HUY TRƯỞNG)

---

### MENU 1: TỔNG QUAN (`/pm/dashboard`)
* **Màn hình Spec:** `PM-01`, `PM-11`, `PM-12` (Workflow 10)
* **Trạng thái:** ✅ **ĐÃ HOÀN THÀNH 100%**
  - Thẻ KPI số 3 đã chuẩn hóa hiển thị: *"Phản Ánh Cần Kết Luận (PM-11)"*.
  - Widget Đồng Hồ Thời Hạn Nhiệm Vụ (`API-062` `OperationalClocksWidget.tsx`) đã triển khai theo Phương án A: hiển thị giờ/phút sạch sẽ khi còn $> 30$ phút, đếm ngược giây theo thời gian thực khi khẩn cấp $\le 30$ phút hoặc quá hạn.
  - Modal Xin gia hạn (`API-064`) đã hoàn thiện và hoạt động chuẩn.
  - Đã loại bỏ hoàn toàn các chuỗi debug `API-062`, `(API-064)` khỏi giao diện.

---

### MENU 2: DỰ ÁN BẢO HÀNH (`/pm/projects`)
* **Route:** `/pm/projects`, `/pm/projects/:id`, `/pm/projects/:id/alignment`
* **Màn hình Spec:** `PM-01`, `PM-02`, `PM-03`
* **Trạng thái:** ✅ **ĐÃ ĐÚNG CHUẨN SPECS & PHÂN QUYỀN**
  - **Nút "Thêm mới dự án":** Đã phân quyền chặt chẽ `{isSupervisor && ...}` trong `ProjectList.tsx:112`. PM chỉ xem danh sách các dự án mình là thành viên (`API-049`).
  - **Bản đồ tim tuyến MapLibre (`/pm/projects/:id/alignment`):** Đã phân quyền chuẩn: PM lập bản vẽ tim tuyến và bấm **"Trình duyệt tim tuyến"**; Supervisor là người bấm **"Xác nhận & Khóa tim tuyến"** (`API-180`, `API-187`).
  - **Nút "Đóng dự án bảo hành":** Đã khóa cứng cho Supervisor trong `ProjectOverview.tsx:288`. PM chỉ xem Stepper vòng đời ở chế độ Read-only.
  - *(Lưu ý: Không tạo form khai báo CRS tỉnh thành độc lập vì CRS trong spec `05_GIS` chỉ là metadata kỹ thuật ngầm dưới bản đồ MapLibre, dự án đã chọn Tỉnh/Thành từ lúc Supervisor khởi tạo).*

---

### MENU 3: KHẢO SÁT & AI

#### 3.1. Đợt bay Drone (`/pm/surveys`, `/pm/surveys/create`, `/pm/defects/:id/verify-a`)
* **Màn hình Spec:** `PM-04`, `PM-05`, `PM-06`, `PM-07`
* **Trạng thái các mục:**
  - ✅ **Form Tạo yêu cầu bay (`CreateSurveyForm.tsx`):** Đã làm chuẩn kế hoạch trắc địa trước bay (Tuyến, Lý trình, Độ cao trần bay, Độ phủ ảnh, Chỉ định phi công, Bản đồ corridor). Giữ nguyên, không có trường upload file thừa.
  - ✅ **Bộ nút hành động thẩm định Candidate (`DefectVerifyForm.tsx`):** Đã có đủ bộ 3 nút chuẩn nghiệp vụ `PM-04` bằng tiếng Việt thân thiện:
    1. *"Xác Nhận Hư Hỏng Thực Tế"* (tương ứng `KEEP_NEW`).
    2. *"Liên Kết Tái Phát (API-110)"* (tương ứng `LINK_EXISTING`).
    3. *"Từ Chối / Báo Giả"* (tương ứng `REJECT`).
  - ✅ **ĐÃ HOÀN THÀNH: Chuẩn hóa kích thước vật lý & Bounding Box:**
    - **Căn cứ nghiệp vụ:**
      * Spec 17_10 `03_PM-Screen-API-Matrix.md` dòng 22 (*"AI bbox is not a physical measurement. Crew physical measurement cannot be replaced by AI"*).
      * Spec 17_10 `04_Web-Business-Flows.md` dòng 21 (*"AI bbox, confidence or road segment geometry is never converted by Web into a physical dimension"*).
      * Spec 17_10 `00_Governance/01_Authority-and-Source-of-Truth.md` dòng 63 (*"Physical measurement: Crew đo trực tiếp... Không suy kích thước từ YOLO bbox/GSD/AI confidence"*).
    - **Quy tắc hiển thị & Xử lý:**
      * **Khung Bounding Box (trên ảnh):** Giữ nguyên để người dùng và AI khoanh vùng, định vị trực quan vị trí khiếm khuyết (Candidate). Tuyệt đối không dùng pixel khung này để tự tính toán quy đổi ra $m, m^2, cm$.
      * **Khu vực kích thước hình học (trên Form `DefectVerifyForm.tsx`):**
        - Khi tổ đo đạc chưa nộp số đo: Toàn bộ các trường Chiều dài, Chiều rộng, Chiều sâu, Diện tích hiển thị nhãn: **`Chờ tổ đo đạc nộp dữ liệu (FIELD)`** hoặc **`Chưa đo đạc thực tế`**.
        - PM bấm nút *"Yêu Cầu Đo Đạc Thực Địa (AI13)"* để giao nhiệm vụ cho tổ đo đạc ra hiện trường.
        - **Chỉ sau khi Tổ đo đạc đo bằng thước ngoài hiện trường và nộp dữ liệu về (`API-096`):** Hệ thống mới cập nhật và hiển thị các số đo thực tế ($m, cm, mm$) vào hồ sơ khiếm khuyết.

#### 3.2. Hộp thư tiếp nhận lỗi (`/pm/ai-inbox`)
* **Màn hình Spec:** `PM-11`
* **Trạng thái các mục:**
  - 🟡 **CẦN CHUẨN HÓA: Ẩn nút "Điều phối gán dự án (Triage - `API-024`)" khỏi PM:**
    - Căn cứ: Spec 17_10 [04_Web-Business-Flows.md:17](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/specs/17_10/04_Web-Business-Flows.md#L17) (*"Supervisor triages with API-024; only then does PM assess candidates"*).
    - Việc cần làm: Chuyển nút bấm Triage gán dự án sang giao diện của Supervisor (`/sup/cases`). Ẩn hoàn toàn nút này trên giao diện PM.
  - 🟡 **CẦN CHUẨN HÓA: Quy định phạm vi xử lý phản ánh của PM:**
    - PM chỉ nhìn thấy và thực hiện các thao tác: **Kết luận vụ việc** (`API-020`), **Gộp phản ánh trùng lặp** (`API-022`), **Tách phản ánh** (`API-023`), và **Phát hành công khai cho người dân** (`API-021`) đối với các phản ánh **đã được Supervisor gán vào dự án mà PM phụ trách**.

#### 3.3. Điều phối nhanh (Fast Track - `/pm/fast-track`)
* **Màn hình Spec:** `PM-10`
* **Trạng thái các mục:**
  - ✅ **Quyền Nghiệm thu chốt gói Fast Track (`API-147`):** Đã đúng chuẩn, dành riêng cho PM bấm *"Chấp thuận & Đóng Fast Track"* trong `ActionButtons.tsx`.
  - 🟡 **CẦN BỔ SUNG: Hiển thị lý do cụ thể khi không đủ điều kiện xử lý nhanh (`API-146`):**
    - Khi kiểm tra tính hợp lệ Fast Track, hiển thị thông báo/tooltip nêu rõ lý do từ Server (ví dụ: *"Diện tích vượt quá ngưỡng chính sách (> 1.0 m²)"*, *"Nằm ngoài phân đoạn tuyến được cấp phép"*).
  - 🟡 **CẦN CHUẨN HÓA: Phân quyền Quản lý chính sách Fast Track (`API-162` .. `API-167`):**
    - Theo spec `PM-10`, PM là người lập dự thảo và xuất bản/điều chỉnh chính sách xử lý cấp bách cho tuyến mình phụ trách. Cần mở quyền chỉnh sửa dự thảo chính sách (ngưỡng diện tích, độ sâu, SLA) cho PM trong `PolicySection.tsx`.

---

### MENU 4: SỬA CHỮA & HIỆN TRƯỜNG

#### 4.1. Gói sửa chữa (`/pm/proposals`)
* **Màn hình Spec:** `PM-09`
* **Trạng thái:** ✅ **ĐÃ ĐÚNG CHUẨN SPECS & PHÂN QUYỀN**
  - PM chỉ lập phương án và bấm **"Trình duyệt"** (`API-139`, `API-140`). Quyền Phê duyệt gói (`API-142`) đã nằm ở Supervisor.
  - Phân công đội thi công (`API-143`) và thiết lập biện pháp an toàn giao thông (`API-151`, `API-152`): Đã có sẵn trên màn hình [AssignCrew.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/AssignCrew.tsx).
  - Tuân thủ nguyên tắc Zero Money (không đơn giá/tiền bạc, chỉ quản lý khối lượng kỹ thuật $m^2, cm$, vật tư TCVN 8819:2011).

#### 4.2. Nghiệm thu (`/pm/acceptance`, `/pm/evidence-closeout`)
* **Màn hình Spec:** `PM-09`
* **Trạng thái các mục:**
  - ✅ **Khai báo hoàn thành thi công (`API-110`):** Đã có nút *"Khai Báo Hoàn Thành Thi Công (API-110)"* trong `ActionButtons.tsx:148-153` để PM nộp hồ sơ chuyển Supervisor nghiệm thu.
  - ✅ **Khóa quyền ký số đóng đợt gói thường:** Đã phân quyền, chỉ Supervisor mới có nút *"Đóng đợt thi công"*.
  - 🟡 **CẦN CHUẨN HÓA: Giá trị gửi lên Server khi yêu cầu sửa lại (`API-158`):**
    - Căn cứ: Spec 17_10 [09_Consumer-API-Crosswalk.md:172](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/specs/17_10/04_API-Contracts/09_Consumer-API-Crosswalk.md#L172) (*"PM review ACCEPT/SUPPLEMENT, not wire REWORK"*).
    - Việc cần làm: Trong [acceptanceService.ts:337](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/acceptanceService.ts#L337), chuẩn hóa giá trị action gửi đi thành **`ACCEPT`** (Chấp thuận) hoặc **`SUPPLEMENT`** (Yêu cầu làm lại/bổ sung).

#### 4.3. Nhiệm vụ & Đo đạc hiện trường (`/pm/field-tasks`)
* **Màn hình Spec:** `PM-08`
* **Trạng thái các mục:**
  - ✅ **Đánh giá kết quả đo đạc từ Crew (`API-092`, `API-096`):** Đã có đầy đủ trong [MeasurementsTab.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/field-tasks/MeasurementsTab.tsx) (xem ảnh thước đo đối chiếu ảnh drone song song, nút bấm *"Xác minh số liệu"*).
  - 🟡 **CẦN BỔ SUNG: Nút "Tái sử dụng ảnh phản ánh" (`API-084` Evidence Reuse):**
    - Cho phép PM bấm chọn tái sử dụng ảnh người dân chụp gửi lên làm bằng chứng "Trước thi công" (Before Evidence), không bắt Crew chụp lại nếu ảnh đã rõ.

---

### MENU 5: BÁO CÁO & HỒ SƠ
* **Route:** `/pm/retention`, `/pm/audit-trail`
* **Màn hình Spec:** `PM-12`
* **Trạng thái:** ✅ **ĐÃ ĐÚNG CHUẨN SPECS & PHÂN QUYỀN**
  - Quyền bật/tắt Phong tỏa pháp lý (Legal Hold `API-220`, `API-222`): Đã khóa chặt trong `LegalHoldCard.tsx:123-135`. PM chỉ xem trạng thái Read-only (`ĐANG PHONG TỎA` / `BÌNH THƯỜNG`).
  - *(Lưu ý: Không tạo trang độc lập "Thực nghiệm AI", cụm API nhãn huấn luyện AI `API-105..108` bản chất đã tích hợp sẵn vào dropdown chọn phân loại khiếm khuyết khi PM thẩm định lỗi).*

---
---

# PHẦN 2: ROLE SUPERVISOR (SUP - GIÁM SÁT / CHỦ ĐẦU TƯ)

---

### MENU 1: TỔNG QUAN (`/sup/dashboard`)
* **Màn hình Spec:** `SUP-01`
* **Trạng thái:** ✅ **ĐÃ CÓ SẴN VÀ HOẠT ĐỘNG TỐT**
  - Hiển thị danh sách các gói sửa chữa đang chờ Supervisor duyệt (`Pending Approval`), tỷ lệ quá hạn xử lý và chỉ số KPI rủi ro suy thoái tuyến đường.

---

### MENU 2: DỰ ÁN BẢO HÀNH (`/sup/projects`)
* **Route:** `/sup/projects`, `/sup/projects/:id`, `/sup/projects/:id/alignment`
* **Màn hình Spec:** `SUP-04`, `SUP-05`
* **Trạng thái:** ✅ **ĐÃ CÓ ĐẦY ĐỦ QUYỀN**
  - Nút "Thêm mới dự án" (`API-050`): Đã mở cho Supervisor trên `/sup/projects`.
  - Nút "Xác nhận & Khóa tim tuyến" (`API-180`, `API-187`): Đã mở cho Supervisor trên `/sup/projects/:id/alignment`.
  - Nút "Đóng dự án bảo hành" (`API-110` / DA12): Đã mở cho Supervisor trên `/sup/projects/:id`.

---

### MENU 3: KHẢO SÁT & TIẾP NHẬN

#### 3.1. Tiếp nhận phản ánh (`/sup/cases`)
* **Màn hình Spec:** `SUP-02`, `SUP-03`
* **Trạng thái các mục:**
  - 🟡 **CẦN BỔ SUNG: Nút "Điều phối gán dự án (Triage - `API-024`)" cho Supervisor:**
    - Supervisor tiếp nhận danh sách các phản ánh người dân gửi về chưa được gán dự án (`Unassigned`), bấm nút Triage để gán vào Dự án bảo hành cụ thể.
  - 🟡 **CẦN CHUẨN HÓA: Chế độ Read-only với kết luận phản ánh (`SUP-03`):**
    - Ẩn hoàn toàn các nút Kết luận vụ việc, Gộp hoặc Tách phản ánh khỏi giao diện Supervisor (các tác vụ này do PM thực hiện).

#### 3.2. Giám sát Drone (`/sup/surveys`)
* **Màn hình Spec:** `SUP-06`
* **Trạng thái:** ✅ **ĐÃ ĐÚNG CHUẨN READ-ONLY**
  - Supervisor chỉ theo dõi tiến độ bay và kiểm tra chéo, không thao tác thẩm định tạo defect.

#### 3.3. Độ phủ tuyến Fast Track (`/sup/fast-track`)
* **Màn hình Spec:** `SUP-08`
* **Trạng thái các mục:**
  - 🟡 **CẦN BỔ SUNG: Nút "Xác nhận độ phủ tuyến Fast Track" (`API-176`):**
    - Cho phép Supervisor phê duyệt danh mục các đoạn tuyến được phép áp dụng sửa chữa khẩn cấp Fast Track (`POST /api/v1/projects/{projectId}/road-coverage`).

---

### MENU 4: THẨM DUYỆT & NGHIỆM THU

#### 4.1. Phê duyệt gói (`/sup/proposals`)
* **Màn hình Spec:** `SUP-07`
* **Trạng thái:** ✅ **ĐÃ CÓ ĐẦY ĐỦ**
  - Nút Phê duyệt hồ sơ (`API-142`) và Yêu cầu sửa đổi / Từ chối (`BatchRejection.tsx`).

#### 4.2. Nghiệm thu đóng đợt (`/sup/acceptance`)
* **Màn hình Spec:** `SUP-07`
* **Trạng thái:** ✅ **ĐÃ CÓ ĐẦY ĐỦ**
  - Nút *"Đóng đợt thi công / Ký số"* (`API-147`) dành riêng cho Supervisor khi 100% hạng mục đạt nghiệm thu.

#### 4.3. Nghiệm thu hiện trường (`/sup/field-tasks`)
* **Màn hình Spec:** `SUP-08`
* **Trạng thái:** ✅ **ĐÃ ĐÚNG CHUẨN READ-ONLY**
  - Chế độ kiểm tra chéo biên bản hiện trường dành cho Supervisor.

---

### MENU 5: BÁO CÁO & QUẢN TRỊ

#### 5.1. Nhân sự & Phân quyền (`/sup/personnel`)
* **Màn hình Spec:** `SUP-04`
* **Trạng thái các mục:**
  - 🟡 **CẦN HOÀN THIỆN: Quản trị lời mời nhân sự (`API-032`, `API-237..240`):**
    - Xem danh sách nhân sự thuộc dự án (`API-237`).
    - Nút **"Gửi lời mời nhân sự mới" (`API-032`)**: Supervisor nhập Email, Họ tên và chọn cấp vai trò (`PROJECT_MANAGER`, `OPERATOR`, `CREW`). Hệ thống tạo lời mời để người nhận kích hoạt tài khoản.
    - Khóa / Mở khóa tài khoản (`API-239`).

#### 5.2. Cấu hình hệ thống (`/sup/system-control`)
* **Màn hình Spec:** `SUP-10`
* **Trạng thái:** ✅ **ĐÃ CÓ ĐẦY ĐỦ**
  - Cơ chế Bật/Tắt Phong tỏa pháp lý (Legal Hold `API-220`, `API-222`).
  - Ràng buộc thời hạn lưu trữ số tối thiểu (Thời hạn bảo hành + 5 năm, chặn tự ý xóa dữ liệu trước 5 năm).

---

## 🎯 DANH SÁCH 7 HẠNG MỤC CẦN TRIỂN KHAI (CHỐT THEO THỐNG NHẤT)

1. **[AI Review]** Chuyển nút *"Điều phối gán dự án (Triage - `API-024`)"* sang cho Supervisor; Ẩn khỏi PM. Ẩn nút Kết luận/Gộp/Tách khỏi Supervisor.
2. **[Defect Verify]** Khung BBox trên ảnh chỉ dùng định vị; Ẩn số đo pixel BBox tự tính trên form, hiển thị nhãn chuẩn **`Chờ tổ đo đạc nộp dữ liệu (FIELD)`**. Kích thước vật lý thực tế chỉ được ghi nhận sau khi Tổ đo đạc đo bằng thước và nộp về (`API-096`).
3. **[Acceptance]** Chuẩn hóa enum Review Attempt (`API-158`) gửi lên server thành **`ACCEPT`** / **`SUPPLEMENT`** (thay vì `REWORK`).
4. **[Field Tasks]** Bổ sung nút **"Tái sử dụng ảnh phản ánh" (`API-084` Evidence Reuse)** cho PM trên màn hình nhiệm vụ hiện trường.
5. **[Fast Track]** Bổ sung hiển thị lý do cụ thể khi không đủ điều kiện Fast Track (`API-146`).
6. **[Fast Track]** Mở quyền chỉnh sửa dự thảo chính sách Fast Track cho PM (`PM-10`); Bổ sung nút *"Xác nhận độ phủ tuyến"* (`API-176`) cho Supervisor (`SUP-08`).
7. **[Personnel]** Hoàn thiện form gửi lời mời nhân sự mới (`API-032`) kèm cấp quyền (`PROJECT_MANAGER`, `OPERATOR`, `CREW`) cho Supervisor.
