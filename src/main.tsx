
import React from 'react';
import { createRoot } from 'react-dom/client';
import { UI } from './components/UI';
import { Game } from './game';
import { useStore } from './store';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config';

const gameContainer = document.getElementById('game-container')!;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// Set canvas dimensions
gameContainer.style.width = `${CANVAS_WIDTH}px`;
gameContainer.style.height = `${CANVAS_HEIGHT}px`;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Zustand store actions
const { setGame, setState } = useStore.getState().actions;

// Initialize the game engine
const game = new Game(canvas, setState);
setGame(game); // Set the game instance in the store

// Start the game loop
game.start();

// Render the React UI
const root = createRoot(document.getElementById('react-root')!);
root.render(<UI />);
