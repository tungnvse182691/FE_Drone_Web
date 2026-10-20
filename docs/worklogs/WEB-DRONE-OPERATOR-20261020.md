# Worklog: WEB-DRONE-OPERATOR-20261020 — Quét bổ sung Việt hóa cụm "Drone Operator" / "Pilot"

- **Thời gian thực hiện:** 20/10/2026
- **Nhánh làm việc:** `tung`
- **Mục tiêu:** Việt hóa toàn bộ các chuỗi text hiển thị còn sót cụm "Drone Operator" và "Pilot..." ở 3 file giao diện chỉ huy trưởng (PM).

---

## I. CÁC CHUỖI ĐÃ SỬA THEO TỪNG FILE

### 1. `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx`
- `Chỉ định Drone Operator (Phi công điều khiển):` $\rightarrow$ `Chỉ định phi công thiết bị bay:`
- `Ghi chú cụ thể cho Drone Operator:` $\rightarrow$ `Ghi chú cụ thể cho phi công thiết bị bay:`
- *Thuộc tính `value` của `<option>`:* Giữ nguyên 100%.

### 2. `src/pages/(pm)/create-survey/CreateSurveyHeader.tsx`
- **Tiêu đề:** `Tạo Yêu Cầu Bay Khảo Sát Drone` $\rightarrow$ `Tạo Yêu Cầu Bay Khảo Sát Trên Không`
- **Mô tả:** `Lập kế hoạch hành lang bay trắc địa và chuyển tiếp lệnh bay tới ứng dụng di động của Drone Operator` $\rightarrow$ `Lập kế hoạch hành lang bay trắc địa và chuyển tiếp lệnh bay tới ứng dụng di động của phi công thiết bị bay`

### 3. `src/pages/(pm)/drone-review/MissionModals.tsx`
- **State mặc định (dòng 47):** `'Lê Hoàng Long (Drone Operator chính)'` $\rightarrow$ `'Lê Hoàng Long (Phi công thiết bị bay chính)'`
- **Nhãn (dòng 218):** `3. Chỉ định Drone Operator / Phi công điều khiển (Quy tắc BR-43):` $\rightarrow$ `3. Chỉ định phi công thiết bị bay (Quy tắc BR-43):`
- **Option 1 (dòng 225):**
  - `value`: `"Lê Hoàng Long (Drone Operator chính)"` $\rightarrow$ `"Lê Hoàng Long (Phi công thiết bị bay chính)"`
  - `text`: `Lê Hoàng Long (Drone Operator chính - Sẵn sàng)` $\rightarrow$ `Lê Hoàng Long (Phi công thiết bị bay chính - Sẵn sàng)`
- **Option 2 (dòng 226):**
  - `value` & `text`: `"Hoàng Quốc Bảo (Pilot RTK Level 3)"` $\rightarrow$ `"Hoàng Quốc Bảo (Phi công RTK cấp 3)"`
- **Option 3 (dòng 227):**
  - `value` & `text`: `"Trần Quang Khải (Pilot Chuyên gia đo quét)"` $\rightarrow$ `"Trần Quang Khải (Phi công chuyên gia đo quét)"`
- **Option 4 (dòng 228):**
  - Giữ nguyên `Nguyễn Văn An (Đội bay Hoàng Hải 02)`.
- **Dòng ghi chú (dòng 231):**
  - `* Theo quy tắc BR-43, PM xác nhận phạm vi bay bổ sung và có toàn quyền chỉ định hoặc thay đổi Operator.` $\rightarrow$ `* Theo quy tắc BR-43, PM xác nhận phạm vi bay bổ sung và có toàn quyền chỉ định hoặc thay đổi phi công thiết bị bay.`

---

## II. KẾT QUẢ KIỂM TRA (VERIFY)

- **Đồng bộ State - Option:** Giá trị khởi tạo mặc định của `selectedPilot` (`'Lê Hoàng Long (Phi công thiết bị bay chính)'`) trùng khớp hoàn toàn từng ký tự với thuộc tính `value` của `<option>` đầu tiên.
- **Rà soát toàn bộ `src/`:**
  - `Drone Operator`: 0 kết quả text hiển thị.
  - `Pilot RTK`: 0 kết quả text hiển thị.
  - `Pilot Chuyên gia`: 0 kết quả text hiển thị.
  - `thay đổi Operator`: 0 kết quả text hiển thị.
- **Biên dịch TypeScript:**
  - Lệnh chạy: `npx tsc -b`
  - Kết quả: **0 lỗi** (Exit code: `0`).
