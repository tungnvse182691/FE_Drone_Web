# Chọn bản nộp dữ liệu khảo sát để đánh giá và khóa baseline — ĐÃ CÓ PHÁN QUYẾT (phương án D)

> **Cập nhật 2026-11-16:** BE đã đối chiếu và đề xuất **phương án D** (`Bổ sung_2.txt`); FE đã triển khai (mục 8). Phần dưới là nội dung câu hỏi gốc để lưu vết. Còn lại chờ chủ nghiệp vụ xác nhận riêng: bắt buộc dùng bản mới nhất, thêm điều kiện `integrityStatus = PASSED`, hoặc cần Giám sát duyệt trước khi khóa; và có cho chọn nguồn theo dải từ nhiều nhiệm vụ trên cùng một màn hay không.

Ngày: 2026-11-16. Liên quan: màn `/pm/surveys` → chi tiết nhiệm vụ khảo sát → khung "Bộ dữ liệu". BE (commit 05197e2) ghi rõ: *"Quy tắc chọn dataset để đánh giá hoặc khóa baseline vẫn chờ chủ nghiệp vụ chốt."*

## 1. Câu hỏi cần trả lời (gửi người quyết định nghiệp vụ)
Khi **một nhiệm vụ khảo sát có nhiều bản nộp dữ liệu** (bản 1, 2, 3…), PM dùng **bản nào** để:
1. **Tạo đánh giá bộ dữ liệu** (đạt/không đạt về vị trí, chất lượng, độ phủ từng phân đoạn)?
2. **Khóa baseline** (ghi nhận dữ liệu gốc để so sánh các kỳ sau)?

## 2. Vì sao phải chốt
- Đánh giá và baseline **gắn cứng với một bản nộp cụ thể** (`datasetId`). Mỗi bản có thể khác nhau về độ phủ và kết quả kiểm tra toàn vẹn.
- Khóa baseline trên một bản cũ hoặc bản chưa đạt có thể làm hỏng mọi so sánh về sau.
- BE **không ép** quy tắc nào: nó nhận bất kỳ `datasetId` hợp lệ nào do FE gửi. Nếu không chốt, giao diện không biết nên chặn hay cảnh báo gì.

## 3. FE đang làm gì hiện nay (tạm thời, chưa phải quy tắc nghiệp vụ)
- Danh sách bản nộp hiện **mới nhất trước**, mặc định chọn bản đầu (mới nhất), PM có thể chọn bản khác (đã kiểm với 29 bản, có phân trang "Tải thêm").
- Đánh giá và khóa baseline dùng **đúng bản đang chọn** trên giao diện, **không có cảnh báo** nào khi chọn bản cũ hoặc bản chưa đạt toàn vẹn.

## 4. Thông tin thực tế đã kiểm trong BE (để người quyết định cân nhắc)
- Với luồng hiện tại của BE, **gần như không thể có hơn một bản nộp trên cùng một nhiệm vụ**: sau khi Operator nộp, nhiệm vụ chuyển `SUBMITTED`; không thể giao lại hay nhận lại (409), và khi đã tạo nhiệm vụ bổ sung thì nhiệm vụ gốc không nộp thêm được. Muốn khảo sát bổ sung thì tạo **nhiệm vụ bổ sung riêng**, mỗi nhiệm vụ có bộ dữ liệu riêng.
- Vì vậy câu hỏi thực chất có hai lớp:
  - (a) Nếu sau này BE cho phép nộp lại/nhiều phiên bản trên một nhiệm vụ thì chọn bản nào?
  - (b) Hiện tại một đoạn đường có thể có dữ liệu từ **nhiều nhiệm vụ** (nhiệm vụ gốc + nhiệm vụ bổ sung, ví dụ mặt đường ở nhiệm vụ gốc, lề phải ở nhiệm vụ bổ sung). Khi khóa baseline theo từng (phân đoạn, dải), dữ liệu từng dải lấy từ nhiệm vụ nào? Hiện FE chỉ khóa baseline cho phân đoạn thuộc bộ dữ liệu đang mở.
- Bản nộp có trường `integrityStatus` (ví dụ `PASSED`) và `assessmentId` (đã đánh giá hay chưa) để dùng làm điều kiện.

## 5. Các phương án để chọn (đề xuất của FE)
| Phương án | Hành vi | Ưu | Nhược |
|---|---|---|---|
| A. Luôn dùng bản mới nhất | Không cho chọn; đánh giá/baseline luôn lấy bản mới nhất | Đơn giản, không chọn nhầm bản cũ | Bản mới nhất có thể chưa đạt toàn vẹn hoặc nộp nhầm |
| B. PM tự chọn, có cảnh báo (**FE đề xuất**) | Mặc định bản mới nhất; chọn bản cũ thì hiện cảnh báo rõ "không phải bản mới nhất"; trước khi khóa baseline hiện hộp xác nhận ghi số bản, thời điểm nộp, trạng thái toàn vẹn, kết quả độ phủ | Linh hoạt, có kiểm soát, PM chịu trách nhiệm | Thêm một bước xác nhận |
| C. Chỉ cho chọn bản đủ điều kiện | Chỉ bản có `integrityStatus = PASSED` (và/hoặc đã có đánh giá đạt) mới được chọn để khóa baseline; bản khác chỉ xem | An toàn nhất cho dữ liệu gốc | Cần định nghĩa chính xác "đủ điều kiện"; có thể chặn nhầm |
| D. Kết hợp B + C | PM chọn bản, nhưng chỉ bản đủ điều kiện mới bấm được "Khóa baseline" | Cân bằng | Phức tạp hơn |

## 6. Các câu hỏi cụ thể cần đối chiếu khi xác nhận
1. Có chấp nhận phương án B (hoặc D) không? Nếu có, điều kiện "đủ điều kiện" gồm những gì (`integrityStatus = PASSED`? đánh giá phải đạt toàn bộ phân đoạn? độ phủ tối thiểu bao nhiêu)?
2. Đánh giá tạo trên bản N có được dùng để khóa baseline khi đã có bản N+1 không? Hay phải đánh giá lại trên bản mới nhất?
3. Sau khi đã khóa baseline trên bản N, nếu có bản N+1 thì phải khóa lại (BE hỗ trợ khóa lại có `expectedBaselineSelectionId`) hay giữ nguyên?
4. Baseline của một phân đoạn có được ghép dữ liệu từ nhiều nhiệm vụ (nhiệm vụ gốc + bổ sung) không? Nếu có, giao diện cần cho chọn nhiệm vụ/bản theo từng dải.
5. Ai được quyết định: chỉ PM (BE hiện cho PM khóa baseline) hay cần Giám sát phê duyệt thêm?

## 7. Sau khi có câu trả lời FE sẽ làm
- A: bỏ ô chọn bản, luôn dùng bản đầu danh sách.
- B: thêm cảnh báo khi chọn bản không phải mới nhất và hộp xác nhận trước khi khóa baseline.
- C/D: vô hiệu hóa "Khóa baseline" (và nếu cần "Lưu đánh giá") với bản không đủ điều kiện kèm lý do hiển thị.
- Câu 4 nếu "có": mở rộng khung khóa baseline theo từng nhiệm vụ/dải (thay đổi lớn hơn, cần đặc tả riêng).

Việc này thuộc quyết định nghiệp vụ, FE không tự chọn.

## 8. Đã triển khai theo phán quyết của BE (phương án D)
- Mặc định mở bản nộp **mới nhất** để xem; PM chọn bản để đánh giá. Chọn bản không phải mới nhất thì hiện cảnh báo (BE vẫn cho khóa nếu đoạn/dải đủ điều kiện; bản mới không tự thay baseline đang áp dụng).
- **Điều kiện khóa baseline theo BE:** `assessmentId` thuộc đúng `datasetId`, dataset thuộc đúng dự án, phương pháp `pm-evidence-review.v1`, và với từng đoạn/dải cả ba kết quả **vị trí, chất lượng, độ phủ đều PASS** (chỉ có `assessmentId` hoặc `integrityStatus = PASSED` là chưa đủ; thiếu thì BE trả 422 `baseline_not_eligible`). FE hiển thị từng đoạn/dải kèm ô chọn: đoạn/dải không đủ điều kiện bị khóa ô và ghi rõ lý do (kết quả nào chưa đạt); nút "Khóa baseline (n đoạn/dải)" chỉ bật khi có ít nhất một đoạn/dải đủ điều kiện và đã nhập lý do. Lệnh khóa chỉ gửi các đoạn/dải được chọn.
- **Thay baseline:** FE hiển thị baseline đang áp dụng của từng đoạn/dải (bản nào) và khi khóa lại gửi `expectedBaselineSelectionId` bằng `selectionId` hiện hành đúng đoạn/dải.
- Đã kiểm trên BE mới nhất với nhiệm vụ 29 bản: chọn bản 26, đánh giá hỗn hợp (đoạn 1 đạt ba mục, đoạn 2 độ phủ không đạt) → đoạn 2 bị khóa ô kèm lý do, chỉ đoạn 1 được khóa (201) và thay baseline cũ của bản khác; cảnh báo "không phải bản mới nhất" hiển thị đúng.
- **Chưa làm (cần chốt):** chọn nguồn theo từng dải từ nhiều nhiệm vụ (mặt đường từ nhiệm vụ gốc, lề phải từ nhiệm vụ bổ sung) trong cùng một lệnh; BE contract cho phép, FE cần thêm cách hiển thị/chọn theo dải.
- **BE còn thiếu cho Web:** hỗ trợ cookie + CSRF cho `POST /datasets/{id}/assessments` và `POST /projects/{id}/baseline-selections` (đã nằm trong mục C của `BE-REQUEST-WEBCOOKIE-ROUTES.md`; FE đang dùng Bearer tạm).
