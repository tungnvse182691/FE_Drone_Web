# SPECS_INDEX — Mục Lục Đặc Tả Nghiệp Vụ & API

> **QUY TẮC CỐT LÕI (SOURCE OF TRUTH):**  
> - Bản đặc tả chuẩn duy nhất của toàn hệ thống là thư mục **`D:\Do_AN_Drone\29_9\`** (do nhóm trưởng quản lý).  
> - Thư mục **`docs/specs/29_9/`** là bản copy nguyên văn phục vụ tra cứu offline khi làm việc nội bộ repo FE_Web.  
> - **Tuyệt đối không sửa trực tiếp bản copy.** Khi có thay đổi nghiệp vụ hoặc bổ sung hợp đồng API, bắt buộc phải cập nhật tại thư mục gốc `D:\Do_AN_Drone\29_9\` trước, sau đó copy đè sang `docs/specs/29_9/`.

---

## Bảng Tra Cứu Tài Liệu Nghiệp Vụ & Hợp Đồng Kỹ Thuật

| Hạng mục cần tra cứu | Mục đích & Nội dung chi tiết | File nguồn chuẩn (29_9) | File copy offline (FE_Web) |
|---|---|---|---|
| **Screens / Routes** | Danh mục màn hình, luồng màn hình PM & Supervisor, đường dẫn web | `D:\Do_AN_Drone\29_9\09_Frontend\contracts\operation_catalog.md`<br>`D:\Do_AN_Drone\29_9\02_Requirements\01_FRD_SRS.md` | `docs/specs/29_9/operation_catalog.md`<br>`docs/specs/29_9/01_FRD_SRS.md` |
| **Phân quyền (RBAC)** | Ma trận quyền hạn, vai trò `PROJECT_MANAGER`, `SUPERVISOR`, chính sách bảo mật | `D:\Do_AN_Drone\29_9\02_Requirements\01_FRD_SRS.md` (FR-01, FR-02)<br>`D:\Do_AN_Drone\29_9\02_Requirements\02_Business_Rules.md` (BR-01, BR-02, BR-16) | `docs/specs/29_9/01_FRD_SRS.md`<br>`docs/specs/29_9/02_Business_Rules.md` |
| **BR Fast Track** | Quy tắc điều phối sửa chữa nhanh, tiêu chuẩn hư hỏng nhẹ, ngưỡng an toàn | `D:\Do_AN_Drone\29_9\02_Requirements\02_Business_Rules.md` (BR-05, BR-10, BR-11)<br>`D:\Do_AN_Drone\29_9\02_Requirements\01_FRD_SRS.md` (FR-18) | `docs/specs/29_9/02_Business_Rules.md`<br>`docs/specs/29_9/01_FRD_SRS.md` |
| **operationId & APIs** | Danh mục 68 API operations, request body, query params, responses | `D:\Do_AN_Drone\29_9\09_Frontend\contracts\operation_catalog.md` | `docs/specs/29_9/operation_catalog.md` |
| **RPT (Báo cáo & KPI)** | Yêu cầu báo cáo phân tích, chỉ số KPI suy thoái, ma trận RPT-01 $\rightarrow$ RPT-10 | `D:\Do_AN_Drone\29_9\02_Requirements\06_Report_Analytics_Requirements.md` | `docs/specs/29_9/06_Report_Analytics_Requirements.md` |
| **OpenAPI Full** | Hợp đồng OpenAPI 3.1 schema đầy đủ cho toàn bộ microservices | `D:\Do_AN_Drone\29_9\05_Technical\openapi.yaml`<br>`D:\Do_AN_Drone\29_9\09_Frontend\contracts\openapi.baseline.yaml` | *(Tra cứu trực tiếp file nguồn 29_9)* |
| **Offline Sync & Xung đột** | Cơ chế đồng bộ ngoại tuyến, giải quyết xung đột dữ liệu hiện trường (LWW/Manual) | `D:\Do_AN_Drone\29_9\02_Requirements\01_FRD_SRS.md` (FR-27)<br>`D:\Do_AN_Drone\29_9\02_Requirements\02_Business_Rules.md` (BR-21, BR-22) | `docs/specs/29_9/01_FRD_SRS.md`<br>`docs/specs/29_9/02_Business_Rules.md` |
| **UAT & Use Cases** | Kịch bản kiểm thử người dùng, quy trình nghiệp vụ To-Be end-to-end | `D:\Do_AN_Drone\29_9\02_Requirements\04_Use_Cases.md`<br>`D:\Do_AN_Drone\29_9\02_Requirements\03_To_Be_Process.md` | `docs/specs/29_9/04_Use_Cases.md`<br>`docs/specs/29_9/03_To_Be_Process.md` |
