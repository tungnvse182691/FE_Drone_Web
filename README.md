# RoadGuard — Web Dashboard (FE_Drone_Web)

Hệ thống Web Dashboard quản trị và điều hành phục vụ Đồ án Giám sát & Quản lý Khuyết tật Đường bộ (Bê tông Hoàng Hải).

## 1. Phạm vi nghiệp vụ (2 Luồng Web chính)
Hệ thống Web tập trung vào 2 vai trò quản trị theo tài liệu đặc tả `29_9`:
- **Project Manager (PM - Quản lý dự án):**
  - Quản lý tiếp nhận & xác minh khuyết tật (Defect Intake & Verification).
  - Điều phối nhiệm vụ khảo sát bay Drone và tiếp nhận dữ liệu video/telemetry.
  - Kích hoạt pipeline phân tích AI (`createProcessingJob` cho Video Analysis & Duplicate Matching).
  - Điều phối lệnh thi công sửa chữa Fast Track & Work Order cho Đội thi công (Repair Crew).
  - Công bố khuyết tật đã khắc phục cho người dân (Partial Publication).
- **Supervisor (Giám sát / Chủ đầu tư):**
  - Ban hành và quản lý khung chính sách sửa chữa công ty.
  - Giám sát tiến độ thi công toàn tuyến theo thời gian thực.
  - Tổ chức nghiệm thu chính thức các hạng mục sửa chữa (Approval Track).


## 2. Quy ước phân nhánh Git (Branch Strategy)
- `main`: Nhánh production/release chính, chứa mã nguồn đã kiểm thử và ổn định.
- `tung`: Nhánh làm việc của Nguyễn Văn Tùng (FE Lead).
- `hoang`: Nhánh làm việc của Hoàng (Web Developer phụ trách 2 luồng PM & Supervisor).
