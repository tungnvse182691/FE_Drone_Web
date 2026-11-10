# Bàn giao tiếp nhận Reporter → Sup điều phối → PM đọc

Phạm vi: đọc Case/Report/ảnh private, Sup triage, GET/readback và F5. Giữ màn AIReviewInbox cũ tại /sup/cases và /pm/ai-inbox; không dùng CaseIntakeWorkspace. Các thao tác bulk verify, bulk need survey và link chưa tích hợp được chặn ở handler lẫn nút. Không mở thêm thẩm định PM, AI/Defect, đo đạc, Drone, gộp/tách hoặc công bố.

## Tích hợp và phạm vi commit

- Case list/detail/project options từ server, đọc hết cursor, phân biệt rỗng/lỗi/quyền và fence actor/Case/response muộn. Không suy nguồn Reporter chỉ từ Case hoặc phương thức xác minh.
- Sup tự chọn project, FIELD/DRONE/EXISTING_EVIDENCE và lý do; Web cookie/CSRF, If-Match từ Case GET và Idempotency-Key. Journal giữ ý định khi timeout; có receipt chỉ GET lại; conflict yêu cầu đối chiếu chủ động.
- Report metadata và ảnh private từ API được phép. Drawer và modal ảnh dùng chung blob/loading/error/selection, không fallback ảnh giả, không lấy UNKNOWN thành tọa độ 0. Thiếu metadata giữ thiếu; tọa độ 0 thực vẫn hợp lệ.
- Chỉ thêm type UNKNOWN cần cho dữ liệu tiếp nhận, không thêm nghiệp vụ thẩm định. Giữ nguyên layout/className các component gốc ngoại trừ trạng thái lỗi/disabled và binding cần thiết.
- Các sửa khảo sát BLOCKED, Vite/dev bridge, PM conclusion/AI/Defect và hunk split cục bộ không nằm trong commit này. File dùng chung được stage theo hunk; working tree ngoài nhiệm vụ được bảo toàn.

## Nghiệm thu runtime local

| Bước | Kết quả và nguồn bằng chứng |
|---|---|
| Reporter đăng nhập/upload/tạo Report | Người dùng tự thực hiện bằng Postman. Báo login200 REPORTER, mustChangePassword=false và GET07 VERIFIED. Không nhận đã trực tiếp quan sát toàn bộ HTTP upload/part PUT/complete/POST Report |
| Sup tìm hồ sơ | GET list UNASSIGNED, Case và internal Reports đều200, match đúng reportIds |
| Sup điều phối | Quan sát đúng một POST /api/v1/cases/9409f2eb-e0e1-4c8e-9c01-1d246f91114d/triage trả200 do người dùng bấm, có cookie/CSRF, If-Match/key; không gửi lại |
| GET readback | Cùng Case chuyển OPEN, project321, EXISTING_EVIDENCE, ETag mới khớp |
| Sup F5 | GET Case/Report/ảnh private200, đúng reference/nội dung, không alert |
| PM đọc/F5 | GET list theo project321 thấy card; Case/Report/ảnh private200; F5 giữ đúng reference, trạng thái, nội dung và ETag |

Reference server:
- Case: 9409f2eb-e0e1-4c8e-9c01-1d246f91114d.
- Project321: 15d119fe-0c03-4e25-aa5d-95e97ddd881d.
- Report: 18989109-2f4b-4ecb-b06f-f6b2a2e1f985; evidence: 3807d777-19ee-4433-aba3-35d1c0cd2e86.
- File: 9de527af-f442-47b0-8b3d-0a7a21a5126a, fileVersion AAAAAAAAn40=.
- Case ETag trước/sau triage: "AAAAAAAAn5E=" → "AAAAAAAAn60=".
- Ảnh JPEG kiểm thử3840×2400, 4.114.576 byte; SHA-256 a7583fdee261ce58a2ec91b64d6bd715a810645e8550efdd8c3a5a1c12815268 khớp bytes gốc qua private GET ở Sup và PM.

Đây là dữ liệu kiểm thử local, không phải phản ánh hư hỏng thực tế. Description chứa cả chuỗi JSON do nhập thử; đã giữ nguyên. locationSource UNKNOWN, location/capturedAt null. OPEN sau triage không phải kết luận khiếm khuyết hoặc công bố cho Reporter. Chưa nghiệm thu các quyết định thẩm định tiếp theo của PM, FIELD/Drone/AI hoặc runtime timeout/conflict/sai quyền ghi; các test cô lập không thay bằng nghiệm thu các nhánh đó.

## Kiểm tra bản staged riêng

- node tools/check-case-intake.cjs: 14 PASS, mock/hook/SSR.
- node tools/check-case-report-media.cjs: 6 PASS, mock/hook/SSR; từng có FAIL trước sửa binding.
- node tools/check-case-unintegrated-guards.cjs: 5 PASS, hook/caller SSR thực; từng có FAIL trước guard.
- Typecheck và npm run build: PASS; build có cảnh báo kích thước bundle.
- Full tools/check-review-293d001.cjs: lỗi harness baseline Missing mock: ../../../api/services/primaryPmCommands tại usePersonnelState; không gọi full PASS hoặc nới assertion để che lỗi.
- Kiểm tra trên export của staged tree, không dùng phần khảo sát local để làm build/test xanh. Staged diff-check và kiểm bí mật thực hiện trước commit. Không đưa mật khẩu/token/cookie/CSRF value/signed URL vào bàn giao GitHub.

Trong lượt chốt này không sửa BE/Docker/migration/DB/seed, không gọi API ghi nghiệp vụ hoặc lặp lại triage. HEAD trước commit: 085a559d2e68c3256e3146f4690bf7f0ef391e6b.
