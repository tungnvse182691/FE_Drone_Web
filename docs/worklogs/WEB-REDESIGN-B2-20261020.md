# WORKLOG: B2 REDESIGN — GÓI ĐỀ XUẤT (FIX TRÀN NGANG) + NGHIỆM THU + BÁO CÁO + THỰC NGHIỆM

- **Thời gian thực hiện:** 2026-10-20
- **Nhánh:** `tung`
- **Mục tiêu:**
  1. Sửa dứt điểm lỗi tràn ngang ở bảng gói đề xuất (`/pm/proposals` và `/sup/proposals`, PM-09/SUP-07): Ở viewport desktop 1440px bảng vừa khít khung, cột thao tác luôn nhìn thấy, không cuộn ngang.
  2. Đưa các màn Nghiệm thu (SUP-07), Báo cáo (PM-12/SUP-10), Thực nghiệm AI (PM-06) về ngôn ngữ thiết kế mới: KPI có điểm nhấn (viền màu riêng, thanh gradient 4px trên cùng, nền tint gradient, chấm màu 10px + halo đầu tiêu đề, hover nâng -4px + shadow màu `0 12px 28px rgba(màu, 0.15)`), thẻ bo 20px viền màu tông trầm, badge pill 999px.
  3. Chỉ thay đổi TRÌNH BÀY (styling/class/layout) — giữ nguyên 100% logic, dữ liệu, phân quyền, route và event handlers.

---

## 1. DANH SÁCH FILE ĐÃ SỬA ĐỔI

Tuân thủ nghiêm ngặt danh sách file được phép sửa:
1. `src/pages/(pm)/repair-proposals/ProposalStats.tsx`
2. `src/pages/(pm)/repair-proposals/ProposalTable.tsx`
3. `src/pages/(pm)/repair-proposals/ProposalTableRow.tsx`
4. `src/pages/(pm)/repair-proposals/ProposalFilterBar.tsx`
5. `src/pages/(pm)/repair-proposals/ProposalHeader.tsx`
6. `src/pages/(sup)/ProposalApprovalDetail.tsx` (chỉ style thẻ/hộp)
7. `src/pages/(sup)/AcceptanceList.tsx` (component dùng chung cho cả PM và Giám sát)
8. `src/pages/(sup)/RiskAnalytics.tsx` (component dùng chung cho cả PM và Giám sát)
9. `src/pages/(sup)/ResearchValidation.tsx` (component dùng chung)
10. `docs/worklogs/WEB-REDESIGN-B2-20261020.md` (file worklog này)

*Không có file nào ngoài danh sách trên bị sửa. Tuyệt đối không đụng file bản đồ.*

---

## 2. PHÂN TÍCH VÀ FIX DỨT ĐIỂM LỖI TRÀN NGANG Ở PROPOSALTABLE

### Hiện trạng trước khi sửa:
- Bảng có class `min-w-[1240px]` kết hợp các cột có bề rộng cứng:
  - Cột Tên gói & Phạm vi: `min-w-[280px]` và `max-w-[340px]`
  - Cột Thao tác: `min-w-[200px]`
  - Cùng các cột Lý trình (140px), Khối lượng (160px), Ngày lập (110px), Trạng thái (130px), Đơn vị thi công (160px), Mã gói (90px)
  - Tổng bề rộng cột và padding thực tế khiến bảng vượt quá 1280px–1320px trong khung chứa có sidebar (1440px - 260px sidebar - 48px padding = ~1132px khả dụng).
  - Kết quả: Bảng bị tràn ngang, thanh cuộn xuất hiện, cột thao tác bị khuất sang bên phải.

### Giải pháp và kích thước sau khi sửa:
- **Bỏ class `min-w-[1240px]`** trên `<table>`. Bọc bảng trong container bo 20px (`rounded-[20px] border border-[#E2E5E9] bg-white shadow-2xs`).
- **Phân bổ lại độ rộng từng cột tối ưu:**
  1. `Mã gói`: `w-[88px] min-w-[88px]` (sticky left-0 với nền trắng và border phân cách)
  2. `Tên gói công việc & Phạm vi`: Bỏ `min-w-[280px]` cứng, cho phép chữ xuống dòng tự nhiên linh hoạt (`min-w-[180px]`)
  3. `Lý trình`: `w-[100px] min-w-[100px]`
  4. `Khối lượng bóc tách`: `w-[125px] min-w-[125px]`
  5. `Ngày lập`: `w-[105px] min-w-[105px]`
  6. `Trạng thái phê duyệt`: `w-[125px] min-w-[125px]`
  7. `Đơn vị thi công`: `w-[105px] min-w-[105px]`
  8. `Tiến độ sửa chữa`: `w-[110px] min-w-[110px]`
  9. `Thao tác`: `w-[155px] min-w-[155px]` (sticky right-0 với nền trắng/hover tint + shadow phía trái `shadow-[-4px_0_12px_rgba(0,0,0,0.06)]`)
- **Tổng bề rộng tối thiểu mới:** `~1093px` (trong đó cột tên gói co giãn chiếm phần còn lại).
- **Lý do không còn tràn ở 1440px:**
  - Viewport 1440px trừ sidebar 260px và padding nội dung 48px còn khoảng **1132px**.
  - Tổng các cột cố định là 913px + cột tên gói linh hoạt (~200px) = ~1113px, vừa khít khung hiển thị của desktop 1440px mà không cần cuộn ngang.
  - Cột "Thao tác" được ghim cố định `sticky right-0` với hiệu ứng đổ bóng nhẹ (`shadow-[-4px_0_12px_rgba(0,0,0,0.06)]`), đảm bảo luôn nhìn thấy 100% các nút chức năng.
- **Hiệu ứng hàng:** Hàng hover có viền trái `border-l-[3px]` theo tông màu trạng thái phê duyệt (SUBMITTED: Amber `#B45309`, DECIDED: Emerald `#047857`, DISPATCHED: Blue `#1E40AF`, DRAFT: Gold `#C9A227`).

---

## 3. CHI TIẾT REDESIGN CÁC MÀN HÌNH

### A. Gói đề xuất (`ProposalStats`, `ProposalHeader`, `ProposalFilterBar`)
- **ProposalStats:** 4 thẻ KPI chuyển sang thẻ bo 20px (`rounded-[20px]`), viền 1.5px theo tông màu trầm, thanh gradient 4px trên cùng, chấm màu 10px kèm halo ring-4, hover nâng `-translate-y-1` và shadow màu `0 12px 28px rgba(màu, 0.15)`:
  - Bản nháp: Gold `#C9A227`
  - Chờ duyệt: Amber `#B45309`
  - Đã duyệt: Emerald `#047857`
  - Đã giao việc: Blue `#1E40AF`
- **ProposalHeader & ProposalFilterBar:** Đồng bộ bo góc `rounded-xl`, filter tabs dạng pill 999px `px-3.5 py-1.5 rounded-full text-xs font-bold`.

### B. Trình duyệt hồ sơ đợt sửa (`ProposalApprovalDetail`)
- Bọc thanh thống kê (`ApprovalStatsBar`) và bảng hạng mục sửa chữa (`ApprovalItemsTable`) trong thẻ bo 20px (`rounded-[20px] border border-[#E2E5E9] bg-white shadow-2xs overflow-hidden`), có thanh gradient 4px trên cùng.
- Giữ nguyên 100% nút hành động và thẩm quyền duyệt của Giám sát.

### C. Nghiệm thu ngoài hiện trường (`AcceptanceList` — SUP-07)
- Chuyển từ bảng `<table>` sang **lưới thẻ 3 cột** (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`).
- Mỗi thẻ bo 20px, viền 1.5px theo trạng thái nghiệm thu:
  - Đạt chuẩn / Đã nghiệm thu: Emerald `#047857`
  - Chờ nghiệm thu: Amber `#B45309`
  - Yêu cầu làm lại: Rose `#B91C1C`
- Thanh gradient 4px trên cùng, chấm màu 10px + halo ring-4 đầu tiêu đề.
- Hiển thị trực quan 2 ảnh Trước / Sau thi công rõ ràng với nhãn và nút zoom xem trước.
- Thanh tiến độ nghiệm thu (% đạt, số hạng mục đạt/tổng).
- **Nút "Vào nghiệm thu" / "Đóng đợt ngay" / "Xem hồ sơ":** Thiết lập `whitespace-nowrap`, padding chuẩn `px-3.5 py-2`, không bao giờ bị rớt dòng thành 3 dòng như trước.
- 4 thẻ KPI đầu trang chuẩn hóa theo ngôn ngữ thiết kế mới.

### D. Báo cáo phân tích rủi ro & Ký đóng đợt (`RiskAnalytics` — PM-12/SUP-10)
- 4 thẻ KPI MET-01, MET-04, MET-08, MET-11 có điểm nhấn: bo 20px, viền màu riêng, thanh gradient 4px trên cùng, chấm halo dot, hover nâng -4px + shadow màu.
- Bảng danh mục hồ sơ giải trình đã kết xuất: Bọc thẻ bo 20px, thanh gradient 4px, thead `#F8F9FA` text-slate-700 font-bold, hàng tbody hover, badge trạng thái pill 999px.
- Giữ nguyên toàn bộ số liệu, thuật ngữ, logic xuất báo cáo, filter và GIS map section.

### E. Kiểm định thực nghiệm mô hình AI (`ResearchValidation` — PM-06)
- 4 thẻ chỉ số MET-12 (Mẫu hợp lệ, Bias, MAE, RMSE) chuyển sang thẻ bo 20px có điểm nhấn, thanh gradient 4px, halo dot, hover nâng -4px + shadow màu.
- 2 bảng số liệu (Đối soát cặp mẫu RS01–RS06 và Lịch sử các đợt kiểm định FR-31/MET-12): Bọc thẻ bo 20px, thead `#F8F9FA`, hàng hover, bộ lọc trạng thái mẫu dạng pill bo tròn.
- **GIỮ NGUYÊN 100% mọi thuật ngữ nghiên cứu** (RS01-RS06, MET-12, MAE, Bias, RMSE, paired samples, ground truth, DD-C09, v.v.), không Việt hóa thêm hay đổi nhãn số liệu.

---

## 4. BẢO TOÀN LOGIC, PHÂN QUYỀN & EVENT HANDLERS

Mọi logic và luồng điều hướng đã được bảo toàn nguyên vẹn:
- `onSelectProposal`, `onOpenCreate`, `onApprove`, `onReject`, `onOpenDetail`, `onOpenPdf`: Giữ nguyên trong Proposal.
- `navigate('/sup/acceptance/${batch.id}')`, `navigate('/pm/proposals/${batch.id}')`, `handleOpenModal`, `handleCloseModal`: Giữ nguyên trong AcceptanceList.
- `handleSelectProject`, `handleTriggerValidation`, `handleCancelJob`, `handleExportGroundTruth`: Giữ nguyên trong ResearchValidation.
- `handleFocusSegment`, `handleZoomIn`, `handleZoomOut`, `handleFitBounds`, `handleToggleSort`, `handleCreateExportJob`, `handleCancelActiveJob`, `handleDeleteRecord`, `handleRetryRecord`, `handleDownloadFile`, `handleRefresh`, `resetFilters`: Giữ nguyên trong RiskAnalytics.
- Quyền duyệt/từ chối chỉ hiển thị theo đúng vai trò `RoleCode.SUPERVISOR`.

---

## 5. KẾT QUẢ KIỂM TRA

- Lệnh kiểm tra: `npx tsc -b`
- Kết quả: **0 lỗi** (Exit code 0).
