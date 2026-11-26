| Service FE (`src/api/services/…`) | API BE được gọi (xấp xỉ theo mã nguồn) |
|---|---|
| `acceptanceService.ts` | `GET /projects/{}/field-inspection-tasks/{}`<br>`POST /projects/{}/repair-packages/{}/items/{}/tasks/{}/attempts/reviews`<br>`GET /projects/{}/repair-packages/{}/items/{}`<br>`GET /projects`<br>`GET /projects/{}/repair-packages`<br>`GET /projects/{}/repair-packages/{}/items`<br>`GET /projects/{}/repair-packages/{}/items/{}/history`<br>`POST /projects/{}/repair-packages/{}/items/{}/final-confirmation` |
| `aiRunDetailService.ts` | `GET /projects/{}/ai-mock-runs/{}` |
| `alignmentService.ts` | `GET /projects/{}/work-package`<br>`GET /projects/{}/road-geometry-drafts/{}/readiness`<br>`GET /projects/{}/road-sections/{}/versions/{}/geometry`<br>`GET /projects/{}/crs-profiles`<br>`GET /projects/{}/route-systems`<br>`GET /projects/{}/crs-profiles/{}`<br>`POST /projects/{}/crs-profiles`<br>`GET /projects/{}/geometry-package` |
| `candidate3ValidationService.ts` | `GET /projects/{}/ai-mock-runs/{}/result` |
| `caseEvidenceRequestService.ts` | `POST /cases/{}/conclusions` |
| `caseNoDefectService.ts` | `POST /cases/{}/conclusions` |
| `caseReportService.ts` | `GET /cases/{}/reports` |
| `caseScopeService.ts` | `POST /cases/{}/triage` |
| `constructionLifecycleService.ts` | `POST {}/{}` |
| `coverageDocumentService.ts` | `POST /uploads`<br>`GET /uploads/{}`<br>`POST /uploads/{}/part-urls`<br>`POST /uploads/{}/complete`<br>`GET /files/{}`<br>`GET /projects/{}/road-coverage` |
| `dashboardService.ts` | `GET /projects/{}/clocks`<br>`POST /projects/{}/clocks/{}/extensions` |
| `defectGeoService.ts` | `GET /projects/{}/geometry-package` |
| `defectLifecycleService.ts` | `GET /projects/{}/repair-packages/{}/items/{}/source-defect`<br>`POST {}/defect-closures` |
| `defectRecurrenceService.ts` | `GET /projects/{}/lifecycle` |
| `defectStatisticsService.ts` | `GET /projects/{}/defect-statistics`<br>`POST /projects/{}/defect-statistics` |
| `defectTypeAdminService.ts` | `GET /catalog/defect-types/admin`<br>`POST /catalog/defect-types/admin`<br>`PUT /catalog/defect-types/admin/{}` |
| `defectTypeCatalog.ts` | `GET /catalog/defect-types` |
| `dutyService.ts` | `GET /projects`<br>`GET /projects/{}/receiving-requests`<br>`GET /projects/{}/receiving-requests/{}`<br>`POST /projects/{}/receiving-requests/{}/ack`<br>`POST /projects/{}/receiving-requests/{}/appointment`<br>`GET /projects/{}/clocks`<br>`POST /projects/{}/clocks/{}/appointments`<br>`GET /projects/{}/weekly-digests/{}` |
| `fastTrackFormSources.ts` | `GET /projects/{}/field-inspection-tasks/{}`<br>`GET /projects/{}/defects/{}`<br>`GET /projects/{}/road-sections/{}/versions/{}/geometry`<br>`GET /projects/{}/pavement-layouts/{}`<br>`GET /projects/{}/geometry-map-publications/{}` |
| `fastTrackService.ts` | `(?) /projects/{}/road-coverage`<br>`(?) /projects/{}/repair-policies/{}/{}`<br>`(?) /projects/{}/repair-policies`<br>`(?) /projects/{}/repair-policies/drafts`<br>`(?) /projects/{}/repair-policies/drafts/{}`<br>`(?) /projects/{}/repair-policies/revisions/{}/revoke`<br>`(?) /projects/{}/repair-policies/drafts/{}/publish`<br>`(?) /projects/{}/defects/{}`<br>`(?) /projects/{}/repair-packages`<br>`(?) /projects/{}/repair-packages/{}/items`<br>`(?) /projects/{}/repair-packages/{}/items/{}`<br>`(?) /projects/{}/field-inspection-tasks/{}` |
| `fieldCreateCommands.ts` | `GET /projects/{}/defects`<br>`GET /projects/{}/defects/{}`<br>`GET /projects/{}/road-sections/{}/versions/{}/geometry`<br>`POST /projects/{}/field-inspection-tasks` |
| `fieldEvidenceReuseCommands.ts` | `GET /cases`<br>`GET /projects/{}/field-inspection-tasks/{}/evidence/{}`<br>`POST /projects/{}/field-inspection-tasks/{}/evidence-reuse` |
| `fieldReviewCommands.ts` | `POST /projects/{}/field-inspection-tasks/{}/reviews` |
| `fieldTaskActions.ts` | `POST /projects/{}/field-inspection-tasks/{}/{}`<br>`POST /projects/{}/field-inspection-tasks/{}/location-impact-decisions` |
| `fieldTaskReadService.ts` | `GET {}/content`<br>`GET /projects/{}/field-inspection-tasks/{}`<br>`GET /projects/{}/field-inspection-tasks/{}/history`<br>`GET /projects/{}/field-inspection-tasks/{}/submissions/{}` |
| `fieldTaskService.ts` | `GET /projects/{}/field-inspection-tasks`<br>`GET /projects/{}/field-inspection-tasks/{}`<br>`POST /projects/{}/field-inspection-tasks` |
| `geometryImpactService.ts` | `GET /projects/{}/geometry-location-impacts`<br>`GET /projects/{}/geometry-location-impacts/{}`<br>`GET /projects/{}/geometry-map-publications/{}`<br>`GET /projects/{}/geometry-map-publications/{}/layers/{}` |
| `geometrySubmissionService.ts` | `GET /projects/{}/road-geometry-submission`<br>`POST /projects/{}/road-geometry-drafts/{}/submit`<br>`POST /projects/{}/road-geometry-drafts/{}/reject` |
| `handoverUploadService.ts` | `GET /uploads/{}`<br>`POST /uploads/{}/part-urls`<br>`POST /uploads/{}/complete`<br>`GET /projects/{}/road-coverage`<br>`POST /projects/{}/handover-documents` |
| `invitationAcceptService.ts` | `POST /invitations/preview`<br>`POST /invitations/accept` |
| `lifecycleRenewService.ts` | `GET /projects/{}/lifecycle`<br>`POST /projects/{}/lifecycle/renewed-handling-scope` |
| `mapPublicationService.ts` | `GET /projects/{}/geometry-map-publications/{}`<br>`POST /projects/{}/geometry-map-publications`<br>`GET /projects/{}/geometry-map-publications/{}/layers/{}` |
| `notificationService.ts` | `POST /notifications/read-batch`<br>`GET /notifications`<br>`GET /notifications/{}`<br>`GET /notifications/{}/scope`<br>`POST /notifications/{}/read` |
| `notificationSupervisorService.ts` | `(?) /projects/{}/repair-packages/{}/items/{}/notification-supervisor` |
| `obligationTransferService.ts` | `(?) /projects/{}/lifecycle` |
| `offlineCoordinationService.ts` | `GET /projects/{}/offline/{}`<br>`POST /projects/{}/offline/{}/{}/revoke` |
| `pavementService.ts` | `GET /projects/{}/road-sections/{}/versions/{}/segment-sets/{}/pavement-layouts`<br>`GET {}/{}`<br>`GET /projects/{}/road-sections/{}/versions/{}/segment-sets/{}`<br>`POST /projects/{}/route-versions/{}/segment-sets/{}/pavement-plans`<br>`POST /projects/{}/pavement-layouts/as-built`<br>`GET /projects/{}/pavement-layouts/{}` |
| `personnelDetailRead.ts` | `GET /projects/{}/members`<br>`GET /projects/{}/primary-project-manager` |
| `personnelScreen.ts` | `GET /projects` |
| `personnelService.ts` | `GET /users`<br>`GET /users/{}`<br>`PATCH /users/{}`<br>`POST /users/{}/password-reset`<br>`POST /invitations`<br>`GET /projects/{}/primary-project-manager`<br>`PUT /projects/{}/primary-project-manager`<br>`GET /projects/{}/members/eligible`<br>`POST /projects/{}/members`<br>`PATCH /users/{}/phone-number` |
| `profileService.ts` | `GET /profile`<br>`PUT /profile`<br>`PATCH /me/phone-number` |
| `projectExportService.ts` | `GET /projects/{}/exports`<br>`GET /projects/{}/exports/{}`<br>`GET /projects/{}/exports/{}/manifest`<br>`GET /projects/{}/exports/{}/content`<br>`POST /projects/{}/exports` |
| `projectReportingService.ts` | `GET /projects/{}/reports/summary`<br>`GET /projects/{}/reports/items`<br>`GET /projects/{}/reports/timeline`<br>`GET /projects/{}/road-sections/{}/versions/{}/geometry`<br>`GET /projects/{}/road-sections/{}/versions/{}/segment-sets/{}` |
| `projectServerFacts.ts` | `GET /projects/{}/work-package`<br>`GET /projects/{}/primary-project-manager`<br>`GET /projects/{}/road-sections/{}/versions/{}/geometry` |
| `projectService.ts` | `GET /projects`<br>`GET /projects/overviews`<br>`GET /projects/{}/repair-packages`<br>`GET /projects/{}/members`<br>`GET /projects/{}/member-contacts`<br>`POST /projects`<br>`GET /projects/{}/work-package`<br>`GET /projects/{}/lifecycle`<br>`POST /projects/{}/lifecycle/operational-closures` |
| `projectUpdateService.ts` | `GET /projects/{}/work-package`<br>`PUT /projects/{}` |
| `projectWarrantyService.ts` | `GET /projects/{}/work-package`<br>`GET /projects/{}/road-coverage`<br>`POST /projects/{}/warranties` |
| `proposalReadModel.ts` | `GET /projects/{}/repair-packages/{}/planning`<br>`GET /projects/{}/repair-packages/{}/items/{}/planning` |
| `publicPublicationService.ts` | `POST /projects/{}/defects/{}/publications`<br>`POST /projects/{}/publications/{}/withdraw`<br>`GET /public/publications/{}` |
| `repairItemActions.ts` | `POST {}/{}` |
| `repairSafetyService.ts` | `GET /projects/{}/road-coverage`<br>`GET {}/{}`<br>`GET /projects/{}/repair-packages/{}/items/{}` |
| `repairService.ts` | `POST /projects/{}/repair-packages`<br>`GET /projects/{}/defects`<br>`POST /projects/{}/repair-packages/{}/items`<br>`POST /projects/{}/repair-packages/{}/items/{}/approve`<br>`GET /projects`<br>`GET /projects/{}/repair-packages`<br>`GET /projects/{}/repair-packages/{}/items`<br>`GET /projects/{}/defects/{}`<br>`GET /projects/{}/work-package`<br>`GET /projects/{}/road-sections/{}/versions/{}/segment-sets`<br>`POST {}/assign`<br>`POST /projects/{}/repair-packages/{}/items/{}/assign`<br>`POST /projects/{}/repair-packages/{}/items/{}/final-confirmation` |
| `repairWorkflowService.ts` | `GET /projects/{}/road-coverage`<br>`GET /projects/{}/repair-packages/{}/items/{}/eligibility`<br>`GET /projects/{}/defects`<br>`GET /projects/{}/defects/{}`<br>`POST /projects/{}/repair-packages`<br>`POST /projects/{}/repair-packages/{}/items`<br>`GET /projects/{}/repair-packages/{}/items/{}`<br>`GET /projects/{}/repair-packages/{}/items/{}/history` |
| `reportKeepNewCommands.ts` | `GET /projects/{}/candidate-decisions/{}`<br>`GET /projects/{}/defects/{}`<br>`GET /projects/{}/candidates`<br>`POST /projects/{}/candidate-decisions` |
| `retentionService.ts` | `GET /projects`<br>`GET /projects/{}/work-package`<br>`GET /retention/holds/{}`<br>`POST /retention/holds`<br>`POST /retention/holds/{}/release`<br>`GET /projects/{}/retention/evaluations`<br>`GET /projects/{}/retention/files/{}`<br>`PUT /projects/{}/retention/files/{}/basis`<br>`POST /projects/{}/retention/evaluations`<br>`GET /projects/{}/retention/evaluations/{}` |
| `roadSectionCommands.ts` | `GET /projects/{}/work-package`<br>`GET /projects/{}/road-sections/{}/versions/{}/geometry` |
| `routeSystemCommands.ts` | `GET /projects/{}/work-package`<br>`POST /projects/{}/route-systems` |
| `segmentSetService.ts` | `GET {}/{}`<br>`POST {}/preview`<br>`PUT {}/{}`<br>`POST {}/{}/publish` |
| `sourceVideoService.ts` | `GET /files/{}`<br>`GET /files/{}/content` |
| `supDashboardService.ts` | `GET /projects`<br>`GET /projects/overviews`<br>`GET /projects/{}/reports/timeline` |
| `surveyActions.ts` | `POST /survey-plans/{}/postpone`<br>`POST /survey-tasks/{}/cancel`<br>`POST /survey-tasks/{}/reassign`<br>`POST /survey-tasks/{}/supplements` |
| `surveyCreateCommands.ts` | `POST /projects/{}/survey-plans`<br>`POST /projects/{}/survey-tasks` |
| `surveyDatasetService.ts` | `GET /projects/{}/geometry-package`<br>`GET /datasets/{}`<br>`GET /datasets/{}/coverage`<br>`GET /survey-tasks/{}/datasets`<br>`GET /survey-tasks/{}/work-package`<br>`GET /datasets/{}/assessments/{}`<br>`POST /datasets/{}/assessments`<br>`GET /projects/{}/baseline-selections`<br>`POST /projects/{}/baseline-selections`<br>`GET /projects/{}/baseline-selections/{}`<br>`GET /projects/{}/processing-jobs`<br>`GET /processing-jobs/{}`<br>`POST /processing-jobs`<br>`GET /projects/{}/ai-mock-runs`<br>`POST /projects/{}/ai-mock-runs`<br>`POST /processing-jobs/{}/retry` |
| `surveyPlanningService.ts` | `GET /projects/{}/geometry-package` |
| `surveyService.ts` | `GET /projects/{}/ai-mock-runs/{}/result`<br>`GET /projects/{}/ai-candidates/{}`<br>`GET /projects/{}/candidate-decisions/{}`<br>`GET /projects/{}/candidates`<br>`GET /projects/{}/ai-mock-runs/{}`<br>`POST /projects/{}/candidate-decisions`<br>`GET /projects/{}/defects`<br>`GET /projects/{}/defects/{}`<br>`POST /projects/{}/defects/{}/assessments`<br>`POST /projects/{}/defects/{}/verification-decisions`<br>`GET /files/{}`<br>`GET /files/{}/content` |
| `taskAssigneeService.ts` | `GET /projects/{}/task-assignees` |
| `trainingLabelService.ts` | `GET /projects/{}/labels`<br>`GET /projects/{}/labels/{}`<br>`GET /projects/{}/ai-candidates/{}`<br>`POST /projects/{}/labels`<br>`POST /projects/{}/labels/{}/revisions`<br>`POST /labels/{}/review`<br>`GET /files/{}/content` |
| `triageGeometryService.ts` | `GET /projects/{}/work-package`<br>`GET /projects/{}/road-sections/{}/versions/{}/segment-sets`<br>`GET /projects/{}/geometry-package` |
| `triageProjectEligibility.ts` | `GET /projects`<br>`GET /projects/{}/primary-project-manager`<br>`GET /projects/{}/work-package` |
| `triageService.ts` | `POST /cases/{}/{}`<br>`GET /cases`<br>`GET /cases/{}`<br>`POST /cases/{}/triage`<br>`GET /projects`<br>`POST /cases/{}/conclusions` |
| `validationService.ts` | `GET /projects`<br>`GET /projects/{}/ai-mock-runs`<br>`POST /projects/{}/ai-mock-runs`<br>`GET /projects/{}/ai-mock-runs/{}/result`<br>`POST /projects/{}/validation-runs`<br>`GET /validation-runs/{}` |
