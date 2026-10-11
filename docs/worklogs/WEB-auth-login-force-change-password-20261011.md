# Worklog: CHUẨN HÓA MÀN HÌNH ĐĂNG NHẬP & ĐỔI MẬT KHẨU LẦN ĐẦU (BƯỚC PM-01 / AUTH) — MINIMALISM, VIỆT HÓA TOÀN DIỆN, CHUYỂN ĐỔI MOCK API VÀ DỌN RÁC GIAO DIỆN

- **Thời gian thực hiện:** 11/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.1 (Màn hình Đăng nhập & Đổi mật khẩu lần đầu).
  - 10 Điều bất biến (AGENTS.md): Điều 6 (Token Authentication - Access token lưu in-memory, tuyệt đối không dùng `localStorage`), Điều 7 (Đổi mật khẩu lần đầu `force-change-password` chặn chuyển hướng nếu `must_change_password === true`), Điều 10 (Design System vàng đồng `#C9A227` cho CTA chính).
  - Phong cách thiết kế: **Minimalism**, thuần Việt 100%, bộ icon **Material Symbols** đồng bộ, **In-Memory Mock API** (`authService.ts`, Zero `localStorage`, Zero file mock tĩnh).

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

1. **Chuẩn hóa Bước 01 trong Danh mục chức năng:**
   - Hoàn thiện giao diện đăng nhập tại tuyến đường `/login` và đổi mật khẩu bắt buộc tại `/force-change-password`.
   - Đảm bảo kiểm soát vai trò chặt chẽ: PM (`PROJECT_MANAGER`) và Giám sát (`SUPERVISOR`), hỗ trợ chuyển hướng chuẩn xác sau khi xác thực.

2. **Xử lý các phản hồi & yêu cầu cải tiến giao diện từ Hoàng:**
   - **Xóa bỏ hoàn toàn Local tĩnh & LocalStorage:**
     - Loại bỏ việc nhúng mock data tĩnh trực tiếp trong component hoặc lưu trữ token/user trong `localStorage`.
     - Chuyển sang In-Memory Mock API Service bất đồng bộ [`authService.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/authService.ts), giả lập trễ mạng 250ms giống hệt môi trường Production.
     - Cập nhật [`authStore.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/store/authStore.ts) lưu Access Token thuần in-memory (RAM), tuân thủ 100% Invariant 6 trong `AGENTS.md`.
   - **Phong cách Minimalism (Tối giản cao cấp):**
     - Nền phẳng tông xám sáng `#F8F9FA`, viền thanh thoát `#E2E5E9`, loại bỏ bóng đổ nặng và đường kẻ lưới gây rối mắt.
     - Màu vàng đồng Hoàng Hải `#C9A227` chỉ áp dụng cho nút bấm hành động chính (CTA) và điểm nhấn nhận diện thương hiệu.
   - **Bộ icon Google Material Symbols đồng bộ:**
     - Thay thế 100% các icon từ Lucide sang `<span className="material-symbols-outlined">...</span>` (`lock`, `mail`, `key`, `visibility`, `visibility_off`, `verified`, `shield`, `check_circle`,...).
   - **Việt hóa toàn diện & dọn dẹp chi tiết thừa:**
     - Dọn sạch lỗi mã hóa ký tự (mojibake) trên toàn bộ các file form.
     - Loại bỏ các nhãn debug, cờ thừa như `FLAG: mustChangePassword = true`, mã kiểm toán rác, quy chuẩn hiển thị rườm rà.
   - **Bảo toàn 100% cấu trúc cây thư mục:**
     - Giữ nguyên toàn bộ cấu trúc phẳng của thư mục `src/pages/(auth)/`.

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA & NÂNG CẤP

### 1. `src/api/services/authService.ts`
- Xây dựng dịch vụ Mock API bất đồng bộ hoàn chỉnh cho phân hệ xác thực tài khoản:
  - Danh sách tài khoản thử nghiệm phong phú theo các vai trò: PM (`pmhoang@gmail.com`), Supervisor (`suphoang@gmail.com`), Drone Pilot (`operator@hoanghai.vn`), Đội thi công (`crew@hoanghai.vn`), và tài khoản kiểm thử đổi mật khẩu lần đầu (`newpm@hoanghai.vn`).
  - Phương thức `login({ username, password })`: Trả về Access Token và thông tin User với độ trễ mạng giả lập.
  - Phương thức `changePassword({ tempPassword, newPassword })`: Xác thực mật khẩu tạm, cập nhật mật khẩu mới và gỡ cờ `must_change_password`.
  - Phương thức `getCurrentUser()`, `logout()`: Quản lý phiên làm việc sạch sẽ trong RAM.

### 2. `src/store/authStore.ts`
- Loại bỏ hoàn toàn việc đọc/ghi `localStorage` đối với Access Token và User profile.
- Lưu trữ `accessToken` và `user` trực tiếp trong Zustand store (In-memory state), đáp ứng nghiêm ngặt quy định an ninh phiên làm việc.

### 3. `src/pages/(auth)/Login.tsx`
- Tích hợp gọi API thông qua `authService.login(...)`.
- Thiết kế layout tối giản, sạch sẽ, bỏ nền lưới trang trí phức tạp, tập trung vào trải nghiệm đăng nhập nhanh.
- Tự động kiểm tra cờ `must_change_password` để chuyển hướng sang `/force-change-password` hoặc Dashboard tương ứng.

### 4. `src/pages/(auth)/login/LoginHeader.tsx`
- Tinh chỉnh logo thương hiệu Hoàng Hải RoadGuard với phong cách tinh gọn.
- Sử dụng Material Symbols (`shield`), hiển thị rõ ràng định hướng quản lý bảo hành & sửa chữa hạ tầng.

### 5. `src/pages/(auth)/login/LoginForm.tsx`
- Dọn dẹp các chi tiết rác, chuyển đổi 100% icon sang Google Material Symbols.
- Chuyển bảng chọn nhanh tài khoản thử nghiệm thành các nút bấm tối giản, tiện dụng cho việc thao tác và trình diễn nghiệp vụ.

### 6. `src/pages/(auth)/login/ForcePasswordSection.tsx`
- Việt hóa toàn diện, sửa sạch các lỗi font chữ tiếng Việt.
- Giúp người dùng nắm bắt ngay thông tin quy tắc an toàn mật khẩu (tối thiểu 8 ký tự, chữ hoa/thường, số, ký tự đặc biệt) với giao diện trực quan.

### 7. `src/pages/(auth)/ForceChangePassword.tsx` & `ForcePasswordForm.tsx`
- Loại bỏ toàn bộ nhãn kỹ thuật gây nhiễu, chuyển form đổi mật khẩu sang phong cách Minimalism.
- Kết nối trực tiếp với `authService.changePassword(...)`, hiển thị thông báo phản hồi rõ ràng và chuyển hướng thông minh sau khi cập nhật thành công.

---

## III. KẾT QUẢ KIỂM THỬ & KIỂM TRA CHẤT LƯỢNG

1. **Kiểm tra biên dịch TypeScript:**
   - Chạy `npx tsc -b`: **Hoàn thành không có lỗi (Exit code 0)**.
2. **Kiểm tra Git & Cấu trúc thư mục:**
   - 100% cây thư mục được giữ nguyên vẹn, không có file mới phát sinh ngoài quy định.
   - Toàn bộ thay đổi nằm trong phạm vi được yêu cầu (`src/pages/(auth)/`, `src/store/authStore.ts`, `src/api/services/authService.ts`).
