# Authentication, users, staff và project memberships

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

Xác lập danh tính và quyền hiện tại trước khi truy cập bằng chứng, project hoặc công việc. Supervisor/PM dùng Web; Reporter/Operator/Crew dùng Mobile React Native + Expo (`TARGET_CONFIRMED`). Client platform không tự cấp role. Service identity và resource guard mới quyết định quyền.

Tài khoản đăng nhập phải đáp ứng kiểm tra credential, trạng thái user, role và yêu cầu đổi mật khẩu. Project membership là điều kiện bổ sung cho hoạt động theo project; không thay thế session hợp lệ. Reporter không phải đăng ký Crew offline device để gửi report online.

## State transitions và main success flow

1. Reporter bắt đầu registration, nhận OTP, xác minh rồi mới có tài khoản theo onboarding service. OTP theo defaults IdentityOnboardingOptions có thời hạn 10 phút, giới hạn 5 lần thử, resend tối thiểu 60 giây và 3 lần/15 phút. Các giá trị là source/config defaults, không chứng nhận deployed SMTP/config. Đây là trạng thái intent/challenge, không phải project membership.
2. Staff theo invitation/account administration; role được cấp theo invitation/current user source, không theo field tự khai của client. Đổi mật khẩu/reset/admin reset có luồng và quyền riêng trong bảng API.
3. Mobile dùng `/auth/android/*` bearer login/refresh/logout; Web dùng cookie/session endpoints theo `WebAuthController`. Không đổi route Android thành Mobile vì đổi tên sản phẩm. Current H1 persistent session không áp ordinary idle/max session expiry cho session mới; access token Android vẫn hữu hạn 15 phút, Web ticket 12 giờ và cần refresh. Session legacy bounded vẫn kiểm giới hạn cũ.
4. Refresh xoay refresh token; revoke/logout kết thúc khả năng dùng family/session theo identity repository. Persistent login không vượt qua user inactive, issued-role mismatch hoặc revoked session.
5. Staff directory đọc tài khoản/membership/primary PM; Supervisor có phạm vi quản trị, PM cần effective membership. Chọn primary PM không thay thế mọi PM membership hoặc tự cấp quyền dựa trên tên chức danh.

## Failure và alternative flows

OTP sai/hết hạn/rate limit không hoàn tất đăng ký. Credential/token không hợp lệ, tài khoản inactive, role đổi, session revoke hoặc bắt buộc đổi password phải xử lý theo lỗi identity hiện có. Không biến lỗi refresh thành đăng nhập thành công bằng token cache. Refresh cạnh tranh có concurrency guard; client cần áp dụng kết quả server, không dùng đồng thời nhiều token family như một phiên mới.

Staff directory mặc định Supervisor/PM/Operator/Crew; filter role Reporter được hỗ trợ ở read source nhưng không biến Reporter thành staff có quyền project. `includeHistory` membership khác current effective membership. Primary PM query có thể trả null; không suy ra người nhận công việc bằng cách chọn tùy tiện một PM.

## Authorization và source/evidence lifecycle

`ProjectScopeGuard.AuthorizeAsync` trả scope Supervisor mà không cần PM membership; các identity/resource guard vẫn có kiểm tra riêng. PM/Operator/Crew phải khớp current membership, role, trạng thái và validity dates theo đường gọi. Không khẳng định helper này một mình kiểm đủ mọi trạng thái user. `StaffReadRepository.CheckAccessAsync` kiểm current user/role/password state và project riêng.

Credential/session/OTP và membership history là evidence quyền; client chỉ giữ token/receipt theo policy consumer đã duyệt. Không công khai email/contact bằng một DTO read dành cho mọi actor. File/evidence ownership được kiểm lại ở workflow sử dụng file, không được suy từ login trước đó. WebAuthController dùng CSRF token cho login/renew/logout, HttpOnly/Secure renewal cookie; cookie eligibility là metadata từng route, không phải mọi API tự nhận Web cookie. Không trộn Authorization header với cookie renewal trái guard. Các client phải theo current transport/error source, không suy mọi bearer route đã có cookie parity.

Project member có trạng thái domain `Active/Ended` và validity dates; effective rights lấy current UTC/date source. [Project creation/primary PM reassignment](02_Project-Road-Geometry-and-Pavement.md) là producer riêng; staff list chỉ đọc. Khi primary PM đổi, phải theo reassignment service/receipt/current source, không sửa local directory để giao quyền. Không tự đặt endpoint CRUD membership chưa có trong source.

## Idempotency, concurrency và offline

Các command dùng operation/key/rowversion theo đúng DTO/header trong appendix; login, OTP và refresh không được áp một quy tắc replay tổng quát của repair. Replay write không khôi phục quyền đã revoke. Offline enrollment chỉ ở workflow 09 cho PM/Crew được phép; Reporter authentication và report online không phụ thuộc flow đó. Expo secure token/key storage và native session behavior `NOT_VERIFIED` trong repo backend.

## JEV và test evidence

**Judgment: PARTIAL.** Evidence là identity/onboarding/directory/project guard source dưới đây. Variance: có backend session/onboarding nhưng SMTP, app secure storage và luồng Web/Expo thực chưa được chứng minh (P1-05). Recommendation: consumer/SMTP integration verification riêng; không sửa API hay coi persistent session là perpetual bearer token. Business/runtime tests Phase 2A `NOT_RUN`; appendix chỉ là test source locators, không phải kết quả chạy.

## API method/path, DTO và controller evidence

29 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-001 | `POST /api/v1/admin/users/{userId}/password-reset` | [ResetPassword](../../../RoadGuardSystem.API/Controllers/AdminUsersController.cs#L25) | — | [AdminPasswordResetRequestDto](../../../RoadGuardSystem.DTOs/Identity/AdminPasswordResetRequestDto.cs#L5) → [AdminPasswordResetResponseDto](../../../RoadGuardSystem.DTOs/Identity/AdminPasswordResetResponseDto.cs#L3) |
| API-002 | `POST /api/v1/auth/android/login` | [AndroidLogin](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L44) | — | [LoginRequestDto](../../../RoadGuardSystem.DTOs/Authentication/LoginRequestDto.cs#L6) → [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3) |
| API-003 | `POST /api/v1/auth/android/refresh` | [AndroidRefresh](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L50) | K | [RefreshRequestDto](../../../RoadGuardSystem.DTOs/Authentication/RefreshRequestDto.cs#L6) → [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3) |
| API-004 | `POST /api/v1/auth/change-password` | [ChangePassword](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L148) | K | [ChangePasswordRequestDto](../../../RoadGuardSystem.DTOs/Authentication/ChangePasswordRequestDto.cs#L6) → — |
| API-005 | `POST /api/v1/auth/forced-password-change` | [ForcedPasswordChange](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L84) | — | [ForcedPasswordChangeRequestDto](../../../RoadGuardSystem.DTOs/Authentication/ForcedPasswordChangeRequestDto.cs#L5) → — |
| API-006 | `POST /api/v1/auth/login` | [Login](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L28) | — | [LoginRequestDto](../../../RoadGuardSystem.DTOs/Authentication/LoginRequestDto.cs#L6) → [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3) |
| API-007 | `POST /api/v1/auth/logout` | [Logout](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L106) | K | — → — |
| API-008 | `POST /api/v1/auth/password-recovery-requests` | [RequestPasswordRecovery](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L134) | — | [PasswordRecoveryRequestDto](../../../RoadGuardSystem.DTOs/Authentication/PasswordRecoveryRequestDto.cs#L6) → — |
| API-009 | `POST /api/v1/auth/refresh` | [Refresh](../../../RoadGuardSystem.API/Controllers/AuthController.cs#L59) | K | [RefreshRequestDto](../../../RoadGuardSystem.DTOs/Authentication/RefreshRequestDto.cs#L6) → [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3) |
| API-010 | `POST /api/v1/auth/reporter-registrations` | [Register](../../../RoadGuardSystem.API/Controllers/ReporterRegistrationsController.cs#L25) | K | [RegisterReporterRequestDto](../../../RoadGuardSystem.DTOs/Authentication/RegisterReporterRequestDto.cs#L6) → [RegistrationIntentResponseDto](../../../RoadGuardSystem.DTOs/Authentication/RegistrationIntentResponseDto.cs#L3) |
| API-011 | `POST /api/v1/auth/reporter-registrations/resend` | [Resend](../../../RoadGuardSystem.API/Controllers/ReporterRegistrationsController.cs#L55) | K | [ResendReporterOtpRequestDto](../../../RoadGuardSystem.DTOs/Authentication/ResendReporterOtpRequestDto.cs#L5) → [RegistrationIntentResponseDto](../../../RoadGuardSystem.DTOs/Authentication/RegistrationIntentResponseDto.cs#L3) |
| API-012 | `POST /api/v1/auth/reporter-registrations/verify` | [Verify](../../../RoadGuardSystem.API/Controllers/ReporterRegistrationsController.cs#L44) | K | [VerifyReporterOtpRequestDto](../../../RoadGuardSystem.DTOs/Authentication/VerifyReporterOtpRequestDto.cs#L6) → [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3) |
| API-013 | `GET /api/v1/auth/web/csrf` | [Csrf](../../../RoadGuardSystem.API/Controllers/WebAuthController.cs#L26) | — | — → — |
| API-014 | `POST /api/v1/auth/web/login` | [Login](../../../RoadGuardSystem.API/Controllers/WebAuthController.cs#L37) | — | [LoginRequestDto](../../../RoadGuardSystem.DTOs/Authentication/LoginRequestDto.cs#L6) → — |
| API-015 | `POST /api/v1/auth/web/logout` | [Logout](../../../RoadGuardSystem.API/Controllers/WebAuthController.cs#L118) | K | — → — |
| API-016 | `POST /api/v1/auth/web/renew` | [Renew](../../../RoadGuardSystem.API/Controllers/WebAuthController.cs#L61) | — | — → — |
| API-017 | `GET /api/v1/auth/web/session` | [Session](../../../RoadGuardSystem.API/Controllers/WebAuthController.cs#L106) | — | — → — |
| API-032 | `POST /api/v1/invitations` | [Create](../../../RoadGuardSystem.API/Controllers/InvitationsController.cs#L27) | K | [CreateInvitationRequestDto](../../../RoadGuardSystem.DTOs/Invitations/CreateInvitationRequestDto.cs#L6) → [InvitationResponseDto](../../../RoadGuardSystem.DTOs/Invitations/InvitationResponseDto.cs#L3) |
| API-033 | `POST /api/v1/invitations/accept` | [Accept](../../../RoadGuardSystem.API/Controllers/InvitationsController.cs#L56) | K | [AcceptInvitationRequestDto](../../../RoadGuardSystem.DTOs/Invitations/AcceptInvitationRequestDto.cs#L6) → [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3) |
| API-035 | `GET /api/v1/me` | [Get](../../../RoadGuardSystem.API/Controllers/MeController.cs#L27) | — | — → [ActorResponseDto](../../../RoadGuardSystem.DTOs/Identity/ActorResponseDto.cs#L3) |
| API-036 | `PATCH /api/v1/me` | [Update](../../../RoadGuardSystem.API/Controllers/MeController.cs#L38) | K/V | [UpdateMeRequestDto](../../../RoadGuardSystem.DTOs/Identity/UpdateMeRequestDto.cs#L6) → [ActorResponseDto](../../../RoadGuardSystem.DTOs/Identity/ActorResponseDto.cs#L3) |
| API-047 | `GET /api/v1/profile` | [Get](../../../RoadGuardSystem.API/Controllers/ProfileController.cs#L26) | — | — → [ProfileResponseDto](../../../RoadGuardSystem.DTOs/Identity/ProfileResponseDto.cs#L3) |
| API-048 | `PUT /api/v1/profile` | [Update](../../../RoadGuardSystem.API/Controllers/ProfileController.cs#L50) | — | [ProfileUpdateRequestDto](../../../RoadGuardSystem.DTOs/Identity/ProfileUpdateRequestDto.cs#L7) → [ProfileResponseDto](../../../RoadGuardSystem.DTOs/Identity/ProfileResponseDto.cs#L3) |
| API-112 | `GET /api/v1/projects/{projectId}/members` | [Members](../../../RoadGuardSystem.API/Controllers/StaffDirectoryController.cs#L31) | — | — → `ProjectMemberResponseDtoStaffPageResponseDto` (OpenAPI schema; declaration locator trong full inventory) |
| API-133 | `GET /api/v1/projects/{projectId}/primary-project-manager` | [Primary](../../../RoadGuardSystem.API/Controllers/StaffDirectoryController.cs#L42) | — | — → [PrimaryProjectManagerResponseDto](../../../RoadGuardSystem.DTOs/Staff/StaffReadResponses.cs#L13) |
| API-237 | `GET /api/v1/users` | [Users](../../../RoadGuardSystem.API/Controllers/StaffDirectoryController.cs#L21) | — | — → `StaffUserResponseDtoStaffPageResponseDto` (OpenAPI schema; declaration locator trong full inventory) |
| API-238 | `GET /api/v1/users/{userId}` | [Get](../../../RoadGuardSystem.API/Controllers/UsersController.cs#L29) | — | — → [ActorResponseDto](../../../RoadGuardSystem.DTOs/Identity/ActorResponseDto.cs#L3) |
| API-239 | `PATCH /api/v1/users/{userId}` | [Update](../../../RoadGuardSystem.API/Controllers/UsersController.cs#L55) | K/V | [AccountUpdateRequestDto](../../../RoadGuardSystem.DTOs/Identity/AccountUpdateRequestDto.cs#L6) → [ActorResponseDto](../../../RoadGuardSystem.DTOs/Identity/ActorResponseDto.cs#L3) |
| API-240 | `POST /api/v1/users/{userId}/password-reset` | [ResetPassword](../../../RoadGuardSystem.API/Controllers/UsersController.cs#L91) | K | [AdminResetPasswordV2RequestDto](../../../RoadGuardSystem.DTOs/Identity/AdminResetPasswordV2RequestDto.cs#L6) → — |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [AuthService](../../../RoadGuardSystem.Services/Implementations/Authentication/AuthService.cs#L13): source declaration.
- [IdentityService](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityService.cs#L11): source declaration.
- [IdentityRepository](../../../RoadGuardSystem.Repositories/Implementations/Identity/IdentityRepository.AccountUpdates.cs#L10): source declaration.
- [IdentityOnboardingService](../../../RoadGuardSystem.Services/Implementations/Authentication/IdentityOnboardingService.cs#L14): source declaration.
- [IdentityOnboardingRepository](../../../RoadGuardSystem.Repositories/Implementations/Identity/IdentityOnboardingRepository.cs#L10): source declaration.
- [IdentityV2Service](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityV2Service.cs#L10): source declaration.
- [UserSession](../../../RoadGuardSystem.BusinessObjects/Identity/UserSession.cs#L6): source declaration.
- [ProjectMember](../../../RoadGuardSystem.BusinessObjects/Projects/ProjectMember.cs#L5): source declaration.
- [StaffReadRepository](../../../RoadGuardSystem.Repositories/Implementations/Staff/StaffReadRepository.cs#L6): source declaration.
- [ProjectScopeGuard](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L6): source declaration.
- [AuthService.LoginAsync](../../../RoadGuardSystem.Services/Implementations/Authentication/AuthService.cs#L49): producing/guard method locator.
- [AuthService.RefreshAsync](../../../RoadGuardSystem.Services/Implementations/Authentication/AuthService.cs#L126): producing/guard method locator.
- [IdentityOnboardingService.VerifyReporterOtpAsync](../../../RoadGuardSystem.Services/Implementations/Authentication/IdentityOnboardingService.cs#L123): producing/guard method locator.
- [StaffReadRepository.CheckAccessAsync](../../../RoadGuardSystem.Repositories/Implementations/Staff/StaffReadRepository.cs#L8): producing/guard method locator.
- [ProjectScopeGuard.AuthorizeAsync](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| AuthController | [AccessTokenFactory.cs:28](../../../RoadGuardSystem.Services/Factories/AccessTokenFactory.cs#L28)<br>[PasswordChangeFingerprintFactory.cs:21](../../../RoadGuardSystem.Services/Factories/PasswordChangeFingerprintFactory.cs#L21)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| WebAuthController | [AccessTokenFactory.cs:28](../../../RoadGuardSystem.Services/Factories/AccessTokenFactory.cs#L28)<br>[RefreshTokenGenerator.cs:12](../../../RoadGuardSystem.Services/Generators/RefreshTokenGenerator.cs#L12)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ReporterRegistrationsController | [AccessTokenFactory.cs:28](../../../RoadGuardSystem.Services/Factories/AccessTokenFactory.cs#L28)<br>[GmailIdentityMessageSender.cs:107](../../../RoadGuardSystem.Services/Implementations/Authentication/GmailIdentityMessageSender.cs#L107)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| InvitationsController | [AccessTokenFactory.cs:28](../../../RoadGuardSystem.Services/Factories/AccessTokenFactory.cs#L28)<br>[GmailIdentityMessageSender.cs:107](../../../RoadGuardSystem.Services/Implementations/Authentication/GmailIdentityMessageSender.cs#L107)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| UsersController | [IdentityV2Service.cs:105](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityV2Service.cs#L105)<br>[IdentityV2Service.cs:171](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityV2Service.cs#L171)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| AdminUsersController | [TemporaryPasswordGenerator.cs:13](../../../RoadGuardSystem.Services/Generators/TemporaryPasswordGenerator.cs#L13)<br>[TemporaryPasswordGenerator.cs:38](../../../RoadGuardSystem.Services/Generators/TemporaryPasswordGenerator.cs#L38)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| MeController | [IdentityV2Service.cs:228](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityV2Service.cs#L228)<br>[IdentityV2Service.cs:237](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityV2Service.cs#L237)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| ProfileController | [IdentityService.cs:237](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityService.cs#L237)<br>[IdentityService.cs:24](../../../RoadGuardSystem.Services/Implementations/Identity/IdentityService.cs#L24)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |
| StaffDirectoryController | [StaffReadService.cs:11](../../../RoadGuardSystem.Services/Implementations/Staff/StaffReadService.cs#L11)<br>[StaffReadService.cs:38](../../../RoadGuardSystem.Services/Implementations/Staff/StaffReadService.cs#L38)<br>[StaffReadRepository.cs:23](../../../RoadGuardSystem.Repositories/Implementations/Staff/StaffReadRepository.cs#L23)<br>[StaffReadRepository.cs:39](../../../RoadGuardSystem.Repositories/Implementations/Staff/StaffReadRepository.cs#L39) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [IdentityOnboardingPersistenceTests.cs:131](../../../tests/RoadGuardSystem.IntegrationTests/Identity/IdentityOnboardingPersistenceTests.cs#L131): test source, `NOT_RUN`.
- [StaffMembershipReadHttpTests.cs:153](../../../tests/RoadGuardSystem.ApiTests/Projects/StaffMembershipReadHttpTests.cs#L153): test source, `NOT_RUN`.
- [V2IdentityOnboardingFlowTests.cs:114](../../../tests/RoadGuardSystem.ApiTests/Authentication/V2IdentityOnboardingFlowTests.cs#L114): test source, `NOT_RUN`.
- [AuthServiceTests.cs:149](../../../tests/RoadGuardSystem.UnitTests/Authentication/AuthServiceTests.cs#L149): test source, `NOT_RUN`.
- [AuthenticationFlowTests.cs:115](../../../tests/RoadGuardSystem.ApiTests/Authentication/AuthenticationFlowTests.cs#L115): test source, `NOT_RUN`.

- [AuthenticationOpenApiTests.cs:12](../../../tests/RoadGuardSystem.ApiTests/Authentication/AuthenticationOpenApiTests.cs#L12): test source, `NOT_RUN`.
- [AuthenticationSessionFlowTests.cs:106](../../../tests/RoadGuardSystem.ApiTests/Authentication/AuthenticationSessionFlowTests.cs#L106): test source, `NOT_RUN`.
- [AuthenticationSqlServerFixture.cs:66](../../../tests/RoadGuardSystem.ApiTests/Infrastructure/AuthenticationSqlServerFixture.cs#L66): test source, `NOT_RUN`.
