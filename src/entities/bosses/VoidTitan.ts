

import { Boss } from './Boss';
import type { Player } from '../Player';
import type { Game } from '../../game';
import { rand } from '../../utils';
import { Bullet } from '../Bullet';
import { Enemy } from '../enemies/Enemy';
import { LaserBeam } from '../hazards/LaserBeam';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../config';

export class VoidTitan extends Boss {
    private phase = 1;
    private attackCooldown = 3.5;
    private attackPattern = 0;
    private spiralAngle = 0;

    constructor(x: number, y: number, game: Game) {
        super(x, y, 250, 250, 'Void Titan', 500);
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.taunts = ["I am the end of all things.", "The void is inevitable.", "You are but a speck of dust."];
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
            const attackType = this.attackPattern % (this.phase === 1 ? 3 : 4);
            switch(attackType) {
                case 0: this.spiralShot(game); break;
                case 1: this.barrage(player, game); break;
                case 2: this.summonMinions(game); break;
                case 3: this.laserSweep(game); break;
            }
            this.attackPattern++;
            this.attackCooldown = this.phase === 1 ? 4 : 2.5;
        }

        this.spiralAngle += dt * (this.phase === 1 ? 1 : 1.5);

        this.move(dt);
    }

    laserSweep(game: Game) {
        const isHorizontal = Math.random() > 0.5;
        const startPos = rand(100, (isHorizontal ? CANVAS_HEIGHT : CANVAS_WIDTH) - 100);
        const beamThickness = 25;

        // Telegraph
        if (isHorizontal) {
            game.addEntity(new LaserBeam(0, startPos, CANVAS_WIDTH, beamThickness, 1.2, 0, true));
        } else {
            game.addEntity(new LaserBeam(startPos, 0, beamThickness, CANVAS_HEIGHT, 1.2, 0, true));
        }
        
        // Fire
        setTimeout(() => {
            if (isHorizontal) {
                game.addEntity(new LaserBeam(0, startPos, CANVAS_WIDTH, beamThickness, 0.5, 3));
            } else {
                game.addEntity(new LaserBeam(startPos, 0, beamThickness, CANVAS_HEIGHT, 0.5, 3));
            }
            game.triggerScreenShake(10, 0.5);
        }, 1200);
    }

    spiralShot(game: Game) {
        const arms = this.phase === 1 ? 4 : 6;
        const speed = 350;
        for (let i = 0; i < arms; i++) {
            const angle = this.spiralAngle + (i * Math.PI * 2 / arms);
            const bullet = new Bullet(this.x + this.width/2, this.y+this.height/2, 15, 15, Math.cos(angle)*speed, Math.sin(angle)*speed, 'enemyBullet');
            game.addEntity(bullet);
        }
    }

    barrage(player: Player, game: Game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToPlayer = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);

        const bulletCount = this.phase === 1 ? 7 : 11;
        const totalSpread = Math.PI / 3;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = angleToPlayer + (i - Math.floor(bulletCount/2)) * (totalSpread / bulletCount);
            const speed = 400;
            const bullet = new Bullet(centerX, centerY, 12, 22, Math.cos(angle) * speed, Math.sin(angle) * speed, 'enemyBullet');
            game.addEntity(bullet);
        }
    }

    summonMinions(game: Game) {
        const spawnCount = this.phase === 1 ? 2 : 3;
        for (let i = 0; i < spawnCount; i++) {
            game.addEntity(new Enemy(this.x + rand(-50, 50), this.y + rand(-50, 50)));
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const mainColor = '#1a1a1a';
        const accentColor = '#8a2be2';
        ctx.save();
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 40;
        ctx.fillStyle = mainColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.spiralAngle * 0.5);
        ctx.strokeStyle = `rgba(138, 43, 226, 0.5)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.width*0.6, 0);
        ctx.lineTo(this.width*0.6, 0);
        ctx.moveTo(0, -this.height*0.6);
        ctx.lineTo(0, this.height*0.6);
        ctx.stroke();
        
        ctx.restore();
    }
}
