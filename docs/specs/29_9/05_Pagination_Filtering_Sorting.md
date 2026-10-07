# RoadGuard — 05. Pagination / Filtering / Sorting

**Phiên bản:** FE-R3-v1 • **Ngày:** 27/09/2026 • **Trạng thái:** đặc tả đề xuất để FE/BE/QA review, chưa xác nhận triển khai.

## 1. Baseline hiện có: cursor pagination

```http
GET /api/v1/me/inspection-tasks?limit=25
GET /api/v1/me/inspection-tasks?limit=25&cursor=<opaque-url-encoded>
```

```json
{"items": [], "nextCursor": null, "asOf": "2026-09-26T18:00:00Z"}
```

limit là integer 1–100, default 25 theo contract đề xuất R3, chưa phải kết quả benchmark. Không có `page`, `offset`, `total`, `totalPages`. Cursor opaque, encode bằng URLSearchParams; không decode/chỉnh/cộng số. Không gửi `cursor=null` dạng chuỗi. Khi nextCursor null thì hết trang, dù items rỗng hoặc ít hơn limit không tự suy thêm nếu server vẫn có cursor.

Các list hiện có: notifications, projects, project crews, reports của mình, project cases/defects, dataset coverage, project timeline, audit-events, defect-type catalog, me inspection-tasks/repair-items/survey-tasks, admin processing-jobs. Xem `contracts/operation_catalog.md` để biết operationId/path chính xác. Dashboard có asOf/periodFrom/periodTo; không gán các query đó cho list API khác.

## 2. Hành vi FE

- Cache key gồm environment, actor, project/scope, resource, filter/sort đã chuẩn hóa. Cursor là param của từng page, không trộn page giữa account.
- First load skeleton; load more dùng spinner cuối danh sách và giữ trang đã có; lỗi load more có retry riêng. Empty state chỉ sau response valid, không dùng khi 403/network/schema error.
- Một request load-more đang chạy cho mỗi danh sách. Hủy request cũ khi query thay; request về trễ bị bỏ bằng generation guard.
- Đổi filter/sort/scope/limit: clear cursor chain, về trang đầu; không dùng cursor của query cũ. Trở lại màn hình có thể dùng cache có nhãn asOf rồi revalidate.
- Dedupe items theo id; không sort phiên bản bằng version string. Nếu item xuất hiện nhiều lần và không có sequence server tin cậy, invalidate/reload theo snapshot contract; không lấy version lexical lớn nhất.
- Cuộn vô hạn dùng virtualized list khi cần; keyboard có nút “Tải thêm”. Không hiển thị “trang 3/10” khi không biết tổng.
- Export là luồng server có quyền, không xuất toàn bộ bằng cách lấy những trang user đã scroll rồi gọi là toàn bộ.

## 3. Đề xuất semantics BE cần freeze — FE-GAP-04

Các tham số filter/sort dưới đây **chưa có trong baseline YAML**, không gửi thật trước khi cập nhật contract. Dùng để thiết kế controls/mock có nhãn.

| Nhóm | Filter đề xuất | Sort đề xuất, cần DTO/read model hỗ trợ |
|---|---|---|
| Tasks của tôi | status, projectId | assignedAt desc rồi id asc |
| Defects trong project | status, defectTypeCode, severity | updatedAt desc rồi id asc |
| Cases trong project | status, priority | createdAt desc rồi id asc |
| Reports của tôi | publicStatus | createdAt desc rồi id asc |
| Notifications | unreadOnly | occurredAt desc rồi id asc |
| Jobs quản trị | status, jobType | createdAt desc rồi id asc |

Đề xuất encoding: `status=OPEN&status=IN_PROGRESS` cho multi-value; `sort=updatedAt:desc,id:asc`; `q` trim cho text search khi endpoint có support; `from` inclusive và `to` exclusive UTC. Các tên status/field ví dụ phải map enum/cột đã chốt, không tạo enum mới. Không hỗ trợ free-form SQL hoặc field tùy ý. Invalid filter/sort trả422 với details.field đúng query name, unknown query cần policy thống nhất.

Order phải stable và có unique tie-breaker; cursor bound actor/scope/filter/sort/asOf, chống sửa. `asOf` là thời điểm snapshot của chuỗi trang nếu BE hỗ trợ snapshot; gốc chưa mô tả isolation đầy đủ, không hứa snapshot-consistency trước khi FE-GAP-04 được chốt. Cursor hết hạn/không hợp lệ cần mã lỗi riêng đề xuất CURSOR_EXPIRED/CURSOR_INVALID (422); FE giữ vị trí tương đối và tải lại trang đầu, không vòng retry cursor cũ.

## 4. Filter local khi offline

Chỉ lọc tập đã tải, nhãn “Trong dữ liệu đã tải trên thiết bị”. Số lượng là local subset, không tổng project. Đổi filter online→offline không được đưa ra kết luận không có nhiệm vụ nếu chưa tải đủ. Local sort chỉ presentation, không ghi thay đổi thứ tự công việc do PM lưu. Offline search không gọi API và không làm queue command. Map bbox filtering/cluster cần contract riêng; không giả tất cả defects đã có từ page đầu.
