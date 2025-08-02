

import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Bullet } from '../Bullet';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../config';
import { FloatingText } from '../effects/FloatingText';

class GlitchClone extends Boss {
    lifespan = 1.5;
    constructor(x: number, y: number, game: Game){
        super(x,y, 80, 80, 'clone', 0);
        this.health = Infinity;
        this.invincible = true;
    }
    update(dt: number, player: Player, game: Game): void {
        this.lifespan -= dt;
        if(this.lifespan <= 0) this.shouldBeRemoved = true;

        if(Math.random() < 0.2) {
            this.glitchShot(player, game);
        }
    }
     glitchShot(player: Player, game: Game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);
        const angle = angleToPlayer + rand(-0.8, 0.8);
        const speed = rand(100, 400);
        const bullet = new Bullet(centerX, centerY, 8, 8, Math.cos(angle)*speed, Math.sin(angle)*speed, 'enemyBullet', 0.5);
        game.addEntity(bullet);
    }
     draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.lifespan / 1.5 * 0.7;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}


export class GlitchEntity extends Boss {
    private phase = 1;
    private teleportCooldown = 2.5;
    private attackCooldown = 0.5;

    constructor(x: number, y: number, game: Game) {
        super(x, y, 80, 80, 'Glitch Entity', 250);
        this.maxHealth = 600;
        this.health = this.maxHealth;
        this.taunts = ["3rr0r: P@th_n0t_f0und", "UnExPeCtEd iNpUt.", "NullReferenceException: player.hope"];
    }

    update(dt: number, player: Player, game: Game): void {
        if (this.handleTransition(dt)) return;
        this.handleTaunts(dt, game);

        if (this.health < this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            game.triggerPhaseTransition(this, true);
        }

        this.teleportCooldown -= dt;
        if(this.teleportCooldown <= 0) {
            this.teleport(game, player);
        }

        this.attackCooldown -= dt;
        if(this.attackCooldown <= 0) {
            this.glitchShot(player, game);
            this.attackCooldown = this.phase === 1 ? rand(0.3, 0.6) : rand(0.1, 0.3);
        }
        
        // No movement via velocity for this boss
    }

    teleport(game: Game, player: Player) {
        // Leave a clone in phase 2
        if(this.phase === 2) {
            game.addEntity(new GlitchClone(this.x, this.y, game));
        }

        for (let i = 0; i < 20; i++) game.addParticle(this.x + this.width / 2, this.y + this.height / 2, '#00ffff');
        this.x = rand(50, CANVAS_WIDTH - 50 - this.width);
        this.y = rand(50, CANVAS_HEIGHT - 50 - this.height);
        for (let i = 0; i < 20; i++) game.addParticle(this.x + this.width / 2, this.y + this.height / 2, '#ff00ff');
        this.teleportCooldown = this.phase === 1 ? rand(2, 3) : rand(1.5, 2.5);
    }
    
    glitchShot(player: Player, game: Game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);
        const angle = angleToPlayer + rand(-0.5, 0.5);
        const speed = rand(200, 600);
        const bullet = new Bullet(centerX, centerY, 10, 10, Math.cos(angle)*speed, Math.sin(angle)*speed, 'enemyBullet');
        game.addEntity(bullet);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const glitchColor1 = '#ff00ff';
        const glitchColor2 = '#00ffff';

        ctx.save();
        ctx.shadowColor = Math.random() > 0.5 ? glitchColor1 : glitchColor2;
        ctx.shadowBlur = 30;

        for (let i = 0; i < 5; i++) {
            const dx = rand(-10, 10);
            const dy = rand(-10, 10);
            if (Math.random() > 0.2) { // Skip drawing sometimes for glitch effect
                ctx.fillStyle = Math.random() > 0.5 ? glitchColor1 : glitchColor2;
                ctx.globalAlpha = rand(0.5, 1);
                ctx.fillRect(this.x + dx + rand(-5, 5), this.y + dy + rand(-5, 5), this.width + rand(-10, 10), this.height + rand(-10, 10));
            }
        }
        ctx.restore();
    }
}
