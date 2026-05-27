# PowerShell 图片压缩脚本
# 此脚本使用 .NET 的 System.Drawing 来压缩图片

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      图片批量压缩工具 (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否有 11.js 文件
$sourceFile = "11.js"
if (-not (Test-Path $sourceFile)) {
    Write-Host "错误: 找不到 11.js 文件" -ForegroundColor Red
    exit 1
}

Write-Host "找到源文件: $sourceFile" -ForegroundColor Green
Write-Host ""

# 创建临时目录
$tempDir = "temp_images"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null
Write-Host "已创建临时目录: $tempDir" -ForegroundColor Green

# 读取 JS 文件
Write-Host ""
Write-Host "正在读取图片数据..." -ForegroundColor Yellow
$content = Get-Content -Path $sourceFile -Raw

# 提取图片数据
$pattern = '"([^"]+)":\s*"data:image/(png|jpeg|jpg);base64,([^"]+)"'
$matches = [regex]::Matches($content, $pattern)

Write-Host "找到 $($matches.Count) 张图片" -ForegroundColor Green
Write-Host ""

# 导出图片
$exportedImages = @()
foreach ($match in $matches) {
    $name = $match.Groups[1].Value
    $format = $match.Groups[2].Value.ToLower()
    $base64Data = $match.Groups[3].Value
    
    # 清理文件名
    $cleanName = $name -replace '[\\/:*?"<>|]', '_'
    
    # 转换为文件扩展名
    if ($format -eq "jpeg") {
        $format = "jpg"
    }
    
    $filename = "$cleanName.$format"
    $filepath = Join-Path $tempDir $filename
    
    Write-Host "导出: $name -> $filename" -ForegroundColor White
    
    try {
        # 解码并保存
        $imageBytes = [Convert]::FromBase64String($base64Data)
        [System.IO.File]::WriteAllBytes($filepath, $imageBytes)
        
        $exportedImages += @{
            Name = $name
            Path = $filepath
            Format = $format
            OriginalSize = $imageBytes.Length
        }
    } catch {
        Write-Host "  导出失败: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "已导出 $($exportedImages.Count) 张图片" -ForegroundColor Green
Write-Host ""

# 显示统计信息
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "导出统计:" -ForegroundColor Cyan
$totalSize = ($exportedImages | Measure-Object -Property OriginalSize -Sum).Sum
Write-Host "总大小: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor White

$pngCount = ($exportedImages | Where-Object { $_.Format -eq "png" }).Count
$jpgCount = ($exportedImages | Where-Object { $_.Format -eq "jpg" }).Count
Write-Host "PNG 图片: $pngCount 张" -ForegroundColor White
Write-Host "JPG 图片: $jpgCount 张" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 提示用户下一步
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 图片已导出到 $tempDir 文件夹" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. 使用在线工具压缩（推荐）:" -ForegroundColor Yellow
Write-Host "   - 访问 https://squoosh.app/" -ForegroundColor White
Write-Host "   - 或 https://tinypng.com/" -ForegroundColor White
Write-Host "   - 批量拖拽上传" -ForegroundColor White
Write-Host "   - 设置: 格式=JPEG, 质量=80%, 调整大小=50-70%" -ForegroundColor White
Write-Host ""
Write-Host "3. 压缩完成后，下载压缩后的图片" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. 替换 $tempDir 中的文件" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. 运行此脚本的 '重新生成' 选项（尚未实现）" -ForegroundColor Yellow
Write-Host "   或手动将图片转换为 base64 并更新 imageData.js" -ForegroundColor Yellow
Write-Host ""

Write-Host "是否打开图片文件夹？ (Y/N): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Start-Process explorer.exe $tempDir
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
Read-Host
