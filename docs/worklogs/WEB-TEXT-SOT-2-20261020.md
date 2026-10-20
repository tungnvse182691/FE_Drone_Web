# WORKLOG: QUÉT TEXT SÓT (ĐỢT 2) — VIỆT HÓA CÁC CỤM TIẾNG ANH CÒN SÓT SAU RESCAN

- **Ngày thực hiện:** 20/10/2026
- **Người thực hiện:** Senior Frontend Developer
- **Mục tiêu:** Xóa/Việt hóa các cụm tiếng Anh còn sót trong text hiển thị ở 7 vị trí (Reports, AI Review Inbox, Defect Verify, Project Overview, Proposal Approval Detail, Accept Invitation, Notifications). Giữ nguyên toàn bộ logic, enum, biến và điều kiện so sánh.

---

## 1. Chi tiết các chuỗi thay đổi (TRƯỚC → SAU) theo từng file

### Mục 1: Màn Báo cáo (`RiskAnalytics` & `risk-analytics/`)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(sup)/risk-analytics/RiskMetricsGrid.tsx` | Line 99 | `<span ...>PM Fast Track</span>` | `<span ...>PM XỬ LÝ NHANH</span>` | Nhãn KPI viết hoa theo quy định |
| `src/pages/(sup)/risk-analytics/RiskHeader.tsx` | Line 190 | `? 'Sửa nhanh Fast Track'` | `? 'Quy trình xử lý nhanh'` | Toast thông báo khi chọn bộ lọc |
| `src/pages/(sup)/risk-analytics/RiskHeader.tsx` | Line 200 | `<option value="ALL">Tất cả quy trình (Fast Track, Thẩm duyệt, Khẩn cấp)</option>` | `<option value="ALL">Tất cả quy trình (Xử lý nhanh, Thẩm duyệt, Khẩn cấp)</option>` | Text option bộ lọc dropdown |
| `src/pages/(sup)/risk-analytics/RiskHeader.tsx` | Line 201 | `<option value="FAST_TRACK">Sửa nhanh Fast Track (&lt; 24h)</option>` | `<option value="FAST_TRACK">Quy trình xử lý nhanh (&lt; 24h)</option>` | Text option bộ lọc dropdown |
| `src/pages/(sup)/risk-analytics/data.ts` | Line 150 | `type: 'Nhật ký thi công dặm vá Fast Track',` | `type: 'Nhật ký thi công dặm vá xử lý nhanh',` | Tên chứng từ mẫu xuất báo cáo (giữ nguyên `track: 'FAST_TRACK'`) |
| `src/pages/(sup)/risk-analytics/data.ts` | Line 176 | `type: 'Biên bản xử lý hộ lan va chạm Fast Track',` | `type: 'Biên bản xử lý hộ lan va chạm xử lý nhanh',` | Tên chứng từ mẫu xuất báo cáo (giữ nguyên `track: 'FAST_TRACK'`) |
| `src/pages/(sup)/risk-analytics/RiskDeteriorationSection.tsx` | Line 175 | `<span>Mức độ khẩn cấp (Urgency):</span>` | `<span>Mức độ khẩn cấp:</span>` | Xóa cụm ngoặc `(Urgency)` |

---

### Mục 2: Màn Hộp thư tiếp nhận lỗi (`ai-inbox`)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(pm)/ai-review/ReviewCasesTable.tsx` | Line 95 | `<span>Gộp báo trùng theo cây (Master-Tree)</span>` | `<span>Gộp báo cáo trùng theo cây</span>` | Xóa `(Master-Tree)`, câu tự nhiên |

---

### Mục 3: Màn Thẩm định lỗi (`defects verify`)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(pm)/defect-verify/DefectVerifyForm.tsx` | Line 132 | `<option value={Severity.CRITICAL}>CRITICAL — Đặc biệt khẩn cấp</option>` | `<option value={Severity.CRITICAL}>Nguy cấp — Đặc biệt khẩn cấp</option>` | Chỉ đổi text hiển thị, giữ nguyên `value={Severity.CRITICAL}` |
| `src/pages/(pm)/defect-verify/DefectBoundingBoxViewer.tsx` | Line 313 | `{displayType}` | `{displayType === DefectType.POTHOLE ? 'Ổ gà' : displayType}` | Hiển thị nhãn loại lỗi Ổ gà thay vì raw POTHOLE |
| `src/components/ui/StatusBadge.tsx` | Line 98 | `case 'CRITICAL': return 'Đặc biệt khẩn cấp'` | `case 'CRITICAL': return 'Nguy cấp'` | Trả về text hiển thị badge "Nguy cấp" |

---

### Mục 4: Màn Chi tiết dự án (`ProjectOverview` dùng chung)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Line 29 | `Luân chuyển trách nhiệm giữa Giám sát (Supervisor) và Chỉ huy trưởng (PM).` | `Luân chuyển trách nhiệm giữa Giám sát và Chỉ huy trưởng (PM).` | Xóa `(Supervisor)` trong mô tả |
| `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Line 56 | `Supervisor đã khởi tạo hồ sơ quản lý và bàn giao quyền quản trị tuyến...` | `Giám sát đã khởi tạo hồ sơ quản lý và bàn giao quyền quản trị tuyến...` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Line 128 | `Drone bay chụp ảnh hiện trường, AI phát hiện nứt vỡ, PM thẩm định bounding box & so sánh đa kỳ.` | `Drone bay chụp ảnh hiện trường, AI phát hiện nứt vỡ, PM thẩm định khung nhận diện & so sánh đa kỳ.` | `bounding box` → `khung nhận diện` |
| `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Line 154 | `...trình Supervisor phê duyệt.` | `...trình Giám sát phê duyệt.` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/project-overview/ProjectTimelineStepper.tsx` | Line 172 | `Supervisor đối soát ảnh trước/sau sửa chữa...` | `Giám sát đối soát ảnh trước/sau sửa chữa...` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Line 163 | `{project.closed_by \|\| 'Supervisor'}` | `{project.closed_by \|\| 'Giám sát'}` | Tên người đóng dự án mặc định |
| `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Line 182 | `Đang chờ Supervisor duyệt:` | `Đang chờ Giám sát duyệt:` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Line 189 | `Trách nhiệm hiện tại: Giám sát trưởng (Supervisor)` | `Trách nhiệm hiện tại: Giám sát trưởng` | Bỏ `(Supervisor)` |
| `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Line 216 | `Dự án vừa được khởi tạo bởi Supervisor (DA01).` | `Dự án vừa được khởi tạo bởi Giám sát (DA01).` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/project-overview/ProjectOverviewHeader.tsx` | Line 246 | `...và trình duyệt sang Supervisor.` | `...và trình duyệt sang Giám sát.` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/project-overview/mockData.ts` | Line 56 | `role_title: 'Giám sát trưởng (Supervisor)',` | `role_title: 'Giám sát trưởng',` | Bỏ `(Supervisor)`, giữ `role_code: 'SUPERVISOR'` |

---

### Mục 5: Màn Chi tiết gói đề xuất (`ProposalApprovalDetail`)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(sup)/proposal-approval/ApprovalDetailHeader.tsx` | Line 176 | `PM phát lệnh giao việc hiện trường (Dispatch) cho các hạng mục đã được phê duyệt` | `PM phát lệnh giao việc hiện trường cho các hạng mục đã được phê duyệt` | Xóa `(Dispatch)` trong hộp quy định |

---

### Mục 6: Màn Chấp nhận lời mời (`accept-invitation`)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(auth)/accept-invitation/AcceptForm.tsx` | Line 266 | `<span>SHA-256 Verified</span>` | `<span>Đã xác thực SHA-256</span>` | Footer xác thực bảo mật |

---

### Mục 7: Màn Thông báo (`src/pages/(pm)/notifications/`)
| File | Vị trí / Dòng | TRƯỚC | SAU | Ghi chú |
|---|---|---|---|---|
| `src/pages/(pm)/notifications/NotificationsHeader.tsx` | Line 85 | `...kết quả thẩm định Drone AI và phản hồi duyệt hồ sơ.` | `...kết quả thẩm định thiết bị bay AI và phản hồi duyệt hồ sơ.` | `Drone` → `thiết bị bay` |
| `src/pages/(pm)/notifications/NotificationsFilterBar.tsx` | Line 100 | `<span>Tiến trình AI &amp; Drone</span>` | `<span>Tiến trình AI &amp; Thiết bị bay</span>` | `Drone` → `Thiết bị bay` |
| `src/pages/(pm)/notifications/NotificationsSlaWidgets.tsx` | Line 130 | `<div ...>Supervisor Thẩm Duyệt Phương Án</div>` | `<div ...>Giám sát thẩm duyệt phương án</div>` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/AudioConfigModal.tsx` | Line 181 | `Âm dịu nhẹ khi PM hoặc Supervisor gửi hồ sơ` | `Âm dịu nhẹ khi PM hoặc Giám sát gửi hồ sơ` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 11 | `Hồ sơ đang chờ Supervisor thẩm định và phê duyệt...` | `Hồ sơ đang chờ Giám sát thẩm định và phê duyệt...` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 33 | `Chờ Supervisor nghiệm thu hiện trường.` | `Chờ Giám sát nghiệm thu hiện trường.` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 55 | `Đang chờ Supervisor thẩm tra và bấm Khóa xác nhận (LOCK)...` | `Đang chờ Giám sát thẩm tra và bấm Khóa xác nhận (LOCK)...` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 77 | `Hồ sơ pháp lý đã sẵn sàng để Supervisor cắm chữ ký số...` | `Hồ sơ pháp lý đã sẵn sàng để Giám sát cắm chữ ký số...` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 99 | `Đề nghị Supervisor kích hoạt chế độ giám sát trọng điểm...` | `Đề nghị Giám sát kích hoạt chế độ giám sát trọng điểm...` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 119 | `categoryLabel: 'Chất lượng bay Drone',` | `categoryLabel: 'Chất lượng bay thiết bị bay',` | `Drone` → `thiết bị bay` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 120 | `title: 'Báo cáo tổng hợp chất lượng ảnh bay Drone chuyến QL1A-MS-04B',` | `title: 'Báo cáo tổng hợp chất lượng ảnh bay thiết bị bay chuyến QL1A-MS-04B',` | `Drone` → `thiết bị bay` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 126 | `sender: 'Tổ bay Drone Hoàng Hải',` | `sender: 'Tổ bay thiết bị bay Hoàng Hải',` | `Drone` → `thiết bị bay` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 127 | `senderRole: 'Drone Flight Operator',` | `senderRole: 'Phi công thiết bị bay',` | Chức danh phi công |
| `src/pages/(pm)/notifications/mockData.ts` | Line 170 | `sender: 'Hệ thống Drone AI Road-YOLOv9',` | `sender: 'Hệ thống thiết bị bay AI Road-YOLOv9',` | `Drone` → `thiết bị bay` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 184 | `title: 'Supervisor đã chấp thuận Phương án kỹ thuật Gói PKG-2026-07',` | `title: 'Giám sát đã chấp thuận Phương án kỹ thuật Gói PKG-2026-07',` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 190 | `sender: 'Supervisor GS-2041 (Ban QLDA)',` | `sender: 'Giám sát GS-2041 (Ban QLDA)',` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 247 | `message: 'Supervisor từ chối hạng mục bù bê tông nhựa...'` | `message: 'Giám sát từ chối hạng mục bù bê tông nhựa...'` | `Supervisor` → `Giám sát` |
| `src/pages/(pm)/notifications/mockData.ts` | Line 252 | `sender: 'Supervisor GS-2041',` | `sender: 'Giám sát GS-2041',` | `Supervisor` → `Giám sát` |

---

## 2. Kết quả kiểm tra biên dịch TypeScript (`npx tsc -b`)
```
Exit code: 0
Stdout: (empty)
Stderr: (empty)
Trạng thái: 0 lỗi biên dịch.
```

## 3. Kiểm tra các cụm cấm (Do NOT)
- Cụm `(Urgency)` trong text hiển thị: **0**
- Cụm `(Master-Tree)` trong text hiển thị: **0**
- Cụm `(Dispatch)` trong text hiển thị: **0**
- Cụm `SHA-256 Verified` trong text hiển thị: **0**
- Cụm `Fast Track` trong text hiển thị RiskAnalytics: **0**
- Các enum, biến, logic condition (`Severity.CRITICAL`, `DefectType.POTHOLE`, `isSupervisor`, `role_code: 'SUPERVISOR'`, `track: 'FAST_TRACK'`): **Bảo toàn 100%**.
