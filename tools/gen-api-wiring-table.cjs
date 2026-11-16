// Sinh bảng theo dõi API đã nối / chưa nối vào FE: docs/integration/API-WIRING-STATUS.md
// Chạy: node tools/gen-api-wiring-table.cjs   (quét chuỗi đường dẫn trong src/, có thể sai số với đường dẫn dựng động)
const fs = require('fs'), path = require('path')
const spec = JSON.parse(fs.readFileSync('docs/contracts/openapi.json', 'utf8'))
const norm = s => s.replace(/^\/api\/v1/, '').replace(/\{[^}]+\}/g, '{}').replace(/\?.*$/, '')

// literal path -> set of FE files
const lit = new Map()
const fileText = new Map() // file -> nội dung (để dò đường dẫn dựng động)
;(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name)
    if (f.isDirectory()) { walk(fp); continue }
    if (!/\.(ts|tsx)$/.test(f.name) || /mock/i.test(f.name) || f.name === 'devFileBearer.ts' || f.name === 'api.generated.ts') continue // danh sách [TEMP-BEARER] và type sinh tự động không phải bằng chứng gọi API
    const src = fs.readFileSync(fp, 'utf8')
    const rel = fp.replace(/\\/g, '/')
    if (rel.startsWith('src/api/')) fileText.set(rel.replace(/^src\//, ''), src)
    for (const m of src.matchAll(/[`'"](\/[a-zA-Z0-9_\-\/\$\{\}\.]*)[`'"]/g)) {
      const k = m[1].replace(/\$\{[^}]+\}/g, '{}').replace(/^\/api\/v1/, '')
      if (!lit.has(k)) lit.set(k, new Set())
      lit.get(k).add(fp.replace(/\\/g, '/').replace(/^src\//, ''))
    }
  }
})('src')

// smoke results (GET) nếu có
let smoke = {}
try {
  const s = JSON.parse(fs.readFileSync(process.env.TEMP + '/smoke.json', 'utf8'))
  for (const role of Object.keys(s)) for (const r of s[role].results) (smoke[r.path] ??= {})[role] = r.status
} catch { /* chưa có */ }


// ĐÃ KIỂM CHỨNG THỦ CÔNG (đọc code gọi API và/hoặc chạy thật). Không còn trạng thái "nghi".
// kind: 'wired' (đã nối, ev = bằng chứng) | 'todo' (web cần nhưng chưa nối) | 'mobile' (ngoài phạm vi web: Crew/Operator/Reporter/offline)
const VERIFIED = {
  'POST /projects/{}/ai-mock-runs': { kind: 'wired', ev: 'surveyDatasetService.createAiRun ← surveys/SurveyDatasetPanel.tsx ("Chạy AI mock trên bộ dữ liệu"); Bearer tạm; đã chạy thật (202)' },
  'POST /projects/{}/survey-plans': { kind: 'wired', ev: 'api/services/surveyCreateCommands.ts (luồng tạo kế hoạch khảo sát đã có từ trước); đã chạy thật bằng cookie (201)' },
  'POST /projects/{}/survey-tasks': { kind: 'wired', ev: 'api/services/surveyCreateCommands.ts (luồng tạo nhiệm vụ khảo sát đã có từ trước); đã chạy thật bằng cookie (201)' },
  'POST /auth/password-recovery-requests': { kind: 'wired', ev: 'api/auth.ts requestPasswordRecoveryApi ← (auth)/login/LoginForm.tsx (nút "Quên mật khẩu?", dùng email đang nhập); đã chạy thật (202)' },
  'PUT /projects/{}/retention/files/{}/basis': { kind: 'wired', ev: 'retentionService.confirmRetentionBasis ← (sup)/system-control/RetentionBasisForm.tsx (trong chi tiết tệp lưu trữ); đã gọi BE thật, BE trả 409 retention_inventory_incomplete với tệp demo (kiểm kê chưa đầy đủ)' },
  'GET /survey-tasks/{}/work-package': { kind: 'wired', ev: 'surveyDatasetService.workPackage ← surveys/SurveyDatasetPanel.tsx ("Xem gói công việc"); Bearer tạm' },
  'POST /auth/login': { kind: 'wired', ev: 'api/devFileBearer.ts (đăng nhập Bearer tạm [TEMP-BEARER], chỉ build dev); web chính dùng /auth/web/login' },
  'POST /auth/refresh': { kind: 'mobile', why: 'Làm mới token Bearer (mobile/Bearer); web dùng cookie và /auth/web/renew' },
  'POST /auth/logout': { kind: 'mobile', why: 'Đăng xuất phiên Bearer (mobile); web dùng /auth/web/logout' },
  'POST /auth/forced-password-change': { kind: 'mobile', why: 'Đổi mật khẩu bắt buộc cho phiên chưa đăng nhập (mobile/Bearer); web dùng /auth/change-password sau khi đăng nhập bằng cookie' },
  'POST /auth/android/login': { kind: 'mobile', why: 'Đăng nhập app Android (mobile)' },
  'POST /auth/android/refresh': { kind: 'mobile', why: 'Làm mới phiên app Android (mobile)' },
  'POST /auth/reporter-registrations': { kind: 'mobile', why: 'Đăng ký Reporter (người dân, mobile); không thuộc PM/Giám sát' },
  'POST /auth/reporter-registrations/verify': { kind: 'mobile', why: 'Xác minh đăng ký Reporter (mobile)' },
  'POST /auth/reporter-registrations/resend': { kind: 'mobile', why: 'Gửi lại mã đăng ký Reporter (mobile)' },
  'GET /me/inspection-tasks': { kind: 'mobile', why: 'Danh sách nhiệm vụ của Crew đang đăng nhập (mobile)' },
  'GET /me/survey-tasks': { kind: 'mobile', why: 'Danh sách nhiệm vụ của Operator đang đăng nhập (mobile)' },
  'GET /ready': { kind: 'mobile', why: 'Health check hạ tầng, không phải chức năng web' },
  'GET /me': { kind: 'todo', why: 'Route thay thế của GET /profile đã nối (cùng dữ liệu hồ sơ cá nhân); FE dùng /profile nên không gọi /me.' },
  'PATCH /me': { kind: 'todo', why: 'Route thay thế của PUT /profile đã nối (cùng chức năng cập nhật hồ sơ); FE dùng /profile.' },
  'POST /projects/{}/survey-plans/{}/postpone': { kind: 'todo', why: 'Route hoãn kế hoạch theo dự án (luồng cũ, body newPlannedStartAt/operationId); trùng chức năng với POST /survey-plans/{}/postpone đã nối (API-GAP-NOTES mục U).' },
  'POST /projects/{}/repair-packages/{}/items/{}/safety-measures': { kind: 'wired', ev: 'api/services/repairSafetyService.ts ← (pm)/repair-proposals/RepairSafetyPanel.tsx (PM giao biện pháp an toàn cho Crew); đã chạy thật (201)' },
  'GET /projects/{}/repair-packages/{}/items/{}/safety-measures/{}': { kind: 'wired', ev: 'repairSafetyService.read ← RepairSafetyPanel.tsx ("Xem biện pháp"); đã chạy thật (200)' },
  'POST /projects/{}/repair-packages/{}/items/{}/safety-measures/{}/installation': { kind: 'mobile', why: 'BE chỉ cho Crew phụ trách (safety_responsibility_not_current với vai trò khác): lắp đặt biện pháp là thao tác hiện trường của Crew' },
  'POST /projects/{}/repair-packages/{}/items/{}/safety-measures/{}/checks': { kind: 'mobile', why: 'BE chỉ cho Crew phụ trách: kiểm tra định kỳ biện pháp an toàn là thao tác hiện trường của Crew' },
  'POST /projects/{}/repair-packages/{}/items/{}/safety-measures/{}/warnings/{}/acknowledgement': { kind: 'mobile', why: 'BE chỉ cho Crew phụ trách: xác nhận cảnh báo an toàn là thao tác của Crew' },
  'POST /projects/{}/field-inspection-tasks/{}/location-impact-decisions': { kind: 'wired', ev: 'fieldTaskActions.locationImpact ← (pm)/field-tasks/FieldTaskImpactPanel.tsx (trong chi tiết nhiệm vụ đo, PM); khung đọc danh sách ảnh hưởng thật từ BE (hiện rỗng); chưa chạy thật vì cần đổi phiên bản tuyến để sinh ảnh hưởng (sẽ đổi hình học hiện hành của dự án demo)' },
  'POST /projects/{}/labels': { kind: 'wired', ev: 'api/services/trainingLabelService.ts ← (sup)/research/TrainingLabelsPanel.tsx (PM, trang /pm/research-validation); đã chạy thật (201)' },
  'GET /projects/{}/labels': { kind: 'wired', ev: 'trainingLabelService.list ← TrainingLabelsPanel.tsx; đã chạy thật' },
  'GET /projects/{}/labels/{}': { kind: 'wired', ev: 'trainingLabelService.read (lấy version mới nhất trước khi sửa/duyệt) ← TrainingLabelsPanel.tsx' },
  'POST /projects/{}/labels/{}/revisions': { kind: 'wired', ev: 'trainingLabelService.revise ← TrainingLabelsPanel.tsx; đã chạy thật (201)' },
  'POST /labels/{}/review': { kind: 'wired', ev: 'trainingLabelService.review ← TrainingLabelsPanel.tsx; đã chạy thật (200)' },
  'POST /projects/{}/defects/{}/publications': { kind: 'wired', ev: 'api/services/publicPublicationService.ts ← (pm)/defect-verify/DefectPublicationPanel.tsx (PM, khiếm khuyết VERIFIED); đã gọi BE qua API: 409 source_not_ready với khiếm khuyết OPEN, chưa có khiếm khuyết VERIFIED để chạy thành công' },
  'POST /projects/{}/publications/{}/withdraw': { kind: 'wired', ev: 'publicPublicationService.withdraw ← DefectPublicationPanel.tsx; chưa chạy thật (chưa có bản xuất bản)' },
  'POST /projects/{}/defect-statistics': { kind: 'wired', ev: 'api/services/defectStatisticsService.ts ← (sup)/risk-analytics/DefectStatisticsPanel.tsx (PM, /pm/reports); đã chạy thật (201)' },
  'POST /projects/{}/lifecycle/renewed-handling-scope': { kind: 'wired', ev: 'api/services/lifecycleRenewService.ts ← (pm)/project-overview/ProjectRenewScopeCard.tsx (Giám sát); đã dựng và đọc vòng đời thật, chưa chạy thật vì dự án demo chưa có bản ghi đóng vận hành' },
  'GET /projects/{}/baseline-selections/{}': { kind: 'wired', ev: 'surveyDatasetService.baselineView ← surveys/SurveyDatasetPanel.tsx (xem lần khóa baseline); Bearer tạm' },
  'GET /projects/{}/processing-jobs': { kind: 'wired', ev: 'surveyDatasetService.jobs ← SurveyDatasetPanel.tsx; đã chạy thật (cookie)' },
  'GET /projects/{}/receiving-requests': { kind: 'wired', ev: 'api/services/dutyService.ts ← notifications/DutyPanel.tsx (trong NotificationsHandoffHub); đã chạy thật PM + Giám sát' },
  'GET /projects/{}/receiving-requests/{}': { kind: 'wired', ev: 'dutyService.request (đọc version mới nhất trước ack/appointment) ← DutyPanel.tsx' },
  'POST /projects/{}/receiving-requests/{}/ack': { kind: 'wired', ev: 'dutyService.ack ← DutyPanel.tsx (nút chỉ hiện cho người chịu trách nhiệm hiện tại); chưa chạy thật: yêu cầu demo thuộc Crew (mobile), web không phải người nhận' },
  'POST /projects/{}/receiving-requests/{}/appointment': { kind: 'wired', ev: 'dutyService.appointRequest ← DutyPanel.tsx (Giám sát, kind SupervisorEscalation); chưa chạy thật: demo chưa có SupervisorEscalation (cần quá hạn PM review)' },
  'POST /projects/{}/clocks/{}/appointments': { kind: 'wired', ev: 'dutyService.appointClock ← DutyPanel.tsx (Giám sát); đã chạy thật (201, cookie)' },
  'GET /projects/{}/weekly-digests/{}': { kind: 'wired', ev: 'dutyService.digest ← DutyPanel.tsx (nhập mã bản tóm tắt); đã gọi thật nhưng chưa có bản tóm tắt thật để đọc (BE trả 404 hiển thị đúng)' },
  'GET /projects/{}/repair-packages/{}/items/{}/notification-supervisor': { kind: 'wired', ev: 'api/services/notificationSupervisorService.ts ← repair-proposals/NotificationSupervisorPanel.tsx; đã chạy thật' },
  'PUT /projects/{}/repair-packages/{}/items/{}/notification-supervisor': { kind: 'wired', ev: 'notificationSupervisorService.assign ← NotificationSupervisorPanel.tsx; đã gọi thật, BE trả 409 invalid_state_transition (hạng mục demo đã Cancelled), chưa có hạng mục Fast Track đang hoạt động để tạo thành công' },
  'DELETE /projects/{}/repair-packages/{}/items/{}/notification-supervisor': { kind: 'wired', ev: 'notificationSupervisorService.revoke ← NotificationSupervisorPanel.tsx; đã chạy thật (204)' },
  'GET /datasets/{}': { kind: 'wired', ev: 'api/services/surveyDatasetService.ts ← surveys/SurveyDatasetPanel.tsx; Bearer tạm [TEMP-BEARER]; đã chạy thật' },
  'GET /datasets/{}/coverage': { kind: 'wired', ev: 'surveyDatasetService.coverage ← SurveyDatasetPanel.tsx; Bearer tạm; đã chạy thật' },
  'POST /datasets/{}/assessments': { kind: 'wired', ev: 'surveyDatasetService.createAssessment ← SurveyDatasetPanel.tsx; Bearer tạm; đã chạy thật (201)' },
  'GET /datasets/{}/assessments/{}': { kind: 'wired', ev: 'surveyDatasetService.assessment ← SurveyDatasetPanel.tsx (đọc khi dataset đã có đánh giá); Bearer tạm' },
  'POST /projects/{}/baseline-selections': { kind: 'wired', ev: 'surveyDatasetService.lockBaseline ← SurveyDatasetPanel.tsx; Bearer tạm; đã chạy thật (201)' },
  'POST /processing-jobs': { kind: 'wired', ev: 'surveyDatasetService.createJob ← SurveyDatasetPanel.tsx; Bearer tạm; đã chạy thật (202)' },
  'GET /processing-jobs/{}': { kind: 'wired', ev: 'surveyDatasetService.job ← SurveyDatasetPanel.tsx; Bearer tạm; đã chạy thật' },
  'POST /processing-jobs/{}/retry': { kind: 'wired', ev: 'surveyDatasetService.retryJob ← SurveyDatasetPanel.tsx; Bearer tạm; chưa chạy thật (job QUEUED chưa có trạng thái được phép chạy lại)' },
  'POST /survey-plans/{}/postpone': { kind: 'wired', ev: 'api/services/surveyActions.ts ← surveys/SurveyRecordActions.tsx; Bearer tạm; đã chạy thật (200)' },
  'POST /survey-tasks/{}/cancel': { kind: 'wired', ev: 'surveyActions.cancelTask ← SurveyRecordActions.tsx; Bearer tạm; đã chạy thật (200)' },
  'POST /survey-tasks/{}/reassign': { kind: 'wired', ev: 'surveyActions.reassignTask ← SurveyRecordActions.tsx; Bearer tạm; đã chạy thật (200)' },
  'GET /projects/{}/field-inspection-tasks/{}/evidence/{}/content': { kind: 'wired', ev: 'api/services/fieldTaskReadService.ts:13' },
  'POST /projects/{}/road-sections/{}/versions/{}/segment-sets/preview': { kind: 'wired', ev: 'api/services/segmentSetService.ts:64' },
  'POST /projects/{}/road-sections/{}/versions/{}/segment-sets/{}/publish': { kind: 'wired', ev: 'api/services/segmentSetService.ts:74' },
  'GET /projects/{}/geometry-map-publications/{}/layers/{}': { kind: 'wired', ev: 'api/services/geometryImpactService.ts:79, mapPublicationService.ts:84' },
  'POST /projects/{}/geometry-location-impacts/{}/decisions': { kind: 'wired', ev: 'api/services/geometryImpactCommands.ts:59' },
  'GET /projects/{}/repair-policies/revisions/{}': { kind: 'wired', ev: 'api/services/fastTrackService.ts:79 (getPolicyRevision)' },
  'GET /uploads/{}': { kind: 'wired', ev: 'api/services/coverageDocumentService.ts:32' },
  'GET /survey-plans/{}': { kind: 'wired', ev: 'api/services/surveyPlanningService.ts:114' },
  'GET /projects/{}/retention/files/{}': { kind: 'wired', ev: 'api/services/retentionService.ts getRetentionFile + màn ProjectRetentionDetailModal (đã chạy thật)' },
  'POST /projects/{}/repair-packages/{}/items/{}/assign': { kind: 'wired', ev: 'api/services/repairService.ts assignNormalItem + màn /pm/repair-batches/assign (Normal); Fast Track: fastTrackService.executeDispatch' },
  'POST /cases/{}/report-links': { kind: 'wired', ev: 'api/services/triageService.ts:639 (linkDuplicateReports) ← ai-review/useAIReviewLinkActions.ts:69' },
  'POST /cases/{}/report-splits': { kind: 'wired', ev: 'api/services/triageService.ts:662 (splitReport) ← ai-review/useAIReviewLinkActions.ts:88' },
  'POST /cases/{}/publications': { kind: 'wired', ev: 'api/services/triageService.ts:607 (publishCase) ← ai-review/useAIReviewActions.ts:163' },
  'GET /projects/{}/defect-statistics': { kind: 'wired', ev: 'api/services/projectService.ts:577 (Supervisor đọc thống kê thay danh sách khuyết tật)' },
  'POST /users/{}/password-reset': { kind: 'wired', ev: 'api/services/personnelService.ts adminResetPassword ← usePersonnelState.handleConfirmResetPassword (chưa chạy thật: thao tác đổi mật khẩu tài khoản bị chặn khi kiểm thử)' },
  'POST /admin/users/{}/password-reset': { kind: 'todo', why: 'Route thay thế của POST /users/{}/password-reset đã nối; chức năng tương đương đã có.' },
  'POST /projects/{}/repair-packages/{}/items/{}/tasks/{}/assessment': { kind: 'mobile', why: 'Crew đánh giá trước thi công trên app hiện trường (RepairExecutionController chỉ cho vai Crew).' },
  'POST /projects/{}/repair-packages/{}/items/{}/tasks/{}/execution-start': { kind: 'mobile', why: 'Crew bắt đầu thi công trên app hiện trường.' },
  'POST /projects/{}/repair-packages/{}/items/{}/tasks/{}/execution-finish': { kind: 'mobile', why: 'Crew kết thúc thi công trên app hiện trường.' },
  'POST /projects/{}/field-inspection-tasks/{}/assign': { kind: 'wired', ev: 'api/services/fieldTaskActions.ts ← field-tasks/FieldTaskReadDetails.tsx (giao khi chưa có người nhận); đã chạy thật' },
  'POST /projects/{}/field-inspection-tasks/{}/reassign': { kind: 'wired', ev: 'api/services/fieldTaskActions.ts ← field-tasks/FieldTaskReadDetails.tsx; đã chạy thật qua giao diện (sự kiện REASSIGNED)' },
  'POST /projects/{}/field-inspection-tasks/{}/cancel': { kind: 'wired', ev: 'api/services/fieldTaskActions.ts ← field-tasks/FieldTaskReadDetails.tsx; đã chạy thật qua giao diện (Cancelled)' },
  'POST /projects/{}/repair-packages/{}/items/{}/cancellations': { kind: 'wired', ev: 'api/services/repairItemActions.ts cancel ← repair-proposals/RepairItemActions.tsx; đã chạy thật qua giao diện' },
  'POST /projects/{}/repair-packages/{}/items/{}/normal-successors': { kind: 'wired', ev: 'api/services/repairItemActions.ts continueNormally ← RepairItemActions.tsx; đã chạy thật (từ hạng mục đã hủy và từ hạng mục cần hiệu chỉnh)' },
  'POST /projects/{}/repair-packages/{}/items/{}/corrections': { kind: 'wired', ev: 'api/services/repairItemActions.ts correct ← RepairItemActions.tsx; đã chạy thật (Giám sát, hạng mục Normal)' },
  'POST /projects/{}/repair-packages/{}/items/{}/review-requests': { kind: 'wired', ev: 'api/services/repairItemActions.ts requestReview ← RepairItemActions.tsx; đã chạy thật qua giao diện' },
  'GET /projects/{}/ai-mock-runs/{}': { kind: 'wired', ev: 'api/services/aiRunDetailService.ts ← (sup)/research/AiRunDetailPanel.tsx (chi tiết một lần chạy AI: trạng thái, mã lỗi, version); Bearer tạm' },
  'POST /projects/{}/road-sections/{}/survey-plans': { kind: 'todo', why: 'Luồng khảo sát cũ theo road-section-version (có operationId), trùng chức năng với POST /projects/{}/survey-plans + survey-tasks đã nối; chờ chủ BE xác nhận luồng chuẩn trước khi dựng thêm form (API-GAP-NOTES mục U).' },
  'GET /projects/{}/field-inspection-tasks/{}/geometry': { kind: 'mobile', why: 'Crew đọc hình học nhiệm vụ trên app hiện trường.' },
  'POST /projects/{}/field-inspection-tasks/{}/accept': { kind: 'mobile', why: 'Crew nhận nhiệm vụ trên app hiện trường.' },
  'POST /projects/{}/field-inspection-tasks/{}/reject': { kind: 'mobile', why: 'Crew từ chối nhiệm vụ trên app hiện trường.' },
  'POST /projects/{}/field-inspection-tasks/{}/submissions': { kind: 'mobile', why: 'Crew nộp kết quả đo/thi công trên app hiện trường (web chỉ đọc bản nộp).' },
  'POST /projects/{}/repair-packages/{}/items/{}/tasks/{}/attempts': { kind: 'mobile', why: 'Crew gắn lần thi công vào hạng mục (web dùng attempts/reviews của PM).' },
  'POST /projects/{}/repair-packages/{}/items/{}/tasks/{}/attempts/supplements': { kind: 'mobile', why: 'Crew nộp bổ sung sau yêu cầu của PM.' },
  'POST /survey-tasks/{}/accept': { kind: 'mobile', why: 'Phi công (Operator) nhận nhiệm vụ bay.' },
  'POST /survey-tasks/{}/datasets': { kind: 'mobile', why: 'Phi công (Operator) tải bộ dữ liệu bay.' },
  'GET /survey-tasks/{}/work-package': { kind: 'mobile', why: 'Phi công (Operator) đọc gói công việc bay.' },
  'POST /projects/{}/offline/devices/{}/revoke': { kind: 'mobile', why: 'Quản lý thiết bị offline/mobile; web không dùng.' },
  'POST /projects/{}/offline/grants/{}/revoke': { kind: 'mobile', why: 'Quản lý quyền offline/mobile; web không dùng.' },
  'GET /reporter-evidence/uploads/{}': { kind: 'mobile', why: 'Người dân (Reporter) tải bằng chứng; PM/Sup đọc qua /cases/{id}/reports.' },
  'POST /reporter-evidence/uploads/{}/part-urls': { kind: 'mobile', why: 'Reporter tải bằng chứng.' },
  'POST /reporter-evidence/uploads/{}/complete': { kind: 'mobile', why: 'Reporter tải bằng chứng.' },
  'GET /reporter-evidence/files/{}': { kind: 'mobile', why: 'Reporter đọc tệp của chính mình; PM/Sup đọc qua /cases/{id}/reports/{id}/evidence/{id}/content.' },
  'GET /reporter-evidence/files/{}/content': { kind: 'mobile', why: 'Reporter đọc nội dung tệp của chính mình.' },
  'GET /reporter-evidence/publications/{}/reports/{}/evidence/{}/content': { kind: 'mobile', why: 'Đường công khai cho người dân; web nội bộ dùng /cases/.../content.' },
  'GET /reports/{}': { kind: 'mobile', why: 'Reporter đọc báo cáo của mình; web dùng /cases/{id}/reports.' },
  'POST /reports/{}/supplements': { kind: 'mobile', why: 'Reporter bổ sung báo cáo.' },
}

const OUT = [
  [/^\/(offline)|\/offline\//, 'Ngoài phạm vi web PM/Sup: luồng thiết bị offline/mobile (Crew, Operator)'],
  [/reporter-evidence|^\/reports(\/|$)/, 'Ngoài phạm vi: thuộc vai Reporter (app người dân). PM/Sup đọc qua `/cases/{id}/reports`'],
  [/^\/uploads/, 'Ngoài phạm vi: upload do Crew/Operator/mobile thực hiện'],
  [/^\/internal|processing-jobs\/\{\}\/(retry|results)|^\/processing-jobs/, 'Ngoài phạm vi: callback/hàng đợi nội bộ AI service'],
  [/survey-tasks\/\{\}\/(accept|decline|datasets|work-package|reassign|cancel)|eligible-drones/, 'Ngoài phạm vi: thao tác của Drone Operator (app)'],
  [/field-inspection-tasks\/\{\}\/(accept|reject|start|submissions|start-origin|geometry|evidence)/, 'Ngoài phạm vi: thao tác của Crew (app hiện trường)'],
  [/^\/public\/publications/, 'Ngoài phạm vi: endpoint công khai cho người dân, không thuộc web nội bộ'],
]
const BYTAG = {
  RepairExecution: 'Chưa nối — nhóm thi công/nghiệm thu sửa chữa (giai đoạn 9–10). BE chưa có repair-package trong dữ liệu để kiểm chứng.',
  RepairSafety: 'Chưa nối — nhóm an toàn thi công (giai đoạn 9–10). Chưa có dữ liệu repair-package để kiểm chứng.',
  RepairLifecycle: 'Chưa nối — nhóm vòng đời hạng mục sửa chữa (giai đoạn 9–10). Chưa có dữ liệu để kiểm chứng.',
  Repairs: 'Chưa nối — nhóm đề xuất/duyệt sửa chữa (giai đoạn 9). Chưa có dữ liệu để kiểm chứng.',
  RepairPolicies: 'Chưa nối — GET revision chính sách; luồng draft/publish đã nối, chưa có màn hình xem revision.',
  H6NotificationOperations: 'Chưa nối — weekly digest chưa có màn hình (GET clocks đã nối ở dashboard PM).',
  ClockDuty: 'Chưa nối — chỉ định người phụ trách (appointments) chưa có màn hình; gia hạn (extensions) đã nối ở widget dashboard PM.',
  BusinessDuty: 'Chưa nối — chưa có màn hình tiếp nhận yêu cầu bàn giao; dữ liệu seed trống.',
  DefectStatistics: 'Chưa nối — chưa có màn hình thống kê khiếm khuyết đọc từ BE (FE còn dùng dữ liệu cục bộ).',
  Retention: 'Chưa nối — chưa có màn hình retention hold/basis.',
  TrainingLabels: 'Chưa nối — chưa có màn hình gán nhãn huấn luyện; Sup bị 403 ở GET labels (chỉ PM).',
  NotificationSupervisor: 'Chưa nối — chưa có màn hình chỉ định Supervisor nhận thông báo theo hạng mục sửa chữa.',
  SurveyPlanning: 'Chưa nối — chưa làm luồng lập kế hoạch/yêu cầu khảo sát theo road-section.',
  SurveyV: 'Chưa nối — chưa làm (postpone / chi tiết kế hoạch khảo sát).',
  SurveyAssessments: 'Chưa nối — chưa làm (chi tiết assessment/baseline theo id).',
  GeometryWorkflow: 'Chưa nối — chưa làm (submit/reject/publish segment-set).',
  PavementWorkflow: 'Chưa nối — chưa làm (layer/decision location-impact).',
  AdminUsers: 'Chưa nối — chưa làm reset mật khẩu (quản lý nhân sự chưa tới hạng mục).',
  Cases: 'Chưa nối — chưa làm (report-links/splits/publications của ca).',
  PublicPublications: 'Chưa nối — chưa làm (xuất bản/rút xuất bản công khai).',
  ProjectLifecycle: 'Chưa nối — chưa làm (renewed-handling-scope).',
  FieldInspectionWorkflow: 'Chưa nối — PM giao/đổi/hủy nhiệm vụ hiện trường chưa làm.',
  DiscoveryCollections: 'Chưa nối — danh sách khám phá; một phần thuộc luồng offline/AI.',
  AiMockRuns: 'Chưa nối — chi tiết một lần chạy AI theo runId (đã nối danh sách và result).',
  Users: 'Chưa nối — chưa làm (chi tiết/sửa user).',
}

// Dò đường dẫn dựng động trong src/api: khớp đoạn tĩnh cuối + đoạn tĩnh liền trước, cùng method (axios.<method>)
function dynamicHit(n, method) {
  const statics = n.split('/').filter(x => x && x !== '{}')
  const last = statics[statics.length - 1]
  if (!last || last.length < 5) return null
  const esc = last.replace(/-/g, '\\-')
  const re = new RegExp('[`\'"][^`\'"]*/' + esc + '([`\'"?/]|$)')
  const hits = []
  for (const [file, text] of fileText) if (/apiClient|axios/.test(text) && re.test(text)) hits.push(file)
  return hits.length ? hits : null
}
const rows = []
for (const [p, v] of Object.entries(spec.paths)) for (const m of Object.keys(v)) {
  if (!['get', 'post', 'put', 'patch', 'delete'].includes(m)) continue
  const n = norm(p), tag = (v[m].tags || ['-'])[0]
  const files = lit.get(n) || lit.get('/api/v1' + n)
  let status, note = ''
  if (files) { status = 'Đã nối'; note = [...files].slice(0, 2).join(', ') }
  else if (VERIFIED[m.toUpperCase() + ' ' + n]?.kind === 'wired') { status = 'Đã nối'; note = VERIFIED[m.toUpperCase() + ' ' + n].ev }
  else if (VERIFIED[m.toUpperCase() + ' ' + n]) { const v = VERIFIED[m.toUpperCase() + ' ' + n]; status = 'Chưa nối'; note = (v.kind === 'mobile' ? 'Ngoài phạm vi web (mobile/Crew/Operator/Reporter/offline): ' : 'Chưa nối — ') + v.why }
  else {
    status = 'Chưa nối'
    const o = OUT.find(([re]) => re.test(n))
    note = o ? o[1] : (BYTAG[tag] || BYTAG[tag.replace(/V\d+$/, 'V')] || 'Chưa nối — chưa làm (chưa có màn hình/luồng FE tương ứng).')
  }
  const sm = m === 'get' && smoke[n.replace(/\{\}/, '{projectId}')]
  const smoked = sm ? Object.entries(sm).map(([r, s]) => `${r}:${s}`).join(' ') : ''
  rows.push({ m: m.toUpperCase(), p: n, tag, status, note, smoked })
}
const done = rows.filter(r => r.status === 'Đã nối'), maybe = rows.filter(r => r.status === 'Nghi đã nối'), todo = rows.filter(r => r.status === 'Chưa nối')
const outScope = todo.filter(r => r.note.startsWith('Ngoài phạm vi'))
const esc = s => s.replace(/\|/g, '\\|')
const line = r => `| ${r.m} | \`${esc(r.p)}\` | ${r.tag} | ${r.status} | ${esc(r.note)} | ${r.smoked} |`
const head = '| Method | Path | Controller | Trạng thái | FE gọi từ file / Lý do chưa nối | Smoke BE thật (GET) |\n|---|---|---|---|---|---|'
const md = `# Bảng theo dõi nối API BE ↔ FE

> Sinh tự động bởi \`node tools/gen-api-wiring-table.cjs\` ngày ${new Date().toISOString().slice(0, 10)}. Nguồn: \`docs/contracts/openapi.json\` so với chuỗi đường dẫn trong \`src/\`.
> "Đã nối" = tìm thấy chuỗi đường dẫn trong code FE (không đồng nghĩa đã kiểm chứng nghiệm thu). Đường dẫn dựng động có thể bị bỏ sót → cần rà lại khi nghi ngờ.
> Cột Smoke = mã HTTP khi gọi thật với BE local (chỉ endpoint GET chỉ cần projectId; PM/SUP). 200 = BE trả được; 400/401/403 = thiếu tham số hoặc đúng phân quyền theo vai.

## Tổng quan
| Chỉ số | Số lượng |
|---|---|
| Tổng operation trong OpenAPI | ${rows.length} |
| **Đã nối** | ${done.length} |
| **Nghi đã nối** (đường dẫn dựng động, cần xác minh) | ${maybe.length} |
| **Chưa nối** | ${todo.length} |
| — trong đó ngoài phạm vi web PM/Sup | ${outScope.length} |
| — trong đó cần làm cho web | ${todo.length - outScope.length} |

## 1. Chưa nối — cần làm cho web PM/Sup (${todo.length - outScope.length})
${head}
${todo.filter(r => !r.note.startsWith('Ngoài phạm vi')).map(line).join('\n')}

## 2. Chưa nối — ngoài phạm vi web PM/Sup (${outScope.length})
${head}
${outScope.map(line).join('\n')}

## 3. Nghi đã nối — đường dẫn dựng động (${maybe.length})
${head}
${maybe.map(line).join('\n')}

## 4. Đã nối (${done.length})
${head}
${done.map(line).join('\n')}
`
fs.writeFileSync('docs/integration/API-WIRING-STATUS.md', md)
console.log(`total=${rows.length} done=${done.length} todo=${todo.length} outScope=${outScope.length}`)
