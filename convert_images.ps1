# 转换图画文件夹中所有图片为 Base64 并更新 imageData.js
$ErrorActionPreference = "Stop"

$imageFolder = "c:\Users\15759\Desktop\DIY1\图画"
$outputFile = "c:\Users\15759\Desktop\DIY1\standalone\data\imageData.js"

# 获取所有图片文件
$imageFiles = Get-ChildItem -Path $imageFolder -File | Where-Object { $_.Extension -match "\.(png|jpg|jpeg)$" }

Write-Host "找到 $($imageFiles.Count) 张图片"

# 创建输出内容
$output = "var imageData = {`r`n"

$index = 0
foreach ($file in $imageFiles) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $ext = $file.Extension.ToLower()
    
    # 读取图片
    $imageBytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $base64 = [System.Convert]::ToBase64String($imageBytes)
    
    # 确定MIME类型
    $mimeType = "image/png"
    if ($ext -eq ".jpg" -or $ext -eq ".jpeg") {
        $mimeType = "image/jpeg"
    }
    
    # 添加到输出
    $dataUrl = "data:$mimeType;base64,$base64"
    
    # 添加到JSON格式
    $output += "    `"$name`": `"$dataUrl`""
    if ($index -lt $imageFiles.Count - 1) {
        $output += ","
    }
    $output += "`r`n"
    
    Write-Host "已处理: $name"
    $index++
}

$output += "}`r`n"

# 写入文件
$output | Set-Content -Path $outputFile -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "🎉 完成！已更新 $outputFile"
Write-Host "共处理 $($imageFiles.Count) 张图片"
Write-Host "文件大小: $([math]::Round((Get-Item $outputFile).Length / 1MB, 2)) MB"
