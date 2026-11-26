# Xem video nguồn của bản nộp khảo sát — đã triển khai (2026-11-17)

Căn cứ: `YEU-CAU-FE-XEM-VIDEO-NGUON.md` (đề xuất của BE/QA). BE chuẩn: `RoadGuardSystem-develop (1)` (runtime https://localhost:18443).

## 1. Đã làm
| Mục yêu cầu | Việc FE |
|---|---|
| 8.1 danh sách video theo bản nộp | `pages/(pm)/surveys/SourceVideoPanel.tsx` trong khối "Bộ dữ liệu" của chi tiết nhiệm vụ (`SurveyDatasetPanel`, gắn `key={dataset.id}`). Chỉ liệt kê `sourceFiles` có `purpose = SURVEY_VIDEO`: bản nộp, purpose, MIME, dung lượng, SHA-256, mã tệp. Không suy tệp từ kế hoạch, không lấy video task khác |
| 8.1 không tự chọn `sourceFiles[0]` | Ô "Tệp bằng chứng" của đánh giá mặc định theo video nguồn; không có video thì để trống (có lựa chọn rỗng), telemetry/tệp khác do PM chọn |
| 8.2 nút "Xem video nguồn" | Khung `<video controls>` thật trong card (token/font hiện hành); tua theo `video.currentTime`, tách khỏi timeline khung AI. Chưa thêm "Tải tệp nguồn" (chờ owner chốt) |
| 8.3 service/state | `api/services/sourceVideoService.ts`: GET `/files/{id}` kiểm `id`, `status = VERIFIED`, MIME `video/*`, kích thước; GET `/files/{id}/content` (Blob, timeout 180 s, tiến độ); đối chiếu kích thước và SHA-256 với metadata; AbortController; hủy khi đổi `authEpoch`/đăng xuất/đổi bản nộp/đóng/rời màn; `revokeObjectURL`; **không cache Blob** giữa lần mở/tài khoản |
| 8.4 trạng thái | Rỗng: "Chưa có video nguồn trong bản nộp". Lỗi phân loại riêng: chưa VERIFIED · 401 · 403 · 404 · 503 · sai MIME · vượt 256 MB · sai kích thước/SHA-256 · quá thời gian · mất mạng · thiếu transport dev · JSON lỗi trả bằng Blob (đọc ProblemDetails, không dựng video) · trình phát báo codec không hỗ trợ (MediaError 3/4) |
| 8.5 chỉ đọc | Xem video chỉ phát GET; không tạo dataset/job/đánh giá/baseline; không upload; không đòi drone/thời gian/GPS |
| 8.6 Supervisor | **Chưa làm:** khối bộ dữ liệu vẫn chỉ-PM (`SurveyRecordDetailModal`), chờ owner chốt Sup xem ở đâu (mục 10.1 yêu cầu) |

## 1b. Bổ sung (2026-11-17, theo yêu cầu owner)
- **Nút "Tải tệp nguồn"** (PM và Supervisor): `SourceVideoPanel.tsx`, cùng đường đọc và kiểm SHA-256 như khi xem; lưu `video-nguon-<id8>.mp4|webm|mov`, giải phóng ObjectURL sau 10 s; lỗi phân loại hiện trong khung.
- **Supervisor xem video (chỉ đọc):** `SupSourceVideo.tsx` gắn trong `SurveyRecordDetailModal` cho `record.recordKind === 'TASK'` khi vai trò SUPERVISOR (route `/sup/surveys`). Chỉ GET danh sách bản nộp, GET dataset, GET file; không có nút đánh giá/baseline/job/AI.
- Kiểm thật (tài khoản supervisor, nhiệm vụ `18cfe3ad…`): GET datasets/dataset/files/content đều 200, 0 lệnh ghi, nút trong modal chỉ gồm Xem video nguồn / Tải tệp nguồn / Đóng; tsc + `vite build` pass.
- Chưa kiểm: tệp tải về mở được ngoài trình duyệt (headless không lưu tệp), phát MP4 thật.

## 2. Giới hạn đã biết (không che)
- BE `/files/{id}/content` chưa bật Range → FE tải **toàn tệp** rồi phát; giới hạn 256 MB; video lớn cần BE hỗ trợ Range (206/Content-Range/416) để phát dần. Chưa gửi header Range.
- `/files/*` hiện **Bearer-only**: dev dùng `[TEMP-BEARER]` (`devFileBearer.ts`, token trong bộ nhớ, mất khi F5 → hiện thông báo "cần đăng nhập lại"). Production cần phương án transport BE phê duyệt (đã ghi ở BE-REQUEST mục C: uploads/files).
- Codec: MIME `video/mp4` không bảo đảm trình duyệt giải mã được; FE báo lỗi trình phát thay vì để khung đen im lặng.

## 3. Kiểm chứng
- tsc, `vite build` pass.
- Chạy thật (PM, nhiệm vụ `18cfe3ad…` 29 bản nộp, mỗi bản 1 tệp `SURVEY_VIDEO` 1510 byte): hiện danh sách đúng bản (bản 29), bấm xem → GET `/files/{id}` + `/files/{id}/content` 200, SHA-256 khớp, **không có lệnh ghi nào**; tệp seed không phải MP4 giải mã được nên trình phát báo "không hỗ trợ định dạng/codec" (đúng lỗi, không đen im lặng); đổi sang bản 27 → player bản cũ biến mất, panel nạp lại cho bản mới. Nhiệm vụ không thuộc dự án của tài khoản → không hiện khung.
- **Chưa kiểm:** phát/tạm dừng/tua một MP4 hợp lệ có duration thật (máy không có `video test drone.mp4`, tệp seed chỉ là stub; không tạo dataset giả để né); Supervisor; 401/403/503 live; Range. Ca Demo1 trong yêu cầu vẫn **BLOCKED dữ liệu** (dataset rỗng).
