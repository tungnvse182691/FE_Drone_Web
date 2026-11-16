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
