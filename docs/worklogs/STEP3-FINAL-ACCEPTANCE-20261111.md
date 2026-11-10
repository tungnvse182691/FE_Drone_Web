# Bàn giao Bước 3 FE — nghiệm thu đến 11/11/2026

Phạm vi chốt: CRS khi tạo dự án; draft geometry/submit/review rounds/confirm; phân đoạn PM quản lý và công bố; cấu hình Tấm & Khe và đọc lại PM/Sup. Không mở luồng kế hoạch khảo sát. Không thêm Sup duyệt segment set hoặc pavement. Commit FE, chưa push; không sửa BE/Docker/migration hoặc ghi dữ liệu nghiệp vụ trong lượt chốt này.

## Nghiệm thu và nguồn bằng chứng

| Ca | Kết quả và nguồn |
|---|---|
| Lưu draft COORDINATES cấp project chưa có section | PASS runtime: WWW POST201 → GET200, source119 điểm và metadata/design được giữ; không bắt tạo section/version/set trước |
| Sửa draft, cùng ID và ETag/readback | PASS runtime: WWW8→7,5→8m (các phiên trước); TEST123 REJECTED cùngdraft PUT200 → GET200 khi user chọn test0,2km/rộng10m |
| Sup từ chối có lý do | Quyết định server đã xác minh: TEST123 currentReview lượt1REJECTED, lý do “chưa đạt yêu cầu”, người/thời điểm quyết định có nguồn. Requestreject ban đầu do user thực hiện trước ca tiếp tục, Codex không capture lại request đó; quyền/reason/header/retry còn có test cô lập, không gọi đó là capture runtime mới |
| PM sửa/lưu cùng REJECTED và trình lại | PASS runtime: cùngdraft a55a82e4-7ea2-4c49-a116-7e1181a191fc, PUT200 vẫnREJECTED; POSTsubmit201 body{}, IfMatchmới → lookupSUBMITTED lượt2. PreviousRejection giữ nguyên; PM khóa sửa/nhập/xóa/lưu |
| Unchanged | PASS hành vi lỗi thực:409road_geometry_submission_unchanged với bản trùng snapshot; UI hiện rõ/giữjournal. BE so fingerprint kỹthuật, không dùng tên/lýdo để né; journal cũ được xử lý chủ động quaUI trước ca tiếp tục |
| Sup mở từ project, preview/readiness tự tải | PASS runtime TEST123lượt2: sessionSUPERVISOR, preview200/readiness200 tựgọi, đúngdraft/ETag, không bắt bấm nútpreview; ngày/lýdo đểusernhập |
| Sup xác nhận lượt2, khóa geometry | PASS runtime: đúng1POSTconfirm201 do userbấm; expectedCurrentVersionId=null, IfMatchAAAAAAAAlkI=; lookup/draftCONFIRMED lượt2 và geometryGET200COMPLETE; PM/SupF5 giữ119điểm, dài701.2905185122771m,4khoảng10m |
| PM quản lý/công bố segment set | PASS runtime các ca trước: ABC1/version2 create201 → edit200/readback → publish → GET/F5PM/Sup cùngsetf34228e0-8c30-4633-8024-84a934bcb71f. Draftriêng3e0d6df2… đổi200→250m giữDRAFT, khôngthayPUBLISHED. WWWpublication74bca04d… đọc đúngscope. Không có Supduyệt/ápdụng |
| Chọn publication/layout | PASS runtime read-only các phiên trước: mởbaseURLconfirmed tựtìmPUBLISHEDduynhất; PM/Supthấy4segment qua3tab. Test hồi quy mới: DRAFT/bảnmới do PMchọn không bịlayoutdiscovery repin; chỉchuyểnPUBLISHED qua thao tác rõràng. CaDRAFTdiscovery này chỉtestcôlập, khôngtạoDRAFTruntime đểépPASS |
| PM lưu Tấm & Khe, GET cấu hình/footprint | PASS runtime trước: WWWPOST201 → GETlayout8541f3ae-e279-4e1c-9f30-6d429ca774d7, đủlayout/cells/slabs,352tấm. GET trước thôngbáothànhcông; nhiềulayout chọnkind/time, khôngnewest; giữ bảnkhác |
| PM mở lại/F5; Sup mở từ dự án | PASS runtime đã quan sát: listAPIhaiPLANNED, userchọn8541f3ae…, PMF5giữ dải4m/L4m/H4cm/KC4m/KG4m/khe4mm và352tấm; Supđăngnhậpmởtừproject/listvàGETcùnglayout/config/geometry |
| Sup mở lại “layout321” và F5 | **NGƯỜI DÙNG XÁC NHẬN PASS** tại lượt chốt này: thông số và352tấm vẫnđúng. Không ghi là Codexquan sát mới. “321” là nhãn usergọi, chưa có đầyđủIDđể ánhxạalias. GETchỉđọc bổsung bằng phiênPM của Codex: layoutWWW8541f3ae… vẫn200/đúngconfig/352tấm; đây là đốichiếu layout đãbiết, khôngchứngminh alias321 hoặc SupF5 mới |

Các thao tác ghi runtime đều do người dùng chủ động bấm. Codex chỉ monitor, GET, mở modal/điều hướng đọc và F5. Không tạo dự án/layout hoặc ghi lại dữ liệu để chốt. Các ca runtime trước được dùng lại và ghi rõ, không coi là chạy mới ngày11/11.

## Reference quyết định

- TEST123: project cf371041-1c5f-4981-b868-2512fc160cc6; cùngdraft a55a82e4-7ea2-4c49-a116-7e1181a191fc; section e835456d-c44d-4560-aa98-446c4357a7ba; confirmedroute61b68417-638a-4b18-acad-f982756e628f.
- WWW: project9ec595db-12d2-4e99-9677-8aa305cf94f7; route3c2a859e-a60d-44eb-8768-006e719cd3ad; PUBLISHEDset74bca04d-f3f1-4bd1-b933-b7c87989b636; layoutđãđốichiếu8541f3ae-e279-4e1c-9f30-6d429ca774d7.
- BE contract source4b46a6af16a94be1e40687a8bb1d223a37ae8338: ROAD-GEOMETRY-SUBMISSION.md và PAVEMENT-LAYOUT-CONFIGURATION.md. Đây là nguồn contract đãđọc, không phải thayBE trong lượt chốt.
- RuntimeTEST123: artifacts/test123-round2-runtime/REPORT.md và01–06json; layout/review/deploy trước: artifacts/review-rounds-layout/REVIEW.md/json/log; selectionguard: artifacts/layout-selection-guard (FAILtrước/PASSsau).

## Giới hạn được giữ

Khe hiện là **cấu hình**, chưa phải hình học khe vật lý chính thức. Footprint tấm lấy từ server, không đổi previewFE thànhgeometryofficial. Chưa côngbốOFFICIAL hoặc mởnative/nhánh/calibration/discoveryngoàiphạmvi. Phântrang/multiplelayout/saiscope/AS_BUILT/sourcePlanId/historicalreference/timeout/race/conflict đượctestcôlập; không tuyênbố tấtcảcạnhruntimePASS. Không mở thêm vòngreject/lượt3, không testmutationlặp trênPUBLISHED. Luồngkếhoạchkhảosát không triểnkhai.

## Kiểm tra và commit

Danh sách file source/test chính xác phía dưới. Các file AIReview/survey/personnelngoàiphạmvi giữlocal; worklogchung chỉstageentryBước3 đãreview vàentrychốt, khônggộpentryAIcũ. Bản sửa giữDRAFT/bảnmới khilayoutdiscovery đã nằmtrongusePavementWorkflow vàregressioncheck-pavement-layout.

Kiểm định cuối chạy trên bản xuất từ **Git index sắpcommit**, không mượn thay đổi ngoài phạm vi trong workingtree để báoPASS. Kết quả/lệnh/log: artifacts/step3-final-commit/tests.json. Ghi riêng lỗi baseline, không bỏ/nớiassertion: Step2finalWebreassignment mongweb_cookie_unsupported nhưngTypeErrordata; draft-importfixturethiếuroadCode nên lỗi metadata xảyra trước assertioncoordinates. Các lỗi này đãđốichiếu trênHEAD/snapshottrước, không sửa trongtaskchốt.

- src/api/services/geometryDraftCommands.ts
- src/api/services/geometrySubmissionService.ts
- src/api/services/pavementService.ts
- src/api/services/projectService.ts
- src/api/services/segmentSetService.ts
- src/pages/(pm)/AlignmentSegments.tsx
- src/pages/(pm)/ProjectList.tsx
- src/pages/(pm)/ProjectOverview.tsx
- src/pages/(pm)/alignment/AlignmentAddModal.tsx
- src/pages/(pm)/alignment/AlignmentEditModal.tsx
- src/pages/(pm)/alignment/AlignmentHeader.tsx
- src/pages/(pm)/alignment/AlignmentSidebar.tsx
- src/pages/(pm)/alignment/SidebarFooterKpis.tsx
- src/pages/(pm)/alignment/SidebarSegmentCard.tsx
- src/pages/(pm)/alignment/SidebarSegmentsTab.tsx
- src/pages/(pm)/alignment/roadGuardDraftImportHelpers.ts
- src/pages/(pm)/alignment/useAlignmentState.ts
- src/pages/(pm)/alignment/useGeometryDraftWorkflow.ts
- src/pages/(pm)/alignment/useGeometryReadModel.ts
- src/pages/(pm)/alignment/useGeometrySubmission.ts
- src/pages/(pm)/alignment/usePavementWorkflow.ts
- src/pages/(pm)/alignment/useSegmentSetWorkflow.ts
- src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx
- src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx
- src/pages/(pm)/projects/CreateProjectModal.tsx
- tools/check-confirm-ui.cjs
- tools/check-geometry-submission.cjs
- tools/check-pavement-layout.cjs
- tools/check-roadguard-draft-state.cjs
- tools/check-segment-set.cjs
- tools/check-step2-projects.cjs
- tools/check-step3-geometry.cjs

## Kết quả kiểm định cuối trên Git index

| Kiểm tra | Kết quả |
|---|---|
| Geometry submission/review rounds | 14 PASS |
| Full Step3, không filter | 46 PASS |
| Draft-state/import/save/map | 46 PASS |
| Pavement/layout discovery | 20 nhóm PASS, gồm DRAFT + PUBLISHED có một layout vẫn giữ DRAFT; bản mới và response muộn cũng giữ lựa chọn |
| Segment set | 17 nhóm PASS |
| Confirm UI bindings | PASS |
| Alignment pavement helpers | 8 PASS |
| npm run build | PASS, gồm TypeScript và Vite; cảnh báo chunk lớn có sẵn |
| Staged diff-check | PASS |
| Step2 và draft-import suite mở rộng | Hai FAIL baseline nêu trên; không gọi toàn bộ suite xanh |

Source/test được chạy từ tree xuất bằng git write-tree + git archive, giữ nguyên index; không dùng source survey/AI review đang sửa local. Báo cáo này chỉ bổ sung bằng chứng, không sửa source sau kiểm. Raw log và tests.json giữ ở artifacts/step3-final-commit; các artifact không được gom vào commit để tránh đưa snapshot/backup ngoài phạm vi vào repo.
