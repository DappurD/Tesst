

import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Enemy } from '../enemies/Enemy';
import { Bullet } from '../Bullet';

export class SwarmSovereign extends Boss {
    private phase: number = 1;
    private spawnCooldown: number = 5;
    private attackCooldown: number = 2.5;
    private isSpawning = false;

    constructor(x: number, y: number, game: Game) {
        super(x, y, 120, 120, 'Swarm Sovereign', 200);
        this.maxHealth = 500;
        this.health = this.maxHealth;
        this.taunts = ["The hive is eternal!", "You face a legion.", "We are one."];
    }

    update(dt: number, player: Player, game: Game): void {
        if (this.handleTransition(dt) || this.isSpawning) {
             if(this.isSpawning) this.vx = this.vy = 0;
            return;
        }
        this.handleTaunts(dt, game);
        
        if (this.health < this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            game.triggerPhaseTransition(this, true);
        }
        
        const speed = 50;
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        if (distToPlayer > 300) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            // Strafe
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.vx = Math.cos(angle + Math.PI/2) * speed * 0.7;
            this.vy = Math.sin(angle + Math.PI/2) * speed * 0.7;
        }
        this.move(dt);


        this.spawnCooldown -= dt;
        if (this.spawnCooldown <= 0) {
            this.spawnMinions(game);
            this.spawnCooldown = this.phase === 1 ? rand(5, 7) : rand(3, 5);
        }

        this.attackCooldown -= dt;
        if(this.attackCooldown <= 0) {
            this.shotgunBlast(player, game);
            this.attackCooldown = this.phase === 1 ? rand(2, 3) : rand(1, 2);
        }
    }
    
    shotgunBlast(player: Player, game: Game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);

        const bulletCount = this.phase === 1 ? 5 : 8;
        const spread = Math.PI / 8;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = angleToPlayer + rand(-spread, spread);
            const speed = rand(300, 450);
            const bullet = new Bullet(centerX, centerY, 8, 8, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemyBullet', 0.8);
            game.addEntity(bullet);
        }
    }

    spawnMinions(game: Game) {
        this.isSpawning = true;
        this.invincible = true;
        game.soundManager.playShoot();
        const spawnCount = this.phase === 1 ? 2 : 3;
        for (let i = 0; i < spawnCount; i++) {
            setTimeout(() => {
                 game.addEntity(new Enemy(this.x + rand(-50, 50), this.y + rand(-50, 50)));
            }, i * 300);
        }
        setTimeout(() => {
            this.isSpawning = false;
            this.invincible = false;
        }, spawnCount * 300);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const mainColor = '#6b8e23'; // Olive Drab
        const accentColor = this.phase === 1 ? '#9acd32' : '#adff2f'; // YellowGreen to GreenYellow
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.save();
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;

        if (this.isSpawning || this.invincible) {
             ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 100) * 0.2;
        }

        const pulse = 1 + Math.sin(performance.now() / 300) * 0.05;
        
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, (this.width / 2) * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, (this.width / 4) * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        const time = performance.now() / 1000;
        for (let i = 0; i < 8; i++) {
            const angle = time * 2 + (i * Math.PI / 4);
            const radius = this.width / 2 + 10 + Math.sin(time*3 + i) * 10;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            ctx.fillStyle = `rgba(173, 255, 47, ${0.5 + Math.sin(angle*5)*0.2})`;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
