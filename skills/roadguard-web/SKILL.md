---
name: roadguard-web
description: "Skill chuyên sâu cho dự án RoadGuard Web Dashboard (Hoàng Hải). Chứa đặc tả chi tiết 18 màn hình Stitch, API mapping, mockup data, phân quyền PM vs Supervisor, và hướng dẫn dựng giao diện chuẩn xác."
---

# RoadGuard Web Dashboard — Technical & Screen Specifications

Skill này cung cấp toàn bộ đặc tả chức năng của 18 màn hình trên web dashboard RoadGuard, tương ứng với tài liệu phân tích `v2.2` và kịch bản thiết kế Stitch.

---

## 1. Bản Đồ 18 Màn Hình Chi Tiết

### Giai Đoạn 1: Tiếp Cận & Khởi Tạo Dự Án (Access & Initiation)
- **Màn 01: Đăng nhập & Đổi mật khẩu** (`/login`, `/force-change-password`)
  - *File:* `src/pages/(auth)/Login.tsx`, `ForceChangePassword.tsx`
  - *Mục đích:* Xác thực người dùng bằng username/password, kiểm tra cờ `must_change_password`.
  - *Thành phần:* Form đăng nhập 2 trường, logo Hoàng Hải RoadGuard, thông báo lỗi nếu sai credential.
- **Màn 02: Dashboard PM** (`/pm/dashboard`)
  - *File:* `src/pages/(pm)/PMDashboard.tsx`
  - *Mục đích:* Bảng điều khiển trung tâm của Project Manager.
  - *Thành phần:* 4 thẻ KPI (Khảo sát đang chờ, Lỗi mới phát hiện, Đợt sửa đang chạy, Đợt cần nộp duyệt), biểu đồ phân bổ mức độ lỗi, danh sách tác vụ khẩn cấp.
- **Màn 03: Dashboard Supervisor** (`/sup/dashboard`)
  - *File:* `src/pages/(sup)/SupDashboard.tsx`
  - *Mục đích:* Tổng quan giám sát toàn dự án & chỉ số rủi ro.
  - *Thành phần:* KPI thẩm duyệt (Đợt chờ duyệt, Đợt yêu cầu sửa đổi, Đợt chờ nghiệm thu), chỉ số PCI (Pavement Condition Index), bản đồ nhiệt (Heatmap) rủi ro tuyến đường.
- **Màn 04: Danh mục dự án bảo hành** (`/pm/projects`, `/sup/projects`)
  - *File:* `src/pages/(pm)/ProjectList.tsx`
  - *Mục đích:* Quản lý các đoạn đường/tuyến đường đang trong thời hạn bảo hành.
  - *Thành phần:* Bảng dữ liệu danh sách dự án (Mã, Tên tuyến, Lý trình Km, Ngày bắt đầu/kết thúc bảo hành, Trạng thái), thanh tìm kiếm & lọc.

---

### Giai Đoạn 2: Khảo Sát & Thẩm Định Hư Hỏng AI (Inspection & Defect Verification)
- **Màn 05: Danh sách yêu cầu bay khảo sát** (`/pm/surveys`)
  - *File:* `src/pages/(pm)/SurveyRequests.tsx`
  - *Mục đích:* Quản lý các đợt bay chụp ảnh của Drone.
  - *Thành phần:* Bảng tiến độ bay (Chờ bay, Đang bay, Đã tải lên thẻ nhớ, Đã phân tích AI), nút [Tạo yêu cầu mới].
- **Màn 06: Tạo yêu cầu khảo sát Drone** (`/pm/surveys/create`)
  - *File:* `src/pages/(pm)/CreateSurvey.tsx`
  - *Mục đích:* Lập kế hoạch bay cho Drone Operator.
  - *Thành phần:* Chọn tuyến đường dự án, phạm vi lý trình (Từ Km... Đến Km...), ngày bay dự kiến, chỉ định phi công bay, ghi chú an toàn.
- **Màn 07: Hộp thư tiếp nhận lỗi AI** (`/pm/ai-inbox`)
  - *File:* `src/pages/(pm)/AIReviewInbox.tsx`
  - *Mục đích:* Danh sách tất cả hư hỏng do mô hình AI phát hiện cần PM thẩm định.
  - *Thành phần:* Bảng phân loại lỗi (Ổ gà, Nứt rạn lưới, Lún vệt bánh xe...), độ tin cậy AI (Confidence score), mức độ nghiêm trọng (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), thumbnail ảnh, bộ lọc theo trạng thái (`OPEN`, `VERIFIED`, `REJECTED`).
- **Màn 08 & 09: Thẩm định chi tiết lỗi & So sánh đa kỳ** (`/pm/defects/:id/verify`)
  - *File:* `src/pages/(pm)/DefectDetailVerify.tsx`
  - *Mục đích:* Xem chi tiết ảnh gốc của Drone, bounding box phát hiện và so sánh với kỳ bay trước đó.
  - *Thành phần:* 
    - Khung xem ảnh Zoom/Pan với Bounding box có thể điều chỉnh toạ độ.
    - Bộ chuyển đổi chế độ xem: Xem đơn kỳ (Verify A) hoặc So sánh song song 2 kỳ (Verify B - Temporal comparison) để thấy tốc độ lan rộng của vết nứt.
    - Form xác thực: Nút [Xác nhận lỗi], [Từ chối (Báo giả)], [Điều chỉnh mức độ nghiêm trọng], [Gán vào đợt sửa chữa].

---

### Giai Đoạn 3: Gom Đợt Sửa Chữa & Lập Phương Án Kỹ Thuật (Batching & Approval)
- **Màn 10: Gom đợt sửa chữa & Bóc tách khối lượng kỹ thuật** (`/pm/repair-batches/create`)
  - *File:* `src/pages/(pm)/RepairProposals.tsx`
  - *Mục đích:* Gom các lỗi đã thẩm định vào 1 đợt sửa chữa và tự động lập bảng bóc tách khối lượng kỹ thuật thi công.
  - *Thành phần:*
    - Danh sách các lỗi đã xác nhận (`VERIFIED`) chưa gán đợt.
    - Bảng khối lượng kỹ thuật: Tên hạng mục, Quy cách vật liệu, Chiều sâu cào bóc (cm), Diện tích tính toán (m²), Chiều dài (m).
    - Quy mô kỹ thuật tổng hợp (Tổng diện tích m² cào bóc, thời gian thi công dự kiến).
- **Màn 11: Trình duyệt hồ sơ đợt sửa** (`/pm/repair-batches/:id/submit`)
  - *File:* `src/pages/(sup)/ProposalApprovalDetail.tsx`
  - *Mục đích:* Kiểm tra lại toàn bộ hồ sơ phương án kỹ thuật trước khi gửi cho Giám sát.
  - *Thành phần:* Tóm tắt hồ sơ, danh sách hư hỏng đính kèm, bảng khối lượng kỹ thuật, nút [Gửi Giám sát phê duyệt].
- **Màn 12: Thẩm duyệt đợt sửa chữa (Supervisor)** (`/sup/proposals`)
  - *File:* `src/pages/(sup)/ProposalApprovalDetail.tsx`
  - *Mục đích:* Supervisor kiểm tra tính hợp lý của phương án kỹ thuật và tiêu chuẩn thi công TCVN.
  - *Thành phần:* Bảng danh sách đợt sửa chờ duyệt (`PENDING_APPROVAL`), xem chi tiết từng hạng mục, nút [Phê duyệt đợt sửa] (chuyển trạng thái sang `APPROVED`), nút [Yêu cầu chỉnh sửa].
- **Màn 13: Yêu cầu chỉnh sửa / Trả về hồ sơ** (`/sup/approvals/:id/reject`)
  - *File:* `src/pages/(sup)/BatchRejection.tsx`
  - *Mục đích:* Ghi rõ lý do không đồng ý với phương án để PM điều chỉnh.
  - *Thành phần:* Chọn lý do chuẩn (Phương án chưa đạt TCVN, Thiếu ảnh đo độ sâu, Phạm vi chưa hợp lý...), nhập ghi chú chi tiết, nút [Gửi trả hồ sơ] (chuyển sang `REVISION_REQUIRED`).

---

### Giai Đoạn 4: Thi Công & Giám Sát Hiện Trường (Execution & Monitoring)
- **Màn 14: Phân công đội thi công** (`/pm/repair-batches/:id/assign`)
  - *File:* `src/pages/(pm)/AssignCrew.tsx`
  - *Mục đích:* Giao việc đợt sửa đã được duyệt cho đội sửa chữa ngoài hiện trường (`REPAIR_CREW`).
  - *Thành phần:* Chọn tổ thi công, thời hạn hoàn thành (Deadline), ghi chú biện pháp an toàn giao thông, nút [Giao việc].
- **Màn 15: Theo dõi nhiệm vụ đo đạc hiện trường** (`/pm/field-tasks`)
  - *File:* `src/pages/(pm)/FieldTasks.tsx`
  - *Mục đích:* Theo dõi kết quả đo đạc bổ sung của các kỹ sư hiện trường (độ sâu lún, độ chênh lệch khe nứt).
  - *Thành phần:* Bảng nhiệm vụ đo đạc, trạng thái nộp số liệu, ảnh chụp thước đo kiểm chứng.
- **Màn 17: Xác nhận hoàn thành công việc** (`/pm/work-orders/:id/confirm`)
  - *File:* `src/pages/(pm)/WorkOrderConfirm.tsx`
  - *Mục đích:* PM kiểm tra báo cáo thi công từ Crew trước khi mời Giám sát nghiệm thu.
  - *Thành phần:* Xem ảnh trước/sau thi công, biên bản tự nghiệm thu của đội thợ, nút [Mời Giám sát nghiệm thu].

---

### Giai Đoạn 5: Nghiệm Thu, Đánh Giá Rủi Ro & Đóng Đợt (Acceptance & Closure)
- **Màn 16: Nghiệm thu chất lượng hiện trường** (`/sup/acceptance/:batchId`)
  - *File:* `src/pages/(sup)/FieldAcceptance.tsx`
  - *Mục đích:* Supervisor kiểm tra chất lượng thi công tại từng vị trí hư hỏng.
  - *Thành phần:* Bảng đối chiếu ảnh gốc - ảnh hoàn thành, đánh giá Đạt (`PASSED`) hoặc Không đạt (`REJECTED`), biên bản kiểm tra hiện trường.
- **Màn 18: Phân tích rủi ro suy thoái & Báo cáo** (`/sup/risk-analytics`)
  - *File:* `src/pages/(sup)/RiskAnalytics.tsx`
  - *Mục đích:* Phân tích nguyên nhân nứt lún, đánh giá xu hướng suy thoái mặt đường theo thời gian.
  - *Thành phần:* Biểu đồ xu hướng hư hỏng theo mùa, đoạn đường có tần suất lặp lại cao, tính toán chỉ số rủi ro.
- **Ký số đóng đợt sửa chữa** (`/sup/signoff`)
  - *File:* `src/pages/(sup)/SignOffClosure.tsx`
  - *Mục đích:* Ký hoàn thành đợt bảo hành & xuất báo cáo nghiệm thu tổng thể.
  - *Thành phần:* Tóm tắt kết quả nghiệm thu 100% đạt, nút [Ký số hoàn tất đợt sửa] và [Xuất file PDF/ZIP hồ sơ hoàn công].
