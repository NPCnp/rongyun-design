const canvasWidth = 500, canvasHeight = 333;
let canvas, ctx;
let elements = [];
let selectedElement = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let currentMockup = 'postcard';

const mockupBg = {
    postcard: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23fef3e2' rx='12'/%3E%3Crect x='10' y='10' width='280' height='180' fill='none' stroke='%23d6b17e' stroke-width='1.5' stroke-dasharray='4'/%3E%3C/svg%3E",
    tote: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 350'%3E%3Crect width='300' height='350' fill='%23faf5e6'/%3E%3Crect x='40' y='50' width='220' height='280' fill='%23ffffff' stroke='%23e0d0b0' stroke-width='2' rx='8'/%3E%3Cpath d='M100,50 Q100,20 150,20 Q200,20 200,50' fill='none' stroke='%23d0c0a0' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E"
};

let backgroundColor = '#ffffff';

function initCanvas() {
    const canvasElement = document.getElementById('designCanvas');
    if (!canvasElement) {
        console.error('Canvas element not found');
        return;
    }
    
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    const bgSelect = document.createElement('select');
    bgSelect.style.marginLeft = '10px';
    bgSelect.style.borderRadius = '4px';
    bgSelect.style.padding = '6px 12px';
    bgSelect.innerHTML = `<option value="#ffffff">白色底色</option><option value="#fff5e6">米黄宣纸</option><option value="#e7f0e6">茉莉淡绿</option>`;
    bgSelect.addEventListener('change', (e) => {
        backgroundColor = e.target.value;
        renderCanvas();
        updateMockup();
    });
    document.querySelector('.action-buttons').appendChild(bgSelect);
    
    const welcomeText = {
        id: Date.now(),
        type: 'text',
        text: '福州·三坊七巷',
        x: 150,
        y: 160,
        fontSize: 26,
        fontFamily: "'Noto Serif SC', serif",
        color: '#b45f2b',
        rotation: 0,
        scale: 1
    };
    elements.push(welcomeText);
    
    renderCanvas();
    updateMockup();
}

function renderCanvas() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.strokeStyle = '#d4a373';
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    ctx.setLineDash([]);
    
    elements.forEach((el, index) => {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.scale(el.scale, el.scale);
        
        if (el.type === 'text') {
            ctx.font = `${el.fontSize}px ${el.fontFamily}`;
            ctx.fillStyle = el.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            ctx.fillText(el.text, 0, 0);
            ctx.shadowColor = 'transparent';
        }
        
        if (selectedElement === index) {
            drawSelectionBox(el);
        }
        
        ctx.restore();
    });
}

function drawSelectionBox(el) {
    let width, height;
    if (el.type === 'text') {
        ctx.font = `${el.fontSize}px ${el.fontFamily}`;
        const metrics = ctx.measureText(el.text);
        width = metrics.width + 20;
        height = el.fontSize + 10;
    }
    
    ctx.strokeStyle = '#b45f2b';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width/2 - 5, -height/2 - 5, width + 10, height + 10);
    
    const handleSize = 12;
    ctx.fillStyle = '#b45f2b';
    ctx.fillRect(-width/2 - handleSize/2 - 5, -height/2 - handleSize/2 - 5, handleSize, handleSize);
    ctx.fillRect(width/2 - handleSize/2 + 5, -height/2 - handleSize/2 - 5, handleSize, handleSize);
    ctx.fillRect(-width/2 - handleSize/2 - 5, height/2 - handleSize/2 + 5, handleSize, handleSize);
    ctx.fillRect(width/2 - handleSize/2 + 5, height/2 - handleSize/2 + 5, handleSize, handleSize);
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (isPointInElement(x, y, el)) {
            selectedElement = i;
            isDragging = true;
            dragOffset = { x: x - el.x, y: y - el.y };
            renderCanvas();
            return;
        }
    }
    selectedElement = null;
    renderCanvas();
}

function handleMouseMove(e) {
    if (!isDragging || selectedElement === null) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    elements[selectedElement].x = x - dragOffset.x;
    elements[selectedElement].y = y - dragOffset.y;
    
    renderCanvas();
    updateMockup();
}

function handleMouseUp() {
    isDragging = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (isPointInElement(x, y, el)) {
            selectedElement = i;
            isDragging = true;
            dragOffset = { x: x - el.x, y: y - el.y };
            renderCanvas();
            return;
        }
    }
    selectedElement = null;
    renderCanvas();
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDragging || selectedElement === null) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    elements[selectedElement].x = x - dragOffset.x;
    elements[selectedElement].y = y - dragOffset.y;
    
    renderCanvas();
    updateMockup();
}

function handleTouchEnd() {
    isDragging = false;
}

function isPointInElement(x, y, el) {
    let width, height;
    if (el.type === 'text') {
        ctx.font = `${el.fontSize * el.scale}px ${el.fontFamily}`;
        const metrics = ctx.measureText(el.text);
        width = metrics.width + 20;
        height = el.fontSize + 10;
    }
    
    return x >= el.x - width/2 && x <= el.x + width/2 &&
           y >= el.y - height/2 && y <= el.y + height/2;
}

function addPatternToCanvas(text, colorHex) {
    const newElement = {
        id: Date.now(),
        type: 'text',
        text: text,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        fontSize: 28,
        fontFamily: "'Noto Serif SC', serif",
        color: colorHex,
        rotation: 0,
        scale: 1
    };
    elements.push(newElement);
    selectedElement = elements.length - 1;
    renderCanvas();
    updateMockup();
    if (typeof saveHistory === 'function') saveHistory();
}

function addUserText(textContent) {
    let content = textContent ? textContent.trim() : document.getElementById('userTextInput').value.trim();
    if (content === "") content = "福州·有福";
    const fontFamily = document.getElementById('fontFamilySelect').value;
    const fontSize = parseInt(document.getElementById('fontSizeSelect').value);
    const color = document.getElementById('textColorPicker').value;
    
    const newElement = {
        id: Date.now(),
        type: 'text',
        text: content,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        fontSize: fontSize,
        fontFamily: fontFamily,
        color: color,
        rotation: 0,
        scale: 1
    };
    elements.push(newElement);
    selectedElement = elements.length - 1;
    renderCanvas();
    updateMockup();
    if (typeof saveHistory === 'function') saveHistory();
}

function resetCanvas() {
    elements = [];
    selectedElement = null;
    renderCanvas();
    updateMockup();
    if (typeof saveHistory === 'function') saveHistory();
}

function deleteSelected() {
    if (selectedElement !== null) {
        elements.splice(selectedElement, 1);
        selectedElement = null;
        renderCanvas();
        updateMockup();
        if (typeof saveHistory === 'function') saveHistory();
    } else {
        alert("请先点击选中一个图案或文字");
    }
}

function updateMockup() {
    const mockImg = document.getElementById('mockupImage');
    if (!mockImg) return;
    
    const designURL = canvas.toDataURL({ format: 'png' });
    const bgURL = mockupBg[currentMockup];
    const finalCanvas = document.createElement('canvas');
    let w, h;
    
    const scaleFactor = 2;
    if (currentMockup === 'postcard') {
        w = 300 * scaleFactor;
        h = 200 * scaleFactor;
        finalCanvas.width = w;
        finalCanvas.height = h;
        const ctx = finalCanvas.getContext('2d');
        const bgImg = new Image();
        bgImg.crossOrigin = "Anonymous";
        bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, w, h);
            const designImg = new Image();
            designImg.crossOrigin = "Anonymous";
            designImg.onload = () => {
                const scale = Math.min(260 * scaleFactor / designImg.width, 160 * scaleFactor / designImg.height);
                const dw = designImg.width * scale;
                const dh = designImg.height * scale;
                const dx = (w - dw)/2;
                const dy = (h - dh)/2;
                ctx.drawImage(designImg, dx, dy, dw, dh);
                mockImg.src = finalCanvas.toDataURL();
            };
            designImg.src = designURL;
        };
        bgImg.src = bgURL;
    } else {
        w = 300 * scaleFactor;
        h = 350 * scaleFactor;
        finalCanvas.width = w;
        finalCanvas.height = h;
        const ctx = finalCanvas.getContext('2d');
        const bgImg = new Image();
        bgImg.crossOrigin = "Anonymous";
        bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, w, h);
            const designImg = new Image();
            designImg.crossOrigin = "Anonymous";
            designImg.onload = () => {
                const scale = Math.min(180 * scaleFactor / designImg.width, 200 * scaleFactor / designImg.height);
                const dw = designImg.width * scale;
                const dh = designImg.height * scale;
                const dx = (w - dw)/2;
                const dy = 80 * scaleFactor;
                ctx.drawImage(designImg, dx, dy, dw, dh);
                mockImg.src = finalCanvas.toDataURL();
            };
            designImg.src = designURL;
        };
        bgImg.src = bgURL;
    }
}

function setupMockupToggle() {
    document.querySelectorAll('.mockup-type').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.mockup-type').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            currentMockup = el.getAttribute('data-type');
            updateMockup();
        });
    });
}

function exportImage() {
    const dataURL = canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.download = 'my_design.png';
    link.href = dataURL;
    link.click();
}

function confirmOrder() {
    showOrderModal();
}

function showOrderModal() {
    let modal = document.getElementById('orderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📋 确认订单</h3>
                    <span class="modal-close" onclick="closeOrderModal()">✕</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>姓名 <span class="required">*</span></label>
                        <input type="text" id="orderName" placeholder="请输入您的姓名" required>
                    </div>
                    <div class="form-group">
                        <label>手机号 <span class="required">*</span></label>
                        <input type="tel" id="orderPhone" placeholder="请输入您的手机号" required>
                    </div>
                    <div class="order-preview">
                        <img id="orderPreviewImg" src="" alt="设计预览">
                    </div>
                    <button class="btn btn-primary" onclick="submitOrder()">✅ 提交订单</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const dataURL = canvas.toDataURL({ format: 'png' });
    document.getElementById('orderPreviewImg').src = dataURL;
    modal.classList.add('active');
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function submitOrder() {
    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    
    if (!name) {
        alert('请输入姓名');
        return;
    }
    if (!phone) {
        alert('请输入手机号');
        return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        alert('请输入正确的手机号');
        return;
    }
    
    let orderNo = localStorage.getItem('lastOrderNo') || 0;
    orderNo = parseInt(orderNo) + 1;
    localStorage.setItem('lastOrderNo', orderNo);
    
    const dataURL = canvas.toDataURL({ format: 'png' });
    
    const order = {
        orderNo: orderNo,
        name: name,
        phone: phone,
        design: dataURL,
        time: new Date().toLocaleString('zh-CN'),
        timestamp: Date.now(),
        status: '待制作'
    };
    
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    closeOrderModal();
    alert(`✅ 订单已提交！\n\n订单号：${orderNo}\n姓名：${name}\n\n请凭手机号 ${phone} 到前台制作~`);
}

function setupKeyboardDelete() {
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement !== null) {
            elements.splice(selectedElement, 1);
            selectedElement = null;
            renderCanvas();
            updateMockup();
            e.preventDefault();
        }
    });
}
