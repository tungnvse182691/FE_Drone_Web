# Nhóm C — dự án / hình học / tim tuyến (PM-01..03, SUP-04, SUP-05) — căn chỉnh FE theo BE (2026-11-19)

Căn cứ BE: `docs/HoangHaiWarrantySystem-Official` (02_Business-Workflows/01–02, 05_Web matrices, 04_API-Contracts catalog) và `docs/contracts/openapi.json` (BE mới, 298 thao tác).

## Đã xóa (FE thừa — không có API BE đứng sau)
- `alignmentService`: toàn bộ trạng thái tim tuyến lưu `localStorage` (`roadguard_alignment_state_*`, `getAlignmentState/getAlignmentData/saveAlignmentData/submitAlignment/resetAlignment/syncWithGeometryPackage`), cache `get/set/clearActiveDraftInfo` không ai dùng, interface `AlignmentState`. Luồng trình/xác nhận tim tuyến chỉ còn qua BE (`road-geometry-drafts/.../submit|confirm|reject`, `road-geometry-submission`).
- `projectService`: `enrichProjectWithAlignment` (ghép tim tuyến/độ dài/trạng thái từ localStorage), `updateProjectAlignment` (sửa kho dự án cục bộ), `updateLifecycleStatus` (BE không có lệnh activate/suspend), `fetchProjectLifecycle` và `getProjectById` (không ai gọi), `calculateLineLengthKm`.
- `pages/(pm)/alignment/data.ts`: `PM_ASSIGNED_PROJECTS` (danh sách tĩnh rỗng) và mọi mặc định tim tuyến/đoạn/nhánh từ đó; re-export ở `AlignmentSegments.tsx`.
- `projects/ProjectLifecycleModal.tsx` (stub không dùng).
- `ProfilePage`: chuỗi cố định "Công ty TNHH Xây dựng Bê tông Hoàng Hải" (2 chỗ).

## Đã thêm/sửa theo BE
- Nhãn CRS ở đầu màn tim tuyến lấy từ `engineeringUtmSrid` của `GET /projects/overviews` (thêm `HubProject.engineering_utm_srid`), thay chuỗi cố định `EPSG:32648`; thiếu thì ghi "Chưa có CRS kỹ thuật từ máy chủ" (tài liệu 02_Project-Road-Geometry…, PM-02/PM-03).
- `ProfilePage`: "Đơn vị công tác" đọc `GET /users/{id}/organization` (null/403/lỗi hiển thị rõ), thay chuỗi cố định.
- Đối chiếu luồng hình học FE ↔ BE (PM-03/SUP-05): draft (POST/PUT/GET), preview, readiness, confirm, submit/reject + `road-geometry-submission`, segment-sets (preview/create/update/publish/GET), route-systems (GET/POST), crs-profiles (GET/POST), pavement-plans/layouts, road-sections + versions (Giám sát), `PUT /projects/{id}` (EditProjectModal), lifecycle (`operational-closures`, `renewed-handling-scope`), members, primary-project-manager, members/eligible: đều đã có service FE tương ứng; không thấy thao tác BE thiếu ở FE trong phạm vi nhóm C.

## Còn thiếu do BE
- Không có API cho kích hoạt/tạm dừng dự án (`lifecycle/{command}` chỉ declarations/confirmations/closures/transfers/recurrences) → FE không có nút tương ứng.
- `GET /projects` không có CRS/địa bàn/ngày; FE phải đọc thêm `overviews`/`work-package`.

## Chưa kiểm
- Không chạy trình duyệt/Docker theo ràng buộc; chỉ `tsc --noEmit` (nhóm C sạch) và `vite build`. Chưa kiểm lại bằng UI: nhãn CRS, thẻ đơn vị công tác ở hồ sơ.
- Lỗi tsc ngoài phạm vi (nhóm khác đang sửa): `DroneMissionAIReview`/`drone-review`, `surveyService`, `(sup)/dashboard`, `OfflineConflicts`, `(sup)/system-control/SystemControlModals` (thiếu `CreateDeletionRequestModal`).
- `sessionStorage` `roadguard_project_store` (cache danh sách dự án đọc từ BE cho `getProjects()` đồng bộ) vẫn giữ vì nhiều màn dùng; không phải nguồn dữ liệu độc lập.
