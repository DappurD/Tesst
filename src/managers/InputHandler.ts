
export class InputHandler {
    keys: Set<string>;
    keysPressed: Set<string>;
    mouseX: number;
    mouseY: number;
    isMouseDown: boolean;

    constructor() {
        this.keys = new Set();
        this.keysPressed = new Set();
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        
        const gameKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyQ', 'KeyE']);

        window.addEventListener('keydown', (e) => {
            if (gameKeys.has(e.code)) {
                e.preventDefault();
            }
            
            if (!this.keys.has(e.code)) {
                this.keysPressed.add(e.code);
            }
            this.keys.add(e.code);
        });
        window.addEventListener('keyup', (e) => {
            if (gameKeys.has(e.code)) {
                e.preventDefault();
            }
            this.keys.delete(e.code);
        });
        
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button === 0) this.isMouseDown = true;
        });
        
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.isMouseDown = false;
        });
    }
    
    clearPressedKeys() {
        this.keysPressed.clear();
    }
}