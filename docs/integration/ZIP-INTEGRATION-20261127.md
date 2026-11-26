# ZIP integration — 27/11/2026

## Scope

Imported delivered FE source from FE_Drone_Web-hoang.zip / FE_Drone_Web-hoang/FE_Drone_Web-hoang. Read AGENTS and H1–H4/UI handoff plus Bổ sung_2.txt; no extra proposal implemented.

Local target hoang from ea5062f after fetch. Original refactor_UI workspace and all tracked-file hashes remain unchanged. Worktree: D:/hoctap/kì 9/vnr202/FE-hoang-integration-20261127. Do not overwrite original UI WIP with this tree.

## Delivered features

Reporter routing/matching; repair review/submission history/evidence reuse; responsibility-scoped repair export and safety resolution; Fast Track policy/detail; offline ownership/expiry/journal/readback/fingerprint; warranty deadlines, branch status; delivered profile/password/lightbox/CSS/page transitions. No redesign.

## Environment/exclusions

Proxy preserved at https://localhost:28443, auth/client Web cookie/CSRF unchanged. Local ignored env copied from original workspace, not ZIP. package and lockfile identical to hoang base: no version change. Refactor_UI dependency/UI edits kept outside commits. No Docker/BE/DB/migration/seed changes.

Excluded ZIP env, node_modules/dist/cache/tsbuildinfo/tmp, seed state, screenshots/results, machine-specific probe/debug/seed scripts and tools/e2e/run.sh container-default change. Kept two H4 non-mutating logic scripts. No tracked file absent from ZIP, no deletion.

## Checks actually run

- npm ci --ignore-scripts --no-audit --no-fund: PASS, unchanged lockfile.
- npm run build: PASS (tsc -b, Vite 2131 modules); duration-[250ms] ambiguity and large bundle warnings remain.
- Integration login mounts. Browser module checks: 11/11 PASS for grant/device state, readback, SHA256 recipient fingerprint and warranty boundaries/unknown/max. No live mutation.
- check-field-review-api.cjs: 4 groups PASS (mocked HTTP).
- check-field-read-api.cjs: FAIL after 3 groups, missing mock taskAssigneeService; HEAD baseline same failure.
- check-field-evidence-reuse.cjs: FAIL after 2 groups, mock lacks history used by delivered server readback. Baseline passes 6 groups then fails missing ReuseSavedResult. ZIP did not update this harness; no bypass or assertion weakening. Not a regression-suite PASS.
- Working/staged git diff --check checked before commits. Incoming selected files scanned for private-key/JWT/literal credentials: no matches.
- Original tracked-file hashes preserved; no user WIP staged.

No full regression/E2E/visual acceptance claim. Authenticated routing/safety/export/offline grant, F5/recovery and protected-page runtime retests NOT_RUN; ZIP historical evidence is from another environment. Backend compatibility not asserted from build. No backend switch/seed to satisfy tests.

LOCAL commits only; no push/tag/PR.
