# Bảng tích hợp Web PM/Sup — đợt 15/11/2026

Baseline `1c348da`; tiếp tục trên nhánh `hoang`, giữ local ngoài các luồng đang nối. Không tạo worktree/bản giải nén, không sửa BE/SQL, agent không POST/PUT/PATCH/DELETE thật; mutation nghiệm thu do người dùng tự bấm. Không dùng tài liệu bàn giao để thay quyết định nghiệp vụ.

Nguồn đối chiếu: AGENTS.md; Spec17_10 PM/Sup matrix, business workflows, full API catalog; docs/contracts/openapi.json và FE-API-CATALOG.json; Candidate3 deploy/fe-handoff README-FOR-FE, FE-W01-W10-RECIPES, FE-API-FUNCTIONAL-GUIDE; source đúng image runtime b89a52fe11ed tại thư mục source đã có. Các hướng dẫn discovery lịch sử mâu thuẫn recipes mới được đối chiếu bằng OpenAPI/source; không suy chức năng từ tên route.

## Kết quả đợt này

- `39c2c8a`: dropdown Report có mặt cả trước/sau KEEP_NEW, đổi nguồn không lẫn kết quả; không mở lại POST khi nguồn đã ghi nhận.
- `70e7909`: API039–042 list/detail/scope/mark-read thông báo PM/Sup qua cookie/CSRF. Phân trang đầy đủ, receipt/GET/version/key, actor fence. Không đoán người gửi/ưu tiên/SLA hoặc điều hướng từ resourceId đơn lẻ. Bố cục feed/widgets/modal âm thanh giữ nguyên; bỏ claim độ trễ realtime giả.
- `73204f8`: API080/088/096 task detail/history/latest submission, API085/086 metadata/ảnh riêng tư và API092 review trong modal FIELD có sẵn. API078 sửa phân trang afterId. Không điền số đo AI/UNKNOWN, không đổi Defect thành VERIFIED. Review PM chọn CONFIRM/NO_DEFECT/SUPPLEMENT và lý do2000 ký tự; nguồn runtime FieldInspectionReview.cs mới là căn cứ enum. Caller cũ ACCEPT + lý do tự tạo đã được thay bằng thao tác review rõ ràng trong chi tiết; Sup chỉ đọc.
- `67ff2f8`: API079 nhánh REPORTER/PRE_MEASUREMENT trong form tạo FIELD hiện có. Bỏ fixture Defect/Crew/geometry/ngày hẹn và fallback danh mục; PM tự chọn toàn bộ input. Đọc lại Defect/version, nguồn KEEP_NEW, thành viên ACTIVE và package trước POST; chưa đủ preflight không có pending. Giữ journal sau timeout, receipt chỉ GET; chống phản hồi cũ theo dự án/actor. Sửa guard status PascalCase của FIELD theo source runtime.

- `633d5ea`: tải danh mục Defect/Crew độc lập, lỗi GET không giả làm empty.
- `908481e`: API079 scope JSON object đúng validator, CRS từ GET tuyến, pin set tùy chọn; journal cũ giữ nguyên.
- `003f502`: API084 nguồn Report thật, PM chọn bằng chứng/lý do; journal và receipt/GET; bỏ caller IDs/metadata/ảnh mẫu. Runtime POST chưa nghiệm thu.
- `2b646f7`: API074–077 và ADD-04 export PM/Sup: list/detail/manifest/content/create DOSSIER PDF/ZIP; bỏ tiến độ/hash/size/record mẫu, giữ journal và readback.

## Mâu thuẫn và phần bị chặn

1. Catalog hiện264 operations, OpenAPI local266, Swagger runtime274. Hai path local chưa có mã catalog: POST projects/{projectId}/members và GET projects/{projectId}/members/eligible. Chín path runtime bổ sung gồm catalog defect-types, geometry submission/submit/reject, pavement-layout collection, eligible-drones, phone PATCH, upload cancel. /ready chỉ có trong local contract. Bảng lấy hợp method/path local+runtime (275 dòng), giữ nguyên mã catalog; không sáng tác API267…
2. AuditTrail/auditService đang là mock; không có endpoint audit canonical tương ứng trong OpenAPI runtime. Không invent /audit hoặc coi local export giả là job thật.
3. Dashboard /dashboard/pm không có endpoint trong contract. Màn hiện có còn số liệu mock; chưa đánh dấu gắn API hoặc tổng hợp KPI khi chưa xác lập định nghĩa/dimensions. Các số đo/metrics không được suy từ confidence/bbox.
4. ResearchValidation UI là kiểm định đo đạc thực nghiệm; không có endpoint cho đúng bộ metric này. Không thay bằng training-label API hoặc bịa số liệu.
5. RepairProposals UI còn gom nhiều Defect theo tuyến/đợt, nhưng RepairPackageCreateInput canonical gắn một defectId+defectVersion+obligations+reason. Các aggregate status/technical BOQ trong mock chưa trỏ được vào item/obligation/version thật. Cần nối theo mô hình obligation/item và xác minh binding, không gọi một POST giả “gộp batch”. Đây là phần chưa hoàn tất, không kết luận BE cần bổ sung.
6. Retention UI toggle theo project/deletion requests không khớp canonical retention file-basis/evaluation/hold reference. Không bịa project-level toggle, không xóa orphan, không mở command purge ngoài contract.
7. API039–042 không có sender/priority/SLA/category trong NotificationDto. Scope đọc riêng có source/event/classification; chưa có mapping category theo loại ưu tiên. UI chỉ trình bày trường server thực có, không suy nhóm/khẩn cấp/SLA.
8. PM review FIELD phải dùng CONFIRM/NO_DEFECT/SUPPLEMENT. OpenAPI FieldReviewInput chỉ khai báo string; source b89a52f xác nhận enum và reason<=2000. Một số hướng dẫn/caller cũ dùng ACCEPT là sai. Source trả201 review trong khi catalog success200; FE đối chiếu receipt DTO + GET, không suy từ status đơn lẻ.

9. FIELD source ViewAsync trả status PascalCase (Submitted/Completed/SupplementRequired), không phải toàn uppercase. Guard review và readback đã đối chiếu source, chuẩn hóa riêng để không khóa nhầm Submitted hoặc báo sai kết quả. Hoàn tất FIELD không đổi trạng thái Defect thành VERIFIED.
10. Tạo FIELD từ REPORTER hiện cần reference decision/Defect đã đọc qua KEEP_NEW; DefectDto không cung cấp đầy đủ nguồn/Survey provenance và không có API list candidate-decisions để tự tìm lịch sử. Không có reference thì hướng dẫn mở lại kết quả ghi nhận, không tự chọn Survey/sourceId. Đây là giới hạn nối hiện tại, không kết luận thiếu endpoint tạo FIELD.

## Kiểm thử và nghiệm thu

Các lần kiểm trong chuỗi tích hợp đã có 113 nhóm PASS: KEEP_NEW10, notifications6, FIELD read8/review4/create9/list1, API02411, geometry8, D225, Refresh2, intake12, API0847, export10. Riêng đợt export vừa chạy lại 36 nhóm (export10/API0847/FIELD create9/read8/Refresh2). Typecheck `tsc -b` PASS; `npm run build` PASS2081 modules với V8 pool1 (còn cảnh báo Tailwind duration-[250ms] và bundle lớn). `git diff --check` và staged diff-check PASS. Tests dùng HTTP/hooks/storage mô phỏng, không chứng nhận database mutation/SMTP/GIS/worker. Build dùng toàn bộ working tree hiện có, bao gồm local giữ nguyên ngoài commit.

Runtime trước nghiệm thu: GET notifications200 items[]; GET FIELD list200 items[] trên7 dự án PM được cấp. Sau đó người dùng tự tạo FIELD và F5 PASS như mục API079 bên dưới. Mark-read/review/submission/evidence-reuse POST runtime vẫn NOT_RUN. Không tạo fixture để làm đầy.

Theo dõi riêng: lỗi retry D1 đã biết vẫn chưa xử lý/nghiệm thu lại; không gộp vào kết quả PASS D2/API024/FIELD của đợt này.

Nghiệm thu tay ngắn:
- Report: chọn từng nguồn trước/sau KEEP_NEW, F5 phải đọc reference/Defect OPEN; journal409 khác key vẫn giữ; không thêm POST.
- Thông báo: PM/Sup mở chuông → inbox. Có bản ghi thì bấm đọc chi tiết/phạm vi (GET); tự đánh dấu đọc một lần rồi đối chiếu POST key/If-Match → GET read=true. F5 và đổi actor không lẫn inbox. List rỗng/error phải khác nhau. Inbox có bản ghi không chứng minh đã giao thông báo ra ngoài.
- Tạo FIELD: PM chọn dự án cụ thể → mở lại Report đã KEEP_NEW để GET đối chiếu → mở tạo phiếu, tự chọn Defect OPEN, Crew ACTIVE, phương pháp, loại đo, hạn; tuyến lấy từ Defect, chỉ chọn set PUBLISHED nếu cần pin thêm phạm vi. Tự bấm một lần, đối chiếu receipt TaskID → GET/list; đổi dự án/actor không nhận phản hồi cũ. Thiếu nguồn hoặc stale version/hash phải chặn trước POST, không tạo pending. Sau timeout/F5 giữ nguyên journal; receipt chỉ GET. Nhánh Survey chưa hoàn tất.
- FIELD: mở phiếu đo → task/history/submission → chọn ảnh → GET metadata VERIFIED/checksum → content. Zero/UNKNOWN giữ nguyên. PM chọn quyết định/lý do rồi tự xác nhận một lần; receipt/GET phải COMPLETED hoặc SUPPLEMENT_REQUIRED, Defect không tự VERIFIED. Sup không có form review. Timeout/F5 giữ key/body/version; có receipt chỉ GET;403/412 báo rõ, không thay key để thử.

- `ca18c16`: API168–170 KPI theo metric/dimensions/availability thật; bộ lọc riêng cho báo cáo; bảng phân đoạn server và MapLibre WGS84 có kiểm phạm vi; giữ export đã PASS.

## Báo cáo KPI API168–170 — giới hạn và mapping

Nguồn đúng runtime b89a52fe11ed: ReportingDefinitions.cs:9–78; CaseDefectCaptureConsumer.cs; DefectStatisticsCaptureConsumer.cs:10–34; CurrentRepairCaptureConsumer.cs; ReportingService.cs:65–121; RoadGeometryVersionView/SegmentGeometry DTO. API168 items, API169 summary, API170 timeline; UI có trên PM/Sup, không mở quyền Crew.

| Metric thật | Đơn vị / dimensions | Quy tắc hiển thị |
|---|---|---|
| reportsReceived | count; toàn phạm vi; periodApplicable=true | Số phản ánh trong kỳ, không phải SLA |
| casesByStatus / defectsByStatus / surveyTasksByStatus / repairItemsByStatus | count; status | Giữ từng trạng thái riêng, không cộng thành tỷ lệ |
| legacyUnclassified | count | Nhiệm vụ cũ chưa phân loại, không phải lỗi dữ liệu mới |
| baselineCoverageByBand | percent; band + routeVersionId + segmentSetId; numerator/denominator từ BE | Theo từng dải/phiên bản/bộ; null + EMPTY_DENOMINATOR không là0; không suy tốc độ suy thoái |
| verifiedSourceBytes | bytes | Dung lượng nguồn được xác minh, không phải % toàn vẹn |
| repairAcceptanceRate | percent; periodApplicable=true | Tỷ lệ nghiệm thu sửa chữa, không thay SLA; nếu UNAVAILABLE không hiện số |
| validationMetrics | per-run | Bias/MAE/RMSE/used/excluded/unit/measurementType từ API168, không tự gộp trung bình |
| projectDistinctDefects / matchedDistinctDefects / explicitSharedParts | count | Giữ availability/reasons, PARTIAL có thể kèm số0/1 nhưng không được gắn đầy đủ |
| segmentRelatedDefects | count; dimensions.status chứa segmentId theo DefectStatisticsCaptureConsumer | Gắn nhãn phân đoạn, không coi GUID là trạng thái Case; null không thành0 hư hỏng |
| sourcedAllocatedQuantity / sourcedUnallocatedQuantity | đơn vị số đo nguồn thực trả | Hiển thị theo đơn vị nguồn, không tự đổi thành diện tích/khối lượng giả |

- KPI SLA, thời gian duyệt, tái phát, phần trăm toàn vẹn không có metric tương ứng: giữ các khối UI, hiện thiếu nguồn; bỏ claim PDF chuẩn TCVN. Không dùng repairAcceptanceRate/verifiedSourceBytes/baselineCoverage thay thế.
- Bộ lọc báo cáo riêng: chọn kỳ Từ–Đến UTC ([From,To)), tuyến, bộ PUBLISHED, đoạn; route đổi xóa set/segment phụ thuộc. Array segmentIds dùng repeated query key (không segmentIds[]). Summary xác minh project/filter; response offset+00:00 tương đươngZ được chấp nhận. Timeline chỉ hỗ trợ kỳ + Project aggregate; không giả vờ lọc tuyến/đoạn, UI ghi rõ.
- RPT06: không có API risk score/ngưỡng/epoch comparison trong contract/source reporting. Hình học đọc từ work-package→route geometry và bộ PUBLISHED. Dự án321 GET200 có1 tuyến/4 đoạn, metricGeometry EPSG32648 nhưng không có Wgs84Centerline/Wgs84Geometry; UI vẫn có bảng lý trình thật, đánh giá UNKNOWN, không vẽ metric thành lon/lat hoặc đặt marker giả. Nếu nguồn khác trả WGS84 hợp lệ, vẽ MultiLineString server, chọn đoạn fitBounds toàn bộ geometry, đổi project xóa source/marker cũ. Thiếu WGS84 thì khóa định vị và hiện giới hạn; không kết luận0 đoạn nguy cơ.
- Trạng thái riêng: loading, HTTP error, danh sách nguồn rỗng, AVAILABLE/PARTIAL/UNAVAILABLE, value null và actual0. Không coi lỗi geometry là0 đoạn. Bảng KPI, chi tiết và timeline dùng nhãn/trường trực tiếp; không đưa JSON/DTO thô ra UI. Modal manifest export giữ chức năng đọc/tải nhưng đổi raw JSON thành danh sách tệp/phần nguồn dễ đọc.
- Runtime GET service mới trên321: summary20021 metric rows; items reportsReceived2003 Report; timeline2001 sự kiện với PARTIAL + MAPPED_ANH01_AUDITS_ONLY/HUY_TIMELINE_READER_UNAVAILABLE; geometry2001 tuyến/4 đoạn/0 geometry WGS84. Không mutation; chưa nghiệm thu tương tác filter/map với dữ liệu WGS84 bằng browser thật.
- Review tay: chọn321 trên reports → xem KPI có reportsReceived3, Case theo trạng thái, Defect OPEN1, baseline0% của4 đoạn theo từng dải; các số này là quan sát hiện thời, không fixture. Chọn metric và kỳ/tuyến/set/đoạn → Áp dụng; đối chiếu request/availability. Đổi dự án nhanh không lẫn dữ liệu. Bảng có4 đoạn nhưng Chưa có dữ liệu đánh giá; không thể zoom321 khi BE chưa trả WGS84. Khi có dự án WGS84, chọn từng đoạn phải zoom cả đoạn chính xác. Export cũ20ba537b… vẫn mở manifest/tải PDF như trước; không tạo export mới để thử.
- Regression reporting10 nhóm (mapping/unit/dimensions/null0, filterUTC/arrays, pagination/availability, timeline, geometryscope, actual panel trạng thái, actual hook late response, actual MapLibre binding/fitBounds/source clear) và export12 nhóm đều PASS. Typecheck/build/diff-check PASS2083 modules (còn cảnh báo Tailwind/bundle lớn); không coi mock geometry là runtime GIS PASS.

## Lỗi POST074422 đã xác minh và sửa

- Runtime b89a52fe11ed: POST9190 trên project321 trả422 ProblemDetails `title/code:validation_error`, correlation `6fc6a0d5-d22a-4d85-89d4-80046f9b1774`. Body thực: `{"kind":"DOSSIER","format":"PDF","includeOriginalFiles":false,"to":"2026-11-15T07:37:00.000Z"}`. Chỉ có một POST quan sát được, không timeout và chưa có receipt.
- Nguồn lỗi: ExportService.cs:75 chuyển filter sang ReportingService.CaptureAsync; ReportingService.cs:117–121 yêu cầu From.HasValue == To.HasValue, offset UTC, From < To. Chỉ có To nên bị từ chối xác định trước tạo snapshot/job; ExportRepository.cs:34–35 throw CaptureException khi capture lỗi.
- Múi giờ đúng: tab Asia/Saigon, input `2026-11-15T14:37`→`2026-11-15T07:37:00.000Z`; response timestamp07:37:52Z. Không kết luận lỗi do tương lai hay đổi múi giờ. Filter [From,To), không gồm To.
- Form bổ sung Từ, yêu cầu cả cặp hoặc bỏ cả hai; kiểm hợp lệ và thứ tự trước POST. Chuỗi local datetime chuyển UTC một lần bằng Date.toISOString. Không tự đặt From hoặc dùng ngày giả.
- First-attempt422 với code validation_error/export_invalid được ghi rejected để form sửa được; giữ body/key phản hồi gốc cho đối chiếu. Journal từng timeout/restored hoặc có receipt không được đổi/xóa theo422. Riêng journal của POST9190 đã được đánh dấu rejected bằng chứng request/key/body/correlation chính xác trên tab, không POST lại. Mở lại form để tự chọn khoảng mới hoặc bỏ cả hai.
- Regression export12 nhóm PASS gồm đúng payload9190, UTC conversion, first422→edit/corrected submit mô phỏng, timeout→422 giữ identity, receipt GET-only. Sau sửa người dùng đã POST lại một lần202 và GET khớp, xem mục nghiệm thu export; request9190 vẫn là ca422, không đổi thành PASS.

## Nghiệm thu Web export API074–077

- Quyền: PM hoặc Sup có tài khoản ACTIVE và membership ACTIVE trên cùng dự án; form khóa khi chưa chọn dự án cụ thể. Dữ liệu tạo chỉ `kind:DOSSIER`, `format:PDF|ZIP`; PDF không kèm file gốc theo validator BE. Không có lệnh hủy/xóa trong contract hiện tại, nên các nút tương ứng bị khóa/báo rõ.
- Dòng test: vào `/sup/reports` hoặc `/sup/risk-analytics`, chọn dự án thật → **Xuất báo cáo tổng hợp** → chọn PDF/ZIP, nhập đủ Từ–Đến nếu cần (hoặc bỏ cả hai) → bấm một lần. Đối chiếu POST074 `202`, receipt job/version/snapshot → GET075. Nếu `SUCCEEDED`, mở chi tiết để GET077 manifest rồi tải GET076; FE kiểm mediaType, expiry, SHA256 content với ETag. Job `QUEUED/RUNNING` không hiển thị phần trăm giả và không tự retry.
- Runtime người dùng đã POST074202, export `20ba537b-7757-4cc5-bdd8-f1ec36a54145`; GET075/list200 từ QUEUED→SUCCEEDED, versionAAAAAAABUWk=. Sau restart/F5 list/detail/manifest vẫn200 cùng snapshotdd2c84f5…/hash678b3c94…; không POST mới. GET076200 PDF35993 byte, %PDF-1.7, SHA256 e0fa8ddcf6108219e454405d9e6768d6d8c64907d8908a7e63956182a8697731 khớp ETag. Bản PDF lưu cũ chưa tìm thấy trên máy; không coi nội dung trên server là đã xác minh file cũ. Completeness PARTIAL giữ nguyên.
- Lưu ý điều kiện runtime: Sup có quyền reporting toàn cục vẫn có thể bị403 export nếu thiếu membership ACTIVE của project, đúng ExportService.AuthorizeAsync:35–40. Chưa có endpoint cancel/delete/retry, nút retry hiện chỉ đọc chi tiết lỗi. Form hiện nối DOSSIER toàn dự án; TRAINING và chọn subset segment/Defect chưa có caller phù hợp, không gửi option giả. Summary KPI/mapping rủi ro chưa nối, giữ bố cục và hiện thiếu nguồn; không dùng mock để điền số liệu.
- Bằng chứng source: ExportsController.cs:17–48 hỗ trợ WebCookie/Idempotency-Key/ETag; ExportService.cs:61–68 giới hạn kind/format/PDF originals/filters; ExportRecords.cs:12–42 trạng thái QUEUED/RUNNING/SUCCEEDED/FAILED. API075 GET có version/ETag mới; worker có thể đổi version sau receipt, FE đối chiếu snapshot/kind/format giữ nguyên thay vì ép rowVersion không được đổi.

## Nghiệm thu runtime API079 và bước tiếp theo

- Người dùng tự tạo phiếu `574b3f4c-0778-4564-baea-35398b298ce2` trên project321 `15d119fe-0c03-4e25-aa5d-95e97ddd881d`, Defect `44d56026-2d43-4022-8f89-536862bab349`, Crew `72f84201-a001-4000-8000-000000000008` (crew-a), loại đo1 DepressionDepth. Hạn 15/11/2026 13:30 Asia/Saigon, instructions giữ phương pháp PM chọn + ghi chú test.
- POST079 req5525 trả201, key `ee8978cb-004b-4f2d-bac5-d51ce7712626`, correlation `3bf6210a-59fe-4cab-a267-2dcae9752de9`. Receipt + GET task5526/list5527 cùng task/project/Defect/Crew/type/dueAt và version `AAAAAAABR88=`. Status NewAssigned, MEASURE_ONLY; scope {}, CRS/set/layout/slab/map null. Không có submission.
- Người dùng F5: navigation reload, GET list6167 trả200 cùng phiếu/version; UI còn hàng TSK-MEAS-574B; tổng POST079 vẫn1, không tạo journal mới. Bộ lọc trở về ALL. API079 runtime PASS, không suy readiness/review/notification delivered.
- Đã kiểm private account metadata qua đọc cục bộ, chỉ in key/role: có crew-a và crew-b; không lưu/in mật khẩu. Web chỉ có route PM/Sup và source BE yêu cầu actor Crew được giao cho accept/start/submission. Không đăng nhập hoặc làm lệnh Crew thay PM.
- Client Mobile hiện hữu tại FE_Drone_Mobile: auth/index.tsx nhập api/mock/auth; app/(crew)/tasks.tsx có CREW_TASKS hardcode; complete.tsx chỉ toast hoàn tất WO-118. Chưa tìm thấy caller canonical FIELD accept/start/submissions. Nghiệm thu Crew BLOCKED: cần client nối API thật, người dùng tự đăng nhập crew-a, accept task→start origin/version thật→submission số đo/evidence/proof thật. Không dựng submission để vượt bước.
- Runtime b89a52f: CreateCaptured hỗ trợ type1/2/3/4; type4 Area dùng AREA/m², type1–3 LENGTH với mm/cm/m. Readiness so enum byte của submission với RequiredMeasurementType, còn kiểm UNKNOWN, vị trí và bằng chứng; giữ nguyên 1–4. Nhận xét 5/6 đã được người dùng hủy.
- API084: bỏ IDs/checksum/GPS/EXIF/Reporter/ảnh mẫu ở modal và caller cũ. Case/Report GET200 và ảnh gốc JPEG 4114576 bytes của evidence cbc6ca2a… đã đọc được bằng service mới; checksum SHA256 được tính từ nội dung ảnh và ETag đối chiếu fileVersion. Chưa POST084. Chỉ source REPORTER được nối, DRONE chưa đủ caller nguồn.
- Kiểm tra đợt tiếp: 78 nhóm tự động PASS (API0847, create9, read8, review4, list1, KEEP_NEW10, intake12, notification6, API02411); typecheck PASS; build PASS2081 modules khi chạy tuần tự với V8 pool1. Lượt build trước bị thiếu bộ nhớ native trong lúc chạy thêm test; không sửa config/build script của repo để né lỗi. Còn cảnh báo Tailwind và bundle lớn; diff-check PASS. Test API084 gồm component modal thực chạy hooks, không chỉ kiểm service.
- Nghiệm thu API084: mở Tái sử dụng ảnh của phiếu trên → tự chọn bằng chứng Report, đọc ảnh/metadata thực → nhập căn cứ → tự xác nhận một lần. Đối chiếu DTO/If-Match/key, receipt→GET task + file VERIFIED/checksum; F5 mở lại modal đọc reference/GET, không POST mới. Đây là quyền dùng ảnh BEFORE, không phải xác nhận GPS nằm trong phạm vi hay kết quả đo READY. GET metadata không có decisionId; FE đối chiếu receipt đã lưu cùng file/state/checksum, không bịa GET decision.

## Ca tay API084 — chưa runtime PASS

1. Đăng nhập PM có membership ACTIVE trên dự án **321 • final testttttttt** (`15d119fe-0c03-4e25-aa5d-95e97ddd881d`), vào `/pm/field-tasks`, lọc321. Chọn hàng **TSK-MEAS-574B**, task `574b3f4c-0778-4564-baea-35398b298ce2`, bấm **Tái sử dụng ảnh**. Task hiện NewAssigned (UI CẦN THỰC HIỆN); không dùng task Completed/Cancelled. UI hiện mở nút ở ASSIGNED/IN_PROGRESS. Sup không có quyền xác nhận.
2. Nguồn cần reference KEEP_NEW đã GET xác nhận cho Defect `44d56026-2d43-4022-8f89-536862bab349`. Nếu báo thiếu reference, mở lại kết quả Report `06b93fe6-18d0-4cc6-bebd-4d7ffc888b84` trong Case `52d2439c-e67f-41b0-862e-0f90637ca3af` để GET đọc nguồn; không bấm tạo Defect lần nữa.
3. Trong modal tự chọn evidence `cbc6ca2a-6a62-478b-a985-823745bc7c61` (file `fecd5bfa-0d47-41a7-9275-73b4ee607d74`, fileVersion `AAAAAAAAon4=`). Chờ ảnh thật và SHA256; GET thử đã đọc JPEG4114576 bytes, hash `a7583fdee261ce58a2ec91b64d6bd715a810645e8550efdd8c3a5a1c12815268`. Đây là dữ liệu quan sát tại thời điểm kiểm; nếu server đổi phải đọc lại, không hardcode hash/version.
4. Tự nhập căn cứ của PM, tối đa2000 ký tự, rồi bấm **Xác nhận tái sử dụng ảnh** một lần. Request đúng endpoint API084 của task trên; sourceKind REPORTER; If-Match từ GET task; key mới chỉ cho ý định mới; file/evidence/hash đúng nguồn đã chọn. BE còn kiểm file VERIFIED, quyền ảnh, live source link và phiên bản ảnh; không bỏ guard khi409/403.
5. Chỉ ghi runtime PASS khi POST201 receipt đúng task/file/source/checksum/reason, sau đó GET task200 + GET `/projects/{projectId}/field-inspection-tasks/{taskId}/evidence/{fileId}`200 xác nhận file VERIFIED/checksum. Task không tự Completed, Defect không tự VERIFIED; receipt không chứng minh thông báo đã giao.
6. Sau GET khớp, tự F5, mở lại modal: reference + GET đọc kết quả, không POST mới. Nếu timeout/lỗi: không tự retry; giữ journal/key/body/version. Có receipt thì nút đối chiếu chỉ GET. Nếu chưa có POST→GET do người dùng thực hiện, trạng thái API084 vẫn **runtime NOT_RUN**, dù test tự động PASS.

## Toàn bộ method/path đã đối chiếu danh mục

“đã có” là có code/caller đã xác định, không đồng nghĩa full runtime PASS. “vừa nối” chỉ phần đợt này. “bị chặn” kèm predicate/role/source; không đồng nghĩa yêu cầu BE mới. “chưa làm” là chưa rà đủ hoặc chưa triển khai trong đợt, không phải kết luận không có bất kỳ code nào. Bảng bao gồm local chưa commit; không gom local đó vào các commit mới.

Tổng dòng: 275; đã có: 69, chưa làm: 172, bị chặn: 14, vừa nối: 20.

| Mã catalog | Method | Endpoint | Trạng thái | Bằng chứng / phạm vi |
|---|---|---|---|---|
| ADD-01 | GET | `/api/v1/projects/{projectId}/ai-mock-runs` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:496 (surveyService.getSurveys); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| ADD-02 | GET | `/api/v1/projects/{projectId}/repair-packages` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-03 | GET | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-04 | GET | `/api/v1/projects/{projectId}/exports` | **vừa nối** | projectExportService + RiskAnalytics: cursor/list, project/actor/status/version guard, error rõ. Runtime danh mục project321 hiện items[] 200; không tạo fixture. |
| ADD-05 | GET | `/api/v1/projects/{projectId}/survey-plans` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:467 (surveyService.getSurveys); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| ADD-06 | GET | `/api/v1/projects/{projectId}/survey-tasks` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:482 (surveyService.getSurveys); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| ADD-07 | GET | `/api/v1/projects/{projectId}/processing-jobs` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-08 | GET | `/api/v1/projects/{projectId}/offline/devices` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-09 | GET | `/api/v1/projects/{projectId}/offline/packages` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-10 | GET | `/api/v1/projects/{projectId}/offline/grants` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-11 | GET | `/api/v1/projects/{projectId}/retention/evaluations` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-12 | GET | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| ADD-13 | GET | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/notification-supervisor` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-14 | PUT | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/notification-supervisor` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-15 | DELETE | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/notification-supervisor` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-16 | POST | `/api/v1/projects/{projectId}/defects/{defectId}/publications` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-17 | POST | `/api/v1/projects/{projectId}/publications/{publicId}/withdraw` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-18 | GET | `/api/v1/public/publications/{publicId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| ADD-19 | GET | `/ready` | **đã có** | Operational health; không tính là nghiệp vụ PM/Sup. Không nằm trong Swagger runtime. |
| API-001 | POST | `/api/v1/admin/users/{userId}/password-reset` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-002 | POST | `/api/v1/auth/android/login` | **bị chặn** | Ngoài tác vụ Web PM/Sup: xác thực Android hoặc command Crew được giao; không cấp quyền bằng UI Web. |
| API-003 | POST | `/api/v1/auth/android/refresh` | **bị chặn** | Ngoài tác vụ Web PM/Sup: xác thực Android hoặc command Crew được giao; không cấp quyền bằng UI Web. |
| API-004 | POST | `/api/v1/auth/change-password` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-005 | POST | `/api/v1/auth/forced-password-change` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-006 | POST | `/api/v1/auth/login` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-007 | POST | `/api/v1/auth/logout` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-008 | POST | `/api/v1/auth/password-recovery-requests` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-009 | POST | `/api/v1/auth/refresh` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-010 | POST | `/api/v1/auth/reporter-registrations` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-011 | POST | `/api/v1/auth/reporter-registrations/resend` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-012 | POST | `/api/v1/auth/reporter-registrations/verify` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-013 | GET | `/api/v1/auth/web/csrf` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-014 | POST | `/api/v1/auth/web/login` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-015 | POST | `/api/v1/auth/web/logout` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-016 | POST | `/api/v1/auth/web/renew` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-017 | GET | `/api/v1/auth/web/session` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-018 | GET | `/api/v1/cases` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-019 | GET | `/api/v1/cases/{caseId}` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-020 | POST | `/api/v1/cases/{caseId}/conclusions` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-021 | POST | `/api/v1/cases/{caseId}/publications` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-022 | POST | `/api/v1/cases/{caseId}/report-links` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-023 | POST | `/api/v1/cases/{caseId}/report-splits` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-024 | POST | `/api/v1/cases/{caseId}/triage` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-025 | GET | `/api/v1/datasets/{datasetId}/coverage` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-026 | GET | `/api/v1/datasets/{id}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-027 | POST | `/api/v1/datasets/{id}/assessments` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-028 | GET | `/api/v1/datasets/{id}/assessments/{assessmentId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-029 | GET | `/api/v1/files/{fileId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-030 | GET | `/api/v1/files/{fileId}/content` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:1681 (surveyService.getFileContentUrl); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-031 | POST | `/api/v1/internal/processing-jobs/{jobId}/results` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-032 | POST | `/api/v1/invitations` | **đã có** | Callsite + caller hiện hữu: src/api/services/personnelService.ts:351 (personnelService.createInvitation); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-033 | POST | `/api/v1/invitations/accept` | **đã có** | Callsite + caller hiện hữu: src/api/services/invitationAcceptService.ts:16 (invitationAcceptService.accept); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-034 | POST | `/api/v1/labels/{labelId}/review` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-035 | GET | `/api/v1/me` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-036 | PATCH | `/api/v1/me` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-037 | GET | `/api/v1/me/inspection-tasks` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-038 | GET | `/api/v1/me/survey-tasks` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-039 | GET | `/api/v1/notifications` | **vừa nối** | notificationService + NotificationsHandoffHub (API039–042) |
| API-040 | GET | `/api/v1/notifications/{notificationId}` | **vừa nối** | notificationService + NotificationsHandoffHub (API039–042) |
| API-041 | POST | `/api/v1/notifications/{notificationId}/read` | **vừa nối** | notificationService + NotificationsHandoffHub (API039–042) |
| API-042 | GET | `/api/v1/notifications/{notificationId}/scope` | **vừa nối** | notificationService + NotificationsHandoffHub (API039–042) |
| API-043 | POST | `/api/v1/offline/uploads` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-044 | POST | `/api/v1/processing-jobs` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-045 | GET | `/api/v1/processing-jobs/{jobId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-046 | POST | `/api/v1/processing-jobs/{jobId}/retry` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-047 | GET | `/api/v1/profile` | **đã có** | Callsite + caller hiện hữu: src/api/services/profileService.ts:45 (profileService.getProfile); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-048 | PUT | `/api/v1/profile` | **đã có** | Callsite + caller hiện hữu: src/api/services/profileService.ts:113 (profileService.updateProfile); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-049 | GET | `/api/v1/projects` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| API-050 | POST | `/api/v1/projects` | **đã có** | Callsite + caller hiện hữu: src/api/services/projectService.ts:741 (projectService.createProject); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-051 | PUT | `/api/v1/projects/{projectId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/projectUpdateService.ts:51 (projectUpdateService.run); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-052 | GET | `/api/v1/projects/{projectId}/ai-candidates/{detectionId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-053 | POST | `/api/v1/projects/{projectId}/ai-mock-runs` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:853 (surveyService.simulateDroneFlightCompletion); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-054 | GET | `/api/v1/projects/{projectId}/ai-mock-runs/{runId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-055 | GET | `/api/v1/projects/{projectId}/ai-mock-runs/{runId}/result` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:529 (surveyService.getSurveys); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-056 | GET | `/api/v1/projects/{projectId}/baseline-selections` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:510 (surveyService.getSurveys); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-057 | POST | `/api/v1/projects/{projectId}/baseline-selections` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:2082 (surveyService.lockBaseline); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-058 | GET | `/api/v1/projects/{projectId}/baseline-selections/{id}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-059 | POST | `/api/v1/projects/{projectId}/candidate-decisions` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-060 | GET | `/api/v1/projects/{projectId}/candidate-decisions/{decisionId}` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-061 | GET | `/api/v1/projects/{projectId}/candidates` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-062 | GET | `/api/v1/projects/{projectId}/clocks` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-063 | POST | `/api/v1/projects/{projectId}/clocks/{clockId}/appointments` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-064 | POST | `/api/v1/projects/{projectId}/clocks/{clockId}/extensions` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-065 | GET | `/api/v1/projects/{projectId}/crs-profiles` | **đã có** | Callsite + caller hiện hữu: src/api/services/alignmentService.ts:337 (alignmentService.fetchCrsProfiles); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-066 | POST | `/api/v1/projects/{projectId}/crs-profiles` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-067 | GET | `/api/v1/projects/{projectId}/crs-profiles/{profileId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/alignmentService.ts:350 (alignmentService.readCrsProfile); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-068 | GET | `/api/v1/projects/{projectId}/defect-statistics` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-069 | POST | `/api/v1/projects/{projectId}/defect-statistics` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-070 | GET | `/api/v1/projects/{projectId}/defects` | **đã có** | Callsite + caller hiện hữu: src/api/services/fastTrackService.ts:388 (fastTrackService.getDefects); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-071 | GET | `/api/v1/projects/{projectId}/defects/{defectId}` | **đã có** | Giữ luồng auth/Case/candidate/readback hiện có; gồm caller local; không viết lại. Runtime chỉ theo các ca đã ghi nhận, không chứng nhận toàn contract. |
| API-072 | POST | `/api/v1/projects/{projectId}/defects/{defectId}/assessments` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:1573 (surveyService.assessDefect); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-073 | POST | `/api/v1/projects/{projectId}/defects/{defectId}/verification-decisions` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:1617 (surveyService.verifyDefect); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-074 | POST | `/api/v1/projects/{projectId}/exports` | **vừa nối** | projectExportService + modal: PM/Sup chọn dự án cụ thể, DOSSIER PDF/ZIP, exact body + Idempotency-Key; journal receipt→GET. Runtime POST202→GET200 PASS export20ba537b…; chi tiết ở mục nghiệm thu. |
| API-075 | GET | `/api/v1/projects/{projectId}/exports/{exportId}` | **vừa nối** | detail validates project/status/snapshot/hash/version/ETag; đổi actor/project fence. |
| API-076 | GET | `/api/v1/projects/{projectId}/exports/{exportId}/content` | **vừa nối** | chỉ tải SUCCEEDED chưa hết hạn; manifest/readiness, mediaType và SHA256 content ETag; binary lỗi không nuốt. |
| API-077 | GET | `/api/v1/projects/{projectId}/exports/{exportId}/manifest` | **vừa nối** | manifest khớp schemaVersion, project/snapshot/hash/kind/format/ETag, files/sections/sourceRevisions. |
| API-078 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks` | **đã có** | Đã gọi DB từ trước; đợt này sửa đi hết afterId/nextCursor, kiểm project/ID và không suy nguồn DRONE. |
| API-079 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks` | **vừa nối** | fieldCreateCommands.ts + MeasurementsTab: REPORTER/PRE_MEASUREMENT từ KEEP_NEW đã GET xác nhận. PM chọn Crew ACTIVE, Defect/version, type1–4, hạn xử lý. Tuyến bắt buộc từ Defect, CRS từ GET geometry; set/layout/slab/map tùy chọn. Scope JSON object {}; phương pháp giữ trong instructions. Runtime PASS task 574b3f4c-0778-4564-baea-35398b298ce2: 1 POST201→GET task/list200→F5 GET200, không POST mới; submission/readiness NOT_RUN. Survey và thiếu reference bị chặn rõ. |
| API-080 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}` | **vừa nối** | fieldTaskReadService / fieldReviewCommands + modal chi tiết FIELD; test mô phỏng, chưa POST runtime. |
| API-081 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/accept` | **bị chặn** | Ngoài tác vụ Web PM/Sup: xác thực Android hoặc command Crew được giao; không cấp quyền bằng UI Web. |
| API-082 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/assign` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-083 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/cancel` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-084 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence-reuse` | **vừa nối** | fieldEvidenceReuseCommands + modal hiện có: nguồn Report từ KEEP_NEW reference→GET Case/Report/evidence; ảnh gốc→SHA256; PM chọn ảnh/lý do; preflight task/version/source/hash→POST receipt→GET task/file metadata. Journal timeout/F5 giữ key/body/version; có receipt chỉ GET. DRONE/chưa có Report reference bị chặn rõ. Runtime nguồn/ảnh GET PASS; mutation NOT_RUN. |
| API-085 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence/{fileId}` | **vừa nối** | fieldTaskReadService / fieldReviewCommands + modal chi tiết FIELD; test mô phỏng, chưa POST runtime. |
| API-086 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/evidence/{fileId}/content` | **vừa nối** | fieldTaskReadService / fieldReviewCommands + modal chi tiết FIELD; test mô phỏng, chưa POST runtime. |
| API-087 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/geometry` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-088 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/history` | **vừa nối** | fieldTaskReadService / fieldReviewCommands + modal chi tiết FIELD; test mô phỏng, chưa POST runtime. |
| API-089 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/location-impact-decisions` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-090 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reassign` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-091 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reject` | **bị chặn** | Ngoài tác vụ Web PM/Sup: xác thực Android hoặc command Crew được giao; không cấp quyền bằng UI Web. |
| API-092 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/reviews` | **vừa nối** | fieldTaskReadService / fieldReviewCommands + modal chi tiết FIELD; test mô phỏng, chưa POST runtime. |
| API-093 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/start` | **bị chặn** | Ngoài tác vụ Web PM/Sup: xác thực Android hoặc command Crew được giao; không cấp quyền bằng UI Web. |
| API-094 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/start-origin` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-095 | POST | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/submissions` | **bị chặn** | Ngoài tác vụ Web PM/Sup: xác thực Android hoặc command Crew được giao; không cấp quyền bằng UI Web. |
| API-096 | GET | `/api/v1/projects/{projectId}/field-inspection-tasks/{taskId}/submissions/{submissionId}` | **vừa nối** | fieldTaskReadService / fieldReviewCommands + modal chi tiết FIELD; test mô phỏng, chưa POST runtime. |
| API-097 | GET | `/api/v1/projects/{projectId}/geometry-location-impacts` | **đã có** | Callsite + caller hiện hữu: src/api/services/geometryImpactService.ts:46 (geometryImpactService.list); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-098 | POST | `/api/v1/projects/{projectId}/geometry-location-impacts` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-099 | GET | `/api/v1/projects/{projectId}/geometry-location-impacts/{impactId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/geometryImpactService.ts:55 (geometryImpactService.readImpact); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-100 | POST | `/api/v1/projects/{projectId}/geometry-location-impacts/{impactId}/decisions` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-101 | POST | `/api/v1/projects/{projectId}/geometry-map-publications` | **đã có** | Callsite + caller hiện hữu: src/api/services/mapPublicationService.ts:61 (mapPublicationService.publish); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-102 | GET | `/api/v1/projects/{projectId}/geometry-map-publications/{publicationId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/mapPublicationService.ts:27 (mapPublicationService.read); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-103 | GET | `/api/v1/projects/{projectId}/geometry-map-publications/{publicationId}/layers/{layer}` | **đã có** | Callsite + caller hiện hữu: src/api/services/mapPublicationService.ts:84 (mapPublicationService.page); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-104 | GET | `/api/v1/projects/{projectId}/geometry-package` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| API-105 | GET | `/api/v1/projects/{projectId}/labels` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-106 | POST | `/api/v1/projects/{projectId}/labels` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-107 | GET | `/api/v1/projects/{projectId}/labels/{labelId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-108 | POST | `/api/v1/projects/{projectId}/labels/{labelId}/revisions` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-109 | GET | `/api/v1/projects/{projectId}/lifecycle` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-110 | POST | `/api/v1/projects/{projectId}/lifecycle/{command}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-111 | POST | `/api/v1/projects/{projectId}/lifecycle/renewed-handling-scope` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-112 | GET | `/api/v1/projects/{projectId}/members` | **đã có** | Callsite + caller hiện hữu: src/api/services/fastTrackService.ts:436 (fastTrackService.getCrews); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-113 | POST | `/api/v1/projects/{projectId}/offline/artifacts` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-114 | GET | `/api/v1/projects/{projectId}/offline/artifacts/{artifactId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-115 | GET | `/api/v1/projects/{projectId}/offline/batches/{batchId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-116 | POST | `/api/v1/projects/{projectId}/offline/devices` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-117 | GET | `/api/v1/projects/{projectId}/offline/devices/{registrationId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-118 | POST | `/api/v1/projects/{projectId}/offline/devices/{registrationId}/revoke` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-119 | POST | `/api/v1/projects/{projectId}/offline/grants` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-120 | GET | `/api/v1/projects/{projectId}/offline/grants/{grantId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-121 | POST | `/api/v1/projects/{projectId}/offline/grants/{grantId}/revoke` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-122 | POST | `/api/v1/projects/{projectId}/offline/import` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-123 | GET | `/api/v1/projects/{projectId}/offline/origins/{originId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-124 | GET | `/api/v1/projects/{projectId}/offline/packages/{packageId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-125 | POST | `/api/v1/projects/{projectId}/offline/packages/export` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-126 | POST | `/api/v1/projects/{projectId}/offline/packages/prepare` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-127 | POST | `/api/v1/projects/{projectId}/offline/snapshots` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-128 | GET | `/api/v1/projects/{projectId}/offline/snapshots/{snapshotId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-129 | POST | `/api/v1/projects/{projectId}/offline/starts/reconcile` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-130 | POST | `/api/v1/projects/{projectId}/offline/sync` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-131 | GET | `/api/v1/projects/{projectId}/pavement-layouts/{layoutId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/pavementService.ts:96 (pavementService.read); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-132 | POST | `/api/v1/projects/{projectId}/pavement-layouts/as-built` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-133 | GET | `/api/v1/projects/{projectId}/primary-project-manager` | **đã có** | Callsite + caller hiện hữu: src/api/services/personnelService.ts:377 (personnelService.getPrimaryProjectManager); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-134 | PUT | `/api/v1/projects/{projectId}/primary-project-manager` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-135 | GET | `/api/v1/projects/{projectId}/receiving-requests` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-136 | GET | `/api/v1/projects/{projectId}/receiving-requests/{requestId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-137 | POST | `/api/v1/projects/{projectId}/receiving-requests/{requestId}/ack` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-138 | POST | `/api/v1/projects/{projectId}/receiving-requests/{requestId}/appointment` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-139 | POST | `/api/v1/projects/{projectId}/repair-packages` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-140 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-141 | GET | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-142 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/approve` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-143 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/assign` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-144 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/cancellations` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-145 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/corrections` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-146 | GET | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/eligibility` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-147 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/final-confirmation` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-148 | GET | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/history` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-149 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/normal-successors` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-150 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/review-requests` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-151 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-152 | GET | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-153 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}/checks` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-154 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}/installation` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-155 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/safety-measures/{measureId}/warnings/{warningId}/acknowledgement` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-156 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/assessment` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-157 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-158 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/reviews` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-159 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/attempts/supplements` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-160 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/execution-finish` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-161 | POST | `/api/v1/projects/{projectId}/repair-packages/{packageId}/items/{itemId}/tasks/{taskId}/execution-start` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-162 | POST | `/api/v1/projects/{projectId}/repair-policies/drafts` | **đã có** | Callsite + caller hiện hữu: src/api/services/fastTrackService.ts:307 (fastTrackService.createPolicyDraft); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-163 | GET | `/api/v1/projects/{projectId}/repair-policies/drafts/{draftId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-164 | PUT | `/api/v1/projects/{projectId}/repair-policies/drafts/{draftId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-165 | POST | `/api/v1/projects/{projectId}/repair-policies/drafts/{draftId}/publish` | **đã có** | Callsite + caller hiện hữu: src/api/services/fastTrackService.ts:329 (fastTrackService.publishPolicy); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-166 | GET | `/api/v1/projects/{projectId}/repair-policies/revisions/{revisionId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-167 | POST | `/api/v1/projects/{projectId}/repair-policies/revisions/{revisionId}/revoke` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-168 | GET | `/api/v1/projects/{projectId}/reports/items` | **vừa nối** | projectReportingService + ReportingMetricsPanel: Chi tiết metric, pagination cursor/pageSize100, đúng metric/version/reference; availability tổng hợp mức thiếu dữ liệu qua các trang; không trả JSON thô. |
| API-169 | GET | `/api/v1/projects/{projectId}/reports/summary` | **vừa nối** | projectReportingService + ReportingMetricsPanel: Summary giữ code/unit/dimensions/periodApplicable/value/numerator/denominator/availability/reasonCodes/sourceRefs; null/UNAVAILABLE không thành0; không thay thế SLA/tái phát/toàn vẹn. |
| API-170 | GET | `/api/v1/projects/{projectId}/reports/timeline` | **vừa nối** | projectReportingService + ReportingMetricsPanel: Project timeline theo kỳ; pagination cursor, PARTIAL/reasonCodes thật. Không gửi geometry filter mà BE chưa hỗ trợ; ghi rõ lịch sử toàn dự án. |
| API-171 | POST | `/api/v1/projects/{projectId}/retention/evaluations` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-172 | GET | `/api/v1/projects/{projectId}/retention/evaluations/{id}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-173 | GET | `/api/v1/projects/{projectId}/retention/files/{fileId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-174 | PUT | `/api/v1/projects/{projectId}/retention/files/{fileId}/basis` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-175 | GET | `/api/v1/projects/{projectId}/road-coverage` | **đã có** | Callsite + caller hiện hữu: src/api/services/fastTrackService.ts:166 (fastTrackService.getRoadCoverage); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-176 | POST | `/api/v1/projects/{projectId}/road-coverage` | **đã có** | Callsite + caller hiện hữu: src/api/services/fastTrackService.ts:227 (fastTrackService.confirmRoadCoverage); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-177 | POST | `/api/v1/projects/{projectId}/road-geometry-drafts` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-178 | GET | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-179 | PUT | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-180 | POST | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/confirm` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-181 | POST | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/preview` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-182 | GET | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/readiness` | **đã có** | Callsite + caller hiện hữu: src/api/services/alignmentService.ts:322 (alignmentService.readDraftReadiness); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-183 | POST | `/api/v1/projects/{projectId}/road-sections` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-184 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-185 | GET | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts/{draftId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-186 | PUT | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts/{draftId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-187 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts/{draftId}/confirm` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-188 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/geometry-drafts/{draftId}/preview` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-189 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/survey-plans` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-190 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/survey-requests` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-191 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-192 | GET | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/geometry` | **đã có** | Callsite + caller hiện hữu: src/api/services/alignmentService.ts:329 (alignmentService.readConfirmedGeometry); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-193 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-194 | GET | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets/{setId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/pavementService.ts:71 (pavementService.discover); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-195 | PUT | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets/{setId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-196 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets/{setId}/publish` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-197 | POST | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets/preview` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-198 | GET | `/api/v1/projects/{projectId}/route-systems` | **đã có** | Callsite + caller hiện hữu: src/api/services/alignmentService.ts:343 (alignmentService.fetchRouteSystems); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-199 | POST | `/api/v1/projects/{projectId}/route-systems` | **đã có** | Callsite + caller hiện hữu: src/api/services/routeSystemCommands.ts:24 (routeSystemCommands.run); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-200 | POST | `/api/v1/projects/{projectId}/route-versions/{routeVersionId}/segment-sets/{segmentSetId}/pavement-plans` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-201 | POST | `/api/v1/projects/{projectId}/survey-plans` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyCreateCommands.ts:35 (surveyCreateCommands.run); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-202 | POST | `/api/v1/projects/{projectId}/survey-plans/{surveyPlanId}/postpone` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-203 | POST | `/api/v1/projects/{projectId}/survey-tasks` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyCreateCommands.ts:38 (surveyCreateCommands.run); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-204 | POST | `/api/v1/projects/{projectId}/validation-runs` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-205 | POST | `/api/v1/projects/{projectId}/warranties` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-206 | GET | `/api/v1/projects/{projectId}/weekly-digests/{digestId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-207 | GET | `/api/v1/projects/{projectId}/work-package` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| API-208 | GET | `/api/v1/reporter-evidence/files/{fileId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-209 | GET | `/api/v1/reporter-evidence/files/{fileId}/content` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-210 | GET | `/api/v1/reporter-evidence/publications/{publicationId}/reports/{reportId}/evidence/{evidenceId}/content` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-211 | POST | `/api/v1/reporter-evidence/uploads` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-212 | GET | `/api/v1/reporter-evidence/uploads/{uploadId}` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-213 | POST | `/api/v1/reporter-evidence/uploads/{uploadId}/complete` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-214 | POST | `/api/v1/reporter-evidence/uploads/{uploadId}/part-urls` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-215 | GET | `/api/v1/reports` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-216 | POST | `/api/v1/reports` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-217 | GET | `/api/v1/reports/{reportId}` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-218 | GET | `/api/v1/reports/{reportId}/evidence/{evidenceId}/download` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-219 | POST | `/api/v1/reports/{reportId}/supplements` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| API-220 | POST | `/api/v1/retention/holds` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-221 | GET | `/api/v1/retention/holds/{id}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-222 | POST | `/api/v1/retention/holds/{id}/release` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-223 | GET | `/api/v1/survey-plans/{id}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-224 | POST | `/api/v1/survey-plans/{planId}/postpone` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-225 | GET | `/api/v1/survey-tasks/{id}/work-package` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| API-226 | GET | `/api/v1/survey-tasks/{taskId}` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:1890 (surveyService.requestReFlight); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-227 | POST | `/api/v1/survey-tasks/{taskId}/accept` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-228 | POST | `/api/v1/survey-tasks/{taskId}/cancel` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-229 | POST | `/api/v1/survey-tasks/{taskId}/datasets` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-230 | POST | `/api/v1/survey-tasks/{taskId}/decline` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-231 | POST | `/api/v1/survey-tasks/{taskId}/reassign` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-232 | POST | `/api/v1/survey-tasks/{taskId}/supplements` | **đã có** | Callsite + caller hiện hữu: src/api/services/surveyService.ts:1925 (surveyService.requestReFlight); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-233 | POST | `/api/v1/uploads` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-234 | GET | `/api/v1/uploads/{uploadId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-235 | POST | `/api/v1/uploads/{uploadId}/complete` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-236 | POST | `/api/v1/uploads/{uploadId}/part-urls` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-237 | GET | `/api/v1/users` | **đã có** | Callsite + caller hiện hữu: src/api/services/personnelService.ts:173 (personnelService.fetchStaffDirectory); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| API-238 | GET | `/api/v1/users/{userId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-239 | PATCH | `/api/v1/users/{userId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-240 | POST | `/api/v1/users/{userId}/password-reset` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| API-241 | GET | `/api/v1/validation-runs/{runId}` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| CaseReportDetailsController.Download | GET | `/api/v1/cases/{caseId}/reports/{reportId}/evidence/{evidenceId}/content` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| CaseReportDetailsController.List | GET | `/api/v1/cases/{caseId}/reports` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| MeController.GetPhoneNumber | GET | `/api/v1/me/phone-number` | **đã có** | Callsite + caller hiện hữu: src/api/services/profileService.ts:170 (selfPhoneService.read); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| MeController.UpdatePhoneNumber | PATCH | `/api/v1/me/phone-number` | **đã có** | Callsite + caller hiện hữu: src/api/services/profileService.ts:198 (selfPhoneService.save); chưa chứng nhận đầy đủ DTO/quyền/runtime trong đợt. |
| Chưa có mã trong catalog | GET | `/api/v1/catalog/defect-types` | **đã có** | Caller đang có: projectService / triageService / caseReportService / triageGeometryService / defectTypeCatalog; giữ nguyên. |
| Chưa có mã trong catalog | GET | `/api/v1/projects/{projectId}/members/eligible` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | GET | `/api/v1/projects/{projectId}/road-geometry-submission` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | GET | `/api/v1/projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/segment-sets/{segmentSetId}/pavement-layouts` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | GET | `/api/v1/survey-tasks/{taskId}/eligible-drones` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | PATCH | `/api/v1/users/{userId}/phone-number` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | POST | `/api/v1/projects/{projectId}/members` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | POST | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/reject` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | POST | `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/submit` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
| Chưa có mã trong catalog | POST | `/api/v1/reporter-evidence/uploads/{uploadId}/cancel` | **bị chặn** | Producer/quyền Reporter riêng; PM đọc nguồn qua Case reports, không giả tài khoản Reporter. |
| Chưa có mã trong catalog | POST | `/api/v1/uploads/{uploadId}/cancel` | **chưa làm** | Chưa rà đủ service + caller + state trong đợt; không khẳng định API chưa có code. |
