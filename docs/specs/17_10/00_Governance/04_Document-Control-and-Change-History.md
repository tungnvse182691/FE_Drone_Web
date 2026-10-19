# Document control and change history

**Current scope Phase 3A-C02 · docs-only WebAuth correction · owner-authorized push on 15/10/2026.** [Canonical entrance](../README.md).

## Phase 3B documentation scope

Owner-authorized Phase 3B at baseline `d5c935bfe00b82ffb9474f222cdc79d329387f39` adds the Reporter React Native + Expo handoff under `06_Mobile-Expo/Reporter/` and necessary canonical navigation/status links. No Backend/API/OpenAPI/DB/tests/Web/Expo source is changed; native/provider/E2E acceptance remains NOT_VERIFIED. Stop after Phase 3B independent JEV review.

## Phase 3A-C02 correction scope

Owner-authorized C02 correction at baseline `b20d455f0e24a101987fc462337885a4dfc0f2d9` rechecks all 51 C01 `TRANSPORT_BLOCKED` mappings against direct WebAuth controller, named scheme, selector and CSRF source. It corrects only documentation matrices, the rerunnable validator and scoped API-contract errata; no Backend/API/OpenAPI/Web/Expo runtime is changed. The C02 report records 6 anonymous-bootstrap mappings, 4 explicit WebCookie mappings and 43 remaining Bearer-only mappings (40 unique endpoints); stop after independent JEV review.

## Phase 3A-C01 correction scope

Owner-authorized correction at baseline `e79cad9098ecfc3f3921ff60d330f978aa7c29ee` scans all 23 Web screens and every Screen–API reference, corrects role mismatches, records Bearer-only Web transport gaps and adds `05_Web/tools/validate_phase3a_c01.py`. No Backend authorization, API/DTO/OpenAPI, Web/Expo source, migration or test changes are allowed. Independent JEV review remains pending; stop after C01.

## Phase 3A authorization and scope

Owner authorized the Web Supervisor/Project Manager integration handoff at baseline `c2b5945d57800fb0e557151bdbf83b60639adcb8` on `huy-review`. Allowed additions are the nine Markdown files under `05_Web/` plus necessary canonical README/governance03–05 navigation/status/crosswalk updates. No Web source, React/TypeScript, Backend source, API/DTO/OpenAPI, migrations or tests are changed. Supervisor/PM remain Web; Reporter/Operator/Crew remain Mobile Expo. Independent JEV review is pending; stop after Phase 3A.

## Phase 2C authorization and scope

Owner authorized the full Backend API contract package at approved baseline `36c3a1d273f17dd29b816136ae0182a821fd79e4` on `huy-review`. Root Codex is the sole writer; allowed additions are the eleven Markdown files under `04_API-Contracts/` plus necessary canonical README/governance03–05 navigation/status/crosswalk updates. Backend source, schema, migrations, tests, OpenAPI, contract locks, prior phases and old docs remain unchanged. Independent JEV review is pending; stop after this push.

## Phase 2B authorization and scope

Owner authorized seven Backend/Data chapters plus PHASE2B_REVIEW_REPORT at approved baseline `1b577d703cda203c6066eba98ff005341739849e` on `huy-review`. Root Codex single writer; allowed additions only `03_Backend-and-Data/` eight Markdown files and necessary canonical README/governance03–05 navigation/status/crosswalk updates. Source/schema/database/migrations/tests/OpenAPI/locks/Phase2A/old docs and seven pre-existing untracked inputs unchanged. [Phase 2B report](../03_Backend-and-Data/PHASE2B_REVIEW_REPORT.md) records actual static checks and NOT_RUN runtime evidence. Independent review PENDING; no Phase2C.

## Phase 2A authorization and scope — historical checkpoint

Owner authorized Phase 2A after Phase 1 PASS, pinned baseline `d91c2e82f1c6feb3a7dcffc4573902314927ae94`, branch `huy-review`. Root Codex is the sole writer for 10 business workflow pages, workflow index and review report under `02_Business-Workflows/`; necessary navigation/status/control/source-registry changes affect only canonical README and governance03–05. Production source, schema, migrations, OpenAPI, tests, contract locks, old docs and the seven pre-existing untracked inputs remain outside scope. No Phase 2B/UI/provider implementation or automatic next phase.

[Phase 2A review report](../02_Business-Workflows/PHASE2A_REVIEW_REPORT.md) records source/API coverage, JEV carry-forward, docs checks, self-review and runtime NOT_RUN. New source pin is byte-identical to the Phase 0 inventory after hash check; it is not new runtime acceptance.

## Phase 1 authorization and allowed files — historical checkpoint

Owner message after successful Phase0 push instructs Codex to run Phase1 and push to `huy-review`, then wait for canonical review before full Backend/Web/Mobile/FastAPI rewrite. This authorizes governance/single entrance/precedence/glossary/client matrix/source registry/crosswalk/link checker. It does not authorize Phase2–5, implementation fixes, generated OpenAPI changes, migrations, lock updates or old-document deletion.

Writer: root Codex for this package. Shared production/code/contracts/tests/root instructions/old docs are unchanged. Pre-existing untracked five loose HHWS audit reports, Reporter Android audit and `docs/frontend/REPORTER-EXPO-HANDOFF.md` preserved and excluded from commit. No concurrent writer assigned to new canonical files.

Allowed additions: canonical README; governance01–05; actor/client matrix; tools/check_links.py. Proposed future section paths appear as non-clickable planned destinations only until their pages are written in separately authorized phases. No duplicate business schema/reference is copied into prose.

## Version and source control

| Date / phase | Authority / baseline | Scope / outcome |
|---|---|---|
|15/10/2026 Phase2C | Owner Phase2B documentation PASS; local/origin approved base `36c3a1d273f17dd29b816136ae0182a821fd79e4`, initial fetch0/0 | Full API contract catalog/guides/review; source/OpenAPI/locks unchanged; independent JEV pending, Phase3 NOT_STARTED |
|15/10/2026 Phase3A | Owner Phase2C documentation PASS; local/origin approved base `c2b5945d57800fb0e557151bdbf83b60639adcb8`, initial fetch0/0 | Web Supervisor/PM handoff, matrices, flows, GIS, errors and acceptance checklist; Web/E2E NOT_VERIFIED, Phase3B/3C NOT_STARTED |
|15/10/2026 Phase2B | Owner Phase2A documentation PASS; local/origin approved base `1b577d703cda203c6066eba98ff005341739849e`, initial fetch0/0 | Seven backend/data chapters + review; necessary links/status only; independent JEV pending, Phase2C NOT_STARTED |
|14/10/2026 Phase0 | Implementation6fdd98d; report commitccf0e70128b857d796a057b0aa30dc6bde4d20c9 | Six audit reports pushed; old/source preserved;0P0confirmed/5P1/7P2checkpoint;16PASS/1FAIL focused tests |
|14/10/2026 Phase2A | Owner Phase1 PASS/Phase2A authorization; approved local/origin base `d91c2e82f1c6feb3a7dcffc4573902314927ae94` | 10 canonical business workflows + index/review; necessary canonical links only; independent review pending, Phase2B NOT_STARTED |
|14/10/2026 Phase1 | User instruction after Phase0; starting local/origin/huy-reviewccf0e70128b857d796a057b0aa30dc6bde4d20c9, fetch ahead/behind0/0 | Establish canonical governance/source registry/matrix/crosswalk/checker; old doc destinations not moved; waiting owner review before Phase2 |

Canonical pages use this baseline/date rather than embedding their own delivery SHA circularly. Final commit/push SHA and remote equality are reported in delivery. No force push/merge/rebase/reset. Commit content limited to allowed files. A record of source SHA is not proof of hosted CI or production deployment.

## Ownership and change policy

| Topic | Decision authority | Documentation/integration responsibility |
|---|---|---|
| Product/business/public compatibility/data policy | Owner | Preserve decision scope/qualifiers, ask only dependent missing decision |
| Technical direction/spec/external diff review | ChatGPT/owner workflow per root guidance | Not automatically performed by Codex self-review |
| Assigned backend source/shared writer | Huy coordinates shared source/spec reservations | Docs task does not edit implementation |
| Web/Mobile/AI consumer implementation | External teams, exact names/repos/ETA UNKNOWN | Consumer contracts/UX labeled proposals until source/runtime verified |
| New canonical Phase1 docs/checker | Root Codex | Two concise self-review passes and focused docs verification |

Existing old “ACTIVE/Official” labels are preserved as checkpoint metadata. Canonical crosswalk marks exact conflicts as stale/superseded; this does not blanket-deprecate all source-backed Backend Official pages or amend AGENTS/assigned workflow.

To update a page, record owner decision if behavior changes, current source/SHA/symbol, scope of runtime results and affected links. Generating a schema from code does not approve compatibility; updating a contract lock needs separate adoption review. Archive/delete requires owner-approved path/link migration; none performed in Phase1.

## Verification and review

Docs checker command from repository root:

```powershell
python docs/HoangHaiWarrantySystem-Official/tools/check_links.py
git diff --cached --check
```

Checker reads canonical Markdown only by default. It verifies inline/reference links and repo-local existence/Markdown-heading anchors after removing fenced code; it handles duplicate heading slugs. External URLs, HTML links, image resources, API access, deployed behavior and every GitHub renderer edge case are not verified. GitHub `#L` source-line fragments are treated as source-file targets rather than Markdown headings. Protected data/secrets are not read or sent to external services.

Meaningful negative controls verify a missing target and nonexistent heading are rejected; positive control verifies a valid canonical heading. Negative controls call the checker function on in-memory Markdown, with no file mutation. Production/runtime suites not run for this docs-only change; prior failures remain recorded in status registry.

Executed Phase1 verification: `check_links.py` reports **7Markdown pages /147local links /0errors**, with0external URLs tested. Temporary verification helper outside repository reports8positive/negative controls passing,0unpublished link targets,7pre-existing untracked files unchanged and1334source hashes unchanged. Crosswalk links all70Backend Official files. No production/runtime test suite rerun; prior Phase0 test/lock failures remain HISTORICAL scoped evidence. Whitespace and staged scope checks are required immediately before commit. Tools/tests do not silently write reports, repair old links, update dependency packages or normalize existing documents.

Self-review1: authority/client/scope/glossary, owner qualifiers vs source/runtime, no new wire/schema/data policy. Self-review2: one entrance/navigation/crosswalk paths, evidence status, writer/scope/old artifacts, link checker positive/negative controls and final staged diff. External review/owner acceptance of full canonical content is pending after delivery.

## Stop and next gate

Phase 2A was accepted for documentation scope by owner. Push Phase 2B, then **STOP** for independent JEV review. API Phase 2C, Web/Mobile and FastAPI implementation remain NOT_STARTED; none are automatically authorized by this push. The Phase 1 verification paragraphs above retain their original scope and are not Phase 2A test results.
