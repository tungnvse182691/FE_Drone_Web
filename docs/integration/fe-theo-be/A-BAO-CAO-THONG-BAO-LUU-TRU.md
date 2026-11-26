# Nhóm A — Dashboard, báo cáo, thông báo, kiểm toán, lưu trữ (FE theo BE) — 2026-11-19

Nguyên tắc: BE có gì thì FE làm đúng logic đó; không có API BE thì không dựng; FE thừa thì xóa. Căn cứ: `HoangHaiWarrantySystem-Official` (05_Web SUP-09/10, PM-12; 02_Business-Workflows/10; 04_API-Contracts/02_Full-API-Catalog) và `openapi.json` mới (298 thao tác).

## Đã xóa (FE thừa — không có API BE đứng sau)
| Phần xóa | Lý do |
|---|---|
| Dashboard Giám sát: bộ lọc **Kỳ**, **Khu vực**, nút "Áp dụng", **Xuất báo cáo RPT-01** + modal xuất, **bản đồ rủi ro** + bảng danh mục rủi ro (`DashboardRiskMap/RiskMapTable/RiskTable/ExportModal`, `types.ts`, toàn bộ mã MapLibre trong hook) | BE không có API dashboard rủi ro/khu vực/kỳ; dữ liệu rủi ro từng là mảng rỗng cố định |
| **Nhật ký hoạt động**: lọc vai trò, lọc loại hành động/đối tượng, ngăn chi tiết trước-sau/lý do/ảnh, modal xuất PDF/CSV, `auditService`, thư mục `audit-trail/` | BE chỉ có `GET /projects/{p}/reports/timeline` (eventId, occurredAt, actorDisplay, action, summary, source); không có vai trò, lý do, trạng thái trước-sau, ảnh, hay API xuất nhật ký |
| **Lưu trữ**: luồng "yêu cầu xóa dữ liệu" (thẻ danh sách, modal tạo, modal chi tiết, duyệt/từ chối, `requestDeletion/decideDeletion`) | BE không có luồng yêu cầu/duyệt xóa (xóa dữ liệu bị cấm theo thiết kế); service từng chỉ `throw` |
| Tab **Mô hình AI & Đánh giá** (+ `AIModelsTab`, `aiModels`) | BE không có API danh mục/phiên bản mô hình AI |
| `SystemControlModals.tsx`, `DefectCatalogModal.tsx` | Mã chết, không ai dùng |
| Phân tích rủi ro: bộ chọn **luồng** (Fast Track/Thẩm duyệt/Khẩn cấp), `computeProjectMetrics` (cộng/trừ số tự đặt như +12.5%), thanh tiến độ %/ETA/dung lượng/nút hủy của export | BE export job chỉ có status QUEUED/RUNNING/SUCCEEDED/FAILED, không phân loại luồng, không phần trăm, không lệnh hủy |
| Thông báo: **tab loại** (Cần xử lý/Bàn giao/AI/Hiện trường), ưu tiên **EMERGENCY**, **cấu hình âm thanh/còi**, thẻ **SLA giờ còn lại** tự dựng (`NotificationsHeader/FilterBar/SlaWidgets/AudioConfigModal`) | BE: `priority` chỉ HIGH/NORMAL/UNKNOWN; không có phân loại tab; hạn thật nằm ở `scope.deadlines` |

## Đã thêm/sửa theo BE
| Việc | Căn cứ |
|---|---|
| Dashboard Giám sát chỉ còn thẻ có API: dự án ACTIVE (`GET /projects`), **tổng chiều dài tuyến**, **dự án sắp hết hạn ≤30 ngày** (từ `warranties[].endDate`), **khiếm khuyết đang mở** (`OpenDefectMetric defect.open.v2`) — đều từ `GET /projects/overviews` (lô ≤100); giữ báo cáo tổng hợp `reports/summary` (repairItemsByStatus) và hoạt động gần đây `reports/timeline`. `INCOMPLETE/MISSING` hiển thị "—", không cộng thiếu | SUP-10 / PM-12; docs BE `WEB-PM-SUPERVISOR-COMPLETION.md` §3, §7 |
| Nhật ký hoạt động viết lại: lọc dự án + khoảng thời gian (from/to UTC) + tìm theo chữ; bảng và chi tiết chỉ các trường timeline; cảnh báo khi `availability` ≠ AVAILABLE kèm reasonCodes | API reports/timeline |
| Thông báo viết lại gọn: danh sách `GET /notifications`, mức ưu tiên do máy chủ tính (CAO/THƯỜNG/CHƯA XÁC ĐỊNH), lọc ưu tiên/chưa đọc/tìm; đọc từng cái `POST /{id}/read` (If-Match), đọc cả lô `POST /notifications/read-batch`; "Xem chi tiết và phạm vi" nạp `GET /{id}` + `/{id}/scope` (title, senderKind, `deadlines[]` hiển thị hạn/đã hoàn tất); giữ `DutyPanel` (receiving-requests + clocks) | SUP-09, PM-12; BE-doc §4, §11 |
| Retention: tab chỉ còn Phong tỏa pháp lý (holds: tạo, gỡ với If-Match) + chi tiết dự án (đánh giá lưu trữ `retention/evaluations`, cơ sở lưu trữ theo tệp `files/{id}/basis`); danh mục loại hư hỏng: PM đọc, Giám sát quản trị (admin API) | docs 08_Storage_Operations/02, 10_Notifications…; `catalog/defect-types[/admin]` |

## Còn thiếu do BE
- Không có API liệt kê lệnh phong tỏa (`GET /retention/holds` chỉ theo id) → FE vẫn phải nhớ `holdId` trong `sessionStorage` cho lệnh tạo từ giao diện; lệnh tạo nơi khác không thấy/gỡ được.
- Không có API dashboard rủi ro/khu vực/kỳ, danh sách đoạn rủi ro, nhật ký kiểm toán riêng (vai trò, lý do, trước-sau), xuất nhật ký, tiến độ/hủy export, mô hình AI, yêu cầu xóa dữ liệu.
- `reports/timeline` thiếu tên người thực hiện khi `actorDisplay = null`.

## Chưa kiểm
- Chưa chạy trình duyệt/E2E cho các màn trên (theo ràng buộc nhiệm vụ); chỉ `tsc --noEmit` (0 lỗi) và `vite build` (đạt).
- Chưa kiểm `read-batch` với >100 thông báo; chưa kiểm hiển thị `scope.deadlines` với dữ liệu thật (DB thử chưa có thông báo).
- `ResearchValidation.tsx` còn state `isExporting` không dùng (không ảnh hưởng).
