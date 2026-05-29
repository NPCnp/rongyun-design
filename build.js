const fs = require('fs');

const inputFile = './index-inline.html';
const outputFile = './index.html';

console.log('Reading main HTML file...');
let htmlContent = fs.readFileSync(inputFile, { encoding: 'utf8' });

console.log('Reading image-data.js...');
const imageData = fs.readFileSync('./js/image-data.js', { encoding: 'utf8' });

console.log('Replacing image-data.js reference...');
htmlContent = htmlContent.replace(
    '<script src="js/image-data.js"></script>',
    '<script>\n/*<![CDATA[*/\n' + imageData + '\n/*]]>*/\n</script>'
);

console.log('Removing other external JS references...');
htmlContent = htmlContent.replace(
    /<script src="js\/[^"]+"><\/script>/g,
    ''
);

console.log('Reading other JS files...');
const jsFiles = ['app.js', 'canvas-engine.js', 'interaction.js', 'text-editor.js', 'pattern-manager.js', 'order.js'];
let additionalJS = '';
jsFiles.forEach(file => {
    const content = fs.readFileSync('./js/' + file, { encoding: 'utf8' });
    additionalJS += content + '\n';
    console.log(`  ✓ ${file}`);
});

console.log('Adding additional JS...');
htmlContent = htmlContent.replace('</body>', '<script>\n/*<![CDATA[*/\n' + additionalJS + '\n/*]]>*/\n</script>\n</body>');

console.log('Writing output file...');
fs.writeFileSync(outputFile, htmlContent, { encoding: 'utf8' });

const stats = fs.statSync(outputFile);
console.log(`✅ 生成成功: ${outputFile}`);
console.log(`文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);