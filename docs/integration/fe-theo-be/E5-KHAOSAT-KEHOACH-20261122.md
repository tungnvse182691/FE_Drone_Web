# E5 — Kế hoạch/nhiệm vụ khảo sát: 409 rõ nguyên nhân, form không kẹt, phân biệt kế hoạch/nhiệm vụ (Chinhsua.docx, "Cập nhật mới 5h37", mục 1, 3, 4)

Môi trường: BE mới (stack `roadguard-v3`, API `https://localhost:18443`), Vite `http://localhost:5180`, tài khoản `pm-a`, Project A (`72f84201-c001-4000-8000-000000000001`). Kịch bản: `tools/e2e/e5-survey-plan.mjs` (chạy `RG_BASE=http://localhost:5180 bash tools/e2e/run.sh e5-survey-plan.mjs a|b|c|d`). Mục 2 (theo dõi AI) do fork E6 làm, không nằm ở đây.

## Mục 1 — Thông báo 409 rõ nguyên nhân
- **Đã sửa:** sau `POST /projects/{p}/survey-plans` trả 409, FE đọc `GET /projects/{p}/survey-plans` và so khớp kế hoạch **đang hoạt động** (`PLANNED`/`IN_PROGRESS`) cùng route, segment set và dải khảo sát.
  - Có kế hoạch khớp → thông báo "BE từ chối tạo kế hoạch mới (HTTP 409 …): dự án đã có N kế hoạch đang hoạt động trên cùng tuyến và dải khảo sát…" kèm nút **"Mở kế hoạch KH-xxxxxxxx (Đang thực hiện, lịch …)"** dẫn tới chi tiết kế hoạch đó.
  - Không có kế hoạch khớp (hoặc không đọc được danh sách) → **không** kết luận là trùng; hiện "BE dùng mã này cho nhiều loại xung đột nên chưa xác định được nguyên nhân cụ thể" kèm mã tham chiếu `correlationId`.
- **Giới hạn do BE:** `GET survey-plans` và `GET survey-plans/{id}` **không trả `surveyType`** (BE chỉ nhận loại khi tạo), nên FE không so được "cùng loại khảo sát"; thông báo nói rõ điều này. Ghi nhận cho BE (xem cuối).
- **File:** `src/api/services/surveyCreateCommands.ts` (`activePlansForScope`), `src/pages/(pm)/CreateSurvey.tsx` (nội dung thông báo, `errorActions`), `src/pages/(pm)/create-survey/CreateSurveyForm.tsx` (prop `errorActions`).
- **Kiểm (phần a, 8/8 đạt):** tạo kế hoạch BASELINE trùng kế hoạch seed → POST 409 `duplicate_request` (correlation `58900b1d-bae5-40a5-b008-5668a893b862`); thông báo nêu "đã có 1 kế hoạch đang hoạt động…", nút mở kế hoạch dẫn tới `/pm/surveys?surveyRecordId=…&surveyRecordKind=PLAN` và modal "Chi tiết kế hoạch khảo sát".

## Mục 3 — Form bị kẹt sau lỗi tạo kế hoạch
Nguyên nhân gốc (đọc mã): khối `catch` của `surveyCreateCommands.run` luôn ghi journal vào `sessionStorage`, kể cả khi lỗi xảy ra **trước khi gửi lệnh nào**, và sau 409 journal vẫn được giữ nên `recoveryLabel` khóa cả form; "Hủy bỏ" chỉ điều hướng, không giải phóng.
- **Đã sửa:**
  1. 4xx dứt khoát (không phải 408/429) ở bước `PLAN` khi chưa có biên nhận → **giải phóng journal ngay** (lệnh chắc chắn không có tác động), form mở lại.
  2. Lỗi kiểm tra trước khi gửi không còn lưu journal.
  3. Journal ghi lại `lastError` (status/code/correlationId).
  4. `surveyCreateCommands.discard()`: dùng cho **Hủy bỏ** và tự động khi **mở trang/F5**. Chưa có biên nhận: nếu BE đã từ chối dứt khoát, hoặc `GET survey-plans` không thấy kế hoạch trùng lịch/phạm vi → xóa journal; nếu thấy kế hoạch khớp → **giữ** và chỉ dẫn "Đối chiếu và thử lại" (phát lại cùng Idempotency-Key, tránh tạo trùng). Đã có kế hoạch nhưng giao nhiệm vụ bị từ chối dứt khoát → bỏ journal (kế hoạch vẫn nằm ở BE, báo rõ). Kết quả chưa rõ (timeout/đang đọc lại) → giữ nguyên key/body, chỉ đối chiếu bằng GET.
  5. Tạo kế hoạch: tuyến có hình học chưa `COMPLETE` (seed Project A có `DEMO-A` `LEGACY_INCOMPLETE`) bị **bỏ qua kèm thông báo** thay vì làm hỏng cả trang ("Geometry chưa COMPLETE…"). Hình học sai project/section/version vẫn báo lỗi.
- **File:** `src/api/services/surveyCreateCommands.ts`, `src/api/services/surveyPlanningService.ts` (`routes(project, onSkip)`), `src/pages/(pm)/CreateSurvey.tsx`.
- **Kiểm:** phần (a) journal rỗng và form không khóa sau 409; phần (b, 5/5 đạt): dựng journal dở dang (PLAN, chưa biên nhận) → F5 → journal được đối chiếu và xóa, form mở; journal dở dang khác + "Hủy bỏ" → giải phóng và về `/pm/surveys`; phần (c, 3/3 đạt): tạo kế hoạch **PERIODIC** hợp lệ → `POST survey-plans 201` + `POST survey-tasks 201`, GET đọc lại thấy 2 kế hoạch.
- **Chưa kiểm được:** nhánh "đã có kế hoạch, bước giao nhiệm vụ bị 4xx" (cần BE từ chối giao nhiệm vụ sau khi tạo kế hoạch) và nhánh timeout/mất mạng thật; logic có trong `discard()` nhưng chưa chạy với lỗi thật.

## Mục 4 — Phân biệt kế hoạch / nhiệm vụ
- **Đã sửa (danh sách và modal):**
  - Nhãn **KẾ HOẠCH** (xanh trời) / **NHIỆM VỤ** (xanh ngọc) và nhãn **Bổ sung** cho nhiệm vụ con; mã rút gọn `KH-xxxxxxxx` / `NV-xxxxxxxx` (tìm kiếm theo mã rút gọn được).
  - Kế hoạch: "Lịch bay dự kiến" (có giờ kết thúc nếu BE trả) và Operator tổng hợp từ các nhiệm vụ của kế hoạch (`planId`); nhiệm vụ: "Hạn hoàn thành" (`dueAt`, hoặc "không đặt"), Operator (`operatorDisplayName`), phạm vi.
  - Quan hệ: nhiệm vụ → kế hoạch (`planId`), nhiệm vụ gốc → nhiệm vụ bổ sung (`supplementTaskId`), nhiệm vụ bổ sung → nhiệm vụ gốc (suy từ `supplementTaskId` của nhiệm vụ gốc trong danh sách; modal còn đọc `parentTaskId` từ chi tiết), kế hoạch → các nhiệm vụ của nó; mỗi quan hệ có nút mở bản ghi liên quan.
  - Modal có khối "Loại khảo sát" và "Bản ghi liên quan".
- **Loại khảo sát Cơ sở/Định kỳ/Đột xuất — không hiển thị được từ BE:** `SurveyPlanSummary`, `SurveyPlanV2ResponseDto`, `SurveyTaskSummary`, `SurveyTaskV2ResponseDto` đều **không có trường `surveyType`** (chỉ có trong request tạo: `BASELINE|PERIODIC|AD_HOC`). FE hiển thị "BE chưa trả loại khảo sát" và chỉ nhận diện **Bổ sung** qua quan hệ gốc–con; không bịa loại. "Bổ sung" không phải một `surveyType` của BE mà là quan hệ.
- **File:** `src/api/services/surveyService.ts` (`SurveyMissionItem`: `short_code`, `due_label`, `plan_id`, `supplement_task_id`, `parent_task_id`), `surveyPlanningService.ts` (`SurveyRecord`, `missions()`), `src/pages/(pm)/surveys/SurveyCard.tsx`, `SurveyTable.tsx`, `SurveyRecordDetailModal.tsx`, `src/pages/(pm)/SurveyRequests.tsx`.
- **Kiểm (phần d, 9/9 đạt):** tạo nhiệm vụ bổ sung (API, dữ liệu test) rồi kiểm danh sách (KẾ HOẠCH/NHIỆM VỤ, `KH-23954F22`, `KH-50A7E6D2`, `NV-E29DD031`…, lịch bay, hạn hoàn thành, Operator, nhãn Bổ sung, nút nhiệm vụ gốc/bổ sung) và modal mở từ nút "Nhiệm vụ gốc" (mã, hạn, loại khảo sát, khối "Bản ghi liên quan").

## Dữ liệu test tạo thêm (stack `roadguard-v3`, Project A)
- Một kế hoạch **PERIODIC** (hiện trong danh sách là `KH-23954F22`) và nhiệm vụ giao cho `operator-a` được tạo trong cùng lượt qua giao diện (mã nhiệm vụ `NV-E29DD031` xuất hiện trong danh sách; chưa đối chiếu riêng liên kết `planId` của hai mã này).
- Nhiệm vụ gốc seed `260cf5b5-15b3-4d4e-b5a2-672467bd0082` đã chuyển sang **SUPPLEMENT_REQUIRED** và có nhiệm vụ bổ sung con (tạo bằng API `POST /survey-tasks/{id}/supplements`, lý do `[TEST-FE] E5…`). **Không hoàn tác.** Ảnh hưởng: nhiệm vụ này không còn `SUBMITTED` (thẻ "Xác nhận hoàn tất nhiệm vụ khảo sát" của PM không hiện cho nó).
- Không tạo hold/dữ liệu ngoài khảo sát.

## Lỗi/thiếu phía BE (để gửi BE)
1. **Không có `surveyType` khi đọc** kế hoạch/nhiệm vụ (`GET survey-plans`, `GET survey-plans/{id}`, `GET survey-tasks`, `GET survey-tasks/{id}`); FE không hiển thị được Cơ sở/Định kỳ/Đột xuất và không so được "cùng loại" khi giải thích 409. Đề nghị thêm `surveyType` vào các DTO đọc.
2. **`duplicate_request` dùng chung** cho kế hoạch trùng (correlation `58900b1d-bae5-40a5-b008-5668a893b862`) và các xung đột khác; đề nghị mã riêng (ví dụ `survey_plan_active_conflict`) kèm id kế hoạch đang trùng để FE không phải suy đoán bằng GET.
3. **`GET survey-tasks` (summary) không có `parentTaskId`**: FE phải suy nhiệm vụ gốc từ `supplementTaskId` của nhiệm vụ gốc. Đề nghị thêm `parentTaskId` vào `SurveyTaskSummary` (chi tiết `GET survey-tasks/{id}` đã có).
4. Seed Project A có tuyến `DEMO-A` hình học `LEGACY_INCOMPLETE` (cùng `MOCK-A` đầy đủ): FE đã bỏ qua tuyến không dùng được; nếu đây là dữ liệu cố ý thì không phải lỗi, chỉ ghi nhận.
