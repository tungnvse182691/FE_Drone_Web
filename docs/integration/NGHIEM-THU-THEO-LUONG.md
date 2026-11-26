# Nghiệm thu FE Web (PM `/pm/*`, Giám sát `/sup/*`) — bản mới nhất 2026-11-24

Phạm vi: Web, không gồm Mobile. Đối chiếu BE `RoadGuardSystem-develop (1)` (develop, có migration `20261123093000` và `20261123093100`, `handover-documents`, `temporary-safety-obligations`, `survey-plans/{id}/complete`) và yêu cầu trong `Bosung.docx`.
Môi trường kiểm: Docker compose `roadguard-v4` (DB mới, seed lại; nâng cấp tại chỗ DB cũ bị BE crash exit 139 ở `SandboxSyntheticSeeder`), API https://localhost:18443, Vite http://localhost:5180. Dữ liệu test: `TEST-DATA-LEDGER.md` (mục B12).
Bản cũ đã lưu ở `archive/NGHIEM-THU-THEO-LUONG.cu-20261122.md`. FE không có git nên không có commit/SHA; mốc bàn giao là thư mục FE này.

## 1. Kết quả kiểm chung
| Lớp | Kết quả |
|---|---|
| `npx tsc --noEmit -p .`, `npx vite build` | Sạch |
| Duyệt toàn bộ route PM và Giám sát (`smoke-routes.mjs`) | Đạt |
| Đọc lại không phụ thuộc dữ liệu (`readback-state.mjs`) | 17/17 |
| Điều khiển giao diện (`flows-ui.mjs`) | 21/21 |
| Từng nhóm yêu cầu (bảng 2) | Xem cột kết quả |

## 2. Yêu cầu của Bosung.docx — kết quả FE
Ký hiệu: **Xong** = làm và kiểm trên BE thật; **Một phần** = làm nhưng có nhánh chưa kiểm được; **Chặn** = cần BE/dữ liệu Mobile.

### 2.1 Màn Hồ sơ thẩm định (Case)
| Yêu cầu | Kết quả |
|---|---|
| Bỏ GIS nhúng (tab, xem toàn màn hình, nút trên ảnh, modal, map chỉ phục vụ các nút này; fallback tọa độ 108.2045,16.0582) | Xong. Đã xóa `GisMapModal.tsx`, `reviewMapSetup.ts`. Không đụng bản đồ tuyến/hình học |
| GPS đồng bộ theo ảnh đang xem, ghi "GPS ảnh/bằng chứng", không giữ tọa độ ảnh cũ, UNKNOWN báo đúng, giữ link "Xem vị trí evidence" | Xong (kiểm 20/20) |
| Form nhập sai bấm xác nhận phải báo lỗi cụ thể | Xong (form quyết định Report, NO_DEFECT, công bố; không gửi khi sai) |
| Ảnh đối chứng chưa lấy được ảnh | Một phần. Màn hình đã báo đúng 401/403/404/5xx, mã, correlationId, có thử lại; tải ảnh đã chuyển sang cookie (mục 2.2). Ảnh đối chứng ở màn FIELD (`MeasurementsTab`) chưa kiểm riêng |
| Case mở lại + KEEP_NEW/LINK_EXISTING: "Đã ghi nhận", trạng thái Defect riêng, "Đã mở lại do có bổ sung" là nhãn phụ; Case OPEN vẫn hiện form, kết luận cũ ở lịch sử | Xong (11/11) |
| Hàng nhãn dài tràn thẻ Case | Xong (đo ở 1500/1100/800/560/420 px, không tràn) |
| LINK_EXISTING và REJECT cho nguồn Report | Một phần. REJECT đã gửi và đọc lại thật (201). LINK_EXISTING đã code nhưng **chặn**: BE không trả ứng viên (mục 4, B1) |
| Công bố Case truyền đúng Defect/Report, nhánh NO_DEFECT riêng | Một phần. NO_DEFECT công bố thật (201, `defectIds: []` đúng). Công bố có Defect **chưa kiểm** (mục 4, B2); cô lập Reporter chưa kiểm |

### 2.2 Tải ảnh, mã phát hiện, đọc lại quyết định AI
| Yêu cầu | Kết quả |
|---|---|
| `files/{id}/content` dùng cookie, không ép Bearer | Xong. Bỏ route files và 4 route AI khỏi danh sách Bearer; auth web vẫn cookie; ảnh tải không có header Authorization |
| Mã phát hiện ổn định, giữ run/dataset khi chuyển trang/F5, ID sai báo rõ, không chọn bản ghi đầu | Xong. Mã `DET-` + 6 ký tự cuối của `detectionId`; `?det=` sai hiện "không tìm thấy" |
| Lỗi 401/403/422 phân biệt, không còn "chỉ nhận Bearer", thử lại thật | Xong. Hiện HTTP, code, reasonCode, step, field, recovery, correlationId và originCorrelationId của run |
| POST AI MOCK 422 hiện ngay tại form | Xong (kiểm bằng 422 thật `fixture_version_unsupported`) |
| KEEP_NEW sau F5/đăng nhập lại vẫn đúng, không quyết định trùng | Xong. Đọc lại theo chuỗi candidate → decision → defect; phân biệt "chưa có quyết định" với "không đọc được" (khóa ghi + thử lại); một lỗi không chặn cả phiên (34/34) |

### 2.3 Nghiệm thu sửa chữa (màn Giám sát)
| Yêu cầu | Kết quả |
|---|---|
| Ảnh trước/sau không hiện: có trạng thái đang tải / chưa có / lỗi + thử lại | Xong |
| Badge "Chờ nghiệm thu" bị cắt; hiển thị dự án, mã gói, hạng mục, bước đang chờ | Xong |
| Bỏ khẳng định khi thiếu nguồn ("ĐẠT", "EXIF hợp lệ", K≥0.98, bảo hành 12 tháng, đơn vị mẫu); thiếu ghi "Chưa có dữ liệu"; rút gọn khung biên bản | Xong. BE không có nguồn cho các giá trị này (mục 4, B6) |
| Tên Crew thay vì "Crew 72F84201"; tách thời điểm nộp và kết thúc thi công | Xong |
| Hộp thoại PM ACCEPT: nhãn "Chấp nhận hồ sơ và trình Giám sát", bằng chứng thật của bản nộp hiện hành, bỏ dữ liệu/cam kết mẫu, ghi chú PM vào `reason`, toast theo trạng thái BE đọc lại | Xong. DTO không có trường id bằng chứng riêng nên không gửi |
| Form PM yêu cầu bổ sung: bỏ nội dung điền sẵn, nhãn đúng vai trò PM/SUPPLEMENT, phân biệt bổ sung và sửa lại | Xong |
| Sau SUPPLEMENT: "Lần #2" là gì, điều kiện nút theo trạng thái và bản nộp hiện hành | Xong. Tách "Lần thi công #n" (attempt) và "Bản nộp #r"; nút theo trạng thái BE; dữ liệu cũ thì tải lại |
| Giám sát "Chấp thuận nghiệm thu" khóa khi chưa đủ điều kiện, nêu lý do, hiện lỗi thật | Xong. Hệ quả: nút "Yêu cầu sửa lại" của Giám sát bị khóa kèm giải thích vì review SUPPLEMENT chỉ PM được gọi (Giám sát sẽ 403) |
| HUY-BUG-001: đóng Fast Track phải có PM ACCEPT trước | Một phần. Đã code theo trình tự ACCEPT → đọc lại → final, không gửi trùng, báo rõ bước đã xong khi lỗi giữa chừng; **chưa kiểm e2e** vì Fast Track assign bị 409 `published_policy_source_required` (cần chính sách và coverage đã công bố) |
| Toast bị che bởi modal tái sử dụng ảnh; thành công ngắn gọn, chỉ đọc sau khi xong, GUID/checksum vào phần chi tiết | Một phần. Toast đã nằm trên modal, lỗi hiện trong modal. Màn kết quả đã lưu đọc lại **chưa kiểm** vì không tạo được trạng thái tái sử dụng; BE không có GET đọc quyết định này (mục 4, B7) |
| Task Cancelled hiện "Chưa ánh xạ trạng thái" | Xong. "Đã hủy" / "Đã từ chối"; cả 9 trạng thái hạng mục đều có nhãn |

Kiểm: luồng đọc, bổ sung, ACCEPT, xác nhận cuối đạt khi chạy trên một hạng mục dựng bằng API (các bước Crew gọi qua API, ghi trong ledger). Hạng mục đó đã sang `Confirmed` nên không chạy lại được đoạn bổ sung/ACCEPT trên nó.

### 2.4 Đề xuất, phê duyệt, giao việc, an toàn, chuyển nghĩa vụ
| Yêu cầu | Kết quả |
|---|---|
| FIELD loại đo 5 và 6 | Xong. REPORTER loại 1–6 và SURVEY loại 5, 6, 1 đều POST 201 và đọc lại đúng, không còn 500. Tạo qua UI trên dữ liệu seed không kiểm được (cần Defect có KEEP_NEW cùng phiên), UI kiểm có đủ 6 loại |
| Form đề xuất sửa chữa hiện thông tin nguồn Defect | Xong. Khung `ProposalSourcePanel`: Defect, tuyến, hình học, số đo/đơn vị/nhiệm vụ/bản nộp/review FIELD; tách vị trí Defect với phạm vi PM; "Chưa có dữ liệu"; lỗi + thử lại; đổi Defect bỏ dữ liệu cũ. API đọc không có lý trình/độ lệch của Defect nên không hiện |
| Khối "Xử lý ngoại lệ và hiệu chỉnh": thu gọn, trạng thái BE riêng, "Chọn kết quả", khóa theo điều kiện, xác nhận cũ → mới, đọc lại | Xong cho giao diện và khóa. Nhánh gửi hiệu chỉnh thật **chưa chạy** (chưa có hạng mục đủ điều kiện) |
| Phản hồi sau phê duyệt Normal: toast sau khi đọc lại, ẩn form đã duyệt, khóa khi gửi, "cần đối soát" nếu ghi xong mà đọc lại lỗi | Xong |
| Nguồn Defect khi giao việc lấy từ BE, không mặc định REPORTER, không nhập Survey ID | Xong |
| Toast giao việc: "Đã giao [mã hạng mục] cho [tên Crew]." + "Xem nhiệm vụ", ID đầy đủ có nút sao chép | Xong |
| TemporarySafety: dropdown chỉ từ GET `temporary-safety-obligations`, PM bổ sung nghĩa vụ (POST), đổi hạng mục xóa lựa chọn, khóa khi rỗng/lỗi | Xong đầy đủ (GET, POST bổ sung 201, giao biện pháp 201, Crew theo binding; PM dự án B dùng URL B) |
| Lỗi 409 thô → "Phạm vi đề xuất xung đột với hạng mục đang hoạt động. Vui lòng kiểm tra gói hiện có." | Xong. Không dẫn tới gói cụ thể vì API không nêu gói (B9) |
| [H14] Giám sát yêu cầu sửa/từ chối đề xuất Normal | Một phần. Không có API; FE hiện rõ giới hạn, không dùng correction thay thế (B8) |
| Dropdown chuyển nghĩa vụ hiện mã gói, Defect, loại nghĩa vụ + bước đối chiếu | Xong; đã phát hành và tiếp nhận thật A → B |
| [KHOA-TR03] đọc planning sau chuyển nghĩa vụ | Một phần. FE hiện "Không đọc được kế hoạch", phân biệt dự án gốc và dự án chịu trách nhiệm, có thử lại, không coi là "Chưa nhập kế hoạch". Đọc planning sau chuyển **chặn ở BE** (B3) |
| HUY-BUG-005: hồ sơ bàn giao thiếu tệp | Một phần. Phân biệt "chưa có nguồn đủ điều kiện" với "chưa có bản ghi" qua `GET handover-documents`; nhánh tạo mới đã kiểm; nhánh attach đã code, **chưa kiểm** vì cần seed hồ sơ thiếu tệp (B10) |
| HUY-BUG-003: đơn vị Area và danh mục loại khiếm khuyết | Đã đối chiếu. Web gửi `m²` đúng contract, không đổi sang `m2`; danh mục đọc thật từ `GET /catalog/defect-types` hiện chỉ có CRACK, POTHOLE; chưa có payload Mobile để so |
| Điều phối ngoại tuyến: "Cấp quyền bàn giao" và "Chuẩn bị gói ngoại tuyến" cho Giám sát | Một phần / chặn. Khối cấp quyền đã làm (gói, thiết bị, phạm vi lấy từ GET; chỉ Giám sát; đọc lại). Seed không có gói/thiết bị do Mobile nên mới kiểm trạng thái khóa; "Chuẩn bị gói" **chặn** (B11) |

## 3. Việc chưa làm được hoặc chưa kiểm
- Cần Mobile hoặc dữ liệu chưa có: công bố Case có Defect, LINK_EXISTING, Fast Track đóng, màn kết quả tái sử dụng ảnh, nhánh gửi hiệu chỉnh, attach hồ sơ bàn giao, cấp quyền/chuẩn bị gói ngoại tuyến thực, lần chạy AI FAILED bất đồng bộ.
- Không tái hiện được 401/403 thật ở `ai-candidates` (BE trả 200); chỉ kiểm bằng chặn request.
- Giám sát không đọc được kết quả KEEP_NEW (quyết định chỉ PM đọc): luôn thấy "chưa xác định" cho phát hiện đã quyết.

## 4. Cần BE sửa hoặc quyết định (gửi BE)
| # | API | Hiện tượng / bằng chứng | Đề nghị |
|---|---|---|---|
| B1 | `GET /projects/{p}/candidates?sourceKind=REPORT` | Trả `items` rỗng với Report gần Defect KEEP_NEW đã có, nên không thể LINK_EXISTING | Xác nhận quy tắc ghép ứng viên cho nguồn REPORT |
| B2 | `GET /cases/{id}` | Case OPEN có Defect KEEP_NEW vẫn trả `defectIds: []` | Nêu điều kiện để Case công bố kèm Defect |
| B3 | `GET /projects/{B}/repair-packages/{pkg}/planning`, item planning, item source-defect | PM dự án nhận B: 404 `not_found` (pkg `1a76a722-f08f-4373-be76-867309aec1bb`, correlationId `9b9d458b-ab8e-4990-a9ce-90f9798a149c`, lần 2 `8ad775e1-ad63-44a6-b99f-32a3b0a53e4a`) trong khi `…/temporary-safety-obligations` cùng URL trả 200. Danh sách `GET /repair-packages` của PM-B cũng không liệt kê gói nhận chuyển | Cho PM dự án nhận đọc planning/source-defect sau chuyển (giữ dự án gốc và lịch sử) hoặc nêu nguồn thay thế |
| B4 | `GET /projects/{p}/ai-mock-runs` (danh sách) | Thiếu `originCorrelationId`, `failure`, `attemptId`, `manifestHash` dù schema có; FE phải gọi GET từng run | Trả đủ trường ở danh sách |
| B5 | `GET /projects/{p}/ai-candidates/{id}` (Giám sát) | Giám sát không đọc được `candidate-decisions` (PM-only) nên không thấy kết quả KEEP_NEW/REJECT | Nếu muốn Giám sát xem: trả `decision` và `defectId` trong `disposition` |
| B6 | Nghiệm thu: `readiness`, lịch sử attempt | `history.attempts[].evidence` luôn rỗng dù bản nộp có ảnh; `readiness` luôn INCOMPLETE `AFTER_ATTEMPT_BINDING_UNAVAILABLE` kể cả khi PM ACCEPT thành công; không có nguồn cho ngưỡng K/độ phẳng, thời hạn/đơn vị bảo hành, kết quả toàn vẹn/EXIF ảnh | Trả các dữ liệu này hoặc xác nhận không có |
| B7 | Đọc lại quyết định | PM/Giám sát không đọc được lý do/quyết định review SUPPLEMENT (`repairContext: null` cho PM, lịch sử hạng mục không có review); không có GET đọc quyết định tái sử dụng ảnh; lỗi repair trả title chung "Repair request failed" | Cung cấp GET đọc review và quyết định tái sử dụng; lỗi nên có title/code rõ |
| B8 | Đề xuất Normal `AwaitingApproval` | Không có API Giám sát yêu cầu sửa/từ chối và đường PM chỉnh/trình lại | Cho biết có hỗ trợ không; nếu có, bàn giao endpoint |
| B9 | 409 `active_scope_conflict` | Không nêu gói/hạng mục xung đột | Trả định danh gói xung đột |
| B10 | Hồ sơ bàn giao | Seed không có hồ sơ thiếu tệp để nghiệm thu nhánh attach | Thêm dữ liệu seed |
| B11 | `POST /projects/{p}/offline/packages/prepare`, `offline/grants` | Cần gói mã hóa, manifest ký theo khóa thiết bị do Mobile tạo; không có GET nguồn cho "Chuẩn bị gói"; seed trống | Bàn giao nguồn đọc hoặc dữ liệu seed |
| B12 | `TemporarySafety` | Nghĩa vụ đã dùng không truy ngược được gói/Defect | Trả liên kết ngược |
| B13 | `POST /cases/{id}/conclusions` | Trả 200, tài liệu ghi 201 | Thống nhất tài liệu |
| B14 | Seed `deploy/fe-handoff/demo_ai.py` | Thiếu bước `POST …/road-geometry-drafts/{id}/submit` trước `confirm` nên seed scenarios 409; nâng cấp tại chỗ DB cũ làm API crash exit 139 ở `SandboxSyntheticSeeder` | Sửa seed và bước nâng cấp |
| B15 | Fast Track assign | 409 `published_policy_source_required` (correlationId `bef60b22-b32b-4eed-90c1-69d38c0694dc`) cho đến khi có chính sách và coverage công bố; đúng thiết kế nhưng seed không có | Bổ sung seed hoặc hướng dẫn dựng chính sách |

Các mục BE cũ chưa được xử lý ở bản này đã đối chiếu và không còn trong danh sách: bản BE hiện tại đã sửa trigger loại đo 5/6, `surveyType`, `parentTaskId`, 409 phân biệt, đóng kế hoạch khảo sát, đọc candidate bằng cookie, `temporary-safety-obligations`, `handover-documents`. Những lỗi/thiếu cũ của BE mà tài liệu Bosung không nhắc lại (ví dụ phong tỏa pháp lý không liệt kê được, Giám sát 403 ở xuất hồ sơ và danh sách Defect, Report không có vị trí → 409 `source_not_ready`) **chưa được kiểm lại trên bản này**; xem bản lưu cũ ở `archive/` nếu cần.

## 5. Dữ liệu test không hoàn tác
Xem `TEST-DATA-LEDGER.md` mục B12 (G1 Case, G2 AI, G3 nghiệm thu, G4 đề xuất/an toàn/chuyển). Tóm tắt: hạng mục nghiệm thu dựng bằng API đã sang `Confirmed`; nghĩa vụ `041077c7…` (gói `1a76a722…`, đã giao Crew và có biện pháp an toàn) đã chuyển từ SBX-A sang SBX-B; nhiều Case, Defect, lần chạy AI và task FIELD `[TEST-FE]` đã tạo thêm.

## 6. Chạy lại kiểm thử
`cd FE_Drone_Web-hoang && RG_BASE=http://localhost:5180 bash tools/e2e/run.sh <script>.mjs` với `smoke-routes`, `readback-state`, `flows-ui`, `g1-case-review`, `g2-ai-transport`, `g3-acceptance` (và `g3-seed`), `g4-*`. Báo cáo chi tiết từng nhóm: `fe-theo-be/G1…G4-*-20261124.md`.
