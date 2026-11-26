# Report matching clarity and confirmed-link guard — 27/11/2026

Base e0fd4e2 on hoang (preserved, not reset); prior source had no tracked WIP. User subsequently authorized normal push of all local hoang commits including previous commits; no squash/amend/rebase/force.

## Implemented scope

ReportMatchingPanel identifies the selected source Report by existing RPT display ID, API description and reception date. Each matching target is read with existing GET Defect and shown separately: existing DEF display ID, API type/catalog label, status, route name when current route reference resolves, WGS84 Point only when actual srid4326/WKT provides it. No centroid/snapping or manufactured description/business code. DefectViewDto lacks a separate business-code and description field; these are disclosed as unavailable, not invented. Other geometry stays unconverted rather than guessing a point. distanceMeters is displayed only when finite/nonnegative, unit meters is defined by this field's existing contract;0 is valid.

Expanded query still calls /projects/{p}/candidates?sourceKind=REPORT&sourceId=...&expand=true, not a raw Defect list. Wording distinguishes source-location matching scope and project-wide advisory expansion; neither is declared a proven duplicate. GPS confirmation explicitly says it confirms only location, not a link. Existing API/preconditions preserved.

ReportDefectIntake loads target details, labels selector destinations and selected target explicitly. LINK receipt is validated against sourceKind/sourceId/decision/targetDefectId, then existing readDecision GET validates decision+Defect. Selection or failed POST never marks linked. A verified result hides creation/review form; execute handler rejects while a confirmed link/result is known. Storage referenceId alone no longer hides/locks the form or proves business state. Pending unknown-outcome journal behavior is retained.

useCaseReportMedia holds scoped in-memory confirmed links, populated only after validated decision readback, per Report within current Case/actor/version. Not persisted as business truth. CitizenTriageRow/TriageCard label changes to view-only when relevant Reports are confirmed linked, keeping record/photo/Defect viewing accessible; Case–Case LINKED is not treated as Report→Defect. Multi-Report Cases are not wholly locked from one Report link. Existing Case/Report scopes and abort checks prevent carrying a link to another selection.

## Persistent read limitation

Current CandidatesController only supports GET decision by known decisionId; matching history exposes sourceLinkCount but no decision ID or exact linked target relation. InternalCaseDto.defectIds can remain empty after source decision. No current server discovery by Report was found in inspected runtime07a8929 source. Consequently new-session recovery without a known decision ID cannot be honestly guaranteed. Existing URL/session reference is only a locator followed by authoritative GET; local/session storage never alone means linked. UI reports failure to restore previous result rather than falsely claiming either linked or never processed. Full BE rejection of duplicate creation is outside this FE task and remains separate.

## Validation executed

- npm run build (tsc -b + Vite): PASS; existing duration-[250ms]/bundle warnings remain.
- git diff --check: PASS.
- Real PM-B browser read: existing Case ac20135f-fdc4-4281-b0b9-444011e3721b, Report35ab5e66…; initial location scope empty, explicit expand returns readable target DEF-59E14079 with actual catalog type/status/current route MOCK-B. No business write.
- Isolated browser logic checks5/5: source/target content; choosing target does not lock; failed command does not lock; mocked LINK receipt+GET readback for exact source/target hides creation form; clear reference/reload reports missing discovery rather than fake success. Command/readback mocks never send a live decision POST. Not live LINK success acceptance.
- Existing check-report-keep-new-journal.cjs: service groups initially pass, component harness then fails missing mock surveyService (pre-existing imported service); not claimed full regression PASS and no guard weakened to pass it.
- New PM save/real LINK, transport race and multi-Report end-to-end not executed. Scope behavior reviewed in source. Runtime F5 across a truly new session is BLOCKED where BE lacks decision discovery; no new endpoint/permission requested or implemented.

## Files

ReportMatchingPanel.tsx; ReportDefectIntake.tsx; useCaseReportMedia.tsx; CitizenTriageRow.tsx; TriageCard.tsx. Existing layout/CSS/sidebar and modules retained. Supporting isolated artifacts under artifacts/matching-clarity-20261127 are not staged. No credentials, cookies or private logs committed. No BE/DB/config changes.

Push verification is reported separately with final HEAD/remote result. Only normal push to origin/hoang authorized.
