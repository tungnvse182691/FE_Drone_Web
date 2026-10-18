# Worklog: ROLE-BASED ACCESS CONTROL (17_10)

- **Thời gian thực hiện:** 19/10/2026 (01:45 - 01:55)
- **Nhánh làm việc:** `tung`
- **Tác giả:** Muse (TommyNe) theo yêu cầu Nguyễn Văn Tùng
- **Căn cứ:** Tài liệu 17_10 (`05_Web/02_Supervisor-Screen-API-Matrix.md`, `05_Web/03_PM-Screen-API-Matrix.md`)

---

## I. MỤC TIÊU

Rà soát và chuẩn hóa phân quyền UI theo ma trận 17_10. Đảm bảo:
- PM không có nút approve (API-142 Supervisor-only)
- Supervisor Fast Track chỉ xem (PM chốt cuối)
- Web không có Reporter

## II. KẾT QUẢ RÀ SOÁT

### Đã đúng (không cần sửa):
1. **Nút Phê duyệt/Từ chối**: Đã được guard bởi `isSupervisor` trong `ProposalDetailModal.tsx` (dòng 210). PM không thấy nút này. ✅ Khớp AGENTS.md Điều 2 và 17_10.
2. **Reporter**: Không có `RoleCode.REPORTER` trong web, không có màn hình Reporter. ✅ Khớp 17_10 (Reporter chỉ trên Mobile).

### Thêm mới:
1. **`src/hooks/useRoleAccess.ts`**: Role guard hooks theo 17_10
   - `useIsSupervisor()`, `useIsPM()`: kiểm tra role
   - `useCanApprove()`: chỉ Supervisor được approve (API-142)
   - `useCanDispatchFastTrack()`: chỉ PM được dispatch Fast Track (PM-10)
   - `useIsReporter()`: luôn false (document rõ Web không có Reporter)
   - `hasRoleAccess()`: dùng cho route guards

## III. VERIFY
- `npx tsc -b`: 0 errors ✅
- Không thay đổi logic business hiện tại ✅
- Phần bản đồ không bị ảnh hưởng ✅

## IV. LƯU Ý
- Các màn hình TRANSPORT_BLOCKED (SUP-04, SUP-10...) vẫn hiển thị UI nhưng cần BE hỗ trợ — đã document trong `docs/17_10_DOI_CHIEU_TAI_LIEU_MOI.md`
- Task D hoàn tất. Tất cả 4 task 17_10 đã xong.
