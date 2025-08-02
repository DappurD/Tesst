import { Entity } from '../Entity';

export class LavaPool extends Entity {
    lifespan: number;
    initialLifespan: number;
    radius: number;
    damagePerSecond: number;
    color: string;

    constructor(x: number, y: number, radius: number, lifespan: number, damage: number, color = 'rgba(255, 69, 0, 0.7)') {
        super(x - radius, y - radius, radius * 2, radius * 2, 'hazard');
        this.radius = radius;
        this.lifespan = lifespan;
        this.initialLifespan = lifespan;
        this.damagePerSecond = damage;
        this.color = color;
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
        const lifeRatio = this.lifespan / this.initialLifespan;
        const pulse = 1 + Math.sin(performance.now() / 150) * 0.1;
        
        ctx.globalAlpha = Math.min(1, lifeRatio * 4) * 0.7; // Fade in and out
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
