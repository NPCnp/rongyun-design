const fs = require('fs');

console.log('=== 正在准备完整部署包 ===');

const filesToCopy = [
    { src: './index-inline.html', dest: './deploy/index.html' },
    { src: './js/image-data.js', dest: './deploy/js/image-data.js' },
    { src: './js/app.js', dest: './deploy/js/app.js' },
    { src: './js/canvas-engine.js', dest: './deploy/js/canvas-engine.js' },
    { src: './js/interaction.js', dest: './deploy/js/interaction.js' },
    { src: './js/text-editor.js', dest: './deploy/js/text-editor.js' },
    { src: './js/pattern-manager.js', dest: './deploy/js/pattern-manager.js' },
    { src: './js/order.js', dest: './deploy/js/order.js' }
];

try {
    fs.mkdirSync('./deploy/js', { recursive: true });
    console.log('创建部署目录...');
    
    filesToCopy.forEach(file => {
        fs.copyFileSync(file.src, file.dest);
        console.log(`✓ ${file.src} -> ${file.dest}`);
    });
    
    console.log('');
    console.log('=== 部署包已准备完成 ===');
    console.log('请将 deploy 文件夹中的所有文件上传到 GitHub');
} catch (e) {
    console.error('错误:', e.message);
}