# Điều phối nhanh — ba form chờ Hoàng review

Thay thế hướng dẫn nhập reference thủ công ở báo cáo tích hợp trước. **Chưa tuyên bố Hoàng đã nghiệm thu UI hoặc giao việc runtime.** Giữ route, modal, bố cục hai cột, font và tokens màu; dropdown mới dùng kiểu của input/dropdown sẵn có trong từng modal. Không thay bằng panel chung, không sửa menu khác.

## Các trường đã rà theo b89a52fe11ed

| Form | Nguồn / payload | Validation và giới hạn |
|---|---|---|
| Chính sách | Loại hư hỏng lấy GET catalog/defect-types. Dropdown policy chỉ gồm reference hồ sơ/receipt đã được canonical GET xác nhận lại; không có ô UUID. Checklist nhập văn bản. Area dùng m²; chọn từng quy tắc áp dụng, độ sâu chọn đúng mm/cm/m, khoảng từ0 đến ngưỡng người nhập. | Loại phải còn trong catalog; checklist tối đa200 ký tự; reason tối đa2000; ngưỡng không âm, tối đa6 chữ số thập phân, đúng giới hạn lưu trữ. Mức độ là thông tin tham khảo, không được gửi như điều kiện policy. Bản đã xuất bản chỉ đọc; không tự cập nhật policy TEST. |
| Xác nhận độ phủ | Scope, HANDOVER đã chấp nhận, WARRANTY/MAINTENANCE_BASIS, xác nhận cần thay thế đều chọn từ GET road-coverage. ID/hash/version lấy từ record chọn. Số hiệu văn bản chỉ là ghi chú tùy chọn trong reason, không phải field bắt buộc giả của DTO. | Đủ scope/source/version mới cho gửi. Ngày theo giờ Việt Nam; đến hết ngày được mã hóa bằng đầu ngày kế tiếp, mốc loại trừ, khớp RoadCoverageRepository. Kiểm ngày và hạn bàn giao/bảo hành từ source. TEST_ONLY không thể đổi thành căn cứ thực tế; nguồn không synthetic chỉ được khai báo REAL_SOURCE khi Giám sát tự chọn và đối chiếu thực tế, không tự cấp nhãn xác minh. Không có nguồn thì không dựng option. |
| Phát lệnh | Chọn Crew hiện hành, policy đã xuất bản phù hợp loại lỗi, hồ sơ nhiệm vụ nguồn. Survey/set/layout/slab/map/CRS hiển thị dropdown cố định theo record nguồn đã đối chiếu, không nhập UUID. Loại số đo lấy theo hồ sơ. Hạn nhập giờ địa phương, gửi ISO UTC. Mô tả và chỉ đạo nhập văn bản thường. | GET source task có ETag, kiểm Defect/current route/geometry/CRS, PUBLISHED set và layout/map khi có. Các pin null chỉ hiện “Không có trong hồ sơ nguồn”, không điền ID mẫu. Mỗi lệnh dùng một Defect/source context. Không có source/policy phù hợp thì khóa và báo rõ. instructions giữ nguyên ý, tổng tối đa1000 ký tự; measurementScope là object JSON do FE tạo. sourceTaskId chỉ dùng ở UI, không lọt vào DTO task. |

Tại runtime này chưa có collection policy toàn dự án. Dropdown không lấy SQL/dev meta, không đoán policy ID hoặc chọn bản mới nhất. Trên máy không có receipt/reference đã đọc thì báo thiếu nguồn, không yêu cầu người dùng nhập UUID để lách.

Hồ sơ nhiệm vụ nguồn là căn cứ reference được đọc lại, **không phải chứng minh Crew đã đo/đủ quyền thi công**. Nếu không có hồ sơ nguồn phù hợp, UI hiện chưa thể lắp bộ pins thay thế bằng tay dù BE có lệnh assign. Không dựng dữ liệu để bỏ qua giới hạn discovery này.

## Bốn trạng thái riêng

- Policy PUBLISHED: hiển thị **Đã xuất bản**, không mặc nhiên gọi là quyền thi công.
- Coverage: hiển thị chưa xác nhận / có xác nhận lưu / thử nghiệm không cấp quyền thi công.
- ReadyToAssign: chỉ là sẵn sàng **giao việc có điều kiện**.
- Đủ điều kiện thi công: chỉ đến từ eligibility/binding/assessment/current authority/coverage thật, không suy theo LOW/MEDIUM hoặc policy đã publish.

Journal đang chờ không được đổi body/key/version. Form pending khóa lựa chọn và đối chiếu chính yêu cầu đã lưu; receipt vẫn GET-only. UI cache được dùng để giữ nội dung người nhập, không thay thế việc đọc lại nguồn server.

## PASS code

- Typecheck, production build, diff-check cho thay đổi này PASS. Cảnh báo duration-[250ms] và bundle lớn có sẵn.
- `check-fasttrack-web.cjs`:14 nhóm PASS; giữ regression chống trùng/timeout/journal/receipt.
- `check-fasttrack-scope-validator.cjs`:17 ca so với thân hàm C# ValidateScope đúng revision runtime.
- `check-fasttrack-forms.cjs`:6 nhóm thao tác trên component form thật bằng hooks/event harness: chọn dropdown, nhập input, bấm handler, kiểm DTO POST → receipt → GET item/task/mapping. Có ca sai độ chính xác số, sai CRS/thiếu nguồn và thiếu HANDOVER bị khóa; timestamp có phần giây lẻ của journal được giữ nguyên khi đối chiếu. **Transport mô phỏng**, không phát HTTP mutation.

## PASS UI có phạm vi

Browser PM/Sup đọc dữ liệu server thật. Catalog, policy revision, source task và coverage GET200. Đã thao tác chọn policy đã lưu để đọc; chọn Crew/source/policy ở form phát lệnh, nhập mô tả thường; kiểm không còn text input UUID và không tràn ngang. Không bấm submit nghiệp vụ.

Ảnh tại `artifacts/fasttrack-forms-review/screenshots/`:

- `forms-policy-review.png` và `forms-policy-review-bottom.png`.
- `forms-dispatch-review.png` và `forms-dispatch-review-bottom.png`.
- `forms-coverage-review.png` và `forms-coverage-review-bottom.png`.

Mỗi form có ảnh đầu/cuối vùng cuộn để thấy đủ trường và footer, không sửa CSS/DOM để dựng ảnh một form khác. Đây là bằng chứng render/thao tác và payload qua test harness; Hoàng còn review thiết kế.

## Runtime chưa kiểm

Không POST/PUT/PATCH policy, road-coverage hoặc assign trong lượt này. Chỉ đổi phiên xác thực để xem PM/Sup và GET nguồn. Không sửa policy TEST hoặc fixture BE; GET cuối xác nhận policy revision TEST giữ nguyên version, item vẫn ReadyToAssign. Cache form nhập thử được khôi phục; không sửa journal.

Project321 vẫn thiếu HANDOVER/căn cứ độ phủ, nên xác nhận Sup bị khóa đúng tại thao tác. Thành công POST/receipt/readback nghiệp vụ trên BE **NOT_RUN**, không suy thành PASS từ test mô phỏng hoặc nút đã mở. Không tự bấm giao Crew.

Rà soát policy/đơn vị và regression BE domain mới nhất: [FASTTRACK-POLICY-RUNTIME-20261116.md](FASTTRACK-POLICY-RUNTIME-20261116.md).
