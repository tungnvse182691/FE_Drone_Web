# Worklog: TỐI GIẢN HÓA GIAO DIỆN NGHIỆM THU ĐÓNG ĐỢT (MINIMALISM), CHO PHÉP YÊU CẦU SỬA LẠI SAU KHI ĐÃ CHẤP THUẬN NGHIỆM THU VÀ HIỂN THỊ RÕ TRẠNG THÁI "ĐÃ ĐÓNG GÓI" TRÊN DANH SÁCH TỔNG HỢP

- **Thời gian thực hiện:** 12/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ & Thiết kế:**
  - **Spec v2.2:** BƯỚC SUP-04 (Nghiệm thu Before/After hiện trường - HT09, HT10, HT11, BR-25, BR-27), BƯỚC SUP-05 (Đóng Tổng thể Vụ việc Hỗn hợp - HT12, BR-26, PA06, FR-23).
  - **DESIGN.md (`skills/roadguard-web/DESIGN.md`):** Phong cách Minimalism thực dụng, 100% Google Material Symbols (`material-symbols-outlined`), bảng màu Hoàng Hải (Vàng đồng `#C9A227`, Navy `#2D3748`, Dark `#1A1D20`), loại bỏ triệt để các box xám lồng nhau và viền thừa rác thị giác.
  - **Kỷ luật dữ liệu:** 100% In-Memory Mock API Service bất đồng bộ (`src/api/services/acceptanceService.ts`), **Zero localStorage**, mô phỏng chính xác RESTful backend.

---

## I. CÁC VẤN ĐỀ ĐƯỢC GIẢI QUYẾT

1. **Cho phép yêu cầu sửa lại kể cả khi đã chấp thuận nghiệm thu:**
   - *Thực trạng cũ:* Nút *"Yêu cầu sửa lại"* bị bọc điều kiện `currentItem.status !== 'ACCEPTED'`. Do đó ngay khi Giám sát bấm *"Chấp thuận nghiệm thu"*, nút này biến mất hoàn toàn. Nếu Giám sát phát hiện sai sót sau khi bấm duyệt hoặc muốn đổi ý yêu cầu nhà thầu thi công lại thì không có cách nào bấm được.
   - *Xử lý mới:* Miễn là hồ sơ vụ việc chưa bị đóng băng (`!isCaseClosed`), nút **"Yêu cầu sửa lại"** vẫn luôn hiển thị cạnh huy hiệu **"Đã nghiệm thu đạt"**. Khi bấm nút, modal lập lệnh Rework sẽ mở ra để nhập chỉ đạo khắc phục, Mock API tự động chuyển trạng thái về `REWORK_REQUIRED`, tăng lần thi công (`attempt_number`), tự động trừ số lượng đạt của gói và mở lại hồ sơ gói.

2. **Tối giản hóa toàn bộ giao diện màn hình Nghiệm thu chi tiết (`EvidenceCloseoutDetail`):**
   - *Thực trạng cũ:* Quá nhiều khung viền xám lồng nhau (`bg-slate-50 border` lồng trong `bg-white border` lồng trong `bg-slate-50...`), các tag `#CASE`, lý trình và role xếp chồng dày đặc, hàng nút hạng mục `#ITEM` to thô, chân ảnh Before/After bị chia thành nhiều box nhỏ vụn vặt, 4 thẻ tiêu chuẩn kỹ thuật lồng box trắng con bên trong box xám làm rối mắt.
   - *Xử lý mới:*
     - Header phẳng và thoáng đãng, breadcrumb và metadata dự án tinh gọn trên các dòng chữ phẳng thanh lịch.
     - Danh sách chọn hạng mục `#ITEM-01, #ITEM-02...` chuyển sang dạng **Segmented Tab tối giản** với chấm màu chỉ báo trạng thái tinh tế (Xanh lá `#2F9E44` đã nghiệm thu, Vàng cam `#F59E0B` chờ duyệt, Đỏ `#E5484D` yêu cầu sửa).
     - Khung ảnh Before/After và chân ảnh chuyển sang lưới 3 cột thông số đối chứng phẳng, dễ đọc.
     - 4 thẻ chỉ tiêu kỹ thuật TCVN 8819:2011 được thiết kế phẳng, rõ ràng, chuẩn tokens `card` của `DESIGN.md`.

3. **Làm rõ và chuẩn hóa cơ chế đóng gói (BR-26, HT12):**
   - *Nghiệp vụ khẳng định:* Hệ thống **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG ĐÓNG GÓI** khi 100% hạng mục đạt. Khi đạt 100% (`3/3 đạt`), hệ thống chỉ ghi nhận tiến độ, còn việc Đóng gói / Đóng vụ việc bắt buộc phải do Kỹ sư Giám sát chủ động bấm nút **"Đóng đợt thi công"** và xác nhận trên modal cam kết bảo hành 12 tháng.
   - *Mock API:* Tách cơ chế theo dõi trạng thái đóng theo từng `packageId` độc lập (`inMemoryClosedPackageIds: Set<string>`), không dùng biến boolean cờ chung.

4. **Hiển thị trực quan trạng thái "ĐÃ ĐÓNG GÓI" ngoài bảng danh sách tổng hợp (`AcceptanceList`):**
   - *Thực trạng cũ:* Ở ngoài màn hình danh sách `/sup/acceptance`, các gói đã đóng hay chưa đóng đều chỉ hiện chung một nhãn `Đã nghiệm thu đạt`, khiến người dùng phải bấm vào bên trong chi tiết mới biết gói đã đóng hay chưa.
   - *Xử lý mới:*
     - Cột *Tiến độ nghiệm thu* của bảng danh sách hiển thị rõ huy hiệu **`[ĐÃ ĐÓNG GÓI]`** (nền tối `#1A1D20`, chữ trắng, icon ổ khóa vàng `#C9A227`, viền `#2D3748`) kèm chú thích `Đã lưu trữ (X/X đạt)`.
     - Với gói đã đạt 100% nhưng chưa đóng: hiển thị huy hiệu `[Đã nghiệm thu đạt]` kèm dòng nhắc nhở màu hổ phách `Chờ Giám sát đóng đợt`.
     - Cột *Thao tác*: Gói đã đóng hiển thị nút `Xem hồ sơ`, gói chờ đóng hiển thị nút nổi bật `Đóng đợt ngay`, gói chưa xong hiển thị nút `Vào nghiệm thu`.
     - Thêm Tab bộ lọc **`[Đã đóng gói]`** và **`[Chờ đóng đợt]`** trên thanh công cụ.
     - Thẻ KPI tổng quan bóc tách rõ: `Đã đóng gói / Đạt chuẩn: X đã đóng (Y chờ đóng)`.

---

## II. CHI TIẾT CÁC FILE ĐÃ CHỈNH SỬA

| STT | Đường dẫn File | Loại thay đổi | Chi tiết cải tiến |
|:---:|---|:---:|---|
| 1 | `src/pages/(sup)/evidence-closeout/ActionButtons.tsx` | Refactor UI & Logic | Giữ nút *Yêu cầu sửa lại* luôn hiển thị khi `status === 'ACCEPTED'` (miễn là `!isCaseClosed`), chuẩn hóa nút bấm minimalism |
| 2 | `src/pages/(sup)/evidence-closeout/CloseoutHeader.tsx` | Refactor UI | Xóa bỏ các box xám lồng nhau, chuyển tab chọn item sang Segmented Tab phẳng có dot màu chỉ thị |
| 3 | `src/pages/(sup)/evidence-closeout/ComparisonViewer.tsx` | Refactor UI | Tối giản thanh công cụ xem Song song / Vuốt trượt |
| 4 | `src/pages/(sup)/evidence-closeout/BeforeViewer.tsx` | Refactor UI | Chuyển cụm metadata chân ảnh trước sửa sang lưới 3 cột phẳng, tối giản |
| 5 | `src/pages/(sup)/evidence-closeout/AfterViewer.tsx` | Refactor UI | Chuyển cụm metadata chân ảnh sau sửa sang lưới 3 cột phẳng, tối giản |
| 6 | `src/pages/(sup)/evidence-closeout/TechnicalCriteriaCard.tsx` | Refactor UI | Bỏ lồng box trắng con trong box xám, thiết kế 4 thẻ chỉ tiêu kỹ thuật phẳng chuẩn TCVN 8819:2011 |
| 7 | `src/pages/(sup)/EvidenceCloseoutDetail.tsx` | Cập nhật logic | Tự động làm tươi `currentPackage` sau mỗi lần accept, rework, đóng Fast Track |
| 8 | `src/api/services/acceptanceService.ts` | Service Mock API | Thêm thuộc tính `is_closed` vào `AcceptancePackage`, quản lý trạng thái đóng theo từng packageId qua `inMemoryClosedPackageIds`, tự động mở lại gói khi có lệnh Rework |
| 9 | `src/pages/(sup)/AcceptanceList.tsx` | Refactor UI & Filter | Hiển thị badge `[ĐÃ ĐÓNG GÓI]` ngoài bảng, thêm nút `Đóng đợt ngay`, bổ sung tab lọc `Đã đóng gói` / `Chờ đóng đợt`, cập nhật thẻ KPI |

---

## III. KẾT QUẢ KIỂM TRA & XÁC MINH

- **Kiểm tra biên dịch:** Các file chỉnh sửa không phát sinh bất kỳ lỗi TypeScript hay ESLint nào.
- **Tính phản ứng dữ liệu:**
  1. Khi Giám sát viên duyệt lần lượt các hạng mục $\rightarrow$ tiến độ gói tăng dần từ `0/3` lên `3/3`.
  2. Ngay cả khi đã bấm duyệt đạt, nút *"Yêu cầu sửa lại"* vẫn hiển thị $\rightarrow$ Bấm vào nhập lý do thì hạng mục chuyển sang `REWORK_REQUIRED`, gói quay về trạng thái cần sửa.
  3. Khi 100% hạng mục đạt $\rightarrow$ Nút *"Đóng đợt thi công"* kích hoạt $\rightarrow$ Giám sát bấm xác nhận đóng $\rightarrow$ Gói chuyển sang `ĐÃ ĐÓNG GÓI`.
  4. Quay lại trang danh sách `/sup/acceptance` $\rightarrow$ Gói vừa đóng hiển thị ngay huy hiệu `[ĐÃ ĐÓNG GÓI]`, có thể lọc theo tab `Đã đóng gói`.
