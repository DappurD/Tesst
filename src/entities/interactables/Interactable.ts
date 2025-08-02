
import { Entity } from '../Entity';
import type { Game } from '../../game';

export class Interactable extends Entity {
    interactionRadius: number;
    promptText: string;
    onInteract: (game: Game) => void;
    isHighlighted = false;

    constructor(x: number, y: number, width: number, height: number, prompt: string, onInteract: (game: Game) => void) {
        super(x, y, width, height, 'interactable');
        this.interactionRadius = 100;
        this.promptText = prompt;
        this.onInteract = onInteract;
        this.invincible = true;
    }

    update(dt: number, game: Game) {}
    
    draw(ctx: CanvasRenderingContext2D) {}
}
