# Worklog: HOÀN THIỆN DASHBOARD GIÁM SÁT (SUP-00), THẨM DUYỆT ĐỢT SỬA & TINH GỌN BẢNG DỮ LIỆU

- **Thời gian thực hiện:** 13/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 11 ([06_Report_Analytics_Requirements.md](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/specs/29_9/06_Report_Analytics_Requirements.md) - RPT-01, RPT-06, RPT-07, RPT-10), [04_Use_Cases.md](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/specs/29_9/04_Use_Cases.md) (BC01, BC03, BC04, SC04, SC05), [02_Business_Rules.md](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/specs/29_9/02_Business_Rules.md) (BR-01, BR-02, BR-45).
  - 10 Điều bất biến (`AGENTS.md`): Điều 1 (Zero Money / Không tính toán giá tiền), Điều 2 (Chỉ Supervisor mới có quyền thẩm duyệt và phê duyệt), Điều 10 (Màu vàng đồng thương hiệu `#C9A227`).

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

Theo kế hoạch nghiệm thu giao diện Web Dashboard dành cho Giám sát trưởng (Supervisor / Chủ đầu tư):
1. **Kiểm thử và hoàn thiện bước SUP-00 (Dashboard điều hành & Danh mục bảo hành):** Đảm bảo hiển thị đúng các chỉ số RPT-01, RPT-06, RPT-10, tương tác bản đồ GIS MapLibre mượt mà và nút điều hướng chính xác.
2. **Khắc phục lỗi hiển thị bản đồ GIS:** Cụm điều khiển bị thừa nút zoom in/out và bị icon bản quyền (`i`) che khuất góc dưới bên phải.
3. **Tinh gọn bảng danh sách hạng mục kỹ thuật trong gói đề xuất (`/sup/proposals/:id`):** Khắc phục triệt để tình trạng bảng bị tràn ngang (phải cuộn sang phải mới thấy cột phân công đội thi công). Bổ sung cơ chế hover Tooltip trực quan giúp xem đầy đủ 100% nội dung không bị mất chữ.
4. **Chuẩn hóa nhãn nút bấm:** Loại bỏ các mã kỹ thuật (WF-07, WF-08...) trên các nút bấm giao diện người dùng, thay bằng nhãn nghiệp vụ thuần túy, thân thiện.

---

## II. CHI TIẾT CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1. Tinh gọn & Chuẩn hóa Bảng Hạng mục Kỹ thuật trong Gói đề xuất (`ApprovalItemsTable.tsx`, `ItemsTableRow.tsx`)
- **Loại bỏ hoàn toàn thanh cuộn ngang:**
  - Bỏ `min-w-[1050px]` và chuyển bảng sang chế độ tự co giãn `table-fixed` vừa khít 100% khung nhìn.
  - Phân bổ lại tỷ lệ độ rộng 8 cột tối ưu:
    + Cột 1 (*Mã & Hư hỏng*): 14%
    + Cột 2 (*Vị trí & Lý trình*): 11%
    + Cột 3 (*Hư hại & Đo đạc*): 16%
    + Cột 4 (*Phương án kỹ thuật*): 18%
    + Cột 5 (*Khối lượng*): 9%
    + Cột 6 (*Trạng thái duyệt*): 10%
    + Cột 7 (*Thao tác Thẩm định*): 10%
    + Cột 8 (*Đội thi công*): 12%
- **Bổ sung hiệu ứng Hover & Tooltip toàn diện (`cursor-help`):**
  - Mọi ô văn bản có chữ bị rút gọn đều được bọc component `<Tooltip>` tự động tính toán viewport và thuộc tính `title` native:
    + Rê chuột vào Cột 1: Hiển thị đầy đủ Kỹ sư UAV (`Trần Hùng`) và dòng Drone (`Matrice 350 RTK`).
    + Rê chuột vào Cột 2: Hiển thị đầy đủ lý trình và vị trí làn đường.
    + Rê chuột vào Cột 3: Hiển thị thẻ thông số kích thước hư hại chi tiết ($m^2$, chiều sâu, bề rộng).
    + Rê chuột vào Cột 4: Hiển thị trọn vẹn tên giải pháp kỹ thuật, tiêu chuẩn TCVN 8819 và ghi chú của Giám sát.
    + Rê chuột vào Cột 8: Tên đội thi công cho phép quấn 2 dòng tự nhiên (`line-clamp-2`), đồng thời rê chuột vào bung Tooltip hiển thị đầy đủ tên đội.

### 2. Sửa lỗi Bản đồ GIS & Nút điều khiển Dashboard (`DashboardRiskMap.tsx`, `useSupDashboardState.ts`)
- **Xóa nút Zoom thừa:** Bỏ 2 nút `+` và `-` thừa ở góc dưới bên phải viewport vì góc trên bên phải đã có bộ `NavigationControl` tiêu chuẩn của MapLibre.
- **Khắc phục icon chữ `i` che khuất:** Cấu hình `attributionControl: false` trong tùy chọn bản đồ và gắn `AttributionControl` sang góc dưới bên trái (`bottom-left`). Góc dưới bên phải hiện tại chỉ còn 2 nút: *Chuyển lớp vệ tinh/vector* và *Đặt lại góc nhìn toàn tuyến*, hoàn toàn thông thoáng.
- **Điều hướng động theo `proposal_id`:** Trong [DashboardRiskTable.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/dashboard/DashboardRiskTable.tsx), sửa nút bấm trên mỗi dòng điều hướng đúng theo mã gói tương ứng (`/sup/proposals/${item.proposal_id}`), không còn bị gắn tĩnh cố định.
- **Bổ sung nút liên kết Nhật ký kiểm toán:** Thêm nút `Xem toàn bộ nhật ký kiểm toán (RPT-10) →` ở chân thẻ Hoạt động gần đây dẫn trực tiếp sang `/sup/audit-trail`.

### 3. Chuẩn hóa Nhãn Nút bấm & Bỏ mã quy trình kỹ thuật
- [DashboardRiskTable.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/dashboard/DashboardRiskTable.tsx): Đổi nút `Duyệt WF-07` thành **`Thẩm duyệt`**.
- [DashboardHeader.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/dashboard/DashboardHeader.tsx): Đổi `Thẩm duyệt đợt sửa (WF-07)` thành **`Thẩm duyệt đợt sửa`**.
- [ApprovalDetailHeader.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx): Đổi `Quy trình kỹ thuật: WF-07 (Thẩm duyệt & Điều phối)` thành **`Quy trình: Thẩm duyệt & Điều phối`** và badge `WF-07` thành **`Hồ sơ thẩm định`**.

### 4. Cập nhật Tài liệu Kịch bản Kiểm thử ([DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md))
- Đồng bộ chi tiết kịch bản bước **SUP-00** khớp 100% với giao diện thực tế và cấu trúc RPT-01 / RPT-06 / RPT-07 / RPT-10 của spec 29_9.
- Bổ sung 4 bước còn thiếu (SUP-00, SUP-09, SUP-10, SUP-11) và hoàn thiện Bảng 8.3 với đủ 29 bước (17 PM + 12 SUP) phủ kín 100% tất cả menu của hệ thống.

---

## III. KẾT QUẢ KIỂM TRA & SẴN SÀNG
- Ứng dụng chạy mượt mà trên Vite Dev Server (port 3000), không có lỗi TypeScript hay Lint.
- Màn hình `/sup/dashboard` và `/sup/proposals/:id` hiển thị sắc nét, chuẩn nhận diện thương hiệu Hoàng Hải và đáp ứng nguyên tắc Zero Money.
