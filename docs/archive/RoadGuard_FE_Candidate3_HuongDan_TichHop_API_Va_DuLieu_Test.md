# RoadGuardSystem — Hướng dẫn FE Starter Candidate3 từ A đến Z

> **Dành cho:** Thành viên Frontend (FE) mới, chưa quen RoadGuardSystem hoặc chưa từng tự khởi động Backend bằng Docker.  
> **Mục tiêu:** Từ một file ZIP, có môi trường Backend riêng, tìm được **tài khoản + dữ liệu test**, thử API thành công, bắt đầu làm giao diện và báo lỗi đúng cách.  
> **Phiên bản:** Candidate3 — `FE_INTEGRATION_PREVIEW`, được phê duyệt **FE Starter Handoff** (review `PASS_BOUNDED`).  
> **Không phải:** Chứng nhận hoàn chỉnh toàn bộ 260 API, nghiệm thu FE thật hoặc phê duyệt production.

---

## 0. Đọc nhanh trước khi bắt đầu

### Bạn nhận được gì?

File được FE nhận từ nhóm Backend:

`RoadGuard-FE-Starter-Candidate3.zip`

**SHA-256 của ZIP FE Starter:**

```text
1692c9c5d8c908552698ef8197ff2d5909c05eb13519e942f636c1424eef17f6
```

Bên trong ZIP này lại có file **Backend ZIP**:

`RoadGuardBackend-FE-Preview-Candidate3.zip`

**SHA-256 của Backend ZIP:**

```text
e569bcfc77cc4066630b4a0b85d52164f7b04ccd81be33c530f6b5c53ea2e865
```

**Hai file ZIP có nhiệm vụ khác nhau:**

- **Starter ZIP (vỏ ngoài):** bộ bàn giao cho FE, gồm hướng dẫn, OpenAPI, Postman, catalog, trạng thái kiểm thử, evidence đã loại bỏ dữ liệu nhạy cảm và Backend ZIP.
- **Backend ZIP (bên trong):** mã nguồn/cấu hình/dịch vụ chạy Backend độc lập bằng Docker Compose. **Không** giải nén đè lên Backend hoặc DB của thành viên khác.

### Checklist 10 việc (làm đúng thứ tự)

- [ ] 1. Kiểm tra SHA-256 của Starter ZIP.
- [ ] 2. Giải nén Starter ZIP, mở `README.md` ở thư mục gốc.
- [ ] 3. Giải nén Backend ZIP sang **thư mục mới**.
- [ ] 4. Mở Docker Desktop ở chế độ **Linux containers**.
- [ ] 5. Chạy `docker compose ... up -d --build` bằng **project name riêng**.
- [ ] 6. Xác nhận `/ready` là `200` và `scenarios` **exit 0**.
- [ ] 7. Lấy **demo accounts** và **scenario journal** trong Docker (không đăng lên chat/Git).
- [ ] 8. Import Postman, thử login → `/me` → `/projects`.
- [ ] 9. Gắn API vào FE bằng `openapi.json` và các tài liệu luồng nghiệp vụ.
- [ ] 10. Kiểm thử theo role/trạng thái và gửi issue có thể tái hiện.

---

## 1. File nào nằm ở đâu, dùng để làm gì?

Sau khi giải nén Starter ZIP, cấu trúc chính sẽ gần như sau:

```text
RoadGuard-FE-Starter-Candidate3/
├── README.md                                  ← ĐỌC ĐẦU TIÊN
├── SHA256SUMS.json                            ← Checksum 75 file còn lại
├── VERIFICATION-STATUS.json                   ← PASS / OPEN / PENDING của gói
├── RoadGuardBackend-FE-Preview-Candidate3.zip ← Backend để chạy Docker
├── docs/
│   ├── README-FOR-FE.md                       ← Mục lục tài liệu tích hợp FE
│   ├── README-FE-START-HERE.md                ← Hướng dẫn tổng quan trước đây
│   ├── FE-STARTER-CANDIDATE3-STATUS.md        ← Kết quả mới và các giới hạn Candidate3
│   ├── FE-INTEGRATION-QUICKSTART.md           ← Hướng dẫn môi trường chi tiết
│   ├── FE-AUTH-AND-CLIENT-GUIDE.md            ← Android Bearer / Web cookie / CSRF
│   ├── FE-HTTPS-LOCAL.md                      ← Cài chứng chỉ HTTPS cho máy phát triển
│   ├── FE-BUSINESS-FLOW-GUIDE.md              ← Luồng nghiệp vụ và API liên quan
│   ├── FE-W01-W10-RECIPES.md                  ← Các bước cụ thể cho workflow W01–W10
│   ├── FE-API-FUNCTIONAL-GUIDE.md            ← Chức năng của từng API
│   ├── FE-API-CATALOG.json                    ← Danh mục 260 endpoint
│   ├── FE-API-COOKBOOK.md                     ← Ví dụ và tình huống sử dụng API
│   ├── FE-API-TEST-GUIDE.md                   ← Cách test quyền, lỗi, version, retry
│   ├── FE-API.postman_collection.json         ← Collection Postman
│   ├── openapi.json                           ← Contract request/response cho codegen
│   ├── FE-ISSUE-REPORT-TEMPLATE.md            ← Mẫu báo lỗi Backend
│   └── examples/roadguard-web-client.mjs      ← Ví dụ client cho web
└── evidence/
    ├── C1-newman-sanitized.json               ← Tóm tắt Postman trên Candidate3
    ├── optional-object-checks-sanitized.json  ← API-019 / API-225
    ├── starter-smoke-sanitized.json           ← Auth / privacy / CSRF / readiness
    ├── Case-lifecycle-sanitized.json          ← Case Bearer / Web
    ├── RAW-EVIDENCE-INDEX.json                ← Chỉ mục nguồn bằng chứng gốc
    └── LINK-CHECK.json                        ← Kiểm tra liên kết tài liệu
```

| Bạn cần làm gì? | Mở file nào trước? | Lưu ý |
|---|---|---|
| Khởi động Backend | `README.md` → `docs/FE-INTEGRATION-QUICKSTART.md` | Dùng lệnh của **Candidate3** trong README ngoài; đoạn Candidate1/Task32 trong tài liệu cũ chỉ mang tính lịch sử. |
| Tìm API cho một nút/chức năng | `docs/FE-BUSINESS-FLOW-GUIDE.md` → `docs/FE-API-FUNCTIONAL-GUIDE.md` | FE tự quyết định bố cục màn hình; không suy diễn tên màn hình thành yêu cầu Backend. |
| Xem endpoint / payload / response | `docs/openapi.json` → `docs/FE-API-COOKBOOK.md` | OpenAPI xác định schema; cookbook chỉ là hướng dẫn. |
| Gọi API thử | `docs/FE-API.postman_collection.json` | C1 full collection đòi hỏi **dữ liệu đầu vào hợp lệ** chưa seed sẵn. |
| Làm Web login/session | `docs/FE-AUTH-AND-CLIENT-GUIDE.md` và `docs/FE-HTTPS-LOCAL.md` | Web cookie + CSRF, không lấy luồng Bearer của Android gắn nguyên sang Web. |
| Tích hợp Android/native | `docs/FE-AUTH-AND-CLIENT-GUIDE.md` | Bearer; điện thoại không gọi `localhost` trên laptop. |
| Test W01–W10 | `docs/FE-W01-W10-RECIPES.md` | Kiểm tra đủ vai trò, trạng thái và dữ liệu phụ thuộc trước bước tiếp theo. |
| Không biết chức năng có an toàn để tích hợp? | `docs/FE-STARTER-CANDIDATE3-STATUS.md` và `VERIFICATION-STATUS.json` | “Có tài liệu” **không** có nghĩa “đã test runtime”. |
| Backend trả lỗi | `docs/FE-API-TEST-GUIDE.md` → `docs/FE-ISSUE-REPORT-TEMPLATE.md` | Giữ HTTP status, problem code và correlation ID; xóa secret. |

> **Ưu tiên khi hai tài liệu mâu thuẫn:** `README.md` và `docs/FE-STARTER-CANDIDATE3-STATUS.md` của **Starter ZIP bên ngoài** là hướng dẫn Candidate3 hiện hành. Nội dung cũ trong Backend ZIP có thể mô tả Candidate1/Candidate2; không dùng kết quả cũ để công bố Candidate3 đã PASS.

---

## 2. Cài công cụ trên máy FE

Cần có:

1. **Docker Desktop** chạy được Linux containers (Windows). Docker Engine phải phản hồi `docker info`.
2. **PowerShell** hoặc terminal tương đương.
3. **Postman** để khám phá/test API. Nếu dùng CLI collection: Newman (tùy chọn).
4. Editor như VS Code và môi trường chạy dự án FE của nhóm (Node/npm nếu FE dùng React/Vue/Next; không cần Node để chỉ khởi động Backend).
5. Kết nối Internet cho **lần build Docker đầu tiên**.

Kiểm tra ở PowerShell:

```powershell
docker --version
docker compose version
docker info
```

Nếu `docker info` lỗi HTTP 500/timeout, **dừng tại đây** và xử lý Docker Desktop; không xóa volume/DB, không `prune` hoặc factory reset bừa bãi.

---

## 3. Nhận và xác minh ZIP trước khi giải nén

### Bước 3.1 — Kiểm tra file vỏ ngoài

Trong PowerShell, thay đường dẫn dưới đây bằng nơi bạn lưu file đã nhận:

```powershell
Get-FileHash -Algorithm SHA256 "C:\FE\RoadGuard-FE-Starter-Candidate3.zip"
```

Giá trị cần khớp **chính xác**:

```text
1692c9c5d8c908552698ef8197ff2d5909c05eb13519e942f636c1424eef17f6
```

Nếu sai: không chạy file, yêu cầu gửi lại từ người bàn giao.

### Bước 3.2 — Giải nén Starter ZIP

Ví dụ giải nén vào `C:\FE\RoadGuardCandidate3`:

```powershell
Expand-Archive "C:\FE\RoadGuard-FE-Starter-Candidate3.zip" `
  -DestinationPath "C:\FE\RoadGuardCandidate3" -Force
```

Lúc này bạn sẽ thấy thư mục `RoadGuard-FE-Starter-Candidate3` bên trong; mở **`README.md` tại chính thư mục đó**.

### Bước 3.3 — Kiểm tra Backend ZIP

```powershell
Get-FileHash -Algorithm SHA256 `
 "C:\FE\RoadGuardCandidate3\RoadGuard-FE-Starter-Candidate3\RoadGuardBackend-FE-Preview-Candidate3.zip"
```

SHA-256 đúng phải là:

```text
e569bcfc77cc4066630b4a0b85d52164f7b04ccd81be33c530f6b5c53ea2e865
```

`SHA256SUMS.json` trong Starter ZIP liệt kê đường dẫn tương đối, số byte và checksum từng file. Nếu cần kiểm tra toàn bộ, dùng PowerShell (chạy tại thư mục `RoadGuard-FE-Starter-Candidate3`):

```powershell
$manifest = Get-Content .\SHA256SUMS.json -Raw | ConvertFrom-Json
$failed = @()
foreach ($item in $manifest) {
    $path = Join-Path (Get-Location) $item.path
    if (-not (Test-Path -LiteralPath $path)) { $failed += $item.path; continue }
    $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($hash -ne $item.sha256 -or (Get-Item $path).Length -ne $item.bytes) {
        $failed += $item.path
    }
}
if ($failed.Count -eq 0) { 'PASS: 75/75 file checksums' }
else { "FAIL: $($failed -join ', ')" }
```

Không chỉnh sửa nội dung gốc trong ZIP; các thay đổi FE nằm ở project FE của bạn.

---

## 4. Tạo Backend riêng bằng Docker

### Bước 4.1 — Giải nén Backend ZIP

Giải nén `RoadGuardBackend-FE-Preview-Candidate3.zip` vào **một thư mục mới** (ví dụ `C:\FE\BackendRuntime`):

```powershell
Expand-Archive `
 "C:\FE\RoadGuardCandidate3\RoadGuard-FE-Starter-Candidate3\RoadGuardBackend-FE-Preview-Candidate3.zip" `
 -DestinationPath "C:\FE\BackendRuntime"
```

Cấu trúc mong đợi:

```text
C:\FE\BackendRuntime\
└── RoadGuardBackend\
    └── deploy\
        └── fe-handoff\
            ├── compose.yaml
            ├── compose.https.yaml
            └── ...
```

### Bước 4.2 — Chọn tên Docker project không trùng

Dùng `roadguard-fe-starter01` nếu chưa có người khác/đợt khác dùng trên cùng Docker host. Nếu nhiều môi trường cùng máy, dùng tên khác như `roadguard-fe-starter-vu` và **đổi tên này thống nhất trong mọi lệnh**.

### Bước 4.3 — Chọn cổng (chỉ cần khi cổng mặc định đã bị chiếm)

Mặc định:

| Service | Cổng host | URL dùng trên máy FE |
|---|---:|---|
| Backend API HTTP | 18081 | `http://localhost:18081` |
| Backend API HTTPS | 18443 | `https://localhost:18443` |
| Mailpit (hộp thư demo) | 18026 | `http://localhost:18026` |
| Object endpoint (MinIO) | 19001 | `http://localhost:19001` |

Nếu bị trùng cổng, **trước lần khởi động đầu tiên** đặt biến môi trường trong chính PowerShell đang chạy Compose:

```powershell
$env:RG_FE_API_PORT="28081"
$env:RG_FE_HTTPS_PORT="28443"
$env:RG_FE_MAIL_PORT="28026"
$env:RG_FE_OBJECT_PORT="29001"
```

Sau khi đổi, dùng URL theo cổng mới. Không tự ý thay cổng object của môi trường **đã được khởi tạo**.

### Bước 4.4 — Chạy Docker Compose

```powershell
cd "C:\FE\BackendRuntime\RoadGuardBackend\deploy\fe-handoff"

docker compose -p roadguard-fe-starter01 `
 -f compose.yaml -f compose.https.yaml up -d --build
```

Docker sẽ build/start API, SQL, MinIO, Mailpit và dịch vụ seed scenarios.

**Không kết luận xong chỉ vì `up -d` trả exit 0.** Kiểm tra riêng:

```powershell
docker compose -p roadguard-fe-starter01 `
 -f compose.yaml -f compose.https.yaml ps -a

docker compose -p roadguard-fe-starter01 `
 -f compose.yaml -f compose.https.yaml logs --tail 50 scenarios
```

Điều kiện hoàn tất:

- API và dependencies chạy khỏe (`healthy`, theo Compose).
- `scenarios` là one-shot setup và **phải kết thúc exit 0**.
- `http://localhost:18081/ready` trả HTTP **200**. `/health` chỉ thể hiện process còn sống; không thay thế `/ready`.

Thử bằng PowerShell:

```powershell
(Invoke-WebRequest -UseBasicParsing http://localhost:18081/ready).StatusCode
```

Mong đợi: `200`.

### Bước 4.5 — HTTPS trên FE Web

Đọc **`docs/FE-HTTPS-LOCAL.md`** trước khi dùng Web cookie/CSRF. Cần **tin cậy chứng chỉ công khai của đúng môi trường đang chạy**; không tắt TLS/certificate validation trong code FE. Không sao chép private key. Nếu ứng dụng chạy trên điện thoại/thành viên khác, `localhost` của họ **không trỏ đến laptop chạy Backend**: cần địa chỉ LAN và HTTPS/certificate trust phù hợp theo tài liệu.

---

## 5. LẤY DỮ LIỆU TEST Ở ĐÂU? — Quan trọng nhất

Candidate3 có dữ liệu demo **được tạo khi container `scenarios` chạy thành công**. Dữ liệu test không lấy bằng cách copy `appsettings.json`, không hardcode random ID và không lấy từ SQL sản xuất.

### Nguồn 1 — Tài khoản demo, role và mật khẩu

Đọc file sinh trong container API, bằng lệnh tại thư mục `RoadGuardBackend/deploy/fe-handoff`:

```powershell
docker compose -p roadguard-fe-starter01 `
 -f compose.yaml -f compose.https.yaml `
 exec -T api cat /handoff/demo-accounts.json
```

**Dùng thế nào:**

1. Xem danh sách tài khoản/role thật trong JSON được in ra.
2. Chọn đúng user cho tình huống cần test, ví dụ `Supervisor`, PM dự án A, PM dự án B, `Reporter` nếu có trong danh sách.
3. Điền email/mật khẩu **trong môi trường Postman cá nhân**, không copy vào Git/chat/screenshot.
4. Đăng nhập riêng cho từng role khi kiểm tra 401/403 hoặc cross-project.

> **Cực kỳ quan trọng:** Tài khoản, mật khẩu và token được **tạo riêng mỗi môi trường FE**. Không lấy giá trị từ máy Backend/Codex cũ và không đưa tài khoản demo lên repository.

### Nguồn 2 — Dữ liệu nghiệp vụ được seed và ID thật

Đọc `scenarios.json` trong named progress volume, thông qua container scenarios **cùng project name và cùng hai file Compose**:

```powershell
docker compose -p roadguard-fe-starter01 `
 -f compose.yaml -f compose.https.yaml `
 run --rm --no-deps --entrypoint cat scenarios /progress/scenarios.json
```

**Cách sử dụng:**

1. Tìm phần chứa ID của project, road, geometry, incident/report, file evidence và export job, theo các trường thực tế trong file.
2. Copy đúng UUID cho request Postman/FE mà bạn định gọi.
3. Mở API detail/list tương ứng để xác minh resource còn tồn tại và user có quyền.
4. Không sửa `scenarios.json` để giả lập trạng thái hay bỏ qua setup. File này là nhật ký, **không phải API tạo dữ liệu**.

Dữ liệu mà Candidate3 scenario đã được ghi nhận có tạo gồm: **road/project A-B, dữ liệu road/geometry demo, một file ảnh riêng đã xác minh trong MinIO, reporter incident và PDF export jobs A/B**. Tên key/ID cụ thể phải xem **journal vừa tạo trên máy bạn**; không coi ID trong báo cáo cũ là cố định cho mọi máy.

### Nguồn 3 — Lấy ID qua API (khuyên dùng khi code FE)

Sau khi đăng nhập bằng tài khoản phù hợp:

- `GET /api/v1/me`: xác nhận danh tính/role hiện tại.
- `GET /api/v1/projects`: lấy **project IDs mà chính user có quyền xem**.
- `GET /api/v1/profile`: profile (DTO có thể khác `/me`).
- Những GET list/detail của Defects/Reports/Case/Survey/...: chọn dự án thực tế từ `/projects`, rồi tìm đường dẫn chính xác trong **OpenAPI/catalog** trước khi gọi.

**Nguyên tắc:** FE dùng list → chọn item → lấy `id`/`version`/`etag` → mới gọi detail/command. Không hardcode ID từ tài liệu hoặc từ environment của một người khác.

### Nguồn 4 — Email/OTP/thông báo test

Mở Mailpit của **môi trường bạn** tại:

`http://localhost:18026`

Nếu một luồng auth/password/email/OTP có gửi thư trong môi trường demo, tìm thư của tài khoản demo tương ứng trong Mailpit. Đây là hộp thư test, **không phải Gmail hay email thật**. Đừng công khai OTP/link reset/mật khẩu; chỉ xem và sử dụng trong môi trường riêng.

### Nguồn 5 — File riêng trong MinIO (không lấy trực tiếp để bypass auth)

Scenario có thể đã seed **verified private PNG**. Để test file:

1. Tìm `fileId` và owner/resource liên quan từ `scenarios.json` hoặc response Backend.
2. Dùng **API file/evidence có quyền** theo catalog/guide để lấy metadata hoặc content.
3. Test với chủ sở hữu hợp lệ và user không có quyền.
4. **Không dùng MinIO object key hoặc direct URL như một cách vượt qua Backend auth.**

### Bảng dữ liệu test theo chức năng

| Chức năng FE đang làm | Dùng account nào? | ID / fixture lấy ở đâu? | Cần chuẩn bị thêm gì? |
|---|---|---|---|
| Login Android/Bearer | Demo account phù hợp | `demo-accounts.json` | Token lấy từ **response login**. |
| Login Web/CSRF | Demo account phù hợp | `demo-accounts.json` | Bootstrap CSRF/cookie theo auth guide; dùng HTTPS. |
| Dashboard/danh sách dự án | User có quyền dự án | `GET /api/v1/projects` | Không dùng ID dự án người khác. |
| Chi tiết đường/geometry/segment | PM/Supervisor tùy policy | Project ID từ `/projects`, road/route/segment IDs từ `scenarios.json` và API list | Đảm bảo phiên bản/road thuộc cùng project. |
| Reporter incident / report | Reporter hoặc role đọc phù hợp | Reporter incident từ `scenarios.json`, kiểm tra qua report/incident API | Tình trạng report thực tế quyết định thao tác tiếp theo. |
| File private / ảnh | Chủ sở hữu hoặc role được phép | Verified `fileId` từ journal/API | Test cả file còn verified và denied của user khác. |
| PDF export | Role có quyền export | `export jobId` từ journal/API | Poll trạng thái job; chỉ tải khi hoàn tất. |
| Case (`API-019`) | Vai trò có quyền Case | Case ID từ API list hoặc từ một flow hợp lệ | `conclusion` **có thể bị bỏ khỏi JSON** khi chưa conclude. |
| Survey work package (`API-225`) | Role/task assignment hợp lệ | Survey task ID từ API/journal hoặc qua flow tạo giao việc | `accessPoint` **có thể vắng mặt** nếu chưa khai báo. |
| API-238 user lookup | **Supervisor được phép** | User ID từ nguồn danh tính hợp lệ, role scope | Response chỉ có `id`, `displayName`, `role`, `version`, không có contact. |
| C1 publication | PM đúng dự án | Tạo resource đủ điều kiện theo W04, **không seed sẵn publication positive** | Cần verified defect + concluded/confirmed Case + verified linked evidence. |
| FIELD / Repair / Processing / Notifications | Actor/role theo flow | Từ các thao tác trước đó hoặc source journal nếu có | Không giả định có task/job/assignment hợp lệ mặc định; theo đúng W01–W10 recipes. |

> Nếu API trả `404` với ID vừa copy, kiểm tra **đúng môi trường**, đúng user/project/role và trạng thái item. Một số API có thể ẩn resource bằng 404 khi user không có quyền; không kết luận item không tồn tại nếu chưa xác minh authority.

---

## 6. Test API đầu tiên trong 10–15 thao tác

### Bước 6.1 — Import Postman collection

Trong Postman → **Import** → chọn:

`docs/FE-API.postman_collection.json`

Trong Postman cá nhân, tạo environment cho Candidate3 với tối thiểu:

| Biến | Lấy ở đâu? | Ví dụ giá trị |
|---|---|---|
| `baseUrl` | Cổng HTTP/HTTPS môi trường đang chạy | `http://localhost:18081` để test Bearer CLI; Web dùng HTTPS đúng chứng chỉ. |
| `demoEmail` | `/handoff/demo-accounts.json` | Giá trị **riêng tư**, không commit. |
| `demoPassword` | `/handoff/demo-accounts.json` | Giá trị **riêng tư**, không commit. |
| `projectId` | `GET /api/v1/projects` (ưu tiên) hoặc scenario journal | UUID project người dùng có quyền. |
| `defectId` | Defect hợp lệ cho C1 | **Không có sẵn chỉ nhờ seed**; cần flow W04. |

Collection C1 đã được Backend test, nhưng chạy **toàn bộ** trước khi có `defectId` đủ điều kiện có thể thất bại đúng logic (404/409...). Vì vậy:

### Bước 6.2 — Thử readiness

Mở browser/Postman:

```text
GET http://localhost:18081/ready
```

Mong đợi `200`.

### Bước 6.3 — Login Android/Bearer

Trong collection tìm request **Android login** (`POST /api/v1/auth/android/login`). Đặt email/password từ `demo-accounts.json` và **chạy request login riêng**.

> Payload chính xác (`email`, `password`, cấu trúc JSON, error response) lấy trong `docs/openapi.json`/request đã có trong Postman. Không tự đoán DTO nếu Postman và OpenAPI đang chỉ ra khác nhau.

Response thành công có `accessToken`; collection có thể tự capture biến token. Kiểm tra biến có giá trị **trong môi trường cá nhân**, không copy token ra chat.

### Bước 6.4 — Gọi `GET /api/v1/me`

```text
GET {{baseUrl}}/api/v1/me
Authorization: Bearer {{accessToken}}
```

Mong đợi `200`, có danh tính của user hiện tại.

### Bước 6.5 — Gọi danh sách dự án

```text
GET {{baseUrl}}/api/v1/projects
Authorization: Bearer {{accessToken}}
```

Mong đợi trả danh sách dự án user có quyền. Dùng ID trả về để set `projectId`. Không nhất thiết user nào cũng thấy cùng số dự án.

### Bước 6.6 — Gọi API đầu tiên có path parameter

Từ catalog, chọn một GET detail/list có `projectId` thuộc project vừa tìm; điền đúng path variables và Bearer. Đối chiếu status, content type, schema và quyền. Khi đã gọi thành công API này, FE có thể chuyển sang code UI cho màn hình tương ứng.

### Bước 6.7 — Web login riêng (không copy Bearer sang Web)

Với ứng dụng web:

1. Thiết lập HTTPS/tin cậy certificate theo `docs/FE-HTTPS-LOCAL.md`.
2. Bắt đầu luồng Web CSRF theo `docs/FE-AUTH-AND-CLIENT-GUIDE.md` (`GET /api/v1/auth/web/csrf`).
3. Gửi `POST /api/v1/auth/web/login` với cookie/session và `X-CSRF-TOKEN` đúng phiên.
4. Kiểm tra `GET /api/v1/auth/web/session` thành công.
5. Request Web cần `credentials: 'include'` và CORS origin được backend cho phép.
6. Logout phải gửi CSRF hợp lệ; sau logout session phải mất hiệu lực.

Đừng coi một request Bearer `200` là đã xác minh Web cookies/CSRF hoạt động.

---

## 7. GẮN API VÀO CODE FE NHANH NHẤT

### Nguyên tắc thiết kế

1. Tạo **một `apiClient` dùng chung** thay vì `fetch` rải rác từng component.
2. Sinh TypeScript types/client từ `docs/openapi.json` bằng tool phù hợp với stack FE (hoặc định nghĩa DTO theo đúng schema nếu chưa dùng codegen).
3. Tách phần **authentication** khỏi phần **business API**.
4. Tất cả danh sách/chi tiết lấy bằng server state; mutation phải refresh/reconcile dữ liệu mới.
5. Mọi nút action có `Idempotency-Key`, `If-Match`, `ETag` hoặc CSRF theo **OpenAPI và operation guide**, không tự suy đoán giá trị.
6. FE không tự tạo `ProjectId`, `CaseId`, `ReportId` bằng UUID mới để gọi GET; lấy từ API hoặc flow đã tạo resource.

### Thư mục FE gợi ý (React/Vite hoặc stack TypeScript tương tự)

```text
src/
├── api/
│   ├── client.ts             ← HTTP wrapper, parse lỗi
│   ├── auth.ts               ← Login/session/CSRF/token
│   ├── projects.ts           ← GET list/detail projects
│   ├── cases.ts              ← GET Case và các command
│   ├── reports.ts            ← Reporter reports/evidence
│   └── generated/            ← Types / client sinh từ OpenAPI (nếu có)
├── features/
│   ├── auth/
│   ├── projects/
│   ├── cases/
│   └── ...
└── pages/                   ← FE tự thiết kế màn hình
```

### Mẫu API client TypeScript tối thiểu (dùng cho dự án mới)

Ví dụ dưới đây cho thấy cách gửi request và nhận lỗi; **không tự thay thế** contract trong OpenAPI:

```typescript
// src/api/client.ts
export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  bearerToken?: string;        // Android / non-cookie client ONLY
  csrfToken?: string;          // Web mutation khi contract yêu cầu
  ifMatch?: string;            // Giữ nguyên ETag/row version đúng wire
  idempotencyKey?: string;     // UUID riêng cho một intent, giữ nguyên khi replay
  signal?: AbortSignal;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public details: unknown,
  ) {
    super(`API request failed (${status})`);
  }
}

const API_BASE = 'http://localhost:18081'; // Dev Bearer only; Web dùng HTTPS

export async function apiRequest<T>(
  path: string,
  opt: RequestOptions = {},
): Promise<{ data: T | null; etag: string | null }> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opt.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opt.bearerToken) headers['Authorization'] = `Bearer ${opt.bearerToken}`;
  if (opt.csrfToken) headers['X-CSRF-TOKEN'] = opt.csrfToken;
  if (opt.ifMatch) headers['If-Match'] = opt.ifMatch;
  if (opt.idempotencyKey) headers['Idempotency-Key'] = opt.idempotencyKey;

  const res = await fetch(new URL(path, API_BASE), {
    method: opt.method ?? 'GET',
    headers,
    credentials: 'include', // Chỉ có tác dụng cho web cookie đúng origin/CORS
    body: opt.body === undefined ? undefined : JSON.stringify(opt.body),
    signal: opt.signal,
  });
  const raw = await res.text();
  let parsed: unknown = null;
  if (raw) {
    try { parsed = JSON.parse(raw); } catch { parsed = raw; }
  }
  if (!res.ok) throw new ApiError(res.status, parsed);
  return { data: parsed as T | null, etag: res.headers.get('ETag') };
}
```

**Lưu ý khi copy mẫu:**

- Khi làm **Web**, thay `API_BASE` bằng URL HTTPS từ cấu hình môi trường công khai của dự án (không hardcode production hoặc chứa secret); không tự tắt kiểm tra TLS. Web dùng cookie + CSRF, không lưu JWT vào `localStorage`.
- Khi làm **Android/native**, dùng Bearer theo auth guide và secure storage phù hợp; `localhost` trong emulator/điện thoại khác với localhost của laptop.
- `credentials: 'include'` không tự cấp quyền CORS; Backend cần cho phép origin thực tế của FE theo policy.
- API tải file/binary cần client khác để xử lý `Blob`/stream và media type thực tế, không ép response thành JSON.
- Khi `412`/`409`, fetch lại trạng thái/ETag, cho người dùng quyết định xử lý; **không tự động đổi key/version rồi replay lệnh ghi**.

### Ví dụ màn hình danh sách projects

```typescript
// src/api/projects.ts
import { apiRequest } from './client';

export async function loadProjects(bearerToken: string) {
  return apiRequest<unknown>('/api/v1/projects', { bearerToken });
}
```

Sau bước đầu chạy thành công, thay `unknown` bằng kiểu sinh từ schema response của `GET /api/v1/projects`. Đừng tự phát minh fields của response.

### Xử lý object optional đúng Candidate3

```typescript
// API-019: conclusion có thể không xuất hiện trong response
const conclusion = caseDetail?.conclusion;
if (conclusion !== undefined && conclusion !== null) {
  // Hiển thị kết luận nếu có
}

// API-225: accessPoint có thể không xuất hiện
const accessPoint = surveyWorkPackage?.accessPoint;
if (accessPoint !== undefined && accessPoint !== null) {
  // Hiển thị vị trí nếu được khai báo
}
```

**Không yêu cầu Backend trả `"conclusion": null`/`"accessPoint": null`**: điều đó đi ngược quyết định tương thích đã duyệt.

---

## 8. Thứ tự triển khai tính năng để FE ra giao diện nhanh

### Giai đoạn A — Nền tảng (ưu tiên đầu tiên)

1. Môi trường `.env` riêng FE chỉ chứa **public base URL**, không chứa mật khẩu/JWT.
2. Login/logout/session, role và quyền.
3. HTTP client, error handling, loading/empty state.
4. Trang dashboard đơn giản: tên user, danh sách projects từ API thật.
5. Chọn project và lưu `projectId` từ API, không hardcode.

### Giai đoạn B — Luồng đọc dữ liệu

1. Đọc `FE-BUSINESS-FLOW-GUIDE.md`, chọn 1 workflow có dữ liệu seed sẵn.
2. Làm list → detail cho một resource cụ thể (roads/reports/cases tùy vai trò).
3. Hiển thị đầy đủ loading, 401, 403, 404, empty state.
4. Test với PM-A và PM-B để không lộ dữ liệu chéo dự án.

### Giai đoạn C — Luồng ghi dữ liệu

1. Đọc **method/path/schema/headers** trong OpenAPI.
2. Đảm bảo prerequisite state và role trước khi bấm nút.
3. Với command cần idempotency, sinh key cho **một intent**; giữ key khi retry cùng intent.
4. Với operation cần version, lấy ETag/rowversion từ response gần nhất và gửi `If-Match` đúng định dạng.
5. Sau `200`/`201`/`202`, đọc resource lại hoặc poll trạng thái thật; `202` thường chỉ là accepted/queued.
6. Không coi việc nhận inbox/job là business final state nếu tài liệu nói còn worker/review tiếp theo.

### Giai đoạn D — File, Web security, advanced workflows

1. File upload/download chỉ qua Backend APIs phù hợp quyền; kiểm tra verified status.
2. Web cookie/CSRF/CORS/HTTPS trên trình duyệt thật.
3. Workflow W01–W10 theo thứ tự trong recipes, không gộp các trạng thái nghiệp vụ khác nhau.
4. API-030 liên quan video media type **chưa verified**, không phụ thuộc vào giả định nó luôn khớp OpenAPI.

---

## 9. Kiểm thử C1 publication đúng cách

Collection Candidate3 đã chạy thành công với **7 items / 8 requests / 18 assertions**, nhưng một môi trường FE mới **không tự nhiên có resource đủ điều kiện để publish**.

Để chạy C1 positive:

1. Đăng nhập PM **đúng project**.
2. Theo `docs/FE-W01-W10-RECIPES.md` (đặc biệt W04) để tạo hoặc tìm **Defect thật** thuộc nhóm được phép, có verification/evidence hợp lệ.
3. Case liên quan phải đã đạt trạng thái **CONCLUDED/CONFIRMED** và chứa Defect hợp lệ.
4. Evidence phải verified, linked đúng nguồn và thỏa policy.
5. Dùng đúng `projectId`, `defectId`, role và idempotency key.
6. Chạy sequence **publish (201) → anonymous public read (200) → withdraw (200) → anonymous read sau withdraw (404)**.
7. Public DTO chỉ chứa bốn trường `publicId`, `damageCategory`, `publicStatus`, `publishedAt`; không được lộ dữ liệu riêng.

**Không được:** chèn SQL giả để “đủ điều kiện”, sửa scenario journal, dùng lại một publication đã withdrawn làm positive fixture, hoặc đổi Idempotency-Key khi retry cùng command.

Nếu chưa có graph W04 hợp lệ, **đánh dấu C1 `PENDING_FIXTURE`** cho môi trường mới và tiếp tục tích hợp các API đọc/auth đã được kiểm chứng. Điều này không phủ nhận raw C1 PASS trên Candidate3 do Backend đã thực hiện.

---

## 10. Đọc tài liệu W01–W10 để map sang màn hình FE

FE làm theo **business flow → danh sách API → DTO → điều kiện → UI**, không làm ngược bằng cách đoán API từ tên màn hình.

Với **mỗi workflow Wxx**:

1. Mở `docs/FE-BUSINESS-FLOW-GUIDE.md`, tìm Wxx.
2. Mở `docs/FE-W01-W10-RECIPES.md` để xem trình tự nghiệp vụ, role, trạng thái và prerequisites.
3. Ghi ra bảng FE riêng: `business step | role | method/path | request/response | precondition | error | UI state`.
4. Tra `docs/FE-API-FUNCTIONAL-GUIDE.md` theo `operationId`.
5. Đối chiếu `docs/openapi.json` và `docs/FE-API-COOKBOOK.md`.
6. Tìm data trong `scenarios.json`/GET list; nếu thiếu, đi theo **luồng tạo resource hợp lệ** thay vì sửa DB.
7. Triển khai API client → screen/UI → integration smoke → issue nếu lỗi.

Ví dụ bảng FE tự lập:

| Business step | Role | API | Dữ liệu đầu vào | Hiển thị | Trường hợp lỗi |
|---|---|---|---|---|---|
| Chọn project | PM | `GET /api/v1/projects` | Token/session | Danh sách project được phép | 401/empty |
| Xem Case | Actor có quyền | API-019 (path thật trong OpenAPI) | Case ID lấy từ list, project đúng | Case + conclusion nếu có | 403/404 |
| Xem work package | Actor được assign | API-225 (path thật trong OpenAPI) | Task ID hợp lệ | Task + accessPoint nếu có | 403/404 |
| Xuất bản C1 | PM hợp lệ | Operation trong W04/Postman | Defect/Case/evidence đủ điều kiện | Public status | 409/403/404 theo contract |

**Đừng tự gán màn hình/route UI bắt buộc nếu Owner chưa duyệt.** Đây là giao diện do FE thiết kế.

---

## 11. Lỗi hay gặp và cách xử lý

| Triệu chứng | Nguyên nhân thường gặp | Làm ngay |
|---|---|---|
| `docker info` 500/timeout | Docker Engine lỗi | Khắc phục Docker Desktop/WSL **không phá dữ liệu**, thử lại `docker info`; chưa cần sửa Backend. |
| `up -d` thành công nhưng API chưa có data | `scenarios` chưa exit 0 | Kiểm tra `docker compose ... ps -a`, `logs scenarios`; chờ setup thực sự xong. |
| `/health` 200, `/ready` 503 | Dependency SQL/MinIO/Mail chưa sẵn sàng | Xem `docker compose ... ps -a`, dependency logs; `/ready` mới là gate. |
| Login 401 | Sai demo credential/môi trường | Lấy lại tài khoản từ container **cùng Compose project**, không mượn token cũ. |
| GET 403/404 | Sai role/project/owner hoặc resource không có | Chọn project từ `/projects`, kiểm tra quyền, resource ID và prerequisite. |
| Web login/logout 403 | Thiếu cookie/CSRF hoặc origin | Theo auth guide; GET csrf mới và gửi `X-CSRF-TOKEN` đúng phiên. |
| Web CORS bị chặn | Origin FE không nằm trong danh sách cho phép | Dùng origin được tài liệu hỗ trợ; không tự mở `*` + credentials. |
| Web báo lỗi chứng chỉ | Trust HTTPS chưa cấu hình | Làm theo `FE-HTTPS-LOCAL.md`, không disable SSL validation. |
| POST 409 | Conflict nghiệp vụ, trạng thái hoặc idempotency | Đọc ProblemDetails, lấy trạng thái mới, chỉ retry khi contract cho phép. |
| POST 412 | ETag/If-Match stale | GET lại resource/version rồi xử lý intent; không tự thay If-Match để ép ghi. |
| 422/400 | JSON/schema, required fields, validation | Đối chiếu OpenAPI và request thực tế, không đoán payload. |
| Download file không được | Chưa verified, thiếu quyền, job chưa hoàn tất | Kiểm tra status/poll; gọi API download đúng actor. |
| `conclusion`/`accessPoint` thiếu | Đây là optional field được **bỏ khi null** | Hiển thị empty state, không yêu cầu field luôn hiện diện. |
| API-030 video không khớp media type | Known mismatch ngoài phạm vi Candidate3 Starter | Ghi `NOT_VERIFIED`; báo Backend bằng issue riêng, không coi là contract accepted. |
| Copy ID từ máy Backend cũ không dùng được | Hai môi trường có DB/seed riêng | Lấy lại ID từ `scenarios.json` và API list tại môi trường FE hiện tại. |

**Lệnh xem log an toàn**, nhớ giữ đúng project name và Compose files:

```powershell
docker compose -p roadguard-fe-starter01 -f compose.yaml -f compose.https.yaml ps -a

docker compose -p roadguard-fe-starter01 -f compose.yaml -f compose.https.yaml logs --tail 80 api

docker compose -p roadguard-fe-starter01 -f compose.yaml -f compose.https.yaml logs --tail 80 scenarios
```

Không chia sẻ nguyên log nếu có credentials, token, cookie, signed URL, private object keys hoặc thông tin cá nhân; phải lược bỏ trước.

**Không chạy** `docker compose down -v`, `docker volume prune`, `docker system prune`, reset/clean hoặc xóa DB/volume để “fix nhanh” khi chưa hiểu tác động.

---

## 12. Cách FE báo lỗi để Backend sửa nhanh

Dùng `docs/FE-ISSUE-REPORT-TEMPLATE.md`. Mỗi issue có tối thiểu:

```text
[RoadGuard FE → BE]
Candidate: Candidate3
Environment: FE-owned Docker Compose project <tên riêng>
Feature / Workflow: Wxx / tính năng cụ thể
Operation ID: API-xxx (nếu biết)
Method + Path: GET/POST ...
User role: PM-A / Reporter / Supervisor / ... (KHÔNG gửi credentials)
Project scope: project A/B (ID đã ẩn/sanitized khi cần)
Precondition: resource state/version/verified evidence
Steps to reproduce:
  1. ...
  2. ...
Expected: HTTP status + nội dung mong đợi theo OpenAPI/guide
Actual: HTTP status + ProblemDetails/error code/headers phù hợp
Correlation ID: <đã sanitize>
ETag / If-Match / Idempotency-Key: nêu có/không, tránh lộ dữ liệu nhạy cảm
Timestamp + timezone: ...
Effect after retry/read-back: ...
Attached: sanitized screenshot/request/response (không secret)
```

**Không đưa** vào issue: demo password, JWT/refresh token, cookie, OTP, private media/URL, database connection string, MinIO key. Khi lỗi chỉ xảy ra Web nhưng Android Bearer thành công, phải ghi rõ **transport** và header/CSRF thực tế (đã lọc secret).

---

## 13. Ranh giới kiểm chứng Candidate3 và Definition of Done của FE Starter

### BE đã kiểm chứng trong phạm vi Starter

- Candidate3 runtime setup/`/ready`: đã có evidence.
- C1/Newman: **18/18 assertions PASS**, resource graph thật trên Candidate3.
- API-019 / API-225: **10/10 focused HTTP/schema/role checks PASS**.
- Auth/privacy/Web-session/CSRF/cross-project smoke: **28/28 PASS** trên Backend-local HTTP client.
- Case lifecycle Bearer/Web: **2/2 focused test-host tests PASS** (không phải hai container HTTP steps độc lập).
- Evidence validator: **71/71 PASS**; đây là kiểm tra công cụ evidence, **không** phải 71 API.
- Bundle: 75 file checksums, OpenAPI và 260 canonical operations được kiểm tra khớp.

### Chưa được coi là hoàn tất

- **API-030:** video trả `video/mp4` trong khi retained OpenAPI mô tả `application/octet-stream`: **NOT_VERIFIED**.
- **H02–H05** full preview vẫn `OPEN`; không công nhận toàn bộ 174 mandatory API đã nghiệm thu.
- **W01–W10:** có tài liệu và nguồn evidence riêng nhưng **full end-to-end Candidate3 journey acceptance** vẫn chưa hoàn chỉnh.
- **Native Android, trình duyệt FE thật, external AI, production deployment:** chưa được FE/production nghiệm thu.
- **FE acceptance và production release:** vẫn `PENDING`.

### Khi nào FE được nói một chức năng đã tích hợp xong?

Một tính năng trong project FE chỉ nên chuyển `FE_INTEGRATED` khi:

- Có API method/path đúng từ OpenAPI và tài liệu nghiệp vụ.
- Dùng **user/role/project** đúng và lấy resource ID từ môi trường hiện tại.
- FE gọi request thật từ **ứng dụng FE** thành công, không chỉ Postman.
- Response/headers/optional fields/empty/error states được xử lý.
- Những mutation có retry/version/Idempotency được test đúng.
- Các trường hợp access denied/cross-project và persistence phù hợp được kiểm tra.
- FE lưu một bằng chứng ngắn, không secret, và đưa issue nếu còn mismatch.

**FE Starter được duyệt bàn giao ≠ toàn bộ tính năng đã được FE chấp nhận.**

---

## 14. Lộ trình buổi đầu tiên cho thành viên FE mới

| Thời điểm công việc | Việc cần làm | Kết quả nhìn thấy |
|---|---|---|
| Phần A | Nhận ZIP → checksum → giải nén hai cấp | Có thư mục docs và `RoadGuardBackend` riêng. |
| Phần B | Docker Compose → scenarios exit 0 → `/ready` 200 | Backend môi trường FE chạy tốt. |
| Phần C | Đọc `demo-accounts.json` và `scenarios.json` | Có tài khoản test, roles và IDs thật. |
| Phần D | Postman login → `/me` → `/projects` | Nhìn thấy dữ liệu đúng role/project. |
| Phần E | Tạo `apiClient` + `auth` + `projects` ở repo FE | UI hiển thị tên user và danh sách dự án từ Backend. |
| Phần F | Chọn một flow đọc dữ liệu từ W01–W10 | Có list/detail và xử lý 401/403/404. |
| Phần G | Dùng issue template báo các mismatch | BE có thể tái hiện nhanh, FE tiếp tục phần độc lập. |

**Thành công bước đầu** không phải “đã gọi được cả 260 API”, mà là **FE chạy độc lập, lấy đúng dữ liệu demo, login đúng transport, gọi một API có quyền và hiển thị được dữ liệu thật trong giao diện**.

---

## 15. Bảng tra cực nhanh — “Tôi đang cần gì?”

| Câu hỏi | Câu trả lời |
|---|---|
| Tôi lấy tài khoản test ở đâu? | Trong API container: `/handoff/demo-accounts.json`, đọc qua `docker compose ... exec -T api cat ...`. |
| Tôi lấy projectId, reportId, roadId, fileId ở đâu? | Ưu tiên qua API list; dữ liệu seed ban đầu trong `/progress/scenarios.json` (container `scenarios`). |
| Tôi lấy OTP/email reset ở đâu? | Mailpit của môi trường riêng, mặc định `http://localhost:18026`, **chỉ khi flow thực sự gửi mail**. |
| Tôi lấy token ở đâu? | Từ login response của user hiện tại; không hardcode. |
| Tôi xem API nào cần cho màn hình? | `FE-BUSINESS-FLOW-GUIDE.md` → `FE-API-FUNCTIONAL-GUIDE.md` → `openapi.json`. |
| Tôi biết method/body/status nào đúng? | OpenAPI + maintained Postman + API cookbook. |
| Tại sao Postman C1 full collection thất bại dù login chạy? | Chưa có genuine W04 Case/Defect/evidence đủ điều kiện để publish. |
| Tại sao API trả 403 hoặc 404? | Kiểm tra role/project/owner và state của resource thật. |
| Làm sao thử Web auth? | HTTPS + web/csrf → web/login → web/session + cookie/CSRF đúng phiên. |
| `conclusion` hoặc `accessPoint` không có là lỗi? | **Không**, hai field optional được phép bị omit khi null ở Candidate3. |
| Có được làm API-030 video chưa? | Có thể nghiên cứu UI, nhưng **contract media-type chưa VERIFIED**; không tuyên bố hoàn tất. |
| Khi nào dùng gói này lên production? | Chưa được phép: đây chỉ là **FE Integration Preview**. |

---

### Ghi chú về độ tin cậy của hướng dẫn

Tài liệu này được biên soạn từ **Candidate3 Starter bundle đã được kiểm tra ở lần review độc lập trước** cùng nội dung quickstart, OpenAPI/catalog/recipe và bounded runtime evidence có trong gói. Những tên khóa JSON bên trong `demo-accounts.json`/`scenarios.json`, DTO cụ thể và API nghiệp vụ thay đổi theo trạng thái/role phải được đối chiếu **trên môi trường FE hiện tại** và OpenAPI thực tế. Không sao chép giá trị ví dụ thành contract. Đây là hướng dẫn bổ sung, **không chỉnh sửa hoặc thay thế bundle gốc đã ký checksum**.
