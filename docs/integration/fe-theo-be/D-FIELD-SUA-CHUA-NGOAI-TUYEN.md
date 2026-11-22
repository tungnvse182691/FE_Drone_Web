# Nhóm D — FIELD, sửa chữa, nghiệm thu, Fast Track, ngoại tuyến (FE theo BE) — 2026-11-19

Căn cứ: `docs/HoangHaiWarrantySystem-Official/05_Web` (PM-08, PM-09, PM-10, PM-13, SUP-07, SUP-08), `04_API-Contracts/02_Full-API-Catalog.md` (API-113..130, 139..152), openapi mới trong `docs/contracts/openapi.json`.

## 1. Đã xóa (FE thừa — không có API BE đứng sau)
| Mục | Lý do |
|---|---|
| Màn xung đột ngoại tuyến `OfflineConflicts.tsx`, `conflictService.ts`, `field-tasks/ConflictsTab.tsx`, `ConflictResolveModal.tsx`, `field-tasks/conflicts/*` (6 file) | BE không có API xung đột ngoại tuyến (không có trong 298 thao tác); toàn bộ là FE tự dựng |
| Nút/modal "Đóng đợt thi công (đóng vụ việc)", `VerifyModal.tsx`, `closeCompositeCase`, `publishCitizenResult`, `getRecords`/`approveAcceptance`/`rejectAcceptance` (luôn ném "chưa nối máy chủ") | BE không có API đóng gói/vụ việc, biên bản nghiệm thu; công bố là `POST /cases/{id}/publications` ở luồng Case |
| Ba nút Giám sát "Yêu cầu bổ sung ảnh / xem xét lại / từ chối" + `DecisionModal.tsx` + `handleSubmitDecisionModal` (chỉ hiện toast "chưa có API") | BE Giám sát chỉ có `POST …/items/{id}/approve` (API-142), `final-confirmation` (API-147), `corrections` (API-145) |
| `ProposalDispatchModal.tsx`, chọn đội trong bảng duyệt, `handleCrewChange/handleConfirmDispatch` | Giao việc là PM: `POST …/items/{id}/assign` (API-143) ở màn Phân công (`/pm/repair-batches/assign`) |
| `BatchRejection.tsx` + route `/sup/approvals/:id/reject` | Trang giả: báo "đã gửi" mà không gọi BE, kèm văn bản mẫu cố định. Route chuyển về `/sup/proposals` |

## 2. Đã thêm / sửa theo BE
| Việc | Căn cứ |
|---|---|
| **Màn "Điều phối ngoại tuyến"** (`OfflineCoordination.tsx`, `offlineCoordinationService.ts`), route `/pm/offline` và `/sup/offline`; `/…/conflicts`, `/…/conflict-center` chuyển hướng sang đó; menu đổi tên; `?tab=CONFLICTS` của FieldTasks chuyển sang route mới | PM-13; API-114..130. Danh sách `GET …/offline/devices\|packages\|grants` (limit+cursor), chi tiết devices/grants/packages (ETag) |
| Thu hồi thiết bị (PM) `POST …/offline/devices/{id}/revoke` và thu hồi cấp quyền (Giám sát) `POST …/offline/grants/{id}/revoke`, body `{reason}`, `Idempotency-Key` + `If-Match` = ETag của chi tiết | API-118 (PM, Crew), grant revoke (Supervisor) trong catalog |
| `closeFastTrackItem`: gọi `POST …/final-confirmation` (PM xác nhận cuối Fast Track) thay vì ném lỗi | `final-confirmation`: "Normal: Supervisor; FT: PM" (API-147); `08_FastTrack` |
| "Xuất hồ sơ" gói trong màn duyệt gói (trước chỉ hiện toast giả) → `POST /projects/{p}/exports` DOSSIER `repairPackageIds:[gói]`, poll, tải; hạng mục: đã làm ở lượt trước | `WEB-PM-SUPERVISOR-COMPLETION.md` mục 12 |
| Nút "Giao việc cho đội thi công" ở màn duyệt (PM) điều hướng tới màn Phân công thật | API-143 |

## 3. Còn thiếu do BE
- Không có API xung đột ngoại tuyến cho web; không có API đóng vụ việc/biên bản nghiệm thu; Giám sát không có API "từ chối/yêu cầu bổ sung" từng hạng mục.
- Tạo cấp quyền (`POST …/offline/grants`, `packages/prepare`) cần tải mật mã/gói ký (Giám sát) — không làm trên web; `sync/import/export/snapshots/starts-reconcile/devices register` thuộc app (ký/mật mã).
- Chi tiết thiết bị/gói/cấp quyền trả schema không định kiểu (`res ''` trong OpenAPI) nên web chỉ hiển thị trường đơn giản.

## 4. Chưa kiểm
- Chưa chạy trình duyệt/BE (ràng buộc của nhóm). `tsc` và `vite build` đạt cho các file nhóm D; lỗi `tsc` của nhóm khác (drone-review, system-control `CreateDeletionRequestModal`) nằm ngoài phạm vi.
- Màn `/pm/offline`: chưa thử với dữ liệu thật (DB thử chưa có thiết bị/gói/cấp quyền). Chưa rà đối chiếu từng lệnh FIELD/Repair còn lại (assign/reassign/cancel/reviews/evidence-reuse/location-impact, policy, road-coverage, eligibility, notification-supervisor) — các luồng này đã nối và kiểm ở lượt trước, không thay đổi ở lượt này.
- Còn sót `isCaseClosed` (luôn false) và nhãn "ĐÃ ĐÓNG GÓI" trong `CloseoutHeader` — vô hại, chưa xóa.
