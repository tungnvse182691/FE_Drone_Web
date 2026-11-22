# E4 — Các sửa đổi còn lại theo Chinhsua.docx và BE mới (develop c0c99ca)

Môi trường: BE mới ở `D:\ConnectAPI\RoadGuardSystem-develop (1)\RoadGuardSystem-develop`, dựng bằng docker compose project `roadguard-v3` (API `https://localhost:18443`, container `roadguard-v3-*`). Dữ liệu là seed mới. Vite `http://localhost:5180`. Kịch bản: `tools/e2e/e4-misc.mjs`, `e4-survey.mjs`, `e4-reassign.mjs`.

## 0. Đồng bộ hợp đồng BE
- `docs/contracts/openapi.json` đã thay bằng bản của BE mới (`deploy/fe-handoff/openapi.json`); bản cũ giữ ở `docs/contracts/openapi.old-20261121.json`.
- Khác biệt: thêm `POST /survey-tasks/{taskId}/complete`; `DatasetDetailView.surveyId`; `ObligationResponsibilityDto.packageId/currentRepairItemId`; `FieldTaskCreateInput.requiredMeasurementType` nhận 1–6; thêm trường cho `InspectionTaskResponseDto`, `SurveyTaskV2ResponseDto`, `H6NotificationScopeDto`, `DatasetListItemDto.processingCounts`.
- `src/types/api.generated.ts` không được file nào import và không có công cụ sinh trong dự án nên chưa sinh lại.
- **Seed của BE mới vẫn thiếu bước `submit` hình học trước `confirm`** (lỗi 409 giống lần trước). Đã vá `demo_ai.py` trong container (thêm `POST …/road-geometry-drafts/{id}/submit` + đọc lại ETag) rồi chạy lại seed; không sửa mã BE. Ghi cho BE: `deploy/fe-handoff/demo_ai.py` cần bước này.

## 1. Giao lại Operator không chọn lại người hiện tại (docx mục "tạo đợt bay xong, khi giao lại…")
- `src/pages/(pm)/surveys/SurveyRecordActions.tsx`: khi giao lại, danh sách Operator loại `record.operatorId`; nếu không còn Operator nào khác thì hiện cảnh báo và khóa nút "Xác nhận giao lại". Lịch sử Operator cũ do BE giữ.
- Kiểm (`e4-reassign.mjs`, pm-a, Project A): danh sách chỉ còn "Chọn Operator", có thông báo "Không có Operator nào khác…", nút xác nhận `DISABLED` — **6/6 đạt**.
- Chưa kiểm nhánh có ≥ 2 Operator trong dự án (seed A chỉ có 1).

## 2. Gỡ phong tỏa pháp lý có ô lý do (docx mục "lưu trữ phong tỏa pháp lý")
- `src/pages/(sup)/system-control/LegalHoldModal.tsx`: thêm ô bắt buộc "Lý do gỡ phong tỏa" (BE `POST /retention/holds/{id}/release {reason}`); để trống thì chặn và nhắc.
- Kiểm (`e4-misc.mjs`, Giám sát, Project B): bật phong tỏa 201; modal gỡ có ô lý do; để trống không gọi API; có lý do → `POST …/release` **200**; GET `retention/files/{id}` → `activeHoldCount = 0` — **đạt**.
- Giới hạn BE còn lại: không có API liệt kê hold, `holdId` chỉ nhớ trong `sessionStorage` của phiên (xem lỗi BE #3 trong `NGHIEM-THU-THEO-LUONG.md`).

## 3. Lưu trữ: đọc `inventoryReasonCodes` (BE trả lời "Retention")
- `src/pages/(sup)/system-control/retentionReasonLabels.ts` (mới) + `ProjectRetentionDetailModal.tsx`: chi tiết tệp liệt kê từng mã lý do kiểm kê chưa đầy đủ kèm giải thích và người xử lý theo handoff; mã lạ hiện nguyên mã.
- Kiểm: SBX-B hiện `WARRANTY_OBLIGATION_MISSING — Dự án được tham chiếu chưa có bảo hành… Xử lý: Giám sát tạo bảo hành ở thẻ Bảo hành của trang Tổng quan dự án`; GET khớp `inventoryReasonCodes=["WARRANTY_OBLIGATION_MISSING"]` — **đạt**.
- `PUT …/basis` đã đúng hợp đồng mới (`warrantyIds`, `expectedReferenceInventoryVersion`, `reason`, `If-Match` = `basisVersion`).

## 4. Hoàn tất nhiệm vụ khảo sát (BE mới: `POST /survey-tasks/{taskId}/complete`)
- `src/api/services/surveyActions.ts` (`completeTask`) + `src/pages/(pm)/surveys/SurveyCompleteCard.tsx` (mới, gắn vào `SurveyRecordDetailModal`): PM chọn bản nộp (không tự lấy bản mới nhất), thẻ đọc `assessmentId` hiện hành từ `GET /datasets/{id}/coverage`, nhập lý do, gửi `{datasetId, assessmentId, reason}` với `If-Match` = ETag **nhiệm vụ**. Chỉ hiện khi nhiệm vụ `SUBMITTED`; nhãn nhắc "Đã nộp ≠ hoàn thành".
- Kiểm (`e4-survey.mjs`, pm-b, Project B): tạo đánh giá PASS bằng API (dữ liệu test `[TEST-FE]`), UI thẻ hiển thị, nút khóa khi chưa chọn bản nộp, POST complete **200**, GET nhiệm vụ → `COMPLETED` — **8/8 đạt**. Nhiệm vụ khảo sát của Project B đã ở trạng thái COMPLETED (không hoàn tác).

## 5. Dữ liệu test tạo trong vòng này (stack `roadguard-v3`)
- Phong tỏa SBX-B: tạo rồi gỡ (đã `activeHoldCount=0`).
- Đánh giá bằng chứng PASS trên bản nộp của nhiệm vụ khảo sát SBX-B; nhiệm vụ đó đã COMPLETED.
- Một nhiệm vụ khảo sát mới `7fc7ee83-83b0-469c-8b42-997dab7fce50` ở SBX-A (NEW_ASSIGNED, không `planId`) dùng cho kiểm giao lại.
- Một lượt chạy đánh giá lưu trữ trên SBX-B.
