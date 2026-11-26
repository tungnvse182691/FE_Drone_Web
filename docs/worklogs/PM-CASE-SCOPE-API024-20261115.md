# PM assigned Case scope via API024 — 2026-11-15

Baseline 2740e4e, initial index empty. Read AGENTS/status/diff/untracked and runtime b89a52fe11ed source/Swagger. No BE/SQL/C5/C6 edits, fixtures or live mutation. Sup triageCase remains SUPERVISOR/UNASSIGNED-only; no blanket permission change.

## Change

- Separate caseScopeService request for PM only, assigned OPEN/AWAITING_EVIDENCE, fixed current project. Reuse existing intake modal and TriageGeometryScope. PM chooses method/reason/route/PUBLISHED set explicitly; no method/scope default, project selector read-only. Sup target-project flow remains separate.
- Before first POST: GET authorized Case, compare exact caller ETag and project/status; reread work-package/current route/PUBLISHED set and geometry-package/hash. A changed ETag or hash stops before POST; no substitution of new pins/version behind user confirmation.
- POST /cases/{id}/triage sends only CaseTriageDto plus If-Match/Idempotency-Key through existing cookie/CSRF apiClient. Separate actor/Case journal preserves immutable request across timeout/F5. A replay403/4xx cannot resolve earlier uncertainty. Received receipt only GETs; malformed receipt/current readback leaves journal. Definite first rejection offers existing read/review path for explicit new intent.
- Readback updates snapshot/list/version and Report media version scope; existing ReportDefectIntake rereads candidates. Actual source.version/geometryVersion remain required;409 never falls back to package hash or mock.
- Remove inaccurate OPEN-case message claiming no update command. User-facing entry is Cập nhật phạm vi in the existing Case summary.

## Existing local code included only as required dependencies

TriageGeometryScope/triageGeometryService and ReportDefectIntake/reportKeepNewCommands/defectTypeCatalog were untracked local work. Include these exact scope/intake dependencies so the committed PM entry and blocked Defect flow run without uncommitted modules. Existing Defect transport/form remains intact except source reread on Case version and corrected guidance. DrawerDecisionForm stages only import/render binding; unrelated local layout/source labels, NO_DEFECT/evidence changes remain unstaged. Do not sweep other project/survey/personnel/local work into this commit.

## Verification

PM API024 regression groups: PM OPEN/AWAITING_EVIDENCE; Sup denied PM service; Sup intake tests unchanged; foreign project/UNASSIGNED/CONCLUDED/LINKED; stale ETag/hash; incomplete explicit inputs/current route/set;403 read; exact DTO/key/version; committed timeout then403/F5; receipt GET recovery only; rejected412 explicit review; malformed receipt/readback; epoch/double click; production intake snapshot/list; fixed-project modal; candidate409 remains blocked. 11 PM scope regression groups pass; existing Sup intake14, D2 25, guard5, evidence-request18 pass on isolated staged tree. Local geometry-scope8 and Defect-intake12 pass. Typecheck/diff-check pass. Browser read-only opening verifies PM header, locked current project, empty method/reason/scope and disabled confirmation; no real POST024. Isolated tests do not prove deployed POST success.

Manual acceptance still needed: PM opens existing Case, explicitly chooses method/reason/current route/PUBLISHED set, confirms once; inspect API024 receipt+GET and then candidates200 or exact409. Verify no reassignment, updated version/snapshot/list, and only actual candidate pins enable Defect. Repeat AWAITING_EVIDENCE; confirm Sup unassigned assignment still works. User performs mutations; timeout/F5 recovery must retain original identity.
