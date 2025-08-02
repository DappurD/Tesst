
import { Entity } from '../Entity';

export class InkPool extends Entity {
    lifespan: number;
    initialLifespan: number;
    radius: number;
    damagePerSecond: number;
    slowFactor: number;

    constructor(x: number, y: number, radius: number, lifespan: number, damage: number, slowFactor: number) {
        super(x - radius, y - radius, radius * 2, radius * 2, 'hazard');
        this.radius = radius;
        this.lifespan = lifespan;
        this.initialLifespan = lifespan;
        this.damagePerSecond = damage;
        this.slowFactor = slowFactor;
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
        const pulse = 1 + Math.sin(performance.now() / 200) * 0.05;
        
        ctx.globalAlpha = Math.min(1, lifeRatio * 4) * 0.6;
        ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
