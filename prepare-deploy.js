const fs = require('fs');
const path = require('path');

console.log('=== 正在准备完整部署包 ===');

// 创建部署目录结构
const deployDir = './deploy';
const jsDir = path.join(deployDir, 'js');
const imgDir = path.join(deployDir, '图画');

try {
    // 清理旧的部署文件夹
    if (fs.existsSync(deployDir)) {
        deleteRecursive(deployDir);
    }
    
    // 创建新目录
    if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir);
    if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir);
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);
    
    console.log('创建部署目录结构完成');
    
    // 复制 HTML 文件
    fs.copyFileSync('./index-inline.html', './deploy/index.html');
    console.log('✓ index-inline.html -> deploy/index.html');
    
    // 复制 JS 文件
    const jsFiles = ['app.js', 'canvas-engine.js', 'interaction.js', 'text-editor.js', 'pattern-manager.js', 'order.js'];
    jsFiles.forEach(file => {
        const src = './js/' + file;
        fs.copyFileSync(src, './deploy/js/' + file);
        console.log('✓ js/' + file + ' -> deploy/js/' + file);
    });
    
    // 复制所有图片
    const imgSrcDir = './图画';
    const imgFiles = fs.readdirSync(imgSrcDir);
    imgFiles.forEach(file => {
        const src = path.join(imgSrcDir, file);
        const dest = path.join(imgDir, file);
        fs.copyFileSync(src, dest);
        console.log('✓ 图画/' + file + ' -> 图画/' + file);
    });
    
    console.log('');
    console.log('=== 部署包已准备完成！');
    console.log('');
    console.log('请将 deploy 文件夹中的所有文件提交到 GitHub');
    console.log('');
    console.log('部署结构：');
    console.log('├── index.html');
    console.log('├── js/');
    console.log('│   └── (各种 js 文件)');
    console.log('└── 图画/');
    console.log('    └── (各种图片文件)');
    console.log('');
    console.log('现在可以上传到 GitHub 了！');
    
} catch (e) {
    console.error('错误:', e);
}

// 辅助函数：递归删除文件夹
function deleteRecursive(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            deleteRecursive(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    });
    fs.rmdirSync(dir);
}
