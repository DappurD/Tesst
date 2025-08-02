

import { Entity } from '../Entity';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Bullet } from '../Bullet';

export class Enemy extends Entity {
    shootCooldown = 0;
    angle = 0;
    
    constructor(x: number, y: number, width = 40, height = 40) {
        super(x, y, width, height, 'enemy');
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.shootCooldown = rand(1, 3);
    }
    
    update(dt: number, player: Player, game: Game) {
        const speed = 80;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;

        this.angle = Math.atan2(playerCenterY - myCenterY, playerCenterX - myCenterX);
        this.vx = Math.cos(this.angle) * speed;
        this.vy = Math.sin(this.angle) * speed;
        
        super.update(dt, game);
        
        this.shootCooldown -= dt;
        if (this.shootCooldown <= 0) {
            this.shoot(player, game);
            this.shootCooldown = rand(2, 4);
        }
    }
    
    shoot(player: Player, game: Game) {
        const speed = 350;
        const angle = Math.atan2(player.y + player.height/2 - (this.y + this.height/2), player.x + player.width/2 - (this.x + this.width/2));
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const bullet = new Bullet(this.x + this.width / 2, this.y + this.height/2, 8, 14, vx, vy, 'enemyBullet');
        game.addEntity(bullet);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const mainColor = '#a52a2a';
        const accentColor = '#ff4141';

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.angle);

        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;

        // Main body - aggressive fighter shape
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0); // Nose
        ctx.lineTo(-this.width / 2, -this.height / 2); // Top-left wing
        ctx.lineTo(-this.width / 3, 0); // Center-back indent
        ctx.lineTo(-this.width / 2, this.height / 2); // Bottom-left wing
        ctx.closePath();
        ctx.fill();

        // Glowing "engine" or "eye" at the back
        ctx.fillStyle = accentColor;
        ctx.shadowColor = '#ff6347';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-this.width / 3, 0, this.height / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Health bar
        if (this.health < this.maxHealth) {
            const barWidth = this.width * 0.8;
            const barHeight = 5;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#ff4141';
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }
}
