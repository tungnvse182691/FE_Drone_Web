# H1 — Hộp thư tiếp nhận / bản đồ tuyến / matching / dropdown / UI lẻ — 2026-11-26

Môi trường: BE `roadguard-v5` (`https://localhost:18443/api/v1`, có migration `ReporterRoutingMap`), Vite `http://localhost:5180`. FE-only. Kiểm: `node_modules/.bin/tsc -p tsconfig.json --noEmit` sạch; `npx vite build` sạch (build ra thư mục tạm để không đè `dist`); e2e `tools/e2e/h1-case-routing.mjs` (prep|sup|pm|pmlink|pmconf) và `h1-ui-misc.mjs`. Dữ liệu test: `TEST-DATA-LEDGER.md` mục "B13 · H1".

## Bảng yêu cầu -> trạng thái

| # | Yêu cầu | Trạng thái | Bằng chứng |
|---|---|---|---|
| 1a | Bản đồ MapLibre mọi dự án công ty, nhãn tên dự án (GET /company/road-map, đọc đủ trang, ETag/304, unavailableRoutes, trang rỗng còn nextCursor, 409 routing_cursor_stale) | ĐÃ SỬA + KIỂM e2e | `sup`: 4 tuyến/2 dự án khớp API, nhãn `Synthetic Project A · DEMO-A`..., canvas MapLibre, chú giải |
| 1b | Chỉ điều hướng tới GPS của ĐÚNG ảnh/evidence được chọn; ảnh không GPS không điều hướng, không điểm giả | ĐÃ SỬA + KIỂM | chấm GPS đúng toạ độ ảnh; Case không GPS: `map-no-gps`, không `gps-pin`; đổi ảnh bằng nút "Xem ảnh" |
| 1c | GET routing-candidates?reportId&evidenceId (đọc đủ trang, phân biệt thiếu GPS ≠ ngoài phạm vi, UNKNOWN giữ UNKNOWN) | ĐÃ SỬA + KIỂM | khoảng cách/phương pháp/relation/uncertainty/responsibility hiển thị đúng BE; thiếu GPS: `GPS_MISSING` + "KHÔNG đồng nghĩa ngoài phạm vi" |
| 1d | Triage có căn cứ: Case If-Match, Idempotency-Key, CSRF, geometryVersion từ geometry-package | ĐÃ SỬA + KIỂM | UI Giám sát: POST triage 200; GET Case `routingSource` có reportId/evidenceId/roadSectionId/routingEvaluationVersion/routeVersionId/segmentSetId/geometryVersion; thiếu pin thì không gửi roadSectionId/evaluation |
| 1e | POST routing-decisions NEEDS_LOCATION_EVIDENCE / OUTSIDE_COMPANY_SCOPE + GET lịch sử | ĐÃ SỬA + KIỂM | NEEDS: 200, lịch sử 1 EFFECTIVE, Case vẫn UNASSIGNED, sau F5 UI đọc lại từ máy chủ. OUTSIDE: form attestation đủ Report; BE trả 409 `routing_responsibility_unresolved` (đúng contract: trách nhiệm UNKNOWN không được suy OUTSIDE) và UI hiện mã + mã đối chiếu; lệnh bị từ chối giữ journal, không tự gửi lại |
| 1f | Quyền Sup/PM đúng REPORTER-ROUTING-MAP.md | ĐÃ KIỂM | PM: không có bản đồ toàn công ty (GET road-map = 403), ứng viên chỉ trong dự án Case (`CURRENT_CASE_PROJECT_ALL_VERSIONS`), không có form quyết định tiếp nhận; Sup: bản đồ + candidates + decisions + triage; chỉ ghi khi Case UNASSIGNED |
| 1g | Hiển thị distanceStatus/distanceMethod/overlapStatus/accuracy | ĐÃ SỬA + KIỂM | Routing: `distanceMeters`+`distanceMethod`, `spatialRelation`, `uncertaintyStatus`, `responsibility`, sai số nguồn. Matching Report->Defect: `distanceStatus`, `distanceMethod`, `overlapStatus`, `accuracyMeters`, `historySummary.sourceLinkCount` (xem "Cần BE" #1) |
| 2a | B1: GET/POST matching-location; tìm mở rộng; phân biệt chưa tìm / không kết quả / lỗi | ĐÃ SỬA + KIỂM | `ReportMatchingPanel`: trạng thái vị trí nguồn; xác nhận GPS ảnh (POST 200, đọc lại "PM đã xác nhận GPS ảnh"); nút "Tìm mở rộng toàn dự án" (chỉ GET, `expand=true`); 3 trạng thái hiển thị riêng; không tự liên kết/gộp |
| 2b | B2: nguồn đọc liên kết Defect không chỉ Case.defectIds; tách liên kết nguồn / kết luận Case / công bố; KEEP_NEW ≠ VERIFIED | ĐÃ SỬA + KIỂM | khối `source-state` đọc quyết định+Defect từ máy chủ: "KEEP_NEW -> #DEF-… (Defect: OPEN)", "Kết luận Case: chưa kết luận", "Công bố: thao tác riêng"; e2e xác nhận `Case.defectIds=[]` mà nguồn vẫn hiển thị đã liên kết |
| 2c | HUY-BUG-004 công bố có Defect + NO_DEFECT riêng | ĐÃ CÓ SẴN (G1) | giữ nguyên `PublishModal`/`publishCase`; nhánh có Defect vẫn BLOCKED: BE chỉ điền `Case.defectIds` sau kết luận CONFIRMED (chưa dựng được ở seed v5) |
| 2d | HUY-BUG-006 Case OPEN sau bổ sung | ĐÃ CÓ SẴN (G1), không thay đổi | mapper giữ `conclusion=null` cho Case OPEN; không kiểm lại e2e vòng này (không có Case bổ sung mới) |
| 2e | CASE04-05 LINK_EXISTING / REJECT | ĐÃ KIỂM LẠI | BE mới: sau "tìm mở rộng" có 6 ứng viên Defect; LINK_EXISTING qua UI -> `candidate-decisions` 201 (trước G1 BLOCKED). REJECT đã có từ G1 |
| 3a | Dropdown "Loại khiếm khuyết mặt đường" từ GET /catalog/defect-types, bỏ "Khác", tải/lỗi/thử lại, mã lạ không tự đổi | ĐÃ SỬA + KIỂM | `DefectDetailVerify` + `DefectVerifyForm`: options = `code=name` đúng catalog (CRACK, POTHOLE) + "Chọn loại"; không còn CUSTOM; mã hiện tại không có trong danh mục -> cảnh báo + yêu cầu chọn, nút Chấp nhận khóa; Giám sát chỉ thấy chữ (catalog PM-only) |
| 3b | "Mức độ nghiêm trọng": enum + bảng nhãn chung, không mặc định | ĐÃ SỬA + KIỂM | `src/utils/severity.ts` (LOW Thấp / MEDIUM Trung bình / HIGH Cao / CRITICAL Nghiêm trọng, `severityLabel` trả "Chưa phân loại" cho mã lạ). Dùng ở ReportDefectIntake, DefectVerifyForm, banners, zoom, rows, card, bộ lọc, StatusBadge, surveyService/dashboardService. Màn AI: không còn mặc định HIGH (state `''`, lấy từ máy chủ nếu hợp lệ) |
| 4a | Xoá dòng lý trình ngoài | ĐÃ SỬA + KIỂM | `TriageCard` (meta row) và `CitizenTriageRow` (khối [Trục chính] + lý trình) |
| 4b | Xoá "chưa xác định ưu tiên" | ĐÃ SỬA + KIỂM | badge ẩn khi UNKNOWN; bảng hiện "—" thay vì nhãn "Thấp" sai |
| 4c | Hiển thị đúng nội dung/tên/SĐT người gửi | ĐÃ SỬA + KIỂM | `enrichReporterInfo` (triageService) đọc `GET /cases/{id}/reports` (tài khoản hiện tại của Reporter) cho danh sách: tên, SĐT, nội dung, nguồn "Phản ánh từ người dân"; lỗi đọc báo riêng. e2e: không còn "Chưa xác định nguồn tiếp nhận"/"Chưa có nội dung" |
| 4d | GPS ảnh + bảng thông tin overlay | ĐÃ SỬA + KIỂM | chip GPS (đã có G1) + bảng `evidence-info-table` trên ảnh: người gửi, SĐT, loại ảnh, thời điểm chụp (thiết bị khai), thời điểm máy chủ nhận, nguồn GPS, sai số. "Crew nộp lên": ảnh Crew thuộc màn nghiệm thu/FIELD (H2/G4), phần này chỉ làm ảnh Reporter |
| 4e | Giao diện "thiết lập mật khẩu mới" | ĐÃ SỬA (kiểm tĩnh) | `ForceChangePassword.tsx` dùng lớp CSS không tồn tại (`float-logo-104`, `glass-card-inner`, `aurora-blob-1..3`, `aurora-grid-overlay`) -> logo phình to, thẻ trong suốt. Đổi sang lớp của trang Login. CHƯA KIỂM bằng UI: cần tài khoản `mustChangePassword`, không đổi mật khẩu tài khoản seed |
| 4f | Profile ô SĐT đúng số Giám sát cập nhật | ĐÃ SỬA + KIỂM | `UserProfileModal` đọc `GET /me/phone-number` (trước: `userDirectory`/state cục bộ). e2e: Sup PATCH 204 -> Profile PM hiện đúng số; trạng thái tải/lỗi/thử lại; null -> "Chưa có thông tin" |
| 4g | B5 Sup chỉ thấy phạm vi được duyệt | ĐÃ SỬA (kiểm nhánh BE, UI BLOCKED) | `surveyService.readCandidateState`: Giám sát gặp 403 ở `candidate-decisions` -> `decisionRestricted` (không phải lỗi/stateUnknown, không khóa như "chưa xác định"); banner ở `DefectDetailVerify` và dòng ở `MissionTriageList`. BE thật trả 403 (đã kiểm). UI Giám sát mở mission có quyết định PM: BLOCKED (không dựng được mission trong seed v5) |

## File đã sửa/tạo (chính)
- Mới: `src/api/services/routingMapService.ts` (readMap L74, readCandidates L109, decide L157), `reportMatchingService.ts`, `src/utils/severity.ts`, `pages/(pm)/ai-review/RoutingMapView.tsx`, `ReportRoutingPanel.tsx`, `ReportMatchingPanel.tsx`.
- `triageService.ts`: `CaseTriageInput` thêm `reportId/evidenceId/roadSectionId/routingEvaluationVersion` (L48, body L565); `enrichReporterInfo` (L256). `useCaseIntake.ts` (execute nhận grounds). `TriageGeometryScope.tsx` (`onRoad`). `TriageProjectModal.tsx` (khối căn cứ L197, đọc ứng viên khi dùng đối chiếu, khóa gửi khi chưa đọc xong). `ReviewModals.tsx`, `ReviewDetailDrawer/Modal.tsx`, `AIReviewInbox.tsx` (onCaseChanged -> đọc lại Case sau quyết định, toast).
- `ReportDefectIntake.tsx` (nhúng matching panel, `expand`, khối `source-state`), `DrawerMediaViewer.tsx` (bảng thông tin ảnh L72), `TriageCard.tsx`, `CitizenTriageRow.tsx`, `CitizenTriageChildRow.tsx`, `ReviewFilterBar.tsx`, `DrawerDecisionBanners.tsx`, `PhotoZoomModal.tsx`.
- `DefectDetailVerify.tsx` (catalog L400, bỏ CUSTOM, severity không mặc định, banner B5), `defect-verify/DefectVerifyForm.tsx` (dropdown L294), `DefectVerifyHeader.tsx`, `drone-review/MissionTriageList.tsx`, `drone-review/types.ts`, `StatusBadge.tsx`, `surveyService.ts`, `dashboardService.ts`, `types/domain.ts`.
- `components/common/UserProfileModal.tsx` (L83), `pages/(auth)/ForceChangePassword.tsx`.
- Test: `tools/e2e/h1-case-routing.mjs`, `h1-ui-misc.mjs`, `h1-probe*.mjs`.

## Kết quả kiểm thật (BE v5)
- `h1-case-routing.mjs sup`: 35/35 (danh sách, bản đồ, ứng viên, triage có evaluation, NEEDS, OUTSIDE bị BE chặn có hiển thị). `pm`: 6/6. `pmlink`: 13/13 (KEEP_NEW, B2, mở rộng, LINK_EXISTING). `pmconf`: 3/3 (POST matching-location).
- `h1-ui-misc.mjs`: Profile PASS, dropdown/severity PASS (5), force-page kiểm tĩnh PASS (2), B5 BE 403 PASS + UI BLOCKED.

## Chưa kiểm được / giới hạn FE
- OUTSIDE_COMPANY_SCOPE thành công: BE luôn trả `routing_responsibility_unresolved` vì seed chỉ có độ phủ TEST_ONLY/trách nhiệm UNKNOWN; FE đã sẵn form attestation (mọi Report đúng một lần, ROUTE_VERSION/COVERAGE_MAPPING lấy từ ứng viên) nhưng nhánh 200 chưa kiểm.
- matching-location chỉ xác nhận bằng ảnh (evidence); xác nhận theo segment (`segmentIds`) chưa có UI vì cần danh sách segment từ geometry-package (FE hiện chỉ đọc pin).
- Nhánh PM "triage có căn cứ" (PM đổi phương thức qua `caseScopeService`) chưa gửi grounds (BE coi là thêm tùy chọn).
- Trang thiết lập mật khẩu mới, B5 UI Giám sát: xem bảng.
- Mức độ: nhãn chung đã áp cho các màn Case/AI/Defect; màn Fast Track/đề xuất do H3 giữ nhãn riêng nếu có.

## Lỗi / quyết định cần BE
1. **Tên trường khác tài liệu yêu cầu:** `routing-candidates` trả `spatialRelation`/`uncertaintyStatus` (không có `distanceStatus`/`overlapStatus`); các trường `distanceStatus`/`distanceMethod`/`overlapStatus` chỉ có ở `GET /projects/{pid}/candidates` (Report->Defect). FE hiển thị đúng trường thật theo từng endpoint. Nếu mong đợi hai bộ trường thống nhất, cần BE xác nhận.
2. `GET routing-candidates` luôn `completeness: INCOMPLETE` + `SPATIAL_DISTANCE_IS_NOT_RESPONSIBILITY` kể cả khi đã đọc hết trang (đúng thiết kế?). FE hiển thị nguyên văn, không diễn giải thành "đủ".
3. Case có Defect KEEP_NEW vẫn `defectIds: []` tới khi kết luận CONFIRMED (đã nêu ở G1); không có API đọc Report->Defect theo nguồn ngoài sessionStorage reference + `historySummary.sourceLinkCount` ở candidates. Cần BE xác nhận nguồn đọc lâu dài (B2).
4. Seed v5 không có độ phủ REAL_SOURCE nên OUTSIDE không thể thành công; cần dữ liệu mẫu nếu muốn nghiệm thu nhánh 200.
