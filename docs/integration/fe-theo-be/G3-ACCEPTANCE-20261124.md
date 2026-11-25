# G3 — Nghiệm thu repair (danh sách + chi tiết) — 2026-11-24

Phạm vi: màn Nghiệm thu PM/Giám sát (`AcceptanceList`, `EvidenceCloseoutDetail` + `evidence-closeout/*`), service `acceptanceService`, nhãn trạng thái task FIELD, modal tái sử dụng ảnh. FE-only.

## Nguồn dữ liệu BE đã truy vết (GET)
- `GET items` / `items/{id}/history`: state (RepairItemState), `attempts[]` (crewId, startedAt, finishedAt, serverReceivedAt, timeProvenance). `attempts[].evidence` luôn rỗng, ảnh phải đọc từ bản nộp.
- `GET field-inspection-tasks/{task}`: `status` (Submitted / SupplementRequired…), `latestSubmissionId`. `repairContext` = null với PM.
- `GET …/submissions/{id}`: measurements, evidence (BEFORE/AFTER/MEASUREMENT), `readiness`, `missingReasons`, `revision`, `serverReceivedAt`.
- Ảnh: `GET …/evidence/{fileId}` + `/content` (cookie); ảnh nguồn Case qua `source-defect.evidence[].contentPath`.
- Tên Crew: `GET projects/{p}/members` (displayName); ID để trong mục chi tiết.
- K ≥ 0.98, bảo hành 12 tháng, hạn, đơn vị bảo hành, "EXIF hợp lệ", "ĐẠT": KHÔNG có nguồn BE (eligibility.warrantySources rỗng, readiness luôn `INCOMPLETE` + `AFTER_ATTEMPT_BINDING_UNAVAILABLE` với REPAIR_CLAIM). Đã xóa hằng số mẫu, thay bằng "Chưa có dữ liệu".

## Từng mục
| # | Nội dung | Kết quả |
|---|---|---|
| 1 | Ảnh trước/sau (đang tải / chưa có / lỗi + thử lại), badge wrap, bỏ khẳng định tích cực, tên Crew, mốc kết thúc thi công vs nộp, danh sách có dự án/gói/hạng mục/bước chờ, thu gọn khung biên bản | DONE |
| 2 | Hộp thoại PM ACCEPT: tên "Chấp nhận hồ sơ và trình Giám sát", bằng chứng thật, bỏ mẫu/cam kết tích sẵn, `reason` = ghi chú PM, toast theo BE đọc lại | DONE (DTO review chỉ có fieldSubmissionId/decision/reason: không gửi riêng ID bằng chứng) |
| 3 | Form yêu cầu bổ sung trống, nhãn PM/SUPPLEMENT, giữ "lý do khác" | DONE |
| 4 | "Lần thi công #n" (attempts BE) và "Bản nộp #r" (revision) tách riêng; nút theo state + head; stale → tải lại; "Cần bổ sung hồ sơ" khác "YÊU CẦU SỬA LẠI" (chỉ CorrectionRequired) | DONE. Lý do SUPPLEMENT: PM không đọc lại được (xem BE) |
| 5 | Giám sát "Chấp thuận nghiệm thu" khóa + lý do; lỗi BE hiện status/code/hướng dẫn/correlationId | DONE |
| 6 | HUY-BUG-001 Fast Track: ACCEPT (nếu Submitted) → đọc lại → final; Reviewed thì chỉ final; lỗi giữa chừng nêu bước đã xong + nút đối soát | CODE DONE; e2e **BLOCKED** (xem dưới) |
| 7 | Toast z-[10000] trên modal; lỗi trong modal; thành công "Đã xác nhận tái sử dụng ảnh" + chỉ đọc + nút Đóng; GUID/checksum/receipt trong `<details>`; mở lại hiện kết quả đã lưu | PARTIAL: render hoàn tất, KHÔNG kiểm thử e2e được (không tạo được trạng thái reuse); mở lại chỉ khôi phục được trong phiên (journal sessionStorage), BE không có GET quyết định reuse |
| 8 | Task `Cancelled`/`Rejected` hiện "ĐÃ HỦY"/"ĐÃ TỪ CHỐI"; RepairItemState đủ 9 giá trị có nhãn (`acceptanceLabels.ts`) | DONE |

## File thay đổi
- `src/api/services/acceptanceService.ts` (viết lại: dữ liệu thật, head fresh, review/final, FT tuần tự, lỗi stale/step)
- `src/pages/(sup)/EvidenceCloseoutDetail.tsx`, `AcceptanceList.tsx`
- `src/pages/(sup)/evidence-closeout/`: `acceptanceLabels.ts`, `EvidencePhoto.tsx`, `PackageThumbs.tsx` (mới); `types.ts`, `ActionButtons.tsx`, `StatusBar.tsx`, `CloseoutHeader.tsx`, `CloseoutModals.tsx`, `DeclareConstructionModal.tsx`, `ReworkModal.tsx`, `BeforeViewer.tsx`, `AfterViewer.tsx`, `ComparisonViewer.tsx`, `TechnicalCriteriaCard.tsx`
- `src/pages/(pm)/field-tasks/MeasurementsTab.tsx`, `ReuseSavedResult.tsx` (mới), `FieldTasks.tsx` (z-index toast)
- `src/api/services/fieldTaskService.ts`, `src/types/domain.ts` (CANCELLED/REJECTED)
- Giám sát: nút "Yêu cầu sửa lại" bị khóa có giải thích (review SUPPLEMENT chỉ PM; sửa lại sau quyết định là hiệu chỉnh ở Đề xuất sửa chữa).

## Kiểm thử
`tools/e2e/g3-acceptance.mjs` (stage read|supplement|accept|final|ft), `tools/e2e/g3-seed.mjs` (tạo trạng thái bằng API).
Trạng thái Crew là **API-created** (Crew giả lập Mobile qua Bearer): nhận việc, bắt đầu, assessment, execution-start/finish, upload 2 ảnh PNG thật, submissions, attempts, supplements.
- read: 88 kiểm tra, 86 PASS lần đầu; 2 FAIL là lỗi test (chữ in hoa bằng CSS), đã sửa regex.
- supplement: payload SUPPLEMENT + reason PM + bản nộp #2, 1 lần gửi, F5 giữ "Cần bổ sung hồ sơ": PASS; 1 FAIL là test đọc toast sau khi toast tắt (đã sửa chờ toast).
- accept: payload ACCEPT + reason PM, BE Reviewed, F5 đúng: PASS; 2 FAIL tương tự (toast timing; bản nộp bổ sung chỉ có AFTER nên không có BEFORE) — script đã chỉnh.
- final: 11/11 PASS (final-confirmation 1 lần, reason nhập, BE Confirmed, F5).
- ft: **BLOCKED**. Fast Track B (item `49e58d7f`, ReadyToAssign): API assign trả 409 `published_policy_source_required` (correlationId `bef60b22-b32b-4eed-90c1-69d38c0694dc`) vì chưa có chính sách + độ phủ đã xuất bản; không tạo trạng thái giả. Logic ACCEPT→đọc lại→final và nhánh Reviewed (không review trùng) chỉ được kiểm bằng đọc code/tsc, chưa chạy e2e (`g3-acceptance.mjs ft` sẵn sàng khi có hạng mục FT đã nộp).
- Hạng mục dùng: Project A, item `c3158f95` (Normal) đã đi hết luồng tới Confirmed (không hoàn tác).

## Cần BE quyết định / lỗi BE
1. PM/Giám sát không đọc lại được review SUPPLEMENT (decision, reason, thời điểm): `GET field-inspection-tasks/{id}` trả `repairContext: null` cho PM, `items/{id}/history` không có reviews. FE chỉ suy ra "Cần bổ sung" từ `task.status = SupplementRequired`; lý do chỉ Crew đọc được (API-080). Cần endpoint/trường đọc cho PM.
2. `history.attempts[].evidence` luôn `[]` dù bản nộp có ảnh (đọc từ submission).
3. Lỗi repair trả title chung "Repair request failed"; FE dựa `code` (vd `invalid_state_transition` 409). Gửi final-confirmation khi item chưa Reviewed → 409 `invalid_state_transition`.
4. Không có nguồn BE cho ngưỡng K, độ phẳng, bảo hành/đơn vị bảo hành, kết quả toàn vẹn ảnh/EXIF của hạng mục; `readiness` luôn INCOMPLETE với REPAIR_CLAIM (AFTER_ATTEMPT_BINDING_UNAVAILABLE) dù PM ACCEPT được.
5. Không có GET đọc quyết định tái sử dụng ảnh (evidence-reuse) sau reload cho PM; chỉ có receipt trong POST.
6. Fast Track assign: 409 `published_policy_source_required` khi chưa có chính sách/độ phủ (đúng guard BE, không phải lỗi).
