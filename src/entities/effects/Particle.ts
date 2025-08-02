import { Entity } from '../Entity';
import { rand } from '../../utils';
import type { Game } from '../../game';

export class Particle extends Entity {
    lifespan: number;
    color: string;

    constructor(x: number, y: number, color: string | 'rainbow') {
        const size = rand(2, 5);
        super(x, y, size, size, 'particle');
        this.vx = rand(-150, 150);
        this.vy = rand(-150, 150);
        this.lifespan = rand(0.5, 1.5);
        if (color === 'rainbow') {
            this.color = `hsl(${rand(0, 360)}, 100%, 70%)`;
        } else {
            this.color = color;
        }
    }

    update(dt: number, game?: Game) {
        super.update(dt, game);
        this.lifespan -= dt;
        if (this.lifespan <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.lifespan);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }
}
