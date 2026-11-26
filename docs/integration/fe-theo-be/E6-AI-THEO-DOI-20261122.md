# E6 — Theo dõi AI ngay sau khi tạo (Chinhsua.docx, "Cập nhật mới: 5h37", mục 2)

BE: `roadguard-v3` (develop c0c99ca). Kịch bản: `tools/e2e/e6-ai-run.mjs` (pm-a, SBX-A) — **16/16 đạt**. `npx tsc --noEmit -p .` sạch.

## Đã sửa
| Yêu cầu | Cách làm |
|---|---|
| Giữ và hiển thị lần chạy vừa tạo | Khung mới `AiRunTracker` dưới nút "Chạy AI mock" đọc danh sách từ BE (`GET /projects/{p}/ai-mock-runs?surveyTaskId=&datasetId=`), nên lần chạy luôn hiện lại sau F5; lần vừa tạo được đánh dấu "Vừa tạo" |
| Tự đọc lại QUEUED/RUNNING/SUCCEEDED/FAILED | Đọc lại mỗi 3 giây khi còn lần chạy chưa kết thúc, tối đa 100 lần (~5 phút) rồi báo "đã ngừng tự đọc lại" kèm nút "Đọc lại"; huỷ timer và request khi rời màn hoặc đổi bản nộp |
| Hiển thị lỗi khi thất bại | Hiện `errorCode` do BE trả ("BE báo mã lỗi …"); nếu BE không trả mã thì ghi "BE không trả mã lỗi", không bịa nguyên nhân. Lỗi từ chối ngay ở POST (ví dụ 422 `ai_contract_invalid`) hiện kèm HTTP và code |
| Phân biệt runId và processingJobId | Mỗi lần chạy hiển thị hai dòng có nhãn: "Mã lần chạy AI (runId)" và "Mã job xử lý (processingJobId)". Thông báo sau khi tạo ghi rõ `runId`. Ô nhập GUID "Mã job xử lý" chuyển vào mục "Nâng cao"; thay bằng nút "Xem job xử lý" ở từng lần chạy (điền và đọc job đúng `processingJobId`) |
| Mở kết quả/thẩm định trực tiếp | Nút "Mở kết quả thẩm định" (khi SUCCEEDED) chuyển tới `/pm/surveys/{taskId}?run={runId}&dataset={datasetId}` (màn `DroneMissionAIReview`). Màn đó đọc query, chỉ lấy phát hiện của đúng lần chạy (kiểm run thuộc nhiệm vụ, đúng bản nộp, đã SUCCEEDED; sai thì báo lỗi), có banner "Đang xem kết quả của lần chạy AI …" và liên kết "Xem tất cả lần chạy của nhiệm vụ". Không có query thì hành vi cũ giữ nguyên |
| Giữ đầy đủ thao tác thẩm định | Không đổi màn thẩm định; từ danh sách chọn phát hiện → "Bấm để xem thông số & Thẩm định" → màn chi tiết còn "Báo sai", "Gom vào lỗi hiện hữu", "Ghi nhận khiếm khuyết tái phát" |

## File
- Mới: `src/pages/(pm)/surveys/AiRunTracker.tsx`, `tools/e2e/e6-ai-run.mjs`.
- Sửa: `src/pages/(pm)/surveys/SurveyDatasetPanel.tsx` (gắn tracker, đổi ô job thành nâng cao), `src/api/services/aiRunDetailService.ts` (thêm trường `datasetId`, `surveyTaskId`, `createdAt`, `listForDataset`, `isAiRunTerminal`), `src/api/services/surveyService.ts` (`getSurveyDetections` nhận `scope {runId, datasetId}` — chỉ thêm tham số và đoạn lọc), `src/pages/(pm)/drone-review/useDroneMissionReview.ts` (nhận ngữ cảnh run), `src/pages/(pm)/DroneMissionAIReview.tsx` (đọc query, banner).

## Bằng chứng test (BE `roadguard-v3`, pm-a, nhiệm vụ `260cf5b5…`, bản nộp `ea3f4cdc…`)
- POST `/ai-mock-runs` **202**; thông báo hiển thị `runId d3c65a97-…` (QUEUED); khung theo dõi 4 → 5 lần chạy ngay.
- `runId` ≠ `processingJobId` (`f1f35af5-…`), khớp GET độc lập `GET /ai-mock-runs/{runId}` (SUCCEEDED, `processingJobId` trùng).
- F5 giữa chừng: mở lại panel vẫn thấy lần chạy (5 lần).
- Trạng thái tự chuyển SUCCEEDED không cần bấm; "Xem job xử lý" điền job đúng và đọc được.
- "Mở kết quả": URL `/pm/surveys/260cf5b5-…?run=d3c65a97-…&dataset=ea3f4cdc-…`; số phát hiện hiển thị (1) khớp `GET …/ai-mock-runs/{runId}/result` (1 phát hiện); có liên kết `/pm/defects/{id}/verify-a`; màn đó còn đủ thao tác.
- Fixture sai (`no-such-fixture-v9`): BE **422 `ai_contract_invalid`** ngay ở POST, UI hiện "HTTP 422 ai_contract_invalid" kèm mã tham chiếu.

## Chưa kiểm được
- **Trạng thái FAILED của một lần chạy đã tạo:** không gây ra được một cách hợp lệ vì BE chặn dữ liệu sai ngay ở POST (422) nên không có lần chạy FAILED nào để theo dõi. Đường hiển thị `errorCode` đã viết nhưng chưa chạy thật.
- Trạng thái RUNNING (BE seed xử lý quá nhanh, chỉ thấy QUEUED → SUCCEEDED).
- Hết hạn 5 phút tự đọc lại (chưa có lần chạy treo để kiểm).

## Ghi nhận
- Mỗi lần chạy e2e tạo thêm lần chạy AI thật ở nhiệm vụ `260cf5b5…` (SBX-A): tổng cộng 3 lần chạy hợp lệ của E6 (một trong số đó cho debug). Không có trường văn bản nên không dùng tiền tố `[TEST-FE]`.
- Các lần đọc kết quả của lần chạy khác trên màn thẩm định đến từ danh sách nhiệm vụ có sẵn (`getSurveys`), không phải từ danh sách phát hiện.
- `GET /projects/{p}/ai-candidates/{id}` vẫn 401 với cookie Web (lỗi BE #7, đường lùi giữ nguyên).
- Không có lỗi BE mới.
