# AGENTS.md — RoadGuard FE_Web (Hoàng Hải Dashboard)

> **Nguồn-sự-thật cho mọi AI làm việc trong repo này.**  
> Dự án do **Hoàng** phụ trách solo frontend web. Đọc hết file này TRƯỚC khi viết code.

---

## 🛡️ PHẦN A: KỶ LUẬT CHỐNG AI "NGÁO" (BẮT BUỘC TUÂN THỦ 100%)

Nguyên nhân AI "ngáo": **viết trước khi đọc đủ** (premature commitment), **tưởng tượng thay vì chạy thật**, và **đoán tên/API/field thay vì tra cứu**.

### 5 Nguyên Tắc Vàng
1. **Evidence trước, edit sau:** Chỉ sửa file sau khi đã đọc file đó + các file liên quan (caller, type, mock, config).
2. **Spec v2.2 là source of truth, Stitch chỉ để tham khảo bố trí & mã màu:**
   - **Tài liệu `v2.2`** là căn cứ duy nhất về nghiệp vụ, logic, quy tắc (BR), chức năng (FR), trường dữ liệu và nội dung.
   - **Ảnh/HTML Stitch** trong `docs/stitch-designs/` **CHỈ DÙNG ĐỂ THAM KHẢO CÁCH BỐ TRÍ (LAYOUT) VÀ MÃ MÀU/PHONG CÁCH GIAO DIỆN**. Tuyệt đối **KHÔNG copy nội dung, text hay dữ liệu giả** từ Stitch bỏ vào web.
3. **Đừng tưởng tượng — hãy kiểm chứng:** Sau khi viết code, chạy build hoặc kiểm tra import/type, không phán đoán mơ hồ.
4. **Mọi tên đều phải có căn cứ:** Tên hàm, field, endpoint, mã màn — mỗi cái phải trỏ được về một nơi đã đọc trong `src/types/domain.ts` hoặc spec `v2.2`. Không trỏ được = bịa = CẤM.
5. **Không chắc → hỏi Hoàng, không tự chế:** Thiếu thông tin hoặc phát hiện mâu thuẫn thì dừng lại hỏi Hoàng ngay, không tự lấp chỗ trống.

### Checklist Chống Bịa (Kiểm tra trước mỗi lần sinh code)
- [ ] **Đường dẫn file:** Đã kiểm tra file tồn tại trong cấu trúc phẳng `src/pages/(pm)/` hoặc `src/pages/(sup)/`.
- [ ] **Tham khảo Stitch:** Chỉ tham khảo bố cục khung hình, vị trí thành phần và mã màu từ `docs/stitch-designs/`. Không bê nguyên text/nội dung/dữ liệu giả của Stitch vào.
- [ ] **Nội dung & Dữ liệu chuẩn v2.2:** Nghiệp vụ, field dữ liệu, nhãn hiển thị đối chiếu 100% theo tài liệu `v2.2`, `src/types/domain.ts` và `src/types/enums.ts`.
- [ ] **Màu sắc & Phông chữ:** Dùng đúng tokens trong `src/design-tokens.ts` (Vàng đồng `#C9A227`, Navy `#2D3748`, Dark `#1A1D20`).
- [ ] **Không scope creep & không suy luận thêm:** Chỉ sửa/tạo đúng màn hình hoặc tính năng Hoàng yêu cầu, spec không có thì không tự vẽ ra.

---

## 📌 PHẦN B: BỐI CẢNH DỰ ÁN & VAI TRÒ HỆ THỐNG

**RoadGuard** là hệ thống quản lý bảo hành & sửa chữa hạ tầng đường bộ của nhà thầu **Hoàng Hải**.  
Phiên bản Web Dashboard phục vụ **2 vai trò chính tại văn phòng**:

| Vai trò | RoleCode | Thư mục màn hình | Mô tả nghiệp vụ |
|---|---|---|---|
| **Project Manager** (Chỉ huy trưởng) | `PROJECT_MANAGER` | `src/pages/(pm)/` | Tạo yêu cầu bay drone, thẩm định lỗi AI (bounding box + đa kỳ), gom đợt sửa chữa, lập dự toán chi phí, trình duyệt hồ sơ, giao việc đội thi công ngoài hiện trường. |
| **Supervisor** (Giám sát / Chủ đầu tư) | `SUPERVISOR` | `src/pages/(sup)/` | Thẩm duyệt hồ sơ đợt sửa chữa & dự toán, yêu cầu sửa đổi/từ chối, nghiệm thu chất lượng thi công, theo dõi KPI rủi ro suy thoái mặt đường, ký số đóng đợt sửa chữa. |

---

## 🗺️ PHẦN C: BẢNG MAPPING 18 MÀN HÌNH STITCH → ROUTE & FILE

Tổ chức phẳng theo thư mục vai trò (tương tự như Mobile Expo Router):

| STT | Tên màn hình Stitch | Vai trò | Route URL | File Component |
|:---:|---|:---:|---|---|
| **01** | Đăng nhập & Đổi mật khẩu lần đầu | Chung | `/login`, `/force-change-password` | `src/pages/(auth)/Login.tsx` |
| **02** | Dashboard KPI & Lối tắt PM | PM | `/pm/dashboard` | `src/pages/(pm)/PMDashboard.tsx` |
| **03** | Dashboard KPI & Rủi ro Giám sát | SUP | `/sup/dashboard` | `src/pages/(sup)/SupDashboard.tsx` |
| **04** | Danh sách dự án bảo hành | Chung | `/pm/projects`, `/sup/projects` | `src/pages/(pm)/ProjectList.tsx` |
| **05** | Danh sách yêu cầu bay khảo sát | PM | `/pm/surveys` | `src/pages/(pm)/SurveyRequests.tsx` |
| **06** | Tạo yêu cầu bay khảo sát Drone | PM | `/pm/surveys/create` | `src/pages/(pm)/CreateSurvey.tsx` |
| **07** | Hộp thư tiếp nhận lỗi do AI phát hiện | PM | `/pm/ai-inbox` | `src/pages/(pm)/AIReviewInbox.tsx` |
| **08** | Thẩm định chi tiết lỗi AI (Bounding box) | PM | `/pm/defects/:id/verify-a` | `src/pages/(pm)/DefectDetailVerify.tsx` |
| **09** | So sánh ảnh hư hỏng đa kỳ (Temporal) | PM | `/pm/defects/:id/verify-b` | `src/pages/(pm)/DefectDetailVerify.tsx` |
| **10** | Gom đợt sửa chữa & Lập phương án khối lượng kỹ thuật | PM | `/pm/proposals` (alias: `/pm/repair-batches/create`) | `src/pages/(pm)/RepairProposals.tsx` |
| **11** | Trình duyệt hồ sơ đợt sửa chữa | PM | `/pm/proposals/:id` (alias: `/pm/repair-batches/:id/submit`) | `src/pages/(sup)/ProposalApprovalDetail.tsx` |
| **12** | Danh sách & Thẩm duyệt đợt sửa chữa | SUP | `/sup/proposals`, `/sup/approvals/:id` | `src/pages/(sup)/ProposalApprovalDetail.tsx` |
| **13** | Yêu cầu sửa đổi / Từ chối đợt sửa | SUP | `/sup/approvals/:id/reject` | `src/pages/(sup)/BatchRejection.tsx` |
| **14** | Phân công đội thi công (Repair Crew) | PM | `/pm/repair-batches/assign` | `src/pages/(pm)/AssignCrew.tsx` |
| **15** | Theo dõi nhiệm vụ đo đạc bổ sung | PM | `/pm/field-tasks` | `src/pages/(pm)/FieldTasks.tsx` |
| **16** | Nghiệm thu chất lượng ngoài hiện trường | SUP | `/sup/acceptance`, `/sup/acceptance/:batchId` | `src/pages/(sup)/EvidenceCloseoutDetail.tsx` |
| **17** | Xác nhận hoàn thành công việc | PM | `/pm/work-orders/:id/confirm`, `/pm/evidence-closeout` | `src/pages/(sup)/EvidenceCloseoutDetail.tsx` |
| **18** | Báo cáo phân tích rủi ro & Ký đóng đợt | SUP | `/sup/risk-analytics`, `/sup/signoff` | `src/pages/(sup)/RiskAnalytics.tsx` |

---

## 🔒 PHẦN D: 10 ĐIỀU BẤT BIẾN (BUSINESS INVARIANTS)

1. **Khối lượng kỹ thuật thi công (Zero Money / Không tính toán giá tiền):** Hệ thống chỉ quản lý các chỉ số kỹ thuật công trình đường bộ (diện tích cào bóc $m^2$, chiều dài trám nứt $m$, chiều sâu $cm$, định mức vật tư theo TCVN 8819:2011). Tuyệt đối **KHÔNG CÓ** trường giá tiền, đơn giá hay bảng BOQ tài chính.
2. **Quyền Duyệt/Từ chối:** Chỉ tài khoản có `role === RoleCode.SUPERVISOR` mới được nhìn thấy và bấm nút Phê duyệt / Từ chối đợt sửa chữa. PM không bao giờ có nút này.
3. **Đóng băng hồ sơ (`APPROVED`):** Khi đợt sửa chữa đã được Supervisor duyệt (`APPROVED`), toàn bộ danh sách khiếm khuyết và phương án kỹ thuật trong đợt đó bị khóa cứng (Read-only), không ai được sửa/xóa.
4. **Ảnh đa kỳ (Temporal epoch):** Ảnh kỳ mới nhất luôn được so sánh trực quan song song (Side-by-side hoặc Overlay) với ảnh kỳ trước đó để đánh giá tốc độ nứt lún.
5. **Geometry chuẩn GeoJSON:** Tọa độ hư hỏng tương thích `geography(4326)` và hệ quy chiếu UTM Zone 32648 (EPSG:32648).
6. **Token Authentication:** Bearer Access Token chỉ lưu `in-memory` (Zustand state). Refresh token nằm trong HttpOnly Cookie hoặc cơ chế bảo mật tiêu chuẩn. Tự động redirect về `/login` khi 401.
7. **Đổi mật khẩu lần đầu (`force-change-password`):** Nếu `user.must_change_password === true`, mọi route phải bị chặn và bắt buộc chuyển hướng đến trang đổi mật khẩu.
8. **Trạng thái đợt sửa (`RepairBatchStatus`):** Tuân thủ đúng máy trạng thái: `DRAFT` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` hoặc `REVISION_REQUIRED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `PENDING_INSPECTION` $\rightarrow$ `COMPLETED`.
9. **Ký số đóng đợt (`Sign-off`):** Chỉ thực hiện được khi 100% hạng mục trong đợt đã qua bước Nghiệm thu đạt yêu cầu (`PASSED`).
10. **Design System:** Màu vàng đồng `#C9A227` là màu thương hiệu Hoàng Hải — chỉ dành cho 1 nút CTA chính/màn, tab đang chọn hoặc chỉ số KPI nổi bật. Không lạm dụng làm màu nền tràn lan.

---

## 💻 PHẦN E: TECH STACK ĐÃ CHỐT

- **Framework:** Vite + React 19 + TypeScript
- **Styling:** TailwindCSS + Custom Tokens (`src/design-tokens.ts`)
- **State Management:** Zustand (gọn nhẹ, không dùng Redux Toolkit)
- **Data Fetching:** TanStack Query v5 (React Query)
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **HTTP Client:** Axios (với Request/Response Interceptor)
