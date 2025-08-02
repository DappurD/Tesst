
import { Interactable } from './Interactable';
import type { Game } from '../../game';

export class ShardSynthesizer extends Interactable {
    constructor(x: number, y: number, onInteract: (game: Game) => void) {
        super(x, y, 120, 120, '[E] Access Shard Synthesizer', onInteract);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const time = performance.now() / 1500;

        const glowColor = this.isHighlighted ? '#ffff00' : '#ff00ff';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = this.isHighlighted ? 35 : 25;

        ctx.strokeStyle = `rgba(255, 0, 255, ${0.3 + Math.sin(time*2) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 0, 255, ${0.4 + Math.cos(time*2) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.1);
        ctx.translate(-centerX, -centerY);
        
        ctx.fillStyle = 'rgba(255, 0, 255, 0.6)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y);
        ctx.lineTo(this.x + this.width, centerY);
        ctx.lineTo(centerX, this.y + this.height);
        ctx.lineTo(this.x, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
}
