# Product decisions and scope

**OWNER_CONFIRMED scope registry · Phase 1 · 14/10/2026.** [Authority and glossary](01_Authority-and-Source-of-Truth.md).

## Product baseline

| Quyết định đã cung cấp | Authority source | Qualifier |
|---|---|---|
| Product HoangHaiWarrantySystem | Owner rebuild plan + Phase0/Phase1 assignment,14/10/2026 | RoadGuard technical identifiers giữ nguyên; không bulk rename |
| Web Supervisor/PM; Mobile Reporter/Operator/Crew | Owner mới, ghi trong [Phase0 summary](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) | Supersede đúng primary-client wording cũ; role/resource authority giữ nguyên |
| Mobile React Native+Expo | Owner chọn stack; [actor/client matrix](../01_Product-and-Roles/02_Actor-Client-Permission-Matrix.md) | SDK/native modules/build/device acceptance NOT_VERIFIED; không iOS production claim |
| ASP.NET Core BE là integration center | Owner baseline + existing [architecture source](../../RoadGuard-Backend-Official/01_Architecture/01_Backend_Architecture.md) | Code hiện có không tự là business authority |
| FastAPI Python logical service riêng, YOLO trên frames video drone thật | Owner product baseline |3target classes pothole/crack/spalling; actual checkpoint/class map/model metrics NOT_VERIFIED |
| PM quyết candidate; Crew physical dimensions | Confirmed33A/34A + HUY assigned R rules | Không AI auto-approval hoặc AI/GSD dimensions/SfM/orthomosaic/DSM/DTM/3D |
| Reporter MVP online Mobile, safe draft/retry | Owner rebuild scope | Report độc lập drone/survey; không mặc định Reporter signed Crew offline |
| Reporter → Supervisor triage → PM decision → Defect hợp lệ → Crew FIELD | Owner scope + [source flow evidence](../../audit/HHWS-DOCS-REBUILD-01/03_BUSINESS_AND_PLATFORM_CONFLICTS.md) | Không Survey giả; KEEP_NEW/LINK_EXISTING/REJECT còn current source/version guards |
| NORMAL/FT giữ approval riêng | Latest [HUY final](../../../planning/development/HUY-FINAL-INTEGRATION.md) | Client change không thay quyền; FT notification source còn localized gap |
| RQ1/RQ2 của phiếu giữ nguyên | Owner baseline | Phiếu FA26SE219 chưa có trong scoped input; không tuyên bố đã đọc/sửa Word |

## Retained 32–44 and supersession

Nguồn nguyên văn vẫn là [confirmed-decisions.md](../../product/confirmed-decisions.md). Canonical registry không sửa table cũ hoặc lấy hết historical FR/BR làm scope mới.

| Topic | Quyết định giữ | Giới hạn / nguồn mới |
|---|---|---|
|32A / reminders | PM tự gom đợt đo, reminder không auto tạo/giao task/cấp quyền sửa | Actual schedule/deployment acceptance riêng |
|33A / matching | Same-project scope/neighbor/location/accuracy/history; thiếu GPS fallback scope+ảnh; PM mở rộng trong project | Current matcher chỉ partial location/image; gap không hợp thức hóa bằng docs |
|34A / training labels | PM approve/reject, training export chỉ approved | AI không tự approve |
|35A / temporary safety | PM giao safety trong allowed scope, Supervisor được thông báo | Không đóng defect hoặc thay nghiệm thu |
|36A / transport | Web secure cookie/server session; Mobile token access/refresh theo implemented Android wire | Không đổi `/auth/android/*` hoặc client identifier/DTO |
|37 / login bounds | OTP10m/5tries, resend≥60s và≤3/15m; access Android15m | Latest H1 persistent login supersede ordinary server idle/max bounds của new sessions; legacy bounded vẫn theo legacy rules; finite ticket/JWT còn renew/refresh |
|38 / upload | Image20MiB/video8GiB/SRT10MiB/dataset32GiB, multipart/resume | Admission không chứng nhận actual large transfer |
|39A / GIS | Segment suggestion100m, PM đổi/giữ/gộp remainder | Không là engineering coverage/accuracy standard |
|40 / SLO |50users, metadata p95≤2s, RPO≤15m, RTO≤4h | Targets, chưa benchmark/restore acceptance |
|41A / retention | Warranty+5years evidence, source video; technical log90d/export30d/backup35d; hold blocks | Unknown/multiple basis fail closed; không suy delete date từ upload, không áp legal claim |
|42A / encrypted transfer | Bàn giao khi source device/key còn truy cập; original actor giữ | Latest scoped recipient/grant rules trong HUY spec; không organization recovery escrow |
|43A / offline | Loaded task/route/segment/destination; basemap chưa bắt buộc | Provider/license là dependent choice, geometry đủ tác nghiệp |
|44 / client ownership | Web/Mobile/AI do nhóm bên ngoài; BE adapter/contract/fixtures/integration | Actual consumer owner names/repo/ETA UNKNOWN đến khi được cung cấp |

Latest ND01 giữ original-window FT admission và current source/rights/time safeguards; không backdate entitlement hoặc tự cấp thêm sau expiry. Numerical thresholds, extra extensions, official CRS/coverage và public-period formula tuân localized gates của spec, không suy từ V2/default/test.

## MVP and deferred scope

MVP được mô tả bằng các quyết định trên; implementation đầy đủ hay partial phải đọc [status registry](03_Implementation-and-Verification-Status.md). Governance page không chuyển deferred feature thành đã làm.

Local encryption cho Expo: DB SQLCipher/equivalent + AEAD file store cho ảnh ngoài DB, secure tokens/keys/backup/cache/temp/migration/loss lifecycle là **PROPOSED / NEEDS FE VALIDATION**. Device signing/enrollment/per-item ACK cần cho authorized existing Crew offline contract; private keys do device sinh/giữ. Reporter online không inherit offline grant. Placement road-mask processing chưa được chốt, cần benchmark; road GIS segment khác pixel segmentation.

Actual Web/browser/Expo device/FastAPI model/provider/MinIO/SMTP/GIS accuracy/SLO/restore chưa được Phase1 chứng nhận. Không có endpoint/canonical payload mới, không tự bổ sung Reporter self-service reset/signed offline/formal supplement-request/push nếu scope chưa giao.

## Next review

Owner review bộ canonical governance trước Phase2. Existing confirmed business decisions không hỏi lại; chỉ future contract/data-policy/native-key/provider choices cần dependent checkpoint. [Document control](04_Document-Control-and-Change-History.md) ghi scope và stop condition.
