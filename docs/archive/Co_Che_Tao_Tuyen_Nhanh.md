# ĐẶC TẢ CƠ CHẾ KHAI BÁO & QUẢN LÝ TUYẾN NHÁNH (USE CASE DA17 / US-38 / BR-36)

> **Tài liệu nghiên cứu & định hướng triển khai kỹ thuật cho RoadGuard FE Web (Hoàng Hải Dashboard)**  
> **Áp dụng cho:** Vai trò **Project Manager (PM)** — Màn hình Quản lý Hình học Tuyến & Phân đoạn (`WF-02`).  
> **Căn cứ chuẩn:** Hồ sơ dự án `v2.2` (Use Case `DA17`, User Story `US-38`, Business Rule `BR-36` & `BR-32`).

---

## 📌 1. BỐI CẢNH & CĂN CỨ TÀI LIỆU V2.2

### 1.1. Tại sao loại bỏ nút "+ Thêm đoạn mới" trong Phân đoạn?
* **Hiện trạng cũ:** Khối "Chia đoạn theo cự ly Km" có nút `+ Thêm đoạn mới` mở modal thêm thủ công từng đoạn đơn lẻ.
* **Quy tắc v2.2 (DA14, DA15, BR-35):** 
  * Phân đoạn (`RoadSegmentSet`) là **kết quả của thuật toán chia đều liên tục dọc theo tim tuyến** (ví dụ chia 100m, 250m, 500m, 1km, 5km) phủ kín 100% chiều dài tuyến từ mốc xuất phát (`stationOriginKm`) đến cuối tuyến.
  * Việc thêm một đoạn thủ công đơn lẻ dễ gây ra khoảng hở (Gap) hoặc chồng lấn (Overlap) tọa độ, làm phá vỡ tính toàn vẹn hình học tuyến.
  * 👉 **Giải pháp:** Xóa bỏ nút `+ Thêm đoạn mới` và modal thêm đoạn lẻ. Nút `Áp dụng chia đoạn` được tối ưu để chia tự động phủ kín tuyến.

### 1.2. Nhu cầu quản lý Tuyến nhánh (Branch Network - DA17)
* Một dự án hạ tầng đường bộ thực tế (như QL1A hoặc Cao tốc La Sơn - Túy Loan) không phải là một đường thẳng đơn độc mà là một **mạng lưới phân cấp**:
  * **Trục chính (Main Alignment / Mainline):** Tuyến xương sống dài (ví dụ: 25 km).
  * **Các tuyến nhánh (Branches / Ramps / Frontage Roads):** Nhánh rẽ nút giao, đường gom, đường kết nối tách ra từ trục chính.
* **Use Case DA17 & User Story US-38:**
  * PM có thẩm quyền khai báo các tuyến nhánh mới (`POST /api/v1/projects/{projectId}/branches`).
  * Mỗi tuyến nhánh có mã nhánh riêng, chiều dài riêng, bề rộng mặt đường riêng và **điểm nút giao (Junction Node)** kết nối vào trục chính.
  * Tuyến nhánh sau khi tạo cũng có thể được phân đoạn (`RoadSegmentSet`) độc lập.

---

## 🎯 2. ĐẶC TẢ CHI TIẾT 2 CƠ CHẾ CHẤM ĐIỂM TẠO TUYẾN NHÁNH TRÊN BẢN ĐỒ

Người dùng yêu cầu: **Xác định 2 điểm mốc Đầu và Cuối, còn các điểm uốn cong ở giữa khoảng đó thì muốn chấm bao nhiêu điểm tùy ý để nắn sát theo ảnh vệ tinh thực tế.**

Dưới đây là 2 cơ chế tương tác trực quan được thiết kế để áp dụng:

---

### 🌟 CƠ CHẾ A: "CHỐT ĐẦU – CUỐI TRƯỚC, CHÈN ĐIỂM UỐN TRUNG GIAN SAU" (Khuyên dùng - Chuẩn CAD / Google Maps)

```text
[BƯỚC 1: Chấm Điểm Đầu (Nút giao)] ──────► [BƯỚC 2: Chấm Điểm Cuối (Kết thúc nhánh)]
               │                                            │
               └────────────► [ĐƯỜNG THẲNG TẠM THỜI] ◄──────┘
                                      │
               [BƯỚC 3: Click chèn n điểm trung gian ở giữa]
                                      ▼
             (Đường uốn lượn ôm sát cung đường vệ tinh thực tế)
```

#### Quy trình thao tác:
1. **Bước 1 — Xác định Điểm Đầu (Start Node / Junction Point):**
   * PM click chuột vào một vị trí trên tim đường trục chính.
   * Hệ thống tự động **bắt dính (Snap to route)** vào trục chính và tự nhận diện vị trí lý trình:
     * Ví dụ: `Km 1025+500` (Tọa độ: `108.1287, 16.2415`).
     * Cắm mốc cờ màu xanh lục: **Điểm bắt đầu rẽ (P_start)**.
2. **Bước 2 — Xác định Điểm Cuối (End Node / Terminus):**
   * PM click chuột vào vị trí kết thúc của tuyến nhánh (ranh giới hết đoạn bảo hành).
   * Cắm mốc cờ màu đỏ: **Điểm kết thúc nhánh (P_end)**.
   * Hệ thống ngay lập tức nối một đường thẳng tạm thời giữa Điểm Đầu và Điểm Cuối.
3. **Bước 3 — Chèn các điểm uốn cong trung gian (Waypoints - Không giới hạn số lượng):**
   * Trên đoạn thẳng nối giữa Đầu và Cuối, PM chỉ cần **click chuột vào bất kỳ vị trí nào để thêm điểm uốn**:
     * Chấm điểm $W_1$ $\rightarrow$ Đường uốn qua $W_1$.
     * Chấm điểm $W_2, W_3, ..., W_n$ $\rightarrow$ Tuyến đường càng thêm nhiều điểm thì càng ôm cong mượt mà theo từng khúc cua của ảnh vệ tinh.
   * **Kéo thả / Điều chỉnh đỉnh (Vertex Dragging):** Có thể giữ chuột kéo một điểm trung gian bất kỳ để nắn lại tim đường.
   * **Xóa điểm thừa:** Click chuột phải vào điểm trung gian để xóa nếu chấm nhầm.

---

### 🌟 CƠ CHẾ B: "VẼ LIÊN TỤC TỪ ĐIỂM ĐẦU ➔ CÁC ĐIỂM GIỮA ➔ CHỐT ĐIỂM CUỐI" (Chuẩn Web GIS Polyline)

```text
Click 1 (Điểm đầu P0) ──► Click 2 (Điểm cua P1) ──► Click 3 (Điểm cua P2) ──► Double-click / Nút "Chốt" (Điểm cuối Pn)
```

#### Quy trình thao tác:
1. **Click lần 1 (Điểm Đầu):** Bấm chọn điểm nút giao trên trục chính (`P0`).
2. **Click các lần tiếp theo (Điểm uốn giữa):** Click liên tục theo tim đường trên ảnh vệ tinh (`P1, P2, P3... P_n-1`). PM có thể chấm 2 điểm, 10 điểm hay 50 điểm tùy ý theo độ cong của địa hình.
3. **Chốt Điểm Cuối:**
   * Double-click chuột tại điểm cuối cùng, HOẶC bấm nút **"Chốt điểm cuối & Hoàn tất vẽ"** trên thanh công cụ.
   * Điểm cuối cùng được gắn mốc kết thúc (`P_end`).

---

## 🛠️ 3. TỰ ĐỘNG HÓA HÌNH HỌC (GEOMETRY AUTOMATION)

Sau khi chuỗi điểm $[P_0, W_1, W_2, ..., W_n, P_{end}]$ được xác định:

### 3.1. Tự động tính toán Chiều dài thực tế (Length Km)
Hệ thống sử dụng công thức khoảng cách trắc địa (Haversine formula hoặc chiếu sang hệ tọa độ phẳng UTM Zone 48N - EPSG:32648):
$$\text{Chiều dài nhánh } L = \sum_{i=0}^{n} \text{Distance}(P_i, P_{i+1})$$
* PM **không phải tự đo đạc hay gõ tay chiều dài**, hệ thống tự hiển thị: ví dụ `Chiều dài: 1.85 km`.

### 3.2. Tự động tạo Dải mặt đường (Buffer Road Surface Polygon)
* PM nhập **Bề rộng mặt đường (Road Width)**: ví dụ `W = 7.0m`.
* Hệ thống tự động tạo dải Polygon mở rộng $\pm \frac{W}{2} = 3.5m$ sang hai bên tim đường.
* Hiển thị trên bản đồ MapLibre bằng lớp màu nổi bật (Cam `#F59E0B` hoặc Tím `#6366F1`) để phân biệt rõ ràng với Trục chính màu Vàng đồng.

---

## 📊 4. MÔ HÌNH DỮ LIỆU CHUẨN (TYPESCRIPT DATA CONTRACT)

Khi lập trình, dữ liệu của Tuyến nhánh sẽ tuân theo cấu trúc sau trong `src/pages/(pm)/alignment/types.ts`:

```typescript
export interface RouteBranchItem {
  id: string                     // Định danh: 'branch-hv-01'
  projectId: string              // Thuộc dự án: 'prj-ql1a-02'
  branchCode: string             // Mã nhánh: 'BR-01'
  branchName: string             // Tên: 'Nhánh rẽ nút giao Đèo Hải Vân'
  branchType: 'RAMP' | 'FRONTAGE' | 'INTERCHANGE' | 'FEEDER' // Loại hình
  
  // Điểm nút giao trên trục chính
  junctionStationKm: number      // Lý trình giao: 1025.5 (Km 1025+500)
  junctionStationText: string    // 'Km 1025+500'
  
  // Thông số kỹ thuật
  startKm: number                // Km bắt đầu của nhánh: 0.0
  endKm: number                  // Km kết thúc: 1.85
  lengthKm: number               // Chiều dài: 1.85 km (tự động tính)
  roadWidthM: number             // Bề rộng: 7.0 mét
  corridorMarginM: number        // Hành lang: 2.0 mét
  laneCount: number              // Số làn: 2
  surfaceMaterial: string        // Vật liệu: 'Mặt BTN C12.5'
  
  // Hình học chuỗi tọa độ (Gồm điểm đầu, các điểm giữa và điểm cuối)
  coordinates: [number, number][] // [[lon0, lat0], [lon1, lat1], ..., [lonEnd, latEnd]]
  
  // Phân đoạn riêng của nhánh (kế thừa thuật toán chia đoạn tự động)
  segments?: SegmentItem[]
  status: 'DRAFT' | 'CONFIRMED'
}
```

---

## 🔄 5. KỊCH BẢN ĐỒNG BỘ GIỮA TUYẾN NHÁNH & PHÂN ĐOẠN (SEGMENT)

Khi đã có Tuyến nhánh, quy trình phân đoạn diễn ra cực kỳ chuẩn chỉnh:

1. **Tại Tab "Phân đoạn":**
   * Thêm một Dropdown chọn đối tượng phân đoạn:
     ```text
     Đối tượng phân đoạn: [ Trục chính: QL1A Km 1020 - Km 1045 (25.0 km) ▼ ]
                          [ Nhánh #01: Nhánh rẽ Đèo Hải Vân (1.85 km)    ]
                          [ Nhánh #02: Đường gom KCN Liên Chiểu (3.20 km) ]
     ```
2. **Khi chọn Trục chính:** Nút *"Áp dụng chia đoạn"* tự động chia đoạn cho trục chính (ví dụ chia 5 phân đoạn, mỗi đoạn 5km).
3. **Khi chọn Nhánh #01:** Nút *"Áp dụng chia đoạn"* tự động chia đoạn cho riêng nhánh đó (ví dụ chia 4 đoạn nhỏ, mỗi đoạn 500m).
4. **Không cần nút "+ Thêm đoạn mới" đơn lẻ:** Mọi phân đoạn của cả trục chính và nhánh rẽ đều được sinh tự động phủ kín 100% hình học tuyến, bảo đảm không có lỗi khoảng hở (Gap) hay chồng lấn (Overlap).

---

## 📋 6. KẾ HOẠCH TRIỂN KHAI CHO LẬP TRÌNH VIÊN FE (CHECKLIST)

Khi bắt đầu viết mã nguồn trong tương lai, làm theo đúng các bước tuần tự sau:

- [ ] **Bước 1 (Dọn dẹp):** Trong `AlignmentSidebar.tsx`, xóa nút `+ Thêm đoạn mới` và xóa `AlignmentAddSegmentModal` trong `AlignmentModals.tsx`.
- [ ] **Bước 2 (Kiểu dữ liệu):** Thêm interface `RouteBranchItem` vào `src/pages/(pm)/alignment/types.ts`.
- [ ] **Bước 3 (Mock Data):** Bổ sung 2 nhánh mẫu thực tế vào `alignmentData.ts` (ví dụ: Nhánh Đèo Hải Vân nối tại Km 1025+500 và Đường gom KCN Liên Chiểu nối tại Km 1041+200).
- [ ] **Bước 4 (Tab Tuyến nhánh):** Thêm Tab `Tuyến nhánh (DA17)` vào thanh tab của `AlignmentSidebar.tsx`.
- [ ] **Bước 5 (Modal / Chế độ vẽ):** Tạo Modal `AlignmentBranchModal.tsx` hỗ trợ:
  * Chốt Điểm đầu (Snap Km trên trục chính).
  * Chốt Điểm cuối.
  * Chèn các điểm trung gian uốn lượn trên bản đồ MapLibre (hoặc dán danh sách tọa độ).
- [ ] **Bước 6 (Bản đồ MapLibre):** Render Polyline nhánh rẽ màu Cam/Tím và cắm biểu tượng Nút giao (Junction Marker) tròn hai lớp tại điểm giao cắt.

---

## 🌐 7. CƠ CHẾ ĐỒNG BỘ TUYẾN NHÁNH XUYÊN SUỐT CÁC PHÂN HỆ QUẢN LÝ KHÁC

Khi hệ thống có thêm Tuyến nhánh, toàn bộ các chức năng khác (Lập lịch bay, Rà soát lỗi AI, Giao việc thi công, Báo cáo KPI) được quản lý theo **mô hình phân cấp 4 tầng chặt chẽ** (chuẩn Business Rule `BR-32`):

$$\text{Dự án (Project)} \longrightarrow \text{Tuyến (Trục chính / Tuyến nhánh)} \longrightarrow \text{Phân đoạn (Segment)} \longrightarrow \text{Tấm / Điểm hư hỏng}$$

### 7.1. Khi Lập Lịch Bay Khảo Sát Drone (`CreateSurvey.tsx` — Chuẩn KS15, KS18, US-39)
* **Thêm trường Phạm vi bay (`AlignmentScope`):**
  * Tùy chọn 1: `Trục chính: QL1A Km 1020 - Km 1045` (mặc định).
  * Tùy chọn 2: `[BR-01] Nhánh rẽ Đèo Hải Vân (Km 0+000 đến Km 1+850)`.
  * Tùy chọn 3: `[BR-02] Đường gom KCN Liên Chiểu (Km 0+000 đến Km 3+200)`.
  * Tùy chọn 4: `Toàn bộ mạng lưới (Cả trục chính & các nhánh)`.
* **Hành vi tự động:**
  * Khi PM chọn Nhánh `#01`: Ô lý trình tự động gán `Từ: Km 0+000` $\rightarrow$ `Đến: Km 1+850`. Bản đồ tự động zoom và highlight đúng dải tim đường của nhánh đó.
  * Tệp kế hoạch xuất ra định dạng Dronelink (mission export) gắn nhãn `route_type: "BRANCH"`, giúp Drone Operator nhận diện điểm cất hạ cánh tại nút giao rẽ nhánh thay vì bay nhầm trên trục chính.

### 7.2. Khi Rà Soát Lỗi AI & Tiếp Nhận Phản Ánh (`AIReviewInbox.tsx` / `DefectDetailVerify.tsx`)
* **Định vị điểm hư hỏng (Defect Location):**
  * Lỗi trên Trục chính: `QL1A • [Trục chính] Km 1022+350 • Phân đoạn #01`.
  * Lỗi trên Tuyến nhánh: `QL1A • [Nhánh #01 - Đèo Hải Vân] Km 0+450 • (Gần Nút giao Km 1025+500)`.
* **Bộ lọc thông minh (Scope Filter):** PM có thể lọc:
  * `[Tất cả hư hỏng] | [Chỉ xem Trục chính] | [Chỉ xem Tuyến nhánh]`.

### 7.3. Khi Lập Gói Đề Xuất Sửa Chữa & Giao Việc (`RepairProposals.tsx` / `AssignCrew.tsx`)
* **Gom gói sửa chữa chuyên biệt:** Cho phép PM lập gói sửa chữa theo cụm:
  * Gói 01: Sửa chữa mặt đường Trục chính.
  * Gói 02: Xử lý khe co giãn và mặt đường Nhánh rẽ Nút giao Đèo Hải Vân.
* **Chỉ dẫn cho Đội thi công (Crew Dispatch):** Lệnh công tác ghi rõ vị trí thuộc nhánh rẽ, hỗ trợ đội thi công chủ động chuẩn bị biển báo phân luồng rẽ nhánh và rào chắn an toàn phù hợp.

### 7.4. Khi Báo Cáo Rủi Ro & Dashboard KPI (`RiskAnalytics.tsx` / `PMDashboard.tsx`)
* **Bóc tách chỉ số suy thoái kỹ thuật:**
  * Tỷ lệ hư hỏng mặt đường Trục chính: Chỉ số PCI trung bình `88/100` (Tốt).
  * Tỷ lệ hư hỏng Nhánh rẽ Nút giao: Chỉ số PCI trung bình `72/100` (Trung bình — do phương tiện tải nặng thường xuyên hãm phanh ôm cua tại nút giao gây lún võng mặt đường nhanh hơn).
* Giúp PM và Supervisor đưa ra quyết định bảo dưỡng phân kỳ chính xác và thuyết phục hội đồng thẩm định.

