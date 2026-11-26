# Điều phối nhanh: rà nguồn và sửa FE tiếp từ f2ae7aa

Runtime được kiểm lại: container `roadguard-case409-clean-20261106-api-1`, OCI revision **b89a52fe11ed146f197f3f94e115530b9b75afb0**. Source dưới đây đọc bằng `git show` đúng revision, không checkout/sửa BE. Contract đối chiếu `docs/contracts/openapi.json`, Candidate3 `docs/openapi.json`, collection `RoadGuardBackend/docs/postman/RoadGuardSystem-V2.postman_collection.json`, Spec17_10 W08. Không chạy collection hoặc ghi DB.

## Đã sửa FE

- PM đọc lại item/history ngay trong modal Chi tiết, có nút Đọc lại hồ sơ phương án; đối chiếu project/item/obligation/version, không lấy checklist từ policy đang xem. Nếu đã nhận receipt đề xuất và GET đối chiếu cùng item, có thể phục hồi checklist từ request/receipt giữ nguyên, không cần tạo lại đề xuất.
- Sửa sai căn cứ ở f2ae7aa: **PM không nhận `repairContext`**. GET task chỉ cấp nó cho Crew được giao. Readback PM nay nối receipt binding → GET item có ETag → GET task có ETag, đối chiếu Crew, assignment, policy, route/binding khi có trong receipt. Không yêu cầu trường mà quyền PM không được đọc; context nếu được trả vẫn phải khớp item/package. Danh sách PM dùng receipt đã đối chiếu để đọc Crew/pin, không ghép task theo suy đoán.
- Lệnh assign có receipt được GET ngay, không bị phụ thuộc lại vào danh mục Crew hiện hành, policy chưa thu hồi, số đo/checklist hay source của lệnh mới. F5/timeout giữ nguyên journal/body/key/ETag. Không đổi deadline, policy pin hoặc nội dung lệnh cũ. Có guard chống bấm lặp và chặn kết quả phiên/dự án cũ ghi lên màn mới.
- Policy có receipt được đối chiếu ngay bằng GET, kể cả catalog lỗi hoặc journal chứa đơn vị lịch sử không còn cho tạo mới. Không gửi tiếp publish chỉ vì người dùng đang đối chiếu receipt tạo/cập nhật.
- Một reference policy 404/lỗi không làm trống các bản khác: hiển thị lỗi riêng và giữ các GET hợp lệ. Catalog lỗi không ngăn đọc receipt. Không xóa reference, journal hoặc dữ liệu BE; không trả mock.
- Form lập nghĩa vụ/hạng mục giữ khung cũ: phân đoạn dùng danh mục đã công bố; bố trí/tấm dùng hồ sơ task đã xác thực. Bỏ nhập tay reference kỹ thuật. Phạm vi, phương án, checklist, căn cứ là ô nghiệp vụ; giữ nội dung chưa gửi qua F5. Service kiểm lại nguồn trước lệnh tạo, sau đó package receipt → đề xuất → GET item.
- Sup đọc lại nguồn hồ sơ bằng GET ngay trong modal, giữ ngày/ý kiến đang nhập. Chặn supersedes sai scope/provenance, nguồn TEST_ONLY đã dùng bị chuyển thành REAL_SOURCE, cùng các điều kiện ngày/source/version đã có. Ghi rõ thiếu hồ sơ và giới hạn tải tệp tại thao tác; không dựng file picker có hành động giả.

## Checklist phương án: đã rà hết các nguồn đọc liên quan

| Nguồn | DTO/source b89a52f | Kết quả và giới hạn |
| --- | --- | --- |
| `GET /api/v1/projects/{p}/repair-packages/{pkg}/items` và `.../items/{i}` | `RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs:69`, `RepairContractMapping.ToWire(RepairItemFact)` | RepairItemView chỉ id/projectId/defectId/obligationId/mode/state/result/effectiveDecisionId/attemptIds/decisionIds/version. **Không có repairPlan/checklistVersion/binding hiện hành.** |
| `GET .../items/{i}/history` | `RepairHistoryDtos.cs:3` và `RepairWorkflowRepository.cs:184` | item vẫn là DTO trên; decisions, attempts, reviewRequests không có checklist phương án. Không parse reason/evidence để suy checklist. |
| `GET .../items/{i}/eligibility` | `RepairEligibilityRepository.cs:31–34`, RepairEligibilityService.ReadAsync | Trước assign trả 409 `repair_binding_not_current`. Sau binding có policyRevisionId/policyState/rules, không có checklist phương án; không dùng checklist của policy làm checklist item. GET chẩn đoán bằng cookie PM ở fixture trong lượt này xác nhận 409 này. |
| `GET /api/v1/projects/{p}/field-inspection-tasks/{task}` | `FieldInspectionWorkflowDtos.cs` FieldTaskView/CrewRepairContext; `FieldInspectionWorkflowRepository.CrewRepairContext.cs:24` | Có DTO context chứa checklist, nhưng source trả null nếu CallerRole khác RepairCrew; còn phải có binding/assignment hiện hành, đúng Crew. **PM/Sup không thể dùng làm nguồn trước assign.** |
| Snapshot offline sửa chữa | `RepairWorkflowRepository.Offline.cs:44` | Có checklist nhưng yêu cầu RepairCrew, binding/task và quyền thực thi hiện hành. Không dùng bearer/Crew identity để vượt quyền PM. |
| Policy revision | RepairPolicyView | Checklist của policy chỉ dùng đối chiếu; không chứng minh checklist phương án. Không chọn revision mới nhất. |
| Audit producer / reporting | `RepairWorkflowRepository.Producing.cs:524`, `:643`; OpenAPI không có API audit snapshot tổng quát | Producer ghi checklist trong audit nội bộ; không có route Web hợp lệ trả snapshot đó cho PM. Không truy SQL/dev meta/fixture script để đọc. |

Browser PM mở Chi tiết ở dự án 321 và bấm đọc: request **47239 GET history → 200**, item `3a1e007d-fb53-4b0a-9b1a-649e7a435f96`, mode FastTrack, state ReadyToAssign, version `AAAAAAABx3A=`, decisions/attempts/reviewRequests đều rỗng. DTO không có checklist. GET item cùng scope trả cùng version. Đây là **thiếu read contract BE**, không phải dữ liệu JSON bị FE bỏ quên.

Vì vậy **item cũ/đổi trình duyệt mất receipt vẫn chưa giao được một cách có căn cứ độc lập localStorage**. Đề xuất mới qua Web có request/receipt của chính thao tác, được nối canonical GET và giữ để phục hồi; điều này không thay thế việc BE cần cung cấp nguồn đọc phương án cho PM. Chưa coi yêu cầu gỡ chặn item fixture là hoàn tất. Không nhập lại checklist của policy để giả khớp, không tạo item/gói khác thay cho fixture.

## Hồ sơ bàn giao/căn cứ: dữ liệu thiếu và giới hạn transport

| Endpoint/luồng | Source/DTO | Kết luận |
| --- | --- | --- |
| `GET /api/v1/projects/{p}/road-coverage` | RoadCoverageReadFact; `RoadCoverageResolver.Source` | Sources chỉ nhận HANDOVER khi document có FileId + AcceptedByUserId, file VERIFIED, FileScope thuộc đúng project. WARRANTY còn phải active/có source document; MAINTENANCE_BASIS lấy file đã xác minh trong project. |
| `POST /api/v1/projects` | CreateProjectRequestDto có handoverFileIds; `ProjectCreationPersistenceService.cs:185` | Tạo HandoverDocument cùng dự án, AcceptedByUserId là actor Sup, FileId là tệp đầu tiên nếu có. Đó là lúc chấp nhận hồ sơ; không có endpoint accept-handover riêng. File vẫn phải đạt điều kiện nguồn/project ở hàng trên để dùng xác nhận. |
| `PUT /api/v1/projects/{p}` | UpdateProjectRequestDto / ProjectsController.Update | Chỉ name/description/engineeringUtmSrid/startDate/endDate/expectedRowVersion/operationId; **không có trường gắn bổ sung tệp bàn giao**. Không sửa menu dự án để gửi field ngoài DTO. |
| `POST /api/v1/projects/{p}/warranties` | ProjectWarrantiesController | Nhận reference bàn giao/source document có sẵn; không tạo hoặc sửa accepted handover đang thiếu. |
| `POST /api/v1/uploads` → part-urls → complete → GET session/file | UploadCreateRequestDto: purpose/projectId/targetId/fileName/mediaType/sizeBytes/checksumSha256; complete: parts/checksumSha256 | Có producer DOCUMENT, nhưng các action trên UploadsController không có WebCookieEligible và không thuộc path cookie allowlist. Không thể nối thành luồng upload Web hoạt động trên runtime này. POST chưa chạy. |
| `POST /api/v1/offline/uploads` | OfflineUploadCreateRequestDto / UploadService.CreateOffline | Có cookie nhưng chỉ upload FIELD theo task, không phải đường tải tài liệu bàn giao/căn cứ. Không đổi purpose hoặc bỏ guard. |

Chẩn đoán GET không mutation bằng cookie PM: `/api/v1/files/7678ee35-75d5-4d39-8059-49f75b0feec8` → **401**, `code=auth_unauthorized`, correlation `888fd23b-8e3a-4e0f-8c8d-df74c761cb00`. Đây là kiểm transport đọc, không tính là test thao tác upload UI thành công. Căn cứ: `UploadsController.cs:28,51,72,108,126,143` và `WebCookieConfiguration.IsCookieEligibleRequest/IsCookieEligiblePath:30–75` của pinned source. Không tự gửi POST để kiểm 401 và không fallback bearer.

Sup bấm Đọc lại nguồn hồ sơ: **47785 GET coverage → 200** tại SBX-A: scope 1–2 m, offset 0–1 m, 1 MAINTENANCE_BASIS `SOURCE_NOT_EXTERNALLY_VERIFIED`, **không HANDOVER**, history rỗng. Dự án 321 đã đọc scope 3–4 m, sources/history rỗng. Chưa có xác nhận độ phủ, chưa có căn cứ thi công. Tệp trong dropdown không tự chứng minh xác minh ngoài thực tế.

Với hai dự án này, **chưa có thao tác Web hợp lệ mà người dùng có thể bấm để tạo đủ nguồn bàn giao trên b89a52f**. Cần BE cung cấp đường gắn/chấp nhận hồ sơ cho dự án hiện hữu và cookie upload tài liệu; không giải quyết được chỉ bằng điền số hiệu, POST warranty hoặc tạo dự án khác. Độc lập với chặn này, form xác nhận/phạm vi/provenance/receipt/GET đã nối và kiểm bằng component thật để sẵn sàng khi GET có nguồn hợp lệ.

## Kiểm và nghiệm thu

- PASS code: **15 nhóm service/journal, 23 nhóm component/form, 16 nhóm validator/domain BE thực**. Các test bổ sung có PM task repairContext=null; receipt không đòi lại Crew/catalog/đơn vị mới; một ref hỏng không làm trống catalog; Sup refresh giữ nội dung; lập scope qua dropdown/form → payload → receipt/readback; nguồn/history sai scope bị từ chối. Transport mô phỏng, không phải DB mutation.
- Browser PM: điền scope/checklist/phương án bằng ô thật; thiếu phạm vi báo lỗi trước request; dropdown server có phân đoạn đã công bố; GET item/history và Đọc policy `chính sách test lần 1` hiện Area 0.3 m², Depth 3 cm. Form giao Crew hiện đúng chặn thiếu nguồn checklist; không chọn thay policy TEST.
- Browser Sup: đăng nhập bằng form; chọn nguồn thật, nhập ngày/ý kiến; ngày đảo bị bắt, Đọc lại nguồn không làm mất nội dung. Không có nút PM phát lệnh. GET coverage thật như bảng trên.
- Typecheck/build/diff-check chạy sau sửa. Không sửa BE/Mobile, policy TEST, fixture, journal cũ, FIELD hoặc export. Những file local ngoài phạm vi không stage/commit.
- Runtime mutation: **NOT_RUN** create/PUT/publish/revoke/confirm coverage/assign; không tạo test data. Login/logout chỉ để kiểm hai quyền. Test xanh không có nghĩa cả luồng runtime đã hoàn tất.
- Evidence/ảnh toàn trang: `artifacts/fasttrack-followup/`, source pin và hashes trong `source-provenance.json`. Ảnh: `preparation.png`, `item-sources.png`, `policy.png`, `dispatch.png`, `sup-top.png`, `sup-bottom.png`.

Các bước người dùng nghiệm thu:

1. **Policy PM:** chọn dự án → Điều chỉnh chính sách → chọn bản đã lưu và Đọc; kiểm nhóm/lịch sử. Với bản mới riêng: nhập loại lỗi, checklist, chọn Area hoặc Depth, ngưỡng/đơn vị/căn cứ → Lưu draft → kiểm GET đúng ID → tiếp tục sửa cùng draft → xuất bản → kiểm revision. Chỉ thu hồi khi chủ động chọn đúng bản và xác nhận ảnh hưởng; nhiệm vụ cũ giữ pin.
2. **Phương án PM:** item cũ 321 mở Chi tiết → Đọc lại hồ sơ phương án để thấy read gap. Khi có nguồn BE đầy đủ, đối chiếu checklist thực của item. Với khiếm khuyết chưa có item và thực sự cần lập mới: nhập phạm vi có căn cứ, chọn reference từ dropdown, phương án/checklist/căn cứ → tự bấm lập gói/đề xuất → kiểm GET. Không lập lại fixture đang có.
3. **Độ phủ Sup:** mở modal → Đọc lại nguồn hồ sơ; nguồn phải có bàn giao đã chấp nhận và căn cứ đúng project. Khi đủ nguồn: chọn scope, hồ sơ, hiệu lực, provenance, supersedes cùng provenance nếu cần, ý kiến → tự xác nhận → kiểm GET; PM đọc lại cùng scope/hiệu lực. Hiện SBX-A/321 chưa qua được điều kiện nguồn trên runtime này.
4. **Giao Crew PM:** với item có nguồn checklist hợp lệ, chọn rõ revision PUBLISHED/chưa REVOKED khớp loại lỗi + checklist, Crew hiện hành, hồ sơ khảo sát nguồn, deadline và chỉ dẫn thường → người dùng tự bấm Xác nhận phát lệnh. Kiểm receipt/task/assignment/Crew và GET item/task; F5 chỉ đối chiếu lệnh đã gửi. Thiếu độ phủ không tự biến giao việc có điều kiện thành được phép thi công; Crew/BE còn đánh giá quyền thực hiện.
