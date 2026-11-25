# G4 — Đề xuất / phê duyệt / giao việc / an toàn tạm thời / chuyển nghĩa vụ / bàn giao / ngoại tuyến (2026-11-24)

Môi trường: BE `roadguard-v4` (API `https://localhost:18443`), Vite `http://localhost:5180`. Chỉ sửa FE. Test: `tools/e2e/g4-*.mjs` (+ `g4-batch.sh`). `npx tsc --noEmit -p .` sạch, `npx vite build` sạch (sau khi G4 sửa xong). Dữ liệu test ghi ở `TEST-DATA-LEDGER.md` mục "B12 G4".

## Trạng thái từng mục

| # | Nội dung | Trạng thái |
|---|---|---|
| 1 | FIELD loại đo 1–6 | DONE (BE hết lỗi); UI tạo FIELD chỉ kiểm được danh sách 6 loại, tạo thật bằng API |
| 2 | Panel nguồn Defect trong form đề xuất | DONE |
| 3 | Khối "Xử lý ngoại lệ và hiệu chỉnh" | DONE (nhánh hiệu chỉnh thành công chưa chạy được: không có hạng mục có quyết định hiệu lực) |
| 4 | Phản hồi sau phê duyệt Normal | DONE |
| 5 | Assign: nguồn Defect + toast ngắn | DONE |
| 6 | TemporarySafety + HUY-BUG-002 | DONE |
| 7 | Thông báo 409 thân thiện | DONE (không có link gói vì API không nêu gói) |
| 8 | H14 Giám sát yêu cầu sửa/từ chối | PARTIAL: BE chưa có API, FE hiển thị giới hạn |
| 9 | Chuyển nghĩa vụ + KHOA-TR03 | DONE phần hiển thị; phần đọc planning sau chuyển là lỗi/quyết định BE |
| 10 | HUY-BUG-005 bàn giao | DONE nhánh create; nhánh attach chưa chạy được (không có hồ sơ thiếu tệp để thử) |
| 11 | HUY-BUG-003 | Chỉ kiểm: xem mục 11 |
| 12 | Điều phối ngoại tuyến Supervisor | PARTIAL: Cấp quyền DONE về FE nhưng BLOCKED thử thật (cần gói do Mobile); Chuẩn bị gói BLOCKED |

## 1. FIELD loại đo 1–6
- FE: `src/api/services/fieldMeasurementTypes.ts` khớp doc BE (1 DepressionDepth, 2 SlabFaultingHeight, 3 ShoulderErosionExtent, 4 Area m², 5 DepressionLength, 6 DepressionWidth); không đổi.
- UI: form "Tạo nhiệm vụ" liệt kê đủ 6 loại (g4-field.mjs ui: PASS).
- Tạo thật (API-created phiên PM-A, `g4-field.mjs api`): REPORTER loại 1,2,3,4,5,6 đều POST 201 và GET đọc lại đúng `requiredMeasurementType`; SURVEY (surveyId thật từ `GET /datasets/{id}`) loại 5, 6, 1 đều 201. Không còn 500 (trigger đã nhận 5/6). Ghi chú: REPORTER trên Defect nguồn AI trả 409 `source_not_ready` (guard nguồn, không phải lỗi loại đo; correlationId ví dụ `14748bae-9530-4974-b020-8eadc1b1f1f4`).
- Giới hạn: tạo FIELD qua UI cần reference KEEP_NEW của đúng phiên trình duyệt (sessionStorage) nên không chạy được trên Defect seed; không ép.

## 2. Panel nguồn Defect (`ProposalSourcePanel.tsx`, gắn vào `CreateProposalModal.tsx`)
Audit GET hiện có trước khi làm:
- `GET /projects/{p}/defects/{id}`: id, projectId, roadSectionVersionId, segmentId, defectTypeCode, causeCategoryCode, severity, status, geometry{srid,wkt}, version. Không có lý trình/độ lệch của Defect.
- `GET /projects/{p}/work-package`: tên/mã tuyến theo currentVersionId.
- `GET /projects/{p}/field-inspection-tasks` (+ `/{task}`, `/history`, `/submissions/{id}`): mode, status, requiredMeasurementType, measurementScope, bản nộp (measurements type/value/unit/state, readiness), sự kiện lịch sử (kết quả review).
- `GET …/items/{item}/source-defect` chỉ có sau khi đã có hạng mục nên không dùng ở form đề xuất.
Hiển thị: Defect (mã/loại/trạng thái/mức độ), vị trí Defect (tuyến, phân đoạn, hình học; lý trình/độ lệch của Defect = "Chưa có dữ liệu"), khối riêng "Phạm vi PM đề xuất" (đọc từ ô form, "Chưa nhập" nếu trống), FIELD (nhiệm vụ, loại đo, bản nộp, giá trị KNOWN, kết quả duyệt). Lỗi tải hiển thị lý do + "Thử lại"; đổi Defect/dự án remount (key) + seq token bỏ phản hồi muộn; không suy luận, không ghi đè phạm vi PM.
Test `g4-proposal.mjs panel`: 11/11 PASS.

## 3. Xử lý ngoại lệ và hiệu chỉnh (`RepairItemActions.tsx`)
Đổi tên, mặc định thu gọn (nút Mở rộng/Thu gọn); hiện riêng trạng thái/kết quả/quyết định hiệu lực/số quyết định từ BE (GET item + history, có Thử lại); "Kết quả sau hiệu chỉnh" mặc định "Chọn kết quả"; khóa kèm lý do theo contract (Normal do Giám sát, Fast Track do PM; cần quyết định hiệu lực; hạng mục hủy; lỗi đọc); hộp xác nhận (hạng mục, kết quả cũ→mới, căn cứ, lý do); sau thành công đọc lại item + history rồi toast. Test `g4-flow.mjs exceptions`: 7/7 PASS (PM với Normal bị khóa kèm giải thích). Chưa chạy nhánh gửi hiệu chỉnh thật (cần quyết định hiệu lực, seed chưa có).

## 4 + 8. Phê duyệt Normal và H14 (`ProposalDetailModal.tsx`)
Toast (kho toast hiện có, không icon mới) chỉ sau khi POST thành công và GET đọc lại khớp; modal giữ mở; nút khóa "Đang gửi…" khi gửi; hạng mục đã duyệt không còn trong form, hiển thị dòng chỉ đọc "kết quả BE"; nếu đã ghi nhưng đọc lại lỗi: thông báo "cần đối chiếu, không gửi lệnh mới" (journal giữ receipt). H14: hợp đồng chỉ có `approve` (Giám sát) và `review-requests` (PM/Crew), `corrections` là hiệu chỉnh quyết định đã có, không phải từ chối; FE hiện dòng giới hạn, không dùng correction thay thế. Test `g4-flow.mjs approve`: 9/9 PASS.

## 5. Giao việc (`AssignCrew.tsx`, `repairService.ts`, `MeasurementsTab.tsx`)
Nguồn khuyết tật dựng bằng `fastTrackFormSources.derive` (source-defect + dataset.surveyId + khớp locationVersion): một nhánh → ô chỉ đọc, nhiều nhánh → select, không có/lỗi → thông báo và khóa nút; bỏ mặc định REPORTER và ô nhập surveyId. Gửi dùng bộ pin khớp nguồn. Thành công chỉ khi đọc lại (hạng mục sang trạng thái giao + task tồn tại); toast "Đã giao ITEM-… cho <tên Crew>.", thẻ kết quả có "Xem nhiệm vụ" (highlight đúng task), Chi tiết chứa mã đầy đủ + nút sao chép; ghi nhận nhưng đọc lại lỗi → trạng thái "chờ đối chiếu" + nút "Đối chiếu lại", chặn gửi lại cùng hạng mục. Luồng Fast Track (journal đối soát) không đổi. Test `g4-flow.mjs assign`: 10/10 PASS (nguồn Survey 4752e823).

## 6. TemporarySafety (`repairSafetyService.ts`, `RepairSafetyPanel.tsx`)
Dropdown chỉ từ `GET …/temporary-safety-obligations`; POST bổ sung nghĩa vụ dùng ETag/packageVersion làm If-Match, pin lấy từ formalScope + binding, kiểm phạm vi chứa trong formal và 3 chữ số thập phân; safety-measures dùng `itemVersion` của GET; đổi hạng mục xóa lựa chọn; Crew chỉ đọc theo binding (task.assignedToUserId); rỗng/lỗi/thiếu binding giải thích và khóa; đọc lại sau lưu; Idempotency-Key giữ cho retry cùng body. Test `g4-flow.mjs safety` 5/5 và `safety-add` 11/11 PASS (POST obligation 201, GET đọc lại, giao biện pháp 201, nghĩa vụ đã dùng biến khỏi collection). Sau chuyển A→B: PM-B GET collection dưới URL B trả 200.

## 7. Thông báo 409
`exportError` (`projectExportService.ts`) đổi `active_scope_conflict` thành "Phạm vi đề xuất xung đột với hạng mục đang hoạt động. Vui lòng kiểm tra gói hiện có." (kèm correlationId). ProblemDetails thật chỉ có code/title/status/correlationId, không nêu gói → không link. Test `g4-flow.mjs conflict`: PASS.

## 9. Chuyển nghĩa vụ + KHOA-TR03
`ObligationTransferPanel.tsx`: dropdown "PKG-… · DEF-…(loại) · FormalRepair · tuyến lý trình" (ghép lifecycle + quét gói/hạng mục + source-defect), bước "Xem lại chi tiết trước khi gửi" (gói, hạng mục, Defect loại/trạng thái/mức độ, loại nghĩa vụ, dự án nhận) trước khi gửi/tiếp nhận. Nghĩa vụ TemporarySafety đã dùng không truy ngược được gói/Defect qua API → hiện "chưa đọc được", không bịa. Test `g4-misc.mjs transfer` 6/6 PASS; phát hành 201 và tiếp nhận 201 làm thật.
`PlanningPanel.tsx`: khi GET planning lỗi hiện "Không đọc được kế hoạch — không phải 'chưa nhập kế hoạch'", phân biệt dự án gốc (projectId của hạng mục) và dự án chịu trách nhiệm hiện hành (URL), nút Thử lại; không đổi projectId, không dữ liệu thay thế. Test UI `planning-ui` 4/4 PASS (dùng chặn đường riêng yêu cầu planning để dựng 404 vì danh sách gói của PM-B không liệt kê gói nhận chuyển; không phải dữ liệu thật).

## 10. Bàn giao (`handoverUploadService.ts`, `HandoverAttachCard.tsx`)
Thêm `GET /projects/{p}/handover-documents` (Giám sát). Phân biệt: có nguồn HANDOVER có tệp → ẩn thẻ; kiểm kê rỗng → "chưa có bản ghi" → tạo mới (documentNo + handoverDate); có hồ sơ canAttachFile → chọn hồ sơ rõ ràng (không tự lấy đầu tiên) → attach `{fileId, handoverDocumentId}` không gửi documentNo/date; có hồ sơ nhưng không gắn được → khối "blocked" nêu cần BE (không đổi provenance/REAL_SOURCE); If-Match là ETag tổng hợp từ road-coverage sau upload VERIFIED; đọc lại road-coverage sau gắn; lỗi kiểm kê → khóa + Thử lại. Test `g4-misc.mjs handover` 7/7 PASS cho nhánh tạo mới (SBX-B). Nhánh attach chưa thử thật: không thể tạo hồ sơ thiếu tệp bằng API cho phép.

## 11. HUY-BUG-003 (chỉ kiểm)
- Web gửi đơn vị Area là `m²` (`useFastTrackPolicy.ts`, validate `fastTrackPolicyRules.ts`, nhãn `fieldMeasurementTypes.ts`); không đổi sang m2. Mobile chỉ khác nhãn hiển thị; chưa có payload Mobile để đối chiếu.
- Danh mục loại lỗi: FE đọc `GET /catalog/defect-types` (`defectTypeCatalog.ts`), không có mã giả; BE hiện trả đúng 2 mã `CRACK`, `POTHOLE` (đọc ngày 2026-11-24).

## 12. Điều phối ngoại tuyến (`OfflineSupervisorActions.tsx`, `offlineCoordinationService.ts`, `OfflineCoordination.tsx`)
Chỉ Giám sát thấy hai khối (PM không thấy; test `offline-pm` PASS).
- Cấp quyền bàn giao: `POST …/offline/grants`. Gói từ `GET offline/packages`, manifest + người nhận mã hóa từ `GET offline/packages/{id}`, thiết bị nhận từ `GET offline/devices` (còn hiệu lực và là người nhận trong gói), phạm vi lấy nguyên từ manifest đã ký (khớp validator BE), lý do nhập; thiếu nguồn/lỗi → giải thích + khóa; xác nhận → POST → đọc lại chi tiết grant + làm mới danh sách + toast. Seed hiện không có gói/thiết bị (do Mobile tạo) nên chỉ kiểm được trạng thái khóa (`g4-misc.mjs offline` 5/5 PASS): BLOCKED, không tạo dữ liệu giả.
- Chuẩn bị gói: `POST …/packages/prepare` cần gói đã mã hóa + manifest ký bằng khóa thiết bị nguồn (chỉ Mobile tạo được) và API không có nguồn GET để Web chọn → khối hiển thị BLOCKED kèm giải thích, nút khóa. Không thêm tạo khóa/ký/sync/nhập-xuất gói.

## Cần BE quyết định / lỗi BE
1. KHOA-TR03 (đã tái hiện): sau chuyển A→B, PM-B (`pm-b`, URL dự án B) `GET /api/v1/projects/72f84201-c001-4000-8000-000000000002/repair-packages/1a76a722-f08f-4373-be76-867309aec1bb/planning` → 404 `not_found`, correlationId `9b9d458b-ab8e-4990-a9ce-90f9798a149c` (lần 2: `8ad775e1-ad63-44a6-b99f-32a3b0a53e4a`). Cùng 404 `not_found` với `GET …/items/70060978-319f-409e-915e-ae0c5da420e9/planning` và `GET …/items/70060978-…/source-defect` dưới URL B, trong khi `GET …/items`, `GET …/items/{id}` và `GET …/temporary-safety-obligations` trả 200. Cần BE xác nhận nguồn đọc planning/source-defect cho PM dự án nhận (FE không đoán).
2. `GET /projects/B/repair-packages` của PM-B không liệt kê gói nhận chuyển (chỉ có gói riêng của B), nên PM-B không mở được gói qua màn danh sách; lối vào là lifecycle.responsibilities (đã có ở màn Fast Track).
3. H14: chưa có API cho Giám sát yêu cầu sửa/từ chối đề xuất Normal đang `AwaitingApproval` (chỉ `approve`); cũng chưa có đường PM chỉnh và trình lại.
4. `POST /repair-packages` 409 `active_scope_conflict` không kèm định danh gói xung đột → FE không dẫn link được.
5. Ngoại tuyến: `POST offline/packages/prepare` cần dữ liệu ký của Mobile, không có GET nguồn; `POST offline/grants` cần gói/thiết bị do Mobile tạo (seed trống) → chưa nghiệm thu được trên Web.
6. Nghĩa vụ TemporarySafety đã dùng không truy ngược được gói/Defect bằng API hiện có (collection chỉ liệt kê nghĩa vụ chưa dùng) → màn chuyển nghĩa vụ không hiển thị được gói/Defect cho loại này.
7. Handover: nhánh attach chưa có dữ liệu thử (inventory chỉ có hồ sơ đã gắn tệp); cần BE/seed có hồ sơ thiếu tệp để nghiệm thu.

## File thay đổi
- Service: `repairSafetyService.ts`, `repairService.ts`, `projectExportService.ts` (exportError), `handoverUploadService.ts`, `offlineCoordinationService.ts`.
- UI: `repair-proposals/{RepairSafetyPanel,RepairItemActions,ProposalDetailModal,ObligationTransferPanel,PlanningPanel,CreateProposalModal}.tsx`, `repair-proposals/ProposalSourcePanel.tsx` (mới), `AssignCrew.tsx`, `field-tasks/MeasurementsTab.tsx` (khớp task.id highlight), `fast-track/HandoverAttachCard.tsx`, `OfflineCoordination.tsx`, `OfflineSupervisorActions.tsx` (mới).
- Test: `tools/e2e/g4-{probe,probe2,proposal,flow,field,misc}.mjs`, `g4-batch.sh`.
