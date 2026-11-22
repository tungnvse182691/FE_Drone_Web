# Web cookie cho các thao tác FE web: trạng thái theo BE mới nhất (RoadGuardSystem-develop (1), commit 05197e2)

Cập nhật 2026-11-16 sau khi BE phát hành bản mới và `deploy/fe-handoff/SURVEY-V2-WEB-ACTIONS.md`. FE đã chạy bản BE mới bằng Docker (project `roadguard-new`) và kiểm bằng phiên Web PM thật (cookie + CSRF).

## A. Đã xong ở BE mới, FE đã bỏ Bearer tạm và kiểm thử thật bằng cookie
| Thao tác | Route | Kết quả FE đo trên BE mới |
|---|---|---|
| Đọc bộ dữ liệu | `GET /datasets/{id}` | 200 cookie |
| Đọc độ phủ | `GET /datasets/{id}/coverage` | 200 cookie |
| Đọc gói công việc | `GET /survey-tasks/{id}/work-package` | 200 cookie |
| Hủy nhiệm vụ | `POST /survey-tasks/{id}/cancel` | 200 cookie |
| Giao lại Operator | `POST /survey-tasks/{id}/reassign` | 200 cookie |
| Tạo nhiệm vụ bổ sung | `POST /survey-tasks/{id}/supplements` | 201 cookie; nhiệm vụ gốc chuyển `SUPPLEMENT_REQUIRED`, mở nhiệm vụ con bằng `supplementTaskId` |
| Hoãn kế hoạch | `POST /survey-plans/{id}/postpone` | 200 cookie (chỉ `reason`, đúng nhu cầu màn) |
| Danh sách bản nộp theo nhiệm vụ | `GET /survey-tasks/{id}/datasets?limit=25&cursor=` | 200 cookie (`items` + `nextCursor`); FE đã dùng thay cho ô nhập `datasetId`: mặc định mở bản đầu, chọn bản khác bằng ô chọn, hiện "Chưa có bộ dữ liệu" khi rỗng, tải lại trang vẫn lấy đúng danh sách |
| Đã có từ trước | `GET /survey-tasks/{id}`, `GET /survey-plans/{id}`, `GET /projects/{id}/work-package`, tạo kế hoạch/nhiệm vụ V2 (gửi `planId`, `operatorId`) | 200/201 cookie |

Ghi chú một lỗi FE đã sửa nhờ BE kiểm: `supplements` trả 422 `survey_validation_failed` khi FE cho chọn dải khác dải của nhiệm vụ gốc (ví dụ RIGHT_EDGE trong khi bộ dữ liệu đã nộp là SURFACE). Code BE chỉ nhận phạm vi nằm trong bộ dữ liệu đã nộp (`IsDatasetScopeWithinTaskAsync`). FE hiện chỉ cho chọn phân đoạn của nhiệm vụ gốc, giữ nguyên dải. Ví dụ trong `SURVEY-V2-WEB-ACTIONS.md` dùng `RIGHT_EDGE` nên nhờ BE xác nhận ví dụ đó chỉ đúng khi bộ dữ liệu gốc có dải đó.

## B. Đã đóng, không cần BE làm (đã có luồng Web khác)
`GET/PATCH /me` (FE dùng `/profile`); `POST /admin/users/{id}/password-reset` (FE dùng `/users/{id}/password-reset`); 2 route `road-sections/.../survey-plans|survey-requests` và `POST /projects/{id}/survey-plans/{id}/postpone` (FE dùng luồng V2, không có yêu cầu "tạo yêu cầu trước, giao Operator sau").

## C. Còn cần Web cookie (BE mới chưa có; FE đang dùng Bearer tạm `[TEMP-BEARER]`)
Role đo: PM; kết quả đo bằng cookie trên BE cũ là 401 `auth_unauthorized`; trên BE mới các controller dưới đây chưa có `[WebCookieEligible]`: đã đối chiếu code và **Swagger runtime của chính BE mới** (security chỉ có `Bearer`, không có `WebSession`), 28 route khớp hoàn toàn với kết quả 401 FE đo.

| # | Thao tác (màn) | Method path | Role |
|---|---|---|---|
| 1 | Tạo/đọc đánh giá bộ dữ liệu (chi tiết nhiệm vụ → "Bộ dữ liệu") | `POST /datasets/{id}/assessments`, `GET /datasets/{id}/assessments/{assessmentId}` | PM (đọc: PM, Supervisor) |
| 2 | Khóa baseline, xem baseline (cùng khung) | `POST /projects/{id}/baseline-selections`, `GET …/baseline-selections` (có `?segmentSetId=`), `GET …/baseline-selections/{id}` | PM |
| 3 | Job xử lý (cùng khung) | `POST /processing-jobs`, `GET /processing-jobs/{id}`, `POST /processing-jobs/{id}/retry` | PM |
| 4 | Chạy AI mock, chi tiết lần chạy, kết quả, candidate (Nghiên cứu & kiểm định, Dashboard PM) | `POST /projects/{id}/ai-mock-runs`, `GET …/ai-mock-runs/{runId}`, `GET …/ai-mock-runs/{runId}/result`, `GET …/ai-candidates/{detectionId}` | PM (đọc: PM, Supervisor) |
| 5 | Kiểm định đo đạc (Nghiên cứu) | `POST /projects/{id}/validation-runs`, `GET /validation-runs/{runId}` | PM |
| 6 | Lưu trữ: đánh giá, đọc đánh giá, đọc tệp, xác nhận căn cứ, phong tỏa | `POST …/retention/evaluations`, `GET …/retention/evaluations/{id}`, `GET …/retention/files/{fileId}`, `PUT …/retention/files/{fileId}/basis` (Supervisor), `POST …/retention/holds`, `GET …/retention/holds/{id}`, `POST …/retention/holds/{id}/release` | PM / Supervisor |
| 7 | Tải tệp, xem tệp, đăng ký bảo hành (tải tài liệu độ phủ, ảnh bằng chứng, thẻ bảo hành dự án, ảnh khung hình khi gán nhãn) | `POST /uploads`, `GET /uploads/{id}`, `POST /uploads/{id}/part-urls`, `POST /uploads/{id}/complete`, `GET /files/{id}`, `GET /files/{id}/content`, `POST /projects/{id}/warranties` | PM / Supervisor |

Hệ quả khi chưa có cookie: các màn dùng route trên chỉ chạy được sau khi **đăng nhập trong phiên hiện tại** (token Bearer nằm trong bộ nhớ). Tải lại trang (F5) thì các GET như `ai-mock-runs/{id}/result` và `baseline-selections` trả 401 cho tới khi đăng nhập lại; FE hiển thị lỗi, không dùng dữ liệu giả. Smoke trên BE mới: trang `/pm/dashboard` và `/pm/research-validation` báo 401 đúng ở các route này khi tải trực tiếp.

## D. Nguồn `datasetId` (đã xử lý ở BE mới)
- BE đã thêm `GET /survey-tasks/{taskId}/datasets` (commit 05197e2). FE lấy `taskId` từ bản ghi nhiệm vụ, gọi danh sách, mặc định mở bản đầu (mới nhất), gọi `GET /datasets/{id}` và `/coverage` cho bản đang chọn; đổi bản thì tải lại chi tiết và độ phủ. Đã bỏ ô nhập mã và nút gợi ý từ baseline; không còn hằng số `datasetId` trong luồng đang chạy.
- Đã kiểm trên BE mới: nhiệm vụ có 1 bản nộp, F5 vẫn đúng, nhiệm vụ chưa nộp hiện "Chưa có bộ dữ liệu". **Đã kiểm thêm nhiều bản:** nhiệm vụ có 29 bản (chèn SQL vì API không cho nộp lần 2): trang 1 trả 25 bản mới nhất trước kèm `nextCursor`; FE mặc định chọn bản 29, đổi sang bản 26 tải lại đúng chi tiết + độ phủ, "Tải thêm" nạp nốt 4 bản (tổng 29) và giữ nguyên bản đang chọn.
- Nhận xét cho BE: sau khi nộp, nhiệm vụ `SUBMITTED` không giao lại/nhận lại được (409) và nhiệm vụ gốc đã có nhiệm vụ con thì không nộp thêm, nên một nhiệm vụ gần như luôn chỉ có 1 bản qua API; nhờ BE xác nhận nhiều bản có phát sinh từ luồng nào không (phục vụ câu hỏi nghiệp vụ ở `CAN-XAC-NHAN-CHON-BAN-NOP-DATASET.md`).
- Quy tắc chọn bản để đánh giá/khóa baseline vẫn chờ chủ nghiệp vụ chốt: FE hiện dùng bản đang chọn trên giao diện. Nội dung cần xác nhận: `docs/integration/CAN-XAC-NHAN-CHON-BAN-NOP-DATASET.md`.
- FE vẫn phải nhập tay `modelVersionId` (job/AI mock): nhờ BE cho API danh mục mô hình.

## E. Từng sửa tạm khi kiểm thử
Từng sửa tạm khi kiểm thử; chưa xác nhận đã có trong BE chính thức. Nhờ BE kiểm và bổ sung nếu còn thiếu.

- Các route cookie đã thêm tạm ở bản BE cũ (nay BE mới vẫn chưa có, nằm trong mục C): `GET ai-mock-runs/{runId}/result`, `GET ai-candidates/{detectionId}`, `GET baseline-selections`, `GET retention/evaluations/{id}`, `POST retention/holds`, `GET retention/holds/{id}`, `POST retention/holds/{id}/release`, `GET retention/files/{fileId}`.
- Trong các bản BE mới (`RoadGuardSystem-new` và `RoadGuardSystem-develop (1)`), FE chỉ sửa `deploy/fe-handoff/demo_ai.py`: thêm bước `POST /road-geometry-drafts/{id}/submit` trước `confirm` (scenarios báo `RuntimeError`/412 khi thiếu bước này, giống bản BE cũ). Nhờ BE kiểm và cập nhật script chính thức.
- Bản `RoadGuardSystem-develop (1)` cập nhật lúc 18:24 có `global.json` yêu cầu SDK 9.0.321 nhưng `deploy/fe-handoff/Dockerfile.Handoff` vẫn dùng `dotnet/sdk:10.0.401` nên Docker build lỗi ("Requested SDK version: 9.0.321"). FE sửa tạm Dockerfile thành `dotnet/sdk:9.0`; sau đó build lộ lỗi biên dịch `CS1998` (warnings-as-errors) ở `RoadGuardSystem.Repositories/Implementations/Warranties/WarrantyPersistenceService.cs` (`CreateAggregateAsync` không có `await`), FE thêm `await Task.CompletedTask;` trước câu `return`. Nhờ BE sửa chính thức cho khớp SDK và bỏ cảnh báo này.

## Cách sửa (mỗi route một dòng)
```csharp
[RoadGuardSystem.API.Authentication.WebCookieEligible]
[HttpGet("datasets/{datasetId:guid}/coverage")]
```
Không đổi policy/role/route; giữ nguyên CSRF, `Idempotency-Key`, `If-Match` của các POST. Khi BE xong, FE xóa dòng tương ứng trong khối `[TEMP-BEARER]` (`src/api/devFileBearer.ts`).
