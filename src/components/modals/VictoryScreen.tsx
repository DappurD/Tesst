import React from 'react';
import { useStore } from '../../store';

export const VictoryScreen = () => {
    const { returnToHub } = useStore(state => state.actions);
    
    return (
        <div id="victory-screen" className="screen">
            <h1>DIMENSIONS CONQUERED</h1>
            <p>You have tamed the chaos. For now.</p>
            <button id="restart-button-victory" aria-label="Return to Hub" onClick={returnToHub}>
                Return to Hub
            </button>
        </div>
    );
};
