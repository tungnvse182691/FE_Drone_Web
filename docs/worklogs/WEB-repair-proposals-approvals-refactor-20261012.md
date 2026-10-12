# Worklog: TÁI CẤU TRÚC GÓI ĐỀ XUẤT SỬA CHỮA (PM) & THẨM DUYỆT ĐỢT SỬA CHỮA (SUPERVISOR), ĐỒNG BỘ MOCK API IN-MEMORY, KHẮC PHỤC DATA TĨNH VÀ CHUẨN HÓA MATERIAL MINIMALISM

- **Thời gian thực hiện:** 12/10/2026
- **Nhánh làm việc:** `hoang`
- **Tác giả:** Đỗ Quốc Hoàng (Frontend Web Solo)
- **Căn cứ nghiệp vụ:**
  - Bộ đặc tả Spec v2.2 (`docs/specs/29_9/`): Mục 8.1.7 (Gom gói đề xuất sửa chữa kỹ thuật WF-06 / Screen 10 / `RepairProposals.tsx`), Mục 8.1.8 (Thẩm duyệt đợt sửa chữa WF-07 / Screen 11-12 / `ProposalApprovalDetail.tsx`).
  - 10 Điều bất biến (`AGENTS.md`): 
    - Điều 1 (Zero Money / Quản lý khối lượng kỹ thuật công trình đường bộ thuần túy, không có BOQ giá tiền).
    - Điều 2 (Chỉ Supervisor mới có quyền phê duyệt/từ chối đợt sửa chữa).
    - Điều 3 (Đóng băng hồ sơ sau khi duyệt).
    - Điều 8 (Trạng thái đợt sửa tuân thủ đúng FSM: `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `DECIDED` / `DISPATCHED`).
    - Điều 10 (Design System: Màu vàng đồng `#C9A227` là màu thương hiệu Hoàng Hải, dùng đúng tokens `src/design-tokens.ts`).
  - Tiêu chuẩn thiết kế: **Minimalism**, sạch sẽ, không rác, 100% biểu tượng **Google Material Symbols** (`material-symbols-outlined`) qua component chuẩn `<Icon name="..." />` theo `DESIGN.md`.
  - Cấu trúc cây thư mục: **Giữ nguyên vẹn 100% cây thư mục hiện tại**, không làm vỡ các module có sẵn.

---

## I. BỐI CẢNH VÀ CÁC VẤN ĐỀ TRƯỚC KHI SỬA

Trước khi thực hiện đợt tái cấu trúc này, module Quản lý Gói đề xuất sửa chữa (`/pm/proposals`, `/sup/proposals`) và Thẩm duyệt chi tiết (`/sup/proposals/:id`, `/pm/proposals/:id`) tồn tại 5 vấn đề cốt lõi:

1. **Thừa chức năng trái nghiệp vụ ("Xuất kế hoạch kỹ thuật (PDF)"):**
   - Trên Header danh mục gói đề xuất xuất hiện nút bấm *"Xuất kế hoạch kỹ thuật (PDF)"* và modal xem trước tài liệu PDF.
   - **Thực tế Spec v2.2:** Hệ thống số hóa toàn diện quy trình kiểm tra bảo trì đường bộ. Việc trình duyệt và thẩm định phương án kỹ thuật được thực hiện trực tiếp trên web giữa PM và Supervisor. Nghiệp vụ hoàn toàn không yêu cầu xuất kế hoạch PDF ở bước này.

2. **Dữ liệu bị "set cứng" (Hardcoded Mock Fallback):**
   - Trong `repairService.getItems`, dữ liệu các gói đề xuất bị fallback cứng về cùng 4 hạng mục mẫu của gói `PKG-08`.
   - Hệ quả: Dù người dùng mở gói 2 điểm lỗi (`PKG-2026-19` trên Tuyến nối Cao tốc Bắc-Nam) hay gói 3 điểm lỗi (`PKG-2026-18` trên QL1A), màn hình thẩm định chi tiết đều hiển thị sai lệch thành 4 mục tĩnh giống hệt nhau.

3. **Lỗi phê duyệt nhanh (Quick Approve desync):**
   - Khi Supervisor bấm nút *"Phê duyệt"* nhanh ngay tại bảng danh sách gói, hàm xử lý chỉ cập nhật `setState` cục bộ cho danh sách ngoài mà không gọi Service nghiệp vụ (`repairService.signPackageApproval`).
   - Hệ quả: Khi bấm *"Thẩm định"* hoặc *"Theo dõi"* để vào xem chi tiết bên trong (`/sup/proposals/:id`), toàn bộ các hạng mục khiếm khuyết vẫn ở trạng thái *"Chờ duyệt"* (`PENDING`), số lượng đã duyệt vẫn là `0`.

4. **Sử dụng localStorage làm bẩn dữ liệu:**
   - Việc lưu rải rác state gói sửa chữa vào `localStorage` gây xung đột dữ liệu cũ/mới, không đúng kiến trúc Mock API Service và khó đồng bộ real-time giữa các vai trò PM/Supervisor.

5. **Phong cách giao diện và Icon chưa đồng bộ:**
   - Sử dụng thư viện `lucide-react` rải rác, không tuân thủ quy chuẩn `DESIGN.md` (yêu cầu dùng Google Material Symbols `<Icon name="..." />`).
   - Giao diện có nhiều chi tiết viền kẻ, hiệu ứng màu thừa thãi, chưa đạt chuẩn phong cách **Minimalism** hiện đại.

---

## II. CHI TIẾT CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### 1. Xóa bỏ hoàn toàn chức năng "Xuất kế hoạch kỹ thuật (PDF)"
- **File sửa:** 
  - [`src/pages/(pm)/repair-proposals/ProposalHeader.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/repair-proposals/ProposalHeader.tsx): Gỡ bỏ nút bấm `Xuất kế hoạch kỹ thuật (PDF)`.
  - [`src/pages/(pm)/repair-proposals/ProposalModals.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/repair-proposals/ProposalModals.tsx): Gỡ bỏ render `ProposalPDFPreviewModal`.
  - [`src/pages/(pm)/RepairProposals.tsx`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/RepairProposals.tsx): Làm sạch các state liên quan đến modal PDF thừa.

### 2. Xây dựng Mock API Service In-Memory chuẩn & Dynamic Item Resolution
- **File sửa:** [`src/api/services/repairService.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/repairService.ts)
- **Cơ chế Singleton In-Memory:**
  - Loại bỏ hoàn toàn `localStorage` và `storageHelper.ts`.
  - Dữ liệu `apiPackages` và `apiItemsByPackage` được quản lý in-memory với các hàm API bất đồng bộ Promise chuẩn (`fetchPackages`, `fetchPackageById`, `fetchItems`).
  - Tích hợp Event Bus qua CustomEvent `roadguard_repair_api_change` phát tín hiệu cập nhật tức thì trên toàn ứng dụng.
- **Dynamic Package Items Resolver:**
  - **Gói `PKG-2026-19`:** Trả về đúng **2 hạng mục** nứt lún tại Tuyến nối Cao tốc Bắc - Nam (Km 2+450, Km 5+120).
  - **Gói `PKG-2026-18`:** Trả về đúng **3 hạng mục** tại QL1A - Giai đoạn 2 (Km 1028+350, Km 1030+100, Km 1032+240).
  - **Gói `PKG-2026-08`:** Trả về đúng **4 hạng mục** (Km 1024+350 đến Km 1025+400).
  - **Gói `PKG-2026-07`:** Trả về đúng **5 hạng mục** (Km 1033+500 đến Km 1035+800).
  - **Gói do PM tạo mới:** Lưu và trả về đúng danh sách các điểm khiếm khuyết mà PM đã tick chọn khi tạo gói.
  - **Mọi gói bất kỳ:** Tự động sinh động số lượng hạng mục chính xác theo `defect_count` và thông tin phạm vi lý trình của gói đó. Tuyệt đối không fallback 4 mục tĩnh bừa bãi.

### 3. Đồng bộ hóa 2 chiều luồng Phê duyệt nhanh (Quick Approve)
- **Vấn đề đã khắc phục:** Supervisor duyệt nhanh ngoài bảng danh sách nhưng vào chi tiết chưa được duyệt.
- **Giải pháp:**
  - Trong [`src/pages/(pm)/repair-proposals/useRepairProposalsState.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(pm)/repair-proposals/useRepairProposalsState.ts):
    ```ts
    const handleQuickApprove = (id: string, code: string) => {
      repairService.signPackageApproval(id) // Gọi Mock API Service
      setPackages(repairService.getPackages()) // Đồng bộ danh sách
      showToast(`[GIÁM SÁT]: Đã phê duyệt chính thức gói [${code}] và ban hành lệnh công tác!`)
    }
    ```
  - Trong [`src/api/services/repairService.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/api/services/repairService.ts):
    - Hàm `signPackageApproval`: Lấy toàn bộ items của gói, đổi 100% sang `status: 'APPROVED'`, lưu lại theo mọi định dạng key (`id`, `cleanId`, `code`), cập nhật gói thành `DECIDED`, và phát sự kiện `roadguard_repair_api_change`.
    - Hàm `getItems`: Tự động nhận diện nếu gói đã là `DECIDED`, cam kết toàn bộ hạng mục trả về đều mang trạng thái `APPROVED`.
  - Trong [`src/pages/(sup)/proposal-approval/useProposalApprovalState.ts`](file:///d:/hoctap/k%C3%AC%209/%C4%91%E1%BB%93%20%C3%A1n/FE_Drone_Web/src/pages/(sup)/proposal-approval/useProposalApprovalState.ts):
    - Hàm `handleBatchApproveAll`: Gọi `repairService.signPackageApproval(activeKey)` để đồng bộ toàn bộ mục và chuyển gói sang `DECIDED`.
    - Lắng nghe sự kiện `roadguard_repair_api_change` để reload tự động khi có bất kỳ thay đổi nào từ phía Supervisor hoặc PM.

### 4. Chuẩn hóa giao diện Minimalism & 100% Google Material Symbols
- Thay thế triệt để 100% các icon thư viện `lucide-react` bằng component chuẩn:
  ```tsx
  import { Icon } from '../../../components/ui/Icon'
  ```
- **Các icon đã chuyển đổi:**
  - Header & điều hướng: `arrow_back`, `history_edu`, `shield`, `done_all`, `search`, `tune`, `filter_alt`, `sync`, `chevron_left`, `chevron_right`, `close`.
  - Thao tác kỹ thuật & BOQ: `add`, `build`, `fact_check`, `auto_awesome`, `send`, `local_shipping`, `visibility`, `more_vert`.
  - Thao tác thẩm định của Supervisor: `check` (Duyệt), `photo_camera` (Yêu cầu minh chứng), `sync` (Xem xét lại), `close` (Từ chối).
- **Tinh chỉnh giao diện Minimalism:**
  - Thẻ thống kê sạch sẽ, phân tách bằng nền slate/amber dịu mắt, loại bỏ các viền đổ bóng dày nặng.
  - Các chip trạng thái thẩm định đạt chuẩn WF-07: `[Đã duyệt]` (xanh lục), `[Cần minh chứng]` (xanh dương nhạt), `[Xem xét lại]` (vàng cam), `[Từ chối]` (đỏ), `[Chờ duyệt]` (xám).
  - Tối ưu bảng hạng mục với Sticky Action Column mượt mà.

---

## III. DANH SÁCH FILE THAY ĐỔI

| STT | File Component / Service | Vai trò / Module | Nội dung thay đổi |
|:---:|---|:---:|---|
| 1 | `src/api/services/repairService.ts` | Shared Mock Service | Bỏ localStorage, bổ sung In-memory Store, Dynamic Item Resolver, `signPackageApproval` & `approvePackage`. |
| 2 | `src/pages/(pm)/RepairProposals.tsx` | PM Proposals | Tích hợp State mới, dọn dẹp modal PDF thừa, chuyển sang Material Symbols. |
| 3 | `src/pages/(pm)/repair-proposals/ProposalHeader.tsx` | PM Proposals | Xóa nút bấm "Xuất kế hoạch kỹ thuật (PDF)", dùng `Icon`. |
| 4 | `src/pages/(pm)/repair-proposals/ProposalStats.tsx` | PM Proposals | Chuyển đổi icon `edit`, `schedule`, `check_circle`, `local_shipping`. |
| 5 | `src/pages/(pm)/repair-proposals/ProposalTable.tsx` | PM Proposals | Chuyển đổi icon phân trang & thao tác sang Material Symbols. |
| 6 | `src/pages/(pm)/repair-proposals/ProposalTableRow.tsx` | PM Proposals | Thay thế icon, kết nối nút Phê duyệt nhanh với `onQuickApprove`. |
| 7 | `src/pages/(pm)/repair-proposals/ProposalFilterBar.tsx` | PM Proposals | Chuyển đổi icon tìm kiếm và bộ lọc. |
| 8 | `src/pages/(pm)/repair-proposals/CreateProposalModal.tsx` | PM Proposals | Chuyển đổi icon `add`, `close`, `build`, `auto_awesome`, `send`. |
| 9 | `src/pages/(pm)/repair-proposals/ProposalBOQCard.tsx` | PM Proposals | Chuyển đổi icon `build`, `fact_check`. |
| 10 | `src/pages/(pm)/repair-proposals/ProposalDetailModal.tsx` | PM Proposals | Chuyển đổi icon `close`, `build`, `check`, `send`. |
| 11 | `src/pages/(pm)/repair-proposals/ProposalModals.tsx` | PM Proposals | Gỡ bỏ render PDF Preview Modal. |
| 12 | `src/pages/(pm)/repair-proposals/ProposalPDFPreviewModal.tsx` | PM Proposals | Chuẩn hóa icon Material Symbols (deprecated modal). |
| 13 | `src/pages/(pm)/repair-proposals/useRepairProposalsState.ts` | PM Proposals | Kết nối `handleQuickApprove` với `repairService.signPackageApproval`. |
| 14 | `src/pages/(sup)/ProposalApprovalDetail.tsx` | SUP Approvals | Chuẩn hóa 100% Material Symbols, clean code. |
| 15 | `src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx` | SUP Approvals | Chuyển đổi icon `arrow_back`, `done_all`, `local_shipping`... |
| 16 | `src/pages/(sup)/proposal-approval/ApprovalStatsBar.tsx` | SUP Approvals | Chuyển đổi icon, định dạng thẻ thống kê Minimalism. |
| 17 | `src/pages/(sup)/proposal-approval/ApprovalItemsTable.tsx` | SUP Approvals | Chuyển đổi icon trạng thái rỗng và bảng dữ liệu. |
| 18 | `src/pages/(sup)/proposal-approval/ItemsTableRow.tsx` | SUP Approvals | Chuyển đổi 4 icon nút bấm thẩm định nhanh của Supervisor. |
| 19 | `src/pages/(sup)/proposal-approval/ItemsFilterBar.tsx` | SUP Approvals | Chuyển đổi icon tìm kiếm. |
| 20 | `src/pages/(sup)/proposal-approval/BatchApproveModal.tsx` | SUP Approvals | Chuyển đổi icon `done_all`. |
| 21 | `src/pages/(sup)/proposal-approval/DecisionModal.tsx` | SUP Approvals | Chuyển đổi icon `photo_camera`, `send`, `close`. |
| 22 | `src/pages/(sup)/proposal-approval/DefectPhotoModal.tsx` | SUP Approvals | Chuyển đổi icon `location_on`, `close`. |
| 23 | `src/pages/(sup)/proposal-approval/ProposalDispatchModal.tsx` | SUP Approvals | Chuyển đổi icon `local_shipping`, `group`, `send`. |
| 24 | `src/pages/(sup)/proposal-approval/useProposalApprovalState.ts` | SUP Approvals | Cập nhật nạp dynamic items theo route id, đồng bộ event bus và batch approve. |

---

## IV. KẾT QUẢ KIỂM THỬ THỰC TẾ

1. **Kiểm tra Danh mục gói đề xuất (`/sup/proposals` và `/pm/proposals`):**
   - Header hiển thị gọn gàng, không còn nút thừa "Xuất kế hoạch kỹ thuật (PDF)".
   - Thống kê các thẻ KPI chính xác: Gói đang soạn thảo (01), Gói chờ duyệt (02), Gói đã phê duyệt (02), Gói đã giao việc (00).
   - Bộ lọc theo tuyến đường, quy mô, đơn vị thi công và tìm kiếm hoạt động tức thì.
2. **Kiểm tra Thẩm định chi tiết (`/sup/proposals/:id`):**
   - Bấm vào gói `PKG-2026-19`: Hiển thị đúng 2 điểm khiếm khuyết tại Km 2+450 và Km 5+120 (Tuyến nối Cao tốc).
   - Bấm vào gói `PKG-2026-18`: Hiển thị đúng 3 điểm khiếm khuyết tại Km 1028+350, Km 1030+100, Km 1032+240 (QL1A).
   - Không còn tình trạng bị set cứng 4 item của `PKG-08`.
3. **Kiểm tra Phê duyệt nhanh:**
   - Tại bảng danh mục ngoài, Supervisor bấm nút **"Phê duyệt"** gói `PKG-2026-19`: Gói chuyển sang **"Đã phê duyệt"** (2/2 điểm - 100%).
   - Bấm tiếp nút **"Theo dõi" / "Thẩm định"** vào xem chi tiết: Cả 2 hạng mục bên trong lập tức hiển thị badge màu xanh lá **[Đã phê duyệt]**, tiến độ đạt 100%, diện tích phê duyệt đạt 2.0 m².
4. **Kiểm tra Giao diện & Icon:**
   - 100% biểu tượng trên màn hình là Google Material Symbols hiển thị sắc nét, đồng bộ.
   - Không còn bất kỳ lỗi console hoặc cảnh báo import nào.
