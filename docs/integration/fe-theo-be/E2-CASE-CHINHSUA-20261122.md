# E2 — Cụm Case + thẩm định (theo `Chinhsua.docx`, 2026-11-22)

BE kiểm thử: stack mới `roadguard-v3` (`https://localhost:18443`), seed mới, Vite `http://localhost:5180`. Kịch bản: `tools/e2e/e2-case.mjs` (`RG_BASE=http://localhost:5180 bash tools/e2e/run.sh e2-case.mjs all`). Kết quả lần chạy cuối: **15/15 PASS**. `npx tsc --noEmit -p .` sạch (0 lỗi) tại thời điểm kết thúc.

## L — Danh sách phân biệt "chưa có quyết định" / "Đã ghi nhận"; trạng thái Defect hiển thị riêng
**Trước:** `triageService.mapBackendCaseToDomain` gán `'Chờ thẩm định'` cho mọi Case đã phân công; badge `PENDING` luôn hiện "Chờ xác minh"; tab lọc cũng ghi "Chờ xác minh".
**Đã sửa:**
- `src/api/services/triageService.ts`: nhãn mặc định Case OPEN thành **"Đã phân công — chưa có quyết định"**. Thêm `enrichDecisionState`: với PM, mỗi Case có tham chiếu KEEP_NEW của phiên (`reportKeepNewCommands.reference`) được đọc lại từ BE (`GET /projects/{p}/candidate-decisions/{id}` + `GET /projects/{p}/defects/{id}`) rồi gắn `decision_recorded`, `decision_kind='KEEP_NEW'`, `linked_defect_id`, **`defect_status`** (trạng thái Defect do BE trả) và nhãn **"Đã ghi nhận"**. Lỗi đọc **không bị nuốt**: gắn `decision_read_error` và hiện cảnh báo.
- `src/types/domain.ts` (`TriageCase`, file kiểu dùng chung — chỉ thêm 5 trường tùy chọn, chưa đổi trường nào): `decision_recorded`, `decision_read_error`, `defect_status`, `reopened_after_conclusion`, `previous_conclusion`.
- `ai-review/CitizenTriageStatusBadge.tsx`, `CitizenTriageRow.tsx` (dạng bảng), `TriageCard.tsx` (dạng thẻ): nhãn chính ("Chưa có quyết định" / "Đã ghi nhận" / "Đã mở lại do có bổ sung") + chip **"Defect: <trạng thái>"** riêng + chip lỗi khi không đọc được quyết định.
- `ai-review/ReviewFilterBar.tsx`: tab "Chờ xác minh" đổi thành **"Chưa kết luận"** (tab đếm mọi Case chưa kết luận, gồm cả đã ghi nhận/đã mở lại). `DroneAiQueueView.tsx`: "Chờ xác minh" → "Chưa có quyết định".
- `ai-review/DrawerDecisionBanners.tsx`: khối "ĐÃ GHI NHẬN QUYẾT ĐỊNH (KEEP_NEW)" nêu rõ trạng thái này tách khỏi Case/kết luận Case; hiện lỗi đọc nếu có.
- `ai-review/ReportDefectIntake.tsx`: lỗi `409 invalid_state_transition` khi KEEP_NEW giải thích đúng nguyên nhân (nguồn đã có quyết định chấp nhận), vẫn giữ nguyên mã BE.

**Bằng chứng (UI thật, `pm-a`, Project A):** Case mới `#CAS-856DF878` trước quyết định hiện "Đã phân công — chưa có quyết định"; ghi nhận KEEP_NEW qua form ("Xác nhận ghi nhận khiếm khuyết") → `POST /projects/{id}/candidate-decisions` **201** (decision `18ba1c6e-…`, defect `9a6f1083-…`); sau đó thẻ Case hiện **"Đã ghi nhận"** + **"Defect: OPEN"**, không còn "chưa có quyết định". GET độc lập `candidate-decisions/{id}` và `defects/{id}` (200) khớp.

**Giới hạn đã biết (BE):** quyết định Report→Defect chỉ đọc được theo `decisionId`; BE **không có API tra quyết định hiện hành theo nguồn Report** (`GET /candidates?sourceKind=REPORT&sourceId=…` chỉ trả Defect gần kề, không có disposition; `GET /ai-candidates/{id}` chỉ dành cho AI detection và chỉ Bearer). Vì vậy nhãn "Đã ghi nhận" hiện cho Case mà **phiên làm việc còn tham chiếu** (sessionStorage); mở phiên mới thì thẻ trở lại "chưa có quyết định" dù BE đã có quyết định, và thử ghi nhận lại sẽ bị `409 invalid_state_transition` (đã có thông báo giải thích). Đề nghị BE: thêm đọc quyết định hiện hành theo nguồn (ví dụ trả `disposition` trong `GET /projects/{p}/candidates?sourceKind=REPORT…` hoặc `GET /cases/{id}`). Chưa kiểm LINK_EXISTING cho nguồn Report (FE hiện chỉ có luồng KEEP_NEW cho Report).

## M — Case đã OPEN (BE mở lại do bổ sung) không còn hiện kết luận cũ như hiện tại
**Trước:** FE ánh xạ `conclusion.outcome` thành kết luận hiện tại bất kể `status`; Case OPEN vẫn hiện banner "KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (BÁO SAI)" + nút "Thẩm định lại" chỉ ra toast "Chưa có command mở lại kết luận Case".
**Đã sửa:**
- `triageService.ts`: `status === 'OPEN'` mà BE vẫn trả `conclusion.outcome` ⇒ **mở lại do bổ sung**: `status='PENDING'`, nhãn **"Đã mở lại do có bổ sung"**, `conclusion=null` (nên form thẩm định/ghi nhận của Case OPEN hiện ra như Case chưa kết luận), kết luận cũ chuyển vào `previous_conclusion` (outcome, lý do, `concludedAt`) — không xóa.
- `DrawerDecisionBanners.tsx`: banner xanh **"ĐÃ MỞ LẠI DO CÓ BỔ SUNG"** + mục gập **"Lịch sử kết luận (không còn hiệu lực hiện tại)"** hiển thị kết luận cũ, lý do và thời điểm. Không còn banner "Báo sai" hiện tại.
- `useAIReviewActions.ts` (`handleResetConclusion`): nếu Case đang OPEN thì không báo "chưa có command mở lại" mà hướng dẫn thẩm định tiếp ở khung bên dưới; **không gọi API mở lại** (BE đã mở lại). Với Case CONCLUDED vẫn giữ thông báo cũ (không có command mở lại trong contract).
- Lịch sử công bố không bị đụng: FE không đọc/ghi thông tin công bố khi mở lại, công bố cũ vẫn ở BE, không yêu cầu công bố lại.

**Bằng chứng (UI thật + GET):** dựng Case thật bằng API: Reporter-a tạo Report → Giám sát phân loại vào Project A (kèm tuyến/bộ phân đoạn PUBLISHED/phiên bản hình học) → PM kết luận `NO_DEFECT` (POST `conclusions` 200, Case `CONCLUDED`) → Reporter bổ sung (POST `/reports/{id}/supplements` 200) ⇒ `GET /cases/{id}`: `status=OPEN`, `conclusion.outcome=NO_DEFECT`. UI `pm-a`: danh sách hiện "Đã mở lại do có bổ sung" và **không** hiện "Báo sai"; bấm "Thẩm định" mở chi tiết có banner "ĐÃ MỞ LẠI DO CÓ BỔ SUNG", không còn banner "KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (BÁO SAI)", có "Lịch sử kết luận", và form thẩm định hiển thị (không chỉ toast).

**Chưa kiểm:** gửi một kết luận mới (CONFIRMED/NO_DEFECT) trên Case đã mở lại và đọc lại `GET /cases/{id}` (form kết luận không đổi, chỉ đổi điều kiện hiển thị). Chưa kiểm hiển thị cho Giám sát với Case mở lại ngoài việc dùng chung banner.

## Dữ liệu test đã tạo (seed mới, Project A, đều có tiền tố `[TEST-FE]`)
- Report của `reporter-a`: `[TEST-FE] Báo cáo có vị trí cho kiểm thử E2-L2 …` — **mỗi lần chạy kịch bản tạo thêm** 2 Report/Case (1 cho M, 1 cho L). Case M: kết luận NO_DEFECT rồi bổ sung ⇒ OPEN. Case L: KEEP_NEW ⇒ Defect OPEN (Defect `9a6f1083-…` ở lần chạy cuối; các lần chạy trước tạo Defect `e263b223-…`).
- Trước đó trong phiên: Report `[TEST-FE] Báo cáo mới cho kiểm thử nhãn Đã ghi nhận (E2)` (không có vị trí ⇒ KEEP_NEW bị `409 source_not_ready`), Case `27d9e209` (report seed `d71a8270`) bị kết luận NO_DEFECT rồi bổ sung ⇒ OPEN (kết luận cũ còn).
- Case dùng cho Project A có thêm các Case do agent khác tạo; không đụng.

## Phát hiện BE kèm theo (ghi để gửi BE)
1. **Không có API tra quyết định Report→Defect theo nguồn** (xem mục L) — gây lệch nhãn giữa các phiên.
2. KEEP_NEW cho Report cần Case có phạm vi hình học khi phân loại: Report không có vị trí (`locationSource=UNKNOWN`) hoặc Case phân loại thiếu `routeVersionId/segmentSetId/geometryVersion` ⇒ `GET /candidates?sourceKind=REPORT…` trả `409 source_not_ready` (correlation `32517278-3374-488c-8b3f-b6480193151a`, `5a073f9c-4871-4697-a6ea-1b94b8d3ae9a`). FE đã hiện đúng ("Không đọc được nguồn Report: HTTP 409 source_not_ready") — không phải lỗi FE.
3. `invalid_state_transition` (409) khi KEEP_NEW trên nguồn đã có quyết định — đúng contract; ví dụ correlation `dcbcb216-d8db-40a4-8a25-0f01d0300178`.

## File đã sửa/thêm
`src/types/domain.ts` (thêm trường tùy chọn), `src/api/services/triageService.ts`, `src/pages/(pm)/ai-review/{CitizenTriageStatusBadge,CitizenTriageRow,TriageCard,ReviewFilterBar,DroneAiQueueView,DrawerDecisionBanners,useAIReviewActions,ReportDefectIntake}.tsx|ts`, `tools/e2e/e2-case.mjs` (mới), `tools/e2e/lib.mjs` (`login` chờ ô email tối đa 30 giây — Vite có thể đang tải lại khi file đổi).
