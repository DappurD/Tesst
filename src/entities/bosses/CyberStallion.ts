


import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { Bullet } from '../Bullet';
import { rand } from '../../utils';
import { Shockwave } from '../effects/Shockwave';
import { LaserBeam } from '../hazards/LaserBeam';

export class CyberStallion extends Boss {
    private phase: number = 1;
    private attackCooldown: number = 2;
    private moveTimer: number = 0;
    private targetX: number = 0;
    private targetY: number = 0;
    private isCharging = false;
    private isTelegraphingCharge = false;
    private chargeTargetX = 0;
    private chargeTargetY = 0;
    private chargeCooldown = 5.0;

    constructor(x: number, y: number, game: Game) {
        super(x, y, 100, 120, 'Cyber Stallion', 150);
        this.maxHealth = 400;
        this.health = this.maxHealth;
        this.taunts = ["Resistance is futile.", "Your efforts are insignificant.", "Behold, true power!"];
        this.selectNewTargetPosition(game);
    }

    selectNewTargetPosition(game: Game) {
        this.targetX = rand(100, game.canvas.width - 100);
        this.targetY = rand(100, game.canvas.height / 2);
        this.moveTimer = rand(2, 4);
    }

    update(dt: number, player: Player, game: Game): void {
        if (this.handleTransition(dt) || this.isTelegraphingCharge) {
            if(this.isTelegraphingCharge) this.vx = this.vy = 0;
            return;
        }
        this.handleTaunts(dt, game);

        if (this.health < this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            game.triggerPhaseTransition(this, true);
        }

        if (this.isCharging) {
            const dx = this.chargeTargetX - this.x;
            const dy = this.chargeTargetY - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 50) {
                this.isCharging = false;
                this.vx = 0;
                this.vy = 0;
                game.triggerScreenShake(8, 0.2);
            }
        } else {
            this.moveTimer -= dt;
            if (this.moveTimer <= 0) {
                this.selectNewTargetPosition(game);
            }

            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const speed = 150;
            if (dist > 5) {
                this.vx = (dx / dist) * speed;
                this.vy = (dy / dist) * speed;
            } else {
                this.vx = 0;
                this.vy = 0;
            }

            this.attackCooldown -= dt;
            if (this.attackCooldown <= 0) {
                this.attack(player, game);
            }

            if (this.phase === 2) {
                this.chargeCooldown -= dt;
                if (this.chargeCooldown <= 0) {
                    this.telegraphCharge(player, game);
                }
            }
        }

        this.move(dt);
    }
    
    attack(player: Player, game: Game) {
        const attackType = rand(0, 10);
        if (this.phase === 2 && attackType > 6) {
            this.homingMissiles(player, game);
        } else {
            this.laserBurst(player, game);
        }
        this.attackCooldown = this.phase === 1 ? rand(1.5, 2.5) : rand(0.8, 1.5);
    }

    telegraphCharge(player: Player, game: Game) {
        this.isTelegraphingCharge = true;
        this.chargeTargetX = player.x;
        this.chargeTargetY = player.y;

        const angle = Math.atan2(this.chargeTargetY - this.y, this.chargeTargetX - this.x);
        const dist = Math.hypot(this.chargeTargetX - this.x, this.chargeTargetY - this.y);
        
        game.addEntity(new LaserBeam(this.x, this.y, dist, 5, 1.0, 0, true));
        
        setTimeout(() => {
            this.isTelegraphingCharge = false;
            this.startCharge(angle, game);
        }, 1000);
        this.chargeCooldown = rand(6, 8);
    }
    
    startCharge(angle: number, game: Game) {
        this.isCharging = true;
        this.invincible = true;
        setTimeout(() => this.invincible = false, 1500);
        
        this.vx = Math.cos(angle) * 1200;
        this.vy = Math.sin(angle) * 1200;
        game.addEntity(new Shockwave(this.x + this.width / 2, this.y + this.height / 2, '#ff00ff', 100, 0.2));
    }

    laserBurst(player: Player, game: Game) {
        for(let i=0; i<3; i++) {
            setTimeout(() => this.shoot(player, game, 450, 0), i * 100);
        }
    }

    homingMissiles(player: Player, game: Game) {
        for(let i=0; i<2; i++) {
            setTimeout(() => this.shoot(player, game, 300, 200), i * 200);
        }
    }

    shoot(player: Player, game: Game, speed: number, homingStrength: number) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);

        const bullet = new Bullet(centerX, centerY, 12, 12, Math.cos(angleToPlayer) * speed, Math.sin(angleToPlayer) * speed, 'enemyBullet', 1, homingStrength);
        game.addEntity(bullet);

        if(this.phase === 2 && homingStrength === 0){
            const spread = Math.PI / 12;
            const bullet2 = new Bullet(centerX, centerY, 8, 8, Math.cos(angleToPlayer-spread) * speed * 0.8, Math.sin(angleToPlayer-spread) * speed * 0.8, 'enemyBullet', 0.5);
            const bullet3 = new Bullet(centerX, centerY, 8, 8, Math.cos(angleToPlayer+spread) * speed * 0.8, Math.sin(angleToPlayer+spread) * speed * 0.8, 'enemyBullet', 0.5);
            game.addEntity(bullet2);
            game.addEntity(bullet3);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const mainColor = '#d3d3d3';
        const accentColor = this.phase === 1 ? '#00ffff' : '#ff00ff';
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.save();
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;
        
        if (this.isCharging || this.isTelegraphingCharge) {
            ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 50) * 0.5;
            ctx.shadowBlur = 35;
        }

        // Body
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height * 0.2);
        ctx.lineTo(this.x + this.width, this.y + this.height * 0.2);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = '#a9a9a9';
        ctx.fillRect(this.x + this.width * 0.2, this.y, this.width * 0.6, this.height * 0.4);
        
        // Eye
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.height * 0.3, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
