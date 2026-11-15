# Mốc phục hồi giao diện trước prompt tiếp quản

Mốc đích là workspace ngay trước prompt **“Tiếp quản toàn bộ phần Antigravity đang làm dở…”**, nhận lúc **19:42:18.837 ngày 15/11/2026 (Asia/Saigon)**, tức `2026-11-15T12:42:18.837Z`. Không dùng riêng cây Git `23eb37d` làm trạng thái đích.

## Bằng chứng và cách phục hồi

- Log phiên tiếp quản ghi nhận ngay lúc 19:42:31: **29 file modified**, ngoài ra có artifacts. Bao gồm service và UI Antigravity chưa commit.
- Local History tại `Antigravity IDE/User/History` còn các bản Save All đến 19:42:14, trước prompt khoảng 4 giây.
- Blob của service Acceptance `4179ff3`, Validation `c3dcfc0`, Retention `1dd7fd7` trong diff đầu phiên khớp bản Local History được phục hồi. Repair lấy bản `oFwI.ts` lúc 19:42:13.872; diff 275 thêm/678 xóa khớp tổng 953 dòng trong status đầu phiên.
- App/routes và các UI sạch trong status đầu phiên được lấy từ `23eb37d`. Các file này không có chỉnh sửa local trước prompt theo bằng chứng đầu phiên.
- AuditTrail, AuditTrailHeader, audit mockData và ProposalHeader lấy bản Local History trước prompt, giữ các thay đổi Antigravity chưa commit.
- Các file RepairProposals, AcceptanceList, repair-proposals, proposal-approval, evidence-closeout còn local từ trước prompt được giữ nguyên; không thay bằng các Workspace/Panel mới.
- RiskDeteriorationSection, useRiskAnalyticsState và CreateDeletionRequestModal có thay đổi Antigravity trước prompt; log sửa file xác nhận không có chỉnh sửa nội dung sau prompt. Giữ nguyên các file này.
- ReportingMetricsPanel phục hồi nội dung từ `rs01.tsx`, giữ thêm hai hunk format đã có trước prompt. Diff với Git tham khảo đạt 634 thêm/48 xóa, khớp tổng 682 dòng trong status đầu phiên. Hoàn tác phần đổi fallback, nhãn/tham chiếu và timeline do đợt tiếp quản gây ra.
- Xóa bảy file giao diện/hook mới do đợt tiếp quản và đợt phục hồi sai mốc tạo ra. Đã sao lưu từng file trước khi xóa; không reset/revert toàn repo.

## Bảy màn

Đã trả về component/route gốc: FastTrackDispatch; RepairProposals/ProposalApprovalDetail; AcceptanceList/EvidenceCloseoutDetail; RiskAnalytics; ResearchValidation; AuditTrail; SystemControl. Bao gồm component, modal, tab và state có trước prompt. Không thiết kế thêm bố cục mới.

Các sửa đổi có trước prompt vẫn được giữ, dù còn dở hoặc có hành vi cần sửa sau này. Đây là phục hồi workspace, không phải xác nhận nghiệp vụ/API của trạng thái cũ đã hoàn chỉnh.

## API giữ riêng

- Giữ repairWorkflowService và workflowCollection; giữ auditService timeline vì caller cũ dùng được mà không đổi cấu trúc UI.
- Bản API đọc Candidate3 mới của AI và Retention được giữ nguyên trong `candidate3ValidationService.ts` và `candidate3RetentionService.ts`, chưa gắn lại vào UI.
- Khôi phục facade service trước prompt cho caller cũ để không làm mất component/tương tác vì thiếu method/type. Không triển khai API mới hoặc mutation runtime trong lượt phục hồi.
- Bản sao nguyên trạng service/UI trước khi phục hồi và manifest SHA-256 nằm ở `artifacts/pre-prompt-ui-restore/`. Không đưa toàn bộ artifacts hay session log lên Git.

## Giới hạn xác minh

Không thể chứng minh byte-for-byte khoảng trắng cuối dòng trước thao tác `rstrip()` của đợt tiếp quản trên ReportingMetricsPanel. Nội dung và các hunk format trước prompt đã đối chiếu; không tự nhận khôi phục tuyệt đối các byte khoảng trắng đó. Chưa có ảnh chụp workspace tại đúng thời điểm trước prompt để chứng minh pixel-for-pixel so với ngày đó.

## Kiểm tra

- 34 mục trong manifest khớp hash sau phục hồi; ba hash service nêu trên khớp diff gốc. Các file KPI/map/local được giữ nguyên cũng được kiểm tra không đổi so với trước lượt này.
- Typecheck và production build PASS. Không sửa code để làm xanh các test của luồng UI mới đã bị gỡ.
- Diff-check UI báo ba lỗi khoảng trắng có sẵn trong ResearchValidation được phục hồi nguyên từ Git (dòng 365, 490 và dòng trắng cuối file); cố ý không format lại bản gốc.
- Browser Supervisor mở đủ bảy màn; ảnh toàn trang ở `artifacts/pre-prompt-ui-restore/screenshots/`. Audit đã đợi qua loading trước khi chụp lại. Không có tràn ngang trong lượt kiểm này. Không bấm mutation nghiệp vụ.
- Bằng chứng này xác nhận nguồn phục hồi và khả năng render, không khẳng định các thao tác nghiệp vụ cũ đã được nghiệm thu.
