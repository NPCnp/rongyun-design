class InteractionController {
    constructor(canvasEngine) {
        this.canvasEngine = canvasEngine;
        this.isDragging = false;
        this.isResizing = false;
        this.isPinching = false;
        this.startX = 0;
        this.startY = 0;
        this.currentElement = null;
        this.pinchStartDistance = null;
        this.pinchStartScale = null;
        this.pinchStartRotation = null;
        this.longPressTimer = null;
        this.longPressElement = null;
        this.lastClickTime = 0;
        this.resizeHandle = null;
        this.resizeStartScale = null;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.startElementX = 0;
        this.startElementY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const canvas = this.canvasEngine.canvas;
        
        canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
        canvas.addEventListener('pointerleave', (e) => this.handlePointerUp(e));
        
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        document.addEventListener('click', (e) => {
            if (e.target.id !== 'confirm-delete-btn') {
                this.hideDeleteOverlay();
            }
        });
        
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }
    }

    handlePointerDown(e) {
        const coords = this.canvasEngine.getCanvasCoordinates(e.clientX, e.clientY);
        const element = this.canvasEngine.getElementAt(coords.x, coords.y);
        const currentTime = Date.now();
        
        if (element) {
            if (currentTime - this.lastClickTime < 300) {
                this.canvasEngine.removeElement(element.id);
                if (typeof app !== 'undefined' && app.showToast) {
                    app.showToast('元素已删除', 'success');
                }
                return;
            }
            
            this.lastClickTime = currentTime;
            this.currentElement = element;
            this.canvasEngine.selectElement(element.id);
            
            const handle = this.getResizeHandleAt(coords.x, coords.y, element);
            if (handle) {
                this.isResizing = true;
                this.resizeHandle = handle;
                this.resizeStartScale = element.scale || 1;
                this.lastPointerX = coords.x;
                this.lastPointerY = coords.y;
                this.startElementX = element.x;
                this.startElementY = element.y;
                this.startWidth = (element.width || 100);
                this.startHeight = (element.height || 50);
                this.cancelLongPress();
                return;
            }
            
            this.isDragging = true;
            this.startX = coords.x;
            this.startY = coords.y;
            this.lastPointerX = coords.x;
            this.lastPointerY = coords.y;
            
            this.startLongPress(element);
        } else {
            this.canvasEngine.deselectElement();
            this.currentElement = null;
            this.lastClickTime = 0;
        }
    }

    getResizeHandleAt(x, y, element) {
        const targetElement = element || this.canvasEngine.selectedElement;
        if (!targetElement) return null;
        
        const scale = targetElement.scale || 1;
        const width = (targetElement.width || 100) * scale;
        const height = (targetElement.height || 50) * scale;
        const handleRadius = 30;
        
        const handles = [
            { name: 'top-left', x: targetElement.x - width/2, y: targetElement.y - height/2 },
            { name: 'top-right', x: targetElement.x + width/2, y: targetElement.y - height/2 },
            { name: 'bottom-left', x: targetElement.x - width/2, y: targetElement.y + height/2 },
            { name: 'bottom-right', x: targetElement.x + width/2, y: targetElement.y + height/2 }
        ];
        
        for (const handle of handles) {
            const dx = x - handle.x;
            const dy = y - handle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < handleRadius) {
                console.log('角点命中:', handle.name, '点击位置:', x, y, '角点位置:', handle.x, handle.y, '距离:', distance);
                return handle.name;
            }
        }
        
        return null;
    }

    handlePointerMove(e) {
        const canvas = this.canvasEngine.canvas;
        const coords = this.canvasEngine.getCanvasCoordinates(e.clientX, e.clientY);
        
        if (this.isResizing && this.currentElement) {
            const dx = coords.x - this.lastPointerX;
            const dy = coords.y - this.lastPointerY;
            
            const moveDistance = Math.sqrt(dx * dx + dy * dy);
            const scaleChange = moveDistance * 0.008;
            
            let newScale;
            if (this.resizeHandle === 'bottom-right' || this.resizeHandle === 'top-right') {
                newScale = this.resizeStartScale + scaleChange;
            } else {
                newScale = this.resizeStartScale - scaleChange;
            }
            
            newScale = Math.max(0.3, Math.min(3, newScale));
            
            const scaleRatio = newScale / this.resizeStartScale;
            let newX = this.startElementX;
            let newY = this.startElementY;
            
            if (this.resizeHandle === 'top-left') {
                newX = this.startElementX + (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                newY = this.startElementY + (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
            } else if (this.resizeHandle === 'top-right') {
                newX = this.startElementX - (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                newY = this.startElementY + (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
            } else if (this.resizeHandle === 'bottom-left') {
                newX = this.startElementX + (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                newY = this.startElementY - (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
            } else if (this.resizeHandle === 'bottom-right') {
                newX = this.startElementX - (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                newY = this.startElementY - (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
            }
            
            this.canvasEngine.updateElement(this.currentElement.id, {
                scale: newScale,
                x: newX,
                y: newY
            });
            
            this.currentElement.scale = newScale;
            this.currentElement.x = newX;
            this.currentElement.y = newY;
            this.lastPointerX = coords.x;
            this.lastPointerY = coords.y;
            canvas.style.cursor = 'se-resize';
            return;
        }
        
        if (this.isDragging && this.currentElement) {
            this.cancelLongPress();
            
            const dx = coords.x - this.startX;
            const dy = coords.y - this.startY;
            
            const newX = this.currentElement.x + dx;
            const newY = this.currentElement.y + dy;
            
            const boundedCoords = this.canvasEngine.constrainToBounds(newX, newY, this.currentElement);
            
            this.canvasEngine.updateElement(this.currentElement.id, {
                x: boundedCoords.x,
                y: boundedCoords.y
            });
            
            this.currentElement.x = boundedCoords.x;
            this.currentElement.y = boundedCoords.y;
            
            this.startX = coords.x;
            this.startY = coords.y;
            canvas.style.cursor = 'grabbing';
            return;
        }
        
        const handle = this.getResizeHandleAt(coords.x, coords.y);
        if (handle) {
            canvas.style.cursor = 'se-resize';
        } else if (this.canvasEngine.getElementAt(coords.x, coords.y)) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }

    handlePointerUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.cancelLongPress();
    }

    handleTouchStart(e) {
        if (e.touches.length === 2) {
            this.handlePinchStart(e);
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const coords = this.canvasEngine.getCanvasCoordinates(touch.clientX, touch.clientY);
            const element = this.canvasEngine.getElementAt(coords.x, coords.y);
            const currentTime = Date.now();
            
            if (element) {
                if (currentTime - this.lastClickTime < 300) {
                    this.canvasEngine.removeElement(element.id);
                    if (typeof app !== 'undefined' && app.showToast) {
                        app.showToast('元素已删除', 'success');
                    }
                    return;
                }
                
                this.lastClickTime = currentTime;
                this.currentElement = element;
                this.canvasEngine.selectElement(element.id);
                
                const handle = this.getResizeHandleAt(coords.x, coords.y, element);
                if (handle) {
                    this.isResizing = true;
                    this.resizeHandle = handle;
                    this.resizeStartScale = element.scale || 1;
                    this.lastPointerX = coords.x;
                    this.lastPointerY = coords.y;
                    this.startElementX = element.x;
                    this.startElementY = element.y;
                    this.startWidth = (element.width || 100);
                    this.startHeight = (element.height || 50);
                    this.cancelLongPress();
                    return;
                }
                
                this.isDragging = true;
                this.startX = coords.x;
                this.startY = coords.y;
                this.lastPointerX = coords.x;
                this.lastPointerY = coords.y;
                
                this.startLongPress(element);
            } else {
                this.canvasEngine.deselectElement();
                this.currentElement = null;
                this.lastClickTime = 0;
            }
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 2 && this.currentElement) {
            this.cancelLongPress();
            this.handlePinchMove(e);
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const coords = this.canvasEngine.getCanvasCoordinates(touch.clientX, touch.clientY);
            
            if (this.isResizing && this.currentElement) {
                const dx = coords.x - this.lastPointerX;
                const dy = coords.y - this.lastPointerY;
                
                const moveDistance = Math.sqrt(dx * dx + dy * dy);
                const scaleChange = moveDistance * 0.008;
                
                let newScale;
                if (this.resizeHandle === 'bottom-right' || this.resizeHandle === 'top-right') {
                    newScale = this.resizeStartScale + scaleChange;
                } else {
                    newScale = this.resizeStartScale - scaleChange;
                }
                
                newScale = Math.max(0.3, Math.min(3, newScale));
                
                const scaleRatio = newScale / this.resizeStartScale;
                let newX = this.startElementX;
                let newY = this.startElementY;
                
                if (this.resizeHandle === 'top-left') {
                    newX = this.startElementX + (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                    newY = this.startElementY + (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
                } else if (this.resizeHandle === 'top-right') {
                    newX = this.startElementX - (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                    newY = this.startElementY + (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
                } else if (this.resizeHandle === 'bottom-left') {
                    newX = this.startElementX + (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                    newY = this.startElementY - (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
                } else if (this.resizeHandle === 'bottom-right') {
                    newX = this.startElementX - (this.startWidth * this.resizeStartScale - this.startWidth * newScale) / 2;
                    newY = this.startElementY - (this.startHeight * this.resizeStartScale - this.startHeight * newScale) / 2;
                }
                
                this.canvasEngine.updateElement(this.currentElement.id, {
                    scale: newScale,
                    x: newX,
                    y: newY
                });
                
                this.currentElement.scale = newScale;
                this.currentElement.x = newX;
                this.currentElement.y = newY;
                this.lastPointerX = coords.x;
                this.lastPointerY = coords.y;
                return;
            }
            
            if (this.isDragging && this.currentElement) {
                this.cancelLongPress();
                
                const dx = coords.x - this.startX;
                const dy = coords.y - this.startY;
                
                const newX = this.currentElement.x + dx;
                const newY = this.currentElement.y + dy;
                
                const boundedCoords = this.canvasEngine.constrainToBounds(newX, newY, this.currentElement);
                
                this.canvasEngine.updateElement(this.currentElement.id, {
                    x: boundedCoords.x,
                    y: boundedCoords.y
                });
                
                this.currentElement.x = boundedCoords.x;
                this.currentElement.y = boundedCoords.y;
                
                this.startX = coords.x;
                this.startY = coords.y;
            }
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length < 2) {
            this.handlePinchEnd();
        }
        
        if (e.touches.length === 0) {
            this.isDragging = false;
            this.isResizing = false;
            this.resizeHandle = null;
            this.cancelLongPress();
        }
    }

    handlePinchStart(e) {
        if (!this.canvasEngine.selectedElement) {
            return;
        }
        
        this.isPinching = true;
        this.pinchStartDistance = this.getDistance(e.touches[0], e.touches[1]);
        this.pinchStartScale = this.canvasEngine.selectedElement.scale || 1;
        this.pinchStartRotation = this.canvasEngine.selectedElement.rotation || 0;
        this.pinchStartAngle = this.getAngle(e.touches[0], e.touches[1]);
    }

    handlePinchMove(e) {
        if (!this.canvasEngine.selectedElement || !this.pinchStartDistance) {
            return;
        }
        
        e.preventDefault();
        
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const currentAngle = this.getAngle(e.touches[0], e.touches[1]);
        
        const scaleFactor = currentDistance / this.pinchStartDistance;
        const rotationDelta = currentAngle - this.pinchStartAngle;
        
        const newScale = Math.max(0.3, Math.min(3, this.pinchStartScale * scaleFactor));
        const newRotation = this.pinchStartRotation + rotationDelta;
        
        this.canvasEngine.updateElement(this.canvasEngine.selectedElement.id, {
            scale: newScale,
            rotation: newRotation
        });
        
        this.canvasEngine.selectedElement.scale = newScale;
        this.canvasEngine.selectedElement.rotation = newRotation;
    }

    handlePinchEnd() {
        this.isPinching = false;
        this.pinchStartDistance = null;
        this.pinchStartScale = null;
        this.pinchStartRotation = null;
        this.pinchStartAngle = null;
    }

    startLongPress(element) {
        this.longPressElement = element;
        this.longPressTimer = setTimeout(() => {
            this.showDeleteOverlay();
        }, 2000);
    }

    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.longPressElement = null;
    }

    showDeleteOverlay() {
        const overlay = document.getElementById('delete-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideDeleteOverlay() {
        const overlay = document.getElementById('delete-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    confirmDelete() {
        if (this.longPressElement) {
            this.canvasEngine.removeElement(this.longPressElement.id);
            
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('元素已删除', 'success');
            }
        }
        this.hideDeleteOverlay();
        this.longPressElement = null;
    }

    handleKeyDown(e) {
        if (!this.canvasEngine.selectedElement) {
            return;
        }
        
        const element = this.canvasEngine.selectedElement;
        
        switch(e.key) {
            case 'Delete':
            case 'Backspace':
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    this.canvasEngine.removeElement(element.id);
                    if (typeof app !== 'undefined' && app.showToast) {
                        app.showToast('元素已删除', 'success');
                    }
                }
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowKey(e.key, element);
                e.preventDefault();
                break;
                
            case 'r':
            case 'R':
                const newRotation = (element.rotation || 0) + 15;
                this.canvasEngine.updateElement(element.id, {
                    rotation: newRotation
                });
                element.rotation = newRotation;
                break;
        }
    }

    handleArrowKey(key, element) {
        let dx = 0;
        let dy = 0;
        
        switch(key) {
            case 'ArrowUp':
                dy = -5;
                break;
            case 'ArrowDown':
                dy = 5;
                break;
            case 'ArrowLeft':
                dx = -5;
                break;
            case 'ArrowRight':
                dx = 5;
                break;
        }
        
        const newX = element.x + dx;
        const newY = element.y + dy;
        
        const boundedCoords = this.canvasEngine.constrainToBounds(newX, newY, element);
        
        this.canvasEngine.updateElement(element.id, {
            x: boundedCoords.x,
            y: boundedCoords.y
        });
        
        element.x = boundedCoords.x;
        element.y = boundedCoords.y;
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getAngle(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
}

let interactionController;
