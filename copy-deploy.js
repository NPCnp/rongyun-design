const fs = require('fs');
const path = require('path');

console.log('正在复制部署文件到根目录...');

const deployDir = './deploy';
const rootDir = './';

try {
    // 复制 index.html
    fs.copyFileSync(deployDir + '/index.html', rootDir + 'index.html');
    console.log('✓ deploy/index.html -> ./index.html');
    
    // 复制 js 文件夹
    copyFolderRecursiveSync(deployDir + '/js', rootDir + 'js');
    console.log('✓ deploy/js -> ./js');
    
    // 复制 图画 文件夹
    copyFolderRecursiveSync(deployDir + '/图画', rootDir + '图画');
    console.log('✓ deploy/图画 -> ./图画');
    
    console.log('');
    console.log('=== 部署文件已复制到根目录！');
    console.log('');
    console.log('现在可以推送到 GitHub 了！');
    
} catch (e) {
    console.error('错误:', e);
}

function copyFolderRecursiveSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyFolderRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
