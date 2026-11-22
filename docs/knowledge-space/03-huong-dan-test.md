# 03 — Hướng dẫn dựng môi trường và test

## 1. Dựng môi trường (Windows, Docker Desktop)

### 1.1 Thành phần
| Thành phần | Địa chỉ | Ghi chú |
|---|---|---|
| BE (ASP.NET) | `https://localhost:18443` | Chứng chỉ tự ký; proxy dev đặt `secure:false` |
| Web FE (Vite) | `http://localhost:5173` mặc định | Nếu cổng 5173 bận, chạy cổng khác và đặt `RG_BASE` (xem 1.4) |
| MinIO (kho tệp) | `localhost:19001` | Tải/kiểm tệp |
| Mailpit (hộp thư thử) | `http://localhost:18026` | Xem email mời nhân sự, lấy link có token |
| SQL Server | trong container `roadguard-v3-sql-1` | **Không ghi DB trực tiếp** để "làm dữ liệu" |

Container (project compose `roadguard-v3`, BE mới develop c0c99ca): `roadguard-v3-api-1`, `-sql-1`, `-minio-1`, `-mailpit-1` (và các container khởi tạo chạy một lần: `init`, `tls-init`, `scenarios`).

### 1.2 Lần đầu (chưa có container)
```
cd "D:\ConnectAPI\RoadGuardSystem-develop (1)\RoadGuardSystem-develop\deploy\fe-handoff"
docker compose -p roadguard-v3 -f compose.yaml -f compose.https.yaml up -d --build
```
BE tự seed dữ liệu giả lập: **Synthetic Project A (`SBX-A`)**, **Synthetic Project B (`SBX-B`)**, tài khoản demo. Seed `scenarios` của BE hiện **vẫn lỗi 409** ở bước xác nhận hình học (`input-ai-confirm-a`): thiếu bước `POST …/road-geometry-drafts/{id}/submit` trước `confirm`. Cách vá đã dùng: sửa `demo_ai.py` (thêm `submit`, rồi `GET` draft lấy ETag mới để `confirm`), `docker cp` vào container `roadguard-v3-scenarios-1` tại `/demo_ai.py`, xóa khóa `input-ai-confirm-a` trong `scenarios.json` của volume `roadguard-v3_scenario-progress`, rồi `docker start -a roadguard-v3-scenarios-1`. Không sửa mã BE.

### 1.3 Mỗi lần mở máy (Docker Desktop tắt)
1. Bật **Docker Desktop**, chờ engine sẵn sàng.
2. `docker start roadguard-v3-sql-1 roadguard-v3-minio-1 roadguard-v3-mailpit-1`
3. Đợi ~25 giây rồi `docker start roadguard-v3-api-1`
4. Kiểm tra: `curl -sk https://localhost:18443/health` → `200`.
5. Nếu thiếu `node_modules`: `npm ci` trong thư mục FE.
6. Chạy FE: `npx vite` (cổng 5173) hoặc `node_modules/.bin/vite --port 5180 --strictPort`.
   **Cẩn thận:** nếu 5173 đã có ứng dụng khác (đã gặp một ứng dụng khác trên máy) thì `curl` ra trang khác dù Vite của bạn đã lỗi. Luôn kiểm `<title>` của trang là "HOÀNG HẢI — Quản Lý Bảo Hành…".

### 1.4 Biến môi trường FE
- `.env.development.local`: `VITE_DEV_FILE_BEARER=false` (Web dùng cookie; không dùng Bearer cho tệp). Đổi `.env*` thì **phải khởi động lại Vite**.
- `RG_BASE` (chỉ cho harness test): địa chỉ Vite, mặc định trong `tools/e2e/lib.mjs`.

## 2. Tài khoản và vai trò
Tài khoản demo nằm trong container: `docker exec roadguard-v3-api-1 cat /handoff/demo-accounts.json` (có email + mật khẩu — **không chép vào tài liệu/chat/git**). Các khóa:
| Khóa | Vai | Dùng cho |
|---|---|---|
| `supervisor` | Giám sát (Web) | mọi việc của Giám sát |
| `pm-a` | PM của SBX-A (Web) | luồng chính |
| `pm-b` | PM của SBX-B (Web) | thử gói thuộc Project B |
| `reporter-a/b`, `operator-a/b`, `crew-a/b`, `suspended-a`, `ended-a` | mobile | **Không đăng nhập Web** (sẽ bị từ chối). Chỉ cần biết khi đọc dữ liệu họ tạo |

Quy tắc: mỗi trình duyệt một phiên; **không chạy hai kịch bản cùng một tài khoản song song** (phiên cookie dùng chung sẽ đá nhau).

## 3. ⚠ Thao tác KHÔNG hoàn tác được (đọc trước khi bấm)
Môi trường test là **dùng chung và có trạng thái**. Các lệnh dưới đây làm thay đổi vĩnh viễn; chỉ làm khi đã được giao việc đó, và **ghi vào `TEST-DATA-LEDGER.md`**:
| Thao tác | Hậu quả |
|---|---|
| Xác nhận hoàn thành thi công (Giám sát) | `constructionCompletion = CONFIRMED` — đã làm cho SBX-A, không làm lại được |
| Chuyển nghĩa vụ giữa dự án | Kéo gói sửa chữa sang dự án nhận **và để `projectId` lệch (lỗi BE #10)** → màn Fast Track của dự án nhận không đọc được. Đã làm với nghĩa vụ `f1a94258` |
| Bật phong tỏa pháp lý | Hiện **không gỡ được từ Web** (không có API liệt kê hold; `holdId` chỉ nằm trong `sessionStorage`). SBX-A đang có 1 hold — mọi tệp ra `BLOCKED_HOLD` |
| Chấp nhận lời mời | Token dùng một lần |
| Duyệt Normal / giao hạng mục | Chuyển trạng thái, không quay lại |
| Quyết định ứng viên (KEEP_NEW/LINK_EXISTING/REJECT) | Bất biến |

An toàn để lặp lại: xuất hồ sơ DOSSIER (PM), chạy đánh giá lưu trữ (Giám sát), đọc/duyệt màn hình, `GET` bất kỳ.

## 4. Công cụ test có sẵn

### 4.1 Harness giao diện thật — `tools/e2e/`
Dùng `puppeteer-core` điều khiển Microsoft Edge (cần Edge đã cài). Cài: `cd tools/e2e && npm i`.
```
bash tools/e2e/run.sh smoke-routes.mjs     # duyệt 40 route PM + Giám sát (lỗi JS, 5xx, màn trống)
bash tools/e2e/run.sh readback-state.mjs   # đọc lại và kiểm quyền (17 kiểm tra, chỉ GET, không phụ thuộc dữ liệu)
bash tools/e2e/run.sh flows-ui.mjs         # kiểm điều khiển + thao tác an toàn lặp lại (21 kiểm tra); e5-survey-plan.mjs (kế hoạch khảo sát), e6-ai-run.mjs (theo dõi AI)
bash tools/e2e/run.sh e1-field.mjs         # FIELD (E1); e2-case.mjs (Case), e3-repair.mjs / e3-ft.mjs (gói sửa chữa, Fast Track), e4-*.mjs (khảo sát, lưu trữ) — các kịch bản E* TẠO dữ liệu, chỉ chạy lại được trên dữ liệu mới
```
`run.sh` nạp tài khoản từ container vào biến môi trường (không ghi ra file). Dùng `RG_BASE=http://localhost:5180 bash …` nếu Vite ở cổng khác.
Thư viện dùng chung `tools/e2e/lib.mjs`: `open()`, `login()`, `go()` (điều hướng SPA), `apiGet()` (GET bằng phiên trình duyệt), `setNative()`, `clickByText()`.

**Mẹo viết thêm kịch bản:**
- Điều hướng bằng `history.pushState` + `popstate` (hàm `go`) để giữ phiên; `page.goto` sẽ tải lại và mất state.
- Ô nhập của React phải đặt giá trị bằng *setter gốc* rồi `dispatchEvent('input'|'change')` (hàm `setNative`), `element.value = …` không đủ.
- `alert()` của trình duyệt làm treo script headless: `open()` đã tự `dismiss` và ghi vào `log.dialogs`.
- Git Bash **đổi** tham số kiểu `/sup/legal-hold` thành đường dẫn Windows. Truyền đường dẫn qua biến môi trường hoặc bỏ dấu `/` đầu.
- Mỗi lần khởi động lại máy, thư mục tạm có thể mất; harness này nằm trong repo nên không mất.

### 4.2 Script kiểm tra tĩnh `tools/check-*.cjs` (75 file)
Chạy từng file bằng `node tools/<tên>.cjs`. Hiện **42 đạt, 33 lỗi** nhưng phần lớn do **bộ mock lỗi thời** (component mới chưa được mock) hoặc cần git/đường dẫn cũ — **không phải lỗi sản phẩm**. Chi tiết ở mục 14 của `NGHIEM-THU-THEO-LUONG.md`. Đừng coi đây là chỉ báo duy nhất; ưu tiên 4.1.

### 4.3 Kiểm tra nhanh trước khi báo xong
```
npx tsc --noEmit -p .      # type-check, phải sạch
npx vite build             # build, phải sạch
```

## 5. Công thức test từng luồng (không mobile)
Đọc [02-dataflow.md](02-dataflow.md) cho API và trạng thái; mỗi dòng dưới là "làm gì → mong đợi".
| Luồng | Vai/Màn | Làm gì | Mong đợi (đã đạt trên môi trường hiện tại) |
|---|---|---|---|
| W01 mời | `supervisor` → `/sup/personnel` → "Gửi lời mời nhân sự mới" | Nhập email `@roadguard.test`, chọn vai PM, gửi | POST `/invitations` 201; email xuất hiện ở Mailpit |
| W01 nhận | Trình duyệt **chưa đăng nhập** mở link trong email | Nhập tên + mật khẩu ≥ 8 ký tự, tick đồng ý, "Kích hoạt tài khoản" | preview 200 → accept 200 → về `/login`; mở lại link báo "Token đã vô hiệu hóa" |
| W01 tổ chức | `supervisor` → Nhân sự → sửa người dùng | Nhập đơn vị + lý do → lưu | PUT `/users/{id}/organization` 200; GET lại đúng |
| W02 | `pm-a` rồi `supervisor` → `/…/projects/{id}` thẻ "Hoàn thành thi công" | PM khai báo (chọn tệp, lý do); Giám sát xác nhận | 201 + 201; lifecycle `CONFIRMED` ⚠ không hoàn tác |
| W04 | `pm-a` → hộp thẩm định / chi tiết khiếm khuyết | Chọn ứng viên chưa quyết, KEEP_NEW/LINK_EXISTING/REJECT + lý do | 201; `GET candidate-decisions/{id}` khớp loại |
| W05 | `pm-a` → `/pm/surveys` → "Xem chi tiết" nhiệm vụ SUBMITTED | "Đọc phiên bản hình học…" → nhập 4 giá trị (mục W05 trong dataflow) → "Chạy AI mock" | 202 `QUEUED` → `SUCCEEDED` |
| W07 duyệt | `supervisor` → `/sup/proposals` → hạng mục Normal | Chọn hạng mục, lý do → "Phê duyệt hạng mục Normal" | 201; hạng mục `ReadyToAssign` |
| W07 giao | `pm-a` → `/pm/repair-batches/assign` | Chọn hạng mục, Crew, hạn, nguồn, chỉ dẫn → "Ban Hành Lệnh Giao Việc" | 201; hạng mục `Assigned`; sinh task NORMAL `NewAssigned` |
| W07 xuất | `pm-a` → `/pm/proposals/{pkg}` → "Xuất hồ sơ gói (PDF)" | Bấm, chờ | 202 → `SUCCEEDED` → manifest/content 200; Giám sát **không thấy nút** |
| W07 chuyển nghĩa vụ | `supervisor` → `/sup/proposals` → panel LD06 | Dự án gửi → nghĩa vụ → dự án nhận → lý do → "Phát hành"; rồi đổi sang dự án nhận → "Tiếp nhận" | 201 + 201 ⚠ xem mục 3 |
| W08 | `pm-a`/`pm-b` → `/pm/fast-track` | Đọc chính sách/độ phủ; "Phát lệnh" | Hiện bị 409 `source_not_ready` / hoặc danh sách trống nếu dự án có bản ghi lệch (lỗi BE #1, #10) — **ghi lại, đừng sửa FE để lách** |
| W10 đánh giá | `supervisor` → `/sup/legal-hold` → mở dự án | "Chạy đánh giá mới" | 202 → `COMPLETE`; có hold thì `BLOCKED_HOLD` |
| W10 căn cứ | cùng modal → "Xem chi tiết tệp" → "Xác nhận căn cứ" | Nhập lý do | UI đúng; BE hiện 409 `retention_inventory_incomplete` |

### Cách ghi một kết quả test (chuẩn của đội)
1. Ghi **POST/PUT qua UI thật** (mã HTTP) và **GET đọc lại độc lập** (trạng thái lưu). Chỉ gọi "Đạt" khi cả hai khớp.
2. Tách riêng: FE đã nối / tsc+build / GET thật / POST+GET qua UI.
3. Dữ liệu tạo mới: tiền tố **`[TEST-FE]`** ở lý do/tên; ghi vào `TEST-DATA-LEDGER.md` (id, ai tạo, có hoàn tác được không).
4. Lỗi thuộc **BE** (mã 4xx/5xx có `code` rõ ràng, thiếu API, dữ liệu lệch): thêm vào bảng ở mục 13.2 `NGHIEM-THU-THEO-LUONG.md` kèm `correlationId`. Lỗi **FE**: sửa luôn, rồi xóa khỏi tài liệu nghiệm thu khi đã kiểm lại.
5. Khi kết quả một lệnh ghi **chưa rõ** (timeout, mất mạng): giữ nguyên key/body/phiên bản, chỉ `GET`; không POST lại.

## 6. Dữ liệu đang có (2026-11-22, stack `roadguard-v3`, seed mới)
Xem `docs/integration/TEST-DATA-LEDGER.md` (mục B9) để biết đầy đủ. Tóm tắt:
- **Seed BE:** hai dự án `SBX-A` (`72f84201-c001-4000-8000-000000000001`, PM `pm-a`) và `SBX-B` (`…0002`, PM `pm-b`) có hình học, kế hoạch/nhiệm vụ khảo sát đã nộp, dataset, 3 lượt AI mỗi dự án, 1 incident Reporter, export PDF. **Chưa** có quyết định ứng viên, defect, gói sửa chữa, chính sách hay độ phủ — phải tự tạo qua giao diện (đây cũng là bài test).
- **Đã làm trong đợt test 2026-11-22 (không hoàn tác):** nhiệm vụ khảo sát SBX-B đã COMPLETED; nghĩa vụ `81a6cb99…` đã chuyển A → B (hạng mục `da6b635d` ở B chưa giao được vì lỗi BE #13); nhiều Report/Case `[TEST-FE]` ở SBX-A; gói Normal và hai gói Fast Track đã giao ở SBX-A, một gói Fast Track đã giao ở SBX-B.
- Nếu cần dữ liệu sạch để chạy lại các kịch bản `e1…e4`: dựng stack mới (project compose khác, ví dụ `roadguard-v4`) thay vì xóa dữ liệu bằng tay.
- Tài khoản test của stack cũ (`test-fe-pm@…`, `test-fe-invite@…`) **không còn** trên stack này.

## 7. Sự cố thường gặp
| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Trang đăng nhập hiện thương hiệu khác (không phải Hoàng Hải) | Cổng 5173 đang bị ứng dụng khác chiếm | Chạy Vite ở cổng khác; đặt `RG_BASE` |
| Vite báo `ERR_MODULE_NOT_FOUND` / "Could not resolve 'vite'" | Thiếu `node_modules` | `npm ci` |
| `docker: error during connect … dockerDesktopLinuxEngine` | Docker Desktop chưa chạy | Bật Docker Desktop, rồi bước 1.3 |
| API thoát với mã 139 khi nâng cấp tại chỗ BE cũ | Seeder lỗi trên dữ liệu cũ | Dùng stack mới `roadguard-v3`, không nâng cấp tại chỗ |
| `POST /auth/web/renew 401` khi chưa đăng nhập | Bình thường | Bỏ qua |
| `GET /ai-candidates/{id}` → 401 (cookie) | BE chỉ mở Bearer cho route này | FE đã có đường lùi; ghi vào lỗi BE #7 |
| `GET …/road-geometry-submission` → 404 | Dự án chưa có bản nộp hình học | Bình thường (trạng thái rỗng) |
| Màn Fast Track: "Danh sách sai phạm vi dự án hoặc trùng bản ghi" | BE trả bản ghi mang `projectId` dự án khác (lỗi BE #10) | **Không sửa FE để nuốt lỗi**; báo BE |
| PowerShell làm hỏng tiếng Việt khi sửa file | `Get-Content/Set-Content` đổi mã hóa | **Không** sửa file dự án bằng `Get-Content/Set-Content`; dùng trình soạn thảo hoặc công cụ Edit |
| Sau khi sửa `.env*` mà vẫn như cũ | Vite chỉ đọc env lúc khởi động | Khởi động lại Vite |
| Lệnh ghi vừa thành công vừa báo lỗi | Mất phản hồi sau khi BE đã lưu | `GET` để đối chiếu; đừng POST lại |

## 8. Việc "test phụ" nên làm trước (gợi ý cho người mới)
1. Chạy `smoke-routes.mjs` và `readback-state.mjs` để chắc môi trường đúng.
2. Đọc từng luồng ở [02-dataflow.md](02-dataflow.md), mở màn tương ứng bằng tay, so từng nút/trường với bảng API.
3. Chọn các mục **[CHƯA KIỂM]**: danh sách Case (W03), duyệt đo (W06, cần dữ liệu từ Crew), thông báo (W10), thiết bị offline (W09). Với mục cần mobile, chỉ **đọc** dữ liệu trên Web.
4. Tìm lệch giữa Report 3 và hệ thống thật (mục 5 của [01](01-tong-quan-va-vai-tro.md)) và ghi lại; **không tự sửa nghiệp vụ**.
