# Worklog: FAST TRACK ELIGIBILITY API-146 (17_10)

- **Thời gian thực hiện:** 19/10/2026 (01:35 - 01:45)
- **Nhánh làm việc:** `tung`
- **Tác giả:** Muse (TommyNe) theo yêu cầu Nguyễn Văn Tùng
- **Căn cứ:** Tài liệu 17_10 (API-146, `05_Web/03_PM-Screen-API-Matrix.md` PM-10)

---

## I. MỤC TIÊU

Chuyển Fast Track eligibility từ cờ cứng `isFastTrackEligible` sang gọi API-146 theo 17_10. Server quyết định threshold, FE chỉ hiển thị kết quả.

Nguyên tắc 17_10:
- **Fail closed:** nếu API trả về không eligible, UI TUYỆT ĐỐI không cho phép Fast Track
- **Preflight not irrevocable:** kết quả eligibility chỉ là kiểm tra trước, không phải quyền bất khả thu hồi
- **Server-driven:** policy thresholds do server quyết định, FE không hardcode

## II. THAY ĐỔI CHI TIẾT

### 1. `src/api/fastTrack.ts` (tạo mới)
- Interface `RepairEligibilityReadView`: `eligible`, `missingReasons[]`, metadata
- `checkEligibilityApi(projectId, packageId, itemId)` → API-146
- `checkBatchEligibilityApi()`: check nhiều items, fail closed nếu bất kỳ item nào fail

### 2. `src/api/services/fastTrackService.ts` (sửa)
- Thêm method `checkEligibility(projectId, packageId, itemId)`:
  - Mock mode: dùng `isFastTrackEligible` từ data cũ (giữ tương thích)
  - API mode: gọi API-146, fail closed khi API fail
- Trả về `{ eligible, missingReasons }`

## III. VERIFY
- `npx tsc -b`: 0 errors ✅
- Mock fallback giữ nguyên behavior cũ ✅

## IV. LƯU Ý
- UI chưa được cập nhật để gọi `checkEligibility()` thay vì đọc cờ cứng — cần Task D hoặc task riêng
- Khi BE thật sẵn sàng, UI sẽ gọi API-146 trước khi cho phép Fast Track
- Task tiếp theo: Role UI theo ma trận 17_10 (Task D)
