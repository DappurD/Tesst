
import { Interactable } from './Interactable';
import type { Game } from '../../game';
import { rand } from '../../utils';

export class VoidPortal extends Interactable {
    constructor(x: number, y: number, onInteract: (game: Game) => void) {
        super(x, y, 150, 200, '[E] Enter the Void', onInteract);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();

        const glowColor = this.isHighlighted ? '#ffff00' : '#ff00ff';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 30;

        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const time = performance.now() / 2000;
            const radiusX = (this.width / 2) * (0.6 + Math.sin(time + i) * 0.1);
            const radiusY = (this.height / 2) * (0.9 + Math.cos(time + i) * 0.1);
            const rotation = time * (i % 2 === 0 ? 1 : -1) + i;
            ctx.ellipse(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(255, 0, 255, ${rand(0.2, 0.7)})`;
            ctx.lineWidth = rand(1, 4);
            ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.width / 3, this.height / 2.2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(10, 0, 20, 0.9)';
        ctx.fill();
        
        ctx.restore();
    }
}
