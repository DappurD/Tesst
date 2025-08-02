import { Entity } from '../Entity';

export class FloatingText extends Entity {
    lifespan: number;
    initialLifespan: number;
    text: string;
    color: string;
    fontSize: number;

    constructor(x: number, y: number, text: string, color = '#ffffff', size = 18) {
        super(x, y, 0, 0, 'floatingText');
        this.text = text;
        this.color = color;
        this.fontSize = size;
        this.vy = -50;
        this.lifespan = 1.0;
        if(this.type === 'boss') this.lifespan = 3.0;
        this.initialLifespan = this.lifespan;
        this.invincible = true;
    }

    update(dt: number) {
        super.update(dt);
        this.lifespan -= dt;
        if (this.lifespan <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const alpha = Math.max(0, this.lifespan / this.initialLifespan);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Orbitron`;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
