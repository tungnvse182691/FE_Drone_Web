# Điều phối nhanh — nghiệm thu Web 16/11/2026

## Phạm vi và nguồn đối chiếu

Giữ route `/pm/fast-track`, `/sup/fast-track`, component header/policy/cards/filter/action bar và các modal vừa phục hồi. Chỉ sửa service/state/handler và trường cần thiết bên trong modal cũ để gửi đúng lệnh. Không sửa App/routes, BE, Mobile hoặc menu khác. Các thay đổi local RepairProposals, AcceptanceList, evidence-closeout, proposal-approval và conflictService còn nguyên ngoài commit.

Docker khớp ảnh Hoàng: `roadguard-case409-clean-20261106-api-1`, revision image **b89a52fe11ed146f197f3f94e115530b9b75afb0**, HTTP28081/HTTPS28443. Vite đang proxy về HTTPS28443. Đọc source tại chính revision này bằng git show; không lấy HEAD BE khác làm căn cứ.

Nguồn: Spec17_10 workflow07/08; `docs/contracts/openapi.json`; Candidate3 `docs/openapi.json`, `docs/FE-API.postman_collection.json`; collection đầy đủ `RoadGuardBackend/docs/postman/RoadGuardSystem-V2.postman_collection.json` và environment `RoadGuard.local.postman_environment.json`. Collection bounded FE chỉ có ví dụ giới hạn; đã tra 27 operation repair/policy/coverage trong collection đầy đủ, không chạy cả collection. Script chỉ chạy các request cần thiết với tài khoản demo đọc trực tiếp từ container, không lưu credential/token vào source hoặc Git.

Đã đối chiếu RepairPoliciesController/Service/Repository, RoadCoverageController/Repository/Resolver, RepairPackagesController, RepairsController, DiscoveryCollectionsController, RepairEligibilityRepository, RepairFtEligibility, RepairWorkflowRepository.Producing, FieldInspectionWorkflowRepository.Business/RepairSources và DTO tương ứng.

## API và hành vi hiện tại

| Phần | API có / vừa nối Web | Giới hạn / kiểm runtime |
|---|---|---|
| Dự án, Crew | GET projects, members đủ cursor; chỉ Crew ACTIVE và trong hạn | Không dùng `/__dev`/SQL hoặc project mặc định khi lỗi. PM/Sup GET200. |
| Policy | POST drafts → GET draft; POST publish với ETag GET → GET revision; đọc theo tham chiếu hồ sơ/receipt | PM cookie đã POST201/GET200. Sup đọc policy bị403 theo role, không phải lỗi cookie. BE không có collection “policy hiện hành”; không đoán ID hoặc chọn bản mới nhất. Update/revoke có API nhưng modal hiện tại chưa cung cấp chỉnh sửa/thu hồi bản đã có. |
| Độ phủ | GET road-coverage; chọn scope/source từ response; POST có K/If-Match và GET đối chiếu | GET200. Chưa POST xác nhận thật: thiếu HANDOVER được chấp nhận/căn cứ nguồn; modal khóa đúng tại thao tác. TEST_ONLY không đổi thành REAL_SOURCE, không cấp quyền thi công. |
| Khiếm khuyết | PM GET defects; gói→items thật; nối nguồn theo defectId | Không xét LOW/MEDIUM để cấp đủ điều kiện. Sup GET defects bị403: dùng repair collections được phép đọc, số liệu gốc hiển thị chưa có quyền đọc. |
| Chuẩn bị hạng mục | Trong modal Chi tiết: POST package lấy obligation/version thật → GET collection → POST item FAST_TRACK → GET item | DTO physical scope từ người nhập, physical road/current route lấy từ work-package. Không suy kích thước từ bbox. Script chuẩn bị project321 đã POST201 từng bước và GET200. |
| Giao Crew | POST item/assign với task, policyRevisionId, reason; If-Match từ current GET item | Handler đã nối, 2 bước readback item + native task/assignment/context trước success. **Không gửi POST assign runtime theo yêu cầu Hoàng.** Source/pins còn được BE kiểm lại. |
| Eligibility | GET item/eligibility sau khi có binding | Trước giao việc BE trả409 repair_binding_not_current; không coi ReadyToAssign là đủ điều kiện thi công. Sau giao việc Crew vẫn phải accept/start/assessment, coverage/current authority và original window. |
| Thi công/final | Không tạo attempt, measurement, evidence, execution start/finish hoặc final confirmation trong lượt này | Thiếu coverage/hồ sơ/bằng chứng thật; không dựng để nghiệm thu giả. Không sửa Mobile. |

Các controller FT vừa nối có WebCookieEligible tại revision đang chạy; Web chỉ dùng cookie+CSRF. Đọc Mobile Crew dùng Android login/Bearer trong script riêng đúng vai trò, không đưa bearer đó sang Web. Sup policy/defects403 được ghi đúng nguyên nhân quyền.

## Chống trùng và lỗi

Journal `rg_fasttrack:<user>:<role>:<project>:<operation>` lưu K/body/If-Match trước POST trong localStorage, không lưu token/cookie. Timeout/5xx giữ nguyên yêu cầu; response có receipt thì chỉ GET đối chiếu. Receipt giao việc được giữ sau readback để retry nhiều hạng mục không giao lại mục đã xong. Tạo gói và đề xuất tách K/receipt, pipeline giữ gói đã tạo khi bước đề xuất chưa rõ kết quả. Lỗi validation đầu tiên trước outcome mơ hồ cho phép sửa form; nếu đã timeout trước đó vẫn khóa identity cũ. Có guard actor/epoch và request đang chạy.

Không catch lỗi project/Crew rồi trả danh sách giả. Loading/error/empty phân biệt trên cards cũ. Không có `executeDispatch` thành công trong bộ nhớ. Giao việc có điều kiện và đủ điều kiện thi công là hai trạng thái riêng.

## Dữ liệu test đã tạo

Đã rà Defect trên bảy dự án PM hiện có. Không tạo Defect/evidence/ground-truth giả. Tái sử dụng source REPORTER/current pins và Crew membership của nhiệm vụ đo trước sửa hiện hữu tại321 (`574b3f4c-0778-4564-baea-35398b298ce2`); không sửa nhiệm vụ cũ.

| Tài nguyên project321 | Giá trị thực từ response |
|---|---|
| Project | `15d119fe-0c03-4e25-aa5d-95e97ddd881d` — final testttttttt (321) |
| Defect được tái sử dụng | `44d56026-2d43-4022-8f89-536862bab349` — CRACK |
| Policy revision mới | `774a2364-7c1b-4635-8397-7ee31a1988f7` — TEST-FASTTRACK-321-20261116 |
| Package mới | `2d6916a1-fc9a-43e0-baac-0c1db001800a` |
| Formal obligation mới | `1dc5d9db-1c59-42a5-9bf1-c114c9651152` |
| Item mới | `3a1e007d-fb53-4b0a-9b1a-649e7a435f96` — FastTrack / ReadyToAssign |
| Crew hiện hành, chưa giao | Synthetic crew-a — `72f84201-a001-4000-8000-000000000008` |

Phạm vi **giả lập để test UI** 3–4m, lệch0–1m; lý do/phương án mang TEST-FASTTRACK và ghi rõ không phải số đo, bằng chứng hay xác minh thực địa. Policy test DepressionDepth 0–50mm, không tuyên bố ngưỡng TCVN. Đây là dữ liệu test được tạo theo phép của Hoàng, không thay thế dữ liệu thật ở UI.

Trước đó SBX-A đã tạo draft `4c4eaf15-d9f2-4a63-88f0-1941ee524541`, revision `6684910a-3dfb-429f-aee3-cacdd9962da9` — TEST-FASTTRACK-20261116. Tạo package SBX-A bị409 active_scope_conflict, không có receipt package. Không đổi mode/xóa nghĩa vụ NORMAL cũ để vượt guard. Không xác định được bộ pins hiện hành cùng LocationVersion với scope cũ để chứng minh tách phạm vi; chuyển sang nguồn321 không có reservation xung đột.

Tiến độ/K/body/receipt và source reads giữ ở `artifacts/fasttrack-current/preparation-journal.json`, `preparation-321-journal.json`, `final-readback.json`. Không commit nguyên artifacts. Không SQL/reset DB, không bỏ guard, không gửi email/SMS thật.

## Checklist Hoàng nghiệm thu

1. Đăng nhập PM-A, mở `/pm/fast-track`, chọn **final testttttttt (321)**. Phải có thẻ FT chờ giao việc có điều kiện; chưa được ghi “đủ điều kiện thi công”.
2. Nếu máy/phiên chưa có reference policy: mở Điều chỉnh chính sách → chọn Đã xuất bản → nhập `774a2364-7c1b-4635-8397-7ee31a1988f7` → Đọc. Phải đọc ra TEST-FASTTRACK-321-20261116. Area chưa khai báo hiện gạch ngang, Depth50mm. Không nhấn xuất bản thêm bản test trùng.
3. Chọn thẻ FT → Phát lệnh xử lý nhanh. Giữ modal cũ. Chọn Synthetic crew-a; policy dùng revision ở trên. Source REPORTER, loại đo Độ sâu lún. Survey/set/layout/slab/map/CRS để trống **cho đúng fixture này**, vì pins nguồn thực hiện hữu đều null; không áp dụng cách để trống cho hồ sơ khác.
4. Hạn hoàn thành phải ở tương lai. Phạm vi đo và ghi chú giữ TEST-FASTTRACK, nêu rõ đây là phạm vi giả lập; không đánh dấu là bằng chứng thực địa. Biểu mẫu fixture đã điền tại browser kiểm thử, chưa gửi lệnh.
5. **Hoàng tự bấm “Xác nhận phát lệnh”.** FE phải đọc current item/ETag, policy; POST đúng lệnh rồi GET item/native task. Chỉ sau đối chiếu item/task/assignment/Crew/context mới báo thành công. F5/retry sau timeout phải giữ K/body/version; có receipt thì chỉ GET.
6. Nếu nhận409/403/source_not_ready hoặc lỗi khác: giữ thông báo, không tự đổi ID/phiên bản. Chưa có runtime PASS cho bước5 trước khi Hoàng bấm.
7. Vào Sup → `/sup/fast-track`, chọn321: có thẻ để theo dõi, không có nút giao Crew. Mở độ phủ: nguồn HANDOVER/căn cứ hiện rỗng nên nút xác nhận bị khóa và báo đúng phần thiếu. Không thử xác nhận bằng ID mặc định.
8. Sau khi giao, Crew cần nhận nhiệm vụ trên client có hỗ trợ đúng luồng. Dữ liệu fixture hiện **chưa đủ độ phủ/bằng chứng để thi công/final**; không nghiệm thu hoàn tất thi công chỉ bằng assignment.

## Kiểm tra

Typecheck/build PASS; diff-check cho thay đổi đợt này PASS. Cảnh báo duration-[250ms]/bundle lớn có sẵn. `check-fasttrack-web.cjs`:11 nhóm PASS; `check-repair-workflow.cjs`:7 nhóm PASS. Tests transport mô phỏng kiểm timeout/receipt, ETag, actor switch, permission, no severity inference, coverage sources, assignment readback, package/propose; không thay thế runtime acceptance.

Browser PM/Sup dùng phiên thực, GET policy/collections/coverage và modal cũ; policy Sup403 được kiểm trực tiếp, không fallback. Nút cuối tại modal PM đã mở cho Hoàng nhưng không bấm. Ảnh nằm trong `artifacts/fasttrack-current/screenshots/`.


## Sửa payload measurementScope sau 61e997b

Đối chiếu trực tiếp `FieldInspectionTask.ValidateScope` của runtime b89a52fe11ed: trường này phải là chuỗi JSON có root object, parser giới hạn sâu64, không có schema khóa nghiệp vụ cụ thể. Lệnh giao Crew mới tạo `measurementScope: "{}"`; nguyên nội dung ô phạm vi và ô chỉ đạo được ghép bằng xuống dòng trong `instructions`, không trim/cắt mất nội dung và không yêu cầu người dùng nhập JSON. Nếu tổng chỉ dẫn vượt1000 ký tự theo CreateRepair→CreateOperational, chặn trước POST thay vì cắt bớt.

Journal cũ không bị migrate: scope sai bị chặn trước POST và giữ nguyên body/key/ETag; scope object hợp lệ vẫn dùng chính body/key/ETag đã lưu. Có receipt thì chỉ GET đối chiếu, kể cả scope legacy sai. Modal chỉ khôi phục phần mô tả từ instructions của lệnh mới, không đổi bố cục hay sửa journal. Fixture và dữ liệu test được giữ nguyên. Không gửi lệnh giao Crew trong lượt sửa này.

Regression `node tools/check-fasttrack-scope-validator.cjs` lấy chính thân hàm C# tại revision đầy đủ trong Git BE và biên dịch/chạy cục bộ, so17 ca với kiểm tra FE (object, text, array, null, malformed, độ sâu64/65 và duplicate key). Script chỉ ghi harness vào artifacts, không sửa BE hoặc gọi HTTP. Cần .NET9 và checkout BE tại đường dẫn sibling hiện hữu; có thể đặt ROADGUARD_BE_SOURCE nếu đường dẫn khác. `check-fasttrack-web.cjs` bổ sung kiểm plaintext→object/instructions, overflow, legacy invalid/receipt GET-only và replay nguyên trạng journal object hợp lệ. Typecheck và diff-check PASS.
