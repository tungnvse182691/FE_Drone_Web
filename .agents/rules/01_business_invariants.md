# Rule 01: Business Invariants (Quy Tắc Nghiệp Vụ Bất Biến)

Tất cả các thành phần UI/Logic trong dự án RoadGuard Web Dashboard phải tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Tính toán chi phí dự toán (Cost Calculation)
- Trường `estimated_total_cost` của một Đợt Sửa Chữa (`RepairBatch`) luôn là giá trị phái sinh (derived value) được tính tự động bằng `SUM(unit_price * quantity)` của tất cả `RepairItem`.
- **TUYỆT ĐỐI KHÔNG** tạo input field cho phép người dùng nhập trực tiếp tổng chi phí đợt sửa chữa.
- Khi thêm, bớt hoặc chỉnh sửa số lượng hạng mục, tổng tiền phải tự động cập nhật ngay trên giao diện.

## 2. Kiểm soát thẩm quyền (Role Authority)
- **Chỉ SUPERVISOR** mới có thẩm quyền và nhìn thấy các nút hành động:
  - Phê duyệt đợt sửa chữa (`Approve`)
  - Yêu cầu sửa đổi / Từ chối (`Revision Required` / `Reject`)
  - Nghiệm thu hiện trường (`Accept/Reject Inspection`)
  - Ký số đóng đợt sửa chữa (`Sign-off Closure`)
- **Chỉ PROJECT_MANAGER (PM)** mới có thẩm quyền và nhìn thấy các nút hành động:
  - Tạo yêu cầu khảo sát drone (`Create Survey`)
  - Xác minh nhãn/độ nghiêm trọng hư hỏng do AI phát hiện (`Verify Defect`)
  - Gom đợt sửa chữa (`Create Repair Batch`)
  - Trình phê duyệt (`Submit for Approval`)
  - Phân công đội thi công (`Assign Crew`)
  - Xác nhận hoàn thành công việc sau thi công (`Confirm Work Order`)

## 3. Khóa dữ liệu bất biến (Immutability after Approval)
- Một khi đợt sửa chữa chuyển sang trạng thái `APPROVED`, toàn bộ danh sách hư hỏng gán trong đợt và bảng dự toán chi phí trở thành **Read-only**.
- Không cho phép thao tác: Thêm lỗi mới vào đợt, xóa lỗi khỏi đợt, sửa đơn giá hoặc đổi số lượng.

## 4. Máy trạng thái đợt sửa chữa (State Machine)
- `DRAFT` $\rightarrow$ `PENDING_APPROVAL`: PM chuẩn bị xong và bấm Trình duyệt.
- `PENDING_APPROVAL` $\rightarrow$ `APPROVED`: Supervisor duyệt thông qua.
- `PENDING_APPROVAL` $\rightarrow$ `REVISION_REQUIRED`: Supervisor yêu cầu sửa đổi kèm lý do.
- `APPROVED` $\rightarrow$ `ASSIGNED`: PM giao việc cho đội thi công.
- `ASSIGNED` $\rightarrow$ `IN_PROGRESS`: Đội thi công bắt đầu thực hiện.
- `IN_PROGRESS` $\rightarrow$ `PENDING_INSPECTION`: Thi công xong, chờ nghiệm thu.
- `PENDING_INSPECTION` $\rightarrow$ `COMPLETED`: Supervisor nghiệm thu đạt yêu cầu và ký đóng đợt.
