# Bearer tệp tạm cho dev/test — b89a52f

Theo chỉ định của Hoàng: cookie/CSRF vẫn là transport chuẩn; chỉ các endpoint tệp dưới đây dùng Bearer khi bật opt-in **và** Vite DEV **và** trình duyệt ở localhost/127.0.0.1/[::1]. Production hoặc host khác không bật được, kể cả đặt biến true.

Đã bật tại máy hiện tại trong `.env.development.local` (Git ignored): `VITE_DEV_FILE_BEARER=true`. Để tắt, bỏ biến hoặc đặt false rồi khởi động lại dev server. Không sửa `.env` hiện có, không đưa tài khoản/token vào cấu hình.

## Endpoint dùng tạm

| Method | Endpoint | Lý do / kiểm chứng |
| --- | --- | --- |
| POST | `/api/v1/uploads` | Tạo phiên DOCUMENT. UploadsController b89a52f:28 chưa WebCookieEligible. POST nghiệp vụ thật NOT_RUN. |
| GET | `/api/v1/uploads/{uploadId}` | GET receipt/status/ETag; controller:51 chưa hỗ trợ cookie. Kiểm bằng transport mô phỏng. |
| POST | `/api/v1/uploads/{uploadId}/part-urls` | Liên kết phần tải, key cố định theo phiên/part; controller:72. Signed URL chỉ trong RAM, không vào journal. Chưa chạy thật. |
| POST | `/api/v1/uploads/{uploadId}/complete` | Complete DTO đúng `parts[].partNumber`, **`parts[].eTag`**, `checksumSha256`; giữ key/body/If-Match. Controller:108. Chưa chạy thật. |
| GET | `/api/v1/files/{fileId}` | Controller:126. Trước đây cùng tệp bằng cookie trả 401; nay PM-A và Sup đăng nhập qua form, dùng đúng actor Bearer, đều **200 VERIFIED** cho tệp `7678ee35-75d5-4d39-8059-49f75b0feec8`. |
| GET | `/api/v1/files/{fileId}/content` | Controller:143 chưa hỗ trợ cookie. Route transport đã kiểm; tải nội dung runtime chưa chạy. |

Không đổi transport policy/draft/publish/revoke, road-coverage, assign, cases, FIELD commands hoặc export. Không có logic đổi sang Bearer khi 401/403. Không cho caller tự gắn Authorization. Absolute URL ngoài allowlist hoặc baseURL ngoài loopback không nhận credential tạm. Cancel/delete và các endpoint khác không nằm trong allowlist tạm này.

Nguồn: `UploadsController.cs` và `WebCookieConfiguration.cs` tại revision **b89a52fe11ed146f197f3f94e115530b9b75afb0**; Candidate3/OpenAPI các DTO UploadSessionResponseDto, UploadPartUrlsRequestDto, UploadCompleteRequestDto, CompletedUploadPartDto, FileMetadataResponseDto. Docker OCI revision được kiểm lại trước sửa. Không thay BE.

## Cấp và xóa credential

- Người dùng đăng nhập bằng form hiện có: Web login + GET session vẫn chạy như trước. Chỉ khi opt-in và không must-change-password, dùng **chính email/password vừa nhập** để POST `/auth/login`; không đọc tài khoản mẫu để cấp token thay người dùng.
- Chỉ giữ accessToken sau khi response user ID/role khớp Web và Bearer GET `/me` xác nhận cùng ID/role. Hai endpoint auth này chỉ phục vụ cấp/xác minh credential, không chuyển các caller `/me` bình thường sang Bearer.
- Token chỉ trong biến module RAM, không Zustand token field, storage, journal, Git hoặc log. Không giữ password/refreshToken. Logout, expire, đổi account/role/epoch và invalidation từ tab khác xóa token. Phản hồi cấp token cũ đến muộn bị loại.
- Nếu CSRF bootstrap đang gắn vào cookie cũ còn hợp lệ nhưng login trả `403 csrf_failed`, FE kiểm GET session, logout cookie bằng CSRF đúng subject, lấy CSRF anonymous mới rồi thử Web login đúng một lần. Không bỏ guard hoặc chuyển Web login sang Bearer; không retry lỗi credential/403 khác. Nhánh này được phát hiện và kiểm runtime khi đăng nhập lại sau local invalidation.
- Cấp credential tạm có timeout 15 giây và bị abort khi đổi phiên/logout; không giữ màn đăng nhập chờ vô hạn vì endpoint phụ.
- Cookie login vẫn dùng được nếu credential tạm không cấp được. Request tệp sẽ báo cần đăng nhập lại; không mượn token khác, không thử cookie sau Bearer 401/403, không tự refresh/retry mutation. Authorization bị xóa khỏi response/error config trước khi trả cho caller để tránh bị log qua AxiosError.
- **F5 làm mất token RAM**. Phiên cookie vẫn đọc được các API chuẩn; để dùng tệp tạm, đăng nhập lại bằng form. Chưa có WebSession→Bearer exchange trên runtime nên không tự tạo credential sau reload.

## Tệp căn cứ Sup

Giữ modal hiện có, thêm file input và nút Tải tệp căn cứ trong dev opt-in. Người dùng tự chọn PDF/JPEG/PNG và tự bấm; không tự tải tệp test trong browser.

Pipeline: checksum từ byte tệp → POST uploads cùng key → GET session/ETag → phần tải theo partSizeBytes server → PUT signed URL bằng bytes cùng part (không gửi cookie/Bearer) → complete cùng key/body/ETag → GET session → GET metadata đối chiếu VERIFIED/checksum/size/ETag → GET lại road-coverage. Không báo thành công chỉ vì POST 201/202. VERIFYING yêu cầu chọn lại cùng tệp để GET đối chiếu. Journal tách actor/project, không lưu byte tệp, token hoặc signed URL.

Resource receipt tạo/complete chỉ GET đối chiếu, không POST lại. Khi mất response create/complete, giữ nguyên key/body/version. Signed part-URL là capability ngắn hạn, không phải receipt tạo tài nguyên: khi tiếp tục cần nhận lại capability bằng **cùng key và part number**. PUT cùng part chỉ dùng lại chính bytes có checksum đã ghi; không tự thay tệp. Nếu URL đã hết hạn, dừng với tiến độ cũ và thông báo; chưa tự tạo key/phiên thay thế. **Hết hạn link, CORS/MinIO và worker VERIFYING chưa được nghiệm thu runtime** vì không được chạy upload thật trong lượt này.

Tệp VERIFIED chỉ chứng minh lưu trữ/byte đúng, chưa phải hồ sơ đã đối chiếu ngoài thực tế hoặc HANDOVER được chấp nhận. Tải DOCUMENT tạo nguồn căn cứ bảo trì khi BE đã xác minh; **không** bổ sung FileId vào HandoverDocument cũ. Read contract checklist và endpoint gắn/chấp nhận bàn giao vẫn thiếu như [source audit](FASTTRACK-SOURCE-AUDIT-20261116.md); Bearer không giải quyết hai chỗ đó.

## Kiểm đã chạy

- **8 nhóm transport/auth PASS**: DEV opt-in/host/production, allowlist exact method/path, đúng ID/role qua GET me, hết hạn/token cũ, actual authStore login/logout/đổi account, cookie CSRF không đổi, file 401/403 không retry/fallback, không serialize Authorization trong error.
- **5 nhóm uploader/component PASS**, transport mô phỏng: input file → payload/part/eTag đúng DTO → receipt/GET; VERIFYING không thành công giả; create/complete timeout giữ identity; receipt chỉ GET; file/role sai chặn trước POST; journal không chứa credential/capability.
- Fast Track: **23 nhóm form, 15 service/journal, 16 validator/domain BE thực PASS**; thêm **8 nhóm FIELD read, 12 nhóm export PASS**, không mutation runtime. Build/typecheck/diff-check chạy sau sửa.
- Browser: PM/Sup GET metadata tệp 200 bằng transport tạm; Sup GET road-coverage 200 bằng cookie (`devFileBearer=false`). Token PM cũ không được lấy sau chuyển Sup. Form Sup chọn TXT báo lỗi đúng trước API, **không có POST uploads**. Ảnh: `artifacts/fasttrack-dev-bearer/sup-upload.png`.
- Chưa chạy mutation PM/Sup: không create/update/publish/revoke policy, upload/complete, confirm coverage hoặc assign Crew. Chỉ Reporter được tạo 3 bộ demo theo yêu cầu ở mục dưới.

## Ba bộ Reporter demo đã tạo thật qua API local

Đúng tài khoản **reporter-a / REPORTER**, access token chỉ trong process RAM. Đã GET dữ liệu có sẵn trước khi tạo và tái dùng tệp synthetic Reporter-owned `41ee9633-dcc6-4256-8259-a4ae9855477a`, version lấy từ GET metadata thật. Không upload ảnh giả mới, không khai báo tọa độ đo hoặc xác minh ngoài thực tế; `locationSource=UNKNOWN`. Mô tả nói rõ demo, không phải sự kiện hiện trường mới. Có body/key/receipt/readback lưu để tránh tạo trùng.

| Nhãn | Report ID | Case ID | Kết quả |
| --- | --- | --- | --- |
| TEST-FASTTRACK-DEMO-20261116-01 | e1d8e1d3-a9ae-4ad6-ab76-49786353bb04 | 9cd7ebbe-ecdb-4ce4-b120-905722eb76f3 | POST 201, GET report 200, Sup GET Case UNASSIGNED |
| TEST-FASTTRACK-DEMO-20261116-02 | 8a90aa96-3cad-4d0f-a3a3-dcfedee6c40d | 5fa55fd6-841a-40b3-ba85-48b27ba4542a | POST 201, GET report 200, Sup GET Case UNASSIGNED |
| TEST-FASTTRACK-DEMO-20261116-03 | bab8f614-c06d-4088-8ed4-984d78be4392 | 7c97baa0-b578-442b-96d5-60651459a492 | POST 201, GET report 200, Sup GET Case UNASSIGNED |

Đây là **3 phản ánh nguồn**, chưa phải 3 hạng mục đủ điều kiện Fast Track. Sup tự phân công dự án, PM tự xác minh/kết luận theo dữ liệu nguồn và lập phương án khi hợp lệ; không tự gán dự án, tạo Defect hoặc giao Crew bằng quyền PM/Sup. Không tạo thêm dữ liệu Crew/Drone Operator trong lượt này. Receipt/progress (không token) tại `artifacts/fasttrack-dev-bearer/reporter-demo-receipts.json`; mapping Sup đọc tại `demo-cases-sup-readback.json`.

## Bấm nghiệm thu

1. Đăng nhập PM/Sup qua form sau khi dev server bật flag; đi bằng menu SPA, không F5 giữa bước cấp token và thử tệp. Nếu F5, đăng nhập lại để cấp credential RAM.
2. Sup → Xử lý cấp bách → Phê duyệt độ phủ → chọn tệp căn cứ thật → Tải tệp căn cứ → chờ/đối chiếu đến VERIFIED → Đọc lại nguồn hồ sơ. Chưa xác nhận độ phủ nếu thiếu accepted handover.
3. Sup → Tiếp nhận phản ánh → ba Case UNASSIGNED ở bảng trên → tự phân công và đi tiếp luồng PM. Policy TEST/fixture cũ giữ nguyên; không chọn policy để suy checklist phương án.
4. Khi có đủ nguồn, PM chọn đúng revision/checklist, hồ sơ khảo sát và Crew; người dùng tự bấm giao việc. Receipt/F5 chỉ đọc lại, quyền thi công vẫn do BE đánh giá.

BE cần bổ sung **WebSession + CSRF** cho đúng nhóm upload/file trên, kiểm quyền/ETag/idempotency không đổi, và có đường cấp/đọc nguồn checklist + gắn/chấp nhận bàn giao. Khi BE hỗ trợ cookie: tắt flag, kiểm lại upload/readback bằng cookie, rồi bỏ allowlist và bootstrap Bearer tạm; không giữ hai phương thức fallback.
