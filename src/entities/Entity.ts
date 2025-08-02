import type { Game } from '../game';
import type { EntityType } from '../types';

/**
 * The base class for all objects in the game.
 */
export class Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    vx = 0;
    vy = 0;
    health = 1;
    maxHealth = 1;
    shouldBeRemoved = false;
    type: EntityType;
    invincible = false;

    constructor(x: number, y: number, width: number, height: number, type: EntityType) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    update(dt: number, ...args: any[]) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx: CanvasRenderingContext2D, game?: Game) {
        // To be implemented by subclasses
    }
}
