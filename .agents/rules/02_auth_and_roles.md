# Rule 02: Authentication & Role-Based Access Control (RBAC)

## 1. Lưu trữ và xử lý Token
- **Access Token:** Lưu trữ trong `in-memory` (thông qua Zustand `authStore`). Không lưu token nhạy cảm trong `localStorage` để phòng tránh XSS.
- **Auto Refresh:** Khi gặp lỗi HTTP `401 Unauthorized`, Axios Interceptor kích hoạt cơ chế refresh token (single-flight queue). Nếu refresh thất bại, xóa trạng thái đăng nhập và redirect về `/login`.

## 2. Luồng đổi mật khẩu bắt buộc (`must_change_password`)
- Khi đăng nhập thành công, kiểm tra trường `user.must_change_password`.
- Nếu `true`: Hệ thống ngay lập tức chuyển hướng sang route `/force-change-password`.
- Mọi route khác (`/pm/*`, `/sup/*`) phải bị chặn bằng Route Guard cho đến khi người dùng hoàn tất đổi mật khẩu.

## 3. Phân quyền cấp Route (Role Guard)
- Người dùng có `RoleCode.PROJECT_MANAGER` chỉ được truy cập các đường dẫn bắt đầu bằng `/pm/`. Nếu cố tình nhập URL `/sup/*`, hiển thị màn hình 403 Forbidden hoặc redirect về `/pm/dashboard`.
- Người dùng có `RoleCode.SUPERVISOR` chỉ được truy cập các đường dẫn bắt đầu bằng `/sup/`. Nếu cố tình nhập URL `/pm/*`, redirect về `/sup/dashboard`.
- Route dùng chung (như xem danh sách dự án `/pm/projects` hoặc `/sup/projects`) sẽ kế thừa theo layout của vai trò đang đăng nhập.
