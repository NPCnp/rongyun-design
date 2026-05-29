const fs = require('fs');
const path = require('path');

console.log('正在创建完全内联版本的 index-inline.html...');

// 读取 image-data.js
const imageDataContent = fs.readFileSync('./js/image-data.js', 'utf8');

// 读取原 index-inline.html
let htmlContent = fs.readFileSync('./index-inline.html', 'utf8');

// 在 script 标签前插入 imagePatterns 定义
const scriptTag = '<script>';
const insertPoint = htmlContent.indexOf(scriptTag);

if (insertPoint !== -1) {
    // 插入 imagePatterns 定义在第一个 script 标签内
    const beforeScript = htmlContent.substring(0, insertPoint + scriptTag.length);
    const afterScript = htmlContent.substring(insertPoint + scriptTag.length);
    
    // 修改后的完整内容
    htmlContent = beforeScript + '\n' + imageDataContent + '\n' + afterScript;
}

// 修改 themeData，使用正确的名称格式
const oldThemeData = `var themeData = {
    "三坊七巷": ["🖼️ 爱心树", "🏛️ 林则徐", "🪷 马鞍墙", "🏯 三坊七巷"],
    "福州特色": ["🎪 福", "🏯 古厝", "🏮 红墙", "🎭 流苏", "🌼 茉莉花", "🍡 鱼丸", "🏮 州"],
    "上下杭": ["⛵ 上下杭", "🌃 夜景"],
    "西禅寺": ["🏯 西禅寺"],
    "地标建筑": ["🏯 白塔", "🏯 乌塔", "🏛️ 五一广场", "🏯 镇海楼"]
};`;

const newThemeData = `var themeData = {
    "三坊七巷": ["🖼️ 爱心树", "🏛️ 林则徐纪念馆", "🪷 马鞍墙", "🏯 三坊七巷"],
    "福州特色": ["🎪 福", "🏯 古厝飞檐", "🏮 红墙", "🎭 流苏", "🌼 茉莉花", "🍡 鱼丸", "🏮 州"],
    "上下杭": ["⛵ 上下杭", "🌃 夜景"],
    "西禅寺": ["🏯 西禅寺"],
    "地标建筑": ["🏯 白塔", "🏯 乌塔", "🏛️ 五一广场", "🏯 镇海楼"]
};`;

htmlContent = htmlContent.replace(oldThemeData, newThemeData);

// 修改 addPatternToCanvas 函数
const oldAddPatternToCanvas = `function addPatternToCanvas(name, color) {
    var centerX = fabricCanvas.width / 2;
    var centerY = fabricCanvas.height / 2;
    var parts = name.split(' ');
    var imgPath = parts[0];
    var label = parts.slice(1).join(' ');
    
    // 先尝试直接加载
    fabric.Image.fromURL(imgPath, function(img) {
        // 调整图片大小，使其适合画布
        var maxWidth = fabricCanvas.width * 0.5;
        var maxHeight = fabricCanvas.height * 0.5;
        var scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        
        img.set({
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
            lockUniScaling: false,
            transparentCorners: false,
            cornerSize: 24,
            cornerTouchSize: 48
        });
        
        img.scale(scale);
        
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        saveHistory();
        showToast('已添加: ' + label);
        vibrate();
    }, function(err) {
        console.error('图片加载失败，尝试备用方案:', err);
        // 如果图片加载有问题，使用 emoji 作为备用
        var emoji = '🖼️';
        var obj = new fabric.Text(emoji, {
            left: centerX,
            top: centerY,
            fontSize: 48,
            fontFamily: 'sans-serif',
            fill: color,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
            lockUniScaling: false,
            transparentCorners: false,
            cornerSize: 24,
            cornerTouchSize: 48
        });
        
        fabricCanvas.add(obj);
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
        saveHistory();
        showToast('已添加: ' + label);
        vibrate();
    }, { crossOrigin: 'anonymous' });
}`;

const newAddPatternToCanvas = `function addPatternToCanvas(name, color) {
    var centerX = fabricCanvas.width / 2;
    var centerY = fabricCanvas.height / 2;
    var label = name;
    
    // 从 imagePatterns 中获取 base64 数据
    if (typeof imagePatterns !== 'undefined' && imagePatterns[name]) {
        var base64Data = imagePatterns[name];
        fabric.Image.fromURL(base64Data, function(img) {
            // 调整图片大小，使其适合画布
            var maxWidth = fabricCanvas.width * 0.5;
            var maxHeight = fabricCanvas.height * 0.5;
            var scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            
            img.set({
                left: centerX,
                top: centerY,
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: true,
                hasBorders: true,
                evented: true,
                lockUniScaling: false,
                transparentCorners: false,
                cornerSize: 24,
                cornerTouchSize: 48
            });
            
            img.scale(scale);
            
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            saveHistory();
            showToast('已添加: ' + name);
            vibrate();
        });
    } else {
        // 如果没有找到图片，使用 emoji 作为备用
        var emoji = name.split(' ')[0];
        var obj = new fabric.Text(emoji, {
            left: centerX,
            top: centerY,
            fontSize: 48,
            fontFamily: 'sans-serif',
            fill: color,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
            lockUniScaling: false,
            transparentCorners: false,
            cornerSize: 24,
            cornerTouchSize: 48
        });
        
        fabricCanvas.add(obj);
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
        saveHistory();
        showToast('已添加: ' + name);
        vibrate();
    }
}`;

htmlContent = htmlContent.replace(oldAddPatternToCanvas, newAddPatternToCanvas);

// 修改 renderPatterns 函数
const oldRenderPatterns = `function renderPatterns() {
    var grid = document.getElementById('patternGrid');
    grid.innerHTML = '';
    themeData[currentCategory].forEach(function(name) {
        var parts = name.split(' ');
        var imgPath = parts[0];
        var label = parts.slice(1).join(' ');
        var div = document.createElement('div');
        div.className = 'pattern-item';
        div.innerHTML = '<div class="pattern-emoji"><img src="' + imgPath + '" alt="' + label + '" style="width:100%;height:100%;object-fit:contain;"></div><div class="pattern-label">' + label + '</div>';
        div.onclick = function() {
            vibrate();
            addPatternToCanvas(name, themeColor[currentCategory]);
        };
        grid.appendChild(div);
    });
}`;

const newRenderPatterns = `function renderPatterns() {
    var grid = document.getElementById('patternGrid');
    grid.innerHTML = '';
    themeData[currentCategory].forEach(function(name) {
        var div = document.createElement('div');
        div.className = 'pattern-item';
        
        // 从 imagePatterns 获取 base64 数据
        if (typeof imagePatterns !== 'undefined' && imagePatterns[name]) {
            var base64Data = imagePatterns[name];
            var imgTag = '<img src="' + base64Data + '" alt="' + name + '" style="width:100%;height:100%;object-fit:contain;">';
            div.innerHTML = '<div class="pattern-emoji">' + imgTag + '</div><div class="pattern-label">' + name.split(' ').slice(1).join(' ') + '</div>';
        } else {
            // 备用显示 emoji
            var emoji = name.split(' ')[0];
            div.innerHTML = '<div class="pattern-emoji">' + emoji + '</div><div class="pattern-label">' + name.split(' ').slice(1).join(' ') + '</div>';
        }
        
        div.onclick = function() {
            vibrate();
            addPatternToCanvas(name, themeColor[currentCategory]);
        };
        grid.appendChild(div);
    });
}`;

htmlContent = htmlContent.replace(oldRenderPatterns, newRenderPatterns);

// 保存文件
const outputFile = './index-inline-final.html';
fs.writeFileSync(outputFile, htmlContent, 'utf8');

console.log('✅ 完成！');
console.log(`文件已生成: ${outputFile}`);
console.log(`文件大小: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
console.log('');
console.log('现在可以将这个文件部署到 GitHub/Netlify 了！');
