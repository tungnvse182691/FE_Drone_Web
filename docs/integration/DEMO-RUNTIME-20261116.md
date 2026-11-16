# Runtime demo TEST-E2E-20261116 — trạng thái kiểm chứng

Revision Docker xác nhận trước chạy: **b89a52fe11ed146f197f3f94e115530b9b75afb0**. Không sửa BE/DB/Mobile, không seed SQL. Quyền mới của Hoàng cho phép mutation trong bộ TEST; dữ liệu/fixture/journal cũ giữ nguyên. Credential lấy riêng từ `/handoff/demo-accounts.json`, token/password chỉ RAM, không lưu report hoặc Git. Sup/PM dùng cookie + CSRF; Reporter/Crew/Operator dùng credential đúng role, không giả PM thành Crew.

## Dữ liệu thật và kết quả

| Bộ | Project ID | FIELD PRE task ID | Kết quả |
| --- | --- | --- | --- |
| TEST-E2E-20261116-1 | 4485d5c6-b617-4240-9d4b-07da5e13b43e | 54d7eb22-9a5c-4b39-a929-179ad55110bf | Geometry CONFIRMED, review round2, set PUBLISHED; FIELD SupplementRequired; Normal và FastTrack Assigned; export PDF/ZIP SUCCEEDED |
| TEST-E2E-20261116-2 | c11afb21-e4f9-4215-9e4f-2b6eaf528ca7 | 73283b34-65c1-462f-afd9-37f78f049421 | Như bộ1; Area UNKNOWN, không đổi thành0 |
| TEST-E2E-20261116-3 | d030222d-14fd-427e-99a4-d0a57be42f4b | b6623dee-540b-4a75-9739-3e6fea79fc75 | Như bộ2; riêng ID/receipt/version |

**Hình học:** Sup POST project201 → PM draft201 → submit201 → Sup reject200 → PM PUT cùng draft200. Lần sửa chỉ lý do bị BE từ chối resubmit409 `road_geometry_submission_unchanged`. Không đổi key lệnh đó để né lỗi: giữ response, tạo ý định PUT nội dung test mới (widthProfile7→7.1m, surveyWidth12→13m), cùng draft; submit nội dung mới201 → Sup confirm201 → segment set create201/publish200 → PM/Sup GET. Tim tuyến là tọa độ fixture synthetic, không phải khảo sát thực địa. Bộ1 Web PM/Sup đọc xác nhận round2 và previousRejection, F5 vẫn cùng hồ sơ. Không kiểm PLANNED/SAMPLE thành OFFICIAL; Tấm/Khe chưa chạy runtime.

**Phản ánh/FIELD:** Reporter dùng bằng chứng synthetic sở hữu sẵn, metadata VERIFIED → tạo3 Report mới201 → Sup triage200 đúng dự án → PM candidates200/KEEP_NEW201 → Defect GET200 trạng thái OPEN → PM membership Crew201/task201 → Crew accept201/start201 → upload MEASUREMENT201/signed PUT/complete202/GET VERIFIED → submission201. Ảnh tạo có chữ **TEST E2E / SYNTHETIC IMAGE / NOT FIELD EVIDENCE / LOCATION UNKNOWN**; không gắn GPS hoặc tuyên bố đã đối chiếu ngoài thực tế. Bộ1 Area KNOWN0 m², bộ2/3 UNKNOWN null + reason; LOCATION_UNKNOWN giữ nguyên.

Lỗi script ban đầu dùng client origin thay vì ID của start receipt gây404 not_found; đã lưu nguyên response, sửa tham chiếu bằng receipt thật trong ý định submission hợp lệ. Lần thử decision `ACCEPT` đầu là literal sai; không coi response409 đó là chứng minh contract ACCEPT hợp lệ. Đã nộp bản bổ sung đúng lineage và thử **CONFIRM** canonical: cả3 trả409 `field_result_insufficient`; PM SUPPLEMENT201 và GET SupplementRequired. Source `FieldInspectionReview` chỉ CONFIRM/NO_DEFECT/SUPPLEMENT; `FieldInspectionWorkflowRepository.Intake.ReviewAsync` kiểm readiness. Không ép LOCATION_UNKNOWN thành vị trí xác nhận. Defect vẫn OPEN; không gọi FIELD COMPLETED hoặc Defect VERIFIED.

**Normal/FastTrack:** mỗi project có scope độc lập3–4m FastTrack,5–6m Normal. PM package201/propose201; Normal Sup approve201→GET ReadyToAssign; FastTrack draft policy201/publish201 đúng checklist/Area m². PM assign201 cho cả2 mode → GET item Assigned/PM task/Crew task. Crew repairContext có đúng item/package/checklist; PM repairContext null đúng quyền BE. Eligibility FT200, eligible=false, thiếu assessment/coverage/current execution authority/first start. Không bắt đầu hoặc hoàn tất thi công, không REAL_SOURCE.

**Xuất:** mỗi project tạo PDF202 và ZIP202→GET SUCCEEDED→manifest200→content200. PDF4 trang, kiểm parse pypdf có đúng projectId/snapshotId/PARTIAL. ZIP có manifest.json/evidence-index.json/dossier.pdf, testzip không lỗi. SHA256 nội dung khớp strong ETag. Sau FIELD/repair, mỗi project tạo thêm PDF snapshot mới SUCCEEDED; không sửa snapshot cũ. PDF không có tên project marker, có project UUID đúng scope — giới hạn renderer BE, không tuyên bố có tên khi không có. Hồ sơ giữ PARTIAL vì các nguồn còn thiếu.

**Nhánh độc lập:** Operator đăng nhập đúng role, GET me/projects200; GET me/inspection-tasks403 (route đó không dành Operator), chưa tạo khảo sát/Drone/AI. Notifications PM/Sup GET200; chưa kiểm đọc thông báo qua Web. Retention/lifecycle và Case conclusions khác chưa chạy đầy đủ. Không gọi các nhánh này PASS.

## Bằng chứng, resume và giới hạn

- `artifacts/demo-e2e-20261116/progress.json`: project/draft/geometry/segments/PDF/ZIP key/body/ETag/receipt/readback.
- `field-progress.json`: Reporter/Sup/PM/Crew flow, ảnh, KNOWN0/UNKNOWN, canonical confirm409 và supplement201.
- `repair-progress.json`: Normal/FT packages/policies/bindings/Crew context/eligibility và PDF sau dữ liệu mới.
- `runtime-summary.json`, `pdf-content-check.json`, PDF/ZIP và ảnh synthetic; không commit private toàn artifacts.
- Script nguồn ở `tools/runtime-demo/`, yêu cầu opt-in `RG_RUNTIME_DEMO_WRITE=TEST-E2E-20261116`. Chạy từ repo; tiến độ đã có không tạo trùng. Đây là harness kiểm thủ công có các request lỗi được giữ, không phải collection chạy toàn bộ. `run.py` khởi tạo3 bộ; script kế tiếp dùng cùng ledger. Không chạy đồng thời các script ghi cùng ledger. `field.py`/`field_finish.py` giữ lịch sử lần sửa request; trạng thái canonical cuối ở `canonical_review.py`. Không đổi key/body của lệnh cũ; receipt chỉ đọc.

## UI và lỗi FE sửa từ runtime

1. FIELD list in `mm` dù Area chưa có số đo trong DTO list; modal cũ nói chưa nộp và tự kết luận vượt ngưỡng. Đã bỏ giả định, dùng số đo/unit/KNOWN/UNKNOWN từ GET submission;0 m² vẫn0.
2. Bỏ UUID/version/hash/JSON khỏi mặc định FIELD detail/history/photo, FastTrack defect detail/audit/history, phản ánh nguồn, export list/detail. Giữ kiểm hash/ETag ở code. Export dùng HS-mã ngắn, tên dự án và giờ VN; trạng thái đầy đủ PARTIAL giữ.
3. Thông báo trạng thái/lý do người dùng bằng tiếng Việt; không show mã lỗi/correlation mặc định trong các form đã sửa. Không thay layout/modal bằng debug table. Không reset local.

Đã rà diff UI phạm vi rộng từ b822999: Dự án list/create/detail/member/warranty; Intake Report/KEEP_NEW; FIELD list/detail/review/photo; Gói list/create/detail/Normal; FastTrack policy/coverage/dispatch/history; Reports export/list/detail. Browser PM/Sup đã mở và đọc6 nhóm project/intake/FIELD/package/FastTrack, kiểm UUID mặc định; FIELD Sup detail có thật số0/ảnh/review và export PM detail PARTIAL không UUID. **Chưa hoàn tất kiểm từng modal/drawer ở cả2 role, mọi nhánh error/loading/empty/F5, hoặc ảnh trước/sau đủ từng màn.** Không coi ma trận trang mở được là nghiệm thu đầy đủ yêu cầu UI mới.

Ảnh sau đã lưu `sup-field-after.png`, `pm-export-after.png`. Một số ảnh trước của lượt trước ở `artifacts/fasttrack-cross-menu/` và `artifacts/fasttrack-pm-sup-complete/`; không có đầy đủ cặp trước/sau đồng nhất mọi màn. Cần tiếp tục audit, không tạo ảnh “trước” giả.

## Mở Web demo ngay

1. PM/Sup → Dự án → tìm `TEST-E2E-20261116-1…3` → chi tiết/tim tuyến/phân đoạn. Có dữ liệu đã xác nhận và lịch sử từ chối, không cần tạo lại.
2. PM/Sup → FIELD → chọn project TEST tương ứng → mở phiếu PRE theo task IDs bảng trên. Có submission2, ảnh TEST, số0/UNKNOWN và trạng thái cần bổ sung. PM có thể đọc lịch sử; không demo “xác nhận đạt” với nguồn LOCATION_UNKNOWN.
3. PM/Sup → Gói sửa chữa → chọn project TEST → đọc Normal/FastTrack đã giao. Chưa thi công, eligibility false. Không được tự giao lại hoặc đổi pin.
4. **PM-A là creator export** → Báo cáo → chọn project TEST → xem/tải PDF/ZIP đã tạo. Sup đọc catalog export của PM có thể403 đúng creator-only; không đổi role để vượt guard. Web PM đã đọc detail PARTIAL, bấm tải, F5; API kiểm bytes/manifest đầy đủ hơn UI.

Chưa phải “full PASS”: còn FIELD vị trí thực không được phép giả, attach-handover/read checklist BE, survey/AI/retention chưa chạy, audit UI toàn modal và các thao tác runtime qua Web còn chưa đủ. Dữ liệu Crew chạy bằng API, không phải Mobile/Web Crew; mutations PM/Sup chủ yếu harness HTTP, Web mới kiểm phần đọc và tải nêu trên.

## Bổ sung kiểm ba phát hiện UI

- FIELD giữ vùng ảnh bên trái, submission/số đo bên phải của modal hiện có; giữ các tab/so sánh ảnh khi có nguồn. Không còn panel submission/ảnh riêng phía trên.
- Lightbox dùng số đo KNOWN và đơn vị từ submission; UNKNOWN không đổi thành0. Bỏ GPS, thiết bị, thời gian và mm giả định, không kết luận vượt ngưỡng. Không có nguồn thì ghi chưa xác định.
- Export khôi phục5 phần thiếu từ missingSections/manifest bằng tiếng Việt; vẫn PARTIAL, không phơi reasonCodes.
- Browser Sup mở task7328, submission2 UNKNOWN, tải ảnh synthetic và mở lightbox; PM mở task54D7 đọc0m² và lịch sử7 sự kiện; PM mở exportHS-B100A1EA đọc đủ5 giải thích phần thiếu. Không tạo lại TEST hoặc sửa journal.
- Ảnh bổ sung: sup-field-unknown-lightbox-after.png, pm-field-zero-placed-after.png, pm-export-missing-vietnamese-after.png trong artifacts/demo-e2e-20261116. Ảnh trước: sup-field-after.png, pm-export-after.png (checkpoint trước sửa ba phát hiện).
- Typecheck/build qua; regression FIELD read8, create9, export12, FastTrack23 và kiểm trình bày lightbox/export qua. Đây là kiểm các phần nêu trên, không phải toàn bộ audit UI/runtime đã hoàn tất.

## Tiếp tục nhánh độc lập sau sửa ba phát hiện

Runtime vẫn b89a52fe11ed. Không tạo lại geometry/FIELD/repair/export cũ. Tạo thêm đúng3 kế hoạch,3 nhiệm vụ khảo sát,3 video TEST và3 dataset trên3 dự án hiện có; progress riêng survey-progress.json. Video MP4 được mã hóa thật, chữ SYNTHETIC VIDEO - NOT A FLIGHT / NO GPS / NO FIELD VERIFICATION, không phải chuyến bay hoặc căn cứ thực địa. Lần tạo video đầu không có frame cho ra0 byte đã bị assert local chặn trước upload; đã ghi hình canvas có frame, không giả extension/header.

- PM cookie/CSRF: thêm Operator đúng membership → plan201 → task201. Operator bearer đúng tài khoản accept200 → GET task ACCEPTED, PM/Sup GET200, work-package và eligible-drones200. Task IDs: c2d2c79a-9340-41f7-9be9-9009e530bed7;5502c6bd-a2d3-442d-a45d-0f8c30f936fa;7205e586-0464-4ea4-8acd-9f3cabd6b64b.
- Operator upload SURVEY_VIDEO đúng project/task → signed PUT → complete202 → VERIFIED, submit dataset201 → GET dataset/coverage/task. Dataset IDs:09c40f82-f000-4a4c-ad69-0472647b84f8;469da6e7-3eba-45c5-ab2d-5e6e3cce3558;07a0c281-c5ac-4c83-9ef3-ea605e0067a7. Task SUBMITTED, integrity PASSED chỉ là toàn vẹn tệp; telemetry MISSING, positionCoverage/qualityCoverage/overallCoverage UNKNOWN. Không gửi telemetry, đánh giá đạt, AI detection giả hoặc callback nội bộ.
- Nhánh lưu trữ: Sup đánh giá retention202 trên3 video vừa nộp → GET COMPLETE, PM/Sup đọc200. Cả3 WAITING_RETENTION_BASIS: inventory incomplete, basis unconfirmed/stale, thiếu repair references. Không xác nhận basis, không hold/release hoặc xóa file. Receipt evaluation IDs:eba28fa8-3aad-427c-b079-8184e06706ff;5f68f921-5c25-4e15-82d6-dd9ab5469fed;7e50a898-f73e-4ae8-8f13-25ea61a6e661. Ledger retention-progress.json.
- Retention cookie GET thực tế401 cả3; source RetentionController không WebCookieEligible. Harness tách bearer đúng Sup/PM chỉ cho retention, xác minh userId khớp, không fallback khi401; token chỉRAM. Endpoint tạm: GET project/retention/files/{id}, POST project/retention/evaluations, GET project/retention/evaluations/{id}. BE cần WebSession+CSRF cho controller này. Đây là API runtime, chưa coi Web lưu trữ đã nghiệm thu.
- AI processing chưa chạy: OpenAPI /processing-jobs bắt buộc modelVersionId/preprocessingVersion/configVersion; canonical hiện không có collection models/config/preprocessing. Source ProcessingV2Service.CreateAsync và ProcessingV2PersistenceService.CreateAsync yêu cầu model Released. Chưa có nguồn hợp lệ để chọn, không lấy ID seed test hoặc tự dựng phiên bản. Dataset không có telemetry nên không được tự tạo vị trí/coverage đạt để nối AI.

Browser bổ sung: PM/Sup survey task detail, PM F5 giữ cùng task; Sup FIELD UNKNOWN/photo/lightbox; PM FIELD0m²/history; PM/Sup FastTrack chi tiết lý do chưa đủ điều kiện và Sup form độ phủ thiếu hồ sơ bàn giao; PM policy nhập trực tiếp Area0, không chọnDepth, không bấm lưu/publish (Network không POST); PM/Sup phản ánh drawer ảnh, PM phóng to; PM package list/detail/create form; Sup project create/warranty form, PM project/member form; Sup KPI mở các details nguồn và lỗi quyền export. Không gửi mutation từ các form audit này, không sửa policy đã lưu.

UI sửa tiếp: lý do eligibility tiếngViệt theo RepairFtEligibility; không dùng tổng package làm pending approval/SLA; KPI thiếu nguồn không dựng thẻ0; export form không phơi key/body/correlation; drawer phản ánh ngàyVN/trạng thái/phương thức, GPS từ đúng ảnh đang chọn (UNKNOWN không dùng Case.gps), bỏ RTK/GSD/thiết bị giả; package status tiếngViệt, segment tùy chọn ghi đúng; nhân sự không phơi role/status code. Giữ style và guard/journal.

Ảnh bổ sung ở artifacts/demo-e2e-20261116: pm-policy-area-zero-form-after.jpg, pm-package-detail-after.jpg, pm-project-member-form-after.jpg, sup-case-drawer-before.jpg/sup-case-drawer-after.jpg, pm-case-photo-unknown-after.jpg; pm-survey-accepted-detail.png/sup-survey-detail-after.png và sup-fasttrack-business-reasons-after.png là ảnhJPEG thực (tên legacyPNG). Chưa có ảnh trước/sau đầy đủ mọi modal. Chưa hoàn tất audit toàn bộ screen/modal, error/loading/F5 của mọi nhóm; không tuyên bố fullPASS.

### Lượt browser tiếp theo (không dừng ở commit ba phát hiện)

- Sup mở Normal đã Assigned: không còn form phê duyệt rỗng; PM/Sup detail dùng trạng thái tiếngViệt. Test vẫn giữ recovery của receipt phê duyệt cũ khi bản đã đổi trạng thái.
- Sup bảo hành: điền ngày17/16/15 sai thứ tự trực tiếp trên input (thực tế bàn giao16/11, bắt đầu15/11, kết thúc14/11), hiển thị2 lỗi tại form; không bấm gửi. Độ phủ điền bắt đầu17/11/kết thúc16/11, giữ ý kiến, lỗi ngày và thiếu handover ở đúng vị trí; không POST. Ảnh sup-warranty-date-validation-after.jpg, sup-coverage-source-date-validation-after.jpg.
- Sup khảo sát F5 đọc task đã SUBMITTED sau dataset, ảnh sup-survey-submitted-f5-after.jpg. PM/Sup KPI mở toàn bộ details, không UUID/APIcode/reasoncode; ảnh pm-kpi-expanded-after.jpg/sup-kpi-expanded-after.jpg.
- FIELD Sup không còn nút tạo nhiệm vụ trái quyền. PM mở create, chọn tuyến và bộ công bố từ dropdown thật, GET hồ sơ hình học thành công; không nhập ID hoặc tạo task. Ảnh pm-field-create-source-form-after.jpg. PM mở reuse của Normal task: thiếu tham chiếu quyết định trong phiênWeb hiện tại được báo rõ; không bịa nguồn; ảnh pm-field-reuse-missing-source-after.jpg. Không hash/UUID/API084 trên form; GPSUNKNOWN giữ nguyên. Sup modal nguồn tại sup-field-submission-placed-after.jpg.
- Bổ sung sửa nhãn/error vùng FIELD/reuse và TriageGeometryScope, không thay layout; chưa có nguồn đọc lại quyết định đã tạo quaAPI để Web tự khôi phục lineage này, nên reuse không được gọi demo hoàn tất.

Các thay đổi local của người dùng ở conflictService, repair-proposals/data và mockData, AcceptanceList, evidence-closeout, proposal-approval được giữ ngoài commit.

### Nhật ký và kiểm tiếp FIELD

Phát hiện FE audit lọc bằng ngày cố định10/10/2026 nên mất toàn bộ sự kiện TEST tháng11. Đã dùng đồng hồ hiện hành; browser PM đọc13 sự kiện toàn danh mục/3 sự kiện dự án TEST1. Sửa lỗi đọc không còn unhandled/empty success, nguồn partial được ghi rõ, refreshA không đèB, đổi actor không giữ drawer/export, event mãSK ngắn, filter action/entity lấy từ các sự kiện đã đọc. Trước/sau thiếu nguồn không còn gọi khởi tạo/không đổi. Không giả đủ audit hoặc xuất nhật ký thành công. Canonical không hỗ trợ export nhật ký riêng; form hiển thị giới hạn và lỗi thao tác, hướng người dùng sang Báo cáo KPI. Test actual page check-audit-read-ui.cjs kiểm clock/partial/refreshrace/error/account switch và nhánh export bị từ chối. Browser PM đã mở drawer và thử export (không có API mutation/file giả). Ảnh pm-audit-current-events-export-error-after.jpg.

Bổ sung FIELD Header không còn lý trình Km trống hoặc hash-route sai; form tạo/tái dùng/geometry dropdown dùng nhãn tiếngViệt, không UUID/hash; lỗi quyền và nguồn tại đúng form. UNKNOWN chỉ hiển thị giá trị khi stateKNOWN, kể cả gặp value không null ngoài dự kiến. PM mở nguồn tái sử dụng còn chặn bởi lineage từ quyết định API chưa có referenceWeb; không đăng ký reference giả để lấyPASS. Tự động FIELD read8/create9/reuse7/list actor-project race và PM Case scope11 đã chạy lại.

### Lưu trữ đã nối Web trên thẻ hiện có

Đã đọc thêm DiscoveryCollectionsController đúng revision: GET project/retention/evaluations hỗ trợ cookie (runtime200), listlimit/cursor, khác detail RetentionController bearer-only. Nối dropdown dự án và lần đánh giá, nút đọc lại/đánh giá không xóa tệp, kết quả/lý do tiếngViệt vào LegalHoldCard hiện có; không thay style hoặc toàn menu. GETdetail dev/test được thêm allowlist đúng endpoint, POSTevaluation có journal key/body và receipt→GET; không fallback. Web đọc chính3 job đã có, không bấm tạo lại. PM và Sup đã chọn thật qua dropdown, detail200 cùng WAITING_RETENTION_BASIS; ảnh pm-retention-real-evaluation-after.jpg/sup-retention-real-evaluation-after.jpg. F5 giữ query/list nhưng tokenRAM mất, detail báo đăng nhập lại đúng tài khoản; đã kiểm thực tế, không tuyên bố F5 chi tiếtPASS. Sau đăng nhập bằng form, giữ token đúngrole chỉRAM, đọc detail được. BE cần WebSession+CSRF để bỏ giới hạn này.

Service cũ có mutation hủy/phong tỏa chỉ cập nhật bộ nhớ, đã bỏ thành lỗi minh bạch; không gọi thành công giả. Chưa có collection tổng hợp hold/deletion theoproject nên không dựng trạng thái “bình thường” hoặc “không có yêu cầu toàn hệ thống”. APIhold create/read/release canonical chưa nốiWeb trong lượt này; không suy từ activeHoldCount0 toàn dự án. Chưa xác nhận căn cứ lưu trữ hoặc xóa dữ liệu.

Regression mới check-retention-evaluation.cjs: exactreceipt/GET, receiptF5 chỉGET, timeout→403 giữ key/body, malformedreceipt khôngPOSTlại, scope/role, form thật hiển thịUNKNOWNthiếucăn cứ, đổiactor. check-dev-file-bearer bổ sung listcookie/detailbearer/POSTevaluation, holds/basis vẫn ngoài allowlist. Typecheck/build và diffcheck qua. check-readonly-workflows cũ được chạy nhưng dừng ở assertion AI result mismatch trong validationService (nhánh độc lập chưa sửa); không báo cảsuite xanh.

Bổ sung sau đó: đã sửa lỗi AI collection/result reader nêu trên ở validationService: collection đi hếtcursor và không nuốt401/403, result phải khớp runId/ngày; retention legacy reader cũng không nuốt lỗi hoặc nhận sai project. Chạy lại check-readonly-workflows4 nhóm PASS. Đây chỉ là reader; chưa gọi chạy AI/validation runtime hoặc coi màn nghiên cứu hoàn tất. Còn màn ResearchValidation dùng overview/trigger cũ không có nguồn model/config/pairs đầy đủ; không bấm chạy để tạoPASS.

### Thực nghiệm AI: bỏ kết quả tự suy khi chưa có run

Browser tiếp tục phát hiện ResearchValidation overview cũ dựng objectrỗng, in Bias/MAE/RMSE0mm và nhãn đạt<5mm. Đã giữ thẻ/bảng/header nhưng bỏ kết luận/ngưỡng/thiết bị/đơn vị mặc định; nguồn chưa có hiển thị chưacó. Dropdown dự án từ projectService thật, danh mục ai-mock-runs canonical và đọc result đúngrun; không tự chọnmodel, seed hoặc chạycallback. Gỡ tiến trình tự tăng30% và completiongiả; trigger/cancel/exportCSV cũ chỉ bộ nhớ nay báo chưa đủ nguồn, không giả thành công. PM/Sup browser chọnTEST1: GET list200 rỗng, không nhãnđạt/0.0; ảnh pm-research-empty-real-source-after.jpg/sup-research-empty-real-source-after.jpg. Không tạo AIrun mới; còn thiếu modelReleased/config/pairsreadcontract để chạy hợp lệ. check-research-source-ui kiểmactualpageproject/run/read/error/accountswitch và headerkhông nguồn; check-readonly-workflows4group qua. Kết quả này thay cho cảnh báo ResearchValidation vẫn dùngoverviewcũ ở đoạn trước.
