# Rule 03: Stitch Screen Implementation Guidelines (Quy Trình Triển Khai Giao Diện Từ Stitch)

Để đảm bảo việc chuyển đổi giao diện từ thiết kế Stitch sang mã nguồn React TSX chính xác 100%, không bịa đặt hoặc làm sai lệch thiết kế của Hoàng:

## 1. Kiểm tra ảnh thiết kế trước khi code (Mandatory)
- Trước khi tạo hoặc sửa component màn hình tại `src/pages/(pm)/` hoặc `src/pages/(sup)/`:
  - AI phải kiểm tra xem trong thư mục `docs/stitch-designs/` có file ảnh tương ứng hay không (ví dụ: `08_defect_verify_a.png`).
  - Nếu có ảnh: Dùng `view_file` mở ảnh để quan sát trực tiếp:
    1. Cấu trúc chia cột (Grid/Flex layout, tỉ lệ bản đồ : bảng dữ liệu).
    2. Vị trí chính xác của thanh công cụ, bộ lọc (Filter bar), các thẻ KPI.
    3. Trạng thái của các nút bấm (Vàng đồng CTA `#C9A227` hay Nút phụ Slate `#2D3748`).
    4. Các cột trong bảng (Header columns, Badge trạng thái).

## 2. Ánh xạ dữ liệu với Type thật (No Fake Fields)
- Mọi trường thông tin hiển thị trên bảng, biểu mẫu hoặc chi tiết đều phải map tương ứng với interface trong `src/types/domain.ts`.
- Nếu trên thiết kế Stitch có một trường thông tin chưa có trong `src/types/domain.ts`:
  - Kiểm tra lại tài liệu đặc tả `v2.2`.
  - Nếu vẫn không có, **HỎI HOÀNG** xem trường đó tương ứng với thuộc tính nào của Backend, tuyệt đối không tự ý thêm field lạ vào type.

## 3. Tính nhất quán của Design Tokens
- Mọi màu sắc phải dùng class Tailwind hoặc biến CSS đã định nghĩa trong `src/design-tokens.ts`:
  - Nút hành động chính: `bg-brand-gold hover:bg-brand-goldDark text-white`
  - Nút phụ / Nền Sidebar: `bg-brand-navy text-white`
  - Màu nền trang: `bg-brand-surfaceAlt` (`#F8F9FA`)
  - Viền: `border-brand-border` (`#E2E5E9`)
- Font chữ: `font-sans` (Roboto) cho nội dung, số liệu; `font-headline` (Sansation/Roboto) cho tiêu đề lớn.
