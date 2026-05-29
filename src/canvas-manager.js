var fabricCanvas, currentCategory = "三坊七巷", currentMockup = 'postcard';
var historyStack = [], historyIndex = -1;
var updateMockupTimeout = null;
var canvasResizeObserver = null;

function addMobileClickSupport(element, callback) {
    var isTouch = false;
    element.addEventListener('touchstart', function(e) {
        isTouch = true;
        e.preventDefault();
    });
    element.addEventListener('touchend', function(e) {
        if (isTouch) {
            callback(e);
            isTouch = false;
        }
    });
    element.addEventListener('click', callback);
}

function resizeCanvasForMobile() {
    if (!fabricCanvas) return;
    try {
        var wrapper = document.querySelector('.canvas-wrapper');
        if (!wrapper) return;
        var wrapperWidth = wrapper.clientWidth;
        var newSize = canvasSizes[currentMockup];
        var scale = Math.min(wrapperWidth / newSize.width, 1);
        
        fabricCanvas.setWidth(newSize.width * scale);
        fabricCanvas.setHeight(newSize.height * scale);
        fabricCanvas.setZoom(scale);
        fabricCanvas.renderAll();
    } catch (e) {
        console.warn('画布响应式调整失败:', e);
    }
}

window.addEventListener('load', resizeCanvasForMobile);
window.addEventListener('resize', resizeCanvasForMobile);
window.addEventListener('orientationchange', resizeCanvasForMobile);

function initFabric(keepContent, oldCanvasJson) {
    keepContent = keepContent || false;
    oldCanvasJson = oldCanvasJson || null;
    
    var canvasEl = document.getElementById('designCanvas');
    var newSize = canvasSizes[currentMockup];
    canvasEl.width = newSize.width;
    canvasEl.height = newSize.height;
    
    if (fabricCanvas) fabricCanvas.dispose();
    
    fabricCanvas = new fabric.Canvas('designCanvas', {
        width: newSize.width,
        height: newSize.height,
        preserveObjectStacking: true,
        selection: true,
        fireRightClick: true,
        enableRetinaScaling: true,
        allowTouchScrolling: false,
        enableTouchScrolling: false,
        uniScaleTransform: true,
        centeredScaling: true,
        touchEnabled: true,
        targetFindTolerance: 30,
        selectionFullyContained: false,
        hoverCursor: 'pointer',
        movingCursor: 'grabbing',
        freeDrawingCursor: 'crosshair',
        renderOnAddRemove: true
    });
    
    fabricCanvas.selectionBorderColor = '#B84A3C';
    fabricCanvas.selectionColor = 'rgba(184, 74, 60, 0.2)';
    fabricCanvas.selectionLineWidth = 2;
    fabricCanvas.objectCaching = true;
    
    fabricCanvas.setHeight(newSize.height);
    fabricCanvas.setWidth(newSize.width);
    
    fabric.Object.prototype.set({
        cornerSize: 24,
        cornerTouchSize: 48,
        cornerColor: '#B84A3C',
        cornerStrokeColor: '#fff',
        borderColor: '#C9A87C',
        borderScaleFactor: 3,
        transparentCorners: false,
        cornerStyle: 'rect',
        hasBorders: true,
        controlsAboveOverlay: true,
        lockUniScaling: false,
        selectable: true,
        hasControls: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false
    });
    
    var bgColor = document.getElementById('bgColorSelect').value;
    fabricCanvas.setBackgroundColor(bgColor, function() {
        fabricCanvas.renderAll();
    });
    
    fabricCanvas.on('object:modified', function(e) {
        validateObjectSize(e.target);
        saveHistory();
        scheduleUpdateMockup();
        autoSaveDraft();
    });
    
    fabricCanvas.on('object:moving', function(e) {
        scheduleUpdateMockup();
    });
    
    fabricCanvas.on('object:scaling', function(e) {
        validateObjectSize(e.target);
        scheduleUpdateMockup();
    });
    
    fabricCanvas.on('object:added', function() {
        scheduleUpdateMockup();
        autoSaveDraft();
    });
    
    fabricCanvas.on('object:removed', function() {
        scheduleUpdateMockup();
        autoSaveDraft();
    });
    
    fabricCanvas.on('selection:created', updateDeleteBtn);
    fabricCanvas.on('selection:updated', updateDeleteBtn);
    fabricCanvas.on('selection:cleared', updateDeleteBtn);
    fabricCanvas.on('text:dblclick', handleTextDoubleClick);
    
    if (keepContent && oldCanvasJson) {
        fabricCanvas.loadFromJSON(oldCanvasJson, function() {
            fabricCanvas.renderAll();
            saveHistory();
            scheduleUpdateMockup();
        });
    } else {
        var defaultText = currentMockup === 'postcard' ? '福州·三坊七巷' : '榕韵·帆布袋';
        var welcome = new fabric.Text(defaultText, {
            left: 20,
            top: 20,
            fontSize: 13,
            fontFamily: 'Noto Serif SC',
            fill: '#b45f2b',
            originX: 'left',
            originY: 'top',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true
        });
        fabricCanvas.add(welcome);
        fabricCanvas.renderAll();
        saveHistory();
    }
    updateDeleteBtn();
}

function scheduleUpdateMockup() {
    if (updateMockupTimeout) clearTimeout(updateMockupTimeout);
    updateMockupTimeout = setTimeout(function() {
        updateMockup();
    }, 100);
}

function validateObjectSize(obj) {
    if (!obj) return;
    
    var canvasWidth = fabricCanvas.width;
    var canvasHeight = fabricCanvas.height;
    
    if (obj.type === 'text' || obj.type === 'i-text') {
        var minFontSize = 12;
        var maxFontSize = canvasWidth * 0.5;
        var currentFontSize = obj.fontSize * (obj.scaleX || 1);
        
        if (currentFontSize < minFontSize) {
            var scale = minFontSize / obj.fontSize;
            obj.set('scaleX', scale);
            obj.set('scaleY', scale);
        } else if (currentFontSize > maxFontSize) {
            var scale = maxFontSize / obj.fontSize;
            obj.set('scaleX', scale);
            obj.set('scaleY', scale);
        }
    } else {
        var minSize = 20;
        var maxAreaRatio = 0.6;
        var maxArea = canvasWidth * canvasHeight * maxAreaRatio;
        
        var currentWidth = obj.width * (obj.scaleX || 1);
        var currentHeight = obj.height * (obj.scaleY || 1);
        var currentArea = currentWidth * currentHeight;
        
        if (currentWidth < minSize || currentHeight < minSize) {
            var scaleX = Math.max(minSize / obj.width, (obj.scaleX || 1));
            var scaleY = Math.max(minSize / obj.height, (obj.scaleY || 1));
            var scale = Math.max(scaleX, scaleY);
            obj.set('scaleX', scale);
            obj.set('scaleY', scale);
        } else if (currentArea > maxArea) {
            var scale = Math.sqrt(maxArea / currentArea);
            obj.set('scaleX', (obj.scaleX || 1) * scale);
            obj.set('scaleY', (obj.scaleY || 1) * scale);
        }
    }
    
    obj.setCoords();
}

function handleTextDoubleClick(e) {
    var textObj = e.target;
    if (!textObj || (textObj.type !== 'text' && textObj.type !== 'i-text')) return;
    
    var modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 3000; padding: 20px; box-sizing: border-box;';
    
    var input = document.createElement('textarea');
    input.value = textObj.text;
    input.style.cssText = 'width: 100%; max-width: 400px; height: 120px; padding: 16px; font-size: 18px; font-family: Noto Serif SC, serif; border: none; border-radius: 16px; resize: none; margin-bottom: 16px;';
    
    var btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '12px';
    
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = 'padding: 12px 24px; border: none; border-radius: 40px; font-size: 1rem; background: #E8D5C4; color: #2C2C2C;';
    
    var okBtn = document.createElement('button');
    okBtn.textContent = '确定';
    okBtn.style.cssText = 'padding: 12px 24px; border: none; border-radius: 40px; font-size: 1rem; background: #B84A3C; color: white;';
    
    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(okBtn);
    modal.appendChild(input);
    modal.appendChild(btnContainer);
    
    var closeModal = function() {
        document.body.removeChild(modal);
    };
    
    cancelBtn.addEventListener('click', closeModal);
    
    okBtn.addEventListener('click', function() {
        var newText = input.value.trim();
        if (newText) {
            textObj.set('text', newText);
            fabricCanvas.renderAll();
            saveHistory();
            showToast('文字已更新');
        }
        closeModal();
    });
    
    document.body.appendChild(modal);
    input.focus();
}

function switchMockupMode(mode) {
    if (mode === currentMockup) return;
    vibrate();
    var oldJson = JSON.stringify(fabricCanvas.toJSON());
    var oldSize = canvasSizes[currentMockup];
    currentMockup = mode;
    var newSize = canvasSizes[currentMockup];
    
    var parsedJson = JSON.parse(oldJson);
    var objects = parsedJson.objects || [];
    
    objects.forEach(function(obj) {
        var oldLeft = obj.left || 0;
        var oldTop = obj.top || 0;
        var relPosX = oldLeft / oldSize.width;
        var relPosY = oldTop / oldSize.height;
        obj.left = relPosX * newSize.width;
        obj.top = relPosY * newSize.height;
        obj.scaleX = obj.scaleX || 1;
        obj.scaleY = obj.scaleY || 1;
    });
    
    var newJson = JSON.stringify(parsedJson);
    initFabric(true, newJson);
    
    document.querySelectorAll('.mockup-type-btn').forEach(function(t) {
        t.classList.remove('active');
    });
    document.querySelector('.mockup-type-btn[data-type="' + mode + '"]').classList.add('active');
    showToast('已切换到' + (mode === 'postcard' ? '明信片' : '帆布袋') + '模式');
    
    setTimeout(function() {
        updateMockup();
    }, 100);
}

function updateDeleteBtn() {
    document.getElementById('deleteSelectedBtn').disabled = !fabricCanvas.getActiveObject();
}

function deleteSelected() {
    var active = fabricCanvas.getActiveObject();
    if (active) {
        fabricCanvas.remove(active);
        fabricCanvas.renderAll();
        saveHistory();
        showToast('已删除');
        vibrate();
        updateMockup();
    }
}

function saveHistory() {
    var json = JSON.stringify(fabricCanvas.toJSON());
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(json);
    historyIndex++;
    
    if (historyStack.length > MAX_HISTORY_STEPS) {
        historyStack.shift();
        historyIndex--;
    }
    
    updateUndoRedo();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        fabricCanvas.loadFromJSON(historyStack[historyIndex], function() {
            fabricCanvas.renderAll();
            updateMockup();
        });
        updateUndoRedo();
        showToast('撤销');
        vibrate();
    }
}

function zoomIn() {
    var obj = fabricCanvas.getActiveObject();
    if (!obj) {
        showToast('请先选中一个元素');
        return;
    }
    var newScale = (obj.scaleX || 1) + 0.05;
    newScale = Math.min(newScale, 3.0);
    obj.set({ scaleX: newScale, scaleY: newScale });
    fabricCanvas.renderAll();
    saveHistory();
    updateMockup();
    vibrate();
}

function zoomOut() {
    var obj = fabricCanvas.getActiveObject();
    if (!obj) {
        showToast('请先选中一个元素');
        return;
    }
    var newScale = (obj.scaleX || 1) - 0.05;
    obj.set({ scaleX: newScale, scaleY: newScale });
    fabricCanvas.renderAll();
    saveHistory();
    updateMockup();
    vibrate();
}

function updateUndoRedo() {
    document.getElementById('undoBtn').disabled = historyIndex <= 0;
}

function updateMockup() {
    var thumbImg = document.getElementById('previewThumbImg');
    if (!thumbImg) return;
    
    try {
        var designURL = fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
        thumbImg.src = designURL;
    } catch (e) {
        console.error('updateMockup error:', e);
        thumbImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="#f5f5f5" width="60" height="60" rx="8"/><text fill="#999" font-family="sans-serif" font-size="10" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">预览</text></svg>';
    }
}

function addUserText(customText) {
    console.log('addUserText called', customText);
    
    if (!fabricCanvas) {
        console.error('fabricCanvas is null or undefined');
        showToast('画布未初始化');
        return;
    }
    
    var content = customText || document.getElementById('userTextInput').value.trim() || '福州·有福';
    console.log('Adding text content:', content);
    
    var fontFamily = document.getElementById('fontFamilySelect').value;
    var fontSize = parseInt(document.getElementById('fontSizeSelect').value);
    var color = document.getElementById('textColorPicker').value;
    var centerX = fabricCanvas.width / 2;
    var centerY = fabricCanvas.height / 2;
    
    try {
        var obj = new fabric.Text(content, {
            left: centerX,
            top: centerY,
            fontSize: fontSize,
            fontFamily: fontFamily,
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
        showToast('已添加文字: ' + content);
        vibrate();
        updateMockup();
        
        if (!customText) {
            document.getElementById('userTextInput').value = '';
        }
        
        console.log('Text added successfully');
    } catch (e) {
        console.error('Error adding text:', e);
        showToast('添加文字失败: ' + e.message);
    }
}

function getFileExtension(name) {
    var jpgList = ['夜景', '流苏', '红墙'];
    if (jpgList.indexOf(name) >= 0) {
        return '.jpg';
    }
    return '.png';
}

function addPatternToCanvas(name, color) {
    var centerX = fabricCanvas.width / 2;
    var centerY = fabricCanvas.height / 2;
    var label = name;
    
    var imgPath = (window.imageData && window.imageData[name]) || ('图画/' + name + getFileExtension(name));
    
    fabric.Image.fromURL(imgPath, function(img) {
        if (!img || img.width === 0 || img.height === 0) {
            console.error('图片加载失败或尺寸无效:', name);
            showToast('图片加载失败');
            return;
        }
        
        console.log('图片加载成功:', name, '尺寸:', img.width + 'x' + img.height);
        
        var maxWidth = fabricCanvas.width * 0.5;
        var maxHeight = fabricCanvas.height * 0.5;
        var scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        
        console.log('缩放比例:', scale, '画布尺寸:', fabricCanvas.width + 'x' + fabricCanvas.height);
        
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
            cornerTouchSize: 48,
            visible: true,
            opacity: 1
        });
        
        img.scale(scale);
        
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.bringToFront(img);
        
        console.log('对象已添加，位置:', img.left, img.top, '缩放:', img.scaleX);
        console.log('画布对象数量:', fabricCanvas.getObjects().length);
        
        fabricCanvas.renderAll();
        saveHistory();
        showToast('已添加: ' + label);
        vibrate();
        
        setTimeout(function() {
            updateMockup();
        }, 100);
    }, { crossOrigin: 'Anonymous', onError: function(err) {
        console.error('图片加载错误:', name, err);
        var obj = new fabric.Text(label, {
            left: centerX,
            top: centerY,
            fontSize: 24,
            fontFamily: 'Noto Serif SC',
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
        updateMockup();
    }});
}

function autoSaveDraft() {
    try {
        var draft = {
            canvas: fabricCanvas.toJSON(),
            timestamp: Date.now()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.warn('自动保存失败:', e.message);
    }
}

function checkDraft() {
    var draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
        var data = JSON.parse(draft);
        var hours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        
        if (hours < 24 && confirm('检测到未完成的设计，是否恢复？')) {
            initFabric(true, JSON.stringify(data.canvas));
            showToast('已恢复上次设计');
        }
    }
}
