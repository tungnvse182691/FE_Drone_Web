# Worklog: HOÀN THIỆN QUẢN LÝ DANH MỤC & ĐÓNG DỰ ÁN HẾT HẠN BẢO HÀNH (SUP-07 / BC01, RPT-01, DA12, QT13, BC10)

- **Thời gian thực hiện:** 13/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 2 (`04_Use_Cases.md` - DA12), `02_Business_Rules.md` (BR-45), `operation_catalog.md` (L28: `POST /projects/{projectId}/close`).
  - 10 Điều bất biến (`AGENTS.md`): Điều 1 (Zero Money / Không tính toán giá tiền), Điều 2 (Chỉ Supervisor mới có quyền thẩm duyệt và đóng dự án bảo hành), Điều 10 (Màu vàng đồng `#C9A227` cho điểm nhấn thương hiệu Hoàng Hải).
  - Quy chuẩn lưu trữ: Lưu trữ số tối thiểu thời hạn bảo hành + 5 năm (QT13, BR-45) và phục vụ tra cứu sau đóng (BC10).

---

## I. MỤC TIÊU VÀ BỐI CẢNH NGHIỆP VỤ

Trong vòng đời dự án bảo hành & sửa chữa hạ tầng đường bộ của nhà thầu Hoàng Hải:
1. **Theo dõi danh mục & đếm ngược hạn bảo hành (BC01, RPT-01):** Giám sát viên và Chủ đầu tư cần theo dõi danh mục công trình đang vận hành, tỷ lệ thời gian bảo hành đã qua (%), số ngày bảo hành còn lại, và nhận cảnh báo sớm đối với các công trình sắp hết hạn (<30 ngày).
2. **Đóng dự án khi hết hạn bảo hành (DA12):** Khi dự án đã kết thúc thời gian cam kết và 100% hạng mục sửa chữa đã được nghiệm thu đạt chuẩn (`PASSED`), Giám sát trưởng thực hiện thủ tục đóng dự án, chuyển trạng thái sang `CLOSED`, đóng băng chỉ đọc toàn bộ hồ sơ kỹ thuật và chuyển vào kho lưu trữ số tối thiểu 5 năm (QT13).
3. **Phân biệt rành mạch giữa "Đóng dự án (DA12)" và "Phong tỏa pháp lý (Legal Hold - QT13)":**
   - *Đóng dự án (DA12):* Kết thúc vòng đời vận hành bảo hành thông thường, giải tỏa nghĩa vụ thi công và đưa vào lưu trữ 5 năm.
   - *Phong tỏa pháp lý (QT14):* Biện pháp khẩn cấp niêm phong hồ sơ chống xóa khi có đoàn thanh tra, kiểm toán nhà nước.

---

## II. CHI TIẾT CÁC THAY ĐỔI & CẢI TIẾN ĐÃ THỰC HIỆN

### 1. Nâng cấp Modal Đóng Dự Án Chuẩn Quy Tắc Nghiêm Ngặt (`CloseProjectModal.tsx`)
- **Khóa cứng (Hard Block) khi vi phạm BR-45:**
  - Nếu công trình vẫn còn khiếm khuyết đang mở (`open_defects > 0`), modal hiển thị thẻ cảnh báo lỗi màu đỏ nổi bật: *"VI PHẠM ĐIỀU KIỆN ĐÓNG BẢO HÀNH (BR-45): Công trình vẫn còn X điểm khiếm khuyết chưa hoàn thành sửa chữa hoặc chưa qua nghiệm thu đạt chuẩn (PASSED)."*
  - Ô nhập lý do bị vô hiệu hóa (`disabled`) và nút xác nhận đóng bị khóa hoàn toàn.
- **Cảnh báo đóng dự án trước hạn (Early Close Warning):**
  - Nếu dự án chưa trôi qua 100% thời gian bảo hành (`days_remaining > 0`), hiển thị cảnh báo màu vàng và bắt buộc người dùng tích chọn checkbox xác nhận: `[x] Tôi xác nhận có văn bản đồng thuận kết thúc bảo hành trước hạn`.
- **Cam kết hành động không thể đảo ngược (Irreversible Action):**
  - Hiển thị thông báo quy chế đóng băng vĩnh viễn (hồ sơ khóa chỉ đọc, lưu trữ tối thiểu 5 năm, ngừng tạo khảo sát và đợt sửa).
  - Bắt buộc người dùng tích chọn checkbox xác nhận: `[x] Tôi hiểu rằng dự án đã đóng sẽ KHÔNG THỂ mở lại`.
- **Kiểm soát nội dung lý do (Reason Validation):**
  - Bắt buộc nhập biên bản nghiệm thu hoặc quyết định giải tỏa bảo lãnh tối thiểu 10 ký tự mới cho phép hoàn tất thủ tục đóng dự án.
- **Trải nghiệm Minimalism & Material Symbols:**
  - Bổ sung `htmlFor` và `id` cho các checkbox/label để tương tác nhạy, icon Material Symbols đồng bộ toàn hệ thống.

### 2. Chuẩn hóa Mock API Service Trong Bộ Nhớ (`projectService.ts`)
- Loại bỏ hoàn toàn việc phụ thuộc vào `localStorage`. Sử dụng Store in-memory bất đồng bộ giả lập độ trễ mạng HTTP 300ms.
- Triển khai endpoint `closeProject(projectId, payload)` theo đúng hợp đồng `operation_catalog.md` L28:
  - Kiểm tra tồn tại dự án (ném lỗi `404` nếu không tìm thấy).
  - Kiểm tra trạng thái đã đóng (ném lỗi `409 Conflict` nếu dự án đã ở trạng thái `CLOSED`).
  - Kiểm tra điều kiện hư hỏng (ném lỗi `422 Unprocessable Entity` nếu `open_defects > 0`).
  - Tự động tính toán hạn lưu trữ: `retention_until = ngày đóng + 5 năm (QT13, BR-45)`.
  - Cập nhật `status = 'CLOSED'`, `warranty_passed_percent = 100`, `days_remaining = 0`.
  - Bắn sự kiện reactive `roadguard_state_change` để đồng bộ UI trên toàn bộ ứng dụng.

### 3. Nâng cấp Bộ Lọc Tab & Thẻ KPI Danh Mục Dự Án (`ProjectList.tsx`, `ProjectListFilters.tsx`, `ProjectListKpis.tsx`)
- Thêm Tab thứ 5: **"Đã đóng hồ sơ" (`CLOSED`)** hiển thị số lượng dự án đã đóng lưu trữ.
- Thêm Thẻ KPI thứ 5: **"Đã đóng hồ sơ (QT13)"** trong bảng tổng quan đầu trang.
- Dự án ở trạng thái `CLOSED` hiển thị nút hành động màu than chì: **`Tra cứu hồ sơ lưu trữ (BC10)`**, vô hiệu hóa các nút tạo mới đợt sửa chữa hay chỉnh sửa kỹ thuật.

### 4. Kiểm Thử Trực Tiếp Trên Web Bằng Browser Agent
- Đã đăng nhập vai trò Giám sát (`Kỹ sư Nguyễn Văn An - SUPERVISOR`).
- Đã kiểm tra mở modal đóng dự án với dự án đủ điều kiện (`open_defects = 0`).
- Đã kiểm tra đầy đủ các trạng thái cảnh báo, checkbox cam kết và nhập lý do nghiệm thu đạt chuẩn TCVN 8819:2011.
- Cập nhật checklist kiểm thử trong `DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`: Đánh dấu `[x] Đạt` cho bước **SUP-07**.
