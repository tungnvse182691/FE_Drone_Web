# Bảng theo dõi nối API BE ↔ FE

> Sinh tự động bởi `node tools/gen-api-wiring-table.cjs` ngày 2026-11-19. Nguồn: `docs/contracts/openapi.json` so với chuỗi đường dẫn trong `src/`.
> "Đã nối" = tìm thấy chuỗi đường dẫn trong code FE (không đồng nghĩa đã kiểm chứng nghiệm thu). Đường dẫn dựng động có thể bị bỏ sót → cần rà lại khi nghi ngờ.
> Cột Smoke = mã HTTP khi gọi thật với BE local (chỉ endpoint GET chỉ cần projectId; PM/SUP). 200 = BE trả được; 400/401/403 = thiếu tham số hoặc đúng phân quyền theo vai.

## Tổng quan
| Chỉ số | Số lượng |
|---|---|
| Tổng operation trong OpenAPI | 298 |
| **Đã nối** | 232 |
| **Nghi đã nối** (đường dẫn dựng động, cần xác minh) | 0 |
| **Chưa nối** | 66 |
| — trong đó ngoài phạm vi web PM/Sup | 63 |
| — trong đó cần làm cho web | 3 |

## 1. Chưa nối — cần làm cho web PM/Sup (3)
| Method | Path | Controller | Trạng thái | FE gọi từ file / Lý do chưa nối | Smoke BE thật (GET) |
|---|---|---|---|---|---|
| POST | `/admin/users/{}/password-reset` | AdminUsers | Chưa nối | Chưa nối — Route thay thế của POST /users/{}/password-reset đã nối; chức năng tương đương đã có. |  |
| GET | `/me` | Me | Chưa nối | Chưa nối — Route thay thế của GET /profile đã nối (cùng dữ liệu hồ sơ cá nhân); FE dùng /profile nên không gọi /me. | pm-a:200 supervisor:200 |
| PATCH | `/me` | Me | Chưa nối | Chưa nối — Route thay thế của PUT /profile đã nối (cùng chức năng cập nhật hồ sơ); FE dùng /profile. |  |

## 2. Chưa nối — ngoài phạm vi web PM/Sup (63)
| Method | Path | Controller | Trạng thái | FE gọi từ file / Lý do chưa nối | Smoke BE thật (GET) |
|---|---|---|---|---|---|
| POST | `/auth/android/login` | Auth | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đăng nhập app Android (mobile) |  |
| POST | `/auth/android/refresh` | Auth | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Làm mới phiên app Android (mobile) |  |
| POST | `/auth/refresh` | Auth | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Làm mới token Bearer (mobile/Bearer); web dùng cookie và /auth/web/renew |  |
| POST | `/auth/forced-password-change` | Auth | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đổi mật khẩu bắt buộc cho phiên chưa đăng nhập (mobile/Bearer); web dùng /auth/change-password sau khi đăng nhập bằng cookie |  |
| POST | `/auth/logout` | Auth | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đăng xuất phiên Bearer (mobile); web dùng /auth/web/logout |  |
| POST | `/projects/{}/offline/devices` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/grants` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| GET | `/projects/{}/field-inspection-tasks/{}/start-origin` | FieldInspectionWorkflow | Chưa nối | Ngoài phạm vi: thao tác của Crew (app hiện trường) |  |
| GET | `/projects/{}/field-inspection-tasks/{}/geometry` | FieldInspectionWorkflow | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew đọc hình học nhiệm vụ trên app hiện trường. |  |
| POST | `/projects/{}/field-inspection-tasks/{}/accept` | FieldInspectionWorkflow | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew nhận nhiệm vụ trên app hiện trường. |  |
| POST | `/projects/{}/field-inspection-tasks/{}/reject` | FieldInspectionWorkflow | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew từ chối nhiệm vụ trên app hiện trường. |  |
| POST | `/projects/{}/field-inspection-tasks/{}/start` | FieldInspectionWorkflow | Chưa nối | Ngoài phạm vi: thao tác của Crew (app hiện trường) |  |
| POST | `/projects/{}/field-inspection-tasks/{}/submissions` | FieldInspectionWorkflow | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew nộp kết quả đo/thi công trên app hiện trường (web chỉ đọc bản nộp). |  |
| GET | `/me/inspection-tasks` | InspectionTasks | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Danh sách nhiệm vụ của Crew đang đăng nhập (mobile) | pm-a:403 supervisor:403 |
| POST | `/projects/{}/offline/snapshots` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| GET | `/projects/{}/offline/snapshots/{}` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/sync` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/packages/export` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/packages/prepare` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/import` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| GET | `/projects/{}/offline/batches/{}` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| GET | `/projects/{}/offline/origins/{}` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/starts/reconcile` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/projects/{}/offline/artifacts` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| GET | `/projects/{}/offline/artifacts/{}` | OfflineWorkflow | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/internal/processing-jobs/{}/results` | ProcessingV | Chưa nối | Ngoài phạm vi: callback/hàng đợi nội bộ AI service |  |
| GET | `/public/publications/{}` | PublicPublications | Chưa nối | Ngoài phạm vi: endpoint công khai cho người dân, không thuộc web nội bộ |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/tasks/{}/assessment` | RepairExecution | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew đánh giá trước thi công trên app hiện trường (RepairExecutionController chỉ cho vai Crew). |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/tasks/{}/execution-start` | RepairExecution | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew bắt đầu thi công trên app hiện trường. |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/tasks/{}/execution-finish` | RepairExecution | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew kết thúc thi công trên app hiện trường. |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/tasks/{}/attempts` | RepairExecution | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew gắn lần thi công vào hạng mục (web dùng attempts/reviews của PM). |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/tasks/{}/attempts/supplements` | RepairExecution | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Crew nộp bổ sung sau yêu cầu của PM. |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/safety-measures/{}/installation` | RepairSafety | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): BE chỉ cho Crew phụ trách (safety_responsibility_not_current với vai trò khác): lắp đặt biện pháp là thao tác hiện trường của Crew |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/safety-measures/{}/checks` | RepairSafety | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): BE chỉ cho Crew phụ trách: kiểm tra định kỳ biện pháp an toàn là thao tác hiện trường của Crew |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/safety-measures/{}/warnings/{}/acknowledgement` | RepairSafety | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): BE chỉ cho Crew phụ trách: xác nhận cảnh báo an toàn là thao tác của Crew |  |
| POST | `/reporter-evidence/uploads` | ReporterEvidence | Chưa nối | Ngoài phạm vi: thuộc vai Reporter (app người dân). PM/Sup đọc qua `/cases/{id}/reports` |  |
| GET | `/reporter-evidence/uploads/{}` | ReporterEvidence | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Người dân (Reporter) tải bằng chứng; PM/Sup đọc qua /cases/{id}/reports. |  |
| POST | `/reporter-evidence/uploads/{}/cancel` | ReporterEvidence | Chưa nối | Ngoài phạm vi: thuộc vai Reporter (app người dân). PM/Sup đọc qua `/cases/{id}/reports` |  |
| POST | `/reporter-evidence/uploads/{}/part-urls` | ReporterEvidence | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Reporter tải bằng chứng. |  |
| POST | `/reporter-evidence/uploads/{}/complete` | ReporterEvidence | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Reporter tải bằng chứng. |  |
| GET | `/reporter-evidence/files/{}` | ReporterEvidence | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Reporter đọc tệp của chính mình; PM/Sup đọc qua /cases/{id}/reports/{id}/evidence/{id}/content. |  |
| GET | `/reporter-evidence/files/{}/content` | ReporterEvidence | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Reporter đọc nội dung tệp của chính mình. |  |
| GET | `/reporter-evidence/publications/{}/reports/{}/evidence/{}/content` | ReporterEvidence | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đường công khai cho người dân; web nội bộ dùng /cases/.../content. |  |
| POST | `/auth/reporter/password-reset/request` | ReporterPasswordReset | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đổi mật khẩu Reporter, không thuộc PM/Giám sát. |  |
| POST | `/auth/reporter/password-reset/confirm` | ReporterPasswordReset | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đổi mật khẩu Reporter, không thuộc PM/Giám sát. |  |
| POST | `/auth/reporter-registrations` | ReporterRegistrations | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Đăng ký Reporter (người dân, mobile); không thuộc PM/Giám sát |  |
| POST | `/auth/reporter-registrations/verify` | ReporterRegistrations | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Xác minh đăng ký Reporter (mobile) |  |
| POST | `/auth/reporter-registrations/resend` | ReporterRegistrations | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Gửi lại mã đăng ký Reporter (mobile) |  |
| GET | `/reports` | Reports | Chưa nối | Ngoài phạm vi: thuộc vai Reporter (app người dân). PM/Sup đọc qua `/cases/{id}/reports` | pm-a:403 supervisor:403 |
| POST | `/reports` | Reports | Chưa nối | Ngoài phạm vi: thuộc vai Reporter (app người dân). PM/Sup đọc qua `/cases/{id}/reports` |  |
| GET | `/reports/{}` | Reports | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Reporter đọc báo cáo của mình; web dùng /cases/{id}/reports. |  |
| POST | `/reports/{}/supplements` | Reports | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Reporter bổ sung báo cáo. |  |
| GET | `/reports/{}/evidence/{}/download` | Reports | Chưa nối | Ngoài phạm vi: thuộc vai Reporter (app người dân). PM/Sup đọc qua `/cases/{id}/reports` |  |
| POST | `/projects/{}/road-sections/{}/survey-plans` | SurveyPlanning | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): SurveyPlanning theo road-section chỉ Bearer; Web dùng Survey V2. |  |
| POST | `/projects/{}/road-sections/{}/survey-requests` | SurveyPlanning | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): SurveyPlanning theo road-section chỉ Bearer; Web dùng Survey V2. |  |
| POST | `/projects/{}/survey-plans/{}/postpone` | SurveyPlanning | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Biến thể SurveyPlanning Bearer-only; Web dùng POST /survey-plans/{}/postpone. |  |
| GET | `/survey-tasks/{}/eligible-drones` | SurveyV | Chưa nối | Ngoài phạm vi: thao tác của Drone Operator (app) |  |
| GET | `/me/survey-tasks` | SurveyV | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Danh sách nhiệm vụ của Operator đang đăng nhập (mobile) | pm-a:401 supervisor:401 |
| POST | `/survey-tasks/{}/accept` | SurveyV | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Phi công (Operator) nhận nhiệm vụ bay. |  |
| POST | `/survey-tasks/{}/decline` | SurveyV | Chưa nối | Ngoài phạm vi: thao tác của Drone Operator (app) |  |
| POST | `/offline/uploads` | Uploads | Chưa nối | Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator) |  |
| POST | `/uploads/{}/cancel` | Uploads | Chưa nối | Ngoài phạm vi: upload do Crew/Operator/mobile thực hiện |  |
| GET | `/ready` | RoadGuardSystem.eAPI | Chưa nối | Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): Health check hạ tầng, không phải chức năng web | pm-a:404 supervisor:404 |

## 3. Nghi đã nối — đường dẫn dựng động (0)
| Method | Path | Controller | Trạng thái | FE gọi từ file / Lý do chưa nối | Smoke BE thật (GET) |
|---|---|---|---|---|---|


## 4. Đã nối (232)
| Method | Path | Controller | Trạng thái | FE gọi từ file / Lý do chưa nối | Smoke BE thật (GET) |
|---|---|---|---|---|---|
| POST | `/projects/{}/ai-mock-runs` | AiMockRuns | Đã nối | api/services/candidate3ValidationService.ts, api/services/surveyDatasetService.ts |  |
| GET | `/projects/{}/ai-mock-runs` | DiscoveryCollections | Đã nối | api/services/candidate3ValidationService.ts, api/services/surveyDatasetService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/ai-mock-runs/{}` | AiMockRuns | Đã nối | api/services/aiRunDetailService.ts, api/services/surveyService.ts |  |
| GET | `/projects/{}/ai-mock-runs/{}/result` | AiMockRuns | Đã nối | api/services/candidate3ValidationService.ts, api/services/surveyService.ts |  |
| GET | `/projects/{}/ai-candidates/{}` | AiMockRuns | Đã nối | api/services/surveyService.ts, api/services/trainingLabelService.ts |  |
| POST | `/auth/login` | Auth | Đã nối | api/devFileBearer.ts (đăng nhập Bearer tạm [TEMP-BEARER], chỉ build dev); web chính dùng /auth/web/login |  |
| POST | `/auth/password-recovery-requests` | Auth | Đã nối | api/auth.ts |  |
| POST | `/auth/change-password` | Auth | Đã nối | api/auth.ts |  |
| GET | `/projects/{}/receiving-requests` | BusinessDuty | Đã nối | api/services/dutyService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/receiving-requests/{}` | BusinessDuty | Đã nối | api/services/dutyService.ts |  |
| POST | `/projects/{}/receiving-requests/{}/ack` | BusinessDuty | Đã nối | api/services/dutyService.ts |  |
| POST | `/projects/{}/receiving-requests/{}/appointment` | BusinessDuty | Đã nối | api/services/dutyService.ts |  |
| GET | `/projects/{}/candidates` | Candidates | Đã nối | api/services/reportKeepNewCommands.ts, api/services/surveyService.ts | pm-a:400 supervisor:403 |
| POST | `/projects/{}/candidate-decisions` | Candidates | Đã nối | api/services/reportKeepNewCommands.ts, api/services/surveyService.ts |  |
| GET | `/projects/{}/candidate-decisions/{}` | Candidates | Đã nối | api/services/reportKeepNewCommands.ts, api/services/surveyService.ts |  |
| GET | `/cases/{}/reports` | CaseReportDetails | Đã nối | api/services/caseReportService.ts |  |
| GET | `/cases/{}/reports/{}/evidence/{}/content` | CaseReportDetails | Đã nối | api/services/caseReportService.ts |  |
| GET | `/cases` | Cases | Đã nối | api/services/fieldEvidenceReuseCommands.ts, api/services/triageService.ts | pm-a:403 supervisor:200 |
| GET | `/cases/{}` | Cases | Đã nối | api/services/triageService.ts |  |
| POST | `/cases/{}/triage` | Cases | Đã nối | api/services/caseScopeService.ts, api/services/triageService.ts |  |
| POST | `/cases/{}/report-links` | Cases | Đã nối | api/services/triageService.ts:639 (linkDuplicateReports) ← ai-review/useAIReviewLinkActions.ts:69 |  |
| POST | `/cases/{}/report-splits` | Cases | Đã nối | api/services/triageService.ts:662 (splitReport) ← ai-review/useAIReviewLinkActions.ts:88 |  |
| POST | `/cases/{}/conclusions` | Cases | Đã nối | api/services/caseEvidenceRequestService.ts, api/services/caseNoDefectService.ts |  |
| POST | `/cases/{}/publications` | Cases | Đã nối | api/services/triageService.ts:607 (publishCase) ← ai-review/useAIReviewActions.ts:163 |  |
| POST | `/projects/{}/clocks/{}/extensions` | ClockDuty | Đã nối | api/services/dashboardService.ts |  |
| POST | `/projects/{}/clocks/{}/appointments` | ClockDuty | Đã nối | api/services/dutyService.ts |  |
| GET | `/projects/{}/defects` | Defects | Đã nối | api/services/fieldCreateCommands.ts, api/services/repairService.ts | pm-a:200 supervisor:403 |
| GET | `/projects/{}/defects/{}` | Defects | Đã nối | api/services/fastTrackFormSources.ts, api/services/fastTrackService.ts |  |
| POST | `/projects/{}/defects/{}/assessments` | Defects | Đã nối | api/services/surveyService.ts |  |
| POST | `/projects/{}/defects/{}/verification-decisions` | Defects | Đã nối | api/services/surveyService.ts |  |
| GET | `/projects/{}/defect-statistics` | DefectStatistics | Đã nối | api/services/defectStatisticsService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/defect-statistics` | DefectStatistics | Đã nối | api/services/defectStatisticsService.ts |  |
| GET | `/catalog/defect-types/admin` | DefectTypeAdministration | Đã nối | api/services/defectTypeAdminService.ts | pm-a:403 supervisor:200 |
| POST | `/catalog/defect-types/admin` | DefectTypeAdministration | Đã nối | api/services/defectTypeAdminService.ts |  |
| PUT | `/catalog/defect-types/admin/{}` | DefectTypeAdministration | Đã nối | defectTypeAdminService.update ← DefectTypeAdminPanel; truyền If-Match và Idempotency-Key. |  |
| GET | `/catalog/defect-types` | DefectTypes | Đã nối | api/services/defectTypeCatalog.ts | pm-a:200 supervisor:403 |
| GET | `/projects/{}/repair-packages` | DiscoveryCollections | Đã nối | api/services/acceptanceService.ts, api/services/defectLifecycleService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/repair-packages` | RepairPackages | Đã nối | api/services/acceptanceService.ts, api/services/defectLifecycleService.ts |  |
| GET | `/projects/{}/repair-packages/{}/items` | DiscoveryCollections | Đã nối | api/services/acceptanceService.ts, api/services/fastTrackService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items` | RepairPackages | Đã nối | api/services/acceptanceService.ts, api/services/fastTrackService.ts |  |
| GET | `/projects/{}/exports` | DiscoveryCollections | Đã nối | api/services/projectExportService.ts | pm-a:200 supervisor:403 |
| POST | `/projects/{}/exports` | Exports | Đã nối | api/services/projectExportService.ts |  |
| GET | `/projects/{}/survey-plans` | DiscoveryCollections | Đã nối | api/services/surveyCreateCommands.ts, api/services/surveyService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/survey-plans` | SurveyV | Đã nối | api/services/surveyCreateCommands.ts, api/services/surveyService.ts |  |
| GET | `/projects/{}/survey-tasks` | DiscoveryCollections | Đã nối | api/services/surveyCreateCommands.ts, api/services/surveyService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/survey-tasks` | SurveyV | Đã nối | api/services/surveyCreateCommands.ts, api/services/surveyService.ts |  |
| GET | `/projects/{}/processing-jobs` | DiscoveryCollections | Đã nối | api/services/surveyDatasetService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/offline/devices` | DiscoveryCollections | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.list (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). | pm-a:200 supervisor:200 |
| GET | `/projects/{}/offline/packages` | DiscoveryCollections | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.list (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). | pm-a:200 supervisor:200 |
| GET | `/projects/{}/offline/grants` | DiscoveryCollections | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.list (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). | pm-a:200 supervisor:200 |
| GET | `/projects/{}/retention/evaluations` | DiscoveryCollections | Đã nối | api/services/retentionService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/retention/evaluations` | Retention | Đã nối | api/services/retentionService.ts |  |
| GET | `/projects/{}/exports/{}` | Exports | Đã nối | api/services/projectExportService.ts |  |
| GET | `/projects/{}/exports/{}/manifest` | Exports | Đã nối | api/services/projectExportService.ts |  |
| GET | `/projects/{}/exports/{}/content` | Exports | Đã nối | api/services/projectExportService.ts |  |
| POST | `/projects/{}/field-inspection-tasks` | FieldInspectionWorkflow | Đã nối | api/services/fastTrackFormSources.ts, api/services/fieldCreateCommands.ts |  |
| GET | `/projects/{}/field-inspection-tasks` | FieldInspectionWorkflow | Đã nối | api/services/fastTrackFormSources.ts, api/services/fieldCreateCommands.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/field-inspection-tasks/{}` | FieldInspectionWorkflow | Đã nối | api/services/acceptanceService.ts, api/services/fastTrackFormSources.ts |  |
| GET | `/projects/{}/field-inspection-tasks/{}/history` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskReadService.ts |  |
| POST | `/projects/{}/field-inspection-tasks/{}/assign` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskActions.ts ← field-tasks/FieldTaskReadDetails.tsx (giao khi chưa có người nhận); đã chạy thật |  |
| POST | `/projects/{}/field-inspection-tasks/{}/reassign` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskActions.ts ← field-tasks/FieldTaskReadDetails.tsx; đã chạy thật qua giao diện (sự kiện REASSIGNED) |  |
| POST | `/projects/{}/field-inspection-tasks/{}/cancel` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskActions.ts ← field-tasks/FieldTaskReadDetails.tsx; đã chạy thật qua giao diện (Cancelled) |  |
| GET | `/projects/{}/field-inspection-tasks/{}/submissions/{}` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskReadService.ts |  |
| POST | `/projects/{}/field-inspection-tasks/{}/reviews` | FieldInspectionWorkflow | Đã nối | api/services/fieldReviewCommands.ts |  |
| POST | `/projects/{}/field-inspection-tasks/{}/location-impact-decisions` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskActions.ts |  |
| POST | `/projects/{}/field-inspection-tasks/{}/evidence-reuse` | FieldInspectionWorkflow | Đã nối | api/services/fieldEvidenceReuseCommands.ts |  |
| GET | `/projects/{}/field-inspection-tasks/{}/evidence/{}` | FieldInspectionWorkflow | Đã nối | api/services/fieldEvidenceReuseCommands.ts, api/services/fieldTaskReadService.ts |  |
| GET | `/projects/{}/field-inspection-tasks/{}/evidence/{}/content` | FieldInspectionWorkflow | Đã nối | api/services/fieldTaskReadService.ts:13 |  |
| POST | `/projects/{}/crs-profiles` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| GET | `/projects/{}/crs-profiles` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/crs-profiles/{}` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/route-systems` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts, api/services/routeSystemCommands.ts |  |
| GET | `/projects/{}/route-systems` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts, api/services/routeSystemCommands.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/road-geometry-drafts/{}/readiness` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/road-geometry-drafts` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/road-sections/{}/geometry-drafts` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| PUT | `/projects/{}/road-geometry-drafts/{}` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| GET | `/projects/{}/road-geometry-drafts/{}` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| PUT | `/projects/{}/road-sections/{}/geometry-drafts/{}` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| GET | `/projects/{}/road-sections/{}/geometry-drafts/{}` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/road-geometry-drafts/{}/preview` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/road-sections/{}/geometry-drafts/{}/preview` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/road-geometry-drafts/{}/submit` | GeometryWorkflow | Đã nối | api/services/geometrySubmissionService.ts |  |
| GET | `/projects/{}/road-geometry-submission` | GeometryWorkflow | Đã nối | api/services/geometrySubmissionService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/road-geometry-drafts/{}/reject` | GeometryWorkflow | Đã nối | api/services/geometrySubmissionService.ts |  |
| POST | `/projects/{}/road-geometry-drafts/{}/confirm` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| POST | `/projects/{}/road-sections/{}/geometry-drafts/{}/confirm` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts |  |
| GET | `/projects/{}/road-sections/{}/versions/{}/geometry` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts, api/services/fastTrackFormSources.ts |  |
| POST | `/projects/{}/road-sections/{}/versions/{}/segment-sets/preview` | GeometryWorkflow | Đã nối | api/services/segmentSetService.ts:64 |  |
| POST | `/projects/{}/road-sections/{}/versions/{}/segment-sets` | GeometryWorkflow | Đã nối | api/services/defectGeoService.ts, api/services/pavementService.ts |  |
| GET | `/projects/{}/road-sections/{}/versions/{}/segment-sets` | GeometryWorkflow | Đã nối | api/services/defectGeoService.ts, api/services/pavementService.ts |  |
| PUT | `/projects/{}/road-sections/{}/versions/{}/segment-sets/{}` | GeometryWorkflow | Đã nối | api/services/projectReportingService.ts |  |
| GET | `/projects/{}/road-sections/{}/versions/{}/segment-sets/{}` | GeometryWorkflow | Đã nối | api/services/projectReportingService.ts |  |
| POST | `/projects/{}/road-sections/{}/versions/{}/segment-sets/{}/publish` | GeometryWorkflow | Đã nối | api/services/segmentSetService.ts:74 |  |
| GET | `/projects/{}/geometry-package` | GeometryWorkflow | Đã nối | api/services/alignmentService.ts, api/services/defectGeoService.ts | pm-a:400 supervisor:400 |
| POST | `/notifications/read-batch` | H6NotificationOperations | Đã nối | api/services/notificationService.ts |  |
| GET | `/projects/{}/weekly-digests/{}` | H6NotificationOperations | Đã nối | dutyService.digest ← DutyPanel.tsx (nhập mã bản tóm tắt); đã gọi thật nhưng chưa có bản tóm tắt thật để đọc (BE trả 404 hiển thị đúng) |  |
| GET | `/notifications/{}/scope` | H6NotificationOperations | Đã nối | api/services/notificationService.ts |  |
| GET | `/projects/{}/clocks` | H6NotificationOperations | Đã nối | api/services/dashboardService.ts, api/services/dutyService.ts | pm-a:200 supervisor:200 |
| POST | `/invitations` | Invitations | Đã nối | api/services/personnelService.ts |  |
| POST | `/invitations/preview` | Invitations | Đã nối | api/services/invitationAcceptService.ts |  |
| POST | `/invitations/accept` | Invitations | Đã nối | api/client.ts, api/services/invitationAcceptService.ts |  |
| GET | `/me/phone-number` | Me | Đã nối | api/services/profileService.ts | pm-a:200 supervisor:200 |
| PATCH | `/me/phone-number` | Me | Đã nối | api/services/profileService.ts |  |
| GET | `/notifications/{}` | Notifications | Đã nối | api/services/notificationService.ts |  |
| GET | `/notifications` | Notifications | Đã nối | api/services/notificationService.ts, App.tsx | pm-a:200 supervisor:200 |
| POST | `/notifications/{}/read` | Notifications | Đã nối | api/services/notificationService.ts |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/notification-supervisor` | NotificationSupervisor | Đã nối | api/services/notificationSupervisorService.ts |  |
| PUT | `/projects/{}/repair-packages/{}/items/{}/notification-supervisor` | NotificationSupervisor | Đã nối | api/services/notificationSupervisorService.ts |  |
| DELETE | `/projects/{}/repair-packages/{}/items/{}/notification-supervisor` | NotificationSupervisor | Đã nối | api/services/notificationSupervisorService.ts |  |
| GET | `/projects/{}/offline/devices/{}` | OfflineWorkflow | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.detail (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). |  |
| POST | `/projects/{}/offline/devices/{}/revoke` | OfflineWorkflow | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.revoke (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). |  |
| GET | `/projects/{}/offline/packages/{}` | OfflineWorkflow | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.detail (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). |  |
| GET | `/projects/{}/offline/grants/{}` | OfflineWorkflow | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.detail (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). |  |
| POST | `/projects/{}/offline/grants/{}/revoke` | OfflineWorkflow | Đã nối | OfflineCoordination.tsx → offlineCoordinationService.revoke (đường dẫn dựng động; xác minh mã nguồn, không phải nghiệm thu lệnh ghi). |  |
| POST | `/projects/{}/route-versions/{}/segment-sets/{}/pavement-plans` | PavementWorkflow | Đã nối | api/services/pavementService.ts |  |
| GET | `/projects/{}/road-sections/{}/versions/{}/segment-sets/{}/pavement-layouts` | PavementWorkflow | Đã nối | api/services/pavementService.ts |  |
| GET | `/projects/{}/pavement-layouts/{}` | PavementWorkflow | Đã nối | api/services/fastTrackFormSources.ts, api/services/pavementService.ts |  |
| POST | `/projects/{}/pavement-layouts/as-built` | PavementWorkflow | Đã nối | api/services/pavementService.ts |  |
| POST | `/projects/{}/geometry-map-publications` | PavementWorkflow | Đã nối | api/services/mapPublicationService.ts |  |
| GET | `/projects/{}/geometry-map-publications/{}` | PavementWorkflow | Đã nối | api/services/fastTrackFormSources.ts, api/services/geometryImpactService.ts |  |
| GET | `/projects/{}/geometry-map-publications/{}/layers/{}` | PavementWorkflow | Đã nối | api/services/geometryImpactService.ts:79, mapPublicationService.ts:84 |  |
| POST | `/projects/{}/geometry-location-impacts` | PavementWorkflow | Đã nối | api/services/geometryImpactService.ts |  |
| GET | `/projects/{}/geometry-location-impacts` | PavementWorkflow | Đã nối | api/services/geometryImpactService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/geometry-location-impacts/{}` | PavementWorkflow | Đã nối | api/services/geometryImpactService.ts |  |
| POST | `/projects/{}/geometry-location-impacts/{}/decisions` | PavementWorkflow | Đã nối | api/services/geometryImpactCommands.ts:59 |  |
| POST | `/processing-jobs` | ProcessingV | Đã nối | api/services/surveyDatasetService.ts |  |
| GET | `/processing-jobs/{}` | ProcessingV | Đã nối | surveyDatasetService.job ← SurveyDatasetPanel.tsx; Bearer tạm; đã chạy thật |  |
| POST | `/processing-jobs/{}/retry` | ProcessingV | Đã nối | api/services/surveyDatasetService.ts |  |
| POST | `/projects/{}/validation-runs` | ProcessingV | Đã nối | api/services/validationService.ts |  |
| GET | `/validation-runs/{}` | ProcessingV | Đã nối | api/services/validationService.ts |  |
| GET | `/profile` | Profile | Đã nối | api/services/profileService.ts | pm-a:200 supervisor:200 |
| PUT | `/profile` | Profile | Đã nối | api/services/profileService.ts |  |
| GET | `/projects/{}/lifecycle` | ProjectLifecycle | Đã nối | api/services/constructionLifecycleService.ts, api/services/defectLifecycleService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/lifecycle/renewed-handling-scope` | ProjectLifecycle | Đã nối | api/services/lifecycleRenewService.ts |  |
| POST | `/projects/{}/lifecycle/{}` | ProjectLifecycle | Đã nối | Nối 6 lệnh trực tiếp: construction-declarations, construction-confirmations, defect-closures, operational-closures, obligation-transfers, obligation-transfer-acceptances. Tái phát đi qua candidate-decisions (KEEP_NEW + recurrence) vì lệnh lifecycle trực tiếp từ chối thao tác tách riêng. |  |
| POST | `/projects/{}/road-sections` | ProjectRoadSections | Đã nối | api/services/roadSectionCommands.ts |  |
| POST | `/projects/{}/road-sections/{}/versions` | ProjectRoadSections | Đã nối | api/services/roadSectionCommands.ts |  |
| GET | `/projects` | Projects | Đã nối | api/services/acceptanceService.ts, api/services/dashboardService.ts | pm-a:200 supervisor:200 |
| POST | `/projects` | Projects | Đã nối | api/services/acceptanceService.ts, api/services/dashboardService.ts |  |
| PUT | `/projects/{}/primary-project-manager` | Projects | Đã nối | api/services/personnelDetailRead.ts, api/services/personnelService.ts |  |
| GET | `/projects/{}/primary-project-manager` | StaffDirectory | Đã nối | api/services/personnelDetailRead.ts, api/services/personnelService.ts | pm-a:200 supervisor:200 |
| PUT | `/projects/{}` | Projects | Đã nối | api/services/projectUpdateService.ts |  |
| POST | `/projects/{}/warranties` | ProjectWarranties | Đã nối | api/services/projectWarrantyService.ts |  |
| GET | `/projects/{}/work-package` | ProjectWorkPackages | Đã nối | api/services/alignmentService.ts, api/services/projectServerFacts.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/defects/{}/publications` | PublicPublications | Đã nối | api/services/publicPublicationService.ts |  |
| POST | `/projects/{}/publications/{}/withdraw` | PublicPublications | Đã nối | publicPublicationService.withdraw ← DefectPublicationPanel.tsx; chưa chạy thật (chưa có bản xuất bản) |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/eligibility` | RepairEligibility | Đã nối | api/fastTrack.ts, api/services/repairWorkflowService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/tasks/{}/attempts/reviews` | RepairExecution | Đã nối | api/services/acceptanceService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/cancellations` | RepairLifecycle | Đã nối | api/services/repairItemActions.ts cancel ← repair-proposals/RepairItemActions.tsx; đã chạy thật qua giao diện |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/normal-successors` | RepairLifecycle | Đã nối | api/services/repairItemActions.ts continueNormally ← RepairItemActions.tsx; đã chạy thật (từ hạng mục đã hủy và từ hạng mục cần hiệu chỉnh) |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/approve` | RepairPackages | Đã nối | api/services/repairService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/assign` | RepairPackages | Đã nối | api/services/repairService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/final-confirmation` | RepairPackages | Đã nối | api/services/acceptanceService.ts, api/services/repairService.ts |  |
| POST | `/projects/{}/repair-policies/drafts` | RepairPolicies | Đã nối | api/services/fastTrackService.ts |  |
| GET | `/projects/{}/repair-policies/drafts/{}` | RepairPolicies | Đã nối | api/services/fastTrackService.ts |  |
| PUT | `/projects/{}/repair-policies/drafts/{}` | RepairPolicies | Đã nối | api/services/fastTrackService.ts |  |
| POST | `/projects/{}/repair-policies/drafts/{}/publish` | RepairPolicies | Đã nối | api/services/fastTrackService.ts |  |
| GET | `/projects/{}/repair-policies/revisions/{}` | RepairPolicies | Đã nối | api/services/fastTrackService.ts:79 (getPolicyRevision) |  |
| POST | `/projects/{}/repair-policies/revisions/{}/revoke` | RepairPolicies | Đã nối | api/services/fastTrackService.ts |  |
| GET | `/projects/{}/repair-packages/{}/items/{}` | Repairs | Đã nối | api/services/acceptanceService.ts, api/services/fastTrackService.ts |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/history` | Repairs | Đã nối | api/services/acceptanceService.ts, api/services/repairWorkflowService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/corrections` | Repairs | Đã nối | api/services/repairItemActions.ts correct ← RepairItemActions.tsx; đã chạy thật (Giám sát, hạng mục Normal) |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/review-requests` | Repairs | Đã nối | api/services/repairItemActions.ts requestReview ← RepairItemActions.tsx; đã chạy thật qua giao diện |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/safety-measures` | RepairSafety | Đã nối | api/services/repairSafetyService.ts |  |
| POST | `/projects/{}/repair-packages/{}/items/{}/safety-measures` | RepairSafety | Đã nối | api/services/repairSafetyService.ts |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/safety-measures/{}` | RepairSafety | Đã nối | repairSafetyService.read ← RepairSafetyPanel.tsx ("Xem biện pháp"); đã chạy thật (200) |  |
| GET | `/projects/{}/reports/summary` | Reporting | Đã nối | api/services/projectReportingService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/reports/items` | Reporting | Đã nối | api/services/projectReportingService.ts | pm-a:400 supervisor:400 |
| GET | `/projects/{}/reports/timeline` | Reporting | Đã nối | api/services/projectReportingService.ts, api/services/supDashboardService.ts | pm-a:400 supervisor:400 |
| GET | `/projects/{}/retention/files/{}` | Retention | Đã nối | api/services/retentionService.ts |  |
| PUT | `/projects/{}/retention/files/{}/basis` | Retention | Đã nối | api/services/retentionService.ts |  |
| GET | `/projects/{}/retention/evaluations/{}` | Retention | Đã nối | api/services/retentionService.ts |  |
| POST | `/retention/holds` | Retention | Đã nối | api/services/retentionService.ts |  |
| GET | `/retention/holds/{}` | Retention | Đã nối | api/services/retentionService.ts |  |
| POST | `/retention/holds/{}/release` | Retention | Đã nối | api/services/retentionService.ts |  |
| GET | `/projects/{}/road-coverage` | RoadCoverage | Đã nối | api/services/constructionLifecycleService.ts, api/services/coverageDocumentService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/road-coverage` | RoadCoverage | Đã nối | api/services/constructionLifecycleService.ts, api/services/coverageDocumentService.ts |  |
| POST | `/projects/{}/handover-documents` | RoadCoverage | Đã nối | api/services/handoverUploadService.ts |  |
| GET | `/users` | StaffDirectory | Đã nối | api/services/personnelService.ts | pm-a:403 supervisor:200 |
| GET | `/projects/{}/members` | StaffDirectory | Đã nối | api/services/personnelDetailRead.ts, api/services/personnelService.ts | pm-a:200 supervisor:200 |
| POST | `/projects/{}/members` | StaffDirectory | Đã nối | api/services/personnelDetailRead.ts, api/services/personnelService.ts |  |
| GET | `/projects/{}/members/eligible` | StaffDirectory | Đã nối | api/services/personnelService.ts | pm-a:200 supervisor:403 |
| POST | `/datasets/{}/assessments` | SurveyAssessments | Đã nối | api/services/surveyDatasetService.ts |  |
| GET | `/datasets/{}/assessments/{}` | SurveyAssessments | Đã nối | api/services/surveyDatasetService.ts |  |
| POST | `/projects/{}/baseline-selections` | SurveyAssessments | Đã nối | api/services/surveyDatasetService.ts, api/services/surveyService.ts |  |
| GET | `/projects/{}/baseline-selections` | SurveyAssessments | Đã nối | api/services/surveyDatasetService.ts, api/services/surveyService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/baseline-selections/{}` | SurveyAssessments | Đã nối | surveyDatasetService.baselineView ← surveys/SurveyDatasetPanel.tsx (xem lần khóa baseline); Bearer tạm |  |
| POST | `/survey-plans/{}/postpone` | SurveyV | Đã nối | api/services/surveyActions.ts |  |
| GET | `/survey-tasks/{}` | SurveyV | Đã nối | surveyPlanningService.detail(TASK) ← SurveyRecordDetailModal; URL dựng động; GET cookie PM/Giám sát đã trả 200. |  |
| GET | `/survey-plans/{}` | SurveyV | Đã nối | api/services/surveyPlanningService.ts:114 |  |
| GET | `/datasets/{}` | SurveyV | Đã nối | api/services/surveyService.ts |  |
| GET | `/survey-tasks/{}/work-package` | SurveyV | Đã nối | api/services/surveyDatasetService.ts |  |
| GET | `/survey-tasks/{}/datasets` | SurveyV | Đã nối | api/services/surveyDatasetService.ts |  |
| POST | `/survey-tasks/{}/datasets` | SurveyV | Đã nối | api/services/surveyDatasetService.ts |  |
| GET | `/datasets/{}/coverage` | SurveyV | Đã nối | api/services/surveyDatasetService.ts |  |
| POST | `/survey-tasks/{}/cancel` | SurveyV | Đã nối | api/services/surveyActions.ts |  |
| POST | `/survey-tasks/{}/reassign` | SurveyV | Đã nối | api/services/surveyActions.ts |  |
| POST | `/survey-tasks/{}/supplements` | SurveyV | Đã nối | api/services/surveyActions.ts |  |
| POST | `/projects/{}/labels` | TrainingLabels | Đã nối | api/services/trainingLabelService.ts |  |
| GET | `/projects/{}/labels` | TrainingLabels | Đã nối | api/services/trainingLabelService.ts | pm-a:200 supervisor:403 |
| GET | `/projects/{}/labels/{}` | TrainingLabels | Đã nối | api/services/trainingLabelService.ts |  |
| POST | `/projects/{}/labels/{}/revisions` | TrainingLabels | Đã nối | api/services/trainingLabelService.ts |  |
| POST | `/labels/{}/review` | TrainingLabels | Đã nối | api/services/trainingLabelService.ts |  |
| POST | `/uploads` | Uploads | Đã nối | api/services/coverageDocumentService.ts, api/services/handoverUploadService.ts |  |
| POST | `/projects/handover-upload-intents` | Uploads | Đã nối | api/services/handoverUploadService.ts |  |
| GET | `/uploads/{}` | Uploads | Đã nối | api/services/handoverUploadService.ts |  |
| POST | `/uploads/{}/part-urls` | Uploads | Đã nối | api/services/coverageDocumentService.ts, api/services/handoverUploadService.ts |  |
| POST | `/uploads/{}/complete` | Uploads | Đã nối | api/services/coverageDocumentService.ts, api/services/handoverUploadService.ts |  |
| GET | `/files/{}` | Uploads | Đã nối | api/services/coverageDocumentService.ts, api/services/sourceVideoService.ts |  |
| GET | `/files/{}/content` | Uploads | Đã nối | api/services/sourceVideoService.ts, api/services/surveyService.ts |  |
| PATCH | `/users/{}/phone-number` | Users | Đã nối | api/services/personnelService.ts |  |
| GET | `/users/{}` | Users | Đã nối | api/services/personnelService.ts |  |
| PATCH | `/users/{}` | Users | Đã nối | api/services/personnelService.ts |  |
| POST | `/users/{}/password-reset` | Users | Đã nối | api/services/personnelService.ts |  |
| GET | `/auth/web/csrf` | WebAuth | Đã nối | api/auth.ts | pm-a:200 supervisor:200 |
| POST | `/auth/web/login` | WebAuth | Đã nối | api/auth.ts |  |
| POST | `/auth/web/renew` | WebAuth | Đã nối | api/auth.ts |  |
| GET | `/auth/web/session` | WebAuth | Đã nối | api/auth.ts | pm-a:200 supervisor:200 |
| POST | `/auth/web/logout` | WebAuth | Đã nối | api/auth.ts |  |
| GET | `/projects/{}/task-assignees` | WebCoordination | Đã nối | api/services/taskAssigneeService.ts | pm-a:400 supervisor:400 |
| GET | `/users/{}/organization` | WebCoordination | Đã nối | pages/(pm)/ProfilePage.tsx, pages/(sup)/system-control/UserOrganizationEditor.tsx |  |
| PUT | `/users/{}/organization` | WebCoordination | Đã nối | pages/(pm)/ProfilePage.tsx, pages/(sup)/system-control/UserOrganizationEditor.tsx |  |
| GET | `/projects/overviews` | WebCoordination | Đã nối | api/services/projectService.ts, api/services/supDashboardService.ts | pm-a:400 supervisor:400 |
| GET | `/projects/{}/member-contacts` | WebCoordination | Đã nối | api/services/projectService.ts | pm-a:200 supervisor:200 |
| GET | `/projects/{}/repair-policies` | WebCoordination | Đã nối | api/services/fastTrackService.ts | pm-a:200 supervisor:403 |
| GET | `/projects/{}/repair-packages/{}/planning` | WebCoordination | Đã nối | api/services/proposalReadModel.ts, pages/(pm)/repair-proposals/PlanningPanel.tsx |  |
| PUT | `/projects/{}/repair-packages/{}/planning` | WebCoordination | Đã nối | api/services/proposalReadModel.ts, pages/(pm)/repair-proposals/PlanningPanel.tsx |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/planning` | WebCoordination | Đã nối | api/services/proposalReadModel.ts, pages/(pm)/repair-proposals/PlanningPanel.tsx |  |
| PUT | `/projects/{}/repair-packages/{}/items/{}/planning` | WebCoordination | Đã nối | api/services/proposalReadModel.ts, pages/(pm)/repair-proposals/PlanningPanel.tsx |  |
| GET | `/projects/{}/repair-packages/{}/items/{}/source-defect` | WebCoordination | Đã nối | api/services/defectLifecycleService.ts, pages/(pm)/repair-proposals/SourceDefectPanel.tsx |  |
| PUT | `/projects/{}/locality` | WebCoordination | Đã nối | pages/(pm)/project-overview/ProjectLocalityCard.tsx |  |
