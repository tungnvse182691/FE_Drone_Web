# WORKLOG: REDESIGN B1 — Nhiệm vụ hiện trường + Điều phối xử lý nhanh

- **Mã công việc:** WEB-REDESIGN-B1-20261020
- **Ngày thực hiện:** 20/10/2026
- **Mục tiêu:** Đưa 2 màn `/pm/field-tasks` + `/sup/field-tasks` (PM-08) và `/pm/fast-track` + `/sup/fast-track` (PM-10/SUP-08) về cùng ngôn ngữ thiết kế mới đã áp ở Dashboard, Đợt bay khảo sát (Surveys), Hộp thư tiếp nhận AI (AI-Inbox): Thẻ bo 20px viền màu tông trầm, chấm tròn 10px + halo 4px, thanh gradient 4px trên cùng, hover nâng -4px + đổ bóng, badge pill 999px chuẩn spec, bảng dữ liệu đo đạc được polish sạch với cột đầu sticky trái.

---

## 1. Danh sách file đã sửa đổi

### Nhóm Nhiệm vụ hiện trường (Field Tasks):
1. `src/pages/(pm)/field-tasks/FieldTasksHeader.tsx`
   - Bọc header trong container bo `rounded-[20px]`, viền `#E2E5E9`.
   - Cập nhật cả 2 nhóm 4 thẻ KPI (`MEASUREMENTS` và `CONFLICTS`) sang định dạng thẻ bo `rounded-[20px]`, thanh gradient 4px trên cùng, viền 1.5px màu trầm theo nhóm trạng thái (#047857, #1E40AF, #B45309, #B91C1C, #C9A227), chấm tròn 10px + halo 4px, hover nâng -4px và shadow tương ứng.
2. `src/pages/(pm)/field-tasks/MeasurementsTab.tsx`
   - Bọc toàn bộ bảng trong thẻ bo `rounded-[20px] border border-[#E2E5E9]`.
   - Header bảng nền `#F8F9FA`, chữ 12px semibold `text-slate-600`.
   - Cột "Mã Nhiệm Vụ" sticky trái ở cả header (`bg-[#F8F9FA]`) và hàng dữ liệu (`bg-white group-hover:bg-slate-50/90 shadow-[1px_0_0_#EDEFF2]`).
   - Cột số đo định dạng font mono, in đậm `text-slate-900`.
   - Badge trạng thái chuyển thành pill 999px (`rounded-full px-[14px] py-[5px] text-[11px] font-bold`) với màu sắc tông trầm theo spec.
   - Hàng bảng có đường kẻ mảnh `#EDEFF2` và hover tint nhẹ.
3. `src/pages/(pm)/field-tasks/conflicts/ConflictFilterBar.tsx`
   - Khung chứa bo `rounded-[20px] border border-[#E2E5E9] shadow-2xs`.
   - Các nút lọc trạng thái chuyển thành pill `rounded-full px-3.5 py-1.5 text-xs font-bold`.
   - Ô tìm kiếm bo `rounded-xl`.
4. `src/pages/(pm)/field-tasks/conflicts/ConflictQueueTable.tsx`
   - Chuyển đổi từ `<table>` dày đặc sang danh sách thẻ 1 cột (`flex flex-col gap-3.5`).
   - Mỗi thẻ bo `rounded-[20px]`, viền 1.5px theo loại/mức độ xung đột, thanh gradient 4px trên cùng, chấm màu tròn 10px + halo 4px ở đầu tiêu đề.
   - Badge loại xung đột và badge trạng thái phân giải dùng pill 999px `px-[14px] py-[5px] text-[11px] font-bold`.
   - Hover nâng -4px và shadow tương ứng `0 12px 28px rgba(màu, 0.15)`.

### Nhóm Điều phối xử lý nhanh (Fast Track):
5. `src/pages/(pm)/fast-track/FastTrackBanner.tsx`
   - Bo `rounded-[20px]`, viền `1.5px solid #E3D28A`, thanh gradient 4px trên cùng `linear-gradient(90deg, #C9A227 0%, #D97706 100%)`.
   - Chấm tròn 10px + halo 4px, nền gradient tint nhẹ `#FFFDF5` xuống trắng ở 45%.
   - Badge đạt chuẩn / vượt ngưỡng dùng pill 999px.
6. `src/pages/(pm)/fast-track/DispatchModeSelector.tsx`
   - 3 thẻ chế độ giao việc bo `rounded-[20px]`, viền 1.5px, thanh gradient 4px trên cùng (Vàng gold #C9A227 cho Gom lô đo đạc, Xanh lục #047857 cho Đo và Sửa ngay, Đỏ #B91C1C cho Xử lý khẩn cấp).
   - Chấm tròn 10px + halo 4px, hover nâng -4px, badge pill 999px.
7. `src/pages/(pm)/fast-track/DispatchFilters.tsx`
   - Khung chứa bo `rounded-[20px] border border-[#E2E5E9] shadow-2xs`.
   - Các ô select và nút đặt lại bo `rounded-xl`, focus ring `#C9A227`.
8. `src/pages/(pm)/fast-track/DispatchSection.tsx`
   - Khung chứa `dispatch-table-section` chuyển sang `rounded-[20px] border border-[#E2E5E9] shadow-2xs`.
   - Header icon và typography polish đồng bộ.
9. `src/pages/(pm)/fast-track/DispatchTable.tsx`
   - Chuyển đổi từ bảng sang **lưới thẻ 3 cột**: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`.
   - Mỗi thẻ khiếm khuyết:
     - Bo `rounded-[20px]`, viền 1.5px màu trầm theo trạng thái đủ điều kiện (Xanh #047857 nếu Đạt chuẩn, Đỏ #B91C1C nếu Vi phạm/Không đủ điều kiện API-146, Vàng #C9A227 mặc định).
     - Thanh gradient 4px trên cùng, chấm tròn 10px + halo 4px ở tiêu đề.
     - Checkbox/Radio (PM) hoặc số thứ tự (Giám sát) góc trên phải.
     - Tuyến, lý trình, kích thước sơ bộ rõ ràng.
     - Badge đánh giá xử lý nhanh v2.1: pill 999px `px-[14px] py-[5px] text-[11px] font-bold`.
     - Phân công đội thi công: dropdown select cho PM khi đủ chuẩn; tag khóa "Chờ gom đợt" khi không đủ điều kiện; tag chỉ xem cho Giám sát.
     - Giữ nguyên nút "Gom đợt duyệt" và nút xem chi tiết trắc địa.
   - Banner cảnh báo chặn `hasViolationItem` được polish sang bo `rounded-[20px]` viền `#E6A8A8` nền gradient tint `#FEF2F2`.
10. `src/pages/(pm)/fast-track/DispatchActionBar.tsx`
    - Khung chứa bo `rounded-[20px] border border-[#E2E5E9] shadow-2xs`.
    - Badge cảnh báo vượt ngưỡng dùng pill 999px. Giữ nguyên toàn bộ logic phân quyền (Giám sát chỉ xem, PM phát lệnh).

---

## 2. Xác nhận tính toàn vẹn Logic & Phân quyền (Invariants)

- **Quyền Giám sát (Supervisor):**
  - Giám sát ở Fast Track là **CHỈ XEM (Read-only)**. Tuyệt đối không thêm nút duyệt hay hành động giao việc nào cho Giám sát.
  - Thẻ khiếm khuyết hiển thị số thứ tự `#index` thay vì checkbox/radio.
  - Đội thi công hiển thị dạng nhãn tĩnh.
- **Rà soát Event Handlers:**
  - `FieldTasksHeader.tsx`: `setActiveTab`, `handleResetData` hoạt động chính xác.
  - `MeasurementsTab.tsx`: `setSelectedDetailTask`, `setLightboxTask`, `handleVerifyTask`, `setIsCreateModalOpen`, bộ lọc tab pills hoạt động 100%.
  - `ConflictFilterBar.tsx`: `setFilterType`, `setSearchTerm` hoạt động chính xác.
  - `ConflictQueueTable.tsx`: click thẻ kích hoạt `setSelectedConflictId` và `onOpenDetail`, nút "Xem đối chiếu" hoạt động chính xác.
  - `FastTrackBanner.tsx`: `onClose` hoạt động chính xác.
  - `DispatchModeSelector.tsx`: `handleChangeWorkMode` hoạt động chính xác.
  - `DispatchFilters.tsx`: `handleRouteChange`, `setCrewFilter`, `setStatusFilter`, đặt lại bộ lọc hoạt động chính xác.
  - `DispatchTable.tsx`: `handleSelectAll`, `handleToggleSelect`, `handleAssignCrew`, `setDetailDefect`, `onRemoveViolationItems`, `onNavigateProposals` hoạt động chính xác.
  - `DispatchActionBar.tsx`: `setSelectedDefectIds`, `showToast`, `handleDispatchBatch`, `handleRepairDirect`, `handleEmergencyDispatch` hoạt động chính xác.
- **Không đụng chạm bản đồ:**
  - `src/pages/(pm)/fast-track/DispatchMap.tsx` và mọi component bản đồ khác **HOÀN TOÀN KHÔNG BỊ CHẠM**.
- **Không đụng modal:**
  - Không sửa các modal: `ConflictResolveModal`, `FastTrackModals`, `DefectDetailModal`, `AuditModal`, `FastTrackDispatchModal`.

---

## 3. Kết quả kiểm tra biên dịch (tsc) & Git Diff

- **TypeScript check:**
  ```bash
  npx tsc -b
  # Result: Exit code 0 (0 errors)
  ```
- **Git diff name-only verification:**
  ```text
  src/pages/(pm)/fast-track/DispatchActionBar.tsx
  src/pages/(pm)/fast-track/DispatchFilters.tsx
  src/pages/(pm)/fast-track/DispatchModeSelector.tsx
  src/pages/(pm)/fast-track/DispatchSection.tsx
  src/pages/(pm)/fast-track/DispatchTable.tsx
  src/pages/(pm)/fast-track/FastTrackBanner.tsx
  src/pages/(pm)/field-tasks/FieldTasksHeader.tsx
  src/pages/(pm)/field-tasks/MeasurementsTab.tsx
  src/pages/(pm)/field-tasks/conflicts/ConflictFilterBar.tsx
  src/pages/(pm)/field-tasks/conflicts/ConflictQueueTable.tsx
  ```
  *(100% thuộc danh sách cho phép, hoàn toàn không có DispatchMap hay file map nào).*
