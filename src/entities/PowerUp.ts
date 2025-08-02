import { Entity } from './Entity';
import { PowerUpType } from '../types';
import { rand } from '../utils';

export class PowerUp extends Entity {
    powerUpType: PowerUpType;
    bobTimer: number;

    constructor(x: number, y: number, type: PowerUpType) {
        super(x, y, 30, 30, 'powerup');
        this.powerUpType = type;
        this.bobTimer = rand(0, Math.PI * 2);
    }

    update(dt: number) {
        this.bobTimer += dt * 3;
        this.y += Math.sin(this.bobTimer) * 0.5;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const time = performance.now() / 500;
        
        ctx.save();
        
        ctx.globalAlpha = 0.7 + Math.sin(time * 2) * 0.2;
        
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;

        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let letter = '';
        switch(this.powerUpType) {
            case 'QuadShot': letter = 'Q'; break;
            case 'RapidFire': letter = 'R'; break;
            case 'Shield': letter = 'S'; break;
        }
        ctx.fillText(letter, centerX, centerY);
        ctx.restore();
    }
}
