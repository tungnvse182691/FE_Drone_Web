# Policy Fast Track — thống nhất với runtime b89a52fe11ed

Mốc sửa: `c7d88d3`. Docker image label vẫn là **b89a52fe11ed146f197f3f94e115530b9b75afb0**. Không sửa BE, menu khác, policy TEST, fixture hoặc journal. Chỉ auth/GET để xem UI; không gửi mutation nghiệp vụ thật.

## Form và cách hiển thị

- Giữ modal, font, màu và grid hai cột hiện có. Checkbox chọn Area, DepressionDepth hoặc cả hai; không bắt điền ngưỡng của quy tắc không chọn. Form này cần ít nhất một quy tắc; backend vẫn có thể giữ policy không cấu hình, khi Evaluate sẽ NotConfigured.
- Lệnh Area mới gửi **code Area, unit m²**, minimum0 và maximum người nhập. Không gửi alias `m2`. Checkbox bật với maximum0 là hợp lệ; không coi0 là thiếu hoặc UNKNOWN.
- Độ sâu chọn rõ `mm`, `cm` hoặc `m`, là các đơn vị LENGTH được domain chấp nhận. Đổi unit xóa ô ngưỡng để người dùng nhập lại, không nhân/chia hay làm tròn số. Các rule không chọn hoàn toàn không nằm trong payload.
- Thiếu rule/bounds hiển thị **Chưa quy định**, không có `≤ —`, không điền0 thay thế. Rule đang lưu có unit không tương thích được hiển thị nguyên unit kèm cảnh báo, không tự đổi dữ liệu.
- Mã điều kiện dừng chỉ chọn từ policy cùng loại hư hỏng, cùng dự án, đã GET xác nhận. Không có danh mục mã đóng từ BE; không tự đặt WEATHER_RAIN/NIGHT hoặc suy nghĩa mã bằng substring. Thiếu nguồn thì control khóa và nêu giới hạn. Chưa cấu hình không đồng nghĩa không có nguy cơ.
- Không migrate body/key của journal cũ. Legacy Area/m2 đang chờ bị chặn và báo rõ, không viết lại thành m². Reference trong receipt có thể được GET lại để đọc/đối chiếu; draft sai unit không tự được publish. Rules và stop codes đã lưu không tự sửa theo default của form.

## Căn cứ source xuyên suốt

Tất cả locator dưới đây được đọc bằng `git show b89a52fe11ed146f197f3f94e115530b9b75afb0:<path>`, không dùng BE checkout HEAD khác revision.

| Mắt xích | Source pinned | Kết luận |
|---|---|---|
| Loại đo | BusinessObjects/Common/Enums.cs — MeasurementType | DepressionDepth1, SlabFaultingHeight2, ShoulderErosionExtent3, Area4. |
| Dimension/unit và trạng thái | BusinessObjects/Inspections/GroundTruthMeasurement.cs — CreateCaptured | Area chỉ AREA/m². Ba loại độ dài chỉ LENGTH/mm,cm,m. BE chuẩn hóa chữ hoa/thường của unit, không đổi giá trị giữa các đơn vị. KNOWN phải có value>=0; UNKNOWN phải value null và có unknownReason. |
| Validate trước lưu | Repositories/Implementations/Inspections/FieldInspectionWorkflowRepository.Intake.cs — ValidateMeasurements | Tối đa200 số đo, sampleId duy nhất, type hợp lệ; giá trị tối đa9999999999999.999999, trên6 chữ số thập phân bị từ chối, không làm tròn rồi lưu. |
| Lưu entity | Cùng Intake.cs — Submit: ValidateMeasurements → AddRange(measurements) | GroundTruthMeasurement giữ nguyên Value/ValueState/Dimension/Unit; UNKNOWN vẫn null. |
| Schema lưu | Repositories/Configurations/GroundTruthMeasurementConfiguration.cs | Value decimal(19,6); check constraints KNOWN/UNKNOWN, dimension/unit và unit Unicode m²; có trigger immutable. Đây là đối chiếu source, không chạy INSERT SQL trong lượt này. |
| Policy | BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs — Publish/Evaluate | Bounds decimal(20,6), minimum/maximum có thứ tự; Evaluate dùng Code/Unit ordinal, ngưỡng gồm cả hai biên; không chuyển cm→mm hay m2→m². Thiếu/null fact là UnknownMeasurement. |
| Policy → eligibility | Repositories/Implementations/Repairs/RepairFtEligibility.cs — Missing | Ghép rule.Code với MeasurementType.ToString, phải đúng một source. Chỉ KNOWN mới lấy Value; UNKNOWN thành null, không thành0. Quan sát stop code thiếu/null thêm STOP_CONDITION_OBSERVATION_UNKNOWN, không xem là false. |
| Kết quả cuối | Services/Implementations/Repairs/RepairEligibilityService.cs và RepairExecutionAuthorization.Evaluate | Eligible chỉ khi không có missingReasons; ngoài policy còn cần binding, assessment, quyền hiện hành, nguồn/độ phủ, vị trí và thời gian. Policy Evaluate đạt không tự cấp quyền thi công. |

Prefix đầy đủ của BusinessObjects là `RoadGuardSystem.BusinessObjects/`, Repositories là `RoadGuardSystem.Repositories/`, Services là `RoadGuardSystem.Services/`.

## Regression thực

`node tools/check-fasttrack-policy-domain.cjs`:

- Lấy và biên dịch nguyên các class BE GroundTruthMeasurement, RepairPolicyRevision/RepairExecutionAuthorization, RepairGuards, Enums và record persistence/DTO policy tại SHA trên. Dùng dependency NetTopologySuite cache, không sửa checkout BE.
- Chạy đúng thân ValidateMeasurements, phần readiness số đo và phần policy/measurement/stop-observation của RepairFtEligibility.Missing. TaskPins chỉ là adapter dữ liệu cho chữ ký validator; không thay logic validate. Truy vấn EF/quyền DB của toàn repository không được mô phỏng như đã runtime PASS.
- Kiểm Area m²/m2 và dimension đúng/sai; LENGTH mm/cm/m, unit sai; KNOWN0, UNKNOWN null/có lý do và các trạng thái mâu thuẫn; độ chính xác/range/sample trùng; thiếu và trùng source số đo; biên dưới/trên và lệch một phần triệu; active/false/null/missing stop observation; NotConfigured; các gate execution riêng.
- Script gọi test thao tác **form thật** để lấy DTO phát sinh sau checkbox/dropdown/input, rồi đưa chính DTO đó vào domain BE và validator thật. Các ca both, Area-only0, depth-only25.5cm và mã stop từ nguồn phải vượt qua intake/evaluation thực. Vì vậy POST/GET mock chấp nhận body không đủ làm regression xanh.
- **15 nhóm validator/domain PASS**. Hash source, thân validator và eligibility core ghi tại `artifacts/fasttrack-policy-runtime/domain-harness/provenance.json`. Mọi object/test ID chỉ ở bộ nhớ/harness, không đưa lên BE.

`check-fasttrack-forms.cjs`: **9 nhóm PASS** qua form → handler → payload → response/GET readback bằng transport mô phỏng, gồm lựa chọn rule, số0, unit cm không quy đổi, hiển thị thiếu ngưỡng và stop code từ source. `check-fasttrack-web.cjs`:15 nhóm PASS giữ regression journal/timeout/readback. Typecheck/build/diff-check PASS.

## UI/runtime đã kiểm

Browser GET thật: SBX-A vẫn có policy TEST Area/m2, UI cảnh báo đơn vị; project321 có policy depth-only, Area hiện Chưa quy định. Đã chọn Area-only0 và depth-only25.5cm qua chính form, kiểm trạng thái enabled/disabled, thay unit yêu cầu nhập lại và thiếu nguồn stop code. Không bấm Lưu/Xuất bản.

Ảnh đầu/cuối modal và hai trạng thái read-only ở `artifacts/fasttrack-policy-runtime/screenshots/`.

GET cuối xác nhận cả hai policy TEST giữ nguyên version, measurements và stopConditions. Cache loại hư hỏng nhập thử được khôi phục; không sửa journal. Không gọi API lưu số đo, không suy kích thước từ AI/bbox và không tạo bằng chứng.

**Runtime ghi số đo/publish/eligibility toàn luồng: NOT_RUN.** Đã kiểm source lưu và domain/validator thật; chưa chạy SQL insert, full EF repository/current-rights queries hoặc mutation API. Không thay các giới hạn đó bằng tuyên bố hoàn tất runtime từ test mock.
