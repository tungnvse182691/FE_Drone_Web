# Phục hồi giao diện bảy màn — 15/11/2026

## Mức nghiệm thu

**Phục hồi một phần, chưa nghiệm thu hoàn tất yêu cầu khôi phục toàn bộ trải nghiệm trước đợt sửa.** Không coi test/build xanh hoặc mở được route là bằng chứng đã phục hồi đầy đủ UI.

Đã đối chiếu diff `23eb37d..705ae6c`, component trước đợt sửa và file local hiện hành. Không reset/revert hàng loạt. Không thay đổi service/API. Giữ nguyên các file local RepairProposals, AcceptanceList, proposal-approval, evidence-closeout và conflictService; riêng ProposalHeader dùng lại phần local đã kiểm tra để thay nhãn dự án cố định bằng tên dự án thật, bổ sung mô tả đúng phạm vi từng hạng mục.

## Từng màn

| Màn | Đã phục hồi / giữ lại | Chưa đạt đầy đủ trải nghiệm cũ |
|---|---|---|
| Điều phối nhanh | Header riêng, component chính sách, vùng độ phủ thật và danh sách điều phối riêng; không dùng panel sửa chữa chung | Chưa binding chính sách hiện hành, modal điều chỉnh/xác nhận độ phủ và giao việc; danh sách FT của dự án mẫu rỗng. Không suy chính sách chưa xuất bản từ việc chưa có nguồn đọc. |
| Gói sửa chữa | Header local, danh mục gói, bộ lọc trạng thái, form tạo có journal hiện hành, drawer quyết định từng hạng mục | Chưa phục hồi đủ component/modal kỹ thuật Antigravity. Không gửi duyệt hoặc duyệt toàn gói. Giao việc chưa nối. |
| Nghiệm thu | Danh sách thẻ riêng, bốn thẻ trạng thái có thể lọc, mở lịch sử/bằng chứng từng hạng mục | Chưa có trình xem ảnh/bản đo Trước/Sau thật, chưa phục hồi đủ modal đối chiếu. Ô Trước/Sau chỉ dẫn mở hồ sơ, không phải ảnh. Chưa nghiệm thu/final confirmation trên runtime. |
| KPI | Giữ nguyên header/cards/map/table/export đang có; kiểm browser PM và Supervisor | Chưa đủ nguồn rủi ro đa kỳ/SLA; ảnh dự án mặc định có thể thiếu geometry. Không thêm giá trị hoặc công thức giả. Không có thay đổi mã KPI trong đợt này. |
| Thực nghiệm AI | Header nghiên cứu cũ, ribbon thông tin, thẻ Bias/MAE/RMSE từ kết quả thật, danh sách lần chạy | Chưa phục hồi đủ đồ thị/phân tích mẫu, import cặp đo, chạy kiểm định. Nguồn validation mẫu chưa có số liệu. Đọc chi tiết run trả HTTP401 auth_unauthorized. |
| Nhật ký | Giữ component header/metrics/filter/table/drawer riêng; bỏ banner kỹ thuật dài | Chưa có nguồn snapshot trước/sau/ảnh/vai trò đầy đủ; xuất riêng nhật ký chưa hỗ trợ. |
| Lưu trữ | Header riêng và bố cục hai cột pháp lý/đánh giá lưu trữ | Chưa phục hồi đầy đủ các modal hồ sơ/phong tỏa/yêu cầu xóa. Không suy trạng thái legal hold từ evaluation; đọc kết quả evaluation trả HTTP401 auth_unauthorized. |

## Browser và dữ liệu

- Phiên runtime SUPERVISOR và PROJECT_MANAGER; chỉ đọc dữ liệu và đổi phiên xác thực, không gửi mutation nghiệp vụ.
- Bảy hậu tố được mở ở cả `/pm` và `/sup`: fast-track, proposals, acceptance, reports, research-validation, audit-trail, retention.
- 14 ảnh full-page nằm tại `artifacts/ui-recovery/{pm,sup}-<route>.png`. Không commit toàn bộ artifacts lịch sử.
- Browser PM mở drawer hạng mục AwaitingApproval: không có nút Phê duyệt hạng mục. Browser Supervisor mở cùng hồ sơ: có nút đó; không bấm duyệt.
- Dự án mẫu có 1 gói/1 hạng mục chờ phê duyệt, chưa có lần thi công; 3 lần AI SUCCEEDED; 1 evaluation COMPLETE. Đây là dữ liệu runtime đọc được, không phải seed mới của đợt này.
- Các thẻ sai số thiếu nguồn hiện dấu gạch ngang. Chi tiết AI và evaluation hiển thị lỗi HTTP401. Không khôi phục mock hoặc thành công trong bộ nhớ.

## Kiểm tra

- Typecheck và production build PASS; diff-check PASS.
- Các script service hiện có: repair 7, readonly 4, reporting 10, exports 12 nhóm PASS (transport mô phỏng, không chứng minh mutation runtime hay hoàn chỉnh UI).
- Các cảnh báo build có sẵn: duration-[250ms], bundle lớn.
- Còn cần phục hồi đầy đủ modal/chart/evidence interactions ở bảng trên và kiểm lại trước khi nghiệm thu toàn bộ yêu cầu.
