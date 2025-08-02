

import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Bullet } from '../Bullet';
import { CrystalObstacle } from '../obstacles/CrystalObstacle';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../config';

export class CrystalWeaver extends Boss {
    private phase = 1;
    private attackCooldown = 2.0;
    private crystalCooldown = 8.0;
    private targetPosition: {x:number, y:number}|null = null;
    private moveTimer = 0;

    constructor(x: number, y: number, game: Game) {
        super(x, y, 100, 100, 'Crystal Weaver', 350);
        this.maxHealth = 550;
        this.health = this.maxHealth;
        this.taunts = ["Behold my crystalline perfection!", "You will shatter!", "Gaze upon true beauty before you perish."];
    }

    update(dt: number, player: Player, game: Game): void {
        if (this.handleTransition(dt)) return;
        this.handleTaunts(dt, game);

        if (this.health < this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            game.triggerPhaseTransition(this, true);
        }

        this.moveTimer -= dt;
        if(this.moveTimer <= 0 || !this.targetPosition) {
            this.targetPosition = { x: rand(100, CANVAS_WIDTH - 100), y: rand(100, CANVAS_HEIGHT - 100) };
            this.moveTimer = rand(3, 5);
        }

        const dx = this.targetPosition.x - this.x;
        const dy = this.targetPosition.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
            this.vx = (dx / dist) * 100;
            this.vy = (dy / dist) * 100;
        } else {
            this.vx = this.vy = 0;
        }

        this.attackCooldown -= dt;
        if (this.attackCooldown <= 0) {
            this.ricochetShot(player, game);
            this.attackCooldown = this.phase === 1 ? rand(1.5, 2.5) : rand(0.8, 1.2);
        }

        this.crystalCooldown -= dt;
        if (this.crystalCooldown <= 0) {
            this.spawnCrystals(game, player);
            this.crystalCooldown = this.phase === 1 ? rand(8, 12) : rand(5, 8);
        }

        this.move(dt);
    }

    ricochetShot(player: Player, game: Game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);
        
        const bulletCount = this.phase === 1 ? 3 : 5;
        const speed = 400;

        for (let i = 0; i < bulletCount; i++) {
            const angle = angleToPlayer + (i - Math.floor(bulletCount/2)) * (Math.PI / 8);
            const bullet = new Bullet(centerX, centerY, 10, 10, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemyBullet');
            bullet.ricochetCount = this.phase === 1 ? 1 : 2;
            game.addEntity(bullet);
        }
    }

    spawnCrystals(game: Game, player: Player) {
        const crystalCount = this.phase === 1 ? 2 : 3;
        // Spawn one crystal near the player to create pressure
        game.addEntity(new CrystalObstacle(player.x + rand(-150, 150), player.y + rand(-150, 150)));

        for (let i = 1; i < crystalCount; i++) {
            const x = rand(100, CANVAS_WIDTH - 100);
            const y = rand(100, CANVAS_HEIGHT - 100);
            game.addEntity(new CrystalObstacle(x, y));
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const accentColor = '#ee82ee'; // Violet
        const time = performance.now() / 1000;
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 25;

        for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3 + time * 0.2);
            ctx.fillStyle = `hsl(${280 + Math.sin(time*2 + i) * 20}, 100%, 70%)`;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.width / 1.5, 10);
            ctx.lineTo(this.width / 1.5, -10);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
}
