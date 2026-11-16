# Chuỗi Fast Track xuyên menu — tiếp từ b822999

Không có mutation nghiệp vụ thật trong lượt này. Ba Report demo tạo ở lượt trước giữ nguyên, chưa phân công. UI giữ font, màu và component/modal hiện hữu; bổ sung trường, liên kết, thẻ nguồn phục vụ nghiệp vụ. BE/DB/Mobile không sửa.

Runtime được `docker inspect` xác nhận trước triển khai: **b89a52fe11ed146f197f3f94e115530b9b75afb0**. Đã lập chain trước edit ở `artifacts/fasttrack-cross-menu/chain-before-edit.md`, lưu diff/hash local ở `baseline-local.patch` và `baseline-local-hashes.json`. Pinned source và SHA256 ở `source-manifest.json`. Không đọc SQL/dev meta để lấy dữ liệu màn hình.

## Chuỗi dữ liệu/API công khai

| Bước / nơi làm | Tạo hoặc chuyển trạng thái | Đọc / điều kiện / quyền |
| --- | --- | --- |
| Dự án — Sup | `POST /api/v1/projects`: code/name/CRS/PM/handoverDate/warrantyEndDate/handoverFileIds | GET projects + work-package. Tạo accepted HandoverDocument cùng dự án; FileId chỉ có khi tham chiếu tệp ban đầu. Ngày bàn giao không tự thành độ phủ. |
| Tuyến — PM, menu chi tiết dự án | Các producer geometry/route/segment-set hiện có | GET work-package/tuyến hiện hành/segment-sets PUBLISHED/geometry-package content hash. Không tự đặt CRS, mã tuyến hoặc hash. Giữ luồng geometry cũ. |
| Nhân sự dự án — PM | `POST /projects/{p}/members`, body `{userId}`, Idempotency-Key | GET members/eligible role OPERATOR hoặc CREW → receipt → GET members. Membership phải ACTIVE, đúng dự án/role/hiệu lực; không chỉ đổi tên hiển thị. Sup quản lý tài khoản/PM chính theo menu Nhân sự hiện có. |
| Phản ánh — Reporter rồi Sup | Reporter POST reports (3 bộ đã có); Sup POST cases/{id}/triage | GET Case/reports, dự án đủ điều kiện. Sup chỉ phân công Case chưa có dự án; không tự gán dự án từ FE. |
| Ghi nhận khiếm khuyết — PM, Tiếp nhận | PM chọn scope qua triage rồi POST projects/{p}/candidate-decisions KEEP_NEW | GET candidates sourceVersion/geometryVersion, chọn tuyến + bộ PUBLISHED → GET quyết định + Defect. KEEP_NEW không phải đã xác minh kỹ thuật. |
| Nguồn hiện trường — PM/Crew | FIELD POST field-inspection-tasks PRE_MEASUREMENT theo form đã nghiệm thu; Crew tự đo/nộp theo quyền | GET task/history/submission; giữ FIELD command/DTO/mapping KNOWN/UNKNOWN/đơn vị. Chỉ bổ sung chọn dự án và Defect qua liên kết hợp lệ, không tự tạo FIELD. |
| Tài liệu — Dự án, PM/Sup | uploads → part-urls → signed PUT → complete, purpose DOCUMENT | GET session VERIFIED + metadata checksum/size/ETag + road-coverage source thuộc dự án. Dùng transport tệp dev/test đã cho phép, không tự upload. |
| Bảo hành — Dự án, Sup | `POST /projects/{p}/warranties` với operationId body, scope PROJECT/ROAD_SECTION, status ACTIVE, retainedValue null, tệp + bàn giao nguồn | GET work-package **warranties[]** và road-coverage sources WARRANTY đúng ID/tệp/ngày. Endpoint chưa WebCookieEligible nên mở rộng allowlist dev/test đúng POST đường này, không fallback 401/403. Không có giá tiền trên form. |
| Package/phương án — PM, Gói sửa chữa | POST repair-packages theo một Defect, obligations/scope và If-Match Defect; POST items với mode NORMAL hoặc FAST_TRACK, repairPlan/checklistVersion/reason và If-Match package | GET collections/detail. Không tạo UUID nghiệp vụ cục bộ; không gọi API rồi đóng modal báo thành công trước GET. |
| Normal approval — Sup, chi tiết Gói | POST items/{id}/approve, reason/key/If-Match | Receipt → GET item **ReadyToAssign** (RepairWork.Approve:305–308); không phải state Approved. Chỉ Normal AwaitingApproval, không thêm nhiệm vụ Sup duyệt FastTrack. |
| Policy/độ phủ — PM/Sup, Điều phối nhanh | PM draft/PUT/publish/revoke; Sup road-coverage confirmation | GET policy canonical, scope, source versions/file, provenance và hiệu lực; không tự chọn revision mới nhất. |
| Giao Crew — PM | POST assign sau lựa chọn rõ policy/nguồn/Crew/deadline/instructions | Receipt → GET item/task đúng Crew/assignment/pin. Giao có điều kiện chưa phải quyền thi công; cần BE/Crew đánh giá nguồn/số đo/thời gian/độ phủ. |

Contract đối chiếu `docs/contracts/openapi.json`, Candidate3 OpenAPI/full Postman collection; nghiệp vụ Spec17_10. Source b89a52f: `ProjectsController`, `ProjectCreationPersistenceService`, `ProjectWarrantiesController`, `WarrantyCreationService`, `RoadCoverageResolver`, `CaseWorkflowService/Repository`, `CandidateDecisionRepository`, `RepairWorkflowRepository.Producing`, `RepairWork`, `CrewRepairContext`. **Không chạy collection.**

## Menu đã thay đổi

**Dự án / Nhân sự dự án**

- Tạo dự án sau receipt/GET mở đúng chi tiết dự án mới; ghi rõ tệp trước dự án và gắn bổ sung bàn giao chưa có producer hợp lệ. Không giả upload có hiệu lực.
- Thẻ “Tài liệu, bàn giao & bảo hành” đọc đủ mảng warranties; không lấy một object sai DTO, không chọn bản mới nhất. Tải DOCUMENT ngay tại đúng dự án, đọc nguồn và mở độ phủ cùng projectId.
- Sup có form lập bảo hành hiệu lực: chọn phạm vi/tuyến, bàn giao từ work-package hoặc accepted coverage source, tệp đã VERIFIED từ nguồn server, ngày và điều khoản, xác nhận ảnh hưởng. Không nhập UUID/JSON, không tự điền ngày. Giữ operationId/body/receipt qua timeout/F5 và actor/project; receipt chỉ GET.
- Modal thêm Operator/Crew xử lý race tìm kiếm/đổi dự án/đổi actor, role và duplicate eligible; resume lệnh đã nhận receipt dù nhân sự đã biến khỏi danh sách eligible. Timeout rồi 403 không xóa identity cũ. Chỉ toast sau GET membership khớp receipt; không áp kết quả dự án cũ lên dự án mới.

**Tiếp nhận phản ánh**

- Form ghi nhận Report chọn rõ bộ PUBLISHED, không đòi hệ thống có đúng duy nhất một bộ rồi ngầm lấy bộ đó. Hash package phải khớp source geometryVersion.
- Kết quả KEEP_NEW có liên kết giữ projectId/defectId/reportId/decisionId đến FIELD, Fast Track và link đọc lại; server GET quyết định/Defect kiểm lại phạm vi. Reference không phải bằng chứng xác minh kỹ thuật; không tạo Defect trùng để đi tiếp.

**Nhiệm vụ hiện trường / Điều phối nhanh**

- Link projectId phải nằm trong catalog được phép đọc. Không mất dự án rồi tự chọn dự án đầu. Liên kết một Defect chỉ gợi chọn khi có trong catalog; link có decision phải GET xác nhận đúng Defect trước khi dùng.
- FIELD form/command/review/evidence/export giữ logic đã nghiệm thu. Chỉ thêm điều hướng cùng project/defect và reference đọc. Gói → Fast Track dùng đúng **itemId**, tránh nhầm một Defect có nhiều nghĩa vụ/hạng mục.
- Fast Track có nút sang Dự án/Nhân sự/Tài liệu, FIELD nguồn và Tiếp nhận; không đổi policy pin khi chuyển màn. Lệnh tạo package đang chờ giữ body/ETag cũ dù Defect version đã đổi; không tự tái tạo key.

**Gói sửa chữa**

- Giữ layout/header/KPI/filter/table/modal và các sửa UI local liên quan. Thay state cũ sinh mã, ảnh, kế hoạch, thời gian, phạm vi, Crew cục bộ và handler thành công trước API bằng read model package/items/coverage thật. Không âm thầm nuốt lỗi/giữ danh sách từ dự án cũ khi kết quả rỗng.
- Form một Defect → phạm vi có căn cứ → plan/checklist/reason → NORMAL hoặc FAST_TRACK → package/obligation receipt → propose → GET. Bỏ các trường không gửi DTO và gợi ý tự dựng công thức/phương án. Chọn nhiều Defect không gộp vào một anchor sai nghiệp vụ.
- Phạm vi hiển thị từ scope nghĩa vụ trong GET coverage (browser fixture 321: **3–4 m, lệch 0–1 m**). Không bịa “Km0–Km1”, 3 ngày, ngày hôm nay, đội thi công hoặc ước tính m². Dữ liệu DTO chưa có được ghi đúng chỗ thiếu, không giả thành đã có kế hoạch.
- Phân biệt FastTrack ReadyToAssign chờ PM giao và Normal AwaitingApproval chờ Sup duyệt. Chi tiết đọc GET items; không lấy buffer đồng bộ cũ hoặc tự đánh dấu DECIDED. Approval Normal phải nhập lý do, receipt→GET ReadyToAssign; có receipt chỉ GET lại. Không có fake “trình duyệt gói”, “xóa nháp”, “phê duyệt nhanh toàn gói”.
- Bản nháp UI chưa gửi được giữ actor/project; journal Normal/FastTrack khác nhau, nếu có lệnh FastTrack cũ sẽ dẫn về biểu mẫu giữ lệnh thay vì tạo Normal thay thế. Đã lưu patch đầy đủ các local trước sửa; local ngoài phần liên quan giữ nguyên hash và không commit.

## Chặn BE và khác biệt seed

1. **Bàn giao:** upload công khai yêu cầu projectId đã tồn tại; HandoverDocument được tạo cùng POST project. `PUT /projects/{p}` không có field gắn FileId bàn giao; không có public attach/accept-handover endpoint. POST warranty chỉ tham chiếu hồ sơ/tệp có sẵn, không sửa HandoverDocument. Source `RoadCoverageResolver.Source` chỉ nhận HANDOVER có AcceptedByUserId + FileId, file VERIFIED/FileScope đúng project. Vì vậy tạo warranty/tải DOCUMENT **không** chữa thiếu accepted handover. `PostmanScenarioSeedStep` tạo trực tiếp document/file scope trong test không được trình bày thành API Web tạo được.
2. **Checklist item cũ:** GET item/history không có plan/checklist; repairContext chỉ Crew được giao, eligibility trước binding trả 409. Proof request/receipt của đề xuất Web mới có thể nối GET; item cũ/mất local vẫn cần read contract PM từ BE. Không dùng checklist policy để lấp chỗ thiếu. Không đụng fixture 321.
3. **FIELD/DRONE Case conclusion:** source `CaseWorkflowRepository` còn chặn conclude không phải NeedsEvidence khi method khác ExistingEvidence (`409 source_not_ready`, comment producer FIELD/DRONE chưa tích hợp). Form FIELD không được làm thay Crew hoặc giả Case đã concluded. KEEP_NEW là public producer Defect và không thay việc xác minh kỹ thuật.
4. **Runtime kiểm Sup mới bị chặn môi trường:** cuối lượt, `/__dev/test-account?key=supervisor` trả 503; docker exec/inspect host không phản hồi (bounded probe timeout), API auth/web/csrf vẫn 200. Không restart container/DB hoặc đổi account/role để vượt kiểm. Form Sup mới được kiểm bằng component/hook/service đúng response contract, **chưa nghiệm thu browser Sup ở lượt này**. Phần đọc Sup/cookie/Bearer đã qua ở lượt trước không được tính thay cho form mới.

## Kết quả kiểm

- PASS **8 nhóm cross-menu component/service**: điền form bảo hành, source/dates/role sai, receipt/F5 chỉ GET; form package thật → payload/headers → proposal/GET; modal Normal approval receipt lỗi/F5; member pending và late response khác project; exact item/project deep link. HTTP mô phỏng; kiểm chuyển trạng thái và headers theo source runtime, không mock chấp nhận mọi dữ liệu.
- Regression liên quan PASS: 52 personnel; 10 KEEP_NEW; 9 FIELD create; 8 FIELD read; 12 export; 23 Fast Track form; 15 Fast Track service/journal; 9 repair workflow; 16 BE validator/domain; 5 upload; 8 auth/transport. Từng log ở `artifacts/fasttrack-cross-menu/`. Không runtime mutation.
- Browser PM PASS phần đọc: Dự án321 work-package warranties[]/coverage, Crew eligible200; Gói321 FastTrack ReadyToAssign + scope3–4m; mở đúng item Fast Track; đi FIELD vẫn đúng321; Case52d… GET reports/candidates/image200, chọn tuyến và bộ công bố thật. Mở/điền/chọn form, **không submit nghiệp vụ**.
- Browser Sup mới: **BLOCKED môi trường như trên**. Chưa coi luồng runtime hoàn tất. Không tạo thêm data ở lượt này; ba Case demo UNASSIGNED từ lượt trước giữ nguyên.
- Typecheck/build/diff-check chạy sau sửa. C có lúc hết dung lượng khiến npm ENOSPC; chuyển npm cache tạm sang D trong artifacts để kiểm tiếp, không xóa artifacts/checkpoint/local cũ. Build còn warning bundle lớn/Tailwind đã có.
- Ảnh browser PM: `artifacts/fasttrack-cross-menu/proposal-create.png`, `intake.png`. Ảnh form mở để đọc/chọn nguồn, chưa submit; phần text optional bộ phân đoạn trong ảnh được chụp trước lần sửa nhãn cuối. Log/diff/hash gốc được giữ ngoài Git; không đưa private artifacts lên remote.

## Người dùng thao tác từ đầu

1. **Sup / Dự án:** chọn dự án hiện hữu hoặc tạo mới, chọn CRS và PM có nguồn thật. Sau GET vào chi tiết. Chuẩn bị tuyến ở menu có sẵn, bảo đảm geometry/segment-set công bố hợp lệ.
2. **PM / Dự án → Nhân sự:** thêm Crew/Operator từ eligible server, kiểm GET ACTIVE. Nếu còn lệnh pending, dùng nút đối chiếu cùng người dùng, không chọn người khác.
3. **Sup / Tiếp nhận:** ba demo Case ở [bảng dữ liệu](DEV-FILE-BEARER-20261116.md), chọn dự án và phương thức có căn cứ → tự xác nhận triage. **PM / Tiếp nhận** đọc Report/evidence, cập nhật phạm vi nếu thiếu, chọn tuyến/bộ, loại lỗi/mức độ/lý do → tự KEEP_NEW → GET. Giữ link kết quả để đọc lại trên cùng tài khoản.
4. **PM / FIELD:** mở từ kết quả ghi nhận, chọn Crew, loại đo/phạm vi/chỉ dẫn/deadline đúng hồ sơ → tự tạo → GET. Crew tự cung cấp số đo/evidence và thực hiện bước của mình; PM không đóng vai Crew. Dữ liệu UNKNOWN giữ UNKNOWN.
5. **PM / Gói sửa chữa:** chọn đúng dự án và một Defect, mode FAST_TRACK, phạm vi lý trình/offset thực tế, checklist/plan/căn cứ → tự đề xuất → GET. Bộ phân đoạn là tùy chọn theo DTO, chỉ chọn bản đã công bố khi hồ sơ yêu cầu; Sup duyệt từng hạng mục có lý do → GET ReadyToAssign. Không tạo lại fixture đã có.
6. **PM / Điều phối nhanh:** tạo/sửa draft policy và xuất bản đúng checklist/loại lỗi; GET xác nhận. Không tự chọn bản mới nhất hoặc thu hồi bản cũ. Revoked vẫn xem được, không được chọn lệnh mới.
7. **Sup / Dự án → Tài liệu/Bảo hành:** tự chọn/tải tệp thật và GET đến VERIFIED/nguồn đúng dự án; nếu cần lập warranty ACTIVE, chọn hồ sơ/tệp/ngày từ nguồn rồi tự tạo → GET. **Chỉ khi có HANDOVER hợp lệ** mới vào Độ phủ, chọn scope/provenance/hiệu lực/nguồn, tự xác nhận → GET. Nếu thiếu attach-handover, dừng tại chặn BE nêu trên; không dùng số hiệu nhập tay.
8. **PM / Gói → Điều phối:** mở đúng item, chọn revision khớp checklist, hồ sơ khảo sát, Crew, deadline/chỉ dẫn → người dùng tự bấm phát lệnh → receipt→GET item/task/Crew/assignment; F5 chỉ GET đối chiếu. Đây là giao việc có điều kiện; thi công còn chịu BE/Crew đánh giá quyền.

Không dùng test xanh hoặc số lượng form đã nối để tuyên bố toàn bộ runtime đã nghiệm thu.
