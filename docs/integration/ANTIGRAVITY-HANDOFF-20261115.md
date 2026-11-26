# Bàn giao Antigravity — 15/11/2026

Dừng sửa/tích hợp theo yêu cầu Hoàng. Nhánh hoang; origin/hoang được push thường, không force. Commit checkpoint toàn bộ code/docs/tests đang dở: **f438df3** (123 file). HEAD cuối là commit chứa chính note này; dùng `git rev-parse HEAD` để lấy SHA đầy đủ. Không mutation nghiệp vụ, không sửa BE/Mobile, không xóa local hoặc sửa code để làm test xanh.

## Đã xong / đã bảo toàn

- Code/tài liệu/test local trước đây đã commit tất cả dưới src/, docs/, tools/: auth/profile/invitation, personnel/primary PM, project/update/CRS/route/road-section, geometry read/draft, survey planning/create/read, Case NO_DEFECT/evidence/UI guards và regression. Đây là checkpoint nguyên trạng, không khẳng định mọi phần đã nghiệm thu.
- Các commit trước vẫn nguyên: D2/API024/KEEP_NEW; FIELD create/read/review và API084; export; API168–170 KPI. Màn KPI mới nhất9e5d923 bỏ KPI/risk/HUD thiếu nguồn, dùng adapter Alignment32648, tuyến/4 đoạn321 trùng cùng route/set, test zoom fitBounds.
- API079 runtime PASS: task574b3f4c-0778-4564-baea-35398b298ce2 project321, user POST201→GET/list200→F5 không POST mới. API074 runtime POST202→GET/list200 SUCCEEDED: export20ba537b-7757-4cc5-bdd8-f1ec36a54145; manifest/content200 sau restart/F5, PDF35993 byte SHA256 khớp ETag, completeness PARTIAL. Bản PDF đã lưu trước restart chưa tìm thấy.
- Chi tiết API/mapping/ca tay: WEB-PM-SUP-API-STATUS-20261115.md. Source runtime đã đối chiếu b89a52fe11ed146f197f3f94e115530b9b75afb0; không suy từ BE checkout khác revision.

## Còn dở / lỗi đã biết

- API084 nguồn/ảnh GET thật và test tự động PASS; POST→GET do user nghiệm thu chưa có, không đánh dấu runtime PASS.
- Crew có account crew-a được giao task nhưng client hiện hữu chưa nối luồng FIELD thật; submission/readiness/PM review runtime chưa nghiệm thu. Không làm thay Crew bằng PM, không dựng submission.
- KPI tương tác filter/map cần user review/nghiệm thu; risk/đa kỳ/SLA/thời gian duyệt/tái phát/%toàn vẹn không có nguồn phù hợp, không bịa. Màn321 geometry32648 đã chuyển bằng adapter có sẵn (kết luận thiếu WGS84 trước đó đã được sửa).
- D1 retry đã biết vẫn cần theo dõi riêng. Bảng API còn172 dòng chưa làm/chưa rà đủ và14 bị chặn; không coi checkpoint là tích hợp toàn bộ.
- Kiểm hiện trạng cuối không toàn xanh. Không sửa các lỗi dưới đây trong lượt bàn giao.

## Kiểm tra cuối trên checkpoint

- `npm run build` PASS (bao gồm tsc -b),2083 modules, với NODE_OPTIONS max-old-space-size4096/v8-pool-size1 và UV_THREADPOOL_SIZE1. Còn warning Tailwind duration-[250ms] và bundle>500kB. Không đổi build config.
- Chạy các check-*.cjs cô lập bằng node: **50 script PASS,6 FAIL,9 NOT_RUN**. Các script có child_process/URL localhost/env được bỏ khỏi lượt batch để tránh lệnh ngoài phạm vi; không coi NOT_RUN là PASS. Reporting10/export12 đã PASS trong lượt trước.
- FAIL: check-case-report-media.cjs (Unmocked triageService); check-current-route-display.cjs (Mock types/enums); check-project-timeline-warranty.cjs (assertion “25% thời gian”); check-roadguard-draft-import.cjs (validator nhận lỗi roadCode cần tên tuyến nguồn); check-step2-projects.cjs (Missing mock projectPublishedSegments); check-triage-project-eligibility.cjs (Unmocked caseScopeService).
- NOT_RUN lượt batch: check-alignment-branches.cjs, check-alignment-map-display.cjs, check-case-intake.cjs, check-pavement-layout.cjs, check-personnel-screen.cjs, check-project-exports.cjs, check-review-293d001.cjs, check-roadguard-draft-state.cjs, check-step3-geometry.cjs. Có check đã PASS ở các lượt trước; note này ghi đúng lần kiểm cuối.
- `git diff --cached --check` trước checkpoint báo một dòng trắng mới cuối tools/check-crs-profile-create.cjs:30; giữ nguyên theo lệnh không sửa. Không coi diff-check checkpoint là PASS dù working tree sạch sau commit.
- Quét staged paths/sensitive signatures: không private key/access key/JWT/secrets thực; các literal credential tìm thấy chỉ trong test mô phỏng. Không đưa .env/dependencies/build/snapshot vào staged.

## Còn ngoài Git — giữ nguyên, không xóa

- **artifacts/**:19249 file untracked,864171428 byte (~824MiB), khoảng97 nhóm lịch sử audit/runtime/snapshot/staged-tree/patch/ảnh/log/gói zip/tar. Toàn bộ là đầu ra/tài liệu chứng cứ tạm của các lượt kiểm cũ, không phải source đang dùng; để nguyên ngoài Git, không commit hàng nghìn bản sao src/docs/tests trong snapshot. Một số file có thể chứa network data nhạy cảm, không đưa nguyên thư mục lên remote. Danh mục có thể xem bằng `git ls-files --others --exclude-standard -- artifacts/`; không tự xóa để dọn ổ.
- **.env**: cấu hình môi trường riêng, có thể chứa secrets; không commit.
- **node_modules/**, **dist/**, **.vite/**, **tsconfig.tsbuildinfo** và log/cache ignored (gồm log/build bên trong artifacts): dependency/build output/cache/tạm, không commit. Giữ nguyên tại máy. Không có code/tài liệu đang dở ngoài src/docs/tools còn bỏ sót sau checkpoint; trạng thái cuối xác minh bằng git status.

Không tiếp tục sửa hoặc test mutation sau bàn giao. Hoàng chuyển sang Antigravity để review các phần dở/lỗi đã ghi.
