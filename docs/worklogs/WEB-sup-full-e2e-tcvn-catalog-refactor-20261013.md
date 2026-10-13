# Worklog: HOÀN TẤT RÀ SOÁT, CHUẨN HÓA TOÀN BỘ QUY TRÌNH SUPERVISOR VÀ QUẢN TRỊ DANH MỤC KHIẾM KHUYẾT TCVN (QT03, QT04, QT07, FR-31, FR-36, BR-44, BR-45)

- **Thời gian thực hiện:** 13/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): `01_FRD_SRS.md` (FR-18, FR-31, FR-34, FR-35, FR-36), `02_Business_Rules.md` (BR-01, BR-16, BR-21, BR-25, BR-26, BR-27, BR-44, BR-45, BR-46), `04_Use_Cases.md` (QT01-QT14, SC05, HT10, HT12, BC01, BC04, CN10), `06_Report_Analytics_Requirements.md` (RPT-06, RPT-09).
  - Danh mục chức năng & Mock API (`docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`): Mục 09 (Quản lý Danh mục Khiếm khuyết TCVN & AI Models).
  - 10 Điều bất biến (`AGENTS.md`): Zero Money (Điều 1), Quyền Phê duyệt/Từ chối độc quyền của Supervisor (Điều 2), Đóng băng hồ sơ (Điều 3), Cơ chế Soft-Disable bảo toàn lịch sử hoàn công.

---

## I. MỤC TIÊU VÀ BỐI CẢNH CÔNG VIỆC

Theo yêu cầu rà soát toàn diện quy trình của vai trò **Supervisor (Giám sát trưởng / Chủ đầu tư)** nhằm bảo đảm tính tuân thủ 100% với đặc tả Spec v2.2, không sót và không bịa tính năng ngoài spec:
1. **Rà soát & Loại bỏ các thành phần tự chế không có trong spec:**
   - Xóa bỏ modal/form "Thêm mô hình AI" tự chế (yêu cầu người dùng nhập mAP@50, Recall, F1-Score) vì mô hình AI được đóng gói và nạp từ pipeline kỹ thuật MLOps/Container, không nhập tay trên web.
   - Loại bỏ công tắc Fast-Track thủ công gắn trên từng mô hình AI trong `AIModelsTab` (gây xung đột với chính sách Fast-Track Policy theo ngưỡng kỹ thuật).
   - Xóa bỏ các badge công thức toán học thô ($\text{Bias} = \sum e/N, \text{MAE} = \sum |e|/N, \text{RMSE} = \sqrt{\dots}$) trong các thẻ chỉ số kiểm định mô hình (`ValidationMetricsCards.tsx`), đưa về hiển thị chuẩn kỹ thuật trắc địa/xây dựng ($mm$).
2. **Chuẩn hóa Quản trị Danh mục Khiếm khuyết TCVN (`QT03, QT04`):**
   - Theo quy định tại mục 09 tài liệu Mock API, Supervisor cần có khả năng quản lý danh mục khiếm khuyết áp dụng cho các dự án:
     - **Thêm mới (Create):** Thêm loại hư hỏng mới khi mở rộng tuyến hoặc áp dụng tiêu chuẩn bổ sung.
     - **Cập nhật (Update / Sửa):** Điều chỉnh tiêu chuẩn viện dẫn, cấp độ khẩn cấp, mô tả kỹ thuật.
     - **Tạm ngưng / Áp dụng (Soft-Disable):** Tuyệt đối cấm xóa vĩnh viễn (Hard-Delete) nhằm bảo tồn toàn vẹn dữ liệu lịch sử hoàn công đã ký nghiệm thu.
3. **Kiểm thử E2E Full Luồng trên Trình duyệt Thực tế:**
   - Sử dụng subagent trình duyệt tự động kiểm thử toàn bộ 14 màn hình và luồng thao tác của Supervisor trên môi trường dev local (`http://localhost:3000`).

---

## II. CHI TIẾT CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1. Quản trị Danh mục Khiếm khuyết TCVN (`DefectCatalogTab.tsx` & `DefectCatalogModal.tsx`)
- **Tạo mới `DefectCatalogModal.tsx`:** Modal giao diện chuẩn phong cách Hoàng Hải hỗ trợ cả 2 chế độ `CREATE` (Thêm mới) và `EDIT` (Sửa):
  - Mã khiếm khuyết (`code`), Tên khiếm khuyết tiếng Việt (`name`).
  - Tiêu chuẩn viện dẫn (`standard_ref`: TCVN 8819:2011, TCVN 8864:2011, ASTM D6433, v.v.).
  - Mức độ nghiêm trọng mặc định (`default_severity`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - Ghi chú kỹ thuật & phạm vi áp dụng (`technical_notes`).
  - Trạng thái áp dụng (`is_active`).
- **Nâng cấp `DefectCatalogTab.tsx`:**
  - Bổ sung nút **"+ Thêm khiếm khuyết TCVN"** ở góc trên danh mục.
  - Mỗi dòng khiếm khuyết bổ sung nút **"Sửa"** (mở modal cập nhật).
  - Công tắc chuyển đổi trạng thái **"Áp dụng / Ngưng"** (Soft-Disable) đi kèm thông báo nghiệp vụ rõ ràng.
- **Dọn dẹp `AIModelsTab.tsx`:**
  - Giữ vững vai trò Monitoring Dashboard: hiển thị thẻ các phiên bản mô hình sản xuất, mã băm SHA-256 bất biến của weights, và nút **"Xuất nhãn huấn luyện (QT07)"** xuất file JSON chứa 1.420 nhãn kiểm định phục vụ MLOps.
  - Xóa bỏ file thừa `RegisterAIModelModal.tsx`.

### 2. Chuẩn hóa Chỉ số Sai số Kỹ thuật (`ValidationMetricsCards.tsx`)
- Gỡ bỏ hoàn toàn các badge hiển thị công thức toán học thô gây rối mắt.
- Chuẩn hóa 4 thẻ số liệu theo đúng chuẩn trắc địa `MET-12` & `RS05`:
  - **Mẫu Ghép cặp & Tỷ lệ Hợp lệ:** $N_{\text{used}} / N_{\text{sample}}$ và số mẫu bị loại trừ theo `BR-44`.
  - **Độ lệch Hệ thống (Bias):** Đơn vị $mm$.
  - **Sai số Tuyệt đối Trung bình (MAE):** Đơn vị $mm$, đối chiếu ngưỡng nghiệm thu $< 5.0 mm$.
  - **Sai số Căn bậc hai Toàn phương (RMSE):** Đơn vị $mm$.

### 3. Đồng bộ State Logic (`useSystemControlState.ts`)
- Quản lý state động cho danh mục khiếm khuyết: thêm mới, cập nhật, toggle active.
- Xử lý xuất tệp nhãn JSON huấn luyện đạt chuẩn `QT07`.
- Quản lý đóng/mở và binding dữ liệu cho `DefectCatalogModal`.

---

## III. KẾT QUẢ KIỂM THỬ E2E TRÌNH DUYỆT (BROWSER AUTOMATION TEST)

Kiểm thử tự động đã duyệt qua toàn bộ 14 màn hình của Supervisor:
1. `/sup/dashboard` $\rightarrow$ **PASS** (KPI cards, cảnh báo bảo hành, shortcuts).
2. `/sup/projects` $\rightarrow$ **PASS** (Tìm kiếm dự án, lọc tuyến).
3. `/sup/alignment` $\rightarrow$ **PASS** (Thẩm định tim tuyến GeoJSON, xác nhận tuyến).
4. `/sup/proposals` & `/sup/approvals/batch-001` $\rightarrow$ **PASS** (Thẩm duyệt đợt sửa, xác nhận Zero Money không có giá tiền).
5. `/sup/approvals/batch-001/reject` $\rightarrow$ **PASS** (Từ chối / Yêu cầu sửa đổi đợt sửa).
6. `/sup/acceptance` & `/sup/acceptance/batch-001` $\rightarrow$ **PASS** (Nghiệm thu đóng đợt hiện trường).
7. `/sup/field-tasks` $\rightarrow$ **PASS** (Nghiệm thu hiện trường, duyệt cứu hộ ngoại tuyến Q17).
8. `/sup/fast-track` $\rightarrow$ **PASS** (Bảng điều phối cấp bách).
9. `/sup/risk-analytics` & `/sup/signoff` $\rightarrow$ **PASS** (Ký đóng đợt & xuất file ZIP SHA-256).
10. `/sup/research-validation` $\rightarrow$ **PASS** (Chạy Job kiểm định, xuất CSV RPT-09, hiển thị Bias/MAE/RMSE mm).
11. `/sup/system-control`:
    - Tab AI Models: **PASS** (Xuất nhãn JSON QT07).
    - Tab Danh mục TCVN: **PASS** (Thêm khiếm khuyết mới, Sửa khiếm khuyết, Toggle Soft-Disable).
    - Tab Chính sách Fast-Track: **PASS** (Cấu hình ngưỡng).
    - Tab Pháp lý: **PASS** (Kích hoạt & Gỡ Legal Hold BR-45).
12. `/sup/audit-trail` $\rightarrow$ **PASS** (Nhật ký kiểm toán SHA-256).
13. `/sup/personnel` $\rightarrow$ **PASS** (Danh bạ nhân sự giám sát & thi công).

- **Video ghi hình phiên test:** `sup_full_e2e_deep_test_1791907554055.webp`
- **Kết quả Build & Typecheck:** `tsc -b && vite build` $\rightarrow$ **0 Errors, Build thành công trong 7.46s**.
