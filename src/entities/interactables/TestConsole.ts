
import { Interactable } from './Interactable';
import type { Game } from '../../game';

export class TestConsole extends Interactable {
     constructor(x: number, y: number, onInteract: (game: Game) => void) {
        super(x, y, 100, 80, '[E] Access Test Chamber', onInteract);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const color = this.isHighlighted ? '#ffff00' : '#00ffff';
        ctx.strokeStyle = color;
        ctx.fillStyle = '#1a1a3a';
        ctx.shadowColor = color;
        ctx.shadowBlur = this.isHighlighted ? 20 : 10;
        ctx.lineWidth = 3;

        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.isHighlighted ? '#2a2a4a' : '#0a0a2a';
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 40);

        ctx.fillStyle = Math.sin(performance.now() / 200) > 0 ? '#ff4141' : '#8b0000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height - 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
