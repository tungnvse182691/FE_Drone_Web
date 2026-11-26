# Intake drawer cleanup and GPS investigation — 27/11/2026

## Scope

FE hoang, preserving all prior commits. BE runtime07a892984cd288bed631ebf98f1b0ba009c44a73. No BE/DB change, no business POST, no test decisions created. Auth attempt in browser returned403 CSRF; existing authorized Supervisor session used for GET-only checks thereafter. No credentials/cookies saved in this report.

## GPS_MISSING: verified cause

Case de63f93f-bc51-490d-992a-a935067aecc7; project9b51bb39-8c5f-43f1-84a2-520a1d8b5eba; Report92632886-cdbf-451e-996c-5c50aef4a185; original evidence27c1d98c-2c78-4a21-b05b-02f7509a92b7; file498e9161-a72b-46d5-9620-9543f30d1236. Only one original image, no supplements in this Case. Browser routing target matches these IDs.

GET /api/v1/cases/{caseId}/reports200, correlation fde721e7-45b4-42fb-8a0c-82e5683cf032: evidence location=null, locationSource=UNKNOWN, capturedAt=null. This endpoint is the actual evidence-detail projection; no separate metadata endpoint was invented.

GET /api/v1/cases/{caseId}/routing-candidates?reportId=92632886-cdbf-451e-996c-5c50aef4a185&evidenceId=27c1d98c-2c78-4a21-b05b-02f7509a92b7 returned200, correlation79d35c55-4dde-453d-9c5b-706772727a2b. source IDs match; latitude/longitude/accuracy/capturedAt=null; candidates=[], missingReasons=[GPS_MISSING], completeness=INCOMPLETE.

Read-only SELECT of ReportOriginalEvidence for that ID confirms CaptureMetadata latitude/longitude/accuracy/capturedAt are SQL NULL, LocationSource=0. Thus source GPS is missing, not FE coordinate swapping or BE dropping a populated value. No GPS borrowed or written, no outside-scope conclusion inferred.

## Changes and field provenance

- RoutingMapView removes project legend ul; keeps all26 route features/colors. Labels only roadSectionName, no project/code/version fallback. Current API has two blank names: routeVersions d6be041b-f4d8-4795-a6dc-652591425b39 and ee8d052a-6574-4ca4-94d9-cafb06fc13f1; their lines remain, labels omitted. No TEST/DEMO name filtering.
- ReportRoutingPanel shows one short GPS-missing notice, technical reason in collapsed details. Business errors/unknown responsibility guards unchanged.
- DrawerMediaViewer omits null/unknown optional metadata. capturedAt is device-claimed capture time; report.receivedAt is labeled reception of report, supplement.receivedAt reception of supplement, never upload/per-image receive time. Accuracy uses finite numeric check, preserving0. GPS source UNKNOWN not shown as an optional value. Image MIME/dimensions/EXIF are not provided in this evidence projection and are not invented.
- DrawerReportDetails omits missing capture/GPS rows and formats Report reception/capture in vi-VN, Asia/Ho_Chi_Minh. DrawerHeader formats Case creation separately, not photo reception.
- useCaseReportMedia preserves shared selected evidence/abort+scope+version behavior; adds valid coordinate range check, keeps0 valid. Marker still uses [longitude,latitude].
- DrawerDecisionForm replaces hardcoded preliminary type with CaseClassification. Type/severity/Defect status are separate from Case conclusion. No longer labels an OPEN Case as necessarily waiting for PM. PM recorded callback remounts classification reader without another mutation.
- triageService.readCaseClassifications GETs current Case, reads every authoritative defectId (not first), validates project/id/version and propagates errors. PM known per-Report decision references are revalidated through existing decision+Defect GET; no guessed matching candidate. Multiple Report decisions no longer become a singular arbitrary linked_defect_id via find(Boolean). Names use allowed catalog hook; Sup retains raw code if catalog not allowed, never hardcoded names.

## Persisted PM classification: BE read blocker, not faked

Read-only SELECT finds active source link Report92632886… -> Defect2cda642e-e41c-4689-a805-2e25a05560de, decision97a647cf-00d5-4b15-9c67-cad43608c51b. These SQL-discovered IDs are investigation evidence only, never embedded in runtime FE.

Yet GET Case returns defectIds=[] and no conclusion. No durable per-Report decision discovery was found in current controller/DTO contracts. Candidate matching history gives sourceLinkCount, not source-link/decision IDs and not proof that an arbitrary candidate is linked.

Supervisor GET /api/v1/projects/9b51bb39-8c5f-43f1-84a2-520a1d8b5eba/candidate-decisions/97a647cf-00d5-4b15-9c67-cad43608c51b ->403 access_forbidden, correlation130e2652-f068-42bb-aeef-55d6bb7a53d6.
Supervisor GET /api/v1/projects/9b51bb39-8c5f-43f1-84a2-520a1d8b5eba/defects/2cda642e-e41c-4689-a805-2e25a05560de ->403 access_forbidden, correlation29f38117-352d-4e5c-94ce-64dcf2b9ac7f.

Therefore full Sup/new-session restoration of this PM classification is BLOCKED by relationship/authority. UI explicitly says API Case has not supplied linked Defects; it does not present Case.UNKNOWN as PM result, pretend PM did not act, or broaden permissions. Existing Case-linked Defects remain readable only if current API authorizes them. Multi-Report Case IDs are labeled Case-level links, not falsely mapped to an individual photo. Backend owner must clarify a permitted persisted relation/projection if Sup must see this data; no new endpoint or guard change implemented.

## Verification

- Browser real Supervisor CAS-DE63F93F: correct image target, one GPS notice, null optional rows omitted, report reception displayed23:31:48 11/11/2026 Vietnam time, route labels are names and legend removed. Reload/F5 reads server again and keeps honest classification blocker.
- Existing Case6ec0936a-060d-407e-b191-78007248413e: original evidenced42a8699-00bc-42d7-acc6-575bba0956c6 has latitude10.8448461/longitude106.8386606; actual map pin shown. Switching to supplement evidence72a964cc-4d33-4fd5-988c-0a5181f4e4cd removes pin, sends selected supplement, shows one GPS notice; metadata distinguishes supplement reception22:33:56 and claimed capture22:33:21 (23/11/2026).
- Browser-only injected image read error: explicit alert remains, map remains; no mutation or server response fabricated as runtime evidence. Restored image service and reloaded afterwards.
- Isolated browser read mocks: multiple Defects preserved with different severities, HTTP error propagated, mismatched Defect rejected,0/0 GPS accepted, invalid latitude rejected:5/5 PASS. Mocks are not business/runtime acceptance.
- Build and diff-check run; build has existing Tailwind duration and large-bundle warnings. No authenticated PM save created for test; actual PM save/new-session Sup success NOT_RUN/BLOCKED as above. Late image/candidate response filtering reviewed in scope+AbortController code; real transport race not forced.
- Browser logged an existing duplicate Case key warning on navigation; left unrelated list behavior unchanged.

Screenshots outside Git: artifacts/intake-20261127/before.png (clean prior commit served on isolated5178), after.png (current5173). Images are real read-only Supervisor UI. Temporary baseline Vite is stopped after capture; current5173 retained.

LOCAL COMMIT ONLY; no push or PR. No BE source/DB/config/permission changes.
