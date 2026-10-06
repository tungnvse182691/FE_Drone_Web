# ROADGUARD — FUNCTIONAL REQUIREMENTS DOCUMENT / SOFTWARE REQUIREMENTS SPECIFICATION

**Phiên bản:** FRD-SRS-2026-09-26-R1 — bản đặc tả mục tiêu để rà soát.  
**Ngày nghiên cứu công nghệ:** 26/09/2026. **Không xác nhận đã triển khai hoặc benchmark.**

## 1. Mục đích, phạm vi và chuẩn thuật ngữ

RoadGuard quản lý bảo hành đường: tiếp nhận phản ánh/AI, định vị theo mạng tuyến–segment–tấm, kiểm chứng, gom đợt đo/sửa, Fast Track, duyệt theo item, nghiệm thu và truy vết. Mục tiêu tối ưu chuyến đi/chi phí; PM quyết định, hệ thống gợi ý. Web phục vụ PM/Supervisor/Reporter; Android phục vụ Crew/Operator/Reporter; AI ngoài qua adapter.

Tài liệu mô tả dự án giải thích bối cảnh; Business Rules quy định BR-*; UseCase mô tả tương tác; User Stories/AC là tiêu chí kiểm thử; To-Be Process thể hiện nhánh quyết định. Tài liệu này không thay DDL, OpenAPI hoặc bản thiết kế bay.

CHỐT/KẾ THỪA/ĐỀ XUẤT có nghĩa như Business Rules. **M** = bắt buộc khi module được giao triển khai; **M-S1** = mục tiêu Sprint 1; **M-TBD** = nhu cầu cần hoàn thiện thiết kế/tiêu chí, chưa tự gán sprint; **M-RESEARCH** = bắt buộc track nghiên cứu riêng. Ưu tiên không đồng nghĩa đã duyệt mọi chi tiết còn mở.

## 2. Tác nhân, ranh giới và giả định

Supervisor tạo dự án/quản trị/duyệt nhánh thông thường; PM nhập tuyến, lập policy, phân cấp/lập kế hoạch/giao việc/kiểm tra; Crew đo và sửa đúng quyền; Operator thu/nộp dữ liệu bay; Reporter gửi/xem phần công bố của mình. Một PM chính mỗi dự án; nhiều dự án mỗi PM.

Không xây kế toán/kho vật tư đầy đủ; không điều khiển drone; không tự quyết định thay PM; không bảo đảm GPS hoặc AI chính xác nếu chưa có số đo kiểm chứng. Ngưỡng policy, tải hệ thống, dữ liệu thiết bị/tuyến thử còn cần cung cấp. Hệ thống có khả năng ngoại tuyến không có nghĩa quyền server hoặc lệnh thu hồi đến tức thì trên thiết bị mất mạng.

## 3. Yêu cầu chức năng

Mỗi FR có đầu vào/đầu ra, quy tắc và tiêu chí kiểm chứng; lỗi thiếu quyền phải bị chặn trước khi đọc/ghi. Các ID AC chi tiết nằm trong story tương ứng, các tình huống dưới đây là kiểm chứng ở mức FR.

### FR-01 — Xác thực và quyền

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-01, US-17; BR-02.

- **Đầu vào/tiền điều kiện:** Tài khoản, phiên, role, membership/ownership.
- **Hành vi/đầu ra bắt buộc:** Phiên hợp lệ hoặc từ chối theo phạm vi.
- **Kiểm chứng:** Given người ngoài phạm vi; When đọc/sửa hoặc tải tệp qua ID/URL; Then bị chặn và không lộ dữ liệu. Đổi quyền trên server áp dụng request kế tiếp; việc chưa sync xét riêng xung đột.

### FR-02 — Mời nhân sự

**Ưu tiên:** M-S1. **Căn cứ:** KẾ THỪA SPRINT. **Trace:** US-28; BR-02.

- **Đầu vào/tiền điều kiện:** Người mời có quyền, email, role, scope.
- **Hành vi/đầu ra bắt buộc:** Lời mời có trạng thái và người dùng sau nhận.
- **Kiểm chứng:** Given lời mời đã dùng/hết hạn; When nhận lại; Then không kích hoạt thêm tài khoản hoặc quyền; không log token/mật khẩu.

### FR-03 — Reporter đăng ký

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-27; BR-02, BR-29.

- **Đầu vào/tiền điều kiện:** Email hợp lệ, thông tin Reporter, mật khẩu và OTP.
- **Hành vi/đầu ra bắt buộc:** Reporter đã xác minh; không có ProjectMember.
- **Kiểm chứng:** Given OTP sai/hết hạn hoặc client chọn PM; When xác minh/đăng ký; Then không cấp quyền nội bộ và không cho gửi phản ánh chưa xác minh.

### FR-04 — Khởi tạo và bảo hành

**Ưu tiên:** M-S1. **Căn cứ:** CHỐT + KẾ THỪA. **Trace:** US-03; BR-01, BR-45.

- **Đầu vào/tiền điều kiện:** Thông tin dự án, bàn giao/bảo hành, PM.
- **Hành vi/đầu ra bắt buộc:** Dự án có đúng PM chính và phạm vi quyền.
- **Kiểm chứng:** Given Supervisor tạo dự án; When giao PM và lưu; Then PM được nhập tuyến, người không thuộc dự án không được chỉnh. Chuyển PM giữ lịch sử.

### FR-05 — CRS và tính mét

**Ưu tiên:** M-S1. **Căn cứ:** KẾ THỪA + ĐỀ XUẤT. **Trace:** US-24, US-30; BR-35.

- **Đầu vào/tiền điều kiện:** Tọa độ nguồn, CRS, tuyến, station origin.
- **Hành vi/đầu ra bắt buộc:** Hình học mét và GeoJSON WGS84 có nguồn.
- **Kiểm chứng:** Given CRS thiếu hoặc không tương thích; When đo/buffer; Then không trả kết quả giả. Với dữ liệu phẳng chênh 30/40 m thì khoảng cách 50 m trong dung sai test; tuyến cong tính theo polyline.

### FR-06 — Nhập/chỉnh tim và bề rộng

**Ưu tiên:** M-S1. **Căn cứ:** CHỐT. **Trace:** US-30; BR-34, BR-35, BR-37.

- **Đầu vào/tiền điều kiện:** GPX/chuỗi tọa độ, bề rộng theo đoạn, vùng khảo sát.
- **Hành vi/đầu ra bắt buộc:** Bản nháp có nguồn, bản lọc và bản chỉnh.
- **Kiểm chứng:** Given đoạn rộng 8 m và 10 m với vùng tổng 12 m; When preview; Then mặt đường khác nhau, biên vùng cách tim 6 m trên đoạn thẳng. GPX nhiều track phải chọn; waypoint-only không tự thành tuyến.

### FR-07 — Xác nhận phiên bản tuyến

**Ưu tiên:** M-S1. **Căn cứ:** KẾ THỪA. **Trace:** US-31; BR-01, BR-35.

- **Đầu vào/tiền điều kiện:** Bản nháp hợp lệ, quyền Supervisor.
- **Hành vi/đầu ra bắt buộc:** RoadSectionVersion và lịch sử nguồn.
- **Kiểm chứng:** Given bản đã xác nhận; When retry cùng yêu cầu; Then không sinh version trùng. Sửa hình học đã dùng không ghi đè dữ liệu cũ. Contract retry cụ thể đồng bộ Sprint T4.

### FR-08 — Chia và công bố segment

**Ưu tiên:** M-S1. **Căn cứ:** KẾ THỪA. **Trace:** US-24, US-32; BR-35.

- **Đầu vào/tiền điều kiện:** Phiên bản tuyến, chiều dài/ranh segment.
- **Hành vi/đầu ra bắt buộc:** Bộ segment có version và lý trình.
- **Kiểm chứng:** Given tuyến 4.500 m, target 1.000 m; When chia; Then có bốn đoạn 1.000 m và đoạn 500 m. Không hở/chồng; đổi bộ không đổi job cũ. Phần dư quá nhỏ theo rule cấu hình còn chờ chốt.

### FR-09 — Mạng nhiều nhánh

**Ưu tiên:** M-TBD. **Căn cứ:** NHU CẦU CHỐT / THIẾT KẾ ĐỀ XUẤT. **Trace:** US-38; BR-34, BR-36.

- **Đầu vào/tiền điều kiện:** Nút giao, polyline từng nhánh, chiều tuyến.
- **Hành vi/đầu ra bắt buộc:** Mạng có mã nhánh và phạm vi chọn khảo sát.
- **Kiểm chứng:** Given hai nhánh gần nhau hoặc giao khác cao độ; When gán vị trí; Then không tự nối/gán chắc khi thiếu căn cứ; PM xác nhận khi nhiều ứng viên.

### FR-10 — Quản lý tấm

**Ưu tiên:** M-TBD. **Căn cứ:** NHU CẦU CHỐT / THIẾT KẾ ĐỀ XUẤT. **Trace:** US-36; BR-31, BR-32, BR-33.

- **Đầu vào/tiền điều kiện:** Mốc khe, dải tấm, hoàn công hoặc chiều dài dự kiến.
- **Hành vi/đầu ra bắt buộc:** Tấm dự kiến/đã xác nhận; liên kết lỗi.
- **Kiểm chứng:** Given vỡ mép và ổ gà cùng tấm; When nhóm; Then giữ hai Defect riêng. Ranh segment không cắt giả tấm; chưa đo khe không gọi lưới là tấm thật.

### FR-11 — Gửi phản ánh

**Ưu tiên:** M. **Căn cứ:** CHỐT + KẾ THỪA. **Trace:** US-21; BR-29, BR-47.

- **Đầu vào/tiền điều kiện:** Reporter, ảnh, vị trí/nguồn từng ảnh, mô tả.
- **Hành vi/đầu ra bắt buộc:** Report, hồ sơ tiếp nhận và thông báo.
- **Kiểm chứng:** Given ảnh cũ được upload ở nơi khác; When gửi; Then không dùng GPS upload làm vị trí chụp. Chưa rõ dự án giữ hàng điều phối, không mất dữ liệu.

### FR-12 — Liên kết báo trùng

**Ưu tiên:** M-TBD. **Căn cứ:** ĐỀ XUẤT HOÀN THIỆN. **Trace:** US-22; BR-30, BR-31.

- **Đầu vào/tiền điều kiện:** Report/detection và ứng viên gần vị trí.
- **Hành vi/đầu ra bắt buộc:** Quyết định liên kết/tách và hồ sơ chính.
- **Kiểm chứng:** Given năm report cùng lỗi; When PM xác nhận liên kết; Then giữ năm nguồn, một phạm vi xử lý chính và không lộ danh tính. Khoảng 1–2 m không tự hợp khác loại lỗi.

### FR-13 — Kiểm chứng phản ánh/AI

**Ưu tiên:** M. **Căn cứ:** CHỐT. **Trace:** US-08, US-20, US-22; BR-07, BR-39.

- **Đầu vào/tiền điều kiện:** Report/Defect sơ bộ và căn cứ.
- **Hành vi/đầu ra bắt buộc:** Lựa chọn kiểm chứng, kết luận PM.
- **Kiểm chứng:** Given chưa cần số đo vật lý và bằng chứng drone đủ; When PM xác minh; Then không bắt nhiệm vụ đo giả. Khi cần số đo mà thiếu thì chưa đủ điều kiện.

### FR-14 — Phân cấp và ưu tiên

**Ưu tiên:** M. **Căn cứ:** CHỐT. **Trace:** US-34; BR-03, BR-04, BR-13, BR-14.

- **Đầu vào/tiền điều kiện:** Bằng chứng, severity/urgency, danh sách kế hoạch.
- **Hành vi/đầu ra bắt buộc:** Phân cấp có lịch sử và thứ tự PM.
- **Kiểm chứng:** Given gợi ý hệ thống đổi; When refresh; Then thứ tự PM đã giao giữ nguyên. Reporter/Crew không tự ghi đè. Lỗi chờ gom vẫn giữ mức khẩn cấp.

### FR-15 — Lập policy Fast Track

**Ưu tiên:** M. **Căn cứ:** CHỐT / CHI TIẾT TBD. **Trace:** US-33; BR-11, BR-12.

- **Đầu vào/tiền điều kiện:** PM, phiên bản, điều kiện, loại lỗi, biện pháp.
- **Hành vi/đầu ra bắt buộc:** Policy hiển thị Crew và bản áp dụng nhiệm vụ.
- **Kiểm chứng:** Given Crew xem ngoại tuyến; When mở nhiệm vụ đã tải; Then thấy đúng policy đã nhận. Không đủ cấu hình bắt buộc không tự kết luận đủ điều kiện. D03: Supervisor ban hành khung, PM kích hoạt trong khung; vượt khung cần phê duyệt.

**Readiness / acceptance gate: CONDITIONAL.** Q02 business authority đã chốt bởi D03. Q03 technical basis/ngưỡng/hạn mức và framework/version/exception contract vẫn chưa freeze; production activation/evaluation fail closed khi thiếu hồ sơ.

### FR-16 — Gom đợt đo

**Ưu tiên:** M. **Căn cứ:** CHỐT D02/32A. **Trace:** US-35; BR-09/10.

**Gate:** batch luôn chỉ đo; reminder hằng tuần chỉ nhắc PM rà soát, không tự tạo/giao task hoặc cấp quyền. Cần contract/config/test cho reminder và link task sửa sau đo; không hỏi lại quyết định 32A.

- **Đầu vào/tiền điều kiện:** PM chọn lỗi lớn/nhỏ, đội, nhiệm vụ chỉ-đo.
- **Hành vi/đầu ra bắt buộc:** Đợt đo, kết quả từng lỗi; kế hoạch sửa sau.
- **Kiểm chứng:** Given 10 lỗi có 5 lỗi nhỏ; When Crew đo thấy năm lỗi đạt policy; Then chỉ gửi kết quả, không tự sửa. PM phân công sửa bằng hành động riêng.

### FR-17 — Phiên đo và xác nhận

**Ưu tiên:** M. **Căn cứ:** CHỐT. **Trace:** US-20; BR-05, BR-07, BR-17.

- **Đầu vào/tiền điều kiện:** Task, người/đội, số đo/đơn vị, dụng cụ, vị trí, ảnh.
- **Hành vi/đầu ra bắt buộc:** Phiên đo có phiên bản và kết quả kiểm tra.
- **Kiểm chứng:** Given phiên đo ngoài Fast Track thiếu ảnh hoặc số đo; When nộp; Then không được chấp nhận và phải đo lại theo Q05. Số đo nhỏ hơn kết luận PM không cấp quyền sửa.

### FR-18 — Fast Track cùng chuyến

**Ưu tiên:** M. **Căn cứ:** CHỐT. **Trace:** US-33; BR-05, BR-06, BR-08, BR-14, BR-15, BR-25.

- **Đầu vào/tiền điều kiện:** Nhiệm vụ đo-và-sửa, policy, BEFORE, số đo.
- **Hành vi/đầu ra bắt buộc:** Lần sửa, AFTER, báo cáo PM.
- **Kiểm chứng:** Given một lỗi nhỏ được giao đo-và-sửa, offline và đạt policy; When Crew thực hiện; Then lưu kết quả/sync sau; không chờ PM duyệt từng số đo, không tự đóng.

**Readiness / acceptance gate: CONDITIONAL.** Nhánh nghiệp vụ Fast Track đã chốt; nghiệm thu end-to-end phụ thuộc Q02/Q03 và các case Q04/Q06 liên quan. Không tự thêm gate Supervisor duyệt sửa trước thi công.

### FR-19 — Duyệt từng công việc

**Ưu tiên:** M. **Căn cứ:** CHỐT + KẾ THỪA. **Trace:** US-11; BR-21, BR-22, BR-23.

- **Đầu vào/tiền điều kiện:** Phương án/bằng chứng từng item, bản trình.
- **Hành vi/đầu ra bắt buộc:** Quyết định từng item và lịch sử.
- **Kiểm chứng:** Given A được duyệt, B cần ảnh, C bị từ chối; When lưu; Then A đủ điều kiện giao, B chờ ảnh, C kết thúc đề xuất nhưng Defect mở.

### FR-20 — Phân công Crew

**Ưu tiên:** M. **Căn cứ:** CHỐT / NGOẠI LỆ ĐỀ XUẤT. **Trace:** US-12; BR-03, BR-23, BR-24.

- **Đầu vào/tiền điều kiện:** PM, item/phạm vi, Crew, thứ tự, phiên bản.
- **Hành vi/đầu ra bắt buộc:** Assignment và dấu nhận/bàn giao.
- **Kiểm chứng:** Given item APPROVAL_TRACK chưa duyệt; When giao thi công; Then bị chặn. Đổi đội giữ lịch sử; xung đột đội cũ offline không giải quyết bằng ghi đè.

### FR-21 — Ảnh trước/sau và tiến độ

**Ưu tiên:** M. **Căn cứ:** CHỐT / ĐIỀU KIỆN ĐỀ XUẤT. **Trace:** US-13; BR-17, BR-18, BR-20.

- **Đầu vào/tiền điều kiện:** Ảnh gốc/ảnh đo, thời điểm, lần sửa, số đo.
- **Hành vi/đầu ra bắt buộc:** Evidence đúng nguồn và lần xử lý.
- **Kiểm chứng:** Given Fast Track có ảnh Reporter phù hợp; When ghi BEFORE; Then giữ nguồn, không giả ảnh Crew mới chụp. Thiếu BEFORE hợp lệ chặn bắt đầu theo app.

### FR-22 — Hàng đợi ngoại tuyến

**Ưu tiên:** M. **Căn cứ:** CHỐT + KẾ THỪA. **Trace:** US-02; BR-15, BR-16, BR-19, BR-20.

- **Đầu vào/tiền điều kiện:** Dữ liệu cục bộ, snapshot, thao tác đã gửi.
- **Hành vi/đầu ra bắt buộc:** Sync idempotent, toàn vẹn hoặc hàng xung đột.
- **Kiểm chứng:** Given app bị dừng/mất mạng khi upload; When được chạy lại có mạng; Then tiếp tục không tạo bản ghi trùng. Mất mạng không tự hết quyền Fast Track.

**Readiness / acceptance gate: CONDITIONAL.** D05/D06/42A đã chốt business authority cho handover/conflict/rescue. End-to-end vẫn chờ acknowledgement/intake/rescue wire schema, security, atomic race and device/key tests. Core durability/dedup có thể kiểm riêng; không ghi FR-22 toàn bộ PASS trước các gate kỹ thuật.

### FR-23 — Kiểm tra và đóng

**Ưu tiên:** M. **Căn cứ:** CHỐT. **Trace:** US-14, US-23; BR-25, BR-26, BR-27.

- **Đầu vào/tiền điều kiện:** Báo cáo đủ tệp, kết quả theo lỗi.
- **Hành vi/đầu ra bắt buộc:** Đạt/chưa đạt, đóng theo thẩm quyền.
- **Kiểm chứng:** Given Fast Track đạt; When PM xác nhận; Then đóng và báo Supervisor. Hồ sơ hỗn hợp còn một lỗi chưa đạt không được đóng tổng.

### FR-24 — Sửa lại/tái phát

**Ưu tiên:** M. **Căn cứ:** CHỐT / QUYỀN MỞ LẠI TBD. **Trace:** US-14, US-37; BR-27, BR-28.

- **Đầu vào/tiền điều kiện:** Phản ánh sau sửa, hồ sơ trước và bằng chứng.
- **Hành vi/đầu ra bắt buộc:** Kết luận chưa đạt/tái phát và lịch sử.
- **Kiểm chứng:** Given cùng vị trí sau nghiệm thu; When report mới; Then PM phân biệt, không auto merge hoặc auto reopen. Quyền mở lại hồ sơ Supervisor theo Q07.

### FR-25 — Công bố kết quả

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA / TỪNG PHẦN TBD. **Trace:** US-23; BR-29, BR-48.

- **Đầu vào/tiền điều kiện:** Quyết định hợp lệ, ảnh được PM chọn.
- **Hành vi/đầu ra bắt buộc:** Timeline công khai theo người báo.
- **Kiểm chứng:** Given chưa được nghiệm thu; When Crew upload; Then không tự công bố REPAIRED. Công bố từng phần chờ Q08; không lộ bằng chứng nội bộ.

### FR-26 — Nhiệm vụ khảo sát

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-04, US-05, US-07; BR-07, BR-40, BR-43.

- **Đầu vào/tiền điều kiện:** PM chọn version/segment/band, Operator, điểm tiếp cận.
- **Hành vi/đầu ra bắt buộc:** Task, trạng thái nhận/từ chối/đổi/bổ sung.
- **Kiểm chứng:** Given thiếu dữ liệu mép phải; When PM yêu cầu bổ sung; Then giữ mép trái đã đạt và lịch sử, có thể đổi Operator.

### FR-27 — Tiếp nhận video/telemetry

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-06; BR-20, BR-42.

- **Đầu vào/tiền điều kiện:** Video, SRT/phụ đề, metadata chuyến.
- **Hành vi/đầu ra bắt buộc:** Dataset toàn vẹn, quality và job riêng.
- **Kiểm chứng:** Given thiếu telemetry; When upload video hợp lệ; Then không giả đủ định vị/coverage; giữ trạng thái thiếu theo contract. Không mất bản gốc khi retry.

### FR-28 — Đánh giá SRT và coverage

**Ưu tiên:** M-TBD. **Căn cứ:** KẾ THỪA / TIÊU CHÍ TBD. **Trace:** US-25, US-39; BR-35, BR-41.

- **Đầu vào/tiền điều kiện:** Video/telemetry đồng bộ, phạm vi nhiệm vụ.
- **Hành vi/đầu ra bắt buộc:** Kết quả vị trí, chất lượng và coverage riêng.
- **Kiểm chứng:** Given GPS trong vùng nhưng không nhìn được mép; When đánh giá; Then không tự đạt coverage. Tách thời gian chuyển nhánh/cất-hạ cánh khi đủ dữ liệu; thiếu thì UNKNOWN.

### FR-29 — AI bất đồng bộ

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-26; BR-39, BR-42.

- **Đầu vào/tiền điều kiện:** Dataset, manifest, model/config có version.
- **Hành vi/đầu ra bắt buộc:** JobId, raw result và detections có nguồn.
- **Kiểm chứng:** Given worker chết/retry; When chạy lại; Then không mất manifest hoặc tạo kết quả nghiệp vụ trùng. Mock có nhãn; result muộn không ghi đè bản hiện hành.

### FR-30 — Baseline và theo kỳ

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-04, US-09, US-25; BR-39, BR-40.

- **Đầu vào/tiền điều kiện:** Dữ liệu/band đủ điều kiện, kết luận PM.
- **Hành vi/đầu ra bắt buộc:** Baseline theo segment/band.
- **Kiểm chứng:** Given mặt đường đủ nhưng mép thiếu; When xác nhận; Then chỉ phần đủ được baseline; không đổi lịch sử khi model/tuyến thay.

### FR-31 — Research validation

**Ưu tiên:** M-RESEARCH. **Căn cứ:** KẾ THỪA BẮT BUỘC NGHIÊN CỨU. **Trace:** US-20, US-26; BR-44.

- **Đầu vào/tiền điều kiện:** Ground truth, derived measurement, sample IDs.
- **Hành vi/đầu ra bắt buộc:** Ghép cặp, bias, MAE/RMSE và báo cáo.
- **Kiểm chứng:** Given mẫu thiếu hoặc không ghép được; When tính; Then nêu số mẫu dùng/loại và lý do; không dùng mock làm bằng chứng độ chính xác.

### FR-32 — Google Maps

**Ưu tiên:** M-S1. **Căn cứ:** CHỐT. **Trace:** US-40; BR-38.

- **Đầu vào/tiền điều kiện:** Task có quyền và đích WGS84.
- **Hành vi/đầu ra bắt buộc:** Chuyển Maps hoặc hiển thị tọa độ.
- **Kiểm chứng:** Given Operator chưa có điểm tập kết; When bấm; Then yêu cầu bổ sung, không lấy trung điểm segment. Mở Maps không tự đổi trạng thái việc.

### FR-33 — Lập phạm vi bay nhiều nhánh

**Ưu tiên:** M-TBD. **Căn cứ:** NHU CẦU CHỐT / GIẢI PHÁP ĐỀ XUẤT. **Trace:** US-39; BR-36, BR-41, BR-43.

- **Đầu vào/tiền điều kiện:** Nhánh/band, điểm cất-hạ cánh, nhóm mission.
- **Hành vi/đầu ra bắt buộc:** Phạm vi/tệp export có mã và version.
- **Kiểm chứng:** Given nhiều nhánh; When lập kế hoạch; Then không bắt thứ tự trục-chính-trước cho mọi trường hợp; Operator kiểm tra mission ngoài RoadGuard, không gửi lệnh bay từ hệ thống.

### FR-34 — Dashboard và timeline

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-15, US-29; BR-03, BR-29, BR-45.

- **Đầu vào/tiền điều kiện:** Sự kiện bền vững và trạng thái hồ sơ.
- **Hành vi/đầu ra bắt buộc:** Dashboard theo phạm vi, drilldown nguồn.
- **Kiểm chứng:** Given sự kiện retry; When đọc timeline; Then không nhân đôi; số thống kê phân biệt báo cáo/lỗi/tấm/việc sửa.

### FR-35 — Xuất và lưu trữ

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA. **Trace:** US-16, US-19; BR-20, BR-45.

- **Đầu vào/tiền điều kiện:** Scope, bộ lọc, quyền, trạng thái giữ.
- **Hành vi/đầu ra bắt buộc:** Hồ sơ xuất có nguồn, tác vụ xóa được duyệt.
- **Kiểm chứng:** Given tranh chấp/thiếu thời hạn; When xóa; Then bị chặn. Tệp xuất ghi phần thiếu thay vì giả đầy đủ.

### FR-36 — Quản trị cấu hình/mô hình

**Ưu tiên:** M. **Căn cứ:** KẾ THỪA + 34A. **Trace:** US-10, US-17, US-18; BR-02, BR-39, BR-42, BR-45.

- **Đầu vào/tiền điều kiện:** Admin, rule/model versions, tài khoản.
- **Hành vi/đầu ra bắt buộc:** Cấu hình phát hành có audit; PM duyệt/từ chối nhãn trong project và chỉ nhãn đã duyệt được export cho training; AI không tự duyệt.
- **Kiểm chứng:** Given đổi model/rule; When xem kết quả cũ; Then giữ phiên bản đã dùng; không tái tính ngược âm thầm.

### FR-37 — Emergency tạm

**Ưu tiên:** M-TBD. **Căn cứ:** KẾ THỪA. **Trace:** US-41; BR-14, BR-46.

- **Đầu vào/tiền điều kiện:** PM kích hoạt, lý do và Crew đủ điều kiện.
- **Hành vi/đầu ra bắt buộc:** Nhiệm vụ tạm, báo Supervisor và hậu kiểm.
- **Kiểm chứng:** Given rào chắn xong nhưng hư hỏng còn; When đóng nhiệm vụ tạm; Then Defect không tự RESOLVED; sửa chính thức tiếp tục theo nhánh phù hợp.

## 4. Yêu cầu dữ liệu và trạng thái

| Đối tượng | Dữ liệu/quan hệ cần có | Invariant |
|---|---|---|
| Dự án | PM chính, bảo hành, CRS kỹ thuật | Đúng scope, lịch sử đổi PM/CRS |
| Tuyến/nhánh/version | Polyline, nguồn, bề rộng theo đoạn, station origin, nút giao nếu áp dụng | Không ghi đè version đã dùng |
| Tấm | Mã, dải, phạm vi, khe/nguồn, dự kiến hay xác nhận | Không lấy lưới dự kiến làm hoàn công |
| Report | Owner, ảnh/vị trí/thời điểm riêng, liên kết case/lỗi | Giữ nguồn dù gộp |
| Defect | Loại, severity, urgency, vị trí/tấm, nguồn, lifecycle | Khác trạng thái proposal/task/case |
| Task/assignment | Scope, chỉ-đo hay đo-và-sửa, Crew, thứ tự, phiên bản đã nhận | Không cấp quyền từ số lượng report |
| Policy/evaluation | Nội dung và version áp dụng, phép đo, căn cứ đạt/không đạt | Không đổi ngược quyết định cũ |
| Measurement/evidence | Giá trị/đơn vị/dụng cụ, BEFORE/AFTER, file checksum, nguồn và thời điểm | Thiếu bắt buộc chưa đủ nghiệm thu |
| Repair item/attempt | Nhánh, proposal version, quyết định từng item, từng lần sửa | REJECT proposal không xóa Defect |
| Survey/job | Dataset, timeline, manifest, model/config, band, coverage riêng | Mock và real có nguồn; job thành công khác đủ coverage |

State machine logic (tên chưa khóa enum): hồ sơ tiếp nhận → điều phối → kiểm chứng/xử lý → chờ kiểm tra → xác nhận → đóng. Chưa đạt quay xử lý phần tương ứng. Task, eligibility, approval, physical completion, sync và acceptance cần trường/trạng thái riêng; không dùng một status cho mọi việc.

Defect VERIFIED là xác minh trước sửa của nhánh thông thường; không đồng nghĩa Case Verified sau nghiệm thu. Fast Track được cấp quyền có điều kiện trước PM nghiệm thu; không ép gate PM VERIFIED cũ lên mọi lần sửa. D02 quy định task sửa riêng sau batch; D09 quy định reopen authority. Wire/version/audit contract vẫn là gate.

## 5. Yêu cầu phi chức năng

| ID | Yêu cầu | Cách kiểm chứng / mốc cần chốt |
|---|---|---|
| NFR-01 | Phân quyền nhất quán ở API và tệp; không log password/OTP/token | Test vai trò đúng, sai role, ngoài project, sai owner và URL tệp |
| NFR-02 | Dữ liệu quan trọng bền vững, retry không nhân đôi | Restart worker/app giữa thao tác; replay key cùng/khác payload |
| NFR-03 | Chống ghi đè bản cũ, audit quyết định | Hai phiên PM đổi cùng đối tượng; thao tác stale bị phát hiện |
| NFR-04 | Ngoại tuyến sau restart giữ dữ liệu đã lưu | Airplane mode, force-stop, khởi động lại, sync; không hứa app luôn chạy nền |
| NFR-05 | Toàn vẹn tệp và tham chiếu | Kiểm checksum, thiếu part, URL hết hạn, tệp sai MIME/nội dung; không coi ETag multipart mặc định là MD5 toàn tệp |
| NFR-06 | Hiệu năng API metadata tách tác vụ dài | Đo p50/p95/p99 dưới workload được duyệt; mục tiêu số ms, concurrent users là PERF-TBD |
| NFR-07 | Bản đồ theo viewport/zoom, không tải tất cả video/tấm toàn dự án | Test tuyến mẫu + lượng đối tượng được chốt; ngân sách bộ nhớ/FPS là MAP-TBD |
| NFR-08 | Khôi phục backup DB và object storage đồng bộ | Restore thử, kiểm referential integrity/checksum; RPO/RTO là OPS-TBD, chưa có SLA cam kết |
| NFR-09 | Quan sát vận hành có correlation ID | Theo dấu report → task → upload/job → kết quả; alert lỗi retry/exhaustion và queue age |
| NFR-10 | Tách mock/real, tái lập phân tích | Cùng manifest/model/config cho phép truy lại nguồn; không dùng mock trong bảng accuracy thật |
| NFR-11 | Migration và nâng cấp bảo toàn enum/dữ liệu cũ | Test migration trên snapshot có dữ liệu, không drop lịch sử để đạt AC |
| NFR-12 | Giao diện tiếng Việt, đơn vị rõ và thông báo có thể xử lý | Không đảo lat/lon, không nhầm m/mm, hiển thị pending/offline/conflict |
| NFR-13 | Hỗ trợ thiết bị/OS/browser xác định trước nghiệm thu | Ma trận Android, bộ nhớ, camera, drone, browser cần chủ dự án/nhóm cung cấp |
| NFR-14 | Giấy phép, dữ liệu bản đồ và weights có nguồn | Ghi package/version/license, model hash/dataset rights trước phát hành; không suy open source = mọi dữ liệu miễn phí |

Không tự đặt uptime, sai số cm, GPU FPS, ngưỡng mAP hay thời gian xử lý khi chưa có workload/thiết bị/tập thử. Các TBD là điều kiện chưa hoàn thiện SRS ở phần đo lường, không phải tiêu chí đã đạt.

## 6. Giao diện tích hợp

| Giao diện | Contract tối thiểu |
|---|---|
| Web/Android ↔ BE | Auth, scope, version/concurrency token, client operation ID, lỗi có mã/chi tiết, pagination; timestamp UTC + hiển thị địa phương |
| Upload ↔ object storage | Upload session/part IDs, URL có hạn, xác nhận toàn vẹn, resume/renew sau xác thực; BE giữ quyền quyết định hoàn thành |
| BE ↔ AI | Manifest version, dataset/model/config, async job status, result checksum/schema, mock/real, retry/dedup; không cho AI ghi trực tiếp business DB |
| CRS engine | Source/target CRS rõ, axis order, engine/version, điểm kiểm tra; sai transform trả lỗi, không đổi nhãn giả |
| Dronelink | Tệp phạm vi KML/KMZ hoặc định dạng đã thử; mã nhánh/mission và version; Operator nhập/kiểm tra ngoài app |
| Google Maps | Chỉ tọa độ đích WGS84 cần thiết, mở URL/ứng dụng; không callback giả chứng minh đã tới |
| Email/notification | Outbox/event identity, provider correlation, retry; không lộ OTP/token trong log |

Contract REST/SQL cụ thể phải sinh/đối chiếu checkout và schema, không coi bảng này là danh sách endpoint đã có.

## 7. Nghiên cứu công nghệ BE, FE và AI

### 7.1 Kết luận lựa chọn đề xuất

Giữ stack C#/SQL Server/Kotlin/MapLibre đã hướng. Nếu làm mới hoặc nâng cấp được kiểm chứng, ưu tiên .NET LTS còn thời gian hỗ trợ dài; không tự nâng checkout hiện có. Web có thể dùng React + TypeScript + Vite cho dashboard gọi API riêng. AI là Python service/worker tách biệt; chọn mô hình từ benchmark dữ liệu RoadGuard, không chọn chỉ vì tên hoặc bản mới nhất.

Kiến trúc giai đoạn đầu đề xuất: backend theo module + một worker bền vững, SQL Server, object storage và một AI worker có thể chạy tách. Chưa cần Kubernetes, Kafka, nhiều microservice hoặc GPU hoạt động liên tục nếu tải chưa chứng minh cần.

### 7.2 Backend và hạ tầng

| Thành phần | Ứng viên và mức ưu tiên | Phù hợp RoadGuard / điều kiện |
|---|---|---|
| API | ASP.NET Core trên .NET 10 LTS nếu tương thích | Nguồn Microsoft xác nhận .NET 10 là LTS; rà target/package hiện có trước nâng. Không pin patch từ tài liệu này [T01] |
| ORM/DB | EF Core + Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite | Mapping SQL Server spatial; chỉ định geometry/geography rõ, không dựa default [T02,T03] |
| Hình học | NetTopologySuite | Buffer, intersection, simplify, linear referencing theo tọa độ phẳng; SRID không tự reprojection ở client [T02] |
| Chuyển hệ | PROJ qua adapter được kiểm chứng; ProjNet là ứng viên có giới hạn | PROJ hỗ trợ hệ chuyển đổi rộng. ProjNet README hiện thông báo thiếu nguồn lực bảo trì và LGPL-2.1; không chọn mặc định chỉ vì đã nhắc trong hội thoại [T04,T05] |
| GPX/XML | Bộ đọc XML chuẩn nền .NET, giới hạn đầu vào | Tự viết phần mapping nhỏ theo contract track; tắt DTD/external entity, kiểm số điểm/kích thước; không cần gói GPX thiếu bảo trì chỉ để parse vài thẻ |
| Job nền | Tái sử dụng job/outbox hiện có; Quartz.NET persistent store nếu cần scheduler | Quartz có SQL Server store; scheduler không thay transactional outbox, lease/retry/idempotency nghiệp vụ [T06] |
| Kho tệp | IObjectStorage + nhà cung cấp S3-compatible đã kiểm chứng | Presigned/multipart giúp không đẩy toàn video qua API; URL hết hạn phải cấp lại, chưa mặc định mọi provider hỗ trợ giống S3 [T07] |
| Quan sát | OpenTelemetry .NET | Trace/metrics/log correlation; chọn backend giám sát theo hạ tầng thực, không ghi dữ liệu cá nhân vào span [T08] |
| Thông báo UI | Polling trạng thái ở MVP; real-time là bổ sung có nhu cầu | Notification phải bền vững dù client offline; không dùng kết nối real-time làm nguồn sự thật |

Giấy phép SQL Server, dung lượng video, băng thông/egress và vận hành backup là chi phí cần đo/chọn theo môi trường. Không cung cấp giá cố định hoặc tự chuyển DB chỉ vì chi phí; phải tính cả chi phí thay code/migration hiện có.

### 7.3 Frontend Web

| Thành phần | Ứng viên | Cách dùng / giới hạn |
|---|---|---|
| Dashboard | React + TypeScript + Vite | Phù hợp SPA nội bộ có BE riêng; React có hướng dẫn build với Vite. Nếu FE đã có framework hoạt động thì đánh giá tái sử dụng trước [T09] |
| Server state | TanStack Query | Cache/refetch dữ liệu API; không biến cache thành hệ thống đồng bộ bằng chứng offline bền vững [T10] |
| Bản đồ | MapLibre GL JS | Overlay tuyến, mặt đường, nhánh/tấm/lỗi; tải theo viewport, dùng vector tiles khi dữ liệu tăng [T11] |
| Chỉnh hình học | Terra Draw + MapLibre adapter | Candidate cho điểm/line/polygon; phải thử snapping/nút giao/versioning, không giả có editor topology hoàn chỉnh [T12] |
| Form/lịch/thứ tự | Component phù hợp stack hiện có | PM sắp xếp bằng kéo-thả và nút bàn phím; BE vẫn kiểm quyền/version; chọn package cụ thể sau rà checkout |
| Tính hình học FE | Chỉ preview | Kết quả metric/công bố dùng BE; tránh thuật toán/CRS khác nhau FE và BE |

Nguồn tiles, style, fonts và sprites phải được chọn riêng. Thư viện MapLibre không cung cấp quyền tải nền ngoại tuyến vô hạn. OSM public tile policy không phù hợp cho chức năng tải sẵn vùng hàng loạt; chọn nhà cung cấp cho phép hoặc tự host dữ liệu có quyền [T13].

### 7.4 Android

| Thành phần | Ứng viên | Cách dùng / giới hạn |
|---|---|---|
| Ngôn ngữ/UI | Kotlin; Jetpack Compose hoặc UI hiện có | Giữ Kotlin đã hướng; không đổi sang Flutter/React Native chỉ để dùng thư viện bản đồ |
| Local DB | Room | Lưu task/policy/sync outbox có version, file paths và thao tác pending; file lớn ngoài DB [T14] |
| Đồng bộ | WorkManager + cơ chế transfer phù hợp OS | Tác vụ bền vững có ràng buộc mạng/retry; video dài cần kiểm quota/foreground/user-initiated transfer theo Android đích, không hứa luôn chạy [T15,T16] |
| Camera | CameraX | Candidate chụp BEFORE/AFTER trong luồng app; lưu metadata và source, không bảo đảm người dùng không sửa ngoài app [T17] |
| Map | MapLibre Native Android | OfflineRegion cho vùng đã tải; phải có nguồn tile/font/sprite cho phép, không chỉ cache business GeoJSON [T18] |
| Chỉ đường | Google Maps URLs | Có tham số đích và hướng dẫn chính thức; không cần API định tuyến riêng cho việc chuyển app [T19] |

Thiết kế offline-first theo Android: local source phục vụ đọc/ghi tại hiện trường, network sync sau [T20]. Sửa offline không giới hạn thời gian nghiệp vụ không đồng nghĩa token server không bao giờ hết hạn; khi sync có thể cần đăng nhập lại, nhưng không được xóa bằng chứng cục bộ.

### 7.5 AI, video và geospatial nâng cao

| Nhu cầu | Ứng viên | Đánh giá và quyết định đề xuất |
|---|---|---|
| API adapter AI | FastAPI | Hợp Python pipeline; video/GPU dài phải nằm worker/job bền vững, không dùng BackgroundTasks đơn thuần làm hàng đợi bảo đảm [T21] |
| Train/baseline | PyTorch + TorchVision | Có detection/segmentation; dùng mô hình baseline tái lập. Weights có thể có điều kiện riêng từ dataset [T22] |
| Detector nhanh | Ultralytics YOLO | Dễ thử detection/segmentation; AGPL-3.0 hoặc Enterprise theo nhà cung cấp. Phải xem license code/weights/cách dùng; không mặc định mọi sản phẩm đóng nguồn được dùng miễn phí [T23] |
| Detector thay thế | YOLOX | Repo code Apache-2.0; là baseline so sánh, cần kiểm toolchain/bảo trì và weights riêng; không mặc định tốt hơn trên đường RoadGuard [T24] |
| Inference tối ưu | ONNX Runtime | Cân nhắc CPU/GPU sau export và kiểm tương đương số; không thêm ngay nếu PyTorch đã đạt nhu cầu [T25] |
| Ảnh và calibration | OpenCV | Hiệu chỉnh camera/biến đổi phối cảnh, xử lý ảnh; homography cần giả định mặt phẳng và calibration, không tự đo độ sâu từ bbox [T26] |
| Video/metadata | FFmpeg/ffprobe | Kiểm codec/timeline, trích frame/subtitle; SRT parser phải version theo drone. Giấy phép phụ thuộc build LGPL/GPL và codec [T27] |
| Gán nhãn | CVAT | Candidate quản lý annotation ảnh/video; giữ PM duyệt nhãn ở RoadGuard; đối chiếu edition/license/export format khi chọn [T28] |
| Orthomosaic/DSM | OpenDroneMap | Nâng cao/research; GCP/kiểm định vị và ảnh đủ điều kiện mới hỗ trợ đo, không suy video bất kỳ tạo DSM đáng tin [T29] |

**Pipeline đề xuất:** nhận manifest → kiểm video/telemetry → lấy frame với ánh xạ thời gian → quality filter → detection/segmentation → liên kết quan sát trùng giữa frame/block → ước lượng vị trí có mức tin cậy → PM rà → đo kiểm chứng nếu cần. Không tạo GPS lỗi bằng chép GPS drone.

Không xác định Fast Track chỉ bằng mô hình: eligibility là policy theo phép đo và quyền. Vết nứt mảnh có thể cần segmentation hoặc ảnh độ phân giải tốt; mAP bbox không đủ chứng minh đo chiều rộng nứt. Monocular depth dù có đầu ra mét cũng không thay validation depression/slab faulting ngoài thực địa.

**Chọn model bằng thử nghiệm:** tách train/validation/test theo tuyến/chuyến/thời gian để hạn chế frame gần trùng rò rỉ; báo precision/recall theo loại lỗi, IoU/mask nếu dùng, false negative quan trọng, sai số định vị và sai số đo riêng; đo latency/VRAM trên phần cứng thật. Ngưỡng pass là AI-TBD, không tự ghi 95% hoặc FPS chưa đo. Giữ model hash, cấu hình, dataset split và license.

### 7.6 Thử nghiệm công nghệ tối thiểu trước khi chốt

| Spike | Kết quả cần có |
|---|---|
| SP-01 CRS/hình học | Điểm chuẩn → transform → chiều dài/buffer vùng 12 m; kiểm đường cong/ngã ba và axis order, so với mốc thực |
| SP-02 Mobile offline | Task/policy/ảnh tồn tại sau restart; sync đứt mạng/URL hết hạn không trùng; xung đột bản PM được giữ |
| SP-03 Media | Một bộ MP4/SRT thật từng drone/firmware, chứng minh parse/timestamp và giới hạn trường thiếu |
| SP-04 Map | Dataset nhánh/tấm thật hoặc có nhãn fixture; viewport/zoom và sửa geometry không giật vượt mục tiêu được duyệt |
| SP-05 AI | Hai baseline cùng dataset split/phần cứng; bảng sai số và chi phí/thời gian, không so chỉ số quảng cáo |
| SP-06 Dronelink | Import phạm vi thử, Operator kiểm lại đường chuyển và cấu hình thu; xuất dữ liệu khớp RoadGuard |

Các spike là việc đề xuất sau khi giao triển khai; chưa chạy trong lần viết tài liệu.

## 8. Danh mục nguồn nghiên cứu

Nguồn chính thức đã tra cứu ngày 26/09/2026. Liên kết không thay việc khóa version/license trong checkout. Các đánh giá phù hợp/ưu tiên trong §7 là đề xuất của người soạn, không phải nhà cung cấp chứng nhận RoadGuard.

- **T01:** [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)
- **T02:** [EF Core spatial / NetTopologySuite](https://learn.microsoft.com/en-us/ef/core/modeling/spatial)
- **T03:** [SQL Server spatial provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/spatial)
- **T04:** [PROJ coordinate transformation](https://proj.org/en/stable/usage/transformation.html)
- **T05:** [ProjNet README và LICENSE](https://github.com/NetTopologySuite/ProjNet4GeoAPI)
- **T06:** [Quartz.NET persistent job store](https://www.quartz-scheduler.net/documentation/quartz-3.x/tutorial/job-stores.html)
- **T07:** [S3 presigned uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- **T08:** [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/)
- **T09:** [React build from scratch](https://react.dev/learn/build-a-react-app-from-scratch)
- **T10:** [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/reference/index)
- **T11:** [MapLibre large data](https://maplibre.org/maplibre-gl-js/docs/guides/large-data/)
- **T12:** [Terra Draw adapters](https://github.com/JamesLMilner/terra-draw/blob/main/guides/3.ADAPTERS.md)
- **T13:** [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- **T14:** [Room](https://developer.android.com/training/data-storage/room)
- **T15:** [WorkManager persistent work](https://developer.android.com/develop/background-work/background-tasks/persistent)
- **T16:** [Long-running workers](https://developer.android.com/develop/background-work/background-tasks/persistent/how-to/long-running)
- **T17:** [CameraX](https://developer.android.com/media/camera/camerax)
- **T18:** [MapLibre Native OfflineRegion](https://maplibre.org/maplibre-native/android/api/-map-libre%20-native%20-android/org.maplibre.android.offline/-offline-region/index.html)
- **T19:** [Google Maps URLs](https://developers.google.com/maps/documentation/urls/guide)
- **T20:** [Android offline-first](https://developer.android.com/topic/architecture/data-layer/offline-first)
- **T21:** [FastAPI Background Tasks limitations](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- **T22:** [TorchVision models and weights](https://docs.pytorch.org/vision/stable/models.html)
- **T23:** [Ultralytics documentation/licensing](https://docs.ultralytics.com/)
- **T24:** [YOLOX Apache-2.0 license](https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE)
- **T25:** [ONNX Runtime Python](https://onnxruntime.ai/docs/get-started/with-python.html)
- **T26:** [OpenCV calibration](https://docs.opencv.org/4.8.0/d9/d0c/group__calib3d.html)
- **T27:** [FFmpeg license/build conditions](https://ffmpeg.org/legal.html)
- **T28:** [CVAT documentation](https://docs.cvat.ai/docs/)
- **T29:** [OpenDroneMap GCP](https://docs.opendronemap.org/gcp/)
- **T30:** [Dronelink Corridor Mapping](https://support.dronelink.com/hc/en-us/articles/14090648504083-Linear-Corridor-Mapping)

## 9. Truy vết, nghiệm thu và điểm chưa hoàn thiện

FR-* ở §3 trỏ tới US-* và BR-*. To-Be dùng PF-*; User Stories gắn FR tương ứng. Mỗi test khi triển khai cần chỉ ra ID AC/FR, dữ liệu, role, expected/actual và bằng chứng; không coi tài liệu là kết quả test.

Giữ ID Q01–Q18 để truy vết qua decision register; D01-D28/32-44 supersede nhãn OPEN lịch sử đúng nội dung. PERF-TBD, MAP-TBD, OPS-TBD, AI-TBD, method thresholds, real-file calibration và wire contracts được register giữ mở. Không ban hành SRS “đã nghiệm thu đầy đủ” trước verification tương ứng.

P1 sở hữu API/service/DTO; P2 schema/mapping/migration/repository; FE local queue/map/UX; AI model/adapter/validation phối hợp BE. Giữ trạng thái Done cũ, tạo delta sau đối chiếu checkout. Lần này chỉ sửa tài liệu, không cài thư viện, đổi stack, chạy model hoặc nâng cấp code.

## V2(3) amendment — 2026-09-28

This document follows `planning/V2/V2-3_DECISION_REGISTER.md`. D01-D28 are approved business decisions; `APPROVED_PILOT_CONFIG` and `APPROVED_TARGET` are not empirical verification. The document must distinguish `contractStatus`, `implementationStatus`, and `verificationStatus`. Reporter email/password plus one-time email OTP is the approved authentication flow; web cookie transport, pilot limits, retention and performance values remain configuration/target registers. Fast Track uses measurement-only intake followed by a separately authorized PM repair task; policy framework, reopen, partial publication, handover/conflict, BEFORE incident, curing and traffic release remain explicit contracts. Offline evaluation and AI two-stage processing are proposed until schema, fixtures and runtime/provider evidence pass.
