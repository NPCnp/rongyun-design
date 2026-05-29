let previewZoom = 1;
let previewImageSrc = "";

let history = [];
let historyIndex = -1;
let historyLimit = 50;
let isUndoRedo = false;

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initPatternManager();
    initTextEditor();
    setupMockupToggle();
    setupKeyboardDelete();
    setupHistory();
    
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const resetBtn = document.getElementById('resetCanvasBtn');
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    const exportBtn = document.getElementById('exportImageBtn');
    const orderBtn = document.getElementById('orderBtn');
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const previewClose = document.getElementById('previewClose');
    const previewImage = document.getElementById('previewImage');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const switchMockup = document.getElementById('switchMockup');
    
    if (undoBtn) {
        undoBtn.addEventListener('click', undo);
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', redo);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (typeof resetCanvas === 'function') {
                resetCanvas();
            }
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (typeof deleteSelected === 'function') {
                deleteSelected();
            }
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof exportImage === 'function') {
                exportImage();
            }
        });
    }
    
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            if (typeof confirmOrder === 'function') {
                confirmOrder();
            }
        });
    }
    
    // 预览功能
    if (previewBtn && previewModal && previewImage) {
        previewBtn.addEventListener('click', () => {
            const mockImg = document.getElementById('mockupImage');
            if (mockImg && mockImg.src) {
                previewImageSrc = mockImg.src;
                previewImage.src = previewImageSrc;
                previewZoom = 1;
                updatePreviewSize();
                previewModal.classList.add('active');
            }
        });
    }
    
    if (previewClose && previewModal) {
        previewClose.addEventListener('click', () => {
            previewModal.classList.remove('active');
        });
    }
    
    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.classList.remove('active');
            }
        });
    }
    
    if (zoomIn && previewImage) {
        zoomIn.addEventListener('click', () => {
            previewZoom = Math.min(previewZoom + 0.2, 3);
            updatePreviewSize();
        });
    }
    
    if (zoomOut && previewImage) {
        zoomOut.addEventListener('click', () => {
            previewZoom = Math.max(previewZoom - 0.2, 0.5);
            updatePreviewSize();
        });
    }
    
    if (switchMockup) {
        switchMockup.addEventListener('click', () => {
            toggleMockupType();
        });
    }
    
    updateHistoryButtons();
});

function setupHistory() {
    setTimeout(() => saveHistory(), 100);
}

function saveHistory() {
    if (typeof elements === 'undefined') return;
    
    isUndoRedo = true;
    const json = JSON.stringify(elements);
    
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    history.push(json);
    
    if (history.length > historyLimit) {
        history.shift();
    } else {
        historyIndex++;
    }
    
    updateHistoryButtons();
    isUndoRedo = false;
}

function undo() {
    if (typeof elements === 'undefined' || historyIndex <= 0) return;
    
    isUndoRedo = true;
    historyIndex--;
    elements = JSON.parse(history[historyIndex]);
    selectedElement = null;
    renderCanvas();
    if (typeof updateMockup === 'function') updateMockup();
    updateHistoryButtons();
    isUndoRedo = false;
}

function redo() {
    if (typeof elements === 'undefined' || historyIndex >= history.length - 1) return;
    
    isUndoRedo = true;
    historyIndex++;
    elements = JSON.parse(history[historyIndex]);
    selectedElement = null;
    renderCanvas();
    if (typeof updateMockup === 'function') updateMockup();
    updateHistoryButtons();
    isUndoRedo = false;
}

function updateHistoryButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = historyIndex <= 0;
        undoBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
    }
    
    if (redoBtn) {
        redoBtn.disabled = historyIndex >= history.length - 1;
        redoBtn.style.opacity = historyIndex >= history.length - 1 ? '0.5' : '1';
    }
}

function toggleMockupType() {
    if (typeof currentMockup !== 'undefined') {
        currentMockup = currentMockup === 'postcard' ? 'tote' : 'postcard';
        updateMockupUI();
        if (typeof updateMockup === 'function') {
            updateMockup();
        }
        setTimeout(() => {
            const mockImg = document.getElementById('mockupImage');
            const previewImage = document.getElementById('previewImage');
            if (mockImg && previewImage && mockImg.src) {
                previewImage.src = mockImg.src;
            }
        }, 50);
    }
}

function updateMockupUI() {
    const mockupTypes = document.querySelectorAll('.mockup-type');
    if (mockupTypes) {
        mockupTypes.forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('data-type') === currentMockup) {
                el.classList.add('active');
            }
        });
    }
}

function updatePreviewSize() {
    const previewImage = document.getElementById('previewImage');
    if (previewImage) {
        previewImage.style.transform = `scale(${previewZoom})`;
        previewImage.style.transition = 'transform 0.2s ease';
    }
}

window.saveHistory = saveHistory;
