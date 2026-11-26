# BE note — ABC1 COORDINATES readiness/confirm mismatch

Ngày kiểm: 09/11/2026. FE `fb2ca1c07db00770294c949e1dd47ce2b29d2497`; BE source/runtime bàn giao `cda6d6384a69db23cafbdab430ffb523b0b5e6bc`.
Phạm vi chỉ điều tra read-only; chưa POST confirm, chưa tạo/sửa metadata. Không gửi note ra bên ngoài.

## Runtime đã kiểm bằng Chrome DevTools MCP

Project `9b51bb39-8c5f-43f1-84a2-520a1d8b5eba`, draft `ae00e2ba-ca47-4167-a72c-ea91076ab592`, road section `53a034e3-e554-4042-afa4-225e1d69df3e`.
GET draft HTTP200: status DRAFT, version `AAAAAAAAbw0=`, sourceKind COORDINATES, sourceCrs32648, originalCoordinates119/editedCoordinates119, stationOriginMeters0, surveyWidthMeters12, widthProfile `[ { fromOffsetMeters:0, toOffsetMeters:701.290518512277, widthMeters:7 } ]`; nativeAlignment=null/readiness=null. Không cookie/token/header được đưa vào note.

Payload PUT thực đã quan sát trong phiên browser trước (không gửi lại trong lượt điều tra):
```json
{
  "sourceKind": "COORDINATES",
  "sourceCrs": 32648,
  "stationOriginMeters": 0,
  "coordinates": "[119 đối tượng x/y nguyên nguồn PM; mảng được lược khỏi note, đây không phải body để gửi]",
  "widthProfile": [{ "fromOffsetMeters": 0, "toOffsetMeters": 701.290518512277, "widthMeters": 7 }],
  "surveyWidthMeters": 12,
  "changeReason": "sửa tuyến đường",
  "roadCode": "Roadguard1",
  "roadName": "Tuyến đường hoàn chỉnh (Đầy đủ nhánh & nút giao)"
}
```
GET `/api/v1/projects/{projectId}/road-geometry-drafts/{draftId}/readiness` HTTP200:
```json
{
  "ready": false,
  "missingFields": ["nativeAlignment", "crsProfileRevision", "routeSystemId", "routeKind", "tessellationToleranceMeters"],
  "errors": [],
  "crsStatus": "CANDIDATE",
  "sampleOnly": false,
  "warnings": ["OFFICIAL_CRS_OPERATION_AND_INDEPENDENT_CONTROL_NOT_VERIFIED"]
}
```
PreviewHTTP200 được kiểm ở lượt trước. Không coi preview/draft write thành công là đủ điều kiện confirm hoặc xác nhận độ chính xác trắc địa.

## Bằng chứng source tại cda6d63

- `RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs:26`: GeometryDraftInput có COORDINATES/native metadata optional. `:42` GeometryDraftView có nativeAlignment nhưng không có routeSystemId/routeKind/tessellationToleranceMeters/chainageCalibration/declaredLengthMeters/changeReason/resolvedCrsProfile.
- `RoadGuardSystem.Services/Implementations/Projects/GeometryWorkflowService.cs:13`: confirm chỉ Sup; read PM/Sup. `:29–30`: draft-readiness luôn gọi CrsProfileEngine.Readiness, không phân nhánh SourceKind.
- `RoadGuardSystem.Services/Implementations/Projects/CrsProfileEngine.cs:38–49`: Readiness luôn yêu cầu NativeAlignment/profile/RouteSystemId/RouteKind/TessellationToleranceMeters, không kiểm SourceKind. Chính các điều kiện này sinh 5 missingFields cho COORDINATES.
- `RoadGuardSystem.Services/Implementations/Projects/GeometryEngine.cs:21–35`: NATIVE_ALIGNMENT đi NativePreview; COORDINATES đi Line/metric CRS/widthProfile/changeReason validation riêng. `:55` chỉ NativePreview gọi CrsProfileEngine.Readiness.
- `RoadGuardSystem.Repositories/Implementations/Projects/GeometryWorkflowPersistenceService.cs:138–158`: create/edit chỉ ResolveNativeInput/NativeMissing khi SourceKind=NATIVE_ALIGNMENT; COORDINATES dùng preview(input, projectEngineeringSrid). InputJson lưu toàn DTO, không cắt 5 field ở BE.
- Repository `:161–170`: GET/readiness trả stored input; preview dùng GeometryEngine; confirm gọi preview(stored,srid), chỉ ValidateTopologyAsync nếu NATIVE_ALIGNMENT. `:171–183`: đối chiếu expectedCurrentVersionId và tạo confirmed route; COORDINATES lấy stored.Coordinates. Vì vậy source có đường Sup confirm COORDINATES trực tiếp, không có guard bắt 5 metadata native trên nhánh đó.
- Repository `:284`: DraftView chỉ xuất các field DTO view nêu trên; `:294–302` ResolveNativeInput đọc profile project-owned từ nativeAlignment.crsProfileRevisionId, không tin resolvedCrsProfile client.
- Swagger runtime: GeometryDraftInput.routeKind mô tả “Conditional native-only value; do not make this optional property globally required.” API-180 confirm nhận GeometryConfirmInput (expectedCurrentVersionId/effectiveFrom/reason), không nhận năm trường native; API-181 preview, API-182 readiness. Spec17_10 `02_Business-Workflows/02_Project-Road-Geometry-and-Pavement.md` mô tả PM draft/preview/readiness → Sup confirmed version và cấm biến preview thành approval; không có căn cứ tự nâng COORDINATES thành native để vượt gate.

## Phân loại và đề nghị BE

Năm trường thiếu là điều kiện native đang áp dụng vào endpoint readiness chung; không phải missing input đã được chứng minh thuộc lỗi FE trong ABC1. File/state COORDINATES và payload quan sát không có native metadata; source BE confirm COORDINATES không yêu cầu chúng. FE type/helper hiện không roundtrip toàn metadata native, nhưng đây là giới hạn native workflow riêng, không phải nguyên nhân đủ căn cứ để sửa ABC1 thành native.

Đề nghị BE chốt policy rồi thống nhất create/readiness/preview/confirm: nếu COORDINATES được confirm theo nhánh hiện hành, readiness phải phản ánh validation COORDINATES và nguồn CRS thật, không yêu cầu native-only fields. Nếu policy mới bắt buộc native, cần contract/migration/workflow được chấp thuận và GET đủ metadata để roundtrip. Không chỉ đổi ready=true; không coi cảnh báo CRS là đạt trắc địa. Tác động hiện tại: FE gate readiness đúng nhưng Sup không thể tới confirm ABC1.

GET đủ tọa độ/lý trình/width/surveyWidth và version cho COORDINATES; thiếu changeReason nên UI yêu cầu PM nhập lý do cập nhật mới. GET chưa đủ phục hồi đầy đủ metadata native sau F5, dù InputJson BE lưu chúng. BE cần bổ sung read DTO nếu muốn FE biên tập/roundtrip nhánh native an toàn.

## Nếu owner chủ động chọn native workflow (chưa thực hiện)

PM (không phải Sup) tạo hồ sơ có nguồn qua POST `/api/v1/projects/{projectId}/crs-profiles` (API-066): code/sourceSrid/datum/projection/axisOrder/metresPerUnit/sourceReference/sourceChecksum, các operation/control/tolerance có nguồn theo CrsProfileInput; không tạo sample thay thật. GET profiles API-065 trả revision.
PM POST `/api/v1/projects/{projectId}/route-systems` (API-199) với code/name được xác nhận; GET API-198 để đọc ID thật. Sau đó PM PUT draft API-179 với SourceKind=NATIVE_ALIGNMENT, nativeAlignment có crsProfileRevisionId/primitives/spatialSrid có nguồn, routeSystemId/routeKind/topology và tessellationToleranceMeters được chấp thuận riêng, If-Match/Idempotency-Key/CSRF. Native input không trộn coordinates/GPX; đây là thay đổi nguồn thiết kế cần quyết định, không phải cách sửa readiness ABC1 tự động. Sup chỉ xem/preview/readiness và confirm API-180 sau khi đủ điều kiện. Không dùng pavement render0.1 làm tessellationToleranceMeters geometry.

## Kết quả lượt này

Không sửa FE/BE/source, không test/build/restart, không mutation/confirm; chỉ đọc source/runtime và ghi note/worklog. Không tạo commit source. Cần phản hồi BE về semantics readiness COORDINATES trước khi làm tiếp.
