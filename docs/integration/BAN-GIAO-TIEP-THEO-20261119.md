# Bàn giao cho AI tiếp theo — RoadGuard FE Web (PM `/pm/*`, Giám sát `/sup/*`) — 2026-11-19

> Đọc file này trước. Người dùng (Hoàng) làm FE solo; mobile bỏ qua. **Nguyên tắc mới nhất của người dùng: FE phải TUÂN THEO BE** — BE có gì làm đúng logic đó; KHÔNG đẻ thêm tính năng FE không có API BE; FE thừa thì XÓA; thiếu so với BE thì thêm/sửa. Lỗi của BE thì ghi lại để người dùng gửi BE (không sửa BE). Luôn xem thêm `AGENTS.md` ở gốc FE (dữ liệu thật, lỗi phải hiển thị, không mock, giữ UI Hoàng Hải, ghi mọi thay đổi vào .md, dữ liệu test tạo qua API và ghi sổ `TEST-DATA-LEDGER.md`).

## 0. Việc còn mở — đọc và làm theo mục này trước

**Phạm vi:** chỉ FE Web PM/Giám sát. NewBE đã chốt nghiệp vụ; dùng code, OpenAPI và kết quả chạy thật của `RoadGuardSystem-develop_NewBE` làm chuẩn, không sửa BE. Trước khi sửa code, đọc `AGENTS.md`, các tài liệu nghiệp vụ FE/NewBE và hợp đồng của luồng sẽ làm. Các ghi chú cũ bên dưới chỉ dùng làm bối cảnh nếu mâu thuẫn với mục này.

**Hiện trạng:** chưa xác định thêm chức năng Web nào thiếu API trong phần đã rà. Ba dòng “Chưa nối” trong `API-WIRING-STATUS.md` (`GET /me`, `PATCH /me`, `POST /admin/users/{id}/password-reset`) là đường dẫn thay thế của chức năng FE đã có; không làm UI trùng. Luồng tái phát đã nối qua `POST /projects/{p}/candidate-decisions` với `KEEP_NEW` + `recurrence`; lệnh lifecycle `recurrences` tách riêng bị BE từ chối vì thao tác phải nguyên tử. Mốc kiểm cuối: 27/27 test FE, TypeScript và Vite build đạt. Kết quả này không thay thế nghiệm thu ghi thật.

### P0 — W08 Fast Track: xử lý trước

1. Đọc [bằng chứng Fast Track](FASTTRACK-LIVE-20261119.md), `fastTrackFormSources.ts`, `fastTrackService.ts`, `FastTrackDispatchModal.tsx` và `FieldInspectionWorkflowRepository.Business.cs` (`ValidateSourceAsync`). Lần thử **assign qua UI** trả `409 source_not_ready`, correlation `8b13ce7b-b974-469e-a145-4828db326157`. FE trước đó gửi `surveyTaskId` nhầm vào `task.surveyId`; BE cần `Surveys.Id` của đúng chuỗi detection/job. Đừng nhầm kết quả này với lần thử tạo FIELD riêng.
2. Tìm API đọc Web có thẩm quyền trả `Surveys.Id` đúng nguồn, hoặc dùng hồ sơ FIELD hợp lệ có sẵn của đúng khiếm khuyết để đọc các tham chiếu nguồn. FE đã chặn nguồn suy diễn từ AI run. Không tạo hồ sơ FIELD mồi, không ghi/copy ID từ DB vào FE, không thay pins/phạm vi để ép qua guard. FIELD có sẵn là một cách đọc nguồn, không phải điều kiện nghiệp vụ bắt buộc của `assign`. Nếu chưa có nguồn hợp lệ, ghi đúng API/quyền/dữ liệu đã kiểm và tiếp tục các mục P1; không bypass guard.
3. Nghiệm thu bằng phiên PM: gửi `assign` từ UI với đúng nguồn, policy, Crew, `If-Match` và `Idempotency-Key`; đích là HTTP 201 và GET đọc lại đúng nhiệm vụ/binding. Sau các bước thực hiện hợp lệ, chạy `final-confirmation` và GET đối chiếu trạng thái cuối. Nếu lỗi, lưu method/path, HTTP, mã nghiệp vụ, correlation ID và trạng thái sau GET.

### P1 — Đã nối FE, còn thiếu nghiệm thu qua UI

| Luồng | Việc còn lại |
|---|---|
| W01 — Lời mời, nhân sự | Chấp nhận lời mời bằng token thật từ Mailpit; xác nhận vai trò/dự án sau đăng nhập. Kiểm lưu đơn vị công tác và mở lại đúng nhân sự. |
| W02 — Vòng đời dự án | PM khai báo hoàn thành thi công với tệp dự án đã xác minh; Giám sát xác nhận đúng khai báo. GET vòng đời đối chiếu hành động mới. |
| W04 — Thẩm định AI | Chạy `LINK_EXISTING` trên phát hiện hợp lệ; GET đúng `decisionId` và khiếm khuyết đích. Kiểm phiên PM, không dùng endpoint chi tiết AI Bearer-only để xác nhận ghi. |
| W05 — Khảo sát/AI | Bấm tạo lượt chạy AI trên dataset hợp lệ; kiểm phản hồi ghi và đọc lại lượt chạy. GET `geometry-package` đã kiểm HTTP 200 với ETag đúng scope. |
| W06 — Hiện trường | Duyệt số đo thật bằng vai trò được phép; mở lại nhiệm vụ và kiểm quyết định/trạng thái. |
| W07 — Sửa chữa/nghiệm thu | Duyệt gói Normal, nghiệm thu, ký đóng, xuất DOSSIER theo gói/hạng mục; kiểm biện pháp an toàn, quyết định sửa đổi, hạng mục kế tiếp Normal và hủy khi đủ tiền điều kiện. Kiểm đóng khiếm khuyết, phát/nhận chuyển nghĩa vụ bằng đúng vai trò và đối chiếu GET vòng đời. |
| W04/W07 — Tái phát | PM mở “Ghi nhận khiếm khuyết tái phát” trên màn thẩm định AI. Cần hạng mục `Confirmed` / kết quả `CONFIRMED`, quyết định sửa chữa còn hiệu lực với nghĩa vụ gốc và bằng chứng đã xác minh. Các dự án PM đã kiểm chưa có hạng mục `Confirmed`. Khi có dữ liệu, POST một lần rồi GET quyết định và hành động `LinkRecurrence` khớp khiếm khuyết cũ/mới. Không gọi lifecycle `recurrences` riêng. |
| W09 — Ngoại tuyến | Thử thu hồi thiết bị và cấp quyền hiện hữu bằng lệnh Web đã nối; GET đối chiếu trạng thái thu hồi. Không triển khai đăng ký/đồng bộ app hay màn xung đột Web không có trong hợp đồng. |
| W10 — Thông báo/lưu trữ | Đánh dấu đã đọc theo lô với thông báo thật; Giám sát áp/gỡ legal hold và xác nhận căn cứ lưu trữ khi kiểm kê đủ; PM thử đánh giá lưu trữ. Đọc lại đúng bản ghi/trạng thái sau mỗi thao tác. |

**Bàn giao bằng chứng:** chạy với đúng vai trò trên `roadguard-new`; dùng dữ liệu hợp lệ có sẵn hoặc tạo qua API nghiệp vụ được phép, ghi `TEST-DATA-LEDGER.md`, không ghi DB trực tiếp hay lưu bí mật. Giữ nguyên key/payload/version khi kết quả ghi chưa rõ; nếu đã nhận biên nhận, chỉ thử lại GET. Cập nhật `NGHIEM-THU-THEO-LUONG.md` theo kết quả thật (mục 9–11 là tham chiếu, thêm mục mới cho lượt nghiệm thu). Ghi riêng: đã nối FE, test/build, GET thật và POST/GET qua UI. Chỉ đánh dấu nghiệm thu khi đối chiếu được trạng thái đã lưu.

## 1. Đường dẫn và môi trường
| Thứ | Giá trị |
|---|---|
| FE | `D:\ConnectAPI\FE_Drone_Web-hoang\FE_Drone_Web-hoang` (Vite React TS; không có git) |
| BE dùng (DUY NHẤT) | `D:\ConnectAPI\RoadGuardSystem-develop_NewBE\RoadGuardSystem-develop` (KHÔNG dùng `RoadGuardSystem-develop (1)`) |
| Tài liệu nghiệp vụ BE | `…\NewBE\…\docs\HoangHaiWarrantySystem-Official` (nhất là `05_Web`, `02_Business-Workflows`, `04_API-Contracts/02_Full-API-Catalog.md`) và `…\docs\RoadGuard-Backend-Official`; tài liệu giao FE: `…\deploy\fe-handoff\*.md` (đặc biệt `PM-REPAIR-READBACK-AND-WEB.md`, `WEB-PM-SUPERVISOR-COMPLETION.md`, `PROJECT-CREATE-WEB-COOKIE.md`, `PROJECT-HANDOVER-ROAD-COVERAGE.md`) |
| Hợp đồng | `docs/contracts/openapi.json` trong FE = bản NewBE (298 thao tác; bản cũ `openapi.old-20261117.json`) |
| Stack Docker | project `roadguard-new` (API https://localhost:18443, MinIO 19001). Sau khi máy khởi động lại: bật Docker Desktop, `docker start roadguard-new-sql-1 roadguard-new-minio-1 roadguard-new-mailpit-1`, chờ sql healthy, rồi `docker start roadguard-new-api-1`; chờ `https://localhost:18443/ready` = 200. Stack cũ `roadguard-dev1` đã dừng (không nâng cấp tại chỗ được → dữ liệu cũ mất). |
| Vite dev | `npm run dev` ở thư mục FE (cổng 5173, proxy `/api` → 18443). Phải **khởi động lại** sau khi đổi `.env.development.local` (`VITE_DEV_FILE_BEARER=false`: dùng cookie, đã bỏ `[TEMP-BEARER]`). |
| Tài khoản test | đọc lúc chạy: `docker exec roadguard-new-api-1 cat /handoff/demo-accounts.json` (key: `supervisor`, `pm-a`, `pm-b`, `operator-a`, `crew-a`, `reporter-a`…). Không ghi mật khẩu ra file. |
| Bộ kiểm trình duyệt (ngoài repo) | `C:\Users\DELL\AppData\Local\Temp\claude\853ae82d488e6487\bd981d01-f400-47c6-95a4-314d82d881ec\scratchpad\e2e` — puppeteer-core + Edge. Chạy: `E2E_OUT="$(pwd -W)/shots" MSYS_NO_PATHCONV=1 ./run.sh audit/<script>.mjs …`. Điều hướng SPA bằng `history.pushState`+`popstate`. **Không chạy 2 script cùng tài khoản song song.** Script hữu ích trong `audit/`: `audit-routes.mjs` (quét route, in lời gọi/lỗi), `text.mjs`, `ft-sup.mjs`, `ft-confirm.mjs`, `pkg-create.mjs`, `ft-dispatch.mjs`, `ai-verify.mjs`, `write-new.mjs`, `verify-new.mjs`, `be.mjs` (gọi BE bằng Bearer để TẠO DỮ LIỆU TEST). |

## 2. Bẫy đã gặp (đừng lặp lại)
- **Không sửa file bằng PowerShell `Get-Content/Set-Content`** (hỏng tiếng Việt). Dùng Edit/Write hoặc script node viết bằng công cụ Write.
- **Không dùng backtick trong `node -e "…"` trong bash** (bash thực thi lệnh con và làm mất nội dung — đã hỏng 2 lần). Ghi script `.cjs` bằng Write rồi chạy.
- `docker exec … cat /handoff/...` cần `MSYS_NO_PATHCONV=1`.
- Repo không có git → muốn hoàn tác phải sao lưu thủ công (đã giữ `vite.config.ts.bak` trong thư mục scratchpad).
- Nhiều ô nhập là component React: đặt giá trị bằng native setter + dispatch `input`/`change` (xem các script `audit/*.mjs`).
- Journal idempotency của lệnh ghi lưu ở `sessionStorage/localStorage` (mất khi đổi trình duyệt/phiên); nguồn chuẩn phải đọc từ BE (đã sửa `checklistVersion` đọc từ `RepairItemView`).

## 3. Đã làm xong (xem chi tiết các file nhật ký)
- `docs/integration/NGHIEM-THU-THEO-LUONG.md` (mục 8 = cập nhật theo BE mới), `docs/integration/fe-theo-be/00-TONG-HOP.md` + `A-…`, `B-…`, `C-…`, `D-…` (4 nhóm: báo cáo/lưu trữ, khảo sát/AI/Case, dự án/hình học, hiện trường/sửa chữa/ngoại tuyến), `TEST-DATA-LEDGER.md` (mục B7 = dữ liệu trên BE mới).
- Biên bản bàn giao **bắt buộc** khi Giám sát tạo dự án (staging `POST /projects/handover-upload-intents` → upload → `POST /projects` với `handoverFileIds` + `If-Match`), bổ sung biên bản cho dự án cũ (`POST /projects/{p}/handover-documents`, thẻ trong modal độ phủ). Đã kiểm thật.
- Đã nối: overviews, member-contacts, task-assignees, notifications (priority + read-batch), video Range, source-defect, planning gói/hạng mục (đọc + sửa), địa bàn (PUT locality), danh mục loại hư hỏng (admin), policy discovery, invitations/preview, organization (Giám sát), đơn vị công tác ở hồ sơ.
- Đã xóa phần FE thừa (middleware `/__dev/*`, localStorage tim tuyến, các hàm/nút luôn ném lỗi, màn xung đột ngoại tuyến, dashboard Sup widget không có API, nhật ký/kiểm toán giả, v.v.); thêm màn "Điều phối ngoại tuyến" `/pm/offline`, `/sup/offline`.
- `tsc --noEmit` và `vite build` đạt; quét 44 route trên BE thật: không lỗi console (chỉ 401 của `ai-candidates` và 404 có `code` của `road-geometry-submission`, đều là BE).

## 4. Việc ĐANG DANG DỞ — chạy thật luồng Fast Track (ưu tiên số 1 của người dùng)
Đối chiếu mới: [Fast Track trên localhost — nguồn AI và trạng thái hạng mục](FASTTRACK-LIVE-20261119.md).

Trạng thái dữ liệu trên BE mới (dự án A `72f84201-c001-4000-8000-000000000001`):
- Giám sát đã **bổ sung biên bản** (BG-TEST-FE-01) và **xác nhận độ phủ** (`POST /road-coverage` 201, nguồn `REAL_SOURCE`) cho 2 phạm vi: 1–2 m và 5–6 m.
- PM đã tạo chính sách `test-fe-v1` (CRACK, DepressionDepth ≤ 50 mm) và **ban hành** (revision `ed9bd297-…`).
- PM đã duyệt phát hiện AI: DET-01 → KEEP_NEW (tạo khiếm khuyết CRACK `551b7ad0-c1d4-452b-983c-cf21b10ae19e`), DET-02 → REJECT (POST `candidate-decisions` 201).
- PM đã tạo gói Fast Track + hạng mục cho CRACK (`POST repair-packages` 201, `…/items` 201) với phạm vi 5–6 m, checklist `test-fe-v1`.
- Màn `/pm/fast-track` đã hiện CRACK "Sẵn sàng giao việc có điều kiện".

**Bước tiếp theo:** làm theo P0 ở mục 0. Lệnh `POST …/items/{itemId}/assign` nhận `{task: FieldTaskCreateInput, policyRevisionId, reason}` + `If-Match` + `Idempotency-Key`. Không lặp cách thử tạo FIELD với `surveyTaskId` hoặc đổi segment set để ép lệnh qua.
Ghi chú: PM tạo gói bằng modal "Tạo gói đề xuất mới" ở `/pm/proposals` (chọn dự án → tick khiếm khuyết → luồng Fast Track → lý trình/độ lệch/checklist/phương án; script `audit/pkg-create.mjs`).

## 5. Lệnh GHI còn chưa kiểm thật sau đợt "FE theo BE"
1. Giao lệnh Fast Track + `final-confirmation` (mục 4).
2. Xuất hồ sơ DOSSIER theo hạng mục (nghiệm thu) và theo gói (duyệt gói) — cần hạng mục/gói thật; `projectExportService.create` đã nhận `repairItemIds/repairPackageIds`.
3. Thu hồi thiết bị/cấp quyền ngoại tuyến (`POST …/offline/devices/{id}/revoke`, `…/grants/{id}/revoke`) — DB thử chưa có thiết bị/gói/cấp quyền (đăng ký thiết bị cần mật mã/app → có thể phải xin BE dữ liệu mẫu).
4. Duyệt gói Normal (Giám sát `approve`), nghiệm thu, ký đóng, safety measures, corrections, normal-successors, cancellations.
5. Đọc thông báo theo lô (DB chưa có thông báo), lưu đơn vị công tác (`UserOrganizationEditor`), chấp nhận lời mời bằng token thật (lấy qua Mailpit http://localhost:18026), `LINK_EXISTING` ở `DefectDetailVerify`.
6. Giám sát: legal hold (tạo/gỡ `POST /retention/holds`, `…/release`), retention basis; PM: retention evaluations.
7. Đã sửa việc tải lại modal và bảng đề xuất sau khi lưu kế hoạch; kiểm hồi quy qua UI, không triển khai lại (xem mục 9 tài liệu nghiệm thu).
8. Đã đổi khung nhận diện sang chỉ đọc và giữ phản hồi Chấp nhận/Báo sai sau khi tải lại; kiểm hồi quy qua UI, không thêm lệnh lưu bbox (xem mục 9 tài liệu nghiệm thu).
9. Rà tiếp các file mà nhóm A–D ghi "chưa rà": `AIReviewInbox`/`ai-review/` từng nút; ResearchValidation còn banner "chưa có dữ liệu thật" (giữ hay bỏ cả màn?); `PolicyModal`, `NotificationSupervisorPanel`; `/pm/drone-mission` và `/sup/drone-mission` không có `:id` chỉ hiện cảnh báo (cân nhắc xóa route).

## 6. Danh sách lỗi BE cần gửi (đã ghi trong `NGHIEM-THU-THEO-LUONG.md` mục 8.3 và `fe-theo-be/00-TONG-HOP.md` mục 4)
1. `GET /projects/{p}/ai-candidates/{id}` chỉ Bearer (cookie 401) → FE không đọc được trạng thái duyệt từng phát hiện; hiện dựng từ `ai-mock-runs/{id}/result` và ghi "Trạng thái thẩm định chưa đọc được".
2. Seed demo hỏng: `demo_ai.py` thiếu bước `submit` hình học trước `confirm` (409). Đã vá tạm (bản vá ở scratchpad `demo_ai_patched.py`; phải xóa `input-ai-confirm-a` trong journal volume `roadguard-new_scenario-progress` rồi chạy lại `scenarios`).
3. Video mẫu `synthetic-road-v1.mp4` chỉ 1.510 byte (không phát được; Range 206 đã kiểm đúng).
4. Không có API: xung đột ngoại tuyến cho web; kích hoạt/tạm dừng dự án; đóng vụ việc / biên bản nghiệm thu; từ chối/yêu cầu bổ sung từng hạng mục; lưu bbox; mở lại quyết định ứng viên; liệt kê lệnh phong tỏa pháp lý; dashboard rủi ro/khu vực/kỳ; nhật ký kiểm toán riêng; tiến độ/hủy export job; liệt kê mẫu chạy kiểm định.
5. `GET /projects` thiếu CRS/địa bàn/ngày (phải gọi `projects/overviews`); danh sách khảo sát thiếu `surveyType`; `source-defect.geometryWkt = null` với khiếm khuyết từ Report; chi tiết thiết bị/gói/cấp quyền ngoại tuyến trả schema không định kiểu.
6. Fast Track: lỗi `409 source_not_ready` trên `assign` qua UI đã truy ra ID sai từ FE (xem P0); không ghi thành lỗi nghiệp vụ BE. Lần thử tạo FIELD riêng là sự kiện khác.

## 7. Cách xác minh trước khi báo hoàn thành
1. `npx tsc --noEmit -p .` và `npx vite build` (thư mục FE) đều phải sạch.
2. Quét route: `audit-routes.mjs pm-a …` và `supervisor …` (danh sách route trong `src/App.tsx`), kiểm lời gọi 4xx/5xx và `console.error`.
3. Mỗi lệnh ghi mới: chạy qua UI bằng puppeteer, đối chiếu bằng GET BE (`audit/be.mjs`), ghi dữ liệu test vào `TEST-DATA-LEDGER.md` (mục B7 trở đi).
4. Cập nhật `docs/integration/NGHIEM-THU-THEO-LUONG.md` (mục 8/9) và `fe-theo-be/00-TONG-HOP.md`; chạy `node tools/gen-api-wiring-table.cjs` để sinh lại `API-WIRING-STATUS.md` (bảng này đối chiếu theo chuỗi đường dẫn nên có thể báo thiếu giả với đường dẫn dựng động).
