# Worklog: HARDEN SHELL (ĐỢT 4) TRÊN NHÁNH tung

- **Ngày thực hiện:** 06/10/2026  
- **Nhánh:** `tung`  
- **Baseline:** Sau commit `d977b09` và hoàn tất Đợt 3b (`549ce3a`)  
- **Mục tiêu:** Củng cố lớp vỏ hệ thống (Route Guard, xóa cửa hậu đổi vai, chuẩn hóa Token 1 nguồn Tailwind SSOT, dọn config & docs). Tuyệt đối **CẤM đụng UI/logic màn hình**, chỉ sửa lớp vỏ. Không dùng `push --force`. Từng việc kiểm thử `tsc 0` + `build PASS` và commit riêng.

---

## 1. TỔNG HỢP CÁC VIỆC ĐÃ HOÀN THÀNH

### VIỆC 1 — Route guard thật (`src/App.tsx` + layouts)
- **Mục tiêu:**
  - Viết `ProtectedRoute`: Chặn chưa login $\rightarrow$ `/login`; `user.must_change_password` $\rightarrow$ `/force-change-password`; vai trò PM vào `/sup/*` (và ngược lại) $\rightarrow$ chuyển hướng về dashboard đúng vai. Bọc toàn bộ các route `/pm/*` và `/sup/*`.
  - Viết `PublicAuthRoute` và `ForcePasswordRoute` bọc các route authentication (`/login`, `/accept-invitation`, `/force-change-password`), ngăn người dùng đã đăng nhập hoặc đã đổi mật khẩu truy cập sai luồng.
  - Tối giản `PMLayout.tsx` và `SupLayout.tsx` thành layout thuần túy render `Header`, `Sidebar`, `Outlet`, dời toàn bộ logic kiểm tra phân quyền và chuyển hướng tập trung vào Route Guard.
- **Các file thay đổi / tạo mới:**
  - `src/components/layout/ProtectedRoute.tsx` (Mới: 66 dòng)
  - `src/pages/(pm)/PMLayout.tsx` (Sửa: giảm từ 36 $\rightarrow$ 19 dòng)
  - `src/pages/(sup)/SupLayout.tsx` (Sửa: giảm từ 36 $\rightarrow$ 19 dòng)
  - `src/App.tsx` (Sửa: 195 dòng)
- **Kiểm thử:**
  - `npx tsc --noEmit`: **0 lỗi**
  - `npm run build`: **PASS** (vite built in 25.39s)
- **Commit:** `1a106b7` — `feat(auth-guard): implement real ProtectedRoute and slim down role layouts`

---

### VIỆC 2 — Xóa cửa hậu đổi vai
- **Mục tiêu:**
  - Xóa hoàn toàn phương thức `switchRole` khỏi `src/store/authStore.ts` và interface `AuthState` (chỉ giữ lại `login` và `logout`).
  - Xóa bộ chuyển đổi vai trò nhanh (toggle buttons và handler `handleRoleToggle`) khỏi `src/components/layout/Header.tsx`, chỉ giữ nhãn hiển thị vai trò hiện tại readonly và nút đăng xuất.
  - Sửa các vị trí tự kiểm tra/rewrite `actionUrl` chéo vai `/pm` $\leftrightarrow$ `/sup` trong pages (đặc biệt tại `NotificationsHandoffHub.tsx`, `ProjectOverviewHeader.tsx`, `ProjectList.tsx`), chuyển sang đọc vai trò từ store readonly và dùng route chuẩn mực dựa trên context.
- **Các file thay đổi:**
  - `src/store/authStore.ts` (Sửa: 38 dòng)
  - `src/components/layout/Header.tsx` (Sửa: 73 dòng)
  - `src/pages/(pm)/NotificationsHandoffHub.tsx` (Sửa: 294 dòng)
  - `src/pages/(pm)/ProjectList.tsx` (Sửa: 252 dòng)
  - `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` (Sửa: 135 dòng)
- **Kiểm thử:**
  - `npx tsc --noEmit`: **0 lỗi**
  - `npm run build`: **PASS** (vite built in 24.45s)
- **Commit:** `8941f47` — `refactor(auth): remove switchRole backdoor and hardcoded role rewrites`

---

### VIỆC 3 — Token 1 nguồn (Tailwind Single Source of Truth)
- **Mục tiêu:**
  - Cài đặt plugin `tailwindcss-animate` vào `package.json` và đăng ký trong `tailwind.config.js` để kích hoạt toàn bộ các hiệu ứng chuyển động modal (`animate-in`, `fade-in`, `zoom-in`,...).
  - Thiết lập `tailwind.config.js` làm SSOT (Single Source of Truth) cho bảng màu thương hiệu Hoàng Hải, phông chữ `Roboto` / `Sansation`, mở rộng `boxShadow` hỗ trợ `shadow-xs` và `shadow-2xs`, mở rộng `borderWidth` hỗ trợ `border-l-3` / `border-3`.
  - Thay thế chuỗi template động `line-clamp-${lines}` trong `src/components/ui/TruncatedText.tsx` bằng bảng ánh xạ tĩnh `lineClampClasses`, đồng thời khai báo `safelist` các lớp `line-clamp-1` đến `line-clamp-6` trong cấu hình Tailwind.
  - Đồng bộ `src/design-tokens.ts` theo dạng re-export tham chiếu từ cấu hình SSOT.
- **Các file thay đổi:**
  - `package.json` & `package-lock.json`
  - `tailwind.config.js` (Sửa: 50 dòng)
  - `src/design-tokens.ts` (Sửa: 25 dòng)
  - `src/components/ui/TruncatedText.tsx` (Sửa: 51 dòng)
- **Kiểm thử:**
  - `npx tsc --noEmit`: **0 lỗi**
  - `npm run build`: **PASS** (vite built in 25.09s, CSS bundle: 252.97 kB)
- **Commit:** `72c72da` — `refactor(tokens): unify Tailwind config as single source of truth`

---

### VIỆC 4 — Dọn config + docs
- **Mục tiêu:**
  - Xóa cấu hình alias chết `@` không sử dụng khỏi `vite.config.ts` và `tsconfig.json`.
  - Cập nhật bảng mapping 18 màn hình trong `AGENTS.md` đồng bộ 100% với cấu trúc route và component thực tế trong `src/App.tsx` (đặc biệt các màn 10-18: `RepairProposals.tsx`, `ProposalApprovalDetail.tsx`, `EvidenceCloseoutDetail.tsx`, `RiskAnalytics.tsx`).
  - Dời 5 tài liệu markdown cũ không còn phù hợp vào thư mục lưu trữ `docs/archive/`:
    - `BAO_CAO_DANH_GIA_CHUC_NANG_THUA_THIEU.md`
    - `DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`
    - `huong_dan_demo.md`
    - `docs/CAU_TRUC_DU_AN_VA_HUONG_DAN_REFACTOR.md`
    - `docs/NGHIEP_VU_HE_THONG.md`
  - Xóa tệp tài liệu tham chiếu dư thừa `docs/friend_reference.html`.
  - Viết tài liệu quy ước cấu trúc `docs/FOLDER_RULES.md` (~20 dòng) quy định: 1 Feature = 1 Folder, tên file số ít, ngưỡng phân tách cấp 2 khi vượt quá 15 file.
- **Các file thay đổi / tạo mới:**
  - `vite.config.ts`
  - `tsconfig.json`
  - `AGENTS.md`
  - `docs/FOLDER_RULES.md` (Mới: 20 dòng)
  - `docs/archive/` (5 files)
  - `docs/friend_reference.html` (Đã xóa)
- **Kiểm thử:**
  - `npx tsc --noEmit`: **0 lỗi**
  - `npm run build`: **PASS** (vite built in 25.53s)
- **Commit:** `49c2dc7` — `chore(config-docs): cleanup dead alias, sync AGENTS.md 18 screens, archive legacy docs, add FOLDER_RULES.md`

---

## 2. KẾT QUẢ KIỂM TRA CHỈ TIÊU KỸ THUẬT

1. **TypeScript (`npx tsc --noEmit`):** 0 errors.
2. **Production Build (`npm run build`):** PASS (0 errors, 1949 modules transformed).
3. **Quy tắc độ dài file:** 100% các file mới và sửa đổi đều $\le 300$ dòng.
4. **Bảo toàn nghiệp vụ & UI:** Không thay đổi logic nghiệp vụ và giao diện nội tại của các màn hình chức năng.
5. **Git Discipline:** 4 commit riêng biệt theo từng việc, không force push.
