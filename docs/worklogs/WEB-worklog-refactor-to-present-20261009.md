# Worklog: TỔNG HỢP QUÁ TRÌNH PHÁT TRIỂN & HOÀN THIỆN TỪ SAU ĐỢT REFACTOR ĐẾN NAY

- **Thời gian thực hiện:** Từ 05/10/2026 đến 09/10/2026
- **Nhánh làm việc:** `hoang` (kế thừa từ các đợt refactor trên `tung`)
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Mục tiêu tổng quát:** Kế thừa bộ khung mã nguồn sau đợt đại tái cấu trúc (refactor tách nhỏ 18 màn hình <= 300 dòng, dọn types SSOT, chuẩn hóa Tailwind tokens); tiếp tục hiệu chỉnh nghiệp vụ theo sát Spec v2.2 (bộ tài liệu 29_9), tối ưu hóa trải nghiệm giao diện theo phong cách Minimalism & Material Design, và loại bỏ hoàn toàn cơ chế mock tĩnh/localStorage để chuyển sang In-Memory Mock API Service kiến trúc chuẩn.

---

## I. TỔNG QUAN CÁC GIAI ĐOẠN ĐÃ THỰC HIỆN

```
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: Kế thừa & Đồng bộ nền tảng (05/10 - 06/10)                │
│ • Kiểm tra cấu trúc phân rã <= 300 dòng của 18 màn hình                │
│ • Rà soát SSOT types (src/types/domain.ts & enums.ts)                 │
│ • Đồng bộ hóa toàn bộ màu sắc sang Tailwind Brand Tokens               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ GIAI ĐOẠN 2: Hoàn thiện tính năng Tuyến đường & Bình đồ (06/10 - 07/10)│
│ • Khảo sát hình học tim đường (Polyline) & Dải mặt đường (Polygon)     │
│ • Cơ chế phân đoạn Tuyến chính (Mainline) vs Tuyến nhánh (Branch/Ramp) │
│ • Tối ưu Modal nhập tọa độ GPS và thiết lập mặt cắt ngang              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ GIAI ĐOẠN 3: Tinh gọn Hộp thư AI & Thao tác hàng loạt (07/10)          │
│ • AIReviewInbox: Tinh gọn bảng tiếp nhận phát hiện từ Drone            │
│ • Hiển thị định danh Tuyến chính / Nhánh rõ ràng                       │
│ • Bulk Actions: Phê duyệt hàng loạt, gom đợt đo kiểm, từ chối          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ GIAI ĐOẠN 4: Chuẩn hóa Điều phối Fast Track & Ngưỡng vi phạm (08/10)   │
│ • Phân định Fast Track (TN01-05) vs Gom đợt kiểm chứng chỉ-đo (TN07)  │
│ • Xử lý khiếm khuyết vi phạm ngưỡng (Overlimit Threshold): Ngăn chặn   │
│   tùy tiện đưa lỗi vượt ngưỡng vào sửa nhanh khi chưa đo kiểm          │
│ • Tái thiết kế giao diện FastTrackDispatch theo phong cách Minimalism  │
│ • Chuyển đổi dữ liệu sang fastTrackService (In-Memory Mock API)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ GIAI ĐOẠN 5: Gom đợt đề xuất sửa chữa & Thẩm duyệt (08/10 - 09/10)     │
│ • Hỗ trợ chọn phân đoạn: Từng phân đoạn (SEG-xx) hoặc Toàn tuyến       │
│ • Giải quyết bài toán Phương án kỹ thuật: Cho phép PM tự do nhập       │
│   phương án kỹ thuật riêng cho từng khiếm khuyết (kèm gợi ý TCVN 8819) │
│ • Ánh xạ 1-1 chính xác vào RepairItemDetail trong hồ sơ Giám sát duyệt │
│ • Rà soát Spec 29_9 (SC01/SC02): Chặn tạo lỗi phát sinh tùy tiện tại   │
│   form gom gói, bảo toàn tính toàn vẹn Defect ID từ Drone / Reporter   │
│ • Đồng bộ liên thông thời gian thực với In-Memory repairService        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## II. CHI TIẾT CÔNG VIỆC THEO TỪNG MODULE NGHIỆP VỤ

### 1. Module Tuyến đường & Bình đồ mặt đường (`/pm/alignment`)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(pm)/alignment/AlignmentSegments.tsx`
  - `src/pages/(pm)/alignment/AlignmentHeader.tsx`
  - `src/pages/(pm)/alignment/AlignmentAddModal.tsx`
  - `src/pages/(pm)/alignment/AlignmentEditModal.tsx`
  - `src/pages/(pm)/alignment/alignmentMapSetup.ts`
  - `src/pages/(pm)/alignment/alignmentGeometryHelpers.ts`
- **Nghiệp vụ đã xử lý:**
  - **Dải mặt đường (Road Surface Polygon):** Hoàn thiện giải thuật dựng đa giác mặt đường dọc theo tim đường dựa trên bề rộng từng phân đoạn và vùng biên mở rộng khảo sát.
  - **Tuyến chính vs Tuyến nhánh:** Bổ sung cơ chế quản lý và phân loại phân đoạn theo Trục chính (`MAINLINE`) hoặc Nhánh ra/vào (`RAMP_ON`, `RAMP_OFF`, `BRANCH`), cho phép cấu hình lý trình riêng biệt.
  - **Nhập tọa độ GPS:** Tối ưu hóa modal nhập chuỗi tọa độ WGS84, kiểm tra tính hợp lệ của polyline, chuyển đổi sang hệ tọa độ phẳng mét để tính chiều dài thực tế.

---

### 2. Module Hộp thư tiếp nhận lỗi AI (`/pm/ai-inbox`)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(pm)/AIReviewInbox.tsx`
  - `src/pages/(pm)/ai-review/ReviewCasesTable.tsx`
  - `src/pages/(pm)/ai-review/ReviewCasesHeader.tsx`
  - `src/pages/(pm)/ai-review/useAIReviewCases.ts`
- **Nghiệp vụ đã xử lý:**
  - Tinh gọn bảng tiếp nhận ứng viên khiếm khuyết phát hiện tự động từ video/telemetry của Drone.
  - Bổ sung cột phân biệt rõ ràng vị trí: Tuyến chính hay Tuyến nhánh, lý trình Km và làn đường.
  - Tích hợp tính năng **Thao tác hàng loạt (Bulk Actions)**: PM có thể chọn nhiều khiếm khuyết để xác nhận hàng loạt (`VERIFIED`), gộp vào đợt đo kiểm thước/laser (`TN07`), hoặc loại bỏ các phát hiện rác (`NO_DEFECT`).

---

### 3. Module Điều phối khẩn cấp & Chính sách Fast Track (`/pm/fast-track`)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(pm)/FastTrackDispatch.tsx`
  - `src/pages/(pm)/fast-track/DispatchTable.tsx`
  - `src/pages/(pm)/fast-track/DispatchSection.tsx`
  - `src/pages/(pm)/fast-track/DispatchActionBar.tsx`
  - `src/pages/(pm)/fast-track/DispatchFilters.tsx`
  - `src/pages/(pm)/fast-track/DispatchModeSelector.tsx`
  - `src/pages/(pm)/fast-track/PolicySection.tsx`
  - `src/pages/(pm)/fast-track/PolicyModal.tsx`
  - `src/pages/(pm)/fast-track/AuditModal.tsx`
  - `src/pages/(pm)/fast-track/useFastTrackDispatch.ts`
  - `src/pages/(pm)/fast-track/useFastTrackPolicy.ts`
  - `src/api/services/fastTrackService.ts`
- **Nghiệp vụ đã xử lý:**
  - **Phân định rõ 2 nhánh xử lý:**
    - *Nhánh Fast Track (Sửa chữa nhanh TN01–TN05):* Chỉ áp dụng cho các khiếm khuyết nhỏ, nằm trong hạn mức chính sách (Policy) đã được công bố, đội thi công có quyền đo và trám vá ngay trong chuyến đi.
    - *Nhánh Gom đợt kiểm chứng (Chỉ-đo TN07):* Áp dụng khi khiếm khuyết có dấu hiệu nghiêm trọng hoặc vượt ngưỡng, chỉ giao nhiệm vụ ra hiện trường đo laser/thước và chụp ảnh kiểm chứng, không được tự ý sửa.
  - **Xử lý khiếm khuyết vượt ngưỡng (Overlimit Threshold):**
    - Nhận diện các lỗi có diện tích hoặc độ sâu vượt quá ngưỡng của Policy hiện hành.
    - Hiển thị cảnh báo trực quan; cấm hoặc cảnh báo khi người dùng cố gắng gom lỗi vượt ngưỡng vào diện sửa nhanh Fast Track.
  - **Tái thiết kế giao diện:**
    - Căn chỉnh lại khung Policy Section và Action Bar theo phong cách **Minimalism** phẳng, hiện đại, các hàng và cột thẳng hàng, không bị lệch giao diện.
    - Biểu tượng đồng bộ chuẩn Material / Lucide phẳng, màu sắc tuân thủ tokens thương hiệu Hoàng Hải (Vàng đồng `#C9A227`, Navy `#2D3748`).
  - **Kiến trúc dữ liệu:**
    - Chuyển toàn bộ dữ liệu Fast Track sang `fastTrackService.ts` (In-Memory Mock API Service có dispatch event `roadguard_state_change`), loại bỏ việc can thiệp trực tiếp vào localStorage.

---

### 4. Module Gom đợt đề xuất sửa chữa kỹ thuật (`/pm/proposals` & `/pm/repair-batches/create`)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(pm)/RepairProposals.tsx`
  - `src/pages/(pm)/repair-proposals/CreateProposalModal.tsx`
  - `src/pages/(pm)/repair-proposals/ProposalBOQCard.tsx`
  - `src/pages/(pm)/repair-proposals/ProposalModals.tsx`
  - `src/pages/(pm)/repair-proposals/types.ts`
  - `src/pages/(pm)/repair-proposals/useRepairProposalsState.ts`
  - `src/api/services/repairService.ts`
- **Nghiệp vụ đã xử lý:**
  - **Lọc theo phân đoạn lý trình:**
    - Cho phép PM tạo gói sửa chữa theo từng phân đoạn lý trình (`SEG-01`, `SEG-02`...) hoặc gom trên **Toàn tuyến** (tất cả các phân đoạn thuộc tuyến).
  - **Xóa bỏ Mock Data cứng:**
    - Kết nối Form tạo gói trực tiếp với In-Memory `repairService`.
    - Khi PM bấm "Lưu bản nháp" (`DRAFT`) hoặc "Khóa & Trình duyệt ngay" (`SUBMITTED`), gói công việc mới lập tức được tạo thật trong service và hiển thị ngay trên bảng danh sách.
  - **Phương án kỹ thuật linh hoạt cho từng khiếm khuyết (Phương án A):**
    - Giải quyết mâu thuẫn: Trước đây form chỉ có 1 ô phương án kỹ thuật chung, nhưng khi Supervisor xem hồ sơ thì cần phương án kỹ thuật riêng cho từng item.
    - Cải tiến: Khi PM tick chọn bất kỳ khiếm khuyết nào trong danh sách gom gói, khối cấu hình của khiếm khuyết đó sẽ mở rộng ra ngay bên dưới.
    - PM được **tự do gõ/nhập nội dung giải pháp kỹ thuật** theo ý muốn (ví dụ: *Cào bóc 5cm, trám vá nhựa nguội, xử lý móng CPĐD...*) thay vì chỉ chọn từ danh mục tĩnh.
    - Đi kèm các **Quick Chips gợi ý nhanh** theo định mức TCVN 8819 / AASHTO để PM click điền nhanh khi cần.
  - **Tuân thủ kỷ luật chống tự chế (Spec 29_9 SC01/SC02):**
    - Rà soát đặc tả nghiệp vụ: Mọi khiếm khuyết gom gói đều phải có nguồn gốc từ Khảo sát Drone hoặc Phản ánh người dân và đã ở trạng thái `VERIFIED`.
    - Loại bỏ nút và form thêm hư hỏng phát sinh thủ công tùy tiện, tránh phá vỡ cấu trúc `defect_id` và mô hình dữ liệu của Backend.

---

### 5. Module Thẩm duyệt hồ sơ sửa chữa của Giám sát (`/sup/approvals/:id` & `/pm/proposals/:id`)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(sup)/ProposalApprovalDetail.tsx`
  - `src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx`
  - `src/pages/(sup)/proposal-approval/useProposalApprovalState.ts`
- **Nghiệp vụ đã xử lý:**
  - Kết nối trang chi tiết với `repairService.getItems(id)`. Khi mở hồ sơ của một gói vừa tạo, bảng thẩm duyệt sẽ hiển thị đúng danh sách items và **chính xác phương án kỹ thuật riêng biệt mà PM đã tự gõ**.
  - Tích hợp listener lắng nghe event `roadguard_state_change`, giúp trạng thái phê duyệt từng item (`APPROVED`, `REQUEST_EVIDENCE`, `REQUEST_RECONSIDER`, `REJECT`) được đồng bộ tức thì mà không cần reload trang.

---

### 6. Module Danh mục khảo sát Drone (`/pm/surveys`)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(pm)/surveys/SurveyHeader.tsx`
  - `src/pages/(pm)/surveys/SurveyKpiCards.tsx`
- **Nghiệp vụ đã xử lý:**
  - Dọn dẹp mã màu hardcoded, chuyển sang sử dụng tokens đồng bộ (`text-brand-dark`, `border-brand-border`, `bg-brand-gold`).
  - Căn chỉnh lại các thẻ KPI khảo sát theo bố cục gọn gàng, đúng phong cách thiết kế chung.

---

### 7. Tài liệu hóa kịch bản kiểm thử & Hướng dẫn hệ thống
- **Tệp tài liệu cập nhật:**
  - `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`: Bổ sung toàn bộ kịch bản kiểm thử chi tiết từng bước cho cả 2 vai trò Chỉ huy trưởng (PM) và Giám sát trưởng (Supervisor).
  - `skills/roadguard-web/DESIGN.md`: Định hình phong cách thiết kế Hoàng Hải Dashboard (Minimalism, Material Symbols, Token Palette).

---

### 8. Module Điều phối xuất quân & Phân công Đội thi công (Bước PM-11 / SC10 / FR-20)
- **Tệp chỉnh sửa/hoàn thiện:**
  - `src/pages/(sup)/proposal-approval/ProposalDispatchModal.tsx`
  - `src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx`
  - `src/pages/(sup)/proposal-approval/useProposalApprovalState.ts`
  - `src/pages/(pm)/repair-proposals/ProposalTableRow.tsx`
  - `src/pages/(pm)/repair-proposals/ProposalFilterBar.tsx`
  - `src/pages/(pm)/repair-proposals/ProposalStats.tsx`
  - `src/pages/(pm)/repair-proposals/useRepairProposalsState.ts`
  - `src/components/ui/StatusBadge.tsx`
  - `src/api/services/repairService.ts`
- **Nghiệp vụ đã xử lý:**
  - **Tôn trọng phân công chi tiết từng hạng mục (SC10 / FR-20):** Bảng danh sách cho phép PM chọn tổ chuyên trách theo tính chất từng điểm hư hỏng (Asphalt 01, Cơ giới 02, Bảo dưỡng thường xuyên). Modal "Ban hành Lệnh công tác (Dispatch)" hiển thị chính xác tổ đã chọn của từng dòng kèm thẻ tóm tắt khối lượng các đội, chỉ ghi đè khi PM tích chọn tùy chọn "Gán nhanh cho 1 đội duy nhất".
  - **Sửa lỗi hiển thị & đồng bộ máy trạng thái chuẩn (`ASSIGNED / DISPATCHED`):** Khắc phục thứ tự điều kiện hiển thị huy hiệu trên Header để phản ánh ngay lập tức khi phát lệnh giao việc; kết nối state phản ứng trong hook `useProposalApprovalState`.
  - **Chuẩn hóa thuật ngữ công trường:** Thay đổi toàn bộ nhãn từ "Đang thi công" sang "Đã giao việc" (`ASSIGNED`) cho bước phát lệnh từ văn phòng; chỉ chuyển sang "Đang thi công" (`IN_PROGRESS`) khi thợ hiện trường bấm bắt đầu thực hiện trên Mobile App.
  - **Lưu trữ bền vững (Local Persistence):** Tích hợp `repairService.ts` với `storageHelper.ts` (`localStorage`), bảo toàn toàn bộ trạng thái gói và phân công tổ thi công khi F5 hoặc đóng tab.
  - **Tối ưu hiển thị danh sách gói đề xuất:** Tăng phân trang `pageSize` từ 4 lên 10 dòng/trang, giúp gói đã duyệt và gói đã giao việc hiển thị trực quan mà không bị đẩy sang trang phụ.

---

### 9. Module Nhiệm vụ Đo đạc & Phân giải Xung đột Ngoại tuyến (Bước PM-12 / BR-16 / Q04 / D05 / D06)
- **Tệp chỉnh sửa/tạo mới:**
  - `src/api/services/conflictService.ts` (Tạo mới: In-Memory Mock API Service phân giải xung đột)
  - `src/api/services/fieldTaskService.ts` (Tạo mới: In-Memory Mock API Service quản lý phiếu đo đạc)
  - `src/components/common/ImageComparisonSlider.tsx` (Tạo mới: Thanh trượt Split-screen so sánh ảnh)
  - `src/components/common/PhotoLightboxModal.tsx` (Tạo mới: Lightbox soi ảnh vạch thước toàn màn hình)
  - `src/pages/(pm)/field-tasks/conflicts/ConflictResolutionActions.tsx`
  - `src/pages/(pm)/field-tasks/conflicts/ConflictQueueTable.tsx`
  - `src/pages/(pm)/field-tasks/ConflictResolveModal.tsx`
  - `src/pages/(pm)/field-tasks/ConflictsTab.tsx`
  - `src/pages/(pm)/FieldTasks.tsx`
  - `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`
- **Nghiệp vụ đã xử lý:**
  - **Chuẩn hóa đối chiếu theo Spec 29_9 (§12 Mục 12 tài liệu `09_Offline_App_Sync_Spec.md` & `BR-16`):**
    * *Ca Đổi đội khi ngoại tuyến (`ASSIGNMENT_REASSIGNED` - D05/Q04):* Xóa bỏ hoàn toàn nút Hợp nhất. Bảo toàn Actor/Provenance kiểm toán. PM có 2 lựa chọn: **"Công nhận kết quả Tổ 02 (Thu hồi Đội 01)"** hoặc **"Từ chối kết quả Tổ 02 (Giữ Đội 01)"**.
    * *Ca Lệch chính sách Fast Track (`POLICY_VERSION_MISMATCH` - D06/BR-16):* Xóa bỏ nút Hợp nhất (chính sách là quy tắc nhị phân). PM có 2 lựa chọn: **"Đặc cách duyệt Fast Track"** (theo v1.8) hoặc **"Từ chối Fast Track - Chuyển duyệt đợt"** (theo v2.2, hiển thị badge màu đỏ/rose).
    * *Ca Trùng lặp 2 thiết bị (`DUPLICATE_WORK_ATTEMPT` - DEDUP):* Duy nhất ca này có tùy chọn **"Hợp nhất thủ công (Manual Merge)"** để nhặt từng trường giữa 2 nguồn đo.
    * *Ca Cứu hộ thiết bị (`DEVICE_RESCUE_PENDING` - Q17 / Quyết định 42A):* Quy trình 2 lớp, PM chỉ có quyền **"Trình Giám sát duyệt cứu hộ"**, Supervisor có quyền **"Ký số phê duyệt cứu hộ"** hoặc **"Từ chối"**.
    * *Ca Đóng băng hồ sơ (`AGGREGATE_VERSION_CONFLICT` - BR-26):* PM chọn **"Tạo phụ lục đợt mới (BR-26)"** hoặc **"Từ chối số liệu nộp muộn"**.
  - **Sửa đổi tài liệu kiểm thử:** Cập nhật lại Bước PM-12 trong `DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md` loại bỏ hoàn toàn các mô tả tự chế trước đây (Ghi đè, Hợp nhất tùy tiện).
  - **Tối ưu trải nghiệm giao diện:** Tách giao diện thành 2 sub-tab độc lập (`Hàng đợi xung đột` & `Bảng đối chiếu chi tiết`), không dồn bảng chi tiết xuống cuối trang.

---

## III. THỐNG KÊ BIẾN ĐỘNG MÃ NGUỒN (CODE METRICS)

- **Tổng số tệp nguồn (`src/`) đã chỉnh sửa/tối ưu:** 35 files
- **Trạng thái kiểm tra kiểu (Typecheck):** `npx tsc -b && vite build` $\rightarrow$ **Exit Code 0 (100% sạch lỗi TypeScript)**
- **Trạng thái Dev Server:** Vite server chạy ổn định trên cổng `http://localhost:5173`.

---

## IV. BẢO ĐẢM KỶ LUẬT THIẾT KẾ VÀ QUY TẮC BẤT BIẾN (INVARIANTS)

1. **Zero-Money Policy:** Toàn bộ form tạo đề xuất và bảng thẩm duyệt chỉ quản lý khối lượng kỹ thuật công trình ($m^2$ cào bóc, $m$ trám nứt, $cm$ độ sâu, định mức TCVN 8819), tuyệt đối không có trường đơn giá hay BOQ tài chính.
2. **Kỷ luật Spec v2.2:** Nghiệp vụ, tên trạng thái, luồng phê duyệt tuân thủ chặt chẽ theo bộ tài liệu 29_9 và máy trạng thái Điều 8 AGENTS.md (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `APPROVED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `PENDING_INSPECTION` $\rightarrow$ `COMPLETED`).
3. **Phong cách Minimalism:** Giao diện phẳng, đường viền mảnh `border-slate-200`, bo góc tiêu chuẩn `rounded-xl`/`rounded-2xl`, màu sắc vàng đồng thương hiệu `#C9A227` được sử dụng có điểm nhấn vào CTA chính và KPI.
4. **Cấu trúc phẳng:** Giữ nguyên 100% cây thư mục chuẩn của dự án theo `AGENTS.md`, không tạo file trùng lặp hay phá vỡ kiến trúc module.

---

## V. CẬP NHẬT CHUẨN HÓA KỊCH BẢN KIỂM THỬ PM (PM-13 ĐẾN PM-17)

- **Tệp chỉnh sửa:** `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`
- **Nghiệp vụ đã chuẩn hóa theo Spec 29_9:**
  1. **Bước PM-13 (HT09, HT11, HT12, BR-25):** 
     - Chuẩn hóa mã Use Case thành `HT09` (PM kiểm tra ảnh Before/After, số đo hình học, biên bản lấy mẫu/lu lèn TCVN 8819:2011) và `HT11` (PM Trình kết quả nghiệm thu).
     - Phân định rõ 2 nhánh nghiệp vụ:
       * *Nhánh duyệt thông thường (`APPROVAL_TRACK`):* PM bấm "Trình Giám sát nghiệm thu", chuyển sang `PENDING_INSPECTION` (hoặc `PM_CHECKED`), chờ Supervisor nghiệm thu và ký số.
       * *Nhánh cấp bách Fast Track (`FAST_TRACK` - BR-25):* PM tự kiểm tra và bấm "Đóng hoàn thành Fast Track" (`HT12`), đóng thẳng về `CLOSED`/`RESOLVED`, hệ thống tự phát thông báo hậu kiểm cho Supervisor mà không cần duyệt lại.
       * *Nhánh thi công không đạt (`HT10`):* PM bấm "Yêu cầu làm lại (Request Rework)".
  2. **Bổ sung Bước PM-14 (Báo cáo KPI & Rủi ro suy thoái - BC02, RPT-01..06):** Tuyến URL `/pm/reports` / `/pm/risk-analytics`, theo dõi chỉ số nghiệm thu đợt đầu, tỷ lệ phân luồng Fast Track và Heatmap cảnh báo rủi ro lún nứt.
  3. **Bổ sung Bước PM-15 (Thực nghiệm Đối soát AI & Ground-truth - RS01..06, RPT-09, WF-10):** Tuyến URL `/pm/research-validation`, đối soát mô hình DSM/Orthophoto với số liệu đo thực địa, tính sai số $MAE$, $RMSE$, $Bias$, xuất ma trận nhầm lẫn và Dataset nghiên cứu.
  4. **Bổ sung Bước PM-16 (Tra cứu Nhật ký Kiểm toán - RPT-10, Durable Audit Trail):** Tuyến URL `/pm/audit-trail`, tra cứu dòng sự kiện bất biến hệ thống (`GET /audit-events`), xác thực chữ ký/mã băm SHA-256 payload dữ liệu.
  5. **Bổ sung Bước PM-17 (Quản lý Vòng đời & Đề xuất Hủy Hồ sơ - BR-45, WF-12):** Tuyến URL `/pm/retention` / `/pm/system-control`, theo dõi hạn lưu trữ hồ sơ (hết bảo hành + 5 năm), kiểm tra điều kiện Legal Hold và gửi đề xuất hủy sang Giám sát phê duyệt (nguyên tắc kiểm soát 4 mắt).


