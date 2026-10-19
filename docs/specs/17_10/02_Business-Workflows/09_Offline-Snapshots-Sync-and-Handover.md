# Offline snapshots, device enrollment, signed batches và handover

**Phase 2A · source pinned `d91c2e82f1c6feb3a7dcffc4573902314927ae94` · 14/10/2026 · chờ independent JEV review.**

[Workflow index](README.md) · [Review report](PHASE2A_REVIEW_REPORT.md) · [Status/GAP registry](../00_Governance/03_Implementation-and-Verification-Status.md).

`TARGET_CONFIRMED`: [owner decisions 32–44](../../product/confirmed-decisions.md), [latest HUY integration R/H/ND01](../../../planning/development/HUY-FINAL-INTEGRATION.md) và authorization Phase 2A của owner. `CURRENT_VERIFIED` ở đây chỉ observed source tại pinned SHA, không runtime PASS. Source bytes khớp 1334 hashes của inventory tại `6fdd98d98b41311e3af07a7b8cb95c55d8d62bc5`; [Phase 0 API/JEV](../../audit/HHWS-DOCS-REBUILD-01/00_EXECUTIVE_SUMMARY.md) được giữ nguyên phạm vi. `NOT_VERIFIED` tương ứng unknown runtime/integration; `PROPOSED` chưa implementation acceptance; test/checkpoint cũ `HISTORICAL`. [Authority/legend](../00_Governance/01_Authority-and-Source-of-Truth.md) quy định precedence.

## Business purpose, actors và preconditions

PM/Crew tiếp tục command supported khi mất mạng, rồi sync có provenance/current-rights/conflict handling; Crew Mobile Expo là consumer chính. Supervisor Web cấp/revoke handover grant và prepare scoped package theo backend role gate. Reporter online MVP/Operator không được suy có enrollment vì cùng Mobile platform.

Device enrollment và snapshot online cần actor/project/current membership cùng client-owned keys; offline operations cần supported registry action, original actor/origin, pinned source version và signed canonical content. Current backend schema/crypto source không chứng minh Expo native implementation.

## State transitions và main success flow

1. Client tạo cặp khóa signing ECDSA P-256 và encryption ECDH P-256; register **public keys** (SPKI DER Base64), device/actor/project revision/hash. Server ghi registration/identity; **không cấp private key cho client**. `OfflineDeviceKeys.Generate` là reference crypto source, không hardware keystore/FE implementation.
2. Capture snapshot giữ project/source/task/version rights tại thời điểm snapshot; local data dùng source pins. Snapshot không là grant vĩnh viễn: server vẫn kiểm current registration/role/assignment/source khi sync.
3. Local supported operations giữ original/first-start, typed payload/file hashes, parent/lineage và signature envelope. Protocol signature verification canonical manifest/domain SHA256 với fixed-field P1363 signature; không ký JSON serialization tùy ý hoặc dùng idempotency key thay chữ ký.
4. Sync bounded batch 1–1000 items. `ProcessBatchAsync` kiểm registered source key/signature/canonical identity/content và xử lý per-item transaction/receipt. Initial authentication/manifest/snapshot staging guards có thể từ chối batch trước xử lý item; per-item transaction/result không nghĩa mọi batch luôn partial success. Trả batch view và từng kết quả; **HTTP 200 không cho phép xóa mọi local item/file**. Chỉ reconcile durable accepted/replayed ACK tương ứng identity/hash; chưa ACK giữ queue.
5. Start reconcile dùng original origin/task/source/admission; không sinh first-start mới để che stale/uncertain time. Conflict/superseded/revoked rights xử lý theo per-item result; FE không last-write-wins source version.
6. Handover cần Supervisor grant đúng source/recipient/current device/scope và package prepare/export/import. Source/recipient signatures và encrypted bounded package giữ original actor/lineage, không chuyển nhân thân người đo thành người import. Revoke grant/key vẫn phải hiệu lực khi replay.

## Failure, recovery và alternative flows

Wrong signature/canonical hash, same key changed content, revoked device/public key, expired/invalid grant, missing artifact/upload verify, changed membership/assignment/head hoặc unsupported action chặn effect. Per-item failure không rollback giả mọi success khác và không cho phép FE bỏ failed items. Lost connectivity sau server commit cần read/replay receipt để phân biệt retry với duplicate effect.

Mất private key/xóa app/đổi máy có thể mất unsynced local evidence nếu không có recovery package hợp lệ. Server registration/public key không decrypt dữ liệu cũ hoặc restore private key; không hứa recovery tự động. Re-enrollment không biến old signature thành new-device authority. Recovery/escrow/backup policy chưa được owner/source chốt không được invent; cảnh báo nguy cơ mất dữ liệu là yêu cầu consumer, UI chi tiết ngoài Phase 2A.

## Authorization và source/evidence lifecycle

Service write/enrollment PM/Crew; Supervisor grant issue/revoke/package prepare; reads theo PM/Supervisor/Crew cùng resource guards. DIRECT caller/original actor và imported recipient/admission khác nhau. Snapshot, public-key registration/revocations, signature/manifest, per-item receipts, grant/package/artifact chain giữ audit. Signed batch chứng minh key possession và content binding; không chứng minh người thật cầm máy, GPS accuracy hoặc historic wall clock.

## Local encryption và responsibility boundary

Backend xác minh keys/signature/receipts/current rights, quản lý snapshots/grants/bounded encrypted transfers; không mã hóa SQLite/ảnh/thumbnail/queue trong điện thoại. FE phải triển khai encrypted database tương đương SQLCipher, encrypted files/cache/queue và secure private/data keys theo kiến trúc được duyệt. Hardware-backed key storage/Expo native build/crypto adapter cụ thể **PROPOSED / NOT_VERIFIED**; không claim backend encryption đã bảo vệ local DB. Không viết provider/UI/native implementation ở đây.

## Idempotency, concurrency và clocks

Receipt identity + content hash + source/current version bổ sung cho signature, không thay thế nhau. Original time/monotonic boot/certainty được giữ; ND01 FT original-window 24h và conservative server-current admission áp dụng, không signature backdate/resetclock. Business received ACK khác batch transport ACK và inbox read.

## JEV và test evidence

**Judgment: PARTIAL.** Backend canonical registry/signature/snapshot/handover có source; Expo crypto/SQLCipher/file encryption, queue durability, kill/restart/disk-full/key loss/native transfer `NOT_VERIFIED` (P1-05). Recommendation: bounded native adapter/data policy decisions rồi consumer acceptance; không bắt Reporter online dùng Crew enrollment và không tuyên bố key-loss recovery đã triển khai. Runtime Phase 2A `NOT_RUN`.

## API method/path, DTO và controller evidence

18 source operations thuộc nhóm này. K = `Idempotency-Key`, V = `If-Match` khi controller/OpenAPI khai báo; “—” nghĩa không khai báo hai header này trong indexed parameters, **không** chứng minh không có body operation/version guard. K/V biểu thị declared parameters, không phải luôn required: một số controller helper khai báo cả ở GET; xem required flag/actual action validation trong full inventory. Request/response schemas là source locators, không là payload tự soạn. Chi tiết status/error/security/aliases xem [full API inventory](../../audit/HHWS-DOCS-REBUILD-01/02_FULL_API_INVENTORY.md) và [OpenAPI source](../../RoadGuard-Backend-Official/03_API_Contracts/openapi.backend.yaml).

| ID | Method / path | Action / source line | K/V | Request → success schema |
|---|---|---|---|---|
| API-113 | `POST /api/v1/projects/{projectId}/offline/artifacts` | [RegisterArtifact](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L83) | K/V | [OfflineCaptureArtifactInput](../../../RoadGuardSystem.DTOs/Offline/OfflineCaptureTransferDtos.cs#L7) → — |
| API-114 | `GET /api/v1/projects/{projectId}/offline/artifacts/{artifactId}` | [GetArtifact](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L87) | V | — → — |
| API-115 | `GET /api/v1/projects/{projectId}/offline/batches/{batchId}` | [GetBatch](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L71) | V | — → [OfflineBatchResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L58) |
| API-116 | `POST /api/v1/projects/{projectId}/offline/devices` | [RegisterDevice](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L18) | K/V | [OfflineDeviceRegisterInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L7) → — |
| API-117 | `GET /api/v1/projects/{projectId}/offline/devices/{registrationId}` | [GetDevice](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L22) | V | — → — |
| API-118 | `POST /api/v1/projects/{projectId}/offline/devices/{registrationId}/revoke` | [RevokeDevice](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L26) | K/V | [OfflineDeviceRevokeInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L9) → — |
| API-119 | `POST /api/v1/projects/{projectId}/offline/grants` | [IssueGrant](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L55) | K/V | [OfflineHandoverGrantInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L16) → — |
| API-120 | `GET /api/v1/projects/{projectId}/offline/grants/{grantId}` | [GetGrant](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L59) | V | — → — |
| API-121 | `POST /api/v1/projects/{projectId}/offline/grants/{grantId}/revoke` | [RevokeGrant](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L63) | K/V | [OfflineGrantRevokeInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L19) → — |
| API-122 | `POST /api/v1/projects/{projectId}/offline/import` | [ImportPackage](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L67) | K/V | [OfflinePackageImportInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L45) → [OfflineBatchResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L58) |
| API-123 | `GET /api/v1/projects/{projectId}/offline/origins/{originId}` | [GetOrigin](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L75) | V | — → [OfflineItemResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L54) |
| API-124 | `GET /api/v1/projects/{projectId}/offline/packages/{packageId}` | [GetPackage](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L51) | V | — → — |
| API-125 | `POST /api/v1/projects/{projectId}/offline/packages/export` | [ExportPackage](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L43) | K/V | [OfflinePackageExportInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L27) → — |
| API-126 | `POST /api/v1/projects/{projectId}/offline/packages/prepare` | [PreparePackage](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L47) | K/V | [OfflinePackageExportInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L27) → — |
| API-127 | `POST /api/v1/projects/{projectId}/offline/snapshots` | [CaptureSnapshot](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L31) | K/V | [OfflineSnapshotInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L11) → [RepairMeasurementRule](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs#L16), [RoadCoverageMapping](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L5), [SlabGeometrySnapshotFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L145) |
| API-128 | `GET /api/v1/projects/{projectId}/offline/snapshots/{snapshotId}` | [GetSnapshot](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L35) | V | — → [RepairMeasurementRule](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs#L16), [RoadCoverageMapping](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L5), [SlabGeometrySnapshotFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L145) |
| API-129 | `POST /api/v1/projects/{projectId}/offline/starts/reconcile` | [ReconcileStart](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L79) | K/V | [OfflineStartReconcileInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L49) → [OfflineBatchResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L58) |
| API-130 | `POST /api/v1/projects/{projectId}/offline/sync` | [Synchronize](../../../RoadGuardSystem.API/Controllers/OfflineWorkflowController.cs#L39) | K/V | [OfflineSignedBatchInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L42) → [OfflineBatchResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L58) |

## DTO/entity/service/repository và producing-source locators

Các DTO ở bảng API, domain/entity cùng orchestrator/durable seam dưới đây được pin cùng baseline. Partial class được dẫn theo file declaration; method locator bổ sung đường đi producer quan trọng. Đây là static/source evidence, không phải đã chạy transaction thành công.

- [OfflineWorkflowService](../../../RoadGuardSystem.Services/Implementations/Offline/OfflineWorkflowService.cs#L8): source declaration.
- [OfflineWorkflowRepository](../../../RoadGuardSystem.Repositories/Implementations/Offline/OfflineWorkflowRepository.Sync.cs#L13): source declaration.
- [OfflineDeviceKeys](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineDeviceKeys.cs#L6): source declaration.
- [OfflineDevicePublicKeys](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineCryptoFormat.cs#L160): source declaration.
- [OfflineWorkflowAlgorithms](../../../RoadGuardSystem.Repositories/Interfaces/Offline/IOfflineWorkflowRepository.cs#L7): source declaration.
- [OfflineWorkflowEngine](../../../RoadGuardSystem.Services/Implementations/Offline/OfflineWorkflowEngine.cs#L8): source declaration.
- [OfflineDeviceRegistration](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineDeviceRegistration.cs#L5): source declaration.
- [OfflineSyncBatch](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineSyncBatch.cs#L3): source declaration.
- [OfflineWorkflowService.ExecuteAsync](../../../RoadGuardSystem.Services/Implementations/Offline/OfflineWorkflowService.cs#L10): producing/guard method locator.
- [OfflineWorkflowRepository.RegisterDeviceAsync](../../../RoadGuardSystem.Repositories/Implementations/Offline/OfflineWorkflowRepository.cs#L299): producing/guard method locator.
- [OfflineWorkflowRepository.ProcessBatchAsync](../../../RoadGuardSystem.Repositories/Implementations/Offline/OfflineWorkflowRepository.Sync.cs#L25): producing/guard method locator.
- [OfflineDeviceKeys.Generate](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineDeviceKeys.cs#L14): producing/guard method locator.

### Controller → service/repository seams

| Controller | Indexed method locators (shared helper candidates; not proof every route executes every helper) |
|---|---|
| OfflineWorkflowController | [ProjectScopeGuard.cs:19](../../../RoadGuardSystem.Services/Implementations/Authorization/ProjectScopeGuard.cs#L19)<br>[OfflineContractMapping.cs:103](../../../RoadGuardSystem.Services/Implementations/Offline/OfflineContractMapping.cs#L103)<br>[SensitiveJsonSanitizer.cs:20](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L20)<br>[SensitiveJsonSanitizer.cs:33](../../../RoadGuardSystem.Repositories/Auditing/SensitiveJsonSanitizer.cs#L33) |

### Test source coverage — NOT_RUN ở Phase 2A

Static `testRefs` là ứng viên tham chiếu tới controller/service/guard, không chứng minh test đã chạy hoặc tất cả main/failure flows được cover. Liệt kê các file liên quan dưới đây; từng test symbol/line và limitations còn ở full API inventory. Runtime business/SQL/HTTP/Expo/FastAPI/deployment tests không chạy trong thay đổi chỉ tài liệu này. Phase 0 16 PASS/1 FAIL và các test trong HUY spec là evidence **HISTORICAL** theo revision của chúng.

Representative source files được chọn theo module; full static testRefs giữ trong API inventory, không lặp toàn bộ shared-helper candidates ở đây.

- [H5OfflineAdmissionTransactionTests.cs:12](../../../tests/RoadGuardSystem.UnitTests/Offline/H5OfflineAdmissionTransactionTests.cs#L12): test source, `NOT_RUN`.
- [H5OfflineCanonicalFixtureTests.cs:11](../../../tests/RoadGuardSystem.UnitTests/Offline/H5OfflineCanonicalFixtureTests.cs#L11): test source, `NOT_RUN`.
- [H5OfflineCanonicalRegistrySqlTests.cs:162](../../../tests/RoadGuardSystem.IntegrationTests/Offline/H5OfflineCanonicalRegistrySqlTests.cs#L162): test source, `NOT_RUN`.
- [H5OfflineMigrationTests.cs:21](../../../tests/RoadGuardSystem.IntegrationTests/Migrations/Offline/H5OfflineMigrationTests.cs#L21): test source, `NOT_RUN`.
- [H5OfflinePersistenceModelTests.cs:29](../../../tests/RoadGuardSystem.UnitTests/Offline/H5OfflinePersistenceModelTests.cs#L29): test source, `NOT_RUN`.
- [H5OfflineRepairSqlTests.cs:170](../../../tests/RoadGuardSystem.IntegrationTests/Offline/H5OfflineRepairSqlTests.cs#L170): test source, `NOT_RUN`.
- [H5OfflineTransferServiceAdmissionTests.cs:12](../../../tests/RoadGuardSystem.UnitTests/Offline/H5OfflineTransferServiceAdmissionTests.cs#L12): test source, `NOT_RUN`.
- [H5OfflineWorkflowServiceTests.cs:12](../../../tests/RoadGuardSystem.UnitTests/Offline/H5OfflineWorkflowServiceTests.cs#L12): test source, `NOT_RUN`.
