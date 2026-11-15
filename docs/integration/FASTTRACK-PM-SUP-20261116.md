# Điều phối nhanh PM / Sup — kiểm từ HEAD 33458ae

Phạm vi: policy, độ phủ và chọn revision giao Crew của `/pm/fast-track`, `/sup/fast-track`. Giữ route, font, màu, khung trang và modal hiện có. Không sửa BE/Mobile/menu khác, policy TEST, fixture hoặc journal cũ. Những thay đổi local ngoài Fast Track không đưa vào commit này.

## Căn cứ

- Docker `roadguard-case409-clean-20261106-api-1`: image `roadguard-case409-clean-20261106-api:b89a52fe11ed`, OCI revision **b89a52fe11ed146f197f3f94e115530b9b75afb0**; kiểm lại bằng `docker inspect` trong lượt này.
- Source được đọc bằng `git show` đúng revision trên trong `RoadGuard-web-5180ab9`, không dùng HEAD BE thay cho runtime:
  - `RoadGuardSystem.Repositories/Implementations/Repairs/RepairPolicyRepository.cs`: draft PUT cùng ID, phân bổ revision khi publish, receipt idempotency, PM-only, DraftView/RevisionView, ETag. Revision chưa thu hồi trả `reason: ""`; lý do ban hành còn ở draft/audit. FE không tự điền lý do của draft vào response revision.
  - `RoadGuardSystem.Services/Implementations/Repairs/RepairPolicyService.cs`, policy controller/DTO: cookie Web, CSRF, key, If-Match; PM có quyền policy, Sup không được đọc policy ở runtime này.
  - `RoadGuardSystem.Repositories/Implementations/Repairs/RoadCoverageRepository.cs`, `RoadCoverageResolver.cs`: scope/hash, bàn giao đã chấp nhận, source version/file, provenance, lịch ngày Việt Nam, thời điểm kết thúc không bao gồm, supersedes, phạm vi và độ lệch.
  - `RepairWorkflowRepository.Producing.cs`: checklist phương án bất biến; policy phải khớp project, defect type, checklist và chưa thu hồi. Read item/summary không cung cấp checklistVersion.
  - `RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs`, validator số đo thực trong `FieldInspectionWorkflowRepository.Intake.cs`, `RepairFtEligibility.cs`: đơn vị, KNOWN/UNKNOWN, số 0, ngưỡng và quyền thi công tách biệt.
- Contract: `docs/contracts/openapi.json`; Candidate3 collection `RoadGuardBackend/docs/postman/RoadGuardSystem-V2.postman_collection.json` và environment tương ứng. Đã đối chiếu đủ POST/GET/PUT draft, publish, GET revision, revoke, GET/POST road-coverage. Không chạy collection.
- Nghiệp vụ: `docs/specs/17_10/02_Business-Workflows/08_FastTrack-Policy-and-Confirmation.md`.

## Lần tạo của người dùng trước khi sửa

Network giữ được **hai cặp ở hai dự án**, mỗi cặp một POST draft và một POST publish, đều 201. Không thấy gửi lặp cùng draft trong phần Network còn lưu. Không suy kết luận này thành kiểm toán toàn DB.

| Dự án / checklist | POST draft / publish | Draft | Published revision | GET đối chiếu trong lượt này |
| --- | --- | --- | --- | --- |
| 321 / chính sách test lần 1 | 37165 / 37169 | c533b393-6aa1-43f4-8cc3-7c13c94f80db | 983fb13f-b83e-4b88-abcf-5759ba66814f | 44957 / 44959: 200, PUBLISHED, publishedRevisionId trỏ đúng revision |
| SBX-A / a | 37677 / 37681 | 14085419-ef55-4d58-a2f9-a86907dbf0fe | 8c8f1ed4-1afd-4fe4-acb8-914f0c47d834 | 42660 / 42657: 200, PUBLISHED, publishedRevisionId trỏ đúng revision |

321: Area **0–0.3 m²**, DepressionDepth **0–3 cm**, CRACK. SBX-A: Area **0–0.6 m²**, DepressionDepth **0–3 cm**, POTHOLE. Form Đọc đã hiện đúng cả hai. Mỗi dự án đang có hai revision đã biết, không cộng draft đã ban hành thành bản thứ ba.

Body response POST cũ đã mất khỏi buffer DevTools. Vì vậy chỉ xác nhận được status/headers/request body cũ và GET hiện tại; không khẳng định còn đủ body receipt gốc. ETag draft lúc tạo/publish lần lượt `AAAAAAAB0ok=` và `AAAAAAAB0u0=`; GET hiện tại phản ánh version sau publish. Không gửi lại để lấy receipt. Metadata đã bỏ cookie/token nằm ở `artifacts/fasttrack-pm-sup-complete/network-evidence.json`.

## Thay đổi

1. Policy được chọn để xem riêng với policy ghim trong lệnh. GET không đảo danh sách theo lần đọc; có nhiều bản vẫn có thẻ. Nhóm draft với revision duy nhất bằng publishedRevisionId, không gộp theo tên. Bản REVOKED vẫn có trong lịch sử/Đọc.
2. Editor phân biệt tạo mới / tiếp tục draft / xem revision. Đọc và tạo mới không ghi đè nội dung chưa lưu nếu chưa xác nhận bỏ. F5 giữ nội dung editor theo actor/project; tiếp tục draft dùng **PUT cùng ID + ETag của draft đã mở**. Sau lưu/xuất bản phải GET khớp receipt rồi mới chọn bản kết quả và báo thành công.
3. Chi tiết/lịch sử có Thu hồi: lý do, xác nhận ảnh hưởng, key và ETag revision; POST receipt rồi GET đối chiếu. Không tự thu hồi revision khác, không đổi pin nhiệm vụ cũ. Quyền ghi vẫn PM-only.
4. Độ phủ dùng cùng dữ liệu GET cho PM/Sup và cùng cách đọc phạm vi/hiệu lực. Kiểm cả road/location frame, lý trình, độ lệch, supersedes, thời hạn, source version/file và TEST_ONLY. Xác nhận không biến thành duyệt toàn tuyến hoặc quyền thi công. Receipt độ phủ phải chứa đúng mapping và GET phải có cùng mapping/scope/source/ngày/provenance/reason.
5. Sup có validation tại trường scope, bàn giao, căn cứ, nguồn gốc, thay thế, ngày và ý kiến. Số hiệu nhập tay chỉ là ghi chú. Không dựng hồ sơ bàn giao hoặc lựa chọn nguồn.
6. Chọn policy giao Crew lọc revision đã publish, chưa revoke, đúng loại lỗi và checklist phương án. Không lấy checklist từ policy đang xem. Các hạng mục được đề xuất qua Web về sau giữ proof request/receipt đã GET đối chiếu để đối chiếu checklist bất biến; hạng mục cũ không có proof và thiếu nguồn đọc thì báo chặn.
7. Journal hỗ trợ PUT mới và tương thích POST cũ không có trường method. Timeout giữ nguyên key/body/ETag/method; có receipt chỉ GET. Không đổi hoặc xóa journal cũ để vượt chặn. Mapping số đo, đơn vị và instructions được giữ.

## Kiểm chứng

| Mức | Kết quả | Giới hạn |
| --- | --- | --- |
| Code | PASS: 15 nhóm `check-fasttrack-web.cjs`; 17 nhóm `check-fasttrack-forms.cjs` | Component TSX + hook/service thật, transport và browser storage mô phỏng; không phải giao dịch DB |
| Domain BE | PASS: 16 nhóm `check-fasttrack-policy-domain.cjs` | Biên dịch source domain/validator b89a52f thực; payload sinh từ form đưa vào validator/intake/Evaluate; không chạy SQL |
| Typecheck/build | PASS: `npm run build` gồm `tsc -b` và Vite | Còn cảnh báo bundle lớn có trước; không sửa ngoài phạm vi |
| Diff | PASS scoped `git diff --check` | Local ngoài phạm vi được giữ nguyên |
| Browser PM | PASS: điền ô thật, chọn/Đọc hai revision, cảnh báo giữ/bỏ nội dung, F5 giữ editor, lịch sử nhóm đúng, mở/điền thu hồi không submit; điền Crew, nguồn, phạm vi và chỉ dẫn | Chỉ GET dữ liệu thật; không bấm submit nghiệp vụ |
| Browser Sup | PASS: đăng nhập qua form, nguồn thật, lỗi ngày sai tại trường, sửa ngày vẫn chặn bàn giao thiếu; dự án 321 đọc cùng phạm vi 3–4 m/chưa xác nhận như PM; không có nút giao việc | Không thể xác nhận thiếu nguồn; không gửi POST coverage |
| Runtime mutation | **NOT_RUN**: create/update/publish/revoke/coverage/assign | Theo yêu cầu không mutation thật; login/logout chỉ phục vụ đổi phiên kiểm quyền |

Các test component có kiểm same-name revision không bị gộp, draft PUT→publish một revision, draft đổi bên ngoài không tự nhận ETag mới để xuất bản, GET sai receipt không báo thành công, F5 với receipt chỉ GET, PUT timeout giữ identity, revoke receipt/GET failure, Sup ngày sai/nguồn giả/supersedes cũ bị chặn, scope tương lai/hết hạn/lệch/source thay đổi/TEST_ONLY. Test domain thực còn kiểm PM-only revoke, lịch sử bất biến và policy thu hồi không Evaluate thành đủ điều kiện.

Browser sau reload không còn lỗi React mới; GET road-geometry-submission 404 của một số dự án vẫn xuất hiện từ luồng đọc dự án có trước. Không sửa menu dự án trong lượt này.

Ảnh toàn trang ở `artifacts/fasttrack-pm-sup-complete/screenshots/`: `policy-read.png`, `policy-321.png`, `policy-dirty.png`, `policy-legacy.png`, `policy-history.png`, `policy-revoke.png`, `dispatch-top.png`, `dispatch-bottom.png`, `sup-top.png`, `sup-bottom.png`, `sup-321.png`. Modal cuộn nên chụp cả đầu/cuối. `review-three-forms.jpg` ghép phần modal để xem nhanh; ảnh gốc vẫn giữ toàn trang. Sau kiểm, đã trả lại editor/view snapshot và nội dung form giao việc trước kiểm; không thay journal/fixture.

## Phần còn chặn và nghiệm thu tiếp

- **Thiếu nguồn runtime:** SBX-A có căn cứ bảo trì nhưng không có hồ sơ bàn giao đã chấp nhận. Dự án 321 GET coverage có scope 3–4 m, sources rỗng, history rỗng. Chưa xác nhận độ phủ; không có dữ liệu mới được tạo trong lượt này.
- **Thiếu trường đọc runtime:** item fixture `3a1e007d-fb53-4b0a-9b1a-649e7a435f96` còn ReadyToAssign, nhưng item GET không trả checklist phương án và chưa có proof đề xuất Web. Chặn chọn policy/lệnh mới thay vì tự chọn TEST hoặc revision mới nhất. Cần nguồn đọc hợp lệ; không lấy thông tin từ SQL, fixture script hay ô policy để giả thành nguồn server.
- **Giới hạn quyền/contract:** Sup không đọc policy hoặc defect gốc; vẫn đọc repair items và coverage. Chưa có API liệt kê toàn bộ policy/mã điều kiện dừng: danh sách chỉ gồm các reference/receipt đã đọc rồi GET canonical; không tuyên bố đó là toàn bộ DB. Web không fallback bearer.
- **Chưa nghiệm thu ghi runtime:** PUT draft, publish, revoke, Sup confirm, assign và readback DB sau những lệnh mới cần người dùng thực hiện khi có đủ nguồn. Các test xanh không thay cho nghiệm thu này.

Checklist người dùng: (1) PM chọn dự án, mở policy, chọn bản và Đọc, kiểm ngưỡng/trạng thái và lịch sử; (2) tạo draft mới riêng hoặc tiếp tục draft đã mở, kiểm GET đúng ID, F5 và publish; (3) chỉ khi chủ động muốn thu hồi, nhập lý do và xác nhận ảnh hưởng trong chi tiết, kiểm GET REVOKED và không chọn được cho lệnh mới; (4) Sup chọn scope/hồ sơ bàn giao/căn cứ thật và thời hạn, xử lý nguồn thiếu trước khi xác nhận; (5) PM chỉ giao khi có nguồn checklist phù hợp, tự chọn revision và Crew; quyền thi công còn phải do BE/Crew đánh giá, không suy từ giao việc hoặc độ phủ.
