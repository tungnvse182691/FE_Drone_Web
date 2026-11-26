# Sổ dữ liệu giả dùng để test FE ↔ BE

> Mục đích: ghi lại **mọi dữ liệu giả** được tạo để kiểm tra FE chạy đúng theo BE, để xóa đi khi đã có dữ liệu thật.
> Quy tắc (chủ dự án đồng ý 2026-11-16): được phép tạo dữ liệu giả khi cần test; tạo xong phải ghi vào sổ này; xóa khi không còn cần.

## Quy ước khi tạo thêm
- Đặt tên/lý do có tiền tố `[TEST-FE]` để nhận ra; ghi vào bảng B: thời điểm, ai tạo (tài khoản), endpoint, id, mục đích, cách gỡ.
- Tạo bằng chính API của BE (không ghi thẳng SQL). Không tạo trên môi trường dữ liệu thật.

## Cách xóa
BE **không có API xóa** cho hầu hết thực thể (thiết kế bất biến/kiểm toán). Cách gỡ thực tế:
1. Môi trường Docker demo là dữ liệu tổng hợp: dừng và xóa volume (`docker compose -p roadguard-fe -f compose.yaml -f compose.https.yaml down -v`) rồi `up -d --build` sẽ tái tạo bộ demo sạch (mất mọi dữ liệu test). **Chỉ làm khi chủ dự án đồng ý**, vì xóa cả tài khoản demo và dữ liệu phiên.
2. Khi chuyển sang CSDL thật: dùng một CSDL/instance riêng, không mang volume demo sang.

## A. Dữ liệu tổng hợp có sẵn do BE tự nạp (không phải do agent tạo thêm)
Nguồn: container `scenarios` của `deploy/fe-handoff` (đã sửa bước `submit` hình học, xem API-GAP-NOTES mục H). Nhãn BE: "Synthetic sandbox; not operational evidence".
| Thực thể | Chi tiết |
|---|---|
| Dự án | `SBX-A` Synthetic Project A (`72f84201-c001-4000-8000-000000000001`), `SBX-B` Synthetic Project B (`...0002`) |
| Tuyến | `DEMO-A`, `MOCK-A` (dự án A); tuyến dự án B |
| Khảo sát | 1 survey-plan, 1 survey-task / dự án, 3 ai-mock-runs, 3 processing-jobs, 3 phát hiện AI (DET-01..03) |
| Khiếm khuyết / sửa chữa | 1 defect, 1 repair-package + 1 hạng mục mỗi dự án (A: Normal `AwaitingApproval`; B: FastTrack `ReadyToAssign`) |
| Khác | 1 export PDF, 1 retention evaluation, 1 clock `SupervisorInitialApproval`, 1 ca người dân (hộp thư PM) |
| Tài khoản | 11 tài khoản demo (mật khẩu ngẫu nhiên, đọc bằng `docker exec roadguard-fe-api-1 cat /handoff/demo-accounts.json`) |

## B. Dữ liệu test do agent tạo thêm
| Thời điểm | Tài khoản | Endpoint | Id / mô tả | Mục đích | Cách gỡ | Trạng thái |
|---|---|---|---|---|---|---|
| 2026-11-16 03:5x | supervisor | POST repair-packages/4d84bbee…/items/e2407d46…/approve | Hạng mục Normal `e2407d46-0ce3-499e-82c8-1acc5771e451` → `ReadyToAssign` | Duyệt hạng mục để test chuỗi nghiệm thu | Không có API xóa; chỉ gỡ bằng reset volume demo | ĐÃ TẠO |
| … | pm-a | POST …/items/e2407d46…/assign | Task sửa chữa `e50ee642-7952-4bd7-a3a7-5b1ade1f0387`, assignment `7f3e5337-927f-478b-815b-ca6dfebfcf78`, giao `crew-a`, nguồn REPORTER, `[TEST-FE]` trong instructions/reason | Giao việc | như trên | ĐÃ TẠO |
| … | crew-a | POST field-inspection-tasks/e50ee642…/accept và /start | Bản ghi bắt đầu đầu tiên `834c8fab-5958-44d8-a835-63f64ab4cb01`; task `InProgress` | Crew nhận và bắt đầu | như trên | ĐÃ TẠO |
| … | crew-a | POST …/tasks/e50ee642…/assessment | Assessment `8cbfb1a1-aca2-4f1f-abbe-6f754af7ffd9` (INCOMPLETE, không số đo/ảnh) | Đánh giá trước thi công | như trên | ĐÃ TẠO |
| … | crew-a | POST …/execution-start, /execution-finish | Execution start `5f4061a5-5230-44a3-8b66-2c8c43a8b841`; finish `8d9f48f0-94a1-4c38-aac5-ff582dcf54ed` | Thi công | như trên | ĐÃ TẠO |
| … | crew-a | POST uploads (+part-urls, PUT MinIO, complete) | Ảnh `test-fe-after.png` 8×8 PNG: upload `da640617-845c-44c9-9e49-98d3abf5d922`, file `e9e53bf9-38f8-4296-b6ab-1a491999d5b7` (VERIFIED, purpose AFTER) | Ảnh sau thi công | Tệp trong MinIO volume; gỡ bằng reset volume | ĐÃ TẠO |
| … | crew-a | POST uploads (purpose MEASUREMENT) | Ảnh `test-fe-measure.png` (VERIFIED, **không dùng**): file `963e30bf-7c9b-4c39-b245-666e58aabacb`; thêm 2 phiên upload bỏ dở: `92826bd0-5a18-4a9e-9ba7-3a96f3127425` (PENDING, hết hạn sau 24h) và 1 phiên đã hoàn tất | Thử nghiệm upload (mồ côi) | như trên | ĐÃ TẠO (mồ côi) |
| … | crew-a | POST field-inspection-tasks/e50ee642…/submissions | Submission `9780cfd8-b852-483e-aec7-69b1c6a1dc10` (REPAIR_CLAIM, repaired=true, AFTER evidence) | Nộp kết quả thi công | như trên | ĐÃ TẠO |
| … | crew-a | POST …/tasks/…/attempts | Attempt `0ad6485a-339f-4da7-afa5-9838fa3fb7db`, link `00f60257-2b92-48be-9b7d-b3aad896d703`, review clock `ba006710-8f4d-4efd-a359-80bf631e911e` | Gắn lần thử vào hạng mục | như trên | ĐÃ TẠO |
| … | pm-a | POST …/attempts/reviews | Review `b74db89c-2d9f-49ca-8e8f-4715b3cfc654` (ACCEPT) | PM chấp nhận | như trên | ĐÃ TẠO |
| … | supervisor | POST …/items/e2407d46…/final-confirmation | Quyết định hiệu lực `05958b69-9465-4e9c-ac1b-679232a42d4c`; hạng mục **`Confirmed` / `CONFIRMED`** | Xác nhận cuối | như trên | ĐÃ TẠO |
| 2026-11-16 04:28 | supervisor (cookie web) | POST /retention/holds rồi POST /retention/holds/{id}/release | Lệnh phong tỏa PROJECT dự án A `1d43ef85-ff1b-422a-8aaa-46dabf9cdf1d` (tạo `ACTIVE` rồi gỡ → `RELEASED`; reason có `[TEST-FE]`) | Kiểm chứng luồng phong tỏa/gỡ qua cookie web | Không xóa được; đã ở trạng thái RELEASED nên không còn ảnh hưởng | ĐÃ TẠO (đã gỡ) |
| 2026-11-16 | pm-a (Bearer) | POST field-inspection-tasks (×2) | Hai nhiệm vụ đo `PRE_MEASUREMENT` dự án A: `349b2682-f33d-4cd8-a3d8-f64ea9ce7c94` (đã giao lại cho crew-a qua giao diện → sự kiện `REASSIGNED`) và `9ae82652-ede1-4f5b-81bb-1fe397f48d24` (đã hủy qua giao diện → `Cancelled`); instructions có `[TEST-FE]` | Kiểm chứng giao lại/hủy nhiệm vụ đo | Không có API xóa; reset volume demo | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện) | POST …/items/e2407d46…/review-requests | Yêu cầu xem xét lại kết quả hạng mục `e2407d46…` (lý do `[TEST-FE]`) | Kiểm chứng yêu cầu xem xét | như trên | ĐÃ TẠO |
| 2026-11-16 | supervisor (giao diện) | POST …/items/e2407d46…/corrections | Hiệu chỉnh quyết định hiệu lực → kết quả UNREPAIRED; hạng mục `e2407d46…` từ `Confirmed` về `CorrectionRequired` (**hạng mục demo không còn ở trạng thái đã nghiệm thu**) | Kiểm chứng hiệu chỉnh quyết định | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện) | POST …/items/e2407d46…/normal-successors | Hạng mục Normal kế tiếp `7452cc81-3867-4b29-ae0f-f98cf5668360` (dự án A) | Kiểm chứng hạng mục kế tiếp | như trên | ĐÃ TẠO |
| 2026-11-16 | supervisor (Bearer) | POST …/items/7452cc81…/approve | Duyệt hạng mục `7452cc81…` → `ReadyToAssign` | Chuẩn bị thử form giao đội | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện form giao đội) | POST …/items/7452cc81…/assign | Nhiệm vụ sửa chữa `b16d8ffc-2c95-48cd-a603-cde529104278` giao cho crew-a (hạng mục `Assigned`) | Kiểm chứng form `/pm/repair-batches/assign` | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-b (giao diện) | POST …/items/eae723e7…/cancellations rồi /normal-successors | Hạng mục Fast Track dự án B `eae723e7…` → `Cancelled`; hạng mục Normal kế tiếp `06cef445…` (`AwaitingApproval`) (**mất hạng mục Fast Track `ReadyToAssign` của demo**) | Kiểm chứng hủy và hạng mục kế tiếp | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, Bearer tạm) | POST /datasets/a8a7c1e2…/assessments | Đánh giá bộ dữ liệu `a8a7c1e2…` (2 phân đoạn, PASS, lý do `[TEST-FE]`) | Kiểm chứng nối API khảo sát/bộ dữ liệu | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, Bearer tạm) | POST /projects/{A}/baseline-selections | Khóa baseline 2 phân đoạn của dataset `a8a7c1e2…` | Kiểm chứng nối API khảo sát/bộ dữ liệu | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, Bearer tạm) | POST /processing-jobs | Job xử lý `02df2947-6388-4477-899a-4e7fc56f0e2f` (QUEUED) + 1 job lần 422 bị BE từ chối (không tạo) | Kiểm chứng nối API khảo sát/bộ dữ liệu | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (Bearer, script) | POST survey-plans / survey-tasks | Kế hoạch `4e2f439e-9f0b-48eb-adbf-b15f1a9ff8b5` và nhiệm vụ `db47d604-c738-41a2-887a-5d01380e9120` (dự án A) để thử thao tác | Kiểm chứng nối API khảo sát/bộ dữ liệu | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, Bearer tạm) | POST /survey-plans/4e2f439e…/postpone | Kế hoạch `4e2f439e…` → POSTPONED | Kiểm chứng nối API khảo sát/bộ dữ liệu | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, Bearer tạm) | POST /survey-tasks/db47d604…/reassign rồi /cancel | Nhiệm vụ `db47d604…` giao lại cho chính operator-a rồi → CANCELLED | Kiểm chứng nối API khảo sát/bộ dữ liệu | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | crew-a (Bearer, script chain3) | accept/start/assessment/execution/submission/attempts trên nhiệm vụ `b16d8ffc…` | Hạng mục `7452cc81…` từ `Assigned` → `Submitted` | Kiểm chứng nối API tiếp nhận/chỉ định | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (Bearer, script) | POST …/attempts/reviews decision=SUPPLEMENT | Yêu cầu tiếp nhận CrewSupplement `ed60dc81-1fdb-493e-a0ca-9de653ebebb3` (người nhận crew-a) | Kiểm chứng nối API tiếp nhận/chỉ định | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | supervisor (giao diện) | POST /projects/{A}/clocks/58f7b591…/appointments | Đồng hồ ProjectManagerReview của task `b16d8ffc…` chỉ định cho pm-a | Kiểm chứng nối API tiếp nhận/chỉ định | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-b (giao diện) | DELETE …/items/eae723e7…/notification-supervisor | Thu hồi chỉ định Giám sát nhận thông báo (do seed demo tạo lúc 10:17) của hạng mục Fast Track đã hủy `eae723e7…` | Kiểm chứng nối API tiếp nhận/chỉ định | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện) | POST /projects/{A}/labels → /review APPROVE → /revisions | Nhãn huấn luyện `f11d2ff6-9aa4-47e1-80c4-333f7bdf344f` (nguồn AI_DETECTION `2ba7a2eb…`), đã duyệt rồi tạo phiên bản 2 (đang Chờ duyệt) | Kiểm chứng nối API nhãn huấn luyện | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện) | POST /projects/{A}/defect-statistics | Xác nhận thống kê: shared part mới (GUID ngẫu nhiên), ghim 1 phép đo DepressionDepth của khiếm khuyết `66c50368…`, REAL_SOURCE, lý do `[TEST-FE]` | Kiểm chứng nối API thống kê khiếm khuyết | Reset volume demo (bản ghi lịch sử không xóa được qua API) | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, Bearer tạm) | POST /projects/{A}/baseline-selections (lần 2) | Khóa baseline lần 2 và lần 3 cho 2 phân đoạn dataset `a8a7c1e2…` (có expectedBaselineSelectionId); mã lần khóa cuối `cd3041f8-339a-4ba4-9fbe-3e44e59fabdf` | Kiểm chứng GET baseline-selections/{id} | Reset volume demo hoặc xóa theo ID | ĐÃ TẠO |
| 2026-11-16 | pm-a (Bearer, script) | POST /projects/{A}/defects/66c50368…/publications | Chỉ để kiểm BE: trả 409 source_not_ready, KHÔNG tạo dữ liệu | Kiểm chứng quy tắc xuất bản | — | KHÔNG TẠO |
| 2026-11-16 | pm-a (Bearer, script mk-safety*) | POST /projects/{A}/repair-packages | Gói `edf32c5d-3e4a-4d56-8640-aae11e8856c9` (khiếm khuyết `66c50368…`) có 2 nghĩa vụ: sửa chính thức `250b6ea0…` (lý trình 3–5) và an toàn tạm thời `51015c1b…` (3–4) | Dữ liệu cho biện pháp an toàn thi công | Reset volume demo | ĐÃ TẠO |
| 2026-11-16 | pm-a / supervisor / crew-a (Bearer, script) | propose → approve → assign → accept → start | Hạng mục Normal `fd302019-5621-44b5-ac6e-b1ab9aa208a6` (Assigned), nhiệm vụ sửa chữa `a276dc12-c57a-4840-a81c-042f2f7fea30` (InProgress) giao crew-a | Điều kiện để PM giao biện pháp an toàn | Reset volume demo | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện) | POST …/items/fd302019…/safety-measures | Biện pháp an toàn thi công `5d8fe632…` giao crew-a (+1 lần thử 409 do chọn nhầm nghĩa vụ, không tạo) | Kiểm chứng nối API an toàn thi công | Reset volume demo | ĐÃ TẠO |
| 2026-11-16 | pm-a (Bearer, script q16 + giao diện) | POST /projects/{A}/ai-mock-runs | 2 lần chạy AI mock mới `67f166fa-b539-4ca5-9f67-67f150c9d80d` và `0b46251e-a9d3-405e-b225-c787752ca431` (fixture synthetic-road-v1, trạng thái QUEUED→SUCCEEDED), kèm 2 job xử lý tương ứng; 2 lần thử sai phiên bản hình học bị BE từ chối 409 (không tạo) | Kiểm chứng nối API chạy AI mock | Reset volume demo | ĐÃ TẠO |
| 2026-11-16 | (không tạo) | PUT …/retention/files/…/basis; POST /auth/password-recovery-requests (email giả `…@example.invalid`) | BE trả 409 `retention_inventory_incomplete` và 202 chung; KHÔNG tạo dữ liệu | Kiểm chứng căn cứ lưu trữ và khôi phục mật khẩu | — | KHÔNG TẠO |

### B2. Trên stack BE mới (`roadguard-new`, volume riêng, dữ liệu demo sinh mới 2026-11-16)
| Ngày | Người / công cụ | Lệnh | Dữ liệu tạo ra | Cách xóa | Trạng thái |
|---|---|---|---|---|---|
| 2026-11-16 | pm-a (giao diện, cookie) | POST /survey-tasks/e945166d…/supplements | Nhiệm vụ bổ sung `21952912-c79e-4678-8227-44f197411dd7` (nhiệm vụ gốc → `SUPPLEMENT_REQUIRED`); 1 lần 422 do chọn dải sai (không tạo) | `docker compose -p roadguard-new … down -v` | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, cookie) | POST /survey-tasks/2195…/reassign rồi /cancel | Nhiệm vụ bổ sung giao lại cho operator-a rồi → `CANCELLED` | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện, cookie) | POST /survey-plans/a417c7cf…/postpone | Kế hoạch `a417c7cf-80d9-447d-b198-bc79a8c82eb5` → `POSTPONED` | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a / supervisor / crew-a (giao diện + script) | giao đội, giao lại, hủy nhiệm vụ đo; chuỗi crew → review → xác nhận cuối; hiệu chỉnh, xem xét lại, hạng mục kế tiếp, hủy | Hạng mục `5101efd7…` (Confirmed → CorrectionRequired; kế tiếp `7ddfe4b8…` Cancelled), nhiệm vụ sửa chữa `b65cfff6…`, 2 nhiệm vụ đo `6cdf299a…` (đã giao lại) và `e1e98038…` (Cancelled) | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a (giao diện + script) | gói `d7945339…` có nghĩa vụ an toàn; hạng mục `e3d98a94…`; biện pháp an toàn `f5a5ab19…`; yêu cầu tiếp nhận `449c41f0…` | PM review SUPPLEMENT tạo yêu cầu tiếp nhận CrewSupplement | như trên | ĐÃ TẠO |
| 2026-11-16 | pm-a / supervisor (giao diện, Bearer tạm) | đánh giá + khóa baseline + job + chạy AI trên dataset `d5565389…`; nhãn `76db49bf…` (đã duyệt, phiên bản 2); thống kê (shared part mới); chỉ định đồng hồ; đánh giá lưu trữ `b067d6a5…`; phong tỏa `d892f4ef…` (đã gỡ) | | như trên | ĐÃ TẠO |
| 2026-11-16 | (script nội bộ) | `docker compose -p roadguard-new down -v` rồi dựng lại | Làm sạch stack mới sau lần seed hỏng do `demo_ai.py` thiếu bước submit; một lần confirm hình học thủ công bằng script đã bị xóa cùng volume | — | ĐÃ XÓA |

### B3. Stack BE mới nhất (`roadguard-dev1`, commit 05197e2) do `tools/seed-test-data.mjs` tạo
Stack `roadguard-new` đã `down -v` và thay bằng `roadguard-dev1`. Script tạo (tất cả có tiền tố `[TEST-FE]`): 4 gói + hạng mục (ReadyToAssign, đang thi công + an toàn, Submitted + CrewSupplement, Confirmed), 2 nhiệm vụ đo, 1 kế hoạch + 1 nhiệm vụ khảo sát; sau đó các lần test giao diện thêm: giao đội cho hạng mục B, biện pháp an toàn, hiệu chỉnh/xem xét lại/hạng mục kế tiếp (đã hủy) trên hạng mục Confirmed, nhiệm vụ đo (1 giao lại, 1 hủy), đánh giá + khóa baseline + job + chạy AI, nhiệm vụ bổ sung và hoãn kế hoạch, nhãn, thống kê, chỉ định đồng hồ. Cách xóa: `down -v` + xóa `tools/.seed-state.json`.

- Thêm (stack `roadguard-dev1`): nhiệm vụ khảo sát `761798fc-44d8-4c6b-8fcd-b2b6ecc1a50a` do Operator nhận và nộp bản 1 qua API; **bản 2..29 chèn thẳng bảng `SurveyDataVersions` bằng SQL** (dữ liệu giả để thử chọn bản/phân trang, tạo bởi `tools/seed-test-data.mjs --multi-version`). Xóa bằng reset volume.

- Thêm (stack `roadguard-dev1`): Giám sát duyệt hạng mục seed `269db06e-2872-4e97-b637-49036a755570` (gói `74f9a01f…`) qua màn Phê duyệt đề xuất (`POST …/approve` 201): hạng mục không còn `AwaitingApproval`; baseline của đoạn/dải đủ điều kiện khóa trên bản 26 của nhiệm vụ `18cfe3ad…` (mã lần khóa `0219587b…`).

## C. Dữ liệu test cần tạo tiếp (đề xuất)
Đã tạo xong chuỗi cho 1 hạng mục (dự án A) → `Confirmed`. Còn thiếu hạng mục ở giai đoạn **chờ nghiệm thu** (`Submitted`/`Reviewed`) và **cần sửa lại** (`CorrectionRequired`) để test các nút chấp nhận / yêu cầu bổ sung; cần thêm một defect + gói + hạng mục mới (hạng mục hiện có đã đóng).

_Ghi chú cũ:_
Để test được giai đoạn nghiệm thu/đóng đợt, cần đẩy một hạng mục sửa chữa qua máy trạng thái BE `AwaitingApproval → ReadyToAssign → Assigned → InProgress → Submitted → Reviewed → Confirmed`, gồm: Supervisor duyệt hạng mục, giao đội (crew-a), crew bắt đầu/kết thúc thi công và nộp bằng chứng trước/sau (cần upload tệp lên MinIO), PM review, Supervisor xác nhận. Khi tạo sẽ ghi từng bước vào bảng B.

### B4. Dữ liệu tạo thêm khi kiểm tra "tạo 1 ra 2" (2026-11-17, stack `roadguard-dev1`, tiền tố `[TEST-DUP]`)
Kịch bản: `scratchpad/e2e/dup-*.mjs`. Gỡ bằng `down -v` như mục "Cách xóa" (BE không có API xóa).
| Loại | Số lượng xấp xỉ | Ghi chú |
|---|---|---|
| Nhiệm vụ đo (field-inspection-tasks) | ~30 | Lý do/chỉ dẫn có `[TEST-DUP]`; một phần đã giao lại (nhiều sự kiện REASSIGNED) hoặc `Cancelled` |
| Nhiệm vụ khảo sát (survey-tasks) | 17 | 2 từ thử idempotency BE (cùng Idempotency-Key trả cùng id; khác key → thêm bản mới), 15 từ thử giao lại/hủy/bổ sung; không có tiền tố trong body (BE không có trường ghi chú khi tạo), tạo ngày 2026-11-17 |
| Nhãn huấn luyện | 7 nhãn + 5 phiên bản + 1 lần duyệt | trang Nghiên cứu & kiểm định |
| Dự án | 7 (tên/mã `DUP-…`) | Giám sát tạo qua `/sup/projects` |
| Lời mời nhân sự | 5 (`dup-…@example.invalid`) | |
| Job xử lý / lần chạy AI mock | 4 / 3 | trên nhiệm vụ khảo sát `761798fc…` |
| Đánh giá bộ dữ liệu / khóa baseline | 1 / 1 | cùng nhiệm vụ; sau khóa form đánh giá bị ẩn |
| Gia hạn đồng hồ | 1 | gửi bằng script BE (FE bị 400 do If-Match không có dấu ngoặc kép) |
| Giao việc hạng mục `269db06e…` | 1 | hạng mục → `Assigned` |

### B5. Dữ liệu tạo thêm khi chạy lại sau sửa lỗi tạo trùng (2026-11-17, tiền tố `DUP`/`[TEST-DUP]`)
Kịch bản: `scratchpad/e2e/dup-*.mjs` (chế độ single và rapid). Gỡ bằng `down -v`.
| Loại | Số lượng xấp xỉ | Ghi chú |
|---|---|---|
| Gia hạn đồng hồ (DeadlineExtensions) | 1 | `POST …/clocks/{id}/extensions` 201 từ UI sau khi If-Match có ngoặc kép |
| Nhãn huấn luyện | 5 nhãn, 2 phiên bản, 1 lần duyệt | trang Nghiên cứu & kiểm định, mỗi lần bấm đúng 1 lệnh ghi kể cả rapid |
| Nhiệm vụ đo | 4 | tạo bằng BE để giao lại/hủy (single + rapid mỗi loại) |
| Nhiệm vụ khảo sát | khoảng 10 | tạo bằng BE để giao lại/hủy/bổ sung (kể cả vài lần kịch bản lỗi setup vì trang chậm) |
| Job xử lý / lần chạy AI mock | 2 / 2 | trên nhiệm vụ khảo sát `761798fc…` (single + rapid) |
| Dự án | 3 (`DUP-VMWK67XLV`, `DUP-VMWK71QA8`, `DUP-VMWK72EFD`) | `/sup/projects`, handoverDate 2026-12-01 (2 dự án), 2026-11-17 (1 dự án) |

### B6. Dữ liệu tạo khi kiểm giao diện luồng tạo dự án (2026-11-17)
- Dự án `DUP-UI-MWKITNE9` (id `8da4fe59-60a2-4f81-ad30-50f65972fdb9`), tên "[TEST-DUP] Giao dien tao du an …", tạo qua modal mới bằng tài khoản Giám sát; PM chính là PM đầu danh sách. Ngày bàn giao mặc định của form. Kiểm đúng 1 `POST /projects`.


Lượt kiểm Fast Track 2026-11-19: chỉ đọc, không tạo dữ liệu nghiệp vụ mới. ID của gói, hạng mục, nghĩa vụ và nguồn đã tồn tại: [biên bản kiểm Fast Track](FASTTRACK-LIVE-20261119.md).

### B7. Dữ liệu trên BE MỚI (project Docker `roadguard-new`, 2026-11-18)
Ghi chú: dữ liệu B1–B6 nằm trong stack cũ `roadguard-dev1` (đã dừng, không nâng cấp lên BE mới được). Stack mới là DB trống do BE seed.
- **Seed BE (đã vá tạm):** chạy lại `scenarios` với bản `demo_ai.py` có thêm bước `submit` hình học trước `confirm` (BE seed gốc lỗi 409). Tạo: dự án A/B, tuyến + segment set, kế hoạch/nhiệm vụ BASELINE (nhiệm vụ `25f98904…` đã nộp 1 bản), 3 lần chạy AI mock, phát hiện/Case/gói sửa chữa Normal (A) và Fast Track (B). Video `synthetic-road-v1.mp4` chỉ 1.510 byte (không phát được).
- **Dự án `HBM9A9CD`** (id `c71c7321-f08e-4492-a296-14a78a10ef9d`), tên "[TEST-FE] Bien ban bat buoc HBM9A9CD": tạo qua UI Giám sát với biên bản PDF `bien-ban-test.pdf` (luồng staging mới). Xác nhận có HANDOVER, WARRANTY, MAINTENANCE_BASIS.
- **Biên bản bổ sung cho dự án A (`SBX-A`):** số hiệu `BG-TEST-FE-01`, ngày 2026-11-16, tệp `bien-ban-ft.pdf` (qua modal độ phủ Điều phối nhanh).
- **Chính sách xử lý nhanh thử** (dự án A): draft `6bb06644-8e9d-41cf-b4c3-f1299d3b12d3` → revision `ed9bd297-d3f0-448c-9d9a-837c8844ef94` (CRACK, checklist `test-fe-v1`, DepressionDepth 0–50 mm), tạo bằng API với tài khoản pm-a.
- Các phiên upload thử tới `/uploads` (loại `DOCUMENT`, PDF/PNG vài chục byte) từ script kiểm; không có dữ liệu thật.
- **Ghi thử qua UI (BE mới):** kế hoạch gói `b5968126-7abc-4b64-aa3e-777b2da95f18` (dự án A) tên "[TEST-FE] Goi thu 0VOQ", hạn 2026-12-31; kế hoạch hạng mục `bf16831d…` 12.5 m2 + vật tư thử; địa bàn dự án A đổi thành "[TEST-FE] Dia ban thu 0VOQ"; loại hư hỏng mới `TESTFE0VOQ` ("Loai thu FE 0VOQ").

- 2026-11-19T02:04:57.074Z [TEST-FE Fast Track] repair-packages/36a80018-6e43-4999-a054-8543ce61cc42/items/e988cfc0-6919-4d86-bc61-da57dc2fd8be/assign (PM UI) HTTP 409 `{"title":"Repair request failed","status":409,"instance":"/api/v1/projects/72f84201-c001-4000-8000-000000000001/repair-packages/36a80018-6e43-4999-a054-8543ce61cc42/items/e988cfc0-6919-4d86-bc61-da57dc2fd8be/assign","code":"source_not_ready","correlationId":"8b13ce7b-b974-469e-a145-4828db326157"}`

## B8 — Dữ liệu tạo ngày 2026-11-19 (stack `roadguard-new`, dự án 72f84201-c001-4000-8000-000000000001)
- Quyết định AI qua UI PM: DET-01 `KEEP_NEW`, DET-02 `REJECT`, DET-03 `LINK_EXISTING` (gom vào khiếm khuyết CRACK 551b7ad0).
- Phủ đường xác nhận: đoạn 1–2 m và 5–6 m (Giám sát, REAL_SOURCE/TEST_ONLY theo UI).
- Chính sách sửa chữa: draft 6bb06644 → revision ed9bd297 (đã publish).
- Gói Fast Track 36a80018 / hạng mục e988cfc0 (phạm vi 5–6 m): assign bị 409 `source_not_ready`.
- Gói Normal b5968126 / hạng mục bf16831d: Giám sát duyệt → `ReadyToAssign`.
- Export DOSSIER theo gói b5968126 do PM tạo qua UI (kind DOSSIER, PDF, repairPackageIds=[b5968126]).
- Field task dac18f10 (NORMAL, REPORTER, PostRepair) tạo qua UI PM khi giao hạng mục bf16831d → `Assigned`, Crew `crew-a`.
- Lifecycle SBX-A: declaration 545e7cfb-64b2-4362-be51-8862de892e1b (PM, minh chứng 71d40feb), confirmation 3f9529c1-60a3-4955-b617-9bdba9f479c5 (Giám sát) → CONFIRMED. Không thể hoàn tác.
- AI run fd528bc4-0f3f-4115-8ef5-9fedeea5a347 (VIDEO_ANALYSIS, MOCK, fixture synthetic-road-v1) trên dataset của task 25f98904 → job d2b4b7eb → result 66e3fc60 (SUCCEEDED).
- Legal hold SBX-A (POST /retention/holds 201, lý do "[TEST-FE] Thanh tra thử nghiệm phong tỏa", văn bản TEST-FE-001/QĐ) — **vẫn đang hiệu lực (activeHoldCount=1), holdId không còn do sessionStorage mất; chưa gỡ được từ Web (BE thiếu API liệt kê hold).**
- Lời mời/tài khoản test W01: `test-fe-invite@roadguard.test` (REPAIR_CREW, đã accept), `test-fe-pm@roadguard.test` (PROJECT_MANAGER, đã accept, userId f5b29553-baf3-4ee5-bb45-c90b8f93c9ef, organization "Ban QLDA TEST-FE"). Mật khẩu test dùng lúc kiểm thử, không ghi vào tài liệu.
- Chuyển nghĩa vụ: issue 2d3cdd96-4a69-4240-8dde-c29d54e275e4, accept 48c98851-42bf-4c36-87ef-29d6dc46238e — nghĩa vụ CRACK f1a94258 chuyển từ SBX-A sang SBX-B, kèm gói Fast Track 36a80018 / hạng mục e988cfc0 (không hoàn tác từ Web). SBX-B còn gói Fast Track c993af21 / hạng mục 15bbab72 (defect POTHOLE abfd340b).
- Retention evaluation mới (17:11 19/11/2026) trên SBX-A, kết quả BLOCKED_HOLD do legal hold đang kẹt.

## B9 — Stack BE mới `roadguard-v3` (2026-11-22), seed mới; mọi dữ liệu dưới đây thuộc stack này
- Tài khoản và ID dự án seed giống trước (`SBX-A` …0001, `SBX-B` …0002) nhưng **gói, hạng mục, defect, nghĩa vụ cũ không còn**.
- E4: phong tỏa SBX-B tạo rồi gỡ (`activeHoldCount=0`); đánh giá bằng chứng PASS trên bản nộp nhiệm vụ khảo sát SBX-B và nhiệm vụ đó đã **COMPLETED**; nhiệm vụ khảo sát `7fc7ee83-83b0-469c-8b42-997dab7fce50` ở SBX-A (NEW_ASSIGNED); một lượt đánh giá lưu trữ SBX-B.
- E2: mỗi lần chạy `e2-case.mjs` tạo 2 Report/Case `[TEST-FE]` ở SBX-A; Case OPEN-sau-bổ-sung `27d9e209`; Defect `9a6f1083`, `e263b223` (KEEP_NEW từ Report).
- E3: SBX-A có gói Normal `595c604b` (hạng mục `3aa8aa98`, đã giao); quyết định AI `c37332f8…` KEEP_NEW, defect CRACK `6eac374c`, gói Fast Track nguồn SURVEY đã giao; gói Fast Track cho defect `e263b223` (nguồn Report) đã giao; chính sách CRACK v1; biên bản bàn giao `TEST-FE-BB-E3` (A, B); độ phủ TEST_ONLY (A hai phạm vi 5–6 m, B một phạm vi 1–2 m). SBX-B có chính sách POTHOLE v1 và hạng mục Fast Track `179251b5` (nguồn Report) đã giao.
- **Không hoàn tác:** nghĩa vụ `81a6cb99-c6e4-49a0-b50a-2be31b1526f1` chuyển A → B (hạng mục `da6b635d` ở B, `ReadyToAssign`, PM-B chưa giao được — lỗi BE #13).
- E1: không tạo dữ liệu FIELD thật.

## B10 — Dữ liệu test thêm ở stack `roadguard-v3` (đợt "Cập nhật mới 5h37", 2026-11-22)
- E5 (SBX-A): nhiệm vụ seed `260cf5b5…` nay **SUPPLEMENT_REQUIRED** và có nhiệm vụ bổ sung con (tạo bằng API, `[TEST-FE]`) — không hoàn tác, nên thẻ "Xác nhận hoàn tất nhiệm vụ khảo sát" không hiện cho nhiệm vụ này; thêm 1 kế hoạch định kỳ và 1 nhiệm vụ mới. Mỗi lần chạy `e5-survey-plan.mjs` tạo thêm kế hoạch/nhiệm vụ.
- E6 (SBX-A): 3 lần chạy AI mock (fixture `synthetic-road-v1`) trên bản nộp của nhiệm vụ `260cf5b5…`, đều SUCCEEDED; mỗi lần chạy `e6-ai-run.mjs` tạo thêm lần chạy AI.

## B11 — Dữ liệu test thêm ở BE `develop_ABC` (2026-11-22)
- Nhiệm vụ bổ sung `e29dd031…` (SBX-A) bị hủy bằng API (`[TEST-FE]`); kế hoạch BASELINE `50a7e6d2…` nay COMPLETED với 1 nguồn (đánh giá PASS `899d4178…` tạo bằng API trên bản nộp `ea3f4cdc…`). Không hoàn tất lại được; `e7-plan-complete.mjs` chỉ còn kiểm nhánh đọc/khóa nút nếu không còn kế hoạch IN_PROGRESS BASELINE có bản nộp.

## B12 G2 (AI review transport/identity/readback, 2026-11-24)
- `g2-ai-transport.mjs` mỗi lần chạy tạo 1 lần chạy AI `synthetic-road-v1` (SUCCEEDED) trên bản nộp `4078f40a…` của nhiệm vụ `ada7404e…` (SBX-A), 1 POST fixture sai bị 422 (không tạo dữ liệu), và 1 quyết định KEEP_NEW (Chấp nhận qua UI) + 1 Defect OPEN. Không hoàn tác được.
- Lần chạy cuối: run `216de61c-9055-453f-ad61-15be0bea2d65`, detection `32780a39-155b-60b2-b57b-d998439b21fd`, decision `3a941f7a-c38b-4c67-bef6-c7edb9a9c97c`, defect `aa1650a9-bca7-4e29-99c8-661b0cd82258`. Hai lần chạy trước (runs `055416f5…` chỉ tạo run; `1fd29432…` KEEP_NEW → defect `1b79c3a9-0065-40f0-9ef3-2537890834d1`).

## B12 G3 (Nghiem thu repair, 2026-11-24)
- Project A, goi `ebba5817`, hang muc Normal `c3158f95-d423-4c73-a280-3d172424f1c2`: Giam sat duyet (API), PM-a giao Crew-a (API, task `52cf607a-50b3-4eb7-a5d9-76d9cda265d6`). **API-created (gia lap Mobile Crew qua Bearer, g3-seed.mjs):** accept/start, assessment, execution-start/finish, upload 2 anh PNG, submission #1 (BEFORE+AFTER), attempts; SUPPLEMENT lan 1 bang API; Crew bo sung #2 va #3 (supplements) bang API.
- Qua UI: PM gui SUPPLEMENT (bao `[TEST-FE G3] ... yeu cau bo sung`), PM ACCEPT (reason `[TEST-FE G3] PM chap nhan`), Giam sat final-confirmation (`[TEST-FE G3] Giam sat xac nhan`) -> hang muc **Confirmed, khong hoan tac**.
- Fast Track B: xem muc ft trong G3-ACCEPTANCE-20261124.md.

## B12 G1 — Hồ sơ thẩm định (2026-11-24, stack `roadguard-v4`, dự án A)
Tạo bằng `tools/e2e/g1-case-review.mjs` (Reporter API + Giám sát triage + PM UI/API), tiền tố `[TEST-FE G1]`, không hoàn tác được:
- `#CAS-4E7277E7` (4e7277e7…): Report gốc GPS 9.9498,105.001 + 2 bổ sung (10.0123,105.5456 và UNKNOWN) — kiểm GPS evidence.
- `#CAS-33147D1F` (33147d1f…): REJECT nguồn Report (Case vẫn OPEN).
- `#CAS-71730559` (71730559…): thử LINK_EXISTING — BLOCKED (BE không trả ứng viên), Case chưa có quyết định.
- `#CAS-42B77AE2` (42b77ae2…): kết luận NO_DEFECT (CONCLUDED) + 1 publication NO_DEFECT.
- `#CAS-29DF28F3` (29df28f3…): KEEP_NEW (Defect OPEN); thử API công bố có Defect không chạy được (BLOCKED, defectIds rỗng).
- `#CAS-DCE00708` (dce00708…): NO_DEFECT → Reporter bổ sung (OPEN lại) → KEEP_NEW.


## B12 G4 — Đề xuất / an toàn / giao việc / chuyển nghĩa vụ / bàn giao / ngoại tuyến (stack `roadguard-v4`, 2026-11-24, dự án SBX-A trừ khi ghi khác)
- **Gói Normal (UI PM-A tạo, Giám sát duyệt, PM giao):** gói `1a76a722-f08f-4373-be76-867309aec1bb`, hạng mục `70060978-319f-409e-915e-ae0c5da420e9`, nghĩa vụ FormalRepair `041077c7-3c66-496b-8791-cd5b94f02952` (lý trình 40–41 m, lệch 0–1 m, Defect CRACK `1b79c3a9-0065-40f0-9ef3-2537890834d1` nguồn SURVEY). Duyệt qua UI Giám sát (POST approve 201); giao Crew `Synthetic crew-a` qua màn Giao việc (POST assign 201, nguồn Survey lấy từ Defect). Lần đề xuất thứ hai cùng phạm vi bị BE chặn 409 `active_scope_conflict` (không tạo dữ liệu).
- **Nghĩa vụ an toàn tạm thời + biện pháp (UI PM-A):** POST `temporary-safety-obligations` 201 (lý trình 40.25–40.5 m, lệch 0–0.5 m, nghĩa vụ `7f9a129c…`), rồi POST `safety-measures` 201 (biện pháp `af70b783…`, Crew đúng binding). Không hoàn tác.
- **FIELD loại đo 1–6 (API-created bằng phiên PM-A, nhãn `[TEST-FE G4]`, không ghi DB):** REPORTER: loại 5 (`49729a69…`, `fef1231a…`), 2 (`8f1ded70…`, `1773622d…`), 3 (`6d702242…`, `22685a35…`), 4 (`95b40714…`, `e2832572…`), 6 (`d0be267f…`), 1 (`89a7779a…`). SURVEY (Defect `1b79c3a9`, surveyId `4752e823-be37-4298-878f-db4b37b697d9` lấy từ dataset thật): loại 5 (`0f0661a6…`), 6 (`9a6364c9…`), 1 (`9d9f00c0…`). Một số lần REPORTER trên Defect nguồn AI trả 409 `source_not_ready` (guard nguồn, không liên quan loại đo); tất cả đều là task `PRE_MEASUREMENT` giao `Synthetic crew-a`, tạo nhiều lần do chạy lặp script.
- **Hồ sơ bàn giao SBX-B (UI Giám sát):** số hiệu `TEST-FE-G4-BB`, ngày 2026-10-01, tệp `test-handover.pdf`, hồ sơ `ca7b3028-9a78-4f37-8e58-3ca519f2e04c` (tạo mới vì kiểm kê trống). SBX-A vẫn chưa có hồ sơ bàn giao.
- **Chuyển nghĩa vụ A → B (UI Giám sát, không hoàn tác):** nghĩa vụ `041077c7-3c66-496b-8791-cd5b94f02952` (gói `1a76a722`, hạng mục `70060978`, đã giao Crew và có biện pháp an toàn). Phát hành đề nghị `6c04a72a-9a42-484c-b555-2ac1c2f7290e` (POST obligation-transfers 201), tiếp nhận `9b034471-304f-4ece-8881-4c7e1dbde162` (POST obligation-transfer-acceptances 201). Sau chuyển PM-B đọc planning của gói này nhận 404 `not_found` (xem báo cáo G4, lỗi BE).
- **Ngoại tuyến:** không tạo dữ liệu (BLOCKED: seed không có gói/thiết bị do Mobile tạo; gói chuẩn bị cần chữ ký khóa thiết bị).
- Script: `tools/e2e/g4-*.mjs`, `g4-batch.sh`; mỗi lần chạy `g4-field.mjs api` tạo thêm task FIELD `[TEST-FE G4]`.

## B13 · H2 (Nghiệm thu / phân luồng review, 2026-11-26, stack `roadguard-v5`, dự án SBX-A)
- Hạng mục Normal `7a7d62f3-5509-4bc4-97b0-168ff2a1efe5` (gói `e372e18f…`, Defect `bc9c5a9d…`): trước đó AwaitingApproval (seed). **API-created:** Giám sát duyệt, PM-a giao Crew-a (task `3b974b27-aaa0-4088-9a90-6af23630e2aa`), Crew giả lập Mobile qua Bearer: nhận/bắt đầu, assessment, execution-start/finish, upload 2 ảnh PNG, bản nộp #1 (BEFORE+AFTER, readiness INCOMPLETE `AFTER_ATTEMPT_BINDING_UNAVAILABLE`), attempts; sau SUPPLEMENT: bản nộp bổ sung #2 (AFTER) qua attempts/supplements.
- **Qua UI (`h2-review.mjs`):** PM SUPPLEMENT (`[TEST-FE H2] Cần ảnh bổ sung…`) rồi PM ACCEPT (`[TEST-FE H2] PM chấp nhận hồ sơ`) từ chi tiết nhiệm vụ FIELD bằng đường repair attempts/reviews. Hạng mục không hoàn tác (Reviewed; nếu chạy `g3-acceptance.mjs final` thì Confirmed).
- Không tạo dữ liệu Fast Track (BLOCKED: chưa có chính sách/độ phủ publish). Không tạo dữ liệu tái sử dụng ảnh.

## B13 · H4 (offline / nhánh / hạn bảo hành, 2026-11-26, stack `roadguard-v5`)
- **Hồ sơ bảo hành SBX-B (không hoàn tác):** `POST /projects/{SBX-B}/warranties` (Giám sát, API, probe `h4-probe-warranty.mjs`) tạo `e432f976-564c-4957-86c4-01e55e9fd64d`, scope PROJECT, 2026-10-01 → 2027-03-31, status ACTIVE, không có handoverDocumentId. Dùng để kiểm hạn theo bảo hành (`h4-deadline.mjs`). Nhóm khác thấy SBX-B có bảo hành này.
- **Đăng ký thiết bị ngoại tuyến SBX-A (không hoàn tác), mỗi lần chạy `h4-offline.mjs`:** 3 đăng ký PM-a (khóa P-256 tạo cục bộ, qua API `POST …/offline/devices`) + 1 đăng ký Crew-a (Bearer); 2 trong 3 đăng ký PM-a bị thu hồi qua UI (lý do `[TEST-FE H4] …`). Đã chạy 4 lần (lần 1 dừng sớm sau 3 đăng ký PM): tổng ~12 đăng ký PM-a (6 đã thu hồi) + 3 đăng ký Crew-a. Lần cuối: PM `e6b263e3…`, `29be64d2…`, `854b9af0…`; Crew `9b9051d7…`.
- **Thử guard nhánh (`h4-probe-branch.mjs`, `h4-branch.mjs`):** `POST …/road-geometry-drafts` loại BRANCH trên SBX-A bị chặn 409 `road_geometry_submission_locked` — không ghi dữ liệu (hồ sơ tuyến SBX-A vẫn CONFIRMED).
- Không có gói/grant ngoại tuyến (cần Mobile) → không tạo.

## B13 · H3 — Đề xuất/an toàn tạm thời/xuất hồ sơ/Fast Track (stack `roadguard-v5`, 2026-11-26, dự án SBX-A)
- **API-created (PM-A, `h3-seed.mjs`):** KEEP_NEW phát hiện AI `f77351da-1b01-e744-f29a-7fff8afb136f` (run `c48e80d2…`) → quyết định `f5e6a9ca-74b7-4146-ab37-f548ec433c59` → Defect CRACK/MEDIUM `dd9b3488-a06a-48ed-a150-bddd3c2f1cb0`. Gói Normal `066a69a4-0516-49a2-addd-7e9cd69dca54` (phạm vi 20–21 m, lệch 0–1 m), hạng mục `3d236e6d-cd53-44b8-9488-3a82a070aec6`, nghĩa vụ `3ea42591-b6f1-41c0-8b10-e798f61e0554`. Không hoàn tác.
- **Qua UI (regression `g4-flow.mjs`):** Giám sát duyệt hạng mục (POST approve 201), PM-A giao Crew-a (POST assign 201, task `b9026439-1310-4c19-bf46-8e7fcc608b0c`), PM-A thêm nghĩa vụ an toàn tạm thời `7458e39f-041d-40c1-a888-9d7b072fca13` (20.25–20.5 m) rồi giao biện pháp `19c1873c-144c-4606-b6a0-f7d3c3bc0a12` (POST 201).
- **API-created giả lập Crew Mobile (Bearer, `h3-crew.mjs`):** accept/start, assessment, execution-start/finish, submission #1 (BEFORE+AFTER) + attempts, PM review SUPPLEMENT (API), submission #2 có ảnh MEASUREMENT (tạo evidence-link), Crew lắp đặt biện pháp + kiểm tra `Safe` kèm evidence-link.
- Kết thúc biện pháp (resolve), xuất hồ sơ, chuyển nghĩa vụ, chính sách CRACK: xem báo cáo H3 (mục kiểm).

## B13 · H1 — Hộp thư tiếp nhận / bản đồ tuyến / matching (stack `roadguard-v5`, 2026-11-26, dự án SBX-A)
- **API-created (Reporter-a, `h1-case-routing.mjs prep`, tiền tố `[TEST-FE H1]`, không hoàn tác):** mỗi lần chạy `prep` tạo thêm 6 Report/Case (GPS trên tuyến DEMO-A, không GPS, GPS xa tuyến (21.0278,105.8342), KEEP_NEW trên MOCK-A, LINK_EXISTING, xác nhận GPS). Nhiều lượt chạy -> nhiều Case `[TEST-FE H1]` ở SBX-A. Lượt cuối: `#CAS-8BADA8A3` (on), `#CAS-AEA00A3D` (none), `#CAS-AF41345C` (far); `keep/link/conf` ghi trong `tools/e2e/h1-state.json`.
- **Qua UI Giám sát:** điều phối Case "on" vào SBX-A (POST triage 200, có căn cứ Report/ảnh + tuyến MOCK-A + bộ PUBLISHED + routingEvaluationVersion); quyết định NEEDS_LOCATION_EVIDENCE cho Case "none" (1 quyết định EFFECTIVE; Case vẫn UNASSIGNED); thử OUTSIDE_COMPANY_SCOPE cho Case "far" -> BE chặn 409 `routing_responsibility_unresolved` (không ghi gì).
- **Qua API Giám sát (pmlink):** triage Case keep/link/conf vào SBX-A (pin MOCK-A). **Qua UI PM-A:** KEEP_NEW từ Report (Defect `#DEF-3BE9EA8F` OPEN), LINK_EXISTING Report -> Defect có sẵn (candidate-decisions 201), xác nhận GPS ảnh matching-location (200, xác nhận #1).
- **Đổi dữ liệu nhân sự:** Giám sát PATCH `/users/{pm-a}/phone-number` (204) đặt SĐT ngẫu nhiên `09xxxxxxxx` cho pm-a (kiểm Profile); mỗi lần chạy `h1-ui-misc.mjs profile` đổi lại số.
- **H3 bổ sung (không hoàn tác):** Kết thúc biện pháp an toàn `19c1873c…` (resolution `7e35e3cb-e0df-4363-a8e9-77063209a3f2`, REMOVED, qua UI PM-A, POST resolution 201). Chuyển nghĩa vụ FormalRepair `3ea42591…` A → B bằng API Giám sát (`h3-transfer.mjs`): đề nghị `12c8cd29-8fab-4751-bdf3-be2aceca4eda`, tiếp nhận `a68672f6-17a4-4359-9940-8e8906901f8b` → gói `066a69a4`/hạng mục `3d236e6d` nay thuộc trách nhiệm SBX-B (nghĩa vụ TemporarySafety `7458e39f` đã resolved vẫn nằm ở SBX-A và vẫn hiện trong `transferableObligations`).
- **Export (tạo job, chỉ đọc nguồn):** PM-B tạo ZIP repair dossier `3537766a…` cho hạng mục `3d236e6d` qua UI (POST /projects/B/exports 202 → SUCCEEDED, PARTIAL); các job thử khác của `h3-export.mjs pm|sup` trên hạng mục `7a7d62f3` (gói `e372e18f`, dữ liệu nhóm H2 — chỉ đọc).
- **Defect/KEEP_NEW (API-created PM-A, `h3-seed.mjs defect`):** `b6245439-cbda-498b-ae25-5084bbcc2198` (CRACK, quyết định `0c00fa5a…`) và `32721167-3fc0-4542-8e4c-d4249a0068dd` (POTHOLE, quyết định `e280f400…`). Phát hiện AI `b9a12c15…`, `f0be1fab…` (run `62f17983…`) đã dùng.
- **Fast Track (qua UI PM-A, `h3-fasttrack.mjs`):** gói FT cho `b6245439` (lần chạy đầu) và — do lỗi chọn thẻ trong script lần 2/3 — gói FT cho Defect `09d6176a-7f29-4a3a-bd9e-44998ff38bde` (CRACK, do nhóm khác tạo) với checklist `TEST-FE-H3-CL1`. Chính sách tạo bằng API: CRACK rev1 `e1d89048…`; POTHOLE rev2 `0750616d…` (đã thu hồi), rev3 `83a968fd…` (đã thu hồi), rev4 `4e940b8f…` và các lần ban hành sau đó nếu có (xem báo cáo H3).
