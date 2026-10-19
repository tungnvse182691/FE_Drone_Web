# DTO, schemas, enums và validation reference

**Phase 2C · 15/10/2026 · implementation source pinned `36c3a1d273f17dd29b816136ae0182a821fd79e4` · independent JEV pending.**

[API entrance](README.md) · [Review/evidence](PHASE2C_REVIEW_REPORT.md) · [10 workflows](../02_Business-Workflows/README.md) · [Backend/Data](../03_Backend-and-Data/PHASE2B_REVIEW_REPORT.md).

`CURRENT_VERIFIED` = source/static contract discovery, không HTTP/E2E/deployment PASS. `CURRENT_IMPLEMENTED` trong phần AI là phân nhóm contract BE đã có, không nhãn real provider acceptance. `TARGET_CONFIRMED` client/business theo [owner decisions](../../product/confirmed-decisions.md), [latest HUY](../../../planning/development/HUY-FINAL-INTEGRATION.md) và owner Phase2C authorization; precedence theo [governance](../00_Governance/01_Authority-and-Source-of-Truth.md). `PROPOSED`, `NOT_VERIFIED`, `HISTORICAL` giữ phạm vi. Product HoangHaiWarrantySystem; technical RoadGuardSystem/routes giữ nguyên.

## Schema authority and reading rules

357 fresh OpenAPI schemas, no examples/accepted fixtures manufactured. Each schema entry lists its source declaration and exact root required/nullable/enum/composition plus properties/facets. Required=false is not proof a field may be null; nullable=false/absent is an OpenAPI facet, not C# nullable-reference enforcement or service business validation. CLR attributes/record parameters and runtime guards add constraints. Swagger schema has no unique CLR match for some anonymous/framework/owned wire shapes: this is explicit, not invented DTO. Full unchanged OpenAPI remains artifact; this condensed reference is not a second YAML schema/contract lock.

## Schema AcceptInvitationRequestDto

Source: [AcceptInvitationRequestDto](../../../RoadGuardSystem.DTOs/Invitations/AcceptInvitationRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["displayName", "invitationToken", "password"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `invitationToken` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `displayName` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `password` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |

## Schema AccountUpdateRequestDto

Source: [AccountUpdateRequestDto](../../../RoadGuardSystem.DTOs/Identity/AccountUpdateRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["reason", "role", "status"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `status` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `role` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `reason` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |

## Schema ActiveCandidateDisposition

Source: [ActiveCandidateDisposition](../../../RoadGuardSystem.BusinessObjects/Candidates/ActiveCandidateDisposition.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `decisionId` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema ActorResponseDto

Source: [ActorResponseDto](../../../RoadGuardSystem.DTOs/Identity/ActorResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `displayName` required=false nullable=true: `string`; `role` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema AdminPasswordResetRequestDto

Source: [AdminPasswordResetRequestDto](../../../RoadGuardSystem.DTOs/Identity/AdminPasswordResetRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["expectedTargetRowVersion"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `expectedTargetRowVersion` | true | `string` | minLength=1 | `string?`; `[Required]` |
| `operationId` | false | `string/uuid` | — | `Guid`; `no property attributes indexed` |

## Schema AdminPasswordResetResponseDto

Source: [AdminPasswordResetResponseDto](../../../RoadGuardSystem.DTOs/Identity/AdminPasswordResetResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `userId` required=false nullable=absent: `string/uuid`; `mustChangePassword` required=false nullable=absent: `boolean`; `temporaryPassword` required=false nullable=true: `string`.

## Schema AdminResetPasswordV2RequestDto

Source: [AdminResetPasswordV2RequestDto](../../../RoadGuardSystem.DTOs/Identity/AdminResetPasswordV2RequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["reason", "temporaryPassword"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `temporaryPassword` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `reason` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |

## Schema AiCandidateFactsV1

Source: [AiCandidateFactsV1](../../../RoadGuardSystem.Services/Interfaces/Integration/Anh02Contracts.cs#L58). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `detectionId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `datasetVersionId` required=false nullable=absent: `string/uuid`; `modelVersionId` required=false nullable=absent: `string/uuid`; `runId` required=false nullable=absent: `string/uuid`; `jobId` required=false nullable=absent: `string/uuid`; `attemptId` required=false nullable=absent: `string/uuid`; `resultId` required=false nullable=absent: `string/uuid`; `manifestHash` required=false nullable=true: `string`; `resultHash` required=false nullable=true: `string`; `fixtureVersion` required=false nullable=true: `string`; `mode` required=false nullable=true: `string`; `sourceVideoFileId` required=false nullable=absent: `string/uuid`; `sourceVideoFileVersion` required=false nullable=true: `string`; `frameFileId` required=false nullable=absent: `string/uuid`; `frameFileVersion` required=false nullable=true: `string`; `frameSha256` required=false nullable=true: `string`; `frameSizeBytes` required=false nullable=absent: `integer/int64`; `frameMediaType` required=false nullable=true: `string`; `timestampMs` required=false nullable=absent: `integer/int64`; `typeCode` required=false nullable=true: `string`; `confidence` required=false nullable=absent: `number/double`; `boundingBox` required=false nullable=absent: [NormalizedBoundingBoxV1](03_DTO-and-Schema-Reference.md#schema-normalizedboundingboxv1); `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `segmentId` required=false nullable=true: `string/uuid`; `geometryVersion` required=false nullable=true: `string`; `positionStatus` required=false nullable=true: `string`; `sourceVersion` required=false nullable=true: `string`; `disposition` required=false nullable=absent: [ActiveCandidateDisposition](03_DTO-and-Schema-Reference.md#schema-activecandidatedisposition); `dispositionVersion` required=false nullable=true: `string`.

## Schema AiDetectionDto

Source: [AiDetectionDto](../../../RoadGuardSystem.DTOs/Processing/AiDetectionDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["bbox", "detectionId", "typeCode"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [param: Required] string DetectionId,     Guid FrameFileId,     int TimestampMs,     [param: Required, MinLength(1)] string TypeCode,     decimal Confidence,     [param: Required, MinLength(4), MaxLength(4)] IReadOnlyList<decimal> Bbox)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `detectionId` | true | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `frameFileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `timestampMs` | false | `integer/int32` | minimum=0 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `typeCode` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `confidence` | false | `number/double` | minimum=0; maximum=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `bbox` | true | array<`number/double`> | minItems=4; maxItems=4 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema AiDetectionResultV1

Source: [AiDetectionResultV1](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L38). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `detectionId` required=false nullable=absent: `string/uuid`; `sourceVideoFileId` required=false nullable=absent: `string/uuid`; `frameFileId` required=false nullable=absent: `string/uuid`; `frameFileVersion` required=false nullable=true: `string`; `timestampMs` required=false nullable=absent: `integer/int64`; `typeCode` required=false nullable=true: `string`; `confidence` required=false nullable=absent: `number/double`; `bbox` required=false nullable=true: array<`number/double`>; `segmentId` required=false nullable=true: `string/uuid`; `positionStatus` required=false nullable=true: `string`; `geometry` required=false nullable=true: `unspecified`.

## Schema AiMatchResultV1

Source: [AiMatchResultV1](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L44). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `detectionId` required=false nullable=absent: `string/uuid`; `candidateDefectId` required=false nullable=absent: `string/uuid`; `candidateVersion` required=false nullable=true: `string`; `rank` required=false nullable=absent: `integer/int32`; `score` required=false nullable=true: `number/double`; `reasonCodes` required=false nullable=true: array<`string`>.

## Schema AiMockRunView

Source: [AiMockRunView](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L27). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `stage` required=false nullable=true: `string`; `mode` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `processingJobId` required=false nullable=absent: `string/uuid`; `attemptId` required=false nullable=absent: `string/uuid`; `manifestHash` required=false nullable=true: `string`; `resultId` required=false nullable=true: `string/uuid`; `fixtureVersion` required=false nullable=true: `string`; `errorCode` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema AiMockScopeRequest

Source: [AiMockScopeRequest](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid RouteVersionId, Guid SegmentSetId, Guid[] SegmentIds, string TargetBand)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `routeVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetBand` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema AiResultV1

Source: [AiResultV1](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L46). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `runId` required=false nullable=absent: `string/uuid`; `stage` required=false nullable=true: `string`; `mode` required=false nullable=true: `string`; `jobId` required=false nullable=absent: `string/uuid`; `attemptId` required=false nullable=absent: `string/uuid`; `manifestHash` required=false nullable=true: `string`; `modelVersionId` required=false nullable=absent: `string/uuid`; `fixtureVersion` required=false nullable=true: `string`; `resultHash` required=false nullable=true: `string`; `completedAt` required=false nullable=absent: `string/date-time`; `detections` required=false nullable=true: array<[AiDetectionResultV1](03_DTO-and-Schema-Reference.md#schema-aidetectionresultv1)>; `matches` required=false nullable=true: array<[AiMatchResultV1](03_DTO-and-Schema-Reference.md#schema-aimatchresultv1)>.

## Schema AsBuiltLayoutInput

Source: [AsBuiltLayoutInput](../../../RoadGuardSystem.DTOs/Projects/PavementLayoutDtos.cs#L73). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid SourcePlanId, AsBuiltSlabInput[] Slabs, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sourcePlanId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `slabs` | false | array<[AsBuiltSlabInput](03_DTO-and-Schema-Reference.md#schema-asbuiltslabinput)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema AsBuiltSlabInput

Source: [AsBuiltSlabInput](../../../RoadGuardSystem.DTOs/Projects/PavementLayoutDtos.cs#L62). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string Key, int? PlannedSequence, GeometryPoint[] Footprint,     double? LengthMeters, double? WidthMeters, string? DimensionUnknownReason, string Source,     Guid? SourceFileId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `key` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `plannedSequence` | false | `integer/int32` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `footprint` | false | array<[GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `lengthMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `widthMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dimensionUnknownReason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `source` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceFileId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema AssessmentEvidenceDto

Source: [AssessmentEvidenceDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid FileId, long? FromMilliseconds = null, long? ToMilliseconds = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fromMilliseconds` | false | `integer/int64` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `toMilliseconds` | false | `integer/int64` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema AssessmentItemDto

Source: [AssessmentItemDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid RouteVersionId, Guid SegmentSetId, Guid SegmentId, string TargetBand,     string PositionStatus, string QualityStatus, string CoverageStatus, string Reason, IReadOnlyList<AssessmentEvidenceDto> Evidence)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `routeVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetBand` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `positionStatus` | false | `string` | nullable=true; enum=["PASS","FAIL","UNKNOWN"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `qualityStatus` | false | `string` | nullable=true; enum=["PASS","FAIL","UNKNOWN"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `coverageStatus` | false | `string` | nullable=true; enum=["PASS","FAIL","UNKNOWN"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidence` | false | array<[AssessmentEvidenceDto](03_DTO-and-Schema-Reference.md#schema-assessmentevidencedto)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema AssessmentView

Source: [AssessmentView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `datasetId` required=false nullable=absent: `string/uuid`; `methodVersion` required=false nullable=true: `string`; `reviewedBy` required=false nullable=absent: `string/uuid`; `reviewedAt` required=false nullable=absent: `string/date-time`; `items` required=false nullable=true: array<[AssessmentItemDto](03_DTO-and-Schema-Reference.md#schema-assessmentitemdto)>; `version` required=false nullable=true: `string`.

## Schema AuthActorResponseDto

Source: [AuthActorResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthActorResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `displayName` required=false nullable=true: `string`; `role` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema AuthTokenResponseDto

Source: [AuthTokenResponseDto](../../../RoadGuardSystem.DTOs/Authentication/AuthTokenResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `accessToken` required=false nullable=true: `string`; `refreshToken` required=false nullable=true: `string`; `tokenType` required=false nullable=true: `string`; `expiresIn` required=false nullable=absent: `integer/int32`; `mustChangePassword` required=false nullable=absent: `boolean`; `user` required=false nullable=absent: [AuthActorResponseDto](03_DTO-and-Schema-Reference.md#schema-authactorresponsedto).

## Schema BandScopeDto

Source: [BandScopeDto](../../../RoadGuardSystem.DTOs/Surveys/BandScopeDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["targetBand"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid RouteVersionId,     Guid SegmentSetId,     [MinLength(1)] IReadOnlyList<Guid> SegmentIds,     [Required, MinLength(1)] string TargetBand)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `routeVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentIds` | false | array<`string/uuid`> | nullable=true; minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetBand` | true | `string` | minLength=1; enum=["SURFACE","LEFT_EDGE","RIGHT_EDGE"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema BaselineItemDto

Source: [BaselineItemDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid RouteVersionId, Guid SegmentSetId, Guid SegmentId, string TargetBand,     Guid DatasetId, Guid AssessmentId, Guid? ExpectedBaselineSelectionId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `routeVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetBand` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `datasetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assessmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedBaselineSelectionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema BaselineSelectedItemDto

Source: [BaselineSelectedItemDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `selectionId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `segmentId` required=false nullable=absent: `string/uuid`; `targetBand` required=false nullable=true: `string`; `datasetId` required=false nullable=absent: `string/uuid`; `assessmentId` required=false nullable=absent: `string/uuid`.

## Schema BaselineView

Source: [BaselineView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `items` required=false nullable=true: array<[BaselineSelectedItemDto](03_DTO-and-Schema-Reference.md#schema-baselineselecteditemdto)>; `selectedBy` required=false nullable=absent: `string/uuid`; `selectedAt` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`.

## Schema BusinessDutyAppointmentInput

Source: [BusinessDutyAppointmentInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid AssigneeId, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `assigneeId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema BusinessDutyView

Source: [BusinessDutyView](../../../RoadGuardSystem.Repositories/Interfaces/Messaging/IBusinessDutyRepository.cs#L8). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `sourceVersion` required=false nullable=true: `string`; `scopeId` required=false nullable=absent: `string/uuid`; `responsibleActorId` required=false nullable=true: `string/uuid`; `responsibleRole` required=false nullable=true: `string`; `requestedAt` required=false nullable=absent: `string/date-time`; `receivingState` required=false nullable=true: `string`; `waitingSeconds` required=false nullable=absent: `number/double`; `acknowledgmentId` required=false nullable=true: `string/uuid`; `acknowledgedBy` required=false nullable=true: `string/uuid`; `acknowledgedAt` required=false nullable=true: `string/date-time`; `claimedDeviceAt` required=false nullable=true: `string/date-time`; `clockId` required=false nullable=true: `string/uuid`; `originalDueAt` required=false nullable=true: `string/date-time`; `currentDueAt` required=false nullable=true: `string/date-time`; `completedAt` required=false nullable=true: `string/date-time`; `version` required=false nullable=true: `string`; `appointments` required=false nullable=absent: array<`object` (inline properties: id, previousActorId, currentActorId, decisionActorId, reason, effectiveAt)>.

## Schema BusinessRequestAckInput

Source: [BusinessRequestAckInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(DateTimeOffset? ClaimedDeviceAt)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `claimedDeviceAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CandidateClassificationDto

Source: [CandidateClassificationDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? DefectTypeCode, string? CauseCategoryCode, string? Severity,     Guid RoadSectionVersionId, Guid? SegmentId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `defectTypeCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `causeCategoryCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `severity` | false | `string` | nullable=true; enum=["LOW","MEDIUM","HIGH","CRITICAL"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `roadSectionVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CandidateDecisionRequestDto

Source: [CandidateDecisionRequestDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L8). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? SourceKind, Guid SourceId, string? SourceVersion,     string? GeometryVersion, string? Decision, Guid? TargetDefectId, string? TargetVersion,     CandidateClassificationDto? Classification, string? Reason, Guid? SupersedesDecisionId = null, string? PreviousDecisionVersion = null,     CandidateRecurrenceDto? Recurrence = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sourceKind` | false | `string` | nullable=true; enum=["REPORT","AI_DETECTION","FIELD_OBSERVATION"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceVersion` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `geometryVersion` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `decision` | false | `string` | nullable=true; enum=["REJECT","KEEP_NEW","LINK_EXISTING"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetDefectId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `classification` | false | [CandidateClassificationDto](03_DTO-and-Schema-Reference.md#schema-candidateclassificationdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `supersedesDecisionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `previousDecisionVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recurrence` | false | [CandidateRecurrenceDto](03_DTO-and-Schema-Reference.md#schema-candidaterecurrencedto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CandidateDecisionResponseDto

Source: [CandidateDecisionResponseDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `decision` required=false nullable=true: `string`; `defectId` required=false nullable=true: `string/uuid`; `version` required=false nullable=true: `string`; `supersedesDecisionId` required=false nullable=true: `string/uuid`.

## Schema CandidateMatchHistoryDto

Source: [CandidateMatchHistoryDto](../../../RoadGuardSystem.DTOs/Defects/CandidateMatchDtos.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `sourceLinkCount` required=false nullable=absent: `integer/int32`.

## Schema CandidateMatchItemDto

Source: [CandidateMatchItemDto](../../../RoadGuardSystem.DTOs/Defects/CandidateMatchDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `defectId` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`; `segmentId` required=false nullable=true: `string/uuid`; `priorityGroup` required=false nullable=absent: `integer/int32`; `distanceMeters` required=false nullable=true: `number/double`; `accuracyMeters` required=false nullable=true: `number/double`; `reasonCodes` required=false nullable=true: array<`string`>; `evidenceRefs` required=false nullable=true: array<`string/uuid`>; `historySummary` required=false nullable=absent: [CandidateMatchHistoryDto](03_DTO-and-Schema-Reference.md#schema-candidatematchhistorydto).

## Schema CandidateMatchPageDto

Source: [CandidateMatchPageDto](../../../RoadGuardSystem.DTOs/Defects/CandidateMatchDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `source` required=false nullable=absent: [CandidateMatchSourceDto](03_DTO-and-Schema-Reference.md#schema-candidatematchsourcedto); `geometryVersion` required=false nullable=true: `string`; `algorithmVersion` required=false nullable=true: `string`; `items` required=false nullable=true: array<[CandidateMatchItemDto](03_DTO-and-Schema-Reference.md#schema-candidatematchitemdto)>; `nextCursor` required=false nullable=true: `string`.

## Schema CandidateMatchSourceDto

Source: [CandidateMatchSourceDto](../../../RoadGuardSystem.DTOs/Defects/CandidateMatchDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `kind` required=false nullable=true: `string`; `id` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema CandidateRecurrenceDto

Source: [CandidateRecurrenceDto](../../../RoadGuardSystem.DTOs/Defects/CandidateDecisionDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid PreviousDefectId, Guid PriorRepairDecisionId, Guid[] EvidenceFileIds, string? ExpectedLifecycleVersion = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `previousDefectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `priorRepairDecisionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceFileIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedLifecycleVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CaseConclusionDto

Source: [CaseConclusionDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? Outcome, IReadOnlyList<Guid>? DefectIds, IReadOnlyList<Guid>? EvidenceIds, string? Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `outcome` | false | `string` | nullable=true; enum=["CONFIRMED","NO_DEFECT","NEEDS_EVIDENCE"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CaseConclusionViewDto

Source: [CaseConclusionViewDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L27). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `outcome` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`; `concludedAt` required=false nullable=absent: `string/date-time`; `defectIds` required=false nullable=true: array<`string/uuid`>; `evidenceIds` required=false nullable=true: array<`string/uuid`>.

## Schema CaseLinkDto

Source: [CaseLinkDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L8). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(IReadOnlyList<Guid>? ReportIds, IReadOnlyDictionary<Guid, string>? SourceCaseVersions, string? Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reportIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceCaseVersions` | false | map<`string`> | nullable=true; additionalProperties={"type":"string"} | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CasePageDto

Source: [CasePageDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L46). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[InternalCaseDto](03_DTO-and-Schema-Reference.md#schema-internalcasedto)>; `nextCursor` required=false nullable=true: `string`.

## Schema CasePublicationDto

Source: [CasePublicationDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(IReadOnlyList<Guid>? ReportIds, IReadOnlyList<Guid>? DefectIds, IReadOnlyList<Guid>? EvidenceIds, string? Summary)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reportIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `summary` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CasePublicationResponseDto

Source: [CasePublicationResponseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L37). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `caseId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema CaseSplitDto

Source: [CaseSplitDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(IReadOnlyList<Guid>? ReportIds, string? Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reportIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CaseTriageDto

Source: [CaseTriageDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ProjectId, string? VerificationMethod, string? Reason,     Guid? RouteVersionId = null, Guid? SegmentSetId = null, string? GeometryVersion = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `projectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `verificationMethod` | false | `string` | nullable=true; enum=["FIELD","DRONE","EXISTING_EVIDENCE"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `routeVersionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `geometryVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ChainageCalibrationInput

Source: [ChainageCalibrationInput](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L90). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string SourceReference, string SourceChecksum,     ChainageControl[] Controls, string SelectedReason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sourceReference` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceChecksum` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `controls` | false | array<[ChainageControl](03_DTO-and-Schema-Reference.md#schema-chainagecontrol)> | nullable=true; minItems=2 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `selectedReason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ChainageControl

Source: [ChainageControl](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L81). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(double GeometricOffsetMeters, double StationMeters)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `geometricOffsetMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `stationMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ChangePasswordRequestDto

Source: [ChangePasswordRequestDto](../../../RoadGuardSystem.DTOs/Authentication/ChangePasswordRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["currentPassword", "newPassword"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `currentPassword` | true | `string` | minLength=1; maxLength=1024 | `string?`; `[Required] [StringLength(1024, MinimumLength = 1)]` |
| `newPassword` | true | `string` | minLength=1; maxLength=1024 | `string?`; `[Required] [StringLength(1024, MinimumLength = 1)]` |

## Schema ClockExtensionInput

Source: [ClockExtensionInput](../../../RoadGuardSystem.DTOs/Messaging/BusinessDutyInputs.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(DateTimeOffset NewDueAt, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `newDueAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CompletedUploadPartDto

Source: [CompletedUploadPartDto](../../../RoadGuardSystem.DTOs/Files/CompletedUploadPartDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["eTag"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Range(1, int.MaxValue)] int PartNumber,     [Required, MaxLength(512)] string ETag)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `partNumber` | false | `integer/int32` | minimum=1; maximum=2147483647 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `eTag` | true | `string` | maxLength=512 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ConfirmRetentionBasisRequest

Source: [ConfirmRetentionBasisRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid[] WarrantyIds, string ExpectedReferenceInventoryVersion, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `warrantyIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedReferenceInventoryVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateAiMockRunRequest

Source: [CreateAiMockRunRequest](../../../RoadGuardSystem.DTOs/Processing/Anh02AiDtos.cs#L15). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid DatasetId, AiMockScopeRequest Scope, Guid ModelVersionId,     string PreprocessingVersion, string ConfigVersion, string FixtureVersion, string Stage,     string ExpectedGeometryVersion, Guid? AnalysisRunId = null, Guid? CandidateSnapshotId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `datasetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scope` | false | [AiMockScopeRequest](03_DTO-and-Schema-Reference.md#schema-aimockscoperequest) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `modelVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `preprocessingVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `configVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fixtureVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `stage` | false | `string` | nullable=true; enum=["VIDEO_ANALYSIS","DUPLICATE_MATCHING"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedGeometryVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `analysisRunId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `candidateSnapshotId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateAssessmentDto

Source: [CreateAssessmentDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string MethodVersion, IReadOnlyList<AssessmentItemDto> Items)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `methodVersion` | false | `string` | nullable=true; enum=["pm-evidence-review.v1"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `items` | false | array<[AssessmentItemDto](03_DTO-and-Schema-Reference.md#schema-assessmentitemdto)> | nullable=true; minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateBaselineDto

Source: [CreateBaselineDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(IReadOnlyList<BaselineItemDto> Items, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `items` | false | array<[BaselineItemDto](03_DTO-and-Schema-Reference.md#schema-baselineitemdto)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateExportRequestDto

Source: [CreateExportRequestDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Kind, string Format, Guid[]? SegmentIds = null, Guid[]? DefectIds = null, DateTimeOffset? From = null, DateTimeOffset? To = null, bool IncludeOriginalFiles = false)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `kind` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `format` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `from` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `to` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `includeOriginalFiles` | false | `boolean` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateHandoverRequestDto

Source: [CreateHandoverRequestDto](../../../RoadGuardSystem.DTOs/Projects/CreateHandoverRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["documentNo", "handoverDate"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MaxLength(80)] string DocumentNo,     [Required] DateOnly? HandoverDate,     Guid? FileId,     string? Notes)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `documentNo` | true | `string` | maxLength=80 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverDate` | true | `string/date` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `notes` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateInvitationRequestDto

Source: [CreateInvitationRequestDto](../../../RoadGuardSystem.DTOs/Invitations/CreateInvitationRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["email", "projectIds", "role"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `email` | true | `string/email` | minLength=1 | `string?`; `[Required, EmailAddress]` |
| `role` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `projectIds` | true | array<`string/uuid`> | — | `IReadOnlyList<Guid>?`; `[Required]` |

## Schema CreateProcessingJobRequestDto

Source: [CreateProcessingJobRequestDto](../../../RoadGuardSystem.DTOs/Processing/CreateProcessingJobRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["configVersion", "mode", "preprocessingVersion"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid DatasetId,     BandScopeDto Scope,     Guid ModelVersionId,     [param: Required, MinLength(1)] string PreprocessingVersion,     [param: Required, MinLength(1)] string ConfigVersion,     [param: Required, RegularExpression("^(MOCK&#124;REAL)$")] string Mode)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `datasetId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scope` | false | [BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `modelVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `preprocessingVersion` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `configVersion` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mode` | true | `string` | pattern="^(MOCK&#124;REAL)$"; enum=["MOCK","REAL"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateProjectRequestDto

Source: [CreateProjectRequestDto](../../../RoadGuardSystem.DTOs/Projects/CreateProjectRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["name"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [MaxLength(50)] string? Code,     [Required, MaxLength(255)] string Name,     Guid PrimaryPmId,     DateOnly? HandoverDate,     DateOnly? WarrantyEndDate,     IReadOnlyList<Guid>? HandoverFileIds,     string? ProjectCode = null,     string? Description = null,     int? EngineeringUtmSrid = null,     DateOnly? StartDate = null,     DateOnly? EndDate = null,     Guid PrimaryProjectManagerUserId = default,     CreateHandoverRequestDto? Handover = null,     Guid OperationId = default)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `code` | false | `string` | nullable=true; maxLength=50 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `name` | true | `string` | maxLength=255 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `primaryPmId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverDate` | false | `string/date` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `warrantyEndDate` | false | `string/date` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverFileIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `projectCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `description` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `engineeringUtmSrid` | false | `integer/int32` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `startDate` | false | `string/date` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `endDate` | false | `string/date` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `primaryProjectManagerUserId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handover` | false | [CreateHandoverRequestDto](03_DTO-and-Schema-Reference.md#schema-createhandoverrequestdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateProjectResponseDto

Source: [CreateProjectResponseDto](../../../RoadGuardSystem.DTOs/Projects/CreateProjectResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `code` required=false nullable=true: `string`; `name` required=false nullable=true: `string`; `primaryPmId` required=false nullable=absent: `string/uuid`; `handoverDate` required=false nullable=absent: `string/date`; `warrantyEndDate` required=false nullable=absent: `string/date`; `status` required=false nullable=true: `string`; `version` required=false nullable=true: `string`; `projectId` required=false nullable=absent: `string/uuid`; `projectCode` required=false nullable=true: `string`; `primaryProjectManagerUserId` required=false nullable=absent: `string/uuid`; `handoverDocumentId` required=false nullable=absent: `string/uuid`; `rowVersion` required=false nullable=true: `string`.

## Schema CreateReporterReportRequestDto

Source: [CreateReporterReportRequestDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L20). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? Description, IReadOnlyList<ReportEvidenceInputDto?>? Evidence)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `description` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidence` | false | array<[ReportEvidenceInputDto](03_DTO-and-Schema-Reference.md#schema-reportevidenceinputdto)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateRetentionEvaluationRequest

Source: [CreateRetentionEvaluationRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L34). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid[]? FileIds)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fileIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateRetentionHoldRequest

Source: [CreateRetentionHoldRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string ScopeType, Guid ScopeId, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `scopeType` | false | `string` | nullable=true; enum=["PROJECT","FILE"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scopeId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateRoadSectionRequestDto

Source: [CreateRoadSectionRequestDto](../../../RoadGuardSystem.DTOs/Projects/CreateRoadSectionRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["changeReason", "code", "coordinates"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, StringLength(80)] string Code,     [StringLength(255)] string? Name,     [Range(32648, 32649)] int Srid,     [Required, MinLength(2)] IReadOnlyList<RoadSectionCoordinateDto> Coordinates,     DateTimeOffset EffectiveFrom,     [Required] string ChangeReason,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `code` | true | `string` | maxLength=80 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `name` | false | `string` | nullable=true; maxLength=255 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `srid` | false | `integer/int32` | minimum=32648; maximum=32649 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `coordinates` | true | array<[RoadSectionCoordinateDto](03_DTO-and-Schema-Reference.md#schema-roadsectioncoordinatedto)> | minItems=2 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `effectiveFrom` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `changeReason` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateRoadSectionVersionRequestDto

Source: [CreateRoadSectionVersionRequestDto](../../../RoadGuardSystem.DTOs/Projects/CreateRoadSectionVersionRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["changeReason", "coordinates"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Range(32648, 32649)] int Srid,     [Required, MinLength(2)] IReadOnlyList<RoadSectionCoordinateDto> Coordinates,     DateTimeOffset EffectiveFrom,     [Required] string ChangeReason,     Guid ExpectedCurrentVersionId,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `srid` | false | `integer/int32` | minimum=32648; maximum=32649 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `coordinates` | true | array<[RoadSectionCoordinateDto](03_DTO-and-Schema-Reference.md#schema-roadsectioncoordinatedto)> | minItems=2 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `effectiveFrom` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `changeReason` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedCurrentVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateSurveyPlanRequestDto

Source: [CreateSurveyPlanRequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyPlanRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["outputRequirements"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     DateTimeOffset PlannedStartAt,     DateTimeOffset PlannedEndAt,     Guid RoadSectionVersionId,     SurveyType SurveyType,     [Required] string OutputRequirements,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `plannedStartAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `plannedEndAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `roadSectionVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `surveyType` | false | [SurveyType](03_DTO-and-Schema-Reference.md#schema-surveytype) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `outputRequirements` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateSurveyPlanResponseDto

Source: [CreateSurveyPlanResponseDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyPlanResponseDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `planId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=absent: `string/uuid`; `roadSectionVersionId` required=false nullable=true: `string/uuid`; `plannedStartAt` required=false nullable=absent: `string/date-time`; `plannedEndAt` required=false nullable=absent: `string/date-time`; `surveyType` required=false nullable=absent: [SurveyType](03_DTO-and-Schema-Reference.md#schema-surveytype); `status` required=false nullable=absent: [SurveyPlanStatus](03_DTO-and-Schema-Reference.md#schema-surveyplanstatus); `outputRequirements` required=false nullable=true: `string`.

## Schema CreateSurveyPlanV2RequestDto

Source: [CreateSurveyPlanV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyPlanV2RequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["scope", "surveyType"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] IReadOnlyList<BandScopeDto> Scope,     DateTimeOffset PlannedAt,     [Required] string SurveyType)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `scope` | true | array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `plannedAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `surveyType` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateSurveyRequestRequestDto

Source: [CreateSurveyRequestRequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyRequestRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["outputRequirements"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid? SurveyPlanId,     Guid RoadSectionVersionId,     SurveyType SurveyType,     DateTimeOffset? DueAt,     [Required] string OutputRequirements,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `surveyPlanId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `roadSectionVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `surveyType` | false | [SurveyType](03_DTO-and-Schema-Reference.md#schema-surveytype) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dueAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `outputRequirements` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateSurveyRequestResponseDto

Source: [CreateSurveyRequestResponseDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyRequestResponseDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `requestId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=absent: `string/uuid`; `roadSectionVersionId` required=false nullable=true: `string/uuid`; `surveyPlanId` required=false nullable=true: `string/uuid`; `requestedByUserId` required=false nullable=absent: `string/uuid`; `surveyType` required=false nullable=absent: [SurveyType](03_DTO-and-Schema-Reference.md#schema-surveytype); `status` required=false nullable=absent: [SurveyRequestStatus](03_DTO-and-Schema-Reference.md#schema-surveyrequeststatus); `requestedAt` required=false nullable=absent: `string/date-time`; `dueAt` required=false nullable=absent: `string/date-time`; `outputRequirements` required=false nullable=true: `string`.

## Schema CreateSurveyTaskV2RequestDto

Source: [CreateSurveyTaskV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/CreateSurveyTaskV2RequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["scope", "surveyType"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] IReadOnlyList<BandScopeDto> Scope,     [Required] string SurveyType,     Guid OperatorId,     DateTimeOffset? DueAt,     PositionDto? AccessPoint,     Guid? PlanId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `scope` | true | array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `surveyType` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operatorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dueAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `accessPoint` | false | [PositionDto](03_DTO-and-Schema-Reference.md#schema-positiondto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `planId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateTrainingLabelDto

Source: [CreateTrainingLabelDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L17). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? SourceKind, Guid SourceId, string? SourceVersion,     Guid FileId, LabelAnnotationDto? Annotation, string? DefectTypeCode, string? Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sourceKind` | false | `string` | nullable=true; enum=["REPORT","AI_DETECTION"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceVersion` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `annotation` | false | [LabelAnnotationDto](03_DTO-and-Schema-Reference.md#schema-labelannotationdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectTypeCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateValidationRunRequestDto

Source: [CreateValidationRunRequestDto](../../../RoadGuardSystem.DTOs/Processing/CreateValidationRunRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["measurementType", "pairs", "unit"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [param: Required, MinLength(1)] IReadOnlyList<ValidationPairDto> Pairs,     Guid ModelVersionId,     Guid DatasetSplitId,     [param: Required, MinLength(1)] string MeasurementType,     [param: Required, MinLength(1)] string Unit)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `pairs` | true | array<[ValidationPairDto](03_DTO-and-Schema-Reference.md#schema-validationpairdto)> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `modelVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `datasetSplitId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `measurementType` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `unit` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateWarrantyRequestDto

Source: [CreateWarrantyRequestDto](../../../RoadGuardSystem.DTOs/Warranties/CreateWarrantyRequestDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid? RoadSectionId,     Guid? HandoverDocumentId,     DateOnly HandoverDate,     DateOnly WarrantyStartDate,     DateOnly WarrantyEndDate,     decimal? RetainedValue,     string Scope,     string? Terms,     Guid? SourceDocumentId,     string Status,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `roadSectionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverDocumentId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverDate` | false | `string/date` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `warrantyStartDate` | false | `string/date` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `warrantyEndDate` | false | `string/date` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `retainedValue` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scope` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `terms` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceDocumentId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `status` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CreateWarrantyResponseDto

Source: [CreateWarrantyResponseDto](../../../RoadGuardSystem.DTOs/Warranties/CreateWarrantyResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `warrantyId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=true: `string/uuid`; `handoverDocumentId` required=false nullable=true: `string/uuid`; `handoverDate` required=false nullable=absent: `string/date`; `warrantyStartDate` required=false nullable=absent: `string/date`; `warrantyEndDate` required=false nullable=absent: `string/date`; `retainedValue` required=false nullable=true: `number/double`; `scope` required=false nullable=true: `string`; `terms` required=false nullable=true: `string`; `sourceDocumentId` required=false nullable=true: `string/uuid`; `status` required=false nullable=true: `string`.

## Schema CrsControlPoint

Source: [CrsControlPoint](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(GeometryPoint Native, GeometryPoint Wgs84, string IndependentSource)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `native` | false | [GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `wgs84` | false | [GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `independentSource` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CrsEllipsoidDefinition

Source: [CrsEllipsoidDefinition](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(double SemiMajorAxisMeters, double InverseFlattening, string SourceReference)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `semiMajorAxisMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `inverseFlattening` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceReference` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CrsProfileInput

Source: [CrsProfileInput](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L40). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string Code, int SourceSrid, string Datum, string Projection,     string AxisOrder, double MetresPerUnit, string SourceReference, string SourceChecksum,     CrsTransformOperation? Operation = null, CrsControlPoint[]? IndependentControls = null,     double? SourcedToleranceMeters = null, string? ToleranceSource = null, bool SampleOnly = true,     CrsEllipsoidDefinition? Ellipsoid = null, CrsProjectionDefinition? ProjectionDefinition = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `code` | false | `string` | nullable=true; maxLength=80 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceSrid` | false | `integer/int32` | minimum=0 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `datum` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `projection` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `axisOrder` | false | `string` | nullable=true; enum=["EN","NE"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `metresPerUnit` | false | `number/double` | minimum=0; exclusiveMinimum=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceReference` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceChecksum` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operation` | false | [CrsTransformOperation](03_DTO-and-Schema-Reference.md#schema-crstransformoperation) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `independentControls` | false | array<[CrsControlPoint](03_DTO-and-Schema-Reference.md#schema-crscontrolpoint)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourcedToleranceMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `toleranceSource` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sampleOnly` | false | `boolean` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `ellipsoid` | false | [CrsEllipsoidDefinition](03_DTO-and-Schema-Reference.md#schema-crsellipsoiddefinition) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `projectionDefinition` | false | [CrsProjectionDefinition](03_DTO-and-Schema-Reference.md#schema-crsprojectiondefinition) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CrsProfileView

Source: [CrsProfileView](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L53). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `code` required=false nullable=true: `string`; `revision` required=false nullable=absent: `integer/int32`; `status` required=false nullable=true: `string`; `definition` required=false nullable=absent: [CrsProfileInput](03_DTO-and-Schema-Reference.md#schema-crsprofileinput); `createdBy` required=false nullable=absent: `string/uuid`; `createdAt` required=false nullable=absent: `string/date-time`.

## Schema CrsProjectionDefinition

Source: [CrsProjectionDefinition](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(IReadOnlyDictionary<string, double> Parameters, string SourceReference)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `parameters` | false | map<`number/double`> | nullable=true; additionalProperties={"type":"number","format":"double"} | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceReference` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema CrsTransformOperation

Source: [CrsTransformOperation](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L30). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string Method, string Convention, string Direction, double[] Parameters,     string SourceReference, string? AreaOfUse = null, double? PublishedAccuracyMeters = null, string? AccuracySource = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `method` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `convention` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `direction` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `parameters` | false | array<`number/double`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceReference` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `areaOfUse` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `publishedAccuracyMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `accuracySource` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema DatasetCoverageItemDto

Source: [DatasetCoverageItemDto](../../../RoadGuardSystem.DTOs/Surveys/DatasetCoverageItemDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `scope` required=false nullable=absent: [BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto); `positionCoverage` required=false nullable=true: `string`; `qualityCoverage` required=false nullable=true: `string`; `overallCoverage` required=false nullable=true: `string`; `reasons` required=false nullable=true: array<`string`>; `coverageStatus` required=false nullable=true: `string`.

## Schema DatasetCoverageResponseDto

Source: [DatasetCoverageResponseDto](../../../RoadGuardSystem.DTOs/Surveys/DatasetCoverageResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `datasetId` required=false nullable=absent: `string/uuid`; `items` required=false nullable=true: array<[DatasetCoverageItemDto](03_DTO-and-Schema-Reference.md#schema-datasetcoverageitemdto)>; `methodVersion` required=false nullable=true: `string`; `assessmentId` required=false nullable=true: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema DatasetDetailView

Source: [DatasetDetailView](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `surveyTaskId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `dataVersionId` required=false nullable=absent: `string/uuid`; `submittedBy` required=false nullable=true: `string/uuid`; `submittedAt` required=false nullable=true: `string/date-time`; `recordedAt` required=false nullable=true: `string/date-time`; `deviceId` required=false nullable=true: `string/uuid`; `scope` required=false nullable=true: array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)>; `integrityStatus` required=false nullable=true: `string`; `telemetryStatus` required=false nullable=true: `string`; `sourceFiles` required=false nullable=true: array<[DatasetSourceFileDto](03_DTO-and-Schema-Reference.md#schema-datasetsourcefiledto)>; `pairs` required=false nullable=true: array<[DatasetPairDto](03_DTO-and-Schema-Reference.md#schema-datasetpairdto)>; `version` required=false nullable=true: `string`.

## Schema DatasetPairDto

Source: [DatasetPairDto](../../../RoadGuardSystem.DTOs/Surveys/SubmitDatasetRequestDto.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid VideoFileId, Guid? TelemetryFileId, long TimeOffsetMilliseconds)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `videoFileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `telemetryFileId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `timeOffsetMilliseconds` | false | `integer/int64` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema DatasetResponseDto

Source: [DatasetResponseDto](../../../RoadGuardSystem.DTOs/Surveys/DatasetResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `surveyTaskId` required=false nullable=absent: `string/uuid`; `dataVersionId` required=false nullable=absent: `string/uuid`; `integrityStatus` required=false nullable=true: `string`; `telemetryStatus` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema DatasetSourceFileDto

Source: [DatasetSourceFileDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L15). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `fileId` required=false nullable=absent: `string/uuid`; `checksumSha256` required=false nullable=true: `string`; `sizeBytes` required=false nullable=absent: `integer/int64`; `mediaType` required=false nullable=true: `string`; `purpose` required=false nullable=true: `string`.

## Schema DefectAssessmentRequestDto

Source: [DefectAssessmentRequestDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? DefectTypeCode, string? CauseCategoryCode,     string? Severity, string? Reason, Guid[]? EvidenceIds)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `defectTypeCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `causeCategoryCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `severity` | false | `string` | nullable=true; enum=["LOW","MEDIUM","HIGH","CRITICAL"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema DefectGeometryDto

Source: [DefectGeometryDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `srid` required=false nullable=absent: `integer/int32`; `wkt` required=false nullable=true: `string`.

## Schema DefectPageDto

Source: [DefectPageDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L33). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[DefectViewDto](03_DTO-and-Schema-Reference.md#schema-defectviewdto)>; `nextCursor` required=false nullable=true: `string`.

## Schema DefectStatisticsInputDto

Source: [DefectStatisticsInputDto](../../../RoadGuardSystem.DTOs/Reporting/DefectStatisticsInputDto.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ObligationId, string ScopeHash, string DefectVersion, Guid SharedPartId,     Guid[] SegmentIds, StatisticsQuantityInputDto[] Quantities, string Provenance, string Reason, Guid? SupersedesId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `obligationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scopeHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sharedPartId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `quantities` | false | array<[StatisticsQuantityInputDto](03_DTO-and-Schema-Reference.md#schema-statisticsquantityinputdto)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `provenance` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `supersedesId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema DefectStatisticsRead

Source: [DefectStatisticsRead](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L26). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `scopes` required=false nullable=true: array<[StatisticsScope](03_DTO-and-Schema-Reference.md#schema-statisticsscope)>; `segments` required=false nullable=true: array<[StatisticsSegment](03_DTO-and-Schema-Reference.md#schema-statisticssegment)>; `measurements` required=false nullable=true: array<[StatisticsMeasurement](03_DTO-and-Schema-Reference.md#schema-statisticsmeasurement)>; `history` required=false nullable=true: array<[DefectStatisticsSource](03_DTO-and-Schema-Reference.md#schema-defectstatisticssource)>; `statistics` required=false nullable=absent: [DefectStatisticsSnapshot](03_DTO-and-Schema-Reference.md#schema-defectstatisticssnapshot); `version` required=false nullable=true: `string`.

## Schema DefectStatisticsSnapshot

Source: [DefectStatisticsSnapshot](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L23). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `defects` required=false nullable=true: array<[StatisticsDefect](03_DTO-and-Schema-Reference.md#schema-statisticsdefect)>; `projectDistinctDefects` required=false nullable=absent: `integer/int64`; `matchedDistinctDefects` required=false nullable=absent: `integer/int64`; `sharedParts` required=false nullable=absent: `integer/int64`; `unmappedDefects` required=false nullable=absent: `integer/int64`; `segments` required=false nullable=true: array<[StatisticsSegmentCount](03_DTO-and-Schema-Reference.md#schema-statisticssegmentcount)>; `quantities` required=false nullable=true: array<[StatisticsQuantity](03_DTO-and-Schema-Reference.md#schema-statisticsquantity)>; `missingReasons` required=false nullable=true: array<`string`>; `sources` required=false nullable=true: array<[DefectStatisticsSource](03_DTO-and-Schema-Reference.md#schema-defectstatisticssource)>; `version` required=false nullable=true: `string`.

## Schema DefectStatisticsSource

Source: [DefectStatisticsSource](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `defectVersion` required=false nullable=true: `string`; `obligationId` required=false nullable=absent: `string/uuid`; `scopeHash` required=false nullable=true: `string`; `roadSectionId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `locationVersion` required=false nullable=true: `string`; `from` required=false nullable=absent: `number/double`; `to` required=false nullable=absent: `number/double`; `offsetFrom` required=false nullable=absent: `number/double`; `offsetTo` required=false nullable=absent: `number/double`; `sharedPartId` required=false nullable=absent: `string/uuid`; `segmentIdsJson` required=false nullable=true: `string`; `quantitiesJson` required=false nullable=true: `string`; `sourceFactsJson` required=false nullable=true: `string`; `provenance` required=false nullable=true: `string`; `actorId` required=false nullable=absent: `string/uuid`; `confirmedAtUtc` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`; `supersedesId` required=false nullable=true: `string/uuid`.

## Schema DefectVerificationRequestDto

Source: [DefectVerificationRequestDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? Decision, string? VerificationMethod,     Guid[]? EvidenceIds, string? Reason, Guid? FieldTaskId = null, Guid? FieldSubmissionId = null, string? FieldContentHash = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `decision` | false | `string` | nullable=true; enum=["CONFIRM","REJECT"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `verificationMethod` | false | `string` | nullable=true; enum=["EXISTING_EVIDENCE","FIELD","DRONE"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldTaskId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldSubmissionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldContentHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema DefectViewDto

Source: [DefectViewDto](../../../RoadGuardSystem.DTOs/Defects/DefectWorkflowDtos.cs#L22). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `roadSectionVersionId` required=false nullable=true: `string/uuid`; `segmentId` required=false nullable=true: `string/uuid`; `defectTypeCode` required=false nullable=true: `string`; `causeCategoryCode` required=false nullable=true: `string`; `severity` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `geometry` required=false nullable=absent: [DefectGeometryDto](03_DTO-and-Schema-Reference.md#schema-defectgeometrydto); `version` required=false nullable=true: `string`.

## Schema ExportFileDto

Source: [ExportFileDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L26). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `fileId` required=false nullable=absent: `string/uuid`; `fileVersion` required=false nullable=true: `string`; `sha256` required=false nullable=true: `string`; `sizeBytes` required=false nullable=absent: `integer/int64`; `mediaType` required=false nullable=true: `string`; `archivePath` required=false nullable=true: `string`; `included` required=false nullable=absent: `boolean`; `reasonCode` required=false nullable=true: `string`.

## Schema ExportJobViewDto

Source: [ExportJobViewDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `format` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `snapshotId` required=false nullable=absent: `string/uuid`; `snapshotHash` required=false nullable=true: `string`; `artifactId` required=false nullable=true: `string/uuid`; `createdAt` required=false nullable=absent: `string/date-time`; `completedAt` required=false nullable=true: `string/date-time`; `expiresAt` required=false nullable=true: `string/date-time`; `errorCode` required=false nullable=true: `string`; `completeness` required=false nullable=true: `string`; `missingSections` required=false nullable=true: array<`string`>; `version` required=false nullable=true: `string`.

## Schema ExportLabelDto

Source: [ExportLabelDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L44). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `labelId` required=false nullable=absent: `string/uuid`; `revision` required=false nullable=absent: `integer/int32`; `revisionId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `typeCode` required=false nullable=true: `string`; `x` required=false nullable=absent: `number/double`; `y` required=false nullable=absent: `number/double`; `width` required=false nullable=absent: `number/double`; `height` required=false nullable=absent: `number/double`; `fileId` required=false nullable=absent: `string/uuid`; `fileVersion` required=false nullable=true: `string`; `sha256` required=false nullable=true: `string`; `sizeBytes` required=false nullable=absent: `integer/int64`; `mediaType` required=false nullable=true: `string`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `sourceVersion` required=false nullable=true: `string`; `approvalId` required=false nullable=absent: `string/uuid`; `approvedBy` required=false nullable=absent: `string/uuid`; `approvedAt` required=false nullable=absent: `string/date-time`; `processingJobId` required=false nullable=true: `string/uuid`; `modelVersionId` required=false nullable=true: `string/uuid`; `datasetVersionId` required=false nullable=true: `string/uuid`; `mode` required=false nullable=true: `string`; `segmentId` required=false nullable=true: `string/uuid`.

## Schema ExportManifestV1Dto

Source: [ExportManifestV1Dto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L53). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `snapshotId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `format` required=false nullable=true: `string`; `requestedBy` required=false nullable=absent: `string/uuid`; `createdAt` required=false nullable=absent: `string/date-time`; `snapshotAt` required=false nullable=absent: `string/date-time`; `definitionVersions` required=false nullable=true: array<`string`>; `filters` required=false nullable=absent: [CreateExportRequestDto](03_DTO-and-Schema-Reference.md#schema-createexportrequestdto); `sourceRevisions` required=false nullable=true: array<[ExportSourceRevisionDto](03_DTO-and-Schema-Reference.md#schema-exportsourcerevisiondto)>; `files` required=false nullable=true: array<[ExportFileDto](03_DTO-and-Schema-Reference.md#schema-exportfiledto)>; `sections` required=false nullable=true: array<[ExportSectionDto](03_DTO-and-Schema-Reference.md#schema-exportsectiondto)>; `labels` required=false nullable=true: array<[ExportLabelDto](03_DTO-and-Schema-Reference.md#schema-exportlabeldto)>; `snapshotHash` required=false nullable=true: `string`.

## Schema ExportSectionDto

Source: [ExportSectionDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L35). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `name` required=false nullable=true: `string`; `availability` required=false nullable=true: `string`; `reasonCodes` required=false nullable=true: array<`string`>.

## Schema ExportSourceRevisionDto

Source: [ExportSourceRevisionDto](../../../RoadGuardSystem.DTOs/Exports/ExportDtos.cs#L17). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `kind` required=false nullable=true: `string`; `id` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema FieldEvidenceDeclaration

Source: [FieldEvidenceDeclaration](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L71). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid CaptureOriginId, Guid? FileId, string Purpose,     string ChecksumSha256, string MediaType, DateTimeOffset? CapturedAt, string? AttemptChecklist)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `captureOriginId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `purpose` | false | `string` | nullable=true; enum=["BEFORE","AFTER","MEASUREMENT"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checksumSha256` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mediaType` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `capturedAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `attemptChecklist` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldEvidenceDeclarationFact

Source: [FieldEvidenceDeclarationFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `captureOriginId` required=false nullable=absent: `string/uuid`; `fileId` required=false nullable=true: `string/uuid`; `purpose` required=false nullable=true: `string`; `checksumSha256` required=false nullable=true: `string`; `mediaType` required=false nullable=true: `string`; `capturedAt` required=false nullable=true: `string/date-time`; `attemptChecklist` required=false nullable=true: `string`.

## Schema FieldEvidenceReuseInput

Source: [FieldEvidenceReuseInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L114). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FileId, Guid SourceEvidenceId, string SourceKind, string ExpectedChecksum, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceEvidenceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceKind` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedChecksum` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldHandoverInput

Source: [FieldHandoverInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L28). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string PerformedPortionState, string Summary, Guid StartOriginId, Guid[] SubmissionIds, Guid? RecipientUserId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `performedPortionState` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `summary` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `startOriginId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `submissionIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipientUserId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldLocationImpactActionInput

Source: [FieldLocationImpactActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L38). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ImpactId, string Action, string Reason, Guid? AssignedToUserId = null, FieldHandoverInput? Handover = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `impactId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `action` | false | `string` | nullable=true; enum=["STOP","REASSIGN","CONTINUE","VERIFY"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assignedToUserId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handover` | false | [FieldHandoverInput](03_DTO-and-Schema-Reference.md#schema-fieldhandoverinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldMeasurementInput

Source: [FieldMeasurementInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L59). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string SampleId, string Type, decimal? Value, string State,     string? UnknownReason, string Dimension, string Unit, double? Longitude, double? Latitude,     string? LocationReason, string Instrument, string Method, string? Notes = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sampleId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `type` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `value` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `state` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `unknownReason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dimension` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `unit` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `longitude` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `latitude` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `locationReason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `instrument` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `method` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `notes` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldMeasurementInputFact

Source: [FieldMeasurementInputFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `sampleId` required=false nullable=true: `string`; `type` required=false nullable=true: `string`; `value` required=false nullable=true: `number/double`; `state` required=false nullable=true: `string`; `unknownReason` required=false nullable=true: `string`; `dimension` required=false nullable=true: `string`; `unit` required=false nullable=true: `string`; `longitude` required=false nullable=true: `number/double`; `latitude` required=false nullable=true: `number/double`; `locationReason` required=false nullable=true: `string`; `instrument` required=false nullable=true: `string`; `method` required=false nullable=true: `string`; `notes` required=false nullable=true: `string`.

## Schema FieldPositionProofInput

Source: [FieldPositionProofInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L82). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Kind, string? Checklist, double? Longitude, double? Latitude, string? ObservedSlabId = null, Guid? ObservedSegmentId = null, Guid? ObservedRouteVersionId = null, double? ObservedChainageMeters = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `kind` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checklist` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `longitude` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `latitude` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `observedSlabId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `observedSegmentId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `observedRouteVersionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `observedChainageMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldReviewInput

Source: [FieldReviewInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L104). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid SubmissionId, string Decision, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `submissionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `decision` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldReviewViewFact

Source: [FieldReviewViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L22). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `submissionId` required=false nullable=absent: `string/uuid`; `decision` required=false nullable=true: `string`; `receiptActivation` required=false nullable=true: `string`.

## Schema FieldStartInput

Source: [FieldStartInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L48). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, DateTimeOffset ClaimedAt, Guid? DeviceId = null,     long? MonotonicMilliseconds = null, string? BootId = null, string? OfflineProof = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `claimedAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `monotonicMilliseconds` | false | `integer/int64` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `bootId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `offlineProof` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldSubmissionInput

Source: [FieldSubmissionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L92). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, Guid StartOriginId, Guid? ParentSubmissionId,     FieldMeasurementInput[]? Measurements, FieldEvidenceDeclaration[]? Evidence, FieldPositionProofInput? LocationProof,     string CaptureType, bool? Repaired, string? UnrepairedReason, Guid? DeviceId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `startOriginId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `parentSubmissionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `measurements` | false | array<[FieldMeasurementInput](03_DTO-and-Schema-Reference.md#schema-fieldmeasurementinput)> | nullable=true; maxItems=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidence` | false | array<[FieldEvidenceDeclaration](03_DTO-and-Schema-Reference.md#schema-fieldevidencedeclaration)> | nullable=true; maxItems=100 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `locationProof` | false | [FieldPositionProofInput](03_DTO-and-Schema-Reference.md#schema-fieldpositionproofinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `captureType` | false | `string` | nullable=true; enum=["MEASUREMENT","REPAIR_CLAIM"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `repaired` | false | `boolean` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `unrepairedReason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldSubmissionViewFact

Source: [FieldSubmissionViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L31). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `rootId` required=false nullable=absent: `string/uuid`; `parentId` required=false nullable=true: `string/uuid`; `revision` required=false nullable=absent: `integer/int32`; `serverReceivedAt` required=false nullable=absent: `string/date-time`; `originalReviewDueAt` required=false nullable=absent: `string/date-time`; `readiness` required=false nullable=true: `string`; `missingReasons` required=false nullable=true: array<`string`>; `contentHash` required=false nullable=true: `string`; `measurements` required=false nullable=true: array<[FieldMeasurementInputFact](03_DTO-and-Schema-Reference.md#schema-fieldmeasurementinputfact)>; `evidence` required=false nullable=true: array<[FieldEvidenceDeclarationFact](03_DTO-and-Schema-Reference.md#schema-fieldevidencedeclarationfact)>; `captureType` required=false nullable=true: `string`; `repaired` required=false nullable=true: `boolean`; `unrepairedReason` required=false nullable=true: `string`.

## Schema FieldTaskActionInput

Source: [FieldTaskActionInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L18). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason, Guid? AssignedToUserId = null, FieldHandoverInput? Handover = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assignedToUserId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handover` | false | [FieldHandoverInput](03_DTO-and-Schema-Reference.md#schema-fieldhandoverinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldTaskCreateInput

Source: [FieldTaskCreateInput](../../../RoadGuardSystem.DTOs/Inspections/FieldInspectionWorkflowDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid DefectId, string DefectVersion, Guid? SurveyId, string SourceKind,     Guid RouteVersionId, Guid? SegmentSetId, Guid? LayoutRevisionId, string? SlabId, string Purpose,     byte RequiredMeasurementType, string MeasurementScope, string? Instructions, Guid AssignedToUserId,     DateTimeOffset DueAt, Guid? MapPublicationId = null, Guid? CrsProfileRevisionId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `defectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `surveyId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceKind` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `routeVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `layoutRevisionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `slabId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `purpose` | false | `string` | nullable=true; enum=["PRE_MEASUREMENT","POST_REPAIR","VERIFICATION"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `requiredMeasurementType` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `measurementScope` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `instructions` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assignedToUserId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dueAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mapPublicationId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `crsProfileRevisionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema FieldTaskEvidenceFile

Source: [FieldTaskEvidenceFile](../../../RoadGuardSystem.Repositories/Interfaces/Inspections/IFieldInspectionWorkflowRepository.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `fileId` required=false nullable=absent: `string/uuid`; `state` required=false nullable=true: `string`; `checksum` required=false nullable=true: `string`; `mediaType` required=false nullable=true: `string`; `sizeBytes` required=false nullable=absent: `integer/int64`.

## Schema FieldTaskViewFact

C04 additive runtime amendment: nullable `repairContext` is documented in the [assigned Crew NORMAL contract](../06_Mobile-Expo/Crew/C04_Crew-Repair-Bootstrap.md). The historical schema below predates this projection; use current runtime OpenAPI for the amended schema. Task version and nested itemVersion are distinct.


Source: [FieldTaskViewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/InspectionsFacts.cs#L43). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `surveyId` required=false nullable=true: `string/uuid`; `sourceKind` required=false nullable=true: `string`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=true: `string/uuid`; `layoutRevisionId` required=false nullable=true: `string/uuid`; `slabId` required=false nullable=true: `string`; `purpose` required=false nullable=true: `string`; `mode` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `assignmentId` required=false nullable=true: `string/uuid`; `assignedToUserId` required=false nullable=true: `string/uuid`; `version` required=false nullable=true: `string`; `firstStartOriginId` required=false nullable=true: `string/uuid`; `latestSubmissionId` required=false nullable=true: `string/uuid`; `mapPublicationId` required=false nullable=true: `string/uuid`; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `requiredMeasurementType` required=false nullable=absent: `integer/int32`; `measurementScope` required=false nullable=true: `string`; `instructions` required=false nullable=true: `string`; `dueAt` required=false nullable=true: `string/date-time`.

## Schema FileMetadataResponseDto

Source: [FileMetadataResponseDto](../../../RoadGuardSystem.DTOs/Files/FileMetadataResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `checksumSha256` required=false nullable=true: `string`; `mediaType` required=false nullable=true: `string`; `sizeBytes` required=false nullable=absent: `integer/int64`; `version` required=false nullable=true: `string`.

## Schema ForcedPasswordChangeRequestDto

Source: [ForcedPasswordChangeRequestDto](../../../RoadGuardSystem.DTOs/Authentication/ForcedPasswordChangeRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["confirmPassword", "currentPassword", "newPassword", "username"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `username` | true | `string` | minLength=1; maxLength=100 | `string?`; `[Required] [StringLength(100, MinimumLength = 1)]` |
| `currentPassword` | true | `string` | minLength=1; maxLength=1024 | `string?`; `[Required] [StringLength(1024, MinimumLength = 1)]` |
| `newPassword` | true | `string` | minLength=1; maxLength=1024 | `string?`; `[Required] [StringLength(1024, MinimumLength = 1)]` |
| `confirmPassword` | true | `string` | minLength=1 | `string?`; `[Required] [Compare(nameof(NewPassword))]` |
| `operationId` | false | `string/uuid` | — | `Guid`; `no property attributes indexed` |

## Schema GeometryAffectedReferenceFact

Source: [GeometryAffectedReferenceFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L34). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `kind` required=false nullable=true: `string`; `id` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=true: `string/uuid`; `readiness` required=false nullable=true: `string`; `missingReasonCodes` required=false nullable=true: array<`string`>.

## Schema GeometryConfirmInput

Source: [GeometryConfirmInput](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L87). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid? ExpectedCurrentVersionId, DateTimeOffset EffectiveFrom, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `expectedCurrentVersionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `effectiveFrom` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema GeometryDraftInput

Source: [GeometryDraftInput](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string SourceKind, int SourceCrs, double StationOriginMeters,     string ChangeReason, GeometryPoint[]? Coordinates, Guid? SourceFileId, int? TrackIndex,     int? TrackSegmentIndex, WidthProfileItem[] WidthProfile, double SurveyWidthMeters,     string? BranchCode = null, string? RoadCode = null, string? RoadName = null,     NativeAlignmentInput? NativeAlignment = null, Guid? RouteSystemId = null, string? RouteKind = null,     Guid? ParentRouteVersionId = null, double? JunctionOffsetMeters = null, double? DeclaredLengthMeters = null,     ChainageCalibrationInput? ChainageCalibration = null, double? TessellationToleranceMeters = null,     CrsProfileInput? ResolvedCrsProfile = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sourceKind` | false | `string` | nullable=true; enum=["COORDINATES","NATIVE_ALIGNMENT"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceCrs` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `stationOriginMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `changeReason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `coordinates` | false | array<[GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceFileId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `trackIndex` | false | `integer/int32` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `trackSegmentIndex` | false | `integer/int32` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `widthProfile` | false | array<[WidthProfileItem](03_DTO-and-Schema-Reference.md#schema-widthprofileitem)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `surveyWidthMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `branchCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `roadCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `roadName` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `nativeAlignment` | false | [NativeAlignmentInput](03_DTO-and-Schema-Reference.md#schema-nativealignmentinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `routeSystemId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `routeKind` | false | `string` | nullable=true; enum=["MAIN","BRANCH"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `parentRouteVersionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `junctionOffsetMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `declaredLengthMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `chainageCalibration` | false | [ChainageCalibrationInput](03_DTO-and-Schema-Reference.md#schema-chainagecalibrationinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `tessellationToleranceMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `resolvedCrsProfile` | false | [CrsProfileInput](03_DTO-and-Schema-Reference.md#schema-crsprofileinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema GeometryDraftReadiness

Source: [GeometryDraftReadiness](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L100). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `ready` required=false nullable=absent: `boolean`; `missingFields` required=false nullable=true: array<`string`>; `errors` required=false nullable=true: array<`string`>; `crsStatus` required=false nullable=true: `string`; `sampleOnly` required=false nullable=absent: `boolean`; `warnings` required=false nullable=true: array<`string`>.

## Schema GeometryDraftView

Source: [GeometryDraftView](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L37). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=true: `string/uuid`; `roadCode` required=false nullable=true: `string`; `roadName` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `sourceKind` required=false nullable=true: `string`; `sourceCrs` required=false nullable=absent: `integer/int32`; `sourceFileId` required=false nullable=true: `string/uuid`; `sourceChecksum` required=false nullable=true: `string`; `trackIndex` required=false nullable=true: `integer/int32`; `trackSegmentIndex` required=false nullable=true: `integer/int32`; `originalCoordinates` required=false nullable=true: array<[GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint)>; `editedCoordinates` required=false nullable=true: array<[GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint)>; `stationOriginMeters` required=false nullable=absent: `number/double`; `widthProfile` required=false nullable=true: array<[WidthProfileItem](03_DTO-and-Schema-Reference.md#schema-widthprofileitem)>; `surveyWidthMeters` required=false nullable=absent: `number/double`; `createdBy` required=false nullable=absent: `string/uuid`; `updatedBy` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`; `nativeAlignment` required=false nullable=absent: [NativeAlignmentInput](03_DTO-and-Schema-Reference.md#schema-nativealignmentinput); `readiness` required=false nullable=absent: [GeometryDraftReadiness](03_DTO-and-Schema-Reference.md#schema-geometrydraftreadiness).

## Schema GeometryImpactDecisionInput

Source: [GeometryImpactDecisionInput](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L72). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid TaskId, string Action, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `taskId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `action` | false | `string` | nullable=true; enum=["VERIFY","CONTINUE","STOP","REASSIGN"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema GeometryImpactDecisionView

Source: [GeometryImpactDecisionView](../../../RoadGuardSystem.Repositories/Interfaces/Projects/IPavementWorkflowRepository.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `impactId` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `action` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`; `occurredAt` required=false nullable=absent: `string/date-time`; `executionStatus` required=false nullable=true: `string`.

## Schema GeometryImpactInput

Source: [GeometryImpactInput](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L63). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid PreviousRouteVersionId, Guid NewRouteVersionId, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `previousRouteVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `newRouteVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema GeometryImpactView

Source: [GeometryImpactView](../../../RoadGuardSystem.Repositories/Interfaces/Projects/IPavementWorkflowRepository.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `previousRouteVersionId` required=false nullable=absent: `string/uuid`; `newRouteVersionId` required=false nullable=absent: `string/uuid`; `references` required=false nullable=true: array<[GeometryAffectedReferenceFact](03_DTO-and-Schema-Reference.md#schema-geometryaffectedreferencefact)>; `recordedAt` required=false nullable=absent: `string/date-time`.

## Schema GeometryMapFeature

Source: [GeometryMapFeature](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L26). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=true: `string`; `layer` required=false nullable=true: `string`; `geometry` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `bbox` required=false nullable=true: array<`number/double`>; `properties` required=false nullable=true: `unspecified`.

## Schema GeometryMapLayer

Source: [GeometryMapLayer](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `key` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `featureKind` required=false nullable=true: `string`; `count` required=false nullable=absent: `integer/int32`; `reasonCodes` required=false nullable=true: array<`string`>; `spatialSrid` required=false nullable=true: `integer/int32`; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `sampleOnly` required=false nullable=absent: `boolean`.

## Schema GeometryMapManifest

Source: [GeometryMapManifest](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `publicationId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `layoutRevisionId` required=false nullable=absent: `string/uuid`; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `nativeSrid` required=false nullable=absent: `integer/int32`; `profileStatus` required=false nullable=true: `string`; `sampleOnly` required=false nullable=absent: `boolean`; `displayToleranceMeters` required=false nullable=absent: `number/double`; `contentHash` required=false nullable=true: `string`; `layers` required=false nullable=true: array<[GeometryMapLayer](03_DTO-and-Schema-Reference.md#schema-geometrymaplayer)>; `routeSystemId` required=false nullable=true: `string/uuid`; `roadSectionId` required=false nullable=true: `string/uuid`; `canonicalLengthMeters` required=false nullable=true: `number/double`; `declaredLengthMeters` required=false nullable=true: `number/double`; `chainageStatus` required=false nullable=true: `string`.

## Schema GeometryMapPage

Source: [GeometryMapPage](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L44). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `publicationId` required=false nullable=absent: `string/uuid`; `contentHash` required=false nullable=true: `string`; `layer` required=false nullable=true: `string`; `features` required=false nullable=true: array<[GeometryMapFeature](03_DTO-and-Schema-Reference.md#schema-geometrymapfeature)>; `nextCursor` required=false nullable=true: `string`.

## Schema GeometryMapPublishInput

Source: [GeometryMapPublishInput](../../../RoadGuardSystem.DTOs/Projects/GeometryMapDtos.cs#L54). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid LayoutRevisionId, string PublicationMode, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `layoutRevisionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `publicationMode` | false | `string` | nullable=true; enum=["SAMPLE","OFFICIAL"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema GeometryPackageView

Source: [GeometryPackageView](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L158). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `projectId` required=false nullable=absent: `string/uuid`; `route` required=false nullable=absent: [RoadGeometryVersionView](03_DTO-and-Schema-Reference.md#schema-roadgeometryversionview); `segmentSet` required=false nullable=absent: [SegmentSetView](03_DTO-and-Schema-Reference.md#schema-segmentsetview).

## Schema GeometryPoint

Source: [GeometryPoint](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(double X, double Y)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `x` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `y` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema GeometryPointFact

Source: [GeometryPointFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L82). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `x` required=false nullable=absent: `number/double`; `y` required=false nullable=absent: `number/double`.

## Schema GeometryPreview

Source: [GeometryPreview](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L60). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `sourceCrs` required=false nullable=absent: `integer/int32`; `engineeringSrid` required=false nullable=absent: `integer/int32`; `lengthMeters` required=false nullable=absent: `number/double`; `metricCenterline` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `wgs84Centerline` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `roadSurface` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `surveyArea` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `warnings` required=false nullable=true: array<`string`>; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `sampleOnly` required=false nullable=absent: `boolean`.

## Schema GeometryShape

Source: [GeometryShape](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L51). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `type` required=false nullable=true: `string`; `coordinates` required=false nullable=true: `unspecified`.

## Schema H5EncryptedPackageDto

Source: [H5EncryptedPackageDto](../../../RoadGuardSystem.DTOs/Offline/H5EncryptedPackageDto.cs#L15). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(H5PackageHeaderDto Header, string PayloadNonce, string Ciphertext,     string PayloadTag, H5RecipientKeyWrapDto[] Recipients, string SenderSigningPublicKey, string Signature)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `header` | false | [H5PackageHeaderDto](03_DTO-and-Schema-Reference.md#schema-h5packageheaderdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `payloadNonce` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `ciphertext` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `payloadTag` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipients` | false | array<[H5RecipientKeyWrapDto](03_DTO-and-Schema-Reference.md#schema-h5recipientkeywrapdto)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `senderSigningPublicKey` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `signature` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema H5PackageHeaderDto

Source: [H5PackageHeaderDto](../../../RoadGuardSystem.DTOs/Offline/H5EncryptedPackageDto.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(int Version, string PayloadSchema, Guid PackageId, Guid ProjectId,     Guid OriginalActorId, string SourceDeviceId, Guid[] OriginIds, string PayloadSha256)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `version` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `payloadSchema` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `packageId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `projectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `originalActorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceDeviceId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `originIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `payloadSha256` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema H5RecipientKeyWrapDto

Source: [H5RecipientKeyWrapDto](../../../RoadGuardSystem.DTOs/Offline/H5EncryptedPackageDto.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ActorId, string DeviceId, string RecipientKeyFingerprint,     string EphemeralPublicKey, string Nonce, string WrappedKey, string Tag)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `actorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipientKeyFingerprint` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `ephemeralPublicKey` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `nonce` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `wrappedKey` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `tag` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema H6ClockBreachView

Source: [H6ClockBreachView](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L44). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `dueAt` required=false nullable=absent: `string/date-time`; `observedAt` required=false nullable=absent: `string/date-time`.

## Schema H6ClockCursor

Source: [H6ClockCursor](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L45). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `actorId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `role` required=false nullable=true: `string`; `afterDueAtUtc` required=false nullable=absent: `string/date-time`; `afterClockId` required=false nullable=absent: `string/uuid`.

## Schema H6ClockExtensionView

Source: [H6ClockExtensionView](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L42). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `actorId` required=false nullable=absent: `string/uuid`; `at` required=false nullable=absent: `string/date-time`; `previousDueAt` required=false nullable=absent: `string/date-time`; `newDueAt` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`; `previousDeadlineBreached` required=false nullable=absent: `boolean`.

## Schema H6ClockPage

Source: [H6ClockPage](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L47). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `status` required=false nullable=true: `string`; `items` required=false nullable=true: array<[H6ClockView](03_DTO-and-Schema-Reference.md#schema-h6clockview)>; `continuation` required=false nullable=absent: [H6ClockCursor](03_DTO-and-Schema-Reference.md#schema-h6clockcursor).

## Schema H6ClockView

Source: [H6ClockView](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L33). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `targetId` required=false nullable=absent: `string/uuid`; `originEventId` required=false nullable=absent: `string/uuid`; `originAt` required=false nullable=absent: `string/date-time`; `originalDueAt` required=false nullable=absent: `string/date-time`; `currentDueAt` required=false nullable=absent: `string/date-time`; `overdue` required=false nullable=absent: `boolean`; `completedAt` required=false nullable=true: `string/date-time`; `acknowledgedAt` required=false nullable=true: `string/date-time`; `version` required=false nullable=true: `string`; `extensions` required=false nullable=true: array<[H6ClockExtensionView](03_DTO-and-Schema-Reference.md#schema-h6clockextensionview)>; `breaches` required=false nullable=true: array<[H6ClockBreachView](03_DTO-and-Schema-Reference.md#schema-h6clockbreachview)>; `pendingCapabilities` required=false nullable=true: array<`string`>; `appointedActorId` required=false nullable=true: `string/uuid`; `appointedRole` required=false nullable=true: `string`; `appointments` required=false nullable=true: array<`unspecified`>.

## Schema H6NotificationScopeDto

Source: [H6NotificationScopeDto](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `notificationId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=true: `string/uuid`; `occurrenceId` required=false nullable=true: `string/uuid`; `classification` required=false nullable=true: `string`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `eventType` required=false nullable=true: `string`; `resolverVersion` required=false nullable=true: `string`.

## Schema InspectionTaskPageResponseDto

Source: [InspectionTaskPageResponseDto](../../../RoadGuardSystem.DTOs/Inspections/InspectionTaskPageResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[InspectionTaskResponseDto](03_DTO-and-Schema-Reference.md#schema-inspectiontaskresponsedto)>; `nextCursor` required=false nullable=true: `string`; `asOf` required=false nullable=absent: `string/date-time`.

## Schema InspectionTaskResponseDto

Source: [InspectionTaskResponseDto](../../../RoadGuardSystem.DTOs/Inspections/InspectionTaskResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectIds` required=false nullable=true: array<`string/uuid`>; `mode` required=false nullable=true: `string`; `crewId` required=false nullable=absent: `string/uuid`; `policyVersionId` required=false nullable=true: `string/uuid`; `status` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema InternalCaseDto

Source: [InternalCaseDto](../../../RoadGuardSystem.DTOs/Cases/CaseWorkflowDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=true: `string/uuid`; `status` required=false nullable=true: `string`; `version` required=false nullable=true: `string`; `reportIds` required=false nullable=true: array<`string/uuid`>; `defectIds` required=false nullable=true: array<`string/uuid`>; `verificationMethod` required=false nullable=true: `string`; `warrantyRouting` required=false nullable=true: `string`; `conclusion` required=false nullable=absent: [CaseConclusionViewDto](03_DTO-and-Schema-Reference.md#schema-caseconclusionviewdto); `createdAt` required=false nullable=absent: `string/date-time`.

## Schema InvitationResponseDto

Source: [InvitationResponseDto](../../../RoadGuardSystem.DTOs/Invitations/InvitationResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `expiresAt` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`.

## Schema LD06ActionDto

Source: [LD06ActionDto](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `actorId` required=false nullable=absent: `string/uuid`; `at` required=false nullable=absent: `string/date-time`; `sourceActionId` required=false nullable=true: `string/uuid`; `defectId` required=false nullable=true: `string/uuid`; `linkedDefectId` required=false nullable=true: `string/uuid`; `obligationId` required=false nullable=true: `string/uuid`; `receivingProjectId` required=false nullable=true: `string/uuid`; `priorRepairDecisionId` required=false nullable=true: `string/uuid`; `scopeHash` required=false nullable=true: `string`; `factsJson` required=false nullable=true: `string`.

## Schema LD06LifecycleInputDto

Source: [LD06LifecycleInputDto](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L20). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[System.Text.Json.Serialization.JsonUnmappedMemberHandling(System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason, Guid[] EvidenceFileIds, Guid? SourceActionId = null,     Guid? DefectId = null, Guid? LinkedDefectId = null, Guid? ObligationId = null, Guid? ReceivingProjectId = null,     Guid? PriorRepairDecisionId = null, string? ScopeHash = null,     RoadGuardSystem.DTOs.Defects.CandidateDecisionRequestDto? NewDefect = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceFileIds` | false | array<`string/uuid`> | nullable=true; maxItems=100 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceActionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `linkedDefectId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `obligationId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `receivingProjectId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `priorRepairDecisionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scopeHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `newDefect` | false | [CandidateDecisionRequestDto](03_DTO-and-Schema-Reference.md#schema-candidatedecisionrequestdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema LD06TransferableObligationDto

Source: [LD06TransferableObligationDto](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `mandatory` required=false nullable=absent: `boolean`; `scopeId` required=false nullable=absent: `string/uuid`; `physicalRoadId` required=false nullable=absent: `string/uuid`; `locationVersion` required=false nullable=true: `string`; `routeLabel` required=false nullable=true: `string`; `from` required=false nullable=absent: `number/double`; `to` required=false nullable=absent: `number/double`; `offsetFrom` required=false nullable=absent: `number/double`; `offsetTo` required=false nullable=absent: `number/double`; `scopeHash` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema LabelAnnotationDto

Source: [LabelAnnotationDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? Kind, string? CoordinateSpace, decimal X, decimal Y,     decimal Width, decimal Height)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `kind` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `coordinateSpace` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `x` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `y` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `width` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `height` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema LoginRequestDto

Source: [LoginRequestDto](../../../RoadGuardSystem.DTOs/Authentication/LoginRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["email", "password"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `email` | true | `string/email` | minLength=1; maxLength=100 | `string?`; `[Required] [StringLength(100, MinimumLength = 1)] [EmailAddress]` |
| `password` | true | `string` | minLength=1; maxLength=1024 | `string?`; `[Required] [StringLength(1024, MinimumLength = 1)]` |

## Schema NativeAlignmentInput

Source: [NativeAlignmentInput](../../../RoadGuardSystem.DTOs/Projects/NativeAlignmentDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid CrsProfileRevisionId, NativeAlignmentPrimitive[] Primitives, int SpatialSrid = 0)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `crsProfileRevisionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `primitives` | false | array<[NativeAlignmentPrimitive](03_DTO-and-Schema-Reference.md#schema-nativealignmentprimitive)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `spatialSrid` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema NativeAlignmentPrimitive

Source: [NativeAlignmentPrimitive](../../../RoadGuardSystem.DTOs/Projects/NativeAlignmentDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string Kind, GeometryPoint Start, GeometryPoint End,     GeometryPoint? Center = null, double? Radius = null, double? StartAngleRadians = null, double? SweepRadians = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `kind` | false | `string` | nullable=true; enum=["LINE","ARC"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `start` | false | [GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `end` | false | [GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `center` | false | [GeometryPoint](03_DTO-and-Schema-Reference.md#schema-geometrypoint) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `radius` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `startAngleRadians` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sweepRadians` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema NormalizedBoundingBoxV1

Source: [NormalizedBoundingBoxV1](../../../RoadGuardSystem.Services/Interfaces/Integration/Anh02Contracts.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `x` required=false nullable=absent: `number/double`; `y` required=false nullable=absent: `number/double`; `width` required=false nullable=absent: `number/double`; `height` required=false nullable=absent: `number/double`.

## Schema NotificationDto

Source: [NotificationDto](../../../RoadGuardSystem.DTOs/Messaging/NotificationDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `message` required=false nullable=true: `string`; `resourceId` required=false nullable=true: `string/uuid`; `read` required=false nullable=absent: `boolean`; `occurredAt` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`.

## Schema NotificationPageDto

Source: [NotificationPageDto](../../../RoadGuardSystem.DTOs/Messaging/NotificationPageDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[NotificationDto](03_DTO-and-Schema-Reference.md#schema-notificationdto)>; `nextCursor` required=false nullable=true: `string`; `asOf` required=false nullable=absent: `string/date-time`.

## Schema ObligationResponsibilityDto

Source: [ObligationResponsibilityDto](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `obligationId` required=false nullable=absent: `string/uuid`; `originProjectId` required=false nullable=absent: `string/uuid`; `currentProjectId` required=false nullable=absent: `string/uuid`; `acceptanceActionId` required=false nullable=absent: `string/uuid`.

## Schema OfflineBatchResult

Source: [OfflineBatchResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L58). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `batchId` required=false nullable=absent: `string/uuid`; `items` required=false nullable=true: array<[OfflineItemResult](03_DTO-and-Schema-Reference.md#schema-offlineitemresult)>; `localQueueInstruction` required=false nullable=true: `string`.

## Schema OfflineCaptureArtifactInput

Source: [OfflineCaptureArtifactInput](../../../RoadGuardSystem.DTOs/Offline/OfflineCaptureTransferDtos.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(OfflineCaptureManifest Manifest, string ManifestSignature,     int ChunkIndex, H5EncryptedPackageDto Envelope)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `manifest` | false | [OfflineCaptureManifest](03_DTO-and-Schema-Reference.md#schema-offlinecapturemanifest) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `manifestSignature` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `chunkIndex` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `envelope` | false | [H5EncryptedPackageDto](03_DTO-and-Schema-Reference.md#schema-h5encryptedpackagedto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineCaptureChunk

Source: [OfflineCaptureChunk](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineCaptureArtifacts.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid ArtifactId, int Index, long Offset, int Length,     string PlaintextChecksum, string EnvelopeFingerprint)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `artifactId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `index` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `offset` | false | `integer/int64` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `length` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `plaintextChecksum` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `envelopeFingerprint` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineCaptureManifest

Source: [OfflineCaptureManifest](../../../RoadGuardSystem.BusinessObjects/Offline/OfflineCaptureArtifacts.cs#L8). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(int Version, Guid ParentPackageId, string ParentManifestHash,     Guid ProjectId, Guid OriginalActorId, Guid SourceDeviceRegistrationId, Guid CaptureOriginId,     Guid TaskId, string Purpose, string MediaType, long FileSize, string FileChecksum,     OfflineCaptureChunk[] Chunks)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `version` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `parentPackageId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `parentManifestHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `projectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `originalActorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceDeviceRegistrationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `captureOriginId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `taskId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `purpose` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mediaType` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileSize` | false | `integer/int64` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileChecksum` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `chunks` | false | array<[OfflineCaptureChunk](03_DTO-and-Schema-Reference.md#schema-offlinecapturechunk)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineDeviceRegisterInput

Source: [OfflineDeviceRegisterInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid DeviceId, string EncryptionPublicKey, string SigningPublicKey)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `deviceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `encryptionPublicKey` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `signingPublicKey` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineDeviceRevokeInput

Source: [OfflineDeviceRevokeInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineGrantItemScope

Source: [OfflineGrantItemScope](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, string Kind, string CorePayloadHash, string EnvelopeHash,     Guid TaskId, Guid AssignmentId, Guid SnapshotId, Guid? RepairResourceId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `kind` | false | `string` | nullable=true; enum=["FIELD_ACCEPT","FIELD_START","FIELD_SUBMISSION","REPAIR_ASSESSMENT","REPAIR_EXECUTION_START","REPAIR_EXECUTION_FINISH"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `corePayloadHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `envelopeHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `taskId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assignmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `snapshotId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `repairResourceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineGrantRevokeInput

Source: [OfflineGrantRevokeInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L19). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineHandoverGrantInput

Source: [OfflineHandoverGrantInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid PackageId, Guid RecipientDeviceRegistrationId,     OfflineGrantItemScope[] Items, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `packageId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipientDeviceRegistrationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `items` | false | array<[OfflineGrantItemScope](03_DTO-and-Schema-Reference.md#schema-offlinegrantitemscope)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineItemResult

Source: [OfflineItemResult](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L54). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `originId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `state` required=false nullable=true: `string`; `code` required=false nullable=true: `string`; `effectId` required=false nullable=true: `string/uuid`; `canonicalOriginId` required=false nullable=true: `string/uuid`; `durableAcknowledgment` required=false nullable=absent: `boolean`; `serverReceivedAt` required=false nullable=absent: `string/date-time`; `timeProvenance` required=false nullable=true: `string`; `syncLateness` required=false nullable=true: `string`; `claimedFinishedAt` required=false nullable=true: `string/date-time`; `verifiedFinishedAt` required=false nullable=true: `string/date-time`; `verifiedSyncDueAt` required=false nullable=true: `string/date-time`; `outcome` required=false nullable=true: `unspecified`.

## Schema OfflineOperationDescriptor

Source: [OfflineOperationDescriptor](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, Guid EffectId, string Kind, string EnvelopeHash,     string CorePayloadHash, Guid TaskId, Guid AssignmentId, Guid SnapshotId, Guid? RepairResourceId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `effectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `kind` | false | `string` | nullable=true; enum=["FIELD_ACCEPT","FIELD_START","FIELD_SUBMISSION","REPAIR_ASSESSMENT","REPAIR_EXECUTION_START","REPAIR_EXECUTION_FINISH"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `envelopeHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `corePayloadHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `taskId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assignmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `snapshotId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `repairResourceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineOperationInput

Source: [OfflineOperationInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L36). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(int SchemaVersion, Guid OriginId, Guid EffectId, string Kind,     Guid OriginalActorId, Guid SourceDeviceId, Guid SnapshotId, Guid TaskId, Guid AssignmentId,     string TaskVersion, string CorePayloadHash, Guid[] Dependencies, DateTimeOffset? ClaimedFinishedAt,     FieldStartInput? FieldStart = null, FieldSubmissionInput? FieldSubmission = null,     OfflineRepairPayload? Repair = null, FieldTaskActionInput? FieldAction = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `schemaVersion` | false | `integer/int32` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `effectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `kind` | false | `string` | nullable=true; enum=["FIELD_ACCEPT","FIELD_START","FIELD_SUBMISSION","REPAIR_ASSESSMENT","REPAIR_EXECUTION_START","REPAIR_EXECUTION_FINISH"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `originalActorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceDeviceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `snapshotId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `taskId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assignmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `taskVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `corePayloadHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dependencies` | false | array<`string/uuid`> | nullable=true; maxItems=1000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `claimedFinishedAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldStart` | false | [FieldStartInput](03_DTO-and-Schema-Reference.md#schema-fieldstartinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldSubmission` | false | [FieldSubmissionInput](03_DTO-and-Schema-Reference.md#schema-fieldsubmissioninput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `repair` | false | [OfflineRepairPayload](03_DTO-and-Schema-Reference.md#schema-offlinerepairpayload) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldAction` | false | [FieldTaskActionInput](03_DTO-and-Schema-Reference.md#schema-fieldtaskactioninput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflinePackageExportInput

Source: [OfflinePackageExportInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L27). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(H5EncryptedPackageDto Package, OfflineSourceManifestInput Manifest,     Guid? SourceFileId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `package` | false | [H5EncryptedPackageDto](03_DTO-and-Schema-Reference.md#schema-h5encryptedpackagedto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `manifest` | false | [OfflineSourceManifestInput](03_DTO-and-Schema-Reference.md#schema-offlinesourcemanifestinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceFileId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflinePackageImportInput

Source: [OfflinePackageImportInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L45). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid BatchId, Guid PackageId, Guid GrantId,     Guid RecipientDeviceRegistrationId, OfflineOperationInput[] Operations, string SourceSignature,     string RecipientSignature)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `batchId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `packageId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `grantId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipientDeviceRegistrationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operations` | false | array<[OfflineOperationInput](03_DTO-and-Schema-Reference.md#schema-offlineoperationinput)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceSignature` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipientSignature` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineRepairPayload

Source: [OfflineRepairPayload](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L32). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ResourceId, string Action,     RepairExecutionStartInput? Start = null, RepairExecutionFinishInput? Finish = null,     RepairMeasurementAssessmentInput? Assessment = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `resourceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `action` | false | `string` | nullable=true; enum=["assessment","execution-start","execution-finish"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `start` | false | [RepairExecutionStartInput](03_DTO-and-Schema-Reference.md#schema-repairexecutionstartinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `finish` | false | [RepairExecutionFinishInput](03_DTO-and-Schema-Reference.md#schema-repairexecutionfinishinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assessment` | false | [RepairMeasurementAssessmentInput](03_DTO-and-Schema-Reference.md#schema-repairmeasurementassessmentinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineSignedBatchInput

Source: [OfflineSignedBatchInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L42). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid BatchId, Guid SourceDeviceRegistrationId,     OfflineOperationInput[] Operations, string Signature)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `batchId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceDeviceRegistrationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operations` | false | array<[OfflineOperationInput](03_DTO-and-Schema-Reference.md#schema-offlineoperationinput)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `signature` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineSnapshotInput

Source: [OfflineSnapshotInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid DeviceRegistrationId, Guid TaskId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `deviceRegistrationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `taskId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineSourceManifestInput

Source: [OfflineSourceManifestInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L24). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid SourceBatchId, Guid SourceDeviceRegistrationId,     OfflineOperationDescriptor[] Items, string Signature)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `sourceBatchId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceDeviceRegistrationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `items` | false | array<[OfflineOperationDescriptor](03_DTO-and-Schema-Reference.md#schema-offlineoperationdescriptor)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `signature` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineStartReconcileInput

Source: [OfflineStartReconcileInput](../../../RoadGuardSystem.DTOs/Offline/OfflineWorkflowDtos.cs#L49). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid BatchId, Guid OriginId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `batchId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OfflineUploadCreateRequestDto

Source: [OfflineUploadCreateRequestDto](../../../RoadGuardSystem.DTOs/Files/OfflineUploadCreateRequestDto.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid AdmissionId, Guid CaptureOriginId, UploadCreateRequestDto Upload)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `admissionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `captureOriginId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `upload` | false | [UploadCreateRequestDto](03_DTO-and-Schema-Reference.md#schema-uploadcreaterequestdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema OwnReportDto

Source: [OwnReportDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L31). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `description` required=false nullable=true: `string`; `createdAt` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`; `evidence` required=false nullable=true: array<[OwnReportEvidenceDto](03_DTO-and-Schema-Reference.md#schema-ownreportevidencedto)>; `routingStatus` required=false nullable=true: `string`; `publicUpdates` required=false nullable=true: array<[OwnReportUpdateDto](03_DTO-and-Schema-Reference.md#schema-ownreportupdatedto)>; `supplements` required=false nullable=true: array<[OwnReportSupplementDto](03_DTO-and-Schema-Reference.md#schema-ownreportsupplementdto)>.

## Schema OwnReportEvidenceDto

Source: [OwnReportEvidenceDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `fileId` required=false nullable=absent: `string/uuid`; `fileVersion` required=false nullable=true: `string`; `supplementId` required=false nullable=true: `string/uuid`; `capturedAt` required=false nullable=true: `string/date-time`; `locationSource` required=false nullable=true: `string`; `location` required=false nullable=absent: [ReportEvidenceLocationDto](03_DTO-and-Schema-Reference.md#schema-reportevidencelocationdto).

## Schema OwnReportPageDto

Source: [OwnReportPageDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L42). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[OwnReportDto](03_DTO-and-Schema-Reference.md#schema-ownreportdto)>; `nextCursor` required=false nullable=true: `string`.

## Schema OwnReportSupplementDto

Source: [OwnReportSupplementDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `description` required=false nullable=true: `string`; `createdAt` required=false nullable=absent: `string/date-time`.

## Schema OwnReportUpdateDto

Source: [OwnReportUpdateDto](../../../RoadGuardSystem.DTOs/Reports/OwnReportDtos.cs#L22). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `summary` required=false nullable=true: `string`; `publishedAt` required=false nullable=absent: `string/date-time`; `evidenceIds` required=false nullable=true: array<`string/uuid`>.

## Schema PasswordRecoveryRequestDto

Source: [PasswordRecoveryRequestDto](../../../RoadGuardSystem.DTOs/Authentication/PasswordRecoveryRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["email"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `email` | true | `string/email` | minLength=3; maxLength=254 | `string?`; `[Required] [EmailAddress] [StringLength(254, MinimumLength = 3)]` |

## Schema PavementGeometryPreviewFact

Source: [PavementGeometryPreviewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L95). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `plan` required=false nullable=absent: [PavementLayoutPreviewFact](03_DTO-and-Schema-Reference.md#schema-pavementlayoutpreviewfact); `slabs` required=false nullable=true: array<[SlabGeometrySnapshotFact](03_DTO-and-Schema-Reference.md#schema-slabgeometrysnapshotfact)>; `warnings` required=false nullable=true: array<`string`>; `displayToleranceMeters` required=false nullable=absent: `number/double`; `renderedGapAreaSquareMeters` required=false nullable=absent: `number/double`; `renderedOverlapAreaSquareMeters` required=false nullable=absent: `number/double`.

## Schema PavementLayoutInput

Source: [PavementLayoutInput](../../../RoadGuardSystem.DTOs/Projects/PavementLayoutDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(decimal StripWidthMeters, decimal SlabLengthMeters, PavementWidthInterval[] WidthProfile)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `stripWidthMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `slabLengthMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `widthProfile` | false | array<[PavementWidthInterval](03_DTO-and-Schema-Reference.md#schema-pavementwidthinterval)> | nullable=true; minItems=1; maxItems=100000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PavementLayoutPreviewFact

Source: [PavementLayoutPreviewFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L101). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `analyticLengthMeters` required=false nullable=absent: `number/double`; `stripWidthMeters` required=false nullable=absent: `number/double`; `slabLengthMeters` required=false nullable=absent: `number/double`; `cells` required=false nullable=true: array<[PlannedSlabCellFact](03_DTO-and-Schema-Reference.md#schema-plannedslabcellfact)>; `warnings` required=false nullable=true: array<`string`>.

## Schema PavementLayoutView

Source: [PavementLayoutView](../../../RoadGuardSystem.Repositories/Interfaces/Projects/IPavementWorkflowRepository.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `sourcePlanId` required=false nullable=true: `string/uuid`; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `kind` required=false nullable=true: `string`; `contentHash` required=false nullable=true: `string`; `geometry` required=false nullable=absent: [PavementGeometryPreviewFact](03_DTO-and-Schema-Reference.md#schema-pavementgeometrypreviewfact); `createdAt` required=false nullable=absent: `string/date-time`.

## Schema PavementPlanCreateInput

Source: [PavementPlanCreateInput](../../../RoadGuardSystem.DTOs/Projects/PavementLayoutDtos.cs#L42). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(PavementLayoutInput Layout, double DisplayToleranceMeters)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `layout` | false | [PavementLayoutInput](03_DTO-and-Schema-Reference.md#schema-pavementlayoutinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `displayToleranceMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PavementWidthInterval

Source: [PavementWidthInterval](../../../RoadGuardSystem.DTOs/Projects/PavementLayoutDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(decimal FromOffsetMeters, decimal ToOffsetMeters, decimal WidthMeters)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fromOffsetMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `toOffsetMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `widthMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PlannedSlabCellFact

Source: [PlannedSlabCellFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L108). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `sequence` required=false nullable=absent: `integer/int32`; `longitudinalRow` required=false nullable=absent: `integer/int32`; `strip` required=false nullable=absent: `integer/int32`; `fromOffsetMeters` required=false nullable=absent: `number/double`; `toOffsetMeters` required=false nullable=absent: `number/double`; `fromLateralMeters` required=false nullable=absent: `number/double`; `toLateralMeters` required=false nullable=absent: `number/double`; `isTerminalResidual` required=false nullable=absent: `boolean`; `isWidthTransitionFragment` required=false nullable=absent: `boolean`.

## Schema PointDto

Source: [PointDto](../../../RoadGuardSystem.DTOs/Surveys/PointDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Range(-180, 180)] double Longitude,     [Range(-90, 90)] double Latitude)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `longitude` | false | `number/double` | minimum=-180; maximum=180 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `latitude` | false | `number/double` | minimum=-90; maximum=90 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PositionDto

Source: [PositionDto](../../../RoadGuardSystem.DTOs/Surveys/PositionDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["point", "source"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required] PointDto Point,     [Required] string Source,     double? AccuracyMeters = null,     DateTimeOffset? CapturedAt = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `point` | true | [PointDto](03_DTO-and-Schema-Reference.md#schema-pointdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `source` | true | `string` | enum=["EXIF","MANUAL","SURVEY","DERIVED"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `accuracyMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `capturedAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PostponeSurveyPlanRequestDto

Source: [PostponeSurveyPlanRequestDto](../../../RoadGuardSystem.DTOs/Surveys/PostponeSurveyPlanRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["reason"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     DateTimeOffset? NewPlannedStartAt,     [Required, MinLength(1)] string Reason,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `newPlannedStartAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PostponeSurveyPlanResponseDto

Source: [PostponeSurveyPlanResponseDto](../../../RoadGuardSystem.DTOs/Surveys/PostponeSurveyPlanResponseDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `planId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=absent: [SurveyPlanStatus](03_DTO-and-Schema-Reference.md#schema-surveyplanstatus); `newPlannedStartAt` required=false nullable=true: `string/date-time`; `postponementId` required=false nullable=absent: `string/uuid`.

## Schema PostponeSurveyPlanV2RequestDto

Source: [PostponeSurveyPlanV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/PostponeSurveyPlanV2RequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["reason"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema PrimaryProjectManagerReadDto

Source: [PrimaryProjectManagerReadDto](../../../RoadGuardSystem.DTOs/Staff/StaffReadResponses.cs#L15). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `membershipId` required=false nullable=absent: `string/uuid`; `userId` required=false nullable=absent: `string/uuid`; `displayName` required=false nullable=true: `string`; `validFrom` required=false nullable=absent: `string/date`; `validTo` required=false nullable=true: `string/date`; `membershipVersion` required=false nullable=true: `string`.

## Schema PrimaryProjectManagerResponseDto

Source: [PrimaryProjectManagerResponseDto](../../../RoadGuardSystem.DTOs/Staff/StaffReadResponses.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `primaryProjectManager` required=false nullable=absent: [PrimaryProjectManagerReadDto](03_DTO-and-Schema-Reference.md#schema-primaryprojectmanagerreaddto).

## Schema ProblemDetails

Source: `ProblemDetails` (OpenAPI/inline schema; no unique CLR declaration resolved). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties={}.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `type` required=false nullable=true: `string`; `title` required=false nullable=true: `string`; `status` required=false nullable=true: `integer/int32`; `detail` required=false nullable=true: `string`; `instance` required=false nullable=true: `string`.

## Schema ProcessingJobResponseDto

Source: [ProcessingJobResponseDto](../../../RoadGuardSystem.DTOs/Processing/ProcessingJobResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `resultId` required=false nullable=true: `string/uuid`; `attemptNumber` required=false nullable=absent: `integer/int32`; `version` required=false nullable=true: `string`; `jobType` required=false nullable=true: `string`; `error` required=false nullable=true: `string`.

## Schema ProfileResponseDto

Source: [ProfileResponseDto](../../../RoadGuardSystem.DTOs/Identity/ProfileResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `userId` required=false nullable=absent: `string/uuid`; `username` required=false nullable=true: `string`; `displayName` required=false nullable=true: `string`; `email` required=false nullable=true: `string`; `roleCode` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `rowVersion` required=false nullable=true: `string`.

## Schema ProfileUpdateRequestDto

Source: [ProfileUpdateRequestDto](../../../RoadGuardSystem.DTOs/Identity/ProfileUpdateRequestDto.cs#L7). OpenAPI root: type=object; nullable=absent; required=`["displayName", "expectedRowVersion"]`; additionalProperties={}.
CLR type attributes: `none`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `displayName` | true | `string` | minLength=1; maxLength=200 | `string?`; `[Required] [StringLength(200, MinimumLength = 1)]` |
| `email` | false | `string` | nullable=true; minLength=0; maxLength=254 | `string?`; `[StringLength(254)]` |
| `expectedRowVersion` | true | `string` | minLength=1 | `string?`; `[Required]` |
| `operationId` | false | `string/uuid` | — | `Guid`; `no property attributes indexed` |

## Schema ProjectLifecycleHistoryDto

Source: [ProjectLifecycleHistoryDto](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `actorId` required=false nullable=absent: `string/uuid`; `recordedAtUtc` required=false nullable=absent: `string/date-time`; `obligationId` required=false nullable=true: `string/uuid`; `grantId` required=false nullable=true: `string/uuid`; `receiverId` required=false nullable=true: `string/uuid`; `operationalClosureId` required=false nullable=true: `string/uuid`; `reason` required=false nullable=true: `string`; `basisReference` required=false nullable=true: `string`; `authoritySourceReference` required=false nullable=true: `string`; `sourceDisposition` required=false nullable=true: `string`; `defectId` required=false nullable=true: `string/uuid`; `linkedDefectId` required=false nullable=true: `string/uuid`; `handlingScope` required=false nullable=true: `string`.

## Schema ProjectLifecycleViewDto

Source: [ProjectLifecycleViewDto](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `constructionCompletion` required=false nullable=true: `string`; `operationalClosure` required=false nullable=true: `string`; `warrantyRecorded` required=false nullable=absent: `boolean`; `acceptsNewReports` required=false nullable=absent: `boolean`; `obligationInventory` required=false nullable=true: `string`; `operationalClosureEligibility` required=false nullable=true: `string`; `outstandingMandatoryObligationIds` required=false nullable=true: array<`string/uuid`>; `missingReasons` required=false nullable=true: array<`string`>; `history` required=false nullable=true: array<[ProjectLifecycleHistoryDto](03_DTO-and-Schema-Reference.md#schema-projectlifecyclehistorydto)>; `version` required=false nullable=true: `string`; `actions` required=false nullable=true: array<[LD06ActionDto](03_DTO-and-Schema-Reference.md#schema-ld06actiondto)>; `responsibilities` required=false nullable=true: array<[ObligationResponsibilityDto](03_DTO-and-Schema-Reference.md#schema-obligationresponsibilitydto)>; `transferableObligations` required=false nullable=true: array<[LD06TransferableObligationDto](03_DTO-and-Schema-Reference.md#schema-ld06transferableobligationdto)>.

## Schema ProjectListItemResponseDto

Source: [ProjectListItemResponseDto](../../../RoadGuardSystem.DTOs/Projects/ProjectListResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `projectCode` required=false nullable=true: `string`; `name` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `primaryProjectManagerUserId` required=false nullable=true: `string/uuid`; `primaryProjectManagerName` required=false nullable=true: `string`.

## Schema ProjectListResponseDto

Source: [ProjectListResponseDto](../../../RoadGuardSystem.DTOs/Projects/ProjectListResponseDto.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[ProjectListItemResponseDto](03_DTO-and-Schema-Reference.md#schema-projectlistitemresponsedto)>; `nextCursor` required=false nullable=true: `string`; `asOf` required=false nullable=absent: `string/date-time`.

## Schema ProjectMemberResponseDto

Source: [ProjectMemberResponseDto](../../../RoadGuardSystem.DTOs/Staff/StaffReadResponses.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `membershipId` required=false nullable=absent: `string/uuid`; `userId` required=false nullable=absent: `string/uuid`; `displayName` required=false nullable=true: `string`; `role` required=false nullable=true: `string`; `isPrimary` required=false nullable=absent: `boolean`; `status` required=false nullable=true: `string`; `validFrom` required=false nullable=absent: `string/date`; `validTo` required=false nullable=true: `string/date`; `membershipVersion` required=false nullable=true: `string`.

## Schema ProjectMemberResponseDtoStaffPageResponseDto

Source: `ProjectMemberResponseDtoStaffPageResponseDto` (OpenAPI/inline schema; no unique CLR declaration resolved). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[ProjectMemberResponseDto](03_DTO-and-Schema-Reference.md#schema-projectmemberresponsedto)>; `nextCursor` required=false nullable=true: `string`; `asOf` required=false nullable=absent: `string/date-time`.

## Schema ProjectSummaryV1

Source: [ProjectSummaryV1](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L53). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `projectId` required=false nullable=absent: `string/uuid`; `readAt` required=false nullable=absent: `string/date-time`; `definitionVersion` required=false nullable=true: `string`; `filters` required=false nullable=absent: [ReportingFiltersDto](03_DTO-and-Schema-Reference.md#schema-reportingfiltersdto); `metrics` required=false nullable=true: array<[ReportingMetricDto](03_DTO-and-Schema-Reference.md#schema-reportingmetricdto)>; `warnings` required=false nullable=true: array<`string`>; `isolation` required=false nullable=true: `string`.

## Schema ProjectWorkPackageResponseDto

Source: [ProjectWorkPackageResponseDto](../../../RoadGuardSystem.DTOs/Projects/ProjectWorkPackageResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `projectCode` required=false nullable=true: `string`; `name` required=false nullable=true: `string`; `description` required=false nullable=true: `string`; `engineeringUtmSrid` required=false nullable=true: `integer/int32`; `status` required=false nullable=true: `string`; `startDate` required=false nullable=true: `string/date`; `endDate` required=false nullable=true: `string/date`; `accessRole` required=false nullable=true: `string`; `rowVersion` required=false nullable=true: `string`; `roadSections` required=false nullable=true: array<[RoadSectionWorkPackageDto](03_DTO-and-Schema-Reference.md#schema-roadsectionworkpackagedto)>; `warranties` required=false nullable=true: array<[WarrantyWorkPackageDto](03_DTO-and-Schema-Reference.md#schema-warrantyworkpackagedto)>.

## Schema ReassignPrimaryProjectManagerRequestDto

Source: [ReassignPrimaryProjectManagerRequestDto](../../../RoadGuardSystem.DTOs/Projects/ReassignPrimaryProjectManagerRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["effectiveFrom", "expectedCurrentMembershipRowVersion", "reason"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid PrimaryProjectManagerUserId,     [Required] DateOnly? EffectiveFrom,     [Required, MaxLength(1000)] string Reason,     [Required] string ExpectedCurrentMembershipRowVersion,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `primaryProjectManagerUserId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `effectiveFrom` | true | `string/date` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | true | `string` | maxLength=1000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedCurrentMembershipRowVersion` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReassignPrimaryProjectManagerResponseDto

Source: [ReassignPrimaryProjectManagerResponseDto](../../../RoadGuardSystem.DTOs/Projects/ReassignPrimaryProjectManagerResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `previousMembershipId` required=false nullable=absent: `string/uuid`; `currentMembershipId` required=false nullable=absent: `string/uuid`; `currentMembershipRowVersion` required=false nullable=true: `string`.

## Schema ReassignSurveyTaskV2RequestDto

Source: [ReassignSurveyTaskV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/ReassignSurveyTaskV2RequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["reason"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid OperatorId,     [Required, MinLength(1)] string Reason,     DateTimeOffset? DueAt = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `operatorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `dueAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReceiveAiResultRequestDto

Source: [ReceiveAiResultRequestDto](../../../RoadGuardSystem.DTOs/Processing/ReceiveAiResultRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["checksumSha256", "detections", "manifestHash", "mode"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     Guid JobAttemptId,     [param: Required, RegularExpression("^[a-f0-9]{64}$")] string ManifestHash,     Guid ModelVersionId,     [param: Required, RegularExpression("^(MOCK&#124;REAL)$")] string Mode,     Guid RawResultFileId,     [param: Required, RegularExpression("^[a-f0-9]{64}$")] string ChecksumSha256,     [param: Required] IReadOnlyList<AiDetectionDto> Detections)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `jobAttemptId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `manifestHash` | true | `string` | pattern="^[a-f0-9]{64}$" | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `modelVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mode` | true | `string` | pattern="^(MOCK&#124;REAL)$"; enum=["MOCK","REAL"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `rawResultFileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checksumSha256` | true | `string` | pattern="^[a-f0-9]{64}$" | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `detections` | true | array<[AiDetectionDto](03_DTO-and-Schema-Reference.md#schema-aidetectiondto)> | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RefreshRequestDto

Source: [RefreshRequestDto](../../../RoadGuardSystem.DTOs/Authentication/RefreshRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["refreshToken"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `refreshToken` | true | `string` | minLength=16; maxLength=2048 | `string?`; `[Required] [StringLength(2048, MinimumLength = 16)]` |

## Schema RegisterReporterRequestDto

Source: [RegisterReporterRequestDto](../../../RoadGuardSystem.DTOs/Authentication/RegisterReporterRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["displayName", "email", "password", "reporterType"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `email` | true | `string/email` | minLength=1 | `string?`; `[Required, EmailAddress]` |
| `password` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `displayName` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |
| `reporterType` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |

## Schema RegistrationIntentResponseDto

Source: [RegistrationIntentResponseDto](../../../RoadGuardSystem.DTOs/Authentication/RegistrationIntentResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `intentId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `resendAfterSeconds` required=false nullable=absent: `integer/int32`.

## Schema ReleaseRetentionHoldRequest

Source: [ReleaseRetentionHoldRequest](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L24). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RenewedHandlingScopeInput

Source: [RenewedHandlingScopeInput](../../../RoadGuardSystem.DTOs/Projects/ProjectLifecycleDtos.cs#L17). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[System.Text.Json.Serialization.JsonUnmappedMemberHandling(System.Text.Json.Serialization.JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OperationalClosureId, string Reason, string HandlingScope, string Basis)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `operationalClosureId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handlingScope` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `basis` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairActualScopeInput

Source: [RepairActualScopeInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid PhysicalRoadId, Guid RouteVersionId, Guid? SegmentSetId,     Guid? LayoutRevisionId, string? SlabId, decimal FromMeters, decimal ToMeters, decimal OffsetFromMeters, decimal OffsetToMeters)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `physicalRoadId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `routeVersionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentSetId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `layoutRevisionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `slabId` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fromMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `toMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `offsetFromMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `offsetToMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairAssessmentView

Source: [RepairAssessmentView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L58). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `firstStartId` required=false nullable=absent: `string/uuid`; `sessionId` required=false nullable=absent: `string/uuid`; `stage` required=false nullable=true: `string`; `readiness` required=false nullable=true: `string`; `missingReasons` required=false nullable=true: array<`string`>; `locationState` required=false nullable=true: `string`; `contentHash` required=false nullable=true: `string`.

## Schema RepairAttemptHistoryView

Source: [RepairAttemptHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L15). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `originId` required=false nullable=absent: `string/uuid`; `contentHash` required=false nullable=true: `string`; `itemId` required=false nullable=absent: `string/uuid`; `obligationId` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `crewId` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `assignmentId` required=false nullable=absent: `string/uuid`; `authorizationId` required=false nullable=true: `string/uuid`; `locationVersion` required=false nullable=true: `string`; `policyRevisionId` required=false nullable=true: `string/uuid`; `performed` required=false nullable=absent: `boolean`; `unperformedReason` required=false nullable=true: `string`; `startedAt` required=false nullable=true: `string/date-time`; `finishedAt` required=false nullable=true: `string/date-time`; `serverReceivedAt` required=false nullable=absent: `string/date-time`; `timeProvenance` required=false nullable=true: `string`; `evidence` required=false nullable=true: array<[RepairEvidenceHistoryView](03_DTO-and-Schema-Reference.md#schema-repairevidencehistoryview)>.

## Schema RepairAttemptIntakeView

Source: [RepairAttemptIntakeView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L65). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `attemptId` required=false nullable=absent: `string/uuid`; `linkId` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `submissionId` required=false nullable=absent: `string/uuid`; `reviewClockId` required=false nullable=absent: `string/uuid`; `originalReviewDueAt` required=false nullable=absent: `string/date-time`; `intakeReadiness` required=false nullable=true: `string`.

## Schema RepairAttemptReviewInput

Source: [RepairAttemptReviewInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L35). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FieldSubmissionId, string Decision, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fieldSubmissionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `decision` | false | `string` | nullable=true; enum=["SUPPLEMENT","ACCEPT"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true; maxLength=2000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairAttemptReviewView

Source: [RepairAttemptReviewView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L67). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `reviewId` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `submissionId` required=false nullable=absent: `string/uuid`; `decision` required=false nullable=true: `string`; `receiptActivation` required=false nullable=true: `string`.

## Schema RepairAttemptSubmitInput

Source: [RepairAttemptSubmitInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L31). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FieldSubmissionId, string ExpectedContentHash, Guid? ExecutionFinishId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fieldSubmissionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedContentHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `executionFinishId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairAttemptSupplementInput

Source: [RepairAttemptSupplementInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L33). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FieldSubmissionId, string ExpectedContentHash)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fieldSubmissionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedContentHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairCancellationInput

Source: [RepairCancellationInput](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L8). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason, RepairLifecycleHandoverInput? Handover)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handover` | false | [RepairLifecycleHandoverInput](03_DTO-and-Schema-Reference.md#schema-repairlifecyclehandoverinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairCorrectionBasisHistoryView

Source: [RepairCorrectionBasisHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `text` required=false nullable=true: `string`; `evidence` required=false nullable=true: array<[RepairEvidenceHistoryView](03_DTO-and-Schema-Reference.md#schema-repairevidencehistoryview)>.

## Schema RepairCorrectionBasisInput

Source: [RepairCorrectionBasisInput](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Text, Guid[] EvidenceReferenceIds)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `text` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceReferenceIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairCorrectionInput

Source: [RepairCorrectionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L8). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid SupersedesDecisionId, string Result, string Reason, RepairCorrectionBasisInput Basis)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `supersedesDecisionId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `result` | false | `string` | nullable=true; enum=["UNREPAIRED","REPORTED_AWAITING_REVIEW","CONFIRMED"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true; maxLength=2000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `basis` | false | [RepairCorrectionBasisInput](03_DTO-and-Schema-Reference.md#schema-repaircorrectionbasisinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairCorrectionView

Source: [RepairCorrectionView](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L17). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `obligationId` required=false nullable=absent: `string/uuid`; `supersedesDecisionId` required=false nullable=absent: `string/uuid`; `result` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`; `basis` required=false nullable=true: `string`; `evidenceReferenceIds` required=false nullable=true: array<`string/uuid`>; `actorId` required=false nullable=absent: `string/uuid`; `at` required=false nullable=absent: `string/date-time`; `obligationResolved` required=false nullable=absent: `boolean`; `itemState` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema RepairDecisionHistoryView

Source: [RepairDecisionHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `obligationId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `mode` required=false nullable=true: `string`; `actorId` required=false nullable=absent: `string/uuid`; `role` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`; `at` required=false nullable=absent: `string/date-time`; `supersedesDecisionId` required=false nullable=true: `string/uuid`; `result` required=false nullable=true: `string`; `basis` required=false nullable=absent: [RepairCorrectionBasisHistoryView](03_DTO-and-Schema-Reference.md#schema-repaircorrectionbasishistoryview).

## Schema RepairDecisionInput

Source: [RepairDecisionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true; maxLength=2000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairEligibilityReadView

Source: [RepairEligibilityReadView](../../../RoadGuardSystem.DTOs/Repairs/RepairEligibilityReadDtos.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `eligible` required=false nullable=absent: `boolean`; `activation` required=false nullable=true: `string`; `itemId` required=false nullable=absent: `string/uuid`; `bindingId` required=false nullable=absent: `string/uuid`; `policyRevisionId` required=false nullable=true: `string/uuid`; `policyContentHash` required=false nullable=true: `string`; `policyState` required=false nullable=true: `string`; `rules` required=false nullable=true: array<[RepairMeasurementRule](03_DTO-and-Schema-Reference.md#schema-repairmeasurementrule)>; `assessmentId` required=false nullable=true: `string/uuid`; `measurementIds` required=false nullable=true: array<`string/uuid`>; `originalVerifiedStart` required=false nullable=true: `string/date-time`; `executionExpiresAt` required=false nullable=true: `string/date-time`; `sourceMapping` required=false nullable=true: `string`; `warrantySources` required=false nullable=true: array<[RepairWarrantySource](03_DTO-and-Schema-Reference.md#schema-repairwarrantysource)>; `handoverSources` required=false nullable=true: array<[RepairHandoverSource](03_DTO-and-Schema-Reference.md#schema-repairhandoversource)>; `missingReasons` required=false nullable=true: array<`string`>; `version` required=false nullable=true: `string`; `coverageMapping` required=false nullable=absent: [RoadCoverageMapping](03_DTO-and-Schema-Reference.md#schema-roadcoveragemapping).

## Schema RepairEvidenceHistoryView

Source: [RepairEvidenceHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `fileId` required=false nullable=absent: `string/uuid`; `fileVersion` required=false nullable=true: `string`; `sha256` required=false nullable=true: `string`; `purpose` required=false nullable=true: `string`; `verified` required=false nullable=absent: `boolean`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `capturedAt` required=false nullable=true: `string/date-time`; `reuseDecisionId` required=false nullable=true: `string/uuid`; `reusedSource` required=false nullable=absent: `boolean`.

## Schema RepairExecutionFinishInput

Source: [RepairExecutionFinishInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L28). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, Guid ExecutionStartId, DateTimeOffset ClaimedAt,     Guid? DeviceId = null, long? MonotonicMilliseconds = null, string? BootId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `executionStartId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `claimedAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `monotonicMilliseconds` | false | `integer/int64` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `bootId` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairExecutionFinishView

Source: [RepairExecutionFinishView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L62). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `executionStartId` required=false nullable=absent: `string/uuid`; `claimedAt` required=false nullable=absent: `string/date-time`; `serverReceivedAt` required=false nullable=absent: `string/date-time`; `verifiedOriginalAt` required=false nullable=true: `string/date-time`; `timeProvenance` required=false nullable=true: `string`; `syncClockId` required=false nullable=true: `string/uuid`; `originalSyncDueAt` required=false nullable=true: `string/date-time`.

## Schema RepairExecutionStartInput

Source: [RepairExecutionStartInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L25). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, Guid FieldFirstStartId, DateTimeOffset ClaimedAt, Guid AssessmentId,     Guid? DeviceId = null, long? MonotonicMilliseconds = null, string? BootId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldFirstStartId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `claimedAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `assessmentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `monotonicMilliseconds` | false | `integer/int64` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `bootId` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairExecutionStartView

Source: [RepairExecutionStartView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L60). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `assessmentId` required=false nullable=absent: `string/uuid`; `firstStartId` required=false nullable=absent: `string/uuid`; `claimedAt` required=false nullable=absent: `string/date-time`; `serverReceivedAt` required=false nullable=absent: `string/date-time`; `verifiedOriginalAt` required=false nullable=true: `string/date-time`; `timeProvenance` required=false nullable=true: `string`.

## Schema RepairHandoverSource

Source: [RepairHandoverSource](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairEligibilitySourceSnapshot.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `documentNo` required=false nullable=true: `string`; `handoverDate` required=false nullable=absent: `string/date`; `acceptedByUserId` required=false nullable=true: `string/uuid`; `fileId` required=false nullable=true: `string/uuid`; `rowVersion` required=false nullable=true: `string`.

## Schema RepairHistoryView

Source: [RepairHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `item` required=false nullable=absent: [RepairItemView](03_DTO-and-Schema-Reference.md#schema-repairitemview); `decisions` required=false nullable=true: array<[RepairDecisionHistoryView](03_DTO-and-Schema-Reference.md#schema-repairdecisionhistoryview)>; `attempts` required=false nullable=true: array<[RepairAttemptHistoryView](03_DTO-and-Schema-Reference.md#schema-repairattempthistoryview)>; `reviewRequests` required=false nullable=true: array<[RepairReviewRequestHistoryView](03_DTO-and-Schema-Reference.md#schema-repairreviewrequesthistoryview)>.

## Schema RepairItemAssignInput

Source: [RepairItemAssignInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L18). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(FieldTaskCreateInput Task, Guid? PolicyRevisionId, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `task` | false | [FieldTaskCreateInput](03_DTO-and-Schema-Reference.md#schema-fieldtaskcreateinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `policyRevisionId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairItemProposeInput

Source: [RepairItemProposeInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ObligationId, string Mode, string RepairPlan, string ChecklistVersion, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `obligationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mode` | false | `string` | nullable=true; enum=["NORMAL","FAST_TRACK"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `repairPlan` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checklistVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairItemView

Source: [RepairItemView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L69). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `obligationId` required=false nullable=absent: `string/uuid`; `mode` required=false nullable=true: `string`; `state` required=false nullable=true: `string`; `result` required=false nullable=true: `string`; `effectiveDecisionId` required=false nullable=true: `string/uuid`; `attemptIds` required=false nullable=true: array<`string/uuid`>; `decisionIds` required=false nullable=true: array<`string/uuid`>; `version` required=false nullable=true: `string`.

## Schema RepairLifecycleHandoverInput

Source: [RepairLifecycleHandoverInput](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FirstStartId, Guid RecipientUserId,     string PerformedPortion, string SafetyState)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `firstStartId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recipientUserId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `performedPortion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `safetyState` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairLifecycleView

Source: [RepairLifecycleView](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `sourceItemId` required=false nullable=absent: `string/uuid`; `successorItemId` required=false nullable=true: `string/uuid`; `obligationId` required=false nullable=absent: `string/uuid`; `cancellationEventId` required=false nullable=true: `string/uuid`; `handoverEventId` required=false nullable=true: `string/uuid`; `continuationId` required=false nullable=true: `string/uuid`; `sourceState` required=false nullable=true: `string`; `successorState` required=false nullable=true: `string`; `sourceVersion` required=false nullable=true: `string`; `successorVersion` required=false nullable=true: `string`.

## Schema RepairMeasurementAssessmentInput

Source: [RepairMeasurementAssessmentInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L20). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid OriginId, Guid FieldFirstStartId,     FieldMeasurementInput[]? Measurements, FieldEvidenceDeclaration[]? Evidence,     FieldPositionProofInput? LocationProof, Guid? DeviceId = null,     [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] Dictionary<string, bool?>? StopConditions = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `originId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fieldFirstStartId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `measurements` | false | array<[FieldMeasurementInput](03_DTO-and-Schema-Reference.md#schema-fieldmeasurementinput)> | nullable=true; maxItems=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidence` | false | array<[FieldEvidenceDeclaration](03_DTO-and-Schema-Reference.md#schema-fieldevidencedeclaration)> | nullable=true; maxItems=100 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `locationProof` | false | [FieldPositionProofInput](03_DTO-and-Schema-Reference.md#schema-fieldpositionproofinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `stopConditions` | false | map<`boolean`> | nullable=true; additionalProperties={"type":"boolean","nullable":true} | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairMeasurementRule

Source: [RepairMeasurementRule](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairPolicyAndAuthorization.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string Code, string Unit, decimal Minimum, decimal Maximum)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `code` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `unit` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `minimum` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `maximum` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairNormalContinuationInput

Source: [RepairNormalContinuationInput](../../../RoadGuardSystem.DTOs/Repairs/RepairLifecycleDtos.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string RepairPlan, string ChecklistVersion, string Reason,     RepairLifecycleHandoverInput? Handover)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `repairPlan` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checklistVersion` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handover` | false | [RepairLifecycleHandoverInput](03_DTO-and-Schema-Reference.md#schema-repairlifecyclehandoverinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairObligationInput

Source: [RepairObligationInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Kind, bool Mandatory, RepairActualScopeInput Scope, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `kind` | false | `string` | nullable=true; enum=["FORMAL_REPAIR","TEMPORARY_SAFETY"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mandatory` | false | `boolean` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scope` | false | [RepairActualScopeInput](03_DTO-and-Schema-Reference.md#schema-repairactualscopeinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairPackageCreateInput

Source: [RepairPackageCreateInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid DefectId, string DefectVersion, RepairObligationInput[] Obligations, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `defectId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `obligations` | false | array<[RepairObligationInput](03_DTO-and-Schema-Reference.md#schema-repairobligationinput)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairPackageView

Source: [RepairPackageView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L71). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `allMandatoryResolved` required=false nullable=absent: `boolean`; `unresolvedMandatoryObligationIds` required=false nullable=true: array<`string/uuid`>; `items` required=false nullable=true: array<[RepairItemView](03_DTO-and-Schema-Reference.md#schema-repairitemview)>; `version` required=false nullable=true: `string`.

## Schema RepairPolicyDefinitionInput

Source: [RepairPolicyDefinitionInput](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string DefectTypeCode, string ChecklistVersion,     RepairMeasurementRule[] Measurements, string[] StopConditions, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `defectTypeCode` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checklistVersion` | false | `string` | nullable=true; maxLength=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `measurements` | false | array<[RepairMeasurementRule](03_DTO-and-Schema-Reference.md#schema-repairmeasurementrule)> | nullable=true; maxItems=200 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `stopConditions` | false | array<`string`> | nullable=true; maxItems=100 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true; maxLength=2000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairPolicyReasonInput

Source: [RepairPolicyReasonInput](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairPolicyView

Source: [RepairPolicyView](../../../RoadGuardSystem.DTOs/Repairs/RepairPolicyDtos.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `currentChangeId` required=false nullable=true: `string/uuid`; `publishedRevisionId` required=false nullable=true: `string/uuid`; `revision` required=false nullable=true: `integer/int32`; `defectTypeCode` required=false nullable=true: `string`; `checklistVersion` required=false nullable=true: `string`; `measurements` required=false nullable=true: array<[RepairMeasurementRule](03_DTO-and-Schema-Reference.md#schema-repairmeasurementrule)>; `stopConditions` required=false nullable=true: array<`string`>; `state` required=false nullable=true: `string`; `actorId` required=false nullable=absent: `string/uuid`; `at` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema RepairReviewRequestHistoryView

Source: [RepairReviewRequestHistoryView](../../../RoadGuardSystem.DTOs/Repairs/RepairHistoryDtos.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `decisionId` required=false nullable=absent: `string/uuid`; `actorId` required=false nullable=absent: `string/uuid`; `role` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`; `at` required=false nullable=absent: `string/date-time`.

## Schema RepairReviewRequestInput

Source: [RepairReviewRequestInput](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L11). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true; maxLength=2000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairReviewRequestView

Source: [RepairReviewRequestView](../../../RoadGuardSystem.DTOs/Repairs/RepairCorrectionDtos.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `itemId` required=false nullable=absent: `string/uuid`; `decisionId` required=false nullable=absent: `string/uuid`; `actorId` required=false nullable=absent: `string/uuid`; `role` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`; `at` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`.

## Schema RepairSafetyAcknowledgementInput

Source: [RepairSafetyAcknowledgementInput](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairSafetyAcknowledgementView

Source: [RepairSafetyAcknowledgementView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L17). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `warningId` required=false nullable=absent: `string/uuid`; `actorId` required=false nullable=absent: `string/uuid`; `at` required=false nullable=absent: `string/date-time`; `afterOriginalDue` required=false nullable=absent: `boolean`.

## Schema RepairSafetyCheckInput

Source: [RepairSafetyCheckInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L47). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string Result, string Findings, Guid[] EvidenceIds)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `result` | false | `string` | nullable=true; enum=["Safe","NeedsReplacement","Danger"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `findings` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `evidenceIds` | false | array<`string/uuid`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairSafetyCheckView

Source: [RepairSafetyCheckView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `actorId` required=false nullable=absent: `string/uuid`; `at` required=false nullable=absent: `string/date-time`; `result` required=false nullable=true: `string`; `findings` required=false nullable=true: `string`; `evidenceLinkIds` required=false nullable=true: array<`string/uuid`>.

## Schema RepairSafetyCreateInput

Source: [RepairSafetyCreateInput](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L44). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FormalRepairObligationId, Guid SafetyObligationId, Guid ResponsibleActorId,     string CheckSchedule, string ReplacementCondition, string RemovalCondition, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `formalRepairObligationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `safetyObligationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `responsibleActorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checkSchedule` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `replacementCondition` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `removalCondition` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairSafetyInstallInput

Source: [RepairSafetyInstallInput](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(DateTimeOffset FirstCheckDueAt, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `firstCheckDueAt` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RepairSafetyView

Source: [RepairSafetyView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `formalObligationId` required=false nullable=absent: `string/uuid`; `safetyObligationId` required=false nullable=absent: `string/uuid`; `responsibleActorId` required=false nullable=absent: `string/uuid`; `installedAt` required=false nullable=true: `string/date-time`; `firstCheckDueAt` required=false nullable=true: `string/date-time`; `currentCheckId` required=false nullable=true: `string/uuid`; `checks` required=false nullable=true: array<[RepairSafetyCheckView](03_DTO-and-Schema-Reference.md#schema-repairsafetycheckview)>; `warnings` required=false nullable=true: array<[RepairSafetyWarningView](03_DTO-and-Schema-Reference.md#schema-repairsafetywarningview)>; `acknowledgements` required=false nullable=true: array<[RepairSafetyAcknowledgementView](03_DTO-and-Schema-Reference.md#schema-repairsafetyacknowledgementview)>; `version` required=false nullable=true: `string`.

## Schema RepairSafetyWarningView

Source: [RepairSafetyWarningView](../../../RoadGuardSystem.DTOs/Repairs/RepairSafetyDtos.cs#L15). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `sourceCheckId` required=false nullable=absent: `string/uuid`; `intendedActorId` required=false nullable=absent: `string/uuid`; `serverReceivedAt` required=false nullable=absent: `string/date-time`; `originalDueAt` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`.

## Schema RepairTaskBindingView

Source: [RepairTaskBindingView](../../../RoadGuardSystem.DTOs/Repairs/RepairWorkflowDtos.cs#L53). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `itemId` required=false nullable=absent: `string/uuid`; `obligationId` required=false nullable=absent: `string/uuid`; `taskId` required=false nullable=absent: `string/uuid`; `assignmentId` required=false nullable=absent: `string/uuid`; `mode` required=false nullable=true: `string`; `authorizationId` required=false nullable=true: `string/uuid`; `policyRevisionId` required=false nullable=true: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=true: `string/uuid`; `layoutRevisionId` required=false nullable=true: `string/uuid`; `mapPublicationId` required=false nullable=true: `string/uuid`; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `slabId` required=false nullable=true: `string`; `firstStartId` required=false nullable=true: `string/uuid`.

## Schema RepairWarrantySource

Source: [RepairWarrantySource](../../../RoadGuardSystem.BusinessObjects/Repairs/RepairEligibilitySourceSnapshot.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=true: `string/uuid`; `handoverDocumentId` required=false nullable=true: `string/uuid`; `handoverDate` required=false nullable=absent: `string/date`; `warrantyStartDate` required=false nullable=absent: `string/date`; `warrantyEndDate` required=false nullable=absent: `string/date`; `scope` required=false nullable=absent: [WarrantyScope](03_DTO-and-Schema-Reference.md#schema-warrantyscope); `status` required=false nullable=absent: [WarrantyStatus](03_DTO-and-Schema-Reference.md#schema-warrantystatus); `sourceDocumentId` required=false nullable=true: `string/uuid`.

## Schema ReportEvidenceInputDto

Source: [ReportEvidenceInputDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FileId, string? FileVersion, string? LocationSource,     DateTimeOffset? CapturedAt = null, ReportEvidenceLocationDto? Location = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `locationSource` | false | `string` | nullable=true; enum=["UNKNOWN","CAPTURE","EXIF","MANUAL"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `capturedAt` | false | `string/date-time` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `location` | false | [ReportEvidenceLocationDto](03_DTO-and-Schema-Reference.md#schema-reportevidencelocationdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReportEvidenceLocationDto

Source: [ReportEvidenceLocationDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(decimal? Latitude, decimal? Longitude, decimal? AccuracyMeters)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `latitude` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `longitude` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `accuracyMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReporterEvidenceCreateRequestDto

Source: [ReporterEvidenceCreateRequestDto](../../../RoadGuardSystem.DTOs/Files/ReporterEvidenceCreateRequestDto.cs#L4). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string FileName, string MediaType, long SizeBytes, string ChecksumSha256)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fileName` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mediaType` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sizeBytes` | false | `integer/int64` | minimum=1; maximum=20971520 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checksumSha256` | false | `string` | nullable=true; pattern="^[a-f0-9]{64}$" | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReporterReportResponseDto

Source: [ReporterReportResponseDto](../../../RoadGuardSystem.DTOs/Reports/ReporterReportDtos.cs#L23). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `description` required=false nullable=true: `string`; `createdAt` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`; `evidenceIds` required=false nullable=true: array<`string/uuid`>.

## Schema ReportingAvailabilityDto

Source: [ReportingAvailabilityDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L94). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `availability` required=false nullable=true: `string`; `reasonCodes` required=false nullable=true: array<`string`>.

## Schema ReportingDimensionsDto

Source: [ReportingDimensionsDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L32). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `status` required=false nullable=true: `string`; `band` required=false nullable=true: `string`; `routeVersionId` required=false nullable=true: `string/uuid`; `segmentSetId` required=false nullable=true: `string/uuid`.

## Schema ReportingFiltersDto

Source: [ReportingFiltersDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `from` required=false nullable=true: `string/date-time`; `to` required=false nullable=true: `string/date-time`; `routeVersionId` required=false nullable=true: `string/uuid`; `segmentSetId` required=false nullable=true: `string/uuid`; `segmentIds` required=false nullable=true: array<`string/uuid`>.

## Schema ReportingItemDto

Source: [ReportingItemDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L63). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `metric` required=false nullable=true: `string`; `type` required=false nullable=true: `string`; `version` required=false nullable=true: `string`; `status` required=false nullable=true: `string`; `parentTaskId` required=false nullable=true: `string/uuid`; `routeVersionId` required=false nullable=true: `string/uuid`; `segmentSetId` required=false nullable=true: `string/uuid`; `segmentId` required=false nullable=true: `string/uuid`; `band` required=false nullable=true: `string`; `datasetId` required=false nullable=true: `string/uuid`; `assessmentId` required=false nullable=true: `string/uuid`; `sizeBytes` required=false nullable=true: `integer/int64`; `unit` required=false nullable=true: `string`; `bias` required=false nullable=true: `number/double`; `mae` required=false nullable=true: `number/double`; `rmse` required=false nullable=true: `number/double`; `used` required=false nullable=true: `integer/int32`; `excluded` required=false nullable=true: `integer/int32`; `modelVersionId` required=false nullable=true: `string/uuid`; `splitId` required=false nullable=true: `string`; `measurementType` required=false nullable=true: `string`.

## Schema ReportingItemsPageDto

Source: [ReportingItemsPageDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L103). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `metric` required=false nullable=true: `string`; `readAt` required=false nullable=absent: `string/date-time`; `items` required=false nullable=true: array<[ReportingItemDto](03_DTO-and-Schema-Reference.md#schema-reportingitemdto)>; `nextCursor` required=false nullable=true: `string`; `availability` required=false nullable=absent: [ReportingAvailabilityDto](03_DTO-and-Schema-Reference.md#schema-reportingavailabilitydto).

## Schema ReportingMetricDto

Source: [ReportingMetricDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L22). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `code` required=false nullable=true: `string`; `dimensions` required=false nullable=absent: [ReportingDimensionsDto](03_DTO-and-Schema-Reference.md#schema-reportingdimensionsdto); `value` required=false nullable=true: `number/double`; `unit` required=false nullable=true: `string`; `numerator` required=false nullable=true: `integer/int64`; `denominator` required=false nullable=true: `integer/int64`; `periodApplicable` required=false nullable=absent: `boolean`; `availability` required=false nullable=true: `string`; `reasonCodes` required=false nullable=true: array<`string`>; `sourceRefs` required=false nullable=true: array<[ReportingSourceRefDto](03_DTO-and-Schema-Reference.md#schema-reportingsourcerefdto)>.

## Schema ReportingSourceRefDto

Source: [ReportingSourceRefDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L13). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `type` required=false nullable=true: `string`; `id` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema ReportingTimelineItemDto

Source: [ReportingTimelineItemDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L84). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `eventId` required=false nullable=absent: `string/uuid`; `occurredAt` required=false nullable=absent: `string/date-time`; `actorDisplay` required=false nullable=true: `string`; `action` required=false nullable=true: `string`; `source` required=false nullable=absent: [ReportingSourceRefDto](03_DTO-and-Schema-Reference.md#schema-reportingsourcerefdto); `summary` required=false nullable=true: `string`.

## Schema ReportingTimelinePageDto

Source: [ReportingTimelinePageDto](../../../RoadGuardSystem.DTOs/Reporting/ReportingDtos.cs#L105). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `readAt` required=false nullable=absent: `string/date-time`; `items` required=false nullable=true: array<[ReportingTimelineItemDto](03_DTO-and-Schema-Reference.md#schema-reportingtimelineitemdto)>; `nextCursor` required=false nullable=true: `string`; `availability` required=false nullable=absent: [ReportingAvailabilityDto](03_DTO-and-Schema-Reference.md#schema-reportingavailabilitydto).

## Schema ResendReporterOtpRequestDto

Source: [ResendReporterOtpRequestDto](../../../RoadGuardSystem.DTOs/Authentication/ResendReporterOtpRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `intentId` | false | `string/uuid` | — | `Guid`; `no property attributes indexed` |

## Schema RetentionBasisView

Source: [RetentionBasisView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L94). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `fileId` required=false nullable=absent: `string/uuid`; `revision` required=false nullable=absent: `integer/int32`; `policyVersion` required=false nullable=true: `string`; `classification` required=false nullable=true: `string`; `referenceInventoryVersion` required=false nullable=true: `string`; `inventoryComplete` required=false nullable=absent: `boolean`; `warrantyRefs` required=false nullable=true: array<[RetentionWarrantyView](03_DTO-and-Schema-Reference.md#schema-retentionwarrantyview)>; `confirmedBy` required=false nullable=absent: `string/uuid`; `confirmedAt` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`; `supersedesId` required=false nullable=true: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema RetentionEvaluationView

Source: [RetentionEvaluationView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L106). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `createdAt` required=false nullable=absent: `string/date-time`; `evaluatedAt` required=false nullable=true: `string/date-time`; `policyVersion` required=false nullable=true: `string`; `items` required=false nullable=true: array<[RetentionItemView](03_DTO-and-Schema-Reference.md#schema-retentionitemview)>; `nextCursor` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema RetentionFileView

Source: [RetentionFileView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L82). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `fileId` required=false nullable=absent: `string/uuid`; `basisHeadId` required=false nullable=true: `string/uuid`; `basisVersion` required=false nullable=true: `string`; `inventoryVersion` required=false nullable=true: `string`; `inventoryComplete` required=false nullable=absent: `boolean`; `classification` required=false nullable=true: `string`; `references` required=false nullable=true: array<[RetentionReferenceView](03_DTO-and-Schema-Reference.md#schema-retentionreferenceview)>; `applicableObligations` required=false nullable=true: array<[RetentionWarrantyView](03_DTO-and-Schema-Reference.md#schema-retentionwarrantyview)>; `inventoryReasonCodes` required=false nullable=true: array<`string`>; `activeHoldCount` required=false nullable=absent: `integer/int32`; `evaluation` required=false nullable=absent: [RetentionItemView](03_DTO-and-Schema-Reference.md#schema-retentionitemview).

## Schema RetentionHoldView

Source: [RetentionHoldView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L62). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `scopeType` required=false nullable=true: `string`; `scopeId` required=false nullable=absent: `string/uuid`; `state` required=false nullable=true: `string`; `createdBy` required=false nullable=absent: `string/uuid`; `createdAt` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`; `releasedBy` required=false nullable=true: `string/uuid`; `releasedAt` required=false nullable=true: `string/date-time`; `version` required=false nullable=true: `string`.

## Schema RetentionItemView

Source: [RetentionItemView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L72). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `fileId` required=false nullable=absent: `string/uuid`; `eligibility` required=false nullable=true: `string`; `reasonCodes` required=false nullable=true: array<`string`>; `eligibleAfter` required=false nullable=true: `string/date-time`; `basisVersion` required=false nullable=true: `string`; `inventoryVersion` required=false nullable=true: `string`; `holdVersion` required=false nullable=true: `string`; `isCurrent` required=false nullable=absent: `boolean`.

## Schema RetentionReferenceView

Source: [RetentionReferenceView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L44). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `kind` required=false nullable=true: `string`; `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=true: `string/uuid`; `sourceVersion` required=false nullable=true: `string`.

## Schema RetentionWarrantyView

Source: [RetentionWarrantyView](../../../RoadGuardSystem.DTOs/Retention/RetentionDtos.cs#L53). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `scope` required=false nullable=true: `string`; `warrantyEndDate` required=false nullable=absent: `string/date`; `sourceVersion` required=false nullable=true: `string`.

## Schema RetryProcessingJobRequestDto

Source: [RetryProcessingJobRequestDto](../../../RoadGuardSystem.DTOs/Processing/RetryProcessingJobRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["reason"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `([param: Required, MinLength(1), MaxLength(1000)] string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | true | `string` | minLength=1; maxLength=1000 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReviewTrainingLabelDto

Source: [ReviewTrainingLabelDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L25). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(string? Decision, string? Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `decision` | false | `string` | nullable=true; enum=["APPROVE","REJECT"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ReviseTrainingLabelDto

Source: [ReviseTrainingLabelDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid FileId, LabelAnnotationDto? Annotation,     string? DefectTypeCode, string? Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fileId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `annotation` | false | [LabelAnnotationDto](03_DTO-and-Schema-Reference.md#schema-labelannotationdto) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `defectTypeCode` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RoadCoverageInputDto

Source: [RoadCoverageInputDto](../../../RoadGuardSystem.DTOs/Repairs/RoadCoverageDtos.cs#L6). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid ScopeObligationId, string ExpectedScopeHash,     Guid HandoverDocumentId, string HandoverVersion, string SourceKind, Guid SourceId, string SourceVersion,     DateTimeOffset ApplicableFromUtc, DateTimeOffset ApplicableToUtc, string Provenance, string Reason,     Guid? SupersedesId = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `scopeObligationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedScopeHash` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverDocumentId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `handoverVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceKind` | false | `string` | nullable=true; enum=["WARRANTY","MAINTENANCE_BASIS"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `applicableFromUtc` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `applicableToUtc` | false | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `provenance` | false | `string` | nullable=true; enum=["REAL_SOURCE","TEST_ONLY"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `supersedesId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RoadCoverageMapping

Source: [RoadCoverageMapping](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `scopeObligationId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=absent: `string/uuid`; `locationVersion` required=false nullable=true: `string`; `from` required=false nullable=absent: `number/double`; `to` required=false nullable=absent: `number/double`; `offsetFrom` required=false nullable=absent: `number/double`; `offsetTo` required=false nullable=absent: `number/double`; `applicableFromUtc` required=false nullable=absent: `string/date-time`; `applicableToUtc` required=false nullable=absent: `string/date-time`; `handoverDocumentId` required=false nullable=absent: `string/uuid`; `handoverVersion` required=false nullable=true: `string`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `sourceVersion` required=false nullable=true: `string`; `handoverFileId` required=false nullable=absent: `string/uuid`; `coverageFileId` required=false nullable=absent: `string/uuid`; `sourceFactsJson` required=false nullable=true: `string`; `provenance` required=false nullable=true: `string`; `actorId` required=false nullable=absent: `string/uuid`; `confirmedAtUtc` required=false nullable=absent: `string/date-time`; `reason` required=false nullable=true: `string`; `supersedesId` required=false nullable=true: `string/uuid`.

## Schema RoadCoverageReadFact

Source: [RoadCoverageReadFact](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L20). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `scopes` required=false nullable=true: array<[RoadCoverageScopeFact](03_DTO-and-Schema-Reference.md#schema-roadcoveragescopefact)>; `sources` required=false nullable=true: array<[RoadCoverageSourceFact](03_DTO-and-Schema-Reference.md#schema-roadcoveragesourcefact)>; `history` required=false nullable=true: array<[RoadCoverageMapping](03_DTO-and-Schema-Reference.md#schema-roadcoveragemapping)>; `version` required=false nullable=true: `string`.

## Schema RoadCoverageScopeFact

Source: [RoadCoverageScopeFact](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `obligationId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=absent: `string/uuid`; `locationVersion` required=false nullable=true: `string`; `from` required=false nullable=absent: `number/double`; `to` required=false nullable=absent: `number/double`; `offsetFrom` required=false nullable=absent: `number/double`; `offsetTo` required=false nullable=absent: `number/double`; `scopeHash` required=false nullable=true: `string`.

## Schema RoadCoverageSourceFact

Source: [RoadCoverageSourceFact](../../../RoadGuardSystem.BusinessObjects/Repairs/RoadCoverageMapping.cs#L18). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `kind` required=false nullable=true: `string`; `id` required=false nullable=absent: `string/uuid`; `fileId` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`; `from` required=false nullable=true: `string/date`; `to` required=false nullable=true: `string/date`; `provenance` required=false nullable=true: `string`.

## Schema RoadGeometryVersionView

Source: [RoadGeometryVersionView](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L71). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `versionNo` required=false nullable=absent: `integer/int32`; `isCurrent` required=false nullable=absent: `boolean`; `effectiveFrom` required=false nullable=absent: `string/date-time`; `sourceDraftId` required=false nullable=true: `string/uuid`; `sourceCrs` required=false nullable=true: `integer/int32`; `engineeringSrid` required=false nullable=absent: `integer/int32`; `stationOriginMeters` required=false nullable=true: `number/double`; `widthProfile` required=false nullable=true: array<[WidthProfileItem](03_DTO-and-Schema-Reference.md#schema-widthprofileitem)>; `surveyWidthMeters` required=false nullable=true: `number/double`; `metricCenterline` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `wgs84Centerline` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `lengthMeters` required=false nullable=absent: `number/double`; `metadataStatus` required=false nullable=true: `string`; `approvedBy` required=false nullable=true: `string/uuid`; `approvedAt` required=false nullable=true: `string/date-time`; `geometryHash` required=false nullable=true: `string`; `crsProfileRevisionId` required=false nullable=true: `string/uuid`; `routeSystemId` required=false nullable=true: `string/uuid`; `routeKind` required=false nullable=true: `string`; `parentRouteVersionId` required=false nullable=true: `string/uuid`; `junctionOffsetMeters` required=false nullable=true: `number/double`; `declaredLengthMeters` required=false nullable=true: `number/double`; `chainageCalibration` required=false nullable=absent: [ChainageCalibrationInput](03_DTO-and-Schema-Reference.md#schema-chainagecalibrationinput); `crsStatus` required=false nullable=true: `string`; `sampleOnly` required=false nullable=absent: `boolean`.

## Schema RoadSectionCoordinateDto

Source: [RoadSectionCoordinateDto](../../../RoadGuardSystem.DTOs/Projects/RoadSectionCoordinateDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(double X, double Y)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `x` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `y` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RoadSectionVersionResponseDto

Source: [RoadSectionVersionResponseDto](../../../RoadGuardSystem.DTOs/Projects/RoadSectionVersionResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=absent: `string/uuid`; `roadSectionVersionId` required=false nullable=absent: `string/uuid`; `code` required=false nullable=true: `string`; `versionNo` required=false nullable=absent: `integer/int32`; `isCurrent` required=false nullable=absent: `boolean`; `effectiveFrom` required=false nullable=absent: `string/date-time`; `changeReason` required=false nullable=true: `string`.

## Schema RoadSectionWorkPackageDto

Source: [RoadSectionWorkPackageDto](../../../RoadGuardSystem.DTOs/Projects/RoadSectionWorkPackageDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `roadSectionId` required=false nullable=absent: `string/uuid`; `code` required=false nullable=true: `string`; `name` required=false nullable=true: `string`; `currentVersionId` required=false nullable=absent: `string/uuid`; `versionNo` required=false nullable=absent: `integer/int32`; `geometryWkt` required=false nullable=true: `string`; `srid` required=false nullable=absent: `integer/int32`; `effectiveFrom` required=false nullable=absent: `string/date-time`; `changeReason` required=false nullable=true: `string`.

## Schema RouteSystemInput

Source: [RouteSystemInput](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L63). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(string Code, string Name)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `code` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `name` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema RouteSystemView

Source: [RouteSystemView](../../../RoadGuardSystem.DTOs/Projects/CrsProfileDtos.cs#L72). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `code` required=false nullable=true: `string`; `name` required=false nullable=true: `string`.

## Schema SegmentDefinition

Source: [SegmentDefinition](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L96). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(double TargetLengthMeters = 100, string RemainderMode = "KEEP", double[]? BoundariesMeters = null,     NativeAlignmentInput? NativeAlignment = null, double? TessellationToleranceMeters = null,     ChainageCalibrationInput? ChainageCalibration = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `targetLengthMeters` | false | `number/double` | minimum=0; exclusiveMinimum=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `remainderMode` | false | `string` | nullable=true; enum=["KEEP","MERGE_PREVIOUS"] | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `boundariesMeters` | false | array<`number/double`> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `nativeAlignment` | false | [NativeAlignmentInput](03_DTO-and-Schema-Reference.md#schema-nativealignmentinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `tessellationToleranceMeters` | false | `number/double` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `chainageCalibration` | false | [ChainageCalibrationInput](03_DTO-and-Schema-Reference.md#schema-chainagecalibrationinput) | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema SegmentGeometry

Source: [SegmentGeometry](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L107). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=true: `string/uuid`; `sequence` required=false nullable=absent: `integer/int32`; `fromOffsetMeters` required=false nullable=absent: `number/double`; `toOffsetMeters` required=false nullable=absent: `number/double`; `startStationMeters` required=false nullable=absent: `number/double`; `endStationMeters` required=false nullable=absent: `number/double`; `lengthMeters` required=false nullable=absent: `number/double`; `metricGeometry` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `wgs84Geometry` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape).

## Schema SegmentGeometryView

Source: [SegmentGeometryView](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L127). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `sequence` required=false nullable=absent: `integer/int32`; `fromOffsetMeters` required=false nullable=true: `number/double`; `toOffsetMeters` required=false nullable=true: `number/double`; `startStationMeters` required=false nullable=true: `number/double`; `endStationMeters` required=false nullable=true: `number/double`; `lengthMeters` required=false nullable=true: `number/double`; `metricGeometry` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `wgs84Geometry` required=false nullable=absent: [GeometryShape](03_DTO-and-Schema-Reference.md#schema-geometryshape); `missingMetadata` required=false nullable=true: array<`string`>.

## Schema SegmentPreview

Source: [SegmentPreview](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L117). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `routeVersionId` required=false nullable=absent: `string/uuid`; `totalLengthMeters` required=false nullable=absent: `number/double`; `boundariesMeters` required=false nullable=true: array<`number/double`>; `segments` required=false nullable=true: array<[SegmentGeometry](03_DTO-and-Schema-Reference.md#schema-segmentgeometry)>; `definitionHash` required=false nullable=true: `string`.

## Schema SegmentPublishInput

Source: [SegmentPublishInput](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L149). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid? ExpectedPublishedSetId, string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `expectedPublishedSetId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema SegmentSetView

Source: [SegmentSetView](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L138). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `definition` required=false nullable=absent: [SegmentDefinition](03_DTO-and-Schema-Reference.md#schema-segmentdefinition); `geometryHash` required=false nullable=true: `string`; `segments` required=false nullable=true: array<[SegmentGeometryView](03_DTO-and-Schema-Reference.md#schema-segmentgeometryview)>; `publishedBy` required=false nullable=true: `string/uuid`; `publishedAt` required=false nullable=true: `string/date-time`; `version` required=false nullable=true: `string`; `metadataStatus` required=false nullable=true: `string`; `missingMetadata` required=false nullable=true: array<`string`>.

## Schema SelectedBaselineItem

Source: [SelectedBaselineItem](../../../RoadGuardSystem.Repositories/Interfaces/Surveys/AssessmentContracts.cs#L10). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `selectionId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `segmentId` required=false nullable=absent: `string/uuid`; `targetBand` required=false nullable=true: `string`; `datasetId` required=false nullable=absent: `string/uuid`; `assessmentId` required=false nullable=absent: `string/uuid`.

## Schema SlabGeometrySnapshotFact

Source: [SlabGeometrySnapshotFact](../../../RoadGuardSystem.BusinessObjects/PersistenceFacts/ProjectsFacts.cs#L145). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `key` required=false nullable=true: `string`; `plannedSequence` required=false nullable=true: `integer/int32`; `footprint` required=false nullable=true: array<[GeometryPointFact](03_DTO-and-Schema-Reference.md#schema-geometrypointfact)>; `lengthMeters` required=false nullable=true: `number/double`; `widthMeters` required=false nullable=true: `number/double`; `dimensionUnknownReason` required=false nullable=true: `string`; `source` required=false nullable=true: `string`; `sourceFileId` required=false nullable=true: `string/uuid`; `provenanceStatus` required=false nullable=true: `string`.

## Schema StaffUserResponseDto

Source: [StaffUserResponseDto](../../../RoadGuardSystem.DTOs/Staff/StaffReadResponses.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `userId` required=false nullable=absent: `string/uuid`; `displayName` required=false nullable=true: `string`; `email` required=false nullable=true: `string`; `phoneNumber` required=false nullable=true: `string`; `role` required=false nullable=true: `string`; `status` required=false nullable=true: `string`.

## Schema StaffUserResponseDtoStaffPageResponseDto

Source: `StaffUserResponseDtoStaffPageResponseDto` (OpenAPI/inline schema; no unique CLR declaration resolved). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[StaffUserResponseDto](03_DTO-and-Schema-Reference.md#schema-staffuserresponsedto)>; `nextCursor` required=false nullable=true: `string`; `asOf` required=false nullable=absent: `string/date-time`.

## Schema StatisticsDefect

Source: [StatisticsDefect](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L22). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema StatisticsMeasurement

Source: [StatisticsMeasurement](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L17). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `type` required=false nullable=true: `string`; `value` required=false nullable=true: `number/double`; `valueState` required=false nullable=true: `string`; `unit` required=false nullable=true: `string`; `version` required=false nullable=true: `string`; `unknownReason` required=false nullable=true: `string`; `evidenceFileId` required=false nullable=true: `string/uuid`.

## Schema StatisticsQuantity

Source: [StatisticsQuantity](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L20). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `sharedPartId` required=false nullable=absent: `string/uuid`; `measurementId` required=false nullable=absent: `string/uuid`; `sourceVersion` required=false nullable=true: `string`; `type` required=false nullable=true: `string`; `unit` required=false nullable=true: `string`; `value` required=false nullable=true: `number/double`; `valueState` required=false nullable=true: `string`; `segmentId` required=false nullable=true: `string/uuid`; `provenance` required=false nullable=true: `string`; `reason` required=false nullable=true: `string`.

## Schema StatisticsQuantityInputDto

Source: [StatisticsQuantityInputDto](../../../RoadGuardSystem.DTOs/Reporting/DefectStatisticsInputDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `(Guid MeasurementId, string SourceVersion, Guid? SegmentId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `measurementId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sourceVersion` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `segmentId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema StatisticsScope

Source: [StatisticsScope](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L14). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `obligationId` required=false nullable=absent: `string/uuid`; `defectId` required=false nullable=absent: `string/uuid`; `defectVersion` required=false nullable=true: `string`; `scopeHash` required=false nullable=true: `string`; `roadSectionId` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `locationVersion` required=false nullable=true: `string`; `from` required=false nullable=absent: `number/double`; `to` required=false nullable=absent: `number/double`; `offsetFrom` required=false nullable=absent: `number/double`; `offsetTo` required=false nullable=absent: `number/double`.

## Schema StatisticsSegment

Source: [StatisticsSegment](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L16). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `version` required=false nullable=true: `string`.

## Schema StatisticsSegmentCount

Source: [StatisticsSegmentCount](../../../RoadGuardSystem.BusinessObjects/Reporting/DefectStatisticsSource.cs#L19). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `segmentId` required=false nullable=absent: `string/uuid`; `relatedDefects` required=false nullable=true: `integer/int64`; `knownRelatedDefects` required=false nullable=absent: `integer/int64`; `availability` required=false nullable=true: `string`.

## Schema SubmitDatasetRequestDto

Source: [SubmitDatasetRequestDto](../../../RoadGuardSystem.DTOs/Surveys/SubmitDatasetRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["deviceId", "recordedAt", "scope", "telemetryFileIds", "videoFileIds"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [param: Required, MinLength(1)] IReadOnlyList<Guid> VideoFileIds,     [param: Required] IReadOnlyList<Guid> TelemetryFileIds,     [param: Required] DateTimeOffset RecordedAt,     Guid? DeviceId,     [param: Required, MinLength(1)] IReadOnlyList<BandScopeDto> Scope,     IReadOnlyList<DatasetPairDto>? Pairs = null)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `videoFileIds` | true | array<`string/uuid`> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `telemetryFileIds` | true | array<`string/uuid`> | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `recordedAt` | true | `string/date-time` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `deviceId` | true | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `scope` | true | array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `pairs` | false | array<[DatasetPairDto](03_DTO-and-Schema-Reference.md#schema-datasetpairdto)> | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema SupplementSurveyTaskV2RequestDto

Source: [SupplementSurveyTaskV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/SupplementSurveyTaskV2RequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["reason", "scope"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] IReadOnlyList<BandScopeDto> Scope,     [Required, MinLength(1)] string Reason,     Guid OperatorId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `scope` | true | array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `reason` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operatorId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema SurveyGeometryRefDto

Source: [SurveyGeometryRefDto](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L21). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `routeVersionId` required=false nullable=absent: `string/uuid`; `segmentSetId` required=false nullable=absent: `string/uuid`; `segmentIds` required=false nullable=true: array<`string/uuid`>.

## Schema SurveyPlanStatus

Source: [SurveyPlanStatus](../../../RoadGuardSystem.BusinessObjects/Common/Enums.cs#L88). OpenAPI root: type=integer; nullable=absent; required=`[]`; enum=[0,1,2,3,4,5].
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `Unknown = 0, Planned = 1, Postponed = 2, InProgress = 3, Completed = 4, Cancelled = 5`.
## Schema SurveyPlanV2ResponseDto

Source: [SurveyPlanV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyPlanV2ResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `scope` required=false nullable=true: array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)>; `plannedAt` required=false nullable=absent: `string/date-time`; `status` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema SurveyRequestStatus

Source: [SurveyRequestStatus](../../../RoadGuardSystem.BusinessObjects/Common/Enums.cs#L98). OpenAPI root: type=integer; nullable=absent; required=`[]`; enum=[0,1,2,3,4,5,6,7,8,9,10].
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `Unknown = 0, NewAssigned = 1, Accepted = 2, Rejected = 3, Reassigned = 4, InProgress = 5, Submitted = 6, SupplementRequired = 7, Completed = 8, Cancelled = 9, Postponed = 10`.
## Schema SurveyTaskPageV2ResponseDto

Source: [SurveyTaskPageV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskPageV2ResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[SurveyTaskV2ResponseDto](03_DTO-and-Schema-Reference.md#schema-surveytaskv2responsedto)>; `nextCursor` required=false nullable=true: `string`; `asOf` required=false nullable=absent: `string/date-time`.

## Schema SurveyTaskReasonV2RequestDto

Source: [SurveyTaskReasonV2RequestDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskReasonV2RequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["reason"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] string Reason)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `reason` | true | `string` | minLength=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema SurveyTaskV2ResponseDto

Source: [SurveyTaskV2ResponseDto](../../../RoadGuardSystem.DTOs/Surveys/SurveyTaskV2ResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `scope` required=false nullable=true: array<[BandScopeDto](03_DTO-and-Schema-Reference.md#schema-bandscopedto)>; `operatorId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `version` required=false nullable=true: `string`; `supplementTaskId` required=false nullable=true: `string/uuid`.

## Schema SurveyTaskWorkPackage

Source: [SurveyTaskWorkPackage](../../../RoadGuardSystem.DTOs/Surveys/AssessmentDtos.cs#L19). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `schemaVersion` required=false nullable=true: `string`; `task` required=false nullable=absent: [SurveyTaskV2ResponseDto](03_DTO-and-Schema-Reference.md#schema-surveytaskv2responsedto); `dueAt` required=false nullable=true: `string/date-time`; `accessPoint` required=false nullable=absent: [PositionDto](03_DTO-and-Schema-Reference.md#schema-positiondto); `geometryRefs` required=false nullable=true: array<[SurveyGeometryRefDto](03_DTO-and-Schema-Reference.md#schema-surveygeometryrefdto)>; `scopeVersion` required=false nullable=true: `string`.

## Schema SurveyType

Source: [SurveyType](../../../RoadGuardSystem.BusinessObjects/Common/Enums.cs#L80). OpenAPI root: type=integer; nullable=absent; required=`[]`; enum=[0,1,2,3].
CLR type attributes: `none`; record/constructor parameters: `none in declaration index`. Enum source: `Unknown = 0, Original = 1, Periodic = 2, Supplementary = 3`.
## Schema TrainingLabelPageDto

Source: [TrainingLabelPageDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L43). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `items` required=false nullable=true: array<[TrainingLabelViewDto](03_DTO-and-Schema-Reference.md#schema-traininglabelviewdto)>; `nextCursor` required=false nullable=true: `string`.

## Schema TrainingLabelViewDto

Source: [TrainingLabelViewDto](../../../RoadGuardSystem.DTOs/Labels/TrainingLabelDtos.cs#L28). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `revision` required=false nullable=absent: `integer/int32`; `status` required=false nullable=true: `string`; `sourceKind` required=false nullable=true: `string`; `sourceId` required=false nullable=absent: `string/uuid`; `sourceVersion` required=false nullable=true: `string`; `fileId` required=false nullable=absent: `string/uuid`; `fileVersion` required=false nullable=true: `string`; `annotation` required=false nullable=absent: [LabelAnnotationDto](03_DTO-and-Schema-Reference.md#schema-labelannotationdto); `defectTypeCode` required=false nullable=true: `string`; `reviewedBy` required=false nullable=true: `string/uuid`; `reviewedAt` required=false nullable=true: `string/date-time`; `reviewReason` required=false nullable=true: `string`; `version` required=false nullable=true: `string`.

## Schema UpdateMeRequestDto

Source: [UpdateMeRequestDto](../../../RoadGuardSystem.DTOs/Identity/UpdateMeRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["displayName"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `displayName` | true | `string` | minLength=1; maxLength=200 | `string?`; `[Required, StringLength(200, MinimumLength = 1)]` |

## Schema UpdateProjectRequestDto

Source: [UpdateProjectRequestDto](../../../RoadGuardSystem.DTOs/Projects/UpdateProjectRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["expectedRowVersion", "name"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MaxLength(255)] string Name,     string? Description,     int? EngineeringUtmSrid,     DateOnly? StartDate,     DateOnly? EndDate,     [Required] string ExpectedRowVersion,     Guid OperationId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `name` | true | `string` | maxLength=255 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `description` | false | `string` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `engineeringUtmSrid` | false | `integer/int32` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `startDate` | false | `string/date` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `endDate` | false | `string/date` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `expectedRowVersion` | true | `string` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `operationId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema UpdateProjectResponseDto

Source: [UpdateProjectResponseDto](../../../RoadGuardSystem.DTOs/Projects/UpdateProjectResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `projectId` required=false nullable=absent: `string/uuid`; `projectCode` required=false nullable=true: `string`; `name` required=false nullable=true: `string`; `description` required=false nullable=true: `string`; `engineeringUtmSrid` required=false nullable=true: `integer/int32`; `startDate` required=false nullable=true: `string/date`; `endDate` required=false nullable=true: `string/date`; `status` required=false nullable=true: `string`; `rowVersion` required=false nullable=true: `string`.

## Schema UploadCompleteRequestDto

Source: [UploadCompleteRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadCompleteRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["checksumSha256", "parts"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] IReadOnlyList<CompletedUploadPartDto> Parts,     [Required, RegularExpression("^[a-f0-9]{64}$")] string ChecksumSha256)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `parts` | true | array<[CompletedUploadPartDto](03_DTO-and-Schema-Reference.md#schema-completeduploadpartdto)> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checksumSha256` | true | `string` | pattern="^[a-f0-9]{64}$" | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema UploadCreateRequestDto

Source: [UploadCreateRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadCreateRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["checksumSha256", "fileName", "mediaType", "purpose"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MaxLength(40)] string Purpose,     Guid? ProjectId,     Guid? TargetId,     [Required, MaxLength(255)] string FileName,     [Required, MaxLength(120)] string MediaType,     long SizeBytes,     [Required, RegularExpression("^[a-f0-9]{64}$")] string ChecksumSha256)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `purpose` | true | `string` | maxLength=40 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `projectId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `targetId` | false | `string/uuid` | nullable=true | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `fileName` | true | `string` | maxLength=255 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `mediaType` | true | `string` | maxLength=120 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `sizeBytes` | false | `integer/int64` | minimum=1; maximum=8589934592 | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `checksumSha256` | true | `string` | pattern="^[a-f0-9]{64}$" | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema UploadPartUrlResponseDto

Source: [UploadPartUrlResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `partNumber` required=false nullable=absent: `integer/int32`; `url` required=false nullable=true: `string`; `expiresAt` required=false nullable=absent: `string/date-time`.

## Schema UploadPartUrlsRequestDto

Source: [UploadPartUrlsRequestDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlsRequestDto.cs#L5). OpenAPI root: type=object; nullable=absent; required=`["partNumbers"]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(     [Required, MinLength(1)] IReadOnlyList<int> PartNumbers)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `partNumbers` | true | array<`integer/int32`> | minItems=1 | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema UploadPartUrlsResponseDto

Source: [UploadPartUrlsResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadPartUrlsResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `parts` required=false nullable=true: array<[UploadPartUrlResponseDto](03_DTO-and-Schema-Reference.md#schema-uploadparturlresponsedto)>.

## Schema UploadSessionResponseDto

Source: [UploadSessionResponseDto](../../../RoadGuardSystem.DTOs/Files/UploadSessionResponseDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `fileId` required=false nullable=absent: `string/uuid`; `status` required=false nullable=true: `string`; `partSizeBytes` required=false nullable=absent: `integer/int32`; `expiresAt` required=false nullable=absent: `string/date-time`; `version` required=false nullable=true: `string`.

## Schema ValidationPairDto

Source: [ValidationPairDto](../../../RoadGuardSystem.DTOs/Processing/ValidationPairDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(Guid GroundTruthId, Guid DerivedMeasurementId)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `groundTruthId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `derivedMeasurementId` | false | `string/uuid` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |

## Schema ValidationResultDto

Source: [ValidationResultDto](../../../RoadGuardSystem.DTOs/Processing/ValidationResultDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `usedCount` required=false nullable=absent: `integer/int32`; `excludedCount` required=false nullable=absent: `integer/int32`; `bias` required=false nullable=true: `number/double`; `mae` required=false nullable=true: `number/double`; `rmse` required=false nullable=true: `number/double`; `unit` required=false nullable=true: `string`; `exclusionReasons` required=false nullable=true: array<`string`>.

## Schema VerifyReporterOtpRequestDto

Source: [VerifyReporterOtpRequestDto](../../../RoadGuardSystem.DTOs/Authentication/VerifyReporterOtpRequestDto.cs#L6). OpenAPI root: type=object; nullable=absent; required=`["otp"]`; additionalProperties=false.
CLR type attributes: `[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]`; record/constructor parameters: `none in declaration index`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `intentId` | false | `string/uuid` | — | `Guid`; `no property attributes indexed` |
| `otp` | true | `string` | minLength=1 | `string?`; `[Required, MinLength(1)]` |

## Schema WarrantyScope

Source: [WarrantyScope](../../../RoadGuardSystem.BusinessObjects/Common/Enums.cs#L62). OpenAPI root: type=integer; nullable=absent; required=`[]`; enum=[0,1,2,3,4].
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `Unknown = 0, Project = 1, RoadSection = 2, ContractItem = 3, Other = 4`.
## Schema WarrantyStatus

Source: [WarrantyStatus](../../../RoadGuardSystem.BusinessObjects/Common/Enums.cs#L71). OpenAPI root: type=integer; nullable=absent; required=`[]`; enum=[0,1,2,3,4].
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `Unknown = 0, Planned = 1, Active = 2, Expired = 3, Suspended = 4`.
## Schema WarrantyWorkPackageDto

Source: [WarrantyWorkPackageDto](../../../RoadGuardSystem.DTOs/Projects/WarrantyWorkPackageDto.cs#L3). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `warrantyId` required=false nullable=absent: `string/uuid`; `roadSectionId` required=false nullable=true: `string/uuid`; `handoverDocumentId` required=false nullable=true: `string/uuid`; `handoverDate` required=false nullable=absent: `string/date`; `warrantyStartDate` required=false nullable=absent: `string/date`; `warrantyEndDate` required=false nullable=absent: `string/date`; `retainedValue` required=false nullable=true: `number/double`; `scope` required=false nullable=true: `string`; `terms` required=false nullable=true: `string`; `sourceDocumentId` required=false nullable=true: `string/uuid`; `status` required=false nullable=true: `string`.

## Schema WeeklyDigestDutyView

Source: [WeeklyDigestDutyView](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L7). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `clockId` required=false nullable=absent: `string/uuid`; `targetId` required=false nullable=absent: `string/uuid`; `kind` required=false nullable=true: `string`; `originEventId` required=false nullable=absent: `string/uuid`; `originAtUtc` required=false nullable=absent: `string/date-time`; `dueAtRecoveryUtc` required=false nullable=absent: `string/date-time`.

## Schema WeeklyDigestView

Source: [WeeklyDigestView](../../../RoadGuardSystem.DTOs/Messaging/H6NotificationDtos.cs#L9). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `response declaration linked; not duplicated`. Enum source: `not enum`.
Response-only property index (full response facets/converters in unchanged OpenAPI/source): `id` required=false nullable=absent: `string/uuid`; `projectId` required=false nullable=absent: `string/uuid`; `recipientId` required=false nullable=true: `string/uuid`; `scheduledAtUtc` required=false nullable=absent: `string/date-time`; `recoveredAtUtc` required=false nullable=absent: `string/date-time`; `pendingAtRecovery` required=false nullable=true: array<[WeeklyDigestDutyView](03_DTO-and-Schema-Reference.md#schema-weeklydigestdutyview)>; `recoveryPeriods` required=false nullable=true: array<`string/date-time`>.

## Schema WidthProfileItem

Source: [WidthProfileItem](../../../RoadGuardSystem.DTOs/Projects/GeometryWorkflowDtos.cs#L12). OpenAPI root: type=object; nullable=absent; required=`[]`; additionalProperties=false.
CLR type attributes: `none`; record/constructor parameters: `(double FromOffsetMeters, double ToOffsetMeters, double WidthMeters)`. Enum source: `not enum`.

| JSON property | Required | Schema | Nullable/validation facets | CLR property/attributes where resolved |
|---|---|---|---|---|
| `fromOffsetMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `toOffsetMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
| `widthMeters` | false | `number/double` | — | Record parameter/inherited/inline; read source declaration and primaryParameters above |
