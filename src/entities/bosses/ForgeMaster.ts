

import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Shockwave } from '../effects/Shockwave';
import { LavaPool } from '../hazards/LavaPool';
import { LaserBeam } from '../hazards/LaserBeam';

export class ForgeMaster extends Boss {
    private phase = 1;
    private attackCooldown = 4.0;

    constructor(x: number, y: number, game: Game) {
        super(x, y, 150, 150, 'Forge Master', 300);
        this.maxHealth = 700;
        this.health = this.maxHealth;
        this.taunts = ["Feel the heat of the forge!", "I will smelt you down!", "Your end will be tempered in fire."];
    }

    update(dt: number, player: Player, game: Game): void {
        if (this.handleTransition(dt)) return;
        this.handleTaunts(dt, game);

        if (this.health < this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            game.triggerPhaseTransition(this, true);
        }

        this.attackCooldown -= dt;
        if(this.attackCooldown <= 0) {
            const attackType = rand(0, 10);
            if (attackType > 5) {
                this.hammerSlam(game);
            } else {
                this.mortarVolley(player, game);
            }
            this.attackCooldown = this.phase === 1 ? rand(3, 4) : rand(2, 3);
        }

        this.move(dt);
    }

    hammerSlam(game: Game) {
        game.addEntity(new Shockwave(this.x + this.width/2, this.y + this.height/2, '#ff4500', game.canvas.width * 1.5, 0.8));
        game.triggerScreenShake(15, 0.5);
    }

    mortarVolley(player: Player, game: Game) {
        const volleyCount = this.phase === 1 ? 3 : 5;
        for(let i=0; i<volleyCount; i++) {
            setTimeout(() => {
                const targetX = player.x + rand(-150, 150);
                const targetY = player.y + rand(-150, 150);
                // Add a visual indicator for the mortar landing spot
                game.addEntity(new LaserBeam(targetX - 30, targetY - 30, 60, 60, 1.0, 0, true));
                setTimeout(() => {
                     game.addEntity(new LavaPool(targetX, targetY, 60, 8, 10));
                     game.addEntity(new Shockwave(targetX, targetY, '#ff4500', 80, 0.3));
                }, 1000)
            }, i * 200);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const mainColor = '#ff4500'; // OrangeRed
        const accentColor = '#ffd700'; // Gold
        ctx.save();
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#662200';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 80px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', this.x + this.width / 2, this.y + this.height / 2 + 10);
        
        ctx.restore();
    }
}
