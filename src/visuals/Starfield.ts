import { rand } from '../utils/math';

interface Star {
    x: number;
    y: number;
    z: number; // For parallax effect
}

export class Starfield {
    private stars: Star[] = [];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(starCount: number, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: rand(0, this.canvas.width),
                y: rand(0, this.canvas.height),
                z: rand(0.5, 3), // Closer stars have a higher z value
            });
        }
    }

    update(dt: number, playerVelocity: { vx: number, vy: number }) {
        const baseSpeed = 0.5;
        this.stars.forEach(star => {
            // Move stars based on player velocity for a parallax effect
            star.x -= (playerVelocity.vx * dt * 0.05 * star.z * baseSpeed);
            star.y -= (playerVelocity.vy * dt * 0.05 * star.z * baseSpeed);

            // Wrap stars around the screen
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#0a001a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => {
            const size = star.z;
            const alpha = star.z / 3;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}
