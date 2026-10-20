# Worklog: WEB-GOM-FIX-20261020 — Gom sửa 3 nhóm lỗi text hiển thị còn sót

- **Thời gian thực hiện:** 20/10/2026
- **Nhánh làm việc:** `tung`
- **Mục tiêu:** Sửa dứt điểm 3 nhóm text còn sót từ các đợt Việt hóa trước:
  1. 1 nhãn trạng thái dịch sai nghĩa (`IN_PROGRESS` thành "Đang thực hiện").
  2. Text "Fast Track" $\rightarrow$ "xử lý nhanh" (text hiển thị, tooltip, toast).
  3. Việt hóa chức danh phi công trong ngoặc ở mock data và form lựa chọn.

---

## I. CÁC NỘI DUNG ĐÃ SỬA

### Mục 1: Nhãn trạng thái đo đạc
- **File:** `src/pages/(pm)/field-tasks/MeasurementsTab.tsx` (dòng 375)
  - `Đang chờ thực hiện` $\rightarrow$ `Đang thực hiện` (cho trạng thái `task.status === 'IN_PROGRESS'`).

### Mục 2: Chuẩn hóa text "Fast Track" $\rightarrow$ "xử lý nhanh"
- **File:** `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx`:
  - `Đặc cách duyệt Fast Track (v1.8)` $\rightarrow$ `Đặc cách duyệt xử lý nhanh (v1.8)`
  - `Từ chối Fast Track (Chuyển duyệt đợt v2.2)` $\rightarrow$ `Từ chối xử lý nhanh (Chuyển duyệt đợt v2.2)`
- **File:** `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx`:
  - `Đặc cách cho phép tự sửa Fast Track theo chính sách v1.8` $\rightarrow$ `Đặc cách cho phép tự sửa xử lý nhanh theo chính sách v1.8`
  - `Đặc cách duyệt Fast Track` $\rightarrow$ `Đặc cách duyệt xử lý nhanh`
  - `Bác bỏ đề xuất Fast Track, chuyển sang diện lập hồ sơ đợt sửa theo chính sách v2.2` $\rightarrow$ `Bác bỏ đề xuất xử lý nhanh, chuyển sang diện lập hồ sơ đợt sửa theo chính sách v2.2`
  - `Từ chối Fast Track (Chuyển duyệt đợt)` $\rightarrow$ `Từ chối xử lý nhanh (Chuyển duyệt đợt)`
  - `Chỉ huy trưởng (PM) có thẩm quyền phân giải chính sách Fast Track.` $\rightarrow$ `Chỉ huy trưởng (PM) có thẩm quyền phân giải chính sách xử lý nhanh.`
- **File:** `src/pages/(sup)/EvidenceCloseoutDetail.tsx`:
  - `PM đã chấp thuận và đóng lỗi Fast Track ${currentItem.item_code} (BR-25)!` $\rightarrow$ `PM đã chấp thuận và đóng lỗi xử lý nhanh ${currentItem.item_code} (BR-25)!`
  - `Có lỗi khi đóng lỗi Fast Track.` $\rightarrow$ `Có lỗi khi đóng lỗi xử lý nhanh.`

### Mục 3: Việt hóa chức danh phi công trong ngoặc
- **File:** `src/api/services/surveyService.ts`:
  - `Hoàng Quốc Bảo (Pilot RTK Level 3)` $\rightarrow$ `Hoàng Quốc Bảo (Phi công RTK cấp 3)` (2 vị trí)
  - `Lê Hoàng Long (Drone Operator)` $\rightarrow$ `Lê Hoàng Long (Phi công thiết bị bay)` (1 vị trí)
  - `Trần Quang Khải (Pilot RTK)` $\rightarrow$ `Trần Quang Khải (Phi công RTK)` (2 vị trí)
  - Giữ nguyên `Lê Hoàng Long (Đội bay Hoàng Hải 01)` đã là tiếng Việt.
- **File:** `src/pages/(pm)/create-survey/CreateSurveyForm.tsx`:
  - `Chỉ Định Phi Công (Drone Operator)` $\rightarrow$ `Chỉ định phi công thiết bị bay`
- **File:** `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx`:
  - `Lê Hoàng Long (Drone Operator chính - Sẵn sàng)` $\rightarrow$ `Lê Hoàng Long (Phi công thiết bị bay chính - Sẵn sàng)`
  - `Hoàng Quốc Bảo (Pilot RTK Level 3)` $\rightarrow$ `Hoàng Quốc Bảo (Phi công RTK cấp 3)`
  - `Trần Quang Khải (Pilot Chuyên gia đo quét)` $\rightarrow$ `Trần Quang Khải (Phi công chuyên gia đo quét)`
  - Giữ nguyên toàn bộ giá trị thuộc tính `value` của các thẻ `<option>`.

---

## II. DANH SÁCH FILE ĐÃ THAY ĐỔI
1. `src/pages/(pm)/field-tasks/MeasurementsTab.tsx`
2. `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx`
3. `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx`
4. `src/pages/(sup)/EvidenceCloseoutDetail.tsx`
5. `src/api/services/surveyService.ts`
6. `src/pages/(pm)/create-survey/CreateSurveyForm.tsx`
7. `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx`
8. `docs/worklogs/WEB-GOM-FIX-20261020.md` (Tạo mới)

---

## III. KẾT QUẢ KIỂM TRA (VERIFY)
- **Kiểm tra từ khóa:** Không còn chuỗi text hiển thị nào chứa `Fast Track`, `Pilot RTK`, `Drone Operator`, `Đang chờ thực hiện` trong 7 file trên.
- **Biên dịch TypeScript:**
  - Lệnh chạy: `npx tsc -b`
  - Kết quả: **0 lỗi** (Exit code: `0`).
- **Logic & Ranh giới:**
  - Không thay đổi bất kỳ biến, enum, identifier code nào (`isFastTrack`, `pilot_name`, `AvailablePilot`...).
  - Không sửa thuộc tính `value` của `<option>`.
  - Không ảnh hưởng luồng nghiệp vụ hay logic bản đồ.
