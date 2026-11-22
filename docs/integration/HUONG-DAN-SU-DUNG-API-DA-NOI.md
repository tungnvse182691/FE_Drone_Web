# Hướng dẫn sử dụng các luồng và API đã nối vào FE web (PM / Giám sát)

Ngày lập: 2026-11-16. Tài liệu đi kèm: `API-WIRING-STATUS.md` (bảng 266 API), `API-GAP-NOTES-20261116.md` (khác biệt FE↔BE và mọi chỗ sửa), `TEST-DATA-LEDGER.md` (dữ liệu test đã tạo), `BE-REQUEST-WEBCOOKIE-ROUTES.md` (đề nghị cho BE).

Phạm vi: chỉ web PM (`/pm/*`) và Giám sát (`/sup/*`). Crew, Operator, Reporter, offline là mobile, không nối.

## 1. Chạy hệ thống

1. **BE (Docker, HTTPS bắt buộc vì cookie `Secure` + CSRF):** dùng **BE mới nhất `RoadGuardSystem-develop (1)`** (commit 05197e2: Web cookie cho thao tác khảo sát + danh sách bản nộp theo nhiệm vụ). Trong `RoadGuardSystem-develop (1)/RoadGuardSystem-develop/deploy/fe-handoff` chạy
   `docker compose -p roadguard-dev1 -f compose.yaml -f compose.https.yaml up -d --build` (dừng bằng `stop`; `down -v` xóa dữ liệu demo). API ở `https://localhost:18443/api/v1`. **Cách nhanh (khuyên dùng):** từ thư mục gốc FE chạy `powershell -ExecutionPolicy Bypass -File toolsstart-local.ps1` (tùy chọn `-MultiVersion`, `-NoSeed`, `-NoDev`, `-BePath`, `-Project`): script dựng BE, đợi seed của BE, tạo dữ liệu mẫu, chuẩn bị `.env.development.local` và chạy FE ở `http://localhost:5173`. Hai stack dùng chung cổng nên chỉ chạy một: stack cũ (`-p roadguard-fe`, repo `RoadGuardSystem-develop`) đang ở trạng thái dừng và còn nguyên dữ liệu test cũ. Lần đầu bản mới cần sửa `demo_ai.py` (thêm bước `submit` hình học, xem `BE-REQUEST-WEBCOOKIE-ROUTES.md` mục E).
2. **FE:** `npm ci` (lần đầu) rồi `npm run dev` → `http://localhost:5173`. Vite proxy `/api` sang `https://localhost:18443` (`vite.config.ts`).
3. **Bearer tạm (chỉ khi cần các route BE chưa mở cookie):** tạo file `.env.development.local` (đã gitignore) chứa `VITE_DEV_FILE_BEARER=true`. Điều kiện hoạt động: build dev, host localhost, và phải **đăng nhập trong phiên hiện tại** (token chỉ ở bộ nhớ; F5 là mất, đăng nhập lại để dùng tiếp).
4. **Tài khoản demo:** mật khẩu ngẫu nhiên, không lưu vào repo. Lấy bằng
   `docker exec roadguard-fe-api-1 cat /handoff/demo-accounts.json` (các khóa: `supervisor`, `pm-a`, `pm-b`, `crew-a`, `operator-a`, …). Dự án demo A: `72f84201-c001-4000-8000-000000000001`, B: `…0002`.

Gỡ Bearer tạm: tìm `grep -rn "TEMP-BEARER" src`. BE mở cookie cho route nào thì xóa dòng route đó khỏi `TEMP_BEARER_ROUTES` trong `src/api/devFileBearer.ts`.

## 2. Quy ước chung của mọi luồng ghi

- Web dùng cookie `WebSession`; mọi lệnh ghi gửi `X-CSRF-TOKEN`, `Idempotency-Key` (UUID mới mỗi lần), và `If-Match` (ETag/version đọc lại ngay trước khi gửi) với tài nguyên có phiên bản.
- Lỗi BE luôn hiện trên giao diện dạng `HTTP <mã> <code> · <correlationId>`; không có dữ liệu giả. CSDL rỗng thì hiện trạng thái rỗng.
- Mã lỗi hay gặp: `409 concurrency_conflict` / `412` (version cũ → bấm Tải lại), `428` (thiếu header điều kiện), `403 access_forbidden` (sai vai trò), `409 source_not_ready` / `*_stale` (nguồn chưa sẵn sàng/đã đổi).

## 3. Luồng PM

| # | Màn / vị trí | Việc làm | API | Quy tắc BE cần biết |
|---|---|---|---|---|
| P1 | `/pm/dashboard` | Xem tổng hợp, đồng hồ thời hạn, **xin gia hạn** | GET projects, defects, clocks…; POST clocks/{id}/extensions | If-Match = version đồng hồ |
| P2 | `/pm/repair-batches/assign` | **Giao đội thi công** hạng mục Normal đã duyệt | POST items/{id}/assign | Chỉ hạng mục `ReadyToAssign`; sourceKind REPORTER/SURVEY; tuyến phải có bộ phân đoạn đã công bố |
| P3 | `/pm/field-tasks` → *Chi tiết & Ảnh* | **Review** kết quả đo; **giao lại / hủy** nhiệm vụ đo; **quyết định khi hình học tuyến thay đổi** | POST reviews, assign/reassign/cancel, location-impact-decisions | Giao lại/hủy chỉ cho nhiệm vụ đo (MEASURE_ONLY); nhiệm vụ đã bắt đầu phải kèm bàn giao; khung ảnh hưởng hình học chỉ có dữ liệu khi dự án có đánh giá ảnh hưởng |
| P4 | `/pm/proposals` → *Xem hồ sơ* | Thao tác hạng mục: hủy, tạo hạng mục Normal kế tiếp, hiệu chỉnh quyết định (PM chỉ cho Fast Track), yêu cầu xem xét lại | POST cancellations, normal-successors, corrections, review-requests | Hiệu chỉnh hạng mục Normal là của Giám sát; cần căn cứ |
| P5 | Cùng modal P4 | **Giám sát nhận thông báo** (Fast Track): xem, chỉ định, thay, thu hồi | GET/PUT/DELETE notification-supervisor | Chỉ PM, chỉ Fast Track đang hoạt động; PM nhập `supervisorId` (BE không có API liệt kê Giám sát) |
| P6 | Cùng modal P4 | **Biện pháp an toàn thi công**: giao cho Crew đang thi công; xem theo mã | POST/GET safety-measures | Chỉ hạng mục Normal đã duyệt + Crew đang được giao; nghĩa vụ an toàn phải nằm trong phạm vi nghĩa vụ sửa chính thức |
| P7 | `/pm/surveys` → chi tiết bản ghi | **Hoãn** kế hoạch; **giao lại**, **hủy**, **tạo nhiệm vụ bổ sung** cho nhiệm vụ khảo sát (sau khi tạo bổ sung có liên kết "Mở nhiệm vụ bổ sung") | POST survey-plans/{id}/postpone, survey-tasks/{id}/cancel, /reassign, /supplements | Web cookie (BE mới). Nhiệm vụ bổ sung chỉ nhận phân đoạn nằm trong bộ dữ liệu đã nộp của nhiệm vụ gốc, giữ nguyên dải khảo sát; Operator phải thuộc dự án |
| P8 | Cùng chi tiết nhiệm vụ khảo sát | **Bộ dữ liệu**: tự tải danh sách bản nộp của nhiệm vụ (mặc định bản mới nhất, có ô chọn bản và "Tải thêm") → đọc, độ phủ, tạo đánh giá, khóa baseline, xem lần khóa; gói công việc; tạo job xử lý; chạy AI mock; danh sách/đọc/chạy lại job | GET datasets, coverage, work-package (cookie); POST assessments, baseline-selections, processing-jobs, ai-mock-runs, retry (Bearer tạm) | `modelVersionId` nhập tay (BE chưa có API danh mục mô hình). Bấm "Lấy gợi ý" để điền phiên bản hình học/fixture |
| P9 | `/pm/research-validation` | **Chi tiết lần chạy AI** (cả Giám sát); **Gán nhãn huấn luyện**: chọn phát hiện AI, chỉnh khung, tạo nhãn, duyệt/từ chối, sửa khung | GET ai-mock-runs/{id}; GET/POST labels, revisions, review | Nhãn chỉ PM; khung chuẩn hóa 0..1 |
| P10 | `/pm/reports` (chọn một dự án) | **Xác nhận thống kê khiếm khuyết**: chọn phạm vi, phân đoạn, phép đo, `sharedPartId`, nguồn | GET/POST defect-statistics | Mỗi (loại, đơn vị) chỉ ghim 1 phép đo/lần; `sharedPartId` là GUID PM tự đặt |
| P11 | `/pm/defects/:id/verify` | **Xuất bản / rút xuất bản công khai** (chỉ hiện khi khiếm khuyết VERIFIED) | POST defects/{id}/publications, publications/{id}/withdraw, GET public/publications/{id} | BE 409 `source_not_ready` nếu khiếm khuyết chưa đủ điều kiện |
| P12 | `/pm/notifications` (cuối trang) | **Yêu cầu tiếp nhận**, chỉ định đồng hồ (Giám sát), **bản tóm tắt tuần** | GET receiving-requests, clocks, weekly-digests | PM chỉ xem yêu cầu; xác nhận nhận là của người chịu trách nhiệm hiện tại |
| P13 | `/pm/acceptance`, `/pm/evidence-closeout` | Gửi Giám sát / yêu cầu làm lại / xem hồ sơ nghiệm thu | GET repair-packages…, POST attempts/reviews | ACCEPT hoặc SUPPLEMENT |
| P14 | `/pm/retention`, `/pm/legal-hold` | Đánh giá lưu trữ, phong tỏa pháp lý, **xác nhận căn cứ lưu trữ** | POST retention/evaluations, holds, PUT files/{id}/basis | Căn cứ chỉ xác nhận khi kiểm kê đầy đủ (409 `retention_inventory_incomplete`) |
| P15 | Màn đăng nhập | **Quên mật khẩu**: nhập email rồi bấm nút | POST auth/password-recovery-requests | BE trả 202 chung cho mọi email |

## 4. Luồng Giám sát

| # | Màn / vị trí | Việc làm | API |
|---|---|---|---|
| S1 | `/sup/proposals` | Duyệt hạng mục Normal; hiệu chỉnh quyết định (Normal) | POST approve, corrections |
| S2 | `/sup/acceptance`, `/sup/evidence-closeout` | **Xác nhận cuối** hạng mục | POST final-confirmation |
| S3 | `/sup/notifications` (cuối trang) | **Chỉ định người phụ trách đồng hồ** (ProjectManagerReview → PM; SupervisorInitialApproval/FinalConfirmation → Giám sát); chỉ định người nhận yêu cầu `SupervisorEscalation` | POST clocks/{id}/appointments, receiving-requests/{id}/appointment |
| S4 | `/sup/projects/:id` | **Gia hạn phạm vi xử lý** sau đóng vận hành (chỉ hiện khi có bản ghi đóng vận hành) | GET lifecycle, POST lifecycle/renewed-handling-scope |
| S5 | `/sup/system-control` | Phong tỏa pháp lý; chi tiết tệp lưu trữ + căn cứ | POST retention/holds…, PUT basis |
| S6 | `/sup/personnel` | Quản lý tài khoản, **đặt lại mật khẩu** | POST users/{id}/password-reset |
| S7 | `/sup/research-validation` | Chi tiết lần chạy AI, kiểm định đo đạc | GET ai-mock-runs/{id}, validation-runs |

## 4b. Màn không còn dữ liệu giả: hiện rỗng khi BE chưa có API
Khi test tay, các khu vực sau **cố ý trống hoặc "—"** vì BE chưa có API (không phải lỗi FE): Dashboard Giám sát (thẻ sắp hết hạn, đoạn chưa baseline, bản đồ/bảng rủi ro, PCI, SLA, lọc Kỳ/Khu vực), tab Mô hình AI trong Cấu hình hệ thống, xuất nhật ký, xuất báo cáo từ Dashboard, màn Xung đột ngoại tuyến, các thao tác phê duyệt đề xuất chưa có API (yêu cầu bổ sung, từ chối, gán đội). Giám sát không đọc được danh mục loại lỗi (BE chỉ cho PM). Chi tiết ở `API-AUDIT-DA-GAN-TU-DAU.md` mục 3.

## 5. Dữ liệu mẫu đã tạo

Mọi dữ liệu test đều ghi lý do `[TEST-FE]` và được liệt kê trong `TEST-DATA-LEDGER.md` (mục B). Gồm: chuỗi nghiệm thu và hiệu chỉnh hạng mục, nhiệm vụ đo giao lại/hủy, kế hoạch/nhiệm vụ khảo sát đã hoãn/hủy, đánh giá + khóa baseline (bộ dữ liệu `a8a7c1e2…`), job xử lý và lần chạy AI mock, nhãn huấn luyện, xác nhận thống kê, gói có nghĩa vụ an toàn tạm thời + biện pháp an toàn, yêu cầu tiếp nhận `CrewSupplement`. Cách xóa: reset volume demo (`docker compose … down -v` rồi `up -d`) khi có dữ liệu thật; cần chủ dự án đồng ý trước.

## 5b. Chuẩn bị dữ liệu test trên BE mới (script có sẵn)
BE mới chỉ seed rất ít dữ liệu. Sau khi dựng stack xong, chạy **một lệnh** để tạo đủ dữ liệu cho các luồng:

```
node tools/seed-test-data.mjs
```
(biến tùy chọn: `RG_API_CONTAINER`, `RG_SQL_CONTAINER`, `RG_BASE`; mặc định theo project `roadguard-new`; với stack `roadguard-dev1` đặt `RG_API_CONTAINER=roadguard-dev1-api-1 RG_SQL_CONTAINER=roadguard-dev1-sql-1`). Script đọc mật khẩu demo từ container lúc chạy (không in, không ghi file), chạy lại an toàn (tiến độ ở `tools/.seed-state.json`, **không commit file này**) và tạo: hạng mục `ReadyToAssign` (thử Giao đội), hạng mục đang thi công + nghĩa vụ an toàn (thử Biện pháp an toàn), hạng mục đã nộp + `CrewSupplement` (thử Yêu cầu tiếp nhận), hạng mục `Confirmed` (thử Hiệu chỉnh / Xem xét lại / Hạng mục kế tiếp), 2 nhiệm vụ đo (thử giao lại / hủy), 1 kế hoạch + 1 nhiệm vụ khảo sát mới (thử hoãn / hủy / giao lại). Hạng mục `AwaitingApproval` và bản nộp dataset là dữ liệu seed sẵn của BE. Thêm tùy chọn `--multi-version <đường-dẫn video mp4 của BE: contracts/ai/fixtures/anh02/synthetic-road-v1.mp4>` để có nhiệm vụ **29 bản nộp** (bản 1 nộp qua API, bản 2..29 chèn thẳng bảng `SurveyDataVersions` vì API không cho nộp lần 2) dùng thử chọn bản / đổi bản / "Tải thêm". Cuối lần chạy script in bảng "màn nào dùng dữ liệu nào". Đã chạy thử từ stack trống: 100% bước thành công.

## 6. Việc cần làm khi BE hoàn thiện

1. BE gắn `[WebCookieEligible]` cho các route trong `BE-REQUEST-WEBCOOKIE-ROUTES.md` rồi xóa danh sách `[TEMP-BEARER]`.
2. BE bổ sung API: `datasetId` theo nhiệm vụ, danh mục `modelVersionId`, danh sách Giám sát cho PM, danh sách bản xuất bản theo khiếm khuyết, công bố `expectedGeometryVersion`.
3. Chạy lại các luồng chưa chạy thật (mục 7) khi có dữ liệu.

## 7. Kết quả kiểm thử (2026-11-16, BE Docker thật, trình duyệt headless Edge)

**Đã chạy thật qua giao diện, thành công:** giao đội thi công; giao lại/hủy nhiệm vụ đo; thao tác hạng mục (hủy, kế tiếp, hiệu chỉnh, xem xét lại); hoãn kế hoạch, giao lại và hủy nhiệm vụ khảo sát; đọc dataset + độ phủ + gói công việc; tạo đánh giá; khóa baseline (3 lần, xem lần khóa); tạo/đọc job xử lý; chạy AI mock; chi tiết lần chạy AI; gán nhãn (tạo, duyệt, sửa); xác nhận thống kê; biện pháp an toàn (tạo, xem); chỉ định đồng hồ; yêu cầu tiếp nhận (danh sách); thu hồi Giám sát nhận thông báo; khôi phục mật khẩu (202).

**Đã gọi BE thật, BE từ chối đúng quy tắc (giao diện hiện lỗi chuẩn):** chỉ định Giám sát nhận thông báo cho hạng mục đã hủy (409 `invalid_state_transition`); xuất bản khiếm khuyết OPEN (409 `source_not_ready`); căn cứ lưu trữ khi kiểm kê chưa đầy đủ (409 `retention_inventory_incomplete`); bản tóm tắt tuần không tồn tại (404).

**Dựng xong, chưa chạy thành công vì thiếu dữ liệu mà BE tự sinh:** quyết định ảnh hưởng hình học (cần đổi phiên bản tuyến, sẽ làm đổi hình học hiện hành); xuất bản/rút xuất bản; gia hạn phạm vi xử lý (cần bản ghi đóng vận hành, sẽ đóng dự án demo); ack/appointment yêu cầu tiếp nhận (yêu cầu demo thuộc Crew); PUT Giám sát nhận thông báo thành công (cần hạng mục Fast Track đang hoạt động); chạy lại job (job mới ở QUEUED); đặt lại mật khẩu (đổi mật khẩu tài khoản thật, để người dùng tự bấm).

**Smoke toàn bộ trang (BE cũ):** 25 trang PM và 18 trang Giám sát tải không có lỗi API.

**Kiểm lại trên BE mới (`RoadGuardSystem-new`, sau đó bản mới nhất `RoadGuardSystem-develop (1)`) (dữ liệu demo mới, bằng cookie, không Bearer):**
- Trên **BE mới nhất (commit 05197e2)**: danh sách bản nộp theo nhiệm vụ 200 (cookie), có bản → hiện danh sách, F5 vẫn đúng, nhiệm vụ chưa nộp → "Chưa có bộ dữ liệu"; sau đó chạy lại toàn bộ luồng bằng dữ liệu của `seed-test-data.mjs` (giao đội, giao lại/hủy nhiệm vụ đo, hiệu chỉnh/xem xét lại/kế tiếp/hủy, biện pháp an toàn, nhãn, thống kê, chỉ định đồng hồ, yêu cầu tiếp nhận, đánh giá + baseline + job + AI, bổ sung/hoãn khảo sát, khôi phục mật khẩu, căn cứ lưu trữ 409, thẻ gia hạn): đều như kết quả cũ, không lỗi mới. Smoke 25 trang PM + 16 trang Giám sát: chỉ `/pm/dashboard` và `/pm/research-validation` 401 ở các route Bearer-only khi tải trực tiếp (như trước).
- Thành công (lần kiểm trên BE mới trước đó): đọc dataset, độ phủ, gói công việc (200); **tạo nhiệm vụ bổ sung (201)** rồi mở nhiệm vụ con bằng liên kết; nhiệm vụ gốc hiện "Chờ bổ sung"; giao lại và hủy nhiệm vụ con (200); hoãn kế hoạch (200).
- Lỗi BE xác nhận quy tắc: bổ sung với dải khác bộ dữ liệu đã nộp → 422 `survey_validation_failed` (FE đã khóa dải theo nhiệm vụ gốc).
- Smoke 20 trang PM + 13 trang Giám sát: không lỗi, trừ `/pm/dashboard` (baseline-selections, kết quả AI) và `/pm/research-validation` (kết quả AI) trả 401 khi tải trực tiếp, vì các route này BE mới chưa có Web cookie và Bearer tạm mất khi F5 (đăng nhập lại là dùng được).
- **Đã kiểm tiếp trên BE mới (cùng đợt, qua giao diện hoặc API với dữ liệu tạo thêm):**
  - Giao đội thi công (201); giao lại nhiệm vụ đo (sự kiện `REASSIGNED`) và hủy (`Cancelled`).
  - Chuỗi Crew → PM review → Giám sát xác nhận cuối: hạng mục `Confirmed`; hiệu chỉnh quyết định (Giám sát), yêu cầu xem xét lại, tạo hạng mục Normal kế tiếp và hủy (PM): đều thành công.
  - Gói có nghĩa vụ an toàn tạm thời → giao biện pháp an toàn (201) → xem biện pháp (200).
  - Gán nhãn huấn luyện: tạo (201), duyệt (200), sửa khung (201); xác nhận thống kê (201); chỉ định đồng hồ (201); danh sách yêu cầu tiếp nhận `CrewSupplement`; chi tiết lần chạy AI; đánh giá + khóa baseline + job + chạy AI (Bearer tạm: 201/201/202/202); tạo đánh giá lưu trữ, phong tỏa (tạo, đọc, gỡ).
  - Khôi phục mật khẩu (202); xác nhận căn cứ lưu trữ trả 409 `retention_inventory_incomplete` đúng quy tắc; thẻ gia hạn phạm vi xử lý đọc vòng đời thật.
- **Nhiều bản nộp (đã kiểm):** nhiệm vụ 29 bản: trang 1 có 25 bản, đổi bản tải lại chi tiết + độ phủ, "Tải thêm" nạp đủ 29, giữ bản đang chọn. Quy tắc chọn bản: BE đã có phán quyết phương án D, FE đã triển khai (cảnh báo bản không mới nhất, chỉ khóa đoạn/dải đủ ba mục PASS, thay baseline gửi `expectedBaselineSelectionId`): xem `CAN-XAC-NHAN-CHON-BAN-NOP-DATASET.md` mục 8.
- **Chưa kiểm được trên BE mới vì không có dữ liệu:** Giám sát nhận thông báo (cần hạng mục Fast Track đang hoạt động), xuất bản/rút xuất bản (cần khiếm khuyết VERIFIED), quyết định ảnh hưởng hình học (cần đổi phiên bản tuyến), gia hạn phạm vi xử lý (cần đóng vận hành), bản tóm tắt tuần, ack/appointment yêu cầu tiếp nhận.

**Kiểm tra kiểu:** `node node_modules/typescript/bin/tsc --noEmit -p .` pass.

## 8. Bảng tổng hợp

Xem `API-WIRING-STATUS.md` (sinh bằng `node tools/gen-api-wiring-table.cjs`): **197 API đã nối**; 69 chưa nối, trong đó 64 ngoài phạm vi web (mobile, Bearer, hạ tầng) và 6 thuộc nhóm "web":

- **Đóng theo phản hồi của BE (`6API.txt`), đã có luồng Web khác:** `GET/PATCH /me` (dùng `/profile`), `POST /admin/users/{id}/password-reset` (dùng `/users/{id}/password-reset`), 2 route `road-sections/.../survey-plans|survey-requests` và `projects/{id}/survey-plans/{id}/postpone` (dùng luồng V2).
- **Đã nối và dùng Web cookie trên BE mới:** hủy, giao lại, tạo nhiệm vụ bổ sung, hoãn kế hoạch, đọc dataset/độ phủ/gói công việc. Còn dùng Bearer tạm: đánh giá bộ dữ liệu, baseline, job xử lý, AI mock, kiểm định, lưu trữ (chi tiết `BE-REQUEST-WEBCOOKIE-ROUTES.md` mục C).

## Bổ sung 2026-11-17: xem video nguồn của bản nộp
PM → Đợt bay Drone → Chi tiết nhiệm vụ khảo sát → khối "Bộ dữ liệu" → chọn bản nộp → mục "Video nguồn của bản nộp" → "Xem video nguồn". Chi tiết, giới hạn (tải toàn tệp, Bearer tạm, chưa Range) và kết quả kiểm: `XEM-VIDEO-NGUON-DA-TRIEN-KHAI.md`.
