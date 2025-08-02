

import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Bullet } from '../Bullet';
import { InkPool } from '../hazards/InkPool';

export class SunkenHorror extends Boss {
    private phase = 1;
    private attackCooldown = 3.0;
    private isPulling = false;
    
    constructor(x: number, y: number, game: Game) {
        super(x, y, 200, 180, 'Sunken Horror', 400);
        this.maxHealth = 800;
        this.health = this.maxHealth;
        this.taunts = ["The abyss calls to you.", "You are out of your depth.", "Drown in despair."];
    }

    update(dt: number, player: Player, game: Game): void {
        if (this.handleTransition(dt) || this.isPulling) {
            if (this.isPulling) this.vx = this.vy = 0;
            return;
        }
        this.handleTaunts(dt, game);

        if (this.health < this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            game.triggerPhaseTransition(this, true);
        }

        this.attackCooldown -= dt;
        if(this.attackCooldown <= 0) {
            const attackType = rand(0, 10);
            if(attackType > 6 && this.phase === 2) {
                this.whirlpool(game);
            } else if (attackType > 3) {
                this.bulletTorrent(player, game);
            } else {
                this.inkSplatter(player, game);
            }
            this.attackCooldown = this.phase === 1 ? rand(2,3) : rand(1, 2);
        }

        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const speed = 80;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.move(dt);
    }

    whirlpool(game: Game) {
        this.isPulling = true;
        game.gravityWell = { x: this.x + this.width / 2, y: this.y + this.height / 2, radius: 800, strength: 150 };
        
        setTimeout(() => {
            game.gravityWell = null;
            this.isPulling = false;
            // Unleash point-blank attack
            for(let i=0; i < 36; i++) {
                const angle = (i * Math.PI) / 18;
                const speed = 400;
                 const bullet = new Bullet(this.x + this.width/2, this.y+this.height/2, 10, 10, Math.cos(angle)*speed, Math.sin(angle)*speed, 'enemyBullet');
                 game.addEntity(bullet);
            }
        }, 3000);
    }

    bulletTorrent(player: Player, game: Game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);

        const bulletCount = this.phase === 1 ? 12 : 24;
        const duration = 1500;
        for (let i = 0; i < bulletCount; i++) {
            setTimeout(() => {
                if(this.shouldBeRemoved) return;
                const angle = angleToPlayer + Math.sin(i / 3) * (Math.PI / 4);
                const speed = 500;
                const bullet = new Bullet(centerX, centerY, 8, 20, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemyBullet');
                game.addEntity(bullet);
            }, (i / bulletCount) * duration);
        }
    }

    inkSplatter(player: Player, game: Game) {
        const poolCount = this.phase === 1 ? 1 : 3;
        for (let i = 0; i < poolCount; i++) {
            const x = player.x + rand(-150, 150);
            const y = player.y + rand(-150, 150);
            game.addEntity(new InkPool(x, y, 70, 8, 5, 0.5));
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const mainColor = '#006400';
        const accentColor = '#20b2aa';
        const eyeColor = '#ff4141';
        ctx.save();
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 30;
        
        if (this.isPulling) {
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(performance.now() / 200);
            ctx.translate(-(this.x + this.width/2), -(this.y + this.height/2));
        }

        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        const eyeRadius = 20 + Math.sin(performance.now() / 400) * 5;
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
