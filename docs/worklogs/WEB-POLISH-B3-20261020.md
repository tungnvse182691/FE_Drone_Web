# WORKLOG: B3 POLISH — FORM & THẺ PHẲNG

- **Thời gian thực hiện:** 2026-10-20
- **Nhánh:** `tung`
- **Mục tiêu duy nhất:** Đồng bộ TRÌNH BÀY cho các màn form/thẻ đang còn phẳng kiểu cũ về ngôn ngữ thiết kế mới (thẻ bo 20px `rounded-[20px]`, viền 1.5px solid `#E2E5E9`, điểm nhấn màu tông trầm, thanh gradient 4px trên cùng, nhóm nội dung rõ ràng, input/select/textarea bo 10px `rounded-[10px]` với focus ring gold `#C9A227`, bảng có header `#F8F9FA` 12px semibold và border-b `#EDEFF2`, dòng thời gian có chấm màu trên trục dọc mảnh `#E2E5E9`).
- **Nguyên tắc bảo toàn:** Giữ nguyên 100% logic, dữ liệu, validation, phân quyền, route và event handlers. Tuyệt đối không đụng file bản đồ/viewer.

---

## 1. DANH SÁCH FILE ĐÃ SỬA ĐỔI

Tuân thủ nghiêm ngặt danh sách file được phép sửa:

### A. Chi tiết dự án (PM-02 / SUP-04)
1. `src/pages/(pm)/ProjectOverview.tsx` (cập nhật loading container chuẩn bo 20px)
2. `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` (header banner bo 20px, top gradient bar, dot chỉ báo)
3. `src/pages/(pm)/project-overview/ProjectHighlightsGrid.tsx` (3 thẻ KPI bo 20px, viền 1.5px, thanh gradient 4px, icon tint 36px bo 10px, hover -4px + shadow màu)
4. `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` (thẻ tiến độ dự án bo 20px, halo dot vàng `#C9A227`, top gradient bar)
5. `src/pages/(pm)/project-overview/ProjectSegmentsTable.tsx` (bảng phân đoạn bo 20px, thead `#F8F9FA` font-bold text-slate-700, switcher dạng pill bo tròn, badges pill 999px)
6. `src/pages/(pm)/project-overview/ProjectPersonnelCard.tsx` (thẻ ban điều hành bo 20px, halo dot xanh lục `#047857`, avatar bo tròn + online status ring)

*(Lưu ý: Không sửa `ProjectGridView.tsx` và `ProjectTableView.tsx` do đã đạt chuẩn từ trước).*

### B. Tạo đợt bay khảo sát Drone (PM-06)
7. `src/pages/(pm)/create-survey/CreateSurveyForm.tsx` (nhóm toàn bộ form thành 4 thẻ nhóm bo 20px: Hành lang khảo sát, Tham số kỹ thuật bay, Lập lịch & Phi công thiết bị bay, Ghi chú & Phê chuẩn; inputs/selects/textarea bo 10px)

### C. Thẩm định chi tiết lỗi AI (PM-05)
8. `src/pages/(pm)/defect-verify/DefectVerifyHeader.tsx` (header bo 20px, gradient bar, buttons chuyển chế độ dạng pill bo tròn)
9. `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx` (card bo 20px, top gradient bar, inputs/selects/textarea bo 10px, thông số hình học bo tròn, 2 popup modals Resurvey & Measure bo 20px)

### D. Quản lý nhân sự & tài khoản (SUP-04)
10. `src/pages/(sup)/PersonnelManagement.tsx` (header trang bo 20px, gradient bar, button thêm nhân sự bo 10px)
11. `src/pages/(sup)/system-control/AccountsTab.tsx` (thẻ bao bo 20px, gradient bar, ô tìm kiếm & select bo 10px, thead `#F8F9FA`, rows border-b `#EDEFF2`, badges trạng thái pill 999px)

### E. Quản trị hệ thống & Phong tỏa pháp lý (SUP-10)
12. `src/pages/(sup)/SystemControl.tsx` (thanh tabs bo 20px, badge trạng thái "ĐANG BẬT" thêm `whitespace-nowrap shrink-0` không bị ngắt dòng)
13. `src/pages/(sup)/system-control/SystemControlHeader.tsx` (thẻ header bo 20px, gradient bar, nút lập yêu cầu bo 10px)
14. `src/pages/(sup)/system-control/LegalHoldCard.tsx` (thẻ phong tỏa pháp lý bo 20px, gradient đỏ, icon gavel trong khung tint 32px bo 10px, badges `whitespace-nowrap`, ghi chú không bị ngắt chữ giữa từ)
15. `src/pages/(sup)/system-control/DeletionRequestsCard.tsx` (thẻ đề xuất hủy dữ liệu bo 20px, gradient bar, badge trạng thái `whitespace-nowrap`, nút thao tác bo 10px)

### F. Luồng từ chối đợt sửa chữa (SUP-07)
16. `src/pages/(sup)/BatchRejection.tsx` (thẻ form từ chối bo 20px `border-[#B91C1C]/25`, thanh gradient đỏ trên cùng, icon tam giác cảnh báo trong khung tint 40px bo 10px, select/textarea bo 10px, căn giữa `max-w-2xl mx-auto`)

### G. Nhật ký hoạt động & Truy vết (Audit Trail)
17. `src/pages/(sup)/audit-trail/AuditTrailHeader.tsx` (header banner bo 20px, gradient bar, thanh chọn dự án bo 10px)
18. `src/pages/(sup)/audit-trail/AuditTrailFilters.tsx` (bộ lọc bo 20px, ô input/selects bo 10px, nút khoảng thời gian pill bo tròn)
19. `src/pages/(sup)/audit-trail/AuditTrailTable.tsx` (bảng dòng thời gian bo 20px, thead `#F8F9FA`, trục dọc mảnh `#E2E5E9` với chấm tròn 10px + halo màu theo ngữ cảnh: Xanh lục `#047857` cho phê duyệt/nghiệm thu; Đỏ `#B91C1C` cho từ chối/khóa; Cam `#B45309` cho yêu cầu sửa/cảnh báo; Xanh lam `#1E40AF` cho giao việc/phân công; Vàng đồng `#C9A227` cho trình duyệt/khác)

### H. Worklog
20. `docs/worklogs/WEB-POLISH-B3-20261020.md` (file worklog này)

---

## 2. XÁC NHẬN BẢO TOÀN LOGIC & BẢN ĐỒ (COMPLIANCE CHECK)

- [x] **TUYỆT ĐỐI KHÔNG đụng file bản đồ/viewer:**
  - `create-survey/FlightCorridorMap.tsx`: Không sửa.
  - `defect-verify/DefectGisMapViewer.tsx`: Không sửa.
  - `defect-verify/DefectBoundingBoxViewer.tsx`: Không sửa.
  - `defect-verify/DefectTemporalComparison.tsx`: Không sửa.
  - `ProjectMapPreviewCard.tsx`: Không sửa.
- [x] **KHÔNG sửa màn Profile và màn Alignment:**
  - Màn hình Profile và Alignment không nằm trong phạm vi đợt này và được giữ nguyên 100%.
- [x] **Bảo toàn toàn bộ logic & event handlers:**
  - `CreateSurveyForm.tsx`: Giữ nguyên toàn bộ `form.register`, validation errors, `calculateTotalFlightHours`, `handleSubmit`.
  - `DefectVerifyForm.tsx`: Giữ nguyên `onVerify(DefectStatus)`, `handleConfirmResurvey`, `handleConfirmMeasure`, validation ghi chú `notes.trim()`.
  - `BatchRejection.tsx`: Giữ nguyên `handleReject`, state `reasonCategory`, `comments`, toast notification.
  - `PersonnelManagement.tsx` & `AccountsTab.tsx`: Giữ nguyên toàn bộ handlers `setSelectedUserDetail`, `handleOpenEdit`, `handleRestoreUser`, `setUserToSuspend`, `setShowResetPasswordModal`.
  - `SystemControl.tsx`, `LegalHoldCard.tsx`, `DeletionRequestsCard.tsx`: Giữ nguyên `handleToggleLegalHold`, `handleRejectDeletion`, `handleApprovePurge`.
  - `AuditTrail.tsx` & `AuditTrailTable.tsx`: Giữ nguyên bộ lọc, phân trang, `onSelectEventId`, `onOpenDetails`.
- [x] **Không đổi text nghiệp vụ / enum / biến:** Giữ nguyên 100% các mã BR, FR, quy chuẩn TCVN, enum và text tiếng Việt.

---

## 3. KẾT QUẢ KIỂM TRA COMPILER

- **Lệnh thực hiện:** `npx tsc -b`
- **Kết quả:** **0 lỗi** (Exit code 0).
