# Worklog: HOÀN THIỆN MÀN HÌNH BÁO CÁO PHÂN TÍCH RỦI RO & BẰNG CHỨNG SỐ (SUP-06 / RPT-06, RPT-07, BC04, BC05, BC07, BC09), CHUẨN HÓA BẢN ĐỒ GIS VÀ DỌN SẠCH CÁC TRƯỜNG DỮ LIỆU BỊA ĐẶT

- **Thời gian thực hiện:** 12/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 11 (`06_Report_Analytics_Requirements.md`), FR-34 (Dashboard & Timeline), FR-35 (Xuất & Lưu trữ hồ sơ), BC04 (Xem công trình rủi ro cao và hư hỏng phát triển nhanh), BC05 (So sánh liên dự án), BC06-BC09 (Xuất báo cáo, hồ sơ bằng chứng số kèm mã băm Checksum SHA-256).
  - 10 Điều bất biến (`AGENTS.md`): Điều 1 (Zero Money / Không tính toán giá tiền), Điều 2 (Chỉ Supervisor mới có quyền thẩm duyệt và xuất hồ sơ báo cáo cấp cao), Điều 5 (Geometry chuẩn GeoJSON WGS-84 EPSG:4326), Điều 10 (Màu vàng đồng `#C9A227` cho CTA xuất báo cáo).
  - Thiết kế Stitch tham khảo: Màn hình 13 (`13_WF10_Metrics13KPI_ReportExport_Async`).

---

## I. BỐI CẢNH VÀ VẤN ĐỀ TRƯỚC KHI THỰC HIỆN

Trong quá trình rà soát màn hình **Báo cáo Phân tích Rủi ro & Diễn biến Suy thoái** (`/sup/risk-analytics`, tương ứng với **BƯỚC SUP-06** trong tài liệu kiểm thử), phát hiện các vấn đề nghiêm trọng cần chuẩn hóa:

1. **Xuất hiện các trường và nút tự bịa (Hallucination tàn dư):**
   - Cột *"Kiến nghị bay Drone"* kèm nút toggle *"Đã kiến nghị / Kiến nghị bay"* (`survey_plan_suggested`) và API mock `toggleSurveyPlan` xuất hiện trong bảng dữ liệu và popup card. Đây là tính năng không hề có trong Spec v2.2 (việc lập kế hoạch bay drone KS01 là thẩm quyền riêng của PM tại `/pm/surveys/create`, Supervisor không can thiệp).
   - Tồn tại các trường bịa `severity_progression`, `recommended_action` và dòng chữ thừa *"Định mức kỹ thuật: TCVN 8819:2011 • TCVN 8864"* không có căn cứ API Backend thật.
2. **Bản đồ MapLibre GIS không hiển thị đường tim tuyến và dải phân đoạn:**
   - Bản đồ chỉ hiện 3 dấu chấm tròn đánh dấu vị trí (Marker HTML), hoàn toàn không vẽ đường tim tuyến chính và các dải màu phân đoạn suy thoái.
   - Nguyên nhân kỹ thuật:
     - Dùng sai tên sự kiện MapLibre: Code cũ đăng ký `map.on('style.load')` (sự kiện riêng của Mapbox GL JS v2+), trong khi MapLibre GL sử dụng `map.on('load')` và `map.on('styledata')`.
     - Vòng lặp re-render (Hook dependency loop): Callback `syncMapGeometry` bị đưa vào dependency array của hook khởi tạo bản đồ. Mỗi khi state dữ liệu hoặc phân đoạn chọn thay đổi, nhánh `else` lại gọi `map.setStyle()`, khiến MapLibre liên tục xóa sạch toàn bộ các layer và source GeoJSON vừa nạp.
3. **Trải nghiệm giao diện bị cồng kềnh và trùng lặp:**
   - Bảng đen nổi (HUD Card) ở góc trên bên trái bản đồ có kích thước lớn, che khuất tầm nhìn vệ tinh nhưng thiếu nút thu nhỏ (Minimize/Collapse).
   - Xuất hiện 2 bộ điều khiển Zoom In / Zoom Out bị trùng lặp trên cùng một khung bản đồ: Một bộ mặc định ở góc trên bên phải (`NavigationControl`) và một bộ nút custom ở góc dưới bên phải.
4. **Tài liệu kiểm thử bị gộp bước:**
   - Trong `DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`, các bước kiểm thử của Supervisor bị gộp chung hoặc thiếu rõ ràng về vai trò, đồng thời còn ghi nhận sai sót về nút "Kiến nghị bay".

---

## II. CHI TIẾT CÁC CẢI TIẾN VÀ KẾT QUẢ ĐẠT ĐƯỢC

### 1. Dọn sạch 100% trường dữ liệu và tính năng bịa đặt
- **Loại bỏ cột "Kiến nghị bay Drone":**
  - Xóa bỏ cột `<th>Kiến nghị bay Drone</th>` và ô `<td>` tương ứng trong bảng dữ liệu. Bảng chuẩn hóa về đúng **6 cột kỹ thuật nghiệp vụ**:
    1. *Lý trình & Phân đoạn* (Chainage display, vị trí, tóm tắt hư hỏng).
    2. *Mức độ rủi ro* (Rất cao / Cần theo dõi / Trung bình).
    3. *Khối lượng hư hỏng* (Diện tích $m^2$, chiều dài nứt $m$, chiều sâu $cm$, số vị trí mở).
    4. *Diễn biến đa kỳ (MET-13)* ($\Delta m^2$, tốc độ %/kỳ, so sánh với Baseline).
    5. *Hạn cam kết xử lý (SLA)* (Thời gian đếm ngược, mức độ ưu tiên).
    6. *Định vị* (Nút `my_location` đưa camera bay trúng phân đoạn).
  - Xóa bỏ nút "Kiến nghị bay" trên thẻ HUD card của bản đồ.
- **Xóa bỏ trường và Mock API thừa:**
  - File [`types.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/risk-analytics/types.ts): Xóa bỏ trường `survey_plan_suggested: boolean`.
  - File [`reportService.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/reportService.ts): Xóa bỏ method `toggleSurveyPlan`, xóa toàn bộ `survey_plan_suggested` trong `inMemoryRpt06Segments`.
  - File [`useRiskAnalyticsState.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/risk-analytics/useRiskAnalyticsState.ts) & [`RiskAnalytics.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/RiskAnalytics.tsx): Xóa bỏ hàm `handleToggleSurveyPlan`.

### 2. Sửa lỗi và nâng cấp hiển thị bản đồ GIS MapLibre
- **Khắc phục lỗi vòng đời bản đồ trong [`useRiskAnalyticsState.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/risk-analytics/useRiskAnalyticsState.ts):**
  - Tách riêng việc khởi tạo bản đồ chạy duy nhất 1 lần khi mount (`useEffect(..., [])`).
  - Lắng nghe đúng sự kiện `map.on('load')` của MapLibre GL.
  - Thêm cơ chế tự động đợi style tải xong: Nếu hàm `syncMapGeometry` được gọi khi style chưa sẵn sàng, tự động đăng ký `map.once('load', () => syncMapGeometry())` để đảm bảo GeoJSON luôn được vẽ sau khi map sẵn sàng.
  - Chuyển đổi giữa lớp **"Ảnh vệ tinh"** và **"Bản đồ số"** qua `map.setLayoutProperty()` thay vì gọi `map.setStyle()` $\rightarrow$ Các đường GeoJSON **không bao giờ bị xóa** khi đổi chế độ xem bản đồ.
- **Hiển thị đầy đủ 2 lớp hình học đường bộ:**
  - **Tim tuyến dự án (`project-mainline`):** Viền casing tối 8px (`#0F172A`) + Nét đứt kỹ thuật 4.5px màu xám `slate-400` (`#94A3B8`, dasharray `[3, 1.5]`) trải dài toàn bộ hành lang dự án, tương phản rõ trên nền ảnh vệ tinh.
  - **Các phân đoạn suy thoái (`risk-segments`):**
    - Lớp viền phát quang (glow halo) 14px tạo độ nổi bật.
    - Nét vẽ chính 6.5px theo đúng phân mức rủi ro: Đỏ `#E11D48` (CRITICAL - Rất cao), Cam `#F59E0B` (WATCH - Cần theo dõi), Xanh `#3B82F6` (MODERATE - Trung bình).
    - Phân đoạn đang chọn được bao quanh bởi viền đứt nét trắng 8.5px (`#FFFFFF`, dasharray `[2, 1]`).
  - Hỗ trợ tương tác 2 chiều: Bấm chuột trực tiếp vào đoạn đường trên bản đồ sẽ kích hoạt chọn phân đoạn trong bảng dữ liệu và ngược lại.

### 3. Tinh chỉnh giao diện theo phản hồi người dùng
- **Thêm nút Thu nhỏ / Mở rộng (Minimize/Collapse) cho HUD Card ([`RiskDeteriorationSection.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/risk-analytics/RiskDeteriorationSection.tsx)):**
  - Thêm state `isHudMinimized` và nút icon `unfold_less` / `unfold_more` ở góc card.
  - Khi thu nhỏ: Bảng rút gọn thành thanh ngang tinh gọn chỉ chứa Lý trình và Badge mức độ rủi ro, giải phóng 100% tầm nhìn bản đồ vệ tinh.
  - Khi mở rộng: Hiển thị đầy đủ diện tích $m^2$, tốc độ suy thoái, thời hạn SLA và mô tả khiếm khuyết.
- **Xóa bỏ cụm nút Zoom trùng lặp:**
  - Đã xóa bỏ `map.addControl(new maplibregl.NavigationControl(...), 'top-right')` của MapLibre.
  - Giữ lại duy nhất cụm nút custom ở góc dưới bên phải (bottom-right) được thiết kế đồng bộ với hệ thống: `+` (Phóng to), `-` (Thu nhỏ) và icon `crop_free` (Căn giữa toàn tuyến dự án).

### 4. Chuẩn hóa bộ 4 nút Nghiệp vụ Pháp lý & Hồ sơ bằng chứng số (BC06–BC09, FR-35)
Giải trình rõ ràng cơ chế hoạt động của 4 nút chính trên trang:
1. **"Tùy chỉnh thời gian" (`BC06`, `FR-34`):** Mở modal thiết lập khung thời gian chốt số liệu (`period_from` / `period_to`), cập nhật mốc `As-Of Date` cho toàn bộ KPI và số đo đa kỳ MET-13.
2. **"Xuất báo cáo tổng hợp" (`BC06`, `BC07`, `FR-35`):** Mở form khởi tạo Export Job ngầm (`POST /exports`), chọn loại hồ sơ (Hoàn công, Before/After, Trắc dọc GIS), tích chọn mã băm Checksum SHA-256 và kích hoạt Worker chạy nền bất đồng bộ (tránh treo trình duyệt khi đóng gói tệp nặng 100-200MB).
3. **"Tải gói ZIP" (`BC07`, `BC09`, `FR-35`):** Gọi API `GET /exports/{id}/download` để tải tệp `.zip` hoàn chỉnh gồm: Báo cáo PDF/A-1a, thư mục ảnh Before/After nguyên bản EXIF WGS-84, và tệp kê khai `checksum.sha256`.
4. **"Xem trước báo cáo PDF" (`BC08`, `BC09`, `US-16`):** Mở modal xem nhanh chứng từ tóm tắt, đối soát mã băm SHA-256 và chứng thư số Viettel-CA/TSA trước khi tải về máy.

### 5. Cập nhật tài liệu kiểm thử ([`DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md))
- Tách bạch độc lập thành 3 bước kiểm thử:
  - **BƯỚC SUP-06:** Giám sát Rủi ro Suy thoái & Xuất Hồ sơ Bằng chứng Kỹ thuật (`/sup/risk-analytics`).
  - **BƯỚC SUP-07:** Quản lý Danh mục & Đóng Dự án khi Hết hạn Bảo hành (`/sup/projects`).
  - **BƯỚC SUP-08:** Quản trị Hệ thống, Tài khoản & Kiểm toán (`/sup/settings`).
- Xóa bỏ hoàn toàn câu hướng dẫn bấm nút "Kiến nghị bay" ở bước SUP-06, thay bằng hướng dẫn xem trắc dọc GIS, định vị phân đoạn và xuất gói bằng chứng số.

---

## III. DANH SÁCH FILE ĐÃ THAY ĐỔI

1. `src/pages/(sup)/risk-analytics/RiskDeteriorationSection.tsx`: Xóa cột và nút kiến nghị bay; thêm nút thu nhỏ HUD card; chuẩn hóa bảng 6 cột.
2. `src/pages/(sup)/risk-analytics/useRiskAnalyticsState.ts`: Tách MapLibre lifecycle; sửa cơ chế load GeoJSON; xóa duplicate navigation control; xóa hàm `handleToggleSurveyPlan`.
3. `src/pages/(sup)/risk-analytics/types.ts`: Xóa bỏ trường `survey_plan_suggested`.
4. `src/pages/(sup)/risk-analytics/RiskHeader.tsx`: Nạp dropdown dự án động từ API; chuẩn hóa các nút tùy chỉnh thời gian và xuất báo cáo.
5. `src/pages/(sup)/RiskAnalytics.tsx`: Bỏ truyền prop `onToggleSurveyPlan`.
6. `src/api/services/reportService.ts`: Xóa bỏ method `toggleSurveyPlan` và các trường mock data `survey_plan_suggested`.
7. `docs/archive/DANH_MUC_CHUC_NANG_VA_CHI_TIET_MOCK_API.md`: Cập nhật mô tả bước SUP-06 chuẩn theo spec v2.2, tách bước SUP-06/07/08.
8. `docs/worklogs/WEB-sup06-risk-analytics-refactor-20261012.md`: Ghi chép chi tiết toàn bộ nội dung công việc.

---

## IV. TRẠNG THÁI KIỂM TRA & SẴN SÀNG
- Build & Lint: Vite React 19 TypeScript biên dịch không có lỗi.
- Dev server: Đang chạy ổn định trên cổng 3000.
- Mã nguồn đã sẵn sàng bàn giao và commit lên nhánh `hoang`.
