





import { Entity } from '../Entity';
import { checkCollision, rand } from '../../utils';
import type { Game } from '../../game';
import { Shockwave } from '../effects/Shockwave';

export class CrystalObstacle extends Entity {
    pulseTimer: number;
    isPulsing = false;

    constructor(x: number, y: number) {
        const size = rand(50, 90);
        super(x - size/2, y - size/2, size, size, 'obstacle');
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.pulseTimer = rand(3, 5);
    }
    
    update(dt: number, game: Game) {
        this.pulseTimer -= dt;
        if(this.pulseTimer <= 0) {
            this.pulse(game);
            this.pulseTimer = rand(4, 6);
        } else {
            this.isPulsing = false;
        }
    }

    pulse(game: Game) {
        this.isPulsing = true;
        game.addEntity(new Shockwave(this.x + this.width/2, this.y + this.height/2, '#ee82ee', this.width * 1.5, 0.5));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const color = `hsl(280, 100%, ${60 + (this.health / this.maxHealth) * 20}%)`;
        ctx.shadowColor = '#ee82ee';
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (this.pulseTimer < 1.0) {
            const pulseGlow = 1.0 - this.pulseTimer;
            ctx.shadowBlur = 15 + pulseGlow * 20;
        }

        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;

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
