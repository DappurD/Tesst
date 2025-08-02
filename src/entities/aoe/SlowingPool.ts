import { Entity } from '../Entity';

export class SlowingPool extends Entity {
    slowFactor: number;
    lifespan: number;
    radius: number;

    constructor(x: number, y: number, radius: number, slowFactor: number, lifespan: number) {
        super(x - radius, y - radius, radius * 2, radius * 2, 'aoeZone');
        this.radius = radius;
        this.slowFactor = slowFactor;
        this.lifespan = lifespan;
        this.invincible = true;
    }

    update(dt: number) {
        this.lifespan -= dt;
        if (this.lifespan <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(100, 100, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}