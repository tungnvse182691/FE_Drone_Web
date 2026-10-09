# Worklog: CHUẨN HÓA PHÂN GIẢI XUNG ĐỘT NGOẠI TUYẾN BR-16 & ĐỒNG BỘ SPEC 29_9

- **Thời gian thực hiện:** 09/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Mục tiêu:** 
  1. Chuẩn hóa quy trình phân giải xung đột ngoại tuyến tại màn hình `FieldTasks.tsx` (`/pm/field-tasks`) bám sát 100% theo tài liệu đặc tả `docs/specs/29_9` (Mục 12 `09_Offline_App_Sync_Spec.md`, `02_Business_Rules.md` BR-16, `01_FRD_SRS.md`).
  2. Bóc tách và khắc phục triệt để các sai lệch nghiệp vụ: xóa bỏ các nút "Hợp nhất thủ công" và "Ghi đè" tùy tiện ở ca Đổi đội và ca Lệch chính sách Fast Track; phân định thẩm quyền 2 lớp bảo mật cho ca Cứu hộ thiết bị Q17.
  3. Cập nhật sửa đổi tài liệu kiểm thử `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md` loại bỏ hoàn toàn các nội dung không có trong spec.
  4. Chuyển đổi dữ liệu sang Mock API Service bất đồng bộ in-memory (`conflictService.ts`, `fieldTaskService.ts`), bổ sung thanh trượt so sánh ảnh kéo Split-screen và Photo Lightbox toàn màn hình.

---

## I. CÁC VẤN ĐỀ NGHIỆP VỤ ĐÃ ĐỐI CHIẾU & HIỆU CHỈNH

### 1. Ca Đổi đội thi công khi ngoại tuyến (`ASSIGNMENT_REASSIGNED` - D05/Q04)
* **Vấn đề trước đây:** Giao diện hiển thị nút "Hợp nhất thủ công" và tài liệu ghi "Ghi đè dữ liệu".
* **Đối chiếu Spec 29_9:**
  - Dòng 7 `09_Offline_App_Sync_Spec.md` và dòng 188 `01_FRD_SRS.md`: *"bảo toàn actor/source; xung đột đội cũ offline không giải quyết bằng ghi đè."*
  - Đội 01 trên Server mới nhận lệnh trên giấy tờ, chưa hề ra hiện trường; toàn bộ số đo 62mm, ảnh chụp có vạch thước, GPS và mã băm SHA-256 là do Tổ 02 tạo ra khi offline. Cấm tuyệt đối tạo bản ghi lai ghép (Merge) vì vi phạm tính toàn vẹn hồ sơ kiểm toán (Provenance).
* **Nghiệp vụ chuẩn đã chốt (2 lựa chọn duy nhất):**
  - **Công nhận kết quả Tổ 02 (Thu hồi Đội 01):** PM công nhận số đo 62mm của Tổ 02, thu hồi điều động Đội 01 để tránh lãng phí nhân lực đo lại. Trạng thái: `ĐÃ CÔNG NHẬN (TỔ 02)`.
  - **Từ chối kết quả Tổ 02 (Giữ Đội 01):** PM bác bỏ kết quả Tổ 02 (do hết thẩm quyền sau lệnh điều chuyển), giữ lệnh cho Đội 01 làm lại. Trạng thái: `TỪ CHỐI (GIỮ ĐỘI 01)` (Badge màu đỏ/rose).

### 2. Ca Lệch phiên bản chính sách Fast Track (`POLICY_VERSION_MISMATCH` - D06/BR-16)
* **Vấn đề trước đây:** Gán nút "Hợp nhất thủ công" và khi chọn giữ Server thì hiển thị badge màu xanh lá.
* **Đối chiếu Spec 29_9:**
  - Fast Track là quy định ngưỡng định lượng nhị phân (vết nứt 25mm so với ngưỡng cũ v1.8 < 30mm và ngưỡng mới v2.2 ≤ 20mm). Chỉ có 1 vết nứt và 1 người đo, không thể "hợp nhất chính sách".
  - Khi chọn giữ Server nghĩa là **bác bỏ đề xuất Fast Track của hiện trường**, không thể hiển thị màu xanh lá như thể đã chấp thuận.
* **Nghiệp vụ chuẩn đã chốt (2 lựa chọn duy nhất):**
  - **Đặc cách duyệt Fast Track:** PM dùng quyền Chỉ huy trưởng đặc cách áp dụng v1.8 cho phép sửa nhanh tại chỗ. Trạng thái: `ĐẶC CÁCH FAST TRACK`.
  - **Từ chối Fast Track (Chuyển duyệt đợt):** Bác bỏ Fast Track theo v2.2, chuyển khiếm khuyết vào hồ sơ đợt sửa (Approval Track). Trạng thái: `TỪ CHỐI FAST TRACK` (Badge màu đỏ/rose).

### 3. Ca Trùng lặp 2 thiết bị cùng đo một vị trí (`DUPLICATE_WORK_ATTEMPT` - DEDUP)
* **Đối chiếu Spec 29_9 (§12):**
  - Đây là ca **DUY NHẤT** trong hệ thống có thao tác đối soát giữa 2 nguồn dữ liệu (Máy phụ 45mm vs Máy chính 38mm).
* **Nghiệp vụ chuẩn:**
  - **Chọn bản Máy chính (38mm)** (chuẩn TCVN 8864).
  - **Chọn bản Máy phụ (45mm)** (ước lượng sơ bộ).
  - **Hợp nhất thủ công (Manual Merge):** Mở modal cho PM nhặt từng trường (số đo từ máy chính, ảnh từ máy phụ...). Trạng thái: `HỢP NHẤT THỦ CÔNG`.

### 4. Ca Cứu hộ thiết bị gặp sự cố (`DEVICE_RESCUE_PENDING` - Q17 / Quyết định 42A)
* **Vấn đề trước đây:** Hiển thị 3 nút chung cho PM, coi như PM tự duyệt cứu hộ.
* **Đối chiếu Spec 29_9 (§12):**
  - Sự cố thiết bị rơi vỡ màn hình, cơ sở dữ liệu SQLite được trích xuất vật lý qua ADB. Quy trình yêu cầu thẩm quyền 2 lớp bảo mật:
    + **PM:** Không được tự duyệt. Chỉ có nút **"Trình Giám sát duyệt cứu hộ (Q17)"** (`SUBMIT_RESCUE_TO_SUP`). Sau khi bấm, trạng thái chuyển thành: `ĐÃ TRÌNH GIÁM SÁT (CHỜ KÝ SỐ)`.
    + **Supervisor:** Duy nhất Giám sát có thẩm quyền **"Ký số phê duyệt cứu hộ"** (`AUTHORIZE_RESCUE`) hoặc **"Từ chối gói cứu hộ"** (`SUPERVISOR_REJECT_RESCUE`).

### 5. Ca Đóng băng hồ sơ đợt đã duyệt (`AGGREGATE_VERSION_CONFLICT` - BR-26 / Invariant #3)
* **Đối chiếu Điều bất biến #3 AGENTS.md & BR-26:**
  - Đợt sửa chữa PKG-2026-05 đã được Supervisor duyệt `APPROVED` (khóa cứng Read-only). Bằng chứng thi công gửi muộn không được phép ghi đè vào đợt cũ.
* **Nghiệp vụ chuẩn:**
  - **Tạo phụ lục đợt mới (BR-26):** Chuyển khối lượng nộp muộn sang đợt mới. Trạng thái: `TẠO PHỤ LỤC ĐỢT MỚI`.
  - **Từ chối số liệu nộp muộn:** Bác bỏ khối lượng nộp muộn sau khi đợt đã đóng băng. Trạng thái: `TỪ CHỐI NỘP MUỘN`.

---

## II. DANH SÁCH CÁC TỆP ĐÃ TẠO MỚI & CHỈNH SỬA

### 1. Tạo mới (4 files):
1. `src/api/services/conflictService.ts`: Mock API Service bất đồng bộ in-memory quản lý danh sách xung đột, phân giải đúng theo `conflict_type`, mô phỏng mã băm SHA-256 Audit trail và hỗ trợ `resetConflicts()`.
2. `src/api/services/fieldTaskService.ts`: Mock API Service bất đồng bộ in-memory quản lý danh sách nhiệm vụ đo đạc hiện trường, xác minh số liệu (`verifyMeasurement`).
3. `src/components/common/ImageComparisonSlider.tsx`: Component kéo thanh trượt so sánh 2 ảnh Split-screen (Side-by-side) chuẩn Material/Minimalism.
4. `src/components/common/PhotoLightboxModal.tsx`: Modal xem ảnh đối chứng toàn màn hình có hỗ trợ Zoom in/out, Xoay 90°, xem thông số EXIF GPS/thời gian.

### 2. Chỉnh sửa (7 files chính):
1. `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx`: Phân nhánh hiển thị các nút thao tác chuẩn xác theo từng loại `conflict_type` và vai trò người dùng (PM / Supervisor). Xóa bỏ nút Hợp nhất ở ca Đổi đội và ca Lệch chính sách.
2. `src/pages/(pm)/field-tasks/conflicts/ConflictQueueTable.tsx`: Sửa màu badge trạng thái từ chối sang đỏ/rose (`bg-rose-100 text-rose-800`), màu tím cho cứu hộ, màu hổ phách cho hợp nhất, xanh lá cho chấp thuận.
3. `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx`: Tùy biến tiêu đề và mô tả quyết định theo từng loại xung đột; chỉ hiển thị bảng chọn trường dữ liệu khi phân giải ca trùng lặp thiết bị.
4. `src/pages/(pm)/field-tasks/ConflictsTab.tsx`: Tách giao diện thành 2 sub-tab độc lập (`Hàng đợi xung đột` & `Bảng đối chiếu chi tiết`), xóa bỏ bố cục cuộn trang xuống cuối.
5. `src/pages/(pm)/FieldTasks.tsx`: Kết nối Mock API Service, quản lý state và nút "Khôi phục mẫu".
6. `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`: Cập nhật lại Bước PM-12 (Phần B) loại bỏ toàn bộ các mô tả "Ghi đè" và "Hợp nhất tùy tiện", đồng bộ 100% với spec 29_9.
7. `src/data/mockData.ts` & `src/types/domain.ts`: Đồng bộ kiểu dữ liệu `ResolutionStatus` và mock data.

---

## III. KẾT QUẢ XÁC NHẬN & GIT COMMITS

- **Commit SHA:** `93b4e4c`
- **Thông điệp commit:** `feat(pm/field-tasks): chuan hoa quy trinh phan giai xung dot BR-16 va cap nhat spec 29_9`
- **Nhánh:** `hoang` (đã push thành công lên `origin/hoang`)
- **Trạng thái Build & Typecheck:** Sạch lỗi TypeScript, Vite dev server chạy mượt mà.
