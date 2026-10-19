# Web integration acceptance checklist

**Phase 3A · executable scenarios for a future Web implementation · baseline `c2b5945d57800fb0e557151bdbf83b60639adcb8`.**

These are acceptance scenarios to be run by the Web team later. They are `NOT_VERIFIED_WEB_E2E` in this repository; source presence is not a pass.

| ID | Scenario | Evidence required |
|---|---|---|
| WEB-01 | CSRF bootstrap, login, session, renew, logout | Browser network trace with cookie flags/CSRF and no token leakage. |
| WEB-02 | Supervisor sees unassigned Case, triages, PM cannot bypass triage | Role-separated traces for API-018/024 and denial case. |
| WEB-03 | PM KEEP_NEW/LINK_EXISTING/REJECT | Exact API-059 request DTO, response, audit/history and replay behavior. |
| WEB-04 | Geometry draft edit/preview/confirm conflict | API-177–182 trace, 409/412/428 recovery and no stale overwrite. |
| WEB-05 | GIS road section/version/publish | CRS/geometry rendering screenshot plus API-183–197 trace; segment vs image mask kept distinct. |
| WEB-06 | Survey planning and dataset verification | PM/operator boundary, upload completion and validation response; no fake provider PASS. |
| WEB-07 | FIELD handoff and Crew measurement provenance | PM view of submissions/history; physical measurement remains Crew source. |
| WEB-08 | NORMAL approval/final | PM proposal/assignment → Crew evidence → PM review → Supervisor approval/final, with denied out-of-order commands. |
| WEB-09 | Fast Track boundary | PM final path; Supervisor informational behavior and P2-06 outcome recorded. |
| WEB-10 | Publication/private evidence | Recipient-scoped publication and denied cross-owner evidence download. |
| WEB-11 | K replay/unknown timeout | Drop response after commit, reconcile GET/history, exactly one durable outcome. |
| WEB-12 | Notifications/reporting/export/retention | Scoped reads, export manifest/content and hold/release audit. |
| WEB-13 | Offline coordination surface | Device/artifact/snapshot/reconcile display; no claim Expo crypto/storage acceptance. |
| WEB-14 | Accessibility/responsive/browser support | Keyboard/focus/labels, viewport matrix and security headers from deployment. |

No test command is run by Phase 3A because no Web client is present. Backend/API/SQL/Live GIS/MinIO/SMTP/FastAPI suites remain `NOT_RUN` here.
