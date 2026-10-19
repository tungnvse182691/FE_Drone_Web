# Processing, AI callback và provider contract boundaries

**Phase 2C · 15/10/2026 · implementation source pinned `36c3a1d273f17dd29b816136ae0182a821fd79e4` · independent JEV pending.**

[API entrance](README.md) · [Review/evidence](PHASE2C_REVIEW_REPORT.md) · [10 workflows](../02_Business-Workflows/README.md) · [Backend/Data](../03_Backend-and-Data/PHASE2B_REVIEW_REPORT.md).

`CURRENT_VERIFIED` = source/static contract discovery, không HTTP/E2E/deployment PASS. `CURRENT_IMPLEMENTED` trong phần AI là phân nhóm contract BE đã có, không nhãn real provider acceptance. `TARGET_CONFIRMED` client/business theo [owner decisions](../../product/confirmed-decisions.md), [latest HUY](../../../planning/development/HUY-FINAL-INTEGRATION.md) và owner Phase2C authorization; precedence theo [governance](../00_Governance/01_Authority-and-Source-of-Truth.md). `PROPOSED`, `NOT_VERIFIED`, `HISTORICAL` giữ phạm vi. Product HoangHaiWarrantySystem; technical RoadGuardSystem/routes giữ nguyên.

## CURRENT_IMPLEMENTED BE contracts — source verified, HTTP NOT_RUN

| API | Actual contract/gate |
|---|---|
| API-044 POST processing-jobs | CreateProcessingJobRequestDto; PM/Supervisor IsManager current source; dataset server-confirmed/integrity-passed, model released, scope/preprocessing/config/mode pins |
| API-045 GET job | PM/Supervisor/Operator project scope; job status/result/version/attempt response |
| API-046 retry | PM/Supervisor current job/retryable state; K/V/reason, new attempt/outbox; no new source manifest guessed |
| API-031 internal results | Named AI service identity, ReceiveAiResultRequestDto, K; raw file checksum/scope + belongs-to-job/manifest/model/mode |
| API-204/241 validation | Legacy compatibility validation routes/data; not product authority to reinstate AI physical dimensions |
| API-052..055 synthetic candidates/runs | Opt-in mock fixture/leased source/provenance, PM create/candidate and scoped PM/Supervisor reads; not REAL YOLO |

Full method/path/header/body/status/error schemas in catalog; no provider route/payload invented. Dispatch outbox initial attemptId differs retry attemptNumber, neither is proof adopted provider request. Dataset/video/SRT/GPS/road route-version/segment-set/band scopes are pins, not inferred from client drawing.

Callback JobAttemptId/ManifestHash/ModelVersionId/Mode/RawResultFileId/ChecksumSha256/Detections. Service checks GUID detectionId/frameFileId, nonnegative timestampMs/type code/confidence0..1/bbox4 normalized x,y,width,height and extent≤1. It serializes normalized detections web JSON before persistence. Repository checks attempt belongs to job + exact job manifest/model/mode; raw result verified checksum/project, then inserts AIDetections and completes job. Frame provenance/model/version remain observation facts; output candidate not auto Defect or Crew dimension.

AI auth issuer/lifetime/kid + audience roadguard-be-ai/subject/client_type AI_SERVICE; AiCallback policy explicitly scheme. No human PM JWT substitute, no assumed token issuance endpoint. Callback processing still needs provenance admission after JWT.

**P1-02 PARTIAL**: latest/active attempt fence missing, receipt fingerprint only detectionsJSON+checksum, not full job/attempt/manifest/model/mode. Belongs-to-job check is implemented; race/exploit not reproduced here. Don't call synthetic lease fence proof compatibility callback fixed. Existing retry/error classification/source checks documented, not widened by docs.

## PROPOSED external FastAPI integration — not adopted wire

Real provider orchestration/context/capabilities/model/artifact download and callback distribution need BE+AI adoption. Inputs should preserve existing authoritative dataset/model/manifest/video/telemetry/GIS source identity, but this is design responsibility, not a fabricated accepted DTO or /predict route. Any future provider transport must fence attempt identity and bind receipts/source artifacts under approved contract. No SDK/package/server/framework change in Phase2C.

Road GIS segment/section != pixel road surface segmentation. Placement of image segmentation may follow approved architecture; not mandatory FastAPI-only. AI detection confidence/type/bbox/frame/timestamp != physical measurement; PM decides KEEP_NEW/LINK_EXISTING/REJECT, Crew measures in FIELD. No SfM/orthomosaic/DSM/3D/AI physical measurement reinstated by legacy endpoint existence.

## NOT_VERIFIED real provider/model/deployment

P1-01/P1-05: actual FastAPI repository/checkpoint/class map/video inference/YOLO all target classes, metrics/telemetry alignment/blob ACL/TLS/auth/liveness/retry callback acceptance not executed. Mode REAL property/outbox row/worker registration isn't real provider integration. No real prediction or performance result claimed.

Source: [controller](../../../RoadGuardSystem.API/Controllers/ProcessingV2Controller.cs), [normalizer](../../../RoadGuardSystem.Services/Implementations/Processing/ProcessingV2Service.cs#L53), [compatibility persistence](../../../RoadGuardSystem.Repositories/Implementations/Processing/ProcessingV2PersistenceService.cs#L117), [AI scheme](../../../RoadGuardSystem.API/Authentication/AiServiceJwtBearerConfiguration.cs), [synthetic service](../../../RoadGuardSystem.Services/Implementations/Processing/Anh02/Anh02AiService.cs), [worker registration](../../../RoadGuardSystem.API/Program.cs#L37). Test locators source only/NOT_RUN. Related [workflow05](../02_Business-Workflows/05_Drone-Survey-Dataset-and-Processing.md) and [candidate authority](../02_Business-Workflows/04_Candidate-Decisions-and-Defect.md).
