# G2 — AI review: transport, mã phát hiện, lỗi API, đọc lại KEEP_NEW (2026-11-24)

## Kết quả theo hạng mục
| Hạng mục | Trạng thái |
|---|---|
| A1 Transport file bằng cookie | DONE |
| A2 Mã DET ổn định, giữ run/dataset/det, ID sai báo rõ | DONE |
| A3 Lỗi 401/403/422 rõ ràng, retry hợp lệ, 422 tại form | DONE |
| B Đọc lại KEEP_NEW sau F5 / phiên mới, khóa ghi khi chưa xác định | DONE |

## Thay đổi
**A1.** BE (UploadsController) đã `WebCookieEligible` cho `GET files/{id}` và `GET files/{id}/content` (metadata: Supervisor/PM/Operator/Crew có phạm vi; ảnh khung AI cần quyền PM hoặc Supervisor của kết quả AI). `src/api/devFileBearer.ts`: gỡ `files/{id}` và `files/{id}/content` khỏi allowlist Bearer; gỡ 4 route AI (POST/GET ai-mock-runs, result, GET ai-candidates) khỏi `TEMP_BEARER_ROUTES` (AiMockRunsController đã eligible). Luồng uploads giữ nguyên; web không đổi sang Bearer. `.env` đã `VITE_DEV_FILE_BEARER=false`. `surveyService.getFileContentUrl` không còn nuốt lỗi: lưu lỗi (đọc cả thân Blob) vào `fileContentError()`, DefectDetailVerify hiển thị `data-testid=ai-frame-image-error`; xóa ảnh cũ khi đổi khung.

**A2.** `surveyService.detectionDisplayCode(detectionId)` = `DET-` + 6 ký tự cuối detectionId; bỏ đánh số theo thứ tự. Danh sách (`MissionTriageList`) giữ `run`, `dataset` và thêm `det` trên URL (`DroneMissionAIReview` + `useDroneMissionReview`); link sang chi tiết mang `?run=&dataset=`, nút quay lại về đúng `run/dataset/det`. `?det=` không có trong run -> alert `ai-detection-not-found`, không chọn bản ghi nào. `DefectDetailVerify`: bỏ so khớp `startsWith` và bỏ fallback "bản ghi đầu tiên"; ID sai -> "Không tìm thấy phát hiện AI hoặc Defect có ID …". Lỗi tải phát hiện của dự án không còn im lặng.

**A3.** `aiRunDetailService.aiApiErrorText`: `HTTP status · code · mô tả riêng 401 (phiên chưa xác thực/hết hạn) hoặc 403 (không đủ quyền) · reasonCode · bước · trường · detail · Hướng xử lý · correlationId`. Đã xóa mọi chuỗi "chỉ nhận Bearer" và biến chặn `aiCandidatesBlocked` (không còn trạng thái chặn theo phiên: tải lại là gọi lại thật). `SurveyDatasetPanel`: lỗi POST ai-mock-runs hiện ngay trong form (`ai-run-create-error`). `AiRunTracker`: hiện `originCorrelationId` và `failure` (reasonCode/step/field/recovery); `listForDataset` đọc bổ sung từng run vì danh sách BE không có `originCorrelationId/failure`.

**B.** `readCandidateState`: GET ai-candidates/{id} -> disposition.decisionId -> GET candidate-decisions/{id} -> defectId -> defect. Phân biệt "chưa có quyết định" (disposition rỗng) với "không đọc được" (`stateUnknown` + `stateError`). Mỗi phát hiện đọc độc lập (một 401/403 không ảnh hưởng phát hiện khác). Khi chưa xác định: thẻ/chi tiết hiện lỗi + nút Thử lại (`surveyService.refreshDetection`, chỉ GET, không gọi lại KEEP_NEW), khóa Chấp nhận/Báo sai/Gom/tái phát (UI và guard trong `decide`, `handleVerify`, `handleLinkRecurrence`). sourceVersion của candidate không dùng thay version decision/defect.

## File sửa
src/api/devFileBearer.ts, src/api/services/surveyService.ts, src/api/services/aiRunDetailService.ts, src/pages/(pm)/drone-review/{useDroneMissionReview.ts,MissionTriageList.tsx,types.ts}, src/pages/(pm)/DroneMissionAIReview.tsx, src/pages/(pm)/DefectDetailVerify.tsx, src/pages/(pm)/surveys/{SurveyDatasetPanel.tsx,AiRunTracker.tsx}; tools/e2e/g2-ai-transport.mjs; ledger B12.

## Kiểm tra
- `npx vite build` sạch. `tsc --noEmit`: sạch trong phạm vi G2 (lỗi còn lại, nếu có, ở file của nhóm khác).
- `RG_BASE=http://localhost:5180 bash tools/e2e/run.sh g2-ai-transport.mjs`: **34/34 PASS** (lần chạy cuối). Gồm: 422 thật (fixture sai) hiện tại form với code `ai_contract_invalid`, reasonCode `fixture_version_unsupported`, bước `admission`, trường `fixtureVersion`, recovery, correlationId; retry fixture đúng 202; tracker hiện originCorrelationId; ảnh `files/{id}/content` không có Authorization; mã DET khớp giữa danh sách và chi tiết; F5 giữ run/dataset/det; ID sai ở danh sách và chi tiết báo rõ; Chấp nhận qua UI -> POST 201 -> BE KEEP_NEW + defectId; F5 chi tiết "Đã duyệt tạo mới", 0 POST thêm; danh sách F5 và phiên đăng nhập mới đều "Đã duyệt → #DEF"; 403 cô lập một candidate rồi Thử lại thành công.
- Lưu ý kỹ thuật kiểm thử: tình huống 403 được tạo bằng chặn request trình duyệt (puppeteer) cho đúng một ai-candidates, không đổi dữ liệu BE (BE thật trả 200 cho cookie).

## BLOCKED / chưa kiểm
- 401/403 thật trên ai-candidates không tái hiện được (BE cho cookie 200); chỉ kiểm bằng chặn request.
- Run FAILED bất đồng bộ (`failure` + originCorrelationId trong run FAILED) chưa tạo được bằng API hợp lệ: fixture sai bị 422 ngay ở admission. Phần hiển thị đã code, chưa kiểm với dữ liệu thật.
- Supervisor: decision là PM-only nên Supervisor luôn thấy "chưa xác định" cho phát hiện đã quyết định (đúng quyền, không có trạng thái KEEP/REJECT để hiện). Chưa chạy e2e Supervisor.

## Cần BE quyết định / lỗi BE
- `GET /projects/{p}/ai-mock-runs` (danh sách) không trả `originCorrelationId`, `failure`, `attemptId`, `manifestHash` dù schema AiMockRunView có; chỉ GET run đơn có. FE đang gọi thêm N lần GET run. Đề nghị BE đồng bộ DTO danh sách.
- Supervisor không đọc được `candidate-decisions/{id}` (PM-only) nên không biết KEEP_NEW/REJECT; đề nghị BE đưa `decision`/`defectId` vào `disposition` của ai-candidates nếu muốn Supervisor thấy trạng thái.
- Chưa phát hiện lỗi status/code sai: POST sai fixture ví dụ correlationId `ba02a4e9-e307-4ac1-9b3e-0c7cc518147d` (422 ai_contract_invalid / fixture_version_unsupported) đúng contract.
