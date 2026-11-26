# H4 — Offline H5, tuyến nhánh, hạn bảo hành, ẩn khe co giãn (2026-11-26)

FE: dev server `http://localhost:5180`; BE: stack `roadguard-v5` (API `https://localhost:18443/api/v1`). Kiểm bắt buộc: `tsc --noEmit -p tsconfig.json` sạch (không có `tsconfig.app.json` trong repo; lúc chạy cuối không còn lỗi), `npx vite build` OK. Script: `tools/e2e/h4-*.mjs`. Dữ liệu test: `TEST-DATA-LEDGER.md` mục "B13 · H4".

## Bảng trạng thái

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| FE-H5-01 bỏ ETag/If-Match khi revoke | ĐÃ SỬA + kiểm thật | `offlineCoordinationService.revoke` không GET trước, không gửi If-Match, nhận `idempotencyKey`. e2e: POST revoke `If-Match = null`, 201 |
| FE-H5-02 quyền thu hồi | ĐÃ SỬA + kiểm thật | PM chỉ thu hồi registration có `actorId == mình` và role `ProjectManager` (khớp BE `device.ActorId/RoleSnapshot`). Thiết bị Crew: không có form, có giải thích. Giám sát: không thu hồi thiết bị; thu hồi grant theo quyền |
| FE-H5-03 hiệu lực grant | ĐÃ SỬA + kiểm logic | `grantEffect`: Còn hạn / Hết hạn / Đã thu hồi / Thiếu thông tin; thiếu khóa `revokedAt` hoặc `expiresAt` hỏng → Thiếu thông tin (không suy "còn hiệu lực"). Thiết bị: chỉ Đã thu hồi / Chưa thu hồi / Thiếu thông tin (không áp hạn grant). Có ghi chú "không thay quyết định của máy chủ" |
| FE-H5-04 giữ identity khi mất phản hồi | ĐÃ SỬA + kiểm thật | Journal `sessionStorage` theo actor/dự án/tài nguyên (key + lý do/body + phase + receipt). Timeout/5xx → giữ key, nút "Đối soát" / "Gửi lại đúng yêu cầu". F5 không tự POST (e2e xác nhận). Gửi lại dùng cùng key+body (e2e xác nhận). Có receipt mà GET lỗi → "chưa đối soát xong", không tạo lệnh mới (e2e) |
| FE-H5-05 đọc lại sau cấp/thu hồi | ĐÃ SỬA (revoke kiểm thật; cấp grant kiểm logic) | Revoke: đối chiếu id phản hồi, GET lại phải thấy `revokedAt` (device còn đúng `actorId`). Cấp grant: `grantReadbackMismatch` đối chiếu id/project/package/recipient registration/tập originId phạm vi + hiệu lực hiện tại từ GET; toast thành công chỉ khi còn hạn |
| FE-H5-06 chống lẫn nguồn | ĐÃ SỬA + kiểm thật | ctx `epoch|actor|project|kind` + seq + AbortController; đổi project/tab/tài khoản bỏ response cũ, reset project khi đổi actor (trước đây giữ project cũ), `OfflineSupervisorActions` mount lại theo ctx. e2e: giữ response A chậm 4,5 s, đổi A→B: B không hiện thiết bị của A |
| FE-H5-07 chi tiết/recipient | ĐÃ SỬA + kiểm thật/logic | Chi tiết chỉ field nghiệp vụ theo whitelist (không ciphertext/manifest/signature/khóa/scopeJson; chỉ số lượng mục/người nhận). Recipient: actor+device khớp wrap, chưa thu hồi, rồi GET `devices/{id}` tính SHA-256 khóa mã hóa so với `recipientKeyFingerprint` của wrap; chỉ `match` mới chọn được, `mismatch`/`unverified` chỉ là ứng viên (disabled). Hàm fingerprint khớp cách BE (kiểm bằng node crypto) |
| Cấp quyền bàn giao (Giám sát) | ĐÃ CÓ SẴN (G4) + vá | Giữ form chọn gói/thiết bị/phạm vi từ GET; vá: fingerprint, journal, đối soát. **Chưa kiểm e2e POST grant: BLOCKED** (stack không có gói ngoại tuyến do Mobile tạo; không tạo giả). Kiểm được: khóa đúng lý do "Chưa có gói", nút khóa, tab gói/grant rỗng trung thực |
| Chuẩn bị gói ngoại tuyến | BLOCKED (thiếu nguồn Mobile) | POST `packages/prepare` cần gói đã mã hóa + manifest đã ký bằng khóa thiết bị nguồn; Web không tạo/ký, không có kênh cung cấp. Nút khóa, giải thích; không dữ liệu giả. Không đòi BE thêm endpoint |
| Tạo tuyến nhánh | BỊ CHẶN BỞI BE (guard giữ nguyên) | Xem mục riêng bên dưới |
| Hạn (a) "Hạn xử lý FIELD" | ĐÃ SỬA + kiểm thật | `max` = hết ngày bảo hành (SBX-B), thông báo rõ, nút lưu khóa. Chỉ kiểm khi chưa có giữ-lệnh (`heldCreate`) để không chặn đối soát |
| Hạn (b) "Hạn Chót Hoàn Thành" AssignCrew | ĐÃ SỬA, e2e CHƯA KIỂM | SBX-B không có hạng mục Normal ReadyToAssign; kiểm logic hàm dùng chung (`h4-deadline-logic.mjs`) |
| Hạn (c) CreateSurvey "Hạn hoàn thành nhiệm vụ" | ĐÃ SỬA + kiểm thật | Contract có `dueAt` (SurveyCreateInput). `max` + khóa nút "Lập kế hoạch" + thông báo. Bỏ trống vẫn hợp lệ |
| Hạn (d) "Chưa có thời hạn kế hoạch" | ĐÃ SỬA (bỏ nhãn) | Xem ghi chú dưới |
| Ẩn form Khe co/Khe giãn/Độ hở | ĐÃ SỬA + kiểm thật | Chuyển vào `<details>` "Chú thích & thông số khe…" mặc định thu gọn; state/handler/contract không đổi |

## File đã sửa (không có git; theo thứ tự)
- `src/api/services/offlineCoordinationService.ts` — revoke không ETag; `offlineError`, `isUnknownOutcome`, `grantEffect`, `deviceState`, `intentJournal`, `recipientKeyFingerprint`, `grantReadbackMismatch`; `detail(…, signal?)`; `recipients[].fingerprint`; `issue` trả thêm `body`. Chỉ thêm/mở rộng (chữ ký cũ tương thích).
- `src/pages/(pm)/OfflineCoordination.tsx` — viết lại logic (ctx/seq, quyền, hiệu lực, journal, whitelist chi tiết).
- `src/pages/(pm)/OfflineSupervisorActions.tsx` — fingerprint, journal cấp quyền, đối soát, ctx, text BLOCKED.
- `src/utils/warrantyDeadline.ts`, `src/hooks/useWarrantyWindow.ts` — MỚI (hạn theo bảo hành; đọc `work-package.warranties` PROJECT qua `readProjectServerFacts`).
- `src/pages/(pm)/field-tasks/MeasurementsTab.tsx` (hook, `max`, thông báo, disabled, chặn trong submit); `src/pages/(pm)/AssignCrew.tsx` (min/max, error/helperText, chặn submit); `src/pages/(pm)/create-survey/CreateSurveyForm.tsx` (max, thông báo, khóa nút).
- `src/pages/(pm)/repair-proposals/ProposalTableRow.tsx`, `ProposalDetailModal.tsx` — bỏ "N ngày"/"Chưa có thời hạn kế hoạch".
- `src/pages/(pm)/alignment/BranchServerStatus.tsx` — MỚI; gắn ở `AlignmentSegments.tsx` (dưới `RouteSystemsRead`); `AlignmentAddBranchModal.tsx` đổi nhãn "Lưu tuyến nhánh" → "Thêm nhánh xem trước (chưa lưu)" + phụ đề "chỉ cục bộ".
- `src/pages/(pm)/alignment/SidebarSlabsTab.tsx` — khối khe vào `<details data-testid="joint-params">`.
- Script: `tools/e2e/h4-offline.mjs`, `h4-offline-logic.mjs`, `h4-lib-crew.mjs`, `h4-deadline.mjs`, `h4-deadline-logic.mjs`, `h4-branch.mjs`, `h4-plan-column.mjs`, `h4-probe-geometry.mjs`, `h4-probe-branch.mjs`, `h4-probe-warranty.mjs`.

## API dùng
`GET /projects/{p}/offline/{devices|packages|grants}` (limit+cursor), `GET …/offline/{kind}/{id}`, `POST …/offline/devices/{id}/revoke`, `POST …/offline/grants/{id}/revoke`, `POST …/offline/grants`, `GET …/offline/packages/{id}`; `GET /projects/{p}/work-package` (warranties, roadSections), `GET …/road-sections/{s}/versions/{v}/geometry`, `GET …/road-geometry-submission`, `GET …/route-systems`, `GET …/crs-profiles`. Không đổi payload ghi nào ngoài contract.

## Tuyến nhánh — kết luận có căn cứ
Đã đọc guard BE (`GeometryWorkflowPersistenceService.cs`, `GeometryWorkflowController.cs`, `ROAD-GEOMETRY-SUBMISSION.md`, `GEOMETRY-DRAFT-READINESS.md`):
- Nhánh chỉ tạo bằng draft `sourceKind=NATIVE_ALIGNMENT`, `routeKind=BRANCH`, `parentRouteVersionId` (phải là bản **hiện hành** có `NativeRouteVersionFacts`: cùng `routeSystemId` và `crsProfileRevisionId`), `junctionOffsetMeters` trong [0, độ dài cha], điểm đầu nhánh trùng điểm nối trên cha (`branch_junction_mismatch`), chống chu trình. Tuyến legacy (COORDINATES) không làm cha.
- **Mỗi dự án chỉ có MỘT hồ sơ trình** (`SubmittedDrafts` = draft có `SubmittedAt != null`, lookup dùng `SingleOrDefault`; dòng 163-164, 204-205, 368-369). Sau khi tuyến chính đã trình/xác nhận, mọi draft mới (kể cả nhánh) trả `409 road_geometry_submission_locked`; trước khi có tuyến chính đã xác nhận thì không có tuyến cha hiện hành để nhánh bám. Khi chưa xác nhận tuyến chính cũng không có cha. Nghĩa là qua API hiện có, lập nhánh trên Web chưa thể hoàn tất (lưu → trình → xác nhận).
- Kiểm thật trên v5 (không có dự án "nghiệm thu 2"; dùng SBX-A/SBX-B làm dự án tương đương): tuyến cha `MOCK-A` (`d5609378…`) và `DEMO-A`: `metadataStatus` `COMPLETE`/`LEGACY_INCOMPLETE`, `routeKind/routeSystemId/crsProfileRevisionId = null`, `crsStatus = null`, `engineeringSrid 32648`; dự án chưa có hệ tuyến, chưa có hồ sơ CRS; `road-geometry-submission` = CONFIRMED. POST nhánh thử (dữ liệu guard, không ghi): **409 `road_geometry_submission_locked`** (correlation `f4f3d44f-e70e-4bf5-b73a-4a8c3143d703`, `97874a9a-9b85-4f67-80ac-2b697fc3580d`). Hồ sơ tuyến chính không bị đổi.
- FE đã làm: panel "Tuyến nhánh — trạng thái theo máy chủ" (đọc nhánh chính thức BRANCH + cha, trạng thái hồ sơ trình Đã trình/Từ chối/Đã xác nhận, danh sách tiền đề ✓/✗ kèm mã guard, kết luận BỊ CHẶN); nhánh vẽ cục bộ gắn nhãn "CHƯA LƯU", đổi tên nút để không bị hiểu đã lưu. Không mở khóa nút, không sửa tuyến chính/baseline/pin/CRS, không tạo native/CRS giả. Chưa có form nhập primitives native vì không thể hoàn tất end-to-end dưới guard hiện tại (không đánh PASS bằng preview).
- Bản nháp chưa trình không có API liệt kê, nên "Đã lưu nháp" chỉ hiện qua draft đang mở; panel nói rõ điều đó.

## Ghi chú hạn (d)
DTO có `PackagePlanning.plannedDueAt` (PM nhập ở khối Kế hoạch sau khi tạo gói), **không có** số ngày thi công. Đã bỏ "N ngày" và "Chưa có thời hạn kế hoạch"; cột hiển thị "Hạn kế hoạch dd/mm/yyyy" khi có, ngược lại "Chưa nhập hạn kế hoạch" (đúng nghĩa: thuộc tính tồn tại nhưng chưa nhập). Không đòi BE sửa. Không đổi `duration_days` mock cũ ở `repairService.ts` (không còn hiển thị trong màn này).

## Kết quả kiểm thật
- `h4-offline.mjs`: 21/21 PASS (đăng ký thiết bị qua API; PM thấy "của bạn"; PM không thu hồi thiết bị Crew; không If-Match; mất phản hồi (mô phỏng 504 bằng interception của trình duyệt, request chưa tới BE) → giữ key; F5 không tự POST; replay cùng key/body → 201 + readback `revokedAt`; GET lỗi sau ghi → đối soát, đúng 1 POST; đổi project A→B bỏ response chậm; Giám sát: Cấp quyền khóa "Chưa có gói", Prepare BLOCKED, không quyền thu hồi thiết bị).
  Lưu ý: mô phỏng timeout là interception phía trình duyệt, không phải mất phản hồi sau commit thật.
- `h4-offline-logic.mjs`: 9/9 PASS (hiệu lực grant, trạng thái thiết bị, fingerprint SHA-256 so với node crypto, readback). Đây là kiểm logic, không thay e2e grant.
- `h4-deadline.mjs`: PASS FIELD (max `2027-03-31T23:59`, 2039 bị chặn, ngày cuối hợp lệ, 00:00 ngày sau bị chặn) + CreateSurvey (max, 2035 bị chặn, bỏ trống OK). Nút "lưu" FIELD đang khóa cả vì chưa chọn Defect nên chưa chứng minh riêng; thông báo lỗi và chặn trong `handleCreateTask` đã có. AssignCrew e2e CHƯA KIỂM; `h4-deadline-logic.mjs` 5/5 PASS.
- `h4-branch.mjs`: 11/11 PASS (panel, tiền đề, 409 guard thật, tuyến chính còn CONFIRMED, khe co/giãn ẩn trong `<details>` rồi mở được). `h4-plan-column.mjs`: PASS.
- Giới hạn: khi dự án không có hồ sơ bảo hành đọc được (SBX-A, handover trống), hạn không bị chặn (chỉ hiện ghi chú "chưa thể kiểm hạn"; BE kiểm cuối). Đây là chủ đích: không suy diễn thời hạn bảo hành.

## Lỗi/quyết định cần BE
1. **Tuyến nhánh (đã có bằng chứng guard):** `POST /projects/{p}/road-geometry-drafts` (NATIVE_ALIGNMENT, BRANCH, cha là tuyến hiện hành) → 409 `road_geometry_submission_locked`; do mô hình "một hồ sơ trình/dự án" + cha phải đã xác nhận. Cần BE xác nhận nghiệp vụ: nhánh sau khi tuyến chính đã xác nhận có được phép không và theo luồng nào (cùng draftId? hồ sơ trình thứ hai?). FE giữ guard, không tự suy.
2. Dự án "nghiệm thu 2" không có trên stack v5; chưa kiểm được dữ liệu thật của dự án đó (SBX-A/B: cha legacy, không hệ tuyến/CRS).
3. Cấp quyền/Chuẩn bị gói ngoại tuyến chưa kiểm e2e: cần gói do Mobile tạo (`packages/export`) và kênh cung cấp gói+manifest đã ký cho prepare.
4. Quan sát: `POST /projects/{p}/warranties` thiếu `handoverDocumentId` vẫn trả 201 (đã tạo hồ sơ bảo hành SBX-B không gắn biên bản bàn giao) — nếu nghiệp vụ yêu cầu biên bản bàn giao thì đây là khoảng hở guard, chưa chốt là lỗi.
