# 🎨 Thư viện Thiết Kế Stitch — RoadGuard FE Web

Thư mục này dùng để lưu ảnh chụp màn hình hoặc file export thiết kế từ Stitch của Hoàng.
AI sẽ trực tiếp đọc file ảnh trong thư mục này để dựng giao diện chuẩn xác 100% theo đúng layout, bảng màu, vị trí nút bấm và không bịa trường dữ liệu.

## Quy tắc đặt tên ảnh theo 18 màn hình:

### Cụm Xác Thực (Auth)
- `01_login.png` — Màn 01: Đăng nhập hệ thống & Đổi mật khẩu lần đầu

### Cụm Project Manager (PM)
- `02_pm_dashboard.png` — Màn 02: Dashboard tổng quan của PM (KPI, cảnh báo, tiến độ)
- `04_project_list.png` — Màn 04: Danh mục dự án bảo hành & bảo trì đường bộ
- `05_survey_requests.png` — Màn 05: Quản lý danh sách yêu cầu bay khảo sát Drone
- `06_create_survey.png` — Màn 06: Biểu mẫu tạo yêu cầu khảo sát (tuyến đường, GPS, loại khảo sát)
- `07_ai_review_inbox.png` — Màn 07: Hộp thư tiếp nhận kết quả AI phát hiện hư hỏng
- `08_defect_verify_a.png` — Màn 08: Thẩm định chi tiết lỗi AI (Bounding box, điều chỉnh nhãn/độ nghiêm trọng)
- `09_defect_verify_b.png` — Màn 09: So sánh ảnh hư hỏng đa kỳ (Multi-epoch temporal review)
- `10_repair_batching.png` — Màn 10: Gom đợt sửa chữa & Lập bảng dự toán chi phí (BOQ)
- `11_submit_approval.png` — Màn 11: Trình duyệt hồ sơ đợt sửa chữa gửi Giám sát
- `14_assign_crew.png` — Màn 14: Phân công đội thi công & lập kế hoạch xử lý
- `15_field_tasks.png` — Màn 15: Theo dõi nhiệm vụ đo đạc bổ sung ngoài hiện trường
- `17_wo_confirm.png` — Màn 17: Xác nhận hoàn thành công việc sau thi công

### Cụm Supervisor (Giám sát / Chủ đầu tư)
- `03_sup_dashboard.png` — Màn 03: Dashboard điều hành & KPI Giám sát
- `12_batch_approvals.png` — Màn 12: Danh sách & Chi tiết thẩm duyệt hồ sơ đợt sửa chữa
- `13_batch_rejection.png` — Màn 13: Yêu cầu chỉnh sửa / Trả về hồ sơ kèm lý do
- `16_field_acceptance.png` — Màn 16: Nghiệm thu kết quả thi công (chụp ảnh, đối chiếu trước/sau)
- `18_risk_analytics.png` — Màn 18: Phân tích rủi ro, suy thoái mặt đường & Báo cáo
- `signoff_closure.png` — Biên bản ký số đóng đợt sửa chữa hoàn tất

> 💡 **Lưu ý:** Bạn chỉ cần thả ảnh vào đây, khi cần code màn nào thì nhắn:  
> *"Code màn 08 theo ảnh 08_defect_verify_a.png nhé"*
