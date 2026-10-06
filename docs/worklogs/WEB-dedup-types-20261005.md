# Worklog: DEDUP TYPES TRÊN NHÁNH tung

- **Ngày thực hiện:** 06/10/2026  
- **Nhánh:** `tung`  
- **Baseline:** Sau commit `3a51c76`  
- **Mục tiêu:** Loại bỏ hoàn toàn sự trùng lặp type/interface giữa `src/pages/**/types.ts`, `src/types/domain.ts`, `src/api/services/*.ts`, và `src/data/mockData.ts`. Đưa toàn bộ entity dùng chung về `src/types/domain.ts` làm Single Source of Truth (SSOT). Tuyệt đối **CẤM đụng UI/logic**, chỉ sửa type & import. Kiểm tra `tsc 0` + `build PASS`.

---

## 1. KẾT QUẢ KIỂM KÊ (BƯỚC 1)

Chạy script kiểm tra tự động trên 29 tệp định nghĩa TypeScript (`src/pages/**/types.ts`, `src/types/domain.ts`, `src/api/services/*.ts`, `src/data/mockData.ts`). Phát hiện **7 cặp/nhóm định nghĩa trùng tên**:

1. **`PasswordRules`** (Xuất hiện 3 lần):
   - `src/pages/(auth)/accept-invitation/types.ts:3`
   - `src/pages/(auth)/force-change-password/types.ts:1`
   - `src/pages/(auth)/login/types.ts:3`
2. **`TriageCase`** (Xuất hiện 2 lần):
   - `src/data/mockData.ts:507`
   - `src/pages/(pm)/ai-review/types.ts:1`
3. **`PolicyThresholdConfig`** (Xuất hiện 2 lần):
   - `src/api/services/fastTrackService.ts:3`
   - `src/pages/(pm)/fast-track/types.ts:1`
4. **`HubProject`** (Xuất hiện 2 lần):
   - `src/api/services/projectService.ts:3`
   - `src/pages/(pm)/projects/types.ts:1`
5. **`ProposalWorkPackage`** (Xuất hiện 2 lần):
   - `src/api/services/repairService.ts:3`
   - `src/pages/(pm)/repair-proposals/types.ts:1`
6. **`ItemApprovalStatus`** (Xuất hiện 2 lần):
   - `src/api/services/repairService.ts:32`
   - `src/pages/(sup)/proposal-approval/types.ts:1`
7. **`RepairItemDetail`** (Xuất hiện 2 lần):
   - `src/api/services/repairService.ts:39`
   - `src/pages/(sup)/proposal-approval/types.ts:8`

---

## 2. BỔ SUNG LUẬT SSOT VÀO `docs/FOLDER_RULES.md` (BƯỚC 2)

Đã thêm điều khoản 4 vào `docs/FOLDER_RULES.md`:
```markdown
4. **Luật SSOT cho Type & Entity:**
   - Entity dùng chung (Project, Defect, Survey, Batch, Task...) CHỈ sống ở src/types/domain.ts.
   - types.ts feature CHỈ chứa props component + UI state local, entity phải import từ domain, cấm interface trùng tên.
   - services/mockData cấm định nghĩa interface đã có ở domain (chỉ import).
```

---

## 3. CHI TIẾT MERGE VÀ SỬA TRÙNG (BƯỚC 3)

Toàn bộ 7 entity đã được hợp nhất vào `src/types/domain.ts`, bảo toàn 100% các trường dữ liệu:

| Entity | Nguồn lưu trữ chuẩn | Chi tiết merge trường dữ liệu | Các file đã chuyển sang import từ domain |
|---|---|---|---|
| **`PasswordRules`** | `src/types/domain.ts` | Hợp nhất: `length: boolean`, `case: boolean`, `number?: boolean`, `special: boolean`. | - `src/pages/(auth)/accept-invitation/types.ts`<br>- `src/pages/(auth)/force-change-password/types.ts`<br>- `src/pages/(auth)/login/types.ts` |
| **`TriageCase`** | `src/types/domain.ts` | Giữ nguyên toàn bộ 52 fields của `mockData.ts` + merge thêm `survey_assignment?: { mode, reason, assigned_crew, sla_hours, created_at }` từ `ai-review/types.ts`. | - `src/data/mockData.ts`<br>- `src/pages/(pm)/ai-review/types.ts` |
| **`PolicyThresholdConfig`** | `src/types/domain.ts` | Hợp nhất `status: 'ACTIVE' \| 'DRAFT' \| 'ARCHIVED'` và `allowedSeverities: ('LOW' \| 'MEDIUM' \| 'HIGH' \| string)[]`. | - `src/api/services/fastTrackService.ts`<br>- `src/pages/(pm)/fast-track/types.ts` |
| **`HubProject`** | `src/types/domain.ts` | Đưa toàn bộ 27 fields của dự án bảo hành mở rộng vào domain. | - `src/api/services/projectService.ts`<br>- `src/pages/(pm)/projects/types.ts` |
| **`ProposalWorkPackage`** | `src/types/domain.ts` | Đưa 23 fields của gói đề xuất sửa chữa BOQ vào domain. | - `src/api/services/repairService.ts`<br>- `src/pages/(pm)/repair-proposals/types.ts` |
| **`ItemApprovalStatus`** | `src/types/domain.ts` | `'APPROVED' \| 'REQUEST_EVIDENCE' \| 'REQUEST_RECONSIDER' \| 'REJECTED' \| 'PENDING'`. | - `src/api/services/repairService.ts`<br>- `src/pages/(sup)/proposal-approval/types.ts` |
| **`RepairItemDetail`** | `src/types/domain.ts` | Giữ toàn bộ fields từ `repairService.ts` + merge thêm 4 fields truy vết Drone (`survey_code?: string`, `drone_model?: string`, `pilot_name?: string`, `flight_date?: string`) từ `proposal-approval/types.ts`. | - `src/api/services/repairService.ts`<br>- `src/pages/(sup)/proposal-approval/types.ts` |

---

## 4. KẾT QUẢ KIỂM THỬ KỸ THUẬT

1. **Quét trùng lặp tự động sau khi sửa:** **0 cặp trùng** trên toàn bộ 103 type/interface của dự án.
2. **`npx tsc --noEmit`:** **0 lỗi** (Exit code 0, không gãy bất kỳ import nào).
3. **`npm run build`:** **PASS** (vite built in 7.47s, 1949 modules transformed).
4. **Không đụng UI/logic:** 100% thay đổi chỉ giới hạn trong định nghĩa type và câu lệnh import.
