Dựa trên việc rà soát đối chiếu toàn bộ các file trong thư mục `src/pages/`, `src/App.tsx` với **15 nhóm chức năng của Supervisor** và **17 nhóm chức năng của PM** từ tài liệu đặc tả `v2.2`, dưới đây là bảng đánh giá chi tiết: **Web của bạn ĐÃ CÓ NHỮNG GÌ, ĐANG THỪA NHỮNG GÌ VÀ ĐANG THIẾU NHỮNG GÌ**.

---

### 📊 TỔNG QUAN ĐÁNH GIÁ
* **Về mặt giao diện (UI/UX) và số lượng màn hình:** Web của bạn đã xây dựng một khối lượng giao diện **rất đồ sộ (hơn 1.2 MB code TSX)**, bao phủ được khoảng **90% - 95%** các nghiệp vụ trong `v2.2`.
* **Về mặt kết nối và dữ liệu (Data Flow):** Đang bị tình trạng **một số màn hình cũ thừa thãi không dùng tới** và **dữ liệu giữa PM với Supervisor chưa thông nhau** (do nhiều màn hình vẫn dùng `useState` cục bộ hoặc đọc file mock tĩnh thay vì thông qua Service có lưu `localStorage`).

---

## 1. NHỮNG MÀN HÌNH ĐANG "THỪA" (TÀN DƯ KHÔNG CÒN DÙNG)

Trong quá trình phát triển từ 18 màn Stitch ban đầu lên phiên bản đặc tả chi tiết v2.2, một số màn hình đã được thay thế bằng các màn hình hoàn thiện hơn nhưng file cũ vẫn còn nằm trong code:

| File bị thừa | Dung lượng | Lý do thừa / Hiện trạng trong `App.tsx` | Đề xuất xử lý |
|---|:---:|---|---|
| [FieldAcceptance.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28sup%29/FieldAcceptance.tsx) | 409 bytes | File này chỉ import và render lại `<ResearchValidation />`. Toàn bộ chức năng nghiệm thu hiện trường thực tế đã được tích hợp đầy đủ trong [EvidenceCloseoutDetail.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28sup%29/EvidenceCloseoutDetail.tsx). | Có thể dọn dẹp hoặc giữ làm alias. |
| [SignOffClosure.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28sup%29/SignOffClosure.tsx) | 3.4 KB | Trong `App.tsx` (dòng 145), route `/sup/signoff` đã được chuyển hướng thẳng (`<Navigate to="/sup/acceptance" replace />`). | **Thừa:** Toàn bộ chức năng Ký số đóng đợt và xuất file ZIP/PDF đã được đưa vào Modal ký số trong `EvidenceCloseoutDetail.tsx`. File này không còn người dùng nào truy cập tới. |
| [BatchApprovals.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28sup%29/BatchApprovals.tsx) | 5.8 KB | Trong `App.tsx` (dòng 126), route `/sup/approvals` đã chuyển hướng sang `/sup/proposals` (`ProposalApprovalDetail.tsx`). | **Thừa:** File này trước đây thiết kế để duyệt cả đợt (Batch level), vi phạm nguyên tắc bất biến BR-21 (Supervisor phải phê duyệt độc lập từng hạng mục RepairItem). Đã được thay thế hoàn toàn bởi `ProposalApprovalDetail.tsx` (84 KB). |
| [WorkOrderConfirm.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/WorkOrderConfirm.tsx) | 3.3 KB | Trong `App.tsx` (dòng 85-86), route `/pm/work-orders/confirm` và `/:id/confirm` đã trỏ vào `EvidenceCloseoutDetail.tsx`. | **Thừa:** Chức năng xác nhận hoàn thành công việc đã nằm trọn vẹn trong `EvidenceCloseoutDetail.tsx`. |
| [RepairBatching.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/RepairBatching.tsx) & [SubmitApproval.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/SubmitApproval.tsx) | 9.6 KB & 4.7 KB | Đây là 2 file bản nháp cũ. Hiện tại PM đã có màn [RepairProposals.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/RepairProposals.tsx) (99 KB) cực kỳ chi tiết (hỗ trợ tạo gói, danh sách proposal, timeline, BOQ). | Nên điều hướng route `/pm/repair-batches/create` sang [RepairProposals.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/RepairProposals.tsx). |

---

## 2. NHỮNG CHỨC NĂNG ĐANG BỊ "THIẾU" HOẶC CHƯA HOÀN THIỆN

Đối chiếu với 15 chức năng Supervisor và 17 chức năng PM trong `v2.2`, hệ thống của bạn đang thiếu **4 mắt xích tác nghiệp** sau:

### ✅ ĐÃ BỔ SUNG: Bảng tiếp nhận & Điều phối phản ánh người dân (Triage & Link Reports - Use Case PA03, PA04)
- **Đã hoàn thiện:**
  - Bổ sung **Bảng tiếp nhận & điều phối phản ánh người dân/tuần tra** chuyên biệt trên [AIReviewInbox.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/AIReviewInbox.tsx).
  - Có thanh công cụ chọn nhiều dòng (Multi-select) để **"Liên kết báo trùng (Link Reports)"** theo Use Case PA04, quy chuẩn BR-30, BR-31.
  - Có Modal **"Điều phối vào dự án"** (`POST /cases/{id}/triage`) cho các phản ánh mới chưa được phân công (PA03).
  - Thẩm định kết luận vụ việc theo Use Case PA05: `DEFECT_FOUND`, `NO_DEFECT` (bắt buộc nhập lý do giải trình theo BR-39), `OUT_OF_SCOPE` (ngoài phạm vi bảo hành).
  - Có chức năng **"Công bố tiến độ cho người dân"** (`POST /cases/{id}/publish`) theo Use Case PA07.

### 🔴 Thiếu 2: Thiếu tầng Mock Service kết nối `localStorage` (Tương tác chéo giữa 2 vai trò)
- **Hiện trạng:** 
  - PM thao tác trên [FastTrackDispatch.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/FastTrackDispatch.tsx), [FieldTasks.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/FieldTasks.tsx), hoặc [RepairProposals.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/RepairProposals.tsx) thì dữ liệu chỉ đổi tạm trong bộ nhớ của trang đó.
  - Khi đăng xuất chuyển sang tài khoản **Supervisor**, Supervisor vào duyệt thì **không thấy đợt sửa chữa mà PM vừa tạo**!
- **Khắc phục:** Cần hoàn thiện **8 file Mock Service** trong `src/api/services/` mà chúng ta đã lên kế hoạch để lưu vào `localStorage`.

### 🟡 Thiếu 3 (Nhẹ): Trigger mô phỏng Drone bay xong (Drone Flight Simulator)
- **Hiện trạng:** Khi PM bấm "Giao nhiệm vụ bay Drone" trong [CreateSurvey.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/CreateSurvey.tsx), nhiệm vụ được tạo nhưng ở trạng thái chờ Drone bay. 
- **Cần bổ sung:** Cần có 1 nút bấm nhỏ (Quick Demo Trigger): *"Mô phỏng Drone hoàn thành & tải lên video"* để ngay lập tức sinh ra dữ liệu bay trong [DroneMissionAIReview.tsx](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/%28pm%29/DroneMissionAIReview.tsx) phục vụ thầy cô chấm đồ án.

---

## 3. BẢNG CHECKLIST CHI TIẾT THEO TỪNG CHỨC NĂNG V2.2

### A. Vai trò SUPERVISOR (15 Chức năng)
| STT | Chức năng v2.2 | Trạng thái trên Web | Màn hình đảm nhiệm | Ghi chú |
|:---:|---|:---:|---|---|
| 01 | Khởi tạo dự án & gán PM | ✅ ĐÃ CÓ | `ProjectList.tsx` | Đã có Popup Form: Nhập tên, mã, tỉnh thành, mốc bảo hành, lý trình, chỉ định PM (có option để trống). |
| 02 | Phân công nhân sự dự án | ✅ ĐÃ CÓ | `SystemControl.tsx`, `ProjectOverview.tsx` | Phân công Operator, Crew, PM. |
| 03 | Quản lý thời hạn bảo hành | ✅ ĐÃ CÓ | `ProjectList.tsx`, `ProjectOverview.tsx` | Xem mốc bảo hành, giá trị giữ lại. |
| 04 | Đóng dự án (Close Project) | ✅ ĐÃ CÓ | `ProjectOverview.tsx`, `SystemControl.tsx` | Chuyển trạng thái sang CLOSED (Read-only). |
| 05 | Duyệt xác nhận tuyến đường | ✅ ĐÃ CÓ | `AlignmentSegments.tsx` | Supervisor xem MapLibre & bấm duyệt. |
| 06 | Thẩm duyệt từng RepairItem | ✅ ĐÃ CÓ | `ProposalApprovalDetail.tsx` | Duyệt độc lập: APPROVE / REJECT / EVIDENCE. |
| 07 | Nghiệm thu nhánh duyệt | ✅ ĐÃ CÓ | `EvidenceCloseoutDetail.tsx` | Xem ảnh Before/After, bấm Nghiệm thu. |
| 08 | Đóng tổng vụ việc Mixed Case | ✅ ĐÃ CÓ | `EvidenceCloseoutDetail.tsx` | Chặn đóng nếu còn item chưa đạt. |
| 09 | Quản trị tài khoản, reset pass | ✅ ĐÃ CÓ | `SystemControl.tsx` | Mời nhân sự, khóa tài khoản, đặt lại mật khẩu. |
| 10 | Quản trị danh mục loại lỗi | ✅ ĐÃ CÓ | `SystemControl.tsx` | Thêm, sửa mã lỗi, quy tắc phân mức. |
| 11 | Cấu hình nhắc việc định kỳ | ✅ ĐÃ CÓ | `SystemControl.tsx` | Tab Reminder config. |
| 12 | Quản lý phiên bản AI Model | ✅ ĐÃ CÓ | `SystemControl.tsx` | Kích hoạt mô hình mới, xuất nhãn huấn luyện. |
| 13 | Giám sát máy chủ & Audit Trail | ✅ ĐÃ CÓ | `AuditTrail.tsx` | Tra cứu nhật ký kiểm toán bất biến. |
| 14 | Pháp lý Legal Hold & Xóa +5 năm | ✅ ĐÃ CÓ | `SystemControl.tsx` | Bật/tắt Legal Hold, duyệt xóa dữ liệu. |
| 15 | Dashboard toàn danh mục & Xuất ZIP | ✅ ĐÃ CÓ | `SupDashboard.tsx`, `RiskAnalytics.tsx` | KPI toàn công ty, xuất PDF/ZIP. |

---

### B. Vai trò PROJECT MANAGER (17 Chức năng)
| STT | Chức năng v2.2 | Trạng thái trên Web | Màn hình đảm nhiệm | Ghi chú |
|:---:|---|:---:|---|---|
| 01 | Thiết lập tuyến & Station Origin | ✅ ĐÃ CÓ | `AlignmentSegments.tsx` | Nhập GPX, tim đường, bề rộng, xem trước MapLibre. |
| 02 | Phân chia & công bố Segments | ✅ ĐÃ CÓ | `AlignmentSegments.tsx` | Chia đoạn 100m, 500m, công bố SegmentSet. |
| 03 | Quản lý đường nhánh & Slab | ✅ ĐÃ CÓ | `AlignmentSegments.tsx` | Khai báo tấm bê tông, mạng nhánh. |
| 04 | Lập kế hoạch khảo sát Drone | ✅ ĐÃ CÓ | `SurveyRequests.tsx`, `CreateSurvey.tsx` | Lập lịch bay, hoãn lịch thời tiết. |
| 05 | Giao việc bay & Yêu cầu bay bù | ✅ ĐÃ CÓ | `CreateSurvey.tsx`, `DroneMissionAIReview.tsx` | Chọn phi công, độ cao, kiểm tra độ phủ Coverage. |
| 06 | Xác nhận Baseline (Segment, Band) | ✅ ĐÃ CÓ | `DroneMissionAIReview.tsx` | Khóa mốc chuẩn bảo hành. |
| 07 | Kích hoạt AI & Rà soát Bounding Box | ✅ ĐÃ CÓ | `DroneMissionAIReview.tsx`, `AIReviewInbox.tsx` | Bounding box, loại bỏ lỗi sai, duyệt nhãn. |
| 08 | Tiếp nhận phản ánh & Báo trùng | ✅ ĐÃ CÓ | `AIReviewInbox.tsx` | Đã có bảng Triage phản ánh dân, liên kết báo trùng (PA04, BR-30, BR-31), điều phối dự án (PA03), thẩm định (PA05, BR-39), công bố tiến độ (PA07). |
| 09 | Phân cấp Severity x Urgency | ✅ ĐÃ CÓ | `AIReviewInbox.tsx`, `DefectDetailVerify.tsx` | Độc lập 2 trục mức độ & khẩn cấp. |
| 10 | Lập chính sách Fast Track | ✅ ĐÃ CÓ | `FastTrackDispatch.tsx` | Cấu hình ngưỡng kích thước, biện pháp sửa. |
| 11 | Giao đo đạc (MEASURE_ONLY vs Sửa) | ✅ ĐÃ CÓ | `FieldTasks.tsx`, `FastTrackDispatch.tsx` | Gom đo nhiều lỗi vs 1 lỗi nhỏ sửa nhanh. |
| 12 | Lập gói đề xuất sửa chữa BOQ | ✅ ĐÃ CÓ | `RepairProposals.tsx` | Gom lỗi Verified, bóc tách dự toán, trình duyệt. |
| 13 | Sửa mục bị trả & Giao Crew | ✅ ĐÃ CÓ | `RepairProposals.tsx` | Giao việc cho các item đã APPROVED. |
| 14 | Tự kiểm tra & Đóng lỗi Fast Track | ✅ ĐÃ CÓ | `EvidenceCloseoutDetail.tsx` | Tự đóng lỗi Fast Track, gửi thông báo cho Sup. |
| 15 | Kích hoạt xử lý khẩn cấp Emergency | ✅ ĐÃ CÓ | `FastTrackDispatch.tsx` | Biển báo rào chắn tạm, cảnh báo Sup. |
| 16 | Phân tích hư hỏng tái phát | ✅ ĐÃ CÓ | `DefectDetailVerify.tsx` | So sánh đa kỳ (Temporal), đánh giá tái phát. |
| 17 | Dashboard PM & Lập yêu cầu xóa | ✅ ĐÃ CÓ | `PMDashboard.tsx`, `SystemControl.tsx` | KPI dự án của PM, lập đơn xóa bảo hành +5 năm. |

---

### 🎯 TỔNG KẾT & BƯỚC ĐI TIẾP THEO

1. **Các file thừa:** Chúng ta sẽ dọn dẹp liên kết route trong `App.tsx` để điều hướng chuẩn xác vào các màn hình "xịn" nhất (`ProposalApprovalDetail.tsx`, `EvidenceCloseoutDetail.tsx`, `RepairProposals.tsx`).
2. **Những chức năng tác nghiệp đã bổ sung xong:**
   - ✅ **Modal Khởi tạo dự án mới cho Supervisor** trên `ProjectList.tsx` (mã tự nhập, hỗ trợ bỏ trống PM).
   - ✅ **Bảng Tiếp nhận & Điều phối phản ánh người dân (Triage & Link Reports)** trên `AIReviewInbox.tsx` (chuẩn PA03, PA04, PA05, PA07, BR-30, BR-31, BR-39).
3. **Mục có thể nâng cấp tiếp theo:**
   - 🔴 **Tầng Mock Service `localStorage`:** Đồng bộ dữ liệu xuyên suốt giữa PM và Supervisor.
   - 🟡 **Nút mô phỏng Drone bay hoàn thành (Simulator Trigger)** trong `CreateSurvey.tsx` để test demo nhanh.
3. **Làm tầng Mock API Service (`src/api/services/`):**
   - Đây là việc quan trọng nhất để toàn bộ các nút bấm và trạng thái (PM tạo -> Supervisor duyệt -> PM giao việc) hoạt động trơn tru từ đầu đến cuối trên trình duyệt!
