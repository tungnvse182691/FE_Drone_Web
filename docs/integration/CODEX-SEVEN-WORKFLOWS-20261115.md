# Tiếp quản bảy phần — 15/11/2026

## Phạm vi và mức hoàn thành

Đây là báo cáo một đợt tích hợp, **không phải xác nhận hoàn tất cả bảy luồng**. Các phần đọc đã chạy trong browser PM; mutation chỉ kiểm bằng transport mô phỏng. Không gửi mutation nghiệp vụ thật, không đăng nhập/đổi vai để kiểm Supervisor. Không sửa BE/Mobile, không reset/clean, không tạo worktree/bản giải nén.

Đọc AGENTS.md, ANTIGRAVITY-HANDOFF-20261115.md, WEB-PM-SUP-API-STATUS-20261115.md, Spec17_10 workflow07/08/10, contract và source BE đúng commit. Docker image label `org.opencontainers.image.revision` = `b89a52fe11ed146f197f3f94e115530b9b75afb0`; runtime HTTP28081/HTTPS28443; Vite proxy HTTPS28443. Source được đọc bằng git show tại revision này, không dùng checkout HEAD để suy runtime.

Các source đã đối chiếu: DiscoveryCollectionsController; DefectsController; RepairsController; RepairPackagesController; RepairEligibilityController; RepairPoliciesController; RoadCoverageController; RetentionController; ProcessingV2Controller; WebCookieConfiguration; RepairWorkflowDtos, RepairHistoryDtos, RepairEligibilityReadDtos, RoadCoverageDtos; RepairProducerService; RepairWorkflowRepository.Producing. Contract `deploy/fe-handoff/openapi.json` tại cùng SHA và `docs/contracts/openapi.json` được tra request/response.

Discovery dùng `limit`/cursor; Defects dùng `pageSize`/cursor. State runtime là `Normal`/`AwaitingApproval`, không phải enum uppercase do UI cũ tự suy. `allMandatoryResolved` chỉ nói nghĩa vụ đã giải quyết, không chứng minh approval/final/đóng toàn gói.

## Bảng bảy phần

| Phần / menu PM; Supervisor dùng cùng hậu tố dưới /sup | Đã sửa / API có và vừa nối | Còn chặn hoặc còn dở | Tự động / runtime |
|---|---|---|---|
| Điều phối nhanh `/pm/fast-track` | Đọc package/item, chỉ lọc mode FastTrack; GET road-coverage; GET item/eligibility khi mở item FastTrack. Không suy eligibility từ severity, không dùng default project/package. Đọc scope, nguồn, lịch sử và ETag thật. | Chưa nối tạo/xuất bản policy, xác nhận coverage, assign. Runtime mẫu không có item FastTrack; coverage có nguồn chưa externally verified, không handover/confirmation. Đây gồm cả việc FE còn dở, không chỉ lỗi BE. | Repair7 nhóm PASS. Browser PM: coverage200,1scope/1source/0history; danh sách FT rỗng đúng DB. Chưa runtime positive eligibility. |
| Gói sửa chữa `/pm/proposals` | Đọc package→items→item/history; nguồn Defect và tuyến/bộ PUBLISHED thật. Form một Defect/một formal obligation, scope vật lý nhập rõ; POST package→GET list→POST item→GET items. Supervisor approve một item qua current GET/ETag. Journal key/body/version/receipt tách hai lệnh. | Chưa runtime POST theo yêu cầu. Form chưa hỗ trợ layout/slab BTXM; package cũ không item thiếu nguồn discovery obligation để propose tiếp. Chưa nối assign. Không có API gửi duyệt/xóa/duyệt toàn package. | Repair7 PASS; PM browser đọc1package/1item AwaitingApproval, history200, form đọc Defect/tuyến/bộ. PM không có nút approve. Supervisor browser chưa kiểm. |
| Nghiệm thu `/pm/acceptance` | Dùng item state/result và history thật; phân biệt NORMAL Supervisor final, FT PM final. Bỏ đóng gói/accept/rework trong bộ nhớ. Giữ source component so sánh cũ trên đĩa; chưa đưa vào luồng thật khi chưa có binding evidence. | FE chưa nối đủ assignment→Crew attempt→PM ACCEPT/SUPPLEMENT→final, ảnh/bản đo Trước/Sau. Final service có journal nhưng UI khóa final khi chưa có trình xem evidence. DB mẫu chưa có attempt/review; không dựng thay Crew. | Repair7 PASS cho journal/quyền; FIELD read8/review4 PASS bảo toàn. Browser history hiện chưa có lần thi công; không nghiệm thu giả. Chưa runtime từ Submitted đến Confirmed. |
| Báo cáo KPI `/pm/reports` | Giữ thiết kế thẻ/map/table Antigravity, bỏ fallback AVAILABLE0 khi source thiếu; tách error/loading/empty. Giữ API summary/items/timeline, geometry32648 adapter và export. Chặn lọc quy trình khi nguồn không có, bỏ YTD sai nghĩa. Giảm UUID trên bảng. | Risk đa kỳ, SLA, thời gian duyệt/tái phát không có nguồn phù hợp; không thêm công thức. Một số metric PARTIAL/UNAVAILABLE được giữ. | Reporting10/export12 PASS. Browser321 có map và4đoạn; summary200. PDF cũ detail/manifest/content200,35993byte,%PDF,SHA256 khớp ETag; completenessPARTIAL. |
| Thực nghiệm AI `/pm/research-validation` | GET ai-mock-runs đầy đủ cursor; GET result đúng runId; đọc validationMetrics từ reports/items (Bias/MAE/RMSE/unit nguồn). Bỏ sample tự sinh, timer tiến trình và ngưỡng TCVN không có căn cứ. | BE AiMockRunsController và ProcessingV2 chi tiết/tạo chưa cookie-eligible: result thật401 auth_unauthorized. Không đổi Bearer, không dùng mock. Chưa tạo/run/import pairs trên Web. | Read workflows4 PASS. Browser PM3run SUCCEEDED; validation không có bản ghi; result GET401 đúng source. Không runtime create. |
| Nhật ký hoạt động `/pm/audit-trail` | Thay mock bằng reports/timeline từng dự án được phép đọc; giữ bảng/drawer/bộ lọc thời gian theo Date.now; phân trang, lỗi và PARTIAL rõ. Không gán role/before-after/evidence khi nguồn không cung cấp. Không cho xuất nhật ký giả. | Timeline chỉ nguồn mapped, không audit toàn hệ thống. Chưa có API xuất nhật ký riêng; dùng export hồ sơ đã có. | Read workflows4 PASS; browser4event trên các dự án, PARTIAL, tìm kiếm/lọc và đọc lại; không UUID trong cột sự kiện. |
| Lưu trữ hồ sơ `/pm/retention` | GET retention/evaluations đầy đủ cursor; trạng thái/date thật; GET detail kiểm scope; chặn fake request/approve purge/legal-hold trong bộ nhớ. | RetentionController chưa cookie-eligible: detail401 auth_unauthorized. Có hold/basis/evaluation API nhưng chưa dùng được bằng phiên Web hiện tại. Không có API approve/delete/purge như UI cũ; không tự tính eligibility. | Read workflows4 PASS; browser1evaluation COMPLETE, ngày thật; detail GET401. Không runtime hold/evaluation mutation. |

## Dữ liệu và checklist nghiệm thu

1. **Điều phối nhanh:** cần item FastTrack có binding/policy/assessment thật; coverage với nguồn đã xác minh và handover. Chọn dự án→đối chiếu scope/source/history; có item thì mở điều kiện để kiểm đúng nguồn; DB không có item phải rỗng. Chưa nghiệm thu giao việc/policy.
2. **Gói sửa chữa:** cần PM hiện hành, Defect/version với tuyến hiện hành, bộ PUBLISHED, scope kỹ thuật có căn cứ, phương án/checklist. Kiểm form không điền số đo sẵn; khi chủ động nghiệm thu mutation: tạo→list→propose→list; lỗi mạng/F5 giữ request; có receipt không tạo lại. Sup cần current duty để approve. Chưa coi tự động test là POST runtimePASS.
3. **Nghiệm thu:** cần Crew có task/binding, assessment/start/finish/typed submission/ảnh BEFORE-AFTER đã verified; PM review accepted, Supervisor NORMAL hoặc PM FT. Hiện chỉ nghiệm thu được phần đọc lịch sử và chặn thiếu nguồn; quy trình ghi cuối vẫn dở.
4. **KPI:** dùng321 để kiểm4đoạn/map, chọn tuyến/bộ/đoạn rồi áp dụng filter và đọc lại; nguồn thiếu hiển thị gạch ngang/PARTIAL, không0giả. Mở export PDF đã có, kiểm completeness trước khi tải; không cần tạo export mới.
5. **AI:** dự án mẫu SBX-A có3run; kiểm stage/status/empty validation. Mở result phải báo401 rõ, không sinh progress/ảnh/số đo giả. Cần BE cookie eligibility trước khi nghiệm thu tạo/chi tiết.
6. **Nhật ký:** dùng SBX-A hoặc All; lọc30ngày/search/refresh; mở drawer không được tự điền actor role hoặc state snapshots. Chỉ số không có nguồn là gạch ngang. Xuất riêng nhật ký bị khóa.
7. **Lưu trữ:** SBX-A có1evaluation; so ngày/status với GET. Detail401 phải hiện lỗi. Không có nút purge thành công trong bộ nhớ. Cần BE cookie eligibility và source/basis đầy đủ trước mutation.

## Kiểm tra đã chạy

- `npx tsc -b --pretty false`: PASS.
- `npm run build`: PASS, gồm tsc-b; warning cũ Tailwind duration-[250ms] và bundle lớn, không đổi cấu hình.
- `git diff --check` và staged diff-check: PASS cho thay đổi đợt này.
- `check-repair-workflow.cjs`:7 nhóm PASS (role/current ETag/state; ambiguity identity; receipt GET-only; cursor/scope; actor switch; package/propose receipts; coverage/eligibility).
- `check-readonly-workflows.cjs`:4 nhóm PASS (AI/retention scope và lỗi; timeline partial/no fabricated state; API error propagation).
- `check-project-reporting.cjs`:10 nhóm PASS.
- `check-project-exports.cjs`:12 nhóm PASS.
- Bảo toàn `check-field-create-api.cjs`:9 nhóm PASS; `check-field-read-api.cjs`:8 nhóm PASS; `check-field-review-api.cjs`:4 nhóm PASS.
- Tổng54 nhóm ở7 script trên. Các script này dùng transport mô phỏng, không POST backend thật.
- Browser dùng phiên PM-A hiện có, kiểm đủ7menu đọc; screenshot KPI/map được xem. Không login/logout/chuyển actor để test Supervisor. Không khẳng định Sup runtimePASS.
- PDF hiện hữu `20ba537b-7757-4cc5-bdd8-f1ec36a54145` thuộc321: chỉ GET, metadataSUCCEEDED/PARTIAL, manifest schemaanh02.export.v1/22sections; content200 application/pdf,35993byte,%PDF,hash khớpETag.

## Git và phần đang dở được giữ nguyên

Đã commit/push hoang theo các phần: `c0ebbdc` repair đọc/tạo-propose; `9de00d4` KPI; `271e586` activity; `194e120` AI đọc; `c2df1ab` retention đọc; `72db30a` FT coverage/eligibility. Các commit là phần cụ thể đã triển khai, không tuyên bố toàn bộ7phần hoàn chỉnh.

Các thay đổi UI cũ Antigravity trong RepairProposals/repair-proposals, AcceptanceList/evidence-closeout và proposal-approval còn giữ nguyên ngoài commit; không reset/ghi đè. Những route hiện chuyển sang component đọc/propose dựa contract; UI cũ vẫn trên đĩa để tiếp tục tái sử dụng, không coi các state/handler cũ là đã tích hợp. Legacy service mutation bị chặn thay vì giả thành công. Chưa commit các state còn suy số đo/phiên bản hoặc điều phối trong bộ nhớ như một luồng hoàn chỉnh. `conflictService.ts` là thay đổi có sẵn ngoài7phần, không sửa/commit trong đợt này.

`artifacts/` giữ nguyên19249file untracked lịch sử; không commit snapshot/network dumps hoặc secrets. Không thêm .env/node_modules/dist. Working tree vì vậy cố ý chưa sạch; không coi dirty tree cũ là thay đổi đã push.
