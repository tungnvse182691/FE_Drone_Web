# Worklog: CHUẨN HÓA BƯỚC SUP-10 — NGHIỆM THU HIỆN TRƯỜNG & GIÁM SÁT TUYẾN CẤP BÁCH (FR-17, FR-18, BR-16, BR-21, BR-25, BR-46, Q17, RPT-04)

- **Thời gian thực hiện:** 13/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 2 (`01_FRD_SRS.md` - FR-17, FR-18, FR-22), `02_Business_Rules.md` (BR-04, BR-08, BR-13, BR-16, BR-21, BR-25, BR-46), `04_Use_Cases.md` (SC01, SC04, SC10, HT10, HT11, HT12), `06_Report_Analytics_Requirements.md` (RPT-04), `09_Offline_App_Sync_Spec.md` (Q04, Q05, Q17 / Quyết định 42A).
  - 10 Điều bất biến (`AGENTS.md`): Điều 1 (Zero Money / Không tính toán giá tiền), Điều 2 (Supervisor có quyền phê duyệt/từ chối/nghiệm thu; PM không có quyền duyệt thay Supervisor), Điều 10 (Màu vàng đồng `#C9A227` làm điểm nhấn thương hiệu Hoàng Hải, phong cách Minimalism, Material Symbols).

---

## I. MỤC TIÊU VÀ BỐI CẢNH NGHIỆP VỤ

Trong quá trình rà soát và kiểm thử quy trình của Giám sát trưởng (Supervisor / Chủ đầu tư) tại **BƯỚC SUP-10**, hệ thống đã giải quyết các vấn đề nghiệp vụ cốt lõi sau:

1. **Chuẩn hóa danh xưng vai trò & Menu điều hướng:** 
   - Supervisor là vai trò đại diện Ban QLDA/Chủ đầu tư đi nghiệm thu và kiểm tra chéo, không phải là người đi thực hiện nhiệm vụ như đội thi công. Tên menu hiển thị cũ *"Nhiệm vụ hiện trường"* gây hiểu nhầm về quyền hạn nên được đổi chuẩn hóa thành **"Nghiệm thu hiện trường"** (`/sup/field-tasks`).
2. **Làm rõ thẩm quyền của Supervisor đối với Xung đột ngoại tuyến (Sync Conflicts):**
   - Đa số các xung đột ngoại tuyến thường gặp (đổi đội thi công, lệch phiên bản chính sách, trùng lặp máy đo, nộp muộn vào đợt đã đóng băng) là nghiệp vụ nội bộ của Chỉ huy trưởng (PM). Supervisor chỉ có quyền theo dõi (Read-only / Audit).
   - **Duy nhất trường hợp Cứu hộ thiết bị gặp sự cố (`DEVICE_RESCUE_PENDING` - Q17 / 42A):** Khi máy tính bảng của kỹ sư ngoài công trường bị rơi vỡ màn hình nát, không thể sync qua Internet mà phải cắm cáp USB vật lý để trích xuất file SQLite cứu dữ liệu. Đây là hình thức can thiệp vật lý ngoại lệ, nên **bắt buộc phải có Supervisor thẩm định và bấm xác nhận** thì gói dữ liệu cứu hộ này mới có tính pháp lý để hợp thức hóa vào hệ thống trung tâm.
3. **Chuẩn hóa nút thao tác xác nhận:**
   - Đổi nút *"Ký số phê duyệt cứu hộ"* thành **"Xác nhận dữ liệu cứu hộ"** (và PM là *"Trình Giám sát xác nhận cứu hộ"*), trạng thái chuyển sang **"ĐÃ XÁC NHẬN CỨU HỘ"**.
4. **Bổ sung quyền yêu cầu đo lại / bổ sung ảnh cho Chỉ huy trưởng (PM):**
   - Khi kỹ sư nộp số liệu ngoại tuyến hoặc khi thẩm định gói cứu hộ, nếu PM thấy ảnh mờ hoặc nghi ngờ số đo lệch chuẩn, PM phải có nút **"Yêu cầu đo lại / Bổ sung ảnh"** (`REQUEST_ADDITIONAL_EVIDENCE` - Q05, BR-17) để phát lệnh cho app Mobile của hiện trường chụp lại hoặc đo kiểm tra lại.
5. **Minh bạch hóa bản chất 3 bức ảnh thực địa:**
   - Cột Server: **Ảnh biên bản thiết bị rơi vỡ màn hình** có mộc xác nhận sự cố của PM.
   - Cột Mobile (trích xuất từ máy vỡ): **Ảnh trắc địa sụt lún chênh cốt $48mm$** (đo bằng máy laser Leica Disto D2) và **Ảnh kiểm tra khe co giãn mố cầu**.
6. **Phân định rạch ròi 3 luồng xử lý:**
   - **Fast Track (FR-18, BR-08):** Hư hỏng nhẹ ($\le 0.5m^2, \le 5cm$), PM tự giao đo và sửa trong chuyến, PM tự nghiệm thu nội bộ và gửi báo cáo RPT-04 sang Supervisor theo dõi.
   - **Approval Track (SC01, SC04, BR-21):** Hư hỏng nặng vượt ngưỡng chính sách, **bị khóa cứng khỏi Fast Track**, bắt buộc PM gom vào Đợt sửa chữa trình Supervisor phê duyệt trước khi thi công.
   - **Emergency (BR-46, SC10):** Sự cố nguy hiểm đe dọa an toàn giao thông nghiêm trọng (sụt trượt, hố sụt sâu nguy hiểm), PM được kích hoạt xử lý an toàn tạm thời 24/7 (rào chắn 4h, lấp vá tạm thông xe) và hệ thống phát cảnh báo tức thì tới Supervisor.

---

## II. CHI TIẾT CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1. Cập Nhật Menu & Giao Diện
- **Sidebar ([Sidebar.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/components/layout/Sidebar.tsx)):**
  - Đổi mục menu Supervisor từ *"Nhiệm vụ hiện trường"* $\rightarrow$ **"Nghiệm thu hiện trường"** (`/sup/field-tasks`).
- **Header & Breadcrumb ([FieldTasksHeader.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/field-tasks/FieldTasksHeader.tsx)):**
  - Khi tài khoản đăng nhập là Supervisor, tiêu đề trang tự động hiển thị **"Nghiệm Thu Hiện Trường"** và breadcrumb hiển thị tương ứng, kèm pill nhận diện vai trò *"Giám sát (Duyệt cứu hộ)"*.

### 2. Chuẩn Hóa Cụm Thao Tác Phân Giải Xung Đột
- **Component ([ConflictResolutionActions.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx) & [ConflictResolveModal.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/field-tasks/ConflictResolveModal.tsx)):**
  - Đổi nút bấm của Supervisor thành **"Xác nhận dữ liệu cứu hộ"** (màu tím) và **"Từ chối gói cứu hộ"** (màu đỏ).
  - Đổi nút bấm của PM thành **"Trình Giám sát xác nhận cứu hộ (Q17)"**.
  - Bổ sung nút **"Yêu cầu đo lại / Bổ sung ảnh"** cho PM khi cần hiện trường nộp bổ sung bằng chứng.
- **Service ([conflictService.ts](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/conflictService.ts)):**
  - Hỗ trợ quyết định `'REQUEST_ADDITIONAL_EVIDENCE'` cập nhật trạng thái `YÊU CẦU BỔ SUNG BẰNG CHỨNG`.
  - Cập nhật quyết định `'AUTHORIZE_RESCUE'` sang trạng thái `ĐÃ XÁC NHẬN CỨU HỘ`.
- **Cập nhật Types ([ConflictIncomingStateCard.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/field-tasks/conflicts/ConflictIncomingStateCard.tsx), [ConflictsTab.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/field-tasks/ConflictsTab.tsx), [FieldTasks.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/FieldTasks.tsx)):**
  - Đồng bộ union type của `handleOpenResolve` và `pendingDecision`.

### 3. Cập Nhật Danh Mục Kiểm Thử ([DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md))
- Cập nhật tiêu đề, mô tả và đường dẫn URL của **BƯỚC SUP-10** (Menu: *Nghiệm thu hiện trường*).
- Đánh dấu **`[x] Đạt`** cho toàn bộ các thao tác kiểm tra của BƯỚC SUP-10 và bảng tổng kết cuối tài liệu.

---

## III. DANH MỤC CÁC FILE ĐÃ SỬA ĐỔI

| STT | Đường dẫn file | Mô tả thay đổi |
|:---:|---|---|
| 1 | `src/components/layout/Sidebar.tsx` | Đổi menu của Supervisor thành "Nghiệm thu hiện trường" (`/sup/field-tasks`) |
| 2 | `src/pages/(pm)/field-tasks/FieldTasksHeader.tsx` | Đồng bộ tiêu đề và breadcrumb "Nghiệm Thu Hiện Trường" theo vai trò Supervisor |
| 3 | `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx` | Đổi text nút "Xác nhận dữ liệu cứu hộ", bổ sung nút "Yêu cầu đo lại / Bổ sung ảnh" |
| 4 | `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx` | Cập nhật nhãn quyết định phân giải và hỗ trợ yêu cầu bổ sung bằng chứng |
| 5 | `src/api/services/conflictService.ts` | Bổ sung quyết định `REQUEST_ADDITIONAL_EVIDENCE` và chuẩn hóa nhãn cứu hộ |
| 6 | `src/pages/(pm)/FieldTasks.tsx` | Đồng bộ kiểu `pendingDecision` và `handleOpenResolve` |
| 7 | `src/pages/(pm)/field-tasks/ConflictsTab.tsx` | Cập nhật kiểu `handleOpenResolve` trong `ConflictsTabProps` |
| 8 | `src/pages/(pm)/field-tasks/conflicts/ConflictIncomingStateCard.tsx` | Cập nhật kiểu `handleOpenResolve` trong `ConflictIncomingStateCardProps` |
| 9 | `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md` | Chuẩn hóa BƯỚC SUP-10 và đánh dấu [x] Đạt |

---

## IV. KẾT QUẢ KIỂM THỬ THỰC TẾ

1. **TypeScript Build:** Lệnh `npx tsc --noEmit` hoàn tất sạch sẽ với **0 lỗi** (Exit code 0).
2. **Kiểm thử Web bằng Browser Agent:**
   - Đăng nhập tài khoản Supervisor (`suphoang@gmail.com`).
   - Vào menu *"Nghiệm thu hiện trường"* $\rightarrow$ header hiển thị đúng *"Nghiệm Thu Hiện Trường"*.
   - Mở ca cứu hộ `#CONF-2026-084`, soi ảnh Server (vỡ màn hình) và ảnh Mobile (trắc địa $48mm$).
   - Bấm nút *"Xác nhận dữ liệu cứu hộ"*, nhập lý do và lưu thành công $\rightarrow$ ca chuyển sang `ĐÃ XÁC NHẬN CỨU HỘ`.
   - Vào `/sup/fast-track`, kiểm tra phân quyền Read-only của Supervisor và cảnh báo lỗi vi phạm vượt ngưỡng.
   - Toàn bộ phiên kiểm thử đã ghi lại thành video: `test_sup10_field_tasks.webp`.
