# RoadGuard — Operation catalog từ baseline

Nguồn đề xuất R3; path tính từ `/api/v1`. Catalog sinh tự động, không chứng minh endpoint đã triển khai.

| Operation ID | Method / path | Role | Request schema | Success schema | Required headers |
|---|---|---|---|---|---|
| login | POST `/auth/login` | PUBLIC | LoginRequest | 200: TokenPair | — |
| refreshTokens | POST `/auth/refresh` | PUBLIC | RefreshRequest | 200: TokenPair | — |
| logout | POST `/auth/logout` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 204: không body | Idempotency-Key |
| requestPasswordRecovery | POST `/auth/password-recovery-requests` | PUBLIC | ForgotPassword | 202: không body | — |
| changePassword | POST `/auth/change-password` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | ChangePassword | 204: không body | Idempotency-Key |
| registerReporter | POST `/auth/reporter-registrations` | PUBLIC | RegisterReporter | 202: RegistrationIntent | Idempotency-Key |
| verifyReporterOtp | POST `/auth/reporter-registrations/verify` | PUBLIC | VerifyOtp | 200: TokenPair | Idempotency-Key |
| resendReporterOtp | POST `/auth/reporter-registrations/resend` | PUBLIC | ResendOtp | 202: RegistrationIntent | Idempotency-Key |
| acceptInvitation | POST `/invitations/accept` | PUBLIC | AcceptInvitation | 200: TokenPair | Idempotency-Key |
| createInvitation | POST `/invitations` | SUPERVISOR | InvitationRequest | 201: Invitation | Idempotency-Key |
| getMe | GET `/me` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: Actor | — |
| updateMe | PATCH `/me` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | ProfileUpdate | 200: Actor | Idempotency-Key, If-Match |
| adminResetPassword | POST `/users/{userId}/password-reset` | SUPERVISOR | ResetPassword | 204: không body | Idempotency-Key |
| updateAccount | PATCH `/users/{userId}` | SUPERVISOR | AccountUpdate | 200: Actor | Idempotency-Key, If-Match |
| getAccount | GET `/users/{userId}` | SUPERVISOR | — | 200: Actor | — |
| listNotifications | GET `/notifications` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: NotificationPage | — |
| readNotification | POST `/notifications/{notificationId}/read` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: Notification | Idempotency-Key, If-Match |
| listProjects | GET `/projects` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: ProjectPage | — |
| createProject | POST `/projects` | SUPERVISOR | ProjectCreate | 201: Project | Idempotency-Key |
| getProject | GET `/projects/{projectId}` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: Project | — |
| updateProject | PATCH `/projects/{projectId}` | SUPERVISOR | ProjectUpdate | 200: Project | Idempotency-Key, If-Match |
| closeProject | POST `/projects/{projectId}/close` | SUPERVISOR | Reason | 200: Project | Idempotency-Key, If-Match |
| setMembership | POST `/projects/{projectId}/memberships` | SUPERVISOR | MembershipRequest | 201: Membership | Idempotency-Key |
| listCrews | GET `/projects/{projectId}/crews` | SUPERVISOR, PM | — | 200: CrewPage | — |
| createCrew | POST `/projects/{projectId}/crews` | SUPERVISOR | CrewCreate | 201: Crew | Idempotency-Key |
| createRouteDraft | POST `/projects/{projectId}/route-drafts` | PM | RouteDraftRequest | 201: RouteVersion | Idempotency-Key |
| getRouteVersion | GET `/route-versions/{routeVersionId}` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: RouteVersion | — |
| updateRouteDraft | PUT `/route-versions/{routeVersionId}/draft` | PM | RouteDraftRequest | 200: RouteVersion | Idempotency-Key, If-Match |
| confirmRoute | POST `/route-versions/{routeVersionId}/confirm` | SUPERVISOR | — | 200: RouteVersion | Idempotency-Key, If-Match |
| previewSegmentSet | POST `/projects/{projectId}/segment-set-previews` | PM | SegmentRequest | 201: SegmentSet | Idempotency-Key |
| publishSegmentSet | POST `/segment-sets/{segmentSetId}/publish` | PM | — | 200: SegmentSet | Idempotency-Key, If-Match |
| createBranch | POST `/projects/{projectId}/branches` | PM | BranchRequest | 201: Branch | Idempotency-Key |
| createSlab | POST `/projects/{projectId}/slabs` | PM | SlabRequest | 201: Slab | Idempotency-Key |
| createReport | POST `/reports` | REPORTER | ReportCreate | 201: IncidentReport | Idempotency-Key |
| listOwnReports | GET `/reports` | REPORTER | — | 200: PublicReportPage | — |
| getOwnReport | GET `/reports/{reportId}` | REPORTER | — | 200: PublicReport | — |
| supplementReport | POST `/reports/{reportId}/supplements` | REPORTER | ReportCreate | 200: IncidentReport | Idempotency-Key, If-Match |
| listCases | GET `/projects/{projectId}/cases` | SUPERVISOR, PM | — | 200: CasePage | — |
| getCase | GET `/cases/{caseId}` | SUPERVISOR, PM | — | 200: Case | — |
| triageCase | POST `/cases/{caseId}/triage` | SUPERVISOR, PM | TriageCase | 200: Case | Idempotency-Key, If-Match |
| linkReports | POST `/cases/{caseId}/report-links` | PM | LinkReports | 200: Case | Idempotency-Key, If-Match |
| concludeCase | POST `/cases/{caseId}/conclusion` | PM | CaseConclusion | 200: Case | Idempotency-Key, If-Match |
| publishCase | POST `/cases/{caseId}/publish` | PM | PublishCase | 200: Case | Idempotency-Key, If-Match |
| closeMixedCase | POST `/cases/{caseId}/close` | SUPERVISOR | Reason | 200: Case | Idempotency-Key, If-Match |
| listDefects | GET `/projects/{projectId}/defects` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: DefectPage | — |
| createPreliminaryDefect | POST `/projects/{projectId}/defects` | PM | DefectCreate | 201: Defect | Idempotency-Key |
| getDefect | GET `/defects/{defectId}` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: Defect | — |
| assessDefect | POST `/defects/{defectId}/assessments` | PM | DefectAssessment | 200: Defect | Idempotency-Key, If-Match |
| verifyDefect | POST `/defects/{defectId}/verification` | PM | VerifyDefect | 200: Defect | Idempotency-Key, If-Match |
| assessRecurrence | POST `/defects/{defectId}/recurrence-assessments` | PM | RecurrenceAssessment | 200: Defect | Idempotency-Key, If-Match |
| setWorkOrder | PUT `/projects/{projectId}/work-order` | PM | OrderRequest | 200: WorkOrder | Idempotency-Key, If-Match |
| getWorkOrder | GET `/projects/{projectId}/work-order` | PM | — | 200: WorkOrder | — |
| createPolicyVersion | POST `/projects/{projectId}/policy-versions` | PM | PolicyRequest | 201: PolicyVersion | Idempotency-Key |
| getPolicyVersion | GET `/policy-versions/{policyVersionId}` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: PolicyVersion | — |
| activatePolicyVersion | POST `/policy-versions/{policyVersionId}/activate` | PM | — | 200: PolicyVersion | Idempotency-Key, If-Match |
| createInspectionTask | POST `/projects/{projectId}/inspection-tasks` | PM | InspectionTaskCreate | 201: InspectionTask | Idempotency-Key |
| createInspectionBatch | POST `/projects/{projectId}/inspection-batches` | PM | InspectionBatchCreate | 201: InspectionBatch | Idempotency-Key |
| getInspectionTask | GET `/inspection-tasks/{taskId}` | CREW, SUPERVISOR, PM | — | 200: InspectionTask | — |
| acceptInspectionTask | POST `/inspection-tasks/{taskId}/accept` | CREW | — | 200: InspectionTask | Idempotency-Key, If-Match |
| declineInspectionTask | POST `/inspection-tasks/{taskId}/decline` | CREW | Reason | 200: InspectionTask | Idempotency-Key, If-Match |
| submitInspection | POST `/inspection-tasks/{taskId}/sessions` | CREW | InspectionSubmit | 201: InspectionSession | Idempotency-Key, If-Match |
| evaluateFastTrack | POST `/inspection-tasks/{taskId}/evaluations` | CREW | EvaluationRequest | 201: Evaluation | Idempotency-Key |
| createRepairPackage | POST `/projects/{projectId}/repair-packages` | PM | PackageCreate | 201: RepairPackage | Idempotency-Key |
| submitRepairPackage | POST `/repair-packages/{packageId}/submit` | PM | — | 200: RepairPackage | Idempotency-Key, If-Match |
| decideRepairItem | POST `/repair-items/{itemId}/decisions` | SUPERVISOR | ItemDecision | 200: RepairItem | Idempotency-Key, If-Match |
| assignRepairItem | POST `/repair-items/{itemId}/assignments` | PM | RepairAssign | 201: RepairItem | Idempotency-Key, If-Match |
| reassignRepairItem | POST `/repair-items/{itemId}/reassignments` | PM | Reassignment | 200: RepairItem | Idempotency-Key, If-Match |
| startRepairAttempt | POST `/repair-attempts` | CREW | StartAttempt | 201: RepairAttempt | Idempotency-Key |
| submitRepairAttempt | POST `/repair-attempts/{attemptId}/submit` | CREW | SubmitAttempt | 200: RepairAttempt | Idempotency-Key, If-Match |
| reviewRepairAttempt | POST `/repair-attempts/{attemptId}/review` | PM | ReviewAttempt | 200: RepairAttempt | Idempotency-Key, If-Match |
| acceptApprovalAttempt | POST `/repair-attempts/{attemptId}/acceptance` | SUPERVISOR | ReviewAttempt | 200: RepairAttempt | Idempotency-Key, If-Match |
| createEmergencyTask | POST `/projects/{projectId}/emergency-tasks` | PM | EmergencyCreate | 201: RepairItem | Idempotency-Key |
| createSurveyTask | POST `/projects/{projectId}/survey-tasks` | PM | SurveyCreate | 201: SurveyTask | Idempotency-Key |
| getSurveyTask | GET `/survey-tasks/{taskId}` | OPERATOR, SUPERVISOR, PM | — | 200: SurveyTask | — |
| acceptSurveyTask | POST `/survey-tasks/{taskId}/accept` | OPERATOR | — | 200: SurveyTask | Idempotency-Key, If-Match |
| declineSurveyTask | POST `/survey-tasks/{taskId}/decline` | OPERATOR | Reason | 200: SurveyTask | Idempotency-Key, If-Match |
| cancelSurveyTask | POST `/survey-tasks/{taskId}/cancel` | PM | Reason | 200: SurveyTask | Idempotency-Key, If-Match |
| reassignSurveyTask | POST `/survey-tasks/{taskId}/reassign` | PM | SurveyReassign | 200: SurveyTask | Idempotency-Key, If-Match |
| requestSurveySupplement | POST `/survey-tasks/{taskId}/supplements` | PM | SupplementRequest | 201: SurveyTask | Idempotency-Key, If-Match |
| setSurveyAccessPoint | PUT `/survey-tasks/{taskId}/access-point` | PM | AccessPointUpdate | 200: SurveyTask | Idempotency-Key, If-Match |
| submitDataset | POST `/survey-tasks/{taskId}/datasets` | OPERATOR | DatasetSubmit | 201: Dataset | Idempotency-Key, If-Match |
| getDatasetCoverage | GET `/datasets/{datasetId}/coverage` | OPERATOR, SUPERVISOR, PM | — | 200: CoverageResultPage | — |
| confirmBaseline | POST `/projects/{projectId}/baselines` | PM | BaselineConfirm | 201: Ack | Idempotency-Key |
| exportMission | POST `/projects/{projectId}/mission-exports` | PM | MissionExport | 202: Job | Idempotency-Key |
| createUploadSession | POST `/uploads` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | UploadCreate | 201: UploadSession | Idempotency-Key |
| getUploadPartUrls | POST `/uploads/{uploadId}/part-urls` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | UploadPartsRequest | 200: UploadPartUrls | Idempotency-Key |
| completeUpload | POST `/uploads/{uploadId}/complete` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | UploadComplete | 202: UploadSession | Idempotency-Key, If-Match |
| getUploadSession | GET `/uploads/{uploadId}` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: UploadSession | — |
| getFileMetadata | GET `/files/{fileId}` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: FileMetadata | — |
| downloadFile | GET `/files/{fileId}/content` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: không body | — |
| syncOperations | POST `/sync/batches` | CREW, OPERATOR | SyncBatch | 200: SyncResult | Idempotency-Key |
| createProcessingJob | POST `/processing-jobs` | SUPERVISOR, PM | ProcessingCreate | 202: Job | Idempotency-Key |
| getProcessingJob | GET `/processing-jobs/{jobId}` | SUPERVISOR, PM, OPERATOR | — | 200: Job | — |
| retryProcessingJob | POST `/processing-jobs/{jobId}/retry` | SUPERVISOR, PM | Reason | 202: Job | Idempotency-Key, If-Match |
| receiveAiResult | POST `/internal/processing-jobs/{jobId}/results` | AI_SERVICE | AiResult | 200: Job | Idempotency-Key |
| createValidationRun | POST `/projects/{projectId}/validation-runs` | PM | ValidationRunCreate | 202: Job | Idempotency-Key |
| getValidationResult | GET `/validation-runs/{runId}` | SUPERVISOR, PM | — | 200: ValidationResult | — |
| reviewTrainingLabel | POST `/labels/{labelId}/review` | PM | LabelReview | 200: Ack | Idempotency-Key, If-Match |
| getDashboard | GET `/projects/{projectId}/dashboard` | SUPERVISOR, PM | — | 200: Dashboard | — |
| getProjectTimeline | GET `/projects/{projectId}/timeline` | SUPERVISOR, PM | — | 200: EventPage | — |
| createExport | POST `/exports` | SUPERVISOR, PM | ExportRequest | 202: Job | Idempotency-Key |
| getExport | GET `/exports/{exportId}` | SUPERVISOR, PM | — | 200: Job | — |
| listAuditEvents | GET `/audit-events` | SUPERVISOR | — | 200: EventPage | — |
| createModelVersion | POST `/model-versions` | SUPERVISOR | ModelCreate | 201: ModelVersion | Idempotency-Key |
| activateModelVersion | POST `/model-versions/{modelVersionId}/activate` | SUPERVISOR | Reason | 200: ModelVersion | Idempotency-Key, If-Match |
| retireModelVersion | POST `/model-versions/{modelVersionId}/retire` | SUPERVISOR | Reason | 200: ModelVersion | Idempotency-Key, If-Match |
| createDevice | POST `/devices` | SUPERVISOR | DeviceCreate | 201: Device | Idempotency-Key |
| listDefectTypes | GET `/catalog/defect-types` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: CatalogEntryPage | — |
| updateDefectType | PUT `/catalog/defect-types/{code}` | SUPERVISOR | CatalogEntryUpdate | 200: CatalogEntry | Idempotency-Key, If-Match |
| getReminderConfig | GET `/reminder-configuration` | SUPERVISOR | — | 200: ReminderConfig | — |
| setReminderConfig | PUT `/reminder-configuration` | SUPERVISOR | ReminderConfigUpdate | 200: ReminderConfig | Idempotency-Key, If-Match |
| requestDeletion | POST `/retention/deletion-requests` | PM | DeletionRequest | 201: RetentionRequest | Idempotency-Key |
| decideDeletion | POST `/retention/deletion-requests/{requestId}/decision` | SUPERVISOR | RetentionDecision | 200: RetentionRequest | Idempotency-Key, If-Match |
| setLegalHold | PUT `/projects/{projectId}/legal-hold` | SUPERVISOR | LegalHoldRequest | 200: Project | Idempotency-Key, If-Match |
| listMyInspectionTasks | GET `/me/inspection-tasks` | CREW | — | 200: InspectionTaskPage | — |
| listMyRepairItems | GET `/me/repair-items` | CREW | — | 200: RepairItemPage | — |
| listMySurveyTasks | GET `/me/survey-tasks` | OPERATOR | — | 200: SurveyTaskPage | — |
| getInspectionSnapshot | GET `/inspection-tasks/{taskId}/snapshot` | CREW | — | 200: TaskSnapshot | — |
| setDefectSlabLinks | PUT `/defects/{defectId}/slab-links` | PM | SlabLinks | 200: Defect | Idempotency-Key, If-Match |
| createSurveyPlan | POST `/projects/{projectId}/survey-plans` | PM | PlanCreate | 201: SurveyPlan | Idempotency-Key |
| postponeSurveyPlan | POST `/survey-plans/{planId}/postpone` | PM | Reason | 200: SurveyPlan | Idempotency-Key, If-Match |
| exportApprovedLabels | POST `/training-exports` | SUPERVISOR | TrainingExportRequest | 202: Job | Idempotency-Key |
| listAdminJobs | GET `/admin/processing-jobs` | SUPERVISOR | — | 200: JobPage | — |
| getAsyncJob | GET `/jobs/{jobId}` | SUPERVISOR, PM, OPERATOR | — | 200: Job | — |
| getRepairItem | GET `/repair-items/{itemId}` | SUPERVISOR, PM, CREW | — | 200: RepairItem | — |
| getRepairAttempt | GET `/repair-attempts/{attemptId}` | SUPERVISOR, PM, CREW | — | 200: RepairAttempt | — |
| getRepairPackage | GET `/repair-packages/{packageId}` | SUPERVISOR, PM | — | 200: RepairPackage | — |
| getSegmentSet | GET `/segment-sets/{segmentSetId}` | SUPERVISOR, PM, OPERATOR, CREW | — | 200: SegmentSet | — |
| getDeletionRequest | GET `/retention/deletion-requests/{requestId}` | SUPERVISOR, PM | — | 200: RetentionRequest | — |
| getModelVersion | GET `/model-versions/{modelVersionId}` | SUPERVISOR | — | 200: ModelVersion | — |
| getNotification | GET `/notifications/{notificationId}` | SUPERVISOR, PM, OPERATOR, CREW, REPORTER | — | 200: Notification | — |
| reviseRepairItem | POST `/repair-items/{itemId}/revisions` | PM | ProposalRevision | 201: RepairItem | Idempotency-Key, If-Match |
| startReworkAttempt | POST `/repair-attempts/{attemptId}/rework-attempts` | CREW | ReworkCreate | 201: RepairAttempt | Idempotency-Key, If-Match |
