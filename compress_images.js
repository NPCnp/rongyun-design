const fs = require('fs');
const path = require('path');

console.log('开始压缩图片...');

const imageDir = path.join(__dirname, '图画');
const outputFile = path.join(__dirname, 'js', 'image-data.js');

const imageFiles = [
    { name: '🖼️ 爱心树', file: '爱心树.png' },
    { name: '🏛️ 林则徐纪念馆', file: '林则徐纪念馆.png' },
    { name: '🪷 马鞍墙', file: '马鞍墙.png' },
    { name: '🏯 三坊七巷', file: '三坊七巷.png' },
    { name: '🎪 福', file: '福.png' },
    { name: '🏯 古厝飞檐', file: '古厝飞檐.png' },
    { name: '🏮 红墙', file: '红墙.jpg' },
    { name: '🎭 流苏', file: '流苏.jpg' },
    { name: '🌼 茉莉花', file: '茉莉花.png' },
    { name: '🌼 茉莉花1', file: '茉莉花1.png' },
    { name: '🌼 茉莉花2', file: '茉莉花2.png' },
    { name: '🍡 鱼丸', file: '鱼丸.png' },
    { name: '🏮 州', file: '州.png' },
    { name: '⛵ 上下杭', file: '上下杭.png' },
    { name: '🌃 夜景', file: '夜景.jpg' },
    { name: '🏯 西禅寺', file: '西禅寺.png' },
    { name: '🏯 白塔', file: '白塔.png' },
    { name: '🏯 乌塔', file: '乌塔.png' },
    { name: '🏛️ 五一广场', file: '五一广场.png' },
    { name: '🏯 镇海楼', file: '镇海楼.png' }
];

let output = '// 图片数据存储文件（压缩版）\n';
output += '// 使用base64编码存储图片，确保图片一定能加载\n\n';
output += 'const imagePatterns = {\n';

imageFiles.forEach(item => {
    const filePath = path.join(imageDir, item.file);
    if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString('base64');
        const ext = path.extname(item.file).toLowerCase();
        let contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') {
            contentType = 'image/jpeg';
        }
        output += `    "${item.name}": "data:${contentType};base64,${base64}",\n`;
        console.log(`已处理: ${item.name}`);
    }
});

output = output.slice(0, -2) + '\n';
output += '};\n';

fs.writeFileSync(outputFile, output, 'utf8');

console.log('\n✅ 完成！');
console.log(`文件已生成: ${outputFile}`);
console.log(`文件大小: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
