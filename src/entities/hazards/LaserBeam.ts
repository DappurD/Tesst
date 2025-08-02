
import { Entity } from '../Entity';

export class LaserBeam extends Entity {
    lifespan: number;
    initialLifespan: number;
    damage: number;
    isTelegraph: boolean;

    constructor(x: number, y: number, width: number, height: number, lifespan: number, damage: number, isTelegraph = false) {
        super(x, y, width, height, 'hazard');
        this.lifespan = lifespan;
        this.initialLifespan = lifespan;
        this.damage = damage;
        this.isTelegraph = isTelegraph;
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
        if (this.isTelegraph) {
            ctx.globalAlpha = 0.5 * (Math.sin(performance.now()/100) * 0.5 + 0.5);
            ctx.fillStyle = '#ff4141';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.globalAlpha = this.lifespan / this.initialLifespan;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#ff4141';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        }
        ctx.restore();
    }
}
