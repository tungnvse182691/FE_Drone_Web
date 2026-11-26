# Intake PM/Sup compact routing and map navigation — 27/11/2026

Base cf749c584bf1881e633e3c8858102ef9879336b0, branch hoang. FE only; prior commits preserved. No API/DB/permission/backend modification, no business decision created, no push/PR.

## Components/callers reviewed

- AIReviewInbox provides one CaseReportMediaProvider for drawer/detail modal and ReviewModals/PhotoZoomModal. PM and Sup routes reuse this screen; inbox cards/rows do not render candidate diagnostics, so no unrelated list redesign.
- ReviewDetailModal delegates to ReviewDetailDrawer, which mounts ReportRoutingPanel keyed by Case and DrawerMediaViewer. Wrapper caller signatures remain intact.
- ReportRoutingPanel/CandidateList changed: all candidates retained in native details summary with count, default closed per selected evidence; compact row shows route name, available distance and responsibility-unknown warning. Algorithm/method/scope/version/hash/IDs/missing reasons and pins kept in closed diagnostic details. One warning when basis incomplete; no TEST/DEMO filtering or UNKNOWN-to-eligible conversion. Removed the duplicate per-route highlight button strip.
- PhotoMapButton added and shared by DrawerMediaViewer and PhotoZoomModal. Uses current provider evidence only. Reporter-facing label is position of report image, not verified defect location; missing/invalid coords disable action. Zoom closes on navigation, exposing shared underlying map. AI drone/bbox/Case GPS never used.
- useCaseReportMedia adds scoped evidence-keyed photo navigation intent; stale intent not applied across Case/evidence/version/actor scope.
- RoutingMapView preserves lines/colors and name-only labels, now real buttons with exact routeVersionId. Candidate and label navigation highlight+fit exact geometry, never select project/triage. Explicit photo intent scrolls panel, flyTo [longitude,latitude], enlarges current marker. Initial fit is not reset after explicit navigation/reloads. Selection switch clears old highlight/marker and suppresses old geometry results.
- Sup reads permitted company snapshot. PM never requests /company/road-map; a selected route can use existing GET /projects/{projectId}/road-sections/{roadSectionId}/versions/{routeVersionId}/geometry. Validates exact project/section/version; uses real WGS84 LineString or existing supported EPSG32648 adapter, otherwise reports unavailable geometry. No name matching or conversion to current version.

## Verification (own isolated browser; no business POST)

Real existing Supervisor Case6ec0936a-060d-407e-b191-78007248413e returns28 candidates. Images/candidates remain tied to Report82394378-f895-4dae-a515-eedfb5c6b646. Original evidenced42a8699-00bc-42d7-acc6-575bba0956c6 has GPS10.8448461,106.8386606; supplementary evidence72a964cc-4d33-4fd5-988c-0a5181f4e4cd has no GPS. CaseDE63F93F is the no-GPS branch from prior investigation. IDs appear only in test evidence, not product code.

Browser checks15/15:28 retained/default collapsed; photo center order and emphasis; candidate exact-version bounds/highlight; map-label exact-version highlight; duplicate names independent; GPS-to-no-GPS clears pin/disables button; return to original restores pin; F5 collapsed; Case switch no old pin; actual historical version20e074ba-75d2-4194-a46c-b32284fc3252 retained; missing names no fallback; missing geometry short error; zoom navigation; zero coords accepted; PM scope with no company-map call.

Missing-geometry check is an isolated frontend read-error injection using an existing candidate, not evidence backend lacks that geometry. Zero0/0 coordinate check injects metadata in isolated browser only; no DB update. Other checks above use existing authorized records. Two actual map features lack roadSectionName; line data retained, labels omitted. Duplicate names are not used as identity.

PM-B opens readable Caseac20135f-fdc4-4281-b0b9-444011e3721b; shared panel mounts without global map request. PM route-positive flyTo on real nonempty candidates was not available in this fixture; common map interaction checked via Sup. No new permissions or accounts created.

Browser harness lives outside Git under artifacts/intake-compact-20261127; uses an isolated browser and existing account file in memory, no credential or cookie export. An initial cookie-transfer approach was rejected by tool policy and abandoned; actual checks used normal login form in separate browser contexts. Built-in screenshot tool stalled; captures used the isolated browser instead.

Initial harness bugs (module resolution, cookie deletion, inability to find an unmatched candidate after enabling all history) were corrected; the missing-geometry error is now explicitly injected. No failed harness run claimed as product PASS. Final checks.json contains individual outcomes.

## Build/review/limits

npm run build (tsc -b + Vite) and git diff --check executed. Existing duration-[250ms] ambiguity and large-bundle warnings remain. Review passes: checked no mutation/auto-selection/no fallback GPS or route name; checked request-scope and generation guard so late geometry cannot override a newer label/route click. Existing cf749c5 classification relationship/403 blocker remains unchanged; no claim this task fixes backend classification discovery.

Real transport delay race and every PM project/CRS combination not exhaustively tested. Unsupported geometry reports a visible error, never invented coordinates. No live decisions, seed or full mutation E2E run.

## Before/after screenshots

Before served from a clean detached cf749c5 worktree on temporary5178; after from current workspace hoang5173. Temporary before server stopped after capture. Pictures kept outside Git:

- artifacts/intake-compact-20261127/before-none.png / after-none.png
- artifacts/intake-compact-20261127/before-many.png / after-many.png
- artifacts/intake-compact-20261127/pm.png

Current user server remains5173. Only feature source and this report staged; artifacts/secrets/dependencies untouched by commit. LOCAL ONLY.
