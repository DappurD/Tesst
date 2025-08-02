

import { Entity } from './Entity';
import type { Game } from '../game';
import { EntityType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config';
import { reflect } from '../utils';

export class Bullet extends Entity {
    homingStrength: number;
    damage: number;
    ricochetCount: number = 0;
    hasPiercing = false;

    constructor(x: number, y: number, width: number, height: number, vx: number, vy: number, type: EntityType, damage = 1, homingStrength = 0) {
        super(x - width/2, y - height/2, width, height, type);
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.homingStrength = homingStrength;
    }

    update(dt: number, game: Game) {
        if (this.homingStrength > 0 && game.player && this.type === 'enemyBullet') {
            const angleToPlayer = Math.atan2(game.player.y + game.player.height/2 - this.y, game.player.x + game.player.width/2 - this.x);
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            
            this.vx += Math.cos(angleToPlayer) * this.homingStrength * dt;
            this.vy += Math.sin(angleToPlayer) * this.homingStrength * dt;

            const newSpeed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (newSpeed > 0) {
                this.vx = (this.vx / newSpeed) * speed;
                this.vy = (this.vy / newSpeed) * speed;
            }
        }
        
        if (game.gravityWell) {
            const dx = game.gravityWell.x - (this.x + this.width / 2);
            const dy = game.gravityWell.y - (this.y + this.height / 2);
            const distSq = dx * dx + dy * dy;
            const pullRadius = game.gravityWell.radius;

            if (distSq < pullRadius * pullRadius && distSq > 2500) {
                const angle = Math.atan2(dy, dx);
                const strength = 1 - (Math.sqrt(distSq) / pullRadius);
                this.vx += Math.cos(angle) * game.gravityWell.strength * strength * dt * 2;
                this.vy += Math.sin(angle) * game.gravityWell.strength * strength * dt * 2;
            }
        }
        
        super.update(dt, game);

        // Ricochet logic
        let bounced = false;
        let normal = {x: 0, y: 0};

        if (this.x < 0) { bounced = true; normal = {x: 1, y: 0}; this.x = 0; }
        if (this.x + this.width > CANVAS_WIDTH) { bounced = true; normal = {x: -1, y: 0}; this.x = CANVAS_WIDTH - this.width; }
        if (this.y < 0) { bounced = true; normal = {x: 0, y: 1}; this.y = 0; }
        if (this.y + this.height > CANVAS_HEIGHT) { bounced = true; normal = {x: 0, y: -1}; this.y = CANVAS_HEIGHT - this.height; }

        if (bounced) {
            if (this.ricochetCount > 0) {
                this.ricochetCount--;
                const incident = {x: this.vx, y: this.vy};
                const reflected = reflect(incident, normal);
                this.vx = reflected.x;
                this.vy = reflected.y;
            } else {
                this.shouldBeRemoved = true;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const color = this.type === 'playerBullet' ? (this.hasPiercing ? '#ee82ee' : '#00ffff') : '#ff4141';
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const rotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
}
