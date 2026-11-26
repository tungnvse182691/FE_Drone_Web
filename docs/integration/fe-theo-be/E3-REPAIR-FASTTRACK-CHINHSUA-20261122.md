# E3 — Gói sửa chữa + Fast Track theo Chinhsua.docx và BE mới (2026-11-22)

BE kiểm thử: `RoadGuardSystem-develop (1)` (stack `roadguard-v3`, API https://localhost:18443). Vite http://localhost:5180. Kịch bản: `tools/e2e/e3-repair.mjs` (giai đoạn `normal`, `list`) và `tools/e2e/e3-ft.mjs` (`policy`, `coverage`, `dispatch`, `survey-setup`, `survey-package`, `transfer`, `transfer-view`). `npx tsc --noEmit -p .` sạch.

## Tóm tắt kết quả
| Mục | Nội dung | Kết quả |
|---|---|---|
| 1 | Modal chi tiết gói đọc phương án + checklist từ GET chi tiết hạng mục; lỗi tải hiện riêng | **Đạt** |
| 2 | Nút "Giao việc" (danh sách + modal) → màn giao Normal có chọn sẵn | **Đạt** (giao thật: POST assign 201, hạng mục `Assigned`) |
| 3 | Bố cục modal: khối thao tác xếp dọc, không tràn khung | **Đạt** (đo: 0 phần tử tràn ngang) |
| 4 | Tách "quyết định phê duyệt" khỏi tiến độ thi công | **Đạt** |
| 5 | Gộp hai ô phương án thành một ô "Phương án kỹ thuật sửa chữa" | **Đạt** (Normal và Fast Track; đọc lại `repairPlan` khớp) |
| 6 | Fast Track nguồn Reporter và Survey không cần nhiệm vụ FIELD | **Đạt cả hai nhánh** (POST assign 201) |
| 7 | Fast Track sau chuyển nghĩa vụ | **FE xong; giao bị BE chặn** (xem mục 7 và lỗi BE #2) |
| 8 | Chính sách Fast Track tự đóng bảng sau khi công bố | **Đạt** |

## 1. Modal chi tiết gói — đọc từ GET chi tiết hạng mục
- `src/pages/(pm)/repair-proposals/ProposalDetailModal.tsx`: sau khi đọc danh sách hạng mục, gọi `repairWorkflowService.detail()` cho từng hạng mục; hiển thị `repairPlan` và `checklistVersion`. Lỗi tải được báo **riêng từng hạng mục** ("Không đọc được chi tiết hạng mục…") và trạng thái "Đang đọc chi tiết…"; không còn câu "API đọc chưa trả phương án/checklist". Khối "Phương án kỹ thuật sửa chữa (PM đề xuất)" lấy từ chi tiết hạng mục.
- Bằng chứng: modal của Giám sát hiện đúng phương án seed của BE và `Checklist: v1`.

## 2. Nối bước PM giao Crew (Normal)
- `ProposalTableRow.tsx`: PM thấy nút "Giao việc" khi gói có hạng mục Normal đã duyệt (`ReadyToAssign`), điều hướng `/pm/repair-batches/assign?projectId=&packageId=`.
- `ProposalDetailModal.tsx`: nút "Giao việc" trên từng hạng mục `ReadyToAssign`, kèm `itemId`.
- `AssignCrew.tsx`: đọc `projectId/packageId/itemId` từ URL (`useSearchParams`) và chọn sẵn hạng mục (một lần); nếu hạng mục không còn chờ giao hoặc gói có nhiều hạng mục thì hiện ghi chú rõ.
- Bằng chứng e2e: Giám sát duyệt (POST approve 201 → `ReadyToAssign`), PM bấm "Giao việc" ở danh sách và ở modal, màn giao chọn sẵn `ITEM-3AA8AA98`, POST assign 201, GET: `Assigned`.

## 3. Bố cục modal
- Các khối "Phê duyệt Normal", "Thao tác hạng mục", kế hoạch, khiếm khuyết gốc, an toàn, thông báo Giám sát chuyển từ footer ngang sang **thân modal xếp dọc** (cuộn trong khung); footer chỉ còn "Người lập" và "Đóng". Mọi chức năng và quyền được giữ.
- Đo trên trình duyệt: `scrollWidth = clientWidth`, 0 phần tử vượt mép khung.

## 4. Nhãn tiến độ
- `ProposalTable.tsx`: cột "Quyết định phê duyệt" (tooltip: không phải tiến độ thi công). `ProposalTableRow.tsx`: "x/y đã duyệt" kèm dòng "Chưa giao Crew — chưa thi công" / "Đã giao Crew — thi công/nghiệm thu đang theo dõi" / "Nghĩa vụ đã được giải quyết"; thanh không còn tô xanh "hoàn thành" ở 100%.
- Modal: "Đã có quyết định phê duyệt: x/y hạng mục · chưa phản ánh tiến độ thi công/nghiệm thu".

## 5. Một ô phương án
- `ProposalBOQCard.tsx`: bỏ ô "Phương án kỹ thuật xử lý" dưới khiếm khuyết. `CreateProposalModal.tsx`: giữ **một** ô "Phương án kỹ thuật sửa chữa" (cho Normal và Fast Track; cùng một `formTechnicalMethod` → `repairPlan`).
- Bằng chứng: form có đúng 1 ô nhập phương án; tạo gói Fast Track qua UI (POST repair-packages 201 + items 201); GET chi tiết hạng mục: `repairPlan` = nội dung đã nhập.

## 6. Fast Track nguồn Reporter / Survey (không cần FIELD giả)
- `fastTrackFormSources.ts` (thêm `derive`, `resolve`, `readDefect`, `surveyIdForDetection`): dựng nguồn theo hợp đồng assign của BE:
  - nguồn gốc từ `GET …/items/{item}/source-defect` (`sources[].kind`): Report → `REPORTER` (`surveyId:null`); phát hiện AI → `SURVEY` với `surveyId` thật = `GET /datasets/{datasetId}.surveyId` (dataset lấy từ `ai-mock-runs[].datasetId` của lượt có phát hiện đó);
  - bộ pin (`segmentSetId`, layout, slab, CRS) chỉ nhận khi `"h4-frame-v1:" + SHA-256(JSON {routeVersionId, segmentSetId, layoutRevisionId, slabId, crsProfileRevisionId})` **trùng `locationVersion` của nghĩa vụ** trong `GET /road-coverage` (cùng công thức `SourceHash` của BE) — không bịa pin;
  - `requiredMeasurementType` do PM chọn 1–6 (dùng chung `fieldMeasurementTypes.ts` của E1), gửi **số**.
- `fastTrackService.executeDispatch`: dùng `resolve` cho nguồn dựng; giữ nguyên toàn bộ guard cho nguồn là nhiệm vụ FIELD đã xác thực.
- `FastTrackDispatchModal.tsx`: ô "Hồ sơ nguồn của khiếm khuyết" gồm nhiệm vụ FIELD (nếu có) **và** nguồn dựng; ô "Loại đo yêu cầu" chọn được khi nguồn là nguồn dựng; hiện lý do cụ thể nếu không dựng được nguồn.
- Bằng chứng e2e (BE mới, dữ liệu mới):
  - **REPORTER** (Project B, PM-b): chính sách POTHOLE v1 → độ phủ → ô nguồn "Phản ánh người dân đã được PM ghi nhận (KEEP_NEW)" → POST assign **201** → hạng mục `Assigned` → GET task: `sourceKind=REPORTER`, `mode=CONDITIONAL_FT`, `requiredMeasurementType` đúng loại chọn.
  - **SURVEY** (Project A, PM-a): KEEP_NEW phát hiện AI → tạo gói qua form một ô → chính sách CRACK v1 → độ phủ → ô nguồn "Đợt khảo sát Drone 6d2e9619 (phát hiện AI f8ec53f3)" → POST assign **201** → GET task: `sourceKind=SURVEY`, `mode=CONDITIONAL_FT`.
  - Ghi chú: một lượt giao Fast Track khác ở Project A (khiếm khuyết CRACK nguồn Report do agent khác tạo) cũng giao thành công nhánh REPORTER.

## 7. Fast Track sau chuyển nghĩa vụ
- `repairWorkflowService.ts`: thêm `responsibilities()` / `transferredIn()` (đọc `GET /projects/{p}/lifecycle` → `responsibilities[]` có `packageId`, `currentRepairItemId`); `validate/items/detail/packages` chấp nhận bản ghi mang `projectId` GỐC **chỉ khi** lifecycle xác nhận trách nhiệm hiện tại của đúng nghĩa vụ/gói thuộc dự án đang xem. `workflowCollection.ts` (file dùng chung, sửa tối thiểu): thêm tham số tùy chọn `allowedProjectIds` (mặc định rỗng — hành vi cũ giữ nguyên).
- `fastTrackService.getDefects`: liệt kê hạng mục nhận chuyển từ lifecycle (thẻ "· FT · nhận chuyển"); `executeDispatch` dùng URL dự án nhận, ETag của GET item dưới dự án nhận, đọc khiếm khuyết/Crew/chính sách theo dự án gốc, và nêu rõ khi không đọc được. `types.ts`: thêm `DefectItem.originProjectId`.
- Bằng chứng (đã chuyển nghĩa vụ `81a6cb99…` A → B bằng API Giám sát, **không hoàn tác**): lifecycle B trả `packageId` + `currentRepairItemId`; GET item dưới URL B = 200 (giữ `projectId` A); collection gói dưới B có trả gói nhận chuyển mang `projectId` A (FE trước đây báo "Danh sách sai phạm vi dự án" → đã sửa); màn Fast Track của PM-B hiện hạng mục nhận chuyển, không lỗi.
- **Giới hạn do BE (không phải FE):** PM-B không đọc được dữ liệu dự án gốc: `GET …/source-defect` dưới B → 404; `GET /projects/{B|A}/defects/{id}` → 404/403; `GET /projects/A/repair-policies` → 403; `GET /projects/A/members` → 403. Vì vậy PM-B không có đường đọc `defectVersion`, `routeVersionId`, `policyRevisionId`, Crew của A để dựng body assign. Modal hiển thị rõ: "Không đọc được khiếm khuyết gốc (… HTTP 404 …; dự án nguồn: HTTP 403 access_forbidden)", "Chưa đọc được Crew của dự án gốc (HTTP 403)", "Danh mục chính sách … HTTP 403". Khớp phần "Giới hạn còn cần quyết định nghiệp vụ" trong `ASSIGN-RETENTION-FIELD.md` mục 1. Không bypass guard.

## 8. Chính sách Fast Track tự đóng
- `useFastTrackPolicy.ts` `handleApplyPolicy`: sau khi xuất bản thành công và đã GET đối chiếu bản `PUBLISHED`, gọi `setIsPolicyModalOpen(false)`.
- Bằng chứng: POST drafts 201 + publish 201, bảng nhập (ô "Phiên bản checklist") không còn trong DOM; GET: số revision 0 → 1.

## Lỗi/thiếu phía BE phát hiện (để gửi BE)
1. **HTTP 500 khi giao Fast Track (hoặc tạo task) với `requiredMeasurementType` 5 hoặc 6.** `POST /projects/{p}/repair-packages/{pkg}/items/{item}/assign` với `requiredMeasurementType: 5` → 500 `An unexpected internal server error occurred`; log API: `SqlException 51133 "FIELD task source or geometry scope is invalid."` tại `RepairWorkflowRepository.Producing.cs:596`. Nguyên nhân: trigger SQL `TR_FieldInspectionTasks_H3Scope` (migration `20261009043010_AllowVerifiedDefectPostRepairTasks.cs`, dòng 32) vẫn có điều kiện `i.[RequiredMeasurementType] NOT IN (1,2,3,4)`; không migration nào về sau định nghĩa lại trigger. Trái với handoff mục 4 (mã 1–6). Cùng loại đo 1 thì assign 201. Nhiều khả năng ảnh hưởng cả `POST /field-inspection-tasks` với mã 5/6.
2. **PM dự án nhận không có đường đọc dữ liệu cần để assign sau chuyển nghĩa vụ**: defect (`defects/{id}` 404, `source-defect` dưới B 404), chính sách và thành viên của dự án gốc (403). Handoff nói B tiếp tục assign với "bộ reference đã bàn giao" nhưng không có API Web cấp bộ reference đó; cần BE chốt (ví dụ trả `defectVersion`, `routeVersionId`, `policyRevisionIds`, Crew hợp lệ trong lifecycle `responsibilities[]`/source-defect dưới dự án nhận).
3. `GET /projects/{p}/ai-candidates/{id}` vẫn 401 với cookie Web (đã biết; FE có đường lùi).

## Dữ liệu test đã tạo (ghi vào ledger)
- Project A: gói Normal `595c604b` (hạng mục `3aa8aa98`): Giám sát duyệt → PM giao (`Assigned`). Quyết định AI `c37332f8…` KEEP_NEW → defect CRACK `6eac374c` → gói Fast Track (nguồn SURVEY) đã giao. Gói Fast Track cho defect CRACK `e263b223` (nguồn Report, do agent khác tạo) đã giao. Chính sách CRACK v1 (A). Gắn biên bản bàn giao `TEST-FE-BB-E3` (A, B). Độ phủ xác nhận (TEST_ONLY): A hai phạm vi 5–6 m, B một phạm vi 1–2 m.
- Project B: chính sách POTHOLE v1; hạng mục Fast Track `179251b5` (nguồn Report) đã giao.
- **Không hoàn tác:** nghĩa vụ `81a6cb99-c6e4-49a0-b50a-2be31b1526f1` (defect `9a6f1083`, gói `7b635f43`, hạng mục `da6b635d`) đã chuyển A → B; hạng mục đó hiện thuộc B, `ReadyToAssign`, PM-B chưa giao được (lỗi BE #2).

## File đã sửa (E3)
`src/pages/(pm)/repair-proposals/{ProposalDetailModal,ProposalTable,ProposalTableRow,ProposalBOQCard,CreateProposalModal}.tsx`, `src/pages/(pm)/AssignCrew.tsx`, `src/pages/(pm)/fast-track/{FastTrackDispatchModal.tsx,useFastTrackPolicy.ts,types.ts}`, `src/api/services/{fastTrackFormSources,fastTrackService,repairWorkflowService,workflowCollection}.ts`, `tools/e2e/{lib.mjs (apiSend, PROJECT_B), e3-repair.mjs, e3-ft.mjs, fixtures/test-handover.pdf}`.
