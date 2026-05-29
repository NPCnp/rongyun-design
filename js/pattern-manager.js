const themeData = {
    "三坊七巷": ["🏯 古厝飞檐", "🏮 石板巷", "🪷 马鞍墙", {name: "流苏", image: "图画/流苏.jpg"}, {name: "红墙", image: "图画/红墙.jpg"}],
    "闽剧": ["🎭 闽剧花旦", "🎨 脸谱纹样", "🌸 水袖"],
    "茉莉花": ["🌼 茉莉花枝", "✨ 茉莉香韵", "🍃 茉莉花环"],
    "上下杭": ["⛵ 古渡码头", "🏛️ 民国洋楼", "🌉 三通桥"],
    "船政文化": ["⚓ 铁甲战舰", "📜 船政学堂", "⚙️ 齿轮国潮"],
    "西禅古寺": ["🙏 禅意菩提", "🏯 报恩塔", "🍂 莲花禅纹"]
};
const themeColor = {
    "三坊七巷":"#b35f2d","闽剧":"#c73d3d","茉莉花":"#8fbc8f","上下杭":"#5b7c5c","船政文化":"#2c6e9e","西禅古寺":"#b8865b"
};

let currentCategory = "三坊七巷";

function buildCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(themeData).forEach(cat => {
        const btn = document.createElement('div');
        btn.className = `cat-btn ${cat === currentCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.addEventListener('click', () => {
            currentCategory = cat;
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPatterns();
        });
        container.appendChild(btn);
    });
}

function renderPatterns() {
    const grid = document.getElementById('patternGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const patterns = themeData[currentCategory];
    const color = themeColor[currentCategory];
    patterns.forEach(pattern => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'pattern-item';
        const img = document.createElement('img');
        img.className = 'pattern-img';
        let name, imagePath;
        
        if (typeof pattern === 'object') {
            name = pattern.name;
            imagePath = pattern.image;
            img.src = imagePath;
        } else {
            name = pattern;
            const svgData = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(color)}' rx='20'/%3E%3Ctext x='50' y='65' font-size='36' fill='white' text-anchor='middle'%3E${name.slice(0,2)}%3C/text%3E%3Ctext x='50' y='85' font-size='11' fill='white' text-anchor='middle'%3E${name.slice(0,5)}%3C/text%3E%3C/svg%3E`;
            img.src = svgData;
        }
        
        const label = document.createElement('div');
        label.className = 'pattern-label';
        label.innerText = name;
        itemDiv.appendChild(img);
        itemDiv.appendChild(label);
        itemDiv.addEventListener('click', () => {
            if (typeof addPatternToCanvas === 'function') {
                addPatternToCanvas(name, color, imagePath);
            }
        });
        grid.appendChild(itemDiv);
    });
}

function initPatternManager() {
    buildCategoryTabs();
    renderPatterns();
}