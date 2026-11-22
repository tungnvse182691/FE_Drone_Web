# Kiểm tra động "tạo 1 ra 2" — luồng ghi PM `/pm/*` và Giám sát `/sup/*`

Ngày kiểm tra: 2026-11-17. BE: `roadguard-dev1` (https://localhost:18443), FE dev http://localhost:5173. Không sửa code FE/BE.
Công cụ: puppeteer-core + Edge, thư mục `scratchpad/e2e` (`dup-lib.mjs` là thư viện; kịch bản `dup-*.mjs`; kết quả thô `dup-results.jsonl`, `dup-reads-*.json`).
Dữ liệu tạo thêm đã ghi vào `TEST-DATA-LEDGER.md` mục B4.

## 1. Cách đo
Mỗi lần bấm, bắt mọi request POST/PUT/PATCH/DELETE tới `/api/v1` (trừ `/auth/*`), ghi URL, trạng thái, Idempotency-Key, băm body. Đối chiếu số bản ghi BE (GET list hoặc SQL đếm bảng) và số dòng UI trước/sau.
Các chế độ bấm:
- `single`: một click chuột thật.
- `dbl`: nhấp đúp (hai click, `count:2`).
- `gap30`: hai click cách 30 ms.
- `slow`: chặn request ghi 2 giây rồi bấm 3 lần (t=0, 0,6 s, 1,1 s).
- `rapid`: gọi `element.click()` hai lần trong cùng một tác vụ JS (không có render nào xen giữa). Người dùng thật không làm được, nhưng nó lộ ra nút chỉ được chặn bằng state React chứ chưa có `useRef`.

Phân loại nguồn lỗi theo yêu cầu: 2 request ghi = lỗi FE; 1 request nhưng 2 bản ghi BE = lỗi BE; 1 bản ghi BE nhưng 2 dòng UI = lỗi hiển thị FE.

## 2. Kết luận ngắn
1. Với thao tác người dùng thật (single, dbl, gap30, slow), mọi luồng ghi đã test đều chỉ phát ra đúng 1 lệnh ghi. Không có luồng nào tạo 2 bản ghi trong BE do một click.
2. Chỉ ở chế độ `rapid` (hai click trong cùng một tác vụ JS) mới ra 2 lệnh ghi, ở các luồng: tạo nhãn, giao lại nhiệm vụ đo, hủy nhiệm vụ đo, giao lại và hủy khảo sát, tạo job, chạy AI, gia hạn đồng hồ, tạo bản nhãn mới, duyệt nhãn. Mức độ thấp. Hai lệnh dùng hai Idempotency-Key khác nhau nên BE không chặn được (xem mục 4). Các luồng dùng `useRef` (gửi lời mời nhân sự, tạo dự án) không bị.
3. Không có dòng trùng trong DOM ở 16 trang PM và 16 trang Sup (không có dòng giống hệt nhau trong `tbody`, `ul`, `[data-testid]`; không có cảnh báo trùng `key` của React trong console). Danh sách "Tải thêm" của bộ dữ liệu khảo sát (29 bản) không đặt thêm dòng trùng.
4. Hai điều dễ bị hiểu nhầm là "tạo 1 ra 2" mà thật ra do thiết kế hoặc do UI:
   - Tạo khảo sát (`/pm/surveys/create`): một lần bấm tạo gồm một kế hoạch (`survey-plans`) và một nhiệm vụ (`survey-tasks`) liên tiếp (`api/services/surveyCreateCommands.ts:35-38`), mỗi bước có Idempotency-Key cố định lưu trong journal. Danh sách `/pm/surveys` hiện cả kế hoạch lẫn nhiệm vụ nên người dùng thấy 2 dòng. Đây là thiết kế, không phải lỗi. Chưa chạy được trên UI (xem mục 6).
   - "Đánh dấu tất cả đã đọc" (`/pm/notifications`) gửi N request `POST /notifications/{id}/read`, mỗi thông báo một request (tổng 4 request cho 4 thông báo). Đúng thiết kế (BE không có endpoint đọc hàng loạt), nhưng người đếm request sẽ thấy "1 click ra 4 lệnh".
5. Lỗi chức năng phát hiện thêm (không phải trùng lặp nhưng có thật):
   - Xin gia hạn đồng hồ (P1) luôn bị BE trả 400 `validation_error "Clock duty request failed"`. Nguyên nhân: FE gửi `If-Match: <version>` không có dấu ngoặc kép (`api/services/dashboardService.ts:244`), BE chỉ nhận ETag có ngoặc kép. Đã kiểm bằng script: cùng body, ETag không ngoặc → 400, có ngoặc kép → 201.
   - Sau khi tạo dự án thành công (201), modal không đóng và danh sách `/sup/projects` không tự có dự án mới. Phải tải lại trang mới thấy. Người dùng dễ bấm lại hoặc tưởng chưa tạo (xem mục 5).

## 3. Bảng luồng đã test

Cột "lệnh ghi" ghi theo thứ tự single / dbl / gap30 / slow (rapid ghi riêng ở cuối). "BE +" là số bản ghi tăng ở BE sau thao tác. Ảnh chụp ở `scratchpad/e2e` nếu có.

| Luồng (vai) | Hành động (route) | Lệnh ghi (single / dbl / gap30 / slow) | rapid | BE + | UI | Kết luận | Bằng chứng |
|---|---|---|---|---|---|---|---|
| Nhãn huấn luyện (PM) | Tạo nhãn `/pm/research-validation` | 1 / 1 / 1 / 1 | 2 (2 key khác nhau, BE +2) | +1 mỗi lần | +1 dòng, không trùng | OK. rapid: lỗi FE mức thấp | `POST /projects/{id}/labels 201` key=f882bae0, a92bb1e4, d3306664, 8d3a47ce; rapid 34600738 + da6ba647. Guard state: `pages/(sup)/research/TrainingLabelsPanel.tsx:59` |
| Nhãn (PM) | Duyệt nhãn | 1 / 1 / 1 / 1 | 2 | +1 (lần đầu); các lần sau 409 vì cùng một nhãn đã duyệt | báo lỗi 409 hiện đúng | OK (số lệnh ghi đúng 1). Các lần sau 409 là do kịch bản chọn lại cùng nhãn | `POST /labels/{id}/review` key=ce5627b3 (200); sau đó 409 `invalid_state_transition` |
| Nhãn (PM) | Lưu bản nhãn mới (sửa khung) | 1 / 1 / 1 / 1 | 2 (lệnh 2 trả 412, BE +1) | +1 | báo "HTTP 412" dù lệnh 1 đã thành công | OK. rapid: UI hiện lỗi sai sau khi đã tạo được (mức thấp) | key=6738b997, f800a300, 5e97b160, e3be9278; rapid a230a270 + 7c3b7866 (412) |
| Giao lại nhiệm vụ đo (PM) | `/pm/field-tasks` → Chi tiết & Ảnh → Xác nhận giao việc | 1 / 1 / 1 / 1 | 2 (cả 2 trả 201, BE +2 sự kiện REASSIGNED) | +1 sự kiện | n/a | OK. rapid: lỗi FE mức thấp; BE không chặn giao lại 2 lần | `POST …/field-inspection-tasks/{id}/reassign 201` key=398c0a36, f574fb17, c48e5fbc, 199fba4f; rapid 24cc7828 + 1d91b586 |
| Hủy nhiệm vụ đo (PM) | cùng modal → Xác nhận hủy | 1 / 1 / 1 / 1 | 2 (lệnh 2 trả 409) | +1 | n/a | OK. rapid chỉ thừa một lệnh bị BE từ chối | key=aa0bf2b1, 9be29483, 78c8234d, 9042f6fd; rapid bda0e490 (201) + 17341f3c (409) |
| Giao lại nhiệm vụ khảo sát (PM) | `/pm/surveys` chi tiết TASK | 1 / 1 / 1 / 1 | 2 (lệnh 2 trả 412) | trạng thái → REASSIGNED, 1 lần | thông báo thành công | OK. rapid: thừa 1 lệnh bị 412 | `POST /survey-tasks/{id}/reassign 200` key=4fc0c357, bd3a1cbb, 35cadd84, 575584e9; rapid 71d679ec + a56c5473 (412). Guard state `pages/(pm)/surveys/SurveyRecordActions.tsx:48` |
| Hủy nhiệm vụ khảo sát (PM) | cùng chi tiết | 1 / 1 / 1 / 1 | 2 (lệnh 2 trả 412) | → CANCELLED | OK | OK. rapid thừa 1 lệnh bị 412 | key=c0ddfc68, 6efd4898, a72f1a89, 577ea89d; rapid df88fb47 + 0e5c1923 (412) |
| Bổ sung nhiệm vụ khảo sát (PM) | Xác nhận tạo nhiệm vụ bổ sung | 1 / 1 / 1 / 1 | 2 | 0 | hiện lỗi | Số lệnh ghi đúng 1 mỗi click. Không tạo được bản ghi: BE trả 404 `survey_request_not_found` vì thử trên nhiệm vụ NEW_ASSIGNED (chưa nộp). Chưa kết luận về tạo bổ sung thật | key=7b781aab, c20b13c6, 217aa0f8, aad4883b (404) |
| Đánh giá bộ dữ liệu (PM) | `/pm/surveys` → bản nộp mới nhất → Lưu đánh giá | 1 (single) | chưa test | +1 | thông báo đúng | OK (chỉ single). Các chế độ khác chưa chạy: form đánh giá bị ẩn sau khi tôi khóa baseline trên cùng bản nộp | `POST /datasets/{id}/assessments 201` key=efa51365 |
| Khóa baseline (PM) | Khóa baseline | dbl: 1 | chưa test | +1 | thông báo đúng | OK (dbl). Hành động một lần nên chỉ chạy 1 chế độ | `POST /projects/{id}/baseline-selections 201` key=1fd087b9 |
| Tạo job xử lý (PM) | Tạo job xử lý | dbl 1 / gap30 1 / slow 1 (single chưa chạy được do nhiễu) | 2 (BE +2 job) | +1 | thông báo đúng | OK. rapid: lỗi FE mức thấp | `POST /processing-jobs 202` key=b2d7a87d, e49d61be, 26c574e5; rapid 3b7ab383 + eef32b57. Guard state `pages/(pm)/surveys/SurveyDatasetPanel.tsx:53` |
| Chạy AI mock (PM) | Chạy AI mock | gap30 1 / slow 1 (single, dbl chưa chạy được do nhiễu) | 2 (BE +2 lần chạy AI) | +1 | thông báo đúng | OK. rapid: lỗi FE mức thấp | `POST /projects/{id}/ai-mock-runs 202` key=3d7aa65d, cf86635b; rapid b411d4c1 + 283cf8b4 |
| Giao đội thi công (PM) | `/pm/repair-batches/assign` → Ban hành lệnh giao việc | dbl: 1 | chưa test | +1 task | n/a | OK (hành động một lần, 1 hạng mục) | `POST …/items/{id}/assign 201` key=40e98592 |
| Gia hạn đồng hồ (PM) | `/pm/dashboard` → Xin gia hạn | 1 / 1 / 2 / 1 | 2 | 0 | lỗi hiện đúng | Lỗi chức năng, không phải trùng: luôn 400 do If-Match không có ngoặc kép. gap30 ra 2 lệnh vì lệnh 1 lỗi sau vài ms nên nút bật lại trước click thứ 2 (hợp lệ) | `POST …/clocks/{id}/extensions 400 validation_error` key=27a457e9, 7773726b, 651e2c3a + 8049230d, d67568fc. `dashboardService.ts:244` |
| Cập nhật hồ sơ (PM) | `/pm/profile` → Lưu Họ và Tên | 1 / 1 / 1 / 1 | chưa test | n/a (PUT, idempotent) | OK | OK. Lưu ý: PUT /profile không gửi Idempotency-Key (hợp lệ cho PUT) | `PUT /profile 200` |
| Đánh dấu thông báo đã đọc (PM) | `/pm/notifications` → Đánh dấu tất cả đã đọc | 4 (single) | chưa test | n/a | OK | Theo thiết kế: N request cho N thông báo. Những lần dbl/gap30/slow sau đó nút bị khóa vì hết thông báo chưa đọc | `POST /notifications/{id}/read 200` ×4 |
| Mời nhân sự (Sup) | `/sup/personnel` → Gửi lời mời kích hoạt | 1 / 1 / 1 / 1 | 1 | +1 mỗi lần | n/a | OK, kể cả rapid (có guard `useRef`) | `POST /invitations 201` key=d5e52455, 6a5fbe8e, a9145322, 25ea6478, rapid f390b37f |
| Tạo dự án (Sup) | `/sup/projects` → Thêm mới dự án | 1 / 1 / 1 / 1 | 1 | +1 mỗi lần | Danh sách và modal không tự cập nhật sau 201 (xem mục 5) | Số lệnh ghi OK. Vấn đề hiển thị FE | `POST /projects 201` key=35223316, d3c3f51b, 3c4ab14d, 0e05bcea; rapid b3aaa533. Ảnh `scratchpad/e2e/dup-proj-after.png` |
| Tạo gói đề xuất (PM) | `/pm/proposals` → Tạo gói đề xuất mới | dbl: 1 | chưa test | 0 | báo 409 | Số lệnh ghi đúng 1. Không tạo được bản ghi: BE 409 `active_scope_conflict` vì khiếm khuyết duy nhất đã có phạm vi hoạt động | key=033995a1, 8f8054d8 (409) |

## 4. BE có idempotent không (kiểm bằng script `dup-be-idem.mjs`)
Gửi cùng Idempotency-Key hai lần, rồi một lần khác key cùng body.
| Endpoint | Lần 1 | Lần 2 (cùng key) | Lần 3 (key khác, cùng body) | Số bản ghi |
|---|---|---|---|---|
| `POST /projects/{id}/survey-tasks` | 201 | 201, cùng id (replay) | 201, id khác | 5 → 7 (đúng: 2 key khác nhau = 2 bản ghi) |
| `POST /projects/{id}/field-inspection-tasks` | 201 | 200, cùng id (replay) | 201, id khác | 6 → 8 |
| `POST /projects/{id}/survey-plans` | 409 (trùng phạm vi, không tạo mới) | 409 | 409 | không đổi |

Kết luận: BE idempotent theo Idempotency-Key (cùng key trả lại bản ghi cũ, không tạo thêm). BE không chống trùng theo nội dung: hai lệnh cùng body nhưng key khác sẽ ra hai bản ghi. Vì vậy mọi chỗ FE sinh key mới cho mỗi lần gọi (labels, job, AI, giao lại…) chỉ an toàn khi FE chặn nút bấm kép; tạo khảo sát và các lệnh có journal (tạo dự án, nhiệm vụ đo, gói đề xuất) dùng key cố định lưu journal nên an toàn hơn.

## 5. Chi tiết các điểm đáng chú ý
1. Hai click trong cùng một tác vụ JS (`rapid`), mức thấp. Guard chỉ là state (`if (busy) return` hoặc `disabled={busy}`), React chưa kịp render lại. Ra 2 lệnh ghi, 2 key khác nhau; BE nhận cả hai (tạo nhãn, tạo job, chạy AI, giao lại nhiệm vụ đo) hoặc từ chối lệnh thứ hai (hủy: 409/412). Người dùng thật không tạo ra tình huống này bằng chuột; nhưng sửa rẻ bằng `useRef` như các luồng đã làm (mời nhân sự, tạo dự án, giao biện pháp an toàn).
2. Tạo dự án (Sup): sau `POST /projects` 201, modal vẫn mở với nút "Đọc lại kết quả", danh sách không có dự án mới sau 8 giây, kèm cảnh báo "Một phần thông tin nhân sự hoặc thống kê chưa tải được". Bấm "Đọc lại kết quả" không phát request ghi nào nhưng danh sách vẫn chưa cập nhật; chỉ khi tải lại trang mới thấy. Trên cùng phiên, mở modal lần sau trước khi tải lại có thể không thấy nút tạo (journal chưa DONE). Đây là cách người dùng gặp "tạo mà không thấy", rồi tạo lại.
3. Đọc trang (mức thấp): hầu hết trang PM/Sup đọc cùng URL nhiều lần, trong đó có cặp cách nhau ≤ 200 ms (dấu hiệu React StrictMode ở chế độ dev, ví dụ `/pm/surveys` 7 cặp, `/sup/surveys` 20 cặp, `/sup/surveys/create` 21 cặp, `/sup/field-tasks` 5 cặp). Không trang nào phát lệnh ghi khi chỉ mở. Chi tiết trong `dup-reads-pm-a.json`, `dup-reads-supervisor.json`. Cần xác nhận lại trên bản build (không StrictMode); đặc biệt `/sup/surveys/create` đọc 125 request cho một lần mở là nhiều bất thường.

## 6. Chưa test được (kèm lý do)
- Tạo khảo sát `/pm/surveys/create` trên UI: trang báo "Geometry chưa COMPLETE hoặc sai project/section/version" vì tuyến DEMO-A (`69b885c9…`) chưa có bộ phân đoạn công bố. Chỉ kiểm được bằng script BE (survey-tasks, survey-plans).
- Tạo nhiệm vụ đo trên UI (`/pm/field-tasks` → Tạo nhiệm vụ): FE chặn trước khi gửi ("Chưa có reference KEEP_NEW của Report cho Defect này"), 0 lệnh ghi. Không có dữ liệu thỏa điều kiện.
- Tạo gói đề xuất, tạo bản ghi mới: khiếm khuyết duy nhất đã có phạm vi hoạt động (409).
- Hoãn kế hoạch khảo sát: kế hoạch `c8c9dd2a…` đang IN_PROGRESS không hiện nút hoãn; kế hoạch kia đã POSTPONED.
- Phong tỏa pháp lý (`/sup/system-control`): kịch bản bị treo sau khi mở modal (chưa rõ do kịch bản hay do request), không có bản ghi tạo ra (`RetentionHolds` = 0). Chưa kết luận.
- Duyệt hạng mục Normal (Sup), xác nhận cuối, nghiệm thu (PM/Sup), biện pháp an toàn, hiệu chỉnh/hủy/tiếp nối/xem xét lại hạng mục, chỉ định đồng hồ, review kết quả đo, quyết định hình học, thống kê khiếm khuyết, xuất báo cáo, xuất bản công khai, đánh giá lưu trữ, gia hạn phạm vi xử lý, đặt lại mật khẩu, khóa/mở tài khoản, tạo CRS/tuyến/bản nháp hình học/bộ phân đoạn, chính sách Fast Track, quên mật khẩu, tải tệp: chưa chạy bộ kiểm 5 chế độ trong phiên này. Các luồng này phần lớn đã có test chức năng trước đó (xem HUONG-DAN-SU-DUNG-API-DA-NOI.md), nhưng chưa đo số lệnh ghi theo từng kiểu bấm kép. Cần dữ liệu mới (hạng mục AwaitingApproval/Reviewed, khiếm khuyết mới) cho phần lớn.
- Kịch bản lưu sẵn để chạy lại: `dup-lib.mjs`, `dup-labels.mjs`, `dup-labels2.mjs`, `dup-ft.mjs`, `dup-survact.mjs`, `dup-ds.mjs`, `dup-invite.mjs`, `dup-proj.mjs`, `dup-ext.mjs`, `dup-misc.mjs`, `dup-prop.mjs`, `dup-reads.mjs`, `dup-domdup.mjs`, `dup-be-idem.mjs`. Chạy qua `run.sh`; không chạy song song hai kịch bản cùng tài khoản (đăng nhập Bearer của crew-a trả 409 khi đồng thời, và có lần làm nút của bộ dữ liệu biến mất).

## 7. Kết luận sau sửa (chạy lại 2026-11-17)
Đã sửa FE (tsc và `vite build` pass), chạy lại cùng kịch bản. Dữ liệu tạo thêm: `TEST-DATA-LEDGER.md` mục B5.

| Luồng | Trước sửa (rapid) | Sau sửa (single / rapid) | BE + | UI | Kết luận |
|---|---|---|---|---|---|
| Gia hạn đồng hồ (PM) | luôn 400 `validation_error` (If-Match không ngoặc kép) | single: 201 (đồng hồ idx 7); rapid: 1 lệnh. Các đồng hồ khác trả 403 `clock_decision_authority_required` (cần quyền Giám sát) hoặc 409 `clock_source_stale`: đây là phản hồi nghiệp vụ của BE, không còn 400 | +1 | lỗi/hết lỗi hiện đúng | Đã sửa. `dashboardService.ts:244` bọc ngoặc kép; chốt `OperationalClocksWidget.tsx` (`extensionGuard`) |
| Tạo nhãn | 2 lệnh | 1 / 1 | +1 mỗi lần | +1 dòng | Đã sửa (`TrainingLabelsPanel.tsx` guard) |
| Lưu bản nhãn mới | 2 lệnh, UI hiện 412 giả | 1 / 1, báo thành công, không còn 412 | +1 | đúng | Đã sửa |
| Duyệt nhãn | 2 lệnh | rapid: 1 (200) | +1 | đúng | Đã sửa |
| Giao lại / hủy nhiệm vụ đo | 2 lệnh | 1 / 1 cho cả hai | +1 sự kiện | n/a | Đã sửa (`FieldTaskReadDetails.tsx` `actGuard`) |
| Giao lại / hủy nhiệm vụ khảo sát | 2 lệnh (lệnh 2 trả 412) | 1 / 1 (200) | 1 lần | thông báo đúng | Đã sửa (`SurveyRecordActions.tsx`) |
| Bổ sung nhiệm vụ khảo sát | 2 lệnh | rapid: 1 (vẫn 404 vì nhiệm vụ chưa nộp, như cũ) | 0 | lỗi hiện | Số lệnh đã đúng; chưa kết luận tạo bổ sung thật |
| Tạo job xử lý | 2 job | 1 / 1 (202) | +1 | thông báo đúng | Đã sửa (`SurveyDatasetPanel.tsx`) |
| Chạy AI mock | 2 lần chạy | 1 / 1 (202) | +1 | thông báo đúng | Đã sửa |
| Đánh giá bộ dữ liệu, khóa baseline, retry job | chưa test rapid | chưa chạy lại: form đánh giá bị ẩn sau khi đã khóa baseline trên bản nộp đó | | | Đã thêm guard cùng `run`, chưa đo động |
| Tạo dự án (Sup) | 1 lệnh, modal kẹt, danh sách không có dự án mới | rapid (ngày bàn giao tương lai): 1 lệnh, modal đóng, vào trang dự án, danh sách có dự án mới. single (ngày bàn giao hôm nay): như vậy | +1 | đúng | Đã sửa |

Nguyên nhân tạo dự án: danh sách `GET /projects` chỉ trả `primaryProjectManagerUserId` khi membership PM đã hiệu lực (`ProjectMembers.ValidFrom` = ngày bàn giao). Kịch bản chọn ngày bàn giao 2026-12-01 (tương lai) nên PM = null, FE ném "Đã tạo dự án nhưng phân công PM đọc lại chưa khớp" ngay sau 201 mà không cập nhật danh sách. Sửa ở `projectService.ts` (createProject, đối chiếu PM bằng receipt 201 khi PM chưa hiệu lực) và `ProjectList.tsx` (có receipt mà đọc lại lỗi: đọc lại danh sách thật, nút "Đọc lại kết quả" vẫn đọc lại không tạo lại, giữ Idempotency-Key journal). Xác nhận: sau khi tạo với ngày bàn giao hôm nay, danh sách BE hiện PM bình thường.

Đọc trùng (mục 5.3): `/sup/surveys/create` thực ra khớp route `surveys/:id` (id = `create`, `DroneMissionAIReview`), vì giám sát không có trang tạo khảo sát; trang đó đọc mọi dự án nhiều lần để tìm "id" này. Không có vòng lặp/effect đổi dependency liên tục. Các cặp ≤200 ms còn lại chủ yếu do StrictMode (dev), ghi chú không đổi `main.tsx`. Đã giảm phần nguồn FE thật: gộp `fetchProjects` đồng thời (reads của `/sup/surveys/create` mỗi dự án trước 4 lần đọc work-package, nay 1 lần) và gom đọc theo dự án trong `surveyPlanningService.missions` (`/pm/surveys`: 167 xuống 82 request; còn lại 62 lần `survey-tasks/{id}` là đọc chi tiết từng bản ghi, nhân đôi do StrictMode).
"Đánh dấu tất cả đã đọc": giữ nguyên, đã tuần tự với `markingAll` ref, không lặp khi bấm đúp (không chạy lại do hết thông báo chưa đọc).
