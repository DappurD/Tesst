import { Entity } from '../Entity';

export class Shockwave extends Entity {
    lifespan: number;
    maxRadius: number;
    currentRadius: number;
    color: string;

    constructor(x: number, y: number, color = '#ffffff', maxRadius = 300, lifespan = 0.5) {
        super(x, y, 0, 0, 'particle');
        this.lifespan = lifespan;
        this.maxRadius = maxRadius;
        this.currentRadius = 0;
        this.color = color;
    }

    update(dt: number) {
        this.lifespan -= dt;
        if (this.lifespan <= 0) this.shouldBeRemoved = true;
        const progress = 1 - (this.lifespan / (this.lifespan + dt));
        this.currentRadius = this.maxRadius * (1 - (this.lifespan / (this.lifespan+dt))**2);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.lifespan / 0.5);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1 + (4 * alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}
