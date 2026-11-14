# D2 Case commands — 2026-11-14

Baseline: hoang / f081e8e; index initially empty. Read AGENTS.md, HEAD/status/diff, relevant untracked API020/evidence/Report code and tests. Other local work stays outside this commit.

Sources: Spec17_10 API020–023 in `04_API-Contracts/02_Full-API-Catalog.md`, `04_Web-Business-Flows.md`, canonical `docs/contracts/openapi.json`; read-only Candidate3 backend CaseWorkflowService/Repository/CasesController under the sibling starter workspace. No BE edits or live mutations.

## Review and changes

- API020: retain current local NO_DEFECT evidence selector/service, receipt/readback and internal-only conclusion; retain CONFIRMED blocked without verified Defect provenance and existing evidence-request flow. Add PM-only guard to legacy concludeCase. These local NO_DEFECT/D1 changes are not swept into this commit.
- API021: replace implicit all-Report recipients with explicit selection from paginated server Report details in existing modal. No default public summary; send no evidence/Defect attachments unless explicitly supplied to service. Validate recipient membership, publication Case/status/version/ETag; GET current Case before acknowledging. Publication receipt proves command acceptance, not device delivery. Do not fabricate publication timestamp.
- API022: connect existing selection/modal handlers and both existing link entry buttons. Require PM, assigned same-project Cases, explicit master/reason; source Report IDs and sourceCaseVersions come from GET. Preserve existing modal/layout and GET server membership/list afterward. Never fabricate local child Cases.
- API023: preserve and commit only relevant existing local Report-details split wiring (actual Report ID, explicit confirmation, PM only), source/new Case readback, plus pending-command recovery after F5. No Case ID/display-code substitution.
- Shared D2 journal keeps exact body/key/If-Match across timeout/F5. A matching explicit confirmation replays an uncertain command; an acknowledged receipt leads only to GET. Different intent cannot replace unknown outcome. Definite HTTP4xx remains visible and does not automatically retry. Session fence runs again at serialization after CSRF preparation. Cookie/CSRF transport remains in apiClient.

## D1 retry follow-up — separate, NOT FIXED

Keep the known D1 retry issue open. In `useCaseIntake.execute`, the running ref is released only when `current()` remains true in finally. Switching Case/session while a command awaits can leave the shared ref locked, preventing a later retry. This is a source finding; runtime reproduction and correction belong to D1. Do not alter D1/C5/C6 or backend in this change.

## Validation

- Production service/hook D2 regression: 15 scenarios pass, including recipient subset, no evidence expansion, source versions, split/new Case, PM/Sup, timeout/F5 replay, receipt/GET failure, malformed receipt and actor fencing.
- Current local: NO_DEFECT 12, evidence-request 18, source/label 6 groups, intake 15, unsupported-bulk/integrated-link guards 5 pass.
- HEAD + D2 index isolated snapshot: D2 15 and intake 14 pass; typecheck pass. Final header/guard changes rechecked before commit; isolated production build passes (existing chunk-size/Tailwind warnings only).
- `check-review-293d001.cjs` remains blocked by baseline missing mock `./triageProjectEligibility`; reproduced against the before-change files. Do not claim that entire legacy suite passes.
- No live POST/PUT/PATCH/DELETE, seed or database manipulation. No browser/DB end-to-end acceptance claimed.

## Manual acceptance still required

1. PM: internal NO_DEFECT/NEEDS_EVIDENCE does not notify Reporter automatically; CONFIRMED source gap stays explicit.
2. Publication: choose one of multiple real Report recipients, verify unselected Reporter receives nothing; check no private evidence leak and actual notification delivery. Repeat after F5/timeout and verify only one publication.
3. Link two same-project Cases via both existing buttons; verify exact Report membership, source-version conflict handling, list refresh and F5.
4. Split one real Report into a new Case; verify source/new membership, evidence provenance and F5. Simulate lost response/GET error; pending recovery must preserve identity or use GET only after receipt.
5. Supervisor read-only; out-of-project/403, stale412, source_not_ready409, empty DB and session switch must show errors without fake success.
