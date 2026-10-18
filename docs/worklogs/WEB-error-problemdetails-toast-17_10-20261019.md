# Worklog: ERROR HANDLING PROBLEMDETAILS + TOAST (17_10)

- **Thời gian thực hiện:** 19/10/2026 (01:15 - 01:35)
- **Nhánh làm việc:** `tung`
- **Tác giả:** Muse (TommyNe) theo yêu cầu Nguyễn Văn Tùng
- **Căn cứ:** Tài liệu 17_10 (`05_Web/06_Web-Errors-and-State-Handling.md`, API catalog error contracts)

---

## I. MỤC TIÊU

Chuyển error handling sang chuẩn ProblemDetails (`application/problem+json`) theo 17_10. BE là authoritative cho error code. Thay thế tất cả `alert()` native bằng toast UI.

## II. THAY ĐỔI CHI TIẾT

### 1. `src/api/problemDetails.ts` (tạo mới)
- Interface `ProblemDetails`: `type`, `title`, `status`, `detail`, `instance`, `code`, `errors`
- `ErrorCodes` constants: `auth_unauthorized`, `csrf_failed`, `validation_error`, `conflict`, `precondition_failed`, `idempotency_key_reused`, `not_found`, `internal_error`
- `parseProblemDetails(error)`: parse AxiosError thành ProblemDetails, ưu tiên đọc `code` từ BE
- `getErrorMessage(problem)`: trả về message tiếng Việt thân thiện
- `isValidationError()`, `isConcurrencyError()`: helpers cho UI xử lý

### 2. `src/store/toastStore.ts` (tạo mới)
- Zustand store cho toast notifications
- Methods: `success()`, `error()`, `warning()`, `info()`, `show()`, `dismiss()`
- Tự động dismiss sau 5s

### 3. `src/components/ui/ToastContainer.tsx` (tạo mới)
- Component hiển thị toast ở góc phải trên (fixed, z-9999)
- 4 loại: success (xanh), error (đỏ), warning (vàng), info (xanh dương)

### 4. `src/App.tsx` (sửa)
- Thêm `<ToastContainer />` vào root

### 5. Thay thế 7 `alert()` bằng toast:
- `src/pages/(auth)/Login.tsx` → `toast.error()`
- `src/pages/(auth)/ForceChangePassword.tsx` → `toast.error()`
- `src/pages/(auth)/login/LoginForm.tsx` → `toast.info()`
- `src/pages/(auth)/accept-invitation/AcceptForm.tsx` → `toast.info()`
- `src/pages/(sup)/system-control/LegalHoldModal.tsx` → `toast.warning()`
- `src/pages/(pm)/AssignCrew.tsx` (stub) → `toast.success()`
- `src/pages/(sup)/BatchRejection.tsx` (stub) → `toast.success()`

## III. VERIFY
- `npx tsc -b`: 0 errors ✅
- Không còn `alert()` nào trong `src/pages/` ✅
- ToastContainer render ở App root ✅

## IV. LƯU Ý
- Theo 17_10: 409/412 → giữ draft local, refetch, hiển thị conflict diff, hỏi user (chưa implement UI, mới có helper `isConcurrencyError()`)
- Task tiếp theo: Fast Track API-146 (Task C)
