# Quy Tắc Cấu Trúc Thư Mục (Folder Rules) — FE_Web

1. **Nguyên tắc đơn vị tính năng (1 Feature = 1 Folder):**
   - Mỗi màn hình/tính năng lớn phải được đóng gói độc lập trong một thư mục riêng biệt.
   - Thành phần cơ bản gồm:
     - `Container.tsx`: Quản lý luồng chính và tích hợp component con (<= 300 dòng).
     - `ui/`: Các sub-components hiển thị phục vụ riêng cho tính năng.
     - `hooks/`: Custom hooks đóng gói nghiệp vụ, state logic, effect phức tạp.
     - `types.ts`: Định nghĩa kiểu dữ liệu, props, filter states cục bộ.

2. **Quy ước đặt tên file & thư mục (Naming Convention):**
   - Tên file component và hook luôn ở dạng **số ít** (ví dụ: `UserModal.tsx`, `useUserFilter.ts`, tránh dùng số nhiều như `UsersModals.tsx`).
   - Tên thư mục tính năng đặt theo kebab-case hoặc danh từ ngắn gọn (ví dụ: `repair-proposals`, `evidence-closeout`).
   - Tên sub-folder phân loại: `ui/`, `hooks/`, `modals/`, `types.ts`.

3. **Giới hạn số lượng file & Phân tách cấp 2 (Split Threshold):**
   - Bất kỳ thư mục nào chứa **trên 15 files** bắt buộc phải tách tiếp cấp 2 theo miền con (sub-domain/sub-feature).
   - Tuyệt đối không để xảy ra tình trạng "thư mục rác" chứa lẫn lộn hàng chục file không phân loại.
