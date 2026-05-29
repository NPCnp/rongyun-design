function showToast(msg) {
    var t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 2000);
}

function vibrate(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern || 10);
    }
}

function buildCategoryTabs() {
    var container = document.getElementById('categoryTabs');
    container.innerHTML = '';
    Object.keys(themeData).forEach(function(cat) {
        var btn = document.createElement('div');
        btn.className = 'cat-btn ' + (cat === currentCategory ? 'active' : '');
        btn.innerText = cat;
        addMobileClickSupport(btn, function() {
            vibrate();
            currentCategory = cat;
            document.querySelectorAll('.cat-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            renderPatterns();
        });
        container.appendChild(btn);
    });
}

function renderPatterns() {
    var grid = document.getElementById('patternGrid');
    grid.innerHTML = '';
    themeData[currentCategory].forEach(function(name) {
        var imgPath = (window.imageData && window.imageData[name]) || ('图画/' + name + getFileExtension(name));
        var div = document.createElement('div');
        div.className = 'pattern-item';
        
        div.innerHTML = '<div class="pattern-emoji"><img src="' + imgPath + '" alt="' + name + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.parentNode.innerHTML=\'' + name + '\'"></div><div class="pattern-label">' + name + '</div>';
        
        addMobileClickSupport(div, function() {
            vibrate();
            addPatternToCanvas(name, themeColor[currentCategory]);
        });
        grid.appendChild(div);
    });
}

function updatePreviewModal() {
    var previewImg = document.getElementById('previewImage');
    var modal = document.getElementById('previewModal');
    
    if (!modal || !modal.classList.contains('active')) {
        return;
    }
    
    if (!previewImg) return;
    
    try {
        previewImg.src = fabricCanvas.toDataURL({ 
            format: 'png', 
            multiplier: 2,
            backgroundColor: '#FFFDF5'
        });
    } catch (e) {
        console.error('updatePreviewModal error:', e);
    }
}

function generatePostcardBackground() {
    var canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    var ctx = canvas.getContext('2d');
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFDF5';
    ctx.beginPath();
    ctx.roundRect(10, 10, 580, 380, 10);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.beginPath();
    ctx.roundRect(30, 30, 540, 340, 6);
    ctx.fill();
    
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(28, 28, 544, 344, 8);
    ctx.stroke();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(30, 30, 540, 340, 6);
    ctx.stroke();
    
    return canvas;
}

function generateToteBackground() {
    var canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 600;
    var ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, 450, 600);
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 8;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(60, 70, 330, 470, 8);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = '#C2B08A';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.roundRect(70, 80, 310, 450, 4);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(60, 70, 330, 470, 8);
    ctx.stroke();
    
    var gradient = ctx.createLinearGradient(140, 25, 140, 70);
    gradient.addColorStop(0, '#E0E0E0');
    gradient.addColorStop(0.5, '#F5F5F5');
    gradient.addColorStop(1, '#D0D0D0');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(140, 70);
    ctx.quadraticCurveTo(160, 25, 225, 25);
    ctx.quadraticCurveTo(290, 25, 310, 70);
    ctx.stroke();
    
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(148, 70);
    ctx.quadraticCurveTo(165, 30, 225, 30);
    ctx.quadraticCurveTo(285, 30, 302, 70);
    ctx.stroke();
    
    return canvas;
}

function openPreviewModal() {
    var previewImg = document.getElementById('previewImage');
    document.getElementById('previewModal').classList.add('active');
    
    fabricCanvas.renderAll();
    
    try {
        previewImg.src = fabricCanvas.toDataURL({ 
            format: 'png', 
            multiplier: 2,
            backgroundColor: '#FFFFFF'
        });
    } catch (e) {
        console.error('openPreviewModal error:', e);
        previewImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="#f5f5f5" width="300" height="200" rx="8"/><text fill="#999" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">预览生成失败</text></svg>';
    }
}

function closePreviewModal() {
    document.getElementById('previewModal').classList.remove('active');
}

function scrollToTop() {
    var mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    vibrate();
}

function showServiceModal() {
    document.getElementById('serviceModal').classList.add('active');
    vibrate();
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
}

function initPresetPhrases() {
    var container = document.getElementById('presetPhrases');
    presetPhrases.forEach(function(phrase) {
        var div = document.createElement('div');
        div.className = 'preset-phrase';
        div.innerText = phrase;
        addMobileClickSupport(div, function() {
            vibrate();
            addUserText(phrase);
        });
        container.appendChild(div);
    });
}

function initEventListeners() {
    addMobileClickSupport(document.getElementById('undoBtn'), undo);
    addMobileClickSupport(document.getElementById('zoomInBtn'), zoomIn);
    addMobileClickSupport(document.getElementById('zoomOutBtn'), zoomOut);
    addMobileClickSupport(document.getElementById('deleteSelectedBtn'), deleteSelected);
    addMobileClickSupport(document.getElementById('orderBtn'), openOrderModal);
    
    document.querySelectorAll('.mockup-type-btn').forEach(function(btn) {
        addMobileClickSupport(btn, function() {
            switchMockupMode(btn.dataset.type);
        });
    });
    
    addMobileClickSupport(document.getElementById('previewThumb'), openPreviewModal);
    addMobileClickSupport(document.getElementById('previewClose'), closePreviewModal);
    addMobileClickSupport(document.getElementById('switchMockupBtn'), function() {
        var newMode = currentMockup === 'postcard' ? 'tote' : 'postcard';
        switchMockupMode(newMode);
        setTimeout(function() {
            updatePreviewModal();
        }, 300);
    });
    
    addMobileClickSupport(document.getElementById('serviceBtn'), showServiceModal);
    addMobileClickSupport(document.getElementById('serviceModalClose'), closeServiceModal);
    
    addMobileClickSupport(document.getElementById('backTopBtn'), scrollToTop);
    
    addMobileClickSupport(document.getElementById('ctxDelete'), function() {
        deleteSelected();
    });
    
    addMobileClickSupport(document.getElementById('ctxCopy'), function() {
        var active = fabricCanvas.getActiveObject();
        if (active) {
            active.clone(function(cloned) {
                cloned.set({
                    left: active.left + 20,
                    top: active.top + 20
                });
                fabricCanvas.add(cloned);
                fabricCanvas.setActiveObject(cloned);
                fabricCanvas.renderAll();
                saveHistory();
                showToast('已复制');
                vibrate();
            });
        }
    });
    
    addMobileClickSupport(document.getElementById('ctxBringFront'), function() {
        var active = fabricCanvas.getActiveObject();
        if (active) {
            fabricCanvas.bringToFront(active);
            fabricCanvas.renderAll();
            saveHistory();
            showToast('已置于顶层');
            vibrate();
        }
    });
    
    addMobileClickSupport(document.getElementById('ctxSendBack'), function() {
        var active = fabricCanvas.getActiveObject();
        if (active) {
            fabricCanvas.sendToBack(active);
            fabricCanvas.renderAll();
            saveHistory();
            showToast('已置于底层');
            vibrate();
        }
    });
    
    document.getElementById('bgColorSelect').addEventListener('change', function(e) {
        fabricCanvas.setBackgroundColor(e.target.value, function() {
            fabricCanvas.renderAll();
            saveHistory();
            autoSaveDraft();
        });
    });
    
    window.addEventListener('resize', function() {
        scheduleUpdateMockup();
    });
}

function init() {
    if (typeof fabric === 'undefined') {
        console.error('Fabric.js 未加载');
        alert('Fabric.js 未加载，请刷新页面');
        return;
    }
    initSupabase();
    buildCategoryTabs();
    renderPatterns();
    initPresetPhrases();
    initFabric(false);
    checkDraft();
    
    setTimeout(function() {
        updateMockup();
    }, 500);
    
    initEventListeners();
    initOrderEventListeners();
}

window.addEventListener('DOMContentLoaded', init);
