# Nghiệm thu FE Web (PM `/pm/*`, Giám sát `/sup/*`) — bản mới nhất 2026-11-26

Phạm vi: Web, không gồm Mobile. Yêu cầu nguồn: `ChinhSuaFE.docx` (26/11). Đối chiếu BE `RoadGuardSystem-develop (1)` (tài liệu nêu các mốc 1a2520f → 8d7595a → 7148088, 19 migration, gồm `ReporterRoutingMap`, `TemporarySafetyResolution`).
Môi trường kiểm: Docker compose `roadguard-v5` (DB mới, seed bằng script BE đã sửa B14), API https://localhost:18443, Vite http://localhost:5180. Bản cũ lưu ở `archive/NGHIEM-THU-THEO-LUONG.cu-20261126.md` (và `…cu-20261122.md`).
FE không có git nên không có commit/SHA; mốc bàn giao là thư mục FE này. Báo cáo chi tiết từng nhóm: `fe-theo-be/H1-case-routing`, `H2-acceptance`, `H3-repair-safety-export`, `H4-offline-branch-deadline` (đều `-20261126.md`), dữ liệu test ở `TEST-DATA-LEDGER.md` mục "B13 · H1–H4".

## 1. Kết quả kiểm chung
| Lớp | Kết quả |
|---|---|
| `tsc --noEmit -p tsconfig.json`, `npx vite build` | Sạch |
| Duyệt toàn bộ route PM và Giám sát (`smoke-routes.mjs`) | Đạt |
| Đọc lại không phụ thuộc dữ liệu (`readback-state.mjs`) | 17/17 (kỳ vọng "Giám sát đọc exports" đổi sang 200 vì BE đã cho phép) |
| Điều khiển giao diện (`flows-ui.mjs`) | 21/21 |
| e2e từng nhóm (`h1-*`…`h4-*`) | Xem bảng 2; mục nào chưa kiểm ghi ở mục 3 |

Ký hiệu: **Xong** = làm và kiểm trên BE thật; **Một phần** = làm nhưng có nhánh chưa kiểm; **Có sẵn** = đã làm ở vòng trước, kiểm lại vẫn đạt; **Chặn** = cần BE hoặc dữ liệu Mobile.

## 2. Yêu cầu ChinhSuaFE.docx — kết quả FE

### 2.1 Hộp thư tiếp nhận, bản đồ tuyến, matching (H1)
| Yêu cầu | Kết quả |
|---|---|
| Bản đồ MapLibre trong hồ sơ tiếp nhận, mọi tuyến/dự án công ty có nhãn tên dự án, chỉ bay tới GPS đúng ảnh của Reporter (`GET /company/road-map`, đọc đủ trang, ETag, `unavailableRoutes`) | Xong (hiện 4 tuyến / 2 dự án). Ảnh không có GPS thì bản đồ không điều hướng. PM không có bản đồ toàn công ty (BE 403) |
| Đối chiếu đúng ảnh `routing-candidates`; thiếu GPS ≠ ngoài phạm vi; UNKNOWN giữ UNKNOWN | Xong |
| Triage có căn cứ (Report, ảnh, tuyến, `geometryVersion` từ geometry-package); đọc lại `routingSource` | Xong. PM-triage chưa gửi căn cứ (chưa làm) |
| Quyết định tiếp nhận `routing-decisions` + lịch sử | `NEEDS_LOCATION_EVIDENCE` Xong. `OUTSIDE_COMPANY_SCOPE` Một phần: form attestation đủ Report, BE chặn 409 `routing_responsibility_unresolved`, FE hiện mã lỗi (nhánh 200 chưa kiểm) |
| B1 tìm mở rộng Defect (GET/POST matching-location; chưa tìm / không kết quả / lỗi) | Xong (xác nhận theo ảnh; chưa có UI xác nhận theo segment) |
| B2 tách liên kết nguồn / kết luận Case / công bố; KEEP_NEW không phải VERIFIED | Xong |
| CASE04–05 LINK_EXISTING, REJECT; HUY-BUG-004 (công bố có Defect / NO_DEFECT riêng); HUY-BUG-006 (Case OPEN) | LINK_EXISTING chạy được trên BE mới (6 ứng viên sau tìm mở rộng → 201). Phần còn lại Có sẵn |
| Dropdown "Loại khiếm khuyết" từ `GET /catalog/defect-types`, bỏ "Khác", tải/lỗi/thử lại, mã lạ không tự đổi | Xong |
| Dropdown "Mức độ nghiêm trọng" dùng enum + bảng nhãn chung (`utils/severity.ts`), không mặc định | Xong |
| Xoá dòng lý trình ngoài và badge "Chưa xác định ưu tiên" | Xong |
| Hiển thị đúng tên/SĐT/nội dung người gửi; bảng thông tin + GPS trên overlay ảnh | Xong (Reporter). Ảnh Crew xem mục 2.2 |
| Profile hiện đúng SĐT nhân sự Sup đã cập nhật (`GET /me/phone-number`) | Xong |
| Trang thiết lập mật khẩu mới: dùng lớp CSS không tồn tại → đổi sang lớp của Login | Chỉ kiểm tĩnh (cần tài khoản `mustChangePassword`, không đổi mật khẩu tài khoản seed) |
| B5 Giám sát: 403 ở quyết định PM hiển thị "không thuộc phạm vi được đọc", không coi là lỗi | Một phần (kiểm nhánh code + BE 403; chưa dựng được mission có quyết định PM) |

### 2.2 Nghiệm thu, chứng cứ, review (H2)
| Yêu cầu | Kết quả |
|---|---|
| Phân luồng review: task sửa chữa có binding dùng `POST …/tasks/{task}/attempts/reviews` (ACCEPT/SUPPLEMENT); FIELD đo riêng giữ review FIELD; không chặn bằng `readiness===READY` | Xong. SUPPLEMENT 7/7, ACCEPT 6/6 (bản nộp INCOMPLETE vẫn ACCEPT được); 1 POST mỗi lần, có GET đối soát; bước xác nhận cuối là lệnh riêng |
| HUY-BUG-001 đóng Fast Track (ACCEPT → đọc lại → final) | Có sẵn, chỉ kiểm bằng đọc code (chưa chạy e2e, xem mục 3) |
| Giao diện nghiệm thu theo dữ liệu thực (ảnh 4 trạng thái, bỏ ĐẠT/EXIF/K98/bảo hành mẫu, nút Sup khoá có lý do, đổi tên "Chấp nhận hồ sơ và trình Giám sát") | Có sẵn |
| Đối chiếu bản nộp #1 vs #2, lý do SUPPLEMENT, mốc thi công mỗi bản (B6) | Xong. Panel mới `SubmissionHistoryPanel`: review theo từng bản (bản #2 không mượn review bản #1), so sánh ảnh, mốc thi công. 23 kiểm tra PM + Sup |
| B7 đọc lại quyết định reuse sau F5/phiên mới | Xong: đọc `details.evidenceReuse` từ BE, không dựa sessionStorage |
| Modal tái sử dụng ảnh: toast không bị che (z-index 10050), lỗi trong modal, "Đã xác nhận tái sử dụng ảnh", chi tiết GUID/checksum mở rộng, mở lại hiện kết quả | Có sẵn + vá z-index. Chưa kiểm e2e (xem mục 3) |
| Ảnh thước đo phóng to không xem được | Xong (nguyên nhân: lightbox đọc `evidence_photo_url` không bao giờ được gán; còn dùng GPS/nhãn "Samsung" mẫu → đã bỏ). Lightbox lấy đúng ảnh đã chọn, số đo/GPS/thời điểm từ bản nộp, thiếu ghi "Chưa có dữ liệu". 7/7 |
| Slider so sánh trước/sau hiển thị đủ ảnh | Xong (`object-contain`, khung tối thiểu 320px) |
| Task Cancelled "Đã hủy"; thông báo 409 xung đột phạm vi; toast giao việc | Có sẵn |
| Gói đã nghiệm thu 1/1 nhưng hiện "Đã đóng gói: 0 / Đóng đợt ngay" | Xong theo contract: BE không có trạng thái đóng gói; bỏ chip "Đã đóng gói", nút thành "Xem kết quả nghiệm thu", hiện "Đã nghiệm thu xong" |
| GPS tọa độ từ Crew trên ảnh và bảng thông tin | Một phần: cột "Tọa độ GPS" lấy từ số đo; seed Crew không gửi tọa độ nên chưa thấy giá trị thật |

### 2.3 Đề xuất sửa chữa, an toàn tạm, xuất hồ sơ, Fast Track (H3)
| Yêu cầu | Kết quả |
|---|---|
| Thông tin nguồn Defect trong form đề xuất; khối "Xử lý ngoại lệ và hiệu chỉnh"; phản hồi sau phê duyệt Normal; nguồn khuyết tật và toast giao việc | Có sẵn (kiểm lại 11/11, 7/7, 9/9, 10/10); vá nhãn loại lỗi "tên — mã" |
| H14 yêu cầu sửa/từ chối đề xuất Normal (Giám sát) | **Chặn bởi BE** (mục 4 #1). FE giữ dòng giới hạn, không dùng correction thay thế |
| TemporarySafety: lấy nghĩa vụ, thêm nghĩa vụ, giao biện pháp | Có sẵn (11/11) |
| Kết thúc biện pháp an toàn tạm (resolve) `POST …/safety-measures/{m}/resolution` (If-Match, key, obligationVersion, journal retry) + lịch sử chỉ đọc | Xong 17/18 (201 → đọc lại `resolved=true`, nghĩa vụ đã resolved rời danh sách chọn). Chưa kiểm replay 200, retry timeout, `safetyContext` thật sau chuyển |
| B3/KHOA-TR03 đọc planning sau chuyển trách nhiệm; tách dự án gốc / dự án chịu trách nhiệm; "Không đọc được kế hoạch" | Xong 13/13: BE mới hết 404, PM-B đọc item/planning/source-defect/history dưới URL B (URL A → 403). Gói nhiều bên chỉ trả mã/phiên bản và FE không cho sửa |
| B10 hồ sơ bàn giao thiếu tệp (inventory), B15 lý do thiếu policy/coverage | B10 Có sẵn; B15 hiển thị mã `missingReasons` kèm giải nghĩa (kiểm gián tiếp) |
| Modal xuất hồ sơ: bỏ mô tả PDF/A, ISO 19005, TCVN, K98, RTK, checksum.sha256; bỏ checkbox checksum; ảnh gốc ↔ `includeOriginalFiles`; 403 báo "Bị từ chối quyền… chưa tạo job/chưa tải" | Xong (thông báo 403 mới kiểm mã/JSON qua API, chưa bằng request 403 thật trên UI) |
| Export theo tài nguyên `POST /projects/{responsibilityProjectId}/exports` → 202 → poll → chỉ `SUCCEEDED` mới tải | Xong: PM-A 7/7, PM-B xuất hạng mục nhận chuyển dưới URL B 202→SUCCEEDED→tải, Giám sát 6/6. API xác nhận PDF kèm originals → 422, repair + from/to → 422 (FE chặn trước) |
| Fast Track: chọn checklist từ policy đã publish, thiếu policy báo + nút tới cấu hình, giữ form; toast sau lập gói; chi tiết mục lỗi đủ thông tin | Xong 12/12 (thiếu policy), 14/14 (có policy) |
| Loại khiếm khuyết hiển thị thống nhất "tên — mã" từ danh mục API | Xong ở Fast Track, policy, panel đề xuất, source-defect. Màn thẩm định Defect do H1 xử lý dropdown danh mục |

### 2.4 Ngoại tuyến, tuyến nhánh, hạn bảo hành, khe co giãn (H4)
| Yêu cầu | Kết quả |
|---|---|
| FE-H5-01 revoke không phụ thuộc ETag/If-Match | Xong (21/21) |
| FE-H5-02 quyền thu hồi: PM chỉ thiết bị của chính mình, thiết bị Crew không có form | Xong |
| FE-H5-03 hiệu lực grant: còn hạn / hết hạn / đã thu hồi / thiếu thông tin; không áp hạn grant cho thiết bị | Xong |
| FE-H5-04 giữ key/body khi mất phản hồi; "Đối soát", "Gửi lại đúng yêu cầu"; không tự POST khi mount | Xong (mất phản hồi mô phỏng bằng chặn 504 ở trình duyệt, request chưa tới BE) |
| FE-H5-05 đọc lại sau cấp/thu hồi; FE-H5-06 bỏ response cũ khi đổi project/tab/tài khoản | Xong (đã thử đổi A→B lúc response A chậm) |
| FE-H5-07 chi tiết chỉ field nghiệp vụ; recipient theo fingerprint | Xong phần hiển thị; fingerprint kiểm bằng logic 9/9, chưa e2e |
| Cấp quyền bàn giao, Chuẩn bị gói ngoại tuyến cho Giám sát | **Chặn** (mục 4 #9): cần gói do Mobile tạo. Nút khoá, có giải thích, không dữ liệu giả |
| Tạo tuyến nhánh | **Chặn bởi guard BE** (mục 4 #8). FE thêm panel "Tuyến nhánh — trạng thái theo máy chủ" (tiền đề ✓/✗ kèm mã guard); nút "Lưu tuyến nhánh" đổi thành "Thêm nhánh xem trước (chưa lưu)"; không đụng tuyến chính/baseline/pin/CRS. 11/11 |
| Hạn theo bảo hành: Hạn xử lý FIELD, CreateSurvey, Hạn chót điều phối Normal | FIELD và CreateSurvey Xong e2e; AssignCrew đã sửa nhưng e2e chưa kiểm (SBX-B không có hạng mục Normal `ReadyToAssign`), mới kiểm logic hàm dùng chung. Dự án không đọc được bảo hành thì không chặn và ghi chú "chưa thể kiểm hạn" |
| "Chưa có thời hạn kế hoạch" ở menu phê duyệt gói | Xong: DTO có `plannedDueAt` nhưng không có số ngày → bỏ "N ngày"; hiện "Hạn kế hoạch dd/mm/yyyy" hoặc "Chưa nhập hạn kế hoạch" |
| Ẩn form khe co / khe giãn / độ hở khe | Xong (nằm trong `<details>` "Chú thích & thông số khe", mặc định thu gọn; contract giữ nguyên) |

### 2.5 Yêu cầu bổ sung ngoài docx
Nâng cấp hiệu ứng giao diện (chuyển trang, hover nâng thẻ, modal bật nhẹ, shimmer, tôn trọng giảm chuyển động): `fe-theo-be/UI-ANIMATION-20261126.md`. Chỉ thêm CSS toàn cục, không đổi bố cục/logic/toast.

## 3. Chưa kiểm được
- Fast Track đóng e2e (HUY-BUG-001) và giao việc Fast Track: BE trả 409 `published_policy_source_required` vì chưa có policy/độ phủ đã xuất bản cho hạng mục seed.
- Modal tái sử dụng ảnh e2e (cần reference KEEP_NEW trong phiên); GPS dương từ Crew (seed không gửi tọa độ).
- `OUTSIDE_COMPANY_SCOPE` nhánh thành công; B5 trên UI Giám sát có mission thật.
- Resolve an toàn: replay 200, retry timeout, `safetyContext` thật sau chuyển riêng nghĩa vụ safety.
- AssignCrew chặn hạn bảo hành e2e; thông báo 403 export bằng request thật; Giám sát không membership.
- Trang thiết lập mật khẩu mới ở tài khoản `mustChangePassword`.
- Điều phối ngoại tuyến: cấp grant và chuẩn bị gói (cần Mobile).
- Các lỗi BE cũ không được ChinhSuaFE nhắc lại (legal hold không liệt kê được, Report không vị trí → 409 `source_not_ready`…) chưa kiểm lại trên BE này. Một lỗi cũ đã tự hết: Giám sát đọc `GET /exports` hiện 200.

## 4. Lỗi / quyết định cần BE (không FE nào tự vá được)
| # | Vấn đề | Cần BE |
|---|---|---|
| 1 | Giám sát không có API yêu cầu sửa/từ chối đề xuất Normal: chỉ có `approve`; `cancellations`/`normal-successors` chỉ PM; `review-requests` chỉ PM/Crew; `corrections` là hiệu chỉnh quyết định đã có. Đường PM chỉnh và trình lại cũng chưa có | Quyết định có bổ sung API hay chốt giới hạn |
| 2 | Giám sát đọc được lý do SUPPLEMENT của PM (`field-inspection-tasks/{id}/history details.reviews`, `repair history.attemptReviews`), trong khi `WEB-B-READ-CONTRACTS` mục B5 nói không mặc định đọc quyết định/lý do riêng của PM | Xác nhận chủ ý hay hở quyền |
| 3 | Bản nộp REPAIR_CLAIM luôn `readiness=INCOMPLETE` (`AFTER_ATTEMPT_BINDING_UNAVAILABLE`) dù PM ACCEPT được | Xác nhận đúng thiết kế (FE đã không dùng readiness FIELD làm điều kiện chặn review sửa chữa) |
| 4 | Không có trạng thái/endpoint "đóng gói" cho gói đã nghiệm thu 100% (gói D99A8AF2) | Nếu nghiệp vụ cần "đóng đợt" thì BE cung cấp; FE đã bỏ nút/nhãn gây hiểu nhầm |
| 5 | Submission chỉ có `capturedAt` ở mức ảnh; tọa độ GPS chỉ ở mức số đo, không có GPS/EXIF từng ảnh | Xác nhận, hoặc cung cấp nguồn GPS từng ảnh nếu cần hiển thị trên ảnh Crew |
| 6 | `routing-candidates` trả `spatialRelation`/`uncertaintyStatus`, không có `distanceStatus`/`overlapStatus` như tài liệu yêu cầu (chỉ có ở `GET /projects/{p}/candidates`); luôn `completeness=INCOMPLETE` + `SPATIAL_DISTANCE_IS_NOT_RESPONSIBILITY` dù đã đọc hết trang | Xác nhận trường thật và ý nghĩa `INCOMPLETE` |
| 7 | `Case.defectIds=[]` sau KEEP_NEW đến khi kết luận CONFIRMED; chưa có API đọc Report→Defect lâu dài ngoài reference trong sessionStorage + `historySummary.sourceLinkCount` (B2) | Xác nhận nguồn đọc bền vững |
| 8 | Tuyến nhánh: BE chỉ lập nhánh bằng draft `NATIVE_ALIGNMENT` `routeKind=BRANCH`, mỗi dự án chỉ một hồ sơ trình (`GeometryWorkflowPersistenceService.cs` dòng 163-164, 204-205, 368-369). Tuyến chính đã trình/xác nhận → draft mới 409 `road_geometry_submission_locked` (correlation `f4f3d44f-e70e-4bf5-b73a-4a8c3143d703`). Tuyến cha seed (SBX-A/B) là legacy: `routeKind/routeSystemId/crsProfileRevisionId = null`. Dự án "nghiệm thu 2" không có trên stack seed | Xác nhận có cho lập nhánh sau khi tuyến chính đã xác nhận không và theo luồng nào |
| 9 | Ngoại tuyến: cấp grant và chuẩn bị gói cần gói do Mobile tạo + manifest đã ký | Kênh cung cấp gói/manifest để Web retest |
| 10 | Seed chỉ có độ phủ TEST_ONLY, trách nhiệm UNKNOWN nên `OUTSIDE_COMPANY_SCOPE` luôn 409 `routing_responsibility_unresolved`; Fast Track chưa có policy/độ phủ xuất bản | Cung cấp dữ liệu độ phủ REAL_SOURCE và policy xuất bản cho hạng mục thử |
| 11 | `transferableObligations` vẫn liệt kê nghĩa vụ TemporarySafety `7458e39f` đã resolved | Xác nhận lỗi hay chủ ý |
| 12 | Export sau chuyển A→B: Giám sát gọi `/projects/A/exports` → 422 `export_source_unavailable`, `/projects/B/exports` → 403 | Xác nhận đúng chủ đích (chỉ PM-B xuất) |
| 13 | `GET /projects/B/repair-packages` của PM-B không liệt kê gói nhận chuyển (FE bù bằng lifecycle) | Xác nhận |
| 14 | `WEB-B-COMPLETION.md` nói PM đọc `eligibleEvidenceLinks`, thực tế chỉ Crew nhận (`RepairSafetyRepository.cs:89`); PM lấy từ `checks[].evidenceLinkIds` | Đồng bộ tài liệu |
| 15 | `POST /projects/{p}/warranties` thiếu `handoverDocumentId` vẫn trả 201 (quan sát, chưa chốt là lỗi) | Xác nhận |

Các lỗi trong bản nghiệm thu trước nay đã được BE xử lý và FE đã tích hợp: planning 404 sau chuyển nghĩa vụ, LINK_EXISTING không có ứng viên, đọc lại quyết định reuse, hồ sơ bàn giao thiếu tệp (inventory), resolve an toàn tạm, script seed geometry (B14), quyền Giám sát đọc exports.

## 5. Dữ liệu test đã tạo (không hoàn tác được; chi tiết `TEST-DATA-LEDGER.md` mục B13)
- H1: nhiều Case, quyết định tiếp nhận `NEEDS_LOCATION_EVIDENCE`, triage, quyết định candidate (LINK_EXISTING/KEEP_NEW), Defect OPEN từ KEEP_NEW.
- H2: hạng mục Normal `7a7d62f3` (task `3b974b27`) đã SUPPLEMENT → bản bổ sung #2 → ACCEPT, trạng thái Reviewed, chưa final-confirmation.
- H3: Defect `dd9b3488`, `b6245439` (CRACK), `32721167` (POTHOLE); gói Normal `066a69a4` đã chuyển nghĩa vụ A→B; nghĩa vụ safety đã resolved ở A; policy POTHOLE rev2–4 đã thu hồi, rev5 (`7b2cfaf4`) đang PUBLISHED; gói Fast Track cho Defect `09d6176a` (checklist `TEST-FE-H3-CL1`); vài job export ZIP/PDF.
- H4: hồ sơ bảo hành PROJECT trên SBX-B `e432f976…` (2026-10-01 → 2027-03-31); khoảng 12 đăng ký thiết bị PM-a và 3 Crew-a trên SBX-A (6 đã thu hồi).

## 6. Chạy lại
```
cd tools/e2e   # harness puppeteer-core + Edge
export RG_BASE=http://localhost:5180
bash run.sh smoke-routes.mjs ; bash run.sh readback-state.mjs ; bash run.sh flows-ui.mjs
bash run.sh h1-case-routing.mjs <prep|sup|pm|pmlink|pmconf> ; bash run.sh h1-ui-misc.mjs <b5|profile|force|verify>
bash run.sh h2-review.mjs <supplement|accept> ; bash run.sh h2-lineage.mjs ; bash run.sh h2-lightbox.mjs
bash run.sh h3-*.mjs ; bash run.sh h4-offline.mjs ; bash run.sh h4-branch.mjs
```
BE: `docker compose -p roadguard-v5 -f compose.yaml -f compose.https.yaml up -d --build` trong `deploy/fe-handoff` của BE. Nâng cấp tại chỗ DB cũ lên BE mới bị crash exit 139, nên dùng project mới (volume mới). Docker Desktop phải bật tay sau khi khởi động lại máy.
