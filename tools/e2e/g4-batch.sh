#!/bin/bash
# Chạy nhiều giai đoạn g4 liên tiếp dưới MỘT khóa e2e. Dùng: bash tools/e2e/g4-batch.sh "node g4-field.mjs ui" "G4_TYPES=6,1 node g4-flow.mjs create" ... (mỗi tham số là một lệnh đầy đủ)
cd "$(dirname "$0")"
LOCK="${TMPDIR:-/tmp}/rg-e2e.lock"
for i in $(seq 1 600); do mkdir "$LOCK" 2>/dev/null && break; sleep 3; done
trap 'rmdir "$LOCK" 2>/dev/null' EXIT
export RG_ACCOUNTS="$(MSYS_NO_PATHCONV=1 docker exec "${RG_API_CONTAINER:-roadguard-v4-api-1}" cat /handoff/demo-accounts.json)"
for stage in "$@"; do
  echo "=== $stage"
  eval "$stage" 2>&1 | grep -v -e Warning -e trace-warnings
done
