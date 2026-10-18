# Đối chiếu tài liệu 17_10 (nhóm trưởng) — Web Frontend

**Ngày:** 2026-10-19  
**Người thực hiện:** Muse (TommyNe) theo yêu cầu của Nguyễn Văn Tùng  
**Phạm vi:** nhánh `tung` của `FE_Drone_Web`

## Nguồn tài liệu

| Bộ | Vị trí | Trạng thái |
|----|--------|------------|
| **29_9 (cũ)** | `docs/specs/29_9/` trên nhánh này | Đang dùng làm spec chính |
| **17_10 (mới nhất)** | `HoangAnhVu2207/RoadGuardSystem` nhánh `huy-review`, thư mục `docs/HoangHaiWarrantySystem-Official/` (92 file .md) | Nhóm trưởng phát hành 15/10/2026, Phase 5 docs QA |

## Tóm tắt thay đổi 17_10 ảnh hưởng Web

### 1. Kiến trúc & Auth (05_Web/01)
- Web dùng **cookie + CSRF** (API-013→017), không dùng Bearer token trên browser
- Flow: CSRF bootstrap → login → session → renew (renewal cookie + CSRF) → logout
- 401: renew 1 lần rồi retry nếu idempotent; 403: hiển thị denial, không giấu

### 2. Ma trận màn hình (05_Web/02, 03)
- **10 màn Supervisor** (SUP-01→SUP-10), **13 màn PM** (PM-01→PM-13)
- 253 mapping màn hình–API, phân loại:
  - `READY_BY_SOURCE` (149): implement được
  - `WRONG_ROLE_REMOVED` (55): **tuyệt đối không expose UI**
  - `TRANSPORT_BLOCKED` (43): Bearer-only, Web chưa gọi được

### 3. Điểm khác biệt chính vs 29_9
| # | 29_9 (cũ) | 17_10 (mới) |
|---|-----------|-------------|
| 1 | Reporter trên Web | **Reporter chỉ trên Mobile** (Web: Supervisor/PM) |
| 2 | Bảng 13 error code cứng | **ProblemDetails** per-operation, BE là authoritative |
| 3 | Fast Track threshold cứng (S≤1.0m²...) | **Server-driven** qua API-146, FE đọc eligibility, fail closed |
| 4 | Upload đơn giản | **Multipart 4 bước** (8MiB/part, 24h session, poll đến VERIFIED) |
| 5 | Supervisor quản lý user/project | Nhiều op **TRANSPORT_BLOCKED** (tạo project, sửa user, reset pass, invitation) |

### 4. Phân quyền quan trọng
- **SUP-06** (Candidate/defect oversight): **không có API nào** — tất cả PM-only
- **PM-09**: PM **không được approve** item (API-142 Supervisor-only)
- **PM-10**: Fast Track PM chốt cuối, Supervisor chỉ xem (informational)
- **Không làm màn Reporter trên Web**

## Trạng thái áp dụng (19/10/2026)

### Đã làm (không đụng logic)
- ✅ Fix mojibake 4 file accept-invitation (text encoding)
- ✅ Xóa label dev "Màn 14" ở AssignCrew
- ✅ Rà soát UI các màn chính

### Chưa làm (cần anh quyết)
Các gap dưới đây đụng tới logic hiện tại, cần anh duyệt hướng xử lý:
1. **Auth transport**: chuyển Bearer → cookie/CSRF (ảnh hưởng toàn bộ API calls)
2. **Error handling**: chuyển sang ProblemDetails per-operation
3. **Fast Track**: gọi API-146 thay vì cờ cứng `isFastTrackEligible`
4. **Role UI**: ẩn/hiện nút theo ma trận 17_10 (SUP-04, SUP-06, SUP-10...)

**Lưu ý:** Phần bản đồ (MapLibre) không bị ảnh hưởng — logic vẽ giữ nguyên.

## Tài liệu tham khảo chi tiết
- Phân tích gap đầy đủ: `~/workspace/roadguard-web-tung/17_10-GAP-ANALYSIS.md`
- API catalog: `04_API-Contracts/02_Full-API-Catalog.md` (241 operations)
- Web matrices: `05_Web/02_Supervisor-Screen-API-Matrix.md`, `05_Web/03_PM-Screen-API-Matrix.md`
