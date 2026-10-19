# RoadGuard — 01. Phạm vi và hướng dẫn triển khai FE

**Phiên bản:** FE-R3-v1 • **Ngày:** 27/09/2026 • **Trạng thái:** đặc tả đề xuất để FE/BE/QA review, chưa xác nhận triển khai.

## 1. Mục tiêu

Bổ sung bảy phần người dùng yêu cầu (02–08) và đặc tả app offline/sync (09), UI architecture (10), test/UAT (11), contract gaps (12), nguồn (13). Số mục02–08 giữ theo yêu cầu, không sửa mã FR/US/UC/TC gốc. Tài liệu này đặt tại `RoadGuard_Docs/09_Frontend/` theo cách sắp xếp đã thống nhất; giải nén gói rồi copy cả thư mục09_Frontend, không chỉ các file Markdown vì có contracts/config/fixtures.

## 2. Thứ tự nguồn và mức sẵn sàng

| Nhãn | Ý nghĩa |
|---|---|
| KẾ THỪA NGHIỆP VỤ | FRD/Business Rules/DD R3 đã nêu; giữ invariant và các Q chưa chốt |
| BASELINE CONTRACT | OpenAPI/TECH-R3 là đề xuất được viết trước, chưa kiểm repository/server thật |
| FE ĐỀ XUẤT | State machine, budget, folder, UI, storage adapter mới để review |
| CONDITIONAL / GAP | Cần quyết định BE/PO; không gọi API hoặc tự cấp quyền trước khi được chốt |

OpenAPI baseline và canonical được giữ đồng bộ bằng hash lock; REVIEW-01 cập nhật auth401 ở cả hai. Schema/type là projection để FE dùng; sửa contract cần review rõ. Nếu source nghiệp vụ và wire thiếu nhau, ghi FE-GAP thay vì invent field. Ví dụ quyền tác nghiệp offline không TTL đã chốt nhưng wire nhận snapshot/evaluation offline còn thiếu: giữ yêu cầu và gate implementation, không bỏ yêu cầu để cho code dễ chạy.

## 3. Bộ contract và phạm vi platform

Web quản trị/Reporter: React/TS/Vite candidate, auth adapter theo quyết định, server state typed, polling và online mutations quyền cao. Android Kotlin: local DB/file store, offline capture và durable sync theo task. PWA full field offline chưa được yêu cầu rõ nên giữ conditional; user có thể xác nhận mở scope mà không đổi business rules.

Permission UI là hướng dẫn, BE là enforcement. Role không đủ để quyết định: ownership/membership/assignment/mode/policy/PM block/state/version. Reporter chỉ public projection thuộc mình. Crew không tự đổi severity chính thức, Supervisor không mặc nhiên thực hiện mọi action PM.

## 4. Các invariant không được phá

1. Saved local ≠ sent ≠ file VERIFIED ≠ task done ≠ accepted ≠ published.
2. Token expiry ≠ hết quyền tác nghiệp offline theo snapshot; server sync vẫn cần auth hiện hành.
3. Mỗi ý định có operation ID/key ổn định; timeout/cancel không chứng minh rollback.
4. Không gửi local temp ID hoặc unknown enum để bypass type checking.
5. BEFORE đúng nguồn được gắn trước sửa; không đổi AFTER thành BEFORE; ảnh tái dùng giữ provenance.
6. Không silent overwrite khi policy/assignment/version đổi; áp dụng D05/D06/42A và giữ contract/runtime gate cho conflict/rescue.
7. Fast Track đủ điều kiện không chờ PM duyệt từng số đo; PM kiểm/đóng và báo Supervisor.
8. Notification/realtime/cache không là nguồn cấp quyền hay ACK.
9. Offline store partition account/môi trường; logout không xóa bằng chứng chưa sync.
10. Các limits trong FE là đề xuất cấu hình; không tự gắn SLA/quota/URL production chưa được cung cấp.

## 5. Luồng đọc theo vai trò

FE web: 02→03→04→05→07→08→10, dùng06 polling và11 test. Mobile: 01→02→04→09→08→10→11. BE: đọc12 trước, rồi contracts và flow09; làm rõ blockers ảnh hưởng data integrity. QA/BA: 09→11→12 đối chiếu FRD/Business Rules/DD, không pass test chỉ từ screenshot mock.

## 6. Mẫu giao việc cho AI coding

```text
Nguồn: FE-R3-v1 và contracts/openapi.baseline.yaml đúng hash.
Feature: [tên], actor/scope: [...], operationId: [...], FR: [...].
Đọc repository instructions/README/package/build files trước khi sửa.
Giữ wire fields/enum/nullability/error shape; không tự thêm query/header/endpoint.
Implement loading/empty/error/stale/offline/conflict theo phạm vi feature.
Queue/media cần durable storage và exact replay; không localStorage evidence/token mặc định.
Nếu gặp FE-GAP liên quan: làm adapter/mock có nhãn, không giả production support.
Kiểm relevant TC-FE và actual provider/device; báo test đã chạy vs chưa chạy.
Bàn giao diff, migration/recovery, dependencies và phần còn blocked.
```

## 7. Gắn vào bộ tài liệu đã sắp xếp

Trong `RoadGuard_Docs/README.md`, thêm liên kết đến `09_Frontend/01_FE_Scope_Implementation_Guide.md` và các mục02–13. Không cần đổi tên các file đã bàn giao trước. Nếu bạn chưa chạy lệnh sắp xếp cũ, vẫn dùng được gói này độc lập vì mọi link nội bộ là relative và contracts có snapshot nguồn. Manifest của gói FE là manifest riêng, không sửa manifest gói BA cũ.

## V2(3) amendment — 2026-09-28

This document follows `planning/V2/V2-3_DECISION_REGISTER.md`. D01-D28 are approved business decisions; `APPROVED_PILOT_CONFIG` and `APPROVED_TARGET` are not empirical verification. The document must distinguish `contractStatus`, `implementationStatus`, and `verificationStatus`. Reporter email/password plus one-time email OTP is the approved authentication flow; web cookie transport, pilot limits, retention and performance values remain configuration/target registers. Fast Track uses measurement-only intake followed by a separately authorized PM repair task; policy framework, reopen, partial publication, handover/conflict, BEFORE incident, curing and traffic release remain explicit contracts. Offline evaluation and AI two-stage processing are proposed until schema, fixtures and runtime/provider evidence pass.
