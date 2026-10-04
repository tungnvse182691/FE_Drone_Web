# 📘 HƯỚNG DẪN KIẾN TRÚC MOCK DATA & CÁCH GẮN API THẬT (ROADGUARD FE_WEB)

> **Tài liệu bàn giao & giải thích kỹ thuật dành cho Hoàng (Frontend Solo)**  
> **Cam kết:** Giữ nguyên 100% giao diện, CSS/Tokens, Routes và nghiệp vụ Spec v2.2. Không ảnh hưởng đến bất kỳ màn hình nào khi chuyển đổi sang Backend thật.

---

## 🎯 PHẦN 1: BÂY GIỜ CHÚNG TA ĐANG LÀM GÌ?

### 1.1 Vấn đề thực tế trong đồ án
1. **Dự án chia 2 nền tảng:**
   - **Web (Bạn phụ trách):** Chỉ gồm 2 vai trò văn phòng là **Chỉ huy trưởng (PM)** và **Chủ đầu tư / Tư vấn giám sát (Supervisor)**.
   - **Mobile (Đồng đội phụ trách):** Dành cho **Phi công Drone (Drone Operator)** và **Đội thi công hiện trường (Field Repair Crew)**.
2. **Khó khăn khi chỉ có mock tĩnh dạng "sheet":**
   - Nếu dữ liệu chỉ là các mảng tĩnh (Static Arrays), khi PM tạo đợt sửa chữa mới, chuyển trang sang Supervisor sẽ **không thấy** đợt sửa chữa đó để phê duyệt.
   - Khi PM gửi yêu cầu khảo sát, không có phi công bay thì lấy đâu ra kết quả lỗi AI để PM thẩm định ở màn hình Hộp thư AI (`/pm/ai-inbox`)?
   - Khi PM giao việc, không có đội hiện trường bấm thi công thì Supervisor lấy đâu ra hồ sơ để nghiệm thu chất lượng (`/sup/acceptance`)?

---

### 1.2 Giải pháp đang triển khai: "Single Source of Truth + Giả lập đồng bộ"

Chúng ta tổ chức dữ liệu theo **3 tầng kiến trúc độc lập**:

```
┌────────────────────────────────────────────────────────┐
│  TẦNG 1: GIAO DIỆN (UI Pages & Components)             │
│  - src/pages/(pm)/*  &  src/pages/(sup)/*              │
│  - 100% Giữ nguyên JSX, CSS Tailwind, Design Tokens    │
└───────────────────────────┬────────────────────────────┘
                            │ (Gọi dữ liệu qua Services)
                            ▼
┌────────────────────────────────────────────────────────┐
│  TẦNG 2: DỊCH VỤ TRUNG GIAN (Service Gateway)          │
│  - src/api/services/*.ts                               │
│  - Kiểm tra cờ: const USE_MOCK = (env === 'true')      │
└─────────────┬────────────────────────────┬─────────────┘
              │ Nếu USE_MOCK = true        │ Nếu USE_MOCK = false
              ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│ TẦNG 3A: MOCK & SIMULATOR │  │ TẦNG 3B: BACKEND THẬT   │
│ - src/data/mockData.ts    │  │ - apiClient (Axios)     │
│ - Lưu tạm localStorage    │  │ - Gọi Endpoint REST API │
│ - Nút "Mô phỏng Mobile"   │  │   https://api.../v1     │
└───────────────────────────┘  └─────────────────────────┘
```

#### Cụ thể những gì đã được làm:
1. **Single Source of Truth (SSOT) — `src/data/mockData.ts`:**
   - Gom toàn bộ dữ liệu mẫu vào **1 file duy nhất** theo quan hệ chặt chẽ 5 tầng:  
     `Dự án/Tuyến đường` $\rightarrow$ `Đoạn tuyến` $\rightarrow$ `Tấm bê tông (Slab)` $\rightarrow$ `Vết nứt AI/Đợt bay` $\rightarrow$ `Đợt sửa chữa & BOQ` $\rightarrow$ `Đội thi công & Công việc`.
   - File `src/api/mock/data.ts` đóng vai trò cầu nối (Bridge), chỉ re-export lại từ SSOT để mọi màn hình import không bị lỗi đường dẫn.
2. **Cơ chế lưu trạng thái tương tác (`localStorage`):**
   - Khi bạn đăng nhập tài khoản **PM**, thực hiện tạo đợt sửa chữa `RB-2026-004` hoặc cập nhật trạng thái, dữ liệu được ghi vào `localStorage`.
   - Khi bạn đăng xuất và đăng nhập tài khoản **Supervisor**, hệ thống đọc dữ liệu từ `localStorage` ra. **Supervisor sẽ thấy ngay đợt sửa chữa mà PM vừa tạo** để bấm Phê duyệt hoặc Yêu cầu sửa đổi!
3. **Mô phỏng các vai trò Mobile (Drone & Đội thi công):**
   - Có cơ chế tạo sẵn các trigger mô phỏng (Fast-forward):  
     *Ví dụ:* Sau khi PM bấm "Gửi yêu cầu bay", hệ thống cho phép kích hoạt sự kiện "Drone hoàn thành & AI đã gắn nhãn xong" để tự động sinh ra danh sách hư hỏng trong Hộp thư AI tiếp nhận.

---

## 🔌 PHẦN 2: SAU NÀY GẮN API THẬT THÌ LÀM NHƯ THẾ NÀO?

Khi nhóm Backend (hoặc dự án của bạn) hoàn thành server, bạn có **2 cách tiếp cận** cực kỳ an toàn:

---

### 🟢 CÁCH 1: Chuyển mạch bằng File `.env` (KHUYÊN DÙNG — 0 Giây, 0 Rủi Ro)

Trong file `.env` (hoặc `.env.production`):

```bash
# 1. Đường dẫn Server Backend thật
VITE_API_URL=https://api.roadguard.hoanghai.vn/api/v1

# 2. Công tắc: Đặt 'false' để tắt hoàn toàn Mock Data
VITE_USE_MOCK=false
```

#### Cơ chế hoạt động trong code:
Trong các file Service (`src/api/services/`), code được viết như sau:
```typescript
import { apiClient } from '../client'
import { mockRepairBatches } from '../../data/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const getRepairBatches = async () => {
  if (USE_MOCK) {
    // Chế độ Demo: Trả về mock data từ LocalStorage/SSOT
    return getLocalBatches()
  }
  
  // Chế độ Production: Gọi trực tiếp Server Backend thật
  const res = await apiClient.get('/repair-batches')
  return res.data
}
```

> **Ưu điểm vượt trội của Cách 1:**
> - Bạn **không cần xóa bất kỳ dòng code nào**.
> - Hôm bảo vệ đồ án: Nếu mạng trường chập chờn hoặc Backend bị sập, bạn chỉ cần gõ `VITE_USE_MOCK=true` là web lập tức chuyển về chạy offline mượt mà 100%!
> - Khi nộp sản phẩm cho công ty: Đổi thành `false` để chạy Backend thật.

---

### 🔴 CÁCH 2: Xóa sạch toàn bộ Mock (Wipe-out Clean) nếu muốn Source Code "thuần khiết"

Nếu giảng viên hoặc công ty yêu cầu nộp mã nguồn không được chứa bất kỳ file mock data hay dữ liệu giả nào, bạn thực hiện đúng **3 bước cực kỳ nhanh gọn sau đây**:

#### Bước 1: Xóa các file dữ liệu Mock
Xóa các file/thư mục sau khỏi dự án:
```
❌ src/data/mockData.ts
❌ src/api/mock/
```
*(Nếu có store giả lập luồng `workflowStore.ts` hoặc thanh công cụ demo thì xóa kèm theo).*

#### Bước 2: Rút gọn các file Service (`src/api/services/*.ts`)
Mỗi hàm service chỉ còn 2 dòng gọi axios chuẩn:
```typescript
// src/api/services/batchService.ts
import { apiClient } from '../client'
import { RepairBatch } from '../../types/domain'

// Lấy danh sách đợt sửa chữa từ Backend thật
export const getRepairBatches = async (): Promise<RepairBatch[]> => {
  const response = await apiClient.get('/repair-batches')
  return response.data
}

// Tạo mới đợt sửa chữa
export const createRepairBatch = async (data: Partial<RepairBatch>): Promise<RepairBatch> => {
  const response = await apiClient.post('/repair-batches', data)
  return response.data
}
```

#### Bước 3: Kiểm tra Build
Mở terminal và chạy lệnh kiểm tra TypeScript:
```bash
npm run build
```
Nếu build thành công (`built in ...s`) là xong 100%!

---

## 🛡️ PHẦN 3: TẠI SAO GIAO DIỆN VÀ CẤU TRÚC HOÀN TOÀN KHÔNG BỊ ẢNH HƯỞNG?

Bảng đối chiếu chứng minh tính an toàn tuyệt đối:

| Thành phần trong dự án | Trạng thái khi chuyển sang API thật | Lý do an toàn |
|---|---|---|
| **Cấu trúc URL & Router** (`/pm/...`, `/sup/...`) | **100% Giữ nguyên** | Routing điều hướng theo page component, hoàn toàn độc lập với nguồn cấp dữ liệu. |
| **Giao diện & Layout** (`src/pages/`, `src/components/`) | **100% Giữ nguyên** | Toàn bộ JSX/HTML hiển thị dữ liệu dựa trên Type `domain.ts`. Khi Backend trả về đúng cấu trúc JSON đó, giao diện tự động hiển thị mượt mà. |
| **Hệ màu sắc & CSS Tokens** (`#C9A227`, `#2D3748`) | **100% Giữ nguyên** | Nằm cố định tại `src/design-tokens.ts` và `tailwind.config.js`, không liên quan đến API. |
| **Xác thực Token & Phân quyền** (`authStore.ts`, `apiClient.ts`) | **100% Giữ nguyên** | `apiClient` đã được cấu hình sẵn Request Interceptor tự động gắn `Bearer ${token}` vào Header và Response Interceptor tự động đá về `/login` khi bị 401. |

---

## 📋 PHẦN 4: CHECKLIST DÀNH CHO BẠN KHI LÀM VIỆC VỚI BACKEND

Khi đội ngũ Backend bắt đầu bàn giao API, bạn chỉ cần đưa bảng danh sách kiểu dữ liệu (`Contract`) đã định nghĩa sẵn trong `src/types/domain.ts` cho Backend:

- [ ] **Định dạng ID:** Backend trả về ID dạng chuỗi (ví dụ: `PRJ-001`, `RB-2026-001` hoặc UUID).
- [ ] **Chuẩn Enum:** Các trạng thái tuân thủ đúng `src/types/enums.ts`:
  - `RepairBatchStatus`: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REVISION_REQUIRED`, `ASSIGNED`, `IN_PROGRESS`, `PENDING_INSPECTION`, `COMPLETED`.
  - `SeverityLevel`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- [ ] **Bất biến số 1 (Business Invariant):** Không gửi trường tổng tiền dự toán gõ tay; Backend tự tính hoặc trả về `estimated_total_cost` khớp với tổng các dòng BOQ con.
- [ ] **Tọa độ bản đồ:** Chuẩn GeoJSON `[longitude, latitude]` tương thích WGS84 (EPSG:4326).

---

> **Tóm lại:**  
> Hệ thống mock hiện tại được dựng lên như một "vỏ bọc hoàn hảo" giúp bạn có thể thuyết trình, bấm thử nghiệm mượt mà từ vai trò PM sang Supervisor mà không lo thiếu dữ liệu. Sau này gắn API thật, bạn chỉ việc gạt công tắc `VITE_USE_MOCK=false` trong file `.env` là xong!
