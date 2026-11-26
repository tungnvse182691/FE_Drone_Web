# Nâng cấp hiệu ứng giao diện (2026-11-26)

Chỉ thêm lớp CSS toàn cục, không đổi bố cục, màu thương hiệu hay logic.

- `src/index.css` (cuối file): keyframes `rg-fade-up/fade-in/pop-in/shimmer`; hiệu ứng chuyển trang `.rg-page-enter` (các khối vào lần lượt); thẻ `.rg-panel/.rg-row/.rg-subcard` bóng mềm + nâng nhẹ khi rê chuột; nút nhấn co nhẹ, vòng focus vàng đồng cho bàn phím; modal `[role=dialog][aria-modal]` nền mờ vào dần + hộp bật nhẹ; skeleton shimmer; hàng bảng đổi nền mượt; sidebar trượt 2px khi rê; ảnh hiện dần; `prefers-reduced-motion` tắt mọi chuyển động.
- `src/pages/(pm)/PMLayout.tsx`, `src/pages/(sup)/SupLayout.tsx`: bọc `<Outlet />` trong `<div key={pathname} className="rg-page-enter">` để mỗi lần đổi trang chạy hiệu ứng.
- Animation dùng `backwards` nên không ghi đè transform sẵn có của modal/drawer. Toast giữ nguyên style và icon cũ.
- Kiểm: `vite build` sạch.
