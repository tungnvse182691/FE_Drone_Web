# RoadGuard — 11. Report & Analytics Requirements

**Phiên bản:** EXT-R3-2026-09-26-v1 • **Ngày:** 26/09/2026 • **Trạng thái:** bản đặc tả bổ sung để review, chưa xác nhận triển khai hoặc nghiệm thu.

**Nguồn chuẩn:** 9 tệp người dùng cung cấp ngày 26/09/2026; xem bảng nguồn trong README. Quyết định CHỐT/KẾ THỪA trong nguồn giữ nguyên. Các chi tiết mới dưới nhãn **ĐỀ XUẤT** phải được PO/chủ dự án duyệt trước khi thành baseline. Q01–Q18 vẫn theo Mô tả dự án §21; không tự giải quyết bằng tài liệu này. Mã trường ở đây là mapping logic, không xác nhận schema/endpoint đã tồn tại.

## 11.1 Mục tiêu, phạm vi và người dùng

Chi tiết hóa FR-34/35, US-15/16/29, BC01–BC10 và QT08/09. Báo cáo giúp PM điều phối, Supervisor kiểm soát danh mục và truy lại hồ sơ. Không tự tính quyết toán, tồn kho, chi phí nhân công hoặc ROI vì nguồn chưa có dữ liệu kế toán/định mức. Crew/Operator xem tiến độ nhiệm vụ của mình; Reporter chỉ có timeline phần được công bố thuộc ownership, không có dashboard nội bộ.

Mỗi màn hình phải hiển thị phạm vi quyền, bộ lọc, đơn vị đếm, mốc dữ liệu và trạng thái thiếu dữ liệu. Số 0 chỉ dùng khi truy vấn hợp lệ thực sự không có bản ghi; lỗi nguồn hoặc chưa đồng bộ hiển thị “Chưa có dữ liệu/Chưa cập nhật”.

## 11.2 Danh mục báo cáo/dashboard

Tần suất dưới đây là **đề xuất trải nghiệm**, chưa là SLA hoặc cam kết real-time. Tải mới khi mở/chuyển bộ lọc; nút Làm mới luôn có. Chỉ refresh màn hình đang hoạt động; lỗi refresh giữ snapshot cũ và cảnh báo.

| ID | Tên | Người xem | Dữ liệu hiển thị | Nguồn logic | Trace | Cập nhật đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| RPT-01 | Danh mục bảo hành | Supervisor | Số dự án theo trạng thái; PM chính; ngày hết bảo hành; dự án đến hạn; khảo sát thiếu baseline | Project + hồ sơ bàn giao/bảo hành + baseline | BC01; FR-04/34 | 5 phút; tính lại nhóm ngày khi sang ngày địa phương |
| RPT-02 | Điều hành dự án | PM trong membership; Supervisor | Report mới/chờ điều phối; Defect mở theo severity/urgency; việc chờ đo, chờ kế hoạch, chờ review; thứ tự PM | IncidentReport/Case, Defect, task, assignment | BC02/03; FR-14/16/34 | 60 giây và sau quyết định được server xác nhận |
| RPT-03 | Tiến độ sửa theo lỗi | PM; Supervisor | Item theo nhánh; lần sửa; bằng chứng thiếu; hoàn thành vật lý; chờ PM/Supervisor; đã nghiệm thu | RepairItem, assignment, attempt, evidence, review | BC03; FR-19–24/34 | 60 giây; không lấy phần trăm upload làm phần trăm sửa |
| RPT-04 | Fast Track và ngoại lệ | PM; Supervisor | Task đo-và-sửa; policy version; đủ/không đủ/chưa đủ dữ liệu; PM block; đã sửa; PM đóng; thông báo Supervisor | FieldInspectionTask, FastTrackEvaluation, policy, attempt, audit | SC13/HT09–12; FR-15/18/23 | 60 giây; notify sau PM đóng qua sự kiện bền vững |
| RPT-05 | Khảo sát, baseline và coverage | PM; Supervisor; Operator chỉ task được giao | Từng branch/segment/band/version; vị trí bay, chất lượng, coverage riêng; phần đạt/thiếu/UNKNOWN; lần bổ sung | SurveyWorkItem/CoverageRequirement/Result, video intervals, manifest | KS10/15/16; FR-26–30/33 | 60 giây khi job chạy; sau kết quả mới hoặc PM xác nhận |
| RPT-06 | Rủi ro và diễn biến | PM; Supervisor; so sánh liên dự án chỉ Supervisor | Lỗi theo severity/urgency; số đo và kỳ; mức thay đổi; nguồn và độ tin cậy; cảnh báo không tương thích | Defect + observation + measurements + baseline/version | BC04/05; FR-14/30/34 | 5 phút và khi PM xác nhận dữ liệu |
| RPT-07 | Hồ sơ bằng chứng xuất | PM; Supervisor đúng scope | PDF tổng hợp; ZIP ảnh/video/bảng kê khi cấu hình cho phép; nguồn, checksum, thiếu dữ liệu, các quyết định | BC06–10; dữ liệu có version tại mốc xuất | FR-35; US-16 | Theo yêu cầu; job nền nếu lớn; snapshot không đổi sau xuất |
| RPT-08 | Vận hành và đồng bộ | Supervisor/Admin; PM chỉ nghiệp vụ dự án | Queue age, job lỗi/retry, upload thiếu, conflict, dung lượng; không xem được dữ liệu chưa từng gửi từ máy offline | SyncOperation, upload session, ProcessingJob, telemetry vận hành | QT08/09; FR-22/29/36 | 60 giây; ngưỡng alert OPS-TBD |
| RPT-09 | Research validation | PM/nhóm nghiên cứu được cấp scope; Supervisor | Số cặp hợp lệ/bị loại; bias, MAE/RMSE theo phép đo/loại lỗi; model, split, thiết bị; kết quả mock tách riêng | GroundTruthMeasurement + derived measurements + manifest | FR-31; BR-44 | Theo mỗi lần chạy đánh giá được version hóa |
| RPT-10 | Lịch sử hoạt động | Vai trò theo scope; Reporter chỉ public projection | Actor, hành động, thời điểm, đối tượng, trước/sau theo quyền; event ID để dedup | Durable event/audit, IncidentCaseHistory | FR-34; US-29 | 60 giây và sau thao tác thành công |

## 11.3 Từ điển chỉ số và quy tắc tính

Thống kê tồn kho dùng trạng thái **tại mốc as-of**; thống kê phát sinh dùng sự kiện trong kỳ `[từ, đến)` theo UTC sau chuyển múi giờ. Không lấy số lỗi tạo trong kỳ làm mẫu số cho mọi tỷ lệ. Các công thức bổ sung là ĐỀ XUẤT, cần PO chốt trước dashboard baseline.

| ID | Chỉ số | Công thức | Ngoại lệ/giới hạn |
| --- | --- | --- | --- |
| MET-01 | Phản ánh nhận trong kỳ | COUNT DISTINCT report_id theo received_at trong kỳ | Giữ 5 report nếu 5 người báo; không gộp thành 1 report |
| MET-02 | Lỗi mở tại mốc | COUNT DISTINCT defect_id trong scope còn chưa đạt trạng thái kết thúc nghiệp vụ | Dùng state mapping được duyệt; kết thúc proposal REJECT không giảm lỗi mở |
| MET-03 | Hồ sơ đang mở | COUNT DISTINCT case_id còn mở tại as-of | Case đã gộp có nhãn liên kết, không cộng như thêm việc sửa; giữ nguồn |
| MET-04 | Tấm có lỗi | COUNT DISTINCT slab_id liên kết ít nhất một lỗi mở | Chỉ tấm đã xác nhận trong chỉ số tấm thật; tấm dự kiến và lỗi chưa gán tấm báo riêng |
| MET-05 | Tỷ lệ lỗi nghiệm thu trong cohort | Số defect thuộc cohort đã được nghiệm thu / tổng defect thuộc cohort ×100 | Cohort = danh sách lỗi thuộc phạm vi kế hoạch/snapshot đã chọn; mẫu số 0 → N/A; mỗi lỗi một lần dù nhiều attempt |
| MET-06 | Tiến độ item | COUNT DISTINCT item_id theo từng trạng thái/nhánh tại as-of | Item phiên bản thay thế không cộng cùng item đang hiệu lực vào tổng việc hiện hành; lịch sử riêng |
| MET-07 | Thời gian xử lý | accepted_at − received_at cho case đã nghiệm thu có đủ timestamp | Báo median/p95 và N; case mở báo tuổi tồn; không tự trừ thời gian chờ khi chưa có quy tắc |
| MET-08 | Chờ quá hạn | Task chưa hoàn tất và due_at < as-of | Thiếu due_at → Chưa đặt hạn, không tự là đúng hạn; ngưỡng nhắc bảo hành lấy cấu hình |
| MET-09 | Baseline theo band | Số cặp segment/band đã PM xác nhận / số cặp bắt buộc trong scope version | Kèm cả tử/mẫu; không trộn với % diện tích phủ; segment khác độ dài không suy thành % km |
| MET-10 | Coverage vật lý | Diện tích hoặc chiều dài quan sát hợp lệ / diện tích hoặc chiều dài yêu cầu cùng đơn vị | Chỉ khi có phương pháp/calibration đã kiểm; không suy từ GPS trong polygon; UNKNOWN không bằng 0% |
| MET-11 | Fast Track đóng | COUNT DISTINCT defect_id do PM đóng theo FAST_TRACK trong kỳ | Không chờ Supervisor duyệt; retry notify không tăng số đóng; ghi reopening như sự kiện riêng |
| MET-12 | Chất lượng đo AI | e=derived−ground_truth; bias=Σe/N; MAE=Σ\|e\|/N; RMSE=√(Σe²/N) | Tách đơn vị/loại phép đo/model/dataset; N=0 → N/A; không trộn mm với m hay mock với real |
| MET-13 | Thay đổi số đo | m_kỳ_sau − m_kỳ_trước trên cùng lỗi/phép đo/đơn vị và nguồn so sánh được | Thiếu kỳ hoặc phương pháp không tương thích → chưa đủ căn cứ; không dự báo chắc chắn thời điểm hỏng |

## 11.4 Bộ lọc, quyền và drilldown

Bộ lọc: project, branch/route version, segment set/segment, band, slab, defect type, severity, urgency, repair track, Crew, task mode, policy/model version, trạng thái, khoảng thời gian và loại mốc thời gian. Ẩn bộ lọc không áp dụng từng báo cáo. Dropdown và API cùng giới hạn scope; filter ID bị sửa tay vẫn phải bị chặn. Supervisor chọn nhiều dự án; PM chỉ các dự án được giao; export kiểm quyền khi yêu cầu và khi tải.

Click chỉ số mở đúng danh sách ID/điều kiện tạo ra số đó, giữ as-of. Nếu dữ liệu đã thay đổi, hiển thị cảnh báo và lựa chọn xem hiện tại; không ngầm đổi mẫu số. Bản đồ cluster dùng Defect riêng biệt, không đếm số detection/frame/report. Các kết quả AI chưa PM xác minh nằm lớp “sơ bộ” riêng.

## 11.5 Hợp đồng báo cáo và xuất

ĐỀ XUẤT metadata: report_id, report_type, metric_definition_version, requested_by, authorized_scope, filters, timezone, period_from/to, as_of, generated_at, source_version_ids, row_count, missing_data_summary, status và checksum tệp đầu ra. Đây là cấu trúc logic cần P1/P2 xác nhận, chưa tạo bảng mới trong DD.

PDF/ZIP theo US-16; CSV tổng hợp là tùy chọn mới, chưa tự đưa vào MVP. Tên tài khoản, email, vị trí và ảnh nội bộ chỉ xuất theo quyền. Không đưa OTP/token/URL ký tạm vào báo cáo. Escape dữ liệu nếu sau này có CSV để tránh công thức từ đầu vào. Export lớn có trạng thái chờ/đang tạo/thành công/lỗi; retry không nhân bản yêu cầu. Tệp thiếu nguồn ghi rõ missing và lý do; không đánh “đầy đủ”. Không dùng ngày tạo PDF thay cho thời điểm chụp.

## 11.6 AC và kiểm chứng báo cáo

| ID | Dữ liệu và hành động | Kết quả bắt buộc |
|---|---|---|
| RPT-AC-01 | 5 report được PM liên kết cùng một Defect; mở RPT-02 | MET-01=5, MET-02=1 nếu lỗi còn mở; drilldown giữ đủ 5 nguồn |
| RPT-AC-02 | D01/D02 cùng tấm; chỉ D02 đạt nghiệm thu | Không đóng D01; chỉ số lỗi còn mở=1; tiến độ cohort=1/2; tấm còn lỗi=1 |
| RPT-AC-03 | Crew đã AFTER nhưng chưa đủ tệp được server xác nhận | RPT-03 chưa tính nghiệm thu; hiển thị bằng chứng chưa đủ |
| RPT-AC-04 | PM đóng Fast Track, cùng event được giao lại hai lần | RPT-04 chỉ tăng một lần; timeline không trùng; không có gate Supervisor |
| RPT-AC-05 | GPS SRT trong vùng nhưng thiếu nhìn mép | RPT-05 không tự hiển thị coverage đạt; baseline mép chưa đạt |
| RPT-AC-06 | PM đổi project_id URL sang dự án không thuộc quyền | API/dashboard/export không lộ bản ghi, tên hoặc tổng số ngoài scope |
| RPT-AC-07 | Refresh lỗi hoặc máy ngoại tuyến | Giữ mốc dữ liệu cũ và cảnh báo; không đổi số thành 0 |
| RPT-AC-08 | Xuất tại T1 rồi sửa dữ liệu tại T2 | Tệp T1 giữ bộ lọc/version; xuất mới có snapshot mới |
| RPT-AC-09 | Mẫu số 0; thiếu ground truth; hai model khác nhau | N/A đúng chỗ, nêu N/loại; không tính tỷ lệ hoặc sai số giả |

Trace kiểm thử: TC-F34/35, TC-A của US-15/16/29 và UAT-09/10 trong phần 15. Refresh/load định lượng theo NFR-06, không mặc định đạt chỉ vì đã ghi tần suất.

## V2(3) amendment — 2026-09-28

This document follows `planning/V2/V2-3_DECISION_REGISTER.md`. D01-D28 are approved business decisions; `APPROVED_PILOT_CONFIG` and `APPROVED_TARGET` are not empirical verification. The document must distinguish `contractStatus`, `implementationStatus`, and `verificationStatus`. Reporter email/password plus one-time email OTP is the approved authentication flow; web cookie transport, pilot limits, retention and performance values remain configuration/target registers. Fast Track uses measurement-only intake followed by a separately authorized PM repair task; policy framework, reopen, partial publication, handover/conflict, BEFORE incident, curing and traffic release remain explicit contracts. Offline evaluation and AI two-stage processing are proposed until schema, fixtures and runtime/provider evidence pass.
