# Nghiệm thu theo luồng W01–W10 — FE Web PM/Supervisor ↔ BE RoadGuard (gửi nghiệm thu)

Ngày kiểm: 2026-11-17 · BE: `RoadGuardSystem-develop (1)` (stack `roadguard-dev1`, https://localhost:18443) · FE dev http://localhost:5173 · Phạm vi: web `/pm/*`, `/sup/*`. Bỏ mobile: W03 Reporter và phần thiết bị/đồng bộ của W09.
Luồng theo `docs/contracts/FE-W01-W10-RECIPES.md`. Tài liệu này gom toàn bộ kết quả vào một file.

> **Nguồn chuẩn hiện hành:** `RoadGuardSystem-develop_NewBE` (`roadguard-new`) là bản BE đã hoàn tất nghiệp vụ và được chốt. FE tuân theo controller, service, DTO, OpenAPI và kết quả chạy thật của bản này; không chờ phê duyệt lại nghiệp vụ hay yêu cầu thay BE theo tài liệu cũ. Các mục 1–7 là hồ sơ nghiệm thu lịch sử của `roadguard-dev1`; không dùng chúng làm yêu cầu triển khai. Xem mục 8–11 để phân biệt phần FE đã nối, kiểm thử đã thực hiện và điều kiện sử dụng của Web.

## 1. Cách kiểm (phạm vi kiểm)
| Mã | Cách | Bằng chứng |
|---|---|---|
| A | Duyệt chỉ-đọc 34 route PM (`pm-a`) và Supervisor (`supervisor`): ghi mọi lời gọi `/api/v1` + mã HTTP, lỗi console, thông báo/ô trống trên UI; mở thêm các nút "Xem/Chi tiết/Tab". **Không có lệnh ghi nào được gửi (0/34 route).** | `scratchpad/e2e/audit/{pm-a,sup,deep-pm,deep-sup}.json` |
| B | Gọi thẳng BE bằng phiên cookie của chính tài khoản đó (GET mọi collection theo dự án trong OpenAPI), đếm bản ghi đầy đủ qua phân trang, so với số dòng UI. | `par-pm.json, par-sup.json`, `count.mjs`, `samples.mjs` |
| C | Lệnh ghi (tạo/sửa/duyệt) **không chạy lại lần này**; dùng kết quả các phiên trước: `KIEM-TRA-TAO-TRUNG-DONG.md`, `TEST-DATA-LEDGER.md`, `XEM-VIDEO-NGUON-DA-TRIEN-KHAI.md`. | tài liệu đó |

Nhãn: **BE** = máy chủ không trả / trả sai / không có endpoint cookie; **FE** = BE có dữ liệu nhưng FE đọc sai, bỏ sót hoặc không báo lỗi; **Theo thiết kế** = đúng hợp đồng.

## 2. Bảng tổng hợp và nguyên nhân sai (để gửi)
> Bảng dưới đây lưu kết quả của bản BE cũ ngày 2026-11-17. Đối chiếu hiện hành nằm ở mục 8–11.

| Luồng | Kết luận | Chưa đạt nghiệp vụ ở đâu | Sai ở |
|---|---|---|---|
| W01 Danh tính | **Đạt** | Hồ sơ không có SĐT/đơn vị; tên công ty gõ cứng | BE-04; FE-07 |
| W02 Hình học & dự án | **Đạt có lỗi** | 404 cho "chưa có hồ sơ tuyến"; gọi lặp 15–96 lần; địa bàn/CRS/ngày không có ở danh sách; Giám sát thiếu "lỗi mở" | BE-01, BE-04; FE-03, FE-04 |
| W04 Case & khiếm khuyết | **Đạt một phần** | Ứng viên AI thiếu (1/10 lần chạy); Giám sát thiếu số lỗi mở; xác minh nuốt lỗi; khiếm khuyết không có lý trình | FE-01, FE-02, FE-03; BE-04 |
| W05 Khảo sát & AI | **Chưa đạt** | Màn thẩm định AI chỉ hiện 1/10 lần chạy; route không id dùng mã cứng `srv-01` và không báo lỗi; không gắn được phát hiện AI với chuyến bay | **FE-01, FE-02** (chính); BE-02, BE-03 |
| W06 Hiện trường | **Đạt dữ liệu** | Cột Crew hiện GUID; không có lý trình khiếm khuyết | FE-05; BE-04 |
| W07 Sửa chữa & nghiệm thu | **Đạt phần đọc, chưa kiểm phần ghi** | Gói không có tên/khối lượng/vật tư/thời hạn; "Xuất hồ sơ" chưa nối; route không id quay spinner | BE-04; FE-06 |
| W08 Fast Track | **Đạt có giới hạn** | Không liệt kê được chính sách hiện hành | **BE-05** |
| W09 Offline (web) | **Chặn** | Màn xung đột không có dữ liệu | **BE-06** |
| W10 Báo cáo & lưu trữ | **Đạt phần đọc** | Dashboard Giám sát thiếu nhiều chỉ số; thông báo thiếu ưu tiên/người gửi/SLA; tải chậm 7–14 s; export `PARTIAL` | BE-04, BE-07; FE-04 |

Tóm lại: thiếu dữ liệu ở W05/W04 **do FE** (sửa được ngay); thiếu dữ liệu ở W01/W02/W06/W07/W10 chủ yếu **do BE không trả trường**; W08, W09 **bị chặn bởi BE**.

## 3. Danh mục lỗi
### Do BE (cần BE xử lý hoặc xác nhận)
| Mã | Mô tả | Bằng chứng |
|---|---|---|
| BE-01 | `GET /projects/{id}/road-geometry-submission` trả **404** (kèm `code: road_geometry_submission_not_found`) khi dự án chưa có hồ sơ tuyến. FE phân biệt được nhờ `code` và đã xử lý như "rỗng"; chỉ còn là 404 đỏ trong tab Network (BE nên trả 200 rỗng hoặc ghi rõ trong hợp đồng). **Mức thấp, không phải lỗi chức năng.** | 20 lượt (PM) / 96 lượt (Giám sát) trong một lần duyệt |
| BE-02 | Danh sách `ai-mock-runs` không có `datasetId`/`surveyTaskId`/thời điểm → không biết lần chạy thuộc chuyến bay nào. | khóa trả về: `id,projectId,stage,mode,status,processingJobId,resultId,fixtureVersion,errorCode,version` |
| BE-03 | Chỉ nhận Bearer, cookie web trả 401: `baseline-selections`, `ai-mock-runs/{id}/result`, assessments, processing-jobs, `/files/*`. Bản dev dùng `[TEMP-BEARER]` (mất khi F5). | `GET baseline-selections` cookie → 401 `auth_unauthorized` (3/3 dự án PM, 14/14 Giám sát) |
| BE-04 | DTO thiếu trường UI cần: `/projects` chỉ có `projectCode,name,status,PM` (không địa bàn/CRS/ngày/km); thông báo không có ưu tiên/người gửi/SLA/lý trình; thành viên không có SĐT/email; `/profile` không có SĐT/đơn vị; khiếm khuyết `segmentId=null` (không lý trình); gói sửa chỉ có `id,defectId,allMandatoryResolved,version` (không tên/khối lượng/vật tư); PM không đọc tên Crew (`/users` 403). | mẫu JSON `audit/samples.mjs` |
| BE-05 | Không có collection `repair-policies` (chỉ đọc theo id). | OpenAPI chỉ có `.../repair-policies/drafts/{id}`, `/revisions/{id}` |
| BE-06 | Chưa có API xung đột ngoại tuyến cho web. | UI: "Máy chủ chưa có API xung đột ngoại tuyến cho Web" |
| BE-07 | Không có endpoint đánh dấu đọc hàng loạt: "Đánh dấu tất cả" = N request. | `KIEM-TRA-TAO-TRUNG-DONG.md` |
| BE-08 | `lifecycle` dự án sandbox: `warrantyRecorded=false`, `missingReasons=[LIFECYCLE_AUTHORITY_SOURCE_NOT_VERIFIED, OBLIGATION_INVENTORY_NOT_VERIFIED]` → UI "Chưa có hồ sơ bảo hành" là đúng dữ liệu. | `GET /projects/{id}/lifecycle` |

### Do FE
| Mã | Mô tả | Vị trí | Mức |
|---|---|---|---|
| FE-01 | `useDroneMissionReview(id \|\| 'srv-01', …)`: mã khảo sát cứng khi route không có `:id` (`/pm/drone-mission`, `/sup/drone-mission`). Lỗi tải phát hiện AI chỉ `console.error`, **UI không báo lỗi**. `DefectDetailVerify.tsx:275` còn `.catch(() => [])` nuốt lỗi. | `pages/(pm)/DroneMissionAIReview.tsx:76`, `drone-review/useDroneMissionReview.ts:77` | Cao |
| FE-02 | `getSurveyDetections` chỉ đọc `runs[0]` trong các lần chạy AI `SUCCEEDED` (BE có **10**, FE hiển thị **1**) → thiếu phát hiện của 9 lần còn lại. | `api/services/surveyService.ts:501-503` | Cao |
| FE-03 | Giám sát đọc `statistics.openDefectsCount` nhưng BE không có trường này (`DefectStatisticsSnapshot`: `projectDistinctDefects, matchedDistinctDefects, sharedParts, unmappedDefects…`) → "Lỗi mở" luôn thiếu và cảnh báo "Một phần thông tin … chưa tải được" ở `/sup/projects`, `/sup/projects/{id}`. | `api/services/projectService.ts:425` | Trung bình (cần chủ nghiệp vụ chốt trường dùng) |
| FE-04 | Gọi lặp / N+1: `road-geometry-submission` gọi mỗi dự án mỗi màn (không cache); `/pm/surveys` gọi `GET /survey-tasks/{id}` 51 lần cho 31 nhiệm vụ; nhiều list gọi 2–3 lần → dashboard/kiểm toán/nghiệm thu cần 7–14 s mới hiện (chụp sớm thấy trống). | nhiều service | Trung bình |
| FE-05 | Hiển thị GUID thô: `Crew (72f84201-a001-…)` ở bảng nhiệm vụ đo (nên ghi "chưa có tên từ máy chủ"). | `/pm/field-tasks` | Thấp |
| FE-06 | Màn nghiệm thu: khi tải xong mà không có hồ sơ vẫn quay spinner (đã thấy hiện hồ sơ sau 12–14 s khi có dữ liệu, do tải chậm); `handleTriggerExport` chỉ toast "chưa nối máy chủ". | `EvidenceCloseoutDetail.tsx` | Thấp/Trung bình |
| FE-07 | Tên "Công ty TNHH Xây dựng Bê tông Hoàng Hải" gõ cứng ở hồ sơ, không phải dữ liệu BE. | `ProfilePage.tsx:169,299`, `UserProfileModal.tsx:208,347` | Thấp (chủ dự án quyết định) |

## 4. Chi tiết từng luồng

### W01 — Danh tính (đăng nhập, hồ sơ, nhân sự) — **Đạt**
API: `POST /auth/web/login|logout`, `GET /auth/web/session|csrf` (200); `GET /profile` (200: `userId,username,displayName,email,roleCode,status,rowVersion`); `PUT /profile` (200, C); `GET /users` (Giám sát 200 – 9 người; PM 403 theo phân quyền); `GET /projects/{id}/members` (200, 3); `POST /invitations` (201, đúng 1 lệnh, C).
| TC | Nội dung | Kết quả |
|---|---|---|
| W01-01 | Đăng nhập `pm-a`, `supervisor` vào đúng `/pm/*`, `/sup/*` | Đạt (A) |
| W01-02 | Hồ sơ đúng tên, email, vai trò | Đạt (A, B) |
| W01-03 | Không có SĐT/đơn vị từ BE | Theo thiết kế / BE-04 |
| W01-04 | Dòng tên công ty ở hồ sơ | FE-07 (chuỗi cứng) |
| W01-05 | `/pm/personnel` tên, vai trò, trạng thái | Đạt; SĐT/email "Chưa có thông tin" do BE-04 |
| W01-06 | Giám sát xem 9 người dùng và mời nhân sự | Đạt (A, B, C) |
Chưa kiểm: đổi mật khẩu bắt buộc lần đầu, kích hoạt lời mời qua Mailpit, reset mật khẩu.

### W02 — Hình học & dự án — **Đạt có lỗi**
API: `GET /projects` (PM 3, Giám sát 14); `GET …/work-package` (200, có `roadSections`, SRID 32648, `startDate/endDate=null`); `primary-project-manager`, `members`, `road-coverage`, `lifecycle` (200); `road-geometry-submission` (**404** nếu chưa có hồ sơ tuyến, BE-01); `geometry-package` (400 khi thiếu `routeVersionId`, 200 khi FE truyền đủ); `POST /projects` (201, 1 bản ghi/click, C).
| TC | Nội dung | Kết quả |
|---|---|---|
| W02-01 | Danh mục dự án khớp BE (PM chính, trạng thái, lỗi mở 1, gói sửa 5) | Đạt (A, B) |
| W02-02 | Thời hạn bảo hành | Theo thiết kế / BE-08 |
| W02-03 | Địa bàn, CRS, ngày bàn giao ở danh sách | BE-04 (FE phải gọi thêm `work-package`) |
| W02-04 | Tim tuyến/phân đoạn của dự án có hồ sơ | Đạt (A) |
| W02-05 | Dự án chưa có hồ sơ tuyến → "Chưa có tim tuyến hiện hành" | Đạt hiển thị, nhưng sinh 404 (BE-01) |
| W02-06 | Số lần gọi `road-geometry-submission` | **Không đạt hiệu năng (FE-04)** |
| W02-07 | Tạo dự án (modal làm lại) | Đạt (C) |
| W02-08 | Cảnh báo "Một phần thông tin … chưa tải được" ở Giám sát | **FE-03** |
Ghi nhận tại lần kiểm BE cũ: chưa nối `POST /projects/{id}/lifecycle/{op}` và các route khảo sát theo road-section. Tình trạng Web hiện hành xem mục 11. Lần kiểm này chưa chạy duyệt hồ sơ tuyến mới, tạo CRS profile, gia hạn phạm vi bảo hành.

### W04 — Case & khiếm khuyết — **Đạt một phần**
API: `GET /cases` (Giám sát 200, PM 403 đúng phân quyền); `GET …/defects` (PM 200 – Project A 1 khiếm khuyết POTHOLE/LOW/OPEN; Giám sát 403); `GET …/defect-statistics` (Giám sát 200); `candidates` (400 nếu thiếu `sourceKind/sourceId`); `ai-candidates/{id}` (200).
| TC | Nội dung | Kết quả |
|---|---|---|
| W04-01 | `/pm/ai-inbox` tải, không lỗi HTTP | Đạt (A) |
| W04-02 | Danh sách ứng viên AI đầy đủ | **Không đạt (FE-02)** |
| W04-03 | `/sup/cases` tải | Đạt (A) |
| W04-04 | Giám sát xem số "lỗi mở" | **Không đạt (FE-03)** |
| W04-05 | Khiếm khuyết có lý trình | BE-04 (`segmentId=null`; UI ghi "Km —", không bịa) |
| W04-06 | Xác minh khiếm khuyết đọc phát hiện theo khảo sát | **Không đạt (FE-01)** (nuốt lỗi) |
| W04-07 | Tạo/duyệt nhãn (research-validation) | Đạt (C); bấm cực nhanh ra 2 lệnh → đã chặn bằng `useSubmitGuard` |
Chưa kiểm: quyết định ứng viên (KEEP_NEW/LINK_EXISTING/REJECT), gộp/trùng.

### W05 — Khảo sát & AI — **Chưa đạt**
API: `survey-plans`/`survey-tasks` (200; BE Project A **31 nhiệm vụ + 2 kế hoạch**, UI hiện 33 → khớp); `GET /survey-tasks/{id}` (FE gọi 51 lần/lần mở danh sách); `…/datasets`, `/datasets/{id}`, `/coverage` (200; 29 bản nộp); `POST …/assessments`, `POST …/baseline-selections` (cookie 401 → Bearer tạm, ghi 201, BE-03); `ai-mock-runs` (200, **10 lần chạy đều SUCCEEDED**, BE-02); `…/result` (Bearer-only); `/files/{id}` và `/content` (200 qua Bearer tạm).
| TC | Nội dung | Kết quả |
|---|---|---|
| W05-01 | Danh sách khảo sát khớp BE | Đạt (B) 33/33 |
| W05-02 | Tạo kế hoạch + nhiệm vụ không trùng | Đạt (C); "1 ra 2 dòng" là thiết kế (plan + task) |
| W05-03 | Giao lại/hủy nhiệm vụ, bấm đúp | Đạt (C) |
| W05-04 | Bản nộp: danh sách, độ phủ, tải thêm | Đạt (A, C) |
| W05-05 | Đánh giá + khóa baseline (PM) | Đạt (C) |
| W05-06 | Xem video nguồn PM | Đạt, chưa kiểm MP4 thật (tệp seed 1,5 KB báo đúng lỗi codec; SHA-256 khớp) |
| W05-07 | Xem/tải video nguồn Giám sát (chỉ đọc) | Đạt (A): 0 lệnh ghi |
| W05-08 | Danh sách phát hiện AI đầy đủ | **Không đạt (FE-02)**: hiện 1/10 lần chạy |
| W05-09 | `/pm|sup/drone-mission` không có `:id` | **Không đạt (FE-01)**: `srv-01` cứng; UI rỗng, không báo lỗi |
| W05-10 | Gắn phát hiện AI ↔ chuyến bay | BE-02 (FE đang gắn theo dự án cho đợt BASELINE, `surveyService.ts:385`) |
| W05-11 | Thời gian tải màn khảo sát | FE-04 |
Chưa làm: chọn baseline theo dải xuyên nhiệm vụ (cần chủ nghiệp vụ). Chưa kiểm: phát/tua MP4 thật, chạy AI mới trên video thật, retry job.
**Kết luận: nguyên nhân chính của thiếu dữ liệu ở luồng này là FE-01/FE-02, sửa được ở FE.**

### W06 — Hiện trường — **Đạt dữ liệu**
API: `field-inspection-tasks` (200, Project A **50**; UI **50 dòng** → khớp); `…/{id}`, `/history`, evidence (200); `POST` tạo/`reassign`/`cancel`, `…/items/{id}/assign` (C: 1 lệnh/click).
| TC | Nội dung | Kết quả |
|---|---|---|
| W06-01 | Danh sách khớp BE | Đạt (39 cần thực hiện, 1 đang đo, 1 đã xác minh) |
| W06-02 | Cột kỹ sư phụ trách | FE-05 (GUID); BE-04 (PM không đọc được tên Crew) |
| W06-03 | Vị trí khiếm khuyết | BE-04 (`Km` trống) |
| W06-04 | Tạo/giao lại/hủy nhiệm vụ đo | Đạt (C); BE không chặn giao lại 2 lần với 2 key khác (FE đã chặn) |
| W06-05 | Giao đội thi công | Đạt (C) |
| W06-06 | Bảng không tràn ngang, tab thông báo không cắt | Đạt (đã sửa, `UI-DONG-BO-20261116.md`) |
Chưa kiểm: duyệt số đo, nộp bản đo thật (Crew trên app), ảnh đối chứng với tệp thật.

### W07 — Sửa chữa, nghiệm thu, đóng hồ sơ — **Đạt phần đọc; chưa kiểm phần ghi**
API: `repair-packages` (200, **5 gói**; UI **5 dòng** → khớp; gói chỉ có `id,defectId,allMandatoryResolved,version`); `…/items` (200); tạo gói báo 409 `active_scope_conflict` (đúng nghiệp vụ, C); giao việc 201 (C).
| TC | Nội dung | Kết quả |
|---|---|---|
| W07-01 | Danh sách gói khớp BE | Đạt (1 đã duyệt, 4 đã giao việc) |
| W07-02 | Tên gói, khối lượng, vật tư, thời gian, người lập | BE-04 (UI ghi "Chưa có dữ liệu…") |
| W07-03 | Tạo gói khi khiếm khuyết đã có phạm vi | Đạt (409 hiển thị đúng lý do) |
| W07-04 | `/pm/evidence-closeout` hồ sơ hạng mục thật | Đạt (A); "Nguồn ảnh —", vị trí "—" do BE |
| W07-05 | "Xuất hồ sơ" | **FE-06** (chưa nối, chỉ toast) |
| W07-06 | Route nghiệm thu không có id | **FE-06** (spinner 12–14 s, không hướng dẫn) |
| W07-07 | Giám sát duyệt/từ chối, ký đóng hồ sơ | Chưa kiểm lại |
Chưa kiểm: duyệt/từ chối gói, nghiệm thu đạt/không đạt, ký đóng, sửa/hủy hạng mục. Biện pháp an toàn là việc của Crew (ngoài web).

### W08 — Fast Track — **Đạt có giới hạn BE**
API: `road-coverage` (200); `receiving-requests` (200, 2); `repair-policies` chỉ đọc theo id (BE-05); `notification-supervisor` GET/PUT/DELETE (có).
| TC | Nội dung | Kết quả |
|---|---|---|
| W08-01 | `/pm/fast-track` tải, độ phủ hiển thị | Đạt (A) |
| W08-02 | Liệt kê chính sách hiện hành | **BE-05** (UI ghi "Chưa có tham chiếu chính sách đã đọc", trung thực) |
| W08-03 | Giám sát xem khiếm khuyết gốc | Theo thiết kế (Giám sát 403 ở `defects`; UI nói rõ) |
| W08-04 | Đặt/đọc chính sách khi biết id | Đã kiểm trước đó (`FASTTRACK-POLICY-RUNTIME-20261116.md`) |
Cần BE: `GET /projects/{id}/repair-policies` hoặc cách lấy id. Chưa kiểm: giao Fast Track và chuyển trạng thái sau lần này, thông báo Giám sát B2.

### W09 — Offline (phần web) — **Chặn bởi BE**
`/pm/conflicts`, `/sup/conflicts` báo "Máy chủ chưa có API xung đột ngoại tuyến cho Web. Chưa thể kết luận có hay không có xung đột". BE chỉ có `offline/*` cho thiết bị/Crew, không có DTO xung đột cho web (BE-06). FE không giả dữ liệu. Chưa kiểm: toàn bộ luồng xử lý xung đột.

### W10 — Báo cáo, thông báo, kiểm toán, lưu trữ — **Đạt phần đọc**
API: `notifications` (200: `id,message,resourceId,read,occurredAt,version`); `POST /notifications/{id}/read` (N request, BE-07); `reports/summary` (200, nhiều chỉ số `UNAVAILABLE` kèm lý do); `reports/items|timeline` (400 nếu thiếu lọc, FE gọi kèm); `exports` (1 export `DOSSIER/PDF SUCCEEDED`, `completeness=PARTIAL`, thiếu `repairAcceptanceRate, reporterEvidence`); `retention/evaluations` (1 bản `COMPLETE`); `clocks` (11); `POST …/clocks/{id}/extensions` (đã sửa lỗi `If-Match` thiếu ngoặc kép).
| TC | Nội dung | Kết quả |
|---|---|---|
| W10-01 | Thông báo tải, đọc, đánh dấu đọc | Đạt (A, C) |
| W10-02 | Thông báo có ưu tiên/người gửi/SLA | BE-04 |
| W10-03 | Dashboard Giám sát: kỳ, khu vực, tổng chiều dài, sắp hết hạn, đoạn chưa baseline, điểm rủi ro | BE-04 / Theo thiết kế (UI ghi "Máy chủ chưa cung cấp dữ liệu này") |
| W10-04 | Dashboard tải đủ | Đạt nhưng chậm, FE-04 (7–14 s) |
| W10-05 | Báo cáo KPI, chỉ số không có hiện lý do | Đạt (A, B) |
| W10-06 | Nhật ký kiểm toán | Đạt (A), tải chậm |
| W10-07 | Export hồ sơ tạo/theo dõi/tải | Đạt một phần (C): `PARTIAL` do BE |
| W10-08 | Retention | Đạt (UI: "Chưa có yêu cầu hủy dữ liệu nào" khớp BE) |
| W10-09 | Legal hold | Đã kiểm trước đó; script từng treo, chưa chạy lại |
| W10-10 | Gia hạn đồng hồ | Đạt sau sửa (C) |
| W10-11 | Mở tab Báo cáo/Audit không phát lệnh ghi | Đạt (A) |
Chưa kiểm: áp/gỡ legal hold, yêu cầu hủy dữ liệu có phê duyệt, mở tệp export đã hoàn tất, digest tuần. Tab `exports`/`retention` chỉ tải khi mở (lazy), nên không có ở lượt duyệt đầu.

## 5. Đã sửa FE sau kiểm (2026-11-17) — theo đúng hợp đồng BE
| Mã | Đã sửa | Kiểm lại |
|---|---|---|
| FE-02 | `surveyService.getSurveyDetections` đọc kết quả của **mọi** lần chạy AI `SUCCEEDED` (không chỉ `runs[0]`), gộp theo `detectionId` | Chạy thật: một lần mở màn thẩm định gọi `ai-mock-runs/{id}/result` cho các lần chạy (32 lượt gồm gọi lặp) và 51 lượt `ai-candidates`; trước đây chỉ 1 lần chạy. **Chưa nhìn thấy danh sách đầy đủ trên UI** vì nhiệm vụ dữ liệu thử đang ở trạng thái "Lên lịch bay" (chỉ đợt BASELINE có run mới vào màn thẩm định) |
| FE-01 | Bỏ mã cứng `srv-01`, `DET-01`, `Km 1024 - 1030`; route không có `:id` hiện cảnh báo "Chưa chọn đợt khảo sát…"; lỗi tải phát hiện AI hiện banner đỏ (không chỉ console); bỏ đợt bay cũ khi đổi sang route không có id (trước đó hiện nhầm `#MS-2026-C8C9`); `DefectDetailVerify` báo lỗi tra cứu thay vì nuốt | Chạy thật: `/pm/drone-mission`, `/sup/drone-mission` hiện cảnh báo, console sạch |
| FE-03 | Giám sát: bỏ cờ lỗi giả "chưa tải đầy đủ số lỗi mở" khi `defect-statistics` đã tải (BE không có số lỗi mở); ô số lỗi mở hiện "Chưa có số liệu" (không còn "Chưa tải được" gây hiểu nhầm là lỗi) ở thẻ, bảng, tổng quan dự án | Chạy thật: `/sup/projects` và `/sup/projects/{id}` không còn banner cảnh báo; tsc/build đạt |
| FE-04 | `road-geometry-submission` gộp lời gọi theo (người dùng, phiên, dự án) trong 4 giây, lần đọc xác minh sau ghi vẫn đọc mới; danh sách khảo sát đọc chi tiết **song song tối đa 8** thay vì tuần tự (list của BE không có `scope`/người giao nên bắt buộc đọc chi tiết từng bản ghi — xem mục 6 #16) | Chạy thật: 1 lượt/dự án/màn (trước 4–6); `/pm/surveys` vẫn đủ 33 hồ sơ. Chưa đo thời gian tải trước/sau |
| FE-05 | Crew không có tên: hiện "Crew <8 ký tự> (chưa có tên từ máy chủ)" thay GUID đầy đủ | tsc/build đạt; chưa chụp lại UI. Lưu ý: ô tìm kiếm nay khớp theo 8 ký tự đầu thay vì GUID đầy đủ |
| FE-06 | Nghiệm thu: tải xong không có hồ sơ → thông báo rỗng thay vì spinner | tsc/build đạt; chưa chụp lại UI. Nút "Xuất hồ sơ" vẫn chưa nối (chưa có endpoint xuất hồ sơ nghiệm thu riêng, xem mục 6 #15) |
| FE-07 | **Chưa sửa**: tên công ty cố định ở hồ sơ; chủ dự án quyết định giữ làm nhãn thương hiệu hay bỏ | |

Kiểm tra: `tsc --noEmit` và `vite build` đạt. Các mục còn lại ở mục 2 (W08, W09, phần lớn W10, W06-vị trí, W07-gói) **không sửa được ở FE** vì BE không trả dữ liệu — xem mục 6.

## 6. API BE sai / thiếu — gửi cho BE
| # | API | Vấn đề | Ảnh hưởng UI | Đề xuất |
|---|---|---|---|---|
| 1 | `GET /projects/{id}/ai-mock-runs` | Mục không có `datasetId`/`surveyTaskId`/thời điểm tạo (BE-02) | Không gắn được phát hiện AI với chuyến bay; màn thẩm định phải gom theo dự án | Thêm các trường liên kết và `createdAt` |
| 2 | `GET /projects/{id}/baseline-selections`, `GET …/ai-mock-runs/{id}/result`, `POST /datasets/{id}/assessments`, `POST …/baseline-selections`, processing-jobs, `/files/*` | Chỉ nhận Bearer; cookie web trả 401 (BE-03) | Web production không dùng được các luồng khảo sát/AI nếu không có Bearer tạm | Mở route cho cookie `WebSession` + CSRF hoặc công bố phương án transport |
| 3 | `GET /files/{id}/content` | Không hỗ trợ HTTP Range (206/416) | Video lớn phải tải toàn tệp (giới hạn 256 MB) | Bật Range |
| 4 | `GET /projects` | Chỉ trả `projectCode,name,status,PM` (BE-04) | Địa bàn/CRS/ngày/km phải gọi thêm `work-package`; thiếu thì "Chưa có" | Bổ sung hoặc xác nhận `work-package` là nguồn chuẩn |
| 5 | `GET /notifications` | Không có mức ưu tiên, người gửi, SLA, lý trình (BE-04) | UI ghi "Máy chủ chưa cung cấp…" | Bổ sung trường hoặc xác nhận không có |
| 6 | `GET /projects/{id}/members`, `GET /profile` | Không có SĐT/email/đơn vị (BE-04) | "Chưa có thông tin" | Bổ sung |
| 7 | `GET /projects/{id}/defects` | `segmentId=null`, không có lý trình/vị trí (BE-04); Giám sát nhận 403 | Cột vị trí trống; Giám sát không đọc được khiếm khuyết gốc | Trả vị trí hoặc xác nhận chỉ qua `defect-statistics`; cho Giám sát đọc |
| 8 | `GET /projects/{id}/defect-statistics` | Không có số khiếm khuyết "mở" (chỉ `projectDistinctDefects`…) | Giám sát không có số lỗi mở | Thêm số mở hoặc xác nhận trường dùng |
| 9 | `GET /projects/{id}/repair-packages` | Chỉ `id,defectId,allMandatoryResolved,version` | Gói không có tên/khối lượng/vật tư/thời hạn/người lập | Bổ sung hoặc chỉ nguồn khác |
| 10 | `GET /users` | PM nhận 403 | PM không có tên Crew/Operator ngoài `members` | Cho PM đọc tên theo dự án (thư mục nhân sự dự án) |
| 11 | `repair-policies` | Không có collection liệt kê (BE-05) | Fast Track không liệt kê chính sách | Thêm `GET /projects/{id}/repair-policies` |
| 12 | API xung đột ngoại tuyến cho web | Không có (BE-06) | `/conflicts` trống | Công bố API |
| 13 | `POST /notifications/{id}/read` | Không có đọc hàng loạt (BE-07) | "Đánh dấu tất cả" = N request | Thêm bulk |
| 14 | `GET /projects/{id}/road-geometry-submission` | 404 cho trạng thái rỗng (BE-01, mức thấp; có `code=road_geometry_submission_not_found`) | 404 đỏ trong Network | Trả 200 rỗng hoặc ghi vào hợp đồng |
| 15 | Hạng mục nghiệm thu | Chưa thấy endpoint xuất hồ sơ nghiệm thu | Nút "Xuất hồ sơ" chưa nối | Cho biết endpoint (hoặc dùng `/exports` kind=DOSSIER nếu đúng) |
| 16 | `GET /projects/{id}/survey-plans`, `/survey-tasks` (danh sách) | Mục không có `scope`, tên người giao, loại khảo sát; chỉ có `id,projectId,status,plannedAt/operatorId,version` | FE phải `GET /survey-plans|tasks/{id}` cho từng bản ghi (N+1) để hiện phạm vi và người giao | Thêm `scope` và tên người giao vào danh sách, hoặc thêm tham số `expand` |

## 7. Chưa làm trong lần kiểm này
- Chưa chạy mới các lệnh ghi cho từng luồng (mục C ở trên); các sửa FE ở mục 5 chỉ kiểm bằng đọc/duyệt màn, chưa chạy lệnh ghi.
- Chưa kiểm phát MP4 thật (không có video mẫu).
- Tại lần kiểm BE cũ, FE đọc chi tiết khảo sát 1 lần/bản ghi (33 lượt) và chưa nối nút "Xuất hồ sơ". NewBE dùng summary khảo sát và DOSSIER; xem mục 8.2.

Người nghiệm thu: ____________  Ngày: ____________  Kết luận: ☐ Chấp nhận ☐ Yêu cầu sửa


## 8. Cập nhật theo BE mới (2026-11-18) — `RoadGuardSystem-develop_NewBE`

BE mới chạy bằng Docker project `roadguard-new` (API https://localhost:18443). Dữ liệu cũ (project `roadguard-dev1`) **không nâng cấp tại chỗ được**: api thoát mã 139 trong `SandboxSyntheticSeeder` khi chạy trên volume cũ ("Existing configurations are not silently upgraded"), nên dùng DB mới + seed lại. Đã đổi snapshot hợp đồng `docs/contracts/openapi.json` (bản cũ lưu `openapi.old-20261117.json`): 262 → 298 thao tác.

### 8.1 Yêu cầu của bạn
| Yêu cầu | Kết quả |
|---|---|
| Ưu tiên Điều phối nhanh | Danh mục chính sách hiện hành lấy từ `GET /projects/{p}/repair-policies` (REVISION + DRAFT). Kiểm thật: tạo + ban hành chính sách thử qua API, màn `/pm/fast-track` hiện "test-fe-v1 (ĐÃ XUẤT BẢN)", nhật ký 1. Giám sát bổ sung **biên bản bàn giao** cho dự án cũ thiếu HANDOVER ngay trong modal "Phê duyệt độ phủ tuyến" (`POST /uploads` DOCUMENT `targetId=projectId` → `POST /projects/{p}/handover-documents`): đã chạy thật, 4 lệnh ghi đều thành công |
| Giám sát tạo dự án **bắt buộc** có biên bản, không để null | Form tạo dự án có mục "Tài liệu / Biên bản bàn giao" **Bắt buộc** (PDF ≤ 20 MiB), nút "Khởi tạo dự án" bị khóa khi chưa chọn tệp. Luồng: `POST /projects/handover-upload-intents` → part-urls → PUT → complete → chờ VERIFIED → `POST /projects` với `handoverFileIds:[fileId]` + `If-Match`=ETag phiên upload. Kiểm thật (dự án `HBM9A9CD`): sau tạo, `road-coverage.sources` có đủ HANDOVER, WARRANTY, MAINTENANCE_BASIS và tệp HANDOVER đọc được (`VERIFIED`, `application/pdf`). Không file → BE trả `428 handover_required` (FE chặn từ trước) |

### 8.2 Các API BE đã sửa → FE đã nối (đối chiếu mục 6)
| # mục 6 | Trạng thái | Việc FE đã làm / kiểm |
|---|---|---|
| 1 `ai-mock-runs` | BE đã thêm `datasetId, datasetVersionNo, surveyTaskId, createdAt` | Gắn lần chạy AI theo nhiệm vụ của kế hoạch; màn thẩm định `/pm/surveys/{plan}/review` hiện **3 mục** của 3 lần chạy (trước: chỉ lần đầu) |
| 2 cookie thay Bearer | BE đã mở cookie cho baseline-selections, ai-mock-runs (+result), processing-jobs, files (DOCUMENT/AI_FRAME/SURVEY_VIDEO), uploads, warranties, retention | Đã nghỉ hưu transport `[TEMP-BEARER]` (`VITE_DEV_FILE_BEARER=false`); kiểm cookie 200 cho các GET. **Còn Bearer-only:** `GET /projects/{p}/ai-candidates/{id}` (401 với cookie) — xem 8.3 |
| 3 Range | BE đã hỗ trợ 200/206/416 | `sourceVideoService.openStream`: kiểm metadata + thăm dò `Range: bytes=0-0` (nhận `206 bytes 0-0/1510`) rồi để `<video>` tự gửi Range; bỏ giới hạn 256 MB. "Tải tệp nguồn" vẫn tải toàn tệp + SHA-256 |
| 4 `/projects` thiếu trường | BE thêm `GET /projects/overviews` (địa bàn, CRS, tuyến, chiều dài, bảo hành, số lỗi mở) | Danh sách dự án dùng overviews: số **lỗi mở** có cho cả PM lẫn Giám sát (metric `defect.open.v2`); địa bàn đọc từ `locality` (giám sát sửa được: thẻ "Địa bàn dự án" → `PUT /projects/{p}/locality`) |
| 5 thông báo | BE thêm `priority` (HIGH/NORMAL/UNKNOWN), scope `title/senderKind/deadlines` | Hiện mức ưu tiên do máy chủ tính; `POST /notifications/read-batch` thay N request (lô ≤100, cùng `snapshotVersion`, key mới mỗi lô) |
| 6 liên hệ | BE thêm `member-contacts` | `/pm/personnel` (PM) đọc email/SĐT hiện hành theo dự án |
| 7 vị trí khiếm khuyết/ảnh gốc | BE thêm `repair-items/{item}/source-defect` | Panel "Khiếm khuyết gốc của hạng mục" (PM & Giám sát) trong chi tiết gói: loại, mức độ, trạng thái, nguồn, ảnh gốc mở theo `contentPath` (kiểm thật: POTHOLE/LOW/OPEN, 1 ảnh REPORT). `geometryWkt` vẫn null với dữ liệu này |
| 8 số lỗi mở | BE: `defect.open.v2` trong overviews | Đã hiển thị (xem dòng 4) |
| 9 gói thiếu tên/khối lượng | BE thêm `…/planning` (gói) và `…/items/{item}/planning` | Bảng đề xuất đọc tên gói, hạn kế hoạch, người/ngày lập, khối lượng & vật tư dự kiến. **Chưa làm màn sửa (PUT)** |
| 10 tên Crew | BE thêm `task-assignees` | Nhiệm vụ đo hiển thị tên người được giao (batch) |
| 11 chính sách | BE thêm `GET /repair-policies` (PM) | Đã nối (xem 8.1) |
| 12 xung đột ngoại tuyến | **Chưa có** (không thấy trong 298 thao tác) | Vẫn BE |
| 13 đọc thông báo hàng loạt | BE thêm `read-batch` | Đã nối |
| 14 `road-geometry-submission` 404 | Không đổi | Vẫn 404 có `code` (mức thấp) |
| 15 xuất hồ sơ nghiệm thu | BE: DOSSIER nhận `repairItemIds`/`repairPackageIds` | Nút "Xuất hồ sơ" ở nghiệm thu tạo DOSSIER theo hạng mục (PDF/ZIP), poll `SUCCEEDED`, tải về. **Chưa chạy được thật** (cần hạng mục đã nghiệm thu) |
| 16 summary danh sách khảo sát | BE thêm `scopeSummary, operatorDisplayName, datasetCount, dueAt…` | `/pm/surveys` hết N+1: từ 67 xuống **10 lời gọi** mỗi lần mở |

Hiệu năng (số lời gọi API khi mở màn, đo cùng cách): `/pm/surveys` 67→10, `/pm/projects/{id}` 38→25, `/sup/fast-track` 112→26, `/sup/proposals` 110→35, `/sup/field-tasks` 80→63. Số liệu so giữa BE cũ (dữ liệu nhiều hơn) và BE mới (dữ liệu ít hơn) nên chỉ mang tính tham khảo.

### 8.3 Còn do BE (note để gửi)
| # | API / vấn đề | Chi tiết |
|---|---|---|
| B1 | `GET /projects/{p}/ai-candidates/{detectionId}` | Cookie web trả **401**; chỉ Bearer. Hậu quả: FE không đọc được trạng thái thẩm định (đã/chưa duyệt) từng phát hiện. FE dựng danh sách từ `ai-mock-runs/{id}/result` và ghi rõ "Trạng thái thẩm định chưa đọc được". Cần mở cookie cho route này (hoặc trả quyết định trong result) |
| B2 | Seed demo (`scenarios`) hỏng trên BE mới | `demo_ai.py` vẫn gọi `POST …/road-geometry-drafts/{id}/confirm` mà không có bước `submit` → **409**, scenarios thoát mã 1 ("Scenario setup FAILED: RuntimeError"). Đã vá tạm bằng bản `demo_ai` có bước submit + `If-Match` từ GET draft để có dữ liệu thử |
| B3 | Tệp `synthetic-road-v1.mp4` chỉ 1.510 byte | Không phải MP4 giải mã được → trình duyệt báo "không hỗ trợ codec" (Range/401/403 vẫn kiểm đúng). Cần một video thật nhỏ để nghiệm thu phát/tua |
| B4 | Chưa có API xung đột ngoại tuyến cho web | như mục 6 #12 |
| B5 | `source-defect.geometryWkt = null` (srid null) với khiếm khuyết từ Report | UI "Chưa có hình học"; cần BE trả vị trí hoặc xác nhận không có |
| B6 | Danh sách `survey-tasks` không có tên tuyến/lý trình trong summary | List chỉ có `routeVersionId/segmentSetId/segmentCount`; tên tuyến và km chỉ có khi mở chi tiết |

### 8.4 Nối nốt các API BE đã có (bổ sung sau góp ý "BE có thì phải nối")
Đã nối thêm và **kiểm bằng lệnh ghi thật**:
| API | Màn / việc | Kết quả kiểm |
|---|---|---|
| `POST /invitations/preview` | Trang chấp nhận lời mời hiện vai trò, dự án, hạn, người mời do máy chủ trả; token sai → màn "không hợp lệ" (lý do từ máy chủ). **Đã xóa** dữ liệu mẫu cố định ở màn hết hạn (token `inv_tok_…`, dự án QL1A, người gửi "Nguyễn Văn An") và công tắc "Chế độ Demo" | Biên dịch/build đạt; chưa chạy với token thật (cần thư mời qua Mailpit) |
| `PUT /projects/{p}/repair-packages/{pkg}/planning` và `…/items/{item}/planning` | Panel "Kế hoạch điều phối (PM)" trong chi tiết gói | PUT 200 cả hai; BE lưu đúng (tên gói, hạn 31/12/2026, 12.5 m2, vật tư); bảng đề xuất đọc lại đúng ở phiên mới |
| `PUT /projects/{p}/locality` | Thẻ "Địa bàn dự án" (Giám sát) | PUT 200; danh sách dự án hiện "Địa bàn: [TEST-FE] Dia ban thu …" |
| `POST /catalog/defect-types/admin` (và GET/PUT) | Tab danh mục loại hư hỏng (Giám sát) | POST 201; danh mục hiện mục mới |
| `GET/PUT /users/{id}/organization` | Ô "Đơn vị công tác" trong form sửa nhân sự (Giám sát) | Biên dịch/build đạt; **chưa bấm lưu thật** |

Các mục tôi từng ghi "chưa nối" nhưng thực tế **đã nối từ trước** (bảng tự đối chiếu nhận sai vì đường dẫn dựng động): `PATCH /me/phone-number`, `PATCH /users/{id}/phone-number`, `GET /cases/{id}/reports`, `GET …/pavement-layouts` (danh sách), `POST /projects/{p}/lifecycle/operational-closures` (khớp mẫu `lifecycle/{command}`). Còn lại không thuộc web PM/Giám sát: `GET /survey-tasks/{id}/eligible-drones` (Operator trên app).

### 8.5 Chưa chạy thật các lệnh ghi (nêu rõ)
- Xác nhận độ phủ Điều phối nhanh (mới kiểm bước bổ sung biên bản), giao lệnh Fast Track, duyệt/nghiệm thu/ký đóng, xuất hồ sơ theo hạng mục, lưu đơn vị công tác, đọc thông báo theo lô (DB thử chưa có thông báo), chấp nhận lời mời bằng token thật.
- Bảng đề xuất phía sau không tự làm mới sau khi lưu kế hoạch trong modal (mở lại hoặc tải lại trang mới thấy).
- Phát/tua MP4 thật chưa kiểm (xem B3).
- Dữ liệu thử đã tạo trên BE mới xem `TEST-DATA-LEDGER.md` mục B7.

## 9. Cập nhật 19/11/2026 — bảng đề xuất và thẩm định AI
- Sau khi lưu kế hoạch thành công, modal và bảng đề xuất cùng tải lại dữ liệu.
- Khung nhận diện chỉ đọc vì BE không có lệnh lưu bbox. Thông báo Chấp nhận/Báo sai được giữ trên màn khi tải lại dữ liệu sau quyết định.
- Đã chạy TypeScript và Vite build thành công; chưa nghiệm thu hai thao tác ghi qua trình duyệt trong lượt này.
- Fast Track: UI PM từng gửi `assign` cho CRACK; NewBE trả 409 `source_not_ready` (correlation ID `8b13ce7b-b974-469e-a145-4828db326157`). Đã xác minh FE gửi nhầm `surveyTaskId` vào `task.surveyId`. FE đã bỏ nguồn suy từ AI run và kiểm lại nguồn thật trước POST. Chưa nghiệm thu `assign` 201 hoặc `final-confirmation`: cần đường đọc Web tới `Surveys.Id` của đúng chuỗi detection/job (hoặc hồ sơ FIELD hợp lệ có sẵn). Chi tiết: `FASTTRACK-LIVE-20261119.md`.

## 10. Nối FE theo NewBE đã chốt

- PM → nhiệm vụ khảo sát → dataset → Chạy AI mock: `Anh02AiService` kiểm `expectedGeometryVersion` với version của đúng `geometry-package` (`AnhHuyProducerService.ResolveGeometryAsync`); `GeometryWorkflowController` trả version đó qua `ETag`. FE lấy `routeVersionId` và `segmentSetId` trực tiếp từ phạm vi dataset, kiểm project và trạng thái metadata của package rồi lấy ETag để gửi. Không gọi `ai-candidates` (Bearer-only) để gợi ý hình học, không dùng phiên bản của lần chạy cũ và không nhập tay. Nếu sai phạm vi hoặc thiếu ETag thì hiện lỗi và không POST.
- Đã kiểm `GET geometry-package` qua cookie PM và proxy Vite trên dataset NewBE: HTTP 200, project/route/set khớp, metadata `COMPLETE` và ETag hợp lệ. Hai test hồi quy xác nhận payload đúng và không gửi POST nếu mất ETag/sai phạm vi. Chưa nghiệm thu lệnh tạo AI run qua trình duyệt; không tạo dữ liệu nghiệp vụ lượt này.
- Giới hạn theo BE đã chốt: `GET candidates` dùng được qua Web để lấy snapshot nguồn và danh sách đối chiếu, nhưng không trả quyết định hiện hành; `GET candidate-decisions/{id}` chỉ đọc được khi biết ID. Không suy trạng thái từ danh sách đối chiếu. Survey plan/task detail không trả `surveyType`. Nguồn Fast Track từ AI chỉ dùng được khi Web có `surveyId` hợp lệ đọc từ hồ sơ FIELD; không thay bằng task ID hay SQL.

## 11. Rà và nối phần còn thiếu theo hợp đồng Web PM/Giám sát

- W05: danh sách thao tác kế hoạch/nhiệm vụ lấy theo trạng thái BE; `SUBMITTED` không còn nút hủy/giao lại. Service đọc lại bản ghi và kiểm điều kiện trước POST, vẫn dùng If-Match và để BE xét các điều kiện dữ liệu khác. Khôi phục module dùng trong test hồi quy; chưa gửi lệnh thật trong lượt sửa điều kiện nút.
- Bảng wiring đã sửa hai nhận định sai do URL dựng động: `GET /survey-tasks/{taskId}` và `PUT /catalog/defect-types/admin/{code}` đã có caller. Các route khảo sát cũ của `SurveyPlanning` (Bearer-only) và reset mật khẩu Reporter nằm ngoài Web PM/Giám sát; không thêm form trùng với Survey V2.
- W02/W07 — `POST /projects/{p}/lifecycle/{command}`: đã nối 6 lệnh ghi trực tiếp. Tái phát là thao tác nguyên tử của `candidate-decisions`; gọi lệnh `recurrences` tách riêng bị BE từ chối với `atomic_confirmed_new_defect_workflow_required`. `renewed-handling-scope` có endpoint riêng.

| Lệnh | Màn và vai trò | Trạng thái |
|---|---|---|
| `construction-declarations`, `construction-confirmations` | Tổng quan dự án: PM khai báo với tệp đã xác minh của dự án; Giám sát xác nhận đúng khai báo | Đã nối; chưa POST thật |
| `defect-closures` | Giám sát đóng khiếm khuyết gốc từ chi tiết nghiệm thu | Đã nối; chưa POST thật |
| `operational-closures` | Giám sát đóng vận hành dự án | Đã nối từ trước |
| `obligation-transfers`, `obligation-transfer-acceptances` | Đề xuất sửa chữa: Giám sát chuyển/tiếp nhận; PM đọc lịch sử theo dự án | Đã nối; chưa POST thật |
| Ghi nhận tái phát (`KEEP_NEW` + `recurrence`) | PM → Thẩm định phát hiện AI → Ghi nhận khiếm khuyết tái phát | Đã nối FE. Chọn quyết định `effectiveDecisionId` của hạng mục `Confirmed`, đối chiếu lịch sử đúng hạng mục/nghĩa vụ/khiếm khuyết, gửi bằng chứng dự án và lifecycle version; BE kiểm hiệu lực của nghĩa vụ cũ. Sau POST đọc lại quyết định và liên kết lifecycle. GET thật qua Web trả 200 cho lifecycle, road coverage, gói và hạng mục; dữ liệu PM đã thử không có hạng mục `Confirmed`, chưa nghiệm thu POST qua UI. |

- Các lệnh mới dùng Web cookie/CSRF, ETag chính xác và idempotency key. FE đối chiếu hành động trong GET vòng đời trước khi báo thành công. Kiểm thật bằng cookie PM/Giám sát qua Vite: `lifecycle`, `road-coverage`, `source-defect` đều 200; ETag vòng đời khớp, dữ liệu thử có hai nghĩa vụ và chưa có action LD06. Kiểm tích hợp mã FE: 22 test đạt, TypeScript đạt, Vite build đạt (có cảnh báo Tailwind/kích thước chunk).
- Chưa đánh dấu nghiệm thu toàn bộ **FE Web**: chưa có POST/GET readback thật qua UI cho các lệnh mới; các điều kiện dữ liệu và phân quyền Web ở mục 10 vẫn áp dụng. Đây là trạng thái nối và kiểm thử FE, không phải việc BE chưa chốt nghiệp vụ.

### W04 — Sửa xác nhận quyết định thẩm định AI trên Web

- Sau `POST /candidate-decisions`, FE đọc lại đúng `GET /candidate-decisions/{decisionId}` bằng cookie PM, đối chiếu ID/phiên bản, loại nguồn, quyết định và khiếm khuyết đích trước khi báo thành công. Khi đã có biên nhận, thử lại phần đối chiếu không gửi lại POST. Không dùng `GET /ai-candidates/{id}` (Bearer-only) làm điều kiện báo thành công; GET theo ID xác nhận bản ghi đã lưu, không khẳng định đây là quyết định hiện hành của toàn bộ danh sách.
- “Gom vào hồ sơ cũ” (`LINK_EXISTING`) không đổi trạng thái hoặc hiện thành công trước khi đối chiếu xong. Chỉ thao tác theo ID và dự án, không dùng nhãn `DET-xx` để đối chiếu giữa các lần chạy.
- Kiểm thật qua Vite/cookie PM: GET quyết định AI có sẵn `REJECT` và `KEEP_NEW` đều 200, đúng ID và ETag. Hai test mới xác minh kiểm tra đích và không POST lại khi đã có biên nhận. Toàn bộ 24 test, TypeScript và Vite build đạt. Chưa chạy POST `LINK_EXISTING` mới qua UI; không tạo dữ liệu test mới trong lượt này.

## 12. Vòng nghiệm thu UI thật 2026-11-19 (theo BAN-GIAO-TIEP-THEO-20261119.md)

Tách bạch: (a) FE đã nối, (b) tsc/build, (c) GET thật, (d) POST + GET readback qua UI. Chỉ đánh "Đạt" khi trạng thái lưu trữ đã đọc lại được.

| Luồng | (a) Nối FE | (b) tsc/build | (c) GET thật | (d) POST qua UI + readback | Kết luận |
|---|---|---|---|---|---|
| W04 `KEEP_NEW` / `REJECT` / `LINK_EXISTING` (DET-01/02/03) | Có | Đạt | Đạt | POST `candidate-decisions` 201, GET decision đúng loại và defectId | **Đạt** |
| W04 xác nhận phủ đường (1–2 m, 5–6 m) | Có | Đạt | Đạt | POST `road-coverage` OK, đọc lại | **Đạt** |
| W07 Giám sát duyệt hạng mục Normal | Có | Đạt | Đạt | POST `…/approve` 201; hạng mục bf16831d → `ReadyToAssign` | **Đạt** |
| W07 Xuất hồ sơ DOSSIER theo gói (`repairPackageIds`) | Có | Đạt | Đạt | PM: POST `exports` 202 → poll → `manifest` 200 → `content` 200 | **Đạt (PM)** |
| W08 Fast Track `assign` | Có | Đạt | Đạt | 409 `source_not_ready` (xem P0 bên dưới) | **Chưa đạt, chặn bởi dữ liệu nguồn/BE** |

### Phát hiện trong vòng này
- **Ghi chú BE (để gửi BE)**: `GET/POST /projects/{p}/exports` trả **403 `access_forbidden` cho SUPERVISOR** (PM 200/202). Nếu tài liệu 05_Web cho Giám sát xuất hồ sơ nghiệm thu thì BE cần mở quyền; hiện FE theo BE (ẩn nút với Giám sát). Correlation ví dụ: `3781c289-d36d-4e57-bd77-50e8124b2dff`.
- **P0 Fast Track `source_not_ready`**: BE `ValidateSourceAsync` yêu cầu (SURVEY) `Surveys.Id` thuộc dự án/route version + link KeepNew tới AiDetection + chuỗi AIDetection→ProcessingJob→ProcessingBlock→SurveyDataVersion.SurveyId. Không có API Web nào trả `Surveys.Id` cho AI detection (chỉ `FieldTaskViewFact.surveyId` của nhiệm vụ FIELD đã có). Nhánh REPORTER cần surveyId rỗng + link KeepNew từ Report, nhưng UI điều phối hiện chỉ cho chọn nguồn là nhiệm vụ FIELD `MEASURE_ONLY` có `requiredMeasurementType`. **Không bypass, không tạo nhiệm vụ FIELD giả.** Cần Hoàng quyết: (1) BE bổ sung `surveyId` vào AI detection/candidate trả cho Web, hoặc (2) mở nhánh nguồn REPORTER trong FE và chốt cách ánh xạ loại đo.

### Chưa làm trong vòng này (cần dữ liệu/vai Crew hoặc chưa có dữ liệu)
W01 nhận lời mời qua token Mailpit + lưu tổ chức; W02 khai báo/xác nhận hoàn thành thi công; W05 tạo AI run mới; W06 duyệt đo; W07 PM giao hạng mục Normal và các bước sau (nghiệm thu, ký, an toàn, sửa đổi, kế nhiệm, hủy, đóng khiếm khuyết, chuyển nghĩa vụ); W09 thu hồi thiết bị/grant (chưa có dữ liệu); W10 read-batch, legal hold, retention. Các mục này **chưa được đánh Đạt**.

### 12.1 Cập nhật cùng ngày — PM giao hạng mục Normal (W07) — **Đạt**
- UI `/pm/repair-batches/assign` (PM): chọn ITEM-BF16831D (Normal), Crew `crew-a`, nguồn REPORTER → POST `…/items/{id}/assign` **201**.
- Đọc lại bằng GET: hạng mục `Normal:Assigned`; nhiệm vụ hiện trường `dac18f10-af8c-46f6-803b-29c08e9bbffc` `mode=NORMAL`, `status=NewAssigned`, `sourceKind=REPORTER`, `purpose=PostRepair`, gán đúng Crew, defect b57181dc.
- Các bước sau (nghiệm thu, ký, an toàn, sửa đổi, kế nhiệm…) cần Crew gửi kết quả từ mobile — ngoài phạm vi Web, chưa thực hiện.

### 12.2 Fast Track (P0) — kết luận theo BE hiện có
- Defect CRACK 551b7ad0 gốc AI (link KeepNew tới AiDetection) nên BE chỉ chấp nhận `sourceKind=SURVEY` với `surveyId`. Web không có API trả `surveyId` → **ghi nhận là thiếu ở BE** (đề nghị BE trả `surveyId` trong AI candidate/detection cho Web, hoặc cho phép assign FAST_TRACK suy ra nguồn từ link KeepNew).
- Nhánh REPORTER đã dùng thành công cho hạng mục Normal (mục 12.1) nên FE đã đúng giao thức; Fast Track REPORTER cần một Defect gốc Report còn trống — Report chỉ tạo được từ app người dân (mobile, ngoài phạm vi) nên chưa có dữ liệu để chạy.
- Không bypass guard, không tạo nhiệm vụ giả.

### 12.3 Chưa có dữ liệu để nghiệm thu
- W10 read-batch: PM và Giám sát hiện 0 thông báo.
- `GET /invitations` bằng Giám sát trả 405 (ghi nhận để hỏi BE đường danh sách lời mời, nếu FE cần).

### 12.4 W02 Hoàn thành thi công — **Đạt** (UI thật, không mobile)
- PM (`/pm/projects/72f84201…`, thẻ “Hoàn thành thi công”): chọn tệp minh chứng HANDOVER 71d40feb… → POST `lifecycle/construction-declarations` **201**; FE đối chiếu bản ghi `545e7cfb-64b2-4362-be51-8862de892e1b`.
- Giám sát (cùng thẻ): chọn khai báo 545e7cfb → POST `lifecycle/construction-confirmations` **201**; bản ghi `3f9529c1-60a3-4955-b617-9bdba9f479c5`.
- GET độc lập `/projects/{p}/lifecycle`: `constructionCompletion=CONFIRMED`, `operationalClosure=UNKNOWN`, `outstandingMandatoryObligationIds` 2 mục, `missingReasons` = `LIFECYCLE_AUTHORITY_SOURCE_NOT_VERIFIED`, `OBLIGATION_INVENTORY_NOT_VERIFIED` (đây là trạng thái do BE trả, FE hiển thị đúng).
- Lưu ý: `history` của GET lifecycle vẫn rỗng dù đã có 2 hành động; FE đọc hành động từ vùng `actions` — ghi nhận để hỏi BE nếu `history` được kỳ vọng chứa chúng.

### 12.5 W05 Tạo lượt chạy AI trên bộ dữ liệu — **Đạt** (UI thật)
- PM `/pm/surveys` → “Xem chi tiết” nhiệm vụ SUBMITTED 25f98904… → `SurveyDatasetPanel`: “Đọc phiên bản hình học và fixture” (GET từ BE), nhập model `72f84201-d033-4000-8000-000000000001`, tiền xử lý `fixture-preprocess.v1`, cấu hình `fixture-config.v1`, fixture `synthetic-road-v1` (giá trị theo seed BE `deploy/fe-handoff/demo_ai.py`) → “Chạy AI mock”.
- POST `/projects/{p}/ai-mock-runs` **202**, UI báo `fd528bc4-0f3f-4115-8ef5-9fedeea5a347 (QUEUED)`.
- GET độc lập `/ai-mock-runs/{id}`: `SUCCEEDED`, `processingJobId=d2b4b7eb-1fde-4b9f-af86-f4356186604c`; `processing-jobs` có job SUCCEEDED với `resultId=66e3fc60…`.
- Ghi nhận UX: model/tiền xử lý/cấu hình là ô nhập tay, không có danh mục từ BE; người dùng phải biết giá trị hợp lệ. Nếu BE có API danh mục model/config thì FE nên đổi sang chọn.

### 12.6 W10 Retention / Legal hold (Giám sát, UI thật)
- **Phong tỏa pháp lý — tạo: Đạt.** `/sup/legal-hold` → bật phong tỏa Synthetic Project A (lý do/cơ quan/số văn bản `[TEST-FE]…`) → POST `/retention/holds` **201**; UI hiện “PHONG TỎA: BẬT”. GET độc lập `retention/files/30d3c8cc…` → `activeHoldCount = 1`.
- **Phong tỏa pháp lý — gỡ: CHƯA thực hiện được (lỗi thiếu API ở BE).** BE chỉ có `POST /retention/holds`, `GET /retention/holds/{id}`, `POST /retention/holds/{id}/release`; **không có API liệt kê lệnh phong tỏa** và các GET retention chỉ trả `activeHoldCount` (không có `holdId`). FE giữ `holdId` trong `sessionStorage` của phiên trình duyệt; phiên kiểm thử đã đóng nên mất id, lệnh hold này **không gỡ được từ Web** (không ghi DB trực tiếp theo quy tắc). Đề nghị BE: thêm `GET /retention/holds?projectId=` hoặc trả `activeHoldIds` trong `retention/files/{id}`.
- **Xác nhận căn cứ lưu trữ (PUT `retention/files/{id}/basis`): UI đúng, BE chặn.** Trả **409 `retention_inventory_incomplete`**; UI hiển thị “HTTP 409 retention_inventory_incomplete”. Khớp `inventoryComplete=false` của tệp và lifecycle `OBLIGATION_INVENTORY_NOT_VERIFIED`. Chưa đạt, chờ điều kiện dữ liệu/BE kiểm kê nghĩa vụ.
- **Đánh giá lưu trữ (POST `retention/evaluations`)**: chưa chạy trong vòng này.
- **Ghi nhận FE**: lỗi hold hiện qua `alert()` trình duyệt trong `useLegalHoldState.ts` thay vì khung lỗi trên màn hình; chưa đổi vì không ảnh hưởng nghiệp vụ.

### 12.7 W06 Duyệt đo — chưa kiểm được
POST `field-inspection-tasks/{id}/reviews` cần nhiệm vụ hiện trường ở trạng thái đã nộp; nhiệm vụ `dac18f10` (NewAssigned) cần Crew nhận/nộp trên mobile (ngoài phạm vi) nên chưa có dữ liệu để duyệt trên Web.

### 12.8 W01 Lời mời → nhận lời mời → tổ chức (UI thật) — **Đạt, kèm 1 lỗi BE cần báo**
- Giám sát `/sup/personnel` → “Gửi lời mời nhân sự mới” (email `test-fe-invite@…` vai REPAIR_CREW, và `test-fe-pm@…` vai PROJECT_MANAGER; không gán dự án) → POST `/invitations` **201**; Mailpit nhận thư có liên kết `/auth/setup-password?token=…`.
- Nhận lời mời: POST `/invitations/preview` **200**, POST `/invitations/accept` **200**; mở lại liên kết → “Token đã vô hiệu hóa” (đã dùng). Vai CREW đăng nhập Web bị từ chối (đúng, Crew không dùng Web); vai PM đăng nhập Web thành công vào `/pm/dashboard`, hồ sơ hiển thị tên đã nhập.
- Lưu tổ chức: Giám sát → Sửa người dùng → PUT `/users/{id}/organization` **200**; GET độc lập (Giám sát): `organization = "Ban QLDA TEST-FE"`.
- **Ghi chú BE**: PM gọi `GET /users/{self}/organization` bị **403**; PM chỉ đọc tổ chức qua `member-contacts` (cần thuộc dự án), nên PM chưa có dự án thấy “Chưa nhập đơn vị công tác” dù dữ liệu đã lưu. Đề nghị BE cho phép người dùng đọc tổ chức của chính mình (hoặc trả trong `/profile`).
- Ghi nhận FE: sau accept, trang dùng `alert()` rồi chuyển về /login (không tự đăng nhập), đúng theo hợp đồng accept.

### 12.9 W10 Đánh giá lưu trữ — **Đạt**
- UI Giám sát: POST **202**, đánh giá mới COMPLETE (policy pr41a.v1, 17:11:08 19/11/2026); toàn bộ tệp `BLOCKED_HOLD` — khớp với lệnh phong tỏa đang hiệu lực ở mục 12.6 (đối chiếu chéo đúng).

### 12.10 W07 Chuyển nghĩa vụ sửa chữa — **Đạt** (UI thật, Giám sát)
- `/sup/proposals` → panel “Chuyển giao nghĩa vụ sửa chữa (LD06)”: dự án A, nghĩa vụ `f1a94258…` (CRACK, 5–6 m) → dự án nhận SBX-B → POST `lifecycle/obligation-transfers` **201**, biên nhận `2d3cdd96-4a69-4240-8dde-c29d54e275e4`.
- Dự án B → “Tiếp nhận nghĩa vụ” → chọn đề nghị lấy từ máy chủ → POST `lifecycle/obligation-transfer-acceptances` **201**, biên nhận `48c98851-42bf-4c36-87ef-29d6dc46238e`; danh sách đề nghị của B trống lại.
- GET độc lập lifecycle: A còn `transferable=678384f9`; B có `1df7aef7, f1a94258`; `actions` ghi `IssueTransfer`, `AcceptTransfer`. **Hậu quả dữ liệu test**: nghĩa vụ CRACK f1a94258 nay thuộc dự án B; BE chuyển kèm gói Fast Track 36a80018 và hạng mục e988cfc0 sang B (SBX-A không còn thấy gói này). Muốn thử Fast Track phải dùng `pm-b` trên SBX-B.

### 12.11 Không kiểm được (cần dữ liệu từ thao tác Crew/mobile hoặc chưa có nguồn)
- W07 nghiệm thu / ký / an toàn / sửa đổi / kế nhiệm / hủy / đóng khiếm khuyết (`defect-closures`): hạng mục chưa qua thi công và nộp kết quả của Crew.
- W04 ghi nhận tái phát (`KEEP_NEW` + `recurrence`): chưa có AI detection mới ở trạng thái chờ thẩm định (kết quả run 12.5 `66e3fc60` chưa có candidate đọc được qua Web: GET `/ai-candidates` danh sách 404).
- W10 read-batch thông báo: PM/Giám sát hiện 0 thông báo.
- W09: thiết bị/offline thuộc mobile, bỏ qua theo yêu cầu.

## 13. Tổng hợp vòng nghiệm thu 2026-11-19 (không gồm mobile)

Quy ước: **Đạt** = POST qua UI thật và đã đọc lại trạng thái lưu trữ bằng GET. Mobile/Crew/Operator/Reporter nằm ngoài phạm vi.

### 13.1 Bảng trạng thái theo luồng
| Luồng | Nội dung đã chạy | Kết quả | Mục |
|---|---|---|---|
| W01 | Gửi lời mời, nhận lời mời qua Mailpit (CREW, PM), PM đăng nhập Web, Giám sát lưu tổ chức | **Đạt** | 12.8 |
| W02 | PM khai báo, Giám sát xác nhận hoàn thành thi công; lifecycle `CONFIRMED` | **Đạt** | 12.4 |
| W04 | `KEEP_NEW`, `REJECT`, `LINK_EXISTING`; xác nhận phủ đường 1–2 m và 5–6 m | **Đạt** | 12 |
| W04 | Ghi nhận tái phát (`KEEP_NEW` + `recurrence`) | Chưa kiểm: chưa có detection chờ thẩm định | 12.11 |
| W05 | Tạo lượt chạy AI trên bộ dữ liệu → SUCCEEDED | **Đạt** | 12.5 |
| W06 | Duyệt đo | Chưa kiểm: cần Crew nộp kết quả (mobile) | 12.7 |
| W07 | Giám sát duyệt hạng mục Normal; PM giao hạng mục Normal | **Đạt** | 12, 12.1 |
| W07 | Xuất hồ sơ DOSSIER theo gói (PM) | **Đạt** | 12 |
| W07 | Chuyển và tiếp nhận nghĩa vụ giữa dự án | **Đạt** | 12.10 |
| W07 | Nghiệm thu, ký, an toàn, sửa đổi, kế nhiệm, hủy, đóng khiếm khuyết | Chưa kiểm: cần thi công và nộp kết quả của Crew | 12.11 |
| W08 | Fast Track `assign` | **Chưa đạt**: 409 `source_not_ready`, chặn bởi BE | 12.2 |
| W09 | Thu hồi thiết bị, grant | Bỏ qua (mobile/offline) | 12.11 |
| W10 | Đánh giá lưu trữ mới (có nút mới) | **Đạt** | 12.9 |
| W10 | Bật phong tỏa pháp lý | **Đạt**; gỡ không được (thiếu API BE) | 12.6 |
| W10 | Xác nhận căn cứ lưu trữ | Chưa đạt: 409 `retention_inventory_incomplete` từ BE | 12.6 |
| W10 | Đánh dấu đã đọc thông báo | Chưa kiểm: chưa có thông báo | 12.11 |

### 13.2 Danh sách lỗi/thiếu phía BE (để gửi BE)
| # | API | Hiện tượng | Đề nghị |
|---|---|---|---|
| 1 | Fast Track `POST …/items/{id}/assign` (nguồn SURVEY) | 409 `source_not_ready`. Cần `Surveys.Id`, mà không API Web nào trả `surveyId` cho AI detection/candidate. Correlation `8b13ce7b-b974-469e-a145-4828db326157` | Trả `surveyId` trong AI candidate/detection cho Web, hoặc cho assign Fast Track suy nguồn từ link KeepNew |
| 2 | `GET/POST /projects/{p}/exports` | Giám sát bị 403 `access_forbidden` (PM được). Correlation `3781c289-d36d-4e57-bd77-50e8124b2dff` | Mở quyền cho Giám sát nếu tài liệu 05_Web yêu cầu; hiện FE ẩn nút theo BE |
| 3 | Retention holds | Chỉ có `POST /retention/holds`, `GET /retention/holds/{id}`, `POST …/release`. Không có API liệt kê; `retention/files/{id}` chỉ trả `activeHoldCount`. Sau khi mất `holdId` thì không gỡ được từ Web | Thêm `GET /retention/holds?projectId=` hoặc trả `activeHoldIds` |
| 4 | `GET /users/{self}/organization` | PM bị 403; PM chưa thuộc dự án nào không đọc được tổ chức của chính mình | Cho đọc tổ chức của chính mình, hoặc trả trong `/profile` |
| 5 | `GET /projects/{p}/lifecycle` | Trường `history` luôn rỗng dù `actions` có đủ bản ghi | Xác nhận `history` có cần chứa các hành động không |
| 6 | `GET /invitations` (Giám sát) | Trả 405 | Xác nhận đường danh sách lời mời nếu FE cần hiển thị |
| 7 | `GET /projects/{p}/ai-candidates/{id}` | Cookie web 401 (chỉ Bearer); danh sách `GET /ai-candidates` trả 404 | Mở cookie Web cho đọc candidate và thêm đường danh sách |
| 8 | AI run (`ai-mock-runs`) | Không có danh mục model/tiền xử lý/cấu hình; PM phải nhập tay đúng giá trị | Cung cấp API danh mục hoặc ghi rõ giá trị hợp lệ |
| 9 | `PUT retention/files/{id}/basis` | 409 `retention_inventory_incomplete` vì `inventoryComplete=false`, lifecycle `OBLIGATION_INVENTORY_NOT_VERIFIED` | Cho biết đường để kiểm kê hoàn tất trên Web, hoặc xác nhận đây là chặn đúng nghiệp vụ |
| 10 | Chuyển nghĩa vụ (`lifecycle/obligation-transfer-acceptances`) | Gói/hạng mục chuyển sang dự án nhận vẫn mang `projectId` dự án gửi; khiếm khuyết gốc không đi theo (xem mục 14.1) | Cập nhật `projectId` khi chuyển hoặc chuyển kèm khiếm khuyết |

### 13.3 Dữ liệu test cần lưu ý (xem `TEST-DATA-LEDGER.md`)
- Phong tỏa pháp lý trên SBX-A vẫn **đang hiệu lực**, không gỡ được từ Web (lỗi BE số 3).
- Nghĩa vụ CRACK `f1a94258` đã **chuyển sang SBX-B** và BE chuyển luôn gói Fast Track `36a80018` / hạng mục `e988cfc0` sang SBX-B (đã kiểm bằng GET repair-packages của SBX-B bằng quyền Giám sát). SBX-A chỉ còn gói Normal `b5968126`.
- Lifecycle SBX-A đã `CONFIRMED` xây dựng, không hoàn tác.
- Tài khoản test mới: `test-fe-invite@roadguard.test` (CREW), `test-fe-pm@roadguard.test` (PM, tổ chức `Ban QLDA TEST-FE`).

## 14. Vòng kiểm thử lại 2026-11-21 (sau khi máy khởi động lại)

Môi trường: Docker Desktop và các container `roadguard-new-*` được bật lại, dữ liệu test còn nguyên. Cổng 5173 của máy đang bị ứng dụng khác chiếm nên Vite của dự án chạy ở cổng 5180 (`RG_BASE=http://localhost:5180`). `node_modules` bị mất và đã cài lại bằng `npm ci`. Harness kiểm thử giao diện được dựng lại trong dự án tại `tools/e2e/` (chạy: `bash tools/e2e/run.sh <script>.mjs`).

| Lớp kiểm thử | Script | Kết quả |
|---|---|---|
| Duyệt toàn bộ route PM và Giám sát (40 route): không lỗi JS, không 5xx, không màn trống | `tools/e2e/smoke-routes.mjs` | **Đạt 40/40** |
| Đọc lại trạng thái đã lưu ở BE sau các luồng W01, W02, W04, W05, W07, W08, W10 | `tools/e2e/readback-state.mjs` | **Đạt 13/13** |
| Điều khiển và thao tác an toàn lặp lại trên giao diện (W01, W02, W05, W07, W08, W10): xuất hồ sơ gói, chạy đánh giá lưu trữ, link mời sai | `tools/e2e/flows-ui.mjs` | **Đạt 20/20** |
| Script kiểm tra tĩnh cũ `tools/check-*.cjs` (75 script) | từng file | 42 đạt, 33 lỗi — xem dưới |

### 14.1 Phát hiện mới
- **Lỗi BE #10 — chuyển nghĩa vụ để lại dữ liệu lệch dự án.** Sau khi chuyển nghĩa vụ `f1a94258` từ SBX-A sang SBX-B, BE liệt kê gói `36a80018` và hạng mục `e988cfc0` trong `GET /projects/{B}/repair-packages` nhưng cả hai vẫn mang `projectId` của SBX-A (`…0001`); khiếm khuyết gốc `551b7ad0` vẫn ở SBX-A (GET qua dự án B trả 404). FE kiểm `projectId` của từng bản ghi nên báo “Danh sách sai phạm vi dự án hoặc trùng bản ghi”, màn Fast Track của `pm-b` hiện 0 hồ sơ và hạng mục hợp lệ `15bbab72` cũng bị che. FE chặn đúng theo hợp đồng nên **không nới lỏng**. Đề nghị BE cập nhật `projectId` của gói/hạng mục khi chuyển nghĩa vụ, hoặc chuyển cả khiếm khuyết gốc.
- **Hệ quả cho dữ liệu test:** phép thử chuyển nghĩa vụ ở mục 12.10 làm Fast Track của SBX-B tạm không thử được qua giao diện cho đến khi BE xử lý lỗi #10.
- Đã sửa ghi chú sai ở mục 13.3 và `TEST-DATA-LEDGER.md` (trước đó ghi gói Fast Track vẫn ở SBX-A).

### 14.2 Script kiểm tra tĩnh cũ (33 lỗi) — không phải lỗi sản phẩm
Các script này nạp mã nguồn vào sandbox `vm` kèm bộ mock tự viết. Nguyên nhân lỗi đã kiểm:
- 4 script cần kho git hoặc đường dẫn cũ `D:\ConnectAPI\nối api đồ án\RoadGuard-web-5180ab9` (không tồn tại trên máy này).
- Khoảng 20 script dừng ở “Mock …/Unmocked …” vì component hoặc module mới (ví dụ `HandoverAttachCard`, `DefectStatisticsPanel`, `react-router-dom`) chưa có trong bộ mock; các kiểm tra trước đó trong cùng script vẫn PASS.
- Một số script dùng `devFileBearerEnabled` đã bị gỡ hoặc thiếu `AbortController` trong sandbox.
- `verify-intake-runtime.cjs` là công cụ tạo dữ liệu cần cờ `--prepare-*`, không phải test.
Chưa sửa bộ mock vì các luồng tương ứng đã được kiểm bằng giao diện thật ở trên; việc cập nhật mock là việc dọn dẹp riêng.
Build và type-check: `npx tsc --noEmit -p .` và `npx vite build` sạch (kiểm ở mục 13 và không đổi mã sản phẩm trong vòng này).

## 15. Vòng chỉnh sửa theo `Chinhsua.docx` và BE mới (develop c0c99ca) — 2026-11-22

BE mới ở `D:\ConnectAPI\RoadGuardSystem-develop (1)\RoadGuardSystem-develop`, dựng bằng docker compose project `roadguard-v3` (container `roadguard-v3-*`, API `https://localhost:18443`), dữ liệu **seed mới** (không còn dữ liệu của stack `roadguard-new`). Vite chạy ở cổng 5180. Hợp đồng: `docs/contracts/openapi.json` đã thay bằng bản BE mới (bản cũ: `openapi.old-20261121.json`). Báo cáo chi tiết từng cụm: `fe-theo-be/E1-…`, `E2-…`, `E3-…`, `E4-…` (cùng thư mục).

### 15.1 Yêu cầu trong `Chinhsua.docx` — kết quả
| Yêu cầu | Kết quả (kiểm trên BE mới) |
|---|---|
| Form chính sách Fast Track tự đóng sau khi công bố | Đã làm (E3) |
| Giao lại đợt bay không chọn lại Operator hiện tại; báo rõ và khóa xác nhận nếu không còn ai | Đã làm; kiểm: danh sách không chứa Operator hiện tại, có thông báo, nút khóa (6/6). Chưa kiểm nhánh có từ 2 Operator (seed chỉ có 1) |
| Gỡ phong tỏa pháp lý có ô nhập lý do | Đã làm; kiểm: bỏ trống bị chặn, có lý do thì `release` 200, `activeHoldCount` về 0 |
| FIELD: bỏ ô "Phương pháp & Thiết bị đo" và điều kiện bắt buộc; giữ "Ghi chú chỉ dẫn" | Đã làm (E1); kiểm giao diện, chưa tạo FIELD thật vì lỗi BE #11 |
| Loại đo 5, 6; guard 1..6; kiểm tạo và đọc lại | FE đã đủ 1–6. **Tạo/giao với loại 5 hoặc 6 bị BE trả 500 (lỗi BE #11)** nên chưa đọc lại được |
| Thông báo validation sai nguồn ("Lỗi từ máy chủ CSDL") | Đã làm: lỗi nhập liệu báo đúng trường, lỗi máy chủ kèm HTTP và `code` |
| Giao lại Crew khác: loại Crew hiện tại, khóa khi không còn ai | Đã làm (E1); chưa kiểm với dữ liệu Crew thật |
| Nút tái sử dụng ảnh khi cần bổ sung | Đã làm (E1); chưa kiểm với dữ liệu Crew thật |
| Hợp nhất chi tiết FIELD; phân biệt đã nộp / có giá trị / READY / Completed / Defect VERIFIED; nhãn "ĐÃ CÓ SỐ ĐO" không còn khi `value: null` | Đã làm (E1); chưa kiểm với bản nộp thật (cần Crew mobile) |
| Đổi nhãn "Phương pháp đo" thành "Loại đo yêu cầu" | Đã làm; kiểm giao diện đạt |
| Danh sách phân biệt chưa có quyết định và "Đã ghi nhận" | Đã làm (E2); kiểm KEEP_NEW thì hiện "Đã ghi nhận" và "Defect: OPEN" (15/15). Giới hạn BE #12 |
| Case OPEN sau bổ sung: "Đã mở lại do có bổ sung", kết luận cũ vào lịch sử, mở form thẩm định | Đã làm (E2), kiểm bằng Case thật; chưa kiểm gửi kết luận mới trên Case mở lại |
| Modal duyệt gói: đọc `repairPlan`, `checklistVersion`, lỗi tải riêng | Đã làm (E3) |
| Nút "Giao việc" từ danh sách/modal sang màn giao Normal | Đã làm; chạy thật: duyệt rồi giao Normal, POST assign 201 |
| Bố cục modal không tràn | Đã làm; đo 0 phần tử tràn ngang |
| Nhãn tiến độ "1/1 — 100%" | Đã đổi thành "Quyết định phê duyệt", kèm "Chưa giao Crew — chưa thi công" |
| Gộp hai ô phương án thành một | Đã làm; `repairPlan` đọc lại khớp (Normal và Fast Track) |
| Fast Track nguồn Reporter: ô "Hồ sơ nguồn khảo sát" trống | Đã sửa ánh xạ: FE tự dựng nguồn Reporter và Survey, không cần FIELD giả; **POST assign 201** (Reporter ở SBX-B, Survey ở SBX-A, `surveyId` từ `GET /datasets/{id}`) |

### 15.2 Thay đổi theo BE mới
- **Fast Track nguồn Survey:** BE mới trả `surveyId` thật trong `GET /datasets/{id}`, assign 201. Lỗi BE #1 cũ **đã hết**.
- **Sau chuyển nghĩa vụ:** FE dùng `lifecycle.responsibilities[].packageId/currentRepairItemId` và chấp nhận bản ghi mang `projectId` gốc (BE nói đó là provenance, nên lỗi BE #10 cũ chuyển thành thiết kế). Giới hạn ở #13 bên dưới.
- **Hoàn tất nhiệm vụ khảo sát:** nối lệnh mới `POST /survey-tasks/{id}/complete` (PM chọn bản nộp, đọc đánh giá hiện hành, xác nhận). Kiểm: POST 200, GET `COMPLETED` (8/8).
- **Lưu trữ:** chi tiết tệp hiển thị từng mã `inventoryReasonCodes` kèm giải thích và người xử lý (mục 3 handoff). Đã kiểm với `WARRANTY_OBLIGATION_MISSING`.
- **Seed của BE mới** vẫn thiếu bước `submit` hình học (lỗi 409 giống lần trước); đã vá trong container, không sửa mã BE.

### 15.3 Lỗi/thiếu phía BE — cập nhật sau đợt này
| # | API | Hiện tượng | Đề nghị |
|---|---|---|---|
| 11 | Tạo/giao FIELD với `requiredMeasurementType` 5 hoặc 6 (`POST …/field-inspection-tasks`, `POST …/items/{i}/assign`) | **HTTP 500**, log `SqlException 51133 "FIELD task source or geometry scope is invalid."`. Nguyên nhân (đã xác nhận trong mã BE): trigger SQL `TR_FieldInspectionTasks_H3Scope` (migration `20261009043010_AllowVerifiedDefectPostRepairTasks.cs`) vẫn có điều kiện `RequiredMeasurementType NOT IN (1,2,3,4)`, migration mới nhất (`20261117183505`) không định nghĩa lại. Trái với handoff mục 4 (mã 1–6). Loại đo 1 thì assign 201 | Cập nhật trigger/constraint cho mã 5, 6 bằng migration mới; handoff ghi "không migration mới" là chưa đúng |
| 12 | Quyết định Report → Defect | Không có API tra quyết định hiện hành theo nguồn Report (chỉ `GET candidate-decisions/{decisionId}`), nên nhãn "Đã ghi nhận" chỉ hiện khi phiên còn nhớ `decisionId`; ghi nhận lại trong phiên mới nhận 409 `invalid_state_transition` | Thêm tra cứu theo nguồn, hoặc trả `decisionId`/trạng thái quyết định trong candidate/case |
| 13 | Assign sau chuyển nghĩa vụ (dự án nhận) | PM dự án nhận không đọc được defect (`defects/{id}` 404, `source-defect` 404), chính sách và Crew của dự án gốc (403), nên FE không dựng được body assign. Handoff nhắc "bộ reference đã bàn giao" nhưng không có API Web cấp bộ này | Trả `defectVersion`, `routeVersionId`, `policyRevisionIds`, Crew hợp lệ trong `lifecycle.responsibilities[]`, hoặc cấp đọc có giới hạn |
| 14 | Seed `deploy/fe-handoff/demo_ai.py` | Thiếu `POST …/road-geometry-drafts/{id}/submit` trước `confirm`, seed dừng ở `input-ai-confirm-a` (409) | Thêm bước submit và dùng ETag đọc lại |
| 15 | Report không có vị trí / Case phân loại thiếu phạm vi hình học | `GET /candidates?sourceKind=REPORT…` trả 409 `source_not_ready`, không ghi nhận KEEP_NEW được (correlation `32517278-3374-488c-8b3f-b6480193151a`, `5a073f9c-4871-4697-a6ea-1b94b8d3ae9a`) | Xác nhận đây là chặn đúng nghiệp vụ; nếu có đường bổ sung vị trí/phạm vi thì nêu rõ |

Các mục #2–#9 ở 13.2 giữ nguyên; riêng #1 đã hết, #10 là thiết kế (provenance) theo handoff, #9 BE giải thích `inventoryComplete` do BE tự tổng hợp (FE chỉ hiển thị mã lý do).

### 15.4 Kiểm thử đợt này
| Lớp | Kết quả |
|---|---|
| `npx tsc --noEmit -p .`, `npx vite build` | Sạch |
| Duyệt route PM và Giám sát (`smoke-routes.mjs`) | Đạt |
| Đọc lại (chỉ GET), không phụ thuộc dữ liệu (`readback-state.mjs`) | Đạt 17/17 |
| Điều khiển và thao tác an toàn trên giao diện (`flows-ui.mjs`) | Đạt 21/21 |
| E1 FIELD (`e1-field.mjs`, phần không cần dữ liệu Crew) | Đạt 6/6 |
| E2 Case (`e2-case.mjs`) | Đạt 15/15 |
| E3 gói sửa chữa và Fast Track (`e3-repair.mjs`, `e3-ft.mjs`) | Đạt (assign Normal 201, Fast Track Reporter 201, Survey 201) |
| E4 (`e4-misc.mjs` 10/10, `e4-survey.mjs` 8/8, `e4-reassign.mjs` 6/6) | Đạt |

Các kịch bản E-* tạo dữ liệu nên không chạy lại được trên cùng dữ liệu (ví dụ nhiệm vụ khảo sát đã COMPLETED); muốn chạy lại cần seed mới.

### 15.5 Chưa kiểm được trong đợt này
- FIELD với dữ liệu Crew thật (giao lại Crew, tái sử dụng ảnh, khối hợp nhất, các mức READY/Completed): cần bản nộp từ mobile.
- Tạo FIELD loại đo 5/6 và đọc lại: bị lỗi BE #11.
- Fast Track sau chuyển nghĩa vụ phía PM dự án nhận: bị lỗi BE #13.
- Gửi kết luận mới trên Case đã mở lại; giao lại Operator khi có từ 2 Operator.

## 16. Vòng chỉnh sửa "Cập nhật mới 5h37" của `Chinhsua.docx` — 2026-11-22

Môi trường như mục 15 (BE `roadguard-v3`, seed mới, Vite cổng 5180). Báo cáo chi tiết: `fe-theo-be/E5-KHAOSAT-KEHOACH-20261122.md`, `E6-AI-THEO-DOI-20261122.md`.

### 16.1 Yêu cầu và kết quả
| Yêu cầu | Kết quả (kiểm trên BE mới) |
|---|---|
| 1. Thông báo 409 rõ nguyên nhân khi tạo kế hoạch trùng | Đã làm. Sau 409, FE đọc `GET survey-plans` và đối chiếu kế hoạch đang hoạt động cùng tuyến, bộ phân đoạn, dải; nếu xác định được thì báo trùng kèm nút "Mở kế hoạch KH-…", nếu không thì không kết luận trùng, chỉ báo mã chung và `correlationId` (BE dùng chung `duplicate_request` cho nhiều xung đột). Kiểm: tạo trùng kế hoạch seed → 409 → thông báo và nút mở đúng (8/8) |
| 2. Theo dõi AI ngay sau khi tạo | Đã làm: khung theo dõi giữ lần chạy vừa tạo, tự đọc lại mỗi 3 giây (tối đa khoảng 5 phút, dừng khi rời màn), hiện `errorCode` của BE khi thất bại, hiện riêng "Mã lần chạy AI (runId)" và "Mã job xử lý (processingJobId)", không bắt nhập GUID. Khi SUCCEEDED, nút "Mở kết quả thẩm định" chuyển tới `/pm/surveys/{taskId}?run=…&dataset=…` và chỉ đọc phát hiện của đúng lần chạy; thao tác thẩm định giữ nguyên. Kiểm: POST 202, runId khác processingJobId và khớp GET, F5 vẫn thấy lần chạy, tự lên SUCCEEDED, số phát hiện khớp kết quả BE (16/16) |
| 3. Form kẹt sau lỗi tạo kế hoạch | Đã làm. Nguyên nhân gốc: `catch` luôn ghi journal kể cả khi lỗi xảy ra trước khi gửi lệnh. Nay 4xx dứt khoát giải phóng journal; "Hủy bỏ" và F5 đối chiếu bằng GET rồi giải phóng khi an toàn; nếu đã tạo kế hoạch thì tiếp tục đúng bước, không tạo trùng; kết quả chưa rõ thì giữ nguyên key/body. Kiểm: F5 và Hủy bỏ giải phóng journal (5/5); tạo kế hoạch hợp lệ 201 rồi nhiệm vụ 201, GET đọc lại đúng (3/3) |
| 4. Phân biệt kế hoạch/nhiệm vụ | Đã làm: nhãn KẾ HOẠCH / NHIỆM VỤ / Bổ sung, mã rút gọn `KH-…`/`NV-…`, lịch bay hoặc hạn hoàn thành, phạm vi, Operator, nút mở kế hoạch/nhiệm vụ gốc–con, tìm theo mã rút gọn (9/9). **Loại Cơ sở/Định kỳ/Đột xuất chưa hiện được vì BE không trả `surveyType` khi đọc** (lỗi BE #16); FE ghi "BE chưa trả loại khảo sát" |

Phát hiện kèm theo (E5): tuyến cũ `DEMO-A` của SBX-A có hình học `LEGACY_INCOMPLETE` từng làm trang tạo yêu cầu báo "Geometry chưa COMPLETE" cho cả dự án; FE nay bỏ qua tuyến này kèm thông báo.

### 16.2 Lỗi/thiếu phía BE — bổ sung
| # | API | Hiện tượng | Đề nghị |
|---|---|---|---|
| 16 | `GET survey-plans`, `GET survey-tasks` và chi tiết | Không trả `surveyType` (Cơ sở/Định kỳ/Đột xuất), nên FE không hiện được loại khảo sát và không so được "cùng loại" khi giải thích 409 | Trả `surveyType` trong DTO đọc |
| 17 | `POST survey-plans` / `survey-tasks` | `duplicate_request` dùng chung cho nhiều loại xung đột (trùng kế hoạch, cùng key khác nội dung…), correlation ví dụ `58900b1d-bae5-40a5-b008-5668a893b862` | Mã/ý nghĩa riêng cho từng loại xung đột, hoặc trả đối tượng trùng (id kế hoạch hiện có) |
| 18 | Danh sách nhiệm vụ (`SurveyTaskSummary`) | Thiếu `parentTaskId` nên danh sách không tự nối được nhiệm vụ gốc–con (chi tiết thì có) | Thêm `parentTaskId` vào bản tóm tắt |

### 16.3 Kiểm thử đợt này
| Lớp | Kết quả |
|---|---|
| `npx tsc --noEmit -p .`, `npx vite build` | Sạch |
| Duyệt route PM và Giám sát (`smoke-routes.mjs`) | Đạt |
| Đọc lại không phụ thuộc dữ liệu (`readback-state.mjs`) | Đạt 17/17 |
| Điều khiển giao diện (`flows-ui.mjs`) | Đạt 21/21 |
| E5 `e5-survey-plan.mjs` | Đạt 25/25 |
| E6 `e6-ai-run.mjs` | Đạt 16/16 |

### 16.4 Chưa kiểm được
- Lần chạy AI ở trạng thái FAILED và RUNNING: BE chặn dữ liệu sai ngay ở POST (422 `ai_contract_invalid`) và seed xử lý quá nhanh nên không có lần chạy FAILED hay RUNNING nào để quan sát; đoạn hết hạn tự đọc lại cũng chưa chạy.
- Nhánh "đã tạo kế hoạch nhưng giao nhiệm vụ bị 4xx" và nhánh timeout thật của form tạo yêu cầu: logic có trong mã, chưa chạy với lỗi thật.
