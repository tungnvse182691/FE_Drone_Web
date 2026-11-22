# Knowledge Space — RoadGuard / HoangHaiWarrantySystem (Web PM + Giám sát)

> Dành cho thành viên mới (dev phụ, tester phụ) chưa biết gì về dự án. Đọc theo thứ tự dưới đây, khoảng 60–90 phút là đủ để bắt đầu test.
> Cập nhật lần cuối: 2026-11-22 (BE mới develop c0c99ca, đợt chỉnh sửa theo Chinhsua.docx). Nguồn: **Report 3 (SRS, tháng 10/2026)**, tài liệu BE chính thức, và kết quả chạy thật trên môi trường `roadguard-v3`.

## Dự án này là gì (3 câu)
Hệ thống quản lý **bảo hành và sửa chữa mặt đường** cho nhà thầu Hoàng Hải. Người dân báo hư hỏng, drone bay khảo sát, AI đề xuất điểm hư hỏng, **con người (PM) quyết định** có phải khiếm khuyết thật không, đội thi công (Crew) đo đạc và sửa, Giám sát duyệt và nghiệm thu. Mọi bước đều để lại bằng chứng và dấu vết kiểm toán.

## Phạm vi của repo này
| | Có trong repo này | Không |
|---|---|---|
| Client | **Web React/Vite** cho **Project Manager (PM)** và **Supervisor (Giám sát)** — thư mục `src/pages/(pm)` và `src/pages/(sup)` | Mobile (Reporter, Drone Operator, Repair Crew) — React Native + Expo, repo khác, **bỏ qua khi test** |
| Server | Chỉ **gọi** BE: `D:\ConnectAPI\RoadGuardSystem-develop (1)\RoadGuardSystem-develop` (ASP.NET Core) | Không sửa BE. Lỗi BE thì **ghi lại** để gửi BE (xem mục 13.2 trong `docs/integration/NGHIEM-THU-THEO-LUONG.md`) |
| AI | FastAPI tách riêng; Web chỉ tạo "lượt chạy AI" và đọc kết quả | Web không tự suy luận AI |

## Nguyên tắc vàng của đội (từ `AGENTS.md`, rút gọn)
1. **BE là nguồn sự thật.** FE chỉ làm những gì BE có API; thừa thì xóa, thiếu thì thêm theo đúng BE.
2. **Chỉ dùng dữ liệu thật.** Gọi API lỗi thì hiện lỗi (mã HTTP + `code`), **cấm** âm thầm trả dữ liệu giả. CSDL rỗng thì hiện trạng thái rỗng.
3. **Giữ nguyên giao diện chuẩn Hoàng Hải** (bố cục, màu vàng đồng `#C9A227`, navy `#2D3748`); chỉ sửa phần nối dữ liệu.
4. **Mọi thay đổi và mọi dữ liệu test phải được ghi lại** (`docs/integration/NGHIEM-THU-THEO-LUONG.md`, `TEST-DATA-LEDGER.md`).
5. Không chắc thì hỏi người phụ trách, không tự suy diễn nghiệp vụ.

## Thứ tự đọc
| # | File | Nội dung | Thời gian |
|---|---|---|---|
| 1 | [01-tong-quan-va-vai-tro.md](01-tong-quan-va-vai-tro.md) | Vai trò, thuật ngữ, quy tắc nghiệp vụ, những điều dễ hiểu sai | 20' |
| 2 | [02-dataflow.md](02-dataflow.md) | **Dòng dữ liệu** từ đầu đến cuối và từng luồng W01–W10: ai làm gì, ở màn nào, gọi API nào, trạng thái đổi ra sao | 40' |
| 3 | [03-huong-dan-test.md](03-huong-dan-test.md) | Dựng môi trường, tài khoản, công thức test từng luồng, **những thao tác không hoàn tác được**, bẫy thường gặp | 30' |
| 4 | [04-ban-do-man-hinh-api.md](04-ban-do-man-hinh-api.md) | Màn hình ↔ route ↔ file code ↔ API; phụ lục service→API sinh tự động | tra cứu |
| 5 | [_api-by-service.generated.md](_api-by-service.generated.md) | Bảng sinh tự động (`node tools/gen-api-by-service.cjs`) | tra cứu |

## Tài liệu gốc cần biết đường dẫn
| Cần gì | Ở đâu |
|---|---|
| SRS tổng (use case, màn hình, luật) | `D:\ConnectAPI\Report3.docx` |
| Nghiệp vụ chi tiết theo luồng (BE) | `...\NewBE\...\docs\HoangHaiWarrantySystem-Official\02_Business-Workflows\` và `...\docs\RoadGuard-Backend-Official\02_Business_Workflows\` |
| Màn hình Web ↔ API (chính thức) | `...\HoangHaiWarrantySystem-Official\05_Web\02_Supervisor-Screen-API-Matrix.md`, `03_PM-Screen-API-Matrix.md` |
| Danh mục API đầy đủ | `docs/contracts/openapi.json` (trong repo FE) hoặc `...\04_API-Contracts\02_Full-API-Catalog.md` |
| Kết quả nghiệm thu theo luồng, danh sách lỗi BE | `docs/integration/NGHIEM-THU-THEO-LUONG.md` |
| Dữ liệu test đã tạo | `docs/integration/TEST-DATA-LEDGER.md` |
| Trạng thái nối API | `docs/integration/API-WIRING-STATUS.md` (so khớp chuỗi nên có thể báo nhầm) |

## Trạng thái hiện tại (2026-11-22) trong 8 dòng
- Route Web PM/Giám sát: 40/40 mở được, không lỗi JS/5xx.
- Đã nghiệm thu bằng giao diện thật: W01 (lời mời), W02 (hoàn thành thi công), W04 (quyết định thẩm định), W05 (chạy AI), W07 (duyệt/giao Normal, xuất hồ sơ, chuyển nghĩa vụ), W10 (đánh giá lưu trữ, phong tỏa).
- **Chưa chạy được vì phụ thuộc BE:** Fast Track giao việc (thiếu `surveyId`), gỡ phong tỏa pháp lý (thiếu API liệt kê), một số quyền (Giám sát xuất hồ sơ bị 403).
- **Chưa kiểm vì cần thao tác mobile:** duyệt đo (W06), nghiệm thu/ký sau thi công, thiết bị offline (W09).
- Có 18 mục lỗi/thiếu phía BE đã ghi để gửi (bảng 13.2, 15.3 và 16.2 trong `NGHIEM-THU-THEO-LUONG.md`). Mới nhất: loại đo FIELD 5 và 6 bị BE trả 500 dù handoff nói nhận 1–6 (trigger SQL cũ).
- **BE mới (c0c99ca) đã giải quyết** việc thiếu `surveyId`: Fast Track giao được cho cả nguồn Reporter và Survey. FE nối thêm lệnh mới "hoàn tất nhiệm vụ khảo sát".
- Môi trường test hiện là stack `roadguard-v3` với **dữ liệu seed mới** (dữ liệu và ghi chú của stack cũ ở các mục trước không còn trên stack này).
- Cảnh báo: một số thao tác test **không hoàn tác được** — đọc mục 3 của [03-huong-dan-test.md](03-huong-dan-test.md) trước khi bấm.
