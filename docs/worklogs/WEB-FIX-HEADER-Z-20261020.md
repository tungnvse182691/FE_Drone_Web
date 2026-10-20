# WORKLOG: FIX Z-INDEX HEADER APP TRÁNH BỊ TOOLBAR BẢN ĐỒ ĐÈ

- **Thời gian thực hiện:** 2026-10-20
- **Nhánh:** `tung`
- **Mục tiêu:** Sửa lỗi thanh công cụ bản đồ ở trang `/pm/alignment` trượt lên đè lên header app khi cuộn trang (đặc biệt khi cửa sổ trình duyệt thấp hoặc tỉ lệ scale 125%).

---

## 1. MÔ TẢ LỖI & NGUYÊN NHÂN GỐC

- **Hiện tượng:** Ở trang Tuyến & Phân đoạn (`/pm/alignment`), khi người dùng cuộn trang xuống, cụm thanh công cụ điều khiển bản đồ ("Ảnh vệ tinh HD / Bản đồ số / Tấm & Khe bê tông" và ô tọa độ) trượt lên đè lên trên header app (thanh trắng chứa logo HOÀNG HẢI + thông báo + tài khoản), thay vì trượt xuống dưới header.
- **Nguyên nhân gốc:**
  - Header app (`src/components/layout/Header.tsx`) sử dụng `sticky top-0 z-30`.
  - Thanh công cụ bản đồ (`src/pages/(pm)/alignment/AlignmentMap.tsx`) cũng có `z-30`.
  - Trong chuẩn CSS, khi 2 phần tử có cùng `z-index` trong stacking context, phần tử nằm sau trong thứ tự DOM sẽ hiển thị đè lên phần tử nằm trước. Do thanh công cụ nằm trong `<main>` (sau `<header>`), nó vẽ đè lên header khi trượt vào vùng header.

---

## 2. THAY ĐỔI CỤ THỂ

Đúng 1 dòng trong file `src/components/layout/Header.tsx` (dòng 20):
- **Trước:**
  ```tsx
  <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
  ```
- **Sau:**
  ```tsx
  <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-50 shadow-xs">
  ```
*(Nâng `z-30` thành `z-50`, giữ nguyên toàn bộ các class và cấu trúc còn lại).*

---

## 3. KỶ LUẬT CODE & PHẠM VI

- Tuyệt đối không sửa bất kỳ file bản đồ nào (đặc biệt `src/pages/(pm)/alignment/AlignmentMap.tsx` và thư mục `alignment/` được giữ nguyên 100%).
- Không đổi z-index ở bất kỳ file nào khác trong codebase.
- Không sửa logic, state hay handler nào.
- Chỉ có 2 file thay đổi trong git: `Header.tsx` và worklog này.

---

## 4. KẾT QUẢ KIỂM TRA

1. **TypeScript build:**
   - Lệnh: `npx tsc -b`
   - Kết quả: **0 lỗi** (Exit code 0).
2. **Kiểm tra hiển thị:**
   - Khi cuộn trang, thanh công cụ bản đồ trượt xuống dưới header trắng và bị che đúng chuẩn.
   - Các modal và tooltip/menu thông báo vẫn hiển thị đè lên header bình thường (modal có `z-50` nằm sau header trong DOM).
