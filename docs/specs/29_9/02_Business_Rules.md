# ROADGUARD — BUSINESS RULES DOCUMENT

**Phiên bản:** BRD-2026-09-26-R1. **Loại:** tài liệu quy tắc nghiệp vụ, không phải Business Requirements Document.  
**Căn cứ:** quyết định chủ dự án đến 26/09/2026, UseCase R2 và tài liệu nền; các ghi chú R3 đồng bộ với bộ này.  
**Trạng thái:** yêu cầu mục tiêu; không phải xác nhận triển khai backend.

## 1. Hiệu lực và cách sử dụng

CHỐT = quyết định trực tiếp; KẾ THỪA = quy tắc nền còn giữ; ĐỀ XUẤT = chưa được tự coi là đã duyệt. Quyết định mới nhất có ưu tiên; mọi chỗ đề xuất/TBD phải được chốt hoặc giữ ngoài phạm vi nghiệm thu phần đó. Yêu cầu cấp quyền/nghiệm thu không được giải quyết bằng việc Codex tự chọn.

Mã BR-* ổn định để FRD, UseCase, User Stories và To-Be Process cùng tham chiếu. Không dùng thuật ngữ “chưa duyệt” chung cho mọi nhánh: Fast Track có quyền qua nhiệm vụ/policy; APPROVAL_TRACK cần Supervisor.

## 2. Sổ quy tắc

### BR-01 — Khởi tạo và người phụ trách

**Trạng thái:** CHỐT. **Truy vết:** US-03, US-30, US-31.

Supervisor tạo dự án và giao đúng một PM chính; PM nhập/chỉnh tọa độ và bề rộng.

**Điều kiện kiểm chứng:** PM không tự tạo dự án theo quyền Supervisor; thay PM giữ lịch sử.

### BR-02 — Phạm vi quyền

**Trạng thái:** KẾ THỪA. **Truy vết:** US-01, US-17, US-21.

Mọi request kiểm tra role, membership/nhiệm vụ hoặc ownership Reporter ở server; quyền tệp theo cùng phạm vi.

**Điều kiện kiểm chứng:** Người ngoài dự án không đọc/sửa hoặc tải tệp qua URL còn hiệu lực ngoài scope.

### BR-03 — PM quyết định ưu tiên

**Trạng thái:** CHỐT. **Truy vết:** US-34.

Hệ thống chỉ gợi ý dựa severity/urgency; PM chọn lỗi, thứ tự và Crew. Không tự thay kế hoạch đã giao.

**Điều kiện kiểm chứng:** Cập nhật gợi ý không làm đổi thứ tự đã lưu của PM.

### BR-04 — Hai chiều phân cấp

**Trạng thái:** CHỐT. **Truy vết:** US-34.

Lưu riêng nghiêm trọng và khẩn cấp. Ba mức khẩn cấp: Bình thường, Cần xử lý sớm, Khẩn cấp; PM quyết định.

**Điều kiện kiểm chứng:** Reporter/Crew cảnh báo nhưng không tự ghi đè phân cấp chính thức.

### BR-05 — Không vượt kết luận PM

**Trạng thái:** CHỐT. **Truy vết:** US-20, US-33.

Khi PM xác định nghiêm trọng, Crew chỉ đo/báo; dù số đo nhỏ hơn cũng không tự sửa.

**Điều kiện kiểm chứng:** Thử sửa khi PM có chỉ đạo nghiêm trọng bị chặn theo bản nhiệm vụ đã nhận.

### BR-06 — Lỗi mới ngoài nhiệm vụ

**Trạng thái:** CHỐT. **Truy vết:** US-13, US-33.

Crew chỉ ghi nhận lỗi mới ngoài phạm vi công việc, không tự sửa.

**Điều kiện kiểm chứng:** Lỗi mới có báo cáo riêng cho PM, không tự thêm vào phần đã được giao sửa.

### BR-07 — Chọn kiểm chứng

**Trạng thái:** CHỐT. **Truy vết:** US-08, US-20, US-22.

PM có thể chọn kiểm tra trực tiếp hoặc drone cho một hay nhiều phản ánh; đo vật lý khi quyết định cần số đo.

**Điều kiện kiểm chứng:** Không có gate field-first/drone-first cứng; thiếu số đo bắt buộc không được kết luận cần số đo đó.

### BR-08 — Một lỗi nhỏ riêng lẻ

**Trạng thái:** CHỐT. **Truy vết:** US-33.

PM có thể giao đo-và-sửa; Crew đo, đạt policy và đủ bằng chứng thì Fast Track cùng chuyến.

**Điều kiện kiểm chứng:** Không cần PM duyệt số đo trước sửa; quyền phát sinh từ nhiệm vụ và policy.

### BR-09 — Đợt gom chỉ đo trước

**Trạng thái:** CHỐT. **Truy vết:** US-35.

Trong đợt gom nhiều lỗi, Crew đo/chụp rồi báo PM, không tự sửa ngay kể cả lỗi nhỏ đạt policy. PM phân công sửa sau.

**Điều kiện kiểm chứng:** Ví dụ 10 lỗi có 5 LOW: không lỗi nào tự được sửa trong chuyến chỉ-đo.

### BR-10 — Một tuần không tự cấp quyền

**Trạng thái:** CHỐT 32A. **Truy vết:** US-35; D02/32A.

PM tự gom đợt đo; hệ thống nhắc PM rà soát hằng tuần. Reminder không tự tạo/giao task, không tự cấp quyền sửa và không đổi mode nhiệm vụ đang giao.

**Điều kiện kiểm chứng:** Reminder xuất hiện đúng cấu hình nhưng không tạo batch/task; việc đã giao không bị client tự đổi chỉ vì thêm report.

### BR-11 — Người lập policy

**Trạng thái:** CHỐT. **Truy vết:** US-33.

PM lập policy Fast Track và Crew xem policy trên app; policy chỉ định lỗi/điều kiện được tự sửa.

**Điều kiện kiểm chứng:** Crew không tự sửa nội dung policy; lịch sử giữ người lập và phiên bản áp dụng.

### BR-12 — Nội dung policy

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-33.

Policy ghi loại lỗi, điều kiện đo, biện pháp, bằng chứng, phạm vi, dụng cụ/vật tư tham khảo và năng lực đội; ngưỡng thực tế phải được cung cấp.

**Điều kiện kiểm chứng:** Thiếu cấu hình điều kiện bắt buộc thì không kết luận ELIGIBLE; không hard-code ngưỡng suy đoán.

### BR-13 — Ngoài policy

**Trạng thái:** CHỐT. **Truy vết:** US-20, US-33, US-34.

Crew gửi kết quả cho PM; PM đánh giá phân cấp và đưa vào hàng chờ/quyết định tiếp. Không đạt policy không tự có nghĩa nghiêm trọng hơn.

**Điều kiện kiểm chứng:** Lỗi còn mở; không tự giảm khẩn cấp hoặc tự chuyển severity.

### BR-14 — Khẩn cấp và Fast Track

**Trạng thái:** CHỐT. **Truy vết:** US-33, US-34, US-41.

LOW có urgency Khẩn cấp vẫn có thể Fast Track nếu policy và nhiệm vụ cho phép; urgency không tự kích hoạt EMERGENCY.

**Điều kiện kiểm chứng:** Không đổi nhánh chỉ do một trường urgency.

### BR-15 — Sửa ngoại tuyến

**Trạng thái:** CHỐT. **Truy vết:** US-02, US-33.

Cho Fast Track ngoại tuyến không giới hạn thời gian mất mạng, trong nhiệm vụ/policy đã được giao.

**Điều kiện kiểm chứng:** Mất mạng lâu không tự hết quyền; không thêm gate online trước mỗi lần sửa.

### BR-16 — Xung đột ngoại tuyến

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-02, US-12.

Lưu snapshot nhiệm vụ/policy; lệnh PM chưa được máy nhận không thể có hiệu lực tức thời trên máy đó. Khi sync giữ bằng chứng và chuyển xung đột cho PM.

**Điều kiện kiểm chứng:** Không dùng last-write-wins để xóa số đo, không tự chấp nhận kết quả xung đột.

### BR-17 — Bằng chứng trước

**Trạng thái:** CHỐT. **Truy vết:** US-13, US-20, US-33.

Fast Track có thể dùng ảnh Reporter/drone làm BEFORE; đo ngoài Fast Track bắt buộc ảnh và số đo.

**Điều kiện kiểm chứng:** Không chấp nhận phiên đo thiếu trường/ảnh bắt buộc; phải đo lại phần được quyết định.

### BR-18 — Tính phù hợp ảnh cũ

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-13, US-33.

Ảnh tái sử dụng phải đúng lỗi/nguồn/thời điểm và còn phản ánh hiện trường; nếu không phù hợp thì chụp mới trước sửa.

**Điều kiện kiểm chứng:** Không đổi ảnh AFTER thành BEFORE; app chặn bắt đầu sửa khi không có bằng chứng trước hợp lệ cục bộ.

### BR-19 — Tự đồng bộ

**Trạng thái:** CHỐT. **Truy vết:** US-02, US-13.

Ảnh/số đo/báo cáo đã xác nhận gửi hoặc xếp hàng tự tiếp tục khi có mạng và app được phép thực thi.

**Điều kiện kiểm chứng:** Nháp chưa gửi không tự trở thành báo cáo chính thức; retry không tạo lần sửa trùng.

### BR-20 — Toàn vẹn tệp

**Trạng thái:** KẾ THỪA. **Truy vết:** US-02, US-06.

Chỉ báo lưu an toàn sau server xác nhận tệp/metadata đầy đủ và toàn vẹn; dọn bản cục bộ theo lựa chọn người dùng.

**Điều kiện kiểm chứng:** Tệp thiếu/checksum sai không đủ điều kiện nghiệm thu và không bị dọn tự động.

### BR-21 — Quyết định từng công việc

**Trạng thái:** CHỐT. **Truy vết:** US-11.

Nhánh duyệt có APPROVE, REQUEST_EVIDENCE, REQUEST_RECONSIDER, REJECT riêng từng RepairItem.

**Điều kiện kiểm chứng:** Một item được duyệt không phải chờ các item khác trong gói.

### BR-22 — Từ chối phương án

**Trạng thái:** CHỐT. **Truy vết:** US-11.

REJECT kết thúc đề xuất; Defect vẫn chưa xử lý để PM lập phương án khác.

**Điều kiện kiểm chứng:** Không chuyển NO_DEFECT/RESOLVED vì từ chối phương án.

### BR-23 — Điều kiện giao sửa

**Trạng thái:** KẾ THỪA. **Truy vết:** US-11, US-12.

APPROVAL_TRACK chỉ giao phần APPROVED; Fast Track theo quyền nhiệm vụ; đổi biện pháp/phạm vi phải xét lại phần thay đổi.

**Điều kiện kiểm chứng:** PM xếp ưu tiên cao không thay thế phê duyệt bắt buộc.

### BR-24 — Không sửa trùng

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-12.

Không giao hai việc sửa chồng phạm vi hiệu lực; chuyển đội cần giữ lịch sử và xác nhận bàn giao khi đội cũ ngoại tuyến.

**Điều kiện kiểm chứng:** Đổi Crew không tự đổi bằng chứng hoặc quyền đã duyệt.

### BR-25 — Đóng Fast Track

**Trạng thái:** CHỐT. **Truy vết:** US-14, US-33.

PM kiểm tra đủ số đo/policy/bằng chứng và kết quả, đóng lỗi Fast Track và gửi báo cáo Supervisor; không thêm gate Supervisor duyệt sửa.

**Điều kiện kiểm chứng:** Crew báo xong hoặc upload thành công không tự đóng.

### BR-26 — Đóng hồ sơ hỗn hợp

**Trạng thái:** CHỐT. **Truy vết:** US-14, US-23.

Hồ sơ hỗn hợp chờ đủ xác nhận theo từng nhánh rồi Supervisor đóng tổng.

**Điều kiện kiểm chứng:** Fast Track đạt không làm toàn hồ sơ đóng khi còn lỗi bắt buộc chưa đạt.

### BR-27 — Sửa chưa đạt

**Trạng thái:** CHỐT. **Truy vết:** US-14.

Lỗi sửa chưa đạt tiếp tục xử lý; giữ lần sửa/bằng chứng trước và kết quả đạt của lỗi khác.

**Điều kiện kiểm chứng:** Không tạo ticket mới chỉ vì một lần sửa bị trả; phân biệt thiếu ảnh với cần thi công lại.

### BR-28 — Phân biệt tái phát

**Trạng thái:** CHỐT. **Truy vết:** US-37.

PM phân biệt lần sửa trước chưa đạt với hư hỏng tái phát sau nghiệm thu.

**Điều kiện kiểm chứng:** Cùng GPS không tự quyết định mở lại hoặc tạo mới; quyền mở lại hồ sơ Supervisor còn TBD.

### BR-29 — Report và riêng tư

**Trạng thái:** KẾ THỪA. **Truy vết:** US-21, US-23.

Report giữ người gửi/bằng chứng gốc; Reporter chỉ xem phần công bố thuộc sở hữu, không xem danh tính người khác.

**Điều kiện kiểm chứng:** Năm người báo không lộ ảnh nội bộ/danh tính lẫn nhau.

### BR-30 — Báo trùng và gộp sai

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-22.

Hệ thống gợi ý trùng; PM liên kết nhiều report về hồ sơ chính, giữ nguồn; tách lại khi gộp nhầm.

**Điều kiện kiểm chứng:** Không tạo năm lệnh sửa cùng một lỗi; không tăng severity chỉ vì năm report.

### BR-31 — Gom 1–2 m

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-09, US-36.

Khoảng gần 1–2 m chỉ gợi ý, xét độ chính xác GPS, nhánh, phía đường, ảnh, loại lỗi và thời điểm trước xác nhận.

**Điều kiện kiểm chứng:** Ổ gà và vỡ mép gần nhau vẫn có thể là hai lỗi.

### BR-32 — Các cấp quản lý

**Trạng thái:** CHỐT. **Truy vết:** US-36, US-38.

Tuyến/segment để quản lý; tấm để định vị; từng lỗi để đánh giá/nghiệm thu; nhóm công việc để gom sửa.

**Điều kiện kiểm chứng:** Một tấm có nhiều lỗi, sửa một lỗi không đóng tất cả.

### BR-33 — Tấm dự kiến và tấm thật

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-36.

Tấm sinh theo khoảng 4 m chỉ dự kiến tới khi đối chiếu khe/hoàn công; nhiều dải tăng số tấm; lỗi có thể liên quan nhiều tấm.

**Điều kiện kiểm chứng:** Không khẳng định mọi tấm dài 4 m theo TCVN; ranh segment không cắt giả tài sản vật lý.

### BR-34 — Bề rộng từng đoạn

**Trạng thái:** CHỐT. **Truy vết:** US-30, US-38.

PM nhập tim và bề rộng từng khoảng; ví dụ P1–P2 8 m, P2–P3 10 m, vùng tổng mong muốn 12 m.

**Điều kiện kiểm chứng:** Mặt đường giữ 8/10 m; biên vùng ví dụ cách tim 6 m, phần dư ngoài mép lần lượt 2/1 m.

### BR-35 — Tính mét và phiên bản

**Trạng thái:** KẾ THỪA. **Truy vết:** US-24, US-30, US-31, US-32.

Giữ CRS nguồn, chuyển thật sang CRS mét dự án, đo dọc polyline và station origin; xuất WGS84 cho bản đồ.

**Điều kiện kiểm chứng:** Không trộn SRID hoặc chỉ đổi nhãn; dữ liệu cũ không tự gắn vào tuyến/segment mới.

### BR-36 — Mạng nhánh

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-38.

Dùng nút giao và đoạn nối có polyline; giữ mã nhánh/chiều tuyến; gần giao lộ phải xác nhận khi nhiều ứng viên.

**Điều kiện kiểm chứng:** Không nối mọi đường cắt nhau khác cao độ; curve vertex không tự là nút giao.

### BR-37 — Nguồn tuyến theo sprint

**Trạng thái:** CHỐT. **Truy vết:** US-24, US-30.

GPX ngoài app và nhập/chỉnh tim thuộc Sprint 1; nguồn track drone dựng tuyến Sprint 2; recorder điện thoại chưa chốt.

**Điều kiện kiểm chứng:** GPX thô không tự là tim đường đã công bố.

### BR-38 — Chỉ đường

**Trạng thái:** CHỐT. **Truy vết:** US-40.

Crew từ nhiệm vụ đo/sửa; Operator dùng điểm tiếp cận/tập kết; chuyển Google Maps ở Sprint 1.

**Điều kiện kiểm chứng:** Không dùng trung điểm segment hoặc GPS drone làm đích tùy ý; mở Maps không đổi trạng thái việc.

### BR-39 — AI là nguồn hỗ trợ

**Trạng thái:** KẾ THỪA. **Truy vết:** US-08, US-26.

Kết quả AI là ứng viên; PM giữ/sửa/loại và xác minh từ căn cứ phù hợp. Không detections không đồng nghĩa không có lỗi.

**Điều kiện kiểm chứng:** Không tự tạo kết luận NO_DEFECT/đóng bảo hành từ job AI.

### BR-40 — Baseline theo band

**Trạng thái:** KẾ THỪA. **Truy vết:** US-04, US-25.

Baseline xác nhận theo segment/band đủ điều kiện; giữ phần đạt, bổ sung phần thiếu.

**Điều kiện kiểm chứng:** Không dùng cờ tổng của Survey thay nguồn baseline chi tiết.

### BR-41 — Vị trí bay khác coverage

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-25, US-39.

SRT trong vùng chứng minh tối đa điều kiện vị trí khi dữ liệu đủ; coverage/quality đánh giá riêng.

**Điều kiện kiểm chứng:** Trong vùng 12 m nhưng camera thiếu mép không tự đạt toàn bộ khảo sát.

### BR-42 — Job bền vững

**Trạng thái:** KẾ THỪA. **Truy vết:** US-26.

Lưu manifest/job trước khi trả nhận xử lý; nguồn mock/real và version rõ; retry giữ danh tính, kết quả muộn không ghi đè bản mới.

**Điều kiện kiểm chứng:** Crash/retry không nhân đôi detection nghiệp vụ hoặc mất nguồn.

### BR-43 — PM quyết định bay bổ sung

**Trạng thái:** CHỐT. **Truy vết:** US-07.

PM xác nhận phạm vi/lý do bay bổ sung, có thể đổi Operator; không giới hạn số lượt hợp lệ.

**Điều kiện kiểm chứng:** Giữ dữ liệu cũ, phần đạt; lỗi server không tự tạo chuyến bay.

### BR-44 — Research validation

**Trạng thái:** KẾ THỪA. **Truy vết:** US-20, US-26.

Giữ RS01–RS06: ground truth thực, ghép đúng mẫu và báo sai số/độ không chắc chắn; mock không chứng minh chất lượng AI.

**Điều kiện kiểm chứng:** Báo cáo nêu mẫu, thiết bị, phương pháp, outlier, dữ liệu thiếu.

### BR-45 — Lưu trữ và audit

**Trạng thái:** KẾ THỪA. **Truy vết:** US-16, US-19.

Lịch sử không xóa cứng trong tác nghiệp; giữ ít nhất hết bảo hành + 5 năm theo yêu cầu dự án; tranh chấp chặn xóa.

**Điều kiện kiểm chứng:** Xóa hết hạn cần Supervisor; log không chứa secret; không suy đây là thời hạn luật đã xác minh.

### BR-46 — EMERGENCY riêng

**Trạng thái:** KẾ THỪA. **Truy vết:** US-41.

PM kích hoạt biện pháp tạm, thông báo Supervisor và hậu kiểm; xử lý tạm không tự là sửa chính thức.

**Điều kiện kiểm chứng:** Đóng nhiệm vụ rào chắn không tự đóng Defect còn cần sửa.

### BR-47 — Thông báo khác hồ sơ

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-21, US-22.

Ticket nghiệp vụ ánh xạ IncidentCase; Notification chỉ báo sự kiện. Bổ sung evidence không tự tạo thêm ticket.

**Điều kiện kiểm chứng:** Chưa biết dự án/PM vẫn nhận phản ánh và chờ điều phối.

### BR-48 — Công bố từng phần

**Trạng thái:** ĐỀ XUẤT. **Truy vết:** US-23.

Có thể công bố lỗi liên quan đã được xác nhận dù hồ sơ tổng còn mở; cần chủ dự án chốt trước triển khai.

**Điều kiện kiểm chứng:** Không mô tả toàn hồ sơ hoàn thành khi chỉ một lỗi đã đạt.

## 3. Bảng quyết định thực địa

| Nhiệm vụ/điều kiện | Crew được sửa? | Kết quả tiếp theo |
|---|---|---|
| Chỉ-đo trong đợt gom; dù đạt policy | Không | Gửi ảnh/số đo, PM phân công sửa sau |
| Một lỗi nhỏ, được giao đo-và-sửa, đủ policy và BEFORE | Có | Sửa, AFTER, gửi/sync, PM kiểm |
| PM đã xác định nghiêm trọng hoặc chỉ đạo cấm sửa | Không | Đo và báo lại |
| Ngoài policy hoặc thiếu căn cứ đánh giá | Không | Báo PM, chờ quyết định |
| Lỗi mới ngoài nhiệm vụ | Không | Ghi nhận riêng |
| Mất mạng nhưng đủ điều kiện của nhiệm vụ Fast Track đã nhận | Có | Lưu cục bộ; không tự giới hạn thời gian mất mạng |
| Thiếu BEFORE hợp lệ cục bộ | Không theo luồng ứng dụng | Hoàn thiện bằng chứng trước khi bắt đầu |

## 4. Các quyền phải phân biệt

PM lập/giao việc không xóa gate phê duyệt APPROVAL_TRACK. Crew tự đánh giá eligibility không tự sửa severity chính thức. Supervisor nhận báo cáo Fast Track không tạo một vòng duyệt sửa mới. Hồ sơ hỗn hợp chỉ đóng sau mọi phần bắt buộc đạt đúng nhánh.

“Đã đo”, “đã sửa”, “đã upload”, “PM chấp nhận”, “Supervisor xác nhận” và “đã công bố” là sự kiện khác nhau. Chỉ các sự kiện đủ điều kiện mới chuyển trạng thái tương ứng. Các tên enum kỹ thuật cần P1/P2 đồng bộ, không tự sửa số enum cũ.

## 5. Điểm chờ quyết định

Dùng crosswalk tại Mô tả dự án §21 và [decision register](../../../../planning/V2/V2-3_DECISION_REGISTER.md). Q01/Q02/Q04-Q12 đã có quyết định nghiệp vụ D02-D10/D12/D14-D16; không hỏi lại. Q03 còn hồ sơ/ngưỡng method; Q11/Q13/Q14 còn calibration/bytes/CRS và kiểm chứng thực địa. Wire schema/test chưa xong vẫn là gate riêng, không biến ngược thành business OPEN.

## 6. Quản lý thay đổi

Thay BR phải ghi nguồn quyết định, phiên bản trước/sau, đối tượng bị ảnh hưởng và hiệu lực. Không đánh giá lại lịch sử bằng policy mới rồi ghi đè kết luận cũ. RoadGuard_UseCase_Change_Log.md là log bàn giao P1/P2; tài liệu này là sổ luật hiện hành trong thiết kế mục tiêu, không thay worklog backend.

## V2(3) amendment — 2026-09-28

This document follows `planning/V2/V2-3_DECISION_REGISTER.md`. D01-D28 are approved business decisions; `APPROVED_PILOT_CONFIG` and `APPROVED_TARGET` are not empirical verification. The document must distinguish `contractStatus`, `implementationStatus`, and `verificationStatus`. Reporter email/password plus one-time email OTP is the approved authentication flow; web cookie transport, pilot limits, retention and performance values remain configuration/target registers. Fast Track uses measurement-only intake followed by a separately authorized PM repair task; policy framework, reopen, partial publication, handover/conflict, BEFORE incident, curing and traffic release remain explicit contracts. Offline evaluation and AI two-stage processing are proposed until schema, fixtures and runtime/provider evidence pass.
