# WORKLOG: CHUẨN HÓA CẤU TRÚC MENU, PHÂN QUYỀN VÀ NGHIỆP VỤ THEO SPECS 17_10

- **Thời gian thực hiện:** 2026-10-22
- **Người thực hiện:** Hoàng (Solo Frontend Web)
- **Nhánh:** `hoang`
- **Mục tiêu:** 
  1. Chuẩn hóa cấu trúc Menu Sidebar của PM theo luồng drill-down thực tế, loại bỏ các menu hardcode deep-link.
  2. Bổ sung 2 nghiệp vụ quan trọng của PM theo `API-110`: **Liên kết tái phát (`recurrences`)** tại Thẩm định AI và **Khai báo hoàn thành thi công (`construction-declarations`)** tại Nghiệm thu.
  3. Cập nhật trạng thái nhận biết trực quan tức thì ngoài danh sách đợt bay sau khi PM thẩm định candidate.
  4. Tách nhỏ các component lớn tránh nhồi nhét code (Clean Architecture).
  5. Cập nhật danh sách rà soát chức năng chuẩn hóa theo từng menu của từng vai trò (PM và SUP riêng biệt).

---

## 1. CÁC THAY ĐỔI CHI TIẾT THEO TỪNG PHÂN HỆ

### 1.1. Sidebar & Menu điều hướng (`Sidebar.tsx`)
- **Loại bỏ các deep-link tĩnh trên Sidebar của PM:**
  - Bỏ mục `Tuyến & Phân đoạn` riêng lẻ: Quản lý tuyến GIS MapLibre được đưa vào đúng vị trí bên trong từng dự án cụ thể (`/pm/projects/:id/alignment`).
  - Bỏ mục con `Khung hình thẩm định AI` (`/pm/surveys/srv-01/review`) và `Thẩm định khung nhận diện` (`/pm/defects/det-03/verify-a`) trên Sidebar. Việc thẩm định được thực hiện tự nhiên bằng cách bấm nút "Thẩm định chi tiết" từ thẻ phát hiện AI trong đợt bay.
- **Phân quyền nút Tạo dự án (`ProjectListHeader.tsx`):**
  - Ẩn nút "Tạo dự án mới" đối với PM (việc khởi tạo dự án thuộc quyền Supervisor `SUP-04`).

### 1.2. Thẩm định AI & Nghiệp vụ Liên kết tái phát (`recurrences` - API-110)
- **Giao diện thẩm định chi tiết (`DefectDetailVerify.tsx`, `DefectVerifyHeader.tsx`, `DefectVerifyForm.tsx`):**
  - Bổ sung modal và nút chọn khiếm khuyết cũ để liên kết chuỗi lịch sử hư hỏng lặp lại (`API-110` `recurrences`).
  - Hiển thị badge nhận biết `TÁI PHÁT ({priorId}) • API-110` trên header và banner màu hổ phách cảnh báo nguy cơ nứt lún lặp lại.
  - Tự động điền biên bản audit note vào trường ghi chú của PM.
- **Cập nhật trạng thái danh sách phát hiện bên ngoài (`MissionTriageList.tsx`, `types.ts`, `surveyService.ts`):**
  - Đồng bộ trạng thái ngay lập tức khi PM bấm liên kết tái phát hoặc xác nhận.
  - Thẻ bên ngoài lập tức đổi viền vàng đồng thương hiệu `#C9A227`, gắn badge `TÁI PHÁT (DEF-xxxx)`, ghi rõ căn cứ `API-110` và đổi nút sang "Xem lại thẩm định (Đã thẩm định)".

### 1.3. Nghiệm thu & Khai báo hoàn thành thi công (`construction-declarations` - API-110)
- **Màn hình Nghiệm thu (`EvidenceCloseoutDetail.tsx`, `ActionButtons.tsx`):**
  - Tạo component độc lập `DeclareConstructionModal.tsx` để PM nộp biên bản/ảnh hoàn công hiện trường của Repair Crew.
  - Sau khi PM khai báo hoàn thành, hồ sơ chuyển sang trạng thái chờ Supervisor ký số nghiệm thu đóng đợt (`API-147`).
  - Chuẩn hóa payload đánh giá review attempt chỉ gửi `ACCEPT` hoặc `SUPPLEMENT` (cấm gửi chuỗi `REWORK`).

### 1.4. Tách nhỏ Component & Dọn dẹp cấu trúc (Clean Code)
- **Trang Tổng quan dự án (`ProjectOverview.tsx`):**
  - Tách thành các sub-components độc lập trong thư mục `src/pages/(pm)/project-overview/`:
    - `ProjectLifecycleModal.tsx`: Modal hiển thị vòng đời dự án 4 giai đoạn.
    - `ProjectMapPreviewCard.tsx`: Thẻ xem trước bản đồ tuyến.
    - `ProjectSegmentsTable.tsx`: Bảng danh sách phân đoạn kỹ thuật.
    - `ProjectPersonnelCard.tsx`: Thẻ danh sách nhân sự tham gia dự án.
    - `ProjectTimelineStepper.tsx`: Stepper tiến trình vòng đời Read-only cho PM.

### 1.5. Cập nhật Tài liệu rà soát nghiệp vụ (`DANH_SACH_CHUC_NANG_CAN_SUA_THEO_SPECS_17_10.md`)
- Tái cấu trúc tài liệu: Lược bỏ các nội dung đã hoàn thành hoặc lý thuyết chung.
- Phân tách rõ ràng thành 2 phần độc lập:
  - **Phần 1: Role Project Manager (PM)** — Lần lượt từ Menu 1 đến Menu 5 + Header.
  - **Phần 2: Role Supervisor (SUP)** — Lần lượt từ Menu 1 đến Menu 5.
- Mỗi menu chỉ ghi rõ: `[CHƯA LÀM]` hoặc `[ĐANG BỊ SAI - CẦN SỬA]`, kèm mã API và căn cứ specs tương ứng.

---

## 2. KẾT QUẢ KIỂM TRA

1. **TypeScript & Build:**
   - Lệnh: `npm run build` (`tsc -b && vite build`)
   - Kết quả: **Thành công 100%, 0 lỗi type/linter, build bundle 7.03s**.
2. **Kiểm tra giao diện & Flow nghiệp vụ:**
   - Sidebar PM hiển thị gọn gàng, không còn menu mồ côi hay deep-link cứng.
   - Thao tác liên kết tái phát cập nhật ngay lập tức thẻ ngoài danh sách phát hiện AI đợt bay.
   - Các modal mở mượt mà, không xung đột CSS hay z-index.
