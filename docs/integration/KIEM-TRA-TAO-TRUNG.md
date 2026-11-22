# Kiểm tra lỗi "tạo 1 ra 2" (tạo trùng) phía FE

Phạm vi: rà code tĩnh FE (`src/api`, `src/pages`, `src/components`, `src/store`, `src/main.tsx`). Không chạy test động. Kết luận: **không tìm thấy lỗi gốc ở tầng HTTP/interceptor**; nguy cơ nằm ở các handler ghi chưa có chốt in-flight đồng bộ. Đã bổ sung chốt cho các handler đó.

## 1. Cơ chế Idempotency-Key của FE

- Không có lớp tự sinh key trong interceptor. Mỗi service tự gắn `Idempotency-Key: crypto.randomUUID()` (và `If-Match`) vào header của từng lệnh ghi.
- Hai mẫu:
  1. **Journal (lệnh quan trọng)**: key sinh một lần khi tạo "ý định", lưu `localStorage/sessionStorage` hoặc biến module (ví dụ `projectService.createProject`, `surveyCreateCommands`, `repairWorkflowService.createAndPropose`, `triageService`, `geometry*Commands`, `personnelService`, `profileService`). Retry do người dùng bấm lại dùng lại đúng key + body, nên BE dedupe được.
  2. **Key mới mỗi lần gọi (lệnh đơn giản)**: `dutyService`, `repairItemActions`, `repairSafetyService`, `surveyActions`, `retentionService`, `trainingLabelService`, `acceptanceService`, `validationService`, `lifecycleRenewService`, `publicPublicationService`, `defectStatisticsService`, `surveyService` (PATCH detection, decideCandidate...). Nếu UI gọi hai lần thì BE thấy hai key khác nhau, tức hai lệnh độc lập. Đây là chỗ cần chốt ở UI.
- `src/api/client.ts` (`apiClient`):
  - Request interceptor: gắn `X-CSRF-TOKEN` cho mutation, huỷ nếu phiên (epoch) đã đổi. Không sinh key.
  - Response interceptor 401: chỉ `recoverSession()` rồi **chỉ replay GET/HEAD**; mutation bị `throw error`, không phát lại (comment dòng 66). Không có axios-retry, không có `retry` trong QueryClient (`src/main.tsx` chỉ cấu hình `queries`; không dùng `useMutation`).
  - Kết luận: interceptor không tự gửi lại POST, không thể tạo hai bản ghi với hai key khác nhau.
- `checkSession/recoverSession/ensureCsrfToken` dùng promise dùng chung theo epoch, nên React.StrictMode (effect chạy 2 lần) không gửi renew/csrf hai lần.
- Cơ chế phía BE (Idempotency-Key + If-Match) chưa đọc lại trong lượt này; FE giả định BE trả cùng kết quả khi cùng key + cùng body.

## 2. Bảng nơi có nguy cơ trùng

Dòng ghi gần đúng sau khi sửa.

| Nơi (file) | Nguyên nhân | Xử lý |
|---|---|---|
| `src/api/client.ts` (interceptor 401) | Có thể phát lại request? Không: chỉ GET/HEAD | Không cần sửa |
| `src/main.tsx` StrictMode + `App.tsx` effect | `checkSession` chạy hai lần | Không cần sửa (dùng chung promise `bootstrap/recovery/csrf`) |
| `useEffect` có lệnh ghi khi mount | Rà toàn `src`: không có POST/PUT/PATCH/DELETE chạy khi mount. `CreateSurvey.tsx` effect gọi `surveyCreateCommands.run(projectId)` không truyền input, chỉ đọc lại kết quả lệnh đã DONE | Không cần sửa; cần test động xác nhận `run` không POST |
| `src/pages/(pm)/AssignCrew.tsx` `handleAssign` | Chỉ có `setSubmitting` state, không có `if` chặn; key mới mỗi lần | **Đã sửa** (ref guard) |
| `src/pages/(pm)/DroneMissionAIReview.tsx` `handleSimulateFlight` | State `isSimulating` đặt sau, không chặn lặp | **Đã sửa** |
| `src/pages/(pm)/DefectDetailVerify.tsx` `handleVerify`, `handleResetDecision`, `handleLinkRecurrence`, `handleSaveBbox` | Chỉ `setIsSubmitting`, không chặn vào lại; `assess` rồi `verify` mỗi lệnh key mới | **Đã sửa** (`decisionGuard`, `bboxGuard`) |
| `src/pages/(pm)/drone-review/useDroneMissionReview.ts` approve/reject/reset detection, `handleSubmitReFlight`, `handleLockBaseline`, `handleConfirmBaseline` | Không có chốt in-flight; hai nút khoá baseline cùng gọi `lockBaseline` | **Đã sửa** (3 guard) |
| `src/pages/(pm)/ai-review/useAIReviewSurveyActions.ts` `handleConfirmRequestSurvey` | Không chốt; `concludeCase` key mới mỗi lần | **Đã sửa** |
| `src/pages/(sup)/EvidenceCloseoutDetail.tsx` rework/accept/closeFastTrack/submitToSupervisor/closeCompositeCase | Không chốt cả 5 handler | **Đã sửa** (một `writeGuard` dùng chung) |
| `src/pages/(sup)/system-control/useLegalHoldState.ts` setLegalHold/approve/reject/requestDeletion | Không chốt; `requestDeletion` tạo yêu cầu xoá | **Đã sửa** |
| `src/pages/(sup)/ResearchValidation.tsx` `handleTriggerValidation`, `handleCancelJob` | Tạo job kiểm định, không chốt | **Đã sửa** |
| `src/pages/(pm)/OfflineConflicts.tsx` `handleConfirmResolve` | Không chốt | **Đã sửa** |
| `src/pages/(pm)/projects/CloseProjectModal.tsx` `handleSubmit` | Dựa vào nút disabled sau render; Enter lặp trong form có thể vào hai lần | **Đã sửa** (cũng che `ProjectList` và `ProjectOverview`) |
| `src/pages/(sup)/proposal-approval/useProposalApprovalState.ts` quick approve + batch approve | Không chốt; duyệt hàng loạt có thể chạy hai vòng | **Đã sửa** (`approveGuard`) |
| Các panel dùng `busy` state + `if (busy) return`: `DutyPanel`, `DefectPublicationPanel`, `RepairItemActions`, `RepairSafetyPanel`, `NotificationSupervisorPanel`, `SurveyDatasetPanel`, `SurveyRecordActions`, `TrainingLabelsPanel`, `DefectStatisticsPanel`, `RetentionBasisForm`, `ProjectRenewScopeCard`, `ProjectWarrantyCard`, `AddProjectMemberModal`, `OperationalClocksWidget`, `ProjectList` (create) | Chốt bằng state: đủ cho double-click thật nhưng test động chế độ `rapid` (hai click cùng tick) cho thấy ra 2 lệnh ghi | **Đã sửa (2026-11-17, sau test động)**: thêm `useSubmitGuard` (ref) cho `TrainingLabelsPanel`, `SurveyRecordActions`, `SurveyDatasetPanel`, `FieldTaskReadDetails` (giao lại/hủy), `FieldTaskImpactPanel`, `OperationalClocksWidget`, `DutyPanel`, `RepairItemActions`, `RepairSafetyPanel`, `NotificationSupervisorPanel`, `DefectPublicationPanel`, `RetentionBasisForm`, `DefectStatisticsPanel`, `ProjectRenewScopeCard`; release trong `finally`. Còn dựa state: `ProjectWarrantyCard`, `AddProjectMemberModal`, `ProjectList` (tạo dự án; service có cờ `busy` + journal chặn lệnh thứ hai), `CloseProjectModal`/`ResetPasswordModal`/`FastTrackDispatchModal`/`MeasurementsTab` (đã có journal hoặc guard khác, chưa test rapid). `AiRunDetailPanel` chỉ đọc, không cần |
| Lệnh dùng journal có ref: `useCaseIntake`, `useCaseEvidenceRequest`, `useGeometrySubmission`, `useAIReviewActions` (publish), `Geometry*`, `MapPublicationPanel` | Đã có `running/publishing.current` và key giữ trong journal | Không cần sửa |
| Danh sách nối trang "Tải thêm" (`SurveyDatasetPanel.more`) | Append `[...l, ...p.items]` không khử trùng id; chặn bằng `busy` | Không sửa; các service khác đọc hết trang trong vòng lặp có `seen` cursor |
| Xử lý ngăn nổi bọt (row cha `onClick` + nút con) / form có cả `onSubmit` và `onClick` submit | Grep không tìm thấy mẫu nguy hiểm | Không cần sửa |
| `Promise.all` gọi trùng rồi nối mảng, zustand push hai lần | Không phát hiện trong phần đã rà | Chưa rà hết từng store |

## 3. Cách sửa

- Thêm `src/hooks/useSubmitGuard.ts` (không thêm package): trả về `{ acquire(), release() }` dựa trên `useRef`. Dùng: `if (!guard.acquire()) return` ngay trước `try`, `guard.release()` trong `finally`. Chốt đồng bộ, không phụ thuộc render.
- Không đổi chữ, UI, hợp đồng API. Các `useState` loading cũ giữ nguyên.
- Lưu ý: guard dùng chung giữa nhiều nút trong cùng màn (ví dụ approve/reject/reset detection) nên thao tác thứ hai khi thao tác đầu chưa xong bị bỏ qua im lặng.

### Cập nhật 2026-11-17 (sau kiểm tra động, xem `KIEM-TRA-TAO-TRUNG-DONG.md`)
- `dashboardService.extendClock`: `If-Match` giờ bọc dấu ngoặc kép (trước đây BE trả 400). Đã rà toàn `src/api`: các service khác đều đã bọc ngoặc kép hoặc lấy nguyên ETag từ header GET.
- Tạo dự án: bước đọc lại báo lỗi giả "phân công PM chưa khớp" khi ngày bàn giao ở tương lai (BE chỉ trả PM chính khi membership đã hiệu lực, `ValidFrom` = ngày bàn giao). Đã đối chiếu PM bằng receipt 201 trong trường hợp đó (`projectService.ts` createProject). Khi đọc lại lỗi mà đã có receipt, `ProjectList` đọc lại danh sách thật để dự án mới hiện ra.
- Đọc trùng: `projectService.fetchProjects` gộp các lần gọi đồng thời (một lượt N+1) và xóa gộp khi vừa nhận 201 tạo dự án. `surveyPlanningService.missions` gom đọc work-package/geometry-package/members theo dự án và phạm vi trong cùng một lượt (trước 41/41/36 lần, nay 2/2/2 trên `/pm/surveys`).
- "Đánh dấu tất cả đã đọc": đã tuần tự, có `markingAll` ref chặn bấm đúp; giữ nguyên.

## 4. Chỗ cần agent test động kiểm chứng

1. Bấm dồn (dblclick, Enter lặp) vào: Giao việc (`AssignCrew`), Đóng dự án, Duyệt hàng loạt, Chạy kiểm định, Yêu cầu bay bù, Khoá baseline, Chấp nhận/Báo sai khiếm khuyết. Đếm POST/PATCH tới BE: kỳ vọng đúng 1.
2. Các panel dùng chốt `busy` state: bấm hai lần trong vài ms, xem có 2 POST không.
3. Tạo dự án / tạo khảo sát / tạo đề xuất sửa chữa: kiểm `Idempotency-Key` giữ nguyên khi bấm lại sau lỗi mạng/timeout (15s), và BE có trả cùng bản ghi.
4. Nếu vẫn thấy "tạo 1 ra 2" ở màn không nằm trong bảng trên: kiểm tra trong BE (hai request có cùng key không, hay hai key khác), vì FE không có đường replay mutation tự động.
5. Tải trang với StrictMode (dev): xác nhận không có POST nào khi mount (đặc biệt `CreateSurvey` effect `surveyCreateCommands.run`).
6. Hiển thị trùng: trang Thông báo (markRead vòng lặp), danh sách bản nộp "Tải thêm" khi bấm nhanh.

## 5. Chưa kiểm chứng

- Chưa đọc BE để xác nhận cách dedupe Idempotency-Key/If-Match; chưa chạy ứng dụng.
- Không rà từng dòng hết ~60 chỗ ghi; một số hook (`usePersonnelState`, `useFastTrackPolicy`, `MeasurementsTab`, `CreateSurvey`, `ProfilePage`, `Login`) chỉ kiểm có chốt state hay không.
