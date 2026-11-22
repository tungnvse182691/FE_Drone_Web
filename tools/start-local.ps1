# Chay toan bo BE (Docker) + du lieu mau + FE tren may local de test bang tay.
# Cach dung (PowerShell, thu muc goc cua FE):
#   powershell -ExecutionPolicy Bypass -File tools\start-local.ps1
#   tuy chon: -BePath "<thu muc BE>" -Project roadguard-dev1 -NoSeed -MultiVersion -NoDev
# Yeu cau: Docker Desktop dang chay, Node >= 20.15. File nay chi dung ky tu ASCII de tranh loi ma hoa PowerShell 5.1.
param(
  [string]$BePath = "D:\ConnectAPI\RoadGuardSystem-develop (1)\RoadGuardSystem-develop",
  [string]$Project = "roadguard-dev1",
  [switch]$NoSeed,
  [switch]$MultiVersion,
  [switch]$NoDev
)
$ErrorActionPreference = "Stop"
$fe = Split-Path -Parent $PSScriptRoot
$handoff = Join-Path $BePath "deploy\fe-handoff"
if (-not (Test-Path (Join-Path $handoff "compose.yaml"))) { throw "Khong tim thay BE tai $handoff (dung -BePath)" }
docker info | Out-Null

Write-Host "== 1/4 Dung BE (Docker project $Project) =="
Push-Location $handoff
try {
  docker compose -p $Project -f compose.yaml -f compose.https.yaml up -d --build
  if ($LASTEXITCODE -ne 0) { throw "docker compose up that bai" }
  $name = "$Project-scenarios-1"
  $ok = $false
  for ($i = 0; $i -lt 90; $i++) {
    $st = docker inspect -f "{{.State.Status}}|{{.State.ExitCode}}" $name 2>$null
    if ($st -like "exited|*") { if ($st -eq "exited|0") { $ok = $true }; break }
    Start-Sleep -Seconds 10
  }
  if (-not $ok) { Write-Host "CANH BAO: container scenarios chua ket thuc thanh cong. Xem: docker logs $name"; Write-Host "Neu loi 'RuntimeError' o buoc hinh hoc: BE can buoc submit trong deploy\fe-handoff\demo_ai.py (xem docs\integration\BE-REQUEST-WEBCOOKIE-ROUTES.md muc E)." }
} finally { Pop-Location }

if (-not $NoSeed) {
  Write-Host "== 2/4 Tao du lieu mau (tools\seed-test-data.mjs) =="
  $env:RG_API_CONTAINER = "$Project-api-1"
  $env:RG_SQL_CONTAINER = "$Project-sql-1"
  Push-Location $fe
  try {
    if ($MultiVersion) { node tools\seed-test-data.mjs --multi-version (Join-Path $BePath "contracts\ai\fixtures\anh02\synthetic-road-v1.mp4") } else { node tools\seed-test-data.mjs }
  } finally { Pop-Location }
}

Write-Host "== 3/4 Chuan bi FE =="
Push-Location $fe
try {
  $envFile = Join-Path $fe ".env.development.local"
  $has = (Test-Path $envFile) -and (Select-String -Path $envFile -Pattern "^VITE_DEV_FILE_BEARER=true" -Quiet)
  if (-not $has) { Add-Content -Path $envFile -Value "VITE_DEV_FILE_BEARER=true" -Encoding ASCII; Write-Host "Da them VITE_DEV_FILE_BEARER=true vao .env.development.local (chi dung cho may dev)" }
  if (-not (Test-Path (Join-Path $fe "node_modules"))) { npm ci }
  Write-Host ""
  Write-Host "== SAN SANG =="
  Write-Host "FE : http://localhost:5173   (dang nhap bang tai khoan demo)"
  Write-Host "BE : https://localhost:18443/swagger/v1/swagger.json  (chung chi tu ky, trinh duyet co the canh bao)"
  Write-Host "Mail thu (thu quen mat khau): http://localhost:18026"
  Write-Host "Lay tai khoan demo (mat khau ngau nhien): docker exec $Project-api-1 cat /handoff/demo-accounts.json"
  Write-Host "  khoa tai khoan: supervisor, pm-a, pm-b, crew-a, operator-a ... (dang nhap bang email trong file nay)"
  if ($NoDev) { Write-Host "Bo qua chay FE (-NoDev). Chay thu cong: npm run dev"; return }
  Write-Host "== 4/4 Chay FE (Ctrl+C de dung) =="
  npm run dev
} finally { Pop-Location }
