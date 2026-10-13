# Worklog: CHUẨN HÓA HỘP THƯ TIẾP NHẬN AI, SỬA LỖI GÁN DỰ ÁN & LÀM RÕ NGHIỆP VỤ ĐỘ SÂU THỰC ĐỊA (PM-07, AI01, AI04, FR-12)

- **Thời gian thực hiện:** 13/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 2 (`04_Use_Cases.md` - AI01, AI04), `02_Business_Rules.md` (BR-01, BR-02, BR-39), `01_Functional_Requirements.md` (FR-12, FR-13).
  - 10 Điều bất biến (`AGENTS.md`): Điều 1 (Zero Money / Không tính toán giá tiền), Điều 10 (Màu vàng đồng `#C9A227` làm điểm nhấn thương hiệu Hoàng Hải, phong cách Minimalism, Material Symbols).
  - Nghiệp vụ khảo sát hạ tầng: Drone AI bay chụp ảnh trên không chỉ ghi nhận hình ảnh 2D (khung Bounding Box, ước tính diện tích bề mặt $m^2$), **AI không thể tự đo độ sâu ($cm$)**. Độ sâu lún võng / ổ gà bắt buộc phải do Đội hiện trường đo đạc bổ sung bằng thước cơ/laser chuyên dụng (`MEASURE_ONLY`).

---

## I. MỤC TIÊU VÀ BỐI CẢNH NGHIỆP VỤ

Trong quá trình Chỉ huy trưởng (Project Manager - PM) trực tiếp thao tác tại màn hình **Hộp thư tiếp nhận lỗi AI & Phản ánh cộng đồng** (`/pm/ai-inbox`), hệ thống xuất hiện một số bất cập về mặt trải nghiệm và sự sai lệch trong hiểu biết nghiệp vụ:

1. **Nút "Gán vào dự án" (Triage Case) bấm không có phản hồi:** PM muốn chuyển một ca phản ánh từ trạng thái chờ sang một dự án bảo hành cụ thể nhưng bấm nút không mở được modal gán dự án.
2. **Giao diện còn vướng mã rác kỹ thuật (PA03, PA04, PA05, BR-39):** Các text mã số nội bộ từ bản đặc tả spec kỹ thuật vô tình bị đưa ra màn hình người dùng, gây khó hiểu và làm rối mắt người vận hành.
3. **Hiển thị độ sâu hư hỏng bị sai bản chất công nghệ Drone:** Drone chụp ảnh 2D từ trên cao không thể có thông số độ sâu ($cm$) chính xác của ổ gà/lún sụt. Việc hiển thị "AI ước tính độ sâu: 5cm" gây hiểu lầm nghiêm trọng về năng lực của thiết bị bay Drone và làm sai lệch quy trình kỹ thuật.
4. **Nút "Xem / Ẩn báo cáo đã gộp" bấm không có tác dụng:** Bảng danh sách phản ánh người dân có hiển thị số lượng báo cáo trùng lặp đã gộp (Master-Tree), nhưng khi PM bấm nút thì danh sách các báo cáo con không mở ra để kiểm tra đối chiếu.
5. **Hiển thị chỉ số độ tin cậy AI (AI Confidence Score) bị trùng lặp:** Chỉ số độ tin cậy AI xuất hiện ở nhiều nơi (cả cột danh sách, cả thẻ bên phải, cả trên ảnh chụp Drone), gây phân tâm cho người thẩm định.

---

## II. CHI TIẾT CÁC THAY ĐỔI & CẢI TIẾN ĐÃ THỰC HIỆN

### 1. Khắc Phục Lỗi Nút "Gán vào dự án" (Triage Project Modal)
- **Nguyên nhân kỹ thuật:** Trong custom hook `useAIReviewState.ts`, modal gán dự án sử dụng state `isTriageModalOpen` từ `linkActions`. Tuy nhiên, nút bấm trên thanh hành động và danh sách ca lại kích hoạt handler `actions.onTriageProject` vốn điều khiển một state riêng biệt, dẫn đến hiện tượng bất đồng bộ (state desync) khiến modal không bao giờ mở lên.
- **Giải pháp xử lý:** Đồng bộ hóa toàn bộ cơ chế mở modal gán dự án qua `linkActions.openTriageModal()`. Bổ sung hàm tiện ích trực tiếp trong `useAIReviewActions.ts` và truyền đúng state `isTriageModalOpen`, `triageTargetCase`, `handleConfirmTriage` xuống `TriageProjectModal.tsx`.
- **Kết quả:** PM click nút "Gán vào dự án" ở bất kỳ đâu (danh sách bảng, drawer chi tiết, thanh hành động hàng loạt) đều lập tức mở modal chọn dự án mượt mà.

### 2. Dọn Dẹp Triệt Để Mã Rác Kỹ Thuật (PA03, PA04, PA05, BR-39) Theo Phong Cách Minimalism
- Loại bỏ hoàn toàn các chuỗi text mã spec nội bộ không có ý nghĩa với người dùng cuối:
  - `DrawerReporterInfo.tsx`: Xóa bỏ nhãn `PA03 / BR-39`, thay bằng hiển thị trực quan thông tin kênh tiếp nhận (`Cổng Dịch vụ công / Ứng dụng người dân`).
  - `TriageProjectModal.tsx`: Chuyển đổi tiêu đề từ *"Điều phối ca (PA03 / BR-39)"* thành tiêu đề nghiệp vụ thân thiện *"Gán ca hư hỏng vào dự án bảo hành"*.
  - `BatchActionBar.tsx`: Xóa bỏ các mã nút gộp/phê duyệt rác.
  - `LinkReportsModal.tsx`, `NoDefectModal.tsx`, `DrawerFooter.tsx`, `DrawerDecisionForm.tsx`, `DrawerDecisionBanners.tsx`, `RequestSurveyModal.tsx`: Toàn bộ các câu thông báo, nút bấm, placeholder đều được Việt hóa và chuẩn hóa văn phong công trường xây dựng đường bộ.

### 3. Chuẩn Hóa & Làm Rõ Nghiệp Vụ Đo Độ Sâu (Depth Measurement)
- **Bản chất công nghệ:** Thiết bị bay Drone chụp ảnh quang học RGB từ trên cao chỉ cung cấp ảnh 2D. Thuật toán nhận diện vật thể AI (YOLO/Detectron) chỉ xác định được tọa độ Bounding Box và diện tích bề mặt ($m^2$). Drone **hoàn toàn không thể tự đo độ sâu ($cm$)**.
- **Quy trình chuẩn hóa:**
  - Đối với các ca hư hỏng mới do Drone AI phát hiện, độ sâu ban đầu bắt buộc phải là `0 cm` (trạng thái `Chưa đo đạc`).
  - Để có số đo độ sâu phục vụ tính khối lượng cào bóc thảm lại ($m^3$), PM phải điều phối nhiệm vụ đo đạc thực địa (`MEASURE_ONLY`) cho cán bộ hiện trường dùng thước đo cơ học hoặc máy đo laser tại chỗ.
- **Cập nhật trên giao diện:**
  - Xóa bỏ dòng *"AI ước tính độ sâu: X cm"* trong `DrawerDecisionForm.tsx`.
  - Cập nhật ô nhập độ sâu: Hiển thị badge rõ ràng `Chưa đo đạc`, placeholder `Chưa có số đo (Chờ đo thực địa)` kèm dòng chú thích minh bạch: *"Drone AI chỉ quét ảnh 2D • Số đo độ sâu do hiện trường đo đạc bằng thước cơ/laser"*.
  - Reset toàn bộ dữ liệu mock trong `src/data/mockData.ts` và `triageService.ts` đối với các ca hư hỏng do Drone AI mới quét (`cas-01`, `cas-02`, `cas-03`, `cas-04`) về `max_depth_cm = 0`.

### 4. Khắc Phục Tính Năng "Xem / Ẩn báo cáo đã gộp" (Master-Tree)
- **Nguyên nhân kỹ thuật:** Trước đây, logic render danh sách ca con phụ thuộc vào việc tìm kiếm các ca có `parent_case_id` trong danh sách gốc. Tuy nhiên trong dữ liệu thực tế, các báo cáo trùng lặp từ người dân được lưu trong mảng `cluster_duplicates` của ca chính (Master Report), dẫn đến việc `childReports` luôn trả về mảng rỗng và nút bấm không hiển thị bất kỳ dòng nào.
- **Giải pháp xử lý:** Trong `CitizenTriageTable.tsx`, hoàn thiện cơ chế fallback thông minh: Khi không tìm thấy ca con độc lập, hệ thống tự động bóc tách từ `cluster_duplicates` để hiển thị đầy đủ các dòng con thụt lề `CitizenTriageChildRow.tsx`.
- **Kết quả:** Khi bấm "Xem X báo cáo đã gộp", cây danh sách bung ra mượt mà, hiển thị rõ ràng thông tin người báo, thời gian, vị trí và ảnh chụp của từng người dân để PM đối chiếu.

### 5. Tối Ưu Hóa Hiển Thị Chỉ Số Độ Tin Cậy AI (AI Confidence Score)
- Xóa bỏ thẻ hiển thị độ tin cậy AI trùng lặp ở cột phải và xóa các badge gây rối mắt trên từng dòng danh sách ngoài bảng (`CitizenTriageRow.tsx`).
- Tập trung hiển thị duy nhất và trực quan ngay trên hình ảnh khảo sát Drone với nhãn tiếng Việt rõ ràng:
  `Độ tin cậy AI: 94% • Ổ gà sâu nguy hiểm (POTHOLE)`.
- Giúp màn hình thẩm định đạt chuẩn phong cách Minimalism, tập trung cao độ vào việc đánh giá hiện trạng hư hỏng thực tế.

### 6. Cập Nhật Tuyến Điều Phối Khẩn Cấp (Fast-Track Dispatch) & Drone Simulator
- Chuẩn hóa các bộ lọc và hành động điều phối nhanh các ca hư hỏng nghiêm trọng nguy cơ mất an toàn giao thông cao.
- Nâng cấp modal mô phỏng Drone bay khảo sát (`DroneSimulatorModal.tsx`) hỗ trợ tạo và cập nhật trạng thái chuyến bay tự động.

---

## III. DANH MỤC CÁC FILE ĐÃ SỬA ĐỔI

| STT | Đường dẫn file | Mô tả thay đổi |
|:---:|---|---|
| 1 | `src/pages/(pm)/ai-review/useAIReviewState.ts` | Khắc phục desync state giữa linkActions và actions, đồng bộ mở modal gán dự án |
| 2 | `src/pages/(pm)/ai-review/useAIReviewActions.ts` | Bổ sung handler mở modal gán dự án `openTriageModal`, dọn dẹp mã rác |
| 3 | `src/pages/(pm)/ai-review/useAIReviewLinkActions.ts` | Chuẩn hóa nghiệp vụ gán dự án và liên kết hồ sơ |
| 4 | `src/pages/(pm)/ai-review/TriageProjectModal.tsx` | Dọn dẹp mã PA03/BR-39, đổi tiêu đề thân thiện, tối ưu trải nghiệm gán dự án |
| 5 | `src/pages/(pm)/ai-review/DrawerReporterInfo.tsx` | Xóa bỏ PA03, hiển thị kênh tiếp nhận thực tế |
| 6 | `src/pages/(pm)/ai-review/DrawerDecisionForm.tsx` | Xóa bỏ "AI ước tính độ sâu", minh bạch hóa quy trình Drone 2D và đo thước thực địa |
| 7 | `src/pages/(pm)/ai-review/CitizenTriageTable.tsx` | Sửa logic bung/gập cây ca con `childReports` từ `cluster_duplicates` |
| 8 | `src/pages/(pm)/ai-review/CitizenTriageRow.tsx` | Tối ưu hiển thị, dọn dẹp các badge độ tin cậy AI dư thừa |
| 9 | `src/pages/(pm)/ai-review/CitizenTriageChildRow.tsx` | Hiển thị chi tiết dòng báo cáo con đã gộp theo dạng cây thụt lề |
| 10 | `src/pages/(pm)/ai-review/DrawerMediaViewer.tsx` | Việt hóa thẻ độ tin cậy AI trên ảnh Drone (`Độ tin cậy AI: 94%`) |
| 11 | `src/pages/(pm)/ai-review/BatchActionBar.tsx` | Dọn dẹp mã kỹ thuật rác, chuẩn hóa các nút hành động hàng loạt |
| 12 | `src/pages/(pm)/ai-review/DrawerFooter.tsx` | Chuẩn hóa các nút phê duyệt / từ chối ca tiếp nhận |
| 13 | `src/pages/(pm)/ai-review/DrawerDecisionBanners.tsx` | Chuẩn hóa các thông báo kết quả thẩm định |
| 14 | `src/pages/(pm)/ai-review/LinkReportsModal.tsx` | Dọn dẹp mã PA04, chuẩn hóa modal liên kết báo cáo trùng |
| 15 | `src/pages/(pm)/ai-review/NoDefectModal.tsx` | Dọn dẹp mã PA05, chuẩn hóa modal đóng ca không có hư hỏng |
| 16 | `src/pages/(pm)/ai-review/RequestSurveyModal.tsx` | Chuẩn hóa modal yêu cầu bay khảo sát bổ sung |
| 17 | `src/pages/(pm)/ai-review/ReviewDetailDrawer.tsx` | Tối ưu trải nghiệm xem chi tiết ca tiếp nhận |
| 18 | `src/data/mockData.ts` | Reset `max_depth_cm = 0` cho các ca Drone mới quét (chờ đo thực địa) |
| 19 | `src/api/services/triageService.ts` | Chuẩn hóa service tiếp nhận và gán ca vào dự án |
| 20 | `src/pages/(pm)/fast-track/*` | Chuẩn hóa bộ lọc và thanh hành động tuyến điều phối khẩn cấp Fast-Track |
| 21 | `src/pages/(pm)/surveys/*` | Nâng cấp bảng khảo sát và modal mô phỏng Drone bay tự động |

---

## IV. KẾT QUẢ KIỂM THỬ

- **TypeScript Compilation:** Đã kiểm tra qua `npx tsc --noEmit`, đạt **0 lỗi** (exit code 0).
- **Vite Local Dev Server:** Ứng dụng chạy mượt mà, không phát sinh cảnh báo hay ngoại lệ runtime.
- **Kiểm thử hành vi người dùng:**
  - Nút "Gán vào dự án" mở modal lập tức, chọn dự án và lưu thành công.
  - Không còn bất kỳ mã nội bộ rác nào xuất hiện trên giao diện.
  - Trường độ sâu hiển thị minh bạch `Chưa đo đạc (Chờ đo thực địa)`, đúng 100% bản chất thiết bị bay Drone 2D.
  - Nút xem báo cáo đã gộp mở rộng/thu gọn cây báo cáo mượt mà.
