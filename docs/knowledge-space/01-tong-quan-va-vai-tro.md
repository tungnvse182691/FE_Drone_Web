# 01 — Tổng quan, vai trò, thuật ngữ, quy tắc nghiệp vụ

Nguồn chính: Report 3 (SRS) mục 1, 2, 3, 5 + tài liệu BE. Chỗ nào là **kết quả chạy thật** thì có ghi "(đã kiểm)".

## 1. Bức tranh một trang

```
 Người dân (Reporter)            Drone Operator                 Repair Crew
 [mobile] báo hư hỏng            [mobile] bay + tải video       [mobile] đo thật ngoài đường,
        │                               │                        sửa, chụp ảnh 3 pha
        ▼                               ▼                                ▲
  Report + ảnh riêng            Survey dataset (video+SRT)               │ giao việc
        │                               │ PM yêu cầu chạy AI             │
        ▼                               ▼                                │
  IncidentCase ◄── Giám sát      AI service (FastAPI) ──► ứng viên       │
  (phân loại vào dự án)          (hộp khung, độ tin cậy)  (Candidate)    │
        │                               │                                │
        └───────────► PM thẩm định ◄────┘                                │
                  KEEP_NEW / LINK_EXISTING / REJECT                      │
                          │ (chỉ PM tạo Defect, AI không bao giờ duyệt)  │
                          ▼                                              │
                       DEFECT ──► FIELD task (đo thật) ─────────────────►┤
                          │                                              │
                          ▼                                              │
        NORMAL: PM đề xuất → Giám sát duyệt → PM giao ───────────────────┤
        FAST TRACK: PM xuất bản chính sách → PM giao (24h) ──────────────┘
                          │
                          ▼
        Crew nộp → PM review (ACCEPT/SUPPLEMENT) → xác nhận cuối
        (Normal: Giám sát; Fast Track: PM) → hồ sơ/xuất báo cáo → lưu trữ + phong tỏa
```

Web (repo này) là nửa **điều hành**: PM và Giám sát. Nửa **hiện trường** (người dân, phi công, đội thi công) là mobile — chỉ xuất hiện ở đây dưới dạng dữ liệu họ tạo ra.

## 2. Vai trò và client
| Vai trò | Client | Làm gì (tóm tắt) | Quyền KHÔNG có |
|---|---|---|---|
| **Supervisor (Giám sát)** | Web `/sup/*` | Xem mọi dự án; tạo dự án, mời nhân sự, gán PM chính; **phân loại Case chưa gán vào dự án**; duyệt phương án NORMAL; xác nhận cuối NORMAL; xác nhận hoàn thành thi công; xác nhận độ phủ đường; phong tỏa pháp lý | Quyền "xem toàn cục" **không** cho phép làm việc của PM/Crew |
| **Project Manager (PM)** | Web `/pm/*` | Chỉ trong dự án mình **là thành viên**: hình học đường, quyết định ứng viên, lập kế hoạch bay, giao FIELD, đề xuất/giao sửa chữa, chính sách Fast Track, review, xuất hồ sơ | Không duyệt NORMAL, không xem dự án mình không thuộc |
| Reporter | Mobile | Đăng ký OTP, báo cáo kèm ảnh + GPS (hoặc đánh dấu "không chắc vị trí"), bổ sung | Không thấy ghi chú nội bộ, ảnh của người khác |
| Drone Operator | Mobile | Nhận nhiệm vụ bay, tải video/SRT, nộp dataset | Không làm việc của Crew |
| Repair Crew | Mobile | Đo thật (dài/rộng/sâu), sửa, chụp 3 pha (Trước/Trong/Sau), ký offline | "Đo xong" ≠ được phép sửa |

Cùng một quyền kiểm tra ở **BE mỗi lần gọi**; ẩn nút trên UI chỉ là tiện ích. (Đã kiểm: Giám sát gọi `GET /projects/{p}/exports` nhận 403 từ BE; vì vậy nút "Xuất hồ sơ gói" chỉ hiện cho PM.)

Truyền tải xác thực: Web dùng **cookie phiên + CSRF**; mobile dùng **Bearer token**. Đổi client không đổi quyền.

## 3. Thuật ngữ (đọc kỹ — rất nhiều lỗi test là do hiểu sai các từ này)
| Từ | Nghĩa trong dự án |
|---|---|
| **Project** | Một hợp đồng bảo hành/duy tu đoạn đường. Có mã (`SBX-A`), PM chính, vòng đời Planning→Active→Closed. Đóng dự án **không phải xóa**, và không tự dừng nhận báo cáo |
| **Road section / version / segment set / slab** | Tuyến → phiên bản hình học (bất biến khi đã ghim) → bộ phân đoạn dọc đường (gợi ý 100 m, PM chỉnh được) → tấm bê tông. *Phân đoạn dọc đường khác phân đoạn ảnh (pixel)* |
| **Report** | Bản báo cáo của người dân — **không đổi**, kèm ảnh riêng |
| **IncidentCase (Case)** | Hồ sơ gom các report: Giám sát phân vào dự án → PM đánh giá, nối/tách, kết luận, **công bố riêng** |
| **Candidate (ứng viên)** | Điểm nghi ngờ hư hỏng, nguồn từ Reporter hoặc AI. **Chưa phải khiếm khuyết** |
| **Defect (khiếm khuyết)** | Bản ghi nghiệp vụ chính thức, chỉ sinh ra khi **PM** quyết định `KEEP_NEW` hoặc `LINK_EXISTING` |
| **KEEP_NEW / LINK_EXISTING / REJECT** | Giữ làm khiếm khuyết mới / gom vào khiếm khuyết đã có / loại. REJECT không tạo gì |
| **Survey task / dataset** | Nhiệm vụ bay giao cho Operator / bộ video+SRT đã nộp, đã được server kiểm (VERIFIED) |
| **Processing job / AI run** | Một lần chạy AI trên dataset. Kết quả là ứng viên + khung hình nguồn. Hộp khung và độ tin cậy **không phải** kích thước thật |
| **FIELD task** | Việc đo thật ngoài hiện trường do Crew làm (trước khi xác nhận hoặc sau khi sửa) |
| **Obligation (nghĩa vụ) / Repair package / Repair item** | Nghĩa vụ sửa một phạm vi đường → gói sửa chữa → hạng mục trong gói, có `mode` = `Normal` hoặc `FastTrack` |
| **NORMAL** | PM đề xuất → **Giám sát duyệt** → PM giao → Crew làm → PM review → **Giám sát xác nhận cuối** |
| **Fast Track (FT)** | Sửa khẩn trong **24 giờ tính từ lúc giao** (không reset, không lùi ngày). Cần: chính sách đã xuất bản + độ phủ đường đã xác nhận + nguồn hợp lệ. **PM xác nhận cuối**, Giám sát chỉ được thông báo |
| **Road coverage (độ phủ)** | Phạm vi đường được phép áp dụng Fast Track; Giám sát xác nhận (REAL_SOURCE / TEST_ONLY) dựa trên tài liệu bàn giao hoặc căn cứ bảo hành |
| **Repair policy** | Chính sách FT có phiên bản: dự thảo (draft) → bản đã xuất bản (revision) |
| **VERIFIED** | Tệp đã được server kiểm tra hash/loại/chủ sở hữu. *Tải lên xong ≠ VERIFIED* |
| **UNKNOWN** | Chưa biết/thiếu. **UNKNOWN không phải 0** — UI không được hiện số 0 |
| **Notification read vs ACK** | "Đã đọc thông báo" khác "xác nhận đã nhận việc" (ACK nghiệp vụ, có đồng hồ riêng) |
| **Legal hold (phong tỏa pháp lý)** | Chặn xóa bằng chứng. Đang có hold hoặc chưa rõ căn cứ thì **cấm hủy dữ liệu** |
| **Retention eligibility** | "Đủ điều kiện xem xét lưu trữ" **không** có nghĩa là xóa. Quy định: bằng chứng/video nguồn = hết bảo hành + 5 năm; log kỹ thuật 90 ngày; export tạm 30 ngày; backup 35 ngày |
| **Idempotency-Key / If-Match / ETag** | Khóa chống gửi trùng lệnh ghi / phiên bản hiện tại của tài nguyên (nháy kép `"…"`). Thiếu hoặc cũ → 428/412/409 |

## 4. Quy tắc nghiệp vụ bất biến (rút gọn BR-SRS-01…20 của Report 3)
1. Giám sát xem được mọi dự án nhưng chỉ làm việc thuộc quyền Giám sát; PM dựa trên **tư cách thành viên hiện tại**.
2. Report cần ảnh riêng đã VERIFIED; Report **không tự tạo Defect**; có thể tồn tại không cần Survey/AI.
3. Giám sát phân Case vào dự án **trước**, rồi PM mới xử lý.
4. **Chỉ PM** chọn KEEP_NEW/LINK_EXISTING/REJECT; **AI không bao giờ duyệt** Defect, nhãn huấn luyện hay quyết định sửa.
5. Kích thước thật do **Crew đo**; UNKNOWN ≠ 0; hộp khung/độ tin cậy ≠ kích thước.
6. NORMAL: đề xuất → Giám sát duyệt → PM giao → Crew → PM review → Giám sát xác nhận cuối.
7. Fast Track: chính sách đã xuất bản + độ phủ đã xác nhận + nguồn/phiên bản hợp lệ + Crew đủ điều kiện; cửa sổ 24 giờ bắt đầu khi giao; PM xác nhận cuối.
8. Offline: mỗi bản ghi có chữ ký + ACK riêng trước khi dọn local; HTTP 200 của cả lô **không** chứng minh mọi bản ghi đã lưu.
9. Upload xong ≠ VERIFIED; khung hình AI ≠ Defect đã duyệt.
10. Công bố Case là lệnh riêng, theo người nhận; ghi chú nội bộ và ảnh người khác không bao giờ lộ.
11. Đóng dự án, xác nhận sửa, công bố Case, hết hạn lưu trữ, xóa bằng chứng là **các sự kiện độc lập**.
12. Idempotency không cấp quyền lâu dài: khi phát lại, BE kiểm lại user, nguồn, tư cách thành viên, phiên bản.
13. Ngoài phạm vi: dựng ảnh trực giao/3D, AI ước lượng kích thước vật lý, AI tự duyệt.

## 5. Điều dễ hiểu sai / mâu thuẫn tài liệu (đã gặp)
- **Mã màn hình trong Report 3 không khớp số thứ tự.** Mục 3.x ghi "SUP-02", "PM-04", "PM-11"… còn bảng 3.1.2 đánh số 1–77. Đừng ghép theo số; ghép theo **tên chức năng** (xem [04](04-ban-do-man-hinh-api.md)).
- **Tiền/BOQ:** Report 3 nhắc "ước tính chi phí", "ngân sách" ở một số mô tả (UC-NOR-01/02, màn Proposal Detail). Quy tắc của đội (`AGENTS.md`) và API NewBE hiện tại **không có trường giá tiền**. Khi test, đừng đòi tính tiền; hỏi người phụ trách nếu cần bàn.
- **Phân đoạn 50 m hay 100 m:** màn hình mô tả "lưới 50 m", còn BR-SRS-17 nói 100 m gợi ý và chỉnh được. Lấy BR-SRS-17 làm chuẩn: giá trị do PM cấu hình.
- **Trường hợp Case → FIELD trước khi có Defect** vẫn là yêu cầu sản phẩm nhưng nơi tạo trực tiếp có lỗ hổng đã biết (P2-07 trong SRS); đừng báo là lỗi FE.
- Tài liệu cũ `docs/specs/17_10` và `v2.2` **không còn là nguồn**. Dùng SRS Report 3, tài liệu BE chính thức và `docs/contracts/openapi.json`.
- Report 3 có thể khác hệ thống đang chạy: luôn đối chiếu bằng cách chạy thật, và ghi chênh lệch vào `NGHIEM-THU-THEO-LUONG.md`.
