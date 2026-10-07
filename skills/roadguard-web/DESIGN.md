---
version: alpha
name: Hoàng Hải Dashboard (RoadGuard Web)
description: Hệ thống thiết kế cho web dashboard quản lý bảo hành & sửa chữa hạ tầng đường bộ của Công ty TNHH Xây dựng Bê tông Hoàng Hải — desktop, phong cách minimalism thực dụng, dùng bởi Project Manager (Chỉ huy trưởng) và Supervisor (Giám sát / Chủ đầu tư). Đối tác file DESIGN.md mobile (3 vai trò hiện trường).
colors:
  primary: "#C9A227"
  brand-gold: "#8C6D1F"
  primary-dark: "#6B5219"
  secondary: "#2D3748"
  neutral: "#1A1D20"
  surface: "#FFFFFF"
  surface-alt: "#F8F9FA"
  on-primary: "#FFFFFF"
  on-surface: "#1A1D20"
  border: "#E2E5E9"
  success: "#2F9E44"
  warning: "#F59E0B"
  error: "#E5484D"
  info: "#3B82F6"
typography:
  headline-lg:
    fontFamily: Sansation
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.3
  title-lg:
    fontFamily: Roboto
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
  title-md:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
  body-lg:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  label-sm:
    fontFamily: Roboto
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.02em
  caption:
    fontFamily: Roboto
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 20px
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  screen-margin: 24px
  card-padding: 20px
  table-cell-x: 16px
  table-cell-y: 12px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-pressed:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.neutral}"
    borderColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
  button-text:
    backgroundColor: transparent
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  input-field:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: 12px
  table-header:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
  table-row-hover:
    backgroundColor: "{colors.surface-alt}"
  chip-severity-high:
    backgroundColor: "#FDECEC"
    textColor: "{colors.error}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-severity-medium:
    backgroundColor: "#FEF3E2"
    textColor: "{colors.warning}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-severity-low:
    backgroundColor: "#E9F7EC"
    textColor: "{colors.success}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-status-pending:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-approval-approved:
    backgroundColor: "#E9F7EC"
    textColor: "{colors.success}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-approval-revision:
    backgroundColor: "#FEF3E2"
    textColor: "{colors.warning}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  chip-approval-rejected:
    backgroundColor: "#FDECEC"
    textColor: "{colors.error}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  modal:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  sidebar:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    activeTextColor: "{colors.primary}"
  kpi-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
---

## Overview

Hoàng Hải Dashboard (RoadGuard Web) là web dashboard dành cho 2 vai trò quản lý của **Công ty TNHH Xây dựng Bê tông Hoàng Hải**, phục vụ điều hành bảo hành đường bê tông nông thôn (TCVN 10380:2014): tiếp nhận & thẩm định lỗi AI, điều phối Fast Track, gom đợt sửa chữa & lập BOQ, thẩm duyệt, nghiệm thu Before/After, phân tích rủi ro và ký số đóng đợt.

Web phục vụ **2 vai trò văn phòng** (đối tác 3 vai trò hiện trường của mobile):
1. **Project Manager (Chỉ huy trưởng):** Tạo yêu cầu bay drone, thẩm định lỗi AI (bounding box + đa kỳ), kích hoạt Fast Track, gom đợt + lập BOQ, trình duyệt, giao việc crew, xác nhận hoàn thành.
2. **Supervisor (Giám sát / Chủ đầu tư):** Thẩm duyệt đợt sửa (APPROVE / REQUEST_EVIDENCE / REQUEST_RECONSIDER / REJECT), nghiệm thu Before/After, theo dõi KPI rủi ro, ký số đóng đợt, quản trị hệ thống (WF-12).

Giao diện tuân thủ triết lý **minimalism thực dụng** giống mobile: mỗi màn hình chỉ hiển thị đúng thông tin cần để ra quyết định, không chi tiết trang trí thừa. Vàng đồng thương hiệu `#C9A227` chỉ xuất hiện ở đúng nơi cần thu hút chú ý (1 CTA chính/màn, tab active, KPI nổi bật). Layout desktop: Sidebar trái + Header trên + vùng nội dung multi-column (bảng + bản đồ + drawer), modal giữa màn hình cho xem chi tiết.

### Quy tắc phân tách Logo Thương hiệu (giống mobile)
- **Màn Splash / Loading / Login:** Sử dụng `assets/logo_hoanghai.png` (có đầy đủ tên công ty và slogan).
- **Header nội bộ, Sidebar, Favicon:** Sử dụng `assets/logo_hoanghai_icon.png` (chỉ biểu tượng xe bồn bê tông, tuyệt đối KHÔNG có chữ).

### Quy định Thư viện Icon (Icon Specification)
- **Thư viện Icon bắt buộc trên Web:** 100% Google **Material Symbols** (package `material-symbols`, style `outlined`, 24px) — cùng ngôn ngữ với `@expo/vector-icons/MaterialIcons` của mobile. Cách dùng: `import 'material-symbols/outlined.css'` 1 lần ở entry + `<span className="material-symbols-outlined">ten_icon</span>` (tên snake_case: `check_circle`, `photo_camera`...).
- **NGHIÊM CẤM:** Tuyệt đối KHÔNG dùng emoji làm icon chức năng, KHÔNG dùng `lucide-react` cho code mới (code cũ đang migration dần sang Material, xem bảng quy đổi dưới), không dùng icon fill nhiều màu.
- Bảng quy đổi lucide → Material khi migration: `CheckCircle2→check_circle`, `Clock→schedule`, `XCircle→cancel`, `AlertCircle→error`, `Camera→photo_camera`, `Image→image`, `RefreshCw→sync`, `MapPin→location_on`, `User→person`, `ChevronRight/Left→chevron_right/chevron_left`, `Eye→visibility`, `UploadCloud→cloud_upload`, `AlertTriangle→warning`, `Check→check`, `X→close`, `Plus→add`, `Trash2→delete`, `Pencil→edit`, `Download→download`, `Bell→notifications`, `Search→search`, `Filter→filter_alt`, `Calendar→calendar_month`, `FileText→description`.

### Phạm vi Tài chính trên Web (KHÁC mobile)
- Mobile UD-06 **ZERO chi phí** — quy tắc đó KHÔNG áp dụng cho Web Dashboard.
- Web ĐƯỢC hiển thị BOQ/dự toán/VNĐ cho PM lập và Supervisor duyệt, nhưng: `estimated_total_cost` luôn = SUM tự động các hạng mục, TUYỆT ĐỐI KHÔNG có ô gõ tay tổng tiền (Invariant #1).
- Khi đợt đã `APPROVED`: toàn bộ BOQ + danh sách lỗi bị khóa Read-only (Invariant #3).

---

## Colors

- **Primary (#C9A227):** Vàng đồng thương hiệu Hoàng Hải. Chỉ dùng cho 1 CTA chính/màn, tab đang chọn, KPI nổi bật. Không dùng cho nền lớn.
- **Primary Dark (#6B5219):** Trạng thái nhấn (pressed) của nút chính.
- **Secondary (#2D3748):** Nền Sidebar, nút phụ, text thứ cấp.
- **Neutral (#1A1D20):** Text chính.
- **Surface (#FFFFFF) / Surface Alt (#F8F9FA):** Card trắng, nền trang xám nhạt.
- **Border (#E2E5E9):** Viền mảnh 1px, viền bảng.
- **Success (#2F9E44) / Warning (#F59E0B) / Error (#E5484D):** Badge severity, trạng thái phê duyệt (APPROVED / REVISION / REJECTED), KHÔNG nhầm với vàng thương hiệu.
- **Info (#3B82F6):** Trạng thái đang xử lý, đồng bộ, link.

---

## Typography

Hệ thống dùng **Sansation** cho logo và headline, **Roboto** cho toàn bộ nội dung chức năng (giống mobile):
- **Headline (24px/500, Sansation):** Tiêu đề trang dashboard, số KPI lớn.
- **Title Large (20px/500):** Tiêu đề panel/section.
- **Title Medium (16px/500):** Tiêu đề card, mã đợt `#PKG-xxx`, mã dự án `#PRJ-xxx`.
- **Body Large (16px/400):** Nội dung chính, mô tả.
- **Body Medium (14px/400):** Nội dung bảng, filter.
- **Label Large (14px/500):** Chữ trên nút bấm.
- **Label Small (11px/500, letter-spacing rộng, viết hoa):** Badge/chip trạng thái, header cột bảng.
- **Caption (12px/400):** Timestamp, "Đã tải lúc HH:mm", metadata.

---

## Layout & Components (Desktop)

- **Khung chuẩn:** Sidebar trái (PM nền navy, SUP phân biệt bằng active item vàng), Header trên (logo icon-only + toggle vai trò + chuông + avatar), content multi-column: bảng trái + bản đồ MapLibre phải + drawer chi tiết trượt từ phải.
- **Bảng dữ liệu:** Header xám nhạt chữ hoa 11px, hover row xám nhạt, phân trang + filter + search trên cùng 1 toolbar. Mọi bảng phê duyệt hiển thị đủ 4 nhánh WF-07.
- **Modal chi tiết:** Giữa màn hình, tối đa 2 cấp (detail → confirm), nút nguy hiểm (Reject/Sign-off) luôn yêu cầu lý do + confirm lần 2.
- **Before/After (WF-08):** Slider hoặc side-by-side, kèm EXIF/thời gian/nguồn ảnh, chặn đóng khi còn hạng mục chưa đạt.
- **Mỗi màn hình tối đa 1 CTA chính** màu vàng đồng `{colors.primary}`.
- **Chips phê duyệt (chữ thuần, KHÔNG emoji):**
  - `[Đã duyệt]`: Nền `#E9F7EC`, chữ xanh lá `#2F9E44`.
  - `[Yêu cầu sửa]`: Nền cam nhạt `#FEF3E2`, chữ cam `#F59E0B`.
  - `[Từ chối]`: Nền đỏ nhạt `#FDECEC`, chữ đỏ `#E5484D`.
  - `[Chờ duyệt]`: Nền `#F8F9FA`, chữ xám `#2D3748`.
- **Dashboard KPI:** Tối đa 4 thẻ KPI/hàng, số lớn Sansation 24px, sparkline/trend nhỏ, nút Export (PDF/ZIP) là CTA phụ.
- **Bắt buộc có audit trail:** Mọi quyết định APPROVE/REJECT/sign-off hiển thị người + thời gian + lý do ngay dưới bản ghi.

---

## Do's and Don'ts

- Do dùng vàng đồng `{colors.primary}` cho đúng một hành động chính trên mỗi màn hình.
- Do hiển thị đủ 4 nhánh phê duyệt WF-07 (APPROVE / REQUEST_EVIDENCE / REQUEST_RECONSIDER / REJECT) kèm lý do bắt buộc cho 3 nhánh sau.
- Do khóa Read-only toàn bộ phương án kỹ thuật khi đợt đã APPROVED.
- Do hiển thị Before/After + EXIF trước khi cho nghiệm thu.
- Do quản lý khối lượng kỹ thuật thuần túy (m², mét dài, cm sâu, TCVN 8819), không chứa bảng BOQ tài chính hay ô nhập giá tiền.
- Don't dùng gradient hoặc shadow đậm.
- Don't optimistic UI cho phê duyệt/đóng đợt/publish (phải chờ server ACK).
- Don't copy text/data giả từ Stitch vào web (Stitch chỉ tham khảo layout + mã màu).
- Don't để Supervisor duyệt hạng mục Fast Track (BR-25: PM đóng, Sup chỉ nhận báo).

---

## Accessibility & Trạng thái UI (theo `29_9/09_Frontend/10_FE_Architecture_UI_States.md`)

### Quy tắc bắt buộc (giống mobile, áp cho desktop)
- **Label tiếng Việt sát input/field:** Không dùng placeholder thay label.
- **Lỗi có text + icon, KHÔNG chỉ màu:** Focus về field lỗi đầu tiên sau submit.
- **Nút bị disable phải có lý do gần nút:** Vd nút `[Phê duyệt]` disable → text `"Còn 2 hạng mục chưa đủ bằng chứng"` ngay bên dưới.
- **Không toast cho mỗi chunk upload / mỗi retry:** Gộp thành 1 banner trạng thái duy nhất.
- **Không loading xóa nội dung đã tải:** Skeleton lần đầu; sau đó stale data + badge "Đang cập nhật...".
- **Empty ≠ No-permission ≠ Offline-error:** Ba trạng thái UI/message riêng biệt.

### Nhãn dữ liệu & xuất báo cáo
- Mọi bảng có cache hiển thị `"Đã tải lúc HH:mm"` đọc được.
- Export RPT (PDF/ZIP) chạy async job có tiến trình + retry, không block UI.
- Thông báo dùng từ cụ thể: `"Đã gửi lên máy chủ"`, `"Máy chủ đã xác minh"`, `"Chưa xác nhận được kết quả, đang kiểm tra"` (không bao giờ `"Thất bại"` khi chưa rõ server state).
