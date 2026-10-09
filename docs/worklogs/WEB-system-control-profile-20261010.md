# Worklog: HOÀN THIỆN PHÂN HỆ KIỂM SOÁT HỆ THỐNG, QUẢN TRỊ NHÂN SỰ & HỒ SƠ KỸ SƯ / CHỨNG CHỈ HÀNH NGHỀ (CCHN) — CHUẨN MINIMALISM, MATERIAL SYMBOLS & IN-MEMORY MOCK API

- **Thời gian thực hiện:** 10/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.10 `RPT-10`, Quy tắc lưu trữ pháp lý `BR-45` (Lưu trữ hết hạn bảo hành + 5 năm), Quy định phân quyền và đóng băng hồ sơ pháp lý (`Legal Hold`).
  - 10 Điều bất biến (AGENTS.md): Điều 1 (Khối lượng kỹ thuật thi công - Zero Money, không tính toán giá tiền), Điều 2 & 3 (Phân quyền Supervisor/PM, đóng băng hồ sơ), Điều 6 (Token in-memory, zero localStorage), Điều 10 (Design System vàng đồng `#C9A227` cho CTA/KPI).
  - Phong cách thiết kế: **Minimalism**, thuần Việt 100%, bộ icon **Google Material Symbols** đồng bộ, **In-Memory Mock API** (`profileService.ts`, `retentionService.ts`), tuyệt đối không dùng `localStorage` hay file JSON/mock tĩnh import trực tiếp.

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

1. **Chuẩn hóa Phân hệ Kiểm soát Hệ thống & Lưu trữ Pháp lý (System Control / Retention & Legal Hold):**
   - Hoàn thiện chức năng quản trị tài khoản, kiểm soát thời hạn lưu trữ hồ sơ công trình theo quy định pháp lý (hết hạn bảo hành + 5 năm theo quy chuẩn TCVN / BR-45).
   - Thiết lập cơ chế Đóng băng pháp lý (Legal Hold) khi công trình có thanh tra hoặc tranh chấp kỹ thuật.
   - Xây dựng quy trình thẩm định yêu cầu hủy/xóa dữ liệu kỹ thuật có phê duyệt 2 cấp (Chỉ huy trưởng đề xuất $\rightarrow$ Kỹ sư Giám sát phê duyệt).

2. **Xây dựng Phân hệ Quản trị Nhân sự & Hồ sơ Kỹ sư / Chứng chỉ hành nghề (CCHN):**
   - Trang Quản trị nhân sự (`/sup/personnel`): Theo dõi danh sách kỹ sư, chỉ huy trưởng, đội bay drone và đội thi công; kiểm soát số hiệu CCHN và hạn hiệu lực.
   - Modal xem nhanh Hồ sơ cá nhân (`UserProfileModal`): Tích hợp trực tiếp trên Header hệ thống, cho phép xem và cập nhật thông tin kỹ sư, chứng chỉ CCHN, và các phiên đăng nhập đang hoạt động.
   - Trang chi tiết Hồ sơ cá nhân (`/pm/profile`, `/sup/profile`): Cung cấp đầy đủ tính năng cập nhật thông tin, đổi mật khẩu và quản lý gói thầu phụ trách.

3. **Tích hợp Tải & Đối soát Ảnh Bản scan CCHN gốc (Minh chứng tránh làm giả):**
   - Hỗ trợ tải lên ảnh chụp/scan 2 mặt của CCHN kỹ thuật.
   - Hiển thị danh sách thumbnail kèm nút xóa và nút phóng to.
   - Tích hợp Lightbox Viewer phóng to toàn màn hình độ phân giải cao phục vụ đối soát con dấu pháp lý và số hiệu chứng chỉ.

4. **Dọn dẹp Chi tiết rác, Việt hóa toàn diện & Chuẩn hóa Minimalism:**
   - Xóa bỏ toàn bộ các mã kỹ thuật của lập trình viên (`FR-xx`, `BR-xx`, `US-xx`, `JSON.stringify` thô).
   - Thay thế toàn bộ icon Lucide sang Google Material Symbols.
   - Đồng bộ hóa 100% tiếng Việt chuyên ngành xây dựng đường bộ.

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA & TẠO MỚI

### 1. Tầng API Service (In-Memory Mock API)
- **`src/api/services/profileService.ts` (Tạo mới):**
  - Quản lý thông tin hồ sơ người dùng (`UserProfile`), mã định danh kỹ sư, phòng ban, số điện thoại, số hiệu CCHN, hạn hiệu lực, danh sách ảnh chụp CCHN và danh sách dự án/gói thầu đang phụ trách.
  - Quản lý danh sách phiên đăng nhập (`UserSession`): Thiết bị, trình duyệt, địa chỉ IP, vị trí địa lý, thời điểm hoạt động và chức năng thu hồi phiên (đăng xuất từ xa).
  - Hỗ trợ đổi mật khẩu xác thực an toàn trong bộ nhớ.
- **`src/api/services/retentionService.ts` (Tạo mới):**
  - Quản lý thời hạn lưu trữ hồ sơ kỹ thuật theo từng dự án (QL1A, Cao tốc Bắc - Nam, Quốc lộ 14).
  - Quản lý trạng thái Đóng băng pháp lý (Legal Hold) và lịch sử kích hoạt/gỡ bỏ.
  - Quản lý danh sách yêu cầu hủy/xóa dữ liệu công trình: Trạng thái thẩm duyệt (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`), lý do pháp lý, và danh mục hồ sơ kỹ thuật liên quan.
- **`src/api/services/index.ts`:**
  - Xuất khẩu tập trung `profileService` và `retentionService` cùng toàn bộ kiểu dữ liệu liên quan.

### 2. Giao diện Người dùng & Layout
- **`src/components/common/UserProfileModal.tsx` (Tạo mới):**
  - Modal xem nhanh hồ sơ cá nhân với 3 tab: *Thông tin cá nhân*, *Chứng chỉ hành nghề (CCHN)*, *Bảo mật & Phiên đăng nhập*.
  - Tích hợp tính năng tải ảnh CCHN mặt trước/mặt sau, quản lý ảnh và mở xem phóng to Lightbox.
  - Quản lý các thiết bị/phiên đang đăng nhập và đăng xuất từ xa.
- **`src/pages/(pm)/ProfilePage.tsx` (Tạo mới):**
  - Trang hồ sơ chi tiết phục vụ cả PM và Supervisor tại tuyến đường `/pm/profile` và `/sup/profile`.
  - Đồng bộ toàn diện tính năng tải ảnh CCHN, quản lý danh sách gói thầu phụ trách và đổi mật khẩu.
- **`src/pages/(sup)/PersonnelManagement.tsx` (Tạo mới):**
  - Màn hình Quản trị nhân sự nhà thầu Hoàng Hải tại tuyến đường `/sup/personnel`.
  - Thống kê nhân sự theo vai trò, quản lý hạn CCHN, phân công hiện trường và tìm kiếm/lọc nhanh.
- **`src/components/layout/Header.tsx`:**
  - Bổ sung menu thả xuống tại Avatar người dùng: Xem hồ sơ nhanh (mở `UserProfileModal`), Truy cập trang cá nhân, và Đăng xuất an toàn.
- **`src/components/layout/Sidebar.tsx`:**
  - Bổ sung liên kết điều hướng đến *Quản trị nhân sự* (`/sup/personnel`) và *Kiểm soát hệ thống* (`/sup/system-control`).
- **`src/App.tsx`:**
  - Cấu hình các route mới: `/pm/profile`, `/sup/profile`, `/sup/personnel`, `/sup/system-control`.
- **`src/store/authStore.ts`:**
  - Bổ sung phương thức `updateUser` cập nhật tức thì thông tin hồ sơ trong Zustand state.

### 3. Phân hệ Kiểm soát Hệ thống (`src/pages/(sup)/system-control/`)
- **`SystemControl.tsx`:**
  - Tích hợp gọi bất đồng bộ từ `retentionService`, quản lý 2 tab chính: *Tài khoản & Phân quyền*, *Lưu trữ & Đóng băng pháp lý*.
- **`AccountsTab.tsx`:**
  - Bảng danh sách tài khoản kỹ thuật, phân quyền vai trò (PM, Sup, Drone Operator, Field Crew), khóa/mở khóa tài khoản.
- **`RetentionLegalHoldTab.tsx`, `LegalHoldCard.tsx`, `DeletionRequestsCard.tsx`:**
  - Quản lý các gói thầu đang áp dụng chính sách lưu trữ BR-45, danh sách lệnh đóng băng pháp lý và các yêu cầu hủy dữ liệu.
- **`DeletionRequestDetailModal.tsx` & `ProjectRetentionDetailModal.tsx` (Tạo mới):**
  - Xem chi tiết hồ sơ thẩm định yêu cầu xóa dữ liệu, kiểm tra căn cứ pháp lý và thực hiện phê duyệt/từ chối.

---

## III. KẾT QUẢ KIỂM THỬ & CHẤT LƯỢNG MÃ NGUỒN

- **TypeScript Compilation:** Lệnh `npx tsc -b` vượt qua kiểm tra 100% với **Exit Code 0**, không phát sinh bất kỳ lỗi cú pháp hay kiểu dữ liệu nào.
- **Trải nghiệm giao diện (UX):**
  - Phong cách tối giản (Minimalism) trang nhã, không còn các chi tiết thừa thãi.
  - Sử dụng toàn bộ Material Symbols đồng bộ, độ tương phản trực quan rõ nét.
  - Hỗ trợ tải ảnh scan CCHN và xem phóng to Lightbox mượt mà, phục vụ đối soát pháp lý con dấu và số hiệu.
- **Bảo toàn kiến trúc:**
  - Cấu trúc cây thư mục được giữ nguyên vẹn 100%.
  - Zero `localStorage`, toàn bộ dữ liệu mock được quản lý an toàn trong bộ nhớ (In-Memory Mock API).
