

import { Entity } from './Entity';
import type { Game } from '../game';
import { FloatingText } from './effects/FloatingText';

export class Singularity extends Entity {
    lifespan: number;
    maxRadius: number;
    pullRadius: number;
    damageRadius: number;
    pullStrength: number;
    damagePerSecond: number;
    damageCooldowns: Map<Entity, number> = new Map();
    rotation: number;

    constructor(x: number, y: number) {
        super(x, y, 0, 0, 'singularity');
        this.lifespan = 5.0;
        this.maxRadius = 400;
        this.pullRadius = this.maxRadius;
        this.damageRadius = 80;
        this.pullStrength = 250;
        this.damagePerSecond = 3.75;
        this.invincible = true;
        this.rotation = 0;
    }

    update(dt: number, game: Game) {
        this.lifespan -= dt;
        if (this.lifespan <= 0) {
            this.shouldBeRemoved = true;
            game.gravityWell = null; // Clear the global gravity well
            return;
        }
        
        // Update the global gravity well for other entities to react to
        game.gravityWell = {
            x: this.x,
            y: this.y,
            radius: this.pullRadius,
            strength: this.pullStrength,
        };
        
        this.rotation += dt * 2;

        const centerX = this.x;
        const centerY = this.y;

        // Pull enemies and enemy bullets (player and player bullets are handled by their own update via game.gravityWell)
        const entitiesToPull = [...game.entityMap.enemy, ...game.entityMap.boss, ...game.entityMap.enemyBullet];
        for(const entity of entitiesToPull) {
            const entityCenterX = entity.x + entity.width / 2;
            const entityCenterY = entity.y + entity.height / 2;
            
            const dx = centerX - entityCenterX;
            const dy = centerY - entityCenterY;
            const distSq = dx * dx + dy * dy;

            if (distSq < this.pullRadius * this.pullRadius) {
                const dist = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const strength = 1 - (dist / this.pullRadius);
                const pullForce = this.pullStrength * strength * dt;
                entity.x += Math.cos(angle) * pullForce;
                entity.y += Math.sin(angle) * pullForce;

                if (distSq < this.damageRadius * this.damageRadius && entity.type !== 'enemyBullet' && !entity.invincible) {
                    const cooldown = this.damageCooldowns.get(entity) || 0;
                    if (cooldown <= 0) {
                        const damage = this.damagePerSecond * 0.2;
                        entity.health -= damage;
                        if(game.player) game.player.addUltimateCharge(damage * 0.1);
                        game.addEntity(new FloatingText(entity.x + entity.width / 2, entity.y, damage.toFixed(1).replace(/\.0$/, ''), '#ffaa00', 16));
                        this.damageCooldowns.set(entity, 0.2);
                    }
                }
            }
        }

        for (const [entity, timer] of this.damageCooldowns.entries()) {
            if (timer > 0) {
                this.damageCooldowns.set(entity, timer - dt);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const progress = 1 - (this.lifespan / 5.0);
        const currentPullRadius = this.pullRadius * progress;
        const currentDamageRadius = this.damageRadius * progress;

        ctx.save();
        ctx.globalAlpha = Math.sin(progress * Math.PI);
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const grad = ctx.createRadialGradient(0, 0, currentDamageRadius, 0, 0, currentPullRadius);
        grad.addColorStop(0, 'rgba(255, 0, 255, 0.7)');
        grad.addColorStop(0.5, 'rgba(128, 0, 128, 0.5)');
        grad.addColorStop(1, 'rgba(10, 0, 20, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, currentPullRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(-this.rotation * 2);
        ctx.fillStyle = '#000000';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, currentDamageRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
