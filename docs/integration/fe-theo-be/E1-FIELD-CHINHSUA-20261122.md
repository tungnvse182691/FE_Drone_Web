# E1 — Cụm FIELD theo Chinhsua.docx (2026-11-22)

Hợp đồng BE dùng: `deploy/fe-handoff/ASSIGN-RETENTION-FIELD.md` mục 4 (BE develop `c0c99ca`). Kiểm bằng `npx tsc --noEmit -p .` (sạch), `npx vite build` (đạt) và `tools/e2e/e1-field.mjs` (6/6 phần không cần dữ liệu, chạy trên BE v3).

## Trạng thái từng mục
| Mục | Kết quả | Kiểm |
|---|---|---|
| D — bỏ ô "Phương pháp & Thiết bị đo" | **Đã sửa**. Form chỉ còn "Ghi chú chỉ dẫn" (lưu vào `instructions`), `measurementScope` luôn `"{}"`. Nhiệm vụ cũ: `instructions` và `measurementScope` đã lưu vẫn hiển thị nguyên (khối hồ sơ in `instructions`; scope khác `{}` được in là "Phạm vi đo (lưu trong nhiệm vụ)"). Journal tạo FIELD cũ đang chờ vẫn dùng body đã lưu | e2e: form không còn ô, còn "Ghi chú chỉ dẫn" |
| E — loại đo 1–6 | **Đã sửa**. Bảng cố định `src/api/services/fieldMeasurementTypes.ts` (1 DepressionDepth, 2 SlabFaultingHeight, 3 ShoulderErosionExtent, 4 Area, 5 DepressionLength, 6 DepressionWidth; đơn vị theo handoff). Select trong form lấy từ bảng; guard 1..6 ở `fieldCreateCommands.ts` và `fieldTaskService.ts` | e2e: select có đủ 6 nhãn. **Chưa kiểm** POST 201 + GET đọc lại mã 5/6 (xem bên dưới) |
| F — thông báo validation | **Đã sửa**. Thêm `FieldInputError`. Modal phân loại 3 nguồn lỗi: "Thông tin nhập chưa hợp lệ" (kèm danh sách trường thiếu/sai), "Máy chủ từ chối yêu cầu" (HTTP + `code` + `detail`), "Đối chiếu dữ liệu trước khi gửi chưa đạt" (FE kiểm nguồn). Nhãn "Lỗi từ máy chủ CSDL" đã bỏ | e2e: modal không còn nhãn cũ |
| G — giao lại Crew khác | **Đã sửa** (`FieldTaskReadDetails.tsx`): loại `assignedToUserId` hiện tại khỏi danh sách; không còn Crew nào khác thì hiện cảnh báo và khóa chọn Crew + nút xác nhận; lịch sử Crew cũ giữ nguyên | **Chưa kiểm** với dữ liệu thật |
| H — nút tái sử dụng ảnh nguồn | **Đã sửa**: hiện cả khi trạng thái `SUPPLEMENT_REQUIRED` (ở danh sách và ở footer chi tiết); BE vẫn là nơi quyết điều kiện cuối (`invalid_state_transition`…) | **Chưa kiểm** với dữ liệu thật |
| I — hợp nhất khối chi tiết | **Đã sửa**. `FieldTaskReadDetails` giữ hồ sơ, lịch sử, phiên bản/hash bản nộp, review, giao lại/hủy; không còn bảng số đo và ảnh riêng. Dữ liệu GET được báo lên bằng `onLoaded`, khối dưới (`FieldSubmissionBlock.tsx`) hiển thị: ảnh bằng chứng của bản nộp mới nhất (GET evidence + checksum), bảng loại đo/giá trị/đơn vị/KNOWN-UNKNOWN, READY/INCOMPLETE và lý do thiếu. Placeholder "Đang chờ Crew…" chỉ còn khi thật sự chưa có bản nộp | **Chưa kiểm** với dữ liệu thật |
| J — phân biệt trạng thái | **Đã sửa**. Khối "Tiến độ dữ liệu" tách 6 dòng: loại đo yêu cầu / bản nộp / giá trị đo (có/`value: null`) / readiness / FIELD hoàn tất / Defect (đọc `GET defects/{id}`, ghi rõ độc lập). Nhãn "ĐÃ CÓ SỐ ĐO" đổi thành "ĐÃ NỘP · CHỜ THẨM ĐỊNH" (danh sách, chi tiết, lightbox); thẻ KPI "Đã có số đo" → "Đã nộp bản đo"; tab "Đã có số đo" → "Đã nộp"; "Đã xác minh" → "FIELD hoàn tất". Cột "Số đo thực tế" không còn in `undefined mm` | Một phần e2e (không có dữ liệu để thấy nhãn) |
| K — nhãn "Loại đo yêu cầu" | **Đã sửa**: cột danh sách "Loại Đo Yêu Cầu" và mục chi tiết "Loại đo yêu cầu". Nguyên nhân gốc: `fieldTaskService.getTasks` ghi đè `measurement_type` bằng `measurementScope.method` cũ; nay luôn lấy từ `requiredMeasurementType` | e2e: tiêu đề cột |

## File đã đổi
- Mới: `src/api/services/fieldMeasurementTypes.ts`, `src/pages/(pm)/field-tasks/FieldSubmissionBlock.tsx`, `tools/e2e/e1-field.mjs`.
- Sửa: `src/api/services/fieldCreateCommands.ts`, `src/api/services/fieldTaskService.ts`, `src/pages/(pm)/field-tasks/{MeasurementsTab,FieldTaskReadDetails,FieldTasksHeader}.tsx`.
- Modal chi tiết thêm `max-h-[92vh] overflow-y-auto` để khối hợp nhất cuộn được.

## Chưa kiểm được và lý do
BE v3 vừa seed lại hoàn toàn: chưa có Defect, FIELD, bản nộp. Tạo Defect nguồn Report cần chuỗi Case → Giám sát triage → PM KEEP_NEW trong **cùng phiên trình duyệt** (FE giữ tham chiếu KEEP_NEW trong `sessionStorage`), và ứng viên AI chỉ đọc được bằng Bearer (`GET ai-candidates/{id}`); `GET /projects/{p}/candidates` cần tham số nguồn. Chưa dựng được chuỗi này trong lượt này. Các mục E (POST 5/6 và đọc lại), G, H, I, J cần dữ liệu thật; mã đã build và có kiểm tra cấu trúc, **không** ghi là đạt nghiệm thu. Bản nộp của Crew cần Bearer `/auth/android/login` (mobile) nên chưa tạo.

## Lưu ý ngoài phạm vi (cụm khác)
- `FastTrackDispatchModal.tsx` dòng 157 chỉ có nhãn cho loại đo 1–4 (`{1:'Độ sâu lún (mm)',…,4:…}`); loại 5–6 sẽ hiện trống. Nên dùng `measurementTypeLabel` từ `fieldMeasurementTypes.ts`.
- `fieldTaskService.createTask` là mã chết (không nơi nào gọi); đã nới guard 1..6 và bỏ `method` khỏi scope cho nhất quán.
- Không có lỗi BE mới phát hiện trong lượt này.
