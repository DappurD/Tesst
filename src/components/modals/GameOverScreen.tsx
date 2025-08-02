import React from 'react';
import { useStore } from '../../store';

export const GameOverScreen = () => {
    const { returnToHub } = useStore(state => state.actions);

    return (
        <div id="game-over-screen" className="screen">
            <h1>REALITY COLLAPSED</h1>
            <p>The void consumes you.</p>
            <button id="restart-button-gameover" aria-label="Return to Hub" onClick={returnToHub}>
                Return to Hub
            </button>
        </div>
    );
};
