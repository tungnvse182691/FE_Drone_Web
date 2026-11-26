# FE theo BE — tổng hợp (2026-11-19)

Nguyên tắc (theo yêu cầu): **tuân theo BE**. BE có gì làm đúng logic đó; không tạo tính năng FE không có API BE đứng sau; FE thừa thì xóa; thiếu so với BE thì thêm/sửa. Căn cứ nghiệp vụ: `RoadGuardSystem-develop_NewBE/docs/HoangHaiWarrantySystem-Official` (nhất là `05_Web`, `02_Business-Workflows`, `04_API-Contracts`) và `docs/RoadGuard-Backend-Official`. Hợp đồng: `docs/contracts/openapi.json` (298 thao tác).

Chi tiết từng nhóm: `A-BAO-CAO-THONG-BAO-LUU-TRU.md`, `B-KHAO-SAT-AI-CASE.md`, `C-DU-AN-HINH-HOC.md`, `D-FIELD-SUA-CHUA-NGOAI-TUYEN.md` (cùng thư mục).

## 1. Kết quả kiểm
| Hạng mục | Kết quả |
|---|---|
| `tsc --noEmit`, `vite build` | Đạt |
| Quét trình duyệt 44 route PM/Giám sát trên BE mới | Tất cả mở được, không lỗi console; chỉ còn 401 của `GET /ai-candidates/{id}` (BE) và 404 có `code` của `road-geometry-submission` (BE) |
| Mọi lời gọi API trong mã FE (288 lời gọi, 175 duy nhất) so với hợp đồng BE | Không có route nào không tồn tại trong BE (4 mẫu động đã đối chiếu) |
| Lệnh ghi thật chạy lại sau đợt này | **Chưa** (chỉ đọc/duyệt màn). Các lệnh ghi đã kiểm ở đợt trước: tạo dự án kèm biên bản, bổ sung biên bản, kế hoạch gói/hạng mục, địa bàn, danh mục loại hư hỏng |

## 2. Đã xóa (FE thừa — không có API BE)
- **Chung:** toàn bộ middleware `/__dev/*` và mật khẩu SA cứng trong `vite.config.ts`.
- **Dự án/hình học (C):** trạng thái tim tuyến trong `localStorage`, `enrichProjectWithAlignment`, `updateProjectAlignment`, `updateLifecycleStatus` (BE không có kích hoạt/tạm dừng), danh sách dự án tĩnh `PM_ASSIGNED_PROJECTS`, chuỗi công ty cố định ở hồ sơ.
- **Khảo sát/AI (B):** 11 hàm luôn ném lỗi trong `surveyService` (mô phỏng bay, yêu cầu bay bổ sung, khóa baseline kiểu cũ, lưu bbox, mở lại quyết định…), nút/modal tương ứng, `MissionModals`, số `coverage=100`/`blindspot=false` tự bịa, `validationService` cùng nút Xuất CSV/Chạy kiểm định mới.
- **Hiện trường/sửa chữa/ngoại tuyến (D):** màn xung đột ngoại tuyến (BE không có API xung đột) và `conflictService`; nút "Đóng đợt thi công" và các hàm luôn ném lỗi (`closeCompositeCase`, `publishCitizenResult`, `approveAcceptance`, `rejectAcceptance`…); 3 nút Giám sát "bổ sung ảnh / xem xét lại / từ chối" từng hạng mục (BE chỉ có approve, final-confirmation, corrections); `ProposalDispatchModal`; trang `BatchRejection` giả.
- **Báo cáo/lưu trữ (A):** bộ lọc kỳ/khu vực, xuất RPT-01, bản đồ/bảng rủi ro ở dashboard Giám sát; nhật ký hoạt động viết lại bằng `reports/timeline` (bỏ lọc vai trò/ảnh trước-sau/xuất tệp); luồng "yêu cầu xóa dữ liệu" và tab "Mô hình AI"; tab loại thông báo, EMERGENCY, cấu hình âm thanh, thẻ SLA tự dựng.

## 3. Đã thêm / sửa theo BE
- **Điều phối ngoại tuyến (PM-13)** `/pm/offline`, `/sup/offline`: danh sách + chi tiết thiết bị/gói/cấp quyền, thu hồi (PM: thiết bị; Giám sát: cấp quyền) kèm `If-Match`/`Idempotency-Key`. Route `conflicts` cũ chuyển hướng.
- **Duyệt/Từ chối phát hiện AI** ghi qua `POST /candidate-decisions` (KEEP_NEW, REJECT) với `sourceVersion/geometryVersion` đọc ngay trước khi ghi.
- **Fast Track:** đóng hạng mục gọi `final-confirmation`; danh mục chính sách từ `GET /repair-policies`.
- **Xuất hồ sơ** theo hạng mục (nghiệm thu) và theo gói (duyệt gói): DOSSIER `repairItemIds/repairPackageIds`.
- **Dashboard Giám sát:** chỉ thẻ có API (số dự án, chiều dài, sắp hết hạn, lỗi mở) từ `projects/overviews`; không cộng thiếu khi `INCOMPLETE`.
- **Hồ sơ cá nhân:** đơn vị công tác — Giám sát đọc `/users/{id}/organization`, PM đọc từ `member-contacts` (PM nhận 403 ở route kia); nhãn CRS màn tim tuyến từ `engineeringUtmSrid`.
- Các mục đã làm ở đợt trước (biên bản bắt buộc khi tạo dự án, bổ sung biên bản, video Range, thông báo đọc theo lô, tên người được giao, khiếm khuyết gốc, kế hoạch gói/hạng mục, địa bàn, danh mục loại hư hỏng, xem trước lời mời…): xem `../NGHIEM-THU-THEO-LUONG.md` mục 8.

## 4. Còn do BE (gửi BE)
1. `GET /projects/{p}/ai-candidates/{id}` chỉ Bearer (cookie 401) → không đọc được trạng thái duyệt từng phát hiện.
2. Không có API xung đột ngoại tuyến cho web; chi tiết thiết bị/gói/cấp quyền trả schema không định kiểu.
3. Không có API: kích hoạt/tạm dừng dự án; đóng vụ việc/biên bản nghiệm thu; từ chối/yêu cầu bổ sung từng hạng mục; lưu bbox; mở lại quyết định ứng viên; liệt kê lệnh phong tỏa pháp lý (FE phải nhớ mã lệnh trong `sessionStorage`); dashboard rủi ro/khu vực/kỳ; nhật ký kiểm toán riêng; tiến độ/hủy export job; liệt kê mẫu để chạy kiểm định.
4. `GET /projects` không có CRS/địa bàn/ngày; danh sách khảo sát không có `surveyType`.
5. Seed demo hỏng (thiếu bước submit hình học), video mẫu 1.510 byte.

## 5. Chưa kiểm / rủi ro
- Chưa chạy lại các lệnh ghi sau đợt xóa/sửa này (duyệt/từ chối phát hiện, thu hồi thiết bị/cấp quyền, giao lệnh Fast Track, xuất hồ sơ theo gói/hạng mục, đóng hạng mục Fast Track).
- Màn `/pm/offline` mới chỉ kiểm hiển thị (DB thử chưa có thiết bị/gói/cấp quyền).
- Hai màn ResearchValidation và Thông báo còn vài state/nhãn cũ nhóm A/B chưa dọn hết (vô hại, ghi trong nhật ký nhóm).
- Không có git trong repo: không có commit; để hoàn tác dùng bản sao lưu cấu hình vite ở scratchpad hoặc sao lưu thư mục.

## Cập nhật 19/11/2026
Đã sửa mục 5.7–5.8 của bàn giao: làm mới bảng đề xuất sau lưu và giữ phản hồi khi duyệt AI; bbox chỉ đọc. Xem `../NGHIEM-THU-THEO-LUONG.md` mục 9 để biết phạm vi đã kiểm.
- Fast Track: đã xác minh `409 source_not_ready` của lệnh `assign` (correlation ID `8b13ce7b-b974-469e-a145-4828db326157`): FE gửi `surveyTaskId`, BE yêu cầu `Surveys.Id`. FE không còn dùng ID suy từ AI run. Cần BE chỉ rõ/bổ sung đường đọc nguồn cho Web khi chưa có FIELD để nghiệm thu case AI. Chưa giao việc hoặc xác nhận cuối. Chi tiết: `../FASTTRACK-LIVE-20261119.md`.
