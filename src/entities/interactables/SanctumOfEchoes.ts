
import { Interactable } from './Interactable';
import type { Game } from '../../game';

export class SanctumOfEchoes extends Interactable {
    constructor(x: number, y: number, onInteract: (game: Game) => void) {
        super(x, y, 100, 150, '[E] Consult the Sanctum', onInteract);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const time = performance.now() / 1000;

        const glowColor = this.isHighlighted ? '#ffff00' : '#00ffff';
        const glowRadius = this.isHighlighted ? 30 : 20;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowRadius;
        
        ctx.translate(centerX, centerY + Math.sin(time) * 10);
        ctx.rotate(time * 0.2);

        ctx.fillStyle = `rgba(0, 255, 255, 0.7)`;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2.5);
        ctx.lineTo(this.width / 3, 0);
        ctx.lineTo(0, this.height / 2.5);
        ctx.lineTo(-this.width / 3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.rotate(time * -0.5);
        ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
        for(let i=0; i<3; i++) {
            ctx.rotate(Math.PI * 2 / 3);
            ctx.fillRect(-5, -this.height / 4, 10, 20);
        }

        ctx.restore();
    }
}
