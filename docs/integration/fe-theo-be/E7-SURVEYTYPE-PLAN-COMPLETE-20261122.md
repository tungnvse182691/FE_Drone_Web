# E7 — BE develop_ABC: loại khảo sát, 409 phân biệt, đóng kế hoạch (2026-11-22)

Nguồn: `SURVEY-TYPE-CONFLICT-AND-PLAN-COMPLETION.md` của BE.

File FE đổi: `api/services/surveyPlanningService.ts` (surveyType, completion, parentTaskId), `surveyActions.ts` (`completePlan`), `pages/(pm)/surveys/SurveyPlanCompleteCard.tsx` (mới), `SurveyRecordDetailModal.tsx`, `SurveyCard.tsx`, `pages/(pm)/CreateSurvey.tsx` (409 theo mã), `pages/(pm)/SurveyRequests.tsx` (nhiệm vụ bổ sung được tính vào kế hoạch qua parentTaskId, vì tóm tắt nhiệm vụ con có thể không có planId).

Test: `tools/e2e/e7-plan-complete.mjs`; `e5-survey-plan.mjs` cập nhật regex thông báo mới.
Kết quả và giới hạn: xem mục 17 của `../NGHIEM-THU-THEO-LUONG.md`.
