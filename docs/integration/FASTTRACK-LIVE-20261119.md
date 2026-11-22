# Fast Track — đối chiếu NewBE qua phiên web PM, 2026-11-19

### Đã khoanh vùng lỗi và chặn payload sai ở FE

- Đối chiếu chỉ đọc trên NewBE: `surveyTaskId` của AI run là `25f98904-d630-4220-8d52-76a92b2325ae`; khóa `Surveys.Id` của cùng detection/job theo `ProcessingBlock → SurveyDataVersion` là `d5ddecc8-55e9-4754-8d38-f9a172fcab11`. `ValidateSourceAsync` kiểm khóa thứ hai. Payload cũ gửi khóa thứ nhất vào `task.surveyId`, không phải lỗi do thiếu segment set ở lần gọi đó.
- Đã bỏ lựa chọn nguồn suy từ AI run khỏi modal; nguồn vẫn được đọc từ hồ sơ FIELD thật và kiểm lại trước POST. Giữ nguyên layout và nhánh chỉ GET khi đã có receipt. Không hard-code khóa từ SQL, không tạo FIELD mồi, không sửa BE. Hợp đồng hiện tại chưa cung cấp đường đọc được xác nhận cho Web để lấy `Surveys.Id` từ detection/run khi chưa có FIELD: cần BE xác nhận endpoint có sẵn hoặc bổ sung trường nguồn. FIELD có sẵn là cách FE đọc pin đã biết, không phải điều kiện bắt buộc của chính lệnh assign ở BE.

**Chưa giao việc, chưa xác nhận cuối.** Không tạo dữ liệu nghiệp vụ trong lượt kiểm này. `/ready` trả `ready`; Vite 5173 trả 200. Đăng nhập PM qua Edge và mở `/pm/fast-track`: dự án SBX-A có hai vị trí, chỉ CRACK hiển thị “Sẵn sàng giao việc có điều kiện”. Không phải quyền thi công.

### Kết quả sau khi sửa FE — đã gửi assign qua UI

PM chọn `Synthetic crew-a`, revision `ed9bd297-d3f0-448c-9d9a-837c8844ef94`, nguồn khảo sát và DepressionDepth, nhập phạm vi 5–6 m và hạn tương lai, xác nhận phát lệnh. **POST assign trả HTTP 409 `source_not_ready`, correlation `8b13ce7b-b974-469e-a145-4828db326157`**. Modal hiển thị mã và correlation; đã ghi sổ ngay lúc nhận phản hồi. Đây là lần gọi assign, khác lần thử standalone FIELD trước đó.

GET lại item và history đều 200: version `AAAAAAAAVu4=`, `ReadyToAssign`, `UNREPAIRED`, `currentBinding: null`, không có attempt, decision hoặc review request. GET field-inspection-tasks vẫn rỗng. Không có taskId để nghiệm thu; không thử final-confirmation.

FE dùng chi tiết item (collection không có checklist), source-defect, detection/frame trong kết quả của đúng job/run và SHA-256 frame của đúng nghĩa vụ. Chỉ nhánh route-only có hash khớp mới dùng các pin null; không lấy bộ phân đoạn từ khảo sát thay vào nghĩa vụ. Kiểm lại nguồn, loại đo và policy lúc gửi. GET survey-task xác nhận trạng thái SUBMITTED, đúng route, scope khảo sát có segment set `3a98e680-dfa5-4223-93f3-a58d75ad1398`. GET processing-job xác nhận SUCCEEDED, resultId đúng detection. **GET survey-task không chứng minh khóa `db.Surveys.Id` hoặc chuỗi SurveyDataVersions.** `ValidateSourceAsync` dùng chung mã 409 cho survey/project/route, link KEEP_NEW hiện hành và chuỗi processing; phản hồi không chỉ ra điều kiện cụ thể. Chuyển correlation cho BE, không đổi pin hay gửi thử ID khác.

Kiểm: `node --test tests/fastTrackSurveySource.test.mjs`, TypeScript và Vite build. Không sửa BE.

### Nguồn kiểm lại bằng GET trong phiên PM (trước khi sửa)

Project `72f84201-c001-4000-8000-000000000001`, package `36a80018-6e43-4999-a054-8543ce61cc42`, item `e988cfc0-6919-4d86-bc61-da57dc2fd8be`. Các đường dẫn dưới đây tương đối với `/api/v1/projects/{projectId}`.

| GET (200) | Kết quả |
|---|---|
| `repair-packages/{packageId}/items/{itemId}` và `…/history` | FastTrack, ReadyToAssign, UNREPAIRED, `test-fe-v1`, currentBinding null; attempts, decisions, reviewRequests rỗng. |
| `…/items/{itemId}/source-defect` | CURRENT_SOURCE, defect `551b7ad0-c1d4-452b-983c-cf21b10ae19e`, AiDetection `3dcf37b3-2c93-981a-7dda-3dc6bb08cdb5`, frame `e64e23de-aecf-ff82-b638-979f5f2423d8`. |
| `ai-mock-runs` và `ai-mock-runs/49e677d8-6f75-4d1d-84ce-99cb182c311a/result` | Đúng detectionId **và** frameFileId; run và kết quả cùng job `d5134529-a90e-4bb9-b5fc-1e893b65f9cc`. Run có surveyTaskId `25f98904-d630-4220-8d52-76a92b2325ae`. Detection không có segmentId/geometry. Không chọn theo nhãn DET-01 hay run mới nhất. |
| `defects/{defectId}` | OPEN, CRACK/HIGH, routeVersion `7ba504f9-3c5e-4ef9-bc81-10c299d24893`, segmentId null. OPEN không chứng minh trạng thái verification. |
| `road-coverage` | Nghĩa vụ `f1a94258-e35b-43cf-a8e1-8a396c8fdb1e`, 5–6 m, lệch 0–1 m, locationVersion `h4-frame-v1:bd59ff2c558b8b38218ac4113f0011b174ed2090bc475ceaeafa3b474994055e`. Không suy ra segmentSetId từ việc detection thiếu segmentId. |
| `field-inspection-tasks` | Danh sách rỗng, nextCursor null. |

`fastTrackFormSources.list` chỉ tìm nhiệm vụ MEASURE_ONLY; `executeDispatch` lại đọc ID nguồn như một FIELD task. Vì vậy sửa riêng dropdown không đủ. 409 `source_not_ready` trong bàn giao thuộc **standalone FIELD**, không phải kết quả của `assign` trong lần kiểm này. Đã tìm được quan hệ defect → detection → survey từ API cookie; chưa xác minh bộ pin của obligation tương ứng với locationVersion nên chưa bỏ chốt hoặc gửi lệnh bằng reference đoán. Final-confirmation chưa có binding/attempt/quyết định để xác nhận. Không đổi BE, không tạo FIELD mồi.
