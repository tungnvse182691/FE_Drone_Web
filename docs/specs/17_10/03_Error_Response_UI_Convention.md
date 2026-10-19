# RoadGuard — 03. Error Response và hành vi UI

**Phiên bản:** FE-R3-v1 • **Ngày:** 27/09/2026 • **Trạng thái:** đặc tả đề xuất để FE/BE/QA review, chưa xác nhận triển khai.

## 1. Envelope giữ nguyên OpenAPI

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Chưa đủ dữ liệu để nộp phiên đo.",
  "details": [
    {"field": "measurements[0].evidenceFileIds", "code": "REQUIRED", "message": "Cần ảnh đo cho lỗi này."}
  ],
  "traceId": "example-trace-001",
  "retryable": false
}
```

Tất cả năm field ngoài là required; details có thể rỗng. ErrorDetail.field optional; code/message required. Không tạo thêm envelope `success:false` hoặc `data:null`. API lỗi thường dùng HTTP non-2xx; sync 200 có outcome từng operation là ngoại lệ. Không parse message để điều khiển state.

## 2. Normalization tại HTTP boundary

Adapter trả union local `ApiFailure | TransportFailure | ContractFailure | LocalFailure | Cancelled`; ApiFailure giữ status/header/Error gốc an toàn. Fetch resolve ở HTTP 4xx/5xx nên phải kiểm status, không chỉ catch exception. 204 không parse body. Gateway 502/504 hoặc CORS/network có thể không trả JSON.

Nếu body không phải Error: giữ HTTP status, sinh UI fallback và correlation client, không bịa traceId server. Không đưa HTML proxy ra UI. Nếu 2xx sai schema, `CLIENT_CONTRACT_MISMATCH`, không xem là success/empty; giữ mutation ở UNKNOWN_OUTCOME và đối chiếu. Unknown error code vẫn show message dạng plain text đã kiểm nếu response từ API tin cậy và không phải lỗi nội bộ; lỗi 500/502/504 dùng message trung tính.

## 3. Vị trí hiển thị và dữ liệu cần giữ

| Loại | UI | Giữ / hành động |
|---|---|---|
| Field validation 422 | Inline cạnh field + summary đầu form, focus lỗi đầu | Giữ dữ liệu, file và scroll. Sau sửa chỉ xóa lỗi field liên quan |
| Cross-field/rule 422 | Banner trong form + nút điều hướng đến bước thiếu | Không tự đổi policy/mode/severity |
| 401 | TOKEN_EXPIRED qua single-flight refresh; mã khác theo catalog, một dialog/login cho cả phiên khi cần | Giữ nháp, next-route trong allowlist; không redirect theo URL ngoài |
| 403 | Banner “Bạn không còn quyền thực hiện thao tác này” | Khóa mutation; local chưa sync được cách ly; không xóa bằng chứng |
| 404 | Màn hình không còn khả dụng, về danh sách có quyền | Không khẳng định đã xóa; có thể là scope bị thu hồi |
| 409 STATE_CONFLICT | Dialog tải dữ liệu mới và so sánh | Không gán success hoặc tự force overwrite |
| 412 VERSION_MISMATCH | Màn hình conflict base/local/server | Giữ bản local; quyết định mới mới có key mới |
| 428 PRECONDITION_REQUIRED | Báo lỗi tích hợp và tải version | Không âm thầm dùng wildcard If-Match |
| 429 | Banner đếm ngược, disabled retry đến hạn | Giữ form và cooldown chung, không toast mỗi request |
| 413/415 | Chỉ rõ file không hợp lệ | Giữ bản gốc, chọn file khác; không recompress ảnh chứng cứ âm thầm |
| 500/502/503/504 | Banner tạm thời + mã hỗ trợ nếu có | Phân biệt unknown outcome; retry theo mục08 |
| Offline/transport | Banner kết nối và badge từng mục | “Đã lưu trên máy” chỉ khi durable write thành công |
| Người dùng cancel tải danh sách | Thường không toast | Không coi cancel HTTP là rollback server |

`details.field` dùng đường dẫn request, không đường dẫn label dịch. Với array, giữ bản đồ index gửi → local row ID tại thời điểm gửi. Nếu người dùng reorder array trong lúc request đang chạy, lỗi index cũ phải gắn đúng row ID hoặc hiển thị summary; không gắn nhầm hàng. Field không có trong form hiện tại đưa lên summary. Render text, không innerHTML; không hiển thị giá trị password/token trong lỗi.

## 4. Danh mục lỗi nghiệp vụ cần UI riêng

| Code | Message UI gợi ý / thao tác |
|---|---|
| TASK_MODE_NOT_REPAIRABLE | Nhiệm vụ này chỉ cho phép kiểm tra/đo; lưu kết quả đo và báo PM |
| POLICY_NOT_CONFIGURED / POLICY_DECISION_PENDING | Chưa đủ chính sách để thực hiện; giữ nháp, liên hệ PM |
| FAST_TRACK_NOT_ELIGIBLE | Không đủ điều kiện sửa nhanh; hiển thị reasons, không tự hạ phân cấp |
| PM_REPAIR_BLOCKED | PM đã chặn sửa nhanh; không bỏ chặn cục bộ |
| BEFORE_MISSING | Bổ sung bằng chứng trước sửa; nếu đã sửa thì ghi ngoại lệ, không đổi AFTER thành BEFORE |
| EVIDENCE_PENDING | Ảnh chưa được máy chủ xác minh; chuyển WAITING_FILES |
| FILE_INTEGRITY_FAILED | Tệp kiểm tra không khớp; giữ bản gốc và tải lại phần lỗi |
| OFFLINE_SNAPSHOT_CONFLICT | Nhiệm vụ/chính sách đã thay đổi; giữ bằng chứng, chờ PM xử lý |
| IDEMPOTENCY_KEY_REUSED | Lỗi đồng bộ cần hỗ trợ; không tự đổi key để gửi lại |
| OPERATION_IN_PROGRESS | Đang đối chiếu thao tác trước; retry cùng key khi được phép |
| CASE_HAS_OPEN_REQUIRED_ITEMS | Hồ sơ còn hạng mục chưa hoàn tất; không đóng tổng |
| TELEMETRY_INSUFFICIENT | Thiếu dữ liệu xác định; không hiển thị “Không có lỗi” |
| OUTSIDE_ASSIGNED_SCOPE | Không thuộc phạm vi đã giao; giữ ghi nhận riêng theo quyền |

## 5. Lỗi local tách khỏi lỗi server

Prefix đề xuất `CLIENT_`: STORAGE_FULL, WRITE_FAILED, MEDIA_UNREADABLE, CONTRACT_MISMATCH, CONFIG_INVALID, CLOCK_SKEW. Là client enum, không gửi như domain code BE. Không chuyển lỗi SQLite/IndexedDB thành HTTP500. Thiếu dung lượng: ngừng nhận capture mới khi không thể lưu, không dọn file chưa sync; chỉ cho user chọn dọn bản đã xác minh.

UI success dùng từ cụ thể: “Đã lưu trên máy”, “Đã gửi”, “Máy chủ đã xác minh tệp”, “PM đã kiểm tra”, “Đã nghiệm thu”. Các trạng thái này không thay thế nhau. Screen reader nhận error summary và live region lịch sự; tránh thông báo lặp theo progress.

## 6. Điều kiện retry và logging

`retryable:true` không tự cho phép replay mutation bất kỳ. Cần thêm safe method hoặc key/dedup đã chốt, payload bất biến, quyền hợp lệ và budget. Log gồm HTTP status, code, operation kind, traceId, attempt, latency; redact body PII/credentials/URL. Error catalog được version cùng contract; unknown code có fallback nhưng telemetry báo drift. Chi tiết timeout/rate-limit xem [mục08](08_Rate_Limit_Timeout_Retry.md).

## V2(3) amendment — 2026-09-28

This document follows `planning/V2/V2-3_DECISION_REGISTER.md`. D01-D28 are approved business decisions; `APPROVED_PILOT_CONFIG` and `APPROVED_TARGET` are not empirical verification. The document must distinguish `contractStatus`, `implementationStatus`, and `verificationStatus`. Reporter email/password plus one-time email OTP is the approved authentication flow; web cookie transport, pilot limits, retention and performance values remain configuration/target registers. Fast Track uses measurement-only intake followed by a separately authorized PM repair task; policy framework, reopen, partial publication, handover/conflict, BEFORE incident, curing and traffic release remain explicit contracts. Offline evaluation and AI two-stage processing are proposed until schema, fixtures and runtime/provider evidence pass.
