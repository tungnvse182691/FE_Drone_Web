# Worklog: DỌN NHÀ (ĐỢT CLEANUP) TRÊN NHÁNH tung

- **Ngày thực hiện:** 06/10/2026  
- **Nhánh:** `tung`  
- **Baseline:** Sau commit `aac5427`  
- **Mục tiêu:** Dọn sạch tệp rác / tệp chết không sử dụng, dời `SafeImage` về `common`, và gom dữ liệu phân mảnh của 4 feature (`fast-track`, `risk-analytics`, `repair-proposals`, `alignment`) về đúng 1 tệp `data.ts` duy nhất cho mỗi feature. Bảo toàn 100% logic, không chỉnh sửa UI, kiểm tra `tsc 0` + `build PASS` và commit riêng từng nhóm. CẤM `push --force`.

---

## 1. NHÓM 1: XÓA 3 FILE CHẾT (DEAD CODE)

### Danh sách tệp đã xóa:
1. `src/pages/(pm)/alignment/SlabsPanel.tsx` (Component dư thừa sau khi đã module hóa tab Sidebar)
2. `src/components/ui/TableWrapper.tsx` (Wrapper component cũ không còn import nào)
3. `src/store/uiStore.ts` (Store Zustand giao diện cũ không còn sử dụng)

### Kết quả kiểm tra Grep:
- `grep "SlabsPanel"` $\rightarrow$ **0 hits**
- `grep "TableWrapper"` $\rightarrow$ **0 hits**
- `grep "uiStore"` $\rightarrow$ **0 hits**

### Kiểm tra biên dịch & đóng gói:
- `npx tsc --noEmit` $\rightarrow$ **0 errors (Exit code 0)**
- `npm run build` $\rightarrow$ **PASS (Built in 9.94s)**

### Git Commit:
- **Hash:** `672b2f1`
- **Message:** `cleanup: remove dead files SlabsPanel, TableWrapper, and uiStore`

---

## 2. NHÓM 2: DỜI SAFEIMAGE VÀ GOM DỮ LIỆU VỤN

### A. Dời `SafeImage.tsx`:
- Dời tệp từ `src/pages/(pm)/field-tasks/SafeImage.tsx` sang `src/components/common/SafeImage.tsx`.
- Cập nhật đường dẫn import tại 3 vị trí sử dụng:
  1. `src/pages/(pm)/field-tasks/MeasurementsTab.tsx`
  2. `src/pages/(pm)/field-tasks/conflicts/ConflictIncomingStateCard.tsx`
  3. `src/pages/(pm)/field-tasks/conflicts/ConflictServerStateCard.tsx`

### B. Gom dữ liệu vụn (Mỗi feature 1 tệp `data.ts`):
1. **`fast-track` (`src/pages/(pm)/fast-track/`):**
   - Tạo tệp `src/pages/(pm)/fast-track/data.ts` hợp nhất dữ liệu từ: `fastTrackCrews.ts`, `fastTrackDefects.ts`, `fastTrackPolicy.ts`, `fastTrackRoutes.ts`.
   - Cập nhật `src/pages/(pm)/fast-track/mockData.ts` re-export từ `./data`.
   - Xóa 4 tệp mảnh vụn: `fastTrackCrews.ts`, `fastTrackDefects.ts`, `fastTrackPolicy.ts`, `fastTrackRoutes.ts`.

2. **`risk-analytics` (`src/pages/(sup)/risk-analytics/`):**
   - Tạo tệp `src/pages/(sup)/risk-analytics/data.ts` hợp nhất dữ liệu cấu hình dự án (`PROJECTS_CONFIG`) và hồ sơ kết xuất (`INITIAL_EXPORT_RECORDS`) từ các tệp phân mảnh: `exportRecordsPart1.ts`, `exportRecordsPart2.ts`, `projectsConfigData.ts`, `exportRecordsData.ts`, và 3 dòng của `mockData.ts`.
   - Cập nhật import trong `src/pages/(sup)/RiskAnalytics.tsx` và `src/pages/(sup)/risk-analytics/useRiskAnalyticsState.ts` trỏ về `./data`.
   - Xóa 5 tệp phân mảnh: `exportRecordsPart1.ts`, `exportRecordsPart2.ts`, `projectsConfigData.ts`, `exportRecordsData.ts`, `mockData.ts`.

3. **`repair-proposals` (`src/pages/(pm)/repair-proposals/`):**
   - Đổi tên / gộp `src/pages/(pm)/repair-proposals/routesData.ts` sang `src/pages/(pm)/repair-proposals/data.ts`.
   - Cập nhật `src/pages/(pm)/repair-proposals/mockData.ts` re-export `AVAILABLE_ROUTES` từ `./data`.
   - Xóa tệp `routesData.ts`.

4. **`alignment` (`src/pages/(pm)/alignment/`):**
   - Tạo tệp `src/pages/(pm)/alignment/data.ts` gộp đầy đủ cấu hình tọa độ, hằng số phân đoạn, hàm tính toán ribbon GeoJSON và lưới tấm slabs từ: `alignmentData.ts`, `alignmentGeoJson.ts`, `alignmentSlabsGeoJson.ts`.
   - Cập nhật import trỏ về `./data` tại 8 vị trí:
     - `src/pages/(pm)/AlignmentSegments.tsx`
     - `src/pages/(pm)/alignment/alignmentImportHelpers.ts`
     - `src/pages/(pm)/alignment/useAlignmentImportState.ts`
     - `src/pages/(pm)/alignment/useAlignmentState.ts`
     - `src/pages/(pm)/alignment/useAlignmentSegmentsState.ts`
     - `src/pages/(pm)/alignment/alignmentSplitHelpers.ts`
     - `src/pages/(pm)/alignment/alignmentMapSetup.ts`
     - `src/pages/(pm)/alignment/alignmentMapLayers.ts`
   - Xóa 3 tệp phân mảnh: `alignmentData.ts`, `alignmentGeoJson.ts`, `alignmentSlabsGeoJson.ts`.

### Kết quả kiểm tra Grep:
- `grep "fastTrackCrews"` $\rightarrow$ **0 hits**
- `grep "exportRecordsPart"` $\rightarrow$ **0 hits**
- `grep "projectsConfigData"` $\rightarrow$ **0 hits**
- `grep "routesData"` $\rightarrow$ **0 hits**
- `grep "alignmentData"` $\rightarrow$ **0 hits**
- `grep "alignmentGeoJson"` $\rightarrow$ **0 hits**
- `grep "alignmentSlabsGeoJson"` $\rightarrow$ **0 hits**
- `grep "field-tasks/SafeImage"` $\rightarrow$ **0 hits**

### Kiểm tra biên dịch & đóng gói:
- `npx tsc --noEmit` $\rightarrow$ **0 errors (Exit code 0)**
- `npm run build` $\rightarrow$ **PASS (1940 modules transformed, Built in 9.87s)**

### Git Commit:
- **Hash:** `53ced52`
- **Message:** `refactor(cleanup): move SafeImage to common and consolidate feature data files`

---

## 3. BẢO TOÀN INVARIANTS & VÙNG CẤM (NHÓM 3)

- **Không đụng:** Giữ nguyên các tệp `types.ts` và `mockData.ts` theo folder (chỉ re-export data), giữ nguyên 2 component `DispatchModal`, giữ nguyên `src/api/mock/data.ts` cho đợt mock tiếp theo.
- **Không đụng logic / UI:** 100% logic thuật toán hình học GeoJSON, calculations của risk-analytics và các state hook được bảo toàn nguyên vẹn.
- **Không vi phạm git:** Không chạy bất kỳ lệnh `git push --force` nào.
