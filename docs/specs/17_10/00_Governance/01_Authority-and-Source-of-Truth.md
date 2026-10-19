# Authority and source of truth

**Phase 1 governance · 14/10/2026 · owner-authorized documentation scope.** [Canonical entrance](../README.md).

## Precedence and conflict handling

| Thứ tự sử dụng | Nguồn / authority | Cách áp dụng |
|---|---|---|
| 1 | Quyết định owner mới, có scope/date/nguồn rõ | Supersede đúng phần mâu thuẫn của quyết định cũ; không tự mở rộng sang wire/schema/data policy khác |
| 2 | [Confirmed decisions 32–44](../../product/confirmed-decisions.md) và latest owner-approved [HUY final specification](../../../planning/development/HUY-FINAL-INTEGRATION.md) | R01–R30, latest ND01/activation và H1 persistent login được đọc trước checkpoint cũ trong cùng file; không lấy đoạn lịch sử để đảo kết luận mới |
| 3 | Assigned scoped spec/contract có adoption evidence | Chỉ áp đúng actor/resource/version/package đã giao; package table hoặc draft proposal không tự duyệt endpoint/schema |
| Implementation axis | Current source ở pinned SHA, production DI/caller/DTO/model/guard | Xác định hành vi thực có; không thể thay quyết định nghiệp vụ chỉ vì code tồn tại |
| Verification axis | Exact executed command/environment/output/SHA | Chứng minh điều kiện đã thực thi; unit/mock/schema discovery không là actual client/provider/deployment E2E |
| Historical/reference axis | Tài liệu cũ, archived RF/V2, snapshot/lock/example/prototype | Dùng để đối chiếu và truy vết, không tạo assignment hoặc authority mới |

Implementation và verification là các trục chứng cứ, không phải business authority thấp/cao có thể tự ghi đè quyết định owner. Tiêu đề “Official”, ngày mới nhất, test xanh hoặc version V2 cũng không tự chấp nhận wire/schema.

Khi có mâu thuẫn:

1. Ghi EXPECTED kèm owner decision và ACTUAL kèm exact source/symbol/line/SHA.
2. Owner khác source: `PRODUCT_SOURCE_GAP`. Source đúng nhưng doc cũ khác: `DOCUMENT_STALE`. Wire/adoption còn thiếu: `CONTRACT_GAP`. Chưa đủ nguồn: `UNKNOWN` hoặc `NOT_VERIFIED`.
3. Nêu impact, priority, owning team và bounded recommendation. Không hợp thức hóa lỗi bằng tài liệu; không sửa source/API/migration trong docs task.
4. Hỏi quyết định ở dependent checkpoint nếu thực sự cần; tiếp tục phần độc lập. Quyết định đã cung cấp không hỏi lại.

Canonical precedence được phê chuẩn cho việc xây tài liệu Phase 1; chưa là acceptance của mọi implementation hoặc consumer contract.

## Evidence and status legend

| Label | Nghĩa | Không chứng minh |
|---|---|---|
| `OWNER_CONFIRMED` / `TARGET_CONFIRMED` | Quyết định nghiệp vụ/scope có nguồn owner | Wire, schema, implementation hoặc test đã được chấp nhận |
| `CURRENT_VERIFIED` — source | Source/DI/model/guard được quan sát tại SHA cụ thể | Mọi branch runtime hoặc client deployment |
| `CURRENT_VERIFIED` — executed | Command/output thực chạy ở môi trường và phạm vi ghi rõ | Toàn hệ thống E2E hoặc performance ngoài tập chạy |
| `DOCUMENTED_ONLY` | Có assertion trong tài liệu nhưng chưa đủ current evidence | Implementation tồn tại hoặc runtime PASS |
| `PROPOSED` | Phương án UX/architecture/canonical destination cần review/adoption | Tính năng đã làm hoặc đã được owner chốt |
| `NOT_VERIFIED` | Chưa có acceptance/execution/source access cần thiết | Không tồn tại tính năng |
| `UNKNOWN` | Chưa đủ dữ kiện để xác định | Giá trị0, false hoặc business denial mặc định |
| `HISTORICAL` | Evidence/checkpoint cũ, giữ nguyên scope/SHA/date | Current task runtime PASS |
| `DOCUMENT_STALE` / `PRODUCT_SOURCE_GAP` / `CONTRACT_GAP` | Phân loại variance | Reproduced exploit hoặc severity P0 tự động |

`SOURCE_VERIFIED` và `RUNTIME_VERIFIED` trong Phase 0 tương ứng hai nhánh CURRENT_VERIFIED phía trên. Mọi runtime assertion cần command, environment, SHA, passed/failed/skipped và limitation; tên test không là kết quả. Model discovery không là deployed SQL verification.

## JEV review format

Mỗi finding giữ **J**: PASS/PARTIAL/FAIL/NOT_VERIFIED/NOT_APPLICABLE; **E**: source path, symbol, line range, method/path, DTO, guard/role/scope, SHA và command/output nếu chạy; **V**: EXPECTED/ACTUAL/impact/priority/root cause hoặc UNKNOWN. Recommendation phân biệt docs correction, BE/FE/AI implementation delta và owner decision. Security risk chưa tái hiện không gọi là exploit đã xác nhận.

## Glossary

| Term | Nghĩa trong HoangHaiWarrantySystem | Ranh giới cần giữ |
|---|---|---|
| Report | Nguồn mô tả/ảnh/capture metadata do Reporter gửi | Không tự là Defect; Reporter quản lý own evidence/report |
| ReportSupplement | Bổ sung append vào report | Không rewrite nguồn ban đầu hoặc tự quyết Defect |
| IncidentCase / Case | Nghiệp vụ gom/tách/triage/conclude report | Internal conclusion khác publication; không cấp quyền đọc mọi private photo |
| Candidate | Ứng viên/suggestion từ Report hoặc AI source | PM quyết định; không auto merge/Defect approval |
| Candidate decision | KEEP_NEW/LINK_EXISTING/REJECT theo current source/version | Không có quyền do AI hoặc Reporter tự duyệt |
| Defect | Business record hợp lệ qua quyết định PM và nguồn | Nguồn Reporter độc lập Survey/AI; no fake Survey |
| Survey | Nghiệp vụ khảo sát/drone nguồn được giao | Không ép có Survey khi Reporter tạo Report/Defect/FIELD |
| Dataset / SurveyDataVersion | Bộ nguồn survey có version/manifest/integrity | Server-confirmed dataset không chứng nhận model accuracy |
| Road section / route version | Phạm vi đường và geometry/version theo DTO/source | Giữ exact identifier; không tự đồng nhất các entity chỉ vì dịch tên giống nhau |
| Road segment / segment set | Đoạn GIS thuộc route/set version và scope | Khác image/pixel segmentation |
| Road-surface segmentation / road mask | Phân vùng pixel mặt đường trong ảnh/frame | Placement/service và phương pháp cần benchmark; không phải GIS segment |
| FIELD task | Task hiện trường gắn source/Defect/pins/assignment | Task đo không cấp repair authority; SurveyId có thể null cho nguồn Reporter |
| Physical measurement | Crew đo trực tiếp, giữ đơn vị/phương pháp/nguồn/UNKNOWN | Không suy kích thước từ YOLO bbox/GSD/AI confidence |
| NORMAL Repair | PM proposal → Supervisor approve → PM assign → Crew execute → PM review → Supervisor final | Không rút approval chain vì đổi client |
| Fast Track | Execution theo policy/coverage/authorization riêng; PM final, Supervisor được thông báo | Không áp threshold/cap hoặc Supervisor final approval mới khi chưa được chốt |
| Private evidence | REPORT_PHOTO/nguồn riêng owner | Gắn vào Case không tự public ảnh cho Reporter khác |
| Publication | Projection/summary/evidence công bố tới recipient report cụ thể | Không lộ internal note hoặc biến conclusion thành auto-publication |
| Snapshot / source pin | Version/context/task/geometry/policy đã tải | Không quyền vô hạn khi reconnect/current scope bị revoke |
| Idempotency receipt | Kết quả durable của retry cùng semantic command | Không là cryptographic signature; replay vẫn kiểm quyền hiện tại |
| Signed batch | Canonical claim được ký bằng device key đã đăng ký | Không xác nhận người thật hoặc historical UTC chính xác |
| Business ACK | Tiếp nhận nghiệp vụ đúng recipient/request/version theo source | Inbox read/HTTP receipt không tự khởi tạo business clock |
| Durable per-item ACK | Server receipt/effect đã committed cho item offline | HTTP200 batch không cho xóa tất cả item local |
| Handover | Bàn giao dữ liệu/nguồn mã hóa theo current scoped grant | Không organizational recovery escrow khi device/key đã mất |
| UNKNOWN / INCOMPLETE | Nguồn hoặc quantity/readiness chưa đủ | Không bằng0 hoặc tự đủ điều kiện conclusion/repair |

Định nghĩa được dẫn từ [product/decisions](02_Product-Decisions-and-Scope.md), [current API evidence](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [assigned spec](../../../planning/development/HUY-FINAL-INTEGRATION.md); đây không phải glossary tạo thêm workflow mới.
