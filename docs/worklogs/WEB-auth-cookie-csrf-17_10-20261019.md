# Worklog: CHUYỂN AUTH TỪ BEARER SANG COOKIE + CSRF (17_10)

- **Thời gian thực hiện:** 19/10/2026 (01:00 - 01:15)
- **Nhánh làm việc:** `tung`
- **Tác giả:** Muse (TommyNe) theo yêu cầu Nguyễn Văn Tùng
- **Căn cứ:** Tài liệu 17_10 của nhóm trưởng (`05_Web/01_Web-Architecture-and-Auth.md`, API-013→017)

---

## I. MỤC TIÊU

Chuyển authentication transport từ Bearer token (cũ) sang cookie `WebSession` + CSRF token theo đúng spec 17_10. Web không dùng Bearer, browser tự quản lý cookie HttpOnly.

## II. THAY ĐỔI CHI TIẾT

### 1. `src/api/auth.ts` (tạo mới)
5 API functions theo API catalog:
- `fetchCsrfToken()` → API-013 `GET /api/v1/auth/web/csrf`
- `loginApi(email, password, csrfToken)` → API-014 `POST /api/v1/auth/web/login`
- `logoutApi(csrfToken)` → API-015 `POST /api/v1/auth/web/logout` (tự generate Idempotency-Key UUID v4)
- `renewSessionApi(csrfToken)` → API-016 `POST /api/v1/auth/web/renew`
- `getSessionApi()` → API-017 `GET /api/v1/auth/web/session`

### 2. `src/api/client.ts` (sửa)
- Xóa interceptor gắn `Authorization: Bearer`
- Thêm `withCredentials: true` (browser tự gửi cookie)
- Request interceptor gắn `X-CSRF-TOKEN` từ store
- Response interceptor:
  - 401: thử renew 1 lần (single-flight, tránh renew đồng thời) rồi retry; renew fail → logout + redirect `/login`
  - 403: KHÔNG tự logout, để UI hiển thị denial (theo 17_10)

### 3. `src/store/authStore.ts` (sửa)
- Xóa field `token` (không còn Bearer)
- Thêm `csrfToken`, `mustChangePassword`
- Thêm methods: `setCsrfToken()`, `setSession()`, `ensureCsrfToken()`, `loginWithCredentials()`, `checkSession()`
- `logout()` giờ là async, gọi API-015 trước khi clear state
- **Mock fallback:** khi `VITE_USE_MOCK_AUTH=true` hoặc không có `VITE_API_URL`, giữ behavior mock cũ để dev tiếp tục làm việc khi BE chưa sẵn sàng

### 4. `src/pages/(auth)/Login.tsx`, `ForceChangePassword.tsx` (sửa)
- Cập nhật `setUserAndToken()` bỏ param token (không còn Bearer)

## III. VERIFY
- `npx tsc -b`: 0 errors ✅
- Không còn `Authorization: Bearer` trong `src/api/` ✅
- Mock login vẫn hoạt động (fallback khi BE chưa có) ✅

## IV. LƯU Ý
- Phần bản đồ không bị ảnh hưởng
- Khi BE thật sẵn sàng: set `VITE_API_URL` và `VITE_USE_MOCK_AUTH=false`
- Task tiếp theo: Error handling ProblemDetails (Task B)
