# Hide candidate presentation in shared intake form — 27/11/2026

Base9ea22c30784cd1a9b21e504d92e66a509b3c620c, branch hoang. FE presentation only; no business decision, BE/DB/permission/API change, push or PR.

## Change

ReportRoutingPanel.tsx: removed CandidateList and its purely presentational helpers, heading/recheck button/loading text/warning/list/distance/technical accordions and now-unused list navigation callback. No hidden accordion, tooltip or placeholder container replaces them. This shared panel is used by ReviewDetailDrawer through ReviewDetailModal on both PM/Sup inbox routes; PhotoZoomModal does not separately render candidates. Caller layouts, photo/classification and intake decision form retained.

Candidate GET remains scoped to current evidence with AbortController, pagination handled by unchanged routingMapService, and current evaluationVersion still passed to RoutingDecisionBlock. A failed read still renders an alert and retry, not fake success. Missing/incomplete data is never changed to eligible. All shared services and map code remain intact, including worker fix, name-only route label buttons, photo marker and PhotoMapButton.

The source of RoutingDecisionBlock from its function declaration to EOF is byte-equivalent after newline normalization to base9ea22c3. SHA2562333b1465b2fdc4c6abfd51738d0e6f1b0788bf3a639687b3be406ddf4bccef8. Thus actual decision fields, guard predicates, request identity/replay and error messages were not modified. No new editable state or route decision introduced.

## Executed validation

- npm run build (tsc -b + Vite): PASS. Existing Tailwind duration-[250ms] and large-bundle warnings remain.
- git diff --check: PASS.
- Isolated authenticated browser with existing Supervisor and PM-B data:7 checks PASS: no candidate presentation/accordion in shared modal; candidate GET still made; photo navigation emphasizes marker; name-label click highlights exact route and queryRenderedFeatures proves actual geometry; zoom has no candidate diagnostics; missing-GPS Case keeps photo action disabled and no stale marker; PM shared form also hides blocks without requesting company map.
- Tested existing GPS/many-candidate Case6ec0936a-060d-407e-b191-78007248413e and no-GPS Case de63f93f-bc51-490d-992a-a935067aecc7; PM-B Case ac20135f-fdc4-4281-b0b9-444011e3721b. IDs only in evidence, not application logic.
- No readable UNASSIGNED fixture returned in the optional query, so fresh editable decision submission was not tested or created. Form/guard invariance checked directly as above. No claim of mutation E2E acceptance.

## Screenshots / artifacts (not committed)

- artifacts/intake-hidden-20261127/after-gps.png
- artifacts/intake-hidden-20261127/after-no-gps.png
- artifacts/intake-hidden-20261127/after-pm.png
- Browser checks/results.json in same directory; credentials only read in process memory for normal login, no token/cookie export.

Only shared panel source and this report staged. Existing artifacts and commits preserved. Current user server5173 retained. LOCAL COMMIT ONLY, NO PUSH.
