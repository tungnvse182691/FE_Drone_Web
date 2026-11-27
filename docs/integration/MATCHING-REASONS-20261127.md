# Matching item explanations — 27/11/2026

FE hoang base303da38. Presentation-only update: ReportMatchingPanel maps priorityGroup plus matching reasonCodes to same assigned segment (0/ASSIGNED_SEGMENT), adjacent topology segment (1/NEIGHBOR_SEGMENT), project expansion (2/PROJECT_EXPANSION). Both code and group must agree; absent/unknown/conflicting data gets a neutral explanation, never invented relation. No filter/order/API/threshold/decision/permission changes. ReportDefectIntake only adds optional priorityGroup to local TypeScript interface; runtime response objects already retain it.

Definitions verified against runtime/source6579f247295cafb8b3d72fdbe5999b5e6f439f3c: Services/Interfaces/Candidates/CandidateMatcher.cs, Services/Implementations/Defects/CandidateMatchingService.cs, Repositories/Implementations/Defects/ReportMatchingLocationRepository.cs, DTOs/Defects/CandidateMatchDtos.cs and deploy/fe-handoff/WEB-B-READ-CONTRACTS.md. No guessed enum meanings. reasonCodes and distanceStatus are string fields rather than exhaustive wire enums; unknown values never printed in UI or treated as success.

Distance is shown only for MEASURED and a finite nonnegative distanceMeters, unit metres from contract.0 is retained; null/negative/nonfinite or unconfirmed measurement gets explanatory text. Missing-distance statuses mapped from actual producer/repository cases; no near/far claim or duplicate-confidence from rank. HISTORICAL_LINK reports existing source-link history; ACCURACY_OVERLAP only reports uncertainty overlap, not proven duplicate. Existing Tìm trong dự án label and LINK_EXISTING selection/guards stay unchanged. Expanded list explicitly says manual comparison in same project, duplicate not confirmed.

## Actual read verification

Existing PM-B session through FE5173, no decision mutation. Case ac20135f-fdc4-4281-b0b9-444011e3721b, source Report prefix35AB5E66. GET matching candidates sourceKind=REPORT/sourceId from Case, pageSize50/expand=true ->200, nextCursor=null. Returned Defect59e14079-bf84-474f-9ac9-b28d049cc27f:

- priorityGroup2
- reasonCodes PROJECT_EXPANSION, GPS_MISSING, HISTORICAL_LINK
- distanceMeters null, distanceStatus GPS_MISSING

Browser text verified: same project without same/adjacent-segment basis; source photo lacks GPS for distance; server records previous link. No0/near, diagnostic code or certainty-of-duplicate displayed. Initial scoped query empty, manual expansion returns one item. This is actual response for this Report, not a claim about another user's five-item list.

Six isolated browser logic assertions PASS: assigned, adjacent, expansion, unknown-code/group fallback, null distance not0, negative distance rejected. Assigned example includes real valid0 measurement. These mocks do not prove runtime fixtures for all groups. Initial capture script failed looking up request URL from browser performance list, received SPA HTML; fixed the inspection script to use actual Case project/report IDs. Product requests unchanged. Final actual response/UI screenshot saved under artifacts/matching-explanation-20261127 (not Git).

## Fields not sufficient for stronger claims

BE does not return duplicate-confidence or an approved distance threshold; no such UI interpretation added. Candidate group refers to assigned matching segment scope, not proof GPS physically lies on that segment. History count alone does not identify which Report is linked; only HISTORICAL_LINK reason for this source is described. Missing target uncertainty prevents proving accuracy overlap; no inference from source accuracy alone. Unknown distanceStatus/reasonCodes remain neutral. No separate business code/description introduced beyond previous source presentation.

npm run build (tsc -b + Vite) PASS; git diff --check PASS. Existing Tailwind duration ambiguity/large-bundle warnings retained. Existing LINK decision readback/new-session discovery limitations unchanged. No business POST/BE/DB changes. Local commit only for this follow-up; no push action performed in this task.
