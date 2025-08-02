
import { Entity } from './Entity';
import type { Game } from '../game';
import { InputHandler } from '../managers/InputHandler';
import { Upgrades, PowerUpType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config';
import { checkCollision } from '../utils';
import { Bullet } from './Bullet';
import { Singularity } from './Singularity';
import type { SlowingPool } from './aoe/SlowingPool';
import { Shockwave } from './effects/Shockwave';

export class Player extends Entity {
    baseSpeed = 300;
    baseShootRate = 5;
    baseDashCooldown = 1.5;
    baseMaxHealth = 10;
    
    speed: number;
    shootRate: number;
    dashCooldown: number;
    
    shootCooldown = 0;
    isDashing = false;
    dashDuration = 0.15;
    dashInvincibilityDuration = 0.3;
    dashTimer = 0;
    dashCooldownTimer = 0;
    dashSpeed = 1000;
    invincibilityDuration = 0.8;
    invincibilityTimer = 0;
    upgrades: Upgrades;
    
    // Temporary buffs
    tempDamageBonus = 0;
    tempFireRateBonus = 0;
    tempHealthBonus = 0;
    hasPiercing = false;

    ultimateCharge = 0;
    maxUltimateCharge = 100;
    
    activePowerups: Map<PowerUpType, number> = new Map();
    shieldHealth = 0;

    constructor(x: number, y: number, upgrades: Upgrades) {
        super(x, y, 30, 40, 'player');
        this.upgrades = upgrades;
        
        this.speed = this.baseSpeed;
        this.shootRate = this.baseShootRate;
        this.dashCooldown = this.baseDashCooldown;
        this.maxHealth = this.baseMaxHealth;
        this.applyUpgrades();
        this.health = this.maxHealth;
    }
    
    applyUpgrades() {
        this.maxHealth = this.baseMaxHealth + (this.upgrades.health * 2) + this.tempHealthBonus;
        this.shootRate = this.baseShootRate * (1 + (this.upgrades.fireRate * 0.15) + this.tempFireRateBonus);
        this.dashCooldown = this.baseDashCooldown * (1 - (this.upgrades.dashCooldown * 0.1));
    }

    resetTemporaryBuffs() {
        this.tempDamageBonus = 0;
        this.tempFireRateBonus = 0;
        this.tempHealthBonus = 0;
        this.hasPiercing = false;
        this.applyUpgrades();
        this.health = this.maxHealth;
    }
    
    addUltimateCharge(amount: number) {
        this.ultimateCharge = Math.min(this.maxUltimateCharge, this.ultimateCharge + amount);
    }

    update(dt: number, input: InputHandler, game: Game) {
        // --- State-based logic to determine velocity and actions ---
        if (game.gameState === 'Hub') {
            this.handleHubMovement(dt, input);
        } else {
            this.handleCombatLogic(dt, input, game);
        }
        
        // --- Universal Physics and Boundary Checks ---
        super.update(dt);
        
        // Boundary checks for combat state (obstacles)
        if (game.gameState !== 'Hub') {
            for (const obstacle of game.entityMap.obstacle) {
                if (checkCollision(this, obstacle)) {
                    // Simple stop; could be improved with sliding
                    this.x -= this.vx * dt;
                    this.y -= this.vy * dt;
                    // Nudge out
                    const overlapX = (this.x + this.width/2) - (obstacle.x + obstacle.width/2);
                    const overlapY = (this.y + this.height/2) - (obstacle.y + obstacle.height/2);
                    const combinedHalfWidths = this.width/2 + obstacle.width/2;
                    const combinedHalfHeights = this.height/2 + obstacle.height/2;
                    if(Math.abs(overlapX) < combinedHalfWidths && Math.abs(overlapY) < combinedHalfHeights){
                        const overlapXAmount = combinedHalfWidths - Math.abs(overlapX);
                        const overlapYAmount = combinedHalfHeights - Math.abs(overlapY);
                        if(overlapXAmount < overlapYAmount){
                            this.x += overlapX > 0 ? overlapXAmount : -overlapXAmount;
                        } else {
                            this.y += overlapY > 0 ? overlapYAmount : -overlapYAmount;
                        }
                    }
                }
            }
        }
        
        // Canvas boundary checks
        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, CANVAS_HEIGHT - this.height));
    }

    private handleHubMovement(dt: number, input: InputHandler) {
        this.invincible = true;
        this.isDashing = false;
        
        this.vx = 0;
        this.vy = 0;

        if (input.keys.has('KeyW')) this.vy = -this.speed;
        if (input.keys.has('KeyS')) this.vy = this.speed;
        if (input.keys.has('KeyA')) this.vx = -this.speed;
        if (input.keys.has('KeyD')) this.vx = this.speed;

        if (this.vx !== 0 && this.vy !== 0) {
            this.vx /= Math.SQRT2;
            this.vy /= Math.SQRT2;
        }
    }

    private handleCombatLogic(dt: number, input: InputHandler, game: Game) {
        let currentSpeed = this.speed;
        
        this.addUltimateCharge(dt * 2);
        this.updatePowerups(dt);

        if (this.shootCooldown > 0) this.shootCooldown -= dt;
        if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
        
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= dt;
            this.invincible = this.invincibilityTimer > 0;
        }
        
        for (const zone of game.entityMap.aoeZone) {
            if (checkCollision(this, zone)) {
                currentSpeed *= (zone as any).slowFactor || 1;
                break; 
            }
        }

        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.vx = 0;
                this.vy = 0;
            }
        } else {
            // Standard Movement
            this.vx = 0;
            this.vy = 0;
            if (input.keys.has('KeyW')) this.vy = -currentSpeed;
            if (input.keys.has('KeyS')) this.vy = currentSpeed;
            if (input.keys.has('KeyA')) this.vx = -currentSpeed;
            if (input.keys.has('KeyD')) this.vx = currentSpeed;

            if (this.vx !== 0 && this.vy !== 0) {
                this.vx /= Math.SQRT2;
                this.vy /= Math.SQRT2;
            }

            // Actions
            if (input.keys.has('Space') && this.dashCooldownTimer <= 0) {
                const dashVector = { x: 0, y: 0 };
                if (input.keys.has('KeyW')) dashVector.y -= 1;
                if (input.keys.has('KeyS')) dashVector.y += 1;
                if (input.keys.has('KeyA')) dashVector.x -= 1;
                if (input.keys.has('KeyD')) dashVector.x += 1;
                
                if (dashVector.x !== 0 || dashVector.y !== 0) {
                    this.isDashing = true;
                    this.invincible = true;
                    this.invincibilityTimer = Math.max(this.invincibilityTimer, this.dashInvincibilityDuration);
                    this.dashTimer = this.dashDuration;
                    this.dashCooldownTimer = this.dashCooldown;
                    
                    const angle = Math.atan2(dashVector.y, dashVector.x);
                    this.vx = Math.cos(angle) * this.dashSpeed;
                    this.vy = Math.sin(angle) * this.dashSpeed;
                    
                    game.soundManager.playDash();
                    game.triggerScreenShake(4, 0.15);
                    for (let i = 0; i < 20; i++) {
                        game.addParticle(this.x + this.width / 2, this.y + this.height / 2, 'rainbow');
                    }
                }
            }
            
            if (input.keys.has('KeyQ') && this.ultimateCharge >= this.maxUltimateCharge) {
                this.ultimateCharge = 0;
                game.addEntity(new Singularity(input.mouseX, input.mouseY));
                game.triggerScreenShake(12, 0.4);
            }
        }

        if (game.gravityWell) {
            const dx = game.gravityWell.x - (this.x + this.width / 2);
            const dy = game.gravityWell.y - (this.y + this.height / 2);
            const distSq = dx * dx + dy * dy;
            if (distSq < game.gravityWell.radius * game.gravityWell.radius) {
                const angle = Math.atan2(dy, dx);
                const strength = 1 - (Math.sqrt(distSq) / game.gravityWell.radius);
                this.x += Math.cos(angle) * game.gravityWell.strength * strength * dt;
                this.y += Math.sin(angle) * game.gravityWell.strength * strength * dt;
            }
        }

        if (input.isMouseDown && this.shootCooldown <= 0 && !this.isDashing) {
            this.shoot(input.mouseX, input.mouseY, game);
        }
    }
    
    updatePowerups(dt: number) {
        if (this.activePowerups.size === 0) return;
        
        const expired: PowerUpType[] = [];
        for (const [type, timer] of this.activePowerups.entries()) {
            const newTimer = timer - dt;
            if (newTimer <= 0) {
                expired.push(type);
            } else {
                this.activePowerups.set(type, newTimer);
            }
        }

        expired.forEach(type => {
            this.activePowerups.delete(type);
            if(type === 'Shield') this.shieldHealth = 0;
        });
    }
    
    activatePowerUp(type: PowerUpType, game: Game) {
        game.soundManager.playPowerUp();
        switch(type) {
            case 'Shield':
                this.shieldHealth = 1;
                this.activePowerups.set(type, 15);
                break;
            case 'QuadShot':
                this.activePowerups.set(type, 10);
                break;
            case 'RapidFire':
                this.activePowerups.set(type, 10);
                break;
        }
    }

    shoot(targetX: number, targetY: number, game: Game) {
        game.soundManager.playShoot();
        const speed = 800;
        const damage = (1 + (this.upgrades.damage * 0.25)) * (1 + this.tempDamageBonus);
        const baseAngle = Math.atan2(targetY - (this.y + this.height / 2), targetX - (this.x + this.width / 2));
        
        let currentShootRate = this.shootRate;
        if(this.activePowerups.has('RapidFire')) currentShootRate *=2;

        if (this.activePowerups.has('QuadShot')) {
            const quadShotDamage = damage / 2;
            const spread = Math.PI / 18;
            for (let i = -1.5; i <= 1.5; i++) {
                const angle = baseAngle + i * spread;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const bullet = new Bullet(this.x + this.width / 2, this.y + 10, 8, 20, vx, vy, 'playerBullet', quadShotDamage);
                bullet.hasPiercing = this.hasPiercing;
                game.addEntity(bullet);
            }
        } else {
            const vx = Math.cos(baseAngle) * speed;
            const vy = Math.sin(baseAngle) * speed;
            const bullet = new Bullet(this.x + this.width / 2, this.y + 10, 8, 20, vx, vy, 'playerBullet', damage);
            bullet.hasPiercing = this.hasPiercing;
            game.addEntity(bullet);
        }
        this.shootCooldown = 1 / currentShootRate;
    }
    
    takeDamage(amount: number, game: Game) {
        if (this.invincible) return false;
        
        if (this.shieldHealth > 0) {
            this.shieldHealth = 0;
            this.activePowerups.delete('Shield');
            game.soundManager.playHit();
            for(let i = 0; i < 30; i++) game.addParticle(this.x + this.width/2, this.y + this.height/2, '#00bfff');
            game.addEntity(new Shockwave(this.x + this.width/2, this.y + this.height/2, '#00bfff'));
            return false;
        }
        
        game.soundManager.playHit();
        this.health -= amount;
        this.invincible = true;
        this.invincibilityTimer = this.invincibilityDuration;
        game.triggerScreenShake(6, 0.25);
        if (this.health <= 0) {
            game.soundManager.playExplosion();
            this.shouldBeRemoved = true;
        }
        return true;
    }

    draw(ctx: CanvasRenderingContext2D, game: Game) {
        if (game.gameState !== 'Hub' && this.invincible && !this.isDashing && Math.floor(this.invincibilityTimer * 20) % 2 === 0) {
            return;
        }
        
        const hornColor = '#00ffff';
        const bodyColor = '#ff00ff';
        const accentColor = '#e0e0e0';
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);

        const angle = Math.atan2(game.input.mouseY - centerY, game.input.mouseX - centerX);
        ctx.rotate(angle + Math.PI / 2);

        ctx.shadowColor = bodyColor;
        ctx.shadowBlur = 15;

        // Main body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 1.5); // Tip
        ctx.quadraticCurveTo(-this.width / 2, 0, -this.width / 2, this.height / 2); // Left side
        ctx.lineTo(this.width / 2, this.height / 2); // Bottom
        ctx.quadraticCurveTo(this.width / 2, 0, 0, -this.height / 1.5); // Right side
        ctx.fill();

        // Armored plate
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2.5);
        ctx.lineTo(-this.width/3, this.height / 4);
        ctx.lineTo(this.width/3, this.height / 4);
        ctx.closePath();
        ctx.fill();

        // Horn
        ctx.fillStyle = hornColor;
        ctx.shadowColor = hornColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 1.5);
        ctx.lineTo(-3, -this.height / 1.5 - 15);
        ctx.lineTo(3, -this.height / 1.5 - 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        if (this.shieldHealth > 0) {
            const timer = this.activePowerups.get('Shield') || 0;
            const alpha = Math.min(1, timer / 1.0) * (0.4 + Math.sin(performance.now() / 150) * 0.2);
            ctx.fillStyle = `rgba(0, 191, 255, ${alpha * 0.5})`;
            ctx.strokeStyle = `rgba(0, 191, 255, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00bfff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }
}
