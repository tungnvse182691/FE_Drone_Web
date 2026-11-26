# Web PM — Chọn loại lỗi và giao khảo sát

## Đọc loại lỗi cho KEEP_NEW

Gọi `GET /api/v1/catalog/defect-types` bằng phiên Web PM với `credentials: "include"`. Bearer của PM cũng được hỗ trợ. Đây là danh mục dùng chung. GET không cần CSRF hay project ID. BE trả `200` với mảng các loại lỗi active, sắp theo `code`. Ví dụ dưới đây dùng dữ liệu minh họa.

```json
[
  { "code": "SURFACE_CRACK", "name": "Nứt mặt đường" }
]
```

Hiển thị `name` và gửi nguyên `code` vào `classification.defectTypeCode` của `POST /api/v1/projects/{projectId}/candidate-decisions` khi chọn `KEEP_NEW`. Quyền ghi và các điều kiện của quyết định vẫn do API-059 kiểm tra theo project. Nếu loại lỗi đã mất hiệu lực sau khi tải danh mục, API-059 trả `400 validation_error`. Tải lại danh mục và giữ dữ liệu form để PM chọn lại. Mảng rỗng `[]` nghĩa là chưa có mục active. GET trả `401` nếu phiên thiếu hoặc hết hiệu lực và `403` nếu tài khoản không phải PM.

Nguồn dữ liệu đã đối chiếu trong repo gồm Development Seeder với `RG_POSTMAN_POTHOLE` và cấu hình Docker handoff cô lập với `CRACK`, `POTHOLE` khi `HandoffBootstrap` chạy và `Anh02:MockEnabled` được bật. Các nguồn này chỉ dành cho dev/test. Điều kiện nghiệm thu còn mở là xác nhận DB mà FE đang gọi có mã active từ danh mục vận hành đã duyệt.

QT03 mô tả Supervisor quản lý danh mục và ngừng dùng mục cũ để giữ lịch sử. QT04 nói về bộ quy tắc phân mức và dung sai có phiên bản. Phạm vi quản trị danh mục của Supervisor chờ chốt riêng.

## Tạo kế hoạch rồi giao Operator

PM cần quyền hiện hành trong dự án. Lấy ID tuyến, segment set và segment từ dữ liệu của dự án. Lấy `operatorId` từ tài khoản Operator đã được gắn vào dự án.

1. Đăng nhập qua `/api/v1/auth/web/login` theo [hướng dẫn Web auth](FE-AUTH-AND-CLIENT-GUIDE.md). Sau đăng nhập gọi `GET /api/v1/auth/web/csrf` với `credentials: "include"` và lấy `requestToken`.
2. Cả hai POST gửi `credentials: "include"`, `Content-Type: application/json`, `X-CSRF-TOKEN` bằng token vừa lấy và một `Idempotency-Key` cho từng thao tác. Hai POST tạo mới không dùng `If-Match`. Khi timeout, retry cùng path, body và key. Có thể lấy CSRF mới cho phiên hiện tại trước khi retry. Bearer dùng `Authorization: Bearer <token>` và `Idempotency-Key`.

**POST `/api/v1/projects/{projectId}/survey-plans`**

```json
{
  "scope": [
    {
      "routeVersionId": "22222222-2222-4222-8222-222222222222",
      "segmentSetId": "33333333-3333-4333-8333-333333333333",
      "segmentIds": ["44444444-4444-4444-8444-444444444444"],
      "targetBand": "SURFACE"
    }
  ],
  "plannedAt": "2026-12-01T08:00:00Z",
  "surveyType": "BASELINE"
}
```

Response `201 Created` kèm `Location: /api/v1/survey-plans/{id}` và `ETag: "AAAAAAAAAAE="`.

```json
{
  "id": "55555555-5555-4555-8555-555555555555",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "scope": [
    {
      "routeVersionId": "22222222-2222-4222-8222-222222222222",
      "segmentSetId": "33333333-3333-4333-8333-333333333333",
      "segmentIds": ["44444444-4444-4444-8444-444444444444"],
      "targetBand": "SURFACE"
    }
  ],
  "plannedAt": "2026-12-01T08:00:00+00:00",
  "status": "PLANNED",
  "version": "AAAAAAAAAAE="
}
```

**POST `/api/v1/projects/{projectId}/survey-tasks`**

Dùng `id` từ response tạo plan làm `planId`. Gửi cùng loại khảo sát và scope tương thích với plan trong cùng dự án.

```json
{
  "planId": "55555555-5555-4555-8555-555555555555",
  "scope": [
    {
      "routeVersionId": "22222222-2222-4222-8222-222222222222",
      "segmentSetId": "33333333-3333-4333-8333-333333333333",
      "segmentIds": ["44444444-4444-4444-8444-444444444444"],
      "targetBand": "SURFACE"
    }
  ],
  "surveyType": "BASELINE",
  "operatorId": "66666666-6666-4666-8666-666666666666",
  "dueAt": "2026-12-03T17:00:00Z",
  "accessPoint": null
}
```

Response `201 Created` kèm `Location: /api/v1/survey-tasks/{taskId}` và `ETag: "AAAAAAAAAAI="`.

```json
{
  "id": "77777777-7777-4777-8777-777777777777",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "scope": [
    {
      "routeVersionId": "22222222-2222-4222-8222-222222222222",
      "segmentSetId": "33333333-3333-4333-8333-333333333333",
      "segmentIds": ["44444444-4444-4444-8444-444444444444"],
      "targetBand": "SURFACE"
    }
  ],
  "operatorId": "66666666-6666-4666-8666-666666666666",
  "status": "NEW_ASSIGNED",
  "version": "AAAAAAAAAAI=",
  "supplementTaskId": null
}
```

Task lưu liên kết plan ở BE. Response task V2 cung cấp `id` và `operatorId` để FE kiểm giao việc. Các trường `planId`, `dueAt` và `accessPoint` thuộc request và không có trong response này.

Sau khi tạo, gọi GET trên hai path danh sách theo project, tìm `id` trong `items` và theo `nextCursor` nếu cần. Mở chi tiết từ `Location` hoặc gọi `GET /api/v1/survey-plans/{id}` và `GET /api/v1/survey-tasks/{taskId}`. Cả bốn GET dùng Web session với `credentials: "include"` và không cần CSRF. Task list và detail trả `operatorId`. Sau khi tạo task gắn với plan, plan chuyển sang `IN_PROGRESS` và có version mới. Dùng version đọc lại nếu cần thao tác tiếp trên plan.

`GET /api/v1/projects/{projectId}/survey-plans?limit=20` trả `200`.

```json
{
  "items": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "projectId": "11111111-1111-4111-8111-111111111111",
      "plannedAt": "2026-12-01T08:00:00+00:00",
      "status": "IN_PROGRESS",
      "version": "AAAAAAAAAAM="
    }
  ],
  "nextCursor": null
}
```

`GET /api/v1/projects/{projectId}/survey-tasks?limit=20` trả `200`.

```json
{
  "items": [
    {
      "id": "77777777-7777-4777-8777-777777777777",
      "projectId": "11111111-1111-4111-8111-111111111111",
      "operatorId": "66666666-6666-4666-8666-666666666666",
      "status": "NEW_ASSIGNED",
      "version": "AAAAAAAAAAI=",
      "supplementTaskId": null
    }
  ],
  "nextCursor": null
}
```

Khi còn trang, gửi nguyên `nextCursor` trong query `cursor` của danh sách tương ứng. Hai GET chi tiết trả `200` với các trường trong response tạo tương ứng, gồm `scope` đầy đủ và `ETag` hiện tại. Giá trị trạng thái và version phản ánh lần đọc.

| HTTP | FE xử lý |
| --- | --- |
| `201` | Tạo hoặc replay thành công. Dùng `id`, `Location` và `ETag` từ response. |
| `400` | JSON hoặc DTO sai. Hiển thị lỗi field nếu có. |
| `401` | Phiên thiếu, hết hiệu lực hoặc không hợp lệ. |
| `403` | `csrf_failed` khi token hoặc cookie CSRF sai. `access_forbidden` khi thiếu quyền PM trong dự án. |
| `404` | Xử lý `project_not_found` hoặc `identity_user_not_found` theo ProblemDetails. |
| `409` | `duplicate_request` có thể là key dùng lại với body khác hoặc xung đột dữ liệu, gồm scope/plan không tương thích. |
| `422` | `survey_validation_failed` khi payload không qua kiểm tra nghiệp vụ. |
| `428` | `validation_error` do thiếu `Idempotency-Key`. |

OpenAPI của API đang chạy nằm ở `/swagger/v1/swagger.json` khi Swagger được bật. [Danh sách Web và GET chi tiết](FE-APPROVED-COLLECTIONS.md)
