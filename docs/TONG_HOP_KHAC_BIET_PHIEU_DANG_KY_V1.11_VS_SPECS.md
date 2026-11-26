# SO SÁNH KHÁC BIỆT GIỮA TÀI LIỆU SPECS (29_9) VÀ PHIẾU ĐĂNG KÝ ĐỒ ÁN (V1.11)
### *Phạm vi: Các yêu cầu nghiệp vụ và kỹ thuật dành cho Frontend Web (PM & Supervisor)*

> **Nguồn tài liệu đối chiếu:**  
> 1. **Tài liệu SPECS cũ:** Thư mục `docs/specs/29_9/` (`01_FRD_SRS.md`, `02_Business_Rules.md`, `04_Use_Cases.md`, `operation_catalog.md`).  
> 2. **Phiếu đăng ký đồ án tốt nghiệp:** `Phieu_FA26SE219_Black_Format.docx` (Bản cập nhật v1.11 ngày 14/10/2026 — Trưởng nhóm Vũ Hoàng Anh).  
> *(Lưu ý: Đã loại trừ hoàn toàn vai trò Reporter vì thuộc phạm vi Mobile).*

---

## 📌 I. BẢNG TỔNG HỢP SO SÁNH ĐỐI CHIẾU

| STT | Hạng mục nghiệp vụ FE Web | Quy định trong SPECS (`docs/specs/29_9`) | Quy định trong PHIẾU ĐĂNG KÝ (v1.11) | Khác biệt bản chất dành cho FE Web |
|:---:|---|---|---|---|
| **01** | **Tên hệ thống & Thương hiệu** | Tên hệ thống được gọi là **`RoadGuard`** xuyên suốt tài liệu. | Đổi tên chính thức thành: **`HoangHaiWarrantySystem`** (Hệ thống kiểm tra khuyết tật và quản lý bảo hành đường giao thông nông thôn ứng dụng Drone, AI và GIS). | Tiêu đề, nhãn thương hiệu, logo hiển thị trên giao diện Web Dashboard đổi từ `RoadGuard` sang **`HoangHaiWarrantySystem`**. |
| **02** | **Loại dữ liệu khảo sát Drone nộp lên Web** | Đề cập đến ảnh chụp trực giao (**Orthomosaic**), mô hình độ cao **DSM/DTM** (OpenDroneMap) hoặc các gói ảnh tĩnh rời rạc. | Tuyên bố dứt khoát **Ngoài phạm vi (Out of Scope)**: *Không làm Orthomosaic, DSM/DTM, SfM và tái dựng quang trắc 3D*. Dữ liệu nộp gồm: **Tệp Video ($mp4 \le 8\text{GB}$) + Tệp viễn thám ($SRT / GPS \le 10\text{MB}$)**. | Web không quản lý/hiển thị tệp ảnh trực giao GeoTIFF hay bản đồ 3D; Web tiếp nhận và quản lý theo cặp: **Video $mp4$ + Telemetry $SRT$** gắn theo phân đoạn bay. |
| **03** | **Khả năng và dữ liệu hiển thị của AI trên Web** | Một số mô tả đề cập AI phân tích ảnh và ước lượng diện tích hư hỏng ($m^2$), độ sâu ($cm$), kích thước nứt lún. | Tuyên bố **Ngoài phạm vi (Out of Scope)**: *AI không ước lượng kích thước thực của khuyết tật (kể cả quy đổi GSD)*. AI (FastAPI YOLO) chỉ trả về **Bounding Box $[0, 1]$** trên khung hình video tại thời điểm $t$, class và độ tin cậy. | Giao diện thẩm định lỗi trên Web **không có trường diện tích/kích thước do AI tính**; chỉ hiển thị Bounding Box định vị trên khung hình video kèm mức độ tin cậy ($confidence$). |
| **04** | **Nguồn gốc số đo kích thước hư hỏng** | Chưa phân tách chặt chẽ, dễ hiểu nhầm là hệ thống tự tính hoặc PM tự nhập ước lượng trên Web. | **Quy định bất biến:** Mọi kích thước khuyết tật (dài, rộng, sâu) hiển thị trên hệ thống bắt buộc là **số đo vật lý thực tế do Repair Crew trực tiếp cầm thước đo ngoài hiện trường nộp về**. | Mọi bảng số liệu kích thước trên Web (chi tiết lỗi, phương án kỹ thuật đợt sửa) phải gắn với xuất xứ: **"Số đo thực địa do Đội hiện trường xác nhận"** kèm ảnh chụp thước đo. |
| **05** | **Cơ chế xử lý ứng viên lỗi AI của PM (Candidate Triage)** | Chỉ có trạng thái Duyệt (Approve/Accept) để tạo lỗi hoặc Hủy bỏ (Reject). | Quy định rõ **3 hành động độc lập của PM**: <br>1. **`KEEP_NEW`**: Giữ thành sự cố mới.<br>2. **`LINK_EXISTING`**: Gộp vào sự cố đã có trên cùng phân đoạn (tránh trùng lặp khi drone quay nhiều góc).<br>3. **`REJECT`**: Bác bỏ phát hiện giả (False positive). | Web bổ sung luồng **"Gộp vào sự cố cũ (`LINK_EXISTING`)"** bên cạnh tạo mới và bác bỏ, giúp PM xử lý các góc quay trùng của cùng một ổ gà/vết nứt. |
| **06** | **Trọng tâm quy trình sửa chữa cho MVP** | Quy trình Sửa chữa thông thường (Normal) và Sửa nhanh (Fast Track) được mô tả song song, chi tiết hóa ngang nhau. | **MVP ưu tiên tối thượng vòng đời NORMAL đầy đủ**: Khởi tạo $\rightarrow$ AI phát hiện $\rightarrow$ PM xác minh $\rightarrow$ Crew đo đạc $\rightarrow$ PM lập đợt NORMAL $\rightarrow$ Supervisor duyệt $\rightarrow$ PM giao việc $\rightarrow$ Crew nộp Before/After $\rightarrow$ PM đánh giá $\rightarrow$ Supervisor nghiệm thu cuối. Fast Track thuộc giai đoạn mở rộng cho lỗi nhỏ lẻ đủ policy. | Trên Web, toàn bộ luồng trình duyệt và nghiệm thu đợt sửa tập trung chuẩn chỉ vào **luồng NORMAL**. Nghiêm cấm đưa hư hỏng nặng vào luồng Fast Track. |
| **07** | **Bộ chỉ số thẩm định mô hình AI & Hiệu quả (RQ1 & RQ2)** | Đo đạc sai số kích thước hình học $mm$ ($Bias, MAE, RMSE$) giữa kích thước AI ước lượng và Ground Truth. | **RQ1** đánh giá YOLO bằng: **$\text{mAP@0.5}$, $\text{mAP@0.5:0.95}$, $\text{Precision}$, $\text{Recall}$, $\text{F1-score}$** trên 3 lớp (*pothole, crack, spalling*) và sai số định vị GPS khung hình ($m$).<br>**RQ2** đánh giá hiệu quả vận hành: **Thời gian (giờ), Công sức (người-phút), Độ bao phủ khuyết tật và Độ truy vết bằng chứng**. | Web Dashboard thẩm định mô hình chuyển từ đo sai số kích thước vật lý $mm$ sang hiển thị **các chỉ số nhận diện thị giác máy tính ($\text{mAP}, \text{Precision}, \text{Recall}, \text{F1}$)** và **thống kê so sánh công sức/thời gian RQ2**. |
| **08** | **Cấu trúc hình học tuyến đường trên Web GIS** | Mô tả tim tuyến đường thẳng đơn giản theo hệ trục cọc Km tuyến tính. | Hệ thống hóa mạng lưới đường bê tông nông thôn: Quản lý theo **Tuyến chính (`MAIN`)** và **Tuyến nhánh (`BRANCH`)**, chia nhỏ thành **Phân đoạn khảo sát (`Segment / Section 100m`)**, Web GIS dùng **MapLibre**. | Bản đồ Web GIS hiển thị phân cấp mạng lưới tuyến chính / nhánh rẽ và trực quan hóa các ranh giới phân đoạn $100m$ để phục vụ phân công bay và định vị lỗi. |

---

## 🔍 II. CHI TIẾT CÁC ĐIỂM KHÁC BIỆT TRỌNG TÂM

### 1. Dữ liệu khảo sát Drone: Video + Telemetry SRT thay vì Orthomosaic
* **SPECS (29_9):** Có các yêu cầu về xử lý ảnh trực giao (Orthomosaic), tích hợp công cụ OpenDroneMap để dựng bình đồ trực giao và bản đồ độ cao số (DSM/DTM).
* **PHIẾU ĐĂNG KÝ (v1.11):** 
  * Tuyên bố rõ ràng: **Ngoài phạm vi dự án** là các công nghệ *Orthomosaic, DSM/DTM, SfM và tái dựng quang trắc 3D*.
  * Chuẩn hóa đầu vào khảo sát của Drone: Chỉ sử dụng **Video góc nhìn thẳng/nghiêng ($mp4$)** kết hợp **Tệp phụ đề viễn thám ($SRT$)** chứa tọa độ GPS và độ cao theo từng giây.
* **Ý nghĩa đối với FE Web:**
  * Màn hình quản lý khảo sát trên Web không cần module hiển thị bản đồ trực giao nặng nề dạng GeoTIFF/TileServer riêng biệt.
  * Web thiết kế form tiếp nhận khảo sát theo phân đoạn, quản lý cặp tệp: Video ($mp4$) và Telemetry ($SRT$).

---

### 2. Bản chất hiển thị của AI: Bounding Box nhận diện, không đo kích thước vật lý
* **SPECS (29_9):** Từng dự kiến AI trích xuất ảnh và tính toán luôn diện tích nứt ($m^2$), độ sâu ($cm$), khối lượng hư hỏng để đưa vào bảng dự toán kỹ thuật.
* **PHIẾU ĐĂNG KÝ (v1.11):** 
  * Xác định rõ ranh giới kỹ thuật: **AI (FastAPI YOLO) không ước lượng kích thước vật lý thực tế của khuyết tật** (kể cả phương pháp quy đổi qua GSD - Ground Sampling Distance). AI chỉ nhận diện sự hiện diện của khiếm khuyết trong khung hình video, phân loại vào 3 lớp (*ổ gà, vết nứt, bong tróc*) và khoanh vùng Bounding Box $[0, 1]$.
  * **Crew đo thật:** Kích thước thực tế (dài, rộng, sâu) bắt buộc phải do con người (Repair Crew) dùng thước đo vật lý ngoài hiện trường đo đạc và nộp về.
* **Ý nghĩa đối với FE Web:**
  * Tại các màn hình tiếp nhận và chi tiết hư hỏng trên Web, thông tin từ AI chỉ gồm: **Ảnh khung hình + Khung Bounding Box + Tên loại lỗi + Độ tin cậy (%) + Mã truy vết (tệp video, giây thứ $t$)**.
  * Bảng số đo kích thước thực tế chỉ xuất hiện sau khi Đội hiện trường đã thực hiện đo đạc ngoài thực địa.

---

### 3. Cơ chế phân loại ứng viên AI (Candidate Triage)
* **SPECS (29_9):** Quy định luồng duyệt cơ bản: PM xem danh sách lỗi AI phát hiện rồi bấm Duyệt (chuyển thành lỗi chính thức) hoặc Xóa/Hủy (Reject).
* **PHIẾU ĐĂNG KÝ (v1.11):** 
  * Bổ sung cơ chế chống trùng lặp dữ liệu do đặc thù video drone quay nhiều khung hình của cùng một vị trí hư hỏng:
    1. **`KEEP_NEW`:** Xác nhận tạo khiếm khuyết mới hoàn toàn.
    2. **`LINK_EXISTING`:** Gộp ứng viên này vào một khiếm khuyết đã được tạo trước đó trên cùng phân đoạn đường.
    3. **`REJECT`:** Bác bỏ phát hiện nhầm của AI kèm lý do cụ thể.
* **Ý nghĩa đối với FE Web:**
  * Màn hình thẩm định lỗi của PM trên Web phải hỗ trợ tính năng chọn một lỗi đã có trong cùng phân đoạn để liên kết (`LINK_EXISTING`), giúp hồ sơ tuyến đường không bị nhân bản các lỗi trùng nhau.

---

### 4. Tập trung hoàn thiện Vòng đời sửa chữa NORMAL trong MVP
* **SPECS (29_9):** Luồng Fast Track (sửa nhanh không cần trình duyệt trước) được mô tả với tỷ trọng tương đương luồng Sửa chữa thông thường (Normal).
* **PHIẾU ĐĂNG KÝ (v1.11):** 
  * Nhóm cam kết phạm vi MVP tập trung hoàn thiện **100% vòng đời sửa chữa NORMAL**:
    $$\text{Tạo tuyến} \rightarrow \text{AI phát hiện} \rightarrow \text{PM xác minh} \rightarrow \text{Crew đo đạc} \rightarrow \text{PM lập phương án đợt sửa} \rightarrow \text{Supervisor duyệt} \rightarrow \text{PM giao việc} \rightarrow \text{Crew thi công nộp Before/After} \rightarrow \text{PM đánh giá} \rightarrow \text{Supervisor nghiệm thu cuối}$$
  * Luồng Fast Track được chuyển sang phạm vi mở rộng giai đoạn sau, chỉ áp dụng cho hư hỏng nhỏ lẻ đủ điều kiện policy. Hư hỏng nặng bắt buộc phải qua luồng NORMAL.
* **Ý nghĩa đối với FE Web:**
  * Toàn bộ các màn hình lập đợt sửa chữa, thẩm duyệt phương án khối lượng và nghiệm thu bàn giao trên Web ưu tiên phục vụ thông suốt cho quy trình NORMAL.

---

### 5. Chỉ số Thẩm định Nghiên cứu AI (RQ1 & RQ2)
* **SPECS (29_9):** Có các bảng theo dõi sai số kích thước hình học ($mm$) giữa mô hình và thực tế ($Bias, MAE, RMSE$).
* **PHIẾU ĐĂNG KÝ (v1.11):** 
  * Chuẩn hóa phương pháp nghiên cứu theo đúng khoa học thị giác máy tính:
    * **RQ1 (Đánh giá mô hình YOLO):** Dùng các chỉ số chuẩn: **Precision, Recall, F1-score, mAP@0.5, mAP@0.5:0.95** trên 3 lớp hư hỏng (*pothole, crack, spalling*), và sai số định vị GPS của khung hình ($m$).
    * **RQ2 (Đánh giá quy trình hệ thống vs thủ công):** Đánh giá dựa trên: **Tổng thời gian hoàn thành (giờ)**, **Công sức nhân sự (người-phút)**, **Độ bao phủ lỗi** và **Tính toàn vẹn của bằng chứng truy vết**.
* **Ý nghĩa đối với FE Web:**
  * Báo cáo phân tích / Thẩm định mô hình trên Web Dashboard của Supervisor sử dụng hệ thống chỉ số Computer Vision chuẩn ($\text{mAP}, \text{Precision}, \text{Recall}, \text{F1}$) và biểu đồ đối chiếu thời gian/công sức RQ2, không hiển thị sai số đo kích thước $mm$.

---

### 6. Cấu trúc Tuyến đường trên Web GIS
* **SPECS (29_9):** Tuyến đường được xem như một đoạn thẳng duy nhất biểu diễn theo lý trình Km (Km0+000 đến Km5+000).
* **PHIẾU ĐĂNG KÝ (v1.11):** 
  * Bổ sung đặc thù của giao thông nông thôn: Hệ thống đường có tuyến chính (**`MAIN`**) và nhiều tuyến nhánh/ngõ rẽ (**`BRANCH`**).
  * Tuyến được chia thành các **Phân đoạn khảo sát tiêu chuẩn $100m$ (`Segment / Section`)** để quản lý bay drone và gom cụm khiếm khuyết. Nền tảng Web GIS xác định sử dụng **MapLibre** kết hợp **SQL Server Spatial**.
* **Ý nghĩa đối với FE Web:**
  * Màn hình bản đồ Web GIS cần cho phép chọn xem tuyến chính hoặc các nhánh rẽ, đồng thời hiển thị trực quan các phân đoạn $100m$ trên bản đồ để PM và Supervisor dễ dàng theo dõi.

---

## 🔒 III. NHỮNG ĐIỀU BẤT BIẾN TIẾP TỤC ĐỒNG NHẤT GIỮA HAI TÀI LIỆU

Cả bản SPECS cũ và Phiếu đăng ký mới nhất v1.11 đều thống nhất tuyệt đối các nguyên tắc nền tảng sau:

1. **Zero Money (Không quản lý giá tiền):** Hệ thống chỉ tính toán khối lượng kỹ thuật thi công ($m^2$ cào bóc, $m$ trám nứt, $cm$ chiều sâu, phụ gia mác nhựa theo TCVN 8819:2011). Tuyệt đối **không có trường giá tiền, đơn giá VNĐ hay bảng dự toán BOQ tài chính**.
2. **Quyền Duyệt độc quyền của Supervisor:** Chỉ tài khoản `SUPERVISOR` mới có quyền Phê duyệt / Từ chối đợt sửa chữa và Ký xác nhận nghiệm thu đóng đợt. PM chỉ có quyền lập đề xuất và giao việc.
3. **Đóng băng hồ sơ (`APPROVED` = Read-only):** Khi một đợt sửa chữa đã được Supervisor phê duyệt, toàn bộ danh sách khiếm khuyết và phương án kỹ thuật trong đợt đó bị khóa cứng chống chỉnh sửa hoặc xóa bỏ.
4. **Ảnh đối chiếu Trước / Sau (Before / After):** Nghiệm thu bắt buộc phải có đủ cặp ảnh đối soát trước khi sửa và sau khi hoàn thiện kèm tọa độ trắc địa để Supervisor đánh giá chất lượng thi công.
