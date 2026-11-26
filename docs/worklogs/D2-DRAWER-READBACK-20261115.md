# D2 drawer corrections — 2026-11-15

Baseline 242e57f; preserve all pre-existing tracked/untracked local work, including ReportDefectIntake, reportKeepNewCommands, catalog and triage geometry integration. No BE/C5/C6 edits, live business mutation, fixture or D1 retry changes.

## Runtime evidence and fixes

- API023 receipt req511 created Case 35cd2847-4d58-4331-9525-302cdc5ba22c OPEN, version AAAAAAABOzE=, Report 2440b30e-50a8-4c0d-973a-bf2ad00824dd. GET source 52d2439c-e67f-41b0-862e-0f90637ca3af is OPEN/version AAAAAAABOzM= with only Report 06b93fe6-18d0-4cc6-bebd-4d7ffc888b84. Old source 814be966-bc24-4563-af50-f02beaf94a56 stays LINKED/version AAAAAAABOw0= with no Reports. Do not restore it to OPEN or pretend the new Case is the old source.
- Link/split handlers now apply server readback through existing intake.applyReadback in addition to refreshing list; fence selection/session changes. Report media scope includes authoritative Case version so link/split readback also reloads individual Report membership and private images without F5. API023 receipt and two-Case validation remain in service. No command rewrite.
- LINKED display now says source has transferred reports; empty historical source explains split creates a new Case. Raw LINKED remains unchanged.
- Drawer existing Case summary now shows Case code/status/verification method/project, rather than fabricated aggregate Reporter contact/description placeholders. Individual Report cards exclusively show each server Report identity/contact/description; filter rows by actual Case ID. Header distinguishes Case creation time from Report receipt time.
- GET /cases/9409f2eb-e0e1-4c8e-9c01-1d246f91114d/reports returns description containing literal JSON (nested description/evidence strings). This is stored response data, not FE object serialization. Preserve verbatim text; do not parse file IDs/JSON into metadata or design information.
- Reopened publication modal no longer falsely claims the internal conclusion has never been published; no publication read-history API invented.

## Defect intake BLOCKED — server source pins missing

Existing local GET /api/v1/projects/15d119fe-0c03-4e25-aa5d-95e97ddd881d/candidates?sourceKind=REPORT&sourceId=2440b30e-50a8-4c0d-973a-bf2ad00824dd&pageSize=50 returns HTTP409 source_not_ready (req1232, correlationId 4438c794-3019-4322-af39-04861ae9fa49). Same response for Report 06b93fe6… (req1242, correlationId 8fc154e2-ab2e-40fc-8d15-57ea0ae5a335). ProblemDetails does not supply source.version or geometryVersion.

Read-only SELECT against running roadguard-case409-clean-20261106 SQL confirms GeometryRouteVersionId and GeometrySegmentSetId NULL on all four Case IDs above. Producer GetReportSourceAsync reads those exact shadow fields; ResolveCandidateSourceAsync returns SourceNotReady before computing source version when route/set missing. Do not claim GET alone names the missing shadow field: SELECT plus repository/producer source establishes it.

Project geometry exists independently: work-package200, current route 0b9a06ba-208b-4fd7-85d8-727b591adad0 on section 5bb0367d-2dd7-4ebc-8e0b-5cc16c7f8cbe; segment set b62de51a-d10d-4ed0-a13c-38992dba9360 PUBLISHED; geometry-package200 route/set COMPLETE; ETag "0ff2369e0b413ecb47228ded9d5823578b11f469e4adc32d186875e4b4449bee". Package availability does not authorize substituting its hash for absent candidate source.version/geometryVersion. Existing form guards preserved; no triage of OPEN Cases or candidate-decision mutation. Requires backend/data-owner resolution of missing source pins outside this task.

## Validation

25 D2 service/hook/SSR regressions pass including immediate split snapshot/list, LINKED history, late-response fence, raw JSON and wrong-Case Report filtering. Current local intake15, guard5, source-label6, Defect-intake11 pass. Staged isolated D2/intake/guard regressions, typecheck and diff-check pass. Runtime tab read-only inspection verifies LINKED explanation, Case summary and absence of duplicate Reporter/description placeholders; no alerts. Last parallel staged typecheck hit Node OOM and was rerun sequentially with explicit 4096MB heap; real link/split rerun intentionally NOT_RUN. Reporter delivery remains NOT_VERIFIED.
