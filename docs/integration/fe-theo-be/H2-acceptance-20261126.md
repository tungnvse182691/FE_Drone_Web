# H2 — Nghiệm thu / phân luồng xác nhận bản nộp — 2026-11-26

Phạm vi: Web PM `/pm/*` và Supervisor `/sup/*`, FE-only. BE `roadguard-v5` (`https://localhost:18443/api/v1`), Vite `:5180`. Gói/hạng mục test: Normal `7a7d62f3` (SBX-A), task `3b974b27` (xem `TEST-DATA-LEDGER.md` mục "B13 · H2").

## Bảng yêu cầu -> trạng thái

| # | Yêu cầu | Trạng thái | Bằng chứng |
|---|---|---|---|
| 1a | Task sửa chữa có binding dùng `POST .../tasks/{task}/attempts/reviews` (ACCEPT/SUPPLEMENT); FIELD đo riêng giữ review FIELD | ĐÃ SỬA + KIỂM e2e | `h2-review.mjs supplement`, `accept`: PASS (1 POST attempts/reviews, 0 POST FIELD /reviews) |
| 1b | KHÔNG chặn bằng `submission.readiness===READY`; giữ ảnh; GET đối soát; bước final riêng | ĐÃ SỬA + KIỂM | bản nộp INCOMPLETE/`AFTER_ATTEMPT_BINDING_UNAVAILABLE` vẫn SUPPLEMENT/ACCEPT được; sau lệnh GET lại item (Reviewed) / task (SupplementRequired); thông báo "Bước xác nhận cuối là lệnh riêng ở màn Nghiệm thu" |
| 1c | HUY-BUG-001 Fast Track: ACCEPT -> đọc lại -> final; không review trùng; final lỗi báo bước đã xong | ĐÃ CÓ SẴN (G3, `closeFastTrackItem`) | CODE; e2e FT **BLOCKED** (không có chính sách/độ phủ publish -> assign 409 `published_policy_source_required`) |
| 1d | PM review đọc bản nộp hiện hành + ảnh thật | ĐÃ CÓ SẴN (G3) + bổ sung khối lịch sử | `h2-lineage.mjs` |
| 2 | Acceptance UI đối chiếu từng gạch | xem mục dưới | |
| 3 | Modal tái sử dụng ảnh | xem mục dưới | |
| 4 | Cancelled "Đã hủy"; 409 phạm vi; toast; D99A8AF2 | xem mục dưới | |
| 5 | Ảnh thước đo phóng to, slider đủ ảnh, GPS | ĐÃ SỬA (xem dưới) | `h2-lightbox.mjs`, `h2-lineage.mjs` |

### 1. Phân luồng xác nhận (DEF-fac25046)
- `src/api/services/acceptanceService.ts`: thêm `resolveRepairTaskBinding` (PM không đọc được `task.repairContext`, nên tìm item cùng Defect có `currentBinding.taskId`/attempt/`taskBindings` = task; không thấy -> null, không đoán) và `reviewRepairTaskSubmission` (đọc lại item/task ngay trước khi gửi, kiểm bản nộp + ETag item còn hiện hành, `Idempotency-Key` giữ nguyên khi gửi lại cùng nội dung, GET đối soát sau lệnh, lỗi đối soát nói rõ "đã gửi, không gửi review mới"). `postReview` nhận thêm tham số key (additive).
- `src/pages/(pm)/field-tasks/FieldTaskReadDetails.tsx`: task `mode != MEASURE_ONLY` ở trạng thái Submitted -> khối "PM thẩm định bản nộp sửa chữa hiện hành" (Chấp nhận hồ sơ và trình Giám sát / Yêu cầu bổ sung, ghi chú, hiện hạng mục/gói/bản nộp/phiên bản). Không tìm thấy binding -> báo và giữ review FIELD cũ. Task đo riêng (MEASURE_ONLY) giữ nguyên review FIELD. Khối review FIELD cũ ẩn khi đang có binding.
- API: GET repair-packages, items, items/{id}/history, field-inspection-tasks/{id}; POST attempts/reviews (CSRF + Idempotency-Key + If-Match item).

### 2. Acceptance UI (đối chiếu "Chỉnh giao diện nghiệm thu theo dữ liệu thực")
ĐÃ CÓ SẴN từ G3 (không làm lại): thumbnail đúng nguồn 4 trạng thái, tiến độ theo state thật, "Chưa có dữ liệu", bỏ EXIF/ĐẠT/K98/bảo hành mẫu, đổi tên nút "Chấp nhận hồ sơ và trình Giám sát", bổ sung khác sửa lại, khóa nút khi gửi, Supervisor "Chấp thuận nghiệm thu" khóa + giải thích, lỗi BE hiện code/hướng dẫn.
ĐÃ BỔ SUNG vòng này:
- `evidence-closeout/SubmissionHistoryPanel.tsx` (mới) + `acceptanceService.getSubmissionLineage`, gắn vào `EvidenceCloseoutDetail.tsx`: liệt kê Bản nộp #1/#2…, review gắn theo `submissionId` (không theo thời gian; bản #2 không mượn review bản #1), lý do SUPPLEMENT, so sánh 2 bản (ảnh AFTER trái/phải), mốc thi công theo lần thi công tách khỏi thời điểm nộp. Nguồn: repair `history` (`intakeSubmissions`, `attemptReviews`, `attempts`) + FIELD task `history.details` (`submissions/reviews/evidenceReuse`) + `GET submissions/{id}` cho ảnh/số đo (không dùng `attempt.evidence` rỗng). Không dùng sessionStorage. ETag history không dùng làm ETag mutation (panel chỉ GET).
- B7: `fieldEvidenceReuseCommands.result()` nay đọc `details.evidenceReuse` từ BE (đúng sau F5/phiên mới), sessionStorage không còn là nguồn duy nhất.
- B5: Supervisor đọc được `details` (BE hiện cho cả PM và Supervisor, thấy cả lý do SUPPLEMENT của PM — xem mục "cần BE"); lỗi 403/404 hiển thị riêng, không coi như rỗng.
- Ảnh trước/sau, slider đủ ảnh: `EvidencePhoto` thêm `fit="contain"`; `BeforeViewer/AfterViewer/ComparisonViewer` dùng contain, khung slider cao `min(70vh,640px)` (trước: `aspect-video` + `object-cover` cắt ảnh); `ImageComparisonSlider` (PM đo đạc) đổi `object-cover` -> `object-contain`.

### 3. Modal tái sử dụng ảnh
ĐÃ CÓ SẴN (G3): toast z-index trên modal, lỗi trong modal giữ dữ liệu, "Đã xác nhận tái sử dụng ảnh" + chỉ đọc/Đóng, GUID/checksum/receipt trong `<details>`, `ReuseSavedResult` (ảnh, nguồn, metadata, lý do). Vòng này: mở lại đọc từ BE (xem B7). `ToastContainer` nâng z-[10050] để trên lightbox/modal (9999). **CHƯA KIỂM e2e**: không dựng được trạng thái reuse thật (cần reference Report KEEP_NEW trong phiên + task đo Reporter); code đã qua tsc.

### 4. Khác
- Task Cancelled -> "ĐÃ HỦY": ĐÃ CÓ SẴN (`fieldTaskService.ts` map CANCELLED; chuỗi "Chưa ánh xạ trạng thái" không còn trong `src`).
- 409 `active_scope_conflict`: thông điệp "Phạm vi đề xuất xung đột với hạng mục đang hoạt động. Vui lòng kiểm tra gói hiện có." đã có trong `projectExportService.exportError` (nhóm H3 đang sở hữu form đề xuất); H2 không sửa thêm.
- "Sửa toast thông báo": toast giao việc `AssignCrew.tsx` đã dùng `toast.success("Đã giao {mã hạng mục} cho {tên Crew}.")` + banner "Xem nhiệm vụ"; ảnh docx không nêu khác biệt cụ thể nên không đổi style (thuộc luồng giao việc, nhóm H3).
- Gói D99A8AF2 "Đã đóng gói: 0 / Đóng đợt ngay": BE không có thao tác/trạng thái đóng gói (`is_closed` FE luôn false; nút trước chỉ điều hướng). `AcceptanceList.tsx`: KPI "Đã nghiệm thu xong" (đếm gói PASSED), chip "Đã nghiệm thu xong", bỏ chip "Đã đóng gói", nút "Đóng đợt ngay" -> "Xem kết quả nghiệm thu" (tooltip nêu BE chưa có đóng gói riêng). Không tạo thao tác đóng.

### 5. Ảnh thước đo / slider / GPS
- Nguyên nhân phóng to không xem được: lightbox lấy `evidence_photo_url` (không bao giờ được gán) -> `<img>` không src; kèm GPS mặc định 16.2405,108.131, thiết bị "Samsung…", nhãn "Mobile EXIF Verified/Vượt ngưỡng kỹ thuật" bịa.
- Sửa: `FieldSubmissionPhotos` báo ảnh đang chọn (blob đã kiểm VERIFIED + checksum) qua `onPhoto`; `MeasurementsTab` lightbox dùng đúng ảnh đó, số đo/GPS lấy từ số đo của bản nộp hiện hành (`longitude/latitude`), thời điểm từ `evidence.capturedAt`; bỏ mặc định mẫu. `PhotoLightboxModal`: bỏ nhãn không nguồn, GPS thiếu -> "Chưa có dữ liệu", đơn vị theo số đo. Bảng số đo thêm cột "Tọa độ GPS". Ảnh inline `object-contain`.
- Nghiệm thu: `after_gps` lấy từ tọa độ số đo của bản nộp (thiếu -> "Chưa có dữ liệu"). Lưu ý: BE chỉ có tọa độ mức số đo (không có GPS riêng cho từng ảnh/EXIF).
- Inbox Reporter (H1): không đụng.

## Kiểm
- `tsc -p tsconfig.json --noEmit`: file của H2 không lỗi (lỗi còn lại thuộc nhóm khác: `DefectDetailVerify`, `defect-verify/DefectVerifyForm`, `fast-track/DefectDetailModal`).
- e2e thật trên `roadguard-v5`: `h2-review.mjs supplement` (7/7 PASS), `h2-review.mjs accept` (6/6 PASS), `h2-lineage.mjs` (PM + Supervisor, 23 PASS), `h2-lightbox.mjs` (7/7 PASS: ảnh blob thật phóng to, không GPS/thiết bị mẫu; lightbox subtitle không còn "Km null"). `npx vite build`: thành công. Toast `ToastContainer` nâng z-[10050] (trên lightbox/modal 9999).
- CHƯA KIỂM: Fast Track end-to-end (BLOCKED chính sách), modal reuse (không dựng được state), GPS dương (seed Crew không gửi tọa độ số đo), Supervisor final sau ACCEPT (đã có G3 final PASS).

## Lỗi/quyết định cần BE
1. Supervisor đọc được `GET field-inspection-tasks/{id}/history` `details.reviews` gồm lý do SUPPLEMENT của PM (cả `repair history.attemptReviews`). `WEB-B-READ-CONTRACTS` mục B5 nói Supervisor không mặc định đọc quyết định/lý do riêng PM — cần BE xác nhận đây là chủ ý hay hở quyền. FE hiện hiển thị đúng những gì BE trả.
2. `readiness` luôn INCOMPLETE + `AFTER_ATTEMPT_BINDING_UNAVAILABLE` với REPAIR_CLAIM dù PM ACCEPT được (đúng guard hiện hành; ghi để theo dõi).
3. Không có endpoint/trạng thái đóng gói cho gói đã nghiệm thu 100% (D99A8AF2); nếu nghiệp vụ cần "đóng đợt" thì BE phải cung cấp.
4. GPS/EXIF mức ảnh không có trong submission evidence (chỉ `capturedAt`); chỉ có tọa độ ở số đo.
