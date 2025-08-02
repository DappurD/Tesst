


import { Entity } from '../Entity';
import { FloatingText } from '../effects/FloatingText';
import { rand } from '../../utils';
import type { Game } from '../../game';
import type { Player } from '../Player';

export abstract class Boss extends Entity {
    name: string;
    isTransitioning = false;
    transitionTimer = 0;
    shardValue: number;
    taunts: string[] = [];
    tauntCooldown: number;

    constructor(x: number, y: number, width: number, height: number, name: string, shardValue: number) {
        super(x, y, width, height, 'boss');
        this.name = name;
        this.shardValue = shardValue;
        this.tauntCooldown = rand(3, 5);
    }
    
    handleTransition(dt: number): boolean {
        if (this.isTransitioning) {
            this.transitionTimer -= dt;
            if (this.transitionTimer <= 0) {
                this.isTransitioning = false;
                this.invincible = false;
            }
            return true;
        }
        return false;
    }

    handleTaunts(dt: number, game: Game) {
        this.tauntCooldown -= dt;
        if (this.tauntCooldown <= 0 && this.taunts.length > 0) {
            const taunt = this.taunts[Math.floor(Math.random() * this.taunts.length)];
            game.addEntity(new FloatingText(this.x + this.width / 2, this.y - 20, taunt, '#ff4141', 22));
            this.tauntCooldown = rand(10, 15);
        }
    }
    
    protected move(dt: number) {
        // This calls Entity.update()
        super.update(dt);
    }
    
    abstract update(dt: number, player: Player, game: Game): void;
}
