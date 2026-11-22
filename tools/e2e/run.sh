#!/bin/bash
# Dùng: bash tools/e2e/run.sh <script.mjs> [đối số]
# Nạp tài khoản demo từ container BE vào biến môi trường (không ghi mật khẩu ra file).
# Container mặc định: roadguard-v3-api-1 (BE mới). Đổi bằng RG_API_CONTAINER=<tên>.
# Có KHÓA tuần tự: nhiều người/agent chạy cùng lúc sẽ xếp hàng (cùng tài khoản chạy song song sẽ đá phiên của nhau).
cd "$(dirname "$0")"
LOCK="${TMPDIR:-/tmp}/rg-e2e.lock"
for i in $(seq 1 400); do mkdir "$LOCK" 2>/dev/null && break; sleep 3; done
trap 'rmdir "$LOCK" 2>/dev/null' EXIT
export RG_ACCOUNTS="$(MSYS_NO_PATHCONV=1 docker exec "${RG_API_CONTAINER:-roadguard-v3-api-1}" cat /handoff/demo-accounts.json)"
node "$@" 2>&1 | grep -v -e Warning -e trace-warnings
