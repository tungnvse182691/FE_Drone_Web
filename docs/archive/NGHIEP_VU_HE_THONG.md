# SỔ TAY NGHIỆP VỤ & QUY TRÌNH HỆ THỐNG ROADGUARD
> **Hệ thống Quản lý Bảo hành & Sửa chữa Hạ tầng Đường bộ (Nhà thầu Hoàng Hải)**  
> *Ghi chép theo trình tự thực hiện từng màn hình. Cập nhật liên tục sau mỗi màn hình được chốt.*

---

## ⚡ MỤC QUAN TRỌNG NHẤT: BẢNG LIÊN ĐỚI GIỮA CÁC MÀN HÌNH (CROSS-SCREEN DEPENDENCIES)
*(Luôn ghim ở đầu file để không bị quên logic khi chuyển tiếp giữa các màn hình)*

| Cặp màn hình liên đới | Tên luồng nghiệp vụ | Trạng thái tích hợp | Dữ liệu truyền / Mối quan hệ | Nhiệm vụ TỒN ĐỌNG (Cần làm khi tới màn hình sau) |
|:---:|---|:---:|---|---|
| **Màn 03/04 $\longleftrightarrow$ Màn 02** | *Gửi lời mời nhân sự $\leftrightarrow$ Tiếp nhận thư mời Onboarding* | <span style="color:orange">**⏳ ĐANG DANG DỞ (Mới xong Màn 02 - Tiếp nhận, Chờ Màn 04)**</span> | - **Màn 03/04:** Supervisor bấm *"Mời nhân sự"* $\rightarrow$ Nhập email, chọn vai trò PM $\rightarrow$ Hệ thống sinh mã token link `/invite/:token`.<br>- **Màn 02:** PM nhận link, mở trang kích hoạt tài khoản và vào dự án. | ⚠️ **TODO KHI LÀM MÀN 04 (Chi tiết dự án):**<br>1. Xây dựng Modal *"Mời nhân sự vào dự án"* (Nhập email, phân quyền, gửi link).<br>2. Hiển thị danh sách lời mời đang chờ (`PENDING`) kèm nút copy link invite `/invite/:token` để test trực tiếp sang Màn 02.<br>3. Nút hủy/thu hồi lời mời nếu gửi nhầm. |
| **Màn 01 $\longleftrightarrow$ Màn 02** | *Đăng nhập $\leftrightarrow$ Kích hoạt thư mời Onboarding* | <span style="color:green">**✅ HOÀN THÀNH (100%)**</span> | - Màn 02 nhận token (`/invite/:token`).<br>- PM thiết lập mật khẩu mới $\rightarrow$ Kích hoạt tài khoản và chuyển thẳng vào PM Dashboard (`/pm/dashboard`). | *Đã hoàn tất cả 2 màn hình. Mật khẩu đạt chuẩn Enterprise và cờ `must_change_password` được gỡ bỏ.* |
| **Màn 03 $\longleftrightarrow$ Màn 05** | *Khởi tạo dự án $\leftrightarrow$ Thiết lập tim tuyến MapLibre (WF-02)* | <span style="color:orange">**⏳ ĐANG DANG DỞ (Mới xong Màn 03, Chờ Màn 05)**</span> | - **Màn 03:** Sup tạo dự án, nhập lý trình Km đầu, Km cuối, chiều dài $\rightarrow$ Dự án ở trạng thái `PENDING_ALIGNMENT`.<br>- **Màn 05:** Tải file CAD (`.sxf`), nắn chỉnh tim tuyến trên MapLibre. | ⚠️ **TODO KHI LÀM MÀN 05:**<br>1. Đo cự ly giữa các mốc trên MapLibre, kiểm tra không được lệch quá $\pm 10\%$ so với Màn 03.<br>2. Bật cảnh báo đỏ nếu người dùng chấm lệch quá xa.<br>3. Tạo nút *"Đồng bộ ngược lại Màn 03"* theo số đo thực tế GIS. |
| **Màn 07 $\longleftrightarrow$ Màn 08** | *Hộp thư tiếp nhận AI $\leftrightarrow$ Fast Track & Thẩm định BBox (WF-05)* | <span style="color:green">**✅ HOÀN THÀNH (100%)**</span> | - **Màn 07:** Sau khi PM bấm *"Xác minh hợp lệ"*, hệ thống có nút chuyển thẳng sang Màn 08 (`/pm/fast-track`) để phát lệnh thi công nhanh hoặc sang Màn 08/09 (`/pm/defects/:id/verify`) để so sánh ảnh đa kỳ. | *Đã hoàn tất liên kết điều hướng trực tiếp giữa các màn hình.* |

---

## 📋 CHI TIẾT NGHIỆP VỤ TỪNG MÀN HÌNH (THEO THỨ TỰ THỰC HIỆN)

---

### 🖥️ MÀN HÌNH 01: ĐĂNG NHẬP & ĐỔI MẬT KHẨU LẦN ĐẦU (`01_WF01_Auth_Login_ForcePassword`)
* **Mục đích:** Cổng đăng nhập bảo mật cho cán bộ văn phòng (PM và Supervisor).
* **Quy chuẩn nghiệp vụ đã chốt:**
  1. **Tài khoản phân quyền mẫu:**
     - **Project Manager (PM):** `pmhoang@gmail.com` / Mật khẩu: `123456` $\rightarrow$ Điều hướng về `/pm/dashboard`.
     - **Supervisor (Giám sát):** `suphoang@gmail.com` / Mật khẩu: `123456` $\rightarrow$ Điều hướng về `/sup/dashboard`.
  2. **Cơ chế Force Change Password (WF-01):** Nếu user có cờ `must_change_password: true`, hệ thống lập tức chặn mọi route và chuyển sang View đổi mật khẩu bắt buộc trước khi vào hệ thống.
  3. **Màu sắc:** Sử dụng tông màu Vàng đồng `#C9A227` và Navy Slate `#2D3748` theo thương hiệu Hoàng Hải.

---

### 🖥️ MÀN HÌNH 02: TIẾP NHẬN LỜI MỜI THAM GIA DỰ ÁN (`02_AcceptInvitation_Onboarding`)
* **Mục đích:** Kỹ sư PM mới mở liên kết thư mời từ email để kích hoạt tài khoản và nhận bàn giao dự án từ Supervisor.
* **Quy chuẩn nghiệp vụ đã chốt:**
  1. **Hỗ trợ 2 trạng thái thư mời:**
     - **Token hợp lệ:** Hiển thị thông tin dự án được bàn giao, họ tên PM, email readonly (`pmhoang@gmail.com`).
     - **Token hết hạn:** Báo lỗi bảo mật, hiển thị nút yêu cầu Supervisor gửi lại thư mời mới.
  2. **Thước đo độ mạnh mật khẩu Real-time (Dynamic 4 vạch):**
     - Đánh giá theo 4 mức: *Chưa nhập* (xám), *Yếu* (đỏ), *Trung bình* (cam), *Khá mạnh* (vàng `#C9A227`), *Rất mạnh / Chuẩn Enterprise* (xanh lá).
     - 3 tiêu chí checklist tự động sáng xanh theo thời gian thực: Tối thiểu 8 ký tự, Chữ hoa & chữ thường, Số & ký tự đặc biệt.
     - Ô xác nhận mật khẩu kiểm tra trùng khớp tức thì.
  3. **Pháp lý & Kích hoạt:** Bắt buộc tích checkbox cam kết bảo mật số liệu công trình & Nghị định 130/2018/NĐ-CP trước khi bấm nút kích hoạt vào dự án.

---

### 🖥️ MÀN HÌNH 03: QUẢN LÝ DANH MỤC DỰ ÁN BẢO HÀNH (`03_Projects_Hub_CreateProject`)
* **Mục đích:** Trung tâm theo dõi toàn bộ các hợp đồng dự án bảo hành đường bộ và khởi tạo dự án mới.
* **Quy chuẩn nghiệp vụ đã chốt:**
  1. **Phân quyền tạo dự án:**
     - **Chỉ duy nhất Supervisor** mới có nút *"Khởi tạo dự án mới"* và Card số 6 *"Tạo hồ sơ dự án mới"*.
     - PM không có quyền tạo dự án (tuân thủ nguyên tắc chủ đầu tư/giám sát là người giao việc).
  2. **Form khởi tạo dự án mới (Modal Create Project):**
     - **Tên dự án:** Ghi rõ gói thầu và tuyến (VD: *Quốc lộ 14 - Đoạn Chơn Thành*).
     - **Mã dự án (PRJ):** Tự sinh chuẩn kỹ thuật (VD: `PRJ-QL14-01`).
     - **Khu vực địa lý quản lý:** **Cho phép Supervisor tự do gõ tay 100%** (VD: *Bình Phước - Bình Dương*, *Thừa Thiên Huế*, *Hà Nội*...), không giới hạn cứng 4 vùng.
     - **Chỉ định Kỹ sư PM:** Chọn PM phụ trách (Đỗ Quốc Hoàng, Trần Minh Tâm, Lê Văn Cường...).
     - **Khung thời gian bảo hành:** Ngày bắt đầu và ngày kết thúc (36 tháng).
     - **BỎ HOÀN TOÀN ô Hạn mức dự phòng bảo hành tiền tệ:** Hệ thống quản lý thuần túy kỹ thuật bảo hành (khối lượng cào bóc m², trám nứt mét dài, định mức TCVN), không tính toán chi phí tài chính.
     - **Phạm vi lý trình & Quy mô tuyến:**
       - Lý trình bắt đầu (VD: `Km 0+000`).
       - Lý trình kết thúc (VD: `Km 28+500`).
       - Chiều dài tuyến đường (VD: `28.5 km`).
  3. **Chính sách 403 IDOR Scope trên danh sách dự án:**
     - Khi đăng nhập tài khoản PM: Các dự án không thuộc phân công của mình (như Card 4 *Phan Thiết - Dầu Giây*) sẽ tự động bị khóa và phủ mờ **Overlay 403 RESTRICTED**.
     - Khi là Supervisor: Xem và quản lý được toàn bộ dự án trên cả nước.
  4. **Gán PM nhanh:** Với các dự án mới tạo hoặc chưa có PM phụ trách (như *ĐT-741*), Supervisor có nút *"Gán PM ngay"* để chỉ định kỹ sư mà không cần sửa toàn bộ dự án.
  5. **Chế độ xem linh hoạt:** Hỗ trợ chuyển đổi qua lại giữa **Dạng thẻ lưới (Grid)** và **Dạng bảng chi tiết (Table)**.

---

### 🖥️ MÀN HÌNH 08: CHÍNH SÁCH FAST TRACK & ĐIỀU PHỐI HIỆN TRƯỜNG (`08_WF05_FastTrackPolicy_FieldDispatch`)
* **Mục đích:** Thiết lập phiên bản chính sách Fast Track và điều phối lực lượng kỹ thuật/cứu hộ ra hiện trường theo 3 chế độ công tác.
* **Quy chuẩn nghiệp vụ đã chốt:**
  1. **3 Chế độ giao việc (Dispatch Modes):**
     - **Gom lô đo đạc (`MEASURE_ONLY`):** Cho phép chọn nhiều lỗi cùng tuyến để tổ trắc địa tuần tra 1 vòng lấy số liệu, tuyệt đối nghiêm cấm cào bóc hay tự ý sửa khi chưa lập phương án kỹ thuật được duyệt.
     - **Đo và Sửa ngay (`INSPECT_AND_REPAIR` — Fast Track Direct):** Tuân thủ **Quy tắc BR-08**, chỉ cho phép chọn đúng **1 lỗi đơn lẻ** đạt chuẩn chính sách (diện tích $\le 0.5\text{ m}^2$, sâu $\le 5\text{ cm}$). Cho phép thợ mang vật liệu vá nguội xử lý dứt điểm tại chỗ.
     - **Xử lý khẩn cấp 24/7 (`EMERGENCY`):** Chỉ chọn đúng **1 vị trí nguy hiểm** (sụt lún sâu, ổ voi gây lật xe) để điều động xe cơ động cứu hộ, cắm cọc tiêu phân luồng và khắc phục tạm thời để thông xe. Không đóng trạng thái lỗi gốc trên hệ thống.
  2. **Ràng buộc an toàn & Chống lạm dụng điều xe khẩn cấp:**
     - Nếu PM chọn lỗi nhỏ chưa vượt ngưỡng an toàn ở chế độ `EMERGENCY`: Hệ thống nhấp nháy cảnh báo trực quan trên thanh đáy, hiển thị Banner cảnh báo trong Modal và **bắt buộc PM phải nhập lý do giải trình đặc biệt** ($\ge 15$ ký tự) mới cho phép phát lệnh xuất quân.
  3. **Quản lý phiên bản chính sách (Policy Versioning):**
     - Hỗ trợ tạo phiên bản chính sách mới kế thừa từ phiên bản hiện hành, điều chỉnh ngưỡng diện tích tối đa và độ sâu tối đa.
     - Nút kích hoạt phiên bản chính thức để áp dụng tức thì cho các chuyến bay quét tiếp theo.
  4. **Bản đồ GIS MapLibre tương tác trực tiếp:**
     - Tự động vẽ hành lang tuyến và các Marker khiếm khuyết tương ứng với từng tuyến đường lựa chọn (`QL1A_PK04`, `QL1A_PK01`, `EXPRESSWAY_LINK`, `PHANTHIET_DAUGIAY`).
     - Tích hợp chọn tổ đội phân công trực tiếp tại từng dòng và Modal phát lệnh xuất quân đồng bộ sang App Mobile.

---

*(Các màn hình tiếp theo từ Màn 09 đến Màn 18 sẽ được tiếp tục bổ sung tuần tự vào tài liệu này sau khi hoàn thiện từng màn)*
