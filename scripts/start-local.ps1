$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path "$Root\node_modules")) {
    Write-Host "首次使用：正在准备本地学习工具..." -ForegroundColor Cyan
    npm install
}

Write-Host "小译同学已在本机启动。关闭这个窗口即可停止。" -ForegroundColor Green
$LocalIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.InterfaceAlias -notmatch "Loopback|vEthernet|VMware|VirtualBox" } |
    Select-Object -First 1 -ExpandProperty IPAddress

if ($LocalIp) {
    Write-Host ""
    Write-Host "iPad 使用方法：" -ForegroundColor Yellow
    Write-Host "1. 让 iPad 和这台电脑连接同一个 Wi-Fi"
    Write-Host "2. 在 iPad Safari 中打开：http://${LocalIp}:4173" -ForegroundColor Cyan
    Write-Host "3. 可点 Safari 的“共享”→“添加到主屏幕”"
    Write-Host ""
}
Start-Process "http://127.0.0.1:4173"
npm run dev -- --host 0.0.0.0 --port 4173
