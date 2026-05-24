const fs = require('fs');
const path = require('path');

const imagesDir = './图画';
const outputFile = './js/image-data.js';

const imageFiles = fs.readdirSync(imagesDir).filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file)
);

const imageData = {};

imageFiles.forEach(file => {
    const fullPath = path.join(imagesDir, file);
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    
    const buffer = fs.readFileSync(fullPath);
    const base64 = buffer.toString('base64');
    
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
    }
    
    imageData[name] = `data:${mimeType};base64,${base64}`;
    console.log(`处理: ${file} -> ${name}`);
});

const content = `var imageData = ${JSON.stringify(imageData, null, 4)};`;
fs.writeFileSync(outputFile, content);

console.log(`\n已成功生成 ${outputFile}`);
console.log(`共处理 ${imageFiles.length} 张图片`);